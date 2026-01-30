# 智能拍照分类 + 商户对比功能 - 进度快照

**创建时间**: 2026-01-30 12:15
**Git Commit**: 02624c7
**工作状态**: 智能拍照分类 ✅ 已完成 | 商户对比功能 ⏳ 待开发

---

## ✅ 已完成工作 (3.5小时)

### 1. 回滚IndexedDB迁移 ✅
- 回滚了 `utils/merchantDataManager.ts` 到localStorage版本
- 删除了未完成的IndexedDB文件
- 保留了 `docs/technical/indexeddb-schema.md` 供将来参考
- 构建测试通过

### 2. 智能拍照分类功能 ✅ (3小时)

#### A. 核心算法 (`utils/smartPhotoClassifier.ts` - 550行)

**功能完整实现**:
- ✅ 基于时间的规则
  - 开店检查 (9:50前)：重点关注员工状态和环境准备
  - 闭店检查 (21:00后)：重点关注环境清洁和库存盘点
  - 常规巡检：均衡关注各方面

- ✅ 基于商户画像的规则
  - 根据最薄弱维度推荐分类
  - 高风险商户加强现场监控
  - 健康度低分商户全面排查

- ✅ 基于业态特点的规则
  - 餐饮：重点关注卫生环境和服务
  - 零售：重点关注商品陈列和环境
  - 主力店：重点关注整体环境和人员管理

- ✅ 基于历史照片的平衡规则
  - 鼓励拍摄多样性
  - 补充覆盖较少的分类

- ✅ 智能标签推荐
  - 高风险：优先推荐负面标签（找问题）
  - 中风险：均衡推荐
  - 低风险：优先推荐正面标签（确认良好）

- ✅ 自动问题等级判定

**导出函数**:
```typescript
suggestPhotoClassification(input: ClassificationInput): PhotoClassificationSuggestion
getChecklistType(time?: Date): 'opening' | 'closing' | 'routine'
formatConfidence(confidence: number): string
```

#### B. UI增强 (`components/inspection/ImageUploader.tsx`)

**新增功能**:
- ✅ AI建议卡片显示
  - 渐变紫蓝色背景
  - 显示推荐分类、标签、等级
  - 显示置信度百分比
  - 显示建议理由

- ✅ 推荐标识
  - 分类按钮右上角"⭐推荐"徽章
  - 标签上显示推荐评分（如：⭐ 90%）

- ✅ 快捷操作
  - "使用AI建议"按钮 - 一键采纳所有建议
  - 可手动调整后再确认

- ✅ 新增Props
  - `merchant?: Merchant` - 传入商户信息用于生成建议

**工作流程**:
```
用户拍照/上传
  ↓
自动生成AI建议（基于商户画像、时间、历史照片）
  ↓
弹出分类模态框，显示AI建议卡片
  ↓
用户可以：
  - 一键采纳AI建议
  - 手动选择/微调
  - 关闭AI建议继续手动操作
  ↓
确认保存
```

#### C. 测试状态

**构建测试**: ✅ 通过
```bash
npm run build
✓ Compiled successfully
```

**功能测试场景**:
- [ ] 开店检查（需要在巡检页面测试）
- [ ] 闭店检查（需要在巡检页面测试）
- [ ] 高风险商户（需要选择高风险商户测试）
- [ ] 不同业态（餐饮/零售/主力店）

---

## ⏳ 待完成工作 - 商户对比功能 (预计4小时)

### 第4步：创建商户选择器 (1小时)
**文件**: `components/compare/MerchantSelector.tsx`

**功能**:
- 搜索商户（按名称）
- 快速筛选（风险等级、业态）
- 多选商户（2-5个）
- 显示已选择和可选商户列表

### 第5步：创建对比逻辑 (1小时)
**文件**: `utils/merchantComparison.ts`

**功能**:
- `compareMerchants(merchants: Merchant[])` - 对比数据计算
- `generateInsights(comparison)` - 生成智能建议
- 数据格式化和排序

### 第6步：创建对比页面（简化版）(2小时)
**文件**: `app/compare/page.tsx`

**包含组件**:
- 基础信息对比表
- 雷达图（五维健康指标）
- 柱状图（月营收、租售比）
- 洞察与建议

**简化点**:
- 不做折线图（健康度趋势）
- 不做PDF导出（只做打印）
- 先做2-3个核心图表

### 第7步：添加导航入口 (30分钟)
- Sidebar添加"商户对比"菜单
- Health页面添加"对比"按钮

### 第8步：测试 (30分钟)
- 同业态对比测试
- 跨业态对比测试
- 打印功能测试

---

## 📁 新增文件清单

### 已创建 ✅
```
utils/smartPhotoClassifier.ts (550行) - 智能分类算法
docs/technical/indexeddb-schema.md - IndexedDB设计文档（保留）
docs/snapshots/SPRINT1-DASHBOARD-COMPLETE.md - Sprint1完成快照
```

