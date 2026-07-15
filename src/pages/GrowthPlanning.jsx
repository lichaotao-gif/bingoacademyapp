import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getAiTestRecords } from '../utils/aiTestRecordsStorage'

function PlanIcon({ type }) {
  const shapes = {
    report: <><path d="M7 3.75h7.5L18 7.25v13H7z" /><path d="M14.5 3.75v3.5H18M10 11h5M10 14.5h5M10 18h3" /></>,
    route: <><path d="M5 19c1.5-5.5 10-3.5 8-9-1-2.75 1-4.75 5-5" /><circle cx="5" cy="19" r="1.5" /><circle cx="18" cy="5" r="1.5" /></>,
    timeline: <><path d="M5 5v14M19 5v14M8 8h8M8 16h8" /><circle cx="12" cy="12" r="2" /></>,
    download: <><path d="M12 3v11M8 10l4 4 4-4M5 17v3h14v-3" /></>,
  }
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">{shapes[type]}</svg>
}

const DIMENSIONS = [
  { name: 'AI 素养', score: 53, color: '#6561ef', state: '薄弱' },
  { name: '算法思维', score: 63, color: '#16a5df', state: '良好' },
  { name: '动手实践', score: 50, color: '#1ec477', state: '薄弱' },
  { name: '创新应用', score: 87, color: '#f59b12', state: '掌握' },
  { name: '审美创造', score: 50, color: '#e6479c', state: '薄弱' },
]

const EVALUATION_ITEMS = [
  { title: '认识人机感知', unit: '第一单元 AI 感知启蒙 · 算法思维', score: 100 },
  { title: '感知装置设计', unit: '第二单元 AI 感知升级工坊 · 创新应用', score: 100 },
  { title: '理解视觉感知原理', unit: '第三单元 AI 视觉探秘实验室 · 审美创造', score: 80 },
  { title: '图形特征与分类', unit: '第二单元 AI 视觉分类启蒙 · 创新应用', score: 100 },
]

const PLANNING_STAGES = [
  { phase: '阶段一', time: '现在–3个月', level: 'L5 → L6', title: '补齐基础能力', goal: '重点强化算法思维与动手实践，完成一次完整项目。', course: 'AI 精英进阶课', price: '¥698 起', courseTo: '/courses/detail/ai-advance-basic', event: '人工智能创新挑战赛', eventTo: '/events', tone: 'blue' },
  { phase: '阶段二', time: '3–6个月', level: 'L6 稳固', title: '形成项目能力', goal: '掌握模型训练基础，把创意方案转化为可展示作品。', course: '机器学习入门与实战', price: '¥698 起', courseTo: '/courses/detail/ai-advance-ml', event: '青少年科技创新大赛', eventTo: '/events', tone: 'violet' },
  { phase: '阶段三', time: '6–12个月', level: 'L6 → L7', title: '突破竞赛实践', goal: '围绕优势方向持续打磨作品，完成至少一次赛事实践。', course: '白名单赛事通关营', price: '¥998', courseTo: '/courses?type=exam', event: '全国青少年科创赛事', eventTo: '/events', tone: 'rose' },
  { phase: '阶段四', time: '12–24个月', level: 'L7+', title: '沉淀成长成果', goal: '形成课程、认证、赛事与作品组合，为长期科创发展积累档案。', course: '科技特长生路径课', price: '¥1680 起', courseTo: '/courses?type=exam', event: '年度高阶白名单赛事', eventTo: '/events', tone: 'amber' },
]

function pointAt(index, ratio = 1, radius = 92) {
  const angle = (-90 + index * 72) * Math.PI / 180
  return `${170 + Math.cos(angle) * radius * ratio},${146 + Math.sin(angle) * radius * ratio}`
}

