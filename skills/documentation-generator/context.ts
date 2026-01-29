/**
 * CONTEXT.md 生成器
 *
 * 功能：生成项目状态和最近活动的上下文更新
 *
 * @version 1.0
 * @created 2026-01-29
 */

import type { ContextUpdateOptions, DocumentationResult } from './types';
import { formatDate, formatList, generateHeading, generateFooter } from './helpers';

/**
 * 生成Git历史摘要
 *
 * @param gitHistory - Git历史信息
 * @returns Git历史摘要字符串
 */
function generateGitHistorySummary(
  gitHistory: NonNullable<ContextUpdateOptions['gitHistory']>
): string {
  const { branch, recentCommits, uncommittedChanges } = gitHistory;

  const parts: string[] = [];

  // 当前分支
  parts.push(`**当前分支**: \`${branch}\``);

  // 未提交变更
  if (uncommittedChanges > 0) {
    parts.push(`**未提交变更**: ${uncommittedChanges} 个文件`);
  } else {
    parts.push(`**未提交变更**: 无`);
  }

  // 最近提交
  if (recentCommits.length > 0) {
    parts.push('\n**最近提交**:');
    const commitList = recentCommits
      .slice(0, 5) // 只显示最近5条
      .map(commit => {
        const shortHash = commit.hash.substring(0, 7);
        const date = formatDate(commit.date, 'short');
        return `- \`${shortHash}\` - ${commit.message} (${date})`;
      })
      .join('\n');
    parts.push(commitList);
  }

  return parts.join('\n');
}

/**
 * 生成Token使用摘要
 *
 * @param tokenUsage - Token使用信息
 * @returns Token使用摘要字符串
 */
function generateTokenUsageSummary(
  tokenUsage: NonNullable<ContextUpdateOptions['tokenUsage']>
): string {
  const { current, max, percentage } = tokenUsage;

  let status = '🟢 安全';
  if (percentage >= 80) {
    status = '🔴 危急';
  } else if (percentage >= 70) {
    status = '🟠 紧急';
  } else if (percentage >= 50) {
    status = '🟡 警告';
  }

  return [
    `**Token使用**: ${current.toLocaleString()} / ${max.toLocaleString()} (${percentage.toFixed(1)}%)`,
    `**状态**: ${status}`,
  ].join('\n');
}

/**
 * 生成CONTEXT.md更新内容
 *
 * @param options - 上下文更新选项
 * @returns 文档生成结果
 *
 * @example
 * ```typescript
 * const result = generateContextUpdate({
 *   currentStatus: '正在优化巡检模块',
 *   recentActivity: [
 *     '完成批量巡检页面开发',
 *     '优化图片上传组件',
 *     '添加快速签到功能'
 *   ],
 *   tokenUsage: {
 *     current: 120000,
 *     max: 200000,
 *     percentage: 60
 *   }
 * });
 * ```
 */
export function generateContextUpdate(options: ContextUpdateOptions): DocumentationResult {
  const {
    currentStatus,
    recentActivity,
    gitHistory,
    tokenUsage,
    lastUpdated = formatDate(),
    additionalNotes,
  } = options;

  try {
    const sections: string[] = [];

    // 标题
    sections.push(generateHeading('项目上下文更新', 1));
    sections.push('');

    // 更新时间
    sections.push(`> 最后更新: ${lastUpdated}`);
    sections.push('');

    // 当前状态
    sections.push(generateHeading('当前状态', 2));
    sections.push('');
    sections.push(currentStatus);
    sections.push('');

    // 最近活动
    if (recentActivity.length > 0) {
      sections.push(generateHeading('最近活动', 2));
      sections.push('');
      sections.push(formatList(recentActivity));
      sections.push('');
    }

    // Token使用情况
    if (tokenUsage) {
      sections.push(generateHeading('Token使用情况', 2));
      sections.push('');
      sections.push(generateTokenUsageSummary(tokenUsage));
      sections.push('');
    }

    // Git历史
    if (gitHistory) {
      sections.push(generateHeading('Git历史', 2));
      sections.push('');
      sections.push(generateGitHistorySummary(gitHistory));
      sections.push('');
    }

    // 额外备注
    if (additionalNotes && additionalNotes.length > 0) {
      sections.push(generateHeading('备注', 2));
      sections.push('');
      sections.push(formatList(additionalNotes));
      sections.push('');
    }

    // 页脚
    sections.push(
      generateFooter({
        lastUpdated,
        author: 'Claude Sonnet 4.5',
      })
    );

    const content = sections.join('\n');

    return {
      content,
      filePath: 'CONTEXT.md',
      success: true,
      message: 'CONTEXT.md 更新内容生成成功',
    };
  } catch (error) {
    return {
      content: '',
      filePath: 'CONTEXT.md',
      success: false,
      message: `生成CONTEXT.md失败: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * 生成简化的CONTEXT更新（快速版本）
 *
 * @param status - 当前状态
 * @param activities - 最近活动列表
 * @returns 文档生成结果
 */
export function generateQuickContextUpdate(
  status: string,
  activities: string[]
): DocumentationResult {
  return generateContextUpdate({
    currentStatus: status,
    recentActivity: activities,
  });
}

/**
 * 生成CONTEXT更新的Markdown片段（可插入现有文档）
 *
 * @param options - 上下文更新选项
 * @returns Markdown内容字符串
 */
export function generateContextSnippet(options: ContextUpdateOptions): string {
  const result = generateContextUpdate(options);
  return result.content;
}
