package com.finance.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 分类实体类
 */
@Data
@TableName("categories")
public class Category implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 类型: expense-支出, income-收入
     */
    private String type;

    /**
     * 分类名称
     */
    private String name;

    /**
     * 图标
     */
    private String icon;

    /**
     * 颜色
     */
    private String color;

    /**
     * 是否系统分类: 0-否, 1-是
     */
    private Integer isSystem;

    /**
     * 创建用户ID (自定义分类)
     */
    private Long userId;

    /**
     * 排序
     */
    private Integer sortOrder;

    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