function RadarChart() {
  const rings = [1, .67, .34]
  const dataPoints = DIMENSIONS.map((item, index) => pointAt(index, item.score / 100)).join(' ')
  return <svg className="planning-radar" viewBox="0 0 340 300" role="img" aria-label="五维能力雷达图：创新应用 87% 最高，动手实践与审美创造 50% 有待提升">
    {rings.map((ring) => <polygon key={ring} points={DIMENSIONS.map((_, index) => pointAt(index, ring)).join(' ')} fill="none" stroke="#dbe5f1" strokeWidth="1.3" />)}
    {DIMENSIONS.map((_, index) => <line key={index} x1="170" y1="146" x2={pointAt(index).split(',')[0]} y2={pointAt(index).split(',')[1]} stroke="#dbe5f1" strokeWidth="1.2" />)}
    <polygon points={dataPoints} fill="rgba(99,91,255,.24)" stroke="#635bff" strokeWidth="3" strokeLinejoin="round" />
    {DIMENSIONS.map((item, index) => { const [x, y] = pointAt(index, 1.34).split(','); return <text key={item.name} x={x} y={y} textAnchor={Number(x) < 145 ? 'end' : Number(x) > 195 ? 'start' : 'middle'} dominantBaseline="middle">{item.name}</text> })}
    {DIMENSIONS.map((item, index) => { const [x, y] = pointAt(index, item.score / 100).split(','); return <circle key={item.name} cx={x} cy={y} r="4.5" fill="white" stroke={item.color} strokeWidth="3" /> })}
  </svg>
}

function StudentAvatar() {
  return <svg viewBox="0 0 96 96" role="img" aria-label="林一诺的卡通头像">
    <defs><linearGradient id="avatar-shirt" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#75e4ff" /><stop offset="1" stopColor="#635bff" /></linearGradient></defs>
    <circle cx="48" cy="48" r="46" fill="#dff7ff" />
    <path d="M20 91c2-20 13-29 28-29s27 9 29 29" fill="url(#avatar-shirt)" />
    <path d="M31 39c0-15 8-25 19-25 13 0 21 10 21 25v8c0 14-9 24-21 24-11 0-19-10-19-24z" fill="#ffd5b8" />
    <path d="M30 42c-5-19 6-33 22-33 14 0 23 10 22 27-8-1-14-5-19-11-5 8-14 13-25 17z" fill="#24355b" />
    <circle cx="42" cy="47" r="2.3" fill="#24355b" /><circle cx="59" cy="47" r="2.3" fill="#24355b" />
    <path d="M45 58c4 3 8 3 12 0" fill="none" stroke="#d67b77" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M37 68c4 5 8 7 13 7s10-2 14-7" fill="#fff" opacity=".9" />
  </svg>
}

