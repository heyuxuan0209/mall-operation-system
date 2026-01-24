import { Task, RiskAlert } from '@/types';

// 风险预警模拟数据
export const mockRiskAlerts: RiskAlert[] = [
  {
    id: 'R001',
    merchantId: 'M001',
    merchantName: '海底捞火锅',
    riskType: 'high_rent_ratio',
    severity: 'high',
    message: '租售比达到28%，远超行业警戒线25%，经营压力较大',
    createdAt: '2026-01-20',
    resolved: false
  },
  {
    id: 'R002',
    merchantId: 'M001',
    merchantName: '海底捞火锅',
    riskType: 'low_revenue',
    severity: 'high',
    message: '月营收连续3个月下滑，环比下降8.5%，同比下降15.2%',
    createdAt: '2026-01-20',
    resolved: false
  },
  {
    id: 'R003',
    merchantId: 'M005',
    merchantName: '绿茶餐厅',
    riskType: 'high_rent_ratio',
    severity: 'medium',
    message: '租售比达到29.7%，接近30%高风险线',
    createdAt: '2026-01-19',
    resolved: false
  },
  {
    id: 'R004',
    merchantId: 'M005',
    merchantName: '绿茶餐厅',
    riskType: 'customer_complaint',
    severity: 'medium',
    message: '顾客满意度评分52分，低于60分及格线',
    createdAt: '2026-01-18',
    resolved: false
  },
  {
    id: 'R005',
    merchantId: 'M003',
    merchantName: '优衣库',
    riskType: 'low_revenue',
    severity: 'low',
    message: '营收增长放缓，环比仅增长3.5%',
    createdAt: '2026-01-17',
    resolved: true
  }
];

// 帮扶任务模拟数据
export const mockTasks: Task[] = [
  {
    id: 'T001',
    merchantId: 'M001',
    merchantName: '海底捞火锅',
    title: '海底捞火锅经营改善帮扶',
    description: '该商户租售比过高(28%)，营收持续下滑，健康度评分仅45分，需要紧急介入帮扶',
    measures: [
      '协助优化菜单结构，推出高毛利特色菜品',
      '开展联合营销活动，提升客流量'
    ],
    assignee: '张经理',
    assignedTo: '运营经理 - 张总',
    assignedLevel: 'manager' as any,
    status: 'in_progress',
    stage: 'planning' as any,
    priority: 'urgent',
    riskLevel: 'high' as any,
    createdAt: '2026-01-15',
    updatedAt: '2026-01-20',
    startDate: '2026-01-15',
    deadline: '2026-02-15',
    beforeMetrics: {
      collection: 60,
      operational: 35,
      siteQuality: 50,
      customerReview: 45,
      riskResistance: 35
    },
    initialMetrics: {
      collection: 60,
      operational: 35,
      siteQuality: 50,
      customerReview: 45,
      riskResistance: 35
    },
    logs: [],
    collectionStatus: 'owed' as any
  },
  {
    id: 'T002',
    merchantId: 'M005',
    merchantName: '绿茶餐厅',
    title: '绿茶餐厅顾客满意度提升计划',
    description: '顾客满意度评分52分，需要改善服务质量和就餐体验',
    measures: [
      '开展服务礼仪培训，提升服务水平',
      '优化就餐环境，更新桌椅和装饰',
      '建立顾客反馈机制，及时处理投诉',
      '推出会员优惠活动，增强顾客粘性'
    ],
    assignee: '李主管',
    assignedTo: '运营助理 - 李主管',
    assignedLevel: 'assistant' as any,
    status: 'in_progress',
    stage: 'executing' as any,
    priority: 'high',
    riskLevel: 'medium' as any,
    createdAt: '2026-01-18',
    updatedAt: '2026-01-18',
    startDate: '2026-01-18',
    deadline: '2026-02-28',
    initialMetrics: {
      collection: 75,
      operational: 55,
      siteQuality: 60,
      customerReview: 52,
      riskResistance: 48
    },
    logs: [
      {
        id: 'l-001',
        date: '2026-01-19',
        action: '完成服务礼仪培训，全体员工参加',
        type: 'manual',
        user: '李主管'
      },
      {
        id: 'l-002',
        date: '2026-01-20',
        action: '更新了餐厅桌椅和装饰，顾客反馈良好',
        type: 'manual',
        user: '李主管'
      }
    ],
    collectionStatus: 'normal' as any
  },
  {
    id: 'T003',
    merchantId: 'M003',
    merchantName: '优衣库',
    title: '优衣库营收增长促进方案',
    description: '营收增长放缓，需要制定促销策略提升销售额',
    measures: [
      '策划季节性促销活动',
      '优化商品陈列，提升购物体验',
      '开展会员日活动，提高复购率',
      '联合其他品牌开展跨界营销'
    ],
    assignee: '王经理',
    assignedTo: '运营经理 - 王总',
    assignedLevel: 'manager' as any,
    status: 'in_progress',
    stage: 'evaluating' as any,
    priority: 'medium',
    riskLevel: 'medium' as any,
    createdAt: '2026-01-10',
    updatedAt: '2026-01-20',
    startDate: '2026-01-10',
    deadline: '2026-01-31',
    initialMetrics: {
      collection: 100,
      operational: 82,
      siteQuality: 78,
      customerReview: 80,
      riskResistance: 75
    },
    logs: [
      {
        id: 'l-101',
        date: '2026-01-12',
        action: '完成季节性促销活动策划，已上报审批',
        type: 'manual',
        user: '王经理'
      },
      {
        id: 'l-102',
        date: '2026-01-15',
        action: '优化商品陈列完成，客流量提升明显',
        type: 'manual',
        user: '王经理'
      },
      {
        id: 'l-103',
        date: '2026-01-18',
        action: '会员日活动成功举办，复购率提升12%',
        type: 'manual',
        user: '王经理'
      }
    ],
    collectionStatus: 'normal' as any
  },
  {
    id: 'T004',
    merchantId: 'M002',
    merchantName: '星巴克咖啡',
    title: '星巴克新品推广支持',
    description: '协助推广新品，进一步提升营收和品牌影响力',
    measures: [
      '提供店内推广位支持',
      '协调商场广播和LED屏宣传',
      '组织新品试饮活动',
      '提供社交媒体推广资源'
    ],
    assignee: '陈主管',
    assignedTo: '运营助理 - 陈主管',
    assignedLevel: 'assistant' as any,
    status: 'completed',
    stage: 'completed' as any,
    priority: 'low',
    riskLevel: 'low' as any,
    createdAt: '2026-01-05',
    updatedAt: '2026-01-15',
    startDate: '2026-01-05',
    deadline: '2026-01-20',
    initialMetrics: {
      collection: 95,
      operational: 88,
      siteQuality: 83,
      customerReview: 86,
      riskResistance: 80
    },
    logs: [
      {
        id: 'l-201',
        date: '2026-01-08',
        action: '完成店内推广位布置',
        type: 'manual',
        user: '陈主管'
      },
      {
        id: 'l-202',
        date: '2026-01-10',
        action: '新品试饮活动成功举办，参与人数超200人',
        type: 'manual',
        user: '陈主管'
      }
    ],
    evaluationResult: 'met' as any,
    collectionStatus: 'normal' as any
  },
  {
    id: 'T005',
    merchantId: 'M006',
    merchantName: '万达影城',
    title: '万达影城设备升级支持',
    description: '协助完成放映设备升级，提升观影体验',
    measures: [
      '协调施工时间，减少对营业影响',
      '提供临时场地支持',
      '协助办理相关审批手续',
      '开展升级后宣传推广'
    ],
    assignee: '赵经理',
    assignedTo: '运营经理 - 赵总',
    assignedLevel: 'manager' as any,
    status: 'in_progress',
    stage: 'planning' as any,
    priority: 'medium',
    riskLevel: 'medium' as any,
    createdAt: '2026-01-12',
    updatedAt: '2026-01-20',
    startDate: '2026-01-12',
    deadline: '2026-02-10',
    initialMetrics: {
      collection: 95,
      operational: 80,
      siteQuality: 78,
      customerReview: 85,
      riskResistance: 72
    },
    logs: [],
    collectionStatus: 'normal' as any
  }
];

