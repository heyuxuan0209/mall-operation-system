/**
 * Image Processor Skill
 * 图片处理器技能模块
 *
 * 提供浏览器端图片压缩和处理功能：
 * - Canvas图片压缩
 * - 缩略图生成
 * - Blob/Base64转换
 * - 大小计算
 *
 * @module skills/image-processor
 */

// 导出压缩和处理功能
export {
  compressImage,
  generateThumbnail,
  blobToBase64,
  getBase64Size,
} from './compression';

// 导出类型定义
export type {
  CompressionOptions,
  ThumbnailOptions,
} from './types';
