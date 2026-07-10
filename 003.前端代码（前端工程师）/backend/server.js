/**
 * 财务管理App - 后端服务器
 * Node.js + Express + MySQL
 */

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');
const userRoutes = require('./routes/users');

const app = express();
const PORT = 3000;

// 中间件
app.use(cors());
app.use(express.json());

// MySQL 连接池
const pool = mysql.createPool({
  host: '127.0.0.1',
  port: 3307,
  user: 'root',
  password: '123456',
  database: 'finance_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

// 测试连接
pool.getConnection((err, conn) => {
  if (err) {
    console.error('数据库连接失败:', err);
  } else {
    console.log('✅ 数据库连接成功');
    conn.release();
  }
});

// 将数据库连接池共享给路由
app.set('db', pool);

// 路由
app.use('/api/users', userRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 服务器运行中: http://localhost:${PORT}`);
  console.log(`📊 数据库: 127.0.0.1:3307/finance_db`);
});
