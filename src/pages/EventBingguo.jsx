import { useState } from 'react'
import { Link } from 'react-router-dom'

const COURSES = [
  { id: 'c1', name: 'AI科创赛事冲刺营', type: '冲刺营', event: '全国青少年AI创新大赛', teacher: '陈建文教授/博士', weeks: 4, price: '¥1280', discount: '报名享8折优惠', count: 286, desc: '针对赛事考点深度拆解，从项目选题到答辩技巧全程指导，历届学员获奖率提升40%+' },
  { id: 'c2', name: 'AI编程竞赛强化班', type: '竞技班', event: '蓝桥杯/NOC等编程赛事', teacher: '王文一博士', weeks: 6, price: '¥1580', discount: '前50名享立减200元', count: 142, desc: '精讲Python核心考点与算法策略，结合真题实战演练，提升竞赛得分效率' },
  { id: 'c3', name: 'AI机器人赛前集训营', type: '冲刺营', event: 'AI机器人国际挑战赛', teacher: '徐枫博士', weeks: 3, price: '¥980', discount: '含器材耗材', count: 98, desc: '硬件组装+编程调试+赛事策略三位一体，线下实训基地亲手操作，备赛更高效' },
  { id: 'c4', name: 'AI素养提升特训班', type: '竞技班', event: '各类素养类/白名单赛事', teacher: '王爽博士', weeks: 5, price: '¥1080', discount: '测评学员专享9折', count: 234, desc: '全面提升AI素养五维能力（感知力、理解力、应用力、创造力、伦理意识），对接素养类赛事' },
]

const FLOW = [
  { step: '01', title: '主办方确认赛事类型', desc: '赛事运营专员同步至AI学院对接专员（1个工作日）', role: '主办方 + 赛事运营' },
  { step: '02', title: '确定配套课程方案', desc: '双方沟通确定课程类型、收费标准、优惠政策（2个工作日）', role: 'AI学院对接专员' },
  { step: '03', title: '页面对接完成', desc: '课程入口嵌入赛事页面，报名表单联通，数据实时同步（3个工作日）', role: '技术人员' },
  { step: '04', title: '宣传物料上线', desc: '课程海报与文案制作，同步至赛事宣传渠道（1个工作日）', role: '运营人员' },
  { step: '05', title: '学员报名与跟进', desc: '选手通过赛事页面直接报名，AI学院每日推送学习提醒，每周同步赛事进度', role: 'AI学院对接专员' },
  { step: '06', title: '结业证书颁发', desc: '完成课程后3个工作日内颁发结业证书，数据同步至成果展厅', role: 'AI学院 + 系统自动' },
]

