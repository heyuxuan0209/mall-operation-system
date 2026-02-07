/**
 * 响应生成器
 * 格式化AI响应为Markdown格式，提供友好的用户界面
 */

import { Merchant } from '@/types';
import { UserIntent, AgentExecutionResult } from '@/types/ai-assistant';

export class ResponseGenerator {
  /**
   * 生成健康度查询响应
   */
  generateHealthQueryResponse(
    merchant: Merchant,
    healthData: any,
    diagnosisTriggered: boolean = false,
    includeSuggestedActions: boolean = false
  ): {
    content: string;
    suggestedActions?: Array<{
      type: string;
      merchantId?: string;
      merchantName?: string;
    }>;
  } {
    const { totalScore, riskLevel, metrics } = merchant;
    const trendData = healthData?.trend || {};

    let response = `# ${merchant.name} 健康度报告\n\n`;

    response += `## 📊 总体评分\n`;
    response += `- **健康度**: ${totalScore}/100 ${this.getScoreEmoji(totalScore)}\n`;
    response += `- **风险等级**: ${this.getRiskLevelText(riskLevel)}\n`;
    response += `- **业态分类**: ${merchant.category}\n\n`;

    response += `## 🎯 各维度得分\n`;
    response += `- 租金缴纳进度: ${metrics.collection}/100\n`;
    response += `- 经营表现: ${metrics.operational}/100\n`;
    response += `- 店铺现场品质: ${metrics.siteQuality}/100\n`;
    response += `- 顾客满意度: ${metrics.customerReview}/100\n`;
    response += `- 财务抗风险能力: ${metrics.riskResistance}/100\n\n`;

    if (trendData.trend) {
      response += `## 📈 趋势分析\n`;
      response += `- **趋势方向**: ${this.getTrendText(trendData.trend)}\n`;
      response += `- **变化幅度**: ${trendData.change || 0}分\n\n`;
    }

    // 根据健康度给出温馨提示
    if (!diagnosisTriggered) {
      if (totalScore < 70) {
        response += `---\n\n💡 **温馨提示**：检测到健康度偏低，您可以继续询问"有什么问题"或"如何改善"获取详细诊断和建议。\n`;
      } else if (totalScore < 85) {
        response += `---\n\n💡 **温馨提示**：如需了解更多详情，您可以继续询问"有什么风险"或"推荐方案"。\n`;
      }
    }

    if (diagnosisTriggered) {
      response += `---\n\n`;
      response += `⚠️ 检测到健康度异常，已自动触发诊断分析...\n`;
    }

    // 添加建议操作
    let suggestedActions;
    if (includeSuggestedActions) {
      suggestedActions = [
        { type: 'view_health', merchantId: merchant.id, merchantName: merchant.name },
        { type: 'create_inspection', merchantId: merchant.id, merchantName: merchant.name },
        { type: 'view_archives', merchantId: merchant.id, merchantName: merchant.name },
      ];
    }

    return { content: response, suggestedActions };
  }

  /**
   * 生成风险诊断响应
   */
  generateRiskDiagnosisResponse(
    merchant: Merchant,
    diagnosisResult: any,
    includeSuggestedActions: boolean = false
  ): {
    content: string;
    suggestedActions?: Array<{
      type: string;
      merchantId?: string;
      merchantName?: string;
    }>;
  } {
    let response = `# ${merchant.name} 风险诊断报告\n\n`;

    // 核心问题
    if (diagnosisResult.problems && diagnosisResult.problems.length > 0) {
      response += `## ⚠️ 核心问题\n\n`;
      diagnosisResult.problems.forEach((problem: string, index: number) => {
        response += `${index + 1}. ${problem}\n`;
      });
      response += `\n`;
    }

    // 风险分析
    if (diagnosisResult.risks && diagnosisResult.risks.length > 0) {
      response += `## 🔍 风险分析\n\n`;
      diagnosisResult.risks.forEach((risk: any) => {
        response += `### ${risk.type}\n`;
        response += `- **严重程度**: ${this.getSeverityText(risk.severity)}\n`;
        response += `- **描述**: ${risk.description}\n\n`;
      });
    }

    // 匹配案例
    if (diagnosisResult.matchedCases && diagnosisResult.matchedCases.length > 0) {
      response += `## 💡 参考案例\n\n`;
      diagnosisResult.matchedCases.slice(0, 3).forEach((case_: any, index: number) => {
        response += `### 案例 ${index + 1}: ${case_.caseName || `相似案例`}\n`;
        response += `- **匹配度**: ${Math.round(case_.matchScore || 0)}%\n`;
        response += `- **业态**: ${case_.industry}\n`;
        if (case_.outcome) {
          response += `- **效果**: ${case_.outcome}\n`;
        }
        response += `\n`;
      });
    }

    // 添加建议操作
    let suggestedActions;
    if (includeSuggestedActions) {
      suggestedActions = [
        { type: 'create_task', merchantId: merchant.id, merchantName: merchant.name },
        { type: 'view_knowledge', merchantId: merchant.id, merchantName: merchant.name },
      ];
    }

    return { content: response, suggestedActions };
  }

