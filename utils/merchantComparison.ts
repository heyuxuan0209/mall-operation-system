import { Merchant } from '@/types';

/**
 * 商户对比数据结构
 */
export interface MerchantComparison {
  merchants: Merchant[];
  summary: ComparisonSummary;
  metrics: MetricsComparison;
  insights: ComparisonInsight[];
}

/**
 * 对比摘要
 */
export interface ComparisonSummary {
  totalMerchants: number;
  categories: string[];
  avgHealthScore: number;
  healthScoreRange: { min: number; max: number };
  avgRevenue: number;
  revenueRange: { min: number; max: number };
  avgRentRatio: number;
  rentRatioRange: { min: number; max: number };
}

/**
 * 指标对比
 */
export interface MetricsComparison {
  healthScores: Array<{ merchantId: string; merchantName: string; value: number }>;
  revenues: Array<{ merchantId: string; merchantName: string; value: number }>;
  rentRatios: Array<{ merchantId: string; merchantName: string; value: number }>;
  dimensionScores: {
    collection: Array<{ merchantId: string; merchantName: string; value: number }>;
    operational: Array<{ merchantId: string; merchantName: string; value: number }>;
    siteQuality: Array<{ merchantId: string; merchantName: string; value: number }>;
    customerReview: Array<{ merchantId: string; merchantName: string; value: number }>;
    riskResistance: Array<{ merchantId: string; merchantName: string; value: number }>;
  };
}

/**
 * 对比洞察
 */
export interface ComparisonInsight {
  type: 'best_performer' | 'worst_performer' | 'category_leader' | 'improvement_needed' | 'risk_warning' | 'revenue_gap';
  title: string;
  description: string;
  merchantIds: string[];
  severity?: 'info' | 'warning' | 'critical';
  icon?: string;
}

/**
 * 对比商户数据
 */
export function compareMerchants(merchants: Merchant[]): MerchantComparison {
  if (merchants.length === 0) {
    throw new Error('至少需要一个商户进行对比');
  }

  // 计算摘要数据
  const summary = calculateSummary(merchants);

  // 计算指标对比
  const metrics = calculateMetrics(merchants);

  // 生成智能洞察
  const insights = generateInsights(merchants, summary, metrics);

  return {
    merchants,
    summary,
    metrics,
    insights,
  };
}

/**
 * 计算摘要数据
 */
function calculateSummary(merchants: Merchant[]): ComparisonSummary {
  const categories = Array.from(new Set(merchants.map(m => m.category)));

  const healthScores = merchants.map(m => m.totalScore);
  const revenues = merchants.map(m => m.lastMonthRevenue);
  const rentRatios = merchants.map(m => m.rentToSalesRatio);

  return {
    totalMerchants: merchants.length,
    categories,
    avgHealthScore: average(healthScores),
    healthScoreRange: { min: Math.min(...healthScores), max: Math.max(...healthScores) },
    avgRevenue: average(revenues),
    revenueRange: { min: Math.min(...revenues), max: Math.max(...revenues) },
    avgRentRatio: average(rentRatios),
    rentRatioRange: { min: Math.min(...rentRatios), max: Math.max(...rentRatios) },
  };
}

/**
 * 计算指标对比
 */
function calculateMetrics(merchants: Merchant[]): MetricsComparison {
  const healthScores = merchants.map(m => ({
    merchantId: m.id,
    merchantName: m.name,
    value: m.totalScore,
  })).sort((a, b) => b.value - a.value);

  const revenues = merchants.map(m => ({
    merchantId: m.id,
    merchantName: m.name,
    value: m.lastMonthRevenue,
  })).sort((a, b) => b.value - a.value);

  const rentRatios = merchants.map(m => ({
    merchantId: m.id,
    merchantName: m.name,
    value: m.rentToSalesRatio,
  })).sort((a, b) => a.value - b.value); // 租售比越低越好

  return {
    healthScores,
    revenues,
    rentRatios,
    dimensionScores: {
      collection: merchants.map(m => ({
        merchantId: m.id,
        merchantName: m.name,
        value: m.metrics.collection,
      })).sort((a, b) => b.value - a.value),
      operational: merchants.map(m => ({
        merchantId: m.id,
        merchantName: m.name,
        value: m.metrics.operational,
      })).sort((a, b) => b.value - a.value),
      siteQuality: merchants.map(m => ({
        merchantId: m.id,
        merchantName: m.name,
        value: m.metrics.siteQuality,
      })).sort((a, b) => b.value - a.value),
      customerReview: merchants.map(m => ({
        merchantId: m.id,
        merchantName: m.name,
        value: m.metrics.customerReview,
      })).sort((a, b) => b.value - a.value),
      riskResistance: merchants.map(m => ({
        merchantId: m.id,
        merchantName: m.name,
        value: m.metrics.riskResistance,
      })).sort((a, b) => b.value - a.value),
    },
  };
}

/**
 * 生成智能洞察
 */
