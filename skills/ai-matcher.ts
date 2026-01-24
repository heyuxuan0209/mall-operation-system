/**
 * AI智能匹配引擎
 *
 * 功能：基于商户特征和问题标签，智能匹配知识库案例
 * 复用场景：
 * - 任务中心的AI推荐措施
 * - 知识库的相似案例推送
 * - 预测性分析的建议生成
 */

export interface AIMatcherInput {
  merchantName: string;
  merchantCategory: string;
  problemTags: string[];
  symptoms?: string;
  description?: string;
  knowledgeBase: any[];
}

export interface MatchedCase {
  case: any;
  matchScore: number;
  matchReasons: string[];
}

export interface AIMatcherOutput {
  matchedCases: MatchedCase[];
  topSuggestions: string[];
}

/**
 * 智能匹配算法
 *
 * 算法逻辑：
 * 1. 业态匹配（权重40%）- 完全匹配40分，大类匹配25分
 * 2. 问题标签匹配（权重60%）- 每个匹配标签15分
 * 3. 症状关键词匹配（额外加分）- 每个匹配关键词5分
 */
export function matchCases(input: AIMatcherInput): AIMatcherOutput {
  const { merchantName, merchantCategory, problemTags, symptoms, description, knowledgeBase } = input;

  // 分析商户业态
  const categoryParts = merchantCategory.split('-');
  const mainCategory = categoryParts[0]; // 如："餐饮"

  // 智能匹配知识库案例
  const scoredCases = knowledgeBase.map((c: any) => {
    let score = 0;
    const reasons: string[] = [];

    // 1. 业态匹配（权重40%）
    const caseCategoryParts = c.industry.split('-');
    const caseMainCategory = caseCategoryParts[0];

    if (c.industry === merchantCategory) {
      score += 40;
      reasons.push(`完全匹配业态：${merchantCategory}`);
    } else if (caseMainCategory === mainCategory) {
      score += 25;
      reasons.push(`匹配大类：${mainCategory}`);
    }

    // 2. 问题标签匹配（权重60%）
    const matchedTags = c.tags.filter((tag: string) =>
      problemTags.some(pt => pt.includes(tag) || tag.includes(pt))
    );

    if (matchedTags.length > 0) {
      const tagScore = matchedTags.length * 15;
      score += tagScore;
      reasons.push(`匹配问题标签：${matchedTags.join('、')}`);
    }

    // 3. 症状关键词匹配（额外加分）
    if (symptoms || description) {
      const text = (symptoms || '') + ' ' + (description || '');
      problemTags.forEach(pt => {
        if (c.symptoms.includes(pt) || c.diagnosis.includes(pt)) {
          score += 5;
          if (!reasons.some(r => r.includes('症状匹配'))) {
            reasons.push('症状描述匹配');
          }
        }
      });
    }

    return {
      case: c,
      matchScore: score,
      matchReasons: reasons
    };
  });

  // 按匹配度排序，取前3个
  const topCases = scoredCases
    .filter(c => c.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3);

  // 提取推荐措施
  const suggestions = topCases.map((c: any) => c.case.action);

  return {
    matchedCases: topCases,
    topSuggestions: suggestions
  };
}

/**
 * 生成问题标签
 *
 * 根据商户指标自动识别问题类型
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

  // 从描述中提取关键词
  if (description) {
    if (description.includes('租售比')) {
      tags.push('高租售比', '租金压力', '降租');
    }
    if (description.includes('营收') || description.includes('销售')) {
      tags.push('营收低', '业绩差');
    }
  }

  return tags;
}

/**
 * 推断商户业态
 *
 * 根据商户名称智能推断业态分类
 */
export function inferMerchantCategory(merchantName: string): string {
  if (merchantName.includes('火锅')) return '餐饮-火锅';
  if (merchantName.includes('茶') || merchantName.includes('咖啡')) return '餐饮-饮品';
  if (merchantName.includes('餐')) return '餐饮-正餐';
  if (merchantName.includes('影城')) return '主力店-影城';
  if (merchantName.includes('超市')) return '主力店-超市';
  if (merchantName.includes('服饰') || merchantName.includes('装')) return '零售-服饰';
  if (merchantName.includes('珠宝') || merchantName.includes('金')) return '零售-珠宝';
  return '餐饮'; // 默认
}
