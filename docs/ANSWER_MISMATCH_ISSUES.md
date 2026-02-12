# "答非所问"问题系统盘点

## 问题描述
用户明确要求某个功能，但系统返回了其他内容，没有直接给用户想要的东西。

---

## 🔴 问题 1: 历史帮扶档案查询意图缺失

### 现象
**用户输入**: "我想看下海底捞的历史帮扶档案"
**用户期望**: 查看历史帮扶档案，跳转到档案页面
**实际输出**: 返回健康度诊断报告 + 创建帮扶任务的跳转

### 根本原因
1. **意图识别缺失**: `archive_query` 意图在 `intent-classifier.ts` 的 `patterns` 数组中**没有定义关键词匹配规则**
2. **意图降级**: 系统无法识别"档案"、"历史帮扶"等关键词，降级为 `health_query` 或 `risk_diagnosis`
3. **执行逻辑错误**: 即使识别到 `archive_query`，也可能执行了错误的 skill

### 影响范围
所有包含以下关键词的查询都会被误判：
- "历史帮扶档案"
- "帮扶档案"
- "档案"
- "历史记录"
- "过往帮扶"
- "帮扶历史"

### 解决方案
1. **添加 archive_query 意图的关键词匹配规则**
   ```typescript
   {
     intent: 'archive_query',
     priority: 4, // 高优先级，避免被其他意图覆盖
     keywords: [
       { keyword: '档案', weight: 20 },
       { keyword: '历史帮扶', weight: 20 },
       { keyword: '帮扶档案', weight: 20 },
       { keyword: '帮扶记录', weight: 18 },
       { keyword: '历史记录', weight: 15 },
       { keyword: '过往帮扶', weight: 15 },
       { keyword: '帮扶历史', weight: 15 },
       { keyword: '查看档案', weight: 18 },
     ],
   }
   ```

2. **检查 agent-router.ts 中的执行逻辑**
   - 确保 `archive_query` 意图正确路由到档案查询功能
   - 返回正确的跳转链接（跳转到历史帮扶档案页面，而不是创建任务）

3. **LLM Prompt 优化**
   - 在 LLM 意图分类的 prompt 中明确说明 `archive_query` 的特征
   - 强调"档案"、"历史帮扶"等关键词应该优先识别为 `archive_query`

---

## 🟡 问题 2: 意图优先级冲突

### 现象
用户输入包含多个关键词时，系统可能选择错误的意图。

**示例**:
- 输入: "海底捞的帮扶方案有哪些？"
- 可能被识别为: `aggregation_query`（因为"有哪些"）
- 应该识别为: `solution_recommend`（因为"帮扶方案"）

### 根本原因
1. **关键词权重不合理**: 通用词（如"有哪些"）权重过高
2. **优先级设置不当**: 某些意图的优先级过高，覆盖了更精确的意图
3. **缺少组合规则**: 没有考虑关键词组合的语义

### 解决方案
1. **调整关键词权重**
   - 降低通用词的权重（如"有哪些"、"怎么样"）
   - 提高专业词的权重（如"帮扶方案"、"档案"）

2. **添加组合规则**
   - 如果同时包含"帮扶"和"方案"，强制识别为 `solution_recommend`
   - 如果同时包含"历史"和"档案"，强制识别为 `archive_query`

3. **优化 LLM Prompt**
   - 在 prompt 中明确说明意图的优先级规则
   - 提供更多的示例来训练 LLM

---

## 🟡 问题 3: 跳转链接不匹配

### 现象
系统返回的跳转链接与用户意图不符。

**示例**:
- 用户要查看"历史帮扶档案"
- 系统返回"创建帮扶任务"的跳转

### 根本原因
1. **SuggestedAction 生成逻辑错误**: `agent-router.ts` 中的 `generateSuggestedAction` 方法没有正确处理 `archive_query` 意图
2. **默认行为不合理**: 当无法确定跳转时，默认返回"创建任务"

### 解决方案
1. **修复 generateSuggestedAction 方法**
   ```typescript
   if (query.intents.includes('archive_query') && merchant) {
     return {
       type: 'navigate_archives',
       data: { merchantId: merchant.id },
       description: `查看${merchant.name}的历史帮扶档案`
     };
   }
   ```

2. **添加意图到跳转的映射表**
   ```typescript
   const intentToActionMap = {
     archive_query: 'navigate_archives',
     health_query: 'navigate_health',
     risk_diagnosis: 'navigate_risk',
     solution_recommend: 'create_task',
   };
   ```

