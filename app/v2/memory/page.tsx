'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookMarked, CheckCircle2, XCircle, LayoutTemplate, Activity,
  Search, ChevronRight, ArrowRight, Sparkles, Clock, BarChart3,
  Tag, Cpu, ExternalLink, FileText, X, TrendingUp, Brain, Lightbulb,
} from 'lucide-react';

/* ─── Mock Data ──────────────────────────────────────────────────── */
const successCases = [
  {
    id: '#2024-088', title: '餐饮商户续约风险干预：经营修复+体验整改联合策略',
    category: '续约危机干预', tags: ['正餐·火锅', '双修并进', '续约危机', '最新沉淀'],
    isNew: true,
    merchant: { type: '正餐·火锅', area: '主力店', size: '750㎡', risk: '高风险→中风险' },
    problem: '续约窗口91天，坪效下滑22%，人均消费低于同类均值12%，差评率上升，招商侧列为观察商户',
    diagnosis: '经营能力+体验质量双重拖拽，非纯流量问题；核心是菜单结构老化与服务响应缺口，两者叠加导致消费质量下降',
    strategy: '套餐结构重组（提升高毛利占比）+ 体验整改（门头/动线/服务响应）双轨并进',
    actions: '套餐结构重组 → 店外导视整改 → 晚高峰SOP培训 → 2周领先指标追踪 → 复盘沉淀',
    results: { primary: '人均消费↑+3元（进行中）', secondary: '高毛利占比31%→38%', tertiary: '续约风险高→中降级' },
    condition: '正餐品类 / 租约剩余60-120天 / 坪效+体验双下滑 / 差评率上升',
    aiUsed: 1, lastUsed: '今日 09:28', similarity: 91,
    successRate: null, sampleSize: 1,
    sourceWorkspace: true,
  },
  {
    id: '#2024-087', title: '火锅品牌续约危机干预',
    category: '续约危机干预', tags: ['正餐·火锅', '套餐优化', '续约危机'],
    isNew: false,
    merchant: { type: '正餐·火锅', area: '主力店', size: '800㎡', risk: '曾高风险' },
    problem: '租约剩余90天，续约意向低，坪效下滑20%以上，客诉频发',
    diagnosis: '坪效下滑主因为人均消费降低（非客流），菜单套餐老化，性价比不足',
    strategy: '套餐结构优化 + 限定节假日联名活动',
    actions: '4周菜单改版 → 2次运营辅导 → 1次活动推广',
    results: { primary: '坪效回升 +18%', secondary: '续约签订', tertiary: '客诉清零' },
    condition: '正餐品类 / 租约剩余60-120天 / 坪效下滑15%+',
    aiUsed: 7, lastUsed: '今日 09:28', similarity: 87,
    successRate: 83, sampleSize: 23,
    sourceWorkspace: false,
  },
  {
    id: '#2024-063', title: '零售品牌坪效提升专项',
    category: '经营下滑帮扶', tags: ['零售·服装', '陈列优化', '坪效提升'],
    isNew: false,
    merchant: { type: '零售·服装', area: '次主力', size: '300㎡', risk: '中等风险' },
    problem: '坪效连续2月低于行业基准30%，库存周转慢',
    diagnosis: '陈列逻辑混乱，新品上架慢，导购动线设计不合理',
    strategy: '陈列重设计 + 导购培训 + 选品结构优化',
    actions: '3周陈列改造 → 导购培训2轮 → 爆款集中展示',
    results: { primary: '坪效提升 +24%', secondary: '库存周转加快', tertiary: '客单价+12%' },
    condition: '零售品类 / 坪效低于基准20%+ / 库存周转<4次/月',
    aiUsed: 5, lastUsed: '2025-04-20', similarity: 74,
    successRate: 78, sampleSize: 18,
    sourceWorkspace: false,
  },
  {
    id: '#2025-012', title: '餐饮品牌活动复盘优化',
    category: '活动效果优化', tags: ['餐饮', '活动策划', '节假日'],
    isNew: false,
    merchant: { type: '休闲餐饮', area: '标准店', size: '200㎡', risk: '低风险' },
    problem: '五一活动客流达成率仅72%，活动ROI低于预期',
    diagnosis: '活动时段集中在工作日，宣传触达不足，套餐吸引力有限',
    strategy: '活动时段前移 + 社媒精准投放 + 套餐梯度设计',
    actions: '重新规划活动档期 → 社媒内容制作 → 套餐重组',
    results: { primary: '客流提升 +31%', secondary: '活动ROI+45%', tertiary: '复购率+8%' },
    condition: '餐饮品类 / 节假日活动 / ROI低于1.5',
    aiUsed: 3, lastUsed: '2025-04-18', similarity: 65,
    successRate: 71, sampleSize: 12,
    sourceWorkspace: false,
  },
];

