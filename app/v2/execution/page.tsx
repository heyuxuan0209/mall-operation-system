'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ListChecks, ClipboardList, MessageSquare, RotateCcw, MapPin,
  Clock, User, AlertTriangle, CheckCircle2, ChevronRight, ArrowRight,
  Zap, Filter, Search, ExternalLink, Activity, PlayCircle,
  TrendingUp, TrendingDown, Target, Bell,
} from 'lucide-react';

/* ─── Types & Constants ──────────────────────────────────────────── */
type TaskType = 'assist' | 'inspection' | 'communication' | 'review';
type TaskStatus = 'active' | 'pending' | 'done' | 'overdue';

const TYPE_CONFIG: Record<TaskType, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  assist:       { label: '帮扶任务', color: '#0ea5e9', bg: 'rgba(14,165,233,0.12)',  icon: Zap },
  inspection:   { label: '巡店任务', color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   icon: MapPin },
  communication:{ label: '沟通任务', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  icon: MessageSquare },
  review:       { label: '复盘任务', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)',  icon: RotateCcw },
};

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string }> = {
  active:  { label: '进行中', color: '#0ea5e9' },
  pending: { label: '待开始', color: '#94a3b8' },
  done:    { label: '已完成', color: '#22c55e' },
  overdue: { label: '已逾期', color: '#ef4444' },
};

