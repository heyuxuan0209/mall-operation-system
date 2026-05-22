import {
  Activity,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  MessageSquareWarning,
  RefreshCw,
  Store,
  Target,
  TicketPercent,
  TrendingDown,
  Users,
  Utensils,
} from 'lucide-react';

export type PriorityLevel = 'P0' | 'P1';
export type DiagnosisStatus = '已完成' | '进行中' | '待确认' | '待执行';
export type EvidenceType = '销售数据' | '客流数据' | '活动数据' | '评价数据' | '现场数据' | '商场反馈';
export type TaskStatus = '待确认' | '进行中' | '已完成' | '待验证';
export type TaskRole = '店长' | '前厅' | '后厨' | '运营' | '商场营运' | '招商经理';

export const merchantProfile = {
  name: '望潮港火锅',
  title: '望潮港火锅经营改善计划',
  subtitle: '基于商场续约风险研判生成，帮助门店在 14 天内完成关键经营修复。',
  status: '续约风险改善中',
  leaseDays: 45,
  healthScore: 68,
  riskLevel: '高',
  cycleDays: 14,
  currentDay: 1,
  completedTasks: 2,
  totalTasks: 8,
  aiReminder: '当前问题不仅是销售下滑，还可能影响续约评估。建议优先修复低峰客流、活动核销和服务体验三个问题。',
};

export const statusMetrics = [
  { label: '经营健康分', value: '68', unit: '/100', tone: 'amber', icon: Activity },
  { label: '距离续约', value: '45', unit: '天', tone: 'rose', icon: CalendarClock },
  { label: '改善进度', value: '第 1', unit: '天', tone: 'sky', icon: RefreshCw },
  { label: '任务完成', value: '2', unit: '/8', tone: 'emerald', icon: ClipboardCheck },
];

export const todayPriorities: {
  level: PriorityLevel;
  title: string;
  expectedImpact: string;
  managerConfirm: string;
  mallConcern: string;
}[] = [
  {
    level: 'P0',
    title: '低峰客流连续 2 周下降，今日确认工作日午市套餐',
    expectedImpact: '午市进店人数 7 天内提升 10%-15%',
    managerConfirm: '确认 68 元/98 元双档套餐毛利与出品节奏',
    mallConcern: '低峰修复信号会直接影响续约观察评级',
  },
  {
    level: 'P1',
    title: '活动核销率低于同层餐饮均值，调整券门槛',
    expectedImpact: '减少低质量核销，提升活动客单价 5%',
    managerConfirm: '确认满减门槛从 88 元调整至 128 元',
    mallConcern: '商场关注活动是否继续拉低消费结构',
  },
  {
    level: 'P1',
    title: '服务响应慢影响现场评分，优化高峰排班',
    expectedImpact: '高峰服务响应时长下降至 8 分钟内',
    managerConfirm: '确认前厅晚高峰补 1 名机动岗',
    mallConcern: '现场体验是招商侧本轮重点观察项',
  },
];

export const diagnosisFlow: {
  step: string;
  status: DiagnosisStatus;
  owner: string;
  summary: string;
}[] = [
  { step: '发现问题', status: '已完成', owner: '经营雷达 Agent', summary: '识别低峰客流、活动质量、服务体验三类续约相关风险' },
  { step: '收集证据', status: '已完成', owner: '诊断 Agent', summary: '汇总销售、客流、活动、评价、巡检和招商反馈' },
  { step: '诊断根因', status: '已完成', owner: '服务体验 Agent', summary: '判断不是单一销售下滑，而是低峰吸引力与体验拖拽叠加' },
  { step: '生成改善计划', status: '进行中', owner: '改善计划 Agent', summary: '已生成 14 天改善任务，等待店长确认首日动作' },
  { step: '执行任务', status: '待确认', owner: '执行追踪 Agent', summary: '今日需确认午市套餐、券门槛和高峰排班' },
  { step: '验证结果', status: '待执行', owner: '结果验证 Agent', summary: '第 7 天看领先指标，第 14 天形成续约观察结论' },
  { step: '回流商场评估', status: '待执行', owner: '商场回流 Agent', summary: '把任务完成率和指标变化同步给商场续约研判' },
];

