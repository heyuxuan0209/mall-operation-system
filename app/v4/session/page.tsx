'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import {
  AlertTriangle, ChevronLeft, Zap, Clock, Send,
  CheckCircle2, ArrowRight, FastForward, Pause, Play,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   1. TYPES
═══════════════════════════════════════════════════════════════ */
type AgentId = 'risk' | 'advisor' | 'campaign' | 'inspector' | 'memory' | 'scheduler';
type MsgType = 'agent' | 'ceo' | 'system' | 'plan-card' | 'exec-card';
type Phase = 'discovery' | 'diagnosis' | 'solution' | 'decision' | 'execution';

interface Message {
  id: string;
  type: MsgType;
  agentId?: AgentId;
  tag?: string;
  content?: string;
  timestamp: string;
  phase?: Phase;
  replyTo?: string;
}

interface ScriptItem {
  type: MsgType;
  agentId?: AgentId;
  tag?: string;
  content?: string;
  phase?: Phase;
  replyTo?: string;
  typingMs?: number;   // how long typing indicator shows before message
  pauseMs?: number;    // pause after this message before next
  waitForCEO?: boolean; // pause autoplay here
}

/* ═══════════════════════════════════════════════════════════════
   2. AGENT DEFINITIONS
═══════════════════════════════════════════════════════════════ */
const AGENTS: Record<AgentId, {
  name: string; role: string;
  color: string; bg: string; border: string; textColor: string; dot: string;
}> = {
  risk: {
    name: '风险诊断师', role: '数据异动感知 · 风险定级',
    color: '#f43f5e', bg: '#fff1f2', border: '#fecdd3', textColor: '#be123c', dot: 'bg-rose-500',
  },
  advisor: {
    name: '商户经营顾问', role: '经营逻辑解读 · 根因诊断',
    color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe', textColor: '#1d4ed8', dot: 'bg-blue-500',
  },
  campaign: {
    name: '活动策略师', role: '流量转化分析 · 方案设计',
    color: '#d97706', bg: '#fffbeb', border: '#fde68a', textColor: '#b45309', dot: 'bg-amber-500',
  },
  inspector: {
    name: '巡店督导', role: '现场执行观察 · 问题记录',
    color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', textColor: '#15803d', dot: 'bg-green-500',
  },
  memory: {
    name: '案例记忆官', role: '历史案例检索 · 经验引用',
    color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc', textColor: '#0e7490', dot: 'bg-cyan-500',
  },
  scheduler: {
    name: '任务调度官', role: '执行资源估算 · 任务编排',
    color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', textColor: '#6d28d9', dot: 'bg-violet-500',
  },
};

