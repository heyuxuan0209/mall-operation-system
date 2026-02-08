/**
 * Query Analyzer - 查询结构化解析器 ⭐v3.0核心模块
 *
 * 功能：将自然语言查询转为结构化格式
 * - 识别查询类型 (single_merchant | aggregation | comparison | trend_analysis)
 * - 提取实体 (商户名、时间范围、对比目标)
 * - 解析意图和筛选条件
 * - 支持聚合操作 (count, sum, avg, max, min)
 *
 * 技术实现：LLM驱动的语义理解 + 规则验证
 */

import { llmClient } from '@/utils/ai-assistant/llmClient';
import {
  StructuredQuery,
  QueryType,
  TimeRange,
  QueryFilters,
  AggregationConfig,
  AggregationOperation,
  UserIntent,
  ConversationContext,
  LLMMessage,
} from '@/types/ai-assistant';
import { entityExtractor } from './entity-extractor';

export class QueryAnalyzer {
  /**
   * 分析用户查询，转为结构化格式
   */
  async analyze(
    userInput: string,
    context: ConversationContext
  ): Promise<StructuredQuery> {
    try {
      // Step 1: 快速规则检测（避免简单查询也调用LLM）
      const quickDetection = this.quickDetect(userInput, context);
      if (quickDetection.confidence > 0.9) {
        return quickDetection.result;
      }

      // Step 2: LLM驱动的深度分析
      const llmResult = await this.analyzeWithLLM(userInput, context);

      // Step 3: 规则验证和修正
      const validated = this.validateAndFix(llmResult, context);

      return validated;
    } catch (error) {
      console.error('[QueryAnalyzer] Analysis failed:', error);
      // 降级：返回保守的single_merchant查询
      return this.createFallbackQuery(userInput, context);
    }
  }

  /**
   * 快速规则检测（简单查询）
   */
  private quickDetect(
    userInput: string,
    context: ConversationContext
  ): { confidence: number; result: StructuredQuery } {
    const input = userInput.toLowerCase();

    // 规则1: 明确的聚合统计查询
    const aggregationKeywords = ['多少', '几个', '数量', '统计', '总共', '有哪些'];
    const hasAggregation = aggregationKeywords.some(kw => input.includes(kw));

    if (hasAggregation) {
      return {
        confidence: 0.85,
        result: {
          originalInput: userInput,
          type: 'aggregation',
          entities: {
            merchants: ['all'],
            timeRange: this.parseTimeRange(input),
          },
          intents: ['aggregation_query', 'risk_statistics'],
          filters: this.parseFilters(input),
          aggregations: {
            operation: 'count',
            groupBy: this.detectGroupBy(input),
          },
          confidence: 0.85,
        },
      };
    }

    // 规则2: 明确的对比查询
    const comparisonKeywords = ['对比', '比较', 'vs', '和...比', '相比'];
    const hasComparison = comparisonKeywords.some(kw => input.includes(kw));

    if (hasComparison) {
      // 🔥 对比查询复杂，降低confidence强制走LLM分支
      console.log('[QueryAnalyzer] Comparison detected, forcing LLM analysis');
      return {
        confidence: 0.5, // 降低到0.5，强制走LLM分支
        result: this.createFallbackQuery(userInput, context),
      };
    }

    // 规则3: 单商户查询（最常见）
    // 规则3a: 尝试实体提取
    const extractedEntity = entityExtractor.extractMerchant(userInput, context.merchantId);

    if (extractedEntity.matched && extractedEntity.confidence > 0.7) {
      return {
        confidence: extractedEntity.confidence,
        result: {
          originalInput: userInput,
          type: 'single_merchant',
          entities: {
            merchants: [extractedEntity.merchantName!],
            timeRange: this.parseTimeRange(input),
          },
          intents: this.guessIntents(input),
          filters: {},
          confidence: extractedEntity.confidence,
        },
      };
    }

    // 规则3b: 使用上下文商户（如果有）
    if (context.merchantName && !hasAggregation && !hasComparison) {
      return {
        confidence: 0.95,
        result: {
          originalInput: userInput,
          type: 'single_merchant',
          entities: {
            merchants: [context.merchantName],
            timeRange: this.parseTimeRange(input),
          },
          intents: this.guessIntents(input),
          confidence: 0.95,
        },
      };
    }

    // 低置信度，需要LLM分析
    return {
      confidence: 0.3,
      result: this.createFallbackQuery(userInput, context),
    };
  }

