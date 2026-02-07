/**
 * 行动卡片组件
 * 显示可点击的操作卡片，引导用户跳转到对应页面
 */

'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, FileText, TrendingUp, BookOpen, ClipboardList, FileSearch } from 'lucide-react';

export type ActionType =
  | 'create_task'
  | 'create_inspection'
  | 'view_health'
  | 'view_archives'
  | 'view_knowledge';

interface ActionCardProps {
  type: ActionType;
  merchantId?: string;
  merchantName?: string;
}

interface ActionConfig {
  icon: any;
  title: string;
  description: string;
  color: string;
  onClick: () => void;
}

export default function ActionCard({ type, merchantId, merchantName }: ActionCardProps) {
  const router = useRouter();

  const ACTION_CONFIG: Record<ActionType, ActionConfig> = {
    create_task: {
      icon: ClipboardList,
      title: '创建帮扶任务',
      description: `为${merchantName || '该商户'}创建定制化帮扶方案`,
      color: 'blue',
      onClick: () => router.push(`/tasks?merchantId=${merchantId}&from=ai`),
    },
    create_inspection: {
      icon: FileSearch,
      title: '发起现场巡店',
      description: '前往巡店页面进行现场检查',
      color: 'green',
      onClick: () => router.push(`/inspection?merchantId=${merchantId}&from=ai`),
    },
    view_health: {
      icon: TrendingUp,
      title: '查看健康度详情',
      description: '查看完整的健康度分析和趋势',
      color: 'purple',
      onClick: () => router.push('/health'),
    },
    view_archives: {
      icon: FileText,
      title: '查看历史档案',
      description: `查看${merchantName || '该商户'}的完整帮扶档案`,
      color: 'orange',
      onClick: () => router.push(`/archives${merchantId ? `/${merchantId}` : ''}`),
    },
    view_knowledge: {
      icon: BookOpen,
      title: '浏览知识库',
      description: '查看更多成功案例和帮扶方案',
      color: 'indigo',
      onClick: () => router.push('/knowledge'),
    },
  };

  const config = ACTION_CONFIG[type];
  const Icon = config.icon;

  // 动态生成颜色类名（确保Tailwind编译时包含）
  const colorClasses = {
    blue: {
      border: 'border-blue-200',
      bg: 'bg-blue-50',
      hoverBg: 'hover:bg-blue-100',
      iconBg: 'bg-blue-500',
    },
    green: {
      border: 'border-green-200',
      bg: 'bg-green-50',
      hoverBg: 'hover:bg-green-100',
      iconBg: 'bg-green-500',
    },
    purple: {
      border: 'border-purple-200',
      bg: 'bg-purple-50',
      hoverBg: 'hover:bg-purple-100',
      iconBg: 'bg-purple-500',
    },
    orange: {
      border: 'border-orange-200',
      bg: 'bg-orange-50',
      hoverBg: 'hover:bg-orange-100',
      iconBg: 'bg-orange-500',
    },
    indigo: {
      border: 'border-indigo-200',
      bg: 'bg-indigo-50',
      hoverBg: 'hover:bg-indigo-100',
      iconBg: 'bg-indigo-500',
    },
  };

  const colors = colorClasses[config.color as keyof typeof colorClasses];

  return (
    <button
      onClick={config.onClick}
      className={`group flex w-full items-center gap-3 rounded-lg border-2 p-4 transition-all ${colors.border} ${colors.bg} ${colors.hoverBg}`}
    >
      <div
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${colors.iconBg}`}
      >
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="flex-1 text-left">
        <h3 className="text-sm font-semibold text-gray-900">{config.title}</h3>
        <p className="text-xs text-gray-600">{config.description}</p>
      </div>
      <ArrowRight className="h-5 w-5 text-gray-400 transition-all group-hover:translate-x-1 group-hover:text-gray-600" />
    </button>
  );
}
