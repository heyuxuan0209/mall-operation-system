#!/bin/bash

# 自动更新CONTEXT.md脚本
# 用于快速更新CONTEXT.md中的版本信息

echo "========================================="
echo "      CONTEXT.md 自动更新工具"
echo "========================================="
echo ""

# 检查CONTEXT.md是否存在
if [ ! -f "CONTEXT.md" ]; then
  echo "❌ 错误: CONTEXT.md不存在"
  echo "请先创建CONTEXT.md文件"
  exit 1
fi

# 获取当前信息
echo "📊 获取当前项目信息..."

# 1. 获取Git版本信息
if git rev-parse --git-dir > /dev/null 2>&1; then
  # 尝试获取最新的tag作为版本号
  VERSION=$(git describe --tags --abbrev=0 2>/dev/null)
  if [ -z "$VERSION" ]; then
    # 如果没有tag，使用v0.0.0
    VERSION="v0.0.0"
    echo "⚠️  警告: 未找到Git tag，使用默认版本 $VERSION"
  else
    echo "版本号: $VERSION"
  fi

  # 获取当前commit hash
  COMMIT=$(git rev-parse --short HEAD)
  echo "Git Commit: $COMMIT"
else
  echo "❌ 错误: 不是Git仓库"
  exit 1
fi

# 2. 获取当前日期
DATE=$(date +%Y-%m-%d)
echo "当前日期: $DATE"

echo ""

# 3. 备份原文件
BACKUP_FILE="CONTEXT.md.backup.$(date +%Y%m%d_%H%M%S)"
cp CONTEXT.md "$BACKUP_FILE"
echo "✅ 已备份原文件到: $BACKUP_FILE"

echo ""

# 4. 更新CONTEXT.md
echo "📝 更新CONTEXT.md..."

# 使用sed更新版本信息（macOS和Linux兼容）
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  sed -i '' "s/^- 版本: .*/- 版本: $VERSION/" CONTEXT.md
  sed -i '' "s/^- Git Commit: .*/- Git Commit: $COMMIT/" CONTEXT.md
  sed -i '' "s/^- 最后更新: .*/- 最后更新: $DATE/" CONTEXT.md
  sed -i '' "s/^# 项目上下文索引 v.*/# 项目上下文索引 $VERSION/" CONTEXT.md
else
  # Linux
  sed -i "s/^- 版本: .*/- 版本: $VERSION/" CONTEXT.md
  sed -i "s/^- Git Commit: .*/- Git Commit: $COMMIT/" CONTEXT.md
  sed -i "s/^- 最后更新: .*/- 最后更新: $DATE/" CONTEXT.md
  sed -i "s/^# 项目上下文索引 v.*/# 项目上下文索引 $VERSION/" CONTEXT.md
fi

echo "✅ 版本号已更新: $VERSION"
echo "✅ Git Commit已更新: $COMMIT"
echo "✅ 日期已更新: $DATE"

echo ""

# 5. 显示更新后的版本信息部分
echo "📋 更新后的版本信息:"
echo "-----------------------------------"
grep -A 4 "## 🎯 当前版本状态" CONTEXT.md | tail -4
echo "-----------------------------------"

echo ""

# 6. 验证Token消耗
echo "📊 验证Token消耗..."
LINES=$(wc -l < CONTEXT.md)
WORDS=$(wc -w < CONTEXT.md)
TOKENS=$((WORDS * 13 / 10))

echo "行数: $LINES"
echo "Token估算: $TOKENS"

if [ $LINES -le 100 ] && [ $TOKENS -le 500 ]; then
  echo "✅ CONTEXT.md质量良好"
elif [ $LINES -gt 100 ]; then
  echo "⚠️  警告: 行数超过100行，建议精简"
elif [ $TOKENS -gt 500 ]; then
  echo "⚠️  警告: Token消耗超过500，建议精简"
fi

echo ""
echo "========================================="
echo "✅ CONTEXT.md更新完成！"
echo "========================================="
echo ""
echo "💡 提示:"
echo "1. 如果更新有误，可以从备份恢复:"
echo "   cp $BACKUP_FILE CONTEXT.md"
echo ""
echo "2. 记得更新快速链接指向最新版本快照:"
echo "   [完整上下文] → docs/snapshots/$VERSION-SNAPSHOT.md"
echo ""
echo "3. 如果发布了新版本，记得创建新快照:"
echo "   touch docs/snapshots/$VERSION-SNAPSHOT.md"
echo ""
