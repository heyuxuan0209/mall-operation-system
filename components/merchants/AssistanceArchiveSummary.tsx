'use client';

import React, { useMemo, useState } from 'react';
import { AssistanceArchive } from '@/types';
import { historyArchiveService } from '@/utils/historyArchiveService';
import { mockTasks } from '@/data/tasks/mock-data';
import StatDetailModal from './StatDetailModal';

interface AssistanceArchiveSummaryProps {
  archive: AssistanceArchive;
  merchantId: string;
  onExport?: () => void;
}

/**
 * 帮扶档案摘要卡片
 * 展示商户历史帮扶的核心统计数据
 */
export default function AssistanceArchiveSummary({
  archive,
  merchantId,
  onExport,
}: AssistanceArchiveSummaryProps) {
  // 模态框状态
  const [modalState, setModalState] = useState<{
    type: 'snapshots' | 'riskChanges' | 'tasks' | 'improvements' | 'deteriorations' | null;
  }>({ type: null });

  // 获取原始数据用于模态框
  const snapshots = useMemo(() => {
    return historyArchiveService.getSnapshots(merchantId);
  }, [merchantId]);

  const riskChanges = useMemo(() => {
    return historyArchiveService.getRiskChanges(merchantId);
  }, [merchantId]);

  const tasks = useMemo(() => {
    return mockTasks.filter(t => t.merchantId === merchantId);
  }, [merchantId]);

  // 风险等级标签样式
  const getRiskBadge = (level: string) => {
    const styles = {
      'critical': 'bg-purple-100 text-purple-800 border-purple-200',
      'high': 'bg-red-100 text-red-800 border-red-200',
      'medium': 'bg-orange-100 text-orange-800 border-orange-200',
      'low': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'none': 'bg-green-100 text-green-800 border-green-200'
    };
    const labels = {
      'critical': '极高风险',
      'high': '高风险',
      'medium': '中风险',
      'low': '低风险',
      'none': '无风险'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[level as keyof typeof styles]}`}>
        {labels[level as keyof typeof labels]}
      </span>
    );
  };

  // 趋势图标
  const getTrendIcon = (trend: string) => {
    if (trend === 'improving') {
      return <i className="fa-solid fa-arrow-trend-up text-green-500"></i>;
    } else if (trend === 'declining') {
      return <i className="fa-solid fa-arrow-trend-down text-red-500"></i>;
    }
    return <i className="fa-solid fa-minus text-slate-400"></i>;
  };

  // 格式化日期
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      {/* 头部 */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <i className="fa-solid fa-folder-open text-2xl"></i>
            <div>
              <h3 className="text-lg font-bold">帮扶档案摘要</h3>
              <p className="text-indigo-100 text-xs mt-0.5">
                首次记录: {formatDate(archive.keyDates.firstRecordDate)}
              </p>
            </div>
          </div>
          {onExport && (
            <button
              onClick={onExport}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm flex items-center gap-2 transition"
            >
              <i className="fa-solid fa-download"></i>
              导出
            </button>
          )}
        </div>
      </div>

      {/* 当前状态 */}
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500 mb-1">当前风险等级</div>
            <div className="flex items-center gap-2">
              {getRiskBadge(archive.currentStatus.riskLevel)}
              <span className="text-sm text-slate-600">
                已持续 <span className="font-semibold text-slate-900">{archive.currentStatus.daysInCurrentLevel}</span> 天
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500 mb-1">健康度评分</div>
            <div className="text-2xl font-bold text-slate-900">
              {archive.currentStatus.totalScore}
              <span className="text-sm text-slate-500 ml-1">/ 100</span>
            </div>
          </div>
        </div>
      </div>

      {/* 统计数据网格 */}
      <div className="p-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
        {/* 总快照数 - 可点击 */}
        <button
          onClick={() => setModalState({ type: 'snapshots' })}
          className="bg-slate-50 rounded-lg p-4 hover:bg-slate-100 hover:shadow-md transition-all cursor-pointer text-left w-full"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-camera text-slate-400"></i>
              <span className="text-xs text-slate-500">历史记录</span>
            </div>
            <i className="fas fa-chevron-right text-slate-400 text-xs"></i>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {archive.stats.totalSnapshots}
          </div>
          <div className="text-xs text-slate-500 mt-1">个快照 · 点击查看明细</div>
        </button>

        {/* 风险变更次数 - 可点击 */}
        <button
          onClick={() => setModalState({ type: 'riskChanges' })}
          className="bg-slate-50 rounded-lg p-4 hover:bg-slate-100 hover:shadow-md transition-all cursor-pointer text-left w-full"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-exchange-alt text-slate-400"></i>
              <span className="text-xs text-slate-500">风险变更</span>
            </div>
            <i className="fas fa-chevron-right text-slate-400 text-xs"></i>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {archive.stats.riskChangeCount}
          </div>
          <div className="text-xs text-slate-500 mt-1">次变化 · 点击查看明细</div>
        </button>

        {/* 帮扶任务 - 可点击 */}
        <button
          onClick={() => setModalState({ type: 'tasks' })}
          className="bg-slate-50 rounded-lg p-4 hover:bg-slate-100 hover:shadow-md transition-all cursor-pointer text-left w-full"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-tasks text-slate-400"></i>
              <span className="text-xs text-slate-500">帮扶任务</span>
            </div>
            <i className="fas fa-chevron-right text-slate-400 text-xs"></i>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {archive.stats.completedTaskCount}
            <span className="text-sm text-slate-500">/{archive.stats.assistanceTaskCount}</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">已完成 · 点击查看明细</div>
        </button>

        {/* 改善次数 - 可点击 */}
        <button
          onClick={() => setModalState({ type: 'improvements' })}
          className="bg-green-50 rounded-lg p-4 border border-green-100 hover:bg-green-100 hover:shadow-md transition-all cursor-pointer text-left w-full"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-arrow-up text-green-500"></i>
              <span className="text-xs text-green-600">风险降低</span>
            </div>
            <i className="fas fa-chevron-right text-green-400 text-xs"></i>
          </div>
          <div className="text-2xl font-bold text-green-700">
            {archive.stats.improvementCount}
          </div>
          <div className="text-xs text-green-600 mt-1">次改善 · 点击查看明细</div>
        </button>

        {/* 恶化次数 - 可点击 */}
        <button
          onClick={() => setModalState({ type: 'deteriorations' })}
          className="bg-red-50 rounded-lg p-4 border border-red-100 hover:bg-red-100 hover:shadow-md transition-all cursor-pointer text-left w-full"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-arrow-down text-red-500"></i>
              <span className="text-xs text-red-600">风险升高</span>
            </div>
            <i className="fas fa-chevron-right text-red-400 text-xs"></i>
          </div>
          <div className="text-2xl font-bold text-red-700">
            {archive.stats.deteriorationCount}
          </div>
          <div className="text-xs text-red-600 mt-1">次恶化 · 点击查看明细</div>
        </button>

        {/* 帮扶成功率 */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <i className="fa-solid fa-chart-line text-blue-500"></i>
            <span className="text-xs text-blue-600">成功率</span>
          </div>
          <div className="text-2xl font-bold text-blue-700">
            {archive.stats.successRate}%
          </div>
          <div className="text-xs text-blue-600 mt-1">帮扶效果</div>
        </div>
      </div>

      {/* 健康度趋势 */}
      <div className="px-6 pb-6">
        <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg p-4 border border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <i className="fa-solid fa-heart-pulse text-slate-600"></i>
            <h4 className="font-semibold text-slate-800 text-sm">健康度趋势</h4>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <div className="text-xs text-slate-500 mb-1">最高分</div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-green-600">
                  {archive.healthTrend.highest.score}
                </span>
                <span className="text-xs text-slate-500">
                  {formatDate(archive.healthTrend.highest.date)}
                </span>
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">最低分</div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-red-600">
                  {archive.healthTrend.lowest.score}
                </span>
                <span className="text-xs text-slate-500">
                  {formatDate(archive.healthTrend.lowest.date)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">平均分</span>
              <span className="font-semibold text-slate-900">{archive.healthTrend.average}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">近30天</span>
              {getTrendIcon(archive.healthTrend.recent30DaysTrend)}
              <span className="text-sm font-medium text-slate-700">
                {archive.healthTrend.recent30DaysTrend === 'improving' ? '改善中' :
                 archive.healthTrend.recent30DaysTrend === 'declining' ? '下降中' : '稳定'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 最长高风险期提示 */}
      {archive.keyDates.longestHighRiskPeriod && (
        <div className="px-6 pb-6">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <i className="fa-solid fa-triangle-exclamation text-orange-500 mt-0.5"></i>
              <div className="flex-1">
                <div className="text-sm font-medium text-orange-900 mb-1">
                  最长高风险期
                </div>
                <div className="text-xs text-orange-700">
                  {formatDate(archive.keyDates.longestHighRiskPeriod.startDate)} - {formatDate(archive.keyDates.longestHighRiskPeriod.endDate)}
                  <span className="ml-2 font-semibold">
                    ({archive.keyDates.longestHighRiskPeriod.days}天)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 统计明细弹窗 */}
      {modalState.type && (
        <StatDetailModal
          type={modalState.type}
          data={{
            snapshots,
            riskChanges,
            tasks,
          }}
          onClose={() => setModalState({ type: null })}
        />
      )}
    </div>
  );
}
