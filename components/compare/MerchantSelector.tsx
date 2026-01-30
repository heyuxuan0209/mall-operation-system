'use client';

import React, { useState, useMemo } from 'react';
import { Merchant } from '@/types';
import { Search, X, Filter, Check, AlertTriangle, Building2 } from 'lucide-react';

interface MerchantSelectorProps {
  merchants: Merchant[];
  selectedMerchants: Merchant[];
  onSelectionChange: (merchants: Merchant[]) => void;
  maxSelection?: number;
  minSelection?: number;
}

export default function MerchantSelector({
  merchants,
  selectedMerchants,
  onSelectionChange,
  maxSelection = 5,
  minSelection = 2
}: MerchantSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRiskLevel, setFilterRiskLevel] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // 获取所有业态大类
  const categories = useMemo(() => {
    const cats = new Set(merchants.map(m => m.category.split('-')[0]));
    return Array.from(cats).sort();
  }, [merchants]);

  // 筛选商户
  const filteredMerchants = useMemo(() => {
    return merchants.filter(merchant => {
      // 搜索过滤
      if (searchQuery && !merchant.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // 风险等级过滤
      if (filterRiskLevel !== 'all' && merchant.riskLevel !== filterRiskLevel) {
        return false;
      }

      // 业态过滤
      if (filterCategory !== 'all') {
        const mainCategory = merchant.category.split('-')[0];
        if (mainCategory !== filterCategory) {
          return false;
        }
      }

      return true;
    });
  }, [merchants, searchQuery, filterRiskLevel, filterCategory]);

  // 处理商户选择
  const handleToggleMerchant = (merchant: Merchant) => {
    const isSelected = selectedMerchants.some(m => m.id === merchant.id);

    if (isSelected) {
      // 取消选择
      onSelectionChange(selectedMerchants.filter(m => m.id !== merchant.id));
    } else {
      // 添加选择
      if (selectedMerchants.length < maxSelection) {
        onSelectionChange([...selectedMerchants, merchant]);
      }
    }
  };

  // 移除选中的商户
  const handleRemoveMerchant = (merchantId: string) => {
    onSelectionChange(selectedMerchants.filter(m => m.id !== merchantId));
  };

  // 清空选择
  const handleClearSelection = () => {
    onSelectionChange([]);
  };

  // 获取风险等级颜色
  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'none': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // 获取风险等级标签
  const getRiskLevelLabel = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return '极高风险';
      case 'high': return '高风险';
      case 'medium': return '中风险';
      case 'low': return '低风险';
      case 'none': return '无风险';
      default: return riskLevel;
    }
  };

  return (
    <div className="space-y-6">
      {/* 已选择商户 */}
      {selectedMerchants.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-blue-900">
              已选择商户 ({selectedMerchants.length}/{maxSelection})
            </h3>
            <button
              onClick={handleClearSelection}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <X size={14} />
              清空
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {selectedMerchants.map(merchant => (
              <div
                key={merchant.id}
                className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-blue-300 shadow-sm"
              >
                <Building2 size={14} className="text-blue-600" />
                <span className="text-sm font-medium text-slate-900">{merchant.name}</span>
                <span className="text-xs text-slate-500">({merchant.category})</span>
                <button
                  onClick={() => handleRemoveMerchant(merchant.id)}
                  className="ml-1 text-slate-400 hover:text-red-600"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          {selectedMerchants.length < minSelection && (
            <div className="mt-3 flex items-start gap-2 text-sm text-orange-700">
              <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
              <span>请至少选择 {minSelection} 个商户进行对比</span>
            </div>
          )}
        </div>
      )}

      {/* 搜索和筛选 */}
      <div className="space-y-3">
        {/* 搜索框 */}
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="搜索商户名称..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* 筛选器 */}
        <div className="flex items-center gap-3">
          <Filter size={16} className="text-slate-500" />

          {/* 风险等级筛选 */}
          <select
            value={filterRiskLevel}
            onChange={(e) => setFilterRiskLevel(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">全部风险等级</option>
            <option value="critical">极高风险</option>
            <option value="high">高风险</option>
            <option value="medium">中风险</option>
            <option value="low">低风险</option>
            <option value="none">无风险</option>
          </select>

          {/* 业态筛选 */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">全部业态</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* 重置筛选 */}
          {(filterRiskLevel !== 'all' || filterCategory !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setFilterRiskLevel('all');
                setFilterCategory('all');
                setSearchQuery('');
              }}
              className="text-sm text-slate-600 hover:text-slate-800"
            >
              重置
            </button>
          )}
        </div>
      </div>

      {/* 商户列表 */}
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>可选商户 ({filteredMerchants.length})</span>
            {selectedMerchants.length >= maxSelection && (
              <span className="text-orange-600">已达到最大选择数量</span>
            )}
          </div>
        </div>

        <div className="divide-y divide-slate-200 max-h-96 overflow-y-auto">
          {filteredMerchants.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <Building2 size={48} className="mx-auto mb-2 text-slate-300" />
              <p>没有找到符合条件的商户</p>
            </div>
          ) : (
            filteredMerchants.map(merchant => {
              const isSelected = selectedMerchants.some(m => m.id === merchant.id);
              const isDisabled = !isSelected && selectedMerchants.length >= maxSelection;

              return (
                <div
                  key={merchant.id}
                  className={`p-4 hover:bg-slate-50 transition-colors ${
                    isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  } ${isSelected ? 'bg-blue-50' : ''}`}
                  onClick={() => !isDisabled && handleToggleMerchant(merchant)}
                >
                  <div className="flex items-start gap-3">
                    {/* 选择框 */}
                    <div className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                      isSelected
                        ? 'bg-blue-600 border-blue-600'
                        : 'border-slate-300'
                    }`}>
                      {isSelected && <Check size={14} className="text-white" />}
                    </div>

                    {/* 商户信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-slate-900">{merchant.name}</h4>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${getRiskLevelColor(merchant.riskLevel)}`}>
                          {getRiskLevelLabel(merchant.riskLevel)}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <span>{merchant.category}</span>
                        <span>{merchant.floor} {merchant.shopNumber}</span>
                        <span className="font-medium">健康度: {merchant.totalScore}分</span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-500 mt-1">
                        <span>月营收: {(merchant.lastMonthRevenue / 10000).toFixed(1)}万</span>
                        <span>租售比: {(merchant.rentToSalesRatio * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
