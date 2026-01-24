# Mall Operation Agent v1.0 - 版本说明

## 📦 版本信息

- **版本号**：v1.0
- **发布日期**：2026-01-24
- **Git Tag**：v1.0
- **Git Commit**：4001b9a

---

## 🌐 访问地址

**本地开发环境**：
- http://localhost:3000

**启动方式**：
```bash
cd /Users/heyuxuan/Desktop/Mall\ Operation\ Agent/mall-operation-system
npm run dev
```

---

## ✨ 核心功能

### 1. 健康度监控
- 实时查看所有商户的健康状况
- 五维度评分系统（收缴、经营、现场、顾客、抗风险）
- 自动计算风险等级（高/中/低/无）
- 雷达图可视化展示

### 2. 风险预警与派单
- 自动识别5类风险（租金逾期、营收下滑、租售比过高、顾客投诉、健康度下滑）
- 单个派单和批量派单
- 自动分配责任人（高风险→经理，中风险→助理）
- 风险统计和筛选

### 3. 帮扶任务中心
- **措施制定阶段**：AI智能推荐 + 手动输入
- **执行阶段**：可编辑的执行记录，支持中途调整措施
- **评估阶段**：帮扶前后对比，效果判定
- **结案流程**：成功沉淀至知识库 / 升级 / 转招商
- 完整的任务生命周期管理

### 4. 经验知识库
- 浏览和搜索历史成功案例
- 按行业、标签筛选
- 案例详情查看（症状、诊断、策略、措施、效果）
- 一键应用案例到新任务
- 案例收藏功能

---

## 🔧 技术架构

### 前端技术栈
- **框架**：Next.js 16.1.4 (App Router)
- **语言**：TypeScript
- **样式**：Tailwind CSS
- **图表**：Recharts (HealthRadar 组件)
- **图标**：Font Awesome

### 数据存储
- **当前方案**：localStorage（浏览器本地存储）
- **存储内容**：
  - 任务数据 (`tasks`)
  - 用户知识库 (`userKnowledgeBase`)
  - 商户数据（mock data）

### 核心 Skills
已沉淀5个可复用的核心能力模块：
1. **ai-matcher**：AI智能匹配引擎
2. **health-calculator**：健康度计算器
3. **risk-detector**：风险识别器
4. **task-lifecycle-manager**：任务生命周期管理器
5. **knowledge-manager**：知识库管理器

---

## 📁 项目结构

```
mall-operation-system/
├── app/                      # Next.js 页面
│   ├── health/              # 健康度监控
│   ├── risk/                # 风险与派单
│   ├── tasks/               # 帮扶任务中心
│   ├── knowledge/           # 经验知识库
│   └── page.tsx             # 首页
├── components/              # React 组件
│   ├── HealthRadar.tsx      # 健康度雷达图
│   ├── WorkflowStepper.tsx  # 工作流步骤条
│   └── layout/              # 布局组件
├── data/                    # 数据文件
│   ├── merchants/           # 商户数据
│   ├── tasks/               # 任务数据
│   └── cases/               # 案例数据
├── skills/                  # 核心能力模块
│   ├── ai-matcher.ts
│   ├── health-calculator.ts
│   ├── risk-detector.ts
│   ├── task-lifecycle-manager.ts
│   ├── knowledge-manager.ts
│   └── README.md
├── types/                   # TypeScript 类型定义
├── 操作手册.md              # 用户操作手册
└── README.md                # 项目说明
```

---

## 📊 数据说明

### 商户数据
- **位置**：`data/merchants/mock-data.ts`
- **数量**：10个示例商户
- **字段**：id, name, category, floor, shopNumber, area, rent, revenue, metrics, totalScore, riskLevel

### 任务数据
- **位置**：`data/tasks/mock-data.ts`
- **数量**：5个示例任务（覆盖所有阶段）
- **字段**：id, merchantId, merchantName, title, description, measures, assignee, stage, logs, initialMetrics

### 知识库数据
- **位置**：`data/cases/knowledge_base.json`
- **数量**：10个精选案例
- **字段**：id, merchantName, industry, tags, symptoms, diagnosis, strategy, action, result

---

## 🎯 使用场景

### 场景1：日常巡检
1. 打开"健康度监控"查看所有商户状况
2. 发现低分商户，进入"风险与派单"
3. 创建帮扶任务

### 场景2：风险处理
1. 系统自动识别风险商户
2. 批量派单给相应负责人
3. 负责人制定措施并执行
4. 评估效果并结案

### 场景3：经验复用
1. 遇到新问题，先搜索知识库
2. 找到相似案例
3. 一键应用到新任务
4. 根据实际情况微调

---

## 📝 文档

### 用户文档
- **操作手册**：`操作手册.md`
  - 系统简介
  - 功能详解
  - 典型工作流程
  - 常见问题

### 技术文档
- **Skills 文档**：`skills/README.md`
  - 5个核心 Skills 的详细说明
  - API 接口文档
  - 使用示例

---

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 访问系统
打开浏览器访问：http://localhost:3000

### 构建生产版本
```bash
npm run build
npm start
```

---

## 🔄 版本历史

### v1.0 (2026-01-24)
- ✅ 完整的帮扶任务管理系统
- ✅ 健康度监控与风险预警
- ✅ AI智能推荐措施
- ✅ 任务全生命周期管理
- ✅ 可编辑的执行记录
- ✅ 帮扶前后对比分析
- ✅ 知识库管理
- ✅ 批量派单功能
- ✅ 5个核心 Skills 沉淀
- ✅ 完整的用户操作手册

---

## 📋 已知限制

1. **数据存储**：使用 localStorage，容量限制 5-10MB
2. **实时通知**：暂不支持，需手动刷新
3. **数据导出**：暂不支持 Excel 导出
4. **多人协作**：暂不支持任务协作者
5. **权限管理**：暂无用户登录和权限控制

这些限制将在 v2.0 版本中解决。

---

## 🔮 下一步计划

v2.0 版本将包含：
- 时间管理（任务日历、逾期预警、里程碑）
- 预测性分析（风险预警趋势图）
- 对比基准（同业态对比）
- 标准化流程（措施模板库）
- 知识库智能推送
- 快速操作（全局快捷键）
- 协同机制（任务协作、@提醒）
- ROI分析

详见《v2.0 迭代方案》。

---

## 📞 联系方式

- **技术支持**：support@mall-operation-agent.com
- **GitHub**：https://github.com/your-org/mall-operation-agent
- **反馈建议**：欢迎提 Issue

---

## 📄 许可证

MIT License

---

**感谢使用 Mall Operation Agent！**

🤖 Generated with Claude Code
Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
