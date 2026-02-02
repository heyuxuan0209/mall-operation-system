# 项目上下文索引 v[版本号]

## 🎯 当前版本状态
- 版本: v[填写版本号，例如：v2.0]
- 最后更新: [填写日期，例如：2026-01-28]
- Git Commit: [运行命令获取：git rev-parse --short HEAD]
- 工作阶段: [填写当前阶段，例如：开发中/测试中/已上线/P0完成]

## 📋 快速链接
- [完整上下文] → docs/snapshots/v[版本号]-SNAPSHOT.md
- [待办事项] → docs/planning/TODO.md
- [最近变更] → docs/CHANGELOG.md

## 🔧 技术栈（5行概要）
[填写你的技术栈，例如：]
- 前端: Next.js 16 + TypeScript
- 样式: Tailwind CSS
- 状态管理: React Hooks + Context
- 存储: LocalStorage
- AI辅助: Claude Sonnet 4.5

## 📊 核心指标
- 总代码: [统计代码行数，运行：find . -name "*.ts" -o -name "*.tsx" | xargs wc -l | tail -1]
- 功能模块: [数一下有几个主要功能模块]
- 文档总量: [统计文档行数，运行：find docs -name "*.md" -exec wc -l {} + | tail -1]
- [可选：Skills数量、API数量等其他指标]

## 🚀 快速启动
[填写启动命令，例如：]
```bash
npm install           # 安装依赖
npm run dev          # 启动开发服务器
# 访问 http://localhost:3000
```

## ⚠️ 当前关注点
[列出当前最重要的2-3个待办事项]
- [ ] [当前要做的第一件事]
- [ ] [当前要做的第二件事]
- [ ] [当前要做的第三件事]

---

## 📝 使用说明

### 什么时候更新这个文件？
- ✅ 每次版本发布时（更新版本号、日期、Commit）
- ✅ 当前关注点发生变化时
- ✅ 技术栈发生重大变更时
- ❌ 不需要每天更新（保持稳定）

### 如何保持精简？
- 目标行数: < 100行
- 目标Token: < 500 tokens
- 只保留最核心信息
- 细节信息用快速链接指向详细文档

### 验证方法
```bash
# 检查行数
wc -l CONTEXT.md
# 目标: < 100行

# 估算Token（粗略估算：单词数 × 1.3）
wc -w CONTEXT.md | awk '{print $1 * 1.3}'
# 目标: < 500 tokens
```

---

**模板版本**: v1.0
**创建日期**: 2026-01-28
**适用于**: 所有AI辅助开发项目
