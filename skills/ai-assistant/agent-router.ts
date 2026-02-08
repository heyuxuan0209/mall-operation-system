/**
 * Agent Router - 智能路由器 ⭐v3.0完全重构
 *
 * 核心改进：
 * - 集成 Query Analyzer（LLM驱动的查询理解）
 * - 支持聚合查询、对比分析、趋势分析
 * - 集成重构后的 Intent Classifier、Response Generator
 * - Plan-Execute-Respond 架构
 *
 * 处理流程：
 * Phase 1: Query Analysis → 查询结构化解析
 * Phase 2: Intent Classification → 多意图识别
 * Phase 3: Entity Resolution → 实体解析
 * Phase 4: Execution → 执行（聚合/对比/单商户）
 * Phase 5: Response Generation → LLM动态生成响应
 */

import {
  AgentExecutionResult,
  UserIntent,
  StructuredQuery,
  ResolvedEntity,
  ExtendedExecutionPlan,
  AggregationResult,
  ComparisonResult,
} from '@/types/ai-assistant';
import { Merchant } from '@/types';
import { conversationManager } from '@/utils/ai-assistant/conversationManager';
import { merchantDataManager } from '@/utils/merchantDataManager';

// ⭐v3.0核心模块
import { queryAnalyzer } from './query-analyzer';
import { intentClassifier } from './intent-classifier';
import { aggregationExecutor } from './aggregation-executor';
import { comparisonExecutor } from './comparison-executor';
import { responseGenerator } from './response-generator';
import { entityExtractor } from './entity-extractor';
import { boundaryChecker } from './boundary-checker';

// 现有Skills
import { analyzeHealth } from '@/skills/health-calculator';
import { generateDiagnosisReport } from '@/skills/ai-diagnosis-engine';
import { detectRisks } from '@/skills/risk-detector';
import { enhancedMatchCases } from '@/skills/enhanced-ai-matcher';
import knowledgeBase from '@/data/cases/knowledge_base.json';

export class AgentRouter {
  /**
   * ⭐v3.0核心方法：处理用户输入
   * Plan-Execute-Respond 架构
   */
  async process(
    userInput: string,
    conversationId: string
  ): Promise<AgentExecutionResult> {
    const startTime = Date.now();

    try {
      // ============ Phase 1: Query Analysis ============
      const context = conversationManager.getContext(conversationId) || {
        conversationId,
        recentMessages: [],
        sessionStartTime: new Date().toISOString(),
      };

      const structuredQuery = await queryAnalyzer.analyze(userInput, context);
      console.log('[AgentRouter] Structured query:', structuredQuery);

      // ============ Phase 1.5: Boundary Check ============
      // 🔥 新增：边界检查
      const boundaryCheck = boundaryChecker.checkBoundary(
        userInput,
        structuredQuery.intents[0]
      );

      if (!boundaryCheck.allowed) {
        return {
          success: false,
          content: `😅 ${boundaryCheck.reason}\n\n💡 **建议**：${boundaryCheck.suggestedAction}`,
          metadata: {
            intent: 'boundary_violation',
            dataSource: 'hybrid',
            executionTime: Date.now() - startTime,
          },
          error: 'BOUNDARY_VIOLATION'
        };
      }

      // 检查不确定性
      const uncertaintyCheck = boundaryChecker.checkUncertainty(
        userInput,
        structuredQuery.confidence
      );

      if (uncertaintyCheck.needsHumanIntervention) {
        return {
          success: false,
          content: `⚠️ ${uncertaintyCheck.reason}\n\n如有疑问，请联系运营团队获取专业支持。`,
          metadata: {
            intent: 'uncertain',
            dataSource: 'hybrid',
            executionTime: Date.now() - startTime,
          },
          error: 'UNCERTAIN_REQUEST'
        };
      }

      // ============ Phase 2: Intent Classification ============
      const intents = await intentClassifier.classifyWithLLM(structuredQuery, context);
      console.log('[AgentRouter] Intents:', intents);

      // 更新结构化查询的意图列表
      structuredQuery.intents = intentClassifier.extractMultipleIntents(intents);

      // ============ Phase 3: Entity Resolution ============
      const entities = await this.resolveEntities(structuredQuery, context);
      console.log('[AgentRouter] Resolved entities:', entities);

      // 验证：如果需要商户但未找到，返回错误
      if (structuredQuery.type === 'single_merchant' && !entities.merchantId) {
        return this.createMerchantNotFoundResult(userInput);
      }

      // ============ Phase 4: Build Execution Plan ============
      const executionPlan: ExtendedExecutionPlan = {
        tasks: [],
        strategy: 'hybrid',
        parallelizable: false,
        confidence: structuredQuery.confidence,
        queryType: structuredQuery.type,
        entities,
        aggregations: structuredQuery.aggregations,
      };

      // ============ Phase 5: Execute ============
      let executionResult: any;
      let merchant: Merchant | undefined;

      switch (structuredQuery.type) {
        case 'single_merchant':
          executionResult = await this.executeSingleMerchantPlan(executionPlan, entities);
          merchant = entities.merchantId
            ? merchantDataManager.getMerchant(entities.merchantId) || undefined
            : undefined;
          break;

        case 'aggregation':
          executionResult = await this.executeAggregationPlan(executionPlan);
          break;

        case 'comparison':
          executionResult = await this.executeComparisonPlan(executionPlan);
          break;

        case 'trend_analysis':
          // TODO: 实现趋势分析执行
          executionResult = { message: 'Trend analysis not yet implemented' };
          break;

        default:
          throw new Error(`Unsupported query type: ${structuredQuery.type}`);
      }

      // ============ Phase 6: Generate Response ============
      const content = await responseGenerator.generate(
        structuredQuery,
        executionResult,
        merchant
      );

      const executionTime = Date.now() - startTime;

      return {
        success: true,
        content,
        metadata: {
          dataSource: 'hybrid',
          executionTime,
          intent: structuredQuery.intents[0] || 'unknown',
          merchantId: merchant?.id,
          merchantName: merchant?.name,
        },
      };
    } catch (error) {
      console.error('[AgentRouter] Process failed:', error);
      return this.createErrorResult(userInput, error);
    }
  }