  /**
   * LLM驱动的深度分析
   */
  private async analyzeWithLLM(
    userInput: string,
    context: ConversationContext
  ): Promise<StructuredQuery> {
    if (!llmClient) {
      throw new Error('LLM client not available');
    }

    console.log('[QueryAnalyzer] Using LLM analysis for:', userInput);

    const prompt = this.buildAnalysisPrompt(userInput, context);
    const messages: LLMMessage[] = [
      {
        role: 'system',
        content: '你是商户运营AI助手的查询解析器，擅长理解用户意图并转为结构化格式。',
      },
      {
        role: 'user',
        content: prompt,
      },
    ];

    const response = await llmClient.chat(messages, { useCache: true });
    console.log('[QueryAnalyzer] LLM raw response:', response.content);

    // 解析LLM响应
    const parsed = this.parseLLMResponse(response.content);
    console.log('[QueryAnalyzer] Parsed result:', parsed);

    return {
      originalInput: userInput,
      type: parsed.type || 'single_merchant', // 默认为单商户查询
      entities: parsed.entities || {},
      intents: parsed.intents || [],
      filters: parsed.filters || {},
      aggregations: parsed.aggregations,
      confidence: parsed.confidence || 0.8,
    };
  }

  /**
   * 构建分析提示词
   */
  private buildAnalysisPrompt(
    userInput: string,
    context: ConversationContext
  ): string {
    return `
# 任务
将用户查询转为结构化JSON格式。你是查询解析专家，需要准确识别查询类型和提取实体。

# 用户输入
"${userInput}"

# 对话上下文
- 最近讨论商户：${context.merchantName || '无'}
- 上一轮意图：${context.lastIntent || '无'}
- 最近消息：${context.recentMessages.slice(-3).map(m => m.content).join(' / ')}

# 查询类型识别规则

## 1. comparison (对比查询)
**触发条件**：包含"对比"、"比较"、"vs"、"和...相比"等词
**实体提取**：
- 如果是"对比A和B" / "Avs B" → merchants: ["A", "B"], comparisonTarget: "merchant_vs_merchant"
- 如果是"A和上月对比" → merchants: ["A"], comparisonTarget: "last_month"
- 如果是"A和同类对比" → merchants: ["A"], comparisonTarget: "same_category"

**示例**：
- "对比海底捞和小龙坎" → { type: "comparison", entities: { merchants: ["海底捞", "小龙坎"], comparisonTarget: "merchant_vs_merchant" } }
- "海底捞vs小龙坎" → { type: "comparison", entities: { merchants: ["海底捞", "小龙坎"], comparisonTarget: "merchant_vs_merchant" } }
- "海底捞和上月对比" → { type: "comparison", entities: { merchants: ["海底捞"], comparisonTarget: "last_month" } }

## 2. aggregation (聚合统计)
**触发条件**：包含"多少"、"几个"、"数量"、"统计"、"有哪些"
**示例**：
- "有几家高风险商户" → { type: "aggregation", filters: { riskLevel: ["high"] }, aggregations: { operation: "count" } }

## 3. single_merchant (单商户查询)
**触发条件**：提到具体商户名，问健康度、风险、帮扶等
**示例**：
- "海底捞怎么样" → { type: "single_merchant", entities: { merchants: ["海底捞"] } }

# 输出格式 (严格JSON，不要有任何额外文字)
\`\`\`json
{
  "type": "single_merchant | aggregation | comparison | trend_analysis",
  "entities": {
    "merchants": ["商户名1", "商户名2"] 或 ["商户名"] 或 ["all"],
    "timeRange": {
      "period": "current_month | last_month | last_week | ..."
    },
    "comparisonTarget": "merchant_vs_merchant | last_month | same_category | same_floor | ..."
  },
  "intents": ["health_query", "risk_diagnosis", "comparison_query", ...],
  "filters": {
    "riskLevel": ["high", "critical"],
    "category": ["餐饮"]
  },
  "aggregations": {
    "operation": "count | sum | avg | max | min",
    "groupBy": "riskLevel | category | floor"
  },
  "confidence": 0.0-1.0
}
\`\`\`

# 关键约束
1. ⚠️ 对于对比查询，**必须**正确提取merchants数组（商户名称，不要包含"对比"等关键词）
2. ⚠️ 如果是两个商户对比，comparisonTarget **必须**设为 "merchant_vs_merchant"
3. ⚠️ 只返回JSON，不要有任何解释文字
4. ⚠️ merchants字段是字符串数组，不是对象数组

现在请解析上述用户输入，只返回JSON：

# 查询类型判断
- **single_merchant**: 查询特定商户（"海底捞最近怎么样"）
- **aggregation**: 聚合统计（"多少高风险商户"、"平均健康度"）
- **comparison**: 对比分析（"和上月对比"、"海底捞vs小龙坎"）
- **trend_analysis**: 趋势分析（"营收走势"、"健康度变化趋势"）

# 意图类型
单商户: health_query, risk_diagnosis, solution_recommend, data_query
聚合: aggregation_query, risk_statistics, health_overview
对比: comparison_query, trend_analysis
复合: composite_query

# 时间范围
- 本月/这个月 → current_month
- 上月/上个月 → last_month
- 最近/近期 → last_week
- 今天/今日 → current_day

# 筛选条件
- 高风险/风险高 → riskLevel: ["high", "critical"]
- 餐饮/火锅 → category: ["餐饮"]
- 3层/三层 → floor: ["3F"]

# 重要规则
1. 如果用户说"小龙坎呢"且上下文有"海底捞"，这是follow-up query，merchants应为["小龙坎"]
2. 如果用户只说"呢"/"如何"，从上下文继承商户
3. "多少"/"几个"/"统计" → type必须是aggregation
4. "对比"/"vs"/"比较" → type必须是comparison
5. 置信度评估：明确指令0.9+，模糊问题0.6-0.8，不确定<0.6

现在请分析用户输入，返回JSON（只返回JSON，不要其他解释）。
`.trim();
  }

