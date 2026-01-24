/**
 * 健康度趋势预测器 (Health Trend Predictor)
 *
 * 功能：
 * - 基于历史数据的线性回归预测
 * - 趋势方向识别（上升/下降/稳定）
 * - 风险等级预测（高/中/低）
 * - 预测置信度计算
 *
 * 使用场景：
 * - 预测商户健康度走势
 * - 预测营收趋势
 * - 预测租售比变化
 * - 预测任何时间序列指标
 */

export interface DataPoint {
  date: string;
  value: number;
}

export interface TrendPrediction {
  predictions: DataPoint[];
  trend: 'up' | 'down' | 'stable';
  riskLevel: 'high' | 'medium' | 'low';
  confidence: number;
  slope: number;
  intercept: number;
}

/**
 * 线性回归预测
 * @param historicalData 历史数据点数组
 * @param futureMonths 预测未来几个月
 * @param riskThresholds 风险阈值配置
 * @returns 预测结果
 */
export function predictTrend(
  historicalData: DataPoint[],
  futureMonths: number = 3,
  riskThresholds?: {
    stableRange?: number;  // 稳定趋势的斜率范围，默认 ±0.5
    lowRiskThreshold?: number;  // 低风险阈值，默认 70
    mediumRiskThreshold?: number;  // 中风险阈值，默认 60
  }
): TrendPrediction {
  const stableRange = riskThresholds?.stableRange ?? 0.5;
  const lowRiskThreshold = riskThresholds?.lowRiskThreshold ?? 70;
  const mediumRiskThreshold = riskThresholds?.mediumRiskThreshold ?? 60;

  // 如果历史数据不足，返回默认预测
  if (historicalData.length < 2) {
    const lastValue = historicalData[0]?.value ?? 70;
    return {
      predictions: generateFutureDates(historicalData[0]?.date ?? new Date().toISOString().split('T')[0], futureMonths).map(date => ({
        date,
        value: lastValue
      })),
      trend: 'stable',
      riskLevel: getRiskLevel(lastValue, lowRiskThreshold, mediumRiskThreshold),
      confidence: 0.3,
      slope: 0,
      intercept: lastValue
    };
  }

  // 线性回归计算
  const n = historicalData.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

  historicalData.forEach((point, index) => {
    const x = index;
    const y = point.value;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  });

  // 计算斜率和截距
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // 计算 R² (决定系数) 作为置信度
  const meanY = sumY / n;
  let ssTotal = 0, ssResidual = 0;
  historicalData.forEach((point, index) => {
    const predicted = slope * index + intercept;
    ssTotal += Math.pow(point.value - meanY, 2);
    ssResidual += Math.pow(point.value - predicted, 2);
  });
  const rSquared = 1 - (ssResidual / ssTotal);
  const confidence = Math.max(0, Math.min(1, rSquared)); // 限制在 0-1 之间

  // 生成未来预测
  const lastDate = historicalData[historicalData.length - 1].date;
  const futureDates = generateFutureDates(lastDate, futureMonths);
  const predictions: DataPoint[] = futureDates.map((date, index) => {
    const x = n + index;
    const value = Math.max(0, Math.min(100, slope * x + intercept)); // 限制在 0-100 之间
    return { date, value: Math.round(value) };
  });

  // 判断趋势方向
  let trend: 'up' | 'down' | 'stable';
  if (Math.abs(slope) < stableRange) {
    trend = 'stable';
  } else if (slope > 0) {
    trend = 'up';
  } else {
    trend = 'down';
  }

  // 预测风险等级（基于最后一个预测值）
  const lastPredictedValue = predictions[predictions.length - 1].value;
  const riskLevel = getRiskLevel(lastPredictedValue, lowRiskThreshold, mediumRiskThreshold);

  return {
    predictions,
    trend,
    riskLevel,
    confidence: Math.round(confidence * 100) / 100,
    slope: Math.round(slope * 100) / 100,
    intercept: Math.round(intercept * 100) / 100
  };
}

/**
 * 生成未来日期
 */
function generateFutureDates(lastDate: string, months: number): string[] {
  const dates: string[] = [];
  const date = new Date(lastDate);

  for (let i = 1; i <= months; i++) {
    const futureDate = new Date(date);
    futureDate.setMonth(futureDate.getMonth() + i);
    dates.push(futureDate.toISOString().split('T')[0]);
  }

  return dates;
}

/**
 * 根据分数判断风险等级
 */
function getRiskLevel(
  value: number,
  lowRiskThreshold: number,
  mediumRiskThreshold: number
): 'high' | 'medium' | 'low' {
  if (value >= lowRiskThreshold) {
    return 'low';
  } else if (value >= mediumRiskThreshold) {
    return 'medium';
  } else {
    return 'high';
  }
}

/**
 * 生成模拟历史数据（用于测试）
 */
export function generateMockHistoricalData(
  months: number = 6,
  startValue: number = 70,
  trend: 'up' | 'down' | 'stable' = 'stable',
  volatility: number = 5
): DataPoint[] {
  const data: DataPoint[] = [];
  const today = new Date();

  let trendSlope = 0;
  if (trend === 'up') trendSlope = 2;
  if (trend === 'down') trendSlope = -2;

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setMonth(date.getMonth() - i);

    const trendValue = startValue + trendSlope * (months - i);
    const randomNoise = (Math.random() - 0.5) * volatility * 2;
    const value = Math.max(0, Math.min(100, Math.round(trendValue + randomNoise)));

    data.push({
      date: date.toISOString().split('T')[0],
      value
    });
  }

  return data;
}
