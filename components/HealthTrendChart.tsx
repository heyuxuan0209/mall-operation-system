'use client';

import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

interface HealthDataPoint {
  date: string;
  score: number;
  predicted?: boolean;
}

interface HealthTrendChartProps {
  merchantName: string;
  historicalData?: HealthDataPoint[];
  currentScore: number;
  showPrediction?: boolean;
}

export default function HealthTrendChart({
  merchantName,
  historicalData,
  currentScore,
  showPrediction = true
}: HealthTrendChartProps) {
  // 生成历史数据（如果没有提供）
  const data = useMemo(() => {
    if (historicalData && historicalData.length > 0) {
      return historicalData;
    }

    // 生成模拟的6个月历史数据
    const months = 6;
    const historical: HealthDataPoint[] = [];
    const today = new Date();

    // 根据当前分数生成合理的历史趋势
    const trend = currentScore < 60 ? -1 : currentScore > 80 ? 1 : 0;
    const volatility = 5; // 波动幅度

    for (let i = months; i > 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const dateStr = date.toISOString().split('T')[0].substring(0, 7);

      // 计算历史分数：从当前分数往回推算
      const monthsAgo = i;
      const baseScore = currentScore - (trend * monthsAgo * 2);
      const randomVariation = (Math.random() - 0.5) * volatility;
      const score = Math.max(0, Math.min(100, baseScore + randomVariation));

      historical.push({
        date: dateStr,
        score: Math.round(score)
      });
    }

    // 添加当前月
    historical.push({
      date: today.toISOString().split('T')[0].substring(0, 7),
      score: currentScore
    });

    return historical;
  }, [historicalData, currentScore]);

  // 预测未来3个月
  const predictions = useMemo(() => {
    if (!showPrediction || data.length < 3) return [];

    const predictions: HealthDataPoint[] = [];
    const recentData = data.slice(-3);

    // 简单线性回归预测
    const n = recentData.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

    recentData.forEach((point, i) => {
      sumX += i;
      sumY += point.score;
      sumXY += i * point.score;
      sumX2 += i * i;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // 预测未来3个月
    const lastDate = new Date(data[data.length - 1].date + '-01');
    for (let i = 1; i <= 3; i++) {
      const futureDate = new Date(lastDate.getFullYear(), lastDate.getMonth() + i, 1);
      const dateStr = futureDate.toISOString().split('T')[0].substring(0, 7);
      const predictedScore = intercept + slope * (n + i - 1);

      predictions.push({
        date: dateStr,
        score: Math.max(0, Math.min(100, Math.round(predictedScore))),
        predicted: true
      });
    }

    return predictions;
  }, [data, showPrediction]);

  const allData = [...data, ...predictions];

  // 计算趋势
  const trend = useMemo(() => {
    if (data.length < 2) return 'stable';
    const recent = data.slice(-3);
    const avg = recent.reduce((sum, d) => sum + d.score, 0) / recent.length;
    const older = data.slice(-6, -3);
    const oldAvg = older.length > 0
      ? older.reduce((sum, d) => sum + d.score, 0) / older.length
      : avg;

    if (avg > oldAvg + 5) return 'up';
    if (avg < oldAvg - 5) return 'down';
    return 'stable';
  }, [data]);

  // 预测风险
  const riskLevel = useMemo(() => {
    if (predictions.length === 0) return 'none';
    const futureScore = predictions[predictions.length - 1].score;
    if (futureScore < 50) return 'high';
    if (futureScore < 70) return 'medium';
    return 'low';
  }, [predictions]);

  // 计算图表尺寸
  const maxScore = 100;
  const minScore = 0;
  const chartHeight = 200;
  const chartWidth = 600;
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // 生成路径
  const generatePath = (dataPoints: HealthDataPoint[], dashed = false) => {
    if (dataPoints.length === 0) return '';

    const points = dataPoints.map((point, i) => {
      const x = padding.left + (i / (allData.length - 1)) * innerWidth;
      const y = padding.top + innerHeight - ((point.score - minScore) / (maxScore - minScore)) * innerHeight;
      return { x, y };
    });

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }

    return path;
  };

  const historicalPath = generatePath(data);
  const predictionPath = predictions.length > 0
    ? `M ${padding.left + ((data.length - 1) / (allData.length - 1)) * innerWidth} ${padding.top + innerHeight - ((data[data.length - 1].score - minScore) / (maxScore - minScore)) * innerHeight} ` +
      generatePath(predictions).substring(2)
    : '';

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900">健康度趋势分析</h3>
            <p className="text-sm text-slate-500">{merchantName}</p>
          </div>
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full border border-blue-200 font-medium">
            线性回归预测
          </span>
        </div>
        <div className="flex items-center gap-2">
          {trend === 'up' && (
            <div className="flex items-center gap-1 text-green-600">
              <TrendingUp size={20} />
              <span className="text-sm font-medium">上升趋势</span>
            </div>
          )}
          {trend === 'down' && (
            <div className="flex items-center gap-1 text-red-600">
              <TrendingDown size={20} />
              <span className="text-sm font-medium">下降趋势</span>
            </div>
          )}
          {trend === 'stable' && (
            <div className="flex items-center gap-1 text-slate-600">
              <span className="text-sm font-medium">稳定</span>
            </div>
          )}
        </div>
      </div>

      {/* 图表 */}
      <div className="relative">
        <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="overflow-visible">
          {/* 网格线 */}
          {[0, 25, 50, 75, 100].map((value) => {
            const y = padding.top + innerHeight - ((value - minScore) / (maxScore - minScore)) * innerHeight;
            return (
              <g key={value}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + innerWidth}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="text-xs fill-slate-500"
                >
                  {value}
                </text>
              </g>
            );
          })}

          {/* 历史数据线 */}
          <path
            d={historicalPath}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 预测数据线 */}
          {predictionPath && (
            <path
              d={predictionPath}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="3"
              strokeDasharray="5,5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* 数据点 */}
          {allData.map((point, i) => {
            const x = padding.left + (i / (allData.length - 1)) * innerWidth;
            const y = padding.top + innerHeight - ((point.score - minScore) / (maxScore - minScore)) * innerHeight;
            return (
              <g key={i}>
                <circle
                  cx={x}
                  cy={y}
                  r="4"
                  fill={point.predicted ? '#f59e0b' : '#3b82f6'}
                  stroke="white"
                  strokeWidth="2"
                />
                {/* 日期标签 */}
                {i % 2 === 0 && (
                  <text
                    x={x}
                    y={chartHeight - 10}
                    textAnchor="middle"
                    className="text-xs fill-slate-500"
                  >
                    {point.date.substring(5)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* 图例和预测信息 */}
      <div className="mt-4 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-blue-500"></div>
              <span className="text-slate-600">历史数据</span>
            </div>
            {predictions.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-orange-500" style={{ backgroundImage: 'repeating-linear-gradient(to right, #f59e0b 0, #f59e0b 3px, transparent 3px, transparent 6px)' }}></div>
                <span className="text-slate-600">预测趋势</span>
              </div>
            )}
          </div>

          {predictions.length > 0 && riskLevel !== 'none' && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
              riskLevel === 'high' ? 'bg-red-50 text-red-700' :
              riskLevel === 'medium' ? 'bg-orange-50 text-orange-700' :
              'bg-green-50 text-green-700'
            }`}>
              {riskLevel === 'high' && <AlertTriangle size={16} />}
              <span className="text-sm font-medium">
                {riskLevel === 'high' ? '预警：未来可能恶化' :
                 riskLevel === 'medium' ? '注意：需持续关注' :
                 '良好：预计保持稳定'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
