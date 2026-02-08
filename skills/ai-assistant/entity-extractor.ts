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
    // 常见的商户类型后缀（🔥 扩展珠宝相关后缀）
    const suffixes = [
      // 餐饮
      '火锅', '咖啡', '餐厅', '面包店', '甜品店', '奶茶店',
      // 零售
      '服装', '超市', '便利店', '书店', '花店',
      // 珠宝（🔥 新增）
      '珠宝', '黄金', '钻石', '翡翠', '玉器',
      // 服务
      '影院', '健身房', '美容院', '理发店', '药店',
      // 通用后缀
      '店', '馆', '坊', '阁', '轩', '居', '廊', '城', '街',
      '专卖店', '专卖', '工厂', '工坊',
    ];

    // 🔥 正向匹配：去掉商户名后缀，检查是否在输入中
    for (const merchant of merchants) {
      let merchantCore = this.removeSuffixes(this.normalize(merchant.name), suffixes);

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
      const inputCore = this.removeSuffixes(input, suffixes);
      if (inputCore.length >= 2 && merchantCore === inputCore) {
        return {
          merchantId: merchant.id,
          merchantName: merchant.name,
          confidence: 0.85,
          matched: true,
        };
      }
    }

    // 🔥 新增：反向匹配 - 从输入中提取关键词，检查商户名是否包含
    const inputKeywords = this.extractKeywords(input);
    for (const merchant of merchants) {
      const merchantCore = this.removeSuffixes(this.normalize(merchant.name), suffixes);

      for (const keyword of inputKeywords) {
        if (keyword.length >= 2 && merchantCore.includes(keyword)) {
          return {
            merchantId: merchant.id,
            merchantName: merchant.name,
            confidence: 0.75,
            matched: true,
          };
        }
      }
    }

    return null;
  }

  /**
   * 🔥 新增：从输入中提取关键词（支持汉字分割）
   */
  private extractKeywords(text: string): string[] {
    const excludeWords = [
      '最近', '一周', '两周', '一个月', '三个月', '半年', '一年',
      '怎么样', '如何', '怎样', '咋样', '表现', '经营',
      '的', '了', '吗', '呢', '啊', '吧',
      '有', '没有', '什么', '哪个', '哪家',
    ];

    // 方法1：空格/标点分割
    const words = text.split(/[\s,，、。？！]/);
    const validWords = words.filter((w) => w.length >= 2 && !excludeWords.includes(w));

    // 方法2：汉字N-gram（针对连续汉字）
    const chineseText = text.replace(/[^\u4e00-\u9fa5]/g, ''); // 提取纯汉字
    const ngrams: string[] = [];

    // 2-gram和3-gram
    for (let len = 2; len <= 3; len++) {
      for (let i = 0; i <= chineseText.length - len; i++) {
        const gram = chineseText.substring(i, i + len);
        if (!excludeWords.includes(gram)) {
          ngrams.push(gram);
        }
      }
    }

    // 合并去重
    return [...new Set([...validWords, ...ngrams])];
  }

  /**
   * 🔥 新增：移除多个后缀（提取为独立方法）
   */
  private removeSuffixes(text: string, suffixes: string[]): string {
    let result = text;
    for (const suffix of suffixes) {
      result = result.replace(new RegExp(suffix + '$'), '');
    }
    return result;
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

      // 🔥 新增：动态阈值
      const threshold = this.calculateDynamicThreshold(input, merchantName);

      if (score > threshold) {
        matches.push({ merchant, score });
      }
    }

    if (matches.length === 0) {
      return null;
    }

    // 按得分排序
    matches.sort((a, b) => b.score - a.score);
    const bestMatch = matches[0];

    // 🔥 新增：如果最高分和次高分差距小，返回null（歧义）
    if (matches.length > 1 && bestMatch.score - matches[1].score < 0.1) {
      return null; // 歧义情况，不匹配
    }

    return {
      merchantId: bestMatch.merchant.id,
      merchantName: bestMatch.merchant.name,
      confidence: bestMatch.score,
      matched: true,
    };
  }

  /**
   * 🔥 新增：计算动态阈值
   */
  private calculateDynamicThreshold(input: string, merchantName: string): number {
    const inputLen = input.length;

    // 短输入（2-3字符）：阈值提高到0.6，避免误匹配
    if (inputLen <= 3) return 0.6;

    // 长输入（>6字符）：阈值降低到0.3
    if (inputLen >= 6) return 0.3;

    // 中等输入：线性插值
    return 0.6 - (inputLen - 3) * 0.1; // 3字→0.6, 4字→0.5, 5字→0.4, 6字→0.3
  }

  /**
   * 检查是否使用了代词或省略
   */
  private isPronounOrOmitted(input: string): boolean {
    // 代词
    const pronouns = ['它', '他', '她', '这个', '那个', '该', '这', '那', '这家', '那家'];

    // 🔥 新增：疑问词（暗示省略主语）
    const questions = ['什么', '哪个', '哪家', '怎样', '怎么', '如何', '有没有', '能不能'];

    // 🔥 新增：短查询检测（<5字符视为可能省略）
    const isTooShort = input.length < 5;

    return (
      pronouns.some((p) => input.includes(p)) ||
      questions.some((q) => input.includes(q)) ||
      isTooShort
    );
  }

  /**
   * 标准化文本
   */
  private normalize(text: string): string {
    // 🔥 新增：移除语气词
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
