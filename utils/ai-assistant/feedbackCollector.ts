/**
 * 反馈收集器
 * 收集用户反馈并更新案例权重，用于优化推荐算法
 */

import {
  UserFeedback,
  WeightAdjustment,
  CaseWeight,
  WeightStorage,
  FeedbackConfig,
} from '@/types/ai-assistant';

export class FeedbackCollector {
  private readonly FEEDBACK_STORAGE_KEY = 'ai_assistant_feedbacks';
  private readonly WEIGHT_STORAGE_KEY = 'ai_assistant_case_weights';
  private readonly ADJUSTMENTS_STORAGE_KEY = 'ai_assistant_weight_adjustments';

  /**
   * 收集用户反馈
   */
  collectFeedback(feedback: Omit<UserFeedback, 'id' | 'timestamp'>): UserFeedback {
    const fullFeedback: UserFeedback = {
      ...feedback,
      id: this.generateId(),
      timestamp: new Date().toISOString(),
    };

    // 保存反馈
    this.saveFeedback(fullFeedback);

    // 更新案例权重
    if (feedback.caseId) {
      this.updateCaseWeightFromFeedback(fullFeedback);
    }

    return fullFeedback;
  }

  /**
   * 保存反馈到 localStorage
   */
  private saveFeedback(feedback: UserFeedback): void {
    try {
      const feedbacks = this.getFeedbacks();
      feedbacks.push(feedback);

      // 只保留最近1000条反馈
      if (feedbacks.length > 1000) {
        feedbacks.splice(0, feedbacks.length - 1000);
      }

      localStorage.setItem(this.FEEDBACK_STORAGE_KEY, JSON.stringify(feedbacks));
    } catch (error) {
      console.error('Failed to save feedback:', error);
    }
  }

