// 商户数据类型
export interface Merchant {
  id: string;
  name: string;
  category: string; // 业态分类：餐饮-火锅、零售-服饰等
  floor: string;
  shopNumber: string;
  area: number; // 面积(㎡)
  rent: number; // 月租金
  lastMonthRevenue: number; // 上月营收
  rentToSalesRatio: number; // 租售比
  status: 'operating' | 'closed' | 'renovating'; // 经营状态
  riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'none'; // 风险等级: 极高风险、高风险、中风险、低风险、无风险
  totalScore: number; // 健康度总评分 0-100
  metrics: {
    collection: number; // 租金缴纳进度 0-100
    operational: number; // 经营表现 0-100
    siteQuality: number; // 店铺现场品质 0-100
    customerReview: number; // 顾客满意度 0-100
    riskResistance: number; // 财务抗风险能力 0-100
  };
  // 同比环比数据
  comparison?: {
    revenue: {
      mom: number; // 环比（Month over Month）
      yoy: number; // 同比（Year over Year）
    };
    totalScore: {
      mom: number;
      yoy: number;
    };
    rentRatio: {
      mom: number;
      yoy: number;
    };
  };
  createdAt: string;
  updatedAt: string;
}

// 帮扶案例类型
export interface Case {
  id: string;
  industry: string; // 业态
  tags: string[]; // 标签
  symptoms: string; // 症状
  diagnosis: string; // 诊断
  strategy: string; // 策略
  action: string; // 具体措施
  result?: string; // 效果
}

// 任务日志类型
export interface TaskLog {
  id: string;
  date: string;
  action: string;
  type: 'manual' | 'strategy_adopted';
  user: string;
}

// 任务里程碑类型
export interface TaskMilestone {
  id: string;
  name: string;
  dueDate: string;
  completed: boolean;
  completedAt?: string;
  description: string;
}

// 帮扶任务类型
export interface Task {
  id: string;
  merchantId: string;
  merchantName: string;
  title: string;
  description: string;
  measures: string[]; // 帮扶措施
  assignee: string; // 负责人
  assignedTo: string; // 责任人（含职位）
  assignedLevel: 'assistant' | 'manager' | 'city_company' | 'vp'; // 责任人级别
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  stage: 'planning' | 'executing' | 'evaluating' | 'completed' | 'escalated' | 'exit'; // 工作流阶段
  priority: 'low' | 'medium' | 'high' | 'urgent';
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  createdAt: string;
  updatedAt: string;
  startDate: string;
  deadline: string;
  milestones?: TaskMilestone[]; // 里程碑
  beforeMetrics?: Merchant['metrics'];
  initialMetrics?: Merchant['metrics']; // 帮扶前指标
  afterMetrics?: Merchant['metrics'];
  improvement?: number; // 改善率%
  logs?: TaskLog[]; // 执行记录
  evaluationResult?: 'met' | 'not_met'; // 评估结果
  collectionStatus?: 'normal' | 'owed'; // 收缴状态
}

// 风险预警类型
export interface RiskAlert {
  id: string;
  merchantId: string;
  merchantName: string;
  riskType: 'rent_overdue' | 'low_revenue' | 'high_rent_ratio' | 'customer_complaint';
  severity: 'none' | 'low' | 'medium' | 'high';
  message: string;
  createdAt: string;
  resolved: boolean;
}

// 统计数据类型
export interface Statistics {
  totalMerchants: number;
  healthyCount: number;
  warningCount: number;
  criticalCount: number;
  averageHealthScore: number;
  totalRevenue: number;
  averageRentRatio: number;
  activeTasks: number;
  completedTasks: number;
}

// 通知类型
export interface AppNotification {
  id: string;
  type: 'task_deadline' | 'task_assigned' | 'task_status_change' | 'task_overdue';
  title: string;
  message: string;
  taskId: string;
  merchantName: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  createdAt: string;
  scheduledFor?: string; // 定时通知时间
}

// 通知设置类型
export interface NotificationSettings {
  enabled: boolean;
  browserNotifications: boolean;
  deadlineReminders: {
    enabled: boolean;
    days: number[]; // [3, 1, 0] 表示提前3天、1天、当天提醒
  };
  taskAssignment: boolean;
  statusChanges: boolean;
  overdueAlerts: boolean;
}

// 团队成员类型
export interface TeamMember {
  id: string;
  name: string;
  role: 'assistant' | 'manager';
  avatar?: string;
  status: 'online' | 'offline' | 'busy';
  email?: string;
  phone?: string;
  createdAt: string;
}

// 团队类型
export interface Team {
  id: string;
  name: string;
  members: TeamMember[];
  leaderId: string; // 团队负责人ID
  createdAt: string;
}

// 任务转派记录类型
export interface TaskTransfer {
  id: string;
  fromUserId: string;
  toUserId: string;
  reason: string;
  transferredAt: string;
}

