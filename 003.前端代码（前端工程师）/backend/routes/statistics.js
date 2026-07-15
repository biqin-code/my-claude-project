/**
 * 统计路由 - 处理统计报表相关数据
 */

const express = require('express');
const router = express.Router();

// =====================================================
// 辅助函数：验证用户Token
// =====================================================
async function verifyUser(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: '未授权，请先登录', status: 401 };
  }

  const token = authHeader.substring(7);
  const db = req.app.get('db');

  try {
    const now = new Date();
    const nowStr = now.toISOString().slice(0, 19).replace('T', ' ');
    const [sessions] = await db.query(
      'SELECT user_id FROM login_sessions WHERE token = ? AND expiry_date > ?',
      [token, nowStr]
    );

    if (sessions.length === 0) {
      return { error: 'Token已过期，请重新登录', status: 401 };
    }

    return { userId: sessions[0].user_id, db };
  } catch (error) {
    return { error: '验证失败', status: 500 };
  }
}

// =====================================================
// GET /api/statistics/monthly - 获取月度统计
// =====================================================
router.get('/monthly', async (req, res) => {
  const auth = await verifyUser(req);
  if (auth.error) {
    return res.status(auth.status).json({ code: auth.status, message: auth.error });
  }

  const { userId, db } = auth;

  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const today = now.toISOString().slice(0, 10);

    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 10);
    const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().slice(0, 10);

    // 本月总支出
    const [monthResult] = await db.query(`
      SELECT COALESCE(SUM(ABS(amount)), 0) as total
      FROM transactions
      WHERE user_id = ? AND type = 'expense' AND transaction_date >= ? AND transaction_date <= ?
    `, [userId, firstDayOfMonth, today]);

    const monthTotal = parseFloat(monthResult[0].total) || 0;

    // 本月记账天数
    const [daysResult] = await db.query(`
      SELECT COUNT(DISTINCT transaction_date) as days
      FROM transactions
      WHERE user_id = ? AND type = 'expense' AND transaction_date >= ? AND transaction_date <= ?
    `, [userId, firstDayOfMonth, today]);

    const recordDays = parseInt(daysResult[0].days) || 1;
    const dailyAverage = monthTotal / recordDays;

    // 上月总支出
    const [lastMonthResult] = await db.query(`
      SELECT COALESCE(SUM(ABS(amount)), 0) as total
      FROM transactions
      WHERE user_id = ? AND type = 'expense' AND transaction_date >= ? AND transaction_date <= ?
    `, [userId, firstDayOfLastMonth, lastDayOfLastMonth]);

    const lastMonthTotal = parseFloat(lastMonthResult[0].total) || 0;

    // 计算环比变化
    let monthChange = 0;
    let monthChangeType = 'same';
    if (lastMonthTotal > 0) {
      monthChange = Math.round(((monthTotal - lastMonthTotal) / lastMonthTotal * 100));
      monthChangeType = monthChange > 0 ? 'up' : monthChange < 0 ? 'down' : 'same';
    }

    res.json({
      code: 200,
      data: {
        monthTotal,
        recordDays,
        dailyAverage: Math.round(dailyAverage * 100) / 100,
        lastMonthTotal,
        monthChange: Math.abs(monthChange),
        monthChangeType
      }
    });

  } catch (error) {
    console.error('获取月度统计错误:', error);
    res.status(500).json({ code: 500, message: '获取数据失败' });
  }
});

// =====================================================
// GET /api/statistics/category-distribution - 获取分类分布
// =====================================================
router.get('/category-distribution', async (req, res) => {
  const auth = await verifyUser(req);
  if (auth.error) {
    return res.status(auth.status).json({ code: auth.status, message: auth.error });
  }

  const { userId, db } = auth;

  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const today = now.toISOString().slice(0, 10);

    const [categoryStats] = await db.query(`
      SELECT
        c.id,
        c.name,
        c.icon,
        c.color,
        COALESCE(SUM(ABS(t.amount)), 0) as total
      FROM categories c
      LEFT JOIN transactions t ON c.id = t.category_id
        AND t.user_id = ?
        AND t.type = 'expense'
        AND t.transaction_date >= ?
        AND t.transaction_date <= ?
      WHERE c.type = 'expense'
      GROUP BY c.id, c.name, c.icon, c.color
      HAVING total > 0
      ORDER BY total DESC
    `, [userId, firstDayOfMonth, today]);

    const grandTotal = categoryStats.reduce((sum, cat) => sum + parseFloat(cat.total), 0);

    const categories = categoryStats.map(cat => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      amount: parseFloat(cat.total),
      percentage: grandTotal > 0 ? Math.round(parseFloat(cat.total) / grandTotal * 100) : 0
    }));

    res.json({
      code: 200,
      data: {
        categories,
        total: grandTotal
      }
    });

  } catch (error) {
    console.error('获取分类分布错误:', error);
    res.status(500).json({ code: 500, message: '获取数据失败' });
  }
});

