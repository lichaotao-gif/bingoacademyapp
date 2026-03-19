import { useState } from 'react'
import { Link } from 'react-router-dom'

const WHITELIST_EVENTS = [
  { id: 'w1', name: '全国青少年人工智能创新大赛', org: '中国人工智能学会', type: '科创类', stage: '小学-高中', regTime: '2025.09–2025.10', award: '国家级认证证书', hot: true },
  { id: 'w2', name: '全国中小学信息技术创新与实践大赛', org: '教育部白名单', type: '信息技术类', stage: '小学-高中', regTime: '2025.10–2025.11', award: '省级/国家级证书', hot: true },
  { id: 'w3', name: 'NOC全国中小学信息技术创新与实践活动', org: 'NOC组委会', type: '编程创作类', stage: '小学-高中', regTime: '2026.03–2026.04', award: '白名单认证', hot: false },
  { id: 'w4', name: '世界机器人大赛', org: '中国电子学会', type: '机器人类', stage: '小学-大学', regTime: '2026.05–2026.06', award: '国际认证证书', hot: false },
  { id: 'w5', name: '蓝桥杯全国软件和信息技术专业人才大赛', org: '工信部人才交流中心', type: '编程算法类', stage: '大学生', regTime: '2026.01–2026.02', award: '国家级认证', hot: false },
]

const CONSULT_RECORDS = [
  { event: '全国青少年AI创新大赛', content: '我的孩子12岁，初一，适合报哪个组别？', status: '已回复', reply: '适合初中组，建议先完成AI基础认知测评，评估匹配的赛道。', time: '2025-09-10' },
  { event: '全国中小学信息技术创新大赛', content: '需要提前准备哪些材料？', status: '处理中', reply: '', time: '2025-09-12' },
]

