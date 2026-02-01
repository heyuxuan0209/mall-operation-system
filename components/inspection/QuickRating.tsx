'use client';

import React, { useState } from 'react';
import { Star, Info } from 'lucide-react';
import { QuickRating } from '@/types';
import { calculateSiteQualityFromInspection } from '@/skills/health-calculator';

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
      staffCondition: 70,
      merchandiseDisplay: 70,
      storeEnvironment: 70,
      managementCapability: 70,
      safetyCompliance: 70,
    }
  );
  const [dimensionNotes, setDimensionNotes] = useState<{ [key: string]: string }>({});
  const [notes, setNotes] = useState('');
  const [expandedTips, setExpandedTips] = useState<string | null>(null);

  // Phase 3: 新的5个维度定义
  const dimensions = [
    {
      key: 'staffCondition' as const,
      label: '员工状态',
      icon: '👥',
      color: 'blue',
      weight: '20%',
      tips: [
        '着装是否规范整洁',
        '服务态度是否热情主动',
        '员工精神面貌是否良好',
        '是否熟悉商品和服务流程',
      ],
    },
    {
      key: 'merchandiseDisplay' as const,
      label: '货品陈列',
      icon: '📦',
      color: 'green',
      weight: '25%',
      tips: [
        '商品陈列是否整齐有序',
        '货品是否丰富齐全',
        '价格标签是否清晰准确',
        '是否存在断货或积压',
      ],
    },
    {
      key: 'storeEnvironment' as const,
      label: '卖场环境',
      icon: '🏪',
      color: 'purple',
      weight: '25%',
      tips: [
        '店面卫生是否整洁',
        '灯光照明是否充足',
        '装修设施是否完好',
        '通道是否畅通无阻',
      ],
    },
    {
      key: 'managementCapability' as const,
      label: '店长管理能力',
      icon: '👔',
      color: 'orange',
      weight: '15%',
      tips: [
        '是否有明确的管理制度',
        '员工培训是否到位',
        '问题响应是否及时',
        '经营数据是否清晰',
      ],
    },
    {
      key: 'safetyCompliance' as const,
      label: '安全合规',
      icon: '🛡️',
      color: 'red',
      weight: '15%',
      tips: [
        '消防设施是否完备',
        '安全通道是否畅通',
        '证照是否齐全有效',
        '是否存在安全隐患',
      ],
    },
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
        dimensionNotes: Object.keys(dimensionNotes).length > 0 ? dimensionNotes : undefined,
        notes: notes || undefined,
      };
      onRatingChange(rating);
    }
  };

  const handleDimensionNoteChange = (key: string, note: string) => {
    const newNotes = { ...dimensionNotes, [key]: note };
    if (!note) {
      delete newNotes[key];
    }
    setDimensionNotes(newNotes);
  };

  const applyPreset = (value: number) => {
    const newRatings = {
      staffCondition: value,
      merchandiseDisplay: value,
      storeEnvironment: value,
      managementCapability: value,
      safetyCompliance: value,
    };
    setRatings(newRatings);

    if (onRatingChange) {
      const rating: QuickRating = {
        id: `rating_${Date.now()}`,
        merchantId,
        timestamp: new Date().toISOString(),
        ratings: newRatings,
        dimensionNotes: Object.keys(dimensionNotes).length > 0 ? dimensionNotes : undefined,
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

  // Phase 3: 使用加权平均计算综合评分
  const averageScore = calculateSiteQualityFromInspection(ratings) || 0;

  // 找出最���弱环节
  const weakestDimension = dimensions.reduce((min, curr) =>
    ratings[curr.key] < ratings[min.key] ? curr : min
  );

  return (
    <div className="space-y-6">
      {/* 综合评分 */}
      <div className="bg-gradient-to-r from-brand-50 to-purple-50 rounded-lg p-6 text-center">
        <div className="text-sm text-gray-600 mb-2">现场品质综合评分</div>
        <div className={`text-5xl font-bold ${getScoreColor(averageScore)} mb-1`}>
          {Math.round(averageScore) || 0}
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
      <div className="space-y-5">
        {dimensions.map((dim) => (
          <div key={dim.key} className="space-y-2 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">{dim.icon}</span>
                <div>
                  <span className="text-sm font-medium text-gray-700">{dim.label}</span>
                  <span className="text-xs text-gray-500 ml-2">权重 {dim.weight}</span>
                </div>
                <button
                  onClick={() => setExpandedTips(expandedTips === dim.key ? null : dim.key)}
                  className="ml-2 text-gray-400 hover:text-brand-600 transition-colors"
                >
                  <Info size={16} />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-lg font-bold ${getScoreColor(ratings[dim.key] || 0)}`}>
                  {ratings[dim.key] || 0}
                </span>
                <span className="text-xs text-gray-500">分</span>
              </div>
            </div>

            {/* 评分要点提示 */}
            {expandedTips === dim.key && (
              <div className="bg-white rounded-md p-3 text-xs text-gray-600 space-y-1 border border-gray-200">
                <div className="font-medium text-gray-700 mb-2">📋 评分要点：</div>
                {dim.tips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-brand-600">•</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            )}

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

            {/* 维度备注 */}
            <input
              type="text"
              value={dimensionNotes[dim.key] || ''}
              onChange={(e) => handleDimensionNoteChange(dim.key, e.target.value)}
              placeholder="备注说明（可选）"
              className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
        ))}
      </div>

      {/* 最薄弱环节提示 */}
      {averageScore < 80 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <span className="text-orange-600 text-lg">⚠️</span>
            <div className="flex-1">
              <div className="text-sm font-medium text-orange-900 mb-1">最薄弱环节</div>
              <div className="text-sm text-orange-700">
                {weakestDimension.label}得分较低（{ratings[weakestDimension.key] || 0}分），建议重点关注和改善
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 总体备注输入 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          总体备注（可选）
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="记录现场整体情况、发现的问题或其他需要说明的内容..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
        />
      </div>
    </div>
  );
}
