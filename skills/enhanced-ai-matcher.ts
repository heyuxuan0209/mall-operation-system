/**
 * AI智能推荐引擎 v2.0 - 增强版
 *
 * 新增功能：
 * - 成功率权重：优先推荐成功案例
 * - 时效性权重：优先推荐近期案例
 * - 相似度计算：基于多维度特征的相似度
 * - 动态权重调整：根据历史反馈调整权重
 * - 多策略融合：结合多种推荐策略
 */

export interface EnhancedAIMatcherInput {
  merchantName: string;
  merchantCategory: string;
  problemTags: string[];
  metrics?: {
    collection: number;
    operational: number;
    siteQuality: number;
    customerReview: number;
    riskResistance: number;
  };
  riskLevel?: 'high' | 'medium' | 'low' | 'none';
  symptoms?: string;
  description?: string;
  knowledgeBase: any[];
  historicalFeedback?: {
    caseId: string;
    adopted: boolean;
    effective: boolean;
  }[];
}

export interface EnhancedMatchedCase {
  case: any;
  matchScore: number;
  confidence: number; // 置信度 0-100
  matchReasons: string[];
  successProbability: number; // 成功概率 0-100
  recommendationRank: number; // 推荐排名
}

export interface EnhancedAIMatcherOutput {
  matchedCases: EnhancedMatchedCase[];
  topSuggestions: string[];
  insights: string[]; // AI洞察
  alternativeStrategies: string[]; // 备选策略
}

/**
 * 增强版智能匹配算法
 *
 * 算法改进：
 * 1. 多维度特征匹配（业态、问题、指标相似度）
 * 2. 成功率加权（优先推荐成功案例）
 * 3. 时效性加权（优先推荐近期案例）
 * 4. 动态权重调整（基于历史反馈）
 * 5. 置信度评估（评估推荐可靠性）
 */
export function enhancedMatchCases(input: EnhancedAIMatcherInput): EnhancedAIMatcherOutput {
  const {
    merchantName,
    merchantCategory,
    problemTags,
    metrics,
    riskLevel,
    symptoms,
    description,
    knowledgeBase,
    historicalFeedback = []
  } = input;

  // 分析商户业态
  const categoryParts = merchantCategory.split('-');
  const mainCategory = categoryParts[0];

  // 计算历史反馈权重
  const feedbackWeights = calculateFeedbackWeights(historicalFeedback);

  // 智能匹配知识库案例
  const scoredCases = knowledgeBase.map((c: any) => {
    let score = 0;
    const reasons: string[] = [];

    // 1. 业态匹配（基础权重30%）
    const caseCategoryParts = c.industry.split('-');
    const caseMainCategory = caseCategoryParts[0];

    if (c.industry === merchantCategory) {
      score += 30;
      reasons.push(`完全匹配业态：${merchantCategory}`);
    } else if (caseMainCategory === mainCategory) {
      score += 18;
      reasons.push(`匹配大类：${mainCategory}`);
    }

    // 2. 问题标签匹配（基础权重40%）
    const matchedTags = c.tags.filter((tag: string) =>
      problemTags.some(pt => pt.includes(tag) || tag.includes(pt))
    );

    if (matchedTags.length > 0) {
      const tagScore = Math.min(40, matchedTags.length * 12);
      score += tagScore;
      reasons.push(`匹配问题标签：${matchedTags.join('、')}`);
    }

    // 3. 指标相似度匹配（新增，权重15%）
    if (metrics && c.initialMetrics) {
      const similarity = calculateMetricsSimilarity(metrics, c.initialMetrics);
      const similarityScore = similarity * 15;
      score += similarityScore;
      if (similarity > 0.7) {
        reasons.push(`指标高度相似（${(similarity * 100).toFixed(0)}%）`);
      }
    }

    // 4. 风险等级匹配（新增，权重10%）
    if (riskLevel && c.riskLevel === riskLevel) {
      score += 10;
      reasons.push(`风险等级匹配：${riskLevel}`);
    }

    // 5. 症状关键词匹配（额外加分5%）
    if (symptoms || description) {
      const text = (symptoms || '') + ' ' + (description || '');
      let symptomMatches = 0;
      problemTags.forEach(pt => {
        if (c.symptoms?.includes(pt) || c.diagnosis?.includes(pt)) {
          symptomMatches++;
        }
      });
      if (symptomMatches > 0) {
        score += Math.min(5, symptomMatches * 2);
        reasons.push('症状描述匹配');
      }
    }

    // 6. 成功率加权（新增，最多+20分）
    const successBonus = calculateSuccessBonus(c);
    score += successBonus;
    if (successBonus > 10) {
      reasons.push('高成功率案例');
    }

    // 7. 时效性加权（新增，最多+10分）
    const recencyBonus = calculateRecencyBonus(c);
    score += recencyBonus;
    if (recencyBonus > 5) {
      reasons.push('近期成功案例');
    }

    // 8. 历史反馈调整（新增，±15分）
    const feedbackAdjustment = feedbackWeights[c.id] || 0;
    score += feedbackAdjustment;
    if (feedbackAdjustment > 5) {
      reasons.push('历史反馈良好');
    } else if (feedbackAdjustment < -5) {
      reasons.push('历史效果一般');
    }

    // 计算置信度（基于匹配原因数量和分数）
    const confidence = Math.min(100, (score / 130) * 100 + reasons.length * 5);

    // 计算成功概率（基于历史数据和匹配度）
    const successProbability = calculateSuccessProbability(score, c, feedbackAdjustment);

    return {
      case: c,
      matchScore: Math.round(score),
      confidence: Math.round(confidence),
      matchReasons: reasons,
      successProbability: Math.round(successProbability),
      recommendationRank: 0 // 将在排序后设置
    };
  });

  // 按匹配度排序，取前5个
  const topCases = scoredCases
    .filter(c => c.matchScore > 0)
    .sort((a, b) => {
      // 综合排序：匹配分数 + 成功概率
      const scoreA = a.matchScore * 0.7 + a.successProbability * 0.3;
      const scoreB = b.matchScore * 0.7 + b.successProbability * 0.3;
      return scoreB - scoreA;
    })
    .slice(0, 5)
    .map((c, index) => ({
      ...c,
      recommendationRank: index + 1
    }));

  // 提取推荐措施（取前3个）
  const topSuggestions = topCases.slice(0, 3).map(c => c.case.action);

  // 生成AI洞察
  const insights = generateInsights(topCases, problemTags, riskLevel);

  // 生成备选策略
  const alternativeStrategies = generateAlternativeStrategies(topCases, problemTags);

  return {
    matchedCases: topCases,
    topSuggestions,
    insights,
    alternativeStrategies
  };
}

