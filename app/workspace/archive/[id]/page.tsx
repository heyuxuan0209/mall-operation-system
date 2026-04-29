'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft, ArrowRight, CheckCircle2, Clock, AlertTriangle,
  Sparkles, BookOpen, Zap, BarChart3, ListChecks, Brain,
  ChevronRight,
} from 'lucide-react';

/* ════════════════════════════════════════════════════════════
   STATIC ARCHIVE DATA — 望潮港火锅 (id: wangchao)
════════════════════════════════════════════════════════════ */
const WANGCHAO_ARCHIVE = {
  id: 'wangchao',
  merchantName: '望潮港火锅',
  category: '餐饮 · 火锅',
  location: 'B区 · B2-08',
  area: '520㎡',
  riskBadge: '🔴 高危',
  riskColorCls: 'bg-rose-100 text-rose-600 border border-rose-200',
  startedAt: '今日 09:23',
  status: '执行中 · 2周复盘待确认',
  statusCls: 'bg-amber-100 text-amber-700 border border-amber-200',

  metrics: [
    { label: '月均坪效', before: '¥1,680/㎡', after: '—', target: '¥1,820/㎡', warn: true },
    { label: '人均消费', before: '¥121', after: '—', target: '≥¥128', warn: true },
    { label: '差评率', before: '12.1%', after: '—', target: '<5%', warn: true },
    { label: '会员复购率', before: '29%', after: '—', target: '≥38%', warn: true },
    { label: '高毛利单品占比', before: '27%', after: '—', target: '≥35%', warn: true },
  ],

  agents: [
    { name: '风险诊断师', color: '#f43f5e', role: '发现风险 · 主持会商' },
    { name: '商户经营顾问', color: '#3b82f6', role: '证据收集 · 方案设计' },
    { name: '活动策略师', color: '#f59e0b', role: '活动分析' },
    { name: '巡店督导', color: '#16a34a', role: '现场核查' },
    { name: '案例记忆官', color: '#0891b2', role: '案例匹配 · 记忆沉淀' },
    { name: '任务调度官', color: '#7c3aed', role: '方案收敛 · 任务生成' },
    { name: '招商经理', color: '#4f46e5', role: '续约策略' },
  ],

  timeline: [
    { time: '09:23', phase: '发现', event: '风险诊断师触发会商', detail: '检测到5项关键异常：续约91天、坪效↓22%、客诉↑35%、活动转化差', icon: '🔴', done: true },
    { time: '09:29', phase: '证据', event: '商户经营顾问补充数据', detail: '调取6个月经营数据：人均↓12.3%，消费质量恶化，非纯流量问题', icon: '📊', done: true },
    { time: '09:31', phase: '证据', event: '活动策略师分析转化', detail: '过去2次活动带来低质量流量，优惠券高核销但复购率低', icon: '📋', done: true },
    { time: '09:33', phase: '证据', event: '巡店督导补充现场问题', detail: '5项现场短板：动线混乱、导视弱、套餐展示旧、服务慢、门头老化', icon: '🏬', done: true },
    { time: '09:35', phase: '证据', event: '案例记忆官匹配历史案例', detail: 'CASE-2024-087 相似度87%（某火锅续约危机），核心策略可复用', icon: '📚', done: true },
    { time: '09:36', phase: '判断', event: '证据阶段收敛', detail: '核心判断：消费质量恶化 + 现场体验短板双重拖拽，非纯流量问题', icon: '✅', done: true },
    { time: '09:37', phase: '请示', event: '向总经理请示加入招商经理', detail: '风险已超经营Agent判断范围，需续约策略补充', icon: '⚠', done: true },
    { time: '09:38', phase: '请示', event: '总经理批准并追问', detail: '追问：问题偏经营还是招商？30天优先验证什么？', icon: '👤', done: true },
    { time: '09:40', phase: '请示', event: '招商经理加入会商', detail: '补充：商户为"观察"状态，30天经营改善可影响续约评分', icon: '🤝', done: true },
    { time: '09:45', phase: '判断', event: '判断阶段收敛', detail: '定性：双重拖拽；目标：30天内产生可被招商侧认可的改善信号', icon: '🎯', done: true },
    { time: '09:47', phase: '方案', event: '任务调度官提出3个方案', detail: '方案A（经营修复）/ 方案B（修复+体验整改）/ 方案C（活动拉新）', icon: '📐', done: true },
    { time: '09:49', phase: '决策', event: '总经理倾向方案B', detail: '追问：预算只能批一半时优先动作？2周内领先指标是什么？', icon: '🤔', done: true },
    { time: '09:52', phase: '决策', event: '总经理拍板', detail: '方案B推进，先批第一阶段预算，招商侧暂不正式谈续约', icon: '⚡', done: true },
    { time: '09:53', phase: '执行', event: '生成4项执行任务', detail: '套餐优化 / 门头轻改 / 晚高峰整改 / 2周复盘', icon: '✅', done: true },
    { time: '09:55', phase: '沉淀', event: '案例记忆官生成记忆草案', detail: 'CASE-2024-088 《餐饮商户续约风险干预：经营修复+体验整改联合策略》', icon: '💾', done: true },
    { time: '09:56', phase: '沉淀', event: '总经理确认沉淀', detail: '后续遇到"餐饮续约风险+人均下降+现场体验问题"时优先引用', icon: '✅', done: true },
    { time: '2周后', phase: '复盘', event: '领先指标复盘', detail: '人均消费 / 高毛利占比 / 差评率 —— 待确认', icon: '🕐', done: false },
  ],

  tasks: [
    { no: 1, title: '套餐结构优化', owner: '商户经营顾问', deadline: '3天内', output: '新套餐结构建议方案', status: '进行中' },
    { no: 2, title: '店外导视与门头轻改', owner: '巡店督导', deadline: '5天内', output: '整改清单与现场确认图', status: '进行中' },
    { no: 3, title: '晚高峰服务响应整改', owner: '门店店长', deadline: '7天内', output: '服务改进执行记录', status: '待启动' },
    { no: 4, title: '两周复盘', owner: '风险诊断师', deadline: '14天后', output: '人均消费 / 高毛利占比 / 差评率', status: '待启动' },
  ],

  inputCase: { id: 'CASE-2024-087', similarity: '87%', result: '成功续约', desc: '某火锅品牌·续约危机干预' },
  outputCase: { id: 'CASE-2024-088', tags: ['餐饮', '火锅', '续约风险', '体验整改', '套餐优化', '招商协同'] },
};

