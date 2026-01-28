/**
 * Inspection Analyzer Types
 * 巡检分析器类型定义
 */

import { Merchant, ChecklistItem, PhotoAttachment, QuickRating } from '@/types';

/**
 * 商户洞察结果
 */
export interface MerchantInsights {
  alerts: string[];
  weakestDimension: string;
  focusPoints: string[];
}

/**
 * 检查清单结果
 */
export interface ChecklistResult {
  type: 'opening' | 'closing' | 'routine';
  items: ChecklistItem[];
}

/**
 * 反馈亮点
 */
export interface InspectionHighlights {
  improvements: string[];
  concerns: string[];
}

/**
 * 导出类型供外部使用
 */
export type { Merchant, ChecklistItem, PhotoAttachment, QuickRating };
