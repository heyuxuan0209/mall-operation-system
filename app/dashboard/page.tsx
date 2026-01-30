'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { InspectionStats, OverdueMerchant, InspectionTrendData, InspectionPolicy } from '@/types';
import { inspectionStatsService } from '@/utils/inspectionStatsService';
import { inspectionPolicyService } from '@/utils/inspectionPolicyService';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function DashboardPage() {
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('week');
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [policies, setPolicies] = useState<InspectionPolicy[]>([]);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280);
  const isMobileView = windowWidth < 1024;

  // 监听窗口尺寸变化
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 加载策略数据
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPolicies(inspectionPolicyService.getAllPolicies());
    }
  }, []);

  // 计算统计数据（使用useMemo缓存）
  const stats = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return inspectionStatsService.calculateStats(period);
  }, [period]);

  // 获取超期商户列表
  const overdueMerchants = useMemo(() => {
    if (typeof window === 'undefined') return [];
    return inspectionStatsService.getOverdueMerchants(period);
  }, [period]);

  // 获取趋势数据
  const trendData = useMemo(() => {
    if (typeof window === 'undefined') return [];
    const days = period === 'today' ? 7 : period === 'week' ? 7 : 30;
    return inspectionStatsService.getTrendData(days);
  }, [period]);

  // 获取风险等级颜色
  const getRiskColor = useCallback((level: string): string => {
    const colors: Record<string, string> = {
      critical: '#9333ea',
      high: '#ef4444',
      medium: '#f97316',
      low: '#eab308',
      none: '#22c55e'
    };
    return colors[level] || '#94a3b8';
  }, []);

  // 获取风险等级文本
  const getRiskText = useCallback((level: string): string => {
    const texts: Record<string, string> = {
      critical: '极高风险',
      high: '高风险',
      medium: '中风险',
      low: '低风险',
      none: '无风险'
    };
    return texts[level] || level;
  }, []);

  // 获取优先级文本
  const getPriorityText = useCallback((priority: string): string => {
    const texts: Record<string, string> = {
      urgent: '紧急',
      high: '高',
      normal: '正常',
      low: '低'
    };
    return texts[priority] || priority;
  }, []);

  // 获取频率文本
  const getFrequencyText = useCallback((policy: InspectionPolicy): string => {
    const { interval, count } = policy.requiredFrequency;
    const intervalText = interval === 'daily' ? '每日' : interval === 'weekly' ? '每周' : '每月';
    return `${intervalText}${count}次`;
  }, []);

  // 处理策略更新
  const handlePolicyToggle = (policyId: string, enabled: boolean) => {
    inspectionPolicyService.updatePolicy(policyId, { enabled });
    setPolicies(inspectionPolicyService.getAllPolicies());
  };

  // 跳转到巡检页面
  const handleInspectMerchant = (merchantId: string) => {
    window.location.href = `/inspection?merchantId=${merchantId}`;
  };

  if (!stats) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <i className="fa-solid fa-spinner fa-spin text-4xl text-brand-500 mb-4"></i>
          <p className="text-slate-500">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-4 lg:space-y-6">
      {/* 头部 */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-slate-900">管理驾驶舱</h2>
          <p className="text-sm text-slate-500">{stats.periodLabel}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* 时间范围切换 */}
          <div className="flex gap-2">
            <button
              onClick={() => setPeriod('today')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === 'today'
                  ? 'bg-brand-500 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-brand-300'
              }`}
            >
              今日
            </button>
            <button
              onClick={() => setPeriod('week')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === 'week'
                  ? 'bg-brand-500 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-brand-300'
              }`}
            >
              本周
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === 'month'
                  ? 'bg-brand-500 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-brand-300'
              }`}
            >
              本月
            </button>
          </div>

          {/* 策略设置按钮 */}
          <button
            onClick={() => setShowPolicyModal(true)}
            className="px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-lg text-sm font-medium hover:border-brand-300 transition-colors flex items-center gap-2"
          >
            <i className="fa-solid fa-gear"></i>
            策略设置
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 完成率卡片 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">完成率</span>
            <i className="fa-solid fa-check-circle text-green-500"></i>
          </div>
          <div className="text-2xl lg:text-3xl font-bold text-slate-900">{stats.completionRate}%</div>
          <div className="text-xs text-slate-500 mt-1">
            {stats.completedInspections}/{stats.requiredInspections} 商户
          </div>
        </div>

        {/* 超期预警卡片 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">超期预警</span>
            <i className="fa-solid fa-exclamation-triangle text-red-500"></i>
          </div>
          <div className="text-2xl lg:text-3xl font-bold text-slate-900">{stats.overdueCount}</div>
          <div className="text-xs text-slate-500 mt-1">
            {stats.overdueCount > 0 ? '需要关注' : '无超期'}
          </div>
        </div>

        {/* 巡检员数量 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">活跃巡检员</span>
            <i className="fa-solid fa-users text-blue-500"></i>
          </div>
          <div className="text-2xl lg:text-3xl font-bold text-slate-900">{stats.byInspector.length}</div>
          <div className="text-xs text-slate-500 mt-1">
            共 {stats.byInspector.reduce((sum, i) => sum + i.completedInspections, 0)} 次巡检
          </div>
        </div>

        {/* 平均质量分 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-500">平均质量分</span>
            <i className="fa-solid fa-star text-purple-500"></i>
          </div>
          <div className="text-2xl lg:text-3xl font-bold text-slate-900">
            {stats.byInspector.length > 0
              ? (stats.byInspector.reduce((sum, i) => sum + i.qualityScore, 0) / stats.byInspector.length).toFixed(1)
              : '0.0'}
          </div>
          <div className="text-xs text-slate-500 mt-1">质量评分</div>
        </div>
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* 各风险等级覆盖率图表 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 lg:p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">各风险等级覆盖率</h3>
          <div className="h-64 lg:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.byRiskLevel}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="riskLevel"
                  tickFormatter={(value) => getRiskText(value).replace('风险', '')}
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value: any, name?: string) => {
                    if (name === 'totalMerchants') return [value, '总商户数'];
                    if (name === 'inspectedMerchants') return [value, '已巡检数'];
                    return [value, name];
                  }}
                  labelFormatter={(label) => getRiskText(label)}
                />
                <Legend
                  formatter={(value) => {
                    if (value === 'totalMerchants') return '总商户数';
                    if (value === 'inspectedMerchants') return '已巡检数';
                    return value;
                  }}
                />
                <Bar dataKey="totalMerchants" fill="#94a3b8" />
                <Bar dataKey="inspectedMerchants" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 覆盖率列表 */}
          <div className="mt-4 space-y-2">
            {stats.byRiskLevel.map((item) => (
              <div key={item.riskLevel} className="flex items-center justify-between text-sm">
                <span className="text-slate-600">{getRiskText(item.riskLevel)}</span>
                <span className={`font-medium ${
                  item.coverageRate >= 80 ? 'text-green-600' :
                  item.coverageRate >= 50 ? 'text-orange-600' :
                  'text-red-600'
                }`}>
                  {item.coverageRate}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 完成率趋势图 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 lg:p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">完成率趋势</h3>
          <div className="h-64 lg:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend
                  formatter={(value) => {
                    if (value === 'completionRate') return '完成率(%)';
                    if (value === 'requiredCount') return '应巡检数';
                    if (value === 'completedCount') return '已完成数';
                    return value;
                  }}
                />
                <Line type="monotone" dataKey="completionRate" stroke="#3b82f6" strokeWidth={2} name="完成率(%)" />
                <Line type="monotone" dataKey="requiredCount" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" name="应巡检数" />
                <Line type="monotone" dataKey="completedCount" stroke="#22c55e" strokeWidth={2} name="已完成数" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 超期商户列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 lg:p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">超期未巡检商户</h3>

        {overdueMerchants.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            <i className="fa-solid fa-check-circle text-4xl mb-3 text-green-400"></i>
            <p className="text-sm">暂无超期商户</p>
          </div>
        ) : (
          <>
            {isMobileView ? (
              <div className="space-y-3">
                {overdueMerchants.map((item) => (
                  <div
                    key={item.merchant.id}
                    className="border-2 border-red-200 rounded-xl p-4 bg-red-50"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-slate-900">{item.merchant.name}</h4>
                        <p className="text-xs text-slate-500">{item.merchant.category}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold border ${
                        item.merchant.riskLevel === 'critical' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                        item.merchant.riskLevel === 'high' ? 'bg-red-100 text-red-800 border-red-200' :
                        item.merchant.riskLevel === 'medium' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                        'bg-yellow-100 text-yellow-800 border-yellow-200'
                      }`}>
                        {getRiskText(item.merchant.riskLevel)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                      <div>
                        <span className="text-slate-500">超期天数：</span>
                        <span className="font-medium text-red-600">
                          {item.overdueDays === 999 ? '从未巡检' : `${item.overdueDays}天`}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">要求频率：</span>
                        <span className="font-medium">{getFrequencyText({ requiredFrequency: item.requiredFrequency } as InspectionPolicy)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleInspectMerchant(item.merchant.id)}
                      className="w-full py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                    >
                      立即巡检
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">商户名称</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">业态</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">风险等级</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">超期天数</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">要求频率</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">优先级</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">操作</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {overdueMerchants.map((item) => (
                      <tr key={item.merchant.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">{item.merchant.name}</td>
                        <td className="px-4 py-3 text-sm text-slate-500">{item.merchant.category}</td>
                        <td className="px-4 py-3 text-sm">
                          <span style={{ color: getRiskColor(item.merchant.riskLevel) }} className="font-medium">
                            {getRiskText(item.merchant.riskLevel)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-red-600 font-medium">
                          {item.overdueDays === 999 ? '从未巡检' : `${item.overdueDays}天`}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {getFrequencyText({ requiredFrequency: item.requiredFrequency } as InspectionPolicy)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                            item.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            item.priority === 'normal' ? 'bg-blue-100 text-blue-800' :
                            'bg-slate-100 text-slate-800'
                          }`}>
                            {getPriorityText(item.priority)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <button
                            onClick={() => handleInspectMerchant(item.merchant.id)}
                            className="px-3 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition-colors"
                          >
                            立即巡检
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* 巡检员排行榜 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 lg:p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">巡检员排行榜</h3>

        {stats.byInspector.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            <i className="fa-solid fa-user-slash text-4xl mb-3"></i>
            <p className="text-sm">暂无巡检员数据</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {stats.byInspector.map((inspector, index) => (
              <div
                key={inspector.inspectorId}
                className={`p-4 rounded-xl border-2 ${
                  index === 0 ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300' :
                  index === 1 ? 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-300' :
                  index === 2 ? 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-300' :
                  'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold ${
                      index === 0 ? 'text-yellow-600' :
                      index === 1 ? 'text-slate-600' :
                      index === 2 ? 'text-orange-600' :
                      'text-slate-400'
                    }`}>
                      #{index + 1}
                    </span>
                    {index < 3 && (
                      <i className={`fa-solid fa-medal text-xl ${
                        index === 0 ? 'text-yellow-500' :
                        index === 1 ? 'text-slate-400' :
                        'text-orange-500'
                      }`}></i>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-slate-900">{inspector.qualityScore}</div>
                    <div className="text-xs text-slate-500">质量分</div>
                  </div>
                </div>

                <h4 className="font-bold text-slate-900 mb-2">{inspector.inspectorName}</h4>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">完成次数：</span>
                    <span className="font-medium">{inspector.completedInspections}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">平均照片数：</span>
                    <span className="font-medium">{inspector.avgPhotosPerInspection}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">平均评分：</span>
                    <span className="font-medium">{inspector.avgRating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 策略设置弹窗 */}
      {showPolicyModal && (
        <div
          onClick={() => setShowPolicyModal(false)}
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-2xl max-h-[90dvh] overflow-y-auto rounded-t-2xl sm:rounded-xl shadow-2xl p-6 animate-fade-in-up"
          >
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 sm:hidden"></div>
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
              <i className="fa-solid fa-gear mr-3 text-slate-600"></i>
              巡检策略设置
            </h3>

            <div className="space-y-4">
              {policies.map((policy) => (
                <div
                  key={policy.id}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-brand-300 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        style={{ color: getRiskColor(policy.riskLevel) }}
                        className="font-bold"
                      >
                        {getRiskText(policy.riskLevel)}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        policy.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                        policy.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                        policy.priority === 'normal' ? 'bg-blue-100 text-blue-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {getPriorityText(policy.priority)}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600">
                      要求频率：{getFrequencyText(policy)}
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={policy.enabled}
                      onChange={(e) => handlePolicyToggle(policy.id, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
                  </label>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowPolicyModal(false)}
                className="px-6 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
