# Skills开发规范

**版本**: v1.0
**创建日期**: 2026-01-28
**适用范围**: 商场运营管理系统所有Skills模块

---

## 📖 什么是Skill?

**Skill是纯业务逻辑模块**，具有以下核心特征：

| 特征 | 说明 |
|------|------|
| ✅ 纯函数 | 100%纯函数，无副作用，相同输入永远返回相同输出 |
| ✅ 高复用 | 跨模块通用，可在任意场景中调用 |
| ✅ 逻辑独立 | 不依赖具体业务上下文，只依赖输入参数 |
| ✅ 类型安全 | 完整的TypeScript类型定义 |
| ✅ 文档完善 | 包含完整的JSDoc和README |

**Skills vs Utils**:
- **Skills**: 业务逻辑（健康度计算、趋势预测、风险评估）
- **Utils**: 技术工具（数据格式化、LocalStorage操作、HTTP请求）

---

## 📁 文件结构规范

### 简单Skill（单文件）

适用于逻辑简单、代码量<300行的skill。

```
skills/
└── skill-name.ts           # 包含所有逻辑、类型和导出
```

**示例**: `roi-calculator.ts`, `risk-detector.ts`

### 复杂Skill（目录结构）

适用于逻辑复杂、代码量>300行或包含多个子模块的skill。

```
skills/skill-name/
├── index.ts                # 统一导出入口
├── core.ts                 # 核心业务逻辑
├── helpers.ts              # 辅助函数（可选）
├── types.ts                # 类型定义
└── README.md               # 使用文档
```

**示例**: `inspection-analyzer/`, `image-processor/`

---

## 🏷️ 命名规范

### Skill文件/目录命名

- 使用**kebab-case**（短横线分隔）
- 使用**名词**或**名词短语**
- 避免动词开头

```typescript
✅ health-calculator.ts          // 推荐
✅ inspection-analyzer/          // 推荐
✅ notification-builder/         // 推荐

❌ calculateHealth.ts            // 避免：动词开头
❌ analyze_inspection.ts         // 避免：下划线分隔
❌ InspectionAnalyzer.ts         // 避免：PascalCase
```

### 函数命名

按功能类型使用特定前缀：

| 前缀 | 用途 | 示例 |
|------|------|------|
| `calculate*` | 数值计算 | `calculateROI()`, `calculateHealthScore()` |
| `analyze*` | 数据分析 | `analyzeHealth()`, `analyzeTrend()` |
| `generate*` | 生成内容 | `generateReport()`, `generateChecklist()` |
| `predict*` | 预测结果 | `predictTrend()`, `predictRisk()` |
| `detect*` | 检测问题 | `detectRisk()`, `detectAnomalies()` |
| `assess*` | 评估状态 | `assessRisk()`, `assessQuality()` |
| `check*` | 检查条件 | `checkDeadlines()`, `checkCompliance()` |
| `create*` | 创建对象 | `createNotification()`, `createTask()` |
| `find*` | 查找数据 | `findBestMatch()`, `findSimilar()` |
| `filter*` | 过滤数据 | `filterByRisk()`, `filterExpired()` |

---

## 📝 代码模板

### 单文件Skill模板

```typescript
/**
 * [Skill名称]
 *
 * [简短描述skill的功能和用途]
 *
 * ## 核心功能
 * - [功能1]
 * - [功能2]
 *
 * ## 使用场景
 * - [场景1]
 * - [场景2]
 *
 * @module skills/[skill-name]
 */

import { [Type1], [Type2] } from '@/types';

/**
 * [接口或类型定义]
 */
export interface [InterfaceName] {
  [field]: [type];
}

/**
 * [函数1名称]
 * [详细描述函数的功能]
 *
 * @param [param1] - [参数1说明]
 * @param [param2] - [参数2说明]
 * @returns [返回值说明]
 *
 * @example
 * ```typescript
 * const result = [functionName](param1, param2);
 * console.log(result);
 * ```
 */
export function [functionName](
  [param1]: [Type1],
  [param2]: [Type2]
): [ReturnType] {
  // 实现逻辑
  return result;
}

/**
 * [函数2名称]
 * [详细描述函数的功能]
 */
export function [anotherFunction](...) {
  // 实现逻辑
}
```

### 目录结构Skill模板

**index.ts**:
```typescript
/**
 * [Skill名称]
 *
 * [简短描述]
 *
 * @module skills/[skill-name]
 */

export * from './core';
export * from './helpers';
export type * from './types';
```

