import { useState } from 'react'
import { Link } from 'react-router-dom'

// 三大定制模板
const TEMPLATES = [
  {
    id: 'gov',
    icon: '🏛️',
    name: '政企科创赛模板',
    desc: '适配政府、企业举办的AI科创类赛事',
    cycle: '赛程周期2个月',
    audience: '企业团队 · 科研机构 · 高校团队',
    highlights: ['突出政企背书，增强权威性', '强化科创属性，侧重技术可行性', 'AI测评成绩纳入初赛评审（占比10%）', '协助申报省级/国家级白名单赛事'],
    aiServices: ['配套AI科创赛事冲刺营（8折优惠）', 'AI科创能力专项测评嵌入', '白名单赛事申报对接服务'],
    price: '定制咨询',
    color: 'from-amber-400 to-orange-500',
    bg: 'bg-amber-50 border-amber-200/60',
  },
  {
    id: 'school',
    icon: '🏫',
    name: '院校教学赛模板',
    desc: '适配中小学、高校举办的教学类、学科类赛事',
    cycle: '赛程周期1.5个月',
    audience: '本校学生 · 教职工 · 可跨校参与',
    highlights: ['贴合教学大纲，以赛促学', '批量导入名单，高效办赛', '成果嵌入校园官网，学生综评参考', 'AI测评报告同步教务系统'],
    aiServices: ['AI教学赛事竞技班（教师/学生双课程）', '学生AI基础测评 & 教师AI教学能力测评', '推荐适配白名单赛事+获奖率提升服务'],
    price: '定制咨询',
    color: 'from-emerald-400 to-teal-500',
    bg: 'bg-emerald-50 border-emerald-200/60',
  },
  {
    id: 'chamber',
    icon: '🤝',
    name: '商会公益赛模板',
    desc: '适配商会、行业协会举办的公益类、行业普及类赛事',
    cycle: '赛程周期1个月',
    audience: '商会会员单位 · 行业从业者 · 社会公众',
    highlights: ['全程线上，零场地成本', '突出公益属性，荣誉证书为主', '商会会员单位交流联动', '协助申报行业类白名单赛事'],
    aiServices: ['AI公益普及课程免费开放给参赛选手', 'AI基础普及测评免费嵌入（无门槛）', '推荐行业类白名单赛事+报名对接'],
    price: '定制咨询',
    color: 'from-blue-400 to-indigo-500',
    bg: 'bg-blue-50 border-blue-200/60',
  },
]

// 套餐方案
const PACKAGES = [
  {
    name: '基础套餐',
    price: '联系咨询',
    badge: '',
    items: ['赛事页面搭建', '报名系统', '基础评审工具', '成果展示', '标准宣传物料'],
    ai: false,
  },
  {
    name: '专业套餐',
    price: '联系咨询',
    badge: '热门',
    items: ['基础套餐全部功能', '白标定制（LOGO/配色/域名）', 'AI辅助评审系统', '数据看板', '赛事直播支持', '专属客服对接'],
    ai: true,
  },
  {
    name: '旗舰套餐',
    price: '联系咨询',
    badge: '推荐',
    items: ['专业套餐全部功能', '缤果AI学院课程联动', '免费测评嵌入', '白名单赛事申报对接', '证书/奖品全托管', '全程运营专员驻场'],
    ai: true,
  },
]

// 能力矩阵
const CAPABILITIES = [
  { icon: '⚡', name: '极速搭建', desc: '0代码，模板一键套用，1天内上线赛事页面' },
  { icon: '🎨', name: '白标定制', desc: '替换LOGO、配色、域名，呈现专属品牌形象' },
  { icon: '🤖', name: 'AI辅助评审', desc: '智能查重、技术难度评分建议，提升评审效率' },
  { icon: '📊', name: '数据看板', desc: '报名人数、转化率、成绩分布实时可视化' },
  { icon: '🎓', name: 'AI课程联动', desc: '配套缤果AI学院赛事课程，提升学员参赛能力', isNew: true },
  { icon: '🧠', name: '免费测评', desc: '测评成绩可纳入初赛参考，强化赛事含金量', isNew: true },
  { icon: '📋', name: '白名单对接', desc: '协助申报省级/国家级白名单赛事资质', isNew: true },
  { icon: '📜', name: '证书全托管', desc: '电子证书生成、验证、下载、分享一站式' },
]

// 成功案例
const CASES = [
  { name: 'XX市教育局AI科创挑战赛', type: 'gov', data: '3200人参赛 · 获奖率82% · 白名单申报成功', tag: '政企科创' },
  { name: 'XX大学AI教学创新大赛', type: 'school', data: '1800人参赛 · 教师课程报名率65% · AI测评覆盖100%', tag: '院校教学' },
  { name: 'XX商会AI普及公益赛', type: 'chamber', data: '860人参赛 · 会员参与率91% · 免费测评全覆盖', tag: '商会公益' },
]

