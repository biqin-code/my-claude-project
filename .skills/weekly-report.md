# 周报生成 Skill

## 用途
读取本地Git提交记录，汇总成本周工作内容，生成周报MD文档。

## 使用方式
```
/weekly-report
```
或者
```
@weekly-report [可选：YYYY-MM-DD 日期范围，默认本周]
```

## 执行步骤

### 1. 读取Git提交记录
使用Bash工具执行：
```bash
git log --format="%h|%s|%an|%ad" --date=short --since="YYYY-MM-DD" --until="YYYY-MM-DD"
```
- `since`: 开始日期
- `until`: 结束日期

### 2. 解析提交记录
- 提取 `|` 分隔的字段：提交hash、提交信息、作者、日期
- 按日期分组
- 识别功能类型（feat/fix/docs/style等）

### 3. 生成周报内容
周报格式：
```markdown
# 周报 - YYYY年MM月第X周

## 本周工作汇总
- [日期] 功能描述

## 完成的功能模块
1. 模块A
2. 模块B

## 下周工作计划
- 待完成项1
- 待完成项2

## 备注
```

### 4. 保存周报
- 文件路径: `{项目根目录}/000.文档纪要/周报_YEAR_WEEK.md`
- 例如: `周报_2026_W29.md`

## 输出
生成周报MD文档并告知用户保存路径。
