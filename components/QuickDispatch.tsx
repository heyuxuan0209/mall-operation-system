'use client';

import React, { useState } from 'react';
import { Plus, X, Zap, AlertTriangle, TrendingDown, DollarSign, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { mockMerchants } from '@/data/merchants/mock-data';
import { Merchant } from '@/types';

export default function QuickDispatch() {
  const [isOpen, setIsOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskType, setRiskType] = useState('');
  const [description, setDescription] = useState('');
  const router = useRouter();

  // 筛选商户
  const filteredMerchants = mockMerchants.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    m.riskLevel !== 'none'
  );

  // 快速创建任务
  const handleQuickCreate = () => {
    if (!selectedMerchant || !riskType) {
      alert('请选择商户和风险类型');
      return;
    }

    const existingTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const newTaskId = 'T' + Date.now().toString().slice(-6) + Math.random().toString(36).substr(2, 3);

    const riskTypeMap: any = {
      'rent_overdue': '租金逾期',
      'low_revenue': '营收下滑',
      'high_rent_ratio': '租售比过高',
      'customer_complaint': '顾客投诉'
    };

    const newTask = {
      id: newTaskId,
      merchantId: selectedMerchant.id,
      merchantName: selectedMerchant.name,
      title: `${selectedMerchant.name}风险处理 - ${riskTypeMap[riskType]}`,
      description: description || `${riskTypeMap[riskType]}，需要及时介入帮扶`,
      measures: [],
      assignee: selectedMerchant.riskLevel === 'high' ? '运营经理' : '运营助理',
      assignedTo: selectedMerchant.riskLevel === 'high' ? '运营经理 张伟' : '运营助理 李明',
      assignedLevel: selectedMerchant.riskLevel === 'high' ? 'manager' : 'assistant',
      status: 'in_progress',
      stage: 'planning',
      priority: selectedMerchant.riskLevel === 'high' ? 'urgent' : selectedMerchant.riskLevel === 'medium' ? 'high' : 'medium',
      riskLevel: selectedMerchant.riskLevel,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      startDate: new Date().toISOString().split('T')[0],
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      initialMetrics: selectedMerchant.metrics,
      logs: [],
      collectionStatus: selectedMerchant.rentToSalesRatio > 0.25 ? 'owed' : 'normal'
    };

    existingTasks.push(newTask);
    localStorage.setItem('tasks', JSON.stringify(existingTasks));

    // 跳转到任务详情
    router.push(`/tasks?taskId=${newTaskId}`);
    setIsOpen(false);
    setShowForm(false);
    setSelectedMerchant(null);
    setRiskType('');
    setDescription('');
  };

  // 快捷操作选项
  const quickActions = [
    {
      icon: AlertTriangle,
      label: '高风险商户',
      color: 'bg-red-500 hover:bg-red-600',
      action: () => router.push('/risk?severity=high')
    },
    {
      icon: TrendingDown,
      label: '营收下滑',
      color: 'bg-orange-500 hover:bg-orange-600',
      action: () => router.push('/risk?type=low_revenue')
    },
    {
      icon: DollarSign,
      label: '租金逾期',
      color: 'bg-yellow-500 hover:bg-yellow-600',
      action: () => router.push('/risk?type=rent_overdue')
    },
    {
      icon: Zap,
      label: '自定义派单',
      color: 'bg-purple-500 hover:bg-purple-600',
      action: () => setShowForm(true)
    }
  ];

  return (
    <>
      {/* 浮动按钮 */}
      <div className="fixed bottom-20 lg:bottom-8 right-4 lg:right-8 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${
            isOpen
              ? 'bg-slate-700 rotate-45'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-xl hover:scale-110'
          }`}
        >
          <Plus className="text-white" size={28} />
        </button>

        {/* 快捷操作菜单 */}
        {isOpen && (
          <div className="absolute bottom-16 right-0 mb-2 space-y-2 animate-fade-in-up">
            {quickActions.map((action, i) => (
              <button
                key={i}
                onClick={action.action}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-white shadow-lg transition-all hover:scale-105 ${action.color}`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <action.icon size={20} />
                <span className="text-sm font-medium whitespace-nowrap">{action.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 自定义派单表单 */}
      {showForm && (
        <div
          onClick={() => {
            setShowForm(false);
            setIsOpen(false);
          }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md animate-fade-in-up"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">快速派单</h3>
              <button
                onClick={() => {
                  setShowForm(false);
                  setIsOpen(false);
                }}
                className="p-1 hover:bg-slate-100 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* 选择商户 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  选择商户 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="搜索商户名称..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                />
                <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg">
                  {filteredMerchants.slice(0, 5).map((merchant) => (
                    <button
                      key={merchant.id}
                      onClick={() => setSelectedMerchant(merchant)}
                      className={`w-full text-left px-3 py-2 hover:bg-slate-50 transition ${
                        selectedMerchant?.id === merchant.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{merchant.name}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            merchant.riskLevel === 'high'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}
                        >
                          {merchant.riskLevel === 'high' ? '高风险' : '中风险'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 风险类型 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  风险类型 <span className="text-red-500">*</span>
                </label>
                <select
                  value={riskType}
                  onChange={(e) => setRiskType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">请选择...</option>
                  <option value="rent_overdue">租金逾期</option>
                  <option value="low_revenue">营收下滑</option>
                  <option value="high_rent_ratio">租售比过高</option>
                  <option value="customer_complaint">顾客投诉</option>
                </select>
              </div>

              {/* 问题描述 */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  问题描述（选填）
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="描述具体问题..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowForm(false);
                  setIsOpen(false);
                }}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                取消
              </button>
              <button
                onClick={handleQuickCreate}
                disabled={!selectedMerchant || !riskType}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                立即派单
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
