/**
 * Knowledge Base Sedimentation Utility
 * 知识库沉淀 - 成功案例自动沉淀和管理
 *
 * Priority: P2
 * Use Cases: 案例沉淀、知识库管理、经验复用
 */

export interface KnowledgeCase {
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
  source?: 'system' | 'user';  // 系统预置 or 用户沉淀
  successRate?: number;
  usageCount?: number;
}

export interface Task {
  id: string;
  merchantName: string;
  description?: string;
  measures?: string[];
  riskLevel?: string;
  stage?: string;
  [key: string]: any;
}

/**
 * 从成功任务生成知识库案例
 *
 * @param task 帮扶任务
 * @param additionalInfo 额外信息（可选）
 * @returns 知识库案例对象
 */
export function generateCaseFromTask(
  task: Task,
  additionalInfo?: {
    industry?: string;
    tags?: string[];
    result?: string;
  }
): KnowledgeCase {
  // 自动识别商户业态
  const industry = additionalInfo?.industry || identifyIndustry(task.merchantName);

  // 自动生成标签
  const autoTags = generateTags(task);
  const tags = additionalInfo?.tags
    ? [...new Set([...autoTags, ...additionalInfo.tags])]
    : autoTags;

  // 生成案例数据
  const caseData: KnowledgeCase = {
    id: `CASE_${Date.now()}`,
    merchantName: task.merchantName,
    industry,
    tags,
    symptoms: task.description || '商户经营存在问题',
    diagnosis: `健康度评分较低，风险等级${task.riskLevel || '中'}`,
    strategy: task.measures?.join('；') || '',
    action: task.measures?.join('\n') || '',
    result: additionalInfo?.result || '帮扶后健康度提升，各项指标改善明显',
    createdAt: new Date().toISOString().split('T')[0],
    source: 'user',
    successRate: 100,
    usageCount: 0
  };

  return caseData;
}

/**
 * 识别商户业态
 *
 * @param merchantName 商户名称
 * @returns 业态分类
 */
export function identifyIndustry(merchantName: string): string {
  const industryMap: Record<string, string> = {
    '火锅': '餐饮-火锅',
    '茶': '餐饮-饮品',
    '咖啡': '餐饮-饮品',
    '餐': '餐饮-正餐',
    '影城': '主力店-影城',
    '超市': '主力店-超市',
    '服饰': '零售-���饰',
    '装': '零售-服饰',
    '珠宝': '零售-珠宝',
    '金': '零售-珠宝'
  };

  for (const [keyword, industry] of Object.entries(industryMap)) {
    if (merchantName.includes(keyword)) {
      return industry;
    }
  }

  return '餐饮';  // 默认分类
}

/**
 * 自动生成案例标签
 *
 * @param task 帮扶任务
 * @returns 标签数组
 */
export function generateTags(task: Task): string[] {
  const tags: string[] = ['帮扶成功', '实战案例'];

  // 根据风险等级添加标签
  if (task.riskLevel === 'high') {
    tags.push('高风险', '重点帮扶');
  } else if (task.riskLevel === 'medium') {
    tags.push('中风险');
  }

  // 根据描述添加标签
  if (task.description) {
    const desc = task.description;
    if (desc.includes('租售比') || desc.includes('租金')) {
      tags.push('高租售比', '租金压力');
    }
    if (desc.includes('营收') || desc.includes('销售')) {
      tags.push('营收低', '业绩差');
    }
    if (desc.includes('客流')) {
      tags.push('客流少', '引流');
    }
    if (desc.includes('投诉') || desc.includes('满意度')) {
      tags.push('投诉', '服务问题');
    }
    if (desc.includes('环境') || desc.includes('陈列')) {
      tags.push('环境问题', '陈列差');
    }
  }

  // 根据措施添加标签
  if (task.measures) {
    const measuresText = task.measures.join(' ');
    if (measuresText.includes('降租') || measuresText.includes('租金减免')) {
      tags.push('降租');
    }
    if (measuresText.includes('营销') || measuresText.includes('推广')) {
      tags.push('营销支持');
    }
    if (measuresText.includes('培训')) {
      tags.push('培训指导');
    }
  }

  // 去重
  return [...new Set(tags)];
}

/**
 * 保存案例到知识库
 *
 * @param caseData 案例数据
 * @param storageKey localStorage键名，默认'userKnowledgeBase'
 * @returns 是否保存成功
 */
export function saveCaseToKnowledgeBase(
  caseData: KnowledgeCase,
  storageKey: string = 'userKnowledgeBase'
): boolean {
  try {
    const existingCases = JSON.parse(localStorage.getItem(storageKey) || '[]');
    existingCases.push(caseData);
    localStorage.setItem(storageKey, JSON.stringify(existingCases));
    return true;
  } catch (error) {
    console.error('保存案例失败:', error);
    return false;
  }
}

