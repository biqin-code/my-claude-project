-- 创建预算管理表
CREATE TABLE IF NOT EXISTS `budgets` (
  `id` INT AUTO_INCREMENT PRIMARY KEY COMMENT '预算ID',
  `user_id` INT NOT NULL COMMENT '用户ID',
  `category_id` INT NOT NULL COMMENT '分类ID',
  `budget_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT '预算金额',
  `budget_month` VARCHAR(7) NOT NULL COMMENT '预算月份，格式：YYYY-MM',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  UNIQUE KEY `uk_user_category_month` (`user_id`, `category_id`, `budget_month`),
  KEY `idx_user_month` (`user_id`, `budget_month`),
  KEY `idx_category` (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户预算表';

-- 添加外键约束（如果需要可取消注释）
-- ALTER TABLE `budgets` ADD CONSTRAINT `fk_budgets_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
