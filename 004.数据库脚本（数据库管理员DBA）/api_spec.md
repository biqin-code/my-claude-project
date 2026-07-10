# 财务管理App - API 接口文档

## 概述

- **基础URL**: `/api/v1`
- **认证方式**: Token Bearer 认证
- **数据格式**: JSON

## 通用响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

## 错误码

| code | 说明 |
|------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权/Token过期 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 1. 用户接口

### 1.1 用户注册
```
POST /api/v1/users/register
```

**请求参数:**
```json
{
  "username": "testuser",
  "password": "test123"
}
```

**响应:**
```json
{
  "code": 200,
  "data": {
    "userId": 1,
    "username": "testuser"
  }
}
```

---

### 1.2 用户登录
```
POST /api/v1/users/login
```

**请求参数:**
```json
{
  "username": "testuser",
  "password": "test123"
}
```

**响应:**
```json
{
  "code": 200,
  "data": {
    "token": "abc123...",
    "userId": 1,
    "expiresIn": 604800
  }
}
```

---

### 1.3 用户登出
```
POST /api/v1/users/logout
```

**请求头:** `Authorization: Bearer {token}`

---

### 1.4 获取用户信息
```
GET /api/v1/users/me
```

**请求头:** `Authorization: Bearer {token}`

**响应:**
```json
{
  "code": 200,
  "data": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "nickname": "测试用户",
    "avatarUrl": null
  }
}
```

---

## 2. 分类接口

### 2.1 获取分类列表
```
GET /api/v1/categories
```

**请求头:** `Authorization: Bearer {token}`

**Query参数:** `type=expense|income`

**响应:**
```json
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "type": "expense",
      "name": "餐饮",
      "icon": "🍜",
      "color": "#FF6B6B"
    }
  ]
}
```

---

### 2.2 创建自定义分类
```
POST /api/v1/categories
```

**请求头:** `Authorization: Bearer {token}`

**请求参数:**
```json
{
  "type": "expense",
  "name": "数码",
  "icon": "📱",
  "color": "#3B82F6"
}
```

---

## 3. 交易记录接口

### 3.1 添加交易记录
```
POST /api/v1/transactions
```

**请求头:** `Authorization: Bearer {token}`

**请求参数:**
```json
{
  "type": "expense",
  "amount": 28.50,
  "categoryId": 1,
  "note": "午餐外卖",
  "paymentMethod": "支付宝",
  "transactionDate": "2026-07-08"
}
```

---

### 3.2 获取交易记录列表
```
GET /api/v1/transactions
```

**请求头:** `Authorization: Bearer {token}`

**Query参数:**
| 参数 | 类型 | 说明 |
|------|------|------|
| type | string | expense/income |
| startDate | string | 开始日期 YYYY-MM-DD |
| endDate | string | 结束日期 YYYY-MM-DD |
| page | int | 页码 默认1 |
| pageSize | int | 每页条数 默认20 |

**响应:**
```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": 1,
        "type": "expense",
        "amount": 28.50,
        "categoryName": "餐饮",
        "categoryIcon": "🍜",
        "categoryColor": "#FF6B6B",
        "note": "午餐外卖",
        "paymentMethod": "支付宝",
        "transactionDate": "2026-07-08",
        "createdAt": "2026-07-08T12:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "totalCount": 100,
      "totalPages": 5
    }
  }
}
```

---

### 3.3 删除交易记录
```
DELETE /api/v1/transactions/{id}
```

**请求头:** `Authorization: Bearer {token}`

---

## 4. 统计接口

### 4.1 获取月度统计
```
GET /api/v1/statistics/monthly
```

**请求头:** `Authorization: Bearer {token}`

**Query参数:** `year=2026&month=7`

**响应:**
```json
{
  "code": 200,
  "data": {
    "totalExpense": 3456.00,
    "totalIncome": 17000.00,
    "dailyAvg": 115.20,
    "expenseVsIncome": -13544.00
  }
}
```

---

### 4.2 获取分类统计
```
GET /api/v1/statistics/categories
```

**请求头:** `Authorization: Bearer {token}`

**Query参数:** `type=expense&startDate=2026-07-01&endDate=2026-07-31`

**响应:**
```json
{
  "code": 200,
  "data": [
    {
      "categoryId": 1,
      "categoryName": "餐饮",
      "categoryIcon": "🍜",
      "categoryColor": "#FF6B6B",
      "totalAmount": 1200.00,
      "percentage": 35,
      "transactionCount": 15
    }
  ]
}
```

---

### 4.3 获取日趋势
```
GET /api/v1/statistics/daily-trend
```

**请求头:** `Authorization: Bearer {token}`

**Query参数:** `type=expense&days=7`

**响应:**
```json
{
  "code": 200,
  "data": [
    { "date": "2026-07-02", "amount": 98.00 },
    { "date": "2026-07-03", "amount": 156.00 }
  ]
}
```

---

## 5. 预算接口

### 5.1 获取预算列表
```
GET /api/v1/budgets
```

**请求头:** `Authorization: Bearer {token}`

**Query参数:** `month=2026-07`

---

### 5.2 设置/更新预算
```
POST /api/v1/budgets
```

**请求头:** `Authorization: Bearer {token}`

**请求参数:**
```json
{
  "categoryId": 1,
  "amount": 3000.00,
  "month": "2026-07"
}
```

---

## 6. 设置接口

### 6.1 获取用户设置
```
GET /api/v1/settings
```

**请求头:** `Authorization: Bearer {token}`

---

### 6.2 更新设置
```
PUT /api/v1/settings
```

**请求头:** `Authorization: Bearer {token}`

**请求参数:**
```json
{
  "theme": "dark",
  "currency": "¥"
}
```

---

## 数据库表对应关系

| API 资源 | 数据库表 |
|---------|----------|
| users | users |
| categories | categories |
| transactions | transactions |
| budgets | budgets |
| settings | system_settings |
| sessions | login_sessions |
