package com.finance.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.finance.common.BusinessException;
import com.finance.common.Constants;
import com.finance.context.UserContext;
import com.finance.dto.req.*;
import com.finance.dto.resp.LoginRespDTO;
import com.finance.dto.resp.UserInfoDTO;
import com.finance.entity.LoginSession;
import com.finance.entity.User;
import com.finance.mapper.LoginSessionMapper;
import com.finance.mapper.UserMapper;
import com.finance.service.UserService;
import com.finance.utils.PasswordUtil;
import com.finance.utils.TokenUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * 用户服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;
    private final LoginSessionMapper loginSessionMapper;

    @Override
    @Transactional
    public UserInfoDTO register(UserRegisterDTO dto) {
        // 检查用户名是否存在
        Long count = userMapper.selectCount(new LambdaQueryWrapper<User>()
                .eq(User::getUsername, dto.getUsername()));
        if (count > 0) {
            throw new BusinessException("用户名已存在");
        }

        // 创建用户
        User user = new User();
        user.setUsername(dto.getUsername());
        user.setPassword(PasswordUtil.hash(dto.getPassword()));
        userMapper.insert(user);

        log.info("用户注册成功: {}", dto.getUsername());
        return UserInfoDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .build();
    }

    @Override
    @Transactional
    public LoginRespDTO login(UserLoginDTO dto) {
        // 查找用户
        String hashedPassword = PasswordUtil.hash(dto.getPassword());
        User user = userMapper.selectOne(new LambdaQueryWrapper<User>()
                .eq(User::getUsername, dto.getUsername())
                .eq(User::getPassword, hashedPassword));

        if (user == null) {
            throw new BusinessException(401, "用户名或密码错误");
        }

        // 删除旧会话
        loginSessionMapper.deleteByUserId(user.getId());

        // 创建新会话
        String token = TokenUtil.generateToken();
        LoginSession session = new LoginSession();
        session.setUserId(user.getId());
        session.setToken(token);
        session.setExpiryDate(LocalDateTime.now().plusSeconds(Constants.TOKEN_EXPIRY_SECONDS));
        loginSessionMapper.insert(session);

        log.info("用户登录成功: {}", dto.getUsername());
        return LoginRespDTO.builder()
                .token(token)
                .userId(user.getId())
                .username(user.getUsername())
                .expiresIn((int) Constants.TOKEN_EXPIRY_SECONDS)
                .build();
    }

    @Override
    @Transactional
    public void logout(UserLogoutDTO dto) {
        loginSessionMapper.deleteByToken(dto.getToken());
        log.info("用户登出成功");
    }

    @Override
    public UserInfoDTO getCurrentUser() {
        Long userId = UserContext.getUserId();
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        return UserInfoDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }

    @Override
    @Transactional
    public UserInfoDTO updateProfile(UserProfileUpdateDTO dto) {
        Long userId = UserContext.getUserId();
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }

        // 检查用户名是否被其他用户使用
        if (dto.getUsername() != null && !dto.getUsername().equals(user.getUsername())) {
            Long count = userMapper.selectCount(new LambdaQueryWrapper<User>()
                    .eq(User::getUsername, dto.getUsername())
                    .ne(User::getId, userId));
            if (count > 0) {
                throw new BusinessException("用户名已被使用");
            }
            user.setUsername(dto.getUsername());
        }

        // 检查邮箱是否被其他用户使用
        if (dto.getEmail() != null && !dto.getEmail().equals(user.getEmail())) {
            Long count = userMapper.selectCount(new LambdaQueryWrapper<User>()
                    .eq(User::getEmail, dto.getEmail())
                    .ne(User::getId, userId));
            if (count > 0) {
                throw new BusinessException("邮箱已被使用");
            }
            user.setEmail(dto.getEmail());
        }

        if (dto.getAvatarUrl() != null) {
            user.setAvatarUrl(dto.getAvatarUrl());
        }
        if (dto.getNickname() != null) {
            user.setNickname(dto.getNickname());
        }

        userMapper.updateById(user);
        log.info("用户资料更新成功: {}", userId);

        return UserInfoDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }

    @Override
    @Transactional
    public void updatePassword(UserPasswordUpdateDTO dto) {
        Long userId = UserContext.getUserId();
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }

        // 验证原密码
        if (!PasswordUtil.verify(dto.getOldPassword(), user.getPassword())) {
            throw new BusinessException(401, "原密码错误");
        }

        // 更新密码
        user.setPassword(PasswordUtil.hash(dto.getNewPassword()));
        userMapper.updateById(user);
        log.info("用户密码修改成功: {}", userId);
    }
}
