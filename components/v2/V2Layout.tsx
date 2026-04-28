'use client';

import React from 'react';
import V2Sidebar from './V2Sidebar';

export default function V2Layout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex"
      style={{ background: '#070d1e', color: '#e2e8f0' }}
    >
      <V2Sidebar />

      {/* Main content: offset for sidebar on desktop, offset for bottom nav on mobile */}
      <main className="flex-1 w-full lg:pl-64 pb-20 lg:pb-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
