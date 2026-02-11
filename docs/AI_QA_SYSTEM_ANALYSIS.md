# AI智能问答系统 - 答非所问问题的系统性分析与解决方案

## 作者：产品架构师视角
## 日期：2026-02-11

---

## 一、问题现象回顾

### 典型案例
1. **用户问**："星巴克有什么风险？"
   **系统答**：海底捞的信息（答非所问）

2. **历史问题**（推测）：
   - 用户切换商户时，系统仍然返回上一个商户的信息
   - 用户明确提到商户名称，系统却使用上下文中的其他商户
   - 多轮对话中，商户识别混乱

---

## 二、根本原因分析（架构层面）

### 2.1 架构设计缺陷

#### 问题1：过度依赖上下文（Context Over-Reliance）

**现状**：
```
用户输入 → EnhancedContextManager.enhanceUserInput()
         → 自动应用"指代消解"和"省略补全"
         → 可能错误地替换/补全商户名称
         → 传递给后续模块
```

**缺陷**：
- **假设错误**：系统假设用户总是在讨论上下文中的商户
- **优先级错误**：上下文优先级 > 用户明确输入
- **缺少验证**：没有验证"增强"后的输入是否合理

#### 问题2：多层实体提取，职责不清（Multi-Layer Entity Extraction）

**现状**：
```
Layer 1: EnhancedContextManager (省略补全)
         ↓
Layer 2: QueryAnalyzer (LLM分析)
         ↓
Layer 3: EntityExtractor (规则匹配)
         ↓
Layer 4: AgentRouter (实体解析)
```

**缺陷**：
- **职责重叠**：4个模块都在做实体识别，互相干扰
- **信息丢失**：原始用户输入被多次转换，丢失原意
- **难以调试**：出问题时不知道是哪一层出错
- **性能浪费**：重复计算，LLM调用次数过多

#### 问题3：上下文管理策略错误（Context Management Strategy）

**现状**：
- 上下文中的商户会"粘性"保留
- 没有明确的上下文切换机制
- 用户明确提到新商户时，系统不会主动切换上下文

**缺陷**：
- **用户意图误判**：用户想切换商户，系统认为是省略主语
- **缺少显式切换**：没有"我现在要问星巴克"这样的切换机制
- **上下文污染**：旧商户信息污染新查询

---

### 2.2 技术实现问题

#### 问题1：正则表达式过于宽泛

```typescript
// 当前实现
/^有.*吗\??\s*$/  // 匹配"有风险吗"，但也匹配"星巴克有什么风险"
```

**问题**：
- 没有考虑输入中已经包含商户名的情况
- 正则表达式缺少负向断言（negative lookahead）

#### 问题2：实体提取逻辑不够健壮

```typescript
// 当前实现
const normalizedInput = this.normalize(userInput);
if (normalizedInput.includes(normalizedMerchantName)) {
  return match;
}
```

**问题**：
- 依赖简单的字符串包含，容易误匹配
- 没有考虑商户名称的变体（"星巴克" vs "星巴克咖啡"）
- 没有考虑同音字、错别字

#### 问题3：缺少置信度机制

**现状**：
- 实体提取返回单一结果，没有置信度
- 上下文增强是"全有或全无"，没有灰度
- 没有"不确定时询问用户"的机制

---

## 三、系统性解决方案

### 3.1 架构重构方案

#### 方案A：单一职责原则（推荐）⭐

**核心思想**：每个模块只做一件事，清晰的数据流

```
用户输入（原始）
    ↓
[1] 实体识别模块（唯一入口）
    - 输入：原始用户输入 + 上下文
    - 输出：候选实体列表 + 置信度
    - 职责：识别所有可能的实体
    ↓
[2] 实体消歧模块（新增）
    - 输入：候选实体 + 上下文 + 用户输入
    - 输出：最终实体 + 置信度
    - 职责：解决歧义，选择最合适的实体
    ↓
[3] 意图识别模块
    - 输入：用户输入 + 确定的实体
    - 输出：用户意图
    - 职责：理解用户想做什么
    ↓
[4] 执行模块
    - 输入：意图 + 实体
    - 输出：结果
    - 职责：执行具体操作
```

**优势**：
- ✅ 职责清晰，易于维护
- ✅ 数据流单向，易于调试
- ✅ 每个模块可独立测试
- ✅ 性能优化空间大

**实施步骤**：
1. 创建统一的 `EntityRecognitionService`
2. 废弃 `EnhancedContextManager` 的省略补全功能
3. 新增 `EntityDisambiguationService`
4. 重构 `AgentRouter` 的数据流

---

#### 方案B：显式上下文切换（辅助方案）

