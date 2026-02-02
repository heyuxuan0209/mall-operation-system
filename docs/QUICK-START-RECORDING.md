# 🎬 Part 1 录制 - 一键完成方案

**你不需要手动操作！** 只需运行几个命令，系统自动完成所有准备工作。

---

## ⚡ 方案：自动截图 + 指导录制

### 第1步：安装puppeteer（1分钟）

```bash
cd "/Users/heyuxuan/Desktop/Mall Operation Agent/mall-operation-system"
npm install --save-dev puppeteer
```

**等待安装完成**（会自动下载Chrome浏览器，约150MB）

---

### 第2步：运行自动截图脚本（2分钟）

```bash
node scripts/auto-screenshot.js
```

**脚本会自动**：
- ✅ 启动Chrome浏览器
- ✅ 访问所有关键页面
- ✅ 自动点击、滚动、截图
- ✅ 保存10张高清截图到 `docs/screenshots/part1/`
- ✅ 10秒后自动关闭浏览器

**预计耗时**: 1-2分钟

---

### 第3步：开始录制（10分钟）

**准备工作**（1分钟）:
1. 打开录屏软件（QuickTime/OBS/Loom）
2. 打开 `docs/RECORDING-SCRIPT-PART1.md`（详细脚本）
3. 打开 `docs/screenshots/part1/`（参考截图）
4. 访问 http://localhost:3000

**开始录制**（8-10分钟）:
- 按照 `RECORDING-SCRIPT-PART1.md` 的操作步骤
- 读旁白脚本（边操作边说）
- 对照截图确保画面一致
- 第一次可能需要10-15分钟，第二次5-8分钟

---

## 🎯 如果不想安装puppeteer

### 备用方案：手动截图（5分钟）

参考 `docs/SCREENSHOT-GUIDE-PART1.md`，使用快捷键手动截图：

**macOS快捷键**: `Cmd + Shift + 4 + 空格` → 点击浏览器窗口

**需要截10张图**:
1. 首页仪表板
2. 健康度分布图表
3. 待处理商户列表
4. 海底捞详情面板
5. AI诊断报告
6. 创建任务表单
7. 健康度监控列表
8. 商户对比页面
9. 蜀大侠帮扶档案
10. 措施有效性排行榜

---

## 📋 录制检查清单

### 录制前（5分钟）
- [ ] 开发服务器运行（`npm run dev`）
- [ ] 浏览器清除缓存
- [ ] 访问 localhost:3000 确认正常
- [ ] 截图已完成（10张）
- [ ] 录屏软件已启动并测试
- [ ] 脚本文档已打开
- [ ] 关闭所有通知

### 录制中（10分钟）
- [ ] 语速适中，清晰
- [ ] 鼠标移动缓慢，指示关键区域
- [ ] 关键数据停留2-3秒
- [ ] 按照脚本顺序操作
- [ ] 对照截图确认画面

### 录制后（5分钟）
- [ ] 检查视频完整性
- [ ] 检查音频清晰度
- [ ] 记录需要重录的片段
- [ ] 保存视频文件

---

## 🚀 快速命令汇总

```bash
# 1. 安装puppeteer
cd "/Users/heyuxuan/Desktop/Mall Operation Agent/mall-operation-system"
npm install --save-dev puppeteer

# 2. 运行自动截图
node scripts/auto-screenshot.js

# 3. 查看截图
open docs/screenshots/part1/

# 4. 打开录制脚本
open docs/RECORDING-SCRIPT-PART1.md

# 5. 访问演示系统
open http://localhost:3000
```

---

## 💡 录制技巧

### 语速
- 每分钟150-180字
- 关键数据处放慢

### 鼠标
- 移动缓慢清晰
- 圈出关键区域
- 悬停显示tooltip

### 停顿
- 页面加载时：剪辑时可删除
- 数据展示时：停留2-3秒
- 操作完成后：停留1秒再下一步

### 如果出错
- **小错误**：继续录制，后期剪辑
- **大错误**：暂停，记录时间点，稍后重录这一段

---

## 📦 交付物

录制完成后，你将得到：
- ✅ Part 1 原始录制视频（6-7分钟）
- ✅ 10张关键截图（可用于PPT）
- ✅ 完整操作脚本（可复用）

---

**预计总耗时**: 20-30分钟（首次）
**下次录制**: 10-15分钟

**准备好了吗？开始第1步吧！** 🎬
