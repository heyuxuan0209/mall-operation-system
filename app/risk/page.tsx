'use client';

import React, { useState } from 'react';
import { AlertTriangle, Clock, CheckCircle, XCircle, Filter, Search, Plus, Eye, X } from 'lucide-react';
import { mockRiskAlerts, getRiskStatistics } from '@/data/tasks/mock-data';
import { mockMerchants } from '@/data/merchants/mock-data';
import { RiskAlert, Merchant } from '@/types';

export default function RiskManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('unresolved');
  const [selectedAlert, setSelectedAlert] = useState<RiskAlert | null>(null);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [selectedAlerts, setSelectedAlerts] = useState<Set<string>>(new Set());
  const [showBatchCreate, setShowBatchCreate] = useState(false);

  const stats = getRiskStatistics(mockRiskAlerts);

  // 筛选风险预警
  const filteredAlerts = mockRiskAlerts.filter(alert => {
    const matchesSearch = alert.merchantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = filterSeverity === 'all' || alert.severity === filterSeverity;
    const matchesType = filterType === 'all' || alert.riskType === filterType;
    const matchesStatus = filterStatus === 'all' ||
                         (filterStatus === 'unresolved' && !alert.resolved) ||
                         (filterStatus === 'resolved' && alert.resolved);
    return matchesSearch && matchesSeverity && matchesType && matchesStatus;
  });

  // 获取严重程度颜色
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'low': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'none': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // 获取严重程度文本
  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'high': return '高危';
      case 'medium': return '中危';
      case 'low': return '低危';
      case 'none': return '无风险';
      default: return '未知';
    }
  };

  // 获取风险类型文本
  const getRiskTypeText = (type: string) => {
    switch (type) {
      case 'rent_overdue': return '租金逾期';
      case 'low_revenue': return '营收下滑';
      case 'high_rent_ratio': return '租售比过高';
      case 'customer_complaint': return '顾客投诉';
      default: return '其他';
    }
  };

  // 获取风险类型图标颜色
  const getRiskTypeColor = (type: string) => {
    switch (type) {
      case 'rent_overdue': return 'text-red-600';
      case 'low_revenue': return 'text-orange-600';
      case 'high_rent_ratio': return 'text-yellow-600';
      case 'customer_complaint': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  // 切换选择
  const toggleSelect = (alertId: string) => {
    const newSelected = new Set(selectedAlerts);
    if (newSelected.has(alertId)) {
      newSelected.delete(alertId);
    } else {
      newSelected.add(alertId);
    }
    setSelectedAlerts(newSelected);
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedAlerts.size === filteredAlerts.filter(a => !a.resolved).length) {
      setSelectedAlerts(new Set());
    } else {
      setSelectedAlerts(new Set(filteredAlerts.filter(a => !a.resolved).map(a => a.id)));
    }
  };

  // 批量创建任务
  const handleBatchCreateTasks = () => {
    const alertsToProcess = filteredAlerts.filter(a => selectedAlerts.has(a.id));
    const existingTasks = JSON.parse(localStorage.getItem('tasks') || '[]');

    alertsToProcess.forEach(alert => {
      const merchant = mockMerchants.find(m => m.id === alert.merchantId);
      if (!merchant) return;

      const newTaskId = 'T' + Date.now().toString().slice(-6) + Math.random().toString(36).substr(2, 3);
      const newTask = {
        id: newTaskId,
        merchantId: merchant.id,
        merchantName: merchant.name,
        title: `${merchant.name}风险处理 - ${getRiskTypeText(alert.riskType)}`,
        description: alert.message,
        measures: [],
        assignee: alert.severity === 'high' ? '运营经理' : '运营助理',
        assignedTo: alert.severity === 'high' ? '运营经理' : '运营助理',
        assignedLevel: alert.severity === 'high' ? 'manager' : 'assistant',
        status: 'in_progress',
        stage: 'planning',
        priority: alert.severity === 'high' ? 'urgent' : alert.severity === 'medium' ? 'high' : 'medium',
        riskLevel: merchant.riskLevel,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
        startDate: new Date().toISOString().split('T')[0],
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        initialMetrics: merchant.metrics,
        logs: [],
        collectionStatus: merchant.rentToSalesRatio > 0.25 ? 'owed' : 'normal'
      };

      existingTasks.push(newTask);
    });

    localStorage.setItem('tasks', JSON.stringify(existingTasks));
    alert(`成功创建 ${alertsToProcess.length} 个帮扶任务！`);
    setSelectedAlerts(new Set());
    setShowBatchCreate(false);
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">风险与派单</h1>
          <p className="text-gray-500 mt-1">实时监控风险预警，快速创建帮扶任务</p>
        </div>
        <div className="flex gap-2">
          {selectedAlerts.size > 0 && (
            <button
              onClick={() => setShowBatchCreate(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus size={20} />
              批量派单 ({selectedAlerts.size})
            </button>
          )}
          <button
            onClick={() => setShowCreateTask(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            创建任务
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-red-500 w-12 h-12 rounded-lg flex items-center justify-center">
              <AlertTriangle className="text-white" size={24} />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm mb-1">待处理预警</h3>
          <div className="flex items-baseline gap-1">
            <p className="text-2xl font-bold text-gray-900">{stats.unresolvedAlerts}</p>
            <span className="text-sm text-gray-500">条</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-500 w-12 h-12 rounded-lg flex items-center justify-center">
              <Clock className="text-white" size={24} />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm mb-1">高危预警</h3>
          <div className="flex items-baseline gap-1">
            <p className="text-2xl font-bold text-gray-900">{stats.highSeverity}</p>
            <span className="text-sm text-gray-500">条</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-500 w-12 h-12 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-white" size={24} />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm mb-1">已处理</h3>
          <div className="flex items-baseline gap-1">
            <p className="text-2xl font-bold text-gray-900">
              {mockRiskAlerts.filter(a => a.resolved).length}
            </p>
            <span className="text-sm text-gray-500">条</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-500 w-12 h-12 rounded-lg flex items-center justify-center">
              <XCircle className="text-white" size={24} />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm mb-1">租售比预警</h3>
          <div className="flex items-baseline gap-1">
            <p className="text-2xl font-bold text-gray-900">{stats.byType.high_rent_ratio}</p>
            <span className="text-sm text-gray-500">条</span>
          </div>
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          {/* 搜索框 */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="搜索商户名称或预警内容..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 筛选器 */}
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部状态</option>
              <option value="unresolved">未处理</option>
              <option value="resolved">已处理</option>
            </select>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部严重程度</option>
              <option value="high">高危</option>
              <option value="medium">中危</option>
              <option value="low">低危</option>
            </select>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部类型</option>
              <option value="rent_overdue">租金逾期</option>
              <option value="low_revenue">营收下滑</option>
              <option value="high_rent_ratio">租售比过高</option>
              <option value="customer_complaint">顾客投诉</option>
            </select>
          </div>
        </div>
      </div>

      {/* 风险预警列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">风险预警列表</h3>
            <p className="text-sm text-gray-500 mt-1">共 {filteredAlerts.length} 条预警</p>
          </div>
          {filteredAlerts.filter(a => !a.resolved).length > 0 && (
            <button
              onClick={toggleSelectAll}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {selectedAlerts.size === filteredAlerts.filter(a => !a.resolved).length ? '取消全选' : '全选'}
            </button>
          )}
        </div>
        <div className="divide-y divide-gray-100">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-6 hover:bg-gray-50 transition-colors ${selectedAlerts.has(alert.id) ? 'bg-blue-50' : ''}`}
            >
              <div className="flex items-start gap-4">
                {!alert.resolved && (
                  <input
                    type="checkbox"
                    checked={selectedAlerts.has(alert.id)}
                    onChange={() => toggleSelect(alert.id)}
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <AlertTriangle className={getRiskTypeColor(alert.riskType)} size={20} />
                    <h4 className="font-semibold text-gray-900">{alert.merchantName}</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                      {getSeverityText(alert.severity)}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                      {getRiskTypeText(alert.riskType)}
                    </span>
                    {alert.resolved && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        已处理
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{alert.message}</p>
                  <p className="text-xs text-gray-400">预警时间: {alert.createdAt}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const merchant = mockMerchants.find(m => m.id === alert.merchantId);
                      if (merchant) setSelectedMerchant(merchant);
                    }}
                    className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Eye size={16} />
                    查看商户
                  </button>
                  {!alert.resolved && (
                    <button
                      onClick={() => {
                        setSelectedAlert(alert);
                        setShowCreateTask(true);
                      }}
                      className="px-3 py-1 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                    >
                      创建任务
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 商户详情弹窗 */}
      {selectedMerchant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedMerchant.name}</h2>
                <p className="text-gray-500 mt-1">{selectedMerchant.category}</p>
              </div>
              <button
                onClick={() => setSelectedMerchant(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">基本信息</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">楼层铺位</p>
                    <p className="font-medium text-gray-900">{selectedMerchant.floor} - {selectedMerchant.shopNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">面积</p>
                    <p className="font-medium text-gray-900">{selectedMerchant.area}㎡</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">月租金</p>
                    <p className="font-medium text-gray-900">¥{selectedMerchant.rent.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">上月营收</p>
                    <p className="font-medium text-gray-900">¥{selectedMerchant.lastMonthRevenue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">租售比</p>
                    <p className={`font-medium ${selectedMerchant.rentToSalesRatio > 0.25 ? 'text-red-600' : 'text-gray-900'}`}>
                      {(selectedMerchant.rentToSalesRatio * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">健康度评分</p>
                    <p className={`font-medium ${selectedMerchant.totalScore < 60 ? 'text-red-600' : 'text-gray-900'}`}>
                      {selectedMerchant.totalScore}分
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 创建任务弹窗 */}
      {showCreateTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">创建帮扶任务</h2>
              <button
                onClick={() => {
                  setShowCreateTask(false);
                  setSelectedAlert(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">商户名称</label>
                  <input
                    type="text"
                    defaultValue={selectedAlert?.merchantName || ''}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">任务标题</label>
                  <input
                    type="text"
                    placeholder="请输入任务标题"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">任务描述</label>
                  <textarea
                    rows={4}
                    defaultValue={selectedAlert?.message || ''}
                    placeholder="请输入任务描述"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">优先级</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="urgent">紧急</option>
                      <option value="high">高</option>
                      <option value="medium">中</option>
                      <option value="low">低</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">负责人</label>
                    <input
                      type="text"
                      placeholder="请输入负责人"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">截止日期</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                    创建任务
                  </button>
                  <button
                    onClick={() => {
                      setShowCreateTask(false);
                      setSelectedAlert(null);
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    取消
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 批量派单确认弹窗 */}
      {showBatchCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">批量派单确认</h2>
              <button
                onClick={() => setShowBatchCreate(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <i className="fa-solid fa-info-circle mr-2"></i>
                  您已选择 <strong>{selectedAlerts.size}</strong> 条风险预警，系统将自动为每条预警创建对应的帮扶任务。
                </p>
              </div>

              <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                {filteredAlerts.filter(a => selectedAlerts.has(a.id)).map((alert) => {
                  const merchant = mockMerchants.find(m => m.id === alert.merchantId);
                  return (
                    <div key={alert.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900">{alert.merchantName}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                              {getSeverityText(alert.severity)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{alert.message}</p>
                          <p className="text-xs text-gray-500">
                            责任人：{alert.severity === 'high' ? '运营经理' : '运营助理'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={handleBatchCreateTasks}
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  <i className="fa-solid fa-check mr-2"></i>
                  确认批量派单
                </button>
                <button
                  onClick={() => setShowBatchCreate(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
