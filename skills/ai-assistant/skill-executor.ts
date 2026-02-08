/**
 * 技能执行器
 * 负责调度和执行任务计划中的各个技能
 */

import type { ExecutionPlan, SkillResult, Task } from '@/types/ai-assistant';
import type { Merchant } from '@/types';

/**
 * 技能执行器类
 */
export class SkillExecutor {
  /**
   * 执行计划
   */
  async execute(plan: ExecutionPlan, merchant: Merchant): Promise<SkillResult[]> {
    const results = new Map<string, SkillResult>();
    const pendingTasks = [...plan.tasks];

    // 按依赖关系分批执行
    while (pendingTasks.length > 0) {
      // 找出所有依赖已满足的任务
      const readyTasks = pendingTasks.filter((task) =>
        task.dependsOn.every((depId) => results.has(depId))
      );

      if (readyTasks.length === 0) {
        throw new Error('Circular dependency detected or missing dependencies');
      }

      // 🔥 并行执行所有ready的任务
      const batchResults = await Promise.all(
        readyTasks.map((task) => this.executeTask(task, merchant, results))
      );

      // 保存结果
      batchResults.forEach((result) => {
        results.set(result.taskId, result);
      });

      // 移除已执行的任务
      readyTasks.forEach((task) => {
        const index = pendingTasks.indexOf(task);
        if (index > -1) pendingTasks.splice(index, 1);
      });
    }

    return Array.from(results.values());
  }

  /**
   * 执行单个任务
   */
  private async executeTask(
    task: Task,
    merchant: Merchant,
    previousResults: Map<string, SkillResult>
  ): Promise<SkillResult> {
    const startTime = Date.now();

    try {
      let data: any;

      switch (task.action) {
        case 'analyzeHealth':
          data = await this.analyzeHealth(merchant);
          break;

        case 'detectRisks':
          data = await this.detectRisks(merchant);
          break;

        case 'diagnose':
          data = await this.diagnose(merchant);
          break;

        case 'matchCases':
          // 🔥 从前序任务获取诊断数据
          const diagnosisResult = previousResults.get(
            task.dependsOn.find((id) => id.startsWith('t')) || ''
          );
          data = await this.matchCases(merchant, diagnosisResult?.data);
          break;

        case 'generateSolution':
          // 🔥 融合多个任务结果
          data = await this.generateSolution(merchant, previousResults);
          break;

        default:
          throw new Error(`Unknown task action: ${task.action}`);
      }

      return {
        taskId: task.id,
        success: true,
        data,
        executionTime: Date.now() - startTime,
      };
    } catch (error) {
      console.error(`[SkillExecutor] Task ${task.id} failed:`, error);
      return {
        taskId: task.id,
        success: false,
        data: null,
        error: error instanceof Error ? error.message : String(error),
        executionTime: Date.now() - startTime,
      };
    }
  }

  /**
   * 分析健康度
   */
  private async analyzeHealth(merchant: Merchant): Promise<any> {
    const { analyzeHealth } = await import('@/skills/health-calculator');
    return analyzeHealth(merchant.metrics);
  }

  /**
   * 检测风险
   */
  private async detectRisks(merchant: Merchant): Promise<any> {
    const { detectRisks } = await import('@/skills/risk-detector');
    return detectRisks(merchant);
  }

  /**
   * 生成诊断报告
   */
  private async diagnose(merchant: Merchant): Promise<any> {
    const knowledgeBase = await import('@/data/cases/knowledge_base.json').then((m) => m.default);
    const { generateDiagnosisReport } = await import('@/skills/ai-diagnosis-engine');
    return generateDiagnosisReport(merchant, knowledgeBase);
  }

  /**
   * 匹配案例
   */
  private async matchCases(merchant: Merchant, diagnosisData?: any): Promise<any> {
    const knowledgeBase = await import('@/data/cases/knowledge_base.json').then((m) => m.default);
    const { enhancedMatchCases } = await import('@/skills/enhanced-ai-matcher');

    // 如果有诊断数据，可以用于更精确的案例匹配
    if (diagnosisData && diagnosisData.problemTags) {
      const riskLevel = merchant.riskLevel === 'critical' ? 'high' : merchant.riskLevel;
      return enhancedMatchCases({
        merchantName: merchant.name,
        merchantCategory: merchant.category,
        problemTags: diagnosisData.problemTags,
        knowledgeBase,
        metrics: merchant.metrics,
        riskLevel: riskLevel as 'none' | 'low' | 'medium' | 'high',
      });
    }

    // 否则使用基础匹配
    return enhancedMatchCases({
      merchantName: merchant.name,
      merchantCategory: merchant.category,
      problemTags: [],
      knowledgeBase,
      metrics: merchant.metrics,
      riskLevel: 'medium' as const,
    });
  }

  /**
   * 生成解决方案
   */
  private async generateSolution(
    merchant: Merchant,
    previousResults: Map<string, SkillResult>
  ): Promise<any> {
    // 收集所有相关数据
    const diagnosisData = Array.from(previousResults.values()).find(
      (r) => r.taskId.includes('diagnose') || r.taskId === 't1'
    )?.data;

    const casesData = Array.from(previousResults.values()).find(
      (r) => r.taskId.includes('matchCases') || r.taskId === 't2'
    )?.data;

    // 融合数据生成方案
    return {
      merchantId: merchant.id,
      merchantName: merchant.name,
      diagnosis: diagnosisData,
      recommendedCases: casesData?.cases || [],
      solutions: this.extractSolutions(casesData),
    };
  }

  /**
   * 从案例中提取解决方案
   */
  private extractSolutions(casesData: any): any[] {
    if (!casesData || !casesData.cases) {
      return [];
    }

    return casesData.cases.map((caseItem: any) => ({
      title: caseItem.title,
      actions: caseItem.actions || [],
      expectedEffect: caseItem.expectedEffect,
      weight: caseItem.weight,
    }));
  }

  /**
   * 批量执行任务（无依赖）
   */
  async executeParallel(tasks: Task[], merchant: Merchant): Promise<SkillResult[]> {
    return Promise.all(
      tasks.map((task) => this.executeTask(task, merchant, new Map()))
    );
  }

  /**
   * 执行单个技能（供外部直接调用）
   */
  async executeSingle(
    action: Task['action'],
    merchant: Merchant,
    additionalData?: any
  ): Promise<any> {
    const task: Task = {
      id: 'single',
      action,
      params: { merchantId: merchant.id },
      dependsOn: [],
      priority: 1,
    };

    const previousResults = new Map<string, SkillResult>();
    if (additionalData) {
      previousResults.set('additional', {
        taskId: 'additional',
        success: true,
        data: additionalData,
        executionTime: 0,
      });
    }

    const result = await this.executeTask(task, merchant, previousResults);
    if (!result.success) {
      throw new Error(result.error || 'Execution failed');
    }

    return result.data;
  }

  /**
   * 获取任务执行统计
   */
  getExecutionStats(results: SkillResult[]): {
    total: number;
    successful: number;
    failed: number;
    totalTime: number;
    averageTime: number;
  } {
    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;
    const totalTime = results.reduce((sum, r) => sum + r.executionTime, 0);

    return {
      total: results.length,
      successful,
      failed,
      totalTime,
      averageTime: results.length > 0 ? totalTime / results.length : 0,
    };
  }
}

/**
 * 导出单例
 */
export const skillExecutor = new SkillExecutor();
