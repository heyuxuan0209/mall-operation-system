import {
  MerchantSnapshot,
  RiskLevelChange,
  AssistanceArchive,
  HistoryTrendPoint,
} from '@/types';
import {
  getMerchantSnapshots,
  getMerchantRiskChanges,
  getSnapshotsByDateRange,
  getRecentSnapshots,
} from '@/data/history/mockHistoryData';

/**
 * 商户历史帮找档案服务类
 * 提供历史快照查询、风险变更追踪、档案摘要生成等功能
 */
class HistoryArchiveService {
  /**
   * 获取商户快照列表
   * @param merchantId 商户ID
   * @param options 查询选项
   */
  getSnapshots(
    merchantId: string,
    options?: {
      startDate?: string;
      endDate?: string;
      limit?: number;
      triggerType?: MerchantSnapshot['trigger']['type'];
    }
  ): MerchantSnapshot[] {
    let snapshots: MerchantSnapshot[] = [];

    // 如果指定了时间范围
    if (options?.startDate && options?.endDate) {
      snapshots = getSnapshotsByDateRange(merchantId, options.startDate, options.endDate);
    } else if (options?.limit) {
      snapshots = getRecentSnapshots(merchantId, options.limit);
    } else {
      snapshots = getMerchantSnapshots(merchantId);
    }

    // 按触发类型过滤
    if (options?.triggerType) {
      snapshots = snapshots.filter(s => s.trigger.type === options.triggerType);
    }

    return snapshots;
  }

  /**
   * 获取风险等级变更历史
   * @param merchantId 商户ID
   * @param limit 限制返回数量
   */
  getRiskChanges(merchantId: string, limit?: number): RiskLevelChange[] {
    const changes = getMerchantRiskChanges(merchantId);

    if (limit) {
      return changes.slice(-limit);
    }

    return changes;
  }

  /**
   * 生成商户帮扶档案摘要
   * @param merchantId 商户ID
   */
  generateArchive(merchantId: string): AssistanceArchive | null {
    const snapshots = getMerchantSnapshots(merchantId);
    const riskChanges = getMerchantRiskChanges(merchantId);

    if (snapshots.length === 0) {
      return null;
    }

    // 获取当前快照（最新的）
    const currentSnapshot = snapshots[snapshots.length - 1];

    // 统计数据
    const improvementCount = riskChanges.filter(c => c.changeType === 'upgrade').length;
    const deteriorationCount = riskChanges.filter(c => c.changeType === 'downgrade').length;
    const taskSnapshots = snapshots.filter(s =>
      s.trigger.type === 'task_created' || s.trigger.type === 'task_completed'
    );
    const completedTaskSnapshots = snapshots.filter(s => s.trigger.type === 'task_completed');
    const successRate = completedTaskSnapshots.length > 0
      ? Math.round((improvementCount / completedTaskSnapshots.length) * 100)
      : 0;

    // 健康度趋势
    const scores = snapshots.map(s => s.totalScore);
    const highest = snapshots.reduce((max, s) =>
      s.totalScore > max.totalScore ? s : max
    );
    const lowest = snapshots.reduce((min, s) =>
      s.totalScore < min.totalScore ? s : min
    );
    const average = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);

    // 近30天趋势
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentSnapshots = snapshots.filter(
      s => new Date(s.timestamp) >= thirtyDaysAgo
    );
    const recent30DaysTrend = this.calculateTrend(recentSnapshots);

    // 风险等级分布
    const riskDistribution = this.calculateRiskDistribution(snapshots);

    // 当前状态
    const lastRiskChange = riskChanges[riskChanges.length - 1];
    const daysInCurrentLevel = lastRiskChange
      ? this.calculateDaysDifference(lastRiskChange.timestamp, currentSnapshot.timestamp)
      : this.calculateDaysDifference(snapshots[0].timestamp, currentSnapshot.timestamp);

    // 关键时间节点
    const inspectionSnapshots = snapshots.filter(s => s.trigger.type === 'inspection');
    const lastInspectionDate = inspectionSnapshots.length > 0
      ? inspectionSnapshots[inspectionSnapshots.length - 1].timestamp
      : undefined;

    const lastTaskCompleted = completedTaskSnapshots.length > 0
      ? completedTaskSnapshots[completedTaskSnapshots.length - 1].timestamp
      : undefined;

