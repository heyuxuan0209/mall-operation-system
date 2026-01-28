import { Merchant, MerchantProfile, ChecklistItem, PhotoAttachment, CheckInData, QuickRating, VoiceNote } from '@/types';
import { merchantDataManager } from './merchantDataManager';

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
 */
export function getMerchantProfile(merchant: Merchant): MerchantProfile {
  const { totalScore, riskLevel, metrics } = merchant;

  // 生成预警标签
  const alerts: string[] = [];

  // 租售比预警
  if (merchant.rentToSalesRatio > 25) {
    alerts.push(`租售比过高(${merchant.rentToSalesRatio.toFixed(1)}%)`);
  }

  // 经营表现预警
  if (metrics.operational < 40) {
    alerts.push(`经营表现不佳(${metrics.operational}分)`);
  }

  // 现场品质预警
  if (metrics.siteQuality < 50) {
    alerts.push(`现场品质较差(${metrics.siteQuality}分)`);
  }

  // 顾客满意度预警
  if (metrics.customerReview < 50) {
    alerts.push(`顾客满意度偏低(${metrics.customerReview}分)`);
  }

  // 租金缴纳预警
  if (metrics.collection < 80) {
    alerts.push(`租金缴纳异常(${metrics.collection}分)`);
  }

  // 抗风险能力预警
  if (metrics.riskResistance < 40) {
    alerts.push(`抗风险能力弱(${metrics.riskResistance}分)`);
  }

  // 识别最薄弱维度
  const dimensionScores = [
    { name: '租金缴纳', score: metrics.collection },
    { name: '经营表现', score: metrics.operational },
    { name: '现场品质', score: metrics.siteQuality },
    { name: '顾客满意度', score: metrics.customerReview },
    { name: '抗风险能力', score: metrics.riskResistance },
  ];

  const weakest = dimensionScores.reduce((min, curr) =>
    curr.score < min.score ? curr : min
  );

  // 生成核心观察点
  const focusPoints = generateFocusPoints(merchant);

  // 生成检查清单
  const { type: checklistType, items: checklist } = generateChecklist(new Date());

  return {
    healthScore: totalScore,
    riskLevel,
    alerts,
    weakestDimension: weakest.name,
    focusPoints,
    checklistType,
    checklist,
  };
}

/**
 * 生成核心观察点
 * 根据商户弱项指标生成针对性的观察引导
 */
export function generateFocusPoints(merchant: Merchant): string[] {
  const { metrics, rentToSalesRatio } = merchant;
  const focusPoints: string[] = [];

  // 根据经营表现生成观察点
  if (metrics.operational < 50) {
    focusPoints.push('重点观察货品完备性与陈列');
    focusPoints.push('核实是否存在断货或库存积压');
  }

  // 根据现场品质生成观察点
  if (metrics.siteQuality < 60) {
    focusPoints.push('检查店面卫生和环境整洁度');
    focusPoints.push('核查设施设备是否正常运作');
  }

  // 根据顾客满意度生成观察点
  if (metrics.customerReview < 60) {
    focusPoints.push('关注员工服务态度和话术');
    focusPoints.push('观察顾客进店后的接待流程');
  }

  // 根据租售比生成观察点
  if (rentToSalesRatio > 25) {
    focusPoints.push('了解经营困难和成本压力');
    focusPoints.push('评估是否需要调整经营策略');
  }

  // 根据租金缴纳生成观察点
  if (metrics.collection < 80) {
    focusPoints.push('核实租金缴纳情况和资金状况');
    focusPoints.push('评估商户的经营意愿和信心');
  }

  // 如果没有明显弱项，给出常规观察点
  if (focusPoints.length === 0) {
    focusPoints.push('观察整体经营状态和员工精神面貌');
    focusPoints.push('了解近期经营情况和客流变化');
    focusPoints.push('收集商户对商场服务的反馈');
  }

  return focusPoints;
}

/**
 * 生成检查清单
 * 根据时间自动匹配开店/闭店/常规检查标准
 */
