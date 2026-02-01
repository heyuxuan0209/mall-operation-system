import { MerchantSnapshot, RiskLevelChange, Task } from '@/types';

/**
 * 档案数据处理工具类
 * 提供数据格式化和筛选方法
 */
export class ArchiveDataHelper {
  /**
   * 获取按触发类型分组的快照
   */
  static groupSnapshotsByTrigger(snapshots: MerchantSnapshot[]) {
    return {
      all: snapshots,
      inspection: snapshots.filter(s => s.trigger.type === 'inspection'),
      taskCreated: snapshots.filter(s => s.trigger.type === 'task_created'),
      taskCompleted: snapshots.filter(s => s.trigger.type === 'task_completed'),
      manual: snapshots.filter(s => s.trigger.type === 'manual'),
      riskChange: snapshots.filter(s => s.trigger.type === 'risk_change'),
    };
  }

  /**
   * 获取改善和恶化的风险变更
   */
  static categorizeRiskChanges(changes: RiskLevelChange[]) {
    return {
      improvements: changes.filter(c => c.changeType === 'upgrade'),
      deteriorations: changes.filter(c => c.changeType === 'downgrade'),
      stable: changes.filter(c => c.changeType === 'stable'),
    };
  }

  /**
   * 格式化相对时间
   */
  static formatRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const days = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (days === 0) return '今天';
    if (days === 1) return '昨天';
    if (days < 7) return `${days}天前`;
    if (days < 30) return `${Math.floor(days / 7)}周前`;
    if (days < 365) return `${Math.floor(days / 30)}个月前`;
    return `${Math.floor(days / 365)}年前`;
  }

  /**
   * 获取触发类型的中文标签
   */
  static getTriggerLabel(type: string): string {
    const labels: Record<string, string> = {
      inspection: '现场巡检',
      task_created: '任务创建',
      task_completed: '任务完成',
      manual: '手动记录',
      risk_change: '风险变化',
    };
    return labels[type] || type;
  }

  /**
   * 获取风险等级的中文标签
   */
  static getRiskLevelLabel(level: string): string {
    const labels: Record<string, string> = {
      critical: '极高风险',
      high: '高风险',
      medium: '中风险',
      low: '低风险',
      none: '无风险',
    };
    return labels[level] || level;
  }

  /**
   * 获取风险等级的图标
   */
  static getRiskLevelIcon(level: string): string {
    const icons: Record<string, string> = {
      critical: 'fa-skull-crossbones',
      high: 'fa-exclamation-circle',
      medium: 'fa-exclamation-triangle',
      low: 'fa-info-circle',
      none: 'fa-check-circle',
    };
    return icons[level] || icons.none;
  }

  /**
   * 获取风险等级的颜色类
   */
  static getRiskLevelColor(level: string): { bg: string; text: string } {
    const colors: Record<string, { bg: string; text: string }> = {
      critical: { bg: 'bg-purple-100', text: 'text-purple-700' },
      high: { bg: 'bg-red-100', text: 'text-red-700' },
      medium: { bg: 'bg-orange-100', text: 'text-orange-700' },
      low: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
      none: { bg: 'bg-green-100', text: 'text-green-700' },
    };
    return colors[level] || colors.none;
  }

  /**
   * 获取变更类型的标签和颜色
   */
  static getChangeTypeStyle(changeType: 'upgrade' | 'downgrade' | 'stable') {
    const styles = {
      upgrade: {
        label: '改善',
        icon: 'fa-arrow-up',
        bg: 'bg-green-100',
        text: 'text-green-700',
        border: 'border-green-300',
      },
      downgrade: {
        label: '恶化',
        icon: 'fa-arrow-down',
        bg: 'bg-red-100',
        text: 'text-red-700',
        border: 'border-red-300',
      },
      stable: {
        label: '稳定',
        icon: 'fa-minus',
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        border: 'border-gray-300',
      },
    };
    return styles[changeType];
  }

  /**
   * 按任务状态分组
   */
  static groupTasksByStatus(tasks: Task[]) {
    return {
      pending: tasks.filter(t => t.status === 'pending'),
      in_progress: tasks.filter(t => t.status === 'in_progress'),
      completed: tasks.filter(t => t.status === 'completed'),
      failed: tasks.filter(t => t.status === 'failed'),
    };
  }

  /**
   * 获取任务状态的标签和颜色
   */
  static getTaskStatusStyle(status: string) {
    const styles: Record<string, { label: string; bg: string; text: string }> = {
      pending: { label: '待处理', bg: 'bg-gray-100', text: 'text-gray-700' },
      in_progress: { label: '进行中', bg: 'bg-blue-100', text: 'text-blue-700' },
      completed: { label: '已完成', bg: 'bg-green-100', text: 'text-green-700' },
      failed: { label: '已失败', bg: 'bg-red-100', text: 'text-red-700' },
    };
    return styles[status] || styles.pending;
  }

  /**
   * 获取优先级的标签和颜色
   */
  static getPriorityStyle(priority: string) {
    const styles: Record<string, { label: string; bg: string; text: string }> = {
      low: { label: '低', bg: 'bg-gray-100', text: 'text-gray-600' },
      medium: { label: '中', bg: 'bg-yellow-100', text: 'text-yellow-700' },
      high: { label: '高', bg: 'bg-orange-100', text: 'text-orange-700' },
      urgent: { label: '紧急', bg: 'bg-red-100', text: 'text-red-700' },
    };
    return styles[priority] || styles.medium;
  }
}

export default ArchiveDataHelper;
