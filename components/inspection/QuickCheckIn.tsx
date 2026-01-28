'use client';

import React, { useState } from 'react';
import { MapPin, Check, Loader, AlertTriangle, Target, CheckSquare } from 'lucide-react';
import { CheckInData, Merchant } from '@/types';
import { useGeolocation } from '@/hooks/useGeolocation';
import { getMerchantProfile } from '@/utils/inspectionService';

interface QuickCheckInProps {
  merchantId: string;
  merchantName: string;
  merchantLocation?: { lat: number; lng: number };
  merchant: Merchant; // Phase 2: 需要完整的商户数据来生成画像
  onCheckIn: (checkInData: CheckInData) => void;
}

export default function QuickCheckIn({
  merchantId,
  merchantName,
  merchantLocation,
  merchant,
  onCheckIn,
}: QuickCheckInProps) {
  const { location, error, loading, getCurrentLocation } = useGeolocation();
  const [checked, setChecked] = useState(false);
  const [checkInData, setCheckInData] = useState<CheckInData | null>(null);
  // 修改为Map存储：itemId -> true(是) | false(否) | null(未选择)
  const [checklistAnswers, setChecklistAnswers] = useState<Map<string, boolean | null>>(new Map());

  // 计算两点间距离（Haversine公式）
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371e3; // 地球半径（米）
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // 距离（米）
  };

  const handleCheckIn = async () => {
    try {
      const pos = await getCurrentLocation();

      // 计算距离
      let distance: number | undefined;
      if (merchantLocation) {
        distance = calculateDistance(
          pos.coords.latitude,
          pos.coords.longitude,
          merchantLocation.lat,
          merchantLocation.lng
        );
      }

      // Phase 2: 获取商户画像
      const merchantProfile = getMerchantProfile(merchant);

      const data: CheckInData = {
        id: `checkin_${Date.now()}`,
        merchantId,
        merchantName,
        userId: 'current_user', // TODO: 从用户上下文获取
        userName: '当前用户', // TODO: 从用户上下文获取
        timestamp: new Date().toISOString(),
        location: {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        },
        distance,
        merchantProfile, // Phase 2: 添加商户画像
      };

      setCheckInData(data);
      setChecked(true);
      onCheckIn(data);

      // 触发触觉反馈（如果支持）
      if ('vibrate' in navigator) {
        navigator.vibrate(200);
      }
    } catch (err) {
      console.error('Check-in failed:', err);
    }
  };

  // 设置检查项答案
  const setCheckItemAnswer = (itemId: string, answer: boolean) => {
    setChecklistAnswers((prev) => {
      const newMap = new Map(prev);
      newMap.set(itemId, answer);
      return newMap;
    });
  };

  // 获取风险等级颜色
  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  // 获取风险等级文本
  const getRiskLevelText = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high':
        return '高风险';
      case 'medium':
        return '中风险';
      case 'low':
        return '低风险';
      default:
        return '无风险';
    }
  };

  // 获取检查类型文本
  const getChecklistTypeText = (type: string) => {
    switch (type) {
      case 'opening':
        return '开店检查清单';
      case 'closing':
        return '闭店检查清单';
      default:
        return '常规巡检清单';
    }
  };

  if (checked && checkInData && checkInData.merchantProfile) {
    const profile = checkInData.merchantProfile;

    return (
      <div className="space-y-4">
        {/* 签到成功卡片 */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <Check size={24} className="text-white" />
            </div>
            <div>
              <div className="text-lg font-semibold text-green-900">签到成功</div>
              <div className="text-sm text-green-600">
                {new Date(checkInData.timestamp).toLocaleString('zh-CN')}
              </div>
            </div>
          </div>

          {/* 位置信息 */}
          <div className="space-y-2 text-sm text-green-700">
            <div className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 flex-shrink-0" />
              <div>
                <div>
                  纬度: {checkInData.location.latitude.toFixed(6)}
                </div>
                <div>
                  经度: {checkInData.location.longitude.toFixed(6)}
                </div>
                <div>
                  精度: ±{checkInData.location.accuracy.toFixed(0)}米
                </div>
              </div>
            </div>

            {checkInData.distance !== undefined && (
              <div
                className={`p-2 rounded ${
                  checkInData.distance <= 100
                    ? 'bg-green-100'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                距离商户: {checkInData.distance.toFixed(0)}米
                {checkInData.distance > 100 && (
                  <span className="ml-2 text-xs">(超出推荐范围100米)</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Phase 2: 商户健康度诊断简报 */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <AlertTriangle size={18} className="text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">商户健康度诊断简报</h3>
          </div>

          {/* 健康度得分和风险等级 */}
          <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
            <div className="flex-1">
              <div className="text-sm text-gray-500 mb-1">总体健康度</div>
              <div className="text-3xl font-bold text-gray-900">
                {profile.healthScore}
                <span className="text-lg text-gray-500 ml-1">分</span>
              </div>
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-500 mb-1">风险等级</div>
              <div
                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getRiskLevelColor(
                  profile.riskLevel
                )}`}
              >
                {getRiskLevelText(profile.riskLevel)}
              </div>
            </div>
          </div>

          {/* 预警标签 */}
          {profile.alerts.length > 0 && (
            <div className="mb-4">
              <div className="text-sm font-medium text-gray-700 mb-2">⚠️ 预警标签</div>
              <div className="space-y-1.5">
                {profile.alerts.map((alert, index) => (
                  <div
                    key={index}
                    className="text-sm text-orange-700 bg-orange-50 px-3 py-2 rounded-md border border-orange-100"
                  >
                    • {alert}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 最薄弱维度 */}
          <div className="text-sm">
            <span className="text-gray-500">最薄弱维度：</span>
            <span className="font-semibold text-red-600">{profile.weakestDimension}</span>
          </div>
        </div>

        {/* Phase 2: 核心观察点 */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target size={18} className="text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">本次巡检核心观察点</h3>
          </div>

          <div className="space-y-2">
            {profile.focusPoints.map((point, index) => (
              <div
                key={index}
                className="flex items-start gap-2 text-sm text-gray-700 bg-white/60 px-3 py-2.5 rounded-md"
              >
                <span className="text-purple-600 font-semibold flex-shrink-0">
                  {index + 1}.
                </span>
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Phase 2: 检查清单 */}
        <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckSquare size={18} className="text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              {getChecklistTypeText(profile.checklistType)}
            </h3>
            <div className="ml-auto text-xs text-gray-500">
              {new Date().toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>

          <div className="space-y-3">
            {profile.checklist.map((item) => {
              const answer = checklistAnswers.get(item.id);
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <span className="text-sm text-gray-700 flex-1">{item.label}</span>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => setCheckItemAnswer(item.id, true)}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                        answer === true
                          ? 'bg-green-500 text-white shadow-sm'
                          : 'bg-white text-gray-600 border border-gray-300 hover:border-green-400'
                      }`}
                    >
                      是
                    </button>
                    <button
                      onClick={() => setCheckItemAnswer(item.id, false)}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                        answer === false
                          ? 'bg-red-500 text-white shadow-sm'
                          : 'bg-white text-gray-600 border border-gray-300 hover:border-red-400'
                      }`}
                    >
                      否
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 完成进度 */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm mb-3">
              <span className="text-gray-600">检查进度</span>
              <span className="font-semibold text-gray-900">
                {checklistAnswers.size} / {profile.checklist.length}
              </span>
            </div>

            {/* 统计信息 */}
            <div className="flex gap-4 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  是: {Array.from(checklistAnswers.values()).filter(v => v === true).length}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">
                  否: {Array.from(checklistAnswers.values()).filter(v => v === false).length}
                </span>
              </div>
            </div>

            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{
                  width: `${(checklistAnswers.size / profile.checklist.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button
        onClick={handleCheckIn}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
      >
        {loading ? (
          <>
            <Loader size={24} className="animate-spin" />
            <span>获取位置中...</span>
          </>
        ) : (
          <>
            <MapPin size={24} />
            <span className="text-lg font-semibold">快捷签到</span>
          </>
        )}
      </button>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
          {error.code === 1 && '位置权限被拒绝，请在浏览器设置中允许位置访问'}
          {error.code === 2 && '无法获取位置信息'}
          {error.code === 3 && '获取位置超时'}
          {!error.code && error.message}
        </div>
      )}

      {/* 提示信息 */}
      <div className="text-xs text-gray-500 text-center">
        点击后将获取您的当前位置并记录签到时间
      </div>
    </div>
  );
}
