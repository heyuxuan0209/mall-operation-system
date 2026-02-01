# 待解决问题 - NaN 错误

**最后更新**: 2026-02-01
**状态**: 🔴 未解决
**优先级**: P0 (阻塞)

---

## 问题现象

**错误信息**:
```
Received NaN for the `children` attribute. If this is expected, cast the value to a string.
```

**错误堆栈**:
```
DashboardPage (file:///.../_21f5492e._.js:641:37)
Array.map
```

**关键发现**: 错误来自 `DashboardPage`，不是巡店页面！

---

## 已修复部分

### ✅ 巡店相关组件 (已修复)
1. `components/inspection/QuickCheckIn.tsx` - Line 216
   ```tsx
   {profile.healthScore?.toFixed?.(0) || 0}
   ```

2. `components/inspection/QuickRating.tsx` - 4处
   ```tsx
   const averageScore = calculateSiteQualityFromInspection(ratings) || 0;
   {Math.round(averageScore) || 0}
   {ratings[dim.key] || 0}
   {ratings[weakestDimension.key] || 0}
   ```

3. `skills/health-calculator.ts`
   ```tsx
   export function calculateSiteQualityFromInspection(rating: InspectionRating): number {
     const weightedScore =
       (rating.staffCondition || 0) * 0.20 +
       (rating.merchandiseDisplay || 0) * 0.25 +
       (rating.storeEnvironment || 0) * 0.25 +
       (rating.managementCapability || 0) * 0.15 +
       (rating.safetyCompliance || 0) * 0.15;
     return Math.round(weightedScore) || 0;
   }
   ```

4. `utils/inspectionService.ts`
   ```tsx
   healthScore: totalScore || 0,
   riskLevel: riskLevel || 'none',
   ```

---

## 待修复部分

### 🔴 首页 (app/page.tsx - DashboardPage)

**问题定位**:
- 错误堆栈指向 `DashboardPage` 第 641 行
- 在 `Array.map` 中出现 NaN
- 可能是商户数据、评分数据或趋势数据显示问题

**需要检查的位置**:
1. 商户列表渲染时的数字字段
2. 健康度评分显示
3. 统计卡片数字
4. 趋势图数据

**可能的NaN来源**:
```tsx
// 可能的问题代码示例
{merchant.totalScore}           // ❌ 可能是 NaN
{merchant.rentToSalesRatio}     // ❌ 可能是 NaN
{stats.averageScore}            // ❌ 可能是 NaN
```

**修复模式** (应用到所有数字显示):
```tsx
// ✅ 正确的防护
{merchant.totalScore || 0}
{(merchant.rentToSalesRatio * 100).toFixed(1) || '0.0'}
{stats.averageScore?.toFixed(0) || 0}
```

---

## 调试步骤

### 1. 确认错误页面
- [ ] 访问首页 `/` 是否报错
- [ ] 访问 `/health` 是否报错
- [ ] 访问 `/inspection` 是否报错

### 2. 定位具体位置
- [ ] 检查 `app/page.tsx` 第 641 行附近代码
- [ ] 查找所有直接显示数字的地方: `grep -n "{.*\..*}" app/page.tsx`
- [ ] 查找所有 `.map()` 调用

### 3. 数据检查
- [ ] `mockMerchants` 数据中是否有 `totalScore` 为 undefined
- [ ] 计算字段（如租售比）是否可能产生 NaN

---

## Git提交记录

**Commit 1**: `2cf4d37` - 修复 inspectionService.ts
**Commit 2**: `27d5da0` - 修复 QuickRating 和 health-calculator

**待提交**: 首页 NaN 修复

---

## 下一步操作

1. **立即**: 检查 `app/page.tsx` (DashboardPage)
2. **查找**: 所有 `{...}` 包裹的数字显示
3. **修复**: 添加 `|| 0` 或可选链 `?.`
4. **验证**: 刷新首页确认错误消失
5. **提交**: Git commit 完整修复

---

## 相关文件清单

### 已修复 ✅
- `components/inspection/QuickCheckIn.tsx`
- `components/inspection/QuickRating.tsx`
- `skills/health-calculator.ts`
- `utils/inspectionService.ts`

### 待检查 🔍
- `app/page.tsx` (DashboardPage) ⭐ 错误源头
- `components/dashboard/*` (如有)
- `app/health/page.tsx` (可能)
- 其他显示商户数据的页面

---

## 临时解决方案

如果需要快速解决，可以：
1. 暂时注释掉首页的商户列表渲染
2. 或在 `mockMerchants` 数据中确保所有数字字段都有默认值

---

## Token 使用情况

- 当前使用: ~108,000 / 200,000
- 剩余: ~92,000
- 状态: ✅ 充足，可以继续调试

**建议**: 先提交当前代码，记录问题，然后继续排查首页。