**types.ts**:
```typescript
/**
 * [Skill名称] - 类型定义
 */

import { [BaseType] } from '@/types';

export interface [InterfaceName] {
  [field]: [type];
}
```

**core.ts**:
```typescript
/**
 * [Skill名称] - 核心逻辑
 */

import { [Type] } from './types';

export function [mainFunction](...) {
  // 核心实现
}
```

---

## ✅ 编码规范

### 1. 纯函数原则

```typescript
// ✅ 推荐：纯函数
export function calculateScore(data: number[]): number {
  return data.reduce((sum, n) => sum + n, 0) / data.length;
}

// ❌ 避免：有副作用
let globalCache = {};
export function calculateScore(data: number[]): number {
  globalCache['lastResult'] = data.length; // 副作用
  return data.reduce((sum, n) => sum + n, 0) / data.length;
}

// ❌ 避免：依赖外部状态
export function isExpired(task: Task): boolean {
  return new Date(task.deadline) < new Date(); // 依赖当前时间
}

// ✅ 推荐：注入时间参数
export function isExpired(task: Task, now: Date = new Date()): boolean {
  return new Date(task.deadline) < now;
}
```

### 2. 类型安全

```typescript
// ✅ 推荐：完整的类型定义
export function analyzeHealth(
  merchant: Merchant,
  config?: AnalysisConfig
): HealthAnalysisResult {
  // 实现
}

// ❌ 避免：any类型
export function analyzeHealth(merchant: any, config?: any): any {
  // 实现
}
```

### 3. 参数设计

```typescript
// ✅ 推荐：使用配置对象（参数>3个时）
export function generateReport(config: {
  merchant: Merchant;
  startDate: Date;
  endDate: Date;
  includeDetails?: boolean;
  format?: 'pdf' | 'excel';
}): Report {
  // 实现
}

// ❌ 避免：过多独立参数
export function generateReport(
  merchant: Merchant,
  startDate: Date,
  endDate: Date,
  includeDetails?: boolean,
  format?: string
): Report {
  // 实现
}
```

### 4. 错误处理

```typescript
// ✅ 推荐：返回结果对象
export function parseData(input: string): {
  success: boolean;
  data?: ParsedData;
  error?: string;
} {
  try {
    const data = JSON.parse(input);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: '解析失败' };
  }
}

// ⚠️ 谨慎使用：抛出异常（仅用于无法恢复的错误）
export function calculateROI(revenue: number, cost: number): number {
  if (cost === 0) {
    throw new Error('成本不能为0');
  }
  return (revenue - cost) / cost;
}
```

---

## 📚 文档规范

### JSDoc注释

每个导出函数**必须**包含JSDoc注释：

```typescript
/**
 * 计算商户健康度分数
 *
 * 基于5个维度的加权平均计算总分：
 * - 租金缴纳 (30%)
 * - 经营表现 (25%)
 * - 现场品质 (20%)
 * - 顾客满意度 (15%)
 * - 抗风险能力 (10%)
 *
 * @param merchant - 商户对象，包含各维度评分
 * @param weights - 可选的自定义权重配置
 * @returns 健康度总分（0-100分）
 *
 * @example
 * ```typescript
 * const score = analyzeHealth(merchant);
 * console.log(`健康度: ${score}分`);
 * ```
 *
 * @throws {Error} 当merchant对象缺少必需字段时抛出错误
 */
export function analyzeHealth(
  merchant: Merchant,
  weights?: WeightConfig
): number {
  // 实现
}
```

### README文档

复杂Skill（目录结构）**必须**包含README.md，内容包括：

1. **功能概述** - 简短描述（2-3句话）
2. **核心功能** - 列出主要功能点
3. **使用场景** - 说明适用场景
4. **API文档** - 每个公开函数的详细说明
5. **使用示例** - 完整的代码示例
6. **算法说明** - 复杂算法的原理说明（可选）
7. **注意事项** - 重要提示和限制

参考示例：`skills/inspection-analyzer/README.md`

---

## 🧪 测试规范

### 单元测试原则

每个Skill应编写单元测试（推荐但非强制）：

