/**
 * ROI 计算器 (ROI Calculator)
 *
 * 功能：
 * - 投入产出比计算
 * - 回本周期估算
 * - 年化收益预测
 * - 改善率计算
 *
 * 使用场景：
 * - 帮扶效果评估
 * - 营销活动ROI计算
 * - 任何投资回报分析
 */

export interface Metrics {
  collection: number;
  operational: number;
  siteQuality: number;
  customerReview: number;
  riskResistance: number;
}

export interface ROIInput {
  cost: number;  // 投入成本（元）
  beforeMetrics: Metrics;  // 帮扶前指标
  afterMetrics: Metrics;   // 帮扶后指标
  avgRevenue?: number;  // 平均月营收（元），默认 300000
  revenueImpactRate?: number;  // 健康度每提升1分对营收的影响率（%），默认 0.5
}

export interface ROIResult {
  roi: number;  // ROI百分比
  monthlyBenefit: number;  // 月度收益（元）
  annualBenefit: number;  // 年化收益（元）
  paybackMonths: number;  // 回本周期（月）
  improvementRate: number;  // 总体改善率（%）
  beforeScore: number;  // 帮扶前评分
  afterScore: number;  // 帮扶后评分
  dimensionImprovements: DimensionImprovement[];  // 各维度改善详情
}

export interface DimensionImprovement {
  dimension: string;
  before: number;
  after: number;
  change: number;
  changePercent: number;
  isPositive: boolean;
}

/**
 * 计算 ROI
 * @param input ROI 计算输入参数
 * @returns ROI 计算结果
 */
export function calculateROI(input: ROIInput): ROIResult {
  const {
    cost,
    beforeMetrics,
    afterMetrics,
    avgRevenue = 300000,
    revenueImpactRate = 0.5
  } = input;

  // 计算帮扶前后的平均分数
  const beforeScore = calculateAverageScore(beforeMetrics);
  const afterScore = calculateAverageScore(afterMetrics);

  // 计算总体改善率
  const improvementRate = beforeScore > 0
    ? ((afterScore - beforeScore) / beforeScore) * 100
    : 0;

  // 计算各维度改善详情
  const dimensionImprovements = calculateDimensionImprovements(beforeMetrics, afterMetrics);

  // 计算收益
  const scoreImprovement = afterScore - beforeScore;
  const revenueGrowthRate = scoreImprovement * revenueImpactRate; // 营收增长率（%）
  const monthlyBenefit = avgRevenue * (revenueGrowthRate / 100);
  const annualBenefit = monthlyBenefit * 12;

  // 计算 ROI
  const roi = cost > 0 ? ((annualBenefit - cost) / cost) * 100 : 0;

  // 计算回本周期
  const paybackMonths = monthlyBenefit > 0 ? cost / monthlyBenefit : Infinity;

  return {
    roi: Math.round(roi),
    monthlyBenefit: Math.round(monthlyBenefit),
    annualBenefit: Math.round(annualBenefit),
    paybackMonths: Math.round(paybackMonths * 10) / 10,
    improvementRate: Math.round(improvementRate * 10) / 10,
    beforeScore: Math.round(beforeScore),
    afterScore: Math.round(afterScore),
    dimensionImprovements
  };
}

/**
 * 计算平均分数
 */
function calculateAverageScore(metrics: Metrics): number {
  const { collection, operational, siteQuality, customerReview, riskResistance } = metrics;
  return (collection + operational + siteQuality + customerReview + riskResistance) / 5;
}

/**
 * 计算各维度改善详情
 */
function calculateDimensionImprovements(
  before: Metrics,
  after: Metrics
): DimensionImprovement[] {
  const dimensions = [
    { key: 'collection', label: '租金缴纳' },
    { key: 'operational', label: '经营表现' },
    { key: 'siteQuality', label: '现场品质' },
    { key: 'customerReview', label: '顾客满意度' },
    { key: 'riskResistance', label: '抗风险能力' }
  ];

  return dimensions.map(dim => {
    const beforeValue = before[dim.key as keyof Metrics];
    const afterValue = after[dim.key as keyof Metrics];
    const change = afterValue - beforeValue;
    const changePercent = beforeValue > 0 ? (change / beforeValue) * 100 : 0;

    return {
      dimension: dim.label,
      before: beforeValue,
      after: afterValue,
      change,
      changePercent: Math.round(changePercent * 10) / 10,
      isPositive: change > 0
    };
  });
}

/**
 * 生成 ROI 报告摘要
 */
export function generateROISummary(result: ROIResult): string {
  const {
    beforeScore,
    afterScore,
    improvementRate,
    annualBenefit,
    roi,
    paybackMonths
  } = result;

  if (improvementRate <= 0) {
    return `帮扶效果不明显，健康度从${beforeScore}分变为${afterScore}分，建议调整帮扶策略。`;
  }

  if (paybackMonths === Infinity) {
    return `帮扶效果有限，虽然健康度提升了${improvementRate.toFixed(1)}%，但预期收益较低，建议评估投入成本的合理性。`;
  }

  return `通过系统性帮扶，商户健康度从${beforeScore}分提升到${afterScore}分（+${improvementRate.toFixed(1)}%），预计年化收益${(annualBenefit / 10000).toFixed(1)}万元，投入产出比达到${roi}%，预计${paybackMonths.toFixed(1)}个月回本，帮扶效果显著。`;
}

/**
 * 模拟生成帮扶后指标（用于预测）
 */
export function simulateAfterMetrics(
  beforeMetrics: Metrics,
  improvementFactor: number = 1.2
): Metrics {
  return {
    collection: Math.min(100, Math.round(beforeMetrics.collection * improvementFactor)),
    operational: Math.min(100, Math.round(beforeMetrics.operational * improvementFactor)),
    siteQuality: Math.min(100, Math.round(beforeMetrics.siteQuality * improvementFactor)),
    customerReview: Math.min(100, Math.round(beforeMetrics.customerReview * improvementFactor)),
    riskResistance: Math.min(100, Math.round(beforeMetrics.riskResistance * improvementFactor))
  };
}
