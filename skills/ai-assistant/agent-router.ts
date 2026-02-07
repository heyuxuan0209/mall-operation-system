/**
 * Agent 路由器
 * 核心编排引擎：路由意图 → 执行Skills/LLM/Hybrid → 返回响应
 */

import { Merchant } from '@/types';
import {
  UserIntent,
  AgentExecutionResult,
  DataSource,
  AgentRouteConfig,
} from '@/types/ai-assistant';
import { merchantDataManager } from '@/utils/merchantDataManager';
import { intentClassifier } from './intent-classifier';
import { entityExtractor } from './entity-extractor';
import { responseGenerator } from './response-generator';
import { conversationContextManager } from './conversation-context';
import { llmIntegration } from './llm-integration';
import { cacheManager } from '@/utils/ai-assistant/cacheManager';

// Import existing skills
import { analyzeHealth } from '@/skills/health-calculator';
import { generateDiagnosisReport } from '@/skills/ai-diagnosis-engine';
import { predictHealthTrend } from '@/skills/trend-predictor';
import { detectRisks } from '@/skills/risk-detector';
import { enhancedMatchCases } from '@/skills/enhanced-ai-matcher';
import knowledgeBase from '@/data/cases/knowledge_base.json';

export class AgentRouter {
  /**
   * 处理用户输入的主入口
   */
  async process(
    userInput: string,
    conversationId: string,
    config?: Partial<AgentRouteConfig>
  ): Promise<AgentExecutionResult> {
    const startTime = Date.now();

    try {
      // 步骤1: 意图识别
      const intentResult = intentClassifier.classify(userInput);
      const intent = intentResult.intent;

      // 步骤2: 实体提取
      const contextMerchant = conversationContextManager.getMerchantFromContext(conversationId);
      const entityResult = entityExtractor.extractMerchant(
        userInput,
        contextMerchant?.id
      );

      // 步骤3: 商户验证
      if (this.needsMerchant(intent) && !entityResult.matched) {
        return this.createMerchantNotFoundResult(userInput);
      }

      const merchant = entityResult.merchantId
        ? merchantDataManager.getMerchant(entityResult.merchantId) || undefined
        : undefined;

      // 步骤4: 决策执行策略
      const strategy = this.decideStrategy(intent, merchant, config);

      // 步骤5: 执行
      let result: AgentExecutionResult;

      if (strategy === 'skills') {
        result = await this.executeWithSkills(intent, merchant!, conversationId);
      } else if (strategy === 'llm') {
        result = await this.executeWithLLM(intent, userInput, merchant, conversationId);
      } else {
        result = await this.executeHybrid(intent, merchant!, conversationId);
      }

      // 添加执行时间
      result.metadata.executionTime = Date.now() - startTime;
      result.metadata.intent = intent;
      if (merchant) {
        result.metadata.merchantId = merchant.id;
        result.metadata.merchantName = merchant.name;
      }

      return result;
    } catch (error) {
      console.error('[AgentRouter] Process error:', error);
      return this.createErrorResult(error);
    }
  }

  /**
   * 使用Skills执行（快速、免费）
   */
  private async executeWithSkills(
    intent: UserIntent,
    merchant: Merchant,
    conversationId: string
  ): Promise<AgentExecutionResult> {
    const cacheKey = `skills:${intent}:${merchant.id}`;

    // 检查缓存
    const cached = cacheManager.get<AgentExecutionResult>(cacheKey);
    if (cached) {
      return cached;
    }

    let content = '';
    let suggestedAction;
    let suggestedActions;

    switch (intent) {
      case 'health_query':
        const healthResult = await this.executeHealthQuery(merchant);
        content = healthResult.content;
        suggestedAction = healthResult.suggestedAction;
        suggestedActions = healthResult.suggestedActions;
        break;

      case 'risk_diagnosis':
        const diagResult = await this.executeRiskDiagnosis(merchant);
        content = diagResult.content;
        suggestedAction = diagResult.suggestedAction;
        suggestedActions = diagResult.suggestedActions;
        break;

      case 'data_query':
        content = await this.executeDataQuery(merchant);
        break;

      default:
        content = responseGenerator.generateGeneralChatResponse('');
    }

    const result: AgentExecutionResult = {
      success: true,
      content,
      metadata: {
        dataSource: 'skills',
        executionTime: 0,
        suggestedActions,
      },
      suggestedAction,
    };

    // 缓存结果
    cacheManager.set(cacheKey, result, 10 * 60 * 1000); // 10分钟

    return result;
  }

