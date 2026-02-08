/**
 * 英文术语替换器（防御层）
 * 用于后处理LLM响应，将残留的英文术语替换为中文
 */

/**
 * 替换响应中的英文术语为中文
 */
export function replaceEnglishTerms(content: string): string {
  const replacements: Record<string, string> = {
    // 风险等级
    'critical': '极高风险',
    'high': '高风险',
    'medium': '中风险',
    'low': '低风险',
    'none': '无风险',

    // 健康度
    'excellent': '优秀',
    'good': '良好',
    'fair': '中等',
    'poor': '较差',
    'very poor': '很差',

    // 指标名称
    'revenue': '营收',
    'rent': '租金',
    'collection': '租金缴纳',
    'operational': '经营表现',
    'siteQuality': '现场品质',
    'site quality': '现场品质',
    'customerReview': '顾客评价',
    'customer review': '顾客评价',
    'riskResistance': '抗风险能力',
    'risk resistance': '抗风险能力',

    // 数据源
    'skills': '技能执行',
    'llm': 'AI生成',
    'hybrid': '混合模式',
  };

  let result = content;

  // 使用正则替换，避免误替换代码中的变量名
  for (const [en, zh] of Object.entries(replacements)) {
    // 只替换被引号包围或独立的英文词
    const regex = new RegExp(`\\b${en}\\b`, 'gi');
    result = result.replace(regex, zh);
  }

  return result;
}

/**
 * 验证响应中是否还有残留的英文术语
 */
export function validateChineseTerms(content: string): {
  valid: boolean;
  remainingEnglishTerms: string[];
} {
  const englishTerms = [
    'critical', 'high', 'medium', 'low', 'none',
    'excellent', 'good', 'fair', 'poor',
    'revenue', 'rent', 'collection', 'operational',
    'siteQuality', 'customerReview', 'riskResistance',
  ];

  const found: string[] = [];

  for (const term of englishTerms) {
    const regex = new RegExp(`\\b${term}\\b`, 'i');
    if (regex.test(content)) {
      found.push(term);
    }
  }

  return {
    valid: found.length === 0,
    remainingEnglishTerms: found,
  };
}
