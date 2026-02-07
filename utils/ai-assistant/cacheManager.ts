/**
 * LRU 缓存管理器
 * 用于缓存LLM响应和Skills结果，提升性能
 */

import { CacheEntry } from '@/types/ai-assistant';

export class CacheManager {
  private cache: Map<string, CacheEntry>;
  private readonly MAX_SIZE: number;
  private readonly DEFAULT_TTL: number; // 毫秒

  constructor(maxSize: number = 100, defaultTTL: number = 30 * 60 * 1000) {
    this.cache = new Map();
    this.MAX_SIZE = maxSize;
    this.DEFAULT_TTL = defaultTTL;
  }

  /**
   * 获取缓存值
   */
  get<T = any>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // 检查是否过期
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    // 更新命中次数
    entry.hits++;

    // LRU: 将访问的项移到最后
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.value as T;
  }

  /**
   * 设置缓存值
   */
  set<T = any>(key: string, value: T, ttl?: number): void {
    // 如果缓存已满，删除最久未使用的项（第一个）
    if (this.cache.size >= this.MAX_SIZE) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    const entry: CacheEntry<T> = {
      key,
      value,
      timestamp: Date.now(),
      ttl: ttl || this.DEFAULT_TTL,
      hits: 0,
    };

    this.cache.set(key, entry);
  }

  /**
   * 检查缓存是否存在且有效
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * 删除缓存
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * 获取所有缓存键
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * 清理过期缓存
   */
  cleanup(): number {
    const now = Date.now();
    let removed = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        removed++;
      }
    }

    return removed;
  }

  /**
   * 获取缓存统计信息
   */
  getStats() {
    const entries = Array.from(this.cache.values());
    const now = Date.now();

    const validEntries = entries.filter(
      (entry) => now - entry.timestamp <= entry.ttl
    );

    const totalHits = validEntries.reduce((sum, entry) => sum + entry.hits, 0);
    const averageAge = validEntries.length > 0
      ? validEntries.reduce((sum, entry) => sum + (now - entry.timestamp), 0) / validEntries.length
      : 0;

    return {
      size: this.cache.size,
      validEntries: validEntries.length,
      expiredEntries: entries.length - validEntries.length,
      totalHits,
      averageHits: validEntries.length > 0 ? totalHits / validEntries.length : 0,
      averageAge: Math.round(averageAge / 1000), // 转换为秒
      hitRate: totalHits > 0 ? totalHits / (totalHits + validEntries.length) : 0,
    };
  }

  /**
   * 生成缓存键
   */
  static generateKey(...parts: (string | number | boolean | undefined)[]): string {
    return parts
      .filter((part) => part !== undefined && part !== null)
      .map((part) => String(part))
      .join(':');
  }

  /**
   * 持久化缓存到 localStorage（可选）
   */
  persist(storageKey: string = 'ai_assistant_cache'): void {
    try {
      const data = {
        entries: Array.from(this.cache.entries()),
        timestamp: Date.now(),
      };
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to persist cache:', error);
    }
  }

  /**
   * 从 localStorage 恢复缓存（可选）
   */
  restore(storageKey: string = 'ai_assistant_cache'): void {
    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return;

      const data = JSON.parse(stored);
      const now = Date.now();

      // 只恢复未过期的缓存
      for (const [key, entry] of data.entries) {
        if (now - entry.timestamp <= entry.ttl) {
          this.cache.set(key, entry);
        }
      }
    } catch (error) {
      console.error('Failed to restore cache:', error);
    }
  }
}

// 导出单例实例
export const cacheManager = new CacheManager();

// 定期清理过期缓存（每5分钟）
if (typeof window !== 'undefined') {
  setInterval(() => {
    const removed = cacheManager.cleanup();
    if (removed > 0) {
      console.log(`[CacheManager] Cleaned up ${removed} expired entries`);
    }
  }, 5 * 60 * 1000);
}
