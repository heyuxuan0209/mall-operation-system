/**
 * 浮动AI助手按钮
 * v3.1升级：更显眼的设计，突出agent化特性
 * 全局浮动在右下角，点击打开对话框
 */

'use client';

import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import ChatDialog from './ChatDialog';
import DraggableDialog from './DraggableDialog';

const STORAGE_KEY = 'ai_assistant_welcomed';

export default function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false);

  // 检测首次访问
  useEffect(() => {
    const hasBeenWelcomed = localStorage.getItem(STORAGE_KEY);

    if (!hasBeenWelcomed) {
      // 首次访问：2秒后自动打开
      const timer = setTimeout(() => {
        setIsOpen(true);
        localStorage.setItem(STORAGE_KEY, 'true');
      }, 2000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, []);

  return (
    <>
      {/* 浮动按钮 - v3.1升级版 */}
      {!isOpen && (
        <div className="fixed bottom-24 right-6 z-60 group animate-float-gentle">
          {/* 光晕效果 */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-glow-pulse blur-xl"></div>

          {/* 主按钮 */}
          <button
            onClick={() => setIsOpen(true)}
            className="relative flex h-18 w-18 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-blue-500/50 active:scale-95"
            aria-label="打开AI助手"
          >
            {/* 呼吸动画圆环 */}
            <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping"></div>

            {/* 图标 */}
            <Sparkles className="h-8 w-8 relative z-10" strokeWidth={2.5} />
          </button>

          {/* 悬停展开的标签 */}
          <div className="absolute right-20 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
            <div className="whitespace-nowrap rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xl backdrop-blur-sm">
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                AI助手
              </span>
              {/* 箭头 */}
              <div className="absolute right-0 top-1/2 h-0 w-0 -translate-y-1/2 translate-x-full border-8 border-transparent border-l-purple-600"></div>
            </div>
          </div>

          {/* 简洁标签 - 始终显示 */}
          <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">
            AI
          </div>
        </div>
      )}

      {/* 对话框 */}
      {isOpen && (
        <DraggableDialog onClose={() => setIsOpen(false)}>
          <ChatDialog onClose={() => setIsOpen(false)} />
        </DraggableDialog>
      )}
    </>
  );
}
