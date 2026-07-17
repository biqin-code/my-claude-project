package com.finance.dto.resp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * 今日汇总响应DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TodaySummaryDTO {

    private BigDecimal total;

    private String date;

    private List<CategoryStatDTO> categories;

    private Integer top3Percentage;
}