/* ─── Mock Data ─────────────────────────────────────────────────── */
const tasks = [
  {
    id: 'T-2025-0421-001', type: 'assist' as TaskType,
    merchant: '望潮港火锅', area: 'B2-08', priority: 'high',
    title: '套餐结构重组与性价比提升',
    source: { id: '#D-D001', label: 'AI决策工作台 · 会商拍板 · 方案B' },
    assignee: '张运营', dueDate: '2025-04-28', status: 'active' as TaskStatus,
    progress: 2, totalSteps: 5,
    steps: [
      { label: '约谈商户负责人', done: true,  note: '已于4月22日完成' },
      { label: '输出套餐优化方案', done: true,  note: '方案已提交' },
      { label: '提报运营审批',    done: false, active: true, note: '' },
      { label: '落地执行',        done: false, active: false, note: '' },
      { label: '结果复盘',        done: false, active: false, note: '' },
    ],
    supervisor: '任务调度官',
    desc: '基于会商拍板方案B，重组套餐结构，引入差异化口味套餐，提升性价比。核心动作：高毛利套餐占比从31%→目标45%，2周内人均消费回升至¥128。',
  },
  {
    id: 'T-2025-0421-004', type: 'inspection' as TaskType,
    merchant: '望潮港火锅', area: 'B2-08', priority: 'high',
    title: '店外导视与用餐环境整改',
    source: { id: '#D-D001', label: 'AI决策工作台 · 会商拍板 · 方案B' },
    assignee: '李运营', dueDate: '2025-04-30', status: 'active' as TaskStatus,
    progress: 1, totalSteps: 3,
    steps: [
      { label: '输出整改清单', done: true,  note: '清单已确认，共7项整改点' },
      { label: '现场整改执行', done: false, active: true, note: '' },
      { label: '整改效果验收', done: false, active: false, note: '' },
    ],
    supervisor: '巡店督导',
    desc: '对望潮港门头导视、店内动线、用餐环境进行全面整改，改善顾客体验感知评分。整改完成后输出评分报告并推送至AI记忆中心。',
  },
  {
    id: 'T-2025-0421-005', type: 'assist' as TaskType,
    merchant: '望潮港火锅', area: 'B2-08', priority: 'medium',
    title: '晚高峰服务响应速度优化',
    source: { id: '#D-D001', label: 'AI决策工作台 · 会商拍板 · 方案B' },
    assignee: '王运营', dueDate: '2025-05-05', status: 'pending' as TaskStatus,
    progress: 0, totalSteps: 3,
    steps: [
      { label: '分析投诉高发时段', done: false, active: false, note: '' },
      { label: '制定响应SOP',      done: false, active: false, note: '' },
      { label: '上岗培训落地',     done: false, active: false, note: '' },
    ],
    supervisor: '商户经营顾问',
    desc: '针对晚高峰（18:00-21:00）差评集中问题，制定出餐提速与服务响应SOP并落地商户培训，目标差评率从4.5%降至3%以下。',
  },
  {
    id: 'T-2025-0507-001', type: 'review' as TaskType,
    merchant: '望潮港火锅', area: 'B2-08', priority: 'medium',
    title: '续约干预2周领先指标复盘',
    source: { id: '#D-D001', label: 'AI决策工作台 · 会商拍板 · 任务调度官' },
    assignee: '张运营', dueDate: '2025-05-12', status: 'pending' as TaskStatus,
    progress: 0, totalSteps: 3,
    steps: [
      { label: '汇总2周指标数据',      done: false, active: false, note: '' },
      { label: 'AI自动生成复盘报告', done: false, active: false, note: '' },
      { label: '沉淀为组织记忆案例', done: false, active: false, note: '' },
    ],
    supervisor: '案例记忆官',
    desc: '在方案B执行2周后对人均消费、差评率、高毛利单品占比三项领先指标进行数据复盘，评估执行效果并自动生成案例#2024-088的后续版本。',
  },
  {
    id: 'T-2025-0421-002', type: 'inspection' as TaskType,
    merchant: '新晋珠宝店', area: 'L1-05', priority: 'medium',
    title: '开业首月经营情况现场巡检',
    source: { id: '#D-D003', label: 'AI决策工作台 · 新商辅导场景' },
    assignee: '李运营', dueDate: '2025-04-27', status: 'active' as TaskStatus,
    progress: 1, totalSteps: 3,
    steps: [
      { label: '制定巡检计划', done: true,  note: 'AI 自动排程' },
      { label: '现场巡检执行', done: false, active: true, note: '' },
      { label: '输出巡检报告', done: false, active: false, note: '' },
    ],
    supervisor: '巡店督导',
    desc: '针对新入驻商户入驻45天经营启动缓慢问题，开展现场巡检，评估陈列、导购、商品结构，输出优化建议报告。',
  },
  {
    id: 'T-2025-0421-003', type: 'communication' as TaskType,
    merchant: '辛香汇', area: 'B3-12', priority: 'high',
    title: '与商户管理层沟通经营困难',
    source: { id: '#D-D002', label: 'AI决策工作台 · 经营下滑场景' },
    assignee: '王运营', dueDate: '2025-04-26', status: 'overdue' as TaskStatus,
    progress: 0, totalSteps: 3,
    steps: [
      { label: '约定沟通时间', done: false, active: true, note: '' },
      { label: '执行沟通会议', done: false, active: false, note: '' },
      { label: '形成会议纪要', done: false, active: false, note: '' },
    ],
    supervisor: '商户经营顾问',
    desc: '辛香汇连续3月营业额下滑，需与商户管理层进行深度沟通，了解经营困难根因，共同制定改善计划。',
  },
  {
    id: 'T-2025-0418-001', type: 'review' as TaskType,
    merchant: '清明节促销活动', area: 'B区全区', priority: 'low',
    title: 'B区清明节促销活动效果复盘',
    source: { id: '#D-D004', label: 'AI决策工作台 · 活动复盘场景' },
    assignee: '张运营', dueDate: '2025-04-25', status: 'done' as TaskStatus,
    progress: 4, totalSteps: 4,
    steps: [
      { label: '收集活动数据',  done: true, note: '达成率67%' },
      { label: '分析效果差距',  done: true, note: '客流目标未达' },
      { label: 'AI 根因诊断',   done: true, note: '活动时段偏短' },
      { label: '沉淀为组织记忆', done: true, note: '已生成案例 #2025-041' },
    ],
    supervisor: '案例记忆官',
    desc: '对B区清明节促销活动进行全面复盘，分析客流、销售、ROI数据，提炼可复用的活动经验。',
  },
  {
    id: 'T-2025-0420-001', type: 'assist' as TaskType,
    merchant: '屈臣氏', area: 'L1-22', priority: 'medium',
    title: '客诉异常专项帮扶',
    source: { id: '#D-D003', label: 'AI决策工作台 · 客诉干预场景' },
    assignee: '李运营', dueDate: '2025-04-30', status: 'pending' as TaskStatus,
    progress: 0, totalSteps: 4,
    steps: [
      { label: '分析客诉数据',  done: false, active: false, note: '' },
      { label: '与商户沟通',    done: false, active: false, note: '' },
      { label: '制定整改方案',  done: false, active: false, note: '' },
      { label: '跟踪整改效果',  done: false, active: false, note: '' },
    ],
    supervisor: '风险诊断师',
    desc: '屈臣氏本月投诉量环比上升38%，需分析投诉类型，协助商户制定整改方案并跟踪执行效果。',
  },
];

