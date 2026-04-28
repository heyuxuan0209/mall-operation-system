/**
 * 巡检规划引擎 - AI智能巡检计划生成
 * Sprint 1: 巡检前AI智能规划
 */

import { Merchant, ChecklistItem, InspectionRecord } from '@/types';

/**
 * 巡检计划接口
 */
export interface InspectionPlan {
  merchantId: string;
  merchantName: string;
  priority: 'urgent' | 'high' | 'normal' | 'low';
  reason: string;
  suggestedFocusAreas: string[];
  riskPrediction: {
    level: 'critical' | 'high' | 'medium' | 'low';
    confidence: number; // 0-100%
    factors: string[];
  };
  aiGeneratedChecklist: ChecklistItem[];
  historicalIssues: string[];
  expectedIssues: string[];
  lastInspectionDate: string | null;
  overdueDays: number;
  healthTrend: 'improving' | 'declining' | 'stable';
}

/**
 * 趋势分析结果
 */
interface TrendAnalysis {
  direction: 'improving' | 'declining' | 'stable';
  speed: number; // 变化速度，每天变化的分数
  confidence: number; // 置信度 0-100
}

/**
 * 生成智能巡检计划
 */
export function generateInspectionPlan(
  merchant: Merchant,
  lastInspection: InspectionRecord | null,
  healthHistory: Array<{ date: string; score: number }> = []
): InspectionPlan {
  // 1. 趋势检测
  const trend = analyzeHealthTrend(healthHistory);

  // 2. 风险预测
  const riskPrediction = predictRisk(merchant, trend);

  // 3. 优先级计算
  const priority = calculatePriority(merchant, trend, riskPrediction, lastInspection);

  // 4. 生成定制检查清单
  const checklist = generateCustomChecklist(merchant, lastInspection);

  // 5. 预期问题预测
  const expectedIssues = predictIssues(merchant, lastInspection);

  // 6. 计算超期天数
  const overdueDays = calculateOverdueDays(lastInspection, merchant.riskLevel);

  // 7. 提取历史问题
  const historicalIssues = lastInspection?.issues || [];

  // 8. 生成推荐原因
  const reason = generateReason(merchant, trend, riskPrediction, overdueDays);

  // 9. 建议关注领域
  const suggestedFocusAreas = generateFocusAreas(merchant);

  return {
    merchantId: merchant.id,
    merchantName: merchant.name,
    priority,
    reason,
    suggestedFocusAreas,
    riskPrediction,
    aiGeneratedChecklist: checklist,
    historicalIssues,
    expectedIssues,
    lastInspectionDate: lastInspection?.createdAt || null,
    overdueDays,
    healthTrend: trend.direction,
  };
}

/**
 * 分析健康度趋势
 */
