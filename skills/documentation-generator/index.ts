/**
 * 文档生成器（Documentation Generator）
 *
 * 功能：自动生成CONTEXT.md、VERSION.md、CHANGELOG.md更新
 *
 * 复用场景：
 * - 工作流自动化中的文档更新
 * - Git commit后的自动文档生成
 * - 版本发布时的文档整理
 * - CI/CD中的文档同步
 *
 * @version 1.0
 * @created 2026-01-29
 */

// ==================== 类型导出 ====================
export type {
  ChangeType,
  FileChanges,
  CodeStats,
  ChangeInfo,
  GitHistoryInfo,
  ContextUpdateOptions,
  VersionUpdateOptions,
  ChangelogUpdateOptions,
  DocumentationResult,
  AllDocumentationResult,
  TemplateOptions,
  VersionInfo,
} from './types';

// ==================== CONTEXT.md 生成 ====================
export {
  generateContextUpdate,
  generateQuickContextUpdate,
  generateContextSnippet,
} from './context';

// ==================== VERSION.md 生成 ====================
export {
  generateVersionUpdate,
  generateQuickVersionUpdate,
  generateVersionComparison,
} from './version';

// ==================== CHANGELOG.md 生成 ====================
export {
  generateChangelogUpdate,
  generateQuickChangelogUpdate,
  generateChangelogEntry,
  generateFullChangelog,
} from './changelog';

// ==================== 辅助函数导出 ====================
export {
  formatChangeTypeIcon,
  formatDate,
  formatVersion,
  parseVersion,
  countFileChanges,
  formatList,
  formatFileList,
  formatStatsSummary,
  groupChangesByType,
  generateHeading,
  generateCodeBlock,
  generateTableOfContents,
  generateFooter,
  isValidVersion,
  getCurrentTimestamp,
} from './helpers';

// ==================== 主要功能 ====================

import type {
  ChangeInfo,
  AllDocumentationResult,
  ContextUpdateOptions,
  VersionUpdateOptions,
  ChangelogUpdateOptions,
} from './types';
import { generateContextUpdate } from './context';
import { generateVersionUpdate } from './version';
import { generateChangelogUpdate } from './changelog';
import { formatDate } from './helpers';

/**
 * 生成所有文档更新（一次性生成CONTEXT、VERSION、CHANGELOG）
 *
 * @param changeInfo - 变更信息
 * @param version - 版本号
 * @param options - 额外选项
 * @returns 所有文档生成结果
 *
 * @example
 * ```typescript
 * const result = generateAllDocumentation(
 *   {
 *     type: 'feat',
 *     summary: '添加工作流自动化Skills',
 *     details: [
 *       '实现Token监控',
 *       '实现保存位置检测',
 *       '实现文档生成器',
 *       '实现工作流提醒'
 *     ],
 *     files: {
 *       added: ['skills/token-monitor.ts', 'skills/save-location-detector.ts'],
 *       modified: ['skills/index.ts'],
 *       deleted: []
 *     },
 *     stats: {
 *       linesAdded: 1000,
 *       linesDeleted: 50,
 *       filesChanged: 11
 *     },
 *     date: '2026-01-29'
 *   },
 *   'v2.1'
 * );
 *
 * // 使用生成的内容
 * console.log(result.context.content);
 * console.log(result.version.content);
 * console.log(result.changelog.content);
 * ```
 */