  /**
   * 解析实体
   */
  private async resolveEntities(
    query: StructuredQuery,
    context: any
  ): Promise<ResolvedEntity> {
    const entities = query.entities;

    // 单商户查询
    if (query.type === 'single_merchant') {
      const merchantName = entities.merchants?.[0];

      if (!merchantName) {
        // 🔥 新增：尝试entity-extractor作为fallback
        const extractedEntity = entityExtractor.extractMerchant(
          query.originalInput,
          context.merchantId
        );

        if (extractedEntity.matched && extractedEntity.merchantId) {
          return {
            type: 'single_merchant',
            merchantId: extractedEntity.merchantId,
            merchantName: extractedEntity.merchantName,
          };
        }

        // 尝试从上下文获取
        const contextMerchant = conversationManager.getCurrentMerchant(context.conversationId);
        if (contextMerchant) {
          return {
            type: 'single_merchant',
            merchantId: contextMerchant.id,
            merchantName: contextMerchant.name,
          };
        }
        return { type: 'single_merchant' };
      }

      // 查找商户
      const merchant = merchantDataManager.findMerchantByName(merchantName);
      if (merchant) {
        return {
          type: 'single_merchant',
          merchantId: merchant.id,
          merchantName: merchant.name,
        };
      }

      return { type: 'single_merchant' };
    }

    // 聚合查询
    if (query.type === 'aggregation') {
      return {
        type: 'aggregation',
        filters: query.filters,
        timeRange: entities.timeRange,
      };
    }

    // 对比查询
    if (query.type === 'comparison') {
      // 如果是商户vs商户
      if (entities.merchants && entities.merchants.length === 2) {
        const merchant1 = merchantDataManager.findMerchantByName(entities.merchants[0]);
        const merchant2 = merchantDataManager.findMerchantByName(entities.merchants[1]);

        return {
          type: 'comparison',
          merchants: [
            { id: merchant1?.id || '', name: merchant1?.name || entities.merchants[0] },
            { id: merchant2?.id || '', name: merchant2?.name || entities.merchants[1] },
          ],
        };
      }

      // 如果是单商户时间对比
      const merchantName = entities.merchants?.[0] ||
                           conversationManager.getCurrentMerchant(context.conversationId)?.name;

      const merchant = merchantName
        ? merchantDataManager.findMerchantByName(merchantName)
        : undefined;

      return {
        type: 'comparison',
        merchantId: merchant?.id,
        merchantName: merchant?.name,
        timeRange: entities.timeRange,
        comparisonTarget: entities.comparisonTarget,
      };
    }

    return { type: 'single_merchant' };
  }

