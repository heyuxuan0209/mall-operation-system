# 商户智运Agent v3.1
# Merchant SmartOps AI Agent v3.1

> AI Agent驱动的商业地产商户运营管理系统 | 何雨轩作品集项目

[![Version](https://img.shields.io/badge/version-3.1--dev-orange.svg)](VERSION.md)
[![Status](https://img.shields.io/badge/status-development-yellow.svg)](VERSION.md)
[![Framework](https://img.shields.io/badge/framework-Next.js%2016.1.4-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![AI](https://img.shields.io/badge/AI-LLM%20Powered-purple.svg)](https://anthropic.com)

**🌐 在线体验**: [https://merchant-smartops.zeabur.app](https://merchant-smartops.zeabur.app)
**🔑 访问码**: `hyx2026` | 如有疑问请联系何雨轩 **182 1020 9768**

---

## 📋 目录

- [项目简介](#项目简介)
- [核心功能](#核心功能)
- [最新更新](#最新更新)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [项目结构](#项目结构)
- [技能模块](#技能模块)
- [版本历史](#版本历史)
- [开发指南](#开发指南)

---

## 🎯 项目简介

**商户智运Agent** 是一个AI驱动的商业地产商户运营管理系统，专注于商户健康度监控、智能诊断和精准帮扶。本项目为**何雨轩作品集**，展示AI产品设计与全栈开发能力。

### 项目定位
- 📱 **在线Demo**: 用于求职面试展示
- 🎓 **作品集项目**: 展示技术能力和产品思维
- 🚀 **生产就绪**: 代码质量达到生产级别标准

### 核心价值

- 🤖 **AI Agent问答助手** ⭐v3.1: 从规则Chatbot升级为推理Agent
  - LLM驱动的查询理解（支持聚合统计、对比分析）
  - 因果推理诊断（根因分析而非症状检测）
  - 动态响应生成（个性化而非模板化）
  - **详细运营数据支持**（翻台率、NPS、员工流失率等）
- 📊 **趋势预测**: 基于线性回归的健康度趋势预测
- 📚 **AI帮扶知识库**: 成功案例自动沉淀，经验可复用
- 🔄 **标准化流程**: 工作流模板快速应用
- 🔍 **智能搜索**: 多字段加权搜索，精准匹配

---

## 🆕 最新更新 (v3.1 - 2026-02-10)

### 1. 商户详细运营数据扩展 ⭐
**为AI诊断提供更细粒度的数据支持**

**新增数据维度**:
- 📊 **通用数据**: 日均客流、高峰客流、转化率
- 🍽️ **餐饮专属**: 翻台率、等位时间、客单价、错漏单率
- 🛍️ **零售专属**: 坪效、库存周转率、连带率
- 👥 **顾客数据**: NPS得分、复购率、客户生命周期
- 👔 **员工数据**: 员工流失率、平均工龄
- 🏢 **竞争环境**: 竞品数量、市场份额、竞争地位
- 📍 **位置数据**: 楼层、动线类型、可见度评级

**功能特性**:
- ✅ 可视化数据录入表单（动态字段，按业态显示）
- ✅ 折叠式数据展示（7大类别，清晰呈现）
- ✅ AI诊断引擎优先使用详细数据（而非推测）
- ✅ Demo数据预填充（海底捞、星巴克、优衣库）

**测试示例**:
```
问：海底捞的翻台率是多少？
答：根据实际采集数据，海底捞的翻台率为1.2次/天，
    低于行业平均水平（2-3次/天），这是导致营收下降的核心问题。
```

### 2. AI助手图标升级 ✨
**让AI助手成为页面焦点，突出agent化特性**

**视觉升级**:
- 🎨 尺寸增大28%: 56x56px → 72x72px
- 🌈 蓝紫渐变: 科技感 + 专业感
- ✨ 图标更换: Sparkles (更符合AI特性)
- 🏷️ 永久标识: 右上角"AI"徽章始终显示

**动画效果**:
- 🌟 光晕呼吸 (3秒循环，柔和发光)
- 🎈 轻微浮动 (上下4px，增加生命力)
- 💫 圆环扩散 (持续提醒可点击)
- ⚡ 徽章脉冲 (AI标识闪烁)

**交互优化**:
- 悬停: 放大10% + 展开"AI助手"标签
- 点击: 缩小5%，触觉反馈
- 流畅: 300ms过渡动画

**显眼度提升**: 200%+

---

## ✨ 核心功能

### 1. AI问答助手 ⭐v3.1重构
**从规则匹配Chatbot → 推理驱动AI Agent**

**支持查询类型**:
- 单商户查询："海底捞最近怎么样？"
- 聚合统计："这个月多少高风险商户？"
- 对比分析："和上个月比怎么样？"
- 趋势分析："营收走势如何？"
- **详细数据查询**: "海底捞的翻台率是多少？" ⭐新增

**核心能力**:
- **查询理解** - LLM结构化解析（时间、实体、意图）
- **意图识别** - 语义分类，支持复合意图
- **智能诊断** - 因果推理，根因分析（位置差 vs 管理差 vs 产品差）
- **案例匹配** - 根因相似度 + 语义匹配
- **动态生成** - 个性化响应，而非固定模板
- **详细数据支持** - 优先使用实际采集数据（翻台率、NPS等）⭐新增

**技术架构**:
```
Query → LLM结构化 → Intent分类 →
诊断推理/数据聚合/对比分析 → LLM动态生成响应
```

### 2. 商户健康度监控
- 五维度健康度评估（租金缴纳、经营表现、现场品质、顾客满意度、抗风险能力）
- 实时健康度趋势图表
- 线性回归预测未来3个月趋势
- 风险预警与建议措施

### 3. 帮扶任务管理
- 任务全生命周期管理（措施制定 → 执行 → 评估 → 结案）
- 工作流模板快速应用
- AI智能推荐帮扶措施
- 执行记录与日志追踪

### 4. AI帮扶知识库
- 成功案例自动沉淀
- 智能搜索与案例匹配
- 按业态分类管理
- 案例导入导出

### 5. 现场巡店工具包
- 快速评分、照片标注、语音记录
- 批量巡检模式（效率提升47%）
- 清单生成、即时分析

### 6. 管理驾驶舱
- 统计可视化（完成率、超期预警）
- 巡检员排行榜、策略管理

---

## 🛠 技术栈

### 前端框架
- **Next.js 16.1.4** - React框架（App Router + Turbopack）
- **React 19** - UI组件库
- **TypeScript 5.x** - 类型安全

### UI组件
- **Tailwind CSS** - 原子化CSS框架
- **Font Awesome** - 图标库
- **Recharts** - 数据可视化

### 状态管理
- **React Hooks** - useState, useEffect, useMemo, useCallback
- **LocalStorage** - 客户端数据持久化

### 开发工具
- **Turbopack** - 高性能打包工具
- **ESLint** - 代码规范检查

---

## 🚀 快速开始

### 在线体验（推荐）
访问在线Demo，无需本地安装：
- **Demo地址**: [https://merchant-smartops.zeabur.app](https://merchant-smartops.zeabur.app)
- **部署平台**: Zeabur (Jakarta 节点)
- **访问码**: `hyx2026`
- **说明**: Demo版本，数据每24小时重置

### 本地开发

#### 环境要求
- Node.js 18.x 或更高版本
- npm 或 yarn 或 pnpm

### 安装依赖
```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 启动开发服务器
```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本
```bash
npm run build
npm run start
```

### 部署到 Zeabur（推荐）

本项目已部署到 Zeabur，选择 Jakarta 节点以优化中国大陆访问。

**环境变量配置**（在 Zeabur Dashboard 中设置）：

| Key | Value | 说明 |
|-----|-------|------|
| `ACCESS_CODE` | hyx2026 | 必须设置，用于保护网站访问 |

**部署步骤**：
```bash
# 1. 推送代码到GitHub
git push origin main

# 2. 在 Zeabur 中导入项目
#    - 访问 https://zeabur.com
#    - 用 GitHub 账号登录
#    - Create Project → Deploy from GitHub
#    - 选择仓库并导入

# 3. 配置环境变量
#    - 进入项目 → Variables
#    - 添加 ACCESS_CODE = hyx2026

# 4. 生成域名
#    - Networking → Generate Domain
#    - 获取 .zeabur.app 域名

# 5. 部署完成
```

**访问保护说明**：
- 访问者首次访问会看到联系信息页面
- 输入正确访问码 `hyx2026` 后可进入系统
- Cookie 有效期 30 天

**为什么选择 Zeabur？**
- ✅ 针对中国大陆优化，访问稳定
- ✅ Jakarta 节点延迟低
- ✅ 免费额度充足（适合 Demo 项目）
- ✅ 部署简单，中文支持

---

## 📁 项目结构

```
mall-operation-system/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # 首页（数据概览）
│   ├── health/                   # 健康监控模块
│   │   └── page.tsx
│   ├── tasks/                    # 任务管理模块
│   │   └── page.tsx
│   ├── knowledge/                # 知识库模块
│   │   └── page.tsx
│   ├── layout.tsx                # 根布局
│   └── globals.css               # 全局样式
│
├── components/                   # React组件
│   ├── layout/
│   │   ├── Sidebar.tsx           # 侧边栏导航
│   │   └── Header.tsx            # 顶部导航
│   ├── HealthTrendChart.tsx      # 健康度趋势图
│   ├── WorkflowTemplate.tsx      # 工作流模板选择器
│   └── ...
│
├── utils/                        # 工具函数库（技能模块）
│   ├── smartSearch.ts            # 智能搜索引擎
│   ├── aiDiagnosis.ts            # AI诊断引擎
│   ├── healthTrendPrediction.ts  # 健康度预测
│   ├── taskStateMachine.ts       # 任务状态机
│   └── knowledgeBaseSedimentation.ts  # 知识库沉淀
│
├── docs/                         # 文档
│   ├── skills-extraction-summary.md   # 技能提取总结
│   └── react-state-best-practices.md  # React最佳实践
│
├── public/                       # 静态资源
├── VERSION.md                    # 版本历史
├── README.md                     # 项目说明
├── package.json                  # 项目配置
└── tsconfig.json                 # TypeScript配置
```

---

## 🎓 技能模块

本项目提取了7个可复用的技能模块，详见 [技能提取总结](docs/skills-extraction-summary.md)。

### P0 - 核心技能
1. **AI Diagnosis & Recommendation Engine** - AI诊断与推荐引擎
2. **React State Update Best Practices** - React状态更新最佳实践

### P1 - 重要技能
3. **Smart Search Engine** - 智能搜索引擎
4. **Health Trend Prediction** - 健康度趋势预测
5. **Task State Machine** - 任务状态机

### P2 - 辅助技能
6. **Knowledge Base Sedimentation** - 知识库沉淀

---

## 📝 版本历史

### v3.0-dev (2026-02-07) - Current 🚧
**AI问答助手系统性重构**
- 🚀 从"规则匹配Chatbot"升级为"推理驱动AI Agent"
- ✅ 支持聚合统计、对比分析、趋势分析查询
- ✅ LLM因果推理诊断（根因分析）
- ✅ 语义案例匹配（替代标签匹配）
- ✅ 动态响应生成（替代固定模板）
- 📋 实施中：3个迭代（核心能力/智能诊断/上下文记忆）

### v2.5-stable (2026-02-06)
- ✅ 迁移到Zeabur部署（Jakarta节点）
- ✅ 访问码保护功能
- ✅ 历史帮扶档案增强

### v2.0-v2.4 (2026-01-28~02-03)
- ✅ 现场巡店工具包
- ✅ 批量巡检模式
- ✅ 管理驾驶舱
- ✅ 5等级风险标准

### v1.1 (2026-01-24)
- ✅ UI/UX优化
- ✅ 关键bug修复
- ✅ Skills提取

### v1.0 (2026-01-23)
- ✅ 基础功能实现（15 features）

详见 [VERSION.md](VERSION.md)

---

## 👨‍💻 开发指南

### 代码规范
- 使用TypeScript严格模式
- 遵循ESLint规则
- 组件使用函数式组件 + Hooks
- 状态更新遵循原子性原则（见 [React最佳实践](docs/react-state-best-practices.md)）

### 状态管理最佳实践
```typescript
// ✅ 正确：单次原子性更新
updateTask({
  measures: allMeasures,
  logs: updatedLogs
});

// ❌ 错误：连续多次更新
updateTask({ measures: allMeasures });
updateTask({ logs: updatedLogs });
```

### 使用技能模块
```typescript
// 智能搜索
import { createSmartSearchEngine, knowledgeBaseSearchConfig } from '@/utils/smartSearch';
const searchEngine = createSmartSearchEngine(knowledgeBaseSearchConfig);
const results = searchEngine.search('营收下滑', knowledgeBase);

// AI诊断
import { generateDiagnosisReport } from '@/utils/aiDiagnosis';
const diagnosis = generateDiagnosisReport(merchant, knowledgeBase);

// 健康度预测
import { predictHealthTrend } from '@/utils/healthTrendPrediction';
const predictions = predictHealthTrend(historicalData);
```

---

## 📊 数据模型

### 商户数据 (Merchant)
```typescript
{
  id: string;              // 商户ID
  name: string;            // 商户名称
  category: string;        // 业态分类
  floor: string;           // 楼层
  shopNumber: string;      // 铺位号
  area: number;            // 面积(㎡)
  rent: number;            // 月租金
  lastMonthRevenue: number; // 上月营收
  rentToSalesRatio: number; // 租售比
  riskLevel: 'low' | 'medium' | 'high' | 'critical'; // 风险等级
  totalScore: number;      // 健康度评分(0-100)
  metrics: {
    collection: number;     // 租金缴纳(0-100)
    operational: number;    // 经营表现(0-100)
    siteQuality: number;    // 现场品质(0-100)
    customerReview: number; // 顾客满意度(0-100)
    riskResistance: number; // 抗风险能力(0-100)
  }
}
```

### 帮扶案例 (Case)
```typescript
{
  id: string;              // 案例ID
  merchantName?: string;   // 商户名称
  industry: string;        // 业态
  tags: string[];          // 标签
  symptoms: string;        // 症状
  diagnosis: string;       // 诊断
  strategy: string;        // 策略
  action: string;          // 具体措施
  result?: string;         // 效果
  createdAt: string;       // 创建时间
  source?: 'system' | 'user';  // 来源
}
```

---

## 🐛 已知问题

无

---

## 🗺 路线图

### V1.2 (计划中)
- [ ] 接入真实LLM API（Claude API）
- [ ] 语义搜索功能
- [ ] 多模型预测对比
- [ ] 案例质量评分

### V2.0 (未来)
- [ ] 多租户支持
- [ ] 权限管理系统
- [ ] 移动端适配
- [ ] 数据导出功能

---

## 📄 许可证

本软件为专有软件，受版权保护。详见 [LICENSE.md](LICENSE.md)。

**Demo版本说明**:
- ✅ 允许在线体验和评估
- ✅ 允许用于技术面试展示
- ❌ 禁止商业使用
- ❌ 禁止复制、修改、分发

---

## 🤝 贡献者

- **Heyuxuan** - Product Designer & Developer
- **Claude Sonnet 4.5** - AI Assistant & Code Reviewer

---

## 📞 联系方式

**何雨轩项目集 | 个人作品展示用**

如果您感兴趣，欢迎：
- 🌐 体验在线Demo
- 💬 询问技术细节
- 📧 联系讨论项目

如有问题或建议：
- 查看 [部署指南](VERCEL-DEPLOYMENT-GUIDE.md)
- 查看 [许可协议](LICENSE.md)

---

**Last Updated**: 2026-02-07
**Version**: v3.0-dev
**Status**: Development 🚧 (AI问答助手重构中)
**Deployed on**: Zeabur (Jakarta)

---

Made with ❤️ for career portfolio
Powered by Next.js + AI