  /**
   * 获取所有反馈
   */
  getFeedbacks(): UserFeedback[] {
    try {
      const stored = localStorage.getItem(this.FEEDBACK_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get feedbacks:', error);
      return [];
    }
  }

  /**
   * 根据反馈更新案例权重
   */
  private updateCaseWeightFromFeedback(feedback: UserFeedback): void {
    let adjustment = 0;

    // 计算权重调整值
    if (feedback.helpful) {
      adjustment += 10;

      // 如果有评分，根据评分调整
      if (feedback.rating) {
        adjustment += (feedback.rating - 3) * 5; // 1星-10, 3星+0, 5星+10
      }
    } else {
      adjustment -= 5;
    }

    // 如果用户采纳了措施
    if (feedback.adopted) {
      if (feedback.effectiveness === 'high') {
        adjustment += 20;
      } else if (feedback.effectiveness === 'medium') {
        adjustment += 10;
      } else if (feedback.effectiveness === 'low') {
        adjustment -= 10;
      }
    }

    // 应用权重调整
    if (feedback.caseId && adjustment !== 0) {
      this.updateCaseWeight(feedback.caseId, adjustment, feedback.id);
    }
  }

  /**
   * 更新案例权重
   */
  updateCaseWeight(caseId: string, adjustment: number, feedbackId?: string): void {
    try {
      const weights = this.getCaseWeights();
      const currentWeight = weights[caseId] || 0;
      const newWeight = currentWeight + adjustment;

      weights[caseId] = newWeight;
      localStorage.setItem(this.WEIGHT_STORAGE_KEY, JSON.stringify(weights));

      // 记录权重调整历史
      this.recordWeightAdjustment({
        id: this.generateId(),
        caseId,
        timestamp: new Date().toISOString(),
        adjustment,
        reason: feedbackId ? `feedback:${feedbackId}` : 'manual',
        feedbackId,
      });

      console.log(`[FeedbackCollector] Updated case ${caseId} weight: ${currentWeight} -> ${newWeight} (${adjustment > 0 ? '+' : ''}${adjustment})`);
    } catch (error) {
      console.error('Failed to update case weight:', error);
    }
  }

  /**
   * 获取案例权重
   */
  getCaseWeights(): WeightStorage {
    try {
      const stored = localStorage.getItem(this.WEIGHT_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to get case weights:', error);
      return {};
    }
  }

  /**
   * 获取单个案例的权重
   */
  getCaseWeight(caseId: string): number {
    const weights = this.getCaseWeights();
    return weights[caseId] || 0;
  }

  /**
   * 记录权重调整历史
   */
  private recordWeightAdjustment(adjustment: WeightAdjustment): void {
    try {
      const adjustments = this.getWeightAdjustments();
      adjustments.push(adjustment);

      // 只保留最近500条记录
      if (adjustments.length > 500) {
        adjustments.splice(0, adjustments.length - 500);
      }

      localStorage.setItem(this.ADJUSTMENTS_STORAGE_KEY, JSON.stringify(adjustments));
    } catch (error) {
      console.error('Failed to record weight adjustment:', error);
    }
  }

  /**
   * 获取权重调整历史
   */
  getWeightAdjustments(): WeightAdjustment[] {
    try {
      const stored = localStorage.getItem(this.ADJUSTMENTS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get weight adjustments:', error);
      return [];
    }
  }

  /**
   * 获取案例详细权重信息
   */
  getCaseWeightDetails(caseId: string): CaseWeight | null {
    try {
      const feedbacks = this.getFeedbacks().filter((f) => f.caseId === caseId);
      const adjustments = this.getWeightAdjustments().filter((a) => a.caseId === caseId);

      if (feedbacks.length === 0) {
        return null;
      }

      const adoptedCount = feedbacks.filter((f) => f.adopted).length;
      const adoptionRate = adoptedCount / feedbacks.length;

      const lastAdjustment = adjustments.length > 0
        ? adjustments[adjustments.length - 1]
        : null;

      return {
        caseId,
        weight: this.getCaseWeight(caseId),
        lastUpdated: lastAdjustment?.timestamp || new Date().toISOString(),
        feedbackCount: feedbacks.length,
        adoptionRate,
      };
    } catch (error) {
      console.error('Failed to get case weight details:', error);
      return null;
    }
  }

  /**
   * 获取商户的反馈统计
   */
  getMerchantFeedbackStats(merchantId: string) {
    const feedbacks = this.getFeedbacks().filter((f) => f.merchantId === merchantId);

    if (feedbacks.length === 0) {
      return null;
    }

    const helpfulCount = feedbacks.filter((f) => f.helpful).length;
    const adoptedCount = feedbacks.filter((f) => f.adopted).length;

    const ratings = feedbacks.filter((f) => f.rating).map((f) => f.rating!);
    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
      : 0;

    return {
      merchantId,
      totalFeedbacks: feedbacks.length,
      helpfulCount,
      helpfulRate: helpfulCount / feedbacks.length,
      adoptedCount,
      adoptionRate: adoptedCount / feedbacks.length,
      averageRating,
      recentFeedbacks: feedbacks.slice(-5),
    };
  }

  /**
   * 获取整体反馈统计
   */
  getOverallStats() {
    const feedbacks = this.getFeedbacks();

    if (feedbacks.length === 0) {
      return {
        total: 0,
        helpful: 0,
        helpfulRate: 0,
        averageRating: 0,
        adopted: 0,
        adoptionRate: 0,
      };
    }

    const helpfulCount = feedbacks.filter((f) => f.helpful).length;
    const adoptedCount = feedbacks.filter((f) => f.adopted).length;

    const ratings = feedbacks.filter((f) => f.rating).map((f) => f.rating!);
    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
      : 0;

    return {
      total: feedbacks.length,
      helpful: helpfulCount,
      helpfulRate: helpfulCount / feedbacks.length,
      averageRating,
      adopted: adoptedCount,
      adoptionRate: adoptedCount / feedbacks.length,
    };
  }

  /**
   * 清理旧反馈（保留最近30天）
   */
  cleanupOldFeedbacks(): number {
    try {
      const feedbacks = this.getFeedbacks();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const filteredFeedbacks = feedbacks.filter(
        (f) => new Date(f.timestamp) > thirtyDaysAgo
      );

      const removed = feedbacks.length - filteredFeedbacks.length;

      if (removed > 0) {
        localStorage.setItem(
          this.FEEDBACK_STORAGE_KEY,
          JSON.stringify(filteredFeedbacks)
        );
      }

      return removed;
    } catch (error) {
      console.error('Failed to cleanup old feedbacks:', error);
      return 0;
    }
  }

  /**
   * 生成唯一 ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 重置所有数据（慎用）
   */
  reset(): void {
    localStorage.removeItem(this.FEEDBACK_STORAGE_KEY);
    localStorage.removeItem(this.WEIGHT_STORAGE_KEY);
    localStorage.removeItem(this.ADJUSTMENTS_STORAGE_KEY);
    console.log('[FeedbackCollector] All data reset');
  }
}

// 导出单例实例
export const feedbackCollector = new FeedbackCollector();