/**
 * 计算指标相似度
 */
function calculateMetricsSimilarity(metrics1: any, metrics2: any): number {
  const keys = ['collection', 'operational', 'siteQuality', 'customerReview', 'riskResistance'];
  let totalDiff = 0;

  keys.forEach(key => {
    const diff = Math.abs((metrics1[key] || 0) - (metrics2[key] || 0));
    totalDiff += diff;
  });

  const avgDiff = totalDiff / keys.length;
  const similarity = 1 - (avgDiff / 100);
  return Math.max(0, similarity);
}

/**
 * 计算成功率加分
 */
function calculateSuccessBonus(caseData: any): number {
  // 如果案例有成功标记，给予加分
  if (caseData.result && caseData.result.includes('成功')) {
    return 20;
  }
  if (caseData.result && caseData.result.includes('改善')) {
    return 15;
  }
  if (caseData.result && caseData.result.includes('提升')) {
    return 10;
  }
  return 5; // 默认基础分
}

/**
 * 计算时效性加分
 */
function calculateRecencyBonus(caseData: any): number {
  if (!caseData.createdAt) return 0;

  const caseDate = new Date(caseData.createdAt);
  const now = new Date();
  const monthsAgo = (now.getTime() - caseDate.getTime()) / (1000 * 60 * 60 * 24 * 30);

  if (monthsAgo < 3) return 10; // 3个月内
  if (monthsAgo < 6) return 7;  // 6个月内
  if (monthsAgo < 12) return 4; // 1年内
  return 0;
}

/**
 * 计算历史反馈权重
 */
function calculateFeedbackWeights(feedback: any[]): Record<string, number> {
  const weights: Record<string, number> = {};

  feedback.forEach(f => {
    if (!weights[f.caseId]) {
      weights[f.caseId] = 0;
    }

    if (f.adopted && f.effective) {
      weights[f.caseId] += 15; // 采纳且有效
    } else if (f.adopted && !f.effective) {
      weights[f.caseId] -= 10; // 采纳但无效
    } else if (!f.adopted) {
      weights[f.caseId] -= 5; // 未采纳
    }
  });

  return weights;
}

/**
 * 计算成功概率
 */
function calculateSuccessProbability(
  matchScore: number,
  caseData: any,
  feedbackAdjustment: number
): number {
  // 基础概率（基于匹配分数）
  let probability = (matchScore / 130) * 60; // 最高60%

  // 成功案例加成
  if (caseData.result && caseData.result.includes('成功')) {
    probability += 25;
  } else if (caseData.result) {
    probability += 10;
  }

  // 历史反馈调整
  probability += (feedbackAdjustment / 15) * 15; // 最多±15%

  return Math.max(0, Math.min(100, probability));
}

