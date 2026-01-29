# Mall Operation Agent - Skills Library

## 概述

本目录包含了 Mall Operation Agent 系统的核心可复用能力模块（Skills）。这些 Skills 封装了系统的核心算法和业务逻辑，可以在不同场景下复用。

## Skills 列表

### 1. AI智能匹配引擎 (ai-matcher.ts)

**功能**：基于商户特征和问题标签，智能匹配知识库案例

**核心算法**：
- 业态匹配（权重40%）
- 问题标签匹配（权重60%）
- 症状关键词匹配（额外加分）

**主要函数**：
- `matchCases()` - 智能匹配案例
- `generateProblemTags()` - 自动生成问题标签
- `inferMerchantCategory()` - 推断商户业态

**使用示例**：
```typescript
import { matchCases, generateProblemTags } from './skills/ai-matcher';

const result = matchCases({
  merchantName: '海底捞火锅',
  merchantCategory: '餐饮-火锅',
  problemTags: ['营收低', '租金压力'],
  knowledgeBase: cases
});

console.log(result.topSuggestions); // 推荐的帮扶措施
```

---

### 2. 健康度计算器 (health-calculator.ts)

**功能**：根据多维度指标计算商户健康度评分

**五大维度**：
- 收缴健康度 (collection)
- 经营健康度 (operational)
- 现场品质 (siteQuality)
- 顾客评价 (customerReview)
- 抗风险能力 (riskResistance)

**主要函数**：
- `analyzeHealth()` - 完整健康度分析
- `calculateTotalScore()` - 计算总分
- `calculateRiskLevel()` - 判断风险等级
- `calculateImprovement()` - 计算改善幅度

**使用示例**：
```typescript
import { analyzeHealth } from './skills/health-calculator';

const analysis = analyzeHealth({
  collection: 60,
  operational: 45,
  siteQuality: 50,
  customerReview: 55,
  riskResistance: 40
});

console.log(analysis.totalScore); // 50
console.log(analysis.riskLevel); // 'high'
console.log(analysis.recommendations); // ['加强租金催收...', ...]
```

---

### 3. 风险识别器 (risk-detector.ts)

**功能**：基于商户数据自动识别风险类型和严重程度

**风险类型**：
- 租金逾期 (rent_overdue)
- 营收下滑 (low_revenue)
- 租售比过高 (high_rent_ratio)
- 顾客投诉 (customer_complaint)
- 健康度下滑 (health_declining)

**主要函数**：
- `detectRisks()` - 综合风险检测
- `batchDetectRisks()` - 批量检测多个商户
- `getRiskTypeName()` - 获取风险类型中文名
- `getSeverityName()` - 获取严重程度中文名

**使用示例**：
```typescript
import { detectRisks } from './skills/risk-detector';

const result = detectRisks(merchant);

console.log(result.risks); // 风险列表
console.log(result.highRiskCount); // 高风险数量
```

---

### 4. 任务生命周期管理器 (task-lifecycle-manager.ts)

**功能**：管理任务从创建到结案的完整流程

**状态流转**：
```
planning → executing → evaluating → (completed | escalated | exit)
```

**主要函数**：
- `canTransition()` - 验证状态转换是否合法
- `transitionStage()` - 执行状态转换
- `addLog()` / `updateLog()` / `deleteLog()` - 日志管理
- `addMeasure()` / `removeMeasure()` - 措施管理
- `evaluateTask()` - 评估任务效果
- `escalateTask()` - 升级任务
- `exitToLeasing()` - 转招商
- `completeTask()` - 结案

**使用示例**：
```typescript
import { transitionStage, addMeasure } from './skills/task-lifecycle-manager';

// 添加措施
let task = addMeasure(task, '开展联合营销活动', '张经理');

// 状态转换
task = transitionStage(task, 'executing');

// 检查是否逾期
const overdue = isOverdue(task);
```

---

### 5. 知识库管理器 (knowledge-manager.ts)

**功能**：管理案例的存储、检索、评分和沉淀

**主要函数**：
- `searchCases()` - 搜索案例
- `generateCaseFromTask()` - 从任务自动生成案例
- `rateCase()` - 案例评分
- `getPopularCases()` - 获取热门案例
- `getTopRatedCases()` - 获取高评分案例
- `findSimilarCases()` - 查找相似案例
- `exportCases()` / `importCases()` - 导入导出
- `validateCase()` - 验证案例数据完整性

