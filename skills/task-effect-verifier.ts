/**
 * 任务效果验证器
 * Sprint 3: 巡检后智能闭环
 *
 * 自动对比巡检前后数据，验证帮扶任务效果
 */

import { Merchant, InspectionRecord } from '@/types';

/**
 * 指标对比结果
 */
export interface MetricsComparison {
  dimension: string;
  before: number;
  after: number;
  change: number;
  changePercent: number;
  verdict: 'improved' | 'unchanged' | 'worsened';
}

/**
 * 照片对比分析
 */
export interface PhotoComparison {
  beforePhotos: any[];
  afterPhotos: any[];
  aiAnalysis: string;
  improvementAreas: string[];
}

/**
 * 任务效果验证结果
 */
export interface TaskEffectVerification {
  taskId: string;
  merchantId: string;
  merchantName: string;

  // 巡检关联
  relatedInspectionId: string; // 帮扶前巡检
  beforeMetrics: any;
  afterInspectionId?: string; // 验证巡检
  afterMetrics?: any;

  // 验证状态
  verificationStatus: 'pending' | 'improved' | 'unchanged' | 'worsened';

  // AI验证分析
  aiVerification: {
    metricsComparison: MetricsComparison[];
    photoComparison?: PhotoComparison;
    overallConclusion: string;
    suggestedNextSteps: string[];
    effectivenessScore: number; // 0-100，措施有效性评分
  };

  verifiedAt?: string;
}

/**
 * 验证任务效果
 */
export function verifyTaskEffect(
  taskId: string,
  beforeInspection: InspectionRecord,
  afterInspection: InspectionRecord,
  merchant: Merchant
): TaskEffectVerification {
  // 1. 对比指标
  const metricsComparison = compareMetrics(beforeInspection, afterInspection);

  // 2. 对比照片
  const photoComparison = comparePhotos(beforeInspection, afterInspection);

  // 3. 综合判断
  const verdict = judgeOverallEffect(metricsComparison);

  // 4. 计算有效性评分
  const effectivenessScore = calculateEffectivenessScore(metricsComparison);

  // 5. 生成结论和建议
  const conclusion = generateConclusion(verdict, metricsComparison, effectivenessScore);
  const nextSteps = suggestNextSteps(verdict, metricsComparison);

  return {
    taskId,
    merchantId: merchant.id,
    merchantName: merchant.name,
    relatedInspectionId: beforeInspection.id,
    beforeMetrics: beforeInspection.rating,
    afterInspectionId: afterInspection.id,
    afterMetrics: afterInspection.rating,
    verificationStatus: verdict,
    aiVerification: {
      metricsComparison,
      photoComparison,
      overallConclusion: conclusion,
      suggestedNextSteps: nextSteps,
      effectivenessScore,
    },
    verifiedAt: new Date().toISOString(),
  };
}

/**
 * 对比指标
 */
function compareMetrics(
  before: InspectionRecord,
  after: InspectionRecord
): MetricsComparison[] {
  if (!before.rating || !after.rating) {
    return [];
  }

  const dimensions = [
    { key: 'staffCondition', name: '员工状态' },
    { key: 'merchandiseDisplay', name: '货品陈列' },
    { key: 'storeEnvironment', name: '卖场环境' },
    { key: 'managementCapability', name: '管理能力' },
    { key: 'safetyCompliance', name: '安全合规' },
  ];

  return dimensions.map(dim => {
    const beforeScore = (before.rating!.ratings as any)[dim.key] || 0;
    const afterScore = (after.rating!.ratings as any)[dim.key] || 0;
    const change = afterScore - beforeScore;
    const changePercent = beforeScore > 0 ? (change / beforeScore) * 100 : 0;

    let verdict: 'improved' | 'unchanged' | 'worsened';
    if (change > 5) verdict = 'improved';
    else if (change < -5) verdict = 'worsened';
    else verdict = 'unchanged';

    return {
      dimension: dim.name,
      before: beforeScore,
      after: afterScore,
      change: Math.round(change * 10) / 10,
      changePercent: Math.round(changePercent * 10) / 10,
      verdict,
    };
  });
}

/**
 * 对比照片
 */
