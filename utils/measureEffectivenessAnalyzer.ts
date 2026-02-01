import { Task, MeasureEffect } from '@/types';

/**
 * 措施效果统计结果类型
 */
export interface MeasureEffectivenessStats {
  measure: string;                    // 措施名称
  totalUses: number;                  // 使用次数
  totalImprovement: number;           // 总改善值
  avgImprovement: number;             // 平均改善值
  highEffectCount: number;            // 高效次数
  mediumEffectCount: number;          // 中效次数
  lowEffectCount: number;             // 低效次数
  successRate: number;                // 成功率（高效次数/总使用次数）
  targetDimensions: string[];         // 目标维度列表
}

/**
 * 按维度的措施效果统计
 */
export interface DimensionMeasureStats {
  dimension: string;                  // 维度名称
  measures: Array<{
    measure: string;
    avgImprovement: number;
    uses: number;
  }>;
}

/**
 * 措施有效性分析器工具类
 */
export class MeasureEffectivenessAnalyzer {
  /**
   * 分析所有任务的措施效果
   * @param tasks 任务列表
   * @returns 措施效果统计数组（按平均改善值降序排列）
   */
  static analyzeMeasures(tasks: Task[]): MeasureEffectivenessStats[] {
    const measureMap = new Map<string, {
      totalUses: number;
      totalImprovement: number;
      highEffectCount: number;
      mediumEffectCount: number;
      lowEffectCount: number;
      targetDimensions: Set<string>;
    }>();

    // 收集所有措施数据
    tasks.forEach(task => {
      if (!task.measureEffects) return;

      task.measureEffects.forEach(effect => {
        if (!measureMap.has(effect.measure)) {
          measureMap.set(effect.measure, {
            totalUses: 0,
            totalImprovement: 0,
            highEffectCount: 0,
            mediumEffectCount: 0,
            lowEffectCount: 0,
            targetDimensions: new Set(),
          });
        }

        const stats = measureMap.get(effect.measure)!;
        stats.totalUses++;
        stats.totalImprovement += effect.improvement;
        stats.targetDimensions.add(this.getDimensionLabel(effect.targetDimension));

        // 统计有效性等级
        if (effect.effectiveness === 'high') stats.highEffectCount++;
        else if (effect.effectiveness === 'medium') stats.mediumEffectCount++;
        else if (effect.effectiveness === 'low') stats.lowEffectCount++;
      });
    });

    // 转换为数组并计算派生指标
    const results: MeasureEffectivenessStats[] = Array.from(measureMap.entries()).map(
      ([measure, stats]) => ({
        measure,
        totalUses: stats.totalUses,
        totalImprovement: stats.totalImprovement,
        avgImprovement: Math.round((stats.totalImprovement / stats.totalUses) * 10) / 10,
        highEffectCount: stats.highEffectCount,
        mediumEffectCount: stats.mediumEffectCount,
        lowEffectCount: stats.lowEffectCount,
        successRate: Math.round((stats.highEffectCount / stats.totalUses) * 100),
        targetDimensions: Array.from(stats.targetDimensions),
      })
    );

    // 按平均改善值降序排序
    return results.sort((a, b) => b.avgImprovement - a.avgImprovement);
  }

