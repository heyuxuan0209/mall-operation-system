/**
 * 可拖拽、可调整大小的对话框组件
 * 使用react-rnd实现拖拽和调整大小功能
 * 自动保存和恢复位置、大小到localStorage
 */

'use client';

import { useState, useEffect, ReactNode } from 'react';
import { Rnd } from 'react-rnd';
import { MessageCircle, X, Maximize2, Minimize2 } from 'lucide-react';

interface DraggableDialogProps {
  children: ReactNode;
  onClose: () => void;
}

interface DialogPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

const STORAGE_KEY = 'ai_dialog_position';

// 获取默认位置（考虑SSR）
const getDefaultPosition = (): DialogPosition => {
  if (typeof window === 'undefined') {
    return { x: 100, y: 100, width: 480, height: 700 };
  }
  return {
    x: window.innerWidth - 500,
    y: window.innerHeight - 720,
    width: 480,
    height: 700,
  };
};

export default function DraggableDialog({ children, onClose }: DraggableDialogProps) {
  const [position, setPosition] = useState<DialogPosition>(getDefaultPosition());
  const [isMaximized, setIsMaximized] = useState(false);
  const [savedPosition, setSavedPosition] = useState<DialogPosition>(getDefaultPosition());
  const [maxBounds, setMaxBounds] = useState({ width: 1920, height: 1080 });

  // 初始化最大边界
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setMaxBounds({
        width: window.innerWidth - 40,
        height: window.innerHeight - 40,
      });
    }
  }, []);

  // 从localStorage恢复上次的位置和大小
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // 验证位置是否在屏幕内
        if (
          parsed.x >= 0 &&
          parsed.y >= 0 &&
          parsed.x + parsed.width <= window.innerWidth &&
          parsed.y + parsed.height <= window.innerHeight
        ) {
          setPosition(parsed);
          setSavedPosition(parsed);
        }
      } catch (error) {
        console.error('Failed to restore dialog position:', error);
      }
    }
  }, []);

  // 保存位置和大小到localStorage
  const savePosition = (newPosition: DialogPosition) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newPosition));
  };

  // 处理拖拽结束
  const handleDragStop = (_e: any, d: any) => {
    const newPosition = { ...position, x: d.x, y: d.y };
    setPosition(newPosition);
    setSavedPosition(newPosition);
    savePosition(newPosition);
  };

  // 处理调整大小结束
  const handleResizeStop = (
    _e: any,
    _direction: any,
    ref: any,
    _delta: any,
    pos: any
  ) => {
    const newPosition = {
      x: pos.x,
      y: pos.y,
      width: parseInt(ref.style.width),
      height: parseInt(ref.style.height),
    };
    setPosition(newPosition);
    setSavedPosition(newPosition);
    savePosition(newPosition);
  };

  // 切换最大化/恢复
  const toggleMaximize = () => {
    if (typeof window === 'undefined') return;

    if (isMaximized) {
      // 恢复到保存的位置
      setPosition(savedPosition);
      setIsMaximized(false);
    } else {
      // 最大化到全屏（留一点边距）
      const maxPosition = {
        x: 20,
        y: 20,
        width: window.innerWidth - 40,
        height: window.innerHeight - 40,
      };
      setPosition(maxPosition);
      setIsMaximized(true);
    }
  };

  return (
    <Rnd
      position={{ x: position.x, y: position.y }}
      size={{ width: position.width, height: position.height }}
      minWidth={320}
      minHeight={400}
      maxWidth={maxBounds.width}
      maxHeight={maxBounds.height}
      bounds="window"
      dragHandleClassName="drag-handle"
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      enableResizing={{
        bottom: true,
        bottomLeft: true,
        bottomRight: true,
        left: true,
        right: true,
        top: true,
        topLeft: true,
        topRight: true,
      }}
      style={{ zIndex: 60 }}
    >
      <div className="flex h-full w-full flex-col rounded-lg bg-white shadow-2xl">
        {/* 标题栏（可拖拽区域） */}
        <div className="drag-handle flex cursor-move items-center justify-between rounded-t-lg bg-blue-600 px-4 py-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-white" />
            <h2 className="text-lg font-semibold text-white">AI助手</h2>
            <span className="text-xs text-blue-200">可拖拽调整大小</span>
          </div>
          <div className="flex items-center gap-2">
            {/* 最大化/恢复按钮 */}
            <button
              onClick={toggleMaximize}
              className="rounded p-1 text-white transition-colors hover:bg-blue-700"
              aria-label={isMaximized ? '恢复大小' : '最大化'}
            >
              {isMaximized ? (
                <Minimize2 className="h-5 w-5" />
              ) : (
                <Maximize2 className="h-5 w-5" />
              )}
            </button>
            {/* 关闭按钮 */}
            <button
              onClick={onClose}
              className="rounded p-1 text-white transition-colors hover:bg-blue-700"
              aria-label="关闭"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* 对话内容 */}
        <div className="flex-1 overflow-hidden">{children}</div>
      </div>
    </Rnd>
  );
}
