/**
 * 智能拍照分类建议引擎
 *
 * 功能：
 * - 基于上下文的启发式规则引擎
 * - 根据时间、商户画像、业态特点自动建议分类
 * - 提供置信度和理由说明
 *
 * 使用示例：
 * ```typescript
 * const suggestion = suggestPhotoClassification({
 *   merchantContext: { category: '餐饮-火锅', weakestDimension: '现场品质', riskLevel: 'high' },
 *   checklistType: 'routine',
 *   timeOfDay: new Date(),
 *   recentPhotos: []
 * });
 * // suggestion = { category: 'place', confidence: 0.85, tags: [{ tag: '卫生问题', score: 0.9 }], ... }
 * ```
 */

import type { Merchant, PhotoAttachment } from '@/types';

// ==================== 类型定义 ====================

/** 照片分类 */
export type PhotoCategory = 'people' | 'merchandise' | 'place';

/** 问题等级 */
export type IssueLevel = 'good' | 'normal' | 'warning' | 'critical';

/** 分类建议结果 */
export interface PhotoClassificationSuggestion {
  category: PhotoCategory;
  confidence: number;                              // 置信度 0-1
  tags: Array<{ tag: string; score: number }>;     // 推荐标签 + 评分
  issueLevel: IssueLevel;
  reasoning: string;                               // 建议理由
}

/** 商户上下文信息 */
export interface MerchantContext {
  category: string;          // 业态 (如: '餐饮-火锅')
  weakestDimension: string;  // 最薄弱维度
  riskLevel: string;         // 风险等级
  totalScore?: number;       // 健康度评分 (可选)
}

/** 分类输入参数 */
export interface ClassificationInput {
  merchantContext: MerchantContext;
  checklistType: 'opening' | 'closing' | 'routine';
  timeOfDay: Date;
  recentPhotos?: PhotoAttachment[];  // 最近拍的照片（可选）
}

// ==================== 分类标签库 ====================

/** 分类标签定义 */
const CATEGORY_TAGS = {
  people: {
    positive: ['着装规范', '服务态度', '培训现场', '团队合作'],
    negative: ['着装问题', '服务问题'],
  },
  merchandise: {
    positive: ['陈列整齐', '商品丰富', '标价清晰'],
    negative: ['陈列混乱', '断货', '库存积压'],
  },
  place: {
    positive: ['环境整洁', '灯光明亮', '装修良好'],
    negative: ['卫生问题', '设施损坏', '安全隐患'],
  },
};

/** 业态关键词映射 */
const INDUSTRY_KEYWORDS = {
  餐饮: ['餐饮', '火锅', '正餐', '饮品', '咖啡', '茶饮', '快餐'],
  零售: ['零售', '服饰', '珠宝', '美妆', '数码', '家居'],
  主力店: ['主力店', '影城', '超市', '百货', 'KTV'],
};

/** 维度与分类映射 */
const DIMENSION_TO_CATEGORY: Record<string, PhotoCategory> = {
  '员工状态': 'people',
  '店长管理能力': 'people',
  '货品陈列': 'merchandise',
  '商品': 'merchandise',
  '卖场环境': 'place',
  '店铺现场品质': 'place',
  '现场品质': 'place',
  '安全合规': 'place',
};

// ==================== 核心算法 ====================

/**
 * 智能建议照片分类
 *
 * @param input 分类输入参数
 * @returns 分类建议结果
 */
