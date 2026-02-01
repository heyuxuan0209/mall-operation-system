'use client';

import React from 'react';
import Link from 'next/link';
import { mockMerchants } from '@/data/merchants/mock-data';
import MerchantHistoryArchive from '@/components/merchants/MerchantHistoryArchive';

export default async function MerchantArchivePage({
  params,
}: {
  params: Promise<{ merchantId: string }>;
}) {
  const { merchantId } = await params;
  const merchant = mockMerchants.find(m => m.id === merchantId);

  if (!merchant) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <i className="fas fa-exclamation-triangle text-6xl text-gray-300 mb-4"></i>
        <h2 className="text-2xl font-bold text-gray-700 mb-2">档案不存在</h2>
        <p className="text-gray-500 mb-6">未找到ID为 {merchantId} 的商户档案</p>
        <Link
          href="/archives"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          返回档案库
        </Link>
      </div>
    );
  }

  // 获取风险徽章样式
  const getRiskBadge = (level: string) => {
    const badges = {
      critical: { bg: 'bg-purple-100', text: 'text-purple-700', icon: 'fa-skull-crossbones', label: '极高风险' },
      high: { bg: 'bg-red-100', text: 'text-red-700', icon: 'fa-exclamation-circle', label: '高风险' },
      medium: { bg: 'bg-orange-100', text: 'text-orange-700', icon: 'fa-exclamation-triangle', label: '中风险' },
      low: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: 'fa-info-circle', label: '低风险' },
      none: { bg: 'bg-green-100', text: 'text-green-700', icon: 'fa-check-circle', label: '无风险' },
    };
    return badges[level as keyof typeof badges] || badges.none;
  };

  const badge = getRiskBadge(merchant.riskLevel);

  return (
    <div className="space-y-6">
      {/* 商户基本信息卡片 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <i className="fas fa-store text-3xl text-white"></i>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{merchant.name}</h2>
                <p className="text-indigo-100 mt-1">{merchant.id} · {merchant.category}</p>
              </div>
            </div>

            {/* 当前风险状态 */}
            <div className={`px-4 py-2 rounded-lg ${badge.bg} ${badge.text} flex items-center gap-2`}>
              <i className={`fas ${badge.icon}`}></i>
              <span className="font-semibold">{badge.label}</span>
            </div>
          </div>
        </div>

        {/* 基本信息网格 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-50">
          <div>
            <div className="text-xs text-gray-500 mb-1">楼层位置</div>
            <div className="font-medium text-gray-900">{merchant.floor} {merchant.shopNumber}号</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">面积</div>
            <div className="font-medium text-gray-900">{merchant.area}㎡</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">月租金</div>
            <div className="font-medium text-gray-900">¥{(merchant.rent / 10000).toFixed(1)}万</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">上月营收</div>
            <div className="font-medium text-gray-900">¥{(merchant.lastMonthRevenue / 10000).toFixed(1)}万</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">租售比</div>
            <div className={`font-medium ${merchant.rentToSalesRatio > 25 ? 'text-red-600' : 'text-gray-900'}`}>
              {merchant.rentToSalesRatio}%
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">健康度</div>
            <div className="font-bold text-xl text-gray-900">{merchant.totalScore}<span className="text-sm font-normal text-gray-500">分</span></div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">经营状态</div>
            <div className="font-medium text-gray-900">
              {merchant.status === 'operating' ? '营业中' : merchant.status === 'closed' ? '已关闭' : '装修中'}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">最后更新</div>
            <div className="font-medium text-gray-900">
              {new Date(merchant.updatedAt).toLocaleDateString('zh-CN')}
            </div>
          </div>
        </div>

        {/* 快速操作区 */}
        <div className="px-6 py-4 border-t border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">快速跳转</span>
            <div className="flex gap-2">
              <Link
                href={`/health?merchantId=${merchant.id}&fromArchive=true`}
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                <i className="fas fa-heartbeat mr-1"></i>
                健康度监控
              </Link>
              <Link
                href={`/tasks?merchantId=${merchant.id}&fromArchive=true`}
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                <i className="fas fa-tasks mr-1"></i>
                任务中心
              </Link>
              <Link
                href={`/inspection?merchantId=${merchant.id}&fromArchive=true`}
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                <i className="fas fa-clipboard-check mr-1"></i>
                巡店记录
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 历史帮扶档案（全屏展示） */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <MerchantHistoryArchive merchant={merchant} />
      </div>
    </div>
  );
}
