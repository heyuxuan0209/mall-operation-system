/**
 * Token监控器（Token Monitor）
 *
 * 功能：监控Token使用情况，生成标准化提醒
 *
 * 复用场景：
 * - 工作流自动化中的Token监控
 * - CLI工具的使用提醒
 * - IDE扩展的实时监控
 * - CI/CD中的资源使用追踪
 *
 * ## Token使用等级标准
 *
 * | 等级 | 使用率范围 | 状态 | 操作建议 |
 * |------|-----------|------|---------|
 * | safe（安全） | 0-49% | 🟢 绿色 | 继续工作 |
 * | warning（警告） | 50-69% | 🟡 黄色 | 建议保存 |
 * | urgent（紧急） | 70-79% | 🟠 橙色 | 强烈建议保存 |
 * | critical（危急） | 80-100% | 🔴 红色 | 必须立即保存 |
 *
 * @version 1.0
 * @created 2026-01-29
 */

export type TokenLevel = 'safe' | 'warning' | 'urgent' | 'critical';

export interface TokenUsage {
  current: number;  // 当前使用的token数
  max: number;      // 最大token限制
}

export interface TokenMonitorResult {
  usage: TokenUsage;
  percentage: number;
  level: TokenLevel;
  shouldRemind: boolean;
  reminderMessage: string;
}

export interface ReminderOptions {
  includePercentage?: boolean;
  includeNumbers?: boolean;
  customThresholds?: {
    warning?: number;
    urgent?: number;
    critical?: number;
  };
}

/**
 * 计算Token使用百分比
 *
 * @param current - 当前使用的token数
 * @param max - 最大token限制
 * @returns Token使用百分比（0-100）
 */
export function calculateTokenPercentage(current: number, max: number): number {
  if (max <= 0) return 0;
  if (current < 0) return 0;
  const percentage = (current / max) * 100;
  return Math.min(100, Math.round(percentage * 10) / 10); // 保留1位小数
}

/**
 * 获取Token使用等级
 *
 * @param percentage - Token使用百分比
 * @param customThresholds - 自定义阈值
 * @returns Token等级
 */
export function getTokenLevel(
  percentage: number,
  customThresholds?: ReminderOptions['customThresholds']
): TokenLevel {
  const thresholds = {
    warning: customThresholds?.warning ?? 50,
    urgent: customThresholds?.urgent ?? 70,
    critical: customThresholds?.critical ?? 80,
  };

  if (percentage >= thresholds.critical) return 'critical';
  if (percentage >= thresholds.urgent) return 'urgent';
  if (percentage >= thresholds.warning) return 'warning';
  return 'safe';
}

/**
 * 判断是否应该提醒用户
 *
 * @param level - Token等级
 * @returns 是否应该提醒
 */
export function shouldRemind(level: TokenLevel): boolean {
  return level !== 'safe';
}

/**
 * 获取等级对应的状态图标
 *
 * @param level - Token等级
 * @returns 状态图标
 */
function getLevelIcon(level: TokenLevel): string {
  const icons: Record<TokenLevel, string> = {
    safe: '🟢',
    warning: '🟡',
    urgent: '🟠',
    critical: '🔴',
  };
  return icons[level];
}

/**
 * 获取等级对应的中文描述
 *
 * @param level - Token等级
 * @returns 中文描述
 */
function getLevelDescription(level: TokenLevel): string {
  const descriptions: Record<TokenLevel, string> = {
    safe: '安全',
    warning: '警告',
    urgent: '紧急',
    critical: '危急',
  };
  return descriptions[level];
}

/**
 * 生成提醒消息
 *
 * @param result - Token监控结果
 * @param options - 提醒选项
 * @returns 格式化的提醒消息
 */
