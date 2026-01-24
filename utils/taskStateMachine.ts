/**
 * Task State Machine Utility
 * 任务状态机 - 帮扶任务阶段流转和验证
 *
 * Priority: P1
 * Use Cases: 任务阶段管理、流程控制、状态验证
 */

export type TaskStage =
  | 'planning'      // 措施制定
  | 'executing'     // 执行中
  | 'evaluating'    // 效果评估
  | 'completed'     // 已完成(达标)
  | 'escalated'     // 已升级(继续帮扶)
  | 'exit';         // 转招商(备商/清退)

export interface Task {
  id: string;
  stage: TaskStage;
  measures?: string[];
  logs?: any[];
  evaluationResult?: 'met' | 'not_met';
  [key: string]: any;
}

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export interface StageTransitionConfig {
  allowedNextStages: TaskStage[];
  requiredFields?: string[];
  customValidation?: (task: Task) => ValidationResult;
}

/**
 * 任务阶段流程定义
 * 定义每个阶段可以流转到哪些下一阶段
 */
export const STAGE_FLOW: Record<TaskStage, TaskStage[]> = {
  'planning': ['executing'],
  'executing': ['evaluating'],
  'evaluating': ['completed', 'escalated', 'exit'],
  'completed': [],
  'escalated': [],
  'exit': []
};

/**
 * 阶段标签映射
 */
export const STAGE_LABELS: Record<TaskStage, string> = {
  'planning': '措施制定',
  'executing': '执行中',
  'evaluating': '效果评估',
  'completed': '已完成(达标)',
  'escalated': '已升级(继续帮扶)',
  'exit': '转招商(备商/清退)'
};

/**
 * 阶段提示信息
 */
export const STAGE_HINTS: Record<TaskStage, {
  title: string;
  items: string[];
  icon: string;
  color: string;
}> = {
  'planning': {
    title: '措施制定阶段',
    items: [
      '分析商户问题，确定帮扶目标',
      '可选择标准化流程模板快速制定方案',
      '使用AI推荐或手动添加帮扶措施',
      '至少添加1条措施后才能进入执行阶段'
    ],
    icon: 'fa-lightbulb',
    color: 'blue'
  },
  'executing': {
    title: '帮扶执行阶段',
    items: [
      '按照制定的措施逐步执行帮扶工作',
      '及时添加执行记录，记录进展和问题',
      '可根据实际情况调整帮扶措施',
      '至少添加1条执行记录后才能进入评估阶段'
    ],
    icon: 'fa-tasks',
    color: 'orange'
  },
  'evaluating': {
    title: '效果评估阶段',
    items: [
      '对比帮扶前后的健康度指标变化',
      '评估帮扶措施的实际效果',
      '判定效果是否达标',
      '达标可结案，未达标可升级或转招商'
    ],
    icon: 'fa-chart-line',
    color: 'purple'
  },
  'completed': {
    title: '已完成',
    items: ['任务已成功完成并归档'],
    icon: 'fa-check-circle',
    color: 'green'
  },
  'escalated': {
    title: '已升级',
    items: ['已流转至上一级，继续帮扶'],
    icon: 'fa-arrow-up-right-dots',
    color: 'purple'
  },
  'exit': {
    title: '已转招商',
    items: ['已转入招商预警池，启动清退流程'],
    icon: 'fa-ban',
    color: 'orange'
  }
};

/**
 * 验证阶段切换是否合法
 *
 * @param currentStage 当前阶段
 * @param nextStage 目标阶段
 * @param task 任务对象（用于验证必填字段）
 * @returns 验证结果
 */
export function validateStageTransition(
  currentStage: TaskStage,
  nextStage: TaskStage,
  task?: Task
): ValidationResult {
  // 1. 检查是否是合法的下一阶段
  const allowedNextStages = STAGE_FLOW[currentStage] || [];
  if (!allowedNextStages.includes(nextStage)) {
    return {
      valid: false,
      message: `不能从"${STAGE_LABELS[currentStage]}"直接切换到"${STAGE_LABELS[nextStage]}"`
    };
  }

  // 2. 如果提供了任务对象，检查必填字段
  if (task) {
    // 进入执行阶段：需要至少1条帮扶措施
    if (nextStage === 'executing') {
      if (!task.measures || task.measures.length === 0) {
        return {
          valid: false,
          message: '请至少添加一条帮扶措施后再开始执行'
        };
      }
    }

    // 进入评估阶段：需要至少1条执行记录
    if (nextStage === 'evaluating') {
      if (!task.logs || task.logs.length === 0) {
        return {
          valid: false,
          message: '请至少添加一条执行记录后再进入评估阶段'
        };
      }
    }

    // 结案：需要效果达标
    if (nextStage === 'completed') {
      if (task.evaluationResult !== 'met') {
        return {
          valid: false,
          message: '请先标记效果达标后再结案'
        };
      }
    }
  }

  return { valid: true };
}