// ==================== 现场巡店相关类型 ====================

// 媒体附件类型
export interface MediaAttachment {
  id: string;
  type: 'image' | 'audio';
  data: string;                    // Base64编码数据
  thumbnail?: string;              // 缩略图（仅图片）
  size: number;                    // 字节大小
  mimeType: string;                // MIME类型
  createdAt: string;
  duration?: number;               // 音频时长（秒）
  geolocation?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
}

// Phase 3: 语音笔记扩展类型
export interface VoiceNote extends MediaAttachment {
  interviewType: 'businessPain' | 'improvementNeeds' | 'riskAssessment' | 'freeNote';
  transcript?: string;             // 转录文本
  keywords?: string[];             // 关键词提取（未来扩展）
  sentiment?: 'positive' | 'neutral' | 'negative';  // 情感分析（未来扩展）
}

// Phase 3: 拍照分类标注扩展类型
export interface PhotoAttachment extends MediaAttachment {
  category: 'people' | 'merchandise' | 'place'; // 人/货/场
  tags: string[];                  // 预设标签
  description?: string;            // 文字描述
  issueLevel?: 'good' | 'normal' | 'warning' | 'critical'; // 问题等级
}

// 签到数据类型
export interface CheckInData {
  id: string;
  merchantId: string;
  merchantName: string;
  userId: string;
  userName: string;
  timestamp: string;
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
    address?: string;              // 可选：反向地理编码地址
  };
  distance?: number;               // 与商户位置的距离（米）
  merchantProfile?: MerchantProfile; // Phase 2: 商户画像（签到后自动获取）
}

// 快速评分数据
export interface QuickRating {
  id: string;
  merchantId: string;
  timestamp: string;
  ratings: {
    // Phase 3: 新的5个维度
    staffCondition: number;        // 员工状态 0-100
    merchandiseDisplay: number;    // 货品陈列 0-100
    storeEnvironment: number;      // 卖场环境 0-100
    managementCapability: number;  // 店长管理能力 0-100
    safetyCompliance: number;      // 安全合规 0-100
  };
  dimensionNotes?: {               // 各维度备注（可选）
    [key: string]: string;
  };
  notes?: string;
  photos?: string[];               // MediaAttachment IDs
}

// 巡店记录类型
export interface InspectionRecord {
  id: string;
  merchantId: string;
  merchantName: string;
  taskId?: string;                 // 关联任务（可选）
  inspectorId: string;
  inspectorName: string;
  checkIn: CheckInData;
  rating?: QuickRating;
  photos: MediaAttachment[];
  audioNotes: MediaAttachment[];
  textNotes: string;
  issues: string[];                // 发现的问题列表
  createdAt: string;
  updatedAt: string;
}

// ==================== Phase 2: 签到智能化相关类型 ====================

// 商户画像类型
export interface MerchantProfile {
  healthScore: number;             // 健康度得分 0-100
  riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'none'; // 风险等级
  alerts: string[];                // 预警标签列表
  weakestDimension: string;        // 最薄弱维度
  focusPoints: string[];           // 核心观察点
  checklistType: 'opening' | 'closing' | 'routine'; // 检查类型
  checklist: ChecklistItem[];      // 检查清单
}

// 检查清单项类型
export interface ChecklistItem {
  id: string;
  label: string;                   // 检查项名称
  checked: boolean;                // 是否已勾选
  category?: string;               // 分类（可选）
}

// ==================== Sprint 1: 管理驾驶舱相关类型 ====================

// 巡检策略 - 定义不同风险等级的巡检频率
export interface InspectionPolicy {
  id: string;
  riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'none';
  requiredFrequency: {
    interval: 'daily' | 'weekly' | 'monthly';
    count: number;  // 如每周2次
  };
  priority: 'urgent' | 'high' | 'normal' | 'low';
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

// 巡检统计结果
export interface InspectionStats {
  period: 'today' | 'week' | 'month';
  periodLabel: string;
  totalMerchants: number;
  requiredInspections: number;
  completedInspections: number;
  completionRate: number;
  overdueCount: number;
  byRiskLevel: Array<{
    riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'none';
    totalMerchants: number;
    inspectedMerchants: number;
    coverageRate: number;
    requiredByPolicy: number;
  }>;
  byInspector: Array<{
    inspectorId: string;
    inspectorName: string;
    assignedMerchants: number;
    completedInspections: number;
    completionRate: number;
    avgPhotosPerInspection: number;
    avgRating: number;
    qualityScore: number;  // 质量评分 = 平均评分*0.5 + 平均照片数*5
  }>;
}

// 超期商户
export interface OverdueMerchant {
  merchant: Merchant;
  lastInspectionDate: string | null;
  overdueDays: number;
  requiredFrequency: InspectionPolicy['requiredFrequency'];
  priority: InspectionPolicy['priority'];
}

// 巡检趋势数据
export interface InspectionTrendData {
  date: string;
  requiredCount: number;
  completedCount: number;
  completionRate: number;
}

// ==================== 商户历史帮扶档案相关类型 ====================

// 商户历史快照 - 记录特定时间点商户的完整状态
export interface MerchantSnapshot {
  id: string;
  merchantId: string;
  merchantName: string;
  timestamp: string;                // 快照时间

