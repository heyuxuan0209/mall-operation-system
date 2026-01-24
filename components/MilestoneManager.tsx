'use client';

import React, { useState } from 'react';
import { CheckCircle, Circle, Plus, Trash2, Edit2 } from 'lucide-react';
import { TaskMilestone } from '@/types';

interface MilestoneManagerProps {
  milestones: TaskMilestone[];
  onUpdate: (milestones: TaskMilestone[]) => void;
  readonly?: boolean;
}

export default function MilestoneManager({ milestones = [], onUpdate, readonly = false }: MilestoneManagerProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<TaskMilestone | null>(null);
  const [milestoneName, setMilestoneName] = useState('');
  const [milestoneDueDate, setMilestoneDueDate] = useState('');
  const [milestoneDescription, setMilestoneDescription] = useState('');

  const handleAddMilestone = () => {
    if (!milestoneName || !milestoneDueDate) return;

    const newMilestone: TaskMilestone = {
      id: `milestone_${Date.now()}`,
      name: milestoneName,
      dueDate: milestoneDueDate,
      completed: false,
      description: milestoneDescription
    };

    onUpdate([...milestones, newMilestone]);
    resetForm();
  };

  const handleEditMilestone = () => {
    if (!editingMilestone || !milestoneName || !milestoneDueDate) return;

    const updated = milestones.map(m =>
      m.id === editingMilestone.id
        ? { ...m, name: milestoneName, dueDate: milestoneDueDate, description: milestoneDescription }
        : m
    );

    onUpdate(updated);
    resetForm();
  };

  const handleToggleComplete = (milestoneId: string) => {
    const updated = milestones.map(m =>
      m.id === milestoneId
        ? {
            ...m,
            completed: !m.completed,
            completedAt: !m.completed ? new Date().toISOString().split('T')[0] : undefined
          }
        : m
    );
    onUpdate(updated);
  };

  const handleDeleteMilestone = (milestoneId: string) => {
    if (confirm('确定要删除这个里程碑吗？')) {
      onUpdate(milestones.filter(m => m.id !== milestoneId));
    }
  };

  const resetForm = () => {
    setMilestoneName('');
    setMilestoneDueDate('');
    setMilestoneDescription('');
    setShowAddModal(false);
    setEditingMilestone(null);
  };

  const openEditModal = (milestone: TaskMilestone) => {
    setEditingMilestone(milestone);
    setMilestoneName(milestone.name);
    setMilestoneDueDate(milestone.dueDate);
    setMilestoneDescription(milestone.description || '');
    setShowAddModal(true);
  };

  // 计算进度
  const completedCount = milestones.filter(m => m.completed).length;
  const progress = milestones.length > 0 ? (completedCount / milestones.length) * 100 : 0;

  // 检查是否逾期
  const isOverdue = (dueDate: string, completed: boolean) => {
    if (completed) return false;
    const due = new Date(dueDate);
    const now = new Date();
    return now > due;
  };

  return (
    <div className="border border-slate-200 rounded-lg p-4 lg:p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h4 className="font-bold text-slate-800 text-sm lg:text-base">
            <i className="fa-solid fa-flag-checkered mr-2 text-slate-400"></i> 任务里程碑
          </h4>
          {milestones.length > 0 && (
            <p className="text-xs text-slate-500 mt-1">
              已完成 {completedCount} / {milestones.length} ({Math.round(progress)}%)
            </p>
          )}
        </div>
        {!readonly && (
          <button
            onClick={() => setShowAddModal(true)}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            <Plus size={16} className="inline mr-1" />
            添加里程碑
          </button>
        )}
      </div>

      {/* 进度条 */}
      {milestones.length > 0 && (
        <div className="mb-4">
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* 里程碑列表 */}
      {milestones.length > 0 ? (
        <div className="space-y-3">
          {milestones.map((milestone) => {
            const overdue = isOverdue(milestone.dueDate, milestone.completed);
            return (
              <div
                key={milestone.id}
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  milestone.completed
                    ? 'bg-green-50 border-green-200'
                    : overdue
                    ? 'bg-red-50 border-red-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <button
                  onClick={() => !readonly && handleToggleComplete(milestone.id)}
                  className={`flex-shrink-0 mt-0.5 ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
                  disabled={readonly}
                >
                  {milestone.completed ? (
                    <CheckCircle className="text-green-600" size={20} />
                  ) : (
                    <Circle className={overdue ? 'text-red-600' : 'text-slate-400'} size={20} />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium ${
                          milestone.completed
                            ? 'text-green-800 line-through'
                            : overdue
                            ? 'text-red-800'
                            : 'text-slate-800'
                        }`}
                      >
                        {milestone.name}
                      </p>
                      {milestone.description && (
                        <p className="text-xs text-slate-600 mt-1">{milestone.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <span
                          className={`text-xs ${
                            milestone.completed
                              ? 'text-green-600'
                              : overdue
                              ? 'text-red-600 font-medium'
                              : 'text-slate-500'
                          }`}
                        >
                          <i className="fa-solid fa-calendar mr-1"></i>
                          {milestone.dueDate}
                          {overdue && ' (已逾期)'}
                        </span>
                        {milestone.completed && milestone.completedAt && (
                          <span className="text-xs text-green-600">
                            <i className="fa-solid fa-check mr-1"></i>
                            完成于 {milestone.completedAt}
                          </span>
                        )}
                      </div>
                    </div>

                    {!readonly && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(milestone)}
                          className="p-1 text-blue-600 hover:text-blue-700"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteMilestone(milestone.id)}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-400 text-sm">
          <i className="fa-solid fa-flag-checkered text-3xl mb-2 block"></i>
          <p>暂无里程碑</p>
          {!readonly && <p className="text-xs mt-1">点击"添加里程碑"设置任务检查点</p>}
        </div>
      )}

      {/* 添加/编辑里程碑弹窗 */}
      {showAddModal && (
        <div
          onClick={resetForm}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md animate-fade-in-up"
          >
            <h3 className="text-lg font-bold mb-4">
              {editingMilestone ? '编辑里程碑' : '添加里程碑'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  里程碑名称 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={milestoneName}
                  onChange={(e) => setMilestoneName(e.target.value)}
                  placeholder="如：第一周检查、中期评估"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  截止日期 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={milestoneDueDate}
                  onChange={(e) => setMilestoneDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  描述（选填）
                </label>
                <textarea
                  value={milestoneDescription}
                  onChange={(e) => setMilestoneDescription(e.target.value)}
                  placeholder="描述这个里程碑的具体要求..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={resetForm}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={editingMilestone ? handleEditMilestone : handleAddMilestone}
                disabled={!milestoneName || !milestoneDueDate}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingMilestone ? '保存' : '添加'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
