# Mall Operation Agent

> 把资深商场专家的经营判断，变成可复用、可追踪、可沉淀的 Agent 工作流。

[![Framework](https://img.shields.io/badge/Next.js-16.1.4-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6.svg)](https://www.typescriptlang.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38bdf8.svg)](https://tailwindcss.com/)

## 在线体验

- 首页：https://mall-operation-system.vercel.app
- 商场工作台：https://mall-operation-system.vercel.app/workspace
- 商户改善工作台：https://mall-operation-system.vercel.app/merchant-workspace
- 商场短路径：https://mall-operation-system.vercel.app/mall
- 商户短路径：https://mall-operation-system.vercel.app/merchant

## 1. 项目解决什么问题

商场不缺数据，缺的是可复制的经营研判能力。

核心矛盾：

- 数据分散在销售、客流、合同、活动、评分、巡店记录里
- 不同岗位只能看到局部
- 资深营运 / 招商专家经验稀缺
- 判断依赖个人经验，难复制
- 发现问题后，很难持续推进到执行和复盘
- 专家判断没有沉淀成组织能力

Mall Operation Agent 尝试把资深专家的判断过程拆成可协作、可追踪、可复用的 Agent 工作流。

## 2. 产品定位

Mall Operation Agent 不是传统商户管理后台，也不是单纯数据看板。

它是一个面向商业地产经营团队的 AI Agent 工作台，帮助商场完成：

- 识别商户经营风险
- 串联多源经营证据
- 判断问题根因
- 生成专家建议
- 下发商户改善任务
- 追踪执行结果
- 回流续约和资产经营判断
- 沉淀组织经验

## 3. 当前演示闭环

当前 Demo 以“望潮港火锅续约风险升级”为主线。

```txt
多源证据
-> Agent 研判
-> 专家建议
-> 商户改善任务
-> 执行反馈
-> 效果验证
-> 回流商场续约判断
```

对应页面：

- `/`：项目落地页
- `/workspace`：商场工作台
- `/merchant-workspace`：商户改善工作台
- `/mall`：商场工作台短路径
- `/merchant`：商户改善工作台短路径

## 4. 多源经营证据

系统围绕商户经营判断整合 6 类证据：

| 证据类型 | 示例 |
| --- | --- |
| 销售证据 | 营业额、订单量、客单价、坪效、租售比 |
| 客流证据 | 曝光流量、进店流量、低峰客流、转化趋势 |
| 合同证据 | 租约到期、租金水平、续约节点、商务条款 |
| 活动证据 | 活动参与率、活动毛利、券核销率、活动 ROI |
| 口碑证据 | 评分变化、评论内容、投诉记录、投诉反馈 |
| 巡店证据 | 巡检记录、巡检照片、访谈记录、整改记录 |

## 5. 多 Agent 协同设计

当前产品不是用一个“万能 AI”回答问题，而是把专家判断过程拆成多个 Agent 职责。

| Agent / 能力 | 作用 |
| --- | --- |
| 经营雷达 Agent | 扫描多源数据，找出真正经营异常的商户 |
| 证据整理 Agent | 把分散证据整理成判断链路 |
| 根因诊断 Agent | 判断问题来自商品、人员、体验、价格，还是流量、活动、竞对、商圈变化 |
| 策略建议 Agent | 生成扶持、谈判、继续观察或汰换建议 |
| 执行追踪 Agent | 把建议拆成商户任务，追踪确认、完成和反馈 |
| 效果验证 Agent | 对比改善前后指标，更新风险判断 |
| 记忆沉淀 Agent | 沉淀历史问题、巡店记录、扶持动作和改善结果 |

## 6. 记忆与迭代

系统设计重点不是一次性问答，而是持续形成经营记忆。

会被沉淀的内容：

- 商户历史问题
- 巡店记录
- 扶持动作
- 招商谈判记录
- 商户执行反馈
- 改善效果
- 最终续约判断

这些数据会反哺下一次：

- 风险预警
- 根因判断
- 策略推荐
- 商户改善任务
- 续约评估

## 7. 页面说明

### `/workspace` 商场工作台

面向商场总经理、营运经理、招商经理。

核心能力：

- 商户风险识别
- 多 Agent 经营研判
- 证据账本
- 专家建议
- 任务下发
- 商户执行回流
- 续约判断辅助

### `/merchant-workspace` 商户改善工作台

面向商户 / 门店负责人。

核心能力：

- 接收商场改善计划
- 查看影响续约和资源支持的问题
- 确认任务
- 标记完成
- 填写执行反馈
- 回流商场评估

## 8. 样板案例：望潮港火锅

案例背景：

- 销售、客单价、低峰客流、活动核销、评分和巡店反馈同时走弱
- 租约 45 天后到期
- 商场需要判断：扶持、谈判、继续观察还是汰换

Agent 判断：

- 不是单一销售下滑
- 低峰客流、活动吸引力和服务体验共同影响续约评估

输出动作：

- 午市套餐
- 券门槛调整
- 低峰引导
- 服务排班优化
- 7 / 14 天效果追踪
- 回流续约判断

## 9. 技术实现

| 层 | 技术 |
| --- | --- |
| 框架 | Next.js 16 + React 19 |
| 语言 | TypeScript |
| 样式 | Tailwind CSS |
| 状态 | React Hooks + localStorage mock state |
| 图标 | lucide-react |
| 数据 | 静态 mock data |
| 部署 | Vercel |

## 10. 本地运行

```bash
npm install
npm run dev
```

访问：

```txt
http://localhost:3000
```

## 11. 关键文件

```txt
app/page.tsx
公网落地页

app/workspace/page.tsx
商场工作台

app/merchant-workspace/page.tsx
商户改善工作台

data/merchant-workspace/wangchao-improvement.ts
望潮港火锅改善任务 mock 数据

utils/merchantImprovementState.ts
商场下发、商户执行、效果回流状态管理
```

旧版 V4 项目说明已归档：

```txt
docs/archive/v4/README-V4-legacy.md
```

## 12. 后续规划

- 商场端：增强多商户组合分析、业态结构影响、资产经营视角
- 商户端：完善任务执行、反馈上传、改善效果验证
- Agent 侧：增强记忆沉淀、策略复用、巡店数据回流
- 新产品线：Merchant Agent，面向连锁品牌总部和单店经营管理

## 13. 说明

这是一个个人产品与技术作品项目，用于展示：

- AI Agent 产品设计
- 商业地产经营场景抽象
- 多角色工作台设计
- 从研判到执行的闭环系统
- Next.js 全栈原型实现能力

## 许可证

本软件为专有软件，受版权保护。详见 [LICENSE.md](LICENSE.md)。

- 允许在线体验和评估
- 允许用于技术面试展示
- 禁止商业使用 / 复制 / 分发

---

作者：何雨轩
