/**
 * 消息列表组件
 */

'use client';

import MessageItem from './MessageItem';
import { Message } from '@/types/ai-assistant';

interface MessageListProps {
  messages: Message[];
  onFeedback: (messageId: string, helpful: boolean, rating?: number) => void;
}

export default function MessageList({ messages, onFeedback }: MessageListProps) {
  return (
    <>
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          onFeedback={onFeedback}
        />
      ))}
    </>
  );
}
