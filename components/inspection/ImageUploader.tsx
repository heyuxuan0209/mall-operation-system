'use client';

import React from 'react';
import { Camera, Upload, X, Image as ImageIcon, Tag, Info, Check } from 'lucide-react';
import { PhotoAttachment } from '@/types';
import { useImageUpload } from '@/hooks/useImageUpload';

interface ImageUploaderProps {
  maxImages?: number;
  onImagesChange?: (images: PhotoAttachment[]) => void;
  initialImages?: PhotoAttachment[];
}

// Phase 3: 拍照分类定义
const photoCategories = {
  people: {
    label: '人（员工）',
    icon: '👥',
    color: 'blue' as const,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-700',
    tags: ['着装规范', '服务态度', '培训现场', '团队合作', '着装问题', '服务问题'],
  },
  merchandise: {
    label: '货（商品）',
    icon: '📦',
    color: 'green' as const,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-500',
    textColor: 'text-green-700',
    tags: ['陈列整齐', '商品丰富', '标价清晰', '陈列混乱', '断货', '库存积压'],
  },
  place: {
    label: '场（环境）',
    icon: '🏪',
    color: 'purple' as const,
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-500',
    textColor: 'text-purple-700',
    tags: ['环境整洁', '灯光明亮', '装修良好', '卫生问题', '设施损坏', '安全隐患'],
  },
};

const issueLevels = {
  good: { label: '良好', color: 'bg-green-500', textColor: 'text-green-700' },
  normal: { label: '一般', color: 'bg-gray-500', textColor: 'text-gray-700' },
  warning: { label: '警告', color: 'bg-orange-500', textColor: 'text-orange-700' },
  critical: { label: '严重', color: 'bg-red-500', textColor: 'text-red-700' },
};

type PhotoCategory = keyof typeof photoCategories;
type IssueLevel = keyof typeof issueLevels;

