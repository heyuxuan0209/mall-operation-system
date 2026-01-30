import { Merchant } from '@/types';

/**
 * 统一的商户数据配置
 * 确保整个应用中商户数据的一致性
 */

/**
 * 默认测试商户 - 海底捞火锅
 * 这是系统中唯一的商户数据源，所有地方都应该引用这个配置
 * 与 mockMerchants 中的数据保持一致
 *
 * 风险等级标准：
 * - 极高风险（critical）：0-39分
 * - 高风险（high）：40-59分
 * - 中风险（medium）：60-79分
 * - 低风险（low）：80-89分
 * - 无风险（none）：90-100分
 */
export const DEFAULT_MERCHANT: Merchant = {
  id: 'M001',
  name: '海底捞火锅',
  category: '餐饮-火锅',
  floor: 'L4',
  shopNumber: '401',
  area: 450,
  rent: 132000,
  lastMonthRevenue: 471000, // 修正：确保租售比为28% (132000/471000=0.28)
  rentToSalesRatio: 0.28, // 租售比28%（合理范围）
  status: 'operating',
  riskLevel: 'high',      // 高风险（45分属于40-59区间）
  totalScore: 45,         // 健康度 45 分
  metrics: {
    collection: 60,       // 租金缴纳一般
    operational: 35,      // 经营表现较差
    siteQuality: 50,      // 现场品质一般
    customerReview: 45,   // 顾客满意度偏低
    riskResistance: 35,   // 抗风险能力弱
  },
  createdAt: new Date('2024-01-15').toISOString(),
  updatedAt: new Date('2026-01-20').toISOString(),
};

/**
 * 商户位置
 */
export const DEFAULT_MERCHANT_LOCATION = {
  lat: 31.230416,
  lng: 121.473701,
  address: '上海市黄浦区南京东路',
};

/**
 * 初始化商户数据到 localStorage
 * 如果 localStorage 中没有商户数据，则使用默认配置初始化
 */
export function initializeMerchantData(): Merchant {
  if (typeof window === 'undefined') return DEFAULT_MERCHANT;

  const stored = localStorage.getItem('merchants');

  if (!stored) {
    // 首次使用，初始化数据
    const merchants = [DEFAULT_MERCHANT];
    localStorage.setItem('merchants', JSON.stringify(merchants));
    console.log('✓ 已初始化商户数据:', DEFAULT_MERCHANT.name);
    return DEFAULT_MERCHANT;
  }

  try {
    const merchants: Merchant[] = JSON.parse(stored);
    const merchant = merchants.find(m => m.id === DEFAULT_MERCHANT.id);

    if (merchant) {
      // 使用 localStorage 中的数据（可能已被更新）
      return merchant;
    } else {
      // 如果找不到默认商户，添加它
      merchants.push(DEFAULT_MERCHANT);
      localStorage.setItem('merchants', JSON.stringify(merchants));
      return DEFAULT_MERCHANT;
    }
  } catch (error) {
    console.error('读取商户数据失败，使用默认配置:', error);
    return DEFAULT_MERCHANT;
  }
}

/**
 * 获取商户数据
 * 优先从 localStorage 读取，确保数据是最新的
 */
export function getMerchantData(): Merchant {
  if (typeof window === 'undefined') return DEFAULT_MERCHANT;

  try {
    const stored = localStorage.getItem('merchants');
    if (stored) {
      const merchants: Merchant[] = JSON.parse(stored);
      const merchant = merchants.find(m => m.id === DEFAULT_MERCHANT.id);
      if (merchant) return merchant;
    }
  } catch (error) {
    console.error('获取商户数据失败:', error);
  }

  return DEFAULT_MERCHANT;
}

/**
 * 更新商户数据
 */
export function updateMerchantData(updates: Partial<Merchant>): Merchant {
  if (typeof window === 'undefined') return DEFAULT_MERCHANT;

  try {
    const stored = localStorage.getItem('merchants');
    const merchants: Merchant[] = stored ? JSON.parse(stored) : [DEFAULT_MERCHANT];

    const index = merchants.findIndex(m => m.id === DEFAULT_MERCHANT.id);

    if (index !== -1) {
      merchants[index] = {
        ...merchants[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
    } else {
      merchants.push({ ...DEFAULT_MERCHANT, ...updates });
    }

    localStorage.setItem('merchants', JSON.stringify(merchants));
    return merchants[index !== -1 ? index : merchants.length - 1];
  } catch (error) {
    console.error('更新商户数据失败:', error);
    return DEFAULT_MERCHANT;
  }
}

/**
 * 重置商户数据到初始状态
 */
export function resetMerchantData(): Merchant {
  if (typeof window === 'undefined') return DEFAULT_MERCHANT;

  const merchants = [DEFAULT_MERCHANT];
  localStorage.setItem('merchants', JSON.stringify(merchants));
  console.log('✓ 已重置商户数据');
  return DEFAULT_MERCHANT;
}
