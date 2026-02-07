/**
 * 快捷操作按钮
 */

'use client';

import { QuickAction } from '@/types/ai-assistant';
import { Activity, AlertTriangle, Lightbulb, Search } from 'lucide-react';

interface QuickActionsProps {
  onSelect: (template: string) => void;
}

const quickActions: QuickAction[] = [
  {
    id: 'health_query',
    label: '查询健康度',
    icon: 'Activity',
    intent: 'health_query',
    template: '查询商户健康度',
  },
  {
    id: 'risk_diagnosis',
    label: '风险诊断',
    icon: 'AlertTriangle',
    intent: 'risk_diagnosis',
    template: '诊断商户风险',
  },
  {
    id: 'solution',
    label: '获取方案',
    icon: 'Lightbulb',
    intent: 'solution_recommend',
    template: '推荐帮扶方案',
  },
  {
    id: 'search',
    label: '搜索商户',
    icon: 'Search',
    intent: 'data_query',
    template: '搜索商户',
  },
];

export default function QuickActions({ onSelect }: QuickActionsProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Activity':
        return <Activity className="h-4 w-4" />;
      case 'AlertTriangle':
        return <AlertTriangle className="h-4 w-4" />;
      case 'Lightbulb':
        return <Lightbulb className="h-4 w-4" />;
      case 'Search':
        return <Search className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500">快捷操作:</p>
      <div className="grid grid-cols-2 gap-2">
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={() => onSelect(action.template)}
            className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 hover:border-blue-500"
          >
            {action.icon && getIcon(action.icon)}
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
