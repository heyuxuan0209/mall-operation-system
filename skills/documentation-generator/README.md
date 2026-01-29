# Documentation Generator

自动生成项目文档（CONTEXT.md、VERSION.md、CHANGELOG.md）的工具集。

## 功能特性

- **CONTEXT.md 生成**: 生成项目当前状态和最近活动
- **VERSION.md 生成**: 生成版本信息和功能列表
- **CHANGELOG.md 生成**: 生成按类型分组的变更日志
- **一键生成**: 支持同时生成所有三个文档
- **Git集成**: 从Git提交信息自动生成文档

## 使用方法

### 1. 生成CONTEXT.md更新

```typescript
import { generateContextUpdate } from '@/skills/documentation-generator';

const result = generateContextUpdate({
  currentStatus: '正在优化巡检模块',
  recentActivity: [
    '完成批量巡检页面开发',
    '优化图片上传组件',
    '添加快速签到功能'
  ],
  tokenUsage: {
    current: 120000,
    max: 200000,
    percentage: 60
  },
  gitHistory: {
    branch: 'main',
    uncommittedChanges: 3,
    recentCommits: [
      {
        hash: 'abc1234',
        message: 'feat: 添加批量巡检',
        date: '2026-01-29',
        author: 'Claude'
      }
    ]
  }
});

console.log(result.content);
```

### 2. 生成VERSION.md更新

```typescript
import { generateVersionUpdate } from '@/skills/documentation-generator';

const result = generateVersionUpdate({
  version: 'v2.1',
  completedFeatures: [
    '批量巡检功能',
    '图片上传优化',
    '快速签到'
  ],
  plannedFeatures: [
    'AI智能分析',
    '数据导出功能'
  ],
  knownIssues: [
    '图片压缩在某些设备上较慢'
  ]
});

console.log(result.content);
```

### 3. 生成CHANGELOG.md更新

```typescript
import { generateChangelogUpdate } from '@/skills/documentation-generator';

const result = generateChangelogUpdate({
  version: 'v2.1',
  date: '2026-01-29',
  changes: [
    {
      type: 'feat',
      summary: '添加批量巡检功能',
      details: [
        '支持批量上传图片',
        '实现批量评分',
        '添加批量提交'
      ],
      files: {
        added: ['app/inspection/batch/page.tsx'],
        modified: ['components/inspection/ImageUploader.tsx'],
        deleted: []
      },
      stats: {
        linesAdded: 300,
        linesDeleted: 20,
        filesChanged: 2
      },
      date: '2026-01-29'
    },
    {
      type: 'fix',
      summary: '修复图片上传卡顿问题',
      details: ['优化图片压缩算法'],
      files: {
        added: [],
        modified: ['components/inspection/ImageUploader.tsx'],
        deleted: []
      },
      stats: {
        linesAdded: 50,
        linesDeleted: 30,
        filesChanged: 1
      },
      date: '2026-01-29'
    }
  ],
  highlights: [
    '批量巡检大幅提升工作效率',
    '图片上传性能优化50%'
  ]
});

console.log(result.content);
```

### 4. 一键生成所有文档

```typescript
import { generateAllDocumentation } from '@/skills/documentation-generator';

const result = generateAllDocumentation(
  {
    type: 'feat',
    summary: '添加工作流自动化Skills',
    details: [
      '实现Token监控',
      '实现保存位置检测',
      '实现文档生成器',
      '实现工作流提醒'
    ],
    files: {
      added: [
        'skills/token-monitor.ts',
        'skills/save-location-detector.ts',
        'skills/documentation-generator/'
      ],
      modified: ['skills/index.ts'],
      deleted: []
    },
    stats: {
      linesAdded: 1000,
      linesDeleted: 50,
      filesChanged: 11
    },
    date: '2026-01-29'
  },
  'v2.1'
);

// 使用生成的内容
console.log('=== CONTEXT.md ===');
console.log(result.context.content);

console.log('\n=== VERSION.md ===');
console.log(result.version.content);

console.log('\n=== CHANGELOG.md ===');
console.log(result.changelog.content);

// 统计信息
console.log('\n=== 统计 ===');
console.log(`总变更: ${result.summary.totalChanges}`);
console.log(`总文件: ${result.summary.totalFiles}`);
console.log(`总行数: ${result.summary.totalLines}`);
```

### 5. 从Git提交生成文档

```typescript
import { generateDocumentationFromCommit } from '@/skills/documentation-generator';

const commitMessage = `feat: 添加批量巡检功能

- 支持批量上传图片
- 实现批量评分
- 添加批量提交`;

const result = generateDocumentationFromCommit(commitMessage, 'v2.1');

console.log(result.context.content);
console.log(result.version.content);
console.log(result.changelog.content);
```

## 变更类型

支持的变更类型及对应图标：

| 类型 | 图标 | 说明 |
|------|------|------|
| `feat` | ✨ | 新功能 |
| `fix` | 🐛 | Bug修复 |
| `refactor` | 🔄 | 代码重构 |
| `docs` | 📝 | 文档更新 |
| `style` | 🎨 | 样式调整 |
| `perf` | ⚡ | 性能优化 |
| `test` | ✅ | 测试 |
| `chore` | 🔧 | 杂项 |
| `build` | 📦 | 构建 |
| `ci` | 🤖 | CI/CD |

