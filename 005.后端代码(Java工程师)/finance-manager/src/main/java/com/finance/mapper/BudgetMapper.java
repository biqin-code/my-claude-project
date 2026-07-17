package com.finance.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.finance.entity.Budget;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDate;
import java.util.Optional;

/**
 * 预算Mapper
 */
@Mapper
public interface BudgetMapper extends BaseMapper<Budget> {

    @Select("SELECT * FROM budgets WHERE user_id = #{userId} AND category_id = #{categoryId} AND month = #{month}")
    Optional<Budget> findByUserIdAndCategoryIdAndMonth(@Param("userId") Long userId, @Param("categoryId") Long categoryId, @Param("month") LocalDate month);
}
