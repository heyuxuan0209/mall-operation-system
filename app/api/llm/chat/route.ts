import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

// 服务端LLM配置（从环境变量读取，不会暴露到客户端）
const LLM_PROVIDER = process.env.LLM_PROVIDER || 'qwen';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const QWEN_API_KEY = process.env.QWEN_API_KEY;
const QWEN_BASE_URL = process.env.QWEN_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1';
const LLM_MODEL = process.env.LLM_MODEL || 'qwen-max';
const LLM_MAX_TOKENS = parseInt(process.env.LLM_MAX_TOKENS || '2000');
const LLM_TEMPERATURE = parseFloat(process.env.LLM_TEMPERATURE || '0.7');

// 请求体类型定义
interface ChatRequest {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  options?: {
    temperature?: number;
    maxTokens?: number;
    model?: string;
  };
}

// 初始化LLM客户端
function initLLMClient() {
  const provider = LLM_PROVIDER;

  if (provider === 'openai') {
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }
    return {
      type: 'openai' as const,
      client: new OpenAI({ apiKey: OPENAI_API_KEY }),
    };
  } else if (provider === 'anthropic') {
    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }
    return {
      type: 'anthropic' as const,
      client: new Anthropic({ apiKey: ANTHROPIC_API_KEY }),
    };
  } else if (provider === 'qwen') {
    if (!QWEN_API_KEY) {
      throw new Error('QWEN_API_KEY not configured');
    }
    return {
      type: 'qwen' as const,
      client: new OpenAI({
        apiKey: QWEN_API_KEY,
        baseURL: QWEN_BASE_URL,
      }),
    };
  }

  throw new Error(`Unsupported LLM provider: ${provider}`);
}

// POST /api/llm/chat - 统一的LLM聊天接口
export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const body: ChatRequest = await request.json();
    const { messages, options = {} } = body;

    // 验证请求
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: messages array is required' },
        { status: 400 }
      );
    }

    // 初始化LLM客户端
    const llmClient = initLLMClient();

    // 准备请求参数
    const temperature = options.temperature ?? LLM_TEMPERATURE;
    const maxTokens = options.maxTokens ?? LLM_MAX_TOKENS;
    const model = options.model ?? LLM_MODEL;

    // 调用LLM API
    let responseContent: string;

    if (llmClient.type === 'anthropic') {
      // Anthropic API
      const response = await llmClient.client.messages.create({
        model,
        max_tokens: maxTokens,
        temperature,
        messages: messages.map(msg => ({
          role: msg.role === 'system' ? 'user' : msg.role,
          content: msg.content,
        })),
      });

      const content = response.content[0];
      responseContent = content.type === 'text' ? content.text : '';
    } else {
      // OpenAI-compatible API (OpenAI, Qwen)
      const response = await llmClient.client.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
      });

      responseContent = response.choices[0]?.message?.content || '';
    }

    // 返回响应
    return NextResponse.json({
      success: true,
      content: responseContent,
      provider: llmClient.type,
      model,
    });

  } catch (error: any) {
    console.error('[LLM API] Error:', error);

    // 返回错误响应
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'LLM API call failed',
        provider: LLM_PROVIDER,
      },
      { status: 500 }
    );
  }
}

// GET /api/llm/chat - 健康检查
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    provider: LLM_PROVIDER,
    configured: !!(
      (LLM_PROVIDER === 'openai' && OPENAI_API_KEY) ||
      (LLM_PROVIDER === 'anthropic' && ANTHROPIC_API_KEY) ||
      (LLM_PROVIDER === 'qwen' && QWEN_API_KEY)
    ),
  });
}