  /**
   * 解析LLM响应
   */
  private parseLLMResponse(content: string): Partial<StructuredQuery> {
    try {
      // 提取JSON（可能包含在```json```代码块中）
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) ||
                       content.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error('No JSON found in LLM response');
      }

      const json = JSON.parse(jsonMatch[1] || jsonMatch[0]);

      return {
        type: json.type,
        entities: json.entities,
        intents: json.intents,
        filters: json.filters,
        aggregations: json.aggregations,
        confidence: json.confidence,
      };
    } catch (error) {
      console.error('[QueryAnalyzer] Failed to parse LLM response:', error);
      throw error;
    }
  }

  /**
   * 验证和修正LLM结果
   */
  private validateAndFix(
    llmResult: StructuredQuery,
    context: ConversationContext
  ): StructuredQuery {
    const validated = { ...llmResult };

    // 验证1: 如果没有商户但有上下文，继承上下文
    if (
      (!validated.entities.merchants || validated.entities.merchants.length === 0) &&
      context.merchantName
    ) {
      validated.entities.merchants = [context.merchantName];
    }

    // 验证2: aggregation查询必须有operation
    if (validated.type === 'aggregation' && !validated.aggregations?.operation) {
      validated.aggregations = {
        operation: 'count',
        ...(validated.aggregations || {}),
      };
    }

    // 验证3: comparison查询必须有comparisonTarget
    if (validated.type === 'comparison' && !validated.entities.comparisonTarget) {
      validated.entities.comparisonTarget = 'last_month'; // 默认上月
    }

    // 验证4: 意图不能为空
    if (!validated.intents || validated.intents.length === 0) {
      validated.intents = ['health_query'];
    }

    return validated;
  }

  /**
   * 创建降级查询（LLM失败时使用）
   */
  private createFallbackQuery(
    userInput: string,
    context: ConversationContext
  ): StructuredQuery {
    // 🔥 新增：使用entity-extractor从输入中提取商户
    const extractedEntity = entityExtractor.extractMerchant(
      userInput,
      context.merchantId
    );

    let merchants: string[] = [];

    if (extractedEntity.matched && extractedEntity.merchantName) {
      // 成功从输入提取
      merchants = [extractedEntity.merchantName];
    } else if (context.merchantName) {
      // 降级：使用上下文
      merchants = [context.merchantName];
    }
    // 否则保持为空数组，触发正确的错误提示

    return {
      originalInput: userInput,
      type: 'single_merchant',
      entities: {
        merchants,
        timeRange: this.parseTimeRange(userInput),
      },
      intents: this.guessIntents(userInput),
      filters: {},
      confidence: extractedEntity.matched ? extractedEntity.confidence : 0.5,
    };
  }

  // ===== 辅助方法 =====

  /**
   * 解析时间范围
   */
  private parseTimeRange(input: string): TimeRange | undefined {
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes('今天') || lowerInput.includes('今日')) {
      return { period: 'current_day' };
    }
    if (lowerInput.includes('本周') || lowerInput.includes('这周')) {
      return { period: 'current_week' };
    }
    if (lowerInput.includes('本月') || lowerInput.includes('这个月')) {
      return { period: 'current_month' };
    }
    if (lowerInput.includes('上月') || lowerInput.includes('上个月')) {
      return { period: 'last_month' };
    }
    if (lowerInput.includes('去年') || lowerInput.includes('上年')) {
      return { period: 'last_year' };
    }
    if (lowerInput.includes('最近') || lowerInput.includes('近期')) {
      return { period: 'last_week' };
    }

    return undefined;
  }

  /**
   * 解析筛选条件
   */
  private parseFilters(input: string): QueryFilters | undefined {
    const lowerInput = input.toLowerCase();
    const filters: QueryFilters = {};

    // 风险等级
    const riskLevels: Array<'none' | 'low' | 'medium' | 'high' | 'critical'> = [];
    if (lowerInput.includes('高风险') || lowerInput.includes('风险高')) {
      riskLevels.push('high', 'critical');
    }
    if (lowerInput.includes('中风险')) {
      riskLevels.push('medium');
    }
    if (lowerInput.includes('低风险')) {
      riskLevels.push('low');
    }
    if (riskLevels.length > 0) {
      filters.riskLevel = riskLevels;
    }

    // 业态
    if (lowerInput.includes('餐饮') || lowerInput.includes('火锅')) {
      filters.category = ['餐饮'];
    }
    if (lowerInput.includes('服饰') || lowerInput.includes('服装')) {
      filters.category = ['服饰'];
    }

    return Object.keys(filters).length > 0 ? filters : undefined;
  }

  /**
   * 检测分组字段
   */
  private detectGroupBy(input: string): string | undefined {
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes('按风险') || lowerInput.includes('分风险')) {
      return 'riskLevel';
    }
    if (lowerInput.includes('按业态') || lowerInput.includes('分业态')) {
      return 'category';
    }
    if (lowerInput.includes('按楼层') || lowerInput.includes('分楼层')) {
      return 'floor';
    }

    return undefined;
  }

  /**
   * 解析对比目标
   */
  private parseComparisonTarget(input: string, merchantCount: number = 0): string {
    const lowerInput = input.toLowerCase();

    // 🔥 新增：如果提取到2个商户，认为是商户对比
    if (merchantCount === 2) {
      return 'merchant_vs_merchant'; // 新增类型
    }

    if (lowerInput.includes('上月') || lowerInput.includes('上个月')) {
      return 'last_month';
    }
    if (lowerInput.includes('上周') || lowerInput.includes('上星期')) {
      return 'last_week';
    }
    if (lowerInput.includes('同类') || lowerInput.includes('同业态')) {
      return 'same_category';
    }
    if (lowerInput.includes('同层') || lowerInput.includes('同楼层')) {
      return 'same_floor';
    }

    return 'last_month'; // 默认
  }

  /**
   * 🔥 新增：从对比查询中提取商户名
   */
  private extractMerchantsFromComparison(userInput: string): string[] {
    const merchants: string[] = [];

    // 🔥 优先匹配更精确的模式（避免贪婪匹配）

    // 模式1："对比海底捞和小龙坎" / "比较A和B"
    const pattern1 = /(?:对比|比较)([一-龥\w]+)和([一-龥\w]+)/;
    const match1 = userInput.match(pattern1);

    if (match1) {
      merchants.push(match1[1].trim(), match1[2].trim());
      console.log('[QueryAnalyzer] Pattern1 matched:', merchants);
      return merchants;
    }

    // 模式2："海底捞vs小龙坎" / "A对比B"（不含"和"）
    const pattern2 = /([一-龥]{2,10})(?:vs|对比)([一-龥]{2,10})/;
    const match2 = userInput.match(pattern2);

    if (match2) {
      merchants.push(match2[1].trim(), match2[2].trim());
      console.log('[QueryAnalyzer] Pattern2 matched:', merchants);
      return merchants;
    }

    // 模式3："海底捞和小龙坎比较"
    const pattern3 = /([一-龥]{2,10})和([一-龥]{2,10})(?:比较|对比)/;
    const match3 = userInput.match(pattern3);

    if (match3) {
      merchants.push(match3[1].trim(), match3[2].trim());
      console.log('[QueryAnalyzer] Pattern3 matched:', merchants);
      return merchants;
    }

    // 模式3：单商户时间对比"和上月对比"
    const timePattern = /(上月|上周|去年|同期)/;
    if (timePattern.test(userInput)) {
      const extractedEntity = entityExtractor.extractMerchant(userInput);
      if (extractedEntity.matched && extractedEntity.merchantName) {
        merchants.push(extractedEntity.merchantName);
      }
    }

    return merchants;
  }

  /**
   * 猜测意图（基于关键词）
   */
  private guessIntents(input: string): UserIntent[] {
    const lowerInput = input.toLowerCase();
    const intents: UserIntent[] = [];

    if (
      lowerInput.includes('健康') ||
      lowerInput.includes('评分') ||
      lowerInput.includes('怎么样')
    ) {
      intents.push('health_query');
    }

    if (
      lowerInput.includes('风险') ||
      lowerInput.includes('问题') ||
      lowerInput.includes('诊断')
    ) {
      intents.push('risk_diagnosis');
    }

    if (
      lowerInput.includes('帮扶') ||
      lowerInput.includes('方案') ||
      lowerInput.includes('措施') ||
      lowerInput.includes('建议')
    ) {
      intents.push('solution_recommend');
    }

    if (
      lowerInput.includes('营收') ||
      lowerInput.includes('租金') ||
      lowerInput.includes('数据')
    ) {
      intents.push('data_query');
    }

    return intents.length > 0 ? intents : ['health_query'];
  }
}

// 导出单例实例
export const queryAnalyzer = new QueryAnalyzer();
