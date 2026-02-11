# AI智能问答Agent - 技术深度解析
## 因果推理诊断系统的工程化实现

**文档目的**: 为简历和面试准备，深度阐述AI智能问答Agent的技术实现细节

---

## 📊 核心定位

### 技术定位：因果推理诊断系统（类GraphRAG架构）

**✅ 不是：**
- ❌ 传统RAG（文档检索 + 生成）
- ❌ 简单的案例匹配系统
- ❌ 关键词匹配的Chatbot

**✅ 是：**
- ✅ 因果推理诊断系统
- ✅ 多跳推理架构
- ✅ LLM驱动的结构化查询理解

---

## 🎯 三视角价值阐述

### 1. 产品视角：为什么要做AI问答？

#### Dashboard的根本性局限

| 维度 | Dashboard（旧） | AI问答Agent（新） | 根本性区别 |
|------|----------------|------------------|-----------|
| **交互方式** | 被动查看固定报表 | 主动提问，自然语言交互 | 从"看数据"到"问问题" |
| **信息获取** | 需要翻页、筛选、点击 | 一句话直达答案 | 效率提升10倍 |
| **诊断深度** | 只展示指标异常 | 追溯根本原因+证据链 | 从"是什么"到"为什么" |
| **决策支持** | 需要人工分析判断 | AI给出诊断+推荐措施 | 从"数据展示"到"决策建议" |
| **学习成本** | 需要培训，记住在哪个页面 | 零学习成本，像聊天一样 | 用户体验质的飞跃 |

#### 具体场景对比

**场景1：查询高风险商户**
- **Dashboard**: 首页→商户列表→筛选风险等级→手动数数→切换月份对比（耗时2分钟）
- **AI问答**: "这个月多少高风险商户，和上月比怎么样？" → 3秒得到答案

**场景2：诊断商户问题**
- **Dashboard**: 看到"海底捞营收低" → 需要自己分析：是客流？客单价？翻台率？位置？（耗时30分钟）
- **AI问答**: "海底捞为什么营收低？" → AI直接给出：位置劣势（主因）→ 3层客流低40% → 翻台率1.2次/天

#### 业务价值量化

- **晨会数据准备**: 2小时 → 5分钟（⬇96%）
- **决策效率**: 需要人工分析30分钟 → AI 3秒给出诊断
- **诊断准确率**: 60% → 90%（⬆50%）
- **用户满意度**: 从"答非所问"投诉 → "精准诊断"好评

---

### 2. 技术视角：因果推理 vs 传统RAG

#### 传统RAG的局限

```
用户："海底捞为什么营收低？"
↓
向量检索：找到相似案例"某餐饮店营收低"
↓
LLM生成：根据案例，可能是客流少、菜品问题...（泛泛而谈）
```

#### 因果推理方案（我的实现）

```
用户："海底捞为什么营收低？"
↓
Step 1: 结构化解析
  - 查询类型：causal_analysis（因果分析）
  - 目标商户：海底捞
  - 意图：root_cause_diagnosis（根因诊断）

↓
Step 2: 多跳推理
  Hop 1: 提取商户指标
    - 营收：低
    - 客流：少
    - 翻台率：1.2次/天
    - 位置：3层

  Hop 2: 关联分析
    - 翻台率1.2 vs 行业标准3.0 → 显著偏低
    - 3层 vs 1-2层客流 → 低40%
    - 租售比28% vs 警戒线25% → 超标

  Hop 3: 因果推理
    - 根因1：位置劣势（主因，90%置信度）
      证据：3层客流比1-2层低40%
      影响链：位置差 → 客流少 → 翻台率低 → 营收低
    - 根因2：租金压力（次因，80%置信度）
      证据：租售比28%超警戒线
      影响链：租金高 → 成本压力 → 利润低

↓
Step 3: 证据链构建
  输出：位置劣势（主因，90%）→ 3层客流低40% → 翻台率1.2次/天（行业3.0次）→ 营收低
```

#### 核心技术差异

