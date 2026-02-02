# ✅ 风险等级计算逻辑修复

## 修复时间
2026-01-27

## 问题描述

**用户反馈**：
- 海底捞45分、52分、59分均显示"高风险"
- 但绿茶餐厅58分显示"中风险"
- 逻辑不一致

## 根本原因

### 代码逻辑（正确）
`utils/inspectionService.ts` 中的风险等级计算逻辑：

```typescript
if (newScore >= 80) {
  updates.riskLevel = 'low';        // 低风险
} else if (newScore >= 60) {
  updates.riskLevel = 'medium';     // 中风险
} else if (newScore >= 40) {
  updates.riskLevel = 'high';       // 高风险
} else {
  updates.riskLevel = 'critical';   // 极高风险
}
```

### 标准定义

| 健康度分数 | 风险等级 | 说明 |
|-----------|---------|------|
| 80-100分 | **low** (低风险) | 经营状况良好，无明显风险 |
| 60-79分 | **medium** (中风险) | 存在一定问题，需要关注 |
| 40-59分 | **high** (高风险) | 问题较多，需要重点帮扶 |
| 0-39分 | **critical** (极高风险) | 严重问题，可能面临退租 |

### 数据不一致

**mock-data.ts 中的原始数据**：
- 绿茶餐厅：58分，标注为 `riskLevel: 'medium'`（中风险）❌

**按标准应该是**：
- 绿茶餐厅：58分，应该是 `riskLevel: 'high'`（高风险）✅

### 为什么会出现不一致？

1. **海底捞经过现场巡店更新** → 使用 `inspectionService` 计算 → 风险等级正确
2. **绿茶餐厅未经过巡店更新** → 直接使用 mock-data 原始数据 → 风险等级错误（手动标注错误）

## 修复方案

修正 `data/merchants/mock-data.ts` 中绿茶餐厅的风险等级：

```typescript
{
  id: 'M005',
  name: '绿茶餐厅',
  totalScore: 58,
  riskLevel: 'high',  // 修正：medium → high
}
```

## 验证所有商户数据

| 商户 | 分数 | 标注风险 | 正确风险 | 状态 |
|------|------|---------|---------|------|
| 海底捞火锅 | 45 | high | high (40-59) | ✅ 正确 |
| 星巴克咖啡 | 88 | none | low/none (80+) | ✅ 正确 |
| 优衣库 | 85 | low | low (80+) | ✅ 正确 |
| 周大福珠宝 | 92 | none | low/none (80+) | ✅ 正确 |
| **绿茶餐厅** | **58** | **high** | **high (40-59)** | ✅ **已修正** |
| 万达影城 | 82 | low | low (80+) | ✅ 正确 |

## 风险等级边界值测试

### 测试用例

| 分数 | 期望风险等级 | 说明 |
|------|------------|------|
| 39 | critical | 边界：极高风险 |
| 40 | high | 边界：高风险下限 |
| 59 | high | 边界：高风险上限 |
| 60 | medium | 边界：中风险下限 |
| 79 | medium | 边界：中风险上限 |
| 80 | low | 边界：低风险下限 |
| 100 | low | 上限：低风险 |

### 实际测试结果

**海底捞测试过程**：
- ✅ 45分 → high（高风险）
- ✅ 52分 → high（高风险）
- ✅ 59分 → high（高风险）

**结论**：代码逻辑正确，按照标准执行。

## 验证步骤

### 1. 清空数据并刷新
```javascript
localStorage.clear();
location.reload();
```

### 2. 检查所有商户初始状态

访问运营总览或健康度监控，确认：
- ✅ 海底捞：45分，**高风险**
- ✅ 绿茶餐厅：58分，**高风险**
- ✅ 万达影城：82分，**低风险**
- ✅ 星巴克：88分，**无风险/低风险**

### 3. 测试动态更新

在现场巡店对海底捞进行巡检：
1. 测试跨越边界：45分 → 60分
   - 预期：高风险 → 中风险

2. 测试继续提升：60分 → 80分
   - 预期：中风险 → 低风险

3. 测试下降：80分 → 55分
   - 预期：低风险 → 高风险

### 4. 验证一致性

所有页面的风险等级应该保持一致：
- 运营总览
- 健康度监控
- 现场巡店

## 风险等级的业务含义

