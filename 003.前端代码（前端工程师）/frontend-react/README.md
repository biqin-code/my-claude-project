# 财务管理App - 前端 (React)

## 技术栈

- **框架**: React 18
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **路由**: React Router 6
- **字体**: Material Symbols Icons

## 快速开始

### 1. 安装依赖

```bash
cd frontend-react
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

前端运行在: http://localhost:5173

### 3. 启动后端服务器

```bash
cd backend
npm install
npm run dev
```

后端运行在: http://localhost:3000

## 页面路由

| 路径 | 页面 | 说明 |
|------|------|------|
| `/login` | 登录页 | 用户登录 |
| `/register` | 注册页 | 用户注册 |
| `/dashboard` | 首页 | 需登录后访问 |

## 功能

- ✅ 用户注册
- ✅ 用户登录
- ✅ Token 认证
- ✅ 登录状态保持
- ✅ 退出登录

## 项目结构

```
frontend-react/
├── src/
│   ├── api/
│   │   └── auth.js       # 认证API
│   ├── pages/
│   │   ├── LoginPage.jsx    # 登录页
│   │   ├── RegisterPage.jsx  # 注册页
│   │   └── DashboardPage.jsx # 首页
│   ├── utils/
│   │   └── auth.js       # 认证工具
│   ├── App.jsx           # 路由配置
│   ├── main.jsx          # 入口文件
│   └── index.css         # 全局样式
├── index.html
├── package.json
└── vite.config.js
```

## 测试账号

```
用户名: testuser
密码: test123
```
