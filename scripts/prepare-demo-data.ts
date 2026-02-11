/**
 * 演示数据准备脚本
 * 用于录屏展示，预设对话场景
 */

import { conversationManager } from '@/utils/ai-assistant/conversationManager';
import type { Conversation } from '@/types/ai-assistant';

// 场景1：深度根因分析 - 海底捞案例
const scenario1: Conversation = {
  id: 'demo-root-cause-analysis',
  startedAt: new Date().toISOString(),
  lastMessageAt: new Date().toISOString(),
  merchantId: 'M001',
  merchantName: '海底捞火锅',
  messages: [
    {
      id: '1',
      role: 'user',
      content: '海底捞最近怎么样？',
      timestamp: new Date().toISOString(),
      conversationId: 'demo-root-cause-analysis',
    },
    {
      id: '2',
      role: 'assistant',
      content: `海底捞当前健康度为45分，处于高风险状态。

📊 关键指标：
- 健康度：45分（高风险）
- 营收：47.1万元（环比↓8.5%）
- 翻台率：1.2次/天（严重偏低）
- 租售比：28%（超标）

五维评分：
- 收缴能力：60分
- 运营能力：35分 ⚠️
- 现场质量：50分
- 顾客评价：45分
- 抗风险能力：35分 ⚠️`,
      timestamp: new Date().toISOString(),
      conversationId: 'demo-root-cause-analysis',
    },
    {
      id: '3',
      role: 'user',
      content: '有什么问题？深入分析一下',
      timestamp: new Date().toISOString(),
      conversationId: 'demo-root-cause-analysis',
    },
    {
      id: '4',
      role: 'assistant',
      content: `经过深度诊断，发现2个核心问题：

## 1. 核心问题

### 问题1：翻台率严重偏低 ⚠️
- **影响程度**：导致营收损失约30%

**根本原因**：
- 位置劣势（L4次动线，客流不足）- 权重45%
- 服务效率低（等位45分钟，用餐90分钟）- 权重55%

**数据支撑**：
- 翻台率：1.2次/天 vs 行业2-3次（低40-60%）
- 日均客流：800人 vs 同面积1200人（低33%）
- 用餐时长：90分钟 vs 标准60分钟（超标50%）

### 问题2：成本结构失衡
- **影响程度**：利润空间压缩

**根本原因**：营收低 + 租金刚性

**数据支撑**：租售比28% vs 警戒线20%（超标40%）

## 2. 因果关系链

\`\`\`
位置劣势(L4) → 客流不足(800人) → 翻台率低(1.2次) → 营收下降(-8.5%) → 租售比高(28%)
\`\`\``,
      timestamp: new Date().toISOString(),
      conversationId: 'demo-root-cause-analysis',
    },
    {
      id: '5',
      role: 'user',
      content: '怎么办？给具体建议',
      timestamp: new Date().toISOString(),
      conversationId: 'demo-root-cause-analysis',
    },
    {
      id: '6',
      role: 'assistant',
      content: `基于根因分析，给出3个落地建议：

## ✅ 建议1：优化服务流程（立即执行）

**具体措施**：
1. 精简菜单（减少20%复杂菜品）
2. 优化后厨动线（缩短出餐时间）
3. 引入扫码点餐（减少错单率）
4. 设置翻台率KPI（目标1.8次/天）

**预期效果**：
- 用餐时长：90分钟 → 60分钟（-33%）
- 翻台率：1.2次 → 1.8次（+50%）
- 日增营收：约8万元
- 3个月后营收提升：+25%

**可行性**：★★★★★（内部可控，成本低，见效快）

**参考案例**：绿茶餐厅
- 问题：菜品过多，出餐慢，翻台率1.5次
- 方案：精简菜单120道→60道
- 结果：翻台率1.5→2.3次，营收+35%

---

## ✅ 建议2：启动降租谈判（1周内）

**具体措施**：
1. 准备3个月经营数据报告
2. 对比同楼层商户租金
3. 提出降租15-20%的诉求

**预期效果**：
- 租金：13.2万 → 11万（-17%）
- 租售比：28% → 23%
- 年节省：26万元

**可行性**：★★★☆☆（需要谈判）

**参考案例**：刘一锅火锅
- 问题：租售比32%，濒临关店
- 方案：数据化谈判，降租20%
- 结果：租售比32%→25%，扭亏为盈

---

## ⚠️ 建议3：位置调整（长期规划）

**具体措施**：合约到期后考虑搬到L1-L2

**预期效果**：客流提升50%

**可行性**：★★☆☆☆（成本高，周期长）

## 行动优先级
1. 【高】立即优化服务流程
2. 【高】启动降租谈判
3. 【低】位置调整`,
      timestamp: new Date().toISOString(),
      conversationId: 'demo-root-cause-analysis',
      metadata: {
        suggestedActions: [
          {
            type: 'create_task',
            merchantId: 'M001',
            merchantName: '海底捞火锅'
          },
          {
            type: 'navigate_inspection',
            merchantId: 'M001',
            merchantName: '海底捞火锅'
          }
        ]
      }
    }
  ],
  status: 'active',
};

