# 文档总索引

## 🚀 快速开始（新手必读）

### 如何使用这个文档系统？

1. **首次了解项目**
   - 读取根目录 `CONTEXT.md` - 5秒恢复项目上下文
   - 读取 `docs/snapshots/v[最新版本]-SNAPSHOT.md` - 了解当前版本全貌
   - 需要时查看详细文档（见下方分类）

2. **新开AI对话**
   ```
   你: "请读取项目根目录的 CONTEXT.md"
   AI: [读取，快速恢复上下文]
   你: "继续开发..."
   ```

3. **查找特定信息**
   - 先查看本INDEX.md，找到对应文档位置
   - 再读取具体文档

---

## 📂 文档分类

### 📸 版本快照（精简版本全貌）
[版本快照是每个主版本的完整快照，200-400行了解一个版本]

- [V1.0快照](snapshots/v1.0-SNAPSHOT.md) - [简要描述v1.0]
- [V2.0快照](snapshots/v2.0-SNAPSHOT.md) - [简要描述v2.0] ⭐当前版本
- [V3.0快照](snapshots/v3.0-SNAPSHOT.md) - [简要描述v3.0]

**何时阅读**: 想快速了解某个版本的全貌

---

### 🏗️ 架构设计
[系统架构、技术选型、设计模式等]

- [系统架构](architecture/system-design.md) - 整体架构和技术选型
- [数据流](architecture/data-flow.md) - 数据流转和状态管理
- [技术栈说明](architecture/tech-stack.md) - 技术栈详细介绍
- [其他架构文档...]

**何时阅读**: 想了解系统设计、开始开发新功能

---

### ⚙️ 功能说明
[按功能模块组织的详细功能文档]

- [功能模块1](features/feature1.md) - [简要描述]
- [功能模块2](features/feature2.md) - [简要描述]
- [功能模块3](features/feature3.md) - [简要描述]
- [其他功能文档...]

**何时阅读**: 想了解某个具体功能的实现细节

---

### 📡 API文档
[API接口、组件、工具函数等的使用文档]

- [API文档总览](api/README.md)
- [用户API](api/user-api.md) - 用户相关接口
- [数据API](api/data-api.md) - 数据相关接口
- [组件库](api/components.md) - 可复用组件
- [工具函数](api/utils.md) - 通用工具函数
- [其他API文档...]

**何时阅读**: 需要调用API或使用组件

---

### 📏 标准规范
[代码规范、业务规则、命名约定等权威文档]

- [代码规范](standards/coding-style.md) - 代码风格和最佳实践
- [Git工作流](standards/git-workflow.md) - Git提交和分支规范
- [业务规则1](standards/business-rule1.md) - [核心业务规则]
- [业务规则2](standards/business-rule2.md) - [核心业务规则]
- [命名约定](standards/naming-conventions.md) - 变量、函数、文件命名
- [其他标准文档...]

**何时阅读**: 开发新功能前，确保遵循规范

---

### 🚀 版本发布
[按版本组织的发布说明和版本历史]

- [V3.0发布说明](releases/v3.0/RELEASE.md)
- [V2.0发布说明](releases/v2.0/RELEASE.md)
- [V1.0发布说明](releases/v1.0/RELEASE.md)

**何时阅读**: 了解版本发布内容和迁移指南

---

### 🐛 问题和修复
[Bug追踪、修复记录、已知问题等]

#### Bug修复记录
- [Bug修复1](issues/bug-fixes/bug-fix1.md)
- [Bug修复2](issues/bug-fixes/bug-fix2.md)
- [其他修复记录...]

#### 已知问题
- [已知问题列表](issues/known-issues.md)

**何时阅读**: 遇到类似问题时，查看历史修复方案

---

### 📖 操作指南
[快速开始、部署、测试等实操指南]

- [快速开始](guides/quick-start.md) - 5分钟上手项目
- [开发指南](guides/development.md) - 本地开发流程
- [部署指南](guides/deployment.md) - 部署到生产环境
- [测试指南](guides/testing.md) - 测试编写和运行
- [故障排查](guides/troubleshooting.md) - 常见问题解决
- [其他操作指南...]

**何时阅读**: 需要执行具体操作时

---

### 📅 规划和待办
[项目规划、待办事项、路线图]

- [待办事项](planning/TODO.md) - 当前待办任务清单
- [路线图](planning/roadmap.md) - 未来功能规划
- [技术债务](planning/tech-debt.md) - 需要重构的部分

**何时阅读**: 了解项目下一步要做什么

---

### 📝 变更日志
- [CHANGELOG.md](CHANGELOG.md) - 所有版本的变更记录

**何时阅读**: 查看历史变更，了解项目演进

---

## 🔍 按场景查找

### 场景1: 新终端恢复上下文
```bash
cat CONTEXT.md
cat docs/snapshots/v[最新版本]-SNAPSHOT.md
```
**目标**: 快速了解项目当前状态
**Token消耗**: 约1500 tokens

---

### 场景2: 了解某个功能的实现
```bash
cat docs/INDEX.md | grep "功能名"  # 找到文档位置
cat docs/features/xxx.md           # 读取功能文档
```
**目标**: 深入理解某个功能
**Token消耗**: 按需

---

