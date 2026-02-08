/**
 * 对话上下文管理器
 * 管理多轮对话的上下文信息
 */

import { ConversationContext, UserIntent } from '@/types/ai-assistant';
import { conversationManager } from '@/utils/ai-assistant/conversationManager';

export class ConversationContextManager {
  /**
   * 获取当前对话上下文
   */
  getContext(conversationId: string): ConversationContext {
    const baseContext = conversationManager.getContext(conversationId);
    if (!baseContext) {
      // 返回默认上下文
      return {
        conversationId,
        recentMessages: [],
        sessionStartTime: new Date().toISOString(),
        merchantStack: [],
        topicStack: [],
        intentHistory: [],
      };
    }

    // 🔥 修复：确保新字段有默认值
    return {
      ...baseContext,
      merchantStack: baseContext.merchantStack || [],
      topicStack: baseContext.topicStack || [],
      intentHistory: baseContext.intentHistory || [],
    };
  }

  /**
   * 🔥 简化：直接使用底层conversationManager的getCurrentMerchant
   * 它从messages的metadata中获取商户，自动持久化
   */
  getCurrentMerchant(conversationId: string): { id: string; name: string } | null {
    const merchant = conversationManager.getCurrentMerchant(conversationId);
    // 确保返回的对象有完整的 id 和 name
    if (merchant && merchant.id && merchant.name) {
      return { id: merchant.id, name: merchant.name };
    }
    return null;
  }

  /**
   * 🔥 废弃：不再需要pushMerchant，因为metadata会自动保存
   * 保留这个方法只是为了兼容性，但不做任何事情
   */
  pushMerchant(conversationId: string, merchantId: string, merchantName: string): void {
    // 不需要做任何事情，metadata会在addMessage时自动保存
    console.log('[ConversationContextManager] pushMerchant called, but using metadata mechanism');
  }

  /**
   * 🔥 废弃：不再需要pushIntent
   */
  pushIntent(conversationId: string, intent: UserIntent): void {
    // 不需要做任何事情，intent会在metadata中保存
    console.log('[ConversationContextManager] pushIntent called, but using metadata mechanism');
  }

  /**
   * 🔥 新增：推入话题到栈中
   */
  pushTopic(conversationId: string, topic: string): void {
    const context = this.getContext(conversationId);
    if (!context.topicStack) {
      context.topicStack = [];
    }

    // 避免重复推入相同话题
    if (context.topicStack[context.topicStack.length - 1] !== topic) {
      context.topicStack.push(topic);

      // 保持最近5个话题
      if (context.topicStack.length > 5) {
        context.topicStack = context.topicStack.slice(-5);
      }
    }
  }

  /**
   * 更新上下文中的商户信息
   */
  updateMerchantContext(
    conversationId: string,
    merchantId: string,
    merchantName: string
  ): void {
    this.pushMerchant(conversationId, merchantId, merchantName);
  }

  /**
   * 获取上下文中的商户
   */
  getMerchantFromContext(conversationId: string): { id?: string; name?: string } | null {
    return conversationManager.getCurrentMerchant(conversationId);
  }

  /**
   * 获取上一个意图
   */
  getLastIntent(conversationId: string): UserIntent | undefined {
    const context = this.getContext(conversationId);
    return context?.lastIntent;
  }

  /**
   * 检查是否需要商户信息
   */
  needsMerchantInfo(conversationId: string, currentIntent: UserIntent): boolean {
    // 这些意图需要商户信息
    const intentsNeedingMerchant: UserIntent[] = [
      'health_query',
      'risk_diagnosis',
      'solution_recommend',
      'data_query',
    ];

    if (!intentsNeedingMerchant.includes(currentIntent)) {
      return false;
    }

    // 检查上下文中是否有商户
    const merchant = this.getMerchantFromContext(conversationId);
    return !merchant || !merchant.id;
  }

  /**
   * 生成上下文摘要（用于LLM）
   */
  generateContextSummary(conversationId: string): string {
    const context = this.getContext(conversationId);
    if (!context) {
      return '';
    }

    let summary = '# 对话上下文\n\n';

    // 当前商户
    const currentMerchant = this.getCurrentMerchant(conversationId);
    if (currentMerchant) {
      summary += `**当前讨论商户**: ${currentMerchant.name}\n`;
    }

    // 意图流程
    if (context.intentHistory && context.intentHistory.length > 0) {
      const recentIntents = context.intentHistory
        .slice(-3)
        .map((i) => this.getIntentDescription(i.intent))
        .join(' → ');
      summary += `**意图流程**: ${recentIntents}\n`;
    }

    // 讨论话题
    if (context.topicStack && context.topicStack.length > 0) {
      summary += `**讨论话题**: ${context.topicStack.join(', ')}\n`;
    }

    // 最近话题（从消息中提取）
    const recentTopics = this.extractTopics(context.recentMessages.map((m) => m.content));
    if (recentTopics.length > 0) {
      summary += `**涉及关键词**: ${recentTopics.join(', ')}\n`;
    }

    return summary;
  }

  /**
   * 提取话题关键词
   */
  private extractTopics(messages: string[]): string[] {
    const keywords = ['健康度', '风险', '营收', '客流', '满意度', '方案', '帮扶'];
    const topics = new Set<string>();

    messages.forEach(msg => {
      keywords.forEach(keyword => {
        if (msg.includes(keyword)) {
          topics.add(keyword);
        }
      });
    });

    return Array.from(topics);
  }

  /**
   * 获取意图描述
   */
  private getIntentDescription(intent: UserIntent): string {
    const descriptions: Record<UserIntent, string> = {
      health_query: '查询健康度',
      risk_diagnosis: '风险诊断',
      solution_recommend: '方案推荐',
      data_query: '数据查询',
      general_chat: '通用对话',
      unknown: '未知',
      // ⭐v3.0 new intents
      aggregation_query: '聚合查询',
      risk_statistics: '风险统计',
      health_overview: '健康度总览',
      comparison_query: '对比查询',
      trend_analysis: '趋势分析',
      composite_query: '复合查询',
    };
    return descriptions[intent] || intent;
  }
}

// 导出单例实例
export const conversationContextManager = new ConversationContextManager();
