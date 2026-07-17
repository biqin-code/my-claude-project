package com.finance.dto.req;

import lombok.Data;

/**
 * 交易记录查询DTO
 */
@Data
public class TransactionQueryDTO {

    private String type;

    private Long categoryId;

    private String startDate;

    private String endDate;

    private String keyword;

    private Integer page = 1;

    private Integer pageSize = 10;
}
