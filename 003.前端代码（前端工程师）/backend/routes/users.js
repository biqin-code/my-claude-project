/**
 * 用户路由 - 处理登录、注册、登出
 */

const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

// 密码 SHA256 加密
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// 生成随机Token
function generateToken() {
  return uuidv4();
}

// =====================================================
// POST /api/users/register - 用户注册
// =====================================================
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const db = req.app.get('db');

  // 参数验证
  if (!username || !password) {
    return res.status(400).json({
      code: 400,
      message: '用户名和密码不能为空'
    });
  }

  if (!/^[a-zA-Z0-9]{4,20}$/.test(username)) {
    return res.status(400).json({
      code: 400,
      message: '用户名需为4-20位字母或数字'
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      code: 400,
      message: '密码需6位以上'
    });
  }

  try {
    // 检查用户名是否已存在
    const [existing] = await db.query(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        code: 400,
        message: '用户名已存在'
      });
    }

    // 创建用户
    const hashedPassword = hashPassword(password);
    const [result] = await db.query(
      'INSERT INTO users (username, password) VALUES (?, ?)',
      [username, hashedPassword]
    );

    res.json({
      code: 200,
      message: '注册成功',
      data: {
        userId: result.insertId,
        username: username
      }
    });

  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({
      code: 500,
      message: '注册失败，请稍后重试'
    });
  }
});

// =====================================================
// POST /api/users/login - 用户登录
// =====================================================
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const db = req.app.get('db');

  // 参数验证
  if (!username || !password) {
    return res.status(400).json({
      code: 400,
      message: '用户名和密码不能为空'
    });
  }

  try {
    // 查找用户
    const hashedPassword = hashPassword(password);
    const [users] = await db.query(
      'SELECT id, username FROM users WHERE username = ? AND password = ?',
      [username, hashedPassword]
    );

    if (users.length === 0) {
      return res.status(401).json({
        code: 401,
        message: '用户名或密码错误'
      });
    }

    const user = users[0];

    // 删除旧会话
    await db.query(
      'DELETE FROM login_sessions WHERE user_id = ?',
      [user.id]
    );

    // 创建新会话 (7天有效期)
    const token = generateToken();
    const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await db.query(
      'INSERT INTO login_sessions (user_id, token, expiry_date) VALUES (?, ?, ?)',
      [user.id, token, expiryDate]
    );

    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token: token,
        userId: user.id,
        username: user.username,
        expiresIn: 604800 // 7天秒数
      }
    });

  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      code: 500,
      message: '登录失败，请稍后重试'
    });
  }
});

// =====================================================
// POST /api/users/logout - 用户登出
// =====================================================
router.post('/logout', async (req, res) => {
  const { token } = req.body;
  const db = req.app.get('db');

  if (!token) {
    return res.status(400).json({
      code: 400,
      message: 'Token不能为空'
    });
  }

  try {
    await db.query(
      'DELETE FROM login_sessions WHERE token = ?',
      [token]
    );

    res.json({
      code: 200,
      message: '登出成功'
    });

  } catch (error) {
    console.error('登出错误:', error);
    res.status(500).json({
      code: 500,
      message: '登出失败，请稍后重试'
    });
  }
});

// =====================================================
// GET /api/users/me - 获取当前用户信息
// =====================================================
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      code: 401,
      message: '未授权，请先登录'
    });
  }

  const token = authHeader.substring(7);
  const db = req.app.get('db');

  try {
    // 验证Token
    const [sessions] = await db.query(
      'SELECT user_id FROM login_sessions WHERE token = ? AND expiry_date > NOW()',
      [token]
    );

    if (sessions.length === 0) {
      return res.status(401).json({
        code: 401,
        message: 'Token已过期，请重新登录'
      });
    }

    const userId = sessions[0].user_id;

    // 获取用户信息
    const [users] = await db.query(
      'SELECT id, username, email, nickname, avatar_url FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      });
    }

    const user = users[0];
    res.json({
      code: 200,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        nickname: user.nickname,
        avatarUrl: user.avatar_url
      }
    });

  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({
      code: 500,
      message: '获取用户信息失败'
    });
  }
});

module.exports = router;
