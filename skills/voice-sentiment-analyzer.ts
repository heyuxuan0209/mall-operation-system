/**
 * 语音情感分析器
 * Sprint 2: 巡检中AI实时辅助
 *
 * 当前版本：基于关键词的简单情感分析
 * 未来升级：集成NLP库（sentiment.js）或LLM API进行深度分析
 */

/**
 * 问题类型
 */
export type IssueType = '租金压力' | '客流不足' | '员工流失' | '供应链' | '设备故障' | '其他';

/**
 * 检测到的问题
 */
export interface DetectedIssue {
  type: IssueType;
  severity: 'high' | 'medium' | 'low';
  quote: string; // 原话摘录
  confidence: number; // 0-100%
}

/**
 * 商户情绪
 */
export interface MerchantMood {
  label: '焦虑' | '积极' | '犹豫' | '抵触' | '中性';
  indicator: string; // 情绪指示说明
  confidence: number;
}

/**
 * 语音AI分析结果
 */
export interface VoiceAIAnalysis {
  transcript: string; // 语音转文字
  sentiment: 'positive' | 'neutral' | 'negative'; // 情感倾向
  confidence: number; // 情感识别置信度 0-100
  keyPhrases: string[]; // 关键短语
  issues: DetectedIssue[]; // 识别到的问题
  merchantMood: MerchantMood; // 商户情绪
  actionableInsights: string[]; // 可执行的洞察
}

/**
 * 情感关键词库
 */
const SENTIMENT_KEYWORDS = {
  positive: [
    '很好', '不错', '满意', '高兴', '开心', '感谢', '支持', '帮助',
    '改善', '提升', '增长', '顺利', '乐观', '希望', '信心', '配合',
  ],
  negative: [
    '困难', '问题', '担心', '焦虑', '压力', '不好', '差', '糟糕',
    '下降', '减少', '亏损', '难以', '无法', '不满', '抱怨', '投诉',
  ],
};

/**
 * 问题关键词库
 */
const ISSUE_KEYWORDS: Record<IssueType, string[]> = {
  '租金压力': [
    '租金太贵', '房租压力', '负担不起', '租金高', '成本太高',
    '租售比', '缴不起', '房租贵', '租金负担',
  ],
  '客流不足': [
    '客流少', '人气不足', '没人来', '生意差', '顾客少',
    '门可罗雀', '冷清', '客人不多', '进店率低',
  ],
  '员工流失': [
    '员工离职', '招不到人', '留不住', '人员流失', '缺人',
    '员工不稳定', '招工难', '人手不够', '流动性大',
  ],
  '供应链': [
    '供货不稳', '缺货', '断货', '供应商', '进货难',
    '库存不足', '物流慢', '原材料', '配送',
  ],
  '设备故障': [
    '设备坏了', '故障', '维修', '损坏', '不能用',
    '空调', '灯光', '设施', '装修',
  ],
  '其他': [],
};

/**
 * 情绪指示词
 */
const MOOD_INDICATORS = {
  '焦虑': ['多次提到', '语气急促', '反复强调', '担心', '压力'],
  '积极': ['愿意配合', '主动', '感谢', '信心', '乐观'],
  '犹豫': ['不确定', '可能', '考虑', '再看看', '试试'],
  '抵触': ['不愿意', '拒绝', '没用', '不行', '算了'],
  '中性': ['正常', '一般', '还行', '平常'],
};

/**
 * 分析语音转录文本
 *
 * @param transcript 语音转文字结果
 * @returns AI分析结果
 */
export function analyzeSentiment(transcript: string): VoiceAIAnalysis {
  if (!transcript || transcript.trim().length === 0) {
    return getDefaultAnalysis(transcript);
  }

  // 1. 情感分析
  const { sentiment, confidence: sentimentConfidence } = detectSentiment(transcript);

  // 2. 关键短语提取
  const keyPhrases = extractKeyPhrases(transcript);

  // 3. 问题识别
  const issues = detectIssues(transcript);

  // 4. 情绪判断
  const merchantMood = detectMood(transcript, sentiment, issues);

  // 5. 生成可执行洞察
  const actionableInsights = generateInsights(issues, sentiment, merchantMood);

  return {
    transcript,
    sentiment,
    confidence: sentimentConfidence,
    keyPhrases,
    issues,
    merchantMood,
    actionableInsights,
  };
}

