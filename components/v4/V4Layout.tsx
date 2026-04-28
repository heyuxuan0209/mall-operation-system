'use client';

import React from 'react';
import V4Sidebar from './V4Sidebar';

export default function V4Layout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex"
      style={{ background: '#070d1e', color: '#e2e8f0' }}
    >
      <V4Sidebar />

      {/* Main content: offset for sidebar on desktop, offset for bottom nav on mobile */}
      <main className="flex-1 w-full lg:pl-64 pb-20 lg:pb-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
