package com.finance.dto.resp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 预算响应DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetDTO {

    private Long id;

    private Long categoryId;

    private String categoryName;

    private String categoryIcon;

    private String categoryColor;

    private String categoryType;

    private BigDecimal budgetAmount;

    private BigDecimal spent;

    private BigDecimal remaining;

    private Integer percentage;

    private Boolean isOverBudget;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
