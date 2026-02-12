/**
 * 查询缓存 - Phase 1 优化
 * 🔥 修复：移除自动清理定时器，改为按需清理，避免服务端502错误
 */

import { IntentResult } from '@/types/ai-assistant';

interface CachedResult {
  result: IntentResult;
  timestamp: number;
  hits: number;
}

export class QueryCache {
  private cache = new Map<string, CachedResult>();
  private readonly ttl = 3600000; // 1小时
  private readonly maxSize = 1000;
  private lastCleanup = Date.now();
  private readonly cleanupInterval = 300000; // 5分钟检查一次

  /**
   * 获取缓存结果
   */
  get(query: string): IntentResult | null {
    // 按需清理：每次get时检查是否需要清理
    this.cleanupIfNeeded();

    const normalized = this.normalize(query);
    const cached = this.cache.get(normalized);

    if (!cached) {
      return null;
    }

    // 检查是否过期
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(normalized);
      return null;
    }

    // 增加命中次数
    cached.hits++;
    return cached.result;
  }

  /**
   * 设置缓存
   */
  set(query: string, result: IntentResult): void {
    const normalized = this.normalize(query);

    // 如果缓存已满，删除最旧的条目
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(normalized, {
      result,
      timestamp: Date.now(),
      hits: 0,
    });
  }

  /**
   * 按需清理：只在需要时执行
   */
  private cleanupIfNeeded(): void {
    const now = Date.now();

    // 如果距离上次清理超过5分钟，执行清理
    if (now - this.lastCleanup > this.cleanupInterval) {
      this.cleanup();
      this.lastCleanup = now;
    }
  }

  /**
   * 清理过期缓存
   */
  private cleanup(): void {
    const now = Date.now();
    const toDelete: string[] = [];

    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.ttl) {
        toDelete.push(key);
      }
    }

    toDelete.forEach(key => this.cache.delete(key));

    if (toDelete.length > 0) {
      console.log(`[QueryCache] Cleaned up ${toDelete.length} expired entries`);
    }
  }

  /**
   * 驱逐最旧的条目
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, value] of this.cache.entries()) {
      if (value.timestamp < oldestTime) {
        oldestTime = value.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * 标准化查询文本
   */
  private normalize(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '')
      .replace(/[，。！？；：""''（）【】《》]/g, '');
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 获取缓存统计
   */
  getStats() {
    const now = Date.now();
    let totalHits = 0;
    let validEntries = 0;

    for (const value of this.cache.values()) {
      if (now - value.timestamp <= this.ttl) {
        validEntries++;
        totalHits += value.hits;
      }
    }

    return {
      size: this.cache.size,
      validEntries,
      totalHits,
      hitRate: validEntries > 0 ? totalHits / validEntries : 0,
    };
  }
}

// 导出单例
export const queryCache = new QueryCache();
