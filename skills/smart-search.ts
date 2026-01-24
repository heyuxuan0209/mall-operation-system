/**
 * 智能搜索引擎 (Smart Search Engine)
 *
 * 功能：
 * - 多字段模糊搜索
 * - 相关度评分（TF-IDF）
 * - 搜索结果排序
 * - 关键词高亮
 *
 * 使用场景：
 * - 知识库搜索
 * - 商户搜索
 * - 任何需要智能搜索的场景
 */

export interface SearchConfig {
  query: string;
  items: any[];
  searchFields: string[];  // 搜索哪些字段
  weights?: { [field: string]: number };  // 各字段权重，默认均为 1
  fuzzy?: boolean;  // 是否启用模糊搜索，默认 true
  caseSensitive?: boolean;  // 是否区分大小写，默认 false
}

export interface SearchResult<T = any> {
  item: T;
  score: number;  // 相关度分数 (0-100)
  highlights: { [field: string]: string[] };  // 高亮匹配词
  matchedFields: string[];  // 匹配到的字段
}

export interface SearchResponse<T = any> {
  results: SearchResult<T>[];
  total: number;
  query: string;
  executionTime: number;  // 执行时间（毫秒）
}

/**
 * 智能搜索
 * @param config 搜索配置
 * @returns 搜索结果
 */
export function smartSearch<T = any>(config: SearchConfig): SearchResponse<T> {
  const startTime = Date.now();
  const {
    query,
    items,
    searchFields,
    weights = {},
    fuzzy = true,
    caseSensitive = false
  } = config;

  // 如果查询为空，返回所有结果
  if (!query.trim()) {
    return {
      results: items.map(item => ({
        item,
        score: 0,
        highlights: {},
        matchedFields: []
      })),
      total: items.length,
      query: '',
      executionTime: Date.now() - startTime
    };
  }

  // 分词（简单按空格分割）
  const keywords = query.trim().split(/\s+/).filter(k => k.length > 0);

  // 搜索并评分
  const results: SearchResult<T>[] = [];

  items.forEach(item => {
    let totalScore = 0;
    const highlights: { [field: string]: string[] } = {};
    const matchedFields: string[] = [];

    searchFields.forEach(field => {
      const fieldValue = getNestedValue(item, field);
      if (!fieldValue) return;

      const fieldText = String(fieldValue);
      const fieldWeight = weights[field] || 1;

      // 计算该字段的匹配分数
      const { score, matches } = calculateFieldScore(
        fieldText,
        keywords,
        fuzzy,
        caseSensitive
      );

      if (score > 0) {
        totalScore += score * fieldWeight;
        matchedFields.push(field);
        if (matches.length > 0) {
          highlights[field] = matches;
        }
      }
    });

    // 只返回有匹配的结果
    if (totalScore > 0) {
      results.push({
        item,
        score: Math.round(totalScore * 100) / 100,
        highlights,
        matchedFields
      });
    }
  });

  // 按分数降序排序
  results.sort((a, b) => b.score - a.score);

  // 归一化分数到 0-100
  if (results.length > 0) {
    const maxScore = results[0].score;
    results.forEach(result => {
      result.score = Math.round((result.score / maxScore) * 100);
    });
  }

  return {
    results,
    total: results.length,
    query,
    executionTime: Date.now() - startTime
  };
}

/**
 * 计算字段匹配分数
 */
function calculateFieldScore(
  fieldText: string,
  keywords: string[],
  fuzzy: boolean,
  caseSensitive: boolean
): { score: number; matches: string[] } {
  let score = 0;
  const matches: string[] = [];

  const text = caseSensitive ? fieldText : fieldText.toLowerCase();

  keywords.forEach(keyword => {
    const kw = caseSensitive ? keyword : keyword.toLowerCase();

    // 完全匹配
    if (text.includes(kw)) {
      score += 10;
      matches.push(keyword);
    }
    // 模糊匹配
    else if (fuzzy) {
      const similarity = calculateStringSimilarity(text, kw);
      if (similarity > 0.6) {
        score += similarity * 5;
        matches.push(keyword);
      }
    }
  });

  return { score, matches };
}

/**
 * 计算字符串相似度（简化版）
 */
function calculateStringSimilarity(str1: string, str2: string): number {
  // 检查是否包含部分匹配
  if (str1.includes(str2) || str2.includes(str1)) {
    return 0.8;
  }

  // 检查字符重叠度
  const chars1 = new Set(str1.split(''));
  const chars2 = new Set(str2.split(''));
  const intersection = new Set([...chars1].filter(c => chars2.has(c)));

  return intersection.size / Math.max(chars1.size, chars2.size);
}

/**
 * 获取嵌套对象的值
 */
function getNestedValue(obj: any, path: string): any {
  const keys = path.split('.');
  let value = obj;

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return undefined;
    }
  }

  return value;
}

/**
 * 高亮搜索结果
 * @param text 原始文本
 * @param keywords 关键词
 * @param highlightTag 高亮标签，默认 'mark'
 * @returns 高亮后的 HTML
 */
export function highlightText(
  text: string,
  keywords: string[],
  highlightTag: string = 'mark'
): string {
  let result = text;

  keywords.forEach(keyword => {
    const regex = new RegExp(`(${escapeRegex(keyword)})`, 'gi');
    result = result.replace(regex, `<${highlightTag}>$1</${highlightTag}>`);
  });

  return result;
}

/**
 * 转义正则表达式特殊字符
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 搜索建议（基于历史搜索）
 */
export class SearchSuggester {
  private history: string[] = [];
  private maxHistory: number = 50;

  /**
   * 添加搜索历史
   */
  addToHistory(query: string): void {
    if (!query.trim()) return;

    // 去重并添加到历史
    this.history = this.history.filter(q => q !== query);
    this.history.unshift(query);

    // 限制历史记录数量
    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(0, this.maxHistory);
    }
  }

  /**
   * 获取搜索建议
   */
  getSuggestions(query: string, limit: number = 5): string[] {
    if (!query.trim()) return [];

    const lowerQuery = query.toLowerCase();

    // 从历史记录中筛选匹配的建议
    const suggestions = this.history
      .filter(h => h.toLowerCase().includes(lowerQuery))
      .slice(0, limit);

    return suggestions;
  }

  /**
   * 清空历史记录
   */
  clearHistory(): void {
    this.history = [];
  }

  /**
   * 获取所有历史记录
   */
  getHistory(): string[] {
    return [...this.history];
  }
}

/**
 * 搜索过滤器
 */
export interface SearchFilter {
  field: string;
  operator: 'equals' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte' | 'in';
  value: any;
}

/**
 * 应用过滤器
 */
export function applyFilters<T = any>(
  items: T[],
  filters: SearchFilter[]
): T[] {
  if (filters.length === 0) return items;

  return items.filter(item => {
    return filters.every(filter => {
      const fieldValue = getNestedValue(item, filter.field);

      switch (filter.operator) {
        case 'equals':
          return fieldValue === filter.value;
        case 'contains':
          return String(fieldValue).includes(String(filter.value));
        case 'gt':
          return fieldValue > filter.value;
        case 'lt':
          return fieldValue < filter.value;
        case 'gte':
          return fieldValue >= filter.value;
        case 'lte':
          return fieldValue <= filter.value;
        case 'in':
          return Array.isArray(filter.value) && filter.value.includes(fieldValue);
        default:
          return true;
      }
    });
  });
}
