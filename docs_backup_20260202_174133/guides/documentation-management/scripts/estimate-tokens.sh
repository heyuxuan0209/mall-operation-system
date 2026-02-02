#!/bin/bash

# Token消耗估算工具
# 用于估算文档的Token消耗

echo "========================================="
echo "        Token消耗估算工具 v1.0"
echo "========================================="
echo ""

# 检查是否提供了文件参数
if [ $# -eq 0 ]; then
  echo "用法: $0 <文件路径> [文件路径2] [文件路径3] ..."
  echo ""
  echo "示例:"
  echo "  $0 CONTEXT.md"
  echo "  $0 CONTEXT.md docs/snapshots/v2.0-SNAPSHOT.md"
  echo "  $0 docs/**/*.md  # 统计所有Markdown文件"
  echo ""
  exit 1
fi

# 初始化总计
TOTAL_LINES=0
TOTAL_WORDS=0
TOTAL_TOKENS=0
FILE_COUNT=0

# 打印表头
printf "%-50s %10s %10s %10s\n" "文件" "行数" "单词数" "Token估算"
echo "--------------------------------------------------------------------------------"

# 遍历所有提供的文件
for FILE in "$@"; do
  # 检查文件是否存在
  if [ ! -f "$FILE" ]; then
    echo "⚠️  跳过: $FILE (文件不存在)"
    continue
  fi

  # 统计行数、单词数
  LINES=$(wc -l < "$FILE" | tr -d ' ')
  WORDS=$(wc -w < "$FILE" | tr -d ' ')

  # Token估算（粗略估算：单词数 × 1.3）
  # 这个系数根据经验调整，英文约1.3，中文可能更高
  TOKENS=$((WORDS * 13 / 10))

  # 累加到总计
  TOTAL_LINES=$((TOTAL_LINES + LINES))
  TOTAL_WORDS=$((TOTAL_WORDS + WORDS))
  TOTAL_TOKENS=$((TOTAL_TOKENS + TOKENS))
  FILE_COUNT=$((FILE_COUNT + 1))

  # 缩短文件名显示（如果太长）
  DISPLAY_NAME="$FILE"
  if [ ${#DISPLAY_NAME} -gt 48 ]; then
    DISPLAY_NAME="...${DISPLAY_NAME: -45}"
  fi

  # 打印结果
  printf "%-50s %10d %10d %10d\n" "$DISPLAY_NAME" "$LINES" "$WORDS" "$TOKENS"
done

# 打印分隔线
echo "--------------------------------------------------------------------------------"

# 如果有多个文件，显示总计
if [ $FILE_COUNT -gt 1 ]; then
  printf "%-50s %10d %10d %10d\n" "总计 ($FILE_COUNT 个文件)" "$TOTAL_LINES" "$TOTAL_WORDS" "$TOTAL_TOKENS"
  echo "--------------------------------------------------------------------------------"
fi

echo ""

# 提供建议
if [ $FILE_COUNT -eq 1 ]; then
  echo "📊 分析和建议:"
  echo ""

  # 判断是否是CONTEXT.md
  if [[ "$1" == *"CONTEXT.md" ]]; then
    echo "🎯 CONTEXT.md 质量评估:"
    if [ $TOTAL_LINES -le 60 ]; then
      echo "  ✅ 行数优秀（≤60行）"
    elif [ $TOTAL_LINES -le 100 ]; then
      echo "  ✅ 行数良好（≤100行）"
    else
      echo "  ⚠️  行数超标（建议≤100行），当前 $TOTAL_LINES 行"
    fi

    if [ $TOTAL_TOKENS -le 300 ]; then
      echo "  ✅ Token消耗优秀（≤300）"
    elif [ $TOTAL_TOKENS -le 500 ]; then
      echo "  ✅ Token消耗良好（≤500）"
    else
      echo "  ⚠️  Token消耗超标（建议≤500），当前 $TOTAL_TOKENS"
    fi

  # 判断是否是快照文件
  elif [[ "$1" == *"SNAPSHOT.md" ]]; then
    echo "📸 版本快照质量评估:"
    if [ $TOTAL_LINES -ge 200 ] && [ $TOTAL_LINES -le 400 ]; then
      echo "  ✅ 行数符合目标（200-400行）"
    elif [ $TOTAL_LINES -lt 200 ]; then
      echo "  ⚠️  行数偏少（建议≥200行），当前 $TOTAL_LINES 行"
      echo "     建议: 补充更多版本信息和核心内容"
    else
      echo "  ⚠️  行数偏多（建议≤400行），当前 $TOTAL_LINES 行"
      echo "     建议: 精简内容，删除不必要的细节"
    fi

    if [ $TOTAL_TOKENS -ge 1000 ] && [ $TOTAL_TOKENS -le 1500 ]; then
      echo "  ✅ Token消耗符合目标（1000-1500）"
    elif [ $TOTAL_TOKENS -lt 1000 ]; then
      echo "  💡 Token消耗较低，可以补充更多信息"
    else
      echo "  ⚠️  Token消耗偏高（建议≤1500），当前 $TOTAL_TOKENS"
    fi

  else
    echo "📄 文档质量评估:"
    if [ $TOTAL_LINES -le 300 ]; then
      echo "  ✅ 文档长度适中"
    else
      echo "  💡 文档较长（$TOTAL_LINES 行），考虑是否可以拆分"
    fi
  fi

elif [ $FILE_COUNT -gt 1 ]; then
  echo "📊 多文件分析:"
  echo ""
  echo "  文件总数: $FILE_COUNT 个"
  echo "  平均行数: $((TOTAL_LINES / FILE_COUNT)) 行/文件"
  echo "  平均Token: $((TOTAL_TOKENS / FILE_COUNT)) tokens/文件"
  echo ""

  # 完整上下文建议
  if [ $TOTAL_TOKENS -le 2000 ]; then
    echo "  ✅ 总Token消耗优秀（≤2000），适合作为完整上下文"
  elif [ $TOTAL_TOKENS -le 5000 ]; then
    echo "  ✅ 总Token消耗良好（≤5000）"
  else
    echo "  ⚠️  总Token消耗较高（$TOTAL_TOKENS），考虑按需加载"
  fi
fi

echo ""
echo "========================================="
echo "💡 Token估算说明:"
echo ""
echo "本工具使用粗略估算方法："
echo "  Token ≈ 单词数 × 1.3"
echo ""
echo "实际Token消耗可能因以下因素有所不同："
echo "  - 代码块会消耗更多Token"
echo "  - 中文内容Token消耗通常更高"
echo "  - Markdown格式符号也会消耗Token"
echo ""
echo "建议使用Claude官方Token计数工具获取精确值。"
echo "========================================="
echo ""

# 快捷命令示例
echo "💡 常用命令:"
echo "  # 估算CONTEXT.md"
echo "  $0 CONTEXT.md"
echo ""
echo "  # 估算完整上下文（CONTEXT + 最新快照）"
echo "  $0 CONTEXT.md docs/snapshots/v2.0-SNAPSHOT.md"
echo ""
echo "  # 估算所有快照"
echo "  $0 docs/snapshots/*.md"
echo ""
echo "  # 估算整个文档系统"
echo "  find docs -name '*.md' -exec $0 {} +"
echo ""
