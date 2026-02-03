# Vercel部署指南

## 📋 部署前检查清单

在开始部署之前，确保已完成以下配置：

- [x] ✅ `.env.production` 文件已创建
- [x] ✅ `next.config.ts` 已配置生产环境优化
- [x] ✅ `app/layout.tsx` 已更新元数据和组件
- [x] ✅ Demo组件已创建（WelcomeBanner, DemoFooter, DemoWatermark）
- [x] ✅ LICENSE.md 版权声明已添加

---

## 🚀 步骤1: 注册Vercel账号（仅需一次）

### 1.1 访问Vercel官网
打开浏览器，访问: **https://vercel.com**

### 1.2 使用GitHub登录
1. 点击右上角 **"Sign Up"** 或 **"Log In"**
2. 选择 **"Continue with GitHub"**
3. 授权Vercel访问你的GitHub账户
4. 完成账号创建

**注意**: 使用GitHub账号登录可以自动关联仓库，简化部署流程

---

## 📦 步骤2: 连接GitHub仓库

### 2.1 进入Vercel控制台
登录后，你会看到Vercel Dashboard（控制台）

### 2.2 创建新项目
1. 点击 **"Add New..."** 按钮
2. 选择 **"Project"**
3. 选择 **"Import Git Repository"**

### 2.3 选择仓库
1. 在列表中找到 `mall-operation-system` 仓库
2. 如果看不到仓库，点击 **"Adjust GitHub App Permissions"**
3. 授权Vercel访问该仓库
4. 点击 **"Import"**

---

## ⚙️ 步骤3: 配置项目设置

### 3.1 基本配置（自动检测）
Vercel会自动检测Next.js项目，预填以下配置：

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

**无需修改**，保持默认即可。

### 3.2 环境变量配置

点击 **"Environment Variables"** 展开环境变量配置区域。

添加以下环境变量：

| Key | Value | Environment |
|-----|-------|-------------|
| `NEXT_PUBLIC_ENV` | `production` | Production |
| `NEXT_PUBLIC_DEMO_MODE` | `true` | Production |
| `NEXT_PUBLIC_ENABLE_DEVTOOLS_DETECTION` | `true` | Production |

**操作步骤**:
1. 在 "Key" 输入框输入变量名
2. 在 "Value" 输入框输入变量值
3. 确保 "Production" 被勾选
4. 点击 **"Add"** 添加
5. 重复以上步骤添加其他变量

### 3.3 自定义域名（可选）

默认Vercel会分配一个免费域名: `your-project-xxx.vercel.app`

如果想自定义域名前缀:
1. 在项目名称处输入: `merchant-smartops` 或其他你喜欢的名字
2. 最终域名示例: `merchant-smartops.vercel.app`

**注意**: 自定义域名（如 .com）需要额外配置DNS，暂时不推荐。

---

## 🎯 步骤4: 开始部署

### 4.1 点击Deploy按钮
确认所有配置正确后，点击 **"Deploy"** 按钮

### 4.2 等待构建完成
- 部署过程通常需要 **3-5分钟**
- 你会看到实时构建日志
- 进度条显示：Installing → Building → Deploying

### 4.3 查看部署状态
- ✅ **绿色勾号**: 部署成功
- ❌ **红色叉号**: 部署失败（查看日志排查错误）

### 4.4 获取部署链接
部署成功后，你会看到：

```
🎉 Your project has been deployed!

Visit: https://your-project-xxx.vercel.app
```

**立即测试**: 点击链接，验证网站是否正常运行

---

## ✅ 步骤5: 验证部署成功

### 5.1 功能测试清单

访问部署的网站，逐项测试以下功能：

- [ ] 首页加载正常，看到欢迎横幅
- [ ] 18个商户数据正确显示
- [ ] 点击任意商户，查看详情页
- [ ] AI诊断功能可以正常使用
- [ ] 巡检记录可以添加和查看
- [ ] 健康度图表正常渲染
- [ ] 移动端（手机浏览器）显示正常
- [ ] 页面底部看到版权声明
- [ ] 右下角显示Demo水印

### 5.2 性能检查

**使用Chrome DevTools Lighthouse**:
1. 按 F12 打开开发者工具
2. 切换到 "Lighthouse" 标签
3. 选择 "Performance" 和 "Best Practices"
4. 点击 "Analyze page load"
5. 确保Performance分数 > 80

### 5.3 跨浏览器测试

在以下浏览器中测试：
- [ ] Chrome / Edge（推荐）
- [ ] Safari（Mac用户）
- [ ] Firefox
- [ ] 移动端浏览器（iOS Safari / Android Chrome）

---

## 🔄 步骤6: 配置自动部署

**好消息**: Vercel已自动配置好自动部署！

### 6.1 自动部署工作流程

