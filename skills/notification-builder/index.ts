/**
 * Notification Builder Skill
 * 通知构建器技能模块
 *
 * 提供通知相关的业务逻辑：
 * - 截止日期检查和提醒
 * - 通知对象构建
 * - 逾期警告生成
 *
 * @module skills/notification-builder
 */

// 导出截止日期检查功能
export {
  checkTaskDeadlines,
} from './deadlines';

// 导出通知构建功能
export {
  createTaskAssignedNotification,
  createTaskStatusChangeNotification,
  createTaskCompletedNotification,
  createTaskEscalatedNotification,
} from './builders';

// 导出类型定义
export type {
  DeadlineCheckResult,
} from './types';
