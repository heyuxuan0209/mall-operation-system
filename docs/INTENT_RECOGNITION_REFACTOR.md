# 意图识别系统重构方案

## 当前问题

### 1. 架构问题
- **过度依赖LLM**：QueryAnalyzer + IntentClassifier 两次LLM调用
- **不确定性高**：同样输入可能得到不同结果
- **维护成本高**：新增意图需要修改多处

### 2. 具体表现
- 用户说"历史帮扶档案"，LLM识别为 data_query
- 需要反复调整 prompt 才能让 LLM 理解
- 每次新增意图都要经历类似的debug过程

---

## 系统性解决方案

### 方案A：规则优先 + LLM辅助（推荐）

#### 架构
```
用户输入
  ↓
[1] 强制规则匹配（优先级最高）
  - 精确关键词匹配
  - 正则表达式匹配
  - 如果匹配成功，直接返回，不调用LLM
  ↓
[2] LLM语义理解（辅助）
  - 只处理规则无法覆盖的复杂查询
  - 作为补充，不是主要手段
  ↓
[3] 关键词匹配（fallback）
  - 如果LLM失败，使用关键词匹配
```

#### 实现
```typescript
class IntentRecognizer {
  recognize(userInput: string): UserIntent {
    // Step 1: 强制规则匹配（最高优先级）
    const forcedIntent = this.matchForcedRules(userInput);
    if (forcedIntent) {
      console.log('[IntentRecognizer] Forced rule matched:', forcedIntent);
      return forcedIntent;
    }

    // Step 2: LLM语义理解
    try {
      const llmIntent = await this.classifyWithLLM(userInput);
      return llmIntent;
    } catch (error) {
      console.warn('[IntentRecognizer] LLM failed, using keyword matching');
    }

    // Step 3: 关键词匹配（fallback）
    return this.matchKeywords(userInput);
  }

  private matchForcedRules(userInput: string): UserIntent | null {
    const rules = [
      {
        pattern: /(档案|历史帮扶|帮扶记录|帮扶档案|过往帮扶)/,
        intent: 'archive_query',
        priority: 10
      },
      {
        pattern: /(多少个|几个|统计|总共).*?(商户|店)/,
        intent: 'aggregation_query',
        priority: 9
      },
      {
        pattern: /(对比|比较|vs|和.*比)/,
        intent: 'comparison_query',
        priority: 9
      },
      // ... 更多规则
    ];

    // 按优先级排序
    rules.sort((a, b) => b.priority - a.priority);

    for (const rule of rules) {
      if (rule.pattern.test(userInput)) {
        return rule.intent;
      }
    }

    return null;
  }
}
```

#### 优势
- ✅ **确定性高**：关键词匹配100%准确
- ✅ **性能好**：大部分查询不需要调用LLM
- ✅ **易维护**：新增意图只需添加一条规则
- ✅ **可调试**：规则匹配过程清晰可见

---

### 方案B：统一意图识别器

#### 架构
```
用户输入
  ↓
[统一意图识别器]
  - 合并 QueryAnalyzer 和 IntentClassifier
  - 一次LLM调用完成所有分析
  - 减少不一致性
```

#### 实现
```typescript
class UnifiedIntentRecognizer {
  async analyze(userInput: string): Promise<{
    queryType: QueryType;
    intents: UserIntent[];
    entities: any;
    confidence: number;
  }> {
    // 一次LLM调用完成所有分析
    const prompt = `
分析用户查询，返回：
1. 查询类型（single_merchant/aggregation/comparison）
2. 意图列表（可能多个）
3. 实体信息
4. 置信度

用户输入："${userInput}"

返回JSON格式...
`;

    const result = await llmClient.chat(prompt);
    return this.parseResult(result);
  }
}
```

#### 优势
- ✅ **一致性好**：一次分析，避免冲突
- ✅ **性能好**：减少LLM调用次数
- ⚠️ **仍依赖LLM**：不确定性仍然存在

---

### 方案C：意图配置化

#### 架构
```typescript
// intents.config.ts
export const INTENT_CONFIG = {
  archive_query: {
    name: '历史帮扶档案查询',
    priority: 10,
    rules: [
      { type: 'keyword', patterns: ['档案', '历史帮扶', '帮扶记录'] },
      { type: 'regex', pattern: /查看.*档案/ },
    ],
    llmHint: '用户想查看历史帮扶档案、帮扶记录',
    examples: [
      '我想看下海底捞的历史帮扶档案',
      '查看帮扶记录',
      '有过往帮扶情况吗'
    ]
  },
  // ... 其他意图
};
```

#### 优势
- ✅ **集中管理**：所有意图配置在一个文件
- ✅ **易扩展**：新增意图只需添加配置
- ✅ **自动生成**：prompt、规则、文档自动生成

---

## 推荐实施方案

### Phase 1: 快速修复（1小时）
实施**方案A的强制规则匹配**：
1. 添加 `matchForcedRules` 方法
2. 为高优先级意图（archive_query、aggregation_query等）添加强制规则
3. 在 `classifyWithLLM` 之前先调用强制规则匹配

### Phase 2: 架构优化（2-3小时）
实施**方案C的意图配置化**：
1. 创建 `intents.config.ts` 配置文件
2. 重构 IntentClassifier 使用配置
3. 自动生成 LLM prompt

### Phase 3: 长期优化（持续）
1. 收集用户查询日志
2. 分析意图识别准确率
3. 持续优化规则和配置

---

## 立即行动

我现在就实施 **Phase 1: 快速修复**，添加强制规则匹配，确保档案查询等关键意图100%准确识别。

是否继续？
