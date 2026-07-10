# 财务管理App - 后端

## 技术栈

- **运行时**: Node.js
- **框架**: Express.js
- **数据库**: MySQL 9.x
- **字符集**: utf8mb4

## 快速开始

### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 启动服务器

```bash
# 开发模式 (支持热重载)
npm run dev

# 生产模式
npm start
```

服务器运行在: http://localhost:3000

## API 接口

### 用户认证

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/users/register` | POST | 用户注册 |
| `/api/users/login` | POST | 用户登录 |
| `/api/users/logout` | POST | 用户登出 |
| `/api/users/me` | GET | 获取当前用户信息 |

### 请求示例

**注册**
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}'
```

**登录**
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}'
```

## 数据库连接

| 配置 | 值 |
|------|------|
| 主机 | 127.0.0.1 |
| 端口 | 3307 |
| 用户名 | root |
| 密码 | 123456 |
| 数据库 | finance_db |
