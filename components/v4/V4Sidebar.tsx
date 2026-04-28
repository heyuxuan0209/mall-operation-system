'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BrainCircuit,
  ListChecks,
  BookMarked,
  Settings,
  ArrowLeftRight,
  Zap,
  MessagesSquare,
} from 'lucide-react';

const navItems = [
  {
    id: 'dashboard',
    label: '经营驾驶舱',
    sub: 'Command Center',
    icon: LayoutDashboard,
    path: '/v4',
    exact: true,
  },
  {
    id: 'session',
    label: 'AI 会商决策',
    sub: 'Deliberation Studio',
    icon: MessagesSquare,
    path: '/v4/session',
    exact: false,
    highlight: true,
  },
  {
    id: 'execution',
    label: '执行推进中心',
    sub: 'Execution Hub',
    icon: ListChecks,
    path: '/v4/execution',
    exact: false,
  },
  {
    id: 'memory',
    label: '组织记忆中心',
    sub: 'Memory Center',
    icon: BookMarked,
    path: '/v4/memory',
    exact: false,
  },
];

const agents = [
  { id: 'risk', name: '风险诊断师', color: '#ef4444', status: 'active' },
  { id: 'advisor', name: '商户经营顾问', color: '#0ea5e9', status: 'active' },
  { id: 'campaign', name: '活动策略师', color: '#f59e0b', status: 'idle' },
  { id: 'inspector', name: '巡店督导', color: '#22c55e', status: 'idle' },
  { id: 'scheduler', name: '任务调度官', color: '#8b5cf6', status: 'active' },
  { id: 'memory', name: '案例记忆官', color: '#06b6d4', status: 'active' },
];

