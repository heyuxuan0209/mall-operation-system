import { MerchantSnapshot, RiskLevelChange } from '@/types';
import { mockMerchants } from '../merchants/mock-data';

// ==================== 辅助函数 ====================

// 生成随机日期（在指定天数范围内）
function getRandomDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
}

// 生成随机评分变化（基于基准分数）
function generateScoreVariation(baseScore: number, variation: number): number {
  const delta = (Math.random() - 0.5) * variation * 2;
  return Math.max(0, Math.min(100, baseScore + delta));
}

// 根据评分计算风险等级
function calculateRiskLevel(score: number): 'critical' | 'high' | 'medium' | 'low' | 'none' {
  if (score >= 90) return 'none';
  if (score >= 80) return 'low';
  if (score >= 70) return 'medium';
  if (score >= 60) return 'high';
  return 'critical';
}

// 生成5维度指标（基于总分）
function generateMetrics(totalScore: number, variation: number = 5) {
  const base = totalScore;
  return {
    collection: generateScoreVariation(base, variation),
    operational: generateScoreVariation(base, variation),
    siteQuality: generateScoreVariation(base, variation),
    customerReview: generateScoreVariation(base, variation),
    riskResistance: generateScoreVariation(base, variation),
  };
}

// ==================== 生成历史快照 ====================

