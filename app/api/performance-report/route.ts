/**
 * 性能报告 API
 * GET /api/performance-report
 */

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // 动态导入，避免服务端初始化问题
    const { performanceMonitor } = await import('@/skills/ai-assistant/performance-monitor');
    const { queryCache } = await import('@/skills/ai-assistant/query-cache');

    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const timeRangeMs = searchParams.get('timeRange')
      ? parseInt(searchParams.get('timeRange')!)
      : undefined;

    // 生成报告
    const report = performanceMonitor.getReport(timeRangeMs);
    const cacheStats = queryCache.getStats();
    const layerComparison = performanceMonitor.getLayerComparison();

    // 计算性能提升
    const llmLayer = layerComparison.find(l => l.layer === 'llm');
    const cacheLayer = layerComparison.find(l => l.layer === 'cache');

    const speedImprovement = llmLayer && cacheLayer
      ? Math.round((1 - cacheLayer.avgExecutionTime / llmLayer.avgExecutionTime) * 100)
      : 0;

    const costReduction = Math.round((1 - report.llmCallRate) * 100);

    return NextResponse.json({
      success: true,
      report,
      cacheStats,
      layerComparison,
      summary: {
        speedImprovement: `${speedImprovement}%`,
        costReduction: `${costReduction}%`,
        accuracy: `${Math.round(report.averageConfidence * 100)}%`,
      },
    });
  } catch (error) {
    console.error('[API] Performance report error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
