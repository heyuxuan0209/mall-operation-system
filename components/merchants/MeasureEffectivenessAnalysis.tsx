'use client';

import React from 'react';
import { Task } from '@/types';
import { MeasureEffectivenessAnalyzer } from '@/utils/measureEffectivenessAnalyzer';

interface MeasureEffectivenessAnalysisProps {
  tasks: Task[];
}

/**
 * 措施有效性分析组件
 * 展示所有帮扶任务的措施效果统计和分析
 */
export function MeasureEffectivenessAnalysis({ tasks }: MeasureEffectivenessAnalysisProps) {
  // 如果没有任务，不显示
  if (tasks.length === 0) {
    return null;
  }

  // 获取摘要统计
  const summary = MeasureEffectivenessAnalyzer.getSummaryStats(tasks);

  // 获取措施排行
  const measureRanking = MeasureEffectivenessAnalyzer.analyzeMeasures(tasks);

  // 获取按维度分析
  const dimensionAnalysis = MeasureEffectivenessAnalyzer.analyzeByDimension(tasks);

  return (
    <div className="mt-6 space-y-6">
      {/* 标题 */}
      <div className="flex items-center gap-2">
        <i className="fas fa-chart-line text-indigo-600"></i>
        <h3 className="text-lg font-semibold text-gray-900">措施有效性分析</h3>
      </div>

      {/* 摘要统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600 mb-1">总措施数</div>
          <div className="text-2xl font-bold text-gray-900">{summary.totalMeasures}</div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
          <div className="text-sm text-green-700 mb-1">高效措施</div>
          <div className="text-2xl font-bold text-green-700">
            {summary.highEffectCount}
            <span className="text-sm ml-1">
              ({summary.totalMeasures > 0
                ? Math.round((summary.highEffectCount / summary.totalMeasures) * 100)
                : 0}%)
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
          <div className="text-sm text-yellow-700 mb-1">中效措施</div>
          <div className="text-2xl font-bold text-yellow-700">
            {summary.mediumEffectCount}
            <span className="text-sm ml-1">
              ({summary.totalMeasures > 0
                ? Math.round((summary.mediumEffectCount / summary.totalMeasures) * 100)
                : 0}%)
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
          <div className="text-sm text-red-700 mb-1">低效措施</div>
          <div className="text-2xl font-bold text-red-700">
            {summary.lowEffectCount}
            <span className="text-sm ml-1">
              ({summary.totalMeasures > 0
                ? Math.round((summary.lowEffectCount / summary.totalMeasures) * 100)
                : 0}%)
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-700 mb-1">平均改善值</div>
          <div className="text-2xl font-bold text-blue-700">+{summary.avgImprovementAll}分</div>
        </div>
      </div>

      {/* 措施效果排行榜 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <i className="fas fa-trophy text-yellow-500"></i>
          措施效果排行榜（Top 10）
        </h4>

        <div className="space-y-3">
          {measureRanking.slice(0, 10).map((stat, index) => (
            <div
              key={stat.measure}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {/* 排名 */}
              <div className="flex items-center gap-3 flex-1">
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                    ${index === 0 ? 'bg-yellow-100 text-yellow-700' : ''}
                    ${index === 1 ? 'bg-gray-200 text-gray-700' : ''}
                    ${index === 2 ? 'bg-orange-100 text-orange-700' : ''}
                    ${index > 2 ? 'bg-gray-100 text-gray-600' : ''}
                  `}
                >
                  {index + 1}
                </div>

                {/* 措施名称 */}
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{stat.measure}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    使用{stat.totalUses}次 · 目标维度: {stat.targetDimensions.join('、')}
                  </div>
                </div>
              </div>

              {/* 平均改善值 */}
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">+{stat.avgImprovement}分</div>
                  <div className="text-xs text-gray-500">平均改善</div>
                </div>

                {/* 成功率 */}
                <div className="text-right">
                  <div
                    className={`
                      text-sm font-semibold
                      ${stat.successRate >= 70 ? 'text-green-600' : ''}
                      ${stat.successRate >= 40 && stat.successRate < 70 ? 'text-yellow-600' : ''}
                      ${stat.successRate < 40 ? 'text-red-600' : ''}
                    `}
                  >
                    {stat.successRate}%
                  </div>
                  <div className="text-xs text-gray-500">成功率</div>
                </div>

                {/* 有效性标签 */}
                <div className="flex gap-1">
                  {stat.highEffectCount > 0 && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                      高效×{stat.highEffectCount}
                    </span>
                  )}
                  {stat.mediumEffectCount > 0 && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">
                      中效×{stat.mediumEffectCount}
                    </span>
                  )}
                  {stat.lowEffectCount > 0 && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                      低效×{stat.lowEffectCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 按维度分析 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <i className="fas fa-layer-group text-indigo-600"></i>
          按维度措施分析
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dimensionAnalysis.map(dimStats => (
            <div key={dimStats.dimension} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="font-semibold text-gray-900 mb-3">{dimStats.dimension}</div>

              <div className="space-y-2">
                {dimStats.measures.slice(0, 3).map((measure, index) => (
                  <div key={measure.measure} className="flex items-center justify-between">
                    <div className="flex-1 text-sm text-gray-700 truncate pr-2" title={measure.measure}>
                      {index + 1}. {measure.measure.substring(0, 20)}
                      {measure.measure.length > 20 ? '...' : ''}
                    </div>
                    <div className="text-sm font-semibold text-green-600">
                      +{measure.avgImprovement}
                    </div>
                  </div>
                ))}

                {dimStats.measures.length === 0 && (
                  <div className="text-sm text-gray-500 italic">暂无措施</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 提示说明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <i className="fas fa-info-circle text-blue-600 mt-0.5"></i>
          <div className="text-sm text-blue-800">
            <strong>说明</strong>: 措施有效性基于实际改善值和使用频次综合评估。
            <strong>成功率</strong> = 高效次数 / 总使用次数。
            <strong>平均改善值</strong> = 总改善值 / 使用次数。
          </div>
        </div>
      </div>
    </div>
  );
}

export default MeasureEffectivenessAnalysis;
