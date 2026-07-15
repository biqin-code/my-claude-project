/**
 * 预算管理路由 - 处理预算相关操作
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
// GET /api/budgets - 获取指定月份的预算列表
// =====================================================
router.get('/', async (req, res) => {
  const auth = await verifyUser(req);
  if (auth.error) {
    return res.status(auth.status).json({ code: auth.status, message: auth.error });
  }

  const { userId, db } = auth;
  const { month } = req.query; // 格式：YYYY-MM

  if (!month) {
    return res.status(400).json({ code: 400, message: '请指定月份' });
  }

  try {
    // 获取用户的预算列表 (注意：数据库表使用 amount 和 month 字段)
    const [budgets] = await db.query(`
      SELECT
        b.id,
        b.category_id,
        b.amount as budget_amount,
        b.created_at,
        b.updated_at,
        c.name as category_name,
        c.icon as category_icon,
        c.color as category_color,
        c.type as category_type
      FROM budgets b
      JOIN categories c ON b.category_id = c.id
      WHERE b.user_id = ? AND DATE_FORMAT(b.month, '%Y-%m') = ?
      ORDER BY c.sort_order ASC
    `, [userId, month]);

    // 获取该月的支出统计
    const [spending] = await db.query(`
      SELECT
        category_id,
        SUM(ABS(amount)) as total_spent
      FROM transactions
      WHERE user_id = ?
        AND type = 'expense'
        AND DATE_FORMAT(transaction_date, '%Y-%m') = ?
      GROUP BY category_id
    `, [userId, month]);

    // 构建支出映射
    const spendingMap = {};
    spending.forEach(s => {
      spendingMap[s.category_id] = parseFloat(s.total_spent);
    });

    // 格式化预算数据
    const formattedBudgets = budgets.map(budget => {
      const spent = spendingMap[budget.category_id] || 0;
      const budgetAmount = parseFloat(budget.budget_amount);
      const remaining = budgetAmount - spent;
      const percentage = budgetAmount > 0 ? Math.min((spent / budgetAmount) * 100, 100) : 0;
      const isOverBudget = spent > budgetAmount;

      return {
        id: budget.id,
        categoryId: budget.category_id,
        categoryName: budget.category_name,
        categoryIcon: budget.category_icon,
        categoryColor: budget.category_color,
        categoryType: budget.category_type,
        budgetAmount,
        spent,
        remaining,
        percentage,
        isOverBudget,
        createdAt: budget.created_at,
        updatedAt: budget.updated_at
      };
    });

    // 计算汇总
    const totalBudget = formattedBudgets.reduce((sum, b) => sum + b.budgetAmount, 0);
    const totalSpent = formattedBudgets.reduce((sum, b) => sum + b.spent, 0);
    const totalRemaining = totalBudget - totalSpent;
    const overBudgetCount = formattedBudgets.filter(b => b.isOverBudget).length;
    const overBudgetAmount = formattedBudgets
      .filter(b => b.isOverBudget)
      .reduce((sum, b) => sum + Math.abs(b.remaining), 0);

    res.json({
      code: 200,
      data: {
        budgets: formattedBudgets,
        summary: {
          totalBudget,
          totalSpent,
          totalRemaining,
          overBudgetCount,
          overBudgetAmount,
          usagePercentage: totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0
        }
      }
    });

  } catch (error) {
    console.error('获取预算列表错误:', error);
    res.status(500).json({ code: 500, message: '获取预算数据失败' });
  }
});

// =====================================================
// POST /api/budgets - 添加或更新预算
// =====================================================
router.post('/', async (req, res) => {
  const auth = await verifyUser(req);
  if (auth.error) {
    return res.status(auth.status).json({ code: auth.status, message: auth.error });
  }

  const { userId, db } = auth;
  const { categoryId, budgetAmount, budgetMonth } = req.body;

  // 参数验证
  if (!categoryId) {
    return res.status(400).json({ code: 400, message: '请选择分类' });
  }

  if (!budgetAmount || budgetAmount <= 0) {
    return res.status(400).json({ code: 400, message: '请输入有效的预算金额' });
  }

  if (!budgetMonth) {
    return res.status(400).json({ code: 400, message: '请指定月份' });
  }

  try {
    // 验证分类是否存在
    const [categories] = await db.query(
      'SELECT id FROM categories WHERE id = ? AND type = ?',
      [categoryId, 'expense']
    );

    if (categories.length === 0) {
      return res.status(400).json({ code: 400, message: '分类不存在' });
    }

    // 将 YYYY-MM 转换为 date 类型 (月份第一天)
    const monthDate = `${budgetMonth}-01`;

    // 检查是否已存在该分类在该月的预算
    const [existing] = await db.query(`
      SELECT id FROM budgets WHERE user_id = ? AND category_id = ? AND month = ?
    `, [userId, categoryId, monthDate]);

    if (existing.length > 0) {
      // 更新
      await db.query(`
        UPDATE budgets SET amount = ?, updated_at = NOW() WHERE id = ?
      `, [budgetAmount, existing[0].id]);

      res.json({
        code: 200,
        message: '预算更新成功',
        data: { id: existing[0].id }
      });
    } else {
      // 新增
      const [result] = await db.query(`
        INSERT INTO budgets (user_id, category_id, amount, month, created_at, updated_at)
        VALUES (?, ?, ?, ?, NOW(), NOW())
      `, [userId, categoryId, budgetAmount, monthDate]);

      res.json({
        code: 200,
        message: '预算添加成功',
        data: { id: result.insertId }
      });
    }

  } catch (error) {
    console.error('保存预算错误:', error);
    res.status(500).json({ code: 500, message: '保存预算失败' });
  }
});

// =====================================================
// DELETE /api/budgets - 删除预算
// =====================================================
router.delete('/:id', async (req, res) => {
  const auth = await verifyUser(req);
  if (auth.error) {
    return res.status(auth.status).json({ code: auth.status, message: auth.error });
  }

  const { userId, db } = auth;
  const budgetId = parseInt(req.params.id);

  if (!budgetId) {
    return res.status(400).json({ code: 400, message: '无效的预算ID' });
  }

  try {
    // 验证预算是否存在且属于当前用户
    const [budgets] = await db.query(
      'SELECT id FROM budgets WHERE id = ? AND user_id = ?',
      [budgetId, userId]
    );

    if (budgets.length === 0) {
      return res.status(404).json({ code: 404, message: '预算不存在' });
    }

    // 删除
    await db.query('DELETE FROM budgets WHERE id = ?', [budgetId]);

    res.json({
      code: 200,
      message: '预算删除成功'
    });

  } catch (error) {
    console.error('删除预算错误:', error);
    res.status(500).json({ code: 500, message: '删除预算失败' });
  }
});

// =====================================================
// GET /api/budgets/category-spending - 获取指定月份各类别支出
// =====================================================
router.get('/category-spending', async (req, res) => {
  const auth = await verifyUser(req);
  if (auth.error) {
    return res.status(auth.status).json({ code: auth.status, message: auth.error });
  }

  const { userId, db } = auth;
  const { month } = req.query;

  if (!month) {
    return res.status(400).json({ code: 400, message: '请指定月份' });
  }

  try {
    // 获取该月各类别支出统计
    const [spending] = await db.query(`
      SELECT
        t.category_id,
        c.name as category_name,
        c.icon as category_icon,
        c.color as category_color,
        SUM(ABS(t.amount)) as total_spent
      FROM transactions t
      JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = ?
        AND t.type = 'expense'
        AND DATE_FORMAT(t.transaction_date, '%Y-%m') = ?
      GROUP BY t.category_id, c.name, c.icon, c.color
    `, [userId, month]);

    const spendingMap = {};
    spending.forEach(s => {
      spendingMap[s.category_id] = {
        categoryName: s.category_name,
        categoryIcon: s.category_icon,
        categoryColor: s.category_color,
        spent: parseFloat(s.total_spent)
      };
    });

    res.json({
      code: 200,
      data: spendingMap
    });

  } catch (error) {
    console.error('获取分类支出错误:', error);
    res.status(500).json({ code: 500, message: '获取分类支出失败' });
  }
});

// =====================================================
// GET /api/budgets/categories - 获取可设置预算的分类
// =====================================================
router.get('/categories', async (req, res) => {
  const auth = await verifyUser(req);
  if (auth.error) {
    return res.status(auth.status).json({ code: auth.status, message: auth.error });
  }

  const { db } = auth;

  try {
    const [categories] = await db.query(`
      SELECT id, name, icon, color, type
      FROM categories
      WHERE type = 'expense' AND is_system = 1
      ORDER BY sort_order ASC
    `);

    res.json({
      code: 200,
      data: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        type: cat.type
      }))
    });

  } catch (error) {
    console.error('获取分类错误:', error);
    res.status(500).json({ code: 500, message: '获取分类失败' });
  }
});

module.exports = router;
