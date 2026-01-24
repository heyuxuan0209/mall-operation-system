/**
 * 健康度计算器
 *
 * 功能：根据多维度指标计算商户健康度评分
 * 复用场景：
 * - 健康度页面的评分计算
 * - 任务评估阶段的前后对比
 * - 风险预警的触发条件
 */

export interface HealthMetrics {
  collection: number;        // 收缴健康度 (0-100)
  operational: number;       // 经营健康度 (0-100)
  siteQuality: number;       // 现场品质 (0-100)
  customerReview: number;    // 顾客评价 (0-100)
  riskResistance: number;    // 抗风险能力 (0-100)
}

export type RiskLevel = 'high' | 'medium' | 'low' | 'none';

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
 * 算法：五个维度的平均值
 */
export function calculateTotalScore(metrics: HealthMetrics): number {
  const { collection, operational, siteQuality, customerReview, riskResistance } = metrics;
  const total = collection + operational + siteQuality + customerReview + riskResistance;
  return Math.round(total / 5);
}

/**
 * 判断风险等级
 *
 * 规则：
 * - 总分 < 60: 高风险
 * - 总分 60-75: 中风险
 * - 总分 75-85: 低风险
 * - 总分 >= 85: 无风险
 */
export function calculateRiskLevel(totalScore: number): RiskLevel {
  if (totalScore < 60) return 'high';
  if (totalScore < 75) return 'medium';
  if (totalScore < 85) return 'low';
  return 'none';
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
