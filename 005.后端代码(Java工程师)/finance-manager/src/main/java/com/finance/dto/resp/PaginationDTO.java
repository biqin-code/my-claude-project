package com.finance.dto.resp;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 分页信息DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaginationDTO {

    private Integer currentPage;

    private Integer totalPages;

    private Long total;

    private Integer pageSize;
}