export function suggestPhotoClassification(
  input: ClassificationInput
): PhotoClassificationSuggestion {
  const { merchantContext, checklistType, timeOfDay, recentPhotos = [] } = input;

  // 1. 初始化评分系统
  const scores = {
    people: 0,
    merchandise: 0,
    place: 0,
  };

  let reasoning = '';

  // 2. 基于检查时间的规则
  const hour = timeOfDay.getHours();
  const minute = timeOfDay.getMinutes();
  const timeScore = calculateTimeBasedScore(hour, minute, checklistType);

  scores.people += timeScore.people;
  scores.merchandise += timeScore.merchandise;
  scores.place += timeScore.place;

  if (timeScore.reasoning) {
    reasoning += timeScore.reasoning + '；';
  }

  // 3. 基于商户画像的规则
  const contextScore = calculateContextBasedScore(merchantContext);

  scores.people += contextScore.people;
  scores.merchandise += contextScore.merchandise;
  scores.place += contextScore.place;

  if (contextScore.reasoning) {
    reasoning += contextScore.reasoning + '；';
  }

  // 4. 基于业态特点的规则
  const industryScore = calculateIndustryBasedScore(merchantContext.category);

  scores.people += industryScore.people;
  scores.merchandise += industryScore.merchandise;
  scores.place += industryScore.place;

  if (industryScore.reasoning) {
    reasoning += industryScore.reasoning + '；';
  }

  // 5. 基于最近照片的平衡规则
  if (recentPhotos.length > 0) {
    const balanceScore = calculateBalanceScore(recentPhotos);

    scores.people += balanceScore.people;
    scores.merchandise += balanceScore.merchandise;
    scores.place += balanceScore.place;

    if (balanceScore.reasoning) {
      reasoning += balanceScore.reasoning + '；';
    }
  }

  // 6. 确定最佳分类
  const bestCategory = Object.keys(scores).reduce((a, b) =>
    scores[a as PhotoCategory] > scores[b as PhotoCategory] ? a : b
  ) as PhotoCategory;

  const totalScore = scores.people + scores.merchandise + scores.place;
  const confidence = totalScore > 0 ? scores[bestCategory] / totalScore : 0.5;

  // 7. 推荐标签
  const tags = recommendTags(bestCategory, merchantContext, checklistType);

  // 8. 确定问题等级
  const issueLevel = determineIssueLevel(merchantContext);

  // 9. 生成理由（去除末尾分号）
  reasoning = reasoning.replace(/；$/, '');

  return {
    category: bestCategory,
    confidence: Math.min(confidence, 1),
    tags,
    issueLevel,
    reasoning: reasoning || '基于综合判断建议此分类',
  };
}

// ==================== 辅助函数 ====================

/**
 * 基于时间的评分
 */
function calculateTimeBasedScore(
  hour: number,
  minute: number,
  checklistType: 'opening' | 'closing' | 'routine'
): {
  people: number;
  merchandise: number;
  place: number;
  reasoning: string;
} {
  const scores = { people: 0, merchandise: 0, place: 0 };
  let reasoning = '';

  // 开店检查 (9:50之前)
  if (checklistType === 'opening' || (hour < 10 && minute < 50)) {
    scores.people = 40;  // 重点关注员工到岗和着装
    scores.place = 30;   // 环境整洁度
    scores.merchandise = 20;  // 商品准备
    reasoning = '开店检查重点关注员工状态和环境准备';
  }
  // 闭店检查 (21:00之后)
  else if (checklistType === 'closing' || hour >= 21) {
    scores.place = 40;        // 重点关注卫生清洁
    scores.merchandise = 30;  // 盘点库存
    scores.people = 20;       // 员工收尾
    reasoning = '闭店检查重点关注环境清洁和库存盘点';
  }
  // 常规巡检
  else {
    scores.place = 30;
    scores.merchandise = 30;
    scores.people = 25;
    reasoning = '常规巡检均衡关注各方面';
  }

  return { ...scores, reasoning };
}

/**
 * 基于商户上下文的评分
 */
function calculateContextBasedScore(context: MerchantContext): {
  people: number;
  merchandise: number;
  place: number;
  reasoning: string;
} {
  const scores = { people: 0, merchandise: 0, place: 0 };
  let reasoning = '';

  // 根据最薄弱维度推荐
  if (context.weakestDimension) {
    const category = DIMENSION_TO_CATEGORY[context.weakestDimension];

    if (category) {
      scores[category] += 50;
      reasoning = `当前商户"${context.weakestDimension}"较薄弱，建议重点关注`;
    }
  }

  // 根据风险等级调整
  if (context.riskLevel === 'critical' || context.riskLevel === 'high') {
    // 高风险商户更关注现场和经营
    scores.place += 20;
    scores.merchandise += 20;
    reasoning += (reasoning ? '，' : '') + '高风险商户需加强现场监控';
  }

  // 根据健康度评分调整
  if (context.totalScore !== undefined) {
    if (context.totalScore < 60) {
      // 低分商户，全面检查
      scores.place += 15;
      scores.merchandise += 15;
      scores.people += 10;
      reasoning += (reasoning ? '，' : '') + '健康度较低，需全面排查问题';
    }
  }

  return { ...scores, reasoning };
}

/**
 * 基于业态特点的评分
 */
