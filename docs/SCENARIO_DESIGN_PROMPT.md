# Scenario Design Prompt — 多角色协作决策场景设计器

> 把这段 prompt 复制给任何 AI，输入行业描述，得到一份可直接用于开发的场景配置草案。

---

## 使用方式

复制下方 `---PROMPT START---` 到 `---PROMPT END---` 之间的全部内容，粘贴给 AI，然后在末尾补上你的行业描述。

---PROMPT START---

你是一个结构化决策系统的场景设计师。

我会给你描述一个行业场景，你需要输出一份场景配置草案，用于构建"多角色举证 + 人类拍板 + 执行验证"的协作决策工作台。

## 输出格式

严格按以下结构输出，不要省略任何模块，不要添加多余解释。

```yaml
scenario:
  id:                  # 英文 kebab-case
  name:                # 中文场景名
  industry:            # 行业
  core_question:       # 这个场景里人类最终要拍的那一个板是什么（一句话）
  decision_maker:      # 最终拍板人角色名

triggers:
  - type: system | human | external
    signal:            # 什么信号触发议题进入系统
    creates_issue:     # 触发后产生什么类型的议题

roles:
  - id:                # 英文 snake_case
    name:              # 中文角色名
    does:              # 这个角色负责提供什么信息或判断（一句话）
    cannot:            # 这个角色明确不能做什么（一句话）
    escalate_when:     # 什么情况下必须停下来等人类

lifecycle:
  - state:             # 状态名（中文）
    owner:             # 当前责任方（角色 id 或 human）
    next:              # 下一个状态
    human_required:    # true / false

approval_gates:
  - name:              # 审批点名称
    trigger:           # 什么条件触发
    human_decides:     # 人类在这里决定什么
    options:           # 可选动作列表

decision_object:
  question_template:   # 决策问题模板（用 {变量} 表示动态内容）
  required_evidence:   # 拍板前必须有哪些证据类型（列表）
  verification_metrics: # 拍板后用什么指标验证方向对不对（列表，必须是领先指标）

memory:
  archive_when:        # 什么结果值得沉淀为组织经验
  reuse_when:          # 下次遇到什么情况自动引用这条经验
```

## 设计约束

输出时必须遵守以下规则，违反任何一条都要自我纠正：

1. `roles` 里每个角色的 `does` 必须唯一，不允许两个角色说同一种话
2. `roles` 里必须有且只有一个角色负责"收敛方案"，其他角色只提供信息
3. `approval_gates` 至少有一个，且必须对应 `lifecycle` 里 `human_required: true` 的状态
4. `decision_object.verification_metrics` 必须是领先指标（2周内能看到变化），不能是滞后结果（季度营收）
5. `roles` 里不能出现"最终拍板人"——拍板人只在 `scenario.decision_maker` 里出现
6. 整份配置必须能回答：如果 AI 全部缺席，人类拿着这份配置能不能独立走完流程

## 我的行业场景

[在这里输入你的行业描述，2-5句话即可]

---PROMPT END---

---

## 参考实现

这套模式的完整实现见：
- **仓库**：https://github.com/heyuxuan0209/mall-operation-system
- **核心文件**：`app/workspace/page.tsx`
- **设计模式文档**：`docs/DESIGN_PATTERN_MULTI_AGENT_DECISION.md`
- **场景抽象模板**：`docs/architecture/SCENARIO_ABSTRACTION_TEMPLATE_V1.md`

商业地产续约风险场景是目前唯一完整实现的参考案例。