export function generateReminderMessage(
  result: Omit<TokenMonitorResult, 'reminderMessage'>,
  options?: ReminderOptions
): string {
  const { level, percentage, usage } = result;
  const icon = getLevelIcon(level);
  const description = getLevelDescription(level);

  if (level === 'safe') {
    return `${icon} Token使用安全 (${percentage}%)`;
  }

  // 构建消息部分
  const parts: string[] = [];

  // 基本信息
  parts.push(`${icon} Token使用${description}`);

  // 百分比信息
  if (options?.includePercentage !== false) {
    parts.push(`(${percentage}%)`);
  }

  // 具体数字
  if (options?.includeNumbers) {
    parts.push(`- ${usage.current.toLocaleString()}/${usage.max.toLocaleString()} tokens`);
  }

  // 操作建议
  const actions: Record<Exclude<TokenLevel, 'safe'>, string> = {
    warning: '建议保存当前进度',
    urgent: '强烈建议立即保存进度',
    critical: '必须立即保存！上下文即将溢出',
  };
  parts.push(`- ${actions[level as Exclude<TokenLevel, 'safe'>]}`);

  return parts.join(' ');
}

/**
 * 监控Token使用情况
 *
 * 主入口函数，完整分析Token使用情况并生成提醒
 *
 * @param current - 当前使用的token数
 * @param max - 最大token限制
 * @param options - 提醒选项
 * @returns Token监控结果
 *
 * @example
 * ```typescript
 * // 基本使用
 * const result = monitorTokenUsage(120000, 200000);
 * if (result.shouldRemind) {
 *   console.log(result.reminderMessage);
 * }
 *
 * // 自定义选项
 * const result = monitorTokenUsage(150000, 200000, {
 *   includeNumbers: true,
 *   customThresholds: { warning: 60, urgent: 75, critical: 85 }
 * });
 * ```
 */
export function monitorTokenUsage(
  current: number,
  max: number,
  options?: ReminderOptions
): TokenMonitorResult {
  const usage: TokenUsage = { current, max };
  const percentage = calculateTokenPercentage(current, max);
  const level = getTokenLevel(percentage, options?.customThresholds);
  const shouldRemindUser = shouldRemind(level);

  const resultWithoutMessage = {
    usage,
    percentage,
    level,
    shouldRemind: shouldRemindUser,
  };

  const reminderMessage = generateReminderMessage(resultWithoutMessage, options);

  return {
    ...resultWithoutMessage,
    reminderMessage,
  };
}

/**
 * 获取剩余可用Token数量
 *
 * @param usage - Token使用情况
 * @returns 剩余Token数量
 */
export function getRemainingTokens(usage: TokenUsage): number {
  return Math.max(0, usage.max - usage.current);
}

/**
 * 估算可以处理的剩余文件数
 *
 * 假设平均每个文件消耗约2000 tokens（含代码和分析）
 *
 * @param usage - Token使用情况
 * @param averageTokensPerFile - 平均每个文件消耗的tokens
 * @returns 估算的可处理文件数
 */
export function estimateRemainingFiles(
  usage: TokenUsage,
  averageTokensPerFile: number = 2000
): number {
  const remaining = getRemainingTokens(usage);
  return Math.floor(remaining / averageTokensPerFile);
}

/**
 * 批量监控多个Token使用情况
 *
 * @param usages - Token使用情况列表
 * @param options - 提醒选项
 * @returns 监控结果列表
 */
export function monitorMultipleTokenUsage(
  usages: TokenUsage[],
  options?: ReminderOptions
): TokenMonitorResult[] {
  return usages.map(usage =>
    monitorTokenUsage(usage.current, usage.max, options)
  );
}

/**
 * 获取最严重的Token使用等级
 *
 * @param results - Token监控结果列表
 * @returns 最严重的等级
 */
export function getMostSevereLevel(results: TokenMonitorResult[]): TokenLevel {
  const levelPriority: Record<TokenLevel, number> = {
    critical: 4,
    urgent: 3,
    warning: 2,
    safe: 1,
  };

  return results.reduce((mostSevere, current) => {
    return levelPriority[current.level] > levelPriority[mostSevere]
      ? current.level
      : mostSevere;
  }, 'safe' as TokenLevel);
}