const failCases = [
  {
    id: '#2024-F02', title: '快时尚品牌续约谈判失败',
    category: '续约危机干预', tags: ['零售·快时尚', '续约失败', '复盘'],
    problem: '租约到期前30天介入，干预过晚，商户已决定撤场',
    lesson: '续约干预窗口期应在租约到期前120天以上启动，晚于90天成功率急剧下降',
    impact: '失去该商户，当月坪效损失约12万，需补位招商',
    keyLearning: '提前监控租约剩余时间，对60-120天范围内的商户优先介入',
  },
];

const templates = [
  {
    id: 'T-001', title: '续约危机干预标准流程',
    trigger: '租约剩余<120天 且 坪效下滑>15%',
    steps: ['风险诊断师自动扫描', '经营顾问约谈', '输出干预方案', '运营审批', '执行跟踪'],
    refCases: ['#2024-087', '#2024-088', '#2023-191'],
    successRate: 83, samples: 24,
    color: '#ef4444',
  },
  {
    id: 'T-002', title: '经营下滑帮扶流程',
    trigger: '营业额连续2月环比下滑>10%',
    steps: ['根因诊断', '帮扶方案制定', '运营辅导', '效果跟踪', '经验沉淀'],
    refCases: ['#2024-063', '#2024-044'],
    successRate: 76, samples: 31,
    color: '#f59e0b',
  },
  {
    id: 'T-003', title: '新商开业辅导流程',
    trigger: '入驻30天内坪效低于基准65%',
    steps: ['现场巡检', '问题诊断', '陈列/导购优化', '运营指导', '月度复盘'],
    refCases: ['#2025-003', '#2024-099'],
    successRate: 88, samples: 15,
    color: '#0ea5e9',
  },
];

const aiUsageLog = [
  { time: '今日 09:28', caseId: '#2024-088', decisionId: '#D-D001', merchant: '望潮港火锅', similarity: 91, result: '本次会商新生成案例，直接引用为执行基准' },
  { time: '今日 09:28', caseId: '#2024-087', decisionId: '#D-D001', merchant: '望潮港火锅', similarity: 87, result: '推荐方案A·套餐优化（最终采用方案B升级版）' },
  { time: '2025-04-21', caseId: '#2024-063', decisionId: '#D-D002', merchant: '辛香汇',     similarity: 72, result: '推荐陈列优化方案' },
  { time: '2025-04-18', caseId: '#2025-012', decisionId: '#D-D004', merchant: 'B区活动',   similarity: 65, result: '活动时段前移建议' },
  { time: '2025-04-15', caseId: '#2024-087', decisionId: '#D-D005', merchant: '某火锅品牌', similarity: 81, result: '推荐套餐优化，已续约' },
];

/* ─── Cross-case Insights ────────────────────────────────────────── */
const CROSS_CASE_INSIGHTS = [
  {
    pattern: '双修并进策略成功率显著高于单一干预',
    evidence: '经营+体验联合干预的续约成功率 82%，远高于单一经营干预 61%',
    cases: ['#2024-087', '#2024-088'],
    color: '#0ea5e9',
  },
  {
    pattern: '2周领先指标能有效预测续约结果',
    evidence: '人均消费+高毛利占比两项指标同步改善时，续约率提升至91%',
    cases: ['#2024-087'],
    color: '#22c55e',
  },
  {
    pattern: '91-120天窗口是干预最佳时机',
    evidence: '在此窗口介入的成功率83%；超过120天或低于60天均显著下降',
    cases: ['#2024-F02', '#2024-087', '#2024-088'],
    color: '#f59e0b',
  },
];

