/**
 * 意图分类器 ⭐v3.0重构
 * - 核心改进：LLM驱动的语义分类，替代关键词匹配
 * - 支持多意图识别（一句话多个意图）
 * - 动态调整置信度（基于上下文和复杂度）
 * - 保留关键词匹配作为 fallback
 */

import {
  UserIntent,
  IntentResult,
  IntentError,
  ConversationContext,
  StructuredQuery,
  LLMMessage,
} from '@/types/ai-assistant';
import { llmClient } from '@/utils/ai-assistant/llmClient';

interface KeywordWeight {
  keyword: string;
  weight: number;
}

interface IntentPattern {
  intent: UserIntent;
  keywords: KeywordWeight[];
  priority: number;
}

export class IntentClassifier {
  private patterns: IntentPattern[] = [
    // 健康度查询（🔥 提升优先级到3，与其他高优先级意图持平）
    {
      intent: 'health_query',
      priority: 3, // 🔥 从2提升到3
      keywords: [
        { keyword: '怎么样', weight: 12 }, // 🔥 提升权重
        { keyword: '如何', weight: 12 }, // 🔥 提升权重，在health_query中占主导
        { keyword: '健康', weight: 15 },
        { keyword: '评分', weight: 12 },
        { keyword: '状况', weight: 10 },
        { keyword: '情况', weight: 10 },
        { keyword: '表现', weight: 10 },
        { keyword: '经营', weight: 10 },
        { keyword: '运营', weight: 10 },
        // 时间相关
        { keyword: '最近', weight: 6 }, // 🔥 提升权重
        { keyword: '近期', weight: 6 },
        { keyword: '这段时间', weight: 5 },
        { keyword: '一个月', weight: 3 },
        { keyword: '两个月', weight: 3 },
        { keyword: '三个月', weight: 3 },
        { keyword: '一周', weight: 3 },
        { keyword: '一年', weight: 3 },
        { keyword: '这个月', weight: 3 },
        { keyword: '上个月', weight: 3 },
        { keyword: '这周', weight: 3 },
        { keyword: '上周', weight: 3 },
        { keyword: '今年', weight: 3 },
        { keyword: '去年', weight: 3 },
        { keyword: '现在', weight: 5 },
        { keyword: '当前', weight: 5 },
        { keyword: '目前', weight: 5 },
        { keyword: '分数', weight: 10 },
        { keyword: '得分', weight: 10 },
      ],
    },
    // 风险诊断（高优先级）
    {
      intent: 'risk_diagnosis',
      priority: 3,
      keywords: [
        { keyword: '风险', weight: 15 },
        { keyword: '问题', weight: 12 },
        { keyword: '诊断', weight: 15 },
        { keyword: '检测', weight: 10 },
        { keyword: '分析', weight: 10 },
        { keyword: '隐患', weight: 12 },
        { keyword: '异常', weight: 10 },
        { keyword: '预警', weight: 12 },
        { keyword: '危机', weight: 12 },
      ],
    },
    // 方案推荐（高优先级）
    {
      intent: 'solution_recommend',
      priority: 3,
      keywords: [
        { keyword: '方案', weight: 15 },
        { keyword: '建议', weight: 15 },
        { keyword: '措施', weight: 15 },
        { keyword: '推荐', weight: 12 },
        { keyword: '怎么办', weight: 12 },
        // 🔥 移除"如何"，避免与health_query冲突
        { keyword: '帮扶', weight: 12 },
        { keyword: '改善', weight: 12 }, // 🔥 提升权重
        { keyword: '提升', weight: 10 },
        { keyword: '解决', weight: 10 },
        { keyword: '策略', weight: 10 },
      ],
    },
    // 数据查询
    {
      intent: 'data_query',
      priority: 1,
      keywords: [
        { keyword: '营收', weight: 10 },
        { keyword: '收入', weight: 10 },
        { keyword: '销售', weight: 10 },
        { keyword: '客流', weight: 10 },
        { keyword: '满意度', weight: 10 },
        { keyword: '租金', weight: 10 },
        { keyword: '成本', weight: 10 },
        { keyword: '数据', weight: 8 },
        { keyword: '指标', weight: 8 },
        { keyword: '多少', weight: 8 },
      ],
    },
    // ⭐v3.0新增: 聚合查询
    {
      intent: 'aggregation_query',
      priority: 4, // 高优先级
      keywords: [
        { keyword: '多少', weight: 15 },
        { keyword: '几个', weight: 15 },
        { keyword: '统计', weight: 15 },
        { keyword: '总共', weight: 12 },
        { keyword: '数量', weight: 12 },
        { keyword: '有哪些', weight: 10 },
        { keyword: '全部', weight: 10 },
        { keyword: '所有', weight: 10 },
      ],
    },
    // ⭐v3.0新增: 风险统计
    {
      intent: 'risk_statistics',
      priority: 3,
      keywords: [
        { keyword: '风险统计', weight: 20 },
        { keyword: '风险分布', weight: 18 },
        { keyword: '高风险商户', weight: 15 },
        { keyword: '问题商户', weight: 12 },
      ],
    },
    // ⭐v3.0新增: 对比查询
    {
      intent: 'comparison_query',
      priority: 4,
      keywords: [
        { keyword: '对比', weight: 18 },
        { keyword: '比较', weight: 18 },
        { keyword: 'vs', weight: 15 },
        { keyword: '和...比', weight: 15 },
        { keyword: '相比', weight: 12 },
        { keyword: '差异', weight: 10 },
      ],
    },
    // ⭐v3.0新增: 趋势分析
    {
      intent: 'trend_analysis',
      priority: 3,
      keywords: [
        { keyword: '趋势', weight: 18 },
        { keyword: '走势', weight: 15 },
        { keyword: '变化', weight: 12 },
        { keyword: '增长', weight: 10 },
        { keyword: '下降', weight: 10 },
        { keyword: '波动', weight: 10 },
      ],
    },
  ];