## API参考

### 类型定义

#### `ChangeInfo`
```typescript
interface ChangeInfo {
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
```

#### `DocumentationResult`
```typescript
interface DocumentationResult {
  content: string;     // 生成的内容
  filePath: string;    // 目标文件路径
  success: boolean;    // 是否成功
  message?: string;    // 消息
  warnings?: string[]; // 警告信息
}
```

### 主要函数

#### `generateContextUpdate(options)`
生成CONTEXT.md更新内容。

#### `generateVersionUpdate(options)`
生成VERSION.md更新内容。

#### `generateChangelogUpdate(options)`
生成CHANGELOG.md更新内容。

#### `generateAllDocumentation(changeInfo, version, options?)`
一次性生成所有三个文档。

#### `generateDocumentationFromCommit(commitMessage, version)`
从Git提交信息生成文档。

### 辅助函数

#### `formatChangeTypeIcon(type, includeEmoji?)`
格式化变更类型图标。

#### `formatDate(date?, format?)`
格式化日期。

#### `formatVersion(version, includeV?)`
格式化版本号。

#### `parseVersion(version)`
解析版本号。

## 完整示例

```typescript
import {
  generateAllDocumentation,
  type ChangeInfo,
} from '@/skills/documentation-generator';

// 准备变更信息
const change: ChangeInfo = {
  type: 'feat',
  summary: '添加工作流自动化Skills',
  details: [
    '实现Token监控 - 跟踪token使用率并生成提醒',
    '实现保存位置检测 - 智能判断文件保存位置',
    '实现文档生成器 - 自动生成CONTEXT/VERSION/CHANGELOG',
    '实现工作流提醒 - 综合判断何时提醒保存'
  ],
  files: {
    added: [
      'skills/token-monitor.ts',
      'skills/save-location-detector.ts',
      'skills/documentation-generator/index.ts',
      'skills/documentation-generator/types.ts',
      'skills/documentation-generator/helpers.ts',
      'skills/documentation-generator/context.ts',
      'skills/documentation-generator/version.ts',
      'skills/documentation-generator/changelog.ts',
      'skills/documentation-generator/README.md',
      'skills/workflow-reminder.ts'
    ],
    modified: [
      'skills/index.ts',
      'skills/README.md'
    ],
    deleted: []
  },
  stats: {
    linesAdded: 1000,
    linesDeleted: 50,
    filesChanged: 12
  },
  date: '2026-01-29',
  commitHash: 'abc1234567',
};

// 生成所有文档
const result = generateAllDocumentation(change, 'v2.1', {
  contextOptions: {
    tokenUsage: {
      current: 43000,
      max: 200000,
      percentage: 21.5
    }
  },
  versionOptions: {
    plannedFeatures: [
      'CLI工具集成',
      'VS Code扩展',
      'Git hooks自动化'
    ],
    nextSteps: [
      '完成单元测试',
      '更新文档',
      '发布新版本'
    ]
  },
  changelogOptions: {
    highlights: [
      '工作流自动化大幅提升开发效率',
      '文档生成器解决上下文溢出问题',
      '智能提醒避免工作丢失'
    ]
  }
});

// 检查结果
if (result.summary.success) {
  console.log('✅ 所有文档生成成功');
  console.log(`📊 统计: ${result.summary.totalChanges}个变更, ${result.summary.totalFiles}个文件, ${result.summary.totalLines}行代码`);

  // 输出文档内容
  console.log('\n📄 CONTEXT.md:');
  console.log(result.context.content);

  console.log('\n📄 VERSION.md:');
  console.log(result.version.content);

  console.log('\n📄 CHANGELOG.md:');
  console.log(result.changelog.content);
} else {
  console.error('❌ 文档生成失败');
}
```

## 目录结构

```
documentation-generator/
├── index.ts           # 主导出文件
├── types.ts           # 类型定义
├── helpers.ts         # 辅助函数
├── context.ts         # CONTEXT.md生成
├── version.ts         # VERSION.md生成
├── changelog.ts       # CHANGELOG.md生成
└── README.md          # 本文档
```

## 设计原则

1. **纯函数**: 所有函数都是纯函数，无副作用
2. **模块化**: 每个文档类型独立模块，易于维护
3. **类型安全**: 完整的TypeScript类型定义
4. **灵活性**: 支持自定义选项和模板
5. **可扩展**: 易于添加新的文档类型

## 注意事项

- 日期格式统一使用 `YYYY-MM-DD`
- 版本号支持 `v2.1` 或 `2.1.0` 格式
- 变更类型必须是预定义的类型之一
- 文件路径使用相对路径
- Markdown格式遵循CommonMark规范

## 未来增强

- [ ] 支持自定义模板
- [ ] 支持国际化（i18n）
- [ ] 集成Git命令自动提取变更
- [ ] 支持导出为HTML/PDF
- [ ] 添加文档验证功能

---

**版本**: 1.0
**创建日期**: 2026-01-29
**作者**: Claude Sonnet 4.5