// 获取风险预警统计
export function getRiskStatistics(alerts: RiskAlert[]) {
  return {
    totalAlerts: alerts.length,
    unresolvedAlerts: alerts.filter(a => !a.resolved).length,
    highSeverity: alerts.filter(a => a.severity === 'high' && !a.resolved).length,
    mediumSeverity: alerts.filter(a => a.severity === 'medium' && !a.resolved).length,
    lowSeverity: alerts.filter(a => a.severity === 'low' && !a.resolved).length,
    byType: {
      rent_overdue: alerts.filter(a => a.riskType === 'rent_overdue' && !a.resolved).length,
      low_revenue: alerts.filter(a => a.riskType === 'low_revenue' && !a.resolved).length,
      high_rent_ratio: alerts.filter(a => a.riskType === 'high_rent_ratio' && !a.resolved).length,
      customer_complaint: alerts.filter(a => a.riskType === 'customer_complaint' && !a.resolved).length
    }
  };
}

// 获取任务统计
export function getTaskStatistics(tasks: Task[]) {
  return {
    totalTasks: tasks.length,
    pendingTasks: tasks.filter(t => t.status === 'pending').length,
    inProgressTasks: tasks.filter(t => t.status === 'in_progress').length,
    completedTasks: tasks.filter(t => t.status === 'completed').length,
    failedTasks: tasks.filter(t => t.status === 'failed').length,
    urgentTasks: tasks.filter(t => t.priority === 'urgent' && t.status !== 'completed').length,
    highPriorityTasks: tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length,
    averageImprovement: tasks
      .filter(t => t.improvement !== undefined)
      .reduce((sum, t) => sum + (t.improvement || 0), 0) /
      tasks.filter(t => t.improvement !== undefined).length || 0
  };
}
