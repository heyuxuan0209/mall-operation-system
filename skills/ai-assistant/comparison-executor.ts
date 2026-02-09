/**
 * Comparison Executor - 对比分析执行器 ⭐v3.0新增
 *
 * 功能：执行对比分析查询
 * - 商户vs商户对比（"海底捞vs小龙坎"）
 * - 时间对比（"本月vs上月"）
 * - 分类对比（"这家店vs同类商户平均"）
 * - 楼层对比（"3层vs2层商户"）
 * - 自动生成洞察（主要变化、关键差异）
 */

import {
  ComparisonResult,
  TimeRange,
  ExtendedExecutionPlan,
} from '@/types/ai-assistant';
import { Merchant } from '@/types';
import { merchantDataManager } from '@/utils/merchantDataManager';

export class ComparisonExecutor {
  /**
   * 执行对比分析
   */
  execute(plan: ExtendedExecutionPlan, allMerchants?: Merchant[]): ComparisonResult {
    const merchants = allMerchants || merchantDataManager.getAllMerchants();
    const comparisonTarget = plan.entities.comparisonTarget;

    if (!comparisonTarget) {
      // 🔥 改进：提供默认对比（上月）
      console.warn('[ComparisonExecutor] No comparison target, defaulting to last_month');
      return this.timeComparison(plan, merchants);
    }

    // 🔥 新增：商户vs商户对比
    if (comparisonTarget === 'merchant_vs_merchant') {
      return this.merchantComparison(plan, merchants);
    }

    // 根据对比类型执行不同的对比逻辑
    if (comparisonTarget === 'last_month' || comparisonTarget === 'last_week') {
      // 时间对比
      return this.timeComparison(plan, merchants);
    } else if (comparisonTarget === 'same_category') {
      // 同类商户对比
      return this.categoryComparison(plan, merchants);
    } else if (comparisonTarget === 'same_floor') {
      // 同楼层对比
      return this.floorComparison(plan, merchants);
    } else {
      // 🔥 改进：降级处理
      console.warn(`[ComparisonExecutor] Unknown target: ${comparisonTarget}, fallback to time comparison`);
      return this.timeComparison(plan, merchants);
    }
  }

  /**
   * 时间对比（本月vs上月）
   */
  private timeComparison(
    plan: ExtendedExecutionPlan,
    merchants: Merchant[]
  ): ComparisonResult {
    const merchantId = plan.entities.merchantId;
    const merchantName = plan.entities.merchantName;

    // 获取当前商户数据
    const current = merchantId
      ? merchants.find(m => m.id === merchantId)
      : merchants.find(m => m.name === merchantName);

    if (!current) {
      throw new Error(`Merchant not found: ${merchantName || merchantId}`);
    }

    // 模拟上月数据（实际应从历史数据获取）
    const baseline = this.simulateHistoricalData(current, plan.entities.comparisonTarget!);

    // 计算差异
    const delta = this.calculateDelta(current, baseline);

    // 生成洞察
    const insights = this.generateTimeComparisonInsights(current, baseline, delta);

    return {
      current: {
        merchantId: current.id,
        merchantName: current.name,
        data: this.extractMerchantData(current),
        timeRange: plan.entities.timeRange,
      },
      baseline: {
        merchantId: current.id,
        merchantName: current.name,
        data: baseline,
        timeRange: this.getBaselineTimeRange(plan.entities.comparisonTarget!),
        label: this.getComparisonLabel(plan.entities.comparisonTarget!),
      },
      delta,
      insights,
    };
  }

  /**
   * 同类商户对比
   */
  private categoryComparison(
    plan: ExtendedExecutionPlan,
    merchants: Merchant[]
  ): ComparisonResult {
    const merchantId = plan.entities.merchantId;
    const merchantName = plan.entities.merchantName;

    // 获取当前商户
    const current = merchantId
      ? merchants.find(m => m.id === merchantId)
      : merchants.find(m => m.name === merchantName);

    if (!current) {
      throw new Error(`Merchant not found: ${merchantName || merchantId}`);
    }

    // 获取同类商户
    const sameCategoryMerchants = merchants.filter(
      m => m.category === current.category && m.id !== current.id
    );

    // 计算同类平均值
    const baseline = this.calculateAverageData(sameCategoryMerchants);

    // 计算差异
    const delta = this.calculateDelta(current, baseline);

    // 生成洞察
    const insights = this.generateCategoryComparisonInsights(current, baseline, delta, sameCategoryMerchants.length);

    return {
      current: {
        merchantId: current.id,
        merchantName: current.name,
        data: this.extractMerchantData(current),
      },
      baseline: {
        data: baseline,
        label: `${current.category}商户平均（${sameCategoryMerchants.length}家）`,
      },
      delta,
      insights,
    };
  }

