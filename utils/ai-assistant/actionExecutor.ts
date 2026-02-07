/**
 * 操作执行器
 * 负责执行创建任务、发送通知等操作
 */

import { Merchant, Task, AppNotification } from '@/types';
import { SuggestedAction, ActionConfirmConfig } from '@/types/ai-assistant';
import { merchantDataManager } from '@/utils/merchantDataManager';
import { notificationService } from '@/utils/notificationService';

export class ActionExecutor {
  /**
   * 执行建议的操作
   */
  async executeAction(
    action: SuggestedAction,
    confirm: (config: ActionConfirmConfig) => Promise<boolean>
  ): Promise<boolean> {
    switch (action.type) {
      case 'create_task':
        return await this.createTaskAction(action.data, confirm);
      case 'send_notification':
        return await this.sendNotificationAction(action.data, confirm);
      default:
        console.warn(`Unknown action type: ${action.type}`);
        return false;
    }
  }

  /**
   * 创建任务操作
   */
  private async createTaskAction(
    data: any,
    confirm: (config: ActionConfirmConfig) => Promise<boolean>
  ): Promise<boolean> {
    const { merchant, diagnosis, measures } = data;

    // 询问用户确认
    const confirmed = await confirm({
      title: '创建帮扶任务',
      message: `已为 ${merchant.name} 生成诊断报告，是否创建帮扶任务？`,
      confirmText: '创建任务',
      cancelText: '暂不创建',
      data: { merchant, diagnosis },
    });

    if (!confirmed) {
      return false;
    }

    // 创建任务
    const task = await this.createTask(merchant, diagnosis, measures);

    // 创建任务分配通知
    const notification = notificationService.createTaskAssignedNotification(task);
    notificationService.saveNotification(notification);

    // 发送浏览器通知
    await notificationService.sendBrowserNotification(notification);

    return true;
  }

  /**
   * 创建帮扶任务
   */
  private async createTask(
    merchant: Merchant,
    diagnosis: any,
    measures: string[]
  ): Promise<Task> {
    const task: Task = {
      id: this.generateId(),
      merchantId: merchant.id,
      merchantName: merchant.name,
      title: `${merchant.name} 健康度提升帮扶`,
      description: Array.isArray(diagnosis.problems)
        ? diagnosis.problems.join('\n')
        : diagnosis.summary || '根据AI诊断结果进行帮扶',
      measures: measures || [],
      priority: this.calculatePriority(merchant.riskLevel),
      riskLevel: merchant.riskLevel === 'none' ? 'low' : merchant.riskLevel,
      assignedLevel: this.assignLevel(merchant.totalScore),
      status: 'pending',
      stage: 'planning',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignee: '',
      assignedTo: '',
      startDate: new Date().toISOString(),
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7天后
    };

    // 保存任务（这里需要实现任务存储逻辑）
    this.saveTask(task);

    return task;
  }

  /**
   * 计算任务优先级
   */
  private calculatePriority(riskLevel: string): 'low' | 'medium' | 'high' | 'urgent' {
    switch (riskLevel) {
      case 'critical':
        return 'urgent';
      case 'high':
        return 'high';
      case 'medium':
        return 'medium';
      default:
        return 'low';
    }
  }

  /**
   * 分配负责层级
   */
  private assignLevel(totalScore: number): 'assistant' | 'manager' | 'city_company' | 'vp' {
    if (totalScore < 40) {
      return 'vp';
    } else if (totalScore < 60) {
      return 'city_company';
    } else {
      return 'manager';
    }
  }

