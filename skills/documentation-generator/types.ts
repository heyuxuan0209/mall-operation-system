/**
 * 文档生成器类型定义
 *
 * @version 1.0
 * @created 2026-01-29
 */

/**
 * 变更类型
 */
export type ChangeType =
  | 'feat'      // ✨ 新功能
  | 'fix'       // 🐛 Bug修复
  | 'refactor'  // 🔄 重构
  | 'docs'      // 📝 文档
  | 'style'     // 🎨 样式
  | 'perf'      // ⚡ 性能优化
  | 'test'      // ✅ 测试
  | 'chore'     // 🔧 杂项
  | 'build'     // 📦 构建
  | 'ci';       // 🤖 CI/CD

/**
 * 文件变更统计
 */
export interface FileChanges {
  added: string[];      // 新增文件
  modified: string[];   // 修改文件
  deleted: string[];    // 删除文件
}

/**
 * 代码统计
 */
export interface CodeStats {
  linesAdded: number;     // 新增行数
  linesDeleted: number;   // 删除行数
  filesChanged: number;   // 变更文件数
}

/**
 * 变更信息
 */
export interface ChangeInfo {
  type: ChangeType;           // 变更类型
  summary: string;            // 变更摘要
  details: string[];          // 详细信息
  files: FileChanges;         // 文件变更
  stats: CodeStats;           // 代码统计
  date: string;               // 日期 (YYYY-MM-DD)
  author?: string;            // 作者
  commitHash?: string;        // commit hash
  breaking?: boolean;         // 是否为破坏性变更
  issues?: string[];          // 关联issue
}

/**
 * Git历史信息
 */
export interface GitHistoryInfo {
  recentCommits: {
    hash: string;
    message: string;
    date: string;
    author: string;
  }[];
  branch: string;
  uncommittedChanges: number;
}

/**
 * CONTEXT.md 更新选项
 */
export interface ContextUpdateOptions {
  currentStatus: string;           // 当前状态描述
  recentActivity: string[];        // 最近活动列表
  gitHistory?: GitHistoryInfo;     // Git历史信息
  tokenUsage?: {                   // Token使用情况
    current: number;
    max: number;
    percentage: number;
  };
  lastUpdated?: string;            // 最后更新时间
  additionalNotes?: string[];      // 额外备注
}

/**
 * VERSION.md 更新选项
 */
export interface VersionUpdateOptions {
  version: string;                 // 版本号
  completedFeatures: string[];     // 已完成功能
  plannedFeatures: string[];       // 计划功能
  knownIssues?: string[];          // 已知问题
  changes?: ChangeInfo[];          // 变更列表
  nextSteps?: string[];            // 下一步计划
}

/**
 * CHANGELOG.md 更新选项
 */
export interface ChangelogUpdateOptions {
  version: string;                 // 版本号
  date: string;                    // 发布日期
  changes: ChangeInfo[];           // 变更列表
  highlights?: string[];           // 重点内容
  breakingChanges?: string[];      // 破坏性变更
  migration?: string[];            // 迁移指南
}

/**
 * 文档生成结果
 */
export interface DocumentationResult {
  content: string;                 // 生成的内容
  filePath: string;                // 目标文件路径
  success: boolean;                // 是否成功
  message?: string;                // 消息
  warnings?: string[];             // 警告信息
}

/**
 * 批量文档生成结果
 */
export interface AllDocumentationResult {
  context: DocumentationResult;
  version: DocumentationResult;
  changelog: DocumentationResult;
  summary: {
    totalChanges: number;
    totalFiles: number;
    totalLines: number;
    success: boolean;
  };
}

/**
 * 文档模板选项
 */
export interface TemplateOptions {
  includeEmojis?: boolean;         // 是否包含emoji图标
  includeStats?: boolean;          // 是否包含统计信息
  includeTimestamp?: boolean;      // 是否包含时间戳
  sectionSeparator?: string;       // 章节分隔符
  listStyle?: 'bullet' | 'number'; // 列表样式
}

/**
 * 版本信息
 */
export interface VersionInfo {
  major: number;
  minor: number;
  patch: number;
  prerelease?: string;
  toString(): string;
}
