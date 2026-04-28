/**
 * 巡检诊断引擎
 * Sprint 3: 巡检后智能闭环
 *
 * 生成AI诊断报告，包括根因分析、趋势预测、行动计划和任务推荐
 */

import { Merchant, InspectionRecord } from '@/types';

/**
 * 根因分析结果
 */
export interface RootCause {
  issue: string; // 问题描述
  rootCause: string; // 根本原因
  evidence: string[]; // 支持证据
  confidence: number; // 置信度 0-100
  affectedDimensions: string[]; // 影响的维度
}

/**
 * 趋势分析结果
 */
export interface TrendAnalysis {
  dimension: string; // 维度名称
  trend: 'improving' | 'declining' | 'stable';
  currentScore: number;
  previousScore?: number;
  changeRate: number; // 变化率 ±%
  prediction: string; // 预测说明
}

/**
 * 行动计划项
 */
export interface ActionItem {
  what: string; // 做什么
  why: string; // 为什么
  how: string; // 怎么做
  when: string; // 什么时候
  who: string; // 谁负责
  priority: 'urgent' | 'important' | 'routine';
}

/**
 * 推荐任务
 */
export interface SuggestedTask {
  title: string;
  type: 'merchant_support' | 'facility_repair' | 'training';
  priority: 'P0' | 'P1' | 'P2';
  estimatedDuration: string; // "3-5天"
  measures: string[]; // 具体措施
  expectedImprovement: string; // 预期改善
  targetDimensions: string[]; // 目标改善维度
}

/**
 * AI诊断报告
 */
export interface InspectionDiagnosisReport {
  inspectionId: string;
  merchantId: string;
  merchantName: string;

  // 基础信息
  healthScoreChange: number;
  improvements: string[];
  concerns: string[];

  // AI诊断
  aiDiagnosis: {
    rootCauses: RootCause[];
    trendAnalysis: TrendAnalysis[];
    actionPlan: {
      urgent: ActionItem[];
      important: ActionItem[];
      routine: ActionItem[];
    };
    summary: string; // 诊断摘要
    riskAssessment: string; // 风险评估
  };

  // 任务推荐
  suggestedTasks: SuggestedTask[];

  createdAt: string;
}

/**
 * 生成诊断报告
 */
export function generateDiagnosisReport(
  inspection: InspectionRecord,
  merchant: Merchant,
  lastInspection?: InspectionRecord
): InspectionDiagnosisReport {
  // 1. 提取所有问题
  const allIssues = extractAllIssues(inspection);

  // 2. 根因分析
  const rootCauses = analyzeRootCauses(allIssues, merchant, inspection);

  // 3. 趋势分析
  const trends = analyzeTrends(inspection, lastInspection, merchant);

  // 4. 生成行动计划
  const actionPlan = generateActionPlan(rootCauses, trends);

  // 5. 推荐任务
  const suggestedTasks = matchTasksFromKnowledge(rootCauses, merchant);

  // 6. 生成摘要
  const summary = generateSummary(rootCauses, trends, merchant);
  const riskAssessment = generateRiskAssessment(rootCauses, trends, merchant);

  // 7. 计算健康度变化
  const healthScoreChange = lastInspection
    ? merchant.totalScore - (lastInspection.rating ? calculateAverageRating(lastInspection.rating) : merchant.totalScore)
    : 0;

  return {
    inspectionId: inspection.id,
    merchantId: merchant.id,
    merchantName: merchant.name,
    healthScoreChange,
    improvements: extractImprovements(inspection, rootCauses),
    concerns: extractConcerns(inspection, rootCauses),
    aiDiagnosis: {
      rootCauses,
      trendAnalysis: trends,
      actionPlan,
      summary,
      riskAssessment,
    },
    suggestedTasks,
    createdAt: new Date().toISOString(),
  };
}

/**
 * 提取所有问题
 */
