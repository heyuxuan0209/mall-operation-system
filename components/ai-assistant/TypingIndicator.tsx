/**
 * 打字动画指示器
 */

'use client';

export default function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="rounded-lg bg-gray-100 px-4 py-3">
        <div className="flex space-x-2">
          <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]"></div>
          <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]"></div>
          <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
        </div>
      </div>
    </div>
  );
}