export default function GrowthPlanning() {
  const [activeTab, setActiveTab] = useState('report')
  const tests = getAiTestRecords().slice(0, 2)
  const latestTest = tests[0]
  const trajectoryItems = [
    { date: '2026/7/15', type: 'test', label: '能力测评', title: latestTest?.testName || 'L5 综合能力测评', detail: latestTest ? `得分 ${latestTest.accPct} 分，答对 ${latestTest.correct}/${latestTest.n} 题，报告已同步至成长档案。` : '完成 L5 综合能力测评，得分 67 分，报告已同步至成长档案。', meta: '已完成' },
    { date: '2026/7/14', type: 'course', label: '课程学习', title: 'AI 启蒙通识课 · 第 3 章', detail: '完成“认识机器学习”课程学习与随堂练习，累计学习 32 分钟。', meta: '进度 75%' },
    { date: '2026/7/12', type: 'event', label: '竞赛准备', title: '全国青少年人工智能创新挑战赛', detail: '完成参赛信息登记，已进入作品创意与方案准备阶段。', meta: '准备中' },
    { date: '2026/7/10', type: 'course', label: '课程学习', title: 'AI 启蒙通识课 · 第 2 章', detail: '完成“数据与算法”学习及课后任务，解锁下一章节。', meta: '已完成' },
    { date: '2026/6/28', type: 'event', label: '竞赛记录', title: '青少年科技创新大赛', detail: '报名“智能应用”赛道，开始积累项目实践与作品材料。', meta: '已报名' },
  ]
  return (
    <main className="planning-page max-w-5xl mx-auto px-4 sm:px-6 py-7 sm:py-10">
      <header className="planning-topbar">
        <Link to="/growth" className="planning-back">← 返回 AI 成长规划</Link>
        <Link to="/profile/test" className="planning-download"><PlanIcon type="download" /> 下载成长报告</Link>
      </header>

      <section className="planning-tabs" aria-label="成长报告、成长规划与成长轨迹">
        <div className="planning-tab-list planning-tab-list--three" role="tablist" aria-label="成长规划内容切换">
          <button type="button" role="tab" aria-selected={activeTab === 'report'} onClick={() => setActiveTab('report')} className={activeTab === 'report' ? 'is-active' : ''}><PlanIcon type="report" /> 成长报告</button>
          <button type="button" role="tab" aria-selected={activeTab === 'plan'} onClick={() => setActiveTab('plan')} className={activeTab === 'plan' ? 'is-active' : ''}><PlanIcon type="route" /> 成长规划</button>
          <button type="button" role="tab" aria-selected={activeTab === 'trajectory'} onClick={() => setActiveTab('trajectory')} className={activeTab === 'trajectory' ? 'is-active' : ''}><PlanIcon type="timeline" /> 成长轨迹</button>
        </div>

      {activeTab === 'report' && (
      <section className="planning-report" aria-labelledby="planning-report-title">
        <div className="planning-report-head planning-report-head--game">
          <div className="planning-student">
            <span className="planning-student-avatar"><StudentAvatar /></span>
            <div className="planning-student-copy"><p>AI GROWTH PLAYER</p><h1 id="planning-report-title">林一诺</h1><span>最后测评 · 2026/7/15</span><div className="planning-student-tags"><b>二阶基础</b><b>角色 · 控制师</b></div></div>
          </div>
          <aside className="planning-level-card" aria-label="当前等级 L5，距离 L6 还差 33%">
            <div className="planning-level-card-top"><span>CURRENT LEVEL</span><b>白银段位</b></div>
            <div className="planning-level-value"><strong>L5</strong><div><b>AI 控制师</b><span>已完成本级 67%</span></div></div>
            <div className="planning-level-progress"><i><b style={{ width: '67%' }} /></i><span>距离 L6 还差 33%</span></div>
          </aside>
        </div>
        <div className="planning-report-body">
          <article className="planning-profile-summary">
            <div><span>学习阶段</span><strong>二阶基础</strong><p>能控制 AI 系统，理解传感器与决策</p></div>
            <div><span>角色称号</span><strong>控制师</strong><p>AI 素养等级标识</p></div>
          </article>
          <article className="planning-score-summary planning-score-summary--game">
            <div className="planning-score-orb"><strong>67<small>%</small></strong><span>综合得分率</span></div>
            <div className="planning-score-track"><div><span>本次测评表现</span><b>达标 · 超过 53% 同龄学员</b></div><i><b style={{ width: '67%' }} /></i><p>保持创新应用优势，下一阶段重点提升动手实践与算法思维。</p></div>
          </article>
          <article className="planning-insight">
            <span>AI 学员画像</span><p>林一诺同学对新技术保持强烈好奇心，能够主动把生活中的问题转化为 AI 创意方案；在创新应用与项目表达上表现突出。当前可通过编程实操、结构化任务和阶段复盘，进一步强化动手实践与算法思维，逐步形成“发现问题—设计方案—完成作品”的完整能力闭环。</p>
          </article>
          <article className="planning-dimensions">
            <div className="planning-section-heading"><div><p>ABILITY MAP</p><h2>五维能力雷达图</h2></div><span>同龄参考 P53</span></div>
            <div className="planning-dimension-grid">
              <RadarChart />
              <div className="planning-dimension-bars">
                {DIMENSIONS.map((item) => <div key={item.name}><span>{item.name}</span><i><b style={{ width: `${item.score}%`, background: item.color }} /></i><strong>{item.score}%</strong></div>)}
              </div>
            </div>
          </article>
        </div>
        <div className="planning-mastery">
          <div className="planning-section-heading"><div><p>DIMENSION OVERVIEW</p><h2>维度掌握概览</h2></div></div>
          <div>{DIMENSIONS.map((item) => <article key={item.name} className={`planning-mastery-card planning-mastery-card--${item.state}`}><strong>{item.score}%</strong><span>{item.name}</span><b>{item.state}</b></article>)}</div>
        </div>
        <div className="planning-evaluation">
          <div className="planning-section-heading"><div><p>EVALUATION DETAILS</p><h2>评价要点明细 <span>（共 27 项）</span></h2></div></div>
          <div className="planning-evaluation-list">
            {EVALUATION_ITEMS.map((item) => <article key={item.title}><div><h3>{item.title}</h3><p>{item.unit}</p></div><strong>{item.score}%<small>{item.score === 100 ? '1/1 题' : '4/5 题'}</small></strong><i><b style={{ width: `${item.score}%` }} /></i></article>)}
          </div>
        </div>
      </section>
      )}

        {activeTab === 'plan' ? (
          <div className="planning-tab-panel" role="tabpanel">
            <div className="planning-tab-heading"><div><p>LONG-TERM GROWTH PLAN</p><h2>长期成长规划</h2><span>像人生规划一样，把未来两年的课程学习与赛事实践拆成可执行阶段。</span></div></div>
            <ol className="planning-stage-grid">
              {PLANNING_STAGES.map((stage, index) => <PlanningStage key={stage.phase} stage={stage} index={index} />)}
            </ol>
          </div>
        ) : activeTab === 'trajectory' ? (
          <div className="planning-tab-panel" role="tabpanel">
            <div className="planning-tab-heading"><div><p>MY GROWTH TIMELINE</p><h2>成长轨迹</h2><span>学习课程、能力测评与竞赛准备会持续沉淀在这里。</span></div></div>
            <ol className="planning-growth-timeline">
              {trajectoryItems.map((item) => <GrowthTimelineItem key={`${item.date}-${item.title}`} item={item} />)}
            </ol>
          </div>
        ) : null}
      </section>
    </main>
  )
}

