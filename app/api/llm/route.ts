/**
 * LLM API 路由 - 服务端调用
 * 确保 API 密钥安全，不暴露到客户端
 */

import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

interface LLMRequest {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  options?: {
    temperature?: number;
    maxTokens?: number;
  };
}

export async function POST(request: Request) {
  try {
    const body: LLMRequest = await request.json();
    const { messages, options = {} } = body;

    // 验证请求
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: messages array is required' },
        { status: 400 }
      );
    }

    // 从服务端环境变量读取配置（不使用 NEXT_PUBLIC_ 前缀）
    const provider = process.env.LLM_PROVIDER || 'qwen';
    const model = process.env.LLM_MODEL || 'qwen-plus';
    const maxTokens = options.maxTokens || parseInt(process.env.LLM_MAX_TOKENS || '2000');
    const temperature = options.temperature || parseFloat(process.env.LLM_TEMPERATURE || '0.7');

    let apiKey: string | undefined;
    let baseURL: string | undefined;

    // 根据 provider 选择 API 密钥
    if (provider === 'qwen') {
      apiKey = process.env.QWEN_API_KEY;
      baseURL = process.env.QWEN_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';
    } else if (provider === 'openai') {
      apiKey = process.env.OPENAI_API_KEY;
    } else if (provider === 'anthropic') {
      apiKey = process.env.ANTHROPIC_API_KEY;
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'LLM API key not configured on server' },
        { status: 500 }
      );
    }

    // 调用 LLM API
    let content: string;
    let tokens = { prompt: 0, completion: 0, total: 0 };

    if (provider === 'qwen' || provider === 'openai') {
      const client = new OpenAI({
        apiKey,
        baseURL,
      });

      const response = await client.chat.completions.create({
        model,
        messages: messages as any,
        max_tokens: maxTokens,
        temperature,
      });

      content = response.choices[0]?.message?.content || '';
      tokens = {
        prompt: response.usage?.prompt_tokens || 0,
        completion: response.usage?.completion_tokens || 0,
        total: response.usage?.total_tokens || 0,
      };
    } else if (provider === 'anthropic') {
      const client = new Anthropic({ apiKey });

      const systemMessage = messages.find(m => m.role === 'system');
      const userMessages = messages.filter(m => m.role !== 'system');

      const response = await client.messages.create({
        model,
        max_tokens: maxTokens,
        temperature,
        system: systemMessage?.content,
        messages: userMessages.map(m => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content,
        })),
      });

      content = response.content[0]?.type === 'text' ? response.content[0].text : '';
      tokens = {
        prompt: response.usage.input_tokens,
        completion: response.usage.output_tokens,
        total: response.usage.input_tokens + response.usage.output_tokens,
      };
    } else {
      return NextResponse.json(
        { error: 'Unsupported LLM provider' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      content,
      model,
      tokens,
    });
  } catch (error) {
    console.error('[API] LLM request failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
