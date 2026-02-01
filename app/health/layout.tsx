'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function HealthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">健康度监控</h2>
        <p className="text-sm text-slate-500 mt-1">
          实时监控商户健康状况，及时发现风险
        </p>
      </div>

      {/* Tab导航 */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-8">
          <Link
            href="/health"
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              pathname === '/health'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            商户列表
          </Link>
          <Link
            href="/health/compare"
            className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              pathname === '/health/compare'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            商户对比
          </Link>
        </nav>
      </div>

      {/* 子页面内容 */}
      {children}
    </div>
  );
}
