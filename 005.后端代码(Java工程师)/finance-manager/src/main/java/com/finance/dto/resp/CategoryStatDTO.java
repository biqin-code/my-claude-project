package com.finance.dto.resp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * 分类统计DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryStatDTO {

    private Long id;

    private String name;

    private String icon;

    private String color;

    private BigDecimal amount;

    private Integer percentage;
}
