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
      archive_query: '历史档案查询',  // 添加缺失的字段
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

// ============================================
// ⭐ v3.0 增强上下文理解 (Iteration 3)
// ============================================

/**
 * 用户偏好
 */
export interface UserPreference {
  responseStyle: 'detailed' | 'concise' | 'auto'; // 响应风格
  feedbackCount: number;                          // 反馈次数
  lastUpdated: string;                            // 最后更新时间
}

/**
 * v3.0 增强的上下文管理器
 *
 * 新增功能：
 * - 指代消解（"它" → "海底捞"）
 * - 省略补全（"最近怎么样" → "海底捞最近怎么样"）
 * - 用户偏好学习
 */
export class EnhancedContextManager extends ConversationContextManager {
  private userPreferences: Map<string, UserPreference> = new Map();

  /**
   * ⭐ 指代消解：将指代词替换为具体实体
   *
   * 支持的指代词：
   * - 它、这家店、那家店、这个、那个
   * - 他们、这些商户
   */
  resolveReferences(
    conversationId: string,
    userInput: string
  ): string {
    const references = ['它', '这家店', '那家店', '这个', '那个', '该店', '此店'];

    // 检查是否包含指代词
    const hasReference = references.some(ref => userInput.includes(ref));
    if (!hasReference) {
      return userInput; // 无需处理
    }

    // 获取当前上下文商户
    const currentMerchant = this.getCurrentMerchant(conversationId);
    if (!currentMerchant) {
      return userInput; // 无法解析
    }

    // 替换指代词
    let resolved = userInput;
    references.forEach(ref => {
      resolved = resolved.replace(new RegExp(ref, 'g'), currentMerchant.name);
    });

    console.log('[EnhancedContext] Reference resolved:', userInput, '→', resolved);
    return resolved;
  }

  /**
   * ⭐ 省略补全：检测并补全省略的主语
   *
   * 检测模式：
   * - "最近怎么样" → "海底捞最近怎么样"
   * - "有风险吗" → "海底捞有风险吗"
   * - "怎么帮扶" → "怎么帮扶海底捞"
   */
  completeOmission(
    conversationId: string,
    userInput: string
  ): { completed: string; wasOmitted: boolean } {
    // 🔥 修复：先检查输入中是否已经包含商户名称
    // 如果已经明确提到商户，则不应该进行省略补全
    const allMerchants = require('@/utils/merchantDataManager').merchantDataManager.getAllMerchants();
    const hasMerchantName = allMerchants.some((m: any) => {
      const merchantCore = m.name.replace(/(火锅|咖啡|餐厅|店|馆)$/, '');
      return userInput.includes(merchantCore) || userInput.includes(m.name);
    });

    if (hasMerchantName) {
      // 输入中已经包含商户名称，不需要补全
      return { completed: userInput, wasOmitted: false };
    }

    // 省略主语的常见模式
    const omissionPatterns = [
      /^(最近|近期|现在)?(怎么样|如何|怎样)/,           // "最近怎么样"
      /^有.*吗\??\s*$/,                                 // "有风险吗"
      /^(是否|是不是|有没有)/,                          // "是否有问题"
      /^(需要|应该|可以|能否)/,                         // "需要帮扶吗"
      /^(怎么|如何)(帮扶|解决|处理|改善)/,             // "怎么帮扶"
      /^(查看|查询|看看|了解)/,                         // "查看档案"
      /^(营收|健康度|风险|客流|满意度)/,               // "营收怎么样"
    ];

    const hasOmission = omissionPatterns.some(pattern => pattern.test(userInput));

    if (!hasOmission) {
      return { completed: userInput, wasOmitted: false };
    }

    // 获取当前上下文商户
    const currentMerchant = this.getCurrentMerchant(conversationId);
    if (!currentMerchant) {
      return { completed: userInput, wasOmitted: false }; // 无法补全
    }

    // 智能补全
    let completed: string;

    if (/^(怎么|如何)(帮扶|解决|处理|改善)/.test(userInput)) {
      // "怎么帮扶" → "怎么帮扶海底捞"
      completed = userInput.replace(/^(怎么|如何)(帮扶|解决|处理|改善)/, `$1$2${currentMerchant.name}`);
    } else if (/^(查看|查询|看看|了解)/.test(userInput)) {
      // "查看档案" → "查看海底捞的档案"
      completed = userInput.replace(/^(查看|查询|看看|了解)/, `$1${currentMerchant.name}的`);
    } else {
      // 其他情况：在开头添加商户名
      completed = `${currentMerchant.name}${userInput}`;
    }

    console.log('[EnhancedContext] Omission completed:', userInput, '→', completed);
    return { completed, wasOmitted: true };
  }

  /**
   * ⭐ 用户偏好学习：基于反馈学习用户偏好
   */
  updateUserPreference(
    conversationId: string,
    feedbackType: 'helpful' | 'not_helpful',
    messageLength: number
  ): void {
    const pref = this.userPreferences.get(conversationId) || {
      responseStyle: 'auto',
      feedbackCount: 0,
      lastUpdated: new Date().toISOString(),
    };

    pref.feedbackCount++;

    // 学习规则：
    // - 如果用户对简短回答点赞 → 偏好简洁
    // - 如果用户对详细回答点赞 → 偏好详细
    if (feedbackType === 'helpful') {
      if (messageLength < 500) {
        pref.responseStyle = 'concise';
      } else if (messageLength > 1000) {
        pref.responseStyle = 'detailed';
      }
    }

    pref.lastUpdated = new Date().toISOString();
    this.userPreferences.set(conversationId, pref);

    console.log('[EnhancedContext] User preference updated:', pref);
  }

  /**
   * 获取用户偏好
   */
  getUserPreference(conversationId: string): UserPreference {
    return this.userPreferences.get(conversationId) || {
      responseStyle: 'auto',
      feedbackCount: 0,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * ⭐ 综合处理：指代消解 + 省略补全
   *
   * 这是推荐的入口方法，会自动应用所有增强
   */
  enhanceUserInput(
    conversationId: string,
    userInput: string
  ): { enhanced: string; applied: string[] } {
    const applied: string[] = [];
    let enhanced = userInput;

    // Step 1: 指代消解
    const resolved = this.resolveReferences(conversationId, enhanced);
    if (resolved !== enhanced) {
      applied.push('指代消解');
      enhanced = resolved;
    }

    // Step 2: 省略补全
    const { completed, wasOmitted } = this.completeOmission(conversationId, enhanced);
    if (wasOmitted) {
      applied.push('省略补全');
      enhanced = completed;
    }

    if (applied.length > 0) {
      console.log('[EnhancedContext] Input enhanced:', {
        original: userInput,
        enhanced,
        applied,
      });
    }

    return { enhanced, applied };
  }

  /**
   * 生成增强的上下文摘要（包含偏好信息）
   */
  generateEnhancedSummary(conversationId: string): string {
    const baseSummary = this.generateContextSummary(conversationId);
    const preference = this.getUserPreference(conversationId);

    let summary = baseSummary;

    if (preference.feedbackCount > 0) {
      summary += `\n**用户偏好**: ${this.getPreferenceDescription(preference.responseStyle)}`;
    }

    return summary;
  }

  /**
   * 获取偏好描述
   */
  private getPreferenceDescription(style: string): string {
    const descriptions: Record<string, string> = {
      detailed: '偏好详细回答',
      concise: '偏好简洁回答',
      auto: '自适应',
    };
    return descriptions[style] || '自适应';
  }
}

// 导出增强版单例实例
export const enhancedContextManager = new EnhancedContextManager();
