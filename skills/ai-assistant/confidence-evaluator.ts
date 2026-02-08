/**
 * 置信度评估器
 * 评估Agent执行过程的置信度并检测歧义
 */

import type {
  RewriteResult,
  IntentResult,
  EntityResult,
  ExecutionPlan,
  SkillResult,
  ConfidenceScore,
} from '@/types/ai-assistant';

/**
 * 置信度评估器类
 */
export class ConfidenceEvaluator {
  /**
   * 评估整体置信度
   */
  evaluate(
    rewriteResult: RewriteResult,
    intentResult: IntentResult,
    entityResult: EntityResult,
    plan: ExecutionPlan,
    executionResults: SkillResult[]
  ): ConfidenceScore {
    const breakdown = {
      queryUnderstanding: rewriteResult.confidence,
      intentClassification: intentResult.confidence,
      entityExtraction: entityResult.confidence,
      taskPlanning: plan.confidence,
      execution: this.calculateExecutionConfidence(executionResults),
    };

    const overall = this.calculateOverallConfidence(breakdown);
    const ambiguities = this.detectAmbiguities(rewriteResult, intentResult, entityResult);

    // 🔥 修复：只在综合置信度很低 AND 有歧义时才需要确认
    const needsConfirmation = overall < 0.5 && ambiguities.length > 0;

    return {
      overall,
      breakdown,
      needsConfirmation,
      ambiguities,
    };
  }

  /**
   * 计算执行置信度
   */
  private calculateExecutionConfidence(results: SkillResult[]): number {
    if (results.length === 0) {
      return 1.0; // 如果没有执行任务（如LLM处理），默认置信度为1
    }

    const successCount = results.filter((r) => r.success).length;
    const successRate = successCount / results.length;

    // 基于成功率计算置信度
    return successRate;
  }

  /**
   * 计算综合置信度
   */
  private calculateOverallConfidence(breakdown: ConfidenceScore['breakdown']): number {
    // 加权平均，权重根据各阶段的重要性分配
    return (
      breakdown.queryUnderstanding * 0.15 +
      breakdown.intentClassification * 0.25 +
      breakdown.entityExtraction * 0.3 +
      breakdown.taskPlanning * 0.15 +
      breakdown.execution * 0.15
    );
  }

  /**
   * 检测歧义
   */
  private detectAmbiguities(
    rewriteResult: RewriteResult,
    intentResult: IntentResult,
    entityResult: EntityResult
  ): string[] {
    const ambiguities: string[] = [];

    // 检测1：查询改写置信度非常低（🔥 调整阈值：0.4 → 0.3）
    if (rewriteResult.confidence < 0.3) {
      ambiguities.push('查询理解不确定，建议您提供更多细节');
    }

    // 检测2：意图识别置信度非常低（🔥 调整阈值：0.4 → 0.3）
    if (intentResult.confidence < 0.3) {
      ambiguities.push('意图识别不确定，请明确您的需求');
    }

    // 检测3：实体提取置信度低（🔥 调整阈值：0.5 → 0.3）
    if (entityResult.matched && entityResult.confidence < 0.3) {
      ambiguities.push(`不确定您是否在询问"${entityResult.merchantName}"，请确认`);
    }

    // 检测4：实体来自上下文回退 - 已移除，这是正常情况

    // 检测5：极多改写操作（🔥 调整阈值：5 → 8）
    if (rewriteResult.operations.length > 8) {
      ambiguities.push('查询包含多个部分，可能理解有误');
    }

    // 检测6：改写操作包含指代消解但置信度非常低（🔥 调整阈值：0.5 → 0.3）
    const hasCoreferenceOrEllipsis = rewriteResult.operations.some(
      (op) => op.type === 'coreference' || op.type === 'ellipsis'
    );
    if (hasCoreferenceOrEllipsis && rewriteResult.confidence < 0.3) {
      ambiguities.push('对话上下文理解可能有误，建议重新表述');
    }

    return ambiguities;
  }

  /**
   * 评估是否需要用户确认
   */
  shouldConfirm(confidenceScore: ConfidenceScore, threshold: number = 0.6): boolean {
    // 🔥 降低阈值：0.7 → 0.6，并且只在有歧义时才确认
    return confidenceScore.overall < threshold && confidenceScore.ambiguities.length > 0;
  }

  /**
   * 生成确认提示
   */
  generateConfirmationPrompt(confidenceScore: ConfidenceScore): string {
    if (confidenceScore.ambiguities.length === 0) {
      return '';
    }

    let prompt = '\n\n---\n\n⚠️ **提示**:\n';
    confidenceScore.ambiguities.forEach((ambiguity) => {
      prompt += `- ${ambiguity}\n`;
    });

    return prompt;
  }

  /**
   * 评估单个阶段的置信度
   */
  evaluateStage(
    stageName: keyof ConfidenceScore['breakdown'],
    value: number
  ): {
    level: 'high' | 'medium' | 'low';
    message: string;
  } {
    if (value >= 0.8) {
      return {
        level: 'high',
        message: '置信度高',
      };
    } else if (value >= 0.6) {
      return {
        level: 'medium',
        message: '置信度中等',
      };
    } else {
      return {
        level: 'low',
        message: '置信度低，建议人工确认',
      };
    }
  }

  /**
   * 获取置信度报告
   */
  getConfidenceReport(confidenceScore: ConfidenceScore): string {
    let report = '# 置信度评估报告\n\n';

    report += `**综合置信度**: ${(confidenceScore.overall * 100).toFixed(1)}%\n\n`;

    report += '## 分项置信度\n\n';
    report += `- 查询理解: ${(confidenceScore.breakdown.queryUnderstanding * 100).toFixed(1)}%\n`;
    report += `- 意图识别: ${(confidenceScore.breakdown.intentClassification * 100).toFixed(1)}%\n`;
    report += `- 实体提取: ${(confidenceScore.breakdown.entityExtraction * 100).toFixed(1)}%\n`;
    report += `- 任务规划: ${(confidenceScore.breakdown.taskPlanning * 100).toFixed(1)}%\n`;
    report += `- 执行结果: ${(confidenceScore.breakdown.execution * 100).toFixed(1)}%\n`;

    if (confidenceScore.ambiguities.length > 0) {
      report += '\n## 检测到的歧义\n\n';
      confidenceScore.ambiguities.forEach((ambiguity, index) => {
        report += `${index + 1}. ${ambiguity}\n`;
      });
    }

    if (confidenceScore.needsConfirmation) {
      report += '\n⚠️ **建议**: 需要用户确认\n';
    } else {
      report += '\n✅ **结论**: 可以直接执行\n';
    }

    return report;
  }

  /**
   * 比较两次执行的置信度
   */
  compareConfidence(score1: ConfidenceScore, score2: ConfidenceScore): {
    improved: boolean;
    delta: number;
    details: string;
  } {
    const delta = score2.overall - score1.overall;
    const improved = delta > 0;

    let details = '';
    if (improved) {
      details = `置信度提升了 ${(delta * 100).toFixed(1)}%`;
    } else if (delta < 0) {
      details = `置信度下降了 ${(Math.abs(delta) * 100).toFixed(1)}%`;
    } else {
      details = '置信度无变化';
    }

    return {
      improved,
      delta,
      details,
    };
  }
}

/**
 * 导出单例
 */
export const confidenceEvaluator = new ConfidenceEvaluator();