export default function EventWhitelist() {
  const [activeTab, setActiveTab] = useState('recommend')
  const [filterType, setFilterType] = useState('all')
  const [filterStage, setFilterStage] = useState('all')
  const [showConsult, setShowConsult] = useState(null)
  const [consultForm, setConsultForm] = useState({ name: '', phone: '', content: '' })
  const [submitted, setSubmitted] = useState(false)

  const filtered = WHITELIST_EVENTS.filter(e =>
    (filterType === 'all' || e.type.includes(filterType)) &&
    (filterStage === 'all' || e.stage.includes(filterStage))
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-2">
        <Link to="/events" className="text-sm text-slate-500 hover:text-primary">赛事中心</Link>
        <span className="text-slate-300">/</span>
        <span className="text-sm text-slate-700">白名单赛事咨询专区</span>
      </div>

      <div className="card p-8 bg-gradient-to-r from-amber-500 to-orange-500 text-white mb-8 rounded-2xl">
        <h1 className="text-2xl font-bold mb-2">白名单赛事咨询与推荐专区</h1>
        <p className="text-white/80 text-sm mb-4">聚合教育部及权威机构认证的白名单赛事，专业咨询 · 报名对接 · 主办方申报一站式服务</p>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-2">
            <span className="text-2xl font-bold">50+</span><span className="text-sm">收录白名单赛事</span>
          </div>
          <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-2">
            <span className="text-2xl font-bold">3200+</span><span className="text-sm">已服务咨询次</span>
          </div>
          <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-2">
            <span className="text-2xl font-bold">78%</span><span className="text-sm">白名单申报成功率</span>
          </div>
        </div>
      </div>

      {/* 标签切换 */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[['recommend', '赛事推荐'], ['consult', '咨询服务'], ['organizer', '主办方申报']].map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={'px-5 py-2 rounded-full text-sm font-medium transition ' + (activeTab === key ? 'bg-primary text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>
            {label}
          </button>
        ))}
      </div>

      {/* ── 赛事推荐 ── */}
      {activeTab === 'recommend' && (
        <>
          <div className="flex flex-wrap gap-3 mb-5">
            <div className="flex gap-2 flex-wrap items-center">
              <span className="text-xs text-slate-500">类型：</span>
              {[['all', '全部'], ['科创', '科创类'], ['编程', '编程类'], ['机器人', '机器人类'], ['信息技术', '信息技术']].map(([k, l]) => (
                <button key={k} onClick={() => setFilterType(k)}
                  className={'px-3 py-1 rounded-full text-xs transition ' + (filterType === k ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>
                  {l}
                </button>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              <span className="text-xs text-slate-500">学段：</span>
              {[['all', '全部'], ['小学', '小学'], ['初中', '初中'], ['高中', '高中'], ['大学', '大学']].map(([k, l]) => (
                <button key={k} onClick={() => setFilterStage(k)}
                  className={'px-3 py-1 rounded-full text-xs transition ' + (filterStage === k ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 mb-8">
            {filtered.map(ev => (
              <div key={ev.id} className="card p-6 hover:shadow-md hover:border-primary/30 transition">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-bingo-dark">{ev.name}</h3>
                      {ev.hot && <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-600">热门</span>}
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">白名单认证</span>
                    </div>
                    <p className="text-sm text-slate-600 mb-1">主办：{ev.org} · 类型：{ev.type}</p>
                    <p className="text-sm text-slate-500">学段：{ev.stage} · 报名时间：{ev.regTime}</p>
                    <p className="text-sm text-slate-500 mt-1">奖励：{ev.award}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => { setShowConsult(ev); setActiveTab('consult') }}
                      className="btn-primary text-xs px-4 py-2">立即咨询</button>
                    <button type="button" className="rounded-lg border border-primary text-primary text-xs px-4 py-2 hover:bg-primary/10 transition">查看详情</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── 咨询服务 ── */}
      {activeTab === 'consult' && (
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="font-semibold text-bingo-dark mb-4">提交咨询</h2>
            {submitted ? (
              <div className="card p-8 text-center">
                <div className="text-4xl mb-3">✅</div>
                <h3 className="font-bold text-bingo-dark mb-2">咨询已提交！</h3>
                <p className="text-slate-500 text-sm mb-4">专人将在工作时间内回复，请注意查看消息通知</p>
                <button onClick={() => setSubmitted(false)} className="btn-primary text-sm px-5 py-2">再次咨询</button>
              </div>
            ) : (
              <form onSubmit={e => { e.preventDefault(); setSubmitted(true) }} className="card p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">咨询人 *</label>
                  <input required value={consultForm.name} onChange={e => setConsultForm({...consultForm, name: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary" placeholder="请输入姓名" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">联系电话 *</label>
                  <input required value={consultForm.phone} onChange={e => setConsultForm({...consultForm, phone: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary" placeholder="请输入手机号" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">咨询赛事 *</label>
                  <select required className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary bg-white">
                    <option value="">{showConsult ? showConsult.name : '请选择赛事'}</option>
                    {WHITELIST_EVENTS.map(e => <option key={e.id}>{e.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">咨询内容 *</label>
                  <textarea required rows={4} value={consultForm.content} onChange={e => setConsultForm({...consultForm, content: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary resize-none" placeholder="请描述您的咨询问题..." />
                </div>
                <button type="submit" className="btn-primary w-full py-2.5 text-sm">提交咨询</button>
              </form>
            )}
          </div>
          <div>
            <h2 className="font-semibold text-bingo-dark mb-4">历史咨询记录</h2>
            <div className="space-y-4">
              {CONSULT_RECORDS.map((r, i) => (
                <div key={i} className="card p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500">{r.event}</span>
                    <span className={'text-[10px] px-2 py-0.5 rounded-full ' + (r.status === '已回复' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700')}>{r.status}</span>
                  </div>
                  <p className="text-sm text-slate-700 mb-2">{r.content}</p>
                  {r.reply && <p className="text-xs text-slate-500 bg-slate-50 rounded-lg p-3 border border-slate-100">回复：{r.reply}</p>}
                  <p className="text-xs text-slate-400 mt-2">{r.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── 主办方申报 ── */}
      {activeTab === 'organizer' && (
        <div>
          <div className="card p-8 bg-gradient-to-r from-cyan-50 to-sky-50 border-primary/20 mb-6">
            <h2 className="font-bold text-bingo-dark text-lg mb-2">协助申报白名单赛事</h2>
            <p className="text-slate-600 text-sm mb-4">我们已成功协助30+机构申报省级及以上白名单赛事，申报成功率78%。提供材料整理、申报文件撰写、对接渠道全程支持。</p>
            <div className="grid sm:grid-cols-3 gap-4 mb-5">
              {[
                { label: '材料整理与优化', desc: '帮助机构梳理赛事材料，符合白名单申报标准' },
                { label: '申报文件撰写', desc: '提供专业申报文件模板，专员协助优化内容' },
                { label: '对接渠道与跟进', desc: '对接申报渠道，实时同步申报进度与反馈' },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-xl p-4 border border-slate-100">
                  <p className="font-medium text-sm text-bingo-dark mb-1">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
              ))}
            </div>
            <button type="button" className="btn-primary text-sm px-6 py-2.5">提交申报对接需求</button>
          </div>

          <h2 className="font-semibold text-bingo-dark mb-4">对接成功案例</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { name: 'XX市教育局', result: '成功申报省级AI教育白名单赛事', time: '2024年9月' },
              { name: 'XX中学', result: '成功申报教育部白名单赛事', time: '2025年3月' },
              { name: 'XX科技公司', result: '成功申报行业类白名单认证赛事', time: '2025年6月' },
            ].map((c, i) => (
              <div key={i} className="card p-5 hover:shadow-md transition">
                <h3 className="font-semibold text-sm text-bingo-dark mb-2">{c.name}</h3>
                <p className="text-sm text-slate-600 mb-2">{c.result}</p>
                <p className="text-xs text-slate-400">{c.time}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
