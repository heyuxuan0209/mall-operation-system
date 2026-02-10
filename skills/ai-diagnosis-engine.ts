/**
 * AI Diagnosis & Recommendation Engine（AI诊断与推荐引擎）⭐v3.0升级
 *
 * 功能：智能商户问题诊断和知识库案例匹配
 *
 * ## v3.0 核心改进（Iteration 2）
 * - ⭐ **LLM因果推理诊断**：从规则检测升级为因果分析
 *   - 区分根因（root cause）vs 症状（symptom）
 *   - 内因 vs 外因（内部管理 vs 外部环境）
 *   - 结构性 vs 暂时性问题
 *   - 问题关联链（A导致B，进而导致C）
 * - ⭐ **规则验证层**：防止LLM幻觉，确保诊断可靠
 * - ⭐ **个性化诊断**：基于商户具体情况，非模板化
 *
 * ## v2.0 算法（作为fallback保留）
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
 * // v3.0 增强诊断（推荐）
 * const report = await generateEnhancedDiagnosisReport(merchant, knowledgeBase);
 * console.log(report.rootCauses);      // ['位置劣势（主因）', '租金压力（次因）']
 * console.log(report.problemChain);    // '位置差 → 客流少 → 营收低 → 租金压力'
 * console.log(report.severity);        // { urgency: 'high', impact: 'critical' }
 *
 * // v2.0 规则诊断（fallback）
 * const report = generateDiagnosisReport(merchant, knowledgeBase);
 * console.log(report.problems);        // ['租金缴纳存在风险(60分)', ...]
 * ```
 *
 * @version 3.0
 * @priority P0
 * @updated 2026-02-09 - v3.0 Iteration 2: LLM因果推理升级
 */

import { llmClient } from '@/utils/ai-assistant/llmClient';
import type { LLMMessage } from '@/types/ai-assistant';

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

// ============================================
// v3.0 增强诊断功能 ⭐Iteration 2
// ============================================

/**
 * 根因类型
 */
export type RootCauseType = 'internal' | 'external' | 'structural' | 'temporary';

/**
 * 根因分析结果
 */
export interface RootCause {
  cause: string;              // 根因描述
  type: RootCauseType;        // 根因类型
  confidence: number;         // 置信度 0-100
  evidence: string[];         // 支撑证据
  impact: 'primary' | 'secondary' | 'minor';  // 影响程度
}

/**
 * 问题关联链
 */
export interface ProblemChain {
  steps: string[];            // 问题关联步骤
  explanation: string;        // 关联解释
}

/**
 * 严重程度评估
 */
export interface SeverityAssessment {
  urgency: 'low' | 'medium' | 'high' | 'critical';     // 紧急度
  importance: 'low' | 'medium' | 'high' | 'critical';  // 重要度
  overall: 'low' | 'medium' | 'high' | 'critical';     // 综合评级
  reasoning: string;                                    // 评估理由
}

/**
 * 可行性评估
 */
export interface FeasibilityAssessment {
  score: number;              // 可行性评分 0-100
  constraints: string[];      // 约束条件
  resources: string[];        // 所需资源
  timeline: string;           // 预计时间
}

/**
 * v3.0 增强诊断报告
 */
export interface EnhancedDiagnosisReport {
  // 基础信息（继承v2.0）
  merchantName: string;
  category: string;
  riskLevel: string;

  // ⭐v3.0 新增字段
  symptoms: string[];                    // 症状列表
  rootCauses: RootCause[];              // 根因分析
  problemChain?: ProblemChain;          // 问题关联链
  severity: SeverityAssessment;         // 严重程度
  feasibility?: FeasibilityAssessment;  // 可行性评估
  diagnosis: string;                    // LLM生成的诊断描述

