'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Filter, BookOpen, Tag, TrendingUp, Eye, X, Star, Copy, CheckCircle } from 'lucide-react';
import knowledgeBase from '@/data/cases/knowledge_base.json';
import { mockMerchants } from '@/data/merchants/mock-data';
import { Case, Merchant } from '@/types';
import { smartSearch } from '@/skills/smart-search';

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

  // 标签分组（MECE原则：问题诊断 → 策略方法 → 执行手段）- 二级分类结构
  const tagGroups = {
    '问题诊断': {
      '位置问题': allTags.filter(t =>
        t.includes('冷区') || t.includes('死角') || t.includes('动线')
      ),
      '品牌问题': allTags.filter(t =>
        t.includes('品牌老化') || t.includes('产品老化') || t.includes('弱势品牌') || t.includes('同质化')
      ),
      '经营问题': allTags.filter(t =>
        t.includes('流量下滑') || t.includes('客单价') || t.includes('坪效') || t.includes('亏损') || t.includes('高租售比')
      ),
      '市场问题': allTags.filter(t =>
        t.includes('消费降级') || t.includes('竞品') || t.includes('金价')
      ),
      '管理问题': allTags.filter(t =>
        t.includes('人员管理') || t.includes('坐商心态') || t.includes('库存')
      ),
      '硬件问题': allTags.filter(t =>
        t.includes('设施老化') || t.includes('硬件老化') || t.includes('新店') || t.includes('老店')
      )
    },
    '策略方法': {
      '流量策略': allTags.filter(t =>
        t.includes('公域引流') || t.includes('异业联盟') || t.includes('异业互导') || t.includes('票根经济')
      ),
      '营销策略': allTags.filter(t =>
        t.includes('体验营销') || t.includes('情感营销') || t.includes('全员营销') || t.includes('暴力折扣')
      ),
      '产品策略': allTags.filter(t =>
        t.includes('以旧换新') || t.includes('动态定价') || t.includes('菜品对标') || t.includes('产品年轻化')
      ),
      '客群策略': allTags.filter(t =>
        t.includes('B端') || t.includes('下沉市场') || t.includes('商务客群') || t.includes('家庭客')
      ),
      '会员策略': allTags.filter(t =>
        t.includes('私域') || t.includes('会员激活') || t.includes('社群')
      )
    },
    '执行手段': {
      '线上手段': allTags.filter(t =>
        t.includes('探店') || t.includes('直播') || t.includes('抖音') || t.includes('小红书') || t.includes('新媒体')
      ),
      '线下手段': allTags.filter(t =>
        t.includes('内购') || t.includes('赞助') || t.includes('联名') || t.includes('盲盒') || t.includes('小样')
      ),
      '空间手段': allTags.filter(t =>
        t.includes('陈列') || t.includes('重装') || t.includes('工程') || t.includes('视觉')
      ),
      '价格手段': allTags.filter(t =>
        t.includes('降租') || t.includes('工费减免') || t.includes('小克重') || t.includes('性价比')
      ),
      '资源手段': allTags.filter(t =>
        t.includes('资源置换') || t.includes('供应商') || t.includes('官方背书') || t.includes('国补')
      )
    },
    '特殊场景': {
      '其他': allTags.filter(t => {
        const problemTags = ['冷区', '死角', '动线', '品牌老化', '产品老化', '弱势品牌', '同质化',
                            '流量下滑', '客单价', '坪效', '亏损', '高租售比', '消费降级', '竞品',
                            '金价', '人员管理', '坐商心态', '库存', '设施老化', '硬件老化', '新店', '老店'];
        const strategyTags = ['公域引流', '异业联盟', '异业互导', '票根经济', '体验营销', '情感营销',
                             '全员营销', '暴力折扣', '以旧换新', '动态定价', '菜品对标', '产品年轻化',
                             'B端', '下沉市场', '商务客群', '家庭客', '私域', '会员激活', '社群'];
        const executionTags = ['探店', '直播', '抖音', '小红书', '新媒体', '内购', '赞助', '联名',
                              '盲盒', '小样', '陈列', '重装', '工程', '视觉', '降租', '工费减免',
                              '小克重', '性价比', '资源置换', '供应商', '官方背书', '国补'];

        return !problemTags.some(p => t.includes(p)) &&
               !strategyTags.some(s => t.includes(s)) &&
               !executionTags.some(e => t.includes(e));
      })
    }
  };

  // 筛选案例（使用智能搜索引擎）
  const filteredCases = useMemo(() => {
    let cases = knowledgeBase;

    // 应用行业筛选
    if (filterIndustry !== 'all') {
      cases = cases.filter(c => c.industry.startsWith(filterIndustry));
    }

    // 应用标签筛选
    if (filterTag !== 'all') {
      cases = cases.filter(c => c.tags.includes(filterTag));
    }

    // 应用收藏筛选
    if (showFavoritesOnly) {
      cases = cases.filter(c => favorites.has(c.id));
    }

    // 如果有搜索词，使用智能搜索引擎
    if (searchTerm.trim()) {
      const searchResult = smartSearch({
        query: searchTerm,
        items: cases,
        searchFields: ['merchantName', 'industry', 'symptoms', 'diagnosis', 'strategy', 'action', 'tags'],
        weights: {
          'merchantName': 2.5, // 商户名称权重最高
          'symptoms': 2,       // 症状描述权重次之
          'diagnosis': 1.8,    // 问题诊断权重
          'tags': 1.5,         // 标签权重
          'strategy': 1.2,     // 策略权重
          'action': 1,         // 措施权重
          'industry': 0.8      // 行业权重最低
        },
        fuzzy: true
      });

      // 返回搜索结果（已按相关度排序）
      return searchResult.results.map(r => r.item);
    }

    return cases;
  }, [searchTerm, filterIndustry, filterTag, showFavoritesOnly, favorites]);

  // 案例推荐算法
  const recommendations = useMemo(() => {
    // 1. 热门案例（被收藏最多的）
    const favoriteCounts = new Map<string, number>();
    // 模拟收藏数据（实际应该从localStorage或数据库获取）
    knowledgeBase.forEach(c => {
      favoriteCounts.set(c.id, Math.floor(Math.random() * 50)); // 模拟0-50次收藏
    });

    const hotCases = [...knowledgeBase]
      .sort((a, b) => (favoriteCounts.get(b.id) || 0) - (favoriteCounts.get(a.id) || 0))
      .slice(0, 3);

    // 2. 相似案例（基于当前选中的案例）
    let similarCases: any[] = [];
    if (selectedCase) {
      similarCases = knowledgeBase
        .filter(c => c.id !== selectedCase.id)
        .map(c => {
          let similarity = 0;
          // 同行业 +30分
          if (c.industry === selectedCase.industry) similarity += 30;
          else if (c.industry.split('-')[0] === selectedCase.industry.split('-')[0]) similarity += 15;
          // 标签重叠度
          const commonTags = c.tags.filter((t: string) => selectedCase.tags.includes(t));
          similarity += commonTags.length * 10;
          return { case: c, similarity };
        })
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 3)
        .map(item => item.case);
    }

    // 3. 适合你的案例（基于用户最近查看的商户类型）
    // 从localStorage获取最近查看的商户
    const recentMerchants = typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('recentMerchants') || '[]')
      : [];

    let forYouCases: any[] = [];
    if (recentMerchants.length > 0) {
      // 获取最常查看的行业类型
      const industryCounts = new Map<string, number>();
      recentMerchants.forEach((m: any) => {
        const mainCategory = m.category?.split('-')[0] || '';
        industryCounts.set(mainCategory, (industryCounts.get(mainCategory) || 0) + 1);
      });

      const topIndustry = Array.from(industryCounts.entries())
        .sort((a, b) => b[1] - a[1])[0]?.[0];

      if (topIndustry) {
        forYouCases = knowledgeBase
          .filter(c => c.industry.startsWith(topIndustry))
          .slice(0, 3);
      }
    }

    // 如果没有"适合你"的案例，使用最新案例
    if (forYouCases.length === 0) {
      forYouCases = [...knowledgeBase].reverse().slice(0, 3);
    }

    return {
      hot: hotCases,
      similar: similarCases,
      forYou: forYouCases
    };
  }, [selectedCase]);

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
        <h1 className="text-3xl font-bold text-gray-900">帮扶案例知识库</h1>
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

      {/* 案例推荐区域 */}
      {!searchTerm && !showFavoritesOnly && filterIndustry === 'all' && filterTag === 'all' && (
        <div className="space-y-4">
          {/* 热门案例 */}
          {recommendations.hot.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="text-red-500" size={20} />
                  热门案例
                </h3>
                <span className="text-xs text-gray-500">最受欢迎</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recommendations.hot.map((caseItem: any) => (
                  <div
                    key={caseItem.id}
                    onClick={() => setSelectedCase(caseItem)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all"
                  >
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">{caseItem.merchantName || caseItem.industry}</h4>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">{caseItem.symptoms}</p>
                    <div className="flex flex-wrap gap-1">
                      {caseItem.tags.slice(0, 2).map((tag: string, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 适合你的案例 */}
          {recommendations.forYou.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Star className="text-yellow-500" size={20} />
                  适合你的案例
                </h3>
                <span className="text-xs text-gray-500">基于浏览历史</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recommendations.forYou.map((caseItem: any) => (
                  <div
                    key={caseItem.id}
                    onClick={() => setSelectedCase(caseItem)}
                    className="p-4 border border-gray-200 rounded-lg hover:border-yellow-300 hover:bg-yellow-50 cursor-pointer transition-all"
                  >
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm">{caseItem.merchantName || caseItem.industry}</h4>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">{caseItem.symptoms}</p>
                    <div className="flex flex-wrap gap-1">
                      {caseItem.tags.slice(0, 2).map((tag: string, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 筛选栏 */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          {/* 搜索框 */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="搜索商户名称、行业、症状、标签..."
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
              {Object.entries(tagGroups).map(([groupName, subGroups]) => {
                // 计算一级分类下的总标签数
                const totalTags = Object.values(subGroups).reduce((sum, tags) => sum + tags.length, 0);
                if (totalTags === 0) return null;

                return (
                  <optgroup key={groupName} label={`${groupName} (${totalTags}个)`}>
                    {Object.entries(subGroups).map(([subGroupName, tags]) => {
                      if (tags.length === 0) return null;
                      return tags.map(tag => (
                        <option key={tag} value={tag}>
                          　├ {subGroupName} - {tag}
                        </option>
                      ));
                    })}
                  </optgroup>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {/* 搜索结果提示 */}
      {searchTerm.trim() && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-blue-800">
            <Search size={16} />
            <span>
              搜索 "<strong>{searchTerm}</strong>" 找到 <strong>{filteredCases.length}</strong> 个相关案例
              {filteredCases.length > 0 && '（已按相关度排序）'}
            </span>
          </div>
          <button
            onClick={() => setSearchTerm('')}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            清除搜索
          </button>
        </div>
      )}

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
              {Object.entries(tagGroups).map(([groupName, subGroups]) => {
                // 计算一级分类下的总标签数
                const totalTags = Object.values(subGroups).reduce((sum, tags) => sum + tags.length, 0);
                if (totalTags === 0) return null;

                return (
                  <div key={groupName} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200 shadow-sm">
                    {/* 一级分类标题 */}
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
                      <span className="w-1.5 h-6 bg-blue-600 rounded"></span>
                      {groupName}
                      <span className="text-xs text-gray-500 font-normal">({totalTags}个标签)</span>
                    </h3>

                    {/* 二级分类 */}
                    <div className="space-y-4">
                      {Object.entries(subGroups).map(([subGroupName, tags]) => {
                        if (tags.length === 0) return null;
                        return (
                          <div key={subGroupName} className="bg-white rounded-lg p-4 border border-gray-200">
                            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2 text-sm">
                              <span className="w-1 h-4 bg-gray-400 rounded"></span>
                              {subGroupName}
                              <span className="text-xs text-gray-500 font-normal">({tags.length}个)</span>
                            </h4>
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
