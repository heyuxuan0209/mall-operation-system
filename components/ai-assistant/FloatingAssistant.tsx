/**
 * 浮动AI助手按钮
 * 全局浮动在右下角，点击打开对话框
 */

'use client';

import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import ChatDialog from './ChatDialog';
import DraggableDialog from './DraggableDialog';

const STORAGE_KEY = 'ai_assistant_welcomed';

export default function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLabel, setShowLabel] = useState(false);

  // 检测首次访问
  useEffect(() => {
    const hasBeenWelcomed = localStorage.getItem(STORAGE_KEY);

    if (!hasBeenWelcomed) {
      // 首次访问：2秒后自动打开
      const timer = setTimeout(() => {
        setIsOpen(true);
        localStorage.setItem(STORAGE_KEY, 'true');
      }, 2000);

      // 显示提示标签3秒
      setShowLabel(true);
      const labelTimer = setTimeout(() => {
        setShowLabel(false);
      }, 5000);

      return () => {
        clearTimeout(timer);
        clearTimeout(labelTimer);
      };
    }
  }, []);

  return (
    <>
      {/* 浮动按钮 */}
      {!isOpen && (
        <div className="fixed bottom-24 right-6 z-60">
          <button
            onClick={() => setIsOpen(true)}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-all hover:bg-blue-700 hover:scale-110 animate-pulse"
            aria-label="打开AI助手"
          >
            <MessageCircle className="h-6 w-6" />
          </button>
          {/* 提示标签 */}
          {showLabel && (
            <div className="absolute right-16 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-lg animate-fade-in">
              💬 AI助手
              <div className="absolute right-0 top-1/2 h-0 w-0 -translate-y-1/2 translate-x-full border-8 border-transparent border-l-blue-600"></div>
            </div>
          )}
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
