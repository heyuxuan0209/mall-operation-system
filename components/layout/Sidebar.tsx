'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  { id: 'dashboard', label: '总览', fullLabel: '运营总览', icon: 'fa-chart-pie', path: '/' },
  { id: 'health', label: '监控', fullLabel: '健康度监控', icon: 'fa-heart-pulse', path: '/health' },
  { id: 'risk', label: '派单', fullLabel: '风险与派单', icon: 'fa-triangle-exclamation', path: '/risk' },
  { id: 'tasks', label: '帮扶', fullLabel: '帮扶任务中心', icon: 'fa-hands-holding-circle', path: '/tasks' },
  { id: 'knowledge', label: '知识库', fullLabel: '帮扶案例知识库', icon: 'fa-book-open', path: '/knowledge' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar: Only visible on LG (1024px) and up */}
      <div className="hidden lg:flex w-64 bg-slate-900 text-white h-screen flex-col fixed left-0 top-0 z-50 shadow-xl transition-all">
        <div className="p-6 flex items-center border-b border-slate-800">
          <i className="fa-solid fa-building-user text-brand-500 text-2xl mr-3"></i>
          <div>
            <h1 className="text-lg font-bold tracking-tight">商户运营助手 V1</h1>
            <p className="text-xs text-slate-400">Mall Operation Agent v1.0</p>
          </div>
        </div>
        <nav className="flex-1 py-6 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.id}
                href={item.path}
                className={`w-full flex items-center px-6 py-3 text-sm font-medium transition-colors duration-150
                  ${isActive
                    ? 'bg-brand-600 text-white border-r-4 border-brand-300'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                <i className={`fa-solid ${item.icon} w-6 text-center mr-3`}></i>
                {item.fullLabel}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Mobile Bottom Navigation:
          Set z-index to 30. This ensures it sits above page content but BELOW modals (which are z-100).
      */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 z-30 flex justify-around items-center py-2 pb-safe-area shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.id}
              href={item.path}
              className={`flex flex-col items-center justify-center w-full py-2 active:scale-95 transition-transform relative
                ${isActive ? 'text-brand-600' : 'text-slate-400'}`}
            >
              {isActive && (
                <div className="absolute -top-[9px] w-8 h-1 bg-brand-500 rounded-b-lg"></div>
              )}
              <div className={`mb-0.5 ${isActive ? '' : ''}`}>
                <i className={`fa-solid ${item.icon} text-xl`}></i>
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