```bash
# 你修改代码后
git add .
git commit -m "优化XXX功能"
git push origin main

# Vercel自动触发（无需任何手动操作）
# 1. 检测到GitHub仓库push事件
# 2. 自动拉取最新代码
# 3. 自动执行 npm run build
# 4. 自动部署到生产环境
# 5. 30-60秒后网站更新完成
```

### 6.2 验证自动部署

**测试步骤**:
1. 修改一个小改动（如修改首页标题）
2. `git commit` 并 `git push`
3. 前往Vercel Dashboard查看部署状态
4. 等待部署完成（通常30-60秒）
5. 刷新网站，确认修改已生效

### 6.3 查看部署历史

在Vercel Dashboard中：
1. 点击你的项目
2. 查看 "Deployments" 标签
3. 看到每次部署的记录、状态、时间
4. 可以回滚到任意历史版本

---

## 📊 步骤7: 监控和优化

### 7.1 查看访问统计

Vercel提供基础访问统计：
1. 进入项目Dashboard
2. 点击 "Analytics" 标签
3. 查看访问量、页面加载时间等数据

### 7.2 查看构建日志

如果部署失败：
1. 点击失败的部署记录
2. 查看 "Build Logs"
3. 找到错误信息
4. 修复后重新push

### 7.3 性能优化建议

如果页面加载慢：
- 检查图片大小（使用Next.js Image组件优化）
- 减少不必要的依赖
- 启用Next.js静态生成（SSG）

---

## 🎨 步骤8: 分享链接

### 8.1 获取最终Demo链接

部署成功后，你的Demo链接是：
```
https://merchant-smartops.vercel.app
```

### 8.2 添加到简历

**简历项目经验示例**:
```markdown
商户智运Agent - AI驱动的商户健康管理系统
- 技术栈: Next.js + React + TypeScript + AI
- 在线体验: https://merchant-smartops.vercel.app
- 成果: 晨会效率提升96%，帮扶成功率提升60%
```

### 8.3 创建短链接（可选）

使用工具如 bit.ly 或 tinyurl.com 创建短链接：
- 原链接: `https://merchant-smartops.vercel.app`
- 短链接: `https://bit.ly/mall-smartops`

**优势**: 简历中更简洁，面试时口头说明更方便

### 8.4 生成二维码（可选）

使用在线工具生成二维码：
1. 访问 https://www.qrcode-monkey.com/
2. 输入Demo链接
3. 下载高清二维码图片
4. 可打印在纸质简历上，方便面试官扫码体验

---

## 🛠️ 常见问题排查

### Q1: 部署失败，提示"Build Error"
**解决方法**:
1. 检查本地是否能成功运行 `npm run build`
2. 查看Vercel构建日志，找到具体错误
3. 常见错误：TypeScript类型错误、依赖缺失

### Q2: 部署成功但页面空白
**解决方法**:
1. 按F12打开控制台，查看错误信息
2. 检查环境变量是否正确配置
3. 检查路由配置是否正确

### Q3: 环境变量未生效
**解决方法**:
1. 确保在Vercel中添加了环境变量
2. 重新部署项目（点击"Redeploy"）
3. 环境变量名必须以 `NEXT_PUBLIC_` 开头才能在浏览器中访问

### Q4: 自动部署未触发
**解决方法**:
1. 确认GitHub仓库已正确关联
2. 检查Vercel的GitHub App权限
3. 手动在Vercel Dashboard中触发部署

### Q5: 部署后样式丢失
**解决方法**:
1. 检查Tailwind CSS配置是否正确
2. 确保 `postcss.config.js` 和 `tailwind.config.ts` 存在
3. 清除Vercel缓存并重新部署

---

## 📝 部署后待办事项

- [ ] 测试所有核心功能
- [ ] 跨浏览器测试
- [ ] 移动端测试
- [ ] 性能优化（Lighthouse分数 > 80）
- [ ] 添加Demo链接到简历
- [ ] 准备面试演示话术
- [ ] 制作一页纸项目说明（PDF）
- [ ] 准备技术问题答案

---

## 🎯 下一步行动

部署成功后，继续完成以下任务：

### Day 4-5: 配套材料准备
- [ ] 制作一页纸项目说明（PDF）
- [ ] 更新简历，添加Demo链接
- [ ] 准备3分钟口头介绍话术
- [ ] 准备常见面试问题答案

### Day 6-7: 测试和完善
- [ ] 邀请朋友内测反馈
- [ ] 修复发现的问题
- [ ] 优化用户体验
- [ ] 准备演示视频（可选）

---

## 📞 需要帮助？

如果遇到部署问题：
1. 查看Vercel官方文档: https://vercel.com/docs
2. 搜索Vercel社区: https://github.com/vercel/vercel/discussions
3. 检查本项目的GitHub Issues

---

**祝部署顺利！🚀**

部署完成后，你就有了一个专业的在线Demo，可以自信地展示给面试官了！
