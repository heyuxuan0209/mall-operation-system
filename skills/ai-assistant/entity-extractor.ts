/**
 * 实体提取器
 * 从用户输入中提取商户名称等实体信息
 */

import { EntityResult, EntityError } from '@/types/ai-assistant';
import { Merchant } from '@/types';
import { merchantDataManager } from '@/utils/merchantDataManager';

export class EntityExtractor {
  /**
   * 从用户输入中提取商户信息
   */
  extractMerchant(userInput: string, contextMerchantId?: string): EntityResult {
    if (!userInput || userInput.trim().length === 0) {
      // 如果有上下文中的商户，返回它
      if (contextMerchantId) {
        const merchant = merchantDataManager.getMerchant(contextMerchantId);
        if (merchant) {
          return {
            merchantId: merchant.id,
            merchantName: merchant.name,
            confidence: 0.8,
            matched: true,
          };
        }
      }

      return {
        confidence: 0,
        matched: false,
      };
    }

    const normalizedInput = this.normalize(userInput);
    const allMerchants = merchantDataManager.getAllMerchants();

    // 步骤1: 精确匹配商户名称
    for (const merchant of allMerchants) {
      const normalizedMerchantName = this.normalize(merchant.name);
      if (normalizedInput.includes(normalizedMerchantName)) {
        return {
          merchantId: merchant.id,
          merchantName: merchant.name,
          confidence: 1.0,
          matched: true,
        };
      }
    }

    // 步骤2: 模糊匹配（去掉后缀词）
    const fuzzyResult = this.fuzzyMatch(normalizedInput, allMerchants);
    if (fuzzyResult) {
      return fuzzyResult;
    }

    // 步骤3: 部分匹配
    const partialResult = this.partialMatch(normalizedInput, allMerchants);
    if (partialResult) {
      return partialResult;
    }

    // 步骤4: 检查是否使用了上下文
    if (contextMerchantId) {
      const merchant = merchantDataManager.getMerchant(contextMerchantId);
      if (merchant) {
        // 如果输入中有代词或省略商户名称，使用上下文商户
        if (this.isPronounOrOmitted(normalizedInput)) {
          return {
            merchantId: merchant.id,
            merchantName: merchant.name,
            confidence: 0.7,
            matched: true,
          };
        }
      }
    }

    // 未找到匹配
    return {
      confidence: 0,
      matched: false,
    };
  }

  /**
   * 模糊匹配（去掉常见后缀）
   */
  private fuzzyMatch(input: string, merchants: Merchant[]): EntityResult | null {
    // 常见的商户类型后缀
    const suffixes = [
      '火锅', '咖啡', '餐厅', '服装', '超市', '便利店',
      '书店', '影院', '健身房', '美容院', '理发店',
      '药店', '花店', '面包店', '甜品店', '奶茶店',
      '店', '馆', '坊', '阁', '轩', '居'
    ];

    for (const merchant of merchants) {
      let merchantCore = this.normalize(merchant.name);

      // 尝试移除后缀
      for (const suffix of suffixes) {
        merchantCore = merchantCore.replace(new RegExp(suffix + '$'), '');
      }

      // 检查输入是否包含核心名称
      if (merchantCore.length >= 2 && input.includes(merchantCore)) {
        return {
          merchantId: merchant.id,
          merchantName: merchant.name,
          confidence: 0.85,
          matched: true,
        };
      }

      // 检查核心名称是否在输入中
      const inputCore = this.removeCommonSuffixes(input, suffixes);
      if (inputCore.length >= 2 && merchantCore === inputCore) {
        return {
          merchantId: merchant.id,
          merchantName: merchant.name,
          confidence: 0.85,
          matched: true,
        };
      }
    }

    return null;
  }