  /**
   * 使用LLM执行（深度、个性化）
   */
  private async executeWithLLM(
    intent: UserIntent,
    userInput: string,
    merchant: Merchant | undefined,
    conversationId: string
  ): Promise<AgentExecutionResult> {
    if (!llmIntegration.isAvailable()) {
      // 降级到Skills
      if (merchant) {
        return await this.executeWithSkills(intent, merchant, conversationId);
      } else {
        return {
          success: true,
          content: responseGenerator.generateGeneralChatResponse(userInput),
          metadata: { dataSource: 'skills' },
        };
      }
    }

    try {
      const context = conversationContextManager.generateContextSummary(conversationId);
      const response = await llmIntegration.chat(userInput, context);

      return {
        success: true,
        content: response,
        metadata: {
          dataSource: 'llm',
          llmModel: process.env.NEXT_PUBLIC_LLM_MODEL || 'unknown',
        },
      };
    } catch (error) {
      console.error('[AgentRouter] LLM execution failed:', error);
      // 降级到Skills
      if (merchant) {
        return await this.executeWithSkills(intent, merchant, conversationId);
      } else {
        return this.createErrorResult(error);
      }
    }
  }

  /**
   * 混合模式执行（Skills + LLM）
   */
  private async executeHybrid(
    intent: UserIntent,
    merchant: Merchant,
    conversationId: string
  ): Promise<AgentExecutionResult> {
    // 步骤1: Skills获取基础数据
    const skillsResult = await this.executeWithSkills(intent, merchant, conversationId);

    // 步骤2: 如果LLM可用，用LLM增强
    if (llmIntegration.isAvailable() && intent === 'solution_recommend') {
      try {
        // 获取诊断数据和案例
        const diagnosis = await this.getDiagnosisData(merchant);
        const cases = await this.getMatchedCases(merchant);

        // LLM生成个性化方案
        const llmResponse = await llmIntegration.generateSolutionPlan(
          merchant,
          diagnosis,
          cases
        );

        // 融合Skills和LLM的结果
        let hybridContent = `${llmResponse}\n\n---\n\n`;
        hybridContent += `## 📊 基础分析（系统检测）\n\n`;
        hybridContent += skillsResult.content;

        return {
          success: true,
          content: hybridContent,
          metadata: {
            dataSource: 'hybrid',
            llmModel: process.env.NEXT_PUBLIC_LLM_MODEL || 'unknown',
          },
          suggestedAction: skillsResult.suggestedAction,
        };
      } catch (error) {
        console.error('[AgentRouter] Hybrid LLM failed, falling back to skills:', error);
        return skillsResult;
      }
    }

    return skillsResult;
  }

  /**
   * 执行健康度查询
   */
  private async executeHealthQuery(merchant: Merchant): Promise<{
    content: string;
    suggestedAction?: any;
    suggestedActions?: Array<{ type: string; merchantId?: string; merchantName?: string }>;
  }> {
    const healthData = analyzeHealth(merchant.metrics);

    // 检查是否需要触发诊断
    const shouldDiagnose = this.checkDiagnosisTrigger(merchant);

    // 生成基础健康度报告（带建议操作）
    const healthResponse = responseGenerator.generateHealthQueryResponse(
      merchant,
      healthData,
      false, // 不在健康度报告中显示警告
      true // 包含建议操作
    );

    let content = healthResponse.content;
    let suggestedAction;
    let suggestedActions = healthResponse.suggestedActions;

    // 如果需要诊断，实际执行诊断
    if (shouldDiagnose) {
      // 执行风险检测
      const risks = detectRisks(merchant);

      // 生成诊断报告
      const diagnosis = generateDiagnosisReport(
        merchant,
        knowledgeBase
      );

      // 添加诊断结果到内容（优化显示）
      content += `\n\n---\n\n## 🔍 深度诊断分析\n\n`;
      content += `> ⚠️ 检测到健康度异常，以下是详细诊断报告：\n\n`;

      const diagnosisResponse = responseGenerator.generateRiskDiagnosisResponse(
        merchant,
        { ...diagnosis, risks: risks.risks },
        true // 包含建议操作
      );

      content += diagnosisResponse.content;

      // 创建建议操作
      suggestedAction = {
        type: 'create_task',
        data: { merchant, diagnosis },
        description: '为该商户创建帮扶任务',
      };

      // 合并建议操作
      if (diagnosisResponse.suggestedActions) {
        suggestedActions = diagnosisResponse.suggestedActions;
      }
    } else {
      // 健康度正常，只给出温和的建议（减少行动卡片）
      if (merchant.totalScore < 85) {
        // 健康度偏低但不触发自动诊断，只给查看详情的选项
        suggestedActions = [
          { type: 'view_health', merchantId: merchant.id, merchantName: merchant.name },
        ];
      } else {
        // 健康度良好，不显示行动卡片（让用户自由对话）
        suggestedActions = undefined;
      }
    }

    return { content, suggestedAction, suggestedActions };
  }

