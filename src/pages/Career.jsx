import { useState } from 'react'
import { Link } from 'react-router-dom'

// ─── 静态数据 ──────────────────────────────────────────────

const JOBS = [
  { id: 'j1', title: 'AI训练师（初级）', company: 'XX智能科技有限公司', field: 'AI', area: '北京', edu: '大专及以上', skills: ['Python基础', 'NLP基础', '数据标注'], salary: '8-12K', type: '产教实训岗', hot: true },
  { id: 'j2', title: '数据分析师', company: 'XX大数据科技', field: '大数据', area: '上海', edu: '本科及以上', skills: ['SQL', 'Excel', '数据可视化'], salary: '12-18K', type: '正式录用', hot: false },
  { id: 'j3', title: '智能制造运维工程师', company: 'XX智能制造集团', field: '智能制造', area: '深圳', edu: '大专及以上', skills: ['PLC编程', '工业机器人', '电气维修'], salary: '10-15K', type: '产教实训岗', hot: true },
  { id: 'j4', title: '新媒体运营专员', company: 'XX文化传媒', field: '新媒体', area: '成都', edu: '大专及以上', skills: ['内容创作', '短视频运营', 'AI工具使用'], salary: '6-10K', type: '实习岗', hot: false },
]

const BOOKS = [
  { id: 'b1', name: '生成式人工智能基础和实践', field: '人工智能', cover: '🤖', price: 58, origPrice: 68, sales: 3241, schools: 42, desc: '涵盖大模型原理、提示词工程、AIGC实践，配套操作视频+PPT', tags: ['全彩印刷', '配套视频', '校企联编'] },
  { id: 'b2', name: '业财数据分析与处理——基于SQL', field: '大数据', cover: '📊', price: 52, origPrice: 62, sales: 2108, schools: 36, desc: '面向业财融合岗位，涵盖SQL实操、数据可视化、财务数据分析', tags: ['配套PPT', '实战案例', '考证导向'] },
  { id: 'b3', name: 'Python数据科学入门与实战', field: '人工智能', cover: '🐍', price: 55, origPrice: 65, sales: 1876, schools: 28, desc: '零基础入门Python，覆盖数据处理、机器学习、可视化全流程', tags: ['全彩印刷', '配套代码', '项目实战'] },
  { id: 'b4', name: '工业机器人编程与应用', field: '智能制造', cover: '🏭', price: 62, origPrice: 78, sales: 987, schools: 19, desc: '面向智能制造岗位，含机器人运动学、编程实操、维护手册', tags: ['含操作手册', '校企联编', '实训配套'] },
]

const COURSES = [
  { id: 'c1', name: 'SQL数据分析从入门到实战', level: '入门→进阶', field: '大数据', lessons: 48, price: 299, origPrice: 399, bookId: 'b2', hot: true },
  { id: 'c2', name: 'AI大模型应用与Prompt工程', level: '进阶→实战', field: '人工智能', lessons: 36, price: 398, origPrice: 498, bookId: 'b1', hot: true },
  { id: 'c3', name: 'Python数据科学实战课', level: '入门→进阶', field: '人工智能', lessons: 52, price: 348, origPrice: 448, bookId: 'b3', hot: false },
  { id: 'c4', name: '工业机器人编程实训课', level: '进阶→实战', field: '智能制造', lessons: 40, price: 498, origPrice: 618, bookId: 'b4', hot: false },
  { id: 'c5', name: '短视频运营+AIGC创作实战', level: '入门→实战', field: '新媒体', lessons: 30, price: 268, origPrice: 348, bookId: null, hot: false },
  { id: 'c6', name: '数智职业求职训练营（直播）', level: '实战', field: '就业赋能', lessons: 12, price: 498, origPrice: 698, bookId: null, hot: true },
]

const PARTNERS_CORP = [
  { name: 'XX智能科技有限公司', field: 'AI', size: '500-1000人', collab: '实训岗位+就业推荐+课程共建', result: '已输送学员120名' },
  { name: 'XX大数据科技集团', field: '大数据', size: '1000人以上', collab: '产教融合基地+教材编写', result: '合作院校18所' },
  { name: 'XX智能制造集团', field: '智能制造', size: '1000人以上', collab: '实训基地+技能认证+就业', result: '年招募实训生200名' },
]

const PARTNERS_SCHOOL = [
  { name: 'XX职业技术学院', type: '高职', collab: '联合培养+教材选用+实训基地共建', result: '已培养数智人才800名' },
  { name: 'XX中等职业学校', type: '中职', collab: '教材选用+课程引进+竞赛合作', result: '教材选用量3000册/年' },
  { name: 'XX应用技术大学', type: '本科', collab: '产教融合项目+联合课题研究', result: '共建实训室2个' },
]

const NEWS = [
  { id: 'n1', type: '融合出版成果', date: '2025-06-18', title: '《生成式人工智能基础和实践》入选省级规划教材，42所院校选用', hot: true },
  { id: 'n2', type: '产教融合成果', date: '2025-06-10', title: '缤果AI学院与XX智能制造集团共建产教融合实训基地正式揭牌', hot: false },
  { id: 'n3', type: '就业成果', date: '2025-05-28', title: '2025届数智职业学员就业报告：平均薪资12.8K，对口就业率86%', hot: true },
  { id: 'n4', type: '行业动态', date: '2025-05-20', title: '教育部新规：职业院校须加强数字化技能培养，AI课程纳入必修', hot: false },
  { id: 'n5', type: '融合出版成果', date: '2025-05-15', title: '缤果数字教材平台上线新版，教材+视频+题库一体化体验全面升级', hot: false },
]

