/**
 * Boundary Checker - AI助手边界检查器
 *
 * 功能：检查用户请求是否超出AI助手职责范围
 * - 拦截数据修改请求
 * - 拦截批量操作请求
 * - 拦截敏感信息访问请求
 * - 提供友好的替代建议
 */

import { UserIntent } from '@/types/ai-assistant';

export class BoundaryChecker {
  /**
   * 检查请求是否超出职责范围
   */
  checkBoundary(userInput: string, intent?: UserIntent): {
    allowed: boolean;
    reason?: string;
    suggestedAction?: string;
  } {
    // 规则1：数据修改请求
    if (this.isModificationRequest(userInput)) {
      return {
        allowed: false,
        reason: '我无法直接修改数据',
        suggestedAction: '请前往商户管理页面进行修改，或联系管理员'
      };
    }

    // 规则2：批量操作请求
    if (this.isBatchOperation(userInput)) {
      return {
        allowed: false,
        reason: '批量操作需要人工审核',
        suggestedAction: '请明确具体商户和操作内容'
      };
    }

    // 规则3：敏感信息访问
    if (this.isSensitiveDataRequest(userInput)) {
      return {
        allowed: false,
        reason: '该信息涉及商户隐私',
        suggestedAction: '请联系商户运营经理获取授权'
      };
    }

    // 规则4：系统管理操作
    if (this.isSystemAdminRequest(userInput)) {
      return {
        allowed: false,
        reason: '系统管理操作需要管理员权限',
        suggestedAction: '请联系系统管理员处理'
      };
    }

    return { allowed: true };
  }

  /**
   * 检测是否为数据修改请求
   */
  private isModificationRequest(input: string): boolean {
    const keywords = ['修改', '删除', '更新', '设置', '调整为', '改成', '改为'];
    return keywords.some(kw => input.includes(kw));
  }

  /**
   * 检测是否为批量操作
   */
  private isBatchOperation(input: string): boolean {
    const keywords = ['所有', '全部', '批量', '一键'];
    return keywords.some(kw => input.includes(kw));
  }

  /**
   * 检测是否为敏感信息访问
   */
  private isSensitiveDataRequest(input: string): boolean {
    const keywords = ['银行', '账号', '密码', '身份证', '合同', '协议'];
    return keywords.some(kw => input.includes(kw));
  }

  /**
   * 检测是否为系统管理请求
   */
  private isSystemAdminRequest(input: string): boolean {
    const keywords = ['配置', '权限', '用户管理', '系统设置', '数据库'];
    return keywords.some(kw => input.includes(kw));
  }

  /**
   * 检查是否为不确定性请求（需要人工介入）
   */
  checkUncertainty(query: string, confidence: number): {
    needsHumanIntervention: boolean;
    reason?: string;
  } {
    // 置信度过低
    if (confidence < 0.5) {
      return {
        needsHumanIntervention: true,
        reason: '查询意图不明确，建议重新表述或咨询运营团队'
      };
    }

    // 涉及预测未来
    const predictionKeywords = ['预测', '未来', '明年', '下个月会', '趋势会'];
    if (predictionKeywords.some(kw => query.includes(kw))) {
      return {
        needsHumanIntervention: true,
        reason: '系统无法预测未来，建议基于历史数据分析趋势'
      };
    }

    // 涉及法律、财务专业意见
    const professionalKeywords = ['法律', '合规', '税务', '财务建议', '投资'];
    if (professionalKeywords.some(kw => query.includes(kw))) {
      return {
        needsHumanIntervention: true,
        reason: '此类问题需要专业人士意见，建议咨询法务/财务部门'
      };
    }

    return { needsHumanIntervention: false };
  }
}

// 导出单例实例
export const boundaryChecker = new BoundaryChecker();