| 技术点 | 传统RAG | 因果推理方案 |
|--------|---------|-------------|
| **查询理解** | 关键词匹配 | LLM结构化解析（自然语言→JSON） |
| **检索方式** | 向量相似度 | 多维度关联分析（业态+标签+症状+指标） |
| **推理深度** | 单次检索 | 多跳推理（3跳：指标→关联→根因） |
| **诊断逻辑** | 案例相似度 | 因果链推理（A→B→C） |
| **置信度** | 无 | 基于数据证据的置信度计算 |
| **输出** | 相似案例 | 根因+证据链+置信度 |

#### 代码证据

- `query-analyzer.ts:54-73`: LLM驱动的结构化查询理解
- `ai-diagnosis-engine.ts:8-11`: 因果推理（根因vs症状、问题关联链）
- `ai-diagnosis-engine.ts:673-798`: LLM因果关系分析

---

### 3. 业务视角：深维为什么需要这个模块？

#### 业务痛点

**痛点1：运营人员不会用Dashboard**
- 现状：Dashboard有20+页面，运营人员不知道去哪找数据
- 问题：培训成本高，使用率低
- AI问答解决：自然语言交互，零学习成本

**痛点2：数据看得到，原因分析不出来**
- 现状：Dashboard显示"海底捞营收低"，但不知道为什么
- 问题：需要运营经理人工分析，耗时30分钟
- AI问答解决：AI自动因果推理，3秒给出根因+证据

**痛点3：晨会数据准备耗时长**
- 现状：每天早上需要2小时整理数据（高风险商户、对比分析、趋势）
- 问题：效率低，容易出错
- AI问答解决：一句话查询，5分钟完成所有数据准备

**痛点4：决策依赖经验，缺乏数据支撑**
- 现状：运营经理凭经验判断，"我觉得是位置问题"
- 问题：主观性强，说服力不足
- AI问答解决：AI给出数据证据"3层客流比1-2层低40%"

---

## 🔧 核心技术实现

### 技术1：Prompt工程 - 结构化查询理解

#### 3层Prompt设计

**第1层：任务定义 + 上下文注入**
```typescript
# 任务
将用户查询转为结构化JSON格式。你是查询解析专家，需要准确识别查询类型和提取实体。

# 用户输入
"这个月多少高风险商户"

# 对话上下文
- 最近讨论商户：海底捞
- 上一轮意图：health_query
- 最近消息：海底捞怎么样 / 有风险吗 / 这个月多少高风险商户
```

**为什么这样设计？**
- **上下文注入**：解决"小龙坎呢？"这种省略主语的follow-up问题
- **最近消息**：让LLM理解对话流，提高意图识别准确率

---

**第2层：规则定义 + Few-shot示例**
```typescript
# 查询类型识别规则

## 1. comparison (对比查询)
**触发条件**：包含"对比"、"比较"、"vs"、"和...相比"等词
**示例**：
- "对比海底捞和小龙坎" → { type: "comparison", entities: { merchants: ["海底捞", "小龙坎"], comparisonTarget: "merchant_vs_merchant" } }
- "海底捞和上月对比" → { type: "comparison", entities: { merchants: ["海底捞"], comparisonTarget: "last_month" } }

## 2. aggregation (聚合统计)
**触发条件**：包含"多少"、"几个"、"数量"、"统计"、"有哪些"
**示例**：
- "有几家高风险商户" → { type: "aggregation", filters: { riskLevel: ["high"] }, aggregations: { operation: "count" } }
```

**为什么这样设计？**
- **Few-shot Learning**：通过示例教LLM如何解析，比纯指令更准确
- **触发条件明确**：减少LLM的模糊判断，提高一致性

---

**第3层：Schema约束 + 关键约束**
```typescript
# 输出格式 (严格JSON，不要有任何额外文字)
{
  "type": "single_merchant | aggregation | comparison | trend_analysis",
  "entities": {
    "merchants": ["商户名1", "商户名2"],
    "timeRange": { "period": "current_month | last_month | ..." }
  },
  "intents": ["health_query", "risk_diagnosis", ...],
  "filters": { "riskLevel": ["high", "critical"] },
  "aggregations": { "operation": "count | sum | avg" },
  "confidence": 0.0-1.0
}

# 关键约束
1. ⚠️ 对于对比查询，**必须**正确提取merchants数组（商户名称，不要包含"对比"等关键词）
2. ⚠️ 只返回JSON，不要有任何解释文字
3. ⚠️ merchants字段是字符串数组，不是对象数组
```

