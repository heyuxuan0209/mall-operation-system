# 开发工作流程规范

## 🎯 核心原则

**每完成一个小模块，立即执行"保存-更新-提交"流程**

- ✅ 防止上下文窗口溢出
- ✅ 确保代码随时可恢复
- ✅ 便于新对话窗口无缝衔接
- ✅ 保持项目文档实时同步

---

## 📋 标准工作流程

### 第一步：开发小模块
- 完成一个独立功能点（如：一个组件、一个工具函数、一个页面）
- 代码量控制在 200-500 行
- 确保功能可独立测试

### 第二步：本地验证
```bash
# 1. 构建测试
npm run build

# 2. 类型检查（如有错误立即修复）
# 构建会自动检查TypeScript错误

# 3. 启动开发服务器测试（如未启动）
npm run dev
```

### 第三步：更新文档（自动执行）

#### 3.1 更新 CONTEXT.md
```markdown
## 🎯 当前版本状态
- **最后更新**: [当前日期]
- **Git Commit**: [待提交]
- **最新变更**: [简要描述本次变更]

## 📅 最近7天活动
- **[日期]**: [本次变更] (待提交)
- [保留最近6条记录]

## 📝 Git变更历史
### 最新变更 (待提交)
**日期**: [当前日期]
**类型**: [feat/fix/refactor/docs]
**内容**: [详细描述]
```

#### 3.2 更新 VERSION.md
```markdown
## V[版本号] (开发中)

### 已完成
- ✅ [本次完成的功能]

### 计划功能
- [ ] [下一步计划]
```

#### 3.3 更新 docs/CHANGELOG.md
```markdown
## [v版本号] - [日期]

### ✨ 新增
- **[功能名称]** - [功能描述]

### 🐛 修复
- **[问题描述]** - [解决方案]

### 📝 文档
- [文档更新内容]

### 📊 统计
- 新增代码: +[行数]
- 新增文档: +[行数]
```

### 第四步：Git提交（自动执行）

```bash
# 1. 查看变更
git status

# 2. 添加文件
git add [相关文件]

# 3. 提交（使用规范化commit message）
git commit -m "[type]: [简要描述]

[详细说明]
- [变更点1]
- [变更点2]

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# 4. 验证提交
git log -1 --stat

# 5. 更新文档中的commit hash
# 将 "(待提交)" 替换为实际的commit hash
```

### 第五步：确认完成

输出完成报告：
```
✅ [功能名称] 开发完成

📁 新增文件: [数量]
📝 修改文件: [数量]
📊 代码变更: +[行数]/-[行数]
🔖 Git提交: [commit hash]

🚀 下一步: [建议的下一个任务]
```

---

## 🔄 何时执行此流程

### 必须执行的时机

1. **完成一个独立组件** (如: Button组件、Modal组件)
2. **完成一个页面** (如: 批量巡检页面)
3. **完成一个工具函数** (如: 数据处理函数、API封装)
4. **完成一个功能模块** (如: 草稿保存功能)
5. **修复一个Bug** (如: 修复状态管理问题)
6. **重构代码** (如: 提取Skill、优化性能)
7. **上下文token使用超过 50%** (100K/200K)

### 推荐执行的时机

1. **完成一个小时的开发工作**
2. **准备切换到另一个功能开发**
3. **准备结束当前对话**
4. **完成一组相关的小改动** (如: 修改3-5个文件)

---

## 📝 Commit Message 规范

### 格式
```
<type>: <简要描述>

<详细说明>
- <变更点1>
- <变更点2>

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

### Type 类型

| Type | 说明 | 示例 |
|------|------|------|
| **feat** | 新增功能 | feat: 实现批量巡检模式 |
| **fix** | Bug修复 | fix: 修复草稿保存失败问题 |
| **refactor** | 代码重构 | refactor: 提取商户管理工具函数 |
| **docs** | 文档更新 | docs: 更新批量巡检使用指南 |
| **style** | 代码格式 | style: 统一组件命名规范 |
| **perf** | 性能优化 | perf: 优化图片上传性能 |
| **test** | 测试相关 | test: 添加批量巡检单元测试 |
| **chore** | 构建/工具 | chore: 更新依赖版本 |

---

## 🎯 实践示例

### 示例1: 完成一个小组件

```
1. 开发完成: MerchantCard 组件 (150行)

