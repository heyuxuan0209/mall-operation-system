#!/bin/bash
# 文档自动管理脚本

# 功能1: 自动归档旧文档
archive_old_docs() {
  echo "🗂️  归档旧文档..."

  # 归档超过3个月的快照
  find docs/snapshots -name "*.md" -mtime +90 2>/dev/null | while read file; do
    if [ -f "$file" ]; then
      month=$(date -r "$file" +%Y-%m 2>/dev/null || stat -f %Sm -t %Y-%m "$file")
      mkdir -p "docs/archive/$month"
      mv "$file" "docs/archive/$month/"
      echo "✅ 归档: $file → docs/archive/$month/"
    fi
  done

  echo "✅ 归档完成"
}

# 功能2: 验证文档位置
validate_docs() {
  echo "🔍 验证文档位置..."

  # 检查根目录是否有不应该存在的文档
  for file in *.md; do
    [ ! -f "$file" ] && continue

    case "$file" in
      README.md|CONTEXT.md|PROJECT_HANDOVER.md|交付清单.md|VERSION.md|操作手册.md|LICENSE.md)
        # 允许的根目录文档
        ;;
      *)
        echo "⚠️  警告: $file 不应该在根目录，建议移动到 docs/"
        ;;
    esac
  done

  echo "✅ 验证完成"
}

# 功能3: 生成文档索引
generate_index() {
  echo "📋 生成文档索引..."

  cat > docs/INDEX.md <<EOF
# 文档索引

**自动生成时间**: $(date +"%Y-%m-%d %H:%M:%S")

## 📁 目录结构

\`\`\`
docs/
├── archive/          # 历史存档
├── snapshots/        # 版本快照
├── features/         # 功能文档
├── guides/           # 开发指南
├── skills/           # Skills 文档
├── deployment/       # 部署相关
├── career/           # 简历和作品集
└── planning/         # 规划文档
\`\`\`

## 📄 文档清单

### 版本快照
$(find docs/snapshots -name "*.md" -type f 2>/dev/null | sort -r | while read f; do echo "- $(basename "$f")"; done)

### 功能文档
$(find docs/features -name "*.md" -type f 2>/dev/null | sort | while read f; do echo "- $(basename "$f")"; done)

### 开发指南
$(find docs/guides -name "*.md" -type f 2>/dev/null | sort | while read f; do echo "- $(basename "$f")"; done)

### Skills 文档
$(find docs/skills -name "*.md" -type f 2>/dev/null | sort | while read f; do echo "- $(basename "$f")"; done)

### 部署文档
$(find docs/deployment -name "*.md" -type f 2>/dev/null | sort | while read f; do echo "- $(basename "$f")"; done)

### 历史存档
$(find docs/archive -type d -mindepth 1 -maxdepth 1 2>/dev/null | sort -r | while read d; do echo "- $(basename "$d")"; done)

---
*此文件由 scripts/docs-manager.sh 自动生成*
EOF

  echo "✅ 文档索引已生成: docs/INDEX.md"
}

# 功能4: 检查文档命名规范
check_naming() {
  echo "🏷️  检查文档命名规范..."

  find docs -name "*.md" -type f 2>/dev/null | while read file; do
    filename=$(basename "$file")

    # 跳过中文文件名
    if echo "$filename" | grep -q '[一-龥]'; then
      continue
    fi

    # 检查是否符合命名规范
    # 允许: 大写字母+数字+连字符, 或包含版本号格式 (v1.0, v2.0等)
    if [[ ! "$filename" =~ ^[A-Z0-9-]+\.md$ ]] && \
       [[ ! "$filename" =~ ^v[0-9]+\.[0-9]+-SNAPSHOT\.md$ ]] && \
       [[ ! "$filename" =~ ^[A-Z0-9-]+v[0-9]+\.[0-9]+[A-Z0-9-]*\.md$ ]]; then
      echo "⚠️  命名不规范: $file"
      echo "   建议: 使用大写字母、数字和连字符"
    fi
  done

  echo "✅ 命名检查完成"
}

# 主函数
main() {
  case "$1" in
    archive)
      archive_old_docs
      ;;
    validate)
      validate_docs
      ;;
    index)
      generate_index
      ;;
    check)
      check_naming
      ;;
    all)
      validate_docs
      archive_old_docs
      generate_index
      check_naming
      ;;
    *)
      echo "用法: $0 {archive|validate|index|check|all}"
      echo ""
      echo "命令说明:"
      echo "  archive  - 归档旧文档"
      echo "  validate - 验证文档位置"
      echo "  index    - 生成文档索引"
      echo "  check    - 检查命名规范"
      echo "  all      - 执行所有检查"
      exit 1
      ;;
  esac
}

main "$@"
