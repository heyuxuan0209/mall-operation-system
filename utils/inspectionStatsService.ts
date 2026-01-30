import { InspectionStats, InspectionRecord, Merchant, OverdueMerchant, InspectionTrendData, InspectionPolicy } from '@/types';
import { inspectionPolicyService } from './inspectionPolicyService';

/**
 * 巡检统计服务
 * 职责：
 * - 计算各类统计数据（完成率、覆盖率、超期等）
 * - 筛选时间范围内的记录（今日/本周/本月）
 * - 判断商户是否超期
 * - 生成趋势数据
 */
class InspectionStatsService {
  private readonly RECORDS_KEY = 'inspection_records';
  private readonly MERCHANTS_KEY = 'merchants';

  /**
   * 计算统计数据
   */
  calculateStats(period: 'today' | 'week' | 'month'): InspectionStats {
    const merchants = this.getMerchants();
    const allRecords = this.getRecords();
    const periodRecords = this.filterRecordsByPeriod(allRecords, period);
    const policies = inspectionPolicyService.getAllPolicies().filter(p => p.enabled);

    const periodLabel = this.getPeriodLabel(period);
    const totalMerchants = merchants.length;

    // 计算应巡检商户数
    const requiredInspections = this.calculateRequiredInspections(merchants, policies, period);

    // 计算已完成巡检商户数（去重）
    const inspectedMerchantIds = new Set(periodRecords.map(r => r.merchantId));
    const completedInspections = inspectedMerchantIds.size;

    // 计算完成率
    const completionRate = requiredInspections > 0
      ? Math.round((completedInspections / requiredInspections) * 100)
      : 0;

    // 计算超期商户数
    const overdueMerchants = this.getOverdueMerchants(period);
    const overdueCount = overdueMerchants.length;

    // 按风险等级统计
    const byRiskLevel = this.calculateByRiskLevel(merchants, periodRecords, policies, period);

    // 按巡检员统计
    const byInspector = this.calculateByInspector(periodRecords);

    return {
      period,
      periodLabel,
      totalMerchants,
      requiredInspections,
      completedInspections,
      completionRate,
      overdueCount,
      byRiskLevel,
      byInspector
    };
  }