  /**
   * 执行风险诊断
   */
  private async executeRiskDiagnosis(merchant: Merchant): Promise<{
    content: string;
    suggestedAction?: any;
    suggestedActions?: Array<{ type: string; merchantId?: string; merchantName?: string }>;
  }> {
    // 检测风险
    const risks = detectRisks(merchant);

    // AI诊断
    const diagnosis = generateDiagnosisReport(
      merchant,
      knowledgeBase
    );

    const diagnosisResponse = responseGenerator.generateRiskDiagnosisResponse(
      merchant,
      { ...diagnosis, risks: risks.risks },
      true // 包含建议操作
    );

    const content = diagnosisResponse.content;
    const suggestedActions = diagnosisResponse.suggestedActions;

    // 如果需要创建任务
    let suggestedAction;
    if (this.checkDiagnosisTrigger(merchant)) {
      suggestedAction = {
        type: 'create_task',
        data: { merchant, diagnosis },
        description: '为该商户创建帮扶任务',
      };
    }

    return { content, suggestedAction, suggestedActions };
  }

  /**
   * 执行数据查询
   */
  private async executeDataQuery(merchant: Merchant): Promise<string> {
    return this.executeHealthQuery(merchant);
  }

  /**
   * 获取诊断数据
   */
  private async getDiagnosisData(merchant: Merchant): Promise<any> {
    return generateDiagnosisReport(merchant, knowledgeBase);
  }

  /**
   * 获取匹配的案例
   */
  private async getMatchedCases(merchant: Merchant): Promise<any[]> {
    const diagnosis = await this.getDiagnosisData(merchant);

    // Map critical to high for the matcher
    const riskLevel = merchant.riskLevel === 'critical' ? 'high' : merchant.riskLevel;

    const result = enhancedMatchCases({
      merchantName: merchant.name,
      merchantCategory: merchant.category,
      problemTags: diagnosis.problemTags || [],
      knowledgeBase,
      metrics: merchant.metrics,
      riskLevel: riskLevel as 'none' | 'low' | 'medium' | 'high',
    });

    return result.matchedCases || [];
  }

  /**
   * 决策执行策略
   */
  private decideStrategy(
    intent: UserIntent,
    merchant: Merchant | undefined,
    config?: Partial<AgentRouteConfig>
  ): DataSource {
    // 强制指定策略
    if (config?.forceLLM) return 'llm';
    if (config?.forceSkills) return 'skills';

    // 没有商户，使用LLM通用对话
    if (!merchant) return 'llm';

    // 根据意图决策
    switch (intent) {
      case 'health_query':
      case 'data_query':
        return 'skills';

      case 'risk_diagnosis':
        // 风险数量多，使用混合模式
        const risks = detectRisks(merchant);
        return risks.risks.length > 3 ? 'hybrid' : 'skills';

      case 'solution_recommend':
        return 'hybrid';

      case 'general_chat':
        return 'llm';

      default:
        return 'skills';
    }
  }

  /**
   * 检查是否需要触发诊断
   * 只在健康度严重偏低或高风险时才自动诊断
   */
  private checkDiagnosisTrigger(merchant: Merchant): boolean {
    const riskLevelMap: Record<string, number> = {
      none: 0,
      low: 1,
      medium: 2,
      high: 3,
      critical: 4,
    };

    // 严格条件：健康度 < 70 且风险等级 >= high
    // 或者健康度 < 60
    const isCriticalHealth = merchant.totalScore < 60;
    const isHighRisk = merchant.totalScore < 70 && riskLevelMap[merchant.riskLevel] >= 3;

    return isCriticalHealth || isHighRisk;
  }

  /**
   * 检查意图是否需要商户信息
   */
  private needsMerchant(intent: UserIntent): boolean {
    return ['health_query', 'risk_diagnosis', 'solution_recommend', 'data_query'].includes(
      intent
    );
  }

  /**
   * 创建商户未找到结果
   */
  private createMerchantNotFoundResult(userInput: string): AgentExecutionResult {
    const suggestions = entityExtractor.suggestMerchants(userInput, 5);
    const content = responseGenerator.generateMerchantNotFoundResponse(
      userInput,
      suggestions.map((m) => m.name)
    );

    return {
      success: false,
      content,
      metadata: {
        dataSource: 'skills',
      },
      error: 'Merchant not found',
    };
  }

  /**
   * 创建错误结果
   */
  private createErrorResult(error: any): AgentExecutionResult {
    const content = responseGenerator.generateErrorResponse(error);

    return {
      success: false,
      content,
      metadata: {
        dataSource: 'skills',
      },
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// 导出单例实例
export const agentRouter = new AgentRouter();