  /**
   * 生成方案推荐响应
   */
  generateSolutionRecommendResponse(
    merchant: Merchant,
    recommendations: any
  ): string {
    let response = `# ${merchant.name} 帮扶方案\n\n`;

    // 问题分析
    if (recommendations.analysis) {
      response += `## 🔍 问题分析\n\n`;
      response += `${recommendations.analysis}\n\n`;
    }

    // 推荐措施
    if (recommendations.measures && recommendations.measures.length > 0) {
      response += `## 📋 推荐措施\n\n`;
      recommendations.measures.forEach((measure: any, index: number) => {
        if (typeof measure === 'string') {
          response += `### ${index + 1}. ${measure}\n\n`;
        } else {
          response += `### ${index + 1}. ${measure.title || measure.action}\n\n`;
          if (measure.description) {
            response += `${measure.description}\n\n`;
          }
          if (measure.steps) {
            response += `**执行步骤**:\n`;
            measure.steps.forEach((step: string, i: number) => {
              response += `${i + 1}. ${step}\n`;
            });
            response += `\n`;
          }
          if (measure.expectedEffect) {
            response += `**预期效果**: ${measure.expectedEffect}\n\n`;
          }
        }
      });
    }

    // 知识库案例
    if (recommendations.knowledgeCases && recommendations.knowledgeCases.length > 0) {
      response += `## 📚 知识库支持\n\n`;
      response += `以上方案参考了以下成功案例:\n\n`;
      recommendations.knowledgeCases.slice(0, 3).forEach((case_: any, index: number) => {
        response += `${index + 1}. **${case_.caseName || case_.industry}** - 匹配度 ${Math.round(case_.matchScore || 0)}%\n`;
      });
      response += `\n`;
    }

    // 效果预测
    if (recommendations.prediction) {
      response += `## 📊 效果预测\n\n`;
      response += `${recommendations.prediction}\n\n`;
    }

    // 风险提示
    if (recommendations.warnings) {
      response += `## ⚠️ 注意事项\n\n`;
      if (Array.isArray(recommendations.warnings)) {
        recommendations.warnings.forEach((warning: string) => {
          response += `- ${warning}\n`;
        });
      } else {
        response += `${recommendations.warnings}\n`;
      }
      response += `\n`;
    }

    return response;
  }

  /**
   * 生成错误响应
   */
  generateErrorResponse(error: Error | string, context?: any): string {
    const errorMessage = typeof error === 'string' ? error : error.message;

    let response = `# ❌ 处理失败\n\n`;
    response += `抱歉，处理您的请求时遇到了问题:\n\n`;
    response += `> ${errorMessage}\n\n`;

    // 根据错误类型提供建议
    if (errorMessage.includes('商户') || errorMessage.includes('merchant')) {
      response += `💡 **建议**: 请确认商户名称是否正确，或者尝试使用完整的商户名称。\n`;
    } else if (errorMessage.includes('LLM') || errorMessage.includes('API')) {
      response += `💡 **建议**: AI服务暂时不可用，已使用基础功能为您提供结果。\n`;
    } else {
      response += `💡 **建议**: 请稍后重试，或者换一种方式描述您的问题。\n`;
    }

    return response;
  }

