'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Search, Plus, Bell, Zap, Send, Users,
  CheckCircle2, BookOpen,
  Play, Pause, ChevronRight,
  ArrowRight, FileText, BarChart3, ListChecks,
  Brain, Sparkles, AlertTriangle,
} from 'lucide-react';

/* ════════════════════════════════════════════════════════════
   TYPES
════════════════════════════════════════════════════════════ */
type AgentId = 'risk' | 'advisor' | 'campaign' | 'inspector' | 'memory' | 'scheduler' | 'merchant';
type MsgType =
  | 'agent' | 'gm' | 'gm-decision' | 'system' | 'phase-sep'
  | 'consultation' | 'plan-card' | 'task-card' | 'memory-card'
  | 'phase-conclusion' | 'judgment-revision';
type Phase = 'discovery' | 'evidence' | 'diagnosis' | 'consultation' | 'solution' | 'decision' | 'execution' | 'archive';

interface PhaseConclusion {
  title: string;
  confirmed: string[];
  uncertain: string[];
  gmNeed: string;
  nextStep: string;
}

interface Msg {
  id: string; type: MsgType; agentId?: AgentId;
  content?: string; time: string; phase: Phase;
  embed?: 'data' | 'inspection' | 'case';
  consultStatus?: 'waiting' | 'approved' | 'rejected';
  selectedPlan?: 'A' | 'B' | 'C';
  confirmed?: boolean;
  waitForCEO?: boolean;
  phaseConclusion?: PhaseConclusion;
  revisions?: { from: string; to: string }[];
}
interface ScriptItem extends Omit<Msg, 'id'> { typingMs?: number; pauseMs?: number; }

