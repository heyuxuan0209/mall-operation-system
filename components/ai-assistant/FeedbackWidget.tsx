/**
 * 反馈收集组件
 */

'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Star } from 'lucide-react';
import { feedbackCollector } from '@/utils/ai-assistant/feedbackCollector';

interface FeedbackWidgetProps {
  messageId: string;
  onFeedback: (helpful: boolean, rating?: number) => void;
}

export default function FeedbackWidget({
  messageId,
  onFeedback,
}: FeedbackWidgetProps) {
  const [showRating, setShowRating] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);

  const handleHelpful = (helpful: boolean) => {
    if (helpful) {
      setShowRating(true);
    } else {
      onFeedback(false);
    }
  };

  const handleRating = (rating: number) => {
    setSelectedRating(rating);
    onFeedback(true, rating);
    setShowRating(false);
  };

  return (
    <div className="flex items-center gap-2">
      {!showRating ? (
        <>
          <span className="text-xs text-gray-500">有帮助吗?</span>
          <button
            onClick={() => handleHelpful(true)}
            className="text-gray-400 hover:text-green-600 transition-colors"
            aria-label="有帮助"
          >
            <ThumbsUp className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleHelpful(false)}
            className="text-gray-400 hover:text-red-600 transition-colors"
            aria-label="没帮助"
          >
            <ThumbsDown className="h-4 w-4" />
          </button>
        </>
      ) : (
        <>
          <span className="text-xs text-gray-500">评分:</span>
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              onClick={() => handleRating(rating)}
              className="text-gray-300 hover:text-yellow-500 transition-colors"
              aria-label={`${rating}星`}
            >
              <Star
                className="h-4 w-4"
                fill={rating <= selectedRating ? 'currentColor' : 'none'}
              />
            </button>
          ))}
        </>
      )}
    </div>
  );
}
