/**
 * LLM 诊断页面
 * 用于测试服务端 LLM API 是否正常工作
 */

'use client';

import { useState } from 'react';

export default function LLMDiagnosticPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testLLMAPI = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/llm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: '你是一个测试助手。',
            },
            {
              role: 'user',
              content: '请回复"LLM API 工作正常"',
            },
          ],
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const checkEnvironment = () => {
    const env = {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV,
      hasLLMProvider: !!process.env.NEXT_PUBLIC_LLM_PROVIDER,
    };
    setResult({ environment: env });
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🔍 LLM 诊断工具</h1>

      <div style={{ marginTop: '20px' }}>
        <button
          onClick={testLLMAPI}
          disabled={loading}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '测试中...' : '测试 LLM API'}
        </button>

        <button
          onClick={checkEnvironment}
          style={{
            padding: '10px 20px',
            cursor: 'pointer',
          }}
        >
          检查环境变量
        </button>
      </div>

      {error && (
        <div style={{ marginTop: '20px', padding: '10px', background: '#fee', color: '#c00' }}>
          <strong>错误：</strong> {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0' }}>
          <strong>结果：</strong>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '40px', padding: '20px', background: '#f9f9f9', border: '1px solid #ddd' }}>
        <h2>诊断说明</h2>
        <ul>
          <li><strong>测试 LLM API</strong>：验证服务端 API 是否能正常调用 LLM</li>
          <li><strong>检查环境变量</strong>：查看当前环境配置</li>
        </ul>

        <h3>预期结果</h3>
        <ul>
          <li>✅ success: true</li>
          <li>✅ content: "LLM API 工作正常"</li>
          <li>✅ model: "qwen-plus"</li>
          <li>✅ tokens: {'{ prompt: X, completion: Y, total: Z }'}</li>
        </ul>

        <h3>如果失败</h3>
        <ul>
          <li>❌ 检查 Zeabur 环境变量是否正确配置</li>
          <li>❌ 检查 API 密钥是否有效</li>
          <li>❌ 查看服务端日志</li>
        </ul>
      </div>
    </div>
  );
}
