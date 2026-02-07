/**
 * Mall Operation Agent - Skills Library
 *
 * 统一导出所有业务逻辑技能模块
 *
 * Skills是纯业务逻辑模块，具有以下特征：
 * - ✅ 100%纯函数，无副作用
 * - ✅ 高度可复用，跨模块通用
 * - ✅ 逻辑独立完整，无强依赖
 * - ✅ 完整的TypeScript类型定义
 *
 * ## 使用方式
 *
 * ### 方式1: 从统一入口导入（推荐用于探索）
 * ```typescript
 * import * as Skills from '@/skills';
 * const result = Skills.HealthCalculator.analyzeHealth(merchant);
 * ```
 *
 * ### 方式2: 从具体模块导入（推荐用于生产）
 * ```typescript
 * import { analyzeHealth } from '@/skills/health-calculator';
 * const result = analyzeHealth(merchant);
 * ```
 *
 * @module skills
 */

// ==================== 健康度分析 ====================
import * as HealthCalculator from './health-calculator';
import * as AIDiagnosisEngine from './ai-diagnosis-engine';
import * as TrendPredictor from './trend-predictor';

// ==================== 风险管理 ====================
import * as RiskAssessor from './risk-assessor';
import * as RiskDetector from './risk-detector';

// ==================== 任务管理 ====================
import * as TaskLifecycleManager from './task-lifecycle-manager';
import * as ROICalculator from './roi-calculator';

// ==================== 知识库 ====================
import * as KnowledgeManager from './knowledge-manager';
import * as AIMatcher from './ai-matcher';
import * as EnhancedAIMatcher from './enhanced-ai-matcher';
import * as SmartSearch from './smart-search';
import * as TagClassifier from './tag-classifier';

// ==================== 现场巡店 ====================
import * as InspectionAnalyzer from './inspection-analyzer';
import * as ImageProcessor from './image-processor';

// ==================== 通知系统 ====================
import * as NotificationBuilder from './notification-builder';

// ==================== AI Assistant ====================
import * as IntentClassifier from './ai-assistant/intent-classifier';
import * as EntityExtractor from './ai-assistant/entity-extractor';
import * as ResponseGenerator from './ai-assistant/response-generator';
import * as ConversationContext from './ai-assistant/conversation-context';
import * as LLMIntegration from './ai-assistant/llm-integration';
import * as AgentRouter from './ai-assistant/agent-router';

// ==================== 工作流自动化 ====================
import * as TokenMonitor from './token-monitor';
import * as SaveLocationDetector from './save-location-detector';
import * as DocumentationGenerator from './documentation-generator';
import * as WorkflowReminder from './workflow-reminder';

// 导出命名空间
export {
  // 健康度分析
  HealthCalculator,
  AIDiagnosisEngine,
  TrendPredictor,

  // 风险管理
  RiskAssessor,
  RiskDetector,

  // 任务管理
  TaskLifecycleManager,
  ROICalculator,

  // 知识库
  KnowledgeManager,
  AIMatcher,
  EnhancedAIMatcher,
  SmartSearch,
  TagClassifier,

  // 现场巡店
  InspectionAnalyzer,
  ImageProcessor,

  // 通知系统
  NotificationBuilder,

  // AI Assistant
  IntentClassifier,
  EntityExtractor,
  ResponseGenerator,
  ConversationContext,
  LLMIntegration,
  AgentRouter,

  // 工作流自动化
  TokenMonitor,
  SaveLocationDetector,
  DocumentationGenerator,
  WorkflowReminder,
};

// 同时导出常用函数（按需添加，避免冲突）
export { analyzeHealth } from './health-calculator';
export { generateDiagnosisReport } from './ai-diagnosis-engine';
export { predictHealthTrend } from './trend-predictor';
export { generateFocusPoints, generateChecklist } from './inspection-analyzer';
export { compressImage, generateThumbnail } from './image-processor';
export { checkTaskDeadlines, createTaskAssignedNotification } from './notification-builder';

// 工作流自动化常用函数
export { monitorTokenUsage } from './token-monitor';
export { detectSaveLocation } from './save-location-detector';
export { generateAllDocumentation } from './documentation-generator';
export { checkWorkflowReminder } from './workflow-reminder';