**核心思想**：用户明确提到新商户时，强制切换上下文

**实现**：
```typescript
class ContextSwitchDetector {
  detectSwitch(userInput: string, currentContext: Context): {
    shouldSwitch: boolean;
    newMerchant?: string;
    confidence: number;
  } {
    // 规则1：用户明确提到新商户名称
    const mentionedMerchants = this.extractMerchantNames(userInput);

    if (mentionedMerchants.length > 0) {
      const newMerchant = mentionedMerchants[0];

      // 检查是否与当前上下文不同
      if (currentContext.merchantName !== newMerchant) {
        return {
          shouldSwitch: true,
          newMerchant,
          confidence: 0.95
        };
      }
    }

    // 规则2：用户使用切换词（"换一个"、"看看其他"）
    const switchKeywords = ['换', '其他', '另一个', '别的'];
    if (switchKeywords.some(kw => userInput.includes(kw))) {
      return {
        shouldSwitch: true,
        confidence: 0.8
      };
    }

    return { shouldSwitch: false, confidence: 0 };
  }
}
```

**优势**：
- ✅ 解决上下文粘性问题
- ✅ 用户体验更自然
- ✅ 实现简单，风险低

---

### 3.2 技术实现优化

#### 优化1：实体识别增强

```typescript
class EnhancedEntityRecognizer {
  recognize(userInput: string, context: Context): EntityCandidate[] {
    const candidates: EntityCandidate[] = [];

    // 策略1：精确匹配（最高优先级）
    const exactMatch = this.exactMatch(userInput);
    if (exactMatch) {
      candidates.push({
        merchantId: exactMatch.id,
        merchantName: exactMatch.name,
        confidence: 1.0,
        source: 'exact_match'
      });
    }

    // 策略2：模糊匹配
    const fuzzyMatches = this.fuzzyMatch(userInput);
    candidates.push(...fuzzyMatches.map(m => ({
      merchantId: m.id,
      merchantName: m.name,
      confidence: m.score,
      source: 'fuzzy_match'
    })));

    // 策略3：上下文推断（最低优先级）
    if (context.merchantId && this.shouldUseContext(userInput)) {
      candidates.push({
        merchantId: context.merchantId,
        merchantName: context.merchantName,
        confidence: 0.6,
        source: 'context'
      });
    }

    // 按置信度排序
    return candidates.sort((a, b) => b.confidence - a.confidence);
  }

  private shouldUseContext(userInput: string): boolean {
    // 只有在真正省略主语时才使用上下文
    const hasExplicitMerchant = this.hasExplicitMerchantName(userInput);
    const isPronouncedOmission = this.isPronounOrOmitted(userInput);

    return !hasExplicitMerchant && isPronouncedOmission;
  }

  private hasExplicitMerchantName(userInput: string): boolean {
    const allMerchants = merchantDataManager.getAllMerchants();
    return allMerchants.some(m => {
      const core = this.extractCore(m.name);
      return userInput.includes(core) || userInput.includes(m.name);
    });
  }
}
```

#### 优化2：实体消歧

```typescript
class EntityDisambiguationService {
  disambiguate(
    candidates: EntityCandidate[],
    userInput: string,
    context: Context
  ): EntityResult {
    if (candidates.length === 0) {
      return { matched: false, confidence: 0 };
    }

    if (candidates.length === 1) {
      return {
        matched: true,
        merchantId: candidates[0].merchantId,
        merchantName: candidates[0].merchantName,
        confidence: candidates[0].confidence
      };
    }

    // 多个候选，需要消歧
    const best = candidates[0];
    const second = candidates[1];

    // 如果最高分和次高分差距很大，直接返回最高分
    if (best.confidence - second.confidence > 0.3) {
      return {
        matched: true,
        merchantId: best.merchantId,
        merchantName: best.merchantName,
        confidence: best.confidence
      };
    }

    // 差距小，需要询问用户
    return {
      matched: false,
      confidence: 0,
      needsClarification: true,
      candidates: candidates.slice(0, 3),
      clarificationPrompt: `您是想问以下哪个商户？\n${candidates.map((c, i) => `${i + 1}. ${c.merchantName}`).join('\n')}`
    };
  }
}
```

#### 优化3：置信度阈值

```typescript
class ConfidenceThresholdManager {
  private thresholds = {
    high: 0.85,    // 直接执行
    medium: 0.6,   // 执行但标注不确定
    low: 0.4       // 询问用户确认
  };

  shouldExecute(confidence: number): {
    execute: boolean;
    askConfirmation: boolean;
    showWarning: boolean;
  } {
    if (confidence >= this.thresholds.high) {
      return { execute: true, askConfirmation: false, showWarning: false };
    }

    if (confidence >= this.thresholds.medium) {
      return { execute: true, askConfirmation: false, showWarning: true };
    }

    if (confidence >= this.thresholds.low) {
      return { execute: false, askConfirmation: true, showWarning: false };
    }

    return { execute: false, askConfirmation: false, showWarning: false };
  }
}
```

