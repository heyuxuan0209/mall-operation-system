/**
 * 同业对比图表组件
 * 展示商户与同业的多维度对比
 */

'use client';

import { useState } from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Merchant } from '@/types';
import { mockMerchants } from '@/data/merchants/mock-data';

interface ComparisonChartProps {
  merchant: Merchant;
}

type ChartType = 'radar' | 'bar';

export default function IndustryComparisonChart({ merchant }: ComparisonChartProps) {
  const [chartType, setChartType] = useState<ChartType>('radar');
  const [selectedMetric, setSelectedMetric] = useState<string>('overall');

  // 获取同业商户
  const industryMerchants = getSameIndustryMerchants(merchant);

  if (industryMerchants.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <i className="fas fa-users text-4xl text-gray-300 mb-3"></i>
        <p className="text-gray-500">暂无同业商户数据，无法进行对比</p>
      </div>
    );
  }

  // 生成对比数据
  const radarData = generateRadarData(merchant, industryMerchants);
  const barData = generateBarData(merchant, industryMerchants, selectedMetric);
  const ranking = calculateRanking(merchant, industryMerchants);

  return (
    <div className="space-y-4">
      {/* 控制栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <i className="fas fa-chart-radar text-purple-600"></i>
          <h3 className="text-lg font-semibold text-gray-900">同业对比分析</h3>
          <span className="text-sm text-gray-500">（对比{industryMerchants.length}家同业商户）</span>
        </div>

        <div className="flex items-center gap-3">
          {/* 图表类型切换 */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setChartType('radar')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                chartType === 'radar'
                  ? 'bg-white text-purple-600 font-semibold shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <i className="fas fa-chart-radar mr-1"></i>
              雷达图
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                chartType === 'bar'
                  ? 'bg-white text-purple-600 font-semibold shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <i className="fas fa-chart-bar mr-1"></i>
              柱状图
            </button>
          </div>

          {/* 指标选择（仅柱状图） */}
          {chartType === 'bar' && (
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="overall">综合健康度</option>
              <option value="collection">租金缴纳</option>
              <option value="operational">经营表现</option>
              <option value="siteQuality">现场品质</option>
              <option value="customerReview">顾客满意度</option>
              <option value="riskResistance">抗风险能力</option>
            </select>
          )}
        </div>
      </div>

      {/* 排名卡片 */}
      <div className="grid grid-cols-3 gap-3">
        <RankingCard
          label="综合排名"
          rank={ranking.overall.rank}
          total={ranking.overall.total}
          percentile={ranking.overall.percentile}
          color="purple"
        />
        <RankingCard
          label="健康度排名"
          rank={ranking.health.rank}
          total={ranking.health.total}
          percentile={ranking.health.percentile}
          color="blue"
        />
        <RankingCard
          label="营收排名"
          rank={ranking.revenue.rank}
          total={ranking.revenue.total}
          percentile={ranking.revenue.percentile}
          color="green"
        />
      </div>

      {/* 图表 */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        {chartType === 'radar' ? (
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="dimension" style={{ fontSize: '12px' }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} style={{ fontSize: '10px' }} />
              <Radar
                name={merchant.name}
                dataKey="current"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.6}
              />
              <Radar
                name="同业平均"
                dataKey="average"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.3}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" style={{ fontSize: '12px' }} />
              <YAxis domain={[0, 100]} style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="value" fill="#8b5cf6" name="得分" />
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* 对比分析 */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <ComparisonAnalysis merchant={merchant} industryMerchants={industryMerchants} />
        </div>
      </div>
    </div>
  );
}

// 排名卡片
function RankingCard({ label, rank, total, percentile, color }: {
  label: string;
  rank: number;
  total: number;
  percentile: number;
  color: 'purple' | 'blue' | 'green';
}) {
  const colorClasses = {
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
  };

  const medalIcon = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';

  return (
    <div className={`${colorClasses[color]} border-2 rounded-lg p-4`}>
      <div className="text-xs opacity-75 mb-1">{label}</div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold">#{rank}</span>
        {medalIcon && <span className="text-2xl">{medalIcon}</span>}
      </div>
      <div className="text-xs mt-2">
        共{total}家 · 超越{percentile}%同业
      </div>
    </div>
  );
}

// 对比分析
function ComparisonAnalysis({ merchant, industryMerchants }: {
  merchant: Merchant;
  industryMerchants: Merchant[];
}) {
  const avgScore = industryMerchants.reduce((sum, m) => sum + m.totalScore, 0) / industryMerchants.length;
  const diff = merchant.totalScore - avgScore;
  const isAboveAvg = diff > 0;

  const strengths: string[] = [];
  const weaknesses: string[] = [];

  // 分析优劣势
  Object.entries(merchant.metrics).forEach(([key, value]) => {
    const avgValue = industryMerchants.reduce((sum, m) => sum + (m.metrics[key as keyof typeof m.metrics] || 0), 0) / industryMerchants.length;
    const diff = value - avgValue;

    const labels: Record<string, string> = {
      collection: '租金缴纳',
      operational: '经营表现',
      siteQuality: '现场品质',
      customerReview: '顾客满意度',
      riskResistance: '抗风险能力',
    };

    if (diff > 10) {
      strengths.push(labels[key]);
    } else if (diff < -10) {
      weaknesses.push(labels[key]);
    }
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <div>
          <span className="text-gray-500">当前健康度：</span>
          <span className="font-semibold text-gray-900">{merchant.totalScore}分</span>
        </div>
        <div>
          <span className="text-gray-500">同业平均：</span>
          <span className="font-semibold text-gray-900">{avgScore.toFixed(1)}分</span>
        </div>
        <div>
          <span className="text-gray-500">差距：</span>
          <span className={`font-semibold ${isAboveAvg ? 'text-green-600' : 'text-red-600'}`}>
            {isAboveAvg ? '+' : ''}{diff.toFixed(1)}分
          </span>
        </div>
      </div>

      {strengths.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-green-700 text-sm font-semibold mb-1">
            <i className="fas fa-thumbs-up"></i>
            <span>优势领域</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {strengths.map((s, i) => (
              <span key={i} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {weaknesses.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center gap-2 text-red-700 text-sm font-semibold mb-1">
            <i className="fas fa-exclamation-triangle"></i>
            <span>待改进领域</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {weaknesses.map((w, i) => (
              <span key={i} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                {w}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// 获取同业商户
function getSameIndustryMerchants(merchant: Merchant): Merchant[] {
  const category = merchant.category.split('-')[0]; // 获取大类（如"餐饮"）
  return mockMerchants.filter(m =>
    m.id !== merchant.id &&
    m.category.startsWith(category) &&
    m.status === 'operating'
  );
}

// 生成雷达图数据
function generateRadarData(merchant: Merchant, industryMerchants: Merchant[]) {
  const dimensions = [
    { key: 'collection', label: '租金缴纳' },
    { key: 'operational', label: '经营表现' },
    { key: 'siteQuality', label: '现场品质' },
    { key: 'customerReview', label: '顾客满意度' },
    { key: 'riskResistance', label: '抗风险能力' },
  ];

  return dimensions.map(dim => {
    const currentValue = merchant.metrics[dim.key as keyof typeof merchant.metrics];
    const avgValue = industryMerchants.reduce((sum, m) =>
      sum + (m.metrics[dim.key as keyof typeof m.metrics] || 0), 0
    ) / industryMerchants.length;

    return {
      dimension: dim.label,
      current: currentValue,
      average: Math.round(avgValue),
    };
  });
}

// 生成柱状图数据
function generateBarData(merchant: Merchant, industryMerchants: Merchant[], metric: string) {
  if (metric === 'overall') {
    // 综合健康度对比
    const allMerchants = [merchant, ...industryMerchants]
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 10); // 只显示前10名

    return allMerchants.map(m => ({
      name: m.name.length > 6 ? m.name.substring(0, 6) + '...' : m.name,
      value: m.totalScore,
      isCurrentMerchant: m.id === merchant.id,
    }));
  } else {
    // 单项指标对比
    const allMerchants = [merchant, ...industryMerchants]
      .sort((a, b) =>
        (b.metrics[metric as keyof typeof b.metrics] || 0) -
        (a.metrics[metric as keyof typeof a.metrics] || 0)
      )
      .slice(0, 10);

    return allMerchants.map(m => ({
      name: m.name.length > 6 ? m.name.substring(0, 6) + '...' : m.name,
      value: m.metrics[metric as keyof typeof m.metrics] || 0,
      isCurrentMerchant: m.id === merchant.id,
    }));
  }
}

// 计算排名
function calculateRanking(merchant: Merchant, industryMerchants: Merchant[]) {
  const allMerchants = [merchant, ...industryMerchants];

  // 综合排名
  const sortedByScore = [...allMerchants].sort((a, b) => b.totalScore - a.totalScore);
  const overallRank = sortedByScore.findIndex(m => m.id === merchant.id) + 1;

  // 健康度排名（同综合排名）
  const healthRank = overallRank;

  // 营收排名
  const sortedByRevenue = [...allMerchants].sort((a, b) => b.lastMonthRevenue - a.lastMonthRevenue);
  const revenueRank = sortedByRevenue.findIndex(m => m.id === merchant.id) + 1;

  const total = allMerchants.length;

  return {
    overall: {
      rank: overallRank,
      total,
      percentile: Math.round(((total - overallRank) / total) * 100),
    },
    health: {
      rank: healthRank,
      total,
      percentile: Math.round(((total - healthRank) / total) * 100),
    },
    revenue: {
      rank: revenueRank,
      total,
      percentile: Math.round(((total - revenueRank) / total) * 100),
    },
  };
}
