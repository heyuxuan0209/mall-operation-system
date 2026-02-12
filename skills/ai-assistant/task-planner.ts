/**
 * 任务规划器
 * 负责将意图分解为可执行的任务计划
 */

import type {
  UserIntent,
  EntityResult,
  ConversationContext,
  Task,
  ExecutionPlan,
  DataSource,
} from '@/types/ai-assistant';

/**
 * 任务规划器类
 */
export class TaskPlanner {
  /**
   * 生成执行计划
   */
  plan(intent: UserIntent, entities: EntityResult, context: ConversationContext): ExecutionPlan {
    const tasks: Task[] = [];

    switch (intent) {
      case 'health_query':
        tasks.push({
          id: 't1',
          action: 'analyzeHealth',
          params: { merchantId: entities.merchantId },
          dependsOn: [],
          priority: 1,
        });

        // 如果健康度可能偏低，预规划诊断任务
        if (this.shouldPrepareDiagnosis(context)) {
          tasks.push({
            id: 't2',
            action: 'detectRisks',
            params: { merchantId: entities.merchantId },
            dependsOn: ['t1'], // 依赖健康度结果
            priority: 2,
          });
        }
        break;

      case 'risk_diagnosis':
        tasks.push(
          {
            id: 't1',
            action: 'detectRisks',
            params: { merchantId: entities.merchantId },
            dependsOn: [],
            priority: 1,
          },
          {
            id: 't2',
            action: 'diagnose',
            params: { merchantId: entities.merchantId },
            dependsOn: [],
            priority: 1,
          },
          {
            id: 't3',
            action: 'matchCases',
            params: { merchantId: entities.merchantId },
            dependsOn: ['t2'], // 依赖诊断结果
            priority: 2,
          }
        );
        break;

      case 'solution_recommend':
        tasks.push(
          {
            id: 't1',
            action: 'diagnose',
            params: { merchantId: entities.merchantId },
            dependsOn: [],
            priority: 1,
          },
          {
            id: 't2',
            action: 'matchCases',
            params: { merchantId: entities.merchantId },
            dependsOn: ['t1'],
            priority: 2,
          },
          {
            id: 't3',
            action: 'generateSolution',
            params: { merchantId: entities.merchantId },
            dependsOn: ['t1', 't2'], // 依赖多个任务
            priority: 3,
          }
        );
        break;

      case 'data_query':
        // 数据查询通常需要LLM处理
        tasks.push({
          id: 't1',
          action: 'analyzeHealth',
          params: { merchantId: entities.merchantId },
          dependsOn: [],
          priority: 1,
        });
        break;

      case 'general_chat':
        // 通用对话直接使用LLM
        break;

      case 'unknown':
        // 未知意图，尝试用LLM理解
        break;
    }

    return {
      tasks,
      strategy: this.decideStrategy(intent, tasks),
      parallelizable: this.checkParallelizable(tasks),
      confidence: this.calculatePlanConfidence(tasks, context),
    };
  }

  /**
   * 决定执行策略
   */
  private decideStrategy(intent: UserIntent, tasks: Task[]): DataSource {
    // 如果没有任务或是通用对话/未知意图，使用LLM
    if (tasks.length === 0 || intent === 'general_chat' || intent === 'unknown') {
      return 'llm';
    }

    // 数据查询可能需要混合策略
    if (intent === 'data_query') {
      return 'hybrid';
    }

    // 其他情况优先使用技能
    return 'skills';
  }

  /**
   * 检查是否可并行化
   */
  private checkParallelizable(tasks: Task[]): boolean {
    if (tasks.length <= 1) {
      return false;
    }

    // 如果所有任务都无依赖，则可完全并行
    const allIndependent = tasks.every((t) => t.dependsOn.length === 0);
    if (allIndependent) {
      return true;
    }

    // 如果存在至少2个无依赖的任务，则部分可并行
    const independentCount = tasks.filter((t) => t.dependsOn.length === 0).length;
    return independentCount >= 2;
  }

  /**
   * 计算规划置信度
   */
  private calculatePlanConfidence(tasks: Task[], context: ConversationContext): number {
    let confidence = 1.0;

    // 因素1：任务数量（任务越多，复杂度越高，置信度越低）
    if (tasks.length > 3) {
      confidence -= 0.1 * (tasks.length - 3);
    }

    // 因素2：依赖关系复杂度
    const totalDependencies = tasks.reduce((sum, task) => sum + task.dependsOn.length, 0);
    if (totalDependencies > 3) {
      confidence -= 0.05 * (totalDependencies - 3);
    }

    // 因素3：上下文连贯性（如果意图与上一轮相关，提升置信度）
    if (context.lastIntent) {
      const isFollowUp = this.isFollowUpIntent(context.lastIntent, tasks);
      if (isFollowUp) {
        confidence += 0.1;
      }
    }

    return Math.max(0.3, Math.min(1.0, confidence));
  }

