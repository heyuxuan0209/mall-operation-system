import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  BarChart3,
  BrainCircuit,
  Building2,
  ClipboardCheck,
  DatabaseZap,
  FileText,
  GitBranch,
  LineChart,
  Megaphone,
  MessageSquareText,
  RefreshCcw,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  Target,
  TrendingDown,
  UserRoundCheck,
  UsersRound,
} from 'lucide-react';

const evidenceCards = [
  {
    title: '销售证据',
    items: ['营业额', '人均消费', '坪效 / 租售比'],
    icon: BarChart3,
  },
  {
    title: '客流证据',
    items: ['进店人数', '低峰客流', '转化趋势'],
    icon: Activity,
  },
  {
    title: '合同证据',
    items: ['租约到期', '租金水平', '续约节点'],
    icon: FileText,
  },
  {
    title: '活动证据',
    items: ['券核销率', '活动毛利', 'ROI'],
    icon: Megaphone,
  },
  {
    title: '口碑证据',
    items: ['评分变化', '差评关键词', '投诉反馈'],
    icon: Star,
  },
  {
    title: '巡店证据',
    items: ['巡店记录', '访谈记录', '巡店照片'],
    icon: ClipboardCheck,
  },
];

const agentCards = [
  {
    title: '经营雷达 Agent',
    text: '每天扫描经营变化，找出真正经营异常的商户。',
    icon: SearchCheck,
  },
  {
    title: '证据整理 Agent',
    text: '把分散数据整理成证据链：哪些指标变差、何时开始、与哪些事件相关。',
    icon: DatabaseZap,
  },
  {
    title: '根因诊断 Agent',
    text: '判断问题更可能来自客流、活动、体验、价格还是商圈变化。',
    icon: BrainCircuit,
  },
  {
    title: '策略建议 Agent',
    text: '把诊断结果转成扶持、谈判、继续观察或替换预案。',
    icon: MessageSquareText,
  },
  {
    title: '执行追踪 Agent',
    text: '把建议拆成商户任务，追踪确认、完成和反馈说明。',
    icon: UserRoundCheck,
  },
  {
    title: '效果验证 Agent',
    text: '对比改善前后指标，判断动作是否有效，并更新风险判断。',
    icon: RefreshCcw,
  },
];

const audienceCards = [
  {
    role: '商场总经理',
    question: '哪些商户正在影响资产经营质量？续约风险会不会拖累租金、坪效和组合？',
    icon: Building2,
  },
  {
    role: '营运经理',
    question: '哪些商户正在变差？该扶持什么动作，谁来跟进，什么时候验证？',
    icon: ClipboardCheck,
  },
  {
    role: '招商经理',
    question: '这个商户还值得续约吗？要调整谈判条件，还是启动替换预案？',
    icon: UsersRound,
  },
  {
    role: '商户',
    question: '商场为什么认为我有风险？我该先改善什么，结果能否被商场看见？',
    icon: Store,
  },
];

const caseCards = [
  {
    title: '1. 多源证据',
    text: '销售、人均、低峰客流、活动核销、评分和巡店反馈同时走弱，租约 45 天后到期。',
  },
  {
    title: '2. Agent 研判',
    text: '不只是销售下滑，而是低峰客流、活动吸引力和服务体验共同影响续约评估。',
  },
  {
    title: '3. 改善任务',
    text: '生成午市套餐、券门槛调整、低峰引导、服务排班优化等任务。',
  },
  {
    title: '4. 效果回流',
    text: '追踪 7/14 天改善结果，把完成情况和指标变化回流续约判断。',
  },
];

const demoCards = [
  {
    name: '商场工作台',
    description: '风险识别、Agent 研判、方案下发、续约判断。',
    href: '/workspace',
    cta: '进入商场工作台',
    icon: LineChart,
    tags: ['多源证据', '风险研判', '续约判断'],
  },
  {
    name: '商户改善工作台',
    description: '接收改善计划、执行任务、填写反馈、验证效果。',
    href: '/merchant-workspace',
    cta: '进入商户改善工作台',
    icon: Store,
    tags: ['任务确认', '执行反馈', '效果回流'],
  },
];

