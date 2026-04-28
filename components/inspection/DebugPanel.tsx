'use client';

import React from 'react';
import { CheckInData, QuickRating, VoiceNote, PhotoAttachment } from '@/types';

interface DebugPanelProps {
  checkIn: CheckInData | null;
  photos: PhotoAttachment[];
  audioNote: VoiceNote | null;
  rating: QuickRating | null;
}

export default function DebugPanel({ checkIn, photos, audioNote, rating }: DebugPanelProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-gray-700 text-sm font-medium"
      >
        🐛 Debug {isOpen ? '▼' : '▲'}
      </button>

      {isOpen && (
        <div className="absolute bottom-12 right-0 w-96 max-h-96 overflow-y-auto bg-white border-2 border-gray-800 rounded-lg shadow-2xl p-4 text-xs">
          <h3 className="font-bold text-sm mb-3 text-gray-900">调试信息</h3>

          <div className="space-y-3">
            {/* Check-in Status */}
            <div className="border-b pb-2">
              <div className="font-semibold text-gray-700 mb-1">签到状态</div>
              <div className={`${checkIn ? 'text-green-600' : 'text-red-600'}`}>
                {checkIn ? '✅ 已签到' : '❌ 未签到'}
              </div>
              {checkIn && (
                <div className="mt-1 text-gray-600">
                  <div>位置: {checkIn.location.latitude.toFixed(4)}, {checkIn.location.longitude.toFixed(4)}</div>
                  <div>时间: {new Date(checkIn.timestamp).toLocaleTimeString()}</div>
                </div>
              )}
            </div>

            {/* Photos */}
            <div className="border-b pb-2">
              <div className="font-semibold text-gray-700 mb-1">照片</div>
              <div className={`${photos.length > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                {photos.length} 张照片
              </div>
            </div>

            {/* Audio */}
            <div className="border-b pb-2">
              <div className="font-semibold text-gray-700 mb-1">语音</div>
              <div className={`${audioNote ? 'text-green-600' : 'text-gray-500'}`}>
                {audioNote ? '✅ 已录制' : '❌ 未录制'}
              </div>
              {audioNote && (
                <div className="mt-1 text-gray-600">
                  <div>时长: {audioNote.duration}s</div>
                  <div>转写: {audioNote.transcript ? `"${audioNote.transcript.substring(0, 50)}..."` : '无'}</div>
                </div>
              )}
            </div>

            {/* Rating */}
            <div className="border-b pb-2">
              <div className="font-semibold text-gray-700 mb-1">评分</div>
              <div className={`${rating ? 'text-green-600' : 'text-gray-500'}`}>
                {rating ? '✅ 已评分' : '❌ 未评分'}
              </div>
              {rating && (
                <div className="mt-1 text-gray-600">
                  <div>员工: {rating.ratings.staffCondition}</div>
                  <div>货品: {rating.ratings.merchandiseDisplay}</div>
                  <div>环境: {rating.ratings.storeEnvironment}</div>
                </div>
              )}
            </div>

            {/* Real-time Diagnostics Visibility */}
            <div className="border-b pb-2">
              <div className="font-semibold text-gray-700 mb-1">实时诊断组件</div>
              <div className={`${checkIn ? 'text-green-600' : 'text-red-600'}`}>
                {checkIn ? '✅ 应该显示' : '❌ 不显示（需要先签到）'}
              </div>
            </div>

            {/* Browser Support */}
            <div>
              <div className="font-semibold text-gray-700 mb-1">浏览器支持</div>
              <div className="space-y-1 text-gray-600">
                <div>定位: {navigator.geolocation ? '✅' : '❌'}</div>
                <div>语音识别: {('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) ? '✅' : '❌'}</div>
                <div>HTTPS: {window.location.protocol === 'https:' ? '✅' : '❌'}</div>
                <div>协议: {window.location.protocol}</div>
                <div>主机: {window.location.host}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
