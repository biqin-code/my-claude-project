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
    // 验证Token - 使用 JavaScript 时间比较，避免 MySQL 时区问题
    const now = new Date();
    const nowStr = now.toISOString().slice(0, 19).replace('T', ' ');
    const [sessions] = await db.query(
      'SELECT user_id FROM login_sessions WHERE token = ? AND expiry_date > ?',
      [token, nowStr]
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

// =====================================================
// PUT /api/users/profile - 更新用户资料
// =====================================================
router.put('/profile', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      code: 401,
      message: '未授权，请先登录'
    });
  }

  const token = authHeader.substring(7);
  const db = req.app.get('db');
  const { username, email, avatarUrl, nickname } = req.body;

  try {
    // 验证Token
    const now = new Date();
    const nowStr = now.toISOString().slice(0, 19).replace('T', ' ');
    const [sessions] = await db.query(
      'SELECT user_id FROM login_sessions WHERE token = ? AND expiry_date > ?',
      [token, nowStr]
    );

    if (sessions.length === 0) {
      return res.status(401).json({
        code: 401,
        message: 'Token已过期，请重新登录'
      });
    }

    const userId = sessions[0].user_id;

    // 验证用户名格式（如果提供）
    if (username !== undefined && !/^[a-zA-Z0-9]{4,20}$/.test(username)) {
      return res.status(400).json({
        code: 400,
        message: '用户名需为4-20位字母或数字'
      });
    }

    // 检查用户名是否被其他用户使用
    if (username) {
      const [existing] = await db.query(
        'SELECT id FROM users WHERE username = ? AND id != ?',
        [username, userId]
      );
      if (existing.length > 0) {
        return res.status(400).json({
          code: 400,
          message: '用户名已被使用'
        });
      }
    }

    // 检查邮箱是否被其他用户使用
    if (email) {
      const [existingEmail] = await db.query(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );
      if (existingEmail.length > 0) {
        return res.status(400).json({
          code: 400,
          message: '邮箱已被使用'
        });
      }
    }

    // 构建更新语句
    const updates = [];
    const params = [];

    if (username !== undefined) {
      updates.push('username = ?');
      params.push(username);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      params.push(email);
    }
    if (avatarUrl !== undefined) {
      updates.push('avatar_url = ?');
      params.push(avatarUrl);
    }
    if (nickname !== undefined) {
      updates.push('nickname = ?');
      params.push(nickname);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '没有需要更新的字段'
      });
    }

    params.push(userId);

    await db.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    // 获取更新后的用户信息
    const [users] = await db.query(
      'SELECT id, username, email, nickname, avatar_url FROM users WHERE id = ?',
      [userId]
    );

    const user = users[0];
    res.json({
      code: 200,
      message: '资料更新成功',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        nickname: user.nickname,
        avatarUrl: user.avatar_url
      }
    });

  } catch (error) {
    console.error('更新用户资料错误:', error);
    res.status(500).json({
      code: 500,
      message: '更新失败，请稍后重试'
    });
  }
});

// =====================================================
// PUT /api/users/password - 修改密码
// =====================================================
router.put('/password', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      code: 401,
      message: '未授权，请先登录'
    });
  }

  const token = authHeader.substring(7);
  const db = req.app.get('db');
  const { oldPassword, newPassword } = req.body;

  // 参数验证
  if (!oldPassword || !newPassword) {
    return res.status(400).json({
      code: 400,
      message: '原密码和新密码不能为空'
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      code: 400,
      message: '新密码需6位以上'
    });
  }

  try {
    // 验证Token
    const now = new Date();
    const nowStr = now.toISOString().slice(0, 19).replace('T', ' ');
    const [sessions] = await db.query(
      'SELECT user_id FROM login_sessions WHERE token = ? AND expiry_date > ?',
      [token, nowStr]
    );

    if (sessions.length === 0) {
      return res.status(401).json({
        code: 401,
        message: 'Token已过期，请重新登录'
      });
    }

    const userId = sessions[0].user_id;

    // 验证原密码
    const oldHashedPassword = hashPassword(oldPassword);
    const [users] = await db.query(
      'SELECT id FROM users WHERE id = ? AND password = ?',
      [userId, oldHashedPassword]
    );

    if (users.length === 0) {
      return res.status(401).json({
        code: 401,
        message: '原密码错误'
      });
    }

    // 更新密码
    const newHashedPassword = hashPassword(newPassword);
    await db.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [newHashedPassword, userId]
    );

    res.json({
      code: 200,
      message: '密码修改成功'
    });

  } catch (error) {
    console.error('修改密码错误:', error);
    res.status(500).json({
      code: 500,
      message: '修改密码失败，请稍后重试'
    });
  }
});

module.exports = router;
