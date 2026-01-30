# 商户数据一致性说明

## 问题描述

在测试过程中发现商户数据在不同地方显示不一致：
- 签到时显示的健康度
- 巡检记录中的基准健康度
- 保存后更新的健康度

这会导致用户困惑和数据不一致。

## 解决方案

### 1. 统一数据源

创建 `utils/merchantData.ts` 作为唯一的商户数据配置文件：

```typescript
export const DEFAULT_MERCHANT: Merchant = {
  id: 'M001',
  name: '星巴克咖啡',
  totalScore: 65,     // 初始健康度：65分
  riskLevel: 'medium', // 中风险
  // ... 其他字段
};
```

### 2. 数据流转规则

```
初始状态（首次访问）
├─> localStorage 为空
├─> 使用 DEFAULT_MERCHANT 初始化
└─> 写入 localStorage

签到时
├─> 从 localStorage 读取商户数据
├─> 显示当前健康度（如 65 分）
└─> 显示商户画像

保存巡检记录时
├─> 读取旧的健康度（如 65 分）
├─> 根据评分和照片计算新健康度
├─> 更新 localStorage 中的商户数据
└─> 在反馈弹窗显示变化（65 → 新分数）

下次巡检时
├─> 从 localStorage 读取
└─> 使用更新后的健康度（不是 65，而是上次更新的分数）
```

### 3. 关键原则

#### ✅ 正确做法

1. **唯一数据源**
   - 所有地方都从 `utils/merchantData.ts` 导入
   - 所有地方都从 localStorage 读取最新数据

2. **一致的初始值**
   ```typescript
   // ✓ 正确
   const merchant = initializeMerchantData(); // 65分
   // 或
   const merchant = getMerchantData();        // 最新分数
   ```

3. **更新后刷新**
   ```typescript
   // 保存后
   const updatedMerchant = getMerchantData(); // 获取更新后的数据
   setMerchant(updatedMerchant);
   ```

#### ❌ 错误做法

1. **硬编码不同的值**
   ```typescript
   // ✗ 错误：签到组件
   const merchant = { totalScore: 88, riskLevel: 'low' };

   // ✗ 错误：巡检页面
   const merchant = { totalScore: 65, riskLevel: 'medium' };
   ```

2. **不刷新数据**
   ```typescript
   // ✗ 错误：保存后不刷新，下次看到的还是旧数据
   saveInspection();
   // 忘记调用 getMerchantData()
   ```

### 4. 测试数据生成

测试数据生成器也使用统一配置：

```javascript
// docs/test-data-generator.js
generateMerchant() {
  const merchant = {
    id: 'M001',
    name: '星巴克咖啡',
    totalScore: 65,        // 与 DEFAULT_MERCHANT 一致
    riskLevel: 'medium',   // 与 DEFAULT_MERCHANT 一致
    // ...
  };

  localStorage.setItem('merchants', JSON.stringify([merchant]));
}
```

### 5. 数据一致性检查

在浏览器控制台运行以下命令检查数据一致性：

```javascript
// 检查当前商户数据
const merchants = JSON.parse(localStorage.getItem('merchants'));
console.log('当前健康度:', merchants[0].totalScore);
console.log('风险等级:', merchants[0].riskLevel);

// 检查巡检记录
const records = JSON.parse(localStorage.getItem('inspection_records'));
if (records.length > 0) {
  console.log('最新巡检时间:', records[0].createdAt);
  console.log('最新评分:', records[0].rating);
}

// 验证数据一致性
const merchant = merchants[0];
const expectedRiskLevel =
  merchant.totalScore >= 80 ? 'low' :
  merchant.totalScore >= 60 ? 'medium' :
  merchant.totalScore >= 40 ? 'high' : 'critical';

console.log('健康度与风险等级是否匹配:',
  merchant.riskLevel === expectedRiskLevel ? '✓ 一致' : '✗ 不一致');
```

## 测试场景验证

### 场景 1: 首次使用

```
1. 清空 localStorage
2. 访问 /inspection 页面
3. 检查签到卡片显示：健康度 65 分，中风险 ✓
4. 进行巡检并保存（假设评分优秀）
5. 反馈弹窗显示：65 → 72 ✓
6. 刷新页面
7. 再次检查签到卡片：健康度 72 分，中风险 ✓
```

### 场景 2: 连续巡检

```
1. 第一次巡检：65 → 72（+7）
2. 第二次巡检：基于 72 分计算，不是基于 65 分 ✓
3. 假设第二次发现问题，评分差
4. 反馈显示：72 → 60（-12）✓
5. 第三次巡检：基于 60 分计算 ✓
```

### 场景 3: 风险等级联动

```
初始：65 分，中风险
↓
优秀巡检：72 分，中风险（60-80）✓
↓
多次优秀：85 分，低风险（80+）✓
↓
发现问题：55 分，中风险（40-60）✓
↓
严重问题：35 分，高风险（<40）✓
```

## 代码审查清单

在提交代码前检查：

- [ ] 所有商户数据都从 `utils/merchantData.ts` 导入
- [ ] 使用 `initializeMerchantData()` 或 `getMerchantData()` 获取数据
- [ ] 保存后调用 `getMerchantData()` 刷新状态
- [ ] 测试数据使用统一的初始值（65分，中风险）
- [ ] 健康度与风险等级的映射关系正确
- [ ] 没有硬编码的商户数据

## 文件清单

已修改/创建的文件：

1. ✅ `utils/merchantData.ts` - 统一的商户数据配置
2. ✅ `app/inspection/page.tsx` - 使用统一配置
3. ✅ `docs/test-data-generator.js` - 使用统一配置
4. ✅ `docs/data-consistency-guide.md` - 本文档

## 下一步

1. 验证所有地方的商户数据一致性
2. 在浏览器中测试完整流程
3. 运行一致性检查命令
4. 记录测试结果

---

**重要提醒**: 商户健康度是动态的，会随着巡检记录而变化。所有显示商户健康度的地方都应该从 localStorage 读取最新数据，而不是使用硬编码的值。
