/**
 * 风险评估引擎 (Risk Assessment Engine)
 *
 * 功能：
 * - 根据商户指标计算风险等级
 * - 识别风险类型（租金逾期、营收下滑等）
 * - 生成风险预警
 * - 计算风险评分
 *
 * 使用场景：
 * - 商户风险评估
 * - 自动生成风险预警
 * - 风险排序和优先级判断
 */

export interface Merchant {
  id: string;
  name: string;
  category: string;
  totalScore: number;
  lastMonthRevenue: number;
  rentToSalesRatio: number;
  metrics: {
    collection: number;
    operational: number;
    siteQuality: number;
    customerReview: number;
    riskResistance: number;
  };
}

export interface RiskThresholds {
  // 健康度阈值
  healthScore?: {
    high: number;  // 高风险阈值，默认 60
    medium: number;  // 中风险阈值，默认 70
  };
  // 租售比阈值
  rentToSalesRatio?: {
    high: number;  // 高风险阈值，默认 0.25
    medium: number;  // 中风险阈值，默认 0.20
  };
  // 租金缴纳阈值
  collection?: {
    high: number;  // 高风险阈值，默认 70
    medium: number;  // 中风险阈值，默认 80
  };
  // 经营表现阈值
  operational?: {
    high: number;  // 高风险阈值，默认 60
    medium: number;  // 中风险阈值，默认 70
  };
  // 顾客满意度阈值
  customerReview?: {
    high: number;  // 高风险阈值，默认 60
    medium: number;  // 中风险阈值，默认 70
  };
}

export interface RiskAlert {
  id: string;
  merchantId: string;
  merchantName: string;
  riskType: 'rent_overdue' | 'low_revenue' | 'high_rent_ratio' | 'customer_complaint' | 'low_health_score';
  severity: 'high' | 'medium' | 'low';
  message: string;
  createdAt: string;
  resolved: boolean;
}

export interface RiskAssessmentResult {
  riskLevel: 'high' | 'medium' | 'low';
  riskTypes: string[];
  alerts: RiskAlert[];
  score: number;  // 风险评分 (0-100，越高风险越大)
  summary: string;
}

/**
 * 评估商户风险
 * @param merchant 商户信息
 * @param thresholds 风险阈值配置
 * @returns 风险评估结果
 */
