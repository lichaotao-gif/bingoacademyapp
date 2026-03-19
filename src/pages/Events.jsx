import { useState } from 'react'
import { Link } from 'react-router-dom'

// 赛事矩阵数据
const EVENT_MATRIX = [
  { id: 'e1', name: '全国青少年AI创新大赛', type: 'white', stage: '初赛进行中', award: '总奖金10万', count: 3820, isWhite: true, hasAI: true },
  { id: 'e2', name: '缤果杯AI创意编程大赛', type: 'bingo', stage: '报名开放', award: '证书+奖品', count: 1560, isWhite: false, hasAI: true },
  { id: 'e3', name: 'AI机器人国际青少年挑战赛', type: 'international', stage: '即将开放', award: '国际认证证书', count: 890, isWhite: true, hasAI: false },
  { id: 'e4', name: '粤港澳大湾区AI科创联赛', type: 'provincial', stage: '报名开放', award: '省级荣誉+奖金', count: 2100, isWhite: false, hasAI: true },
  { id: 'e5', name: 'AI艺术与创意设计大赛', type: 'bingo', stage: '初赛进行中', award: '展览+奖金', count: 740, isWhite: false, hasAI: false },
  { id: 'e6', name: '全国中学生AI素养测评赛', type: 'white', stage: '即将开放', award: '认证证书', count: 5200, isWhite: true, hasAI: true },
]

const TYPE_TAGS = {
  white: { label: '教育部白名单', color: 'bg-amber-100 text-amber-700' },
  international: { label: '国际赛事', color: 'bg-violet-100 text-violet-700' },
  provincial: { label: '省级权威赛', color: 'bg-blue-100 text-blue-700' },
  bingo: { label: '缤果自有IP', color: 'bg-primary/10 text-primary' },
}

// 核心服务列表
const CORE_SERVICES = [
  { icon: '🏆', title: '办赛定制', desc: '0代码全程护航，2小时响应', to: '/events/organizer', hot: true },
  { icon: '🎓', title: '缤果AI学院联动', desc: '赛事配套AI课程，冲刺备赛', to: '/events/bingguo-ai', hot: false },
  { icon: '🧠', title: '免费测评', desc: '测评成绩可纳入评审参考', to: '/events/ai-test', hot: false },
  { icon: '📋', title: '白名单赛事咨询', desc: '推荐筛选+报名对接一站式', to: '/events/whitelist', hot: false },
  { icon: '🖼️', title: '成果展厅', desc: '往届获奖作品与人才库对接', to: '/events/gallery', hot: false },
  { icon: '📜', title: '证书下载', desc: '在线验证+下载+分享', to: '/events/user', hot: false },
]

// 数据概览
const STATS = [
  { label: '累计赛事数', value: '128+', sub: '场' },
  { label: '参赛人次', value: '86,000+', sub: '人' },
  { label: '合作机构', value: '430+', sub: '家' },
  { label: '获奖作品', value: '12,000+', sub: '件' },
  { label: 'AI测评人次', value: '15,000+', sub: '次' },
  { label: '白名单咨询', value: '3,200+', sub: '次' },
]

