package com.finance.dto.req;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 交易记录保存请求DTO
 */
@Data
public class TransactionSaveDTO {

    @NotBlank(message = "交易类型不能为空")
    private String type;

    @NotNull(message = "请选择分类")
    private Long categoryId;

    @NotNull(message = "请输入有效金额")
    @Positive(message = "请输入有效金额")
    private BigDecimal amount;

    private String note;

    private String paymentMethod;
}
