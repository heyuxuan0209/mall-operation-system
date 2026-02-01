'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { MerchantSnapshot, RiskLevelChange, Task } from '@/types';
import { ArchiveDataHelper } from '@/utils/archiveDataHelper';

interface StatDetailModalProps {
  type: 'snapshots' | 'riskChanges' | 'tasks' | 'improvements' | 'deteriorations' | null;
  data: {
    snapshots?: MerchantSnapshot[];
    riskChanges?: RiskLevelChange[];
    tasks?: Task[];
  };
  onClose: () => void;
}

/**
 * 统计明细弹窗组件
 * 展示历史记录、风险变更、任务、改善/恶化事件的详细列表
 */
export function StatDetailModal({ type, data, onClose }: StatDetailModalProps) {
  if (!type) return null;

  const getTitle = () => {
    const titles = {
      snapshots: '历史快照明细',
      riskChanges: '风险变更明细',
      tasks: '帮扶任务明细',
      improvements: '风险改善记录',
      deteriorations: '风险恶化记录',
    };
    return titles[type];
  };

  const getIcon = () => {
    const icons = {
      snapshots: 'fa-history',
      riskChanges: 'fa-exchange-alt',
      tasks: 'fa-tasks',
      improvements: 'fa-arrow-up',
      deteriorations: 'fa-arrow-down',
    };
    return icons[type];
  };

  return (
    <Modal isOpen={true} onClose={onClose} maxWidth="4xl">
      {/* 标题栏 */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <i className={`fas ${getIcon()} text-indigo-600`}></i>
          <h3 className="text-lg font-semibold text-gray-900">{getTitle()}</h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <i className="fas fa-times text-xl"></i>
        </button>
      </div>

      {/* 内容区域 */}
      <div className="p-6 max-h-[70vh] overflow-y-auto">
        {type === 'snapshots' && <SnapshotList snapshots={data.snapshots || []} />}
        {type === 'riskChanges' && <RiskChangeList changes={data.riskChanges || []} />}
        {type === 'tasks' && <TaskList tasks={data.tasks || []} />}
        {type === 'improvements' && (
          <ImprovementList
            changes={(data.riskChanges || []).filter(c => c.changeType === 'upgrade')}
          />
        )}
        {type === 'deteriorations' && (
          <DeteriorationList
            changes={(data.riskChanges || []).filter(c => c.changeType === 'downgrade')}
          />
        )}
      </div>
    </Modal>
  );
}

// ========== 快照列表组件 ==========
function SnapshotList({ snapshots }: { snapshots: MerchantSnapshot[] }) {
  if (snapshots.length === 0) {
    return <EmptyState message="暂无历史快照记录" />;
  }

  // 按时间倒序
  const sortedSnapshots = [...snapshots].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-600 mb-4">
        共 <span className="font-semibold text-gray-900">{snapshots.length}</span> 条记录
      </div>

      {sortedSnapshots.map((snapshot, index) => {
        const riskColor = ArchiveDataHelper.getRiskLevelColor(snapshot.riskLevel);
        const riskIcon = ArchiveDataHelper.getRiskLevelIcon(snapshot.riskLevel);

        return (
          <div
            key={snapshot.id}
            className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="text-sm font-medium text-gray-500">
                  #{sortedSnapshots.length - index}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {new Date(snapshot.timestamp).toLocaleString('zh-CN')}
                  </div>
                  <div className="text-sm text-gray-500 mt-0.5">
                    {ArchiveDataHelper.formatRelativeTime(snapshot.timestamp)}
                  </div>
                </div>
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-medium ${riskColor.bg} ${riskColor.text} flex items-center gap-1`}>
                <i className={`fas ${riskIcon}`}></i>
                {ArchiveDataHelper.getRiskLevelLabel(snapshot.riskLevel)}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-2">
              <div>
                <div className="text-xs text-gray-500">健康度</div>
                <div className="text-lg font-bold text-gray-900">{snapshot.totalScore}分</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">营收</div>
                <div className="text-sm font-medium text-gray-900">
                  ¥{(snapshot.revenue / 10000).toFixed(1)}万
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">租售比</div>
                <div className="text-sm font-medium text-gray-900">
                  {snapshot.rentToSalesRatio.toFixed(1)}%
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span className="px-2 py-1 bg-white rounded text-gray-600 border border-gray-200">
                {ArchiveDataHelper.getTriggerLabel(snapshot.trigger.type)}
              </span>
              {snapshot.trigger.description && (
                <span className="text-gray-500">{snapshot.trigger.description}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ========== 风险变更列表组件 ==========
function RiskChangeList({ changes }: { changes: RiskLevelChange[] }) {
  if (changes.length === 0) {
    return <EmptyState message="暂无风险变更记录" />;
  }

  const sortedChanges = [...changes].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-600 mb-4">
        共 <span className="font-semibold text-gray-900">{changes.length}</span> 次变更
      </div>

      {sortedChanges.map((change, index) => {
        const style = ArchiveDataHelper.getChangeTypeStyle(change.changeType);
        const fromColor = ArchiveDataHelper.getRiskLevelColor(change.fromLevel);
        const toColor = ArchiveDataHelper.getRiskLevelColor(change.toLevel);

        return (
          <div
            key={change.id}
            className={`rounded-lg p-4 border-2 ${style.border} ${style.bg} bg-opacity-30`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="text-sm font-medium text-gray-500">
                  #{sortedChanges.length - index}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {new Date(change.timestamp).toLocaleString('zh-CN')}
                  </div>
                  <div className="text-sm text-gray-500 mt-0.5">
                    {ArchiveDataHelper.formatRelativeTime(change.timestamp)}
                  </div>
                </div>
              </div>

              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${style.bg} ${style.text} flex items-center gap-1`}>
                <i className={`fas ${style.icon}`}></i>
                {style.label}
              </span>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <span className={`px-3 py-1.5 rounded ${fromColor.bg} ${fromColor.text} text-sm font-medium`}>
                {ArchiveDataHelper.getRiskLevelLabel(change.fromLevel)}
              </span>
              <i className="fas fa-arrow-right text-gray-400"></i>
              <span className={`px-3 py-1.5 rounded ${toColor.bg} ${toColor.text} text-sm font-medium`}>
                {ArchiveDataHelper.getRiskLevelLabel(change.toLevel)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-2">
              <div>
                <div className="text-xs text-gray-600">评分变化</div>
                <div className={`text-lg font-bold ${change.scoreDelta > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {change.fromScore}分 → {change.toScore}分
                  <span className="text-sm ml-1">
                    ({change.scoreDelta > 0 ? '+' : ''}{change.scoreDelta}分)
                  </span>
                </div>
              </div>
            </div>

            {change.trigger.description && (
              <div className="mt-2 text-sm text-gray-600">
                <i className="fas fa-info-circle mr-1"></i>
                {change.trigger.description}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ========== 任务列表组件 ==========
function TaskList({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) {
    return <EmptyState message="暂无帮扶任务记录" />;
  }

  return (
    <div className="space-y-3">
      <div className="text-sm text-gray-600 mb-4">
        共 <span className="font-semibold text-gray-900">{tasks.length}</span> 个任务
      </div>

      {tasks.map(task => {
        const statusStyle = ArchiveDataHelper.getTaskStatusStyle(task.status);
        const priorityStyle = ArchiveDataHelper.getPriorityStyle(task.priority);
        const improvement = task.afterMetrics && task.initialMetrics
          ? Math.round(
              (Object.values(task.afterMetrics).reduce((a, b) => a + b, 0) -
                Object.values(task.initialMetrics).reduce((a, b) => a + b, 0)) / 5
            )
          : 0;

        return (
          <div key={task.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-500">{task.id}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                    {statusStyle.label}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityStyle.bg} ${priorityStyle.text}`}>
                    {priorityStyle.label}
                  </span>
                </div>
                <h4 className="font-semibold text-gray-900">{task.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{task.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-3">
              <div>
                <div className="text-xs text-gray-500">措施数量</div>
                <div className="text-sm font-medium text-gray-900">
                  {task.measureEffects?.length || task.measures.length} 项
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">改善值</div>
                <div className={`text-sm font-bold ${improvement > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                  {improvement > 0 ? '+' : ''}{improvement}分
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">任务期间</div>
                <div className="text-sm font-medium text-gray-900">
                  {new Date(task.startDate).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                  {' - '}
                  {new Date(task.deadline).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            </div>

            <div className="mt-3 text-sm text-gray-600">
              <i className="fas fa-user mr-1"></i>
              {task.assignedTo}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ========== 改善记录列表组件 ==========
function ImprovementList({ changes }: { changes: RiskLevelChange[] }) {
  if (changes.length === 0) {
    return <EmptyState message="暂无风险改善记录" icon="fa-smile" />;
  }

  const sortedChanges = [...changes].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
        <i className="fas fa-check-circle text-green-600"></i>
        共 <span className="font-semibold text-green-600">{changes.length}</span> 次改善
      </div>

      {sortedChanges.map((change, index) => {
        const fromColor = ArchiveDataHelper.getRiskLevelColor(change.fromLevel);
        const toColor = ArchiveDataHelper.getRiskLevelColor(change.toLevel);

        return (
          <div
            key={change.id}
            className="bg-green-50 border-2 border-green-200 rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-arrow-up text-green-600"></i>
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    评分提升 <span className="text-green-600 font-bold">+{change.scoreDelta}分</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(change.timestamp).toLocaleDateString('zh-CN')} ·{' '}
                    {ArchiveDataHelper.formatRelativeTime(change.timestamp)}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-1 rounded text-xs ${fromColor.bg} ${fromColor.text}`}>
                {ArchiveDataHelper.getRiskLevelLabel(change.fromLevel)}
              </span>
              <i className="fas fa-arrow-right text-gray-400"></i>
              <span className={`px-2 py-1 rounded text-xs ${toColor.bg} ${toColor.text}`}>
                {ArchiveDataHelper.getRiskLevelLabel(change.toLevel)}
              </span>
            </div>

            {change.taskId && (
              <div className="mt-2 text-sm text-gray-600">
                <i className="fas fa-link mr-1"></i>
                关联任务: <span className="font-medium">{change.taskId}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ========== 恶化记录列表组件 ==========
function DeteriorationList({ changes }: { changes: RiskLevelChange[] }) {
  if (changes.length === 0) {
    return <EmptyState message="暂无风险恶化记录" icon="fa-smile" />;
  }

  const sortedChanges = [...changes].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
        <i className="fas fa-exclamation-triangle text-red-600"></i>
        共 <span className="font-semibold text-red-600">{changes.length}</span> 次恶化
      </div>

      {sortedChanges.map((change, index) => {
        const fromColor = ArchiveDataHelper.getRiskLevelColor(change.fromLevel);
        const toColor = ArchiveDataHelper.getRiskLevelColor(change.toLevel);

        return (
          <div
            key={change.id}
            className="bg-red-50 border-2 border-red-200 rounded-lg p-4"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-arrow-down text-red-600"></i>
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    评分下降 <span className="text-red-600 font-bold">{change.scoreDelta}分</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(change.timestamp).toLocaleDateString('zh-CN')} ·{' '}
                    {ArchiveDataHelper.formatRelativeTime(change.timestamp)}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-1 rounded text-xs ${fromColor.bg} ${fromColor.text}`}>
                {ArchiveDataHelper.getRiskLevelLabel(change.fromLevel)}
              </span>
              <i className="fas fa-arrow-right text-gray-400"></i>
              <span className={`px-2 py-1 rounded text-xs ${toColor.bg} ${toColor.text}`}>
                {ArchiveDataHelper.getRiskLevelLabel(change.toLevel)}
              </span>
            </div>

            <div className="mt-2 text-sm text-gray-600">
              <i className="fas fa-info-circle mr-1"></i>
              {change.trigger.description || '原因: 需要进一步分析'}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ========== 空状态组件 ==========
function EmptyState({ message, icon = 'fa-inbox' }: { message: string; icon?: string }) {
  return (
    <div className="text-center py-12 text-gray-500">
      <i className={`fas ${icon} text-4xl mb-3`}></i>
      <p>{message}</p>
    </div>
  );
}

export default StatDetailModal;
