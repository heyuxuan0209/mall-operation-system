import { AppNotification, NotificationSettings, Task } from '../types';

/**
 * 通知服务类
 * 负责管理所有通知相关的逻辑
 */
class NotificationService {
  private static instance: NotificationService;
  private readonly STORAGE_KEY_NOTIFICATIONS = 'notifications';
  private readonly STORAGE_KEY_SETTINGS = 'notificationSettings';
  private readonly STORAGE_KEY_LAST_CHECK = 'lastNotificationCheck';

  private constructor() {}

  /**
   * 获取单例实例
   */
  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * 请求浏览器通知权限
   */
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('此浏览器不支持桌面通知');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  /**
   * 发送浏览器通知
   */
  sendBrowserNotification(notification: AppNotification): void {
    if (!('Notification' in window)) {
      return;
    }

    if (Notification.permission === 'granted') {
      const options: NotificationOptions = {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.id,
        requireInteraction: notification.priority === 'urgent',
        data: {
          taskId: notification.taskId,
          url: `/tasks?taskId=${notification.taskId}`
        }
      };

      const browserNotification = new Notification(notification.title, options);

      // 点击通知时跳转到对应任务
      browserNotification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        window.location.href = `/tasks?taskId=${notification.taskId}`;
        browserNotification.close();
      };

      // 3秒后自动关闭（非紧急通知）
      if (notification.priority !== 'urgent') {
        setTimeout(() => browserNotification.close(), 3000);
      }
    }
  }

  /**
   * 检查任务截止日期，生成提醒通知
   */
  checkDeadlines(): AppNotification[] {
    const settings = this.getSettings();
    if (!settings.enabled || !settings.deadlineReminders.enabled) {
      return [];
    }

    // 获取所有任务
    const tasks = this.getAllTasks();
    const now = new Date();
    const notifications: AppNotification[] = [];

    // 获取上次检查时间
    const lastCheck = localStorage.getItem(this.STORAGE_KEY_LAST_CHECK);
    const lastCheckDate = lastCheck ? new Date(lastCheck) : new Date(0);

    tasks.forEach((task) => {
      // 跳过已完成或已退出的任务
      if (task.stage === 'completed' || task.stage === 'exit') {
        return;
      }

      const deadline = new Date(task.deadline);
      const diffTime = deadline.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // 检查是否需要发送提醒
      settings.deadlineReminders.days.forEach((day) => {
        if (diffDays === day) {
          // 检查是否已经发送过这个提醒（避免重复）
          const notificationId = `deadline_${task.id}_${day}`;
          const existingNotifications = this.getNotifications();
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
        const existingNotifications = this.getNotifications();
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

    // 更新最后检查时间
    localStorage.setItem(this.STORAGE_KEY_LAST_CHECK, now.toISOString());

    return notifications;
  }

  /**
   * 创建任务分配通知
   */
  createTaskAssignedNotification(task: Task): AppNotification {
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
   */
  createTaskStatusChangeNotification(task: Task, oldStage: string, newStage: string): AppNotification {
    const stageNames: Record<string, string> = {
      planning: '措施制定',
      executing: '执行中',
      evaluating: '效果评估',
      completed: '已完成',
      escalated: '已升级',
      exit: '已退出'
    };

    return {
      id: `status_${task.id}_${Date.now()}`,
      type: 'task_status_change',
      title: `【状态变更】${task.merchantName}`,
      message: `任务阶段从"${stageNames[oldStage]}"变更为"${stageNames[newStage]}"`,
      taskId: task.id,
      merchantName: task.merchantName,
      priority: 'medium',
      read: false,
      createdAt: new Date().toISOString()
    };
  }

  /**
   * 保存通知到LocalStorage
   */
  saveNotification(notification: AppNotification): void {
    const notifications = this.getNotifications();
    notifications.unshift(notification); // 新通知放在最前面

    // 只保留最近100条通知
    const trimmedNotifications = notifications.slice(0, 100);
    localStorage.setItem(this.STORAGE_KEY_NOTIFICATIONS, JSON.stringify(trimmedNotifications));
  }

  /**
   * 批量保存通知
   */
  saveNotifications(notifications: AppNotification[]): void {
    notifications.forEach(n => this.saveNotification(n));
  }

  /**
   * 获取所有通知
   */
  getNotifications(): AppNotification[] {
    const stored = localStorage.getItem(this.STORAGE_KEY_NOTIFICATIONS);
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * 获取未读通知数量
   */
  getUnreadCount(): number {
    const notifications = this.getNotifications();
    return notifications.filter(n => !n.read).length;
  }

  /**
   * 标记通知为已读
   */
  markAsRead(notificationId: string): void {
    const notifications = this.getNotifications();
    const updated = notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    localStorage.setItem(this.STORAGE_KEY_NOTIFICATIONS, JSON.stringify(updated));
  }

  /**
   * 标记所有通知为已读
   */
  markAllAsRead(): void {
    const notifications = this.getNotifications();
    const updated = notifications.map(n => ({ ...n, read: true }));
    localStorage.setItem(this.STORAGE_KEY_NOTIFICATIONS, JSON.stringify(updated));
  }

  /**
   * 删除通知
   */
  deleteNotification(notificationId: string): void {
    const notifications = this.getNotifications();
    const filtered = notifications.filter(n => n.id !== notificationId);
    localStorage.setItem(this.STORAGE_KEY_NOTIFICATIONS, JSON.stringify(filtered));
  }

  /**
   * 清空所有通知
   */
  clearAllNotifications(): void {
    localStorage.setItem(this.STORAGE_KEY_NOTIFICATIONS, JSON.stringify([]));
  }

  /**
   * 获取通知设置
   */
  getSettings(): NotificationSettings {
    const stored = localStorage.getItem(this.STORAGE_KEY_SETTINGS);
    if (stored) {
      return JSON.parse(stored);
    }

    // 默认设置
    return {
      enabled: true,
      browserNotifications: false, // 默认关闭，需要用户手动开启
      deadlineReminders: {
        enabled: true,
        days: [3, 1, 0] // 提前3天、1天、当天提醒
      },
      taskAssignment: true,
      statusChanges: true,
      overdueAlerts: true
    };
  }

  /**
   * 保存通知设置
   */
  saveSettings(settings: NotificationSettings): void {
    localStorage.setItem(this.STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  }

  /**
   * 获取所有任务（从LocalStorage和mock数据）
   */
  private getAllTasks(): Task[] {
    const storedTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    // 注意：这里需要动态导入mock数据，避免服务端渲染问题
    try {
      const mockTasks = require('@/data/tasks/mock-data').mockTasks;
      return [...mockTasks, ...storedTasks];
    } catch {
      return storedTasks;
    }
  }
}

// 导出单例实例
export const notificationService = NotificationService.getInstance();
