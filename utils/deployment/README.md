# Deployment Skills 部署技能模块

这个目录包含两个核心部署Skills，用于简化Next.js项目的生产环境配置和部署流程。

---

## 📦 技能列表

### Skill 1: Production Config Generator（生产配置生成器）

**功能**：自动生成完整的生产环境配置文件

**使用方式**：
```bash
npm run init:production
```

**生成的文件**：
1. `next.config.ts` - Next.js生产优化配置
   - 禁用Source Maps（代码保护）
   - 移除console.log（生产优化）
   - 移除X-Powered-By header（安全增强）

2. `.env.production` - 生产环境变量模板
   - NEXT_PUBLIC_ENV=production
   - NEXT_PUBLIC_DEMO_MODE=true
   - 其他自定义变量占位符

3. `.vercelignore` - Vercel部署排除文件
   - 采用最佳实践（避免过度配置）
   - 只排除必要的文件（docs/、IDE配置等）

4. `package.json` - 自动添加engines字段
   - 指定Node.js版本要求（>=18.17.0）

**特性**：
- ✅ 智能跳过已存在的文件（避免覆盖）
- ✅ 提供清晰的下一步操作指引
- ✅ 基于最佳实践的配置模板

---

### Skill 2: Deployment Readiness Checker（部署就绪检查器）

**功能**：部署前全面检查所有配置和构建状态

**使用方式**：
```bash
npm run check:deploy
```

**检查项目**：
1. ✅ `next.config.ts` 生产优化配置
2. ✅ `.env.production` 环境变量文件
3. ✅ `package.json` engines字段
4. ✅ `.vercelignore` 配置合理性
5. ✅ `package-lock.json` 有效性
6. ✅ `npm run build` 构建成功
7. ✅ Git仓库状态（是否有未提交文件）
8. ✅ 环境变量提醒（需在Vercel中添加）

**输出**：
- 生成详细的部署检查报告
- 标注错误、警告和信息
- 提供修复建议
- 判断是否可以部署（ready/warning/blocked）

**退出码**：
- `0` - 所有检查通过或仅有警告
- `1` - 存在错误，必须修复

---

## 🚀 完整使用流程

### 场景1: 新项目初次部署

```bash
# 1. 生成生产配置
npm run init:production

# 2. 根据项目需求修改 .env.production

# 3. 运行部署检查
npm run check:deploy

# 4. 如果检查通过，提交代码
git add .
git commit -m "feat: 配置生产环境"
git push origin main

# 5. 在Vercel中部署
```

### 场景2: 现有项目部署前检查

```bash
# 直接运行检查
npm run check:deploy

# 根据报告修复问题

# 修复后再次检查
npm run check:deploy
```

---

## 📊 检查报告示例

```
🔍 开始部署前检查...

   正在执行构建测试（可能需要1-2分钟）...

============================================================
📊 部署检查报告
============================================================

✅ next.config.ts: next.config.ts 配置正确

✅ .env.production: .env.production 存在

✅ package.json: Node.js 版本要求: >=18.17.0

✅ .vercelignore: .vercelignore 配置合理

✅ package-lock.json: package-lock.json 有效

✅ npm run build: 生产构建成功

✅ Git 状态: Git 仓库干净

✅ 环境变量提醒: 需要在 Vercel Dashboard 中手动添加 3 个环境变量
   - NEXT_PUBLIC_ENV
   - NEXT_PUBLIC_DEMO_MODE
   - NEXT_PUBLIC_ENABLE_DEVTOOLS_DETECTION

============================================================
✅ 所有检查通过，可以部署！

📋 部署步骤：

1. 提交代码到 Git：
   git add .
   git commit -m "feat: 准备生产部署"
   git push origin main

2. 访问 Vercel Dashboard：https://vercel.com
3. 导入 GitHub 仓库
4. 配置环境变量（参考上面的环境变量提醒）
5. 点击 Deploy
```

---

## 🛠️ 技术实现

### 目录结构

```
utils/deployment/
├── initProductionConfig.ts          # Skill 1: 生产配置生成器
├── checkDeploymentReady.ts          # Skill 2: 部署就绪检查器
├── templates/                        # 配置模板
│   ├── next.config.template.ts      # Next.js配置模板
│   ├── env.production.template      # 环境变量模板
│   └── vercelignore.template        # Vercel排除文件模板
└── README.md                         # 本文档
```

### 技术栈

- **TypeScript** - 类型安全的脚本开发
- **Node.js fs** - 文件系统操作
- **child_process** - 执行构建命令
- **tsx** - TypeScript脚本运行器

---

## 🎯 设计原则

### 1. 智能防护
- 不覆盖已存在的文件
- 自动跳过不必要的操作
- 提供清晰的提示信息

### 2. 最佳实践
- 基于真实部署经验
- 采用行业标准配置
- 避免常见错误

### 3. 用户友好
- 清晰的输出信息
- 详细的错误提示
- 完整的下一步指引

### 4. 可扩展性
- 模块化设计
- 易于添加新检查项
- 支持自定义配置

---

## 📝 常见问题

### Q1: 为什么需要这些Skills？

**A**: 部署Next.js项目到Vercel时，需要配置多个文件并进行多项检查。手动操作容易遗漏或出错，这些Skills自动化了整个流程。

### Q2: 生成的配置文件可以修改吗？

**A**: 可以！生成的是模板文件，你可以根据项目需求自由修改。生成器会跳过已存在的文件，不会覆盖你的修改。

### Q3: 检查失败怎么办？

**A**: 查看检查报告中的详细信息和修复建议，按照提示修复问题后再次运行检查。

### Q4: 可以自定义检查项吗？

**A**: 可以！修改 `checkDeploymentReady.ts` 文件，添加自定义的检查方法即可。

### Q5: tsx是什么？为什么需要它？

**A**: tsx是一个TypeScript脚本运行器，允许直接运行.ts文件而无需先编译。它比ts-node更快更轻量。

---

## 🔄 更新日志

### v1.0.0 (2026-02-03)
- ✅ Skill 1: Production Config Generator
- ✅ Skill 2: Deployment Readiness Checker
- ✅ 完整的配置模板
- ✅ 详细的检查报告
- ✅ npm scripts集成

---

## 📖 相关文档

- [Vercel部署指南](../../VERCEL-DEPLOYMENT-GUIDE.md)
- [部署完成报告](../../DEPLOYMENT-REPORT.md)
- [Next.js生产部署文档](https://nextjs.org/docs/deployment)
- [Vercel官方文档](https://vercel.com/docs)

---

## 🤝 贡献

如果你有更好的配置建议或新的检查项，欢迎提出！

---

## 📄 许可证

本项目采用专有许可证，详见 [LICENSE.md](../../LICENSE.md)

---

**最后更新**: 2026-02-03
**版本**: v1.0.0
**维护者**: Heyuxuan