const tabs = ['全部任务', '按商户', '按类型', '按负责人', '按状态'];
const summaryStats = [
  { label: '进行中', value: 12, color: '#0ea5e9' },
  { label: '今日到期', value: 3,  color: '#f59e0b' },
  { label: '已逾期',   value: 1,  color: '#ef4444' },
  { label: '本月完成', value: 28, color: '#22c55e' },
];

/* ─── Leading Indicator Data (望潮港专项) ──────────────────────── */
type IndicatorDir = 'up' | 'down';
type IndicatorStatus = 'on-track' | 'watch' | 'alert';

interface Indicator {
  label: string;
  unit: string;
  current: number;
  target: number;
  baseline: number;
  values: number[]; // 7-day trend
  color: string;
  direction: IndicatorDir; // which direction is "good"
  status: IndicatorStatus;
}

const WANGCHAO_INDICATORS: Indicator[] = [
  {
    label: '人均消费',
    unit: '元',
    current: 124,
    target: 128,
    baseline: 121,
    values: [121, 122, 120, 121, 122, 123, 124],
    color: '#0ea5e9',
    direction: 'up',
    status: 'on-track',
  },
  {
    label: '差评率',
    unit: '%',
    current: 4.5,
    target: 3.0,
    baseline: 4.2,
    values: [4.2, 4.5, 4.8, 5.1, 4.7, 4.2, 4.5],
    color: '#f59e0b',
    direction: 'down',
    status: 'watch',
  },
  {
    label: '高毛利占比',
    unit: '%',
    current: 38,
    target: 45,
    baseline: 34,
    values: [34, 33, 32, 31, 33, 36, 38],
    color: '#22c55e',
    direction: 'up',
    status: 'on-track',
  },
];

/* ─── Sub-components ─────────────────────────────────────────────── */
function ProgressBar({ done, total, color }: { done: number; total: number; color: string }) {
  const pct = total > 0 ? (done / total) * 100 : 0;
  return (
    <div className="w-full h-1 rounded-full" style={{ background: 'rgba(148,163,184,0.1)' }}>
      <div className="h-1 rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

function Sparkline({ values, color, width = 80, height = 28 }: {
  values: number[];
  color: string;
  width?: number;
  height?: number;
}) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pad = height * 0.12;
  const innerH = height - pad * 2;

  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = pad + innerH - ((v - min) / range) * innerH;
    return { x, y };
  });

  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const last = pts[pts.length - 1];

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last.x} cy={last.y} r="2.5" fill={color} />
    </svg>
  );
}

const STATUS_LABEL: Record<IndicatorStatus, { label: string; color: string; bg: string }> = {
  'on-track': { label: '改善中', color: '#4ade80', bg: 'rgba(34,197,94,0.1)' },
  'watch':    { label: '待观察', color: '#fbbf24', bg: 'rgba(245,158,11,0.1)' },
  'alert':    { label: '预警',   color: '#f87171', bg: 'rgba(239,68,68,0.1)' },
};

