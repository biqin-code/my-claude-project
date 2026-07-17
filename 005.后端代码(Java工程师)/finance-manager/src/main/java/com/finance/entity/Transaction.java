package com.finance.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 交易记录实体类
 */
@Data
@TableName("transactions")
public class Transaction implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 类型: expense-支出, income-收入
     */
    private String type;

    /**
     * 金额 (支出为负数)
     */
    private BigDecimal amount;

    /**
     * 分类ID
     */
    private Long categoryId;

    /**
     * 备注
     */
    private String note;

    /**
     * 支付方式
     */
    private String paymentMethod;

    /**
     * 交易日期
     */
    private LocalDate transactionDate;

    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