---

### 3.3 产品层面改进

#### 改进1：显式商户选择器

**UI设计**：
```
┌─────────────────────────────────┐
│ 当前商户：海底捞火锅 [切换]      │
├─────────────────────────────────┤
│ 💬 您：星巴克有什么风险？        │
│                                 │
│ 🤖 AI：检测到您提到了新商户     │
│    是否切换到"星巴克咖啡"？      │
│    [是，切换] [否，继续问海底捞] │
└─────────────────────────────────┘
```

**优势**：
- ✅ 用户明确知道当前讨论的商户
- ✅ 避免系统自作主张
- ✅ 降低答非所问的概率

#### 改进2：多商户对比模式

**场景**：用户想同时了解多个商户

**实现**：
```
用户：对比一下海底捞和星巴克

AI：已切换到"多商户对比模式"
    当前对比：海底捞火锅 vs 星巴克咖啡

    您可以问：
    - 哪个风险更高？
    - 营收对比
    - 健康度对比
```

#### 改进3：不确定时主动询问

**场景**：系统不确定用户意图时

**实现**：
```
用户：它有什么风险？

AI：⚠️ 抱歉，我不确定您指的是哪个商户。

    您是想问：
    1. 海底捞火锅（当前对话中的商户）
    2. 其他商户

    请选择或直接告诉我商户名称。
```

---

## 四、实施计划

### Phase 1：紧急修复（1天）✅ 已完成

- [x] 修复 `completeOmission` 的误判问题
- [x] 添加商户名称检测逻辑

### Phase 2：架构重构（3-5天）⭐ 推荐

#### Day 1-2：实体识别重构
- [ ] 创建 `EntityRecognitionService`（统一入口）
- [ ] 创建 `EntityDisambiguationService`（消歧）
- [ ] 废弃 `EnhancedContextManager` 的省略补全

#### Day 3：上下文管理优化
- [ ] 实现 `ContextSwitchDetector`
- [ ] 添加显式上下文切换机制
- [ ] 优化上下文优先级逻辑

#### Day 4：置信度机制
- [ ] 实现 `ConfidenceThresholdManager`
- [ ] 在所有模块中添加置信度返回
- [ ] 实现"不确定时询问用户"逻辑

#### Day 5：测试与优化
- [ ] 编写单元测试
- [ ] 端到端测试
- [ ] 性能优化

### Phase 3：产品优化（2-3天）

- [ ] 添加"当前商户"显示
- [ ] 实现商户切换确认对话框
- [ ] 添加多商户对比模式
- [ ] 优化错误提示和引导

---

## 五、成功指标

### 技术指标
- **实体识别准确率**：> 95%
- **上下文切换准确率**：> 90%
- **答非所问率**：< 5%
- **平均响应时间**：< 2秒

### 产品指标
- **用户满意度**：> 4.5/5
- **任务完成率**：> 85%
- **重试率**：< 10%

---

## 六、风险与挑战

### 风险1：重构影响现有功能
**缓解措施**：
- 采用渐进式重构
- 保留旧代码作为fallback
- 充分的回归测试

### 风险2：LLM调用成本增加
**缓解措施**：
- 优化提示词，减少token消耗
- 增加缓存机制
- 规则优先，LLM兜底

### 风险3：用户学习成本
**缓解措施**：
- 渐进式引入新功能
- 提供清晰的引导和提示
- 保持向后兼容

---

## 七、总结

### 核心问题
AI智能问答系统的"答非所问"问题，**根本原因不是某个bug，而是架构设计缺陷**：

1. **过度依赖上下文**，忽视用户明确输入
2. **多层实体提取**，职责不清，互相干扰
3. **缺少置信度机制**，系统过于"自信"
4. **缺少显式切换**，用户无法控制对话流程

### 解决方案
不是"遇到一个bug修一个bug"，而是：

1. **架构重构**：单一职责，清晰数据流
2. **置信度机制**：不确定时询问用户
3. **显式控制**：让用户掌控对话
4. **渐进优化**：分阶段实施，降低风险

### 下一步行动
建议立即启动 **Phase 2：架构重构**，从根本上解决问题，而不是继续打补丁。

---

**文档版本**：v1.0
**最后更新**：2026-02-11
**负责人**：产品架构师
