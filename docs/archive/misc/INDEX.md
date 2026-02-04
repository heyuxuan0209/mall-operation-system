# 文档总索引 (Documentation Index)

本文档提供项目所有文档的分类索引，帮助快速定位所需信息。

**文档体系**: 三层金字塔结构（快速索引 → 版本快照 → 详细文档）

---

## 🚀 快速开始（推荐路径）

### 新手入门
1. 📖 **首次访问** → 阅读根目录 `CONTEXT.md` (< 200 tokens)
2. 📚 **了解当前版本** → 阅读 `docs/snapshots/v2.0-SNAPSHOT.md` (< 1000 tokens)
3. 🎯 **开始开发** → 阅读 `docs/guides/quick-start.md`

### 老手恢复上下文
1. 📖 **快速恢复** → 阅读根目录 `CONTEXT.md` (5秒)
2. 📋 **查看待办** → 阅读 `docs/planning/TODO-P1-P2-Skills.md`

---

## 📂 文档结构概览

```
docs/
├── CHANGELOG.md                    # 变更日志（增量记录）
├── INDEX.md                        # 本文件 - 文档总索引
│
├── snapshots/                      # 版本快照层（精简版本全貌）
│   ├── v1.0-SNAPSHOT.md            # V1.0完整快照（~300行）
│   ├── v1.1-SNAPSHOT.md            # V1.1完整快照（~300行）
│   └── v2.0-SNAPSHOT.md            # V2.0完整快照（~400行）
│
├── business/                       # 商业文档 ⭐新增
│   └── BRD.md                      # 商业需求文档（面向决策层、投资人）
│
├── product/                        # 产品文档 ⭐新增
│   └── PRD.md                      # 产品需求文档（面向产品、开发团队）
│
├── architecture/                   # 架构文档
│   ├── skills-system.md            # Skills体系架构
│   └── react-state-best-practices.md # React状态管理最佳实践
│
├── features/                       # 功能文档（按模块）
│   └── [待创建]
│
├── api/                            # API和组件文档
│   ├── skills/                     # Skills API文档
│   └── components/                 # 组件API文档
│
├── standards/                      # 标准和规范
│   └── risk-level-standard.md      # 风险等级标准（v2.0统一）
│
├── releases/                       # 版本发布文档
│   ├── v1.0/
│   ├── v1.1/
│   │   └── phase3-4-completion-summary.md
│   └── v2.0/
│       ├── RELEASE.md              # v2.0发布说明
│       ├── P0-COMPLETION.md        # P0任务完成报告
│       ├── mobile-optimization.md  # 移动端优化方案
│       ├── implementation-plan.md  # 实施计划
│       ├── day1-completion-report.md
│       ├── phase5-completion-report.md
│       └── PHASE5-COMPLETE.md
│
├── issues/                         # 问题和修复
│   └── bug-fixes/
│       ├── BUG-FIX-HEALTH-SCORE.md
│       ├── BUG-FIX-VERIFIED.md
│       ├── DATA-CONSISTENCY-FIXED-v2.md
│       ├── DATA-CONSISTENCY-FIXED.md
│       ├── DATA-SYNC-FIXED.md
│       ├── RENT-RATIO-FIXED.md
│       ├── RISK-LEVEL-FIX-V2.md    # 风险等级修复详细报告
│       └── RISK-LEVEL-FIXED.md
│
├── guides/                         # 操作指南
│   ├── quick-start.md              # 快速开始
│   ├── testing-guide.md            # 测试指南
│   ├── data-consistency-guide.md   # 数据一致性指南
│   └── START-TESTING-NOW.md
│
├── planning/                       # 规划和待办
│   └── TODO-P1-P2-Skills.md        # P1/P2任务清单
│
└── archive/                        # 归档文档（已过时）
    ├── README.md                   # 归档说明
    ├── v1.0/                       # v1.0版本归档
    │   ├── SPRINT1_REPORT.md
    │   ├── SPRINT2_REPORT.md
    │   ├── operation-manual-zh.md
    │   └── delivery-checklist-zh.md
    ├── bug-fixes-history/          # Bug修复历史归档
    │   ├── README.md
    │   ├── RISK-LEVEL-FIXED-v1.md
    │   └── DATA-CONSISTENCY-FIXED-v1.md
    └── temporary/                  # 临时文档归档
        └── inspection-toolkit-draft.md
```

---

## 📚 分类文档索引

