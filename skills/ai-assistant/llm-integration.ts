/**
 * LLM 集成模块
 * 提供 Prompt 模板和 LLM 调用封装
 */

import { Merchant } from '@/types';
import { LLMMessage, LLMResponse } from '@/types/ai-assistant';
import { llmClient } from '@/utils/ai-assistant/llmClient';

export class LLMIntegration {
  /**
   * 生成诊断报告（使用LLM）
   */
  async generateDiagnosisReport(
    merchant: Merchant,
    diagnosisData: any
  ): Promise<string> {
    if (!llmClient) {
      throw new Error('LLM client not available');
    }

    const prompt = this.buildDiagnosisPrompt(merchant, diagnosisData);
    const messages: LLMMessage[] = [
      {
        role: 'system',
        content: '你是一位资深的商业地产运营专家，拥有10年以上的商户管理经验。请用专业但易懂的语言生成诊断报告。',
      },
      {
        role: 'user',
        content: prompt,
      },
    ];

    const response = await llmClient.chat(messages, { useCache: true });
    return response.content;
  }

  /**
   * 生成个性化方案（使用LLM）
   */
  async generateSolutionPlan(
    merchant: Merchant,
    diagnosis: any,
    knowledgeCases: any[]
  ): Promise<string> {
    if (!llmClient) {
      throw new Error('LLM client not available');
    }

    const prompt = this.buildSolutionPrompt(merchant, diagnosis, knowledgeCases);
    const messages: LLMMessage[] = [
      {
        role: 'system',
        content: '你是一位商户帮扶专家。请基于知识库案例，为商户生成个性化的帮扶方案。',
      },
      {
        role: 'user',
        content: prompt,
      },
    ];

    const response = await llmClient.chat(messages, { useCache: true });
    return response.content;
  }

  /**
   * 通用对话（使用LLM）
   */
  async chat(userInput: string, context?: string): Promise<string> {
    if (!llmClient) {
      throw new Error('LLM client not available');
    }

    const messages: LLMMessage[] = [
      {
        role: 'system',
        content: '你是商户健康管理助手，请简洁友好地回答用户问题。',
      },
    ];

    if (context) {
      messages.push({
        role: 'system',
        content: `上下文信息:\n${context}`,
      });
    }

    messages.push({
      role: 'user',
      content: userInput,
    });

    const response = await llmClient.chat(messages, { useCache: false });
    return response.content;
  }

  /**
   * 构建诊断Prompt
   */
  private buildDiagnosisPrompt(merchant: Merchant, diagnosisData: any): string {
    return `
## 商户信息
- 商户名称：${merchant.name}
- 业态分类：${merchant.category}
- 总体评分：${merchant.totalScore}/100
- 风险等级：${merchant.riskLevel}
- 上月营收：${merchant.lastMonthRevenue}元
- 租售比：${merchant.rentToSalesRatio}%（警戒线25%）

## 检测到的问题
${diagnosisData.problems?.join('\n') || '无明显问题'}

## 风险分析
${diagnosisData.risks?.map((r: any) => `- ${r.type}: ${r.description}`).join('\n') || '无风险'}

## 任务
请按以下格式输出分析报告（Markdown格式）：

### 核心问题诊断（3-5个要点）
### 根因分析（200字以内）
### 帮扶措施建议（3-5条，按优先级）
1. **紧急措施**：...（预期效果：...）
2. **核心措施**：...（预期效果：...）
### 风险提示（如有）

要求：
- 语言专业但易懂
- 措施具体可执行
- 突出紧急性
- 字数500-800字
`;
  }

  /**
   * 构建方案推荐Prompt
   */
  private buildSolutionPrompt(
    merchant: Merchant,
    diagnosis: any,
    knowledgeCases: any[]
  ): string {
    const casesText = knowledgeCases
      .slice(0, 3)
      .map((c, i) => {
        return `
**案例${i + 1}**: ${c.caseName || c.industry}
- 匹配度: ${Math.round(c.matchScore || 0)}%
- 业态: ${c.industry}
- 问题: ${c.symptoms?.join(', ')}
- 策略: ${c.strategy?.summary}
- 效果: ${c.outcome}
`;
      })
      .join('\n');

    return `
## 商户信息
- 商户名称：${merchant.name}
- 业态：${merchant.category}
- 健康度：${merchant.totalScore}/100
- 主要问题：${diagnosis.problems?.join('、')}

## 知识库推荐案例
${casesText}

## 任务
请为当前商户生成个性化帮扶方案：

### 1. 方案总体思路（100字）
### 2. 具体措施清单（3-5条）
- [ ] 措施1：...
  - 参考案例：{case}
  - 执行步骤：...
  - 预期效果：...
### 3. 效果预测
### 4. 注意事项

要求：参考知识库案例，但要结合商户实际情况调整
`;
  }

  /**
   * 流式生成响应
   */
  async streamResponse(
    prompt: string,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    if (!llmClient) {
      throw new Error('LLM client not available');
    }

    const messages: LLMMessage[] = [
      {
        role: 'user',
        content: prompt,
      },
    ];

    await llmClient.chat(messages, {
      useCache: false,
      stream: true,
      onChunk,
    });
  }

  /**
   * 检查LLM是否可用
   */
  isAvailable(): boolean {
    return llmClient !== null;
  }
}

// 导出单例实例
export const llmIntegration = new LLMIntegration();
