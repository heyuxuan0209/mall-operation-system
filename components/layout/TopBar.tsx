'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import NotificationBell from '@/components/NotificationBell';

export default function TopBar() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="fixed top-0 right-0 lg:left-64 w-full lg:w-[calc(100%-16rem)] z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="px-4 lg:px-6 py-3 flex justify-end items-center gap-3">
        {/* 通知铃 */}
        <NotificationBell />

        {/* 用户菜单 */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
              <i className="fa-solid fa-user text-brand-600 text-sm"></i>
            </div>
            <span className="hidden sm:inline text-sm font-medium text-slate-700">运营经理</span>
            <i className={`fa-solid fa-chevron-down text-xs text-slate-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}></i>
          </button>

          {/* 下拉菜单 */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-2">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-sm font-medium text-slate-900">运营经理</p>
                <p className="text-xs text-slate-500 mt-0.5">manager@mall.com</p>
              </div>

              <div className="py-1">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors"
                  onClick={() => setShowUserMenu(false)}
                >
                  <i className="fa-solid fa-gauge-high text-brand-600 w-4"></i>
                  <span className="text-sm text-slate-700">管理驾驶舱</span>
                </Link>

                <Link
                  href="/settings"
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors"
                  onClick={() => setShowUserMenu(false)}
                >
                  <i className="fa-solid fa-gear text-slate-500 w-4"></i>
                  <span className="text-sm text-slate-700">个人设置</span>
                </Link>

                <Link
                  href="/notifications"
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors"
                  onClick={() => setShowUserMenu(false)}
                >
                  <i className="fa-solid fa-bell text-slate-500 w-4"></i>
                  <span className="text-sm text-slate-700">通知设置</span>
                </Link>
              </div>

              <div className="border-t border-slate-100 py-1">
                <button
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors w-full text-left"
                  onClick={() => {
                    setShowUserMenu(false);
                    // 这里可以添加退出登录逻辑
                    alert('退出登录功能待实现');
                  }}
                >
                  <i className="fa-solid fa-right-from-bracket text-red-500 w-4"></i>
                  <span className="text-sm text-red-600">退出登录</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