const CREATORS = [
  { name: '王教授', title: '电子科技大学副教授', works: 3, sales: 8600, schools: 56, field: 'AI/大数据' },
  { name: '李博士', title: '工业智能化研究院研究员', works: 2, sales: 4200, schools: 28, field: '智能制造' },
  { name: '张老师', title: '职业院校双师型教师', works: 4, sales: 6100, schools: 39, field: '新媒体/数字营销' },
]

const JOB_FIELDS = ['全部', 'AI', '大数据', '智能制造', '新媒体']

// ─── 主组件 ───────────────────────────────────────────────

export default function Career() {
  const [section, setSection] = useState('home')
  const [jobField, setJobField] = useState('全部')
  const [bookField, setBookField] = useState('全部')
  const [partnerTab, setPartnerTab] = useState('corp')
  const [newsType, setNewsType] = useState('全部')
  const [applyType, setApplyType] = useState(null)
  const [formSubmitted, setFormSubmitted] = useState(false)

  const SUB_NAV = [
    { key: 'industry', icon: '🏭', label: '产教融合基地', desc: '企业实训·校企联培·政策解读' },
    { key: 'jobs', icon: '💼', label: '职业就业中心', desc: '岗位匹配·技能测评·就业指导' },
    { key: 'books', icon: '📚', label: '数智教材商城', desc: '数字教材·图书销售·配套课程' },
    { key: 'creator', icon: '✍️', label: '图书创作平台', desc: '创作入驻·出版对接·内容变现' },
    { key: 'courses', icon: '🎓', label: '数智精品课', desc: '职业技能·教材配套·实训项目课' },
    { key: 'partners', icon: '🤝', label: '合作资源中心', desc: '企业库·院校库·机构库·对接申请' },
    { key: 'news', icon: '📰', label: '数智成果资讯', desc: '融合出版·产教成果·行业动态' },
  ]

  function NavBreadcrumb({ label }) {
    return (
      <div className="flex items-center gap-2 mb-6 text-sm flex-wrap">
        <button onClick={() => setSection('home')} className="text-slate-500 hover:text-primary transition">数智职业</button>
        <span className="text-slate-300">/</span>
        <span className="text-bingo-dark font-medium">{label}</span>
      </div>
    )
  }

  function ApplyModal({ title, fields, onClose }) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
          {formSubmitted ? (
            <div className="text-center py-4">
              <div className="text-5xl mb-3">✅</div>
              <h3 className="font-bold text-bingo-dark text-xl mb-2">提交成功！</h3>
              <p className="text-slate-500 text-sm mb-5">专属顾问将在1个工作日内联系您</p>
              <button onClick={() => { setFormSubmitted(false); onClose() }} className="btn-primary px-8 py-2.5 text-sm">关闭</button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-bingo-dark text-lg">{title}</h3>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
              </div>
              <form onSubmit={e => { e.preventDefault(); setFormSubmitted(true) }} className="space-y-3">
                {fields.map((f, i) => (
                  <div key={i}>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">{f.label}</label>
                    {f.type === 'select' ? (
                      <select required={f.req} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary bg-white">
                        <option value="">请选择</option>
                        {f.options.map(o => <option key={o}>{o}</option>)}
                      </select>
                    ) : f.type === 'textarea' ? (
                      <textarea rows={3} placeholder={f.ph} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary resize-none" />
                    ) : (
                      <input required={f.req} type={f.type || 'text'} placeholder={f.ph}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary" />
                    )}
                  </div>
                ))}
                <button type="submit" className="btn-primary w-full py-2.5 text-sm mt-2">提交</button>
              </form>
            </>
          )}
        </div>
      </div>
    )
  }

  // ── 首页 ──────────────────────────────────────────────────
  if (section === 'home') return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Banner */}
      <section className="mb-10">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-bingo-dark via-slate-800 to-indigo-900 text-white p-8 sm:p-12">
          <div className="relative z-10 max-w-2xl">
            <p className="text-xs text-indigo-300 mb-2 tracking-wider">AI职业发展</p>
            <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-3">科技特长生升学路径规划｜AI科创专业报考指导｜校企实训与职业体验</h1>
            <p className="text-slate-300 text-sm mb-1">提前布局AI赛道，衔接升学与未来职业发展 · 数智技能学习 · 产教实训对接 · 就业资源匹配</p>
            <div className="flex flex-wrap gap-2 mb-6 mt-3">
              {['产教融合基地', '职业就业对接', '权威数字教材', '图书创作平台', '合作资源展示'].map((v, i) => (
                <span key={i} className="text-xs px-3 py-1 rounded-full bg-white/15 text-white/90">{v}</span>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => setSection('jobs')} className="bg-primary hover:bg-cyan-500 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition">查看规划指南</button>
              <button onClick={() => setSection('books')} className="bg-white/15 hover:bg-white/25 text-white px-5 py-2.5 rounded-xl text-sm transition">浏览教材商城</button>
              <button onClick={() => setSection('partners')} className="bg-white/15 hover:bg-white/25 text-white px-5 py-2.5 rounded-xl text-sm transition">合作对接</button>
            </div>
          </div>
          <div className="absolute right-8 bottom-6 text-9xl opacity-10 select-none">🚀</div>
        </div>
      </section>

      {/* 七大子板块导航 */}
      <section className="mb-10">
        <h2 className="section-title mb-4">七大核心板块</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {SUB_NAV.map(n => (
            <button key={n.key} onClick={() => setSection(n.key)}
              className="card p-4 flex flex-col items-center text-center hover:shadow-md hover:border-primary/30 hover:bg-primary/5 transition group">
              <span className="text-2xl mb-2">{n.icon}</span>
              <p className="text-xs font-semibold text-bingo-dark group-hover:text-primary leading-tight mb-1">{n.label}</p>
              <p className="text-[10px] text-slate-400 leading-tight hidden sm:block">{n.desc}</p>
            </button>
          ))}
        </div>
      </section>

      {/* 核心数据 */}
      <section className="mb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { num: '120+', label: '合作企业岗位', icon: '🏢' },
            { num: '50+', label: '院校选用教材', icon: '🎓' },
            { num: '86%', label: '对口就业率', icon: '💼' },
            { num: '3000+', label: '学员成功就业', icon: '🏆' },
          ].map((s, i) => (
            <div key={i} className="card p-6 text-center hover:shadow-md hover:border-primary/30 transition">
              <div className="text-3xl mb-2">{s.icon}</div>
              <p className="text-2xl font-bold text-primary">{s.num}</p>
              <p className="text-sm text-slate-600 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 最新资讯预览 */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title m-0">最新成果资讯</h2>
          <button onClick={() => setSection('news')} className="text-sm text-primary hover:underline">查看全部 →</button>
        </div>
        <div className="space-y-3">
          {NEWS.slice(0, 3).map(n => (
            <div key={n.id} className="card p-4 flex items-center gap-3 hover:border-primary/30 hover:shadow-md transition cursor-pointer"
              onClick={() => setSection('news')}>
              <span className={'text-[10px] px-2.5 py-1 rounded-full font-medium shrink-0 ' +
                (n.type === '融合出版成果' ? 'bg-violet-100 text-violet-700' : n.type === '产教融合成果' ? 'bg-sky-100 text-sky-700' : n.type === '就业成果' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600')}>{n.type}</span>
              <p className="text-sm text-slate-700 flex-1 line-clamp-1">{n.title}</p>
              {n.hot && <span className="text-[10px] bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full shrink-0">HOT</span>}
              <span className="text-xs text-slate-400 shrink-0">{n.date}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 快速留资 */}
      <section className="card p-6 bg-indigo-50 border-indigo-200/60 flex flex-wrap gap-5 items-start">
        <div className="flex-1 min-w-[200px]">
          <h3 className="font-bold text-bingo-dark mb-1">免费领取数智职业测评报告</h3>
          <p className="text-sm text-slate-600 mb-1">提交后立即发送《数智岗位能力测评报告》至手机</p>
          <p className="text-xs text-primary">进入私域社群，获取岗位信息·教材优惠·创作福利 →</p>
        </div>
        <form onSubmit={e => e.preventDefault()} className="flex flex-wrap gap-2 items-end flex-1 min-w-[260px]">
          <input className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary flex-1 min-w-[100px]" placeholder="姓名" />
          <input className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary flex-1 min-w-[120px]" placeholder="手机号" type="tel" />
          <button type="submit" className="btn-primary text-sm px-5 py-2 shrink-0">免费领取</button>
        </form>
      </section>
    </div>
  )

  // ── 产教融合基地 ──────────────────────────────────────────
  if (section === 'industry') return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <NavBreadcrumb label="产教融合基地" />
      <h2 className="text-2xl font-bold text-bingo-dark mb-1">产教融合基地</h2>
      <p className="text-slate-600 text-sm mb-8">打造校企合作展示窗口，实现B端机构引流与C端学员实训机会对接</p>

      {/* 企业实训基地 */}
      <section className="mb-8">
        <h3 className="font-semibold text-bingo-dark mb-4">🏭 企业实训基地</h3>
        <div className="grid md:grid-cols-3 gap-5">
          {PARTNERS_CORP.map((p, i) => (
            <div key={i} className="card p-6 hover:shadow-md hover:border-primary/30 transition">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl mb-3">{p.name.charAt(0)}</div>
              <h4 className="font-bold text-bingo-dark mb-1">{p.name}</h4>
              <p className="text-xs text-slate-500 mb-2">{p.field} · {p.size}</p>
              <p className="text-xs text-slate-600 mb-3">合作内容：{p.collab}</p>
              <p className="text-xs text-emerald-600 font-medium mb-4">✓ {p.result}</p>
              <button onClick={() => { setApplyType('training'); setFormSubmitted(false) }}
                className="btn-primary text-xs px-4 py-2 w-full">申请实训岗位</button>
            </div>
          ))}
        </div>
      </section>

      {/* 校企联合培养 */}
      <section className="mb-8">
        <h3 className="font-semibold text-bingo-dark mb-4">🎓 校企联合培养</h3>
        <div className="card p-6 bg-indigo-50 border-indigo-200/60">
          <p className="text-sm text-slate-600 mb-4">面向中职/高职/高校推出定制化数智人才培养方案，展示合作院校案例、课程体系、人才输送成果</p>
          <div className="grid md:grid-cols-3 gap-4 mb-5">
            {PARTNERS_SCHOOL.map((s, i) => (
              <div key={i} className="bg-white rounded-xl p-4 border border-indigo-100">
                <p className="font-semibold text-sm text-bingo-dark mb-1">{s.name}</p>
                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{s.type}</span>
                <p className="text-xs text-slate-500 mt-2 mb-1">{s.collab}</p>
                <p className="text-xs text-emerald-600 font-medium">✓ {s.result}</p>
              </div>
            ))}
          </div>
          <button onClick={() => { setApplyType('school'); setFormSubmitted(false) }} className="btn-primary text-sm px-6 py-2.5">院校合作申请 →</button>
        </div>
      </section>

      {/* 产教政策解读 */}
      <section className="card p-6 bg-slate-50">
        <h3 className="font-semibold text-bingo-dark mb-4">📋 产教政策解读</h3>
        <div className="space-y-3">
          {[
            { title: '教育部《关于深化现代职业教育体系建设改革的意见》解读', date: '2025-06' },
            { title: '数字经济背景下职业院校数智化课程改革路径探析', date: '2025-05' },
            { title: '产教融合实训基地建设标准与扶持政策汇编', date: '2025-04' },
          ].map((p, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-100 hover:border-primary/30 transition cursor-pointer">
              <p className="text-sm text-slate-700">{p.title}</p>
              <span className="text-xs text-slate-400 shrink-0 ml-3">{p.date}</span>
            </div>
          ))}
        </div>
      </section>

      {applyType === 'training' && (
        <ApplyModal title="申请实训岗位" onClose={() => setApplyType(null)} fields={[
          { label: '姓名 *', type: 'text', ph: '请输入姓名', req: true },
          { label: '手机号 *', type: 'tel', ph: '请输入手机号', req: true },
          { label: '意向岗位', type: 'select', options: ['AI训练师', '数据分析师', '智能制造运维', '新媒体运营'], req: false },
          { label: '学历', type: 'select', options: ['中职/中专', '大专/高职', '本科', '研究生'], req: false },
        ]} />
      )}
      {applyType === 'school' && (
        <ApplyModal title="院校合作申请" onClose={() => setApplyType(null)} fields={[
          { label: '院校名称 *', type: 'text', ph: '请输入院校全称', req: true },
          { label: '联系人 *', type: 'text', ph: '负责人姓名', req: true },
          { label: '联系电话 *', type: 'tel', ph: '请输入手机号', req: true },
          { label: '院校类型', type: 'select', options: ['中职', '高职', '本科', '其他'], req: false },
          { label: '合作意向说明', type: 'textarea', ph: '请简述合作需求', req: false },
        ]} />
      )}
    </div>
  )

  // ── 职业就业中心 ──────────────────────────────────────────
  if (section === 'jobs') return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <NavBreadcrumb label="职业就业中心" />
      <h2 className="text-2xl font-bold text-bingo-dark mb-1">职业就业中心</h2>
      <p className="text-slate-600 text-sm mb-6">技能学习-岗位匹配-就业推荐 · 仅向已完成课程/教材学习的学员开放精准岗位推荐</p>

      {/* 岗位筛选 */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {JOB_FIELDS.map(f => (
          <button key={f} onClick={() => setJobField(f)}
            className={'px-4 py-1.5 rounded-full text-sm transition ' + (jobField === f ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>{f}</button>
        ))}
      </div>

      {/* 岗位列表 */}
      <div className="space-y-4 mb-8">
        {JOBS.filter(j => jobField === '全部' || j.field === jobField).map(j => (
          <div key={j.id} className="card p-5 hover:shadow-md hover:border-primary/30 transition">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-bold text-bingo-dark">{j.title}</h3>
                  {j.hot && <span className="text-[10px] bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full font-medium">热招</span>}
                  <span className={'text-[10px] px-2 py-0.5 rounded-full ' + (j.type === '产教实训岗' ? 'bg-sky-100 text-sky-700' : j.type === '正式录用' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700')}>{j.type}</span>
                </div>
                <p className="text-sm text-slate-600 mb-2">{j.company} · {j.area} · {j.edu}</p>
                <div className="flex flex-wrap gap-1">
                  {j.skills.map((s, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600">{s}</span>
                  ))}
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="font-bold text-rose-500 text-lg">{j.salary}</p>
                <button onClick={() => { setApplyType('job'); setFormSubmitted(false) }}
                  className="mt-2 btn-primary text-xs px-4 py-2">投递简历</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 职业技能测评 */}
      <section className="mb-8">
        <div className="card p-6 bg-indigo-50 border-indigo-200/60">
          <h3 className="font-semibold text-bingo-dark mb-2">🧪 职业技能测评</h3>
          <p className="text-sm text-slate-600 mb-4">针对不同岗位设计专属测评题库，测评后生成「技能短板分析+配套课程/教材推荐」，精准提升</p>
          <div className="grid sm:grid-cols-3 gap-3 mb-4">
            {['AI训练师能力测评', '数据分析师能力测评', '数智运营能力测评'].map((t, i) => (
              <div key={i} className="bg-white rounded-xl p-4 border border-indigo-100 text-center">
                <p className="font-medium text-sm text-bingo-dark mb-2">{t}</p>
                <button type="button" className="btn-primary text-xs px-4 py-1.5">立即测评（免费）</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 就业成果 */}
      <section className="card p-6 bg-emerald-50 border-emerald-200/60">
        <h3 className="font-semibold text-bingo-dark mb-4">🎉 就业成果展示</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { name: '李同学', position: 'AI训练师 @ XX智能科技', salary: '11K/月', time: '2个月学习' },
            { name: '王同学', position: '数据分析师 @ XX大数据', salary: '14K/月', time: '4个月学习' },
            { name: '张同学', position: '智能制造运维 @ XX集团', salary: '12K/月', time: '3个月学习' },
          ].map((c, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-emerald-100">
              <p className="font-semibold text-sm text-bingo-dark">{c.name}</p>
              <p className="text-xs text-slate-600 mt-1">{c.position}</p>
              <p className="text-xs text-emerald-600 font-medium mt-1">薪资：{c.salary} · {c.time}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-3">
          <button onClick={() => setSection('courses')} className="btn-primary text-sm px-5 py-2">去学课程 →</button>
          <button onClick={() => setSection('books')} className="border border-primary text-primary text-sm px-5 py-2 rounded-xl hover:bg-primary/10 transition">购买配套教材</button>
        </div>
      </section>

      {applyType === 'job' && (
        <ApplyModal title="投递简历" onClose={() => setApplyType(null)} fields={[
          { label: '姓名 *', type: 'text', ph: '请输入姓名', req: true },
          { label: '手机号 *', type: 'tel', ph: '请输入手机号', req: true },
          { label: '最高学历', type: 'select', options: ['中职/中专', '大专/高职', '本科', '研究生'], req: false },
          { label: '意向岗位类型', type: 'select', options: ['产教实训岗', '正式录用', '实习岗'], req: false },
          { label: '个人优势/补充说明', type: 'textarea', ph: '简述技能背景', req: false },
        ]} />
      )}
    </div>
  )

  // ── 数智教材商城 ──────────────────────────────────────────
  if (section === 'books') return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <NavBreadcrumb label="数智教材商城" />
      <h2 className="text-2xl font-bold text-bingo-dark mb-1">数智教材商城</h2>
      <p className="text-slate-600 text-sm mb-6">数智职业专属教材销售阵地，教材+课程捆绑销售，购教材赠配套课程试学权限</p>

      {/* 筛选 */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['全部', '人工智能', '大数据', '智能制造', '新媒体'].map(f => (
          <button key={f} onClick={() => setBookField(f)}
            className={'px-4 py-1.5 rounded-full text-sm transition ' + (bookField === f ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>{f}</button>
        ))}
      </div>

      {/* 教材卡片 */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {BOOKS.filter(b => bookField === '全部' || b.field === bookField).map(b => (
          <div key={b.id} className="card p-5 hover:shadow-md hover:border-primary/30 transition group">
            <div className="aspect-[3/4] rounded-xl bg-gradient-to-br from-indigo-100 to-slate-100 flex items-center justify-center text-5xl mb-4">{b.cover}</div>
            <h3 className="font-bold text-bingo-dark text-sm mb-1 group-hover:text-primary transition line-clamp-2">{b.name}</h3>
            <p className="text-xs text-slate-500 mb-2">{b.field} · {b.schools} 所院校选用 · 销量 {b.sales}</p>
            <div className="flex flex-wrap gap-1 mb-3">
              {b.tags.map((t, i) => <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">{t}</span>)}
            </div>
            <p className="text-xs text-slate-500 mb-3 line-clamp-2">{b.desc}</p>
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="font-bold text-rose-500 text-lg">¥{b.price}</span>
                <span className="text-xs text-slate-400 line-through ml-1">¥{b.origPrice}</span>
              </div>
            </div>
            <div className="space-y-2">
              <button type="button" className="btn-primary text-xs px-4 py-2 w-full">立即购买</button>
              <a href="https://binguoketang.com/#/bingoBook/home?flag=store" target="_blank" rel="noopener noreferrer"
                className="block text-center text-xs border border-primary text-primary px-4 py-2 rounded-lg hover:bg-primary/10 transition">在线试读</a>
            </div>
          </div>
        ))}
      </div>

      {/* 优惠活动 */}
      <div className="card p-5 bg-amber-50 border-amber-200/60 mb-6">
        <h3 className="font-semibold text-bingo-dark mb-3">🎁 专属优惠活动</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { title: '教材拼团', desc: '3人成团享8折，邀请好友一起学', icon: '👥' },
            { title: '课程+教材套餐', desc: '组合购比单购优惠20%-30%', icon: '📦' },
            { title: '分享赚佣金', desc: '分享教材链接，成交后获得佣金', icon: '💰' },
          ].map((act, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-amber-100 flex gap-3">
              <span className="text-2xl shrink-0">{act.icon}</span>
              <div>
                <p className="font-medium text-sm text-bingo-dark">{act.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{act.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-4 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">更多教材请访问缤果数字教材平台，账号互通，无需重新注册</p>
        <a href="https://binguoketang.com/#/bingoBook/home?flag=store" target="_blank" rel="noopener noreferrer"
          className="btn-primary text-sm px-5 py-2">进入缤果教材平台 →</a>
      </div>
    </div>
  )

  // ── 图书创作平台 ──────────────────────────────────────────
  if (section === 'creator') return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <NavBreadcrumb label="图书创作平台" />
      <h2 className="text-2xl font-bold text-bingo-dark mb-1">图书创作平台</h2>
      <p className="text-slate-600 text-sm mb-8">数智教育内容创作变现平台，从创作到出版全流程支持，吸引教育工作者与行业专家入驻</p>

      {/* 入驻权益 */}
      <section className="mb-8">
        <div className="card p-6 bg-gradient-to-r from-indigo-500 to-violet-600 text-white">
          <h3 className="font-bold text-xl mb-2">创作者孵化计划</h3>
          <p className="text-white/80 text-sm mb-4">优秀创作者可成为缤果AI学院特邀讲师，实现「创作-授课-变现」多重收益</p>
          <div className="grid sm:grid-cols-2 gap-3 mb-5">
            {[['💰 内容变现', '教材/课程销售收益按比例分成'], ['🔒 版权保护', '平台提供全程版权保障，安全创作'], ['📣 平台推广', '优秀作品纳入平台主推，扩大曝光'], ['🤝 校企对接', '优质内容直接对接院校选用与企业采购']].map(([t, d], i) => (
              <div key={i} className="bg-white/15 rounded-xl p-3 flex gap-2">
                <span className="text-sm font-medium text-white">{t}</span>
                <span className="text-xs text-white/70 mt-0.5">{d}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <a href="https://binguoketang.com/#/author/login" target="_blank" rel="noopener noreferrer"
              className="bg-white text-indigo-600 font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-white/90 transition">一键入驻创作平台</a>
            <button type="button" className="bg-white/20 text-white px-5 py-2.5 rounded-xl text-sm hover:bg-white/30 transition">了解入驻条件</button>
          </div>
        </div>
      </section>

      {/* 创作工具 */}
      <section className="mb-8">
        <h3 className="font-semibold text-bingo-dark mb-4">🛠️ 创作工具与服务</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: '📝', title: '教材编写', desc: '专业模板+AI辅助写作，快速产出高质量教材' },
            { icon: '❓', title: '题库制作', desc: '多题型题库制作工具，与教材无缝绑定' },
            { icon: '🎬', title: '教学视频', desc: '配套视频剪辑支持，一键关联教材章节' },
            { icon: '📖', title: '出版对接', desc: '排版设计·印刷定制·出版流程全程支持' },
          ].map((t, i) => (
            <div key={i} className="card p-5 hover:shadow-md hover:border-primary/30 transition">
              <span className="text-2xl mb-2 block">{t.icon}</span>
              <h4 className="font-semibold text-sm text-bingo-dark mb-1">{t.title}</h4>
              <p className="text-xs text-slate-500">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 优秀创作者 */}
      <section className="mb-6">
        <h3 className="font-semibold text-bingo-dark mb-4">⭐ 优秀创作者/作品展示</h3>
        <div className="grid md:grid-cols-3 gap-5">
          {CREATORS.map((c, i) => (
            <div key={i} className="card p-5 hover:shadow-md hover:border-primary/30 transition">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">{c.name.charAt(0)}</div>
                <div>
                  <p className="font-bold text-bingo-dark text-sm">{c.name}</p>
                  <p className="text-xs text-slate-500">{c.title}</p>
                </div>
              </div>
              <p className="text-xs text-primary mb-3 font-medium">{c.field}</p>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[['作品', c.works + '部'], ['销量', c.sales.toLocaleString()], ['选用院校', c.schools + '所']].map(([l, v]) => (
                  <div key={l} className="bg-slate-50 rounded-lg p-2">
                    <p className="text-xs text-slate-400">{l}</p>
                    <p className="font-bold text-primary text-sm">{v}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )

  // ── 数智精品课 ──────────────────────────────────────────
  if (section === 'courses') return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <NavBreadcrumb label="数智精品课" />
      <h2 className="text-2xl font-bold text-bingo-dark mb-1">数智精品课</h2>
      <p className="text-slate-600 text-sm mb-6">职业技能·教材配套·实训项目课 · 课程学习数据可对接职业技能测评，为就业推荐提供依据</p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {COURSES.map(c => (
          <div key={c.id} className="card p-6 hover:shadow-md hover:border-primary/30 transition group">
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className={'text-[10px] px-2.5 py-1 rounded-full font-medium ' +
                (c.field === '人工智能' ? 'bg-violet-100 text-violet-700' : c.field === '大数据' ? 'bg-sky-100 text-sky-700' : c.field === '智能制造' ? 'bg-amber-100 text-amber-700' : c.field === '就业赋能' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-600')}>{c.field}</span>
              {c.hot && <span className="text-[10px] bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full font-medium shrink-0">HOT</span>}
            </div>
            <h3 className="font-bold text-bingo-dark group-hover:text-primary transition mb-1">{c.name}</h3>
            <p className="text-xs text-slate-500 mb-3">{c.level} · 共{c.lessons}课时</p>
            {c.bookId && (
              <p className="text-xs text-indigo-600 mb-3 font-medium">📚 配套教材：{BOOKS.find(b => b.id === c.bookId)?.name}</p>
            )}
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="font-bold text-rose-500 text-lg">¥{c.price}</span>
                <span className="text-xs text-slate-400 line-through ml-1">¥{c.origPrice}</span>
              </div>
              <span className="text-xs text-slate-400">{c.lessons}课时</span>
            </div>
            <div className="flex gap-2">
              <button type="button" className="btn-primary text-xs px-4 py-2 flex-1">立即报名</button>
              <button type="button" className="border border-slate-200 rounded-lg text-xs px-4 py-2 text-slate-600 hover:bg-slate-50">免费试听</button>
            </div>
          </div>
        ))}
      </div>

      {/* 三合一学习包 */}
      <div className="card p-6 bg-gradient-to-r from-indigo-50 to-violet-50 border-indigo-200/60">
        <h3 className="font-bold text-bingo-dark mb-2">📦 课程+教材+实训 三合一学习包</h3>
        <p className="text-sm text-slate-600 mb-4">一次性满足「学-练-用」需求，比单独购买节省30%，课程结束直接对接实训岗位</p>
        <div className="grid sm:grid-cols-3 gap-3 mb-4">
          {['AI数据分析套餐', '智能制造实训包', '数智就业全链路包'].map((name, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-indigo-100 text-center">
              <p className="font-semibold text-sm text-bingo-dark mb-1">{name}</p>
              <p className="text-xs text-slate-500">课程+教材+实训岗位直通</p>
              <p className="text-primary font-bold mt-2 text-sm">立省30%</p>
            </div>
          ))}
        </div>
        <button type="button" className="btn-primary text-sm px-6 py-2.5">查看学习包详情</button>
      </div>
    </div>
  )

  // ── 合作资源中心 ──────────────────────────────────────────
  if (section === 'partners') return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <NavBreadcrumb label="合作资源中心" />
      <h2 className="text-2xl font-bold text-bingo-dark mb-1">合作资源中心</h2>
      <p className="text-slate-600 text-sm mb-2">数智职业教育合作资源全景展示窗口 · 合作品牌曝光与新合作意向精准对接</p>
      <p className="text-xs text-primary mb-6">本板块与 <Link to="/franchise" className="hover:underline">机构合作</Link> 板块双向联动，更多全站合作政策请前往机构合作了解</p>

      {/* 标签切换 */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[['corp', '合作企业库'], ['school', '合作院校库'], ['org', '合作机构库'], ['apply', '合作对接申请']].map(([k, l]) => (
          <button key={k} onClick={() => setPartnerTab(k)}
            className={'px-5 py-2 rounded-full text-sm font-medium transition ' + (partnerTab === k ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>{l}</button>
        ))}
      </div>

      {partnerTab === 'corp' && (
        <div className="grid md:grid-cols-3 gap-5">
          {[...PARTNERS_CORP, { name: 'XX人工智能研究院', field: 'AI', size: '100-500人', collab: '联合课题研究+技术输出', result: '共建AI教材2部' }].map((p, i) => (
            <div key={i} className="card p-5 hover:shadow-md hover:border-primary/30 transition">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">{p.name.charAt(0)}</div>
                <div>
                  <p className="font-semibold text-sm text-bingo-dark">{p.name}</p>
                  <span className="text-[10px] bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full">{p.field}</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 mb-1">{p.size}</p>
              <p className="text-xs text-slate-600 mb-2">合作：{p.collab}</p>
              <p className="text-xs text-emerald-600 font-medium">✓ {p.result}</p>
            </div>
          ))}
        </div>
      )}

      {partnerTab === 'school' && (
        <div className="grid md:grid-cols-3 gap-5">
          {[...PARTNERS_SCHOOL, { name: 'XX工程职业技术学院', type: '高职', collab: '产教融合基地+教材选用+就业推荐', result: '年输送就业学员150名' }].map((s, i) => (
            <div key={i} className="card p-5 hover:shadow-md hover:border-primary/30 transition">
              <div className="flex items-center gap-2 mb-3">
                <span className={'text-[10px] px-2.5 py-1 rounded-full font-medium ' + (s.type === '高职' ? 'bg-sky-100 text-sky-700' : s.type === '中职' ? 'bg-emerald-100 text-emerald-700' : 'bg-violet-100 text-violet-700')}>{s.type}</span>
                <p className="font-semibold text-sm text-bingo-dark">{s.name}</p>
              </div>
              <p className="text-xs text-slate-600 mb-2">合作模式：{s.collab}</p>
              <p className="text-xs text-emerald-600 font-medium">✓ {s.result}</p>
            </div>
          ))}
        </div>
      )}

      {partnerTab === 'org' && (
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { name: 'XX数字技能培训中心', type: '培训机构', collab: '课程推广+赛事联动+人才培养', advantage: '覆盖12座城市，10万+学员' },
            { name: 'XX人工智能产业联盟', type: '行业协会', collab: '政策对接+行业发布+课程背书', advantage: '会员企业300+' },
            { name: 'XX智能制造协会', type: '行业协会', collab: '教材评审+岗位标准制定+就业对接', advantage: '行业覆盖率60%' },
          ].map((o, i) => (
            <div key={i} className="card p-5 hover:shadow-md hover:border-primary/30 transition">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{o.type}</span>
                <p className="font-semibold text-sm text-bingo-dark">{o.name}</p>
              </div>
              <p className="text-xs text-slate-600 mb-2">合作：{o.collab}</p>
              <p className="text-xs text-indigo-600 font-medium">{o.advantage}</p>
            </div>
          ))}
        </div>
      )}

      {partnerTab === 'apply' && (
        <div className="max-w-xl">
          {formSubmitted ? (
            <div className="card p-10 text-center">
              <div className="text-5xl mb-3">✅</div>
              <h3 className="font-bold text-bingo-dark text-xl mb-2">合作申请已提交！</h3>
              <p className="text-slate-500 text-sm mb-5">专属商务团队将在1个工作日内联系您，一对一对接合作需求</p>
              <button onClick={() => setFormSubmitted(false)} className="btn-primary px-8 py-2.5 text-sm">继续浏览</button>
            </div>
          ) : (
            <form onSubmit={e => { e.preventDefault(); setFormSubmitted(true) }} className="card p-7 space-y-4">
              <h3 className="font-bold text-bingo-dark text-lg">合作意向申请</h3>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">合作类型 *</label>
                <select required className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary bg-white">
                  <option value="">请选择</option>
                  <option>企业合作（产教融合/就业/课程共建）</option>
                  <option>院校合作（联合培养/教材选用/实训基地）</option>
                  <option>机构合作（课程推广/赛事联动）</option>
                </select>
              </div>
              {[
                { label: '单位名称 *', type: 'text', ph: '请输入单位全称' },
                { label: '联系人 *', type: 'text', ph: '负责人姓名' },
                { label: '联系电话 *', type: 'tel', ph: '请输入手机号' },
              ].map((f, i) => (
                <div key={i}>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">{f.label}</label>
                  <input required={f.label.includes('*')} type={f.type} placeholder={f.ph}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary" />
                </div>
              ))}
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">合作需求说明</label>
                <textarea rows={4} placeholder="请详细描述您的合作需求、期望合作形式、背景资源等"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary resize-none" />
              </div>
              <button type="submit" className="btn-primary w-full py-3 text-sm">提交合作申请 · 1个工作日内回复</button>
            </form>
          )}
        </div>
      )}
    </div>
  )

  // ── 数智成果资讯 ──────────────────────────────────────────
  if (section === 'news') return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <NavBreadcrumb label="数智成果资讯" />
      <h2 className="text-2xl font-bold text-bingo-dark mb-1">数智成果资讯</h2>
      <p className="text-slate-600 text-sm mb-6">数智职业教育成果传播与行业动态发布的权威阵地 · 资讯支持分享至社交平台引流</p>

      {/* 类型筛选 */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['全部', '融合出版成果', '产教融合成果', '就业成果', '行业动态'].map(t => (
          <button key={t} onClick={() => setNewsType(t)}
            className={'px-4 py-1.5 rounded-full text-sm transition ' + (newsType === t ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>{t}</button>
        ))}
      </div>

      {/* 资讯列表 */}
      <div className="space-y-4 mb-8">
        {NEWS.filter(n => newsType === '全部' || n.type === newsType).map(n => (
          <div key={n.id} className="card p-5 hover:shadow-md hover:border-primary/30 transition cursor-pointer">
            <div className="flex items-start gap-3">
              <span className={'text-[10px] px-2.5 py-1 rounded-full font-medium shrink-0 mt-0.5 ' +
                (n.type === '融合出版成果' ? 'bg-violet-100 text-violet-700' : n.type === '产教融合成果' ? 'bg-sky-100 text-sky-700' : n.type === '就业成果' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600')}>{n.type}</span>
              <div className="flex-1">
                <h3 className="font-semibold text-bingo-dark text-sm mb-2">{n.title}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">{n.date}</span>
                  <div className="flex gap-2">
                    {n.hot && <span className="text-[10px] bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full">HOT</span>}
                    <button type="button" className="text-xs text-primary hover:underline">分享</button>
                    <button type="button" className="text-xs text-slate-500 hover:text-primary">阅读全文 →</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 融合出版成果专题 */}
      <div className="card p-6 bg-violet-50 border-violet-200/60 mb-6">
        <h3 className="font-semibold text-bingo-dark mb-3">📘 融合出版成果专题</h3>
        <p className="text-sm text-slate-600 mb-4">缤果数字教材融合出版最新成果，省级/国家级规划教材公示，院校选用量实时更新</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {BOOKS.slice(0, 2).map(b => (
            <div key={b.id} className="bg-white rounded-xl p-4 border border-violet-100 flex gap-3 items-center">
              <span className="text-3xl">{b.cover}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-bingo-dark line-clamp-2">{b.name}</p>
                <p className="text-xs text-violet-600 mt-1">已被 {b.schools} 所院校选用 · 销量 {b.sales.toLocaleString()}</p>
              </div>
              <button onClick={() => setSection('books')} className="btn-primary text-xs px-3 py-1.5 shrink-0">购买</button>
            </div>
          ))}
        </div>
      </div>

      {/* 合作对接入口 */}
      <div className="card p-5 bg-indigo-50 border-indigo-200/60 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-bingo-dark">看到成果感兴趣？立即联系我们开展合作</p>
          <p className="text-sm text-slate-600 mt-0.5">企业/院校/机构合作、创作者入驻、课程共建一站式对接</p>
        </div>
        <button onClick={() => { setPartnerTab('apply'); setSection('partners') }} className="btn-primary text-sm px-5 py-2.5 shrink-0">立即申请合作</button>
      </div>
    </div>
  )

  return null
}