// 为单个商户生成历史快照
function generateMerchantSnapshots(merchantId: string, monthsBack: number = 6): MerchantSnapshot[] {
  const merchant = mockMerchants.find(m => m.id === merchantId);
  if (!merchant) return [];

  const snapshots: MerchantSnapshot[] = [];
  const snapshotsCount = Math.floor(Math.random() * 15) + 20; // 20-35个快照
  const currentScore = merchant.totalScore;

  // 生成从过去到现在的快照（评分逐渐改善或恶化）
  for (let i = snapshotsCount - 1; i >= 0; i--) {
    const daysAgo = Math.floor((i / snapshotsCount) * (monthsBack * 30));

    // 生成评分趋势（基于当前评分和历史位置）
    let baseScore: number;
    if (merchant.riskLevel === 'high' || merchant.riskLevel === 'critical') {
      // 高风险商户：从更低的分数逐渐改善
      baseScore = currentScore - (i / snapshotsCount) * 20;
    } else if (merchant.riskLevel === 'none' || merchant.riskLevel === 'low') {
      // 低风险商户：从稍低的分数逐渐改善
      baseScore = currentScore - (i / snapshotsCount) * 10;
    } else {
      // 中风险商户：波动较大
      baseScore = currentScore + (Math.random() - 0.5) * 15;
    }

    const totalScore = Math.max(0, Math.min(100, baseScore + (Math.random() - 0.5) * 8));
    const riskLevel = calculateRiskLevel(totalScore);

    // 确定触发类型
    let triggerType: MerchantSnapshot['trigger']['type'] = 'manual';
    let sourceId: string | undefined;

    if (i % 4 === 0) {
      triggerType = 'inspection';
      sourceId = `INSP-${merchantId}-${i}`;
    } else if (i % 7 === 0) {
      triggerType = 'task_completed';
      sourceId = `TASK-${merchantId}-${Math.floor(i / 7)}`;
    } else if (i % 10 === 0) {
      triggerType = 'task_created';
      sourceId = `TASK-${merchantId}-${Math.floor(i / 10)}`;
    }

    snapshots.push({
      id: `SNAP-${merchantId}-${String(i).padStart(3, '0')}`,
      merchantId: merchant.id,
      merchantName: merchant.name,
      timestamp: getRandomDate(daysAgo),
      totalScore: Math.round(totalScore),
      riskLevel,
      metrics: generateMetrics(totalScore),
      revenue: merchant.lastMonthRevenue * (0.8 + Math.random() * 0.4),
      rentToSalesRatio: merchant.rentToSalesRatio * (0.9 + Math.random() * 0.2),
      trigger: {
        type: triggerType,
        sourceId,
        description: getTriggerDescription(triggerType),
      },
      inspectionId: triggerType === 'inspection' ? sourceId : undefined,
      taskId: triggerType.includes('task') ? sourceId : undefined,
      createdAt: getRandomDate(daysAgo),
    });
  }

  return snapshots.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

function getTriggerDescription(type: MerchantSnapshot['trigger']['type']): string {
  const descriptions = {
    inspection: '现场巡检完成',
    task_created: '帮扶任务创建',
    task_completed: '帮扶任务完成',
    manual: '手动记录',
    risk_change: '风险等级变化',
  };
  return descriptions[type];
}

// ==================== 生成风险等级变更记录 ====================

// 从快照中提取风险等级变更
function generateRiskLevelChanges(snapshots: MerchantSnapshot[]): RiskLevelChange[] {
  const changes: RiskLevelChange[] = [];

  for (let i = 1; i < snapshots.length; i++) {
    const prev = snapshots[i - 1];
    const curr = snapshots[i];

    // 检测风险等级是否变化
    if (prev.riskLevel !== curr.riskLevel) {
      const changeType = getRiskChangeType(prev.riskLevel, curr.riskLevel);

      changes.push({
        id: `RCHG-${curr.merchantId}-${String(changes.length).padStart(3, '0')}`,
        merchantId: curr.merchantId,
        merchantName: curr.merchantName,
        timestamp: curr.timestamp,
        fromLevel: prev.riskLevel,
        toLevel: curr.riskLevel,
        changeType,
        fromScore: prev.totalScore,
        toScore: curr.totalScore,
        scoreDelta: curr.totalScore - prev.totalScore,
        trigger: {
          type: curr.trigger.type === 'manual' ? 'auto_detect' : curr.trigger.type,
          sourceId: curr.trigger.sourceId,
          description: `风险等级从${getRiskLevelLabel(prev.riskLevel)}变为${getRiskLevelLabel(curr.riskLevel)}`,
        },
        snapshotId: curr.id,
        taskId: curr.taskId,
        inspectionId: curr.inspectionId,
        createdAt: curr.createdAt,
      });
    }
  }

  return changes;
}

// 判断风险等级变化类型
function getRiskChangeType(
  fromLevel: 'critical' | 'high' | 'medium' | 'low' | 'none',
  toLevel: 'critical' | 'high' | 'medium' | 'low' | 'none'
): 'upgrade' | 'downgrade' | 'stable' {
  const levels = ['critical', 'high', 'medium', 'low', 'none'];
  const fromIndex = levels.indexOf(fromLevel);
  const toIndex = levels.indexOf(toLevel);

  if (fromIndex < toIndex) return 'upgrade'; // 风险降低（改善）
  if (fromIndex > toIndex) return 'downgrade'; // 风险升高（恶化）
  return 'stable';
}

// 获取风险等级中文标签
function getRiskLevelLabel(level: string): string {
  const labels: Record<string, string> = {
    critical: '极高风险',
    high: '高风险',
    medium: '中风险',
    low: '低风险',
    none: '无风险',
  };
  return labels[level] || level;
}

// ==================== 生成所有商户的历史数据 ====================

// 生成所有快照数据
const allSnapshots: Map<string, MerchantSnapshot[]> = new Map();
mockMerchants.forEach(merchant => {
  const snapshots = generateMerchantSnapshots(merchant.id, 6);
  allSnapshots.set(merchant.id, snapshots);
});

// 生成所有风险变更记录
const allRiskChanges: Map<string, RiskLevelChange[]> = new Map();
allSnapshots.forEach((snapshots, merchantId) => {
  const changes = generateRiskLevelChanges(snapshots);
  allRiskChanges.set(merchantId, changes);
});

// ==================== 导出数据 ====================

/**
 * 获取指定商户的历史快照
 */
export function getMerchantSnapshots(merchantId: string): MerchantSnapshot[] {
  return allSnapshots.get(merchantId) || [];
}

/**
 * 获取指定商户的风险等级变更记录
 */
export function getMerchantRiskChanges(merchantId: string): RiskLevelChange[] {
  return allRiskChanges.get(merchantId) || [];
}

/**
 * 获取所有商户的快照数据
 */
export function getAllSnapshots(): Map<string, MerchantSnapshot[]> {
  return allSnapshots;
}

/**
 * 获取所有商户的风险变更记录
 */
export function getAllRiskChanges(): Map<string, RiskLevelChange[]> {
  return allRiskChanges;
}

/**
 * 获取指定时间范围内的快照
 */
export function getSnapshotsByDateRange(
  merchantId: string,
  startDate: string,
  endDate: string
): MerchantSnapshot[] {
  const snapshots = getMerchantSnapshots(merchantId);
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();

  return snapshots.filter(s => {
    const timestamp = new Date(s.timestamp).getTime();
    return timestamp >= start && timestamp <= end;
  });
}

/**
 * 获取最新的N个快照
 */
export function getRecentSnapshots(merchantId: string, limit: number = 10): MerchantSnapshot[] {
  const snapshots = getMerchantSnapshots(merchantId);
  return snapshots.slice(-limit);
}

// 导出模拟数据统计
export const mockHistoryStats = {
  totalMerchants: mockMerchants.length,
  totalSnapshots: Array.from(allSnapshots.values()).reduce((sum, arr) => sum + arr.length, 0),
  totalRiskChanges: Array.from(allRiskChanges.values()).reduce((sum, arr) => sum + arr.length, 0),
  averageSnapshotsPerMerchant: Math.round(
    Array.from(allSnapshots.values()).reduce((sum, arr) => sum + arr.length, 0) / mockMerchants.length
  ),
};
