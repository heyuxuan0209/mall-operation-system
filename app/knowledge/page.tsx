'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, BookOpen, Tag, TrendingUp, Eye, X, Star, Copy, CheckCircle } from 'lucide-react';
import knowledgeBase from '@/data/cases/knowledge_base.json';
import { mockMerchants } from '@/data/merchants/mock-data';
import { Case, Merchant } from '@/types';

function KnowledgeBaseContent() {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterIndustry, setFilterIndustry] = useState<string>('all');
  const [filterTag, setFilterTag] = useState<string>('all');
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showTagCloud, setShowTagCloud] = useState(false);
  const [showIndustryBreakdown, setShowIndustryBreakdown] = useState(false);

  // 检查URL参数，自动打开指定案例
  useEffect(() => {
    const caseId = searchParams.get('caseId');
    if (caseId) {
      const caseToOpen = knowledgeBase.find((c: any) => c.id === caseId);
      if (caseToOpen) {
        setSelectedCase(caseToOpen);
      }
    }
  }, [searchParams]);

  // 获取所有行业类型（按大类：餐饮、零售、主力店等）
  const industries = Array.from(new Set(knowledgeBase.map(c => c.industry.split('-')[0])));

  // 获取所有标签并按类别分组
  const allTags = Array.from(new Set(knowledgeBase.flatMap(c => c.tags)));

  // 标签分组
  const tagGroups = {
    '问题类型': allTags.filter(t =>
      t.includes('欠租') || t.includes('营收') || t.includes('业绩') ||
      t.includes('客流') || t.includes('投诉') || t.includes('口碑') ||
      t.includes('租售比') || t.includes('成本')
    ),
    '解决方案': allTags.filter(t =>
      t.includes('营销') || t.includes('培训') || t.includes('优化') ||
      t.includes('调整') || t.includes('改善') || t.includes('提升') ||
      t.includes('协商') || t.includes('支持')
    ),
    '效果评价': allTags.filter(t =>
      t.includes('成功') || t.includes('有效') || t.includes('显著') ||
      t.includes('改善') || t.includes('提高')
    ),
    '其他': allTags.filter(t => {
      const problemTags = ['欠租', '营收', '业绩', '客流', '投诉', '口碑', '租售比', '成本'];
      const solutionTags = ['营销', '培训', '优化', '调整', '改善', '提升', '协商', '支持'];
      const effectTags = ['成功', '有效', '显著', '改善', '提高'];
      return !problemTags.some(p => t.includes(p)) &&
             !solutionTags.some(s => t.includes(s)) &&
             !effectTags.some(e => t.includes(e));
    })
  };

  // 筛选案例（支持大类行业筛选）
  const filteredCases = knowledgeBase.filter(caseItem => {
    const matchesSearch = caseItem.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         caseItem.symptoms.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         caseItem.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         caseItem.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesIndustry = filterIndustry === 'all' || caseItem.industry.startsWith(filterIndustry);
    const matchesTag = filterTag === 'all' || caseItem.tags.includes(filterTag);
    const matchesFavorites = !showFavoritesOnly || favorites.has(caseItem.id);
    return matchesSearch && matchesIndustry && matchesTag && matchesFavorites;
  });

  // 按行业分组统计（大类）
  const casesByIndustry = industries.reduce((acc, industry) => {
    acc[industry] = knowledgeBase.filter(c => c.industry.startsWith(industry)).length;
    return acc;
  }, {} as Record<string, number>);

  // 获取标签颜色
  const getTagColor = (tag: string) => {
    const colors = [
      'bg-blue-100 text-blue-700 border-blue-200',
      'bg-green-100 text-green-700 border-green-200',
      'bg-purple-100 text-purple-700 border-purple-200',
      'bg-orange-100 text-orange-700 border-orange-200',
      'bg-pink-100 text-pink-700 border-pink-200',
      'bg-indigo-100 text-indigo-700 border-indigo-200'
    ];
    const index = tag.length % colors.length;
    return colors[index];
  };

  // 切换收藏
  const toggleFavorite = (caseId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(caseId)) {
      newFavorites.delete(caseId);
    } else {
      newFavorites.add(caseId);
    }
    setFavorites(newFavorites);
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">经验知识库</h1>
        <p className="text-gray-500 mt-1">浏览成功案例，智能推荐帮扶方案</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          onClick={() => {
            setShowFavoritesOnly(false);
            setFilterIndustry('all');
            setFilterTag('all');
            setSearchTerm('');
          }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 cursor-pointer hover:shadow-md transition-all hover:scale-105"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center">
              <BookOpen className="text-white" size={24} />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm mb-1">案例总数</h3>
          <div className="flex items-baseline gap-1">
            <p className="text-2xl font-bold text-gray-900">{knowledgeBase.length}</p>
            <span className="text-sm text-gray-500">个</span>
          </div>
          <div className="mt-2 text-xs text-blue-600">点击查看全部</div>
        </div>

        <div
          onClick={() => setShowTagCloud(true)}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 cursor-pointer hover:shadow-md transition-all hover:scale-105"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-500 w-12 h-12 rounded-lg flex items-center justify-center">
              <Tag className="text-white" size={24} />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm mb-1">标签数量</h3>
          <div className="flex items-baseline gap-1">
            <p className="text-2xl font-bold text-gray-900">{allTags.length}</p>
            <span className="text-sm text-gray-500">个</span>
          </div>
          <div className="mt-2 text-xs text-green-600">点击查看标签云</div>
        </div>

        <div
          onClick={() => setShowIndustryBreakdown(true)}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 cursor-pointer hover:shadow-md transition-all hover:scale-105"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-500 w-12 h-12 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-white" size={24} />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm mb-1">行业覆盖</h3>
          <div className="flex items-baseline gap-1">
            <p className="text-2xl font-bold text-gray-900">{industries.length}</p>
            <span className="text-sm text-gray-500">个</span>
          </div>
          <div className="mt-2 text-xs text-purple-600">点击查看分布</div>
        </div>

        <div
          onClick={() => {
            setShowFavoritesOnly(!showFavoritesOnly);
            if (!showFavoritesOnly) {
              setFilterIndustry('all');
              setFilterTag('all');
            }
          }}
          className={`bg-white rounded-xl shadow-sm p-6 border cursor-pointer hover:shadow-md transition-all hover:scale-105 ${
            showFavoritesOnly ? 'border-orange-300 ring-2 ring-orange-200' : 'border-gray-100'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              showFavoritesOnly ? 'bg-orange-500' : 'bg-orange-400'
            }`}>
              <Star className="text-white" size={24} fill={showFavoritesOnly ? 'white' : 'none'} />
            </div>
          </div>
          <h3 className="text-gray-500 text-sm mb-1">我的收藏</h3>
          <div className="flex items-baseline gap-1">
            <p className="text-2xl font-bold text-gray-900">{favorites.size}</p>
            <span className="text-sm text-gray-500">个</span>
          </div>
          <div className="mt-2 text-xs text-orange-600">
            {showFavoritesOnly ? '显示全部案例' : '只看收藏'}
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
              placeholder="搜索行业、症状、标签..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 筛选器 */}
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={filterIndustry}
              onChange={(e) => setFilterIndustry(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部行业</option>
              {industries.map(industry => (
                <option key={industry} value={industry}>
                  {industry} ({casesByIndustry[industry]})
                </option>
              ))}
            </select>
            <select
              value={filterTag}
              onChange={(e) => setFilterTag(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部标签</option>
              {allTags.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 案例网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCases.map((caseItem: any) => (
          <div
            key={caseItem.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            {/* 卡片头部 */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{caseItem.merchantName || caseItem.industry}</h3>
                  <p className="text-xs text-gray-500">{caseItem.industry} · {caseItem.id}</p>
                </div>
                <button
                  onClick={() => toggleFavorite(caseItem.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    favorites.has(caseItem.id)
                      ? 'bg-yellow-100 text-yellow-600'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  <Star size={18} fill={favorites.has(caseItem.id) ? 'currentColor' : 'none'} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {caseItem.tags.map((tag: string, idx: number) => (
                  <span key={idx} className={`px-2 py-1 rounded text-xs font-medium border ${getTagColor(tag)}`}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* 症状描述 */}
            <div className="p-6 border-b border-gray-100">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">症状描述</h4>
              <p className="text-sm text-gray-600 line-clamp-3">{caseItem.symptoms}</p>
            </div>

            {/* 操作按钮 */}
            <div className="p-4 bg-gray-50 rounded-b-xl flex gap-2">
              <button
                onClick={() => setSelectedCase(caseItem)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Eye size={16} />
                查看详情
              </button>
              <button
                onClick={() => {
                  setSelectedCase(caseItem);
                  setShowApplyModal(true);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <Copy size={16} />
                应用案例
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 案例详情弹窗 */}
      {selectedCase && !showApplyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* 弹窗头部 */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedCase.merchantName || selectedCase.industry}</h2>
                  <button
                    onClick={() => toggleFavorite(selectedCase.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      favorites.has(selectedCase.id)
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    <Star size={20} fill={favorites.has(selectedCase.id) ? 'currentColor' : 'none'} />
                  </button>
                </div>
                <p className="text-gray-500 mt-1 text-sm">{selectedCase.industry} · {selectedCase.id}</p>
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
                <h3 className="text-sm font-semibold text-gray-700 mb-3">标签</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCase.tags.map((tag: string, idx: number) => (
                    <span key={idx} className={`px-3 py-1.5 rounded-full text-sm font-medium border ${getTagColor(tag)}`}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* 症状描述 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">症状描述</h3>
                <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-gray-400">
                  <p className="text-gray-900">{selectedCase.symptoms}</p>
                </div>
              </div>

              {/* 问题诊断 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">问题诊断</h3>
                <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                  <p className="text-gray-900">{selectedCase.diagnosis}</p>
                </div>
              </div>

              {/* 帮扶策略 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">帮扶策略</h3>
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                  <p className="text-gray-900">{selectedCase.strategy}</p>
                </div>
              </div>

              {/* 具体措施 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">具体措施</h3>
                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                  <p className="text-gray-900 whitespace-pre-line">{selectedCase.action}</p>
                </div>
              </div>

              {/* 实施效果 */}
              {selectedCase.result && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">实施效果</h3>
                  <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
                    <p className="text-gray-900">{selectedCase.result}</p>
                  </div>
                </div>
              )}

              {/* 操作按钮 */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => setShowApplyModal(true)}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  应用此案例
                </button>
                <button
                  onClick={() => toggleFavorite(selectedCase.id)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  {favorites.has(selectedCase.id) ? '取消收藏' : '收藏案例'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 应用案例弹窗 */}
      {showApplyModal && selectedCase && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* 弹窗头部 */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">应用案例到商户</h2>
              <button
                onClick={() => {
                  setShowApplyModal(false);
                  setSelectedMerchant(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            {/* 弹窗内容 */}
            <div className="p-6 space-y-6">
              {/* 案例信息 */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">选中案例: {selectedCase.merchantName || selectedCase.industry}</h3>
                <p className="text-sm text-blue-700">{selectedCase.symptoms}</p>
              </div>

              {/* 选择商户 */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">选择目标商户</h3>
                <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
                  {mockMerchants
                    .filter(m => m.riskLevel === 'high' || m.riskLevel === 'medium')
                    .map(merchant => (
                      <div
                        key={merchant.id}
                        onClick={() => setSelectedMerchant(merchant)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedMerchant?.id === merchant.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">{merchant.name}</h4>
                            <p className="text-sm text-gray-500">{merchant.category}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">健康度: {merchant.totalScore}分</span>
                            {selectedMerchant?.id === merchant.id && (
                              <CheckCircle className="text-blue-600" size={20} />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* 生成任务预览 */}
              {selectedMerchant && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">任务预览</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div>
                      <p className="text-xs text-gray-500">任务标题</p>
                      <p className="font-medium text-gray-900">
                        {selectedMerchant.name} - {selectedCase.industry}帮扶方案
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">帮扶策略</p>
                      <p className="text-sm text-gray-700">{selectedCase.strategy}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">具体措施</p>
                      <p className="text-sm text-gray-700 whitespace-pre-line">{selectedCase.action}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 操作按钮 */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  disabled={!selectedMerchant}
                  onClick={() => {
                    if (!selectedMerchant || !selectedCase) return;

                    // 创建新任务
                    const newTaskId = 'T' + Date.now().toString().slice(-6);
                    const newTask = {
                      id: newTaskId,
                      merchantId: selectedMerchant.id,
                      merchantName: selectedMerchant.name,
                      title: `${selectedMerchant.name} - ${selectedCase.merchantName || selectedCase.industry}帮扶方案`,
                      description: `参考案例：${selectedCase.merchantName || selectedCase.industry}。${selectedCase.symptoms}`,
                      measures: [], // 措施留空，作为AI推荐
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
                      collectionStatus: selectedMerchant.rentToSalesRatio > 0.25 ? 'owed' : 'normal',
                      // 存储参考案例信息，供AI推荐使用
                      referenceCase: {
                        id: selectedCase.id,
                        merchantName: selectedCase.merchantName,
                        action: selectedCase.action,
                        strategy: selectedCase.strategy
                      }
                    };

                    // 存储到localStorage
                    const existingTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
                    existingTasks.push(newTask);
                    localStorage.setItem('tasks', JSON.stringify(existingTasks));

                    // 跳转到任务中心
                    window.location.href = `/tasks?taskId=${newTaskId}`;
                  }}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                    selectedMerchant
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  创建帮扶任务
                </button>
                <button
                  onClick={() => {
                    setShowApplyModal(false);
                    setSelectedMerchant(null);
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 标签云弹窗 */}
      {showTagCloud && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">标签分类</h2>
                <p className="text-sm text-gray-500 mt-1">点击标签筛选相关案例</p>
              </div>
              <button
                onClick={() => setShowTagCloud(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {Object.entries(tagGroups).map(([groupName, tags]) => {
                if (tags.length === 0) return null;
                return (
                  <div key={groupName} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="w-1 h-5 bg-blue-600 rounded"></span>
                      {groupName}
                      <span className="text-xs text-gray-500 font-normal">({tags.length}个标签)</span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag, idx) => {
                        const tagCount = knowledgeBase.filter(c => c.tags.includes(tag)).length;
                        return (
                          <button
                            key={idx}
                            onClick={() => {
                              setFilterTag(tag);
                              setShowTagCloud(false);
                            }}
                            className={`px-3 py-1.5 rounded-full border transition-all hover:scale-105 ${getTagColor(tag)}`}
                          >
                            {tag} <span className="text-xs opacity-75">({tagCount})</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 行业分布弹窗 */}
      {showIndustryBreakdown && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">行业分布</h2>
                <p className="text-sm text-gray-500 mt-1">点击行业筛选相关案例</p>
              </div>
              <button
                onClick={() => setShowIndustryBreakdown(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {industries.map(industry => {
                  const count = casesByIndustry[industry];
                  const percentage = ((count / knowledgeBase.length) * 100).toFixed(1);
                  return (
                    <div
                      key={industry}
                      onClick={() => {
                        setFilterIndustry(industry);
                        setShowIndustryBreakdown(false);
                      }}
                      className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-900">{industry}</span>
                        <span className="text-sm text-gray-600">{count} 个案例</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="mt-1 text-xs text-gray-500 text-right">{percentage}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function KnowledgeBasePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen"><div className="text-slate-500">加载中...</div></div>}>
      <KnowledgeBaseContent />
    </Suspense>
  );
}