function LeadingIndicatorDashboard() {
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: '#0c1525', border: '1px solid rgba(14,165,233,0.18)' }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-2.5"
        style={{ background: 'rgba(14,165,233,0.07)', borderBottom: '1px solid rgba(14,165,233,0.12)' }}>
        <Activity size={12} style={{ color: '#38bdf8' }} />
        <span className="text-xs font-semibold text-sky-300">2周领先指标追踪</span>
        <span className="ml-auto text-[10px] text-slate-500">会商拍板 → 方案B目标值</span>
      </div>

      <div className="p-4 space-y-4">
        {WANGCHAO_INDICATORS.map(ind => {
          const st = STATUS_LABEL[ind.status];
          // progress toward target (0–100%)
          const progress = ind.direction === 'up'
            ? Math.max(0, Math.min(100, ((ind.current - ind.baseline) / (ind.target - ind.baseline)) * 100))
            : Math.max(0, Math.min(100, ((ind.baseline - ind.current) / (ind.baseline - ind.target)) * 100));
          const delta = ind.current - ind.baseline;
          const isGood = ind.direction === 'up' ? delta >= 0 : delta <= 0;
          const Trend = ind.direction === 'up'
            ? (delta >= 0 ? TrendingUp : TrendingDown)
            : (delta <= 0 ? TrendingDown : TrendingUp);

          return (
            <div key={ind.label}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-300">{ind.label}</span>
                  <span className="text-xs font-bold" style={{ color: ind.color }}>
                    {ind.current}{ind.unit}
                  </span>
                  <Trend size={11} style={{ color: isGood ? '#4ade80' : '#f87171' }} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: st.bg, color: st.color }}>
                    {st.label}
                  </span>
                  <span className="text-[10px] text-slate-600">目标 {ind.target}{ind.unit}</span>
                </div>
              </div>

              {/* Progress bar toward target */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(148,163,184,0.1)' }}>
                  <div className="h-1.5 rounded-full transition-all" style={{ width: `${progress}%`, background: ind.color }} />
                </div>
                <Sparkline values={ind.values} color={ind.color} width={72} height={24} />
                <span className="text-[10px] text-slate-600 w-8 text-right">{Math.round(progress)}%</span>
              </div>

              <div className="flex items-center gap-4 mt-1 text-[10px] text-slate-600">
                <span>基准 {ind.baseline}{ind.unit}</span>
                <span>·</span>
                <span style={{ color: isGood ? '#4ade80' : '#f87171' }}>
                  {isGood ? '+' : ''}{ind.direction === 'up' ? delta.toFixed(1) : (-delta).toFixed(1)}{ind.unit === '元' ? '元' : '%'} vs 基准
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Target date strip */}
      <div className="px-4 py-2.5 flex items-center gap-2"
        style={{ borderTop: '1px solid rgba(148,163,184,0.07)', background: 'rgba(148,163,184,0.03)' }}>
        <Target size={10} className="text-slate-500" />
        <span className="text-[10px] text-slate-500">
          复盘节点：2025-05-12 · 达标后 AI 自动触发续约风险降级评估
        </span>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────── */
export default function ExecutionPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedTask, setSelectedTask] = useState(tasks[0]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTasks = tasks.filter(t =>
    t.title.includes(searchQuery) || t.merchant.includes(searchQuery)
  );

  const typeConfig = TYPE_CONFIG[selectedTask.type];
  const statusConfig = STATUS_CONFIG[selectedTask.status];
  const TypeIcon = typeConfig.icon;
  const isWangChao = selectedTask.merchant === '望潮港火锅';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#070d1e' }}>

      {/* ── Header ── */}
      <div className="px-6 pt-6 pb-4" style={{ borderBottom: '1px solid rgba(148,163,184,0.07)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <ListChecks size={18} className="text-sky-400" /> 执行推进中心
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">每项任务均可溯源至 AI 决策工作台</p>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white"
            style={{ background: 'linear-gradient(135deg,#0ea5e9,#2563eb)', boxShadow: '0 0 12px rgba(14,165,233,0.25)' }}>
            <Zap size={11} /> 新建任务
          </button>
        </div>

        {/* Summary stats */}
        <div className="flex items-center gap-4">
          {summaryStats.map(s => (
            <div key={s.label} className="flex items-center gap-2">
              <span className="text-xl font-bold" style={{ color: s.color }}>{s.value}</span>
              <span className="text-xs text-slate-500">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4">
          {tabs.map((tab, i) => (
            <button key={tab}
              onClick={() => setActiveTab(i)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: activeTab === i ? 'rgba(14,165,233,0.12)' : 'transparent',
                border: activeTab === i ? '1px solid rgba(14,165,233,0.25)' : '1px solid transparent',
                color: activeTab === i ? '#38bdf8' : '#64748b',
              }}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* ── Task List ── */}
        <div className="w-full lg:w-[55%] xl:w-[45%] flex flex-col border-r flex-shrink-0"
          style={{ borderColor: 'rgba(148,163,184,0.07)' }}>

          {/* Search */}
          <div className="p-3" style={{ borderBottom: '1px solid rgba(148,163,184,0.06)' }}>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: '#0c1525', border: '1px solid rgba(148,163,184,0.08)' }}>
              <Search size={12} className="text-slate-500" />
              <input
                className="flex-1 bg-transparent text-xs text-slate-300 outline-none placeholder:text-slate-600"
                placeholder="搜索任务、商户名称..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Task items */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">

            {/* 望潮港 group label */}
            <p className="text-[10px] text-slate-600 px-1 pb-0.5 uppercase tracking-wide font-semibold">
              望潮港火锅 · 续约干预专项
            </p>
            {filteredTasks.filter(t => t.merchant === '望潮港火锅').map(task => (
              <TaskCard key={task.id} task={task} selected={selectedTask.id === task.id} onSelect={() => setSelectedTask(task)} />
            ))}

            {/* Other tasks */}
            <p className="text-[10px] text-slate-600 px-1 pt-2 pb-0.5 uppercase tracking-wide font-semibold">
              其他任务
            </p>
            {filteredTasks.filter(t => t.merchant !== '望潮港火锅').map(task => (
              <TaskCard key={task.id} task={task} selected={selectedTask.id === task.id} onSelect={() => setSelectedTask(task)} />
            ))}
          </div>
        </div>

        {/* ── Task Detail ── */}
        <div className="hidden lg:flex flex-1 flex-col overflow-y-auto p-6 min-w-0">
          {selectedTask && (() => {
            const tc = TYPE_CONFIG[selectedTask.type];
            const sc = STATUS_CONFIG[selectedTask.status];
            const Icon = tc.icon;
            return (
              <div className="space-y-5">

                {/* 续约风险降级通知 (望潮港 only) */}
                {isWangChao && (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
                    style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)' }}>
                    <Bell size={13} style={{ color: '#4ade80' }} />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-emerald-400">续约风险评估更新</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        基于当前3项执行任务进展，风险等级已从
                        <span className="text-rose-400 font-medium mx-1">高风险</span>→
                        <span className="text-amber-400 font-medium mx-1">中风险</span>。
                        2周指标达标后 AI 将自动触发降至低风险。
                      </p>
                    </div>
                    <Link href="/workspace" className="flex items-center gap-1 text-[10px] text-sky-400 flex-shrink-0">
                      查看会商 <ExternalLink size={9} />
                    </Link>
                  </div>
                )}

                {/* Detail header */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-slate-500">{selectedTask.id}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ background: tc.bg, color: tc.color }}>{tc.label}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-medium ml-auto"
                      style={{ background: `${sc.color}15`, color: sc.color, border: `1px solid ${sc.color}25` }}>{sc.label}</span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-100">{selectedTask.title}</h2>
                  <p className="text-xs text-slate-500 mt-1">{selectedTask.merchant} · {selectedTask.area}</p>
                </div>

                {/* Description */}
                <div className="rounded-xl p-4" style={{ background: '#0c1525', border: '1px solid rgba(148,163,184,0.08)' }}>
                  <p className="text-xs text-slate-400 leading-relaxed">{selectedTask.desc}</p>
                </div>

                {/* Leading indicator dashboard (望潮港 only) */}
                {isWangChao && <LeadingIndicatorDashboard />}

                {/* Task source */}
                <div className="rounded-xl p-4" style={{ background: '#0c1525', border: '1px solid rgba(14,165,233,0.15)' }}>
                  <p className="text-[10px] text-slate-500 mb-2">任务来源（可溯源至 AI 决策）</p>
                  <Link href="/v2/decision"
                    className="flex items-center gap-2 group">
                    <span className="text-xs font-mono text-sky-400">{selectedTask.source.id}</span>
                    <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors">{selectedTask.source.label}</span>
                    <ArrowRight size={11} className="text-sky-400 ml-auto" />
                  </Link>
                </div>

                {/* Execution steps */}
                <div className="rounded-xl p-4" style={{ background: '#0c1525', border: '1px solid rgba(148,163,184,0.08)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-slate-300">执行步骤</p>
                    <span className="text-[10px] text-slate-500">
                      {selectedTask.progress}/{selectedTask.totalSteps} 已完成
                    </span>
                  </div>
                  <div className="space-y-3">
                    {selectedTask.steps.map((s, i) => {
                      const isActive = !s.done && (s as any).active;
                      return (
                        <div key={i} className="flex items-start gap-3">
                          <div className="flex flex-col items-center flex-shrink-0">
                            <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{
                                background: s.done ? tc.color : isActive ? `${tc.color}20` : 'rgba(148,163,184,0.08)',
                                border: s.done ? 'none' : isActive ? `1.5px solid ${tc.color}` : '1px solid rgba(148,163,184,0.15)',
                              }}>
                              {s.done
                                ? <CheckCircle2 size={10} className="text-white" />
                                : isActive
                                  ? <Activity size={9} style={{ color: tc.color }} />
                                  : <span className="text-[9px] text-slate-600">{i + 1}</span>
                              }
                            </div>
                            {i < selectedTask.steps.length - 1 && (
                              <div className="w-px flex-1 mt-1"
                                style={{ background: s.done ? `${tc.color}30` : 'rgba(148,163,184,0.08)', minHeight: 12 }} />
                            )}
                          </div>
                          <div className="flex-1 pb-2">
                            <p className="text-xs font-medium" style={{ color: s.done ? '#94a3b8' : isActive ? '#e2e8f0' : '#475569' }}>
                              {s.done && <span className="line-through mr-1">{s.label}</span>}
                              {!s.done && s.label}
                            </p>
                            {s.note && <p className="text-[11px] text-slate-600 mt-0.5">{s.note}</p>}
                            {isActive && (
                              <div className="flex items-center gap-1.5 mt-1">
                                <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: tc.color }} />
                                <span className="text-[11px]" style={{ color: tc.color }}>当前步骤进行中</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Meta info */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: '负责人', value: selectedTask.assignee, icon: User },
                    { label: '截止时间', value: selectedTask.dueDate, icon: Clock },
                  ].map(m => {
                    const MIcon = m.icon;
                    return (
                      <div key={m.label} className="rounded-xl p-3"
                        style={{ background: '#0c1525', border: '1px solid rgba(148,163,184,0.07)' }}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <MIcon size={11} className="text-slate-500" />
                          <span className="text-[10px] text-slate-500">{m.label}</span>
                        </div>
                        <p className="text-xs font-medium text-slate-300">{m.value}</p>
                      </div>
                    );
                  })}
                </div>

                {/* AI supervisor */}
                <div className="rounded-xl p-3 flex items-center gap-3"
                  style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.18)' }}>
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#8b5cf6' }} />
                  <p className="text-xs text-slate-400">
                    <span className="text-violet-400 font-medium">{selectedTask.supervisor}</span>
                    {' '}正在监控此任务进展，如超期将自动预警
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  {selectedTask.status !== 'done' && (
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium text-white"
                      style={{ background: 'linear-gradient(135deg,#0ea5e9,#2563eb)', boxShadow: '0 0 12px rgba(14,165,233,0.2)' }}>
                      <PlayCircle size={14} /> 标记当前步骤完成
                    </button>
                  )}
                  <button className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm text-slate-400"
                    style={{ background: 'rgba(148,163,184,0.06)', border: '1px solid rgba(148,163,184,0.1)' }}>
                    <ClipboardList size={13} /> 上传记录
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

/* ─── TaskCard (extracted for reuse) ────────────────────────────── */
function TaskCard({ task, selected, onSelect }: {
  task: typeof tasks[0];
  selected: boolean;
  onSelect: () => void;
}) {
  const tc = TYPE_CONFIG[task.type];
  const sc = STATUS_CONFIG[task.status];
  const Icon = tc.icon;
  return (
    <button
      onClick={onSelect}
      className="w-full text-left rounded-xl p-4 transition-all"
      style={{
        background: selected ? '#0f1c30' : '#0c1525',
        border: selected ? '1px solid rgba(14,165,233,0.25)' : '1px solid rgba(148,163,184,0.07)',
      }}>
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: tc.bg }}>
          <Icon size={14} style={{ color: tc.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] px-1.5 py-0.5 rounded font-medium"
              style={{ background: tc.bg, color: tc.color }}>{tc.label}</span>
            {task.priority === 'high' && <AlertTriangle size={10} className="text-rose-400" />}
            <span className="text-[10px] ml-auto" style={{ color: sc.color }}>{sc.label}</span>
          </div>
          <p className="text-xs font-semibold text-slate-200 mb-0.5 truncate">{task.title}</p>
          <p className="text-[11px] text-slate-500 mb-2">
            {task.merchant} · {task.area}
          </p>
          <ProgressBar done={task.progress} total={task.totalSteps} color={tc.color} />
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-[10px] text-slate-600">
              {task.progress}/{task.totalSteps} 步 · {task.assignee}
            </span>
            <span className="text-[10px] flex items-center gap-1" style={{ color: task.status === 'overdue' ? '#f87171' : '#64748b' }}>
              <Clock size={9} /> {task.dueDate}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[10px] text-sky-500">
            <ExternalLink size={9} />
            来源：{task.source.label}
          </div>
        </div>
      </div>
    </button>
  );
}
