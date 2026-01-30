'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Camera, Mic, MapPin, Star, Save, ChevronLeft, ChevronRight, List, CheckCircle, Circle, AlertCircle } from 'lucide-react';
import ImageUploader from '@/components/inspection/ImageUploader';
import VoiceRecorder from '@/components/inspection/VoiceRecorder';
import QuickCheckIn from '@/components/inspection/QuickCheckIn';
import QuickRatingComponent from '@/components/inspection/QuickRating';
import SaveFeedbackModal from '@/components/inspection/SaveFeedbackModal';
import { PhotoAttachment, CheckInData, QuickRating, Merchant, VoiceNote } from '@/types';
import { inspectionServiceInstance } from '@/utils/inspectionService';
import { DEFAULT_MERCHANT_LOCATION } from '@/utils/merchantData';
import { merchantDataManager } from '@/utils/merchantDataManager';

// 草稿数据类型
interface InspectionDraft {
  merchantId: string;
  photos: PhotoAttachment[];
  audioNote: VoiceNote | null;
  checkIn: CheckInData | null;
  rating: QuickRating | null;
  textNotes: string;
  lastSaved: string;
}

// 批量巡检状态类型
interface BatchInspectionStatus {
  merchantId: string;
  completed: boolean;
  hasDraft: boolean;
}

