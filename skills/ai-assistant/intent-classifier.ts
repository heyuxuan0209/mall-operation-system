/**
 * 意图分类器
 * 基于关键词权重匹配识别用户意图
 */

import { UserIntent, IntentResult, IntentError } from '@/types/ai-assistant';

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
    // 健康度查询
    {
      intent: 'health_query',
      priority: 2,
      keywords: [
        { keyword: '怎么样', weight: 10 },
        { keyword: '健康', weight: 10 },
        { keyword: '评分', weight: 10 },
        { keyword: '状况', weight: 8 },
        { keyword: '情况', weight: 8 },
        { keyword: '表现', weight: 8 },
        { keyword: '最近', weight: 5 },
        { keyword: '现在', weight: 5 },
        { keyword: '当前', weight: 5 },
        { keyword: '分数', weight: 8 },
        { keyword: '得分', weight: 8 },
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
        { keyword: '如何', weight: 10 },
        { keyword: '帮扶', weight: 12 },
        { keyword: '改善', weight: 10 },
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
  ];

  /**
   * 识别用户意图
   */
  classify(userInput: string): IntentResult {
    if (!userInput || userInput.trim().length === 0) {
      throw new IntentError('Empty user input');
    }

    const normalizedInput = this.normalize(userInput);

    // 计算每个意图的得分
    const scores: { intent: UserIntent; score: number; matchedKeywords: string[] }[] = [];

    for (const pattern of this.patterns) {
      const { score, matchedKeywords } = this.calculateScore(normalizedInput, pattern);
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

    // 计算置信度（归一化到0-1）
    const maxPossibleScore = Math.max(...this.patterns.map((p) => {
      const totalWeight = p.keywords.reduce((sum, k) => sum + k.weight, 0);
      return totalWeight * p.priority;
    }));

    const confidence = Math.min(topResult.score / (maxPossibleScore * 0.5), 1);

    return {
      intent: topResult.intent,
      confidence,
      keywords: topResult.matchedKeywords,
    };
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
      general_chat: '通用对话',
      unknown: '未知意图',
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
