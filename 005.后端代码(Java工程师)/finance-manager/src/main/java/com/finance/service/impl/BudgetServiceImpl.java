package com.finance.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.finance.common.BusinessException;
import com.finance.context.UserContext;
import com.finance.dto.req.BudgetSaveDTO;
import com.finance.dto.resp.BudgetDTO;
import com.finance.dto.resp.BudgetSummaryDTO;
import com.finance.dto.resp.BudgetTotalDTO;
import com.finance.dto.resp.CategoryDTO;
import com.finance.entity.Budget;
import com.finance.entity.Category;
import com.finance.mapper.BudgetMapper;
import com.finance.mapper.CategoryMapper;
import com.finance.mapper.TransactionMapper;
import com.finance.service.BudgetService;
import com.finance.utils.DateUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 预算服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BudgetServiceImpl implements BudgetService {

    private final BudgetMapper budgetMapper;
    private final CategoryMapper categoryMapper;
    private final TransactionMapper transactionMapper;

    @Override
    public BudgetSummaryDTO getBudgets(String month) {
        Long userId = UserContext.getUserId();
        LocalDate monthDate = DateUtil.parseMonth(month);

        // 获取预算列表
        LambdaQueryWrapper<Budget> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Budget::getUserId, userId)
                .eq(Budget::getMonth, monthDate);
        List<Budget> budgets = budgetMapper.selectList(wrapper);

        // 获取该月支出统计
        List<Map<String, Object>> spendingList = transactionMapper.getCategorySpendingByMonth(userId, month);
        Map<Long, BigDecimal> spendingMap = new HashMap<>();
        for (Map<String, Object> s : spendingList) {
            spendingMap.put(Long.valueOf(s.get("category_id").toString()),
                    new BigDecimal(s.get("total_spent").toString()));
        }

        // 获取分类信息
        Map<Long, Category> categoryMap = new HashMap<>();
        for (Budget budget : budgets) {
            Category cat = categoryMapper.selectById(budget.getCategoryId());
            if (cat != null) {
                categoryMap.put(budget.getCategoryId(), cat);
            }
        }

        // 格式化预算数据
        List<BudgetDTO> budgetDTOs = new ArrayList<>();
        BigDecimal totalBudget = BigDecimal.ZERO;
        BigDecimal totalSpent = BigDecimal.ZERO;
        int overBudgetCount = 0;
        BigDecimal overBudgetAmount = BigDecimal.ZERO;

        for (Budget budget : budgets) {
            BigDecimal budgetAmount = budget.getAmount();
            BigDecimal spent = spendingMap.getOrDefault(budget.getCategoryId(), BigDecimal.ZERO);
            BigDecimal remaining = budgetAmount.subtract(spent);
            int percentage = budgetAmount.compareTo(BigDecimal.ZERO) > 0
                    ? spent.divide(budgetAmount, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).min(BigDecimal.valueOf(100)).intValue()
                    : 0;
            boolean isOverBudget = spent.compareTo(budgetAmount) > 0;

            Category cat = categoryMap.get(budget.getCategoryId());

            budgetDTOs.add(BudgetDTO.builder()
                    .id(budget.getId())
                    .categoryId(budget.getCategoryId())
                    .categoryName(cat != null ? cat.getName() : null)
                    .categoryIcon(cat != null ? cat.getIcon() : null)
                    .categoryColor(cat != null ? cat.getColor() : null)
                    .categoryType(cat != null ? cat.getType() : null)
                    .budgetAmount(budgetAmount)
                    .spent(spent)
                    .remaining(remaining)
                    .percentage(percentage)
                    .isOverBudget(isOverBudget)
                    .createdAt(budget.getCreatedAt())
                    .updatedAt(budget.getUpdatedAt())
                    .build());

            totalBudget = totalBudget.add(budgetAmount);
            totalSpent = totalSpent.add(spent);
            if (isOverBudget) {
                overBudgetCount++;
                overBudgetAmount = overBudgetAmount.add(remaining.abs());
            }
        }

        // 按排序号排序
        budgetDTOs.sort((a, b) -> {
            Category ca = categoryMap.get(a.getCategoryId());
            Category cb = categoryMap.get(b.getCategoryId());
            int sortA = ca != null ? ca.getSortOrder() : 0;
            int sortB = cb != null ? cb.getSortOrder() : 0;
            return Integer.compare(sortA, sortB);
        });

        return BudgetSummaryDTO.builder()
                .budgets(budgetDTOs)
                .summary(BudgetTotalDTO.builder()
                        .totalBudget(totalBudget)
                        .totalSpent(totalSpent)
                        .totalRemaining(totalBudget.subtract(totalSpent))
                        .overBudgetCount(overBudgetCount)
                        .overBudgetAmount(overBudgetAmount)
                        .usagePercentage(totalBudget.compareTo(BigDecimal.ZERO) > 0
                                ? totalSpent.divide(totalBudget, 4, RoundingMode.HALF_UP)
                                .multiply(BigDecimal.valueOf(100)).min(BigDecimal.valueOf(100)).intValue()
                                : 0)
                        .build())
                .build();
    }

    @Override
    @Transactional
    public void saveBudget(BudgetSaveDTO dto) {
        Long userId = UserContext.getUserId();

        // 验证分类
        Category category = categoryMapper.selectById(dto.getCategoryId());
        if (category == null || !"expense".equals(category.getType())) {
            throw new BusinessException("分类不存在");
        }

        LocalDate monthDate = DateUtil.parseMonth(dto.getBudgetMonth());

        // 检查是否已存在
        Budget existing = budgetMapper.findByUserIdAndCategoryIdAndMonth(userId, dto.getCategoryId(), monthDate)
                .orElse(null);

        if (existing != null) {
            // 更新
            existing.setAmount(dto.getBudgetAmount());
            budgetMapper.updateById(existing);
            log.info("更新预算成功: {}", existing.getId());
        } else {
            // 新增
            Budget budget = new Budget();
            budget.setUserId(userId);
            budget.setCategoryId(dto.getCategoryId());
            budget.setAmount(dto.getBudgetAmount());
            budget.setMonth(monthDate);
            budgetMapper.insert(budget);
            log.info("添加预算成功: {}", budget.getId());
        }
    }

    @Override
    @Transactional
    public void deleteBudget(Long id) {
        Long userId = UserContext.getUserId();

        Budget budget = budgetMapper.selectById(id);
        if (budget == null) {
            throw new BusinessException("预算不存在");
        }

        if (!userId.equals(budget.getUserId())) {
            throw new BusinessException("无权删除此预算");
        }

        budgetMapper.deleteById(id);
        log.info("删除预算成功: {}", id);
    }

    @Override
    public Map<Long, Map<String, Object>> getCategorySpending(String month) {
        Long userId = UserContext.getUserId();

        List<Map<String, Object>> spendingList = transactionMapper.getCategorySpendingByMonth(userId, month);

        Map<Long, Map<String, Object>> result = new HashMap<>();
        for (Map<String, Object> s : spendingList) {
            Long categoryId = Long.valueOf(s.get("category_id").toString());
            Map<String, Object> data = new HashMap<>();
            data.put("categoryName", s.get("category_name"));
            data.put("categoryIcon", s.get("category_icon"));
            data.put("categoryColor", s.get("category_color"));
            data.put("spent", new BigDecimal(s.get("total_spent").toString()));
            result.put(categoryId, data);
        }

        return result;
    }

    @Override
    public List<CategoryDTO> getBudgetCategories() {
        List<Category> categories = categoryMapper.findSystemCategoriesByType("expense");

        return categories.stream()
                .map(c -> CategoryDTO.builder()
                        .id(c.getId())
                        .name(c.getName())
                        .icon(c.getIcon())
                        .color(c.getColor())
                        .type(c.getType())
                        .build())
                .collect(Collectors.toList());
    }
}
