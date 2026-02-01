'use client';

import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
} from 'recharts';
import { HistoryTrendPoint } from '@/types';

interface HealthScoreTrendChartProps {
  trendPoints: HistoryTrendPoint[];
  showDimensions?: boolean; // 是否显示5维度
}

/**
 * 健康度趋势折线图组件
 * 展示商户历史健康度变化趋势
 */
export default function HealthScoreTrendChart({
  trendPoints,
  showDimensions = false,
}: HealthScoreTrendChartProps) {
  const [selectedDimension, setSelectedDimension] = useState<string | null>(null);

  // 格式化日期
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
    });
  };

  // 格式化完整日期（用于Tooltip）
  const formatFullDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // 准备图表数据
  const chartData = trendPoints.map(point => ({
    date: formatDate(point.date),
    fullDate: formatFullDate(point.date),
    totalScore: point.totalScore,
    collection: point.metrics.collection,
    operational: point.metrics.operational,
    siteQuality: point.metrics.siteQuality,
    customerReview: point.metrics.customerReview,
    riskResistance: point.metrics.riskResistance,
    riskLevel: point.riskLevel,
    events: point.events,
  }));

  // 维度配置
  const dimensions = [
    { key: 'collection', label: '租金缴纳', color: '#3b82f6' },
    { key: 'operational', label: '经营表现', color: '#10b981' },
    { key: 'siteQuality', label: '现场品质', color: '#f59e0b' },
    { key: 'customerReview', label: '顾客满意度', color: '#8b5cf6' },
    { key: 'riskResistance', label: '抗风险能力', color: '#ef4444' },
  ];

  // 自定义Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      return (
        <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs">
          <div className="font-semibold text-slate-900 mb-2">
            {data.fullDate}
          </div>

          {/* 健康度总分 */}
          <div className="flex items-center justify-between gap-4 mb-2 pb-2 border-b border-slate-100">
            <span className="text-slate-600">健康度:</span>
            <span className="font-bold text-slate-900 text-sm">
              {data.totalScore}分
            </span>
          </div>

          {/* 5维度 */}
          {showDimensions && (
            <div className="space-y-1">
              {dimensions.map(dim => (
                <div key={dim.key} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: dim.color }}
                    ></div>
                    <span className="text-slate-600">{dim.label}:</span>
                  </div>
                  <span className="font-medium text-slate-900">
                    {data[dim.key]}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* 风险等级 */}
          <div className="mt-2 pt-2 border-t border-slate-100">
            <span className="text-slate-600">风险等级: </span>
            <span className="font-medium">
              {data.riskLevel === 'critical' ? '极高风险' :
               data.riskLevel === 'high' ? '高风险' :
               data.riskLevel === 'medium' ? '中风险' :
               data.riskLevel === 'low' ? '低风险' : '无风险'}
            </span>
          </div>

          {/* 事件标记 */}
          {data.events && data.events.length > 0 && (
            <div className="mt-2 pt-2 border-t border-slate-100">
              <div className="text-slate-600 mb-1">事件:</div>
              {data.events.map((event: any, idx: number) => (
                <div key={idx} className="text-blue-600 flex items-center gap-1">
                  <i className="fa-solid fa-bookmark text-xs"></i>
                  <span>{event.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // 自定义图例
  const CustomLegend = () => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        <div className="flex items-center gap-1 text-xs">
          <div className="w-3 h-0.5 bg-slate-600"></div>
          <span className="text-slate-600">健康度总分</span>
        </div>
        {showDimensions && selectedDimension && dimensions.map(dim => (
          selectedDimension === dim.key && (
            <div key={dim.key} className="flex items-center gap-1 text-xs">
              <div className="w-3 h-0.5" style={{ backgroundColor: dim.color }}></div>
              <span className="text-slate-600">{dim.label}</span>
            </div>
          )
        ))}
      </div>
    );
  };

  if (trendPoints.length === 0) {
    return (
      <div className="bg-slate-50 rounded-lg p-8 text-center">
        <i className="fa-solid fa-chart-line text-4xl text-slate-300 mb-3"></i>
        <p className="text-slate-500 text-sm">暂无历史趋势数据</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 维度选择器 */}
      {showDimensions && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedDimension(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              selectedDimension === null
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            总分
          </button>
          {dimensions.map(dim => (
            <button
              key={dim.key}
              onClick={() => setSelectedDimension(dim.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                selectedDimension === dim.key
                  ? 'text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              style={
                selectedDimension === dim.key
                  ? { backgroundColor: dim.color }
                  : {}
              }
            >
              {dim.label}
            </button>
          ))}
        </div>
      )}

      {/* 图表 */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={chartData}>
            <defs>
              {/* 渐变背景（风险等级区间） */}
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.1} />
                <stop offset="50%" stopColor="#f59e0b" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0.1} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />

            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              stroke="#64748b"
            />

            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11 }}
              stroke="#64748b"
            />

            <Tooltip content={<CustomTooltip />} />

            {/* 风险等级参考线 */}
            <ReferenceLine y={90} stroke="#10b981" strokeDasharray="3 3" strokeWidth={1} />
            <ReferenceLine y={80} stroke="#84cc16" strokeDasharray="3 3" strokeWidth={1} />
            <ReferenceLine y={70} stroke="#f59e0b" strokeDasharray="3 3" strokeWidth={1} />
            <ReferenceLine y={60} stroke="#ef4444" strokeDasharray="3 3" strokeWidth={1} />

            {/* 健康度总分线 */}
            <Line
              type="monotone"
              dataKey="totalScore"
              stroke="#334155"
              strokeWidth={2}
              dot={{ r: 4, fill: '#334155' }}
              activeDot={{ r: 6 }}
            />

            {/* 5维度线（如果选中） */}
            {showDimensions && selectedDimension && (
              <Line
                type="monotone"
                dataKey={selectedDimension}
                stroke={dimensions.find(d => d.key === selectedDimension)?.color}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>

        {/* 图例 */}
        <CustomLegend />

        {/* 风险等级说明 */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-slate-600">无风险 (≥90)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-slate-600">低风险 (80-89)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-slate-600">中风险 (70-79)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-slate-600">高风险 (60-69)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-slate-600">极高风险 (&lt;60)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
