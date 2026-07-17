package com.finance.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.finance.entity.Transaction;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * 交易记录Mapper
 */
@Mapper
public interface TransactionMapper extends BaseMapper<Transaction> {

    @Select("SELECT COALESCE(SUM(ABS(amount)), 0) FROM transactions WHERE user_id = #{userId} AND type = 'expense' AND transaction_date = #{date}")
    BigDecimal getTodayExpenseTotal(@Param("userId") Long userId, @Param("date") LocalDate date);

    @Select("SELECT c.id, c.name, c.icon, c.color, COALESCE(SUM(ABS(t.amount)), 0) as total " +
            "FROM categories c " +
            "LEFT JOIN transactions t ON c.id = t.category_id AND t.user_id = #{userId} AND t.type = 'expense' AND t.transaction_date = #{date} " +
            "WHERE c.type = 'expense' " +
            "GROUP BY c.id, c.name, c.icon, c.color " +
            "HAVING total > 0 " +
            "ORDER BY total DESC")
    List<Map<String, Object>> getTodayExpenseByCategory(@Param("userId") Long userId, @Param("date") LocalDate date);

    @Select("SELECT c.id, c.name, c.icon, c.color, COALESCE(SUM(ABS(t.amount)), 0) as total " +
            "FROM categories c " +
            "LEFT JOIN transactions t ON c.id = t.category_id AND t.user_id = #{userId} AND t.type = 'expense' AND t.transaction_date >= #{startDate} AND t.transaction_date <= #{endDate} " +
            "WHERE c.type = 'expense' " +
            "GROUP BY c.id, c.name, c.icon, c.color " +
            "HAVING total > 0 " +
            "ORDER BY total DESC")
    List<Map<String, Object>> getCategoryExpenseByDateRange(@Param("userId") Long userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Select("SELECT COUNT(DISTINCT transaction_date) FROM transactions WHERE user_id = #{userId} AND type = 'expense' AND transaction_date >= #{startDate} AND transaction_date <= #{endDate}")
    Integer getRecordDays(@Param("userId") Long userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Select("SELECT COALESCE(SUM(ABS(amount)), 0) FROM transactions WHERE user_id = #{userId} AND type = #{type} AND transaction_date >= #{startDate} AND transaction_date <= #{endDate}")
    BigDecimal getTotalByTypeAndDateRange(@Param("userId") Long userId, @Param("type") String type, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Select("SELECT DATE(transaction_date) as trans_date, COALESCE(SUM(ABS(amount)), 0) as total " +
            "FROM transactions " +
            "WHERE user_id = #{userId} AND type = 'expense' AND transaction_date >= #{startDate} AND transaction_date <= #{endDate} " +
            "GROUP BY DATE(transaction_date) " +
            "ORDER BY trans_date ASC")
    List<Map<String, Object>> getDailyExpenseTrend(@Param("userId") Long userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Select("SELECT DATE_FORMAT(transaction_date, '%Y-%m') as month, type, COALESCE(SUM(ABS(amount)), 0) as total " +
            "FROM transactions " +
            "WHERE user_id = #{userId} AND transaction_date >= #{startDate} AND transaction_date <= #{endDate} " +
            "GROUP BY DATE_FORMAT(transaction_date, '%Y-%m'), type " +
            "ORDER BY month ASC")
    List<Map<String, Object>> getMonthlyTrend(@Param("userId") Long userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Select("SELECT category_id, SUM(ABS(amount)) as total_spent " +
            "FROM transactions " +
            "WHERE user_id = #{userId} AND type = 'expense' AND DATE_FORMAT(transaction_date, '%Y-%m') = #{month} " +
            "GROUP BY category_id")
    List<Map<String, Object>> getCategorySpendingByMonth(@Param("userId") Long userId, @Param("month") String month);
}
