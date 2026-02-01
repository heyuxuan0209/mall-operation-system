'use client';

import React, { useState } from 'react';
import { Task } from '@/types';

interface TaskCardProps {
  task: Task;
}

/**
 * 任务卡片组件
 * 展示单个帮扶任务的详细信息，包括措施效果和执行时间线
 */
export function TaskCard({ task }: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // 获取状态标签样式
  const getStatusBadge = (status: Task['status']) => {
    const styles = {
      pending: 'bg-gray-100 text-gray-700',
      in_progress: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700',
    };
    const labels = {
      pending: '待处理',
      in_progress: '进行中',
      completed: '已完成',
      failed: '已失败',
    };
    return { style: styles[status], label: labels[status] };
  };

  // 获取优先级标签
  const getPriorityBadge = (priority: Task['priority']) => {
    const styles = {
      low: 'bg-gray-100 text-gray-600',
      medium: 'bg-yellow-100 text-yellow-700',
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700',
    };
    const labels = {
      low: '低',
      medium: '中',
      high: '高',
      urgent: '紧急',
    };
    return { style: styles[priority], label: labels[priority] };
  };

  // 获取有效性标签样式
  const getEffectivenessBadge = (effectiveness: 'high' | 'medium' | 'low') => {
    const styles = {
      high: 'bg-green-100 text-green-700 border-green-300',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      low: 'bg-red-100 text-red-700 border-red-300',
    };
    const labels = {
      high: '高效',
      medium: '中效',
      low: '低效',
    };
    return { style: styles[effectiveness], label: labels[effectiveness] };
  };

  // 获取维度中文标签
  const getDimensionLabel = (dimension: string) => {
    const labels: Record<string, string> = {
      collection: '租金缴纳',
      operational: '经营表现',
      siteQuality: '店铺品质',
      customerReview: '顾客满意',
      riskResistance: '抗风险能力',
    };
    return labels[dimension] || dimension;
  };

  const statusBadge = getStatusBadge(task.status);
  const priorityBadge = getPriorityBadge(task.priority);

  return (
    <div className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
      {/* 卡片头部 */}
      <div
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between gap-4">
          {/* 左侧信息 */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-500">{task.id}</span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusBadge.style}`}>
                {statusBadge.label}
              </span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityBadge.style}`}>
                优先级: {priorityBadge.label}
              </span>
            </div>

            <h4 className="text-md font-semibold text-gray-900 mb-2">{task.title}</h4>

            <p className="text-sm text-gray-600 mb-3">{task.description}</p>

            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>
                <i className="fas fa-calendar-alt mr-1"></i>
                {task.startDate} ~ {task.deadline}
              </span>
              <span>
                <i className="fas fa-user mr-1"></i>
                {task.assignedTo}
              </span>
            </div>
          </div>

          {/* 展开/折叠图标 */}
          <div className="flex-shrink-0">
            <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} text-gray-400`}></i>
          </div>
        </div>
      </div>

      {/* 展开内容 */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          {/* 措施及效果 */}
          {task.measureEffects && task.measureEffects.length > 0 && (
            <div className="mb-6">
              <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <i className="fas fa-tasks text-indigo-600"></i>
                措施及效果
              </h5>

              <div className="space-y-3">
                {task.measureEffects.map((effect, index) => {
                  const effectBadge = getEffectivenessBadge(effect.effectiveness);

                  return (
                    <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                      {/* 措施名称和标签 */}
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 mb-1">
                            {effect.measure}
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${effectBadge.style}`}
                        >
                          {effectBadge.label}
                        </span>
                      </div>

                      {/* 目标维度和改善值 */}
                      <div className="flex items-center gap-4 mb-2 text-sm">
                        <span className="text-gray-600">
                          目标维度: <span className="font-medium text-gray-900">{getDimensionLabel(effect.targetDimension)}</span>
                        </span>
                        <span className="text-gray-600">
                          {effect.beforeScore}分
                          <i className="fas fa-arrow-right mx-2 text-xs text-gray-400"></i>
                          <span className="font-semibold text-green-600">{effect.afterScore}分</span>
                          <span className="ml-2 text-green-600 font-semibold">
                            (+{effect.improvement}分)
                          </span>
                        </span>
                      </div>

                      {/* 证据 */}
                      {effect.evidence && (
                        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                          <i className="fas fa-check-circle mr-2 text-blue-600"></i>
                          <strong>证据</strong>: {effect.evidence}
                        </div>
                      )}

                      {/* 实施和评估日期 */}
                      {(effect.implementationDate || effect.evaluationDate) && (
                        <div className="mt-2 flex gap-4 text-xs text-gray-500">
                          {effect.implementationDate && (
                            <span>
                              <i className="fas fa-play-circle mr-1"></i>
                              实施: {effect.implementationDate}
                            </span>
                          )}
                          {effect.evaluationDate && (
                            <span>
                              <i className="fas fa-chart-line mr-1"></i>
                              评估: {effect.evaluationDate}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 执行时间线 */}
          {task.executionTimeline && task.executionTimeline.length > 0 && (
            <div>
              <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <i className="fas fa-stream text-indigo-600"></i>
                执行时间线
              </h5>

              <div className="space-y-2">
                {task.executionTimeline.map((item, index) => {
                  const statusIcons = {
                    pending: 'fa-clock text-gray-400',
                    in_progress: 'fa-spinner fa-spin text-blue-500',
                    completed: 'fa-check-circle text-green-500',
                    blocked: 'fa-exclamation-triangle text-red-500',
                  };

                  const statusLabels = {
                    pending: '待执行',
                    in_progress: '执行中',
                    completed: '已完成',
                    blocked: '受阻',
                  };

                  return (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-white rounded border border-gray-200"
                    >
                      {/* 状态图标 */}
                      <div className="flex-shrink-0 mt-0.5">
                        <i className={`fas ${statusIcons[item.status]}`}></i>
                      </div>

                      {/* 里程碑信息 */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {item.milestone}
                          </span>
                          <span className="text-xs text-gray-500">{item.date}</span>
                        </div>

                        {item.notes && (
                          <p className="text-xs text-gray-600 mt-1">{item.notes}</p>
                        )}

                        <div className="text-xs text-gray-500 mt-1">
                          状态: {statusLabels[item.status]}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 如果没有措施效果和执行时间线 */}
          {(!task.measureEffects || task.measureEffects.length === 0) &&
            (!task.executionTimeline || task.executionTimeline.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-inbox text-4xl mb-2"></i>
                <p className="text-sm">暂无措施效果和执行时间线数据</p>
              </div>
            )}
        </div>
      )}
    </div>
  );
}

export default TaskCard;
