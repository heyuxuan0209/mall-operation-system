#!/bin/bash

# 分层文档管理方案 - 实施验证脚本
# 用途: 验证文档结构、Token消耗、文档完整性

echo "=========================================="
echo "   分层文档管理方案 - 验证报告"
echo "=========================================="
echo ""

# 切换到项目根目录
cd "$(dirname "$0")/.."

# 1. 验证核心文档存在性
echo "📋 1. 核心文档存在性验证"
echo "----------------------------------------"

FILES=(
  "CONTEXT.md"
  "PROJECT_HANDOVER.md"
  "docs/CHANGELOG.md"
  "docs/INDEX.md"
  "docs/snapshots/v1.0-SNAPSHOT.md"
  "docs/snapshots/v1.1-SNAPSHOT.md"
  "docs/snapshots/v2.0-SNAPSHOT.md"
  "docs/standards/risk-level-standard.md"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file"
  else
    echo "❌ $file (缺失)"
  fi
done
echo ""

# 2. 文档行数统计
echo "📊 2. 文档行数统计"
echo "----------------------------------------"
echo "CONTEXT.md:                  $(wc -l < CONTEXT.md) 行 (目标: 50-100行)"
echo "PROJECT_HANDOVER.md:         $(wc -l < PROJECT_HANDOVER.md) 行 (目标: 200-300行)"
echo "v1.0-SNAPSHOT.md:            $(wc -l < docs/snapshots/v1.0-SNAPSHOT.md) 行"
echo "v1.1-SNAPSHOT.md:            $(wc -l < docs/snapshots/v1.1-SNAPSHOT.md) 行"
echo "v2.0-SNAPSHOT.md:            $(wc -l < docs/snapshots/v2.0-SNAPSHOT.md) 行"
echo "CHANGELOG.md:                $(wc -l < docs/CHANGELOG.md) 行"
echo "INDEX.md:                    $(wc -l < docs/INDEX.md) 行"
echo "risk-level-standard.md:      $(wc -l < docs/standards/risk-level-standard.md) 行"
echo ""

# 3. Token消耗估算
echo "🔢 3. Token消耗估算"
echo "----------------------------------------"
CONTEXT_WORDS=$(wc -w < CONTEXT.md)
CONTEXT_TOKENS=$((CONTEXT_WORDS * 13 / 10))
echo "CONTEXT.md:        $CONTEXT_WORDS words ≈ $CONTEXT_TOKENS tokens"

V2_WORDS=$(wc -w < docs/snapshots/v2.0-SNAPSHOT.md)
V2_TOKENS=$((V2_WORDS * 13 / 10))
echo "v2.0-SNAPSHOT.md:  $V2_WORDS words ≈ $V2_TOKENS tokens"

TOTAL_TOKENS=$((CONTEXT_TOKENS + V2_TOKENS))
echo "首次加载总计:      $TOTAL_TOKENS tokens"

if [ $TOTAL_TOKENS -lt 1000 ]; then
  echo "✅ Token消耗 < 1000 (优秀)"
elif [ $TOTAL_TOKENS -lt 2000 ]; then
  echo "⚠️  Token消耗在 1000-2000 之间 (可接受)"
else
  echo "❌ Token消耗 > 2000 (需要优化)"
fi
echo ""

# 4. 目录结构验证
echo "📂 4. 目录结构验证"
echo "----------------------------------------"
DIRS=(
  "docs/snapshots"
  "docs/architecture"
  "docs/features"
  "docs/api/skills"
  "docs/api/components"
  "docs/standards"
  "docs/releases/v1.0"
  "docs/releases/v1.1"
  "docs/releases/v2.0"
  "docs/issues/bug-fixes"
  "docs/guides"
  "docs/planning"
)

for dir in "${DIRS[@]}"; do
  if [ -d "$dir" ]; then
    echo "✅ $dir"
  else
    echo "❌ $dir (缺失)"
  fi
done
echo ""

# 5. 文档总量统计
echo "📈 5. 文档总量统计"
echo "----------------------------------------"
TOTAL_DOCS=$(find docs -name "*.md" | wc -l | tr -d ' ')
TOTAL_LINES=$(find docs -name "*.md" -exec wc -l {} + | tail -1 | awk '{print $1}')
echo "总文档数量: $TOTAL_DOCS 个"
echo "总行数:     $TOTAL_LINES 行"
echo ""

# 6. 成功标准验证
echo "✅ 6. 成功标准验证"
echo "----------------------------------------"

CONTEXT_LINES=$(wc -l < CONTEXT.md)
if [ $CONTEXT_LINES -le 100 ]; then
  echo "✅ CONTEXT.md < 100行"
else
  echo "❌ CONTEXT.md > 100行"
fi

HANDOVER_LINES=$(wc -l < PROJECT_HANDOVER.md)
if [ $HANDOVER_LINES -le 500 ]; then
  echo "✅ PROJECT_HANDOVER.md < 500行"
else
  echo "❌ PROJECT_HANDOVER.md > 500行"
fi

if [ $TOTAL_TOKENS -lt 1000 ]; then
  echo "✅ 首次加载Token < 1000"
elif [ $TOTAL_TOKENS -lt 2000 ]; then
  echo "⚠️  首次加载Token < 2000 (稍高但可接受)"
else
  echo "❌ 首次加载Token > 2000"
fi

echo ""
echo "=========================================="
echo "   验证完成"
echo "=========================================="
