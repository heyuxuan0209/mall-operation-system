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
    stage: 'executing' as any,
    priority: 'urgent',
    riskLevel: 'high' as any,
    createdAt: '2026-01-15',
    updatedAt: '2026-01-28',
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
    afterMetrics: {
      collection: 60,
      operational: 42,
      siteQuality: 52,
      customerReview: 47,
      riskResistance: 36
    },
    measureEffects: [
      {
        measure: '协助优化菜单结构，推出高毛利特色菜品',
        targetDimension: 'operational',
        beforeScore: 35,
        afterScore: 42,
        improvement: 7,
        effectiveness: 'high',
        evidence: '新推出3道特色菜品，单品毛利率提升至45%，拉动整体营收增长8%',
        implementationDate: '2026-01-20',
        evaluationDate: '2026-01-27'
      },
      {
        measure: '开展联合营销活动，提升客流量',
        targetDimension: 'siteQuality',
        beforeScore: 50,
        afterScore: 52,
        improvement: 2,
        effectiveness: 'medium',
        evidence: '周末客流量提升12%，但平日效果不明显，转化率仍需改善',
        implementationDate: '2026-01-22',
        evaluationDate: '2026-01-28'
      }
    ],
    executionTimeline: [
      {
        date: '2026-01-16',
        milestone: '深度访谈商户，确定帮扶方向',
        status: 'completed',
        notes: '与店长沟通2小时，分析营收下滑原因，确定菜单优化为核心策略'
      },
      {
        date: '2026-01-18',
        milestone: '完成菜单优化方案设计',
        status: 'completed',
        notes: '结合顾客反馈数据，设计3道高毛利特色菜，预计毛利率提升10%'
      },
      {
        date: '2026-01-20',
        milestone: '新菜品上线试运营',
        status: 'completed',
        notes: '完成员工培训，新菜品正式上线，首日销售超出预期'
      },
      {
        date: '2026-01-25',
        milestone: '联合营销活动启动',
        status: 'completed',
        notes: '与商场策划部合作，推出"火锅美食节"主题活动'
      },
      {
        date: '2026-02-10',
        milestone: '效果评估与优化调整',
        status: 'in_progress',
        notes: '收集数据，分析改善效果，制定下一步优化方案'
      }
    ],
    logs: [
      {
        id: 'LOG-T001-001',
        date: '2026-01-15',
        action: '任务启动会议，与商户负责人深入沟通经营痛点',
        type: 'manual',
        user: '张经理'
      },
      {
        id: 'LOG-T001-002',
        date: '2026-01-16',
        action: '完成商户经营数据分析，识别核心问题为菜品结构不合理',
        type: 'manual',
        user: '张经理'
      },
      {
        id: 'LOG-T001-003',
        date: '2026-01-18',
        action: '参考知识库案例，采用"高毛利菜品优化"策略',
        type: 'strategy_adopted',
        user: '系统'
      },
      {
        id: 'LOG-T001-004',
        date: '2026-01-20',
        action: '新菜品正式上线，员工培训完成，首日反馈良好',
        type: 'manual',
        user: '张经理'
      },
      {
        id: 'LOG-T001-005',
        date: '2026-01-22',
        action: '启动联合营销活动，商场主通道设置宣传展位',
        type: 'manual',
        user: '张经理'
      },
      {
        id: 'LOG-T001-006',
        date: '2026-01-27',
        action: '数据复盘：新菜品周销售额达2.8万元，超出预期20%',
        type: 'manual',
        user: '张经理'
      }
    ],
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
    updatedAt: '2026-01-25',
    startDate: '2026-01-18',
    deadline: '2026-02-28',
    initialMetrics: {
      collection: 75,
      operational: 55,
      siteQuality: 60,
      customerReview: 52,
      riskResistance: 48
    },
    afterMetrics: {
      collection: 77,
      operational: 58,
      siteQuality: 66,
      customerReview: 60,
      riskResistance: 50
    },
    measureEffects: [
      {
        measure: '开展服务礼仪培训，提升服务水平',
        targetDimension: 'customerReview',
        beforeScore: 52,
        afterScore: 60,
        improvement: 8,
        effectiveness: 'high',
        evidence: '顾客投诉率下降40%，服务评分从3.2星提升至4.0星',
        implementationDate: '2026-01-19',
        evaluationDate: '2026-01-25'
      },
      {
        measure: '优化就餐环境，更新桌椅和装饰',
        targetDimension: 'siteQuality',
        beforeScore: 60,
        afterScore: 66,
        improvement: 6,
        effectiveness: 'high',
        evidence: '环境评分提升，顾客停留时间延长15分钟，复购率提升10%',
        implementationDate: '2026-01-20',
        evaluationDate: '2026-01-25'
      },
      {
        measure: '建立顾客反馈机制，及时处理投诉',
        targetDimension: 'customerReview',
        beforeScore: 52,
        afterScore: 58,
        improvement: 6,
        effectiveness: 'medium',
        evidence: '投诉响应时间从24小时缩短至2小时，但需持续跟进',
        implementationDate: '2026-01-21',
        evaluationDate: '2026-01-25'
      }
    ],
    executionTimeline: [
      {
        date: '2026-01-19',
        milestone: '服务礼仪培训完成',
        status: 'completed',
        notes: '全体员工参加培训，通过率100%，建立服务标准手册'
      },
      {
        date: '2026-01-20',
        milestone: '餐厅环境改造完成',
        status: 'completed',
        notes: '更新桌椅30套，墙面重新粉刷，增加绿植装饰'
      },
      {
        date: '2026-01-21',
        milestone: '顾客反馈系统上线',
        status: 'completed',
        notes: '部署二维码反馈系统，建立投诉处理流程'
      },
      {
        date: '2026-01-23',
        milestone: '会员优惠活动启动',
        status: 'completed',
        notes: '推出充值送活动，首周新增会员120人'
      },
      {
        date: '2026-02-15',
        milestone: '阶段性效果评估',
        status: 'pending',
        notes: '计划进行顾客满意度调查，评估改善效果'
      }
    ],
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
      },
      {
        id: 'l-003',
        date: '2026-01-21',
        action: '部署顾客反馈二维码，首日收到反馈18条',
        type: 'manual',
        user: '李主管'
      },
      {
        id: 'l-004',
        date: '2026-01-23',
        action: '会员充值活动上线，首日办卡35张',
        type: 'manual',
        user: '李主管'
      },
      {
        id: 'l-005',
        date: '2026-01-25',
        action: '周数据复盘：顾客满意度提升至60分，投诉率下降40%',
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
    status: 'completed',
    stage: 'completed' as any,
    priority: 'medium',
    riskLevel: 'medium' as any,
    createdAt: '2026-01-10',
    updatedAt: '2026-01-30',
    startDate: '2026-01-10',
    deadline: '2026-01-31',
    initialMetrics: {
      collection: 100,
      operational: 82,
      siteQuality: 78,
      customerReview: 80,
      riskResistance: 75
    },
    afterMetrics: {
      collection: 100,
      operational: 88,
      siteQuality: 82,
      customerReview: 83,
      riskResistance: 78
    },
    measureEffects: [
      {
        measure: '策划季节性促销活动',
        targetDimension: 'operational',
        beforeScore: 82,
        afterScore: 88,
        improvement: 6,
        effectiveness: 'high',
        evidence: '新年促销活动销售额提升25%，单日最高销售额破15万',
        implementationDate: '2026-01-15',
        evaluationDate: '2026-01-28'
      },
      {
        measure: '优化商品陈列，提升购物体验',
        targetDimension: 'siteQuality',
        beforeScore: 78,
        afterScore: 82,
        improvement: 4,
        effectiveness: 'high',
        evidence: '顾客停留时间延长18%，试衣率提升12%',
        implementationDate: '2026-01-15',
        evaluationDate: '2026-01-28'
      },
      {
        measure: '开展会员日活动，提高复购率',
        targetDimension: 'customerReview',
        beforeScore: 80,
        afterScore: 83,
        improvement: 3,
        effectiveness: 'medium',
        evidence: '会员复购率提升12%，但新会员增长有限',
        implementationDate: '2026-01-18',
        evaluationDate: '2026-01-28'
      }
    ],
    executionTimeline: [
      {
        date: '2026-01-12',
        milestone: '完成促销活动策划',
        status: 'completed',
        notes: '制定"新春换新季"主题活动方案，预算20万元'
      },
      {
        date: '2026-01-15',
        milestone: '商品陈列优化完成',
        status: 'completed',
        notes: '重新规划卖场动线，设置3个主题展示区'
      },
      {
        date: '2026-01-15',
        milestone: '促销活动正式启动',
        status: 'completed',
        notes: '新春促销活动上线，首日销售额达12万'
      },
      {
        date: '2026-01-18',
        milestone: '会员日活动首次举办',
        status: 'completed',
        notes: '会员专享8折优惠，当日会员销售占比65%'
      },
      {
        date: '2026-01-28',
        milestone: '活动效果总结',
        status: 'completed',
        notes: '总销售额提升25%，超出预期目标，形成复盘报告'
      }
    ],
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
      },
      {
        id: 'l-104',
        date: '2026-01-20',
        action: '促销活动中期数据：销售额达60万，超出预期15%',
        type: 'manual',
        user: '王经理'
      },
      {
        id: 'l-105',
        date: '2026-01-28',
        action: '活动圆满结束，总销售额提升25%，形成可复制经验',
        type: 'manual',
        user: '王经理'
      }
    ],
    evaluationResult: 'met' as any,
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
    afterMetrics: {
      collection: 95,
      operational: 92,
      siteQuality: 86,
      customerReview: 89,
      riskResistance: 82
    },
    measureEffects: [
      {
        measure: '组织新品试饮活动',
        targetDimension: 'operational',
        beforeScore: 88,
        afterScore: 92,
        improvement: 4,
        effectiveness: 'high',
        evidence: '新品销售额占比达35%，日均销售额提升18%',
        implementationDate: '2026-01-10',
        evaluationDate: '2026-01-15'
      },
      {
        measure: '提供店内推广位支持',
        targetDimension: 'siteQuality',
        beforeScore: 83,
        afterScore: 86,
        improvement: 3,
        effectiveness: 'medium',
        evidence: '品牌曝光度提升，但对实际销售拉动有限',
        implementationDate: '2026-01-08',
        evaluationDate: '2026-01-15'
      },
      {
        measure: '协调商场广播和LED屏宣传',
        targetDimension: 'customerReview',
        beforeScore: 86,
        afterScore: 89,
        improvement: 3,
        effectiveness: 'medium',
        evidence: '品牌认知度提升，顾客到店率增加12%',
        implementationDate: '2026-01-08',
        evaluationDate: '2026-01-15'
      }
    ],
    executionTimeline: [
      {
        date: '2026-01-08',
        milestone: '完成店内推广位布置',
        status: 'completed',
        notes: '主通道设置新品展示架，门店张贴宣传海报'
      },
      {
        date: '2026-01-08',
        milestone: '商场宣传资源协调完成',
        status: 'completed',
        notes: '获得商场广播和LED屏每日5次宣传时段'
      },
      {
        date: '2026-01-10',
        milestone: '新品试饮活动启动',
        status: 'completed',
        notes: '周末两天试饮活动，参与人数超200人，转化率达65%'
      },
      {
        date: '2026-01-15',
        milestone: '推广效果总结',
        status: 'completed',
        notes: '新品销售超出预期，形成推广经验总结报告'
      }
    ],
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
      },
      {
        id: 'l-203',
        date: '2026-01-12',
        action: '新品日均销售额达8000元，超出预期目标',
        type: 'manual',
        user: '陈主管'
      },
      {
        id: 'l-204',
        date: '2026-01-15',
        action: '推广活动圆满结束，新品销售占比达35%',
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
    stage: 'executing' as any,
    priority: 'medium',
    riskLevel: 'medium' as any,
    createdAt: '2026-01-12',
    updatedAt: '2026-01-28',
    startDate: '2026-01-12',
    deadline: '2026-02-10',
    initialMetrics: {
      collection: 95,
      operational: 80,
      siteQuality: 78,
      customerReview: 85,
      riskResistance: 72
    },
    afterMetrics: {
      collection: 95,
      operational: 83,
      siteQuality: 82,
      customerReview: 87,
      riskResistance: 73
    },
    measureEffects: [
      {
        measure: '协调施工时间，减少对营业影响',
        targetDimension: 'operational',
        beforeScore: 80,
        afterScore: 83,
        improvement: 3,
        effectiveness: 'medium',
        evidence: '施工期间日均损失营业额控制在5%以内，好于预期',
        implementationDate: '2026-01-15',
        evaluationDate: '2026-01-27'
      },
      {
        measure: '开展升级后宣传推广',
        targetDimension: 'customerReview',
        beforeScore: 85,
        afterScore: 87,
        improvement: 2,
        effectiveness: 'medium',
        evidence: '升级后顾客满意度提升，但宣传效果仍需加强',
        implementationDate: '2026-01-25',
        evaluationDate: '2026-01-28'
      }
    ],
    executionTimeline: [
      {
        date: '2026-01-13',
        milestone: '施工方案确定',
        status: 'completed',
        notes: '制定分期施工方案，避免全面停业，预计工期15天'
      },
      {
        date: '2026-01-15',
        milestone: '设备升级施工启动',
        status: 'completed',
        notes: '首批3个影厅开始设备更换，其他影厅正常营业'
      },
      {
        date: '2026-01-25',
        milestone: '设备升级完成',
        status: 'completed',
        notes: '全部6个影厅设备更换完毕，开始试运行'
      },
      {
        date: '2026-01-28',
        milestone: '升级宣传活动启动',
        status: 'in_progress',
        notes: '计划推出"全新观影体验"主题活动'
      },
      {
        date: '2026-02-10',
        milestone: '升级效果评估',
        status: 'pending',
        notes: '收集顾客反馈，评估升级投资回报'
      }
    ],
    logs: [
      {
        id: 'l-301',
        date: '2026-01-13',
        action: '完成施工方案设计，分期施工减少营业损失',
        type: 'manual',
        user: '赵经理'
      },
      {
        id: 'l-302',
        date: '2026-01-15',
        action: '设备升级施工正式启动，首批3个影厅开工',
        type: 'manual',
        user: '赵经理'
      },
      {
        id: 'l-303',
        date: '2026-01-20',
        action: '施工进度过半，顾客反馈施工噪音控制良好',
        type: 'manual',
        user: '赵经理'
      },
      {
        id: 'l-304',
        date: '2026-01-25',
        action: '全部设备升级完成，开始试运行调试',
        type: 'manual',
        user: '赵经理'
      },
      {
        id: 'l-305',
        date: '2026-01-28',
        action: '启动升级宣传，主通道设置宣传展位',
        type: 'manual',
        user: '赵经理'
      }
    ],
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
