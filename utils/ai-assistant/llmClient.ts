/**
 * LLM 客户端
 * 支持 OpenAI 和 Anthropic API，包含降级策略和错误处理
 */

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
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
  private openaiClient?: OpenAI;
  private anthropicClient?: Anthropic;
  private config: LLMConfig;
  private fallbackProvider?: LLMProvider;

  constructor(config: LLMConfig, fallbackProvider?: LLMProvider) {
    this.config = config;
    this.provider = config.provider;
    this.fallbackProvider = fallbackProvider;

    // 初始化客户端
    this.initializeClients();
  }

  /**
   * 初始化 API 客户端
   */
  private initializeClients(): void {
    try {
      if (this.provider === 'openai') {
        this.openaiClient = new OpenAI({
          apiKey: this.config.apiKey,
          dangerouslyAllowBrowser: true, // 仅用于开发，生产环境应该通过后端调用
        });
      } else if (this.provider === 'qwen') {
        // 通义千问使用OpenAI兼容接口
        this.openaiClient = new OpenAI({
          apiKey: this.config.apiKey,
          baseURL: process.env.NEXT_PUBLIC_QWEN_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1',
          dangerouslyAllowBrowser: true,
        });
      } else if (this.provider === 'anthropic') {
        this.anthropicClient = new Anthropic({
          apiKey: this.config.apiKey,
        });
      }
    } catch (error) {
      console.error('Failed to initialize LLM client:', error);
      throw new LLMError('Failed to initialize LLM client', { error });
    }
  }

  /**
   * 发送聊天请求
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
   * 执行聊天请求（非流式）
   */
  private async executeChat(messages: LLMMessage[]): Promise<LLMResponse> {
    if (this.provider === 'openai' || this.provider === 'qwen') {
      // 通义千问和OpenAI使用相同的调用逻辑
      return await this.chatWithOpenAI(messages);
    } else if (this.provider === 'anthropic') {
      return await this.chatWithAnthropic(messages);
    } else {
      throw new LLMError(`Unsupported provider: ${this.provider}`);
    }
  }

  /**
   * OpenAI 聊天
   */
  private async chatWithOpenAI(messages: LLMMessage[]): Promise<LLMResponse> {
    if (!this.openaiClient) {
      throw new LLMError('OpenAI client not initialized');
    }

    const response = await this.openaiClient.chat.completions.create({
      model: this.config.model,
      messages: messages as any,
      max_tokens: this.config.maxTokens || 2000,
      temperature: this.config.temperature || 0.7,
    });

    const choice = response.choices[0];
    if (!choice || !choice.message) {
      throw new LLMError('Invalid OpenAI response');
    }

    return {
      content: choice.message.content || '',
      model: response.model,
      tokens: {
        prompt: response.usage?.prompt_tokens || 0,
        completion: response.usage?.completion_tokens || 0,
        total: response.usage?.total_tokens || 0,
      },
      finishReason: choice.finish_reason,
    };
  }

  /**
   * Anthropic 聊天
   */
  private async chatWithAnthropic(messages: LLMMessage[]): Promise<LLMResponse> {
    if (!this.anthropicClient) {
      throw new LLMError('Anthropic client not initialized');
    }

    // 分离系统消息和用户消息
    const systemMessage = messages.find((m) => m.role === 'system');
    const userMessages = messages.filter((m) => m.role !== 'system');

    const response = await this.anthropicClient.messages.create({
      model: this.config.model,
      max_tokens: this.config.maxTokens || 2000,
      temperature: this.config.temperature || 0.7,
      system: systemMessage?.content,
      messages: userMessages.map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      })),
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new LLMError('Invalid Anthropic response type');
    }

    return {
      content: content.text,
      model: response.model,
      tokens: {
        prompt: response.usage.input_tokens,
        completion: response.usage.output_tokens,
        total: response.usage.input_tokens + response.usage.output_tokens,
      },
      finishReason: response.stop_reason || undefined,
    };
  }

  /**
   * 流式聊天
   */
  private async streamChat(
    messages: LLMMessage[],
    onChunk: (chunk: string) => void
  ): Promise<LLMResponse> {
    let fullContent = '';
    let totalTokens = 0;

    if (this.provider === 'openai' && this.openaiClient) {
      const stream = await this.openaiClient.chat.completions.create({
        model: this.config.model,
        messages: messages as any,
        max_tokens: this.config.maxTokens || 2000,
        temperature: this.config.temperature || 0.7,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullContent += content;
          onChunk(content);
        }
      }
    } else if (this.provider === 'anthropic' && this.anthropicClient) {
      const systemMessage = messages.find((m) => m.role === 'system');
      const userMessages = messages.filter((m) => m.role !== 'system');

      const stream = await this.anthropicClient.messages.create({
        model: this.config.model,
        max_tokens: this.config.maxTokens || 2000,
        temperature: this.config.temperature || 0.7,
        system: systemMessage?.content,
        messages: userMessages.map((m) => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content,
        })),
        stream: true,
      });

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          const content = event.delta.text;
          fullContent += content;
          onChunk(content);
        }
      }
    }

    return {
      content: fullContent,
      model: this.config.model,
      tokens: {
        prompt: 0,
        completion: 0,
        total: totalTokens,
      },
    };
  }

  /**
   * 错误处理和降级策略
   */
  private async handleError(
    error: any,
    messages: LLMMessage[]
  ): Promise<LLMResponse> {
    console.error('[LLMClient] Error details:', error);

    // 策略1: 尝试备用 LLM
    if (this.fallbackProvider && this.fallbackProvider !== this.provider) {
      console.log(`[LLMClient] Trying fallback provider: ${this.fallbackProvider}`);
      try {
        const originalProvider = this.provider;
        this.provider = this.fallbackProvider;
        this.initializeClients();
        const response = await this.executeChat(messages);
        this.provider = originalProvider;
        this.initializeClients();
        return response;
      } catch (fallbackError) {
        console.error('[LLMClient] Fallback provider also failed:', fallbackError);
      }
    }

    // 策略2: 检查缓存（忽略时效）
    const cacheKey = this.generateCacheKey(messages);
    const cachedResponse = cacheManager.get<LLMResponse>(cacheKey);
    if (cachedResponse) {
      console.log('[LLMClient] Using stale cache due to error');
      return cachedResponse;
    }

    // 策略3: 返回降级响应
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
 * 🔥 安全改进：生产环境使用服务端 API，开发环境使用客户端直连
 */
export function createLLMClient(): LLMClient | null {
  try {
    // 🔥 生产环境：使用安全的服务端 API
    if (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ENV === 'production') {
      console.log('[LLMClient] Using secure server-side API in production');
      // 返回 null，让调用方使用 secureLLMClient
      return null;
    }

    // 开发环境：使用客户端直连（方便调试）
    const provider = (process.env.NEXT_PUBLIC_LLM_PROVIDER || 'openai') as LLMProvider;

    let apiKey: string | undefined;
    let model: string;

    if (provider === 'qwen') {
      apiKey = process.env.NEXT_PUBLIC_QWEN_API_KEY;
      model = process.env.NEXT_PUBLIC_LLM_MODEL || 'qwen-plus';
    } else if (provider === 'openai') {
      apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
      model = process.env.NEXT_PUBLIC_LLM_MODEL || 'gpt-4-turbo';
    } else if (provider === 'anthropic') {
      apiKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;
      model = process.env.NEXT_PUBLIC_LLM_MODEL || 'claude-3-5-sonnet-20241022';
    } else {
      apiKey = undefined;
      model = 'unknown';
    }

    if (!apiKey) {
      console.warn('[LLMClient] No API key configured for development, will use server-side API');
      return null;
    }

    const config: LLMConfig = {
      provider,
      apiKey,
      model,
      maxTokens: parseInt(process.env.NEXT_PUBLIC_LLM_MAX_TOKENS || '2000'),
      temperature: parseFloat(process.env.NEXT_PUBLIC_LLM_TEMPERATURE || '0.7'),
    };

    // 降级策略：qwen → openai → anthropic
    const fallbackProvider = provider === 'qwen' ? 'openai' :
                            provider === 'openai' ? 'anthropic' : 'openai';

    return new LLMClient(config, fallbackProvider);
  } catch (error) {
    console.error('[LLMClient] Failed to create client:', error);
    return null;
  }
}

// 导出单例实例（开发环境可能有值，生产环境为 null）
export const llmClient = createLLMClient();

// 🔥 导出安全的客户端（生产环境使用）
export { secureLLMClient } from './secureLLMClient';