**使用示例**：
```typescript
import { searchCases, generateCaseFromTask } from './skills/knowledge-manager';

// 搜索案例
const results = searchCases(allCases, {
  keyword: '火锅',
  industry: '餐饮-火锅',
  minRating: 4
});

// 从任务生成案例
const newCase = generateCaseFromTask(completedTask);
```

---

### 6. Token监控器 (token-monitor.ts)

**功能**：监控Token使用情况，生成标准化提醒

**等级标准**：
- Safe（安全）: 0-49% - 继续工作
- Warning（警告）: 50-69% - 建议保存
- Urgent（紧急）: 70-79% - 强烈建议保存
- Critical（危急）: 80-100% - 必须立即保存

**主要函数**：
- `monitorTokenUsage()` - 监控Token使用
- `calculateTokenPercentage()` - 计算使用百分比
- `getTokenLevel()` - 获取使用等级
- `generateReminderMessage()` - 生成提醒消息
- `estimateRemainingFiles()` - 估算可处理文件数

**使用示例**：
```typescript
import { monitorTokenUsage } from '@/skills/token-monitor';

const result = monitorTokenUsage(120000, 200000);

if (result.shouldRemind) {
  console.log(result.reminderMessage);
  // 🟡 Token使用警告 (60.0%) - 建议保存当前进度
}

console.log(result.level); // 'warning'
console.log(result.percentage); // 60.0
```

---

### 7. 保存位置检测器 (save-location-detector.ts)

**功能**：判断文件应该保存到项目内部还是外部文档

**判断规则**：
- **Internal（项目内部）**: 源码文件、测试文件、配置文件、项目文档
- **External（外部文档）**: 教程、博客、笔记、总结

**主要函数**：
- `detectSaveLocation()` - 检测保存位置
- `inferContentTypeFromExtension()` - 从扩展名推断类型
- `isProjectInternalPath()` - 判断是否项目路径
- `isProjectContent()` - 判断是否项目内容
- `getSuggestedPath()` - 获取建议路径

**使用示例**：
```typescript
import { detectSaveLocation } from '@/skills/save-location-detector';

// 基于路径检测
const result = detectSaveLocation({
  filePath: '/project/app/page.tsx'
});

console.log(result.location); // 'internal'
console.log(result.contentType); // 'source-code'
console.log(result.confidence); // 95

// 基于文件名和内容检测
const result2 = detectSaveLocation({
  fileName: '小红书教程.md',
  content: '# Claude Code 实战教程\n...'
});

console.log(result2.location); // 'external'
console.log(result2.suggestions); // ['建议保存到外部文档目录', ...]
```

---

### 8. 文档生成器 (documentation-generator/)

**功能**：自动生成CONTEXT.md、VERSION.md、CHANGELOG.md更新

**子模块**：
- `types.ts` - 类型定义
- `helpers.ts` - 辅助函数
- `context.ts` - CONTEXT.md生成
- `version.ts` - VERSION.md生成
- `changelog.ts` - CHANGELOG.md生成
- `index.ts` - 统一导出

**主要函数**：
- `generateAllDocumentation()` - 一键生成所有文档
- `generateContextUpdate()` - 生成CONTEXT.md更新
- `generateVersionUpdate()` - 生成VERSION.md更新
- `generateChangelogUpdate()` - 生成CHANGELOG.md更新
- `generateDocumentationFromCommit()` - 从Git提交生成

**使用示例**：
```typescript
import { generateAllDocumentation } from '@/skills/documentation-generator';

const result = generateAllDocumentation(
  {
    type: 'feat',
    summary: '添加批量巡检功能',
    details: ['支持批量上传', '实现批量评分'],
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
  'v2.1'
);

console.log(result.context.content); // CONTEXT.md内容
console.log(result.version.content); // VERSION.md内容
console.log(result.changelog.content); // CHANGELOG.md内容
```

---

### 9. 工作流提醒器 (workflow-reminder.ts)

**功能**：综合判断何时应该提醒用户保存进度

**判断维度**：
- Token使用率（超过阈值）
- 工作时长（分钟数）
- 功能完成数
- 文件修改数

