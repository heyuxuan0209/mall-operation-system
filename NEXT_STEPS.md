# 下一步计划 — 商户智运Agent 改版 V4

**更新时间**: 2026-04-28
**当前阶段**: Phase 3 完成（发起新会商 + 今日晨报 + 商户档案页）

---

## ✅ 已完成

### Phase 1（全部完成）

| 文件 | 内容 |
|------|------|
| `app/workspace/page.tsx` | 多Agent会商工作台全量重写：AutoPlay引擎、8阶段Phase时间线、CEO Directive Bar、PhaseConclusionCard、JudgmentRevisionCard、PlanCard(8字段)、左侧经营事项盘 |
| `app/v4/execution/page.tsx` | Sparkline组件、LeadingIndicatorDashboard（望潮港领先指标）、续约风险降级banner、4条干预任务 |
| `app/v4/memory/page.tsx` | Case #2024-088（NEW徽章）、CrossCaseInsights跨案例洞察面板（3条规律）、AI使用日志新条目 |

### Phase 2（多线程 — 2026-04-28 完成）

| 新增内容 | 说明 |
|----------|------|
| `THREAD_META` | 三条线程的 badge/title/riskBadge/window 配置 |
| `XINXIANG_DATA_ROWS` / `XINXIANG_INSPECTION_ITEMS` / `XINXIANG_TASKS` | 辛香汇线程数据 |
| `BEVENT_DATA_ROWS` | B区复盘线程数据 |
| `XINXIANG_BASE_MSGS` / `XINXIANG_MSGS` / `XINXIANG_MSGS_APPROVED` | 辛香汇静态消息数组 |
| `BEVENT_MSGS` | B区复盘静态消息数组（9条） |
| `DataXinxiangEmbed` / `InspectionXinxiangEmbed` / `DataBeventEmbed` | 新 Embed 组件 |
| `currentMsgs` useMemo | 基于 activeThread + 状态标志切换消息源 |
| `xinxiangApproved` / `beventConfirmed` state | 线程交互状态标志 |
| `threadTasks` useMemo | 线程专属任务列表 |
| 动态 Thread Header | 基于 THREAD_META 渲染，不再硬编码 |
| 自动播放控件条件显示 | 仅 `activeThread === 'wangchao'` 时显示 |
| 右侧面板动态化 | 当前议题、任务列表均随线程切换 |

---

## 🚧 Phase 2（已授权，立即执行）✅ 已完成（2026-04-28）

### 目标：`/app/workspace/page.tsx` 多线程支持

**线程切换架构**：
- `currentMsgs` useMemo：基于 `activeThread` + `xinxiangApproved` + `beventConfirmed` 返回对应消息数组
- 自动播放控件只在 `activeThread === 'wangchao'` 显示
- `handleConsultApprove` / `handleMemoryConfirm` 按线程分支处理
- `TaskCard` 接受 `tasks` prop；`MsgBubble` 接受 `threadTasks` + `activeThread`

### 2-A 辛香汇线程

**数据**：
```
XINXIANG_DATA_ROWS（5项）
  月均营业额 ¥41万→¥31万 (-24.4%) warn
  月均客流  6,200→5,100  (-17.7%) warn
  人均消费  ¥66→¥61     (-7.6%)  -
  差评率    2.1%→4.8%   (+2.7pt) warn
  翻台率    4.2→3.1次/天 (-26.2%) warn

XINXIANG_INSPECTION_ITEMS（3项）
  新品陈列面积不足30%，老品占核心位
  导购话术弱，询价转化率仅12%
  候台区无内容，等位体验评分2.1/5

XINXIANG_TASKS（3项）
  1. 新品陈列全面更新 / 商户经营顾问 / 3天内
  2. 导购话术专项培训 / 巡店督导 / 5天内
  3. 2周效果追踪复盘 / 风险诊断师 / 14天后
```

**消息数组**：
- `XINXIANG_BASE_MSGS`（8条）：x1(phase-sep 发现) x2(risk 下滑信号) x3(phase-sep 补充证据) x4(advisor embed:data-xinxiang) x5(inspector embed:inspection-xinxiang) x6(phase-conclusion) x7(phase-sep 判断) x8(advisor 三方向建议)
- `XINXIANG_MSGS` = `[...base, x9:consultation waiting]`
- `XINXIANG_MSGS_APPROVED` = `[...base, x9:approved, x10:system, x11:gm, x12:advisor, x13:task-card]`

**交互**：点击"同意"→ `setXinxiangApproved(true)` → currentMsgs 切到 APPROVED 版本

### 2-B B区复盘线程

**数据**：
```
BEVENT_DATA_ROWS（5项）
  目标总客流  2000→1340人次 (-33%)   warn
  活动ROI    目标2.1→实际1.4 (-33%) warn
  优惠券核销  目标60%→实际71% (+11pt) -
  周末客流   目标100%→实际67% (-33pt) warn
  新会员转化  目标120→实际89人 (-25.8%) -
```

**消息数组** `BEVENT_MSGS`（9条）：
- b1(phase-sep 数据汇总) b2(campaign embed:data-bevent 达成67%) b3(memory 历史对比) b4(phase-sep 根因) b5(phase-conclusion) b6(phase-sep 改进建议) b7(scheduler 3条优化) b8(phase-sep 沉淀) b9(memory-card 等待确认)

**交互**：点击"确认沉淀"→ `setBeventConfirmed(true)` → memory-card 显示 confirmed 状态

### THREAD_META 配置
```
wangchao: badge=🔴续约风险  title=望潮港火锅：续约风险升级  riskBadge=🔴高危  窗口=45天
xinxiang: badge=🟡经营下滑  title=辛香汇：经营持续下滑    riskBadge=🟡中风险 窗口=3周
b-event:  badge=🔵活动复盘  title=B区周末活动复盘          riskBadge=🔵待决策 窗口=3周后
```

---

## ✅ Phase 3（已完成 2026-04-28）

| 新增内容 | 说明 |
|----------|------|
| `NewConsultModal` 组件 | 商户 Grid 选择 + 议题类型 chips + 补充说明 textarea |
| `CustomThread` 接口 + `MERCHANT_OPTIONS` / `ISSUE_TYPES` | 发起新会商数据层 |
| `getCustomThreadInitMsgs()` | 自定义线程初始 4 条消息生成函数 |
| `handleNewConsult` callback | 创建 CustomThread → 追加到 customThreads → 切换线程 |
| 左侧栏「新发起」分组 | 渲染所有用户发起的自定义线程 |
| `MORNING_REPORT_MSGS` 静态消息数组 | 今日经营晨报完整内容（4条消息） |
| `morning-report` 线程 | 接入 THREAD_META + currentMsgs + 左侧按钮点击 |
| `app/archives/[id]/page.tsx` | 望潮港火锅干预档案页：Hero + 指标对比 + 时间线 + 任务 + 案例 |
| workspace 右侧面板「查看干预档案」链接 | 望潮港线程下显示，跳转 /archives/wangchao |

---

## 🔑 新窗口恢复指南

1. 读取 `CONTEXT.md` 了解整体状态
2. 读取本文件了解待办
3. 读取 `app/workspace/page.tsx`（1513行）了解现有结构
4. 直接开始写 Phase 2 的 workspace 多线程更新

**关键约束**：
- Next.js 16.1.4，`--webpack` flag，port 3001
- 所有新线程消息数组用静态 `const` 定义（非动态生成）
- 不引入外部图表库（Sparkline 已是纯 SVG 实现）
- TypeScript strict，运行 `npx tsc --noEmit --skipLibCheck` 验证
