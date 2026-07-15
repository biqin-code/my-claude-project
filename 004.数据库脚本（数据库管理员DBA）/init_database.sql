-- =====================================================
-- 财务管理App - MySQL 数据库初始化脚本
-- 版本: V1.0
-- 日期: 2026-07-08
-- =====================================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS finance_db
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE finance_db;

-- =====================================================
-- 1. 用户表 (users)
-- =====================================================
DROP TABLE IF EXISTS login_sessions;
DROP TABLE IF EXISTS system_settings;
DROP TABLE IF EXISTS budgets;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID',
    username VARCHAR(20) NOT NULL COMMENT '用户名(4-20位字母或数字)',
    password VARCHAR(64) NOT NULL COMMENT '密码(SHA256加密)',
    email VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
    avatar_url TEXT DEFAULT NULL COMMENT '头像URL',
    nickname VARCHAR(50) DEFAULT NULL COMMENT '昵称',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_username (username),
    UNIQUE KEY uk_email (email),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- =====================================================
-- 2. 分类表 (categories)
-- =====================================================
CREATE TABLE categories (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '分类ID',
    type ENUM('expense', 'income') NOT NULL COMMENT '类型:expense支出/income收入',
    name VARCHAR(20) NOT NULL COMMENT '分类名称',
    icon VARCHAR(10) NOT NULL COMMENT '图标emoji',
    color VARCHAR(10) NOT NULL COMMENT '颜色代码',
    sort_order INT DEFAULT 0 COMMENT '排序',
    is_system TINYINT(1) DEFAULT 1 COMMENT '是否系统内置:1是,0否',
    user_id BIGINT UNSIGNED DEFAULT NULL COMMENT '自定义分类所属用户ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_user_type (user_id, type),
    INDEX idx_user_system (user_id, is_system),
    CONSTRAINT fk_categories_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='分类表';

-- =====================================================
-- 3. 交易记录表 (transactions)
-- =====================================================
CREATE TABLE transactions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '记录ID',
    user_id BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    type ENUM('expense', 'income') NOT NULL COMMENT '类型:expense支出/income收入',
    amount DECIMAL(12,2) NOT NULL COMMENT '金额',
    category_id INT UNSIGNED NOT NULL COMMENT '分类ID',
    note VARCHAR(255) DEFAULT NULL COMMENT '备注',
    payment_method VARCHAR(20) DEFAULT NULL COMMENT '支付方式',
    transaction_date DATE NOT NULL COMMENT '交易日期',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_user_date (user_id, transaction_date),
    INDEX idx_user_category (user_id, category_id),
    INDEX idx_user_type_date (user_id, type, transaction_date),
    INDEX idx_category_date (category_id, transaction_date),
    CONSTRAINT fk_transactions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_transactions_category FOREIGN KEY (category_id) REFERENCES categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='交易记录表';

-- =====================================================
-- 4. 预算表 (budgets)
-- =====================================================
CREATE TABLE budgets (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '预算ID',
    user_id BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    category_id INT UNSIGNED NOT NULL COMMENT '分类ID',
    amount DECIMAL(12,2) NOT NULL COMMENT '预算金额',
    month DATE NOT NULL COMMENT '预算月份',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_user_category_month (user_id, category_id, month),
    INDEX idx_user_month (user_id, month),
    CONSTRAINT fk_budgets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_budgets_category FOREIGN KEY (category_id) REFERENCES categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='预算表';

-- =====================================================
-- 5. 登录会话表 (login_sessions)
-- =====================================================
CREATE TABLE login_sessions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '会话ID',
    user_id BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    token VARCHAR(128) NOT NULL COMMENT '登录令牌',
    device_info VARCHAR(255) DEFAULT NULL COMMENT '设备信息',
    ip_address VARCHAR(45) DEFAULT NULL COMMENT 'IP地址',
    expiry_date DATETIME NOT NULL COMMENT '过期时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY uk_token (token),
    INDEX idx_user_expiry (user_id, expiry_date),
    CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='登录会话表';

-- =====================================================
-- 6. 系统设置表 (system_settings)
-- =====================================================
CREATE TABLE system_settings (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '设置ID',
    user_id BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
    settings_key VARCHAR(50) NOT NULL COMMENT '设置键',
    settings_value TEXT DEFAULT NULL COMMENT '设置值',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_user_key (user_id, settings_key),
    CONSTRAINT fk_settings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统设置表';

-- =====================================================
-- 7. 插入预设分类数据
-- =====================================================

-- 支出分类
INSERT INTO categories (type, name, icon, color, sort_order, is_system, user_id) VALUES
('expense', '餐饮', '🍜', '#FF6B6B', 1, 1, NULL),
('expense', '交通', '🚗', '#4ECDC4', 2, 1, NULL),
('expense', '购物', '🛒', '#FFE66D', 3, 1, NULL),
('expense', '娱乐', '🎬', '#95E1D3', 4, 1, NULL),
('expense', '居住', '🏠', '#F38181', 5, 1, NULL),
('expense', '医疗', '💊', '#AA96DA', 6, 1, NULL),
('expense', '教育', '📚', '#FCBAD3', 7, 1, NULL),
('expense', '其他', '📦', '#A8D8EA', 8, 1, NULL);

-- 收入分类
INSERT INTO categories (type, name, icon, color, sort_order, is_system, user_id) VALUES
('income', '工资', '💰', '#10B981', 1, 1, NULL),
('income', '奖金', '🎁', '#F59E0B', 2, 1, NULL),
('income', '投资', '📈', '#3B82F6', 3, 1, NULL),
('income', '礼金', '🎀', '#EC4899', 4, 1, NULL),
('income', '其他', '📦', '#A8D8EA', 5, 1, NULL);

-- =====================================================
-- 完成
-- =====================================================
SELECT 'Database initialized successfully!' AS message;