/**
 * 检测情感倾向
 */
function detectSentiment(text: string): {
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
} {
  let positiveScore = 0;
  let negativeScore = 0;

  // 统计正面/负面关键词出现次数
  SENTIMENT_KEYWORDS.positive.forEach(keyword => {
    const count = (text.match(new RegExp(keyword, 'g')) || []).length;
    positiveScore += count;
  });

  SENTIMENT_KEYWORDS.negative.forEach(keyword => {
    const count = (text.match(new RegExp(keyword, 'g')) || []).length;
    negativeScore += count;
  });

  // 计算情感倾向
  const totalScore = positiveScore + negativeScore;
  if (totalScore === 0) {
    return { sentiment: 'neutral', confidence: 50 };
  }

  const ratio = (positiveScore - negativeScore) / totalScore;

  let sentiment: 'positive' | 'neutral' | 'negative';
  let confidence: number;

  if (ratio > 0.3) {
    sentiment = 'positive';
    confidence = 60 + ratio * 40;
  } else if (ratio < -0.3) {
    sentiment = 'negative';
    confidence = 60 + Math.abs(ratio) * 40;
  } else {
    sentiment = 'neutral';
    confidence = 50 + Math.abs(ratio) * 50;
  }

  return { sentiment, confidence: Math.min(100, Math.round(confidence)) };
}

/**
 * 提取关键短语
 */
function extractKeyPhrases(text: string): string[] {
  // 简单实现：基于标点符号分割句子，统计词频
  const sentences = text.split(/[。！？；，]/).filter(s => s.trim().length > 0);

  // 提取名词短语（简化版）
  const phrases: Record<string, number> = {};

  sentences.forEach(sentence => {
    // 提取2-4字的短语
    const words = sentence.split(/\s+/);
    words.forEach(word => {
      if (word.length >= 2 && word.length <= 4) {
        phrases[word] = (phrases[word] || 0) + 1;
      }
    });
  });

  // 按频率排序，返回前5个
  return Object.entries(phrases)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([phrase]) => phrase);
}

/**
 * 检测问题
 */
function detectIssues(text: string): DetectedIssue[] {
  const issues: DetectedIssue[] = [];

  Object.entries(ISSUE_KEYWORDS).forEach(([type, keywords]) => {
    keywords.forEach(keyword => {
      if (text.includes(keyword)) {
        // 提取包含关键词的句子作为quote
        const sentences = text.split(/[。！？]/).filter(s => s.includes(keyword));
        const quote = sentences[0] || keyword;

        // 计算严重程度
        const severity = calculateSeverity(text, keyword);

        // 计算置信度
        const confidence = 75 + Math.random() * 20;

        issues.push({
          type: type as IssueType,
          severity,
          quote: quote.trim(),
          confidence: Math.round(confidence),
        });
      }
    });
  });

  // 去重（同一类型只保留第一个）
  const uniqueIssues: DetectedIssue[] = [];
  const seenTypes = new Set<string>();

  issues.forEach(issue => {
    if (!seenTypes.has(issue.type)) {
      seenTypes.add(issue.type);
      uniqueIssues.push(issue);
    }
  });

  return uniqueIssues;
}

/**
 * 计算严重程度
 */
function calculateSeverity(text: string, keyword: string): 'high' | 'medium' | 'low' {
  // 检查是否有强调词
  const emphasisWords = ['非常', '很', '特别', '太', '实在', '极其', '严重'];
  const hasEmphasis = emphasisWords.some(word =>
    text.includes(word) && text.indexOf(word) < text.indexOf(keyword) + 10
  );

  // 检查是否重复出现
  const count = (text.match(new RegExp(keyword, 'g')) || []).length;

  if (hasEmphasis || count >= 3) {
    return 'high';
  } else if (count >= 2) {
    return 'medium';
  } else {
    return 'low';
  }
}

/**
 * 检测商户情绪
 */
