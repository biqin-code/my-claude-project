package com.finance.service;

import com.finance.dto.req.CategorySaveDTO;
import com.finance.dto.resp.CategoryDTO;

import java.util.List;

/**
 * 分类服务接口
 */
public interface CategoryService {

    /**
     * 获取所有分类
     */
    List<CategoryDTO> getAllCategories(String type);

    /**
     * 添加自定义分类
     */
    CategoryDTO addCategory(CategorySaveDTO dto);

    /**
     * 删除自定义分类
     */
    void deleteCategory(Long id);

    /**
     * 获取系统分类
     */
    List<CategoryDTO> getSystemCategories(String type);
}
