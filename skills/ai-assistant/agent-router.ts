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

// ⭐Phase 1 新增模块
import { entityRecognitionService } from './entity-recognition-service';
import { entityDisambiguationService } from './entity-disambiguation-service';
import { confidenceManager } from './confidence-manager';
import { contextSwitchDetector } from './context-switch-detector';

// 现有Skills
import { analyzeHealth } from '@/skills/health-calculator';
import { generateDiagnosisReport, generateEnhancedDiagnosisReport } from '@/skills/ai-diagnosis-engine';
import { detectRisks } from '@/skills/risk-detector';
import { enhancedMatchCases, enhancedMatchCasesV3 } from '@/skills/enhanced-ai-matcher';
import knowledgeBase from '@/data/cases/knowledge_base.json';

// ⭐演示模式
import { isDemoMode, getDemoResponse } from './demo-mode';

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
      // ============ Phase 0: Demo Mode Check ============
      // 🎬 演示模式：返回固定响应，确保演示视频与旁白音频一致
      const demoResponse = getDemoResponse(userInput);
      if (demoResponse) {
        console.log('[AgentRouter] 🎬 演示模式激活，返回固定响应');
        return {
          success: true,
          content: demoResponse.content,
          metadata: {
            intent: demoResponse.intent as any,
            dataSource: 'demo',
            executionTime: Date.now() - startTime,
            suggestedActions: demoResponse.suggestedActions,
          },
        };
      }

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
            intent: 'general_chat',  // 修复类型错误：使用合法的UserIntent
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
            intent: 'unknown',  // 修复类型错误：使用合法的UserIntent
            dataSource: 'hybrid',
            executionTime: Date.now() - startTime,
          },
          error: 'UNCERTAIN_REQUEST'
        };
      }

      // ============ Phase 2: Intent Classification ============
      const intents = await intentClassifier.classifyWithLLM(structuredQuery, context);
      console.log('[AgentRouter] Intents from classifier:', intents);

      // 更新结构化查询的意图列表
      structuredQuery.intents = intentClassifier.extractMultipleIntents(intents);
      console.log('[AgentRouter] Extracted intents:', structuredQuery.intents);

      // ============ Phase 3: Entity Resolution ============
      const entities = await this.resolveEntities(structuredQuery, context);
      console.log('[AgentRouter] Resolved entities:', entities);

      // ⭐Phase 2: 处理需要用户确认的情况
      if (entities.needsClarification) {
        return {
          success: false,
          content: entities.clarificationPrompt || '请明确您要查询的商户',
          metadata: {
            intent: structuredQuery.intents[0] || 'unknown',
            dataSource: 'hybrid',
            executionTime: Date.now() - startTime,
            needsClarification: true,
            candidates: entities.candidates,
          },
          error: 'NEEDS_CLARIFICATION'
        };
      }

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

      // 🔥 修复：将意图信息传递给执行计划
      (executionPlan as any).queryIntents = structuredQuery.intents;

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
      // ⭐Phase 2: 添加置信度警告到响应中
      let content = await responseGenerator.generate(
        structuredQuery,
        executionResult,
        merchant
      );

      // 如果有置信度警告，添加到响应开头
      if (entities.confidenceWarning) {
        content = `${entities.confidenceWarning}\n\n${content}`;
      }

      const executionTime = Date.now() - startTime;

      // ============ Phase 7: Generate Suggested Action ============
      console.log('[AgentRouter] Generating suggested action for:', {
        intents: structuredQuery.intents,
        merchantId: merchant?.id,
        merchantName: merchant?.name,
      });

      const suggestedAction = this.generateSuggestedAction(
        structuredQuery,
        merchant,
        executionResult
      );

      console.log('[AgentRouter] Generated suggested action:', suggestedAction);

      return {
        success: true,
        content,
        metadata: {
          dataSource: 'hybrid',
          executionTime,
          intent: structuredQuery.intents[0] || 'unknown',
          merchantId: merchant?.id,
          merchantName: merchant?.name,
          // ⭐Phase 2: 添加置信度信息
          confidence: entities.confidence,
        },
        suggestedAction,
      };
    } catch (error) {
      console.error('[AgentRouter] Process failed:', error);
      return this.createErrorResult(userInput, error);
    }
  }

  /**
   * ⭐Phase 2: 解析实体（集成新模块）
   */
  private async resolveEntities(
    query: StructuredQuery,
    context: any
  ): Promise<ResolvedEntity> {
    const entities = query.entities;

    // 单商户查询
    if (query.type === 'single_merchant') {
      const merchantName = entities.merchants?.[0];

      // Step 1: 检测上下文切换
      const currentContext = conversationManager.getCurrentMerchant(context.conversationId);
      const switchDetection = contextSwitchDetector.detectSwitch(
        query.originalInput,
        currentContext ? {
          conversationId: context.conversationId,
          merchantId: currentContext.id,
          merchantName: currentContext.name,
          recentMessages: context.recentMessages || [],
          sessionStartTime: context.sessionStartTime || new Date().toISOString(),
        } : undefined
      );

      console.log('[AgentRouter] Context switch detection:', switchDetection);

      // Step 2: 使用统一实体识别服务
      const recognitionCandidates = entityRecognitionService.recognize(
        query.originalInput,
        currentContext ? {
          conversationId: context.conversationId,
          merchantId: currentContext.id,
          merchantName: currentContext.name,
          recentMessages: context.recentMessages || [],
          sessionStartTime: context.sessionStartTime || new Date().toISOString(),
        } : undefined
      );

      console.log('[AgentRouter] Entity recognition candidates:', recognitionCandidates);

      // Step 3: 消歧处理
      const disambiguationResult = entityDisambiguationService.disambiguate(
        recognitionCandidates,
        query.originalInput,
        currentContext ? {
          conversationId: context.conversationId,
          merchantId: currentContext.id,
          merchantName: currentContext.name,
          recentMessages: context.recentMessages || [],
          sessionStartTime: context.sessionStartTime || new Date().toISOString(),
        } : undefined
      );

      console.log('[AgentRouter] Disambiguation result:', disambiguationResult);

      // Step 4: 验证消歧结果
      const validation = entityDisambiguationService.validateResult(disambiguationResult, query.originalInput);

      if (!validation.valid) {
        console.error('[AgentRouter] Invalid disambiguation result:', validation.warning);
      }

      // Step 5: 处理需要用户确认的情况
      if (disambiguationResult.needsClarification) {
        return {
          type: 'single_merchant',
          needsClarification: true,
          clarificationPrompt: disambiguationResult.clarificationPrompt,
          candidates: disambiguationResult.candidates,
        };
      }

      // Step 6: 使用置信度管理器决定是否执行
      const confidenceDecision = confidenceManager.shouldExecute(disambiguationResult.confidence);
      console.log('[AgentRouter] Confidence decision:', confidenceDecision);

      // Step 7: 返回结果
      if (disambiguationResult.matched && disambiguationResult.merchantId) {
        return {
          type: 'single_merchant',
          merchantId: disambiguationResult.merchantId,
          merchantName: disambiguationResult.merchantName,
          confidence: disambiguationResult.confidence,
          confidenceWarning: confidenceDecision.showWarning ?
            confidenceManager.generateConfidenceMessage(disambiguationResult.confidence) : undefined,
        };
      }

      // Fallback: 如果新模块没有找到，尝试旧逻辑
      if (merchantName) {
        const merchant = merchantDataManager.findMerchantByName(merchantName);
        if (merchant) {
          return {
            type: 'single_merchant',
            merchantId: merchant.id,
            merchantName: merchant.name,
          };
        }
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
      console.log('[AgentRouter] Resolving comparison entities:', query.entities);

      // 如果是商户vs商户
      if (entities.merchants && entities.merchants.length === 2) {
        console.log('[AgentRouter] Merchant names:', entities.merchants);
        const merchant1 = merchantDataManager.findMerchantByName(entities.merchants[0]);
        const merchant2 = merchantDataManager.findMerchantByName(entities.merchants[1]);

        console.log('[AgentRouter] Found merchants:', { merchant1: merchant1?.name, merchant2: merchant2?.name });

        return {
          type: 'comparison',
          merchants: [
            { id: merchant1?.id || '', name: merchant1?.name || entities.merchants[0] },
            { id: merchant2?.id || '', name: merchant2?.name || entities.merchants[1] },
          ],
          comparisonTarget: 'merchant_vs_merchant',  // 🔥 修复：添加缺失的字段
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

    // 🔥 新增：如果是档案查询，直接返回商户信息，不执行任何分析
    if (queryIntents.includes('archive_query')) {
      return {
        merchant,
        isArchiveQuery: true, // 标记为档案查询
      };
    }

    const results: any = {
      merchant,
      health: undefined,
      risks: undefined,
      diagnosis: undefined,
      cases: undefined,
    };

    // 健康度分析（总是执行）
    results.health = analyzeHealth(merchant.metrics);

    // ⭐v3.0: AI诊断（优先使用增强版）
    const shouldDiagnose = merchant.totalScore < 70 ||
                          queryIntents.includes('risk_diagnosis') ||
                          queryIntents.includes('solution_recommend');

    if (shouldDiagnose) {
      try {
        // 尝试使用v3.0 LLM因果推理诊断
        results.diagnosis = await generateEnhancedDiagnosisReport(merchant, knowledgeBase as any);
        console.log('[AgentRouter] Using v3.0 enhanced diagnosis with LLM');
      } catch (error) {
        console.warn('[AgentRouter] Enhanced diagnosis failed, falling back to v2.0:', error);
        // 降级到v2.0规则诊断
        results.diagnosis = generateDiagnosisReport(merchant, knowledgeBase as any);
      }
    }

    // 风险检测（如果健康度低，总是执行）
    if (merchant.totalScore < 70 || queryIntents.includes('risk_diagnosis')) {
      results.risks = detectRisks(merchant);
    }

    // ⭐v3.0: 案例匹配（优先使用语义相似度版本）
    const shouldMatchCases = queryIntents.includes('solution_recommend') ||
                            merchant.totalScore < 70 ||
                            merchant.riskLevel === 'high' ||
                            merchant.riskLevel === 'critical';

    if (shouldMatchCases) {
      const diagnosis = results.diagnosis || generateDiagnosisReport(merchant, knowledgeBase as any);

      try {
        // 尝试使用v3.0 LLM语义相似度匹配
        const rawCases = await enhancedMatchCasesV3({
          merchantName: merchant.name,
          merchantCategory: merchant.category,
          problemTags: diagnosis.problemTags || diagnosis.tags || [],
          metrics: merchant.metrics,
          riskLevel: merchant.riskLevel,
          symptoms: diagnosis.symptoms,
          description: diagnosis.diagnosis,
          knowledgeBase: knowledgeBase as any,
        });

        // ⭐v3.0 质量过滤：移除低质量案例
        results.cases = this.filterLowQualityCases(rawCases, merchant);
        console.log('[AgentRouter] Using v3.0 semantic similarity matching');
      } catch (error) {
        console.warn('[AgentRouter] Semantic matching failed, falling back to v2.2:', error);
        // 降级到v2.2标签匹配
        const rawCases = enhancedMatchCases({
          merchantName: merchant.name,
          merchantCategory: merchant.category,
          problemTags: diagnosis.problemTags || diagnosis.tags || [],
          metrics: merchant.metrics,
          riskLevel: merchant.riskLevel,
          symptoms: diagnosis.symptoms,
          description: diagnosis.diagnosis,
          knowledgeBase: knowledgeBase as any,
        });

        // ⭐v3.0 质量过滤
        results.cases = this.filterLowQualityCases(rawCases, merchant);
      }
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
   * ⭐v3.0新增：过滤低质量案例
   */
  private filterLowQualityCases(casesResult: any, merchant: Merchant): any {
    if (!casesResult?.matchedCases) {
      return casesResult;
    }

    const filtered = casesResult.matchedCases.filter((c: any) => {
      // 规则1: 成功率必须 >= 30%
      if (c.successProbability < 30) {
        console.log(`[QualityFilter] Removed case ${c.case?.id}: Low success rate (${c.successProbability}%)`);
        return false;
      }

      // 规则2: 如果有v3.0语义相似度，overall必须 >= 40分
      if (c.semanticSimilarity?.overall !== undefined && c.semanticSimilarity.overall < 40) {
        console.log(`[QualityFilter] Removed case ${c.case?.id}: Low semantic similarity (${c.semanticSimilarity.overall})`);
        return false;
      }

      // 规则3: 如果业态不同，必须有高语义相似度才保留
      const caseCategory = c.case?.industry?.split('-')[0];
      const merchantCategory = merchant.category?.split('-')[0];
      const categoriesMatch = caseCategory === merchantCategory;

      if (!categoriesMatch) {
        // 业态不同，检查是否有v3.0语义相似度且足够高
        const hasSemantic = c.semanticSimilarity?.overall !== undefined;
        const highSemantic = c.semanticSimilarity?.overall >= 70;

        if (!hasSemantic || !highSemantic) {
          console.log(`[QualityFilter] Removed case ${c.case?.id}: Category mismatch without high semantic similarity`);
          return false;
        }
      }

      return true;
    });

    console.log(`[QualityFilter] Filtered cases: ${casesResult.matchedCases.length} → ${filtered.length}`);

    return {
      ...casesResult,
      matchedCases: filtered,
      topSuggestions: filtered.slice(0, 3).map((c: any) => c.case?.action),
    };
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
   * 生成建议操作（Dashboard联动）
   */
  private generateSuggestedAction(
    query: StructuredQuery,
    merchant: Merchant | undefined,
    executionResult: any
  ): import('@/types/ai-assistant').SuggestedAction | undefined {
    // 🔥 场景0: 档案查询 - 最高优先级
    console.log('[AgentRouter] Checking archive_query:', {
      hasArchiveIntent: query.intents.includes('archive_query'),
      intents: query.intents,
      hasMerchant: !!merchant,
      merchantId: merchant?.id,
    });

    if (query.intents.includes('archive_query') && merchant) {
      return {
        type: 'navigate_archives',
        data: {
          merchantId: merchant.id,
          merchantName: merchant.name,
        },
        description: `查看 ${merchant.name} 历史帮扶档案`,
      };
    }

    // 场景1: 单商户查询 - 提供查看详情/档案/创建任务
    if (query.type === 'single_merchant' && merchant) {
      // 优先级：高风险商户 → 创建帮扶任务
      if (merchant.riskLevel === 'high' || merchant.riskLevel === 'critical') {
        return {
          type: 'create_task',
          data: {
            merchantId: merchant.id,
            merchantName: merchant.name,
            riskLevel: merchant.riskLevel,
          },
          description: `为 ${merchant.name} 创建帮扶任务`,
        };
      }

      // 默认：查看商户健康度详情
      return {
        type: 'navigate_health',
        data: {
          merchantId: merchant.id,
          merchantName: merchant.name,
        },
        description: `查看 ${merchant.name} 详细信息`,
      };
    }

    // 场景2: 聚合查询 - 提供查看健康度监控页面
    if (query.type === 'aggregation') {
      const filters = query.filters;
      return {
        type: 'navigate_health',
        data: {
          filters, // 传递筛选条件给健康度监控页
        },
        description: '查看健康度监控（完整列表）',
      };
    }

    // 场景3: 帮扶案例相关 - 提供查看案例库
    if (query.intents.includes('solution_recommend') && executionResult.cases) {
      return {
        type: 'navigate_knowledge',
        data: {
          caseId: executionResult.cases.matchedCases?.[0]?.case?.id,
        },
        description: '查看完整帮扶案例',
      };
    }

    // 默认：无建议操作
    return undefined;
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
