package com.finance.controller;

import com.finance.common.Result;
import com.finance.dto.req.BudgetSaveDTO;
import com.finance.dto.resp.BudgetSummaryDTO;
import com.finance.dto.resp.CategoryDTO;
import com.finance.service.BudgetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 预算控制器
 */
@Tag(name = "预算管理")
@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @Operation(summary = "获取指定月份的预算列表")
    @GetMapping
    public Result<BudgetSummaryDTO> getBudgets(@RequestParam String month) {
        return Result.success(budgetService.getBudgets(month));
    }

    @Operation(summary = "添加或更新预算")
    @PostMapping
    public Result<Void> saveBudget(@Valid @RequestBody BudgetSaveDTO dto) {
        budgetService.saveBudget(dto);
        return Result.success("预算保存成功");
    }

    @Operation(summary = "删除预算")
    @DeleteMapping("/{id}")
    public Result<Void> deleteBudget(@PathVariable Long id) {
        budgetService.deleteBudget(id);
        return Result.success("预算删除成功");
    }

    @Operation(summary = "获取指定月份各类别支出")
    @GetMapping("/category-spending")
    public Result<Map<Long, Map<String, Object>>> getCategorySpending(@RequestParam String month) {
        return Result.success(budgetService.getCategorySpending(month));
    }

    @Operation(summary = "获取可设置预算的分类")
    @GetMapping("/categories")
    public Result<List<CategoryDTO>> getBudgetCategories() {
        return Result.success(budgetService.getBudgetCategories());
    }
}
