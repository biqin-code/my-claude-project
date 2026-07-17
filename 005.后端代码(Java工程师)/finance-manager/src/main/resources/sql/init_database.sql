-- 财务管理系统数据库初始化脚本
-- 数据库: finance_db
-- 端口: 3307

CREATE DATABASE IF NOT EXISTS finance_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE finance_db;

-- =====================================================
-- 用户表
-- =====================================================
DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '用户ID',
    username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
    password VARCHAR(255) NOT NULL COMMENT '密码(SHA256加密)',
    email VARCHAR(100) COMMENT '邮箱',
    nickname VARCHAR(50) COMMENT '昵称',
    avatar_url TEXT COMMENT '头像URL',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- =====================================================
-- 登录会话表
-- =====================================================
DROP TABLE IF EXISTS login_sessions;
CREATE TABLE login_sessions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '会话ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    token VARCHAR(100) NOT NULL UNIQUE COMMENT '登录Token',
    expiry_date DATETIME NOT NULL COMMENT '过期时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_token (token),
    INDEX idx_user_id (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='登录会话表';

-- =====================================================
-- 分类表
-- =====================================================
DROP TABLE IF EXISTS categories;
CREATE TABLE categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '分类ID',
    type VARCHAR(20) NOT NULL COMMENT '类型: expense-支出, income-收入',
    name VARCHAR(50) NOT NULL COMMENT '分类名称',
    icon VARCHAR(50) COMMENT '图标',
    color VARCHAR(20) COMMENT '颜色',
    is_system TINYINT(1) DEFAULT 0 COMMENT '是否系统分类: 0-否, 1-是',
    user_id BIGINT COMMENT '创建用户ID(自定义分类)',
    sort_order INT DEFAULT 0 COMMENT '排序',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_type (type),
    INDEX idx_user_id (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='分类表';

-- =====================================================
-- 交易记录表
-- =====================================================
DROP TABLE IF EXISTS transactions;
CREATE TABLE transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '记录ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    type VARCHAR(20) NOT NULL COMMENT '类型: expense-支出, income-收入',
    amount DECIMAL(12,2) NOT NULL COMMENT '金额(支出为负数)',
    category_id BIGINT NOT NULL COMMENT '分类ID',
    note TEXT COMMENT '备注',
    payment_method VARCHAR(50) COMMENT '支付方式',
    transaction_date DATE NOT NULL COMMENT '交易日期',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_category_id (category_id),
    INDEX idx_transaction_date (transaction_date),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='交易记录表';

-- =====================================================
-- 预算表
-- =====================================================
DROP TABLE IF EXISTS budgets;
CREATE TABLE budgets (
    id BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '预算ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    category_id BIGINT NOT NULL COMMENT '分类ID',
    amount DECIMAL(12,2) NOT NULL COMMENT '预算金额',
    month DATE NOT NULL COMMENT '预算月份(月份第一天)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_user_category_month (user_id, category_id, month),
    INDEX idx_user_id (user_id),
    INDEX idx_category_id (category_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='预算表';

-- =====================================================
-- 初始化系统支出分类
-- =====================================================
INSERT INTO categories (type, name, icon, color, is_system, sort_order) VALUES
('expense', '餐饮', '🍜', '#FF6B6B', 1, 1),
('expense', '交通', '🚗', '#4ECDC4', 1, 2),
('expense', '购物', '🛒', '#45B7D1', 1, 3),
('expense', '娱乐', '🎮', '#96CEB4', 1, 4),
('expense', '居住', '🏠', '#FFEAA7', 1, 5),
('expense', '医疗', '💊', '#DDA0DD', 1, 6),
('expense', '教育', '📚', '#98D8C8', 1, 7),
('expense', '通讯', '📱', '#F7DC6F', 1, 8),
('expense', '零食', '🍪', '#BB8FCE', 1, 9),
('expense', '其他', '📦', '#85C1E9', 1, 10);

-- =====================================================
-- 初始化系统收入分类
-- =====================================================
INSERT INTO categories (type, name, icon, color, is_system, sort_order) VALUES
('income', '工资', '💰', '#27AE60', 1, 1),
('income', '奖金', '🎁', '#F39C12', 1, 2),
('income', '投资收益', '📈', '#3498DB', 1, 3),
('income', '副业', '💼', '#9B59B6', 1, 4),
('income', '其他', '💵', '#1ABC9C', 1, 5);
