'use client';

import React, { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  Clock3,
  ClipboardList,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Store,
  Target,
  Zap,
} from 'lucide-react';
import {
  diagnosisFlow,
  evidenceLedger,
  merchantAgents,
  merchantProfile,
  statusMetrics,
  todayPriorities,
  type DiagnosisStatus,
  type EvidenceType,
  type PriorityLevel,
  type TaskStatus,
} from '@/data/merchant-workspace/wangchao-improvement';
import {
  getImprovementSummary,
  loadCurrentDispatch,
  markMerchantReceived,
  saveMerchantDispatch,
  updateDispatchDraft,
  updateDispatchTaskStatus,
  returnDispatchToMall,
  type ImprovementTask,
  type MerchantDispatch,
} from '@/utils/merchantImprovementState';

const toneMap = {
  amber: { bg: '#fffbeb', border: '#fde68a', text: '#b45309', soft: '#fef3c7' },
  rose: { bg: '#fff1f2', border: '#fecdd3', text: '#be123c', soft: '#ffe4e6' },
  sky: { bg: '#f0f9ff', border: '#bae6fd', text: '#0369a1', soft: '#e0f2fe' },
  emerald: { bg: '#ecfdf5', border: '#bbf7d0', text: '#047857', soft: '#d1fae5' },
};

const priorityColor: Record<PriorityLevel, string> = {
  P0: 'bg-rose-600 text-white',
  P1: 'bg-amber-100 text-amber-700',
};

const statusColor: Record<TaskStatus, string> = {
  待确认: 'bg-slate-100 text-slate-600',
  进行中: 'bg-sky-100 text-sky-700',
  已完成: 'bg-emerald-100 text-emerald-700',
  待验证: 'bg-violet-100 text-violet-700',
};

const flowStatusColor: Record<DiagnosisStatus, string> = {
  已完成: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  进行中: 'bg-sky-100 text-sky-700 border-sky-200',
  待确认: 'bg-amber-100 text-amber-700 border-amber-200',
  待执行: 'bg-slate-100 text-slate-600 border-slate-200',
};

const evidenceColor: Record<EvidenceType, string> = {
  销售数据: 'bg-blue-100 text-blue-700',
  客流数据: 'bg-cyan-100 text-cyan-700',
  活动数据: 'bg-amber-100 text-amber-700',
  评价数据: 'bg-orange-100 text-orange-700',
  现场数据: 'bg-green-100 text-green-700',
  商场反馈: 'bg-indigo-100 text-indigo-700',
};

function loadAndReceiveDispatch(dispatchId: string | null): MerchantDispatch | null {
  const current = loadCurrentDispatch(dispatchId);
  if (!current) return null;

  const received = markMerchantReceived(current);
  if (received !== current) {
    saveMerchantDispatch(received);
  }
  return received;
}

function MerchantWorkspacePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatchId = searchParams.get('dispatchId');
  const initialDispatch = useMemo(() => loadAndReceiveDispatch(dispatchId), [dispatchId]);
  const [dispatch, setDispatch] = useState<MerchantDispatch | null>(initialDispatch);

  const tasks = useMemo(() => dispatch?.tasks ?? [], [dispatch]);
  const taskDrafts = dispatch?.drafts ?? {};
  const improvementSummary = useMemo(() => getImprovementSummary(tasks, dispatch), [dispatch, tasks]);

  const statusMetricValues = useMemo(() => statusMetrics.map(metric => {
    if (metric.label === '任务完成') {
      return { ...metric, value: String(improvementSummary.completed), unit: `/${improvementSummary.total}` };
    }
    return metric;
  }), [improvementSummary.completed, improvementSummary.total]);

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    if (!dispatch) return;
    const nextDispatch = updateDispatchTaskStatus(dispatch, taskId, status);
    saveMerchantDispatch(nextDispatch);
    setDispatch(nextDispatch);
  };

  const updateTaskDraft = (taskId: string, value: string) => {
    if (!dispatch) return;
    const nextDispatch = updateDispatchDraft(dispatch, taskId, value);
    saveMerchantDispatch(nextDispatch);
    setDispatch(nextDispatch);
  };

  const handleReturnToMall = () => {
    if (!dispatch) {
      router.push('/workspace');
      return;
    }
    const returned = returnDispatchToMall(dispatch);
    saveMerchantDispatch(returned);
    setDispatch(returned);
    router.push(`/workspace?view=merchant-feedback&dispatchId=${returned.dispatchId}`);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div className="flex-shrink-0 flex items-center gap-4 px-5 h-12 bg-white border-b border-slate-200 z-40">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-slate-900 flex items-center justify-center">
            <Store size={12} className="text-white" />
          </div>
          <span className="text-[13px] font-bold text-slate-800">门店改善工作台</span>
          <span className="text-[10px] text-slate-400 ml-1">餐饮商家经营改善</span>
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-slate-200 p-0.5 bg-slate-50 ml-2">
          <Link href="/workspace" className="px-3 py-1.5 rounded-lg text-[11px] font-medium text-slate-500 hover:text-slate-800 hover:bg-white transition-all">
            商场工作台
          </Link>
          <span className="px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-900 text-white">
            门店改善工作台
          </span>
        </div>
        <div className="flex-1" />
        <button onClick={handleReturnToMall} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
          回流商场评估 <ArrowRight size={12} />
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto bg-slate-50">
        <div className="px-5 py-5 space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-100 text-rose-700">续约风险改善中</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-700">风险等级：{merchantProfile.riskLevel}</span>
                  </div>
                  <h1 className="text-[22px] font-bold text-slate-900 leading-tight">{merchantProfile.title}</h1>
                  <p className="text-[13px] text-slate-500 mt-1">{merchantProfile.subtitle}</p>
                </div>
                <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 text-white">
                  <Sparkles size={14} className="text-amber-300" />
                  <div>
                    <p className="text-[10px] text-slate-400">AI 提醒</p>
                    <p className="text-[11px] font-medium">优先修复 3 个续约相关问题</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 divide-x divide-y lg:divide-y-0 divide-slate-100">
              {statusMetricValues.map(metric => {
                const Icon = metric.icon;
                const tone = toneMap[metric.tone as keyof typeof toneMap];
                return (
                  <div key={metric.label} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-medium text-slate-500">{metric.label}</span>
                      <span className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: tone.soft }}>
                        <Icon size={15} style={{ color: tone.text }} />
                      </span>
                    </div>
                    <p className="text-2xl font-bold" style={{ color: tone.text }}>
                      {metric.value}<span className="text-sm font-normal text-slate-400 ml-1">{metric.unit}</span>
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="px-5 py-3 bg-amber-50 border-t border-amber-100 flex items-start gap-2">
              <AlertTriangle size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-[12px] text-amber-800 leading-relaxed">{merchantProfile.aiReminder}</p>
            </div>
          </section>

          {!dispatch ? (
            <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <Store size={28} className="text-slate-300 mx-auto mb-3" />
              <h2 className="text-[16px] font-bold text-slate-800">暂无商场下发的改善任务</h2>
              <p className="text-[12px] text-slate-500 mt-2">请先在商场工作台完成研判，并点击“下发给商家执行”。</p>
              <Link href="/workspace" className="inline-flex items-center gap-1.5 mt-5 px-4 py-2 rounded-xl bg-slate-900 text-white text-[12px] font-semibold hover:bg-slate-700 transition-colors">
                回到商场工作台 <ArrowRight size={12} />
              </Link>
            </section>
          ) : (
          <>
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            <div className="xl:col-span-3">
              <Panel title="今日最重要 3 件事" icon={<Zap size={14} className="text-rose-500" />}>
                <div className="space-y-3">
                  {todayPriorities.map(item => (
                    <div key={item.title} className="rounded-xl border border-slate-200 bg-white p-3">
                      <div className="flex items-start gap-2 mb-2">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold flex-shrink-0 ${priorityColor[item.level]}`}>{item.level}</span>
                        <p className="text-[12px] font-semibold text-slate-800 leading-snug">{item.title}</p>
                      </div>
                      <InfoLine label="预计影响" value={item.expectedImpact} />
                      <InfoLine label="店长确认" value={item.managerConfirm} />
                      <InfoLine label="商场关注" value={item.mallConcern} />
                    </div>
                  ))}
                </div>
              </Panel>
            </div>

            <div className="xl:col-span-6 space-y-4">
              <Panel
                title="改善任务板"
                icon={<ClipboardList size={14} className="text-emerald-500" />}
                action={`${improvementSummary.completed}/${improvementSummary.total} 已完成 · ${improvementSummary.confirmed}/${improvementSummary.total} 已确认`}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {tasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      draft={taskDrafts[task.id] ?? ''}
                      onDraftChange={value => updateTaskDraft(task.id, value)}
                      onConfirm={() => updateTaskStatus(task.id, '进行中')}
                      onComplete={() => updateTaskStatus(task.id, '已完成')}
                    />
                  ))}
                </div>
              </Panel>
            </div>

            <div className="xl:col-span-3 space-y-4">
              <Panel title="回流商场评估" icon={<Store size={14} className="text-indigo-500" />}>
                <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-3 mb-3">
                  <p className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider mb-1">商场侧风险变化</p>
                  <p className="text-[13px] font-bold text-slate-800">{improvementSummary.riskChange}</p>
                  <p className="text-[10px] text-indigo-700 mt-1">任务完成 {improvementSummary.completed}/{improvementSummary.total}</p>
                </div>
                <div className="space-y-2 mb-3">
                  {improvementSummary.metrics.map(metric => (
                    <div key={metric.label} className="rounded-xl border border-slate-200 bg-white p-2.5">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-[11px] font-semibold text-slate-700">{metric.label}</p>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${
                          metric.verdict === '达标' ? 'bg-emerald-100 text-emerald-700' :
                          metric.verdict === '接近达标' ? 'bg-amber-100 text-amber-700' :
                          metric.verdict === '未达标' ? 'bg-rose-100 text-rose-700' :
                          'bg-slate-100 text-slate-500'
                        }`}>
                          {metric.verdict}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[10px]">
                        <p className="text-slate-400">目标：{metric.target ?? '-'}</p>
                        <p className="text-slate-600 text-right">当前：{metric.actual ?? '-'}</p>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 leading-snug">{metric.current}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                  <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1">商场评估预判</p>
                  <p className="text-[12px] font-semibold text-emerald-900 leading-relaxed">{improvementSummary.effectVerdict.title}</p>
                  <p className="text-[11px] text-emerald-800 leading-relaxed mt-1">{improvementSummary.effectVerdict.nextAction}</p>
                </div>
              </Panel>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            <div className="xl:col-span-8">
              <Panel title="经营诊断链路" icon={<RotateCcw size={14} className="text-sky-500" />} action="已收敛">
                <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
                  {diagnosisFlow.map((step, index) => (
                    <div key={step.step} className="relative">
                      <div className={`h-full rounded-xl border p-3 bg-white ${flowStatusColor[step.status]}`}>
                        <div className="flex items-center justify-between mb-2">
                          {step.status === '已完成' ? <CheckCircle2 size={14} /> : step.status === '进行中' ? <Clock3 size={14} /> : <CircleDashed size={14} />}
                          <span className="text-[9px] font-bold">{step.status}</span>
                        </div>
                        <p className="text-[12px] font-bold text-slate-800 mb-1">{step.step}</p>
                        <p className="text-[10px] text-slate-500 leading-snug mb-2">{step.summary}</p>
                        <p className="text-[9px] text-slate-400">{step.owner}</p>
                      </div>
                      {index < diagnosisFlow.length - 1 && (
                        <ChevronRight size={13} className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 text-slate-300 z-10" />
                      )}
                    </div>
                  ))}
                </div>
              </Panel>
            </div>

            <div className="xl:col-span-4">
              <Panel title="证据账本摘要" icon={<ShieldAlert size={14} className="text-amber-500" />} action={`${evidenceLedger.length} 条证据`}>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-2">
                  {evidenceLedger.slice(0, 4).map(item => {
                    const Icon = item.icon;
                    return (
                      <div key={item.title} className="rounded-xl border border-slate-200 bg-white p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-7 h-7 rounded-lg flex items-center justify-center bg-slate-100">
                            <Icon size={13} className="text-slate-600" />
                          </span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${evidenceColor[item.type]}`}>{item.type}</span>
                        </div>
                        <p className="text-[12px] font-bold text-slate-800">{item.title}</p>
                        <p className="text-[11px] text-slate-600 mt-1">{item.value}</p>
                        <p className="text-[10px] text-emerald-700 mt-2 leading-snug">行动提示：{item.actionHint}</p>
                      </div>
                    );
                  })}
                </div>
              </Panel>
            </div>
          </div>

          <Panel title="商家经营 Agent" icon={<Target size={14} className="text-violet-500" />} action="后台协同">
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2">
              {merchantAgents.map(agent => {
                const Icon = agent.icon;
                return (
                  <div key={agent.name} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
                    <span className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${agent.color}18` }}>
                      <Icon size={13} style={{ color: agent.color }} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-slate-700 truncate">{agent.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{agent.role}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
          </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MerchantWorkspacePage() {
  return (
    <Suspense fallback={null}>
      <MerchantWorkspacePageContent />
    </Suspense>
  );
}

function Panel({ title, icon, action, children }: {
  title: string;
  icon: React.ReactNode;
  action?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3">
      <div className="flex items-center gap-2 mb-3 px-1">
        {icon}
        <h2 className="text-[13px] font-bold text-slate-800">{title}</h2>
        {action && <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-500">{action}</span>}
      </div>
      {children}
    </section>
  );
}

function TaskCard({ task, draft, onDraftChange, onConfirm, onComplete }: {
  task: ImprovementTask;
  draft: string;
  onDraftChange: (value: string) => void;
  onConfirm: () => void;
  onComplete: () => void;
}) {
  const isDone = task.status === '已完成' || task.status === '待验证';

  return (
    <div className={`rounded-xl border bg-white p-3 transition-all ${isDone ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200'}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-start gap-2 min-w-0">
          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold flex-shrink-0 ${priorityColor[task.priority]}`}>{task.priority}</span>
          <div className="min-w-0">
            <p className="text-[12px] font-bold text-slate-800 leading-snug">{task.title}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{task.theme}</p>
          </div>
        </div>
        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0 ${statusColor[task.status]}`}>{task.status}</span>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-2">
        <InfoLine label="负责人" value={`${task.role} · ${task.owner}`} />
        <InfoLine label="截止" value={task.deadline} />
      </div>
      <InfoLine label="预期影响" value={task.expectedImpact} />
      <InfoLine label="验证指标" value={task.metric} />

      {task.status === '待确认' && (
        <button
          onClick={onConfirm}
          className="mt-3 w-full py-2 rounded-lg bg-slate-900 text-white text-[11px] font-semibold hover:bg-slate-700 transition-colors"
        >
          店长确认
        </button>
      )}

      {task.status === '进行中' && (
        <div className="mt-3 space-y-2">
          <textarea
            value={draft}
            onChange={event => onDraftChange(event.target.value)}
            placeholder="填写执行说明，例如：午市套餐已上线，今日核销 18 单"
            className="w-full min-h-14 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-[11px] text-slate-700 placeholder-slate-400 outline-none focus:border-emerald-300 focus:bg-white transition-colors resize-none"
          />
          <button
            onClick={onComplete}
            className="w-full py-2 rounded-lg bg-emerald-600 text-white text-[11px] font-semibold hover:bg-emerald-700 transition-colors"
          >
            标记完成
          </button>
        </div>
      )}

      {task.status === '已完成' && (
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-2">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 size={12} className="text-emerald-600" />
            <span className="text-[11px] font-semibold text-emerald-700">已完成，等待指标验证</span>
          </div>
          {draft && <p className="text-[10px] text-emerald-800 mt-1 leading-snug">执行说明：{draft}</p>}
        </div>
      )}

      {task.status === '待验证' && (
        <div className="mt-3 rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-2">
          <p className="text-[11px] font-semibold text-violet-700">等待商场/系统验证指标</p>
        </div>
      )}
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-[10px] text-slate-600 leading-snug mt-0.5">{value}</p>
    </div>
  );
}
