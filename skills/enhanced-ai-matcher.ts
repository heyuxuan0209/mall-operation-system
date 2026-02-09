/**
 * AI智能推荐引擎 v3.0 - 语义相似度版 ⭐Iteration 2升级
 *
 * v3.0 核心改进：
 * - ⭐ LLM语义相似度评估：从标签匹配升级为深度语义理解
 * - ⭐ 根因筛选：基于根本原因而非表面标签
 * - ⭐ 多维度评分：根本原因、行业差异、方案可迁移性
 * - ⭐ 适应性建议：LLM生成案例调整建议
 * - ⭐ 降级策略：LLM不可用时降级到v2.2
 *
 * v2.2 功能（保留作为fallback）：
 * - 成功率权重：优先推荐成功案例
 * - 时效性权重：优先推荐近期案例
 * - 相似度计算：基于多维度特征的相似度
 * - 动态权重调整：根据历史反馈调整权重
 * - 多策略融合：结合多种推荐策略
 * - 缓存机制：避免重复计算（v2.1新增）
 * - 批量匹配：支持批量处理（v2.1新增）
 * - 用户反馈权重：基于AI助手用户反馈优化推荐（v2.2新增）
 */

import { feedbackCollector } from '@/utils/ai-assistant/feedbackCollector';
import { llmClient } from '@/utils/ai-assistant/llmClient';
import type { LLMMessage } from '@/types/ai-assistant';

/**
 * 获取案例的用户反馈权重
 */
function getFeedbackWeight(caseId: string): number {
  try {
    const weights = feedbackCollector.getCaseWeights();
    return weights[caseId] || 0;
  } catch (error) {
    return 0;
  }
}

/**
 * 缓存管理器
 */
class MatcherCache {
  private cache: Map<string, { result: EnhancedAIMatcherOutput; timestamp: number }> = new Map();
  private maxSize: number = 100;
  private ttl: number = 5 * 60 * 1000; // 5分钟过期

  /**
   * 生成缓存键
   */
  private generateKey(input: EnhancedAIMatcherInput): string {
    return JSON.stringify({
      category: input.merchantCategory,
      tags: input.problemTags.sort(),
      riskLevel: input.riskLevel
    });
  }

  /**
   * 获取缓存
   */
  get(input: EnhancedAIMatcherInput): EnhancedAIMatcherOutput | null {
    const key = this.generateKey(input);
    const cached = this.cache.get(key);

    if (!cached) return null;

    // 检查是否过期
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.result;
  }

  /**
   * 设置缓存
   */
  set(input: EnhancedAIMatcherInput, result: EnhancedAIMatcherOutput): void {
    const key = this.generateKey(input);

    // 如果缓存已满，删除最旧的条目
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, { result, timestamp: Date.now() });
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 获取缓存统计
   */
  getStats(): { size: number; maxSize: number; ttl: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      ttl: this.ttl
    };
  }
}

// 全局缓存实例
const matcherCache = new MatcherCache();

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
  riskLevel?: 'none' | 'low' | 'medium' | 'high' | 'critical'; // ⭐v3.0: 支持5级风险
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
  // ⭐v3.0 新增字段
  semanticSimilarity?: {
    rootCauseSimilarity: number;     // 根因相似度 0-100
    industrySimilarity: number;      // 行业相似度 0-100
    solutionTransferability: number; // 方案可迁移性 0-100
    overall: number;                 // 综合相似度 0-100
  };
  adaptationSuggestion?: string;     // 适应性调整建议
  llmEvaluation?: string;            // LLM完整评估
}

export interface EnhancedAIMatcherOutput {
  matchedCases: EnhancedMatchedCase[];
  topSuggestions: string[];
  insights: string[]; // AI洞察
  alternativeStrategies: string[]; // 备选策略
}

/**
 * 增强版智能匹配算法（带缓存）
 *
 * 算法改进：
 * 1. 多维度特征匹配（业态、问题、指标相似度）
 * 2. 成功率加权（优先推荐成功案例）
 * 3. 时效性加权（优先推荐近期案例）
 * 4. 动态权重调整（基于历史反馈）
 * 5. 置信度评估（评估推荐可靠性）
 * 6. 缓存机制（避免重复计算）
 */
