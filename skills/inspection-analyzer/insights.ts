/**
 * Inspection Analyzer - Insights Module
 * 巡检分析器 - 洞察模块
 *
 * 负责生成商户画像和核心观察点
 */

import { Merchant } from '@/types';
import { MerchantInsights } from './types';

/**
 * 生成商户洞察
 * 根据商户健康度数据生成诊断简报
 *
 * @param merchant - 商户数据
 * @returns 商户洞察结果（预警、最薄弱维度、核心观察点）
 */
export function generateMerchantInsights(merchant: Merchant): MerchantInsights {
  const { metrics, rentToSalesRatio } = merchant;

  // 生成预警标签
  const alerts: string[] = [];

  // 租售比预警
  if (rentToSalesRatio > 25) {
    alerts.push(`租售比过高(${rentToSalesRatio.toFixed(1)}%)`);
  }

  // 经营表现预警
  if (metrics.operational < 40) {
    alerts.push(`经营表现不佳(${metrics.operational}分)`);
  }

  // 现场品质预警
  if (metrics.siteQuality < 50) {
    alerts.push(`现场品质较差(${metrics.siteQuality}分)`);
  }

  // 顾客满意度预警
  if (metrics.customerReview < 50) {
    alerts.push(`顾客满意度偏低(${metrics.customerReview}分)`);
  }

  // 租金缴纳预警
  if (metrics.collection < 80) {
    alerts.push(`租金缴纳异常(${metrics.collection}分)`);
  }

  // 抗风险能力预警
  if (metrics.riskResistance < 40) {
    alerts.push(`抗风险能力弱(${metrics.riskResistance}分)`);
  }

  // 识别最薄弱维度
  const dimensionScores = [
    { name: '租金缴纳', score: metrics.collection },
    { name: '经营表现', score: metrics.operational },
    { name: '现场品质', score: metrics.siteQuality },
    { name: '顾客满意度', score: metrics.customerReview },
    { name: '抗风险能力', score: metrics.riskResistance },
  ];

  const weakest = dimensionScores.reduce((min, curr) =>
    curr.score < min.score ? curr : min
  );

  // 生成核心观察点
  const focusPoints = generateFocusPoints(merchant);

  return {
    alerts,
    weakestDimension: weakest.name,
    focusPoints,
  };
}

/**
 * 生成核心观察点
 * 根据商户弱项指标生成针对性的观察引导
 *
 * @param merchant - 商户数据
 * @returns 核心观察点列表
 */
export function generateFocusPoints(merchant: Merchant): string[] {
  const { metrics, rentToSalesRatio } = merchant;
  const focusPoints: string[] = [];

  // 根据经营表现生成观察点
  if (metrics.operational < 50) {
    focusPoints.push('重点观察货品完备性与陈列');
    focusPoints.push('核实是否存在断货或库存积压');
  }

  // 根据现场品质生成观察点
  if (metrics.siteQuality < 60) {
    focusPoints.push('检查店面卫生和环境整洁度');
    focusPoints.push('核查设施设备是否正常运作');
  }

  // 根据顾客满意度生成观察点
  if (metrics.customerReview < 60) {
    focusPoints.push('关注员工服务态度和话术');
    focusPoints.push('观察顾客进店后的接待流程');
  }

  // 根据租售比生成观察点
  if (rentToSalesRatio > 25) {
    focusPoints.push('了解经营困难和成本压力');
    focusPoints.push('评估是否需要调整经营策略');
  }

  // 根据租金缴纳生成观察点
  if (metrics.collection < 80) {
    focusPoints.push('核实租金缴纳情况和资金状况');
    focusPoints.push('评估商户的经营意愿和信心');
  }

  // 如果没有明显弱项，给出常规观察点
  if (focusPoints.length === 0) {
    focusPoints.push('观察整体经营状态和员工精神面貌');
    focusPoints.push('了解近期经营情况和客流变化');
    focusPoints.push('收集商户对商场服务的反馈');
  }

  return focusPoints;
}