export function generateAllDocumentation(
  changeInfo: ChangeInfo,
  version: string,
  options?: {
    contextOptions?: Partial<ContextUpdateOptions>;
    versionOptions?: Partial<VersionUpdateOptions>;
    changelogOptions?: Partial<ChangelogUpdateOptions>;
  }
): AllDocumentationResult {
  const currentDate = formatDate(undefined, 'short');

  // 生成CONTEXT.md更新
  const contextOptions: ContextUpdateOptions = {
    currentStatus: changeInfo.summary,
    recentActivity: changeInfo.details,
    lastUpdated: formatDate(),
    ...options?.contextOptions,
  };
  const context = generateContextUpdate(contextOptions);

  // 生成VERSION.md更新
  const versionOptions: VersionUpdateOptions = {
    version,
    completedFeatures: changeInfo.details,
    plannedFeatures: [],
    changes: [changeInfo],
    ...options?.versionOptions,
  };
  const versionDoc = generateVersionUpdate(versionOptions);

  // 生成CHANGELOG.md更新
  const changelogOptions: ChangelogUpdateOptions = {
    version,
    date: currentDate,
    changes: [changeInfo],
    ...options?.changelogOptions,
  };
  const changelog = generateChangelogUpdate(changelogOptions);

  // 计算统计
  const totalChanges = 1;
  const totalFiles =
    changeInfo.files.added.length +
    changeInfo.files.modified.length +
    changeInfo.files.deleted.length;
  const totalLines = changeInfo.stats.linesAdded + changeInfo.stats.linesDeleted;

  const allSuccess = context.success && versionDoc.success && changelog.success;

  return {
    context,
    version: versionDoc,
    changelog,
    summary: {
      totalChanges,
      totalFiles,
      totalLines,
      success: allSuccess,
    },
  };
}

/**
 * 从Git提交信息生成文档更新
 *
 * @param commitMessage - Git提交信息
 * @param version - 版本号
 * @returns 文档生成结果
 *
 * @example
 * ```typescript
 * const result = generateDocumentationFromCommit(
 *   'feat: 添加批量巡检功能\n\n- 支持批量上传\n- 实现批量评分',
 *   'v2.1'
 * );
 * ```
 */
export function generateDocumentationFromCommit(
  commitMessage: string,
  version: string
): AllDocumentationResult {
  // 解析commit message
  const lines = commitMessage.split('\n').filter(line => line.trim());
  const firstLine = lines[0];

  // 提取type和summary
  const match = firstLine.match(/^(\w+):\s*(.+)$/);
  const type = (match?.[1] || 'chore') as ChangeInfo['type'];
  const summary = match?.[2] || firstLine;

  // 提取details
  const details = lines.slice(1).map(line => line.replace(/^[-*]\s*/, '').trim());

  const changeInfo: ChangeInfo = {
    type,
    summary,
    details,
    files: { added: [], modified: [], deleted: [] },
    stats: { linesAdded: 0, linesDeleted: 0, filesChanged: 0 },
    date: formatDate(undefined, 'short'),
  };

  return generateAllDocumentation(changeInfo, version);
}

/**
 * 批量生成多个变更的文档
 *
 * @param changes - 变更信息列表
 * @param version - 版本号
 * @returns 文档生成结果
 */
export function generateDocumentationForMultipleChanges(
  changes: ChangeInfo[],
  version: string
): AllDocumentationResult {
  const currentDate = formatDate(undefined, 'short');

  // 合并所有变更的描述
  const allDetails = changes.flatMap(c => c.details);
  const firstChange = changes[0];

  // 生成CONTEXT.md
  const context = generateContextUpdate({
    currentStatus: firstChange.summary,
    recentActivity: allDetails,
    lastUpdated: formatDate(),
  });

  // 生成VERSION.md
  const versionDoc = generateVersionUpdate({
    version,
    completedFeatures: allDetails,
    plannedFeatures: [],
    changes,
  });

  // 生成CHANGELOG.md
  const changelog = generateChangelogUpdate({
    version,
    date: currentDate,
    changes,
  });

  // 计算统计
  const totalFiles = new Set<string>();
  let totalLinesAdded = 0;
  let totalLinesDeleted = 0;

  changes.forEach(change => {
    change.files.added.forEach(f => totalFiles.add(f));
    change.files.modified.forEach(f => totalFiles.add(f));
    change.files.deleted.forEach(f => totalFiles.add(f));
    totalLinesAdded += change.stats.linesAdded;
    totalLinesDeleted += change.stats.linesDeleted;
  });

  const allSuccess = context.success && versionDoc.success && changelog.success;

  return {
    context,
    version: versionDoc,
    changelog,
    summary: {
      totalChanges: changes.length,
      totalFiles: totalFiles.size,
      totalLines: totalLinesAdded + totalLinesDeleted,
      success: allSuccess,
    },
  };
}