    const longestHighRiskPeriod = this.calculateLongestHighRiskPeriod(snapshots, riskChanges);

    const archive: AssistanceArchive = {
      merchantId,
      merchantName: currentSnapshot.merchantName,
      stats: {
        totalSnapshots: snapshots.length,
        riskChangeCount: riskChanges.length,
        improvementCount,
        deteriorationCount,
        assistanceTaskCount: taskSnapshots.length,
        completedTaskCount: completedTaskSnapshots.length,
        successRate,
      },
      healthTrend: {
        highest: {
          score: highest.totalScore,
          date: highest.timestamp,
        },
        lowest: {
          score: lowest.totalScore,
          date: lowest.timestamp,
        },
        average,
        current: currentSnapshot.totalScore,
        recent30DaysTrend,
      },
      riskDistribution,
      currentStatus: {
        riskLevel: currentSnapshot.riskLevel,
        totalScore: currentSnapshot.totalScore,
        daysInCurrentLevel,
        lastChangeDate: lastRiskChange?.timestamp,
      },
      keyDates: {
        firstRecordDate: snapshots[0].timestamp,
        lastInspectionDate,
        lastTaskCompletedDate: lastTaskCompleted,
        longestHighRiskPeriod,
      },
      generatedAt: new Date().toISOString(),
    };

