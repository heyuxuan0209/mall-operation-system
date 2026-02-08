/**
 * 风险识别器
 *
 * 功能：基于商户数据自动识别风险类型和严重程度
 * 复用场景：
 * - 风险预警页面的自动预警
 * - 定时任务扫描
 * - 预测性分析的风险判断
 */

export type RiskType = 'rent_overdue' | 'low_revenue' | 'high_rent_ratio' | 'customer_complaint' | 'health_declining';
export type RiskSeverity = 'high' | 'medium' | 'low';

export interface Merchant {
  id: string;
  name: string;
  category: string;
  rent: number;
  lastMonthRevenue: number;
  rentToSalesRatio: number;
  metrics: {
    collection: number;
    operational: number;
    siteQuality: number;
    customerReview: number;
    riskResistance: number;
  };
  totalScore: number;
}

export interface RiskAlert {
  id: string;
  merchantId: string;
  merchantName: string;
  riskType: RiskType;
  severity: RiskSeverity;
  message: string;
  suggestedActions: string[];
  createdAt: string;
}

export interface RiskDetectorOutput {
  risks: RiskAlert[];
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
}

/**
 * 检测租金逾期风险
 */
function detectRentOverdue(merchant: Merchant): RiskAlert | null {
  // 收缴健康度低于60分视为有逾期风险
  if (merchant.metrics.collection < 60) {
    return {
      id: `R_${merchant.id}_RENT_${Date.now()}`,
      merchantId: merchant.id,
      merchantName: merchant.name,
      riskType: 'rent_overdue',
      severity: merchant.metrics.collection < 40 ? 'high' : 'medium',
      message: `收缴健康度仅${merchant.metrics.collection}分，存在租金逾期风险`,
      suggestedActions: [
        '立即联系商户了解情况',
        '评估商户经营状况',
        '制定分期还款计划',
        '必要时启动法律程序'
      ],
      createdAt: new Date().toISOString().split('T')[0]
    };
  }
  return null;
}

/**
 * 检测营收下滑风险
 */
function detectLowRevenue(merchant: Merchant): RiskAlert | null {
  // 经营健康度低于60分视为营收下滑
  if (merchant.metrics.operational < 60) {
    return {
      id: `R_${merchant.id}_REVENUE_${Date.now()}`,
      merchantId: merchant.id,
      merchantName: merchant.name,
      riskType: 'low_revenue',
      severity: merchant.metrics.operational < 40 ? 'high' : 'medium',
      message: `经营健康度仅${merchant.metrics.operational}分，营收持续下滑`,
      suggestedActions: [
        '分析营收下滑原因',
        '开展联合营销活动',
        '优化商品结构',
        '提供运营指导'
      ],
      createdAt: new Date().toISOString().split('T')[0]
    };
  }
  return null;
}

/**
 * 检测租售比过高风险
 */
function detectHighRentRatio(merchant: Merchant): RiskAlert | null {
  // 租售比超过25%为警戒线，超过30%为高风险
  if (merchant.rentToSalesRatio > 0.25) {
    const percentage = (merchant.rentToSalesRatio * 100).toFixed(1);
    return {
      id: `R_${merchant.id}_RATIO_${Date.now()}`,
      merchantId: merchant.id,
      merchantName: merchant.name,
      riskType: 'high_rent_ratio',
      severity: merchant.rentToSalesRatio > 0.3 ? 'high' : 'medium',
      message: `租售比达到${percentage}%，${merchant.rentToSalesRatio > 0.3 ? '远超' : '接近'}行业警戒线25%`,
      suggestedActions: [
        '评估降租可能性',
        '协助提升营收',
        '优化成本结构',
        '考虑业态调整'
      ],
      createdAt: new Date().toISOString().split('T')[0]
    };
  }
  return null;
}

/**
 * 检测顾客投诉风险
 */
function detectCustomerComplaint(merchant: Merchant): RiskAlert | null {
  // 顾客评价低于60分视为有投诉风险
  if (merchant.metrics.customerReview < 60) {
    return {
      id: `R_${merchant.id}_COMPLAINT_${Date.now()}`,
      merchantId: merchant.id,
      merchantName: merchant.name,
      riskType: 'customer_complaint',
      severity: merchant.metrics.customerReview < 40 ? 'high' : 'medium',
      message: `顾客满意度评分${merchant.metrics.customerReview}分，低于60分及格线`,
      suggestedActions: [
        '开展服务质量培训',
        '建立顾客反馈机制',
        '改善就餐/购物环境',
        '及时处理投诉'
      ],
      createdAt: new Date().toISOString().split('T')[0]
    };
  }
  return null;
}

