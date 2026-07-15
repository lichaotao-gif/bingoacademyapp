import { Link } from 'react-router-dom'
import { getAiTestRecords } from '../utils/aiTestRecordsStorage'

function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return '近期'
  }
}

function TimelineIcon({ type }) {
  const shapes = {
    test: <><path d="M7 3.75h8l2 2v14.5H7z" /><path d="M15 3.75v3h2M10 11h4M10 14.5h4M10 18h2" /></>,
    study: <><path d="M4 6.5c2.7-1.35 5.35-1.35 8 0v12c-2.65-1.35-5.3-1.35-8 0zM20 6.5c-2.7-1.35-5.35-1.35-8 0v12c2.65-1.35 5.3-1.35 8 0z" /></>,
    work: <><rect x="4" y="5" width="16" height="14" rx="2" /><circle cx="9" cy="10" r="1.25" /><path d="m6.5 16 4-4 2.5 2.3 2-1.8 2.5 3.5" /></>,
  }
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">{shapes[type]}</svg>
}

export default function GrowthTrajectory() {
  const tests = getAiTestRecords()
  const testItems = tests.map((test) => ({
    id: test.id, type: 'test', title: test.testName || 'AI 测评',
    desc: `完成测评，得分 ${test.accPct ?? '—'} 分${test.correct != null ? `，答对 ${test.correct}/${test.n} 题` : ''}`,
    date: fmtDate(test.createdAt), score: test.accPct,
  }))
  const learningItems = [
    { id: 'learn-1', date: '2026年7月14日', title: 'AI 启蒙通识课 · 第 3 章', desc: '完成「认识机器学习」学习与随堂练习，学习时长 32 分钟。', progress: '课程学习' },
    { id: 'learn-2', date: '2026年7月10日', title: 'AI 启蒙通识课 · 第 2 章', desc: '完成「数据与算法」学习与课后任务，解锁下一章。', progress: '课程学习' },
  ]
  const competitionItems = [
    { id: 'event-1', date: '2026年7月12日', title: '全国青少年人工智能创新挑战赛', desc: '已收藏赛事并完成参赛信息登记，待开启作品提交。', progress: '赛事记录' },
    { id: 'event-2', date: '2026年6月28日', title: '青少年科技创新大赛', desc: '完成“智能应用”赛道报名，正在准备参赛作品。', progress: '赛事记录' },
  ]

  return (
    <main className="trajectory-page max-w-5xl mx-auto px-4 sm:px-6 py-7 sm:py-10">
      <header className="trajectory-header">
        <Link to="/growth" className="trajectory-back">← 返回成长规划</Link>
        <div className="trajectory-heading">
          <div>
            <p>GROWTH TIMELINE</p>
            <h1>成长轨迹</h1>
            <span>记录每一次学习、测评与创作的进步</span>
          </div>
        </div>
      </header>

      <section className="trajectory-content" aria-labelledby="trajectory-list-title">
        <div className="trajectory-section-title"><div><p>MY JOURNEY</p><h2 id="trajectory-list-title">我的成长记录</h2></div></div>
        <div className="trajectory-groups">
          <TrajectoryGroup title="学习课程记录" type="study" items={learningItems} />
          <TrajectoryGroup title="测评记录" type="test" items={testItems} emptyAction />
          <TrajectoryGroup title="竞赛记录" type="work" items={competitionItems} />
        </div>
      </section>
    </main>
  )
}

function TrajectoryGroup({ title, type, items, emptyAction = false }) {
  return (
    <section className={`trajectory-group trajectory-group--${type}`} aria-label={title}>
      <div className="trajectory-group-title"><span><TimelineIcon type={type} /></span><h2>{title}</h2><b>{items.length}</b></div>
      {items.length ? (
        <ol className="trajectory-list">
          {items.map((item) => (
            <li key={item.id} className="trajectory-item">
              <span className="trajectory-dot"><TimelineIcon type={type} /></span>
              <article>
                <div className="trajectory-item-head"><time>{item.date}</time>{item.score != null ? <span>{item.score} 分</span> : <span>{item.progress}</span>}</div>
                <h3>{item.title}</h3><p>{item.desc}</p>
                {type === 'test' && item.id && <Link to={`/events/ai-test?record=${encodeURIComponent(item.id)}`}>查看测评报告 →</Link>}
              </article>
            </li>
          ))}
        </ol>
      ) : (
        <div className="trajectory-group-empty"><p>暂未生成测评记录，完成测评后会自动显示在这里。</p>{emptyAction && <Link to="/events/ai-test?category=comprehensive">开始综合测评</Link>}</div>
      )}
    </section>
  )
}
