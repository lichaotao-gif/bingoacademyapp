import { useState } from 'react'
import { Link } from 'react-router-dom'

// ─── 数据 ────────────────────────────────────────────────

const PAIN_SCROLLS = [
  '孩子玩AI耽误学习？',
  '没AI课不知从何入手？',
  '只会用AI不会创造？',
  '学完AI无法对接升学？',
  '家长不懂AI怎么引导？',
  '竞赛、升学、素养该怎么选？',
]

const PAIN_SOLUTIONS = [
  {
    id: 'p1', icon: '📚', tag: '「没体系」焦虑',
    pain: '学校无AI课，孩子不知该系统学什么',
    solution: '分层课程体系，从启蒙到升学一站式覆盖',
    products: [
      { name: 'AI素养启蒙课（入门）', age: '6-10岁', desc: '培养AI认知，点击看详情', to: '/courses?type=literacy' },
      { name: 'AI进阶培优课（提升）', age: '11-14岁', desc: '实操AI工具，备战赛事', to: '/courses?type=contest' },
      { name: '科技特长生路径课（升学）', age: '15-18岁', desc: '对接升学政策，点击看详情', to: '/courses?type=exam' },
    ],
    stat: '全国300+城市学员同步学 · 课程完成率95%',
    cta: '免费领取试听课', ctaTo: '/courses',
    ctaColor: 'bg-orange-500 hover:bg-orange-600 text-white',
  },
  {
    id: 'p2', icon: '🏆', tag: '「怕无用」焦虑',
    pain: '学完AI，无法证明能力、对接升学',
    solution: '赛事+证书双体系，用成果对接升学，让能力被看见',
    products: [
      { name: '白名单赛事通关营', age: '官方集训', desc: '获奖率92%，点击报名', to: '/events' },
      { name: '国际AI赛事指导', age: '海外资源', desc: '提升背景，点击咨询', to: '/events/whitelist' },
      { name: 'AI能力等级证书', age: '权威认证', desc: '升学加分，点击报考', to: '/cert' },
    ],
    stat: '累计助力2000+学员成为科技特长生，考入重点名校',
    cta: '赛事报名入口', ctaTo: '/events',
    ctaColor: 'bg-orange-500 hover:bg-orange-600 text-white',
  },
  {
    id: 'p3', icon: '🎨', tag: '「会用不会创」焦虑',
    pain: '孩子只会用AI工具，缺乏思考与创造',
    solution: '「学-练-赛-创」闭环教学，让AI成为孩子的创作工具',
    products: [
      { name: 'AI创意实操课', age: '实操向', desc: '绘画/编程/写作结合AI创作', to: '/courses' },
      { name: '学员创客工坊', age: '线下+线上', desc: '打造专属AI作品，点击加入', to: '/research' },
    ],
    stat: '累计产出10万+学员AI原创作品 · 获全国科创大奖300+项',
    cta: '查看学员作品', ctaTo: '/showcase',
    ctaColor: 'bg-orange-500 hover:bg-orange-600 text-white',
  },
  {
    id: 'p4', icon: '👨‍👩‍👧', tag: '「家长不懂」焦虑',
    pain: '自己不懂AI，无法有效引导孩子',
    solution: '家长专属AI教育指导体系，做孩子的AI引路者',
    products: [
      { name: '家长必读课', age: '限时特惠', desc: '原价99元，现价9.9元，限时秒杀', to: '/courses?open=parent-99' },
      { name: 'AI教育社群', age: '免费加入', desc: '专业老师答疑，领《青少年AI教育指南》', to: '/community' },
    ],
    stat: '累计服务5万+家长 · 98%家长表示能有效引导孩子学AI',
    cta: '9.9元抢家长课', ctaTo: '/courses?open=parent-99',
    ctaColor: 'bg-orange-500 hover:bg-orange-600 text-white',
  },
]

const ENDORSEMENTS = [
  { icon: '🏅', label: '白名单赛事官方合作单位', color: 'text-amber-600' },
  { icon: '🎓', label: '科技特长生升学指导基地', color: 'text-sky-600' },
  { icon: '👥', label: '累计服务10万+学员', color: 'text-emerald-600' },
  { icon: '🏆', label: '赛事获奖率92%', color: 'text-violet-600' },
]

