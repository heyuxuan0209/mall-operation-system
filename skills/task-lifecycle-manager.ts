/**
 * 任务生命周期管理器
 *
 * 功能：管理任务从创建到结案的完整流程
 * 复用场景：
 * - 任务中心的状态流转
 * - 工作流引擎
 * - 审批流程
 */

export type TaskStage = 'planning' | 'executing' | 'evaluating' | 'completed' | 'escalated' | 'exit';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed';
export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  merchantId: string;
  merchantName: string;
  title: string;
  description: string;
  measures: string[];
  assignee: string;
  status: TaskStatus;
  stage: TaskStage;
  priority: TaskPriority;
  createdAt: string;
  updatedAt: string;
  deadline: string;
  logs?: TaskLog[];
  evaluationResult?: 'met' | 'not_met';
}

export interface TaskLog {
  id: string;
  date: string;
  action: string;
  type: 'manual' | 'strategy_adopted' | 'system';
  user: string;
}

export interface TaskTransition {
  from: TaskStage;
  to: TaskStage;
  condition?: (task: Task) => boolean;
  action?: (task: Task) => void;
}

/**
 * 任务状态机定义
 *
 * 状态流转规则：
 * planning → executing → evaluating → (completed | escalated | exit)
 */
const STAGE_TRANSITIONS: TaskTransition[] = [
  {
    from: 'planning',
    to: 'executing',
    condition: (task) => task.measures && task.measures.length > 0
  },
  {
    from: 'executing',
    to: 'evaluating'
  },
  {
    from: 'evaluating',
    to: 'completed',
    condition: (task) => task.evaluationResult === 'met'
  },
  {
    from: 'evaluating',
    to: 'escalated',
    condition: (task) => task.evaluationResult === 'not_met'
  },
  {
    from: 'evaluating',
    to: 'exit',
    condition: (task) => task.evaluationResult === 'not_met'
  }
];

/**
 * 验证状态转换是否合法
 */
export function canTransition(task: Task, toStage: TaskStage): {
  allowed: boolean;
  reason?: string;
} {
  const transition = STAGE_TRANSITIONS.find(
    t => t.from === task.stage && t.to === toStage
  );

  if (!transition) {
    return {
      allowed: false,
      reason: `不允许从 ${getStageLabel(task.stage)} 直接转到 ${getStageLabel(toStage)}`
    };
  }

  if (transition.condition && !transition.condition(task)) {
    if (toStage === 'executing') {
      return {
        allowed: false,
        reason: '请至少添加一条帮扶措施后再开始执行'
      };
    }
    return {
      allowed: false,
      reason: '不满足状态转换条件'
    };
  }

  return { allowed: true };
}

/**
 * 执行状态转换
 */
