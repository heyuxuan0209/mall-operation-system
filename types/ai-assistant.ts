/**
 * AI Assistant 类型定义
 * 包含对话、消息、反馈等核心类型
 */

/**
 * 用户意图类型
 */
export type UserIntent =
  // 单商户查询
  | 'health_query'         // 健康度查询
  | 'risk_diagnosis'       // 风险诊断
  | 'solution_recommend'   // 方案推荐
  | 'data_query'          // 数据查询
  | 'archive_query'        // 🔥 新增：历史档案查询（"有历史帮扶档案吗"）

  // 聚合统计 ⭐v3.0新增
  | 'aggregation_query'    // 聚合查询（"多少个高风险商户"）
  | 'risk_statistics'      // 风险统计
  | 'health_overview'      // 整体健康度

  // 对比分析 ⭐v3.0新增
  | 'comparison_query'     // 对比分析（"vs上月"、"vs同类"）
  | 'trend_analysis'       // 趋势分析

  // 复合查询 ⭐v3.0新增
  | 'composite_query'      // 复合查询（包含多个子意图）

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
  // ⭐Phase 2 新增字段
  confidence?: number;
  needsClarification?: boolean;
  candidates?: Array<{ merchantId: string; merchantName: string; confidence: number }>;
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
  merchantName?: string;  // 🔥 新增：当前讨论的商户名称
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
  // ⭐Phase 2 新增：用户澄清支持
  needsClarification?: boolean;      // 是否需要用户澄清
  alternatives?: UserIntent[];       // 备选意图列表
  clarificationMessage?: string;     // 澄清提示消息
}

/**
 * 实体提取结果
 */
export interface EntityResult {
  merchantId?: string;
  merchantName?: string;
  confidence: number;
  matched: boolean;
  fromContext?: boolean;  // 是否来自上下文回退
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
  // ⭐Phase 2 新增：用户澄清和反馈
  needsClarification?: boolean;
  clarificationOptions?: ClarificationOption[];
  feedbackPrompt?: FeedbackPrompt;
}

/**
 * ⭐Phase 2 新增：澄清选项
 */
export interface ClarificationOption {
  label: string;              // 显示文本
  description?: string;       // 详细描述
  value: UserIntent;          // 意图值
  icon?: string;              // 图标（可选）
}

/**
 * ⭐Phase 2 新增：反馈提示
 */
export interface FeedbackPrompt {
  question: string;           // 反馈问题
  options: FeedbackOption[];  // 反馈选项
}

/**
 * ⭐Phase 2 新增：反馈选项
 */
