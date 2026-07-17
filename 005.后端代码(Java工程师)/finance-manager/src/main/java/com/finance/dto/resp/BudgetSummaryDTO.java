package com.finance.dto.resp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * 预算汇总响应DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetSummaryDTO {

    private List<BudgetDTO> budgets;

    private BudgetTotalDTO summary;
}
