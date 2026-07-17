package com.finance.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.finance.common.BusinessException;
import com.finance.context.UserContext;
import com.finance.dto.req.CategorySaveDTO;
import com.finance.dto.resp.CategoryDTO;
import com.finance.entity.Category;
import com.finance.mapper.CategoryMapper;
import com.finance.mapper.TransactionMapper;
import com.finance.service.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 分类服务实现
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryMapper categoryMapper;
    private final TransactionMapper transactionMapper;

    @Override
    public List<CategoryDTO> getAllCategories(String type) {
        Long userId = UserContext.getUserId();
        List<Category> categories;

        if (type != null && !type.isEmpty()) {
            // 指定类型：返回系统分类 + 当前用户的自定义分类
            categories = categoryMapper.findAllByTypeAndUserId(type, userId);
        } else {
            // 未指定类型：返回所有系统分类 + 当前用户的自定义分类
            categories = categoryMapper.selectList(
                new LambdaQueryWrapper<Category>()
                    .eq(Category::getIsSystem, 1)
                    .or()
                    .eq(Category::getUserId, userId)
                    .orderByAsc(Category::getSortOrder)
            );
        }

        return categories.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CategoryDTO addCategory(CategorySaveDTO dto) {
        Long userId = UserContext.getUserId();

        // 检查是否已存在同名分类
        Long count = categoryMapper.selectCount(new LambdaQueryWrapper<Category>()
                .eq(Category::getName, dto.getName())
                .eq(Category::getType, dto.getType())
                .and(w -> w.eq(Category::getIsSystem, 1).or().eq(Category::getUserId, userId)));
        if (count > 0) {
            throw new BusinessException("该分类已存在");
        }

        // 获取最大排序号
        Long typeCount = categoryMapper.selectCount(new LambdaQueryWrapper<Category>()
                .eq(Category::getType, dto.getType()));
        Integer maxOrder = typeCount.intValue() + 1;

        // 创建分类
        Category category = new Category();
        category.setType(dto.getType());
        category.setName(dto.getName());
        category.setIcon(dto.getIcon());
        category.setColor(dto.getColor());
        category.setIsSystem(0);
        category.setUserId(userId);
        category.setSortOrder(maxOrder);
        categoryMapper.insert(category);

        log.info("添加分类成功: {}", dto.getName());
        return toDTO(category);
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        Long userId = UserContext.getUserId();

        Category category = categoryMapper.selectById(id);
        if (category == null) {
            throw new BusinessException("分类不存在");
        }

        // 检查是否是系统分类
        if (category.getIsSystem() == 1) {
            throw new BusinessException("系统分类不能删除");
        }

        // 检查是否是当前用户的分类
        if (!userId.equals(category.getUserId())) {
            throw new BusinessException("无权删除此分类");
        }

        // 检查是否有交易记录使用此分类
        Long transactionCount = transactionMapper.selectCount(new LambdaQueryWrapper<com.finance.entity.Transaction>()
                        .eq(com.finance.entity.Transaction::getCategoryId, id));
        if (transactionCount > 0) {
            throw new BusinessException("该分类下有交易记录，无法删除");
        }

        categoryMapper.deleteById(id);
        log.info("删除分类成功: {}", id);
    }

    @Override
    public List<CategoryDTO> getSystemCategories(String type) {
        List<Category> categories;
        if (type != null) {
            categories = categoryMapper.findAllSystemCategories(type);
        } else {
            categories = categoryMapper.selectList(new LambdaQueryWrapper<Category>()
                    .eq(Category::getIsSystem, 1));
        }

        return categories.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    private CategoryDTO toDTO(Category category) {
        return CategoryDTO.builder()
                .id(category.getId())
                .type(category.getType())
                .name(category.getName())
                .icon(category.getIcon())
                .color(category.getColor())
                .isSystem(category.getIsSystem() == 1)
                .isCustom(category.getUserId() != null)
                .build();
    }
}
