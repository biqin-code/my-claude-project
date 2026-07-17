package com.finance.utils;

import java.util.UUID;

/**
 * Token工具类
 */
public class TokenUtil {

    private TokenUtil() {
    }

    /**
     * 生成随机Token
     */
    public static String generateToken() {
        return UUID.randomUUID().toString().replace("-", "");
    }
}