  /**
   * 判断是否应该预规划诊断
   */
  private shouldPrepareDiagnosis(context: ConversationContext): boolean {
    // 如果上一轮意图暗示可能有问题，预规划诊断
    if (context.lastIntent === 'risk_diagnosis') {
      return true;
    }

    // 如果最近的消息包含问题关键词
    if (context.recentMessages && context.recentMessages.length > 0) {
      const recentContent = context.recentMessages
        .slice(-3)
        .map((m) => m.content)
        .join(' ');
      const hasProblemIndicators = /问题|风险|下降|低|差|不好/.test(recentContent);
      return hasProblemIndicators;
    }

    return false;
  }

  /**
   * 判断是否是后续意图
   */
  private isFollowUpIntent(lastIntent: UserIntent, tasks: Task[]): boolean {
    // 定义意图流程链
    const intentChains: Record<UserIntent, string[]> = {
      health_query: ['detectRisks', 'diagnose'],
      risk_diagnosis: ['matchCases', 'generateSolution'],
      solution_recommend: ['analyzeHealth', 'diagnose'],
      data_query: ['analyzeHealth'],
      archive_query: [], // 🔥 修复：档案查询不需要执行 skill，直接返回跳转
      general_chat: [],
      unknown: [],
      // ⭐v3.0 new intents
      aggregation_query: ['analyzeHealth', 'detectRisks'],
      risk_statistics: ['detectRisks', 'diagnose'],
      health_overview: ['analyzeHealth'],
      comparison_query: [],
      trend_analysis: [],
      composite_query: ['analyzeHealth', 'detectRisks', 'diagnose'],
    };

    const expectedActions = intentChains[lastIntent] || [];
    const currentActions = tasks.map((t) => t.action as string);

    // 检查是否有交集
    return expectedActions.some((action) => currentActions.includes(action));
  }

  /**
   * 验证计划的可行性
   */
  validatePlan(plan: ExecutionPlan): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 检查1：循环依赖
    const hasCycle = this.detectCyclicDependencies(plan.tasks);
    if (hasCycle) {
      errors.push('检测到循环依赖');
    }

    // 检查2：依赖的任务是否存在
    const taskIds = new Set(plan.tasks.map((t) => t.id));
    for (const task of plan.tasks) {
      for (const depId of task.dependsOn) {
        if (!taskIds.has(depId)) {
          errors.push(`任务 ${task.id} 依赖的任务 ${depId} 不存在`);
        }
      }
    }

    // 检查3：任务参数完整性
    for (const task of plan.tasks) {
      if (!task.params.merchantId && task.action !== 'generateSolution') {
        errors.push(`任务 ${task.id} 缺少必需的 merchantId 参数`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * 检测循环依赖
   */
  private detectCyclicDependencies(tasks: Task[]): boolean {
    const graph = new Map<string, string[]>();

    // 构建依赖图
    for (const task of tasks) {
      graph.set(task.id, task.dependsOn);
    }

    // DFS检测环
    const visited = new Set<string>();
    const recStack = new Set<string>();

    const hasCycleDFS = (taskId: string): boolean => {
      visited.add(taskId);
      recStack.add(taskId);

      const dependencies = graph.get(taskId) || [];
      for (const depId of dependencies) {
        if (!visited.has(depId)) {
          if (hasCycleDFS(depId)) {
            return true;
          }
        } else if (recStack.has(depId)) {
          return true;
        }
      }

      recStack.delete(taskId);
      return false;
    };

    for (const taskId of graph.keys()) {
      if (!visited.has(taskId)) {
        if (hasCycleDFS(taskId)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * 获取任务执行顺序（拓扑排序）
   */
  getExecutionOrder(tasks: Task[]): string[][] {
    const inDegree = new Map<string, number>();
    const adjList = new Map<string, string[]>();

    // 初始化
    for (const task of tasks) {
      inDegree.set(task.id, task.dependsOn.length);
      adjList.set(task.id, []);
    }

    // 构建邻接表
    for (const task of tasks) {
      for (const depId of task.dependsOn) {
        const deps = adjList.get(depId) || [];
        deps.push(task.id);
        adjList.set(depId, deps);
      }
    }

    // 拓扑排序
    const batches: string[][] = [];
    const remaining = new Set(tasks.map((t) => t.id));

    while (remaining.size > 0) {
      // 找出所有入度为0的任务（可以并行执行）
      const batch: string[] = [];
      for (const taskId of remaining) {
        if (inDegree.get(taskId) === 0) {
          batch.push(taskId);
        }
      }

      if (batch.length === 0) {
        // 如果没有入度为0的任务，说明有循环依赖
        break;
      }

      batches.push(batch);

      // 移除这批任务，更新入度
      for (const taskId of batch) {
        remaining.delete(taskId);
        const dependents = adjList.get(taskId) || [];
        for (const depId of dependents) {
          const currentInDegree = inDegree.get(depId) || 0;
          inDegree.set(depId, currentInDegree - 1);
        }
      }
    }

    return batches;
  }
}

/**
 * 导出单例
 */
export const taskPlanner = new TaskPlanner();
