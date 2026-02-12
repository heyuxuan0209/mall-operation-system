# AI智能问答系统架构重构 - 实施记录

## 重构时间
2026-02-11

## 重构目标
解决"答非所问"问题，从架构层面优化实体识别和上下文管理

## 已完成的模块

### 1. 置信度管理器 ✅
**文件**: `/skills/ai-assistant/confidence-manager.ts`

**功能**:
- 管理置信度阈值（高/中/低）
- 根据置信度决定是否执行、询问确认或显示警告
- 生成用户友好的置信度提示

**关键方法**:
- `shouldExecute(confidence)`: 决定如何处理
- `getConfidenceLevel(confidence)`: 获取置信度等级
- `generateConfidenceMessage(confidence)`: 生成提示信息

---

### 2. 统一实体识别服务 ✅
**文件**: `/skills/ai-assistant/entity-recognition-service.ts`

**功能**:
- 作为实体识别的唯一入口
- 整合4种识别策略：精确匹配、模糊匹配、部分匹配、上下文推断
- 返回所有候选实体，按置信度排序

**关键改进**:
- ✅ 单一职责：只负责识别，不负责决策
- ✅ 策略优先级：精确匹配 > 模糊匹配 > 部分匹配 > 上下文
- ✅ 智能上下文使用：只有在真正省略主语时才使用上下文
- ✅ 去重机制：同一商户只保留最高置信度的结果

**核心逻辑**:
```typescript
recognize(userInput, context) {
  1. 精确匹配（confidence: 1.0）
  2. 模糊匹配（confidence: 0.85）
  3. 部分匹配（confidence: 动态计算）
  4. 上下文推断（confidence: 0.6，仅在满足条件时）

  返回: 按置信度排序的候选列表
}
```

---

### 3. 实体消歧服务 ✅
**文件**: `/skills/ai-assistant/entity-disambiguation-service.ts`

**功能**:
- 从多个候选中选择最合适的实体
- 实现"不确定时询问用户"机制
- 处理用户对消歧提示的回复

**消歧策略**:
1. 只有1个候选 → 直接返回
2. 最高分和次高分差距>0.3 → 返回最高分
3. 最高分是精确匹配 → 优先选择
4. 最高分来自上下文，次高分来自用户输入 → 选择次高分
5. 差距小且置信度<0.85 → 询问用户
6. 默认返回最高分，但标注不确定

**关键方法**:
- `disambiguate()`: 消歧主逻辑
- `generateClarificationPrompt()`: 生成消歧提示
- `parseUserChoice()`: 解析用户选择

---

### 4. 上下文切换检测器 ✅
**文件**: `/skills/ai-assistant/context-switch-detector.ts`

**功能**:
- 检测用户是否想切换商户
- 实现显式上下文切换机制

**检测规则**:
1. 用户明确提到新商户名称 → 切换（confidence: 0.95）
2. 用户使用切换词（"换"、"其他"） → 切换（confidence: 0.8）
3. 用户使用对比词（"对比"、"vs"） → 不切换（对比模式）

---

## 待完成的任务

### ✅ 5. 重构AgentRouter数据流 (已完成 - Phase 2)
**目标**: 集成新模块，重构数据流

**完成时间**: 2026-02-12

**实施内容**:
1. ✅ 在 `agent-router.ts` 中导入 Phase 1 新增的4个核心模块
2. ✅ 重构 `resolveEntities` 方法，集成新的实体识别流程
3. ✅ 添加上下文切换检测逻辑
4. ✅ 添加消歧处理和用户确认机制
5. ✅ 集成置信度管理器，添加置信度警告
6. ✅ 扩展类型定义，支持新的字段（confidence, needsClarification, candidates）

**新的数据流**:
```
用户输入
  ↓
[1] ContextSwitchDetector (检测是否切换上下文)
  ↓
[2] EntityRecognitionService (识别所有候选实体)
  ↓
[3] EntityDisambiguationService (消歧，选择最终实体)
  ↓
[4] ConfidenceManager (决定如何处理)
  ↓
[5] 执行或询问用户
```

