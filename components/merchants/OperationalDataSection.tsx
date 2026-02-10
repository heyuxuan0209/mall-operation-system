'use client';

import React, { useState } from 'react';
import { Merchant } from '@/types';
import OperationalDataDisplay from './OperationalDataDisplay';
import OperationalDataForm from './OperationalDataForm';

interface OperationalDataSectionProps {
  merchant: Merchant;
}

/**
 * 运营数据区域组件（客户端组件）
 * 管理编辑模态框的状态
 */
export default function OperationalDataSection({ merchant }: OperationalDataSectionProps) {
  const [showEditModal, setShowEditModal] = useState(false);

  return (
    <>
      {/* 详细运营数据卡片 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* 卡片头部 */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <i className="fas fa-chart-line text-indigo-600 text-lg"></i>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">详细运营数据</h3>
              <p className="text-sm text-gray-500">客流、营收、员工等运营指标</p>
            </div>
          </div>
          <button
            onClick={() => setShowEditModal(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <i className={`fas ${merchant.operationalDetails ? 'fa-edit' : 'fa-plus'}`}></i>
            {merchant.operationalDetails ? '编辑数据' : '添加数据'}
          </button>
        </div>

        {/* 数据展示 */}
        <div className="p-6">
          <OperationalDataDisplay
            data={merchant.operationalDetails}
            category={merchant.category}
          />
        </div>
      </div>

      {/* 编辑模态框 */}
      {showEditModal && (
        <OperationalDataForm
          merchant={merchant}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => window.location.reload()}
        />
      )}
    </>
  );
}
