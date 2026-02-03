# Markdown转PDF工具 - 快速参考

## 📍 工具位置

```
scripts/md-to-pdf/
├── index.js       # 主程序
├── skill.json     # 配置文件
└── README.md      # 详细文档
```

## 🚀 三种使用方式

### 1️⃣ npm命令（推荐）

最简单的方式，已添加到package.json：

```bash
npm run pdf docs/career/STANDARD-RESUME.md
npm run pdf 输入文件.md 输出文件.pdf
```

### 2️⃣ Node命令

直接运行脚本：

```bash
node scripts/md-to-pdf/index.js docs/career/STANDARD-RESUME.md
node scripts/md-to-pdf/index.js 输入.md 输出.pdf
```

### 3️⃣ 通过Claude Code

告诉Claude：
- "用md-to-pdf转换简历"
- "把这个markdown生成PDF"
- "生成PDF版本的简历"

## ✨ 功能特性

- ✅ **中文优化** - PingFang SC、Microsoft YaHei字体
- ✅ **A4格式** - 适合打印，边距合理
- ✅ **可点击链接** - 邮箱、网址都可点击
- ✅ **自动路径** - 不指定输出路径时自动生成
- ✅ **样式优美** - 针对简历等文档优化

## 📝 常用场景

### 简历转换
```bash
npm run pdf docs/career/STANDARD-RESUME.md
# 输出: docs/career/STANDARD-RESUME.pdf
```

### 文档导出
```bash
npm run pdf docs/README.md output/readme.pdf
# 输出: output/readme.pdf
```

### 批量转换
```bash
for file in docs/*.md; do
  npm run pdf "$file"
done
```

## 🎨 样式说明

默认样式配置（在index.js中）：
- 字体大小：13px
- 行高：1.5
- 页面宽度：750px
- 页边距：18mm

如需调整样式，编辑 `scripts/md-to-pdf/index.js` 中的 CSS 部分。

## 📊 输出示例

```bash
📄 输入文件: /path/to/STANDARD-RESUME.md
📋 输出文件: /path/to/STANDARD-RESUME.pdf
🔄 正在转换...

✅ PDF生成成功！
📊 文件大小: 490.18 KB
📍 保存位置: /path/to/STANDARD-RESUME.pdf
```

## 🔧 依赖要求

- Node.js >= 18.17.0（项目已配置）
- md-to-pdf（已安装在devDependencies）
- Google Chrome（系统已安装）

## 📚 相关文档

- 详细文档：`scripts/md-to-pdf/README.md`
- 创建总结：`docs/skills/md-to-pdf-skill-summary.md`
- 项目文档：`CONTEXT.md`

## ⚡ 快捷命令

```bash
# 查看工具列表
ls scripts/

# 查看帮助信息
node scripts/md-to-pdf/index.js

# 快速测试
npm run pdf docs/career/STANDARD-RESUME.md
```

---

**创建日期**: 2026-02-03
**版本**: v1.0.0
**维护**: 已集成到项目工具链
