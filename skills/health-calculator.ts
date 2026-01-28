/**
 * 健康度计算器（Health Calculator）
 *
 * 功能：根据多维度指标计算商户健康度评分和风险等级
 *
 * 复用场景：
 * - 健康度页面的评分计算
 * - 任务评估阶段的前后对比
 * - 风险预警的触发条件
 * - 巡检记录的健康度更新
 *
 * ## v2.0 风险等级5等级标准
 *
 * | 风险等级 | 分数范围 | 颜色 | 业务含义 |
 * |---------|---------|------|---------|
 * | critical（极高风险）| 0-39分 | 🟣 紫色 | 货空人去，随时跑路，需备商 |
 * | high（高风险）| 40-59分 | 🔴 红色 | 连续预警，失联，需帮扶 |
 * | medium（中风险）| 60-79分 | 🟠 橙色 | 严重预警，但有经营意愿 |
 * | low（低风险）| 80-89分 | 🟡 黄色 | 缴费波动，经营尚可 |
 * | none（无风险）| 90-100分 | 🟢 绿色 | 指标正常，缴费准时 |
 *
 * @version 2.0
 * @updated 2026-01-28 - 统一为5等级标准
 */

export interface HealthMetrics {
  collection: number;        // 收缴健康度 (0-100)
  operational: number;       // 经营健康度 (0-100)
  siteQuality: number;       // 现场品质 (0-100)
  customerReview: number;    // 顾客评价 (0-100)
  riskResistance: number;    // 抗风险能力 (0-100)
}

export type RiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'none';

export interface HealthCalculatorOutput {
  totalScore: number;
  riskLevel: RiskLevel;
  weakestDimension: {
    name: string;
    score: number;
    label: string;
  };
  recommendations: string[];
  dimensionScores: {
    name: string;
    score: number;
    status: 'excellent' | 'good' | 'warning' | 'critical';
  }[];
}

/**
 * 计算总体健康度评分
 *
 * Phase 1优化：使用加权平均，提升现场品质权重至30%
 * 权重分配：
 * - collection: 25%
 * - operational: 25%
 * - siteQuality: 30% (提升)
 * - customerReview: 10%
 * - riskResistance: 10%
 */
export function calculateTotalScore(metrics: HealthMetrics): number {
  const { collection, operational, siteQuality, customerReview, riskResistance } = metrics;
  const weightedScore =
    collection * 0.25 +
    operational * 0.25 +
    siteQuality * 0.30 +
    customerReview * 0.10 +
    riskResistance * 0.10;
  return Math.round(weightedScore);
}

/**
 * Phase 3: 从巡检评分计算现场品质得分
 *
 * 根据5个新维度计算现场品质：
 * - 员工状态: 20%
 * - 货品陈列: 25%
 * - 卖场环境: 25%
 * - 店长管理能力: 15%
 * - 安全合规: 15%
 */
export interface InspectionRating {
  staffCondition: number;        // 员工状态 (0-100)
  merchandiseDisplay: number;    // 货品陈列 (0-100)
  storeEnvironment: number;      // 卖场环境 (0-100)
  managementCapability: number;  // 店长管理能力 (0-100)
  safetyCompliance: number;      // 安全合规 (0-100)
}

export function calculateSiteQualityFromInspection(rating: InspectionRating): number {
  const weightedScore =
    rating.staffCondition * 0.20 +
    rating.merchandiseDisplay * 0.25 +
    rating.storeEnvironment * 0.25 +
    rating.managementCapability * 0.15 +
    rating.safetyCompliance * 0.15;
  return Math.round(weightedScore);
}

/**
 * 判断风险等级
 *
 * 规则（5等级标准）：
 * - 总分 >= 90: 无风险
 * - 总分 80-89: 低风险
 * - 总分 60-79: 中风险
 * - 总分 40-59: 高风险
 * - 总分 0-39: 极高风险
 */
export function calculateRiskLevel(totalScore: number): RiskLevel {
  if (totalScore >= 90) return 'none';      // 无风险：90-100分
  if (totalScore >= 80) return 'low';       // 低风险：80-89分
  if (totalScore >= 60) return 'medium';    // 中风险：60-79分
  if (totalScore >= 40) return 'high';      // 高风险：40-59分
  return 'critical';                        // 极高风险：0-39分
}