/* ═══════════════════════════════════════════════════════════════
   3. FULL CONVERSATION SCRIPT
═══════════════════════════════════════════════════════════════ */
const SCRIPT: ScriptItem[] = [
  {
    type: 'system',
    content: '会商已触发 · 今日 09:23 · 风险诊断师发起 · 议题：望潮港火锅续约风险升级',
    phase: 'discovery', pauseMs: 400,
  },
  {
    type: 'agent', agentId: 'risk', tag: '发现问题', phase: 'discovery', typingMs: 1800, pauseMs: 600,
    content: `在今早 09:23 的例行扫描中，我检测到**望潮港火锅（B2-08）**出现多项关键异常：

- 租约剩余 **91 天**，已进入续约高风险窗口期（<120天触发预警）
- 过去 90 天坪效持续下滑 **22%**（¥6,200 → ¥4,836 / ㎡ / 月）
- 本月客诉量 **18 条**，环比 +35%，主要集中在等位体验和消费性价比

综合评级：**高危**。按历史数据，当前指标组合下续约失败概率超过 **60%**。

建议立即启动全员会商，**干预窗口约剩 45 天**，今日是最佳介入时点。`,
  },
  {
    type: 'agent', agentId: 'advisor', tag: '补充数据', phase: 'discovery', typingMs: 2200, pauseMs: 600,
    replyTo: '风险诊断师',
    content: `我调取了该商户过去 6 个月的完整运营数据，有一个关键发现需要补充：

**坪效下滑的原因不是客流减少，而是人均消费下降。**

| 指标 | 3 个月前 | 当前 | 变化 |
|------|---------|------|------|
| 月均客流 | 4,850 人 | 4,720 人 | **−2.7%**（轻微） |
| 人均消费 | ¥138 | ¥121 | **−12.3%**（显著） |
| 翻台率 | 3.1次/天 | 2.9次/天 | −6.5% |

客人还在来，但每次消费的金额越来越低。这意味着问题出在**商户让客户花钱的能力上**，而不是位置或外部竞争因素。`,
  },
  {
    type: 'system',
    content: '进入诊断阶段 · 多角度补充中',
    phase: 'diagnosis', pauseMs: 300,
  },
  {
    type: 'agent', agentId: 'campaign', tag: '活动数据', phase: 'diagnosis', typingMs: 1800, pauseMs: 600,
    content: `从活动与流量转化角度补充：

过去 60 天，该商户**参与了商场 2 次大型促销活动**（3 月周年庆、4 月春季节）。

活动期间客流峰值 +18%，但**活动结束后第 2 周即回落至原水平**，复购转化率不足 8%。

对比 B 区表现较好的同类商户（某川菜，同期活动参与率相同）：活动后复购率 **21%**，是望潮港的 2.6 倍。

说明望潮港存在明显的**"引流不留客"问题**——有流量，但没有把流量转化为忠实消费者的能力。`,
  },
  {
    type: 'agent', agentId: 'inspector', tag: '现场记录', phase: 'diagnosis', typingMs: 1600, pauseMs: 600,
    content: `我调阅了 **3 月 15 日** 的现场巡检记录，补充以下现场观察：

1. **菜单价格带集中**：套餐主要分布在 ¥130–180 区间，缺乏 ¥89–109 的高性价比引流产品
2. **导购能力弱**：3 次巡检中，2 次观察到客人落座超过 4 分钟无人主动介绍推荐套餐
3. **等位动线问题**：等位区与就餐区通道交叉，巡检当日观察到至少 2 组客人因等位区嘈杂选择离开
4. **菜单陈列老化**：纸质菜单有折痕，图片模糊，无法传达产品差异化

这些现场问题直接解释了为什么客流稳定但人均消费持续下滑。`,
  },
  {
    type: 'agent', agentId: 'memory', tag: '历史案例', phase: 'diagnosis', typingMs: 2000, pauseMs: 600,
    content: `在案例库中检索到 **1 个高度相似案例**，正在调取——

---

📁 **案例 #2024-087** · 相似度 **87%**

- 商户类型：正餐·火锅，主力店，建筑面积 780 ㎡
- 介入时间：租约剩余 **98 天**
- 当时问题：坪效下滑 19%，人均消费降低，即将续约

**采用策略**：套餐重组（新增引流价格带）+ 2 轮运营辅导 + 1 次主题联名活动

**执行周期**：6 周

**结果**：坪效回升 **+18%**，成功续约，续约价格较原合同**上浮 3%**

---

另有 2 个中等相似案例（#2023-156 相似度 71%，#2024-031 相似度 68%），核心策略相近，平均效果：坪效回升 +14%。`,
  },
  {
    type: 'agent', agentId: 'advisor', tag: '综合结论', phase: 'diagnosis', typingMs: 2400, pauseMs: 800,
    content: `综合以上五方面信息，我的根因判断如下：

**核心问题：套餐结构老化 → 消费引导能力弱 → 人均消费持续下滑**

具体机制：
- **没有低价引流产品**：新客进入成本高，第一次消费体验难超预期
- **导购能力薄弱**：服务员无法有效引导消费，复购和加点率低
- **套餐无差异化卖点**：无法驱动口碑传播，老客带新客的能力弱

**可以排除的因素**：
- ❌ 位置问题（客流基本稳定）
- ❌ 品质问题（投诉主要集中在等位和价格感知，非食品质量）
- ❌ 外部竞争（同期 B 区同类商户表现正常）

**干预方向**：重点应放在**菜单改版 + 导购培训**，而非促销活动。`,
  },
  {
    type: 'system',
    content: '根因已确认 · 进入方案讨论阶段',
    phase: 'solution', pauseMs: 400,
  },
  {
    type: 'agent', agentId: 'campaign', tag: '提出方案 A', phase: 'solution', typingMs: 2000, pauseMs: 600,
    content: `基于根因诊断，我提出 **方案 A：套餐结构重组**

**执行内容：**
1. 新增引流套餐（¥89 / 人），主打工作日午餐和双人小份场景
2. 重组主力套餐价格带（¥128–158），增加季节性食材和差异化卖点
3. 设计新版菜单陈列（图片、推荐标签、套餐对比）
4. 配合 2 次服务员导购话术培训

**预期效果：**
- 人均消费止跌，目标恢复至 ¥130 左右（+7%）
- 坪效回升预期 **+15% ~ +20%**
- 复购率提升 **+8% ~ +12%**

**执行周期：4 周**（可在租约到期前完成数据验证，支撑续约谈判）`,
  },
  {
    type: 'agent', agentId: 'scheduler', tag: '执行估算 · 备选方案 B', phase: 'solution', typingMs: 2200, pauseMs: 600,
    content: `**方案 A 资源评估：**

| 项目 | 内容 | 成本估算 |
|------|------|---------|
| 运营人力 | 1 名运营专员 × 4 周 | 约 ¥1.5 万 |
| 菜单设计 | 外包设计 + 印刷更换 | 约 ¥0.3 万 |
| 导购培训 | 2 次，共 4 小时 | 内部资源 |
| **合计** | | **约 ¥1.8 万** |

---

**方案 B（备选）：短期联名活动**

与周边品牌联名快闪，预计 2 周内见效，客流峰值预期 +25%。

但：执行成本约 ¥3–5 万，且活动结束后**未解决消费引导根本问题**。基于案例记忆官刚才提到的历史数据，类似补贴效果平均持续仅 18 天，风险较高。`,
  },
  {
    type: 'agent', agentId: 'risk', tag: '风险对比', phase: 'solution', typingMs: 1600, pauseMs: 600,
    content: `两个方案的风险评级：

**方案 A — 风险：中等 ⚠️**
- 菜单切换期（第 1–2 周）可能有短暂营业额波动，预估 −5% 以内
- 导购培训效果依赖商户员工配合度
- 但执行风险可控，4 周内可完成数据验证，窗口期充裕

**方案 B — 风险：高 🔴**
- 活动 ROI 不稳定，超预算概率约 40%
- 活动结束后若数据回落，续约谈判将更被动
- 历史数据显示：类似补贴活动，12 例中仅 4 例成功续约（成功率 33%）

**综合判断**：从续约窗口期角度，**方案 A 更适合当前时间节点**，预算更低，效果更持久。`,
  },
  {
    type: 'agent', agentId: 'memory', tag: '历史验证', phase: 'solution', typingMs: 1400, pauseMs: 400,
    content: `用历史数据验证两个方案：

**类方案 A（套餐重组 + 运营辅导）：**
- 样本：**23 个**
- 实现坪效回升：19 个（**83%**）
- 顺利续约：17 个（**74%**）
- 平均坪效回升幅度：+16%

**类方案 B（短期活动补贴）：**
- 样本：**12 个**
- 活动期间数据改善：10 个（83%，活动期效果不差）
- 活动后持续改善 > 30 天：4 个（**33%**）
- 顺利续约：4 个（**33%**）

**结论：方案 A 历史续约成功率是方案 B 的 2.24 倍。**`,
  },
  {
    type: 'plan-card',
    phase: 'decision',
    waitForCEO: true,
    pauseMs: 0,
  },
];

