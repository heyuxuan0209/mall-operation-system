/**
 * 上下文切换检测器
 * 检测用户是否想切换商户，实现显式上下文切换机制
 */

import { ConversationContext } from '@/types/ai-assistant';
import { merchantDataManager } from '@/utils/merchantDataManager';

export interface ContextSwitchDetection {
  shouldSwitch: boolean;
  newMerchantId?: string;
  newMerchantName?: string;
  confidence: number;
  reason: string;
}

export class ContextSwitchDetector {
  /**
   * 检测是否需要切换上下文
   */
  detectSwitch(
    userInput: string,
    currentContext?: ConversationContext
  ): ContextSwitchDetection {
    // 规则1：用户明确提到新商户名称
    const mentionedMerchant = this.extractMerchantMention(userInput);

    if (mentionedMerchant) {
      // 检查是否与当前上下文不同
      if (!currentContext?.merchantName || currentContext.merchantName !== mentionedMerchant.name) {
        return {
          shouldSwitch: true,
          newMerchantId: mentionedMerchant.id,
          newMerchantName: mentionedMerchant.name,
          confidence: 0.95,
          reason: `用户明确提到了新商户"${mentionedMerchant.name}"`
        };
      }
    }

    // 规则2：用户使用切换词
    const switchKeywords = ['换', '其他', '另一个', '别的', '换个', '看看别的'];
    if (switchKeywords.some(kw => userInput.includes(kw))) {
      return {
        shouldSwitch: true,
        confidence: 0.8,
        reason: '用户使用了切换关键词'
      };
    }

    // 规则3：用户使用对比词（暗示要讨论多个商户）
    const comparisonKeywords = ['对比', '比较', 'vs', '和', '跟'];
    if (comparisonKeywords.some(kw => userInput.includes(kw))) {
      return {
        shouldSwitch: false,
        confidence: 0.9,
        reason: '用户想进行对比，不是切换上下文'
      };
    }

    return {
      shouldSwitch: false,
      confidence: 1.0,
      reason: '无切换意图'
    };
  }

  /**
   * 提取用户提到的商户
   */
  private extractMerchantMention(userInput: string): { id: string; name: string } | null {
    const allMerchants = merchantDataManager.getAllMerchants();
    const normalized = this.normalize(userInput);

    // 精确匹配
    for (const merchant of allMerchants) {
      const merchantName = this.normalize(merchant.name);
      if (normalized.includes(merchantName)) {
        return { id: merchant.id, name: merchant.name };
      }
    }

    // 模糊匹配（去掉后缀）
    const suffixes = ['火锅', '咖啡', '餐厅', '店', '馆'];
    for (const merchant of allMerchants) {
      const merchantName = this.normalize(merchant.name);
      const core = this.removeSuffixes(merchantName, suffixes);
      if (core.length >= 2 && normalized.includes(core)) {
        return { id: merchant.id, name: merchant.name };
      }
    }

    return null;
  }

  /**
   * 标准化文本
   */
  private normalize(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '')
      .replace(/[，。！？；：""''（）【】《》]/g, '');
  }

  /**
   * 移除后缀
   */
  private removeSuffixes(text: string, suffixes: string[]): string {
    let result = text;
    for (const suffix of suffixes) {
      result = result.replace(new RegExp(suffix + '$'), '');
    }
    return result;
  }
}

// 导出单例
export const contextSwitchDetector = new ContextSwitchDetector();
