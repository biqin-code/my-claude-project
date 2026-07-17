package com.finance.dto.resp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * 分类分布响应DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDistributionDTO {

    private List<CategoryStatDTO> categories;

    private BigDecimal total;
}
