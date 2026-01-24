'use client';

import React from 'react';
import Sidebar from './Sidebar';
import DeadlineAlert from '../DeadlineAlert';
import CommandPalette from '../CommandPalette';
import QuickDispatch from '../QuickDispatch';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col lg:flex-row relative">
      <Sidebar />

      {/*
         lg:pl-64 -> 只有在电脑上才预留左侧 64 宽度
         pb-[120px] lg:pb-8 -> 手机上底部留白 120px，电脑上 32px
      */}
      <main className="flex-1 w-full lg:pl-64 relative z-0">
        {/* 逾期预警横幅 */}
        <DeadlineAlert />

        <div className="max-w-7xl mx-auto p-4 lg:p-8 pb-[120px] lg:pb-8">
          {children}
        </div>
      </main>

      {/* 全局命令面板 Cmd+K */}
      <CommandPalette />

      {/* 快速派单浮动按钮 */}
      <QuickDispatch />
    </div>
  );
}