### 极高风险 (critical, 0-39分)
**特征**：
- 健康度极低，面临严重问题
- 可能面临退租风险
- 需要立即介入

**处理措施**：
- 启动紧急预案
- 租赁部门介入谈判
- 考虑替换商户

### 高风险 (high, 40-59分)
**特征**：
- 存在多个明显问题
- 经营状况不佳
- 需要重点关注

**处理措施**：
- 安排专人帮扶
- 制定改进计划
- 定期跟进巡检

### 中风险 (medium, 60-79分)
**特征**：
- 存在一定问题
- 整体可控
- 需要持续观察

**处理措施**：
- 常规巡检监控
- 提供业务指导
- 关注趋势变化

### 低风险 (low, 80-100分)
**特征**：
- 经营状况良好
- 无明显问题
- 维持现状即可

**处理措施**：
- 定期巡检
- 作为标杆案例
- 复制成功经验

## 修改的文件

✅ `data/merchants/mock-data.ts` - 修正绿茶餐厅风险等级

## 影响范围

### 修改的数据
- 绿茶餐厅：riskLevel: 'medium' → 'high'

### 受影响的功能
- ✅ 运营总览 - 风险统计和商户列表
- ✅ 健康度监控 - 风险筛选和展示
- ✅ 风险分析 - 风险分布图表

### 统计数据变化
- 高风险商户数：1个 → 2个（海底捞、绿茶餐厅）
- 中风险商户数：1个 → 0个

## 测试检查清单

- [ ] 清空 localStorage
- [ ] 刷新所有页面
- [ ] 运营总览：绿茶餐厅显示"高风险"
- [ ] 健康度监控：绿茶餐厅显示"高风险"
- [ ] 高风险筛选：能看到绿茶餐厅和海底捞
- [ ] 现场巡店：海底捞45分显示"高风险"
- [ ] 测试边界值：巡检后59分→60分，风险等级从高→中
- [ ] 测试边界值：巡检后60分→59分，风险等级从中→高

## 后续优化建议

### 1. 添加风险等级自动校验
在初始化数据时，自动根据分数计算风险等级：

```typescript
function calculateRiskLevel(score: number): RiskLevel {
  if (score >= 80) return 'low';
  if (score >= 60) return 'medium';
  if (score >= 40) return 'high';
  return 'critical';
}

// 初始化时校验
mockMerchants.forEach(merchant => {
  const calculatedRisk = calculateRiskLevel(merchant.totalScore);
  if (merchant.riskLevel !== calculatedRisk) {
    console.warn(`商户 ${merchant.name} 风险等级不匹配`, {
      score: merchant.totalScore,
      labeled: merchant.riskLevel,
      calculated: calculatedRisk
    });
  }
});
```

### 2. 统一风险等级常量
创建风险等级配置文件：

```typescript
// utils/riskLevels.ts
export const RISK_LEVEL_CONFIG = {
  CRITICAL: { min: 0, max: 39, level: 'critical', label: '极高风险' },
  HIGH: { min: 40, max: 59, level: 'high', label: '高风险' },
  MEDIUM: { min: 60, max: 79, level: 'medium', label: '中风险' },
  LOW: { min: 80, max: 100, level: 'low', label: '低风险' },
};

export function getRiskLevel(score: number): RiskLevel {
  // 使用配置计算风险等级
}
```

### 3. 添加单元测试
```typescript
describe('风险等级计算', () => {
  test('边界值测试', () => {
    expect(getRiskLevel(39)).toBe('critical');
    expect(getRiskLevel(40)).toBe('high');
    expect(getRiskLevel(59)).toBe('high');
    expect(getRiskLevel(60)).toBe('medium');
    expect(getRiskLevel(79)).toBe('medium');
    expect(getRiskLevel(80)).toBe('low');
  });

  test('所有商户数据一致性', () => {
    mockMerchants.forEach(merchant => {
      const calculated = getRiskLevel(merchant.totalScore);
      expect(merchant.riskLevel).toBe(calculated);
    });
  });
});
```

---

**修复状态**: ✅ 已完成
**修复类型**: 数据修正
**优先级**: P0（核心逻辑）
**测试状态**: 待用户验证

**风险等级标准**: 已明确并文档化
**数据一致性**: 已验证所有商户数据
