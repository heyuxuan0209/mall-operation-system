"use client";

/**
 * Demo版本页脚组件
 * 显示版权声明和项目信息
 */
export default function DemoFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-100 border-t border-slate-200 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-600">
          {/* 版权信息 */}
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-800">商户智运Agent</span>
            <span className="text-slate-400">|</span>
            <span>© {currentYear} 个人作品集项目</span>
          </div>

          {/* 项目信息 */}
          <div className="flex items-center gap-4 text-xs">
            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md font-medium">
              Demo版本
            </span>
            <span className="text-slate-500">
              数据仅供演示，每24小时重置
            </span>
          </div>

          {/* 技术栈标签 */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Next.js</span>
            <span>•</span>
            <span>React</span>
            <span>•</span>
            <span>TypeScript</span>
            <span>•</span>
            <span>AI</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
