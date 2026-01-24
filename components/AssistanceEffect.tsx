'use client';

import React, { useMemo } from 'react';
import { Task } from '@/types';
import { TrendingUp, TrendingDown, CheckCircle, XCircle, DollarSign, Target } from 'lucide-react';

interface AssistanceEffectProps {
  task: Task;
}

export default function AssistanceEffect({ task }: AssistanceEffectProps) {
  // 计算改善情况
  const improvements = useMemo(() => {
    if (!task.initialMetrics || !task.afterMetrics) {
      // 如果没有实际的after数据，生成模拟数据
      const initial = task.initialMetrics || {
        collection: 0,
        operational: 0,
        siteQuality: 0,
        customerReview: 0,
        riskResistance: 0
      };

      // 根据任务阶段生成合理的改善数据
      const isCompleted = task.stage === 'completed';
      const improvementFactor = isCompleted ? 1.2 : 1.1; // 完成的任务改善更明显

      const after = {
        collection: Math.min(100, Math.round(initial.collection * improvementFactor)),
        operational: Math.min(100, Math.round(initial.operational * improvementFactor)),
        siteQuality: Math.min(100, Math.round(initial.siteQuality * improvementFactor)),
        customerReview: Math.min(100, Math.round(initial.customerReview * improvementFactor)),
        riskResistance: Math.min(100, Math.round(initial.riskResistance * improvementFactor))
      };

      return {
        initial,
        after,
        isSimulated: true
      };
    }

    return {
      initial: task.initialMetrics,
      after: task.afterMetrics,
      isSimulated: false
    };
  }, [task]);

  // 计算总体改善率
  const overallImprovement = useMemo(() => {
    const { initial, after } = improvements;
    const initialAvg = (initial.collection + initial.operational + initial.siteQuality +
                       initial.customerReview + initial.riskResistance) / 5;
    const afterAvg = (after.collection + after.operational + after.siteQuality +
                     after.customerReview + after.riskResistance) / 5;

    const improvement = ((afterAvg - initialAvg) / initialAvg) * 100;
    return {
      initialScore: Math.round(initialAvg),
      afterScore: Math.round(afterAvg),
      improvementPercent: improvement.toFixed(1),
      isPositive: improvement > 0
    };
  }, [improvements]);

  // 各维度改善详情
  const dimensionImprovements = useMemo(() => {
    const { initial, after } = improvements;
    const dimensions = [
      { key: 'collection', label: '租金缴纳', icon: DollarSign },
      { key: 'operational', label: '经营表现', icon: TrendingUp },
      { key: 'siteQuality', label: '现场品质', icon: CheckCircle },
      { key: 'customerReview', label: '顾客满意度', icon: Target },
      { key: 'riskResistance', label: '抗风险能力', icon: CheckCircle }
    ];

    return dimensions.map(dim => {
      const initialValue = initial[dim.key as keyof typeof initial];
      const afterValue = after[dim.key as keyof typeof after];
      const change = afterValue - initialValue;
      const changePercent = initialValue > 0 ? (change / initialValue) * 100 : 0;

      return {
        ...dim,
        initial: initialValue,
        after: afterValue,
        change,
        changePercent: changePercent.toFixed(1),
        isPositive: change > 0
      };
    });
  }, [improvements]);

  // 计算ROI（投入产出比）
  const roi = useMemo(() => {
    // 假设每个帮扶任务的平均成本
    const estimatedCost = 5000; // 人力成本等

    // 假设健康度每提升1分，月营收增加0.5%
    const revenueIncrease = overallImprovement.afterScore - overallImprovement.initialScore;
    const estimatedRevenueBenefit = revenueIncrease * 0.5; // 百分比

    // 假设平均月营收30万
    const avgMonthlyRevenue = 300000;
    const monthlyBenefit = avgMonthlyRevenue * (estimatedRevenueBenefit / 100);

    // 计算年化收益
    const annualBenefit = monthlyBenefit * 12;
    const roiValue = ((annualBenefit - estimatedCost) / estimatedCost) * 100;

    return {
      cost: estimatedCost,
      monthlyBenefit: Math.round(monthlyBenefit),
      annualBenefit: Math.round(annualBenefit),
      roi: roiValue.toFixed(0),
      paybackMonths: estimatedCost / monthlyBenefit
    };
  }, [overallImprovement]);

  // 帮扶措施执行情况
  const measureStats = useMemo(() => {
    const total = task.measures?.length || 0;
    const logs = (task as any).logs || [];
    const executed = logs.filter((log: any) =>
      log.type === 'strategy_adopted' || log.action.includes('执行') || log.action.includes('完成')
    ).length;

    return {
      total,
      executed: Math.min(executed, total),
      executionRate: total > 0 ? ((executed / total) * 100).toFixed(0) : '0'
    };
  }, [task]);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">帮扶效果评估</h3>
          <p className="text-sm text-slate-500">{task.merchantName}</p>
        </div>
        {improvements.isSimulated && (
          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
            预测数据
          </span>
        )}
      </div>

      {/* 总体改善 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="text-sm text-blue-700 mb-1">帮扶前</div>
          <div className="text-3xl font-bold text-blue-900">
            {overallImprovement.initialScore}
            <span className="text-lg">分</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="text-sm text-green-700 mb-1">帮扶后</div>
          <div className="text-3xl font-bold text-green-900">
            {overallImprovement.afterScore}
            <span className="text-lg">分</span>
          </div>
        </div>

        <div className={`bg-gradient-to-br rounded-lg p-4 border ${
          overallImprovement.isPositive
            ? 'from-emerald-50 to-emerald-100 border-emerald-200'
            : 'from-red-50 to-red-100 border-red-200'
        }`}>
          <div className={`text-sm mb-1 ${overallImprovement.isPositive ? 'text-emerald-700' : 'text-red-700'}`}>
            改善幅度
          </div>
          <div className={`text-3xl font-bold flex items-center gap-2 ${
            overallImprovement.isPositive ? 'text-emerald-900' : 'text-red-900'
          }`}>
            {overallImprovement.isPositive ? <TrendingUp size={28} /> : <TrendingDown size={28} />}
            {overallImprovement.isPositive ? '+' : ''}{overallImprovement.improvementPercent}%
          </div>
        </div>
      </div>

      {/* 各维度改善 */}
      <div className="mb-6">
        <h4 className="font-semibold text-slate-800 mb-4 text-sm">各维度改善情况</h4>
        <div className="space-y-3">
          {dimensionImprovements.map((dim, i) => (
            <div key={i} className="bg-slate-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <dim.icon size={16} className="text-slate-600" />
                  <span className="text-sm font-medium text-slate-700">{dim.label}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-500">{dim.initial}分</span>
                  <span className="text-sm text-slate-400">→</span>
                  <span className="text-sm font-bold text-slate-900">{dim.after}分</span>
                  <span className={`text-sm font-medium ${
                    dim.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {dim.isPositive ? '+' : ''}{dim.change}
                  </span>
                </div>
              </div>
              <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="absolute h-full bg-blue-400 rounded-full transition-all"
                  style={{ width: `${dim.initial}%` }}
                />
                <div
                  className={`absolute h-full rounded-full transition-all ${
                    dim.isPositive ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${dim.after}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ROI分析 */}
      <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
        <div className="flex items-start justify-between mb-3">
          <h4 className="font-semibold text-purple-900 text-sm flex items-center gap-2">
            <DollarSign size={16} />
            投入产出分析（ROI）
          </h4>
          <button
            onClick={() => {
              alert(`ROI计算逻辑说明：

📊 成本计算：
• 投入成本 = ¥5,000（人力成本、资源投入等）

📈 收益计算：
• 健康度提升 = 帮扶后评分 - 帮扶前评分
• 营收增长率 = 健康度提升 × 0.5%
  （假设健康度每提升1分，月营收增加0.5%）
• 月度收益 = 平均月营收(¥30万) × 营收增长率
• 年化收益 = 月度收益 × 12个月

💰 ROI计算：
• ROI = (年化收益 - 投入成本) / 投入成本 × 100%
• 回本周期 = 投入成本 / 月度收益

示例：
若健康度从60分提升到72分（+12分）
→ 营收增长率 = 12 × 0.5% = 6%
→ 月度收益 = 30万 × 6% = 1.8万
→ 年化收益 = 1.8万 × 12 = 21.6万
→ ROI = (21.6万 - 0.5万) / 0.5万 × 100% = 4220%
→ 回本周期 = 0.5万 / 1.8万 = 0.28个月`);
            }}
            className="text-xs text-purple-600 hover:text-purple-800 underline cursor-pointer"
          >
            计算说明
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-purple-700 mb-1 flex items-center gap-1">
              投入成本
              <span className="text-[10px] text-purple-500" title="人力成本、资源投入等">ⓘ</span>
            </div>
            <div className="text-lg font-bold text-purple-900">
              ¥{(roi.cost / 1000).toFixed(1)}k
            </div>
            <div className="text-[10px] text-purple-600 mt-0.5">人力+资源</div>
          </div>
          <div>
            <div className="text-xs text-purple-700 mb-1 flex items-center gap-1">
              月度收益
              <span className="text-[10px] text-purple-500" title="基于健康度提升的营收增长">ⓘ</span>
            </div>
            <div className="text-lg font-bold text-purple-900">
              ¥{(roi.monthlyBenefit / 1000).toFixed(1)}k
            </div>
            <div className="text-[10px] text-purple-600 mt-0.5">营收增长</div>
          </div>
          <div>
            <div className="text-xs text-purple-700 mb-1 flex items-center gap-1">
              年化收益
              <span className="text-[10px] text-purple-500" title="月度收益 × 12个月">ⓘ</span>
            </div>
            <div className="text-lg font-bold text-purple-900">
              ¥{(roi.annualBenefit / 1000).toFixed(1)}k
            </div>
            <div className="text-[10px] text-purple-600 mt-0.5">持续效益</div>
          </div>
          <div>
            <div className="text-xs text-purple-700 mb-1 flex items-center gap-1">
              ROI
              <span className="text-[10px] text-purple-500" title="投资回报率">ⓘ</span>
            </div>
            <div className="text-lg font-bold text-purple-900">
              {roi.roi}%
            </div>
            <div className="text-[10px] text-purple-600 mt-0.5">回报率</div>
          </div>
        </div>
        <div className="mt-3 p-2 bg-white/50 rounded text-xs text-purple-700 border border-purple-100">
          <strong>计算公式：</strong>健康度每提升1分 → 月营收增加0.5% | 预计 <strong>{roi.paybackMonths.toFixed(1)}</strong> 个月回本
        </div>
      </div>

      {/* 执行情况 */}
      <div className="p-4 bg-slate-50 rounded-lg">
        <h4 className="font-semibold text-slate-800 mb-3 text-sm">措施执行情况</h4>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-600">
            已执行 {measureStats.executed} / {measureStats.total} 项措施
          </span>
          <span className="text-sm font-bold text-brand-600">
            {measureStats.executionRate}%
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="bg-brand-600 h-2 rounded-full transition-all"
            style={{ width: `${measureStats.executionRate}%` }}
          />
        </div>
      </div>

      {/* 结论 */}
      {overallImprovement.isPositive && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="font-semibold text-green-900 mb-1">帮扶成效显著</h5>
              <p className="text-sm text-green-700">
                通过系统性帮扶，商户健康度提升 {overallImprovement.improvementPercent}%，
                预计年化收益 {(roi.annualBenefit / 10000).toFixed(1)} 万元，
                投入产出比达到 {roi.roi}%，帮扶效果良好。
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
