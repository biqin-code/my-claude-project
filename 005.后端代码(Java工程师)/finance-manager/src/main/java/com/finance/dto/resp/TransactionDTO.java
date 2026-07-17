package com.finance.dto.resp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 交易记录响应DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionDTO {

    private Long id;

    private String type;

    private BigDecimal amount;

    private String note;

    private String paymentMethod;

    private LocalDate transactionDate;

    private LocalDateTime createdAt;

    private CategoryDTO category;
}
