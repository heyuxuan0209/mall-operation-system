'use client';

import { useState, useCallback, useEffect } from 'react';
import { MediaAttachment } from '@/types';
import { imageStorage } from '@/utils/imageStorage';

interface UseImageUploadReturn {
  images: MediaAttachment[];
  isUploading: boolean;
  uploadImage: (file: File) => Promise<void>;
  capturePhoto: () => Promise<void>;
  deleteImage: (id: string) => void;
  storageInfo: { used: number; total: number; percentage: number };
  error: string | null;
}

export function useImageUpload(maxImages: number = 5): UseImageUploadReturn {
  const [images, setImages] = useState<MediaAttachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [storageInfo, setStorageInfo] = useState({ used: 0, total: 5242880, percentage: 0 });

  // 初始化存储信息（仅客户端）
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setStorageInfo(imageStorage.getStorageInfo());
    }
  }, []);

  const uploadImage = useCallback(async (file: File) => {
    if (images.length >= maxImages) {
      setError(`最多只能上传${maxImages}张图片`);
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // 获取地理位置（可选）
      let geolocation: GeolocationPosition | undefined;
      try {
        geolocation = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
          });
        });
      } catch {
        // 忽略定位错误
      }

      const attachment = await imageStorage.uploadImage(file, geolocation);
      setImages(prev => [...prev, attachment]);
      setStorageInfo(imageStorage.getStorageInfo());
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败');
    } finally {
      setIsUploading(false);
    }
  }, [images.length, maxImages]);

  const capturePhoto = useCallback(async () => {
    if (images.length >= maxImages) {
      setError(`最多只能上传${maxImages}张图片`);
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // 获取地理位置（可选）
      let geolocation: GeolocationPosition | undefined;
      try {
        geolocation = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
          });
        });
      } catch {
        // 忽略定位错误
      }

      const attachment = await imageStorage.captureFromCamera(geolocation);
      setImages(prev => [...prev, attachment]);
      setStorageInfo(imageStorage.getStorageInfo());
    } catch (err) {
      setError(err instanceof Error ? err.message : '拍照失败');
    } finally {
      setIsUploading(false);
    }
  }, [images.length, maxImages]);

  const deleteImage = useCallback((id: string) => {
    imageStorage.deleteImage(id);
    setImages(prev => prev.filter(img => img.id !== id));
    setStorageInfo(imageStorage.getStorageInfo());
  }, []);

  return {
    images,
    isUploading,
    uploadImage,
    capturePhoto,
    deleteImage,
    storageInfo,
    error,
  };
}
