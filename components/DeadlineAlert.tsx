'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Clock, AlertTriangle } from 'lucide-react';

interface OverdueTask {
  id: string;
  merchantName: string;
  deadline: string;
  daysOverdue: number;
  stage: string;
}

interface UpcomingTask {
  id: string;
  merchantName: string;
  deadline: string;
  daysRemaining: number;
  stage: string;
}

export default function DeadlineAlert() {
  const [overdueTasks, setOverdueTasks] = useState<OverdueTask[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<UpcomingTask[]>([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    checkDeadlines();
    // 每分钟检查一次
    const interval = setInterval(checkDeadlines, 60000);
    return () => clearInterval(interval);
  }, []);

  const checkDeadlines = () => {
    // 从 localStorage 加载任务
    const storedTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const mockTasks = require('@/data/tasks/mock-data').mockTasks;
    const allTasks = [...mockTasks, ...storedTasks];

    const now = new Date();
    const overdue: OverdueTask[] = [];
    const upcoming: UpcomingTask[] = [];

    allTasks.forEach((task: any) => {
      // 只检查未完成的任务
      if (task.stage === 'completed' || task.stage === 'exit') return;

      const deadline = new Date(task.deadline);
      const diffTime = deadline.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        // 已逾期
        overdue.push({
          id: task.id,
          merchantName: task.merchantName,
          deadline: task.deadline,
          daysOverdue: Math.abs(diffDays),
          stage: task.stage
        });
      } else if (diffDays <= 3) {
        // 3天内到期
        upcoming.push({
          id: task.id,
          merchantName: task.merchantName,
          deadline: task.deadline,
          daysRemaining: diffDays,
          stage: task.stage
        });
      }
    });

    setOverdueTasks(overdue);
    setUpcomingTasks(upcoming);
  };

  // 如果没有预警或已关闭，不显示
  if (dismissed || (overdueTasks.length === 0 && upcomingTasks.length === 0)) {
    return null;
  }

  return (
    <div className="relative">
      {/* 逾期任务预警 - 红色 */}
      {overdueTasks.length > 0 && (
        <div className="bg-red-50 border-b border-red-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="flex-shrink-0">
                  <AlertTriangle className="text-red-600" size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">
                    <span className="font-bold">{overdueTasks.length}</span> 个任务已逾期
                  </p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {overdueTasks.slice(0, 3).map((task) => (
                      <Link
                        key={task.id}
                        href={`/tasks?taskId=${task.id}`}
                        className="text-xs text-red-700 hover:text-red-900 underline"
                      >
                        {task.merchantName} (逾期{task.daysOverdue}天)
                      </Link>
                    ))}
                    {overdueTasks.length > 3 && (
                      <Link
                        href="/tasks"
                        className="text-xs text-red-700 hover:text-red-900 font-medium"
                      >
                        +{overdueTasks.length - 3} 个任务
                      </Link>
                    )}
                  </div>
                </div>
                <Link
                  href="/tasks"
                  className="flex-shrink-0 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition"
                >
                  立即处理
                </Link>
              </div>
              <button
                onClick={() => setDismissed(true)}
                className="flex-shrink-0 ml-4 text-red-400 hover:text-red-600"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 即将到期任务提醒 - 橙色 */}
      {upcomingTasks.length > 0 && overdueTasks.length === 0 && (
        <div className="bg-orange-50 border-b border-orange-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="flex-shrink-0">
                  <Clock className="text-orange-600" size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-orange-800">
                    <span className="font-bold">{upcomingTasks.length}</span> 个任务即将到期
                  </p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {upcomingTasks.slice(0, 3).map((task) => (
                      <Link
                        key={task.id}
                        href={`/tasks?taskId=${task.id}`}
                        className="text-xs text-orange-700 hover:text-orange-900 underline"
                      >
                        {task.merchantName} ({task.daysRemaining === 0 ? '今天' : `${task.daysRemaining}天后`}到期)
                      </Link>
                    ))}
                    {upcomingTasks.length > 3 && (
                      <Link
                        href="/tasks"
                        className="text-xs text-orange-700 hover:text-orange-900 font-medium"
                      >
                        +{upcomingTasks.length - 3} 个任务
                      </Link>
                    )}
                  </div>
                </div>
                <Link
                  href="/tasks"
                  className="flex-shrink-0 px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition"
                >
                  查看详情
                </Link>
              </div>
              <button
                onClick={() => setDismissed(true)}
                className="flex-shrink-0 ml-4 text-orange-400 hover:text-orange-600"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
