/**
 * Response Generator - 响应生成器 ⭐v3.0完全重构
 *
 * 核心改进：
 * - 废除所有硬编码模板
 * - 使用LLM动态生成响应
 * - 根据查询类型个性化调整
 * - 保留部分模板作为fallback
 *
 * 支持的响应类型：
 * - 单商户查询（health_query, risk_diagnosis, solution_recommend）
 * - 聚合统计（aggregation_query, risk_statistics）
 * - 对比分析（comparison_query）
 * - 趋势分析（trend_analysis）
 */

import { getLLMClient } from '@/utils/ai-assistant/llmHelper';
import {
  StructuredQuery,
  LLMMessage,
  AggregationResult,
  ComparisonResult,
  TrendAnalysisResult,
} from '@/types/ai-assistant';
import { Merchant } from '@/types';
import { replaceEnglishTerms } from '@/utils/formatters/termReplacer';

export class ResponseGenerator {
  /**
   * ⭐v3.0核心方法：动态生成响应
   */
  async generate(
    structuredQuery: StructuredQuery,
    executionResult: any,
    merchant?: Merchant
  ): Promise<string> {
    try {
      // 根据查询类型选择生成策略
      switch (structuredQuery.type) {
        case 'single_merchant':
          return await this.generateSingleMerchantResponse(
            structuredQuery,
            executionResult,
            merchant!
          );

        case 'aggregation':
          return await this.generateAggregationResponse(
            structuredQuery,
            executionResult as AggregationResult
          );

        case 'comparison':
          return await this.generateComparisonResponse(
            structuredQuery,
            executionResult as ComparisonResult
          );

        case 'trend_analysis':
          return await this.generateTrendResponse(
            structuredQuery,
            executionResult as TrendAnalysisResult
          );

        default:
          return this.generateFallbackResponse(structuredQuery);
      }
    } catch (error) {
      console.error('[ResponseGenerator] Generation failed:', error);
      return this.generateErrorResponse(structuredQuery, error);
    }
  }

