package com.finance.controller;

import com.finance.common.Result;
import com.finance.dto.req.*;
import com.finance.dto.resp.LoginRespDTO;
import com.finance.dto.resp.UserInfoDTO;
import com.finance.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 用户控制器
 */
@Tag(name = "用户管理")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @Operation(summary = "用户注册")
    @PostMapping("/register")
    public Result<UserInfoDTO> register(@Valid @RequestBody UserRegisterDTO dto) {
        return Result.success(userService.register(dto));
    }

    @Operation(summary = "用户登录")
    @PostMapping("/login")
    public Result<LoginRespDTO> login(@Valid @RequestBody UserLoginDTO dto) {
        return Result.success(userService.login(dto));
    }

    @Operation(summary = "用户登出")
    @PostMapping("/logout")
    public Result<Void> logout(@Valid @RequestBody UserLogoutDTO dto) {
        userService.logout(dto);
        return Result.success();
    }

    @Operation(summary = "获取当前用户信息")
    @GetMapping("/me")
    public Result<UserInfoDTO> getCurrentUser() {
        return Result.success(userService.getCurrentUser());
    }

    @Operation(summary = "更新用户资料")
    @PutMapping("/profile")
    public Result<UserInfoDTO> updateProfile(@Valid @RequestBody UserProfileUpdateDTO dto) {
        return Result.success(userService.updateProfile(dto));
    }

    @Operation(summary = "修改密码")
    @PutMapping("/password")
    public Result<Void> updatePassword(@Valid @RequestBody UserPasswordUpdateDTO dto) {
        userService.updatePassword(dto);
        return Result.success();
    }
}