export default function V4Sidebar() {
  const pathname = usePathname();

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) return pathname === item.path;
    return pathname.startsWith(item.path);
  };

  const activeCount = agents.filter((a) => a.status === 'active').length;

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className="hidden lg:flex w-64 flex-col fixed left-0 top-0 h-screen z-50 select-none"
        style={{
          background: 'linear-gradient(180deg, #060d1f 0%, #080e20 100%)',
          borderRight: '1px solid rgba(148,163,184,0.07)',
        }}
      >
        {/* Logo */}
        <div
          className="p-5 flex items-center gap-3"
          style={{ borderBottom: '1px solid rgba(148,163,184,0.07)' }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #0ea5e9 0%, #2563eb 100%)',
              boxShadow: '0 0 16px rgba(14,165,233,0.35)',
            }}
          >
            <Zap size={16} className="text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-[13px] font-bold text-slate-100 tracking-tight leading-tight truncate">
              商户智运Agent
            </h1>
            <p className="text-[10px] text-slate-500 mt-0.5">AI 经营决策中枢 · v4.0</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 pt-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item);
            const Icon = item.icon;
            const isHighlight = (item as any).highlight && !active;
            return (
              <Link
                key={item.id}
                href={item.path}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group"
                style={active ? {
                  background: 'rgba(14,165,233,0.1)',
                  border: '1px solid rgba(14,165,233,0.2)',
                  color: '#38bdf8',
                } : isHighlight ? {
                  background: 'linear-gradient(135deg, rgba(14,165,233,0.08), rgba(37,99,235,0.08))',
                  border: '1px solid rgba(14,165,233,0.15)',
                  color: '#7dd3fc',
                } : {
                  background: 'transparent',
                  border: '1px solid transparent',
                  color: '#94a3b8',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background =
                      'rgba(148,163,184,0.05)';
                    (e.currentTarget as HTMLElement).style.color = '#e2e8f0';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background = isHighlight
                      ? 'linear-gradient(135deg, rgba(14,165,233,0.08), rgba(37,99,235,0.08))'
                      : 'transparent';
                    (e.currentTarget as HTMLElement).style.color = isHighlight ? '#7dd3fc' : '#94a3b8';
                  }
                }}
              >
                <Icon size={15} style={{ flexShrink: 0 }} />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] leading-tight flex items-center gap-1.5">
                    {item.label}
                    {isHighlight && (
                      <span className="text-[9px] px-1 py-0.5 rounded font-semibold"
                        style={{ background: 'rgba(14,165,233,0.2)', color: '#38bdf8' }}>
                        DEMO
                      </span>
                    )}
                  </div>
                  <div
                    className="text-[10px] mt-0.5 truncate"
                    style={{ color: active ? 'rgba(56,189,248,0.6)' : '#475569' }}
                  >
                    {item.sub}
                  </div>
                </div>
                {active && (
                  <div
                    className="w-1 h-5 rounded-full flex-shrink-0"
                    style={{ background: '#0ea5e9' }}
                  />
                )}
              </Link>
            );
          })}

          {/* Settings */}
          <div style={{ paddingTop: '8px', borderTop: '1px solid rgba(148,163,184,0.07)', marginTop: '8px' }}>
            <Link
              href="/v4/settings"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
              style={{ color: '#64748b', border: '1px solid transparent' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(148,163,184,0.05)';
                (e.currentTarget as HTMLElement).style.color = '#e2e8f0';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
                (e.currentTarget as HTMLElement).style.color = '#64748b';
              }}
            >
              <Settings size={14} />
              <span className="text-[13px]">经营设置</span>
            </Link>
          </div>
        </nav>

        {/* Agent Team Panel */}
        <div
          className="p-3"
          style={{ borderTop: '1px solid rgba(148,163,184,0.07)' }}
        >
          <div className="flex items-center justify-between px-1 mb-2.5">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              AI 经营班子
            </p>
            <div className="flex items-center gap-1.5">
              <div
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: '#22c55e' }}
              />
              <span className="text-[10px]" style={{ color: '#22c55e' }}>
                {activeCount}/6 工作中
              </span>
            </div>
          </div>
          <div className="space-y-1.5">
            {agents.map((agent) => (
              <div key={agent.id} className="flex items-center gap-2 px-1">
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{
                    background: agent.status === 'active' ? agent.color : '#334155',
                    boxShadow:
                      agent.status === 'active' ? `0 0 6px ${agent.color}80` : 'none',
                    animation: agent.status === 'active' ? 'pulse 2s infinite' : 'none',
                  }}
                />
                <span
                  className="text-[11px] flex-1 truncate"
                  style={{ color: agent.status === 'active' ? '#cbd5e1' : '#475569' }}
                >
                  {agent.name}
                </span>
                <span
                  className="text-[10px]"
                  style={{ color: agent.status === 'active' ? '#22c55e' : '#334155' }}
                >
                  {agent.status === 'active' ? '运行中' : '待命'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Workspace Entry */}
        <div className="p-3" style={{ borderTop: '1px solid rgba(148,163,184,0.07)' }}>
          <Link
            href="/workspace"
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-[12px] font-semibold text-white transition-all"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#4f46e5)', boxShadow: '0 0 12px rgba(124,58,237,0.3)' }}
          >
            <MessagesSquare size={13} />
            <span>线程工作台</span>
            <span className="ml-auto text-[9px] bg-white/20 px-1.5 py-0.5 rounded-full">NEW</span>
          </Link>
        </div>

        {/* Version Switcher */}
        <div
          className="p-3"
          style={{ borderTop: '1px solid rgba(148,163,184,0.07)' }}
        >
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] transition-all duration-150"
            style={{ color: '#475569' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(148,163,184,0.05)';
              (e.currentTarget as HTMLElement).style.color = '#94a3b8';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
              (e.currentTarget as HTMLElement).style.color = '#475569';
            }}
          >
            <ArrowLeftRight size={11} />
            切换到旧版本 (v1)
          </Link>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div
        className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center py-2"
        style={{
          background: 'rgba(6,13,31,0.97)',
          borderTop: '1px solid rgba(148,163,184,0.1)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {navItems.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.path}
              className="flex flex-col items-center justify-center flex-1 py-1.5"
              style={{ color: active ? '#38bdf8' : '#475569' }}
            >
              <Icon size={18} />
              <span className="text-[9px] mt-1 font-medium">
                {item.label.replace('AI ', '').slice(0, 4)}
              </span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
