/**
 * Smart Search Engine Utility
 * 智能搜索引擎 - 多字段加权模糊搜索
 *
 * Priority: P1
 * Use Cases: 知识库搜索、商户搜索、案例匹配
 */

export interface SearchField {
  name: string;
  weight: number;
}

export interface SearchConfig {
  fields: SearchField[];
  minScore?: number;
}

export interface SearchResult<T> {
  item: T;
  score: number;
  matchCount: number;
}

/**
 * 创建智能搜索引擎
 * @param config 搜索配置（字段和权重）
 * @returns 搜索引擎实例
 */
export function createSmartSearchEngine<T>(config: SearchConfig) {
  const { fields, minScore = 0 } = config;

  // 构建权重映射
  const weights: Record<string, number> = {};
  fields.forEach(field => {
    weights[field.name] = field.weight;
  });

  return {
    /**
     * 执行搜索
     * @param query 搜索关键词
     * @param items 待搜索的数据集
     * @returns 按相关度排序的搜索结果
     */
    search: (query: string, items: T[]): T[] => {
      if (!query.trim()) return items;

      const searchFields = fields.map(f => f.name);
      const queryLower = query.toLowerCase();

      const results: SearchResult<T>[] = items.map(item => {
        let totalScore = 0;
        let matchCount = 0;

        searchFields.forEach(field => {
          const fieldValue = String((item as any)[field] || '').toLowerCase();

          if (fieldValue.includes(queryLower)) {
            const weight = weights[field] || 1;

            // 精确匹配加倍分数
            const exactMatch = fieldValue === queryLower ? 2 : 1;

            // 前缀匹配额外加分
            const positionBonus = fieldValue.startsWith(queryLower) ? 1.5 : 1;

            totalScore += weight * exactMatch * positionBonus;
            matchCount++;
          }
        });

        return {
          item,
          score: totalScore,
          matchCount
        };
      });

      return results
        .filter(r => r.score > minScore)
        .sort((a, b) => {
          // 优先按分数排序
          if (b.score !== a.score) return b.score - a.score;
          // 分数相同时按匹配字段数排序
          return b.matchCount - a.matchCount;
        })
        .map(r => r.item);
    },

    /**
     * 获取搜索结果及详细评分
     * @param query 搜索关键词
     * @param items 待搜索的数据集
     * @returns 包含评分详情的搜索结果
     */
    searchWithScores: (query: string, items: T[]): SearchResult<T>[] => {
      if (!query.trim()) {
        return items.map(item => ({ item, score: 0, matchCount: 0 }));
      }

      const searchFields = fields.map(f => f.name);
      const queryLower = query.toLowerCase();

      const results: SearchResult<T>[] = items.map(item => {
        let totalScore = 0;
        let matchCount = 0;

        searchFields.forEach(field => {
          const fieldValue = String((item as any)[field] || '').toLowerCase();

          if (fieldValue.includes(queryLower)) {
            const weight = weights[field] || 1;
            const exactMatch = fieldValue === queryLower ? 2 : 1;
            const positionBonus = fieldValue.startsWith(queryLower) ? 1.5 : 1;

            totalScore += weight * exactMatch * positionBonus;
            matchCount++;
          }
        });

        return {
          item,
          score: totalScore,
          matchCount
        };
      });

      return results
        .filter(r => r.score > minScore)
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          return b.matchCount - a.matchCount;
        });
    }
  };
}

/**
 * 预设配置：知识库搜索
 */
export const knowledgeBaseSearchConfig: SearchConfig = {
  fields: [
    { name: 'merchantName', weight: 2.5 },  // 商户名称权重最高
    { name: 'symptoms', weight: 2 },        // 症状描述权重次之
    { name: 'diagnosis', weight: 1.8 },     // 问题诊断权重
    { name: 'tags', weight: 1.5 },          // 标签权重
    { name: 'strategy', weight: 1.2 },      // 策略权重
    { name: 'action', weight: 1 },          // 措施权重
    { name: 'industry', weight: 0.8 }       // 行业权重最低
  ],
  minScore: 0
};

/**
 * 预设配置：商户搜索
 */
export const merchantSearchConfig: SearchConfig = {
  fields: [
    { name: 'name', weight: 3 },           // 商户名称
    { name: 'category', weight: 2 },       // 业态分类
    { name: 'floor', weight: 1 },          // 楼层
    { name: 'shopNumber', weight: 1.5 }    // 铺位号
  ],
  minScore: 0
};