  /**
   * 获取超期商户列表（按优先级和超期天数排序）
   */
  getOverdueMerchants(period: 'today' | 'week' | 'month'): OverdueMerchant[] {
    const merchants = this.getMerchants();
    const allRecords = this.getRecords();
    const policies = inspectionPolicyService.getAllPolicies().filter(p => p.enabled);

    const overdueList: OverdueMerchant[] = [];

    for (const merchant of merchants) {
      const policy = policies.find(p => p.riskLevel === merchant.riskLevel);
      if (!policy) continue;

      // 找到该商户最近一次巡检记录
      const merchantRecords = allRecords
        .filter(r => r.merchantId === merchant.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const lastRecord = merchantRecords[0];
      const lastInspectionDate = lastRecord ? lastRecord.createdAt : null;

      // 判断是否超期
      if (this.checkIfOverdue(lastInspectionDate, policy, period)) {
        const overdueDays = this.calculateOverdueDays(lastInspectionDate, policy);

        overdueList.push({
          merchant,
          lastInspectionDate,
          overdueDays,
          requiredFrequency: policy.requiredFrequency,
          priority: policy.priority
        });
      }
    }

    // 排序：按优先级（紧急→高→正常→低）+ 超期天数（降序）
    const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
    return overdueList.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.overdueDays - a.overdueDays;
    });
  }

  /**
   * 获取趋势数据（最近N天）
   */
  getTrendData(days: number): InspectionTrendData[] {
    const merchants = this.getMerchants();
    const allRecords = this.getRecords();
    const policies = inspectionPolicyService.getAllPolicies().filter(p => p.enabled);
    const trendData: InspectionTrendData[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      // 筛选当天的记录
      const dayRecords = allRecords.filter(r => {
        const recordDate = new Date(r.createdAt);
        return recordDate >= date && recordDate < nextDate;
      });

      // 计算当天应巡检数（简化版：按每日要求）
      const requiredCount = this.calculateDailyRequired(merchants, policies);

      // 计算当天已完成数（去重商户）
      const completedCount = new Set(dayRecords.map(r => r.merchantId)).size;

      // 计算完成率
      const completionRate = requiredCount > 0
        ? Math.round((completedCount / requiredCount) * 100)
        : 0;

      trendData.push({
        date: this.formatDate(date),
        requiredCount,
        completedCount,
        completionRate
      });
    }

    return trendData;
  }

  /**
   * 私有方法：筛选时间范围内的记录
   */
  private filterRecordsByPeriod(records: InspectionRecord[], period: 'today' | 'week' | 'month'): InspectionRecord[] {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        // 本周一
        const dayOfWeek = now.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        startDate = new Date(now);
        startDate.setDate(now.getDate() - daysToMonday);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'month':
        // 本月1号
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }

    return records.filter(r => new Date(r.createdAt) >= startDate);
  }

  /**
   * 私有方法：计算应巡检商户数
   */
  private calculateRequiredInspections(
    merchants: Merchant[],
    policies: InspectionPolicy[],
    period: 'today' | 'week' | 'month'
  ): number {
    let required = 0;

    for (const merchant of merchants) {
      const policy = policies.find(p => p.riskLevel === merchant.riskLevel);
      if (!policy) continue;

      // 根据策略和时间范围计算应巡检次数
      const { interval, count } = policy.requiredFrequency;

      if (period === 'today' && interval === 'daily') {
        required += 1;
      } else if (period === 'week' && (interval === 'weekly' || interval === 'daily')) {
        required += 1;
      } else if (period === 'month') {
        required += 1;
      }
    }

    return required;
  }

  /**
   * 私有方法：按风险等级统计
   */
  private calculateByRiskLevel(
    merchants: Merchant[],
    periodRecords: InspectionRecord[],
    policies: InspectionPolicy[],
    period: 'today' | 'week' | 'month'
  ): InspectionStats['byRiskLevel'] {
    const riskLevels: Array<'critical' | 'high' | 'medium' | 'low' | 'none'> =
      ['critical', 'high', 'medium', 'low', 'none'];

    return riskLevels.map(riskLevel => {
      const levelMerchants = merchants.filter(m => m.riskLevel === riskLevel);
      const totalMerchants = levelMerchants.length;

      // 已巡检商户（去重）
      const inspectedMerchantIds = new Set(
        periodRecords
          .filter(r => {
            const merchant = merchants.find(m => m.id === r.merchantId);
            return merchant?.riskLevel === riskLevel;
          })
          .map(r => r.merchantId)
      );
      const inspectedMerchants = inspectedMerchantIds.size;

      // 覆盖率
      const coverageRate = totalMerchants > 0
        ? Math.round((inspectedMerchants / totalMerchants) * 100)
        : 0;

      // 策略要求的巡检数
      const policy = policies.find(p => p.riskLevel === riskLevel);
      const requiredByPolicy = policy ? totalMerchants : 0;

      return {
        riskLevel,
        totalMerchants,
        inspectedMerchants,
        coverageRate,
        requiredByPolicy
      };
    });
  }

  /**
   * 私有方法：按巡检员统计
   */
  private calculateByInspector(periodRecords: InspectionRecord[]): InspectionStats['byInspector'] {
    // 按巡检员分组
    const inspectorMap = new Map<string, {
      inspectorId: string;
      inspectorName: string;
      merchantIds: Set<string>;
      records: InspectionRecord[];
    }>();

    for (const record of periodRecords) {
      if (!inspectorMap.has(record.inspectorId)) {
        inspectorMap.set(record.inspectorId, {
          inspectorId: record.inspectorId,
          inspectorName: record.inspectorName,
          merchantIds: new Set(),
          records: []
        });
      }

      const inspector = inspectorMap.get(record.inspectorId)!;
      inspector.merchantIds.add(record.merchantId);
      inspector.records.push(record);
    }

    // 计算每位巡检员的统计数据
    const result: InspectionStats['byInspector'] = [];

    for (const inspector of inspectorMap.values()) {
      const assignedMerchants = inspector.merchantIds.size;
      const completedInspections = inspector.records.length;
      const completionRate = assignedMerchants > 0
        ? Math.round((completedInspections / assignedMerchants) * 100)
        : 0;

      // 平均照片数
      const totalPhotos = inspector.records.reduce((sum, r) => sum + (r.photos?.length || 0), 0);
      const avgPhotosPerInspection = completedInspections > 0
        ? Math.round((totalPhotos / completedInspections) * 10) / 10
        : 0;

      // 平均评分（基于5个维度的平均值）
      let totalRating = 0;
      let ratingCount = 0;

      for (const record of inspector.records) {
        if (record.rating?.ratings) {
          const ratings = record.rating.ratings;
          const avg = (
            ratings.staffCondition +
            ratings.merchandiseDisplay +
            ratings.storeEnvironment +
            ratings.managementCapability +
            ratings.safetyCompliance
          ) / 5;
          totalRating += avg;
          ratingCount++;
        }
      }

      const avgRating = ratingCount > 0
        ? Math.round((totalRating / ratingCount) * 10) / 10
        : 0;

      // 质量评分 = 平均评分*0.5 + 平均照片数*5
      const qualityScore = Math.round((avgRating * 0.5 + avgPhotosPerInspection * 5) * 10) / 10;

      result.push({
        inspectorId: inspector.inspectorId,
        inspectorName: inspector.inspectorName,
        assignedMerchants,
        completedInspections,
        completionRate,
        avgPhotosPerInspection,
        avgRating,
        qualityScore
      });
    }

    // 按质量分降序排序
    return result.sort((a, b) => b.qualityScore - a.qualityScore);
  }

  /**
   * 私有方法：判断是否超期
   */
  private checkIfOverdue(
    lastInspectionDate: string | null,
    policy: InspectionPolicy,
    period: 'today' | 'week' | 'month'
  ): boolean {
    const now = new Date();

    // 从未巡检，判定为超期
    if (!lastInspectionDate) return true;

    const lastDate = new Date(lastInspectionDate);
    const daysSince = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    const { interval, count } = policy.requiredFrequency;

    // 计算最大允许天数
    let maxDays: number;
    switch (interval) {
      case 'daily':
        maxDays = 1 / count;
        break;
      case 'weekly':
        maxDays = 7 / count;
        break;
      case 'monthly':
        maxDays = 30 / count;
        break;
    }

    return daysSince > maxDays;
  }

  /**
   * 私有方法：计算超期天数
   */
  private calculateOverdueDays(lastInspectionDate: string | null, policy: InspectionPolicy): number {
    // 从未巡检，返回特殊值999
    if (!lastInspectionDate) return 999;

    const now = new Date();
    const lastDate = new Date(lastInspectionDate);
    const daysSince = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    const { interval, count } = policy.requiredFrequency;

    // 计算最大允许天数
    let maxDays: number;
    switch (interval) {
      case 'daily':
        maxDays = 1 / count;
        break;
      case 'weekly':
        maxDays = 7 / count;
        break;
      case 'monthly':
        maxDays = 30 / count;
        break;
    }

    return Math.max(0, Math.floor(daysSince - maxDays));
  }

  /**
   * 私有方法：计算每日应巡检数（趋势图用）
   */
  private calculateDailyRequired(merchants: Merchant[], policies: InspectionPolicy[]): number {
    let dailyRequired = 0;

    for (const merchant of merchants) {
      const policy = policies.find(p => p.riskLevel === merchant.riskLevel);
      if (!policy) continue;

      const { interval, count } = policy.requiredFrequency;

      if (interval === 'daily') {
        dailyRequired += count;
      } else if (interval === 'weekly') {
        dailyRequired += count / 7;
      } else if (interval === 'monthly') {
        dailyRequired += count / 30;
      }
    }

    return Math.round(dailyRequired);
  }

  /**
   * 工具方法：获取商户列表
   */
  private getMerchants(): Merchant[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(this.MERCHANTS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * 工具方法：获取巡检记录
   */
  private getRecords(): InspectionRecord[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(this.RECORDS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * 工具方法：获取时间范围标签
   */
  private getPeriodLabel(period: 'today' | 'week' | 'month'): string {
    const now = new Date();
    switch (period) {
      case 'today':
        return `${now.getMonth() + 1}月${now.getDate()}日`;
      case 'week':
        const weekStart = new Date(now);
        const dayOfWeek = now.getDay();
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        weekStart.setDate(now.getDate() - daysToMonday);
        return `${weekStart.getMonth() + 1}/${weekStart.getDate()} - ${now.getMonth() + 1}/${now.getDate()}`;
      case 'month':
        return `${now.getFullYear()}年${now.getMonth() + 1}月`;
    }
  }

  /**
   * 工具方法：格式化日期
   */
  private formatDate(date: Date): string {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }
}

// 导出单例
export const inspectionStatsService = new InspectionStatsService();
