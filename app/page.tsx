import Link from 'next/link';
import { ArrowRight, Building2, CheckCircle2, ChefHat, GitBranch, ShieldCheck, Sparkles } from 'lucide-react';

const products = [
  {
    name: '商场工作台',
    description: '面向商场运营团队，识别商户健康、续约风险、扶持与替换决策。',
    href: '/workspace',
    cta: '进入商场工作台',
    icon: Building2,
    stats: ['续约风险研判', '专家建议生成', '商户执行回流'],
  },
  {
    name: '门店改善工作台',
    description: '面向餐饮门店，把商场专家建议转成可执行任务，并追踪改善效果。',
    href: '/merchant-workspace',
    cta: '进入门店改善工作台',
    icon: ChefHat,
    stats: ['14 天改善计划', '店长执行确认', '效果验证回流'],
  },
];

const signals = [
  '同一个望潮港火锅案例贯通商场与门店视角',
  '从风险发现、方案下发、任务执行到回流评估形成闭环',
  '适合作为 AI 经营工作台、商业地产运营 Agent 的产品演示',
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f7f8fb] text-slate-950">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-[74vh] max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-10">
          <header className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-white">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-950">Mall Operation Agent</p>
                <p className="text-xs text-slate-500">AI 经营研判与改善闭环</p>
              </div>
            </div>
            <Link
              href="/workspace"
              className="hidden items-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-950 hover:text-slate-950 sm:flex"
            >
              打开演示
              <ArrowRight className="h-4 w-4" />
            </Link>
          </header>

          <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.08fr_0.92fr] lg:py-16">
            <div className="max-w-3xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800">
                <ShieldCheck className="h-4 w-4" />
                商场端与门店端已形成可演示闭环
              </div>
              <h1 className="text-4xl font-semibold leading-tight tracking-normal text-slate-950 sm:text-5xl lg:text-6xl">
                AI 驱动的商场运营与门店改善工作台
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                从商场发现续约风险，到门店接收改善计划、执行任务、验证结果，再回流商场辅助续约判断。当前版本聚焦望潮港火锅案例，展示 AI 经营研判如何转化为可执行动作。
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
                  查看门店改善工作台
                </Link>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">望潮港火锅</p>
                    <p className="text-xs text-slate-500">续约风险改善闭环</p>
                  </div>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                    改善观察中
                  </span>
                </div>
                <div className="grid gap-3">
                  {[
                    ['商场研判', '销售、人均、活动表现下降，租约 45 天后到期'],
                    ['任务下发', '午市套餐、券门槛调整、服务排班优化'],
                    ['门店执行', '店长确认任务，填写执行说明并标记完成'],
                    ['效果回流', '商场侧读取执行结果，调整续约风险判断'],
                  ].map(([title, text]) => (
                    <div key={title} className="flex gap-3 rounded-md border border-slate-200 bg-white p-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-emerald-600" />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{title}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">{text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
        <div className="mb-5 flex items-end justify-between gap-6">
          <div>
            <p className="text-sm font-semibold text-slate-500">Product Demos</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">选择一个工作台开始演示</h2>
          </div>
          <div className="hidden items-center gap-2 text-sm text-slate-500 md:flex">
            <GitBranch className="h-4 w-4" />
            后续可扩展为项目合集入口
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {products.map(product => {
            const Icon = product.icon;

            return (
              <Link
                key={product.name}
                href={product.href}
                className="group rounded-lg border border-slate-200 bg-white p-5 transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-900">
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-slate-950" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-slate-950">{product.name}</h3>
                <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">{product.description}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {product.stats.map(stat => (
                    <span key={stat} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      {stat}
                    </span>
                  ))}
                </div>
                <p className="mt-6 text-sm font-semibold text-slate-950">{product.cta}</p>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 rounded-lg border border-slate-200 bg-white p-5">
          <p className="mb-4 text-sm font-semibold text-slate-950">当前演示重点</p>
          <div className="grid gap-3 lg:grid-cols-3">
            {signals.map(signal => (
              <div key={signal} className="rounded-md bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                {signal}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
