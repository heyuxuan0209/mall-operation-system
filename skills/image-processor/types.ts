/**
 * Image Processor Types
 * 图片处理器类型定义
 */

/**
 * 压缩选项
 */
export interface CompressionOptions {
  maxSize?: number;    // 最大宽/高（默认1920）
  quality?: number;    // JPEG质量（0-1，默认0.85）
}

/**
 * 缩略图选项
 */
export interface ThumbnailOptions {
  size?: number;       // 缩略图尺寸（默认200）
  quality?: number;    // JPEG质量（0-1，默认0.7）
}
