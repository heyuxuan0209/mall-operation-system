'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
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
type BusinessTab = 'operations' | 'risk' | 'merchant' | 'event' | 'knowledge';

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
  embed?: 'data' | 'inspection' | 'case' | 'data-xinxiang' | 'inspection-xinxiang' | 'data-bevent';
  consultStatus?: 'waiting' | 'approved' | 'rejected';
  selectedPlan?: 'A' | 'B' | 'C';
  confirmed?: boolean;
  waitForCEO?: boolean;
  phaseConclusion?: PhaseConclusion;
  revisions?: { from: string; to: string }[];
  memoryTitle?: string;
  memoryTags?: string[];
  memoryConditions?: string[];
  // Lifecycle transition fields
  lifecycleFrom?: IssueLifecycle;
  lifecycleTo?: IssueLifecycle;
  lifecycleTrigger?: string;
}
interface ScriptItem extends Omit<Msg, 'id'> { typingMs?: number; pauseMs?: number; }

interface CustomThread {
  id: string; merchantName: string; merchantCode: string;
  issueType: string; issueBadge: string; issueColorCls: string;
  note: string; createdAt: string;
}

/* ════════════════════════════════════════════════════════════
   LIFECYCLE STATE MACHINE
════════════════════════════════════════════════════════════ */
type IssueLifecycle =
  | 'auto-detected'    // 自动识别
  | 'suggest-escalate' // 建议升级
  | 'in-deliberation'  // 联合研判中
  | 'pending-consult'  // 等待请示
  | 'pending-decision' // 等待拍板
  | 'decided'          // 已拍板
  | 'in-execution'     // 执行中
  | 'pending-review'   // 待复盘
  | 'archived';        // 已沉淀

interface LifecycleStateDef {
  label: string;
  meaning: string;
  entryCondition: string;
  nextAction: string;
  owner: string;
  needsGM: boolean;
  colorCls: string;
  dotColor: string;
}

const LIFECYCLE_STATES: Record<IssueLifecycle, LifecycleStateDef> = {
  'auto-detected':    { label: '自动识别',   meaning: 'Agent 扫描发现异动，尚未人工确认',       entryCondition: '数据指标触发预警阈值',           nextAction: '确认是否升级为联合研判',     owner: '风险诊断师',   needsGM: false, colorCls: 'bg-slate-100 text-slate-600',   dotColor: '#94a3b8' },
  'suggest-escalate': { label: '建议升级',   meaning: 'Agent 建议发起联合研判，等待总经理确认', entryCondition: '风险定级 P0/P1，影响面超阈值',   nextAction: '总经理确认是否发起联合研判',   owner: '风险诊断师',   needsGM: true,  colorCls: 'bg-amber-100 text-amber-700',   dotColor: '#f59e0b' },
  'in-deliberation':  { label: '联合研判中', meaning: '多 Agent 正在协同分析，收集证据',        entryCondition: '总经理确认发起联合研判',         nextAction: '等待证据收敛，形成判断结论',   owner: '联合研判团队', needsGM: false, colorCls: 'bg-blue-100 text-blue-700',     dotColor: '#3b82f6' },
  'pending-consult':  { label: '等待请示',   meaning: '超出 Agent 权限，需总经理指示方向',      entryCondition: '议题涉及跨部门或高风险决策',     nextAction: '总经理给出研判方向指示',       owner: '总经理',       needsGM: true,  colorCls: 'bg-orange-100 text-orange-700', dotColor: '#f97316' },
  'pending-decision': { label: '等待拍板',   meaning: '方案已收敛，等待总经理最终决策',         entryCondition: '方案对比完成，推荐方案已明确',   nextAction: '总经理选择执行方案并批预算',   owner: '总经理',       needsGM: true,  colorCls: 'bg-rose-100 text-rose-600',     dotColor: '#f43f5e' },
  'decided':          { label: '已拍板',     meaning: '总经理已做出决策，等待任务生成',         entryCondition: '总经理选定方案',                 nextAction: '任务调度官生成执行任务',       owner: '任务调度官',   needsGM: false, colorCls: 'bg-violet-100 text-violet-700', dotColor: '#7c3aed' },
  'in-execution':     { label: '执行中',     meaning: '执行任务已分配，各责任人推进中',         entryCondition: '执行任务已生成并同步',           nextAction: '按领先指标追踪执行进度',       owner: '各任务责任人', needsGM: false, colorCls: 'bg-emerald-100 text-emerald-700', dotColor: '#16a34a' },
  'pending-review':   { label: '待复盘',     meaning: '执行周期结束，等待复盘验证结果',         entryCondition: '执行截止时间到达或领先指标可读', nextAction: '对比预期指标，形成复盘结论',   owner: '风险诊断师',   needsGM: false, colorCls: 'bg-cyan-100 text-cyan-700',     dotColor: '#0891b2' },
  'archived':         { label: '已沉淀',     meaning: '复盘结论已沉淀为组织记忆，可复用',       entryCondition: '复盘结论确认，记忆官完成归档',   nextAction: '下次同类议题自动引用',         owner: '案例记忆官',   needsGM: false, colorCls: 'bg-slate-100 text-slate-500',   dotColor: '#64748b' },
};

/* ════════════════════════════════════════════════════════════
   DECISION OBJECT (决策对象)
════════════════════════════════════════════════════════════ */
interface DecisionObject {
  id: string;
  question: string;
  options: { id: string; label: string; recommended: boolean }[];
  recommendedOption: string;
  recommendReason: string;
  keyEvidence: string[];
  risks: string;
  decisionMaker: string;
  deadline: string;
  result?: string;
  verificationMetrics: string[];
}

const WANGCHAO_DECISION: DecisionObject = {
  id: 'dec-wangchao-001',
  question: '在91天续约窗口内，选择哪个干预方案能最大化续约成功概率？',
  options: [
    { id: 'A', label: '方案A · 经营修复优先（¥3-5万）', recommended: false },
    { id: 'B', label: '方案B · 修复＋体验整改（¥8-12万）', recommended: true },
    { id: 'C', label: '方案C · 活动拉新优先（¥6-8万）', recommended: false },
  ],
  recommendedOption: '方案B',
  recommendReason: '经营+体验双修，产生的改善信号能同时说服招商侧，30天内最可能改变"观察→保留"评级',
  keyEvidence: [
    '客单价下降12%，消费质量恶化（商户经营顾问）',
    '现场体验5项短板，拖累复购（巡店督导）',
    '招商侧仍保留窗口，30天改善可影响评分（招商经理）',
    '历史案例相似度87%，体验整改是关键（案例记忆官）',
  ],
  risks: '执行协同复杂度中等，需总经理授权推进，预算需先批第一阶段',
  decisionMaker: '总经理',
  deadline: '今日内',
  verificationMetrics: ['2周：人均消费回升≥5%', '2周：差评率降至5%以内', '30天：客单价≥¥128', '30天：招商侧评级回到"优先保留"'],
};

/* ════════════════════════════════════════════════════════════
   EVIDENCE LEDGER (证据账本)
════════════════════════════════════════════════════════════ */
type EvidenceType = '经营数据' | '现场证据' | '历史案例' | '招商判断' | '活动数据' | '客诉反馈';

interface EvidenceItem {
  id: string;
  type: EvidenceType;
  summary: string;
  provider: string;
  updatedAt: string;
  supportsJudgment: string;
  credibility: 'high' | 'medium' | 'low';
}

const EVIDENCE_TYPE_COLOR: Record<EvidenceType, string> = {
  '经营数据': 'bg-blue-100 text-blue-700',
  '现场证据': 'bg-green-100 text-green-700',
  '历史案例': 'bg-cyan-100 text-cyan-700',
  '招商判断': 'bg-indigo-100 text-indigo-700',
  '活动数据': 'bg-amber-100 text-amber-700',
  '客诉反馈': 'bg-orange-100 text-orange-700',
};

const WANGCHAO_EVIDENCE: EvidenceItem[] = [
  { id: 'ev1', type: '经营数据', summary: '人均消费↓12%，高毛利单品占比从42%降至31%，翻台率↓14%', provider: '商户经营顾问', updatedAt: '09:29', supportsJudgment: '消费质量恶化，非纯流量问题', credibility: 'high' },
  { id: 'ev2', type: '活动数据', summary: '两次活动客流+11%但客单-9%，复购率18%低于行业均值27%', provider: '活动策略师', updatedAt: '09:31', supportsJudgment: '活动带来低质量流量，不建议继续补贴', credibility: 'high' },
  { id: 'ev3', type: '现场证据', summary: '5项体验短板：服务响应慢、导视弱、照明不足、出品慢、卫生间问题', provider: '巡店督导', updatedAt: '09:33', supportsJudgment: '现场体验拖累复购，放大经营恶化', credibility: 'high' },
  { id: 'ev4', type: '历史案例', summary: '相似度87%案例：体验整改→套餐优化→续约沟通，21天见效', provider: '案例记忆官', updatedAt: '09:35', supportsJudgment: '干预策略可复用，优先前移体验整改', credibility: 'medium' },
  { id: 'ev5', type: '招商判断', summary: '续约优先级已从"保留"降至"观察"，30天改善信号可逆转', provider: '招商经理', updatedAt: '09:41', supportsJudgment: '经营改善仍可影响续约评分，窗口短', credibility: 'high' },
];

/* ════════════════════════════════════════════════════════════
   EXECUTION VERIFICATION (执行验证闭环)
════════════════════════════════════════════════════════════ */
interface ExecutionTask {
  no: number;
  title: string;
  owner: string;
  deadline: string;
  leadIndicator: string;
  actualResult?: string;
  onTarget?: boolean;
  reviewConclusion?: string;
  archived?: boolean;
}

const WANGCHAO_EXECUTION_TASKS: ExecutionTask[] = [
  { no: 1, title: '套餐结构优化', owner: '商户经营顾问', deadline: '3天内', leadIndicator: '高毛利单品占比回升≥5pt', actualResult: undefined, onTarget: undefined },
  { no: 2, title: '店外导视与门头轻改', owner: '巡店督导', deadline: '5天内', leadIndicator: '进店意愿评分提升', actualResult: undefined, onTarget: undefined },
  { no: 3, title: '晚高峰服务响应整改', owner: '门店店长', deadline: '7天内', leadIndicator: '差评率降至5%以内', actualResult: undefined, onTarget: undefined },
  { no: 4, title: '两周复盘', owner: '风险诊断师', deadline: '14天后', leadIndicator: '人均消费≥¥128，差评率≤5%，招商评级回升', actualResult: undefined, onTarget: undefined },
];

/* ════════════════════════════════════════════════════════════
   THREAD LIFECYCLE MAP (每个议题线程的当前生命周期状态)
════════════════════════════════════════════════════════════ */
const THREAD_LIFECYCLE: Record<string, IssueLifecycle> = {
  wangchao:       'pending-decision',
  xinxiang:       'in-deliberation',
  'b-event':      'pending-review',
  'morning-report': 'auto-detected',
};

