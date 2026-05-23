import Link from 'next/link';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  LineChart,
  MessageSquareText,
  RefreshCcw,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Store,
  UserRoundCheck,
  UsersRound,
} from 'lucide-react';

const audienceCards = [
  {
    role: '商场总经理',
    question: '哪些商户正在影响资产经营质量？续约风险会不会影响租金、坪效和业态组合？',
    icon: Building2,
  },
  {
    role: '营运经理',
    question: '哪些商户正在变差？现在该扶持什么动作，谁来跟进，什么时候验证？',
    icon: ClipboardCheck,
  },
  {
    role: '招商经理',
    question: '这个商户还值得继续续约谈判吗？需要调整条件，还是启动替换预案？',
    icon: UsersRound,
  },
  {
    role: '商户',
    question: '商场为什么认为我有风险？哪些问题最影响续约和资源支持？我做了改善，能否被商场看见？',
    icon: Store,
  },
];

const workflowSteps = [
  { title: '发现风险', text: '识别销售、客流、活动、评分等异常', icon: SearchCheck },
  { title: 'AI 研判', text: '判断问题根因和续约影响', icon: Sparkles },
  { title: '生成建议', text: '输出扶持、谈判或替换建议', icon: MessageSquareText },
  { title: '下发商户', text: '把专家建议转成改善任务', icon: UserRoundCheck },
  { title: '执行任务', text: '商户确认动作并反馈执行说明', icon: CheckCircle2 },
  { title: '效果回流', text: '把改善结果带回商场续约判断', icon: RefreshCcw },
];

const caseCards = [
  {
    title: '商场发现',
    text: '销售、人均消费、活动表现和经营评分下降，租约 45 天后到期。',
  },
  {
    title: 'AI 输出',
    text: '生成低峰客流改善、活动券门槛调整、服务排班优化等建议。',
  },
  {
    title: '商户执行',
    text: '店长确认任务，填写执行说明，系统追踪 7/14 天改善结果。',
  },
  {
    title: '商场回流',
    text: '根据执行结果调整续约风险判断，辅助继续谈判或替换预案。',
  },
];

const demoCards = [
  {
    name: '商场工作台',
    description: '用于风险识别、专家研判、方案下发和续约判断。',
    href: '/workspace',
    cta: '进入商场工作台',
    icon: LineChart,
    tags: ['风险研判', '扶持建议', '续约判断'],
  },
  {
    name: '商户改善工作台',
    description: '用于接收改善计划、执行任务、填写反馈和验证效果。',
    href: '/merchant-workspace',
    cta: '进入商户改善工作台',
    icon: Store,
    tags: ['任务确认', '执行反馈', '效果回流'],
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f7f8fb] text-slate-950">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-[88vh] max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-10">
          <header className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-950">Mall Operation Agent</p>
                <p className="text-xs text-slate-500">商场运营 AI 工作台</p>
              </div>
            </div>
            <Link
              href="/workspace"
              className="hidden items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-950 hover:text-slate-950 sm:flex"
            >
              查看演示
              <ArrowRight className="h-4 w-4" />
            </Link>
          </header>

          <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:py-14">
            <div className="max-w-3xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800">
                <ShieldCheck className="h-4 w-4" />
                商户续约风险 · 商场扶持动作 · 改善结果回流
              </div>
              <h1 className="text-4xl font-semibold leading-tight tracking-normal text-slate-950 sm:text-5xl lg:text-6xl">
                让商场运营从“发现问题”走到“改善闭环”
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                Mall Operation Agent 面向商业地产经营团队，帮助商场识别商户经营风险，生成扶持、谈判或替换建议，下发改善任务，并把执行结果回流到续约和资产经营判断中。
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
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-950"
                >
                  查看商户改善闭环
                </Link>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">望潮港火锅</p>
                    <p className="mt-1 text-xs text-slate-500">当前演示案例：续约风险改善闭环</p>
                  </div>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                    改善观察中
                  </span>
                </div>
                <div className="grid gap-3">
                  {workflowSteps.slice(0, 4).map((step, index) => {
                    const Icon = step.icon;

                    return (
                      <div key={step.title} className="flex gap-3 rounded-md border border-slate-200 bg-white p-3">
                        <div className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {index + 1}. {step.title}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">{step.text}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <p className="pb-2 text-sm font-medium text-slate-500">它解决谁的问题？</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
        <div className="mb-6 max-w-3xl">
          <p className="text-sm font-semibold text-slate-500">Users</p>
          <h2 className="mt-2 text-3xl font-semibold text-slate-950">围绕同一个商户问题，让不同角色看到自己的决策答案</h2>
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
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
          <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-semibold text-slate-500">Closed Loop</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-950">核心闭环</h2>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-slate-600">
              产品不是只给一张风险报表，而是把商场判断转成商户可执行任务，并追踪改善结果是否能影响续约判断。
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
            {workflowSteps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div key={step.title} className="relative rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-900 shadow-sm">
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-semibold text-slate-400">0{index + 1}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-950">{step.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-slate-500">{step.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr]">
          <div>
            <p className="text-sm font-semibold text-slate-500">Demo Case</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950">当前演示案例：望潮港火锅续约风险升级</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              望潮港火锅代表一个商场里的具体商户。演示重点不是餐饮业态本身，而是商场如何把经营风险识别、商户改善执行和续约判断连成闭环。
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {caseCards.map(card => (
              <div key={card.title} className="rounded-lg border border-slate-200 bg-white p-5">
                <h3 className="text-base font-semibold text-slate-950">{card.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{card.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
          <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <p className="text-sm font-semibold text-slate-500">Product Demo</p>
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
                  className="group rounded-lg border border-slate-200 bg-slate-50 p-5 transition hover:border-slate-300 hover:bg-white hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-slate-900 shadow-sm">
                      <Icon className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-slate-950" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold text-slate-950">{card.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{card.description}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {card.tags.map(tag => (
                      <span key={tag} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">
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

      <section className="bg-slate-950">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-8 text-white sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <div>
            <p className="text-sm font-semibold text-slate-300">Next</p>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              下一步将扩展为连锁商家 AI 经营参谋，支持品牌总部发现问题、下发策略，单店执行并回流经营效果。
            </p>
          </div>
          <Link
            href="/workspace"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
          >
            查看商场工作台
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
