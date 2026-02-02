# React State Update Best Practices
# React状态更新最佳实践

**Priority: P0**
**Use Cases: React组件开发、状态管理、性能优化**

## 问题背景

在React应用中，连续的多次`setState`调用可能导致：
1. **状态更新冲突**：后一次更新可能覆盖前一次更新
2. **UI不响应**：组件没有正确重新渲染
3. **数据不一致**：状态与UI显示不同步

### 典型错误示例

```typescript
// ❌ 错误：连续两次setState调用
const handleApplyTemplate = (template: any) => {
  // 第一次更新
  updateTask({
    measures: allMeasures,
    workflowTemplate: template.id
  });

  // 第二次更新 - 可能覆盖第一次更新！
  updateTask({
    logs: updatedLogs
  });
};
```

**问题原因**：
- React的状态更新是异步的
- 多次连续调用可能被批处理（batching）
- 后一次调用可能基于旧的状态值

---

## 解决方案

### 1. 原子性更新（Atomic Update）✅

**最佳实践**：将所有相关的状态更新合并为单次调用

```typescript
// ✅ 正确：单次原子性更新
const handleApplyTemplate = (template: any) => {
  const templateMeasures = template.suggestedMeasures || [];
  const currentMeasures = selectedTask.measures || [];

  // 合并措施
  const allMeasures = [...currentMeasures];
  templateMeasures.forEach((measure: string) => {
    if (!allMeasures.includes(measure)) {
      allMeasures.push(measure);
    }
  });

  // 生成日志
  const newLog = {
    id: `l-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    action: `应用流程模板：${template.name}`,
    type: 'manual',
    user: selectedTask.assignedTo?.split(' ')[0] || '运营经理'
  };
  const updatedLogs = [...(selectedTask.logs || []), newLog];

  // 一次性更新所有字段
  updateTask({
    measures: allMeasures,
    workflowTemplate: template.id,
    logs: updatedLogs
  });
};
```

**优点**：
- ✅ 保证数据一致性
- ✅ 避免状态冲突
- ✅ 减少重新渲染次数
- ✅ 提升性能

---

### 2. 函数式更新（Functional Update）

当新状态依赖于旧状态时，使用函数式更新：

```typescript
// ✅ 正确：函数式更新
const addMeasure = (newMeasure: string) => {
  setTask(prevTask => ({
    ...prevTask,
    measures: [...(prevTask.measures || []), newMeasure]
  }));
};

// ❌ 错误：直接使用当前状态
const addMeasure = (newMeasure: string) => {
  setTask({
    ...task,
    measures: [...(task.measures || []), newMeasure]
  });
};
```

---

### 3. 使用useReducer管理复杂状态

对于复杂的状态逻辑，使用`useReducer`：

```typescript
type TaskAction =
  | { type: 'ADD_MEASURE'; payload: string }
  | { type: 'ADD_LOG'; payload: any }
  | { type: 'APPLY_TEMPLATE'; payload: { measures: string[]; logs: any[] } };

function taskReducer(state: Task, action: TaskAction): Task {
  switch (action.type) {
    case 'ADD_MEASURE':
      return {
        ...state,
        measures: [...(state.measures || []), action.payload]
      };

    case 'ADD_LOG':
      return {
        ...state,
        logs: [...(state.logs || []), action.payload]
      };

    case 'APPLY_TEMPLATE':
      return {
        ...state,
        measures: action.payload.measures,
        logs: action.payload.logs
      };

    default:
      return state;
  }
}

// 使用
const [task, dispatch] = useReducer(taskReducer, initialTask);

// 原子性更新
dispatch({
  type: 'APPLY_TEMPLATE',
  payload: {
    measures: allMeasures,
    logs: updatedLogs
  }
});
```

---

### 4. 批量更新优化

React 18+ 自动批处理（Automatic Batching）：

```typescript
// React 18+ 会自动批处理这些更新
const handleClick = () => {
  setCount(c => c + 1);
  setFlag(f => !f);
  setData(d => [...d, newItem]);
  // 只会触发一次重新渲染
};

// 如果需要立即刷新，使用flushSync（谨慎使用）
import { flushSync } from 'react-dom';