/* ═══════════════════════════════════════════════════════════════
   4. CEO QUICK QUESTIONS (with pre-scripted agent responses)
═══════════════════════════════════════════════════════════════ */
interface CeoQuestion {
  id: string; label: string;
  response: { agentId: AgentId; tag: string; content: string; typingMs: number };
}

const CEO_QUICK_QUESTIONS: CeoQuestion[] = [
  {
    id: 'q_why_high_risk',
    label: '为什么续约失败概率超过 60%？',
    response: {
      agentId: 'risk', tag: '回应 CEO', typingMs: 1800,
      content: `这个数字来自我们过去 18 个月的历史统计：

当一个商户同时满足以下三个条件时，我们统计的续约失败率为 **62%**：
1. 租约剩余 < 120 天
2. 坪效下滑持续超过 2 个月且幅度 > 15%
3. 当月客诉量环比 > 20%

望潮港目前三项全部符合，且坪效下滑幅度（22%）超过了历史平均阈值。这也是我将其列为"高危"而非"中危"的依据。

当然，这是统计概率，不是定论——正因如此，今天的会商和干预才至关重要。`,
    },
  },
  {
    id: 'q_why_not_subsidy',
    label: '为什么不先做活动补贴？',
    response: {
      agentId: 'campaign', tag: '回应 CEO', typingMs: 2000,
      content: `这是个好问题，我来解释为什么不建议以活动补贴为主要手段：

活动补贴能解决的是**流量不足**的问题，但望潮港当前的核心问题是**承接流量后的消费转化能力弱**。

具体来说：
- 活动期间我们引入更多客人，但如果套餐结构和导购能力没有改变，这些新客人的消费体验不会更好，复购率不会提升
- 案例记忆官提到 #2023-091：连续做了 2 次补贴活动，效果分别只持续了 21 天和 15 天，活动后坪效比活动前**更低**（因为商户为了配合活动做了折扣，利润受损）

**活动可以作为套餐改版后的锦上添花，但不能作为主要手段。**
如果预算允许，可以在方案 A 执行第 3 周后，叠加一次小型联名活动验证效果。`,
    },
  },
  {
    id: 'q_budget_30k',
    label: '如果预算只有 3 万，方案 A 还能推进吗？',
    response: {
      agentId: 'scheduler', tag: '回应 CEO', typingMs: 1600,
      content: `完全可以，方案 A 本来就在预算范围内。

方案 A 核心成本约 **¥1.8 万**，3 万的预算有充裕余量，甚至可以：
- 增加 1 次额外的菜单焦点测试（用小批量印刷测试 2–3 个套餐方案，再全量推）
- 增加 1 次中期复盘会（第 2 周，由我们运营团队协助商户调整节奏）

如果预算更紧，比如 **1.5 万以内**，也可以推进精简版：
- 聚焦菜单价格带重组（不改视觉设计，只调套餐内容和价格）
- 导购培训改为线上 1 次
- 预期效果会相对保守：坪效回升目标调整为 +10% ~ +13%，仍足够支撑续约谈判。`,
    },
  },
  {
    id: 'q_case_why',
    label: '案例 #2024-087 为什么适用于当前情况？',
    response: {
      agentId: 'memory', tag: '回应 CEO', typingMs: 1800,
      content: `我来解释相似度 87% 的具体依据：

**高度匹配的维度（权重高）：**
- ✅ 业态类型：正餐·火锅（完全一致）
- ✅ 门店规模：780㎡ vs 望潮港 820㎡（相近）
- ✅ 问题类型：人均消费下滑 + 租约临期（完全一致）
- ✅ 当时指标：坪效下滑 19% vs 当前 22%（相近区间）

**存在差异的维度（权重低）：**
- ⚠️ 所在城市商业体能级：案例 #2024-087 是一线城市购物中心，望潮港所在商场为新一线（消费力略有差异）
- ⚠️ 介入时间点：案例是租约剩余 98 天介入，当前 91 天（略晚，但仍在窗口期内）

**综合评估：差异对策略方向影响不大，主要影响预期效果幅度**（即我估计的 +15~20% 中，低值更保守）。`,
    },
  },
];