  /**
   * 生成单商户查询响应
   */
  private async generateSingleMerchantResponse(
    query: StructuredQuery,
    result: any,
    merchant: Merchant
  ): Promise<string> {
    // 🔥 新增：如果是档案查询，直接返回简单提示
    if (query.intents.includes('archive_query')) {
      return this.generateArchiveQueryResponse(merchant, result);
    }

    const llmClient = getLLMClient(); if (!llmClient) {
      // 降级：使用简单模板
      return this.generateSimpleMerchantTemplate(merchant, result);
    }

    const prompt = `
# 任务
为商户运营AI助手生成友好的响应，直接回答用户问题。

# 用户问题
"${query.originalInput}"

# 用户意图
${query.intents.join(', ')}

# 商户数据
- 名称：${merchant.name}
- 业态：${merchant.category}
- 健康度：${merchant.totalScore}/100
- 风险等级：${merchant.riskLevel}
- 租金缴纳：${merchant.metrics.collection}/100
- 经营表现：${merchant.metrics.operational}/100
- 现场品质：${merchant.metrics.siteQuality}/100
- 顾客满意度：${merchant.metrics.customerReview}/100
- 抗风险能力：${merchant.metrics.riskResistance}/100

${merchant.operationalDetails && Object.keys(merchant.operationalDetails).length > 0
  ? `# ⭐详细运营数据（实际采集）
${this.formatOperationalDetails(merchant.operationalDetails, merchant.category)}

⚠️ **重要**：以上为真实采集的运营数据，请优先使用这些具体数值进行分析，避免基于健康度评分推测。`
  : '# 详细运营数据\n暂无详细运营数据采集，请基于健康度评分进行分析，并在回答中标注"推测"。'}

# 诊断结果（如果有）
${result.diagnosis ? JSON.stringify(result.diagnosis) : '无'}

# ⭐匹配的帮扶案例（前3个）
${result.cases?.matchedCases?.slice(0, 3).map((c: any, idx: number) => `
案例${idx + 1}：${c.case?.merchantName || '某商户'}
- 案例ID：${c.case?.id || 'N/A'}
- 成功率：${c.successProbability}%
- 策略：${c.case?.strategy || 'N/A'}
- 措施：${c.case?.action || 'N/A'}
`).join('\n') || '暂无匹配案例'}

# ⭐响应策略（根据用户意图）
${this.getResponseStrategy(query.intents)}

# 通用要求
1. **针对性回答**：根据用户意图，聚焦相关信息
2. 使用Markdown格式，简洁清晰
3. 包含emoji使响应更友好
4. 避免套话，直奔主题
5. ⭐**关键约束**：如果给出帮扶建议，必须标注来源案例
   - 格式："参考[案例商户名]的经验（案例ID：CASE_XXX，成功率XX%）"
   - 示例："参考刘一锅的经验（案例ID：CASE_019，成功率85%），可以尝试..."
6. ⭐如果没有匹配案例，诚实说明"暂无类似案例可参考，建议咨询专业运营团队"

# 格式示例
\`\`\`markdown
# ${merchant.name} - [主题]

[核心结论 1-2句话]

## [细节标题]
- 关键指标
- 主要问题/亮点

💡 **建议**：
参考[XX商户]的经验（案例ID：CASE_XXX，成功率XX%），可以尝试：
1. [具体措施1]
2. [具体措施2]

📊 **数据来源**：实时健康度数据 + 帮扶案例库
\`\`\`

现在请生成响应（只返回Markdown内容，不要额外解释）：
`.trim();

    const messages: LLMMessage[] = [
      {
        role: 'system',
        content: `你是商户运营AI助手，擅长用简洁友好的方式解答商户问题。

⚠️ **术语规范（严格遵守）**：
- 风险等级必须用中文：极高风险、高风险、中风险、低风险、无风险
- 健康度等级必须用中文：优秀、良好、中等、较差、很差
- 指标名称必须用中文：营收、租金、租金缴纳、经营表现、现场品质、顾客评价、抗风险能力
- **禁止使用任何英文术语**（如critical、high、medium、low、none、excellent、good、fair、poor）`,
      },
      {
        role: 'user',
        content: prompt,
      },
    ];

    const client = getLLMClient();
    if (!client) {
      throw new Error('LLM client not available');
    }
    const response = await client.chat(messages, { useCache: true });

    // 后处理：替换残留的英文术语
    const cleanedContent = replaceEnglishTerms(response.content);
    return cleanedContent;
  }