const handleClick = () => {
  flushSync(() => {
    setCount(c => c + 1);
  });
  // DOM已更新
  console.log(ref.current.textContent);
};
```

---

## 实战案例：工作流模板应用

### 问题场景
用户点击"应用此模板"按钮后，需要：
1. 添加模板中的帮扶措施
2. 记录模板ID
3. 添加操作日志

### 错误实现 ❌

```typescript
const handleApplyTemplate = (template: any) => {
  // 第一次更新：添加措施
  updateTask({
    measures: [...(selectedTask.measures || []), ...template.suggestedMeasures]
  });

  // 第二次更新：记录模板ID
  updateTask({
    workflowTemplate: template.id
  });

  // 第三次更新：添加日志
  updateTask({
    logs: [...(selectedTask.logs || []), newLog]
  });
};
```

**问题**：
- 三次独立的状态更新
- 可能导致状态冲突
- UI可能不响应

### 正确实现 ✅

```typescript
const handleApplyTemplate = (template: any) => {
  if (!selectedTask) return;

  // 1. 准备所有数据
  const templateMeasures = template.suggestedMeasures || [];
  const currentMeasures = selectedTask.measures || [];

  // 合并措施（去重）
  const allMeasures = [...currentMeasures];
  templateMeasures.forEach((measure: string) => {
    if (!allMeasures.includes(measure)) {
      allMeasures.push(measure);
    }
  });

  // 生成日志
  const newLog = {
    id: `l-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    action: `应用流程模板：${template.name}`,
    type: 'manual',
    user: selectedTask.assignedTo?.split(' ')[0] || '运营经理'
  };
  const updatedLogs = [...(selectedTask.logs || []), newLog];

  // 2. 一次性原子更新
  updateTask({
    measures: allMeasures,
    workflowTemplate: template.id,
    logs: updatedLogs
  });

  // 3. 用户反馈
  alert(`已应用模板"${template.name}"，共添加 ${templateMeasures.length} 条建议措施。`);
};
```

---

## 性能优化建议

### 1. 使用useMemo缓存计算结果

```typescript
const filteredTasks = useMemo(() => {
  return tasks.filter(t => {
    const matchesSearch = t.merchantName.includes(searchTerm);
    const matchesRisk = riskFilter === 'ALL' || t.riskLevel === riskFilter;
    return matchesSearch && matchesRisk;
  });
}, [tasks, searchTerm, riskFilter]);
```

### 2. 使用useCallback缓存函数

```typescript
const handleAddMeasure = useCallback((measure: string) => {
  updateTask(prev => ({
    ...prev,
    measures: [...(prev.measures || []), measure]
  }));
}, [updateTask]);
```

### 3. 避免在渲染中创建新对象

```typescript
// ❌ 错误：每次渲染都创建新对象
<Component style={{ margin: 10 }} />

// ✅ 正确：提取到外部或使用useMemo
const style = { margin: 10 };
<Component style={style} />
```

---

## 调试技巧

### 1. 使用React DevTools

- 查看组件重新渲染次数
- 检查状态更新时机
- 分析性能瓶颈

### 2. 添加日志

```typescript
const updateTask = (updates: Partial<Task>) => {
  console.log('Before update:', selectedTask);
  console.log('Updates:', updates);

  const updated = { ...selectedTask, ...updates };
  console.log('After update:', updated);

  setSelectedTask(updated);
};
```

### 3. 使用useEffect监控状态变化

```typescript
useEffect(() => {
  console.log('Task updated:', selectedTask);
}, [selectedTask]);
```

---

## 总结

### 核心原则

1. **原子性**：相关的状态更新应该合并为单次调用
2. **函数式**：依赖旧状态时使用函数式更新
3. **不可变性**：始终创建新对象，不要直接修改状态
4. **批处理**：利用React的自动批处理机制
5. **性能优化**：使用useMemo和useCallback避免不必要的重新渲染

### 检查清单

- [ ] 是否有连续的多次setState调用？
- [ ] 新状态是否依赖于旧状态？
- [ ] 是否正确使用了展开运算符（...）？
- [ ] 是否避免了直接修改状态对象？
- [ ] 是否使用了useMemo/useCallback优化性能？
- [ ] 是否在useEffect中正确声明了依赖项？

---

## 参考资源

- [React官方文档 - State Updates](https://react.dev/learn/queueing-a-series-of-state-updates)
- [React官方文档 - useReducer](https://react.dev/reference/react/useReducer)
- [React 18 - Automatic Batching](https://react.dev/blog/2022/03/29/react-v18#new-feature-automatic-batching)
