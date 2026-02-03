# Markdown转PDF Skill

将Markdown文件转换为格式优美的PDF文档。

## 功能特点

- ✅ 支持中文字体（PingFang SC、Microsoft YaHei）
- ✅ 优化的排版样式，适合简历等文档
- ✅ 支持所有Markdown语法（标题、列表、链接、代码块等）
- ✅ 所有链接可点击
- ✅ A4纸张尺寸，合理的边距
- ✅ 自动处理输出路径

## 使用方法

### 基本用法

```bash
# 转换Markdown文件为PDF（输出到同目录）
node scripts/md-to-pdf/index.js 文件.md

# 指定输出路径
node scripts/md-to-pdf/index.js 输入.md 输出.pdf
```

### 示例

```bash
# 转换简历
node scripts/md-to-pdf/index.js docs/career/STANDARD-RESUME.md

# 指定输出目录
node scripts/md-to-pdf/index.js docs/career/STANDARD-RESUME.md output/resume.pdf
```

## 在Claude Code中使用

当你需要将Markdown转PDF时，只需告诉Claude：

```
"请使用md-to-pdf skill将STANDARD-RESUME.md转换为PDF"
```

或者：

```
"把这个markdown文件转成PDF"
```

Claude会自动调用这个skill完成转换。

## 依赖

- Node.js >= 18.17.0
- md-to-pdf（项目已安装）
- Google Chrome（用于渲染PDF）

## 样式配置

默认样式已针对中文简历优化：
- 字体大小：13px
- 行高：1.5
- 页面宽度：750px
- 标题层级清晰
- 链接保持蓝色可点击

如需自定义样式，可修改 `index.js` 中的 CSS 部分。

## 技术说明

本skill使用：
- `md-to-pdf`：Markdown转PDF核心库
- `puppeteer`：通过Chrome渲染引擎生成高质量PDF
- 自定义CSS：优化中文显示和打印效果

## 更新记录

### v1.0.0 (2026-02-03)
- 初始版本
- 支持基本Markdown转PDF功能
- 优化中文字体和排版
- 支持自定义输出路径
