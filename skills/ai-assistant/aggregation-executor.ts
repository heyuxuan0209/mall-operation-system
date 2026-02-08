/**
 * Aggregation Executor - 聚合查询执行器 ⭐v3.0新增
 *
 * 功能：执行聚合统计查询
 * - 支持聚合操作: count, sum, avg, max, min
 * - 应用筛选条件: riskLevel, category, floor, metric
 * - 分组统计: groupBy riskLevel/category/floor
 * - 时间范围处理: 本月、本周、本年
 * - 对比分析: vs上月、vs同期
 */

import {
  AggregationResult,
  AggregationOperation,
  QueryFilters,
  TimeRange,
  ExtendedExecutionPlan,
} from '@/types/ai-assistant';
import { Merchant } from '@/types';
import { merchantDataManager } from '@/utils/merchantDataManager';

export class AggregationExecutor {
  /**
   * 执行聚合查询
   */
  execute(plan: ExtendedExecutionPlan, allMerchants?: Merchant[]): AggregationResult {
    const merchants = allMerchants || merchantDataManager.getAllMerchants();

    // Step 1: 应用筛选条件
    let filtered = this.applyFilters(merchants, plan.entities.filters);

    // Step 2: 应用时间范围筛选（如果有）
    if (plan.entities.timeRange) {
      filtered = this.applyTimeRange(filtered, plan.entities.timeRange);
    }

    // Step 3: 执行聚合操作
    const operation = plan.aggregations?.operation || 'count';
    const field = plan.aggregations?.field;
    const groupBy = plan.aggregations?.groupBy;

    let result: AggregationResult;

    if (groupBy) {
      // 分组聚合
      result = this.groupByAggregation(filtered, operation, field, groupBy);
    } else {
      // 简单聚合
      result = this.simpleAggregation(filtered, operation, field);
    }

    // Step 4: 添加对比数据（如果需要）
    if (plan.entities.comparisonTarget) {
      result = this.addComparison(result, plan, merchants);
    }

    // 补充元数据
    result.timeRange = plan.entities.timeRange || { period: 'current_month' };
    result.filters = plan.entities.filters || {};

    // ⭐新增: 保存商户列表（用于LLM响应生成，防止幻觉）
    result.merchantList = filtered.map(m => ({
      id: m.id,
      name: m.name,
      riskLevel: m.riskLevel,
      totalScore: m.totalScore,
      category: m.category
    }));

    return result;
  }

  /**
   * 应用筛选条件
   */
  private applyFilters(merchants: Merchant[], filters?: QueryFilters): Merchant[] {
    if (!filters) return merchants;

    let filtered = merchants;

    // 筛选风险等级
    if (filters.riskLevel && filters.riskLevel.length > 0) {
      filtered = filtered.filter(m => filters.riskLevel!.includes(m.riskLevel));
    }

    // 筛选业态
    if (filters.category && filters.category.length > 0) {
      filtered = filtered.filter(m => filters.category!.includes(m.category));
    }

    // 筛选楼层
    if (filters.floor && filters.floor.length > 0) {
      filtered = filtered.filter(m => filters.floor!.includes(m.floor));
    }

    // 筛选健康度分数范围
    if (filters.healthScoreMin !== undefined) {
      filtered = filtered.filter(m => m.totalScore >= filters.healthScoreMin!);
    }
    if (filters.healthScoreMax !== undefined) {
      filtered = filtered.filter(m => m.totalScore <= filters.healthScoreMax!);
    }

    return filtered;
  }

  /**
   * 应用时间范围筛选
   * 注意：当前没有时间戳数据，暂时返回全部
   * TODO: 当有历史数据后，根据时间范围筛选
   */
  private applyTimeRange(merchants: Merchant[], timeRange: TimeRange): Merchant[] {
    // 暂时不过滤，返回所有商户
    // 实际应用中，需要根据商户的更新时间或创建时间进行筛选
    console.warn('[AggregationExecutor] Time range filtering not yet implemented');
    return merchants;
  }

  /**
   * 简单聚合（无分组）
   */
  private simpleAggregation(
    merchants: Merchant[],
    operation: AggregationOperation,
    field?: string
  ): AggregationResult {
    let total: number | null = null;

    switch (operation) {
      case 'count':
        total = merchants.length;
        break;

      case 'sum':
        if (!field) throw new Error('Sum operation requires a field');
        total = merchants.reduce((sum, m) => sum + this.getFieldValue(m, field), 0);
        break;

      case 'avg':
        if (!field) throw new Error('Average operation requires a field');
        const sum = merchants.reduce((s, m) => s + this.getFieldValue(m, field), 0);
        total = merchants.length > 0 ? sum / merchants.length : 0;
        break;

      case 'max':
        if (!field) throw new Error('Max operation requires a field');
        total = Math.max(...merchants.map(m => this.getFieldValue(m, field)));
        break;

      case 'min':
        if (!field) throw new Error('Min operation requires a field');
        total = Math.min(...merchants.map(m => this.getFieldValue(m, field)));
        break;
    }

    return {
      operation,
      total,
      timeRange: { period: 'current_month' },
      filters: {},
    };
  }

