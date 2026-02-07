/**
 * 对话管理器
 * 管理对话历史，支持多轮对话上下文
 */

import {
  Conversation,
  Message,
  MessageRole,
  MessageMetadata,
  ConversationStatus,
  ConversationContext,
} from '@/types/ai-assistant';

export class ConversationManager {
  private readonly STORAGE_KEY = 'ai_assistant_conversations';
  private readonly MAX_CONVERSATIONS = 50;
  private readonly MAX_MESSAGES_PER_CONVERSATION = 100;
  private currentConversationId: string | null = null;

  /**
   * 创建新对话
   */
  createConversation(merchantId?: string): Conversation {
    const conversation: Conversation = {
      id: this.generateId(),
      startedAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString(),
      merchantId,
      messages: [],
      status: 'active',
    };

    this.saveConversation(conversation);
    this.currentConversationId = conversation.id;

    return conversation;
  }

  /**
   * 获取当前对话
   */
  getCurrentConversation(): Conversation | null {
    if (!this.currentConversationId) {
      return null;
    }
    return this.getConversation(this.currentConversationId);
  }

  /**
   * 获取或创建当前对话
   */
  getOrCreateCurrentConversation(merchantId?: string): Conversation {
    let conversation = this.getCurrentConversation();

    if (!conversation) {
      conversation = this.createConversation(merchantId);
    }

    return conversation;
  }

  /**
   * 获取对话
   */
  getConversation(conversationId: string): Conversation | null {
    const conversations = this.getConversations();
    return conversations.find((c) => c.id === conversationId) || null;
  }