/* ════════════════════════════════════════════════════════════
   AGENT CONFIGS
════════════════════════════════════════════════════════════ */
const AG: Record<AgentId, { name: string; role: string; color: string; bg: string; border: string; tc: string; }> = {
  risk:      { name: '风险诊断师',   role: '数据异动感知 · 风险定级',   color: '#f43f5e', bg: '#fff1f2', border: '#fecdd3', tc: '#be123c' },
  advisor:   { name: '商户经营顾问', role: '经营逻辑解读 · 根因诊断',   color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe', tc: '#1d4ed8' },
  campaign:  { name: '活动策略师',   role: '流量转化分析 · 方案设计',   color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', tc: '#b45309' },
  inspector: { name: '巡店督导',     role: '现场体验核查 · 改善建议',   color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', tc: '#15803d' },
  memory:    { name: '案例记忆官',   role: '历史案例调取 · 经验复用',   color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc', tc: '#0e7490' },
  scheduler: { name: '任务调度官',   role: '方案收敛 · 执行编排',       color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', tc: '#6d28d9' },
  merchant:  { name: '招商经理',     role: '续约策略 · 商户组合管理',   color: '#4f46e5', bg: '#eef2ff', border: '#c7d2fe', tc: '#4338ca' },
};

const PHASES: { id: Phase; label: string }[] = [
  { id: 'discovery', label: '发现' }, { id: 'evidence', label: '证据' },
  { id: 'diagnosis', label: '判断' }, { id: 'consultation', label: '请示' },
  { id: 'solution', label: '方案' }, { id: 'decision', label: '决策' },
  { id: 'execution', label: '执行' }, { id: 'archive', label: '沉淀' },
];

/* ════════════════════════════════════════════════════════════
   THREAD DATA (P0-1: 经营事项盘)
════════════════════════════════════════════════════════════ */
const BUSINESS_THREADS = [
  {
    id: 'wangchao',
    title: '望潮港火锅',
    subtitle: '续约风险升级',
    badge: 'P0' as const,
    tags: ['续约窗口91天', '坪效↓22%'],
    impact: '失约损失 ≈ ¥86万/年',
    stage: '等待总经理拍板',
    consequence: '48h不干预，续约可能性降至40%',
    time: '刚刚',
  },
  {
    id: 'xinxiang',
    title: '辛香汇',
    subtitle: '经营持续下滑',
    badge: 'P1' as const,
    tags: ['连续3月下滑', '客诉↑18条'],
    impact: '影响B区整体坪效评分',
    stage: '会商中 · 待诊断结论',
    consequence: '本季度KPI达标风险',
    time: '09:55',
  },
  {
    id: 'b-event',
    title: 'B区周末活动复盘',
    subtitle: '达成率67%，待决策',
    badge: 'P1' as const,
    tags: ['目标未达成', '待决策'],
    impact: '影响下期活动预算分配',
    stage: '等待你的指示',
    consequence: '未复盘将影响下期方案质量',
    time: '昨天',
  },
];

/* ════════════════════════════════════════════════════════════
   SCRIPT
════════════════════════════════════════════════════════════ */
const SCRIPT: ScriptItem[] = [
  /* ── Phase: discovery ── */
  { type: 'phase-sep', time: '09:23', phase: 'discovery', content: '发现问题' },
  {
    type: 'agent', agentId: 'risk', time: '09:23', phase: 'discovery',
    typingMs: 1800, pauseMs: 1400,
    content: `在今日 09:23 的例行经营扫描中，我检测到**望潮港火锅**出现多项关键异常，建议立即发起会商：

1. 租约剩余 **91 天**，已进入续约高风险窗口
2. 过去 90 天坪效持续下滑 **22%**
3. 本月客诉 **18 条**，环比上升 35%
4. 最近两次周末活动均未达到预期转化
5. 历史同类商户若在该阶段未干预，续约失败概率超过 **60%**

初步判断：当前问题已不是单纯经营波动，可能已升级为"经营表现影响续约意愿"的复合型风险。建议立即启动多 Agent 会商。`,
  },
  /* ── Phase: evidence ── */
  { type: 'phase-sep', time: '09:29', phase: 'evidence', content: '补充证据' },
  {
    type: 'agent', agentId: 'advisor', time: '09:29', phase: 'evidence',
    typingMs: 2000, pauseMs: 1200, embed: 'data',
    content: `我已补充调取该商户近 6 个月经营数据，先补一个关键判断：

**问题不完全是"人少了"，而是"来的人花得更少了"。**

这意味着门店不是没客人，而是消费结构在恶化——顾客愿意进店，但不愿意高质量消费。我倾向判断：问题可能出在「产品吸引力 + 套餐结构 + 门店体验」，而不只是外部流量。`,
  },
  {
    type: 'agent', agentId: 'campaign', time: '09:31', phase: 'evidence',
    typingMs: 1800, pauseMs: 1200,
    content: `我补充活动与转化侧数据。过去 60 天参加了 2 次大型促销：**3月周年庆**、**4月春季餐饮节**。

结果：活动期间客流提升 **11%**，但客单价下降 **9%**；活动后 7 天复购率低于同业平均；优惠券核销高，但**会员留存转化差**。

我的判断：目前问题不是"活动没做"，而是"活动做成了低质量流量"，没有改善续约价值。**我不建议继续简单加促销补贴。**`,
  },
  {
    type: 'agent', agentId: 'inspector', time: '09:33', phase: 'evidence',
    typingMs: 1600, pauseMs: 1200, embed: 'inspection',
    content: `我补充现场问题。根据最近两次巡店记录，这家店存在几个可能影响消费体验的关键问题。

我认为这不是纯运营数据问题，**现场体验确实在拖后腿**。如果我们只看经营报表，可能会低估「线下体验因素」对续约的影响。`,
  },
  {
    type: 'agent', agentId: 'memory', time: '09:35', phase: 'evidence',
    typingMs: 1600, pauseMs: 1200, embed: 'case',
    content: `我已匹配到一个高相似历史案例（相似度 **87%**）。

不过还需要判断望潮港是否适合直接复用——当前线下体验问题比当时更突出，干预优先级需要前移。`,
  },
  /* ── P0-2: 证据阶段收敛卡 ── */
  {
    type: 'phase-conclusion', time: '09:36', phase: 'evidence',
    typingMs: 600, pauseMs: 1200,
    phaseConclusion: {
      title: '证据阶段收敛',
      confirmed: [
        '核心问题不是客流下降，而是消费质量恶化（人均↓12%）',
        '现场体验存在5项明确短板，正在放大经营恶化',
        '历史案例相似度87%，有可复用干预策略',
        '已做活动但仅带来低质量流量，不建议继续补贴',
      ],
      uncertain: [
        '招商侧对该商户的保留意向尚不明确',
        '续约谈判是否已进入敏感阶段',
      ],
      gmNeed: '是否同意邀请招商经理加入，补充续约侧信息？',
      nextStep: '向总经理请示 → 确认后招商经理入会 → 进入判断阶段',
    },
  },
  /* ── Phase: consultation ── */
  { type: 'phase-sep', time: '09:37', phase: 'consultation', content: '向总经理请示' },
  {
    type: 'consultation', agentId: 'risk', time: '09:37', phase: 'consultation',
    consultStatus: 'waiting', waitForCEO: true,
    typingMs: 1400, pauseMs: 500,
    content: `当前问题已不只是经营优化，而涉及**续约策略判断**，超出经营 Agent 判断范围。建议邀请「**招商经理**」加入本次会商，请问是否同意？`,
  },
  {
    type: 'gm', time: '09:38', phase: 'consultation',
    typingMs: 1000, pauseMs: 1000,
    content: `同意拉招商经理入会。

但我先追问两个问题：
1. 你们现在判断这个问题核心更偏**"门店经营能力"**，还是**"招商位置与续约关系"**？
2. 如果只给 30 天窗口，最值得优先验证的动作是什么？`,
  },
  { type: 'system', time: '09:40', phase: 'consultation', pauseMs: 600, content: '招商经理 已加入会商' },
  {
    type: 'agent', agentId: 'merchant', time: '09:41', phase: 'consultation',
    typingMs: 1800, pauseMs: 1000,
    content: `我补充招商侧信息：

1. 望潮港目前**不是**我们最想淘汰的商户
2. 但最近一期评估里，续约优先级已从"保留"**降到"观察"**
3. 原因不是租金问题，而是整体经营表现变弱
4. 如果接下来 30 天没有改善信号，招商侧会考虑替换方案

这意味着：经营改善仍然有机会影响续约结果，但**窗口非常短**。我建议：先不要进入正式续约谈判，而是给出一轮明确、可验证的经营改善动作，再决定后续谈判策略。`,
  },
  /* ── P1-4: 判断修正卡 ── */
  {
    type: 'judgment-revision', agentId: 'merchant', time: '09:42', phase: 'consultation',
    typingMs: 500, pauseMs: 1000,
    revisions: [
      { from: '招商侧已明确考虑替换该商户', to: '招商侧仍将该商户列为"观察"，保留意向存在' },
      { from: '续约问题已超出经营干预范围', to: '30天经营改善信号可直接影响续约评分' },
    ],
  },
  /* ── Phase: diagnosis ── */
  { type: 'phase-sep', time: '09:43', phase: 'diagnosis', content: '形成初步判断' },
  {
    type: 'gm', time: '09:43', phase: 'diagnosis',
    typingMs: 900, pauseMs: 1200,
    content: `明白了。那我现在关心三件事：
1. 如果只做一轮短期干预，什么动作最可能在 **30 天内见效**？
2. 有没有必要同步做店面体验整改，而不是只做活动？
3. 如果我现在批预算，应该优先投在什么地方？`,
  },
  /* ── P0-2: 判断阶段收敛卡 ── */
  {
    type: 'phase-conclusion', time: '09:45', phase: 'diagnosis',
    typingMs: 600, pauseMs: 1000,
    phaseConclusion: {
      title: '判断阶段收敛',
      confirmed: [
        '问题定性：经营能力+体验质量双重拖拽，非纯流量问题',
        '招商侧仍有保留窗口，经营改善可影响续约评分',
        '核心目标：30天内产生可被招商侧认可的改善信号',
        '不建议继续做低质量促销活动',
      ],
      uncertain: [
        '三个干预方向的资源投入与效果权衡尚未收敛',
      ],
      gmNeed: '选择执行方向：经营优先、双修并进，还是活动拉新？',
      nextStep: '进入方案阶段 → 任务调度官收敛三个方向',
    },
  },
  /* ── Phase: solution ── */
  { type: 'phase-sep', time: '09:46', phase: 'solution', content: '形成方案' },
  {
    type: 'agent', agentId: 'scheduler', time: '09:46', phase: 'solution',
    typingMs: 900, pauseMs: 700,
    content: `基于当前会商结果，我开始收敛执行方案。目前形成三个可行方向，每个方案已按8个维度完整评估，请总经理参与选择。`,
  },
  {
    type: 'plan-card', time: '09:47', phase: 'solution',
    waitForCEO: true, typingMs: 500, pauseMs: 500,
  },
  /* ── Phase: decision ── */
  { type: 'phase-sep', time: '09:49', phase: 'decision', content: '总经理决策参与' },
  {
    type: 'gm', time: '09:49', phase: 'decision',
    typingMs: 900, pauseMs: 1000,
    content: `我倾向方案B，但我还有两个问题：
1. 如果预算只能先批一半，方案B里**最不能砍掉的动作**是什么？
2. 我希望 **2 周内先看到一个领先指标**，什么指标最能证明这轮干预有效？`,
  },
  {
    type: 'agent', agentId: 'advisor', time: '09:50', phase: 'decision',
    typingMs: 1500, pauseMs: 1000,
    content: `如果预算有限，方案B 中**最不能砍的**是：
① 套餐结构优化 — 直接影响客单价
② 店外导视与门头轻改 — 影响顾客进店意愿
③ 晚高峰服务响应整改 — 直接影响复购

**2 周领先指标建议看：** 人均消费回升幅度（最直接）、高毛利单品销售占比、差评率变化——而不是只看客流，客流是滞后指标。`,
  },
  {
    type: 'agent', agentId: 'merchant', time: '09:51', phase: 'decision',
    typingMs: 1000, pauseMs: 1200,
    content: `从招商续约角度补充：如果 2 周后能看到**客单回升 + 差评下降 + 门店形象改善**，我这边就有理由把它从"观察"重新拉回**"优先保留"**。这三个指标，恰好是方案B最核心的三个动作所对应的结果，逻辑自洽。`,
  },
  {
    type: 'gm-decision', time: '09:52', phase: 'decision',
    typingMs: 1200, pauseMs: 800,
    content: `决定如下：

1. **按方案B推进**
2. 先批第一阶段预算，两周后复盘领先指标
3. 招商侧先不正式谈续约，但保留观察窗口
4. 请立即生成执行任务，并把本次会商沉淀为后续可复用案例`,
  },
  /* ── Phase: execution ── */
  { type: 'phase-sep', time: '09:53', phase: 'execution', content: '进入执行' },
  {
    type: 'task-card', agentId: 'scheduler', time: '09:53', phase: 'execution',
    typingMs: 800, pauseMs: 1000,
  },
  /* ── Phase: archive ── */
  { type: 'phase-sep', time: '09:55', phase: 'archive', content: '沉淀记忆' },
  {
    type: 'memory-card', agentId: 'memory', time: '09:55', phase: 'archive',
    waitForCEO: true, typingMs: 900, pauseMs: 500,
    content: '已将本次会商沉淀为组织记忆草案，是否确认沉淀到组织记忆中心？',
  },
  {
    type: 'gm', time: '09:56', phase: 'archive',
    typingMs: 700, pauseMs: 0,
    content: `确认沉淀。并在后续遇到"餐饮类续约风险 + 人均消费下降 + 现场体验问题"时，优先引用这次策略。`,
  },
];

/* ════════════════════════════════════════════════════════════
   HARDCODED EMBED DATA
════════════════════════════════════════════════════════════ */
const DATA_ROWS = [
  { label: '月均客流', from: '4,850', to: '4,720', pct: '-2.7%', warn: false },
  { label: '人均消费', from: '¥138', to: '¥121', pct: '-12.3%', warn: true },
  { label: '翻台率', from: '3.1次/天', to: '2.9次/天', pct: '-6.5%', warn: false },
  { label: '高毛利单品占比', from: '38%', to: '27%', pct: '-11pt', warn: true },
  { label: '会员复购率', from: '41%', to: '29%', pct: '-12pt', warn: true },
];
const INSPECTION_ITEMS = [
  '晚高峰排队动线混乱，顾客等位体验差',
  '店外导视弱，路过客识别度不高',
  '套餐展示区更新慢，主推信息不清',
  '部分服务环节响应偏慢（高峰期）',
  '门头灯光与形象老化，影响进店意愿',
];

/* ── P1-5: 8-field plans ── */
const PLANS = [
  {
    id: 'A' as const,
    name: '方案A · 经营修复优先',
    premise: '现场问题轻微，核心是经营结构问题',
    coreAction: '套餐结构优化 + 会员激活 + 导购话术强化',
    leadIndicator: '人均消费回升 ≥5%（2周）',
    target30d: '客单价从¥121回升至¥128',
    renewalImpact: '中：证明经营意愿，但体验侧无改善',
    cost: '低 · ¥3-5万',
    complexity: '低 · 仅需经营顾问协同',
    risk: '若体验问题突出，改善上限有限',
    recommended: false,
  },
  {
    id: 'B' as const,
    name: '方案B · 修复＋体验整改',
    premise: '经营+体验双问题叠加，续约说服力需要两手证据',
    coreAction: '套餐优化 + 门头轻改 + 动线整改 + 会员激活',
    leadIndicator: '客单价回升 + 差评率下降（2周同步）',
    target30d: '客单价≥¥128，差评率降至5%以内',
    renewalImpact: '高：多维改善信号，招商侧可重新评估为"保留"',
    cost: '中 · ¥8-12万',
    complexity: '中 · 需经营顾问+巡店督导+店长三方协同',
    risk: '执行协同难度较高，需总经理推进授权',
    recommended: true,
  },
  {
    id: 'C' as const,
    name: '方案C · 活动拉新优先',
    premise: '以流量拉升短期数据，优先续约谈判窗口',
    coreAction: '加大活动补贴 + 联合促销 + 新一轮引流',
    leadIndicator: '周末客流提升（即时可见）',
    target30d: '客流提升15%，但客单价可能进一步下滑',
    renewalImpact: '低：数据好看但说服力弱，招商侧不认',
    cost: '中 · ¥6-8万（活动补贴）',
    complexity: '低 · 活动策略师主导即可',
    risk: '高：无法解决消费质量，形成低质量流量依赖',
    recommended: false,
  },
];

const TASKS = [
  { no: 1, title: '套餐结构优化', owner: '商户经营顾问', deadline: '3天内', output: '新套餐结构建议方案' },
  { no: 2, title: '店外导视与门头轻改', owner: '巡店督导', deadline: '5天内', output: '整改清单与现场确认图' },
  { no: 3, title: '晚高峰服务响应整改', owner: '门店店长', deadline: '7天内', output: '服务改进执行记录' },
  { no: 4, title: '两周复盘', owner: '风险诊断师', deadline: '14天后', output: '人均消费 / 高毛利占比 / 差评率' },
];

/* ════════════════════════════════════════════════════════════
   EMBED COMPONENTS
════════════════════════════════════════════════════════════ */
function DataEmbed() {
  return (
    <div className="mt-3 rounded-xl overflow-hidden border border-blue-100">
      <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border-b border-blue-100">
        <BarChart3 size={12} className="text-blue-500" />
        <span className="text-[11px] font-semibold text-blue-700">经营数据</span>
        <span className="text-[10px] text-blue-400 ml-auto">近6个月 · 商户经营顾问调取</span>
      </div>
      <div className="divide-y divide-slate-100 bg-white">
        {DATA_ROWS.map(r => (
          <div key={r.label} className="flex items-center gap-3 px-3 py-2">
            <span className="text-[11px] text-slate-500 w-28 flex-shrink-0">{r.label}</span>
            <span className="text-[11px] text-slate-400">{r.from}</span>
            <ArrowRight size={10} className="text-slate-300 flex-shrink-0" />
            <span className="text-[11px] text-slate-700 font-medium">{r.to}</span>
            <span className={`ml-auto text-[11px] font-semibold ${r.warn ? 'text-rose-500' : 'text-slate-500'}`}>{r.pct}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function InspectionEmbed() {
  return (
    <div className="mt-3 rounded-xl overflow-hidden border border-green-100">
      <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border-b border-green-100">
        <FileText size={12} className="text-green-600" />
        <span className="text-[11px] font-semibold text-green-700">巡店记录摘要</span>
        <span className="text-[10px] text-green-400 ml-auto">最近两次 · 巡店督导</span>
      </div>
      <div className="bg-white px-3 py-2 space-y-1.5">
        {INSPECTION_ITEMS.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-amber-400 text-[11px] flex-shrink-0 mt-0.5">⚠</span>
            <span className="text-[12px] text-slate-600">{item}</span>
          </div>
        ))}
        <div className="text-[10px] text-slate-400 pt-1">上次巡店：4月18日</div>
      </div>
    </div>
  );
}

function CaseEmbed() {
  return (
    <div className="mt-3 rounded-xl overflow-hidden border border-cyan-100">
      <div className="flex items-center gap-2 px-3 py-2 bg-cyan-50 border-b border-cyan-100">
        <BookOpen size={12} className="text-cyan-600" />
        <span className="text-[11px] font-semibold text-cyan-700">历史案例引用</span>
        <span className="text-[10px] text-cyan-400 ml-auto">CASE-2024-087</span>
      </div>
      <div className="bg-white px-3 py-3">
        <div className="flex items-start justify-between mb-2">
          <p className="text-[12px] font-semibold text-slate-700 leading-tight">某火锅品牌·续约危机干预</p>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex-shrink-0 ml-2">✓ 成功续约</span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] text-slate-500">相似度</span>
          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-400 rounded-full" style={{ width: '87%' }} />
          </div>
          <span className="text-[11px] font-bold text-cyan-600">87%</span>
        </div>
        <div className="space-y-0.5">
          {['坪效连续下滑 + 人均消费下降', '活动带来流量但未改善复购', '干预时间节点相近'].map((p, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 flex-shrink-0" />
              {p}
            </div>
          ))}
        </div>
        <p className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
          <span className="font-medium text-slate-600">核心策略：</span>体验整改 → 套餐优化 → 续约沟通（21天见效）
        </p>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   P0-2: PHASE CONCLUSION CARD
════════════════════════════════════════════════════════════ */
function PhaseConclusionCard({ pc }: { pc: PhaseConclusion }) {
  return (
    <div className="my-4 rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-50">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 border-b border-slate-200">
        <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">{pc.title}</span>
        <span className="ml-auto text-[10px] text-slate-400">会商系统自动归纳</span>
      </div>
      <div className="px-4 py-3 space-y-3">
        {/* Confirmed */}
        <div>
          <p className="text-[10px] font-semibold text-emerald-600 uppercase mb-1.5">✅ 已确认</p>
          <div className="space-y-1">
            {pc.confirmed.map((c, i) => (
              <div key={i} className="flex items-start gap-2 text-[12px] text-slate-600">
                <span className="flex-shrink-0 mt-0.5 text-emerald-400">·</span>{c}
              </div>
            ))}
          </div>
        </div>
        {/* Uncertain */}
        {pc.uncertain.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-amber-500 uppercase mb-1.5">❓ 仍待确认</p>
            <div className="space-y-1">
              {pc.uncertain.map((u, i) => (
                <div key={i} className="flex items-start gap-2 text-[12px] text-slate-500">
                  <span className="flex-shrink-0 mt-0.5 text-amber-300">·</span>{u}
                </div>
              ))}
            </div>
          </div>
        )}
        {/* GM Need */}
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2">
          <p className="text-[10px] font-semibold text-amber-600 mb-0.5">⚡ 总经理需要决定</p>
          <p className="text-[12px] text-amber-800">{pc.gmNeed}</p>
        </div>
        {/* Next step */}
        <p className="text-[11px] text-slate-400">建议下一步：{pc.nextStep}</p>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   P1-4: JUDGMENT REVISION CARD
════════════════════════════════════════════════════════════ */
function JudgmentRevisionCard({ msg }: { msg: Msg }) {
  const agentName = msg.agentId ? AG[msg.agentId].name : '';
  const agentColor = msg.agentId ? AG[msg.agentId].color : '#64748b';
  return (
    <div className="my-3 rounded-xl overflow-hidden border border-indigo-200 bg-indigo-50/50">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-indigo-100">
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: agentColor }} />
        <span className="text-[11px] font-semibold text-indigo-700">判断修正</span>
        <span className="text-[10px] text-indigo-400">因 {agentName} 补充信息，以下初始判断已被修正</span>
        <span className="ml-auto text-[10px] text-indigo-300">{msg.time}</span>
      </div>
      <div className="px-3 py-2.5 space-y-2">
        {(msg.revisions || []).map((r, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-[10px] text-rose-400 flex-shrink-0 mt-0.5 font-bold">旧</span>
            <div className="flex-1 space-y-0.5">
              <p className="text-[11px] text-slate-400 line-through">{r.from}</p>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-emerald-500 font-bold flex-shrink-0">新</span>
                <p className="text-[12px] text-slate-700 font-medium">{r.to}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   P1-5: ENHANCED PLAN CARD (8 fields)
════════════════════════════════════════════════════════════ */
function PlanCard({ msg, onSelect }: { msg: Msg; onSelect: (p: 'A' | 'B' | 'C') => void }) {
  const chosen = msg.selectedPlan;
  const FIELDS: { key: keyof typeof PLANS[0]; label: string; highlight?: (v: string, planId: 'A' | 'B' | 'C') => boolean }[] = [
    { key: 'premise', label: '适用前提' },
    { key: 'coreAction', label: '核心动作' },
    { key: 'leadIndicator', label: '2周领先指标' },
    { key: 'target30d', label: '30天目标' },
    { key: 'renewalImpact', label: '对续约影响' },
    { key: 'cost', label: '执行成本' },
    { key: 'complexity', label: '协同复杂度' },
    { key: 'risk', label: '风险提示' },
  ];
  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
        <Brain size={13} className="text-violet-500" />
        <span className="text-[12px] font-semibold text-slate-700">方案对比 · 拍板参考</span>
        <span className="text-[10px] text-slate-400 ml-auto">任务调度官 · {msg.time}</span>
      </div>
      {/* Header row */}
      <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-100">
        {PLANS.map(plan => {
          const isChosen = chosen === plan.id;
          const isOther = chosen && chosen !== plan.id;
          return (
            <div key={plan.id} className="px-3 pt-3 pb-2 transition-all"
              style={{ background: isChosen ? '#f0fdf4' : isOther ? '#f8fafc' : plan.recommended ? '#fdfcf5' : 'white', opacity: isOther ? 0.55 : 1 }}>
              <div className="flex items-center gap-1 mb-1">
                {plan.recommended && !chosen && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-700">★ 推荐</span>
                )}
                {isChosen && <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-700">✓ 已选</span>}
              </div>
              <p className="text-[12px] font-bold text-slate-800 leading-tight">{plan.name}</p>
            </div>
          );
        })}
      </div>
      {/* 8 fields */}
      {FIELDS.map(({ key, label }) => (
        <div key={label} className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-50">
          {PLANS.map(plan => {
            const isChosen = chosen === plan.id;
            const isOther = chosen && chosen !== plan.id;
            const val = plan[key] as string;
            const isRisk = label === '风险提示';
            const isRenewal = label === '对续约影响';
            return (
              <div key={plan.id} className="px-3 py-2 transition-all"
                style={{ background: isChosen ? '#f0fdf4' : isOther ? '#f8fafc' : 'white', opacity: isOther ? 0.55 : 1 }}>
                {/* Only show label in first plan column */}
                {plan.id === 'A' && (
                  <p className="text-[9px] font-semibold text-slate-400 uppercase mb-0.5">{label}</p>
                )}
                {plan.id !== 'A' && <div className="h-3.5" />}
                <p className={`text-[11px] leading-snug ${
                  isRisk ? 'text-amber-600' :
                  isRenewal && val.startsWith('高') ? 'text-emerald-600 font-medium' :
                  isRenewal && val.startsWith('低') ? 'text-slate-400' :
                  'text-slate-600'
                }`}>{val}</p>
              </div>
            );
          })}
        </div>
      ))}
      {/* Recommended reason */}
      {!chosen && (
        <div className="px-4 py-2.5 bg-amber-50 border-b border-amber-100">
          <p className="text-[11px] text-amber-700">
            <span className="font-semibold">推荐方案B原因：</span>
            更接近问题全貌（经营+体验双修），产生的改善信号能同时说服招商侧，续约谈判筹码最强。
          </p>
        </div>
      )}
      {/* Action buttons */}
      {!chosen && (
        <div className="flex items-center gap-2 p-3 bg-slate-50">
          {PLANS.map(plan => (
            <button key={plan.id} onClick={() => onSelect(plan.id)}
              className="flex-1 py-2 rounded-xl text-[11px] font-semibold transition-all border"
              style={plan.recommended
                ? { background: '#1e293b', color: 'white', border: '1px solid #1e293b' }
                : { background: 'white', color: '#64748b', border: '1px solid #e2e8f0' }}>
              选方案{plan.id}
            </button>
          ))}
        </div>
      )}
      {chosen && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border-t border-emerald-100">
          <CheckCircle2 size={13} className="text-emerald-500" />
          <span className="text-[11px] text-emerald-700 font-medium">总经理已选择方案{chosen}，进入执行阶段</span>
        </div>
      )}
    </div>
  );
}

function TaskCard({ msg }: { msg: Msg }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border-b border-emerald-100">
        <ListChecks size={13} className="text-emerald-600" />
        <span className="text-[12px] font-semibold text-emerald-700">已生成 {TASKS.length} 项执行任务</span>
        <span className="text-[10px] text-emerald-400 ml-auto">任务调度官 · {msg.time}</span>
      </div>
      <div className="divide-y divide-slate-100">
        {TASKS.map(t => (
          <div key={t.no} className="px-4 py-3">
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 flex-shrink-0 mt-0.5">{t.no}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-slate-700">{t.title}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] text-slate-400">负责人：<span className="text-slate-600">{t.owner}</span></span>
                  <span className="text-[10px] text-slate-400">截止：<span className="text-slate-600">{t.deadline}</span></span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5">输出：{t.output}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border-t border-emerald-100 text-[11px] text-emerald-600">
        <CheckCircle2 size={12} />
        已同步：商户经营顾问 · 巡店督导 · 门店店长 · 招商经理
      </div>
    </div>
  );
}

function MemoryCard({ msg, onConfirm }: { msg: Msg; onConfirm: (id: string) => void }) {
  const done = msg.confirmed;
  return (
    <div className="rounded-2xl overflow-hidden border border-cyan-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 px-4 py-3 bg-cyan-50 border-b border-cyan-100">
        <Sparkles size={13} className="text-cyan-600" />
        <span className="text-[12px] font-semibold text-cyan-700">组织记忆草案</span>
        <span className="text-[10px] text-cyan-400 ml-auto">案例记忆官 · {msg.time}</span>
      </div>
      <div className="px-4 py-3">
        <p className="text-[12px] font-semibold text-slate-700 mb-2 leading-snug">
          《餐饮商户续约风险干预：经营修复 + 体验整改联合策略》
        </p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {['餐饮', '火锅', '续约风险', '体验整改', '套餐优化', '招商协同'].map(t => (
            <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">{t}</span>
          ))}
        </div>
        <p className="text-[11px] font-medium text-slate-600 mb-1.5">适用条件：</p>
        <div className="space-y-1">
          {['租约剩余 120 天以内', '客流未崩塌但消费质量下降', '招商侧尚未明确淘汰', '现场体验存在明显短板'].map((c, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <CheckCircle2 size={10} className="text-cyan-400 flex-shrink-0" />{c}
            </div>
          ))}
        </div>
      </div>
      <div className="px-4 pb-3">
        {!done ? (
          <div className="flex gap-2">
            <button onClick={() => onConfirm(msg.id)}
              className="flex-1 py-2 rounded-xl text-[11px] font-semibold bg-cyan-600 text-white hover:bg-cyan-700 transition-colors">
              确认沉淀到记忆中心
            </button>
            <button className="px-4 py-2 rounded-xl text-[11px] text-slate-500 border border-slate-200 hover:bg-slate-50 transition-colors">
              编辑后沉淀
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 py-2 text-[11px] text-emerald-600">
            <CheckCircle2 size={12} /><span>已沉淀为 · 案例 #2024-088</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   MESSAGE BUBBLE
════════════════════════════════════════════════════════════ */
function MsgBubble({ msg, onConsultApprove, onPlanSelect, onMemoryConfirm }: {
  msg: Msg;
  onConsultApprove: (id: string) => void;
  onPlanSelect: (p: 'A' | 'B' | 'C') => void;
  onMemoryConfirm: (id: string) => void;
}) {
  if (msg.type === 'phase-sep') {
    return (
      <div className="flex items-center gap-3 my-5 px-2">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-[11px] font-medium text-slate-400 px-2 py-1 rounded-full bg-white border border-slate-200">
          {msg.content}
        </span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>
    );
  }
  if (msg.type === 'system') {
    return (
      <div className="flex items-center gap-3 my-3 px-2">
        <div className="flex-1 h-px bg-slate-100" />
        <span className="text-[11px] text-slate-400 flex-shrink-0">{msg.content} · {msg.time}</span>
        <div className="flex-1 h-px bg-slate-100" />
      </div>
    );
  }
  if (msg.type === 'phase-conclusion' && msg.phaseConclusion) {
    return <PhaseConclusionCard pc={msg.phaseConclusion} />;
  }
  if (msg.type === 'judgment-revision') {
    return <JudgmentRevisionCard msg={msg} />;
  }
  if (msg.type === 'plan-card') {
    return <div className="my-4"><PlanCard msg={msg} onSelect={onPlanSelect} /></div>;
  }
  if (msg.type === 'task-card') {
    return <div className="my-4"><TaskCard msg={msg} /></div>;
  }
  if (msg.type === 'memory-card') {
    return <div className="my-4"><MemoryCard msg={msg} onConfirm={onMemoryConfirm} /></div>;
  }
  if (msg.type === 'gm' || msg.type === 'gm-decision') {
    const isDecision = msg.type === 'gm-decision';
    return (
      <div className="mb-4 flex justify-end">
        <div className="max-w-[78%]">
          <div className="flex items-center justify-end gap-2 mb-1.5">
            <span className="text-[10px] text-slate-400">{msg.time}</span>
            {isDecision
              ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">⚡ 拍板决策</span>
              : <span className="text-[10px] font-semibold text-amber-600">总经理</span>}
            <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">总</div>
          </div>
          <div className="rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed"
            style={{
              background: '#1e293b',
              color: '#e2e8f0',
              borderRight: isDecision ? '3px solid #f59e0b' : '3px solid #64748b',
            }}>
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
                strong: ({ children }) => <strong className="text-amber-300 font-semibold">{children}</strong>,
                ol: ({ children }) => <ol className="list-decimal list-inside space-y-1">{children}</ol>,
                li: ({ children }) => <li>{children}</li>,
              }}
            >{msg.content || ''}</ReactMarkdown>
          </div>
        </div>
      </div>
    );
  }
  if (msg.type === 'consultation') {
    const agent = AG[msg.agentId!];
    const waiting = msg.consultStatus === 'waiting';
    const approved = msg.consultStatus === 'approved';
    return (
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-5 h-5 rounded-full flex-shrink-0" style={{ background: agent.color }} />
          <span className="text-[12px] font-semibold" style={{ color: agent.tc }}>{agent.name}</span>
          <span className="text-[10px] text-slate-400">{agent.role}</span>
          <span className="text-[10px] text-slate-300 ml-auto">{msg.time}</span>
        </div>
        <div className="rounded-2xl border-2 overflow-hidden"
          style={{ borderColor: waiting ? '#fde68a' : approved ? '#bbf7d0' : '#fecdd3' }}>
          <div className="flex items-center gap-2 px-4 py-2.5"
            style={{ background: waiting ? '#fefce8' : approved ? '#f0fdf4' : '#fff1f2' }}>
            <span className="text-sm">{waiting ? '⚠' : approved ? '✅' : '❌'}</span>
            <span className="text-[11px] font-bold" style={{ color: waiting ? '#b45309' : approved ? '#15803d' : '#be123c' }}>
              {waiting ? '请示总经理' : approved ? '已同意' : '未同意'}
            </span>
            {waiting && <span className="ml-auto text-[10px] text-amber-400 animate-pulse">等待总经理回复…</span>}
            {approved && <span className="ml-auto text-[10px] text-emerald-500">招商经理将加入会商</span>}
          </div>
          <div className="px-4 py-3 bg-white">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="text-[13px] text-slate-600 leading-relaxed mb-2 last:mb-0">{children}</p>,
                strong: ({ children }) => <strong className="text-slate-800 font-semibold">{children}</strong>,
                ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 text-[13px] text-slate-600">{children}</ol>,
                li: ({ children }) => <li>{children}</li>,
                hr: () => <hr className="my-2 border-slate-200" />,
              }}
            >{msg.content || ''}</ReactMarkdown>
          </div>
          {waiting && (
            <div className="flex gap-2 px-4 pb-3 bg-white border-t border-amber-100 pt-2.5">
              <button onClick={() => onConsultApprove(msg.id)}
                className="flex-1 py-2 rounded-xl text-[12px] font-semibold bg-slate-900 text-white hover:bg-slate-700 transition-colors">
                同意加入
              </button>
              <button className="px-5 py-2 rounded-xl text-[12px] text-slate-500 border border-slate-200 hover:bg-slate-50 transition-colors">
                暂不加入
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
  // default: agent
  if (!msg.agentId) return null;
  const agent = AG[msg.agentId];
  return (
    <div className="mb-4 group">
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-5 h-5 rounded-full flex-shrink-0" style={{ background: agent.color }} />
        <span className="text-[12px] font-semibold" style={{ color: agent.tc }}>{agent.name}</span>
        <span className="text-[10px] text-slate-400">{agent.role}</span>
        <span className="text-[10px] text-slate-300 ml-auto">{msg.time}</span>
      </div>
      <div className="rounded-2xl rounded-tl-sm px-4 py-3"
        style={{ background: agent.bg, borderLeft: `3px solid ${agent.color}` }}>
        <ReactMarkdown
          components={{
            p: ({ children }) => <p className="text-[13px] text-slate-700 leading-relaxed mb-2 last:mb-0">{children}</p>,
            strong: ({ children }) => <strong className="font-semibold" style={{ color: agent.tc }}>{children}</strong>,
            ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 text-[13px] text-slate-700">{children}</ol>,
            li: ({ children }) => <li>{children}</li>,
          }}
        >{msg.content || ''}</ReactMarkdown>
        {msg.embed === 'data' && <DataEmbed />}
        {msg.embed === 'inspection' && <InspectionEmbed />}
        {msg.embed === 'case' && <CaseEmbed />}
      </div>
    </div>
  );
}

function TypingBubble({ agentId }: { agentId: AgentId }) {
  const agent = AG[agentId];
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-5 h-5 rounded-full" style={{ background: agent.color }} />
        <span className="text-[12px] font-semibold" style={{ color: agent.tc }}>{agent.name}</span>
      </div>
      <div className="inline-flex items-center gap-1 px-4 py-2.5 rounded-2xl rounded-tl-sm"
        style={{ background: agent.bg, borderLeft: `3px solid ${agent.color}` }}>
        {[0, 1, 2].map(i => (
          <span key={i} className="w-1.5 h-1.5 rounded-full bg-slate-400"
            style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   P0-1: BUSINESS THREAD CARD
════════════════════════════════════════════════════════════ */
function BusinessThreadCard({ thread, active, onClick }: {
  thread: typeof BUSINESS_THREADS[0]; active: boolean; onClick: () => void;
}) {
  return (
    <button onClick={onClick}
      className={`w-full text-left px-3 py-3 rounded-xl mb-2 border transition-all ${
        active
          ? 'bg-slate-900 border-slate-700 shadow-md'
          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
      }`}>
      {/* Title row */}
      <div className="flex items-start justify-between gap-1 mb-1.5">
        <div className="min-w-0">
          <p className={`text-[12px] font-bold leading-tight truncate ${active ? 'text-white' : 'text-slate-800'}`}>
            {thread.title}
          </p>
          <p className={`text-[10px] mt-0.5 ${active ? 'text-slate-400' : 'text-slate-500'}`}>{thread.subtitle}</p>
        </div>
        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold flex-shrink-0 mt-0.5 ${
          thread.badge === 'P0'
            ? (active ? 'bg-rose-500 text-white' : 'bg-rose-100 text-rose-600')
            : (active ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-700')
        }`}>{thread.badge}</span>
      </div>
      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-2">
        {thread.tags.map(tag => (
          <span key={tag} className={`text-[9px] px-1.5 py-0.5 rounded-full border ${
            active
              ? 'bg-white/10 text-slate-300 border-white/20'
              : 'bg-slate-50 text-slate-500 border-slate-200'
          }`}>{tag}</span>
        ))}
      </div>
      {/* Impact */}
      <p className={`text-[10px] font-semibold mb-1 ${active ? 'text-amber-300' : 'text-amber-600'}`}>
        ⚡ {thread.impact}
      </p>
      {/* Stage */}
      <p className={`text-[10px] ${active ? 'text-slate-300' : 'text-slate-500'}`}>
        {thread.stage}
      </p>
      {/* Consequence (P0 only) */}
      {thread.badge === 'P0' && (
        <div className={`mt-2 text-[9px] px-2 py-1.5 rounded-lg leading-snug ${
          active ? 'bg-rose-500/20 text-rose-300' : 'bg-rose-50 text-rose-500 border border-rose-100'
        }`}>
          ⚠ {thread.consequence}
        </div>
      )}
    </button>
  );
}

/* ════════════════════════════════════════════════════════════
   P0-3: CEO DIRECTIVE BAR
════════════════════════════════════════════════════════════ */
function CeoDirectiveBar({ currentPhase, participants, ceoInput, setCeoInput, onSend }: {
  currentPhase: Phase;
  participants: AgentId[];
  ceoInput: string;
  setCeoInput: (v: string) => void;
  onSend: () => void;
}) {
  const [showPicker, setShowPicker] = useState(false);
  const inPlanPhase = currentPhase === 'solution' || currentPhase === 'decision';

  const ALWAYS_DIRECTIVES = [
    { label: '先补证据', action: '在给出判断前，先补充更多数据支撑——' },
    { label: '换议题', action: '先搁置这个，我们先讨论——' },
    { label: '先诊断', action: '先不要给方案，我要先看清楚问题根因——' },
  ];
  const PLAN_DIRECTIVES = [
    { label: '只比A/B', action: '先不看方案C，只对比方案A和方案B——' },
    { label: '先看ROI', action: '在选方案之前，先给我每个方案的投入产出比——' },
    { label: '先试点', action: '建议先小范围试点验证，再决定是否全面铺开——' },
  ];

  return (
    <div className="flex-shrink-0 border-t border-slate-200 bg-white">
      <div className="px-3 pt-2.5 pb-1 space-y-1.5">
        {/* Row 1: always */}
        <div className="flex flex-wrap gap-1.5">
          {/* Agent picker */}
          <div className="relative">
            <button
              onClick={() => setShowPicker(p => !p)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-medium border transition-all ${
                showPicker
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'border-indigo-200 text-indigo-600 bg-indigo-50 hover:bg-indigo-100'
              }`}>
              <Users size={10} />
              <span>点名发言</span>
              <ChevronRight size={9} className={`transition-transform ${showPicker ? 'rotate-90' : ''}`} />
            </button>
            {showPicker && participants.length > 0 && (
              <div className="absolute bottom-full left-0 mb-1 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 min-w-[148px] z-20">
                <p className="text-[9px] text-slate-400 px-3 pb-1 border-b border-slate-100 mb-1">指定谁发言？</p>
                {participants.map(aid => {
                  const ag = AG[aid];
                  return (
                    <button key={aid}
                      onClick={() => {
                        setCeoInput(`@${ag.name} `);
                        setShowPicker(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-[11px] text-slate-700 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: ag.color }} />
                      {ag.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          {ALWAYS_DIRECTIVES.map(d => (
            <button key={d.label}
              onClick={() => { if (!ceoInput) setCeoInput(d.action); }}
              className="px-2.5 py-1 rounded-xl text-[11px] font-medium border border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all">
              {d.label}
            </button>
          ))}
        </div>
        {/* Row 2: plan phase only */}
        {inPlanPhase && (
          <div className="flex flex-wrap gap-1.5 pb-1 border-b border-dashed border-slate-200">
            <span className="text-[9px] text-violet-400 font-semibold self-center">拍板指令</span>
            {PLAN_DIRECTIVES.map(d => (
              <button key={d.label}
                onClick={() => { if (!ceoInput) setCeoInput(d.action); }}
                className="px-2.5 py-1 rounded-xl text-[11px] font-medium border border-violet-200 text-violet-600 bg-violet-50 hover:bg-violet-100 transition-all">
                {d.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 px-3 pb-2.5 pt-1">
        <input
          className="flex-1 text-[13px] text-slate-700 placeholder-slate-300 bg-transparent outline-none"
          placeholder="对会商说点什么，或 @某位 Agent…"
          value={ceoInput}
          onChange={e => setCeoInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend(); } }}
        />
        <button onClick={onSend}
          className="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-900 text-white hover:bg-slate-700 transition-colors flex-shrink-0">
          <Send size={13} />
        </button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════ */
export default function WorkspacePage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [scriptIdx, setScriptIdx] = useState(0);
  const [typingAgent, setTypingAgent] = useState<AgentId | null>(null);
  const [waitForCEO, setWaitForCEO] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState<1 | 2 | 3>(1);
  const [activeThread, setActiveThread] = useState('wangchao');
  const [ceoInput, setCeoInput] = useState('');
  const feedRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const msgCounter = useRef(0);

  const addMessage = useCallback((item: ScriptItem) => {
    msgCounter.current += 1;
    const msg: Msg = { ...item, id: `m${msgCounter.current}` };
    setMessages(prev => [...prev, msg]);
  }, []);

  /* Auto-play engine */
  useEffect(() => {
    if (isPaused || waitForCEO) { setTypingAgent(null); return; }
    if (scriptIdx >= SCRIPT.length) return;
    const item = SCRIPT[scriptIdx];
    const mult = 1 / speed;

    const finish = () => {
      addMessage(item);
      if (item.waitForCEO) {
        setWaitForCEO(true);
      } else {
        timerRef.current = setTimeout(() => setScriptIdx(i => i + 1), (item.pauseMs ?? 700) * mult);
      }
    };

    if (item.type === 'phase-sep' || item.type === 'system' || item.type === 'phase-conclusion' || item.type === 'judgment-revision') {
      timerRef.current = setTimeout(finish, 400 * mult);
    } else if (item.type === 'agent' && item.agentId) {
      setTypingAgent(item.agentId);
      timerRef.current = setTimeout(() => { setTypingAgent(null); finish(); }, (item.typingMs ?? 1400) * mult);
    } else {
      timerRef.current = setTimeout(finish, (item.typingMs ?? 700) * mult);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [scriptIdx, isPaused, waitForCEO, speed, addMessage]);

  /* Scroll to bottom */
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [messages, typingAgent]);

  /* Handlers */
  const handleConsultApprove = useCallback((id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, consultStatus: 'approved' } : m));
    setWaitForCEO(false);
    setScriptIdx(i => i + 1);
  }, []);

  const handlePlanSelect = useCallback((plan: 'A' | 'B' | 'C') => {
    setMessages(prev => prev.map(m => m.type === 'plan-card' && !m.selectedPlan ? { ...m, selectedPlan: plan } : m));
    setWaitForCEO(false);
    setScriptIdx(i => i + 1);
  }, []);

  const handleMemoryConfirm = useCallback((id: string) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, confirmed: true } : m));
    setWaitForCEO(false);
    setScriptIdx(i => i + 1);
  }, []);

  const handleCeoSend = useCallback(() => {
    if (!ceoInput.trim()) return;
    msgCounter.current += 1;
    const curPhase = messages[messages.length - 1]?.phase ?? 'discovery';
    setMessages(prev => [...prev, {
      id: `m${msgCounter.current}`, type: 'gm', content: ceoInput.trim(),
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }), phase: curPhase,
    }]);
    setCeoInput('');
  }, [ceoInput, messages]);

  /* Derived state */
  const participants = useMemo(() => {
    const seen = new Set<AgentId>(); const out: AgentId[] = [];
    messages.forEach(m => { if (m.agentId && !seen.has(m.agentId)) { seen.add(m.agentId); out.push(m.agentId); } });
    return out;
  }, [messages]);

  const pendingDecisions = useMemo(() =>
    messages.filter(m =>
      (m.type === 'consultation' && m.consultStatus === 'waiting') ||
      (m.type === 'plan-card' && !m.selectedPlan) ||
      (m.type === 'memory-card' && !m.confirmed)
    ), [messages]);

  const evidenceList = useMemo(() => messages.filter(m => m.embed), [messages]);
  const hasCase = useMemo(() => messages.some(m => m.embed === 'case'), [messages]);
  const hasTasks = useMemo(() => messages.some(m => m.type === 'task-card'), [messages]);
  const memoryDone = useMemo(() => messages.some(m => m.type === 'memory-card' && m.confirmed), [messages]);

  const currentPhase = useMemo(() => {
    const last = messages[messages.length - 1];
    return last?.phase ?? 'discovery';
  }, [messages]);

  const completedPhases = useMemo(() => {
    const seen = new Set<Phase>();
    messages.forEach(m => seen.add(m.phase));
    return seen;
  }, [messages]);

  const timeline = useMemo(() => {
    const events: { time: string; text: string }[] = [];
    messages.forEach(m => {
      if (m.type === 'phase-sep') events.push({ time: m.time, text: m.content || '' });
      else if (m.type === 'system') events.push({ time: m.time, text: m.content || '' });
      else if (m.type === 'gm-decision') events.push({ time: m.time, text: '总经理拍板决策' });
    });
    return events;
  }, [messages]);

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: '#f8fafc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }`}</style>

      {/* ── Global Bar ── */}
      <div className="flex-shrink-0 flex items-center gap-4 px-5 h-12 bg-white border-b border-slate-200 z-40">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-slate-900 flex items-center justify-center">
            <Zap size={12} className="text-white" />
          </div>
          <span className="text-[13px] font-bold text-slate-800">商户智运Agent</span>
          <span className="text-[10px] text-slate-400 ml-1">经营事项工作台</span>
        </div>
        <div className="flex-1 max-w-sm mx-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 text-[12px] text-slate-400">
            <Search size={12} /><span>搜索事项、商户、案例…</span>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold bg-slate-900 text-white hover:bg-slate-700 transition-colors">
            <Plus size={12} />发起新会商
          </button>
          <button className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors relative">
            <Bell size={14} className="text-slate-500" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
          </button>
          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-[10px] font-bold">总</div>
        </div>
      </div>

      {/* ── 3-panel ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left Rail: 经营事项盘 ── */}
        <div className="w-60 flex-shrink-0 bg-slate-50 border-r border-slate-200 flex flex-col overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-200 bg-white">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 text-[11px] text-slate-400">
              <Search size={11} /><span>搜索事项…</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto py-2">

            {/* 待我拍板 */}
            <div className="px-3 pt-1 pb-1">
              <div className="flex items-center gap-1.5 px-1 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse flex-shrink-0" />
                <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">待我拍板</p>
              </div>
              {BUSINESS_THREADS.filter(t => ['wangchao', 'b-event'].includes(t.id)).map(t => (
                <BusinessThreadCard key={t.id} thread={t} active={activeThread === t.id} onClick={() => setActiveThread(t.id)} />
              ))}
            </div>

            {/* 会商推进中 */}
            <div className="px-3 pb-1">
              <div className="flex items-center gap-1.5 px-1 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider">会商推进中</p>
              </div>
              {BUSINESS_THREADS.filter(t => t.id === 'xinxiang').map(t => (
                <BusinessThreadCard key={t.id} thread={t} active={activeThread === t.id} onClick={() => setActiveThread(t.id)} />
              ))}
            </div>

            {/* 自动运行 */}
            <div className="px-3 pb-1">
              <div className="flex items-center gap-1.5 px-1 mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">自动运行</p>
              </div>
              {[
                { id: 'morning', icon: '📋', title: '今日经营晨报', meta: 'AI生成 · 4家高风险', time: '09:30' },
                { id: 'scan', icon: '⚡', title: '全场商户风险扫描', meta: '已扫描83家', time: '09:00' },
              ].map(t => (
                <button key={t.id} className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-white transition-colors mb-1 border border-transparent hover:border-slate-200">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-sm">{t.icon}</span>
                    <span className="text-[11px] font-medium text-slate-600 truncate flex-1">{t.title}</span>
                    {t.id === 'scan' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />}
                  </div>
                  <p className="text-[10px] text-slate-400 pl-5">{t.meta}</p>
                </button>
              ))}
            </div>

            {/* 可复用经验 */}
            <div className="px-3">
              <div className="flex items-center gap-1.5 px-1 mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
                <p className="text-[10px] font-semibold text-cyan-600 uppercase tracking-wider">可复用经验</p>
              </div>
              <button className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-white transition-colors border border-transparent hover:border-slate-200">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-sm">📚</span>
                  <span className="text-[11px] font-medium text-slate-600 truncate">餐饮续约案例库</span>
                </div>
                <p className="text-[10px] text-slate-400 pl-5">23个案例 · 案例记忆官维护</p>
              </button>
            </div>
          </div>
        </div>

        {/* ── Center ── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Thread Header */}
          <div className="flex-shrink-0 px-5 py-3 bg-white border-b border-slate-200">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-rose-100 text-rose-700">🔴 续约风险</span>
                  <h2 className="text-[15px] font-bold text-slate-800">望潮港火锅：续约风险升级</h2>
                  <span className="text-[11px] text-slate-400">B2-08</span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[11px] text-slate-500">租约剩余 <span className="font-semibold text-rose-500">91天</span></span>
                  <span className="text-[11px] text-slate-300">·</span>
                  <span className="text-[11px] text-slate-500">干预窗口 <span className="font-semibold text-amber-500">45天</span></span>
                  <span className="text-[11px] text-slate-300">·</span>
                  <span className="text-[11px] text-slate-400">会商发起 09:23</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center gap-1 rounded-xl border border-slate-200 p-0.5 bg-white">
                  {([1, 2, 3] as const).map(s => (
                    <button key={s} onClick={() => setSpeed(s)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all"
                      style={{ background: speed === s ? '#1e293b' : 'transparent', color: speed === s ? 'white' : '#64748b' }}>
                      {s}x
                    </button>
                  ))}
                </div>
                <button onClick={() => setIsPaused(p => !p)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-medium border border-slate-200 hover:bg-slate-50 transition-colors">
                  {isPaused ? <><Play size={11} />继续</> : <><Pause size={11} />暂停</>}
                </button>
              </div>
            </div>

            {/* Phase progress */}
            <div className="flex items-center gap-1 mt-3 overflow-x-auto pb-0.5">
              {PHASES.map((ph, idx) => {
                const done = completedPhases.has(ph.id);
                return (
                  <React.Fragment key={ph.id}>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center"
                        style={{ background: done ? '#1e293b' : '#e2e8f0' }}>
                        {done && <CheckCircle2 size={10} className="text-white" />}
                      </div>
                      <span className={`text-[10px] font-medium ${done ? 'text-slate-700' : 'text-slate-400'}`}>
                        {ph.label}
                      </span>
                    </div>
                    {idx < PHASES.length - 1 && <ChevronRight size={10} className="text-slate-300 flex-shrink-0" />}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Message Feed */}
          <div ref={feedRef} className="flex-1 overflow-y-auto px-5 py-4">
            {messages.map(msg => (
              <MsgBubble key={msg.id} msg={msg}
                onConsultApprove={handleConsultApprove}
                onPlanSelect={handlePlanSelect}
                onMemoryConfirm={handleMemoryConfirm} />
            ))}
            {typingAgent && <TypingBubble agentId={typingAgent} />}
            {scriptIdx >= SCRIPT.length && messages.length > 0 && (
              <div className="text-center py-6">
                <span className="text-[11px] text-slate-400 px-4 py-2 rounded-full bg-slate-100">会商已结案 · 全部内容已沉淀</span>
              </div>
            )}
          </div>

          {/* P0-3: CEO Directive Bar */}
          {waitForCEO && pendingDecisions.length > 0 && (
            <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-amber-50 border-t border-amber-100">
              <AlertTriangle size={12} className="text-amber-500 flex-shrink-0" />
              <span className="text-[11px] text-amber-700">有 {pendingDecisions.length} 项等待你的决策，请在上方消息中操作</span>
            </div>
          )}
          <CeoDirectiveBar
            currentPhase={currentPhase}
            participants={participants}
            ceoInput={ceoInput}
            setCeoInput={setCeoInput}
            onSend={handleCeoSend}
          />
        </div>

        {/* ── Right Panel ── */}
        <div className="w-72 flex-shrink-0 bg-white border-l border-slate-200 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">

            {/* Current topic */}
            <div className="px-4 py-3 border-b border-slate-100">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">当前议题</p>
              <p className="text-[12px] font-semibold text-slate-700 mb-1">望潮港火锅：续约风险升级</p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-600 font-medium">🔴 高危</span>
                <span className="text-[10px] text-slate-400">干预窗口 45 天</span>
              </div>
            </div>

            {/* Participants */}
            <div className="px-4 py-3 border-b border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">参会成员 ({participants.length})</p>
                <button className="text-[10px] text-slate-400 hover:text-slate-600 flex items-center gap-0.5">
                  <Plus size={9} />邀请
                </button>
              </div>
              {participants.length === 0 && (
                <p className="text-[11px] text-slate-300">等待 Agent 加入…</p>
              )}
              <div className="space-y-2">
                {participants.map(aid => {
                  const ag = AG[aid];
                  const isNew = aid === 'merchant' && messages.some(m => m.type === 'system' && m.content?.includes('招商经理'));
                  return (
                    <div key={aid} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: ag.color }} />
                      <span className="text-[11px] text-slate-600 flex-1 truncate">{ag.name}</span>
                      {isNew && <span className="text-[9px] px-1 py-0.5 rounded bg-indigo-100 text-indigo-600 font-bold">新</span>}
                      <span className="text-[10px] text-emerald-500 flex-shrink-0">在会</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pending decisions */}
            {pendingDecisions.length > 0 && (
              <div className="px-4 py-3 border-b border-amber-100 bg-amber-50/50">
                <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider mb-2">
                  待总经理决策 ({pendingDecisions.length})
                </p>
                <div className="space-y-1.5">
                  {pendingDecisions.map(m => (
                    <div key={m.id} className="flex items-center gap-2 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
                      <span className="text-amber-700">
                        {m.type === 'consultation' ? '是否邀请招商经理' : m.type === 'plan-card' ? '选择执行方案' : '确认记忆沉淀'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Evidence */}
            {evidenceList.length > 0 && (
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">已收集证据 ({evidenceList.length})</p>
                <div className="space-y-1.5">
                  {evidenceList.map((m, i) => (
                    <div key={i} className="flex items-center gap-2 text-[11px]">
                      <span>{m.embed === 'data' ? '📊' : m.embed === 'inspection' ? '📋' : '📎'}</span>
                      <span className="text-slate-600">
                        {m.embed === 'data' ? '经营数据 · 商户经营顾问' : m.embed === 'inspection' ? '巡店记录 · 巡店督导' : '活动数据 · 活动策略师'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cases */}
            {hasCase && (
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">已引用案例 (1)</p>
                <div className="flex items-center gap-2 text-[11px]">
                  <BookOpen size={11} className="text-cyan-500" />
                  <div>
                    <p className="text-slate-600">CASE-2024-087</p>
                    <p className="text-slate-400 text-[10px]">相似度 87% · 成功续约</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tasks */}
            {hasTasks && (
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">已生成任务 ({TASKS.length})</p>
                <div className="space-y-1.5">
                  {TASKS.map(t => (
                    <div key={t.no} className="flex items-start gap-2 text-[11px]">
                      <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[9px] font-bold flex-shrink-0 mt-0.5">{t.no}</span>
                      <div>
                        <p className="text-slate-600">{t.title}</p>
                        <p className="text-slate-400 text-[10px]">{t.owner} · {t.deadline}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Memory */}
            {memoryDone && (
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">已沉淀记忆</p>
                <div className="flex items-center gap-2 text-[11px]">
                  <Sparkles size={11} className="text-cyan-500" />
                  <span className="text-slate-600">案例 #2024-088 · 餐饮续约干预</span>
                </div>
              </div>
            )}

            {/* Timeline */}
            {timeline.length > 0 && (
              <div className="px-4 py-3">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">会议纪要</p>
                <div className="space-y-1.5">
                  {timeline.map((e, i) => (
                    <div key={i} className="flex items-start gap-2 text-[10px]">
                      <span className="text-slate-300 flex-shrink-0 w-8">{e.time}</span>
                      <span className="text-slate-500">{e.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
