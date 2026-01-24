'use client';

import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Users, AlertTriangle, Activity, BookOpen, ArrowRight, X } from 'lucide-react';
import { mockMerchants, getStatistics } from '@/data/merchants/mock-data';
import { Merchant } from '@/types';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import knowledgeBase from '@/data/cases/knowledge_base.json';

export default function DashboardPage() {
  const stats = getStatistics(mockMerchants);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string | null>(null);
  const [aiDiagnosis, setAiDiagnosis] = useState<any>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // 计算高风险商户数
  const highRiskCount = stats.highRiskCount;

  // 统计卡片数据
  const statCards = [
    {
      key: 'total',
      title: '商户总数',
      value: stats.totalMerchants,
      unit: '户',
      icon: Users,
      color: 'bg-blue-500',
      trend: '+2户',
      trendUp: true,
      merchants: mockMerchants
    },
    {
      key: 'highRisk',
      title: '高风险商户数',
      value: highRiskCount,
      unit: '户',
      icon: AlertTriangle,
      color: 'bg-red-500',
      trend: '-2户',
      trendUp: false,
      merchants: mockMerchants.filter(m => m.riskLevel === 'high')
    },
    {
      key: 'avgHealth',
      title: '平均健康分',
      value: stats.averageHealthScore,
      unit: '分',
      icon: Activity,
      color: 'bg-green-500',
      trend: '+3分',
      trendUp: true,
      merchants: [...mockMerchants].sort((a, b) => b.totalScore - a.totalScore)
    },
    {
      key: 'knowledge',
      title: '帮扶案例知识库',
      value: knowledgeBase.length,
      unit: '个',
      icon: BookOpen,
      color: 'bg-purple-500',
      trend: '+5个',
      trendUp: true,
      cases: knowledgeBase
    }
  ];

  // 近6个月风险商户数量趋势 - 改为新的4级分类
  const riskTrend = [
    { month: '8月', high: 3, medium: 2, low: 4, none: 0 },
    { month: '9月', high: 2, medium: 3, low: 3, none: 1 },
    { month: '10月', high: 3, medium: 2, low: 2, none: 2 },
    { month: '11月', high: 2, medium: 3, low: 3, none: 1 },
    { month: '12月', high: 2, medium: 2, low: 2, none: 2 },
    { month: '1月', high: 1, medium: 1, low: 2, none: 2 }
  ];

  // 健康度分布数据 - 改为4级分类
  const healthDistribution = [
    { name: '高风险', value: stats.highRiskCount, color: '#ef4444', level: 'high' },
    { name: '中风险', value: stats.mediumRiskCount, color: '#f97316', level: 'medium' },
    { name: '低风险', value: stats.lowRiskCount, color: '#eab308', level: 'low' },
    { name: '无风险', value: stats.noneRiskCount, color: '#22c55e', level: 'none' }
  ];

  // 待处理商户（风险商户）
  const pendingMerchants = mockMerchants.filter(m =>
    m.riskLevel === 'high' || m.riskLevel === 'medium'
  );

  // 获取风险等级颜色 - 更新为4级
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'low': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'none': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // 生成AI诊断报告
  const handleGenerateAiDiagnosis = async () => {
    if (!selectedMerchant) return;
    setIsGeneratingAi(true);

    // 模拟AI分析延迟
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 根据商户类型和问题从知识库匹配相似案例
    const merchantCategory = selectedMerchant.category.split('-')[0]; // 获取大类，如"餐饮"
    const matchedCases = knowledgeBase.filter((c: any) =>
      c.industry.includes(merchantCategory)
    ).slice(0, 3);

    // 分析商户问题
    const problems = [];
    if (selectedMerchant.rentToSalesRatio > 0.25) {
      problems.push('租售比过高(' + (selectedMerchant.rentToSalesRatio * 100).toFixed(1) + '%)，超过25%警戒线');
    }
    if (selectedMerchant.metrics.operational < 60) {
      problems.push('经营表现不佳(' + selectedMerchant.metrics.operational + '分)');
    }
    if (selectedMerchant.metrics.collection < 80) {
      problems.push('租金缴纳存在风险(' + selectedMerchant.metrics.collection + '分)');
    }
    if (selectedMerchant.metrics.customerReview < 70) {
      problems.push('顾客满意度偏低(' + selectedMerchant.metrics.customerReview + '分)');
    }

    const diagnosis = {
      merchantName: selectedMerchant.name,
      category: selectedMerchant.category,
      riskLevel: selectedMerchant.riskLevel,
      problems: problems,
      matchedCases: matchedCases,
      recommendations: matchedCases.map((c: any) => ({
        strategy: c.strategy,
        action: c.action,
        caseId: c.id
      }))
    };

    setAiDiagnosis(diagnosis);
    setIsGeneratingAi(false);
  };

  // 创建帮扶任务（跳转到帮扶任务中心）
  const handleCreateTask = () => {
    if (!selectedMerchant) return;

    // 生成新任务ID
    const newTaskId = 'T' + Date.now().toString().slice(-6);

    // 创建任务对象
    const newTask = {
      id: newTaskId,
      merchantId: selectedMerchant.id,
      merchantName: selectedMerchant.name,
      title: `${selectedMerchant.name}经营改善帮扶`,
      description: `该商户${aiDiagnosis?.problems.join('，') || '存在经营问题'}，需要介入帮扶`,
      measures: aiDiagnosis?.recommendations.map((r: any) => r.action) || [],
      assignee: '运营经理',
      assignedTo: '运营经理',
      assignedLevel: selectedMerchant.riskLevel === 'high' ? 'manager' : 'assistant',
      status: 'in_progress',
      stage: 'planning',
      priority: selectedMerchant.riskLevel === 'high' ? 'urgent' : 'high',
      riskLevel: selectedMerchant.riskLevel,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      startDate: new Date().toISOString().split('T')[0],
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      initialMetrics: selectedMerchant.metrics,
      logs: [],
      collectionStatus: selectedMerchant.rentToSalesRatio > 0.25 ? 'owed' : 'normal'
    };

    // 将任务数据存储到localStorage
    const existingTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    existingTasks.push(newTask);
    localStorage.setItem('tasks', JSON.stringify(existingTasks));

    // 跳转到任务中心并自动打开该任务
    window.location.href = `/tasks?taskId=${newTaskId}`;
  };

  // 获取风险等级文本 - 更新为4级
  const getRiskText = (level: string) => {
    switch (level) {
      case 'high': return '高风险';
      case 'medium': return '中风险';
      case 'low': return '低风险';
      case 'none': return '无风险';
      default: return '未知';
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">运营总览</h1>
        <p className="text-gray-500 mt-1">实时监控商场运营数据与商户健康状况</p>
      </div>

      {/* 统计卡片 - 可点击下钻 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.key}
              onClick={() => setSelectedCard(card.key)}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 cursor-pointer hover:shadow-md transition-all hover:scale-105"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                  <Icon className="text-white" size={24} />
                </div>
                <div className={`flex items-center gap-1 text-sm ${card.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                  {card.trendUp ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  <span>{card.trend}</span>
                </div>
              </div>
              <h3 className="text-gray-500 text-sm mb-1">{card.title}</h3>
              <div className="flex items-baseline gap-1">
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <span className="text-sm text-gray-500">{card.unit}</span>
              </div>
              <div className="mt-3 text-xs text-blue-600 flex items-center gap-1">
                <span>查看详情</span>
                <ArrowRight size={14} />
              </div>
            </div>
          );
        })}
      </div>

      {/* 图表区域 - 左右分布 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 商户健康度分布 */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">商户健康度分布</h3>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={healthDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) => `${name} ${value}户 (${(percent * 100).toFixed(0)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                onClick={(data) => setSelectedRiskLevel(data.level)}
                style={{ cursor: 'pointer' }}
              >
                {healthDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {healthDistribution.map((item) => (
              <div key={item.level} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-gray-600">{item.name}: {item.value}户</span>
              </div>
            ))}
          </div>
        </div>

        {/* 近6个月风险商户数量趋势 - 堆积柱状图 */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">近6个月各风险商户数量趋势</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={riskTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="high" stackId="a" fill="#ef4444" name="高风险" radius={[0, 0, 0, 0]} />
              <Bar dataKey="medium" stackId="a" fill="#f97316" name="中风险" radius={[0, 0, 0, 0]} />
              <Bar dataKey="low" stackId="a" fill="#eab308" name="低风险" radius={[0, 0, 0, 0]} />
              <Bar dataKey="none" stackId="a" fill="#22c55e" name="无风险" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 待处理商户清单 */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">待处理商户清单</h3>
          <span className="text-sm text-gray-500">共 {pendingMerchants.length} 家商户需要关注</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendingMerchants.map((merchant) => (
            <div
              key={merchant.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              {/* 商户名称和业态 */}
              <div className="mb-3">
                <h4 className="font-semibold text-gray-900 mb-1">{merchant.name}</h4>
                <p className="text-sm text-gray-500">{merchant.category}</p>
              </div>

              {/* 关键指标 */}
              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">租售比</span>
                  <span className={merchant.rentToSalesRatio > 0.25 ? 'text-red-600 font-semibold' : 'text-gray-900'}>
                    {(merchant.rentToSalesRatio * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">健康度</span>
                  <span className={merchant.totalScore < 60 ? 'text-red-600 font-semibold' : 'text-gray-900'}>
                    {merchant.totalScore}分
                  </span>
                </div>
              </div>

              {/* 底部：风险标签 + 去处理按钮 */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className={`px-2 py-1 rounded text-xs font-medium border ${getRiskColor(merchant.riskLevel)}`}>
                  {getRiskText(merchant.riskLevel)}
                </span>
                <button
                  onClick={() => setSelectedMerchant(merchant)}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                >
                  去处理
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 卡片下钻弹窗 */}
      {selectedCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* 弹窗头部 */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {statCards.find(c => c.key === selectedCard)?.title}详情
              </h2>
              <button
                onClick={() => setSelectedCard(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            {/* 弹窗内容 */}
            <div className="p-6">
              {selectedCard === 'knowledge' ? (
                // 知识库案例展示
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {knowledgeBase.map((caseItem: any) => (
                    <div
                      key={caseItem.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedCase(caseItem)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">{caseItem.industry}</h3>
                        <span className="text-xs text-gray-500">{caseItem.id}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {caseItem.tags.map((tag: string, idx: number) => (
                          <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{caseItem.symptoms}</p>
                      <div className="mt-3 text-xs text-blue-600 flex items-center gap-1">
                        <span>查看详情</span>
                        <ArrowRight size={12} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // 商户列表展示
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">商户名称</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">业态</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">楼层</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">月营收</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">租售比</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">健康度</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">风险等级</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statCards.find(c => c.key === selectedCard)?.merchants?.map((merchant) => (
                        <tr key={merchant.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-900">{merchant.name}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{merchant.category}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{merchant.floor}</td>
                          <td className="py-3 px-4 text-sm text-gray-900">
                            ¥{(merchant.lastMonthRevenue / 10000).toFixed(1)}万
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <span className={merchant.rentToSalesRatio > 0.25 ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                              {(merchant.rentToSalesRatio * 100).toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <span className={merchant.totalScore < 60 ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                              {merchant.totalScore}分
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRiskColor(merchant.riskLevel)}`}>
                              {getRiskText(merchant.riskLevel)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 商户详情弹窗（去处理） */}
      {selectedMerchant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* 弹窗头部 */}
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

            {/* 弹窗内容 */}
            <div className="p-6 space-y-6">
              {/* 风险等级 */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">风险等级:</span>
                <span className={`px-4 py-2 rounded-lg text-sm font-medium border ${getRiskColor(selectedMerchant.riskLevel)}`}>
                  {getRiskText(selectedMerchant.riskLevel)}
                </span>
              </div>

              {/* 基本信息 */}
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

              {/* 健康度指标 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">健康度指标</h3>
                <div className="space-y-3">
                  {Object.entries(selectedMerchant.metrics).map(([key, value]) => {
                    const labels: Record<string, string> = {
                      collection: '租金缴纳',
                      operational: '经营表现',
                      siteQuality: '现场品质',
                      customerReview: '顾客满意度',
                      riskResistance: '抗风险能力'
                    };
                    return (
                      <div key={key}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-600">{labels[key]}</span>
                          <span className="font-semibold text-gray-900">{value}分</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              value >= 80 ? 'bg-green-500' :
                              value >= 60 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${value}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-3">
                <button
                  onClick={handleGenerateAiDiagnosis}
                  disabled={isGeneratingAi}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingAi ? (
                    <span className="flex items-center justify-center gap-2">
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      生成中...
                    </span>
                  ) : (
                    '生成AI诊断报告'
                  )}
                </button>
                <button
                  onClick={handleCreateTask}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  创建帮扶任务
                </button>
              </div>

              {/* AI诊断报告 */}
              {aiDiagnosis && (
                <div className="mt-6 p-6 bg-purple-50 border border-purple-200 rounded-xl animate-fade-in">
                  <div className="flex items-center gap-2 mb-4">
                    <i className="fa-solid fa-robot text-purple-600 text-xl"></i>
                    <h3 className="text-lg font-bold text-purple-900">AI诊断报告</h3>
                  </div>

                  {/* 问题诊断 */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2 text-sm">识别问题</h4>
                    <ul className="space-y-2">
                      {aiDiagnosis.problems.map((problem: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <i className="fa-solid fa-circle-exclamation text-red-500 mt-0.5"></i>
                          {problem}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 相似案例 */}
                  {aiDiagnosis.matchedCases.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2 text-sm">相似案例参考</h4>
                      <div className="space-y-2">
                        {aiDiagnosis.matchedCases.map((c: any, i: number) => (
                          <div
                            key={i}
                            onClick={() => window.location.href = `/knowledge?caseId=${c.id}`}
                            className="bg-white p-3 rounded border border-purple-100 cursor-pointer hover:border-purple-300 hover:shadow-md transition-all"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-purple-700">{c.merchantName || c.industry}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">{c.id}</span>
                                <i className="fa-solid fa-arrow-right text-purple-400 text-xs"></i>
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 mb-1"><strong>症状：</strong>{c.symptoms}</p>
                            <p className="text-xs text-gray-600"><strong>策略：</strong>{c.strategy}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 推荐措施 */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2 text-sm">推荐帮扶措施</h4>
                    <ul className="space-y-2">
                      {aiDiagnosis.recommendations.map((rec: any, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700 bg-white p-3 rounded border border-purple-100">
                          <span className="font-bold text-purple-600 shrink-0">{i + 1}.</span>
                          <span>{rec.action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 案例详情弹窗 */}
      {selectedCase && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* 弹窗头部 */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedCase.industry}</h2>
                <p className="text-gray-500 mt-1 text-sm">{selectedCase.id}</p>
              </div>
              <button
                onClick={() => setSelectedCase(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            {/* 弹窗内容 */}
            <div className="p-6 space-y-6">
              {/* 标签 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">标签</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCase.tags.map((tag: string, idx: number) => (
                    <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full border border-blue-200">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* 症状 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">症状描述</h3>
                <p className="text-gray-900 bg-gray-50 p-4 rounded-lg">{selectedCase.symptoms}</p>
              </div>

              {/* 诊断 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">问题诊断</h3>
                <p className="text-gray-900 bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                  {selectedCase.diagnosis}
                </p>
              </div>

              {/* 策略 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">帮扶策略</h3>
                <p className="text-gray-900 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                  {selectedCase.strategy}
                </p>
              </div>

              {/* 具体措施 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">具体措施</h3>
                <p className="text-gray-900 bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                  {selectedCase.action}
                </p>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-3 pt-4 border-t">
                <button className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  应用此案例
                </button>
                <button className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  收藏案例
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 饼图点击下钻弹窗 */}
      {selectedRiskLevel && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* 弹窗头部 */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {getRiskText(selectedRiskLevel)}商户列表
              </h2>
              <button
                onClick={() => setSelectedRiskLevel(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            {/* 弹窗内容 */}
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">商户名称</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">业态</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">楼层</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">月营收</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">租售比</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">健康度</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockMerchants
                      .filter(m => m.riskLevel === selectedRiskLevel)
                      .map((merchant) => (
                        <tr key={merchant.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-900">{merchant.name}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{merchant.category}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{merchant.floor}</td>
                          <td className="py-3 px-4 text-sm text-gray-900">
                            ¥{(merchant.lastMonthRevenue / 10000).toFixed(1)}万
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <span className={merchant.rentToSalesRatio > 0.25 ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                              {(merchant.rentToSalesRatio * 100).toFixed(1)}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <span className={merchant.totalScore < 60 ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                              {merchant.totalScore}分
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => {
                                setSelectedRiskLevel(null);
                                setSelectedMerchant(merchant);
                              }}
                              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                            >
                              查看详情
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