**为什么这样设计？**
- **Schema定义**：明确每个字段的类型和可选值，减少LLM的随意发挥
- **关键约束**：针对实际测试中发现的LLM常见错误

#### 代码位置
- `query-analyzer.ts:229-345`: buildAnalysisPrompt()
- `query-analyzer.ts:186-224`: analyzeWithLLM()

---

### 技术2：Schema定义 + 错误处理机制

#### 为什么需要Schema定义？

**作用1：约束LLM输出格式**
```typescript
// 没有Schema的问题：
{
  "merchants": "海底捞",  // ❌ 应该是数组
  "type": "查询商户",      // ❌ 应该是枚举值
  "confidence": "很高"     // ❌ 应该是数字
}

// 有Schema后：
{
  "merchants": ["海底捞"],           // ✅ 数组
  "type": "single_merchant",         // ✅ 枚举值
  "confidence": 0.9                  // ✅ 数字
}
```

**作用2：提供类型安全**
```typescript
export interface StructuredQuery {
  originalInput: string;
  type: QueryType;  // 枚举类型，只能是4个值之一
  entities: {
    merchants?: string[];  // 明确是字符串数组
    timeRange?: TimeRange;
  };
  intents: UserIntent[];
  confidence: number;  // 0-1之间的数字
}
```

#### 3层错误处理机制

**第1层：LLM响应解析**
```typescript
private parseLLMResponse(content: string): Partial<StructuredQuery> {
  try {
    // 提取JSON（可能包含在```json```代码块中）
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) ||
                     content.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('No JSON found in LLM response');
    }

    const json = JSON.parse(jsonMatch[1] || jsonMatch[0]);
    return json;
  } catch (error) {
    console.error('[QueryAnalyzer] Failed to parse LLM response:', error);
    throw error;  // 抛出错误，触发降级
  }
}
```

**第2层：规则验证和修正**
```typescript
private validateAndFix(llmResult: StructuredQuery, context: ConversationContext): StructuredQuery {
  const validated = { ...llmResult };

  // 验证1: 如果没有商户但有上下文，继承上下文
  if ((!validated.entities.merchants || validated.entities.merchants.length === 0) && context.merchantName) {
    validated.entities.merchants = [context.merchantName];
  }

  // 验证2: aggregation查询必须有operation
  if (validated.type === 'aggregation' && !validated.aggregations?.operation) {
    validated.aggregations = { operation: 'count', ...(validated.aggregations || {}) };
  }

  return validated;
}
```

**第3层：降级机制**
```typescript
try {
  const llmResult = await this.analyzeWithLLM(inputToAnalyze, context);
  const validated = this.validateAndFix(llmResult, context);
  return validated;
} catch (error) {
  console.error('[QueryAnalyzer] Analysis failed:', error);
  // 降级：返回保守的single_merchant查询
  return this.createFallbackQuery(inputToAnalyze, context);
}
```

#### 代码位置
- `query-analyzer.ts:350-374`: parseLLMResponse()
- `query-analyzer.ts:379-399`: validateAndFix()
- `query-analyzer.ts:68-72`: 降级机制

---

### 技术3：置信度计算机制

#### 2种置信度计算方式

**方式1：LLM直接给出置信度（主要方式）**

**Prompt设计：**
```typescript
# ⭐详细运营数据（实际采集）
- 日均客流：120人次
- 翻台率：1.2次/天
- 楼层：3层
- 3km内竞品：8家

⚠️ 以上数据为**真实采集数据**，请在分析中优先使用，避免基于假设推测。

# 输出格式
{
  "rootCauses": [
    {
      "cause": "根因描述",
      "confidence": 90,  // ⭐ LLM直接给出置信度
      "evidence": ["证据1", "证据2"]
    }
  ]
}
```

