/**
 * 智能巡检规划面板
 * Sprint 1: AI智能巡检计划
 */

'use client';

import React, { useState, useMemo } from 'react';
import { AlertTriangle, TrendingDown, TrendingUp, Minus, Calendar, ArrowRight, Filter } from 'lucide-react';
import { Merchant, InspectionRecord } from '@/types';
import { InspectionPlan, generateInspectionPlans } from '@/skills/inspection-planning-engine';
import Link from 'next/link';

interface IntelligentPlanningPanelProps {
  merchants: Merchant[];
  inspectionRecords: InspectionRecord[];
}

export default function IntelligentPlanningPanel({
  merchants,
  inspectionRecords,
}: IntelligentPlanningPanelProps) {
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  // 生成智能巡检计划
  const plans = useMemo(() => {
    return generateInspectionPlans(merchants, inspectionRecords);
  }, [merchants, inspectionRecords]);

  // 过滤计划
  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      if (filterRisk !== 'all' && plan.riskPrediction.level !== filterRisk) {
        return false;
      }
      if (filterPriority !== 'all' && plan.priority !== filterPriority) {
        return false;
      }
      return true;
    });
  }, [plans, filterRisk, filterPriority]);

  // 获取优先级样式
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return {
          bg: 'bg-red-500',
          text: 'text-white',
          label: '🔴 紧急',
          border: 'border-red-200',
          cardBg: 'bg-red-50',
        };
      case 'high':
        return {
          bg: 'bg-orange-500',
          text: 'text-white',
          label: '🟠 高',
          border: 'border-orange-200',
          cardBg: 'bg-orange-50',
        };
      case 'normal':
        return {
          bg: 'bg-blue-500',
          text: 'text-white',
          label: '🔵 普通',
          border: 'border-blue-200',
          cardBg: 'bg-blue-50',
        };
      default:
        return {
          bg: 'bg-green-500',
          text: 'text-white',
          label: '🟢 低',
          border: 'border-green-200',
          cardBg: 'bg-green-50',
        };
    }
  };

  // 获取风险等级样式
  const getRiskStyle = (level: string) => {
    switch (level) {
      case 'critical':
        return 'text-red-600 bg-red-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-green-600 bg-green-100';
    }
  };

  // 获取风险等级文本
  const getRiskText = (level: string) => {
    switch (level) {
      case 'critical':
        return '极高风险';
      case 'high':
        return '高风险';
      case 'medium':
        return '中风险';
      default:
        return '低风险';
    }
  };

  // 获取趋势图标
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp size={16} className="text-green-600" />;
      case 'declining':
        return <TrendingDown size={16} className="text-red-600" />;
      default:
        return <Minus size={16} className="text-gray-600" />;
    }
  };

  // 获取趋势文本
  const getTrendText = (trend: string) => {
    switch (trend) {
      case 'improving':
        return '上升';
      case 'declining':
        return '下降';
      default:
        return '稳定';
    }
  };

  return (
    <div className="space-y-6">
      {/* 头部统计 */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-4">🎯 AI智能巡检规划</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-sm opacity-90">紧急</div>
            <div className="text-3xl font-bold mt-1">
              {plans.filter((p) => p.priority === 'urgent').length}
            </div>
          </div>
          <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-sm opacity-90">高优先级</div>
            <div className="text-3xl font-bold mt-1">
              {plans.filter((p) => p.priority === 'high').length}
            </div>
          </div>
          <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-sm opacity-90">普通</div>
            <div className="text-3xl font-bold mt-1">
              {plans.filter((p) => p.priority === 'normal').length}
            </div>
          </div>
          <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-sm opacity-90">总计</div>
            <div className="text-3xl font-bold mt-1">{plans.length}</div>
          </div>
        </div>
      </div>

      {/* 筛选器 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={18} className="text-gray-600" />
          <span className="font-semibold text-gray-900">筛选条件</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">优先级</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部</option>
              <option value="urgent">紧急</option>
              <option value="high">高</option>
              <option value="normal">普通</option>
              <option value="low">低</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">风险等级</label>
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部</option>
              <option value="critical">极高风险</option>
              <option value="high">高风险</option>
              <option value="medium">中风险</option>
              <option value="low">低风险</option>
            </select>
          </div>
        </div>
        <div className="mt-3 text-sm text-gray-500">
          显示 {filteredPlans.length} / {plans.length} 个商户
        </div>
      </div>

      {/* 计划列表 */}
      <div className="space-y-4">
        {filteredPlans.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-gray-400 text-lg mb-2">暂无符合条件的巡检计划</div>
            <div className="text-sm text-gray-500">尝试调整筛选条件</div>
          </div>
        ) : (
          filteredPlans.map((plan) => {
            const priorityStyle = getPriorityStyle(plan.priority);
            const merchant = merchants.find((m) => m.id === plan.merchantId);

            return (
              <div
                key={plan.merchantId}
                className={`bg-white rounded-xl shadow-sm border-2 ${priorityStyle.border} overflow-hidden transition-all hover:shadow-md`}
              >
                {/* 优先级标签条 */}
                <div className={`${priorityStyle.bg} ${priorityStyle.text} px-4 py-2 flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{priorityStyle.label}</span>
                    <span className="text-sm opacity-90">优先级</span>
                  </div>
                  {plan.overdueDays > 0 && (
                    <div className="text-sm opacity-90">
                      超期 {plan.overdueDays} 天
                    </div>
                  )}
                </div>

                <div className="p-5">
                  {/* 商户信息 */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {plan.merchantName}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        {merchant && (
                          <>
                            <span>{merchant.category}</span>
                            <span>•</span>
                            <span>{merchant.floor} {merchant.shopNumber}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 mb-1">健康度</div>
                      <div className="text-3xl font-bold text-gray-900">
                        {merchant?.totalScore.toFixed(0)}
                        <span className="text-lg text-gray-500 ml-1">分</span>
                      </div>
                    </div>
                  </div>

                  {/* AI推荐原因 */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-semibold text-yellow-900 mb-1">
                          AI推荐原因
                        </div>
                        <div className="text-sm text-yellow-800">{plan.reason}</div>
                      </div>
                    </div>
                  </div>

                  {/* 风险预测 */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">风险等级</div>
                      <div
                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getRiskStyle(
                          plan.riskPrediction.level
                        )}`}
                      >
                        {getRiskText(plan.riskPrediction.level)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        置信度: {plan.riskPrediction.confidence.toFixed(0)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">健康度趋势</div>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(plan.healthTrend)}
                        <span className="text-sm font-semibold text-gray-900">
                          {getTrendText(plan.healthTrend)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 关注领域 */}
                  <div className="mb-4">
                    <div className="text-sm text-gray-500 mb-2">建议关注领域</div>
                    <div className="flex flex-wrap gap-2">
                      {plan.suggestedFocusAreas.map((area, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 风险因素 */}
                  {plan.riskPrediction.factors.length > 0 && (
                    <div className="mb-4">
                      <div className="text-sm text-gray-500 mb-2">主要风险因素</div>
                      <div className="space-y-1">
                        {plan.riskPrediction.factors.map((factor, index) => (
                          <div
                            key={index}
                            className="text-sm text-red-700 bg-red-50 px-3 py-1.5 rounded-md"
                          >
                            • {factor}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 历史问题 */}
                  {plan.historicalIssues.length > 0 && (
                    <div className="mb-4">
                      <div className="text-sm text-gray-500 mb-2">上次巡检发现的问题</div>
                      <div className="space-y-1">
                        {plan.historicalIssues.slice(0, 3).map((issue, index) => (
                          <div
                            key={index}
                            className="text-sm text-orange-700 bg-orange-50 px-3 py-1.5 rounded-md"
                          >
                            • {issue}
                          </div>
                        ))}
                        {plan.historicalIssues.length > 3 && (
                          <div className="text-xs text-gray-500 ml-3">
                            还有 {plan.historicalIssues.length - 3} 个问题...
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 预期问题 */}
                  {plan.expectedIssues.length > 0 && (
                    <div className="mb-4">
                      <div className="text-sm text-gray-500 mb-2">AI预期发现的问题</div>
                      <div className="space-y-1">
                        {plan.expectedIssues.map((issue, index) => (
                          <div
                            key={index}
                            className="text-sm text-purple-700 bg-purple-50 px-3 py-1.5 rounded-md"
                          >
                            💡 {issue}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 上次巡检时间 */}
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <Calendar size={16} />
                    <span>
                      {plan.lastInspectionDate
                        ? `上次巡检: ${new Date(plan.lastInspectionDate).toLocaleDateString('zh-CN')}`
                        : '从未巡检'}
                    </span>
                  </div>

                  {/* 检查清单预览 */}
                  <div className="mb-4">
                    <div className="text-sm text-gray-500 mb-2">
                      AI生成的检查清单 ({plan.aiGeneratedChecklist.length}项)
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 space-y-1 max-h-32 overflow-y-auto">
                      {plan.aiGeneratedChecklist.slice(0, 5).map((item) => (
                        <div key={item.id} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-gray-400">□</span>
                          <span>{item.label}</span>
                          {item.category && (
                            <span className="text-xs text-gray-500 ml-auto">
                              [{item.category}]
                            </span>
                          )}
                        </div>
                      ))}
                      {plan.aiGeneratedChecklist.length > 5 && (
                        <div className="text-xs text-gray-500 text-center pt-1">
                          还有 {plan.aiGeneratedChecklist.length - 5} 项...
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <Link
                    href={`/inspection?merchantId=${plan.merchantId}`}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold"
                  >
                    <span>开始巡检</span>
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