  /**
   * ⭐v3.0核心方法: LLM驱动的意图识别
   * 支持多意图识别、语义理解、动态置信度
   */
  async classifyWithLLM(
    structuredQuery: StructuredQuery,
    context: ConversationContext
  ): Promise<IntentResult[]> {
    try {
      if (!llmClient) {
        // 降级到关键词匹配
        console.warn('[IntentClassifier] LLM not available, falling back to keyword matching');
        return [this.classifyWithContext(structuredQuery.originalInput, context)];
      }

      const prompt = this.buildLLMPrompt(structuredQuery, context);
      const messages: LLMMessage[] = [
        {
          role: 'system',
          content: '你是商户运营AI助手的意图识别专家，擅长理解用户真实意图。',
        },
        {
          role: 'user',
          content: prompt,
        },
      ];

      const response = await llmClient.chat(messages, { useCache: true });
      const intents = this.parseLLMIntents(response.content);

      return intents;
    } catch (error) {
      console.error('[IntentClassifier] LLM classification failed:', error);
      // 降级到关键词匹配
      return [this.classifyWithContext(structuredQuery.originalInput, context)];
    }
  }

  /**
   * 构建LLM提示词
   */
  private buildLLMPrompt(
    query: StructuredQuery,
    context: ConversationContext
  ): string {
    const availableIntents = `
单商户查询意图:
- health_query: 查询商户健康度、评分、整体状况
- risk_diagnosis: 诊断商户风险、发现问题、分析异常
- solution_recommend: 推荐帮扶方案、措施、解决策略
- data_query: 查询具体数据指标（营收、租金、客流）

聚合统计意图 ⭐v3.0新增:
- aggregation_query: 聚合查询（"多少个"、"统计"、"总共"）
- risk_statistics: 风险统计（"高风险商户数量"、"风险分布"）
- health_overview: 整体健康度概览

对比分析意图 ⭐v3.0新增:
- comparison_query: 对比分析（"vs上月"、"和xxx比"、"差异"）
- trend_analysis: 趋势分析（"走势"、"变化趋势"、"增长率"）

复合查询意图 ⭐v3.0新增:
- composite_query: 包含多个子意图的复杂查询

其他:
- general_chat: 闲聊、打招呼
- unknown: 无法识别
`;

    return `
# 任务
识别用户查询中的所有意图，可能包含多个意图。

# 用户输入
"${query.originalInput}"

# 查询结构化信息
- 查询类型: ${query.type}
- 实体: ${JSON.stringify(query.entities)}
- 筛选条件: ${JSON.stringify(query.filters || {})}

# 对话上下文
- 上一轮意图: ${context.lastIntent || '无'}
- 讨论商户: ${context.merchantName || '无'}

# 可用意图类型
${availableIntents}

# 输出格式 (严格JSON)
\`\`\`json
[
  {
    "intent": "意图类型",
    "confidence": 0.0-1.0,
    "reason": "识别原因"
  },
  ...
]
\`\`\`

# 识别规则
1. 如果查询类型是aggregation，必须包含aggregation_query或risk_statistics
2. 如果查询类型是comparison，必须包含comparison_query
3. 一句话可能包含多个意图，例如："这个月多少高风险商户，和上月比怎么样" → [aggregation_query, comparison_query]
4. 置信度评估：明确指令0.9+，常规查询0.7-0.8，模糊查询0.5-0.6
5. 如果上一轮意图是health_query且当前问"问题在哪"，应识别为risk_diagnosis

现在请识别用户意图，返回JSON数组（只返回JSON，不要其他解释）。
`.trim();
  }

