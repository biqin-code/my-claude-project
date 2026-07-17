package com.finance.dto.req;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 用户登出请求DTO
 */
@Data
public class UserLogoutDTO {

    @NotBlank(message = "Token不能为空")
    private String token;
}