### 1️⃣ 快速索引层（极低Token）

| 文档 | 路径 | Token估算 | 用途 |
|------|------|-----------|------|
| **项目上下文索引** | `/CONTEXT.md` | < 200 | 5秒快速恢复上下文 |

### 2️⃣ 版本快照层（精简版本全貌）

| 文档 | 路径 | Token估算 | 内容 |
|------|------|-----------|------|
| **V1.0快照** | `snapshots/v1.0-SNAPSHOT.md` | < 600 | 首次发布，15个核心功能 |
| **V1.1快照** | `snapshots/v1.1-SNAPSHOT.md` | < 600 | UI/UX优化 + Bug修复 |
| **V2.0快照** | `snapshots/v2.0-SNAPSHOT.md` | < 800 | 现场巡店 + 5等级风险 |

### 3️⃣ 商业与产品文档 ⭐新增

| 文档 | 路径 | Token估算 | 内容概要 |
|------|------|-----------|----------|
| **BRD商业需求文档** | `business/BRD.md` | ~3000 | 面向决策层和投资人，包含市场分析、商业模式、ROI计算、Go-to-Market策略 |
| **PRD产品需求文档** | `product/PRD.md` | ~5000 | 面向产品和开发团队，包含功能架构、详细PRD、技术架构、验收标准 |

### 4️⃣ 架构文档

| 文档 | 路径 | 内容概要 |
|------|------|----------|
| **Skills体系** | `architecture/skills-system.md` | Skills提取方案和架构设计 |
| **React最佳实践** | `architecture/react-state-best-practices.md` | 状态管理陷阱和解决方案 |

### 5️⃣ 标准规范

| 文档 | 路径 | 内容概要 |
|------|------|----------|
| **风险等级标准** | `standards/risk-level-standard.md` | v2.0统一的5等级标准（合并5个文档） |

### 6️⃣ 版本发布

#### v2.0 (2026-01-28) - 当前版本
| 文档 | 路径 | 内容概要 |
|------|------|----------|
| **发布说明** | `releases/v2.0/RELEASE.md` | v2.0完整发布说明 |
| **P0完成报告** | `releases/v2.0/P0-COMPLETION.md` | Skills提取P0任务 |
| **移动端优化** | `releases/v2.0/mobile-optimization.md` | 移动端优化方案 |
| **实施计划** | `releases/v2.0/implementation-plan.md` | P0任务实施计划 |

#### v1.1 (2026-01-24)
| 文档 | 路径 | 内容概要 |
|------|------|----------|
| **Phase 3-4总结** | `releases/v1.1/phase3-4-completion-summary.md` | Sprint完成报告 |

### 7️⃣ Bug修复历史

| 文档 | 路径 | 问题描述 |
|------|------|----------|
| **风险等级修复V2** | `issues/bug-fixes/RISK-LEVEL-FIX-V2.md` | 5等级标准统一（详细报告） |
| **健康度计算修复** | `issues/bug-fixes/BUG-FIX-HEALTH-SCORE.md` | 健康度计算bug修复 |
| **数据一致性修复V2** | `issues/bug-fixes/DATA-CONSISTENCY-FIXED-v2.md` | 数据一致性问题 |
| **租金比例修复** | `issues/bug-fixes/RENT-RATIO-FIXED.md` | 租金比例计算 |
| **数据同步修复** | `issues/bug-fixes/DATA-SYNC-FIXED.md` | 数据同步问题 |

### 8️⃣ 操作指南

| 文档 | 路径 | 用途 |
|------|------|------|
| **快速开始** | `guides/quick-start.md` | 项目启动和基础操作 |
| **测试指南** | `guides/testing-guide.md` | E2E测试和验证流程 |
| **数据一致性** | `guides/data-consistency-guide.md` | 数据一致性保证指南 |

### 9️⃣ 规划待办

| 文档 | 路径 | 内容概要 |
|------|------|----------|
| **P1/P2任务** | `planning/TODO-P1-P2-Skills.md` | 待执行的Skills提取任务 |

### 🔟 变更记录

| 文档 | 路径 | 内容概要 |
|------|------|----------|
| **变更日志** | `CHANGELOG.md` | 所有版本的增量变更记录 |

### 🗂️ 归档文档

所有归档文档位于 `docs/archive/`：
- **v1.0归档** → `archive/v1.0/` (Sprint报告、操作手册等)
- **Bug修复历史** → `archive/bug-fixes-history/` (已被标准替代的修复文档)
- **临时文档** → `archive/temporary/` (开发过程中的草稿)

