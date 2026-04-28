/**
 * 拍照AI分析器
 * Sprint 2: 巡检中AI实时辅助
 *
 * 当前版本：模拟AI分析（基于规则）
 * 未来升级：集成TensorFlow.js或云端图像识别API
 */

import { PhotoAttachment } from '@/types';

/**
 * AI检测到的问题
 */
export interface AIDetectedIssue {
  category: '人' | '货' | '场';
  issue: string;
  severity: 'critical' | 'warning' | 'normal';
  confidence: number; // 0-100%
  suggestion: string;
}

/**
 * 合规性检查结果
 */
export interface ComplianceCheck {
  hasFireExtinguisher: boolean;
  hasEmergencyExit: boolean;
  hasCertificates: boolean;
  issues: string[];
}

/**
 * 照片AI分析结果
 */
export interface PhotoAIAnalysis {
  autoDetectedIssues: AIDetectedIssue[];
  complianceCheck: ComplianceCheck;
  qualityScore: number; // 0-100，基于图像清晰度、光线、构图
  recommendations: string[];
}

/**
 * 分析照片（主入口）
 *
 * @param imageData Base64编码的图像数据
 * @param category 照片分类（人/货/场）
 * @param existingDescription 用户已输入的描述
 * @returns AI分析结果
 */
export async function analyzePhoto(
  imageData: string,
  category: 'people' | 'merchandise' | 'place',
  existingDescription?: string
): Promise<PhotoAIAnalysis> {
  // 模拟AI分析延迟
  await new Promise(resolve => setTimeout(resolve, 800));

  // 1. 图像质量检测
  const qualityScore = analyzeImageQuality(imageData);

  // 2. 基于分类的智能分析
  const detectedIssues = analyzeByCategoryMock(category, existingDescription);

  // 3. 合规性检查（模拟）
  const complianceCheck = performComplianceCheck(category);

  // 4. 生成建议
  const recommendations = generateRecommendations(detectedIssues, qualityScore);

  return {
    autoDetectedIssues: detectedIssues,
    complianceCheck,
    qualityScore,
    recommendations,
  };
}

/**
 * 分析图像质量
 * 简化版本：基于图像大小估算
 * 真实版本：分析清晰度、光线、构图等
 */
function analyzeImageQuality(imageData: string): number {
  try {
    // 基于Base64长度估算图像质量
    const sizeKB = (imageData.length * 3) / 4 / 1024;

    // 理想大小：100-500KB
    if (sizeKB >= 100 && sizeKB <= 500) {
      return 90 + Math.random() * 10; // 90-100分
    } else if (sizeKB >= 50 && sizeKB < 100) {
      return 75 + Math.random() * 15; // 75-90分
    } else if (sizeKB < 50) {
      return 50 + Math.random() * 25; // 50-75分（可能太模糊）
    } else {
      return 60 + Math.random() * 20; // 60-80分（可能过大）
    }
  } catch (error) {
    return 70; // 默认中等质量
  }
}

/**
 * 基于分类的模拟AI分析
 * 真实版本：使用TensorFlow.js或云端API进行物体检测
 */
