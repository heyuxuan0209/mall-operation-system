'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  AlertTriangle, Clock, CheckCircle2, ArrowRight, Sparkles,
  ChevronRight, Activity, TrendingDown, TrendingUp, Users,
  Zap, Brain, BarChart3, RefreshCw,
} from 'lucide-react';

/* ─── Mock Data ─────────────────────────────────────────────────── */
const merchantData = [
  { name: '望潮港火锅', health: 42, lease: 91,  sales: 280, risk: 'high' },
  { name: '辛香汇',     health: 38, lease: 67,  sales: 190, risk: 'high' },
  { name: '新晋珠宝',   health: 55, lease: 45,  sales: 120, risk: 'high' },
  { name: '潮流眼镜',   health: 44, lease: 88,  sales: 60,  risk: 'high' },
  { name: '海底捞',     health: 71, lease: 180, sales: 580, risk: 'medium' },
  { name: '屈臣氏',     health: 65, lease: 150, sales: 210, risk: 'medium' },
  { name: '喜茶',       health: 58, lease: 120, sales: 90,  risk: 'medium' },
  { name: '太平洋咖啡', health: 62, lease: 130, sales: 110, risk: 'medium' },
  { name: '星巴克',     health: 88, lease: 280, sales: 180, risk: 'low' },
  { name: '优衣库',     health: 82, lease: 365, sales: 450, risk: 'low' },
  { name: 'ZARA',       health: 76, lease: 200, sales: 320, risk: 'low' },
  { name: '肯德基',     health: 79, lease: 220, sales: 340, risk: 'low' },
  { name: '耐克',       health: 84, lease: 300, sales: 290, risk: 'low' },
  { name: '名创优品',   health: 73, lease: 190, sales: 160, risk: 'low' },
];

const riskColor = { high: '#ef4444', medium: '#f59e0b', low: '#22c55e' };

const highPriorityIssues = [
  {
    id: 'P001', merchant: '望潮港火锅', area: 'B2-08',
    issue: '续约风险升级', detail: '租约剩余91天，坪效下滑22%，投诉上升',
    tags: ['续约风险', '坪效预警'], daysLeft: 45,
  },
  {
    id: 'P002', merchant: '辛香汇', area: 'B3-12',
    issue: '经营持续下滑', detail: '连续3月营业额环比 −15%，客单价下降',
    tags: ['营收风险'], daysLeft: 30,
  },
  {
    id: 'P003', merchant: '新晋珠宝店', area: 'L1-05',
    issue: '开业启动缓慢', detail: '入驻45天，坪效仅达标准65%',
    tags: ['新商辅导'], daysLeft: 20,
  },
];

const mediumIssues = [
  { merchant: 'B区周末活动', issue: '活动达成率仅67%，需复盘调整策略' },
  { merchant: '屈臣氏',     issue: '本月客诉量环比+38%，需介入' },
  { merchant: '喜茶',       issue: '旺季坪效未达基准，活动策略待优化' },
];

const agentFeed = [
  { time: '09:28', agent: '案例记忆官', color: '#06b6d4',  action: '为"望潮港"决策引用历史案例 #2024-087（相似度87%）' },
  { time: '09:25', agent: '风险诊断师', color: '#ef4444',  action: '完成今日全场83家商户健康扫描，识别4项高风险' },
  { time: '09:10', agent: '任务调度官', color: '#8b5cf6',  action: '自动派发3项帮扶任务至运营团队' },
  { time: '08:55', agent: '商户经营顾问', color: '#0ea5e9', action: '完成"辛香汇"根因诊断报告' },
  { time: '08:30', agent: '风险诊断师', color: '#ef4444',  action: '生成今日经营晨报，识别5个重点问题' },
];

/* ─── Sub-components ─────────────────────────────────────────────── */
const RiskDot = (props: any) => {
  const { cx, cy, payload } = props;
  const r = Math.sqrt(payload.sales) * 0.9 + 5;
  const color = riskColor[payload.risk as keyof typeof riskColor];
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={color} fillOpacity={0.18} stroke={color} strokeWidth={1.5} />
      {payload.risk === 'high' && (
        <circle cx={cx} cy={cy} r={r + 3} fill="none" stroke={color} strokeWidth={0.8} strokeDasharray="3 2" />
      )}
    </g>
  );
};

const CustomScatterTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div style={{
      background: '#0f1a2e', border: '1px solid rgba(148,163,184,0.15)',
      borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#e2e8f0',
    }}>
      <p style={{ fontWeight: 600, marginBottom: 4 }}>{d.name}</p>
      <p style={{ color: '#94a3b8' }}>健康指数 <span style={{ color: '#e2e8f0' }}>{d.health}</span></p>
      <p style={{ color: '#94a3b8' }}>租约剩余 <span style={{ color: '#e2e8f0' }}>{d.lease} 天</span></p>
      <p style={{ color: '#94a3b8' }}>月均销售 <span style={{ color: '#e2e8f0' }}>{d.sales}万</span></p>
      <p style={{ marginTop: 4, color: riskColor[d.risk as keyof typeof riskColor], fontWeight: 500 }}>
        {d.risk === 'high' ? '🔴 高风险' : d.risk === 'medium' ? '🟡 中风险' : '🟢 低风险'}
      </p>
    </div>
  );
};

/* ─── Main Page ──────────────────────────────────────────────────── */
export default function V2Dashboard() {
  const [reportExpanded, setReportExpanded] = useState(false);

  const stats = {
    total: merchantData.length,
    high: merchantData.filter(m => m.risk === 'high').length,
    medium: merchantData.filter(m => m.risk === 'medium').length,
    low: merchantData.filter(m => m.risk === 'low').length,
  };

  return (
    <div className="min-h-screen p-5 lg:p-7 space-y-5" style={{ background: '#070d1e' }}>

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100">经营驾驶舱</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
            &nbsp;· 数据更新于 09:30
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-400 transition-all"
            style={{ background: 'rgba(148,163,184,0.06)', border: '1px solid rgba(148,163,184,0.1)' }}>
            <RefreshCw size={11} /> 刷新
          </button>
          <Link href="/v2/session"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all"
            style={{ background: 'linear-gradient(135deg,#0ea5e9,#2563eb)', boxShadow: '0 0 12px rgba(14,165,233,0.3)' }}>
            <Brain size={11} /> 启动 AI 会商
          </Link>
        </div>
      </div>

      {/* ── AI Morning Report Banner ── */}
      <div className="rounded-2xl p-5 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(14,165,233,0.08) 0%, rgba(37,99,235,0.08) 100%)',
          border: '1px solid rgba(14,165,233,0.18)',
        }}>
        {/* glow */}
        <div className="absolute top-0 left-0 w-64 h-24 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(14,165,233,0.07), transparent)', filter: 'blur(24px)' }} />

        <div className="flex items-start gap-4 relative z-10">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: 'linear-gradient(135deg,#0ea5e9,#2563eb)', boxShadow: '0 0 12px rgba(14,165,233,0.4)' }}>
            <Sparkles size={16} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold text-sky-300">今日经营晨报</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{ background: 'rgba(14,165,233,0.15)', color: '#38bdf8', border: '1px solid rgba(14,165,233,0.25)' }}>
                AI 生成 · 08:30
              </span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              今日重点：<span className="text-rose-400 font-medium">望潮港火锅</span>续约风险升级（租约剩余91天，坪效下滑22%），干预窗口约<span className="text-amber-400 font-medium">45天</span>；
              <span className="text-amber-400 font-medium">B区周末活动</span>效果不及预期（达成率67%，需复盘）；
              <span className="text-amber-400 font-medium">辛香汇</span>已连续3月营业额下滑，建议本周启动帮扶。
              {!reportExpanded && <span className="text-sky-400 cursor-pointer ml-1 hover:underline" onClick={() => setReportExpanded(true)}>展开全文 ›</span>}
            </p>
            {reportExpanded && (
              <p className="text-sm text-slate-400 leading-relaxed mt-2">
                今日全场83家商户健康评分均值<span className="text-slate-300">74.2分</span>（较上周+1.3分）。
                4家高风险商户需优先处理，预计本月若不干预，续约风险商户合同价值损失约<span className="text-rose-400 font-medium">280万/年</span>。
                AI 推荐今日最优先处理：望潮港续约干预（窗口关键期），其次辛香汇经营帮扶。
                <span className="text-sky-400 cursor-pointer ml-2 hover:underline" onClick={() => setReportExpanded(false)}>收起</span>
              </p>
            )}
          </div>
          <Link href="/v2/session" className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-sky-300 transition-all"
            style={{ background: 'rgba(14,165,233,0.12)', border: '1px solid rgba(14,165,233,0.2)' }}>
            启动会商 <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {/* ── 4 Summary Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: '在营商户', value: stats.total, unit: '家', icon: Users, color: '#0ea5e9', sub: '较上月 +2' },
          { label: '高风险', value: stats.high, unit: '家', icon: AlertTriangle, color: '#ef4444', sub: '需立即关注' },
          { label: '中风险', value: stats.medium, unit: '家', icon: Activity, color: '#f59e0b', sub: '建议干预' },
          { label: '健康商户', value: stats.low, unit: '家', icon: CheckCircle2, color: '#22c55e', sub: '正常运营' },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-xl p-4 relative overflow-hidden"
              style={{ background: '#0c1525', border: '1px solid rgba(148,163,184,0.08)' }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-500 mb-1">{s.label}</p>
                  <p className="text-2xl font-bold" style={{ color: s.color }}>
                    {s.value}<span className="text-sm font-normal text-slate-500 ml-1">{s.unit}</span>
                  </p>
                  <p className="text-[11px] text-slate-600 mt-1">{s.sub}</p>
                </div>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${s.color}15` }}>
                  <Icon size={15} style={{ color: s.color }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Three-column main area ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* ── Left: Priority Actions (3 cols) ── */}
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Zap size={13} className="text-sky-400" /> AI 优先级推荐
            </h2>
            <span className="text-[10px] text-slate-500">今日 3 高优</span>
          </div>

          {/* High priority */}
          {highPriorityIssues.map((issue) => (
            <div key={issue.id} className="rounded-xl p-3.5 group cursor-pointer transition-all"
              style={{
                background: '#0c1525',
                border: '1px solid rgba(239,68,68,0.18)',
                borderLeft: '3px solid #ef4444',
              }}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                      style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>高优</span>
                    <span className="text-xs text-slate-300 font-medium truncate">{issue.merchant}</span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{issue.area}</p>
                </div>
                <span className="text-[10px] text-rose-400 flex-shrink-0">
                  干预窗口 {issue.daysLeft}天
                </span>
              </div>
              <p className="text-xs font-medium text-slate-200 mb-1">{issue.issue}</p>
              <p className="text-[11px] text-slate-500 mb-2.5 leading-relaxed">{issue.detail}</p>
              <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
                {issue.tags.map(t => (
                  <span key={t} className="text-[10px] px-1.5 py-0.5 rounded"
                    style={{ background: 'rgba(239,68,68,0.1)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)' }}>
                    {t}
                  </span>
                ))}
              </div>
              <Link href="/v2/session"
                className="w-full flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{ background: 'rgba(14,165,233,0.1)', color: '#38bdf8', border: '1px solid rgba(14,165,233,0.2)' }}>
                AI 研判此问题 <ChevronRight size={11} />
              </Link>
            </div>
          ))}

          {/* Medium priority */}
          <div className="rounded-xl p-3.5" style={{ background: '#0c1525', border: '1px solid rgba(245,158,11,0.15)', borderLeft: '3px solid #f59e0b' }}>
            <p className="text-[10px] text-amber-500 font-semibold mb-2">中优 · {mediumIssues.length} 项建议关注</p>
            <div className="space-y-2">
              {mediumIssues.map((m, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: '#f59e0b' }} />
                  <div>
                    <p className="text-xs font-medium text-slate-300">{m.merchant}</p>
                    <p className="text-[11px] text-slate-500">{m.issue}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Center: Health Matrix (6 cols) ── */}
        <div className="lg:col-span-6 rounded-2xl p-5"
          style={{ background: '#0c1525', border: '1px solid rgba(148,163,184,0.08)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <BarChart3 size={13} className="text-sky-400" /> 商户健康全景矩阵
            </h2>
            <div className="flex items-center gap-3 text-[11px]">
              {Object.entries(riskColor).map(([k, v]) => (
                <div key={k} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ background: v }} />
                  <span className="text-slate-500">
                    {k === 'high' ? '高风险' : k === 'medium' ? '中风险' : '健康'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Axis labels */}
          <div className="flex justify-between px-8 text-[10px] text-slate-600 mb-1">
            <span>← 续约紧迫</span><span>租约剩余时间</span><span>充裕 →</span>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.06)" />

              {/* Danger zone reference lines */}
              <XAxis dataKey="lease" type="number" domain={[0, 400]} tick={{ fontSize: 10, fill: '#475569' }} name="租约剩余" unit="天" />
              <YAxis dataKey="health" type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#475569' }} name="健康指数" />
              <ZAxis dataKey="sales" range={[60, 400]} />
              <Tooltip content={<CustomScatterTooltip />} />

              {/* Scatter by risk group */}
              {(['high', 'medium', 'low'] as const).map(risk => (
                <Scatter key={risk} data={merchantData.filter(m => m.risk === risk)} shape={<RiskDot />} />
              ))}
            </ScatterChart>
          </ResponsiveContainer>

          {/* Quadrant labels */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            {[
              { label: '续约高危区', desc: '健康低 + 租约短', color: '#ef4444' },
              { label: '经营观察区', desc: '健康中等，需跟进', color: '#f59e0b' },
              { label: '重点保护区', desc: '健康好但租约临近', color: '#f59e0b' },
              { label: '稳健经营区', desc: '健康高 + 租约充裕', color: '#22c55e' },
            ].map((q) => (
              <div key={q.label} className="flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{ background: `${q.color}08`, border: `1px solid ${q.color}18` }}>
                <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: q.color, opacity: 0.7 }} />
                <div>
                  <p className="text-[11px] font-medium" style={{ color: q.color }}>{q.label}</p>
                  <p className="text-[10px] text-slate-600">{q.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[11px] text-slate-600 mt-3 text-center">
            气泡大小代表月均销售额 · 点击气泡查看商户详情
          </p>
        </div>

        {/* ── Right: Execution Snapshot + Agent Feed (3 cols) ── */}
        <div className="lg:col-span-3 space-y-3">
          <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Activity size={13} className="text-sky-400" /> 执行进展快照
          </h2>

          {/* Execution metrics */}
          {[
            { label: '进行中任务', value: 12, color: '#0ea5e9', icon: TrendingUp },
            { label: '今日到期', value: 3, color: '#f59e0b', icon: Clock },
            { label: '逾期未完', value: 1, color: '#ef4444', icon: AlertTriangle },
            { label: '本月已完成', value: 28, color: '#22c55e', icon: CheckCircle2 },
          ].map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.label} className="flex items-center justify-between px-4 py-3 rounded-xl"
                style={{ background: '#0c1525', border: '1px solid rgba(148,163,184,0.07)' }}>
                <div className="flex items-center gap-2">
                  <Icon size={13} style={{ color: m.color }} />
                  <span className="text-xs text-slate-400">{m.label}</span>
                </div>
                <span className="text-lg font-bold" style={{ color: m.color }}>{m.value}</span>
              </div>
            );
          })}

          <Link href="/v2/execution"
            className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-xs font-medium transition-all"
            style={{ background: 'rgba(14,165,233,0.08)', color: '#38bdf8', border: '1px solid rgba(14,165,233,0.15)' }}>
            查看全部任务 <ArrowRight size={11} />
          </Link>

          {/* Agent Activity Feed */}
          <div>
            <h3 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
              今日 Agent 动态
            </h3>
            <div className="space-y-2.5">
              {agentFeed.map((item, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="flex flex-col items-center flex-shrink-0 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: item.color }} />
                    {i < agentFeed.length - 1 && (
                      <div className="w-px flex-1 mt-1" style={{ background: 'rgba(148,163,184,0.1)', minHeight: 16 }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pb-2">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[10px] font-medium" style={{ color: item.color }}>{item.agent}</span>
                      <span className="text-[10px] text-slate-600">{item.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{item.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