  /**
   * 生成聚合统计响应
   */
  private async generateAggregationResponse(
    query: StructuredQuery,
    result: AggregationResult
  ): Promise<string> {
    const llmClient = getLLMClient(); if (!llmClient) {
      return this.generateSimpleAggregationTemplate(result);
    }

    // ⭐新增: 构建商户列表字符串
    const merchantListText = result.merchantList
      ?.slice(0, 20) // 限制前20个，避免token超限
      .map(m => `- ${m.name} (${m.riskLevel}, 健康度${m.totalScore})`)
      .join('\n');

    // ⭐新增: 分析数据特征，提供可视化建议
    const visualizationHint = this.suggestVisualization(result, query);
    const insightsHints = this.generateInsightsHints(result, query);

    const prompt = `
# 任务
为商户运营AI助手生成聚合统计报告。

# 用户问题
"${query.originalInput}"

# 统计结果
- 操作：${result.operation}
- 总计：${result.total}
${result.breakdown ? `\n分组统计：\n${JSON.stringify(result.breakdown, null, 2)}` : ''}
${result.comparison ? `\n对比分析：\n- 基准值：${result.comparison.baseline}\n- 变化：${result.comparison.delta} (${result.comparison.percentage})` : ''}

# ⭐实际商户列表（前20家）
${merchantListText || '无符合条件的商户'}

# 筛选条件
${JSON.stringify(query.filters || {}, null, 2)}

# ⚠️ 关键约束
1. **禁止编造商户名**：只能提及上述列表中的真实商户
2. 如需举例，从列表中选择，格式："如[商户名](健康度XX)"
3. 如列表为空，说明"当前无符合条件的商户"
4. 不要输出完整列表，仅在需要举例时引用（最多3个示例）

# 响应要求
1. **开篇直接给出核心结论**（1-2句话）
2. 突出关键数字（使用**加粗**）
3. 强调变化趋势（增长/下降/稳定）
4. ${result.breakdown ? '用表格或列表展示分类数据' : ''}
5. **提供3-5个可操作的洞察和建议**
6. 简洁清晰，避免套话

# 💡 洞察提示（参考）
${insightsHints}

# 📊 数据可视化建议
${visualizationHint}

# 格式示例
\`\`\`markdown
# 📊 [标题]

**核心结论**：[1句话总结关键发现]

## 统计数据
- 总计：**${result.total || 0}**${result.operation === 'count' ? '家商户' : ''}
${result.comparison ? `- 对比${result.comparison.baseline > (result.total || 0) ? '下降' : '增长'}：**${result.comparison.percentage}**` : ''}

${result.breakdown ? `## 分布情况\n${Object.entries(result.breakdown).map(([k, v]) => `- **${k}**：${v}个`).join('\n')}` : ''}

## 💡 关键洞察
1. [洞察1 - 数据趋势]
2. [洞察2 - 异常识别]
3. [洞察3 - 行动建议]

${visualizationHint ? '## 📈 可视化建议\n' + visualizationHint : ''}
\`\`\`

现在请生成响应（只返回Markdown内容）：
`.trim();

    const messages: LLMMessage[] = [
      {
        role: 'system',
        content: `你是商户运营AI助手，擅长数据分析和洞察提炼。你必须基于系统提供的真实数据，禁止编造商户名称。

⚠️ **术语规范（严格遵守）**：
- 风险等级必须用中文：极高风险、高风险、中风险、低风险、无风险
- 健康度等级必须用中文：优秀、良好、中等、较差、很差
- **禁止使用任何英文术语**（如critical、high、medium、low、none）`,
      },
      {
        role: 'user',
        content: prompt,
      },
    ];

    const client = getLLMClient();
    if (!client) {
      throw new Error('LLM client not available');
    }
    const response = await client.chat(messages, { useCache: true });

    // 后处理：替换残留的英文术语
    const cleanedContent = replaceEnglishTerms(response.content);
    return cleanedContent;
  }

  /**
   * 生成对比分析响应
   */
  private async generateComparisonResponse(
    query: StructuredQuery,
    result: ComparisonResult
  ): Promise<string> {
    const llmClient = getLLMClient(); if (!llmClient) {
      return this.generateSimpleComparisonTemplate(result);
    }

    const prompt = `
# 任务
为商户运营AI助手生成对比分析报告。

# 用户问题
"${query.originalInput}"

# 对比数据
**当前**：${result.current.merchantName || '聚合数据'}
${JSON.stringify(result.current.data, null, 2)}

**对比基准**：${result.baseline.label}
${JSON.stringify(result.baseline.data, null, 2)}

**差异**：
${JSON.stringify(result.delta, null, 2)}

**洞察**：
${result.insights.join('\n')}

# 响应要求
1. 突出关键差异（百分比变化）
2. 用对比表格展示
3. 解释变化原因
4. 给出改善建议（如果需要）

# 格式示例
\`\`\`markdown
# 对比分析：[主题]

## 📊 核心对比
| 指标 | 当前 | ${result.baseline.label} | 变化 |
|------|------|------|------|
| ... | ... | ... | ... |

## 🔍 关键发现
${result.insights.map(i => `- ${i}`).join('\n')}

## 💡 建议
- [基于对比结果的行动建议]
\`\`\`

现在请生成响应（只返回Markdown内容）：
`.trim();

    const messages: LLMMessage[] = [
      {
        role: 'system',
        content: `你是商户运营AI助手，擅长对比分析和趋势解读。

⚠️ **术语规范（严格遵守）**：
- 风险等级必须用中文：极高风险、高风险、中风险、低风险、无风险
- 健康度等级必须用中文：优秀、良好、中等、较差、很差
- 指标名称必须用中文：营收、租金、经营表现等
- **禁止使用任何英文术语**`,
      },
      {
        role: 'user',
        content: prompt,
      },
    ];

    const client = getLLMClient();
    if (!client) {
      throw new Error('LLM client not available');
    }
    const response = await client.chat(messages, { useCache: true });

    // 后处理：替换残留的英文术语
    const cleanedContent = replaceEnglishTerms(response.content);
    return cleanedContent;
  }