function PlanningStage({ stage, index }) {
  return <li className={`planning-stage planning-stage--${stage.tone}`}>
    <div className="planning-stage-top"><span>{String(index + 1).padStart(2, '0')}</span><div><p>{stage.phase} · {stage.time}</p><b>{stage.level}</b></div></div>
    <h3>{stage.title}</h3><p className="planning-stage-goal">{stage.goal}</p>
    <section className="planning-stage-item planning-stage-item--course">
      <span><PlanIcon type="report" /></span><div><small>推荐课程</small><strong>{stage.course}</strong><b>{stage.price}</b></div>
      <Link to={stage.courseTo}>立即购买</Link>
    </section>
    <section className="planning-stage-item planning-stage-item--event">
      <span><PlanIcon type="timeline" /></span><div><small>推荐赛事</small><strong>{stage.event}</strong></div>
      <Link to={stage.eventTo}>进入赛事</Link>
    </section>
  </li>
}

function GrowthTimelineItem({ item }) {
  const iconType = item.type === 'course' ? 'report' : item.type === 'event' ? 'timeline' : 'route'
  return <li className={`planning-growth-item planning-growth-item--${item.type}`}>
    <time>{item.date}</time>
    <span className="planning-growth-dot"><PlanIcon type={iconType} /></span>
    <article>
      <div className="planning-growth-item-head"><span>{item.label}</span><b>{item.meta}</b></div>
      <h3>{item.title}</h3><p>{item.detail}</p>
    </article>
  </li>
}