  /**
   * 部分匹配（包含关系）
   */
  private partialMatch(input: string, merchants: Merchant[]): EntityResult | null {
    const matches: { merchant: Merchant; score: number }[] = [];

    for (const merchant of merchants) {
      const merchantName = this.normalize(merchant.name);

      // 计算匹配度
      let score = 0;

      // 商户名称包含在输入中
      if (input.includes(merchantName)) {
        score = merchantName.length / input.length;
      }
      // 输入包含在商户名称中
      else if (merchantName.includes(input)) {
        score = input.length / merchantName.length;
      }
      // 计算公共子串长度
      else {
        const lcs = this.longestCommonSubstring(input, merchantName);
        if (lcs.length >= 2) {
          score = lcs.length / Math.max(input.length, merchantName.length);
        }
      }

      if (score > 0.5) {
        matches.push({ merchant, score });
      }
    }

    if (matches.length === 0) {
      return null;
    }

    // 按得分排序
    matches.sort((a, b) => b.score - a.score);
    const bestMatch = matches[0];

    return {
      merchantId: bestMatch.merchant.id,
      merchantName: bestMatch.merchant.name,
      confidence: bestMatch.score,
      matched: true,
    };
  }

  /**
   * 检查是否使用了代词或省略
   */
  private isPronounOrOmitted(input: string): boolean {
    const pronouns = ['它', '他', '这个', '那个', '该', '这', '那'];
    return pronouns.some((p) => input.includes(p));
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
   * 移除常见后缀
   */
  private removeCommonSuffixes(text: string, suffixes: string[]): string {
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
   * 提取多个商户
   */
  extractMultipleMerchants(userInput: string): EntityResult[] {
    const normalizedInput = this.normalize(userInput);
    const allMerchants = merchantDataManager.getAllMerchants();
    const results: EntityResult[] = [];

    for (const merchant of allMerchants) {
      const normalizedMerchantName = this.normalize(merchant.name);
      if (normalizedInput.includes(normalizedMerchantName)) {
        results.push({
          merchantId: merchant.id,
          merchantName: merchant.name,
          confidence: 1.0,
          matched: true,
        });
      }
    }

    return results;
  }

  /**
   * 验证商户是否存在
   */
  validateMerchant(merchantId: string): boolean {
    return merchantDataManager.getMerchant(merchantId) !== undefined;
  }

  /**
   * 获取商户建议（用于自动补全）
   */
  suggestMerchants(partialName: string, limit: number = 5): Merchant[] {
    const normalized = this.normalize(partialName);
    const allMerchants = merchantDataManager.getAllMerchants();

    const matches = allMerchants
      .map((merchant) => {
        const merchantName = this.normalize(merchant.name);
        let score = 0;

        if (merchantName.startsWith(normalized)) {
          score = 100;
        } else if (merchantName.includes(normalized)) {
          score = 50;
        } else {
          const lcs = this.longestCommonSubstring(normalized, merchantName);
          score = (lcs.length / normalized.length) * 30;
        }

        return { merchant, score };
      })
      .filter((m) => m.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((m) => m.merchant);

    return matches;
  }

  /**
   * 从文本中提取其他实体（如日期、数字等）
   */
  extractOtherEntities(userInput: string): {
    dates?: string[];
    numbers?: number[];
    keywords?: string[];
  } {
    const result: {
      dates?: string[];
      numbers?: number[];
      keywords?: string[];
    } = {};

    // 提取日期表达式
    const datePatterns = [
      /(\d{4})年/g,
      /(\d{1,2})月/g,
      /(\d{1,2})日/g,
      /最近|近期|当前|现在|今天|昨天|上周|上月|本周|本月/g,
    ];

    const dates: string[] = [];
    for (const pattern of datePatterns) {
      const matches = userInput.match(pattern);
      if (matches) {
        dates.push(...matches);
      }
    }

    if (dates.length > 0) {
      result.dates = dates;
    }

    // 提取数字
    const numberPattern = /\d+(\.\d+)?/g;
    const numberMatches = userInput.match(numberPattern);
    if (numberMatches) {
      result.numbers = numberMatches.map((n) => parseFloat(n));
    }

    // 提取关键词（简单实现）
    const keywords = ['营收', '收入', '客流', '满意度', '租金', '成本'];
    const foundKeywords = keywords.filter((k) => userInput.includes(k));
    if (foundKeywords.length > 0) {
      result.keywords = foundKeywords;
    }

    return result;
  }
}

// 导出单例实例
export const entityExtractor = new EntityExtractor();