export default function BatchInspectionPage() {
  // 商户列表
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMerchantList, setShowMerchantList] = useState(false);

  // 当前商户巡检数据
  const [photos, setPhotos] = useState<PhotoAttachment[]>([]);
  const [audioNote, setAudioNote] = useState<VoiceNote | null>(null);
  const [checkIn, setCheckIn] = useState<CheckInData | null>(null);
  const [rating, setRating] = useState<QuickRating | null>(null);
  const [textNotes, setTextNotes] = useState('');

  // 批量巡检状态跟踪
  const [inspectionStatus, setInspectionStatus] = useState<BatchInspectionStatus[]>([]);

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

  // 草稿存储的key
  const DRAFT_STORAGE_KEY = 'batch_inspection_drafts';
  const STATUS_STORAGE_KEY = 'batch_inspection_status';

  // 初始化商户列表
  useEffect(() => {
    const allMerchants = merchantDataManager.getAllMerchants();
    setMerchants(allMerchants);

    // 初始化状态
    const savedStatus = loadInspectionStatus();
    if (savedStatus.length === 0) {
      const initialStatus = allMerchants.map(m => ({
        merchantId: m.id,
        completed: false,
        hasDraft: false,
      }));
      setInspectionStatus(initialStatus);
    } else {
      setInspectionStatus(savedStatus);
    }

    // 监听数据变化
    const unsubscribe = merchantDataManager.onMerchantsChange(() => {
      const updatedMerchants = merchantDataManager.getAllMerchants();
      setMerchants(updatedMerchants);
    });

    return unsubscribe;
  }, []);

  // 当前商户
  const currentMerchant = merchants[currentIndex];

  // 加载草稿
  const loadDraft = useCallback((merchantId: string): InspectionDraft | null => {
    if (typeof window === 'undefined') return null;

    try {
      const drafts = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!drafts) return null;

      const allDrafts: Record<string, InspectionDraft> = JSON.parse(drafts);
      return allDrafts[merchantId] || null;
    } catch (error) {
      console.error('加载草稿失败:', error);
      return null;
    }
  }, []);

  // 保存草稿
  const saveDraft = useCallback((merchantId: string) => {
    if (typeof window === 'undefined') return;

    try {
      const draft: InspectionDraft = {
        merchantId,
        photos,
        audioNote,
        checkIn,
        rating,
        textNotes,
        lastSaved: new Date().toISOString(),
      };

      // 读取所有草稿
      const drafts = localStorage.getItem(DRAFT_STORAGE_KEY);
      const allDrafts: Record<string, InspectionDraft> = drafts ? JSON.parse(drafts) : {};

      // 更新当前商户的草稿
      allDrafts[merchantId] = draft;

      // 保存回 localStorage
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(allDrafts));

      // 更新状态
      setInspectionStatus(prev => prev.map(status =>
        status.merchantId === merchantId
          ? { ...status, hasDraft: true }
          : status
      ));
    } catch (error) {
      console.error('保存草稿失败:', error);
    }
  }, [photos, audioNote, checkIn, rating, textNotes]);

  // 加载巡检状态
  const loadInspectionStatus = (): BatchInspectionStatus[] => {
    if (typeof window === 'undefined') return [];

    try {
      const status = localStorage.getItem(STATUS_STORAGE_KEY);
      return status ? JSON.parse(status) : [];
    } catch (error) {
      console.error('加载巡检状态失败:', error);
      return [];
    }
  };

  // 保存巡检状态
  const saveInspectionStatus = useCallback((status: BatchInspectionStatus[]) => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(STATUS_STORAGE_KEY, JSON.stringify(status));
    } catch (error) {
      console.error('保存巡检状态失败:', error);
    }
  }, []);

  // 清除草稿
  const clearDraft = useCallback((merchantId: string) => {
    if (typeof window === 'undefined') return;

    try {
      const drafts = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!drafts) return;

      const allDrafts: Record<string, InspectionDraft> = JSON.parse(drafts);
      delete allDrafts[merchantId];

      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(allDrafts));

      // 更新状态
      setInspectionStatus(prev => prev.map(status =>
        status.merchantId === merchantId
          ? { ...status, hasDraft: false }
          : status
      ));
    } catch (error) {
      console.error('清除草稿失败:', error);
    }
  }, []);

  // 切换商户时：保存当前草稿 + 切换索引（加载草稿由useEffect处理）
  const switchToMerchant = useCallback((index: number) => {
    // 1. 保存当前商户的草稿（如果存在）
    if (currentMerchant) {
      saveDraft(currentMerchant.id);
    }

    // 2. 切换到新商户（草稿加载由useEffect处理，避免竞态条件）
    setCurrentIndex(index);
  }, [currentMerchant, saveDraft]);

  // 当前商户切换时自动加载草稿或重置表单
  useEffect(() => {
    if (!currentMerchant) return;

    const draft = loadDraft(currentMerchant.id);

    if (draft) {
      // 有草稿：恢复草稿数据
      setPhotos(draft.photos || []);
      setAudioNote(draft.audioNote || null);
      setCheckIn(draft.checkIn || null);
      setRating(draft.rating || null);
      setTextNotes(draft.textNotes || '');
    } else {
      // 无草稿：重置表单为空
      setPhotos([]);
      setAudioNote(null);
      setCheckIn(null);
      setRating(null);
      setTextNotes('');
    }
  }, [currentMerchant?.id, loadDraft]); // 依赖currentMerchant.id，确保商户切换时触发

  // 上一家商户
  const goToPrevious = () => {
    if (currentIndex > 0) {
      switchToMerchant(currentIndex - 1);
    }
  };

  // 下一家商户
  const goToNext = () => {
    if (currentIndex < merchants.length - 1) {
      switchToMerchant(currentIndex + 1);
    }
  };

  // 保存巡检记录
  const handleSaveInspection = () => {
    if (!currentMerchant || !checkIn) return;

    const result = inspectionServiceInstance.saveInspection(
      currentMerchant,
      checkIn,
      rating,
      photos,
      audioNote ? [audioNote] : [],
      audioNote?.transcript || textNotes
    );

    // 更新巡检状态为已完成
    const newStatus = inspectionStatus.map(status =>
      status.merchantId === currentMerchant.id
        ? { ...status, completed: true, hasDraft: false }
        : status
    );
    setInspectionStatus(newStatus);
    saveInspectionStatus(newStatus);

    // 清除草稿
    clearDraft(currentMerchant.id);

    // 显示反馈弹窗
    setFeedbackData(result.feedback);
    setShowFeedback(true);
  };

  // 关闭反馈弹窗后自动跳转到下一家商户
  const handleCloseFeedback = () => {
    setShowFeedback(false);

    // 重置表单
    setPhotos([]);
    setAudioNote(null);
    setCheckIn(null);
    setRating(null);
    setTextNotes('');

    // 自动跳转到下一家未完成的商户
    const nextIncompleteIndex = inspectionStatus.findIndex(
      (status, index) => index > currentIndex && !status.completed
    );

    if (nextIncompleteIndex !== -1) {
      switchToMerchant(nextIncompleteIndex);
    } else if (currentIndex < merchants.length - 1) {
      // 如果没有未完成的，就跳到下一家
      goToNext();
    }
  };

  // 计算统计数据
  const completedCount = inspectionStatus.filter(s => s.completed).length;
  const draftCount = inspectionStatus.filter(s => s.hasDraft && !s.completed).length;
  const totalCount = merchants.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const canSave = checkIn !== null;

  if (!currentMerchant) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 lg:pb-8">
      {/* 页面头部 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">批量巡检模式</h1>
              <p className="text-sm text-gray-500 mt-1">
                {currentIndex + 1}/{totalCount} · {currentMerchant.name}
              </p>
            </div>

            {/* 进度统计 */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">进度</div>
                <div className="text-lg font-bold text-brand-600">
                  {completedCount}/{totalCount}
                </div>
              </div>

              {/* 商户列表按钮 */}
              <button
                onClick={() => setShowMerchantList(!showMerchantList)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="商户列表"
              >
                <List size={24} className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* 进度条 */}
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-brand-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* 主内容区 */}
          <div className="flex-1 space-y-6">
            {/* 导航按钮 */}
            <div className="flex gap-3">
              <button
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={20} />
                <span>上一家</span>
              </button>
              <button
                onClick={goToNext}
                disabled={currentIndex === merchants.length - 1}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <span>下一家</span>
                <ChevronRight size={20} />
              </button>
            </div>

            {/* 快捷签到 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={20} className="text-brand-600" />
                <h2 className="text-lg font-semibold text-gray-900">快捷签到</h2>
              </div>
              <QuickCheckIn
                key={`checkin-${currentMerchant.id}`}
                merchantId={currentMerchant.id}
                merchantName={currentMerchant.name}
                merchantLocation={DEFAULT_MERCHANT_LOCATION}
                merchant={currentMerchant}
                initialCheckIn={checkIn}
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
              <ImageUploader
                key={`images-${currentMerchant.id}`}
                maxImages={5}
                onImagesChange={setPhotos}
                initialImages={photos}
              />
            </div>

            {/* 语音笔记 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Mic size={20} className="text-brand-600" />
                <h2 className="text-lg font-semibold text-gray-900">语音笔记</h2>
              </div>
              <VoiceRecorder
                key={`voice-${currentMerchant.id}`}
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
                key={`rating-${currentMerchant.id}`}
                merchantId={currentMerchant.id}
                initialRatings={rating?.ratings}
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

            {/* 操作按钮 */}
            <div className="flex gap-3">
              <button
                onClick={() => saveDraft(currentMerchant.id)}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
              >
                <Save size={20} />
                <span className="text-lg font-semibold">保存草稿</span>
              </button>

              <button
                onClick={handleSaveInspection}
                disabled={!canSave}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg active:scale-95"
              >
                <CheckCircle size={20} />
                <span className="text-lg font-semibold">
                  {canSave ? '完成巡检' : '请先完成签到'}
                </span>
              </button>
            </div>
          </div>

          {/* 商户列表侧边栏 */}
          {showMerchantList && (
            <div className="w-80 bg-white rounded-xl shadow-sm border border-gray-200 p-4 h-fit sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">商户列表</h3>

              <div className="space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                {merchants.map((merchant, index) => {
                  const status = inspectionStatus.find(s => s.merchantId === merchant.id);
                  const isCompleted = status?.completed || false;
                  const hasDraft = status?.hasDraft || false;
                  const isCurrent = index === currentIndex;

                  return (
                    <button
                      key={merchant.id}
                      onClick={() => switchToMerchant(index)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        isCurrent
                          ? 'bg-brand-50 border-brand-300'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isCompleted ? (
                          <CheckCircle size={18} className="text-green-600 flex-shrink-0" />
                        ) : hasDraft ? (
                          <AlertCircle size={18} className="text-orange-500 flex-shrink-0" />
                        ) : (
                          <Circle size={18} className="text-gray-400 flex-shrink-0" />
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {index + 1}. {merchant.name}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {merchant.category} · {merchant.floor}
                          </div>
                        </div>

                        {isCompleted && (
                          <span className="text-xs text-green-600 font-medium">已完成</span>
                        )}
                        {!isCompleted && hasDraft && (
                          <span className="text-xs text-orange-600 font-medium">草稿</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* 统计信息 */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{completedCount}</div>
                    <div className="text-xs text-gray-500">已完成</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">{draftCount}</div>
                    <div className="text-xs text-gray-500">草稿</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-600">
                      {totalCount - completedCount}
                    </div>
                    <div className="text-xs text-gray-500">待巡检</div>
                  </div>
                </div>
              </div>
            </div>
          )}
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
