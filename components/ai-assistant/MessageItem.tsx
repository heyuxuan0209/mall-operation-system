/**
 * 单条消息组件（智能可视化）
 * v3.1升级：自动解析响应并可视化展示
 */

'use client';

import { Message } from '@/types/ai-assistant';
import FeedbackWidget from './FeedbackWidget';
import ActionCard, { ActionType } from './ActionCard';
import { RiskLevelFormatter } from '@/utils/formatters';
import { ResponseParser } from '@/utils/ai-assistant/responseParser';
import { StatGrid, PieChartCard, BarChartCard, ListCard } from './ResponseVisuals';

interface MessageItemProps {
  message: Message;
  onFeedback: (messageId: string, helpful: boolean, rating?: number) => void;
}

export default function MessageItem({ message, onFeedback }: MessageItemProps) {
  const isUser = message.role === 'user';

  // 解析AI响应
  const parsedResponse = !isUser ? ResponseParser.parse(message.content) : null;

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
          <div className="space-y-2">
            {/* 纯文本内容 */}
            {parsedResponse?.content.text && (
              <div className="text-sm whitespace-pre-wrap leading-relaxed">
                {parsedResponse.content.text}
              </div>
            )}

            {/* 统计卡片 */}
            {parsedResponse?.content.stats && parsedResponse.content.stats.length > 0 && (
              <StatGrid stats={parsedResponse.content.stats} />
            )}

            {/* 图表 */}
            {parsedResponse?.content.chart && (
              <>
                {parsedResponse.content.chart.type === 'pie' && (
                  <PieChartCard
                    title={parsedResponse.content.chart.title}
                    data={parsedResponse.content.chart.data}
                  />
                )}
                {parsedResponse.content.chart.type === 'bar' && (
                  <BarChartCard
                    title={parsedResponse.content.chart.title}
                    data={parsedResponse.content.chart.data}
                    xKey="name"
                    yKey="value"
                  />
                )}
              </>
            )}

            {/* 列表 */}
            {parsedResponse?.content.list && (
              <ListCard
                title={parsedResponse.content.list.title}
                items={parsedResponse.content.list.items}
              />
            )}
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
