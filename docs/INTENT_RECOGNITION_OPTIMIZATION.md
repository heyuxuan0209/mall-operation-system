# 意图识别优化方案：平衡速度、性能、准确性和成本

> 在速度、性能、准确性、响应质量和Token消耗之间找到最优平衡点

## 1. 核心目标

| 维度 | 目标 | 当前状态 | 优化方向 |
|------|------|----------|----------|
| 速度 | P95 < 500ms | ~1-2s | 分层策略 + 缓存 |
| 准确性 | > 90% | ~85% | 规则优化 + 反馈闭环 |
| Token消耗 | < 200 token/query | ~300-500 | 减少LLM调用频率 |
| 用户体验 | 流畅、准确 | 基本可用 | 置信度驱动UX |

## 2. 分层识别架构

### Layer 0: 查询缓存（最快）

**策略**：
```typescript
class QueryCache {
  private cache = new Map<string, CachedResult>();
  private ttl = 3600000; // 1小时

  get(query: string): IntentResult | null {
    const normalized = this.normalize(query);
    const cached = this.cache.get(normalized);

    if (cached && Date.now() - cached.timestamp < this.ttl) {
      return cached.result;
    }
    return null;
  }

  set(query: string, result: IntentResult) {
    const normalized = this.normalize(query);
    this.cache.set(normalized, {
      result,
      timestamp: Date.now()
    });
  }

  private normalize(query: string): string {
    return query.toLowerCase().trim().replace(/\s+/g, '');
  }
}
```

**性能指标**：
- 速度：< 5ms
- Token消耗：0
- 命中率目标：30%
- 准确性：100%（缓存的都是已验证的）

### Layer 1: 强制规则匹配（快速）

**策略**：
```typescript
interface ForcedRule {
  priority: number;
  pattern: RegExp;
  excludePattern?: RegExp;
  intent: UserIntent;
  confidence: number;
}

const FORCED_RULES: ForcedRule[] = [
  {
    priority: 10,
    pattern: /(档案|历史帮扶档案|帮扶记录|查看.*档案)/,
    excludePattern: /(创建|新建|措施|方案|建议|推进)/,
    intent: 'archive_query',
    confidence: 1.0
  },
  {
    priority: 9,
    pattern: /(多少个|几个|几家|统计).*?(商户|店|高风险)/,
    intent: 'aggregation_query',
    confidence: 1.0
  },
  // ... 更多规则
];

function matchForcedRules(input: string): IntentResult | null {
  const normalized = input.toLowerCase();

  for (const rule of FORCED_RULES) {
    if (rule.pattern.test(normalized)) {
      if (rule.excludePattern && rule.excludePattern.test(normalized)) {
        continue;
      }
      return {
        intent: rule.intent,
        confidence: rule.confidence,
        keywords: [],
        method: 'forced_rule'
      };
    }
  }

  return null;
}
```

**性能指标**：
- 速度：< 10ms
- Token消耗：0
- 覆盖率目标：60%
- 准确性：> 95%

**规则维护**：
- 每周审查规则效果
- 根据用户反馈调整
- 保持规则数量 < 20条

### Layer 2: 轻量级关键词分类（中速）

**策略**：
```typescript
function classifyWithKeywords(input: string): IntentResult {
  const scores = new Map<UserIntent, number>();

  // 计算每个意图的得分
  for (const pattern of INTENT_PATTERNS) {
    let score = 0;
    for (const { keyword, weight } of pattern.keywords) {
      if (input.includes(keyword)) {
        score += weight;
      }
    }

    if (score > 0) {
      scores.set(pattern.intent, score * pattern.priority);
    }
  }

  // 找出最高分
  const sorted = Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1]);

  if (sorted.length === 0) {
    return { intent: 'unknown', confidence: 0.3, keywords: [] };
  }

  const [topIntent, topScore] = sorted[0];
  const [secondIntent, secondScore] = sorted[1] || [null, 0];

  // 计算置信度
  const confidence = calculateConfidence(topScore, secondScore);

  return {
    intent: topIntent,
    confidence,
    keywords: [],
    method: 'keyword_matching',
    needsClarification: confidence < 0.7,
    alternatives: confidence < 0.7 ? [topIntent, secondIntent].filter(Boolean) : []
  };
}
```

