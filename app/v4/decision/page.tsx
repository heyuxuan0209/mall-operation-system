'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  AlertTriangle, ChevronRight, Brain, CheckCircle2, Clock, Loader2,
  Sparkles, ArrowRight, TrendingDown, FileText, Zap, BookOpen,
  CircleDot, User, BarChart3, ThumbsUp, Play, ArrowLeft,
} from 'lucide-react';

/* ─── Types ─────────────────────────────────────────────────────── */
type AgentStatus = 'pending' | 'running' | 'done';

/* ─── Mock Data ─────────────────────────────────────────────────── */
const problemCategories = [
  { id: 'renewal', label: '续约风险', icon: '🔴', count: 3, color: '#ef4444' },
  { id: 'decline', label: '经营下滑', icon: '🟠', count: 7, color: '#f97316' },
  { id: 'activity', label: '活动复盘', icon: '🟡', count: 2, color: '#f59e0b' },
  { id: 'newbie',  label: '新商辅导', icon: '🔵', count: 4, color: '#0ea5e9' },
  { id: 'done',    label: '已决策',   icon: '⚪', count: 12, color: '#475569' },
];

const problems = [
  {
    id: 'D001', cat: 'renewal',
    merchant: '望潮港火锅', area: 'B2-08', risk: 'high',
    title: '续约风险升级', triggered: '今日 09:23 · AI 自动感知',
    tags: ['续约', '坪效'],
  },
  {
    id: 'D002', cat: 'renewal',
    merchant: '辛香汇',  area: 'B3-12', risk: 'high',
    title: '经营下滑引发续约隐患', triggered: '昨日 16:40',
    tags: ['续约', '营收'],
  },
  {
    id: 'D003', cat: 'decline',
    merchant: '屈臣氏',  area: 'L1-22', risk: 'medium',
    title: '客诉异常上升', triggered: '今日 08:15',
    tags: ['客诉'],
  },
];

