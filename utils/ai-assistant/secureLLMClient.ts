/**
 * 安全的 LLM 客户端 - 通过服务端 API 调用
 * API 密钥保存在服务端，不暴露到客户端
 */

import {
  LLMMessage,
  LLMResponse,
  LLMError,
} from '@/types/ai-assistant';
import { cacheManager } from './cacheManager';

export class SecureLLMClient {
  /**
   * 发送聊天请求（通过服务端 API）
   */
  async chat(
    messages: LLMMessage[],
    options?: {
      useCache?: boolean;
      temperature?: number;
      maxTokens?: number;
    }
  ): Promise<LLMResponse> {
    const { useCache = true, temperature, maxTokens } = options || {};

    // 检查缓存
    if (useCache) {
      const cacheKey = this.generateCacheKey(messages);
      const cached = cacheManager.get<LLMResponse>(cacheKey);
      if (cached) {
        console.log('[SecureLLMClient] Cache hit');
        return cached;
      }
    }

    try {
      // 调用服务端 API
      const response = await fetch('/api/llm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          options: {
            temperature,
            maxTokens,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new LLMError(error.error || 'LLM API request failed');
      }

      const data = await response.json();

      if (!data.success) {
        throw new LLMError(data.error || 'LLM API returned error');
      }

      const llmResponse: LLMResponse = {
        content: data.content,
        model: data.model,
        tokens: data.tokens,
      };

      // 缓存结果
      if (useCache) {
        const cacheKey = this.generateCacheKey(messages);
        cacheManager.set(cacheKey, llmResponse, 30 * 60 * 1000); // 30分钟
      }

      return llmResponse;
    } catch (error) {
      console.error('[SecureLLMClient] Request failed:', error);
      throw new LLMError(
        error instanceof Error ? error.message : 'Unknown error',
        { error }
      );
    }
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(messages: LLMMessage[]): string {
    const messageHash = messages
      .map((m) => `${m.role}:${m.content}`)
      .join('|');
    return `llm:secure:${this.hashString(messageHash)}`;
  }

  /**
   * 简单的字符串哈希函数
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }
}

/**
 * 创建安全的 LLM 客户端实例
 */
export function createSecureLLMClient(): SecureLLMClient {
  return new SecureLLMClient();
}

// 导出单例实例
export const secureLLMClient = createSecureLLMClient();