/**
 * 识别最薄弱维度
 */
export function findWeakestDimension(metrics: HealthMetrics): {
  name: string;
  score: number;
  label: string;
} {
  const dimensions = [
    { name: 'collection', score: metrics.collection, label: '收缴健康度' },
    { name: 'operational', score: metrics.operational, label: '经营健康度' },
    { name: 'siteQuality', score: metrics.siteQuality, label: '现场品质' },
    { name: 'customerReview', score: metrics.customerReview, label: '顾客评价' },
    { name: 'riskResistance', score: metrics.riskResistance, label: '抗风险能力' }
  ];

  return dimensions.reduce((min, current) =>
    current.score < min.score ? current : min
  );
}

/**
 * 生成改善建议
 */
export function generateRecommendations(metrics: HealthMetrics): string[] {
  const recommendations: string[] = [];

  if (metrics.collection < 80) {
    recommendations.push('加强租金催收，建立分期还款计划');
  }
  if (metrics.operational < 70) {
    recommendations.push('开展营销活动提升客流和营收');
  }
  if (metrics.siteQuality < 70) {
    recommendations.push('改善店面陈列和环境卫生');
  }
  if (metrics.customerReview < 70) {
    recommendations.push('提升服务质量，建立顾客反馈机制');
  }
  if (metrics.riskResistance < 70) {
    recommendations.push('优化成本结构，增强抗风险能力');
  }

  return recommendations;
}

/**
 * 获取维度状态
 */
function getDimensionStatus(score: number): 'excellent' | 'good' | 'warning' | 'critical' {
  if (score >= 85) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 60) return 'warning';
  return 'critical';
}

/**
 * 完整健康度分析
 */
export function analyzeHealth(metrics: HealthMetrics): HealthCalculatorOutput {
  const totalScore = calculateTotalScore(metrics);
  const riskLevel = calculateRiskLevel(totalScore);
  const weakestDimension = findWeakestDimension(metrics);
  const recommendations = generateRecommendations(metrics);

  const dimensionScores = [
    { name: '收缴健康度', score: metrics.collection, status: getDimensionStatus(metrics.collection) },
    { name: '经营健康度', score: metrics.operational, status: getDimensionStatus(metrics.operational) },
    { name: '现场品质', score: metrics.siteQuality, status: getDimensionStatus(metrics.siteQuality) },
    { name: '顾客评价', score: metrics.customerReview, status: getDimensionStatus(metrics.customerReview) },
    { name: '抗风险能力', score: metrics.riskResistance, status: getDimensionStatus(metrics.riskResistance) }
  ];

  return {
    totalScore,
    riskLevel,
    weakestDimension,
    recommendations,
    dimensionScores
  };
}

/**
 * 计算改善幅度
 */
export function calculateImprovement(before: HealthMetrics, after: HealthMetrics): {
  totalImprovement: number;
  dimensionImprovements: { name: string; improvement: number }[];
  overallTrend: 'improving' | 'declining' | 'stable';
} {
  const beforeTotal = calculateTotalScore(before);
  const afterTotal = calculateTotalScore(after);
  const totalImprovement = afterTotal - beforeTotal;

  const dimensionImprovements = [
    { name: '收缴健康度', improvement: after.collection - before.collection },
    { name: '经营健康度', improvement: after.operational - before.operational },
    { name: '现场品质', improvement: after.siteQuality - before.siteQuality },
    { name: '顾客评价', improvement: after.customerReview - before.customerReview },
    { name: '抗风险能力', improvement: after.riskResistance - before.riskResistance }
  ];

  let overallTrend: 'improving' | 'declining' | 'stable';
  if (totalImprovement > 5) {
    overallTrend = 'improving';
  } else if (totalImprovement < -5) {
    overallTrend = 'declining';
  } else {
    overallTrend = 'stable';
  }

  return {
    totalImprovement,
    dimensionImprovements,
    overallTrend
  };
}