/**
 * 生成AI洞察
 */
function generateInsights(
  topCases: EnhancedMatchedCase[],
  problemTags: string[],
  riskLevel?: string
): string[] {
  const insights: string[] = [];

  if (topCases.length === 0) {
    insights.push('暂无高度匹配的案例，建议咨询专家或尝试创新方案');
    return insights;
  }

  // 分析匹配质量
  const avgConfidence = topCases.reduce((sum, c) => sum + c.confidence, 0) / topCases.length;
  if (avgConfidence > 80) {
    insights.push(`找到${topCases.length}个高度匹配案例，推荐置信度${avgConfidence.toFixed(0)}%`);
  } else if (avgConfidence > 60) {
    insights.push(`找到${topCases.length}个相关案例，建议结合实际情况调整`);
  } else {
    insights.push(`匹配案例较少，建议参考多个方案并谨慎实施`);
  }

  // 分析成功概率
  const avgSuccessProb = topCases.reduce((sum, c) => sum + c.successProbability, 0) / topCases.length;
  if (avgSuccessProb > 75) {
    insights.push(`推荐方案成功概率较高（${avgSuccessProb.toFixed(0)}%），可优先尝试`);
  } else if (avgSuccessProb < 50) {
    insights.push(`建议谨慎评估，必要时寻求专家支持`);
  }

  // 分析问题类型
  if (problemTags.includes('欠租') || problemTags.includes('收缴问题')) {
    insights.push('租金问题需要及时介入，建议优先处理');
  }
  if (problemTags.includes('业绩下滑') || problemTags.includes('营收低')) {
    insights.push('经营问题需要系统性帮扶，建议制定中长期方案');
  }

  return insights;
}

/**
 * 生成备选策略
 */
function generateAlternativeStrategies(
  topCases: EnhancedMatchedCase[],
  problemTags: string[]
): string[] {
  const strategies: string[] = [];

  // 基于问题类型生成通用策略
  if (problemTags.includes('欠租') || problemTags.includes('收缴问题')) {
    strategies.push('协商分期付款方案');
    strategies.push('提供短期租金减免');
  }

  if (problemTags.includes('业绩下滑') || problemTags.includes('营收低')) {
    strategies.push('开展联合营销活动');
    strategies.push('优化商品结构和定价');
    strategies.push('加强员工培训提升服务');
  }

  if (problemTags.includes('客流少')) {
    strategies.push('增加线上推广投入');
    strategies.push('参与商场统一营销活动');
  }

  // 从低匹配案例中提取备选方案
  if (topCases.length > 3) {
    const alternativeCases = topCases.slice(3);
    alternativeCases.forEach(c => {
      if (c.case.action && !strategies.includes(c.case.action)) {
        strategies.push(c.case.action);
      }
    });
  }

  return strategies.slice(0, 3); // 最多返回3个备选策略
}

/**
 * 辅助函数：生成问题标签
 */
export function generateProblemTags(metrics: any, description?: string): string[] {
  const tags: string[] = [];

  if (metrics.collection < 80) {
    tags.push('收缴问题', '欠租');
  }
  if (metrics.operational < 60) {
    tags.push('业绩下滑', '营收低', '客流少');
  }
  if (metrics.customerReview < 70) {
    tags.push('口碑差', '服务问题', '投诉');
  }
  if (metrics.siteQuality < 70) {
    tags.push('陈列差', '环境问题');
  }

  if (description) {
    if (description.includes('租售比')) {
      tags.push('高租售比', '租金压力', '降租');
    }
    if (description.includes('营收') || description.includes('销售')) {
      tags.push('营收低', '业绩差');
    }
  }

  return [...new Set(tags)]; // 去重
}

/**
 * 辅助函数：推断商户业态
 */
export function inferMerchantCategory(merchantName: string): string {
  if (merchantName.includes('火锅')) return '餐饮-火锅';
  if (merchantName.includes('茶') || merchantName.includes('咖啡')) return '餐饮-饮品';
  if (merchantName.includes('餐')) return '餐饮-正餐';
  if (merchantName.includes('影城')) return '主力店-影城';
  if (merchantName.includes('超市')) return '主力店-超市';
  if (merchantName.includes('服饰') || merchantName.includes('装')) return '零售-服饰';
  if (merchantName.includes('珠宝') || merchantName.includes('金')) return '零售-珠宝';
  return '餐饮';
}
