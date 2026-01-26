'use client';

import React, { useState } from 'react';
import { Camera, Mic, MapPin, Star, Save } from 'lucide-react';
import ImageUploader from '@/components/inspection/ImageUploader';
import VoiceRecorder from '@/components/inspection/VoiceRecorder';
import QuickCheckIn from '@/components/inspection/QuickCheckIn';
import QuickRatingComponent from '@/components/inspection/QuickRating';
import { MediaAttachment, CheckInData, QuickRating } from '@/types';

export default function InspectionPage() {
  const [photos, setPhotos] = useState<MediaAttachment[]>([]);
  const [audioNote, setAudioNote] = useState<{ attachment: MediaAttachment; transcript?: string } | null>(null);
  const [checkIn, setCheckIn] = useState<CheckInData | null>(null);
  const [rating, setRating] = useState<QuickRating | null>(null);
  const [textNotes, setTextNotes] = useState('');

  // 模拟商户信息
  const merchant = {
    id: 'M001',
    name: '星巴克咖啡',
    location: { lat: 31.230416, lng: 121.473701 }, // 示例坐标（上海）
  };

  const handleSaveInspection = () => {
    const inspection = {
      id: `inspection_${Date.now()}`,
      merchantId: merchant.id,
      merchantName: merchant.name,
      inspectorId: 'user_001',
      inspectorName: '当前用户',
      checkIn: checkIn!,
      rating,
      photos,
      audioNotes: audioNote ? [audioNote.attachment] : [],
      textNotes: audioNote?.transcript || textNotes,
      issues: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 保存到LocalStorage
    const stored = localStorage.getItem('inspection_records');
    const records = stored ? JSON.parse(stored) : [];
    records.unshift(inspection);
    localStorage.setItem('inspection_records', JSON.stringify(records));

    alert('巡店记录已保存！');

    // 重置表单
    setPhotos([]);
    setAudioNote(null);
    setCheckIn(null);
    setRating(null);
    setTextNotes('');
  };

  const canSave = checkIn !== null;

  return (
    <div className="min-h-screen bg-slate-50 pb-20 lg:pb-8">
      {/* 页面头部 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">现场巡店</h1>
          <p className="text-sm text-gray-500 mt-1">
            {merchant.name} · 快速记录现场情况
          </p>
        </div>
      </div>

      {/* 主内容 */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 快捷签到 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={20} className="text-brand-600" />
            <h2 className="text-lg font-semibold text-gray-900">快捷签到</h2>
          </div>
          <QuickCheckIn
            merchantId={merchant.id}
            merchantName={merchant.name}
            merchantLocation={merchant.location}
            onCheckIn={setCheckIn}
          />
        </div>

        {/* 拍照记录 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Camera size={20} className="text-brand-600" />
            <h2 className="text-lg font-semibold text-gray-900">拍照记录</h2>
            <span className="text-sm text-gray-500">({photos.length}/5)</span>
          </div>
          <ImageUploader maxImages={5} onImagesChange={setPhotos} />
        </div>

        {/* 语音笔记 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Mic size={20} className="text-brand-600" />
            <h2 className="text-lg font-semibold text-gray-900">语音笔记</h2>
          </div>
          <VoiceRecorder
            maxDuration={120}
            withSpeechRecognition={true}
            onRecordComplete={(attachment, transcript) => {
              setAudioNote({ attachment, transcript });
            }}
          />
        </div>

        {/* 快速评分 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Star size={20} className="text-brand-600" />
            <h2 className="text-lg font-semibold text-gray-900">快速评分</h2>
          </div>
          <QuickRatingComponent
            merchantId={merchant.id}
            onRatingChange={setRating}
          />
        </div>

        {/* 其他备注 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">其他备注</h2>
          <textarea
            value={textNotes}
            onChange={(e) => setTextNotes(e.target.value)}
            placeholder="记录其他需要说明的内容..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
          />
        </div>

        {/* 保存按钮 */}
        <div className="sticky bottom-4 lg:bottom-8">
          <button
            onClick={handleSaveInspection}
            disabled={!canSave}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg active:scale-95"
          >
            <Save size={20} />
            <span className="text-lg font-semibold">
              {canSave ? '保存巡店记录' : '请先完成签到'}
            </span>
          </button>
        </div>

        {/* 功能说明 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
          <h3 className="font-semibold mb-2">💡 使用提示</h3>
          <ul className="space-y-1 list-disc list-inside">
            <li>签到功能会记录您的位置信息</li>
            <li>拍照功能支持压缩，每张图片限制2MB</li>
            <li>语音笔记支持自动转文字（需浏览器支持）</li>
            <li>快速评分可以使用预设或滑动调整</li>
            <li>所有数据暂存在浏览器本地</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