export function generateInsights(
  merchants: Merchant[],
  summary: ComparisonSummary,
  metrics: MetricsComparison
): ComparisonInsight[] {
  const insights: ComparisonInsight[] = [];

  // 1. 最佳表现者
  const bestPerformer = metrics.healthScores[0];
  if (bestPerformer) {
    insights.push({
      type: 'best_performer',
      title: '最佳表现商户',
      description: `${bestPerformer.merchantName} 健康度最高（${bestPerformer.value}分），是对比中的标杆商户。`,
      merchantIds: [bestPerformer.merchantId],
      severity: 'info',
      icon: '🏆',
    });
  }

  // 2. 最差表现者（如果健康度低于60分）
  const worstPerformer = metrics.healthScores[metrics.healthScores.length - 1];
  if (worstPerformer && worstPerformer.value < 60) {
    insights.push({
      type: 'worst_performer',
      title: '需要重点关注',
      description: `${worstPerformer.merchantName} 健康度较低（${worstPerformer.value}分），建议制定专项帮扶计划。`,
      merchantIds: [worstPerformer.merchantId],
      severity: 'warning',
      icon: '⚠️',
    });
  }

  // 3. 业态领先者（同业态中最高分）
  const categoryGroups = groupByCategory(merchants);
  Object.entries(categoryGroups).forEach(([category, categoryMerchants]) => {
    if (categoryMerchants.length > 1) {
      const leader = categoryMerchants.reduce((best, current) =>
        current.totalScore > best.totalScore ? current : best
      );
      insights.push({
        type: 'category_leader',
        title: `${category}类标杆`,
        description: `${leader.name} 在${category}类中表现最佳（${leader.totalScore}分），可作为同类商户学习对象。`,
        merchantIds: [leader.id],
        severity: 'info',
        icon: '🎯',
      });
    }
  });

  // 4. 健康度差距分析
  const scoreDiff = summary.healthScoreRange.max - summary.healthScoreRange.min;
  if (scoreDiff > 30) {
    const weakMerchants = merchants.filter(m => m.totalScore < summary.avgHealthScore - 10);
    if (weakMerchants.length > 0) {
      insights.push({
        type: 'improvement_needed',
        title: '差距较大需改善',
        description: `对比商户间健康度差距达${scoreDiff.toFixed(0)}分，${weakMerchants.map(m => m.name).join('、')}需要加强改进。`,
        merchantIds: weakMerchants.map(m => m.id),
        severity: 'warning',
        icon: '📊',
      });
    }
  }

  // 5. 风险预警
  const highRiskMerchants = merchants.filter(m =>
    m.riskLevel === 'critical' || m.riskLevel === 'high'
  );
  if (highRiskMerchants.length > 0) {
    insights.push({
      type: 'risk_warning',
      title: '高风险商户提示',
      description: `${highRiskMerchants.map(m => m.name).join('、')}存在较高经营风险，建议密切监控并及时干预。`,
      merchantIds: highRiskMerchants.map(m => m.id),
      severity: 'critical',
      icon: '🚨',
    });
  }

  // 6. 营收差距分析
  const revenueDiff = summary.revenueRange.max - summary.revenueRange.min;
  if (revenueDiff > summary.avgRevenue * 0.5) {
    const lowRevenueMerchants = merchants.filter(m =>
      m.lastMonthRevenue < summary.avgRevenue * 0.7
    );
    if (lowRevenueMerchants.length > 0) {
      insights.push({
        type: 'revenue_gap',
        title: '营收水平差异',
        description: `${lowRevenueMerchants.map(m => m.name).join('、')}月营收低于平均水平30%以上，建议分析原因并制定提升策略。`,
        merchantIds: lowRevenueMerchants.map(m => m.id),
        severity: 'warning',
        icon: '💰',
      });
    }
  }

  // 7. 维度弱项分析
  const dimensionNames = {
    collection: '租金缴纳',
    operational: '经营表现',
    siteQuality: '现场品质',
    customerReview: '顾客满意度',
    riskResistance: '抗风险能力',
  };

  Object.entries(metrics.dimensionScores).forEach(([dimension, scores]) => {
    const weakMerchants = scores.filter(s => s.value < 60);
    if (weakMerchants.length > 0) {
      const dimensionLabel = dimensionNames[dimension as keyof typeof dimensionNames];
      insights.push({
        type: 'improvement_needed',
        title: `${dimensionLabel}待提升`,
        description: `${weakMerchants.map(s => s.merchantName).join('、')}的${dimensionLabel}得分偏低，建议针对性改善。`,
        merchantIds: weakMerchants.map(s => s.merchantId),
        severity: 'warning',
        icon: '📈',
      });
    }
  });

  // 限制洞察数量（最多10条）
  return insights.slice(0, 10);
}

/**
 * 按业态分组
 */
function groupByCategory(merchants: Merchant[]): Record<string, Merchant[]> {
  const groups: Record<string, Merchant[]> = {};

  merchants.forEach(merchant => {
    const mainCategory = merchant.category.split('-')[0];
    if (!groups[mainCategory]) {
      groups[mainCategory] = [];
    }
    groups[mainCategory].push(merchant);
  });

  return groups;
}

/**
 * 计算平均值
 */
function average(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}

/**
 * 格式化数字
 */
export function formatNumber(value: number, decimals = 1): string {
  return value.toFixed(decimals);
}

/**
 * 格式化金额（万元）
 */
export function formatRevenue(value: number): string {
  return `${(value / 10000).toFixed(1)}万`;
}

/**
 * 格式化百分比
 */
export function formatPercentage(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

/**
 * 获取颜色类（用于图表和UI）
 */
export function getColorClass(index: number): string {
  const colors = [
    'blue',
    'green',
    'purple',
    'orange',
    'pink',
  ];
  return colors[index % colors.length];
}

/**
 * 获取健康度颜色
 */
export function getHealthScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-blue-600';
  if (score >= 40) return 'text-yellow-600';
  if (score >= 20) return 'text-orange-600';
  return 'text-red-600';
}

/**
 * 获取风险等级颜色
 */
export function getRiskLevelColor(riskLevel: string): string {
  switch (riskLevel) {
    case 'critical': return 'text-red-600 bg-red-50 border-red-200';
    case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'none': return 'text-green-600 bg-green-50 border-green-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}
