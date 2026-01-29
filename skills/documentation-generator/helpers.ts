/**
 * 文档生成器辅助函数
 *
 * @version 1.0
 * @created 2026-01-29
 */

import type { ChangeType, VersionInfo } from './types';

/**
 * 变更类型图标映射
 */
const CHANGE_TYPE_ICONS: Record<ChangeType, string> = {
  feat: '✨',
  fix: '🐛',
  refactor: '🔄',
  docs: '📝',
  style: '🎨',
  perf: '⚡',
  test: '✅',
  chore: '🔧',
  build: '📦',
  ci: '🤖',
};

/**
 * 变更类型中文名称
 */
const CHANGE_TYPE_NAMES: Record<ChangeType, string> = {
  feat: '新功能',
  fix: 'Bug修复',
  refactor: '代码重构',
  docs: '文档更新',
  style: '样式调整',
  perf: '性能优化',
  test: '测试',
  chore: '杂项',
  build: '构建',
  ci: 'CI/CD',
};

/**
 * 格式化变更类型图标
 *
 * @param type - 变更类型
 * @param includeEmoji - 是否包含emoji
 * @returns 格式化的类型标识
 */
export function formatChangeTypeIcon(type: ChangeType, includeEmoji: boolean = true): string {
  if (includeEmoji) {
    return `${CHANGE_TYPE_ICONS[type]} ${CHANGE_TYPE_NAMES[type]}`;
  }
  return CHANGE_TYPE_NAMES[type];
}

/**
 * 格式化日期
 *
 * @param date - 日期字符串或Date对象
 * @param format - 格式（'full' | 'short' | 'iso'）
 * @returns 格式化的日期字符串
 */
export function formatDate(
  date: string | Date = new Date(),
  format: 'full' | 'short' | 'iso' = 'full'
): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (format === 'iso') {
    return d.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  if (format === 'short') {
    return `${year}-${month}-${day}`; // YYYY-MM-DD
  }

  // full format
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`; // YYYY-MM-DD HH:mm
}

/**
 * 解析版本号
 *
 * @param version - 版本字符串 (e.g., "v2.1", "2.1.0", "2.1.0-dev")
 * @returns 版本信息对象
 */
export function parseVersion(version: string): VersionInfo {
  // 移除 'v' 前缀
  const cleanVersion = version.replace(/^v/, '');

  // 分离版本号和预发布标识
  const [versionPart, prerelease] = cleanVersion.split('-');

  // 解析版本号部分
  const parts = versionPart.split('.').map(Number);
  const [major = 0, minor = 0, patch = 0] = parts;

  return {
    major,
    minor,
    patch,
    prerelease,
    toString() {
      let str = `${major}.${minor}.${patch}`;
      if (prerelease) {
        str += `-${prerelease}`;
      }
      return str;
    },
  };
}

/**
 * 格式化版本号
 *
 * @param version - 版本字符串
 * @param includeV - 是否包含'v'前缀
 * @returns 格式化的版本号
 */
export function formatVersion(version: string, includeV: boolean = true): string {
  const versionInfo = parseVersion(version);
  const versionStr = versionInfo.toString();
  return includeV ? `v${versionStr}` : versionStr;
}

/**
 * 计算文件变更总数
 *
 * @param files - 文件变更对象
 * @returns 总变更文件数
 */
export function countFileChanges(files: { added: string[]; modified: string[]; deleted: string[] }): number {
  return files.added.length + files.modified.length + files.deleted.length;
}

/**
 * 生成分隔线
 *
 * @param char - 分隔字符
 * @param length - 长度
 * @returns 分隔线字符串
 */
export function generateSeparator(char: string = '-', length: number = 80): string {
  return char.repeat(length);
}

/**
 * 缩进文本
 *
 * @param text - 文本内容
 * @param spaces - 缩进空格数
 * @returns 缩进后的文本
 */
export function indentText(text: string, spaces: number = 2): string {
  const indent = ' '.repeat(spaces);
  return text.split('\n').map(line => indent + line).join('\n');
}

/**
 * 格式化列表项
 *
 * @param items - 列表项数组
 * @param style - 列表样式（'bullet' | 'number'）
 * @param indent - 缩进级别
 * @returns 格式化的列表字符串
 */
export function formatList(
  items: string[],
  style: 'bullet' | 'number' = 'bullet',
  indent: number = 0
): string {
  const indentStr = ' '.repeat(indent * 2);

  if (style === 'number') {
    return items.map((item, index) => `${indentStr}${index + 1}. ${item}`).join('\n');
  }

  return items.map(item => `${indentStr}- ${item}`).join('\n');
}

/**
 * 截断文本
 *
 * @param text - 文本内容
 * @param maxLength - 最大长度
 * @param ellipsis - 省略符号
 * @returns 截断后的文本
 */
export function truncateText(text: string, maxLength: number, ellipsis: string = '...'): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength - ellipsis.length) + ellipsis;
}

/**
 * 生成Markdown标题
 *
 * @param text - 标题文本
 * @param level - 标题级别 (1-6)
 * @returns Markdown标题字符串
 */
export function generateHeading(text: string, level: number = 2): string {
  const hashes = '#'.repeat(Math.max(1, Math.min(6, level)));
  return `${hashes} ${text}`;
}

/**
 * 生成Markdown代码块
 *
 * @param code - 代码内容
 * @param language - 语言标识
 * @returns Markdown代码块字符串
 */
export function generateCodeBlock(code: string, language: string = ''): string {
  return `\`\`\`${language}\n${code}\n\`\`\``;
}

