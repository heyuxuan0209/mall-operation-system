'use client';

import React from 'react';
import { CheckCircle, TrendingUp, TrendingDown, Minus, X } from 'lucide-react';

interface SaveFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  merchantName: string;
  oldScore: number;
  newScore: number;
  highlights: {
    improvements: string[];
    concerns: string[];
  };
}

export default function SaveFeedbackModal({
  isOpen,
  onClose,
  merchantName,
  oldScore,
  newScore,
  highlights,
}: SaveFeedbackModalProps) {
  if (!isOpen) return null;

  const scoreChange = newScore - oldScore;
  const hasImprovement = scoreChange > 0;
  const hasDecline = scoreChange < 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* 头部 */}
        <div className="relative bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-8 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <CheckCircle size={32} className="text-green-300" />
            <h3 className="text-2xl font-bold">保存成功！</h3>
          </div>
          <p className="text-brand-100">
            已为 <span className="font-semibold">{merchantName}</span> 保存巡店记录
          </p>
        </div>

        {/* 健康度变化 */}
        <div className="p-6 border-b border-gray-200">
          <h4 className="text-sm font-medium text-gray-500 mb-3">健康度变化</h4>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{oldScore}</div>
              <div className="text-xs text-gray-500 mt-1">之前</div>
            </div>

            <div className="flex-1 mx-6 flex items-center justify-center">
              {hasImprovement && (
                <div className="flex items-center gap-2 text-green-600">
                  <TrendingUp size={24} />
                  <span className="text-xl font-bold">+{scoreChange}</span>
                </div>
              )}
              {hasDecline && (
                <div className="flex items-center gap-2 text-red-600">
                  <TrendingDown size={24} />
                  <span className="text-xl font-bold">{scoreChange}</span>
                </div>
              )}
              {!hasImprovement && !hasDecline && (
                <div className="flex items-center gap-2 text-gray-400">
                  <Minus size={24} />
                  <span className="text-xl font-bold">0</span>
                </div>
              )}
            </div>

            <div className="text-center">
              <div className={`text-3xl font-bold ${
                hasImprovement ? 'text-green-600' : hasDecline ? 'text-red-600' : 'text-gray-900'
              }`}>
                {newScore}
              </div>
              <div className="text-xs text-gray-500 mt-1">现在</div>
            </div>
          </div>

          {/* 分数变化说明 */}
          {scoreChange !== 0 && (
            <div className={`mt-4 p-3 rounded-lg ${
              hasImprovement ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              <p className="text-sm font-medium">
                {hasImprovement ? '🎉 健康度有所提升' : '⚠️ 健康度有所下降'}
              </p>
            </div>
          )}
        </div>

        {/* 改进亮点 */}
        {highlights.improvements.length > 0 && (
          <div className="p-6 border-b border-gray-200">
            <h4 className="text-sm font-medium text-gray-500 mb-3">✨ 改进亮点</h4>
            <ul className="space-y-2">
              {highlights.improvements.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 关注点 */}
        {highlights.concerns.length > 0 && (
          <div className="p-6 border-b border-gray-200">
            <h4 className="text-sm font-medium text-gray-500 mb-3">⚠️ 需要关注</h4>
            <ul className="space-y-2">
              {highlights.concerns.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-orange-500 mt-0.5">!</span>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 底部按钮 */}
        <div className="p-6">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium"
          >
            知道了
          </button>
        </div>
      </div>
    </div>
  );
}