export default function EventOrganizer() {
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [activeSection, setActiveSection] = useState('template')
  const [formData, setFormData] = useState({
    eventName: '', type: '', scale: '', budget: '',
    contact: '', phone: '',
    needAI: false, needTest: false, needWhitelist: false,
  })
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* ── 顶部引导栏（固定） ── */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-100 -mx-4 px-4 py-3 mb-8 flex items-center justify-between gap-4">
        <div>
          <span className="text-sm font-semibold text-bingo-dark">主办方定制专区</span>
          <span className="text-xs text-slate-500 ml-2 hidden sm:inline">0代码办赛 · 全程护航 · 2小时响应需求</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setActiveSection('form')} className="btn-primary text-xs px-4 py-2">立即定制</button>
          <button onClick={() => setActiveSection('cases')} className="rounded-lg border border-primary text-primary text-xs px-4 py-2 hover:bg-primary/10 transition">查看案例</button>
        </div>
      </div>

      {/* ── 三大定制模板 ── */}
      <section id="template" className="mb-12">
        <h2 className="section-title mb-1">三大定制模板 · 一键套用</h2>
        <p className="text-slate-600 text-sm mb-6">按场景选择模板，可在模板基础上自由定制，全程专员陪跑</p>
        <div className="grid md:grid-cols-3 gap-6">
          {TEMPLATES.map((tpl) => (
            <div key={tpl.id}
              className={'card overflow-hidden cursor-pointer transition border-2 ' + (selectedTemplate === tpl.id ? 'border-primary shadow-lg' : 'border-transparent hover:shadow-md hover:border-primary/30')}
              onClick={() => setSelectedTemplate(tpl.id)}>
              <div className={'h-2 bg-gradient-to-r ' + tpl.color} />
              <div className="p-6">
                <div className="text-3xl mb-3">{tpl.icon}</div>
                <h3 className="font-bold text-bingo-dark mb-1">{tpl.name}</h3>
                <p className="text-sm text-slate-600 mb-1">{tpl.desc}</p>
                <p className="text-xs text-slate-500 mb-4">{tpl.cycle} · {tpl.audience}</p>

                <h4 className="text-xs font-semibold text-slate-500 mb-2">定制亮点</h4>
                <ul className="space-y-1 mb-4">
                  {tpl.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                      <span className="text-primary mt-0.5">·</span>{h}
                    </li>
                  ))}
                </ul>

                <div className={'rounded-lg p-3 ' + tpl.bg}>
                  <h4 className="text-xs font-semibold text-slate-600 mb-2">三大服务联动</h4>
                  {tpl.aiServices.map((s, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-xs text-slate-600 mb-1">
                      <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>{s}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => { setSelectedTemplate(tpl.id); setActiveSection('form') }}
                  className={'w-full mt-4 py-2.5 rounded-lg text-sm font-medium transition ' + (selectedTemplate === tpl.id ? 'bg-primary text-white' : 'bg-slate-100 text-slate-700 hover:bg-primary/10 hover:text-primary')}>
                  {selectedTemplate === tpl.id ? '已选择 · 去填写需求' : '选择此模板'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 套餐方案 ── */}
      <section className="mb-12">
        <h2 className="section-title mb-1">套餐方案</h2>
        <p className="text-slate-600 text-sm mb-6">可在任意模板上叠加套餐能力，支持自定义组合</p>
        <div className="grid md:grid-cols-3 gap-6">
          {PACKAGES.map((pkg, i) => (
            <div key={i} className={'card p-6 relative ' + (pkg.badge === '推荐' ? 'border-primary/50 shadow-md' : '')}>
              {pkg.badge && (
                <span className={'absolute top-4 right-4 text-xs px-2 py-0.5 rounded-full font-medium ' + (pkg.badge === '推荐' ? 'bg-primary text-white' : 'bg-amber-100 text-amber-700')}>{pkg.badge}</span>
              )}
              <h3 className="font-bold text-bingo-dark text-lg mb-1">{pkg.name}</h3>
              <p className="text-primary font-semibold mb-4">{pkg.price}</p>
              <ul className="space-y-2 mb-4">
                {pkg.items.map((item, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>{item}
                  </li>
                ))}
              </ul>
              {pkg.ai && (
                <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-xs text-primary font-medium">含三大新增服务：AI课程联动 · AI测评 · 白名单对接</p>
                </div>
              )}
              <button onClick={() => setActiveSection('form')} className={'w-full mt-4 py-2.5 rounded-lg text-sm font-medium transition ' + (pkg.badge === '推荐' ? 'bg-primary text-white hover:bg-cyan-600' : 'border border-primary text-primary hover:bg-primary/10')}>
                选择此套餐
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── 能力矩阵 ── */}
      <section className="mb-12">
        <h2 className="section-title mb-6">办赛能力矩阵</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          {CAPABILITIES.map((cap, i) => (
            <div key={i} className={'card p-5 hover:shadow-md transition ' + (cap.isNew ? 'border-primary/30 bg-primary/5' : '')}>
              <div className="text-2xl mb-2">{cap.icon}</div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-sm text-bingo-dark">{cap.name}</h3>
                {cap.isNew && <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary text-white">新增</span>}
              </div>
              <p className="text-xs text-slate-500">{cap.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 成功案例 ── */}
      <section id="cases" className="mb-12">
        <h2 className="section-title mb-6">合作案例</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {CASES.map((c, i) => (
            <div key={i} className="card p-6 hover:shadow-md hover:border-primary/30 transition">
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{c.tag}</span>
              <h3 className="font-semibold text-bingo-dark mt-3 mb-2">{c.name}</h3>
              <p className="text-sm text-slate-600">{c.data}</p>
              <button type="button" className="text-xs text-primary mt-3 hover:underline">查看详细案例 →</button>
            </div>
          ))}
        </div>
      </section>

      {/* ── 需求提交表单 ── */}
      <section id="form" className="mb-10">
        <h2 className="section-title mb-1">提交定制需求</h2>
        <p className="text-slate-600 text-sm mb-6">填写基本信息，提交后2小时内专人对接，自动生成方案初稿</p>
        {submitted ? (
          <div className="card p-10 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="font-bold text-bingo-dark text-xl mb-2">需求提交成功！</h3>
            <p className="text-slate-600 mb-2">2小时内将有专人对接，方案初稿预览链接已发送至您的手机</p>
            <p className="text-slate-500 text-sm mb-6">短信/微信通知已推送，请保持手机畅通</p>
            <div className="flex gap-3 justify-center">
              <Link to="/events" className="btn-primary text-sm px-6 py-2.5">返回赛事中心</Link>
              <button onClick={() => setSubmitted(false)} className="rounded-lg border border-primary text-primary text-sm px-6 py-2.5 hover:bg-primary/10">重新提交</button>
            </div>
          </div>
        ) : (
          <div className="card p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">赛事名称 *</label>
                  <input required value={formData.eventName} onChange={e => setFormData({...formData, eventName: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary" placeholder="请输入赛事名称" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">赛事类型 *</label>
                  <select required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary bg-white">
                    <option value="">请选择</option>
                    <option>政企科创赛</option>
                    <option>院校教学赛</option>
                    <option>商会公益赛</option>
                    <option>自定义赛事</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">预计参赛规模 *</label>
                  <select required value={formData.scale} onChange={e => setFormData({...formData, scale: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary bg-white">
                    <option value="">请选择</option>
                    <option>500人以下</option>
                    <option>500-2000人</option>
                    <option>2000-5000人</option>
                    <option>5000人以上</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">预算范围 *</label>
                  <select required value={formData.budget} onChange={e => setFormData({...formData, budget: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary bg-white">
                    <option value="">请选择</option>
                    <option>5万以下</option>
                    <option>5-20万</option>
                    <option>20-50万</option>
                    <option>50万以上</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">联系人 *</label>
                  <input required value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary" placeholder="请输入姓名" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">联系电话 *</label>
                  <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary" placeholder="请输入手机号" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 mb-3 block">三大新增服务配置（可选）</label>
                <div className="flex flex-wrap gap-4">
                  {[
                    { key: 'needAI', label: '缤果AI学院课程联动', icon: '🎓' },
                    { key: 'needTest', label: '免费测评嵌入', icon: '🧠' },
                    { key: 'needWhitelist', label: '白名单赛事对接', icon: '📋' },
                  ].map(({ key, label, icon }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={formData[key]} onChange={e => setFormData({...formData, [key]: e.target.checked})}
                        className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" />
                      <span className="text-sm text-slate-700">{icon} {label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button type="submit" className="btn-primary px-8 py-3 text-sm">提交定制需求 · 2小时内响应</button>
              </div>
            </form>
          </div>
        )}
      </section>

      {/* ── 常见问题 ── */}
      <section className="mb-10">
        <h2 className="section-title mb-4">常见问题</h2>
        <div className="space-y-3">
          {[
            { q: '从提交需求到赛事上线需要多长时间？', a: '基础套餐最快1个工作日上线，专业/旗舰套餐根据定制需求，通常3-7个工作日完成配置。' },
            { q: '缤果AI学院联动是如何运作的？', a: '赛事启动前7天完成对接，参赛选手可通过赛事页面直接报名配套AI课程，学习数据与赛事数据实时同步，课程结业证书关联至成果展厅。' },
            { q: '免费测评是否会影响参赛选手的参赛资格？', a: '默认为选做项，主办方可配置测评成绩是否纳入初赛参考（如占比10%），不强制影响参赛资格。' },
            { q: '白名单赛事申报的成功率如何？', a: '我们已成功协助30+机构申报省级及以上白名单赛事，成功率约78%，具体取决于赛事质量与申报材料完整度。' },
            { q: '可以使用我们自己的域名和品牌吗？', a: '专业套餐及以上支持完整白标定制，包括域名、LOGO、配色方案、宣传物料全套替换，呈现专属品牌形象。' },
          ].map((faq, i) => (
            <details key={i} className="card p-5 group">
              <summary className="font-medium text-sm text-bingo-dark cursor-pointer list-none flex items-center justify-between gap-4">
                {faq.q}
                <span className="text-slate-400 group-open:rotate-180 transition-transform shrink-0">▼</span>
              </summary>
              <p className="text-sm text-slate-600 mt-3 pt-3 border-t border-slate-100">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  )
}
