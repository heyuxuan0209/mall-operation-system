import { useEffect, useRef, useState } from 'react';

interface SwipeHandlers {
  onSwipeDown?: () => void;
  onSwipeUp?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

interface SwipeOptions {
  threshold?: number; // 最小滑动距离（像素）
  velocity?: number;  // 最小滑动速度
}

/**
 * 自定义Hook：处理触摸滑动手势
 *
 * @param handlers - 滑动方向的回调函数
 * @param options - 配置选项
 * @returns ref - 需要绑定到目标元素的ref
 */
export function useSwipe(
  handlers: SwipeHandlers,
  options: SwipeOptions = {}
) {
  const { threshold = 50, velocity = 0.3 } = options;
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
      setIsDragging(true);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartRef.current) return;

      const touch = e.touches[0];
      const deltaY = touch.clientY - touchStartRef.current.y;

      // 只在向下滑动时显示拖拽效果
      if (deltaY > 0 && handlers.onSwipeDown) {
        setDragOffset(deltaY);
        // 如果滑动距离超过一定阈值，阻止默认滚动行为
        if (deltaY > 10) {
          e.preventDefault();
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const deltaTime = Date.now() - touchStartRef.current.time;

      // 计算滑动速度
      const velocityX = Math.abs(deltaX) / deltaTime;
      const velocityY = Math.abs(deltaY) / deltaTime;

      // 判断滑动方向和是否触发回调
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        // 垂直滑动
        if (deltaY > threshold && velocityY > velocity && handlers.onSwipeDown) {
          handlers.onSwipeDown();
        } else if (deltaY < -threshold && velocityY > velocity && handlers.onSwipeUp) {
          handlers.onSwipeUp();
        }
      } else {
        // 水平滑动
        if (deltaX > threshold && velocityX > velocity && handlers.onSwipeRight) {
          handlers.onSwipeRight();
        } else if (deltaX < -threshold && velocityX > velocity && handlers.onSwipeLeft) {
          handlers.onSwipeLeft();
        }
      }

      // 重置状态
      touchStartRef.current = null;
      setIsDragging(false);
      setDragOffset(0);
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handlers, threshold, velocity]);

  return { ref: elementRef, isDragging, dragOffset };
}
