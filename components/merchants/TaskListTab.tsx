'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { Task } from '@/types';
import { mockTasks } from '@/data/tasks/mock-data';
import { TaskCard } from './TaskCard';
import { MeasureEffectivenessAnalysis } from './MeasureEffectivenessAnalysis';

interface TaskListTabProps {
  merchantId: string;
  merchantName: string;
}

/**
 * 帮扶任务清单Tab组件
 * 展示商户的所有帮扶任务列表及措施有效性分析
 */
export function TaskListTab({ merchantId, merchantName }: TaskListTabProps) {
  // 获取该商户的所有任务
  const merchantTasks = useMemo(() => {
    return mockTasks.filter(t => t.merchantId === merchantId);
  }, [merchantId]);

  // 按状态分组
  const tasksByStatus = useMemo(() => {
    return {
      in_progress: merchantTasks.filter(t => t.status === 'in_progress'),
      completed: merchantTasks.filter(t => t.status === 'completed'),
      pending: merchantTasks.filter(t => t.status === 'pending'),
      failed: merchantTasks.filter(t => t.status === 'failed'),
    };
  }, [merchantTasks]);

  // 如果没有任务
  if (merchantTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="text-center">
          <i className="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">暂无帮扶任务</h3>
          <p className="text-sm text-gray-500 mb-6">该商户尚未创建帮扶任务</p>
          <Link
            href={`/tasks?merchantId=${merchantId}&fromArchive=true`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <i className="fas fa-plus"></i>
            创建帮扶任务
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 任务统计卡片 */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-4">
          {merchantName} - 帮扶任务总览
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white bg-opacity-20 p-4 rounded-lg">
            <div className="text-sm opacity-90 mb-1">总任务数</div>
            <div className="text-3xl font-bold">{merchantTasks.length}</div>
          </div>
          <div className="bg-white bg-opacity-20 p-4 rounded-lg">
            <div className="text-sm opacity-90 mb-1">进行中</div>
            <div className="text-3xl font-bold text-blue-200">
              {tasksByStatus.in_progress.length}
            </div>
          </div>
          <div className="bg-white bg-opacity-20 p-4 rounded-lg">
            <div className="text-sm opacity-90 mb-1">已完成</div>
            <div className="text-3xl font-bold text-green-200">
              {tasksByStatus.completed.length}
            </div>
          </div>
          <div className="bg-white bg-opacity-20 p-4 rounded-lg">
            <div className="text-sm opacity-90 mb-1">完成率</div>
            <div className="text-3xl font-bold">
              {merchantTasks.length > 0
                ? Math.round((tasksByStatus.completed.length / merchantTasks.length) * 100)
                : 0}%
            </div>
          </div>
        </div>
      </div>

      {/* 进行中的任务 */}
      {tasksByStatus.in_progress.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <i className="fas fa-spinner fa-pulse text-blue-600"></i>
            进行中的任务 ({tasksByStatus.in_progress.length})
          </h4>
          <div className="space-y-4">
            {tasksByStatus.in_progress.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}

      {/* 已完成的任务 */}
      {tasksByStatus.completed.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <i className="fas fa-check-circle text-green-600"></i>
            已完成的任务 ({tasksByStatus.completed.length})
          </h4>
          <div className="space-y-4">
            {tasksByStatus.completed.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}

      {/* 待处理的任务 */}
      {tasksByStatus.pending.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <i className="fas fa-clock text-gray-600"></i>
            待处理的任务 ({tasksByStatus.pending.length})
          </h4>
          <div className="space-y-4">
            {tasksByStatus.pending.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}

      {/* 失败的任务 */}
      {tasksByStatus.failed.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <i className="fas fa-times-circle text-red-600"></i>
            失败的任务 ({tasksByStatus.failed.length})
          </h4>
          <div className="space-y-4">
            {tasksByStatus.failed.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}

      {/* 措施有效性分析 */}
      <MeasureEffectivenessAnalysis tasks={merchantTasks} />

      {/* 提示信息 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <i className="fas fa-lightbulb text-yellow-600 mt-0.5"></i>
          <div className="text-sm text-yellow-800">
            <strong>提示</strong>: 点击任务卡片可展开查看详细的措施效果和执行时间线。
            措施有效性分析帮助您识别最有效的帮扶策略。
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskListTab;
