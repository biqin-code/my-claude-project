package com.finance.service;

import com.finance.dto.req.TransactionQueryDTO;
import com.finance.dto.req.TransactionSaveDTO;
import com.finance.dto.resp.*;

import java.util.List;

/**
 * 交易记录服务接口
 */
public interface TransactionService {

    /**
     * 获取今日汇总
     */
    TodaySummaryDTO getTodaySummary();

    /**
     * 获取最近记录
     */
    List<TransactionDTO> getRecentRecords(Integer limit);

    /**
     * 分页获取记录
     */
    PageDTO<TransactionDTO> getRecords(TransactionQueryDTO query);

    /**
     * 添加记录
     */
    TransactionDTO addRecord(TransactionSaveDTO dto);

    /**
     * 获取所有分类
     */
    List<CategoryDTO> getCategories(String type);
}
