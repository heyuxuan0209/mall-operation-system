/**
 * Inspection Analyzer - Checklist Module
 * 巡检分析器 - 检查清单模块
 *
 * 负责生成智能检查清单，根据时间自动匹配开店/闭店/常规检查标准
 */

import { ChecklistItem } from '@/types';
import { ChecklistResult } from './types';

/**
 * 生成检查清单
 * 根据时间自动匹配开店/闭店/常规检查标准
 *
 * 时间规则：
 * - 9:50之前 → 开店检查
 * - 21:00之后 → 闭店检查
 * - 其他时间 → 常规巡检
 *
 * @param timeOfDay - 检查时间（默认为当前时间）
 * @returns 检查清单结果
 */
export function generateChecklist(timeOfDay: Date = new Date()): ChecklistResult {
  const hour = timeOfDay.getHours();
  const minute = timeOfDay.getMinutes();
  const timeInMinutes = hour * 60 + minute;

  // 早间开店检查（9:50之前，即590分钟之前）
  if (timeInMinutes < 590) {
    return {
      type: 'opening',
      items: [
        { id: 'open-1', label: '门吸是否打开', checked: false },
        { id: 'open-2', label: '灯光是否全部开启', checked: false },
        { id: 'open-3', label: '员工是否参加晨会', checked: false },
        { id: 'open-4', label: '收银系统是否正常', checked: false },
        { id: 'open-5', label: '店面卫生是否整洁', checked: false },
        { id: 'open-6', label: '商品陈列是否规范', checked: false },
      ],
    };
  }

  // 晚间闭店检查（21:00之后，即1260分钟之后）
  if (timeInMinutes >= 1260) {
    return {
      type: 'closing',
      items: [
        { id: 'close-1', label: '锁门查人是否完成', checked: false },
        { id: 'close-2', label: '电源是否全部关闭', checked: false },
        { id: 'close-3', label: '现金是否已存入保险柜', checked: false },
        { id: 'close-4', label: '垃圾是否清理干净', checked: false },
        { id: 'close-5', label: '门窗是否锁好', checked: false },
        { id: 'close-6', label: '监控设备是否正常', checked: false },
      ],
    };
  }

  // 常规巡检
  return {
    type: 'routine',
    items: [
      { id: 'routine-1', label: '员工着装是否规范', checked: false },
      { id: 'routine-2', label: '服务态度是否良好', checked: false },
      { id: 'routine-3', label: '商品陈列是否整齐', checked: false },
      { id: 'routine-4', label: '价格标签是否清晰', checked: false },
      { id: 'routine-5', label: '卫生环境是否达标', checked: false },
      { id: 'routine-6', label: '安全隐患是否排除', checked: false },
      { id: 'routine-7', label: '设施设备是否完好', checked: false },
      { id: 'routine-8', label: '客流情况是否正常', checked: false },
    ],
  };
}
