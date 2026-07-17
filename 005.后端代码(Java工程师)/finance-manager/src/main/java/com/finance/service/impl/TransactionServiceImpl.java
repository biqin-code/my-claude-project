package com.finance.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.finance.common.BusinessException;
import com.finance.common.Constants;
import com.finance.context.UserContext;
import com.finance.dto.req.TransactionQueryDTO;
import com.finance.dto.req.TransactionSaveDTO;
import com.finance.dto.resp.*;
import com.finance.entity.Category;
import com.finance.entity.Transaction;
import com.finance.mapper.CategoryMapper;
import com.finance.mapper.TransactionMapper;
import com.finance.service.TransactionService;
import com.finance.utils.DateUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 交易记录服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {

    private final TransactionMapper transactionMapper;
    private final CategoryMapper categoryMapper;

    @Override
    public TodaySummaryDTO getTodaySummary() {
        Long userId = UserContext.getUserId();
        LocalDate today = LocalDate.now();

        // 获取今日支出总额
        BigDecimal total = transactionMapper.getTodayExpenseTotal(userId, today);
        if (total == null) {
            total = BigDecimal.ZERO;
        }

        // 获取今日各类别支出
        List<Map<String, Object>> categoryStats = transactionMapper.getTodayExpenseByCategory(userId, today);

        List<CategoryStatDTO> categories = new ArrayList<>();
        for (Map<String, Object> stat : categoryStats) {
            BigDecimal catTotal = stat.get("total") != null ? new BigDecimal(stat.get("total").toString()) : BigDecimal.ZERO;
            categories.add(CategoryStatDTO.builder()
                    .id(Long.valueOf(stat.get("id").toString()))
                    .name((String) stat.get("name"))
                    .icon((String) stat.get("icon"))
                    .color((String) stat.get("color"))
                    .amount(catTotal)
                    .percentage(total.compareTo(BigDecimal.ZERO) > 0
                            ? catTotal.divide(total, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100)).intValue()
                            : 0)
                    .build());
        }

        // 计算前三类占比
        int top3Percentage = categories.stream()
                .limit(3)
                .mapToInt(CategoryStatDTO::getPercentage)
                .sum();

        return TodaySummaryDTO.builder()
                .total(total)
                .date(DateUtil.formatDate(today))
                .categories(categories)
                .top3Percentage(top3Percentage)
                .build();
    }

    @Override
    public List<TransactionDTO> getRecentRecords(Integer limit) {
        Long userId = UserContext.getUserId();
        if (limit == null || limit <= 0) {
            limit = 5;
        }

        LambdaQueryWrapper<Transaction> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Transaction::getUserId, userId)
                .orderByDesc(Transaction::getTransactionDate)
                .orderByDesc(Transaction::getCreatedAt)
                .last("LIMIT " + limit);

        List<Transaction> transactions = transactionMapper.selectList(wrapper);
        return transactions.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public PageDTO<TransactionDTO> getRecords(TransactionQueryDTO query) {
        Long userId = UserContext.getUserId();

        Page<Transaction> page = new Page<>(query.getPage(), query.getPageSize());
        LambdaQueryWrapper<Transaction> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Transaction::getUserId, userId);

        if (StringUtils.hasText(query.getType())) {
            wrapper.eq(Transaction::getType, query.getType());
        }
        if (query.getCategoryId() != null) {
            wrapper.eq(Transaction::getCategoryId, query.getCategoryId());
        }
        if (StringUtils.hasText(query.getStartDate())) {
            wrapper.ge(Transaction::getTransactionDate, DateUtil.parseDate(query.getStartDate()));
        }
        if (StringUtils.hasText(query.getEndDate())) {
            wrapper.le(Transaction::getTransactionDate, DateUtil.parseDate(query.getEndDate()));
        }
        if (StringUtils.hasText(query.getKeyword())) {
            wrapper.like(Transaction::getNote, query.getKeyword());
        }

        wrapper.orderByDesc(Transaction::getTransactionDate)
                .orderByDesc(Transaction::getCreatedAt);

        Page<Transaction> result = transactionMapper.selectPage(page, wrapper);

        List<TransactionDTO> records = result.getRecords().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        return PageDTO.<TransactionDTO>builder()
                .records(records)
                .pagination(PaginationDTO.builder()
                        .currentPage((int) result.getCurrent())
                        .totalPages((int) result.getPages())
                        .total(result.getTotal())
                        .pageSize((int) result.getSize())
                        .build())
                .build();
    }

    @Override
    @Transactional
    public TransactionDTO addRecord(TransactionSaveDTO dto) {
        Long userId = UserContext.getUserId();

        // 验证分类
        Category category = categoryMapper.selectById(dto.getCategoryId());
        if (category == null || !category.getType().equals(dto.getType())) {
            throw new BusinessException("分类不存在");
        }

        // 构建金额
        BigDecimal amount = dto.getAmount();
        if (Constants.TransactionType.EXPENSE.equals(dto.getType())) {
            amount = amount.negate();
        }

        // 创建记录
        Transaction transaction = new Transaction();
        transaction.setUserId(userId);
        transaction.setType(dto.getType());
        transaction.setAmount(amount);
        transaction.setCategoryId(dto.getCategoryId());
        transaction.setNote(dto.getNote());
        transaction.setPaymentMethod(dto.getPaymentMethod());
        transaction.setTransactionDate(LocalDate.now());
        transactionMapper.insert(transaction);

        log.info("添加交易记录成功: {}", transaction.getId());
        return toDTO(transaction);
    }

    @Override
    public List<CategoryDTO> getCategories(String type) {
        Long userId = UserContext.getUserId();
        List<Category> categories;
        if (type == null || type.isEmpty()) {
            // 当未指定类型时，返回所有系统分类 + 当前用户的自定义分类
            categories = categoryMapper.selectList(
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<Category>()
                    .eq(Category::getIsSystem, 1)
                    .or()
                    .eq(Category::getUserId, userId)
                    .orderByAsc(Category::getSortOrder)
            );
        } else {
            // 指定类型：返回系统分类 + 当前用户的自定义分类
            categories = categoryMapper.selectList(
                new com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper<Category>()
                    .eq(Category::getType, type)
                    .and(w -> w.eq(Category::getIsSystem, 1).or().eq(Category::getUserId, userId))
                    .orderByAsc(Category::getSortOrder)
            );
        }
        return categories.stream()
                .map(c -> CategoryDTO.builder()
                        .id(c.getId())
                        .type(c.getType())
                        .name(c.getName())
                        .icon(c.getIcon())
                        .color(c.getColor())
                        .isSystem(c.getIsSystem() == 1)
                        .isCustom(c.getUserId() != null)
                        .build())
                .collect(Collectors.toList());
    }

    private TransactionDTO toDTO(Transaction transaction) {
        Category category = categoryMapper.selectById(transaction.getCategoryId());
        return TransactionDTO.builder()
                .id(transaction.getId())
                .type(transaction.getType())
                .amount(transaction.getAmount().abs())
                .note(transaction.getNote())
                .paymentMethod(transaction.getPaymentMethod())
                .transactionDate(transaction.getTransactionDate())
                .createdAt(transaction.getCreatedAt())
                .category(CategoryDTO.builder()
                        .id(category != null ? category.getId() : null)
                        .name(category != null ? category.getName() : null)
                        .icon(category != null ? category.getIcon() : null)
                        .color(category != null ? category.getColor() : null)
                        .build())
                .build();
    }
}