  /**
   * 生成趋势分析响应
   */
  private async generateTrendResponse(
    query: StructuredQuery,
    result: TrendAnalysisResult
  ): Promise<string> {
    const llmClient = getLLMClient(); if (!llmClient) {
      return this.generateSimpleTrendTemplate(result);
    }

    const prompt = `
# 任务
为商户运营AI助手生成趋势分析报告。

# 用户问题
"${query.originalInput}"

# 趋势数据
- 指标：${result.metric}
- 趋势方向：${result.trend}
- 变化率：${result.changeRate}%
- 预测值：${result.prediction?.nextPeriod || 'N/A'}

# 数据点
${result.dataPoints.map(p => `${p.label || p.timestamp}: ${p.value}`).join('\n')}

# 响应要求
1. 描述趋势方向（上升/下降/稳定）
2. 量化变化幅度
3. 分析可能原因
4. 提供预测（如果有）
5. 给出行动建议

现在请生成响应（只返回Markdown内容）：
`.trim();

    const messages: LLMMessage[] = [
      {
        role: 'system',
        content: `你是商户运营AI助手，擅长趋势分析和预测。

⚠️ **术语规范（严格遵守）**：
- 风险等级必须用中文：极高风险、高风险、中风险、低风险、无风险
- 指标名称必须用中文：营收、租金、经营表现等
- **禁止使用任何英文术语**`,
      },
      {
        role: 'user',
        content: prompt,
      },
    ];

    const client = getLLMClient();
    if (!client) {
      throw new Error('LLM client not available');
    }
    const response = await client.chat(messages, { useCache: true });

    // 后处理：替换残留的英文术语
    const cleanedContent = replaceEnglishTerms(response.content);
    return cleanedContent;
  }

  // ===== Fallback模板（LLM不可用时使用） =====

  /**
   * 简单商户模板
   */
  private generateSimpleMerchantTemplate(merchant: Merchant, result: any): string {
    let response = `# ${merchant.name} 健康度报告\n\n`;
    response += `## 📊 总体评分\n`;
    response += `- **健康度**: ${merchant.totalScore}/100\n`;
    response += `- **风险等级**: ${merchant.riskLevel}\n`;
    response += `- **业态**: ${merchant.category}\n\n`;

    response += `## 🎯 各维度得分\n`;
    response += `- 租金缴纳: ${merchant.metrics.collection}/100\n`;
    response += `- 经营表现: ${merchant.metrics.operational}/100\n`;
    response += `- 现场品质: ${merchant.metrics.siteQuality}/100\n`;
    response += `- 顾客满意度: ${merchant.metrics.customerReview}/100\n`;
    response += `- 抗风险能力: ${merchant.metrics.riskResistance}/100\n`;

    return response;
  }

  /**
   * 简单聚合模板
   */
  private generateSimpleAggregationTemplate(result: AggregationResult): string {
    let response = `# 聚合统计结果\n\n`;
    response += `## 📊 统计数据\n`;
    response += `- 操作：${result.operation}\n`;
    response += `- 总计：**${result.total}**\n\n`;

    if (result.breakdown) {
      response += `## 📋 分组统计\n`;
      for (const [key, value] of Object.entries(result.breakdown)) {
        response += `- ${key}：${value}\n`;
      }
      response += `\n`;
    }

    if (result.comparison) {
      response += `## 📈 对比分析\n`;
      response += `- 基准值：${result.comparison.baseline}\n`;
      response += `- 变化：${result.comparison.delta} (${result.comparison.percentage})\n`;
    }

    return response;
  }

  /**
   * 简单对比模板
   */
  private generateSimpleComparisonTemplate(result: ComparisonResult): string {
    let response = `# 对比分析报告\n\n`;
    response += `## 📊 对比数据\n\n`;
    response += `**当前**：${result.current.merchantName || '聚合数据'}\n`;
    response += `**对比基准**：${result.baseline.label}\n\n`;

    response += `## 🔍 关键发现\n`;
    result.insights.forEach(insight => {
      response += `- ${insight}\n`;
    });

    return response;
  }

