package com.finance.service;

import com.finance.dto.req.BudgetSaveDTO;
import com.finance.dto.resp.BudgetDTO;
import com.finance.dto.resp.BudgetSummaryDTO;
import com.finance.dto.resp.CategoryDTO;

import java.util.List;
import java.util.Map;

/**
 * 预算服务接口
 */
public interface BudgetService {

    /**
     * 获取指定月份的预算列表
     */
    BudgetSummaryDTO getBudgets(String month);

    /**
     * 保存预算
     */
    void saveBudget(BudgetSaveDTO dto);

    /**
     * 删除预算
     */
    void deleteBudget(Long id);

    /**
     * 获取指定月份各类别支出
     */
    Map<Long, Map<String, Object>> getCategorySpending(String month);

    /**
     * 获取可设置预算的分类
     */
    List<CategoryDTO> getBudgetCategories();
}
