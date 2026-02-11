/**
 * 关键指标预警组件
 * 用于商户详情页展示关键运营指标的预警状态
 */

'use client';

import { Merchant } from '@/types';
import { AlertTriangle, TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface KeyMetric {
  label: string;
  value: string | number;
  status: 'normal' | 'warning' | 'danger';
  trend?: 'up' | 'down' | 'stable';
  threshold?: string;
  description?: string;
}

interface KeyMetricsAlertProps {
  merchant: Merchant;
}

export default function KeyMetricsAlert({ merchant }: KeyMetricsAlertProps) {
  const metrics = analyzeKeyMetrics(merchant);
  const alertCount = metrics.filter(m => m.status !== 'normal').length;

  if (alertCount === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-green-700">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="font-semibold">关键指标正常</span>
        </div>
        <p className="text-sm text-green-600 mt-1">所有关键运营指标均在正常范围内</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 预警概览 */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-700">
          <AlertTriangle className="w-5 h-5" />
          <span className="font-semibold">发现 {alertCount} 个异常指标</span>
        </div>
        <p className="text-sm text-red-600 mt-1">以下关键指标需要关注</p>
      </div>

      {/* 指标卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {metrics.map((metric, index) => (
          <MetricCard key={index} metric={metric} />
        ))}
      </div>
    </div>
  );
}

// 指标卡片
function MetricCard({ metric }: { metric: KeyMetric }) {
  const statusConfig = {
    normal: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      badge: 'bg-green-100 text-green-700',
      icon: <div className="w-2 h-2 bg-green-500 rounded-full"></div>,
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-700',
      badge: 'bg-yellow-100 text-yellow-700',
      icon: <AlertTriangle className="w-4 h-4 text-yellow-600" />,
    },
    danger: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      badge: 'bg-red-100 text-red-700',
      icon: <AlertTriangle className="w-4 h-4 text-red-600" />,
    },
  };

  const config = statusConfig[metric.status];

  const trendIcon = metric.trend === 'up' ? (
    <TrendingUp className="w-4 h-4 text-green-600" />
  ) : metric.trend === 'down' ? (
    <TrendingDown className="w-4 h-4 text-red-600" />
  ) : (
    <Minus className="w-4 h-4 text-gray-400" />
  );

  return (
    <div className={`${config.bg} ${config.border} border rounded-lg p-4`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {config.icon}
          <span className={`text-sm font-medium ${config.text}`}>{metric.label}</span>
        </div>
        {metric.trend && trendIcon}
      </div>

      <div className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</div>

      {metric.threshold && (
        <div className="text-xs text-gray-600 mb-2">
          阈值: {metric.threshold}
        </div>
      )}

      {metric.description && (
        <div className="text-xs text-gray-600">{metric.description}</div>
      )}

      {metric.status !== 'normal' && (
        <div className={`${config.badge} text-xs font-semibold px-2 py-1 rounded mt-2 inline-block`}>
          {metric.status === 'warning' ? '⚠️ 需关注' : '🚨 需立即处理'}
        </div>
      )}
    </div>
  );
}

// 分析关键指标
function analyzeKeyMetrics(merchant: Merchant): KeyMetric[] {
  const metrics: KeyMetric[] = [];
  const details = merchant.operationalDetails;

  if (!details) {
    return metrics;
  }

  // 1. 翻台率（餐饮类）
  if (details.restaurant?.turnoverRate !== undefined) {
    const rate = details.restaurant.turnoverRate;
    metrics.push({
      label: '翻台率',
      value: `${rate}次/天`,
      status: rate < 2.0 ? 'danger' : rate < 2.5 ? 'warning' : 'normal',
      threshold: '≥2.0次/天',
      description: rate < 2.0 ? '严重偏低，影响营收' : rate < 2.5 ? '略低于行业平均' : '正常范围',
    });
  }

  // 2. NPS得分
  if (details.customer?.npsScore !== undefined) {
    const nps = details.customer.npsScore;
    metrics.push({
      label: 'NPS净推荐值',
      value: nps,
      status: nps < 0 ? 'danger' : nps < 30 ? 'warning' : 'normal',
      threshold: '≥30',
      description: nps < 0 ? '顾客满意度极低' : nps < 30 ? '顾客满意度偏低' : '顾客满意度良好',
    });
  }

  // 3. 员工流失率
  if (details.staff?.turnoverRate !== undefined) {
    const rate = details.staff.turnoverRate;
    metrics.push({
      label: '员工流失率',
      value: `${rate}%/年`,
      status: rate > 30 ? 'danger' : rate > 20 ? 'warning' : 'normal',
      threshold: '≤20%/年',
      description: rate > 30 ? '流失率过高，影响服务质量' : rate > 20 ? '流失率偏高' : '流失率正常',
    });
  }

  // 4. 坪效（零售类）- 通过日均销售额和面积计算
  if (details.retail?.dailySales !== undefined && merchant.area) {
    const dailySales = details.retail.dailySales;
    const salesPerSqm = (dailySales * 30) / merchant.area; // 月销售额 / 面积
    metrics.push({
      label: '坪效',
      value: `${(salesPerSqm / 10000).toFixed(1)}万/㎡·月`,
      status: salesPerSqm < 20000 ? 'danger' : salesPerSqm < 25000 ? 'warning' : 'normal',
      threshold: '≥2.0万/㎡·月',
      description: salesPerSqm < 20000 ? '坪效过低' : salesPerSqm < 25000 ? '坪效偏低' : '坪效正常',
    });
  }

  // 5. 租售比
  const rentRatio = merchant.rentToSalesRatio * 100;
  metrics.push({
    label: '租售比',
    value: `${rentRatio.toFixed(1)}%`,
    status: rentRatio > 25 ? 'danger' : rentRatio > 20 ? 'warning' : 'normal',
    threshold: '≤20%',
    description: rentRatio > 25 ? '租金压力过大' : rentRatio > 20 ? '租金压力偏大' : '租金压力正常',
  });

  // 6. 健康度评分
  const score = merchant.totalScore;
  metrics.push({
    label: '健康度评分',
    value: `${score}分`,
    status: score < 60 ? 'danger' : score < 80 ? 'warning' : 'normal',
    threshold: '≥80分',
    description: score < 60 ? '健康状况差' : score < 80 ? '健康状况一般' : '健康状况良好',
  });

  return metrics;
}