function analyzeHealthTrend(history: Array<{ date: string; score: number }>): TrendAnalysis {
  if (history.length < 2) {
    return { direction: 'stable', speed: 0, confidence: 50 };
  }

  // 取最近7天的数据
  const recent = history.slice(0, Math.min(7, history.length));

  // 计算线性回归斜率
  const n = recent.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  recent.forEach((point, index) => {
    const x = index;
    const y = point.score;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const speed = Math.abs(slope);

  // 判断趋势方向
  let direction: 'improving' | 'declining' | 'stable';
  if (slope > 1) {
    direction = 'improving';
  } else if (slope < -1) {
    direction = 'declining';
  } else {
    direction = 'stable';
  }

  // 计算置信度（基于数据点数量和趋势明显程度）
  const confidence = Math.min(100, 50 + n * 5 + speed * 10);

  return { direction, speed, confidence };
}

/**
 * 预测风险
 */
function predictRisk(
  merchant: Merchant,
  trend: TrendAnalysis
): {
  level: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
  factors: string[];
} {
  const factors: string[] = [];
  let riskScore = 0;

  // 因素1: 当前健康度
  if (merchant.totalScore < 40) {
    riskScore += 40;
    factors.push('健康度极低');
  } else if (merchant.totalScore < 60) {
    riskScore += 30;
    factors.push('健康度偏低');
  } else if (merchant.totalScore < 80) {
    riskScore += 15;
  }

  // 因素2: 趋势方向
  if (trend.direction === 'declining' && trend.speed > 3) {
    riskScore += 30;
    factors.push('健康度快速下降');
  } else if (trend.direction === 'declining') {
    riskScore += 20;
    factors.push('健康度持续下降');
  }

  // 因素3: 租售比
  if (merchant.rentToSalesRatio > 35) {
    riskScore += 20;
    factors.push('租售比过高');
  } else if (merchant.rentToSalesRatio > 25) {
    riskScore += 10;
    factors.push('租售比偏高');
  }

  // 因素4: 各维度评分
  const { metrics } = merchant;
  if (metrics.collection < 50) {
    riskScore += 15;
    factors.push('租金缴纳严重不足');
  }
  if (metrics.siteQuality < 50) {
    riskScore += 10;
    factors.push('现场品质差');
  }
  if (metrics.operational < 50) {
    riskScore += 10;
    factors.push('经营表现不佳');
  }

  // 映射到风险等级
  let level: 'critical' | 'high' | 'medium' | 'low';
  if (riskScore >= 70) {
    level = 'critical';
  } else if (riskScore >= 50) {
    level = 'high';
  } else if (riskScore >= 30) {
    level = 'medium';
  } else {
    level = 'low';
  }

  // 置信度基于因素数量和趋势置信度
  const confidence = Math.min(100, 60 + factors.length * 8 + trend.confidence * 0.2);

  return { level, confidence, factors };
}

/**
 * 计算巡检优先级
 */
function calculatePriority(
  merchant: Merchant,
  trend: TrendAnalysis,
  risk: { level: string; confidence: number },
  lastInspection: InspectionRecord | null
): 'urgent' | 'high' | 'normal' | 'low' {
  let score = 0;

  // 风险等级权重（40%）
  if (risk.level === 'critical') score += 40;
  else if (risk.level === 'high') score += 30;
  else if (risk.level === 'medium') score += 20;
  else score += 10;

  // 趋势权重（30%）
  if (trend.direction === 'declining' && trend.speed > 5) score += 30;
  else if (trend.direction === 'declining') score += 20;
  else if (trend.direction === 'stable') score += 10;
  else score += 5;

  // 超期权重（30%）
  const daysSinceLastInspection = getDaysSinceLastInspection(lastInspection);
  if (daysSinceLastInspection > 7) score += 30;
  else if (daysSinceLastInspection > 3) score += 20;
  else score += 10;

  // 映射到优先级
  if (score >= 80) return 'urgent';
  if (score >= 60) return 'high';
  if (score >= 40) return 'normal';
  return 'low';
}

/**
 * 生成定制检查清单
 */
function generateCustomChecklist(
  merchant: Merchant,
  lastInspection: InspectionRecord | null
): ChecklistItem[] {
  const checklist: ChecklistItem[] = [];
  let idCounter = 1;

  // 基础检查项（所有商户）
  checklist.push({
    id: `check_${idCounter++}`,
    label: '员工到岗情况及精神状态',
    checked: false,
    category: '人员',
  });

  checklist.push({
    id: `check_${idCounter++}`,
    label: '货品陈列整齐度',
    checked: false,
    category: '货品',
  });

  checklist.push({
    id: `check_${idCounter++}`,
    label: '店面环境清洁卫生',
    checked: false,
    category: '场地',
  });

  checklist.push({
    id: `check_${idCounter++}`,
    label: '消防安全设施完好',
    checked: false,
    category: '安全',
  });

  // 根据薄弱维度添加定制检查项
  const { metrics } = merchant;

  if (metrics.siteQuality < 60) {
    checklist.push({
      id: `check_${idCounter++}`,
      label: '员工服务态度和专业性',
      checked: false,
      category: '人员',
    });
  }

  if (metrics.siteQuality < 60) {
    checklist.push({
      id: `check_${idCounter++}`,
      label: '店面设施设备运转情况',
      checked: false,
      category: '场地',
    });
  }

  if (metrics.operational < 60) {
    checklist.push({
      id: `check_${idCounter++}`,
      label: '客流情况和销售氛围',
      checked: false,
      category: '经营',
    });
  }

  // 如果上次发现问题，添加复查项
  if (lastInspection && lastInspection.issues.length > 0) {
    checklist.push({
      id: `check_${idCounter++}`,
      label: '上次发现问题的改善情况',
      checked: false,
      category: '复查',
    });
  }

  // 业态特定检查项
  if (merchant.category.includes('餐饮')) {
    checklist.push({
      id: `check_${idCounter++}`,
      label: '后厨卫生和食品安全',
      checked: false,
      category: '业态',
    });
  } else if (merchant.category.includes('零售')) {
    checklist.push({
      id: `check_${idCounter++}`,
      label: '库存管理和防盗措施',
      checked: false,
      category: '业态',
    });
  }

  return checklist;
}

/**
 * 预测可能发现的问题
 */
function predictIssues(
  merchant: Merchant,
  lastInspection: InspectionRecord | null
): string[] {
  const issues: string[] = [];

  // 基于当前指标预测
  const { metrics } = merchant;

  if (metrics.siteQuality < 50) {
    issues.push('可能发现现场卫生或设施问题');
  }

  if (metrics.operational < 50) {
    issues.push('可能存在客流不足或经营困难');
  }

  if (merchant.rentToSalesRatio > 30) {
    issues.push('商户可能反映租金压力大');
  }

  if (metrics.collection < 60) {
    issues.push('可能存在拖欠租金风险');
  }

  // 基于历史问题预测（如果上次有问题且未改善）
  if (lastInspection && lastInspection.issues.length > 0) {
    const daysSince = getDaysSinceLastInspection(lastInspection);
    if (daysSince < 7) {
      issues.push('上次发现的问题可能尚未完全解决');
    }
  }

  if (issues.length === 0) {
    issues.push('预计运营正常，建议常规巡检');
  }

  return issues;
}

/**
 * 计算距离上次巡检的天数
 */
function getDaysSinceLastInspection(lastInspection: InspectionRecord | null): number {
  if (!lastInspection) return 999; // 从未巡检

  const lastDate = new Date(lastInspection.createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - lastDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * 计算超期天数
 */
function calculateOverdueDays(
  lastInspection: InspectionRecord | null,
  riskLevel: string
): number {
  const daysSince = getDaysSinceLastInspection(lastInspection);

  // 根据风险等级确定应巡检频率
  let requiredInterval: number;
  switch (riskLevel) {
    case 'critical':
      requiredInterval = 1; // 每天
      break;
    case 'high':
      requiredInterval = 3; // 每3天
      break;
    case 'medium':
      requiredInterval = 7; // 每周
      break;
    default:
      requiredInterval = 14; // 每两周
  }

  return Math.max(0, daysSince - requiredInterval);
}

/**
 * 生成推荐原因
 */
function generateReason(
  merchant: Merchant,
  trend: TrendAnalysis,
  risk: { level: string; factors: string[] },
  overdueDays: number
): string {
  const reasons: string[] = [];

  // 趋势原因
  if (trend.direction === 'declining' && trend.speed > 3) {
    reasons.push(`健康度快速下降(${trend.speed.toFixed(1)}分/天)`);
  } else if (trend.direction === 'declining') {
    reasons.push('健康度持续下降');
  }

  // 风险原因
  if (risk.factors.length > 0) {
    reasons.push(risk.factors[0]); // 取最主要的风险因素
  }

  // 超期原因
  if (overdueDays > 0) {
    reasons.push(`已超期${overdueDays}天未巡检`);
  }

  // 健康度原因
  if (merchant.totalScore < 50) {
    reasons.push(`健康度仅${merchant.totalScore.toFixed(0)}分`);
  }

  if (reasons.length === 0) {
    return '建议按计划进行常规巡检';
  }

  return reasons.join('，');
}

/**
 * 生成关注领域
 */
function generateFocusAreas(merchant: Merchant): string[] {
  const areas: string[] = [];
  const { metrics } = merchant;

  // 按分数排序，找出最薄弱的3个维度
  const dimensions = [
    { name: '租金缴纳', score: metrics.collection },
    { name: '经营表现', score: metrics.operational },
    { name: '现场品质', score: metrics.siteQuality },
    { name: '客户满意度', score: metrics.customerReview },
    { name: '抗风险能力', score: metrics.riskResistance },
  ];

  const sorted = dimensions.sort((a, b) => a.score - b.score);

  // 取最薄弱的前3个（或所有低于70分的）
  sorted.slice(0, 3).forEach((dim) => {
    if (dim.score < 70) {
      areas.push(dim.name);
    }
  });

  if (areas.length === 0) {
    areas.push('整体运营');
  }

  return areas;
}

/**
 * 批量生成巡检计划（用于商户列表）
 */
export function generateInspectionPlans(
  merchants: Merchant[],
  inspectionRecords: InspectionRecord[]
): InspectionPlan[] {
  const plans = merchants.map((merchant) => {
    // 找到该商户的最后一次巡检
    const lastInspection = inspectionRecords
      .filter((r) => r.merchantId === merchant.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] || null;

    // 生成计划
    return generateInspectionPlan(merchant, lastInspection);
  });

  // 按优先级排序
  const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
  plans.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return plans;
}
