# Phase 2 实施文档：用户澄清机制和反馈收集

> 实施时间：2024-01
> 状态：✅ 已完成

## 实施内容

### 1. 用户澄清机制（Layer 4）

**目标**：当意图识别置信度低时，提供选项让用户选择，而非猜测意图。

**实施文件**：
- `types/ai-assistant.ts` - 扩展类型定义
- `skills/ai-assistant/intent-classifier.ts` - 添加澄清检查逻辑
- `skills/ai-assistant/agent-router.ts` - 处理澄清流程

**核心逻辑**：
```typescript
// 置信度阈值
const CLARIFICATION_THRESHOLD = 0.6;

// 当置信度 < 0.6 时，标记需要澄清
if (result.confidence < CLARIFICATION_THRESHOLD) {
  return {
    ...result,
    needsClarification: true,
    alternatives: [result.intent, ...otherIntents],
    clarificationMessage: '我理解您可能想要：'
  };
}
```

**澄清选项示例**：
```json
{
  "needsClarification": true,
  "clarificationOptions": [
    {
      "label": "查看商户健康状况",
      "description": "查询商户的健康度评分和整体运营状况",
      "value": "health_query"
    },
    {
      "label": "诊断商户风险",
      "description": "分析商户存在的风险和潜在问题",
      "value": "risk_diagnosis"
    },
    {
      "label": "获取帮扶方案建议",
      "description": "推荐针对性的帮扶措施和解决方案",
      "value": "solution_recommend"
    }
  ]
}
```

**用户体验流程**：
```
用户输入（模糊）
  ↓
意图识别（置信度 < 0.6）
  ↓
返回澄清选项
  ↓
用户选择意图
  ↓
执行对应操作
```

### 2. 反馈收集功能

**目标**：收集用户反馈，持续优化意图识别准确率。

**实施文件**：
- `app/api/feedback/route.ts` - 反馈收集API
- `skills/ai-assistant/agent-router.ts` - 添加反馈提示

**反馈类型**：
1. **helpful**：回答有帮助
2. **not_helpful**：回答没帮助
3. **wrong_intent**：理解错了意图

**反馈提示**：
```json
{
  "feedbackPrompt": {
    "question": "这个回答有帮助吗？",
    "options": [
      {
        "label": "👍 有帮助",
        "value": "helpful",
        "icon": "👍"
      },
      {
        "label": "👎 不是我想要的",
        "value": "not_helpful",
        "icon": "👎"
      },
      {
        "label": "🔄 理解错了我的意图",
        "value": "wrong_intent",
        "icon": "🔄"
      }
    ]
  }
}
```

**API端点**：

**POST /api/feedback** - 提交反馈
```json
{
  "messageId": "msg_123",
  "conversationId": "conv_456",
  "userInput": "海底捞怎么样",
  "predictedIntent": "health_query",
  "feedbackType": "helpful"
}
```

**GET /api/feedback** - 查看反馈统计
```json
{
  "statistics": {
    "total": 100,
    "helpful": 85,
    "notHelpful": 10,
    "wrongIntent": 5,
    "helpfulRate": "85.00%",
    "wrongIntentRate": "5.00%"
  },
  "recentWrongIntents": [...]
}
```

### 3. 置信度驱动的UX

**策略**：
```typescript
if (confidence >= 0.9) {
  // 高置信度：直接给答案
  return directAnswer;
} else if (confidence >= 0.6) {
  // 中置信度：给答案 + 反馈提示
  return {
    content: answer,
    feedbackPrompt: "这个回答有帮助吗？"
  };
} else {
  // 低置信度：提供选项让用户选择
  return {
    content: "我理解您可能想要：",
    clarificationOptions: [...]
  };
}
```

**置信度阈值**：
- **0.9+**：高置信度，直接执行
- **0.6-0.9**：中置信度，执行 + 请求反馈
- **<0.6**：低置信度，请求用户澄清

## 类型定义

### IntentResult（扩展）
```typescript
export interface IntentResult {
  intent: UserIntent;
  confidence: number;
  keywords: string[];
  // ⭐Phase 2 新增
  needsClarification?: boolean;
  alternatives?: UserIntent[];
  clarificationMessage?: string;
}
```