  /**
   * 简单趋势模板
   */
  private generateSimpleTrendTemplate(result: TrendAnalysisResult): string {
    let response = `# 趋势分析报告\n\n`;
    response += `## 📈 趋势概况\n`;
    response += `- 指标：${result.metric}\n`;
    response += `- 趋势：${result.trend === 'up' ? '上升' : result.trend === 'down' ? '下降' : '稳定'}\n`;
    response += `- 变化率：${result.changeRate}%\n`;

    if (result.prediction) {
      response += `\n## 🔮 预测\n`;
      response += `- 下期预测值：${result.prediction.nextPeriod}\n`;
      response += `- 置信度：${(result.prediction.confidence * 100).toFixed(1)}%\n`;
    }

    return response;
  }

  /**
   * Fallback响应
   */
  private generateFallbackResponse(query: StructuredQuery): string {
    return `抱歉，暂时无法处理该查询。\n\n原始输入：${query.originalInput}`;
  }

  /**
   * 错误响应
   */
  private generateErrorResponse(query: StructuredQuery, error: any): string {
    console.error('[ResponseGenerator] Error:', error);
    return `抱歉，生成响应时遇到错误。请稍后重试。\n\n` +
           `如果问题持续，请联系技术支持。`;
  }

  /**
   * 建议数据可视化方式 ⭐新增
   */
  private suggestVisualization(result: AggregationResult, query: StructuredQuery): string {
    const { operation, breakdown, comparison } = result;

    // 有分组数据 → 建议图表类型
    if (breakdown) {
      const groupCount = Object.keys(breakdown).length;

      if (groupCount <= 5) {
        return `建议使用**饼图**或**柱状图**展示分布情况`;
      } else {
        return `建议使用**柱状图**或**横向条形图**展示分类统计`;
      }
    }

    // 有对比数据 → 建议对比图表
    if (comparison) {
      return `建议使用**折线图**或**对比柱状图**展示趋势变化`;
    }

    // 单一聚合值 → 建议数字卡片
    if (operation === 'count' || operation === 'sum') {
      return `建议使用**数字卡片**高亮显示关键指标`;
    }

    return '';
  }

  /**
   * 生成洞察提示 ⭐新增
   */
  private generateInsightsHints(result: AggregationResult, query: StructuredQuery): string {
    const hints: string[] = [];
    const { total, breakdown, comparison, filters } = result;

    // 提示1: 数据规模
    if (total !== null) {
      if (total === 0) {
        hints.push('- 说明当前无符合条件的商户，分析可能的原因');
      } else if (total > 10) {
        hints.push('- 识别数量最多的类别，分析原因');
      } else {
        hints.push('- 数量较少，可以逐个商户分析');
      }
    }

    // 提示2: 对比趋势
    if (comparison) {
      const { delta, percentage } = comparison;
      if (Math.abs(delta) > 5) {
        hints.push(`- 变化显著(${percentage})，需分析根本原因`);
      }
      if (delta < 0) {
        hints.push('- 数量下降，说明改善措施可能生效');
      } else if (delta > 0) {
        hints.push('- 数量上升，需要重点关注和干预');
      }
    }

    // 提示3: 分组分析
    if (breakdown) {
      const entries = Object.entries(breakdown);
      const maxEntry = entries.reduce((max, curr) => curr[1] > max[1] ? curr : max);
      hints.push(`- 重点关注${maxEntry[0]}类别（数量最多）`);

      // 识别异常值
      const minEntry = entries.reduce((min, curr) => curr[1] < min[1] ? curr : min);
      if (maxEntry[1] > minEntry[1] * 3) {
        hints.push(`- ${maxEntry[0]}和${minEntry[0]}差异较大，分析原因`);
      }
    }

    // 提示4: 风险等级特定建议
    if (filters.riskLevel) {
      if (filters.riskLevel.includes('high') || filters.riskLevel.includes('critical')) {
        hints.push('- 高风险商户需要立即制定帮扶计划');
        hints.push('- 建议优先处理健康度最低的商户');
      }
    }

    return hints.length > 0 ? hints.join('\n') : '- 根据数据特征提供具体洞察';
  }

