/**
 * 性能监控模块
 * 用于监控意图识别的性能指标
 */

export interface ClassificationMetrics {
  method: 'cache' | 'forced_rule' | 'keyword' | 'llm' | 'fallback';
  responseTime: number;
  tokenUsage?: number;
  confidence: number;
  intent: string;
  timestamp: number;
}

export interface PerformanceReport {
  totalQueries: number;
  cacheHitRate: number;
  forcedRuleRate: number;
  keywordRate: number;
  llmCallRate: number;
  avgResponseTime: number;
  avgTokenUsage: number;
  estimatedMonthlyCost: number;
  avgConfidence: number;
}

export class PerformanceMonitor {
  private metrics: ClassificationMetrics[] = [];
  private maxMetrics = 10000; // 保留最近10000条记录

  /**
   * 记录分类指标
   */
  record(metric: ClassificationMetrics): void {
    this.metrics.push(metric);

    // 如果超过最大记录数，删除最旧的
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }

  /**
   * 获取性能报告
   */
  getReport(timeRange?: { start: number; end: number }): PerformanceReport {
    let filteredMetrics = this.metrics;

    // 如果指定了时间范围，过滤数据
    if (timeRange) {
      filteredMetrics = this.metrics.filter(
        m => m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
      );
    }

    const totalQueries = filteredMetrics.length;

    if (totalQueries === 0) {
      return {
        totalQueries: 0,
        cacheHitRate: 0,
        forcedRuleRate: 0,
        keywordRate: 0,
        llmCallRate: 0,
        avgResponseTime: 0,
        avgTokenUsage: 0,
        estimatedMonthlyCost: 0,
        avgConfidence: 0
      };
    }

    // 计算各层命中率
    const cacheHits = filteredMetrics.filter(m => m.method === 'cache').length;
    const forcedRuleHits = filteredMetrics.filter(m => m.method === 'forced_rule').length;
    const keywordHits = filteredMetrics.filter(m => m.method === 'keyword').length;
    const llmCalls = filteredMetrics.filter(m => m.method === 'llm').length;

    // 计算平均响应时间
    const totalResponseTime = filteredMetrics.reduce((sum, m) => sum + m.responseTime, 0);
    const avgResponseTime = totalResponseTime / totalQueries;

    // 计算平均Token消耗
    const llmMetrics = filteredMetrics.filter(m => m.method === 'llm' && m.tokenUsage);
    const totalTokenUsage = llmMetrics.reduce((sum, m) => sum + (m.tokenUsage || 0), 0);
    const avgTokenUsage = llmMetrics.length > 0 ? totalTokenUsage / llmMetrics.length : 0;

    // 估算月度成本（假设 $0.01/1K token）
    const dailyQueries = totalQueries; // 假设这是一天的数据
    const dailyLLMCalls = llmCalls;
    const monthlyLLMCalls = dailyLLMCalls * 30;
    const monthlyTokens = monthlyLLMCalls * avgTokenUsage;
    const estimatedMonthlyCost = (monthlyTokens / 1000) * 0.01;

    // 计算平均置信度
    const totalConfidence = filteredMetrics.reduce((sum, m) => sum + m.confidence, 0);
    const avgConfidence = totalConfidence / totalQueries;

    return {
      totalQueries,
      cacheHitRate: cacheHits / totalQueries,
      forcedRuleRate: forcedRuleHits / totalQueries,
      keywordRate: keywordHits / totalQueries,
      llmCallRate: llmCalls / totalQueries,
      avgResponseTime,
      avgTokenUsage,
      estimatedMonthlyCost,
      avgConfidence
    };
  }

  /**
   * 获取最近N条记录
   */
  getRecentMetrics(count: number = 100): ClassificationMetrics[] {
    return this.metrics.slice(-count);
  }

  /**
   * 清空记录
   */
  clear(): void {
    this.metrics = [];
    console.log('[PerformanceMonitor] Metrics cleared');
  }

  /**
   * 打印性能报告
   */
  printReport(timeRange?: { start: number; end: number }): void {
    const report = this.getReport(timeRange);

    console.log('\n========== Performance Report ==========');
    console.log(`Total Queries: ${report.totalQueries}`);
    console.log(`Cache Hit Rate: ${(report.cacheHitRate * 100).toFixed(2)}%`);
    console.log(`Forced Rule Rate: ${(report.forcedRuleRate * 100).toFixed(2)}%`);
    console.log(`Keyword Rate: ${(report.keywordRate * 100).toFixed(2)}%`);
    console.log(`LLM Call Rate: ${(report.llmCallRate * 100).toFixed(2)}%`);
    console.log(`Avg Response Time: ${report.avgResponseTime.toFixed(2)}ms`);
    console.log(`Avg Token Usage: ${report.avgTokenUsage.toFixed(2)}`);
    console.log(`Estimated Monthly Cost: $${report.estimatedMonthlyCost.toFixed(2)}`);
    console.log(`Avg Confidence: ${(report.avgConfidence * 100).toFixed(2)}%`);
    console.log('========================================\n');
  }

  /**
   * 检查是否达到目标指标
   */
  checkTargets(): {
    passed: boolean;
    failures: string[];
  } {
    const report = this.getReport();
    const failures: string[] = [];

    // 目标指标
    const targets = {
      cacheHitRate: 0.3,        // > 30%
      llmCallRate: 0.15,        // < 15%
      avgResponseTime: 500,     // < 500ms
      avgConfidence: 0.85       // > 85%
    };

    if (report.cacheHitRate < targets.cacheHitRate) {
      failures.push(`Cache hit rate too low: ${(report.cacheHitRate * 100).toFixed(2)}% (target: ${targets.cacheHitRate * 100}%)`);
    }

    if (report.llmCallRate > targets.llmCallRate) {
      failures.push(`LLM call rate too high: ${(report.llmCallRate * 100).toFixed(2)}% (target: < ${targets.llmCallRate * 100}%)`);
    }

    if (report.avgResponseTime > targets.avgResponseTime) {
      failures.push(`Avg response time too slow: ${report.avgResponseTime.toFixed(2)}ms (target: < ${targets.avgResponseTime}ms)`);
    }

    if (report.avgConfidence < targets.avgConfidence) {
      failures.push(`Avg confidence too low: ${(report.avgConfidence * 100).toFixed(2)}% (target: > ${targets.avgConfidence * 100}%)`);
    }

    return {
      passed: failures.length === 0,
      failures
    };
  }
}

/**
 * 导出单例
 */
export const performanceMonitor = new PerformanceMonitor();

/**
 * 定期打印性能报告（每小时）
 * 只在浏览器环境中运行
 */
if (typeof window !== 'undefined' && typeof setInterval !== 'undefined') {
  setInterval(() => {
    performanceMonitor.printReport();
  }, 3600000); // 1小时
}
