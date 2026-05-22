import { feedbackLoop, improvementTasks, type TaskStatus } from '@/data/merchant-workspace/wangchao-improvement';

export type ImprovementTask = typeof improvementTasks[number];
export type TaskDraft = Record<string, string>;
export type DispatchStatus = 'dispatched' | 'merchant_received' | 'executing' | 'partially_completed' | 'completed' | 'returned';

export type MerchantDispatch = {
  dispatchId: string;
  source: 'mall';
  status: DispatchStatus;
  createdAt: string;
  returnedAt?: string;
  merchantName: string;
  plan: string;
  tasks: ImprovementTask[];
  drafts: TaskDraft;
};

export type ImprovementMetricStatus = {
  label: string;
  before: string;
  current: string;
  status: string;
  target?: string;
  actual?: string;
  verdict?: '达标' | '接近达标' | '未达标' | '待执行';
};

export type ImprovementSummary = {
  status: string;
  completed: number;
  confirmed: number;
  total: number;
  cycle: string;
  riskChange: string;
  renewalAdvice: string;
  recommendation: string;
  items: { label: string; value: string }[];
  metrics: ImprovementMetricStatus[];
  effectVerdict: {
    level: '未回流' | '无可评估结果' | '改善无效' | '部分有效' | '改善有效';
    title: string;
    detail: string;
    nextAction: string;
  };
};

export const MERCHANT_DISPATCH_STORAGE_KEY = 'mall-operation:wangchao-dispatches:v2';
export const LEGACY_MERCHANT_IMPROVEMENT_STORAGE_KEY = 'mall-operation:wangchao-improvement-tasks:v1';

type DispatchStore = {
  currentDispatchId?: string;
  dispatches: MerchantDispatch[];
};

function getInitialDispatchTasks(): ImprovementTask[] {
  return improvementTasks.map(task => ({
    ...task,
    status: '待确认',
  }));
}

function mergeImprovementTasks(saved: ImprovementTask[] | undefined): ImprovementTask[] {
  if (!saved) return getInitialDispatchTasks();
  const savedById = new Map(saved.map(task => [task.id, task]));
  return improvementTasks.map(task => savedById.get(task.id) ?? { ...task, status: '待确认' });
}

function readDispatchStore(): DispatchStore {
  if (typeof window === 'undefined') return { dispatches: [] };

  try {
    const raw = window.localStorage.getItem(MERCHANT_DISPATCH_STORAGE_KEY);
    if (!raw) return { dispatches: [] };

    const parsed = JSON.parse(raw) as DispatchStore;
    return {
      currentDispatchId: parsed.currentDispatchId,
      dispatches: (parsed.dispatches ?? []).map(dispatch => ({
        ...dispatch,
        tasks: mergeImprovementTasks(dispatch.tasks),
        drafts: dispatch.drafts ?? {},
      })),
    };
  } catch (error) {
    console.warn('[MerchantImprovementState] Failed to read dispatch store', error);
    return { dispatches: [] };
  }
}

function writeDispatchStore(store: DispatchStore) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(MERCHANT_DISPATCH_STORAGE_KEY, JSON.stringify(store));
}

export function createMerchantDispatch(): MerchantDispatch {
  const dispatch: MerchantDispatch = {
    dispatchId: `wangchao-${Date.now()}`,
    source: 'mall',
    status: 'dispatched',
    createdAt: new Date().toISOString(),
    merchantName: '望潮港火锅',
    plan: '方案B · 修复＋体验整改',
    tasks: getInitialDispatchTasks(),
    drafts: {},
  };

  const store = readDispatchStore();
  writeDispatchStore({
    currentDispatchId: dispatch.dispatchId,
    dispatches: [dispatch, ...store.dispatches],
  });

  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(LEGACY_MERCHANT_IMPROVEMENT_STORAGE_KEY);
  }

  return dispatch;
}

