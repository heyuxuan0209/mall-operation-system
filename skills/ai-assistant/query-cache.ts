/**
 * 查询缓存模块
 * 用于缓存意图识别结果，减少重复计算和LLM调用
 */

import type { IntentResult } from '@/types/ai-assistant';

interface CachedResult {
  result: IntentResult;
  timestamp: number;
}

export class QueryCache {
  private cache = new Map<string, CachedResult>();
  private ttl = 3600000; // 1小时 TTL
  private maxSize = 1000; // 最大缓存条目数

  /**
   * 获取缓存结果
   */
  get(query: string): IntentResult | null {
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

    console.log('[QueryCache] Cache hit:', normalized);
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
      timestamp: Date.now()
    });

    console.log('[QueryCache] Cached result for:', normalized);
  }

  /**
   * 标准化查询文本
   * 移除空格、标点，转小写
   */
  private normalize(query: string): string {
    return query
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '')
      .replace(/[，。！？；：""''（）【】《》]/g, '');
  }

  /**
   * 删除最旧的缓存条目
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
      console.log('[QueryCache] Evicted oldest entry:', oldestKey);
    }
  }

  /**
   * 清理过期缓存
   */
  cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.ttl) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`[QueryCache] Cleaned up ${cleanedCount} expired entries`);
    }
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear();
    console.log('[QueryCache] Cache cleared');
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): {
    size: number;
    maxSize: number;
    ttl: number;
  } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      ttl: this.ttl
    };
  }

  /**
   * 预热缓存（启动时调用）
   */
  async warmup(commonQueries: string[], classifier: any): Promise<void> {
    console.log('[QueryCache] Warming up cache with common queries...');

    for (const query of commonQueries) {
      try {
        // 这里需要实际的分类器实例
        // 暂时跳过，在集成时实现
        console.log('[QueryCache] Would warmup:', query);
      } catch (error) {
        console.error('[QueryCache] Warmup failed for:', query, error);
      }
    }
  }
}

/**
 * 导出单例
 */
export const queryCache = new QueryCache();

/**
 * 定期清理过期缓存（每10分钟）
 */
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    queryCache.cleanup();
  }, 600000); // 10分钟
}
