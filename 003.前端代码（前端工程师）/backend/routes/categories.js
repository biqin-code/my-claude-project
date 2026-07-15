/**
 * 分类路由 - 处理分类的增删操作
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
// GET /api/categories - 获取所有分类（包含用户自定义分类）
// =====================================================
router.get('/', async (req, res) => {
  const auth = await verifyUser(req);
  if (auth.error) {
    return res.status(auth.status).json({ code: auth.status, message: auth.error });
  }

  const { userId, db } = auth;
  const { type } = req.query;

  try {
    let query = 'SELECT id, type, name, icon, color, is_system, user_id FROM categories WHERE (is_system = 1 OR user_id = ?)';
    let params = [userId];

    if (type && ['expense', 'income'].includes(type)) {
      query += ' AND type = ?';
      params.push(type);
    }

    query += ' ORDER BY is_system DESC, sort_order ASC, id ASC';

    const [categories] = await db.query(query, params);

    const formattedCategories = categories.map(cat => ({
      id: cat.id,
      type: cat.type,
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      isSystem: cat.is_system === 1,
      isCustom: cat.user_id !== null
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

// =====================================================
// POST /api/categories - 添加自定义分类
// =====================================================
router.post('/', async (req, res) => {
  const auth = await verifyUser(req);
  if (auth.error) {
    return res.status(auth.status).json({ code: auth.status, message: auth.error });
  }

  const { userId, db } = auth;
  const { type, name, icon, color } = req.body;

  // 参数验证
  if (!type || !['expense', 'income'].includes(type)) {
    return res.status(400).json({ code: 400, message: '无效的分类类型' });
  }

  if (!name || name.trim().length === 0) {
    return res.status(400).json({ code: 400, message: '分类名称不能为空' });
  }

  if (name.length > 20) {
    return res.status(400).json({ code: 400, message: '分类名称不能超过20字符' });
  }

  if (!icon) {
    return res.status(400).json({ code: 400, message: '请选择分类图标' });
  }

  if (!color) {
    return res.status(400).json({ code: 400, message: '请选择分类颜色' });
  }

  try {
    // 检查是否已存在同名分类（系统分类或用户自定义）
    const [existing] = await db.query(
      'SELECT id FROM categories WHERE name = ? AND type = ? AND (is_system = 1 OR user_id = ?)',
      [name.trim(), type, userId]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        code: 400,
        message: '该分类已存在'
      });
    }

    // 获取最大排序号
    const [maxOrder] = await db.query(
      'SELECT COALESCE(MAX(sort_order), 0) + 1 as next_order FROM categories WHERE type = ?',
      [type]
    );

    // 插入新分类
    const [result] = await db.query(
      'INSERT INTO categories (type, name, icon, color, is_system, user_id, sort_order) VALUES (?, ?, ?, ?, 0, ?, ?)',
      [type, name.trim(), icon, color, userId, maxOrder[0].next_order]
    );

    res.json({
      code: 200,
      message: '分类添加成功',
      data: {
        id: result.insertId,
        type,
        name: name.trim(),
        icon,
        color,
        isSystem: false,
        isCustom: true
      }
    });

  } catch (error) {
    console.error('添加分类错误:', error);
    res.status(500).json({ code: 500, message: '添加分类失败' });
  }
});

// =====================================================
// DELETE /api/categories/:id - 删除自定义分类
// =====================================================
router.delete('/:id', async (req, res) => {
  const auth = await verifyUser(req);
  if (auth.error) {
    return res.status(auth.status).json({ code: auth.status, message: auth.error });
  }

  const { userId, db } = auth;
  const categoryId = parseInt(req.params.id);

  if (!categoryId || isNaN(categoryId)) {
    return res.status(400).json({ code: 400, message: '无效的分类ID' });
  }

  try {
    // 检查分类是否存在
    const [categories] = await db.query(
      'SELECT id, is_system, user_id FROM categories WHERE id = ?',
      [categoryId]
    );

    if (categories.length === 0) {
      return res.status(404).json({ code: 404, message: '分类不存在' });
    }

    const category = categories[0];

    // 检查是否是系统分类
    if (category.is_system === 1) {
      return res.status(400).json({
        code: 400,
        message: '系统分类不能删除'
      });
    }

    // 检查是否是当前用户的分类
    if (category.user_id !== userId) {
      return res.status(403).json({
        code: 403,
        message: '无权删除此分类'
      });
    }

    // 检查是否有交易记录使用此分类
    const [transactions] = await db.query(
      'SELECT id FROM transactions WHERE category_id = ? LIMIT 1',
      [categoryId]
    );

    if (transactions.length > 0) {
      return res.status(400).json({
        code: 400,
        message: '该分类下有交易记录，无法删除'
      });
    }

    // 删除分类
    await db.query('DELETE FROM categories WHERE id = ?', [categoryId]);

    res.json({
      code: 200,
      message: '分类删除成功'
    });

  } catch (error) {
    console.error('删除分类错误:', error);
    res.status(500).json({ code: 500, message: '删除分类失败' });
  }
});

module.exports = router;
