/**
 * 统一实体识别服务
 * 作为实体识别的唯一入口，整合多种识别策略
 */

import { Merchant } from '@/types';
import { ConversationContext } from '@/types/ai-assistant';
import { merchantDataManager } from '@/utils/merchantDataManager';

export interface EntityCandidate {
  merchantId: string;
  merchantName: string;
  confidence: number;
  source: 'exact_match' | 'fuzzy_match' | 'context' | 'llm';
  matchedText?: string;  // 匹配到的文本片段
}

export class EntityRecognitionService {
  /**
   * 统一入口：识别用户输入中的实体
   * 返回所有候选实体，按置信度排序
   */
  recognize(userInput: string, context?: ConversationContext): EntityCandidate[] {
    const candidates: EntityCandidate[] = [];

    // 策略1：精确匹配（最高优先级）
    const exactMatch = this.exactMatch(userInput);
    if (exactMatch) {
      candidates.push(exactMatch);
    }

    // 策略2：模糊匹配（去掉后缀）
    const fuzzyMatches = this.fuzzyMatch(userInput);
    candidates.push(...fuzzyMatches);

    // 策略3：部分匹配（包含关系）
    const partialMatches = this.partialMatch(userInput);
    candidates.push(...partialMatches);

    // 策略4：上下文推断（最低优先级，且需要满足条件）
    if (context && this.shouldUseContext(userInput, candidates)) {
      const contextMatch = this.contextMatch(context);
      if (contextMatch) {
        candidates.push(contextMatch);
      }
    }

    // 去重（同一个商户可能被多个策略匹配到）
    const uniqueCandidates = this.deduplicateCandidates(candidates);

    // 按置信度排序
    return uniqueCandidates.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * 策略1：精确匹配
   * 用户输入包含完整的商户名称
   */
  private exactMatch(userInput: string): EntityCandidate | null {
    const allMerchants = merchantDataManager.getAllMerchants();
    const normalized = this.normalize(userInput);

    for (const merchant of allMerchants) {
      const merchantName = this.normalize(merchant.name);
      if (normalized.includes(merchantName)) {
        return {
          merchantId: merchant.id,
          merchantName: merchant.name,
          confidence: 1.0,
          source: 'exact_match',
          matchedText: merchant.name
        };
      }
    }

    return null;
  }

  /**
   * 策略2：模糊匹配
   * 去掉商户名称的后缀（如"火锅"、"咖啡"），然后匹配
   */
  private fuzzyMatch(userInput: string): EntityCandidate[] {
    const candidates: EntityCandidate[] = [];
    const allMerchants = merchantDataManager.getAllMerchants();
    const normalized = this.normalize(userInput);

    const suffixes = [
      '火锅', '咖啡', '餐厅', '面包店', '甜品店', '奶茶店',
      '服装', '超市', '便利店', '书店', '花店',
      '珠宝', '黄金', '钻石', '翡翠', '玉器',
      '影院', '健身房', '美容院', '理发店', '药店',
      '店', '馆', '坊', '阁', '轩', '居', '廊', '城', '街',
      '专卖店', '专卖', '工厂', '工坊'
    ];

    for (const merchant of allMerchants) {
      const merchantName = this.normalize(merchant.name);
      const merchantCore = this.removeSuffixes(merchantName, suffixes);

      // 检查输入是否包含核心名称
      if (merchantCore.length >= 2 && normalized.includes(merchantCore)) {
        candidates.push({
          merchantId: merchant.id,
          merchantName: merchant.name,
          confidence: 0.85,
          source: 'fuzzy_match',
          matchedText: merchantCore
        });
      }
    }

    return candidates;
  }

  /**
   * 策略3：部分匹配
   * 计算输入和商户名称的相似度
   */
  private partialMatch(userInput: string): EntityCandidate[] {
    const candidates: EntityCandidate[] = [];
    const allMerchants = merchantDataManager.getAllMerchants();
    const normalized = this.normalize(userInput);

    for (const merchant of allMerchants) {
      const merchantName = this.normalize(merchant.name);

      // 计算匹配度
      let score = 0;

      // 商户名称包含在输入中
      if (normalized.includes(merchantName)) {
        score = merchantName.length / normalized.length;
      }
      // 输入包含在商户名称中
      else if (merchantName.includes(normalized)) {
        score = normalized.length / merchantName.length;
      }
      // 计算最长公共子串
      else {
        const lcs = this.longestCommonSubstring(normalized, merchantName);
        if (lcs.length >= 2) {
          score = lcs.length / Math.max(normalized.length, merchantName.length);
        }
      }

      // 动态阈值
      const threshold = this.calculateDynamicThreshold(normalized, merchantName);

      if (score > threshold) {
        candidates.push({
          merchantId: merchant.id,
          merchantName: merchant.name,
          confidence: score,
          source: 'fuzzy_match',
          matchedText: merchantName
        });
      }
    }

    return candidates;
  }

  /**
   * 策略4：上下文推断
   * 只有在真正省略主语时才使用上下文
   */
  private contextMatch(context: ConversationContext): EntityCandidate | null {
    const merchantId = context.merchantId;
    const merchantName = context.merchantName;

    if (!merchantId || !merchantName) {
      return null;
    }

    return {
      merchantId,
      merchantName,
      confidence: 0.6,
      source: 'context'
    };
  }

  /**
   * 判断是否应该使用上下文
   * 只有在以下情况下才使用上下文：
   * 1. 输入中没有明确的商户名称
   * 2. 输入是真正的省略主语（如"最近怎么样"、"有风险吗"）
   */
  private shouldUseContext(userInput: string, candidates: EntityCandidate[]): boolean {
    // 如果已经有高置信度的候选，不使用上下文
    if (candidates.some(c => c.confidence >= 0.8)) {
      return false;
    }

    // 检查是否是真正的省略主语
    return this.isPronounOrOmitted(userInput);
  }

  /**
   * 检查是否使用了代词或省略主语
   */
  private isPronounOrOmitted(input: string): boolean {
    const pronouns = ['它', '他', '她', '这个', '那个', '该', '这', '那', '这家', '那家'];
    const omissionPatterns = [
      /^(最近|近期|现在)?(怎么样|如何|怎样)/,
      /^有.*吗\??\s*$/,
      /^(是否|是不是|有没有)/,
      /^(需要|应该|可以|能否)/,
      /^(怎么|如何)(帮扶|解决|处理|改善)/,
      /^(查看|查询|看看|了解)/,
      /^(营收|健康度|风险|客流|满意度)/
    ];

    const hasPronouns = pronouns.some(p => input.includes(p));
    const hasOmission = omissionPatterns.some(pattern => pattern.test(input));

    return hasPronouns || hasOmission;
  }

  /**
   * 去重候选实体
   */
  private deduplicateCandidates(candidates: EntityCandidate[]): EntityCandidate[] {
    const map = new Map<string, EntityCandidate>();

    for (const candidate of candidates) {
      const existing = map.get(candidate.merchantId);

      // 如果不存在，或者新的置信度更高，则更新
      if (!existing || candidate.confidence > existing.confidence) {
        map.set(candidate.merchantId, candidate);
      }
    }

    return Array.from(map.values());
  }

  /**
   * 标准化文本
   */
  private normalize(text: string): string {
    const particlesToRemove = ['呢', '吧', '啊', '呀', '哦', '哈', '嘛', '咯'];
    let normalized = text;

    for (const particle of particlesToRemove) {
      normalized = normalized.replace(new RegExp(particle, 'g'), '');
    }

    return normalized
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

  /**
   * 计算最长公共子串
   */
  private longestCommonSubstring(str1: string, str2: string): string {
    const m = str1.length;
    const n = str2.length;
    let maxLength = 0;
    let endIndex = 0;

    const dp: number[][] = Array(m + 1)
      .fill(null)
      .map(() => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
          if (dp[i][j] > maxLength) {
            maxLength = dp[i][j];
            endIndex = i;
          }
        }
      }
    }

    return str1.substring(endIndex - maxLength, endIndex);
  }

  /**
   * 计算动态阈值
   */
  private calculateDynamicThreshold(input: string, merchantName: string): number {
    const inputLen = input.length;

    if (inputLen <= 3) return 0.6;
    if (inputLen >= 6) return 0.3;

    return 0.6 - (inputLen - 3) * 0.1;
  }
}

// 导出单例
export const entityRecognitionService = new EntityRecognitionService();