export function assessRisk(
  merchant: Merchant,
  thresholds?: RiskThresholds
): RiskAssessmentResult {
  // 默认阈值
  const defaultThresholds: Required<RiskThresholds> = {
    healthScore: { high: 60, medium: 70 },
    rentToSalesRatio: { high: 0.25, medium: 0.20 },
    collection: { high: 70, medium: 80 },
    operational: { high: 60, medium: 70 },
    customerReview: { high: 60, medium: 70 }
  };

  const config = {
    healthScore: { ...defaultThresholds.healthScore, ...thresholds?.healthScore },
    rentToSalesRatio: { ...defaultThresholds.rentToSalesRatio, ...thresholds?.rentToSalesRatio },
    collection: { ...defaultThresholds.collection, ...thresholds?.collection },
    operational: { ...defaultThresholds.operational, ...thresholds?.operational },
    customerReview: { ...defaultThresholds.customerReview, ...thresholds?.customerReview }
  };

  const alerts: RiskAlert[] = [];
  const riskTypes: string[] = [];
  let riskScore = 0;

  // 1. 检查健康度评分
  if (merchant.totalScore < config.healthScore.high) {
    riskTypes.push('low_health_score');
    riskScore += 30;
    alerts.push({
      id: `${merchant.id}-health-${Date.now()}`,
      merchantId: merchant.id,
      merchantName: merchant.name,
      riskType: 'low_health_score',
      severity: merchant.totalScore < config.healthScore.high ? 'high' : 'medium',
      message: `健康度评分仅${merchant.totalScore}分，低于安全线，需要重点关注`,
      createdAt: new Date().toISOString().split('T')[0],
      resolved: false
    });
  }

  // 2. 检查租金缴纳
  if (merchant.metrics.collection < config.collection.high) {
    riskTypes.push('rent_overdue');
    riskScore += 25;
    alerts.push({
      id: `${merchant.id}-rent-${Date.now()}`,
      merchantId: merchant.id,
      merchantName: merchant.name,
      riskType: 'rent_overdue',
      severity: merchant.metrics.collection < config.collection.high ? 'high' : 'medium',
      message: `租金缴纳评分${merchant.metrics.collection}分，存在欠租风险`,
      createdAt: new Date().toISOString().split('T')[0],
      resolved: false
    });
  }

  // 3. 检查租售比
  if (merchant.rentToSalesRatio > config.rentToSalesRatio.high) {
    riskTypes.push('high_rent_ratio');
    riskScore += 20;
    alerts.push({
      id: `${merchant.id}-ratio-${Date.now()}`,
      merchantId: merchant.id,
      merchantName: merchant.name,
      riskType: 'high_rent_ratio',
      severity: merchant.rentToSalesRatio > config.rentToSalesRatio.high ? 'high' : 'medium',
      message: `租售比${(merchant.rentToSalesRatio * 100).toFixed(1)}%，超过安全线${(config.rentToSalesRatio.high * 100)}%`,
      createdAt: new Date().toISOString().split('T')[0],
      resolved: false
    });
  }

  // 4. 检查经营表现
  if (merchant.metrics.operational < config.operational.high) {
    riskTypes.push('low_revenue');
    riskScore += 15;
    alerts.push({
      id: `${merchant.id}-revenue-${Date.now()}`,
      merchantId: merchant.id,
      merchantName: merchant.name,
      riskType: 'low_revenue',
      severity: merchant.metrics.operational < config.operational.high ? 'high' : 'medium',
      message: `经营表现评分${merchant.metrics.operational}分，营收表现不佳`,
      createdAt: new Date().toISOString().split('T')[0],
      resolved: false
    });
  }

  // 5. 检查顾客满意度
  if (merchant.metrics.customerReview < config.customerReview.high) {
    riskTypes.push('customer_complaint');
    riskScore += 10;
    alerts.push({
      id: `${merchant.id}-customer-${Date.now()}`,
      merchantId: merchant.id,
      merchantName: merchant.name,
      riskType: 'customer_complaint',
      severity: merchant.metrics.customerReview < config.customerReview.high ? 'high' : 'medium',
      message: `顾客满意度评分${merchant.metrics.customerReview}分，存在服务质量问题`,
      createdAt: new Date().toISOString().split('T')[0],
      resolved: false
    });
  }

  // 确定总体风险等级
  let riskLevel: 'high' | 'medium' | 'low';
  if (riskScore >= 50 || merchant.totalScore < config.healthScore.high) {
    riskLevel = 'high';
  } else if (riskScore >= 30 || merchant.totalScore < config.healthScore.medium) {
    riskLevel = 'medium';
  } else {
    riskLevel = 'low';
  }

  // 生成风险摘要
  const summary = generateRiskSummary(merchant, riskLevel, riskTypes);

  return {
    riskLevel,
    riskTypes,
    alerts,
    score: Math.min(100, riskScore),
    summary
  };
}

/**
 * 生成风险摘要
 */
function generateRiskSummary(
  merchant: Merchant,
  riskLevel: 'high' | 'medium' | 'low',
  riskTypes: string[]
): string {
  if (riskLevel === 'low') {
    return `${merchant.name}经营状况良好，健康度${merchant.totalScore}分，暂无明显风险。`;
  }

  const riskTypeTexts: Record<string, string> = {
    low_health_score: '健康度偏低',
    rent_overdue: '租金缴纳问题',
    high_rent_ratio: '租售比过高',
    low_revenue: '营收表现不佳',
    customer_complaint: '顾客满意度低'
  };

  const issues = riskTypes.map(type => riskTypeTexts[type] || type).join('、');

  if (riskLevel === 'high') {
    return `${merchant.name}存在高风险，健康度仅${merchant.totalScore}分，主要问题：${issues}，建议立即介入帮扶。`;
  } else {
    return `${merchant.name}存在中等风险，健康度${merchant.totalScore}分，主要问题：${issues}，建议关注并制定帮扶计划。`;
  }
}

/**
 * 批量评估商户风险
 */
export function batchAssessRisk(
  merchants: Merchant[],
  thresholds?: RiskThresholds
): Map<string, RiskAssessmentResult> {
  const results = new Map<string, RiskAssessmentResult>();

  merchants.forEach(merchant => {
    const result = assessRisk(merchant, thresholds);
    results.set(merchant.id, result);
  });

  return results;
}

/**
 * 获取高风险商户列表
 */
export function getHighRiskMerchants(
  merchants: Merchant[],
  thresholds?: RiskThresholds
): Array<{ merchant: Merchant; assessment: RiskAssessmentResult }> {
  const highRiskMerchants: Array<{ merchant: Merchant; assessment: RiskAssessmentResult }> = [];

  merchants.forEach(merchant => {
    const assessment = assessRisk(merchant, thresholds);
    if (assessment.riskLevel === 'high') {
      highRiskMerchants.push({ merchant, assessment });
    }
  });

  // 按风险评分降序排序
  return highRiskMerchants.sort((a, b) => b.assessment.score - a.assessment.score);
}