const B_SOLUTIONS = [
  { icon: '🏫', title: '线下机构课程合作', desc: '授牌+课程+师训+运营，一站式赋能', to: '/#/join' },
  { icon: '🤝', title: '线下加盟商', desc: '品牌授权+全体系支持，共创AI教育', to: '/franchise' },
  { icon: '⚙️', title: 'OEM合作', desc: '课程/教具/工具定制+品牌联名+技术输出', to: '/#/oem' },
]

const HOT_COURSES = [
  { name: 'AI素养启蒙·面向未来的第一课', to: '/courses?type=literacy', tag: '独家', desc: '6-10岁 · 8大AI认知模块' },
  { name: '白名单赛事通关营', to: '/courses?type=contest', tag: '竞赛', desc: '获奖率92% · 专业集训' },
  { name: '科技特长生路径课', to: '/courses?type=exam', tag: '升学', desc: '15-18岁 · 对接升学政策' },
]

const FREE_RESOURCES_C = [
  { title: '《6-18岁青少年AI教育学习路径指南》', tag: '资料包', icon: '📘' },
  { title: '《白名单赛事报考攻略+历年真题》', tag: '资料包', icon: '📋' },
  { title: '《家长引导孩子学AI的10个实用方法》', tag: '资料包', icon: '📗' },
  { title: '免费直播课·科技特长生升学政策解读', tag: '直播预约', icon: '🎥' },
]

const FREE_RESOURCES_B = [
  { title: '《教培机构AI教育转型全攻略》', tag: '资料包', icon: '📙' },
  { title: '《AI课程机构运营实操手册》', tag: '资料包', icon: '📒' },
  { title: '免费公开课·合作政策+盈利模式解析', tag: '直播预约', icon: '🎥' },
]

const REVIEWS = [
  { name: '李女士', city: '北京', text: '孩子参加白名单赛事获得全国一等奖，课程体系真的很完整！', tag: '科创特长生家长' },
  { name: '张先生', city: '上海', text: '从不会用AI到获科创大奖，短短半年进步太大了。', tag: '学员家长' },
  { name: '王校长', city: '深圳', text: '合作后机构营收提升了65%，课程体系和师资培训都非常专业。', tag: '合作机构负责人' },
]

// ─── 打卡悬浮按钮 ─────────────────────────────────────────
function CheckInFloat() {
  const [checked, setChecked] = useState(false)
  const [hidden, setHidden] = useState(false)
  if (hidden) return null
  return (
    <div className="fixed right-4 bottom-44 z-40 flex flex-col items-end gap-2">
      <button onClick={() => setChecked(true)} disabled={checked}
        className={'flex items-center gap-2 px-4 py-2.5 rounded-2xl shadow-lg text-sm font-medium transition ' +
          (checked ? 'bg-slate-400 text-white cursor-default' : 'bg-primary text-white hover:bg-cyan-600')}>
        <span className="text-base">{checked ? '✓' : '🏅'}</span>
        {checked ? '今日已打卡' : '今日打卡 +10分'}
      </button>
      <button onClick={() => setHidden(true)} className="text-xs text-slate-400 hover:text-slate-600 mr-1">不再提示</button>
    </div>
  )
}

// ─── 滚动痛点标语 ─────────────────────────────────────────
function PainScroller() {
  const [idx, setIdx] = useState(0)
  useState(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % PAIN_SCROLLS.length), 2200)
    return () => clearInterval(t)
  })
  return (
    <span className="inline-block text-orange-300 font-semibold transition-all duration-500">
      {PAIN_SCROLLS[idx]}
    </span>
  )
}

