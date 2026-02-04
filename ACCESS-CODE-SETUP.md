# 访问码保护设置指南

## 📋 功能说明

已为项目添加访问码保护功能，访问者需要输入正确的访问码才能查看网站内容。

## 🎯 特性

- ✅ 全站访问保护
- ✅ 美观的访问码输入页面
- ✅ Cookie 记忆功能（30天有效期）
- ✅ 自动重定向到原访问页面
- ✅ 安全的服务端验证

## 🔧 Vercel 部署配置

### 步骤 1: 登录 Vercel Dashboard

访问 https://vercel.com 并登录你的账号

### 步骤 2: 进入项目设置

1. 选择你的项目 `mall-operation-system`
2. 点击顶部导航栏的 **Settings**
3. 在左侧菜单选择 **Environment Variables**

### 步骤 3: 添加访问码环境变量

添加以下环境变量：

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `ACCESS_CODE` | `你的访问码` | Production |

**重要提示**：
- 变量名必须是 `ACCESS_CODE`（不要加 `NEXT_PUBLIC_` 前缀）
- 建议使用复杂一点的访问码，例如：`Resume2026!` 或 `MyPortfolio@2026`
- 默认访问码是 `demo2026`（如果不设置环境变量）

### 步骤 4: 重新部署

添加环境变量后，需要重新部署：

1. 进入 **Deployments** 页面
2. 点击最新部署右侧的 **...** 菜单
3. 选择 **Redeploy**
4. 确认重新部署

或者，直接推送新的代码到 GitHub，会自动触发部署。

## 📱 使用方法

### 访问者体验

1. 访问你的网站（例如：`https://your-project.vercel.app`）
2. 自动跳转到访问码输入页面
3. 输入正确的访问码
4. 验证成功后，自动跳转到原访问页面
5. 30天内无需再次输入（Cookie 记忆）

### 分享给他人

当你把网站链接放在简历上时，可以这样说明：

```
在线演示：https://your-project.vercel.app
访问码：[你设置的访问码]
```

或者在面试时口头告知访问码。

## 🔒 安全说明

### 已实现的安全措施

1. **服务端验证**：访问码在服务器端验证，不会暴露在客户端代码中
2. **HttpOnly Cookie**：使用 HttpOnly cookie 存储验证状态，防止 XSS 攻击
3. **环境变量保护**：访问码存储在环境变量中，不会提交到 Git
4. **代理层拦截**：使用 Next.js Proxy 在请求到达页面前进行验证

### 注意事项

- 访问码不是高强度的安全措施，主要用于简历展示场景
- 如果需要更高的安全性，建议使用 Vercel 的 Password Protection（需要付费计划）
- 定期更换访问码以提高安全性

## 🎨 自定义访问码页面

访问码输入页面位于：`app/access-verify/page.tsx`

你可以自定义：
- 页面标题和描述
- 颜色主题
- Logo 图标
- 提示文字

## 🧪 本地测试

### 测试访问码保护

```bash
# 1. 设置环境变量
export ACCESS_CODE="your-test-code"

# 2. 构建生产版本
npm run build

# 3. 启动生产服务器
npm run start

# 4. 访问 http://localhost:3000
# 应该会看到访问码输入页面
```

### 测试不同的访问码

```bash
# 修改 .env.production 文件中的 ACCESS_CODE
# 然后重新构建和启动
```

## 📂 相关文件

### 核心文件

- `proxy.ts` - 访问码验证代理（拦截所有请求）
- `app/access-verify/page.tsx` - 访问码输入页面
- `app/api/verify-access/route.ts` - 访问码验证 API
- `.env.production` - 生产环境配置（包含默认访问码）

### 工作原理

```
用户访问 → proxy.ts 拦截 → 检查 Cookie
                              ↓
                         Cookie 有效？
                         ↓         ↓
                        是         否
                         ↓         ↓
                    允许访问   重定向到访问码页面
                                  ↓
                            用户输入访问码
                                  ↓
                         API 验证 (route.ts)
                                  ↓
                            设置 Cookie
                                  ↓
                         重定向到原页面
```

## 🔄 更新访问码

### 在 Vercel 上更新

1. 进入项目的 **Settings** → **Environment Variables**
2. 找到 `ACCESS_CODE` 变量
3. 点击右侧的 **Edit** 按钮
4. 输入新的访问码
5. 点击 **Save**
6. 重新部署项目

### 更新后的影响

- 已登录的用户（有旧 Cookie）将无法继续访问
- 需要使用新访问码重新验证
- 建议在更新前通知相关人员

## ❓ 常见问题

### Q: 忘记了访问码怎么办？

A: 访问码存储在 Vercel 的环境变量中，登录 Vercel Dashboard 查看即可。

### Q: 可以设置多个访问码吗？

A: 当前实现只支持单个访问码。如需多个访问码，需要修改 `app/api/verify-access/route.ts` 文件。

### Q: 访问码页面可以自定义吗？

A: 可以，编辑 `app/access-verify/page.tsx` 文件即可自定义样式和文案。

### Q: Cookie 过期后会怎样？

A: Cookie 有效期为 30 天，过期后用户需要重新输入访问码。

### Q: 可以临时禁用访问码保护吗？

A: 可以，在 Vercel 环境变量中删除 `ACCESS_CODE` 变量，或者临时删除 `proxy.ts` 文件后重新部署。

## 📞 技术支持

如遇到问题，请检查：

1. Vercel 环境变量是否正确设置
2. 部署是否成功完成
3. 浏览器控制台是否有错误信息
4. Cookie 是否被浏览器阻止

## 🎉 完成

现在你的作品集网站已经有访问码保护了！

**下一步**：
1. 在 Vercel 上设置你的访问码
2. 测试访问码功能
3. 在简历上添加网站链接和访问码说明

---

**创建时间**: 2026-02-04
**版本**: v1.0
