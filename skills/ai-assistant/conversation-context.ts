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
  getContext(conversationId: string): ConversationContext | null {
    return conversationManager.getContext(conversationId);
  }

  /**
   * 更新上下文中的商户信息
   */
  updateMerchantContext(
    conversationId: string,
    merchantId: string,
    merchantName: string
  ): void {
    // Context is automatically updated when adding messages with metadata
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

    let summary = '';

    if (context.merchantId && context.merchantName) {
      summary += `当前讨论商户: ${context.merchantName}\n`;
    }

    if (context.lastIntent) {
      summary += `上一次操作: ${this.getIntentDescription(context.lastIntent)}\n`;
    }

    const recentTopics = this.extractTopics(context.recentMessages.map(m => m.content));
    if (recentTopics.length > 0) {
      summary += `讨论话题: ${recentTopics.join(', ')}\n`;
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
    };
    return descriptions[intent] || intent;
  }
}

// 导出单例实例
export const conversationContextManager = new ConversationContextManager();
