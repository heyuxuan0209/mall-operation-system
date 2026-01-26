'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { QuickRating } from '@/types';

interface QuickRatingProps {
  merchantId: string;
  initialRatings?: QuickRating['ratings'];
  onRatingChange?: (rating: QuickRating) => void;
}

export default function QuickRatingComponent({
  merchantId,
  initialRatings,
  onRatingChange,
}: QuickRatingProps) {
  const [ratings, setRatings] = useState<QuickRating['ratings']>(
    initialRatings || {
      collection: 70,
      operational: 70,
      siteQuality: 70,
      customerReview: 70,
      riskResistance: 70,
    }
  );
  const [notes, setNotes] = useState('');

  const dimensions = [
    { key: 'collection' as const, label: '租金缴纳', icon: '💰', color: 'blue' },
    { key: 'operational' as const, label: '经营表现', icon: '📈', color: 'green' },
    { key: 'siteQuality' as const, label: '现场品质', icon: '✨', color: 'purple' },
    { key: 'customerReview' as const, label: '顾客满意度', icon: '😊', color: 'yellow' },
    { key: 'riskResistance' as const, label: '抗风险能力', icon: '🛡️', color: 'red' },
  ];

  const presets = [
    { label: '优秀', value: 90, color: 'green' },
    { label: '良好', value: 75, color: 'blue' },
    { label: '一般', value: 60, color: 'yellow' },
    { label: '较差', value: 40, color: 'red' },
  ];

  const handleRatingChange = (key: keyof QuickRating['ratings'], value: number) => {
    const newRatings = { ...ratings, [key]: value };
    setRatings(newRatings);

    if (onRatingChange) {
      const rating: QuickRating = {
        id: `rating_${Date.now()}`,
        merchantId,
        timestamp: new Date().toISOString(),
        ratings: newRatings,
        notes: notes || undefined,
      };
      onRatingChange(rating);
    }
  };

  const applyPreset = (value: number) => {
    const newRatings = {
      collection: value,
      operational: value,
      siteQuality: value,
      customerReview: value,
      riskResistance: value,
    };
    setRatings(newRatings);

    if (onRatingChange) {
      const rating: QuickRating = {
        id: `rating_${Date.now()}`,
        merchantId,
        timestamp: new Date().toISOString(),
        ratings: newRatings,
        notes: notes || undefined,
      };
      onRatingChange(rating);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return '优秀';
    if (score >= 60) return '良好';
    if (score >= 40) return '一般';
    return '较差';
  };

  const averageScore = Math.round(
    (ratings.collection +
      ratings.operational +
      ratings.siteQuality +
      ratings.customerReview +
      ratings.riskResistance) /
      5
  );

  return (
    <div className="space-y-6">
      {/* 综合评分 */}
      <div className="bg-gradient-to-r from-brand-50 to-purple-50 rounded-lg p-6 text-center">
        <div className="text-sm text-gray-600 mb-2">综合评分</div>
        <div className={`text-5xl font-bold ${getScoreColor(averageScore)} mb-1`}>
          {averageScore}
        </div>
        <div className="text-sm text-gray-500">{getScoreLabel(averageScore)}</div>
      </div>

      {/* 快捷预设 */}
      <div className="flex gap-2">
        {presets.map((preset) => (
          <button
            key={preset.value}
            onClick={() => applyPreset(preset.value)}
            className={`flex-1 px-3 py-2 rounded-lg border-2 transition-all hover:scale-105 ${
              preset.color === 'green'
                ? 'border-green-500 hover:bg-green-50 text-green-700'
                : preset.color === 'blue'
                ? 'border-blue-500 hover:bg-blue-50 text-blue-700'
                : preset.color === 'yellow'
                ? 'border-yellow-500 hover:bg-yellow-50 text-yellow-700'
                : 'border-red-500 hover:bg-red-50 text-red-700'
            }`}
          >
            <div className="text-sm font-medium">{preset.label}</div>
            <div className="text-xs">{preset.value}分</div>
          </button>
        ))}
      </div>

      {/* 五维度评分滑块 */}
      <div className="space-y-4">
        {dimensions.map((dim) => (
          <div key={dim.key} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">{dim.icon}</span>
                <span className="text-sm font-medium text-gray-700">{dim.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-bold ${getScoreColor(ratings[dim.key])}`}>
                  {ratings[dim.key]}
                </span>
                <span className="text-xs text-gray-500">分</span>
              </div>
            </div>

            {/* 滑块 */}
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={ratings[dim.key]}
              onChange={(e) => handleRatingChange(dim.key, parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
            />

            {/* 刻度标记 */}
            <div className="flex justify-between text-xs text-gray-400">
              <span>0</span>
              <span>25</span>
              <span>50</span>
              <span>75</span>
              <span>100</span>
            </div>
          </div>
        ))}
      </div>

      {/* 备注输入 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          备注说明（可选）
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="记录现场情况、发现的问题或其他需要说明的内容..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
        />
      </div>
    </div>
  );
}
