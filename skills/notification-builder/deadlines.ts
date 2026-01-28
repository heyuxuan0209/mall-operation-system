/**
 * Notification Builder - Deadline Module
 * 通知构建器 - 截止日期模块
 *
 * 负责检查任务截止日期并生成提醒通知
 */

import { Task, AppNotification, NotificationSettings } from '@/types';

/**
 * 检查任务截止日期
 * 根据配置生成截止日期提醒和逾期警告通知
 *
 * @param tasks - 任务列表
 * @param settings - 通知设置
 * @param existingNotifications - 已存在的通知列表（用于避免重复）
 * @param now - 当前时间（默认为当前日期）
 * @returns 生成的通知列表
 */
export function checkTaskDeadlines(
  tasks: Task[],
  settings: NotificationSettings,
  existingNotifications: AppNotification[] = [],
  now: Date = new Date()
): AppNotification[] {
  // 如果通知功能未启用，返回空数组
  if (!settings.enabled || !settings.deadlineReminders.enabled) {
    return [];
  }

  const notifications: AppNotification[] = [];

  tasks.forEach((task) => {
    // 跳过已完成或已退出的任务
    if (task.stage === 'completed' || task.stage === 'exit') {
      return;
    }

    const deadline = new Date(task.deadline);
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // 检查是否需要发送截止日期提醒
    settings.deadlineReminders.days.forEach((day) => {
      if (diffDays === day) {
        const notificationId = `deadline_${task.id}_${day}`;

        // 检查是否已经发送过这个提醒（避免重复）
        const alreadySent = existingNotifications.some(n => n.id === notificationId);

        if (!alreadySent) {
          let message = '';
          let priority: AppNotification['priority'] = 'medium';

          if (day === 0) {
            message = `任务今天到期！请及时处理`;
            priority = 'high';
          } else if (day === 1) {
            message = `任务明天到期，请注意`;
            priority = 'medium';
          } else {
            message = `任务将在${day}天后到期`;
            priority = 'low';
          }

          notifications.push({
            id: notificationId,
            type: 'task_deadline',
            title: `【截止提醒】${task.merchantName}`,
            message,
            taskId: task.id,
            merchantName: task.merchantName,
            priority,
            read: false,
            createdAt: new Date().toISOString()
          });
        }
      }
    });

    // 检查逾期任务
    if (diffDays < 0 && settings.overdueAlerts) {
      const daysOverdue = Math.abs(diffDays);
      const notificationId = `overdue_${task.id}_${daysOverdue}`;

      // 检查是否已经发送过这个逾期提醒
      const alreadySent = existingNotifications.some(n => n.id === notificationId);

      // 每天只发送一次逾期提醒
      if (!alreadySent) {
        notifications.push({
          id: notificationId,
          type: 'task_overdue',
          title: `【逾期警告】${task.merchantName}`,
          message: `任务已逾期${daysOverdue}天，请尽快处理！`,
          taskId: task.id,
          merchantName: task.merchantName,
          priority: 'urgent',
          read: false,
          createdAt: new Date().toISOString()
        });
      }
    }
  });

  return notifications;
}
