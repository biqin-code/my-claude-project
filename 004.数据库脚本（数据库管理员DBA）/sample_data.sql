-- =====================================================
-- 财务管理App - 示例数据
-- 版本: V1.0
-- 日期: 2026-07-08
-- =====================================================

USE finance_db;

-- =====================================================
-- 1. 插入测试用户
-- =====================================================
-- 密码是: test123 (SHA256)
INSERT INTO users (username, password, email, nickname) VALUES
('testuser', 'ecd71870d1963316a97e3ac3408c9835ad8cf0f3c1bc703527c30265534f75ae', 'test@example.com', '测试用户');

-- =====================================================
-- 2. 插入示例交易记录
-- =====================================================
-- 假设用户ID为1

-- 今天
INSERT INTO transactions (user_id, type, amount, category_id, note, payment_method, transaction_date) VALUES
(1, 'expense', 28.50, 1, '午餐外卖', '支付宝', CURDATE()),
(1, 'expense', 6.00, 2, '地铁扣费', '公交卡', CURDATE()),
(1, 'expense', 85.40, 3, '超市购物', '微信支付', CURDATE());

-- 昨天
INSERT INTO transactions (user_id, type, amount, category_id, note, payment_method, transaction_date) VALUES
(1, 'expense', 3400.00, 5, '房租', '银行转账', DATE_SUB(CURDATE(), INTERVAL 1 DAY)),
(1, 'expense', 20.00, 1, '瑞幸咖啡', '微信支付', DATE_SUB(CURDATE(), INTERVAL 1 DAY)),
(1, 'expense', 45.00, 4, '电影票', '支付宝', DATE_SUB(CURDATE(), INTERVAL 1 DAY));

-- 3天前
INSERT INTO transactions (user_id, type, amount, category_id, note, payment_method, transaction_date) VALUES
(1, 'expense', 15.00, 1, '早餐', '现金', DATE_SUB(CURDATE(), INTERVAL 3 DAY)),
(1, 'expense', 35.00, 2, '打车', '滴滴出行', DATE_SUB(CURDATE(), INTERVAL 3 DAY)),
(1, 'expense', 12.80, 6, '药店买药', '医保卡', DATE_SUB(CURDATE(), INTERVAL 5 DAY));

-- 本月收入
INSERT INTO transactions (user_id, type, amount, category_id, note, payment_method, transaction_date) VALUES
(1, 'income', 15000.00, 1, '工资', '银行转账', DATE_SUB(CURDATE(), INTERVAL 5 DAY)),
(1, 'income', 2000.00, 2, '项目奖金', '银行转账', DATE_SUB(CURDATE(), INTERVAL 10 DAY));

-- =====================================================
-- 3. 插入预算数据
-- =====================================================
INSERT INTO budgets (user_id, category_id, amount, month) VALUES
(1, 1, 3000.00, DATE_FORMAT(CURDATE(), '%Y-%m-01')),  -- 餐饮预算
(1, 2, 500.00, DATE_FORMAT(CURDATE(), '%Y-%m-01')),    -- 交通预算
(1, 3, 1000.00, DATE_FORMAT(CURDATE(), '%Y-%m-01')),  -- 购物预算
(1, 5, 3500.00, DATE_FORMAT(CURDATE(), '%Y-%m-01'));   -- 居住预算

-- =====================================================
-- 4. 插入用户设置
-- =====================================================
INSERT INTO system_settings (user_id, settings_key, settings_value) VALUES
(1, 'currency', '¥'),
(1, 'date_format', 'YYYY-MM-DD'),
(1, 'theme', 'light'),
(1, 'language', 'zh-CN'),
(1, 'budget_alert_enabled', 'true'),
(1, 'monthly_budget', '5000.00');

-- =====================================================
-- 查询示例
-- =====================================================

-- 1. 查看所有交易记录（带分类信息）
-- SELECT t.*, c.name as category_name, c.icon as category_icon
-- FROM transactions t
-- JOIN categories c ON t.category_id = c.id
-- WHERE t.user_id = 1
-- ORDER BY t.transaction_date DESC;

-- 2. 查看今日消费统计
-- SELECT
--     COUNT(*) as count,
--     SUM(amount) as total
-- FROM transactions
-- WHERE user_id = 1
-- AND type = 'expense'
-- AND transaction_date = CURDATE();

-- 3. 查看本月各类别消费
-- SELECT
--     c.name,
--     c.icon,
--     SUM(t.amount) as total,
--     ROUND(SUM(t.amount) * 100.0 / (SELECT SUM(amount) FROM transactions WHERE user_id = 1 AND type = 'expense' AND MONTH(transaction_date) = MONTH(CURDATE())), 2) as percentage
-- FROM transactions t
-- JOIN categories c ON t.category_id = c.id
-- WHERE t.user_id = 1 AND t.type = 'expense'
-- AND MONTH(t.transaction_date) = MONTH(CURDATE())
-- GROUP BY c.id, c.name, c.icon
-- ORDER BY total DESC;