const tabConfig = [
  { id: 'success',  label: '成功案例库', icon: CheckCircle2,  color: '#22c55e', count: successCases.length },
  { id: 'fail',     label: '失败复盘库', icon: XCircle,       color: '#ef4444', count: failCases.length },
  { id: 'template', label: '策略模板库', icon: LayoutTemplate, color: '#8b5cf6', count: templates.length },
  { id: 'ailog',    label: 'AI 调用记录', icon: Activity,     color: '#06b6d4', count: aiUsageLog.length },
];

/* ─── Case Detail Panel ──────────────────────────────────────────── */
function CaseDetail({ c, onClose }: { c: typeof successCases[0]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end"
      style={{ background: 'rgba(7,13,30,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}>
      <div className="w-full max-w-lg h-full overflow-y-auto p-6 space-y-5"
        style={{ background: '#0c1525', borderLeft: '1px solid rgba(148,163,184,0.1)' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-sky-400">{c.id}</span>
              {c.isNew && (
                <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide"
                  style={{ background: 'rgba(14,165,233,0.2)', color: '#38bdf8', border: '1px solid rgba(14,165,233,0.3)' }}>
                  NEW
                </span>
              )}
              <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80' }}>
                {c.category}
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-100">{c.title}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 transition-all">
            <X size={14} />
          </button>
        </div>

        {/* Source workspace badge */}
        {c.sourceWorkspace && (
          <div className="flex items-center gap-2 p-3 rounded-xl"
            style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}>
            <Brain size={13} style={{ color: '#a78bfa' }} />
            <span className="text-xs text-slate-400">
              本案例由
              <Link href="/workspace" className="text-violet-400 font-medium mx-1 hover:underline">AI会商工作台</Link>
              自动沉淀，来源决策 <span className="text-sky-400">#D-D001</span>
            </span>
          </div>
        )}

        {/* AI Usage badge */}
        <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)' }}>
          <Cpu size={13} style={{ color: '#06b6d4' }} />
          <span className="text-xs text-slate-400">
            此案例已被 AI 调用 <span className="text-cyan-400 font-bold">{c.aiUsed} 次</span>，
            最近引用：<span className="text-cyan-400">{c.lastUsed}</span>
            {c.similarity && <> · 相似度 <span className="text-cyan-400 font-bold">{c.similarity}%</span></>}
          </span>
        </div>

        {/* 8-field structure */}
        {[
          { label: '商户画像', content: `${c.merchant.type} · ${c.merchant.area} · ${c.merchant.size} · ${c.merchant.risk}` },
          { label: '问题定义', content: c.problem },
          { label: '根因诊断', content: c.diagnosis },
          { label: '采用策略', content: c.strategy },
          { label: '执行动作', content: c.actions },
          { label: '适用条件', content: c.condition },
        ].map(field => (
          <div key={field.label} className="rounded-xl p-4" style={{ background: '#0f1a2e', border: '1px solid rgba(148,163,184,0.07)' }}>
            <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-1.5">{field.label}</p>
            <p className="text-xs text-slate-300 leading-relaxed">{field.content}</p>
          </div>
        ))}

        {/* Result metrics */}
        <div className="rounded-xl p-4" style={{ background: '#0f1a2e', border: '1px solid rgba(148,163,184,0.07)' }}>
          <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-2.5">结果指标</p>
          <div className="flex flex-wrap gap-2">
            {[c.results.primary, c.results.secondary, c.results.tertiary].filter(Boolean).map(r => (
              <span key={r} className="text-xs px-2.5 py-1 rounded-lg font-medium" style={{ background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)' }}>
                ✓ {r}
              </span>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-4 text-[11px] text-slate-500">
            {c.successRate !== null
              ? <><span>成功率 <span className="text-emerald-400 font-bold">{c.successRate}%</span></span>
                  <span>样本量 <span className="text-slate-300">{c.sampleSize} 例</span></span></>
              : <span className="text-amber-400">执行中 · 数据积累中</span>
            }
          </div>
        </div>

        {/* AI usage history */}
        <div className="rounded-xl p-4" style={{ background: '#0f1a2e', border: '1px solid rgba(148,163,184,0.07)' }}>
          <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-2.5">AI 调用记录</p>
          <div className="space-y-2">
            {aiUsageLog.filter(log => log.caseId === c.id).map((log, i) => (
              <div key={i} className="flex items-center gap-2 py-1.5 border-b last:border-0" style={{ borderColor: 'rgba(148,163,184,0.06)' }}>
                <Cpu size={10} style={{ color: '#06b6d4' }} />
                <span className="text-[10px] text-slate-500">{log.time}</span>
                <span className="text-[10px] text-slate-300 flex-1">{log.merchant}</span>
                <span className="text-[10px] text-cyan-500">相似度{log.similarity}%</span>
                <Link href="/v2/decision" className="text-[10px] text-sky-400 flex items-center gap-0.5">
                  {log.decisionId} <ExternalLink size={8} />
                </Link>
              </div>
            ))}
            {aiUsageLog.filter(log => log.caseId === c.id).length === 0 && (
              <p className="text-xs text-slate-600">暂无调用记录</p>
            )}
          </div>
        </div>

        <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-white"
          style={{ background: 'linear-gradient(135deg,#0ea5e9,#2563eb)' }}>
          <Brain size={14} /> 以此案例为基础发起决策
        </button>
      </div>
    </div>
  );
}

/* ─── Cross-case Insights Panel ─────────────────────────────────── */
function CrossCaseInsights() {
  return (
    <div className="mb-6 rounded-2xl overflow-hidden" style={{ background: '#0c1525', border: '1px solid rgba(139,92,246,0.2)' }}>
      <div className="flex items-center gap-2 px-5 py-3"
        style={{ background: 'rgba(139,92,246,0.07)', borderBottom: '1px solid rgba(139,92,246,0.12)' }}>
        <Lightbulb size={13} style={{ color: '#a78bfa' }} />
        <span className="text-xs font-semibold text-violet-300">AI 跨案例洞察</span>
        <span className="ml-auto text-[10px] text-slate-500">基于 {successCases.length} 个成功案例 · 自动归纳</span>
      </div>
      <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {CROSS_CASE_INSIGHTS.map((ins, i) => (
          <div key={i} className="rounded-xl p-4" style={{ background: '#0f1a2e', border: `1px solid ${ins.color}15` }}>
            <div className="flex items-start gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: ins.color }} />
              <p className="text-xs font-semibold text-slate-200 leading-snug">{ins.pattern}</p>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed mb-3">{ins.evidence}</p>
            <div className="flex flex-wrap gap-1">
              {ins.cases.map(c => (
                <span key={c} className="text-[10px] px-1.5 py-0.5 rounded font-mono"
                  style={{ background: `${ins.color}10`, color: ins.color }}>{c}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────── */
export default function MemoryPage() {
  const [activeTab, setActiveTab] = useState('success');
  const [selectedCase, setSelectedCase] = useState<typeof successCases[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen" style={{ background: '#070d1e' }}>

      {/* ── Header ── */}
      <div className="px-6 pt-6 pb-5" style={{ borderBottom: '1px solid rgba(148,163,184,0.07)' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <BookMarked size={18} className="text-sky-400" /> 组织记忆中心
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">AI 可调用的活态经验知识库 · 每次执行自动沉淀</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Sparkles size={11} className="text-sky-400" />
              <span>AI 本月已调用 <span className="text-sky-400 font-medium">24</span> 次</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1">
          {tabConfig.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: activeTab === tab.id ? `${tab.color}10` : 'transparent',
                  border: activeTab === tab.id ? `1px solid ${tab.color}25` : '1px solid transparent',
                  color: activeTab === tab.id ? tab.color : '#64748b',
                }}>
                <Icon size={11} />
                {tab.label}
                <span className="px-1.5 py-0.5 rounded-full text-[9px]"
                  style={{ background: activeTab === tab.id ? `${tab.color}20` : 'rgba(148,163,184,0.08)', color: activeTab === tab.id ? tab.color : '#475569' }}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="p-6">

        {/* Search bar */}
        {activeTab !== 'ailog' && (
          <div className="flex items-center gap-3 mb-5">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl flex-1"
              style={{ background: '#0c1525', border: '1px solid rgba(148,163,184,0.08)' }}>
              <Search size={13} className="text-slate-500" />
              <input
                className="flex-1 bg-transparent text-xs text-slate-300 outline-none placeholder:text-slate-600"
                placeholder="搜索案例、商户类型、策略关键词..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* ── Success Cases ── */}
        {activeTab === 'success' && (
          <>
            {/* Cross-case insights */}
            <CrossCaseInsights />

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {successCases
                .filter(c => !searchQuery || c.title.includes(searchQuery) || c.tags.some(t => t.includes(searchQuery)))
                .map(c => (
                  <button key={c.id}
                    onClick={() => setSelectedCase(c)}
                    className="text-left rounded-2xl p-5 transition-all group"
                    style={{
                      background: '#0c1525',
                      border: c.isNew ? '1px solid rgba(14,165,233,0.25)' : '1px solid rgba(148,163,184,0.08)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.border = '1px solid rgba(14,165,233,0.2)')}
                    onMouseLeave={e => (e.currentTarget.style.border = c.isNew ? '1px solid rgba(14,165,233,0.25)' : '1px solid rgba(148,163,184,0.08)')}>

                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-mono text-sky-400">{c.id}</span>
                        {c.isNew && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide"
                            style={{ background: 'rgba(14,165,233,0.2)', color: '#38bdf8', border: '1px solid rgba(14,165,233,0.3)' }}>
                            NEW
                          </span>
                        )}
                        {c.aiUsed >= 5 && !c.isNew && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold"
                            style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.25)' }}>
                            🔥 高频引用
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-cyan-500 flex-shrink-0">
                        <Cpu size={9} /> 引用{c.aiUsed}次
                      </div>
                    </div>

                    <h3 className="text-sm font-semibold text-slate-200 mb-1.5 leading-snug">{c.title}</h3>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {c.tags.filter(t => t !== '最新沉淀').map(t => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 rounded"
                          style={{ background: 'rgba(148,163,184,0.07)', color: '#94a3b8' }}>{t}</span>
                      ))}
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-2 mb-3 leading-relaxed">{c.problem}</p>

                    <div className="flex items-center justify-between pt-3"
                      style={{ borderTop: '1px solid rgba(148,163,184,0.07)' }}>
                      <div className="flex items-center gap-3 text-[11px]">
                        <span className="text-emerald-400 font-medium">{c.results.primary}</span>
                        {c.successRate !== null
                          ? <span className="text-slate-600">成功率 {c.successRate}%</span>
                          : <span className="text-amber-500">执行中</span>
                        }
                      </div>
                      <ChevronRight size={13} className="text-slate-600 group-hover:text-sky-400 transition-colors" />
                    </div>
                  </button>
                ))}
            </div>
          </>
        )}

        {/* ── Fail Cases ── */}
        {activeTab === 'fail' && (
          <div className="space-y-4">
            {failCases.map(c => (
              <div key={c.id} className="rounded-2xl p-5"
                style={{ background: '#0c1525', border: '1px solid rgba(239,68,68,0.15)', borderLeft: '4px solid #ef4444' }}>
                <div className="flex items-start gap-4">
                  <XCircle size={18} className="text-rose-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[11px] font-mono text-rose-400">{c.id}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(239,68,68,0.1)', color: '#fca5a5' }}>
                        {c.category}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-200 mb-2">{c.title}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {[
                        { label: '失败原因', content: c.problem, color: '#ef4444' },
                        { label: '关键教训', content: c.lesson, color: '#f59e0b' },
                        { label: '改进方向', content: c.keyLearning, color: '#0ea5e9' },
                      ].map(f => (
                        <div key={f.label} className="rounded-xl p-3"
                          style={{ background: `${f.color}06`, border: `1px solid ${f.color}15` }}>
                          <p className="text-[10px] font-semibold mb-1" style={{ color: f.color }}>{f.label}</p>
                          <p className="text-[11px] text-slate-400 leading-relaxed">{f.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Strategy Templates ── */}
        {activeTab === 'template' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {templates.map(t => (
              <div key={t.id} className="rounded-2xl p-5"
                style={{ background: '#0c1525', border: `1px solid ${t.color}20` }}>
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${t.color}15` }}>
                    <LayoutTemplate size={15} style={{ color: t.color }} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200">{t.title}</h3>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">触发条件：{t.trigger}</p>
                  </div>
                </div>

                {/* Steps */}
                <div className="space-y-2 mb-4">
                  {t.steps.map((step, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                        style={{ background: `${t.color}15`, color: t.color }}>
                        {i + 1}
                      </div>
                      <span className="text-[11px] text-slate-400">{step}</span>
                    </div>
                  ))}
                </div>

                {/* Metrics */}
                <div className="flex items-center gap-3 py-3"
                  style={{ borderTop: '1px solid rgba(148,163,184,0.07)', borderBottom: '1px solid rgba(148,163,184,0.07)' }}>
                  <div>
                    <p className="text-[10px] text-slate-500">成功率</p>
                    <p className="text-sm font-bold" style={{ color: t.color }}>{t.successRate}%</p>
                  </div>
                  <div className="w-px h-8 bg-slate-800" />
                  <div>
                    <p className="text-[10px] text-slate-500">样本量</p>
                    <p className="text-sm font-bold text-slate-300">{t.samples}例</p>
                  </div>
                  <div className="flex-1 text-right">
                    <p className="text-[10px] text-slate-500">参考案例</p>
                    <div className="flex justify-end gap-1 flex-wrap mt-0.5">
                      {t.refCases.slice(0, 2).map(r => (
                        <span key={r} className="text-[10px] text-sky-400">{r}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <button className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium"
                  style={{ background: `${t.color}10`, color: t.color, border: `1px solid ${t.color}20` }}>
                  <Brain size={11} /> AI 使用此模板
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── AI Usage Log ── */}
        {activeTab === 'ailog' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4 p-4 rounded-xl"
              style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)' }}>
              <Cpu size={14} style={{ color: '#06b6d4' }} />
              <p className="text-xs text-slate-400">
                展示 AI 每次引用历史案例的完整记录，让组织记忆的使用全程透明可追溯。
              </p>
            </div>
            {aiUsageLog.map((log, i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl"
                style={{
                  background: '#0c1525',
                  border: i === 0 ? '1px solid rgba(14,165,233,0.2)' : '1px solid rgba(148,163,184,0.07)',
                }}>
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(6,182,212,0.12)' }}>
                    <Cpu size={14} style={{ color: '#06b6d4' }} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-slate-300">{log.merchant}</span>
                    <span className="text-[10px] text-slate-500">{log.time}</span>
                    {i === 0 && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded font-bold"
                        style={{ background: 'rgba(14,165,233,0.15)', color: '#38bdf8' }}>最新</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    引用案例 <span className="text-cyan-400">{log.caseId}</span>（相似度{log.similarity}%）→ {log.result}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-[11px] px-2 py-1 rounded"
                    style={{ background: 'rgba(14,165,233,0.1)', color: '#38bdf8' }}>
                    {log.similarity}% 匹配
                  </span>
                  <Link href="/v2/decision"
                    className="flex items-center gap-1 text-[10px] text-sky-400 hover:underline">
                    {log.decisionId} <ExternalLink size={9} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Case Detail Drawer ── */}
      {selectedCase && (
        <CaseDetail c={selectedCase} onClose={() => setSelectedCase(null)} />
      )}
    </div>
  );
}
