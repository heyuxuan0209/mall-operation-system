# 风险等级标准规范（v2.0）

**制定日期**: 2026-01-27
**版本**: v2.0
**状态**: 正式标准 ✅

---

## 📋 标准概述

本文档定义了商场运营系统中商户风险等级的统一标准，适用于所有模块和页面。

---

## 🎯 5等级风险标准（v2.0统一标准）

| 风险等级 | 英文标识 | 分数范围 | 颜色 | UI类名 | 业务含义 |
|---------|---------|---------|------|--------|----------|
| 极高风险 | critical | 0-39分 | 🟣 紫色 | `bg-purple-100 text-purple-800` | 货空人去，随时跑路，需备商 |
| 高风险 | high | 40-59分 | 🔴 红色 | `bg-red-100 text-red-800` | 连续预警，失联，需帮扶 |
| 中风险 | medium | 60-79分 | 🟠 橙色 | `bg-orange-100 text-orange-800` | 严重预警，有经营意愿 |
| 低风险 | low | 80-89分 | 🟡 黄色 | `bg-yellow-100 text-yellow-800` | 缴费波动，经营尚可 |
| 无风险 | none | 90-100分 | 🟢 绿色 | `bg-green-100 text-green-800` | 指标正常，缴费准时 |

---

## 💻 技术实现

### TypeScript类型定义
```typescript
// types/index.ts
type RiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'none';
```

### 计算函数（标准实现）
```typescript
// skills/health-calculator.ts
export function calculateRiskLevel(totalScore: number): RiskLevel {
  if (totalScore >= 90) return 'none';      // 无风险：90-100分
  if (totalScore >= 80) return 'low';       // 低风险：80-89分
  if (totalScore >= 60) return 'medium';    // 中风险：60-79分
  if (totalScore >= 40) return 'high';      // 高风险：40-59分
  return 'critical';                        // 极高风险：0-39分
}
```

### UI辅助函数
```typescript
// 获取风险等级颜色
function getRiskColor(riskLevel: RiskLevel): string {
  const colors = {
    critical: 'bg-purple-100 text-purple-800',
    high: 'bg-red-100 text-red-800',
    medium: 'bg-orange-100 text-orange-800',
    low: 'bg-yellow-100 text-yellow-800',
    none: 'bg-green-100 text-green-800'
  };
  return colors[riskLevel];
}

// 获取风险等级文本
function getRiskText(riskLevel: RiskLevel): string {
  const texts = {
    critical: '极高风险',
    high: '高风险',
    medium: '中风险',
    low: '低风险',
    none: '无风险'
  };
  return texts[riskLevel];
}
```

---

## 📊 业务规则

### 健康度评分维度
风险等级基于商户的综合健康度评分，评分由以下5个维度加权计算：

1. **租金缴纳** (25%) - 逾期天数、欠费金额
2. **经营表现** (25%) - 营业额、坪效、客流量
3. **现场品质** (30%) - 陈列、环境、服务
4. **顾客满意度** (10%) - 评分、投诉
5. **抗风险能力** (10%) - 现金流、合同期限

> ⚠️ **v2.0权重优化**：Phase 1提升现场品质权重至30%（原20%），调整满意度和抗风险至10%（原15%）。

### 风险等级触发动作

| 风险等级 | 系统动作 | 人工干预 |
|---------|---------|---------|
| 极高风险 (critical) | 🚨 紧急预警 + 备选商户推荐 | 立即介入，准备替换方案 |
| 高风险 (high) | ⚠️ 高优先级任务 + 自动派单 | 24小时内启动帮扶 |
| 中风险 (medium) | 📋 创建帮扶任务 | 1周内跟进 |
| 低风险 (low) | 📝 定期观察 | 2周例行检查 |
| 无风险 (none) | ✅ 正常监控 | 月度抽查 |

### 边界值行为
- **临界点**: 39/40, 59/60, 79/80, 89/90分
- **计算规则**: 使用 `>=` 判断，临界值归入高等级
- **示例**:
  - 40分 → high（不是critical）
  - 60分 → medium（不是high）
  - 80分 → low（不是medium）
  - 90分 → none（不是low）

---

## 🔄 版本历史

### v2.0 (2026-01-27) - 当前标准
**变更**: 从4等级扩展为5等级
- **新增**: critical（极高风险）等级 (0-39分)
- **调整**: high等级从0-59分缩小为40-59分
- **原因**: 更精细的风险判断，避免极端情况被忽视

### v1.1 / v1.0 (2026-01-24及之前) - 已废弃
**旧标准**: 4等级
| 等级 | 分数 | 颜色 |
|------|------|------|
| high | 0-59 | 红色 |
| medium | 60-79 | 橙色 |
| low | 80-89 | 黄色 |
| none | 90-100 | 绿色 |

