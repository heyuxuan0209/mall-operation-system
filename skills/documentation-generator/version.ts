/**
 * VERSION.md 生成器
 *
 * 功能：生成版本信息和功能列表
 *
 * @version 1.0
 * @created 2026-01-29
 */

import type { VersionUpdateOptions, DocumentationResult } from './types';
import {
  formatVersion,
  formatList,
  generateHeading,
  generateFooter,
  formatChangeTypeIcon,
  formatDate,
} from './helpers';

/**
 * 生成功能列表
 *
 * @param features - 功能列表
 * @param title - 列表标题
 * @returns 格式化的功能列表
 */
function generateFeatureList(features: string[], title: string): string {
  if (features.length === 0) {
    return '';
  }

  const sections: string[] = [];
  sections.push(generateHeading(title, 3));
  sections.push('');
  sections.push(formatList(features));
  sections.push('');

  return sections.join('\n');
}

/**
 * 生成变更摘要
 *
 * @param changes - 变更信息列表
 * @returns 变更摘要字符串
 */
function generateChangesSummary(
  changes: NonNullable<VersionUpdateOptions['changes']>
): string {
  if (changes.length === 0) {
    return '';
  }

  const sections: string[] = [];
  sections.push(generateHeading('主要变更', 3));
  sections.push('');

  // 按类型分组
  const groupedByType: Record<string, typeof changes> = {};
  changes.forEach(change => {
    if (!groupedByType[change.type]) {
      groupedByType[change.type] = [];
    }
    groupedByType[change.type].push(change);
  });

  // 按优先级排序类型
  const typeOrder = ['feat', 'fix', 'refactor', 'perf', 'docs', 'style', 'test', 'chore'];
  const sortedTypes = Object.keys(groupedByType).sort((a, b) => {
    const aIndex = typeOrder.indexOf(a);
    const bIndex = typeOrder.indexOf(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  // 生成每个类型的变更列表
  sortedTypes.forEach(type => {
    const typeChanges = groupedByType[type];
    sections.push(`**${formatChangeTypeIcon(type as any)}**`);
    sections.push('');
    typeChanges.forEach(change => {
      sections.push(`- ${change.summary}`);
      if (change.details && change.details.length > 0) {
        change.details.forEach(detail => {
          sections.push(`  - ${detail}`);
        });
      }
    });
    sections.push('');
  });

  return sections.join('\n');
}

/**
 * 生成VERSION.md更新内容
 *
 * @param options - 版本更新选项
 * @returns 文档生成结果
 *
 * @example
 * ```typescript
 * const result = generateVersionUpdate({
 *   version: 'v2.1',
 *   completedFeatures: [
 *     '批量巡检功能',
 *     '图片上传优化',
 *     '快速签到'
 *   ],
 *   plannedFeatures: [
 *     'AI智能分析',
 *     '数据导出功能'
 *   ],
 *   knownIssues: [
 *     '图片压缩在某些设备上较慢'
 *   ]
 * });
 * ```
 */
export function generateVersionUpdate(options: VersionUpdateOptions): DocumentationResult {
  const {
    version,
    completedFeatures,
    plannedFeatures,
    knownIssues,
    changes,
    nextSteps,
  } = options;

  try {
    const sections: string[] = [];

    // 标题
    const formattedVersion = formatVersion(version);
    sections.push(generateHeading(`版本 ${formattedVersion}`, 1));
    sections.push('');

    // 版本信息
    sections.push(`> 版本号: ${formattedVersion}`);
    sections.push(`> 更新日期: ${formatDate(undefined, 'short')}`);
    sections.push('');

    // 概述
    sections.push(generateHeading('版本概述', 2));
    sections.push('');
    const featureCount = completedFeatures.length;
    const issueCount = knownIssues?.length || 0;
    sections.push(
      `本版本完成了 ${featureCount} 个功能，${issueCount > 0 ? `已知 ${issueCount} 个问题` : '暂无已知问题'}。`
    );
    sections.push('');

    // 已完成功能
    if (completedFeatures.length > 0) {
      sections.push(generateHeading('已完成功能', 2));
      sections.push('');
      sections.push(formatList(completedFeatures));
      sections.push('');
    }

    // 主要变更（如果提供）
    if (changes && changes.length > 0) {
      sections.push(generateHeading('主要变更', 2));
      sections.push('');
      sections.push(generateChangesSummary(changes));
    }

    // 计划功能
    if (plannedFeatures.length > 0) {
      sections.push(generateHeading('计划功能', 2));
      sections.push('');
      sections.push(formatList(plannedFeatures));
      sections.push('');
    }

    // 下一步计划
    if (nextSteps && nextSteps.length > 0) {
      sections.push(generateHeading('下一步计划', 2));
      sections.push('');
      sections.push(formatList(nextSteps));
      sections.push('');
    }

    // 已知问题
    if (knownIssues && knownIssues.length > 0) {
      sections.push(generateHeading('已知问题', 2));
      sections.push('');
      sections.push(formatList(knownIssues));
      sections.push('');
    }

    // 页脚
    sections.push(
      generateFooter({
        version: formattedVersion,
        lastUpdated: formatDate(undefined, 'short'),
      })
    );

    const content = sections.join('\n');

    return {
      content,
      filePath: 'VERSION.md',
      success: true,
      message: 'VERSION.md 更新内容生成成功',
    };
  } catch (error) {
    return {
      content: '',
      filePath: 'VERSION.md',
      success: false,
      message: `生成VERSION.md失败: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * 生成简化的VERSION更新（快速版本）
 *
 * @param version - 版本号
 * @param features - 已完成功能列表
 * @returns 文档生成结果
 */
export function generateQuickVersionUpdate(
  version: string,
  features: string[]
): DocumentationResult {
  return generateVersionUpdate({
    version,
    completedFeatures: features,
    plannedFeatures: [],
  });
}

/**
 * 生成版本对比
 *
 * @param oldVersion - 旧版本选项
 * @param newVersion - 新版本选项
 * @returns 版本对比字符串
 */
export function generateVersionComparison(
  oldVersion: VersionUpdateOptions,
  newVersion: VersionUpdateOptions
): string {
  const sections: string[] = [];

  sections.push(
    generateHeading(
      `版本对比: ${formatVersion(oldVersion.version)} → ${formatVersion(newVersion.version)}`,
      2
    )
  );
  sections.push('');

  // 新增功能
  const newFeatures = newVersion.completedFeatures.filter(
    f => !oldVersion.completedFeatures.includes(f)
  );
  if (newFeatures.length > 0) {
    sections.push(generateHeading('新增功能', 3));
    sections.push('');
    sections.push(formatList(newFeatures));
    sections.push('');
  }

  // 功能变化统计
  sections.push(generateHeading('统计', 3));
  sections.push('');
  sections.push(
    `- 旧版本功能数: ${oldVersion.completedFeatures.length}`
  );
  sections.push(
    `- 新版本功能数: ${newVersion.completedFeatures.length}`
  );
  sections.push(
    `- 净增加: ${newVersion.completedFeatures.length - oldVersion.completedFeatures.length} 个功能`
  );
  sections.push('');

  return sections.join('\n');
}
