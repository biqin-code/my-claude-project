package com.finance.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.finance.entity.LoginSession;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * 登录会话Mapper
 */
@Mapper
public interface LoginSessionMapper extends BaseMapper<LoginSession> {

    @Select("SELECT * FROM login_sessions WHERE token = #{token} AND expiry_date > #{now}")
    Optional<LoginSession> findByTokenAndExpiryAfter(@Param("token") String token, @Param("now") LocalDateTime now);

    default Optional<LoginSession> findByToken(String token) {
        return findByTokenAndExpiryAfter(token, LocalDateTime.now());
    }

    @Select("DELETE FROM login_sessions WHERE token = #{token}")
    void deleteByToken(@Param("token") String token);

    @Select("DELETE FROM login_sessions WHERE user_id = #{userId}")
    void deleteByUserId(@Param("userId") Long userId);
}
