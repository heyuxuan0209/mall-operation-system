'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Merchant } from '@/types';
import knowledgeBase from '@/data/cases/knowledge_base.json';
import HealthTrendChart from '@/components/HealthTrendChart';
import IndustryBenchmark from '@/components/IndustryBenchmark';
import MerchantHistoryArchive from '@/components/merchants/MerchantHistoryArchive';
import ReturnToArchiveButton from '@/components/ui/ReturnToArchiveButton';
import { merchantDataManager } from '@/utils/merchantDataManager';
import Link from 'next/link';

function HealthMonitoringContent() {
  const searchParams = useSearchParams();
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [filterRisk, setFilterRisk] = useState<string>('ALL');
  const [showActionModal, setShowActionModal] = useState(false);
  const [isMisjudgment, setIsMisjudgment] = useState(false);
  const [misjudgmentReason, setMisjudgmentReason] = useState('');
  const [actionType, setActionType] = useState<'leasing' | 'assistance' | null>(null);
  const [assigneeRole, setAssigneeRole] = useState('运营经理');

  // AI诊断相关
  const [aiDiagnosis, setAiDiagnosis] = useState<any>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // 多选对比模式
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // 使用动态商户数据
  const [merchants, setMerchants] = useState<Merchant[]>([]);

  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280);
  const isMobileView = windowWidth < 1280;

  // 加载商户数据并监听变化
  useEffect(() => {
    // 初始加载
    setMerchants(merchantDataManager.getAllMerchants());

    // 监听数据变化
    const unsubscribe = merchantDataManager.onMerchantsChange((updatedMerchants) => {
      setMerchants(updatedMerchants);

      // 如果当前选中的商户数据更新了，同步更新 selectedMerchant
      if (selectedMerchant) {
        const updated = updatedMerchants.find(m => m.id === selectedMerchant.id);
        if (updated) {
          setSelectedMerchant(updated);
        }
      }
    });

    return unsubscribe;
  }, [selectedMerchant]);

  // 处理URL参数，自动选中商户
  useEffect(() => {
    const merchantIdParam = searchParams.get('merchantId');
    if (merchantIdParam && merchants.length > 0) {
      const merchant = merchants.find(m => m.id === merchantIdParam);
      if (merchant) {
        setSelectedMerchant(merchant);
        // 移动端滚动到详情视图
        if (window.innerWidth < 1280) {
          setTimeout(() => {
            document.getElementById('merchant-detail-view')?.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      }
    }
  }, [searchParams, merchants]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredMerchants = merchants.filter(m => {
    if (filterRisk !== 'ALL' && m.riskLevel !== filterRisk) return false;
    return true;
  });

  const handleViewDetails = (merchant: Merchant) => {
    setSelectedMerchant(merchant);
    if (isMobileView) {
      setTimeout(() => {
        document.getElementById('merchant-detail-view')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  // 切换对比模式
  const handleToggleCompareMode = () => {
    setIsCompareMode(!isCompareMode);
    if (isCompareMode) {
      // 退出对比模式时清空选择
      setSelectedIds([]);
    }
  };

  // 切换商户选中状态
  const handleToggleMerchant = (merchantId: string) => {
    if (selectedIds.includes(merchantId)) {
      setSelectedIds(selectedIds.filter(id => id !== merchantId));
    } else {
      if (selectedIds.length < 5) {
        setSelectedIds([...selectedIds, merchantId]);
      }
    }
  };

  const getRiskBadge = (level: string) => {
    const styles = {
      'critical': 'bg-purple-100 text-purple-800 border-purple-200',
      'high': 'bg-red-100 text-red-800 border-red-200',
      'medium': 'bg-orange-100 text-orange-800 border-orange-200',
      'low': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'none': 'bg-green-100 text-green-800 border-green-200',
    };
    const text = {
      'critical': '极高风险',
      'high': '高风险',
      'medium': '中风险',
      'low': '低风险',
      'none': '无风险',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-bold border ${styles[level as keyof typeof styles]}`}>
        {text[level as keyof typeof text]}
      </span>
    );
  };

  const handleSubmitAction = () => {
    if (!selectedMerchant) return;
    if (isMisjudgment) {
      alert(`已标记为误判，原因：${misjudgmentReason}`);
      setShowActionModal(false);
    } else {
      if (actionType === 'leasing') {
        alert(`已将【${selectedMerchant.name}】推送到招商预警池`);
        setShowActionModal(false);
      } else if (actionType === 'assistance') {
        // 创建帮扶任务
        const newTaskId = 'T' + Date.now().toString().slice(-6);

        const newTask = {
          id: newTaskId,
          merchantId: selectedMerchant.id,
          merchantName: selectedMerchant.name,
          title: `${selectedMerchant.name}经营改善帮扶`,
          description: `该商户健康度评分${selectedMerchant.totalScore}分，风险等级${selectedMerchant.riskLevel}，需要介入帮扶`,
          measures: [],
          assignee: assigneeRole,
          assignedTo: assigneeRole,
          assignedLevel: assigneeRole === '运营经理' ? 'manager' : 'assistant',
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

        // 存储到localStorage
        const existingTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        existingTasks.push(newTask);
        localStorage.setItem('tasks', JSON.stringify(existingTasks));

        // 跳转到任务中心
        window.location.href = `/tasks?taskId=${newTaskId}`;
      }
    }
    setIsMisjudgment(false);
    setActionType(null);
  };

  // 渲染趋势（百分比）
  const renderTrend = (value: number) => {
    if (value > 0) {
      return (
        <span className="flex items-center gap-1 text-green-600 text-xs">
          <i className="fa-solid fa-arrow-up text-[10px]"></i>
          +{value.toFixed(1)}%
        </span>
      );
    } else if (value < 0) {
      return (
        <span className="flex items-center gap-1 text-red-600 text-xs">
          <i className="fa-solid fa-arrow-down text-[10px]"></i>
          {value.toFixed(1)}%
        </span>
      );
    }
    return <span className="text-slate-500 text-xs">-</span>;
  };

  // 渲染评分趋势（绝对值）
  const renderScoreTrend = (value: number) => {
    if (value > 0) {
      return (
        <span className="flex items-center gap-1 text-green-600 text-xs">
          <i className="fa-solid fa-arrow-up text-[10px]"></i>
          +{value.toFixed(0)}分
        </span>
      );
    } else if (value < 0) {
      return (
        <span className="flex items-center gap-1 text-red-600 text-xs">
          <i className="fa-solid fa-arrow-down text-[10px]"></i>
          {value.toFixed(0)}分
        </span>
      );
    }
    return <span className="text-slate-500 text-xs">-</span>;
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

  return (
    <div className="h-full flex flex-col relative space-y-4 lg:space-y-6">
      {/* 工具栏 */}
      <div className="flex gap-2 w-full xl:w-auto flex-wrap items-center">
        {/* 返回档案按钮 */}
        <ReturnToArchiveButton merchantId={selectedMerchant?.id} />

        {/* 筛选器 */}
        <select
          value={filterRisk}
          onChange={(e) => setFilterRisk(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
        >
          <option value="ALL">全部风险等级</option>
          <option value="high">高风险</option>
          <option value="medium">中风险</option>
          <option value="low">低风险</option>
          <option value="none">无风险</option>
        </select>

        {/* 对比模式按钮 */}
        <button
          onClick={handleToggleCompareMode}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            isCompareMode
              ? 'bg-brand-600 text-white hover:bg-brand-700'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
          }`}
        >
          <i className={`fa-solid ${isCompareMode ? 'fa-times' : 'fa-check-square'} mr-2`}></i>
          {isCompareMode ? '取消对比' : '对比商户'}
        </button>

        {/* 已选商户提示和对比按钮 */}
        {isCompareMode && selectedIds.length > 0 && (
          <>
            <span className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm border border-blue-200">
              已选 {selectedIds.length} 个商户
            </span>
            {selectedIds.length >= 2 && (
              <Link
                href={`/health/compare?ids=${selectedIds.join(',')}`}
                className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors text-sm font-medium"
              >
                开始对比
              </Link>
            )}
          </>
        )}
      </div>

      <div className="flex flex-col xl:flex-row gap-6 h-auto xl:h-[calc(100vh-200px)]">
        {/* 左侧：商户列表 */}
        <div className="w-full xl:flex-1 bg-transparent xl:bg-white xl:rounded-xl xl:shadow-sm xl:border xl:border-slate-100 overflow-hidden flex flex-col h-auto xl:h-auto order-1">
          {isMobileView ? (
            <div className="space-y-3">
              {filteredMerchants.map((merchant) => (
                <div
                  key={merchant.id}
                  className={`bg-white p-4 rounded-xl border shadow-sm flex items-center gap-3 ${
                    selectedMerchant?.id === merchant.id ? 'border-brand-500 ring-1 ring-brand-500' : 'border-slate-200'
                  }`}
                >
                  {/* 复选框（对比模式） */}
                  {isCompareMode && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleMerchant(merchant.id);
                      }}
                      className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selectedIds.includes(merchant.id)
                          ? 'bg-brand-600 border-brand-600'
                          : 'border-slate-300'
                      }`}
                    >
                      {selectedIds.includes(merchant.id) && (
                        <i className="fa-solid fa-check text-white text-xs"></i>
                      )}
                    </div>
                  )}

                  <div
                    onClick={() => !isCompareMode && handleViewDetails(merchant)}
                    className={`flex-1 flex justify-between items-center ${!isCompareMode ? 'active:scale-[0.98] transition-transform cursor-pointer' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-1.5 h-12 rounded-full ${
                        merchant.riskLevel === 'high' ? 'bg-red-500' :
                        merchant.riskLevel === 'medium' ? 'bg-orange-500' :
                        merchant.riskLevel === 'low' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-base">{merchant.name}</h4>
                        <p className="text-xs text-slate-500 mt-1">{merchant.category} · {merchant.totalScore}分</p>
                      </div>
                    </div>
                    <div>
                      {getRiskBadge(merchant.riskLevel)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto overflow-y-auto w-full h-full">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50 sticky top-0 z-10">
                  <tr>
                    {isCompareMode && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase whitespace-nowrap w-12"></th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase whitespace-nowrap">商户名称</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase whitespace-nowrap">业态分类</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase whitespace-nowrap">健康分</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase whitespace-nowrap">风险等级</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredMerchants.map((merchant) => (
                    <tr
                      key={merchant.id}
                      className={`hover:bg-slate-50 transition-colors ${selectedMerchant?.id === merchant.id ? 'bg-blue-50' : ''} ${!isCompareMode ? 'cursor-pointer' : ''}`}
                      onClick={() => !isCompareMode && handleViewDetails(merchant)}
                    >
                      {isCompareMode && (
                        <td
                          className="px-4 py-4"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleMerchant(merchant.id);
                          }}
                        >
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer ${
                              selectedIds.includes(merchant.id)
                                ? 'bg-brand-600 border-brand-600'
                                : 'border-slate-300'
                            }`}
                          >
                            {selectedIds.includes(merchant.id) && (
                              <i className="fa-solid fa-check text-white text-xs"></i>
                            )}
                          </div>
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-slate-900 text-base">{merchant.name}</div>
                        <div className="text-xs text-slate-500">{merchant.shopNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{merchant.category}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-slate-800">{merchant.totalScore}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRiskBadge(merchant.riskLevel)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 右侧：AI诊断 */}
        <div id="merchant-detail-view" className={`w-full xl:w-1/3 bg-white rounded-xl shadow-sm border border-slate-100 p-4 xl:p-6 order-2 xl:h-auto xl:overflow-y-auto ${!selectedMerchant ? 'hidden xl:block' : ''}`}>
          {selectedMerchant ? (
            <div className="space-y-6">
              {/* AI诊断标题 */}
              <div className="flex items-center gap-2 pb-3 border-b-2 border-purple-200">
                <i className="fa-solid fa-robot text-purple-600 text-xl"></i>
                <h2 className="text-xl font-bold text-purple-900">AI诊断</h2>
              </div>

              <div className="border-b border-slate-100 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg xl:text-xl font-bold text-slate-900">{selectedMerchant.name}</h3>
                      <Link
                        href={`/archives/${selectedMerchant.id}`}
                        className="text-sm text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 transition-colors"
                      >
                        <i className="fas fa-folder-open text-xs"></i>
                        档案
                      </Link>
                    </div>
                    <p className="text-slate-500 text-xs xl:text-sm">{selectedMerchant.category} • {selectedMerchant.floor}</p>
                  </div>
                  {getRiskBadge(selectedMerchant.riskLevel)}
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm bg-slate-50 p-3 rounded-lg">
                  <div>
                    <span className="text-slate-500 block text-xs">租售比</span>
                    <span className="font-medium">{(selectedMerchant.rentToSalesRatio * 100).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs">上月销售</span>
                    <span className="font-medium">{(selectedMerchant.lastMonthRevenue/10000).toFixed(1)}万</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-xs">健康分</span>
                    <span className="font-medium">{selectedMerchant.totalScore}分</span>
                  </div>
                </div>
              </div>

              {/* 五维健康指标 */}
              <div>
                <h4 className="font-semibold text-slate-800 mb-3 text-sm">五维健康指标</h4>
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
                          <span className="text-sm text-slate-600">{labels[key]}</span>
                          <span className="font-semibold text-slate-900">{value}分</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
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

              {/* 同比环比数据 */}
              {selectedMerchant.comparison && (
                <div>
                  <h4 className="font-semibold text-slate-800 mb-3 text-sm">同比环比变化</h4>
                  <div className="space-y-2">
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="text-sm text-slate-600 mb-2">月营收</div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">环比</span>
                          {renderTrend(selectedMerchant.comparison.revenue.mom)}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">同比</span>
                          {renderTrend(selectedMerchant.comparison.revenue.yoy)}
                        </div>
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3">
                      <div className="text-sm text-slate-600 mb-2">健康度评分</div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">环比</span>
                          {renderScoreTrend(selectedMerchant.comparison.totalScore.mom)}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">同比</span>
                          {renderScoreTrend(selectedMerchant.comparison.totalScore.yoy)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 健康度趋势预测 */}
              <div>
                <HealthTrendChart
                  merchantName={selectedMerchant.name}
                  currentScore={selectedMerchant.totalScore}
                  showPrediction={true}
                />
              </div>

              {/* 同业态对比分析 */}
              <div>
                <IndustryBenchmark
                  merchant={selectedMerchant}
                  allMerchants={merchants}
                />
              </div>

              {/* 管理动作 */}
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-800 text-sm">管理动作</h4>
                {selectedMerchant.riskLevel !== 'none' ? (
                  <button
                    onClick={() => setShowActionModal(true)}
                    className="w-full py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 shadow-lg shadow-slate-200 transition flex justify-center items-center gap-2 text-sm active:scale-95"
                  >
                    <i className="fa-solid fa-gavel"></i>
                    风险处理与派单
                  </button>
                ) : (
                  <div className="w-full py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg text-center text-sm">
                    <i className="fa-solid fa-check-circle mr-2"></i> 经营正常
                  </div>
                )}
                <button
                  onClick={handleGenerateAiDiagnosis}
                  disabled={isGeneratingAi}
                  className="w-full py-3 border border-purple-200 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition flex justify-center items-center gap-2 text-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingAi ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i>
                      生成中...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-wand-magic-sparkles"></i>
                      AI 诊断与帮扶策略推荐
                    </>
                  )}
                </button>
              </div>

              {/* AI诊断报告 */}
              {aiDiagnosis && (
                <div className="p-6 bg-purple-50 border border-purple-200 rounded-xl animate-fade-in">
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

              {/* 历史帮扶档案 */}
              <div>
                <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-indigo-200">
                  <i className="fa-solid fa-folder-open text-indigo-600 text-xl"></i>
                  <h3 className="text-lg font-bold text-indigo-900">历史帮扶档案</h3>
                </div>
                <MerchantHistoryArchive merchant={selectedMerchant} />
              </div>
            </div>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center text-slate-400 text-center">
              <i className="fa-solid fa-arrow-pointer text-3xl mb-3 text-slate-200"></i>
              <p className="text-sm">点击列表查看详情</p>
            </div>
          )}
        </div>
      </div>

      {/* 风险处理与派单弹窗 */}
      {showActionModal && (
        <div
          onClick={() => setShowActionModal(false)}
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-lg max-h-[90dvh] overflow-y-auto rounded-t-2xl sm:rounded-xl shadow-2xl p-6 pb-20 sm:pb-6 animate-fade-in-up"
          >
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 sm:hidden"></div>
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
              <i className="fa-solid fa-gavel mr-3 text-slate-600"></i>
              管理风险判定
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">是否为系统误判？</label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setIsMisjudgment(false)}
                    className={`flex-1 py-3 rounded border text-sm font-medium ${!isMisjudgment ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200'}`}
                  >
                    否，属实
                  </button>
                  <button
                    onClick={() => setIsMisjudgment(true)}
                    className={`flex-1 py-3 rounded border text-sm font-medium ${isMisjudgment ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200'}`}
                  >
                    是，误判
                  </button>
                </div>
              </div>

              {isMisjudgment ? (
                <div className="animate-fade-in">
                  <label className="block text-sm font-medium text-slate-700 mb-2">选择误判原因</label>
                  <select
                    className="w-full border border-slate-300 rounded p-2 text-sm h-12 bg-white"
                    value={misjudgmentReason}
                    onChange={(e) => setMisjudgmentReason(e.target.value)}
                  >
                    <option value="">请选择...</option>
                    <option value="装修免租期">装修免租期</option>
                    <option value="数据缺失">数据缺失</option>
                  </select>
                </div>
              ) : (
                <div className="animate-fade-in space-y-4">
                  <label className="block text-sm font-bold text-slate-700">后续处置动作</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      onClick={() => setActionType('assistance')}
                      className={`p-4 border rounded cursor-pointer ${actionType === 'assistance' ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500' : 'border-slate-200 hover:border-brand-300'}`}
                    >
                      <div className="font-bold text-brand-700 mb-1 text-sm">纳入帮扶</div>
                    </div>
                    <div
                      onClick={() => setActionType('leasing')}
                      className={`p-4 border rounded cursor-pointer ${actionType === 'leasing' ? 'border-red-500 bg-red-50 ring-1 ring-red-500' : 'border-slate-200 hover:border-red-300'}`}
                    >
                      <div className="font-bold text-red-700 mb-1 text-sm">转招商</div>
                    </div>
                  </div>

                  {actionType === 'assistance' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">分派责任人</label>
                      <select
                        className="w-full border border-slate-300 rounded p-2 text-sm h-12 bg-white"
                        value={assigneeRole}
                        onChange={(e) => setAssigneeRole(e.target.value)}
                      >
                        <option value="运营经理">运营经理</option>
                        <option value="运营助理">运营助理</option>
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button onClick={() => setShowActionModal(false)} className="flex-1 sm:flex-none px-6 py-3 sm:py-2 bg-slate-100 text-slate-600 rounded-lg sm:rounded text-sm font-medium">取消</button>
              <button onClick={handleSubmitAction} className="flex-1 sm:flex-none px-6 py-3 sm:py-2 bg-slate-900 text-white rounded-lg sm:rounded text-sm font-medium shadow-lg">确认</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HealthMonitoringPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen">加载中...</div>}>
      <HealthMonitoringContent />
    </Suspense>
  );
}
