/**
 * 知识库管理器
 *
 * 功能：管理案例的存储、检索、评分和沉淀
 * 复用场景：
 * - 知识库页面
 * - 案例自动沉淀
 * - 案例推荐
 */

export interface Case {
  id: string;
  merchantName?: string;
  industry: string;
  tags: string[];
  symptoms: string;
  diagnosis: string;
  strategy: string;
  action: string;
  result?: string;
  createdAt: string;
  rating?: number;
  usageCount?: number;
}

export interface SearchQuery {
  keyword?: string;
  industry?: string;
  tags?: string[];
  minRating?: number;
}

export interface CaseWithScore extends Case {
  relevanceScore?: number;
}

/**
 * 搜索案例
 */
export function searchCases(cases: Case[], query: SearchQuery): CaseWithScore[] {
  let results = [...cases];

  // 关键词搜索
  if (query.keyword) {
    const keyword = query.keyword.toLowerCase();
    results = results.filter(c =>
      c.industry.toLowerCase().includes(keyword) ||
      c.symptoms.toLowerCase().includes(keyword) ||
      c.diagnosis.toLowerCase().includes(keyword) ||
      c.tags.some(tag => tag.toLowerCase().includes(keyword)) ||
      (c.merchantName && c.merchantName.toLowerCase().includes(keyword))
    );
  }

  // 行业筛选
  if (query.industry && query.industry !== 'all') {
    results = results.filter(c => c.industry === query.industry);
  }

  // 标签筛选
  if (query.tags && query.tags.length > 0) {
    results = results.filter(c =>
      query.tags!.some(tag => c.tags.includes(tag))
    );
  }

  // 评分筛选
  if (query.minRating) {
    results = results.filter(c => (c.rating || 0) >= query.minRating!);
  }

  return results;
}

/**
 * 从任务自动生成案例
 */
export function generateCaseFromTask(task: any): Case {
  return {
    id: `CASE_${Date.now()}`,
    merchantName: task.merchantName,
    industry: inferIndustry(task.merchantName),
    tags: ['帮扶成功', '实战案例', ...extractTags(task.description)],
    symptoms: task.description || '商户经营存在问题',
    diagnosis: `健康度评分较低，风险等级${task.riskLevel || '中'}`,
    strategy: task.measures?.join('；') || '',
    action: task.measures?.join('\n') || '',
    result: '帮扶后健康度提升，各项指标改善明显',
    createdAt: new Date().toISOString().split('T')[0],
    rating: 0,
    usageCount: 0
  };
}

/**
 * 推断行业分类
 */
function inferIndustry(merchantName: string): string {
  if (merchantName.includes('火锅')) return '餐饮-火锅';
  if (merchantName.includes('茶') || merchantName.includes('咖啡')) return '餐饮-饮品';
  if (merchantName.includes('餐')) return '餐饮-正餐';
  if (merchantName.includes('影城')) return '主力店-影城';
  if (merchantName.includes('超市')) return '主力店-超市';
  if (merchantName.includes('服饰') || merchantName.includes('装')) return '零售-服饰';
  if (merchantName.includes('珠宝') || merchantName.includes('金')) return '零售-珠宝';
  return '待分类';
}

/**
 * 从描述中提取标签
 */
function extractTags(description: string): string[] {
  const tags: string[] = [];

  if (!description) return tags;

  const keywords = [
    { pattern: /租金|欠租|逾期/, tag: '租金问题' },
    { pattern: /营收|销售|业绩/, tag: '营收下滑' },
    { pattern: /租售比/, tag: '高租售比' },
    { pattern: /投诉|满意度|服务/, tag: '服务质量' },
    { pattern: /客流|人气/, tag: '客流问题' },
    { pattern: /陈列|环境|装修/, tag: '现场品质' }
  ];

  keywords.forEach(({ pattern, tag }) => {
    if (pattern.test(description)) {
      tags.push(tag);
    }
  });

  return tags;
}

/**
 * 案例评分
 */
export function rateCase(caseItem: Case, rating: number): Case {
  if (rating < 1 || rating > 5) {
    throw new Error('评分必须在1-5之间');
  }

  return {
    ...caseItem,
    rating: rating
  };
}