// ─── 留资弹窗 ────────────────────────────────────────────
function LeadModal({ title, onClose }) {
  const [submitted, setSubmitted] = useState(false)
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
        {submitted ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-3">✅</div>
            <h3 className="font-bold text-bingo-dark text-xl mb-2">已提交！</h3>
            <p className="text-slate-500 text-sm mb-5">资料将在5分钟内发送至您的手机，请注意查收</p>
            <button onClick={onClose} className="btn-primary px-8 py-2.5 text-sm">关闭</button>
          </div>
        ) : (
          <>
            <h3 className="font-bold text-bingo-dark text-xl mb-1">{title}</h3>
            <p className="text-slate-500 text-sm mb-5">填写手机号，立即免费领取</p>
            <form onSubmit={e => { e.preventDefault(); setSubmitted(true) }} className="space-y-3">
              <input required type="text" placeholder="孩子姓名（或机构名称）"
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary" />
              <input required type="tel" placeholder="家长/负责人手机号"
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary" />
              <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold text-sm transition">立即免费领取</button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

// ─── 主组件 ───────────────────────────────────────────────
export default function Home() {
  const [leadModal, setLeadModal] = useState(null)

  return (
    <div>
      <CheckInFloat />
      {leadModal && <LeadModal title={leadModal} onClose={() => setLeadModal(null)} />}

      {/* ══════════════════════════════════════════════════
          一、首屏英雄区 — 痛点 + 价值 + B/C分流
      ══════════════════════════════════════════════════ */}
      <section className="bg-gradient-to-br from-bingo-dark via-slate-800 to-cyan-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

            {/* 左：痛点 + 定位 */}
            <div className="flex-1 max-w-2xl">
              <p className="text-xs text-cyan-300 mb-3 tracking-widest font-medium">AI时代导航 · AI + 竞赛 + 全链条教育生态</p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4">
                AI时代学习指南，解锁青少年AI学习核心路径
              </h1>
              <p className="text-slate-300 text-base mb-3">解答AI学习困惑 / 选科方向 / 升学规划 · 测一测孩子的AI素养与潜力，智能匹配专属学习方案</p>
              {/* 滚动痛点 */}
              <div className="bg-white/10 rounded-xl px-5 py-3 mb-5 text-sm">
                <PainScroller />
              </div>
              <p className="text-slate-300 text-sm leading-relaxed mb-5">
                缤果AI学院——为<strong className="text-white">6-18岁青少年</strong>打造专属AI成长路径，<br className="hidden sm:block" />
                让家长不焦虑，让孩子<strong className="text-cyan-300">会用AI · 会思考 · 会创造！</strong>
              </p>
              {/* 背书小字 */}
              <div className="flex flex-wrap gap-3 mb-6">
                {ENDORSEMENTS.map((e, i) => (
                  <span key={i} className="flex items-center gap-1.5 text-xs bg-white/10 rounded-full px-3 py-1.5 text-white/90">
                    <span>{e.icon}</span>{e.label}
                  </span>
                ))}
              </div>
              {/* 向下提示 */}
              <p className="text-white/40 text-xs hidden lg:block animate-bounce">向下滚动，解锁专属AI教育解决方案 ↓</p>
            </div>

            {/* 右：CTA行动区 */}
            <div className="w-full lg:w-auto lg:min-w-[280px] space-y-3">
              {/* C端核心CTA */}
              <div className="bg-white/10 rounded-2xl p-5 border border-white/20">
                <p className="text-xs text-cyan-300 mb-3 font-medium">C端 · 家长 / 学员</p>
                <Link to="/events/ai-test"
                  className="flex items-center justify-between w-full bg-orange-500 hover:bg-orange-400 text-white px-5 py-3.5 rounded-xl font-bold text-sm transition mb-2.5 group">
                  <span>🧠 免费测评</span>
                  <span className="text-white/70 group-hover:text-white transition text-xs">最快3分钟 →</span>
                </Link>
                <Link to="/courses?open=hot"
                  className="flex items-center justify-between w-full bg-white/15 hover:bg-white/25 text-white px-5 py-3 rounded-xl text-sm transition mb-2.5">
                  <span>🎓 爆款课程限时抢</span>
                  <span className="text-white/60 text-xs">9.9元起 →</span>
                </Link>
                <Link to="/courses?open=parent-99"
                  className="flex items-center justify-between w-full bg-white/10 hover:bg-white/20 text-white px-5 py-3 rounded-xl text-sm transition">
                  <span>📖 9.9元家长课</span>
                  <span className="text-white/60 text-xs">原价99元 →</span>
                </Link>
              </div>
              {/* B端CTA */}
              <div className="bg-sky-900/50 rounded-2xl p-5 border border-sky-400/20 space-y-2.5">
                <p className="text-xs text-sky-300 font-medium">B端 · 机构 / 加盟商</p>
                <Link to="/franchise"
                  className="flex items-center justify-between w-full bg-sky-600 hover:bg-sky-500 text-white px-5 py-3 rounded-xl text-sm font-semibold transition">
                  <span>🏫 加盟合作咨询</span>
                  <span className="text-white/70 text-xs">免费获取方案 →</span>
                </Link>
                <Link to="/franchise-partner/login"
                  className="flex items-center justify-between w-full bg-white/10 hover:bg-white/20 text-white px-5 py-3 rounded-xl text-sm font-medium transition border border-sky-400/30">
                  <span>🔐 加盟商工作台登录</span>
                  <span className="text-sky-200 text-xs">推广 · 分佣 · 班级 →</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* ══════════════════════════════════════════════════
            二、AI焦虑解决方案区 — 4大痛点（C端）+ B端
        ══════════════════════════════════════════════════ */}
        <section className="py-14">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-bingo-dark mb-2">你的AI教育焦虑，我们一一解决</h2>
            <p className="text-slate-500 text-sm">每个痛点，都有专属解决方案 + 落地产品 + 可见结果</p>
          </div>

          {/* C端：4大焦虑卡 */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {PAIN_SOLUTIONS.map(ps => (
              <div key={ps.id} className="card p-6 hover:shadow-lg hover:border-primary/30 transition group">
                <div className="flex items-start gap-3 mb-4">
                  <span className="text-3xl shrink-0">{ps.icon}</span>
                  <div>
                    <span className="text-[11px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">{ps.tag}</span>
                    <p className="text-slate-500 text-xs mt-1">{ps.pain}</p>
                    <h3 className="font-bold text-bingo-dark text-sm mt-1 group-hover:text-primary transition">{ps.solution}</h3>
                  </div>
                </div>

                {/* 落地产品 */}
                <ul className="space-y-2 mb-4">
                  {ps.products.map((p, i) => (
                    <li key={i}>
                      <Link to={p.to}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-primary/5 hover:border-primary/20 border border-transparent transition">
                        <div>
                          <p className="text-sm font-medium text-bingo-dark">{p.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{p.age} · {p.desc}</p>
                        </div>
                        <span className="flex items-center gap-1.5 shrink-0 ml-2">
                          <button type="button" onClick={e => { e.preventDefault(); e.stopPropagation(); setLeadModal('领取专属方案：' + p.name) }} className="text-slate-400 hover:text-primary text-xs">❓ 点此解惑</button>
                          <span className="text-primary text-xs">→</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>

                {/* 结果背书 */}
                <p className="text-xs text-emerald-600 font-medium mb-4 flex items-center gap-1">
                  <span>✓</span>{ps.stat}
                </p>

                <Link to={ps.ctaTo}
                  className={'inline-block text-sm font-bold px-5 py-2.5 rounded-xl transition ' + ps.ctaColor}>
                  {ps.cta}
                </Link>
              </div>
            ))}
          </div>

          {/* B端：独立卡片 */}
          <Link to="/franchise" className="block card p-6 bg-gradient-to-r from-slate-800 to-sky-900 text-white border-sky-700/30 hover:border-sky-500/60 transition">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[11px] bg-sky-400/20 text-sky-300 px-2 py-0.5 rounded-full font-medium">B端 · 机构/加盟商</span>
                <h3 className="text-xl font-bold mt-2 mb-1">教培机构缺AI课程、师资、赛事资源？</h3>
                <p className="text-slate-300 text-sm">缤果AI学院全链条产教融合合作体系，品牌+课程+师资+赛事<strong className="text-white">一站式赋能</strong></p>
                <p className="text-xs text-sky-300 font-medium mt-2">全国合作机构500+ · 加盟商100+ · 合作机构营收平均提升60%</p>
              </div>
              <span className="shrink-0 bg-sky-500 hover:bg-sky-400 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition">免费获取合作方案 →</span>
            </div>
          </Link>
        </section>

        {/* ══════════════════════════════════════════════════
            三、核心产品与服务区
        ══════════════════════════════════════════════════ */}
        <section className="py-10 border-t">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-bingo-dark">核心产品与服务</h2>
              <p className="text-slate-500 text-sm mt-1">每个产品标注适用人群 + 核心价值 + 行动入口</p>
            </div>
          </div>

          {/* C端产品 */}
          <div className="mb-6">
            <p className="text-xs font-bold text-primary mb-3 tracking-wider">C端 · 家长 / 学员产品中心</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { icon: '🌱', title: 'AI素养课', sub: '6-10岁 · 素养与元认知', to: '/courses?type=literacy', cta: '立即报名', ctaClass: 'bg-orange-500 hover:bg-orange-600 text-white' },
                { icon: '🏆', title: '竞赛培优课', sub: '10-16岁 · 白名单/国际赛', to: '/courses?type=contest', cta: '集训报名', ctaClass: 'bg-blue-500 hover:bg-blue-600 text-white' },
                { icon: '🎓', title: '升学赋能课', sub: '15-18岁 · 科技特长生', to: '/courses?type=exam', cta: '测评报名', ctaClass: 'bg-emerald-500 hover:bg-emerald-600 text-white' },
                { icon: '🛒', title: 'AI智能商城', sub: '教具·教材·工具', to: '/mall', cta: '进入商城', ctaClass: 'bg-slate-500 hover:bg-slate-600 text-white' },
                { icon: '🏅', title: '赛事中心', sub: '报名·集训·证书', to: '/events', cta: '赛事报名入口', ctaClass: 'bg-blue-500 hover:bg-blue-600 text-white' },
                { icon: '📜', title: '认证中心', sub: '能力认证·升学背书', to: '/cert' },
              ].map((item, i) => (
                <div key={i} className={'card p-4 text-center hover:shadow-md hover:border-primary/30 hover:bg-primary/5 transition group relative ' + (item.cta ? 'pb-12' : '')}>
                  <Link to={item.to} className="block">
                    <div className="text-2xl mb-1.5">{item.icon}</div>
                    <div className="font-semibold text-sm text-bingo-dark group-hover:text-primary transition">{item.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 leading-tight">{item.sub}</div>
                  </Link>
                  {item.cta && (
                    <Link to={item.to} onClick={e => e.stopPropagation()}
                      className={'absolute bottom-3 left-1/2 -translate-x-1/2 text-xs font-medium px-3 py-1.5 rounded-lg transition whitespace-nowrap ' + item.ctaClass}>
                      {item.cta}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* B端服务 */}
          <div>
            <p className="text-xs font-bold text-sky-600 mb-3 tracking-wider">B端 · 机构 / 加盟商服务中心</p>
            <Link to="/franchise" className="card p-4 bg-sky-50/50 border-sky-200/60 hover:shadow-md hover:border-sky-400/40 transition group flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-3xl">🏫</span>
                <div>
                  <p className="font-semibold text-sm text-bingo-dark group-hover:text-sky-700 transition">产教融合 · 机构赋能 · 定制化服务</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">师训体系 · 运营支持 · 品牌授牌 · 课程/教具定制</p>
                </div>
              </div>
              <span className="text-sky-500 text-sm font-medium shrink-0">了解加盟合作 →</span>
            </Link>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            四、独门爆款课程 + 限时营销活动
        ══════════════════════════════════════════════════ */}
        <section className="py-10 border-t">
          <h2 className="text-2xl font-bold text-bingo-dark mb-1">独门爆款课程</h2>
          <p className="text-slate-500 text-sm mb-5">核心打造的独家课程，从素养到竞赛到升学一站式覆盖</p>
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            {[
              { ...HOT_COURSES[0], hotTag: '立即抢购', hotTo: '/courses?open=hot' },
              { ...HOT_COURSES[1], hotTag: '报名缴费', hotTo: '/courses?open=hot' },
              { ...HOT_COURSES[2], hotTag: '预约报名', hotTo: '/courses?open=hot' },
            ].map((c, i) => (
              <div key={i} className="card p-5 hover:shadow-md hover:border-primary/30 transition group border-primary/20 relative">
                <Link to="/courses?open=hot" className="block">
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-medium">{c.tag}</span>
                  <div className="flex items-start justify-between gap-2 mt-2">
                    <p className="font-bold text-bingo-dark group-hover:text-primary transition flex-1">{c.name}</p>
                    <Link to={c.hotTo} onClick={e => e.stopPropagation()} className="text-red-600 text-xs font-medium shrink-0 hover:underline">{c.hotTag}</Link>
                  </div>
                  <p className="text-xs text-slate-500">{c.desc}</p>
                </Link>
              </div>
            ))}
          </div>

          {/* 营销活动 C端 */}
          <h3 className="font-semibold text-bingo-dark mb-3">🔥 限时营销活动</h3>
          <div className="card p-5 bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200/60 mb-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs text-slate-500">家长必读课限时福利</p>
              <h3 className="font-bold text-bingo-dark mt-0.5">《成为孩子驾驭AI路上的引路人》</h3>
              <p className="text-sm text-slate-600 mt-1">原价 99元 · 现价 <span className="text-orange-600 font-bold text-lg">9.9元</span> · 限量1000份</p>
            </div>
            <Link to="/courses?open=parent-99" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shrink-0 transition">立即秒杀</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { icon: '⚡', title: '秒杀专区', sub: '限时特价', to: '/mall?tag=flash', color: 'border-orange-200/60 bg-orange-50/50', cta: '限时抢购', ctaClass: 'text-red-600' },
              { icon: '🏆', title: '赛事报名', sub: '白名单赛事·集训营', to: '/events', color: 'border-blue-200/60 bg-blue-50/50', cta: '立即报名', ctaClass: 'text-blue-600' },
              { icon: '👥', title: '拼团优惠', sub: '2人成团立减50%', to: '/mall?tag=group', color: 'border-amber-200/60 bg-amber-50/50' },
              { icon: '🎫', title: '优惠券', sub: '领券中心', to: '/profile', color: 'border-sky-200/60 bg-sky-50/50' },
              { icon: '💰', title: '推广佣金翻倍', sub: '分享赚钱活动', to: '/profile#promo', color: 'border-emerald-200/60 bg-emerald-50/50' },
            ].map((item, i) => (
              <Link key={i} to={item.to}
                className={'card p-4 text-center hover:shadow-md transition border relative ' + item.color}>
                <div className="text-2xl mb-1">{item.icon}</div>
                <p className="font-semibold text-sm text-bingo-dark">{item.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.sub}</p>
                {item.cta && <span className={'inline-block mt-2 text-xs font-medium ' + item.ctaClass}>{item.cta}</span>}
              </Link>
            ))}
          </div>

          {/* B端营销活动 → 跳转加盟合作 */}
          <Link to="/franchise" className="card p-4 bg-sky-50/50 border-sky-200/60 hover:shadow-md hover:border-sky-400/40 transition flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🤝</span>
              <div>
                <p className="font-semibold text-sm text-bingo-dark">机构加盟限时优惠 · AI教育转型峰会</p>
                <p className="text-xs text-slate-500 mt-0.5">新合作机构免加盟费 · OEM定制专属折扣 · 限时政策</p>
              </div>
            </div>
            <span className="text-sky-600 text-sm font-medium shrink-0">查看详情 →</span>
          </Link>
        </section>

        {/* ══════════════════════════════════════════════════
            五、强背书展示区
        ══════════════════════════════════════════════════ */}
        <section className="py-10 border-t">
          <h2 className="text-2xl font-bold text-bingo-dark mb-1">信任背书</h2>
          <p className="text-slate-500 text-sm mb-6">数据+成果+合作，让每一份信任有依据</p>

          {/* C端背书：学员成果 */}
          <div className="mb-6">
            <p className="text-xs font-bold text-primary mb-3 tracking-wider">C端 · 学员成果与口碑</p>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
            {[
              { icon: '🎨', title: 'AI原创作品', value: '10万+', desc: '绘画/编程/写作等实景作品', to: '/courses?type=literacy' },
              { icon: '🏅', title: '赛事获奖', value: '300+项', desc: '全国科创大奖，附学员合影', to: '/events' },
              { icon: '🎓', title: '升学成果', value: '2000+人', desc: '2025年100+学员进入省重点', to: '/courses?type=exam' },
              ].map((s, i) => (
                <div key={i} className="card p-5 text-center hover:shadow-md hover:border-primary/30 transition relative">
                  <div className="text-3xl mb-2">{s.icon}</div>
                  <p className="text-2xl font-bold text-primary">{s.value}</p>
                  <p className="font-semibold text-bingo-dark text-sm mt-0.5">{s.title}</p>
                  <p className="text-xs text-slate-400 mt-1">{s.desc}</p>
                  <Link to={s.to} className="block mt-3 text-sm text-bingo-dark font-medium hover:text-primary">学同款课程</Link>
                </div>
              ))}
            </div>

            {/* 家长口碑 */}
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              {REVIEWS.map((r, i) => (
                <div key={i} className="card p-5 bg-slate-50 hover:shadow-md transition">
                  <p className="text-sm text-slate-700 leading-relaxed mb-3">"{r.text}"</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-xs text-bingo-dark">{r.name} · {r.city}</p>
                      <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full mt-0.5 inline-block">{r.tag}</span>
                    </div>
                    <div className="text-amber-400 text-sm">★★★★★</div>
                  </div>
                </div>
              ))}
            </div>

            {/* 合作背书LOGO墙 */}
            <div className="card p-5 bg-gradient-to-r from-slate-50 to-slate-100">
              <p className="text-xs text-slate-400 text-center mb-4 font-medium">权威合作背书</p>
              <div className="flex flex-wrap justify-center gap-4 mb-4">
                {['白名单赛事官方合作', '教育部门合作机构', '重点高校科创基地', '知名AI企业战略合作'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-slate-200 shadow-sm">
                    <span className="text-primary text-base">✓</span>
                    <span className="text-xs font-medium text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
              <div className="text-center">
                <button onClick={() => setLeadModal('公益体验课报名')} className="bg-slate-600 hover:bg-slate-700 text-white text-sm px-5 py-2 rounded-lg font-medium transition">公益体验课报名</button>
              </div>
            </div>
          </div>

          {/* B端背书 → 跳转加盟合作 */}
          <Link to="/franchise" className="card p-5 bg-sky-50/60 border-sky-200/40 hover:shadow-md hover:border-sky-400/40 transition flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex gap-2 text-2xl">🥇📈📣</div>
              <div>
                <p className="font-semibold text-bingo-dark text-sm">品牌荣誉 · 合作机构成果 · 行业影响力</p>
                <p className="text-xs text-slate-500 mt-0.5">合作机构500+ · 加盟商100+ · 营收平均提升60%</p>
              </div>
            </div>
            <span className="text-sky-600 text-sm font-medium shrink-0">查看加盟合作 →</span>
          </Link>
        </section>

        {/* ══════════════════════════════════════════════════
            六、免费资源留资区
        ══════════════════════════════════════════════════ */}
        <section className="py-10 border-t">
          <h2 className="text-2xl font-bold text-bingo-dark mb-1">免费资源 · 领取专属干货</h2>
          <p className="text-slate-500 text-sm mb-6">填写手机号，立即免费领取高价值资料，沉淀您的AI教育必备知识</p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* C端资源 */}
            <div className="card p-6 bg-gradient-to-br from-primary/5 to-cyan-50 border-primary/20">
              <p className="text-xs font-bold text-primary mb-4 tracking-wider">C端 · 家长/学员专属资源</p>
              <ul className="space-y-3 mb-5">
                {FREE_RESOURCES_C.map((r, i) => (
                  <li key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-primary/10 hover:border-primary/30 transition cursor-pointer"
                    onClick={() => setLeadModal('免费领取：' + r.title)}>
                    <span className="text-xl shrink-0">{r.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-bingo-dark">{r.title}</p>
                      <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">{r.tag}</span>
                    </div>
                    <span className="text-primary text-xs shrink-0">领取 →</span>
                  </li>
                ))}
              </ul>
              <button onClick={() => setLeadModal('免费领取全套家长AI教育资料包')}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold text-sm transition">
                一键领取全套资料包
              </button>
            </div>

            {/* B端资源 → 跳转加盟合作 */}
            <Link to="/franchise" className="card p-6 bg-gradient-to-br from-sky-50 to-indigo-50 border-sky-200/60 hover:shadow-md hover:border-sky-400/40 transition flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-sky-600 mb-3 tracking-wider">B端 · 机构/加盟商专属资源</p>
                <ul className="space-y-2 mb-4">
                  {FREE_RESOURCES_B.map((r, i) => (
                    <li key={i} className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-sky-100">
                      <span className="text-lg shrink-0">{r.icon}</span>
                      <p className="text-sm font-medium text-bingo-dark flex-1">{r.title}</p>
                      <span className="text-[10px] bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded shrink-0">{r.tag}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="w-full bg-sky-600 hover:bg-sky-700 text-white py-2.5 rounded-xl font-bold text-sm text-center transition">
                前往加盟合作页面领取 →
              </div>
            </Link>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════
            七、底部联系区
        ══════════════════════════════════════════════════ */}
        <section className="py-10 border-t">
          <div className="grid md:grid-cols-2 gap-6">
            {/* C端咨询 */}
            <div className="card p-6 bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200/60">
              <p className="text-xs font-bold text-orange-600 mb-3 tracking-wider">C端 · 家长/学员咨询</p>
              <h3 className="font-bold text-bingo-dark mb-4">立即联系我们，为孩子定制AI成长方案</h3>
              <div className="space-y-3">
                {[
                  { icon: '📞', label: '课程咨询热线', value: '400-xxx-xxxx', href: 'tel:400-xxx-xxxx' },
                  { icon: '💬', label: '家长咨询微信', value: 'bingoacademy', href: 'javascript:void(0)' },
                  { icon: '✉️', label: '家长咨询邮箱', value: 'family@bingoacademy.cn', href: 'mailto:family@bingoacademy.cn' },
                ].map((c, i) => (
                  <a key={i} href={c.href}
                    className="flex items-center gap-3 hover:bg-orange-100/60 rounded-xl p-2 transition group">
                    <span className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-lg shrink-0">{c.icon}</span>
                    <div>
                      <p className="text-xs text-slate-500">{c.label}</p>
                      <p className="font-semibold text-sm text-orange-600">{c.value}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* B端咨询 → 跳转加盟合作 */}
            <Link to="/franchise" className="card p-6 bg-gradient-to-r from-sky-50 to-indigo-50 border-sky-200/60 hover:shadow-md hover:border-sky-400/40 transition flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold text-sky-600 mb-3 tracking-wider">B端 · 机构/加盟商咨询</p>
                <h3 className="font-bold text-bingo-dark mb-3">联系商务团队，获取专属合作方案</h3>
                <div className="space-y-2">
                  {[
                    { icon: '📞', label: '机构合作热线', value: '400-xxx-xxxx' },
                    { icon: '💬', label: 'B端商务微信', value: 'bingoacademy-b' },
                    { icon: '✉️', label: '机构合作邮箱', value: 'contact@bingoacademy.cn' },
                  ].map((c, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-xl">
                      <span className="w-9 h-9 rounded-xl bg-sky-100 flex items-center justify-center text-base shrink-0">{c.icon}</span>
                      <div>
                        <p className="text-xs text-slate-500">{c.label}</p>
                        <p className="font-semibold text-sm text-sky-600">{c.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 w-full bg-sky-600 hover:bg-sky-700 text-white py-2.5 rounded-xl text-sm font-bold text-center transition">
                前往加盟合作页面咨询 →
              </div>
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}
