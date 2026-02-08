/**
 * 统一格式化工具 - 商户运营系统
 * 提供风险等级、健康度、数值等格式化功能
 */

/**
 * 风险等级格式化器
 */
export const RiskLevelFormatter = {
  /**
   * 风险等级 → 中文标签
   */
  toChineseLabel(level: string): string {
    const labels: Record<string, string> = {
      'critical': '极高风险',
      'high': '高风险',
      'medium': '中风险',
      'low': '低风险',
      'none': '无风险',
    };
    return labels[level.toLowerCase()] || level;
  },

  /**
   * 获取徽章配置（颜色+文本）
   */
  getBadgeConfig(level: string): { className: string; text: string } {
    const configs: Record<string, { className: string; text: string }> = {
      'critical': {
        className: 'bg-purple-100 text-purple-700 border-purple-200',
        text: '极高风险'
      },
      'high': {
        className: 'bg-red-100 text-red-700 border-red-200',
        text: '高风险'
      },
      'medium': {
        className: 'bg-orange-100 text-orange-700 border-orange-200',
        text: '中风险'
      },
      'low': {
        className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        text: '低风险'
      },
      'none': {
        className: 'bg-green-100 text-green-700 border-green-200',
        text: '无风险'
      },
    };
    return configs[level.toLowerCase()] || configs.medium;
  },
};

/**
 * 健康度格式化器
 */
export const HealthScoreFormatter = {
  /**
   * 健康度分数 → 等级文本
   */
  getGrade(score: number): string {
    if (score >= 80) return '优秀';
    if (score >= 60) return '良好';
    if (score >= 40) return '中等';
    if (score >= 20) return '较差';
    return '很差';
  },

  /**
   * 健康度分数 → 颜色类
   */
  getColorClass(score: number): string {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    if (score >= 20) return 'text-orange-600';
    return 'text-red-600';
  },

  /**
   * 健康度分数 → 背景颜色类
   */
  getBgColorClass(score: number): string {
    if (score >= 80) return 'bg-green-50';
    if (score >= 60) return 'bg-blue-50';
    if (score >= 40) return 'bg-yellow-50';
    if (score >= 20) return 'bg-orange-50';
    return 'bg-red-50';
  },
};

/**
 * 数值格式化器
 */
export const NumberFormatter = {
  /**
   * 格式化金额（转为万元）
   */
  toWanYuan(value: number): string {
    return `${(value / 10000).toFixed(1)}万`;
  },

  /**
   * 格式化百分比
   */
  toPercentage(value: number, decimals: number = 1): string {
    return `${(value * 100).toFixed(decimals)}%`;
  },

  /**
   * 格式化数字（添加千分位）
   */
  toLocaleString(value: number): string {
    return value.toLocaleString('zh-CN');
  },

  /**
   * 格式化租金缴纳率
   */
  toRentCollectionRate(value: number): string {
    return `${(value * 100).toFixed(1)}%`;
  },
};

/**
 * 指标名称中文化
 */
export const MetricNameFormatter = {
  toChinese(metricKey: string): string {
    const names: Record<string, string> = {
      'revenue': '营收',
      'rent': '租金',
      'collection': '租金缴纳',
      'operational': '经营表现',
      'siteQuality': '现场品质',
      'customerReview': '顾客评价',
      'riskResistance': '抗风险能力',
      'totalScore': '健康度总分',
      'riskLevel': '风险等级',
    };
    return names[metricKey] || metricKey;
  },
};
