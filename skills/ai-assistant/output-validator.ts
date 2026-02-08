/**
 * Output Validator - LLM输出验证器
 *
 * 功能：防止LLM生成虚假内容（幻觉）
 * - 验证商户名真实性
 * - 检测案例引用完整性
 * - 清洗不符合规范的输出
 */

export class OutputValidator {
  /**
   * 验证聚合响应中的商户名真实性
   */
  validateAggregationResponse(
    llmResponse: string,
    merchantList?: Array<{ name: string }>
  ): {
    valid: boolean;
    fabricatedNames: string[];
    sanitizedResponse: string;
  } {
    if (!merchantList || merchantList.length === 0) {
      return { valid: true, fabricatedNames: [], sanitizedResponse: llmResponse };
    }

    const validNames = new Set(merchantList.map(m => m.name));

    // 提取响应中的商户名（中文商户名通常2-8个汉字，可能带后缀）
    const merchantNamePattern = /[「『【]?([一-龥]{2,8}(?:商行|店|餐厅|超市|咖啡|火锅|珠宝|服饰|影院)?)[」』】]?/g;
    const matches = [...llmResponse.matchAll(merchantNamePattern)];

    const fabricatedNames: string[] = [];
    let sanitizedResponse = llmResponse;

    for (const match of matches) {
      const name = match[1];
      if (!validNames.has(name) && !this.isGenericTerm(name)) {
        fabricatedNames.push(name);
        // 替换为泛指
        sanitizedResponse = sanitizedResponse.replace(name, '[商户示例]');
      }
    }

    return {
      valid: fabricatedNames.length === 0,
      fabricatedNames,
      sanitizedResponse
    };
  }

  /**
   * 检查响应是否包含未标注来源的建议
   */
  validateCaseCitation(
    llmResponse: string,
    hasCases: boolean
  ): {
    valid: boolean;
    warnings: string[];
    enhancedResponse: string;
  } {
    const warnings: string[] = [];
    let enhancedResponse = llmResponse;

    // 检测建议关键词
    const suggestionKeywords = ['建议', '可以尝试', '措施', '方案', '推荐'];
    const hasSuggestion = suggestionKeywords.some(kw => llmResponse.includes(kw));

    // 检测案例引用
    const hasCitation = /案例ID[:：]\s*CASE_\w+/.test(llmResponse) ||
                        /参考.*的经验/.test(llmResponse);

    if (hasSuggestion && !hasCitation && hasCases) {
      warnings.push('建议措施未标注案例来源');

      // 自动追加溯源说明
      enhancedResponse += '\n\n---\n💡 **说明**：以上建议基于系统匹配的类似案例，具体案例信息请咨询运营团队。';
    }

    return {
      valid: warnings.length === 0,
      warnings,
      enhancedResponse
    };
  }

  /**
   * 判断是否为通用术语（非特定商户名）
   */
  private isGenericTerm(name: string): boolean {
    const genericTerms = ['商户', '店铺', '门店', '餐厅', '超市', '商行', '商场'];
    return genericTerms.includes(name);
  }

  /**
   * 验证数据来源标注
   */
  validateDataSource(llmResponse: string): {
    hasDataSource: boolean;
    sources: string[];
  } {
    const sourcePatterns = [
      /数据来源[:：](.+)/,
      /来源[:：](.+)/,
      /基于(.+)数据/
    ];

    const sources: string[] = [];

    for (const pattern of sourcePatterns) {
      const match = llmResponse.match(pattern);
      if (match) {
        sources.push(match[1].trim());
      }
    }

    return {
      hasDataSource: sources.length > 0,
      sources
    };
  }
}

// 导出单例实例
export const outputValidator = new OutputValidator();
