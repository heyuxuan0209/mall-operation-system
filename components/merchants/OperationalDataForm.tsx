'use client';

import React, { useState, useEffect } from 'react';
import { Merchant, OperationalDetails } from '@/types';
import { Modal } from '@/components/ui/Modal';
import {
  GeneralFields,
  RestaurantFields,
  RetailFields,
  CustomerFields,
  StaffFields,
  CompetitionFields,
  LocationFields,
} from './OperationalDataFields';
import {
  getFieldGroupsByCategory,
  DATA_SOURCE_OPTIONS,
} from '@/config/operationalDataConfig';
import { mockMerchants } from '@/data/merchants/mock-data';

interface OperationalDataFormProps {
  merchant: Merchant;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

/**
 * 运营数据录入表单组件
 * 根据商户业态动态显示不同字段组
 */
export default function OperationalDataForm({
  merchant,
  isOpen,
  onClose,
  onSuccess,
}: OperationalDataFormProps) {
  // 初始化表单数据
  const [formData, setFormData] = useState<OperationalDetails>(
    merchant.operationalDetails || {}
  );

  const [dataSource, setDataSource] = useState<OperationalDetails['dataSource']>(
    merchant.operationalDetails?.dataSource || 'inspection'
  );

  const [notes, setNotes] = useState(merchant.operationalDetails?.notes || '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // 重置表单（当打开/关闭或商户变化时）
  useEffect(() => {
    if (isOpen) {
      setFormData(merchant.operationalDetails || {});
      setDataSource(merchant.operationalDetails?.dataSource || 'inspection');
      setNotes(merchant.operationalDetails?.notes || '');
      setErrors({});
    }
  }, [isOpen, merchant]);

  // 获取当前用户信息（三级降级策略）
  const getUserInfo = (): { id: string; name: string } => {
    // 1. 优先: 环境变量
    if (process.env.NEXT_PUBLIC_DEFAULT_INSPECTOR) {
      return {
        id: process.env.NEXT_PUBLIC_DEFAULT_INSPECTOR,
        name: process.env.NEXT_PUBLIC_DEFAULT_INSPECTOR,
      };
    }

    // 2. 次选: localStorage
    if (typeof window !== 'undefined') {
      const lastInspector = localStorage.getItem('lastInspector');
      if (lastInspector) {
        try {
          return JSON.parse(lastInspector);
        } catch (e) {
          console.error('Failed to parse lastInspector:', e);
        }
      }
    }

    // 3. 兜底: 系统默认
    return { id: 'SYSTEM', name: '系统录入' };
  };

  // 处理字段变更（支持点记法）
  const handleFieldChange = (field: string, value: any) => {
    const keys = field.split('.');

    if (keys.length === 1) {
      // 顶级字段
      setFormData((prev) => ({ ...prev, [field]: value }));
    } else {
      // 嵌套字段（如 'restaurant.tableCount'）
      const [group, key] = keys;
      setFormData((prev) => ({
        ...prev,
        [group]: {
          ...(prev[group as keyof OperationalDetails] as any),
          [key]: value,
        },
      }));
    }

    // 清除该字段的错误
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // 范围验证
    if (formData.conversionRate !== undefined && (formData.conversionRate < 0 || formData.conversionRate > 100)) {
      newErrors.conversionRate = '转化率范围应为 0-100';
    }

    if (formData.customer?.npsScore !== undefined && (formData.customer.npsScore < -100 || formData.customer.npsScore > 100)) {
      newErrors['customer.npsScore'] = 'NPS范围应为 -100到100';
    }

    if (formData.customer?.repeatCustomerRate !== undefined && (formData.customer.repeatCustomerRate < 0 || formData.customer.repeatCustomerRate > 100)) {
      newErrors['customer.repeatCustomerRate'] = '复购率范围应为 0-100';
    }

    if (formData.customer?.newCustomerRatio !== undefined && (formData.customer.newCustomerRatio < 0 || formData.customer.newCustomerRatio > 100)) {
      newErrors['customer.newCustomerRatio'] = '新客占比范围应为 0-100';
    }

    if (formData.restaurant?.turnoverRate !== undefined && (formData.restaurant.turnoverRate < 0 || formData.restaurant.turnoverRate > 20)) {
      newErrors['restaurant.turnoverRate'] = '翻台率范围应为 0-20';
    }

    if (formData.restaurant?.errorOrderRate !== undefined && (formData.restaurant.errorOrderRate < 0 || formData.restaurant.errorOrderRate > 100)) {
      newErrors['restaurant.errorOrderRate'] = '错漏单率范围应为 0-100';
    }

    if (formData.retail?.returnRate !== undefined && (formData.retail.returnRate < 0 || formData.retail.returnRate > 100)) {
      newErrors['retail.returnRate'] = '退货率范围应为 0-100';
    }

    if (formData.staff?.turnoverRate !== undefined && (formData.staff.turnoverRate < 0 || formData.staff.turnoverRate > 100)) {
      newErrors['staff.turnoverRate'] = '员工流失率范围应为 0-100';
    }

    if (formData.competition?.marketShare !== undefined && (formData.competition.marketShare < 0 || formData.competition.marketShare > 100)) {
      newErrors['competition.marketShare'] = '市场份额范围应为 0-100';
    }

    if (formData.location?.visibilityRating !== undefined && (formData.location.visibilityRating < 1 || formData.location.visibilityRating > 5)) {
      newErrors['location.visibilityRating'] = '可见度评级范围应为 1-5';
    }

    // 逻辑验证：员工总数 >= 全职+兼职
    if (formData.staff?.totalCount !== undefined &&
        formData.staff?.fullTimeCount !== undefined &&
        formData.staff?.partTimeCount !== undefined) {
      const total = formData.staff.totalCount;
      const sum = formData.staff.fullTimeCount + formData.staff.partTimeCount;
      if (total < sum) {
        newErrors['staff.totalCount'] = `总人数(${total})不能小于全职+兼职(${sum})`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 保存表单
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      const userInfo = getUserInfo();

      // 元数据自动填充
      const enrichedData: OperationalDetails = {
        ...formData,
        lastUpdated: new Date().toISOString(),
        dataSource: dataSource,
        inspectorId: userInfo.id,
        inspectorName: userInfo.name,
        notes: notes.trim() || undefined,
      };

      // 更新 mockData（实际应调用 API）
      const merchantIndex = mockMerchants.findIndex((m) => m.id === merchant.id);
      if (merchantIndex !== -1) {
        mockMerchants[merchantIndex].operationalDetails = enrichedData;
        mockMerchants[merchantIndex].updatedAt = new Date().toISOString();
      }

      // 保存用户信息到 localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('lastInspector', JSON.stringify(userInfo));
      }

      // 提示保存成功
      alert('运营数据保存成功！');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  // 获取该业态需要显示的字段组
  const fieldGroups = getFieldGroupsByCategory(merchant.category);

  // 渲染字段组件
  const renderFieldGroup = (group: string) => {
    const commonProps = {
      data: formData,
      onChange: handleFieldChange,
      errors: errors,
    };

    switch (group) {
      case 'general':
        return <GeneralFields key={group} {...commonProps} />;
      case 'restaurant':
        return <RestaurantFields key={group} {...commonProps} />;
      case 'retail':
        return <RetailFields key={group} {...commonProps} />;
      case 'customer':
        return <CustomerFields key={group} {...commonProps} />;
      case 'staff':
        return <StaffFields key={group} {...commonProps} />;
      case 'competition':
        return <CompetitionFields key={group} {...commonProps} />;
      case 'location':
        return <LocationFields key={group} {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="4xl" title={`编辑运营数据 - ${merchant.name}`}>
      <div className="p-6">
        {/* 数据来源选择 */}
        <div className="mb-6 pb-4 border-b border-gray-200">
          <label className="block text-sm font-medium mb-2 text-gray-700">
            数据来源
          </label>
          <select
            value={dataSource}
            onChange={(e) => setDataSource(e.target.value as OperationalDetails['dataSource'])}
            className="border border-gray-300 rounded px-3 py-2 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {DATA_SOURCE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* 字段组区域 */}
        <div className="max-h-[50vh] overflow-y-auto space-y-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fieldGroups.map((group) => (
              <div key={group} className="bg-gray-50 p-4 rounded-lg">
                {renderFieldGroup(group)}
              </div>
            ))}
          </div>
        </div>

        {/* 备注 */}
        <div className="mb-6 pb-4 border-b border-gray-200">
          <label className="block text-sm font-medium mb-2 text-gray-700">
            备注说明
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="补充说明或特殊情况..."
            className="border border-gray-300 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>

        {/* 底部按钮栏 */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={isSaving}
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? '保存中...' : '保存'}
          </button>
        </div>

        {/* 警告提示 */}
        {typeof window !== 'undefined' && !localStorage.getItem('lastInspector') && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
            <i className="fas fa-exclamation-triangle mr-2"></i>
            提示：当前使用默认录入人（{getUserInfo().name}）。建议在系统设置中配置用户信息。
          </div>
        )}
      </div>
    </Modal>
  );
}
