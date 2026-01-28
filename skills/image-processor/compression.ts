/**
 * Image Processor - Compression Module
 * 图片处理器 - 压缩模块
 *
 * 提供浏览器端图片压缩和处理功能
 */

import { CompressionOptions, ThumbnailOptions } from './types';

/**
 * 压缩图片到目标尺寸
 * 使用Canvas API进行客户端压缩，保持宽高比
 *
 * @param file - 原始图片文件
 * @param maxSize - 最大宽/高（默认1920）
 * @param quality - JPEG质量（0-1，默认0.85）
 * @returns 压缩后的Blob对象
 */
export async function compressImage(
  file: File,
  maxSize: number = 1920,
  quality: number = 0.85
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // 计算新尺寸（保持宽高比）
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        // 创建canvas并压缩
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * 生成缩略图
 * 裁剪为正方形并缩放到指定尺寸
 *
 * @param file - 原始图片文件
 * @param size - 缩略图尺寸（默认200）
 * @returns Base64格式的缩略图数据
 */
export async function generateThumbnail(
  file: File,
  size: number = 200
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // 计算缩略图尺寸（裁剪为正方形）
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;

        canvas.width = size;
        canvas.height = size;

        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);

        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * 将Blob转为Base64格式
 *
 * @param blob - Blob对象
 * @returns Base64格式的数据URL
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * 计算Base64数据的字节大小
 * 用于估算存储空间占用
 *
 * @param base64 - Base64格式的数据
 * @returns 字节数
 */
export function getBase64Size(base64: string): number {
  // 去掉data:image/jpeg;base64,前缀
  const base64Data = base64.split(',')[1] || base64;
  // Base64编码：每4个字符代表3个字节
  return Math.ceil(base64Data.length * 0.75);
}
