package com.finance.dto.req;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * 用户资料更新请求DTO
 */
@Data
public class UserProfileUpdateDTO {

    @Size(min = 4, max = 20, message = "用户名需为4-20位字母或数字")
    @Pattern(regexp = "^[a-zA-Z0-9]+$", message = "用户名需为4-20位字母或数字")
    private String username;

    @Pattern(regexp = "^\\s*\\w+@\\w+\\.\\w+\\s*$", message = "邮箱格式错误")
    private String email;

    private String avatarUrl;

    private String nickname;
}
