package com.finance.controller;

import com.finance.common.Result;
import com.finance.dto.req.CategorySaveDTO;
import com.finance.dto.resp.CategoryDTO;
import com.finance.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 分类控制器
 */
@Tag(name = "分类管理")
@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @Operation(summary = "获取所有分类")
    @GetMapping
    public Result<List<CategoryDTO>> getAllCategories(@RequestParam(required = false) String type) {
        return Result.success(categoryService.getAllCategories(type));
    }

    @Operation(summary = "添加自定义分类")
    @PostMapping
    public Result<CategoryDTO> addCategory(@Valid @RequestBody CategorySaveDTO dto) {
        return Result.success("分类添加成功", categoryService.addCategory(dto));
    }

    @Operation(summary = "删除自定义分类")
    @DeleteMapping("/{id}")
    public Result<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return Result.success("分类删除成功");
    }
}
