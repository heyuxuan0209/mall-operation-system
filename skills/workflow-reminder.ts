/**
 * 工作流提醒器（Workflow Reminder）
 *
 * 功能：综合判断何时应该提醒用户保存进度
 *
 * 复用场景：
 * - 工作流自动化中的智能提醒
 * - CLI工具的保存建议
 * - IDE扩展的实时监控
 * - 开发过程管理
 *
 * ## 判断维度
 *
 * 1. **Token使用率**: 超过阈值时触发
 * 2. **工作时长**: 超过时间阈值时触发
 * 3. **功能完成数**: 完成多个功能时触发
 * 4. **文件修改数**: 修改大量文件时触发
 *
 * ## 提醒等级
 *
 * | 等级 | 条件 | 操作建议 |
 * |------|------|----------|
 * | low | 任一阈值触发 | 可以考虑保存 |
 * | medium | Token>50% OR 时间>60min OR 功能>3 | 建议保存 |
 * | high | Token>70% OR 时间>90min OR 功能>5 | 强烈建议保存 |
 * | critical | Token>80% OR 时间>120min | 必须立即保存 |
 *
 * @version 1.0
 * @created 2026-01-29
 */

export type ReminderUrgency = 'low' | 'medium' | 'high' | 'critical';

export type ReminderTrigger =
  | 'token-threshold'    // Token超阈值
  | 'time-elapsed'       // 时间超时
  | 'feature-complete'   // 功能完成数达标
  | 'file-changes'       // 文件修改数达标
  | 'multiple-factors'   // 多重因素
  | 'manual-request'     // 手动请求
  | 'none';              // 无触发

export interface TokenUsageState {
  current: number;
  max: number;
}

export interface WorkflowState {
  tokenUsage: TokenUsageState;
  timeElapsed: number;        // 工作时长（分钟）
  featuresCompleted: number;  // 完成的功能数
  filesModified?: number;     // 修改的文件数
  manualRequest?: boolean;    // 手动请求提醒
}

export interface ReminderStrategy {
  tokenThreshold: number;      // Token阈值（百分比）
  timeThreshold: number;       // 时间阈值（分钟）
  featureThreshold: number;    // 功能完成阈值
  fileThreshold: number;       // 文件修改阈值
  aggressiveness: 'passive' | 'moderate' | 'aggressive';
}

export interface ReminderResult {
  shouldRemind: boolean;
  trigger: ReminderTrigger;
  urgency: ReminderUrgency;
  reasons: string[];
  suggestions: string[];
  message: string;
  state: WorkflowState;
}

/**
 * 获取默认策略
 *
 * @param aggressiveness - 提醒激进程度
 * @returns 默认策略配置
 */
export function getDefaultStrategy(
  aggressiveness: 'passive' | 'moderate' | 'aggressive' = 'moderate'
): ReminderStrategy {
  const strategies: Record<typeof aggressiveness, ReminderStrategy> = {
    passive: {
      tokenThreshold: 70,
      timeThreshold: 90,
      featureThreshold: 5,
      fileThreshold: 15,
      aggressiveness: 'passive',
    },
    moderate: {
      tokenThreshold: 50,
      timeThreshold: 60,
      featureThreshold: 3,
      fileThreshold: 10,
      aggressiveness: 'moderate',
    },
    aggressive: {
      tokenThreshold: 40,
      timeThreshold: 45,
      featureThreshold: 2,
      fileThreshold: 8,
      aggressiveness: 'aggressive',
    },
  };

  return strategies[aggressiveness];
}

/**
 * 计算Token使用百分比
 *
 * @param tokenUsage - Token使用状态
 * @returns Token使用百分比
 */
function calculateTokenPercentage(tokenUsage: TokenUsageState): number {
  if (tokenUsage.max <= 0) return 0;
  return Math.round((tokenUsage.current / tokenUsage.max) * 1000) / 10;
}

/**
 * 识别提醒触发原因
 *
 * @param state - 工作流状态
 * @param strategy - 提醒策略
 * @returns 触发原因
 */
export function getReminderTrigger(
  state: WorkflowState,
  strategy: ReminderStrategy
): ReminderTrigger {
  if (state.manualRequest) {
    return 'manual-request';
  }

  const tokenPercentage = calculateTokenPercentage(state.tokenUsage);
  const triggeredFactors: ReminderTrigger[] = [];

  // 检查各个维度
  if (tokenPercentage >= strategy.tokenThreshold) {
    triggeredFactors.push('token-threshold');
  }

  if (state.timeElapsed >= strategy.timeThreshold) {
    triggeredFactors.push('time-elapsed');
  }

  if (state.featuresCompleted >= strategy.featureThreshold) {
    triggeredFactors.push('feature-complete');
  }

  if (state.filesModified !== undefined && state.filesModified >= strategy.fileThreshold) {
    triggeredFactors.push('file-changes');
  }

  // 判断触发原因
  if (triggeredFactors.length === 0) {
    return 'none';
  } else if (triggeredFactors.length === 1) {
    return triggeredFactors[0];
  } else {
    return 'multiple-factors';
  }
}