  /**
   * 解析LLM返回的意图列表
   */
  private parseLLMIntents(content: string): IntentResult[] {
    try {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) ||
                       content.match(/\[[\s\S]*\]/);

      if (!jsonMatch) {
        throw new Error('No JSON found in LLM response');
      }

      const intents = JSON.parse(jsonMatch[1] || jsonMatch[0]);

      return intents.map((item: any) => ({
        intent: item.intent as UserIntent,
        confidence: item.confidence,
        keywords: [item.reason || ''], // 用reason作为关键词
      }));
    } catch (error) {
      console.error('[IntentClassifier] Failed to parse LLM intents:', error);
      return [{
        intent: 'unknown',
        confidence: 0.3,
        keywords: [],
      }];
    }
  }

  /**
   * 提取多个意图（从LLM结果中）
   */
  extractMultipleIntents(results: IntentResult[]): UserIntent[] {
    return results
      .filter(r => r.confidence > 0.6) // 只保留置信度>0.6的
      .map(r => r.intent);
  }

  /**
   * 识别用户意图（带上下文感知）
   */
  classifyWithContext(userInput: string, context?: ConversationContext): IntentResult {
    if (!userInput || userInput.trim().length === 0) {
      throw new IntentError('Empty user input');
    }

    const normalizedInput = this.normalize(userInput);

    // 计算每个意图的得分
    const scores: { intent: UserIntent; score: number; matchedKeywords: string[] }[] = [];

    for (const pattern of this.patterns) {
      let { score, matchedKeywords } = this.calculateScore(normalizedInput, pattern);

      // 🔥 核心改进：上下文权重调整
      if (context) {
        score = this.adjustScoreWithContext(score, pattern.intent, context, userInput);
      }

      if (score > 0) {
        // 应用优先级权重
        const finalScore = score * pattern.priority;
        scores.push({
          intent: pattern.intent,
          score: finalScore,
          matchedKeywords,
        });
      }
    }

    // 按得分排序
    scores.sort((a, b) => b.score - a.score);

    // 如果没有匹配到任何意图
    if (scores.length === 0 || scores[0].score < 5) {
      return {
        intent: 'general_chat',
        confidence: 0.3,
        keywords: [],
      };
    }

    const topResult = scores[0];
    const secondResult = scores[1];

    // 🔥 重构：使用相对置信度计算
    // 策略：基于第一名和第二名的差距，而非绝对值
    let confidence: number;

    if (!secondResult || secondResult.score === 0) {
      // 只有一个匹配，置信度基于绝对分数
      if (topResult.score >= 30) {
        confidence = 0.95;
      } else if (topResult.score >= 20) {
        confidence = 0.85;
      } else if (topResult.score >= 10) {
        confidence = 0.7;
      } else {
        confidence = 0.5;
      }
    } else {
      // 多个匹配，置信度基于相对差距
      const gap = topResult.score - secondResult.score;
      const ratio = topResult.score / secondResult.score;

      if (gap >= 20 && ratio >= 1.5) {
        confidence = 0.95; // 第一名明显领先
      } else if (gap >= 10 && ratio >= 1.3) {
        confidence = 0.85; // 第一名较为领先
      } else if (gap >= 5 && ratio >= 1.2) {
        confidence = 0.7; // 第一名略微领先
      } else {
        confidence = 0.5; // 两者接近，不确定
      }

      // 如果第一名绝对分数很高，提升置信度
      if (topResult.score >= 30) {
        confidence = Math.max(confidence, 0.85);
      }
    }

    return {
      intent: topResult.intent,
      confidence,
      keywords: topResult.matchedKeywords,
    };
  }

  /**
   * 识别用户意图（无上下文）
   */
  classify(userInput: string): IntentResult {
    return this.classifyWithContext(userInput);
  }

  /**
   * 🔥 新增：根据上下文调整意图得分
   */
  private adjustScoreWithContext(
    baseScore: number,
    intent: UserIntent,
    context: ConversationContext,
    userInput: string
  ): number {
    let adjusted = baseScore;

    // 规则1：health_query → risk_diagnosis/solution_recommend（提升50%）
    if (
      context.lastIntent === 'health_query' &&
      (intent === 'risk_diagnosis' || intent === 'solution_recommend')
    ) {
      adjusted *= 1.5;
    }

    // 规则2：risk_diagnosis → solution_recommend（提升30%）
    if (context.lastIntent === 'risk_diagnosis' && intent === 'solution_recommend') {
      adjusted *= 1.3;
    }

    // 规则3：短查询 + 有上下文商户（提升40%）
    const isShortQuery = userInput.length < 5;
    if (isShortQuery && context.merchantId) {
      const followUpIntents: UserIntent[] = ['risk_diagnosis', 'solution_recommend', 'data_query'];
      if (followUpIntents.includes(intent)) {
        adjusted *= 1.4;
      }
    }

    // 规则4：意图历史倾向（连续3次相同意图类型，略降权重避免陷入单一意图）
    if (context.intentHistory && context.intentHistory.length >= 3) {
      const recent3 = context.intentHistory.slice(-3);
      const allSameIntent = recent3.every((h) => h.intent === intent);
      if (allSameIntent && intent !== 'general_chat') {
        adjusted *= 0.9; // 降低10%避免意图固化
      }
    }

    // 规则5：问题词 + 上一轮是健康查询 → 强力提升 risk_diagnosis
    const hasProblemWords = /问题|风险|隐患/.test(userInput);
    if (hasProblemWords && context.lastIntent === 'health_query' && intent === 'risk_diagnosis') {
      adjusted *= 1.8;
    }

    return adjusted;
  }

  /**
   * 计算意图得分
   */
  private calculateScore(
    input: string,
    pattern: IntentPattern
  ): { score: number; matchedKeywords: string[] } {
    let score = 0;
    const matchedKeywords: string[] = [];

    for (const { keyword, weight } of pattern.keywords) {
      if (input.includes(keyword)) {
        score += weight;
        matchedKeywords.push(keyword);
      }
    }

    return { score, matchedKeywords };
  }

  /**
   * 标准化输入文本
   */
  private normalize(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '') // 移除空格
      .replace(/[，。！？；：""''（）【】《》]/g, ''); // 移除标点符号
  }

  /**
   * 批量识别意图
   */
  classifyBatch(inputs: string[]): IntentResult[] {
    return inputs.map((input) => this.classify(input));
  }

  /**
   * 验证意图识别结果
   */
  isConfident(result: IntentResult, threshold: number = 0.6): boolean {
    return result.confidence >= threshold;
  }

  /**
   * 获取意图的详细描述
   */
  getIntentDescription(intent: UserIntent): string {
    const descriptions: Record<UserIntent, string> = {
      health_query: '查询商户健康度和基本状况',
      risk_diagnosis: '诊断商户风险和问题',
      solution_recommend: '推荐帮扶方案和措施',
      data_query: '查询具体数据指标',
      archive_query: '查询历史帮扶档案',  // 添加缺失的字段
      general_chat: '通用对话',
      unknown: '未知意图',
      // ⭐v3.0 new intents
      aggregation_query: '聚合统计查询（多商户、分组统计）',
      risk_statistics: '风险统计和趋势分析',
      health_overview: '商户健康度总览',
      comparison_query: '对比分析（商户对比、时间对比）',
      trend_analysis: '趋势分析和预测',
      composite_query: '复合查询（多种意图组合）',
    };

    return descriptions[intent] || '未知意图';
  }

  /**
   * 添加自定义意图模式
   */
  addPattern(pattern: IntentPattern): void {
    this.patterns.push(pattern);
    // 按优先级排序
    this.patterns.sort((a, b) => b.priority - a.priority);
  }

  /**
   * 获取所有支持的意图
   */
  getSupportedIntents(): UserIntent[] {
    return this.patterns.map((p) => p.intent);
  }

  /**
   * 检测是否包含特定意图关键词
   */
  hasIntentKeywords(input: string, intent: UserIntent): boolean {
    const pattern = this.patterns.find((p) => p.intent === intent);
    if (!pattern) {
      return false;
    }

    const normalizedInput = this.normalize(input);
    return pattern.keywords.some((k) => normalizedInput.includes(k.keyword));
  }

  /**
   * 获取意图建议（基于部分输入）
   */
  suggestIntent(partialInput: string): UserIntent[] {
    const normalizedInput = this.normalize(partialInput);
    const suggestions: { intent: UserIntent; score: number }[] = [];

    for (const pattern of this.patterns) {
      const { score } = this.calculateScore(normalizedInput, pattern);
      if (score > 0) {
        suggestions.push({ intent: pattern.intent, score });
      }
    }

    suggestions.sort((a, b) => b.score - a.score);
    return suggestions.map((s) => s.intent);
  }
}

// 导出单例实例
export const intentClassifier = new IntentClassifier();
