/**
 * 置信度阈值管理器
 * 管理系统的置信度阈值，决定如何处理不同置信度的结果
 */

export interface ConfidenceDecision {
  execute: boolean;           // 是否执行操作
  askConfirmation: boolean;   // 是否需要用户确认
  showWarning: boolean;       // 是否显示警告
  reason: string;             // 决策原因
}

export class ConfidenceThresholdManager {
  private thresholds = {
    high: 0.85,    // 高置信度：直接执行
    medium: 0.6,   // 中等置信度：执行但标注不确定
    low: 0.4       // 低置信度：询问用户确认
  };

  /**
   * 根据置信度决定如何处理
   */
  shouldExecute(confidence: number): ConfidenceDecision {
    if (confidence >= this.thresholds.high) {
      return {
        execute: true,
        askConfirmation: false,
        showWarning: false,
        reason: '高置信度，直接执行'
      };
    }

    if (confidence >= this.thresholds.medium) {
      return {
        execute: true,
        askConfirmation: false,
        showWarning: true,
        reason: '中等置信度，执行但提示用户'
      };
    }

    if (confidence >= this.thresholds.low) {
      return {
        execute: false,
        askConfirmation: true,
        showWarning: false,
        reason: '低置信度，需要用户确认'
      };
    }

    return {
      execute: false,
      askConfirmation: false,
      showWarning: false,
      reason: '置信度过低，无法执行'
    };
  }

  /**
   * 获取置信度等级描述
   */
  getConfidenceLevel(confidence: number): 'high' | 'medium' | 'low' | 'very_low' {
    if (confidence >= this.thresholds.high) return 'high';
    if (confidence >= this.thresholds.medium) return 'medium';
    if (confidence >= this.thresholds.low) return 'low';
    return 'very_low';
  }

  /**
   * 生成用户友好的置信度提示
   */
  generateConfidenceMessage(confidence: number): string {
    const level = this.getConfidenceLevel(confidence);

    const messages = {
      high: '',
      medium: '⚠️ 提示：我对这个理解有一定把握，但不是完全确定。',
      low: '❓ 我不太确定您的意思，请确认：',
      very_low: '❌ 抱歉，我无法理解您的问题。'
    };

    return messages[level];
  }

  /**
   * 更新阈值（用于动态调整）
   */
  updateThresholds(thresholds: Partial<typeof this.thresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }

  /**
   * 获取当前阈值配置
   */
  getThresholds() {
    return { ...this.thresholds };
  }
}

// 导出单例
export const confidenceManager = new ConfidenceThresholdManager();
