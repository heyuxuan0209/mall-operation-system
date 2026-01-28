# Inspection Analyzer

## 功能概述

巡检分析器是一个纯业务逻辑技能模块，为现场巡店功能提供智能分析能力。它能够根据商户健康度数据生成个性化的巡检建议，并从巡检结果中提取关键信息和反馈亮点。

## 核心功能

- **商户画像生成**: 基于健康度多维数据自动生成预警标签和最薄弱维度分析
- **核心观察点**: 根据商户弱项指标智能生成针对性的现场观察引导
- **智能检查清单**: 根据时间自动匹配开店/闭店/常规检查标准
- **问题提取**: 从照片附件中提取问题和关注点
- **亮点生成**: 综合照片、评分和分数变化生成改进亮点和关注建议

## 使用场景

1. **巡检前准备**: 生成商户画像和核心观察点，指导现场巡检重点
2. **现场巡检**: 提供时间智能的检查清单，确保标准化操作
3. **巡检后反馈**: 提取问题、生成亮点，形成结构化的反馈报告

## API文档

### 1. generateMerchantInsights()

生成商户洞察（预警、最薄弱维度、核心观察点）

**参数**:
- `merchant` (Merchant): 商户数据对象

**返回值**: `MerchantInsights`
```typescript
{
  alerts: string[];           // 预警标签列表
  weakestDimension: string;   // 最薄弱维度名称
  focusPoints: string[];      // 核心观察点列表
}
```

**示例**:
```typescript
import { generateMerchantInsights } from '@/skills/inspection-analyzer';

const insights = generateMerchantInsights(merchant);
console.log(insights.alerts);          // ['租售比过高(28.5%)', '现场品质较差(45分)']
console.log(insights.weakestDimension); // '现场品质'
console.log(insights.focusPoints);     // ['检查店面卫生和环境整洁度', ...]
```

---

### 2. generateFocusPoints()

生成核心观察点（独立函数版本）

**参数**:
- `merchant` (Merchant): 商户数据对象

**返回值**: `string[]` - 核心观察点列表

**示例**:
```typescript
import { generateFocusPoints } from '@/skills/inspection-analyzer';

const focusPoints = generateFocusPoints(merchant);
// ['重点观察货品完备性与陈列', '核实是否存在断货或库存积压', ...]
```

---

### 3. generateChecklist()

生成智能检查清单

**参数**:
- `timeOfDay` (Date, 可选): 检查时间，默认为当前时间

**返回值**: `ChecklistResult`
```typescript
{
  type: 'opening' | 'closing' | 'routine';  // 检查类型
  items: ChecklistItem[];                   // 检查项列表
}
```

**时间规则**:
- 9:50之前 → 开店检查（6项）
- 21:00之后 → 闭店检查（6项）
- 其他时间 → 常规巡检（8项）

**示例**:
```typescript
import { generateChecklist } from '@/skills/inspection-analyzer';

// 使用当前时间
const checklist1 = generateChecklist();

// 指定时间（早上9点 → 开店检查）
const checklist2 = generateChecklist(new Date('2026-01-28T09:00:00'));
console.log(checklist2.type);  // 'opening'
console.log(checklist2.items); // [{id: 'open-1', label: '门吸是否打开', checked: false}, ...]
```

---

### 4. extractIssuesFromPhotos()

从照片中提取问题

**参数**:
- `photos` (PhotoAttachment[]): 照片附件列表

**返回值**: `string[]` - 问题描述列表

**逻辑**:
- 仅提取 `issueLevel` 为 `'critical'` 或 `'warning'` 的照片
- 自动组合类别、标签和描述生成问题描述

**示例**:
```typescript
import { extractIssuesFromPhotos } from '@/skills/inspection-analyzer';

const issues = extractIssuesFromPhotos(photos);
// ['环境问题(卫生脏乱): 地面有垃圾未清理', '人员问题(着装不规范)']
```

---

### 5. generateHighlights()

生成改进亮点和关注点

**参数**:
- `photos` (PhotoAttachment[]): 照片附件列表
- `rating` (QuickRating | null): 快速评分数据
- `oldScore` (number): 旧的健康度分数
- `newScore` (number): 新的健康度分数

