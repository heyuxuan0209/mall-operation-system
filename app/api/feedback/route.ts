import { NextResponse } from 'next/server';

/**
 * ⭐Phase 2: 反馈收集API
 * 用于收集用户对AI回答的反馈
 */

interface FeedbackData {
  messageId: string;
  conversationId: string;
  userInput: string;
  predictedIntent: string;
  feedbackType: 'helpful' | 'not_helpful' | 'wrong_intent';
  actualIntent?: string;
  comment?: string;
  timestamp: number;
}

// 简单的内存存储（生产环境应使用数据库）
const feedbackStore: FeedbackData[] = [];

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const feedback: FeedbackData = {
      messageId: body.messageId,
      conversationId: body.conversationId,
      userInput: body.userInput,
      predictedIntent: body.predictedIntent,
      feedbackType: body.feedbackType,
      actualIntent: body.actualIntent,
      comment: body.comment,
      timestamp: Date.now()
    };

    // 存储反馈
    feedbackStore.push(feedback);

    console.log('[Feedback] Received feedback:', feedback);

    // 如果是错误意图，记录到性能监控
    if (feedback.feedbackType === 'wrong_intent') {
      console.log('[Feedback] Wrong intent detected:', {
        userInput: feedback.userInput,
        predicted: feedback.predictedIntent,
        actual: feedback.actualIntent
      });
    }

    return NextResponse.json({
      success: true,
      message: '感谢您的反馈！'
    });
  } catch (error: any) {
    console.error('[Feedback] Error:', error);
    return NextResponse.json({
      success: false,
      error: error?.message || 'Failed to save feedback'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // 获取反馈统计
    const total = feedbackStore.length;
    const helpful = feedbackStore.filter(f => f.feedbackType === 'helpful').length;
    const notHelpful = feedbackStore.filter(f => f.feedbackType === 'not_helpful').length;
    const wrongIntent = feedbackStore.filter(f => f.feedbackType === 'wrong_intent').length;

    // 获取最近的错误意图案例
    const recentWrongIntents = feedbackStore
      .filter(f => f.feedbackType === 'wrong_intent')
      .slice(-20)
      .map(f => ({
        userInput: f.userInput,
        predictedIntent: f.predictedIntent,
        actualIntent: f.actualIntent,
        timestamp: f.timestamp
      }));

    return NextResponse.json({
      success: true,
      statistics: {
        total,
        helpful,
        notHelpful,
        wrongIntent,
        helpfulRate: total > 0 ? (helpful / total * 100).toFixed(2) + '%' : '0%',
        wrongIntentRate: total > 0 ? (wrongIntent / total * 100).toFixed(2) + '%' : '0%'
      },
      recentWrongIntents
    });
  } catch (error: any) {
    console.error('[Feedback] Error:', error);
    return NextResponse.json({
      success: false,
      error: error?.message || 'Failed to get feedback'
    }, { status: 500 });
  }
}
