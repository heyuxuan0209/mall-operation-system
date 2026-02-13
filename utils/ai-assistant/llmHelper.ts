/**
 * LLM 客户端辅助函数
 * 自动选择安全的服务端 API（生产环境）或直连（开发环境）
 */

import { llmClient, secureLLMClient } from './llmClient';

/**
 * 获取可用的 LLM 客户端
 * 优先使用 llmClient（开发环境），否则使用 secureLLMClient（生产环境）
 */
export function getLLMClient() {
  return llmClient || secureLLMClient;
}

/**
 * 检查 LLM 是否可用
 */
export function isLLMAvailable(): boolean {
  return !!(llmClient || secureLLMClient);
}
