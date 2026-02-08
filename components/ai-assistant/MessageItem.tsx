/**
 * 单条消息组件（支持Markdown）
 */

'use client';

import { Message } from '@/types/ai-assistant';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import FeedbackWidget from './FeedbackWidget';
import ActionCard, { ActionType } from './ActionCard';
import { RiskLevelFormatter } from '@/utils/formatters';

interface MessageItemProps {
  message: Message;
  onFeedback: (messageId: string, helpful: boolean, rating?: number) => void;
}

export default function MessageItem({ message, onFeedback }: MessageItemProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`
          max-w-[95%] sm:max-w-[90%] md:max-w-[85%] lg:max-w-[80%]
          rounded-lg px-3 sm:px-4 py-2
          ${isUser ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}
        `}
      >
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-sm max-w-none prose-headings:mt-3 prose-headings:mb-2 prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-strong:text-gray-900 prose-strong:font-semibold">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // 自定义表格组件（处理overflow）
                table: ({ node, ...props }) => (
                  <div className="overflow-x-auto my-2 -mx-2 px-2">
                    <table className="min-w-full divide-y divide-gray-200" {...props} />
                  </div>
                ),

                // 表头样式
                thead: ({ node, ...props }) => (
                  <thead className="bg-gray-50" {...props} />
                ),

                // 表头单元格
                th: ({ node, ...props }) => (
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 whitespace-nowrap" {...props} />
                ),

                // 表格单元格
                td: ({ node, ...props }) => (
                  <td className="px-3 py-2 text-sm text-gray-900 whitespace-nowrap" {...props} />
                ),

                // 自定义代码块（处理overflow）
                pre: ({ node, ...props }) => (
                  <pre className="overflow-x-auto bg-gray-800 text-gray-100 rounded p-3 my-2" {...props} />
                ),

                // 自定义强调文本（处理风险等级高亮）
                strong: ({ node, children, ...props }) => {
                  const text = String(children);

                  // 检测是否是风险等级
                  const riskLevels = ['极高风险', '高风险', '中风险', '低风险', '无风险'];
                  if (riskLevels.includes(text)) {
                    // 查找对应的英文key
                    const levelKey = Object.keys({
                      critical: '极高风险',
                      high: '高风险',
                      medium: '中风险',
                      low: '低风险',
                      none: '无风险',
                    }).find((key) => RiskLevelFormatter.toChineseLabel(key) === text);

                    const config = levelKey ? RiskLevelFormatter.getBadgeConfig(levelKey) : null;

                    return (
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${config?.className || ''}`}>
                        {text}
                      </span>
                    );
                  }

                  return <strong {...props}>{children}</strong>;
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
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
