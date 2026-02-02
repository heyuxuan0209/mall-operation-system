# P1 & P2 Skills提取待办清单

**创建日期**: 2026-01-28
**状态**: 待执行
**来源**: v1.1到v2.0功能沉淀方案

---

## ✅ P0任务完成状态

- ✅ health-calculator.ts - 补充v2.0文档
- ✅ ai-diagnosis-engine.ts - 从utils迁移AI诊断引擎
- ✅ trend-predictor.ts - 从utils迁移趋势预测器
- ✅ Git提交: commit 864e649

---

## 📋 P1任务（次优先级）

### 任务4: 提取Inspection Analyzer（巡检分析器）

**当前位置**: `utils/inspectionService.ts`（第114-451行的纯函数部分）
**目标位置**: `skills/inspection-analyzer/`
**提取行数**: ~180行（从560行中提取）
**独立性**: ⭐⭐ 中
**提取价值**: ⭐⭐ 高

#### 可提取的纯函数

```typescript
// 1. 商户画像生成（简化版，去除类依赖）
function generateMerchantInsights(merchant: Merchant): {
  alerts: string[];
  weakestDimension: string;
  focusPoints: string[];
}

// 2. 核心观察点生成
function generateFocusPoints(merchant: Merchant): string[]

// 3. 检查清单生成（时间智能匹配）
function generateChecklist(timeOfDay: Date): {
  type: 'opening' | 'closing' | 'routine';
  items: ChecklistItem[];
}

// 4. 问题提取
function extractIssuesFromPhotos(photos: PhotoAttachment[]): string[]

// 5. 反馈亮点生成
function generateHighlights(
  photos: PhotoAttachment[],
  rating: QuickRating | null,
  oldScore: number,
  newScore: number
): { improvements: string[]; concerns: string[] }
```

#### 实施步骤

1. **创建目录结构**:
```bash
mkdir -p skills/inspection-analyzer
```

2. **创建文件**:
```
skills/inspection-analyzer/
├── index.ts          # 统一导出
├── insights.ts       # 画像和观察点生成
├── checklist.ts      # 检查清单生成
├── highlights.ts     # 亮点和问题提取
├── types.ts          # 类型定义
└── README.md         # 使用文档
```

3. **从inspectionService.ts提取**:
   - 复制相关纯函数到对应文件
   - 移除对InspectionService类的依赖
   - 简化为独立的纯函数

4. **更新inspectionService.ts**:
```typescript
import {
  generateFocusPoints,
  generateChecklist,
  generateHighlights,
  extractIssuesFromPhotos
} from '@/skills/inspection-analyzer';

class InspectionServiceClass {
  // 使用导入的skill函数
  getMerchantProfile() {
    const focusPoints = generateFocusPoints(merchant);
    // ...
  }
}
```

5. **测试验证**:
   - 在app/inspection/page.tsx中测试巡检流程
   - 验证画像生成和检查清单功能正常

---

### 任务5: 提取Image Processor（图片处理器）

**当前位置**: `utils/imageStorage.ts` 内的compression相关代码
**目标位置**: `skills/image-processor/`
**提取行数**: ~135行
**独立性**: ⭐⭐⭐ 完美
**提取价值**: ⭐⭐ 中-高

#### 核心功能

```typescript
- compressImage()       // Canvas图片压缩
- generateThumbnail()   // 缩略图生成
- blobToBase64()        // Blob转Base64
- getBase64Size()       // Base64大小计算
```

#### 实施步骤

1. **创建文件结构**:
```
skills/image-processor/
├── index.ts          # 统一导出
├── compression.ts    # 压缩算法实现
├── types.ts          # 类型定义
└── README.md         # 使用文档
```

2. **提取压缩算法**:
```typescript
// skills/image-processor/compression.ts
export async function compressImage(
  file: File,
  maxWidth: number = 800,
  quality: number = 0.8
): Promise<string> {
  // Canvas压缩实现
}

export function generateThumbnail(
  base64: string,
  maxSize: number = 200
): Promise<string> {
  // 缩略图生成
}
```

3. **更新imageStorage.ts**:
```typescript
import { compressImage, generateThumbnail } from '@/skills/image-processor';

export class ImageStorageClass {
  async saveImage(file: File): Promise<string> {
    const compressed = await compressImage(file);
    // ...
  }
}
```

