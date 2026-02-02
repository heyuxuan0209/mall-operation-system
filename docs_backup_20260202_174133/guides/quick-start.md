# 🚀 快速测试指南

## 一键开始测试（最简单）

### 方法 1: 使用测试助手页面

1. **打开测试助手**
   ```bash
   open test-helper.html
   ```
   或者直接双击文件打开

2. **点击按钮开始测试**
   - "清空测试数据" → 清空旧数据
   - "打开巡检页面" → 打开测试页面
   - "运行验证脚本" → 自动验证逻辑

### 方法 2: 使用自动化脚本

1. **访问测试页面**
   ```
   http://localhost:3000/inspection
   ```

2. **打开控制台** (F12 或 Cmd+Opt+I)

3. **复制粘贴以下代码并运行**

```javascript
// 步骤 1: 加载测试工具
const script1 = document.createElement('script');
script1.src = '/docs/test-data-generator.js';
document.head.appendChild(script1);

const script2 = document.createElement('script');
script2.src = '/docs/auto-test.js';
document.head.appendChild(script2);

// 等待脚本加载
setTimeout(() => {
  console.log('✓ 测试工具已加载');
  console.log('\n运行以下命令开始测试:');
  console.log('  autoTest.runAll()          - 自动化测试');
  console.log('  testData.quickSetup()      - 生成测试数据');
}, 1000);
```

---

## 快速验证（5分钟）

### 检查清单

1. **打开页面**
   - [ ] http://localhost:3000/inspection 可访问
   - [ ] 页面正常显示，无错误

2. **签到功能**
   - [ ] 点击"一键签到"按钮
   - [ ] 显示签到成功信息
   - [ ] 显示商户画像卡片

3. **照片分类**
   - [ ] 点击"选择图片"上传一张照片
   - [ ] 自动弹出分类选择弹窗
   - [ ] 可以选择"场（环境）"分类
   - [ ] 可以选择标签（如"环境整洁"）
   - [ ] 点击"确认"后照片出现在列表中

4. **快速评分**
   - [ ] 点击预设"优秀"按钮
   - [ ] 滑块自动调整
   - [ ] 可以手动拖动滑块

5. **保存记录**
   - [ ] 点击"保存巡店记录"按钮
   - [ ] 弹出反馈弹窗
   - [ ] 显示健康度变化
   - [ ] 显示改进亮点和关注点

**如果以上全部完成** → ✅ 基本功能正常！

---

## 使用测试数据生成器

### 在浏览器控制台运行

```javascript
// 生成正常场景数据
testData.quickSetup('normal');

// 生成优秀场景数据
testData.quickSetup('excellent');

// 生成问题场景数据
testData.quickSetup('problems');

// 生成混合场景数据
testData.quickSetup('mixed');

// 生成多条记录（模拟历史数据）
testData.generateMultipleRecords(5);

// 查看数据统计
testData.showStats();

// 清空所有数据
testData.clearAll();
```

---

## 使用自动化测试

### 在浏览器控制台运行

```javascript
// 运行所有自动化测试
autoTest.runAll();

// 查看测试报告
// （自动显示，包含通过/失败统计）
```

### 测试覆盖

自动化测试会验证：
- ✅ 页面基础元素存在
- ✅ LocalStorage 数据结构
- ✅ 健康度计算逻辑（4个测试用例）
- ✅ 照片分类数据结构
- ✅ 反馈生成逻辑
- ✅ 性能指标

---

## 测试场景示例

### 场景 A: 发现严重问题

```javascript
// 1. 生成问题场景数据
testData.quickSetup('problems');

// 2. 手动操作测试页面
// - 签到
// - 上传3张照片（标记为严重）
// - 评分全部低分（30-40）
// - 保存

// 3. 验证结果
// - 健康度应该大幅下降
// - 反馈弹窗显示多个严重问题
// - 关注点列表较长
```

### 场景 B: 表现优秀

```javascript
// 1. 生成优秀场景数据
testData.quickSetup('excellent');

// 2. 手动操作
// - 签到
// - 上传3张照片（标记为良好）
// - 评分全部高分（85-90）
// - 保存

// 3. 验证结果
// - 健康度应该上升
// - 改进亮点列表较长
// - 关注点较少或没有
```

---

## 快速查看数据

### 在浏览器控制台运行

```javascript
// 查看所有巡检记录
console.table(JSON.parse(localStorage.getItem('inspection_records')));

// 查看最新记录详情
const records = JSON.parse(localStorage.getItem('inspection_records'));
console.log('最新记录:', records[0]);

// 查看照片数据
const latestRecord = JSON.parse(localStorage.getItem('inspection_records'))[0];
console.log('照片:', latestRecord.photos);
console.log('问题:', latestRecord.issues);

// 查看商户健康度
const merchants = JSON.parse(localStorage.getItem('merchants'));
console.log('商户健康度:', merchants[0].totalScore);
console.log('风险等级:', merchants[0].riskLevel);

// 计算存储使用量
let total = 0;
for(let x in localStorage) {
  if(localStorage.hasOwnProperty(x)) {
    total += localStorage[x].length;
  }
}
console.log('LocalStorage 使用:', (total/1024).toFixed(2), 'KB');
```

---

## 常见问题

### Q: 照片无法上传？
A: 检查文件大小是否超过 2MB，尝试更小的图片。

### Q: 分类弹窗不出现？
A: 检查控制台是否有错误，刷新页面重试。

### Q: 保存后数据丢失？
A: 检查 LocalStorage 是否被清空，查看控制台错误。

### Q: 健康度计算不对？
A: 运行 `autoTest.testHealthScoreCalculation()` 验证逻辑。

### Q: 测试助手页面打不开？
A: 确保文件路径正确，使用 `open test-helper.html` 命令。

---

## 测试工具文件

所有测试工具位于项目根目录和 docs 文件夹：

```
mall-operation-system/
├── test-helper.html              # 测试助手页面
└── docs/
    ├── test-data-generator.js    # 数据生成器
    ├── auto-test.js              # 自动化测试
    ├── phase5-e2e-testing-guide.md   # 详细测试指南
    ├── phase5-validation-script.js   # 验证脚本
    └── QUICK-START.md            # 本文档
```

---

## 下一步

### 完成快速验证后

1. **如果一切正常**
   - 继续完整的 6 个场景测试
   - 参考: `docs/phase5-e2e-testing-guide.md`

2. **如果发现问题**
   - 记录问题详情（截图、控制台日志）
   - 评估严重程度（高/中/低）
   - 创建 Bug 清单

3. **测试移动端**
   - Chrome DevTools → Device Mode (Ctrl+Shift+M)
   - 选择 iPhone 12 Pro
   - 重复基本测试流程

---

## 快捷命令速查表

```javascript
// 测试数据
testData.quickSetup()              // 生成测试数据
testData.quickSetup('problems')    // 生成问题场景
testData.showStats()               // 查看统计
testData.clearAll()                // 清空数据

// 自动化测试
autoTest.runAll()                  // 运行所有测试

// 查看数据
console.table(JSON.parse(localStorage.getItem('inspection_records')))
```

---

## 联系与反馈

测试完成后，请记录：
- ✅ 通过的功能
- ❌ 失败的功能
- ⚠️  发现的问题
- 💡 改进建议

---

**准备好了吗？开始测试吧！** 🚀

访问: http://localhost:3000/inspection
或运行: `open test-helper.html`