export interface FeedbackOption {
  label: string;              // 显示文本
  value: 'helpful' | 'not_helpful' | 'wrong_intent';
  icon?: string;              // 图标（可选）
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
  merchantStack?: Array<{ id: string; name: string; timestamp: string }>;
  topicStack?: string[];
  intentHistory?: Array<{ intent: UserIntent; timestamp: string }>;
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

/**
 * 查询改写操作类型
 */
export type RewriteOperation = 'coreference' | 'ellipsis' | 'expansion' | 'normalization';

/**
 * 查询改写结果
 */
export interface RewriteResult {
  original: string;
  normalized: string;
  operations: Array<{
    type: RewriteOperation;
    from: string;
    to: string;
  }>;
  confidence: number;
}

/**
 * 任务类型
 */
export interface Task {
  id: string;
  action: 'analyzeHealth' | 'detectRisks' | 'diagnose' | 'matchCases' | 'generateSolution';
  params: Record<string, any>;
  dependsOn: string[];
  priority: number;
}

/**
 * 执行计划
 */
export interface ExecutionPlan {
  tasks: Task[];
  strategy: DataSource;
  parallelizable: boolean;
  confidence: number;
}

/**
 * 技能执行结果
 */
export interface SkillResult {
  taskId: string;
  success: boolean;
  data: any;
  error?: string;
  executionTime: number;
}

/**
 * 置信度评分
 */
export interface ConfidenceScore {
  overall: number;
  breakdown: {
    queryUnderstanding: number;
    intentClassification: number;
    entityExtraction: number;
    taskPlanning: number;
    execution: number;
  };
  needsConfirmation: boolean;
  ambiguities: string[];
}

// ============================================
// v3.0 新增类型定义 - Query Understanding
// ============================================

/**
 * 查询类型 ⭐v3.0新增
 */
export type QueryType =
  | 'single_merchant'   // 单商户查询
  | 'aggregation'       // 聚合统计
  | 'comparison'        // 对比分析
  | 'trend_analysis';   // 趋势分析

/**
 * 时间范围 ⭐v3.0新增
 */
export interface TimeRange {
  period: 'current_day' | 'current_week' | 'current_month' | 'current_year'
    | 'last_day' | 'last_week' | 'last_month' | 'last_year'
    | 'custom';
  startDate?: string;
  endDate?: string;
}

/**
 * 聚合操作 ⭐v3.0新增
 */
export type AggregationOperation = 'count' | 'sum' | 'avg' | 'max' | 'min';

/**
 * 查询筛选条件 ⭐v3.0新增
 */
export interface QueryFilters {
  riskLevel?: Array<'none' | 'low' | 'medium' | 'high' | 'critical'>;
  category?: string[];      // 业态
  floor?: string[];         // 楼层
  metric?: string[];        // 指标
  healthScoreMin?: number;
  healthScoreMax?: number;
}

/**
 * 聚合配置 ⭐v3.0新增
 */
export interface AggregationConfig {
  operation: AggregationOperation;
  field?: string;           // 聚合字段（如果是 sum/avg/max/min）
  groupBy?: string;         // 分组字段（riskLevel, category, floor）
}

/**
 * 结构化查询 ⭐v3.0新增
 */
export interface StructuredQuery {
  originalInput: string;
  enhancedInput?: string;           // ⭐v3.0: 增强后的输入
  contextEnhancements?: string[];   // ⭐v3.0: 应用的上下文增强
  type: QueryType;
  entities: {
    merchants?: string[];      // 商户名列表，["海底捞"] 或 ["all"]
    timeRange?: TimeRange;
    comparisonTarget?: string; // 对比目标："last_month", "same_category", 等
  };
  intents: UserIntent[];       // 可能包含多个意图
  filters?: QueryFilters;
  aggregations?: AggregationConfig;
  confidence: number;
}

/**
 * 聚合查询结果 ⭐v3.0新增
 */
export interface AggregationResult {
  operation: AggregationOperation;
  total: number | null;
  breakdown?: Record<string, number>;  // 分组结果

  // ⭐新增: 商户列表（用于LLM响应生成，防止幻觉）
  merchantList?: Array<{
    id: string;
    name: string;
    riskLevel: string;
    totalScore: number;
    category: string;
  }>;

  comparison?: {
    baseline: number;
    delta: number;
    percentage: string;
  };
  timeRange: TimeRange;
  filters: QueryFilters;
}

/**
 * 对比结果 ⭐v3.0新增
 */
export interface ComparisonResult {
  current: {
    merchantId?: string;
    merchantName?: string;
    data: any;
    timeRange?: TimeRange;
  };
  baseline: {
    merchantId?: string;
    merchantName?: string;
    data: any;
    timeRange?: TimeRange;
    label: string;  // "上月", "同类商户平均"
  };
  delta: Record<string, number | string>;
  insights: string[];
}

/**
 * 趋势数据点 ⭐v3.0新增
 */
export interface TrendDataPoint {
  timestamp: string;
  value: number;
  label?: string;
}

/**
 * 趋势分析结果 ⭐v3.0新增
 */
export interface TrendAnalysisResult {
  metric: string;
  dataPoints: TrendDataPoint[];
  trend: 'up' | 'down' | 'stable';
  changeRate: number;        // 变化率
  prediction?: {
    nextPeriod: number;
    confidence: number;
  };
}

/**
 * 解析后的实体 ⭐v3.0新增
 */
export interface ResolvedEntity {
  type: 'single_merchant' | 'aggregation' | 'comparison';
  merchantId?: string;
  merchantName?: string;
  merchants?: Array<{ id: string; name: string }>;
  filters?: QueryFilters;
  timeRange?: TimeRange;
  comparisonTarget?: string;
  // ⭐Phase 2 新增字段
  confidence?: number;
  confidenceWarning?: string;
  needsClarification?: boolean;
  clarificationPrompt?: string;
  candidates?: Array<{ merchantId: string; merchantName: string; confidence: number }>;
}

/**
 * 扩展的执行计划 ⭐v3.0新增
 */
export interface ExtendedExecutionPlan extends ExecutionPlan {
  queryType: QueryType;
  entities: ResolvedEntity;
  aggregations?: AggregationConfig;
}