export function generateChecklist(timeOfDay: Date): {
  type: 'opening' | 'closing' | 'routine';
  items: ChecklistItem[];
} {
  const hour = timeOfDay.getHours();
  const minute = timeOfDay.getMinutes();
  const timeInMinutes = hour * 60 + minute;

  // 早间开店检查（9:50之前，即590分钟之前）
  if (timeInMinutes < 590) {
    return {
      type: 'opening',
      items: [
        { id: 'open-1', label: '门吸是否打开', checked: false },
        { id: 'open-2', label: '灯光是否全部开启', checked: false },
        { id: 'open-3', label: '员工是否参加晨会', checked: false },
        { id: 'open-4', label: '收银系统是否正常', checked: false },
        { id: 'open-5', label: '店面卫生是否整洁', checked: false },
        { id: 'open-6', label: '商品陈列是否规范', checked: false },
      ],
    };
  }

  // 晚间闭店检查（21:00之后，即1260分钟之后）
  if (timeInMinutes >= 1260) {
    return {
      type: 'closing',
      items: [
        { id: 'close-1', label: '锁门查人是否完成', checked: false },
        { id: 'close-2', label: '电源是否全部关闭', checked: false },
        { id: 'close-3', label: '现金是否已存入保险柜', checked: false },
        { id: 'close-4', label: '垃圾是否清理干净', checked: false },
        { id: 'close-5', label: '门窗是否锁好', checked: false },
        { id: 'close-6', label: '监控设备是否正常', checked: false },
      ],
    };
  }

  // 常规巡检
  return {
    type: 'routine',
    items: [
      { id: 'routine-1', label: '员工着装是否规范', checked: false },
      { id: 'routine-2', label: '服务态度是否良好', checked: false },
      { id: 'routine-3', label: '商品陈列是否整齐', checked: false },
      { id: 'routine-4', label: '价格标签是否清晰', checked: false },
      { id: 'routine-5', label: '卫生环境是否达标', checked: false },
      { id: 'routine-6', label: '安全隐患是否排除', checked: false },
      { id: 'routine-7', label: '设施设备是否完好', checked: false },
      { id: 'routine-8', label: '客流情况是否正常', checked: false },
    ],
  };
}

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
      issues: this.extractIssuesFromPhotos(photos),
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
    const highlights = this.generateHighlights(photos, rating, oldScore, newScore);

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
   * 从照片中提取问题
   */
  private extractIssuesFromPhotos(photos: PhotoAttachment[]): string[] {
    const issues: string[] = [];

    photos.forEach((photo) => {
      // 严重和警告级别的照片视为问题
      if (photo.issueLevel === 'critical' || photo.issueLevel === 'warning') {
        const categoryLabel = photo.category === 'people' ? '人员'
          : photo.category === 'merchandise' ? '商品'
          : '环境';

        const tagsStr = photo.tags.length > 0 ? `(${photo.tags.join('、')})` : '';
        const desc = photo.description ? `: ${photo.description}` : '';

        issues.push(`${categoryLabel}问题${tagsStr}${desc}`);
      }
    });

    return issues;
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
   * 生成改进亮点和关注点
   */
  private generateHighlights(
    photos: PhotoAttachment[],
    rating: QuickRating | null,
    oldScore: number,
    newScore: number
  ): { improvements: string[]; concerns: string[] } {
    const improvements: string[] = [];
    const concerns: string[] = [];

    // 1. 基于照片分类生成
    const goodPhotos = photos.filter(p => p.issueLevel === 'good');
    const warningPhotos = photos.filter(p => p.issueLevel === 'warning');
    const criticalPhotos = photos.filter(p => p.issueLevel === 'critical');

    // 改进亮点（良好的方面）
    goodPhotos.forEach(photo => {
      if (photo.tags.length > 0) {
        improvements.push(`${photo.tags[0]}表现良好`);
      }
    });

    // 关注点（问题方面）
    warningPhotos.forEach(photo => {
      if (photo.tags.length > 0) {
        concerns.push(`${photo.tags[0]}需要改进`);
      }
    });

    criticalPhotos.forEach(photo => {
      if (photo.tags.length > 0) {
        concerns.push(`${photo.tags[0]}问题严重，需立即整改`);
      }
    });

    // 2. 基于评分生成
    if (rating && rating.ratings) {
      const { staffCondition, merchandiseDisplay, storeEnvironment, managementCapability, safetyCompliance } = rating.ratings;

      // 员工状态
      if (staffCondition >= 80) {
        improvements.push('员工服务态度优秀');
      } else if (staffCondition < 50) {
        concerns.push('员工服务需要培训提升');
      }

      // 商品陈列
      if (merchandiseDisplay >= 80) {
        improvements.push('商品陈列整齐有序');
      } else if (merchandiseDisplay < 50) {
        concerns.push('商品管理需要优化');
      }

      // 店面环境
      if (storeEnvironment >= 80) {
        improvements.push('现场环境整洁明亮');
      } else if (storeEnvironment < 50) {
        concerns.push('现场环境需要改善');
      }

      // 管理能力
      if (managementCapability >= 80) {
        improvements.push('管理能力突出');
      } else if (managementCapability < 50) {
        concerns.push('管理能力需要提升');
      }

      // 安全合规
      if (safetyCompliance >= 80) {
        improvements.push('安全合规表现良好');
      } else if (safetyCompliance < 50) {
        concerns.push('安全合规需要加强');
      }
    }

    // 3. 基于分数变化生成总结
    const scoreChange = newScore - oldScore;
    if (scoreChange > 5) {
      improvements.unshift('整体经营状况有明显改善');
    } else if (scoreChange < -5) {
      concerns.unshift('整体健康度下降，需要重点关注');
    }

    // 4. 去重并限制数量
    return {
      improvements: [...new Set(improvements)].slice(0, 5),
      concerns: [...new Set(concerns)].slice(0, 5),
    };
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
