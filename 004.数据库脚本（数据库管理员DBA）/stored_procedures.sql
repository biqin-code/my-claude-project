-- =====================================================
-- 财务管理App - 存储过程和函数
-- 版本: V1.0
-- 日期: 2026-07-08
-- =====================================================

USE finance_db;

-- =====================================================
-- 1. 用户注册存储过程
-- =====================================================
DROP PROCEDURE IF EXISTS sp_user_register;

DELIMITER //
CREATE PROCEDURE sp_user_register(
    IN p_username VARCHAR(20),
    IN p_password VARCHAR(64),
    OUT p_user_id BIGINT,
    OUT p_message VARCHAR(100)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        SET p_message = '注册失败，请稍后重试';
        SET p_user_id = 0;
        ROLLBACK;
    END;

    -- 检查用户名是否已存在
    IF EXISTS (SELECT 1 FROM users WHERE username = p_username) THEN
        SET p_message = '用户名已存在';
        SET p_user_id = 0;
    ELSE
        START TRANSACTION;
        INSERT INTO users (username, password) VALUES (p_username, p_password);
        SET p_user_id = LAST_INSERT_ID();
        COMMIT;
        SET p_message = '注册成功';
    END IF;
END //
DELIMITER ;

-- =====================================================
-- 2. 用户登录存储过程
-- =====================================================
DROP PROCEDURE IF EXISTS sp_user_login;

DELIMITER //
CREATE PROCEDURE sp_user_login(
    IN p_username VARCHAR(20),
    IN p_password VARCHAR(64),
    IN p_token VARCHAR(128),
    IN p_device_info VARCHAR(255),
    IN p_ip_address VARCHAR(45),
    OUT p_success TINYINT,
    OUT p_message VARCHAR(100),
    OUT p_user_id BIGINT
)
BEGIN
    DECLARE v_user_id BIGINT;
    DECLARE v_password VARCHAR(64);
    DECLARE v_session_id BIGINT;

    SET p_success = 0;
    SET p_user_id = 0;
    SET p_message = '';

    -- 查找用户
    SELECT id, password INTO v_user_id, v_password
    FROM users
    WHERE username = p_username;

    IF v_user_id IS NULL THEN
        SET p_message = '用户名不存在';
    ELSEIF v_password != p_password THEN
        SET p_message = '密码错误';
    ELSE
        -- 删除旧会话
        DELETE FROM login_sessions WHERE user_id = v_user_id;

        -- 创建新会话
        INSERT INTO login_sessions (user_id, token, device_info, ip_address, expiry_date)
        VALUES (v_user_id, p_token, p_device_info, p_ip_address, DATE_ADD(NOW(), INTERVAL 7 DAY));

        SET p_session_id = LAST_INSERT_ID();
        SET p_success = 1;
        SET p_user_id = v_user_id;
        SET p_message = '登录成功';
    END IF;
END //
DELIMITER ;

-- =====================================================
-- 3. 用户登出存储过程
-- =====================================================
DROP PROCEDURE IF EXISTS sp_user_logout;

DELIMITER //
CREATE PROCEDURE sp_user_logout(
    IN p_token VARCHAR(128),
    OUT p_success TINYINT
)
BEGIN
    DELETE FROM login_sessions WHERE token = p_token;
    SET p_success = ROW_COUNT();
END //
DELIMITER ;

-- =====================================================
-- 4. 添加交易记录存储过程
-- =====================================================
DROP PROCEDURE IF EXISTS sp_add_transaction;

DELIMITER //
CREATE PROCEDURE sp_add_transaction(
    IN p_user_id BIGINT,
    IN p_type ENUM('expense', 'income'),
    IN p_amount DECIMAL(12,2),
    IN p_category_id INT,
    IN p_note VARCHAR(255),
    IN p_payment_method VARCHAR(20),
    IN p_transaction_date DATE,
    OUT p_transaction_id BIGINT,
    OUT p_message VARCHAR(100)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        SET p_message = '添加记录失败';
        SET p_transaction_id = 0;
        ROLLBACK;
    END;

    -- 验证分类是否存在且属于该用户或系统分类
    IF NOT EXISTS (
        SELECT 1 FROM categories
        WHERE id = p_category_id
        AND (is_system = 1 OR user_id = p_user_id)
        AND type = p_type
    ) THEN
        SET p_message = '无效的分类';
        SET p_transaction_id = 0;
    ELSE
        START TRANSACTION;
        INSERT INTO transactions (user_id, type, amount, category_id, note, payment_method, transaction_date)
        VALUES (p_user_id, p_type, p_amount, p_category_id, p_note, p_payment_method, p_transaction_date);
        SET p_transaction_id = LAST_INSERT_ID();
        COMMIT;
        SET p_message = '添加成功';
    END IF;
END //
DELIMITER ;

-- =====================================================
-- 5. 获取用户交易记录列表（分页）
-- =====================================================
DROP PROCEDURE IF EXISTS sp_get_transactions;

DELIMITER //
CREATE PROCEDURE sp_get_transactions(
    IN p_user_id BIGINT,
    IN p_type ENUM('expense', 'income'),
    IN p_start_date DATE,
    IN p_end_date DATE,
    IN p_page INT,
    IN p_page_size INT,
    OUT p_total_count INT,
    OUT p_total_amount DECIMAL(12,2)
)
BEGIN
    DECLARE v_offset INT;

    SET v_offset = (p_page - 1) * p_page_size;

    -- 统计总数和总金额
    SELECT COUNT(*), COALESCE(SUM(amount), 0)
    INTO p_total_count, p_total_amount
    FROM transactions
    WHERE user_id = p_user_id
    AND (p_type IS NULL OR type = p_type)
    AND transaction_date BETWEEN p_start_date AND p_end_date;

    -- 返回分页数据
    SELECT
        t.id,
        t.type,
        t.amount,
        t.note,
        t.payment_method,
        t.transaction_date,
        t.created_at,
        c.name AS category_name,
        c.icon AS category_icon,
        c.color AS category_color
    FROM transactions t
    JOIN categories c ON t.category_id = c.id
    WHERE t.user_id = p_user_id
    AND (p_type IS NULL OR t.type = p_type)
    AND t.transaction_date BETWEEN p_start_date AND p_end_date
    ORDER BY t.transaction_date DESC, t.created_at DESC
    LIMIT v_offset, p_page_size;
END //
DELIMITER ;

-- =====================================================
-- 6. 获取月度消费统计
-- =====================================================
DROP PROCEDURE IF EXISTS sp_get_monthly_stats;

DELIMITER //
CREATE PROCEDURE sp_get_monthly_stats(
    IN p_user_id BIGINT,
    IN p_year INT,
    IN p_month INT,
    OUT p_total_expense DECIMAL(12,2),
    OUT p_total_income DECIMAL(12,2),
    OUT p_daily_avg DECIMAL(12,2)
)
BEGIN
    DECLARE v_start_date DATE;
    DECLARE v_end_date DATE;
    DECLARE v_days INT;

    SET v_start_date = DATE(CONCAT(p_year, '-', LPAD(p_month, 2, '0'), '-01'));
    SET v_end_date = LAST_DAY(v_start_date);
    SET v_days = DAY(v_end_date);

    -- 获取支出总额
    SELECT COALESCE(SUM(amount), 0) INTO p_total_expense
    FROM transactions
    WHERE user_id = p_user_id
    AND type = 'expense'
    AND transaction_date BETWEEN v_start_date AND v_end_date;

    -- 获取收入总额
    SELECT COALESCE(SUM(amount), 0) INTO p_total_income
    FROM transactions
    WHERE user_id = p_user_id
    AND type = 'income'
    AND transaction_date BETWEEN v_start_date AND v_end_date;

    -- 计算日均支出
    SET p_daily_avg = ROUND(p_total_expense / v_days, 2);
END //
DELIMITER ;

-- =====================================================
-- 7. 获取分类消费占比
-- =====================================================
DROP PROCEDURE IF EXISTS sp_get_category_stats;

DELIMITER //
CREATE PROCEDURE sp_get_category_stats(
    IN p_user_id BIGINT,
    IN p_type ENUM('expense', 'income'),
    IN p_start_date DATE,
    IN p_end_date DATE
)
BEGIN
    SELECT
        c.id AS category_id,
        c.name AS category_name,
        c.icon AS category_icon,
        c.color AS category_color,
        COUNT(t.id) AS transaction_count,
        SUM(t.amount) AS total_amount,
        ROUND(SUM(t.amount) * 100.0 / NULLIF((SELECT SUM(amount) FROM transactions WHERE user_id = p_user_id AND type = p_type AND transaction_date BETWEEN p_start_date AND p_end_date), 0), 2) AS percentage
    FROM categories c
    LEFT JOIN transactions t ON c.id = t.category_id
        AND t.user_id = p_user_id
        AND t.type = p_type
        AND t.transaction_date BETWEEN p_start_date AND p_end_date
    WHERE c.type = p_type AND (c.is_system = 1 OR c.user_id = p_user_id)
    GROUP BY c.id, c.name, c.icon, c.color
    HAVING total_amount > 0
    ORDER BY total_amount DESC;
END //
DELIMITER ;

-- =====================================================
-- 8. 获取近N天趋势数据
-- =====================================================
DROP PROCEDURE IF EXISTS sp_get_daily_trend;

DELIMITER //
CREATE PROCEDURE sp_get_daily_trend(
    IN p_user_id BIGINT,
    IN p_type ENUM('expense', 'income'),
    IN p_days INT
)
BEGIN
    SELECT
        transaction_date AS date,
        SUM(amount) AS daily_amount
    FROM transactions
    WHERE user_id = p_user_id
    AND type = p_type
    AND transaction_date >= DATE_SUB(CURDATE(), INTERVAL p_days - 1 DAY)
    GROUP BY transaction_date
    ORDER BY transaction_date ASC;
END //
DELIMITER ;

-- =====================================================
-- 9. 删除交易记录
-- =====================================================
DROP PROCEDURE IF EXISTS sp_delete_transaction;

DELIMITER //
CREATE PROCEDURE sp_delete_transaction(
    IN p_transaction_id BIGINT,
    IN p_user_id BIGINT,
    OUT p_success TINYINT
)
BEGIN
    DELETE FROM transactions
    WHERE id = p_transaction_id AND user_id = p_user_id;
    SET p_success = ROW_COUNT();
END //
DELIMITER ;

-- =====================================================
-- 10. 验证会话有效性
-- =====================================================
DROP FUNCTION IF EXISTS fn_validate_session;

DELIMITER //
CREATE FUNCTION fn_validate_session(p_token VARCHAR(128))
RETURNS BIGINT
DETERMINISTIC
BEGIN
    DECLARE v_user_id BIGINT;

    SELECT user_id INTO v_user_id
    FROM login_sessions
    WHERE token = p_token AND expiry_date > NOW();

    RETURN v_user_id;
END //
DELIMITER ;

-- =====================================================
-- 清理过期会话的事件（每天执行）
-- =====================================================
DROP EVENT IF EXISTS evt_cleanup_expired_sessions;
DELIMITER //
CREATE EVENT evt_cleanup_expired_sessions
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO
BEGIN
    DELETE FROM login_sessions WHERE expiry_date < NOW();
END //
DELIMITER ;
