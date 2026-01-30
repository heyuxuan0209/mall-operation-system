# IndexedDB Schema 设计

**版本**: 1.0
**创建日期**: 2026-01-30
**目的**: 解决localStorage容量限制（5-10MB → 无限制）

## 数据库信息

```typescript
数据库名称: mallOperationDB
当前版本: 1
支持的浏览器: Chrome, Firefox, Safari, Edge (现代浏览器)
```

## ObjectStores 设计

### 1. merchants (商户数据)

**用途**: 存储所有商户的基础信息和健康度数据

```typescript
ObjectStore: merchants
主键: id (string, auto-generated)
索引:
  - riskLevel (non-unique) - 用于按风险等级查询
  - status (non-unique) - 用于按经营状态查询
  - updatedAt (non-unique) - 用于按更新时间排序
  - category (non-unique) - 用于按业态分类查询

数据结构: Merchant (types/index.ts)
```

**索引用途**:
- `riskLevel`: 快速查询特定风险等级的商户（如驾驶舱超期预警）
- `status`: 过滤经营中/闭店/装修的商户
- `updatedAt`: 按最近更新排序
- `category`: 业态分析和统计

---

### 2. tasks (帮扶任务)

**用途**: 存储所有帮扶任务的数据

```typescript
ObjectStore: tasks
主键: id (string, auto-generated)
索引:
  - merchantId (non-unique) - 查询某商户的所有任务
  - status (non-unique) - 查询特定状态的任务
  - priority (non-unique) - 按优先级查询
  - deadline (non-unique) - 按截止日期排序
  - assignedTo (non-unique) - 查询分配给某人的任务
  - stage (non-unique) - 按工作流阶段查询

数据结构: Task (types/index.ts)
```

**索引用途**:
- `merchantId`: 在商户详情页显示该商户的任务
- `status`: 统计待办/进行中/已完成任务
- `priority`: 紧急任务优先显示
- `deadline`: 超期预警和排序
- `assignedTo`: 个人任务列表
- `stage`: 工作流进度追踪

---

### 3. inspection_records (巡检记录)

**用途**: 存储所有完成的巡检记录

```typescript
ObjectStore: inspection_records
主键: id (string, auto-generated)
索引:
  - merchantId (non-unique) - 查询某商户的巡检历史
  - inspectorId (non-unique) - 查询某巡检员的所有巡检
  - createdAt (non-unique) - 按时间排序
  - [merchantId, createdAt] (compound, non-unique) - 组合查询

数据结构: InspectionRecord (types/index.ts)
```

**索引用途**:
- `merchantId`: 显示商户的巡检历史
- `inspectorId`: 巡检员排行榜统计
- `createdAt`: 时间范围查询（今日/本周/本月）
- 复合索引: 查询某商户在特定时间段的巡检

---

### 4. inspection_drafts (巡检草稿)

**用途**: 存储未完成的巡检草稿（批量巡检模式）

```typescript
ObjectStore: inspection_drafts
主键: [merchantId, inspectorId] (compound key)
索引:
  - inspectorId (non-unique) - 查询某巡检员的所有草稿
  - updatedAt (non-unique) - 按更新时间排序

数据结构:
{
  merchantId: string;
  inspectorId: string;
  draftData: Partial<InspectionRecord>;
  updatedAt: string;
}
```

**索引用途**:
- 复合主键: 每个巡检员对每个商户只有一个草稿
- `inspectorId`: 列出巡检员的所有草稿
- `updatedAt`: 清理过期草稿

---

### 5. inspection_policies (巡检策略)

**用途**: 存储不同风险等级的巡检频率策略

```typescript
ObjectStore: inspection_policies
主键: id (string)
索引:
  - riskLevel (unique) - 每个风险等级唯一策略
  - enabled (non-unique) - 查询启用的策略

数据结构: InspectionPolicy (types/index.ts)
```

**索引用途**:
- `riskLevel`: 快速获取特定风险等级的策略
- `enabled`: 只查询启用的策略

---

### 6. cases (知识库案例)

**用途**: 存储帮扶案例知识库

```typescript
ObjectStore: cases
主键: id (string, auto-generated)
索引:
  - industry (non-unique) - 按业态查询
  - tags (multiEntry, non-unique) - 按标签查询
  - createdAt (non-unique) - 按创建时间排序

数据结构: Case (types/index.ts)
```

**索引用途**:
- `industry`: 查询特定业态的案例
- `tags`: 多标签搜索（multiEntry支持数组）
- `createdAt`: 最新案例排序

---

### 7. notifications (通知)

**用途**: 存储应用通知

```typescript
ObjectStore: notifications
主键: id (string, auto-generated)
索引:
  - type (non-unique) - 按通知类型查询
  - read (non-unique) - 未读通知查询
  - createdAt (non-unique) - 按时间排序
  - taskId (non-unique) - 查询任务相关通知

数据结构: AppNotification (types/index.ts)
```

**索引用途**:
- `type`: 按类型过滤通知
- `read`: 快速获取未读通知数量
- `createdAt`: 按时间倒序显示
- `taskId`: 任务详情页显示相关通知

---

### 8. media_attachments (媒体附件)

**用途**: 存储图片、音频等大文件（Blob对象）

