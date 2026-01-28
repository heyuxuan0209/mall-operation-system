import { MediaAttachment, PhotoAttachment } from '@/types';
import { compressImage, generateThumbnail, blobToBase64, getBase64Size } from '@/skills/image-processor';

/**
 * 图片存储服务
 */
class ImageStorageService {
  private static instance: ImageStorageService;

  // 配置
  private readonly MAX_IMAGE_SIZE = 1920;      // 最大宽/高
  private readonly QUALITY = 0.85;             // JPEG质量
  private readonly MAX_FILE_SIZE = 2 * 1024 * 1024;  // 2MB per image
  private readonly THUMBNAIL_SIZE = 200;
  private readonly MAX_IMAGES = 50;            // 最多存储50张图片

  // 存储键
  private readonly STORAGE_KEY = 'inspection_images';
  private readonly METADATA_KEY = 'inspection_images_meta';

  private constructor() {}

  static getInstance(): ImageStorageService {
    if (!ImageStorageService.instance) {
      ImageStorageService.instance = new ImageStorageService();
    }
    return ImageStorageService.instance;
  }

  /**
   * 上传并压缩图片
   */
  async uploadImage(
    file: File,
    geolocation?: GeolocationPosition
  ): Promise<PhotoAttachment> {
    // 1. 校验文件类型
    if (!file.type.startsWith('image/')) {
      throw new Error('只支持图片文件');
    }

    // 2. 压缩图片
    const compressedBlob = await compressImage(
      file,
      this.MAX_IMAGE_SIZE,
      this.QUALITY
    );

    // 3. 检查压缩后大小
    if (compressedBlob.size > this.MAX_FILE_SIZE) {
      throw new Error(`图片过大，压缩后仍超过${this.MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    // 4. 生成缩略图
    const thumbnail = await generateThumbnail(file, this.THUMBNAIL_SIZE);

    // 5. 转Base64
    const base64 = await blobToBase64(compressedBlob);

    // 6. 创建PhotoAttachment对象（暂不包含分类，由组件层添加）
    const attachment: PhotoAttachment = {
      id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'image',
      data: base64,
      thumbnail,
      size: compressedBlob.size,
      mimeType: file.type,
      createdAt: new Date().toISOString(),
      geolocation: geolocation ? {
        latitude: geolocation.coords.latitude,
        longitude: geolocation.coords.longitude,
        accuracy: geolocation.coords.accuracy,
      } : undefined,
      // Phase 3: 分类标注字段（由组件层设置）
      category: 'place',
      tags: [],
    };

    // 7. 存储
    this.saveImage(attachment);

    return attachment;
  }

  /**
   * 从相机拍摄（移动端）
   */
  async captureFromCamera(
    geolocation?: GeolocationPosition
  ): Promise<PhotoAttachment> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment'; // 使用后置摄像头

      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          try {
            const attachment = await this.uploadImage(file, geolocation);
            resolve(attachment);
          } catch (error) {
            reject(error);
          }
        } else {
          reject(new Error('未选择文件'));
        }
      };

      input.click();
    });
  }

  /**
   * 保存图片到LocalStorage
   */
  private saveImage(attachment: PhotoAttachment): void {
    if (typeof window === 'undefined') return;
    const images = this.getAllImages();
    images.push(attachment);

    // 限制数量
    if (images.length > this.MAX_IMAGES) {
      images.shift(); // 删除最旧的
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(images));
  }

  /**
   * 获取所有图片
   */
  getAllImages(): PhotoAttachment[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * 获取图片
   */
  getImage(id: string): PhotoAttachment | null {
    const images = this.getAllImages();
    return images.find(img => img.id === id) || null;
  }

  /**
   * 删除图片
   */
  deleteImage(id: string): void {
    if (typeof window === 'undefined') return;
    const images = this.getAllImages().filter(img => img.id !== id);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(images));
  }

  /**
   * 清理过期图片（保留最近30天）
   */
  cleanup(retentionDays: number = 30): number {
    if (typeof window === 'undefined') return 0;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const images = this.getAllImages();
    const filteredImages = images.filter(img => {
      const createdDate = new Date(img.createdAt);
      return createdDate > cutoffDate;
    });

    const deletedCount = images.length - filteredImages.length;

    if (deletedCount > 0) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredImages));
    }

    return deletedCount;
  }

  /**
   * 获取存储使用情况
   */
  getStorageInfo(): { used: number; total: number; percentage: number } {
    const images = this.getAllImages();
    const used = images.reduce((sum, img) => sum + getBase64Size(img.data), 0);
    const total = 5 * 1024 * 1024; // 5MB总配额

    return {
      used,
      total,
      percentage: (used / total) * 100,
    };
  }
}

export const imageStorage = ImageStorageService.getInstance();
