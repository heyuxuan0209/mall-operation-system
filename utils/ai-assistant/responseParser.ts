/**
 * AI响应解析器
 * 将AI的文本响应解析为结构化数据，用于可视化展示
 */

export interface ParsedResponse {
  type: 'text' | 'stats' | 'chart' | 'list' | 'mixed';
  content: {
    text?: string;
    stats?: Array<{ label: string; value: string | number; color?: string }>;
    chart?: {
      type: 'pie' | 'bar';
      title: string;
      data: Array<any>;
    };
    list?: {
      title?: string;
      items: Array<{ label: string; value: string; badge?: { text: string; color: string } }>;
    };
  };
}

export class ResponseParser {
  /**
   * 解析AI响应
   */
  static parse(content: string): ParsedResponse {
    // 检测是否包含统计数据
    const hasStats = this.detectStats(content);
    const hasChart = this.detectChart(content);
    const hasList = this.detectList(content);

    if (hasStats || hasChart || hasList) {
      return {
        type: 'mixed',
        content: {
          text: this.extractCleanText(content),
          stats: hasStats ? this.extractStats(content) : undefined,
          chart: hasChart ? this.extractChart(content) : undefined,
          list: hasList ? this.extractList(content) : undefined,
        },
      };
    }

    return {
      type: 'text',
      content: {
        text: this.extractCleanText(content),
      },
    };
  }

  /**
   * 检测是否包含统计数据
   */
  private static detectStats(content: string): boolean {
    // 检测模式：数字 + 单位（个、家、分、%等）
    const patterns = [
      /(\d+)\s*个/g,
      /(\d+)\s*家/g,
      /(\d+\.?\d*)\s*分/g,
      /(\d+\.?\d*)\s*%/g,
      /总计.*?(\d+)/g,
      /平均.*?(\d+\.?\d*)/g,
    ];

    return patterns.some(pattern => pattern.test(content));
  }

  /**
   * 检测是否包含图表数据
   */
  private static detectChart(content: string): boolean {
    // 检测分组统计模式
    const patterns = [
      /高风险.*?(\d+).*?中风险.*?(\d+).*?低风险.*?(\d+)/,
      /按.*?统计/,
      /分布.*?如下/,
    ];

    return patterns.some(pattern => pattern.test(content));
  }

  /**
   * 检测是否包含列表
   */
  private static detectList(content: string): boolean {
    // 检测列表模式：- 开头或数字. 开头
    return /^[\s]*[-•]\s/m.test(content) || /^\d+\.\s/m.test(content);
  }

  /**
   * 提取统计数据
   */
  private static extractStats(content: string): Array<{ label: string; value: string | number; color?: string }> {
    const stats: Array<{ label: string; value: string | number; color?: string }> = [];

    // 提取"X个高风险商户"模式
    const riskMatch = content.match(/(\d+)\s*个(高风险|中风险|低风险|无风险)?商户/);
    if (riskMatch) {
      const riskType = riskMatch[2] || '';
      const color = this.getRiskColor(riskType);
      stats.push({
        label: `${riskType}商户`,
        value: `${riskMatch[1]}个`,
        color,
      });
    }

    // 提取"平均健康度X分"模式
    const avgMatch = content.match(/平均健康度.*?(\d+\.?\d*)\s*分/);
    if (avgMatch) {
      stats.push({
        label: '平均健康度',
        value: `${avgMatch[1]}分`,
        color: this.getScoreColor(parseFloat(avgMatch[1])),
      });
    }

    // 提取"总计X个"模式
    const totalMatch = content.match(/总计.*?(\d+)\s*个/);
    if (totalMatch && !riskMatch) {
      stats.push({
        label: '总计',
        value: `${totalMatch[1]}个`,
        color: 'blue',
      });
    }

    return stats;
  }

  /**
   * 提取图表数据
   */
  private static extractChart(content: string): { type: 'pie' | 'bar'; title: string; data: Array<any> } | undefined {
    // 提取风险等级分布（移除换行符，使用单行匹配）
    const normalizedContent = content.replace(/\n/g, ' ');
    const riskPattern = /高风险.*?(\d+).*?中风险.*?(\d+).*?低风险.*?(\d+).*?无风险.*?(\d+)/;
    const riskMatch = normalizedContent.match(riskPattern);

    if (riskMatch) {
      return {
        type: 'pie',
        title: '风险等级分布',
        data: [
          { name: '高风险', value: parseInt(riskMatch[1]), color: '#ef4444' },
          { name: '中风险', value: parseInt(riskMatch[2]), color: '#f97316' },
          { name: '低风险', value: parseInt(riskMatch[3]), color: '#eab308' },
          { name: '无风险', value: parseInt(riskMatch[4]), color: '#22c55e' },
        ].filter(item => item.value > 0),
      };
    }

    return undefined;
  }

  /**
   * 提取列表数据
   */
  private static extractList(content: string): { title?: string; items: Array<{ label: string; value: string }> } | undefined {
    const lines = content.split('\n');
    const items: Array<{ label: string; value: string }> = [];

    for (const line of lines) {
      // 匹配 "- 标签: 值" 或 "- 标签：值" 模式
      const match = line.match(/^[\s]*[-•]\s*(.+?)[：:]\s*(.+)$/);
      if (match) {
        items.push({
          label: match[1].trim(),
          value: match[2].trim(),
        });
      }
    }

    if (items.length > 0) {
      return { items };
    }

    return undefined;
  }

  /**
   * 提取纯文本（去除Markdown符号）
   */
  private static extractCleanText(content: string): string {
    let text = content;

    // 去除标题符号 ##
    text = text.replace(/^#{1,6}\s+/gm, '');

    // 去除粗体 **text**
    text = text.replace(/\*\*(.+?)\*\*/g, '$1');

    // 去除斜体 *text*
    text = text.replace(/\*(.+?)\*/g, '$1');

    // 去除分隔线 ---
    text = text.replace(/^-{3,}$/gm, '');

    // 去除列表符号（保留内容）
    text = text.replace(/^[\s]*[-•]\s+/gm, '• ');

    // 去除多余空行
    text = text.replace(/\n{3,}/g, '\n\n');

    return text.trim();
  }

  /**
   * 获取风险等级颜色
   */
  private static getRiskColor(riskType: string): string {
    const colorMap: Record<string, string> = {
      '高风险': 'red',
      '中风险': 'yellow',
      '低风险': 'green',
      '无风险': 'blue',
    };
    return colorMap[riskType] || 'blue';
  }

  /**
   * 获取分数颜色
   */
  private static getScoreColor(score: number): string {
    if (score >= 90) return 'green';
    if (score >= 80) return 'blue';
    if (score >= 70) return 'yellow';
    return 'red';
  }
}