export default function Events() {
  const [activeType, setActiveType] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', phone: '', type: '' })
  const [submitted, setSubmitted] = useState(false)

  const filtered = activeType === 'all' ? EVENT_MATRIX : EVENT_MATRIX.filter(e => e.type === activeType)

  function handleSubmit(e) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* ── 首屏 Banner ── */}
      <section className="mb-10">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-bingo-dark via-slate-800 to-cyan-900 text-white p-8 sm:p-12">
          <div className="max-w-2xl relative z-10">
            <div className="text-xs font-medium text-cyan-300 mb-2 tracking-wider">AI竞赛挑战 · 权威赛事报名入口</div>
            <h1 className="text-2xl sm:text-4xl font-bold leading-tight mb-4">权威赛事报名入口｜白名单赛事集训营｜国际赛备赛指导</h1>
            <p className="text-slate-300 text-sm mb-6">专业教练全程辅导，冲刺竞赛奖项，赋能升学加分 · 报名参赛 · 备赛集训 · AI测评 · 白名单对接</p>
            <div className="flex flex-wrap gap-3">
              <Link to="/events/list" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition">立即报名</Link>
              <Link to="/events/whitelist" className="bg-primary hover:bg-cyan-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition">加入集训营</Link>
              <Link to="/events/ai-test" className="bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition">免费测评</Link>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 text-[160px] select-none pointer-events-none">🏆</div>
        </div>
      </section>

      {/* ── 数据概览 ── */}
      <section className="mb-10">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
          {STATS.map((s, i) => (
            <div key={i} className="card p-4 text-center">
              <div className="text-xl sm:text-2xl font-bold text-primary">{s.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 核心服务入口 ── */}
      <section className="mb-10">
        <h2 className="section-title mb-4">核心服务</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CORE_SERVICES.map((s, i) => (
            <Link key={i} to={s.to}
              className={'card p-5 flex flex-col items-center text-center hover:shadow-md hover:border-primary/30 transition group ' + (s.hot ? 'border-primary/40 bg-primary/5' : '')}>
              <span className="text-3xl mb-2">{s.icon}</span>
              <div className="flex items-center gap-1 mb-1">
                <span className="font-semibold text-sm text-bingo-dark group-hover:text-primary transition">{s.title}</span>
                {s.hot && <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary text-white">热门</span>}
              </div>
              <p className="text-xs text-slate-500">{s.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 赛事矩阵 ── */}
      <section className="mb-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h2 className="section-title">赛事矩阵</h2>
          <Link to="/events/list" className="text-sm text-primary hover:underline">查看全部赛事 →</Link>
        </div>
        {/* 分类筛选 */}
        <div className="flex flex-wrap gap-2 mb-5">
          {[['all', '全部'], ['white', '教育部白名单'], ['international', '国际赛事'], ['provincial', '省级权威'], ['bingo', '缤果自有IP']].map(([key, label]) => (
            <button key={key} onClick={() => setActiveType(key)}
              className={'px-4 py-1.5 rounded-full text-xs font-medium transition ' + (activeType === key ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>
              {label}
            </button>
          ))}
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((ev) => (
            <Link key={ev.id} to={'/events/' + ev.id}
              className="card p-5 hover:shadow-md hover:border-primary/30 transition group">
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="font-semibold text-bingo-dark text-sm group-hover:text-primary transition line-clamp-2">{ev.name}</h3>
                <span className={'shrink-0 text-[10px] px-2 py-0.5 rounded-full ' + (TYPE_TAGS[ev.type]?.color || '')}>{TYPE_TAGS[ev.type]?.label}</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {ev.isWhite && <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">白标认证</span>}
                {ev.hasAI && <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">缤果AI配套教学</span>}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="text-emerald-600 font-medium">{ev.stage}</span>
                <span>{ev.count.toLocaleString()} 人参赛</span>
              </div>
              <div className="mt-2 text-xs text-slate-400">奖励：{ev.award}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 主办方专区 ── */}
      <section className="mb-10">
        <div className="card p-8 bg-gradient-to-r from-slate-800 to-cyan-900 text-white rounded-2xl">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-lg">
              <div className="text-xs text-cyan-300 mb-2">B端 · 主办方专区</div>
              <h2 className="text-xl font-bold mb-2">0代码办赛 · 全程护航</h2>
              <p className="text-slate-300 text-sm mb-4">政企科创赛、院校教学赛、商会公益赛三大定制模板一键套用，支持AI课程联动、免费测评嵌入、白名单赛事对接，专人2小时响应需求。</p>
              <div className="flex flex-wrap gap-2">
                {['政企科创赛模板', '院校教学赛模板', '商会公益赛模板'].map((t, i) => (
                  <span key={i} className="text-xs px-3 py-1 rounded-full bg-white/10 text-white/80">{t}</span>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3 shrink-0">
              <Link to="/events/organizer" className="bg-primary hover:bg-cyan-500 text-white px-6 py-3 rounded-xl text-sm font-medium text-center transition">立即定制专属赛事</Link>
              <button onClick={() => setShowForm(true)} className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl text-sm font-medium transition">快速提交需求</button>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
            {[['430+', '合作机构'], ['128+', '场次赛事'], ['2h', '响应需求']].map(([v, l], i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-bold text-cyan-300">{v}</div>
                <div className="text-xs text-slate-400 mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 备赛打卡 · 学分 ── */}
      <section className="mb-10 border-t pt-8">
        <h2 className="section-title mb-1">🏅 备赛打卡领学分</h2>
        <p className="text-slate-600 text-sm mb-4">备赛资料下载、备赛作业、赛事报名均可获得缤果学分，获奖额外赠荣誉学分</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {[
            { action: '赛事报名成功', score: '+20分', note: '报名即到账' },
            { action: '下载备赛资料', score: '+5分', note: '每次限1次' },
            { action: '完成备赛作业打卡', score: '+15分', note: '每日1次' },
            { action: '赛事获奖', score: '+100分', note: '荣誉学分·可兑换高端赛事资格' },
          ].map((s, i) => (
            <div key={i} className="card p-5 border-primary/20 hover:shadow-md transition">
              <p className="text-sm font-medium text-slate-700">{s.action}</p>
              <p className="text-primary font-bold text-lg mt-1">{s.score}</p>
              <p className="text-xs text-slate-400 mt-1">{s.note}</p>
            </div>
          ))}
        </div>
        <div className="card p-5 bg-cyan-50 border-primary/20 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-slate-700">100学分 = 10元赛事报名费抵扣 · 成果分享至朋友圈额外 +5分</p>
          <Link to="/profile#score-bank" className="btn-primary text-sm px-4 py-2">查看我的学分</Link>
        </div>
      </section>

      {/* ── 快速行动区（固定悬浮） ── */}
      <div className="fixed right-4 bottom-32 z-40 flex flex-col gap-2">
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-primary text-white text-sm font-medium shadow-lg hover:bg-cyan-600 transition">
          🏆 我要办赛
        </button>
      </div>

      {/* ── 快速提交表单弹窗 ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false) }}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            {submitted ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-4">✅</div>
                <h3 className="font-bold text-bingo-dark text-lg mb-2">需求提交成功！</h3>
                <p className="text-slate-600 text-sm mb-6">2小时内将有专人对接，请保持手机畅通</p>
                <Link to="/events/organizer" onClick={() => { setShowForm(false); setSubmitted(false) }}
                  className="btn-primary text-sm px-6 py-2.5">查看定制方案 →</Link>
              </div>
            ) : (
              <>
                <h3 className="font-bold text-bingo-dark text-lg mb-1">快速提交办赛需求</h3>
                <p className="text-slate-500 text-sm mb-6">填写基本信息，2小时内专人对接</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">姓名 *</label>
                    <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary" placeholder="请输入您的姓名" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">联系电话 *</label>
                    <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary" placeholder="请输入手机号" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">赛事类型 *</label>
                    <select required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary bg-white">
                      <option value="">请选择赛事类型</option>
                      <option>政企科创赛</option>
                      <option>院校教学赛</option>
                      <option>商会公益赛</option>
                      <option>自定义赛事</option>
                    </select>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button type="submit" className="btn-primary flex-1 py-2.5 text-sm">提交需求</button>
                    <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-slate-200 rounded-lg py-2.5 text-sm text-slate-600 hover:bg-slate-50">取消</button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