function analyzeByCategoryMock(
  category: 'people' | 'merchandise' | 'place',
  description?: string
): AIDetectedIssue[] {
  const issues: AIDetectedIssue[] = [];

  // 根据分类和描述关键词进行模拟分析
  const lowerDesc = (description || '').toLowerCase();

  switch (category) {
    case 'people':
      // 人员相关分析
      if (lowerDesc.includes('不在岗') || lowerDesc.includes('缺岗')) {
        issues.push({
          category: '人',
          issue: '检测到员工缺岗问题',
          severity: 'critical',
          confidence: 85,
          suggestion: '立即联系店长，确认员工到岗情况',
        });
      }
      if (lowerDesc.includes('玩手机') || lowerDesc.includes('态度差')) {
        issues.push({
          category: '人',
          issue: '员工服务状态不佳',
          severity: 'warning',
          confidence: 78,
          suggestion: '建议进行员工服务培训',
        });
      }
      if (lowerDesc.includes('制服') || lowerDesc.includes('工装')) {
        if (lowerDesc.includes('不整齐') || lowerDesc.includes('未穿')) {
          issues.push({
            category: '人',
            issue: '员工着装不规范',
            severity: 'warning',
            confidence: 82,
            suggestion: '提醒员工按规定着装',
          });
        }
      }
      break;

    case 'merchandise':
      // 货品相关分析
      if (lowerDesc.includes('混乱') || lowerDesc.includes('杂乱') || lowerDesc.includes('乱')) {
        issues.push({
          category: '货',
          issue: '货品陈列混乱',
          severity: 'warning',
          confidence: 80,
          suggestion: '建议商户按品类重新整理陈列',
        });
      }
      if (lowerDesc.includes('缺货') || lowerDesc.includes('空置')) {
        issues.push({
          category: '货',
          issue: '货架存在缺货情况',
          severity: 'warning',
          confidence: 75,
          suggestion: '提醒商户及时补货',
        });
      }
      if (lowerDesc.includes('过期') || lowerDesc.includes('破损')) {
        issues.push({
          category: '货',
          issue: '检测到问题商品',
          severity: 'critical',
          confidence: 90,
          suggestion: '立即要求商户下架处理',
        });
      }
      if (lowerDesc.includes('标签') && lowerDesc.includes('无')) {
        issues.push({
          category: '货',
          issue: '商品标签不全',
          severity: 'warning',
          confidence: 72,
          suggestion: '要求商户补充价格标签',
        });
      }
      break;

    case 'place':
      // 场地相关分析
      if (lowerDesc.includes('垃圾') || lowerDesc.includes('脏')) {
        issues.push({
          category: '场',
          issue: '地面/环境卫生问题',
          severity: 'warning',
          confidence: 85,
          suggestion: '建议立即清理，检查清洁流程',
        });
      }
      if (lowerDesc.includes('破损') || lowerDesc.includes('损坏')) {
        issues.push({
          category: '场',
          issue: '设施设备损坏',
          severity: 'warning',
          confidence: 80,
          suggestion: '提交设施维修工单',
        });
      }
      if (lowerDesc.includes('积水') || lowerDesc.includes('漏水')) {
        issues.push({
          category: '场',
          issue: '检测到积水/漏水隐患',
          severity: 'critical',
          confidence: 88,
          suggestion: '立即处理，避免安全事故',
        });
      }
      if (lowerDesc.includes('消防') && (lowerDesc.includes('堵') || lowerDesc.includes('占'))) {
        issues.push({
          category: '场',
          issue: '消防通道被占用',
          severity: 'critical',
          confidence: 92,
          suggestion: '立即清理消防通道，确保安全',
        });
      }
      break;
  }

  // 如果没有检测到问题，给出正面反馈
  if (issues.length === 0 && description && description.length > 5) {
    issues.push({
      category: category === 'people' ? '人' : category === 'merchandise' ? '货' : '场',
      issue: '未检测到明显问题',
      severity: 'normal',
      confidence: 70,
      suggestion: '继续保持良好状态',
    });
  }

  return issues;
}

/**
 * 合规性检查（模拟版本）
 * 真实版本：使用目标检测模型识别消防器材、证照等
 */
function performComplianceCheck(category: string): ComplianceCheck {
  const check: ComplianceCheck = {
    hasFireExtinguisher: false,
    hasEmergencyExit: false,
    hasCertificates: false,
    issues: [],
  };

  // 仅对场地类照片进行合规检查
  if (category !== 'place') {
    return check;
  }

  // 模拟检测（随机）
  // 真实版本：实际检测图像中的物体
  const random = Math.random();

  if (random > 0.3) {
    check.hasFireExtinguisher = true;
  } else {
    check.issues.push('未检测到消防器材，请确认是否在拍摄范围内');
  }

  if (random > 0.4) {
    check.hasEmergencyExit = true;
  } else {
    check.issues.push('未检测到安全出口标识');
  }

  if (random > 0.5) {
    check.hasCertificates = true;
  } else {
    check.issues.push('未检测到营业证照，请确认是否上墙展示');
  }

  return check;
}

