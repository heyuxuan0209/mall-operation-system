/**
 * Health Trend Prediction Utility
 * 健康度趋势预测 - 基于线性回归的趋势预测算法
 *
 * Priority: P1
 * Use Cases: 健康度趋势预测、风险预警、数据可视化
 */

export interface HealthDataPoint {
  date: string;
  score: number;
  predicted?: boolean;
}

export interface PredictionConfig {
  lookbackMonths?: number;  // 回溯月数，默认3
  forecastMonths?: number;  // 预测月数，默认3
  minDataPoints?: number;   // 最小数据点数，默认3
}

/**
 * 线性回归预测算法
 * 使用最小二乘法拟合线性模型：y = mx + b
 *
 * @param data 历史健康度数据点
 * @param config 预测配置
 * @returns 预测的未来数据点
 */
export function predictHealthTrend(
  data: HealthDataPoint[],
  config: PredictionConfig = {}
): HealthDataPoint[] {
  const {
    lookbackMonths = 3,
    forecastMonths = 3,
    minDataPoints = 3
  } = config;

  // 数据验证
  if (!data || data.length < minDataPoints) {
    return [];
  }

  // 取最近N个月的数据
  const recentData = data.slice(-lookbackMonths);
  const n = recentData.length;

  // 计算线性回归参数
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

  recentData.forEach((point, i) => {
    sumX += i;
    sumY += point.score;
    sumXY += i * point.score;
    sumX2 += i * i;
  });

  // 斜率 m = (n*ΣXY - ΣX*ΣY) / (n*ΣX² - (ΣX)²)
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

  // 截距 b = (ΣY - m*ΣX) / n
  const intercept = (sumY - slope * sumX) / n;

  // 生成预测数据点
  const predictions: HealthDataPoint[] = [];
  const lastDate = new Date(data[data.length - 1].date + '-01');

  for (let i = 1; i <= forecastMonths; i++) {
    const futureDate = new Date(lastDate.getFullYear(), lastDate.getMonth() + i, 1);
    const dateStr = futureDate.toISOString().split('T')[0].substring(0, 7);
    const predictedScore = intercept + slope * (n + i - 1);

    // 限制预测值在 0-100 范围内
    const clampedScore = Math.max(0, Math.min(100, Math.round(predictedScore)));

    predictions.push({
      date: dateStr,
      score: clampedScore,
      predicted: true
    });
  }

  return predictions;
}

/**
 * 计算趋势方向和强度
 *
 * @param data 历史健康度数据点
 * @returns 趋势信息
 */
export function analyzeTrend(data: HealthDataPoint[]): {
  direction: 'up' | 'down' | 'stable';
  strength: 'strong' | 'moderate' | 'weak';
  slope: number;
  description: string;
} {
  if (data.length < 2) {
    return {
      direction: 'stable',
      strength: 'weak',
      slope: 0,
      description: '数据不足，无法分析趋势'
    };
  }

  const recentData = data.slice(-3);
  const n = recentData.length;

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

  recentData.forEach((point, i) => {
    sumX += i;
    sumY += point.score;
    sumXY += i * point.score;
    sumX2 += i * i;
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

  // 判断趋势方向
  let direction: 'up' | 'down' | 'stable';
  if (Math.abs(slope) < 1) {
    direction = 'stable';
  } else if (slope > 0) {
    direction = 'up';
  } else {
    direction = 'down';
  }

  // 判断趋势强度
  let strength: 'strong' | 'moderate' | 'weak';
  const absSlope = Math.abs(slope);
  if (absSlope < 1) {
    strength = 'weak';
  } else if (absSlope < 3) {
    strength = 'moderate';
  } else {
    strength = 'strong';
  }

  // 生成描述
  const directionText = direction === 'up' ? '上升' : direction === 'down' ? '下降' : '平稳';
  const strengthText = strength === 'strong' ? '显著' : strength === 'moderate' ? '温和' : '轻微';
  const description = `健康度呈${strengthText}${directionText}趋势`;

  return {
    direction,
    strength,
    slope,
    description
  };
}

/**
 * 生成风险预警
 *
 * @param predictions 预测数据点
 * @param threshold 风险阈值，默认60
 * @returns 风险预警信息
 */
export function generateRiskAlert(
  predictions: HealthDataPoint[],
  threshold: number = 60
): {
  hasRisk: boolean;
  riskLevel: 'high' | 'medium' | 'low';
  message: string;
  suggestedActions: string[];
} {
  if (predictions.length === 0) {
    return {
      hasRisk: false,
      riskLevel: 'low',
      message: '暂无风险预警',
      suggestedActions: []
    };
  }

  const lowestScore = Math.min(...predictions.map(p => p.score));
  const hasRisk = lowestScore < threshold;

  let riskLevel: 'high' | 'medium' | 'low';
  let message: string;
  let suggestedActions: string[];

  // 使用与5等级标准对齐的阈值
  if (lowestScore < 40) {
    riskLevel = 'high';
    message = `预警：预计健康度将降至${lowestScore}分，存在极高风险`;
    suggestedActions = [
      '立即启动紧急帮扶流程',
      '安排专人驻点跟进',
      '制定紧急改善方案',
      '加强日常监控',
      '评估业态调整可能性'
    ];
  } else if (lowestScore < threshold) {
    riskLevel = 'medium';
    message = `提醒：预计健康度将降至${lowestScore}分，需要关注`;
    suggestedActions = [
      '提前制定帮扶预案',
      '加强沟通和指导',
      '定期跟踪健康度变化'
    ];
  } else {
    riskLevel = 'low';
    message = `健康度预计保持在${lowestScore}分以上，风险较低`;
    suggestedActions = [
      '保持现有运营策略',
      '继续监控关键指标'
    ];
  }

  return {
    hasRisk,
    riskLevel,
    message,
    suggestedActions
  };
}

/**
 * 计算预测准确度（需要实际数据对比）
 *
 * @param predictions 预测数据
 * @param actuals 实际数据
 * @returns 准确度指标
 */
export function calculateAccuracy(
  predictions: HealthDataPoint[],
  actuals: HealthDataPoint[]
): {
  mape: number;  // 平均绝对百分比误差
  rmse: number;  // 均方根误差
  accuracy: number;  // 准确度百分比
} {
  if (predictions.length === 0 || actuals.length === 0) {
    return { mape: 0, rmse: 0, accuracy: 0 };
  }

  const n = Math.min(predictions.length, actuals.length);
  let sumAbsPercentError = 0;
  let sumSquaredError = 0;

  for (let i = 0; i < n; i++) {
    const predicted = predictions[i].score;
    const actual = actuals[i].score;

    // MAPE: Mean Absolute Percentage Error
    const percentError = Math.abs((actual - predicted) / actual) * 100;
    sumAbsPercentError += percentError;

    // RMSE: Root Mean Squared Error
    const squaredError = Math.pow(actual - predicted, 2);
    sumSquaredError += squaredError;
  }

  const mape = sumAbsPercentError / n;
  const rmse = Math.sqrt(sumSquaredError / n);
  const accuracy = Math.max(0, 100 - mape);

  return {
    mape: Math.round(mape * 100) / 100,
    rmse: Math.round(rmse * 100) / 100,
    accuracy: Math.round(accuracy * 100) / 100
  };
}
