# Git Commit 自动化工作流程

**创建日期**: 2026-01-28
**适用范围**: 所有重要功能开发和文档更新

---

## 📋 标准流程

每次完成重要功能或任务后，按以下步骤执行：

### 第一步：检查Git状态
```bash
git status
```

### 第二步：添加变更文件
```bash
# 添加相关文件
git add [文件/目录]

# 删除已迁移的文件
git rm [文件]
```

### 第三步：创建详细Commit
使用结构化的commit message：

```bash
git commit -m "$(cat <<'EOF'
[type]: [简短描述] - [核心变更]

## [任务名称]

### [子任务1]
- [变更点1]
- [变更点2]
- [变更点3]

### [子任务2]
- [变更点1]
- [变更点2]

## Updated Files

### Core Changes
- [文件1]: [变更说明]
- [文件2]: [变更说明]

### Documentation
- [文档1]: [变更说明]
- [文档2]: [变更说明]

## Metrics

- [指标1]: [变化]
- [指标2]: [变化]

## Benefits

- [收益1]
- [收益2]

## Verification

✅ [验证项1]
✅ [验证项2]

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

**Commit类型规范**:
- `feat`: 新功能
- `fix`: Bug修复
- `refactor`: 代码重构
- `docs`: 文档更新
- `style`: 代码格式调整
- `test`: 测试相关
- `chore`: 构建/工具链更新

### 第四步：获取最新Commit信息
```bash
git log -1 --format="%H %h %s"
```

记录：
- 完整hash (例如: 55b500a6138a6340d43d2ad6e2a2d36e81c8e151)
- 短hash (例如: 55b500a)
- Commit标题

### 第五步：更新CONTEXT.md

#### 5.1 更新版本状态
```markdown
## 🎯 当前版本状态
- **版本**: v[X.Y]-dev
- **最后更新**: YYYY-MM-DD
- **Git Commit**: [短hash]
- **工作阶段**: [当前阶段描述]
- **最新变更**: [简短描述]
```

#### 5.2 更新核心指标
```markdown
## 📊 核心指标
- **总代码**: ~[数量]行 (+[增量]行，[来源])
- **Skills数量**: [数量]个 (分类说明)
- **文档总量**: [数量]行 (+[增量]行，[来源])
- **功能模块**: [模块列表]
```

#### 5.3 更新当前关注点
```markdown
## ⚠️ 当前关注点
- [x] 已完成任务 (描述，已完成 ✅)
- [ ] 待办任务 (描述)
```

#### 5.4 添加到Git变更历史
在"Git变更历史"部分顶部添加：

```markdown
### 最新变更 ([短hash])
**日期**: YYYY-MM-DD
**类型**: [类型] ([类型说明])
**内容**: [简短描述]

**详细变更**:
- ✅ [变更1]
- ✅ [变更2]

**影响**:
- [指标1]: [变化]
- [指标2]: [变化]
```

将之前的"最新变更"移动到"历史记录"部分。

### 第六步：提交CONTEXT.md更新
```bash
git add CONTEXT.md

git commit -m "$(cat <<'EOF'
docs: update CONTEXT.md with latest commit info and change history

- Update version to v[X.Y]-dev
- Update latest commit hash to [短hash]
- Update metrics ([具体变更])
- Add latest change to Git history
- Mark [任务名] as completed

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## 📝 示例：完整执行流程

### 场景：完成P1+P2任务

```bash
# 1. 检查状态
git status

# 2. 添加文件
git add skills/inspection-analyzer/ \
        skills/image-processor/ \
        skills/notification-builder/ \
        skills/index.ts \
        utils/inspectionService.ts \
        utils/imageStorage.ts \
        utils/audioStorage.ts \
        utils/notificationService.ts \
        docs/SKILLS-DEVELOPMENT-GUIDE.md \
        docs/planning/ \
        CONTEXT.md

git rm utils/compression.ts

# 3. 创建功能commit
git commit -m "feat: complete P1 & P2 tasks - extract 3 skills and establish development standards

## P1 Tasks Completed (3 Skills Extracted)

### Task 4: Inspection Analyzer
- Extract inspection analysis logic from utils/inspectionService.ts
- Create skills/inspection-analyzer/ module (~180 LOC)
...

[详细内容见实际commit]

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# 4. 获取commit信息
git log -1 --format="%H %h %s"
# 输出: 55b500a6138a6340d43d2ad6e2a2d36e81c8e151 55b500a feat: complete P1 & P2 tasks...

# 5. 更新CONTEXT.md
# (手动编辑或使用脚本更新)

# 6. 提交CONTEXT.md
git add CONTEXT.md
git commit -m "docs: update CONTEXT.md with latest commit info and change history

- Update version to v2.1-dev
- Update latest commit hash to 55b500a
- Update metrics (Skills: 12→15, Code: +700 LOC, Docs: +1700 lines)
- Add Git change history section for tracking important commits
- Mark P1 and P2 Plan A tasks as completed

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## 🎯 关键原则

### 1. 两次Commit策略
- **第一次commit**: 功能变更（代码+文档）
- **第二次commit**: CONTEXT.md更新（追踪变更）

**原因**:
- 保持commit历史清晰
- CONTEXT.md引用第一次commit的hash
- 便于回滚和追踪

### 2. Commit Message结构化
- 使用标准格式（type: subject）
- 包含详细的变更说明
- 列出影响和验证结果
- 添加Co-Authored-By标记

### 3. CONTEXT.md实时更新
- 始终反映最新状态
- 包含完整的变更历史
- 提供快速的上下文恢复

### 4. 指标追踪
每次更新必须更新以下指标：
- 总代码行数
- Skills数量
- 文档总量
- 功能模块列表

---

## 🔧 自动化建议

### 方案A：Shell脚本（未来可选）
创建 `scripts/commit-with-context-update.sh`:

```bash
#!/bin/bash
# 自动化commit和CONTEXT.md更新流程

# 1. 执行功能commit
git commit -m "$1"

# 2. 获取commit hash
COMMIT_HASH=$(git log -1 --format="%h")

# 3. 自动更新CONTEXT.md
# (使用sed或其他工具自动替换)

# 4. 提交CONTEXT.md
git add CONTEXT.md
git commit -m "docs: update CONTEXT.md with commit $COMMIT_HASH"
```

### 方案B：Git Hook（未来可选）
创建 `.git/hooks/post-commit`:

```bash
#!/bin/bash
# 在每次commit后自动提示更新CONTEXT.md
echo "📝 提醒: 请更新CONTEXT.md并提交"
```

---

## 📊 执行记录

| 日期 | Commit | 任务 | 耗时 | 状态 |
|------|--------|------|------|------|
| 2026-01-28 | 55b500a | P1+P2功能 | 35分钟 | ✅ |
| 2026-01-28 | 2a09c3f | CONTEXT更新 | 5分钟 | ✅ |

---

## 📚 相关文档

- Git Commit规范: [Conventional Commits](https://www.conventionalcommits.org/)
- CONTEXT.md: 项目上下文索引文件
- Git历史: `git log --oneline --graph`

---

**创建人**: Claude Sonnet 4.5
**最后更新**: 2026-01-28
**状态**: ✅ 已建立标准流程
