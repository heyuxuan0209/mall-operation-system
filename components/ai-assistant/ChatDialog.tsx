/**
 * AI助手对话框
 * 包含消息列表、输入框、快捷操作等
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import MessageList from './MessageList';
import InputBox from './InputBox';
import QuickActions from './QuickActions';
import TypingIndicator from './TypingIndicator';
import ActionConfirmation from './ActionConfirmation';
import FeedbackWidget from './FeedbackWidget';
import { conversationManager } from '@/utils/ai-assistant/conversationManager';
import { agentRouter } from '@/skills/ai-assistant/agent-router';
import { actionExecutor } from '@/utils/ai-assistant/actionExecutor';
import { Message, ActionConfirmConfig } from '@/types/ai-assistant';

interface ChatDialogProps {
  onClose: () => void;
}

export default function ChatDialog({ onClose }: ChatDialogProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string>('');
  const [isTyping, setIsTyping] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<ActionConfirmConfig | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 初始化对话
  useEffect(() => {
    const conversation = conversationManager.getOrCreateCurrentConversation();
    setConversationId(conversation.id);

    // 🔥 修复：区分新对话和已有对话
    if (conversation.messages.length === 0) {
      const welcomeMessage = conversationManager.addMessage(
        conversation.id,
        'assistant',
        '您好！我是商户健康管理助手 👋\n\n我可以帮您:\n- 查询商户健康度和经营状况\n- 诊断商户风险和问题\n- 推荐帮扶方案和措施\n- 创建帮扶任务和通知\n\n请告诉我您想了解哪个商户的情况？',
        { dataSource: 'skills' }
      );
      setMessages([welcomeMessage]); // 新对话：仅欢迎消息
    } else {
      setMessages(conversation.messages); // 已有对话：加载所有消息
    }
  }, []);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // 处理用户输入
  const handleSendMessage = async (userInput: string) => {
    if (!userInput.trim() || !conversationId) return;

    // 添加用户消息
    const userMessage = conversationManager.addMessage(
      conversationId,
      'user',
      userInput
    );
    setMessages((prev) => [...prev, userMessage]);

    // 显示打字动画
    setIsTyping(true);

    try {
      // 调用Agent处理
      const result = await agentRouter.process(userInput, conversationId);

      // 🔥 转换suggestedAction为suggestedActions数组格式（前端兼容）
      const metadata = { ...result.metadata };
      if (result.suggestedAction) {
        // 类型映射：后端navigate_* → 前端view_*
        const typeMap: Record<string, string> = {
          'navigate_health': 'view_health',
          'navigate_archives': 'view_archives',
          'navigate_knowledge': 'view_knowledge',
          'navigate_inspection': 'create_inspection',
          'navigate_task': 'create_task',
        };

        const mappedType = typeMap[result.suggestedAction.type] || result.suggestedAction.type;

        metadata.suggestedActions = [{
          type: mappedType,
          merchantId: result.suggestedAction.data?.merchantId,
          merchantName: result.suggestedAction.data?.merchantName,
        }];
      }

      // 添加助手消息
      const assistantMessage = conversationManager.addMessage(
        conversationId,
        'assistant',
        result.content,
        metadata
      );

      setMessages((prev) => [...prev, assistantMessage]);

      // 注意：不再自动执行 suggestedAction
      // 用户可以通过点击 ActionCard 来主动触发操作
    } catch (error) {
      console.error('Failed to process message:', error);
      const errorMessage = conversationManager.addMessage(
        conversationId,
        'assistant',
        '抱歉，处理您的请求时遇到了问题。请稍后再试。',
        { dataSource: 'skills' }
      );
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // 处理快捷操作
  const handleQuickAction = async (template: string) => {
    await handleSendMessage(template);
  };

  // 执行建议的操作
  const handleExecuteAction = async (action: any) => {
    try {
      await actionExecutor.executeAction(action, async (config) => {
        return await new Promise<boolean>((resolve) => {
          setConfirmConfig({
            ...config,
            onConfirm: () => {
              setConfirmConfig(null);
              resolve(true);
            },
            onCancel: () => {
              setConfirmConfig(null);
              resolve(false);
            },
          } as any);
        });
      });
    } catch (error) {
      console.error('Failed to execute action:', error);
    }
  };

  // 处理反馈
  const handleFeedback = (messageId: string, helpful: boolean, rating?: number) => {
    // 确保输入框不会被锁定
    setIsTyping(false);

    conversationManager.updateMessage(conversationId, messageId, {
      feedback: {
        helpful,
        rating,
        collectedAt: new Date().toISOString(),
      },
    });

    // 🔥 修复：仅更新指定消息，不重新加载整个列表
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              feedback: {
                helpful,
                rating,
                collectedAt: new Date().toISOString(),
              },
            }
          : msg
      )
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <MessageList
          messages={messages}
          onFeedback={handleFeedback}
        />
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* 快捷操作 */}
      {messages.length === 1 && (
        <div className="px-4 pb-2">
          <QuickActions onSelect={handleQuickAction} />
        </div>
      )}

      {/* 输入框 */}
      <div className="border-t border-gray-200 px-4 py-3">
        <InputBox onSend={handleSendMessage} disabled={isTyping} />
      </div>

      {/* 操作确认对话框 */}
      {confirmConfig && (
        <ActionConfirmation
          config={confirmConfig}
          onConfirm={(confirmConfig as any).onConfirm}
          onCancel={(confirmConfig as any).onCancel}
        />
      )}
    </div>
  );
}
