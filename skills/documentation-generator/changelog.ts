/**
 * CHANGELOG.md 生成器
 *
 * 功能：生成变更日志
 *
 * @version 1.0
 * @created 2026-01-29
 */

import type { ChangelogUpdateOptions, DocumentationResult, ChangeInfo, ChangeType } from './types';
import {
  formatVersion,
  formatList,
  generateHeading,
  formatChangeTypeIcon,
  formatFileList,
  formatStatsSummary,
  groupChangesByType,
} from './helpers';

/**
 * 生成单个变更条目
 *
 * @param change - 变更信息
 * @param includeDetails - 是否包含详细信息
 * @returns 格式化的变更条目
 */
function generateChangeEntry(change: ChangeInfo, includeDetails: boolean = true): string {
  const parts: string[] = [];

  // 主要摘要
  let summary = `- ${change.summary}`;

  // 添加commit hash（如果有）
  if (change.commitHash) {
    const shortHash = change.commitHash.substring(0, 7);
    summary += ` (\`${shortHash}\`)`;
  }

  // 破坏性变更标记
  if (change.breaking) {
    summary += ' **[BREAKING]**';
  }

  parts.push(summary);

  // 详细信息
  if (includeDetails && change.details && change.details.length > 0) {
    change.details.forEach(detail => {
      parts.push(`  - ${detail}`);
    });
  }

  // 关联issue
  if (change.issues && change.issues.length > 0) {
    const issueLinks = change.issues.map(issue => `#${issue}`).join(', ');
    parts.push(`  - 相关issue: ${issueLinks}`);
  }

  return parts.join('\n');
}

/**
 * 生成按类型分组的变更列表
 *
 * @param changes - 变更信息列表
 * @param includeDetails - 是否包含详细信息
 * @returns 格式化的变更列表
 */
function generateChangesByType(changes: ChangeInfo[], includeDetails: boolean = true): string {
  const grouped = groupChangesByType(changes);
  const sections: string[] = [];

  // 按优先级排序类型
  const typeOrder: ChangeType[] = [
    'feat',
    'fix',
    'refactor',
    'perf',
    'docs',
    'style',
    'test',
    'build',
    'ci',
    'chore',
  ];

  typeOrder.forEach(type => {
    const typeChanges = grouped[type];
    if (typeChanges && typeChanges.length > 0) {
      sections.push(generateHeading(formatChangeTypeIcon(type), 3));
      sections.push('');
      typeChanges.forEach(change => {
        sections.push(generateChangeEntry(change, includeDetails));
      });
      sections.push('');
    }
  });

  return sections.join('\n');
}

/**
 * 生成破坏性变更列表
 *
 * @param breakingChanges - 破坏性变更描述列表
 * @returns 格式化的破坏性变更列表
 */
function generateBreakingChanges(breakingChanges: string[]): string {
  if (breakingChanges.length === 0) {
    return '';
  }

  const sections: string[] = [];
  sections.push(generateHeading('⚠️ 破坏性变更', 3));
  sections.push('');
  sections.push(formatList(breakingChanges));
  sections.push('');

  return sections.join('\n');
}

/**
 * 生成迁移指南
 *
 * @param migration - 迁移步骤列表
 * @returns 格式化的迁移指南
 */
function generateMigrationGuide(migration: string[]): string {
  if (migration.length === 0) {
    return '';
  }

  const sections: string[] = [];
  sections.push(generateHeading('📦 迁移指南', 3));
  sections.push('');
  sections.push(formatList(migration, 'number'));
  sections.push('');

  return sections.join('\n');
}

/**
 * 生成变更统计
 *
 * @param changes - 变更信息列表
 * @returns 统计摘要字符串
 */
function generateChangeStatistics(changes: ChangeInfo[]): string {
  const totalFiles = new Set<string>();
  let totalLinesAdded = 0;
  let totalLinesDeleted = 0;

  changes.forEach(change => {
    // 统计文件
    change.files.added.forEach(f => totalFiles.add(f));
    change.files.modified.forEach(f => totalFiles.add(f));
    change.files.deleted.forEach(f => totalFiles.add(f));

    // 统计行数
    totalLinesAdded += change.stats.linesAdded;
    totalLinesDeleted += change.stats.linesDeleted;
  });

  const sections: string[] = [];
  sections.push(generateHeading('统计', 3));
  sections.push('');
  sections.push(`- 变更数量: ${changes.length}`);
  sections.push(`- 影响文件: ${totalFiles.size} 个`);
  sections.push(`- 代码变更: +${totalLinesAdded} -${totalLinesDeleted} 行`);
  sections.push('');

  return sections.join('\n');
}

