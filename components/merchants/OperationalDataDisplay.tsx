'use client';

import React, { useState } from 'react';
import { OperationalDetails } from '@/types';
import { FIELD_LABELS, FIELD_UNITS } from '@/config/operationalDataConfig';

interface OperationalDataDisplayProps {
  data: OperationalDetails | undefined;
  category: string;
}

interface FieldGroup {
  id: string;
  title: string;
  icon: string;
  fields: Array<{
    key: string;
    getValue: (data: OperationalDetails) => any;
  }>;
}

/**
 * 运营数据展示组件
 * 以折叠面板形式展示数据
 */
export default function OperationalDataDisplay({ data, category }: OperationalDataDisplayProps) {
  const [expandedGroups, setExpandedGroups] = useState(new Set(['general']));

  // 空状态
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="text-center py-12">
        <i className="fas fa-chart-line text-4xl text-gray-400 mb-4"></i>
        <h4 className="text-lg font-semibold text-gray-700 mb-2">暂无详细运营数据</h4>
        <p className="text-sm text-gray-500">添加客流、营收等数据，助力AI精准诊断</p>
      </div>
    );
  }

  // 切换折叠状态
  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  // 格式化值
  const formatValue = (field: string, value: any): string => {
    if (value === undefined || value === null) return '-';
    if (typeof value === 'boolean') return value ? '是' : '否';

    const unit = FIELD_UNITS[field] || '';
    return `${value}${unit}`;
  };

  // 检查字段组是否有数据
  const hasGroupData = (fields: FieldGroup['fields']): boolean => {
    return fields.some((field) => {
      const value = field.getValue(data);
      return value !== undefined && value !== null;
    });
  };

  // 定义字段组
  const fieldGroups: FieldGroup[] = [
    {
      id: 'general',
      title: '通用数据',
      icon: 'fa-users',
      fields: [
        { key: 'dailyFootfall', getValue: (d) => d.dailyFootfall },
        { key: 'peakHourFootfall', getValue: (d) => d.peakHourFootfall },
        { key: 'conversionRate', getValue: (d) => d.conversionRate },
      ],
    },
    {
      id: 'restaurant',
      title: '餐饮数据',
      icon: 'fa-utensils',
      fields: [
        { key: 'restaurant.tableCount', getValue: (d) => d.restaurant?.tableCount },
        { key: 'restaurant.seatingCapacity', getValue: (d) => d.restaurant?.seatingCapacity },
        { key: 'restaurant.turnoverRate', getValue: (d) => d.restaurant?.turnoverRate },
        { key: 'restaurant.avgWaitTime', getValue: (d) => d.restaurant?.avgWaitTime },
        { key: 'restaurant.avgMealDuration', getValue: (d) => d.restaurant?.avgMealDuration },
        { key: 'restaurant.errorOrderRate', getValue: (d) => d.restaurant?.errorOrderRate },
        { key: 'restaurant.avgCheckSize', getValue: (d) => d.restaurant?.avgCheckSize },
      ],
    },
    {
      id: 'retail',
      title: '零售数据',
      icon: 'fa-shopping-cart',
      fields: [
        { key: 'retail.dailySales', getValue: (d) => d.retail?.dailySales },
        { key: 'retail.avgTransactionValue', getValue: (d) => d.retail?.avgTransactionValue },
        { key: 'retail.inventoryTurnover', getValue: (d) => d.retail?.inventoryTurnover },
        { key: 'retail.returnRate', getValue: (d) => d.retail?.returnRate },
      ],
    },
    {
      id: 'customer',
      title: '顾客数据',
      icon: 'fa-smile',
      fields: [
        { key: 'customer.npsScore', getValue: (d) => d.customer?.npsScore },
        { key: 'customer.repeatCustomerRate', getValue: (d) => d.customer?.repeatCustomerRate },
        { key: 'customer.newCustomerRatio', getValue: (d) => d.customer?.newCustomerRatio },
        { key: 'customer.avgCustomerLifetime', getValue: (d) => d.customer?.avgCustomerLifetime },
      ],
    },
    {
      id: 'staff',
      title: '员工数据',
      icon: 'fa-user-tie',
      fields: [
        { key: 'staff.totalCount', getValue: (d) => d.staff?.totalCount },
        { key: 'staff.fullTimeCount', getValue: (d) => d.staff?.fullTimeCount },
        { key: 'staff.partTimeCount', getValue: (d) => d.staff?.partTimeCount },
        { key: 'staff.turnoverRate', getValue: (d) => d.staff?.turnoverRate },
        { key: 'staff.avgTenure', getValue: (d) => d.staff?.avgTenure },
      ],
    },
    {
      id: 'competition',
      title: '竞争环境',
      icon: 'fa-trophy',
      fields: [
        { key: 'competition.nearbyCompetitors', getValue: (d) => d.competition?.nearbyCompetitors },
        { key: 'competition.marketShare', getValue: (d) => d.competition?.marketShare },
        { key: 'competition.competitivePosition', getValue: (d) => d.competition?.competitivePosition },
      ],
    },
    {
      id: 'location',
      title: '位置数据',
      icon: 'fa-map-marker-alt',
      fields: [
        { key: 'location.floor', getValue: (d) => d.location?.floor },
        { key: 'location.zoneType', getValue: (d) => d.location?.zoneType },
        { key: 'location.adjacentToAnchor', getValue: (d) => d.location?.adjacentToAnchor },
        { key: 'location.visibilityRating', getValue: (d) => d.location?.visibilityRating },
      ],
    },
  ];

  // 过滤掉没有数据的字段组
  const visibleGroups = fieldGroups.filter((group) => hasGroupData(group.fields));

  // 格式化更新时间
  const formatUpdateTime = (timestamp: string | undefined): string => {
    if (!timestamp) return '未知';

    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 数据来源标签映射
  const dataSourceLabels: Record<string, string> = {
    inspection: '现场巡检',
    pos: 'POS系统',
    manual: '手动录入',
    third_party: '第三方数据',
  };

  return (
    <div>
      {/* 字段组折叠面板 */}
      <div className="space-y-3 mb-6">
        {visibleGroups.map((group) => {
          const isExpanded = expandedGroups.has(group.id);
          const filledFieldsCount = group.fields.filter(
            (field) => field.getValue(data) !== undefined && field.getValue(data) !== null
          ).length;

          return (
            <div key={group.id} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* 折叠面板头部 */}
              <button
                onClick={() => toggleGroup(group.id)}
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <i className={`fas ${group.icon} text-indigo-600`}></i>
                  <span className="font-medium text-gray-900">{group.title}</span>
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                    已填写 {filledFieldsCount}/{group.fields.length}
                  </span>
                </div>
                <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} text-gray-400 text-sm`}></i>
              </button>

              {/* 折叠面板内容 */}
              {isExpanded && (
                <div className="p-4 bg-white">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {group.fields.map((field) => {
                      const value = field.getValue(data);
                      if (value === undefined || value === null) return null;

                      return (
                        <div key={field.key} className="flex flex-col">
                          <span className="text-xs text-gray-500 mb-1">
                            {FIELD_LABELS[field.key] || field.key}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {formatValue(field.key, value)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 元数据展示 */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
          {/* 更新时间 */}
          {data.lastUpdated && (
            <div className="flex items-center gap-2">
              <i className="fas fa-clock text-gray-400"></i>
              <span>更新于 {formatUpdateTime(data.lastUpdated)}</span>
            </div>
          )}

          {/* 录入人 */}
          {data.inspectorName && (
            <div className="flex items-center gap-2">
              <i className="fas fa-user text-gray-400"></i>
              <span>录入人：{data.inspectorName}</span>
            </div>
          )}

          {/* 数据来源 */}
          {data.dataSource && (
            <div className="flex items-center gap-2">
              <i className="fas fa-database text-gray-400"></i>
              <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                {dataSourceLabels[data.dataSource] || data.dataSource}
              </span>
            </div>
          )}
        </div>

        {/* 备注 */}
        {data.notes && (
          <div className="mt-3 p-3 bg-gray-50 rounded text-sm text-gray-700">
            <i className="fas fa-sticky-note text-gray-400 mr-2"></i>
            <span className="font-medium">备注：</span>
            {data.notes}
          </div>
        )}
      </div>
    </div>
  );
}
