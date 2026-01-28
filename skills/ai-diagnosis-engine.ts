/**
 * AI Diagnosis & Recommendation Engine（AI诊断与推荐引擎）
 *
 * 功能：智能商户问题诊断和知识库案例匹配
 *
 * 核心算法：
 * - 指标问题分析（5维度健康度评估）
 * - 问题标签提取（NLP关键词识别）
 * - 智能案例匹配（多维度加权评分）
 * - 诊断报告生成（结构化输出）
 *
 * 复用场景：
 * - 健康度监控页面的AI诊断
 * - 帮扶任务中心的策略推荐
 * - 知识库案例的智能匹配
 * - 风险预警的问题识别
 *
 * ## 匹配算法
 *
 * 采用多维度加权评分机制：
 * 1. **业态匹配**（基础分40分）
 *    - 完全匹配：40分
 *    - 大类匹配：25分
 *
 * 2. **问题标签匹配**（主要评分）
 *    - 每个匹配标签：15分
 *
 * 3. **症状关键词匹配**（额外加分）
 *    - 每个关键词：5分
 *
 * 最终按匹配分数排序，推荐Top N个案例。
 *
 * @example
 * ```typescript
 * const merchant = {
 *   name: '海底捞火锅',
 *   category: '餐饮-火锅',
 *   metrics: { collection: 60, operational: 35, ... },
 *   rentToSalesRatio: 0.28
 * };
 *
 * const report = generateDiagnosisReport(merchant, knowledgeBase);
 * console.log(report.problems);        // ['租金缴纳存在风险(60分)', '经营表现不佳(35分)']
 * console.log(report.riskLevel);       // 'high'
 * console.log(report.matchedCases[0]); // 最佳匹配案例
 * ```
 *
 * @version 2.0
 * @priority P0
 * @updated 2026-01-28 - 迁移到skills目录
 */

export interface MerchantMetrics {
  collection: number;      // 租金缴纳 (0-100)
  operational: number;     // 经营表现 (0-100)
  siteQuality: number;     // 现场品质 (0-100)
  customerReview: number;  // 顾客满意度 (0-100)
  riskResistance: number;  // 抗风险能力 (0-100)
}

export interface MerchantInfo {
  name: string;
  category: string;
  metrics: MerchantMetrics;
  rentToSalesRatio?: number;
  description?: string;
}

export interface KnowledgeCase {
  id: string;
  merchantName?: string;
  industry: string;
  tags: string[];
  symptoms: string;
  diagnosis: string;
  strategy: string;
  action: string;
  result?: string;
}

export interface DiagnosisResult {
  merchantName: string;
  category: string;
  riskLevel: string;
  problems: string[];
  problemTags: string[];
  matchedCases: Array<KnowledgeCase & { matchScore: number }>;
  recommendations: Array<{
    strategy: string;
    action: string;
    caseId: string;
  }>;
}

/**
 * 分析商户指标问题
 *
 * 基于5维度健康度指标，识别存在的问题并生成问题标签。
 *
 * @param metrics - 商户健康度指标
 * @param rentToSalesRatio - 租售比（可选）
 * @returns 问题描述和标签列表
 *
 * @example
 * ```typescript
 * const result = analyzeMetricsProblems(
 *   { collection: 60, operational: 35, ... },
 *   0.28
 * );
 * console.log(result.problems); // ['租金缴纳存在风险(60分)', ...]
 * console.log(result.tags);     // ['收缴问题', '欠租', '业绩下滑', ...]
 * ```
 */
export function analyzeMetricsProblems(
  metrics: MerchantMetrics,
  rentToSalesRatio?: number
): { problems: string[]; tags: string[] } {
  const problems: string[] = [];
  const tags: string[] = [];

  // 租金缴纳分析
  if (metrics.collection < 80) {
    problems.push(`租金缴纳存在风险(${metrics.collection}分)`);
    tags.push('收缴问题', '欠租');
  }

  // 经营表现分析
  if (metrics.operational < 60) {
    problems.push(`经营表现不佳(${metrics.operational}分)`);
    tags.push('业绩下滑', '营收低', '客流少');
  }

  // 顾客满意度分析
  if (metrics.customerReview < 70) {
    problems.push(`顾客满意度偏低(${metrics.customerReview}分)`);
    tags.push('口碑差', '服务问题', '投诉');
  }

  // 现场品质分析
  if (metrics.siteQuality < 70) {
    problems.push(`现场品质需改善(${metrics.siteQuality}分)`);
    tags.push('陈列差', '环境问题');
  }

  // 抗风险能力分析
  if (metrics.riskResistance < 60) {
    problems.push(`抗风险能力较弱(${metrics.riskResistance}分)`);
    tags.push('经营脆弱', '抗压能力差');
  }

  // 租售比分析
  if (rentToSalesRatio && rentToSalesRatio > 0.25) {
    problems.push(`租售比过高(${(rentToSalesRatio * 100).toFixed(1)}%)，超过25%警戒线`);
    tags.push('高租售比', '租金压力', '降租');
  }

  return { problems, tags };
}

