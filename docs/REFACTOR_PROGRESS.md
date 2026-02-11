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

### 5. 重构AgentRouter数据流 ⏳
**目标**: 集成新模块，重构数据流

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

### 6. 废弃旧的省略补全逻辑 ⏳
**目标**: 废弃 `EnhancedContextManager.completeOmission`

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

1. **集成到AgentRouter** (预计2小时)
2. **废弃旧逻辑** (预计30分钟)
3. **测试验证** (预计1小时)
4. **提交代码** (预计15分钟)

---

## Token使用情况
- 当前消耗: ~98,000 tokens
- 剩余: ~102,000 tokens
- 建议: 完成集成后提交，重启会话继续测试