/**
 * 获取阶段标签
 *
 * @param stage 阶段
 * @returns 阶段标签
 */
export function getStageLabel(stage: TaskStage): string {
  return STAGE_LABELS[stage] || stage;
}

/**
 * 获取阶段提示
 *
 * @param stage 阶段
 * @returns 阶段提示信息
 */
export function getStageHint(stage: TaskStage) {
  return STAGE_HINTS[stage] || null;
}

/**
 * 获取允许的下一阶段列表
 *
 * @param currentStage 当前阶段
 * @returns 允许的下一阶段列表
 */
export function getAllowedNextStages(currentStage: TaskStage): TaskStage[] {
  return STAGE_FLOW[currentStage] || [];
}

/**
 * 检查任务是否处于终态
 *
 * @param stage 阶段
 * @returns 是否为终态
 */
export function isFinalStage(stage: TaskStage): boolean {
  return ['completed', 'escalated', 'exit'].includes(stage);
}

/**
 * 检查任务是否可以编辑
 *
 * @param stage 阶段
 * @returns 是否可编辑
 */
export function isEditable(stage: TaskStage): boolean {
  return !isFinalStage(stage);
}

/**
 * 生成阶段切换日志
 *
 * @param currentStage 当前阶段
 * @param nextStage 目标阶段
 * @param user 操作用户
 * @returns 日志对象
 */
export function createStageTransitionLog(
  currentStage: TaskStage,
  nextStage: TaskStage,
  user: string = '运营经理'
) {
  return {
    id: `l-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    action: `阶段切换：${getStageLabel(currentStage)} → ${getStageLabel(nextStage)}`,
    type: 'manual',
    user
  };
}

/**
 * 获取阶段进度百分比
 *
 * @param stage 阶段
 * @returns 进度百分比 (0-100)
 */
export function getStageProgress(stage: TaskStage): number {
  const progressMap: Record<TaskStage, number> = {
    'planning': 25,
    'executing': 50,
    'evaluating': 75,
    'completed': 100,
    'escalated': 100,
    'exit': 100
  };
  return progressMap[stage] || 0;
}

/**
 * 获取阶段颜色类名
 *
 * @param stage 阶段
 * @returns Tailwind CSS 颜色类名
 */
export function getStageColorClass(stage: TaskStage): string {
  const colorMap: Record<TaskStage, string> = {
    'planning': 'bg-blue-100 text-blue-700',
    'executing': 'bg-orange-100 text-orange-700',
    'evaluating': 'bg-purple-100 text-purple-700',
    'completed': 'bg-green-100 text-green-700',
    'escalated': 'bg-purple-100 text-purple-700',
    'exit': 'bg-red-100 text-red-700'
  };
  return colorMap[stage] || 'bg-slate-100 text-slate-600';
}

/**
 * 批量验证任务阶段
 *
 * @param tasks 任务列表
 * @returns 验证结果列表
 */
export function validateTasks(tasks: Task[]): Array<{
  taskId: string;
  valid: boolean;
  issues: string[];
}> {
  return tasks.map(task => {
    const issues: string[] = [];

    // 检查必填字段
    if (task.stage === 'executing' && (!task.measures || task.measures.length === 0)) {
      issues.push('执行阶段缺少帮扶措施');
    }

    if (task.stage === 'evaluating' && (!task.logs || task.logs.length === 0)) {
      issues.push('评估阶段缺少执行记录');
    }

    if (task.stage === 'completed' && task.evaluationResult !== 'met') {
      issues.push('已完成任务但效果未达标');
    }

    return {
      taskId: task.id,
      valid: issues.length === 0,
      issues
    };
  });
}
