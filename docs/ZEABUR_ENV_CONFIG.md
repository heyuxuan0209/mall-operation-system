# Zeabur 环境变量配置指南

## 🔐 安全的 LLM API 配置

为了确保 API 密钥安全，我们将 LLM 调用移到了服务端。请在 Zeabur 控制台配置以下环境变量：

### 必需的环境变量

```bash
# LLM 提供商（qwen/openai/anthropic）
LLM_PROVIDER=qwen

# LLM 模型
LLM_MODEL=qwen-plus

# API 密钥（根据 provider 选择）
QWEN_API_KEY=sk-a111781357c643ba8e1e6a13505bf0d2

# 通义千问 API 地址
QWEN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1

# 可选配置
LLM_MAX_TOKENS=2000
LLM_TEMPERATURE=0.7
```

### 配置步骤

1. 登录 Zeabur 控制台
2. 进入项目设置 → 环境变量
3. 添加上述环境变量
4. 重新部署应用

### 安全说明

✅ **安全做法**：
- 使用服务端环境变量（无 `NEXT_PUBLIC_` 前缀）
- API 密钥只在服务端可见
- 客户端通过 `/api/llm` 调用，无法看到密钥

❌ **不安全做法**（已废弃）：
- ~~使用 `NEXT_PUBLIC_` 前缀~~
- ~~客户端直接调用 LLM API~~
- ~~API 密钥暴露在浏览器中~~

### 验证配置

部署后，检查浏览器控制台：
- ✅ 应该看到：`[LLMClient] Using secure server-side API in production`
- ❌ 不应该看到：API 密钥或敏感信息

### 故障排查

如果 AI 功能不工作：
1. 检查 Zeabur 环境变量是否正确配置
2. 检查服务端日志是否有错误
3. 访问 `/api/llm` 测试 API 是否可用

## 其他环境变量

```bash
# 访问码（可选）
ACCESS_CODE=demo2026

# 环境标识
NEXT_PUBLIC_ENV=production
NEXT_PUBLIC_DEMO_MODE=true
```
