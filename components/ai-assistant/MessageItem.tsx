/**
 * 单条消息组件（支持Markdown）
 */

'use client';

import { Message } from '@/types/ai-assistant';
import ReactMarkdown from 'react-markdown';
import FeedbackWidget from './FeedbackWidget';
import ActionCard, { ActionType } from './ActionCard';

interface MessageItemProps {
  message: Message;
  onFeedback: (messageId: string, helpful: boolean, rating?: number) => void;
}

export default function MessageItem({ message, onFeedback }: MessageItemProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-lg px-4 py-2 ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-sm max-w-none prose-headings:mt-3 prose-headings:mb-2 prose-p:my-1 prose-ul:my-1 prose-ol:my-1">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}

        {/* 元数据 */}
        {message.metadata?.executionTime && (
          <div className="mt-1 text-xs opacity-60">
            {message.metadata.executionTime}ms · {message.metadata.dataSource}
            {message.metadata.llmModel && ` · ${message.metadata.llmModel}`}
          </div>
        )}

        {/* 建议操作卡片（仅助手消息） */}
        {!isUser && message.metadata?.suggestedActions && message.metadata.suggestedActions.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.metadata.suggestedActions.map((action, index) => (
              <ActionCard
                key={index}
                type={action.type as ActionType}
                merchantId={action.merchantId}
                merchantName={action.merchantName}
              />
            ))}
          </div>
        )}

        {/* 反馈组件（仅助手消息） */}
        {!isUser && !message.feedback && (
          <div className="mt-2">
            <FeedbackWidget
              messageId={message.id}
              onFeedback={(helpful, rating) => onFeedback(message.id, helpful, rating)}
            />
          </div>
        )}

        {/* 已有反馈显示 */}
        {message.feedback && (
          <div className="mt-1 text-xs opacity-60">
            {message.feedback.helpful ? '👍 有帮助' : '👎'}
            {message.feedback.rating && ` · ${message.feedback.rating}⭐`}
          </div>
        )}
      </div>
    </div>
  );
}
