# LLM API密钥安全重构说明

## 重构内容

本次重构将LLM API调用从客户端移到服务端，保护API密钥不被暴露。

## 修改的文件

### 1. 环境变量配置

**`.env.local.template`**
- 移除所有 `NEXT_PUBLIC_` 前缀
- 改为服务端环境变量：`LLM_PROVIDER`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `QWEN_API_KEY` 等
- 添加安全说明

**`.env.production`**
- 添加LLM配置说明
- 提示在Zeabur控制台配置环境变量

### 2. 服务端API路由

**新建：`app/api/llm/chat/route.ts`**
- 统一的LLM聊天接口
- 支持OpenAI、Anthropic、Qwen三种提供商
- 从服务端环境变量读取API密钥
- 提供健康检查接口 (GET /api/llm/chat)

### 3. LLM客户端重构

**`utils/ai-assistant/llmClient.ts`**
- 移除直接调用OpenAI/Anthropic SDK的代码
- 改为调用服务端 `/api/llm/chat` 接口
- 移除 `dangerouslyAllowBrowser: true` 标志
- 保留缓存、错误处理等功能

## 安全改进

### 之前（不安全）
```
Browser → OpenAI/Anthropic API (直接调用，API密钥暴露)
```

### 之后（安全）
```
Browser → /api/llm/chat → OpenAI/Anthropic API (API密钥在服务端)
```

## Zeabur部署配置

在Zeabur控制台配置以下环境变量：

```bash
# 基础配置
NEXT_PUBLIC_ENV=production
NEXT_PUBLIC_DEMO_MODE=true
ACCESS_CODE=demo2026

# LLM配置（推荐使用通义千问）
LLM_PROVIDER=qwen
QWEN_API_KEY=你的通义千问API密钥
QWEN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
LLM_MODEL=qwen-max
LLM_MAX_TOKENS=2000
LLM_TEMPERATURE=0.7
```

## 本地开发配置

1. 复制 `.env.local.template` 为 `.env.local`
2. 填入你的API密钥
3. 运行 `npm run dev`

## 测试

1. 启动开发服务器：`npm run dev`
2. 访问 http://localhost:3000
3. 测试AI助手功能
4. 检查浏览器Network面板，确认：
   - 只有 `/api/llm/chat` 请求
   - 没有直接调用OpenAI/Anthropic API
   - 请求体中没有API密钥

## 注意事项

1. **不要**在 `.env.local` 中使用 `NEXT_PUBLIC_` 前缀（会暴露到客户端）
2. **不要**将 `.env.local` 提交到git（已在.gitignore中）
3. 在Zeabur部署时，必须在控制台配置环境变量
4. API密钥只存在于服务端，客户端无法访问

## 回滚方案

如果需要回滚到旧版本：
```bash
git revert <commit-hash>
```

## 相关文档

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Zeabur Environment Variables](https://zeabur.com/docs/environment-variables)
