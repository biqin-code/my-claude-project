package com.finance.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.finance.entity.Category;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 分类Mapper
 */
@Mapper
public interface CategoryMapper extends BaseMapper<Category> {

    @Select("SELECT * FROM categories WHERE type = #{type} AND is_system = 1 ORDER BY sort_order ASC")
    List<Category> findSystemCategoriesByType(@Param("type") String type);

    @Select("SELECT * FROM categories WHERE (is_system = 1 OR user_id = #{userId}) AND type = #{type} ORDER BY is_system DESC, sort_order ASC, id ASC")
    List<Category> findAllByTypeAndUserId(@Param("type") String type, @Param("userId") Long userId);

    @Select("SELECT * FROM categories WHERE type = #{type} AND is_system = 1 ORDER BY sort_order ASC")
    List<Category> findAllSystemCategories(@Param("type") String type);
}