4. **测试验证**:
   - 在app/inspection/page.tsx中测试图片上传
   - 验证压缩和缩略图功能正常

---

### 任务6: 提取Notification Builder（通知构建器）

**当前位置**: `utils/notificationService.ts`（第87-221行）
**目标位置**: `skills/notification-builder/`
**提取行数**: ~100行（从341行中提取）
**独立性**: ⭐⭐ 中
**提取价值**: ⭐ 中

#### 可提取的纯函数

```typescript
// 1. 截止日期检查（核心逻辑部分）
function checkTaskDeadlines(
  tasks: Task[],
  settings: NotificationSettings,
  now: Date = new Date()
): AppNotification[]

// 2. 任务分配通知构建
function createTaskAssignedNotification(
  task: Task,
  assignedBy: string = '系统'
): AppNotification

// 3. 状态变更通知构建
function createTaskStatusChangeNotification(
  task: Task,
  oldStatus: string,
  newStatus: string
): AppNotification
```

#### 实施步骤

1. **创建文件结构**:
```
skills/notification-builder/
├── index.ts          # 统一导出
├── deadlines.ts      # 截止日期检查逻辑
├── builders.ts       # 通知对象构建
├── types.ts          # 类型定义
└── README.md         # 使用文档
```

2. **提取业务规则**:
```typescript
// skills/notification-builder/deadlines.ts
export function checkTaskDeadlines(
  tasks: Task[],
  settings: NotificationSettings,
  now: Date = new Date()
): AppNotification[] {
  // 纯逻辑：根据截止日期生成通知列表
}
```

3. **更新notificationService.ts**:
```typescript
import { checkTaskDeadlines, createTaskAssignedNotification } from '@/skills/notification-builder';

export class NotificationServiceClass {
  checkDeadlines() {
    const notifications = checkTaskDeadlines(tasks, settings);
    // 存储到localStorage
  }
}
```

4. **测试验证**:
   - 在app/notifications/page.tsx中测试通知功能
   - 验证截止日期检查和通知构建正常

---

## 📝 P2任务（可选优化）

### 任务7: 补充Skills文档

**目标**: 为所有skills添加完整的README和使用示例

#### 需要补充文档的skills

```
skills/
├── health-analyzer/README.md          # 健康度计算器使用指南
├── ai-diagnosis-engine/README.md      # AI诊断引擎使用指南
├── trend-predictor/README.md          # 趋势预测器使用指南
├── inspection-analyzer/README.md      # 巡检分析器使用指南（P1完成后）
├── image-processor/README.md          # 图片处理器使用指南（P1完成后）
├── notification-builder/README.md     # 通知构建器使用指南（P1完成后）
├── roi-calculator.ts                  # 补充文档
├── risk-assessor.ts                   # 补充文档
├── risk-detector.ts                   # 补充文档
├── ai-matcher.ts                      # 补充文档
├── task-lifecycle-manager.ts          # 补充文档
└── knowledge-manager.ts               # 补充文档
```

#### README模板

```markdown
# [Skill名称]

## 功能概述
[简短描述skill的核心功能和用途]

## 核心功能
- 功能1: [描述]
- 功能2: [描述]

## 使用场景
- 场景1: [描述]
- 场景2: [描述]

## API文档

### 函数1: functionName()

**描述**: [功能描述]

**参数**:
- `param1` (type): [参数说明]
- `param2` (type): [参数说明]

**返回值**: [返回值类型和说明]

**示例**:
```typescript
const result = functionName(param1, param2);
console.log(result);
```

## 算法说明
[如果涉及复杂算法，详细说明算法原理]

## 注意事项
- [重要提示1]
- [重要提示2]
```

---

### 任务8: 创建Skills统一导出入口

**目标**: 创建`skills/index.ts`统一导出所有skills

#### 实施步骤

