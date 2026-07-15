/**
 * 交易记录路由 - 处理收支记录相关操作
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
    const [sessions] = await db.query(
      'SELECT user_id FROM login_sessions WHERE token = ? AND expiry_date > NOW()',
      [token]
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
// GET /api/transactions/today-summary - 获取今日支出汇总
// =====================================================
router.get('/today-summary', async (req, res) => {
  const auth = await verifyUser(req);
  if (auth.error) {
    return res.status(auth.status).json({ code: auth.status, message: auth.error });
  }

  const { userId, db } = auth;

  try {
    // 获取今日支出总额（使用 ABS 取绝对值）
    const [expenseResult] = await db.query(`
      SELECT COALESCE(SUM(ABS(amount)), 0) as total
      FROM transactions
      WHERE user_id = ?
        AND type = 'expense'
        AND transaction_date = CURDATE()
    `, [userId]);

    // 获取今日各类别支出统计（按占比倒序，使用 ABS 取绝对值）
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
        AND t.transaction_date = CURDATE()
      WHERE c.type = 'expense'
      GROUP BY c.id, c.name, c.icon, c.color
      HAVING total > 0
      ORDER BY total DESC
    `, [userId]);

    const total = parseFloat(expenseResult[0].total);
    const categories = categoryStats.map(cat => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      amount: parseFloat(cat.total),
      percentage: total > 0 ? Math.round((parseFloat(cat.total) / total) * 100) : 0
    }));

    // 计算前三类占比
    const top3Total = categories.slice(0, 3).reduce((sum, cat) => sum + cat.percentage, 0);

    res.json({
      code: 200,
      data: {
        total,
        date: new Date().toISOString().split('T')[0],
        categories,
        top3Percentage: top3Total
      }
    });

  } catch (error) {
    console.error('获取今日汇总错误:', error);
    res.status(500).json({ code: 500, message: '获取数据失败' });
  }
});

// =====================================================
// GET /api/transactions/recent - 获取最近记录（默认5条）
// =====================================================
router.get('/recent', async (req, res) => {
  const auth = await verifyUser(req);
  if (auth.error) {
    return res.status(auth.status).json({ code: auth.status, message: auth.error });
  }

  const { userId, db } = auth;
  const limit = parseInt(req.query.limit) || 5;

  try {
    const [records] = await db.query(`
      SELECT
        t.id,
        t.type,
        t.amount,
        t.note,
        t.payment_method,
        t.transaction_date,
        t.created_at,
        c.name as category_name,
        c.icon as category_icon,
        c.color as category_color
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = ?
      ORDER BY t.transaction_date DESC, t.created_at DESC
      LIMIT ?
    `, [userId, limit]);

    const formattedRecords = records.map(record => ({
      id: record.id,
      type: record.type,
      amount: parseFloat(record.amount),
      note: record.note,
      paymentMethod: record.payment_method,
      transactionDate: record.transaction_date,
      createdAt: record.created_at,
      category: {
        name: record.category_name,
        icon: record.category_icon,
        color: record.category_color
      }
    }));

    res.json({
      code: 200,
      data: formattedRecords
    });

  } catch (error) {
    console.error('获取最近记录错误:', error);
    res.status(500).json({ code: 500, message: '获取数据失败' });
  }
});

// =====================================================
// GET /api/transactions - 分页获取所有记录（支持筛选）
// =====================================================
router.get('/', async (req, res) => {
  const auth = await verifyUser(req);
  if (auth.error) {
    return res.status(auth.status).json({ code: auth.status, message: auth.error });
  }

  const { userId, db } = auth;
  const page = parseInt(req.query.page) || 1;
  const pageSize = 10;
  const offset = (page - 1) * pageSize;

  // 筛选参数
  const { type, categoryId, startDate, endDate, keyword } = req.query;

  try {
    // 构建 WHERE 条件
    let whereClause = 'WHERE t.user_id = ?';
    let params = [userId];

    if (type && ['expense', 'income'].includes(type)) {
      whereClause += ' AND t.type = ?';
      params.push(type);
    }

    if (categoryId) {
      whereClause += ' AND t.category_id = ?';
      params.push(parseInt(categoryId));
    }

    if (startDate) {
      whereClause += ' AND t.transaction_date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      whereClause += ' AND t.transaction_date <= ?';
      params.push(endDate);
    }

    if (keyword) {
      whereClause += ' AND t.note LIKE ?';
      params.push(`%${keyword}%`);
    }

    // 获取总记录数
    const [countResult] = await db.query(`
      SELECT COUNT(*) as total FROM transactions t ${whereClause}
    `, params);
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / pageSize);

    // 获取当前页记录
    const [records] = await db.query(`
      SELECT
        t.id,
        t.type,
        t.amount,
        t.note,
        t.payment_method,
        t.transaction_date,
        t.created_at,
        c.id as category_id,
        c.name as category_name,
        c.icon as category_icon,
        c.color as category_color
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      ${whereClause}
      ORDER BY t.transaction_date DESC, t.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, pageSize, offset]);

    const formattedRecords = records.map(record => ({
      id: record.id,
      type: record.type,
      amount: parseFloat(record.amount),
      note: record.note,
      paymentMethod: record.payment_method,
      transactionDate: record.transaction_date,
      createdAt: record.created_at,
      category: {
        id: record.category_id,
        name: record.category_name,
        icon: record.category_icon,
        color: record.category_color
      }
    }));

    res.json({
      code: 200,
      data: {
        records: formattedRecords,
        pagination: {
          currentPage: page,
          totalPages,
          total,
          pageSize
        }
      }
    });

  } catch (error) {
    console.error('获取记录列表错误:', error);
    res.status(500).json({ code: 500, message: '获取数据失败' });
  }
});

// =====================================================
// POST /api/transactions - 添加新记录
// =====================================================
router.post('/', async (req, res) => {
  const auth = await verifyUser(req);
  if (auth.error) {
    return res.status(auth.status).json({ code: auth.status, message: auth.error });
  }

  const { userId, db } = auth;
  const { type, categoryId, amount, note, paymentMethod } = req.body;

  // 参数验证
  if (!type || !['expense', 'income'].includes(type)) {
    return res.status(400).json({ code: 400, message: '无效的交易类型' });
  }

  if (!categoryId) {
    return res.status(400).json({ code: 400, message: '请选择分类' });
  }

  if (!amount || amount <= 0) {
    return res.status(400).json({ code: 400, message: '请输入有效金额' });
  }

  try {
    // 验证分类是否存在
    const [categories] = await db.query(
      'SELECT id FROM categories WHERE id = ? AND type = ?',
      [categoryId, type]
    );

    if (categories.length === 0) {
      return res.status(400).json({ code: 400, message: '分类不存在' });
    }

    // 插入记录 - 使用前端传递的时间（系统本地时间）
    const finalAmount = type === 'expense' ? -Math.abs(amount) : Math.abs(amount);
    const now = new Date();
    const transactionDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const createdAt = `${transactionDate} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const [result] = await db.query(`
      INSERT INTO transactions (user_id, type, amount, category_id, note, payment_method, transaction_date, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [userId, type, finalAmount, categoryId, note || '', paymentMethod || '', transactionDate, createdAt]);

    res.json({
      code: 200,
      message: '记录添加成功',
      data: {
        id: result.insertId,
        type,
        amount: finalAmount,
        categoryId,
        note,
        paymentMethod
      }
    });

  } catch (error) {
    console.error('添加记录错误:', error);
    res.status(500).json({ code: 500, message: '添加记录失败' });
  }
});

// =====================================================
// GET /api/transactions/categories - 获取所有分类
// =====================================================
router.get('/categories', async (req, res) => {
  const auth = await verifyUser(req);
  if (auth.error) {
    return res.status(auth.status).json({ code: auth.status, message: auth.error });
  }

  const { db } = auth;
  const type = req.query.type;

  try {
    let query = 'SELECT id, type, name, icon, color FROM categories WHERE is_system = 1';
    let params = [];

    if (type && ['expense', 'income'].includes(type)) {
      query += ' AND type = ?';
      params.push(type);
    }

    query += ' ORDER BY sort_order ASC';

    const [categories] = await db.query(query, params);

    const formattedCategories = categories.map(cat => ({
      id: cat.id,
      type: cat.type,
      name: cat.name,
      icon: cat.icon,
      color: cat.color
    }));

    res.json({
      code: 200,
      data: formattedCategories
    });

  } catch (error) {
    console.error('获取分类错误:', error);
    res.status(500).json({ code: 500, message: '获取分类失败' });
  }
});

module.exports = router;