    return archive;
  }

  /**
   * 获取历史趋势数据（用于图表展示）
   * @param merchantId 商户ID
   * @param days 天数（默认90天）
   */
  getHistoryTrend(merchantId: string, days: number = 90): HistoryTrendPoint[] {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const snapshots = getMerchantSnapshots(merchantId).filter(
      s => new Date(s.timestamp) >= startDate
    );

    const trendPoints: HistoryTrendPoint[] = snapshots.map(snapshot => {
      const events: HistoryTrendPoint['events'] = [];

      // 添加事件标记
      if (snapshot.trigger.type === 'inspection') {
        events.push({
          type: 'inspection',
          label: '巡检',
          id: snapshot.inspectionId,
        });
      } else if (snapshot.trigger.type === 'task_created') {
        events.push({
          type: 'task_start',
          label: '任务开始',
          id: snapshot.taskId,
        });
      } else if (snapshot.trigger.type === 'task_completed') {
        events.push({
          type: 'task_complete',
          label: '任务完成',
          id: snapshot.taskId,
        });
      }

      // 检查是否有风险等级变化
      const riskChanges = getMerchantRiskChanges(merchantId);
      const riskChange = riskChanges.find(rc => rc.snapshotId === snapshot.id);
      if (riskChange) {
        events.push({
          type: 'risk_change',
          label: `风险${riskChange.changeType === 'upgrade' ? '降低' : '升高'}`,
          id: riskChange.id,
        });
      }

      return {
        date: snapshot.timestamp,
        totalScore: snapshot.totalScore,
        riskLevel: snapshot.riskLevel,
        metrics: snapshot.metrics,
        events: events.length > 0 ? events : undefined,
        snapshotId: snapshot.id,
      };
    });

    return trendPoints;
  }

  /**
   * 计算在某个风险等级停留的时长
   * @param merchantId 商户ID
   * @param riskLevel 风险等级
   */
  getTimeInRiskLevel(
    merchantId: string,
    riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'none'
  ): number {
    const snapshots = getMerchantSnapshots(merchantId);
    let totalDays = 0;
    let lastDate: Date | null = null;

    for (const snapshot of snapshots) {
      if (snapshot.riskLevel === riskLevel) {
        const currentDate = new Date(snapshot.timestamp);
        if (lastDate) {
          totalDays += this.calculateDaysDifference(lastDate.toISOString(), currentDate.toISOString());
        }
        lastDate = currentDate;
      } else {
        lastDate = null;
      }
    }

    return totalDays;
  }

  /**
   * 获取最佳和最差时期
   * @param merchantId 商户ID
   */
  getPeakAndTrough(merchantId: string): {
    peak: MerchantSnapshot | null;
    trough: MerchantSnapshot | null;
  } {
    const snapshots = getMerchantSnapshots(merchantId);

    if (snapshots.length === 0) {
      return { peak: null, trough: null };
    }

    const peak = snapshots.reduce((max, s) =>
      s.totalScore > max.totalScore ? s : max
    );

    const trough = snapshots.reduce((min, s) =>
      s.totalScore < min.totalScore ? s : min
    );

    return { peak, trough };
  }

  /**
   * 导出商户档案为JSON
   * @param merchantId 商户ID
   */
  exportArchive(merchantId: string): string {
    const snapshots = this.getSnapshots(merchantId);
    const riskChanges = this.getRiskChanges(merchantId);
    const archive = this.generateArchive(merchantId);

    const exportData = {
      merchantId,
      exportedAt: new Date().toISOString(),
      archive,
      snapshots,
      riskChanges,
    };

    return JSON.stringify(exportData, null, 2);
  }

  // ==================== 私有辅助方法 ====================

  /**
   * 计算趋势（改善/恶化/稳定）
   */
  private calculateTrend(
    snapshots: MerchantSnapshot[]
  ): 'improving' | 'declining' | 'stable' {
    if (snapshots.length < 2) return 'stable';

    const scores = snapshots.map(s => s.totalScore);
    const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
    const secondHalf = scores.slice(Math.floor(scores.length / 2));

    const firstAvg = firstHalf.reduce((sum, s) => sum + s, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, s) => sum + s, 0) / secondHalf.length;

    const delta = secondAvg - firstAvg;

    if (delta > 3) return 'improving';
    if (delta < -3) return 'declining';
    return 'stable';
  }

  /**
   * 计算风险等级分布
   */
  private calculateRiskDistribution(
    snapshots: MerchantSnapshot[]
  ): AssistanceArchive['riskDistribution'] {
    const distribution: AssistanceArchive['riskDistribution'] = {
      critical: { count: 0, totalDays: 0 },
      high: { count: 0, totalDays: 0 },
      medium: { count: 0, totalDays: 0 },
      low: { count: 0, totalDays: 0 },
      none: { count: 0, totalDays: 0 },
    };

    for (let i = 0; i < snapshots.length; i++) {
      const snapshot = snapshots[i];
      const level = snapshot.riskLevel;

      distribution[level].count += 1;

      // 计算停留天数（到下一个快照的时间）
      if (i < snapshots.length - 1) {
        const days = this.calculateDaysDifference(
          snapshot.timestamp,
          snapshots[i + 1].timestamp
        );
        distribution[level].totalDays += days;
      }
    }

    return distribution;
  }

  /**
   * 计算最长高风险期
   */
  private calculateLongestHighRiskPeriod(
    snapshots: MerchantSnapshot[],
    riskChanges: RiskLevelChange[]
  ): AssistanceArchive['keyDates']['longestHighRiskPeriod'] {
    let longestPeriod: {
      startDate: string;
      endDate: string;
      days: number;
    } | undefined;

    let currentPeriodStart: string | null = null;
    let maxDays = 0;

    for (let i = 0; i < snapshots.length; i++) {
      const snapshot = snapshots[i];
      const isHighRisk = snapshot.riskLevel === 'critical' || snapshot.riskLevel === 'high';

      if (isHighRisk && !currentPeriodStart) {
        // 进入高风险期
        currentPeriodStart = snapshot.timestamp;
      } else if (!isHighRisk && currentPeriodStart) {
        // 离开高风险期
        const days = this.calculateDaysDifference(currentPeriodStart, snapshot.timestamp);
        if (days > maxDays) {
          maxDays = days;
          longestPeriod = {
            startDate: currentPeriodStart,
            endDate: snapshot.timestamp,
            days,
          };
        }
        currentPeriodStart = null;
      }
    }

    // 如果当前仍在高风险期
    if (currentPeriodStart) {
      const lastSnapshot = snapshots[snapshots.length - 1];
      const days = this.calculateDaysDifference(currentPeriodStart, lastSnapshot.timestamp);
      if (days > maxDays) {
        longestPeriod = {
          startDate: currentPeriodStart,
          endDate: lastSnapshot.timestamp,
          days,
        };
      }
    }

    return longestPeriod;
  }

  /**
   * 计算两个日期之间的天数差
   */
  private calculateDaysDifference(startDate: string, endDate: string): number {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    return Math.floor((end - start) / (1000 * 60 * 60 * 24));
  }
}

// 导出单例
export const historyArchiveService = new HistoryArchiveService();

// 默认导出类（用于测试）
export default HistoryArchiveService;
