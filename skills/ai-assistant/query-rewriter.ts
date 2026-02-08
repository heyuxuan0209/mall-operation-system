/**
 * 查询改写器
 * 负责指代消解、省略补全、查询扩展和规范化
 */

import type { ConversationContext, RewriteResult, RewriteOperation } from '@/types/ai-assistant';

interface RewriteOperationDetail {
  type: RewriteOperation;
  from: string;
  to: string;
}

/**
 * 查询改写器类
 */
export class QueryRewriter {
  /**
   * 改写查询
   */
  rewrite(userInput: string, context: ConversationContext): RewriteResult {
    let normalized = userInput;
    const operations: RewriteOperationDetail[] = [];

    // 步骤1: 指代消解（"它"→"海底捞"）
    const coreferenceResult = this.resolveCoreference(normalized, context);
    if (coreferenceResult.replaced) {
      operations.push(...coreferenceResult.operations);
      normalized = coreferenceResult.text;
    }

    // 步骤2: 省略补全（补全主语）
    const ellipsisResult = this.resolveEllipsis(normalized, context);
    if (ellipsisResult.completed) {
      operations.push(...ellipsisResult.operations);
      normalized = ellipsisResult.text;
    }

    // 步骤3: 查询扩展（领域词汇映射）
    const expandedResult = this.expandQuery(normalized, context);
    if (expandedResult.expanded) {
      operations.push(...expandedResult.operations);
      normalized = expandedResult.text;
    }

    // 步骤4: 规范化（去除噪音词）
    const normalizedResult = this.normalizeQuery(normalized);
    if (normalizedResult.normalized) {
      operations.push(...normalizedResult.operations);
      normalized = normalizedResult.text;
    }

    return {
      original: userInput,
      normalized,
      operations,
      confidence: this.calculateConfidence(operations, userInput),
    };
  }

  /**
   * 指代消解：将"它"、"这个"、"那个"替换为实际商户名
   */
  private resolveCoreference(
    text: string,
    context: ConversationContext
  ): { text: string; replaced: boolean; operations: RewriteOperationDetail[] } {
    const operations: RewriteOperationDetail[] = [];
    let result = text;
    let replaced = false;

    // 定义代词映射
    const pronouns: Record<string, string> = {
      '它': 'merchant',
      '他': 'merchant',
      '她': 'merchant',
      '这个': 'merchant',
      '那个': 'merchant',
      '这家': 'merchant',
      '那家': 'merchant',
      '该': 'merchant',
    };

    // 获取当前商户名
    const merchantName = context.merchantName || '';
    if (!merchantName) {
      return { text, replaced: false, operations: [] };
    }

    // 替换代词
    for (const [pronoun, type] of Object.entries(pronouns)) {
      if (text.includes(pronoun)) {
        result = result.replace(new RegExp(pronoun, 'g'), merchantName);
        operations.push({
          type: 'coreference',
          from: pronoun,
          to: merchantName,
        });
        replaced = true;
      }
    }

    return { text: result, replaced, operations };
  }

  /**
   * 省略补全：检测疑问词（暗示省略主语）并补全
   */
  private resolveEllipsis(
    text: string,
    context: ConversationContext
  ): { text: string; completed: boolean; operations: RewriteOperationDetail[] } {
    const operations: RewriteOperationDetail[] = [];
    let result = text;
    let completed = false;

    const merchantName = context.merchantName || '';
    if (!merchantName) {
      return { text, completed: false, operations: [] };
    }

    // 检测疑问词模式
    const questionPatterns = [
      {
        pattern: /^(有)?什么(问题|风险|情况)/,
        replacement: (match: string) => `${merchantName}${match}`,
      },
      {
        pattern: /^(怎么|如何)(样|办)/,
        replacement: (match: string) => `${merchantName}${match}`,
      },
      {
        pattern: /^(表现|经营|运营)(怎么样|如何)/,
        replacement: (match: string) => `${merchantName}${match}`,
      },
      {
        pattern: /^(能|可以)(不能|吗)/,
        replacement: (match: string) => `${merchantName}${match}`,
      },
    ];

    for (const { pattern, replacement } of questionPatterns) {
      const match = text.match(pattern);
      if (match) {
        const newText = replacement(match[0]);
        result = text.replace(pattern, newText);
        operations.push({
          type: 'ellipsis',
          from: match[0],
          to: newText,
        });
        completed = true;
        break;
      }
    }

    return { text: result, completed, operations };
  }

