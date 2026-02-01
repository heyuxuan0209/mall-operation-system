'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Camera, Mic, MapPin, Star, Save, List } from 'lucide-react';
import ImageUploader from '@/components/inspection/ImageUploader';
import VoiceRecorder from '@/components/inspection/VoiceRecorder';
import QuickCheckIn from '@/components/inspection/QuickCheckIn';
import QuickRatingComponent from '@/components/inspection/QuickRating';
import SaveFeedbackModal from '@/components/inspection/SaveFeedbackModal';
import ReturnToArchiveButton from '@/components/ui/ReturnToArchiveButton';
import { PhotoAttachment, CheckInData, QuickRating, Merchant, VoiceNote } from '@/types';
import { inspectionServiceInstance } from '@/utils/inspectionService';
import { DEFAULT_MERCHANT_LOCATION } from '@/utils/merchantData';
import { mockMerchants } from '@/data/merchants/mock-data';

export default function InspectionPage() {
  // Phase 4: 集成保存流程和反馈弹窗
  const [photos, setPhotos] = useState<PhotoAttachment[]>([]);
  const [audioNote, setAudioNote] = useState<VoiceNote | null>(null);
  const [checkIn, setCheckIn] = useState<CheckInData | null>(null);
  const [rating, setRating] = useState<QuickRating | null>(null);
  const [textNotes, setTextNotes] = useState('');

  // 反馈弹窗状态
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState<{
    merchantName: string;
    oldScore: number;
    newScore: number;
    highlights: {
      improvements: string[];
      concerns: string[];
    };
  } | null>(null);

  // 商户数据
  const [merchant, setMerchant] = useState<Merchant | null>(null);

  // 返回导航状态
  const [fromArchive, setFromArchive] = useState(false);
  const [returnPath, setReturnPath] = useState('');
  const [returnLabel, setReturnLabel] = useState('');

  // 初始化商户数据
  useEffect(() => {
    // 从URL参数获取商户ID，默认为M001（海底捞）
    let merchantId = 'M001';
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const paramMerchantId = urlParams.get('merchantId');
      if (paramMerchantId) {
        merchantId = paramMerchantId;
      }
    }

    // 加载商户数据
    const merchantData = mockMerchants.find(m => m.id === merchantId);
    setMerchant(merchantData || mockMerchants[0]);
  }, []);

  // 如果商户数据还未加载，显示加载状态
  if (!merchant) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  const merchantLocation = DEFAULT_MERCHANT_LOCATION;

  const handleSaveInspection = () => {
    // 使用巡检服务保存记录并获取反馈
    const result = inspectionServiceInstance.saveInspection(
      merchant,
      checkIn!,
      rating,
      photos,
      audioNote ? [audioNote] : [],
      audioNote?.transcript || textNotes
    );

    // 显示反馈弹窗
    setFeedbackData(result.feedback);
    setShowFeedback(true);
  };

  const handleCloseFeedback = () => {
    setShowFeedback(false);

    // 重置表单
    setPhotos([]);
    setAudioNote(null);
    setCheckIn(null);
    setRating(null);
    setTextNotes('');
  };

  const canSave = checkIn !== null;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      setFromArchive(urlParams.get('fromArchive') === 'true');

      const from = urlParams.get('from');
      if (from) {
        setReturnPath(from);
        // 根据来源路径设置返回按钮文字
        if (from === '/health') {
          setReturnLabel('返回健康度监控');
        } else if (from === '/tasks') {
          setReturnLabel('返回任务中心');
        } else {
          setReturnLabel('返回');
        }
      }
    }
  }, []);

  // 获取返回链接（当不是从档案跳转时使用）
  const getBackLink = () => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const from = urlParams.get('from');
      return from || '/health';
    }
    return '/health';
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 lg:pb-8">
      {/* 页面头部 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* 返回按钮 - 根据来源显示不同的返回选项 */}
              {fromArchive ? (
                <ReturnToArchiveButton merchantId={merchant.id} />
              ) : returnPath ? (
                <Link
                  href={`${returnPath}?merchantId=${merchant.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm"
                >
                  <i className="fas fa-arrow-left"></i>
                  {returnLabel}
                </Link>
              ) : (
                <a
                  href={getBackLink()}
                  className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
                  title="返回"
                >
                  <i className="fa-solid fa-arrow-left"></i>
                </a>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">现场巡店</h1>
                <p className="text-sm text-gray-500 mt-1">
                  {merchant.name} · 快速记录现场情况
                </p>
              </div>
            </div>
            <a
              href="/inspection/batch"
              className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-all text-sm font-medium"
            >
              <List size={18} />
              <span>批量巡检</span>
            </a>
          </div>
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
            merchantLocation={merchantLocation}
            merchant={merchant}
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
            onRecordComplete={(voiceNote) => {
              setAudioNote(voiceNote);
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

      {/* 反馈弹窗 */}
      {showFeedback && feedbackData && (
        <SaveFeedbackModal
          isOpen={showFeedback}
          onClose={handleCloseFeedback}
          merchantName={feedbackData.merchantName}
          oldScore={feedbackData.oldScore}
          newScore={feedbackData.newScore}
          highlights={feedbackData.highlights}
        />
      )}
    </div>
  );
}
