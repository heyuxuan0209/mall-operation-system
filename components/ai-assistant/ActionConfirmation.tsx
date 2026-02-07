/**
 * 操作确认对话框
 */

'use client';

import { ActionConfirmConfig } from '@/types/ai-assistant';
import { X } from 'lucide-react';

interface ActionConfirmationProps {
  config: ActionConfirmConfig;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ActionConfirmation({
  config,
  onConfirm,
  onCancel,
}: ActionConfirmationProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        {/* 标题 */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{config.title}</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
            aria-label="关闭"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 消息 */}
        <p className="mb-6 whitespace-pre-line text-sm text-gray-600">
          {config.message}
        </p>

        {/* 按钮 */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            {config.cancelText || '取消'}
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            {config.confirmText || '确认'}
          </button>
        </div>
      </div>
    </div>
  );
}