/**
 * 生成重点内容
 *
 * @param highlights - 重点内容列表
 * @returns 格式化的重点内容
 */
function generateHighlights(highlights: string[]): string {
  if (highlights.length === 0) {
    return '';
  }

  const sections: string[] = [];
  sections.push(generateHeading('✨ 本版本亮点', 3));
  sections.push('');
  sections.push(formatList(highlights));
  sections.push('');

  return sections.join('\n');
}

/**
 * 生成CHANGELOG.md更新内容
 *
 * @param options - 变更日志更新选项
 * @returns 文档生成结果
 *
 * @example
 * ```typescript
 * const result = generateChangelogUpdate({
 *   version: 'v2.1',
 *   date: '2026-01-29',
 *   changes: [
 *     {
 *       type: 'feat',
 *       summary: '添加批量巡检功能',
 *       details: ['支持批量上传图片', '实现批量评分'],
 *       files: { added: ['app/inspection/batch/page.tsx'], modified: [], deleted: [] },
 *       stats: { linesAdded: 300, linesDeleted: 0, filesChanged: 1 },
 *       date: '2026-01-29'
 *     }
 *   ],
 *   highlights: ['批量巡检大幅提升效率']
 * });
 * ```
 */
export function generateChangelogUpdate(options: ChangelogUpdateOptions): DocumentationResult {
  const {
    version,
    date,
    changes,
    highlights,
    breakingChanges,
    migration,
  } = options;

  try {
    const sections: string[] = [];

    // 版本标题
    const formattedVersion = formatVersion(version);
    sections.push(generateHeading(`${formattedVersion} (${date})`, 2));
    sections.push('');

    // 亮点
    if (highlights && highlights.length > 0) {
      sections.push(generateHighlights(highlights));
    }

    // 破坏性变更警告（置顶）
    if (breakingChanges && breakingChanges.length > 0) {
      sections.push(generateBreakingChanges(breakingChanges));
    }

    // 变更列表（按类型分组）
    if (changes.length > 0) {
      sections.push(generateChangesByType(changes));
    }

    // 统计信息
    sections.push(generateChangeStatistics(changes));

    // 迁移指南
    if (migration && migration.length > 0) {
      sections.push(generateMigrationGuide(migration));
    }

    const content = sections.join('\n');

    return {
      content,
      filePath: 'CHANGELOG.md',
      success: true,
      message: 'CHANGELOG.md 更新内容生成成功',
    };
  } catch (error) {
    return {
      content: '',
      filePath: 'CHANGELOG.md',
      success: false,
      message: `生成CHANGELOG.md失败: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * 生成简化的CHANGELOG更新（快速版本）
 *
 * @param version - 版本号
 * @param date - 日期
 * @param changes - 变更信息列表
 * @returns 文档生成结果
 */
export function generateQuickChangelogUpdate(
  version: string,
  date: string,
  changes: ChangeInfo[]
): DocumentationResult {
  return generateChangelogUpdate({
    version,
    date,
    changes,
  });
}

/**
 * 生成CHANGELOG条目（可追加到现有文档）
 *
 * @param options - 变更日志更新选项
 * @returns Markdown内容字符串
 */
export function generateChangelogEntry(options: ChangelogUpdateOptions): string {
  const result = generateChangelogUpdate(options);
  return result.content;
}

/**
 * 合并多个版本的CHANGELOG
 *
 * @param versions - 版本选项列表（按时间倒序）
 * @returns 完整的CHANGELOG内容
 */
export function generateFullChangelog(versions: ChangelogUpdateOptions[]): string {
  const sections: string[] = [];

  // 标题
  sections.push(generateHeading('变更日志', 1));
  sections.push('');
  sections.push('所有重要变更都将记录在此文件中。');
  sections.push('');

  // 格式说明
  sections.push('格式基于 [Keep a Changelog](https://keepachangelog.com/)。');
  sections.push('');

  // 分隔线
  sections.push('---');
  sections.push('');

  // 各版本内容
  versions.forEach(versionOptions => {
    const versionContent = generateChangelogEntry(versionOptions);
    sections.push(versionContent);
    sections.push('---');
    sections.push('');
  });

  return sections.join('\n');
}