export function enhancedMatchCases(input: EnhancedAIMatcherInput): EnhancedAIMatcherOutput {
  // 尝试从缓存获取结果
  const cachedResult = matcherCache.get(input);
  if (cachedResult) {
    return cachedResult;
  }

  // 执行匹配计算
  const result = performMatching(input);

  // 缓存结果
  matcherCache.set(input, result);

  return result;
}

/**
 * 执行实际的匹配计算
 */
function performMatching(input: EnhancedAIMatcherInput): EnhancedAIMatcherOutput {
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

    // 8. 用户反馈权重（新增，AI助手反馈优化）
    const feedbackBonus = getFeedbackWeight(c.id);
    score += feedbackBonus;
    if (Math.abs(feedbackBonus) > 10) {
      reasons.push(feedbackBonus > 0 ? '用户反馈良好' : '用户反馈一般');
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

/**
 * 批量匹配（v2.1新增）
 * @param inputs 批量输入
 * @returns 批量匹配结果
 */
export function batchMatchCases(
  inputs: EnhancedAIMatcherInput[]
): Map<string, EnhancedAIMatcherOutput> {
  const results = new Map<string, EnhancedAIMatcherOutput>();

  inputs.forEach(input => {
    const result = enhancedMatchCases(input);
    results.set(input.merchantName, result);
  });

  return results;
}

/**
 * 清空缓存（v2.1新增）
 */
export function clearMatcherCache(): void {
  matcherCache.clear();
}

/**
 * 获取缓存统计（v2.1新增）
 */
export function getMatcherCacheStats(): { size: number; maxSize: number; ttl: number } {
  return matcherCache.getStats();
}

// ============================================
// ⭐ v3.0 LLM语义相似度评估 (Iteration 2)
// ============================================

/**
 * v3.0 增强匹配（使用LLM语义评估）⭐推荐使用
 *
 * 改进点：
 * 1. 根因筛选：先用v2.2筛选候选案例
 * 2. LLM语义评估：深度分析根本原因相似度
 * 3. 多维度评分：根因、行业、方案可迁移性
 * 4. 适应性建议：如何调整案例以适应当前商户
 */
export async function enhancedMatchCasesV3(
  input: EnhancedAIMatcherInput
): Promise<EnhancedAIMatcherOutput> {
  // Step 1: 先使用v2.2算法筛选候选案例（Top 10）
  const v2Result = enhancedMatchCases(input);
  const candidates = v2Result.matchedCases.slice(0, 10);

  // Step 2: 如果LLM不可用，直接返回v2.2结果
  if (!llmClient || candidates.length === 0) {
    console.warn('[MatcherV3] LLM not available or no candidates, falling back to v2.2');
    return v2Result;
  }

  try {
    // Step 3: LLM语义相似度评估（批量评估Top 10案例）
    const enhancedCases = await evaluateCasesWithLLM(input, candidates);

    // Step 4: 重新排序（基于语义相似度）
    enhancedCases.sort((a, b) => {
      const scoreA = a.semanticSimilarity?.overall || a.matchScore;
      const scoreB = b.semanticSimilarity?.overall || b.matchScore;
      return scoreB - scoreA;
    });

    // Step 5: 更新推荐排名
    enhancedCases.forEach((c, idx) => {
      c.recommendationRank = idx + 1;
    });

    return {
      ...v2Result,
      matchedCases: enhancedCases.slice(0, 5), // 返回Top 5
      insights: [
        ...v2Result.insights,
        '✨ 已使用LLM语义相似度评估',
        '📊 考虑了根本原因、行业差异和方案可迁移性',
      ],
    };
  } catch (error) {
    console.error('[MatcherV3] LLM evaluation failed, falling back to v2.2:', error);
    return v2Result;
  }
}

/**
 * 使用LLM评估案例相似度
 */
async function evaluateCasesWithLLM(
  input: EnhancedAIMatcherInput,
  candidates: EnhancedMatchedCase[]
): Promise<EnhancedMatchedCase[]> {
  // 批量评估（每次最多评估5个案例，避免token超限）
  const batchSize = 5;
  const results: EnhancedMatchedCase[] = [];

  for (let i = 0; i < candidates.length; i += batchSize) {
    const batch = candidates.slice(i, i + batchSize);
    const batchResults = await evaluateBatch(input, batch);
    results.push(...batchResults);
  }

  return results;
}

/**
 * 批量评估案例
 */
async function evaluateBatch(
  input: EnhancedAIMatcherInput,
  batch: EnhancedMatchedCase[]
): Promise<EnhancedMatchedCase[]> {
  const prompt = `
# 任务
作为商户运营专家，评估以下帮扶案例与当前商户问题的语义相似度。

# 当前商户问题
- 商户名称：${input.merchantName}
- 业态：${input.merchantCategory}
- 风险等级：${input.riskLevel || 'N/A'}
- 问题标签：${input.problemTags.join('、')}
- 症状描述：${input.symptoms || input.description || '无'}

# 待评估案例
${batch.map((c, idx) => `
## 案例${idx + 1}：${c.case.merchantName || '某商户'}
- 案例ID：${c.case.id}
- 业态：${c.case.industry}
- 问题标签：${c.case.tags.join('、')}
- 症状：${c.case.symptoms}
- 诊断：${c.case.diagnosis}
- 策略：${c.case.strategy}
- 措施：${c.case.action}
- 结果：${c.case.result || '无'}
`).join('\n')}

# 评估要求

## 1. 多维度相似度评分（0-100分）
- **根因相似度**：问题的根本原因是否相似？（关键维度）
  - 100分：根本原因完全一致
  - 70-90分：根本原因相似，但程度不同
  - 40-60分：根本原因有关联
  - 0-30分：根本原因不同

- **行业相似度**：业态和场景是否相似？
  - 100分：完全相同业态
  - 70-90分：同大类但不同细分
  - 40-60分：不同大类但有共性
  - 0-30分：行业差异大

- **方案可迁移性**：解决方案能否迁移？
  - 100分：可以直接应用
  - 70-90分：稍作调整即可应用
  - 40-60分：需要较大调整
  - 0-30分：难以迁移

## 2. 适应性建议
针对每个案例，说明如何调整以适应当前商户：
- 哪些措施可以直接应用？
- 哪些需要调整？如何调整？
- 有哪些注意事项？

# 输出格式（严格JSON）
\`\`\`json
{
  "evaluations": [
    {
      "caseId": "CASE_XXX",
      "rootCauseSimilarity": 85,
      "industrySimilarity": 90,
      "solutionTransferability": 75,
      "overall": 83,
      "adaptationSuggestion": "该案例的XXX策略可以直接应用，但需要注意...",
      "reasoning": "简短评估理由（1-2句话）"
    }
  ]
}
\`\`\`

# 关键约束
1. 只返回JSON，不要有其他文字
2. overall = (rootCauseSimilarity * 0.5 + industrySimilarity * 0.2 + solutionTransferability * 0.3)
3. 根因相似度权重最高（50%），这是最关键的维度
4. 适应性建议要具体、可操作

现在请评估：
`.trim();

  const messages: LLMMessage[] = [
    {
      role: 'system',
      content: '你是资深商户运营专家，擅长案例分析和方案迁移。你的评估必须客观、准确，基于根本原因而非表面现象。',
    },
    {
      role: 'user',
      content: prompt,
    },
  ];

  const response = await llmClient!.chat(messages, { useCache: false });

  // 解析JSON响应
  const jsonMatch = response.content.match(/```json\n([\s\S]*?)\n```/) ||
                    response.content.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error('Failed to parse LLM response as JSON');
  }

  const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
  const evaluations = parsed.evaluations || [];

  // 合并评估结果到原案例
  return batch.map((c) => {
    const evaluation = evaluations.find((e: any) => e.caseId === c.case.id);
    if (!evaluation) {
      return c; // 未评估，保持原样
    }

    return {
      ...c,
      semanticSimilarity: {
        rootCauseSimilarity: evaluation.rootCauseSimilarity,
        industrySimilarity: evaluation.industrySimilarity,
        solutionTransferability: evaluation.solutionTransferability,
        overall: evaluation.overall,
      },
      adaptationSuggestion: evaluation.adaptationSuggestion,
      llmEvaluation: evaluation.reasoning,
      matchReasons: [
        ...c.matchReasons,
        `✨ LLM评估：${evaluation.reasoning}`,
      ],
    };
  });
}