/**
 * 转义Markdown特殊字符
 *
 * @param text - 文本内容
 * @returns 转义后的文本
 */
export function escapeMarkdown(text: string): string {
  return text.replace(/([*_`[\]()#+\-.!])/g, '\\$1');
}

/**
 * 生成文件路径列表
 *
 * @param files - 文件数组
 * @param withCode - 是否使用代码格式
 * @returns 格式化的文件列表
 */
export function formatFileList(files: string[], withCode: boolean = true): string {
  if (withCode) {
    return files.map(file => `  - \`${file}\``).join('\n');
  }
  return files.map(file => `  - ${file}`).join('\n');
}

/**
 * 计算变更统计摘要
 *
 * @param stats - 代码统计对象
 * @returns 统计摘要字符串
 */
export function formatStatsSummary(stats: {
  linesAdded: number;
  linesDeleted: number;
  filesChanged?: number;
}): string {
  const parts: string[] = [];

  if (stats.filesChanged !== undefined) {
    parts.push(`${stats.filesChanged} 个文件`);
  }

  parts.push(`+${stats.linesAdded}`);
  parts.push(`-${stats.linesDeleted}`);

  return parts.join(', ');
}

/**
 * 按变更类型分组
 *
 * @param changes - 变更信息数组
 * @returns 按类型分组的变更对象
 */
export function groupChangesByType<T extends { type: ChangeType }>(
  changes: T[]
): Record<ChangeType, T[]> {
  const grouped = {} as Record<ChangeType, T[]>;

  changes.forEach(change => {
    if (!grouped[change.type]) {
      grouped[change.type] = [];
    }
    grouped[change.type].push(change);
  });

  return grouped;
}

/**
 * 生成目录（TOC）
 *
 * @param sections - 章节名称数组
 * @returns 目录字符串
 */
export function generateTableOfContents(sections: string[]): string {
  return sections
    .map(section => {
      const anchor = section.toLowerCase().replace(/\s+/g, '-');
      return `- [${section}](#${anchor})`;
    })
    .join('\n');
}

/**
 * 验证版本号格式
 *
 * @param version - 版本字符串
 * @returns 是否为有效的版本号
 */
export function isValidVersion(version: string): boolean {
  const versionRegex = /^v?\d+\.\d+(\.\d+)?(-[a-z0-9]+)?$/i;
  return versionRegex.test(version);
}

/**
 * 获取当前时间戳
 *
 * @returns ISO格式的时间戳字符串
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

/**
 * 生成文档页脚
 *
 * @param options - 页脚选项
 * @returns 页脚字符串
 */
export function generateFooter(options: {
  lastUpdated?: string;
  version?: string;
  author?: string;
}): string {
  const parts: string[] = [];

  if (options.lastUpdated) {
    parts.push(`**最后更新**: ${options.lastUpdated}`);
  }

  if (options.version) {
    parts.push(`**版本**: ${options.version}`);
  }

  if (options.author) {
    parts.push(`**作者**: ${options.author}`);
  }

  return parts.length > 0 ? `\n---\n\n${parts.join('  \n')}\n` : '';
}
