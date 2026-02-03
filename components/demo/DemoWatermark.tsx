"use client";

/**
 * Demo水印组件
 * 显示在页面右下角，提醒这是Demo版本
 */
export default function DemoWatermark() {
  return (
    <div className="fixed bottom-20 lg:bottom-4 right-4 z-40 pointer-events-none select-none">
      <div className="bg-slate-900/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg shadow-lg border border-slate-700">
        <div className="flex items-center gap-2 text-xs">
          <span className="animate-pulse">●</span>
          <span className="font-medium">Demo版本</span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-300">数据仅供演示</span>
        </div>
      </div>
    </div>
  );
}