/**
 * 生成改进建议
 */
function generateRecommendations(
  issues: AIDetectedIssue[],
  qualityScore: number
): string[] {
  const recommendations: string[] = [];

  // 基于问题数量
  const criticalCount = issues.filter(i => i.severity === 'critical').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;

  if (criticalCount > 0) {
    recommendations.push(`发现${criticalCount}个严重问题，建议立即处理`);
  }

  if (warningCount > 2) {
    recommendations.push('发现多个待改善问题，建议创建帮扶任务跟进');
  }

  // 基于图像质量
  if (qualityScore < 70) {
    recommendations.push('照片清晰度不佳，建议重新拍摄以便更好地记录现场');
  }

  if (qualityScore >= 90 && issues.length === 0) {
    recommendations.push('拍摄质量优秀，现场状况良好');
  }

  // 通用建议
  if (issues.length > 0) {
    recommendations.push('建议在评分时重点关注发现的问题维度');
  }

  if (recommendations.length === 0) {
    recommendations.push('继续完成其他巡检项目');
  }

  return recommendations;
}

/**
 * 批量分析多张照片
 */
export async function analyzeMultiplePhotos(
  photos: Array<{ data: string; category: 'people' | 'merchandise' | 'place'; description?: string }>
): Promise<{
  totalIssues: number;
  criticalIssues: number;
  warningIssues: number;
  avgQualityScore: number;
  allIssues: AIDetectedIssue[];
}> {
  const analyses = await Promise.all(
    photos.map(photo => analyzePhoto(photo.data, photo.category, photo.description))
  );

  const allIssues = analyses.flatMap(a => a.autoDetectedIssues);
  const criticalIssues = allIssues.filter(i => i.severity === 'critical').length;
  const warningIssues = allIssues.filter(i => i.severity === 'warning').length;
  const avgQualityScore = analyses.reduce((sum, a) => sum + a.qualityScore, 0) / analyses.length;

  return {
    totalIssues: allIssues.length,
    criticalIssues,
    warningIssues,
    avgQualityScore,
    allIssues,
  };
}

/**
 * 根据AI分析自动推荐issueLevel
 */
export function recommendIssueLevel(analysis: PhotoAIAnalysis): 'good' | 'normal' | 'warning' | 'critical' {
  const criticalCount = analysis.autoDetectedIssues.filter(i => i.severity === 'critical').length;
  const warningCount = analysis.autoDetectedIssues.filter(i => i.severity === 'warning').length;

  if (criticalCount > 0) {
    return 'critical';
  } else if (warningCount > 1) {
    return 'warning';
  } else if (warningCount === 1) {
    return 'normal';
  } else if (analysis.qualityScore >= 85) {
    return 'good';
  } else {
    return 'normal';
  }
}

/**
 * 根据AI分析自动生成标签
 */
export function generateAutoTags(analysis: PhotoAIAnalysis, category: string): string[] {
  const tags: string[] = [];

  analysis.autoDetectedIssues.forEach(issue => {
    if (issue.severity === 'critical') {
      tags.push('严重问题');
    } else if (issue.severity === 'warning') {
      tags.push('需改善');
    }
  });

  if (analysis.qualityScore >= 90) {
    tags.push('优质');
  }

  if (category === 'place') {
    if (analysis.complianceCheck.hasFireExtinguisher) {
      tags.push('消防合规');
    }
    if (!analysis.complianceCheck.hasFireExtinguisher || !analysis.complianceCheck.hasEmergencyExit) {
      tags.push('需核查');
    }
  }

  return tags.slice(0, 3); // 最多3个标签
}