// 场景2：快速问题诊断
const scenario2: Conversation = {
  id: 'demo-quick-diagnosis',
  startedAt: new Date().toISOString(),
  lastMessageAt: new Date().toISOString(),
  merchantId: 'M002',
  merchantName: '星巴克咖啡',
  messages: [
    {
      id: '1',
      role: 'user',
      content: '星巴克有什么风险？',
      timestamp: new Date().toISOString(),
      conversationId: 'demo-quick-diagnosis',
    },
    {
      id: '2',
      role: 'assistant',
      content: `星巴克当前健康度为72分，处于中风险状态。

主要风险点：
1. 顾客满意度下降（NPS从15降至-5）
2. 复购率偏低（仅35%，行业标准50%+）
3. 员工流失率高（年流失率45%）

建议：
- 立即开展顾客满意度调研
- 优化员工培训和激励机制
- 关注服务质量和产品稳定性`,
      timestamp: new Date().toISOString(),
      conversationId: 'demo-quick-diagnosis',
    }
  ],
  status: 'active',
};

// 场景3：对比分析
const scenario3: Conversation = {
  id: 'demo-comparison',
  startedAt: new Date().toISOString(),
  lastMessageAt: new Date().toISOString(),
  messages: [
    {
      id: '1',
      role: 'user',
      content: '对比一下海底捞和星巴克',
      timestamp: new Date().toISOString(),
      conversationId: 'demo-comparison',
    },
    {
      id: '2',
      role: 'assistant',
      content: `对比分析：

| 指标 | 海底捞 | 星巴克 |
|------|--------|--------|
| 健康度 | 45分（高风险） | 72分（中风险） |
| 核心问题 | 翻台率低、租售比高 | 顾客满意度下降 |
| 根本原因 | 位置+服务效率 | 服务质量+员工流失 |
| 紧急度 | 高 | 中 |

**关键差异**：
- 海底捞是结构性问题（位置+成本），需要系统性改善
- 星巴克是管理性问题（服务+人员），相对容易解决

**优先级**：海底捞更紧急，建议优先处理`,
      timestamp: new Date().toISOString(),
      conversationId: 'demo-comparison',
    }
  ],
  status: 'active',
};

/**
 * 加载演示数据到 localStorage
 */
export function loadDemoData() {
  try {
    // 直接保存到 localStorage（因为 saveConversation 是私有方法）
    const STORAGE_KEY = 'ai_assistant_conversations';
    const existingData = localStorage.getItem(STORAGE_KEY);
    const conversations = existingData ? JSON.parse(existingData) : [];

    // 添加演示场景（如果不存在）
    const scenarios = [scenario1, scenario2, scenario3];

    scenarios.forEach(scenario => {
      const exists = conversations.find((c: any) => c.id === scenario.id);
      if (!exists) {
        conversations.push(scenario);
      }
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));

    console.log('✅ 场景1已加载：深度根因分析 - 海底捞');
    console.log('✅ 场景2已加载：快速问题诊断 - 星巴克');
    console.log('✅ 场景3已加载：对比分析');
    console.log('\n🎬 演示数据加载完成！可以开始录屏了。');
    console.log('💡 提示：在AI助手中选择对应的对话即可查看演示内容。');
  } catch (error) {
    console.error('❌ 加载演示数据失败:', error);
  }
}

// 如果直接运行此脚本
if (typeof window !== 'undefined') {
  loadDemoData();
}
