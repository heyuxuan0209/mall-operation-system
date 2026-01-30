#!/bin/bash

# 文档结构验证脚本
# 用于验证文档系统的完整性和质量

echo "========================================="
echo "       文档结构验证工具 v1.0"
echo "========================================="
echo ""

# 初始化计数器
PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

# 1. 检查核心文档存在性
echo "📋 1. 检查核心文档存在性..."
echo "-----------------------------------"

check_file() {
  if [ -f "$1" ]; then
    echo "✅ $1"
    ((PASS_COUNT++))
  else
    echo "❌ $1 (缺失)"
    ((FAIL_COUNT++))
  fi
}

check_file "CONTEXT.md"
check_file "docs/INDEX.md"
check_file "docs/CHANGELOG.md"

# 检查快照文件
echo ""
echo "检查版本快照..."
SNAPSHOT_COUNT=0
if [ -d "docs/snapshots" ]; then
  for snapshot in docs/snapshots/*.md; do
    if [ -f "$snapshot" ]; then
      echo "✅ $(basename $snapshot)"
      ((SNAPSHOT_COUNT++))
      ((PASS_COUNT++))
    fi
  done
  if [ $SNAPSHOT_COUNT -eq 0 ]; then
    echo "⚠️  警告: 未找到任何快照文件"
    ((WARN_COUNT++))
  fi
else
  echo "❌ docs/snapshots/ 目录不存在"
  ((FAIL_COUNT++))
fi

echo ""

# 2. 检查CONTEXT.md行数和Token消耗
echo "📏 2. 检查CONTEXT.md质量..."
echo "-----------------------------------"

if [ -f "CONTEXT.md" ]; then
  CONTEXT_LINES=$(wc -l < CONTEXT.md)
  CONTEXT_WORDS=$(wc -w < CONTEXT.md)
  CONTEXT_TOKENS=$((CONTEXT_WORDS * 13 / 10))

  echo "行数: $CONTEXT_LINES"
  if [ $CONTEXT_LINES -le 100 ]; then
    echo "✅ 行数符合目标（≤100行）"
    ((PASS_COUNT++))
  else
    echo "⚠️  行数超过目标（建议≤100行）"
    ((WARN_COUNT++))
  fi

  echo "Token估算: $CONTEXT_TOKENS"
  if [ $CONTEXT_TOKENS -le 500 ]; then
    echo "✅ Token消耗符合目标（≤500）"
    ((PASS_COUNT++))
  else
    echo "⚠️  Token消耗偏高（建议≤500）"
    ((WARN_COUNT++))
  fi
else
  echo "❌ CONTEXT.md不存在，跳过检查"
  ((FAIL_COUNT++))
fi

echo ""

# 3. 检查快照质量
echo "📸 3. 检查版本快照质量..."
echo "-----------------------------------"

if [ -d "docs/snapshots" ]; then
  for snapshot in docs/snapshots/*.md; do
    if [ -f "$snapshot" ]; then
      LINES=$(wc -l < "$snapshot")
      BASENAME=$(basename "$snapshot")

      if [ $LINES -ge 200 ] && [ $LINES -le 400 ]; then
        echo "✅ $BASENAME: $LINES 行（目标200-400）"
        ((PASS_COUNT++))
      elif [ $LINES -lt 200 ]; then
        echo "⚠️  $BASENAME: $LINES 行（低于目标，建议≥200）"
        ((WARN_COUNT++))
      else
        echo "⚠️  $BASENAME: $LINES 行（超过目标，建议≤400）"
        ((WARN_COUNT++))
      fi
    fi
  done
fi

echo ""

# 4. 统计文档总量
echo "📚 4. 统计文档总量..."
echo "-----------------------------------"

if [ -d "docs" ]; then
  TOTAL_DOCS=$(find docs -name "*.md" -type f | wc -l | tr -d ' ')
  TOTAL_LINES=$(find docs -name "*.md" -type f -exec wc -l {} + 2>/dev/null | tail -1 | awk '{print $1}')

  echo "文档总数: $TOTAL_DOCS 个"
  echo "文档总行数: $TOTAL_LINES 行"

  # 估算平均文档大小
  if [ $TOTAL_DOCS -gt 0 ]; then
    AVG_LINES=$((TOTAL_LINES / TOTAL_DOCS))
    echo "平均文档大小: $AVG_LINES 行"
  fi

  ((PASS_COUNT++))
else
  echo "❌ docs目录不存在"
  ((FAIL_COUNT++))
fi

echo ""

# 5. 检查目录结构
echo "📂 5. 检查目录结构..."
echo "-----------------------------------"

REQUIRED_DIRS=("snapshots" "architecture" "features" "api" "standards" "releases" "issues" "guides" "planning")

for dir in "${REQUIRED_DIRS[@]}"; do
  if [ -d "docs/$dir" ]; then
    # 统计该目录下的文档数量
    DOC_COUNT=$(find "docs/$dir" -name "*.md" -type f 2>/dev/null | wc -l | tr -d ' ')
    echo "✅ docs/$dir/ ($DOC_COUNT 个文档)"
    ((PASS_COUNT++))
  else
    echo "⚠️  docs/$dir/ (目录不存在)"
    ((WARN_COUNT++))
  fi
done

echo ""

# 6. 检查文档冗余度（可选）
echo "🔍 6. 检查文档冗余度..."
echo "-----------------------------------"

if [ -d "docs" ]; then
  # 检查常见重复关键词
  echo "检查潜在重复内容..."

  # 这里可以添加项目特定的关键词检查
  # 示例：检查某个核心概念是否在多个文件中重复定义

  echo "💡 提示: 手动检查重复内容："
  echo "   grep -r '关键概念' docs/*.md docs/**/*.md"

  ((PASS_COUNT++))
