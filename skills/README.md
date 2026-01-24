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

- **v1.0** (2026-01-24)
  - 初始版本
  - 包含5个核心 Skills
  - 从主代码库中提取并封装

---

## 许可证

MIT License

---

## 联系方式

如有问题或建议，请联系开发团队。
