'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Merchant } from '@/types';
import { merchantDataManager } from '@/utils/merchantDataManager';
import {
  compareMerchants,
  MerchantComparison,
  formatRevenue,
  formatPercentage,
  getHealthScoreColor,
  getRiskLevelColor,
  getColorClass,
} from '@/utils/merchantComparison';
import MerchantSelector from '@/components/compare/MerchantSelector';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Building2,
  AlertCircle,
  Printer,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

export default function ComparePage() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [selectedMerchants, setSelectedMerchants] = useState<Merchant[]>([]);
  const [comparison, setComparison] = useState<MerchantComparison | null>(null);

  // 加载商户数据
  useEffect(() => {
    const loadMerchants = () => {
      const allMerchants = merchantDataManager.getAllMerchants();
      setMerchants(allMerchants);
    };

    loadMerchants();

    // 监听数据变化
    const unsubscribe = merchantDataManager.onMerchantsChange(loadMerchants);
    return unsubscribe;
  }, []);

  // 当选择的商户变化时，重新计算对比数据
  useEffect(() => {
    if (selectedMerchants.length >= 2) {
      const comparisonData = compareMerchants(selectedMerchants);
      setComparison(comparisonData);
    } else {
      setComparison(null);
    }
  }, [selectedMerchants]);

  // 准备雷达图数据
  const radarChartData = useMemo(() => {
    if (!comparison) return [];

    const dimensions = [
      { key: 'collection', label: '租金缴纳' },
      { key: 'operational', label: '经营表现' },
      { key: 'siteQuality', label: '现场品质' },
      { key: 'customerReview', label: '顾客满意度' },
      { key: 'riskResistance', label: '抗风险能力' },
    ];

    return dimensions.map(dim => {
      const dataPoint: any = { dimension: dim.label };
      comparison.merchants.forEach((merchant, index) => {
        dataPoint[merchant.name] = merchant.metrics[dim.key as keyof typeof merchant.metrics];
      });
      return dataPoint;
    });
  }, [comparison]);

  // 准备健康度柱状图数据
  const healthScoreBarData = useMemo(() => {
    if (!comparison) return [];
    return comparison.merchants.map(m => ({
      name: m.name,
      健康度: m.totalScore,
    }));
  }, [comparison]);

  // 准备营收柱状图数据
  const revenueBarData = useMemo(() => {
    if (!comparison) return [];
    return comparison.merchants.map(m => ({
      name: m.name,
      月营收: m.lastMonthRevenue / 10000, // 转换为万元
    }));
  }, [comparison]);

  // 准备租售比柱状图数据
  const rentRatioBarData = useMemo(() => {
    if (!comparison) return [];
    return comparison.merchants.map(m => ({
      name: m.name,
      租售比: m.rentToSalesRatio * 100, // 转换为百分比
    }));
  }, [comparison]);

  // 打印功能
  const handlePrint = () => {
    window.print();
  };

  // 获取风险等级标签
  const getRiskLevelLabel = (riskLevel: string) => {
    const labels: Record<string, string> = {
      critical: '极高风险',
      high: '高风险',
      medium: '中风险',
      low: '低风险',
      none: '无风险',
    };
    return labels[riskLevel] || riskLevel;
  };

  // 获取图表颜色
  const getChartColor = (index: number) => {
    const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899'];
    return colors[index % colors.length];
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* 页面头部 */}
      <div className="bg-white border-b border-slate-200 print:hidden">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/health"
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft size={24} />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 size={28} className="text-brand-600" />
                  商户对比分析
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  多维度对比商户经营表现，发现差异与改进机会
                </p>
              </div>
            </div>

            {comparison && (
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
              >
                <Printer size={18} />
                打印报告
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 商户选择器 */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 mb-8 print:hidden">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Building2 size={20} className="text-brand-600" />
            选择对比商户
          </h2>
          <MerchantSelector
            merchants={merchants}
            selectedMerchants={selectedMerchants}
            onSelectionChange={setSelectedMerchants}
            maxSelection={5}
            minSelection={2}
          />
        </div>

        {/* 对比结果 */}
        {!comparison ? (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-12 text-center">
            <BarChart3 size={64} className="mx-auto mb-4 text-slate-300" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              请选择至少2个商户进行对比
            </h3>
            <p className="text-slate-500">
              在上方选择器中选择2-5个商户，系统将自动生成多维度对比分析
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* 打印标题（仅打印时显示） */}
            <div className="hidden print:block mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">商户对比分析报告</h1>
              <p className="text-slate-600">
                生成时间：{new Date().toLocaleString('zh-CN')}
              </p>
            </div>

            {/* 对比摘要 */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 print:break-inside-avoid">
              <h2 className="text-lg font-bold text-slate-900 mb-4">对比摘要</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                  <div className="text-sm text-blue-700 mb-1">对比商户数</div>
                  <div className="text-2xl font-bold text-blue-900">
                    {comparison.summary.totalMerchants}家
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                  <div className="text-sm text-green-700 mb-1">平均健康度</div>
                  <div className="text-2xl font-bold text-green-900">
                    {comparison.summary.avgHealthScore.toFixed(0)}分
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    {comparison.summary.healthScoreRange.min.toFixed(0)} ~{' '}
                    {comparison.summary.healthScoreRange.max.toFixed(0)}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                  <div className="text-sm text-purple-700 mb-1">平均月营收</div>
                  <div className="text-2xl font-bold text-purple-900">
                    {formatRevenue(comparison.summary.avgRevenue)}
                  </div>
                  <div className="text-xs text-purple-600 mt-1">
                    {formatRevenue(comparison.summary.revenueRange.min)} ~{' '}
                    {formatRevenue(comparison.summary.revenueRange.max)}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                  <div className="text-sm text-orange-700 mb-1">平均租售比</div>
                  <div className="text-2xl font-bold text-orange-900">
                    {formatPercentage(comparison.summary.avgRentRatio)}
                  </div>
                  <div className="text-xs text-orange-600 mt-1">
                    {formatPercentage(comparison.summary.rentRatioRange.min)} ~{' '}
                    {formatPercentage(comparison.summary.rentRatioRange.max)}
                  </div>
                </div>
              </div>
            </div>

            {/* 基础信息对比表 */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 print:break-inside-avoid">
              <h2 className="text-lg font-bold text-slate-900 mb-4">基础信息对比</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700">
                        项目
                      </th>
                      {comparison.merchants.map(merchant => (
                        <th
                          key={merchant.id}
                          className="text-center py-3 px-4 font-semibold text-slate-700"
                        >
                          {merchant.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-3 px-4 font-medium text-slate-700">业态</td>
                      {comparison.merchants.map(merchant => (
                        <td key={merchant.id} className="py-3 px-4 text-center">
                          {merchant.category}
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="py-3 px-4 font-medium text-slate-700">位置</td>
                      {comparison.merchants.map(merchant => (
                        <td key={merchant.id} className="py-3 px-4 text-center">
                          {merchant.floor} {merchant.shopNumber}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium text-slate-700">面积</td>
                      {comparison.merchants.map(merchant => (
                        <td key={merchant.id} className="py-3 px-4 text-center">
                          {merchant.area}㎡
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="py-3 px-4 font-medium text-slate-700">风险等级</td>
                      {comparison.merchants.map(merchant => (
                        <td key={merchant.id} className="py-3 px-4 text-center">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs border ${getRiskLevelColor(
                              merchant.riskLevel
                            )}`}
                          >
                            {getRiskLevelLabel(merchant.riskLevel)}
                          </span>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium text-slate-700">健康度</td>
                      {comparison.merchants.map(merchant => (
                        <td key={merchant.id} className="py-3 px-4 text-center">
                          <span
                            className={`text-lg font-bold ${getHealthScoreColor(
                              merchant.totalScore
                            )}`}
                          >
                            {merchant.totalScore}分
                          </span>
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="py-3 px-4 font-medium text-slate-700">月营收</td>
                      {comparison.merchants.map(merchant => (
                        <td key={merchant.id} className="py-3 px-4 text-center">
                          {formatRevenue(merchant.lastMonthRevenue)}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-medium text-slate-700">月租金</td>
                      {comparison.merchants.map(merchant => (
                        <td key={merchant.id} className="py-3 px-4 text-center">
                          {formatRevenue(merchant.rent)}
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-slate-50">
                      <td className="py-3 px-4 font-medium text-slate-700">租售比</td>
                      {comparison.merchants.map(merchant => (
                        <td key={merchant.id} className="py-3 px-4 text-center">
                          {formatPercentage(merchant.rentToSalesRatio)}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 五维健康指标雷达图 */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 print:break-inside-avoid">
              <h2 className="text-lg font-bold text-slate-900 mb-4">
                五维健康指标对比
              </h2>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarChartData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="dimension" />
                    <PolarRadiusAxis domain={[0, 100]} />
                    {comparison.merchants.map((merchant, index) => (
                      <Radar
                        key={merchant.id}
                        name={merchant.name}
                        dataKey={merchant.name}
                        stroke={getChartColor(index)}
                        fill={getChartColor(index)}
                        fillOpacity={0.3}
                      />
                    ))}
                    <Legend />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 健康度对比柱状图 */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 print:break-inside-avoid">
              <h2 className="text-lg font-bold text-slate-900 mb-4">健康度对比</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={healthScoreBarData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="健康度" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 营收和租售比对比 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 月营收对比 */}
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 print:break-inside-avoid">
                <h2 className="text-lg font-bold text-slate-900 mb-4">月营收对比</h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueBarData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="月营收" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 租售比对比 */}
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 print:break-inside-avoid">
                <h2 className="text-lg font-bold text-slate-900 mb-4">
                  租售比对比（越低越好）
                </h2>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={rentRatioBarData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="租售比" fill="#f59e0b" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* 智能洞察与建议 */}
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 print:break-inside-avoid">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-brand-600" />
                智能洞察与建议
              </h2>

              {comparison.insights.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <AlertCircle size={48} className="mx-auto mb-3 text-slate-300" />
                  <p>暂无特别洞察</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {comparison.insights.map((insight, index) => {
                    const severityColors = {
                      info: 'bg-blue-50 border-blue-200',
                      warning: 'bg-yellow-50 border-yellow-200',
                      critical: 'bg-red-50 border-red-200',
                    };

                    const severityTextColors = {
                      info: 'text-blue-900',
                      warning: 'text-yellow-900',
                      critical: 'text-red-900',
                    };

                    const severityDescColors = {
                      info: 'text-blue-700',
                      warning: 'text-yellow-700',
                      critical: 'text-red-700',
                    };

                    return (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${
                          severityColors[insight.severity || 'info']
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">{insight.icon}</div>
                          <div className="flex-1">
                            <h3
                              className={`font-semibold mb-1 ${
                                severityTextColors[insight.severity || 'info']
                              }`}
                            >
                              {insight.title}
                            </h3>
                            <p
                              className={`text-sm ${
                                severityDescColors[insight.severity || 'info']
                              }`}
                            >
                              {insight.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
