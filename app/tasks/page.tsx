'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { mockTasks } from '@/data/tasks/mock-data';
import knowledgeBase from '@/data/cases/knowledge_base.json';
import { Task } from '@/types';
import WorkflowStepper from '@/components/WorkflowStepper';
import HealthRadar from '@/components/HealthRadar';
import MilestoneManager from '@/components/MilestoneManager';
import TaskCalendar from '@/components/TaskCalendar';

export default function TaskCenterPage() {
  const searchParams = useSearchParams();
  const [tasks, setTasks] = useState<Task[]>(mockTasks as any);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // 从localStorage加载任务并处理URL参数
  useEffect(() => {
    // 合并mock数据和localStorage数据
    const storedTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const allTasks = [...mockTasks, ...storedTasks];
    setTasks(allTasks as any);

    // 检查URL参数，设置视图模式
    const view = searchParams.get('view');
    if (view === 'calendar') {
      setViewMode('calendar');
    }

    // 检查URL参数，自动打开指定任务
    const taskId = searchParams.get('taskId');
    if (taskId) {
      const taskToOpen = allTasks.find((t: any) => t.id === taskId);
      if (taskToOpen) {
        setSelectedTask(taskToOpen as any);

        // 如果任务有参考案例，自动显示为AI推荐
        if ((taskToOpen as any).referenceCase) {
          const refCase = (taskToOpen as any).referenceCase;
          setMatchedCases([{
            id: refCase.id,
            merchantName: refCase.merchantName,
            action: refCase.action,
            strategy: refCase.strategy,
            matchScore: 95 // 参考案例给高匹配度
          }]);
          setAiSuggestions([refCase.action]);
        }

        // 滚动到任务详情（移动端）
        setTimeout(() => {
          if (window.innerWidth < 1024) {
            document.getElementById('task-detail-view')?.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    }
  }, [searchParams]);

  // AI推荐相关
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [customMeasure, setCustomMeasure] = useState('');
  const [matchedCases, setMatchedCases] = useState<any[]>([]);

  // 执行记录相关
  const [showLogModal, setShowLogModal] = useState(false);
  const [logContent, setLogContent] = useState('');
  const [logType, setLogType] = useState<'manual' | 'strategy'>('manual');
  const [editingLog, setEditingLog] = useState<any>(null);

  // 评估相关
  const [showNotMetOptions, setShowNotMetOptions] = useState(false);
  const [exitReason, setExitReason] = useState('');

  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280);
  const isMobileView = windowWidth < 1024;

  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.merchantName.includes(searchTerm);
    const matchesRisk = riskFilter === 'ALL' || (t as any).riskLevel === riskFilter;
    const matchesStage = stageFilter === 'ALL' || (t as any).stage === stageFilter;
    return matchesSearch && matchesRisk && matchesStage;
  });

  const updateTask = (updates: Partial<Task>) => {
    if (!selectedTask) return;
    const updated = { ...selectedTask, ...updates };
    const newTasks = tasks.map(t => t.id === updated.id ? updated : t);
    setTasks(newTasks);
    setSelectedTask(updated);

    // 同步更新localStorage
    const storedTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const updatedStoredTasks = storedTasks.map((t: any) =>
      t.id === updated.id ? updated : t
    );
    localStorage.setItem('tasks', JSON.stringify(updatedStoredTasks));
  };

  // AI推荐帮扶措施
  const handleGetAiSuggestions = async () => {
    if (!selectedTask) return;
    setIsLoadingAi(true);

    // 模拟AI分析延迟
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 分析商户问题特征
    const problems = [];
    const problemTags = [];

    // 从initialMetrics分析问题
    if ((selectedTask as any).initialMetrics) {
      const metrics = (selectedTask as any).initialMetrics;
      if (metrics.collection < 80) {
        problems.push('租金缴纳存在风险');
        problemTags.push('收缴问题', '欠租');
      }
      if (metrics.operational < 60) {
        problems.push('经营表现不佳');
        problemTags.push('业绩下滑', '营收低', '客流少');
      }
      if (metrics.customerReview < 70) {
        problems.push('顾客满意度偏低');
        problemTags.push('口碑差', '服务问题', '投诉');
      }
      if (metrics.siteQuality < 70) {
        problems.push('现场品质需改善');
        problemTags.push('陈列差', '环境问题');
      }
    }

    // 从description分析问题
    if (selectedTask.description) {
      if (selectedTask.description.includes('租售比')) {
        problemTags.push('高租售比', '租金压力', '降租');
      }
      if (selectedTask.description.includes('营收') || selectedTask.description.includes('销售')) {
        problemTags.push('营收低', '业绩差');
      }
    }

    // 获取商户业态
    const merchantCategory = selectedTask.merchantName.includes('火锅') ? '餐饮-火锅' :
                            selectedTask.merchantName.includes('茶') || selectedTask.merchantName.includes('咖啡') ? '餐饮-饮品' :
                            selectedTask.merchantName.includes('餐') ? '餐饮-正餐' :
                            selectedTask.merchantName.includes('影城') ? '主力店-影城' :
                            selectedTask.merchantName.includes('超市') ? '主力店-超市' :
                            selectedTask.merchantName.includes('服饰') || selectedTask.merchantName.includes('装') ? '零售-服饰' :
                            selectedTask.merchantName.includes('珠宝') || selectedTask.merchantName.includes('金') ? '零售-珠宝' : '餐饮';

    // 智能匹配知识库案例
    const scoredCases = knowledgeBase.map((c: any) => {
      let score = 0;

      // 1. 业态匹配（权重40%）
      const caseCategory = c.industry.split('-')[0];
      const taskCategory = merchantCategory.split('-')[0];
      if (c.industry === merchantCategory) {
        score += 40; // 完全匹配
      } else if (caseCategory === taskCategory) {
        score += 25; // 大类匹配
      }

      // 2. 问题标签匹配（权重60%）
      const matchedTags = c.tags.filter((tag: string) =>
        problemTags.some(pt => pt.includes(tag) || tag.includes(pt))
      );
      score += matchedTags.length * 15;

      // 3. 症状关键词匹配（额外加分）
      problemTags.forEach(pt => {
        if (c.symptoms.includes(pt) || c.diagnosis.includes(pt)) {
          score += 5;
        }
      });

      return { ...c, matchScore: score };
    });

    // 按匹配度排序，取前3个
    const topCases = scoredCases
      .filter(c => c.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3);

    setMatchedCases(topCases);
    const suggestions = topCases.map((c: any) => c.action);
    setAiSuggestions(suggestions);
    setIsLoadingAi(false);
  };

  // 采纳措施
  const handleAcceptMeasure = (measure: string) => {
    if (!selectedTask) return;
    updateTask({ measures: [...(selectedTask.measures || []), measure] });
  };

  // 添加执行记录
  const handleAddLog = (action: string, type: 'manual' | 'strategy_adopted') => {
    if (!selectedTask) return [];
    const newLog = {
      id: `l-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      action: action,
      type: type as any,
      user: (selectedTask as any).assignedTo?.split(' ')[0] || '运营经理'
    };
    return [...((selectedTask as any).logs || []), newLog];
  };

  const handleSubmitLog = () => {
    if (!selectedTask || !logContent) return;

    let newLogs;
    if (editingLog) {
      // 编辑现有记录
      newLogs = ((selectedTask as any).logs || []).map((log: any) =>
        log.id === editingLog.id
          ? { ...log, action: logContent, date: new Date().toISOString().split('T')[0] }
          : log
      );
    } else {
      // 添加新记录
      newLogs = handleAddLog(logContent, logType as any);
    }

    updateTask({ logs: newLogs } as any);
    setShowLogModal(false);
    setLogContent('');
    setEditingLog(null);
  };

  // 成功结案
  const handleSuccessArchive = () => {
    if (!selectedTask) return;

    // 弹窗询问是否沉淀至知识库
    const shouldAddToKnowledge = confirm('帮扶成功！是否将此案例沉淀至知识库？');

    if (shouldAddToKnowledge) {
      // 生成案例数据
      const caseData = {
        id: `CASE_${Date.now()}`,
        merchantName: selectedTask.merchantName,
        industry: '待分类', // 可以根据商户信息自动分类
        tags: ['帮扶成功', '实战案例'],
        symptoms: selectedTask.description || '商户经营存在问题',
        diagnosis: `健康度评分较低，风险等级${(selectedTask as any).riskLevel}`,
        strategy: selectedTask.measures?.join('；') || '',
        action: selectedTask.measures?.join('\n') || '',
        result: `帮扶后健康度提升，各项指标改善明显`,
        createdAt: new Date().toISOString().split('T')[0]
      };

      // 存储到localStorage的知识库
      const existingCases = JSON.parse(localStorage.getItem('userKnowledgeBase') || '[]');
      existingCases.push(caseData);
      localStorage.setItem('userKnowledgeBase', JSON.stringify(existingCases));

      alert('案例已成功沉淀至知识库！');
    }

    updateTask({ stage: 'completed' } as any);
  };

  // 升级处理
  const handleEscalate = () => {
    if (!selectedTask) return;
    const escalationLog = handleAddLog('效果未达标，任务升级至上一级', 'manual');
    updateTask({
      stage: 'escalated',
      evaluationResult: 'not_met',
      logs: escalationLog
    } as any);
    setShowNotMetOptions(false);
  };

  // 转招商
  const handleExitToLeasing = () => {
    if (!selectedTask) return;
    const exitLog = handleAddLog(`效果未达标，转招商预警池。原因：${exitReason || '经营持续恶化'}`, 'manual');
    updateTask({
      stage: 'exit',
      evaluationResult: 'not_met',
      logs: exitLog
    } as any);
    setShowNotMetOptions(false);
    setExitReason('');
  };

  const getStageLabel = (stage: string) => {
    const map: any = {
      'planning': '措施制定',
      'executing': '执行中',
      'evaluating': '效果评估',
      'completed': '已完成(达标)',
      'escalated': '已升级(继续帮扶)',
      'exit': '转招商(备商/清退)'
    };
    return map[stage] || stage;
  };

  const getCurrentMetrics = () => {
    if (!(selectedTask as any)?.initialMetrics) return {
      collection: 0, operational: 0, siteQuality: 0, customerReview: 0, riskResistance: 0
    };
    const initial = (selectedTask as any).initialMetrics;
    return {
      collection: Math.min(100, initial.collection + 20),
      operational: Math.min(100, initial.operational + 15),
      siteQuality: Math.min(100, initial.siteQuality + 10),
      customerReview: Math.min(100, initial.customerReview + 5),
      riskResistance: Math.min(100, initial.riskResistance + 10),
    };
  };

  return (
    <div className="h-full flex flex-col pb-10">
      <div className="mb-4 flex flex-col lg:flex-row lg:justify-between lg:items-end gap-2">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-slate-900">帮扶任务中心</h2>
          <p className="text-sm text-slate-500">
            风险识别 → 帮扶派单 → 评估闭环
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              viewMode === 'list'
                ? 'bg-brand-600 text-white'
                : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            <i className="fa-solid fa-list mr-2"></i>
            列表视图
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              viewMode === 'calendar'
                ? 'bg-brand-600 text-white'
                : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-50'
            }`}
          >
            <i className="fa-solid fa-calendar mr-2"></i>
            日历视图
          </button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <TaskCalendar
          tasks={tasks}
          onTaskClick={(task) => {
            setSelectedTask(task);
            setViewMode('list');
            setTimeout(() => {
              if (window.innerWidth < 1024) {
                document.getElementById('task-detail-view')?.scrollIntoView({ behavior: 'smooth' });
              }
            }, 100);
          }}
        />
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 h-auto lg:h-[calc(100vh-180px)]">
        <div className="w-full lg:w-1/3 flex flex-col gap-4 h-[300px] lg:h-full order-1">
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="搜索商户..."
              className="flex-1 px-3 py-2 border border-slate-300 rounded text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="px-2 py-2 border border-slate-300 rounded text-sm w-28"
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
            >
              <option value="ALL">全部</option>
              <option value="high">高风险</option>
              <option value="medium">中风险</option>
            </select>
          </div>

          <div className="overflow-y-auto pr-2 space-y-4 flex-1">
            {filteredTasks.map(task => (
              <div
                key={task.id}
                onClick={() => {
                  setSelectedTask(task);
                  setAiSuggestions([]);
                  setShowNotMetOptions(false);
                  if (isMobileView) {
                    setTimeout(() => document.getElementById('task-detail-view')?.scrollIntoView({ behavior: 'smooth' }), 100);
                  }
                }}
                className={'p-4 rounded-xl border cursor-pointer transition hover:shadow-md bg-white ' + (selectedTask?.id === task.id ? 'border-brand-500 ring-1 ring-brand-500' : 'border-slate-200')}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-slate-800">{task.merchantName}</h4>
                  <span className={'px-2 py-0.5 text-[10px] rounded-full font-bold uppercase ' + ((task as any).riskLevel === 'high' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700')}>
                    {(task as any).riskLevel === 'high' ? '高风险' : '中风险'}
                  </span>
                </div>
                <div className="flex items-center text-xs text-slate-500 mb-2">
                  <span className="w-2 h-2 rounded-full mr-2 bg-blue-400"></span>
                  {task.assignee}
                </div>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-50">
                  <span className={'text-xs px-2 py-1 rounded ' + ((task as any).stage === 'completed' ? 'bg-green-100 text-green-700' : (task as any).stage === 'exit' ? 'bg-red-100 text-red-700' : (task as any).stage === 'escalated' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600')}>
                    {getStageLabel((task as any).stage || 'planning')}
                  </span>
                  <span className="text-xs text-slate-400">{task.createdAt.substring(5)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div id="task-detail-view" className={'w-full flex-1 bg-white rounded-xl shadow-xl border border-slate-100 flex flex-col overflow-hidden h-auto lg:h-full order-2 ' + (!selectedTask ? 'hidden lg:block' : '')}>
          {selectedTask ? (
            <>
              <div className="p-4 lg:p-6 border-b border-slate-100 bg-slate-50">
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 gap-2">
                  <div>
                    <h2 className="text-lg lg:text-xl font-bold text-slate-900">{selectedTask.merchantName} 工作台</h2>
                    <p className="text-xs lg:text-sm text-slate-500 mt-1">
                      阶段: <span className="font-bold text-brand-600">{getStageLabel((selectedTask as any).stage || 'planning')}</span>
                      <span className="mx-2">|</span>
                      责任人: {selectedTask.assignee}
                    </p>
                  </div>
                </div>
                <WorkflowStepper currentStage={(selectedTask as any).stage || 'planning'} />
              </div>

              <div className="p-4 lg:p-8 flex-1 overflow-y-auto">
                {((selectedTask as any).stage === 'planning' || !(selectedTask as any).stage) && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="border border-slate-200 rounded-lg p-4 lg:p-6 flex flex-col">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-purple-700 flex items-center gap-2 text-sm lg:text-base">
                          <i className="fa-solid fa-robot"></i> AI 推荐措施
                        </h4>
                        <button
                          onClick={handleGetAiSuggestions}
                          disabled={isLoadingAi}
                          className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded hover:bg-purple-700 disabled:opacity-50 transition"
                        >
                          {isLoadingAi ? '分析中...' : '生成推荐'}
                        </button>
                      </div>

                      <div className="bg-slate-50 rounded p-3 mb-4">
                        {aiSuggestions.length > 0 ? (
                          <div className="space-y-3">
                            {aiSuggestions.map((s, i) => (
                              <div key={i} className="bg-white rounded shadow-sm border border-slate-100">
                                <div className="p-3 border-b border-slate-100 bg-purple-50">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-purple-700">
                                      参考案例：{matchedCases[i]?.merchantName || matchedCases[i]?.industry}
                                    </span>
                                    <span className="text-xs text-purple-600">
                                      匹配度 {matchedCases[i]?.matchScore || 0}%
                                    </span>
                                  </div>
                                </div>
                                <div className="p-3 flex items-center justify-between group">
                                  <span className="text-sm text-slate-700 flex-1 mr-2">{s}</span>
                                  <button
                                    onClick={() => handleAcceptMeasure(s)}
                                    className="px-2 py-1 text-xs bg-green-50 text-green-600 border border-green-200 rounded hover:bg-green-100 transition"
                                  >
                                    采纳
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-10 text-slate-400 text-sm">
                            <p>点击按钮获取AI建议</p>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-slate-200 pt-4">
                        <h4 className="font-bold text-slate-800 mb-3 text-sm lg:text-base">已采纳措施</h4>
                        {selectedTask.measures && selectedTask.measures.length > 0 ? (
                          <ul className="space-y-2 mb-4">
                            {selectedTask.measures.map((m, i) => (
                              <li key={i} className="flex items-center gap-3 text-sm text-slate-800 bg-white p-3 rounded shadow-sm border-l-4 border-brand-500">
                                <div className="w-5 h-5 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold shrink-0">
                                  {i + 1}
                                </div>
                                <span className="flex-1">{m}</span>
                                <button
                                  onClick={() => {
                                    const newMeasures = selectedTask.measures?.filter((_, idx) => idx !== i);
                                    updateTask({ measures: newMeasures });
                                  }}
                                  className="text-red-500 hover:text-red-700 text-xs"
                                >
                                  <i className="fa-solid fa-trash"></i>
                                </button>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="text-sm text-slate-400 italic text-center py-4 mb-4">
                            暂无措施，请从AI推荐中采纳或手动添加
                          </div>
                        )}

                        <div className="flex gap-2">
                          <input
                            type="text"
                            className="flex-1 text-sm border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none h-10"
                            placeholder="手动输入措施..."
                            value={customMeasure}
                            onChange={(e) => setCustomMeasure(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && customMeasure) {
                                handleAcceptMeasure(customMeasure);
                                setCustomMeasure('');
                              }
                            }}
                          />
                          <button
                            onClick={() => { if (customMeasure) { handleAcceptMeasure(customMeasure); setCustomMeasure(''); }}}
                            className="px-4 py-2 bg-slate-800 text-white rounded text-sm hover:bg-slate-700"
                          >
                            添加
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-100 mt-6 bg-white">
                      <button
                        onClick={() => {
                          if (selectedTask.measures && selectedTask.measures.length > 0) {
                            updateTask({ stage: 'executing' } as any);
                          } else {
                            alert('请至少添加一条帮扶措施后再开始执行');
                          }
                        }}
                        disabled={!selectedTask.measures || selectedTask.measures.length === 0}
                        className={`w-full lg:w-auto px-8 py-3 rounded-lg font-bold text-base transition-all ${
                          selectedTask.measures && selectedTask.measures.length > 0
                            ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer shadow-lg hover:shadow-xl'
                            : 'bg-gray-200 text-gray-600 cursor-not-allowed border-2 border-gray-300'
                        }`}
                      >
                        <i className="fa-solid fa-play mr-2"></i>
                        确认方案并开始执行
                        {(!selectedTask.measures || selectedTask.measures.length === 0) && ' (请先添加措施)'}
                      </button>
                    </div>
                  </div>
                )}

                {(selectedTask as any).stage === 'executing' && (
                  <div className="space-y-6 animate-fade-in">
                    {/* 帮扶措施 */}
                    <div className="border border-slate-200 rounded-lg p-4 lg:p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-slate-800 text-sm lg:text-base">
                          <i className="fa-solid fa-clipboard-list mr-2 text-slate-400"></i> 帮扶措施
                        </h4>
                        <button
                          onClick={() => {
                            const newMeasure = prompt('请输入新的帮扶措施：');
                            if (newMeasure) {
                              const updatedMeasures = [...(selectedTask.measures || []), newMeasure];
                              updateTask({ measures: updatedMeasures });
                              // 添加修改记录
                              const newLog = {
                                id: `l-${Date.now()}`,
                                date: new Date().toISOString().split('T')[0],
                                action: `新增措施：${newMeasure}`,
                                type: 'manual',
                                user: (selectedTask as any).assignedTo?.split(' ')[0] || '运营经理'
                              };
                              const updatedLogs = [...((selectedTask as any).logs || []), newLog];
                              updateTask({ logs: updatedLogs } as any);
                            }
                          }}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          <i className="fa-solid fa-plus mr-1"></i> 新增措施
                        </button>
                      </div>
                      {selectedTask.measures && selectedTask.measures.length > 0 ? (
                        <ul className="space-y-2">
                          {selectedTask.measures.map((m, i) => (
                            <li key={i} className="flex items-center gap-3 text-sm text-slate-800 bg-slate-50 p-3 rounded border border-slate-200">
                              <div className="w-5 h-5 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold shrink-0">
                                {i + 1}
                              </div>
                              <span className="flex-1">{m}</span>
                              <button
                                onClick={() => {
                                  if (confirm('确定要删除这条措施吗？')) {
                                    const newMeasures = selectedTask.measures?.filter((_, idx) => idx !== i);
                                    updateTask({ measures: newMeasures });
                                    // 添加删除记录
                                    const newLog = {
                                      id: `l-${Date.now()}`,
                                      date: new Date().toISOString().split('T')[0],
                                      action: `删除措施：${m}`,
                                      type: 'manual',
                                      user: (selectedTask as any).assignedTo?.split(' ')[0] || '运营经理'
                                    };
                                    const updatedLogs = [...((selectedTask as any).logs || []), newLog];
                                    updateTask({ logs: updatedLogs } as any);
                                  }
                                }}
                                className="text-red-500 hover:text-red-700 text-xs"
                              >
                                <i className="fa-solid fa-trash"></i>
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-sm text-slate-400 italic text-center py-4">
                          暂无措施
                        </div>
                      )}
                    </div>

                    {/* 里程碑管理 */}
                    <MilestoneManager
                      milestones={(selectedTask as any).milestones || []}
                      onUpdate={(milestones) => updateTask({ milestones } as any)}
                    />

                    {/* 执行记录 */}
                    <div className="border border-slate-200 rounded-lg p-4 lg:p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-slate-800 flex items-center text-sm lg:text-base">
                          <i className="fa-solid fa-list-check mr-2 text-slate-400"></i> 执行记录
                        </h4>
                        <button
                          onClick={() => setShowLogModal(true)}
                          className="px-4 py-2 bg-brand-600 text-white rounded text-sm hover:bg-brand-700"
                        >
                          <i className="fa-solid fa-plus mr-1"></i> 添加记录
                        </button>
                      </div>

                      {(selectedTask as any).logs && (selectedTask as any).logs.length > 0 ? (
                        <div className="space-y-3">
                          {(selectedTask as any).logs.map((log: any) => (
                            <div key={log.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-slate-500">{log.date}</span>
                                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                                    {log.user}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      setEditingLog(log);
                                      setLogContent(log.action);
                                      setShowLogModal(true);
                                    }}
                                    className="text-blue-600 hover:text-blue-700 text-xs"
                                  >
                                    <i className="fa-solid fa-edit mr-1"></i>编辑
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm('确定要删除这条执行记录吗？')) {
                                        const newLogs = (selectedTask as any).logs.filter((l: any) => l.id !== log.id);
                                        updateTask({ logs: newLogs } as any);
                                      }
                                    }}
                                    className="text-red-500 hover:text-red-700 text-xs"
                                  >
                                    <i className="fa-solid fa-trash mr-1"></i>删除
                                  </button>
                                </div>
                              </div>
                              <p className="text-sm text-slate-800">{log.action}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center text-slate-400 text-sm">
                          暂无执行记录，点击"添加记录"开始记录执行过程
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-100 mt-6 bg-white">
                      <button
                        onClick={() => updateTask({ stage: 'evaluating' } as any)}
                        className="w-full lg:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg font-bold text-base hover:bg-blue-700 transition shadow-lg hover:shadow-xl"
                      >
                        <i className="fa-solid fa-chart-line mr-2"></i>
                        进入效果评估
                        <i className="fa-solid fa-arrow-right ml-2"></i>
                      </button>
                    </div>
                  </div>
                )}

                {((selectedTask as any).stage === 'evaluating' || (selectedTask as any).stage === 'completed' || (selectedTask as any).stage === 'escalated' || (selectedTask as any).stage === 'exit') && (
                  <div className="space-y-6 animate-fade-in">
                    {/* 帮扶措施回顾 */}
                    <div className="border border-slate-200 rounded-lg p-4 lg:p-6 bg-slate-50">
                      <h4 className="font-bold text-slate-800 mb-3 text-sm lg:text-base">
                        <i className="fa-solid fa-clipboard-check mr-2 text-slate-400"></i> 已执行措施
                      </h4>
                      {selectedTask.measures && selectedTask.measures.length > 0 ? (
                        <ul className="space-y-2">
                          {selectedTask.measures.map((m, i) => (
                            <li key={i} className="flex items-center gap-3 text-sm text-slate-800 bg-white p-3 rounded border border-slate-200">
                              <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold shrink-0">
                                <i className="fa-solid fa-check"></i>
                              </div>
                              <span className="flex-1">{m}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-sm text-slate-400 italic text-center py-4">
                          暂无措施记录
                        </div>
                      )}
                    </div>

                    {/* 帮扶前后对比 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-white p-4 lg:p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-bold text-slate-800 text-sm lg:text-base">健康度雷达图</h4>
                          <div className="flex gap-4 text-xs">
                            <span className="flex items-center"><span className="w-2 h-2 bg-slate-400 rounded-full mr-1"></span>帮扶前</span>
                            <span className="flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>帮扶后</span>
                          </div>
                        </div>
                        {(selectedTask as any).initialMetrics && (
                          <div className="h-64">
                            <HealthRadar
                              metrics={(selectedTask as any).initialMetrics}
                              compareMetrics={getCurrentMetrics()}
                              primaryLabel="帮扶前"
                              compareLabel="帮扶后"
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-4">
                        <div className="bg-white p-4 lg:p-6 rounded-xl border border-slate-200 shadow-sm">
                          <h4 className="font-bold text-slate-800 mb-4 text-sm lg:text-base">核心指标变化</h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                              <span className="text-sm text-slate-600">客流量</span>
                              <span className="text-lg font-bold text-green-600">+18%</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                              <span className="text-sm text-slate-600">月销售额</span>
                              <span className="text-lg font-bold text-green-600">+12%</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                              <span className="text-sm text-slate-600">租金缴纳</span>
                              <span className={'text-lg font-bold ' + ((selectedTask as any).collectionStatus === 'owed' ? 'text-red-500' : 'text-green-600')}>
                                {(selectedTask as any).collectionStatus === 'owed' ? '欠缴' : '正常'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                              <span className="text-sm text-slate-600">健康度评分</span>
                              <span className="text-lg font-bold text-green-600">
                                {(selectedTask as any).initialMetrics ?
                                  `${Math.round((getCurrentMetrics().collection + getCurrentMetrics().operational + getCurrentMetrics().siteQuality + getCurrentMetrics().customerReview + getCurrentMetrics().riskResistance) / 5)}分`
                                  : '75分'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {(selectedTask as any).stage === 'evaluating' && (
                          <div className="bg-white p-4 lg:p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h4 className="font-bold text-slate-800 mb-4 text-sm lg:text-base">效果判定</h4>

                            {!showNotMetOptions ? (
                              <div className="space-y-3">
                                <button
                                  onClick={() => updateTask({ evaluationResult: 'met' } as any)}
                                  className={'p-4 rounded-xl border-2 transition text-left flex items-center justify-between ' + ((selectedTask as any).evaluationResult === 'met' ? 'border-green-500 bg-green-50' : 'border-slate-200 hover:border-green-300')}
                                >
                                  <div>
                                    <div className="font-bold text-green-700">✓ 效果达标</div>
                                    <div className="text-xs text-green-600">风险解除，可结案</div>
                                  </div>
                                  <i className="fa-solid fa-check-circle text-2xl text-green-500"></i>
                                </button>

                                <button
                                  onClick={() => setShowNotMetOptions(true)}
                                  className="p-4 rounded-xl border-2 border-slate-200 hover:border-red-300 bg-white hover:bg-red-50 transition text-left flex items-center justify-between w-full"
                                >
                                  <div>
                                    <div className="font-bold text-red-700">✗ 效果未达标</div>
                                    <div className="text-xs text-red-600">需升级帮扶或转招商</div>
                                  </div>
                                  <i className="fa-solid fa-circle-xmark text-2xl text-red-500"></i>
                                </button>
                              </div>
                            ) : (
                              <div className="p-4 bg-red-50 rounded-xl border border-red-200 animate-fade-in">
                                <div className="flex justify-between items-center mb-3">
                                  <h5 className="font-bold text-red-800 text-sm">选择处置方式</h5>
                                  <button onClick={() => setShowNotMetOptions(false)} className="text-xs text-slate-500 hover:text-slate-800">
                                    <i className="fa-solid fa-times"></i>
                                  </button>
                                </div>
                                <div className="space-y-3">
                                  <button
                                    onClick={handleEscalate}
                                    className="w-full text-left p-3 bg-white border border-red-100 rounded hover:border-purple-300 hover:shadow-sm transition"
                                  >
                                    <div className="font-bold text-purple-700 text-sm mb-1">
                                      <i className="fa-solid fa-arrow-up-right-from-square mr-2"></i> 升级帮扶
                                    </div>
                                    <div className="text-xs text-slate-600">提交上级继续帮扶</div>
                                  </button>

                                  <div className="p-3 bg-white border border-red-100 rounded">
                                    <div className="font-bold text-orange-700 text-sm mb-2">
                                      <i className="fa-solid fa-right-from-bracket mr-2"></i> 转招商预警池
                                    </div>
                                    <input
                                      type="text"
                                      placeholder="请输入转招商原因..."
                                      value={exitReason}
                                      onChange={(e) => setExitReason(e.target.value)}
                                      className="w-full text-xs border border-slate-300 rounded p-2 mb-2"
                                    />
                                    <button
                                      onClick={handleExitToLeasing}
                                      disabled={!exitReason}
                                      className="w-full bg-orange-600 text-white text-xs py-2 rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                    >
                                      确认转招商
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {(selectedTask as any).stage === 'escalated' && (
                          <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                            <div className="text-purple-800 font-bold mb-1">
                              <i className="fa-solid fa-arrow-up-right-dots mr-2"></i>已升级
                            </div>
                            <p className="text-xs text-purple-600">已流转至上一级，继续帮扶。</p>
                          </div>
                        )}
                        {(selectedTask as any).stage === 'exit' && (
                          <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                            <div className="text-orange-800 font-bold mb-1">
                              <i className="fa-solid fa-ban mr-2"></i>已转招商
                            </div>
                            <p className="text-xs text-orange-600">已转入招商预警池，启动清退流程。</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {(selectedTask as any).evaluationResult === 'met' && (selectedTask as any).stage !== 'completed' && (
                      <div className="animate-fade-in-up p-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl text-center">
                        <i className="fa-solid fa-trophy text-4xl text-green-600 mb-3"></i>
                        <h4 className="text-xl font-bold text-green-900 mb-2">帮扶成功！</h4>
                        <p className="text-sm text-slate-600 mb-4">该商户经营状况已明显改善，风险已解除</p>
                        <button
                          onClick={handleSuccessArchive}
                          className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold text-base shadow-lg hover:shadow-xl transition"
                        >
                          <i className="fa-solid fa-check mr-2"></i>
                          结案并沉淀至知识库
                        </button>
                      </div>
                    )}

                    {(selectedTask as any).stage === 'completed' && (
                      <div className="text-center p-12 bg-slate-50 rounded-xl border border-slate-200">
                        <i className="fa-solid fa-book-bookmark text-5xl text-slate-300 mb-4"></i>
                        <h3 className="text-lg font-bold text-slate-700 mb-2">任务已归档</h3>
                        <p className="text-sm text-slate-500">该帮扶任务已成功完成并归档</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center bg-slate-50">
              <i className="fa-solid fa-clipboard-list text-3xl text-slate-300 mb-4"></i>
              <p>请选择任务</p>
            </div>
          )}
        </div>
      </div>
      )}

      {showLogModal && (
        <div
          onClick={() => {
            setShowLogModal(false);
            setEditingLog(null);
            setLogContent('');
          }}
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full md:w-[500px] rounded-t-2xl sm:rounded-xl shadow-xl p-6 pb-20 sm:pb-6 animate-fade-in-up"
          >
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 sm:hidden"></div>
            <h3 className="text-lg font-bold mb-4">{editingLog ? '编辑执行记录' : '添加执行记录'}</h3>
            <div className="space-y-4">
              {!editingLog && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">记录方式</label>
                  <div className="flex gap-2">
                    <button onClick={() => setLogType('manual')} className={'flex-1 py-2 text-sm border rounded ' + (logType === 'manual' ? 'bg-slate-800 text-white' : 'bg-white')}>手动填写</button>
                    <button onClick={() => setLogType('strategy')} className={'flex-1 py-2 text-sm border rounded ' + (logType === 'strategy' ? 'bg-purple-600 text-white' : 'bg-white')}>采纳策略</button>
                  </div>
                </div>
              )}

              {!editingLog && logType === 'strategy' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">选择已采纳的推荐策略</label>
                  <select className="w-full border p-2 rounded text-sm h-12 bg-white" onChange={(e) => setLogContent(e.target.value)}>
                    <option value="">请选择...</option>
                    {knowledgeBase.slice(0, 5).map((c: any) => (
                      <option key={c.id} value={'采纳知识库策略：' + c.strategy}>{'采纳知识库策略：' + c.strategy}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-2">执行内容</label>
                  <textarea
                    className="w-full border p-2 rounded text-sm h-24"
                    placeholder="输入具体执行动作..."
                    value={logContent}
                    onChange={(e) => setLogContent(e.target.value)}
                  ></textarea>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  setShowLogModal(false);
                  setEditingLog(null);
                  setLogContent('');
                }}
                className="flex-1 sm:flex-none px-4 py-3 sm:py-2 text-slate-600 hover:bg-slate-100 rounded-lg sm:rounded text-sm"
              >
                取消
              </button>
              <button onClick={handleSubmitLog} className="flex-1 sm:flex-none px-4 py-3 sm:py-2 bg-blue-600 text-white rounded-lg sm:rounded text-sm hover:bg-blue-700">
                {editingLog ? '保存' : '提交'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
