'use client';

import React from 'react';
import { Camera, Upload, X, Image as ImageIcon } from 'lucide-react';
import { MediaAttachment } from '@/types';
import { useImageUpload } from '@/hooks/useImageUpload';

interface ImageUploaderProps {
  maxImages?: number;
  onImagesChange?: (images: MediaAttachment[]) => void;
  initialImages?: MediaAttachment[];
}

export default function ImageUploader({
  maxImages = 5,
  onImagesChange,
  initialImages = [],
}: ImageUploaderProps) {
  const { images, isUploading, uploadImage, capturePhoto, deleteImage, storageInfo, error } =
    useImageUpload(maxImages);

  // 初始化图片
  React.useEffect(() => {
    if (initialImages.length > 0 && images.length === 0) {
      // 这里可以设置初始图片
    }
  }, [initialImages]);

  // 通知父组件图片变化
  React.useEffect(() => {
    if (onImagesChange) {
      onImagesChange(images);
    }
  }, [images, onImagesChange]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadImage(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      uploadImage(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="space-y-4">
      {/* 上传区域 */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-brand-500 transition-colors"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="flex flex-col items-center gap-3">
          <ImageIcon size={48} className="text-gray-400" />
          <p className="text-sm text-gray-600">
            拖拽图片到这里，或点击下方按钮
          </p>
          <div className="flex gap-3">
            {/* 拍照按钮（移动端优先） */}
            <button
              onClick={capturePhoto}
              disabled={isUploading || images.length >= maxImages}
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Camera size={20} />
              拍照
            </button>

            {/* 文件选择按钮 */}
            <label className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 cursor-pointer disabled:opacity-50 transition-colors">
              <Upload size={20} />
              选择图片
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={isUploading || images.length >= maxImages}
                className="hidden"
              />
            </label>
          </div>
          <p className="text-xs text-gray-500">
            {images.length}/{maxImages} 张 · 支持 JPG、PNG、GIF · 最大 2MB
          </p>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* 存储使用情况 */}
      {storageInfo.percentage > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-600">
            <span>存储使用</span>
            <span>{storageInfo.percentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-brand-600 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(storageInfo.percentage, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* 图片预览网格 */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden"
            >
              {/* 图片 */}
              <img
                src={image.thumbnail || image.data}
                alt="上传的图片"
                className="w-full h-full object-cover"
              />

              {/* 删除按钮 */}
              <button
                onClick={() => deleteImage(image.id)}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <X size={16} />
              </button>

              {/* 图片信息 */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-xs text-white truncate">
                  {(image.size / 1024).toFixed(0)} KB
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loading状态 */}
      {isUploading && (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-brand-600" />
          <span>上传中...</span>
        </div>
      )}
    </div>
  );
}
