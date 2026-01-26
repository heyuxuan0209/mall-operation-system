'use client';

import React, { useState } from 'react';
import { MapPin, Check, Loader } from 'lucide-react';
import { CheckInData } from '@/types';
import { useGeolocation } from '@/hooks/useGeolocation';

interface QuickCheckInProps {
  merchantId: string;
  merchantName: string;
  merchantLocation?: { lat: number; lng: number };
  onCheckIn: (checkInData: CheckInData) => void;
}

export default function QuickCheckIn({
  merchantId,
  merchantName,
  merchantLocation,
  onCheckIn,
}: QuickCheckInProps) {
  const { location, error, loading, getCurrentLocation } = useGeolocation();
  const [checked, setChecked] = useState(false);
  const [checkInData, setCheckInData] = useState<CheckInData | null>(null);

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

  if (checked && checkInData) {
    return (
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