**返回值**: `InspectionHighlights`
```typescript
{
  improvements: string[];  // 改进亮点（最多5项）
  concerns: string[];      // 关注点（最多5项）
}
```

**生成逻辑**:
1. 从照片中提取亮点和问题
2. 从评分中生成维度反馈
3. 根据分数变化生成总结（±5分以上）
4. 自动去重并限制数量

**示例**:
```typescript
import { generateHighlights } from '@/skills/inspection-analyzer';

const highlights = generateHighlights(photos, rating, 65, 72);
console.log(highlights.improvements);
// ['整体经营状况有明显改善', '员工服务态度优秀', '商品陈列整齐有序']

console.log(highlights.concerns);
// ['现场环境需要改善', '安全合规需要加强']
```

## 算法说明

### 预警标签生成规则

| 维度 | 阈值 | 预警标签 |
|------|------|---------|
| 租售比 | > 25% | 租售比过高(X%) |
| 经营表现 | < 40分 | 经营表现不佳(X分) |
| 现场品质 | < 50分 | 现场品质较差(X分) |
| 顾客满意度 | < 50分 | 顾客满意度偏低(X分) |
| 租金缴纳 | < 80分 | 租金缴纳异常(X分) |
| 抗风险能力 | < 40分 | 抗风险能力弱(X分) |

### 核心观察点生成规则

| 触发条件 | 生成观察点 |
|---------|-----------|
| 经营表现 < 50 | 重点观察货品完备性与陈列 / 核实是否存在断货或库存积压 |
| 现场品质 < 60 | 检查店面卫生和环境整洁度 / 核查设施设备是否正常运作 |
| 顾客满意度 < 60 | 关注员工服务态度和话术 / 观察顾客进店后的接待流程 |
| 租售比 > 25% | 了解经营困难和成本压力 / 评估是否需要调整经营策略 |
| 租金缴纳 < 80 | 核实租金缴纳情况和资金状况 / 评估商户的经营意愿和信心 |
| 无明显弱项 | 常规观察点（经营状态、客流变化、服务反馈） |

### 评分反馈生成规则

| 评分区间 | 改进亮点 | 关注点 |
|---------|---------|--------|
| ≥ 80分 | [维度]表现优秀 | - |
| 50-79分 | - | - |
| < 50分 | - | [维度]需要提升 |

## 注意事项

1. **纯函数设计**: 所有函数均为纯函数，无副作用，可安全并发调用
2. **类型安全**: 完整的TypeScript类型定义，编译时检查类型错误
3. **零依赖**: 除 `@/types` 外，不依赖其他业务模块
4. **可测试性**: 纯逻辑实现，易于编写单元测试
5. **时区处理**: `generateChecklist()` 使用本地时区，适配不同地区

## 集成示例

```typescript
import {
  generateMerchantInsights,
  generateChecklist,
  extractIssuesFromPhotos,
  generateHighlights,
} from '@/skills/inspection-analyzer';

// 1. 巡检前：生成画像和检查清单
function prepareInspection(merchant: Merchant) {
  const insights = generateMerchantInsights(merchant);
  const checklist = generateChecklist();

  return {
    alerts: insights.alerts,
    focusPoints: insights.focusPoints,
    checklist: checklist.items,
  };
}

// 2. 巡检后：提取问题和生成反馈
function processInspectionResult(
  merchant: Merchant,
  photos: PhotoAttachment[],
  rating: QuickRating,
  oldScore: number,
  newScore: number
) {
  const issues = extractIssuesFromPhotos(photos);
  const highlights = generateHighlights(photos, rating, oldScore, newScore);

  return {
    issues,
    improvements: highlights.improvements,
    concerns: highlights.concerns,
  };
}
```

## 版本历史

- **v1.0** (2026-01-28): 从 `utils/inspectionService.ts` 提取，作为独立skill模块
- 支持5维度评分体系（员工状态、商品陈列、店面环境、管理能力、安全合规）
- 支持5等级风险标准（无/低/中/高/极高）

---

**作者**: Claude Sonnet 4.5
**创建日期**: 2026-01-28
**状态**: ✅ 已完成