  /**
   * 保存任务
   */
  private saveTask(task: Task): void {
    try {
      const tasks = this.getTasks();
      tasks.push(task);
      localStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  }

  /**
   * 获取所有任务
   */
  private getTasks(): Task[] {
    try {
      const stored = localStorage.getItem('tasks');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get tasks:', error);
      return [];
    }
  }

  /**
   * 发送通知操作
   */
  private async sendNotificationAction(
    data: any,
    confirm: (config: ActionConfirmConfig) => Promise<boolean>
  ): Promise<boolean> {
    const { title, message, merchant } = data;

    // 询问用户确认
    const confirmed = await confirm({
      title: '发送通知',
      message: `确定要发送通知给相关人员吗？`,
      confirmText: '发送',
      cancelText: '取消',
      data: { title, message, merchant },
    });

    if (!confirmed) {
      return false;
    }

    // 创建通知
    const notification: AppNotification = {
      id: this.generateId(),
      type: 'task_assigned',
      title,
      message,
      taskId: '',
      createdAt: new Date().toISOString(),
      read: false,
      priority: 'medium',
      merchantName: merchant?.name || '',
    };

    notificationService.saveNotification(notification);
    await notificationService.sendBrowserNotification(notification);

    return true;
  }

  /**
   * 提示创建任务（诊断后自动触发）
   */
  async promptTaskCreation(
    merchant: Merchant,
    diagnosis: any,
    confirm: (config: ActionConfirmConfig) => Promise<boolean>
  ): Promise<Task | null> {
    // 检查是否需要创建任务
    if (!this.shouldCreateTask(merchant, diagnosis)) {
      return null;
    }

    // 提取推荐措施
    const measures = diagnosis.recommendations?.map((r: any) => r.action || r) || [];

    // 询问用户确认
    const confirmed = await confirm({
      title: '创建帮扶任务',
      message: `已为 ${merchant.name} 完成诊断，检测到以下问题：\n\n${
        Array.isArray(diagnosis.problems)
          ? diagnosis.problems.slice(0, 3).join('\n')
          : diagnosis.summary
      }\n\n是否创建帮扶任务？`,
      confirmText: '创建任务',
      cancelText: '暂不创建',
      data: { merchant, diagnosis },
    });

    if (!confirmed) {
      return null;
    }

    // 创建任务
    const task = await this.createTask(merchant, diagnosis, measures);

    // 创建通知
    const notification = notificationService.createTaskAssignedNotification(task);
    notificationService.saveNotification(notification);
    await notificationService.sendBrowserNotification(notification);

    return task;
  }

  /**
   * 判断是否应该创建任务
   */
  private shouldCreateTask(merchant: Merchant, diagnosis: any): boolean {
    // 健康分低于80或风险等级中等以上
    const riskLevelMap: Record<string, number> = {
      none: 0,
      low: 1,
      medium: 2,
      high: 3,
      critical: 4,
    };

    return (
      merchant.totalScore < 80 ||
      riskLevelMap[merchant.riskLevel] >= 2 ||
      (diagnosis.problems && diagnosis.problems.length >= 3)
    );
  }

  /**
   * 批量创建任务
   */
  async createBatchTasks(
    merchants: Merchant[],
    confirm: (config: ActionConfirmConfig) => Promise<boolean>
  ): Promise<Task[]> {
    const confirmed = await confirm({
      title: '批量创建任务',
      message: `确定要为 ${merchants.length} 个商户创建帮扶任务吗？`,
      confirmText: '创建',
      cancelText: '取消',
      data: { merchants },
    });

    if (!confirmed) {
      return [];
    }

    const tasks: Task[] = [];

    for (const merchant of merchants) {
      try {
        const task = await this.createTask(
          merchant,
          { problems: ['健康度异常，需要帮扶'], summary: '批量创建的帮扶任务' },
          []
        );
        tasks.push(task);

        // 创建通知
        const notification = notificationService.createTaskAssignedNotification(task);
        notificationService.saveNotification(notification);
      } catch (error) {
        console.error(`Failed to create task for merchant ${merchant.id}:`, error);
      }
    }

    return tasks;
  }

  /**
   * 生成唯一 ID
   */
  private generateId(): string {
    return `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 检查诊断触发条件
   */
  checkDiagnosisTrigger(merchant: Merchant): boolean {
    const riskLevelMap: Record<string, number> = {
      none: 0,
      low: 1,
      medium: 2,
      high: 3,
      critical: 4,
    };

    return merchant.totalScore < 80 || riskLevelMap[merchant.riskLevel] >= 2;
  }

  /**
   * 获取建议的操作
   */
  getSuggestedActions(merchant: Merchant, diagnosis: any): SuggestedAction[] {
    const actions: SuggestedAction[] = [];

    // 如果需要创建任务
    if (this.shouldCreateTask(merchant, diagnosis)) {
      actions.push({
        type: 'create_task',
        data: {
          merchant,
          diagnosis,
          measures: diagnosis.recommendations?.map((r: any) => r.action || r) || [],
        },
        description: '为该商户创建帮扶任务',
      });
    }

    // 如果风险等级高
    if (['high', 'critical'].includes(merchant.riskLevel)) {
      actions.push({
        type: 'send_notification',
        data: {
          title: `${merchant.name} 高风险预警`,
          message: `商户健康度${merchant.totalScore}分，风险等级${merchant.riskLevel}，请及时关注`,
          merchant,
        },
        description: '发送高风险预警通知',
      });
    }

    return actions;
  }
}

// 导出单例实例
export const actionExecutor = new ActionExecutor();
