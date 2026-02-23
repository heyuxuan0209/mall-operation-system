/**
 * Demo Mode - 演示模式固定响应
 *
 * 用途：确保演示视频中AI响应与旁白音频完全一致
 * 使用：设置环境变量 NEXT_PUBLIC_DEMO_MODE=true
 */

export interface DemoResponse {
  content: string;
  intent: string;
  suggestedActions?: Array<{
    type: string;
    merchantId?: string;
    merchantName?: string;
  }>;
}

/**
 * 演示模式固定响应库
 * 键：用户输入（精确匹配）
 * 值：固定的AI响应内容
 */
export const DEMO_RESPONSES: Record<string, DemoResponse> = {
  // ========== 第二幕：智能诊断 ==========

  "海底捞健康度如何": {
    content: `海底捞火锅当前健康度为**较差（45/100）**，整体处于**高风险状态**，需重点关注经营表现、顾客满意度及抗风险能力等薄弱环节。

📊 **经营概览**：
- **翻台率**：1.2次/天（⚠️ 严重偏低，行业标准2-3次）
- **NPS净推荐值**：-10（⚠️ 顾客不满意）
- **员工流失率**：40%（⚠️ 人员不稳定）
- **位置**：4楼+次动线（⚠️ 位置劣势）

💡 **建议**：优先启动「降本重组 + 竞品对标」组合策略，如优化租售结构、对标周边火锅竞品升级菜品与体验。`,
    intent: 'health_query',
    suggestedActions: [{
      type: 'view_health',
      merchantId: 'M001',
      merchantName: '海底捞火锅'
    }]
  },

  "对海底捞问题诊断分析": {
    content: `📋 **海底捞火锅 - 风险诊断报告**

🔍 **主要风险点**：

**1. 位置劣势（根本原因）**
• 4楼+次动线，自然客流少
• 可见度低，难以吸引路过顾客

**2. 经营表现恶化（连锁反应）**
• 翻台率1.2次/天 → 营收不足
• NPS -10 → 口碑下滑
• 员工流失率40% → 服务质量波动

**3. 恶性循环形成**
位置差 → 客流少 → 营收低 → 成本压力 → 服务降级 → 顾客不满 → 更少客流

📚 **建议参考案例**：
• **CASE_001_MCD**：麦当劳冷区位置问题（成功率85%）
• **CASE_023_LIUYIGUO**：刘一锅翻台率提升案例（成功率78%）

🎯 **策略方向**：流量突围 + 会员激活 + 线上引流`,
    intent: 'risk_diagnosis',
    suggestedActions: [{
      type: 'view_knowledge',
      merchantId: 'M001',
      merchantName: '海底捞火锅'
    }]
  },

  // ========== 第三幕：档案查询与方案推荐 ==========

  "海底捞历史上有过帮扶记录吗": {
    content: `📂 **海底捞火锅 - 历史帮扶档案**

系统显示该商户有**2次历史帮扶记录**：

**1️⃣ 2024年Q1帮扶（已结案）**
• **问题**：客流下滑20%
• **措施**：线上营销活动 + 菜品优化
• **效果**：翻台率从0.9提升至1.5（✅ 提升67%）

**2️⃣ 2024年Q2帮扶（执行中）**
• **问题**：员工流失率攀升
• **措施**：薪酬调整 + 培训激励
• **当前状态**：流失率从50%降至35%（进行中）

💡 点击下方按钮查看完整档案详情 ↓`,
    intent: 'archive_query',
    suggestedActions: [{
      type: 'view_archives',
      merchantId: 'M001',
      merchantName: '海底捞火锅'
    }]
  },

  "有什么好的帮扶方案吗": {
    content: `🎯 **海底捞问题详细分析和帮扶建议**

基于知识库**3个相似成功案例**：

📋 **案例1：CASE_001_MCD 麦当劳**（冷区位置问题，成功率85%）
**策略**：流量突围 + 营销补位
**措施**：
• 美团霸王餐活动（日均引流200+）
• 会员充值送券（提升复购30%）
• 落地窗改造（可见度提升50%）

📋 **案例2：CASE_023_LIUYIGUO 刘一锅**（翻台率提升，成功率78%）
**策略**：运营效率优化
**措施**：
• 用餐时段分流（高峰期预约制）
• 菜品组合优化（缩短上菜时间15%）
• 服务流程SOP标准化

📋 **案例3：CASE_002_TAIER 太二酸菜鱼**（品牌老化，成功率72%）
**策略**：产品升级 + 体验创新
**措施**：
• 新品开发（季节限定款）
• 场景营销（拍照打卡区）
• 会员日福利（每周三5折）

---

🎯 **针对海底捞的定制化方案**：

**【阶段1】紧急止血（1-2周）**
✓ 启动美团霸王餐活动
✓ 推出充值送券（充500送200）
✓ 优化高峰时段排队体验

**【阶段2】系统改善（1-2月）**
✓ 与商场协商位置调整可行性
✓ 增加导视标识（电梯口、扶梯处）
✓ 推出火锅特色会员体系

**【阶段3】长效机制（3-6月）**
✓ 建立线上线下融合运营体系
✓ 培养核心顾客社群
✓ 定期新品开发保持吸引力

**📈 预期效果**：
• 翻台率提升至2.0次/天（↑67%）
• NPS从-10提升至+30（转正）
• 健康度从45分提升至75分（中等风险→低风险）

💡 点击下方按钮立即创建帮扶任务 ↓`,
    intent: 'solution_recommend',
    suggestedActions: [{
      type: 'create_task',
      merchantId: 'M001',
      merchantName: '海底捞火锅'
    }]
  },

  // ========== 第四幕：效果评估 ==========

  "海底捞和上月对比怎么样": {
    content: `📊 **海底捞火锅 - 效果评估报告**（措施执行2周后）

**对比数据（本月 vs 上月）**：

| 指标 | 本月 | 上月 | 变化 | 状态 |
|------|------|------|------|------|
| 健康度评分 | 68分 | 45分 | ↑23分 | ✅ 显著改善 |
| 翻台率 | 1.8次 | 1.2次 | ↑50% | ✅ 接近目标 |
| NPS净推荐值 | +15 | -10 | ↑25 | ✅ 转正 |
| 日均客流 | 320人 | 210人 | ↑52% | ✅ 大幅提升 |
| 现场品质评分 | 75分 | 60分 | ↑15分 | ✅ 改善明显 |

💡 **关键改善点**：
1. 导视牌增加后，新客占比从15%提升至35%
2. 美团活动日均引流80+人
3. 落地窗改造后可见度显著提升
4. 风险等级从"高风险"降为"中等风险"

⚠️ **仍需关注**：
• 翻台率未达到目标2.0次/天，需继续优化
• 会员体系刚上线，复购率提升效果待观察

📈 **趋势预测**：
如保持当前措施，预计1个月后健康度可达75分（低风险）`,
    intent: 'comparison_query',
    suggestedActions: [{
      type: 'view_health',
      merchantId: 'M001',
      merchantName: '海底捞火锅'
    }]
  },

  "把这次海底捞帮扶经验沉淀到知识库": {
    content: `✅ **已自动生成案例草稿**

📋 **案例信息**：
• **案例ID**：CASE_032
• **商户**：海底捞火锅（餐饮-火锅）
• **根本原因**：位置劣势 + 导视缺失
• **诊断**：4楼+次动线 → 自然客流不足 → 翻台率低 → 顾客不满
• **策略**：流量突围 + 导视优化 + 会员激活
• **具体措施**：
  1. 商场电梯口增加指示牌
  2. 美团霸王餐日均引流80+
  3. 落地窗改造清除遮挡物
  4. 充值送券活动
• **效果**：
  - 健康度：45分 → 68分（↑23分）
  - 翻台率：1.2次 → 1.8次（↑50%）
  - NPS：-10 → +15（转正）
• **成功率**：78%（基于2周数据）
• **适用业态**：餐饮-火锅，位置劣势商户

是否保存到知识库？`,
    intent: 'general_chat',
    suggestedActions: [{
      type: 'view_knowledge'
    }]
  }
};

/**
 * 检查是否启用演示模式
 */
export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
}

/**
 * 获取演示模式的固定响应
 * @param query 用户输入
 * @returns 固定响应内容，如果不在演示库中则返回null
 */
export function getDemoResponse(query: string): DemoResponse | null {
  if (!isDemoMode()) {
    return null;
  }

  // 精确匹配
  const exactMatch = DEMO_RESPONSES[query];
  if (exactMatch) {
    console.log('[DemoMode] 精确匹配:', query);
    return exactMatch;
  }

  // 模糊匹配（去除空格、标点后匹配）
  const normalizedQuery = query.replace(/[，。！？\s]/g, '').toLowerCase();
  for (const [key, value] of Object.entries(DEMO_RESPONSES)) {
    const normalizedKey = key.replace(/[，。！？\s]/g, '').toLowerCase();
    if (normalizedQuery === normalizedKey) {
      console.log('[DemoMode] 模糊匹配:', query, '→', key);
      return value;
    }
  }

  console.log('[DemoMode] 未找到匹配的演示响应:', query);
  return null;
}

/**
 * 获取所有演示问题列表（用于UI提示）
 */
export function getDemoQuestions(): string[] {
  return Object.keys(DEMO_RESPONSES);
}
