/**
 * 巡检分析器 - 提供基础的巡检数据分析功能
 * 用于支持现有的 inspectionService
 */

import { Merchant, PhotoAttachment, QuickRating } from '@/types';

export interface MerchantInsights {
  alerts: string[];
  weakestDimension: string;
  focusPoints: string[];
}

/**
 * 生成商户洞察
 */
export function generateMerchantInsights(merchant: Merchant): MerchantInsights {
  const alerts: string[] = [];
  const focusPoints: string[] = [];

  // 分析各维度，找出最薄弱的
  const metrics = merchant.metrics;
  const dimensions = [
    { key: 'collection', label: '租金缴纳', value: metrics.collection },
    { key: 'operational', label: '经营表现', value: metrics.operational },
    { key: 'siteQuality', label: '现场品质', value: metrics.siteQuality },
    { key: 'customerReview', label: '客户满意度', value: metrics.customerReview },
    { key: 'riskResistance', label: '抗风险能力', value: metrics.riskResistance },
  ];

  // 找出最薄弱维度
  const sortedDimensions = dimensions.sort((a, b) => a.value - b.value);
  const weakestDimension = sortedDimensions[0].label;

  // 生成预警标签
  if (merchant.riskLevel === 'critical' || merchant.riskLevel === 'high') {
    alerts.push(`风险等级${merchant.riskLevel === 'critical' ? '极高' : '高'}，需重点关注`);
  }

  if (merchant.rentToSalesRatio > 30) {
    alerts.push(`租售比过高(${merchant.rentToSalesRatio.toFixed(1)}%)，存在经营压力`);
  }

  if (metrics.collection < 60) {
    alerts.push('租金缴纳进度不理想');
  }

  if (metrics.siteQuality < 60) {
    alerts.push('现场品质需改善');
  }

  // 生成核心观察点
  sortedDimensions.slice(0, 3).forEach((dim) => {
    if (dim.value < 70) {
      focusPoints.push(`重点关注${dim.label}（当前${dim.value}分）`);
    }
  });

  if (focusPoints.length === 0) {
    focusPoints.push('整体运营良好，保持常规巡检');
  }

  return {
    alerts,
    weakestDimension,
    focusPoints,
  };
}

/**
 * 生成核心观察点
 */
export function generateFocusPoints(merchant: Merchant): string[] {
  const insights = generateMerchantInsights(merchant);
  return insights.focusPoints;
}

/**
 * 生成检查清单
 */
export function generateChecklist(currentTime: Date): {
  type: 'opening' | 'closing' | 'routine';
  items: Array<{ id: string; label: string; checked: boolean }>;
} {
  const hour = currentTime.getHours();

  // 根据时间判断检查类型
  if (hour >= 8 && hour < 11) {
    // 开店检查
    return {
      type: 'opening',
      items: [
        { id: 'c1', label: '店面是否按时开门', checked: false },
        { id: 'c2', label: '员工是否按时到岗', checked: false },
        { id: 'c3', label: '店面卫生是否清洁', checked: false },
        { id: 'c4', label: '货品陈列是否整齐', checked: false },
        { id: 'c5', label: '设备是否正常运转', checked: false },
      ],
    };
  } else if (hour >= 20 && hour < 24) {
    // 闭店检查
    return {
      type: 'closing',
      items: [
        { id: 'c1', label: '是否按时闭店', checked: false },
        { id: 'c2', label: '是否完成清洁工作', checked: false },
        { id: 'c3', label: '是否关闭所有设备', checked: false },
        { id: 'c4', label: '是否锁好门窗', checked: false },
        { id: 'c5', label: '是否检查消防设施', checked: false },
      ],
    };
  } else {
    // 常规检查
    return {
      type: 'routine',
      items: [
        { id: 'c1', label: '员工精神状态良好', checked: false },
        { id: 'c2', label: '货品陈列整齐有序', checked: false },
        { id: 'c3', label: '店面环境清洁卫生', checked: false },
        { id: 'c4', label: '安全消防措施到位', checked: false },
        { id: 'c5', label: '客户服务态度良好', checked: false },
      ],
    };
  }
}

/**
 * 从照片中提取问题
 */
export function extractIssuesFromPhotos(photos: PhotoAttachment[]): string[] {
  const issues: string[] = [];

  photos.forEach((photo) => {
    if (photo.issueLevel === 'critical') {
      issues.push(`${photo.category === 'people' ? '人员' : photo.category === 'merchandise' ? '货品' : '场地'}严重问题: ${photo.description || '需关注'}`);
    } else if (photo.issueLevel === 'warning') {
      issues.push(`${photo.category === 'people' ? '人员' : photo.category === 'merchandise' ? '货品' : '场地'}问题: ${photo.description || '需改善'}`);
    }
  });

  return issues;
}

/**
 * 生成巡检亮点反馈
 */
export function generateHighlights(
  photos: PhotoAttachment[],
  rating: QuickRating | null,
  oldScore: number,
  newScore: number
): {
  improvements: string[];
  concerns: string[];
} {
  const improvements: string[] = [];
  const concerns: string[] = [];

  // 分析评分变化
  const scoreDelta = newScore - oldScore;
  if (scoreDelta > 5) {
    improvements.push(`健康度提升了${scoreDelta.toFixed(1)}分`);
  } else if (scoreDelta < -5) {
    concerns.push(`健康度下降了${Math.abs(scoreDelta).toFixed(1)}分`);
  }

  // 分析照片问题
  const goodPhotos = photos.filter((p) => p.issueLevel === 'good');
  const criticalPhotos = photos.filter((p) => p.issueLevel === 'critical');

  if (goodPhotos.length > 0) {
    improvements.push(`发现${goodPhotos.length}个良好表现`);
  }

  if (criticalPhotos.length > 0) {
    concerns.push(`发现${criticalPhotos.length}个严重问题`);
  }

  // 分析快速评分
  if (rating && rating.ratings) {
    const avgRating =
      (rating.ratings.staffCondition +
        rating.ratings.merchandiseDisplay +
        rating.ratings.storeEnvironment +
        rating.ratings.managementCapability +
        rating.ratings.safetyCompliance) /
      5;

    if (avgRating >= 80) {
      improvements.push('整体运营状况良好');
    } else if (avgRating < 60) {
      concerns.push('整体运营状况需要改善');
    }
  }

  // 确保至少有一些反馈
  if (improvements.length === 0 && concerns.length === 0) {
    improvements.push('已完成本次巡检');
  }

  return { improvements, concerns };
}
