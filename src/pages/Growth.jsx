import { Link } from 'react-router-dom'

function GrowthIcon({ type }) {
  const paths = {
    plan: <><path d="M7 3.75h7.5L18 7.25v13H7z" /><path d="M14.5 3.75v3.5H18M10 11h5M10 14.5h5M10 18h3" /></>,
    compass: <><circle cx="12" cy="12" r="8.25" /><path d="m14.9 9.1-1.6 4.2-4.2 1.6 1.6-4.2z" /></>,
    stairs: <><path d="M4 18.5h16M5.5 18.5v-4h4v-4h4v-4h5.5" /><path d="m16 4.5 3 2-3 2" /></>,
    star: <path d="m12 3.8 2.52 5.12 5.65.82-4.09 3.98.97 5.62L12 16.7l-5.05 2.66.97-5.62-4.09-3.98 5.65-.82z" />,
  }
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">{paths[type]}</svg>
}

const modules = [
  {
    id: 'comprehensive', icon: 'compass', eyebrow: 'START HERE', title: '综合测评',
    desc: '一次了解当前 AI 素养基础，从五个能力维度获得课程与赛事建议。',
    detail: '适合首次测评或重新摸底', to: '/events/ai-test?category=comprehensive', cta: '开始综合测评', tone: 'blue', primary: true,
  },
  {
    id: 'cross', icon: 'stairs', eyebrow: 'STAGE ASSESSMENT', title: '跨阶测评',
    desc: '按启智、基础、精研、智创四个阶段选择，判断能否进入下一学习阶层。',
    detail: '覆盖 1–3、4–6、7–8、9 星段', to: '/events/ai-test?category=cross', cta: '选择阶段测评', tone: 'violet',
  },
  {
    id: 'star', icon: 'star', eyebrow: 'STAR ASSESSMENT', title: '星级测评',
    desc: '面向明确目标星级的能力检验，保留原有一至九星测评内容与报告。',
    detail: '选择目标星级开始测评', to: '/events/ai-test?category=star', cta: '选择星级测评', tone: 'amber',
  },
]

export default function Growth() {
  return (
    <main className="growth-page max-w-6xl mx-auto px-4 sm:px-6 py-7 sm:py-10">
      <section className="growth-planner" aria-labelledby="growth-planner-title">
        <div className="growth-planner-copy">
          <div className="growth-planner-icon"><GrowthIcon type="plan" /></div>
          <p className="growth-planner-kicker">PERSONAL GROWTH PLAN</p>
          <h2 id="growth-planner-title">成长规划</h2>
          <p>把测评、学习和竞赛沉淀为一份持续更新的成长方案。</p>
        </div>
        <Link to="/growth/planning" className="growth-planner-enter">进入成长规划 <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M4 10h11M11 5l5 5-5 5" /></svg></Link>
      </section>

      <section className="mt-10 sm:mt-12" aria-labelledby="growth-modules-title">
        <div className="flex items-end justify-between gap-4 mb-4 sm:mb-5">
          <div>
            <p className="text-xs font-semibold tracking-[0.14em] text-primary">ASSESSMENT CENTER</p>
            <h2 id="growth-modules-title" className="text-xl sm:text-2xl font-bold text-bingo-dark mt-1">选择测评方式</h2>
          </div>
          <p className="hidden sm:block text-sm text-slate-500">测评结果将自动进入上方成长规划</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {modules.map((module, index) => (
            <article key={module.id} className={`growth-module growth-module--${module.tone} ${module.primary ? 'growth-module--primary' : ''}`}>
              <div className="growth-module-top">
                <span className="growth-module-icon"><GrowthIcon type={module.icon} /></span>
                <span className="growth-module-number">0{index + 1}</span>
              </div>
              <p className="growth-module-eyebrow">{module.eyebrow}</p>
              <h3>{module.title}</h3>
              <p className="growth-module-desc">{module.desc}</p>
              <div className="growth-module-footer">
                <span>{module.detail}</span>
                <Link to={module.to} className="growth-module-link" aria-label={`${module.cta}，${module.title}`}>
                  {module.cta}
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M4 10h11M11 5l5 5-5 5" /></svg>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="growth-hint" aria-label="测评说明">
        <span className="growth-hint-mark" aria-hidden="true">i</span>
        <p><strong>不知道从哪开始？</strong>建议先完成「综合测评」，结果会进入成长规划，再根据诊断选择跨阶或星级测评。</p>
      </section>
    </main>
  )
}