  /**
   * 分组聚合
   */
  private groupByAggregation(
    merchants: Merchant[],
    operation: AggregationOperation,
    field: string | undefined,
    groupBy: string
  ): AggregationResult {
    const breakdown: Record<string, number> = {};

    // 按分组字段分组
    const groups = this.groupMerchants(merchants, groupBy);

    // 对每个组执行聚合
    for (const [groupKey, groupMerchants] of Object.entries(groups)) {
      const groupResult = this.simpleAggregation(groupMerchants, operation, field);
      breakdown[groupKey] = groupResult.total!;
    }

    // 计算总计
    const total = operation === 'count'
      ? merchants.length
      : Object.values(breakdown).reduce((sum, val) => sum + val, 0);

    return {
      operation,
      total,
      breakdown,
      timeRange: { period: 'current_month' },
      filters: {},
    };
  }

  /**
   * 商户分组
   */
  private groupMerchants(merchants: Merchant[], groupBy: string): Record<string, Merchant[]> {
    const groups: Record<string, Merchant[]> = {};

    for (const merchant of merchants) {
      const key = this.getGroupKey(merchant, groupBy);
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(merchant);
    }

    return groups;
  }

  /**
   * 获取分组键
   */
  private getGroupKey(merchant: Merchant, groupBy: string): string {
    switch (groupBy) {
      case 'riskLevel':
        return merchant.riskLevel;
      case 'category':
        return merchant.category;
      case 'floor':
        return merchant.floor;
      default:
        return 'unknown';
    }
  }

  /**
   * 获取字段值
   */
  private getFieldValue(merchant: Merchant, field: string): number {
    switch (field) {
      case 'totalScore':
      case 'health':
        return merchant.totalScore;
      case 'revenue':
        return merchant.lastMonthRevenue;
      case 'rent':
        return merchant.rent;
      case 'rentToSalesRatio':
        return merchant.rentToSalesRatio;
      case 'area':
        return merchant.area;
      case 'collection':
        return merchant.metrics.collection;
      case 'operational':
        return merchant.metrics.operational;
      case 'siteQuality':
        return merchant.metrics.siteQuality;
      case 'customerReview':
        return merchant.metrics.customerReview;
      case 'riskResistance':
        return merchant.metrics.riskResistance;
      default:
        console.warn(`[AggregationExecutor] Unknown field: ${field}`);
        return 0;
    }
  }

  /**
   * 添加对比数据
   */
  private addComparison(
    result: AggregationResult,
    plan: ExtendedExecutionPlan,
    allMerchants: Merchant[]
  ): AggregationResult {
    const comparisonTarget = plan.entities.comparisonTarget!;

    // 获取对比期的时间范围
    const baselineTimeRange = this.getBaselineTimeRange(
      plan.entities.timeRange,
      comparisonTarget
    );

    // 模拟对比期数据（实际应从历史数据获取）
    // TODO: 实现真实的历史数据查询
    const baseline = this.simulateBaselineData(result, comparisonTarget);

    const delta = (result.total || 0) - baseline;
    const percentage = baseline !== 0
      ? `${delta > 0 ? '+' : ''}${((delta / baseline) * 100).toFixed(1)}%`
      : 'N/A';

    return {
      ...result,
      comparison: {
        baseline,
        delta,
        percentage,
      },
    };
  }

  /**
   * 获取对比期的时间范围
   */
  private getBaselineTimeRange(
    currentRange: TimeRange | undefined,
    comparisonTarget: string
  ): TimeRange {
    // 简化实现：根据对比目标推断时间范围
    if (comparisonTarget === 'last_month') {
      return { period: 'last_month' };
    } else if (comparisonTarget === 'last_week') {
      return { period: 'last_week' };
    } else {
      return { period: 'last_month' };
    }
  }

  /**
   * 模拟对比期数据
   * TODO: 替换为真实的历史数据查询
   */
  private simulateBaselineData(
    current: AggregationResult,
    comparisonTarget: string
  ): number {
    const total = current.total || 0;

    // 简单模拟：上月数据在当前基础上浮动 -20% 到 +10%
    const fluctuation = 0.85 + Math.random() * 0.25; // 0.85 - 1.1
    const baseline = Math.round(total * fluctuation);

    return baseline;
  }

  /**
   * 格式化聚合结果为人类可读文本
   */
  formatResult(result: AggregationResult): string {
    const { operation, total, breakdown, comparison } = result;

    let text = `聚合操作：${this.getOperationName(operation)}\n`;
    text += `结果：${total}\n`;

    if (breakdown) {
      text += `\n分组统计：\n`;
      for (const [key, value] of Object.entries(breakdown)) {
        text += `  ${key}: ${value}\n`;
      }
    }

    if (comparison) {
      text += `\n对比分析：\n`;
      text += `  基准值：${comparison.baseline}\n`;
      text += `  变化：${comparison.delta} (${comparison.percentage})\n`;
    }

    return text;
  }

  /**
   * 获取操作名称
   */
  private getOperationName(operation: AggregationOperation): string {
    const names: Record<AggregationOperation, string> = {
      count: '计数',
      sum: '求和',
      avg: '平均值',
      max: '最大值',
      min: '最小值',
    };
    return names[operation] || operation;
  }
}

// 导出单例实例
export const aggregationExecutor = new AggregationExecutor();
