'use client';

import React, { useState } from 'react';
import { CheckCircle, Clock, AlertCircle, ChevronRight, ChevronDown } from 'lucide-react';
import workflowTemplates from '@/data/workflows/workflow-templates.json';

interface WorkflowTemplateProps {
  riskType?: string;
  onApplyTemplate?: (template: any) => void;
}

export default function WorkflowTemplate({ riskType, onApplyTemplate }: WorkflowTemplateProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [expandedStages, setExpandedStages] = useState<Set<string>>(new Set());

  // 根据风险类型筛选模板
  const filteredTemplates = riskType
    ? workflowTemplates.filter(t => t.riskType === riskType)
    : workflowTemplates;

  // 切换阶段展开/收起
  const toggleStage = (stageId: string) => {
    const newExpanded = new Set(expandedStages);
    if (newExpanded.has(stageId)) {
      newExpanded.delete(stageId);
    } else {
      newExpanded.add(stageId);
    }
    setExpandedStages(newExpanded);
  };

  // 获取阶段图标
  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'planning':
        return <AlertCircle size={20} className="text-blue-600" />;
      case 'executing':
        return <Clock size={20} className="text-orange-600" />;
      case 'following':
        return <Clock size={20} className="text-purple-600" />;
      case 'reviewing':
        return <CheckCircle size={20} className="text-green-600" />;
      default:
        return <Clock size={20} className="text-gray-600" />;
    }
  };

  // 获取阶段颜色
  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'planning':
        return 'bg-blue-50 border-blue-200 text-blue-900';
      case 'executing':
        return 'bg-orange-50 border-orange-200 text-orange-900';
      case 'following':
        return 'bg-purple-50 border-purple-200 text-purple-900';
      case 'reviewing':
        return 'bg-green-50 border-green-200 text-green-900';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-900';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-900 mb-2">帮扶流程模板</h3>
        <p className="text-sm text-slate-500">
          选择标准化流程模板，快速启动帮扶任务
        </p>
      </div>

      {/* 模板列表 */}
      <div className="space-y-4 mb-6">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            onClick={() => setSelectedTemplate(template)}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
              selectedTemplate?.id === template.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">{template.name}</h4>
                <p className="text-sm text-gray-600">{template.description}</p>
              </div>
              {selectedTemplate?.id === template.id && (
                <CheckCircle className="text-blue-600 flex-shrink-0 ml-2" size={20} />
              )}
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
              <span className="flex items-center gap-1">
                <Clock size={14} />
                预计 {template.estimatedDuration}
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle size={14} />
                成功率 {template.successRate}%
              </span>
              <span className="px-2 py-0.5 bg-gray-100 rounded">
                {template.stages.length} 个阶段
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 模板详情 */}
      {selectedTemplate && (
        <div className="border-t border-gray-200 pt-6">
          <h4 className="font-semibold text-gray-900 mb-4">流程详情</h4>

          {/* 流程阶段 */}
          <div className="space-y-3 mb-6">
            {selectedTemplate.stages.map((stageData: any, index: number) => {
              const stageId = `${selectedTemplate.id}-${stageData.stage}`;
              const isExpanded = expandedStages.has(stageId);

              return (
                <div key={stageId} className={`border rounded-lg ${getStageColor(stageData.stage)}`}>
                  {/* 阶段头部 */}
                  <div
                    onClick={() => toggleStage(stageId)}
                    className="p-4 cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white">
                        {getStageIcon(stageData.stage)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            阶段 {index + 1}: {stageData.name}
                          </span>
                          <span className="text-xs opacity-75">
                            ({stageData.duration})
                          </span>
                        </div>
                        <p className="text-sm opacity-75 mt-0.5">{stageData.description}</p>
                      </div>
                    </div>
                    {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </div>

                  {/* 阶段详情 */}
                  {isExpanded && (
                    <div className="px-4 pb-4 space-y-3">
                      {/* 检查清单 */}
                      <div>
                        <h5 className="text-sm font-semibold mb-2">检查清单</h5>
                        <ul className="space-y-1">
                          {stageData.checklist.map((item: string, i: number) => (
                            <li key={i} className="text-sm flex items-start gap-2">
                              <span className="text-gray-400 mt-0.5">□</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* 必填字段 */}
                      {stageData.requiredFields && stageData.requiredFields.length > 0 && (
                        <div>
                          <h5 className="text-sm font-semibold mb-2">必填信息</h5>
                          <div className="flex flex-wrap gap-2">
                            {stageData.requiredFields.map((field: string, i: number) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-white rounded text-xs border"
                              >
                                {field}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 建议措施 */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h5 className="text-sm font-semibold text-gray-900 mb-3">建议帮扶措施</h5>
            <div className="flex flex-wrap gap-2">
              {selectedTemplate.suggestedMeasures.map((measure: string, i: number) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm"
                >
                  {measure}
                </span>
              ))}
            </div>
          </div>

          {/* 应用按钮 */}
          {onApplyTemplate && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onApplyTemplate(selectedTemplate);
              }}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              应用此模板
            </button>
          )}
        </div>
      )}

      {/* 空状态 */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <AlertCircle size={48} className="mx-auto mb-3 text-gray-300" />
          <p>暂无匹配的流程模板</p>
        </div>
      )}
    </div>
  );
}