**LLM如何判断置信度？**
```typescript
// LLM推理过程：
// 1. 有真实数据 → 置信度高（90%）
// 2. 数据明确（翻台率1.2 vs 行业标准3.0） → 置信度高
// 3. 只有健康度评分，无详细数据 → 置信度中等（70%）
// 4. 完全推测 → 置信度低（50%）
```

**实际案例：**
```json
{
  "rootCauses": [
    {
      "cause": "位置劣势",
      "confidence": 90,  // 高置信度
      "evidence": [
        "3层客流比1-2层低40%",
        "翻台率1.2次/天，远低于行业标准3.0次"
      ]
    },
    {
      "cause": "租金压力",
      "confidence": 80,  // 中高置信度
      "evidence": ["租售比28%，超过25%警戒线"]
    }
  ]
}
```

---

**方式2：规则验证和修正**

```typescript
function validateDiagnosisWithRules(
  llmAnalysis: Partial<EnhancedDiagnosisReport>,
  merchant: MerchantInfo
): Partial<EnhancedDiagnosisReport> {
  // 验证2: 置信度在合理范围（0-100）
  if (llmAnalysis.rootCauses) {
    llmAnalysis.rootCauses = llmAnalysis.rootCauses.map(rc => ({
      ...rc,
      confidence: Math.min(100, Math.max(0, rc.confidence)),  // 限制在0-100
    }));
  }

  // 验证4: 严重程度与指标一致性检查
  const avgScore = Object.values(merchant.metrics).reduce((a, b) => a + b, 0) / 5;
  if (avgScore < 40 && llmAnalysis.severity?.overall === 'low') {
    // 指标很差但LLM评级低 → 修正为high
    llmAnalysis.severity.overall = 'high';
  }

  return llmAnalysis;
}
```

**为什么需要规则验证？**
- **防止LLM幻觉**：LLM可能给出confidence: 150（超出范围）
- **逻辑一致性**：健康度平均分<40（极差），但LLM说"低风险" → 明显矛盾，需要修正

#### 置信度的3个来源

| 来源 | 置信度范围 | 示例 |
|------|-----------|------|
| **真实数据证据** | 85-95% | "翻台率1.2次/天（实际采集）vs 行业标准3.0次" |
| **健康度指标推断** | 70-85% | "经营表现35分（低） → 推测营收低" |
| **完全推测** | 50-70% | "无数据，根据业态特点推测可能是产品问题" |

#### 置信度的实际应用

**应用1：排序根因（主因 vs 次因）**
```typescript
rootCauses.sort((a, b) => b.confidence - a.confidence);
// 输出：
// 1. 位置劣势（主因，90%置信度）
// 2. 租金压力（次因，80%置信度）
```

**应用2：决定是否展示给用户**
```typescript
const highConfidenceRootCauses = rootCauses.filter(rc => rc.confidence > 70);
```

**应用3：标注推测性诊断**
```typescript
if (rootCause.confidence < 70) {
  diagnosis += "（推测，建议进一步核实）";
}
```

#### 代码位置
- `ai-diagnosis-engine.ts:673-798`: analyzeCausalRelations()
- `ai-diagnosis-engine.ts:803-833`: validateDiagnosisWithRules()

---

## 🎤 面试话术准备

### Level 1: 2分钟电梯演讲

"我设计了一个AI智能问答Agent，解决运营人员'看得到数据，分析不出原因'的痛点。核心创新是**因果推理诊断**：不是简单的文档检索，而是通过多跳推理追溯根本原因。比如用户问'海底捞为什么营收低'，系统会进行3跳推理：第1跳提取商户指标，第2跳关联分析发现翻台率1.2次/天远低于行业标准3.0次，第3跳因果推理得出根因是位置劣势（3层客流比1-2层低40%），并给出90%置信度。这让诊断从'营收低'升级为'位置劣势→客流少→翻台率低→营收低'的完整证据链，查询理解准确率>90%，晨会数据准备从2小时降到5分钟。"

---

### Level 2: 10分钟技术深度

**面试官追问："你说的因果推理具体怎么实现的？"**

"我设计了一个3层推理架构：

