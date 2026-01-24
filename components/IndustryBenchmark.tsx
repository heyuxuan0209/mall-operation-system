'use client';

import React, { useMemo } from 'react';
import { Merchant } from '@/types';
import { TrendingUp, TrendingDown, Award, AlertCircle } from 'lucide-react';

interface IndustryBenchmarkProps {
  merchant: Merchant;
  allMerchants: Merchant[];
}

export default function IndustryBenchmark({ merchant, allMerchants }: IndustryBenchmarkProps) {
  // 获取业态大类（如"餐饮"、"零售"、"主力店"）
  const merchantMainCategory = useMemo(() => {
    return merchant.category.split('-')[0];
  }, [merchant]);

  // 获取同业态商户（按大类匹配）
  const industryPeers = useMemo(() => {
    return allMerchants.filter(m => {
      const mainCategory = m.category.split('-')[0];
      return mainCategory === merchantMainCategory && m.id !== merchant.id;
    });
  }, [merchant, allMerchants, merchantMainCategory]);

  // 计算行业平均值
  const industryAverage = useMemo(() => {
    if (industryPeers.length === 0) return null;

    const avgScore = industryPeers.reduce((sum, m) => sum + m.totalScore, 0) / industryPeers.length;
    const avgRevenue = industryPeers.reduce((sum, m) => sum + m.lastMonthRevenue, 0) / industryPeers.length;
    const avgRentRatio = industryPeers.reduce((sum, m) => sum + m.rentToSalesRatio, 0) / industryPeers.length;

    const avgMetrics = {
      collection: industryPeers.reduce((sum, m) => sum + m.metrics.collection, 0) / industryPeers.length,
      operational: industryPeers.reduce((sum, m) => sum + m.metrics.operational, 0) / industryPeers.length,
      siteQuality: industryPeers.reduce((sum, m) => sum + m.metrics.siteQuality, 0) / industryPeers.length,
      customerReview: industryPeers.reduce((sum, m) => sum + m.metrics.customerReview, 0) / industryPeers.length,
      riskResistance: industryPeers.reduce((sum, m) => sum + m.metrics.riskResistance, 0) / industryPeers.length,
    };

    return {
      totalScore: Math.round(avgScore),
      lastMonthRevenue: avgRevenue,
      rentToSalesRatio: avgRentRatio,
      metrics: avgMetrics
    };
  }, [industryPeers]);

  // 找出行业标杆（最高分）
  const topPerformer = useMemo(() => {
    if (industryPeers.length === 0) return null;
    return industryPeers.reduce((top, m) =>
      m.totalScore > top.totalScore ? m : top
    , industryPeers[0]);
  }, [industryPeers]);

  // 计算排名
  const ranking = useMemo(() => {
    const allInIndustry = [merchant, ...industryPeers];
    const sorted = allInIndustry.sort((a, b) => b.totalScore - a.totalScore);
    const rank = sorted.findIndex(m => m.id === merchant.id) + 1;
    return {
      rank,
      total: allInIndustry.length,
      percentile: Math.round((1 - (rank - 1) / allInIndustry.length) * 100)
    };
  }, [merchant, industryPeers]);

  // 对比指标
  const comparisons = useMemo(() => {
    if (!industryAverage) return [];

    return [
      {
        label: '健康度评分',
        current: merchant.totalScore,
        average: industryAverage.totalScore,
        unit: '分',
        format: (v: number) => v.toFixed(0)
      },
      {
        label: '月营收',
        current: merchant.lastMonthRevenue,
        average: industryAverage.lastMonthRevenue,
        unit: '万',
        format: (v: number) => (v / 10000).toFixed(1)
      },
      {
        label: '租售比',
        current: merchant.rentToSalesRatio * 100,
        average: industryAverage.rentToSalesRatio * 100,
        unit: '%',
        format: (v: number) => v.toFixed(1),
        inverse: true // 租售比越低越好
      },
      {
        label: '租金缴纳',
        current: merchant.metrics.collection,
        average: industryAverage.metrics.collection,
        unit: '分',
        format: (v: number) => v.toFixed(0)
      },
      {
        label: '经营表现',
        current: merchant.metrics.operational,
        average: industryAverage.metrics.operational,
        unit: '分',
        format: (v: number) => v.toFixed(0)
      },
      {
        label: '现场品质',
        current: merchant.metrics.siteQuality,
        average: industryAverage.metrics.siteQuality,
        unit: '分',
        format: (v: number) => v.toFixed(0)
      }
    ];
  }, [merchant, industryAverage]);

  if (!industryAverage || industryPeers.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">同业态对比</h3>
        <div className="text-center py-8 text-slate-400">
          <AlertCircle size={48} className="mx-auto mb-3 text-slate-300" />
          <p>暂无同业态商户数据</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">同业态对比分析</h3>
          <p className="text-sm text-slate-500">{merchantMainCategory}类 · 共{industryPeers.length + 1}家商户</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-brand-600">#{ranking.rank}</div>
          <div className="text-xs text-slate-500">行业排名</div>
        </div>
      </div>

      {/* 排名卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="text-sm text-blue-700 mb-1">行业排名</div>
          <div className="text-2xl font-bold text-blue-900">
            {ranking.rank} / {ranking.total}
          </div>
          <div className="text-xs text-blue-600 mt-1">
            超越 {ranking.percentile}% 同行
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <div className="text-sm text-purple-700 mb-1">行业平均分</div>
          <div className="text-2xl font-bold text-purple-900">
            {industryAverage.totalScore}分
          </div>
          <div className="text-xs text-purple-600 mt-1 flex items-center gap-1">
            {merchant.totalScore > industryAverage.totalScore ? (
              <>
                <TrendingUp size={14} />
                高于平均 {(merchant.totalScore - industryAverage.totalScore).toFixed(0)}分
              </>
            ) : merchant.totalScore < industryAverage.totalScore ? (
              <>
                <TrendingDown size={14} />
                低于平均 {(industryAverage.totalScore - merchant.totalScore).toFixed(0)}分
              </>
            ) : (
              '持平'
            )}
          </div>
        </div>

        {topPerformer && (
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 border border-amber-200">
            <div className="text-sm text-amber-700 mb-1 flex items-center gap-1">
              <Award size={14} />
              行业标杆
            </div>
            <div className="text-lg font-bold text-amber-900 truncate">
              {topPerformer.name}
            </div>
            <div className="text-xs text-amber-600 mt-1">
              {topPerformer.totalScore}分
            </div>
          </div>
        )}
      </div>

      {/* 指标对比 */}
      <div className="space-y-4">
        <h4 className="font-semibold text-slate-800 text-sm">关键指标对比</h4>
        {comparisons.map((comp, i) => {
          const diff = comp.current - comp.average;
          const diffPercent = (diff / comp.average) * 100;
          const isBetter = comp.inverse ? diff < 0 : diff > 0;
          const isWorse = comp.inverse ? diff > 0 : diff < 0;

          return (
            <div key={i} className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-slate-700">{comp.label}</span>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm text-slate-500">本店</div>
                    <div className="text-lg font-bold text-slate-900">
                      {comp.format(comp.current)}{comp.unit}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-500">行业均值</div>
                    <div className="text-lg font-bold text-slate-600">
                      {comp.format(comp.average)}{comp.unit}
                    </div>
                  </div>
                </div>
              </div>

              {/* 对比条 */}
              <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`absolute h-full rounded-full transition-all ${
                    isBetter ? 'bg-green-500' :
                    isWorse ? 'bg-red-500' :
                    'bg-slate-400'
                  }`}
                  style={{
                    width: `${Math.min(100, Math.abs(diffPercent))}%`,
                    left: diff < 0 ? `${50 - Math.min(50, Math.abs(diffPercent))}%` : '50%'
                  }}
                />
                <div className="absolute left-1/2 top-0 w-0.5 h-full bg-slate-400"></div>
              </div>

              <div className="mt-2 text-xs text-center">
                {Math.abs(diff) < 0.1 ? (
                  <span className="text-slate-500">与行业持平</span>
                ) : (
                  <span className={isBetter ? 'text-green-600' : isWorse ? 'text-red-600' : 'text-slate-600'}>
                    {isBetter ? '优于' : '低于'}行业均值 {Math.abs(diffPercent).toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 改进建议 */}
      {ranking.rank > 1 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
              <TrendingUp size={16} className="text-white" />
            </div>
            <div className="flex-1">
              <h5 className="font-semibold text-blue-900 mb-1">改进建议</h5>
              <p className="text-sm text-blue-700">
                {merchant.totalScore < industryAverage.totalScore
                  ? `当前健康度低于行业平均水平，建议重点关注${
                      comparisons
                        .filter(c => !c.inverse ? c.current < c.average : c.current > c.average)
                        .slice(0, 2)
                        .map(c => c.label)
                        .join('、')
                    }等指标的提升。`
                  : `当前表现良好，继续保持优势，可参考行业标杆${topPerformer?.name}的经营策略。`
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