**提醒等级**：
- Low（低）: 任一阈值触发 - 可以考虑保存
- Medium（中）: Token>50% OR 时间>60min OR 功能>3 - 建议保存
- High（高）: Token>70% OR 时间>90min OR 功能>5 - 强烈建议保存
- Critical（危急）: Token>80% OR 时间>120min - 必须立即保存

**主要函数**：
- `checkWorkflowReminder()` - 检查工作流提醒
- `shouldRemindUser()` - 判断是否应该提醒
- `getReminderTrigger()` - 获取触发原因
- `calculateUrgency()` - 计算紧急程度
- `getDefaultStrategy()` - 获取默认策略
- `estimateRemainingWorkTime()` - 估算剩余工作时间

**使用示例**：
```typescript
import { checkWorkflowReminder } from '@/skills/workflow-reminder';

const result = checkWorkflowReminder({
  tokenUsage: { current: 120000, max: 200000 },
  timeElapsed: 75,
  featuresCompleted: 4,
  filesModified: 12
});

if (result.shouldRemind) {
  console.log(result.message);
  /*
  🟡 提醒: 建议保存工作进度

  **触发原因**:
    - Token使用率 60.0% (阈值: 50%)
    - 工作时长 75 分钟 (阈值: 60 分钟)
    - 已完成 4 个功能 (阈值: 3)

  **操作建议**:
    1. 🟡 建议保存当前进度
    2. 可以生成CONTEXT.md记录当前状态
    3. 如果功能完整，建议提交commit
  */
}

console.log(result.urgency); // 'medium'
console.log(result.trigger); // 'multiple-factors'
```

---

## 使用指南

### 安装依赖

这些 Skills 是纯 TypeScript 模块，无需额外依赖。

### 导入方式

```typescript
// 方式1：从索引文件导入
import { matchCases, analyzeHealth } from './skills';

// 方式2：从具体文件导入
import { matchCases } from './skills/ai-matcher';
import { analyzeHealth } from './skills/health-calculator';
```

### 在项目中使用

这些 Skills 已经在以下页面中使用：

- **健康度页面** (`app/health/page.tsx`)
  - 使用 `health-calculator` 计算评分
  - 使用 `risk-detector` 识别风险

- **任务中心** (`app/tasks/page.tsx`)
  - 使用 `ai-matcher` 推荐措施
  - 使用 `task-lifecycle-manager` 管理状态
  - 使用 `knowledge-manager` 沉淀案例

- **风险预警** (`app/risk/page.tsx`)
  - 使用 `risk-detector` 批量检测风险

- **知识库** (`app/knowledge/page.tsx`)
  - 使用 `knowledge-manager` 搜索和管理案例

---

## 扩展开发

### 添加新的 Skill

1. 在 `skills/` 目录下创建新文件，如 `new-skill.ts`
2. 定义接口和函数
3. 在 `skills/index.ts` 中导出
4. 更新本文档

### 测试 Skills

建议为每个 Skill 编写单元测试：

```typescript
// skills/__tests__/ai-matcher.test.ts
import { matchCases } from '../ai-matcher';

describe('AI Matcher', () => {
  it('should match cases correctly', () => {
    const result = matchCases({
      merchantName: '测试商户',
      merchantCategory: '餐饮-火锅',
      problemTags: ['营收低'],
      knowledgeBase: mockCases
    });

    expect(result.matchedCases.length).toBeGreaterThan(0);
  });
});
```

---

## 版本历史

- **v2.1** (2026-01-29)
  - 新增工作流自动化模块（4个新Skills）
  - Token监控器 - 监控Token使用并生成提醒
  - 保存位置检测器 - 智能判断文件保存位置
  - 文档生成器 - 自动生成CONTEXT/VERSION/CHANGELOG
  - 工作流提醒器 - 综合判断何时提醒保存
  - 总计19个Skills

- **v2.0** (2026-01-28)
  - 新增巡检分析模块（2个Skills）
  - 巡检分析器 - 智能分析商户现场状况
  - 图片处理器 - 图片压缩和缩略图生成
  - 总计15个Skills

- **v1.0** (2026-01-24)
  - 初始版本
  - 包含13个核心Skills
  - 从主代码库中提取并封装

---

## 许可证

MIT License

---

## 联系方式

如有问题或建议，请联系开发团队。