/**
 * 判断是否应该提醒用户
 *
 * @param state - 工作流状态
 * @param strategy - 提醒策略（可选）
 * @returns 是否应该提醒
 */
export function shouldRemindUser(
  state: WorkflowState,
  strategy?: Partial<ReminderStrategy>
): boolean {
  const fullStrategy = { ...getDefaultStrategy(), ...strategy };
  const trigger = getReminderTrigger(state, fullStrategy);
  return trigger !== 'none';
}

/**
 * 计算提醒紧急程度
 *
 * @param state - 工作流状态
 * @param trigger - 触发原因
 * @returns 紧急程度
 */
export function calculateUrgency(
  state: WorkflowState,
  trigger: ReminderTrigger
): ReminderUrgency {
  const tokenPercentage = calculateTokenPercentage(state.tokenUsage);

  // Critical: Token > 80% OR 时间 > 120min
  if (tokenPercentage >= 80 || state.timeElapsed >= 120) {
    return 'critical';
  }

  // High: Token > 70% OR 时间 > 90min OR 功能 > 5
  if (
    tokenPercentage >= 70 ||
    state.timeElapsed >= 90 ||
    state.featuresCompleted > 5
  ) {
    return 'high';
  }

  // Medium: Token > 50% OR 时间 > 60min OR 功能 > 3
  if (
    tokenPercentage >= 50 ||
    state.timeElapsed >= 60 ||
    state.featuresCompleted > 3
  ) {
    return 'medium';
  }

  // Low: 任一阈值触发
  return 'low';
}

/**
 * 生成触发原因描述
 *
 * @param state - 工作流状态
 * @param trigger - 触发原因
 * @param strategy - 提醒策略
 * @returns 原因列表
 */
function generateReasons(
  state: WorkflowState,
  trigger: ReminderTrigger,
  strategy: ReminderStrategy
): string[] {
  const reasons: string[] = [];
  const tokenPercentage = calculateTokenPercentage(state.tokenUsage);

  if (trigger === 'manual-request') {
    reasons.push('手动请求提醒');
    return reasons;
  }

  if (trigger === 'token-threshold' || trigger === 'multiple-factors') {
    if (tokenPercentage >= strategy.tokenThreshold) {
      reasons.push(
        `Token使用率 ${tokenPercentage.toFixed(1)}% (阈值: ${strategy.tokenThreshold}%)`
      );
    }
  }

  if (trigger === 'time-elapsed' || trigger === 'multiple-factors') {
    if (state.timeElapsed >= strategy.timeThreshold) {
      reasons.push(
        `工作时长 ${state.timeElapsed} 分钟 (阈值: ${strategy.timeThreshold} 分钟)`
      );
    }
  }

  if (trigger === 'feature-complete' || trigger === 'multiple-factors') {
    if (state.featuresCompleted >= strategy.featureThreshold) {
      reasons.push(
        `已完成 ${state.featuresCompleted} 个功能 (阈值: ${strategy.featureThreshold})`
      );
    }
  }

  if (trigger === 'file-changes' || trigger === 'multiple-factors') {
    if (state.filesModified !== undefined && state.filesModified >= strategy.fileThreshold) {
      reasons.push(
        `已修改 ${state.filesModified} 个文件 (阈值: ${strategy.fileThreshold})`
      );
    }
  }

  return reasons;
}

/**
 * 生成操作建议
 *
 * @param urgency - 紧急程度
 * @param state - 工作流状态
 * @returns 建议列表
 */
function generateSuggestions(urgency: ReminderUrgency, state: WorkflowState): string[] {
  const suggestions: string[] = [];
  const tokenPercentage = calculateTokenPercentage(state.tokenUsage);

  if (urgency === 'critical') {
    suggestions.push('🔴 必须立即保存！上下文即将溢出');
    suggestions.push('使用文档生成器创建CONTEXT.md、VERSION.md、CHANGELOG.md');
    suggestions.push('判断文件保存位置（项目内 vs 外部文档）');
    suggestions.push('提交Git commit保存项目变更');
  } else if (urgency === 'high') {
    suggestions.push('🟠 强烈建议立即保存进度');
    suggestions.push('整理当前工作成果，生成文档');
    suggestions.push('提交Git commit记录变更');
  } else if (urgency === 'medium') {
    suggestions.push('🟡 建议保存当前进度');
    suggestions.push('可以生成CONTEXT.md记录当前状态');
    suggestions.push('如果功能完整，建议提交commit');
  } else {
    suggestions.push('🟢 可以考虑保存进度');
    suggestions.push('继续工作，或在合适时机保存');
  }

  // Token特定建议
  if (tokenPercentage >= 70) {
    suggestions.push(`⚠️ Token使用率已达 ${tokenPercentage.toFixed(1)}%，建议尽快保存`);
  }

  // 时间特定建议
  if (state.timeElapsed >= 90) {
    suggestions.push(`⏰ 已工作 ${state.timeElapsed} 分钟，建议休息并保存进度`);
  }

  return suggestions;
}