**性能指标**：
- 速度：< 50ms
- Token消耗：0
- 覆盖率目标：25%
- 准确性：> 85%

**置信度阈值**：
- confidence >= 0.7：直接使用
- confidence < 0.7：进入Layer 3或Layer 4

### Layer 3: LLM分析（慢但准确）

**策略**：
```typescript
async function classifyWithLLM(
  input: string,
  context: Context
): Promise<IntentResult> {
  // 只在必要时调用LLM
  const keywordResult = classifyWithKeywords(input);

  if (keywordResult.confidence >= 0.7) {
    return keywordResult; // 跳过LLM
  }

  // 使用精简的prompt减少token消耗
  const prompt = buildMinimalPrompt(input, context, keywordResult.alternatives);

  // 使用缓存
  const cacheKey = `llm:${input}:${context.lastIntent}`;
  const cached = await cache.get(cacheKey);
  if (cached) return cached;

  const result = await llmClient.chat(prompt, {
    useCache: true,
    maxTokens: 200 // 限制输出token
  });

  const parsed = parseLLMResult(result);
  await cache.set(cacheKey, parsed);

  return parsed;
}

function buildMinimalPrompt(
  input: string,
  context: Context,
  alternatives: UserIntent[]
): string {
  // 精简prompt，只包含必要信息
  return `
用户输入："${input}"
上一轮意图：${context.lastIntent || '无'}
可能意图：${alternatives.join(', ')}

返回JSON：{"intent": "...", "confidence": 0.0-1.0}
`.trim();
}
```

**性能指标**：
- 速度：< 1s
- Token消耗：~150-200 token
- 覆盖率目标：10%
- 准确性：> 90%

**优化措施**：
- 精简prompt（减少50% token）
- 使用LLM缓存
- 限制输出token
- 只在必要时调用

### Layer 4: 用户澄清（最后手段）

**策略**：
```typescript
function requestClarification(
  input: string,
  alternatives: UserIntent[]
): ClarificationResponse {
  return {
    type: 'clarification_needed',
    message: '我理解您可能想要：',
    options: alternatives.map(intent => ({
      label: getIntentLabel(intent),
      description: getIntentDescription(intent),
      value: intent
    })),
    fallback: {
      label: '以上都不是',
      action: 'contact_support'
    }
  };
}

const INTENT_LABELS = {
  archive_query: '查看历史帮扶档案',
  solution_recommend: '获取帮扶方案建议',
  health_query: '查看商户健康状况',
  risk_diagnosis: '诊断商户风险',
  data_query: '查询具体数据'
};
```

**性能指标**：
- 速度：即时
- Token消耗：0
- 覆盖率目标：5%
- 准确性：100%（用户自己选的）

## 3. 完整流程实现

```typescript
export class OptimizedIntentClassifier {
  private cache = new QueryCache();

  async classify(
    input: string,
    context: Context
  ): Promise<IntentResult | ClarificationResponse> {
    // Layer 0: 缓存查询
    const cached = this.cache.get(input);
    if (cached) {
      console.log('[Classifier] Cache hit');
      return cached;
    }

    // Layer 1: 强制规则
    const forcedResult = this.matchForcedRules(input);
    if (forcedResult) {
      console.log('[Classifier] Forced rule matched');
      this.cache.set(input, forcedResult);
      return forcedResult;
    }

    // Layer 2: 关键词分类
    const keywordResult = this.classifyWithKeywords(input);

    if (keywordResult.confidence >= 0.7) {
      console.log('[Classifier] Keyword matching sufficient');
      this.cache.set(input, keywordResult);
      return keywordResult;
    }

    // Layer 3: LLM分析
    if (keywordResult.confidence >= 0.5) {
      console.log('[Classifier] Using LLM for complex query');
      const llmResult = await this.classifyWithLLM(input, context);

      if (llmResult.confidence >= 0.6) {
        this.cache.set(input, llmResult);
        return llmResult;
      }

      // Layer 4: 用户澄清
      return this.requestClarification(input, llmResult.alternatives);
    }

    // Layer 4: 直接请求澄清
    console.log('[Classifier] Confidence too low, requesting clarification');
    return this.requestClarification(input, keywordResult.alternatives);
  }
}
```