export function loadCurrentDispatch(dispatchId?: string | null): MerchantDispatch | null {
  const store = readDispatchStore();
  const targetId = dispatchId ?? store.currentDispatchId;
  if (!targetId) return null;
  return store.dispatches.find(dispatch => dispatch.dispatchId === targetId) ?? null;
}

export function saveMerchantDispatch(dispatch: MerchantDispatch) {
  const store = readDispatchStore();
  const exists = store.dispatches.some(item => item.dispatchId === dispatch.dispatchId);
  const dispatches = exists
    ? store.dispatches.map(item => item.dispatchId === dispatch.dispatchId ? dispatch : item)
    : [dispatch, ...store.dispatches];

  writeDispatchStore({
    currentDispatchId: dispatch.dispatchId,
    dispatches,
  });
}

export function markMerchantReceived(dispatch: MerchantDispatch): MerchantDispatch {
  if (dispatch.status !== 'dispatched') return dispatch;
  return { ...dispatch, status: 'merchant_received' };
}

export function updateDispatchTaskStatus(dispatch: MerchantDispatch, taskId: string, status: TaskStatus): MerchantDispatch {
  const tasks = dispatch.tasks.map(task => task.id === taskId ? { ...task, status } : task);
  const completed = tasks.filter(task => isTaskCompleted(task.status)).length;
  const confirmed = tasks.filter(task => task.status !== '待确认').length;

  const nextStatus: DispatchStatus = completed === tasks.length
    ? 'completed'
    : completed > 0
      ? 'partially_completed'
      : confirmed > 0
        ? 'executing'
        : dispatch.status === 'dispatched'
          ? 'merchant_received'
          : dispatch.status;

  return { ...dispatch, tasks, status: nextStatus };
}

export function updateDispatchDraft(dispatch: MerchantDispatch, taskId: string, value: string): MerchantDispatch {
  return {
    ...dispatch,
    drafts: { ...dispatch.drafts, [taskId]: value },
  };
}

export function returnDispatchToMall(dispatch: MerchantDispatch): MerchantDispatch {
  return {
    ...dispatch,
    status: 'returned',
    returnedAt: new Date().toISOString(),
  };
}

export function clearMerchantDispatches() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(MERCHANT_DISPATCH_STORAGE_KEY);
  window.localStorage.removeItem(LEGACY_MERCHANT_IMPROVEMENT_STORAGE_KEY);
}

export function isTaskCompleted(status: TaskStatus) {
  return status === '已完成' || status === '待验证';
}