  /**
   * 执行单商户查询
   */
  private async executeSingleMerchantPlan(
    plan: ExtendedExecutionPlan,
    entities: ResolvedEntity
  ): Promise<any> {
    const merchant = entities.merchantId
      ? merchantDataManager.getMerchant(entities.merchantId)
      : undefined;

    if (!merchant) {
      throw new Error('Merchant not found');
    }

    // 🔥 修复：从entities获取查询信息，并检查intents
    const queryIntents = (plan as any).queryIntents || [];

    const results: any = {
      merchant,
      health: undefined,
      risks: undefined,
      diagnosis: undefined,
      cases: undefined,
    };

    // 健康度分析（总是执行）
    results.health = analyzeHealth(merchant.metrics);

    // AI诊断（如果健康度低或有风险意图，总是执行）
    const shouldDiagnose = merchant.totalScore < 70 ||
                          queryIntents.includes('risk_diagnosis') ||
                          queryIntents.includes('solution_recommend');

    if (shouldDiagnose) {
      results.diagnosis = generateDiagnosisReport(merchant, knowledgeBase as any);
    }

    // 风险检测（如果健康度低，总是执行）
    if (merchant.totalScore < 70 || queryIntents.includes('risk_diagnosis')) {
      results.risks = detectRisks(merchant);
    }

    // 🔥 修复：案例匹配（如果有帮扶意图或健康度低，总是执行）
    const shouldMatchCases = queryIntents.includes('solution_recommend') ||
                            merchant.totalScore < 70 ||
                            merchant.riskLevel === 'high' ||
                            merchant.riskLevel === 'critical';

    if (shouldMatchCases) {
      const diagnosis = results.diagnosis || generateDiagnosisReport(merchant, knowledgeBase as any);
      results.cases = enhancedMatchCases({
        merchantName: merchant.name,
        merchantCategory: merchant.category,
        problemTags: diagnosis.tags || [],
        metrics: merchant.metrics,
        riskLevel: merchant.riskLevel,
        symptoms: diagnosis.symptoms,
        description: diagnosis.diagnosis,
        knowledgeBase: knowledgeBase as any,
      });
    }

    return results;
  }

  /**
   * 执行聚合查询
   */
  private async executeAggregationPlan(
    plan: ExtendedExecutionPlan
  ): Promise<AggregationResult> {
    return aggregationExecutor.execute(plan);
  }

  /**
   * 执行对比查询
   */
  private async executeComparisonPlan(
    plan: ExtendedExecutionPlan
  ): Promise<ComparisonResult> {
    return comparisonExecutor.execute(plan);
  }

  /**
   * 创建商户未找到响应
   */
  private createMerchantNotFoundResult(userInput: string): AgentExecutionResult {
    // 🔥 新增：尝试提取用户输入的商户名关键词，给出建议
    const keywords = userInput.split(/[\s,，、。？！]/);
    const suggestedMerchants = keywords
      .flatMap(kw => entityExtractor.suggestMerchants(kw, 3))
      .slice(0, 5);

    const suggestions = suggestedMerchants.length > 0
      ? `\n\n您是否在找：\n${suggestedMerchants.map(m => `- ${m.name} (${m.category})`).join('\n')}`
      : '';

    return {
      success: false,
      content: `😅 抱歉，我没有找到您提到的商户。${suggestions}\n\n` +
               `💡 **提示**：\n` +
               `- 请使用商户全名或简称\n` +
               `- 也可以说"查看商户列表"浏览所有商户\n` +
               `- 或在健康度监控页面选择商户后提问`,
      metadata: {
        dataSource: 'skills',
        executionTime: 0,
        intent: 'unknown',
      },
      error: 'MERCHANT_NOT_FOUND',
    };
  }

  /**
   * 创建错误响应
   */
  private createErrorResult(userInput: string, error: any): AgentExecutionResult {
    console.error('[AgentRouter] Error:', error);

    return {
      success: false,
      content: `抱歉，处理您的请求时遇到错误。\n\n` +
               `请稍后重试，或重新表述您的问题。\n\n` +
               `错误信息：${error.message || '未知错误'}`,
      metadata: {
        dataSource: 'skills',
        executionTime: 0,
        intent: 'unknown',
      },
      error: error.message || 'Unknown error',
    };
  }
}

// 导出单例实例
export const agentRouter = new AgentRouter();
