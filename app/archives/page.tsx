'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { mockMerchants } from '@/data/merchants/mock-data';
import { historyArchiveService } from '@/utils/historyArchiveService';
import { AssistanceArchive } from '@/types';

type SortOption = 'lastUpdate' | 'healthScore' | 'successRate' | 'riskLevel';
type RiskFilter = 'all' | 'critical' | 'high' | 'medium' | 'low' | 'none';

export default function ArchivesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('lastUpdate');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

  // 生成所有商户的档案摘要
  const archivesMap = useMemo(() => {
    const map = new Map<string, AssistanceArchive | null>();
    mockMerchants.forEach(merchant => {
      const archive = historyArchiveService.generateArchive(merchant.id);
      map.set(merchant.id, archive);
    });
    return map;
  }, []);

  // 过滤和排序
  const filteredMerchants = useMemo(() => {
    let result = mockMerchants.filter(merchant => {
      // 搜索过滤
      if (searchTerm && !merchant.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // 风险等级过滤
      if (riskFilter !== 'all' && merchant.riskLevel !== riskFilter) {
        return false;
      }

      return true;
    });

    // 排序
    result.sort((a, b) => {
      const archiveA = archivesMap.get(a.id);
      const archiveB = archivesMap.get(b.id);

      switch (sortBy) {
        case 'healthScore':
          return b.totalScore - a.totalScore;
        case 'successRate':
          return (archiveB?.stats.successRate || 0) - (archiveA?.stats.successRate || 0);
        case 'riskLevel': {
          const riskLevels = ['none', 'low', 'medium', 'high', 'critical'];
          return riskLevels.indexOf(b.riskLevel) - riskLevels.indexOf(a.riskLevel);
        }
        case 'lastUpdate':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

    return result;
  }, [searchTerm, riskFilter, sortBy, archivesMap]);

  // 获取风险徽章样式
  const getRiskBadge = (level: string) => {
    const badges = {
      critical: { bg: 'bg-purple-100', text: 'text-purple-700', label: '极高' },
      high: { bg: 'bg-red-100', text: 'text-red-700', label: '高' },
      medium: { bg: 'bg-orange-100', text: 'text-orange-700', label: '中' },
      low: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: '低' },
      none: { bg: 'bg-green-100', text: 'text-green-700', label: '无' },
    };
    return badges[level as keyof typeof badges] || badges.none;
  };

  // 格式化日期为相对时间
  const getRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const days = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (days === 0) return '今天';
    if (days === 1) return '昨天';
    if (days < 7) return `${days}天前`;
    if (days < 30) return `${Math.floor(days / 7)}周前`;
    return `${Math.floor(days / 30)}个月前`;
  };

  return (
    <div className="space-y-6">
      {/* 工具栏 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* 搜索框 */}
          <div className="flex-1">
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="搜索商户名称..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* 排序选择 */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="lastUpdate">最近更新</option>
              <option value="healthScore">健康度</option>
              <option value="successRate">成功率</option>
              <option value="riskLevel">风险等级</option>
            </select>

            {/* 视图切换 */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 ${viewMode === 'table' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <i className="fas fa-list"></i>
              </button>
              <button
                onClick={() => setViewMode('card')}
                className={`px-3 py-2 ${viewMode === 'card' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                <i className="fas fa-th-large"></i>
              </button>
            </div>
          </div>
        </div>

        {/* 快速筛选 */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-gray-600">快速筛选:</span>
          {(['all', 'critical', 'high', 'medium', 'low', 'none'] as RiskFilter[]).map((filter) => (
            <button
              key={filter}
              onClick={() => setRiskFilter(filter)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                riskFilter === filter
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter === 'all' ? '全部' : getRiskBadge(filter).label + '风险'}
            </button>
          ))}
        </div>
      </div>

      {/* 统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">总档案数</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{mockMerchants.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">高风险商户</div>
          <div className="text-2xl font-bold text-red-600 mt-1">
            {mockMerchants.filter(m => m.riskLevel === 'high' || m.riskLevel === 'critical').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">平均成功率</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {Math.round(
              Array.from(archivesMap.values())
                .filter(a => a !== null)
                .reduce((sum, a) => sum + (a?.stats.successRate || 0), 0) /
                archivesMap.size
            )}%
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">筛选结果</div>
          <div className="text-2xl font-bold text-indigo-600 mt-1">{filteredMerchants.length}</div>
        </div>
      </div>

      {/* 商户列表 */}
      {viewMode === 'table' ? (
        // 表格视图
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">商户</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">风险</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">健康度</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">任务</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">成功率</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">最后更新</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMerchants.map(merchant => {
                const archive = archivesMap.get(merchant.id);
                const badge = getRiskBadge(merchant.riskLevel);

                return (
                  <tr key={merchant.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{merchant.name}</div>
                      <div className="text-sm text-gray-500">{merchant.category}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                        {badge.label}风险
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-900">{merchant.totalScore}</span>
                        <span className="text-sm text-gray-500">分</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {archive?.stats.completedTaskCount || 0}/{archive?.stats.assistanceTaskCount || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {archive?.stats.successRate || 0}%
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">{getRelativeTime(merchant.updatedAt)}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/archives/${merchant.id}`}
                        className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        查看档案
                        <i className="fas fa-chevron-right text-xs"></i>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredMerchants.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <i className="fas fa-inbox text-4xl mb-2"></i>
              <p>未找到符合条件的档案</p>
            </div>
          )}
        </div>
      ) : (
        // 卡片视图
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMerchants.map(merchant => {
            const archive = archivesMap.get(merchant.id);
            const badge = getRiskBadge(merchant.riskLevel);

            return (
              <Link
                key={merchant.id}
                href={`/archives/${merchant.id}`}
                className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md hover:border-indigo-300 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{merchant.name}</h3>
                    <p className="text-sm text-gray-500">{merchant.category}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                    {badge.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <div className="text-xs text-gray-500">健康度</div>
                    <div className="text-xl font-bold text-gray-900">{merchant.totalScore}分</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">成功率</div>
                    <div className="text-xl font-bold text-green-600">{archive?.stats.successRate || 0}%</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    任务 {archive?.stats.completedTaskCount || 0}/{archive?.stats.assistanceTaskCount || 0}
                  </span>
                  <span className="text-gray-400">{getRelativeTime(merchant.updatedAt)}</span>
                </div>
              </Link>
            );
          })}

          {filteredMerchants.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              <i className="fas fa-inbox text-4xl mb-2"></i>
              <p>未找到符合条件的档案</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
