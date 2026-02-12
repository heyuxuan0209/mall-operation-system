/**
 * 性能监控 - Phase 1 优化
 * 🔥 修复：移除自动聚合定时器，改为按需聚合，避免服务端502错误
 */

export type ClassificationLayer = 'cache' | 'forced_rule' | 'keyword' | 'llm';

export interface ClassificationMetrics {
  timestamp: number;
  layer: ClassificationLayer;
  query: string;
  intent: string;
  confidence: number;
  executionTime: number;
  cacheHit?: boolean;
  llmTokens?: number;
}

export interface PerformanceReport {
  totalClassifications: number;
  layerDistribution: Record<ClassificationLayer, number>;
  averageExecutionTime: number;
  cacheHitRate: number;
  llmCallRate: number;
  averageConfidence: number;
  totalLLMTokens: number;
  timeRange: {
    start: string;
    end: string;
  };
}

export class PerformanceMonitor {
  private metrics: ClassificationMetrics[] = [];
  private readonly maxMetrics = 10000; // 最多保留10000条记录
  private readonly retentionTime = 86400000; // 24小时

  /**
   * 记录分类指标
   */
  record(metric: ClassificationMetrics): void {
    this.metrics.push(metric);

    // 按需清理：如果超过最大记录数，删除最旧的
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  /**
   * 获取性能报告（按需生成）
   */
  getReport(timeRangeMs?: number): PerformanceReport {
    // 先清理过期数据
    this.cleanupOldMetrics();

    const now = Date.now();
    const startTime = timeRangeMs ? now - timeRangeMs : this.metrics[0]?.timestamp || now;

    // 过滤时间范围内的指标
    const relevantMetrics = this.metrics.filter(m => m.timestamp >= startTime);

    if (relevantMetrics.length === 0) {
      return this.getEmptyReport();
    }

    // 计算各层分布
    const layerDistribution: Record<ClassificationLayer, number> = {
      cache: 0,
      forced_rule: 0,
      keyword: 0,
      llm: 0,
    };

    let totalExecutionTime = 0;
    let totalConfidence = 0;
    let cacheHits = 0;
    let llmCalls = 0;
    let totalLLMTokens = 0;

    for (const metric of relevantMetrics) {
      layerDistribution[metric.layer]++;
      totalExecutionTime += metric.executionTime;
      totalConfidence += metric.confidence;

      if (metric.cacheHit) {
        cacheHits++;
      }

      if (metric.layer === 'llm') {
        llmCalls++;
        totalLLMTokens += metric.llmTokens || 0;
      }
    }

    const total = relevantMetrics.length;

    return {
      totalClassifications: total,
      layerDistribution,
      averageExecutionTime: totalExecutionTime / total,
      cacheHitRate: cacheHits / total,
      llmCallRate: llmCalls / total,
      averageConfidence: totalConfidence / total,
      totalLLMTokens,
      timeRange: {
        start: new Date(relevantMetrics[0].timestamp).toISOString(),
        end: new Date(relevantMetrics[relevantMetrics.length - 1].timestamp).toISOString(),
      },
    };
  }

  /**
   * 清理过期指标（按需调用）
   */
  private cleanupOldMetrics(): void {
    const cutoff = Date.now() - this.retentionTime;
    const originalLength = this.metrics.length;

    this.metrics = this.metrics.filter(m => m.timestamp > cutoff);

    const removed = originalLength - this.metrics.length;
    if (removed > 0) {
      console.log(`[PerformanceMonitor] Cleaned up ${removed} old metrics`);
    }
  }

  /**
   * 获取空报告
   */
  private getEmptyReport(): PerformanceReport {
    return {
      totalClassifications: 0,
      layerDistribution: {
        cache: 0,
        forced_rule: 0,
        keyword: 0,
        llm: 0,
      },
      averageExecutionTime: 0,
      cacheHitRate: 0,
      llmCallRate: 0,
      averageConfidence: 0,
      totalLLMTokens: 0,
      timeRange: {
        start: new Date().toISOString(),
        end: new Date().toISOString(),
      },
    };
  }

  /**
   * 获取最近N条记录
   */
  getRecentMetrics(count: number = 100): ClassificationMetrics[] {
    return this.metrics.slice(-count);
  }

  /**
   * 清空所有指标
   */
  clear(): void {
    this.metrics = [];
  }

  /**
   * 获取当前指标数量
   */
  getMetricsCount(): number {
    return this.metrics.length;
  }

  /**
   * 获取层级性能对比
   */
  getLayerComparison(): Array<{
    layer: ClassificationLayer;
    count: number;
    avgExecutionTime: number;
    avgConfidence: number;
  }> {
    const layerStats = new Map<ClassificationLayer, {
      count: number;
      totalTime: number;
      totalConfidence: number;
    }>();

    // 初始化
    const layers: ClassificationLayer[] = ['cache', 'forced_rule', 'keyword', 'llm'];
    layers.forEach(layer => {
      layerStats.set(layer, { count: 0, totalTime: 0, totalConfidence: 0 });
    });

    // 统计
    for (const metric of this.metrics) {
      const stats = layerStats.get(metric.layer)!;
      stats.count++;
      stats.totalTime += metric.executionTime;
      stats.totalConfidence += metric.confidence;
    }

    // 计算平均值
    return layers.map(layer => {
      const stats = layerStats.get(layer)!;
      return {
        layer,
        count: stats.count,
        avgExecutionTime: stats.count > 0 ? stats.totalTime / stats.count : 0,
        avgConfidence: stats.count > 0 ? stats.totalConfidence / stats.count : 0,
      };
    });
  }

  /**
   * 获取性能趋势（按小时分组）
   */
  getPerformanceTrend(hours: number = 24): Array<{
    hour: string;
    count: number;
    avgExecutionTime: number;
    cacheHitRate: number;
  }> {
    const now = Date.now();
    const startTime = now - hours * 3600000;
    const relevantMetrics = this.metrics.filter(m => m.timestamp >= startTime);

    // 按小时分组
    const hourlyStats = new Map<string, {
      count: number;
      totalTime: number;
      cacheHits: number;
    }>();

    for (const metric of relevantMetrics) {
      const hour = new Date(metric.timestamp).toISOString().slice(0, 13); // YYYY-MM-DDTHH

      if (!hourlyStats.has(hour)) {
        hourlyStats.set(hour, { count: 0, totalTime: 0, cacheHits: 0 });
      }

      const stats = hourlyStats.get(hour)!;
      stats.count++;
      stats.totalTime += metric.executionTime;
      if (metric.cacheHit) {
        stats.cacheHits++;
      }
    }

    // 转换为数组并排序
    return Array.from(hourlyStats.entries())
      .map(([hour, stats]) => ({
        hour,
        count: stats.count,
        avgExecutionTime: stats.totalTime / stats.count,
        cacheHitRate: stats.cacheHits / stats.count,
      }))
      .sort((a, b) => a.hour.localeCompare(b.hour));
  }
}

// 导出单例
export const performanceMonitor = new PerformanceMonitor();
