package com.finance.controller;

import com.finance.common.Result;
import com.finance.dto.req.TransactionQueryDTO;
import com.finance.dto.req.TransactionSaveDTO;
import com.finance.dto.resp.*;
import com.finance.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 交易记录控制器
 */
@Tag(name = "交易记录")
@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @Operation(summary = "获取今日汇总")
    @GetMapping("/today-summary")
    public Result<TodaySummaryDTO> getTodaySummary() {
        return Result.success(transactionService.getTodaySummary());
    }

    @Operation(summary = "获取最近记录")
    @GetMapping("/recent")
    public Result<List<TransactionDTO>> getRecentRecords(@RequestParam(defaultValue = "5") Integer limit) {
        return Result.success(transactionService.getRecentRecords(limit));
    }

    @Operation(summary = "分页获取所有记录")
    @GetMapping
    public Result<PageDTO<TransactionDTO>> getRecords(TransactionQueryDTO query) {
        return Result.success(transactionService.getRecords(query));
    }

    @Operation(summary = "添加新记录")
    @PostMapping
    public Result<TransactionDTO> addRecord(@Valid @RequestBody TransactionSaveDTO dto) {
        return Result.success("记录添加成功", transactionService.addRecord(dto));
    }

    @Operation(summary = "获取所有分类")
    @GetMapping("/categories")
    public Result<List<CategoryDTO>> getCategories(@RequestParam(required = false) String type) {
        return Result.success(transactionService.getCategories(type));
    }
}
