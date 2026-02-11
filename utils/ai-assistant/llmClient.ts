/**
 * LLM 客户端 - 服务端API版本
 * 通过 /api/llm/chat 调用服务端LLM，保护API密钥
 */

import {
  LLMConfig,
  LLMMessage,
  LLMResponse,
  LLMProvider,
  LLMError,
} from '@/types/ai-assistant';
import { cacheManager } from './cacheManager';

export class LLMClient {
  private provider: LLMProvider;
  private config: LLMConfig;
  private fallbackProvider?: LLMProvider;

  constructor(config: LLMConfig, fallbackProvider?: LLMProvider) {
    this.config = config;
    this.provider = config.provider;
    this.fallbackProvider = fallbackProvider;
  }

  /**
   * 发送聊天请求（通过服务端API）
   */
  async chat(
    messages: LLMMessage[],
    options?: {
      useCache?: boolean;
      stream?: boolean;
      onChunk?: (chunk: string) => void;
    }
  ): Promise<LLMResponse> {
    const { useCache = true, stream = false, onChunk } = options || {};

    // 检查缓存
    if (useCache && !stream) {
      const cacheKey = this.generateCacheKey(messages);
      const cached = cacheManager.get<LLMResponse>(cacheKey);
      if (cached) {
        console.log('[LLMClient] Cache hit:', cacheKey);
        return cached;
      }
    }

    try {
      let response: LLMResponse;

      if (stream && onChunk) {
        response = await this.streamChat(messages, onChunk);
      } else {
        response = await this.executeChat(messages);
      }

      // 缓存结果
      if (useCache && !stream) {
        const cacheKey = this.generateCacheKey(messages);
        cacheManager.set(cacheKey, response, 30 * 60 * 1000); // 30分钟
      }

      return response;
    } catch (error) {
      console.error('[LLMClient] Chat failed:', error);
      return await this.handleError(error, messages);
    }
  }

  /**
   * 执行聊天请求（调用服务端API）
   */
  private async executeChat(messages: LLMMessage[]): Promise<LLMResponse> {
    try {
      const response = await fetch('/api/llm/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          options: {
            temperature: this.config.temperature,
            maxTokens: this.config.maxTokens,
            model: this.config.model,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new LLMError(
          errorData.error || 'LLM API request failed',
          { status: response.status, provider: errorData.provider }
        );
      }

      const data = await response.json();

      if (!data.success) {
        throw new LLMError(data.error || 'LLM API returned error');
      }

      return {
        content: data.content,
        model: data.model,
        tokens: {
          prompt: 0,
          completion: 0,
          total: 0,
        },
        finishReason: 'stop',
      };
    } catch (error: any) {
      if (error instanceof LLMError) {
        throw error;
      }
      throw new LLMError('Failed to call LLM API', { error });
    }
  }

  /**
   * 流式聊天（通过服务端API）
   */
  private async streamChat(
    messages: LLMMessage[],
    onChunk: (chunk: string) => void
  ): Promise<LLMResponse> {
    // 注意：流式响应需要服务端支持SSE，这里先用非流式实现
    // TODO: 实现真正的流式响应
    const response = await this.executeChat(messages);

    // 模拟流式输出
    const words = response.content.split('');
    for (const word of words) {
      onChunk(word);
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    return response;
  }

  /**
   * 错误处理和降级策略
   */
  private async handleError(
    error: any,
    messages: LLMMessage[]
  ): Promise<LLMResponse> {
    console.error('[LLMClient] Error details:', error);

    // 策略1: 检查缓存（忽略时效）
    const cacheKey = this.generateCacheKey(messages);
    const cachedResponse = cacheManager.get<LLMResponse>(cacheKey);
    if (cachedResponse) {
      console.log('[LLMClient] Using stale cache due to error');
      return cachedResponse;
    }

    // 策略2: 返回降级响应
    throw new LLMError('LLM request failed and no fallback available', {
      originalError: error,
      provider: this.provider,
    });
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(messages: LLMMessage[]): string {
    const messageHash = messages
      .map((m) => `${m.role}:${m.content}`)
      .join('|');
    return `llm:${this.provider}:${this.config.model}:${this.hashString(messageHash)}`;
  }

  /**
   * 简单的字符串哈希函数
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * 获取统计信息
   */
  getStats() {
    return {
      provider: this.provider,
      model: this.config.model,
      cacheStats: cacheManager.getStats(),
    };
  }
}

/**
 * 创建 LLM 客户端实例
 * 注意：不再需要API密钥，因为调用服务端API
 */
export function createLLMClient(): LLMClient | null {
  try {
    // 从服务端获取配置（不需要API密钥）
    const provider = 'qwen' as LLMProvider; // 默认使用qwen
    const model = 'qwen-max';

    const config: LLMConfig = {
      provider,
      model,
      apiKey: '', // 不再需要，服务端会处理
      maxTokens: 2000,
      temperature: 0.7,
    };

    // 设置降级链
    const fallbackProvider: LLMProvider = 'openai';

    return new LLMClient(config, fallbackProvider);
  } catch (error) {
    console.error('[LLMClient] Failed to create client:', error);
    return null;
  }
}

// 导出单例
export const llmClient = createLLMClient();