**关键改动**:
- `agent-router.ts:220-295`: 重构 `resolveEntities` 方法
- `agent-router.ts:121-140`: 添加消歧确认处理
- `agent-router.ts:186-198`: 添加置信度警告到响应
- `types/ai-assistant.ts:600-616`: 扩展 `ResolvedEntity` 接口
- `types/ai-assistant.ts:92-110`: 扩展 `MessageMetadata` 接口

**测试状态**: ✅ 编译通过，类型检查通过

### ✅ 6. 废弃旧的省略补全逻辑 (已完成 - Phase 3)
**目标**: 废弃 `EnhancedContextManager.completeOmission`

**完成时间**: 2026-02-12

**实施内容**:
1. ✅ 标记 `completeOmission` 方法为 `@deprecated`
2. ✅ 标记 `enhanceUserInput` 方法为部分废弃
3. ✅ 新增 `enhanceUserInputV2` 方法，只做指代消解
4. ✅ 添加详细的废弃说明和迁移指引
5. ✅ 保留向后兼容性，避免破坏现有功能

**关键改动**:
- `conversation-context.ts:282`: 标记 `completeOmission` 为废弃
- `conversation-context.ts:389`: 标记 `enhanceUserInput` 为部分废弃
- `conversation-context.ts:428`: 新增 `enhanceUserInputV2` 方法

**废弃原因**:
- 旧的省略补全逻辑会修改用户输入，导致与新的实体识别服务冲突
- 新的 `EntityRecognitionService` 通过上下文策略更智能地处理省略主语
- 避免双重逻辑：旧的省略补全 + 新的实体识别

**保留功能**:
- ✅ `resolveReferences`（指代消解）：处理"它"、"这家店"等指代词
- ✅ 向后兼容：`enhanceUserInput` 仍然可用，但会在日志中标记为 deprecated

**测试状态**: ✅ 编译通过，类型检查通过

---

### 7. 端到端测试 ⏳
**目标**: 测试所有场景，确保新架构正常工作

---

## 架构对比

### 旧架构（问题）
```
用户输入
  ↓
EnhancedContextManager (自动补全，可能错误)
  ↓
QueryAnalyzer (LLM分析)
  ↓
EntityExtractor (规则匹配)
  ↓
AgentRouter (实体解析)
  ↓
执行
```

**问题**:
- 多层实体提取，职责不清
- 上下文优先级过高
- 缺少置信度机制
- 无法处理歧义

### 新架构（解决方案）
```
用户输入（原始）
  ↓
ContextSwitchDetector (检测切换意图)
  ↓
EntityRecognitionService (统一识别)
  ↓
EntityDisambiguationService (消歧)
  ↓
ConfidenceManager (决策)
  ↓
执行或询问
```

**优势**:
- ✅ 单一职责，清晰数据流
- ✅ 用户输入优先于上下文
- ✅ 置信度驱动决策
- ✅ 不确定时询问用户

---

## 下一步

### Phase 3: 废弃旧逻辑和完整测试
1. **废弃旧的省略补全逻辑** (预计30分钟)
   - 移除或标记废弃 `EnhancedContextManager.completeOmission`
   - 清理不再使用的旧实体提取逻辑

2. **端到端测试** (预计1小时)
   - 测试单商户查询场景
   - 测试消歧场景（多个候选商户）
   - 测试上下文切换场景
   - 测试置信度警告场景

3. **性能优化** (预计30分钟)
   - 检查是否有重复的实体识别调用
   - 优化候选实体的去重逻辑

4. **文档更新** (预计15分钟)
   - 更新 API 文档
   - 添加使用示例

---

## 进度总结

### ✅ Phase 1: 核心模块开发 (已完成)
- 置信度管理器
- 统一实体识别服务
- 实体消歧服务
- 上下文切换检测器

### ✅ Phase 2: AgentRouter 集成 (已完成)
- 导入新模块
- 重构 resolveEntities 方法
- 添加消歧和置信度处理
- 扩展类型定义
- 编译测试通过

### ✅ Phase 3: 废弃旧逻辑 (已完成)
- 标记旧方法为废弃
- 添加迁移指引
- 保留向后兼容性
- 编译测试通过

### ⏳ Phase 4: 端到端测试和优化 (进行中)
- 端到端测试
- 性能优化
- 文档更新