**废弃原因**: 0-59分跨度太大，无法区分"即将跑路"和"需要帮扶"

---

## ✅ 数据验证

### 验证脚本
在浏览器控制台运行以下脚本验证数据一致性：

```javascript
// 验证localStorage中的商户数据
const merchants = JSON.parse(localStorage.getItem('merchants') || '[]');

// 风险等级计算函数
const calculateRiskLevel = (score) => {
  if (score >= 90) return 'none';
  if (score >= 80) return 'low';
  if (score >= 60) return 'medium';
  if (score >= 40) return 'high';
  return 'critical';
};

// 验证每个商户
console.log('=== 商户风险等级验证 ===');
merchants.forEach(m => {
  const expected = calculateRiskLevel(m.totalScore);
  const match = m.riskLevel === expected ? '✅' : '❌';
  console.log(`${match} ${m.name}: ${m.totalScore}分 → ${m.riskLevel} (应为: ${expected})`);
});
```

### 边界值测试
```javascript
// 测试临界点
const testScores = [39, 40, 59, 60, 79, 80, 89, 90];
testScores.forEach(score => {
  const level = calculateRiskLevel(score);
  console.log(`${score}分 → ${level}`);
});

// 预期输出：
// 39分 → critical
// 40分 → high
// 59分 → high
// 60分 → medium
// 79分 → medium
// 80分 → low
// 89分 → low
// 90分 → none
```

---

## 📁 相关文件

### 核心文件（必须遵循本标准）
- `types/index.ts` - 类型定义
- `skills/health-calculator.ts` - 计算逻辑
- `app/page.tsx` - 首页展示
- `app/health/page.tsx` - 健康度监控
- `app/tasks/page.tsx` - 任务中心
- `utils/aiDiagnosis.ts` - AI诊断
- `utils/healthTrendPrediction.ts` - 趋势预测
- `utils/inspectionService.ts` - 巡检服务

### 数据文件
- `data/merchants/mock-data.ts` - 模拟数据

---

## ⚠️ 注意事项

### 1. 数据迁移
从v1.x升级到v2.0时：
- **推荐**: 清除localStorage重新初始化
- **或**: 运行验证脚本自动修正不匹配数据
- **命令**: `localStorage.clear(); location.reload();`

### 2. 开发规范
- **禁止**在业务代码中硬编码分数阈值
- **必须**使用`calculateRiskLevel()`函数
- **必须**使用`getRiskColor()`和`getRiskText()`辅助函数
- **禁止**创建新的风险等级计算逻辑

### 3. UI显示
- **必须**在所有页面使用统一的颜色映射
- **必须**保证移动端和桌面端显示一致
- **建议**使用徽章（badge）形式展示风险等级

---

## 🔗 参考文档

- [风险等级修复详细报告] → docs/issues/bug-fixes/RISK-LEVEL-FIX-V2.md
- [v2.0发布说明] → docs/releases/v2.0/RELEASE.md
- [健康度计算器文档] → skills/health-calculator.ts

---

**制定人**: Claude Sonnet 4.5
**审核人**: 何宇轩
**最后更新**: 2026-01-28

---

## 📚 历史修复记录

本标准的确立经历了多次迭代和修复：

### v1修复 (2026-01-27)
详见归档文档：[RISK-LEVEL-FIXED-v1.md](../archive/bug-fixes-history/RISK-LEVEL-FIXED-v1.md)

**主要问题**：
- 风险等级判断逻辑不一致
- 4等级标准无法区分"即将跑路"和"需要帮扶"
- 部分页面显示颜色不统一

**解决方案**：
- 建立统一的风险等级标准
- 扩展为5等级体系
- 统一所有页面的风险等级显示

### v2权重修复 (2026-01-28)
详见最新修复报告：[RISK-LEVEL-FIX-V2.md](../issues/bug-fixes/RISK-LEVEL-FIX-V2.md)

**主要问题**：
- 健康度计算权重文档与代码不一致
- 现场品质权重：文档20% vs 代码30%
- 顾客满意度权重：文档15% vs 代码10%
- 抗风险能力权重：文档15% vs 代码10%

**解决方案**：
- 统一所有文档至v2.0标准（30%/10%/10%）
- 在v1.0快照中标记旧标准为已废弃
- 添加版本说明避免混淆

### 当前版本
本文档为统一的风险等级标准（单一数据源），所有代码实现应遵循此标准。

**关键原则**：
- ✅ 代码是唯一真相来源
- ✅ 发现不一致时，以代码实现为准
- ✅ 所有文档应与代码保持同步
- ✅ 历史修复记录归档保存