  /**
   * 查询扩展：领域词汇映射
   */
  private expandQuery(
    text: string,
    context: ConversationContext
  ): { text: string; expanded: boolean; operations: RewriteOperationDetail[] } {
    const operations: RewriteOperationDetail[] = [];
    let result = text;
    let expanded = false;

    // 领域词汇映射
    const domainExpansions: Record<string, string[]> = {
      '问题': ['风险', '问题'],
      '情况': ['健康度', '状况'],
      '表现': ['经营状况', '业绩'],
      '办': ['改善', '解决'],
    };

    for (const [term, expansions] of Object.entries(domainExpansions)) {
      if (text.includes(term) && !expansions.some(exp => text.includes(exp))) {
        // 只在没有更具体的词时才扩展
        const expansion = expansions[0];
        result = result.replace(term, expansion);
        operations.push({
          type: 'expansion',
          from: term,
          to: expansion,
        });
        expanded = true;
      }
    }

    return { text: result, expanded, operations };
  }

  /**
   * 规范化：去除时间词、停用词
   */
  private normalizeQuery(
    text: string
  ): { text: string; normalized: boolean; operations: RewriteOperationDetail[] } {
    const operations: RewriteOperationDetail[] = [];
    let result = text;
    let normalized = false;

    // 停用词列表（🔥 简化：只移除句末的停用词）
    const stopWords = ['的', '了', '吗', '呢', '啊', '吧', '呀'];

    // 移除停用词（句末）
    for (const word of stopWords) {
      if (result.endsWith(word)) {
        const newText = result.slice(0, -word.length);
        operations.push({
          type: 'normalization',
          from: word,
          to: '',
        });
        result = newText;
        normalized = true;
      }
    }

    // 清理多余空格
    const cleaned = result.replace(/\s+/g, ' ').trim();
    if (cleaned !== result) {
      normalized = true;
      result = cleaned;
    }

    return { text: result, normalized, operations };
  }

  /**
   * 计算改写置信度
   */
  private calculateConfidence(operations: RewriteOperationDetail[], original: string): number {
    // 基础置信度
    let confidence = 1.0;

    // 🔥 优化：区分不同类型的操作
    const coreferenceOps = operations.filter((op) => op.type === 'coreference');
    const ellipsisOps = operations.filter((op) => op.type === 'ellipsis');
    const expansionOps = operations.filter((op) => op.type === 'expansion');
    const normalizationOps = operations.filter((op) => op.type === 'normalization');

    // 规范化操作不降低置信度（只是清理文本）
    // 扩展操作轻微降低（5%）
    if (expansionOps.length > 0) {
      confidence -= 0.05;
    }

    // 指代消解和省略补全根据质量降低
    if (coreferenceOps.length > 0 || ellipsisOps.length > 0) {
      // 如果成功替换了，置信度保持较高
      const hasSuccessfulReplacement = operations.some(
        (op) =>
          (op.type === 'coreference' || op.type === 'ellipsis') &&
          op.to !== '' &&
          op.to !== op.from
      );

      if (hasSuccessfulReplacement) {
        confidence -= 0.1; // 轻微降低
      } else {
        confidence -= 0.3; // 没有成功替换，降低更多
      }
    }

    // 操作过多（超过5个）才降低置信度
    if (operations.length > 5) {
      const excess = operations.length - 5;
      confidence -= Math.min(excess * 0.05, 0.2);
    }

    // 🔥 提高最低置信度：0.3 → 0.5
    return Math.max(0.5, Math.min(1.0, confidence));
  }
}

/**
 * 导出单例
 */
export const queryRewriter = new QueryRewriter();