### 已修改 ✅
```
components/inspection/ImageUploader.tsx (+130行)
  - 新增merchant prop
  - 新增AI建议状态管理
  - 新增AI建议UI卡片
  - 新增推荐标识
  - 新增快捷按钮
```

### 待创建 ⏳
```
components/compare/MerchantSelector.tsx (300行)
app/compare/page.tsx (600行)
utils/merchantComparison.ts (300行)
```

### 待修改 ⏳
```
components/layout/Sidebar.tsx - 添加"商户对比"菜单项
app/health/page.tsx - 添加"对比"按钮
```

---

## 🔧 技术要点

### 智能分类算法设计

**评分系统**:
- 每个分类（人/货/场）初始分数为0
- 各规则引擎累加评分
- 最高分的分类为推荐分类
- 置信度 = 最高分 / 总分

**规则权重示例**:
```typescript
// 开店检查
people: +40 (重点)
place: +30
merchandise: +20

// 高风险商户
place: +20
merchandise: +20

// 餐饮业态
place: +30
people: +20
merchandise: +10

// 总分 = 40 + 20 + 30 = 90
// people置信度 = (40 + 20) / 90 = 66.7%
```

### UI设计亮点

**AI建议卡片配色**:
- 背景：`bg-gradient-to-r from-purple-50 to-blue-50`
- 边框：`border-purple-200`
- 主色：`text-purple-900`
- 按钮：`bg-purple-600 hover:bg-purple-700`

**推荐标识**:
- 分类按钮：右上角紫色徽章
- 标签：内联紫色星星 + 评分百分比
- 图标：`Sparkles` (lucide-react)

---

## 🚀 恢复开发指引

### 在新窗口继续开发：

**1. 快速恢复上下文**:
```
读取此文件：docs/snapshots/QUICK-RESUME-PHOTO-CLASSIFICATION.md
```

**2. 开始开发商户对比功能**:
```
按照计划执行第4-8步：
1. 创建商户选择器 (1小时)
2. 创建对比逻辑 (1小时)
3. 创建对比页面 (2小时)
4. 添加导航入口 (30分钟)
5. 测试 (30分钟)
```

**3. 可参考的组件**:
- `components/IndustryBenchmark.tsx` - 同业态对比实现
- `components/HealthTrendChart.tsx` - 自定义SVG图表
- `app/health/page.tsx` - 商户列表和筛选实现

**4. 图表库 (Recharts)**:
```typescript
import { RadarChart, Radar, BarChart, Bar, LineChart, Line } from 'recharts';
```

---

## 📊 Git 信息

**最新提交**:
```
commit 02624c7
feat: 智能拍照分类建议功能

核心功能：
- 创建smartPhotoClassifier智能分类算法
- 增强ImageUploader组件
- AI建议卡片和推荐标识
- 一键采纳功能

4 files changed, 1266 insertions(+), 35 deletions(-)
```

**提交的文件**:
- M `components/inspection/ImageUploader.tsx`
- A `docs/snapshots/SPRINT1-DASHBOARD-COMPLETE.md`
- A `docs/technical/indexeddb-schema.md`
- A `utils/smartPhotoClassifier.ts`

**分支**: main
**状态**: 工作区干净，可安全切换

---

## 🎯 下一步行动

### 选项1：继续开发（推荐）
```bash
# 在新窗口运行
npm run dev

# 打开浏览器测试智能分类功能
http://localhost:3000/inspection

# 继续开发商户对比功能
# 按照第4-8步执行
```

### 选项2：测试验证
```bash
npm run dev

# 测试智能拍照分类：
1. 访问 /inspection 页面
2. 选择不同商户（高风险/低风险）
3. 拍照/上传照片
4. 观察AI建议是否符合预期
5. 测试"使用AI建议"按钮
```

### 选项3：部署上线
```bash
# Vercel部署
git push
# 访问 Vercel 控制台自动部署
```

---

## 💡 重要提示

**智能分类功能的使用**:
- ImageUploader组件需要传入 `merchant` prop 才能启用AI建议
- 如果没有传入merchant，组件仍可正常工作（手动分类）
- AI建议基于实时计算，无需后端

**待测试场景**:
- [ ] 不同时间段的建议（早上/晚上/中午）
- [ ] 不同风险等级商户的建议差异
- [ ] 不同业态的建议差异
- [ ] 连续拍多张照片的平衡建议

**已知问题**:
- 无

---

**保存时间**: 2026-01-30 12:15
**Token使用**: 103,706 / 200,000 (51.9%)
**状态**: ✅ 代码已提交，可以安全切换窗口
**恢复方式**: 读取此文件快速了解当前状态，继续开发商户对比功能