## 4. 性能优化措施

### 4.1 缓存策略

```typescript
// 多级缓存
class MultiLevelCache {
  private memoryCache = new Map(); // L1: 内存缓存
  private redisCache: Redis;        // L2: Redis缓存（可选）

  async get(key: string): Promise<any> {
    // 先查内存
    if (this.memoryCache.has(key)) {
      return this.memoryCache.get(key);
    }

    // 再查Redis
    if (this.redisCache) {
      const value = await this.redisCache.get(key);
      if (value) {
        this.memoryCache.set(key, value); // 回填L1
        return value;
      }
    }

    return null;
  }
}
```

### 4.2 批处理优化

```typescript
// 如果有多个查询，批量处理
async function batchClassify(inputs: string[]): Promise<IntentResult[]> {
  // 先用规则和关键词处理
  const results: (IntentResult | null)[] = inputs.map(input => {
    const forced = matchForcedRules(input);
    if (forced) return forced;

    const keyword = classifyWithKeywords(input);
    if (keyword.confidence >= 0.7) return keyword;

    return null;
  });

  // 只对需要LLM的查询调用一次LLM
  const needsLLM = results
    .map((r, i) => r ? null : i)
    .filter(i => i !== null);

  if (needsLLM.length > 0) {
    const llmResults = await batchLLMCall(
      needsLLM.map(i => inputs[i])
    );

    needsLLM.forEach((idx, i) => {
      results[idx] = llmResults[i];
    });
  }

  return results as IntentResult[];
}
```

### 4.3 Token优化

```typescript
// 精简prompt模板
const MINIMAL_PROMPT = `
输入："${input}"
上轮：${lastIntent}
候选：${alternatives}
返回：{"intent":"...","confidence":0.9}
`.trim();

// vs 原来的详细prompt（节省60% token）
```

### 4.4 预热常见查询

```typescript
// 启动时预热缓存
const COMMON_QUERIES = [
  '海底捞最近怎么样',
  '有什么帮扶措施',
  '查看历史档案',
  '有多少高风险商户'
];

async function warmupCache() {
  for (const query of COMMON_QUERIES) {
    await classifier.classify(query, {});
  }
}
```

## 5. 监控指标

### 5.1 性能监控

```typescript
class PerformanceMonitor {
  private metrics = {
    cacheHitRate: 0,
    avgResponseTime: 0,
    llmCallRate: 0,
    avgTokenUsage: 0,
    accuracyRate: 0
  };

  recordClassification(result: ClassificationMetrics) {
    // 记录各层命中率
    if (result.method === 'cache') {
      this.metrics.cacheHitRate++;
    } else if (result.method === 'llm') {
      this.metrics.llmCallRate++;
      this.metrics.avgTokenUsage += result.tokenUsage;
    }

    this.metrics.avgResponseTime += result.responseTime;
  }

  getReport(): PerformanceReport {
    return {
      cacheHitRate: this.metrics.cacheHitRate / totalQueries,
      avgResponseTime: this.metrics.avgResponseTime / totalQueries,
      llmCallRate: this.metrics.llmCallRate / totalQueries,
      avgTokenUsage: this.metrics.avgTokenUsage / this.metrics.llmCallRate,
      estimatedMonthlyCost: this.calculateCost()
    };
  }
}
```

### 5.2 目标指标

