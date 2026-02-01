'use client';

import React from 'react';
import { Merchant } from '@/types';

interface QuickTemplate {
  name: string;
  description: string;
  icon: string;
  getMerchants: (allMerchants: Merchant[]) => Merchant[];
}

interface QuickTemplatesProps {
  merchants: Merchant[];
  onSelectTemplate: (merchants: Merchant[]) => void;
}

export default function QuickTemplates({
  merchants,
  onSelectTemplate,
}: QuickTemplatesProps) {
  const templates: QuickTemplate[] = [
    {
      name: '同业态TOP3',
      description: '选择同一业态健康度最高的3家商户',
      icon: 'fa-trophy',
      getMerchants: (allMerchants) => {
        // 获取所有业态
        const categories = [...new Set(allMerchants.map(m => m.category.split('-')[0]))];
        // 默认选择第一个业态的TOP3
        if (categories.length > 0) {
          const category = categories[0];
          return allMerchants
            .filter(m => m.category.startsWith(category))
            .sort((a, b) => b.totalScore - a.totalScore)
            .slice(0, 3);
        }
        return [];
      },
    },
    {
      name: '高风险商户群',
      description: '选择所有高风险和极高风险商户',
      icon: 'fa-exclamation-triangle',
      getMerchants: (allMerchants) => {
        return allMerchants
          .filter(m => m.riskLevel === 'high' || m.riskLevel === 'critical')
          .slice(0, 5);
      },
    },
    {
      name: '健康度对比',
      description: '选择最高分、中间分、最低分商户',
      icon: 'fa-chart-line',
      getMerchants: (allMerchants) => {
        const sorted = [...allMerchants].sort((a, b) => b.totalScore - a.totalScore);
        if (sorted.length >= 3) {
          const middleIndex = Math.floor(sorted.length / 2);
          return [sorted[0], sorted[middleIndex], sorted[sorted.length - 1]];
        }
        return sorted.slice(0, 3);
      },
    },
    {
      name: '租售比预警',
      description: '选择租售比超过25%的商户',
      icon: 'fa-percentage',
      getMerchants: (allMerchants) => {
        return allMerchants
          .filter(m => m.rentToSalesRatio > 0.25)
          .sort((a, b) => b.rentToSalesRatio - a.rentToSalesRatio)
          .slice(0, 5);
      },
    },
  ];

  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">
        <i className="fa-solid fa-bolt mr-2 text-brand-600"></i>
        快捷方案
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {templates.map((template) => {
          const selectedMerchants = template.getMerchants(merchants);
          const isAvailable = selectedMerchants.length >= 2;

          return (
            <button
              key={template.name}
              onClick={() => isAvailable && onSelectTemplate(selectedMerchants)}
              disabled={!isAvailable}
              className={`p-4 rounded-lg border text-left transition-all ${
                isAvailable
                  ? 'bg-white border-slate-200 hover:border-brand-500 hover:shadow-md cursor-pointer'
                  : 'bg-slate-50 border-slate-100 cursor-not-allowed opacity-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isAvailable ? 'bg-brand-50' : 'bg-slate-100'
                }`}>
                  <i className={`fa-solid ${template.icon} text-lg ${
                    isAvailable ? 'text-brand-600' : 'text-slate-400'
                  }`}></i>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-900 text-sm mb-1">
                    {template.name}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {template.description}
                  </p>
                  {isAvailable && (
                    <p className="text-xs text-brand-600 mt-2">
                      {selectedMerchants.length} 个商户
                    </p>
                  )}
                  {!isAvailable && (
                    <p className="text-xs text-slate-400 mt-2">
                      暂无符合条件的商户
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
