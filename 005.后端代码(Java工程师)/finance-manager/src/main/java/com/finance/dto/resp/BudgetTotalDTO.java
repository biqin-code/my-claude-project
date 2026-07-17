package com.finance.dto.resp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * 预算汇总信息DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetTotalDTO {

    private BigDecimal totalBudget;

    private BigDecimal totalSpent;

    private BigDecimal totalRemaining;

    private Integer overBudgetCount;

    private BigDecimal overBudgetAmount;

    private Integer usagePercentage;
}
