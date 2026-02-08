import { Merchant } from '@/types';
import { mockMerchants } from '@/data/merchants/mock-data';

/**
 * 商户数据管理器
 * 统一管理所有页面的商户数据，确保数据一致性
 */
class MerchantDataManager {
  private static instance: MerchantDataManager;
  private readonly STORAGE_KEY = 'merchants';

  private constructor() {}

  static getInstance(): MerchantDataManager {
    if (!MerchantDataManager.instance) {
      MerchantDataManager.instance = new MerchantDataManager();
    }
    return MerchantDataManager.instance;
  }

  /**
   * 获取所有商户数据
   * 优先从 localStorage 读取，如果没有则使用 mockMerchants 初始化
   */
  getAllMerchants(): Merchant[] {
    if (typeof window === 'undefined') {
      return mockMerchants;
    }

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);

      if (stored) {
        const merchants: Merchant[] = JSON.parse(stored);

        // 合并 localStorage 和 mockMerchants
        // 如果 localStorage 中有对应 ID 的商户，使用 localStorage 的数据（最新）
        // 否则使用 mockMerchants 的数据（默认）
        return mockMerchants.map(mockMerchant => {
          const storedMerchant = merchants.find(m => m.id === mockMerchant.id);
          return storedMerchant || mockMerchant;
        });
      } else {
        // 首次访问，初始化为 mockMerchants
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(mockMerchants));
        return mockMerchants;
      }
    } catch (error) {
      console.error('读取商户数据失败:', error);
      return mockMerchants;
    }
  }

  /**
   * 获取单个商户数据
   */
  getMerchant(merchantId: string): Merchant | null {
    const merchants = this.getAllMerchants();
    return merchants.find(m => m.id === merchantId) || null;
  }

  /**
   * ⭐v3.0新增：根据商户名称查找商户
   */
  findMerchantByName(merchantName: string): Merchant | null {
    const merchants = this.getAllMerchants();
    // 精确匹配
    let merchant = merchants.find(m => m.name === merchantName);
    if (merchant) return merchant;

    // 模糊匹配（包含）
    merchant = merchants.find(m => m.name.includes(merchantName) || merchantName.includes(m.name));
    if (merchant) return merchant;

    return null;
  }

  /**
   * 更新商户数据
   */
  updateMerchant(merchantId: string, updates: Partial<Merchant>): Merchant | null {
    if (typeof window === 'undefined') return null;

    try {
      const merchants = this.getAllMerchants();
      const index = merchants.findIndex(m => m.id === merchantId);

      if (index !== -1) {
        merchants[index] = {
          ...merchants[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        };

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(merchants));

        // 触发存储事件，通知其他标签页更新
        window.dispatchEvent(new Event('merchant-data-updated'));

        return merchants[index];
      }

      return null;
    } catch (error) {
      console.error('更新商户数据失败:', error);
      return null;
    }
  }

  /**
   * 重置所有商户数据到初始状态
   */
  resetAllMerchants(): void {
    if (typeof window === 'undefined') return;

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(mockMerchants));
    window.dispatchEvent(new Event('merchant-data-updated'));
    console.log('✓ 所有商户数据已重置');
  }

  /**
   * 监听商户数据变化
   */
  onMerchantsChange(callback: (merchants: Merchant[]) => void): () => void {
    if (typeof window === 'undefined') return () => {};

    const handler = () => {
      callback(this.getAllMerchants());
    };

    window.addEventListener('merchant-data-updated', handler);
    window.addEventListener('storage', handler);

    // 返回清理函数
    return () => {
      window.removeEventListener('merchant-data-updated', handler);
      window.removeEventListener('storage', handler);
    };
  }
}

export const merchantDataManager = MerchantDataManager.getInstance();
