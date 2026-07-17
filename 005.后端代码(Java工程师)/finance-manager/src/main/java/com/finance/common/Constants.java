package com.finance.common;

/**
 * 业务常量类
 */
public class Constants {

    /**
     * 交易类型
     */
    public static class TransactionType {
        public static final String EXPENSE = "expense";
        public static final String INCOME = "income";
    }

    /**
     * Token过期时间 (7天)
     */
    public static final long TOKEN_EXPIRY_SECONDS = 7 * 24 * 60 * 60;

    /**
     * 默认分页大小
     */
    public static final int DEFAULT_PAGE_SIZE = 10;

    /**
     * 最大分页大小
     */
    public static final int MAX_PAGE_SIZE = 100;
}
