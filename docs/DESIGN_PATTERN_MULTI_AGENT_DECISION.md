# 数字员工协作决策系统 — 设计模式文档

> 作者：何雨轩 | 基于「商户智运Agent」项目提炼 | 2026-05

**GitHub 仓库**：https://github.com/heyuxuan0209/mall-operation-system
**线上演示**：https://merchant-smartops.zeabur.app/workspace（访问码请联系作者）
**核心实现文件**：[`app/workspace/page.tsx`](https://github.com/heyuxuan0209/mall-operation-system/blob/main/app/workspace/page.tsx)（2500+ 行，全部产品逻辑在此）

---

## 一、这是什么

这是一套**结构化决策操作系统**的产品设计模式。

它解决的核心问题是：**当一个决策需要多个职能的信息输入、风险高到不能让 AI 自主拍板、又需要留痕和复盘时，怎么设计人机协作的工作流。**

表面上是 Multi-Agent 聊天界面，本质上是一套**有职责边界的数字员工协作框架**，加上一个**结构化决策对象**，加上一个**执行验证闭环**。

---

## 二、核心设计原则

### 原则 1：每个 Agent 只做自己权限内的事

每个数字员工有且只有一个职责，超出职责边界就停下来请示人类。

这是让系统看起来"真实可信"而不是"AI 乱说话"的关键。

```
风险诊断师  → 只做监控和预警，不做判断
经营分析师  → 只做数据解读，不做决策
任务调度官  → 只做方案收敛，不拍板
案例记忆官  → 只做归档沉淀，不参与当下决策
```

### 原则 2：议题有完整的生命周期状态机

每个经营议题不是一条消息，而是一个有状态的业务对象。

```
自动识别 → 建议升级 → 联合研判中 → 等待请示 → 等待拍板
                                                    ↓
已沉淀 ← 待复盘 ← 执行中 ← 已拍板 ←────────────────┘
```

每个状态明确定义：
- 状态含义
- 进入条件
- 当前责任方（是 Agent 还是人类）
- 下一步动作
- 是否需要人类介入

### 原则 3：拍板是业务对象，不是按钮

"决策"不是一个 `onClick` 事件，而是一个包含完整上下文的结构化对象：

```typescript
interface DecisionObject {
  question: string          // 决策问题
  options: Option[]         // 可选方案
  recommendedOption: string // 推荐方案
  recommendReason: string   // 推荐理由
  keyEvidence: string[]     // 关键依据（来自证据账本）
  risks: string             // 风险与代价
  decisionMaker: string     // 决策人
  deadline: string          // 截止时间
  verificationMetrics: string[] // 验证指标
  result?: string           // 实际决策结果
}
```

### 原则 4：证据和发言分离

Agent 的每一句判断背后，都有结构化的证据支撑，存在独立的"证据账本"里。

```typescript
interface EvidenceItem {
  type: '经营数据' | '现场证据' | '历史案例' | '招商判断' | '活动数据' | '客诉反馈'
  summary: string
  provider: string       // 哪个 Agent 或人类提供
  updatedAt: string
  supportsJudgment: string  // 支撑哪个判断
  credibility: 'high' | 'medium' | 'low'
}
```

### 原则 5：执行后必须验证，验证后必须沉淀

拍板不是终点。执行任务有预期领先指标，有实际结果，有复盘结论，最终沉淀为组织记忆，反哺下次同类判断。

---

## 三、角色定义方法论

给任何新场景套用这套框架，需要回答 5 个问题：

**Q1：触发事件是什么？**
什么信号会触发一个议题进入系统？（数据异常、外部事件、人工上报）

**Q2：信息分散在哪些职能？**
这个决策需要哪些维度的信息输入？每个维度对应一个数字员工角色。

**Q3：谁有权拍板，拍什么？**
人类决策者是谁？他需要做的决策是什么粒度的？（战略级 / 执行级）

**Q4：执行后怎么验证？**
什么指标能在短期内验证决策是否正确？（领先指标，不是滞后指标）

**Q5：什么值得沉淀为组织记忆？**
这次决策的哪些洞察，下次遇到同类问题时应该自动推送？

---

## 四、可迁移的场景

这套逻辑适合任何满足以下条件的场景：

- ✅ 信息分散在多个职能 / 数据源
- ✅ 决策风险高，不能让 AI 自主拍板
- ✅ 需要留痕（合规、审计、复盘）
- ✅ 决策结果需要追踪执行
- ✅ 同类问题会反复出现，经验有积累价值

### 场景映射示例

| 行业 | 触发事件 | 数字员工角色 | 人类决策者 | 验证指标 |
|------|---------|------------|----------|---------|
| 商业地产 | 商户续约风险 | 经营分析师 / 招商经理 / 现场巡检 / 案例记忆 | 总经理 | 续约率 / 销售额恢复 |
| 医疗 | 患者入院异常指标 | 检验科 / 影像科 / 药剂师 / 历史病例 | 主治医师 | 指标恢复时间 |
| 投资 | 项目尽调启动 | 行业分析师 / 财务 / 法务 / BD | 投委会 | 投后 ROI |
| 供应链 | 供应商质量预警 | 质检 / 采购 / 财务 / 法务 | 采购总监 | 不良率 / 交期达成率 |
| 法律 | 案件风险评估 | 调查员 / 合规 / 诉讼律师 / 财务 | 合伙人 | 胜诉率 / 和解金额 |
| 内容平台 | 高风险内容上报 | 违规检测 / 舆情分析 / 法务 / 品牌 | 人工终审 | 误判率 / 处理时效 |

---

## 五、三栏布局的视觉语义

这套工作台的三栏布局不是随意的，每栏有明确的视觉语义：

```
左栏（冷灰 #f1f5f9）  中栏（纯白）          右栏（暖黄 #fffbeb）
─────────────────    ─────────────────    ─────────────────
导航 / 索引属性       主内容区              需要你关注 / 决策
退到背景              最亮最干净            天然成为视觉焦点

议题列表              研判对话线程          当前决策对象
生命周期状态          Agent 发言            证据账本摘要
责任方标注            状态流转卡            执行验证闭环
```

**冷色 = 信息背景，暖色 = 需要行动。** 这个颜色逻辑在任何决策工作台场景都适用。

---

## 六、AutoPlay 演示引擎的设计逻辑

产品演示不依赖真实 AI 调用，而是用一个脚本驱动的 AutoPlay 引擎：

```typescript
// 每条消息是一个脚本节点
interface ScriptItem {
  agentId: string           // 哪个角色发言
  content: string           // 发言内容
  delay: number             // 距上一条的延迟（模拟思考时间）
  lifecycle?: {             // 可选：触发状态流转
    from: IssueLifecycle
    to: IssueLifecycle
    trigger: string
  }
  evidence?: EvidenceItem   // 可选：同时写入证据账本
  decision?: DecisionObject // 可选：触发决策对象
}
```

这个设计的价值：
- 演示完全可控，不依赖网络和 AI 服务
- 每次演示路径一致，适合面试 / 汇报场景
- 脚本即文档，产品逻辑一目了然

---

## 七、如果要复用，最小可行的技术骨架

```
核心数据结构（必须）
├── IssueLifecycle        状态机类型定义
├── DecisionObject        决策对象
├── EvidenceItem          证据条目
└── ExecutionTask         执行任务

核心组件（必须）
├── ThreadList            左栏议题列表
├── AgentThread           中栏对话线程
├── LifecycleTransitionCard  状态流转卡
└── DecisionPanel         右栏决策面板

引擎（必须）
└── AutoPlayEngine        脚本驱动的演示引擎

可选扩展
├── EvidenceLedger        证据账本详情
├── ExecutionTracker      执行追踪
└── MemoryArchive         组织记忆归档
```

---

## 八、这套模式的局限性

诚实地说，这套设计目前有几个边界：

1. **适合演示，不适合真实 AI 调用**：AutoPlay 引擎是脚本驱动的，接入真实 LLM 需要重新设计消息流和状态同步。

2. **角色边界需要人工定义**：数字员工的职责边界不是 AI 自动生成的，需要领域专家事先设计，这是最重的前期工作。

3. **证据可信度是主观标注**：目前的可信度（high/medium/low）是 mock 数据，真实场景需要建立评估标准。

4. **状态机是线性的**：当前实现假设议题沿主线推进，复杂场景（并行议题、议题合并）需要扩展状态机设计。

---

*这份文档描述的是设计模式，不是实现规范。具体场景落地时，角色定义和状态机设计需要根据业务重新推导。*

---

## 九、关键代码位置索引

Codex 可以直接在 GitHub 查看以下文件：

| 内容 | 文件路径 | 说明 |
|------|---------|------|
| 全部产品逻辑 | [`app/workspace/page.tsx`](https://github.com/heyuxuan0209/mall-operation-system/blob/main/app/workspace/page.tsx) | 2500+ 行，状态机 / Agent 角色 / AutoPlay 引擎 / 三栏布局全在这里 |
| 核心类型定义 | `app/workspace/page.tsx` 第 1–150 行 | `IssueLifecycle` / `DecisionObject` / `EvidenceItem` / `ExecutionTask` |
| AutoPlay 脚本 | `app/workspace/page.tsx` 搜索 `SCRIPT` | 8 阶段演示脚本，每条消息含 agentId / delay / lifecycle 流转 |
| Agent 角色定义 | `app/workspace/page.tsx` 搜索 `AGENTS` | 6 个数字员工的 id / 名称 / 颜色 / 职责描述 |
| 三栏布局 | `app/workspace/page.tsx` 搜索 `leftPanel` / `centerPanel` / `rightPanel` | 冷灰 / 纯白 / 暖黄三栏的渲染逻辑 |
| Landing Page | [`public/landing.html`](https://github.com/heyuxuan0209/mall-operation-system/blob/main/public/landing.html) | 纯 HTML/CSS/JS 对外展示页，含产品结构说明 |
| 项目总览 | [`README.md`](https://github.com/heyuxuan/mall-operation-system/blob/main/README.md) | 架构图 / 演示流程 / 技术栈 |
