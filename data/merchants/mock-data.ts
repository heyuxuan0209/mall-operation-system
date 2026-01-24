import { Merchant } from '@/types';

// 模拟商户数据
export const mockMerchants: Merchant[] = [
  {
    id: 'M001',
    name: '海底捞火锅',
    category: '餐饮-火锅',
    floor: 'L4',
    shopNumber: '401',
    area: 450,
    rent: 132000,
    lastMonthRevenue: 173000,
    rentToSalesRatio: 0.28,
    status: 'operating',
    riskLevel: 'high', // 高风险
    totalScore: 45,
    metrics: {
      collection: 60,
      operational: 35,
      siteQuality: 50,
      customerReview: 45,
      riskResistance: 35
    },
    comparison: {
      revenue: { mom: -8.5, yoy: -15.2 },
      totalScore: { mom: -5, yoy: -12 },
      rentRatio: { mom: 2.3, yoy: 4.5 }
    },
    createdAt: '2024-01-15',
    updatedAt: '2026-01-20'
  },
  {
    id: 'M002',
    name: '星巴克咖啡',
    category: '餐饮-饮品',
    floor: 'L1',
    shopNumber: '105',
    area: 180,
    rent: 45000,
    lastMonthRevenue: 280000,
    rentToSalesRatio: 0.16,
    status: 'operating',
    riskLevel: 'none', // 无风险
    totalScore: 88,
    metrics: {
      collection: 95,
      operational: 90,
      siteQuality: 85,
      customerReview: 88,
      riskResistance: 82
    },
    comparison: {
      revenue: { mom: 5.2, yoy: 12.8 },
      totalScore: { mom: 3, yoy: 8 },
      rentRatio: { mom: -0.5, yoy: -1.2 }
    },
    createdAt: '2023-06-10',
    updatedAt: '2026-01-20'
  },
  {
    id: 'M003',
    name: '优衣库',
    category: '零售-服饰',
    floor: 'L2',
    shopNumber: '201',
    area: 800,
    rent: 180000,
    lastMonthRevenue: 950000,
    rentToSalesRatio: 0.19,
    status: 'operating',
    riskLevel: 'low', // 低风险
    totalScore: 85,
    metrics: {
      collection: 100,
      operational: 85,
      siteQuality: 80,
      customerReview: 82,
      riskResistance: 78
    },
    comparison: {
      revenue: { mom: 3.5, yoy: 8.2 },
      totalScore: { mom: 2, yoy: 5 },
      rentRatio: { mom: -0.3, yoy: -0.8 }
    },
    createdAt: '2023-03-20',
    updatedAt: '2026-01-20'
  },
  {
    id: 'M004',
    name: '周大福珠宝',
    category: '零售-珠宝',
    floor: 'L1',
    shopNumber: '108',
    area: 120,
    rent: 28000,
    lastMonthRevenue: 420000,
    rentToSalesRatio: 0.067,
    status: 'operating',
    riskLevel: 'none', // 无风险
    totalScore: 92,
    metrics: {
      collection: 100,
      operational: 92,
      siteQuality: 90,
      customerReview: 88,
      riskResistance: 90
    },
    comparison: {
      revenue: { mom: 8.5, yoy: 18.3 },
      totalScore: { mom: 4, yoy: 10 },
      rentRatio: { mom: -1.2, yoy: -2.5 }
    },
    createdAt: '2023-01-05',
    updatedAt: '2026-01-20'
  },
  {
    id: 'M005',
    name: '绿茶餐厅',
    category: '餐饮-正餐',
    floor: 'L3',
    shopNumber: '305',
    area: 380,
    rent: 95000,
    lastMonthRevenue: 320000,
    rentToSalesRatio: 0.297,
    status: 'operating',
    riskLevel: 'medium', // 中风险
    totalScore: 58,
    metrics: {
      collection: 75,
      operational: 55,
      siteQuality: 60,
      customerReview: 52,
      riskResistance: 48
    },
    comparison: {
      revenue: { mom: -3.2, yoy: -8.5 },
      totalScore: { mom: -2, yoy: -6 },
      rentRatio: { mom: 1.5, yoy: 3.2 }
    },
    createdAt: '2024-05-12',
    updatedAt: '2026-01-20'
  },
  {
    id: 'M006',
    name: '万达影城',
    category: '主力店-影城',
    floor: 'L5',
    shopNumber: '501',
    area: 2500,
    rent: 280000,
    lastMonthRevenue: 2100000,
    rentToSalesRatio: 0.133,
    status: 'operating',
    riskLevel: 'low', // 低风险
    totalScore: 82,
    metrics: {
      collection: 95,
      operational: 80,
      siteQuality: 78,
      customerReview: 85,
      riskResistance: 72
    },
    comparison: {
      revenue: { mom: 6.8, yoy: 15.2 },
      totalScore: { mom: 3, yoy: 7 },
      rentRatio: { mom: -0.8, yoy: -1.5 }
    },
    createdAt: '2022-12-01',
    updatedAt: '2026-01-20'
  }
];

// 获取统计数据
export function getStatistics(merchants: Merchant[]) {
  return {
    totalMerchants: merchants.length,
    noneRiskCount: merchants.filter(m => m.riskLevel === 'none').length,
    lowRiskCount: merchants.filter(m => m.riskLevel === 'low').length,
    mediumRiskCount: merchants.filter(m => m.riskLevel === 'medium').length,
    highRiskCount: merchants.filter(m => m.riskLevel === 'high').length,
    averageHealthScore: Math.round(merchants.reduce((sum, m) => sum + m.totalScore, 0) / merchants.length),
    totalRevenue: merchants.reduce((sum, m) => sum + m.lastMonthRevenue, 0),
    averageRentRatio: merchants.reduce((sum, m) => sum + m.rentToSalesRatio, 0) / merchants.length,
    activeTasks: 8,
    completedTasks: 23
  };
}