```typescript
// skills/__tests__/health-calculator.test.ts

import { analyzeHealth } from '../health-calculator';
import { mockMerchant } from '@/test/fixtures';

describe('analyzeHealth', () => {
  it('应正确计算健康度分数', () => {
    const result = analyzeHealth(mockMerchant);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(100);
  });

  it('应处理缺失数据', () => {
    const incompleteMerchant = { ...mockMerchant, metrics: undefined };
    expect(() => analyzeHealth(incompleteMerchant)).toThrow();
  });
});
```

---

## 🔄 迁移现有代码到Skills

### 识别可提取的逻辑

符合以下条件的代码应提取为Skill：

- ✅ 纯业务逻辑计算
- ✅ 可独立测试
- ✅ 可在多处复用
- ✅ 不依赖React组件
- ✅ 不直接操作DOM或LocalStorage

### 提取步骤

1. **创建Skill文件**
   - 确定Skill名称
   - 选择单文件或目录结构

2. **复制并清理代码**
   - 复制原始逻辑
   - 移除副作用（console.log, localStorage等）
   - 移除外部依赖

3. **定义类型**
   - 为所有参数和返回值添加类型
   - 创建必要的接口

4. **编写文档**
   - 添加JSDoc注释
   - 创建README（复杂Skill）

5. **更新原始代码**
   - 导入新的Skill
   - 替换原有逻辑
   - 保持向后兼容（使用@deprecated标记）

6. **验证**
   - 运行TypeScript编译
   - 测试功能是否正常

---

## 📦 Skills索引

### 当前可用Skills（v2.0）

| Skill | 类型 | 功能 |
|-------|------|------|
| `health-calculator` | 健康度 | 计算商户健康度分数 |
| `ai-diagnosis-engine` | 健康度 | AI诊断报告生成 |
| `trend-predictor` | 健康度 | 趋势预测和风险预警 |
| `risk-assessor` | 风险 | 风险评估和等级判定 |
| `risk-detector` | 风险 | 风险检测和预警 |
| `task-lifecycle-manager` | 任务 | 任务生命周期管理 |
| `roi-calculator` | 任务 | ROI计算和效益评估 |
| `knowledge-manager` | 知识库 | 知识条目管理 |
| `ai-matcher` | 知识库 | AI智能匹配 |
| `enhanced-ai-matcher` | 知识库 | 增强AI匹配 |
| `smart-search` | 知识库 | 智能搜索和排序 |
| `tag-classifier` | 知识库 | 标签分类器 |
| `inspection-analyzer` | 巡店 | 巡检分析和清单生成 |
| `image-processor` | 巡店 | 图片压缩和处理 |
| `notification-builder` | 通知 | 通知构建和提醒 |

### 导入示例

```typescript
// 从统一入口导入
import * as Skills from '@/skills';
const score = Skills.HealthCalculator.analyzeHealth(merchant);

// 从具体模块导入（推荐）
import { analyzeHealth } from '@/skills/health-calculator';
const score = analyzeHealth(merchant);

// 导入常用函数
import { analyzeHealth, generateDiagnosisReport } from '@/skills';
```

---

## 🎯 最佳实践

### ✅ DO（推荐做法）

- ✅ 保持函数小而专注（单一职责）
- ✅ 使用有意义的函数名和变量名
- ✅ 为复杂逻辑添加注释说明
- ✅ 提供默认参数值
- ✅ 返回不可变对象（使用扩展运算符）
- ✅ 处理边界情况（空数组、null值等）

### ❌ DON'T（避免做法）

- ❌ 在Skill中直接访问LocalStorage
- ❌ 在Skill中使用console.log（测试时除外）
- ❌ 依赖全局变量或外部状态
- ❌ 修改输入参数（保持输入不可变）
- ❌ 使用any类型
- ❌ 创建过度抽象的Skill（保持简单）

---

## 🔍 Code Review检查清单

在提交Skill代码前，请确保：

- [ ] 所有函数都是纯函数（无副作用）
- [ ] 完整的TypeScript类型定义
- [ ] 每个导出函数有JSDoc注释
- [ ] 复杂Skill有README文档
- [ ] 至少有一个使用示例
- [ ] TypeScript编译无错误
- [ ] 功能经过手动测试验证
- [ ] 遵循命名规范
- [ ] 无console.log或调试代码

---

## 📞 支持

如有疑问或建议，请参考：
- 现有Skills实现：`skills/inspection-analyzer/`, `skills/image-processor/`
- 项目文档：`docs/`
- 提交Issue或Pull Request

---

**文档维护**: Claude Sonnet 4.5
**最后更新**: 2026-01-28
**版本**: v1.0
