# 通义千问（Qwen）API 配置指南

## 概述

通义千问是阿里云提供的大语言模型服务，符合国内合规要求。本指南介绍如何在AI助手中配置通义千问API。

## 为什么选择通义千问？

1. **国内合规**：符合中国数据安全和隐私保护法规
2. **成本优势**：相比国际LLM服务，定价更具竞争力
3. **低延迟**：国内服务器，响应速度更快
4. **OpenAI兼容**：支持OpenAI API格式，迁移成本低

## 配置步骤

### 1. 注册阿里云账号

访问 [阿里云官网](https://www.aliyun.com/) 并完成以下步骤：
- 注册账号
- 完成实名认证（个人或企业）

### 2. 开通DashScope服务

1. 访问 [DashScope控制台](https://dashscope.console.aliyun.com/)
2. 点击"开通DashScope"
3. 选择计费方式：
   - **按量付费**：适合开发测试，按实际使用量计费
   - **资源包**：适合生产环境，预付费享受折扣

### 3. 创建API Key

1. 进入 [API Key管理页面](https://dashscope.console.aliyun.com/apiKey)
2. 点击"创建新的API Key"
3. 复制生成的API Key（格式：`sk-xxxxx`）
4. **重要**：API Key只显示一次，请妥善保存

### 4. 选择模型

通义千问提供多个模型，根据需求选择：

| 模型 | 输入价格 | 输出价格 | 适用场景 |
|------|---------|---------|---------|
| `qwen-turbo` | ¥0.002/千tokens | ¥0.006/千tokens | 日常对话、快速响应 |
| `qwen-plus` | ¥0.004/千tokens | ¥0.012/千tokens | 推荐方案、复杂分析 |
| `qwen-max` | ¥0.04/千tokens | ¥0.12/千tokens | 深度研究、专业领域 |

**推荐**：开发环境使用 `qwen-turbo`，生产环境使用 `qwen-plus`

### 5. 配置环境变量

复制 `.env.local.template` 为 `.env.local`：

```bash
cp .env.local.template .env.local
```

编辑 `.env.local` 文件，添加以下配置：

```bash
# 选择通义千问作为LLM提供商
NEXT_PUBLIC_LLM_PROVIDER=qwen

# 填写您的API Key
NEXT_PUBLIC_QWEN_API_KEY=sk-your_dashscope_api_key_here

# 选择模型
NEXT_PUBLIC_LLM_MODEL=qwen-plus

# 通义千问OpenAI兼容端点（通常不需要修改）
NEXT_PUBLIC_QWEN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1

# 可选：调整生成参数
NEXT_PUBLIC_LLM_MAX_TOKENS=2000
NEXT_PUBLIC_LLM_TEMPERATURE=0.7
```

### 6. 重启开发服务器

```bash
# 停止当前服务器（Ctrl+C）
npm run dev
```

### 7. 验证配置

在AI助手中输入测试消息：

```
给海底捞推荐帮扶方案
```

**预期结果**：
- 响应时间：3-5秒
- 消息元数据显示：`dataSource: hybrid` 和 `llmModel: qwen-plus`
- 生成个性化方案（包含问题分析、具体措施、效果预测）

## 成本估算

基于AI助手的典型使用场景：

### 单次查询成本

| 操作类型 | 平均Tokens | qwen-turbo | qwen-plus | qwen-max |
|---------|-----------|-----------|-----------|---------|
| 健康度查询 | 0（使用Skills） | ¥0 | ¥0 | ¥0 |
| 风险诊断 | 0（使用Skills） | ¥0 | ¥0 | ¥0 |
| 方案推荐 | ~2000 | ¥0.008 | ¥0.016 | ¥0.16 |
| 复杂对话 | ~1000 | ¥0.004 | ¥0.008 | ¥0.08 |

### 月度成本估算（100个商户）

假设每天：
- 10次健康度查询（免费，使用Skills）
- 5次方案推荐（使用LLM）
- 3次复杂对话（使用LLM）

**qwen-turbo**: ~¥12/月
**qwen-plus**: ~¥24/月
**qwen-max**: ~¥240/月

## 与OpenAI/Anthropic对比

| 维度 | Qwen | OpenAI | Anthropic |
|------|------|--------|-----------|
| **合规性** | ✅ 国内合规 | ⚠️ 需备案 | ⚠️ 需备案 |
| **成本** | ¥0.004/千tokens | $0.01/千tokens (¥0.07) | $0.015/千tokens (¥0.1) |
| **延迟** | ~500ms（国内） | ~1500ms | ~1500ms |
| **语言能力** | 🇨🇳 中文优秀 | 🇬🇧 英文优秀 | 🇬🇧 英文优秀 |
| **API兼容** | ✅ OpenAI格式 | ✅ 标准 | ⚠️ 特殊格式 |

## 常见问题

### Q1: API Key无效或认证失败

**解决方案**：
1. 确认API Key格式正确（`sk-`开头）
2. 检查DashScope服务是否已开通
3. 确认账户余额充足或资源包未用尽
4. 检查API Key是否已删除或过期

### Q2: 响应速度慢

**解决方案**：
1. 检查网络连接（国内访问应该很快）
2. 降低 `NEXT_PUBLIC_LLM_MAX_TOKENS` 参数（如1000）
3. 切换到 `qwen-turbo` 模型（速度更快）

### Q3: 返回内容质量不佳

**解决方案**：
1. 升级到 `qwen-plus` 或 `qwen-max` 模型
2. 调整 `temperature` 参数（0.7 → 0.5 更稳定，0.7 → 0.9 更有创意）
3. 检查prompt设计（在 `llm-integration.ts` 中）

### Q4: 成本超出预算

**解决方案**：
1. 启用缓存（默认已启用，30分钟TTL）
2. 限制LLM使用场景（只在必要时调用）
3. 使用混合模式（Skills + LLM）而非纯LLM
4. 购买资源包享受折扣

### Q5: 如何切换回OpenAI/Anthropic？

只需修改 `.env.local` 中的 `NEXT_PUBLIC_LLM_PROVIDER`：

```bash
# 切换到OpenAI
NEXT_PUBLIC_LLM_PROVIDER=openai
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_key

# 或切换到Anthropic
NEXT_PUBLIC_LLM_PROVIDER=anthropic
NEXT_PUBLIC_ANTHROPIC_API_KEY=your_anthropic_key
```

重启服务器后生效。

## 最佳实践

### 1. 混合模式优先

大部分查询使用Skills（免费），只在需要深度分析时使用LLM：

```typescript
// ✅ 推荐：混合模式
健康度查询 → Skills
风险诊断 → Skills
方案推荐 → Skills + LLM（仅当风险高时）
复杂对话 → LLM

// ❌ 不推荐：全部使用LLM
所有查询 → LLM（成本高，无必要）
```

### 2. 缓存策略

系统默认缓存LLM响应30分钟，相同查询不会重复计费：

- 健康度查询：10分钟缓存
- 诊断报告：30分钟缓存
- 方案推荐：30分钟缓存

### 3. 降级策略

配置降级顺序：`qwen → openai → skills`

当通义千问不可用时，自动切换到备用方案，确保服务可用性。

### 4. 监控成本

定期查看 [DashScope用量统计](https://dashscope.console.aliyun.com/usage)：
- 每日tokens消耗
- 费用趋势
- 模型使用分布

设置预算告警，避免超支。

## 参考链接

- [阿里云DashScope控制台](https://dashscope.console.aliyun.com/)
- [通义千问API文档](https://help.aliyun.com/zh/model-studio/qwen-api-reference/)
- [首次调用指南](https://help.aliyun.com/zh/model-studio/first-api-call-to-qwen)
- [定价说明](https://help.aliyun.com/zh/model-studio/developer-reference/tongyi-qianwen-metering-and-billing)
- [OpenAI兼容接口](https://help.aliyun.com/zh/model-studio/developer-reference/use-qwen-by-calling-the-openai-compatible-interface)

## 技术支持

如遇到问题，可通过以下渠道获取帮助：
- 阿里云工单系统
- DashScope官方文档
- 项目GitHub Issues

---

更新时间：2026-02-07
