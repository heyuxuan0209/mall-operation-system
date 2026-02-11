/**
 * 实体消歧服务
 * 处理多个候选实体的消歧逻辑，实现"不确定时询问用户"机制
 */

import { EntityCandidate } from './entity-recognition-service';
import { ConversationContext } from '@/types/ai-assistant';

export interface DisambiguationResult {
  matched: boolean;
  merchantId?: string;
  merchantName?: string;
  confidence: number;
  needsClarification?: boolean;
  clarificationPrompt?: string;
  candidates?: EntityCandidate[];
  reason?: string;
}

export class EntityDisambiguationService {
  /**
   * 消歧：从多个候选中选择最合适的实体
   */
  disambiguate(
    candidates: EntityCandidate[],
    userInput: string,
    context?: ConversationContext
  ): DisambiguationResult {
    // 情况1：没有候选
    if (candidates.length === 0) {
      return {
        matched: false,
        confidence: 0,
        reason: '未找到匹配的商户'
      };
    }

    // 情况2：只有一个候选
    if (candidates.length === 1) {
      const candidate = candidates[0];
      return {
        matched: true,
        merchantId: candidate.merchantId,
        merchantName: candidate.merchantName,
        confidence: candidate.confidence,
        reason: `唯一候选，来源：${this.getSourceDescription(candidate.source)}`
      };
    }

    // 情况3：多个候选，需要消歧
    return this.resolveMultipleCandidates(candidates, userInput, context);
  }

  /**
   * 处理多个候选的情况
   */
  private resolveMultipleCandidates(
    candidates: EntityCandidate[],
    userInput: string,
    context?: ConversationContext
  ): DisambiguationResult {
    const best = candidates[0];
    const second = candidates[1];

    // 策略1：如果最高分和次高分差距很大（>0.3），直接返回最高分
    if (best.confidence - second.confidence > 0.3) {
      return {
        matched: true,
        merchantId: best.merchantId,
        merchantName: best.merchantName,
        confidence: best.confidence,
        reason: `最高置信度候选，显著优于其他候选（差距${((best.confidence - second.confidence) * 100).toFixed(0)}%）`
      };
    }

    // 策略2：如果最高分是精确匹配，优先选择
    if (best.source === 'exact_match' && best.confidence >= 0.9) {
      return {
        matched: true,
        merchantId: best.merchantId,
        merchantName: best.merchantName,
        confidence: best.confidence,
        reason: '精确匹配，优先选择'
      };
    }

    // 策略3：如果最高分来自上下文，但次高分来自用户输入，优先选择次高分
    if (best.source === 'context' && second.source !== 'context') {
      return {
        matched: true,
        merchantId: second.merchantId,
        merchantName: second.merchantName,
        confidence: second.confidence,
        reason: '用户明确提到的商户优先于上下文推断'
      };
    }

    // 策略4：差距小且都不是精确匹配，需要询问用户
    if (best.confidence < 0.85) {
      return {
        matched: false,
        confidence: 0,
        needsClarification: true,
        candidates: candidates.slice(0, 3), // 最多显示3个候选
        clarificationPrompt: this.generateClarificationPrompt(candidates.slice(0, 3)),
        reason: '多个候选置信度接近，需要用户确认'
      };
    }

    // 策略5：默认返回最高分，但标注不确定
    return {
      matched: true,
      merchantId: best.merchantId,
      merchantName: best.merchantName,
      confidence: best.confidence,
      reason: '选择最高置信度候选，但存在其他可能'
    };
  }

  /**
   * 生成消歧提示
   */
  private generateClarificationPrompt(candidates: EntityCandidate[]): string {
    const options = candidates.map((c, i) => `${i + 1}. ${c.merchantName}`).join('\n');

    return `⚠️ 我不太确定您指的是哪个商户，请选择：\n\n${options}\n\n或者直接告诉我完整的商户名称。`;
  }

  /**
   * 获取来源描述
   */
  private getSourceDescription(source: EntityCandidate['source']): string {
    const descriptions = {
      exact_match: '精确匹配',
      fuzzy_match: '模糊匹配',
      context: '上下文推断',
      llm: 'AI理解'
    };
    return descriptions[source] || '未知';
  }

  /**
   * 验证消歧结果的合理性
   */
  validateResult(result: DisambiguationResult, userInput: string): {
    valid: boolean;
    warning?: string;
  } {
    // 如果置信度很低但仍然匹配，给出警告
    if (result.matched && result.confidence < 0.5) {
      return {
        valid: true,
        warning: '⚠️ 提示：我对这个理解不太确定，如果不对请告诉我。'
      };
    }

    // 如果需要消歧但没有候选，说明有问题
    if (result.needsClarification && (!result.candidates || result.candidates.length === 0)) {
      return {
        valid: false,
        warning: '❌ 系统错误：需要消歧但没有候选实体'
      };
    }

    return { valid: true };
  }

  /**
   * 根据用户选择解析实体
   * 用于处理用户对消歧提示的回复
   */
  parseUserChoice(
    userChoice: string,
    candidates: EntityCandidate[]
  ): DisambiguationResult | null {
    // 尝试解析数字选择（如"1"、"2"）
    const numberMatch = userChoice.match(/^(\d+)$/);
    if (numberMatch) {
      const index = parseInt(numberMatch[1]) - 1;
      if (index >= 0 && index < candidates.length) {
        const selected = candidates[index];
        return {
          matched: true,
          merchantId: selected.merchantId,
          merchantName: selected.merchantName,
          confidence: 1.0,
          reason: '用户明确选择'
        };
      }
    }

    // 尝试匹配商户名称
    for (const candidate of candidates) {
      if (userChoice.includes(candidate.merchantName)) {
        return {
          matched: true,
          merchantId: candidate.merchantId,
          merchantName: candidate.merchantName,
          confidence: 1.0,
          reason: '用户明确指定商户名称'
        };
      }
    }

    return null;
  }
}

// 导出单例
export const entityDisambiguationService = new EntityDisambiguationService();