export default function ImageUploader({
  maxImages = 5,
  onImagesChange,
  initialImages = [],
}: ImageUploaderProps) {
  const { images: baseImages, isUploading, uploadImage: baseUploadImage, capturePhoto: baseCapturePhoto, deleteImage, storageInfo, error } =
    useImageUpload(maxImages);

  // Phase 3: 扩展为 PhotoAttachment
  const [photos, setPhotos] = React.useState<PhotoAttachment[]>([]);
  const [pendingPhoto, setPendingPhoto] = React.useState<PhotoAttachment | null>(null);
  const [showClassifyModal, setShowClassifyModal] = React.useState(false);
  const [selectedCategory, setSelectedCategory] = React.useState<PhotoCategory | null>(null);
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [description, setDescription] = React.useState('');
  const [issueLevel, setIssueLevel] = React.useState<IssueLevel>('good');
  const [filterCategory, setFilterCategory] = React.useState<PhotoCategory | 'all'>('all');
  const prevBaseImagesRef = React.useRef<PhotoAttachment[]>([]);

  // 监听 baseImages 变化，当有新图片时弹出分类选择
  React.useEffect(() => {
    const newPhotos = baseImages.filter(
      img => !prevBaseImagesRef.current.some(prev => prev.id === img.id)
    );

    if (newPhotos.length > 0) {
      // 有新图片上传，弹出分类选择
      setPendingPhoto(newPhotos[0]);
      setShowClassifyModal(true);
      setSelectedCategory(null);
      setSelectedTags([]);
      setDescription('');
      setIssueLevel('good');
    }

    prevBaseImagesRef.current = baseImages;
  }, [baseImages]);

  // 通知父组件图片变化
  React.useEffect(() => {
    if (onImagesChange) {
      onImagesChange(photos);
    }
  }, [photos, onImagesChange]);

  // 包装上传和拍照方法
  const uploadImage = async (file: File) => {
    await baseUploadImage(file);
  };

  const capturePhoto = async () => {
    await baseCapturePhoto();
  };

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

  // 确认分类并添加到photos列表
  const handleConfirmClassify = () => {
    if (!pendingPhoto || !selectedCategory) return;

    const classifiedPhoto: PhotoAttachment = {
      ...pendingPhoto,
      category: selectedCategory,
      tags: selectedTags,
      description: description || undefined,
      issueLevel,
    };

    setPhotos(prev => [...prev, classifiedPhoto]);
    setShowClassifyModal(false);
    setPendingPhoto(null);
  };

  // 取消分类
  const handleCancelClassify = () => {
    if (pendingPhoto) {
      deleteImage(pendingPhoto.id);
    }
    setShowClassifyModal(false);
    setPendingPhoto(null);
  };

  // 切换标签选择
  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // 删除已分类的照片
  const handleDeletePhoto = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
    deleteImage(id);
  };

  // 获取筛选后的照片
  const filteredPhotos = filterCategory === 'all'
    ? photos
    : photos.filter(p => p.category === filterCategory);

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
              disabled={isUploading || photos.length >= maxImages}
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
                disabled={isUploading || photos.length >= maxImages}
                className="hidden"
              />
            </label>
          </div>
          <p className="text-xs text-gray-500">
            {photos.length}/{maxImages} 张 · 支持 JPG、PNG、GIF · 最大 2MB
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

      {/* 分类筛选 */}
      {photos.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filterCategory === 'all'
                ? 'bg-brand-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            全部 ({photos.length})
          </button>
          {Object.entries(photoCategories).map(([key, cat]) => {
            const count = photos.filter(p => p.category === key).length;
            return (
              <button
                key={key}
                onClick={() => setFilterCategory(key as PhotoCategory)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filterCategory === key
                    ? `${cat.bgColor} ${cat.textColor} border ${cat.borderColor}`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.icon} {cat.label} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* 图片预览网格 */}
      {filteredPhotos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filteredPhotos.map((photo) => {
            const category = photoCategories[photo.category];
            const level = photo.issueLevel ? issueLevels[photo.issueLevel] : null;
            return (
              <div
                key={photo.id}
                className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden"
              >
                {/* 图片 */}
                <img
                  src={photo.thumbnail || photo.data}
                  alt="上传的图片"
                  className="w-full h-full object-cover"
                />

                {/* 分类标签 */}
                <div className="absolute top-2 left-2 flex gap-1">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${category.bgColor} ${category.textColor}`}>
                    {category.icon} {category.label}
                  </span>
                  {level && (
                    <span className={`px-2 py-0.5 rounded text-xs font-medium text-white ${level.color}`}>
                      {level.label}
                    </span>
                  )}
                </div>

                {/* 删除按钮 */}
                <button
                  onClick={() => handleDeletePhoto(photo.id)}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                >
                  <X size={16} />
                </button>

                {/* 标签信息 */}
                {photo.tags.length > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1 flex-wrap">
                      {photo.tags.slice(0, 2).map((tag, i) => (
                        <span key={i} className="text-xs text-white bg-white/20 px-1.5 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                      {photo.tags.length > 2 && (
                        <span className="text-xs text-white">+{photo.tags.length - 2}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Loading状态 */}
      {isUploading && (
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-brand-600" />
          <span>上传中...</span>
        </div>
      )}

      {/* 分类弹窗 */}
      {showClassifyModal && pendingPhoto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* 弹窗头部 */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">照片分类</h3>
              <p className="text-sm text-gray-500 mt-1">请为这张照片选择分类和标签</p>
            </div>

            {/* 弹窗内容 */}
            <div className="p-6 space-y-6">
              {/* 照片预览 */}
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={pendingPhoto.thumbnail || pendingPhoto.data}
                  alt="待分类照片"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* 选择分类 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Tag size={16} className="inline mr-1" />
                  选择分类 *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(photoCategories).map(([key, cat]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedCategory(key as PhotoCategory)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedCategory === key
                          ? `${cat.borderColor} ${cat.bgColor}`
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-3xl mb-2">{cat.icon}</div>
                      <div className={`text-sm font-medium ${
                        selectedCategory === key ? cat.textColor : 'text-gray-700'
                      }`}>
                        {cat.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 选择标签 */}
              {selectedCategory && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    选择标签（可多选）
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {photoCategories[selectedCategory].tags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          selectedTags.includes(tag)
                            ? `${photoCategories[selectedCategory].bgColor} ${photoCategories[selectedCategory].textColor} border ${photoCategories[selectedCategory].borderColor}`
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {selectedTags.includes(tag) && <Check size={14} className="inline mr-1" />}
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 问题等级 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  问题等级
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(issueLevels).map(([key, level]) => (
                    <button
                      key={key}
                      onClick={() => setIssueLevel(key as IssueLevel)}
                      className={`p-2 rounded-lg text-xs font-medium transition-all ${
                        issueLevel === key
                          ? `${level.color} text-white`
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 备注说明 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  备注说明（可选）
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="描述照片中的情况..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none text-sm"
                />
              </div>
            </div>

            {/* 弹窗底部 */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3">
              <button
                onClick={handleCancelClassify}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleConfirmClassify}
                disabled={!selectedCategory}
                className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
