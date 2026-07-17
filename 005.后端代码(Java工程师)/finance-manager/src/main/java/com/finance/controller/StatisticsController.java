package com.finance.controller;

import com.finance.common.Result;
import com.finance.dto.resp.*;
import com.finance.service.StatisticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 统计控制器
 */
@Tag(name = "统计报表")
@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
public class StatisticsController {

    private final StatisticsService statisticsService;

    @Operation(summary = "获取月度统计")
    @GetMapping("/monthly")
    public Result<MonthlyStatisticsDTO> getMonthlyStatistics() {
        return Result.success(statisticsService.getMonthlyStatistics());
    }

    @Operation(summary = "获取分类分布")
    @GetMapping("/category-distribution")
    public Result<CategoryDistributionDTO> getCategoryDistribution() {
        return Result.success(statisticsService.getCategoryDistribution());
    }

    @Operation(summary = "获取7天趋势")
    @GetMapping("/weekly-trend")
    public Result<List<DailyTrendDTO>> getWeeklyTrend() {
        return Result.success(statisticsService.getWeeklyTrend());
    }

    @Operation(summary = "获取12个月趋势")
    @GetMapping("/yearly-trend")
    public Result<List<MonthlyTrendDTO>> getYearlyTrend() {
        return Result.success(statisticsService.getYearlyTrend());
    }
}
