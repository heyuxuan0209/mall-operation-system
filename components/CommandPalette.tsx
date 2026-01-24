'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import {
  Search,
  Home,
  Heart,
  AlertTriangle,
  ClipboardList,
  BookOpen,
  Plus,
  Calendar,
  TrendingUp
} from 'lucide-react';

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();

  // 监听 Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // 关闭时重置搜索
  useEffect(() => {
    if (!open) {
      setSearch('');
    }
  }, [open]);

  const handleSelect = (callback: () => void) => {
    setOpen(false);
    callback();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-2xl px-4">
        <Command
          className="bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center border-b border-slate-200 px-4">
            <Search className="text-slate-400 mr-2" size={20} />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="输入命令或搜索..."
              className="w-full py-4 text-base outline-none bg-transparent"
            />
            <kbd className="hidden sm:inline-block px-2 py-1 text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 rounded">
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-[400px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-slate-500">
              未找到相关命令
            </Command.Empty>

            {/* 导航 */}
            <Command.Group heading="导航" className="text-xs font-semibold text-slate-500 px-2 py-2">
              <Command.Item
                onSelect={() => handleSelect(() => router.push('/'))}
                className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-100 data-[selected=true]:bg-slate-100"
              >
                <Home size={18} className="text-slate-600" />
                <span>运营总览</span>
              </Command.Item>

              <Command.Item
                onSelect={() => handleSelect(() => router.push('/health'))}
                className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-100 data-[selected=true]:bg-slate-100"
              >
                <Heart size={18} className="text-slate-600" />
                <span>健康度监控</span>
              </Command.Item>

              <Command.Item
                onSelect={() => handleSelect(() => router.push('/risk'))}
                className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-100 data-[selected=true]:bg-slate-100"
              >
                <AlertTriangle size={18} className="text-slate-600" />
                <span>风险与派单</span>
              </Command.Item>

              <Command.Item
                onSelect={() => handleSelect(() => router.push('/tasks'))}
                className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-100 data-[selected=true]:bg-slate-100"
              >
                <ClipboardList size={18} className="text-slate-600" />
                <span>帮扶任务中心</span>
              </Command.Item>

              <Command.Item
                onSelect={() => handleSelect(() => router.push('/knowledge'))}
                className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-100 data-[selected=true]:bg-slate-100"
              >
                <BookOpen size={18} className="text-slate-600" />
                <span>经验知识库</span>
              </Command.Item>
            </Command.Group>

            {/* 快速操作 */}
            <Command.Group heading="快速操作" className="text-xs font-semibold text-slate-500 px-2 py-2 mt-2">
              <Command.Item
                onSelect={() => handleSelect(() => router.push('/risk'))}
                className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-100 data-[selected=true]:bg-slate-100"
              >
                <Plus size={18} className="text-blue-600" />
                <span>创建新任务</span>
                <span className="ml-auto text-xs text-slate-400">风险派单</span>
              </Command.Item>

              <Command.Item
                onSelect={() => handleSelect(() => router.push('/tasks?view=calendar'))}
                className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-100 data-[selected=true]:bg-slate-100"
              >
                <Calendar size={18} className="text-purple-600" />
                <span>查看任务日历</span>
              </Command.Item>

              <Command.Item
                onSelect={() => handleSelect(() => router.push('/health'))}
                className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-100 data-[selected=true]:bg-slate-100"
              >
                <TrendingUp size={18} className="text-green-600" />
                <span>查看风险趋势</span>
                <span className="ml-auto text-xs text-slate-400">即将推出</span>
              </Command.Item>
            </Command.Group>

            {/* 搜索商户 */}
            {search && (
              <Command.Group heading="搜索结果" className="text-xs font-semibold text-slate-500 px-2 py-2 mt-2">
                <Command.Item className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-100 data-[selected=true]:bg-slate-100">
                  <Search size={18} className="text-slate-400" />
                  <span>搜索 "{search}"</span>
                </Command.Item>
              </Command.Group>
            )}
          </Command.List>

          {/* 底部提示 */}
          <div className="border-t border-slate-200 px-4 py-2 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded">↑↓</kbd>
                导航
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded">Enter</kbd>
                选择
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded">ESC</kbd>
                关闭
              </span>
            </div>
            <span className="hidden sm:block">
              按 <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded">⌘K</kbd> 打开
            </span>
          </div>
        </Command>
      </div>
    </div>
  );
}
