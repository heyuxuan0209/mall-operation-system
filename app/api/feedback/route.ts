/**
 * 反馈收集 API
 * POST /api/feedback
 */

import { NextResponse } from 'next/server';

interface FeedbackData {
  messageId: string;
  conversationId: string;
  helpful: boolean;
  rating?: number;
  comment?: string;
  intent?: string;
  confidence?: number;
}

// 简单的内存存储（生产环境应使用数据库）
const feedbackStore: FeedbackData[] = [];

export async function POST(request: Request) {
  try {
    const feedback: FeedbackData = await request.json();

    // 验证必填字段
    if (!feedback.messageId || !feedback.conversationId || feedback.helpful === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: messageId, conversationId, helpful',
        },
        { status: 400 }
      );
    }

    // 添加时间戳
    const feedbackWithTimestamp = {
      ...feedback,
      timestamp: new Date().toISOString(),
    };

    // 存储反馈
    feedbackStore.push(feedbackWithTimestamp);

    console.log('[API] Feedback collected:', feedbackWithTimestamp);

    return NextResponse.json({
      success: true,
      message: 'Feedback collected successfully',
    });
  } catch (error) {
    console.error('[API] Feedback collection error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    let filteredFeedback = feedbackStore;

    if (conversationId) {
      filteredFeedback = feedbackStore.filter(
        f => f.conversationId === conversationId
      );
    }

    // 计算统计信息
    const total = filteredFeedback.length;
    const helpful = filteredFeedback.filter(f => f.helpful).length;
    const helpfulRate = total > 0 ? helpful / total : 0;

    const ratings = filteredFeedback
      .filter(f => f.rating !== undefined)
      .map(f => f.rating!);
    const averageRating = ratings.length > 0
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : 0;

    return NextResponse.json({
      success: true,
      feedback: filteredFeedback,
      stats: {
        total,
        helpful,
        helpfulRate: Math.round(helpfulRate * 100),
        averageRating: Math.round(averageRating * 10) / 10,
      },
    });
  } catch (error) {
    console.error('[API] Feedback retrieval error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
