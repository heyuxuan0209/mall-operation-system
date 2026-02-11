/**
 * 运营数据趋势图组件
 * 展示关键运营指标的历史趋势
 */

'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Merchant } from '@/types';

interface TrendChartProps {
  merchant: Merchant;
}

type TimeRange = '7d' | '30d' | '90d';

export default function OperationalTrendChart({ merchant }: TrendChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [selectedMetric, setSelectedMetric] = useState<string>('turnoverRate');

  const details = merchant.operationalDetails;

  if (!details) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <i className="fas fa-chart-line text-4xl text-gray-300 mb-3"></i>
        <p className="text-gray-500">暂无运营数据，无法生成趋势图</p>
      </div>
    );
  }

  // 生成模拟历史数据
  const trendData = generateTrendData(merchant, selectedMetric, timeRange);
  const metricConfig = getMetricConfig(selectedMetric, merchant);

  if (!metricConfig) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* 控制栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <i className="fas fa-chart-line text-blue-600"></i>
          <h3 className="text-lg font-semibold text-gray-900">运营趋势分析</h3>
        </div>

        <div className="flex items-center gap-3">
          {/* 指标选择 */}
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {getAvailableMetrics(merchant).map((metric) => (
              <option key={metric.value} value={metric.value}>
                {metric.label}
              </option>
            ))}
          </select>

          {/* 时间范围选择 */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {(['7d', '30d', '90d'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  timeRange === range
                    ? 'bg-white text-blue-600 font-semibold shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {range === '7d' ? '近7天' : range === '30d' ? '近30天' : '近90天'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 趋势图 */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              label={{ value: metricConfig.unit, angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />

            {/* 预警阈值线 */}
            {metricConfig.threshold && (
              <ReferenceLine
                y={metricConfig.threshold}
                stroke="#ef4444"
                strokeDasharray="5 5"
                label={{ value: '预警线', position: 'right', fill: '#ef4444', fontSize: 12 }}
              />
            )}

            {/* 行业平均线 */}
            {metricConfig.industryAvg && (
              <ReferenceLine
                y={metricConfig.industryAvg}
                stroke="#10b981"
                strokeDasharray="5 5"
                label={{ value: '行业平均', position: 'right', fill: '#10b981', fontSize: 12 }}
              />
            )}

            <Line
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
              name={metricConfig.label}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* 趋势分析 */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <TrendAnalysis data={trendData} config={metricConfig} />
        </div>
      </div>
    </div>
  );
}

// 趋势分析组件
function TrendAnalysis({ data, config }: { data: any[]; config: any }) {
  if (data.length < 2) return null;

  const firstValue = data[0].value;
  const lastValue = data[data.length - 1].value;
  const change = lastValue - firstValue;
  const changePercent = ((change / firstValue) * 100).toFixed(1);
  const isPositive = change > 0;
  const isGoodTrend = config.higherIsBetter ? isPositive : !isPositive;

  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-4">
        <div>
          <span className="text-gray-500">当前值：</span>
          <span className="font-semibold text-gray-900">{lastValue}{config.unit}</span>
        </div>
        <div>
          <span className="text-gray-500">变化：</span>
          <span className={`font-semibold ${isGoodTrend ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{change.toFixed(1)}{config.unit} ({isPositive ? '+' : ''}{changePercent}%)
          </span>
        </div>
      </div>

      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
        isGoodTrend ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
      }`}>
        <i className={`fas ${isGoodTrend ? 'fa-arrow-up' : 'fa-arrow-down'}`}></i>
        <span className="text-xs font-semibold">
          {isGoodTrend ? '趋势向好' : '需要关注'}
        </span>
      </div>
    </div>
  );
}

// 获取可用指标
function getAvailableMetrics(merchant: Merchant): Array<{ value: string; label: string }> {
  const metrics: Array<{ value: string; label: string }> = [];
  const details = merchant.operationalDetails;

  if (!details) return metrics;

  // 餐饮类指标
  if (details.restaurant) {
    metrics.push(
      { value: 'turnoverRate', label: '翻台率' },
      { value: 'avgWaitTime', label: '平均等位时间' },
      { value: 'avgCheckSize', label: '客单价' }
    );
  }

  // 零售类指标
  if (details.retail) {
    metrics.push(
      { value: 'dailySales', label: '日均销售额' },
      { value: 'inventoryTurnover', label: '库存周转率' }
    );
  }

  // 通用指标
  if (details.customer) {
    metrics.push(
      { value: 'npsScore', label: 'NPS得分' },
      { value: 'repeatCustomerRate', label: '复购率' }
    );
  }

  if (details.staff) {
    metrics.push(
      { value: 'turnoverRate', label: '员工流失率' }
    );
  }

  metrics.push({ value: 'totalScore', label: '健康度评分' });

  return metrics;
}

// 获取指标配置
function getMetricConfig(metric: string, merchant: Merchant) {
  const details = merchant.operationalDetails;

  const configs: Record<string, any> = {
    turnoverRate: {
      label: '翻台率',
      unit: '次/天',
      threshold: 2.0,
      industryAvg: 2.5,
      higherIsBetter: true,
      currentValue: details?.restaurant?.turnoverRate,
    },
    avgWaitTime: {
      label: '平均等位时间',
      unit: '分钟',
      threshold: 60,
      industryAvg: 30,
      higherIsBetter: false,
      currentValue: details?.restaurant?.avgWaitTime,
    },
    avgCheckSize: {
      label: '客单价',
      unit: '元',
      threshold: null,
      industryAvg: 150,
      higherIsBetter: true,
      currentValue: details?.restaurant?.avgCheckSize,
    },
    dailySales: {
      label: '日均销售额',
      unit: '元',
      threshold: null,
      industryAvg: null,
      higherIsBetter: true,
      currentValue: details?.retail?.dailySales,
    },
    inventoryTurnover: {
      label: '库存周转率',
      unit: '次/月',
      threshold: 6,
      industryAvg: 8,
      higherIsBetter: true,
      currentValue: details?.retail?.inventoryTurnover,
    },
    npsScore: {
      label: 'NPS得分',
      unit: '分',
      threshold: 0,
      industryAvg: 30,
      higherIsBetter: true,
      currentValue: details?.customer?.npsScore,
    },
    repeatCustomerRate: {
      label: '复购率',
      unit: '%',
      threshold: 30,
      industryAvg: 50,
      higherIsBetter: true,
      currentValue: details?.customer?.repeatCustomerRate,
    },
    staffTurnoverRate: {
      label: '员工流失率',
      unit: '%',
      threshold: 30,
      industryAvg: 20,
      higherIsBetter: false,
      currentValue: details?.staff?.turnoverRate,
    },
    totalScore: {
      label: '健康度评分',
      unit: '分',
      threshold: 60,
      industryAvg: 80,
      higherIsBetter: true,
      currentValue: merchant.totalScore,
    },
  };

  return configs[metric];
}

// 生成趋势数据（模拟历史数据）
function generateTrendData(merchant: Merchant, metric: string, timeRange: TimeRange) {
  const config = getMetricConfig(metric, merchant);
  if (!config || config.currentValue === undefined) return [];

  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
  const data = [];
  const currentValue = config.currentValue;

  // 生成模拟趋势数据
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;

    // 模拟波动：当前值 ± 随机波动
    const variance = currentValue * 0.15; // 15%波动
    const trend = (days - i) / days; // 趋势因子
    const randomFactor = (Math.random() - 0.5) * 2; // -1 到 1

    let value = currentValue + (variance * randomFactor) + (variance * trend * 0.3);

    // 确保值在合理范围内
    if (metric === 'npsScore') {
      value = Math.max(-100, Math.min(100, value));
    } else if (metric.includes('Rate') || metric.includes('rate')) {
      value = Math.max(0, value);
    }

    data.push({
      date: dateStr,
      value: parseFloat(value.toFixed(1)),
    });
  }

  return data;
}