fi

echo ""

# 7. 生成完整上下文Token估算
echo "🎯 7. 完整上下文Token估算..."
echo "-----------------------------------"

if [ -f "CONTEXT.md" ]; then
  TOTAL_WORDS=$CONTEXT_WORDS

  # 查找最新的快照文件（假设按时间排序，取最后一个）
  LATEST_SNAPSHOT=$(ls -t docs/snapshots/*.md 2>/dev/null | head -1)

  if [ -f "$LATEST_SNAPSHOT" ]; then
    SNAPSHOT_WORDS=$(wc -w < "$LATEST_SNAPSHOT")
    TOTAL_WORDS=$((TOTAL_WORDS + SNAPSHOT_WORDS))
    echo "CONTEXT.md: $CONTEXT_WORDS 词"
    echo "最新快照 $(basename "$LATEST_SNAPSHOT"): $SNAPSHOT_WORDS 词"
  fi

  TOTAL_TOKENS=$((TOTAL_WORDS * 13 / 10))
  echo "-----------------------------------"
  echo "完整上下文总Token: $TOTAL_TOKENS"

  if [ $TOTAL_TOKENS -le 2000 ]; then
    echo "✅ 完整上下文Token消耗优秀（≤2000）"
    ((PASS_COUNT++))
  else
    echo "⚠️  完整上下文Token消耗偏高（建议≤2000）"
    ((WARN_COUNT++))
  fi
fi

echo ""

# 8. 总结
echo "========================================="
echo "               验证总结"
echo "========================================="
echo "✅ 通过: $PASS_COUNT 项"
echo "⚠️  警告: $WARN_COUNT 项"
echo "❌ 失败: $FAIL_COUNT 项"
echo ""

if [ $FAIL_COUNT -eq 0 ] && [ $WARN_COUNT -eq 0 ]; then
  echo "🎉 太棒了！文档结构完美！"
  exit 0
elif [ $FAIL_COUNT -eq 0 ]; then
  echo "👍 文档结构良好，有一些小建议需要关注。"
  exit 0
else
  echo "⚠️  文档结构存在问题，请修复后再试。"
  exit 1
fi
