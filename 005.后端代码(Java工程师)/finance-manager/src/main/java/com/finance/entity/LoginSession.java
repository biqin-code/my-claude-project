package com.finance.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * 登录会话实体类
 */
@Data
@TableName("login_sessions")
public class LoginSession implements Serializable {

    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 用户ID
     */
    private Long userId;

    /**
     * 登录Token
     */
    private String token;

    /**
     * 过期时间
     */
    private LocalDateTime expiryDate;

    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}
