const explorations = [
  { title: 'AI 感知实验室', subtitle: '用声音、光线和距离信号完成感知挑战', href: '/explorations/sense-lab.html', mark: 'SENSE', cover: 'from-cyan-500 via-sky-600 to-blue-800', shape: 'bg-cyan-200/35' },
  { title: '智能分类训练营', subtitle: '观察特征，训练你的第一套分类规则', href: '/explorations/sort-trainer.html', mark: 'CLASSIFY', cover: 'from-violet-500 via-fuchsia-600 to-indigo-800', shape: 'bg-fuchsia-200/30' },
  { title: '机器人的路线', subtitle: '编排指令，让机器人抵达目标位置', href: '/explorations/robot-route.html', mark: 'ROUTE', cover: 'from-amber-400 via-orange-500 to-rose-600', shape: 'bg-amber-100/40' },
  { title: '提示词魔法工坊', subtitle: '选择清晰指令，生成更准确的 AI 回应', href: '/explorations/prompt-workshop.html', mark: 'PROMPT', cover: 'from-emerald-500 via-teal-600 to-cyan-800', shape: 'bg-emerald-100/35' },
]

export default function Tools() {
  return (
    <main className="bg-slate-50 pb-16">
      <section className="relative overflow-hidden bg-[#10213d] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_24%,rgba(34,211,238,.30),transparent_22%),radial-gradient(circle_at_58%_94%,rgba(139,92,246,.27),transparent_27%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-18">
          <p className="text-sm font-semibold tracking-[0.2em] text-cyan-200">AI EXPLORATION LAB</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">在小游戏里，<br />探索人工智能</h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-slate-300">从感知、分类到编程与提示词，用一段段可互动的 HTML 小游戏，开启轻量、有趣的 AI 学习体验。</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6" aria-labelledby="exploration-list-title">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-primary">EXPLORE & PLAY</p>
            <h2 id="exploration-list-title" className="mt-1 text-2xl font-bold text-bingo-dark">探索列表</h2>
          </div>
          <p className="text-sm text-slate-500">选择一个主题，立即开始</p>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {explorations.map((item) => (
            <article key={item.href} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
              <div className={`relative aspect-[4/3] overflow-hidden bg-gradient-to-br ${item.cover} p-5 text-white`}>
                <div className={`absolute -right-8 -top-8 h-36 w-36 rounded-full ${item.shape} blur-sm`} />
                <div className="absolute bottom-5 left-5 right-5">
                  <p className="text-xs font-semibold tracking-[0.18em] text-white/70">{item.mark}</p>
                  <div className="mt-3 h-1 w-14 rounded-full bg-white/80" />
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-bingo-dark">{item.title}</h3>
                <p className="mt-2 min-h-12 text-sm leading-6 text-slate-500">{item.subtitle}</p>
                <a href={item.href} className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">开始探索</a>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