export function transitionStage(task: Task, toStage: TaskStage): Task {
  const validation = canTransition(task, toStage);

  if (!validation.allowed) {
    throw new Error(validation.reason);
  }

  const updatedTask = {
    ...task,
    stage: toStage,
    updatedAt: new Date().toISOString().split('T')[0]
  };

  // 执行转换后的动作
  const transition = STAGE_TRANSITIONS.find(
    t => t.from === task.stage && t.to === toStage
  );

  if (transition?.action) {
    transition.action(updatedTask);
  }

  // 添加系统日志
  const systemLog: TaskLog = {
    id: `log_${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    action: `任务状态从 ${getStageLabel(task.stage)} 转换到 ${getStageLabel(toStage)}`,
    type: 'system',
    user: 'System'
  };

  updatedTask.logs = [...(updatedTask.logs || []), systemLog];

  return updatedTask;
}

/**
 * 添加执行记录
 */
export function addLog(task: Task, log: Omit<TaskLog, 'id' | 'date'>): Task {
  const newLog: TaskLog = {
    id: `log_${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    ...log
  };

  return {
    ...task,
    logs: [...(task.logs || []), newLog],
    updatedAt: new Date().toISOString().split('T')[0]
  };
}

/**
 * 更新执行记录
 */
export function updateLog(task: Task, logId: string, newContent: string): Task {
  const updatedLogs = (task.logs || []).map(log =>
    log.id === logId
      ? { ...log, action: newContent, date: new Date().toISOString().split('T')[0] }
      : log
  );

  return {
    ...task,
    logs: updatedLogs,
    updatedAt: new Date().toISOString().split('T')[0]
  };
}

/**
 * 删除执行记录
 */
export function deleteLog(task: Task, logId: string): Task {
  return {
    ...task,
    logs: (task.logs || []).filter(log => log.id !== logId),
    updatedAt: new Date().toISOString().split('T')[0]
  };
}

/**
 * 添加帮扶措施
 */
export function addMeasure(task: Task, measure: string, user: string): Task {
  const updatedTask = {
    ...task,
    measures: [...task.measures, measure],
    updatedAt: new Date().toISOString().split('T')[0]
  };

  // 如果在执行阶段，自动添加日志
  if (task.stage === 'executing') {
    return addLog(updatedTask, {
      action: `新增措施：${measure}`,
      type: 'manual',
      user
    });
  }

  return updatedTask;
}

/**
 * 删除帮扶措施
 */
export function removeMeasure(task: Task, measureIndex: number, user: string): Task {
  const removedMeasure = task.measures[measureIndex];
  const updatedTask = {
    ...task,
    measures: task.measures.filter((_, idx) => idx !== measureIndex),
    updatedAt: new Date().toISOString().split('T')[0]
  };

  // 如果在执行阶段，自动添加日志
  if (task.stage === 'executing') {
    return addLog(updatedTask, {
      action: `删除措施：${removedMeasure}`,
      type: 'manual',
      user
    });
  }

  return updatedTask;
}

/**
 * 评估任务效果
 */
export function evaluateTask(
  task: Task,
  result: 'met' | 'not_met',
  reason?: string
): Task {
  if (task.stage !== 'evaluating') {
    throw new Error('只能在评估阶段进行效果判定');
  }

  const updatedTask = {
    ...task,
    evaluationResult: result,
    updatedAt: new Date().toISOString().split('T')[0]
  };

  // 添加评估日志
  const logAction = result === 'met'
    ? '效果评估：达标，准备结案'
    : `效果评估：未达标${reason ? `，原因：${reason}` : ''}`;

  return addLog(updatedTask, {
    action: logAction,
    type: 'system',
    user: task.assignee
  });
}

/**
 * 升级任务
 */
export function escalateTask(task: Task, reason: string): Task {
  const updatedTask = transitionStage(task, 'escalated');

  return addLog(updatedTask, {
    action: `任务升级至上一级。原因：${reason}`,
    type: 'manual',
    user: task.assignee
  });
}

/**
 * 转招商
 */
export function exitToLeasing(task: Task, reason: string): Task {
  const updatedTask = transitionStage(task, 'exit');

  return addLog(updatedTask, {
    action: `转招商预警池。原因：${reason}`,
    type: 'manual',
    user: task.assignee
  });
}

/**
 * 结案
 */
export function completeTask(task: Task): Task {
  if (task.evaluationResult !== 'met') {
    throw new Error('只有效果达标的任务才能结案');
  }

  const updatedTask = transitionStage(task, 'completed');

  return {
    ...updatedTask,
    status: 'completed'
  };
}

/**
 * 获取阶段的中文标签
 */
export function getStageLabel(stage: TaskStage): string {
  const labels: Record<TaskStage, string> = {
    planning: '措施制定',
    executing: '执行中',
    evaluating: '效果评估',
    completed: '已完成(达标)',
    escalated: '已升级(继续帮扶)',
    exit: '转招商(备商/清退)'
  };
  return labels[stage];
}

/**
 * 获取任务进度百分比
 */
export function getTaskProgress(task: Task): number {
  const stageProgress: Record<TaskStage, number> = {
    planning: 25,
    executing: 50,
    evaluating: 75,
    completed: 100,
    escalated: 100,
    exit: 100
  };
  return stageProgress[task.stage];
}

/**
 * 检查任务是否逾期
 */
export function isOverdue(task: Task): boolean {
  const deadline = new Date(task.deadline);
  const now = new Date();
  return now > deadline && task.status !== 'completed';
}

/**
 * 获取剩余天数
 */
export function getDaysRemaining(task: Task): number {
  const deadline = new Date(task.deadline);
  const now = new Date();
  const diff = deadline.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
