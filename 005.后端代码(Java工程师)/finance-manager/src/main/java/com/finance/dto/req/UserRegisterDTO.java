package com.finance.dto.req;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 用户注册请求DTO
 */
@Data
public class UserRegisterDTO {

    @NotBlank(message = "用户名不能为空")
    @Size(min = 4, max = 20, message = "用户名需为4-20位字母或数字")
    @Pattern(regexp = "^[a-zA-Z0-9]+$", message = "用户名需为4-20位字母或数字")
    private String username;

    @NotBlank(message = "密码不能为空")
    @Size(min = 6, message = "密码需6位以上")
    private String password;
}