  /**
   * 同楼层对比
   */
  private floorComparison(
    plan: ExtendedExecutionPlan,
    merchants: Merchant[]
  ): ComparisonResult {
    const merchantId = plan.entities.merchantId;
    const merchantName = plan.entities.merchantName;

    const current = merchantId
      ? merchants.find(m => m.id === merchantId)
      : merchants.find(m => m.name === merchantName);

    if (!current) {
      throw new Error(`Merchant not found: ${merchantName || merchantId}`);
    }

    // 获取同楼层商户
    const sameFloorMerchants = merchants.filter(
      m => m.floor === current.floor && m.id !== current.id
    );

    // 计算同楼层平均值
    const baseline = this.calculateAverageData(sameFloorMerchants);

    // 计算差异
    const delta = this.calculateDelta(current, baseline);

    // 生成洞察
    const insights = this.generateFloorComparisonInsights(current, baseline, delta, sameFloorMerchants.length);

    return {
      current: {
        merchantId: current.id,
        merchantName: current.name,
        data: this.extractMerchantData(current),
      },
      baseline: {
        data: baseline,
        label: `${current.floor}商户平均（${sameFloorMerchants.length}家）`,
      },
      delta,
      insights,
    };
  }

  /**
   * 商户vs商户对比
   */
  private merchantComparison(
    plan: ExtendedExecutionPlan,
    merchants: Merchant[]
  ): ComparisonResult {
    // 🔥 修复：支持两种格式的merchants
    // 格式1: Array<{id, name}> - 来自resolveEntities
    // 格式2: Array<string> - 来自LLM直接解析
    const merchantEntities = plan.entities.merchants || [];

    if (merchantEntities.length < 2) {
      throw new Error('需要两个商户名进行对比');
    }

    // 获取商户名称（支持两种格式）
    const merchant1Name = typeof merchantEntities[0] === 'string'
      ? merchantEntities[0]
      : (merchantEntities[0] as any).name;
    const merchant2Name = typeof merchantEntities[1] === 'string'
      ? merchantEntities[1]
      : (merchantEntities[1] as any).name;

    // 查找商户
    const merchant1 = merchants.find(m =>
      m.name === merchant1Name || m.name.includes(merchant1Name) || merchant1Name.includes(m.name)
    );
    const merchant2 = merchants.find(m =>
      m.name === merchant2Name || m.name.includes(merchant2Name) || merchant2Name.includes(m.name)
    );

    if (!merchant1) {
      throw new Error(`商户不存在: ${merchant1Name}`);
    }
    if (!merchant2) {
      throw new Error(`商户不存在: ${merchant2Name}`);
    }

    // 提取数据
    const data1 = this.extractMerchantData(merchant1);
    const data2 = this.extractMerchantData(merchant2);

    // 计算差异
    const delta = this.calculateDelta(merchant1, data2);

    // 生成洞察
    const insights = this.generateMerchantComparisonInsights(merchant1, merchant2, delta);

    return {
      current: {
        merchantId: merchant1.id,
        merchantName: merchant1.name,
        data: data1,
      },
      baseline: {
        merchantId: merchant2.id,
        merchantName: merchant2.name,
        data: data2,
        label: merchant2.name,
      },
      delta,
      insights,
    };
  }

  /**
   * 提取商户数据
   */
  private extractMerchantData(merchant: Merchant): any {
    return {
      totalScore: merchant.totalScore,
      riskLevel: merchant.riskLevel,
      revenue: merchant.lastMonthRevenue,
      rent: merchant.rent,
      rentToSalesRatio: merchant.rentToSalesRatio,
      collection: merchant.metrics.collection,
      operational: merchant.metrics.operational,
      siteQuality: merchant.metrics.siteQuality,
      customerReview: merchant.metrics.customerReview,
      riskResistance: merchant.metrics.riskResistance,
    };
  }

