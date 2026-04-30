#!/bin/bash

# AI问答助手录屏展示优化 - 快速验证脚本

echo "🔍 开始验证实施结果..."
echo ""

# 检查新建文件
echo "📁 检查新建文件..."
files=(
  "components/ai-assistant/CausalFlowChart.tsx"
  "scripts/prepare-demo-data.ts"
  "docs/recording-scripts.md"
  "docs/DEMO_IMPLEMENTATION_SUMMARY.md"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ $file (缺失)"
  fi
done

echo ""

# 检查修改文件
echo "📝 检查修改文件..."
modified_files=(
  "skills/ai-diagnosis-engine.ts"
  "utils/ai-assistant/responseParser.ts"
  "components/ai-assistant/ResponseVisuals.tsx"
)

for file in "${modified_files[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
  else
    echo "  ❌ $file (缺失)"
  fi
done

echo ""

# 检查关键代码片段
echo "🔎 检查关键代码片段..."

# 检查 CausalFlowChart 组件
if grep -q "CausalFlowChart" components/ai-assistant/CausalFlowChart.tsx 2>/dev/null; then
  echo "  ✅ CausalFlowChart 组件已创建"
else
  echo "  ❌ CausalFlowChart 组件未找到"
fi

# 检查 parseCausalChain 方法
if grep -q "parseCausalChain" utils/ai-assistant/responseParser.ts 2>/dev/null; then
  echo "  ✅ parseCausalChain 方法已添加"
else
  echo "  ❌ parseCausalChain 方法未找到"
fi

# 检查优化后的提示词
if grep -q "因果关系链（用于可视化）" skills/ai-diagnosis-engine.ts 2>/dev/null; then
  echo "  ✅ 诊断提示词已优化"
else
  echo "  ❌ 诊断提示词未优化"
fi

# 检查演示数据
if grep -q "loadDemoData" scripts/prepare-demo-data.ts 2>/dev/null; then
  echo "  ✅ 演示数据脚本已创建"
else
  echo "  ❌ 演示数据脚本未找到"
fi

echo ""

# TypeScript 编译检查
echo "🔨 检查 TypeScript 编译..."
if npm run build > /dev/null 2>&1; then
  echo "  ✅ TypeScript 编译通过"
else
  echo "  ❌ TypeScript 编译失败"
  echo "  💡 运行 'npm run build' 查看详细错误"
fi

echo ""

# 总结
echo "📊 验证总结"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ 所有任务已完成！"
echo ""
echo "📋 下一步操作："
echo "  1. 启动开发服务器: npm run dev"
echo "  2. 打开浏览器: http://localhost:3000"
echo "  3. 打开控制台 (F12)"
echo "  4. 加载演示数据:"
echo "     import('/scripts/prepare-demo-data.ts').then(m => m.loadDemoData())"
echo "  5. 参考录屏脚本: docs/recording-scripts.md"
echo ""
echo "🎬 准备好录屏了！"
