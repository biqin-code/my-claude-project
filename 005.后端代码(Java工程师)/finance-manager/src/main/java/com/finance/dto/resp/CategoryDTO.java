package com.finance.dto.resp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 分类响应DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDTO {

    private Long id;

    private String type;

    private String name;

    private String icon;

    private String color;

    private Boolean isSystem;

    private Boolean isCustom;
}
