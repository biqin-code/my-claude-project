package com.finance.service;

import com.finance.dto.resp.CategoryDistributionDTO;
import com.finance.dto.resp.DailyTrendDTO;
import com.finance.dto.resp.MonthlyStatisticsDTO;
import com.finance.dto.resp.MonthlyTrendDTO;

import java.util.List;

/**
 * 统计服务接口
 */
public interface StatisticsService {

    /**
     * 获取月度统计
     */
    MonthlyStatisticsDTO getMonthlyStatistics();

    /**
     * 获取分类分布
     */
    CategoryDistributionDTO getCategoryDistribution();

    /**
     * 获取7天趋势
     */
    List<DailyTrendDTO> getWeeklyTrend();

    /**
     * 获取12个月趋势
     */
    List<MonthlyTrendDTO> getYearlyTrend();
}
