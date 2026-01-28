/**
 * Inspection Analyzer - Highlights Module
 * 巡检分析器 - 亮点模块
 *
 * 负责从照片和评分中提取问题、生成改进亮点和关注点
 */

import { PhotoAttachment, QuickRating } from '@/types';
import { InspectionHighlights } from './types';

/**
 * 从照片中提取问题
 *
 * @param photos - 照片附件列表
 * @returns 问题描述列表
 */
export function extractIssuesFromPhotos(photos: PhotoAttachment[]): string[] {
  const issues: string[] = [];

  photos.forEach((photo) => {
    // 严重和警告级别的照片视为问题
    if (photo.issueLevel === 'critical' || photo.issueLevel === 'warning') {
      const categoryLabel = photo.category === 'people' ? '人员'
        : photo.category === 'merchandise' ? '商品'
        : '环境';

      const tagsStr = photo.tags.length > 0 ? `(${photo.tags.join('、')})` : '';
      const desc = photo.description ? `: ${photo.description}` : '';

      issues.push(`${categoryLabel}问题${tagsStr}${desc}`);
    }
  });

  return issues;
}

/**
 * 生成改进亮点和关注点
 * 基于照片分类、评分和分数变化生成反馈
 *
 * @param photos - 照片附件列表
 * @param rating - 快速评分数据
 * @param oldScore - 旧的健康度分数
 * @param newScore - 新的健康度分数
 * @returns 改进亮点和关注点
 */
export function generateHighlights(
  photos: PhotoAttachment[],
  rating: QuickRating | null,
  oldScore: number,
  newScore: number
): InspectionHighlights {
  const improvements: string[] = [];
  const concerns: string[] = [];

  // 1. 基于照片分类生成
  const goodPhotos = photos.filter(p => p.issueLevel === 'good');
  const warningPhotos = photos.filter(p => p.issueLevel === 'warning');
  const criticalPhotos = photos.filter(p => p.issueLevel === 'critical');

  // 改进亮点（良好的方面）
  goodPhotos.forEach(photo => {
    if (photo.tags.length > 0) {
      improvements.push(`${photo.tags[0]}表现良好`);
    }
  });

  // 关注点（问题方面）
  warningPhotos.forEach(photo => {
    if (photo.tags.length > 0) {
      concerns.push(`${photo.tags[0]}需要改进`);
    }
  });

  criticalPhotos.forEach(photo => {
    if (photo.tags.length > 0) {
      concerns.push(`${photo.tags[0]}问题严重，需立即整改`);
    }
  });

  // 2. 基于评分生成
  if (rating && rating.ratings) {
    const { staffCondition, merchandiseDisplay, storeEnvironment, managementCapability, safetyCompliance } = rating.ratings;

    // 员工状态
    if (staffCondition >= 80) {
      improvements.push('员工服务态度优秀');
    } else if (staffCondition < 50) {
      concerns.push('员工服务需要培训提升');
    }

    // 商品陈列
    if (merchandiseDisplay >= 80) {
      improvements.push('商品陈列整齐有序');
    } else if (merchandiseDisplay < 50) {
      concerns.push('商品管理需要优化');
    }

    // 店面环境
    if (storeEnvironment >= 80) {
      improvements.push('现场环境整洁明亮');
    } else if (storeEnvironment < 50) {
      concerns.push('现场环境需要改善');
    }

    // 管理能力
    if (managementCapability >= 80) {
      improvements.push('管理能力突出');
    } else if (managementCapability < 50) {
      concerns.push('管理能力需要提升');
    }

    // 安全合规
    if (safetyCompliance >= 80) {
      improvements.push('安全合规表现良好');
    } else if (safetyCompliance < 50) {
      concerns.push('安全合规需要加强');
    }
  }

  // 3. 基于分数变化生成总结
  const scoreChange = newScore - oldScore;
  if (scoreChange > 5) {
    improvements.unshift('整体经营状况有明显改善');
  } else if (scoreChange < -5) {
    concerns.unshift('整体健康度下降，需要重点关注');
  }

  // 4. 去重并限制数量
  return {
    improvements: [...new Set(improvements)].slice(0, 5),
    concerns: [...new Set(concerns)].slice(0, 5),
  };
}
