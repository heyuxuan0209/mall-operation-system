# 文档管理说明

本目录包含项目的所有文档，采用自动化管理方式。

## 📁 目录结构

```
docs/
├── archive/          # 历史存档（只读，不再修改）
│   ├── 2026-02-01-fixes/      # 2月1日修复记录
│   ├── 2026-01-sessions/      # 1月会话记录
│   ├── old-snapshots/         # 旧版本快照
│   ├── recording-guides/      # 录制指南归档
│   ├── releases/              # 发布记录归档
│   └── misc/                  # 其他归档文件
│
├── snapshots/        # 版本快照（当前活跃）
│   ├── v2.4-SNAPSHOT.md
│   ├── v2.0-SNAPSHOT.md
│   └── v1.x-SNAPSHOT.md
│
├── features/         # 功能文档（按功能模块）
│   ├── batch-inspection-mode.md
│   └── HISTORY-ARCHIVE-QUICKSTART.md
│
├── guides/           # 开发指南（操作手册）
│   ├── GIT-COMMIT-GUIDE.md
│   ├── DEVELOPMENT-WORKFLOW.md
│   └── testing-guide.md
│
├── skills/           # Skills 文档（工具和脚本）
│   └── MD-TO-PDF-QUICKSTART.md
│
├── deployment/       # 部署相关
│   └── DEPLOYMENT-SKILLS-SUMMARY.md
│
├── career/           # 简历和作品集
│   ├── STANDARD-RESUME.md
│   └── STANDARD-RESUME.pdf
│
└── planning/         # 规划文档
    └── TODO-P1-P2-Skills.md
```

## 🤖 自动化管理

### 使用文档管理脚本

```bash
# 执行所有检查和整理
./scripts/docs-manager.sh all

# 或单独执行某个功能
./scripts/docs-manager.sh validate  # 验证文档位置
./scripts/docs-manager.sh archive   # 归档旧文档
./scripts/docs-manager.sh index     # 生成索引
./scripts/docs-manager.sh check     # 检查命名规范
```

### 文档归位规则

| 文档类型 | 存放位置 | 命名规则 |
|---------|---------|---------|
| 版本快照 | `docs/snapshots/` | `v{版本号}-SNAPSHOT.md` |
| 功能文档 | `docs/features/` | `{功能名}.md` |
| 开发指南 | `docs/guides/` | `{指南类型}-GUIDE.md` |
| Skills文档 | `docs/skills/` | `{工具名}-QUICKSTART.md` |
| 部署文档 | `docs/deployment/` | `DEPLOYMENT-*.md` |
| 历史存档 | `docs/archive/{日期}/` | 原文件名 |

## 📝 添加新文档

1. 根据文档类型，放到对应目录
2. 运行 `./scripts/docs-manager.sh validate` 验证位置
3. 运行 `./scripts/docs-manager.sh index` 更新索引

## 🔍 查找文档

查看自动生成的文档索引：`docs/INDEX.md`

---

*最后更新: 2026-02-04*