/**
 * 增加案例使用次数
 */
export function incrementUsageCount(caseItem: Case): Case {
  return {
    ...caseItem,
    usageCount: (caseItem.usageCount || 0) + 1
  };
}

/**
 * 获取热门案例
 */
export function getPopularCases(cases: Case[], limit: number = 10): Case[] {
  return [...cases]
    .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
    .slice(0, limit);
}

/**
 * 获取高评分案例
 */
export function getTopRatedCases(cases: Case[], limit: number = 10): Case[] {
  return [...cases]
    .filter(c => c.rating && c.rating > 0)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, limit);
}

/**
 * 按行业分组统计
 */
export function groupByIndustry(cases: Case[]): Record<string, number> {
  const groups: Record<string, number> = {};

  cases.forEach(c => {
    groups[c.industry] = (groups[c.industry] || 0) + 1;
  });

  return groups;
}

/**
 * 获取所有标签及其使用频率
 */
export function getTagFrequency(cases: Case[]): Array<{ tag: string; count: number }> {
  const tagCounts: Record<string, number> = {};

  cases.forEach(c => {
    c.tags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  return Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

/**
 * 查找相似案例
 */
export function findSimilarCases(
  targetCase: Case,
  allCases: Case[],
  limit: number = 5
): CaseWithScore[] {
  const scoredCases = allCases
    .filter(c => c.id !== targetCase.id)
    .map(c => {
      let score = 0;

      // 行业匹配
      if (c.industry === targetCase.industry) {
        score += 40;
      } else if (c.industry.split('-')[0] === targetCase.industry.split('-')[0]) {
        score += 20;
      }

      // 标签匹配
      const commonTags = c.tags.filter(tag => targetCase.tags.includes(tag));
      score += commonTags.length * 15;

      // 症状相似度（简单关键词匹配）
      const targetKeywords = targetCase.symptoms.split(/\s+/);
      const matchedKeywords = targetKeywords.filter(kw =>
        c.symptoms.includes(kw) || c.diagnosis.includes(kw)
      );
      score += matchedKeywords.length * 5;

      return {
        ...c,
        relevanceScore: score
      };
    })
    .filter(c => c.relevanceScore! > 0)
    .sort((a, b) => b.relevanceScore! - a.relevanceScore!)
    .slice(0, limit);

  return scoredCases;
}

/**
 * 导出案例为JSON
 */
export function exportCases(cases: Case[]): string {
  return JSON.stringify(cases, null, 2);
}

/**
 * 从JSON导入案例
 */
export function importCases(jsonString: string): Case[] {
  try {
    const cases = JSON.parse(jsonString);
    if (!Array.isArray(cases)) {
      throw new Error('Invalid format: expected an array');
    }
    return cases;
  } catch (error) {
    throw new Error(`Failed to import cases: ${error}`);
  }
}

/**
 * 验证案例数据完整性
 */
export function validateCase(caseItem: Partial<Case>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!caseItem.industry) errors.push('缺少行业分类');
  if (!caseItem.tags || caseItem.tags.length === 0) errors.push('缺少标签');
  if (!caseItem.symptoms) errors.push('缺少症状描述');
  if (!caseItem.diagnosis) errors.push('缺少问题诊断');
  if (!caseItem.strategy) errors.push('缺少帮扶策略');
  if (!caseItem.action) errors.push('缺少具体措施');

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 合并重复案例
 */
export function mergeDuplicateCases(cases: Case[]): Case[] {
  const uniqueCases = new Map<string, Case>();

  cases.forEach(c => {
    // 使用行业+症状作为唯一标识
    const key = `${c.industry}_${c.symptoms.substring(0, 50)}`;

    if (!uniqueCases.has(key)) {
      uniqueCases.set(key, c);
    } else {
      // 如果已存在，合并标签和使用次数
      const existing = uniqueCases.get(key)!;
      existing.tags = Array.from(new Set([...existing.tags, ...c.tags]));
      existing.usageCount = (existing.usageCount || 0) + (c.usageCount || 0);
    }
  });

  return Array.from(uniqueCases.values());
}
