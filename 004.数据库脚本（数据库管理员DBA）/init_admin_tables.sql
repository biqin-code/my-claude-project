-- =====================================================
-- 财务管理App - 后台管理系统 管理员表初始化脚本
-- 版本: V1.0
-- 日期: 2026-07-17
-- =====================================================

-- 使用数据库
USE finance_db;

-- =====================================================
-- 1. 超级管理员表 (admin_users)
-- =====================================================
DROP TABLE IF EXISTS admin_sessions;
DROP TABLE IF EXISTS admin_users;

CREATE TABLE admin_users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '管理员ID',
    username VARCHAR(50) NOT NULL COMMENT '管理员用户名',
    password VARCHAR(128) NOT NULL COMMENT '密码（SHA256加密）',
    nickname VARCHAR(50) DEFAULT NULL COMMENT '昵称',
    role ENUM('super_admin') DEFAULT 'super_admin' COMMENT '角色',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    UNIQUE KEY uk_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='超级管理员表';

-- =====================================================
-- 2. 管理员登录会话表 (admin_sessions)
-- =====================================================
CREATE TABLE admin_sessions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '会话ID',
    admin_id INT UNSIGNED NOT NULL COMMENT '管理员ID',
    token VARCHAR(128) NOT NULL COMMENT '登录令牌',
    ip_address VARCHAR(45) DEFAULT NULL COMMENT 'IP地址',
    expiry_date DATETIME NOT NULL COMMENT '过期时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    UNIQUE KEY uk_token (token),
    INDEX idx_admin_expiry (admin_id, expiry_date),
    CONSTRAINT fk_sessions_admin FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员登录会话表';

-- =====================================================
-- 3. 插入默认超级管理员账号
-- =====================================================
-- 密码为: admin123 (SHA256加密)
INSERT INTO admin_users (username, password, nickname, role) VALUES
('admin', '240be518fabd2724ddb6f04eeb9d5b67e0564a0752ea08c2234f2878bde1a565', '超级管理员', 'super_admin');

-- =====================================================
-- 验证
-- =====================================================
SELECT 'Admin tables created successfully!' AS message;
SELECT * FROM admin_users;
