/**
 * 标签分类器 (Tag Classifier)
 *
 * 功能：
 * - MECE原则的标签分类
 * - 三级分类结构（问题诊断→策略方法→执行手段）
 * - 标签相似度计算
 * - 自动分类未知标签
 *
 * 使用场景：
 * - 知识库标签管理
 * - 案例自动分类
 * - 标签推荐
 */

export interface TagTaxonomy {
  [category: string]: {
    [subCategory: string]: string[];
  };
}

export interface ClassifiedTags {
  classified: {
    [category: string]: {
      [subCategory: string]: string[];
    };
  };
  unclassified: string[];
}

export interface TagSimilarity {
  tag1: string;
  tag2: string;
  similarity: number;
}

/**
 * 默认的 MECE 标签分类体系
 */
export const DEFAULT_TAG_TAXONOMY: TagTaxonomy = {
  '问题诊断': {
    '位置问题': ['冷区', '死角', '动线'],
    '品牌问题': ['品牌老化', '产品老化', '弱势品牌', '同质化'],
    '经营问题': ['流量下滑', '客单价', '坪效', '亏损', '高租售比'],
    '市场问题': ['消费降级', '竞品', '金价'],
    '管理问题': ['人员管理', '坐商心态', '库存'],
    '硬件问题': ['设施老化', '硬件老化', '新店', '老店']
  },
  '策略方法': {
    '流量策略': ['公域引流', '异业联盟', '异业互导', '票根经济'],
    '营销策略': ['体验营销', '情感营销', '全员营销', '暴力折扣'],
    '产品策略': ['以旧换新', '动态定价', '菜品对标', '产品年轻化'],
    '客群策略': ['B端', '下沉市场', '商务客群', '家庭客'],
    '会员策略': ['私域', '会员激活', '社群']
  },
  '执行手段': {
    '线上手段': ['探店', '直播', '抖音', '小红书', '新媒体'],
    '线下手段': ['内购', '赞助', '联名', '盲盒', '小样'],
    '空间手段': ['陈列', '重装', '工程', '视觉'],
    '价格手段': ['降租', '工费减免', '小克重', '性价比'],
    '资源手段': ['资源置换', '供应商', '官方背书', '国补']
  }
};

/**
 * 对标签进行分类
 * @param tags 待分类的标签数组
 * @param taxonomy 分类体系（可选，默认使用 DEFAULT_TAG_TAXONOMY）
 * @returns 分类结果
 */
export function classifyTags(
  tags: string[],
  taxonomy: TagTaxonomy = DEFAULT_TAG_TAXONOMY
): ClassifiedTags {
  const classified: ClassifiedTags['classified'] = {};
  const unclassified: string[] = [];

  // 初始化分类结构
  Object.keys(taxonomy).forEach(category => {
    classified[category] = {};
    Object.keys(taxonomy[category]).forEach(subCategory => {
      classified[category][subCategory] = [];
    });
  });

  // 对每个标签进行分类
  tags.forEach(tag => {
    let isClassified = false;

    // 遍历分类体系
    for (const category in taxonomy) {
      for (const subCategory in taxonomy[category]) {
        const keywords = taxonomy[category][subCategory];

        // 检查标签是否包含关键词
        if (keywords.some(keyword => tag.includes(keyword))) {
          classified[category][subCategory].push(tag);
          isClassified = true;
          break;
        }
      }
      if (isClassified) break;
    }

    // 如果未分类，加入未分类列表
    if (!isClassified) {
      unclassified.push(tag);
    }
  });

  return { classified, unclassified };
}

/**
 * 计算两个标签的相似度（基于编辑距离）
 * @param tag1 标签1
 * @param tag2 标签2
 * @returns 相似度 (0-1)
 */
export function calculateTagSimilarity(tag1: string, tag2: string): number {
  // 如果完全相同
  if (tag1 === tag2) return 1;

  // 计算编辑距离
  const distance = levenshteinDistance(tag1, tag2);
  const maxLength = Math.max(tag1.length, tag2.length);

  // 转换为相似度 (0-1)
  return 1 - distance / maxLength;
}

/**
 * 计算编辑距离（Levenshtein Distance）
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,    // 删除
          dp[i][j - 1] + 1,    // 插入
          dp[i - 1][j - 1] + 1 // 替换
        );
      }
    }
  }

  return dp[m][n];
}

/**
 * 查找相似标签
 * @param tag 目标标签
 * @param allTags 所有标签
 * @param threshold 相似度阈值 (0-1)，默认 0.6
 * @returns 相似标签列表
 */
export function findSimilarTags(
  tag: string,
  allTags: string[],
  threshold: number = 0.6
): TagSimilarity[] {
  const similarities: TagSimilarity[] = [];

  allTags.forEach(otherTag => {
    if (tag !== otherTag) {
      const similarity = calculateTagSimilarity(tag, otherTag);
      if (similarity >= threshold) {
        similarities.push({ tag1: tag, tag2: otherTag, similarity });
      }
    }
  });

  // 按相似度降序排序
  return similarities.sort((a, b) => b.similarity - a.similarity);
}

/**
 * 推荐标签分类
 * @param tag 未分类的标签
 * @param taxonomy 分类体系
 * @returns 推荐的分类路径
 */
export function recommendTagCategory(
  tag: string,
  taxonomy: TagTaxonomy = DEFAULT_TAG_TAXONOMY
): { category: string; subCategory: string; confidence: number } | null {
  let bestCategory = '';
  let bestSubCategory = '';
  let maxSimilarity = 0;

  // 遍历分类体系，找到最相似的关键词
  for (const category in taxonomy) {
    for (const subCategory in taxonomy[category]) {
      const keywords = taxonomy[category][subCategory];

      keywords.forEach(keyword => {
        const similarity = calculateTagSimilarity(tag, keyword);
        if (similarity > maxSimilarity) {
          maxSimilarity = similarity;
          bestCategory = category;
          bestSubCategory = subCategory;
        }
      });
    }
  }

  // 只返回置信度 >= 0.5 的推荐
  const confidence = Math.round(maxSimilarity * 100) / 100;
  if (confidence >= 0.5) {
    return {
      category: bestCategory,
      subCategory: bestSubCategory,
      confidence
    };
  }

  return null;
}

/**
 * 获取分类统计
 * @param classified 已分类的标签
 * @returns 统计信息
 */
export function getClassificationStats(classified: ClassifiedTags['classified']): {
  totalCategories: number;
  totalSubCategories: number;
  totalTags: number;
  distribution: { [category: string]: number };
} {
  let totalSubCategories = 0;
  let totalTags = 0;
  const distribution: { [category: string]: number } = {};

  Object.keys(classified).forEach(category => {
    let categoryCount = 0;

    Object.keys(classified[category]).forEach(subCategory => {
      totalSubCategories++;
      const tags = classified[category][subCategory];
      categoryCount += tags.length;
      totalTags += tags.length;
    });

    distribution[category] = categoryCount;
  });

  return {
    totalCategories: Object.keys(classified).length,
    totalSubCategories,
    totalTags,
    distribution
  };
}

/**
 * 合并标签（去重）
 * @param tags 标签数组
 * @returns 去重后的标签数组
 */
export function mergeTags(tags: string[]): string[] {
  return Array.from(new Set(tags));
}

/**
 * 标准化标签（去除空格、统一大小写等）
 * @param tag 原始标签
 * @returns 标准化后的标签
 */
export function normalizeTag(tag: string): string {
  return tag.trim().toLowerCase();
}