/* ════════════════════════════════════════════════════════════
   BUSINESS TABS
════════════════════════════════════════════════════════════ */
const BUSINESS_TABS: { id: BusinessTab; label: string; badge?: number }[] = [
  { id: 'operations', label: '今日经营' },
  { id: 'risk',       label: '风险研判', badge: 2 },
  { id: 'merchant',   label: '招商协同', badge: 1 },
  { id: 'event',      label: '活动复盘', badge: 1 },
  { id: 'knowledge',  label: '组织经验' },
];

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
    impactDomain: '续约' as const,
    stage: '等待总经理拍板',
    bottleneck: '等待总经理选择执行方案',
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
    impactDomain: '租金' as const,
    stage: '联合研判中 · 待诊断结论',
    bottleneck: '等待补充现场体验证据',
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
    impactDomain: '活动预算' as const,
    stage: '等待你的指示',
    bottleneck: '等待总经理确认复盘结论',
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
    type: 'system', time: '09:23', phase: 'discovery',
    lifecycleFrom: 'auto-detected', lifecycleTo: 'suggest-escalate',
    lifecycleTrigger: '风险定级 P0，影响面超阈值（续约风险 + 坪效下滑22%）',
    content: '状态流转：自动识别 → 建议升级'
  },
  {
    type: 'agent', agentId: 'risk', time: '09:23', phase: 'discovery',
    typingMs: 1800, pauseMs: 1400,
    content: `在今日 09:23 的例行经营扫描中，我检测到**望潮港火锅**出现多项关键异常，建议立即发起联合研判：

1. 租约剩余 **91 天**，已进入续约高风险窗口
2. 过去 90 天坪效持续下滑 **22%**
3. 本月客诉 **18 条**，环比上升 35%
4. 最近两次周末活动均未达到预期转化
5. 历史同类商户若在该阶段未干预，续约失败概率超过 **60%**

**风险定级：P0 级 — 续约风险**

初步判断：当前问题已不是单纯经营波动，可能已升级为"经营表现影响续约意愿"的复合型风险。

**不干预后果：** 48小时内不启动联合研判，续约可能性将降至40%，预计损失 ≈ ¥86万/年租金收入。

建议立即启动多 Agent 联合研判。`,
  },
  /* ── Phase: evidence ── */
  { type: 'phase-sep', time: '09:29', phase: 'evidence', content: '补充证据' },
  {
    type: 'agent', agentId: 'advisor', time: '09:29', phase: 'evidence',
    typingMs: 2000, pauseMs: 1200, embed: 'data',
    content: `我已补充调取该商户近 6 个月经营数据，从经营逻辑角度给出判断：

**核心问题不是"人少了"，而是"来的人花得更少了"。**

数据显示：
• 客流量下降 **8%**（相对温和）
• 但人均消费下降 **12%**（更严重）
• 高毛利单品（锅底+特色菜）销售占比从 42% 降至 **31%**
• 翻台率从 4.2 降至 **3.6 次/天**

这意味着门店不是没客人，而是**消费结构在恶化**——顾客愿意进店，但不愿意高质量消费。

我倾向判断：问题可能出在「产品吸引力 + 套餐结构 + 门店体验」，而不只是外部流量。

**如果不干预：** 消费质量持续恶化，即使客流回升，坪效也难以达标，招商侧会认为"经营能力不足"。`,
  },
  {
    type: 'agent', agentId: 'campaign', time: '09:31', phase: 'evidence',
    typingMs: 1800, pauseMs: 1200,
    content: `我补充活动与转化侧数据。过去 60 天参加了 2 次大型促销：**3月周年庆**、**4月春季餐饮节**。

**活动效果分析：**
• 活动期间客流提升 **11%**，但客单价下降 **9%**
• 活动后 7 天复购率 **18%**，低于同业平均 **27%**
• 优惠券核销率高达 **73%**，但会员留存转化仅 **12%**

**我的判断：** 目前问题不是"活动没做"，而是"活动做成了低质量流量"，吸引的是价格敏感型顾客，没有改善续约价值。

**我不建议继续简单加促销补贴。** 这会进一步恶化消费结构，让招商侧认为"只能靠补贴维持"。`,
  },
  {
    type: 'agent', agentId: 'inspector', time: '09:33', phase: 'evidence',
    typingMs: 1600, pauseMs: 1200, embed: 'inspection',
    content: `我补充现场体验证据。根据最近两次巡店记录（3月15日、4月8日），这家店存在几个可能影响消费体验的关键问题：

**现场短板（5项）：**
1. 晚高峰时段服务响应慢，顾客等待时间超 **15 分钟**
2. 门店外立面陈旧，导视不清晰，进店意愿受影响
3. 部分座位区照明不足，影响就餐氛围
4. 菜品出品速度慢，锅底上桌平均 **12 分钟**（标准 8 分钟）
5. 卫生间清洁频次不足，晚高峰后明显脏乱

**我的判断：** 这不是纯运营数据问题，**现场体验确实在拖后腿**。如果我们只看经营报表，可能会低估「线下体验因素」对续约的影响。

**如果不改善：** 即使做活动拉客流，顾客体验差会导致复购率低，招商侧会认为"门店管理能力不足"。`,
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
    type: 'system', time: '09:37', phase: 'consultation',
    lifecycleFrom: 'in-deliberation', lifecycleTo: 'pending-consult',
    lifecycleTrigger: '议题涉及续约策略判断，超出经营 Agent 权限范围',
    content: '状态流转：联合研判中 → 等待请示'
  },
  {
    type: 'consultation', agentId: 'risk', time: '09:37', phase: 'consultation',
    consultStatus: 'waiting', waitForCEO: true,
    typingMs: 1400, pauseMs: 500,
    content: `当前问题已不只是经营优化，而涉及**续约策略判断**，超出经营 Agent 判断范围。建议邀请「**招商经理**」加入本次联合研判，请问是否同意？`,
  },
  {
    type: 'gm', time: '09:38', phase: 'consultation',
    typingMs: 1000, pauseMs: 1000,
    content: `同意拉招商经理入会。

但我先追问两个问题：
1. 你们现在判断这个问题核心更偏**"门店经营能力"**，还是**"招商位置与续约关系"**？
2. 如果只给 30 天窗口，最值得优先验证的动作是什么？`,
  },
  { type: 'system', time: '09:40', phase: 'consultation', pauseMs: 600, content: '招商经理 已加入联合研判' },
  {
    type: 'agent', agentId: 'merchant', time: '09:41', phase: 'consultation',
    typingMs: 1800, pauseMs: 1000,
    content: `我补充招商侧信息：

**续约评级现状：**
1. 望潮港目前**不是**我们最想淘汰的商户
2. 但最近一期评估里，续约优先级已从"保留"**降到"观察"**
3. 原因不是租金问题，而是整体经营表现变弱
4. 如果接下来 30 天没有改善信号，招商侧会考虑替换方案

**这意味着什么：**
• 经营改善仍然有机会影响续约结果，但**窗口非常短**
• 招商侧最看重的信号：客单价回升、差评率下降、门店形象改善
• 如果 2 周后能看到这三个指标改善，我这边就有理由把它从"观察"重新拉回**"优先保留"**

**我的建议：** 先不要进入正式续约谈判，而是给出一轮明确、可验证的经营改善动作，再决定后续谈判策略。`,
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
    type: 'system', time: '09:46', phase: 'solution',
    lifecycleFrom: 'in-deliberation', lifecycleTo: 'pending-decision',
    lifecycleTrigger: '方案对比完成，推荐方案已明确（方案B）',
    content: '状态流转：联合研判中 → 等待拍板'
  },
  {
    type: 'agent', agentId: 'scheduler', time: '09:46', phase: 'solution',
    typingMs: 900, pauseMs: 700,
    content: `基于当前联合研判进展，我开始收敛执行方案。

**本轮研判目标：** 在91天续约窗口内，产生招商侧认可的改善信号，保住"优先保留"评级。

**关键约束：**
• 时间窗口：30天内必须见效
• 验证指标：2周后先看领先指标（客单价、差评率、门店形象）
• 招商侧最看重：经营能力恢复 + 现场体验改善

目前形成三个可行方向，每个方案已按8个维度完整评估，请总经理参与拍板。`,
  },
  {
    type: 'plan-card', time: '09:47', phase: 'solution',
    waitForCEO: true, typingMs: 500, pauseMs: 500,
  },
  /* ── Phase: decision ── */
  { type: 'phase-sep', time: '09:49', phase: 'decision', content: '总经理决策参与' },
  {
    type: 'system', time: '09:49', phase: 'decision',
    lifecycleFrom: 'pending-decision', lifecycleTo: 'decided',
    lifecycleTrigger: '总经理选定方案B，批准第一阶段预算',
    content: '状态流转：等待拍板 → 已拍板（待总经理确认方案）'
  },
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
4. 请立即生成执行任务，并把本次联合研判沉淀为后续可复用案例`,
  },
  /* ── Phase: execution ── */
  { type: 'phase-sep', time: '09:53', phase: 'execution', content: '进入执行' },
  {
    type: 'system', time: '09:53', phase: 'execution',
    lifecycleFrom: 'decided', lifecycleTo: 'in-execution',
    lifecycleTrigger: '执行任务已生成并同步给各责任人',
    content: '状态流转：已拍板 → 执行中'
  },
  {
    type: 'task-card', agentId: 'scheduler', time: '09:53', phase: 'execution',
    typingMs: 800, pauseMs: 1000,
  },
  /* ── Phase: archive ── */
  { type: 'phase-sep', time: '09:55', phase: 'archive', content: '沉淀记忆' },
  {
    type: 'system', time: '09:55', phase: 'archive',
    lifecycleFrom: 'in-execution', lifecycleTo: 'archived',
    lifecycleTrigger: '复盘结论确认，案例记忆官完成归档',
    content: '状态流转：执行中 → 待复盘 → 已沉淀'
  },
  {
    type: 'memory-card', agentId: 'memory', time: '09:55', phase: 'archive',
    waitForCEO: true, typingMs: 900, pauseMs: 500,
    content: '已将本次联合研判沉淀为组织记忆草案，是否确认沉淀到组织记忆中心？',
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
   THREAD META
════════════════════════════════════════════════════════════ */
const THREAD_META: Record<string, {
  badge: string; title: string; riskBadge: string;
  riskColorCls: string; window: string; code: string; startTime: string;
}> = {
  wangchao: {
    badge: '🔴 续约风险', title: '望潮港火锅：续约风险升级',
    riskBadge: '🔴 高危', riskColorCls: 'bg-rose-100 text-rose-600',
    window: '45天', code: 'B2-08', startTime: '09:23',
  },
  xinxiang: {
    badge: '🟡 经营下滑', title: '辛香汇：经营持续下滑',
    riskBadge: '🟡 中风险', riskColorCls: 'bg-amber-100 text-amber-700',
    window: '3周', code: 'A3-15', startTime: '09:55',
  },
  'b-event': {
    badge: '🔵 活动复盘', title: 'B区周末活动复盘',
    riskBadge: '🔵 待决策', riskColorCls: 'bg-blue-100 text-blue-700',
    window: '3周后', code: 'B区', startTime: '昨天 17:00',
  },
  'morning-report': {
    badge: '📋 今日晨报', title: '今日经营晨报',
    riskBadge: '📋 自动生成', riskColorCls: 'bg-slate-100 text-slate-600',
    window: '全场83家', code: '09:30 自动', startTime: '09:30',
  },
};

/* ════════════════════════════════════════════════════════════
   NEW CONSULT: MERCHANT & ISSUE OPTIONS
════════════════════════════════════════════════════════════ */
const MERCHANT_OPTIONS = [
  { id: 'starbucks', name: '星巴克',    code: 'C1-03' },
  { id: 'haidilao',  name: '海底捞',    code: 'A2-07' },
  { id: 'uniqlo',    name: '优衣库',    code: 'B1-02' },
  { id: 'heytea',    name: '喜茶',      code: 'C2-11' },
  { id: 'taiersf',   name: '太二酸菜鱼', code: 'A3-09' },
  { id: 'mcdonalds', name: '麦当劳',    code: 'B2-04' },
  { id: 'miniso',    name: '名创优品',  code: 'C3-06' },
  { id: 'pagoda',    name: '百果园',    code: 'A1-12' },
];

const ISSUE_TYPES = [
  { id: 'renewal',     label: '续约风险',   badge: '🔴', colorCls: 'bg-rose-100 text-rose-600' },
  { id: 'decline',     label: '经营下滑',   badge: '🟡', colorCls: 'bg-amber-100 text-amber-700' },
  { id: 'event',       label: '活动复盘',   badge: '🔵', colorCls: 'bg-blue-100 text-blue-700' },
  { id: 'complaint',   label: '客诉处理',   badge: '🟠', colorCls: 'bg-orange-100 text-orange-700' },
  { id: 'newmerchant', label: '新商户启动', badge: '🟢', colorCls: 'bg-emerald-100 text-emerald-700' },
];

/* ════════════════════════════════════════════════════════════
   XINXIANG DATA
════════════════════════════════════════════════════════════ */
const XINXIANG_DATA_ROWS = [
  { label: '月均营业额', from: '¥41万', to: '¥31万', pct: '-24.4%', warn: true },
  { label: '月均客流',   from: '6,200',  to: '5,100',  pct: '-17.7%', warn: true },
  { label: '人均消费',   from: '¥66',    to: '¥61',    pct: '-7.6%',  warn: false },
  { label: '差评率',     from: '2.1%',   to: '4.8%',   pct: '+2.7pt', warn: true },
  { label: '翻台率',     from: '4.2次/天', to: '3.1次/天', pct: '-26.2%', warn: true },
];
const XINXIANG_INSPECTION_ITEMS = [
  '新品陈列面积不足30%，老品占核心位',
  '导购话术弱，询价转化率仅12%',
  '候台区无内容，等位体验评分2.1/5',
];
const XINXIANG_TASKS = [
  { no: 1, title: '新品陈列全面更新',  owner: '商户经营顾问', deadline: '3天内',  output: '新品陈列改造方案' },
  { no: 2, title: '导购话术专项培训',  owner: '巡店督导',     deadline: '5天内',  output: '话术手册 + 培训记录' },
  { no: 3, title: '2周效果追踪复盘',   owner: '风险诊断师',   deadline: '14天后', output: '差评率 / 翻台率 / 营业额变化' },
];

/* ════════════════════════════════════════════════════════════
   B-EVENT DATA
════════════════════════════════════════════════════════════ */
const BEVENT_DATA_ROWS = [
  { label: '目标总客流',   from: '2000人次', to: '1340人次', pct: '-33%',    warn: true },
  { label: '活动ROI',      from: '目标2.1',  to: '实际1.4',  pct: '-33%',    warn: true },
  { label: '优惠券核销',   from: '目标60%',  to: '实际71%',  pct: '+11pt',   warn: false },
  { label: '周末客流达成', from: '目标100%', to: '实际67%',  pct: '-33pt',   warn: true },
  { label: '新会员转化',   from: '目标120人', to: '实际89人', pct: '-25.8%', warn: false },
];

/* ════════════════════════════════════════════════════════════
   XINXIANG MSG ARRAYS (static)
════════════════════════════════════════════════════════════ */
const XINXIANG_BASE_MSGS: Msg[] = [
  { id: 'xx1', type: 'phase-sep', time: '09:55', phase: 'discovery', content: '发现问题' },
  {
    id: 'xx2', type: 'agent', agentId: 'risk', time: '09:55', phase: 'discovery',
    content: `在今日例行扫描中，检测到**辛香汇**出现多项经营下滑信号：\n\n1. 月均营业额连续3个月下滑，累计降幅 **24.4%**\n2. 差评率从2.1%升至 **4.8%**，客诉量环比 +18条\n3. 翻台率从4.2下降至 **3.1次/天**，高峰时段空台明显\n4. 客流降幅（-17.7%）远小于营业额降幅（-24.4%），说明消费质量也在恶化\n\n建议立即启动经营联合研判。`,
  },
  { id: 'xx3', type: 'phase-sep', time: '10:01', phase: 'evidence', content: '补充证据' },
  {
    id: 'xx4', type: 'agent', agentId: 'advisor', time: '10:01', phase: 'evidence',
    embed: 'data-xinxiang',
    content: `我已补充调取辛香汇近3个月经营数据。关键发现：\n\n**营业额跌幅（-24.4%）远大于客流跌幅（-17.7%）**，来店的客人花得更少了。\n\n结合差评内容（陈列老旧、服务慢、菜品更新慢），初步判断：**产品吸引力下降 + 门店体验老化**，而非纯外部流量问题。`,
  },
  {
    id: 'xx5', type: 'agent', agentId: 'inspector', time: '10:03', phase: 'evidence',
    embed: 'inspection-xinxiang',
    content: `我补充现场问题。巡店发现三个核心短板，与差评内容高度吻合：\n\n现场体验确实在拖后腿——陈列和话术问题会直接影响顾客消费决策，候台体验差则影响复购意愿。`,
  },
  {
    id: 'xx6', type: 'phase-conclusion', time: '10:04', phase: 'evidence',
    phaseConclusion: {
      title: '证据阶段收敛',
      confirmed: [
        '营业额降幅显著大于客流降幅，消费质量在恶化',
        '差评内容与巡店发现高度吻合：陈列老化 + 话术弱 + 候台体验差',
        '问题核心是门店吸引力下降，非外部流量问题',
      ],
      uncertain: ['是否存在周边竞争环境变化（新开同类门店？）'],
      gmNeed: '是否需要补充竞争环境调研，还是直接进入改善方向讨论？',
      nextStep: '进入判断阶段 → 商户经营顾问给出三个改善方向',
    },
  },
  { id: 'xx7', type: 'phase-sep', time: '10:05', phase: 'diagnosis', content: '形成判断' },
  {
    id: 'xx8', type: 'agent', agentId: 'advisor', time: '10:05', phase: 'diagnosis',
    content: `基于证据，我给出三个可行改善方向：\n\n**方向1：新品驱动（优先推荐）**\n快速更新陈列，推出3-5款新品，重建到店理由。预计2周内可见消费质量回升。\n\n**方向2：话术 + 服务升级**\n专项培训导购，提升询价转化率和高毛利单品推荐能力。\n\n**方向3：候台体验改造**\n候台区增加内容（菜品展示/互动），减少等位流失，提升整体体验评分。\n\n**建议：三个方向并进，以方向1为主线。**`,
  },
];

const XINXIANG_CONSULT_WAITING: Msg = {
  id: 'xx9', type: 'consultation', agentId: 'advisor', time: '10:07', phase: 'consultation',
  consultStatus: 'waiting',
  content: `三个方向均需要商户配合执行，当前商户配合意愿未知。建议请示总经理：**是否授权直接约谈商户店长**，推进新品陈列更新和话术培训？`,
};

const XINXIANG_MSGS: Msg[] = [...XINXIANG_BASE_MSGS, XINXIANG_CONSULT_WAITING];

const XINXIANG_MSGS_APPROVED: Msg[] = [
  ...XINXIANG_BASE_MSGS,
  { ...XINXIANG_CONSULT_WAITING, consultStatus: 'approved' },
  { id: 'xx10', type: 'system', time: '10:08', phase: 'consultation', content: '总经理已授权，商户约谈已安排' },
  {
    id: 'xx11', type: 'gm', time: '10:08', phase: 'consultation',
    content: `同意推进。约谈重点：\n1. 确认新品更新时间表（3天内开始）\n2. 培训计划落地时间节点\n3. 2周后看领先指标变化`,
  },
  {
    id: 'xx12', type: 'agent', agentId: 'advisor', time: '10:09', phase: 'solution',
    content: `收到授权。已制定三项具体执行任务，涵盖陈列、话术、追踪三个维度，请查看执行任务清单。`,
  },
  { id: 'xx13', type: 'task-card', agentId: 'scheduler', time: '10:10', phase: 'execution' },
];

/* ════════════════════════════════════════════════════════════
   B-EVENT MSG ARRAY (static)
════════════════════════════════════════════════════════════ */
const BEVENT_MSGS: Msg[] = [
  { id: 'be1', type: 'phase-sep', time: '昨天 17:00', phase: 'discovery', content: '活动数据汇总' },
  {
    id: 'be2', type: 'agent', agentId: 'campaign', time: '17:01', phase: 'discovery',
    embed: 'data-bevent',
    content: `B区周末活动已结束，整体达成率 **67%**，低于目标。\n\n亮点：优惠券核销率超预期（71% vs 目标60%）\n不及预期：总客流达成率仅67%，周末两天实际客流分别为63%和71%\n\n初步判断：活动触达没问题，但**到店转化和停留时长不足**。`,
  },
  {
    id: 'be3', type: 'agent', agentId: 'memory', time: '17:03', phase: 'evidence',
    content: `我调取历史对比数据：\n\n- 上期B区活动（3月）：客流达成率 **82%**，ROI 1.9\n- 去年同期：客流达成率 **91%**，ROI 2.3\n\n本次ROI（1.4）为近8期最低。差异关键点：**本次活动周末天气较差（降雨），同期竞品有大型活动**，这两个外部因素对结果有较大影响，不宜完全归因于活动策划本身。`,
  },
  { id: 'be4', type: 'phase-sep', time: '17:05', phase: 'diagnosis', content: '根因分析' },
  {
    id: 'be5', type: 'phase-conclusion', time: '17:06', phase: 'diagnosis',
    phaseConclusion: {
      title: '复盘阶段收敛',
      confirmed: [
        '客流未达目标主因：降雨 + 竞品活动（外部因素，非活动本身失误）',
        '优惠券核销超预期，说明优惠力度有效，触达率没问题',
        '活动ROI偏低，但结合外部因素属于可接受范围',
      ],
      uncertain: [
        '下期活动是否继续使用优惠券形式？',
        '是否需要针对天气/竞品因素建立预案机制？',
      ],
      gmNeed: '下期活动预算是否维持原计划，还是根据本次结果调整策略？',
      nextStep: '进入改进建议 → 任务调度官给出3条优化方向',
    },
  },
  { id: 'be6', type: 'phase-sep', time: '17:08', phase: 'solution', content: '改进建议' },
  {
    id: 'be7', type: 'agent', agentId: 'scheduler', time: '17:09', phase: 'solution',
    content: `基于复盘结论，我给出3条下期活动优化方向：\n\n**1. 引入天气预案机制**\n提前48h监测天气，若预报降雨则自动触发线上引流预案（短信/社群通知），减少到店流失。\n\n**2. 竞品情报前置**\n活动前1周扫描周边竞品排期，避免正面冲突；若无法避开，调整活动核心卖点差异化竞争。\n\n**3. 保留优惠券形式，优化停留转化**\n核销率超预期说明优惠有效，下期重点提升进店后的停留时长和客单价，而非增加引流力度。`,
  },
  { id: 'be8', type: 'phase-sep', time: '17:12', phase: 'archive', content: '沉淀复盘结论' },
  {
    id: 'be9', type: 'memory-card', agentId: 'memory', time: '17:13', phase: 'archive',
    confirmed: false,
    content: '已将本次活动复盘结论整理为组织记忆草案，是否确认沉淀？',
    memoryTitle: '《B区活动复盘：天气/竞品预案建立策略》',
    memoryTags: ['活动复盘', 'B区', '周末活动', '天气预案', '竞品策略'],
    memoryConditions: ['活动达成率低于75%', '存在明显外部干扰因素', '复盘周期在活动结束7天内'],
  },
];

/* ════════════════════════════════════════════════════════════
   MORNING REPORT MSGS (static)
════════════════════════════════════════════════════════════ */
const MORNING_REPORT_MSGS: Msg[] = [
  { id: 'mr-sep1', type: 'phase-sep', time: '09:30', phase: 'discovery', content: '今日经营扫描' },
  {
    id: 'mr-risk1', type: 'agent', agentId: 'risk', time: '09:30', phase: 'discovery',
    content: `今日 09:30 全场例行扫描完成，共扫描 **83 家商户**。发现 **4 家高风险商户**，需优先关注：\n\n🔴 **望潮港火锅**（B2-08）— 续约风险升级，91天续约窗口，坪效↓22%，**已发起联合研判**\n🟡 **辛香汇**（A3-15）— 连续3月经营下滑，营业额↓24.4%，**联合研判推进中**\n🟡 **翠华茶餐厅**（C1-07）— 客诉环比上升41%，差评率突破预警线 5%\n🟠 **森系奶茶**（B3-02）— 新商户首月客流仅达目标 62%，启动缓慢\n\n另有 **12 家** 处于观察期，**67 家** 状态正常。`,
  },
  { id: 'mr-sep2', type: 'phase-sep', time: '09:31', phase: 'evidence', content: '全场关键指标' },
  {
    id: 'mr-advisor1', type: 'agent', agentId: 'advisor', time: '09:31', phase: 'evidence',
    content: `**今日全场关键指标摘要**\n\n- 整体健康度：**68分**（↑2 vs 昨日）\n- 综合坪效：**¥892/㎡/月**（环比 -1.2%）\n- 活跃会员消费：本周 **+3.4%**\n- 高风险商户占比：**4.8%**（4/83家）\n\n**分区概况**\n— A区：整体稳定，无新增高风险\n— B区：望潮港拖拽坪效评分，已介入 ⚠\n— C区：翠华客诉上升，需关注蔓延效应`,
  },
  {
    id: 'mr-conclusion', type: 'phase-conclusion', time: '09:32', phase: 'evidence',
    phaseConclusion: {
      title: '今日优先事项',
      confirmed: [
        '望潮港火锅续约风险：已发起联合研判，等待总经理拍板',
        '辛香汇经营下滑：联合研判进行中，待授权约谈商户',
        'B区周末活动复盘：达成率67%，待决策',
      ],
      uncertain: [
        '翠华茶餐厅客诉上升：是否需要发起专项联合研判？',
        '森系奶茶启动缓慢：是否启动新商户辅导方案？',
      ],
      gmNeed: '请确认今日重点关注的联合研判线程，或点击「发起新联合研判」处理翠华/森系问题',
      nextStep: '点击左侧经营事项，进入具体联合研判线程操作',
    },
  },
];

/* ════════════════════════════════════════════════════════════
   CUSTOM THREAD INIT MESSAGES
════════════════════════════════════════════════════════════ */
function getCustomThreadInitMsgs(thread: CustomThread): Msg[] {
  return [
    {
      id: `${thread.id}-sys`,
      type: 'system',
      time: thread.createdAt,
      phase: 'discovery',
      content: `联合研判已启动 · ${thread.merchantName} · ${thread.issueType}`,
    },
    {
      id: `${thread.id}-sep`,
      type: 'phase-sep',
      time: thread.createdAt,
      phase: 'discovery',
      content: '发现问题',
    },
    {
      id: `${thread.id}-risk`,
      type: 'agent',
      agentId: 'risk',
      time: thread.createdAt,
      phase: 'discovery',
      content: `收到联合研判指令，已开始针对**${thread.merchantName}**的「${thread.issueType}」问题进行初步扫描。\n\n${thread.note ? `总经理备注：${thread.note}\n\n` : ''}正在调取该商户近期经营数据、历史巡店记录及相关案例，请稍候…`,
    },
    {
      id: `${thread.id}-ready`,
      type: 'phase-conclusion',
      time: thread.createdAt,
      phase: 'discovery',
      phaseConclusion: {
        title: '联合研判就绪',
        confirmed: [
          `商户：${thread.merchantName}（${thread.merchantCode}）`,
          `议题类型：${thread.issueBadge} ${thread.issueType}`,
          '风险诊断师已启动初步扫描',
          '相关 Agent 已进入待命状态',
        ],
        uncertain: ['具体问题细节待进一步数据支撑'],
        gmNeed: '请输入你的第一个指示，引导联合研判方向',
        nextStep: '等待总经理指示 → 启动多 Agent 证据收集',
      },
    },
  ];
}

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

function DataXinxiangEmbed() {
  return (
    <div className="mt-3 rounded-xl overflow-hidden border border-blue-100">
      <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border-b border-blue-100">
        <BarChart3 size={12} className="text-blue-500" />
        <span className="text-[11px] font-semibold text-blue-700">经营数据</span>
        <span className="text-[10px] text-blue-400 ml-auto">近3个月 · 商户经营顾问调取</span>
      </div>
      <div className="divide-y divide-slate-100 bg-white">
        {XINXIANG_DATA_ROWS.map(r => (
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

function InspectionXinxiangEmbed() {
  return (
    <div className="mt-3 rounded-xl overflow-hidden border border-green-100">
      <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border-b border-green-100">
        <FileText size={12} className="text-green-600" />
        <span className="text-[11px] font-semibold text-green-700">巡店记录摘要</span>
        <span className="text-[10px] text-green-400 ml-auto">最近一次 · 巡店督导</span>
      </div>
      <div className="bg-white px-3 py-2 space-y-1.5">
        {XINXIANG_INSPECTION_ITEMS.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-amber-400 text-[11px] flex-shrink-0 mt-0.5">⚠</span>
            <span className="text-[12px] text-slate-600">{item}</span>
          </div>
        ))}
        <div className="text-[10px] text-slate-400 pt-1">上次巡店：4月22日</div>
      </div>
    </div>
  );
}

function DataBeventEmbed() {
  return (
    <div className="mt-3 rounded-xl overflow-hidden border border-amber-100">
      <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border-b border-amber-100">
        <BarChart3 size={12} className="text-amber-500" />
        <span className="text-[11px] font-semibold text-amber-700">活动数据 · 达成对比</span>
        <span className="text-[10px] text-amber-400 ml-auto">本次活动 · 活动策略师</span>
      </div>
      <div className="divide-y divide-slate-100 bg-white">
        {BEVENT_DATA_ROWS.map(r => (
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

/* ════════════════════════════════════════════════════════════
   P0-2: PHASE CONCLUSION CARD
════════════════════════════════════════════════════════════ */
function PhaseConclusionCard({ pc }: { pc: PhaseConclusion }) {
  return (
    <div className="my-5 rounded-2xl overflow-hidden shadow-md" style={{ border: '1.5px solid #334155' }}>
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3" style={{ background: '#1e293b' }}>
        <div className="w-2 h-2 rounded-full bg-amber-400" />
        <span className="text-[12px] font-bold text-white tracking-wide">{pc.title}</span>
        <span className="ml-auto text-[10px] text-slate-400">联合研判系统 · 阶段收敛</span>
      </div>
      <div className="bg-slate-50 px-4 py-4 space-y-3.5">
        {/* Confirmed */}
        <div>
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-2">✅ 已确认</p>
          <div className="space-y-1.5 pl-1">
            {pc.confirmed.map((c, i) => (
              <div key={i} className="flex items-start gap-2 text-[12px] text-slate-700">
                <span className="flex-shrink-0 mt-1 w-1 h-1 rounded-full bg-emerald-400" />{c}
              </div>
            ))}
          </div>
        </div>
        {/* Uncertain */}
        {pc.uncertain.length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-2">❓ 仍待确认</p>
            <div className="space-y-1.5 pl-1">
              {pc.uncertain.map((u, i) => (
                <div key={i} className="flex items-start gap-2 text-[12px] text-slate-500">
                  <span className="flex-shrink-0 mt-1 w-1 h-1 rounded-full bg-amber-300" />{u}
                </div>
              ))}
            </div>
          </div>
        )}
        {/* GM Need - prominent */}
        <div className="rounded-xl overflow-hidden border-l-4 border-amber-400" style={{ background: '#fffbeb', borderTop: '1px solid #fde68a', borderRight: '1px solid #fde68a', borderBottom: '1px solid #fde68a' }}>
          <div className="px-3 py-2.5">
            <p className="text-[10px] font-bold text-amber-700 mb-1">⚡ 总经理需要决定</p>
            <p className="text-[12px] text-amber-900 font-medium leading-snug">{pc.gmNeed}</p>
          </div>
        </div>
        {/* Next step */}
        <div className="flex items-center gap-2 pt-0.5">
          <ChevronRight size={11} className="text-slate-400 flex-shrink-0" />
          <p className="text-[11px] text-slate-500">建议下一步：{pc.nextStep}</p>
        </div>
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
  const agentRole = msg.agentId ? AG[msg.agentId].role : '';
  return (
    <div className="my-3 rounded-xl overflow-hidden border border-indigo-200 shadow-sm">
      <div className="flex items-center gap-2 px-3 py-2.5" style={{ background: '#eef2ff' }}>
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: agentColor }} />
        <div className="flex-1 min-w-0">
          <span className="text-[11px] font-bold text-indigo-700">判断修正</span>
          <span className="text-[10px] text-indigo-500 ml-1.5">因 {agentName}（{agentRole.split('·')[0].trim()}）补充信息，以下初始判断已被修正</span>
        </div>
        <span className="text-[10px] text-indigo-300 flex-shrink-0">{msg.time}</span>
      </div>
      <div className="px-3 py-3 space-y-2.5 bg-white">
        {(msg.revisions || []).map((r, i) => (
          <div key={i} className="rounded-lg overflow-hidden border border-slate-100">
            <div className="flex items-start gap-2 px-3 py-2 bg-rose-50">
              <span className="text-[9px] font-bold text-rose-500 flex-shrink-0 mt-0.5 bg-rose-100 px-1.5 py-0.5 rounded">原判断</span>
              <p className="text-[11px] text-rose-600 line-through leading-snug">{r.from}</p>
            </div>
            <div className="flex items-start gap-2 px-3 py-2 bg-emerald-50">
              <span className="text-[9px] font-bold text-emerald-600 flex-shrink-0 mt-0.5 bg-emerald-100 px-1.5 py-0.5 rounded">修正后</span>
              <p className="text-[12px] text-emerald-800 font-medium leading-snug">{r.to}</p>
            </div>
          </div>
        ))}
        <p className="text-[10px] text-indigo-500 pt-0.5">↑ 以上修正将影响后续研判方向和方案选择</p>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   拍板工具：方案对比卡
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
    <div className="rounded-2xl overflow-hidden shadow-md" style={{ border: '1.5px solid #7c3aed' }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3" style={{ background: '#7c3aed' }}>
        <Brain size={14} className="text-white" />
        <span className="text-[13px] font-bold text-white">方案拍板工具</span>
        <span className="text-[10px] text-violet-200 ml-auto">任务调度官 · {msg.time}</span>
      </div>
      {/* 拍板关键问题 */}
      {!chosen && (
        <div className="px-4 py-3 bg-violet-50 border-b border-violet-100">
          <p className="text-[10px] font-bold text-violet-600 uppercase tracking-wider mb-1.5">拍板前关键问题</p>
          <div className="space-y-1">
            <p className="text-[11px] text-violet-700">• 哪个方案最可能在30天内改变招商侧&ldquo;观察→保留&rdquo;评级？</p>
            <p className="text-[11px] text-violet-700">• 如果预算有限，哪个方案ROI最高？</p>
            <p className="text-[11px] text-violet-700">• 2周后先看什么领先指标，能证明方向对了？</p>
          </div>
        </div>
      )}
      {/* Header row */}
      <div className="grid grid-cols-3 divide-x divide-slate-100 border-b border-slate-200">
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
      {/* Recommended reason - 更透明 */}
      {!chosen && (
        <div className="px-4 py-3 bg-amber-50 border-b border-amber-100">
          <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1.5">为什么推荐方案B</p>
          <div className="space-y-1">
            <p className="text-[11px] text-amber-800"><span className="font-semibold">✓ 最匹配业务目标：</span>经营+体验双修，产生的改善信号能同时说服招商侧</p>
            <p className="text-[11px] text-amber-800"><span className="font-semibold">✓ 续约筹码最强：</span>客单回升+差评下降+门店形象改善，招商侧最认可</p>
            <p className="text-[11px] text-amber-700"><span className="font-semibold">✗ 为什么不选A：</span>只做经营优化，忽略现场体验短板，改善信号不够全面</p>
            <p className="text-[11px] text-amber-700"><span className="font-semibold">✗ 为什么不选C：</span>活动拉新治标不治本，无法改变招商侧对经营能力的判断</p>
          </div>
        </div>
      )}
      {/* Action buttons */}
      {!chosen && (
        <div className="p-3 bg-slate-50">
          <div className="flex items-center gap-2 mb-2">
            {PLANS.map(plan => (
              <button key={plan.id} onClick={() => onSelect(plan.id)}
                className="flex-1 py-2 rounded-xl text-[11px] font-semibold transition-all border"
                style={plan.recommended
                  ? { background: '#1e293b', color: 'white', border: '1px solid #1e293b' }
                  : { background: 'white', color: '#64748b', border: '1px solid #e2e8f0' }}>
                拍板方案{plan.id}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 text-center">拍板后立即生成执行任务，同步相关负责人</p>
        </div>
      )}
      {chosen && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 border-t border-emerald-100">
          <CheckCircle2 size={13} className="text-emerald-500" />
          <span className="text-[11px] text-emerald-700 font-medium">总经理已拍板方案{chosen}，进入执行阶段</span>
        </div>
      )}
    </div>
  );
}

function TaskCard({ msg, tasks: taskList }: { msg: Msg; tasks?: typeof TASKS }) {
  const displayTasks = taskList ?? TASKS;
  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border-b border-emerald-100">
        <ListChecks size={13} className="text-emerald-600" />
        <span className="text-[12px] font-semibold text-emerald-700">已生成 {displayTasks.length} 项执行任务</span>
        <span className="text-[10px] text-emerald-400 ml-auto">任务调度官 · {msg.time}</span>
      </div>
      <div className="divide-y divide-slate-100">
        {displayTasks.map(t => (
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
        已同步：{displayTasks.map(t => t.owner).filter((v, i, a) => a.indexOf(v) === i).join(' · ')}
      </div>
    </div>
  );
}

function MemoryCard({ msg, onConfirm }: { msg: Msg; onConfirm: (id: string) => void }) {
  const done = msg.confirmed;
  const title = msg.memoryTitle ?? '《餐饮商户续约风险干预：经营修复 + 体验整改联合策略》';
  const tags = msg.memoryTags ?? ['餐饮', '火锅', '续约风险', '体验整改', '套餐优化', '招商协同'];
  const conditions = msg.memoryConditions ?? ['租约剩余 120 天以内', '客流未崩塌但消费质量下降', '招商侧尚未明确淘汰', '现场体验存在明显短板'];
  return (
    <div className="rounded-2xl overflow-hidden border border-cyan-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 px-4 py-3 bg-cyan-50 border-b border-cyan-100">
        <Sparkles size={13} className="text-cyan-600" />
        <span className="text-[12px] font-semibold text-cyan-700">组织记忆草案</span>
        <span className="text-[10px] text-cyan-400 ml-auto">案例记忆官 · {msg.time}</span>
      </div>
      <div className="px-4 py-3">
        <p className="text-[12px] font-semibold text-slate-700 mb-2 leading-snug">{title}</p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {tags.map(t => (
            <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">{t}</span>
          ))}
        </div>
        <p className="text-[11px] font-medium text-slate-600 mb-1.5">适用条件：</p>
        <div className="space-y-1">
          {conditions.map((c, i) => (
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
function MsgBubble({ msg, onConsultApprove, onPlanSelect, onMemoryConfirm, threadTasks }: {
  msg: Msg;
  onConsultApprove: (id: string) => void;
  onPlanSelect: (p: 'A' | 'B' | 'C') => void;
  onMemoryConfirm: (id: string) => void;
  threadTasks?: typeof TASKS;
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
    // Check if this is a lifecycle transition message
    if (msg.lifecycleFrom && msg.lifecycleTo && msg.lifecycleTrigger) {
      return <LifecycleTransitionCard from={msg.lifecycleFrom} to={msg.lifecycleTo} trigger={msg.lifecycleTrigger} time={msg.time} />;
    }
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
    return <div className="my-4" data-plan-card><PlanCard msg={msg} onSelect={onPlanSelect} /></div>;
  }
  if (msg.type === 'task-card') {
    return <div className="my-4"><TaskCard msg={msg} tasks={threadTasks} /></div>;
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
        <div className="rounded-2xl border-2 overflow-hidden shadow-sm"
          style={{ borderColor: waiting ? '#fde68a' : approved ? '#bbf7d0' : '#fecdd3' }}>
          <div className="flex items-center gap-2 px-4 py-2.5"
            style={{ background: waiting ? '#fefce8' : approved ? '#f0fdf4' : '#fff1f2' }}>
            <span className="text-sm">{waiting ? '⚠' : approved ? '✅' : '❌'}</span>
            <span className="text-[11px] font-bold" style={{ color: waiting ? '#b45309' : approved ? '#15803d' : '#be123c' }}>
              {waiting ? '请示总经理' : approved ? '已同意' : '未同意'}
            </span>
            {waiting && <span className="ml-auto text-[10px] text-amber-400 animate-pulse">等待总经理指示…</span>}
            {approved && <span className="ml-auto text-[10px] text-emerald-500">招商经理已加入联合研判</span>}
          </div>
          {/* 请示原因 + 预期补充 */}
          {waiting && (
            <div className="px-4 py-2.5 bg-amber-50 border-b border-amber-100">
              <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1">为什么需要请示</p>
              <p className="text-[11px] text-amber-800 leading-snug">当前问题已涉及续约策略判断，超出经营 Agent 权限范围，需要招商经理补充续约侧信息</p>
              <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mt-2 mb-1">同意后可获得</p>
              <p className="text-[11px] text-amber-800 leading-snug">• 招商侧对该商户的保留意向<br/>• 续约谈判是否已进入敏感阶段<br/>• 哪些经营改善信号会影响续约评分</p>
            </div>
          )}
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
          {/* 加入后的影响说明 */}
          {approved && (
            <div className="px-4 py-2.5 bg-emerald-50 border-t border-emerald-100">
              <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1">招商经理补充的关键信息</p>
              <p className="text-[11px] text-emerald-800 leading-snug">• 该商户续约优先级已从&ldquo;保留&rdquo;降至&ldquo;观察&rdquo;<br/>• 30天经营改善信号可直接影响续约评分<br/>• 招商侧尚未明确淘汰，仍有保留窗口</p>
            </div>
          )}
        </div>
      </div>
    );
  }
  // default: agent - 降低视觉权重
  if (!msg.agentId) return null;
  const agent = AG[msg.agentId];
  return (
    <div className="mb-3 group">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: agent.color }} />
        <span className="text-[11px] font-medium text-slate-600">{agent.name}</span>
        <span className="text-[9px] text-slate-400">{agent.role.split('·')[0].trim()}</span>
        <span className="text-[9px] text-slate-300 ml-auto">{msg.time}</span>
      </div>
      <div className="rounded-xl px-3 py-2.5 bg-slate-50 border border-slate-100"
        style={{ borderLeftWidth: '2px', borderLeftColor: agent.color }}>
        <ReactMarkdown
          components={{
            p: ({ children }) => <p className="text-[12px] text-slate-600 leading-relaxed mb-1.5 last:mb-0">{children}</p>,
            strong: ({ children }) => <strong className="text-slate-800 font-semibold">{children}</strong>,
            ol: ({ children }) => <ol className="list-decimal list-inside space-y-0.5 text-[12px] text-slate-600">{children}</ol>,
            ul: ({ children }) => <ul className="list-disc list-inside space-y-0.5 text-[12px] text-slate-600">{children}</ul>,
            li: ({ children }) => <li>{children}</li>,
          }}
        >{msg.content || ''}</ReactMarkdown>
        {msg.embed === 'data' && <DataEmbed />}
        {msg.embed === 'inspection' && <InspectionEmbed />}
        {msg.embed === 'case' && <CaseEmbed />}
        {msg.embed === 'data-xinxiang' && <DataXinxiangEmbed />}
        {msg.embed === 'inspection-xinxiang' && <InspectionXinxiangEmbed />}
        {msg.embed === 'data-bevent' && <DataBeventEmbed />}
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
   LIFECYCLE TRANSITION CARD (状态流转卡)
════════════════════════════════════════════════════════════ */
function LifecycleTransitionCard({ from, to, trigger, time }: {
  from: IssueLifecycle; to: IssueLifecycle; trigger: string; time: string;
}) {
  const fromState = LIFECYCLE_STATES[from];
  const toState = LIFECYCLE_STATES[to];
  return (
    <div className="my-4 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border-b border-slate-100">
        <div className="w-2 h-2 rounded-full bg-indigo-400" />
        <span className="text-[11px] font-bold text-slate-700">状态流转</span>
        <span className="text-[10px] text-slate-400 ml-auto">{time}</span>
      </div>
      <div className="px-3 py-3 bg-white">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: fromState.dotColor }} />
              <span className="text-[10px] text-slate-500 line-through">{fromState.label}</span>
            </div>
            <p className="text-[9px] text-slate-400 pl-2.5">{fromState.meaning}</p>
          </div>
          <ChevronRight size={14} className="text-slate-300 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: toState.dotColor }} />
              <span className="text-[11px] font-semibold text-slate-700">{toState.label}</span>
            </div>
            <p className="text-[9px] text-slate-600 pl-2.5">{toState.meaning}</p>
          </div>
        </div>
        <div className="mt-2.5 pt-2.5 border-t border-slate-100">
          <p className="text-[10px] text-slate-500"><span className="font-semibold text-slate-600">触发条件：</span>{trigger}</p>
          <p className="text-[10px] text-slate-500 mt-1"><span className="font-semibold text-slate-600">下一步：</span>{toState.nextAction}</p>
          <p className="text-[10px] text-slate-500 mt-1"><span className="font-semibold text-slate-600">当前责任方：</span>{toState.owner}</p>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   P0-1: BUSINESS THREAD CARD (增强版：显示生命周期状态)
════════════════════════════════════════════════════════════ */
function BusinessThreadCard({ thread, active, onClick, lifecycle }: {
  thread: typeof BUSINESS_THREADS[0]; active: boolean; onClick: () => void; lifecycle?: IssueLifecycle;
}) {
  const domainColor: Record<string, string> = {
    '续约': 'bg-rose-500',
    '租金': 'bg-amber-500',
    '活动预算': 'bg-indigo-500',
    '客诉': 'bg-orange-500',
    '招商结构': 'bg-violet-500',
  };
  const badgeColor = thread.badge === 'P0' ? 'bg-rose-500' : 'bg-amber-500';
  const lifecycleState = lifecycle ? LIFECYCLE_STATES[lifecycle] : null;

  return (
    <button onClick={onClick}
      className={`w-full text-left rounded-xl mb-2 border transition-all relative overflow-hidden ${
        active
          ? 'bg-slate-50 border-slate-300 shadow-sm'
          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
      }`}>
      {/* 左侧色条 */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${domainColor[thread.impactDomain] || 'bg-slate-400'}`} />

      <div className="pl-4 pr-3 py-2.5">
        {/* Title row */}
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="min-w-0 flex-1">
            <p className={`text-[12px] font-bold leading-tight truncate ${active ? 'text-slate-900' : 'text-slate-800'}`}>
              {thread.title}
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">{thread.subtitle}</p>
          </div>
          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold flex-shrink-0 text-white ${badgeColor}`}>
            {thread.badge}
          </span>
        </div>

        {/* Lifecycle state badge */}
        {lifecycleState && (
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: lifecycleState.dotColor }} />
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${lifecycleState.colorCls}`}>
              {lifecycleState.label}
            </span>
            <span className="text-[9px] text-slate-400">· {lifecycleState.owner}</span>
          </div>
        )}

        {/* Impact domain tag + impact */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-600 flex-shrink-0">
            {thread.impactDomain}
          </span>
          <p className="text-[10px] text-slate-600 truncate">
            {thread.impact}
          </p>
        </div>

        {/* Next action from lifecycle */}
        {lifecycleState && (
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-1">
            <span className="text-slate-400">下一步:</span>
            <span className="truncate">{lifecycleState.nextAction}</span>
          </div>
        )}

        {/* Consequence - 降低视觉权重 */}
        {thread.badge === 'P0' && (
          <p className="text-[9px] text-slate-400 mt-1 leading-snug">
            ⚠ {thread.consequence}
          </p>
        )}
      </div>
    </button>
  );
}

