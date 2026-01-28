/**
 * Notification Builder - Builders Module
 * 通知构建器 - 构建器模块
 *
 * 负责构建各种类型的通知对象
 */

import { Task, AppNotification } from '@/types';

/**
 * 阶段名称映射
 */
const STAGE_NAMES: Record<string, string> = {
  planning: '措施制定',
  executing: '执行中',
  evaluating: '效果评估',
  completed: '已完成',
  escalated: '已升级',
  exit: '已退出'
};

/**
 * 创建任务分配通知
 * 当新任务被分配给用户时调用
 *
 * @param task - 任务对象
 * @param assignedBy - 分配人（可选，默认'系统'）
 * @returns 任务分配通知对象
 */
export function createTaskAssignedNotification(
  task: Task,
  assignedBy: string = '系统'
): AppNotification {
  return {
    id: `assigned_${task.id}_${Date.now()}`,
    type: 'task_assigned',
    title: `【新任务】${task.merchantName}`,
    message: `您有一个新的帮扶任务：${task.title}`,
    taskId: task.id,
    merchantName: task.merchantName,
    priority: 'high',
    read: false,
    createdAt: new Date().toISOString()
  };
}

/**
 * 创建任务状态变更通知
 * 当任务阶段发生变化时调用
 *
 * @param task - 任务对象
 * @param oldStage - 旧的阶段标识
 * @param newStage - 新的阶段标识
 * @returns 状态变更通知对象
 */
export function createTaskStatusChangeNotification(
  task: Task,
  oldStage: string,
  newStage: string
): AppNotification {
  const oldStageName = STAGE_NAMES[oldStage] || oldStage;
  const newStageName = STAGE_NAMES[newStage] || newStage;

  return {
    id: `status_${task.id}_${Date.now()}`,
    type: 'task_status_change',
    title: `【状态变更】${task.merchantName}`,
    message: `任务阶段从"${oldStageName}"变更为"${newStageName}"`,
    taskId: task.id,
    merchantName: task.merchantName,
    priority: 'medium',
    read: false,
    createdAt: new Date().toISOString()
  };
}

/**
 * 创建任务完成通知
 * 当任务成功完成时调用
 *
 * @param task - 任务对象
 * @returns 任务完成通知对象
 */
export function createTaskCompletedNotification(task: Task): AppNotification {
  return {
    id: `completed_${task.id}_${Date.now()}`,
    type: 'task_status_change',
    title: `【任务完成】${task.merchantName}`,
    message: `恭喜！任务"${task.title}"已成功完成`,
    taskId: task.id,
    merchantName: task.merchantName,
    priority: 'low',
    read: false,
    createdAt: new Date().toISOString()
  };
}

/**
 * 创建任务升级通知
 * 当任务被升级时调用
 *
 * @param task - 任务对象
 * @param reason - 升级原因
 * @returns 任务升级通知对象
 */
export function createTaskEscalatedNotification(
  task: Task,
  reason: string
): AppNotification {
  return {
    id: `escalated_${task.id}_${Date.now()}`,
    type: 'task_status_change',
    title: `【任务升级】${task.merchantName}`,
    message: `任务已升级处理。原因：${reason}`,
    taskId: task.id,
    merchantName: task.merchantName,
    priority: 'urgent',
    read: false,
    createdAt: new Date().toISOString()
  };
}