/**
 * 检测健康度下滑风险
 */
function detectHealthDeclining(merchant: Merchant): RiskAlert | null {
  // 总体健康度低于60分
  if (merchant.totalScore < 60) {
    return {
      id: `R_${merchant.id}_HEALTH_${Date.now()}`,
      merchantId: merchant.id,
      merchantName: merchant.name,
      riskType: 'health_declining',
      severity: merchant.totalScore < 45 ? 'high' : 'medium',
      message: `健康度评分仅${merchant.totalScore}分，整体经营状况不佳`,
      suggestedActions: [
        '全面评估商户状况',
        '制定综合帮扶方案',
        '定期跟进改善进度',
        '必要时考虑业态调整'
      ],
      createdAt: new Date().toISOString().split('T')[0]
    };
  }
  return null;
}

/**
 * 综合风险检测
 */
export function detectRisks(merchant: Merchant): RiskDetectorOutput {
  const risks: RiskAlert[] = [];

  // 依次检测各类风险
  const rentRisk = detectRentOverdue(merchant);
  const revenueRisk = detectLowRevenue(merchant);
  const ratioRisk = detectHighRentRatio(merchant);
  const complaintRisk = detectCustomerComplaint(merchant);
  const healthRisk = detectHealthDeclining(merchant);

  // 收集所有风险
  if (rentRisk) risks.push(rentRisk);
  if (revenueRisk) risks.push(revenueRisk);
  if (ratioRisk) risks.push(ratioRisk);
  if (complaintRisk) risks.push(complaintRisk);
  if (healthRisk) risks.push(healthRisk);

  // 统计各级别风险数量
  const highRiskCount = risks.filter(r => r.severity === 'high').length;
  const mediumRiskCount = risks.filter(r => r.severity === 'medium').length;
  const lowRiskCount = risks.filter(r => r.severity === 'low').length;

  return {
    risks,
    highRiskCount,
    mediumRiskCount,
    lowRiskCount
  };
}

/**
 * 🔥 新增：获取风险类型的中文名称
 */
export function getRiskTypeName(riskType: RiskType): string {
  const names: Record<RiskType, string> = {
    rent_overdue: '租金逾期',
    low_revenue: '营收低迷',
    high_rent_ratio: '租售比过高',
    customer_complaint: '顾客投诉',
    health_declining: '健康度下滑',
  };
  return names[riskType] || riskType;
}

/**
 * 批量检测多个商户的风险
 */
export function batchDetectRisks(merchants: Merchant[]): {
  allRisks: RiskAlert[];
  merchantRisks: Map<string, RiskAlert[]>;
  summary: {
    totalMerchants: number;
    merchantsWithRisk: number;
    totalRisks: number;
    highRiskMerchants: number;
    mediumRiskMerchants: number;
  };
} {
  const allRisks: RiskAlert[] = [];
  const merchantRisks = new Map<string, RiskAlert[]>();
  let highRiskMerchants = 0;
  let mediumRiskMerchants = 0;

  merchants.forEach(merchant => {
    const result = detectRisks(merchant);
    if (result.risks.length > 0) {
      allRisks.push(...result.risks);
      merchantRisks.set(merchant.id, result.risks);

      // 统计商户风险等级（取最高风险等级）
      if (result.highRiskCount > 0) {
        highRiskMerchants++;
      } else if (result.mediumRiskCount > 0) {
        mediumRiskMerchants++;
      }
    }
  });

  return {
    allRisks,
    merchantRisks,
    summary: {
      totalMerchants: merchants.length,
      merchantsWithRisk: merchantRisks.size,
      totalRisks: allRisks.length,
      highRiskMerchants,
      mediumRiskMerchants
    }
  };
}

/**
 * 获取严重程度的中文名称
 */
export function getSeverityName(severity: RiskSeverity): string {
  const names: Record<RiskSeverity, string> = {
    high: '高危',
    medium: '中危',
    low: '低危'
  };
  return names[severity];
}