  /**
   * 按维度分析措施效果
   * @param tasks 任务列表
   * @returns 按维度分组的措施效果统计
   */
  static analyzeByDimension(tasks: Task[]): DimensionMeasureStats[] {
    const dimensionMap = new Map<string, Map<string, { totalImprovement: number; uses: number }>>();

    // 收集按维度分组的措施数据
    tasks.forEach(task => {
      if (!task.measureEffects) return;

      task.measureEffects.forEach(effect => {
        const dimensionLabel = this.getDimensionLabel(effect.targetDimension);

        if (!dimensionMap.has(dimensionLabel)) {
          dimensionMap.set(dimensionLabel, new Map());
        }

        const measureMap = dimensionMap.get(dimensionLabel)!;

        if (!measureMap.has(effect.measure)) {
          measureMap.set(effect.measure, { totalImprovement: 0, uses: 0 });
        }

        const measureStats = measureMap.get(effect.measure)!;
        measureStats.totalImprovement += effect.improvement;
        measureStats.uses++;
      });
    });

    // 转换为数组并排序
    const results: DimensionMeasureStats[] = [];

    dimensionMap.forEach((measureMap, dimension) => {
      const measures = Array.from(measureMap.entries())
        .map(([measure, stats]) => ({
          measure,
          avgImprovement: Math.round((stats.totalImprovement / stats.uses) * 10) / 10,
          uses: stats.uses,
        }))
        .sort((a, b) => b.avgImprovement - a.avgImprovement);

      results.push({ dimension, measures });
    });

    return results;
  }

  /**
   * 获取措施效果摘要统计
   * @param tasks 任务列表
   * @returns 摘要统计对象
   */
  static getSummaryStats(tasks: Task[]): {
    totalMeasures: number;
    highEffectCount: number;
    mediumEffectCount: number;
    lowEffectCount: number;
    avgImprovementAll: number;
  } {
    let totalMeasures = 0;
    let highEffectCount = 0;
    let mediumEffectCount = 0;
    let lowEffectCount = 0;
    let totalImprovement = 0;

    tasks.forEach(task => {
      if (!task.measureEffects) return;

      task.measureEffects.forEach(effect => {
        totalMeasures++;
        totalImprovement += effect.improvement;

        if (effect.effectiveness === 'high') highEffectCount++;
        else if (effect.effectiveness === 'medium') mediumEffectCount++;
        else if (effect.effectiveness === 'low') lowEffectCount++;
      });
    });

    return {
      totalMeasures,
      highEffectCount,
      mediumEffectCount,
      lowEffectCount,
      avgImprovementAll: totalMeasures > 0 ? Math.round((totalImprovement / totalMeasures) * 10) / 10 : 0,
    };
  }

  /**
   * 获取特定维度的最佳措施
   * @param tasks 任务列表
   * @param dimension 维度（collection/operational/siteQuality/customerReview/riskResistance）
   * @param limit 返回数量（默认3）
   * @returns 该维度的最佳措施列表
   */
  static getBestMeasuresForDimension(
    tasks: Task[],
    dimension: keyof Task['initialMetrics'],
    limit: number = 3
  ): Array<{ measure: string; avgImprovement: number; uses: number }> {
    const measureMap = new Map<string, { totalImprovement: number; uses: number }>();

    tasks.forEach(task => {
      if (!task.measureEffects) return;

      task.measureEffects
        .filter(effect => effect.targetDimension === dimension)
        .forEach(effect => {
          if (!measureMap.has(effect.measure)) {
            measureMap.set(effect.measure, { totalImprovement: 0, uses: 0 });
          }

          const stats = measureMap.get(effect.measure)!;
          stats.totalImprovement += effect.improvement;
          stats.uses++;
        });
    });

    return Array.from(measureMap.entries())
      .map(([measure, stats]) => ({
        measure,
        avgImprovement: Math.round((stats.totalImprovement / stats.uses) * 10) / 10,
        uses: stats.uses,
      }))
      .sort((a, b) => b.avgImprovement - a.avgImprovement)
      .slice(0, limit);
  }

  /**
   * 将维度键转换为中文标签
   */
  private static getDimensionLabel(dimension: string): string {
    const labels: Record<string, string> = {
      collection: '租金缴纳',
      operational: '经营表现',
      siteQuality: '店铺品质',
      customerReview: '顾客满意',
      riskResistance: '抗风险能力',
    };

    return labels[dimension] || dimension;
  }
}

/**
 * 默认导出分析器类
 */
export default MeasureEffectivenessAnalyzer;