  /**
   * ⭐新增：根据用户意图生成差异化响应策略
   */
  private getResponseStrategy(intents: string[]): string {
    const primaryIntent = intents[0];

    const strategies: Record<string, string> = {
      health_query: `
**响应重点**：整体健康状况和趋势
- 开头直接给出健康度评级（优秀/良好/中等/较差/很差）
- 说明主要表现（哪些维度好，哪些维度需要改善）
- 如果有趋势数据，提及变化趋势
- 简要列出关键指标，避免过度展开
- 如果健康度低，简单提示风险但不展开细节
- **标题示例**："${intents.length > 0 ? '健康度评估' : '最近经营情况'}"`,

      risk_diagnosis: `
**响应重点**：风险识别和问题诊断
- 开头明确风险等级（极高/高/中/低/无）
- 使用诊断结果，展开说明主要风险点
- 如果有根因分析（v3.0），重点呈现根本原因而非表面症状
- 如果有问题链（v3.0），说明问题的因果关系
- 给出风险影响评估（紧急程度、严重程度）
- 简要提示解决方向但不展开具体方案
- **标题示例**："风险诊断报告" 或 "当前风险状况"`,

      solution_recommend: `
**响应重点**：解决方案和帮扶建议
- 开头简单说明当前问题
- **核心内容**：展开匹配的帮扶案例
- 每个建议必须标注：案例来源商户、案例ID、成功率
- 优先展示成功率高（>70%）且业态相似的案例
- 如果是v3.0语义匹配结果，说明适应性调整建议
- 避免重复介绍健康度和风险（用户已知）
- **标题示例**："帮扶方案推荐" 或 "可参考案例"`,

      data_query: `
**响应重点**：具体数据指标
- 根据用户提到的指标（营收、租金、客流等）展开
- 提供数据对比（如有同期/同类数据）
- 简洁呈现数据，避免过度解读
- **标题示例**："数据查询结果"`,
    };

    return strategies[primaryIntent] || strategies['health_query'];
  }