function calculateIndustryBasedScore(category: string): {
  people: number;
  merchandise: number;
  place: number;
  reasoning: string;
} {
  const scores = { people: 0, merchandise: 0, place: 0 };
  let reasoning = '';

  // 判断业态大类
  let industryType = '';
  for (const [type, keywords] of Object.entries(INDUSTRY_KEYWORDS)) {
    if (keywords.some((kw) => category.includes(kw))) {
      industryType = type;
      break;
    }
  }

  switch (industryType) {
    case '餐饮':
      scores.place = 30;        // 餐饮重点关注卫生
      scores.people = 20;       // 服务态度
      scores.merchandise = 10;  // 菜品陈列
      reasoning = '餐饮业态重点关注卫生环境和服务';
      break;

    case '零售':
      scores.merchandise = 35;  // 零售重点关注陈列
      scores.place = 20;        // 店面环境
      scores.people = 10;       // 导购服务
      reasoning = '零售业态重点关注商品陈列和环境';
      break;

    case '主力店':
      scores.place = 30;
      scores.people = 25;
      scores.merchandise = 15;
      reasoning = '主力店重点关注整体环境和人员管理';
      break;

    default:
      // 未知业态，平均分配
      scores.place = 20;
      scores.merchandise = 20;
      scores.people = 15;
      break;
  }

  return { ...scores, reasoning };
}

/**
 * 基于最近照片的平衡评分
 * 如果某个分类拍得太多，降低其权重，鼓励多样性
 */
function calculateBalanceScore(recentPhotos: PhotoAttachment[]): {
  people: number;
  merchandise: number;
  place: number;
  reasoning: string;
} {
  const scores = { people: 0, merchandise: 0, place: 0 };
  let reasoning = '';

  // 统计最近照片的分类分布
  const categoryCount = {
    people: 0,
    merchandise: 0,
    place: 0,
  };

  recentPhotos.forEach((photo) => {
    if (photo.category) {
      categoryCount[photo.category]++;
    }
  });

  // 找出拍得最少的分类，给予加分
  const minCount = Math.min(...Object.values(categoryCount));
  const minCategories = Object.keys(categoryCount).filter(
    (cat) => categoryCount[cat as PhotoCategory] === minCount
  ) as PhotoCategory[];

  if (minCategories.length > 0 && recentPhotos.length >= 3) {
    minCategories.forEach((cat) => {
      scores[cat] += 15;
    });
    reasoning = '建议补充拍摄覆盖较少的分类';
  }

  return { ...scores, reasoning };
}

/**
 * 推荐标签
 */
function recommendTags(
  category: PhotoCategory,
  context: MerchantContext,
  checklistType: 'opening' | 'closing' | 'routine'
): Array<{ tag: string; score: number }> {
  const tags = CATEGORY_TAGS[category];
  const recommendations: Array<{ tag: string; score: number }> = [];

  // 根据风险等级决定推荐正面还是负面标签
  const isHighRisk = context.riskLevel === 'critical' || context.riskLevel === 'high';
  const isMediumRisk = context.riskLevel === 'medium';

  if (isHighRisk) {
    // 高风险：优先推荐负面标签（找问题）
    tags.negative.forEach((tag, index) => {
      recommendations.push({
        tag,
        score: 0.9 - index * 0.1,
      });
    });

    tags.positive.forEach((tag, index) => {
      recommendations.push({
        tag,
        score: 0.5 - index * 0.05,
      });
    });
  } else if (isMediumRisk) {
    // 中风险：均衡推荐
    const allTags = [...tags.negative, ...tags.positive];
    allTags.forEach((tag, index) => {
      recommendations.push({
        tag,
        score: 0.7 - index * 0.05,
      });
    });
  } else {
    // 低风险：优先推荐正面标签（确认良好）
    tags.positive.forEach((tag, index) => {
      recommendations.push({
        tag,
        score: 0.8 - index * 0.1,
      });
    });

    tags.negative.forEach((tag, index) => {
      recommendations.push({
        tag,
        score: 0.4 - index * 0.05,
      });
    });
  }

  // 按评分降序排序，返回前3个
  return recommendations.sort((a, b) => b.score - a.score).slice(0, 3);
}

/**
 * 确定问题等级
 */
function determineIssueLevel(context: MerchantContext): IssueLevel {
  const { riskLevel, totalScore } = context;

  // 基于风险等级
  if (riskLevel === 'critical') {
    return 'critical';
  } else if (riskLevel === 'high') {
    return 'warning';
  } else if (riskLevel === 'medium') {
    return 'warning';
  }

  // 基于健康度评分
  if (totalScore !== undefined) {
    if (totalScore < 40) {
      return 'critical';
    } else if (totalScore < 60) {
      return 'warning';
    } else if (totalScore < 80) {
      return 'normal';
    } else {
      return 'good';
    }
  }

  // 默认
  return 'normal';
}

// ==================== 工具函数 ====================

/**
 * 获取检查类型（基于时间）
 */
export function getChecklistType(time: Date = new Date()): 'opening' | 'closing' | 'routine' {
  const hour = time.getHours();
  const minute = time.getMinutes();

  if (hour < 10 && minute < 50) {
    return 'opening';
  } else if (hour >= 21) {
    return 'closing';
  } else {
    return 'routine';
  }
}

/**
 * 格式化置信度百分比
 */
export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}