/**
 * 从描述中提取问题标签
 *
 * 使用关键词匹配方式，从自然语言描述中提取结构化标签。
 *
 * @param description - 商户问题描述
 * @returns 提取的标签列表
 *
 * @example
 * ```typescript
 * const tags = extractTagsFromDescription('租售比过高，客流少，投诉多');
 * console.log(tags); // ['高租售比', '租金压力', '客流少', '投诉', ...]
 * ```
 */
export function extractTagsFromDescription(description: string): string[] {
  const tags: string[] = [];

  if (description.includes('租售比')) {
    tags.push('高租售比', '租金压力', '降租');
  }
  if (description.includes('营收') || description.includes('销售')) {
    tags.push('营收低', '业绩差');
  }
  if (description.includes('客流')) {
    tags.push('客流少', '引流');
  }
  if (description.includes('投诉') || description.includes('满意度')) {
    tags.push('投诉', '服务问题');
  }
  if (description.includes('环境') || description.includes('陈列')) {
    tags.push('环境问题', '陈列差');
  }

  return tags;
}

/**
 * 识别商户业态分类
 *
 * 优先使用已有分类，否则根据商户名称推断业态。
 *
 * @param merchantName - 商户名称
 * @param category - 已有分类（可选）
 * @returns 业态分类字符串
 *
 * @example
 * ```typescript
 * identifyMerchantCategory('海底捞火锅');     // '餐饮-火锅'
 * identifyMerchantCategory('优衣库');         // '零售-服饰'
 * identifyMerchantCategory('万达影城');       // '主力店-影城'
 * ```
 */
export function identifyMerchantCategory(merchantName: string, category?: string): string {
  // 优先使用已有分类
  if (category) return category;

  // 根据商户名称推断
  if (merchantName.includes('火锅')) return '餐饮-火锅';
  if (merchantName.includes('茶') || merchantName.includes('咖啡')) return '餐饮-饮品';
  if (merchantName.includes('餐')) return '餐饮-正餐';
  if (merchantName.includes('影城')) return '主力店-影城';
  if (merchantName.includes('超市')) return '主力店-超市';
  if (merchantName.includes('服饰') || merchantName.includes('装')) return '零售-服饰';
  if (merchantName.includes('珠宝') || merchantName.includes('金')) return '零售-珠宝';

  return '餐饮'; // 默认分类
}

/**
 * 智能匹配知识库案例
 *
 * 使用多维度加权评分算法，从知识库中找出最匹配的案例。
 *
 * 匹配维度：
 * 1. 业态匹配（40分 or 25分）
 * 2. 问题标签匹配（每个15分）
 * 3. 症状关键词匹配（每个5分）
 *
 * @param merchantCategory - 商户业态分类
 * @param problemTags - 问题标签列表
 * @param knowledgeBase - 知识库案例数组
 * @param topN - 返回Top N个案例（默认3个）
 * @returns 按匹配度排序的案例列表
 *
 * @example
 * ```typescript
 * const matchedCases = matchKnowledgeCases(
 *   '餐饮-火锅',
 *   ['业绩下滑', '租金压力', '客流少'],
 *   knowledgeBase,
 *   3
 * );
 * console.log(matchedCases[0].matchScore); // 85
 * console.log(matchedCases[0].strategy);   // 推荐策略
 * ```
 */
