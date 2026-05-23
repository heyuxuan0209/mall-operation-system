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
  RefreshCcw,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Star,
  Store,
  UsersRound,
} from 'lucide-react';

const evidenceCards = [
  { title: '销售证据', items: ['营业额', '订单量', '客单价', '坪效', '租售比'], icon: BarChart3 },
  { title: '客流证据', items: ['曝光流量', '进店流量', '低峰客流', '转化趋势'], icon: Activity },
  { title: '合同证据', items: ['租约到期', '租金水平', '续约节点', '商务条款'], icon: FileText },
  { title: '活动证据', items: ['活动参与率', '活动毛利', '券核销率', '活动 ROI'], icon: Megaphone },
  { title: '口碑证据', items: ['评分变化', '评论内容', '投诉记录', '投诉反馈'], icon: Star },
  { title: '巡店证据', items: ['巡检记录', '巡检照片', '访谈记录', '整改记录'], icon: ClipboardCheck },
];

const painCards = [
  {
    title: '数据分散',
    text: '销售、客流、合同、活动、评分和巡检记录分散在不同系统和岗位里。',
  },
  {
    title: '经验依赖个人',
    text: '真正能串联证据、判断根因、推动改善的人，往往依赖少数资深专家。',
  },
  {
    title: '难以沉淀',
    text: '一旦人员流动，极易导致预警滞后，决策质量波动',
  },
];

const agentCards = [
  {
    title: '发现异常',
    text: '经营雷达每天扫描多源数据，找出真正经营异常的商户。',
    icon: SearchCheck,
  },
  {
    title: '串联证据',
    text: '把分散证据整理成链路：哪些指标变差、何时开始、和哪些事件相关。',
    icon: DatabaseZap,
  },
  {
    title: '生成建议',
    text: '诊断根因后生成专家建议，覆盖扶持、谈判、继续观察或汰换预案。',
    icon: BrainCircuit,
  },
  {
    title: '追踪验证',
    text: '把建议拆成任务，追踪执行结果，并把效果回流到下一次判断。',
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
    question: '商场如何评价我的经营风险？哪些问题会影响续约和资源支持？改善结果能否成为谈判依据？',
    icon: Store,
  },
];

const caseCards = [
  {
    title: '风险升级',
    text: '多项经营指标和巡店反馈同时走弱，租约 45 天后到期。',
  },
  {
    title: 'Agent 研判',
    text: '风险来自低峰客流、活动吸引力和服务体验的叠加。',
  },
  {
    title: '改善任务',
    text: '生成 14 天改善计划，并下发商户确认执行。',
  },
  {
    title: '续约回流',
    text: '改善结果回流商场，辅助续约、谈判或汰换判断。',
  },
];

