package com.finance.interceptor;

import com.finance.common.BusinessException;
import com.finance.entity.LoginSession;
import com.finance.mapper.LoginSessionMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * 认证拦截器
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AuthInterceptor {

    private final LoginSessionMapper loginSessionMapper;

    public static final String USER_ID_KEY = "userId";

    /**
     * 从请求中获取用户ID
     */
    public Long getUserIdFromToken(String token) {
        if (token == null || token.isEmpty()) {
            throw new BusinessException(401, "未授权，请先登录");
        }

        Optional<LoginSession> sessionOpt = loginSessionMapper.findByToken(token);
        if (sessionOpt.isEmpty()) {
            throw new BusinessException(401, "Token已过期，请重新登录");
        }

        LoginSession session = sessionOpt.get();
        if (session.getExpiryDate().isBefore(java.time.LocalDateTime.now())) {
            throw new BusinessException(401, "Token已过期，请重新登录");
        }

        return session.getUserId();
    }
}
