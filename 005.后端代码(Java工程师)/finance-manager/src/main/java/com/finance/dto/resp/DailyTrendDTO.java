package com.finance.dto.resp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * 每日趋势DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyTrendDTO {

    private String date;

    private String dayName;

    private BigDecimal amount;

    private Integer heightPercent;
}
