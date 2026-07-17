package com.finance.dto.resp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 登录响应DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginRespDTO {

    private String token;

    private Long userId;

    private String username;

    /**
     * 过期时间(秒)
     */
    private Integer expiresIn;
}