export const evidenceLedger: {
  type: EvidenceType;
  title: string;
  value: string;
  actionHint: string;
  source: string;
  icon: typeof BarChart3;
}[] = [
  { type: '销售数据', title: '人均消费连续下滑', value: '¥138 -> ¥121，下降 12.3%', actionHint: '套餐要提升高毛利菜品占比，不继续单纯降价', source: '商场 POS / 近 30 天', icon: BarChart3 },
  { type: '客流数据', title: '工作日午市低峰走弱', value: '午市进店人数低于同层餐饮均值 18%', actionHint: '优先做午市套餐和店外引导，不先加晚市补贴', source: '客流计数 / 同层对比', icon: Users },
  { type: '活动数据', title: '核销高但质量偏低', value: '券核销率 73%，活动客单价下降 9%', actionHint: '提高券门槛，避免继续吸引只薅券客群', source: '活动系统 / 春季餐饮节', icon: TicketPercent },
  { type: '评价数据', title: '差评集中在等位与服务响应', value: '近 30 天差评关键词：慢、乱、等太久', actionHint: '高峰排班和等位话术要当天调整', source: '大众点评 / 商场客服', icon: MessageSquareWarning },
  { type: '现场数据', title: '高峰动线和出餐节奏不稳', value: '锅底上桌平均 12 分钟，标准 8 分钟', actionHint: '后厨预备量和前厅传菜节点需联动', source: '巡店记录 / 4 月 8 日', icon: Utensils },
  { type: '商场反馈', title: '续约评级从保留降至观察', value: '14 天内改善信号会影响续约谈判节奏', actionHint: '每天记录动作与指标，形成可回流证据', source: '招商经理 / 续约评估', icon: Store },
];

export const improvementTasks: {
  id: string;
  priority: PriorityLevel;
  title: string;
  role: TaskRole;
  owner: string;
  deadline: string;
  expectedImpact: string;
  metric: string;
  status: TaskStatus;
  theme: '低峰客流' | '活动效果' | '服务体验' | '续约沟通';
}[] = [
  { id: 'T01', priority: 'P0', title: '设计 7 天午市引流套餐', role: '店长', owner: '王店长', deadline: '今天 18:00', expectedImpact: '低峰进店人数 +10%-15%', metric: '工作日午市进店人数、套餐毛利率', status: '进行中', theme: '低峰客流' },
  { id: 'T02', priority: 'P1', title: '补充低峰时段店外引导', role: '前厅', owner: '前厅主管', deadline: '明天 11:00', expectedImpact: '路过转化率 +5%', metric: '11:00-13:30 进店转化率', status: '待确认', theme: '低峰客流' },
  { id: 'T03', priority: 'P1', title: '调整商场联名券门槛', role: '运营', owner: '门店运营', deadline: '明天 16:00', expectedImpact: '活动客单价 +5%', metric: '核销客单价、活动毛利率', status: '待确认', theme: '活动效果' },
  { id: 'T04', priority: 'P1', title: '复盘近两次活动套餐组合', role: '运营', owner: '门店运营', deadline: '第 3 天', expectedImpact: '识别低质量流量来源', metric: '活动销售占比、复购率', status: '待确认', theme: '活动效果' },
  { id: 'T05', priority: 'P1', title: '优化高峰服务排班', role: '店长', owner: '王店长', deadline: '今天 21:00', expectedImpact: '服务响应时长降至 8 分钟内', metric: '顾客呼叫响应时长、差评率', status: '进行中', theme: '服务体验' },
  { id: 'T06', priority: 'P1', title: '统计近 30 天差评关键词', role: '前厅', owner: '值班经理', deadline: '第 2 天', expectedImpact: '锁定服务体验整改优先级', metric: '差评关键词出现频次', status: '已完成', theme: '服务体验' },
  { id: 'T07', priority: 'P1', title: '锅底上桌时长专项优化', role: '后厨', owner: '后厨主管', deadline: '第 4 天', expectedImpact: '出餐等待缩短 4 分钟', metric: '锅底上桌平均时长', status: '待确认', theme: '服务体验' },
  { id: 'T08', priority: 'P1', title: '补充续约意向和改善承诺', role: '招商经理', owner: '招商经理李敏', deadline: '第 7 天', expectedImpact: '形成商场侧可采信改善证据', metric: '任务完成率、核心指标变化', status: '待验证', theme: '续约沟通' },
];

export const merchantAgents = [
  { name: '经营雷达 Agent', role: '发现异常和风险', color: '#ef4444', icon: TrendingDown },
  { name: '诊断 Agent', role: '判断问题根因', color: '#2563eb', icon: Target },
  { name: '活动 Agent', role: '分析活动效果', color: '#f59e0b', icon: TicketPercent },
  { name: '服务体验 Agent', role: '分析评价与巡检', color: '#16a34a', icon: MessageSquareWarning },
  { name: '改善计划 Agent', role: '生成行动方案', color: '#7c3aed', icon: ClipboardCheck },
  { name: '执行追踪 Agent', role: '跟踪任务进展', color: '#0891b2', icon: CheckCircle2 },
];

export const feedbackLoop = {
  completedTasks: 2,
  totalTasks: 8,
  metrics: [
    { label: '午市客流', before: '低于均值 18%', current: '执行首日待验证', status: '观察中' },
    { label: '活动客单价', before: '活动期 -9%', current: '券门槛待调整', status: '待动作' },
    { label: '服务响应', before: '高峰超 15 分钟', current: '排班调整中', status: '改善中' },
  ],
  mallRiskChange: '高风险 -> 改善观察中',
  recommendation: '继续保留 14 天观察窗口，暂不进入招商替换预案。',
};