const demoCards = [
  {
    name: '商场工作台',
    description: '风险识别、Agent 研判、方案下发、续约判断。',
    href: '/workspace',
    cta: '进入商场工作台',
    icon: LineChart,
  },
  {
    name: '商户改善工作台',
    description: '接收改善计划、执行任务、填写反馈、验证效果。',
    href: '/merchant-workspace',
    cta: '进入商户改善工作台',
    icon: Store,
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
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <section className="relative overflow-hidden border-b border-slate-200 bg-[#f7f9fc]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300 to-transparent" />
        <div className="absolute right-[-120px] top-[-160px] h-96 w-96 rounded-full bg-cyan-200/30 blur-3xl" />
        <div className="absolute bottom-[-180px] left-[-120px] h-96 w-96 rounded-full bg-sky-200/30 blur-3xl" />

        <div className="relative mx-auto flex min-h-[86vh] max-w-[1440px] flex-col px-5 py-6 sm:px-8 lg:px-12 xl:px-16">
          <header className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-cyan-200 shadow-sm">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-950">Mall Operation Agent</p>
                <p className="text-xs text-slate-500">商场运营 AI Agent 工作台</p>
              </div>
            </div>
            <div className="hidden items-center gap-3 sm:flex">
              <Link
                href="/workspace"
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition hover:text-slate-950"
              >
                商场工作台
              </Link>
              <Link
                href="/workspace"
                className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-cyan-300 hover:text-cyan-700"
              >
                查看演示
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </header>

          <div className="grid flex-1 items-center gap-12 py-10 lg:grid-cols-[0.95fr_1.05fr] lg:py-14">
            <div className="max-w-4xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white/80 px-3 py-1 text-sm font-medium text-cyan-800 shadow-sm">
                <ShieldCheck className="h-4 w-4" />
                多源经营证据 · 多 Agent 协同 · 专家经验沉淀
              </div>
              <h1 className="flex max-w-4xl flex-col text-4xl font-semibold leading-tight tracking-normal text-slate-950 sm:text-5xl lg:text-6xl">
                <span>把资深专家的经营判断</span>
                <span>变成商场可复用的 Agent 能力</span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                Mall Operation Agent 融合销售、客流、合同、活动、评分和巡店等多源证据，让多个 AI Agent 协同完成风险识别、根因诊断、专家建议、任务下发和效果回流。
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/workspace"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  进入商场工作台
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/merchant-workspace"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-cyan-300 hover:text-cyan-700"
                >
                  查看商户改善闭环
                </Link>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-xl shadow-slate-200/60 backdrop-blur">
              <div className="rounded-lg border border-slate-200 bg-white p-5">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">专家研判线程</p>
                    <p className="mt-1 text-xs text-slate-500">望潮港火锅 · 经营风险上升</p>
                  </div>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                    高风险
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {heroEvidence.map(([label, value]) => (
                    <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">{label}</p>
                      <p className="mt-2 text-lg font-semibold text-slate-950">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-lg border border-cyan-200 bg-cyan-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-cyan-800">Agent 研判</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    不只是销售下滑，而是低峰客流、活动吸引力和服务体验共同导致经营健康下降。
                  </p>
                </div>

                <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">专家建议</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    先执行 14 天改善计划，再回流续约评估。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f6f8fb]">
        <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:px-12 xl:px-16">
          <div className="mb-12">
            <div className="max-w-4xl">
              <p className="text-sm font-semibold text-cyan-700">Problem</p>
              <h2 className="mt-2 text-3xl font-semibold leading-tight text-slate-950 lg:text-4xl">
                商场不缺数据，缺的是可复制的经营研判能力
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-600">
                经营线索分散在不同系统和岗位里，真正能串联证据、判断根因、推动改善的人，往往依赖少数资深营运和招商专家
              </p>
            </div>
            <div className="mt-7 grid gap-4 md:grid-cols-3">
              {painCards.map(item => (
                <div key={item.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-base font-semibold text-slate-950">{item.title}</h3>
                  <p className="mt-3 text-[15px] leading-7 text-slate-600">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

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
                <div key={card.title} className="min-h-[172px] rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-950">{card.title}</h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {card.items.map(item => (
                      <span key={item} className="rounded-full bg-slate-100 px-3 py-1 text-[13px] font-medium text-slate-600">
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

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:px-12 xl:px-16">
          <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-semibold text-cyan-700">Agent Workflow</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-950">把专家判断过程，拆成可协作的 Agent 工作流</h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-slate-600">
              规则发现异常，Agent 继续判断为什么异常、该做什么、谁执行、结果是否有效
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
                  每一次巡店、扶持、谈判和改善结果，都会回流为下一次判断的依据。新的巡店数据会优化预警判断；执行效果会沉淀为下一次策略推荐依据。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f6f8fb]">
        <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:px-12 xl:px-16">
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

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-[1440px] px-5 py-12 sm:px-8 lg:px-12 xl:px-16">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-sm font-semibold text-cyan-700">Demo Case</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-950">演示案例：望潮港火锅续约风险升级</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                展示商场如何把风险研判、改善执行和续约判断连成闭环
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {demoCards.map(card => {
                  const Icon = card.icon;

                  return (
                    <Link
                      key={card.name}
                      href={card.href}
                      className="group rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-white hover:shadow-md"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-cyan-50 text-cyan-700">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <h3 className="text-base font-semibold text-slate-950">{card.name}</h3>
                            <ArrowRight className="h-4 w-4 flex-none text-slate-400 transition group-hover:translate-x-1 group-hover:text-cyan-700" />
                          </div>
                          <p className="mt-2 text-sm leading-6 text-slate-600">{card.description}</p>
                          <p className="mt-3 text-sm font-semibold text-slate-950">{card.cta}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
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

      <section className="bg-[#f6f8fb]">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-5 px-5 py-8 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-12 xl:px-16">
          <p className="max-w-3xl text-sm leading-6 text-slate-600">
            下一步：扩展为连锁商家 AI 经营参谋，支持品牌总部发现问题、下发策略，单店执行并回流经营效果
          </p>
          <Link
            href="/workspace"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            查看商场工作台
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