2. 本地验证:
   npm run build ✅

3. 更新文档:
   - CONTEXT.md: 添加"完成MerchantCard组件"到最近活动
   - VERSION.md: 在"已完成"章节添加该组件
   - CHANGELOG.md: 记录新增组件

4. Git提交:
   git add components/MerchantCard.tsx
   git add CONTEXT.md VERSION.md docs/CHANGELOG.md
   git commit -m "feat: 添加商户卡片组件

   - 支持商户基本信息展示
   - 支持风险等级标识
   - 支持点击跳转详情

   Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

5. 更新commit hash到CONTEXT.md

6. 输出: ✅ MerchantCard组件开发完成 (commit: abc123)
```

### 示例2: 修复一个Bug

```
1. Bug修复: 草稿保存时state冲突

2. 本地验证:
   npm run build ✅
   手动测试草稿保存功能 ✅

3. 更新文档:
   - CONTEXT.md: 添加"修复草稿保存bug"到最近活动
   - CHANGELOG.md: 在"修复"章节记录

4. Git提交:
   git add app/inspection/batch/page.tsx
   git add CONTEXT.md docs/CHANGELOG.md
   git commit -m "fix: 修复草稿保存时React状态冲突

   问题: 连续两次setState导致状态丢失
   解决: 合并为单次原子更新

   Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

5. 更新commit hash

6. 输出: ✅ Bug修复完成 (commit: def456)
```

---

## ⚠️ 注意事项

### 避免的情况

❌ **不要等到完成整个大功能才提交**
- 大功能应拆分为多个小模块
- 每个小模块完成后立即提交

❌ **不要等到上下文token快满了才处理**
- 定期检查token使用情况
- 超过50%就考虑提交

❌ **不要忽略文档更新**
- 代码和文档必须同步提交
- CONTEXT.md是新对话的入口，必须保持最新

❌ **不要跳过本地验证**
- 每次提交前必须确保代码可编译
- 避免提交有错误的代码

### 推荐的实践

✅ **小步快跑，频繁提交**
- 每个commit应该是独立可用的
- commit粒度控制在200-500行代码

✅ **commit message要清晰**
- 描述"做了什么"和"为什么"
- 便于后续查看历史记录

✅ **文档与代码同步**
- 每次代码变更必须更新CONTEXT.md
- 保持文档的时效性

✅ **验证后再提交**
- npm run build 通过
- 手动测试功能正常
- 检查无TypeScript错误

---

## 🔧 自动化工具（可选）

### Git Hooks

可以创建 `.git/hooks/pre-commit` 自动检查：

```bash
#!/bin/bash

# 构建检查
echo "🔍 检查TypeScript编译..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ 构建失败，请修复错误后再提交"
  exit 1
fi

echo "✅ 检查通过，继续提交"
exit 0
```

### Commit Template

创建 `.gitmessage` 模板：

```
<type>: <简要描述>

<详细说明>
-
-

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

配置使用：
```bash
git config commit.template .gitmessage
```

---

## 📊 效果评估

### 预期收益

1. **上下文管理**
   - Token使用平稳
   - 避免突然超限

2. **代码质量**
   - 每次提交都可独立回滚
   - 便于追踪问题

3. **协作效率**
   - 新对话可快速接手
   - 文档实时同步

4. **项目可维护性**
   - Git历史清晰
   - 便于版本回溯

---

## 🎓 总结

**核心记住3点**:

1. **完成小模块 → 立即保存提交**
2. **文档与代码同步更新**
3. **新对话通过CONTEXT.md快速恢复**

**工作流程简记**:
```
开发 → 验证 → 更新文档 → Git提交 → 确认完成
```

---

**最后更新**: 2026-01-29
**维护者**: Claude Sonnet 4.5 + User Team
