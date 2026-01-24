'use client';

import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Task } from '@/types';

interface TaskCalendarProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

export default function TaskCalendar({ tasks, onTaskClick }: TaskCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  // 获取当前月份的日历数据
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // 获取当月第一天和最后一天
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // 获取第一天是星期几（0=周日，1=周一...）
    const firstDayOfWeek = firstDay.getDay();

    // 计算需要显示的天数（包括上月和下月的部分天数）
    const daysInMonth = lastDay.getDate();
    const totalDays = Math.ceil((firstDayOfWeek + daysInMonth) / 7) * 7;

    const days = [];
    for (let i = 0; i < totalDays; i++) {
      const dayOffset = i - firstDayOfWeek;
      const date = new Date(year, month, dayOffset + 1);
      const dateStr = date.toISOString().split('T')[0];

      // 找出这一天的所有任务和里程碑
      const dayTasks = tasks.filter(task => {
        // 检查任务截止日期
        if (task.deadline === dateStr) return true;

        // 检查里程碑日期
        if (task.milestones) {
          return task.milestones.some(m => m.dueDate === dateStr);
        }

        return false;
      });

      days.push({
        date,
        dateStr,
        isCurrentMonth: date.getMonth() === month,
        isToday: dateStr === new Date().toISOString().split('T')[0],
        tasks: dayTasks
      });
    }

    return days;
  }, [currentDate, tasks]);

  // 切换月份
  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  // 切换到今天
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // 获取任务的颜色
  const getTaskColor = (task: Task) => {
    if (task.stage === 'completed') return 'bg-green-100 text-green-700 border-green-300';
    if (task.stage === 'exit') return 'bg-red-100 text-red-700 border-red-300';
    if (task.riskLevel === 'high') return 'bg-red-50 text-red-600 border-red-200';
    if (task.riskLevel === 'medium') return 'bg-orange-50 text-orange-600 border-orange-200';
    return 'bg-blue-50 text-blue-600 border-blue-200';
  };

  // 检查是否逾期
  const isOverdue = (task: Task) => {
    const today = new Date().toISOString().split('T')[0];
    return task.deadline < today && task.stage !== 'completed' && task.stage !== 'exit';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4 lg:p-6">
      {/* 头部控制栏 */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <CalendarIcon className="text-brand-600" size={24} />
          <h3 className="text-xl font-bold text-slate-900">
            {currentDate.getFullYear()}年 {currentDate.getMonth() + 1}月
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => changeMonth(-1)}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={goToToday}
            className="px-4 py-2 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition"
          >
            今天
          </button>

          <button
            onClick={() => changeMonth(1)}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* 星期标题 */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {['日', '一', '二', '三', '四', '五', '六'].map((day, i) => (
          <div
            key={i}
            className="text-center text-sm font-bold text-slate-600 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* 日历网格 */}
      <div className="grid grid-cols-7 gap-2">
        {calendarData.map((day, i) => (
          <div
            key={i}
            className={`min-h-[100px] lg:min-h-[120px] border rounded-lg p-2 transition ${
              day.isCurrentMonth
                ? 'bg-white border-slate-200'
                : 'bg-slate-50 border-slate-100'
            } ${
              day.isToday
                ? 'ring-2 ring-brand-500 border-brand-500'
                : ''
            }`}
          >
            {/* 日期数字 */}
            <div className="flex justify-between items-start mb-2">
              <span
                className={`text-sm font-medium ${
                  day.isToday
                    ? 'bg-brand-600 text-white w-6 h-6 rounded-full flex items-center justify-center'
                    : day.isCurrentMonth
                    ? 'text-slate-700'
                    : 'text-slate-400'
                }`}
              >
                {day.date.getDate()}
              </span>

              {day.tasks.length > 0 && (
                <span className="text-xs bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                  {day.tasks.length}
                </span>
              )}
            </div>

            {/* 任务列表 */}
            <div className="space-y-1">
              {day.tasks.slice(0, 3).map((task, idx) => {
                const overdue = isOverdue(task);
                return (
                  <div
                    key={idx}
                    onClick={() => onTaskClick?.(task)}
                    className={`text-xs p-1.5 rounded border cursor-pointer hover:shadow-sm transition truncate ${
                      overdue
                        ? 'bg-red-100 text-red-700 border-red-300'
                        : getTaskColor(task)
                    }`}
                    title={task.merchantName}
                  >
                    {overdue && <span className="mr-1">⚠️</span>}
                    {task.merchantName}
                  </div>
                );
              })}

              {day.tasks.length > 3 && (
                <div className="text-xs text-slate-500 text-center">
                  +{day.tasks.length - 3} 更多
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 图例 */}
      <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
          <span className="text-slate-600">逾期/高风险</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-50 border border-orange-200 rounded"></div>
          <span className="text-slate-600">中风险</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded"></div>
          <span className="text-slate-600">正常</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
          <span className="text-slate-600">已完成</span>
        </div>
      </div>
    </div>
  );
}
