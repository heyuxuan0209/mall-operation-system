'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ArchivesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isListPage = pathname === '/archives';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面头部 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* 标题 */}
            <div className="flex items-center gap-3">
              <i className="fas fa-folder-open text-2xl text-indigo-600"></i>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">帮扶档案库</h1>
                <p className="text-sm text-gray-500 mt-0.5">
                  商户历史帮扶记录与效果追踪
                </p>
              </div>
            </div>

            {/* 面包屑导航（详情页时显示） */}
            {!isListPage && (
              <Link
                href="/archives"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors"
              >
                <i className="fas fa-arrow-left"></i>
                返回档案库
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* 主体内容 */}
      <main className="p-6">
        {children}
      </main>
    </div>
  );
}