  /**
   * 计算平均数据
   */
  private calculateAverageData(merchants: Merchant[]): any {
    if (merchants.length === 0) {
      return this.extractMerchantData(merchants[0]); // 返回零值
    }

    const avg = {
      totalScore: 0,
      revenue: 0,
      rent: 0,
      rentToSalesRatio: 0,
      collection: 0,
      operational: 0,
      siteQuality: 0,
      customerReview: 0,
      riskResistance: 0,
    };

    for (const merchant of merchants) {
      avg.totalScore += merchant.totalScore;
      avg.revenue += merchant.lastMonthRevenue;
      avg.rent += merchant.rent;
      avg.rentToSalesRatio += merchant.rentToSalesRatio;
      avg.collection += merchant.metrics.collection;
      avg.operational += merchant.metrics.operational;
      avg.siteQuality += merchant.metrics.siteQuality;
      avg.customerReview += merchant.metrics.customerReview;
      avg.riskResistance += merchant.metrics.riskResistance;
    }

    const count = merchants.length;
    return {
      totalScore: Math.round(avg.totalScore / count),
      revenue: Math.round(avg.revenue / count),
      rent: Math.round(avg.rent / count),
      rentToSalesRatio: Math.round((avg.rentToSalesRatio / count) * 10) / 10,
      collection: Math.round(avg.collection / count),
      operational: Math.round(avg.operational / count),
      siteQuality: Math.round(avg.siteQuality / count),
      customerReview: Math.round(avg.customerReview / count),
      riskResistance: Math.round(avg.riskResistance / count),
      riskLevel: this.getMostCommonRiskLevel(merchants),
    };
  }

  /**
   * 获取最常见的风险等级
   */
  private getMostCommonRiskLevel(merchants: Merchant[]): string {
    const counts: Record<string, number> = {};
    for (const merchant of merchants) {
      counts[merchant.riskLevel] = (counts[merchant.riskLevel] || 0) + 1;
    }

    let maxCount = 0;
    let mostCommon = 'medium';
    for (const [level, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = level;
      }
    }

    return mostCommon;
  }

  /**
   * 计算差异
   */
  private calculateDelta(current: Merchant | any, baseline: any): Record<string, number | string> {
    const currentData = current.totalScore !== undefined
      ? this.extractMerchantData(current)
      : current;

    const delta: Record<string, number | string> = {};

    // 数值字段：计算百分比变化
    const numericFields = [
      'totalScore',
      'revenue',
      'rent',
      'rentToSalesRatio',
      'collection',
      'operational',
      'siteQuality',
      'customerReview',
      'riskResistance',
    ];

    for (const field of numericFields) {
      if (currentData[field] !== undefined && baseline[field] !== undefined) {
        const diff = currentData[field] - baseline[field];
        const percent = baseline[field] !== 0
          ? ((diff / baseline[field]) * 100).toFixed(1)
          : 'N/A';
        delta[field] = `${diff > 0 ? '+' : ''}${diff} (${diff > 0 ? '+' : ''}${percent}%)`;
      }
    }

    return delta;
  }

  /**
   * 生成时间对比洞察
   */
  private generateTimeComparisonInsights(
    current: Merchant,
    baseline: any,
    delta: Record<string, number | string>
  ): string[] {
    const insights: string[] = [];

    // 健康度变化
    const healthDiff = current.totalScore - baseline.totalScore;
    if (healthDiff > 5) {
      insights.push(`健康度提升显著（+${healthDiff}分）`);
    } else if (healthDiff < -5) {
      insights.push(`健康度下降需关注（${healthDiff}分）`);
    }

    // 营收变化
    const revenueDiff = current.lastMonthRevenue - baseline.revenue;
    if (Math.abs(revenueDiff) > baseline.revenue * 0.1) {
      insights.push(
        revenueDiff > 0
          ? `营收增长${((revenueDiff / baseline.revenue) * 100).toFixed(1)}%`
          : `营收下滑${Math.abs((revenueDiff / baseline.revenue) * 100).toFixed(1)}%`
      );
    }

    // 风险等级变化
    if (current.riskLevel !== baseline.riskLevel) {
      insights.push(`风险等级从${baseline.riskLevel}变为${current.riskLevel}`);
    }

    return insights;
  }

