'use client';

import React, { useState } from 'react';
import { RiskLevelChange } from '@/types';

interface RiskLevelTimelineProps {
  changes: RiskLevelChange[];
  onEventClick?: (change: RiskLevelChange) => void;
}

/**
 * 风险等级时间线组件
 * 展示商户风险等级的历史变化记录
 */
export default function RiskLevelTimeline({
  changes,
  onEventClick,
}: RiskLevelTimelineProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // 风险等级样式配置
  const riskConfig = {
    critical: {
      color: 'purple',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-800',
      borderColor: 'border-purple-300',
      label: '极高风险',
      icon: 'fa-skull-crossbones',
    },
    high: {
      color: 'red',
      bgColor: 'bg-red-100',
      textColor: 'text-red-800',
      borderColor: 'border-red-300',
      label: '高风险',
      icon: 'fa-exclamation-circle',
    },
    medium: {
      color: 'orange',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-800',
      borderColor: 'border-orange-300',
      label: '中风险',
      icon: 'fa-exclamation-triangle',
    },
    low: {
      color: 'yellow',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-800',
      borderColor: 'border-yellow-300',
      label: '低风险',
      icon: 'fa-info-circle',
    },
    none: {
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-800',
      borderColor: 'border-green-300',
      label: '无风险',
      icon: 'fa-check-circle',
    },
  };

  // 获取风险等级配置
  const getConfig = (level: RiskLevelChange['fromLevel']) => {
    return riskConfig[level];
  };

  // 获取变化类型样式
  const getChangeStyle = (changeType: RiskLevelChange['changeType']) => {
    if (changeType === 'upgrade') {
      return {
        icon: 'fa-arrow-up',
        color: 'text-green-500',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        label: '改善',
      };
    } else if (changeType === 'downgrade') {
      return {
        icon: 'fa-arrow-down',
        color: 'text-red-500',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        label: '恶化',
      };
    }
    return {
      icon: 'fa-minus',
      color: 'text-slate-400',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200',
      label: '稳定',
    };
  };

  // 格式化日期
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 格式化相对时间
  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '昨天';
    if (diffDays < 7) return `${diffDays}天前`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}周前`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}个月前`;
    return `${Math.floor(diffDays / 365)}年前`;
  };

  // 切换展开状态
  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (changes.length === 0) {
    return (
      <div className="bg-slate-50 rounded-lg p-8 text-center">
        <i className="fa-solid fa-calendar-xmark text-4xl text-slate-300 mb-3"></i>
        <p className="text-slate-500 text-sm">暂无风险等级变更记录</p>
      </div>
    );
  }

  // 反向排序（最新的在前）
  const sortedChanges = [...changes].reverse();

  return (
    <div className="space-y-4">
      {/* 时间线 */}
      <div className="relative">
        {/* 垂直线 */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200"></div>

        {/* 事件列表 */}
        <div className="space-y-4">
          {sortedChanges.map((change, index) => {
            const changeStyle = getChangeStyle(change.changeType);
            const fromConfig = getConfig(change.fromLevel);
            const toConfig = getConfig(change.toLevel);
            const isExpanded = expandedId === change.id;

            return (
              <div key={change.id} className="relative pl-14">
                {/* 时间线节点 */}
                <div className={`absolute left-4 top-3 w-5 h-5 rounded-full border-2 ${changeStyle.borderColor} ${changeStyle.bgColor} flex items-center justify-center z-10`}>
                  <i className={`fa-solid ${changeStyle.icon} text-xs ${changeStyle.color}`}></i>
                </div>

                {/* 事件卡片 */}
                <div
                  className={`bg-white rounded-lg border ${changeStyle.borderColor} shadow-sm hover:shadow-md transition cursor-pointer`}
                  onClick={() => {
                    toggleExpand(change.id);
                    if (onEventClick) onEventClick(change);
                  }}
                >
                  {/* 卡片头部 */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        {/* 变化类型标签 */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${changeStyle.bgColor} ${changeStyle.color} border ${changeStyle.borderColor}`}>
                            {changeStyle.label}
                          </span>
                          <span className="text-xs text-slate-500">
                            {formatRelativeTime(change.timestamp)}
                          </span>
                        </div>

                        {/* 风险等级变化 */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${fromConfig.bgColor} ${fromConfig.textColor}`}>
                            {fromConfig.label}
                          </span>
                          <i className={`fa-solid ${changeStyle.icon} ${changeStyle.color}`}></i>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${toConfig.bgColor} ${toConfig.textColor}`}>
                            {toConfig.label}
                          </span>
                        </div>

                        {/* 评分变化 */}
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-slate-600">健康度:</span>
                          <span className="font-semibold text-slate-900">
                            {change.fromScore}
                          </span>
                          <i className="fa-solid fa-arrow-right text-slate-400 text-xs"></i>
                          <span className="font-semibold text-slate-900">
                            {change.toScore}
                          </span>
                          <span className={`text-xs ${change.scoreDelta > 0 ? 'text-green-600' : change.scoreDelta < 0 ? 'text-red-600' : 'text-slate-500'}`}>
                            ({change.scoreDelta > 0 ? '+' : ''}{change.scoreDelta})
                          </span>
                        </div>
                      </div>

                      {/* 展开按钮 */}
                      <button
                        className="text-slate-400 hover:text-slate-600 transition"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(change.id);
                        }}
                      >
                        <i className={`fa-solid fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
                      </button>
                    </div>

                    {/* 触发原因 */}
                    <div className="mt-2 text-xs text-slate-500">
                      <i className="fa-solid fa-info-circle mr-1"></i>
                      {change.trigger.description}
                    </div>
                  </div>

                  {/* 展开详情 */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 px-4 py-3 bg-slate-50">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">时间:</span>
                          <span className="font-medium text-slate-900">
                            {formatDate(change.timestamp)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">触发方式:</span>
                          <span className="font-medium text-slate-900">
                            {change.trigger.type === 'inspection' ? '巡检完成' :
                             change.trigger.type === 'task_completed' ? '任务完成' :
                             change.trigger.type === 'manual' ? '手动记录' : '自动检测'}
                          </span>
                        </div>
                        {change.taskId && (
                          <div className="flex justify-between">
                            <span className="text-slate-600">关联任务:</span>
                            <span className="font-medium text-blue-600 hover:underline cursor-pointer">
                              {change.taskId}
                            </span>
                          </div>
                        )}
                        {change.inspectionId && (
                          <div className="flex justify-between">
                            <span className="text-slate-600">关联巡检:</span>
                            <span className="font-medium text-blue-600 hover:underline cursor-pointer">
                              {change.inspectionId}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
