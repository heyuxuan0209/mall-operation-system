/**
 * Notification Builder Types
 * 通知构建器类型定义
 */

import { AppNotification, NotificationSettings, Task } from '@/types';

/**
 * 截止日期检查结果
 */
export interface DeadlineCheckResult {
  notifications: AppNotification[];
  checkedCount: number;
  upcomingCount: number;
  overdueCount: number;
}

/**
 * 导出类型供外部使用
 */
export type { AppNotification, NotificationSettings, Task };
