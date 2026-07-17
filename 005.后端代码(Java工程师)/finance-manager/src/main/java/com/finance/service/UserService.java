package com.finance.service;

import com.finance.dto.req.*;
import com.finance.dto.resp.LoginRespDTO;
import com.finance.dto.resp.UserInfoDTO;

/**
 * 用户服务接口
 */
public interface UserService {

    /**
     * 用户注册
     */
    UserInfoDTO register(UserRegisterDTO dto);

    /**
     * 用户登录
     */
    LoginRespDTO login(UserLoginDTO dto);

    /**
     * 用户登出
     */
    void logout(UserLogoutDTO dto);

    /**
     * 获取当前用户信息
     */
    UserInfoDTO getCurrentUser();

    /**
     * 更新用户资料
     */
    UserInfoDTO updateProfile(UserProfileUpdateDTO dto);

    /**
     * 修改密码
     */
    void updatePassword(UserPasswordUpdateDTO dto);
}
