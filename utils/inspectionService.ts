import { Merchant, MerchantProfile, ChecklistItem, PhotoAttachment, CheckInData, QuickRating, VoiceNote } from '@/types';
import { merchantDataManager } from './merchantDataManager';
import {
  generateMerchantInsights,
  generateFocusPoints,
  generateChecklist,
  extractIssuesFromPhotos,
  generateHighlights,
} from '@/skills/inspection-analyzer';

/**
 * 巡检记录接口
 */
export interface InspectionRecord {
  id: string;
  merchantId: string;
  merchantName: string;
  inspectorId: string;
  inspectorName: string;
  checkIn: CheckInData;
  rating: QuickRating | null;
  photos: PhotoAttachment[];
  audioNotes: VoiceNote[];
  textNotes: string;
  issues: string[];
  createdAt: string;
  updatedAt: string;
}

/**
 * 保存结果接口（包含反馈数据）
 */
export interface SaveInspectionResult {
  success: boolean;
  record: InspectionRecord;
  feedback: {
    merchantName: string;
    oldScore: number;
    newScore: number;
    highlights: {
      improvements: string[];
      concerns: string[];
    };
  };
}

/**
 * 获取商户画像
 * 根据商户健康度数据生成诊断简报
 *
 * @deprecated 使用 @/skills/inspection-analyzer 的独立函数
 */
export function getMerchantProfile(merchant: Merchant): MerchantProfile {
  const { totalScore, riskLevel } = merchant;

  // 使用 inspection-analyzer skill
  const insights = generateMerchantInsights(merchant);
  const { type: checklistType, items: checklist } = generateChecklist(new Date());

  return {
    healthScore: totalScore || 0, // 防止NaN
    riskLevel: riskLevel || 'none',
    alerts: insights.alerts,
    weakestDimension: insights.weakestDimension,
    focusPoints: insights.focusPoints,
    checklistType,
    checklist,
  };
}

/**
 * 生成核心观察点
 * 根据商户弱项指标生成针对性的观察引导
 *
 * @deprecated 使用 @/skills/inspection-analyzer 的 generateFocusPoints
 */
export { generateFocusPoints };

/**
 * 生成检查清单
 * 根据时间自动匹配开店/闭店/常规检查标准
 *
 * @deprecated 使用 @/skills/inspection-analyzer 的 generateChecklist
 */
export { generateChecklist };

/**
 * 巡检服务类
 */
class InspectionServiceClass {
  private static instance: InspectionServiceClass;
  private readonly RECORDS_KEY = 'inspection_records';
  private readonly MERCHANTS_KEY = 'merchants';

  private constructor() {}

  static getInstance(): InspectionServiceClass {
    if (!InspectionServiceClass.instance) {
      InspectionServiceClass.instance = new InspectionServiceClass();
    }
    return InspectionServiceClass.instance;
  }