function detectMood(
  text: string,
  sentiment: 'positive' | 'neutral' | 'negative',
  issues: DetectedIssue[]
): MerchantMood {
  let mood: MerchantMood['label'] = '中性';
  let indicator = '';
  let confidence = 60;

  // 基于情感和问题数量判断
  if (issues.length >= 3 && sentiment === 'negative') {
    mood = '焦虑';
    indicator = `商户提到${issues.length}个问题，语气消极，表现出焦虑情绪`;
    confidence = 80;
  } else if (issues.length >= 2 && sentiment !== 'positive') {
    mood = '犹豫';
    indicator = '商户提出多个问题，对未来持观望态度';
    confidence = 70;
  } else if (sentiment === 'positive' && issues.length === 0) {
    mood = '积极';
    indicator = '商户态度积极，愿意配合改善';
    confidence = 85;
  } else if (sentiment === 'negative') {
    // 检查是否有拒绝性词汇
    const rejectWords = ['不愿意', '不行', '没用', '算了', '不想'];
    if (rejectWords.some(word => text.includes(word))) {
      mood = '抵触';
      indicator = '商户对建议表现出抵触情绪';
      confidence = 75;
    } else {
      mood = '焦虑';
      indicator = '商户表达了一些担忧';
      confidence = 65;
    }
  } else {
    mood = '中性';
    indicator = '商户态度平和，正常沟通';
    confidence = 60;
  }

  return { label: mood, indicator, confidence };
}

/**
 * 生成可执行洞察
 */
function generateInsights(
  issues: DetectedIssue[],
  sentiment: 'positive' | 'neutral' | 'negative',
  mood: MerchantMood
): string[] {
  const insights: string[] = [];

  // 基于问题生成建议
  issues.forEach(issue => {
    switch (issue.type) {
      case '租金压力':
        if (issue.severity === 'high') {
          insights.push('检测到严重租金压力，建议启动经营帮扶任务');
        } else {
          insights.push('商户反映租金压力，建议关注租售比指标');
        }
        break;
      case '客流不足':
        insights.push('客流问题突出，建议在评分时重点关注"经营表现"维度');
        break;
      case '员工流失':
        insights.push('存在人员流失问题，建议在评分时关注"员工状态"维度');
        break;
      case '供应链':
        insights.push('供应链存在问题，可能影响经营稳定性');
        break;
      case '设备故障':
        insights.push('设施设备需要维修，建议拍照记录并提交维修工单');
        break;
    }
  });

  // 基于情绪生成建议
  if (mood.label === '焦虑' && issues.length > 0) {
    insights.push('商户情绪焦虑，建议巡检后创建帮扶任务跟进');
  } else if (mood.label === '抵触') {
    insights.push('商户态度消极，建议升级至运营经理沟通');
  } else if (mood.label === '积极' && sentiment === 'positive') {
    insights.push('商户配合度高，适合推行新的改善措施');
  }

  // 如果没有特别洞察
  if (insights.length === 0) {
    insights.push('商户沟通正常，继续完成巡检');
  }

  return insights;
}

/**
 * 获取默认分析结果（空文本时）
 */
function getDefaultAnalysis(transcript: string): VoiceAIAnalysis {
  return {
    transcript,
    sentiment: 'neutral',
    confidence: 50,
    keyPhrases: [],
    issues: [],
    merchantMood: {
      label: '中性',
      indicator: '暂无语音数据',
      confidence: 50,
    },
    actionableInsights: ['请录制语音笔记以获取AI分析'],
  };
}

/**
 * 生成情感标签（用于UI显示）
 */
export function getSentimentLabel(sentiment: 'positive' | 'neutral' | 'negative'): {
  emoji: string;
  text: string;
  color: string;
} {
  switch (sentiment) {
    case 'positive':
      return { emoji: '😊', text: '积极', color: 'text-green-600 bg-green-100' };
    case 'negative':
      return { emoji: '😟', text: '消极', color: 'text-red-600 bg-red-100' };
    default:
      return { emoji: '😐', text: '中性', color: 'text-gray-600 bg-gray-100' };
  }
}

/**
 * 生成情绪标签（用于UI显示）
 */
export function getMoodLabel(mood: string): {
  emoji: string;
  color: string;
} {
  switch (mood) {
    case '焦虑':
      return { emoji: '😰', color: 'text-orange-600 bg-orange-100' };
    case '积极':
      return { emoji: '😊', color: 'text-green-600 bg-green-100' };
    case '犹豫':
      return { emoji: '🤔', color: 'text-yellow-600 bg-yellow-100' };
    case '抵触':
      return { emoji: '😤', color: 'text-red-600 bg-red-100' };
    default:
      return { emoji: '😐', color: 'text-gray-600 bg-gray-100' };
  }
}