1. **创建skills/index.ts**:
```typescript
/**
 * Skills统一导出入口
 *
 * 所有业务逻辑skills的集中导出，便于统一管理和使用。
 */

// 健康度相关
export * from './health-calculator';
export * from './ai-diagnosis-engine';
export * from './trend-predictor';

// 风险相关
export * from './risk-assessor';
export * from './risk-detector';

// 任务相关
export * from './task-lifecycle-manager';
export * from './roi-calculator';

// 知识库相关
export * from './knowledge-manager';
export * from './ai-matcher';
export * from './enhanced-ai-matcher';
export * from './smart-search';
export * from './tag-classifier';

// P1完成后添加
// export * from './inspection-analyzer';
// export * from './image-processor';
// export * from './notification-builder';
```

2. **更新tsconfig.json**（如果需要）:
```json
{
  "compilerOptions": {
    "paths": {
      "@/skills": ["./skills/index.ts"],
      "@/skills/*": ["./skills/*"]
    }
  }
}
```

3. **在应用中使用**:
```typescript
// 方式1: 从统一入口导入
import { analyzeHealth, generateDiagnosisReport } from '@/skills';

// 方式2: 从具体skill导入（推荐）
import { analyzeHealth } from '@/skills/health-calculator';
import { generateDiagnosisReport } from '@/skills/ai-diagnosis-engine';
```

---

### 任务9: 编写Skills开发规范文档

**目标**: 创建`docs/SKILLS-DEVELOPMENT-GUIDE.md`

#### 文档内容

```markdown
# Skills开发规范

## 什么是Skill?

Skill是纯业务逻辑模块，具有以下特征：
- ✅ 100%纯函数，无副作用
- ✅ 高度可复用，跨模块通用
- ✅ 逻辑独立完整，无强依赖
- ✅ 完整的TypeScript类型定义
- ✅ 详细的JSDoc文档

## 命名规范

计算类: calculate*, compute*
分析类: analyze*, assess*, detect*
生成类: generate*, create*, build*
查询类: get*, find*, filter*
转换类: transform*, convert*, map*
验证类: validate*, verify*, check*

## 文件结构

### 简单Skill（单文件）
```
skills/skill-name.ts
```

### 复杂Skill（目录结构）
```
skills/skill-name/
├── index.ts       # 统一导出
├── core.ts        # 核心逻辑
├── helpers.ts     # 辅助函数
├── types.ts       # 类型定义
└── README.md      # 使用文档
```

## 代码模板

[具体模板内容]

## 测试规范

[测试要求和示例]
```

---

## 🎯 实施建议

### 推荐执行顺序

1. **P1任务4**: Inspection Analyzer（2-3小时）
   - 提取价值高
   - 功能独立
   - 测试简单

2. **P1任务5**: Image Processor（1-2小时）
   - 100%纯逻辑
   - 零风险
   - 快速完成

3. **P1任务6**: Notification Builder（1-2小时）
   - 需要一定拆分工作
   - 价值中等

4. **P2任务7**: 补充文档（按需）
   - 持续优化
   - 逐个完善

5. **P2任务8-9**: 统一导出和规范文档（1小时）
   - 建立长期规范
   - 提升团队效率

### 时间预估

- **P1全部完成**: 4-7小时
- **P2全部完成**: 2-3小时
- **总计**: 6-10小时

### 风险评估

| 风险 | 等级 | 缓解措施 |
|------|------|---------|
| 导入路径变更 | 低 | 使用转发导出保持兼容 |
| 类型定义冲突 | 低 | 统一使用@/types |
| 测试覆盖不足 | 中 | 先编写测试再迁移 |
| 功能回退 | 低 | 逐个模块迁移并验证 |

---

## 📊 预期收益

### P0+P1完成后

```
代码质量提升:
- 可测试性: +80%
- 可复用性: +70%
- 可维护性: +50%

架构优化:
- 纯逻辑代码占比: 15% → 40%
- 提取行数: ~1100行
- Skills数量: 6个 → 9个
```

### P0+P1+P2完成后

```
文档完整性: +60%
开发效率: +30%
代码规范性: +50%
团队协作效率: +40%
```

---

## 🔗 相关文档

- [P0完成报告](./P0-COMPLETION.md) - 已完成的P0任务总结
- [Skills架构设计](./SKILLS-ARCHITECTURE.md) - Skills体系架构说明
- [v2.0版本发布说明](./RELEASE-v2.0.md) - v2.0功能详情

---

**创建人**: Claude Sonnet 4.5
**创建日期**: 2026-01-28
**状态**: 待执行
**预计完成**: 2026-02-05