  /**
   * 生成商户未找到响应
   */
  generateMerchantNotFoundResponse(input: string, suggestions?: string[]): string {
    let response = `# ❓ 未找到商户\n\n`;
    response += `抱歉，未能找到"${input}"相关的商户信息。\n\n`;

    if (suggestions && suggestions.length > 0) {
      response += `您是否要查询以下商户?\n\n`;
      suggestions.forEach((suggestion, index) => {
        response += `${index + 1}. ${suggestion}\n`;
      });
      response += `\n`;
    } else {
      response += `💡 **提示**: \n`;
      response += `- 请检查商户名称是否正确\n`;
      response += `- 尝试使用完整的商户名称\n`;
      response += `- 可以说"查看商户列表"来浏览所有商户\n`;
    }

    return response;
  }

  /**
   * 生成通用对话响应
   */
  generateGeneralChatResponse(input: string): string {
    let response = ``;

    // 根据输入内容生成友好的回复
    if (input.includes('你好') || input.includes('hello')) {
      response = `您好！我是商户健康管理助手。\n\n`;
      response += `我可以帮您:\n`;
      response += `- 查询商户健康度和经营状况\n`;
      response += `- 诊断商户风险和问题\n`;
      response += `- 推荐帮扶方案和措施\n`;
      response += `- 创建帮扶任务和通知\n\n`;
      response += `请告诉我您想了解哪个商户的情况？`;
    } else if (input.includes('谢谢') || input.includes('感谢')) {
      response = `不客气！很高兴能帮到您。\n\n`;
      response += `如果您还有其他问题，随时可以问我！`;
    } else {
      response = `我理解您想了解"${input}"，不过我需要更多信息才能帮到您。\n\n`;
      response += `您可以尝试:\n`;
      response += `- 询问某个商户的健康度，如"海底捞最近怎么样"\n`;
      response += `- 诊断商户风险，如"星巴克有什么风险"\n`;
      response += `- 获取帮扶建议，如"给海底捞推荐方案"\n`;
    }

    return response;
  }

  /**
   * 格式化执行结果
   */
  formatExecutionResult(result: AgentExecutionResult): string {
    if (!result.success && result.error) {
      return this.generateErrorResponse(result.error);
    }

    return result.content;
  }

  /**
   * 获取分数表情
   */
  private getScoreEmoji(score: number): string {
    if (score >= 80) return '🟢';
    if (score >= 60) return '🟡';
    if (score >= 40) return '🟠';
    return '🔴';
  }

  /**
   * 获取风险等级文本
   */
  private getRiskLevelText(level: string): string {
    const map: Record<string, string> = {
      none: '✅ 无风险',
      low: '🟢 低风险',
      medium: '🟡 中等风险',
      high: '🟠 高风险',
      critical: '🔴 严重风险',
    };
    return map[level] || level;
  }

  /**
   * 获取严重程度文本
   */
  private getSeverityText(severity: string): string {
    const map: Record<string, string> = {
      low: '🟢 低',
      medium: '🟡 中',
      high: '🟠 高',
      critical: '🔴 严重',
    };
    return map[severity] || severity;
  }

  /**
   * 获取趋势文本
   */
  private getTrendText(trend: string): string {
    const map: Record<string, string> = {
      improving: '📈 改善中',
      stable: '➡️ 稳定',
      declining: '📉 下降中',
    };
    return map[trend] || trend;
  }

  /**
   * 生成快捷操作提示
   */
  generateQuickActions(merchantId?: string): string {
    let response = `\n---\n\n💡 **快捷操作**:\n\n`;

    if (merchantId) {
      response += `- 查看详细诊断\n`;
      response += `- 创建帮扶任务\n`;
      response += `- 查看历史记录\n`;
    } else {
      response += `- 查询商户健康度\n`;
      response += `- 风险诊断\n`;
      response += `- 获取帮扶方案\n`;
    }

    return response;
  }
}

// 导出单例实例
export const responseGenerator = new ResponseGenerator();