function extractAllIssues(inspection: InspectionRecord): string[] {
  const issues: string[] = [];

  // 从照片中提取
  issues.push(...inspection.issues);

  // 从语音笔记中提取
  inspection.audioNotes.forEach(note => {
    const voiceNote = note as any; // 类型断言
    if (voiceNote.transcript) {
      // 简单关键词匹配
      const keywords = ['问题', '困难', '不好', '压力', '担心'];
      keywords.forEach(keyword => {
        if (voiceNote.transcript.includes(keyword)) {
          const sentences = voiceNote.transcript.split(/[。！？]/);
          const matchedSentence = sentences.find((s: string) => s.includes(keyword));
          if (matchedSentence) {
            issues.push(matchedSentence.trim());
          }
        }
      });
    }
  });

  // 从评分中推断
  if (inspection.rating && inspection.rating.ratings) {
    const ratings = inspection.rating.ratings;
    if (ratings.staffCondition < 50) {
      issues.push('员工状态不佳');
    }
    if (ratings.merchandiseDisplay < 50) {
      issues.push('货品陈列混乱');
    }
    if (ratings.storeEnvironment < 50) {
      issues.push('店面环境需改善');
    }
    if (ratings.managementCapability < 50) {
      issues.push('管理能力不足');
    }
    if (ratings.safetyCompliance < 50) {
      issues.push('安全合规问题');
    }
  }

  return [...new Set(issues)]; // 去重
}

/**
 * 根因分析
 */
function analyzeRootCauses(
  issues: string[],
  merchant: Merchant,
  inspection: InspectionRecord
): RootCause[] {
  const causes: RootCause[] = [];

  issues.forEach(issue => {
    const cause = inferRootCause(issue, merchant, inspection);
    if (cause) {
      causes.push(cause);
    }
  });

  // 去重并合并相似原因
  return consolidateCauses(causes);
}

/**
 * 推断根本原因
 */
function inferRootCause(
  issue: string,
  merchant: Merchant,
  inspection: InspectionRecord
): RootCause | null {
  const evidence: string[] = [issue];
  let rootCause = '';
  let confidence = 70;
  const affectedDimensions: string[] = [];

  // 基于问题类型推断根因
  if (issue.includes('员工') || issue.includes('人员')) {
    rootCause = '人员管理不足，缺乏有效培训和激励机制';
    affectedDimensions.push('人员状态');
    confidence = 75;
  } else if (issue.includes('陈列') || issue.includes('货品')) {
    rootCause = '商品管理流程不规范，缺乏标准化陈列指引';
    affectedDimensions.push('货品陈列');
    confidence = 80;
  } else if (issue.includes('卫生') || issue.includes('环境')) {
    rootCause = '清洁标准执行不到位，日常维护流程缺失';
    affectedDimensions.push('环境卫生');
    confidence = 85;
  } else if (issue.includes('租金') || issue.includes('压力')) {
    rootCause = '经营效益不佳，成本与收入失衡';
    affectedDimensions.push('财务健康');
    evidence.push(`租售比: ${merchant.rentToSalesRatio.toFixed(1)}%`);
    confidence = 90;
  } else {
    rootCause = '综合运营管理问题，需要系统性改善';
    affectedDimensions.push('整体运营');
    confidence = 65;
  }

  // 添加商户数据作为证据
  if (merchant.totalScore < 60) {
    evidence.push(`健康度仅${merchant.totalScore.toFixed(0)}分`);
  }

  return {
    issue,
    rootCause,
    evidence,
    confidence,
    affectedDimensions,
  };
}

/**
 * 合并相似根因
 */
function consolidateCauses(causes: RootCause[]): RootCause[] {
  // 简化版：按根因分组
  const grouped = new Map<string, RootCause>();

  causes.forEach(cause => {
    if (grouped.has(cause.rootCause)) {
      const existing = grouped.get(cause.rootCause)!;
      existing.evidence.push(...cause.evidence);
      existing.affectedDimensions.push(...cause.affectedDimensions);
      existing.confidence = Math.max(existing.confidence, cause.confidence);
    } else {
      grouped.set(cause.rootCause, { ...cause });
    }
  });

  return Array.from(grouped.values()).map(cause => ({
    ...cause,
    evidence: [...new Set(cause.evidence)],
    affectedDimensions: [...new Set(cause.affectedDimensions)],
  }));
}