**第1层：结构化查询理解**
- 用LLM将自然语言转为JSON：'这个月多少高风险商户' → `{type: 'aggregation', filters: {riskLevel: ['high']}, aggregations: {operation: 'count'}}`
- 关键是Prompt工程，我设计了3层Prompt：任务定义+上下文注入、规则定义+Few-shot示例、Schema约束+关键约束
- 还有3层错误处理：LLM响应解析、规则验证修正、降级机制

**第2层：多跳推理**
- Hop 1：提取商户指标（营收、客流、翻台率、位置）
- Hop 2：关联分析（翻台率1.2 vs 行业标准3.0，3层 vs 1-2层客流）
- Hop 3：因果推理（位置劣势 → 客流少 → 翻台率低 → 营收低）

**第3层：证据链构建**
- 每个根因都有置信度（基于数据证据）
- LLM根据数据质量判断：真实数据85-95%，健康度指标推断70-85%，完全推测50-70%
- 规则验证防止LLM幻觉：置信度限制在0-100，逻辑一致性检查

这和传统RAG的区别是：RAG只做向量检索，我做的是因果推理。"

---

### Level 3: 30分钟系统设计

**面试官追问："如果让你用GraphRAG重新设计，你会怎么做？"**

"我会这样设计：

**当前方案（类GraphRAG）：**
- 优势：轻量级，不需要图数据库，开发快
- 劣势：推理深度受限，无法处理复杂的多层因果关系

**GraphRAG升级方案：**
1. **知识图谱构建**：
   - 节点：商户、指标、问题标签、根因、案例、解决方案
   - 边：因果关系、对比关系、时序关系、证据关系

2. **图遍历算法**：
   - 使用BFS进行多跳推理
   - 支持更复杂的因果链（5跳以上）

3. **子图构建**：
   - 根据查询动态提取相关子图
   - 在子图上进行推理，效率更高

**权衡取舍：**
- 当前阶段：MVP验证，类GraphRAG足够
- 未来规划：如果商户数>1000，案例数>10000，再升级到GraphRAG

这展示了我的架构演进思维：先用轻量级方案验证，再根据业务规模升级。"

---

## 📈 量化成果

| 指标 | 改进前 | 改进后 | 提升幅度 |
|------|--------|--------|---------|
| **查询理解准确率** | 60% | >90% | ⬆50% |
| **晨会数据准备时间** | 2小时 | 5分钟 | ⬇96% |
| **诊断深度** | "营收低"（症状） | "位置劣势→客流少→翻台率低→营收低"（根因+证据链） | 质的飞跃 |
| **决策效率** | 30分钟人工分析 | 3秒AI诊断 | ⬆600倍 |
| **用户满意度** | "答非所问"投诉 | "精准诊断"好评 | 质的飞跃 |

---

## 🔗 关键代码位置

| 功能模块 | 文件路径 | 关键函数 |
|---------|---------|---------|
| **结构化查询理解** | `skills/ai-assistant/query-analyzer.ts` | `analyze()`, `buildAnalysisPrompt()` |
| **因果推理诊断** | `skills/ai-diagnosis-engine.ts` | `generateEnhancedDiagnosisReport()`, `analyzeCausalRelations()` |
| **错误处理** | `skills/ai-assistant/query-analyzer.ts` | `parseLLMResponse()`, `validateAndFix()` |
| **置信度计算** | `skills/ai-diagnosis-engine.ts` | `validateDiagnosisWithRules()` |

---

## ✅ 核心竞争力总结

1. **Prompt工程能力**：3层Prompt设计（任务定义+Few-shot+Schema约束），查询理解准确率>90%
2. **工程化思维**：3层错误处理机制（解析+验证+降级），确保系统鲁棒性
3. **AI应用深度**：因果推理+多跳推理+置信度计算，不是简单调用LLM API
4. **产品思维**：从用户痛点出发（Dashboard局限性），设计AI问答解决方案
5. **架构演进思维**：当前类GraphRAG方案 → 未来GraphRAG升级路径

---

**文档版本**: v1.0
**最后更新**: 2026-02-11
**作者**: 何雨轩
