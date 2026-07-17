package com.finance.service.impl;

import com.finance.context.UserContext;
import com.finance.dto.resp.CategoryDistributionDTO;
import com.finance.dto.resp.CategoryStatDTO;
import com.finance.dto.resp.DailyTrendDTO;
import com.finance.dto.resp.MonthlyStatisticsDTO;
import com.finance.dto.resp.MonthlyTrendDTO;
import com.finance.mapper.TransactionMapper;
import com.finance.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 统计服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class StatisticsServiceImpl implements StatisticsService {

    private final TransactionMapper transactionMapper;

    private static final String[] WEEK_DAY_NAMES = {"周日", "周一", "周二", "周三", "周四", "周五", "周六"};
    private static final String[] MONTH_NAMES = {"1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"};

    @Override
    public MonthlyStatisticsDTO getMonthlyStatistics() {
        Long userId = UserContext.getUserId();
        LocalDate now = LocalDate.now();

        // 本月开始和结束日期
        LocalDate firstDayOfMonth = now.withDayOfMonth(1);
        LocalDate today = now;

        // 上月开始和结束日期
        LocalDate firstDayOfLastMonth = firstDayOfMonth.minusMonths(1);
        LocalDate lastDayOfLastMonth = firstDayOfMonth.minusDays(1);

        // 本月总支出
        BigDecimal monthTotal = transactionMapper.getTotalByTypeAndDateRange(
                userId, "expense", firstDayOfMonth, today);
        if (monthTotal == null) monthTotal = BigDecimal.ZERO;

        // 本月记账天数
        Integer recordDays = transactionMapper.getRecordDays(userId, firstDayOfMonth, today);
        if (recordDays == null || recordDays == 0) recordDays = 1;

        // 上月总支出
        BigDecimal lastMonthTotal = transactionMapper.getTotalByTypeAndDateRange(
                userId, "expense", firstDayOfLastMonth, lastDayOfLastMonth);
        if (lastMonthTotal == null) lastMonthTotal = BigDecimal.ZERO;

        // 计算日均
        BigDecimal dailyAverage = monthTotal.divide(BigDecimal.valueOf(recordDays), 2, RoundingMode.HALF_UP);

        // 计算环比变化
        int monthChange = 0;
        String monthChangeType = "same";
        if (lastMonthTotal.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal change = monthTotal.subtract(lastMonthTotal).divide(lastMonthTotal, 4, RoundingMode.HALF_UP);
            monthChange = change.abs().multiply(BigDecimal.valueOf(100)).intValue();
            monthChangeType = change.compareTo(BigDecimal.ZERO) > 0 ? "up" : change.compareTo(BigDecimal.ZERO) < 0 ? "down" : "same";
        }

        return MonthlyStatisticsDTO.builder()
                .monthTotal(monthTotal)
                .recordDays(recordDays)
                .dailyAverage(dailyAverage)
                .lastMonthTotal(lastMonthTotal)
                .monthChange(monthChange)
                .monthChangeType(monthChangeType)
                .build();
    }

    @Override
    public CategoryDistributionDTO getCategoryDistribution() {
        Long userId = UserContext.getUserId();
        LocalDate firstDayOfMonth = LocalDate.now().withDayOfMonth(1);
        LocalDate today = LocalDate.now();

        List<Map<String, Object>> stats = transactionMapper.getCategoryExpenseByDateRange(userId, firstDayOfMonth, today);

        BigDecimal total = BigDecimal.ZERO;
        List<CategoryStatDTO> categories = new ArrayList<>();

        for (Map<String, Object> stat : stats) {
            BigDecimal catTotal = stat.get("total") != null ? new BigDecimal(stat.get("total").toString()) : BigDecimal.ZERO;
            total = total.add(catTotal);

            categories.add(CategoryStatDTO.builder()
                    .id(Long.valueOf(stat.get("id").toString()))
                    .name((String) stat.get("name"))
                    .icon((String) stat.get("icon"))
                    .color((String) stat.get("color"))
                    .amount(catTotal)
                    .percentage(0) // 先占位，后面计算
                    .build());
        }

        // 计算百分比
        final BigDecimal finalTotal = total;
        categories.forEach(cat -> {
            if (finalTotal.compareTo(BigDecimal.ZERO) > 0) {
                cat.setPercentage(cat.getAmount().divide(finalTotal, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100)).intValue());
            }
        });

        // 按金额排序
        categories.sort((a, b) -> b.getAmount().compareTo(a.getAmount()));

        return CategoryDistributionDTO.builder()
                .categories(categories)
                .total(total)
                .build();
    }

    @Override
    public List<DailyTrendDTO> getWeeklyTrend() {
        Long userId = UserContext.getUserId();
        LocalDate today = LocalDate.now();
        LocalDate weekAgo = today.minusDays(6);

        List<Map<String, Object>> dailyStats = transactionMapper.getDailyExpenseTrend(userId, weekAgo, today);

        // 转换为map便于查找
        Map<String, BigDecimal> statMap = dailyStats.stream()
                .collect(Collectors.toMap(
                        m -> m.get("trans_date").toString(),
                        m -> new BigDecimal(m.get("total").toString())
                ));

        List<DailyTrendDTO> trend = new ArrayList<>();
        BigDecimal maxAmount = BigDecimal.ZERO;

        for (int i = 0; i < 7; i++) {
            LocalDate date = weekAgo.plusDays(i);
            String dateStr = date.toString();
            BigDecimal amount = statMap.getOrDefault(dateStr, BigDecimal.ZERO);

            if (amount.compareTo(maxAmount) > 0) {
                maxAmount = amount;
            }

            trend.add(DailyTrendDTO.builder()
                    .date(dateStr)
                    .dayName(WEEK_DAY_NAMES[date.getDayOfWeek().getValue() % 7])
                    .amount(amount)
                    .heightPercent(0) // 先占位
                    .build());
        }

        // 计算高度百分比
        final BigDecimal finalMax = maxAmount;
        trend.forEach(day -> {
            if (finalMax.compareTo(BigDecimal.ZERO) > 0) {
                day.setHeightPercent(day.getAmount().divide(finalMax, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100)).intValue());
            }
        });

        return trend;
    }

    @Override
    public List<MonthlyTrendDTO> getYearlyTrend() {
        Long userId = UserContext.getUserId();
        LocalDate startDate = LocalDate.of(2026, 1, 1);
        LocalDate endDate = LocalDate.of(2026, 12, 31);

        List<Map<String, Object>> monthlyStats = transactionMapper.getMonthlyTrend(userId, startDate, endDate);

        // 转换为map，使用merge函数处理同一月的多条记录
        Map<String, BigDecimal[]> statMap = new java.util.HashMap<>();
        for (Map<String, Object> stat : monthlyStats) {
            String month = (String) stat.get("month");
            String type = (String) stat.get("type");
            BigDecimal amount = new BigDecimal(stat.get("total").toString());
            statMap.compute(month, (k, existing) -> {
                BigDecimal[] arr = existing != null ? existing : new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO};
                if ("expense".equals(type)) {
                    arr[0] = amount;
                } else if ("income".equals(type)) {
                    arr[1] = amount;
                }
                return arr;
            });
        }

        List<MonthlyTrendDTO> trend = new ArrayList<>();
        BigDecimal maxValue = BigDecimal.ONE;

        for (int month = 1; month <= 12; month++) {
            String monthStr = String.format("2026-%02d", month);

            BigDecimal[] data = statMap.getOrDefault(monthStr, new BigDecimal[]{BigDecimal.ZERO, BigDecimal.ZERO});
            BigDecimal expense = data[0];
            BigDecimal income = data[1];

            if (expense.compareTo(maxValue) > 0) maxValue = expense;
            if (income.compareTo(maxValue) > 0) maxValue = income;

            trend.add(MonthlyTrendDTO.builder()
                    .month(monthStr)
                    .monthName(MONTH_NAMES[month - 1])
                    .expense(expense)
                    .income(income)
                    .expenseHeight(0)
                    .incomeHeight(0)
                    .build());
        }

        // 计算高度百分比
        final BigDecimal finalMax = maxValue;
        trend.forEach(m -> {
            m.setExpenseHeight(m.getExpense().divide(finalMax, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)).intValue());
            m.setIncomeHeight(m.getIncome().divide(finalMax, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)).intValue());
        });

        return trend;
    }
}
