// 按业态定义需要录入的字段
export const OPERATIONAL_FIELDS_BY_CATEGORY: Record<string, string[]> = {
  '餐饮-火锅': ['general', 'restaurant', 'customer', 'staff', 'competition', 'location'],
  '餐饮-饮品': ['general', 'restaurant', 'customer', 'staff', 'competition'],
  '餐饮-正餐': ['general', 'restaurant', 'customer', 'staff', 'competition', 'location'],
  '餐饮-快餐': ['general', 'restaurant', 'customer', 'staff', 'competition', 'location'],
  '零售-服饰': ['general', 'retail', 'customer', 'staff', 'competition', 'location'],
  '零售-珠宝': ['general', 'retail', 'customer', 'staff', 'competition'],
  '零售-化妆品': ['general', 'retail', 'customer', 'staff', 'competition'],
  '主力店-影城': ['general', 'customer', 'staff', 'competition'],
  '主力店-超市': ['general', 'retail', 'customer', 'staff', 'competition'],
};

// 字段中文标签
export const FIELD_LABELS: Record<string, string> = {
  // 通用数据
  'dailyFootfall': '日均客流',
  'peakHourFootfall': '高峰期客流',
  'conversionRate': '进店转化率',

  // 餐饮专属
  'restaurant.tableCount': '餐桌数',
  'restaurant.seatingCapacity': '座位数',
  'restaurant.turnoverRate': '翻台率',
  'restaurant.avgWaitTime': '平均等位时长',
  'restaurant.avgMealDuration': '平均用餐时长',
  'restaurant.errorOrderRate': '错漏单率',
  'restaurant.avgCheckSize': '客单价',

  // 零售专属
  'retail.dailySales': '日均销售额',
  'retail.avgTransactionValue': '客单价',
  'retail.inventoryTurnover': '库存周转率',
  'retail.returnRate': '退货率',

  // 顾客数据
  'customer.npsScore': 'NPS净推荐值',
  'customer.repeatCustomerRate': '复购率',
  'customer.newCustomerRatio': '新客占比',
  'customer.avgCustomerLifetime': '客户生命周期',

  // 员工数据
  'staff.totalCount': '总人数',
  'staff.fullTimeCount': '全职人数',
  'staff.partTimeCount': '兼职人数',
  'staff.turnoverRate': '员工流失率',
  'staff.avgTenure': '平均工龄',

  // 竞争环境
  'competition.nearbyCompetitors': '3km内竞品数量',
  'competition.marketShare': '市场份额',
  'competition.competitivePosition': '竞争定位',

  // 位置数据
  'location.floor': '楼层',
  'location.zoneType': '区域类型',
  'location.adjacentToAnchor': '是否毗邻主力店',
  'location.visibilityRating': '可见度评级',
};

// 字段单位
export const FIELD_UNITS: Record<string, string> = {
  'dailyFootfall': '人次',
  'peakHourFootfall': '人次',
  'conversionRate': '%',
  'restaurant.tableCount': '张',
  'restaurant.seatingCapacity': '个',
  'restaurant.turnoverRate': '次/天',
  'restaurant.avgWaitTime': '分钟',
  'restaurant.avgMealDuration': '分钟',
  'restaurant.errorOrderRate': '%',
  'restaurant.avgCheckSize': '元',
  'retail.dailySales': '元',
  'retail.avgTransactionValue': '元',
  'retail.inventoryTurnover': '次/月',
  'retail.returnRate': '%',
  'customer.npsScore': '分',
  'customer.repeatCustomerRate': '%',
  'customer.newCustomerRatio': '%',
  'customer.avgCustomerLifetime': '月',
  'staff.totalCount': '人',
  'staff.fullTimeCount': '人',
  'staff.partTimeCount': '人',
  'staff.turnoverRate': '%/年',
  'staff.avgTenure': '月',
  'competition.nearbyCompetitors': '家',
  'competition.marketShare': '%',
  'location.visibilityRating': '分',
};

// 字段提示信息
export const FIELD_TOOLTIPS: Record<string, string> = {
  'dailyFootfall': '统计最近30天的平均客流',
  'peakHourFootfall': '高峰时段（如午餐或晚餐时间）的客流量',
  'conversionRate': '进店客流中实际消费的比例',
  'restaurant.turnoverRate': '每天每张桌子平均接待的批次数',
  'restaurant.errorOrderRate': '订单错误、遗漏的比例',
  'retail.inventoryTurnover': '每月库存周转的次数',
  'customer.npsScore': '净推荐值，范围-100到100',
  'customer.repeatCustomerRate': '回头客占总客户的比例',
  'staff.turnoverRate': '年度员工离职率',
  'competition.nearbyCompetitors': '3公里范围内同类竞品门店数',
  'location.visibilityRating': '1-5分，5分表示位置最显眼',
};

// 数据来源选项
export const DATA_SOURCE_OPTIONS = [
  { value: 'inspection', label: '现场巡检' },
  { value: 'pos', label: 'POS系统' },
  { value: 'manual', label: '手动录入' },
  { value: 'third_party', label: '第三方数据' },
];

// 竞争定位选项
export const COMPETITIVE_POSITION_OPTIONS = [
  { value: '领先', label: '领先' },
  { value: '持平', label: '持平' },
  { value: '落后', label: '落后' },
];

// 区域类型选项
export const ZONE_TYPE_OPTIONS = [
  { value: '主动线', label: '主动线' },
  { value: '次动线', label: '次动线' },
  { value: '末端', label: '末端' },
  { value: '核心区', label: '核心区' },
];

// 根据业态获取需要显示的字段组
export function getFieldGroupsByCategory(category: string): string[] {
  return OPERATIONAL_FIELDS_BY_CATEGORY[category] || ['general'];
}

// 检查字段是否应该显示
export function shouldShowField(category: string, fieldGroup: string): boolean {
  const groups = getFieldGroupsByCategory(category);
  return groups.includes(fieldGroup);
}