| 指标 | 目标值 | 监控频率 |
|------|--------|----------|
| 缓存命中率 | > 30% | 实时 |
| P95响应时间 | < 500ms | 实时 |
| LLM调用率 | < 15% | 每小时 |
| 平均Token消耗 | < 200/query | 每小时 |
| 意图准确率 | > 90% | 每天 |
| 用户澄清率 | < 10% | 每天 |

## 6. 反馈闭环

### 6.1 收集反馈

```typescript
interface UserFeedback {
  queryId: string;
  userInput: string;
  predictedIntent: UserIntent;
  actualIntent?: UserIntent;
  isCorrect: boolean;
  timestamp: number;
}

// 在响应中添加反馈按钮
function addFeedbackButtons(response: Response): Response {
  return {
    ...response,
    feedback: {
      question: '这个回答有帮助吗？',
      options: [
        { label: '👍 有帮助', value: 'correct' },
        { label: '👎 不是我想要的', value: 'incorrect' }
      ]
    }
  };
}
```

### 6.2 优化规则

```typescript
// 每周分析反馈数据
async function analyzeAndOptimize() {
  const incorrectCases = await db.query(`
    SELECT userInput, predictedIntent, actualIntent, COUNT(*) as count
    FROM feedback
    WHERE isCorrect = false
    GROUP BY userInput, predictedIntent, actualIntent
    ORDER BY count DESC
    LIMIT 20
  `);

  // 为高频错误案例添加规则
  for (const case of incorrectCases) {
    if (case.count > 10) {
      console.log(`建议添加规则：${case.userInput} -> ${case.actualIntent}`);
      // 自动生成规则建议
      const rule = generateRuleSuggestion(case);
      await notifyAdmin(rule);
    }
  }
}
```

## 7. 成本估算

### 7.1 Token消耗计算

```
假设：
- 日均查询：10,000次
- 缓存命中率：30%
- 规则匹配率：60%
- 关键词匹配率：25%
- LLM调用率：15%

实际LLM调用：10,000 * (1 - 0.3 - 0.6) * 0.15 = 150次/天

Token消耗：
- 输入：150次 * 150 token = 22,500 token/天
- 输出：150次 * 50 token = 7,500 token/天
- 总计：30,000 token/天

月度成本（假设$0.01/1K token）：
30,000 * 30 * 0.01 / 1000 = $9/月
```

### 7.2 优化前后对比

| 指标 | 优化前 | 优化后 | 改善 |
|------|--------|--------|------|
| 平均响应时间 | 1.5s | 0.3s | 80% ↓ |
| LLM调用率 | 100% | 15% | 85% ↓ |
| Token消耗 | 300/query | 45/query | 85% ↓ |
| 月度成本 | $90 | $9 | 90% ↓ |
| 准确率 | 85% | 92% | 7% ↑ |

## 8. 实施计划

### Phase 1: 基础优化（1天）
- [ ] 实现查询缓存
- [ ] 优化强制规则
- [ ] 添加置信度阈值判断

### Phase 2: 分层架构（2天）
- [ ] 实现完整的4层架构
- [ ] 添加性能监控
- [ ] 优化LLM prompt

### Phase 3: 用户反馈（1天）
- [ ] 添加反馈按钮
- [ ] 实现反馈收集
- [ ] 建立分析流程

### Phase 4: 持续优化（持续）
- [ ] 每周审查性能指标
- [ ] 根据反馈优化规则
- [ ] 调整置信度阈值

## 9. 总结

**核心原则**：
1. **快速路径优先**：80%的查询用规则解决
2. **按需使用LLM**：只在必要时调用
3. **用户参与**：不确定时让用户选择
4. **持续优化**：基于反馈不断改进

**预期效果**：
- 响应速度提升80%
- Token消耗降低85%
- 准确率提升7%
- 用户体验显著改善

**关键成功因素**：
- 高质量的强制规则
- 合理的置信度阈值
- 有效的缓存策略
- 持续的反馈闭环