// =====================================================
// GET /api/statistics/weekly-trend - 获取7天趋势
// =====================================================
router.get('/weekly-trend', async (req, res) => {
  const auth = await verifyUser(req);
  if (auth.error) {
    return res.status(auth.status).json({ code: auth.status, message: auth.error });
  }

  const { userId, db } = auth;

  try {
    const now = new Date();
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const startDate = sevenDaysAgo.toISOString().slice(0, 10);
    const endDate = now.toISOString().slice(0, 10);

    const [dailyStats] = await db.query(`
      SELECT
        DATE(transaction_date) as trans_date,
        COALESCE(SUM(ABS(amount)), 0) as total
      FROM transactions
      WHERE user_id = ?
        AND type = 'expense'
        AND transaction_date >= ?
        AND transaction_date <= ?
      GROUP BY DATE(transaction_date)
      ORDER BY trans_date ASC
    `, [userId, startDate, endDate]);

    const trendData = [];
    let maxAmount = 0;

    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().slice(0, 10);
      const dayOfWeek = date.getDay();

      const found = dailyStats.find(s => s.trans_date.toISOString().slice(0, 10) === dateStr);
      const amount = found ? parseFloat(found.total) : 0;

      if (amount > maxAmount) maxAmount = amount;

      trendData.push({
        date: dateStr,
        dayName: weekDays[dayOfWeek],
        amount
      });
    }

    const trend = trendData.map(day => ({
      ...day,
      heightPercent: maxAmount > 0 ? Math.round(day.amount / maxAmount * 100) : 0
    }));

    res.json({
      code: 200,
      data: trend
    });

  } catch (error) {
    console.error('获取7天趋势错误:', error);
    res.status(500).json({ code: 500, message: '获取数据失败' });
  }
});

// =====================================================
// GET /api/statistics/yearly-trend - 获取12个月趋势
// =====================================================
router.get('/yearly-trend', async (req, res) => {
  const auth = await verifyUser(req);
  if (auth.error) {
    return res.status(auth.status).json({ code: auth.status, message: auth.error });
  }

  const { userId, db } = auth;

  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

    // 获取2026年1月到12月的每月收支统计
    const [monthlyStats] = await db.query(`
      SELECT
        DATE_FORMAT(transaction_date, '%Y-%m') as month,
        type,
        COALESCE(SUM(ABS(amount)), 0) as total
      FROM transactions
      WHERE user_id = ?
        AND transaction_date >= '2026-01-01'
        AND transaction_date <= '2026-12-31'
      GROUP BY DATE_FORMAT(transaction_date, '%Y-%m'), type
      ORDER BY month ASC
    `, [userId]);

    // 构建2026年12个月的数据
    const trendData = [];

    for (let month = 1; month <= 12; month++) {
      const monthStr = `2026-${String(month).padStart(2, '0')}`;

      // 找到该月的支出和收入
      const expenseItem = monthlyStats.find(s => s.month === monthStr && s.type === 'expense');
      const incomeItem = monthlyStats.find(s => s.month === monthStr && s.type === 'income');

      const expense = expenseItem ? parseFloat(expenseItem.total) : 0;
      const income = incomeItem ? parseFloat(incomeItem.total) : 0;

      trendData.push({
        month: monthStr,
        monthName: monthNames[month - 1],
        expense,
        income
      });
    }

    // 计算最大值用于图表显示
    const maxExpense = Math.max(...trendData.map(d => d.expense), 1);
    const maxIncome = Math.max(...trendData.map(d => d.income), 1);
    const maxValue = Math.max(maxExpense, maxIncome);

    // 计算每个点的显示高度百分比
    const trend = trendData.map(d => ({
      ...d,
      expenseHeight: Math.round((d.expense / maxValue) * 100) || 0,
      incomeHeight: Math.round((d.income / maxValue) * 100) || 0
    }));

    res.json({
      code: 200,
      data: trend
    });

  } catch (error) {
    console.error('获取12个月趋势错误:', error);
    res.status(500).json({ code: 500, message: '获取数据失败' });
  }
});

module.exports = router;
