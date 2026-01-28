# 项目上下文索引 v2.0

## 🎯 当前版本状态
- **版本**: v2.0
- **最后更新**: 2026-01-28
- **Git Commit**: 864e649
- **工作阶段**: P0/P1完成，P2方案A完成 ✅

## 📋 快速链接
- [完整上下文] → docs/snapshots/v2.0-SNAPSHOT.md
- [待办事项] → docs/planning/TODO-P1-P2-Skills.md
- [最近变更] → docs/CHANGELOG.md
- [版本发布说明] → docs/releases/v2.0/RELEASE.md
- [项目交接文档] → PROJECT_HANDOVER.md (精简版)

## 🔧 技术栈概要
- **前端**: Next.js 16.1.4 + React 19 + TypeScript 5.x
- **UI框架**: Tailwind CSS + Font Awesome + Recharts
- **状态管理**: React Hooks + LocalStorage (无后端)
- **构建工具**: Turbopack

## 📊 核心指标
- **总代码**: ~12700行 (+700行，P1+P2新增)
- **Skills数量**: 15个 (P0:3个 + P1:3个 + 原有:9个)
- **文档总量**: 6400行 (+1700行，P1+P2新增)
- **功能模块**: 健康度监控、任务管理、知识库、现场巡店

## 🚀 快速启动
```bash
cd /Users/heyuxuan/Desktop/Mall\ Operation\ Agent/mall-operation-system
npm run dev  # 访问 http://localhost:3000
```

## ⚠️ 当前关注点
- [x] 执行P1任务 (提取4个Skills，已完成 ✅)
- [x] 执行P2方案A (统一导出+开发规范，已完成 ✅)
- [ ] 可选：P2任务7 (补充6个Skills文档)
- [ ] 优化移动端性能
- [ ] 准备V2.1迭代规划

## 📚 文档结构说明
- `CONTEXT.md` (本文件) - 快速索引，极低token消耗 (<200 tokens)
- `docs/snapshots/` - 版本快照，精简版本全貌 (~400行/版本)
- `docs/` - 详细文档，按功能分类，按需加载

## 🏗️ 核心模块
- **app/health/** - 健康度监控 (5维度评估 + 趋势预测)
- **app/tasks/** - 任务管理 (全生命周期 + 工作流模板)
- **app/knowledge/** - 知识库 (案例沉淀 + 智能搜索)
- **app/inspection/** - 现场巡店 ⭐v2.0新增 (5大工具包)
- **skills/** - 业务技能模块 (AI诊断、趋势预测等)

## 🎯 版本演进
- **v1.0** (2026-01-23) - 基础功能实现 (15 features)
- **v1.1** (2026-01-24) - UI/UX优化 + Bug修复
- **v2.0** (2026-01-28) - 现场巡店 + 5等级风险标准 + Skills提取

---

**📖 需要更多上下文？** 读取 `docs/snapshots/v2.0-SNAPSHOT.md` (<1000 tokens)
**🔍 查找特定功能？** 查看 `docs/INDEX.md` 获取完整文档索引
