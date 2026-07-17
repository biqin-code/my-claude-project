package com.finance.dto.resp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * 月度统计响应DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyStatisticsDTO {

    private BigDecimal monthTotal;

    private Integer recordDays;

    private BigDecimal dailyAverage;

    private BigDecimal lastMonthTotal;

    private Integer monthChange;

    private String monthChangeType;
}