export default function EventBingguo() {
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [regForm, setRegForm] = useState({ name: '', phone: '', event: '', courseId: '' })
  const [submitted, setSubmitted] = useState(false)
  const [activeTab, setActiveTab] = useState('courses')

  function openReg(course) { setSelectedCourse(course); setRegForm({...regForm, courseId: course.id}) }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-2">
        <Link to="/events" className="text-sm text-slate-500 hover:text-primary">赛事中心</Link>
        <span className="text-slate-300">/</span>
        <span className="text-sm text-slate-700">缤果AI学院联动专区</span>
      </div>

      <div className="card p-8 bg-gradient-to-br from-primary to-cyan-600 text-white mb-8 rounded-2xl">
        <h1 className="text-2xl font-bold mb-2">缤果AI学院 × 赛事联动专区</h1>
        <p className="text-white/80 text-sm mb-5">赛前备赛课程与AI精品课深度联动，针对各类赛事定制冲刺营与竞技班，让每位参赛选手都能高效备赛、突破自我</p>
        <div className="flex flex-wrap gap-4">
          <div className="bg-white/10 rounded-xl px-5 py-3 text-center">
            <div className="text-2xl font-bold">760+</div><div className="text-xs text-white/70 mt-0.5">累计报名学员</div>
          </div>
          <div className="bg-white/10 rounded-xl px-5 py-3 text-center">
            <div className="text-2xl font-bold">40%+</div><div className="text-xs text-white/70 mt-0.5">获奖率提升</div>
          </div>
          <div className="bg-white/10 rounded-xl px-5 py-3 text-center">
            <div className="text-2xl font-bold">4</div><div className="text-xs text-white/70 mt-0.5">顶尖导师授课</div>
          </div>
        </div>
      </div>

      {/* 标签切换 */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[['courses', '配套课程'], ['flow', '联动对接流程'], ['organizer', '主办方协作']].map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={'px-5 py-2 rounded-full text-sm font-medium transition ' + (activeTab === key ? 'bg-primary text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>
            {label}
          </button>
        ))}
      </div>

      {/* ── 配套课程 ── */}
      {activeTab === 'courses' && (
        <div className="grid md:grid-cols-2 gap-5 mb-8">
          {COURSES.map(c => (
            <div key={c.id} className="card p-6 hover:shadow-md hover:border-primary/30 transition">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-semibold text-bingo-dark">{c.name}</h3>
                <span className={'text-xs px-2 py-0.5 rounded-full shrink-0 ' + (c.type === '冲刺营' ? 'bg-amber-100 text-amber-700' : 'bg-primary/10 text-primary')}>{c.type}</span>
              </div>
              <p className="text-xs text-slate-500 mb-1">适用赛事：{c.event}</p>
              <p className="text-xs text-slate-500 mb-3">主讲导师：{c.teacher} · 学习周期：{c.weeks}周</p>
              <p className="text-sm text-slate-600 mb-4 leading-relaxed">{c.desc}</p>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-primary font-bold text-lg">{c.price}</span>
                  <span className="text-xs text-amber-600 ml-2">{c.discount}</span>
                </div>
                <span className="text-xs text-slate-400">{c.count}人已报名</span>
              </div>
              <div className="flex gap-3">
                <button onClick={() => openReg(c)} className="btn-primary text-xs px-4 py-2 flex-1">立即报名</button>
                <Link to="/community" className="rounded-lg border border-primary text-primary text-xs px-4 py-2 hover:bg-primary/10 transition">进入社群</Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── 对接流程 ── */}
      {activeTab === 'flow' && (
        <div className="mb-8">
          <div className="card p-6 bg-cyan-50 border-primary/20 mb-6">
            <p className="text-sm text-slate-700"><span className="font-semibold">总对接周期：</span>赛事启动前7天至赛事结束后15天 · 全程专员陪跑 · 数据实时同步</p>
          </div>
          <div className="space-y-4">
            {FLOW.map((f, i) => (
              <div key={i} className="flex gap-5">
                <div className="shrink-0 w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-lg">{f.step}</div>
                <div className="flex-1 card p-5">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <h3 className="font-semibold text-bingo-dark">{f.title}</h3>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-500 shrink-0">{f.role}</span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 主办方协作 ── */}
      {activeTab === 'organizer' && (
        <div className="mb-8 space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold text-bingo-dark mb-4">主办方课程配置管理</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left px-4 py-3 text-slate-500 font-medium">课程名称</th>
                    <th className="text-left px-4 py-3 text-slate-500 font-medium">报名数</th>
                    <th className="text-left px-4 py-3 text-slate-500 font-medium">完课率</th>
                    <th className="text-left px-4 py-3 text-slate-500 font-medium">关联赛事</th>
                    <th className="text-left px-4 py-3 text-slate-500 font-medium">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {COURSES.map((c, i) => (
                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-bingo-dark">{c.name}</td>
                      <td className="px-4 py-3 text-slate-600">{c.count}</td>
                      <td className="px-4 py-3 text-emerald-600">{(72 + i * 5)}%</td>
                      <td className="px-4 py-3 text-slate-500 text-xs">{c.event}</td>
                      <td className="px-4 py-3">
                        <button type="button" className="text-primary text-xs hover:underline mr-3">修改配置</button>
                        <button type="button" className="text-primary text-xs hover:underline">导出数据</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card p-6 bg-amber-50 border-amber-200/60">
            <h3 className="font-semibold text-bingo-dark mb-2">责任分工说明</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div><p className="font-medium text-amber-700 mb-1">主办方负责</p><p className="text-slate-600 text-xs">确定课程需求、优惠政策，配合宣传推广，提供参赛选手相关信息</p></div>
              <div><p className="font-medium text-primary mb-1">AI学院对接专员负责</p><p className="text-slate-600 text-xs">课程配置、学员对接、学习管理、数据统计、复盘分析</p></div>
              <div><p className="font-medium text-slate-600 mb-1">赛事运营专员负责</p><p className="text-slate-600 text-xs">对接协调、数据同步、宣传推广、复盘汇总，同步至主办方</p></div>
            </div>
          </div>
        </div>
      )}

      {/* ── 报名弹窗 ── */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) setSelectedCourse(null) }}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            {submitted ? (
              <div className="text-center py-4">
                <div className="text-4xl mb-3">✅</div>
                <h3 className="font-bold text-bingo-dark text-lg mb-2">报名成功！</h3>
                <p className="text-slate-600 text-sm mb-1">{selectedCourse.name}</p>
                <p className="text-slate-500 text-sm mb-5">导师将在1个工作日内联系您，请保持手机畅通</p>
                <button onClick={() => { setSelectedCourse(null); setSubmitted(false) }} className="btn-primary text-sm px-6 py-2.5">完成</button>
              </div>
            ) : (
              <>
                <h3 className="font-bold text-bingo-dark text-lg mb-1">报名课程</h3>
                <div className="text-sm text-slate-500 mb-5">{selectedCourse.name} · {selectedCourse.price} <span className="text-amber-600">{selectedCourse.discount}</span></div>
                <form onSubmit={e => { e.preventDefault(); setSubmitted(true) }} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">姓名 *</label>
                    <input required value={regForm.name} onChange={e => setRegForm({...regForm, name: e.target.value})}
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary" placeholder="请输入姓名" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">联系电话 *</label>
                    <input required value={regForm.phone} onChange={e => setRegForm({...regForm, phone: e.target.value})}
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary" placeholder="请输入手机号" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1.5 block">关联赛事</label>
                    <input value={regForm.event} onChange={e => setRegForm({...regForm, event: e.target.value})}
                      className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary" placeholder="请输入参赛赛事名称（选填）" />
                  </div>
                  <div className="flex gap-3 mt-2">
                    <button type="submit" className="btn-primary flex-1 py-2.5 text-sm">确认报名</button>
                    <button type="button" onClick={() => setSelectedCourse(null)} className="flex-1 border border-slate-200 rounded-lg py-2.5 text-sm text-slate-600 hover:bg-slate-50">取消</button>
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