function comparePhotos(
  before: InspectionRecord,
  after: InspectionRecord
): PhotoComparison {
  const improvementAreas: string[] = [];

  // 简单对比照片数量和问题等级
  const beforeCritical = before.photos.filter((p: any) => p.issueLevel === 'critical').length;
  const afterCritical = after.photos.filter((p: any) => p.issueLevel === 'critical').length;

  if (afterCritical < beforeCritical) {
    improvementAreas.push('严重问题数量减少');
  }

  const beforeWarning = before.photos.filter((p: any) => p.issueLevel === 'warning').length;
  const afterWarning = after.photos.filter((p: any) => p.issueLevel === 'warning').length;

  if (afterWarning < beforeWarning) {
    improvementAreas.push('警告问题数量减少');
  }

  const analysis = generatePhotoAnalysis(before.photos, after.photos, improvementAreas);

  return {
    beforePhotos: before.photos,
    afterPhotos: after.photos,
    aiAnalysis: analysis,
    improvementAreas,
  };
}

/**
 * 生成照片分析
 */
function generatePhotoAnalysis(
  beforePhotos: any[],
  afterPhotos: any[],
  improvements: string[]
): string {
  if (improvements.length > 0) {
    return `通过照片对比发现：${improvements.join('，')}。现场改善效果明显。`;
  } else if (afterPhotos.length > beforePhotos.length) {
    return '本次巡检采集了更多照片，记录更详细。';
  } else {
    return '照片记录完整，建议持续关注现场状态。';
  }
}

/**
 * 综合判断效果
 */
function judgeOverallEffect(metricsComparison: MetricsComparison[]): 'improved' | 'unchanged' | 'worsened' {
  const improved = metricsComparison.filter(m => m.verdict === 'improved').length;
  const worsened = metricsComparison.filter(m => m.verdict === 'worsened').length;

  if (improved > worsened && improved >= 2) {
    return 'improved';
  } else if (worsened > improved) {
    return 'worsened';
  } else {
    return 'unchanged';
  }
}

/**
 * 计算有效性评分
 */
function calculateEffectivenessScore(metricsComparison: MetricsComparison[]): number {
  if (metricsComparison.length === 0) return 50;

  const totalChange = metricsComparison.reduce((sum, m) => sum + m.change, 0);
  const avgChange = totalChange / metricsComparison.length;

  // 转换为0-100分
  // avgChange范围通常在-20到+20之间
  const score = Math.max(0, Math.min(100, 50 + avgChange * 2.5));

  return Math.round(score);
}

/**
 * 生成结论
 */
function generateConclusion(
  verdict: string,
  metricsComparison: MetricsComparison[],
  effectivenessScore: number
): string {
  const improvedDimensions = metricsComparison.filter(m => m.verdict === 'improved');

  if (verdict === 'improved') {
    return `帮扶措施有效（有效性评分：${effectivenessScore}分）。${improvedDimensions.map(m => m.dimension).join('、')}有明显改善，建议继续保持。`;
  } else if (verdict === 'worsened') {
    return `帮扶措施效果不佳（有效性评分：${effectivenessScore}分）。需要重新评估措施，调整帮扶方案。`;
  } else {
    return `帮扶措施效果一般（有效性评分：${effectivenessScore}分）。建议延长帮扶周期，加强执行力度。`;
  }
}

/**
 * 建议下一步行动
 */
function suggestNextSteps(
  verdict: string,
  metricsComparison: MetricsComparison[]
): string[] {
  const steps: string[] = [];

  if (verdict === 'improved') {
    steps.push('将有效措施沉淀到知识库');
    steps.push('定期复查，确保改善效果持续');
    steps.push('推广成功经验到其他类似商户');
  } else if (verdict === 'worsened') {
    steps.push('立即与商户沟通，了解恶化原因');
    steps.push('重新制定帮扶方案');
    steps.push('考虑升级到更高层级处理');
  } else {
    steps.push('延长帮扶周期，加强执行力度');
    steps.push('增加巡检频率，密切跟踪');
    steps.push('调整部分措施，提升针对性');
  }

  // 基于具体维度添加建议
  const worsened = metricsComparison.filter(m => m.verdict === 'worsened');
  if (worsened.length > 0) {
    steps.push(`重点关注${worsened.map(m => m.dimension).join('、')}维度`);
  }

  return steps;
}

/**
 * 生成效果验证摘要（用于任务详情展示）
 */
export function generateVerificationSummary(verification: TaskEffectVerification): string {
  const { metricsComparison, effectivenessScore } = verification.aiVerification;

  const improved = metricsComparison.filter(m => m.verdict === 'improved').length;
  const total = metricsComparison.length;

  return `${improved}/${total} 个维度改善，有效性评分 ${effectivenessScore}分`;
}
