/**
 * 性能报告查看脚本
 * 在浏览器控制台运行此代码查看Phase 1优化效果
 */

// 方法1：直接在控制台运行
// 复制以下代码到浏览器控制台：

/*
// 导入性能监控模块
import { performanceMonitor } from '@/skills/ai-assistant/performance-monitor';

// 打印性能报告
performanceMonitor.printReport();

// 获取详细数据
const report = performanceMonitor.getReport();
console.log('详细报告:', report);

// 检查是否达到目标
const check = performanceMonitor.checkTargets();
console.log('目标检查:', check);
*/

// 方法2：如果上面的导入不工作，可以在服务端添加API端点
// 创建 /api/performance-report 端点返回性能数据

export default async function handler(req, res) {
  // 这个文件需要放在 pages/api/performance-report.ts
  const { performanceMonitor } = await import('@/skills/ai-assistant/performance-monitor');

  const report = performanceMonitor.getReport();
  const check = performanceMonitor.checkTargets();
  const recentMetrics = performanceMonitor.getRecentMetrics(20);

  res.status(200).json({
    report,
    check,
    recentMetrics
  });
}
