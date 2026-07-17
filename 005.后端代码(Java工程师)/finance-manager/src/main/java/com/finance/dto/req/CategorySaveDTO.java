package com.finance.dto.req;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 分类保存请求DTO
 */
@Data
public class CategorySaveDTO {

    @NotBlank(message = "分类类型不能为空")
    private String type;

    @NotBlank(message = "分类名称不能为空")
    @Size(max = 20, message = "分类名称不能超过20字符")
    private String name;

    @NotBlank(message = "请选择分类图标")
    private String icon;

    @NotBlank(message = "请选择分类颜色")
    private String color;
}