  // v2.0 兼容字段
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
 * ⭐v3.0 增强诊断 - LLM因果推理
 *
 * 使用LLM分析商户问题，提供根因分析和因果推理
 */
export async function generateEnhancedDiagnosisReport(
  merchant: MerchantInfo,
  knowledgeBase: KnowledgeCase[]
): Promise<EnhancedDiagnosisReport> {
  // Step 1: 先使用v2.0规则诊断作为基础
  const basicReport = generateDiagnosisReport(merchant, knowledgeBase);

  // Step 2: 如果LLM不可用，降级到v2.0报告
  if (!llmClient) {
    console.warn('[EnhancedDiagnosis] LLM not available, falling back to v2.0');
    return {
      ...basicReport,
      symptoms: basicReport.problems,
      rootCauses: [],
      severity: inferSeverityFromMetrics(merchant.metrics),
      diagnosis: basicReport.problems.join('；'),
    };
  }

  try {
    // Step 3: LLM因果推理分析
    const llmAnalysis = await analyzeCausalRelations(merchant, basicReport);

    // Step 4: 规则验证（防止幻觉）
    const validated = validateDiagnosisWithRules(llmAnalysis, merchant);

    // Step 5: 组合最终报告
    return {
      ...basicReport,
      symptoms: validated.symptoms || basicReport.problems,
      rootCauses: validated.rootCauses || [],
      problemChain: validated.problemChain,
      severity: validated.severity || inferSeverityFromMetrics(merchant.metrics),
      feasibility: validated.feasibility,
      diagnosis: validated.diagnosis || basicReport.problems.join('；'),
    };
  } catch (error) {
    console.error('[EnhancedDiagnosis] LLM analysis failed:', error);
    // 降级到v2.0
    return {
      ...basicReport,
      symptoms: basicReport.problems,
      rootCauses: [],
      severity: inferSeverityFromMetrics(merchant.metrics),
      diagnosis: basicReport.problems.join('；'),
    };
  }
}

/**
 * 格式化详细运营数据为人类可读文本
 * @param details - 运营详细数据
 * @param category - 商户业态
 * @returns 格式化的文本描述
 */
function formatOperationalDetails(
  details: any | undefined,
  category: string
): string {
  if (!details || Object.keys(details).length === 0) {
    return '暂无详细运营数据';
  }

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
    lines.push('\n餐饮运营:');
    if (details.restaurant.tableCount) {
      lines.push(`- 餐桌数：${details.restaurant.tableCount}张`);
    }
    if (details.restaurant.seatingCapacity) {
      lines.push(`- 座位数：${details.restaurant.seatingCapacity}个`);
    }
    if (details.restaurant.turnoverRate) {
      lines.push(`- 翻台率：${details.restaurant.turnoverRate}次/天`);
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
    lines.push('\n零售运营:');
    if (details.retail.dailySales) {
      lines.push(`- 日均销售额：¥${details.retail.dailySales}`);
    }
    if (details.retail.avgTransactionValue) {
      lines.push(`- 客单价：¥${details.retail.avgTransactionValue}`);
    }
    if (details.retail.inventoryTurnover) {
      lines.push(`- 库存周转率：${details.retail.inventoryTurnover}次/月`);
    }
    if (details.retail.returnRate !== undefined) {
      lines.push(`- 退货率：${details.retail.returnRate}%`);
    }
  }

  // 顾客数据
  if (details.customer) {
    lines.push('\n顾客数据:');
    if (details.customer.npsScore !== undefined) {
      lines.push(`- NPS净推荐值：${details.customer.npsScore}分`);
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
    lines.push('\n员工数据:');
    lines.push(`- 总人数：${details.staff.totalCount}人`);
    if (details.staff.fullTimeCount !== undefined) {
      lines.push(`- 全职人数：${details.staff.fullTimeCount}人`);
    }
    if (details.staff.partTimeCount !== undefined) {
      lines.push(`- 兼职人数：${details.staff.partTimeCount}人`);
    }
    if (details.staff.turnoverRate !== undefined) {
      lines.push(`- 流失率：${details.staff.turnoverRate}%/年`);
    }
    if (details.staff.avgTenure) {
      lines.push(`- 平均工龄：${details.staff.avgTenure}月`);
    }
  }

  // 竞争环境
  if (details.competition?.nearbyCompetitors !== undefined) {
    lines.push('\n竞争环境:');
    lines.push(`- 3km内竞品：${details.competition.nearbyCompetitors}家`);
    if (details.competition.marketShare !== undefined) {
      lines.push(`- 市场份额：${details.competition.marketShare}%`);
    }
    if (details.competition.competitivePosition) {
      lines.push(`- 竞争定位：${details.competition.competitivePosition}`);
    }
  }

  // 位置数据
  if (details.location?.zoneType) {
    lines.push('\n位置信息:');
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

  return lines.join('\n');
}

/**
 * LLM因果关系分析
 */
async function analyzeCausalRelations(
  merchant: MerchantInfo,
  basicReport: DiagnosisResult
): Promise<Partial<EnhancedDiagnosisReport>> {
  const prompt = `
# 任务
作为商户运营专家，请对商户进行深度因果分析诊断。

# 商户信息
- 名称：${merchant.name}
- 业态：${merchant.category}
- 租售比：${merchant.rentToSalesRatio || 'N/A'}

# 健康度指标（0-100分）
- 租金缴纳：${merchant.metrics.collection}
- 经营表现：${merchant.metrics.operational}
- 现场品质：${merchant.metrics.siteQuality}
- 顾客满意度：${merchant.metrics.customerReview}
- 抗风险能力：${merchant.metrics.riskResistance}

# ⭐详细运营数据（实际采集）
${formatOperationalDetails((merchant as any).operationalDetails, merchant.category)}

${(merchant as any).operationalDetails && Object.keys((merchant as any).operationalDetails).length > 0
  ? '⚠️ 以上数据为**真实采集数据**，请在分析中优先使用，避免基于假设推测。'
  : '⚠️ 注意：无详细运营数据，请基于健康度指标进行推测性分析，并在诊断中标注为"推测"。'}

# 初步诊断（规则检测）
${basicReport.problems.join('\n')}

# 诊断要求

## 1. 区分症状和根因
- **症状**：表面现象（如"营收低"、"客流少"）
- **根因**：深层原因（如"位置劣势"、"产品竞争力不足"）

## 2. 根因分类
- **内因**：商户自身可控（管理、产品、服务）
- **外因**：外部环境（位置、竞争、市场）
- **结构性**：长期存在，难以快速改变
- **暂时性**：短期波动，可以调整

## 3. 问题关联链
分析问题之间的因果关系，例如：
"位置劣势（根因） → 自然客流少 → 营收不足 → 租金压力"

## 4. 严重程度评估
- **紧急度**：问题多紧急？（low/medium/high/critical）
- **重要度**：影响多大？（low/medium/high/critical）
- 综合评级和理由

## 5. 可行性评估
- 改善的可行性评分（0-100）
- 约束条件（商户资源、外部限制）
- 所需资源和时间

# 输出格式（严格JSON）
\`\`\`json
{
  "symptoms": ["症状1", "症状2"],
  "rootCauses": [
    {
      "cause": "根因描述",
      "type": "internal | external | structural | temporary",
      "confidence": 90,
      "evidence": ["证据1", "证据2"],
      "impact": "primary | secondary | minor"
    }
  ],
  "problemChain": {
    "steps": ["步骤1", "步骤2", "步骤3"],
    "explanation": "关联解释"
  },
  "severity": {
    "urgency": "high",
    "importance": "critical",
    "overall": "critical",
    "reasoning": "评估理由"
  },
  "feasibility": {
    "score": 65,
    "constraints": ["约束1", "约束2"],
    "resources": ["资源1", "资源2"],
    "timeline": "3-6个月"
  },
  "diagnosis": "综合诊断描述（2-3句话）"
}
\`\`\`

# 关键约束
1. 只返回JSON，不要有任何额外文字
2. 根因要具体、可验证，避免泛泛而谈
3. 问题关联链要符合逻辑，有因果关系
4. 可行性评估要考虑商户实际情况

现在请分析：
`.trim();

  const messages: LLMMessage[] = [
    {
      role: 'system',
      content: '你是资深商户运营专家，擅长因果分析和根本原因诊断。你必须提供具体、可验证的诊断，避免模糊和套话。',
    },
    {
      role: 'user',
      content: prompt,
    },
  ];

  if (!llmClient) {
    throw new Error('LLM client is not available');
  }

  const response = await llmClient.chat(messages, { useCache: false });

  // 解析JSON响应
  const jsonMatch = response.content.match(/```json\n([\s\S]*?)\n```/) ||
                    response.content.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error('Failed to parse LLM response as JSON');
  }

  const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
  return parsed;
}

/**
 * 规则验证诊断结果（防止LLM幻觉）
 */
function validateDiagnosisWithRules(
  llmAnalysis: Partial<EnhancedDiagnosisReport>,
  merchant: MerchantInfo
): Partial<EnhancedDiagnosisReport> {
  // 验证1: 根因数量合理（1-5个）
  if (llmAnalysis.rootCauses && llmAnalysis.rootCauses.length > 5) {
    llmAnalysis.rootCauses = llmAnalysis.rootCauses.slice(0, 5);
  }

  // 验证2: 置信度在合理范围
  if (llmAnalysis.rootCauses) {
    llmAnalysis.rootCauses = llmAnalysis.rootCauses.map(rc => ({
      ...rc,
      confidence: Math.min(100, Math.max(0, rc.confidence)),
    }));
  }

  // 验证3: 可行性评分在合理范围
  if (llmAnalysis.feasibility) {
    llmAnalysis.feasibility.score = Math.min(100, Math.max(0, llmAnalysis.feasibility.score));
  }

  // 验证4: 严重程度与指标一致性检查
  const avgScore = Object.values(merchant.metrics).reduce((a, b) => a + b, 0) / 5;
  if (avgScore < 40 && llmAnalysis.severity?.overall === 'low') {
    // 指标很差但评级低 → 修正为high
    llmAnalysis.severity.overall = 'high';
  }

  return llmAnalysis;
}

/**
 * 从指标推断严重程度（fallback）
 */
function inferSeverityFromMetrics(metrics: MerchantMetrics): SeverityAssessment {
  const avgScore = Object.values(metrics).reduce((a, b) => a + b, 0) / 5;

  if (avgScore < 40) {
    return {
      urgency: 'critical',
      importance: 'critical',
      overall: 'critical',
      reasoning: '多项指标严重偏低，需要立即干预',
    };
  } else if (avgScore < 60) {
    return {
      urgency: 'high',
      importance: 'high',
      overall: 'high',
      reasoning: '健康度偏低，存在明显风险',
    };
  } else if (avgScore < 80) {
    return {
      urgency: 'medium',
      importance: 'medium',
      overall: 'medium',
      reasoning: '部分指标需要改善',
    };
  } else {
    return {
      urgency: 'low',
      importance: 'low',
      overall: 'low',
      reasoning: '整体健康度良好',
    };
  }
}