/* ════════════════════════════════════════════════════════════
   主持控制台
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
  const inEarlyPhase = currentPhase === 'discovery' || currentPhase === 'evidence' || currentPhase === 'diagnosis';

  const EVIDENCE_DIRECTIVES = [
    { label: '先补现场证据', action: '先让巡店督导补充最新现场情况，再继续讨论——' },
    { label: '补会员数据', action: '先调取最近90天会员消费结构变化，再给判断——' },
    { label: '补客诉变化', action: '先补充过去30天差评内容和客诉变化趋势——' },
  ];
  const DIRECTION_DIRECTIVES = [
    { label: '先判断是否值得保留', action: '先不要谈改善方案，先判断这个商户是否值得继续投入资源——' },
    { label: '只讨论续约影响', action: '先不要发散，只聚焦一件事：当前经营表现是否影响续约判断——' },
    { label: '先估算不干预损失', action: '先给我一个估算：如果不做任何干预，30天后最坏的结果是什么——' },
    { label: '暂缓结论', action: '当前先不拍板，我需要再看一个指标才决定——' },
  ];
  const PLAN_DIRECTIVES = [
    { label: '只比A/B', action: '先不看方案C，只对比方案A和方案B——' },
    { label: '先看ROI', action: '在选方案之前，先给我每个方案的投入产出比——' },
    { label: '先试点', action: '建议先小范围试点验证，再决定是否全面铺开——' },
    { label: '先看2周指标', action: '先告诉我2周内能先看到哪个领先指标，再决定方案——' },
    { label: '预算减半怎么做', action: '如果只有当前预算的一半，哪个方案最值得做——' },
  ];

  return (
    <div className="flex-shrink-0 border-t border-slate-200 bg-white">
      {/* Console header */}
      <div className="flex items-center gap-2 px-3 pt-2 pb-1.5 border-b border-slate-100">
        <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">总经理主持控制台</span>
      </div>
      <div className="px-3 pt-2 pb-1 space-y-1.5">
        {/* Row 1: 指定发言 + 证据控制 */}
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
              <span>指定发言</span>
              <ChevronRight size={9} className={`transition-transform ${showPicker ? 'rotate-90' : ''}`} />
            </button>
            {showPicker && participants.length > 0 && (
              <div className="absolute bottom-full left-0 mb-1 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 min-w-[160px] z-20">
                <p className="text-[9px] text-slate-400 px-3 pb-1 border-b border-slate-100 mb-1">指定谁先回答？</p>
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
                      <span className="flex-1">{ag.name}</span>
                      <span className="text-[9px] text-slate-400">{AG[aid].role.split('·')[0].trim()}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          {inEarlyPhase && EVIDENCE_DIRECTIVES.map(d => (
            <button key={d.label}
              onClick={() => { if (!ceoInput) setCeoInput(d.action); }}
              className="px-2.5 py-1 rounded-xl text-[11px] font-medium border border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all">
              {d.label}
            </button>
          ))}
          {!inEarlyPhase && !inPlanPhase && EVIDENCE_DIRECTIVES.slice(0,2).map(d => (
            <button key={d.label}
              onClick={() => { if (!ceoInput) setCeoInput(d.action); }}
              className="px-2.5 py-1 rounded-xl text-[11px] font-medium border border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all">
              {d.label}
            </button>
          ))}
        </div>
        {/* Row 2: 研判方向控制 */}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[9px] text-rose-400 font-bold self-center flex-shrink-0">研判方向</span>
          {DIRECTION_DIRECTIVES.map(d => (
            <button key={d.label}
              onClick={() => { if (!ceoInput) setCeoInput(d.action); }}
              className="px-2.5 py-1 rounded-xl text-[11px] font-medium border border-rose-100 text-rose-500 bg-rose-50 hover:bg-rose-100 hover:border-rose-200 transition-all">
              {d.label}
            </button>
          ))}
        </div>
        {/* Row 3: plan phase 拍板指令 */}
        {inPlanPhase && (
          <div className="flex flex-wrap gap-1.5 pb-1 border-b border-dashed border-slate-200">
            <span className="text-[9px] text-violet-500 font-bold self-center flex-shrink-0">拍板指令</span>
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
          placeholder="输入研判指令，或 @某位专家先回答…"
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
   NEW CONSULT MODAL
════════════════════════════════════════════════════════════ */
function NewConsultModal({ onClose, onCreate }: {
  onClose: () => void;
  onCreate: (merchant: typeof MERCHANT_OPTIONS[0], issue: typeof ISSUE_TYPES[0], note: string) => void;
}) {
  const [selectedMerchant, setSelectedMerchant] = useState<typeof MERCHANT_OPTIONS[0] | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<typeof ISSUE_TYPES[0] | null>(null);
  const [note, setNote] = useState('');
  const canSubmit = selectedMerchant && selectedIssue;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
          <div className="w-6 h-6 rounded-lg bg-slate-900 flex items-center justify-center">
            <Plus size={13} className="text-white" />
          </div>
          <span className="text-[14px] font-bold text-slate-800">发起新联合研判</span>
          <button onClick={onClose} className="ml-auto text-slate-400 hover:text-slate-600 transition-colors text-xl leading-none">×</button>
        </div>
        <div className="px-5 py-4 space-y-5">
          {/* Merchant selection */}
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2.5">选择商户</p>
            <div className="grid grid-cols-2 gap-2">
              {MERCHANT_OPTIONS.map(m => (
                <button key={m.id}
                  onClick={() => setSelectedMerchant(m)}
                  className={`px-3 py-2.5 rounded-xl border text-left transition-all ${
                    selectedMerchant?.id === m.id
                      ? 'border-slate-900 bg-slate-900'
                      : 'border-slate-200 hover:border-slate-400 bg-white'
                  }`}>
                  <p className={`text-[12px] font-semibold ${selectedMerchant?.id === m.id ? 'text-white' : 'text-slate-700'}`}>{m.name}</p>
                  <p className={`text-[10px] ${selectedMerchant?.id === m.id ? 'text-slate-300' : 'text-slate-400'}`}>{m.code}</p>
                </button>
              ))}
            </div>
          </div>
          {/* Issue type selection */}
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2.5">议题类型</p>
            <div className="flex flex-wrap gap-2">
              {ISSUE_TYPES.map(issue => (
                <button key={issue.id}
                  onClick={() => setSelectedIssue(issue)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[12px] font-medium transition-all ${
                    selectedIssue?.id === issue.id
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 hover:border-slate-400 bg-white text-slate-600'
                  }`}>
                  <span>{issue.badge}</span>
                  {issue.label}
                </button>
              ))}
            </div>
          </div>
          {/* Note */}
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">补充说明（可选）</p>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="在联合研判开始前，有什么想提前告诉 Agent 的背景信息…"
              className="w-full text-[12px] text-slate-700 placeholder-slate-300 px-3 py-2.5 rounded-xl border border-slate-200 resize-none outline-none focus:border-slate-400 transition-colors bg-slate-50"
              rows={3}
            />
          </div>
        </div>
        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 border-t border-slate-100">
          <button onClick={onClose}
            className="px-4 py-2 rounded-xl text-[12px] text-slate-500 border border-slate-200 hover:bg-slate-50 transition-colors">
            取消
          </button>
          <button
            disabled={!canSubmit}
            onClick={() => canSubmit && onCreate(selectedMerchant!, selectedIssue!, note)}
            className={`flex-1 py-2 rounded-xl text-[12px] font-semibold transition-all ${
              canSubmit
                ? 'bg-slate-900 text-white hover:bg-slate-700'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}>
            发起联合研判
          </button>
        </div>
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
  const [xinxiangApproved, setXinxiangApproved] = useState(false);
  const [beventConfirmed, setBeventConfirmed] = useState(false);
  const [showNewConsult, setShowNewConsult] = useState(false);
  const [customThreads, setCustomThreads] = useState<CustomThread[]>([]);
  const [activeTab, setActiveTab] = useState<BusinessTab>('risk');
  const feedRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const msgCounter = useRef(0);

  /* currentMsgs: display layer — switches per thread */
  const currentMsgs = useMemo(() => {
    if (activeThread === 'xinxiang') {
      return xinxiangApproved ? XINXIANG_MSGS_APPROVED : XINXIANG_MSGS;
    }
    if (activeThread === 'b-event') {
      if (beventConfirmed) {
        return BEVENT_MSGS.map(m => m.type === 'memory-card' ? { ...m, confirmed: true } : m);
      }
      return BEVENT_MSGS;
    }
    if (activeThread === 'morning-report') return MORNING_REPORT_MSGS;
    const custom = customThreads.find(t => t.id === activeThread);
    if (custom) return getCustomThreadInitMsgs(custom);
    return messages; // wangchao: live autoplay
  }, [activeThread, xinxiangApproved, beventConfirmed, messages, customThreads]);

  /* activeThreadMeta: dynamic meta for active thread, supports custom threads */
  const activeThreadMeta = useMemo(() => {
    if (THREAD_META[activeThread]) return THREAD_META[activeThread];
    const custom = customThreads.find(t => t.id === activeThread);
    if (custom) {
      return {
        badge: `${custom.issueBadge} ${custom.issueType}`,
        title: `${custom.merchantName}：${custom.issueType}`,
        riskBadge: `${custom.issueBadge} 新发起`,
        riskColorCls: custom.issueColorCls,
        window: '待评估',
        code: custom.merchantCode,
        startTime: custom.createdAt,
      };
    }
    return THREAD_META['wangchao'];
  }, [activeThread, customThreads]);

  const addMessage = useCallback((item: ScriptItem) => {
    msgCounter.current += 1;
    const msg: Msg = { ...item, id: `m${msgCounter.current}` };
    setMessages(prev => [...prev, msg]);
  }, []);

  /* Auto-play engine */
  useEffect(() => {
    if (isPaused || waitForCEO) {
      // Use a ref-based approach to avoid setState in effect body
      const t = setTimeout(() => setTypingAgent(null), 0);
      return () => clearTimeout(t);
    }
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
      const agentId = item.agentId;
      timerRef.current = setTimeout(() => {
        setTypingAgent(agentId);
        timerRef.current = setTimeout(() => { setTypingAgent(null); finish(); }, (item.typingMs ?? 1400) * mult);
      }, 0);
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
    if (activeThread === 'xinxiang') {
      setXinxiangApproved(true);
    } else {
      setMessages(prev => prev.map(m => m.id === id ? { ...m, consultStatus: 'approved' } : m));
      setWaitForCEO(false);
      setScriptIdx(i => i + 1);
    }
  }, [activeThread]);

  const handlePlanSelect = useCallback((plan: 'A' | 'B' | 'C') => {
    setMessages(prev => prev.map(m => m.type === 'plan-card' && !m.selectedPlan ? { ...m, selectedPlan: plan } : m));
    setWaitForCEO(false);
    setScriptIdx(i => i + 1);
  }, []);

  const handleMemoryConfirm = useCallback((id: string) => {
    if (activeThread === 'b-event') {
      setBeventConfirmed(true);
    } else {
      setMessages(prev => prev.map(m => m.id === id ? { ...m, confirmed: true } : m));
      setWaitForCEO(false);
      setScriptIdx(i => i + 1);
    }
  }, [activeThread]);

  const handleNewConsult = useCallback((
    merchant: typeof MERCHANT_OPTIONS[0],
    issue: typeof ISSUE_TYPES[0],
    note: string
  ) => {
    const now = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    const newThread: CustomThread = {
      id: `custom-${Date.now()}`,
      merchantName: merchant.name,
      merchantCode: merchant.code,
      issueType: issue.label,
      issueBadge: issue.badge,
      issueColorCls: issue.colorCls,
      note,
      createdAt: now,
    };
    setCustomThreads(prev => [...prev, newThread]);
    setActiveThread(newThread.id);
    setActiveTab('risk');
    setShowNewConsult(false);
  }, []);

  const handleTabChange = useCallback((tab: BusinessTab) => {
    setActiveTab(tab);
    if (tab === 'operations') setActiveThread('morning-report');
    else if (tab === 'risk') setActiveThread('wangchao');
    else if (tab === 'merchant') setActiveThread('wangchao');
    else if (tab === 'event') setActiveThread('b-event');
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

  /* Derived state — all use currentMsgs */
  const participants = useMemo(() => {
    const seen = new Set<AgentId>(); const out: AgentId[] = [];
    currentMsgs.forEach(m => { if (m.agentId && !seen.has(m.agentId)) { seen.add(m.agentId); out.push(m.agentId); } });
    return out;
  }, [currentMsgs]);

  const pendingDecisions = useMemo(() =>
    currentMsgs.filter(m =>
      (m.type === 'consultation' && m.consultStatus === 'waiting') ||
      (m.type === 'plan-card' && !m.selectedPlan) ||
      (m.type === 'memory-card' && !m.confirmed)
    ), [currentMsgs]);

  const hasTasks = useMemo(() => currentMsgs.some(m => m.type === 'task-card'), [currentMsgs]);
  const memoryDone = useMemo(() => currentMsgs.some(m => m.type === 'memory-card' && m.confirmed), [currentMsgs]);

  const currentPhase = useMemo(() => {
    const last = currentMsgs[currentMsgs.length - 1];
    return last?.phase ?? 'discovery';
  }, [currentMsgs]);

  const completedPhases = useMemo(() => {
    const seen = new Set<Phase>();
    currentMsgs.forEach(m => seen.add(m.phase));
    return seen;
  }, [currentMsgs]);

  const timeline = useMemo(() => {
    const events: { time: string; text: string }[] = [];
    currentMsgs.forEach(m => {
      if (m.type === 'phase-sep') events.push({ time: m.time, text: m.content || '' });
      else if (m.type === 'system') events.push({ time: m.time, text: m.content || '' });
      else if (m.type === 'gm-decision') events.push({ time: m.time, text: '总经理拍板决策' });
    });
    return events;
  }, [currentMsgs]);

  const threadTasks = useMemo(() => {
    if (activeThread === 'xinxiang') return XINXIANG_TASKS;
    if (customThreads.some(t => t.id === activeThread)) return [];
    return TASKS;
  }, [activeThread, customThreads]);

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
          <button onClick={() => setShowNewConsult(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold bg-slate-900 text-white hover:bg-slate-700 transition-colors">
            <Plus size={12} />发起新联合研判
          </button>
          <button className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors relative">
            <Bell size={14} className="text-slate-500" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-rose-500" />
          </button>
          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-[10px] font-bold">总</div>
        </div>
      </div>

      {/* ── Business Tab Bar ── */}
      <div className="flex-shrink-0 flex items-center gap-0.5 px-4 h-10 bg-white border-b border-slate-200 z-30">
        {BUSINESS_TABS.map(tab => (
          <button key={tab.id} onClick={() => handleTabChange(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
            }`}>
            {tab.label}
            {tab.badge !== undefined && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full leading-none ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-600'
              }`}>{tab.badge}</span>
            )}
          </button>
        ))}
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

            {/* ── 今日经营 ── */}
            {activeTab === 'operations' && <>
              <div className="px-3 pt-1 pb-1">
                <div className="flex items-center gap-1.5 px-1 mb-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                  <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">自动任务</p>
                </div>
                {[
                  { id: 'morning-report', icon: '📋', title: '今日经营晨报', meta: 'AI生成 · 4家高风险' },
                  { id: 'scan', icon: '⚡', title: '全场商户风险扫描', meta: '已扫描83家' },
                ].map(t => (
                  <button key={t.id}
                    onClick={() => t.id === 'morning-report' ? setActiveThread('morning-report') : undefined}
                    className={`w-full text-left px-2.5 py-2 rounded-xl transition-colors mb-1 border ${
                      activeThread === t.id
                        ? 'bg-slate-900 border-slate-700'
                        : 'hover:bg-white border-transparent hover:border-slate-200'
                    }`}>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-sm">{t.icon}</span>
                      <span className={`text-[11px] font-medium truncate flex-1 ${activeThread === t.id ? 'text-white' : 'text-slate-600'}`}>{t.title}</span>
                      {t.id === 'scan' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />}
                    </div>
                    <p className="text-[10px] pl-5 text-slate-400">{t.meta}</p>
                  </button>
                ))}
              </div>
              <div className="px-3 pb-1">
                <div className="flex items-center gap-1.5 px-1 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">待我处理</p>
                </div>
                {BUSINESS_THREADS.filter(t => t.id === 'b-event').map(t => (
                  <BusinessThreadCard key={t.id} thread={t} active={activeThread === t.id} onClick={() => setActiveThread(t.id)} lifecycle={THREAD_LIFECYCLE[t.id]} />
                ))}
              </div>
            </>}

            {/* ── 风险研判 ── */}
            {activeTab === 'risk' && <>
              {customThreads.length > 0 && (
                <div className="px-3 pt-1 pb-1">
                  <div className="flex items-center gap-1.5 px-1 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">新发起</p>
                  </div>
                  {customThreads.map(t => (
                    <BusinessThreadCard key={t.id}
                      thread={{
                        id: t.id, title: t.merchantName,
                        subtitle: `${t.issueBadge} ${t.issueType}`,
                        badge: 'P1' as const, tags: [t.issueType],
                        impact: '等待 Agent 分析', stage: '联合研判准备中',
                        consequence: '', time: t.createdAt,
                      }}
                      active={activeThread === t.id}
                      onClick={() => setActiveThread(t.id)}
                    />
                  ))}
                </div>
              )}
              <div className="px-3 pt-1 pb-1">
                <div className="flex items-center gap-1.5 px-1 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse flex-shrink-0" />
                  <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">待我拍板</p>
                </div>
                {BUSINESS_THREADS.filter(t => t.id === 'wangchao').map(t => (
                  <BusinessThreadCard key={t.id} thread={t} active={activeThread === t.id} onClick={() => setActiveThread(t.id)} lifecycle={THREAD_LIFECYCLE[t.id]} />
                ))}
              </div>
              <div className="px-3 pb-1">
                <div className="flex items-center gap-1.5 px-1 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                  <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider">研判推进中</p>
                </div>
                {BUSINESS_THREADS.filter(t => t.id === 'xinxiang').map(t => (
                  <BusinessThreadCard key={t.id} thread={t} active={activeThread === t.id} onClick={() => setActiveThread(t.id)} lifecycle={THREAD_LIFECYCLE[t.id]} />
                ))}
              </div>
              <div className="px-3 pt-1">
                <button onClick={() => setShowNewConsult(true)}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-slate-300 text-[11px] text-slate-500 hover:border-slate-400 hover:bg-white hover:text-slate-700 transition-all">
                  <Plus size={11} />发起新联合研判
                </button>
              </div>
            </>}

            {/* ── 招商协同 ── */}
            {activeTab === 'merchant' && <>
              <div className="px-3 pt-1 pb-1">
                <div className="flex items-center gap-1.5 px-1 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse flex-shrink-0" />
                  <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">续约跟进</p>
                </div>
                {BUSINESS_THREADS.filter(t => t.id === 'wangchao').map(t => (
                  <BusinessThreadCard key={t.id} thread={t} active={activeThread === t.id} onClick={() => setActiveThread(t.id)} lifecycle={THREAD_LIFECYCLE[t.id]} />
                ))}
              </div>
              <div className="px-3 pb-1">
                <div className="flex items-center gap-1.5 px-1 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 flex-shrink-0" />
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">新商户引进</p>
                </div>
                <div className="px-2 py-4 text-center">
                  <p className="text-[11px] text-slate-400">暂无进行中的引进议题</p>
                </div>
              </div>
            </>}

            {/* ── 活动复盘 ── */}
            {activeTab === 'event' && <>
              <div className="px-3 pt-1 pb-1">
                <div className="flex items-center gap-1.5 px-1 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
                  <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">待复盘</p>
                </div>
                {BUSINESS_THREADS.filter(t => t.id === 'b-event').map(t => (
                  <BusinessThreadCard key={t.id} thread={t} active={activeThread === t.id} onClick={() => setActiveThread(t.id)} lifecycle={THREAD_LIFECYCLE[t.id]} />
                ))}
              </div>
              <div className="px-3 pb-1">
                <div className="flex items-center gap-1.5 px-1 mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300 flex-shrink-0" />
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">已复盘</p>
                </div>
                <div className="px-2 py-4 text-center">
                  <p className="text-[11px] text-slate-400">本月暂无已复盘活动</p>
                </div>
              </div>
            </>}

            {/* ── 组织经验 ── */}
            {activeTab === 'knowledge' && <>
              <div className="px-3 pt-1 pb-1">
                <div className="flex items-center gap-1.5 px-1 mb-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
                  <p className="text-[10px] font-semibold text-cyan-600 uppercase tracking-wider">案例库</p>
                </div>
                <button className="w-full text-left px-2.5 py-2 rounded-xl hover:bg-white transition-colors border border-transparent hover:border-slate-200">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-sm">📚</span>
                    <span className="text-[11px] font-medium text-slate-600 truncate">餐饮续约案例库</span>
                  </div>
                  <p className="text-[10px] text-slate-400 pl-5">23个案例 · 案例记忆官维护</p>
                </button>
              </div>
              <div className="px-3">
                <div className="flex items-center gap-1.5 px-1 mb-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />
                  <p className="text-[10px] font-semibold text-violet-600 uppercase tracking-wider">经验模板</p>
                </div>
                <div className="px-2 py-4 text-center">
                  <p className="text-[11px] text-slate-400">4 个模板 · 可直接复用</p>
                </div>
              </div>
            </>}

          </div>
        </div>

        {/* ── Center ── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Thread Header */}
          <div className="flex-shrink-0 px-5 py-3 bg-white border-b border-slate-200">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${activeThreadMeta.riskColorCls}`}>
                    {activeThreadMeta.badge}
                  </span>
                  <h2 className="text-[15px] font-bold text-slate-800">{activeThreadMeta.title}</h2>
                  <span className="text-[11px] text-slate-400">{activeThreadMeta.code}</span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[11px] text-slate-500">
                    干预窗口 <span className="font-semibold text-amber-500">{activeThreadMeta.window}</span>
                  </span>
                  <span className="text-[11px] text-slate-300">·</span>
                  <span className="text-[11px] text-slate-400">
                    联合研判发起 {activeThreadMeta.startTime}
                  </span>
                </div>
              </div>
              {activeThread === 'wangchao' && (
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
              )}
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

          {/* 当前拍板焦点卡 - 第一视觉焦点 */}
          {activeThread === 'wangchao' && currentPhase === 'solution' && !messages.some(m => m.type === 'plan-card' && m.selectedPlan) && (
            <div className="flex-shrink-0 mx-5 mt-4 rounded-2xl overflow-hidden shadow-lg" style={{ border: '2px solid #1e293b' }}>
              <div className="flex items-center gap-2 px-4 py-3" style={{ background: '#1e293b' }}>
                <AlertTriangle size={14} className="text-amber-400" />
                <span className="text-[13px] font-bold text-white">当前拍板焦点</span>
                <span className="ml-auto text-[10px] text-slate-400">等待总经理决策</span>
              </div>
              <div className="bg-white px-4 py-4">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">当前状态</p>
                    <p className="text-[12px] font-semibold text-slate-800">等待总经理拍板方案</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">推荐动作</p>
                    <p className="text-[12px] font-semibold text-emerald-600">按方案B推进</p>
                  </div>
                </div>
                <div className="mb-3">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">核心理由</p>
                  <p className="text-[11px] text-slate-700 leading-snug">30天内最可能改变招商侧&ldquo;观察→保留&rdquo;评级，经营+体验双修，产生的改善信号能同时说服招商侧</p>
                </div>
                <div className="mb-3">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">最大风险</p>
                  <p className="text-[11px] text-amber-700 leading-snug">执行协同复杂度中等，需要总经理授权推进，预算需先批第一阶段</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => {
                    const planCard = document.querySelector('[data-plan-card]');
                    planCard?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }}
                    className="flex-1 py-2 rounded-xl text-[12px] font-semibold bg-slate-900 text-white hover:bg-slate-700 transition-colors">
                    查看方案详情
                  </button>
                  <button onClick={() => setCeoInput('在选方案之前，先给我每个方案的投入产出比——')}
                    className="px-4 py-2 rounded-xl text-[12px] font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                    要求补ROI
                  </button>
                  <button onClick={() => setCeoInput('当前先不拍板，我需要再看一个指标才决定——')}
                    className="px-4 py-2 rounded-xl text-[12px] font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                    暂缓结论
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Message Feed */}
          <div ref={feedRef} className="flex-1 overflow-y-auto px-5 py-4">
            {currentMsgs.map(msg => (
              <MsgBubble key={msg.id} msg={msg}
                onConsultApprove={handleConsultApprove}
                onPlanSelect={handlePlanSelect}
                onMemoryConfirm={handleMemoryConfirm}
                threadTasks={threadTasks} />
            ))}
            {activeThread === 'wangchao' && typingAgent && <TypingBubble agentId={typingAgent} />}
            {activeThread === 'wangchao' && scriptIdx >= SCRIPT.length && messages.length > 0 && (
              <div className="text-center py-6">
                <span className="text-[11px] text-slate-400 px-4 py-2 rounded-full bg-slate-100">联合研判已结案 · 全部内容已沉淀</span>
              </div>
            )}
          </div>

          {/* P0-3: CEO Directive Bar */}
          {activeThread === 'wangchao' && waitForCEO && pendingDecisions.length > 0 && (
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

        {/* ── Right Panel: 拍板依据栏 ── */}
        <div className="w-72 flex-shrink-0 bg-white border-l border-slate-200 flex flex-col overflow-hidden lg:flex xl:flex hidden">
          <div className="flex-1 overflow-y-auto">

            {/* ① 当前决策对象 - 第一优先 */}
            {activeThread === 'wangchao' && (currentPhase === 'solution' || currentPhase === 'decision') && (
              <div className="px-4 py-3 border-b-2 border-rose-200 bg-rose-50/50">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <AlertTriangle size={11} className="text-rose-500" />
                  <p className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">当前决策对象</p>
                </div>

                <div className="mb-3 p-2.5 rounded-lg bg-white border border-rose-100">
                  <p className="text-[11px] font-semibold text-slate-800 leading-snug mb-2">{WANGCHAO_DECISION.question}</p>
                  <div className="space-y-1">
                    {WANGCHAO_DECISION.options.map(opt => (
                      <div key={opt.id} className="flex items-center gap-1.5">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${opt.recommended ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                          {opt.id}
                        </span>
                        <span className="text-[10px] text-slate-600">{opt.label.split('·')[1]?.trim() || opt.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-2.5">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">推荐方案</p>
                  <p className="text-[10px] text-emerald-700 font-semibold">{WANGCHAO_DECISION.recommendedOption}</p>
                  <p className="text-[10px] text-slate-600 leading-snug mt-0.5">{WANGCHAO_DECISION.recommendReason}</p>
                </div>

                <div className="mb-2.5">
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">最大风险</p>
                  <p className="text-[10px] text-amber-700 leading-snug">{WANGCHAO_DECISION.risks}</p>
                </div>

                <div>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">验证指标</p>
                  <div className="space-y-0.5">
                    {WANGCHAO_DECISION.verificationMetrics.slice(0, 2).map((m, i) => (
                      <p key={i} className="text-[9px] text-slate-600 leading-snug">• {m}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ② 证据账本摘要 */}
            {activeThread === 'wangchao' && (
              <div className="px-4 py-3 border-b border-slate-200">
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-2.5">证据账本 ({WANGCHAO_EVIDENCE.length})</p>
                <div className="space-y-2">
                  {WANGCHAO_EVIDENCE.map(ev => (
                    <div key={ev.id} className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-semibold ${EVIDENCE_TYPE_COLOR[ev.type]}`}>
                          {ev.type}
                        </span>
                        <span className="text-[8px] text-slate-400">{ev.updatedAt}</span>
                        <span className={`ml-auto text-[8px] px-1 py-0.5 rounded ${
                          ev.credibility === 'high' ? 'bg-emerald-100 text-emerald-600' :
                          ev.credibility === 'medium' ? 'bg-amber-100 text-amber-600' :
                          'bg-slate-100 text-slate-500'
                        }`}>
                          {ev.credibility === 'high' ? '高' : ev.credibility === 'medium' ? '中' : '低'}
                        </span>
                      </div>
                      <p className="text-[9px] text-slate-600 leading-snug mb-1">{ev.summary}</p>
                      <p className="text-[8px] text-slate-400">提供者：{ev.provider}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ③ 执行验证指标 */}
            {activeThread === 'wangchao' && hasTasks && (
              <div className="px-4 py-3 border-b border-slate-200">
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-2.5">执行验证闭环</p>
                <div className="space-y-2">
                  {WANGCHAO_EXECUTION_TASKS.map(task => (
                    <div key={task.no} className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[8px] font-bold flex-shrink-0">
                          {task.no}
                        </span>
                        <p className="text-[10px] font-semibold text-slate-700 truncate flex-1">{task.title}</p>
                      </div>
                      <p className="text-[9px] text-slate-500 mb-0.5">责任人：{task.owner}</p>
                      <p className="text-[9px] text-slate-500 mb-1">截止：{task.deadline}</p>
                      <div className="pt-1 border-t border-slate-200">
                        <p className="text-[8px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">预期领先指标</p>
                        <p className="text-[9px] text-slate-600 leading-snug">{task.leadIndicator}</p>
                      </div>
                      {task.actualResult && (
                        <div className="mt-1.5 pt-1.5 border-t border-slate-200">
                          <p className="text-[8px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">实际结果</p>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                              task.onTarget ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                            }`}>
                              {task.onTarget ? '✓ 达标' : '✗ 未达标'}
                            </span>
                            <p className="text-[9px] text-slate-600">{task.actualResult}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ② 待总经理决策 */}
            {pendingDecisions.length > 0 && (
              <div className="px-4 py-3 border-b border-amber-100 bg-amber-50/50">
                <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-2">
                  待总经理决策 ({pendingDecisions.length})
                </p>
                <div className="space-y-2">
                  {pendingDecisions.map(m => (
                    <div key={m.id} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-[11px] font-semibold text-amber-800">
                          {m.type === 'consultation' ? '是否邀请招商经理' : m.type === 'plan-card' ? '选择执行方案' : '确认记忆沉淀'}
                        </p>
                        <p className="text-[10px] text-amber-600 mt-0.5">
                          {m.type === 'consultation' ? '获得续约侧判断依据' : m.type === 'plan-card' ? '立即生成执行任务' : '沉淀为可复用经验'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ③ 当前议题 */}
            <div className="px-4 py-2.5 border-b border-slate-100">
              <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">当前议题</p>
              <p className="text-[11px] font-semibold text-slate-700 mb-1">{activeThreadMeta.title}</p>
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium ${activeThreadMeta.riskColorCls}`}>
                  {activeThreadMeta.riskBadge}
                </span>
                <span className="text-[9px] text-slate-400">窗口 {activeThreadMeta.window}</span>
              </div>
              {activeThread === 'wangchao' && (
                <div className="rounded-lg bg-slate-900 px-2.5 py-2 mb-1.5">
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">研判目标</p>
                  <p className="text-[10px] text-white leading-snug">在91天窗口内，保住招商侧&ldquo;优先保留&rdquo;评级</p>
                </div>
              )}
              {activeThread === 'wangchao' && (
                <Link href="/workspace/archive/wangchao"
                  className="flex items-center gap-1 text-[9px] text-indigo-500 hover:text-indigo-700 transition-colors">
                  <span>查看干预档案</span>
                  <ArrowRight size={8} />
                </Link>
              )}
            </div>

            {/* ④ 参会专家 - 紧凑 */}
            <div className="px-4 py-2.5 border-b border-slate-100">
              <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">参会专家 ({participants.length})</p>
              <div className="space-y-1.5">
                {participants.map(aid => {
                  const ag = AG[aid];
                  const isNew = aid === 'merchant' && messages.some(m => m.type === 'system' && m.content?.includes('招商经理'));
                  return (
                    <div key={aid} className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: ag.color }} />
                      <span className="text-[10px] text-slate-600 truncate flex-1">{ag.name}</span>
                      {isNew && <span className="text-[8px] px-1 py-0.5 rounded bg-indigo-100 text-indigo-600 font-bold flex-shrink-0">新</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ⑤ 执行任务 */}
            {hasTasks && (
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">已生成任务 ({threadTasks.length})</p>
                <div className="space-y-1.5">
                  {threadTasks.map(t => (
                    <div key={t.no} className="flex items-start gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[8px] font-bold flex-shrink-0 mt-0.5">{t.no}</span>
                      <div className="min-w-0">
                        <p className="text-[10px] text-slate-600 truncate">{t.title}</p>
                        <p className="text-[9px] text-slate-400">{t.owner}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ⑥ 已沉淀经验 */}
            {memoryDone && (
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">已沉淀经验</p>
                <div className="flex items-center gap-1.5">
                  <Sparkles size={10} className="text-cyan-500 flex-shrink-0" />
                  <span className="text-[10px] text-slate-600">案例 #2024-088</span>
                </div>
              </div>
            )}

            {/* ⑦ 研判纪要 - 紧凑 */}
            {timeline.length > 0 && (
              <div className="px-4 py-2.5">
                <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">研判纪要</p>
                <div className="space-y-1">
                  {timeline.map((e, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className="text-[9px] text-slate-300 flex-shrink-0 w-8">{e.time}</span>
                      <span className="text-[9px] text-slate-500 leading-snug">{e.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Consult Modal */}
      {showNewConsult && (
        <NewConsultModal
          onClose={() => setShowNewConsult(false)}
          onCreate={handleNewConsult}
        />
      )}
    </div>
  );
}