---

## 🟡 问题 4: 执行逻辑与意图不匹配

### 现象
即使意图识别正确，执行的 skill 也可能不对。

**示例**:
- 意图: `archive_query`
- 执行的 skill: `analyzeHealth`（健康度分析）
- 应该执行: 查询历史帮扶档案的 API

### 根本原因
1. **TaskPlanner 映射错误**: `task-planner.ts` 中的意图到 skill 的映射不正确
2. **缺少专门的档案查询 skill**: 可能没有实现档案查询的功能

### 解决方案
1. **检查 task-planner.ts 中的映射**
   ```typescript
   private intentToSkills: Record<UserIntent, string[]> = {
     archive_query: ['queryArchives'], // 应该是档案查询，而不是 analyzeHealth
     health_query: ['analyzeHealth'],
     risk_diagnosis: ['detectRisks', 'generateDiagnosisReport'],
     // ...
   };
   ```

2. **实现档案查询功能**
   - 如果没有 `queryArchives` skill，需要实现它
   - 或者直接返回跳转链接，让前端处理

---

## 🟢 问题 5: 用户表达方式多样性

### 现象
用户可能用不同的方式表达同一个意图，系统无法全部覆盖。

**示例**:
- "历史帮扶档案"
- "过往的帮扶记录"
- "之前的帮扶情况"
- "帮扶历史"
- "档案信息"

### 解决方案
1. **扩充关键词列表**: 覆盖更多的表达方式
2. **依赖 LLM 语义理解**: 关键词匹配作为 fallback，主要依赖 LLM
3. **用户反馈学习**: 收集用户反馈，持续优化关键词和 prompt

---

## 修复优先级

| 问题 | 优先级 | 影响范围 | 修复难度 |
|------|--------|---------|---------|
| 问题 1: archive_query 意图缺失 | 🔴 P0 | 所有档案查询 | 简单 |
| 问题 3: 跳转链接不匹配 | 🔴 P0 | 所有档案查询 | 简单 |
| 问题 4: 执行逻辑不匹配 | 🟡 P1 | 所有档案查询 | 中等 |
| 问题 2: 意图优先级冲突 | 🟡 P1 | 部分查询 | 中等 |
| 问题 5: 表达方式多样性 | 🟢 P2 | 长期优化 | 持续 |

---

## 修复计划

### Phase 1: 紧急修复（预计30分钟）
1. ✅ 添加 `archive_query` 意图的关键词匹配规则
2. ✅ 修复 `generateSuggestedAction` 方法
3. ✅ 测试档案查询场景

### Phase 2: 完善逻辑（预计1小时）
1. 检查 `task-planner.ts` 中的映射
2. 实现或修复档案查询功能
3. 优化 LLM Prompt

### Phase 3: 系统优化（预计2小时）
1. 调整所有意图的关键词权重
2. 添加组合规则
3. 完善测试用例

---

## 测试用例

### 档案查询场景
| 输入 | 预期意图 | 预期跳转 | 状态 |
|------|---------|---------|------|
| 我想看下海底捞的历史帮扶档案 | archive_query | navigate_archives | ❌ |
| 查看海底捞的帮扶档案 | archive_query | navigate_archives | ❌ |
| 海底捞有历史帮扶记录吗 | archive_query | navigate_archives | ❌ |
| 海底捞的过往帮扶情况 | archive_query | navigate_archives | ❌ |
| 查看档案 | archive_query | navigate_archives | ❌ |

### 其他意图场景（回归测试）
| 输入 | 预期意图 | 预期跳转 | 状态 |
|------|---------|---------|------|
| 海底捞的健康度怎么样 | health_query | navigate_health | ✅ |
| 海底捞有什么风险 | risk_diagnosis | navigate_risk | ✅ |
| 海底捞的帮扶方案 | solution_recommend | create_task | ✅ |

---

## 总结

**核心问题**: 用户要什么，就直接给什么，不要绕弯子。

**解决原则**:
1. **意图识别要准确**: 覆盖所有用户可能的表达方式
2. **执行逻辑要匹配**: 意图识别后，执行正确的功能
3. **跳转链接要正确**: 返回的跳转要与用户意图一致
4. **优先级要合理**: 避免通用意图覆盖专业意图

**下一步**: 立即修复 `archive_query` 意图缺失问题。