/**
 * 趋势分析
 */
function analyzeTrends(
  current: InspectionRecord,
  last: InspectionRecord | undefined,
  merchant: Merchant
): TrendAnalysis[] {
  if (!current.rating || !last || !last.rating) {
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
    const currentScore = (current.rating!.ratings as any)[dim.key] || 0;
    const previousScore = (last.rating!.ratings as any)[dim.key] || 0;
    const changeRate = previousScore > 0 ? ((currentScore - previousScore) / previousScore) * 100 : 0;

    let trend: 'improving' | 'declining' | 'stable';
    if (changeRate > 5) trend = 'improving';
    else if (changeRate < -5) trend = 'declining';
    else trend = 'stable';

    const prediction = generatePrediction(trend, currentScore, changeRate);

    return {
      dimension: dim.name,
      trend,
      currentScore,
      previousScore,
      changeRate: Math.round(changeRate * 10) / 10,
      prediction,
    };
  });
}

/**
 * 生成预测
 */
function generatePrediction(trend: string, currentScore: number, changeRate: number): string {
  if (trend === 'improving') {
    return `持续改善中，预计2周内可提升至${Math.min(100, currentScore + 10).toFixed(0)}分以上`;
  } else if (trend === 'declining') {
    return `持续下降中，预计2周内可能降至${Math.max(0, currentScore - 10).toFixed(0)}分以下`;
  } else {
    return '保持稳定，建议继续维持当前管理水平';
  }
}

/**
 * 生成行动计划
 */
function generateActionPlan(
  rootCauses: RootCause[],
  trends: TrendAnalysis[]
): {
  urgent: ActionItem[];
  important: ActionItem[];
  routine: ActionItem[];
} {
  const urgent: ActionItem[] = [];
  const important: ActionItem[] = [];
  const routine: ActionItem[] = [];

  // 基于根因生成行动
  rootCauses.forEach(cause => {
    if (cause.confidence > 80) {
      urgent.push(createActionFromCause(cause, 'urgent'));
    } else if (cause.confidence > 65) {
      important.push(createActionFromCause(cause, 'important'));
    } else {
      routine.push(createActionFromCause(cause, 'routine'));
    }
  });

  // 基于趋势生成行动
  trends.forEach(trend => {
    if (trend.trend === 'declining' && trend.currentScore < 50) {
      urgent.push({
        what: `改善${trend.dimension}`,
        why: `${trend.dimension}持续下降，当前仅${trend.currentScore.toFixed(0)}分`,
        how: '制定专项改善计划，落实责任人',
        when: '立即执行',
        who: '运营经理',
        priority: 'urgent',
      });
    }
  });

  return { urgent, important, routine };
}

/**
 * 从根因创建行动项
 */
function createActionFromCause(cause: RootCause, priority: 'urgent' | 'important' | 'routine'): ActionItem {
  const timeMap = {
    urgent: '立即执行',
    important: '本周内',
    routine: '本月内',
  };

  return {
    what: `解决${cause.affectedDimensions[0]}问题`,
    why: cause.rootCause,
    how: '创建帮扶任务，制定详细改善措施',
    when: timeMap[priority],
    who: priority === 'urgent' ? '运营经理' : '运营专员',
    priority,
  };
}

/**
 * 匹配知识库推荐任务
 */
function matchTasksFromKnowledge(rootCauses: RootCause[], merchant: Merchant): SuggestedTask[] {
  const tasks: SuggestedTask[] = [];

  rootCauses.forEach(cause => {
    const task = createTaskFromCause(cause, merchant);
    if (task) {
      tasks.push(task);
    }
  });

  return tasks.slice(0, 5); // 最多推荐5个任务
}