const PHASE_COLOR: Record<string, string> = {
  '发现': '#f43f5e', '证据': '#3b82f6', '判断': '#8b5cf6', '请示': '#f59e0b',
  '方案': '#f97316', '决策': '#eab308', '执行': '#22c55e', '沉淀': '#0891b2', '复盘': '#64748b',
};

function TaskStatusBadge({ status }: { status: string }) {
  if (status === '进行中') return (
    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 border border-blue-200 font-medium">● 进行中</span>
  );
  if (status === '已完成') return (
    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600 border border-emerald-200 font-medium">✓ 已完成</span>
  );
  return (
    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 font-medium">○ 待启动</span>
  );
}

function NotFound({ id }: { id: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div className="text-center">
        <p className="text-4xl mb-4">🔍</p>
        <h2 className="text-[18px] font-bold text-slate-700 mb-2">档案不存在</h2>
        <p className="text-[13px] text-slate-400 mb-6">未找到 ID 为「{id}」的会商干预档案</p>
        <Link href="/workspace" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-[12px] font-semibold hover:bg-slate-700 transition-colors">
          <Zap size={13} />返回工作台
        </Link>
      </div>
    </div>
  );
}

export default function ArchiveDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : (params.id as string);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_expandedTask, _setExpandedTask] = useState<number | null>(null);

  if (id !== 'wangchao') return <NotFound id={id ?? ''} />;

  const data = WANGCHAO_ARCHIVE;

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* Top bar */}
      <div className="sticky top-0 z-30 flex items-center gap-3 px-5 h-12 bg-white border-b border-slate-200">
        <Link href="/workspace" className="flex items-center gap-1.5 text-[12px] text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft size={13} /><span>工作台</span>
        </Link>
        <ChevronRight size={12} className="text-slate-300" />
        <span className="text-[12px] text-slate-400">干预档案</span>
        <ChevronRight size={12} className="text-slate-300" />
        <span className="text-[12px] font-semibold text-slate-700">{data.merchantName}</span>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-slate-900 flex items-center justify-center">
            <Zap size={12} className="text-white" />
          </div>
          <span className="text-[12px] font-bold text-slate-700">商户智运Agent</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-5 py-6 space-y-6">

        {/* Hero */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 pt-5 pb-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold ${data.riskColorCls}`}>{data.riskBadge}</span>
                  <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold ${data.statusCls}`}>{data.status}</span>
                </div>
                <h1 className="text-[22px] font-bold text-slate-900 mb-1">{data.merchantName}</h1>
                <div className="flex items-center gap-3 text-[12px] text-slate-500 flex-wrap">
                  <span>{data.category}</span>
                  <span className="text-slate-300">·</span>
                  <span>{data.location}</span>
                  <span className="text-slate-300">·</span>
                  <span>建筑面积 {data.area}</span>
                  <span className="text-slate-300">·</span>
                  <span>会商发起 {data.startedAt}</span>
                </div>
              </div>
              <Link href="/workspace" className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold bg-slate-900 text-white hover:bg-slate-700 transition-colors">
                <Zap size={11} />进入会商
              </Link>
            </div>
            {/* Agent pills */}
            <div className="flex flex-wrap gap-1.5 mt-4">
              <span className="text-[10px] text-slate-400 self-center mr-1">参会</span>
              {data.agents.map(ag => (
                <div key={ag.name} className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-50 border border-slate-200">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: ag.color }} />
                  <span className="text-[10px] text-slate-600">{ag.name}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Phase progress */}
          <div className="flex items-center overflow-x-auto border-t border-slate-100">
            {['发现', '证据', '判断', '请示', '方案', '决策', '执行', '沉淀', '复盘'].map(ph => {
              const isDone = ph !== '复盘';
              return (
                <div key={ph} className={`flex-1 py-2.5 text-center flex flex-col items-center gap-0.5 min-w-[60px] ${isDone ? 'bg-slate-50' : 'bg-white'}`}>
                  <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ background: isDone ? (PHASE_COLOR[ph] ?? '#94a3b8') : '#e2e8f0' }}>
                    {isDone && <CheckCircle2 size={9} className="text-white" />}
                  </div>
                  <span className={`text-[9px] font-medium ${isDone ? 'text-slate-600' : 'text-slate-300'}`}>{ph}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Metrics */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100 bg-slate-50">
            <BarChart3 size={13} className="text-blue-500" />
            <span className="text-[12px] font-semibold text-slate-700">干预前指标 · 目标对比</span>
            <span className="ml-auto text-[10px] text-slate-400">会商发起时数据基线</span>
          </div>
          <div className="divide-y divide-slate-50">
            {data.metrics.map(m => (
              <div key={m.label} className="flex items-center gap-4 px-5 py-3">
                <span className="text-[12px] text-slate-500 w-28 flex-shrink-0">{m.label}</span>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-[12px] font-semibold text-slate-700">{m.before}</span>
                  <ArrowRight size={12} className="text-slate-300 flex-shrink-0" />
                  <span className="text-[12px] text-slate-400 italic">{m.after}</span>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="text-[10px] text-slate-400">目标</span>
                  <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">{m.target}</span>
                </div>
                {m.warn && <AlertTriangle size={12} className="text-rose-400 flex-shrink-0" />}
              </div>
            ))}
          </div>
          <div className="px-5 py-2.5 bg-amber-50 border-t border-amber-100">
            <p className="text-[11px] text-amber-700">
              <span className="font-semibold">2周领先指标：</span>人均消费回升 ≥5% + 差评率下降，是招商侧重新评估为「保留」的核心信号
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100 bg-slate-50">
            <Clock size={13} className="text-violet-500" />
            <span className="text-[12px] font-semibold text-slate-700">会商干预时间线</span>
            <span className="text-[10px] text-slate-400 ml-auto">{data.timeline.filter(t => t.done).length}/{data.timeline.length} 步完成</span>
          </div>
          <div className="px-5 py-4">
            <div className="relative">
              <div className="absolute left-[18px] top-0 bottom-0 w-px bg-slate-100" />
              <div className="space-y-4">
                {data.timeline.map((item, i) => {
                  const phaseColor = PHASE_COLOR[item.phase] ?? '#94a3b8';
                  return (
                    <div key={i} className="flex gap-4 items-start relative">
                      <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-sm z-10"
                        style={{ background: item.done ? phaseColor + '18' : '#f8fafc', border: `1.5px solid ${item.done ? phaseColor + '60' : '#e2e8f0'}` }}>
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className="text-[10px] text-slate-400 flex-shrink-0 w-9">{item.time}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold flex-shrink-0"
                            style={{ background: phaseColor + '18', color: phaseColor }}>{item.phase}</span>
                          <span className={`text-[12px] font-semibold ${item.done ? 'text-slate-700' : 'text-slate-400'}`}>{item.event}</span>
                          {!item.done && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600 font-bold">待完成</span>}
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">{item.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Tasks + Cases */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Tasks */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-emerald-50">
              <ListChecks size={13} className="text-emerald-600" />
              <span className="text-[12px] font-semibold text-emerald-700">执行任务（{data.tasks.length}项）</span>
            </div>
            <div className="divide-y divide-slate-50">
              {data.tasks.map(t => (
                <div key={t.no} className="px-4 py-3">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 flex-shrink-0 mt-0.5">{t.no}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-[12px] font-semibold text-slate-700 flex-1 truncate">{t.title}</p>
                        <TaskStatusBadge status={t.status} />
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span>{t.owner}</span><span>·</span><span>{t.deadline}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">产出：{t.output}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cases + Conclusion */}
          <div className="space-y-4">
            {/* Input case */}
            <div className="bg-white rounded-2xl border border-cyan-200 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-cyan-100 bg-cyan-50">
                <BookOpen size={13} className="text-cyan-600" />
                <span className="text-[12px] font-semibold text-cyan-700">引用案例</span>
                <span className="text-[10px] text-cyan-400 ml-auto">{data.inputCase.id}</span>
              </div>
              <div className="px-4 py-3">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-[12px] font-semibold text-slate-700">{data.inputCase.desc}</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex-shrink-0 ml-2">✓ {data.inputCase.result}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400">相似度</span>
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-400 rounded-full" style={{ width: data.inputCase.similarity }} />
                  </div>
                  <span className="text-[11px] font-bold text-cyan-600">{data.inputCase.similarity}</span>
                </div>
              </div>
            </div>

            {/* Output case */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50">
                <Sparkles size={13} className="text-violet-500" />
                <span className="text-[12px] font-semibold text-slate-700">本次归档</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-violet-100 text-violet-600 ml-auto">NEW</span>
              </div>
              <div className="px-4 py-3">
                <p className="text-[11px] font-semibold text-slate-600 mb-2">{data.outputCase.id}</p>
                <p className="text-[11px] text-slate-500 mb-2">《餐饮商户续约风险干预：经营修复 + 体验整改联合策略》</p>
                <div className="flex flex-wrap gap-1.5">
                  {data.outputCase.tags.map(tag => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 border border-violet-200">{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Key conclusion */}
            <div className="bg-slate-900 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Brain size={12} className="text-violet-400" />
                <span className="text-[11px] font-semibold text-slate-300">会商核心结论</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                问题根因：<span className="text-slate-200">消费质量恶化（非客流下降）+ 现场体验短板叠加</span><br />
                干预逻辑：<span className="text-slate-200">套餐优化 + 体验整改 → 30天多维改善信号 → 招商侧重评</span><br />
                关键窗口：<span className="text-amber-300">2周内看领先指标，30天内产生续约筹码</span>
              </p>
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="flex items-center gap-3 flex-wrap pb-8">
          <Link href="/workspace" className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-[12px] font-semibold hover:bg-slate-700 transition-colors">
            <Zap size={13} />进入会商工作台
          </Link>
          <Link href="/v4/execution" className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-[12px] font-semibold hover:bg-white hover:border-slate-300 transition-colors">
            <ListChecks size={13} />查看执行追踪
          </Link>
          <Link href="/v4/memory" className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-[12px] font-semibold hover:bg-white hover:border-slate-300 transition-colors">
            <Sparkles size={13} />查看组织记忆
          </Link>
        </div>
      </div>
    </div>
  );
}
