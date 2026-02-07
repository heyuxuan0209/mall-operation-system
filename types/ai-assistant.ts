/**
 * AI Assistant 类型定义
 * 包含对话、消息、反馈等核心类型
 */

/**
 * 用户意图类型
 */
export type UserIntent =
  | 'health_query'         // 健康度查询
  | 'risk_diagnosis'       // 风险诊断
  | 'solution_recommend'   // 方案推荐
  | 'data_query'          // 数据查询
  | 'general_chat'        // 通用对话
  | 'unknown';            // 未知意图

/**
 * 数据来源类型
 */
export type DataSource = 'skills' | 'llm' | 'hybrid';

/**
 * LLM 提供商
 */
export type LLMProvider = 'openai' | 'anthropic' | 'qwen';

/**
 * 消息角色
 */
export type MessageRole = 'user' | 'assistant' | 'system';

/**
 * 对话状态
 */
export type ConversationStatus = 'active' | 'archived';

/**
 * 效果评价
 */
export type Effectiveness = 'high' | 'medium' | 'low';

/**
 * 操作类型
 */
export type ActionType =
  | 'create_task'
  | 'send_notification'
  | 'update_merchant'
  | 'navigate_task'
  | 'navigate_inspection'
  | 'navigate_health'
  | 'navigate_archives'
  | 'navigate_knowledge';

/**
 * 消息反馈
 */
export interface MessageFeedback {
  helpful: boolean;
  rating?: number;        // 1-5星
  comment?: string;
  collectedAt: string;
}

/**
 * 建议操作
 */
export interface SuggestedAction {
  type: ActionType;
  data: any;
  description?: string;
}

/**
 * 消息元数据
 */
export interface MessageMetadata {
  intent?: UserIntent;
  merchantId?: string;
  merchantName?: string;
  executionTime?: number;
  dataSource?: DataSource;
  llmModel?: string;
  llmTokens?: number;
  suggestedAction?: SuggestedAction;
  suggestedActions?: Array<{
    type: string;
    merchantId?: string;
    merchantName?: string;
  }>;
}

/**
 * 消息
 */
export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;         // Markdown格式
  timestamp: string;
  metadata?: MessageMetadata;
  feedback?: MessageFeedback;
}

/**
 * 对话
 */
export interface Conversation {
  id: string;
  startedAt: string;
  lastMessageAt: string;
  merchantId?: string;
  messages: Message[];
  status: ConversationStatus;
}

/**
 * 用户反馈
 */
export interface UserFeedback {
  id: string;
  messageId: string;
  conversationId: string;
  merchantId?: string;
  caseId?: string;
  helpful: boolean;
  rating?: number;
  comment?: string;
  adopted?: boolean;      // 是否采纳措施
  effectiveness?: Effectiveness;
  timestamp: string;
}

/**
 * 权重调整记录
 */
export interface WeightAdjustment {
  id: string;
  caseId: string;
  timestamp: string;
  adjustment: number;     // 调整值（±分数）
  reason: string;
  feedbackId?: string;
}

/**
 * 意图识别结果
 */
export interface IntentResult {
  intent: UserIntent;
  confidence: number;
  keywords: string[];
}

/**
 * 实体提取结果
 */
export interface EntityResult {
  merchantId?: string;
  merchantName?: string;
  confidence: number;
  matched: boolean;
}

/**
 * Agent 执行结果
 */
export interface AgentExecutionResult {
  success: boolean;
  content: string;
  metadata: MessageMetadata;
  suggestedAction?: SuggestedAction;
  error?: string;
}

/**
 * LLM 配置
 */
export interface LLMConfig {
  provider: LLMProvider;
  apiKey: string;
  model: string;
  maxTokens?: number;
  temperature?: number;
  timeout?: number;
}

/**
 * LLM 消息
 */
export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * LLM 响应
 */
export interface LLMResponse {
  content: string;
  model: string;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  finishReason?: string;
}

/**
 * 缓存条目
 */
export interface CacheEntry<T = any> {
  key: string;
  value: T;
  timestamp: number;
  ttl: number;
  hits: number;
}

/**
 * 对话上下文
 */
export interface ConversationContext {
  conversationId: string;
  merchantId?: string;
  merchantName?: string;
  lastIntent?: UserIntent;
  recentMessages: Message[];
  sessionStartTime: string;
}

/**
 * Agent 路由配置
 */
export interface AgentRouteConfig {
  intent: UserIntent;
  merchantId?: string;
  useCache?: boolean;
  forceLLM?: boolean;
  forceSkills?: boolean;
}

/**
 * 诊断触发配置
 */
export interface DiagnosisTriggerConfig {
  minHealthScore: number;
  minRiskLevel: string;
  autoTrigger: boolean;
}

/**
 * 快捷操作
 */
export interface QuickAction {
  id: string;
  label: string;
  icon?: string;
  intent: UserIntent;
  template: string;       // 预填充的输入模板
}

/**
 * 操作确认配置
 */
export interface ActionConfirmConfig {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  data?: any;
}

/**
 * 反馈收集配置
 */
export interface FeedbackConfig {
  messageId: string;
  conversationId: string;
  merchantId?: string;
  caseIds?: string[];
}

/**
 * 案例权重记录
 */
export interface CaseWeight {
  caseId: string;
  weight: number;
  lastUpdated: string;
  feedbackCount: number;
  adoptionRate: number;
}

/**
 * 权重存储
 */
export interface WeightStorage {
  [caseId: string]: number;
}

/**
 * 统计数据
 */
export interface AssistantStats {
  totalConversations: number;
  totalMessages: number;
  averageResponseTime: number;
  intentDistribution: Record<UserIntent, number>;
  dataSourceDistribution: Record<DataSource, number>;
  feedbackStats: {
    total: number;
    helpful: number;
    helpfulRate: number;
    averageRating: number;
  };
  llmStats: {
    totalCalls: number;
    totalTokens: number;
    averageTokensPerCall: number;
    cacheHitRate: number;
  };
}

/**
 * 错误类型
 */
export class AssistantError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AssistantError';
  }
}

/**
 * LLM 错误
 */
export class LLMError extends AssistantError {
  constructor(message: string, details?: any) {
    super(message, 'LLM_ERROR', details);
    this.name = 'LLMError';
  }
}

/**
 * 意图识别错误
 */
export class IntentError extends AssistantError {
  constructor(message: string, details?: any) {
    super(message, 'INTENT_ERROR', details);
    this.name = 'IntentError';
  }
}

/**
 * 实体提取错误
 */
export class EntityError extends AssistantError {
  constructor(message: string, details?: any) {
    super(message, 'ENTITY_ERROR', details);
    this.name = 'EntityError';
  }
}