**规则**: 归档文档仅供参考，已被新文档替代，请优先查看当前文档。

### 🔧 测试与脚本

所有测试脚本和工具位于项目根目录 `scripts/`：
- **测试脚本** → `scripts/testing/`
  - `auto-test.js` - 自动化测试
  - `test-data-generator.js` - 测试数据生成
  - `verify-consistency.js` - 一致性验证
  - `diagnose-bug.js` - Bug诊断工具
  - `phase5-validation-script.js` - Phase 5验证
  - `risk-level-validator.html` - 风险等级验证工具

---

## 🔍 按场景查找文档

### 场景1: 新终端启动，恢复上下文
```
1. 读取 CONTEXT.md（<200 tokens）
2. 读取 snapshots/v2.0-SNAPSHOT.md（<800 tokens）
总消耗: <1000 tokens ✅
```

### 场景2: 了解特定功能（如现场巡店）
```
1. 读取 releases/v2.0/RELEASE.md（现场巡店章节）
2. 查看 app/inspection/page.tsx（代码实现）
```

### 场景3: 修复Bug（如风险等级问题）
```
1. 读取 standards/risk-level-standard.md（标准）
2. 读取 issues/bug-fixes/RISK-LEVEL-FIX-V2.md（历史修复）
3. 查看 skills/health-calculator.ts（实现代码）
```

### 场景4: 开始新功能开发
```
1. 读取 planning/TODO-P1-P2-Skills.md（待办任务）
2. 读取 architecture/skills-system.md（架构规范）
3. 参考 releases/v2.0/P0-COMPLETION.md（最佳实践）
```

### 场景5: 版本发布准备
```
1. 更新 CHANGELOG.md（增量记录）
2. 创建 releases/vX.X/RELEASE.md（发布说明）
3. 创建 snapshots/vX.X-SNAPSHOT.md（版本快照）
4. 更新 CONTEXT.md（指向新版本）
```

---

## 📊 Token消耗估算

| 文档类型 | Token范围 | 适用场景 |
|---------|-----------|---------|
| **CONTEXT.md** | 150-200 | 快速恢复上下文 |
| **SNAPSHOT** | 500-800 | 了解版本全貌 |
| **标准规范** | 1000-1500 | 技术实现参考 |
| **发布说明** | 2000-3000 | 详细功能了解 |
| **Bug修复** | 1500-2500 | 问题诊断和修复 |

**推荐策略**: 首次加载 CONTEXT.md + SNAPSHOT (<1000 tokens)，按需加载详细文档

---

## 🎯 文档维护规范

### 更新频率
- **CONTEXT.md** - 每次版本发布更新
- **CHANGELOG.md** - 每次功能变更增量记录
- **SNAPSHOT** - 每次主版本发布创建新快照（冻结）
- **详细文档** - 按需创建和更新

### 冗余控制
- **禁止**: 同一内容在多个文档重复
- **推荐**: 使用引用链接（→ 指向详细文档）
- **原则**: 单一数据源（Single Source of Truth）

### 命名规范
- **快照**: `vX.X-SNAPSHOT.md`
- **发布**: `RELEASE.md`
- **标准**: `xxx-standard.md`
- **修复**: `XXX-FIX-V2.md`（V2表示修复版本）

---

## 🔗 外部资源

### 项目文件
- **项目交接文档** - `/PROJECT_HANDOVER.md`（精简版，200-300行）
- **版本历史** - `/VERSION.md`
- **README** - `/README.md`

### 代码文档
- **Skills目录** - `/skills/`（业务逻辑模块）
- **组件目录** - `/components/`（React组件）
- **工具目录** - `/utils/`（服务层）

---

## 📞 帮助信息

### 找不到文档？
1. 检查本索引的分类列表
2. 使用全局搜索（grep）
3. 查看Git提交历史

### 文档过时？
1. 检查文档最后更新日期
2. 对照当前代码版本
3. 参考CHANGELOG确认变更

### 需要新文档？
1. 确认不与现有文档重复
2. 确定文档分类（architecture/features/guides等）
3. 遵循命名和格式规范
4. 更新本INDEX.md索引

---

**维护人**: Claude Sonnet 4.5
**最后更新**: 2026-02-02
**文档版本**: v2.4-stable
