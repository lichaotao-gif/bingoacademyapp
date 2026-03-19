import { Link } from 'react-router-dom'

// 成长计划 - 学员认证、套餐、AI测评、打卡积分、导师
export default function Growth() {
  const learnerItems = [
    { title: '学员认证', desc: '面向学员的AI技能与素养认证体系' },
    { title: 'AI技能等级认证', desc: '分等级考核，配套认证教材、辅导课程' },
    { title: '认证考核报名、备考资料、模拟测评', desc: '' },
    { title: '认证证书查询、展示', desc: '增强成就感，带动分享裂变' },
  ]
  const items = [
    { title: '分阶段成长套餐', desc: '入门-进阶-精通，配套教材、课程、教具' },
    { title: '个性化成长规划', desc: 'AI测评+定制学习方案' },
    { title: '成长打卡、积分奖励', desc: '积分可兑换教材/教具、课程优惠券' },
    { title: '长期导师跟进', desc: '一对一指导，提升留存' },
  ]
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-bingo-dark mb-2">成长计划</h1>
      <p className="text-slate-600 mb-6">免费测评 → 学习方案生成 → 阶段套餐 → 学习跟踪。入门/进阶/高阶测评、个性化学习路径、启蒙/进阶/竞赛/升学/就业套餐（套餐佣金比例与分享）、学习日历/任务打卡/积分兑换、1v1导师跟进（导师可分享学员方案赚佣金）</p>

      {/* 免费测评（与首页一致，直接引导去测评） */}
      <section className="mb-8">
        <h2 className="section-title mb-4">免费测评 · 推荐适合您的课程</h2>
        <div className="card p-6 bg-gradient-to-r from-cyan-50 to-sky-50 border-primary/20 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-slate-600">测一测孩子的AI素养与潜力，根据结果智能推荐课程与学习路径。</p>
            <p className="text-sm text-slate-500 mt-2">完成测评后可在本页查看阶段套餐与学习方案。</p>
          </div>
          <Link to="/growth#assess" className="btn-primary shrink-0">去测评</Link>
        </div>
      </section>

      <div id="assess" className="card p-6 bg-cyan-50/50 border-primary/20 mb-8">
        <h3 className="font-semibold text-primary mb-2">AI创作作品集 · 个人能力档案</h3>
        <p className="text-slate-600 text-sm">学习过程中按阶段形成AI创作作品集，系统自动汇总为个人AI能力档案，与认证中心打通，可对应认证等级与证书，助力升学与就业展示。</p>
      </div>

      {/* 学员认证（由认证中心移入，面向学员） */}
      <section className="mb-10">
        <h2 className="section-title">学员认证</h2>
        <p className="text-slate-600 text-sm mb-4">面向学员的AI技能与素养认证，与成长路径、作品集、能力档案衔接</p>
        <div className="grid md:grid-cols-2 gap-4">
          {learnerItems.map((item, i) => (
            <div key={i} className="card p-6">
              <h3 className="font-semibold text-primary">{item.title}</h3>
              {item.desc && <p className="text-sm text-slate-600 mt-1">{item.desc}</p>}
            </div>
          ))}
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-4">
        {items.map((item, i) => (
          <div key={i} className="card p-6">
            <h3 className="font-semibold text-primary">{item.title}</h3>
            <p className="text-sm text-slate-600 mt-1">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