  /**
   * 获取所有对话
   */
  getConversations(): Conversation[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get conversations:', error);
      return [];
    }
  }

  /**
   * 保存对话
   */
  private saveConversation(conversation: Conversation): void {
    try {
      let conversations = this.getConversations();

      // 更新或添加对话
      const index = conversations.findIndex((c) => c.id === conversation.id);
      if (index >= 0) {
        conversations[index] = conversation;
      } else {
        conversations.push(conversation);
      }

      // 限制对话数量
      if (conversations.length > this.MAX_CONVERSATIONS) {
        // 删除最旧的已归档对话
        conversations = conversations
          .sort((a, b) => {
            if (a.status === 'active' && b.status === 'archived') return -1;
            if (a.status === 'archived' && b.status === 'active') return 1;
            return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
          })
          .slice(0, this.MAX_CONVERSATIONS);
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(conversations));
    } catch (error) {
      console.error('Failed to save conversation:', error);
    }
  }

  /**
   * 添加消息
   */
  addMessage(
    conversationId: string,
    role: MessageRole,
    content: string,
    metadata?: MessageMetadata
  ): Message {
    const conversation = this.getConversation(conversationId);
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    const message: Message = {
      id: this.generateId(),
      conversationId,
      role,
      content,
      timestamp: new Date().toISOString(),
      metadata,
    };

    conversation.messages.push(message);
    conversation.lastMessageAt = message.timestamp;

    // 更新 merchantId（如果消息包含）
    if (metadata?.merchantId && !conversation.merchantId) {
      conversation.merchantId = metadata.merchantId;
    }

    // 限制消息数量
    if (conversation.messages.length > this.MAX_MESSAGES_PER_CONVERSATION) {
      conversation.messages = conversation.messages.slice(-this.MAX_MESSAGES_PER_CONVERSATION);
    }

    this.saveConversation(conversation);

    return message;
  }

  /**
   * 更新消息
   */
  updateMessage(
    conversationId: string,
    messageId: string,
    updates: Partial<Message>
  ): Message | null {
    const conversation = this.getConversation(conversationId);
    if (!conversation) {
      return null;
    }

    const messageIndex = conversation.messages.findIndex((m) => m.id === messageId);
    if (messageIndex < 0) {
      return null;
    }

    conversation.messages[messageIndex] = {
      ...conversation.messages[messageIndex],
      ...updates,
    };

    this.saveConversation(conversation);

    return conversation.messages[messageIndex];
  }

  /**
   * 获取对话上下文
   */
  getContext(conversationId: string): ConversationContext | null {
    const conversation = this.getConversation(conversationId);
    if (!conversation) {
      return null;
    }

    const recentMessages = conversation.messages.slice(-10); // 最近10条消息
    const lastMessage = recentMessages[recentMessages.length - 1];

    return {
      conversationId,
      merchantId: conversation.merchantId,
      merchantName: lastMessage?.metadata?.merchantName,
      lastIntent: lastMessage?.metadata?.intent,
      recentMessages,
      sessionStartTime: conversation.startedAt,
    };
  }

  /**
   * 从上下文中获取当前商户
   */
  getCurrentMerchant(conversationId: string): { id?: string; name?: string } | null {
    const context = this.getContext(conversationId);
    if (!context) {
      return null;
    }

    // 从最近的消息中查找商户信息
    for (let i = context.recentMessages.length - 1; i >= 0; i--) {
      const message = context.recentMessages[i];
      if (message.metadata?.merchantId) {
        return {
          id: message.metadata.merchantId,
          name: message.metadata.merchantName,
        };
      }
    }

    return null;
  }

  /**
   * 归档对话
   */
  archiveConversation(conversationId: string): boolean {
    const conversation = this.getConversation(conversationId);
    if (!conversation) {
      return false;
    }

    conversation.status = 'archived';
    this.saveConversation(conversation);

    if (this.currentConversationId === conversationId) {
      this.currentConversationId = null;
    }

    return true;
  }

  /**
   * 删除对话
   */
  deleteConversation(conversationId: string): boolean {
    try {
      let conversations = this.getConversations();
      const initialLength = conversations.length;

      conversations = conversations.filter((c) => c.id !== conversationId);

      if (conversations.length < initialLength) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(conversations));

        if (this.currentConversationId === conversationId) {
          this.currentConversationId = null;
        }

        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      return false;
    }
  }

  /**
   * 清空所有对话
   */
  clearAllConversations(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.currentConversationId = null;
  }

  /**
   * 获取对话统计信息
   */
  getStats() {
    const conversations = this.getConversations();
    const activeConversations = conversations.filter((c) => c.status === 'active');
    const totalMessages = conversations.reduce((sum, c) => sum + c.messages.length, 0);

    const messagesWithFeedback = conversations.reduce(
      (sum, c) => sum + c.messages.filter((m) => m.feedback).length,
      0
    );

    return {
      totalConversations: conversations.length,
      activeConversations: activeConversations.length,
      archivedConversations: conversations.length - activeConversations.length,
      totalMessages,
      averageMessagesPerConversation: conversations.length > 0
        ? totalMessages / conversations.length
        : 0,
      messagesWithFeedback,
      feedbackRate: totalMessages > 0 ? messagesWithFeedback / totalMessages : 0,
    };
  }

  /**
   * 清理旧对话（保留最近30天）
   */
  cleanupOldConversations(): number {
    try {
      const conversations = this.getConversations();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const filteredConversations = conversations.filter((c) => {
        // 保留活跃对话或最近30天的对话
        return (
          c.status === 'active' ||
          new Date(c.lastMessageAt) > thirtyDaysAgo
        );
      });

      const removed = conversations.length - filteredConversations.length;

      if (removed > 0) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredConversations));
      }

      return removed;
    } catch (error) {
      console.error('Failed to cleanup old conversations:', error);
      return 0;
    }
  }

  /**
   * 生成唯一 ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 设置当前对话
   */
  setCurrentConversation(conversationId: string): boolean {
    const conversation = this.getConversation(conversationId);
    if (!conversation) {
      return false;
    }

    this.currentConversationId = conversationId;
    return true;
  }

  /**
   * 开始新对话
   */
  startNewConversation(merchantId?: string): Conversation {
    // 归档当前对话
    if (this.currentConversationId) {
      this.archiveConversation(this.currentConversationId);
    }

    // 创建新对话
    return this.createConversation(merchantId);
  }
}

// 导出单例实例
export const conversationManager = new ConversationManager();
