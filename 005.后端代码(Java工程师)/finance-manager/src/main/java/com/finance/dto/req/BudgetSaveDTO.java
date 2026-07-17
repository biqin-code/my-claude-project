package com.finance.dto.req;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 预算保存请求DTO
 */
@Data
public class BudgetSaveDTO {

    @NotNull(message = "请选择分类")
    private Long categoryId;

    @NotNull(message = "请输入有效的预算金额")
    @Positive(message = "请输入有效的预算金额")
    private BigDecimal budgetAmount;

    @NotBlank(message = "请指定月份")
    private String budgetMonth;
}
