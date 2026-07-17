package com.finance.dto.resp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * 月度趋势DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyTrendDTO {

    private String month;

    private String monthName;

    private BigDecimal expense;

    private BigDecimal income;

    private Integer expenseHeight;

    private Integer incomeHeight;
}
