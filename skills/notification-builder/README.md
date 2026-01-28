# Notification Builder

## 功能概述

通知构建器是一个纯业务逻辑技能模块，为任务管理系统提供通知相关的智能功能。它能够自动检查任务截止日期、生成提醒通知，并构建各种类型的通知对象。

## 核心功能

- **截止日期检查**: 自动检查任务截止日期，生成提前提醒和逾期警告
- **通知构建**: 构建标准化的通知对象（任务分配、状态变更、完成、升级等）
- **重复避免**: 智能避免重复发送相同的通知
- **优先级判断**: 根据紧急程度自动设置通知优先级

## 使用场景

1. **定时任务**: 定期扫描所有任务，生成截止日期提醒
2. **任务分配**: 创建新任务时生成分配通知
3. **状态跟踪**: 任务阶段变更时生成状态通知
4. **逾期管理**: 自动检测并通知逾期任务

## API文档

### 1. checkTaskDeadlines()

检查任务截止日期并生成通知

**参数**:
- `tasks` (Task[]): 任务列表
- `settings` (NotificationSettings): 通知设置
- `existingNotifications` (AppNotification[], 可选): 已存在的通知列表，用于避免重复
- `now` (Date, 可选): 当前时间，默认为当前日期

**返回值**: `AppNotification[]` - 生成的通知列表

**逻辑**:
1. 检查通知功能是否启用
2. 遍历所有未完成的任务
3. 计算任务距离截止日期的天数
4. 根据配置的提醒天数生成提醒通知
5. 检测逾期任务并生成警告通知
6. 避免重复发送相同的通知

**示例**:
```typescript
import { checkTaskDeadlines } from '@/skills/notification-builder';

const settings = {
  enabled: true,
  deadlineReminders: {
    enabled: true,
    days: [3, 1, 0] // 提前3天、1天、当天提醒
  },
  overdueAlerts: true
};

const existingNotifications = [/* 已存在的通知 */];
const newNotifications = checkTaskDeadlines(
  tasks,
  settings,
  existingNotifications
);

console.log(`生成了 ${newNotifications.length} 条新通知`);
```

---

### 2. createTaskAssignedNotification()

创建任务分配通知

**参数**:
- `task` (Task): 任务对象
- `assignedBy` (string, 可选): 分配人，默认'系统'

**返回值**: `AppNotification` - 任务分配通知对象

**示例**:
```typescript
import { createTaskAssignedNotification } from '@/skills/notification-builder';

const notification = createTaskAssignedNotification(task, '张经理');

console.log(notification);
// {
//   id: 'assigned_task123_1234567890',
//   type: 'task_assigned',
//   title: '【新任务】XX商户',
//   message: '您有一个新的帮扶任务：提升客流',
//   priority: 'high',
//   ...
// }
```

---

### 3. createTaskStatusChangeNotification()

创建任务状态变更通知

**参数**:
- `task` (Task): 任务对象
- `oldStage` (string): 旧的阶段标识
- `newStage` (string): 新的阶段标识

**返回值**: `AppNotification` - 状态变更通知对象

**阶段映射**:
- `planning` → 措施制定
- `executing` → 执行中
- `evaluating` → 效果评估
- `completed` → 已完成
- `escalated` → 已升级
- `exit` → 已退出

**示例**:
```typescript
import { createTaskStatusChangeNotification } from '@/skills/notification-builder';

const notification = createTaskStatusChangeNotification(
  task,
  'planning',
  'executing'
);

console.log(notification.message);
// '任务阶段从"措施制定"变更为"执行中"'
```

---

### 4. createTaskCompletedNotification()

创建任务完成通知

**参数**:
- `task` (Task): 任务对象

**返回值**: `AppNotification` - 任务完成通知对象

**示例**:
```typescript
import { createTaskCompletedNotification } from '@/skills/notification-builder';

const notification = createTaskCompletedNotification(task);

console.log(notification);
// {
//   type: 'task_status_change',
//   title: '【任务完成】XX商户',
//   message: '恭喜！任务"提升客流"已成功完成',
//   priority: 'low',
//   ...
// }
```

---

### 5. createTaskEscalatedNotification()

创建任务升级通知

**参数**:
- `task` (Task): 任务对象
- `reason` (string): 升级原因

**返回值**: `AppNotification` - 任务升级通知对象

**示例**:
```typescript
import { createTaskEscalatedNotification } from '@/skills/notification-builder';

const notification = createTaskEscalatedNotification(
  task,
  '持续3个月未改善，需要区域经理介入'
);

console.log(notification);
// {
//   type: 'task_status_change',
//   title: '【任务升级】XX商户',
//   message: '任务已升级处理。原因：持续3个月未改善，需要区域经理介入',
//   priority: 'urgent',
//   ...
// }
```

## 完整使用示例

### 示例1: 定时检查截止日期

```typescript
import { checkTaskDeadlines } from '@/skills/notification-builder';
import { notificationService } from '@/utils/notificationService';

// 每天定时执行
function dailyDeadlineCheck() {
  // 1. 获取配置
  const settings = notificationService.getSettings();

  // 2. 获取所有任务
  const tasks = getAllTasks();

  // 3. 获取已存在的通知（避免重复）
  const existingNotifications = notificationService.getNotifications();

  // 4. 检查截止日期
  const newNotifications = checkTaskDeadlines(
    tasks,
    settings,
    existingNotifications
  );

  // 5. 保存新通知
  newNotifications.forEach(notification => {
    notificationService.saveNotification(notification);

    // 如果启用了浏览器通知，发送桌面通知
    if (settings.browserNotifications) {
      notificationService.sendBrowserNotification(notification);
    }
  });

  console.log(`检查完成，生成 ${newNotifications.length} 条新通知`);
}
```

