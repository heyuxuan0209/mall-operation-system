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
    lastMonthRevenue: 471000, // 修正：确保租售比为28% (132000/471000=0.28)
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
    // ⭐ 详细运营数据（反映高风险状态）
    operationalDetails: {
      // 通用数据 - 客流偏低
      dailyFootfall: 800,        // 日均客流较低（450㎡店面）
      peakHourFootfall: 300,     // 高峰期客流
      conversionRate: 65,        // 转化率一般

      // 餐饮专属 - 翻台率低是核心问题
      restaurant: {
        tableCount: 30,          // 30张桌子
        seatingCapacity: 120,    // 120个座位
        turnoverRate: 1.2,       // ⚠️ 翻台率1.2次/天（行业平均2-3次，严重偏低）
        avgWaitTime: 45,         // 平均等位45分钟（过长）
        avgMealDuration: 90,     // 平均用餐90分钟
        errorOrderRate: 2.5,     // 错漏单率2.5%
        avgCheckSize: 156,       // 客单价156元
      },

      // 顾客数据 - NPS为负，满意度低
      customer: {
        npsScore: -10,           // ⚠️ NPS净推荐值-10（负值，顾客满意度低）
        repeatCustomerRate: 35,  // 复购率仅35%（偏低）
        newCustomerRatio: 40,    // 新客占比40%
        avgCustomerLifetime: 6,  // 客户生命周期仅6个月
      },

      // 员工数据 - 高流失率
      staff: {
        totalCount: 25,          // 总人数25人
        fullTimeCount: 18,       // 全职18人
        partTimeCount: 7,        // 兼职7人
        turnoverRate: 40,        // ⚠️ 员工流失率40%/年（严重偏高）
        avgTenure: 8,            // 平均工龄仅8个月
      },

      // 竞争环境 - 竞争激烈，定位落后
      competition: {
        nearbyCompetitors: 12,   // 3km内有12家竞品
        marketShare: 8,          // 市场份额仅8%
        competitivePosition: '落后',
      },

      // 位置数据 - 位置劣势
      location: {
        floor: 'L4',             // 4楼（楼层较高）
        zoneType: '次动线',      // ⚠️ 次动线位置（非主流区域）
        adjacentToAnchor: false, // 不毗邻主力店
        visibilityRating: 3,     // 可见度3分（一般）
      },

      // 元数据
      lastUpdated: '2026-02-10T10:30:00Z',
      dataSource: 'inspection',
      inspectorId: 'DEMO_USER',
      inspectorName: '巡店专员',
      notes: '⚠️ 核心问题：翻台率严重偏低（1.2次/天 vs 行业平均2-3次），等位时间长导致客户流失。员工流失率40%影响服务质量。顾客满意度低（NPS为负），需立即改善用餐体验和服务标准。位置劣势（次动线+4楼）导致自然客流不足。'
    },
    createdAt: '2024-01-15',
    updatedAt: '2026-02-10'
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
    riskLevel: 'low', // 低风险（修正：88分应为低风险80-89，不是无风险）
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
    // ⭐ 详细运营数据（反映低风险、高健康度状态）
    operationalDetails: {
      // 通用数据 - 转化率高
      dailyFootfall: 650,        // 日均客流650人次（180㎡店面）
      peakHourFootfall: 180,     // 高峰期客流
      conversionRate: 75,        // ✅ 转化率75%（优秀）

      // 餐饮专属（饮品店简化版）- 翻台率快
      restaurant: {
        tableCount: 12,          // 12张桌子
        seatingCapacity: 40,     // 40个座位
        turnoverRate: 4.5,       // ✅ 翻台率4.5次/天（饮品店快周转）
        avgWaitTime: 8,          // 平均等位8分钟（快速）
        avgMealDuration: 35,     // 平均停留35分钟
        errorOrderRate: 1.2,     // 错单率1.2%（低）
        avgCheckSize: 42,        // 客单价42元
      },

      // 顾客数据 - NPS高，忠诚度高
      customer: {
        npsScore: 68,            // ✅ NPS净推荐值68分（优秀）
        repeatCustomerRate: 72,  // ✅ 复购率72%（品牌忠诚度高）
        newCustomerRatio: 18,    // 新客占比18%（老客为主）
        avgCustomerLifetime: 36, // 客户生命周期36个月
      },

      // 员工数据 - 稳定且训练有素
      staff: {
        totalCount: 10,          // 总人数10人
        fullTimeCount: 6,        // 全职6人
        partTimeCount: 4,        // 兼职4人
        turnoverRate: 12,        // ✅ 员工流失率12%/年（低）
        avgTenure: 18,           // 平均工龄18个月（稳定）
      },

      // 竞争环境 - 品牌领先
      competition: {
        nearbyCompetitors: 15,   // 3km内有15家竞品
        marketShare: 35,         // ✅ 市场份额35%（领先）
        competitivePosition: '领先',
      },

      // 元数据
      lastUpdated: '2026-02-10T10:30:00Z',
      dataSource: 'manual',
      inspectorId: 'DEMO_USER',
      inspectorName: '巡店专员',
      notes: '✅ 经营状况优秀：高转化率75%和复购率72%，品牌忠诚度高。翻台率4.5次/天，适合快速消费场景。员工培训体系完善，服务标准统一。1楼黄金位置，客流稳定。建议保持现有运营标准。'
    },
    createdAt: '2023-06-10',
    updatedAt: '2026-02-10'
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
    // ⭐ 详细运营数据（反映低风险、良好运营状态）
    operationalDetails: {
      // 通用数据 - 客流量大
      dailyFootfall: 1200,       // ✅ 日均客流1200人次（800㎡大店）
      peakHourFootfall: 400,     // 高峰期客流
      conversionRate: 42,        // 转化率42%（有提升空间）

      // 零售专属 - 库存周转健康
      retail: {
        dailySales: 38000,       // 日均销售额3.8万元
        avgTransactionValue: 285, // 客单价285元
        inventoryTurnover: 3.2,  // ✅ 库存周转率3.2次/月（健康）
        returnRate: 8.5,         // 退货率8.5%（控制良好）
      },

      // 顾客数据 - 满意度良好
      customer: {
        npsScore: 45,            // NPS净推荐值45分（良好）
        repeatCustomerRate: 52,  // 复购率52%（稳定）
        newCustomerRatio: 30,    // 新客占比30%
        avgCustomerLifetime: 18, // 客户生命周期18个月
      },

      // 员工数据 - 管理规范
      staff: {
        totalCount: 16,          // 总人数16人
        fullTimeCount: 12,       // 全职12人
        partTimeCount: 4,        // 兼职4人
        turnoverRate: 15,        // ✅ 员工流失率15%/年（低，管理规范）
        avgTenure: 24,           // 平均工龄24个月（稳定）
      },

      // 竞争环境 - 品牌优势
      competition: {
        nearbyCompetitors: 8,    // 3km内有8家竞品
        marketShare: 22,         // ✅ 市场份额22%（领先）
        competitivePosition: '领先',
      },

      // 位置数据 - 位置优越
      location: {
        floor: 'L2',             // 2楼（理想楼层）
        zoneType: '主动线',      // ✅ 主动线位置（核心区域）
        adjacentToAnchor: true,  // ✅ 毗邻主力店（万达影城）
        visibilityRating: 5,     // ✅ 可见度5分（最高）
      },

      // 元数据
      lastUpdated: '2026-02-10T10:30:00Z',
      dataSource: 'pos',
      inspectorId: 'DEMO_USER',
      inspectorName: '巡店专员',
      notes: '✅ 经营状况良好：客流量大（1200人次/日），但转化率42%仍有提升空间（可能受试衣间数量限制）。库存周转率3.2次/月健康，退货率控制良好。员工稳定性高，管理规范。2楼主动线+毗邻主力店，位置优越。建议优化试衣间配置提升转化率。'
    },
    createdAt: '2023-03-20',
    updatedAt: '2026-02-10'
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
    riskLevel: 'high', // 高风险（修正：58分应为高风险，不是中风险）
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
  },
  // ============ 新增商户数据 (M007-M018) ============
  {
    id: 'M007',
    name: '蜀大侠火锅',
    category: '餐饮-火锅',
    floor: 'L4',
    shopNumber: '403',
    area: 380,
    rent: 95000,
    lastMonthRevenue: 420000,
    rentToSalesRatio: 0.226,
    status: 'operating',
    riskLevel: 'medium',
    totalScore: 65,
    metrics: {
      collection: 80,
      operational: 62,
      siteQuality: 68,
      customerReview: 60,
      riskResistance: 55
    },
    comparison: {
      revenue: { mom: 2.1, yoy: 5.3 },
      totalScore: { mom: 1, yoy: 3 },
      rentRatio: { mom: 0.8, yoy: 1.5 }
    },
    createdAt: '2023-09-15',
    updatedAt: '2026-01-30'
  },
  {
    id: 'M008',
    name: '小龙坎火锅',
    category: '餐饮-火锅',
    floor: 'L3',
    shopNumber: '307',
    area: 420,
    rent: 110000,
    lastMonthRevenue: 580000,
    rentToSalesRatio: 0.190,
    status: 'operating',
    riskLevel: 'low',
    totalScore: 76,
    metrics: {
      collection: 90,
      operational: 75,
      siteQuality: 72,
      customerReview: 78,
      riskResistance: 65
    },
    comparison: {
      revenue: { mom: 4.2, yoy: 10.5 },
      totalScore: { mom: 2, yoy: 6 },
      rentRatio: { mom: -0.5, yoy: -1.2 }
    },
    createdAt: '2023-08-20',
    updatedAt: '2026-01-30'
  },
  {
    id: 'M009',
    name: '瑞幸咖啡',
    category: '餐饮-饮品',
    floor: 'L1',
    shopNumber: '112',
    area: 120,
    rent: 32000,
    lastMonthRevenue: 220000,
    rentToSalesRatio: 0.145,
    status: 'operating',
    riskLevel: 'low',
    totalScore: 79,
    metrics: {
      collection: 95,
      operational: 78,
      siteQuality: 75,
      customerReview: 80,
      riskResistance: 67
    },
    comparison: {
      revenue: { mom: 3.8, yoy: 8.9 },
      totalScore: { mom: 2, yoy: 5 },
      rentRatio: { mom: -0.3, yoy: -0.7 }
    },
    createdAt: '2023-11-05',
    updatedAt: '2026-01-30'
  },
  {
    id: 'M010',
    name: '喜茶',
    category: '餐饮-饮品',
    floor: 'L2',
    shopNumber: '215',
    area: 150,
    rent: 42000,
    lastMonthRevenue: 380000,
    rentToSalesRatio: 0.111,
    status: 'operating',
    riskLevel: 'none',
    totalScore: 90,
    metrics: {
      collection: 100,
      operational: 88,
      siteQuality: 85,
      customerReview: 92,
      riskResistance: 85
    },
    comparison: {
      revenue: { mom: 6.5, yoy: 15.2 },
      totalScore: { mom: 3, yoy: 8 },
      rentRatio: { mom: -0.8, yoy: -1.8 }
    },
    createdAt: '2023-07-12',
    updatedAt: '2026-01-30'
  },
  {
    id: 'M011',
    name: '外婆家',
    category: '餐饮-正餐',
    floor: 'L3',
    shopNumber: '310',
    area: 420,
    rent: 105000,
    lastMonthRevenue: 480000,
    rentToSalesRatio: 0.219,
    status: 'operating',
    riskLevel: 'medium',
    totalScore: 68,
    metrics: {
      collection: 85,
      operational: 68,
      siteQuality: 65,
      customerReview: 70,
      riskResistance: 52
    },
    comparison: {
      revenue: { mom: 1.5, yoy: 3.8 },
      totalScore: { mom: 0, yoy: 2 },
      rentRatio: { mom: 0.5, yoy: 1.2 }
    },
    createdAt: '2024-02-18',
    updatedAt: '2026-01-30'
  },
  {
    id: 'M012',
    name: '西贝莜面村',
    category: '餐饮-正餐',
    floor: 'L4',
    shopNumber: '408',
    area: 500,
    rent: 135000,
    lastMonthRevenue: 720000,
    rentToSalesRatio: 0.188,
    status: 'operating',
    riskLevel: 'low',
    totalScore: 77,
    metrics: {
      collection: 92,
      operational: 75,
      siteQuality: 78,
      customerReview: 80,
      riskResistance: 60
    },
    comparison: {
      revenue: { mom: 5.2, yoy: 12.3 },
      totalScore: { mom: 3, yoy: 7 },
      rentRatio: { mom: -0.6, yoy: -1.4 }
    },
    createdAt: '2023-10-08',
    updatedAt: '2026-01-30'
  },
  {
    id: 'M013',
    name: 'ZARA',
    category: '零售-服饰',
    floor: 'L1',
    shopNumber: '118',
    area: 850,
    rent: 195000,
    lastMonthRevenue: 1100000,
    rentToSalesRatio: 0.177,
    status: 'operating',
    riskLevel: 'low',
    totalScore: 81,
    metrics: {
      collection: 98,
      operational: 82,
      siteQuality: 78,
      customerReview: 80,
      riskResistance: 67
    },
    comparison: {
      revenue: { mom: 4.5, yoy: 10.2 },
      totalScore: { mom: 2, yoy: 5 },
      rentRatio: { mom: -0.4, yoy: -0.9 }
    },
    createdAt: '2023-04-20',
    updatedAt: '2026-01-30'
  },
  {
    id: 'M014',
    name: 'H&M',
    category: '零售-服饰',
    floor: 'L2',
    shopNumber: '208',
    area: 720,
    rent: 168000,
    lastMonthRevenue: 1050000,
    rentToSalesRatio: 0.160,
    status: 'operating',
    riskLevel: 'none',
    totalScore: 87,
    metrics: {
      collection: 100,
      operational: 85,
      siteQuality: 82,
      customerReview: 88,
      riskResistance: 80
    },
    comparison: {
      revenue: { mom: 6.2, yoy: 14.5 },
      totalScore: { mom: 3, yoy: 8 },
      rentRatio: { mom: -0.7, yoy: -1.5 }
    },
    createdAt: '2023-05-15',
    updatedAt: '2026-01-30'
  },
  {
    id: 'M015',
    name: '老凤祥',
    category: '零售-珠宝',
    floor: 'L1',
    shopNumber: '106',
    area: 95,
    rent: 24000,
    lastMonthRevenue: 350000,
    rentToSalesRatio: 0.069,
    status: 'operating',
    riskLevel: 'low',
    totalScore: 84,
    metrics: {
      collection: 100,
      operational: 82,
      siteQuality: 80,
      customerReview: 85,
      riskResistance: 73
    },
    comparison: {
      revenue: { mom: 5.8, yoy: 13.2 },
      totalScore: { mom: 2, yoy: 6 },
      rentRatio: { mom: -0.5, yoy: -1.1 }
    },
    createdAt: '2023-06-22',
    updatedAt: '2026-01-30'
  },
  {
    id: 'M016',
    name: '周生生',
    category: '零售-珠宝',
    floor: 'L1',
    shopNumber: '110',
    area: 105,
    rent: 26000,
    lastMonthRevenue: 410000,
    rentToSalesRatio: 0.063,
    status: 'operating',
    riskLevel: 'none',
    totalScore: 93,
    metrics: {
      collection: 100,
      operational: 92,
      siteQuality: 90,
      customerReview: 95,
      riskResistance: 88
    },
    comparison: {
      revenue: { mom: 7.5, yoy: 16.8 },
      totalScore: { mom: 4, yoy: 9 },
      rentRatio: { mom: -1.0, yoy: -2.2 }
    },
    createdAt: '2023-02-10',
    updatedAt: '2026-01-30'
  },
  {
    id: 'M017',
    name: 'CGV影城',
    category: '主力店-影城',
    floor: 'L5',
    shopNumber: '505',
    area: 2200,
    rent: 260000,
    lastMonthRevenue: 1950000,
    rentToSalesRatio: 0.133,
    status: 'operating',
    riskLevel: 'low',
    totalScore: 80,
    metrics: {
      collection: 95,
      operational: 78,
      siteQuality: 82,
      customerReview: 85,
      riskResistance: 60
    },
    comparison: {
      revenue: { mom: 5.5, yoy: 12.8 },
      totalScore: { mom: 2, yoy: 6 },
      rentRatio: { mom: -0.6, yoy: -1.3 }
    },
    createdAt: '2023-03-18',
    updatedAt: '2026-01-30'
  },
  {
    id: 'M018',
    name: '博纳国际影城',
    category: '主力店-影城',
    floor: 'L4',
    shopNumber: '410',
    area: 2400,
    rent: 288000,
    lastMonthRevenue: 1680000,
    rentToSalesRatio: 0.171,
    status: 'operating',
    riskLevel: 'medium',
    totalScore: 67,
    metrics: {
      collection: 85,
      operational: 65,
      siteQuality: 70,
      customerReview: 68,
      riskResistance: 47
    },
    comparison: {
      revenue: { mom: -1.2, yoy: 2.5 },
      totalScore: { mom: -1, yoy: 1 },
      rentRatio: { mom: 1.2, yoy: 2.8 }
    },
    createdAt: '2024-01-08',
    updatedAt: '2026-01-30'
  }
];

// 获取统计数据
export function getStatistics(merchants: Merchant[]) {
  return {
    totalMerchants: merchants.length,
    criticalRiskCount: merchants.filter(m => m.riskLevel === 'critical').length,
    highRiskCount: merchants.filter(m => m.riskLevel === 'high').length,
    mediumRiskCount: merchants.filter(m => m.riskLevel === 'medium').length,
    lowRiskCount: merchants.filter(m => m.riskLevel === 'low').length,
    noneRiskCount: merchants.filter(m => m.riskLevel === 'none').length,
    averageHealthScore: Math.round(merchants.reduce((sum, m) => sum + m.totalScore, 0) / merchants.length),
    totalRevenue: merchants.reduce((sum, m) => sum + m.lastMonthRevenue, 0),
    averageRentRatio: merchants.reduce((sum, m) => sum + m.rentToSalesRatio, 0) / merchants.length,
    activeTasks: 8,
    completedTasks: 23
  };
}
