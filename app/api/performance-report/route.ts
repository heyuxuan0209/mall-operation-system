import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 动态导入以避免服务端/客户端问题
    const { performanceMonitor } = await import('@/skills/ai-assistant/performance-monitor');
    const { queryCache } = await import('@/skills/ai-assistant/query-cache');

    // 获取性能报告
    const report = performanceMonitor.getReport();

    // 检查目标达成情况
    const check = performanceMonitor.checkTargets();

    // 获取最近的指标
    const recentMetrics = performanceMonitor.getRecentMetrics(20);

    // 获取缓存统计
    const cacheStats = queryCache.getStats();

    return NextResponse.json({
      success: true,
      report,
      check,
      recentMetrics,
      cacheStats,
      summary: {
        totalQueries: report.totalQueries,
        cacheHitRate: `${(report.cacheHitRate * 100).toFixed(2)}%`,
        forcedRuleRate: `${(report.forcedRuleRate * 100).toFixed(2)}%`,
        keywordRate: `${(report.keywordRate * 100).toFixed(2)}%`,
        llmCallRate: `${(report.llmCallRate * 100).toFixed(2)}%`,
        avgResponseTime: `${report.avgResponseTime.toFixed(2)}ms`,
        avgTokenUsage: report.avgTokenUsage.toFixed(2),
        estimatedMonthlyCost: `$${report.estimatedMonthlyCost.toFixed(2)}`,
        avgConfidence: `${(report.avgConfidence * 100).toFixed(2)}%`,
        targetsPassed: check.passed,
        failures: check.failures
      }
    });
  } catch (error: any) {
    console.error('[API] Performance report error:', error);
    return NextResponse.json({
      success: false,
      error: error?.message || 'Failed to generate performance report',
      stack: error?.stack
    }, { status: 500 });
  }
}