  /**
   * 保存巡检记录并更新商户健康度
   */
  saveInspection(
    merchant: Merchant,
    checkIn: CheckInData,
    rating: QuickRating | null,
    photos: PhotoAttachment[],
    audioNotes: VoiceNote[],
    textNotes: string,
    inspectorId: string = 'user_001',
    inspectorName: string = '当前用户'
  ): SaveInspectionResult {
    // 1. 创建巡检记录
    const record: InspectionRecord = {
      id: `inspection_${Date.now()}`,
      merchantId: merchant.id,
      merchantName: merchant.name,
      inspectorId,
      inspectorName,
      checkIn,
      rating,
      photos,
      audioNotes,
      textNotes,
      issues: extractIssuesFromPhotos(photos),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 2. 保存记录到 localStorage
    this.saveRecord(record);

    // 3. 计算健康度变化
    const oldScore = merchant.totalScore;
    const newScore = this.calculateNewHealthScore(merchant, rating, photos);

    // 4. 更新商户健康度
    this.updateMerchantHealth(merchant.id, newScore, rating);

    // 5. 生成反馈亮点
    const highlights = generateHighlights(photos, rating, oldScore, newScore);

    return {
      success: true,
      record,
      feedback: {
        merchantName: merchant.name,
        oldScore,
        newScore,
        highlights,
      },
    };
  }


  /**
   * 计算新的健康度分数
   * 基于快速评分和照片分类
   */
  private calculateNewHealthScore(
    merchant: Merchant,
    rating: QuickRating | null,
    photos: PhotoAttachment[]
  ): number {
    let newScore = merchant.totalScore;

    // 1. 基于快速评分调整
    if (rating && rating.ratings) {
      // 计算快速评分的平均值
      // QuickRating 使用新的 5 维度评分
      const { staffCondition, merchandiseDisplay, storeEnvironment, managementCapability, safetyCompliance } = rating.ratings;

      const avgRating = (
        staffCondition +
        merchandiseDisplay +
        storeEnvironment +
        managementCapability +
        safetyCompliance
      ) / 5;

      // 评分影响权重：0-40分 = -10分, 40-60分 = -5分, 60-80分 = 0分, 80-100分 = +5分
      if (avgRating >= 80) {
        newScore += 5;
      } else if (avgRating >= 60) {
        // 保持不变
      } else if (avgRating >= 40) {
        newScore -= 5;
      } else {
        newScore -= 10;
      }
    }

    // 2. 基于照片问题等级调整
    const criticalCount = photos.filter(p => p.issueLevel === 'critical').length;
    const warningCount = photos.filter(p => p.issueLevel === 'warning').length;
    const goodCount = photos.filter(p => p.issueLevel === 'good').length;

    newScore -= criticalCount * 5; // 严重问题 -5分/个
    newScore -= warningCount * 2;  // 警告问题 -2分/个
    newScore += goodCount * 1;     // 良好表现 +1分/个

    // 3. 确保分数在 0-100 范围内
    return Math.max(0, Math.min(100, newScore));
  }


  /**
   * 保存记录到 localStorage
   */
  private saveRecord(record: InspectionRecord): void {
    if (typeof window === 'undefined') return;

    const stored = localStorage.getItem(this.RECORDS_KEY);
    const records: InspectionRecord[] = stored ? JSON.parse(stored) : [];

    records.unshift(record); // 最新的记录放在前面

    // 限制保存数量（最多 100 条）
    if (records.length > 100) {
      records.splice(100);
    }

    localStorage.setItem(this.RECORDS_KEY, JSON.stringify(records));
  }

  /**
   * 更新商户健康度
   */
  private updateMerchantHealth(
    merchantId: string,
    newScore: number,
    rating: QuickRating | null
  ): void {
    if (typeof window === 'undefined') return;

    // 准备更新数据
    const updates: Partial<Merchant> = {
      totalScore: newScore,
    };

    // 更新各项指标（基于评分）
    if (rating && rating.ratings) {
      const { staffCondition, merchandiseDisplay, storeEnvironment, managementCapability, safetyCompliance } = rating.ratings;

      updates.metrics = {
        collection: merchantDataManager.getMerchant(merchantId)?.metrics.collection || 80,
        operational: Math.round((merchandiseDisplay + managementCapability) / 2),
        siteQuality: Math.round((storeEnvironment + staffCondition) / 2),
        customerReview: Math.round((staffCondition + storeEnvironment + merchandiseDisplay) / 3),
        riskResistance: Math.round((managementCapability + safetyCompliance) / 2),
      };
    }

    // 更新风险等级（新标准）
    if (newScore >= 90) {
      updates.riskLevel = 'none';      // 无风险：90-100分
    } else if (newScore >= 80) {
      updates.riskLevel = 'low';       // 低风险：80-89分
    } else if (newScore >= 60) {
      updates.riskLevel = 'medium';    // 中风险：60-79分
    } else if (newScore >= 40) {
      updates.riskLevel = 'high';      // 高风险：40-59分
    } else {
      updates.riskLevel = 'critical';  // 极高风险：0-39分
    }

    // 使用统一的数据管理器更新
    merchantDataManager.updateMerchant(merchantId, updates);
  }

  /**
   * 获取所有巡检记录
   */
  getAllRecords(): InspectionRecord[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(this.RECORDS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * 获取指定商户的巡检记录
   */
  getRecordsByMerchant(merchantId: string): InspectionRecord[] {
    return this.getAllRecords().filter(r => r.merchantId === merchantId);
  }

  /**
   * 获取单条记录
   */
  getRecord(recordId: string): InspectionRecord | null {
    const records = this.getAllRecords();
    return records.find(r => r.id === recordId) || null;
  }

  /**
   * 删除记录
   */
  deleteRecord(recordId: string): boolean {
    if (typeof window === 'undefined') return false;

    const records = this.getAllRecords();
    const filteredRecords = records.filter(r => r.id !== recordId);

    if (filteredRecords.length < records.length) {
      localStorage.setItem(this.RECORDS_KEY, JSON.stringify(filteredRecords));
      return true;
    }

    return false;
  }
}

export const inspectionServiceInstance = InspectionServiceClass.getInstance();
