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
  riskLevel: 'none' | 'low' | 'medium' | 'high'; // 风险等级: 无风险、低风险、中风险、高风险
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
  riskLevel: 'high' | 'medium' | 'low';
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
}

// 快速评分数据
export interface QuickRating {
  id: string;
  merchantId: string;
  timestamp: string;
  ratings: {
    collection: number;            // 租金缴纳 0-100
    operational: number;           // 经营表现 0-100
    siteQuality: number;           // 现场品质 0-100
    customerReview: number;        // 顾客满意度 0-100
    riskResistance: number;        // 抗风险能力 0-100
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
