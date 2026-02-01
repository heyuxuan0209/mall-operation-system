import { MerchantSnapshot, RiskLevelChange } from '@/types';
import { mockMerchants } from '../merchants/mock-data';
import { mockTasks } from '../tasks/mock-data';

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

  // ⭐ 获取该商户的真实帮扶任务
  const merchantTasks = mockTasks.filter(t => t.merchantId === merchantId);

  // ⭐ 为每个任务创建快照（任务创建时和完成时）
  merchantTasks.forEach(task => {
    // 任务创建时的快照
    const initialMetrics = task.beforeMetrics || task.initialMetrics;
    if (initialMetrics) {
      const initialTotalScore = Math.round(
        (initialMetrics.collection + initialMetrics.operational + initialMetrics.siteQuality +
         initialMetrics.customerReview + initialMetrics.riskResistance) / 5
      );

      snapshots.push({
        id: `SNAP-${task.id}-START`,
        merchantId: merchant.id,
        merchantName: merchant.name,
        timestamp: task.createdAt,
        totalScore: initialTotalScore,
        riskLevel: calculateRiskLevel(initialTotalScore),
        metrics: { ...initialMetrics },
        revenue: merchant.lastMonthRevenue * 0.9, // 帮扶前营收较低
        rentToSalesRatio: merchant.rentToSalesRatio * 1.1, // 帮扶前租售比较高
        trigger: {
          type: 'task_created',
          sourceId: task.id,
          description: `创建帮扶任务：${task.title}`,
        },
        taskId: task.id,
        createdAt: task.createdAt,
      });
    }

    // 任务完成时的快照（仅已完成的任务）
    if (task.status === 'completed' && task.afterMetrics) {
      const afterTotalScore = Math.round(
        (task.afterMetrics.collection + task.afterMetrics.operational + task.afterMetrics.siteQuality +
         task.afterMetrics.customerReview + task.afterMetrics.riskResistance) / 5
      );

      snapshots.push({
        id: `SNAP-${task.id}-END`,
        merchantId: merchant.id,
        merchantName: merchant.name,
        timestamp: task.updatedAt,
        totalScore: afterTotalScore,
        riskLevel: calculateRiskLevel(afterTotalScore),
        metrics: { ...task.afterMetrics },
        revenue: merchant.lastMonthRevenue * 0.95, // 帮扶后营收改善
        rentToSalesRatio: merchant.rentToSalesRatio * 1.05, // 帮扶后租售比改善
        trigger: {
          type: 'task_completed',
          sourceId: task.id,
          description: `完成帮扶任务：${task.title}`,
        },
        taskId: task.id,
        createdAt: task.updatedAt,
      });
    }

    // 任务执行中的快照（基于 executionTimeline）
    if (task.executionTimeline) {
      task.executionTimeline
        .filter(item => item.status === 'completed')
        .forEach((item, index) => {
          // 计算中间状态的指标（在 before 和 after 之间插值）
          const initialMetrics = task.beforeMetrics || task.initialMetrics;
          const afterMetrics = task.afterMetrics;

          if (initialMetrics && afterMetrics) {
            const progress = (index + 1) / (task.executionTimeline?.length || 1);
            const interpolatedMetrics = {
              collection: Math.round(initialMetrics.collection + (afterMetrics.collection - initialMetrics.collection) * progress),
              operational: Math.round(initialMetrics.operational + (afterMetrics.operational - initialMetrics.operational) * progress),
              siteQuality: Math.round(initialMetrics.siteQuality + (afterMetrics.siteQuality - initialMetrics.siteQuality) * progress),
              customerReview: Math.round(initialMetrics.customerReview + (afterMetrics.customerReview - initialMetrics.customerReview) * progress),
              riskResistance: Math.round(initialMetrics.riskResistance + (afterMetrics.riskResistance - initialMetrics.riskResistance) * progress),
            };

            const interpolatedScore = Math.round(
              (interpolatedMetrics.collection + interpolatedMetrics.operational + interpolatedMetrics.siteQuality +
               interpolatedMetrics.customerReview + interpolatedMetrics.riskResistance) / 5
            );

            snapshots.push({
              id: `SNAP-${task.id}-EXEC-${index}`,
              merchantId: merchant.id,
              merchantName: merchant.name,
              timestamp: item.date,
              totalScore: interpolatedScore,
              riskLevel: calculateRiskLevel(interpolatedScore),
              metrics: interpolatedMetrics,
              revenue: merchant.lastMonthRevenue * (0.9 + progress * 0.05),
              rentToSalesRatio: merchant.rentToSalesRatio * (1.1 - progress * 0.05),
              trigger: {
                type: 'manual',
                description: `里程碑完成：${item.milestone}`,
              },
              taskId: task.id,
              createdAt: item.date,
            });
          }
        });
    }
  });

  // ⭐ 生成巡检快照（填充时间间隙）
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - monthsBack);

  for (let i = 0; i < 10; i++) {
    const daysAgo = Math.floor(Math.random() * (monthsBack * 30));
    const inspectionDate = new Date();
    inspectionDate.setDate(inspectionDate.getDate() - daysAgo);

    // 避免与任务快照时间冲突
    const hasConflict = snapshots.some(s => {
      const diff = Math.abs(new Date(s.timestamp).getTime() - inspectionDate.getTime());
      return diff < 24 * 60 * 60 * 1000; // 1天内
    });

    if (!hasConflict) {
      const baseScore = merchant.totalScore + (Math.random() - 0.5) * 10;
      const totalScore = Math.max(0, Math.min(100, baseScore));

      snapshots.push({
        id: `SNAP-${merchantId}-INSP-${i}`,
        merchantId: merchant.id,
        merchantName: merchant.name,
        timestamp: inspectionDate.toISOString(),
        totalScore: Math.round(totalScore),
        riskLevel: calculateRiskLevel(totalScore),
        metrics: generateMetrics(totalScore, 8),
        revenue: merchant.lastMonthRevenue * (0.85 + Math.random() * 0.3),
        rentToSalesRatio: merchant.rentToSalesRatio * (0.9 + Math.random() * 0.2),
        trigger: {
          type: 'inspection',
          sourceId: `INSP-${merchantId}-${i}`,
          description: '现场巡检完成',
        },
        inspectionId: `INSP-${merchantId}-${i}`,
        createdAt: inspectionDate.toISOString(),
      });
    }
  }

  // ⭐ 确保最后一个快照与商户当前状态完全一致
  snapshots.push({
    id: `SNAP-${merchantId}-CURRENT`,
    merchantId: merchant.id,
    merchantName: merchant.name,
    timestamp: merchant.updatedAt,
    totalScore: merchant.totalScore,
    riskLevel: merchant.riskLevel,
    metrics: { ...merchant.metrics },
    revenue: merchant.lastMonthRevenue,
    rentToSalesRatio: merchant.rentToSalesRatio,
    trigger: {
      type: 'manual',
      description: '当前状态快照',
    },
    createdAt: merchant.updatedAt,
  });

  // 按时间排序
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
