# 我的账本 - 前端工程

财务管理 App 的前端原型，基于 Material Design 3 设计系统开发。

## 页面结构

```
frontend/
├── pages/                    # 页面文件
│   ├── login.html           # 登录页
│   ├── register.html         # 注册页
│   ├── dashboard.html        # 首页/仪表盘
│   ├── transactions.html      # 收支明细
│   ├── statistics.html       # 统计报表
│   └── profile.html          # 个人中心
├── css/
│   └── variables.css        # 设计系统变量
├── js/
│   └── navigation.js         # 导航组件
└── README.md
```

## 页面说明

| 页面 | 文件 | 功能 |
|------|------|------|
| 登录 | login.html | 用户名密码登录 |
| 注册 | register.html | 新用户注册 |
| 首页 | dashboard.html | 今日消费概览、快速记账入口、最近记录 |
| 明细 | transactions.html | 全部消费记录，按日期分组 |
| 统计 | statistics.html | 月度消费、分类占比、7天趋势 |
| 我的 | profile.html | 用户信息、设置、退出登录 |

## 导航结构

```
未登录状态:
  login.html ←→ register.html

已登录状态:
  dashboard.html (首页)
       ↓
  bottom-nav: 首页 | 明细 | 统计 | 我的
       ↓
  side-nav (桌面端): 仪表盘 | 收支明细 | 统计报表 | 个人中心 | 退出
```

## 设计规范

### 颜色

| 用途 | 颜色 |
|------|------|
| 主色 | #904568 |
| 主色容器 | #ffb1d0 |
| 背景 | #fff7fe |
| 分类-餐饮 | #FF6B6B |
| 分类-交通 | #4ECDC4 |
| 分类-购物 | #FFE66D |
| 分类-娱乐 | #95E1D3 |
| 分类-居住 | #F38181 |
| 分类-医疗 | #AA96DA |
| 分类-教育 | #FCBAD3 |
| 分类-其他 | #A8D8EA |

### 技术栈

- **CSS**: Tailwind CSS (CDN)
- **字体**: Inter + Material Symbols Icons
- **响应式**: 移动端优先，支持桌面端

## 运行方式

直接在浏览器中打开 `pages/` 目录下的 HTML 文件即可预览。

入口文件：`pages/login.html`

## 页面流程

```
1. 打开 login.html
2. 点击"立即注册" → register.html
3. 注册成功后返回 login.html
4. 登录成功 → dashboard.html
5. 使用底部导航或侧边栏切换页面
6. 点击头像 → profile.html → 退出登录 → login.html
```
