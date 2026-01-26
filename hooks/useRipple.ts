import { useCallback, useState } from 'react';

interface Ripple {
  x: number;
  y: number;
  size: number;
  id: number;
}

/**
 * 自定义Hook：实现Material Design风格的触摸涟漪效果
 *
 * @returns 涟漪状态和处理函数
 */
export function useRipple() {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const addRipple = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();

    let x: number, y: number;

    if ('touches' in event) {
      // 触摸事件
      const touch = event.touches[0];
      x = touch.clientX - rect.left;
      y = touch.clientY - rect.top;
    } else {
      // 鼠标事件
      x = event.clientX - rect.left;
      y = event.clientY - rect.top;
    }

    const size = Math.max(rect.width, rect.height) * 2;
    const id = Date.now();

    setRipples((prev) => [...prev, { x, y, size, id }]);

    // 动画结束后移除涟漪
    setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== id));
    }, 600);
  }, []);

  const RippleContainer = useCallback(() => {
    if (ripples.length === 0) return null;

    return (
      <span className="absolute inset-0 overflow-hidden rounded-inherit pointer-events-none">
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="absolute bg-white/30 rounded-full animate-ripple"
            style={{
              left: ripple.x - ripple.size / 2,
              top: ripple.y - ripple.size / 2,
              width: ripple.size,
              height: ripple.size,
            }}
          />
        ))}
      </span>
    );
  }, [ripples]);

  return { addRipple, RippleContainer };
}