```typescript
ObjectStore: media_attachments
主键: id (string, auto-generated)
索引:
  - type (non-unique) - 区分图片/音频
  - createdAt (non-unique) - 按时间排序
  - size (non-unique) - 按大小排序（用于存储优化）

数据结构:
{
  id: string;
  type: 'image' | 'audio';
  blob: Blob;              // 原始Blob对象
  mimeType: string;
  size: number;            // 字节大小
  thumbnail?: Blob;        // 缩略图（仅图片）
  duration?: number;       // 音频时长
  metadata: {
    merchantId?: string;
    inspectionId?: string;
    uploadedBy?: string;
  };
  createdAt: string;
}
```

**索引用途**:
- `type`: 分别统计图片和音频数量
- `createdAt`: 清理旧文件
- `size`: 存储空间管理

---

### 9. app_settings (应用设置)

**用途**: 存储应用配置和用户偏好

```typescript
ObjectStore: app_settings
主键: key (string)
无索引

数据结构:
{
  key: string;  // 例如: 'notificationSettings', 'theme', 'language'
  value: any;   // JSON序列化的值
  updatedAt: string;
}
```

**常用配置键**:
- `notificationSettings`: NotificationSettings
- `theme`: 'light' | 'dark'
- `language`: 'zh-CN' | 'en-US'
- `migrationVersion`: number (追踪数据迁移状态)

---

### 10. batch_inspection_status (批量巡检状态)

**用途**: 存储批量巡检模式的进度状态

```typescript
ObjectStore: batch_inspection_status
主键: inspectorId (string)
无索引

数据结构:
{
  inspectorId: string;
  merchantIds: string[];      // 商户列表
  currentIndex: number;       // 当前位置
  completedIds: string[];     // 已完成
  draftIds: string[];         // 有草稿
  updatedAt: string;
}
```

---

## 版本管理策略

### 版本 1 (初始版本)
- 创建所有基础ObjectStores
- 创建所有索引
- 从localStorage迁移数据

### 未来版本升级示例

```typescript
// 版本 2: 添加新索引
if (oldVersion < 2) {
  const merchantStore = transaction.objectStore('merchants');
  merchantStore.createIndex('category', 'category', { unique: false });
}

// 版本 3: 添加新ObjectStore
if (oldVersion < 3) {
  db.createObjectStore('analytics_reports', { keyPath: 'id' });
}
```

---

## 数据大小估算

| ObjectStore | 预计记录数 | 单条大小 | 总大小估算 |
|------------|----------|---------|-----------|
| merchants | 100 | 2 KB | 200 KB |
| tasks | 500 | 1 KB | 500 KB |
| inspection_records | 5,000 | 3 KB | 15 MB |
| inspection_drafts | 50 | 2 KB | 100 KB |
| inspection_policies | 5 | 0.5 KB | 2.5 KB |
| cases | 200 | 1 KB | 200 KB |
| notifications | 1,000 | 0.5 KB | 500 KB |
| media_attachments | 2,000 | 150 KB | 300 MB |
| app_settings | 10 | 1 KB | 10 KB |
| batch_inspection_status | 5 | 5 KB | 25 KB |
| **总计** | | | **≈316 MB** |

**对比**:
- localStorage限制: 5-10 MB
- IndexedDB容量: 浏览器可用空间的50%（通常数GB）
- 容量提升: **30x - 300x**

---

## 性能优化建议

### 1. 索引设计原则
- ✅ 为常用查询创建索引
- ✅ 复合索引用于多字段查询
- ❌ 避免过多索引（影响写入性能）

### 2. 批量操作
```typescript
// ✅ 好：使用事务批量写入
const tx = db.transaction(['merchants'], 'readwrite');
merchants.forEach(m => tx.objectStore('merchants').put(m));
await tx.complete;

// ❌ 差：逐个写入
for (const m of merchants) {
  await db.put('merchants', m);
}
```

### 3. 媒体文件优化
- 图片压缩至 <200KB
- 音频使用压缩格式
- 缩略图单独存储
- 定期清理旧文件

### 4. 查询优化
- 使用索引范围查询（IDBKeyRange）
- 限制返回结果数量
- 使用游标分页加载

---

## 浏览器兼容性

| 浏览器 | 版本要求 | IndexedDB版本 | 备注 |
|--------|---------|--------------|------|
| Chrome | ≥24 | v2 | ✅ 完全支持 |
| Firefox | ≥16 | v2 | ✅ 完全支持 |
| Safari | ≥10 | v2 | ✅ 完全支持 |
| Edge | ≥12 | v2 | ✅ 完全支持 |
| IE | ≥10 | v1 | ⚠️ 部分支持（不推荐） |

**降级方案**:
- 检测IndexedDB支持性
- 不支持时回退到localStorage
- 显示警告提示用户升级浏览器

---

## 安全性考虑

### 1. 数据加密
- 敏感数据（如密码）加密存储
- 使用Web Crypto API

### 2. 数据隔离
- 每个域名独立数据库
- 跨域无法访问

### 3. 数据清理
- 用户登出时清空敏感数据
- 定期清理过期数据

---

## 迁移计划

### Phase 1: 创建IndexedDB服务
- [ ] 实现数据库初始化
- [ ] 实现CRUD操作
- [ ] 实现事务管理

### Phase 2: 数据迁移
- [ ] 创建迁移脚本
- [ ] 从localStorage读取数据
- [ ] 写入IndexedDB
- [ ] 数据验证

### Phase 3: 代码重构
- [ ] 更新所有Service层
- [ ] 更新页面组件
- [ ] 保持API兼容性

### Phase 4: 测试与发布
- [ ] 功能测试
- [ ] 性能测试
- [ ] 浏览器兼容性测试
- [ ] 文档更新

---

**下一步**: 创建 `utils/indexedDBService.ts` 实现数据库操作