  // 商户状态数据
  totalScore: number;               // 健康度总评分 0-100
  riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'none';
  metrics: {
    collection: number;             // 租金缴纳进度 0-100
    operational: number;            // 经营表现 0-100
    siteQuality: number;            // 店铺现场品质 0-100
    customerReview: number;         // 顾客满意度 0-100
    riskResistance: number;         // 财务抗风险能力 0-100
  };

  // 财务数据
  revenue: number;                  // 营收
  rentToSalesRatio: number;         // 租售比

  // 触发原因
  trigger: {
    type: 'inspection' | 'task_created' | 'task_completed' | 'manual' | 'risk_change';
    sourceId?: string;              // 关联的巡检ID或任务ID
    description?: string;           // 触发描述
  };

  // 关联数据
  inspectionId?: string;            // 关联的巡检记录ID
  taskId?: string;                  // 关联的帮扶任务ID

  createdAt: string;
}

// 风险等级变更记录 - 追踪风险等级变化轨迹
export interface RiskLevelChange {
  id: string;
  merchantId: string;
  merchantName: string;
  timestamp: string;

  // 风险等级变化
  fromLevel: 'critical' | 'high' | 'medium' | 'low' | 'none';
  toLevel: 'critical' | 'high' | 'medium' | 'low' | 'none';
  changeType: 'upgrade' | 'downgrade' | 'stable'; // 升级/降级/稳定

  // 评分变化
  fromScore: number;
  toScore: number;
  scoreDelta: number;               // 评分变化量

  // 触发原因
  trigger: {
    type: 'inspection' | 'task_created' | 'task_completed' | 'manual' | 'risk_change' | 'auto_detect';
    sourceId?: string;
    description?: string;
  };

  // 关联数据
  snapshotId: string;               // 关联的快照ID
  taskId?: string;
  inspectionId?: string;

  createdAt: string;
}

// 帮扶档案摘要 - 商户历史帮扶的统计和分析
export interface AssistanceArchive {
  merchantId: string;
  merchantName: string;

  // 统计数据
  stats: {
    totalSnapshots: number;         // 总快照数
    riskChangeCount: number;        // 风险等级变更次数
    improvementCount: number;       // 改善次数（风险等级下降）
    deteriorationCount: number;     // 恶化次数（风险等级上升）
    assistanceTaskCount: number;    // 帮扶任务总数
    completedTaskCount: number;     // 已完成任务数
    successRate: number;            // 帮扶成功率 (改善次数/完成任务数)
  };

  // 健康度趋势
  healthTrend: {
    highest: { score: number; date: string };     // 最高分
    lowest: { score: number; date: string };      // 最低分
    average: number;                              // 平均分
    current: number;                              // 当前分
    recent30DaysTrend: 'improving' | 'declining' | 'stable'; // 近30天趋势
  };

  // 风险等级分布
  riskDistribution: {
    critical: { count: number; totalDays: number }; // 停留次数和天数
    high: { count: number; totalDays: number };
    medium: { count: number; totalDays: number };
    low: { count: number; totalDays: number };
    none: { count: number; totalDays: number };
  };

  // 当前状态
  currentStatus: {
    riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'none';
    totalScore: number;
    daysInCurrentLevel: number;     // 在当前风险等级停留天数
    lastChangeDate?: string;        // 上次风险等级变化日期
  };

  // 关键时间节点
  keyDates: {
    firstRecordDate: string;        // 首次记录日期
    lastInspectionDate?: string;    // 最后巡检日期
    lastTaskCompletedDate?: string; // 最后任务完成日期
    longestHighRiskPeriod?: {       // 最长高风险期
      startDate: string;
      endDate: string;
      days: number;
    };
  };

  generatedAt: string;              // 生成时间
}

// 历史趋势数据点 - 用于图表展示
export interface HistoryTrendPoint {
  date: string;                     // 日期
  totalScore: number;               // 健康度总分
  riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'none';

  // 5维度得分
  metrics: {
    collection: number;
    operational: number;
    siteQuality: number;
    customerReview: number;
    riskResistance: number;
  };

  // 标记特殊事件
  events?: Array<{
    type: 'inspection' | 'task_start' | 'task_complete' | 'risk_change';
    label: string;
    id?: string;                    // 关联的巡检/任务ID
  }>;

  // 数据来源
  snapshotId?: string;              // 关联的快照ID
}