export function matchKnowledgeCases(
  merchantCategory: string,
  problemTags: string[],
  knowledgeBase: KnowledgeCase[],
  topN: number = 3
): Array<KnowledgeCase & { matchScore: number }> {
  const scoredCases = knowledgeBase.map(c => {
    let score = 0;

    // 1. 业态匹配（权重40%）
    const caseCategory = c.industry.split('-')[0];
    const taskCategory = merchantCategory.split('-')[0];

    if (c.industry === merchantCategory) {
      score += 40; // 完全匹配
    } else if (caseCategory === taskCategory) {
      score += 25; // 大类匹配
    }

    // 2. 问题标签匹配（权重60%）
    const matchedTags = c.tags.filter(tag =>
      problemTags.some(pt => pt.includes(tag) || tag.includes(pt))
    );
    score += matchedTags.length * 15;

    // 3. 症状关键词匹配（额外加分）
    problemTags.forEach(pt => {
      if (c.symptoms.includes(pt) || c.diagnosis.includes(pt)) {
        score += 5;
      }
    });

    return { ...c, matchScore: score };
  });

  // 按匹配度排序，取前N个
  return scoredCases
    .filter(c => c.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, topN);
}

/**
 * 生成AI诊断报告
 *
 * 综合商户指标、问题分析、案例匹配，生成完整的诊断报告。
 *
 * 报告包含：
 * - 问题清单
 * - 风险等级（基于v2.0的5等级标准）
 * - 匹配的知识库案例
 * - 推荐的帮扶措施
 *
 * @param merchant - 商户信息
 * @param knowledgeBase - 知识库案例数组
 * @returns 完整的诊断报告
 *
 * @example
 * ```typescript
 * const report = generateDiagnosisReport(merchant, knowledgeBase);
 * console.log(report.riskLevel);           // 'high'
 * console.log(report.problems);            // ['租金缴纳存在风险(60分)', ...]
 * console.log(report.matchedCases.length); // 3
 * console.log(report.recommendations);     // [{ strategy: '...', action: '...' }]
 * ```
 */
export function generateDiagnosisReport(
  merchant: MerchantInfo,
  knowledgeBase: KnowledgeCase[]
): DiagnosisResult {
  // 1. 分析指标问题
  const { problems: metricProblems, tags: metricTags } = analyzeMetricsProblems(
    merchant.metrics,
    merchant.rentToSalesRatio
  );

  // 2. 从描述中提取问题标签
  const descriptionTags = merchant.description
    ? extractTagsFromDescription(merchant.description)
    : [];

  // 3. 合并所有问题标签
  const allProblemTags = [...metricTags, ...descriptionTags];

  // 4. 识别商户业态
  const merchantCategory = identifyMerchantCategory(merchant.name, merchant.category);

  // 5. 匹配知识库案例
  const matchedCases = matchKnowledgeCases(
    merchantCategory,
    allProblemTags,
    knowledgeBase,
    3
  );

  // 6. 生成推荐措施
  const recommendations = matchedCases.map(c => ({
    strategy: c.strategy,
    action: c.action,
    caseId: c.id
  }));

  // 7. 评估风险等级（使用v2.0的5等级标准）
  const avgScore = Object.values(merchant.metrics).reduce((a, b) => a + b, 0) / 5;
  let riskLevel: string;
  if (avgScore >= 90) {
    riskLevel = 'none';      // 无风险：90-100
  } else if (avgScore >= 80) {
    riskLevel = 'low';       // 低风险：80-89
  } else if (avgScore >= 60) {
    riskLevel = 'medium';    // 中风险：60-79
  } else if (avgScore >= 40) {
    riskLevel = 'high';      // 高风险：40-59
  } else {
    riskLevel = 'critical';  // 极高风险：0-39
  }

  return {
    merchantName: merchant.name,
    category: merchantCategory,
    riskLevel,
    problems: metricProblems,
    problemTags: allProblemTags,
    matchedCases,
    recommendations
  };
}

/**
 * 快速诊断（简化版）
 *
 * 只返回推荐的帮扶措施，不返回完整的诊断报告。
 * 适用于需要快速获取行动建议的场景。
 *
 * @param merchant - 商户信息
 * @param knowledgeBase - 知识库案例数组
 * @returns 推荐措施列表
 *
 * @example
 * ```typescript
 * const actions = quickDiagnosis(merchant, knowledgeBase);
 * console.log(actions); // ['开展会员营销活动', '调整菜品价格', ...]
 * ```
 */
export function quickDiagnosis(
  merchant: MerchantInfo,
  knowledgeBase: KnowledgeCase[]
): string[] {
  const report = generateDiagnosisReport(merchant, knowledgeBase);
  return report.recommendations.map(r => r.action);
}
