/**
 * AI Diagnosis & Recommendation Engine
 * AI诊断与推荐引擎 - 智能问题诊断和案例匹配
 *
 * Priority: P0
 * Use Cases: 商户问题诊断、帮扶策略推荐、知识库案例匹配
 */

export interface MerchantMetrics {
  collection: number;      // 租金缴纳
  operational: number;     // 经营表现
  siteQuality: number;     // 现场品质
  customerReview: number;  // 顾客满意度
  riskResistance: number;  // 抗风险能力
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
 */
export function identifyMerchantCategory(merchantName: string, category?: string): string {
  // 优先使用已有分类
  if (category) return category;

  // 根据商户名称推断
  if (merchantName.includes('火锅')) return '餐饮-火锅';
  if (merchantName.includes('茶') || merchantName.includes('咖啡')) return '餐饮-饮品';
  if (merchantName.includes('餐')) return '餐饮-正餐';
  if (merchantName.includes('影城')) return '主力店-影城';
  if (merchantName.includes('超市')) return '主力���-超市';
  if (merchantName.includes('服饰') || merchantName.includes('装')) return '零售-服饰';
  if (merchantName.includes('珠宝') || merchantName.includes('金')) return '零售-珠宝';

  return '餐饮'; // 默认分类
}

/**
 * 智能匹配知识库案例
 *
 * 匹配算法：
 * 1. 业态匹配（权重40%）：完全匹配40分，大类匹配25分
 * 2. 问题标签匹配（权重60%）：每个匹配标签15分
 * 3. 症状关键词匹配（额外加分）：每个匹配关键词5分
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

  // 7. 评估风险等级
  const avgScore = Object.values(merchant.metrics).reduce((a, b) => a + b, 0) / 5;
  const riskLevel = avgScore < 50 ? 'high' : avgScore < 70 ? 'medium' : 'low';

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
 * 快速诊断（仅返回推荐措施）
 */
export function quickDiagnosis(
  merchant: MerchantInfo,
  knowledgeBase: KnowledgeCase[]
): string[] {
  const report = generateDiagnosisReport(merchant, knowledgeBase);
  return report.recommendations.map(r => r.action);
}