### AgentExecutionResult（扩展）
```typescript
export interface AgentExecutionResult {
  success: boolean;
  content: string;
  metadata: MessageMetadata;
  suggestedAction?: SuggestedAction;
  error?: string;
  // ⭐Phase 2 新增
  needsClarification?: boolean;
  clarificationOptions?: ClarificationOption[];
  feedbackPrompt?: FeedbackPrompt;
}
```

### ClarificationOption（新增）
```typescript
export interface ClarificationOption {
  label: string;
  description?: string;
  value: UserIntent;
  icon?: string;
}
```

### FeedbackPrompt（新增）
```typescript
export interface FeedbackPrompt {
  question: string;
  options: FeedbackOption[];
}

export interface FeedbackOption {
  label: string;
  value: 'helpful' | 'not_helpful' | 'wrong_intent';
  icon?: string;
}
```

## 测试验证

### 测试用例1：低置信度触发澄清
```
输入：海底捞
预期：
- 置信度 < 0.6
- needsClarification: true
- 返回澄清选项
```

### 测试用例2：中置信度请求反馈
```
输入：海底捞最近怎么样
预期：
- 置信度 0.6-0.9
- 返回答案
- 附带反馈提示
```

### 测试用例3：高置信度直接执行
```
输入：我想看下海底捞的历史帮扶档案
预期：
- 置信度 > 0.9
- 直接返回答案
- 无需澄清或反馈
```

## 预期效果

### 用户体验改善
- ✅ 低置信度时不再猜测，让用户选择
- ✅ 减少"答非所问"的情况
- ✅ 用户参与决策，提升满意度

### 数据收集
- ✅ 收集真实用户反馈
- ✅ 识别高频错误案例
- ✅ 为优化提供数据支持

### 持续优化
- ✅ 基于反馈优化规则
- ✅ 降低错误意图率
- ✅ 提升整体准确率

## 性能指标

| 指标 | 目标值 | 说明 |
|------|--------|------|
| 澄清率 | < 10% | 需要用户澄清的查询比例 |
| 有帮助率 | > 85% | 用户反馈"有帮助"的比例 |
| 错误意图率 | < 5% | 用户反馈"理解错意图"的比例 |
| 反馈收集率 | > 30% | 用户提供反馈的比例 |

## 使用方法

### 前端集成示例

```typescript
// 1. 处理澄清响应
if (response.needsClarification) {
  // 显示澄清选项
  showClarificationDialog({
    message: response.content,
    options: response.clarificationOptions,
    onSelect: (intent) => {
      // 用户选择后重新查询
      queryWithIntent(userInput, intent);
    }
  });
}

// 2. 显示反馈按钮
if (response.feedbackPrompt) {
  showFeedbackButtons({
    question: response.feedbackPrompt.question,
    options: response.feedbackPrompt.options,
    onFeedback: (feedbackType) => {
      // 提交反馈
      submitFeedback({
        messageId: response.metadata.messageId,
        conversationId: conversationId,
        userInput: userInput,
        predictedIntent: response.metadata.intent,
        feedbackType: feedbackType
      });
    }
  });
}
```

### 查看反馈统计

```bash
# 访问反馈统计API
curl http://localhost:3000/api/feedback

# 返回示例
{
  "statistics": {
    "total": 100,
    "helpful": 85,
    "notHelpful": 10,
    "wrongIntent": 5,
    "helpfulRate": "85.00%",
    "wrongIntentRate": "5.00%"
  }
}
```

## 后续优化

### Phase 3（计划中）
- 实现反馈驱动的规则优化
- 自动生成规则建议
- A/B测试不同置信度阈值

### Phase 4（计划中）
- 实现多轮对话澄清
- 上下文感知的澄清策略
- 个性化置信度阈值

## 注意事项

1. **澄清频率**：
   - 如果澄清率过高（>15%），考虑降低阈值
   - 如果错误意图率高（>10%），考虑提高阈值

2. **反馈收集**：
   - 不要过度打扰用户
   - 只在关键时刻请求反馈
   - 提供"不再提示"选项

3. **数据隐私**：
   - 反馈数据应匿名化
   - 遵守数据保护法规
   - 定期清理旧数据

4. **性能影响**：
   - 澄清机制不增加LLM调用
   - 反馈收集是异步的
   - 对响应时间无影响

## 更新日志

| 日期 | 版本 | 更新内容 |
|------|------|----------|
| 2024-01 | v1.0 | Phase 2 初始实施 |

---

**实施者**：AI Assistant Team
**审核者**：待定
**状态**：✅ 代码已完成，待前端集成
