/**
 * Trend Predictor（趋势预测器）
 *
 * 功能：基于线性回归的健康度趋势预测和风险预警
 *
 * 核心算法：
 * - 最小二乘法线性回归（Least Squares Regression）
 * - 趋势方向和强度分析
 * - 风险预警生成
 * - 预测准确度评估（MAPE/RMSE）
 *
 * 复用场景：
 * - 健康度趋势预测页面
 * - 风险预警系统
 * - 帮扶效果评估
 * - 数据可视化图表
 *
 * ## 线性回归算法
 *
 * 使用最小二乘法拟合线性模型：y = mx + b
 *
 * 斜率计算：m = (n*ΣXY - ΣX*ΣY) / (n*ΣX² - (ΣX)²)
 * 截距计算：b = (ΣY - m*ΣX) / n
 *
 * ## 趋势强度判定
 *
 * - **弱趋势**：|斜率| < 1（每月变化<1分）
 * - **中等趋势**：1 ≤ |斜率| < 3（每月变化1-3分）
 * - **强趋势**：|斜率| ≥ 3（每月变化≥3分）
 *
 * ## 风险预警标准
 *
 * 基于v2.0的5等级风险标准：
 * - **极高风险**：预测分数 < 40分
 * - **中等风险**：预测分数 40-60分
 * - **低风险**：预测分数 > 60分
 *
 * @example
 * ```typescript
 * // 示例1：预测未来趋势
 * const historicalData = [
 *   { date: '2026-10', score: 75 },
 *   { date: '2026-11', score: 68 },
 *   { date: '2026-12', score: 62 }
 * ];
 *
 * const predictions = predictHealthTrend(historicalData, {
 *   lookbackMonths: 3,
 *   forecastMonths: 3
 * });
 * console.log(predictions);
 * // [
 * //   { date: '2027-01', score: 56, predicted: true },
 * //   { date: '2027-02', score: 50, predicted: true },
 * //   { date: '2027-03', score: 44, predicted: true }
 * // ]
 *
 * // 示例2：趋势分析
 * const trend = analyzeTrend(historicalData);
 * console.log(trend);
 * // {
 * //   direction: 'down',
 * //   strength: 'moderate',
 * //   slope: -6.5,
 * //   description: '健康度呈温和下降趋势'
 * // }
 *
 * // 示例3：风险预警
 * const alert = generateRiskAlert(predictions, 60);
 * console.log(alert);
 * // {
 * //   hasRisk: true,
 * //   riskLevel: 'medium',
 * //   message: '提醒：预计健康度将降至56分，需要关注',
 * //   suggestedActions: ['提前制定帮扶预案', ...]
 * // }
 * ```
 *
 * @version 2.0
 * @priority P0
 * @updated 2026-01-28 - 迁移到skills目录
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
 *
 * 基于最小二乘法拟合线性模型，预测未来健康度趋势。
 *
 * 算法步骤：
 * 1. 提取最近N个月的历史数据
 * 2. 计算线性回归参数（斜率和截距）
 * 3. 使用模型预测未来M个月的分数
 * 4. 限制预测值在0-100范围内
 *
 * @param data - 历史健康度数据点（至少3个）
 * @param config - 预测配置
 * @returns 预测的未来数据点数组
 *
 * @example
 * ```typescript
 * const data = [
 *   { date: '2026-10', score: 75 },
 *   { date: '2026-11', score: 70 },
 *   { date: '2026-12', score: 65 }
 * ];
 *
 * const predictions = predictHealthTrend(data, {
 *   lookbackMonths: 3,
 *   forecastMonths: 2
 * });
 * // [
 * //   { date: '2027-01', score: 60, predicted: true },
 * //   { date: '2027-02', score: 55, predicted: true }
 * // ]
 * ```
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
 * 基于最近3个月数据，计算线性回归斜率，并判断趋势特征。
 *
 * 判定标准：
 * - **趋势方向**：|斜率| < 1 → 平稳，斜率 > 0 → 上升，斜率 < 0 → 下降
 * - **趋势强度**：|斜率| < 1 → 弱，1 ≤ |斜率| < 3 → 中等，|斜率| ≥ 3 → 强
 *
 * @param data - 历史健康度数据点（至少2个）
 * @returns 趋势分析结果
 *
 * @example
 * ```typescript
 * const data = [
 *   { date: '2026-10', score: 80 },
 *   { date: '2026-11', score: 75 },
 *   { date: '2026-12', score: 65 }
 * ];
 *
 * const trend = analyzeTrend(data);
 * console.log(trend);
 * // {
 * //   direction: 'down',
 * //   strength: 'moderate',
 * //   slope: -7.5,
 * //   description: '健康度呈温和下降趋势'
 * // }
 * ```
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
 * 基于预测数据，判断未来是否存在风险，并生成相应的预警信息和建议措施。
 *
 * 风险等级判定（基于v2.0的5等级标准）：
 * - **极高风险**：预测分数 < 40分
 * - **中等风险**：预测分数 40-60分
 * - **低风险**：预测分数 > 60分
 *
 * @param predictions - 预测数据点数组
 * @param threshold - 风险阈值（默认60分）
 * @returns 风险预警信息
 *
 * @example
 * ```typescript
 * const predictions = [
 *   { date: '2027-01', score: 55, predicted: true },
 *   { date: '2027-02', score: 48, predicted: true }
 * ];
 *
 * const alert = generateRiskAlert(predictions, 60);
 * console.log(alert);
 * // {
 * //   hasRisk: true,
 * //   riskLevel: 'medium',
 * //   message: '提醒：预计健康度将降至48分，需要关注',
 * //   suggestedActions: [
 * //     '提前制定帮扶预案',
 * //     '加强沟通和指导',
 * //     '定期跟踪健康度变化'
 * //   ]
 * // }
 * ```
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
 * 计算预测准确度
 *
 * 通过对比预测值和实际值，计算预测模型的准确度指标。
 *
 * 计算指标：
 * - **MAPE**（平均绝对百分比误差）：|(实际值 - 预测值) / 实际值| * 100%
 * - **RMSE**（均方根误差）：√(Σ(实际值 - 预测值)² / n)
 * - **准确度**：100% - MAPE
 *
 * @param predictions - 预测数据点
 * @param actuals - 实际数据点
 * @returns 准确度指标
 *
 * @example
 * ```typescript
 * const predictions = [
 *   { date: '2027-01', score: 60, predicted: true },
 *   { date: '2027-02', score: 55, predicted: true }
 * ];
 *
 * const actuals = [
 *   { date: '2027-01', score: 62 },
 *   { date: '2027-02', score: 58 }
 * ];
 *
 * const accuracy = calculateAccuracy(predictions, actuals);
 * console.log(accuracy);
 * // {
 * //   mape: 4.36,      // 平均绝对百分比误差 4.36%
 * //   rmse: 2.55,      // 均方根误差 2.55分
 * //   accuracy: 95.64  // 准确度 95.64%
 * // }
 * ```
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
