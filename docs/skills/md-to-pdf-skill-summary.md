# Markdown转PDF工具 创建总结

## 完成时间
2026-02-03

## 工具信息

**名称**: md-to-pdf
**版本**: v1.0.0
**位置**: `scripts/md-to-pdf/`
**文档**: `docs/skills/md-to-pdf-skill-summary.md`

## 文件结构

```
scripts/md-to-pdf/
├── skill.json      # 工具配置文件
├── index.js        # 实现脚本
└── README.md       # 使用说明

docs/skills/
└── md-to-pdf-skill-summary.md  # 创建总结文档
```

## 核心功能

1. **Markdown转PDF转换**
   - 使用md-to-pdf库和Chrome渲染引擎
   - 生成高质量PDF文档

2. **中文优化**
   - 支持中文字体（PingFang SC、Microsoft YaHei）
   - 优化中文排版和行间距

3. **样式定制**
   - 适合简历等正式文档
   - A4纸张，合理边距
   - 所有链接可点击

4. **灵活使用**
   - 支持自定义输出路径
   - 自动创建输出目录
   - 清晰的错误提示

## 使用方式

### 方式1：命令行直接调用

```bash
node scripts/md-to-pdf/index.js 输入文件.md [输出文件.pdf]
```

### 方式2：在Claude Code中调用

告诉Claude：
- "使用md-to-pdf转换这个文件"
- "把STANDARD-RESUME.md转成PDF"
- "生成简历的PDF版本"

### 方式3：添加到package.json scripts

```json
{
  "scripts": {
    "pdf": "node scripts/md-to-pdf/index.js"
  }
}
```

然后使用：`npm run pdf docs/resume.md`

## 测试结果

✅ 测试通过
- 输入：docs/career/STANDARD-RESUME.md
- 输出：docs/career/STANDARD-RESUME.pdf
- 文件大小：490KB
- 页数：2页

## 技术栈

- **md-to-pdf**: 核心转换库
- **Puppeteer**: Chrome渲染引擎
- **Node.js**: 运行环境
- **Google Chrome**: PDF生成器

## 优势

1. **可复用性**: 一次创建，随时使用
2. **自动化**: 无需手动操作，命令行完成
3. **一致性**: 每次生成样式统一
4. **可定制**: CSS样式可根据需求调整
5. **版本控制**: skill文件纳入git管理

## 后续优化建议

1. 支持更多样式模板（简历、文档、报告等）
2. 添加页眉页脚选项
3. 支持水印功能
4. 批量转换多个文件
5. 支持自定义字体
6. 添加PDF元数据（作者、标题等）

## 相关命令

```bash
# 查看工具列表
ls scripts/

# 查看工具文档
cat scripts/md-to-pdf/README.md

# 运行工具
node scripts/md-to-pdf/index.js <input.md>

# 测试工具
node scripts/md-to-pdf/index.js docs/career/STANDARD-RESUME.md
```

## 经验总结

1. **工具结构化**: 使用skill.json、实现脚本、README三件套
2. **用户友好**: 提供清晰的使用说明和错误提示
3. **样式优化**: 针对中文和简历场景优化
4. **路径处理**: 支持相对路径和绝对路径
5. **错误处理**: 完善的错误检查和提示

这个工具将大大提高后续Markdown转PDF的效率！
