# 财务管理App - 数据库设计文档

## 1. 数据库概述

- **数据库名称**: `finance_db`
- **字符集**: `utf8mb4` (支持emoji和中文)
- **排序规则**: `utf8mb4_unicode_ci`

## 2. 数据库结构

```
finance_db/
├── users                    # 用户表
├── categories              # 分类表（支出/收入分类）
├── transactions            # 交易记录表
├── budgets                # 预算表
├── login_sessions          # 登录会话表
└── system_settings        # 系统设置表
```

## 3. 表结构设计

### 3.1 用户表 (users)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 用户ID |
| username | VARCHAR(20) | UNIQUE, NOT NULL | 用户名 |
| password | VARCHAR(64) | NOT NULL | 密码(SHA256加密) |
| email | VARCHAR(100) | UNIQUE | 邮箱 |
| avatar_url | VARCHAR(255) | | 头像URL |
| nickname | VARCHAR(50) | | 昵称 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

### 3.2 分类表 (categories)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 分类ID |
| type | ENUM('expense','income') | NOT NULL | 类型 |
| name | VARCHAR(20) | NOT NULL | 分类名称 |
| icon | VARCHAR(10) | NOT NULL | 图标emoji |
| color | VARCHAR(10) | NOT NULL | 颜色代码 |
| sort_order | INT | DEFAULT 0 | 排序 |
| is_system | TINYINT | DEFAULT 1 | 是否系统内置(1是,0否) |
| user_id | BIGINT | FK(users.id), NULL | 自定义分类所属用户 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

### 3.3 交易记录表 (transactions)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 记录ID |
| user_id | BIGINT | FK(users.id), NOT NULL | 用户ID |
| type | ENUM('expense','income') | NOT NULL | 类型 |
| amount | DECIMAL(12,2) | NOT NULL | 金额 |
| category_id | INT | FK(categories.id), NOT NULL | 分类ID |
| note | VARCHAR(255) | | 备注 |
| payment_method | VARCHAR(20) | | 支付方式 |
| transaction_date | DATE | NOT NULL | 交易日期 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

### 3.4 预算表 (budgets)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 预算ID |
| user_id | BIGINT | FK(users.id), NOT NULL | 用户ID |
| category_id | INT | FK(categories.id), NOT NULL | 分类ID |
| amount | DECIMAL(12,2) | NOT NULL | 预算金额 |
| month | DATE | NOT NULL | 预算月份 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

### 3.5 登录会话表 (login_sessions)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | BIGINT | PK, AUTO_INCREMENT | 会话ID |
| user_id | BIGINT | FK(users.id), NOT NULL | 用户ID |
| token | VARCHAR(128) | UNIQUE, NOT NULL | 登录令牌 |
| device_info | VARCHAR(255) | | 设备信息 |
| ip_address | VARCHAR(45) | | IP地址 |
| expiry_date | DATETIME | NOT NULL | 过期时间 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

### 3.6 系统设置表 (system_settings)

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | INT | PK, AUTO_INCREMENT | 设置ID |
| user_id | BIGINT | FK(users.id), NOT NULL | 用户ID |
| settings_key | VARCHAR(50) | NOT NULL | 设置键 |
| settings_value | TEXT | | 设置值 |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

## 4. 索引设计

### users 表
- `idx_username` on `username`
- `idx_email` on `email`

### categories 表
- `idx_user_type` on `(user_id, type)`
- `idx_user_system` on `(user_id, is_system)`

### transactions 表
- `idx_user_date` on `(user_id, transaction_date)`
- `idx_user_category` on `(user_id, category_id)`
- `idx_user_type_date` on `(user_id, type, transaction_date)`

### budgets 表
- `idx_user_month` on `(user_id, month)`

### login_sessions 表
- `idx_token` on `token`
- `idx_user_expiry` on `(user_id, expiry_date)`

## 5. 分类预设数据

### 支出分类 (expense)
| 名称 | 图标 | 颜色 |
|------|------|------|
| 餐饮 | 🍜 | #FF6B6B |
| 交通 | 🚗 | #4ECDC4 |
| 购物 | 🛒 | #FFE66D |
| 娱乐 | 🎬 | #95E1D3 |
| 居住 | 🏠 | #F38181 |
| 医疗 | 💊 | #AA96DA |
| 教育 | 📚 | #FCBAD3 |
| 其他 | 📦 | #A8D8EA |

### 收入分类 (income)
| 名称 | 图标 | 颜色 |
|------|------|------|
| 工资 | 💰 | #10B981 |
| 奖金 | 🎁 | #F59E0B |
| 投资 | 📈 | #3B82F6 |
| 礼金 | 🎀 | #EC4899 |
| 其他 | 📦 | #A8D8EA |

## 6. 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| V1.0 | 2026-07-08 | 初始版本 |