const agentDefs = [
  { id: 'risk',      name: '风险诊断师',   role: '数据异动扫描 · 风险识别', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  { id: 'advisor',   name: '商户经营顾问', role: '根因诊断 · 干预建议',   color: '#0ea5e9', bg: 'rgba(14,165,233,0.12)' },
  { id: 'campaign',  name: '活动策略师',   role: '方案生成 · 效果预测',   color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  { id: 'memory',    name: '案例记忆官',   role: '历史案例检索 · 相似匹配', color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
];

const agentFindings: Record<string, string> = {
  risk: '坪效下滑主因为人均消费降低（−12%），而非客流减少，属经营结构问题。租约剩余91天，处于干预关键窗口期。',
  advisor: '菜单套餐结构老化，性价比不足是核心原因。参考3个相似商户案例，套餐优化均有效果（平均坪效回升+16%）。',
  campaign: '方案A（套餐优化）执行周期4周，可在续约前完成数据改善；方案B（联名活动）见效快但收益不稳定。',
  memory: '检索到历史案例 #2024-087，同类型火锅续约危机，套餐优化成功率83%，相似度87%，强烈推荐参考。',
};

const agentTimeline = [
  { time: '09:23', agent: '风险诊断师',   color: '#ef4444', event: '自动触发，启动数据扫描' },
  { time: '09:25', agent: '案例记忆官',   color: '#06b6d4', event: '检索历史案例，找到 #2024-087（相似度87%）' },
  { time: '09:26', agent: '商户经营顾问', color: '#0ea5e9', event: '接收诊断报告，启动根因分析' },
  { time: '09:28', agent: '风险诊断师',   color: '#ef4444', event: '完成，输出报告，移交经营顾问' },
  { time: '09:31', agent: '活动策略师',   color: '#f59e0b', event: '接收顾问输出，生成方案A/B' },
  { time: '09:35', agent: '商户经营顾问', color: '#0ea5e9', event: '完成根因报告，协同策略师' },
  { time: '09:40', agent: '活动策略师',   color: '#f59e0b', event: '完成，输出方案对比，等待决策' },
];

const solutions = [
  {
    id: 'A', title: '套餐结构优化', recommended: true,
    desc: '重组套酒水+主食套餐，引入差异化口味，提升性价比定位',
    metrics: [
      { label: '预期坪效回升', value: '+18%', positive: true },
      { label: '执行周期', value: '4周', positive: true },
      { label: '风险等级', value: '中', positive: true },
      { label: '推荐信心', value: '89%', positive: true },
    ],
    steps: ['第1周：竞品分析+菜单重设计', '第2-3周：试运营+客户反馈', '第4周：全面推行+复盘'],
    risk: '执行期间可能有短期营业额波动（预计−5% 以内）',
    basis: '参考案例 #2024-087，同类成功率83%',
  },
  {
    id: 'B', title: '引入联名活动', recommended: false,
    desc: '与周边品牌联名举办限时主题活动，快速拉动客流',
    metrics: [
      { label: '预期客流增长', value: '+25%', positive: true },
      { label: '执行周期', value: '2周', positive: true },
      { label: '风险等级', value: '高', positive: false },
      { label: '推荐信心', value: '62%', positive: false },
    ],
    steps: ['第1周：联系品牌方+策划', '第2周：活动执行+推广'],
    risk: '活动结束后效果难以持续，未解决根本经营问题',
    basis: '2024年B区同类活动参照',
  },
];

const refCase = {
  id: '#2024-087', title: '某火锅品牌续约危机干预',
  similarity: 87, result: '坪效回升+18%，成功续约',
  tags: ['正餐·火锅', '续约危机', '套餐优化'],
};

/* ─── Sub-components ────────────────────────────────────────────── */

function AgentCard({ def, status, finding }: {
  def: typeof agentDefs[0];
  status: AgentStatus;
  finding?: string;
}) {
  return (
    <div className="rounded-xl p-3.5 transition-all"
      style={{
        background: status === 'done' ? `${def.color}0a` : status === 'running' ? `${def.color}12` : '#0c1525',
        border: `1px solid ${status !== 'pending' ? `${def.color}25` : 'rgba(148,163,184,0.08)'}`,
      }}>
      <div className="flex items-start gap-3">
        {/* Status icon */}
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: def.bg }}>
          {status === 'done' && <CheckCircle2 size={14} style={{ color: def.color }} />}
          {status === 'running' && <Loader2 size={14} style={{ color: def.color }} className="animate-spin" />}
          {status === 'pending' && <CircleDot size={14} style={{ color: '#475569' }} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <span className="text-xs font-semibold" style={{ color: status !== 'pending' ? def.color : '#64748b' }}>
              {def.name}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded"
              style={{
                background: status === 'done' ? `${def.color}15` : status === 'running' ? `${def.color}10` : 'rgba(148,163,184,0.06)',
                color: status === 'done' ? def.color : status === 'running' ? def.color : '#475569',
              }}>
              {status === 'done' ? '已完成' : status === 'running' ? '分析中...' : '待启动'}
            </span>
          </div>
          <p className="text-[10px] text-slate-600 mb-1.5">{def.role}</p>
          {status === 'running' && (
            <div className="flex items-center gap-1.5">
              <div className="flex gap-0.5">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-1 h-1 rounded-full animate-bounce" style={{ background: def.color, animationDelay: `${i * 0.15}s`, opacity: 0.7 }} />
                ))}
              </div>
              <span className="text-[10px]" style={{ color: def.color }}>正在分析...</span>
            </div>
          )}
          {status === 'done' && finding && (
            <p className="text-[11px] text-slate-400 leading-relaxed border-t pt-2 mt-1"
              style={{ borderColor: 'rgba(148,163,184,0.08)' }}>
              {finding}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────────── */
export default function DecisionPage() {
  const [selectedProblem, setSelectedProblem] = useState(problems[0]);
  const [activeCat, setActiveCat] = useState('renewal');
  const [agentStates, setAgentStates] = useState<Record<string, AgentStatus>>({
    risk: 'done', advisor: 'done', campaign: 'done', memory: 'done',
  });
  const [selectedSolution, setSelectedSolution] = useState<string | null>(null);
  const [launched, setLaunched] = useState(false);
  const [step, setStep] = useState(5); // 1-5 showing all sections

  // Reset & animate agents when problem changes
  const handleProblemSelect = (p: typeof problems[0]) => {
    setSelectedProblem(p);
    setSelectedSolution(null);
    setLaunched(false);
    setStep(1);
    setAgentStates({ risk: 'running', advisor: 'pending', campaign: 'pending', memory: 'running' });

    setTimeout(() => setAgentStates(s => ({ ...s, risk: 'done', memory: 'done' })), 1800);
    setTimeout(() => { setAgentStates(s => ({ ...s, advisor: 'running' })); setStep(2); }, 2000);
    setTimeout(() => { setAgentStates(s => ({ ...s, advisor: 'done', campaign: 'running' })); setStep(3); }, 3800);
    setTimeout(() => { setAgentStates(s => ({ ...s, campaign: 'done' })); setStep(4); }, 5400);
    setTimeout(() => setStep(5), 5600);
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#070d1e' }}>

      {/* ── Left: Problem Board ── */}
      <div className="hidden lg:flex w-64 flex-col border-r flex-shrink-0"
        style={{ background: '#08101f', borderColor: 'rgba(148,163,184,0.07)' }}>

        <div className="p-4 border-b" style={{ borderColor: 'rgba(148,163,184,0.07)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Brain size={14} className="text-sky-400" />
            <h2 className="text-sm font-semibold text-slate-200">决策问题看板</h2>
          </div>
          {/* Category filter */}
          <div className="space-y-0.5">
            {problemCategories.map(cat => (
              <button key={cat.id}
                onClick={() => setActiveCat(cat.id)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all"
                style={{
                  background: activeCat === cat.id ? `${cat.color}12` : 'transparent',
                  border: activeCat === cat.id ? `1px solid ${cat.color}25` : '1px solid transparent',
                  color: activeCat === cat.id ? cat.color : '#64748b',
                }}>
                <span className="flex items-center gap-2">
                  <span>{cat.icon}</span> {cat.label}
                </span>
                <span className="w-5 h-5 rounded-full text-[10px] flex items-center justify-center"
                  style={{ background: activeCat === cat.id ? `${cat.color}20` : 'rgba(148,163,184,0.06)', color: activeCat === cat.id ? cat.color : '#475569' }}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Problem list */}
        <div className="flex-1 p-3 space-y-2 overflow-y-auto">
          {problems.filter(p => p.cat === activeCat || activeCat === 'done').map(p => (
            <button key={p.id}
              onClick={() => handleProblemSelect(p)}
              className="w-full text-left rounded-xl p-3 transition-all"
              style={{
                background: selectedProblem.id === p.id ? 'rgba(14,165,233,0.1)' : '#0c1525',
                border: selectedProblem.id === p.id ? '1px solid rgba(14,165,233,0.25)' : '1px solid rgba(148,163,184,0.07)',
              }}>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[10px] text-slate-500">{p.id}</span>
                {p.risk === 'high' && <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
              </div>
              <p className="text-xs font-medium text-slate-300 mb-0.5">{p.merchant}</p>
              <p className="text-[11px] text-slate-500">{p.title}</p>
              <div className="flex gap-1 mt-1.5">
                {p.tags.map(t => (
                  <span key={t} className="text-[9px] px-1.5 py-0.5 rounded"
                    style={{ background: 'rgba(14,165,233,0.1)', color: '#38bdf8' }}>{t}</span>
                ))}
              </div>
            </button>
          ))}
          {problems.filter(p => p.cat === activeCat).length === 0 && (
            <p className="text-xs text-slate-600 text-center py-6">暂无此类问题</p>
          )}
        </div>
      </div>

      {/* ── Center: Decision Room ── */}
      <div className="flex-1 min-w-0 overflow-y-auto p-5 lg:p-6 space-y-4">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/v4" className="hover:text-slate-300 transition-colors">经营驾驶舱</Link>
          <ChevronRight size={11} />
          <span className="text-slate-300">AI 决策工作台</span>
          <ChevronRight size={11} />
          <span style={{ color: '#38bdf8' }}>{selectedProblem.merchant}</span>
        </div>

        {/* ① Problem Definition */}
        <div className="rounded-2xl p-5"
          style={{ background: '#0c1525', border: '1px solid rgba(239,68,68,0.2)', borderLeft: '4px solid #ef4444' }}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={14} className="text-rose-400" />
                <span className="text-[11px] text-rose-400 font-medium">高风险问题 · 需立即决策</span>
                <span className="text-[10px] text-slate-500">触发：{selectedProblem.triggered}</span>
              </div>
              <h1 className="text-lg font-bold text-slate-100 mb-1">
                {selectedProblem.merchant} · {selectedProblem.title}
              </h1>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1"><FileText size={11} />{selectedProblem.area}</span>
                <span className="flex items-center gap-1"><Clock size={11} />干预窗口剩余约 45 天</span>
                <span className="flex items-center gap-1"><TrendingDown size={11} />坪效下滑 22%</span>
              </div>
            </div>
            <div className="flex-shrink-0 text-right">
              <div className="text-[11px] text-slate-500 mb-1">AI 决策编号</div>
              <div className="text-xs font-mono text-sky-400">#D-{selectedProblem.id}</div>
            </div>
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4" style={{ borderTop: '1px solid rgba(148,163,184,0.07)' }}>
            {[
              { label: '月均坪效', value: '¥4,280', change: '−22%', bad: true },
              { label: '租约剩余', value: '91天', change: '高风险区间', bad: true },
              { label: '月度投诉', value: '18条', change: '+35%', bad: true },
            ].map(m => (
              <div key={m.label} className="rounded-xl p-3" style={{ background: 'rgba(239,68,68,0.06)' }}>
                <p className="text-[10px] text-slate-500 mb-1">{m.label}</p>
                <p className="text-sm font-bold text-slate-200">{m.value}</p>
                <p className="text-[11px] text-rose-400">{m.change}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ② Multi-Agent Collaboration */}
        <div className="rounded-2xl p-5" style={{ background: '#0c1525', border: '1px solid rgba(148,163,184,0.08)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={14} className="text-sky-400" />
            <h2 className="text-sm font-semibold text-slate-200">AI 经营班子协同研判</h2>
            {step < 5 && (
              <div className="flex items-center gap-1.5 ml-auto">
                <Loader2 size={12} className="text-sky-400 animate-spin" />
                <span className="text-[11px] text-sky-400">分析进行中...</span>
              </div>
            )}
            {step === 5 && (
              <div className="flex items-center gap-1.5 ml-auto">
                <CheckCircle2 size={12} className="text-emerald-400" />
                <span className="text-[11px] text-emerald-400">分析完成</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {agentDefs.map(def => (
              <AgentCard
                key={def.id}
                def={def}
                status={agentStates[def.id] ?? 'pending'}
                finding={agentFindings[def.id]}
              />
            ))}
          </div>
        </div>

        {/* ③ Solution Comparison */}
        {step >= 3 && (
          <div className="rounded-2xl p-5" style={{ background: '#0c1525', border: '1px solid rgba(148,163,184,0.08)' }}>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={14} className="text-sky-400" />
              <h2 className="text-sm font-semibold text-slate-200">方案对比</h2>
              <span className="text-[10px] text-slate-500 ml-auto">AI 生成 · 基于历史案例推演</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {solutions.map(sol => (
                <button key={sol.id}
                  onClick={() => setSelectedSolution(sol.id)}
                  className="text-left rounded-xl p-4 transition-all relative overflow-hidden"
                  style={{
                    background: selectedSolution === sol.id
                      ? sol.recommended ? 'rgba(14,165,233,0.08)' : 'rgba(239,68,68,0.05)'
                      : '#0f1a2e',
                    border: selectedSolution === sol.id
                      ? sol.recommended ? '1.5px solid rgba(14,165,233,0.35)' : '1.5px solid rgba(239,68,68,0.3)'
                      : '1px solid rgba(148,163,184,0.1)',
                  }}>
                  {sol.recommended && (
                    <div className="absolute top-0 right-0">
                      <div className="flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded-bl-lg"
                        style={{ background: 'rgba(14,165,233,0.2)', color: '#38bdf8' }}>
                        <ThumbsUp size={9} /> AI 推荐
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0"
                      style={{ background: sol.recommended ? 'rgba(14,165,233,0.15)' : 'rgba(239,68,68,0.1)', color: sol.recommended ? '#38bdf8' : '#f87171' }}>
                      {sol.id}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">{sol.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{sol.desc}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {sol.metrics.map(m => (
                      <div key={m.label} className="rounded-lg px-2.5 py-2"
                        style={{ background: 'rgba(148,163,184,0.04)', border: '1px solid rgba(148,163,184,0.07)' }}>
                        <p className="text-[10px] text-slate-600 mb-0.5">{m.label}</p>
                        <p className="text-xs font-bold" style={{ color: m.positive ? '#22c55e' : '#f87171' }}>{m.value}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-600 italic">{sol.risk}</p>
                  <p className="text-[10px] text-sky-500 mt-1 flex items-center gap-1">
                    <BookOpen size={9} /> {sol.basis}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ④ Recommendation Summary */}
        {step >= 4 && (
          <div className="rounded-2xl p-5 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(14,165,233,0.07), rgba(37,99,235,0.07))',
              border: '1px solid rgba(14,165,233,0.2)',
            }}>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg,#0ea5e9,#2563eb)', boxShadow: '0 0 16px rgba(14,165,233,0.3)' }}>
                <Sparkles size={18} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-sm font-semibold text-sky-300">AI 推荐方案</h2>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{ background: 'rgba(14,165,233,0.15)', color: '#38bdf8', border: '1px solid rgba(14,165,233,0.25)' }}>
                    推荐信心 89%
                  </span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  推荐采纳<span className="text-sky-400 font-semibold"> 方案A：套餐结构优化</span>。
                  参考历史案例 <span className="text-cyan-400">{refCase.id}</span>（相似度{refCase.similarity}%），
                  同类型火锅续约危机通过套餐优化的成功率为83%，预期坪效回升+18%，
                  可在租约到期前完成数据改善，为续约谈判提供有力支撑。
                  相比方案B，风险更可控，效果更持久。
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <span className="text-emerald-400">预期坪效</span> +18%
                  </div>
                  <div className="w-px h-3 bg-slate-700" />
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <span className="text-sky-400">执行周期</span> 4周
                  </div>
                  <div className="w-px h-3 bg-slate-700" />
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <span className="text-amber-400">风险</span> 中等
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ⑤ Execution Launch */}
        {step >= 5 && (
          <div className="rounded-2xl p-5" style={{ background: '#0c1525', border: '1px solid rgba(148,163,184,0.08)' }}>
            <h2 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
              <Zap size={13} className="text-sky-400" /> 决策收口 · 发起执行
            </h2>
            {launched ? (
              <div className="flex items-center gap-3 p-4 rounded-xl"
                style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-emerald-400">任务已发起</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    已生成 4 项执行任务，任务调度官已自动分配至运营团队。
                    <Link href="/v4/execution" className="text-sky-400 hover:underline ml-1">查看执行中心 →</Link>
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={() => { setSelectedSolution('A'); setLaunched(true); }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: 'linear-gradient(135deg,#0ea5e9,#2563eb)', color: 'white', boxShadow: '0 0 16px rgba(14,165,233,0.25)' }}>
                  <Play size={14} /> 采纳方案A，一键发起任务
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm text-slate-400 transition-all"
                  style={{ background: 'rgba(148,163,184,0.06)', border: '1px solid rgba(148,163,184,0.1)' }}>
                  <FileText size={13} /> 修改方案
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm text-slate-500 transition-all"
                  style={{ background: 'rgba(148,163,184,0.04)', border: '1px solid rgba(148,163,184,0.08)' }}>
                  记录意见
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Right: Agent Panel + Timeline ── */}
      <div className="hidden xl:flex w-72 flex-col border-l flex-shrink-0 overflow-y-auto"
        style={{ background: '#08101f', borderColor: 'rgba(148,163,184,0.07)' }}>

        <div className="p-4 border-b" style={{ borderColor: 'rgba(148,163,184,0.07)' }}>
          <p className="text-xs font-semibold text-slate-400 mb-3 flex items-center gap-2">
            <User size={12} className="text-sky-400" /> 参与 Agent
          </p>
          <div className="space-y-2">
            {agentDefs.map(def => {
              const status = agentStates[def.id] ?? 'pending';
              return (
                <div key={def.id} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg"
                  style={{ background: status !== 'pending' ? `${def.color}08` : 'transparent' }}>
                  <div className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{
                      background: status === 'done' ? def.color : status === 'running' ? def.color : '#334155',
                      boxShadow: status === 'running' ? `0 0 8px ${def.color}` : 'none',
                      animation: status === 'running' ? 'pulse 1s infinite' : 'none',
                    }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: status !== 'pending' ? '#e2e8f0' : '#475569' }}>
                      {def.name}
                    </p>
                    <p className="text-[10px] truncate" style={{ color: status !== 'pending' ? def.color : '#334155' }}>
                      {status === 'done' ? '已完成' : status === 'running' ? '分析中...' : '待命'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Referenced Case */}
        <div className="p-4 border-b" style={{ borderColor: 'rgba(148,163,184,0.07)' }}>
          <p className="text-xs font-semibold text-slate-400 mb-3 flex items-center gap-2">
            <BookOpen size={12} className="text-cyan-400" /> 引用历史案例
          </p>
          <Link href="/v4/memory"
            className="block rounded-xl p-3.5 transition-all"
            style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.18)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-cyan-400">{refCase.id}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                style={{ background: 'rgba(6,182,212,0.15)', color: '#22d3ee' }}>
                相似度 {refCase.similarity}%
              </span>
            </div>
            <p className="text-xs text-slate-300 mb-2">{refCase.title}</p>
            <div className="flex gap-1 flex-wrap mb-2">
              {refCase.tags.map(t => (
                <span key={t} className="text-[9px] px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(6,182,212,0.1)', color: '#67e8f9' }}>{t}</span>
              ))}
            </div>
            <p className="text-[11px] text-emerald-400 font-medium">✓ {refCase.result}</p>
            <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
              查看完整案例 <ArrowRight size={9} />
            </p>
          </Link>
        </div>

        {/* Collaboration Timeline */}
        <div className="p-4 flex-1">
          <p className="text-xs font-semibold text-slate-400 mb-3 flex items-center gap-2">
            <Clock size={12} className="text-slate-500" /> 协作时间线
          </p>
          <div className="space-y-3">
            {agentTimeline.map((item, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full mt-1" style={{ background: item.color }} />
                  {i < agentTimeline.length - 1 && (
                    <div className="w-px flex-1 mt-1" style={{ background: 'rgba(148,163,184,0.1)', minHeight: 12 }} />
                  )}
                </div>
                <div className="flex-1 pb-2 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] font-medium" style={{ color: item.color }}>{item.agent}</span>
                    <span className="text-[10px] text-slate-600">{item.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{item.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