/* ═══════════════════════════════════════════════════════════════
   5. EXECUTION SCRIPT (plays after decision)
═══════════════════════════════════════════════════════════════ */
const getExecScript = (plan: 'A' | 'B'): ScriptItem[] => [
  {
    type: 'system',
    content: `CEO 已拍板 · 采纳方案 ${plan} · 进入执行阶段`,
    phase: 'execution', pauseMs: 400,
  },
  {
    type: 'agent', agentId: 'scheduler', tag: '执行计划', phase: 'execution', typingMs: 2000, pauseMs: 600,
    content: plan === 'A'
      ? `收到。基于方案 A，我已生成以下执行任务：

**任务 T-001** · 帮扶任务 · 今日启动
负责人：张运营 | 截止：明日 18:00
→ 约谈望潮港负责人，传达优化方向，确认配合意愿

**任务 T-002** · 帮扶任务 · 3 天内
负责人：张运营 + 设计团队 | 截止：4 月 30 日
→ 输出套餐重组方案（新增引流套餐 + 价格带调整）

**任务 T-003** · 帮扶任务 · 第 2 周
负责人：李运营（导购培训专员）| 截止：5 月 5 日
→ 第一轮导购话术培训（2 小时，参与商户全员服务人员）

**任务 T-004** · 巡店任务 · 第 3 周
负责人：巡店督导 | 截止：5 月 12 日
→ 中期巡检：验证菜单落地情况，记录导购执行质量

**任务 T-005** · 复盘任务 · 第 5 周
负责人：风险诊断师（自动触发）| 截止：5 月 24 日
→ 最终效果评估，输出续约谈判支撑数据报告

**已分配给运营团队，预计 5 月 24 日完成全部跟进。**`
      : `收到。基于方案 B，我已生成以下执行任务：

**任务 T-001** · 沟通任务 · 今日启动
→ 联系潜在联名品牌，确认档期和资源

**任务 T-002** · 帮扶任务 · 3 天内
→ 完成联名活动策划方案，提交运营审批

**任务 T-003** · 执行任务 · 第 2 周
→ 活动上线执行，配合商场整体推广资源

**任务 T-004** · 复盘任务 · 活动结束后 1 周
→ 评估活动效果，决策是否叠加方案 A 的套餐优化

**注意：** 风险诊断师将在活动结束后持续监控坪效变化，如出现回落将自动触发二次干预建议。`,
  },
  {
    type: 'agent', agentId: 'memory', tag: '经验沉淀', phase: 'execution', typingMs: 1200, pauseMs: 0,
    content: `本次会商记录将沉淀为案例 **#2025-042**，收录至组织记忆中心。

沉淀内容包括：
- 问题定义与根因诊断全过程
- 多 Agent 发言记录与分析逻辑
- CEO 决策理由
- 最终采纳方案与执行任务

**适用条件标签**：正餐·火锅 / 坪效下滑>15% / 租约剩余60-120天 / 人均消费下滑型

下次出现同类组合时，AI 将优先引用此次经验。`,
  },
  {
    type: 'exec-card',
    phase: 'execution',
    pauseMs: 0,
  },
];

/* ═══════════════════════════════════════════════════════════════
   6. HELPER UTILS
═══════════════════════════════════════════════════════════════ */
const ts = () => new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
const uid = () => Math.random().toString(36).slice(2);

/* ═══════════════════════════════════════════════════════════════
   7. SUB-COMPONENTS
═══════════════════════════════════════════════════════════════ */