### 场景3: 修复Bug
```bash
# 1. 查看相关业务标准
cat docs/standards/xxx-standard.md

# 2. 查看历史修复记录
cat docs/issues/bug-fixes/similar-bug.md

# 3. 查看相关功能文档
cat docs/features/xxx.md
```
**目标**: 找到Bug根因并修复
**Token消耗**: 按需

---

### 场景4: 开发新功能
```bash
# 1. 了解架构设计
cat docs/architecture/system-design.md

# 2. 查看代码规范
cat docs/standards/coding-style.md

# 3. 查看相关功能文档（参考）
cat docs/features/similar-feature.md
```
**目标**: 按规范开发新功能
**Token消耗**: 按需

---

### 场景5: 版本发布
```bash
# 1. 查看当前版本快照
cat docs/snapshots/v[当前版本]-SNAPSHOT.md

# 2. 查看变更日志
cat docs/CHANGELOG.md

# 3. 查看发布指南
cat docs/guides/deployment.md
```
**目标**: 准备版本发布
**Token消耗**: 按需

---

## 📊 Token消耗参考

| 文档类型 | 典型行数 | Token估算 | 何时使用 |
|---------|---------|-----------|---------|
| CONTEXT.md | 60行 | ~310 | 每次新对话（必读） |
| SNAPSHOT.md | 200-400行 | 1000-1500 | 了解版本全貌 |
| 架构文档 | 100-300行 | 500-1200 | 开发新功能前 |
| 功能文档 | 50-200行 | 250-800 | 了解具体功能 |
| 标准文档 | 30-100行 | 150-500 | 开发前查阅 |
| 操作指南 | 50-150行 | 250-600 | 执行操作时 |

**推荐策略**:
- **首次加载**: CONTEXT.md (310 tokens) ✅
- **完整上下文**: CONTEXT + SNAPSHOT (1500 tokens) ✅
- **深入了解**: 再按需加载详细文档

---

## 🛠️ 文档维护指南

### 如何添加新文档？

1. **确定文档类型**
   - 架构设计 → `docs/architecture/`
   - 功能说明 → `docs/features/`
   - API文档 → `docs/api/`
   - 标准规范 → `docs/standards/`
   - Bug修复 → `docs/issues/bug-fixes/`
   - 操作指南 → `docs/guides/`
   - 规划待办 → `docs/planning/`

2. **创建文档**
   ```bash
   touch docs/[分类]/新文档.md
   ```

3. **更新INDEX.md**
   - 在对应分类下添加链接
   - 写上简要描述

4. **更新CHANGELOG.md**
   ```markdown
   ## [版本号] - [日期]
   ### 文档
   - 新增: [新文档名称] - [简要说明]
   ```

---

### 如何更新现有文档？

1. **小改动**: 直接修改文档
2. **大改动**:
   - 记录在CHANGELOG.md
   - 如果影响版本理解，考虑更新SNAPSHOT

---

### 如何保持文档最新？

#### 每次新功能开发
- [ ] 功能文档已创建/更新
- [ ] INDEX.md已更新
- [ ] CHANGELOG.md已记录

#### 每次Bug修复
- [ ] Bug修复文档已创建
- [ ] 相关标准文档已更新（如果标准有变）
- [ ] CHANGELOG.md已记录

#### 每次版本发布
- [ ] CONTEXT.md已更新（版本号、日期、Commit）
- [ ] 创建新版本快照（主版本）
- [ ] CHANGELOG.md已整理
- [ ] 创建发布说明

---

## ✅ 文档质量检查清单

### CONTEXT.md
- [ ] 行数 < 100行
- [ ] Token消耗 < 500
- [ ] 版本信息最新
- [ ] 快速链接正确
- [ ] 当前关注点明确

### SNAPSHOT.md
- [ ] 行数 200-400行
- [ ] 突出了版本变更
- [ ] 核心功能都列出
- [ ] 业务规则清晰
- [ ] 详细文档索引完整

### 详细文档
- [ ] 分类正确
- [ ] 无重复内容（一个概念只有一个权威文档）
- [ ] 在INDEX.md中有索引
- [ ] 文档标题清晰
- [ ] 有必要的代码示例

### 整体
- [ ] 文档冗余度 < 10%
- [ ] INDEX.md包含所有文档
- [ ] CHANGELOG.md记录完整
- [ ] 文档结构符合12级分类

---

## 📚 延伸阅读

- [AI开发文档管理终极指南](../AI开发文档管理终极指南.md) - 完整教学文档
- [文档分层管理快速参考](../文档分层管理-快速参考.md) - 1页纸快速参考
- [实战案例](../case-study-mall-operation.md) - Mall Operation Agent案例
- [模板文件](../templates/) - CONTEXT、SNAPSHOT等模板

---

**索引版本**: v1.0
**最后更新**: 2026-01-28
**维护者**: [你的名字/团队]

---

## 📝 填写说明

### 使用这个模板
1. 复制本模板到你的项目 `docs/INDEX.md`
2. 删除所有 `[方括号]` 中的占位符，填入实际内容
3. 删除不适用的章节
4. 添加你特有的文档分类
5. 保持简洁，只列文档清单和简要描述
6. 定期更新，确保索引完整

### 维护建议
- 每次添加新文档，立即更新INDEX.md
- 每周检查一次，确保所有文档都被索引
- 保持分类清晰，避免文档分类错误
