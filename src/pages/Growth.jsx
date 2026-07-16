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

const DIMENSIONS = [
  { name: 'AI素养', score: 53 },
  { name: '算法思维', score: 63 },
  { name: '动手实践', score: 50 },
  { name: '创新应用', score: 87 },
  { name: '审美创造', score: 50 },
]

const modules = [
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

function radarPoint(index, ratio = 1, radius = 67) {
  const angle = (-90 + index * 72) * Math.PI / 180
  return `${112 + Math.cos(angle) * radius * ratio},${103 + Math.sin(angle) * radius * ratio}`
}

function GrowthRadar() {
  const dataPoints = DIMENSIONS.map((item, index) => radarPoint(index, item.score / 100)).join(' ')
  return (
    <svg className="growth-planner-radar" viewBox="0 0 224 212" role="img" aria-label="五维能力雷达图：AI素养53，算法思维63，动手实践50，创新应用87，审美创造50">
      {[1, .66, .33].map((ring) => <polygon key={ring} points={DIMENSIONS.map((_, index) => radarPoint(index, ring)).join(' ')} fill="none" stroke="rgba(219,244,255,.30)" strokeWidth="1" />)}
      {DIMENSIONS.map((_, index) => <line key={index} x1="112" y1="103" x2={radarPoint(index).split(',')[0]} y2={radarPoint(index).split(',')[1]} stroke="rgba(219,244,255,.22)" />)}
      <polygon points={dataPoints} fill="rgba(125,243,255,.28)" stroke="#8cf6ff" strokeWidth="2.5" strokeLinejoin="round" />
      {DIMENSIONS.map((item, index) => {
        const [x, y] = radarPoint(index, 1.28).split(',')
        return <text key={item.name} x={x} y={y} textAnchor={Number(x) < 96 ? 'end' : Number(x) > 128 ? 'start' : 'middle'} dominantBaseline="middle">{item.name}</text>
      })}
      {DIMENSIONS.map((item, index) => {
        const [x, y] = radarPoint(index, item.score / 100).split(',')
        return <circle key={item.name} cx={x} cy={y} r="3.2" fill="#ffffff" stroke="#72eaf5" strokeWidth="2" />
      })}
    </svg>
  )
}

export default function Growth() {
  return (
    <main className="growth-page max-w-6xl mx-auto px-4 sm:px-6 py-7 sm:py-10">
      <section className="growth-planner growth-planner--dashboard" aria-labelledby="growth-planner-title">
        <img className="growth-planner-image" src={`${import.meta.env.BASE_URL}hero-2.png`} alt="" aria-hidden="true" />
        <div className="growth-planner-overlay" aria-hidden="true" />

        <div className="growth-planner-copy">
          <div className="growth-planner-user">
            <span className="growth-planner-avatar" aria-hidden="true">
              <svg viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="30" fill="#BFF6FF" />
                <path d="M12 62c2-14 9-21 20-21s18 7 20 21" fill="#7C5CFC" />
                <path d="M20 28c0-11 5-18 13-18 9 0 15 7 15 18v6c0 10-7 17-15 17s-13-7-13-17z" fill="#FFD7B8" />
                <path d="M19 29C16 15 24 7 34 7c10 0 16 8 15 20-6-1-10-4-14-8-4 5-9 8-16 10z" fill="#263A67" />
                <circle cx="28" cy="32" r="1.7" fill="#263A67" /><circle cx="39" cy="32" r="1.7" fill="#263A67" />
                <path d="M29 40c3 2 6 2 9 0" stroke="#D57770" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
            <div><b>林一诺的成长空间</b><span>当前学习 · L1 星级课程《AI 启蒙通识课》</span></div>
          </div>
          <p className="growth-planner-kicker">PERSONAL GROWTH PLAN</p>
          <h1 id="growth-planner-title">AI 成长规划</h1>
          <p className="growth-planner-description">把每一次测评、课程学习和赛事实践汇入成长档案，持续生成适合你的学习路径。</p>
          <div className="growth-planner-stats" aria-label="成长数据概览">
            <div><strong>67<small>%</small></strong><span>综合表现</span></div>
            <div><strong>12</strong><span>学习记录</span></div>
            <div><strong>3</strong><span>成长阶段</span></div>
          </div>
          <Link to="/growth/planning" className="growth-planner-enter">查看我的成长规划 <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M4 10h11M11 5l5 5-5 5" /></svg></Link>
        </div>

        <aside className="growth-planner-ability" aria-label="林一诺的五维能力概览">
          <div className="growth-planner-ability-head"><div><span>能力快照</span><strong>五维能力雷达</strong></div><b>最近更新 7/15</b></div>
          <GrowthRadar />
          <p><span />优势能力：创新应用 <strong>87%</strong></p>
        </aside>
      </section>

      <section className="growth-comprehensive" aria-labelledby="growth-comprehensive-title">
        <div className="growth-comprehensive-icon"><GrowthIcon type="compass" /></div>
        <div className="growth-comprehensive-copy">
          <p>COMPREHENSIVE ASSESSMENT</p>
          <h2 id="growth-comprehensive-title">综合评测</h2>
          <span>通过动态综合测评了解当前 AI 素养基础，结果将同步进入成长规划并生成课程与赛事建议。</span>
        </div>
        <div className="growth-comprehensive-action">
          <span><b>约 15</b> 分钟完成</span>
          <Link to="/events/ai-test?category=comprehensive">开始综合测评 <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M4 10h11M11 5l5 5-5 5" /></svg></Link>
        </div>
      </section>

      <section className="mt-10 sm:mt-12" aria-labelledby="growth-modules-title">
        <div className="flex items-end justify-between gap-4 mb-4 sm:mb-5">
          <div>
            <p className="text-xs font-semibold tracking-[0.14em] text-primary">ASSESSMENT CENTER</p>
            <h2 id="growth-modules-title" className="text-xl sm:text-2xl font-bold text-bingo-dark mt-1">专项测评</h2>
          </div>
          <p className="hidden sm:block text-sm text-slate-500">进一步验证阶段与星级能力</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {modules.map((module, index) => (
            <article key={module.id} className={`growth-module growth-module--${module.tone}`}>
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
        <p><strong>不知道从哪开始？</strong>建议先完成上方「综合评测」，再根据成长报告选择跨阶或星级测评。</p>
      </section>
    </main>
  )
}