### 示例2: 任务生命周期通知

```typescript
import {
  createTaskAssignedNotification,
  createTaskStatusChangeNotification,
  createTaskCompletedNotification,
} from '@/skills/notification-builder';

class TaskManager {
  // 创建新任务
  createTask(task: Task) {
    // ... 保存任务逻辑

    // 生成分配通知
    const notification = createTaskAssignedNotification(task);
    notificationService.saveNotification(notification);
  }

  // 更新任务阶段
  updateTaskStage(taskId: string, newStage: string) {
    const task = this.getTask(taskId);
    const oldStage = task.stage;

    // ... 更新任务逻辑

    // 生成状态变更通知
    const notification = createTaskStatusChangeNotification(
      task,
      oldStage,
      newStage
    );
    notificationService.saveNotification(notification);
  }

  // 完成任务
  completeTask(taskId: string) {
    const task = this.getTask(taskId);

    // ... 完成任务逻辑

    // 生成完成通知
    const notification = createTaskCompletedNotification(task);
    notificationService.saveNotification(notification);
  }
}
```

### 示例3: 智能通知过滤

```typescript
import { checkTaskDeadlines } from '@/skills/notification-builder';

function smartNotificationFilter(tasks: Task[], settings: NotificationSettings) {
  const existingNotifications = notificationService.getNotifications();

  // 检查截止日期
  const deadlineNotifications = checkTaskDeadlines(
    tasks,
    settings,
    existingNotifications
  );

  // 按优先级分组
  const urgent = deadlineNotifications.filter(n => n.priority === 'urgent');
  const high = deadlineNotifications.filter(n => n.priority === 'high');
  const medium = deadlineNotifications.filter(n => n.priority === 'medium');
  const low = deadlineNotifications.filter(n => n.priority === 'low');

  // 仅发送高优先级的浏览器通知
  [...urgent, ...high].forEach(notification => {
    if (settings.browserNotifications) {
      notificationService.sendBrowserNotification(notification);
    }
  });

  // 所有通知都保存到系统
  deadlineNotifications.forEach(notification => {
    notificationService.saveNotification(notification);
  });
}
```

## 通知优先级规则

| 通知类型 | 优先级 | 说明 |
|---------|--------|------|
| 逾期警告 | urgent | 任务已逾期，需立即处理 |
| 今天到期 | high | 任务今天到期，紧急 |
| 新任务分配 | high | 有新任务需要关注 |
| 明天到期 | medium | 任务明天到期，需注意 |
| 状态变更 | medium | 任务阶段发生变化 |
| 提前3天+ | low | 提前提醒，优先级较低 |
| 任务完成 | low | 任务已完成，无需紧急处理 |

## 算法说明

### 截止日期计算

```typescript
const deadline = new Date(task.deadline);
const now = new Date();
const diffTime = deadline.getTime() - now.getTime();
const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

// diffDays > 0: 未到期
// diffDays === 0: 今天到期
// diffDays < 0: 已逾期
```

### 重复避免机制

每个通知都有唯一ID：
- 截止日期提醒: `deadline_{taskId}_{天数}`
- 逾期警告: `overdue_{taskId}_{逾期天数}`
- 任务分配: `assigned_{taskId}_{时间戳}`
- 状态变更: `status_{taskId}_{时间戳}`

在生成新通知前，检查是否已存在相同ID的通知。

## 注意事项

1. **纯函数设计**: 所有函数均为纯函数，无副作用
2. **时区处理**: 使用本地时区计算日期差异
3. **重复检查**: 必须传入existingNotifications避免重复
4. **配置优先**: 所有功能受NotificationSettings控制
5. **ID唯一性**: 通知ID必须保持唯一性规则

## 最佳实践

### 1. 定期检查

```typescript
// 推荐：每小时检查一次
setInterval(dailyDeadlineCheck, 60 * 60 * 1000);

// 避免：检查太频繁导致性能问题
setInterval(dailyDeadlineCheck, 1000); // ❌
```

### 2. 批量处理

```typescript
// 推荐：批量保存通知
const notifications = checkTaskDeadlines(tasks, settings);
notificationService.saveNotifications(notifications);

// 避免：逐个保存导致多次localStorage写入
notifications.forEach(n => notificationService.saveNotification(n));
```

### 3. 错误处理

```typescript
try {
  const notifications = checkTaskDeadlines(tasks, settings);
  notificationService.saveNotifications(notifications);
} catch (error) {
  console.error('通知生成失败:', error);
  // 记录错误但不影响主流程
}
```

## 版本历史

- **v1.0** (2026-01-28): 从 `utils/notificationService.ts` 提取，作为独立skill模块
- 支持截止日期检查和逾期警告
- 支持多种通知类型构建
- 完整的重复避免机制

---

**作者**: Claude Sonnet 4.5
**创建日期**: 2026-01-28
**状态**: ✅ 已完成
