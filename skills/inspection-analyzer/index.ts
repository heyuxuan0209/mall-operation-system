/**
 * Inspection Analyzer Skill
 * 巡检分析器技能模块
 *
 * 提供巡检相关的智能分析功能：
 * - 商户画像生成
 * - 核心观察点生成
 * - 智能检查清单
 * - 问题提取和亮点生成
 *
 * @module skills/inspection-analyzer
 */

// 导出洞察相关功能
export {
  generateMerchantInsights,
  generateFocusPoints,
} from './insights';

// 导出检查清单功能
export {
  generateChecklist,
} from './checklist';

// 导出亮点和问题提取功能
export {
  extractIssuesFromPhotos,
  generateHighlights,
} from './highlights';

// 导出类型定义
export type {
  MerchantInsights,
  ChecklistResult,
  InspectionHighlights,
} from './types';