/**
 * 从根因创建任务
 */
function createTaskFromCause(cause: RootCause, merchant: Merchant): SuggestedTask | null {
  const priority = cause.confidence > 80 ? 'P0' : cause.confidence > 65 ? 'P1' : 'P2';

  // 根据问题类型匹配措施
  let measures: string[] = [];
  let type: 'merchant_support' | 'facility_repair' | 'training' = 'merchant_support';

  if (cause.issue.includes('员工') || cause.issue.includes('培训')) {
    type = 'training';
    measures = [
      '组织员工服务培训',
      '制定服务标准和考核机制',
      '建立激励制度提升积极性',
    ];
  } else if (cause.issue.includes('设施') || cause.issue.includes('维修')) {
    type = 'facility_repair';
    measures = [
      '排查设施设备问题',
      '制定维修计划并执行',
      '建立设施定期巡检机制',
    ];
  } else {
    type = 'merchant_support';
    measures = [
      '与商户深入沟通，明确问题',
      '制定针对性改善方案',
      '定期跟进执行情况',
      '评估改善效果',
    ];
  }

  return {
    title: `改善${cause.affectedDimensions.join('、')}`,
    type,
    priority,
    estimatedDuration: priority === 'P0' ? '3-5天' : priority === 'P1' ? '1-2周' : '2-4周',
    measures,
    expectedImprovement: `预计提升${cause.affectedDimensions.join('、')}指标10-20分`,
    targetDimensions: cause.affectedDimensions,
  };
}

/**
 * 生成诊断摘要
 */
function generateSummary(rootCauses: RootCause[], trends: TrendAnalysis[], merchant: Merchant): string {
  const parts: string[] = [];

  parts.push(`商户${merchant.name}健康度${merchant.totalScore.toFixed(0)}分`);

  if (rootCauses.length > 0) {
    parts.push(`主要问题：${rootCauses[0].rootCause}`);
  }

  const declining = trends.filter(t => t.trend === 'declining');
  if (declining.length > 0) {
    parts.push(`${declining.map(t => t.dimension).join('、')}呈下降趋势`);
  }

  return parts.join('。') + '。';
}

/**
 * 生成风险评估
 */
function generateRiskAssessment(rootCauses: RootCause[], trends: TrendAnalysis[], merchant: Merchant): string {
  if (merchant.totalScore < 40 || rootCauses.some(c => c.confidence > 85)) {
    return '高风险：需要立即采取措施，建议运营经理亲自跟进';
  } else if (merchant.totalScore < 60 || rootCauses.length > 2) {
    return '中风险：需要制定改善计划，定期跟踪进度';
  } else {
    return '低风险：保持常规巡检，关注重点维度';
  }
}

/**
 * 提取改善点
 */
function extractImprovements(inspection: InspectionRecord, rootCauses: RootCause[]): string[] {
  const improvements: string[] = [];

  if (inspection.rating) {
    const ratings = inspection.rating.ratings;
    if (ratings.staffCondition >= 80) improvements.push('员工状态良好');
    if (ratings.merchandiseDisplay >= 80) improvements.push('货品陈列整齐');
    if (ratings.storeEnvironment >= 80) improvements.push('环境卫生良好');
  }

  if (improvements.length === 0) {
    improvements.push('已完成本次巡检记录');
  }

  return improvements;
}

/**
 * 提取关注点
 */
function extractConcerns(inspection: InspectionRecord, rootCauses: RootCause[]): string[] {
  return rootCauses.map(c => c.issue);
}

/**
 * 计算平均评分
 */
function calculateAverageRating(rating: any): number {
  const ratings = rating.ratings;
  return (
    ratings.staffCondition +
    ratings.merchandiseDisplay +
    ratings.storeEnvironment +
    ratings.managementCapability +
    ratings.safetyCompliance
  ) / 5;
}