/**
 * 从知识库加载案例
 *
 * @param storageKey localStorage键名，默认'userKnowledgeBase'
 * @returns 案例列表
 */
export function loadCasesFromKnowledgeBase(
  storageKey: string = 'userKnowledgeBase'
): KnowledgeCase[] {
  try {
    return JSON.parse(localStorage.getItem(storageKey) || '[]');
  } catch (error) {
    console.error('加载案例失败:', error);
    return [];
  }
}

/**
 * 更新案例使用统计
 *
 * @param caseId 案例ID
 * @param storageKey localStorage键名
 * @returns 是否更新成功
 */
export function incrementCaseUsage(
  caseId: string,
  storageKey: string = 'userKnowledgeBase'
): boolean {
  try {
    const cases = loadCasesFromKnowledgeBase(storageKey);
    const updatedCases = cases.map(c => {
      if (c.id === caseId) {
        return {
          ...c,
          usageCount: (c.usageCount || 0) + 1
        };
      }
      return c;
    });
    localStorage.setItem(storageKey, JSON.stringify(updatedCases));
    return true;
  } catch (error) {
    console.error('更新案例使用统计失败:', error);
    return false;
  }
}

/**
 * 删除案例
 *
 * @param caseId 案例ID
 * @param storageKey localStorage键名
 * @returns 是否删除成功
 */
export function deleteCase(
  caseId: string,
  storageKey: string = 'userKnowledgeBase'
): boolean {
  try {
    const cases = loadCasesFromKnowledgeBase(storageKey);
    const filteredCases = cases.filter(c => c.id !== caseId);
    localStorage.setItem(storageKey, JSON.stringify(filteredCases));
    return true;
  } catch (error) {
    console.error('删除案例失败:', error);
    return false;
  }
}

/**
 * 更新案例信息
 *
 * @param caseId 案例ID
 * @param updates 更新内容
 * @param storageKey localStorage键名
 * @returns 是否更新成功
 */
export function updateCase(
  caseId: string,
  updates: Partial<KnowledgeCase>,
  storageKey: string = 'userKnowledgeBase'
): boolean {
  try {
    const cases = loadCasesFromKnowledgeBase(storageKey);
    const updatedCases = cases.map(c => {
      if (c.id === caseId) {
        return { ...c, ...updates };
      }
      return c;
    });
    localStorage.setItem(storageKey, JSON.stringify(updatedCases));
    return true;
  } catch (error) {
    console.error('更新案例失败:', error);
    return false;
  }
}

/**
 * 获取热门案例（按使用次数排序）
 *
 * @param limit 返回数量限制
 * @param storageKey localStorage键名
 * @returns 热门案例列表
 */
export function getPopularCases(
  limit: number = 10,
  storageKey: string = 'userKnowledgeBase'
): KnowledgeCase[] {
  const cases = loadCasesFromKnowledgeBase(storageKey);
  return cases
    .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
    .slice(0, limit);
}

/**
 * 按业态分组案例
 *
 * @param storageKey localStorage键名
 * @returns 分组后的案例
 */
export function groupCasesByIndustry(
  storageKey: string = 'userKnowledgeBase'
): Record<string, KnowledgeCase[]> {
  const cases = loadCasesFromKnowledgeBase(storageKey);
  const grouped: Record<string, KnowledgeCase[]> = {};

  cases.forEach(c => {
    if (!grouped[c.industry]) {
      grouped[c.industry] = [];
    }
    grouped[c.industry].push(c);
  });

  return grouped;
}

/**
 * 导出知识库为JSON
 *
 * @param storageKey localStorage键名
 * @returns JSON字符串
 */
export function exportKnowledgeBase(
  storageKey: string = 'userKnowledgeBase'
): string {
  const cases = loadCasesFromKnowledgeBase(storageKey);
  return JSON.stringify(cases, null, 2);
}

/**
 * 从JSON导入知识库
 *
 * @param jsonData JSON字符串
 * @param storageKey localStorage键名
 * @param merge 是否合并（true）还是覆盖（false）
 * @returns 是否导入成功
 */
export function importKnowledgeBase(
  jsonData: string,
  storageKey: string = 'userKnowledgeBase',
  merge: boolean = true
): boolean {
  try {
    const importedCases: KnowledgeCase[] = JSON.parse(jsonData);

    if (merge) {
      const existingCases = loadCasesFromKnowledgeBase(storageKey);
      const allCases = [...existingCases, ...importedCases];
      // 去重（基于ID）
      const uniqueCases = allCases.filter((c, index, self) =>
        index === self.findIndex(t => t.id === c.id)
      );
      localStorage.setItem(storageKey, JSON.stringify(uniqueCases));
    } else {
      localStorage.setItem(storageKey, JSON.stringify(importedCases));
    }

    return true;
  } catch (error) {
    console.error('导入知识库失败:', error);
    return false;
  }
}