  /**
   * ⭐v3.1新增：格式化详细运营数据为Prompt文本
   * 将 operationalDetails 转换为人类可读的文本，供LLM使用
   */
  private formatOperationalDetails(details: any, category: string): string {
    const lines: string[] = [];

    // 通用数据
    if (details.dailyFootfall !== undefined) {
      lines.push(`- 日均客流：${details.dailyFootfall}人次`);
    }
    if (details.peakHourFootfall !== undefined) {
      lines.push(`- 高峰期客流：${details.peakHourFootfall}人次`);
    }
    if (details.conversionRate !== undefined) {
      lines.push(`- 进店转化率：${details.conversionRate}%`);
    }

    // 餐饮数据（仅餐饮业态）
    if (details.restaurant && category.startsWith('餐饮')) {
      lines.push('\n**餐饮运营数据**:');
      if (details.restaurant.tableCount) {
        lines.push(`- 餐桌数：${details.restaurant.tableCount}张`);
      }
      if (details.restaurant.seatingCapacity) {
        lines.push(`- 座位数：${details.restaurant.seatingCapacity}个`);
      }
      if (details.restaurant.turnoverRate !== undefined) {
        lines.push(`- ⭐翻台率：${details.restaurant.turnoverRate}次/天`);
      }
      if (details.restaurant.avgWaitTime) {
        lines.push(`- 平均等位时长：${details.restaurant.avgWaitTime}分钟`);
      }
      if (details.restaurant.avgMealDuration) {
        lines.push(`- 平均用餐时长：${details.restaurant.avgMealDuration}分钟`);
      }
      if (details.restaurant.errorOrderRate !== undefined) {
        lines.push(`- 错漏单率：${details.restaurant.errorOrderRate}%`);
      }
      if (details.restaurant.avgCheckSize) {
        lines.push(`- 客单价：¥${details.restaurant.avgCheckSize}`);
      }
    }

    // 零售数据（仅零售业态）
    if (details.retail && category.startsWith('零售')) {
      lines.push('\n**零售运营数据**:');
      if (details.retail.dailySales) {
        lines.push(`- 日均销售额：¥${details.retail.dailySales}`);
      }
      if (details.retail.avgTransactionValue) {
        lines.push(`- 客单价：¥${details.retail.avgTransactionValue}`);
      }
      if (details.retail.inventoryTurnover !== undefined) {
        lines.push(`- ⭐库存周转率：${details.retail.inventoryTurnover}次/月`);
      }
      if (details.retail.returnRate !== undefined) {
        lines.push(`- 退货率：${details.retail.returnRate}%`);
      }
    }

    // 顾客数据
    if (details.customer) {
      lines.push('\n**顾客数据**:');
      if (details.customer.npsScore !== undefined) {
        lines.push(`- ⭐NPS净推荐值：${details.customer.npsScore}分`);
      }
      if (details.customer.repeatCustomerRate !== undefined) {
        lines.push(`- 复购率：${details.customer.repeatCustomerRate}%`);
      }
      if (details.customer.newCustomerRatio !== undefined) {
        lines.push(`- 新客占比：${details.customer.newCustomerRatio}%`);
      }
      if (details.customer.avgCustomerLifetime) {
        lines.push(`- 客户生命周期：${details.customer.avgCustomerLifetime}月`);
      }
    }

    // 员工数据
    if (details.staff?.totalCount) {
      lines.push('\n**员工数据**:');
      lines.push(`- 总人数：${details.staff.totalCount}人`);
      if (details.staff.fullTimeCount !== undefined) {
        lines.push(`- 全职人数：${details.staff.fullTimeCount}人`);
      }
      if (details.staff.partTimeCount !== undefined) {
        lines.push(`- 兼职人数：${details.staff.partTimeCount}人`);
      }
      if (details.staff.turnoverRate !== undefined) {
        lines.push(`- ⭐员工流失率：${details.staff.turnoverRate}%/年`);
      }
      if (details.staff.avgTenure) {
        lines.push(`- 平均工龄：${details.staff.avgTenure}月`);
      }
    }

    // 竞争环境
    if (details.competition?.nearbyCompetitors !== undefined) {
      lines.push('\n**竞争环境**:');
      lines.push(`- 3km内竞品数量：${details.competition.nearbyCompetitors}家`);
      if (details.competition.marketShare !== undefined) {
        lines.push(`- 市场份额：${details.competition.marketShare}%`);
      }
      if (details.competition.competitivePosition) {
        lines.push(`- 竞争定位：${details.competition.competitivePosition}`);
      }
    }

    // 位置数据
    if (details.location?.zoneType) {
      lines.push('\n**位置信息**:');
      if (details.location.floor) {
        lines.push(`- 楼层：${details.location.floor}`);
      }
      lines.push(`- 区域类型：${details.location.zoneType}`);
      if (details.location.adjacentToAnchor !== undefined) {
        lines.push(`- 毗邻主力店：${details.location.adjacentToAnchor ? '是' : '否'}`);
      }
      if (details.location.visibilityRating) {
        lines.push(`- 可见度评级：${details.location.visibilityRating}分/5分`);
      }
    }

    // 元数据（数据来源和更新时间）
    if (details.lastUpdated || details.dataSource) {
      lines.push('\n**数据元信息**:');
      if (details.lastUpdated) {
        const updateDate = new Date(details.lastUpdated).toLocaleDateString('zh-CN');
        lines.push(`- 最后更新：${updateDate}`);
      }
      if (details.dataSource) {
        const sourceLabels: Record<string, string> = {
          inspection: '现场巡检',
          pos: 'POS系统',
          manual: '手动录入',
          third_party: '第三方数据',
        };
        lines.push(`- 数据来源：${sourceLabels[details.dataSource] || details.dataSource}`);
      }
    }

    return lines.join('\n');
  }

  /**
   * 🔥 新增：生成档案查询响应
   */
  private generateArchiveQueryResponse(merchant: Merchant, result: any): string {
    return `# ${merchant.name} - 历史帮扶档案

📋 正在为您跳转到历史帮扶档案页面...

您可以在档案页面查看：
- 历史帮扶记录
- 帮扶措施和效果
- 问题解决进展
- 相关文档和附件

💡 如需创建新的帮扶任务，请告诉我具体需求。`;
  }
}

// 导出单例实例
export const responseGenerator = new ResponseGenerator();
