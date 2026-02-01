'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Merchant, AssistanceArchive, MerchantSnapshot, RiskLevelChange, HistoryTrendPoint } from '@/types';
import { historyArchiveService } from '@/utils/historyArchiveService';
import AssistanceArchiveSummary from './AssistanceArchiveSummary';
import RiskLevelTimeline from './RiskLevelTimeline';
import HealthScoreTrendChart from './HealthScoreTrendChart';
import TaskListTab from './TaskListTab';

interface MerchantHistoryArchiveProps {
  merchant: Merchant;
}

/**
 * 商户历史帮扶档案主组件
 * 整合档案摘要、风险时间线、健康度趋势图等子组件
 */
export default function MerchantHistoryArchive({
  merchant,
}: MerchantHistoryArchiveProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'timeline' | 'trend' | 'tasks'>('summary');
  const [trendDays, setTrendDays] = useState(90); // 默认显示90天
  const [isExporting, setIsExporting] = useState(false);

  // 生成档案摘要
  const archive = useMemo(() => {
    return historyArchiveService.generateArchive(merchant.id);
  }, [merchant.id]);

  // 获取风险变更记录
  const riskChanges = useMemo(() => {
    return historyArchiveService.getRiskChanges(merchant.id);
  }, [merchant.id]);

  // 获取历史趋势数据
  const trendPoints = useMemo(() => {
    return historyArchiveService.getHistoryTrend(merchant.id, trendDays);
  }, [merchant.id, trendDays]);

  // 导出档案
  const handleExport = () => {
    setIsExporting(true);
    try {
      const jsonData = historyArchiveService.exportArchive(merchant.id);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${merchant.name}-帮扶档案-${new Date().toLocaleDateString('zh-CN')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('导出档案失败:', error);
      alert('导出失败，请稍后重试');
    } finally {
      setIsExporting(false);
    }
  };

  if (!archive) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
        <div className="text-center">
          <i className="fa-solid fa-folder-open text-4xl text-slate-300 mb-3"></i>
          <p className="text-slate-500">该商户暂无历史帮扶档案</p>
          <p className="text-slate-400 text-sm mt-2">完成巡检或创建帮扶任务后将自动建立档案</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 查看完整档案按钮 */}
      <div className="flex justify-end">
        <Link
          href={`/archives/${merchant.id}`}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 text-sm font-medium shadow-sm"
        >
          <i className="fas fa-expand-alt"></i>
          查看完整档案
        </Link>
      </div>

      {/* Tab导航 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition ${
              activeTab === 'summary'
                ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
                : 'bg-slate-50 text-slate-600 hover:text-slate-900'
            }`}
          >
            <i className="fa-solid fa-chart-pie mr-2"></i>
            档案摘要
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition ${
              activeTab === 'timeline'
                ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
                : 'bg-slate-50 text-slate-600 hover:text-slate-900'
            }`}
          >
            <i className="fa-solid fa-timeline mr-2"></i>
            风险时间线
            {riskChanges.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded-full text-xs">
                {riskChanges.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('trend')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition ${
              activeTab === 'trend'
                ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
                : 'bg-slate-50 text-slate-600 hover:text-slate-900'
            }`}
          >
            <i className="fa-solid fa-chart-line mr-2"></i>
            健康度趋势
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition ${
              activeTab === 'tasks'
                ? 'bg-white text-indigo-600 border-b-2 border-indigo-600'
                : 'bg-slate-50 text-slate-600 hover:text-slate-900'
            }`}
          >
            <i className="fa-solid fa-list-check mr-2"></i>
            帮扶任务清单
            {archive && archive.stats.assistanceTaskCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded-full text-xs">
                {archive.stats.assistanceTaskCount}
              </span>
            )}
          </button>
        </div>

        {/* Tab内容 */}
        <div className="p-6">
          {/* 档案摘要 */}
          {activeTab === 'summary' && (
            <AssistanceArchiveSummary
              archive={archive}
              merchantId={merchant.id}
              onExport={handleExport}
            />
          )}

          {/* 风险时间线 */}
          {activeTab === 'timeline' && (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  风险等级变更历史
                </h3>
                <p className="text-sm text-slate-500">
                  记录商户风险等级的所有变化，追踪帮扶效果
                </p>
              </div>

              <RiskLevelTimeline
                changes={riskChanges}
                onEventClick={(change) => {
                  console.log('点击风险变更记录:', change);
                }}
              />
            </div>
          )}

          {/* 健康度趋势 */}
          {activeTab === 'trend' && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    健康度演进趋势
                  </h3>
                  <p className="text-sm text-slate-500">
                    可视化展示商户健康度的历史变化
                  </p>
                </div>

                {/* 时间范围选择器 */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">时间范围:</span>
                  <select
                    value={trendDays}
                    onChange={(e) => setTrendDays(Number(e.target.value))}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={30}>近30天</option>
                    <option value={90}>近90天</option>
                    <option value={180}>近半年</option>
                    <option value={365}>近一年</option>
                  </select>
                </div>
              </div>

              <HealthScoreTrendChart
                trendPoints={trendPoints}
                showDimensions={true}
              />

              {/* 数据点统计 */}
              <div className="mt-4 flex items-center justify-center gap-6 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <i className="fa-solid fa-database"></i>
                  <span>数据点: {trendPoints.length}</span>
                </div>
                <div className="flex items-center gap-1">
                  <i className="fa-solid fa-calendar"></i>
                  <span>时间跨度: {trendDays}天</span>
                </div>
                {trendPoints.length > 0 && (
                  <div className="flex items-center gap-1">
                    <i className="fa-solid fa-clock"></i>
                    <span>
                      最近更新: {new Date(trendPoints[trendPoints.length - 1].date).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 帮扶任务清单 */}
          {activeTab === 'tasks' && (
            <TaskListTab
              merchantId={merchant.id}
              merchantName={merchant.name}
            />
          )}
        </div>
      </div>

      {/* 快速操作面板 */}
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-lightbulb text-blue-500 text-xl"></i>
            <div>
              <h4 className="font-semibold text-slate-900 text-sm">快速操作</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                档案数据已生成于 {new Date(archive.generatedAt).toLocaleString('zh-CN')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className={`fa-solid ${isExporting ? 'fa-spinner fa-spin' : 'fa-download'}`}></i>
              {isExporting ? '导出中...' : '导出档案'}
            </button>

            <button
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition text-sm flex items-center gap-2"
              onClick={() => {
                // 刷新数据（在真实场景中可能需要重新加载）
                window.location.reload();
              }}
            >
              <i className="fa-solid fa-refresh"></i>
              刷新数据
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
