import { InspectionPolicy } from '@/types';

/**
 * 巡检策略服务
 * 职责：
 * - 管理不同风险等级的巡检频率要求
 * - 初始化默认策略（极高风险每日1次，高风险每周2次等）
 * - 提供策略CRUD操作
 */
class InspectionPolicyService {
  private readonly STORAGE_KEY = 'inspection_policies';

  /**
   * 获取所有策略
   */
  getAllPolicies(): InspectionPolicy[] {
    if (typeof window === 'undefined') return [];

    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) {
      this.initializeDefaultPolicies();
      return this.getAllPolicies();
    }

    return JSON.parse(stored);
  }

  /**
   * 根据风险等级获取策略
   */
  getPolicyByRiskLevel(riskLevel: InspectionPolicy['riskLevel']): InspectionPolicy | null {
    const policies = this.getAllPolicies();
    return policies.find(p => p.riskLevel === riskLevel) || null;
  }

  /**
   * 更新策略
   */
  updatePolicy(id: string, updates: Partial<InspectionPolicy>): boolean {
    if (typeof window === 'undefined') return false;

    const policies = this.getAllPolicies();
    const index = policies.findIndex(p => p.id === id);

    if (index === -1) return false;

    policies[index] = {
      ...policies[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(policies));
    return true;
  }

  /**
   * 初始化默认策略
   */
  private initializeDefaultPolicies(): void {
    if (typeof window === 'undefined') return;

    const now = new Date().toISOString();
    const defaultPolicies: InspectionPolicy[] = [
      {
        id: 'policy_critical',
        riskLevel: 'critical',
        requiredFrequency: {
          interval: 'daily',
          count: 1  // 每日1次
        },
        priority: 'urgent',
        enabled: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'policy_high',
        riskLevel: 'high',
        requiredFrequency: {
          interval: 'weekly',
          count: 2  // 每周2次
        },
        priority: 'high',
        enabled: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'policy_medium',
        riskLevel: 'medium',
        requiredFrequency: {
          interval: 'weekly',
          count: 1  // 每周1次
        },
        priority: 'normal',
        enabled: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'policy_low',
        riskLevel: 'low',
        requiredFrequency: {
          interval: 'monthly',
          count: 1  // 每月1次
        },
        priority: 'low',
        enabled: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'policy_none',
        riskLevel: 'none',
        requiredFrequency: {
          interval: 'monthly',
          count: 1  // 每月1次
        },
        priority: 'low',
        enabled: false,  // 默认禁用
        createdAt: now,
        updatedAt: now
      }
    ];

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(defaultPolicies));
  }
}

// 导出单例
export const inspectionPolicyService = new InspectionPolicyService();