export function getImprovementSummary(tasks: ImprovementTask[], dispatch?: MerchantDispatch | null): ImprovementSummary {
  const completed = tasks.filter(task => isTaskCompleted(task.status)).length;
  const confirmed = tasks.filter(task => task.status !== '待确认').length;
  const total = tasks.length;
  const serviceTaskDone = tasks.some(task => task.theme === '服务体验' && isTaskCompleted(task.status));
  const activityTaskStarted = tasks.some(task => task.theme === '活动效果' && task.status !== '待确认');
  const activityTaskDone = tasks.some(task => task.theme === '活动效果' && isTaskCompleted(task.status));
  const lunchTaskDone = tasks.some(task => task.theme === '低峰客流' && isTaskCompleted(task.status));
  const effectiveMetricCount = [lunchTaskDone, activityTaskDone, serviceTaskDone].filter(Boolean).length;

  const riskChange = !dispatch
    ? '高风险 -> 待下发改善'
    : completed >= 4
      ? '高风险 -> 改善观察中'
      : completed >= 2
        ? '高风险 -> 初步改善中'
        : '高风险 -> 待改善信号';

  const recommendation = !dispatch
    ? '尚未下发门店改善任务，请先完成商场研判并下发给商家执行。'
    : completed >= 4
      ? '继续续约谈判观察，等待第 14 天验证指标。'
      : completed >= 2
        ? '继续保留 14 天观察窗口，优先补齐活动和服务动作。'
        : '暂不调整续约判断，等待店长确认关键任务。';

  const renewalAdvice = !dispatch
    ? '待下发'
    : completed >= 4
      ? '继续谈判观察'
      : completed >= 2
        ? '继续观察'
        : '等待改善信号';

  const metrics: ImprovementMetricStatus[] = feedbackLoop.metrics.map(metric => {
    if (metric.label === '午市客流') {
      return {
        ...metric,
        target: '+10%',
        actual: lunchTaskDone ? '+8%' : '--',
        current: lunchTaskDone ? '午市套餐已执行，当前客流 +8%' : '午市套餐待完成',
        status: lunchTaskDone ? '接近达标' : '待动作',
        verdict: lunchTaskDone ? '接近达标' : '待执行',
      };
    }
    if (metric.label === '活动客单价') {
      return {
        ...metric,
        target: '+5%',
        actual: activityTaskDone ? '+3%' : activityTaskStarted ? '调整中' : '--',
        current: activityTaskDone ? '券门槛已调整，活动客单价 +3%' : activityTaskStarted ? '券门槛已进入调整流程' : '券门槛待调整',
        status: activityTaskDone ? '继续观察' : activityTaskStarted ? '观察中' : '待动作',
        verdict: activityTaskDone ? '接近达标' : activityTaskStarted ? '待执行' : '待执行',
      };
    }
    if (metric.label === '服务响应') {
      return {
        ...metric,
        target: '8 分钟内',
        actual: serviceTaskDone ? '9 分钟' : '--',
        current: serviceTaskDone ? '服务类动作已完成，响应时长约 9 分钟' : '排班调整中',
        status: serviceTaskDone ? '未完全达标' : '改善中',
        verdict: serviceTaskDone ? '未达标' : '待执行',
      };
    }
    return metric;
  });

  const effectVerdict: ImprovementSummary['effectVerdict'] = !dispatch
    ? {
        level: '未回流',
        title: '尚未形成门店回流结果',
        detail: '商场端还没有下发本轮改善任务，无法判断改善是否有效。',
        nextAction: '先完成商场研判，并下发给商家执行。',
      }
    : completed === 0
      ? {
          level: '无可评估结果',
          title: '暂无可评估改善结果',
          detail: '商家尚未完成关键任务，当前只能继续等待执行结果。',
          nextAction: '至少完成 1 项关键任务后再回流评估。',
        }
      : effectiveMetricCount >= 2
        ? {
            level: '部分有效',
            title: '改善部分有效，建议继续观察 7 天',
            detail: '午市客流和活动质量已出现改善信号，但服务响应仍未完全达标。',
            nextAction: '保留续约观察窗口，要求门店继续补齐服务体验动作。',
          }
        : effectiveMetricCount === 1
          ? {
              level: '部分有效',
              title: '出现单点改善，暂不下调风险',
              detail: '已有一个关键指标出现改善，但不足以支撑续约风险下调。',
              nextAction: '继续推进剩余关键任务，7 天后复核。',
            }
          : {
              level: '改善无效',
              title: '尚未看到有效改善',
              detail: '已完成任务未覆盖关键指标，暂不能证明经营修复有效。',
              nextAction: '调整改善计划或准备招商替换预案。',
            };

  return {
    status: !dispatch ? '尚未下发改善计划' : confirmed > 0 ? '商家已接收改善计划' : '等待商家接收改善计划',
    completed,
    confirmed,
    total,
    cycle: !dispatch ? '未下发' : confirmed > 0 ? '14 天观察中' : '待商家确认',
    riskChange,
    renewalAdvice,
    recommendation,
    metrics,
    effectVerdict,
    items: [
      { label: '午市套餐', value: lunchTaskDone ? '已执行' : confirmed > 0 ? '店长确认中' : '待确认' },
      { label: '券门槛调整', value: activityTaskStarted ? '调整中' : '待运营确认' },
      { label: '高峰排班', value: serviceTaskDone ? '已完成' : confirmed > 0 ? '执行中' : '待确认' },
    ],
  };
}