const heroEvidence = [
  ['销售', '-12%'],
  ['低峰客流', '-18%'],
  ['活动核销', '低于均值'],
  ['巡店反馈', '服务响应慢'],
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <section className="relative overflow-hidden border-b border-cyan-400/10 bg-[radial-gradient(circle_at_20%_15%,rgba(56,189,248,0.22),transparent_32%),radial-gradient(circle_at_80%_8%,rgba(45,212,191,0.16),transparent_28%),linear-gradient(135deg,#030712_0%,#0f172a_58%,#07111f_100%)]">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.06)_1px,transparent_1px)] bg-[size:44px_44px]" />
        <div className="relative mx-auto flex min-h-[92vh] max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-10">
          <header className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-300/30 bg-cyan-300/10 text-cyan-200 shadow-[0_0_28px_rgba(56,189,248,0.22)]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Mall Operation Agent</p>
                <p className="text-xs text-slate-400">商场运营 AI Agent 工作台</p>
              </div>
            </div>
            <div className="hidden items-center gap-3 sm:flex">
              <Link
                href="/workspace"
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-300 transition hover:text-white"
              >
                商场工作台
              </Link>
              <Link
                href="/workspace"
                className="inline-flex items-center gap-2 rounded-md border border-cyan-300/30 bg-white/5 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-200 hover:bg-cyan-300/10"
              >
                查看演示
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </header>

          <div className="grid flex-1 items-center gap-10 py-14 lg:grid-cols-[1.02fr_0.98fr]">
            <div className="max-w-3xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-sm font-medium text-cyan-100">
                <ShieldCheck className="h-4 w-4" />
                多源经营证据 · 多 Agent 协同 · 改善闭环
              </div>
              <h1 className="text-4xl font-semibold leading-tight tracking-normal text-white sm:text-5xl lg:text-6xl">
                用 AI Agent 帮商场看懂商户风险，并推动改善闭环
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                汇聚销售、客流、合同、活动、评分和巡店等经营证据，由多个 AI Agent 协同判断商户为什么变差、该怎么扶持、是否影响续约，并持续追踪执行结果。
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/workspace"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
                >
                  进入商场工作台
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/merchant-workspace"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-500/70 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-cyan-200 hover:bg-white/10"
                >
                  查看商户改善闭环
                </Link>
              </div>
            </div>

            <div className="rounded-xl border border-cyan-300/20 bg-white/[0.04] p-4 shadow-[0_0_48px_rgba(56,189,248,0.16)] backdrop-blur">
              <div className="rounded-lg border border-slate-600/60 bg-slate-950/80 p-5">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-white">Agent 研判面板</p>
                    <p className="mt-1 text-xs text-slate-400">望潮港火锅 · 续约风险升级</p>
                  </div>
                  <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs font-semibold text-amber-200">
                    高风险
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {heroEvidence.map(([label, value]) => (
                    <div key={label} className="rounded-lg border border-slate-700 bg-slate-900/70 p-3">
                      <p className="text-xs text-slate-400">{label}</p>
                      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-lg border border-cyan-300/20 bg-cyan-300/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-cyan-200">Agent 判断</p>
                  <p className="mt-2 text-sm leading-6 text-slate-100">
                    不是单一销售下滑，而是客流、活动和服务体验共同拉高续约风险。
                  </p>
                </div>

                <div className="mt-4 rounded-lg border border-slate-700 bg-slate-900/70 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">下一步</p>
                  <p className="mt-2 text-sm leading-6 text-slate-200">
                    生成 14 天改善任务，并将执行效果回流商场续约评估。
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="pb-2 text-sm font-medium text-slate-400">多源经营证据</p>
        </div>
      </section>

      <section className="bg-slate-50 text-slate-950">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
          <div className="mb-7 max-w-3xl">
            <p className="text-sm font-semibold text-cyan-700">Evidence</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950">
              把分散在各处的经营证据，变成可追踪的判断依据
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {evidenceCards.map(card => {
              const Icon = card.icon;

              return (
                <div key={card.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-950">{card.title}</h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {card.items.map(item => (
                      <span key={item} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white text-slate-950">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
          <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-semibold text-cyan-700">Multi-Agent</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-950">不是一次性打分，而是一组持续工作的经营 Agent</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-600">
              Agent 不只报警，还会组织证据、判断根因、生成动作、追踪执行，并把新结果带回下一次判断。
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {agentCards.map(card => {
              const Icon = card.icon;

              return (
                <div key={card.title} className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                  <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-white text-slate-900 shadow-sm">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-950">{card.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{card.text}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-5 rounded-lg border border-cyan-200 bg-cyan-50 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
              <div className="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-cyan-600 text-white">
                <GitBranch className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-950">记忆与迭代</h3>
                <p className="mt-2 text-sm leading-7 text-slate-700">
                  系统保留每个商户的历史问题、巡店记录、扶持动作、谈判记录和改善结果。新的巡店数据会回流优化预警判断；执行效果会沉淀为下一次策略推荐依据。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-950 text-slate-50">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
          <div className="mb-7 max-w-3xl">
            <p className="text-sm font-semibold text-cyan-300">Why Agent</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">规则负责发现异常，Agent 负责推进判断和行动</h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-slate-700 bg-slate-900 p-5">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-slate-300">
                <TrendingDown className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold text-white">规则看板</h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                销售下降 15%，触发风险预警。固定阈值可以发现异常，但通常停留在一次性提醒。
              </p>
            </div>
            <div className="rounded-lg border border-cyan-300/30 bg-cyan-300/10 p-5">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-300 text-slate-950">
                <Target className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold text-white">AI Agent</h3>
              <p className="mt-3 text-sm leading-7 text-cyan-50">
                销售下降后继续追问：是低峰客流下降、活动核销变差、服务评分下滑，还是上次改善没有执行到位？系统会串联证据、历史和执行状态，给出原因判断、任务和验证路径。
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 text-slate-950">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
          <div className="mb-6 max-w-3xl">
            <p className="text-sm font-semibold text-cyan-700">Users</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950">它解决谁的问题？</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {audienceCards.map(card => {
              const Icon = card.icon;

              return (
                <div key={card.role} className="rounded-lg border border-slate-200 bg-white p-5">
                  <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-900">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-950">{card.role}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{card.question}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white text-slate-950">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr]">
            <div>
              <p className="text-sm font-semibold text-cyan-700">Demo Case</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-950">当前演示案例：望潮港火锅续约风险升级</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                望潮港火锅代表一个商场里的具体商户。演示重点不是单一业态，而是商场如何把多源证据、Agent 研判、商户改善执行和续约判断连成闭环。
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {caseCards.map(card => (
                <div key={card.title} className="rounded-lg border border-slate-200 bg-slate-50 p-5">
                  <h3 className="text-base font-semibold text-slate-950">{card.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{card.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 text-slate-950">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
          <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-semibold text-cyan-700">Product Demo</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-950">进入产品演示</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-600">
              两个工作台展示同一个案例的不同视角：商场端负责判断和下发，商户端负责执行和反馈。
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {demoCards.map(card => {
              const Icon = card.icon;

              return (
                <Link
                  key={card.name}
                  href={card.href}
                  className="group rounded-lg border border-slate-200 bg-white p-5 transition hover:border-cyan-200 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700">
                      <Icon className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-cyan-700" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-slate-950">{card.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{card.description}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {card.tags.map(tag => (
                      <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="mt-6 text-sm font-semibold text-slate-950">{card.cta}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-cyan-300/10 bg-slate-950">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-white sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <div>
            <p className="text-sm font-semibold text-cyan-300">Next</p>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              下一步：扩展为连锁商家 AI 经营参谋，支持品牌总部发现问题、下发策略，单店执行并回流经营效果。
            </p>
          </div>
          <Link
            href="/workspace"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200"
          >
            查看商场工作台
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
