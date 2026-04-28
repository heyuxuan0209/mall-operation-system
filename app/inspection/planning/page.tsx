/**
 * 智能巡检规划页面
 * Sprint 1: 展示AI生成的巡检计划
 */

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Lightbulb } from 'lucide-react';
import IntelligentPlanningPanel from '@/components/inspection/IntelligentPlanningPanel';
import { Merchant, InspectionRecord } from '@/types';
import { mockMerchants } from '@/data/merchants/mock-data';
import { inspectionServiceInstance } from '@/utils/inspectionService';

export default function InspectionPlanningPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [inspectionRecords, setInspectionRecords] = useState<InspectionRecord[]>([]);

  useEffect(() => {
    // 加载商户数据
    setMerchants(mockMerchants);

    // 加载巡检记录
    const records = inspectionServiceInstance.getAllRecords();
    setInspectionRecords(records);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pb-8">
      {/* 页面头部 */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/inspection"
                className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
                title="返回"
              >
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Lightbulb className="text-yellow-500" size={28} />
                  智能巡检规划
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  AI智能分析商户健康度，推荐巡检优先级和重点关注领域
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容 */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* 功能说明 */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-5 mb-6">
          <h3 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
            <Lightbulb size={20} className="text-purple-600" />
            智能规划功能说明
          </h3>
          <ul className="space-y-2 text-sm text-purple-800">
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">•</span>
              <span>
                <strong>AI优先级计算</strong>: 综合健康度趋势、风险等级、超期天数，自动计算巡检优先级
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">•</span>
              <span>
                <strong>风险预测</strong>: 基于商户数据预测潜在风险，置信度评分帮助决策
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">•</span>
              <span>
                <strong>定制检查清单</strong>: 根据商户薄弱维度和历史问题生成专属检查清单
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">•</span>
              <span>
                <strong>问题预测</strong>: AI预判可能发现的问题，提前做好准备
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-600 font-bold">•</span>
              <span>
                <strong>历史追踪</strong>: 显示上次巡检发现的问题，便于本次重点验证
              </span>
            </li>
          </ul>
        </div>

        {/* 智能规划面板 */}
        <IntelligentPlanningPanel
          merchants={merchants}
          inspectionRecords={inspectionRecords}
        />
      </div>
    </div>
  );
}