  /**
   * 生成同类对比洞察
   */
  private generateCategoryComparisonInsights(
    current: Merchant,
    baseline: any,
    delta: Record<string, number | string>,
    peerCount: number
  ): string[] {
    const insights: string[] = [];

    // 健康度对比
    const healthDiff = current.totalScore - baseline.totalScore;
    if (healthDiff > 10) {
      insights.push(`健康度高于同类平均${healthDiff}分`);
    } else if (healthDiff < -10) {
      insights.push(`健康度低于同类平均${Math.abs(healthDiff)}分`);
    } else {
      insights.push(`健康度接近同类平均水平`);
    }

    // 营收对比
    const revenueDiff = current.lastMonthRevenue - baseline.revenue;
    if (Math.abs(revenueDiff) > baseline.revenue * 0.2) {
      insights.push(
        revenueDiff > 0
          ? `营收显著高于同类平均`
          : `营收显著低于同类平均`
      );
    }

    insights.push(`对比了${peerCount}家同类商户`);

    return insights;
  }

  /**
   * 生成楼层对比洞察
   */
  private generateFloorComparisonInsights(
    current: Merchant,
    baseline: any,
    delta: Record<string, number | string>,
    peerCount: number
  ): string[] {
    const insights: string[] = [];

    const healthDiff = current.totalScore - baseline.totalScore;
    if (healthDiff !== 0) {
      insights.push(
        healthDiff > 0
          ? `表现优于同楼层平均${Math.abs(healthDiff)}分`
          : `表现低于同楼层平均${Math.abs(healthDiff)}分`
      );
    }

    insights.push(`对比了${peerCount}家同楼层商户`);

    return insights;
  }

  /**
   * 生成商户对比洞察
   */
  private generateMerchantComparisonInsights(
    merchant1: Merchant,
    merchant2: Merchant,
    delta: Record<string, number | string>
  ): string[] {
    const insights: string[] = [];

    // 健康度对比
    if (merchant1.totalScore > merchant2.totalScore) {
      insights.push(`${merchant1.name}健康度更优（${merchant1.totalScore} vs ${merchant2.totalScore}）`);
    } else if (merchant1.totalScore < merchant2.totalScore) {
      insights.push(`${merchant2.name}健康度更优（${merchant2.totalScore} vs ${merchant1.totalScore}）`);
    } else {
      insights.push(`两家商户健康度相当`);
    }

    // 风险等级对比
    if (merchant1.riskLevel !== merchant2.riskLevel) {
      insights.push(`风险等级不同：${merchant1.name}为${merchant1.riskLevel}，${merchant2.name}为${merchant2.riskLevel}`);
    }

    // 业态对比
    if (merchant1.category !== merchant2.category) {
      insights.push(`业态不同：${merchant1.category} vs ${merchant2.category}`);
    }

    return insights;
  }

  /**
   * 模拟历史数据
   * TODO: 替换为真实的历史数据查询
   */
  private simulateHistoricalData(current: Merchant, comparisonTarget: string): any {
    const data = this.extractMerchantData(current);

    // 简单模拟：上月数据在当前基础上浮动 -15% 到 +15%
    const fluctuation = 0.85 + Math.random() * 0.3; // 0.85 - 1.15

    return {
      totalScore: Math.round(data.totalScore * fluctuation),
      revenue: Math.round(data.revenue * fluctuation),
      rent: data.rent, // 租金通常不变
      rentToSalesRatio: Math.round(data.rentToSalesRatio * fluctuation * 10) / 10,
      collection: Math.round(data.collection * fluctuation),
      operational: Math.round(data.operational * fluctuation),
      siteQuality: Math.round(data.siteQuality * fluctuation),
      customerReview: Math.round(data.customerReview * fluctuation),
      riskResistance: Math.round(data.riskResistance * fluctuation),
      riskLevel: data.riskLevel,
    };
  }

  /**
   * 获取对比期标签
   */
  private getComparisonLabel(comparisonTarget: string): string {
    const labels: Record<string, string> = {
      last_month: '上月',
      last_week: '上周',
      last_year: '去年同期',
      same_category: '同类商户平均',
      same_floor: '同楼层平均',
    };
    return labels[comparisonTarget] || comparisonTarget;
  }

  /**
   * 获取对比期时间范围
   */
  private getBaselineTimeRange(comparisonTarget: string): TimeRange {
    const ranges: Record<string, TimeRange> = {
      last_month: { period: 'last_month' },
      last_week: { period: 'last_week' },
      last_year: { period: 'last_year' },
    };
    return ranges[comparisonTarget] || { period: 'last_month' };
  }
}

// 导出单例实例
export const comparisonExecutor = new ComparisonExecutor();