/* Typing indicator */
function TypingBubble({ agentId }: { agentId: AgentId }) {
  const a = AGENTS[agentId];
  return (
    <div className="flex items-start gap-3 animate-fade-in-up px-1">
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1"
        style={{ background: a.color, color: '#fff' }}>
        {a.name[0]}
      </div>
      <div className="rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2"
        style={{ background: a.bg, border: `1px solid ${a.border}` }}>
        <span className="text-xs" style={{ color: a.textColor }}>{a.name}</span>
        <span className="text-slate-400 text-xs">正在分析</span>
        <div className="flex gap-1 ml-1">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* System message */
function SystemMsg({ content }: { content: string }) {
  return (
    <div className="flex justify-center my-2 animate-fade-in">
      <span className="text-xs text-slate-400 bg-slate-100 rounded-full px-4 py-1.5 border border-slate-200">
        {content}
      </span>
    </div>
  );
}

/* Agent message bubble */
function AgentBubble({ msg }: { msg: Message }) {
  const a = AGENTS[msg.agentId!];
  return (
    <div className="flex items-start gap-3 animate-fade-in-up">
      {/* Avatar */}
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1 shadow-sm"
        style={{ background: a.color, color: '#fff' }}>
        {a.name[0]}
      </div>

      <div className="flex-1 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-sm font-semibold" style={{ color: a.color }}>{a.name}</span>
          {msg.tag && (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full"
              style={{ background: a.bg, color: a.textColor, border: `1px solid ${a.border}` }}>
              {msg.tag}
            </span>
          )}
          {msg.replyTo && (
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <ArrowRight size={9} />
              回应 {msg.replyTo}
            </span>
          )}
          <span className="text-[11px] text-slate-400 ml-auto">{msg.timestamp}</span>
        </div>

        {/* Content */}
        <div className="rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-slate-700 leading-relaxed"
          style={{ background: a.bg, border: `1px solid ${a.border}` }}>
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              strong: ({ children }) => <strong className="font-semibold" style={{ color: a.textColor }}>{children}</strong>,
              ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>,
              li: ({ children }) => <li className="text-sm">{children}</li>,
              table: ({ children }) => (
                <div className="my-2 overflow-x-auto">
                  <table className="text-xs border-collapse w-full">{children}</table>
                </div>
              ),
              th: ({ children }) => (
                <th className="px-3 py-1.5 text-left font-semibold border" style={{ borderColor: a.border, background: `${a.color}15`, color: a.textColor }}>{children}</th>
              ),
              td: ({ children }) => (
                <td className="px-3 py-1.5 border text-slate-600" style={{ borderColor: a.border }}>{children}</td>
              ),
              hr: () => <hr className="my-3" style={{ borderColor: a.border }} />,
              blockquote: ({ children }) => (
                <blockquote className="border-l-2 pl-3 my-2 italic text-slate-500" style={{ borderColor: a.color }}>{children}</blockquote>
              ),
            }}
          >
            {msg.content || ''}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

/* CEO message bubble */
function CEOBubble({ msg }: { msg: Message }) {
  return (
    <div className="flex items-start gap-3 justify-end animate-fade-in-up">
      <div className="flex-1 max-w-lg">
        <div className="flex items-center justify-end gap-2 mb-1.5">
          <span className="text-[11px] text-slate-400">{msg.timestamp}</span>
          <span className="text-sm font-semibold text-slate-700">你（CEO）</span>
        </div>
        <div className="rounded-2xl rounded-tr-sm px-4 py-3 text-sm text-white bg-slate-800 ml-auto">
          {msg.content}
        </div>
      </div>
      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-1">
        你
      </div>
    </div>
  );
}

/* Plan comparison card */
function PlanCard({ onSelect }: { onSelect: (plan: 'A' | 'B') => void }) {
  const [hovering, setHovering] = useState<'A' | 'B' | null>(null);
  return (
    <div className="animate-fade-in-up rounded-2xl border-2 border-blue-100 bg-white shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-slate-50 px-5 py-3 border-b border-blue-100">
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-blue-600" />
          <span className="text-sm font-semibold text-slate-700">AI 经营班子 · 方案收敛</span>
          <span className="text-[11px] text-slate-400 ml-auto">等待 CEO 决策</span>
        </div>
      </div>

      <div className="grid grid-cols-2 divide-x divide-slate-100">
        {[
          {
            id: 'A' as const, label: '方案 A', title: '套餐结构重组',
            recommended: true,
            metrics: [
              { k: '预期坪效回升', v: '+15% ~ +20%', good: true },
              { k: '执行周期', v: '4 周', good: true },
              { k: '预算', v: '约 ¥1.8 万', good: true },
              { k: '风险等级', v: '中等', good: true },
              { k: '历史成功率', v: '83%（23例）', good: true },
            ],
            summary: '解决根本问题，效果持久，成本低，推荐首选。',
            color: '#3b82f6',
          },
          {
            id: 'B' as const, label: '方案 B', title: '短期联名活动',
            recommended: false,
            metrics: [
              { k: '预期客流提升', v: '+25%（活动期）', good: true },
              { k: '执行周期', v: '2 周', good: true },
              { k: '预算', v: '¥3–5 万', good: false },
              { k: '风险等级', v: '高', good: false },
              { k: '历史成功率', v: '33%（12例）', good: false },
            ],
            summary: '见效快但不持久，未解决根本问题，续约成功率低。',
            color: '#94a3b8',
          },
        ].map(plan => (
          <div key={plan.id}
            className={`p-5 cursor-pointer transition-all relative ${hovering === plan.id ? 'bg-slate-50' : 'bg-white'}`}
            onMouseEnter={() => setHovering(plan.id)}
            onMouseLeave={() => setHovering(null)}
            onClick={() => onSelect(plan.id)}>

            {plan.recommended && (
              <div className="absolute top-3 right-3">
                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                  ★ AI 推荐
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 mb-1">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: plan.color }}>{plan.id}</div>
              <span className="text-sm font-semibold text-slate-700">{plan.title}</span>
            </div>
            <p className="text-[11px] text-slate-400 mb-4">{plan.summary}</p>

            <div className="space-y-2">
              {plan.metrics.map(m => (
                <div key={m.k} className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">{m.k}</span>
                  <span className="text-xs font-semibold"
                    style={{ color: m.good ? plan.color : '#94a3b8' }}>{m.v}</span>
                </div>
              ))}
            </div>

            <button className="mt-4 w-full py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: hovering === plan.id ? plan.color : `${plan.color}15`,
                color: hovering === plan.id ? '#fff' : plan.color,
                border: `1.5px solid ${plan.color}40`,
              }}>
              选择方案 {plan.id}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Execution summary card */
function ExecCard({ plan }: { plan: 'A' | 'B' }) {
  return (
    <div className="animate-fade-in-up rounded-2xl border border-emerald-200 bg-emerald-50 overflow-hidden">
      <div className="px-5 py-3 border-b border-emerald-200 flex items-center gap-2">
        <CheckCircle2 size={14} className="text-emerald-600" />
        <span className="text-sm font-semibold text-emerald-700">已拍板 · 方案 {plan} · 执行任务已创建</span>
        <Link href="/v4/execution" className="ml-auto text-[11px] text-emerald-600 hover:underline flex items-center gap-1">
          查看执行中心 <ArrowRight size={10} />
        </Link>
      </div>
      <div className="px-5 py-4 grid grid-cols-3 gap-4 text-center">
        {[
          { label: '已创建任务', value: '5 项', color: 'text-emerald-700' },
          { label: '预计完成周期', value: '4 周', color: 'text-blue-700' },
          { label: '已沉淀案例', value: '#2025-042', color: 'text-cyan-700' },
        ].map(s => (
          <div key={s.label}>
            <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Agent roster (right panel) */
function AgentRoster({ messages, typingId }: { messages: Message[]; typingId: AgentId | null }) {
  const spoken = new Set(messages.filter(m => m.type === 'agent').map(m => m.agentId));
  return (
    <div className="w-56 flex-shrink-0 border-l border-slate-100 bg-slate-50 p-4 overflow-y-auto">
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-3">参会席</p>
      <div className="space-y-2">
        {(Object.entries(AGENTS) as [AgentId, typeof AGENTS[AgentId]][]).map(([id, a]) => {
          const isTyping = typingId === id;
          const hasSpo = spoken.has(id);
          return (
            <div key={id} className="flex items-center gap-2.5 px-2 py-2 rounded-xl transition-all"
              style={{ background: isTyping ? a.bg : hasSpo ? `${a.color}08` : 'transparent' }}>
              <div className="relative flex-shrink-0">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold"
                  style={{ background: isTyping ? a.color : hasSpo ? a.color : '#e2e8f0', color: isTyping || hasSpo ? '#fff' : '#94a3b8' }}>
                  {a.name[0]}
                </div>
                {isTyping && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white" />
                )}
                {hasSpo && !isTyping && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-medium truncate"
                  style={{ color: isTyping ? a.color : hasSpo ? '#374151' : '#9ca3af' }}>
                  {a.name}
                </p>
                <p className="text-[10px] truncate"
                  style={{ color: isTyping ? a.color : '#9ca3af' }}>
                  {isTyping ? '分析中...' : hasSpo ? '已发言' : '待命'}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-200">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">关于本次会商</p>
        <div className="space-y-1.5 text-[11px] text-slate-500">
          <div>议题：<span className="text-slate-700">续约风险</span></div>
          <div>商户：<span className="text-slate-700">望潮港火锅</span></div>
          <div>风险等级：<span className="font-semibold text-rose-600">高危</span></div>
          <div>干预窗口：<span className="font-semibold text-amber-600">剩 45 天</span></div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   8. MAIN PAGE
═══════════════════════════════════════════════════════════════ */
export default function SessionPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingAgentId, setTypingAgentId] = useState<AgentId | null>(null);
  const [scriptIdx, setScriptIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [waitForCEO, setWaitForCEO] = useState(false);
  const [ceoInput, setCeoInput] = useState('');
  const [phase, setPhase] = useState<Phase>('discovery');
  const [decided, setDecided] = useState(false);
  const [chosenPlan, setChosenPlan] = useState<'A' | 'B' | null>(null);
  const [execScript, setExecScript] = useState<ScriptItem[]>([]);
  const [execIdx, setExecIdx] = useState(0);
  const [inExec, setInExec] = useState(false);
  const [speed, setSpeed] = useState(1); // 1x or 2x

  const bottomRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingAgentId]);

  // Determine active script
  const activeScript = inExec ? execScript : SCRIPT;
  const activeIdx = inExec ? execIdx : scriptIdx;
  const setActiveIdx = inExec ? setExecIdx : setScriptIdx;

  // Auto-play engine
  useEffect(() => {
    if (isPaused || waitForCEO) return;
    if (activeIdx >= activeScript.length) return;

    const item = activeScript[activeIdx];
    const mult = 1 / speed;

    // For agent messages: show typing indicator first
    if (item.type === 'agent' && item.agentId) {
      setTypingAgentId(item.agentId);
      const typing = (item.typingMs ?? 1800) * mult;
      timerRef.current = setTimeout(() => {
        setTypingAgentId(null);
        const newMsg: Message = {
          id: uid(), type: 'agent',
          agentId: item.agentId, tag: item.tag,
          content: item.content, timestamp: ts(),
          phase: item.phase, replyTo: item.replyTo,
        };
        setMessages(prev => [...prev, newMsg]);
        if (item.phase) setPhase(item.phase);
        const pause = (item.pauseMs ?? 600) * mult;
        timerRef.current = setTimeout(() => {
          if (item.waitForCEO) { setWaitForCEO(true); return; }
          setActiveIdx(i => i + 1);
        }, pause);
      }, typing);
    } else if (item.type === 'system') {
      timerRef.current = setTimeout(() => {
        const newMsg: Message = {
          id: uid(), type: 'system', content: item.content, timestamp: ts(), phase: item.phase,
        };
        setMessages(prev => [...prev, newMsg]);
        if (item.phase) setPhase(item.phase);
        timerRef.current = setTimeout(() => {
          setActiveIdx(i => i + 1);
        }, (item.pauseMs ?? 300) * mult);
      }, 300 * mult);
    } else if (item.type === 'plan-card') {
      timerRef.current = setTimeout(() => {
        const newMsg: Message = { id: uid(), type: 'plan-card', timestamp: ts(), phase: 'decision' };
        setMessages(prev => [...prev, newMsg]);
        setPhase('decision');
        setWaitForCEO(true);
      }, 400 * mult);
    } else if (item.type === 'exec-card') {
      timerRef.current = setTimeout(() => {
        const newMsg: Message = { id: uid(), type: 'exec-card', timestamp: ts(), phase: 'execution' };
        setMessages(prev => [...prev, newMsg]);
        setActiveIdx(i => i + 1);
      }, 400 * mult);
    }

    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [activeIdx, isPaused, waitForCEO, speed, inExec, activeScript]);

  // CEO sends a message
  const sendCEOMessage = useCallback((text: string) => {
    if (!text.trim()) return;
    const ceoMsg: Message = { id: uid(), type: 'ceo', content: text, timestamp: ts() };
    setMessages(prev => [...prev, ceoMsg]);
    setCeoInput('');
  }, []);

  // CEO asks a quick question (also triggers agent response)
  const handleQuickQuestion = useCallback((q: CeoQuestion) => {
    sendCEOMessage(q.label);
    // Show agent typing then response after short pause
    setTimeout(() => {
      setTypingAgentId(q.response.agentId);
      setTimeout(() => {
        setTypingAgentId(null);
        const resp: Message = {
          id: uid(), type: 'agent',
          agentId: q.response.agentId, tag: q.response.tag,
          content: q.response.content, timestamp: ts(),
        };
        setMessages(prev => [...prev, resp]);
      }, q.response.typingMs);
    }, 600);
  }, [sendCEOMessage]);

  // CEO makes final decision
  const handleDecision = useCallback((plan: 'A' | 'B') => {
    setChosenPlan(plan);
    setDecided(true);
    setWaitForCEO(false);

    // CEO decision message
    const ceoMsg: Message = {
      id: uid(), type: 'ceo',
      content: `就按方案 ${plan} 推进，今天发起执行。`,
      timestamp: ts(),
    };
    setMessages(prev => [...prev, ceoMsg]);

    // Start execution script
    const es = getExecScript(plan);
    setExecScript(es);
    setExecIdx(0);
    setInExec(true);
    setPhase('execution');
  }, []);

  // Determine quick questions to show based on phase
  const visibleQuickQs = CEO_QUICK_QUESTIONS.filter(() => !decided);

  /* ── Render ── */
  return (
    <div className="h-screen flex flex-col bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Problem Header (fixed top) ── */}
      <div className="flex-shrink-0 border-b border-slate-100 bg-white">
        <div className="px-5 py-3 flex items-center gap-4">
          <Link href="/v4" className="text-slate-400 hover:text-slate-600 transition-colors">
            <ChevronLeft size={18} />
          </Link>

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-sm font-bold text-slate-800">望潮港火锅 · 续约风险升级</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200">
            <AlertTriangle size={11} className="text-rose-600" />
            <span className="text-[11px] font-semibold text-rose-700">高危</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <Clock size={11} />
            <span>干预窗口 45 天</span>
          </div>

          {/* Phase progress */}
          <div className="ml-auto flex items-center gap-1">
            {(['发现', '诊断', '方案', '决策', '执行'] as const).map((label, i) => {
              const phases: Phase[] = ['discovery', 'diagnosis', 'solution', 'decision', 'execution'];
              const current = phases.indexOf(phase);
              const active = i === current;
              const done = i < current;
              return (
                <React.Fragment key={label}>
                  <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium transition-all ${active ? 'bg-blue-100 text-blue-700' : done ? 'bg-emerald-50 text-emerald-600' : 'text-slate-300'}`}>
                    {done && <CheckCircle2 size={9} />}
                    {label}
                  </div>
                  {i < 4 && <div className={`w-4 h-px ${done ? 'bg-emerald-300' : 'bg-slate-200'}`} />}
                </React.Fragment>
              );
            })}
          </div>

          {/* Speed control */}
          <div className="flex items-center gap-1 ml-2">
            <button onClick={() => setIsPaused(p => !p)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all">
              {isPaused ? <Play size={13} /> : <Pause size={13} />}
            </button>
            <button onClick={() => setSpeed(s => s === 1 ? 3 : 1)}
              className={`flex items-center gap-0.5 px-2 py-1 rounded-lg text-[11px] font-medium transition-all ${speed > 1 ? 'bg-blue-100 text-blue-600' : 'text-slate-400 hover:bg-slate-100'}`}>
              <FastForward size={11} /> {speed}x
            </button>
          </div>
        </div>
      </div>

      {/* ── Body: conversation + roster ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── Conversation stream ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {messages.map(msg => {
            if (msg.type === 'system') return <SystemMsg key={msg.id} content={msg.content!} />;
            if (msg.type === 'agent') return <AgentBubble key={msg.id} msg={msg} />;
            if (msg.type === 'ceo') return <CEOBubble key={msg.id} msg={msg} />;
            if (msg.type === 'plan-card') return (
              <div key={msg.id}>
                {!decided
                  ? <PlanCard onSelect={handleDecision} />
                  : (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-500 text-center">
                      方案已收敛 · CEO 已选择方案 {chosenPlan}
                    </div>
                  )
                }
              </div>
            );
            if (msg.type === 'exec-card') return <ExecCard key={msg.id} plan={chosenPlan!} />;
            return null;
          })}

          {/* Typing indicator */}
          {typingAgentId && <TypingBubble agentId={typingAgentId} />}

          {/* Wait for CEO hint */}
          {waitForCEO && !decided && (
            <div className="flex justify-center animate-fade-in">
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-xs text-blue-700 font-medium">等待 CEO 决策 · 可追问或直接拍板</span>
              </div>
            </div>
          )}

          <div ref={bottomRef} className="h-4" />
        </div>

        {/* ── Agent roster ── */}
        <AgentRoster messages={messages} typingId={typingAgentId} />
      </div>

      {/* ── CEO Input Bar (fixed bottom) ── */}
      <div className="flex-shrink-0 border-t border-slate-100 bg-white">

        {/* Quick questions (show when not decided) */}
        {!decided && visibleQuickQs.length > 0 && (
          <div className="px-5 pt-3 pb-1 flex items-center gap-2 flex-wrap">
            <span className="text-[11px] text-slate-400 mr-1">快速追问：</span>
            {visibleQuickQs.map(q => (
              <button key={q.id}
                onClick={() => handleQuickQuestion(q)}
                className="text-[11px] px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all">
                {q.label}
              </button>
            ))}
          </div>
        )}

        {/* Plan decision buttons (show when waiting for decision) */}
        {waitForCEO && !decided && (
          <div className="px-5 pt-2 pb-1 flex items-center gap-2">
            <span className="text-[11px] text-slate-400 mr-1">或直接拍板：</span>
            <button onClick={() => handleDecision('A')}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all">
              ✓ 按方案 A 执行
            </button>
            <button onClick={() => handleDecision('B')}
              className="px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all">
              按方案 B 执行
            </button>
          </div>
        )}

        {/* CEO text input */}
        <div className="px-5 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            你
          </div>
          <div className="flex-1 flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-50 transition-all bg-white">
            <input
              ref={inputRef}
              className="flex-1 text-sm text-slate-700 outline-none placeholder:text-slate-400"
              placeholder={decided ? '会商已结束，任务执行中...' : '随时插话追问，或输入问题让 AI 专家回答...'}
              value={ceoInput}
              onChange={e => setCeoInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendCEOMessage(ceoInput); } }}
              disabled={decided}
            />
            <button
              onClick={() => sendCEOMessage(ceoInput)}
              disabled={!ceoInput.trim() || decided}
              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-30 transition-all">
              <Send size={14} />
            </button>
          </div>

          {decided && (
            <Link href="/v4/execution"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-all flex-shrink-0">
              <CheckCircle2 size={14} /> 查看执行任务
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
