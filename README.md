# Mall Operation Agent V1.1
# 商场运营智能体 V1.1

> 基于AI的商场商户健康度监控与帮扶管理系统

[![Version](https://img.shields.io/badge/version-1.1-blue.svg)](VERSION.md)
[![Status](https://img.shields.io/badge/status-stable-green.svg)](VERSION.md)
[![Framework](https://img.shields.io/badge/framework-Next.js%2016.1.4-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)

---

## 📋 目录

- [项目简介](#项目简介)
- [核心功能](#核心功能)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [项目结构](#项目结构)
- [技能模块](#技能模块)
- [版本历史](#版本历史)
- [开发指南](#开发指南)

---

## 🎯 项目简介

Mall Operation Agent 是一个智能化的商场运营管理系统，专注于商户健康度监控和精准帮扶。系统通过AI诊断、趋势预测、知识库沉淀等功能，帮助运营团队提升工作效率，实现数据驱动的精细化管理。

### 核心价值

- 🤖 **AI智能诊断**: 自动分析商户问题，推荐帮扶策略
- 📊 **趋势预测**: 基于线性回归的健康度趋势预测
- 📚 **知识沉淀**: 成功案例自动沉淀，经验可复用
- 🔄 **标准化流程**: 工作流模板快速应用
- 🔍 **智能搜索**: 多字段加权搜索，精准匹配

---

## ✨ 核心功能

### 1. 商户健康度监控
- 五维度健康度评估（租金缴纳、经营表现、现场品质、顾客满意度、抗风险能力）
- 实时健康度趋势图表
- 线性回归预测未来3个月趋势
- 风险预警与建议措施

### 2. 帮扶任务管理
- 任务全生命周期管理（措施制定 → 执行 → 评估 → 结案）
- 工作流模板快速应用
- AI智能推荐帮扶措施
- 执行记录与日志追踪

### 3. 知识库沉淀
- 成功案例自动沉淀
- 智能搜索与案例匹配
- 按业态分类管理
- 案例导入导出

### 4. AI诊断与推荐
- 商户问题智能诊断
- 知识库案例智能匹配（业态40% + 标签60% + 症状加分）
- 帮扶策略自动推荐
- 风险等级评估

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

### 环境要求
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

### V1.1 (2026-01-24) - Current ✅
- ✅ UI/UX优化（知识库、AI诊断、趋势预测）
- ✅ 关键bug修复（工作流模板应用失败）
- ✅ 技能模块提取（7个可复用模块）
- ✅ 文档完善

### V1.0 (Previous)
- ✅ 基础功能实现
- ✅ Sprint 1-3 完成（15/15 features）

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

本项目仅供学习和研究使用。

---

## 🤝 贡献者

- **Claude Sonnet 4.5** - AI Assistant & Developer
- **User** - Product Owner & QA

---

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- 提交 Issue
- 发送邮件

---

**Last Updated**: 2026-01-24
**Version**: V1.1
**Status**: Stable ✅

---

Made with ❤️ by Claude Sonnet 4.5
