# 🐛 Bug 修复报告 - 健康度计算错误

## 问题描述

**现象**：按照测试步骤操作（上传良好照片 + 优秀评分），保存后健康度反而从 65 分下降到 47 分

**预期**：健康度应该从 65 分上升到 72 分左右

## Root Cause (根本原因)

### 数据结构不匹配

**QuickRating 组件返回的数据结构：**
```javascript
{
  id: 'rating_xxx',
  merchantId: 'M001',
  timestamp: '2026-01-27...',
  ratings: {
    staffCondition: 85,          // 员工状态
    merchandiseDisplay: 85,      // 商品陈列
    storeEnvironment: 90,        // 店面环境
    managementCapability: 85,    // 管理能力
    safetyCompliance: 85,        // 安全合规
  }
}
```

**inspectionService 期望的数据结构（旧版）：**
```javascript
{
  people: 85,
  merchandise: 85,
  place: 90,
  overall: 87
}
```

### 导致的问题

在 `calculateNewHealthScore` 函数中：

```javascript
// ❌ 错误的代码
const avgRating = (
  rating.people +        // undefined
  rating.merchandise +   // undefined
  rating.place +         // undefined
  rating.overall         // undefined
) / 4;

// avgRating = NaN
```

因为 `rating.people` 等字段都是 `undefined`，计算结果是 `NaN`。

然后在判断逻辑中：
```javascript
if (avgRating >= 80) { ... }        // false (NaN >= 80 = false)
else if (avgRating >= 60) { ... }   // false (NaN >= 60 = false)
else if (avgRating >= 40) { ... }   // false (NaN >= 40 = false)
else {
  newScore -= 10;  // ✗ 错误地执行了这里！
}
```

结果：
- 65 - 10 (错误的评分影响) + 1 (1张良好照片) = **56 分** ❌

## 修复方案

### 1. 修复 `calculateNewHealthScore` 函数

**文件**：`utils/inspectionService.ts:314-342`

```typescript
// ✅ 修复后的代码
if (rating && rating.ratings) {
  const { staffCondition, merchandiseDisplay, storeEnvironment,
          managementCapability, safetyCompliance } = rating.ratings;

  const avgRating = (
    staffCondition +
    merchandiseDisplay +
    storeEnvironment +
    managementCapability +
    safetyCompliance
  ) / 5;  // 5个维度

  // 正确的计算逻辑...
}
```

### 2. 修复 `generateHighlights` 函数

**文件**：`utils/inspectionService.ts:397-416`

```typescript
// ✅ 修复后的代码
if (rating && rating.ratings) {
  const { staffCondition, merchandiseDisplay, storeEnvironment,
          managementCapability, safetyCompliance } = rating.ratings;

  // 基于新的维度生成反馈
  if (staffCondition >= 80) {
    improvements.push('员工服务态度优秀');
  }
  // ... 其他维度
}
```

### 3. 修复 `updateMerchantHealth` 函数

**文件**：`utils/inspectionService.ts:489-498`

```typescript
// ✅ 修复后的代码
if (rating && rating.ratings) {
  const { staffCondition, merchandiseDisplay, storeEnvironment,
          managementCapability, safetyCompliance } = rating.ratings;

  merchants[merchantIndex].metrics = {
    collection: merchants[merchantIndex].metrics.collection,
    operational: Math.round((merchandiseDisplay + managementCapability) / 2),
    siteQuality: Math.round((storeEnvironment + staffCondition) / 2),
    customerReview: Math.round((staffCondition + storeEnvironment + merchandiseDisplay) / 3),
    riskResistance: Math.round((managementCapability + safetyCompliance) / 2),
  };
}
```

### 4. 修复测试数据生成器

**文件**：`docs/test-data-generator.js`

更新 `generateInspectionRecord` 函数，使用新的评分结构。

## 验证修复

### 重新测试步骤

1. **清空数据**
   ```javascript
   localStorage.clear();
   ```

2. **刷新页面** (F5)

3. **签到**
   - 确认显示：65分，中风险 ✅

4. **上传照片**
   - 上传1张图片
   - 分类：场（环境）
   - 标签：环境整洁
   - 等级：良好 ✅

5. **评分**
   - 点击"优秀"预设
   - 所有维度 85+ ✅

6. **保存**
   - 点击保存按钮

7. **检查反馈弹窗**
   ```
   预期：
   - 之前：65分
   - 现在：71-72分  ← 正确
   - ↑ +6 或 +7
   ```

8. **验证数据**
   ```javascript
   const m = JSON.parse(localStorage.getItem('merchants'))[0];
   console.log('健康度:', m.totalScore);  // 应该是 71-72
   ```

### 计算验证

**正确的计算过程：**

```
初始分数：65
评分平均：(85+85+90+85+85)/5 = 86
评分影响：+5 (平均 86 >= 80)
照片影响：+1 (1张良好)
最终分数：65 + 5 + 1 = 71 ✅
```

## 修复的文件清单

- ✅ `utils/inspectionService.ts` (主要修复)
  - calculateNewHealthScore 函数
  - generateHighlights 函数
  - updateMerchantHealth 函数
- ✅ `docs/test-data-generator.js` (测试工具)
- ✅ `docs/BUG-FIX-HEALTH-SCORE.md` (本文档)

## 根本原因分析

### 为什么会出现这个问题？

1. **组件升级不同步**
   - QuickRating 组件使用了新的 5 维度评分系统
   - 但 inspectionService 仍使用旧的 4 维度结构
   - 两者没有同步更新

2. **缺乏类型检查**
   - 虽然使用了 TypeScript
   - 但评分字段访问时没有运行时验证
   - 导致 undefined 没有被及时发现

3. **测试覆盖不足**
   - 端到端测试发现了问题
   - 但单元测试没有覆盖数据结构兼容性

## 预防措施

### 建议的改进

1. **添加运行时验证**
   ```typescript
   if (rating && rating.ratings) {
     // 验证必需字段存在
     const { staffCondition, merchandiseDisplay, ... } = rating.ratings;
     if (staffCondition === undefined) {
       console.error('评分数据结构错误');
       return merchant.totalScore; // 返回旧分数
     }
   }
   ```

2. **添加单元测试**
   ```javascript
   test('calculateNewHealthScore with new rating structure', () => {
     const rating = {
       ratings: {
         staffCondition: 85,
         // ...
       }
     };
     const result = calculateNewHealthScore(merchant, rating, []);
     expect(result).toBeGreaterThan(65);
   });
   ```

3. **数据结构文档化**
   - 在 types/index.ts 中明确定义接口
   - 添加注释说明数据结构
   - 保持文档与代码同步

## 测试结果

修复后重新测试，预期结果：

- ✅ 健康度正确上升（65 → 71-72）
- ✅ 反馈弹窗显示正确的变化
- ✅ 改进亮点列表正常生成
- ✅ 刷新后数据持久化正常

---

**修复状态**：✅ 已完成
**修复时间**：2026-01-27
**影响范围**：所有巡检记录保存功能
**优先级**：🔥 P0 (阻断功能)

**现在请重新测试！**