/**
 * 生成提醒消息
 *
 * @param result - 提醒结果（不含message）
 * @returns 格式化的提醒消息
 */
export function generateWorkflowReminderMessage(
  result: Omit<ReminderResult, 'message'>
): string {
  const { urgency, trigger, reasons, suggestions } = result;

  const parts: string[] = [];

  // 紧急程度标题
  const urgencyTitles: Record<ReminderUrgency, string> = {
    critical: '🔴 危急提醒',
    high: '🟠 高优先级提醒',
    medium: '🟡 提醒',
    low: '🟢 友好提示',
  };
  parts.push(`\n${urgencyTitles[urgency]}: 建议保存工作进度\n`);

  // 触发原因
  parts.push('**触发原因**:');
  reasons.forEach(reason => {
    parts.push(`  - ${reason}`);
  });
  parts.push('');

  // 操作建议
  parts.push('**操作建议**:');
  suggestions.forEach((suggestion, index) => {
    parts.push(`  ${index + 1}. ${suggestion}`);
  });

  return parts.join('\n');
}

/**
 * 检查工作流提醒
 *
 * 主入口函数，完整分析工作流状态并生成提醒
 *
 * @param state - 工作流状态
 * @param strategy - 提醒策略（可选）
 * @returns 提醒结果
 *
 * @example
 * ```typescript
 * // 基本使用
 * const result = checkWorkflowReminder({
 *   tokenUsage: { current: 120000, max: 200000 },
 *   timeElapsed: 75,
 *   featuresCompleted: 4,
 *   filesModified: 12
 * });
 *
 * if (result.shouldRemind) {
 *   console.log(result.message);
 * }
 *
 * // 自定义策略
 * const result = checkWorkflowReminder(
 *   {
 *     tokenUsage: { current: 100000, max: 200000 },
 *     timeElapsed: 50,
 *     featuresCompleted: 3
 *   },
 *   { aggressiveness: 'aggressive' }
 * );
 * ```
 */
export function checkWorkflowReminder(
  state: WorkflowState,
  strategy?: Partial<ReminderStrategy>
): ReminderResult {
  const fullStrategy = { ...getDefaultStrategy(), ...strategy };

  // 判断是否提醒
  const shouldRemind = shouldRemindUser(state, strategy);

  // 识别触发原因
  const trigger = getReminderTrigger(state, fullStrategy);

  // 计算紧急程度
  const urgency = calculateUrgency(state, trigger);

  // 生成原因和建议
  const reasons = generateReasons(state, trigger, fullStrategy);
  const suggestions = generateSuggestions(urgency, state);

  // 生成消息
  const resultWithoutMessage = {
    shouldRemind,
    trigger,
    urgency,
    reasons,
    suggestions,
    state,
  };

  const message = shouldRemind
    ? generateWorkflowReminderMessage(resultWithoutMessage)
    : '✅ 当前工作状态良好，无需保存提醒';

  return {
    ...resultWithoutMessage,
    message,
  };
}

/**
 * 批量检查多个工作流状态
 *
 * @param states - 工作流状态列表
 * @param strategy - 提醒策略
 * @returns 提醒结果列表
 */
export function checkMultipleWorkflowReminders(
  states: WorkflowState[],
  strategy?: Partial<ReminderStrategy>
): ReminderResult[] {
  return states.map(state => checkWorkflowReminder(state, strategy));
}

/**
 * 获取最紧急的提醒
 *
 * @param results - 提醒结果列表
 * @returns 最紧急的提醒结果
 */
export function getMostUrgentReminder(results: ReminderResult[]): ReminderResult | null {
  const urgencyPriority: Record<ReminderUrgency, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
  };

  const reminders = results.filter(r => r.shouldRemind);

  if (reminders.length === 0) {
    return null;
  }

  return reminders.reduce((mostUrgent, current) => {
    return urgencyPriority[current.urgency] > urgencyPriority[mostUrgent.urgency]
      ? current
      : mostUrgent;
  });
}

/**
 * 估算剩余工作时间
 *
 * @param state - 工作流状态
 * @param strategy - 提醒策略
 * @returns 建议的剩余工作时间（分钟）
 */
export function estimateRemainingWorkTime(
  state: WorkflowState,
  strategy?: Partial<ReminderStrategy>
): number {
  const fullStrategy = { ...getDefaultStrategy(), ...strategy };
  const tokenPercentage = calculateTokenPercentage(state.tokenUsage);

  // 基于Token计算剩余时间
  const remainingTokenPercentage = 100 - tokenPercentage;
  const estimatedTimeByToken = (remainingTokenPercentage / tokenPercentage) * state.timeElapsed;

  // 基于时间阈值计算
  const remainingTimeByThreshold = Math.max(0, fullStrategy.timeThreshold - state.timeElapsed);

  // 取较小值（保守估计）
  return Math.floor(Math.min(estimatedTimeByToken, remainingTimeByThreshold));
}
