import { useState } from 'react'
import { Link } from 'react-router-dom'

// ─── 数据 ────────────────────────────────────────────────

const STATS = [
  { icon: '🏅', label: '白名单赛事获奖', value: '1200+人次', color: 'text-amber-600' },
  { icon: '🎓', label: '科技特长生录取', value: '2000+人', color: 'text-sky-600' },
  { icon: '🏫', label: '合作校/机构', value: '500+家', color: 'text-emerald-600' },
  { icon: '🎨', label: 'AI作品孵化', value: '10万+件', color: 'text-violet-600' },
  { icon: '😊', label: '家长满意度', value: '98%+', color: 'text-rose-600' },
  { icon: '🌍', label: '区域落地校区', value: '300+个', color: 'text-orange-600' },
]

// C端 — 赛事获奖
const AWARD_CASES = [
  { name: '张小明', grade: '小学6年级', event: '全国青少年AI挑战赛', award: '全国一等奖', path: '零基础→6个月集训', city: '北京', tag: '科创类' },
  { name: '李思涵', grade: '初中2年级', event: 'CAAI全国AI竞赛', award: '省级特等奖', path: '进阶班→3个月', city: '上海', tag: 'AI设计类' },
  { name: '王梓轩', grade: '小学5年级', event: '白名单编程赛', award: '全国二等奖', path: '竞赛培优课→4个月', city: '深圳', tag: '编程类' },
  { name: '陈雨桐', grade: '初中1年级', event: '国际青少年AI创新赛', award: '亚太区金奖', path: '国际赛专项→5个月', city: '广州', tag: '国际赛' },
]


// C端 — 升学赋能
const ADMISSION_CASES = [
  { name: '赵一凡', from: '普通公立小学', to: '省重点初中', period: '规划18个月', cert: '2项白名单赛事获奖+AI能力证书', city: '杭州' },
  { name: '孙悦琪', from: '一般初中', to: '市示范高中科技班', period: '规划12个月', cert: '全国科创赛一等奖+特长生资质', city: '成都' },
  { name: '周俊熙', from: '普通初中', to: '重点高中创新实验班', period: '规划15个月', cert: '国际赛金奖+AI素养认证', city: '南京' },
]

const ADMISSION_FLOW = [
  { step: '01', title: 'AI学习', desc: '系统课程+素养培养' },
  { step: '02', title: '竞赛获奖', desc: '白名单/国际赛成果' },
  { step: '03', title: '资质认证', desc: 'AI能力等级证书' },
  { step: '04', title: '升学申报', desc: '科技特长生申请' },
  { step: '05', title: '名校对接', desc: '重点校录取' },
]

// C端 — 能力成长
const WORKS = [
  { title: 'AI城市交通优化系统', author: '刘子墨', age: '13岁', tool: 'Python+AI分析', ability: '逻辑思维+数据分析', tag: 'AI编程' },
  { title: '智能绘本创作', author: '吴若溪', age: '9岁', tool: 'AI绘画+故事生成', ability: '创意创造+表达能力', tag: 'AI绘画' },
  { title: '校园AI环保助手', author: '郑浩然', age: '11岁', tool: 'AI识别+数据可视化', ability: '科学思维+工具应用', tag: 'AI创新' },
  { title: '方言保护AI项目', author: '林晨熙', age: '15岁', tool: 'NLP+语音识别', ability: '人文思维+技术融合', tag: '综合创新' },
]

const ABILITY_PYRAMID = [
  { level: '成果输出', desc: '作品/竞赛/认证', color: 'bg-primary text-white' },
  { level: '创新创造', desc: '项目设计/问题解决', color: 'bg-cyan-500 text-white' },
  { level: '思维培养', desc: '逻辑/批判/元认知', color: 'bg-sky-400 text-white' },
  { level: '工具应用', desc: 'AI工具熟练使用', color: 'bg-slate-200 text-slate-700' },
]

const PARENT_REVIEWS = [
  { name: '李女士', city: '北京', text: '孩子从不会用AI到全国一等奖，短短6个月进步惊人，思维逻辑明显变强！', tag: '科创特长生家长' },
  { name: '张先生', city: '上海', text: '原来担心孩子只会用工具不会创造，现在他自己设计了AI项目，完全超出预期！', tag: '学员家长' },
  { name: '王女士', city: '成都', text: '缤果的课程体系非常系统，孩子的创新能力和表达能力都有明显提升。', tag: '小学生家长' },
]

// B端 — 学校合作
const SCHOOL_CASES = [
  { name: 'XX市实验小学', type: '公办', region: '北京', students: 1200, teachers: 8, events: 3, desc: '3个月落地AI素养课，全校参与，20+人获白名单赛事奖' },
  { name: 'XX民办双语学校', type: '民办', region: '上海', students: 800, teachers: 5, events: 2, desc: '引入竞赛培优课，首年6人考入重点中学科创班' },
  { name: 'XX区中心初中', type: '公办', region: '广州', students: 1500, teachers: 12, events: 4, desc: '建立AI教育特色课程，获评"区级AI教育示范校"' },
]

// B端 — 机构加盟
const FRANCHISE_CASES = [
  { name: 'XX少儿编程机构', region: '杭州', months: 6, students: 210, events: 3, revenue: '营收提升72%', review: '加盟6个月，招生翻倍，赛事资源是最大亮点！' },
  { name: 'XX教培连锁中心', region: '成都', months: 8, students: 350, events: 5, revenue: '月均营收+15万', review: '全套运营支持，省去了大量试错成本，值！' },
  { name: 'XX素质教育中心', region: '南京', months: 4, students: 150, events: 2, revenue: '回本周期4个月', review: '课程体系成熟，家长口碑好，续费率很高。' },
]

const FRANCHISE_FLOW = [
  '品牌授权', '课程导入', '师资培训', '赛事落地', '运营支持', '营销赋能',
]

// B端 — OEM定制
const OEM_CASES = [
  { brand: 'XX科技教育品牌', type: '教具定制', desc: 'AI编程教具定制，销量500+套，覆盖学员800+人' },
  { brand: 'XX教育集团', type: '联名课程', desc: '联名AI素养课程，覆盖旗下30所学校，学员3000+人' },
  { brand: 'XX区教育局', type: '技术输出', desc: 'AI教育管理平台定制，服务全区200+所学校' },
]

// 三级案例详情数据
const DETAIL_CASES = {
  award: [
    {
      id: 'a1',
      title: 'XX同学·小学6年级 | 从AI零基础到全国白名单赛事一等奖，仅用6个月',
      tags: ['AI零基础', '不知怎么选竞赛', '缺乏备赛方法'],
      solution: '缤果白名单赛事通关营（零基础班）+ 1V1教练备赛指导 + 赛事模拟答辩训练',
      timeline: [
        { time: '2025.01', event: '报名零基础班课程' },
        { time: '2025.03', event: 'AI基础达标，进入集训' },
        { time: '2025.05', event: '备赛集训+模拟答辩' },
        { time: '2025.06', event: '参加全国白名单赛事' },
        { time: '2025.07', event: '荣获全国一等奖🏆' },
      ],
      results: ['全国赛一等奖', 'AI工具应用能力+80%', '逻辑思维能力+75%'],
      ctaLabel: '同款赛事通关营报名', ctaTo: '/events',
    },
  ],
  admission: [
    {
      id: 'adm1',
      title: 'XX同学·初中 | 从普通学生到科技特长生，考入市示范高中科技班',
      tags: ['不知AI能否升学', '缺乏竞赛经历', '升学规划空白'],
      solution: '缤果科技特长生路径课 + 竞赛培优 + 专属升学规划师对接',
      timeline: [
        { time: '2024.09', event: '开始科技特长生规划' },
        { time: '2024.11', event: '系统学习AI课程' },
        { time: '2025.03', event: '参加省级AI创新赛获奖' },
        { time: '2025.05', event: '申报科技特长生资质' },
        { time: '2025.07', event: '成功录取市示范高中🎓' },
      ],
      results: ['市示范高中录取', '省级赛事一等奖', 'AI能力等级证书'],
      ctaLabel: '科技特长生规划咨询', ctaTo: '/cert',
    },
  ],
}

// ─── 辅助组件 ─────────────────────────────────────────────

function StatBadge({ icon, label, value, color }) {
  return (
    <div className="flex flex-col items-center p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
      <span className="text-2xl mb-1">{icon}</span>
      <span className={'text-xl font-bold ' + color}>{value}</span>
      <span className="text-xs text-slate-500 mt-0.5 text-center">{label}</span>
    </div>
  )
}

// 四级转化表单弹窗
function LeadModal({ title, subtitle, onClose }) {
  const [submitted, setSubmitted] = useState(false)
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
        {submitted ? (
          <div className="text-center py-4">
            <div className="text-5xl mb-3">✅</div>
            <h3 className="font-bold text-bingo-dark text-xl mb-2">提交成功！</h3>
            <p className="text-slate-500 text-sm mb-2">客服已收到，10分钟内联系您</p>
            <p className="text-xs text-slate-400 mb-5">微信：bingoacademy</p>
            <button onClick={onClose} className="bg-primary text-white px-8 py-2.5 rounded-xl text-sm font-bold">关闭</button>
          </div>
        ) : (
          <>
            <h3 className="font-bold text-bingo-dark text-xl mb-1">{title}</h3>
            {subtitle && <p className="text-slate-500 text-xs mb-5">{subtitle}</p>}
            <form onSubmit={e => { e.preventDefault(); setSubmitted(true) }} className="space-y-3">
              <input required type="text" placeholder="姓名（或机构名称）"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary" />
              <input required type="tel" placeholder="手机号"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary" />
              <input type="text" placeholder="所在地区（选填）"
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary" />
              <button type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold text-sm transition">
                立即提交
              </button>
            </form>
            <p className="text-center text-xs text-slate-400 mt-3">提交后10分钟内客服联系您，微信：bingoacademy</p>
          </>
        )}
      </div>
    </div>
  )
}

// 三级案例详情弹窗
function CaseDetailModal({ caseData, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center p-4 overflow-y-auto"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl w-full max-w-2xl my-6 shadow-2xl overflow-hidden">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-bingo-dark to-primary p-6 text-white">
          <button onClick={onClose} className="text-white/60 hover:text-white text-sm mb-3 block">← 返回</button>
          <h2 className="font-bold text-lg leading-snug">{caseData.title}</h2>
          <div className="flex flex-wrap gap-2 mt-3">
            {caseData.tags.map((t, i) => (
              <span key={i} className="text-[11px] bg-white/20 px-2 py-1 rounded-full">{t}</span>
            ))}
          </div>
        </div>
        <div className="p-6 space-y-5">
          {/* 解决方案 */}
          <div>
            <p className="text-xs font-bold text-primary mb-2 tracking-wider">解决方案</p>
            <div className="bg-primary/5 rounded-xl p-4 text-sm text-bingo-dark">{caseData.solution}</div>
          </div>
          {/* 时间线 */}
          <div>
            <p className="text-xs font-bold text-slate-500 mb-3 tracking-wider">成长时间线</p>
            <div className="space-y-2">
              {caseData.timeline.map((t, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-400 w-16 shrink-0">{t.time}</span>
                  <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  <span className="text-sm text-slate-700">{t.event}</span>
                </div>
              ))}
            </div>
          </div>
          {/* 成果 */}
          <div>
            <p className="text-xs font-bold text-emerald-600 mb-2 tracking-wider">量化成果</p>
            <div className="flex flex-wrap gap-2">
              {caseData.results.map((r, i) => (
                <span key={i} className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg text-sm font-medium">✓ {r}</span>
              ))}
            </div>
          </div>
          {/* 行动 */}
          <Link to={caseData.ctaTo} onClick={onClose}
            className="block w-full bg-orange-500 hover:bg-orange-600 text-white text-center py-3.5 rounded-xl font-bold text-sm transition">
            {caseData.ctaLabel}
          </Link>
        </div>
      </div>
    </div>
  )
}

// ─── C端板块 ─────────────────────────────────────────────

function CSection({ onLead }) {
  const [sub, setSub] = useState('award')
  const [detailCase, setDetailCase] = useState(null)

  return (
    <div>
      {detailCase && <CaseDetailModal caseData={detailCase} onClose={() => setDetailCase(null)} />}

      {/* 子导航 */}
      <div className="flex gap-2 flex-wrap mb-8">
        {[
          { key: 'award', label: '🏅 赛事获奖成果' },
          { key: 'admission', label: '🎓 升学赋能成果' },
          { key: 'ability', label: '🎨 能力成长成果' },
        ].map(item => (
          <button key={item.key} onClick={() => setSub(item.key)}
            className={'px-4 py-2 rounded-full text-sm font-medium transition ' +
              (sub === item.key ? 'bg-primary text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>
            {item.label}
          </button>
        ))}
      </div>

      {/* ── 赛事获奖 ── */}
      {sub === 'award' && (
        <div className="space-y-6">
          {/* 痛点+方案 */}
          <div className="card p-5 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200/60">
            <p className="text-xs text-orange-600 font-bold mb-1">痛点</p>
            <p className="text-sm text-slate-700 mb-3">AI赛事种类多，白名单/国际赛怎么冲？孩子学AI，如何拿到官方认可的竞赛奖项？</p>
            <p className="text-xs text-primary font-bold mb-1">解决方案</p>
            <p className="text-sm text-slate-700">缤果竞赛培优课 + 白名单赛事通关营，从集训到报名到备赛一站式辅导，专属教练全程带队</p>
          </div>

          {/* 赛事资质背书 */}
          <div className="card p-5 bg-slate-50">
            <p className="text-xs font-bold text-slate-500 mb-3 tracking-wider">赛事资质背书</p>
            <div className="flex flex-wrap gap-3">
              {['全国青少年AI挑战赛 · 官方合作', 'CAAI全国AI竞赛 · 授权指导', '国际青少年AI创新赛 · 参赛资质', '白名单赛事 · 目录认证机构'].map((item, i) => (
                <div key={i} className="flex items-center gap-2 bg-white border border-amber-200/60 rounded-xl px-3 py-2">
                  <span className="text-amber-500 text-sm">🏅</span>
                  <span className="text-xs text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 真实获奖案例 */}
          <div>
            <p className="text-xs font-bold text-slate-500 mb-3 tracking-wider">真实获奖案例（点击查看详情）</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {AWARD_CASES.map((c, i) => (
                <div key={i}
                  className="card p-5 hover:shadow-md hover:border-amber-300/40 transition cursor-pointer"
                  onClick={() => setDetailCase(DETAIL_CASES.award[0])}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-[11px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full mr-2">{c.tag}</span>
                      <span className="text-[11px] text-slate-400">{c.city}</span>
                    </div>
                    <span className="text-[11px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg font-medium">{c.award}</span>
                  </div>
                  <p className="font-bold text-bingo-dark text-sm">{c.name} · {c.grade}</p>
                  <p className="text-xs text-slate-500 mt-1">{c.event}</p>
                  <p className="text-xs text-primary mt-2">{c.path}</p>
                  <p className="text-xs text-slate-400 mt-2 hover:text-primary">查看完整案例 →</p>
                </div>
              ))}
            </div>
          </div>

          {/* 行动入口 */}
          <div className="flex flex-wrap gap-3">
            <Link to="/events" className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition">赛事报名通道</Link>
            <button onClick={() => onLead('备赛集训营预约')} className="border border-primary text-primary hover:bg-primary/5 px-5 py-2.5 rounded-xl text-sm font-medium transition">备赛集训营预约</button>
            <button onClick={() => onLead('免费竞赛规划咨询')} className="border border-slate-200 text-slate-600 hover:bg-slate-50 px-5 py-2.5 rounded-xl text-sm transition">免费竞赛规划咨询</button>
          </div>
        </div>
      )}

      {/* ── 升学赋能 ── */}
      {sub === 'admission' && (
        <div className="space-y-6">
          <div className="card p-5 bg-gradient-to-r from-sky-50 to-indigo-50 border-sky-200/60">
            <p className="text-xs text-sky-600 font-bold mb-1">痛点</p>
            <p className="text-sm text-slate-700 mb-3">学AI只是兴趣？如何转化为科技特长生资质？AI学习成果怎么被名校认可？</p>
            <p className="text-xs text-primary font-bold mb-1">解决方案</p>
            <p className="text-sm text-slate-700">缤果升学赋能课 + 科技特长生路径课，定制化升学规划，从素养提升到成果认证一站式对接</p>
          </div>

          {/* 升学流程图 */}
          <div>
            <p className="text-xs font-bold text-slate-500 mb-3 tracking-wider">升学成果对接流程</p>
            <div className="flex flex-wrap items-center gap-2">
              {ADMISSION_FLOW.map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">{f.step}</div>
                    <p className="text-xs font-medium text-bingo-dark mt-1 text-center">{f.title}</p>
                    <p className="text-[10px] text-slate-400 text-center">{f.desc}</p>
                  </div>
                  {i < ADMISSION_FLOW.length - 1 && <span className="text-slate-300 text-lg mb-4">→</span>}
                </div>
              ))}
            </div>
          </div>

          {/* 录取案例 */}
          <div>
            <p className="text-xs font-bold text-slate-500 mb-3 tracking-wider">科技特长生录取成果</p>
            <div className="space-y-3">
              {ADMISSION_CASES.map((c, i) => (
                <div key={i}
                  className="card p-5 hover:shadow-md hover:border-sky-300/40 transition cursor-pointer"
                  onClick={() => setDetailCase(DETAIL_CASES.admission[0])}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-bingo-dark text-sm">{c.name} · {c.city}</p>
                      <p className="text-xs text-slate-500 mt-1">{c.from} → <span className="text-sky-600 font-medium">{c.to}</span></p>
                      <p className="text-xs text-slate-400 mt-1">规划周期：{c.period}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] bg-sky-100 text-sky-700 px-2 py-1 rounded-lg block">{c.cert}</span>
                    </div>
                  </div>
                  <p className="text-xs text-primary mt-2">查看升学详情 →</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={() => onLead('科技特长生规划测评')} className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition">科技特长生规划测评</button>
            <Link to="/courses?type=exam" className="border border-primary text-primary hover:bg-primary/5 px-5 py-2.5 rounded-xl text-sm font-medium transition">升学赋能课试听</Link>
            <button onClick={() => onLead('成果认证咨询')} className="border border-slate-200 text-slate-600 hover:bg-slate-50 px-5 py-2.5 rounded-xl text-sm transition">成果认证咨询</button>
          </div>
        </div>
      )}

      {/* ── 能力成长 ── */}
      {sub === 'ability' && (
        <div className="space-y-6">
          <div className="card p-5 bg-gradient-to-r from-violet-50 to-purple-50 border-violet-200/60">
            <p className="text-xs text-violet-600 font-bold mb-1">痛点</p>
            <p className="text-sm text-slate-700 mb-3">担心孩子沦为AI工具使用者，而非创造者？学AI如何提升逻辑思维、创新能力、元认知？</p>
            <p className="text-xs text-primary font-bold mb-1">解决方案</p>
            <p className="text-sm text-slate-700">缤果AI素养课从工具使用到思维培养，让孩子学会「驾驭AI而非被AI替代」</p>
          </div>

          {/* 能力提升数据 */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: '思维能力提升', value: '+65%' },
              { label: '创新能力提升', value: '+58%' },
              { label: '工具应用能力', value: '+82%' },
            ].map((d, i) => (
              <div key={i} className="card p-5 text-center hover:shadow-md transition">
                <p className="text-2xl font-bold text-violet-600">{d.value}</p>
                <p className="text-xs text-slate-500 mt-1">{d.label}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">学员测评前后对比</p>
              </div>
            ))}
          </div>

          {/* AI作品孵化展 */}
          <div>
            <p className="text-xs font-bold text-slate-500 mb-3 tracking-wider">AI作品孵化展（学员原创）</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {WORKS.map((w, i) => (
                <div key={i} className="card p-4 hover:shadow-md hover:border-violet-300/40 transition">
                  <span className="text-[11px] bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">{w.tag}</span>
                  <p className="font-bold text-bingo-dark text-sm mt-2 leading-snug">{w.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{w.author} · {w.age}</p>
                  <p className="text-xs text-slate-400 mt-1">工具：{w.tool}</p>
                  <p className="text-xs text-primary mt-2">{w.ability}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 素养培养金字塔 */}
          <div>
            <p className="text-xs font-bold text-slate-500 mb-3 tracking-wider">缤果AI素养培养金字塔</p>
            <div className="space-y-1.5 max-w-sm">
              {ABILITY_PYRAMID.map((p, i) => (
                <div key={i} className={'rounded-xl px-5 py-3 flex items-center justify-between ' + p.color}
                  style={{ marginLeft: i * 12, marginRight: i * 12 }}>
                  <span className="font-bold text-sm">{p.level}</span>
                  <span className="text-xs opacity-80">{p.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 家长证言 */}
          <div>
            <p className="text-xs font-bold text-slate-500 mb-3 tracking-wider">家长真实证言</p>
            <div className="grid md:grid-cols-3 gap-4">
              {PARENT_REVIEWS.map((r, i) => (
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
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/events/ai-test" className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition">AI素养免费测评</Link>
            <button onClick={() => onLead('素养启蒙课试听申请')} className="border border-primary text-primary hover:bg-primary/5 px-5 py-2.5 rounded-xl text-sm font-medium transition">素养启蒙课1元试听</button>
            <button onClick={() => onLead('AI作品孵化营报名')} className="border border-slate-200 text-slate-600 hover:bg-slate-50 px-5 py-2.5 rounded-xl text-sm transition">AI作品孵化营报名</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── B端板块 ─────────────────────────────────────────────

function BSection({ onLead }) {
  const [sub, setSub] = useState('school')

  return (
    <div>
      {/* 子导航 */}
      <div className="flex gap-2 flex-wrap mb-8">
        {[
          { key: 'school', label: '🏫 学校合作成果' },
          { key: 'franchise', label: '🤝 机构加盟成果' },
          { key: 'oem', label: '⚙️ OEM定制成果' },
        ].map(item => (
          <button key={item.key} onClick={() => setSub(item.key)}
            className={'px-4 py-2 rounded-full text-sm font-medium transition ' +
              (sub === item.key ? 'bg-sky-600 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>
            {item.label}
          </button>
        ))}
      </div>

      {/* ── 学校合作 ── */}
      {sub === 'school' && (
        <div className="space-y-6">
          <div className="card p-5 bg-gradient-to-r from-sky-50 to-indigo-50 border-sky-200/60">
            <p className="text-xs text-sky-600 font-bold mb-1">痛点</p>
            <p className="text-sm text-slate-700 mb-3">学校开设人工智能相关课程时，常面临缺体系、缺师资、缺赛事资源，如何快速落地高质量AI教育？</p>
            <p className="text-xs font-bold text-slate-700 mb-1">解决方案</p>
            <p className="text-sm text-slate-700">缤果AI课程体系入校 + 师训赋能 + 赛事落地一站式服务，打造学校AI教育特色标杆</p>
          </div>

          {/* 合作校背书 */}
          <div className="card p-5 bg-slate-50">
            <p className="text-xs font-bold text-slate-500 mb-3 tracking-wider">合作校背书 · 授牌认证</p>
            <div className="flex flex-wrap gap-3">
              {['教育部门授权合作机构', '区级AI教育示范基地', '市级课程改革试点学校', '白名单赛事入校合作单位'].map((item, i) => (
                <div key={i} className="flex items-center gap-2 bg-white border border-sky-200/60 rounded-xl px-3 py-2">
                  <span className="text-sky-500 text-sm">✓</span>
                  <span className="text-xs text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 学校案例 */}
          <div className="space-y-4">
            {SCHOOL_CASES.map((c, i) => (
              <div key={i} className="card p-5 hover:shadow-md hover:border-sky-300/40 transition">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[11px] bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full mr-2">{c.type}</span>
                    <span className="text-[11px] text-slate-400">{c.region}</span>
                    <p className="font-bold text-bingo-dark text-sm mt-1">{c.name}</p>
                  </div>
                  <div className="flex gap-3 text-center text-xs">
                    <div><p className="font-bold text-sky-600">{c.students}+</p><p className="text-slate-400">参与学生</p></div>
                    <div><p className="font-bold text-sky-600">{c.teachers}人</p><p className="text-slate-400">师训结业</p></div>
                    <div><p className="font-bold text-sky-600">{c.events}场</p><p className="text-slate-400">赛事举办</p></div>
                  </div>
                </div>
                <p className="text-sm text-slate-600 bg-sky-50 rounded-xl p-3">{c.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={() => onLead('学校AI课程落地方案索取')} className="bg-sky-600 hover:bg-sky-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition">免费索取落地方案</button>
            <button onClick={() => onLead('师训服务预约')} className="border border-sky-400 text-sky-600 hover:bg-sky-50 px-5 py-2.5 rounded-xl text-sm font-medium transition">师训服务预约</button>
            <button onClick={() => onLead('标杆校实地考察申请')} className="border border-slate-200 text-slate-600 hover:bg-slate-50 px-5 py-2.5 rounded-xl text-sm transition">标杆校实地考察</button>
          </div>
        </div>
      )}

      {/* ── 机构加盟 ── */}
      {sub === 'franchise' && (
        <div className="space-y-6">
          <div className="card p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200/60">
            <p className="text-xs text-emerald-600 font-bold mb-1">痛点</p>
            <p className="text-sm text-slate-700 mb-3">教培机构转型AI教育，无成熟课程体系，无品牌背书，无运营方法，如何快速盈利？</p>
            <p className="text-xs font-bold text-slate-700 mb-1">解决方案</p>
            <p className="text-sm text-slate-700">缤果线下加盟商全赋能：品牌授权+课程体系+师训+赛事资源+运营支持一站式合作</p>
          </div>

          {/* 盈利数据 */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: '平均回本周期', value: '4个月' },
              { label: '月均招生量', value: '150+人' },
              { label: '课程续费率', value: '85%+' },
            ].map((d, i) => (
              <div key={i} className="card p-5 text-center hover:shadow-md transition">
                <p className="text-2xl font-bold text-emerald-600">{d.value}</p>
                <p className="text-xs text-slate-500 mt-1">{d.label}</p>
              </div>
            ))}
          </div>

          {/* 赋能流程 */}
          <div>
            <p className="text-xs font-bold text-slate-500 mb-3 tracking-wider">缤果加盟商全赋能流程</p>
            <div className="flex flex-wrap gap-2">
              {FRANCHISE_FLOW.map((f, i) => (
                <div key={i} className="flex items-center gap-1">
                  <span className="bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-full font-medium">{f}</span>
                  {i < FRANCHISE_FLOW.length - 1 && <span className="text-slate-300 text-base">→</span>}
                </div>
              ))}
            </div>
          </div>

          {/* 加盟案例 */}
          <div className="space-y-4">
            {FRANCHISE_CASES.map((c, i) => (
              <div key={i} className="card p-5 hover:shadow-md hover:border-emerald-300/40 transition">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                  <div>
                    <p className="font-bold text-bingo-dark text-sm">{c.name} · {c.region}</p>
                    <p className="text-xs text-slate-400 mt-0.5">加盟{c.months}个月</p>
                  </div>
                  <div className="flex gap-3 text-center text-xs">
                    <div><p className="font-bold text-emerald-600">{c.students}+人</p><p className="text-slate-400">招生量</p></div>
                    <div><p className="font-bold text-emerald-600">{c.events}场</p><p className="text-slate-400">赛事举办</p></div>
                  </div>
                </div>
                <p className="text-xs bg-emerald-50 text-emerald-700 rounded-lg px-3 py-2 mb-2 font-medium">{c.revenue}</p>
                <p className="text-sm text-slate-600 italic">"{c.review}"</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={() => onLead('加盟合作咨询')} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition">加盟合作咨询</button>
            <button onClick={() => onLead('加盟费测算')} className="border border-emerald-400 text-emerald-600 hover:bg-emerald-50 px-5 py-2.5 rounded-xl text-sm font-medium transition">加盟费测算</button>
            <button onClick={() => onLead('区域加盟名额查询')} className="border border-slate-200 text-slate-600 hover:bg-slate-50 px-5 py-2.5 rounded-xl text-sm transition">区域名额查询</button>
          </div>
        </div>
      )}

      {/* ── OEM定制 ── */}
      {sub === 'oem' && (
        <div className="space-y-6">
          <div className="card p-5 bg-gradient-to-r from-violet-50 to-indigo-50 border-violet-200/60">
            <p className="text-xs text-violet-600 font-bold mb-1">痛点</p>
            <p className="text-sm text-slate-700 mb-3">想打造自有品牌AI课程/教具/工具，缺研发团队、缺技术支持、缺内容资源？</p>
            <p className="text-xs font-bold text-slate-700 mb-1">解决方案</p>
            <p className="text-sm text-slate-700">缤果OEM定制服务：课程/教具/工具定制 + 品牌联名 + 技术输出，共建专属AI教育产品</p>
          </div>

          {/* 定制能力背书 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { icon: '👨‍💻', title: '专业教研团队', desc: '50+教研/技术人员' },
              { icon: '📚', title: '课程著作权', desc: '200+课程版权认证' },
              { icon: '🔧', title: '教具专利', desc: '30+教具外观/实用专利' },
              { icon: '⚡', title: '交付周期', desc: '标准30天，定制60天' },
              { icon: '🔄', title: '迭代支持', desc: '1年免费迭代维护' },
              { icon: '🤝', title: '品牌联名', desc: '多品牌联名落地经验' },
            ].map((item, i) => (
              <div key={i} className="card p-4 hover:shadow-md transition">
                <span className="text-2xl">{item.icon}</span>
                <p className="font-semibold text-sm text-bingo-dark mt-2">{item.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* OEM案例 */}
          <div className="space-y-3">
            {OEM_CASES.map((c, i) => (
              <div key={i} className="card p-5 hover:shadow-md hover:border-violet-300/40 transition flex items-start gap-4">
                <span className="text-[11px] bg-violet-100 text-violet-700 px-2 py-1 rounded-lg shrink-0">{c.type}</span>
                <div>
                  <p className="font-bold text-bingo-dark text-sm">{c.brand}</p>
                  <p className="text-xs text-slate-600 mt-1">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 定制流程 */}
          <div>
            <p className="text-xs font-bold text-slate-500 mb-3 tracking-wider">定制服务流程</p>
            <div className="flex flex-wrap items-center gap-2">
              {['需求沟通', '方案设计', '研发落地', '测试交付', '售后支持'].map((s, i, arr) => (
                <div key={i} className="flex items-center gap-1">
                  <div className="bg-violet-500 text-white text-xs px-3 py-1.5 rounded-full font-medium">{s}</div>
                  {i < arr.length - 1 && <span className="text-slate-300 text-base">→</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={() => onLead('OEM定制需求提交')} className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition">OEM定制需求提交</button>
            <button onClick={() => onLead('定制方案免费设计')} className="border border-violet-400 text-violet-600 hover:bg-violet-50 px-5 py-2.5 rounded-xl text-sm font-medium transition">定制方案免费设计</button>
            <button onClick={() => onLead('研发团队一对一沟通')} className="border border-slate-200 text-slate-600 hover:bg-slate-50 px-5 py-2.5 rounded-xl text-sm transition">研发团队一对一沟通</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── 主组件 ───────────────────────────────────────────────

export default function Showcase() {
  const [tab, setTab] = useState('c')
  const [leadModal, setLeadModal] = useState(null)

  return (
    <div>
      {leadModal && <LeadModal title={leadModal} onClose={() => setLeadModal(null)} />}

      {/* ══ 一级：首屏核心区 ══ */}
      <section className="bg-gradient-to-br from-bingo-dark via-slate-800 to-primary/80 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <p className="text-xs text-cyan-300 mb-3 tracking-widest font-medium">AI实战成果</p>
          <h1 className="text-2xl sm:text-4xl font-bold mb-2">
            学员AI作品展示｜竞赛获奖荣誉榜｜科创实践案例集
          </h1>
          <p className="text-slate-300 text-sm mb-6">见证从AI入门到实战进阶的成长轨迹 · 千名学员成长见证 | 百所合作机构赋能</p>
          <div className="flex flex-wrap gap-3 mt-4">
            <Link to="/showcase/works" className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition">查看全部成果</Link>
          </div>

          {/* 数据看板 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {STATS.map((s, i) => (
              <StatBadge key={i} {...s} />
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* 痛点锚定提示 */}
        <div className="card p-4 bg-orange-50 border-orange-200/60 mb-8 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-orange-700 font-medium">
            <span className="text-orange-500">担心学AI没结果？竞赛没奖项？升学无助力？</span>
            <span className="text-slate-600 font-normal ml-2">看缤果学员真实成长答案</span>
          </p>
          <div className="flex gap-2">
            <Link to="/events/ai-test" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition">测AI素养</Link>
            <button onClick={() => setLeadModal('索取合作方案')} className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition">索合作方案</button>
          </div>
        </div>

        {/* ══ 二级：B/C切换 ══ */}
        <div className="flex gap-3 mb-8">
          <button onClick={() => setTab('c')}
            className={'px-6 py-2.5 rounded-full text-sm font-bold transition ' +
              (tab === 'c' ? 'bg-primary text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>
            C端 · 学员成长成果
          </button>
          <button onClick={() => setTab('b')}
            className={'px-6 py-2.5 rounded-full text-sm font-bold transition ' +
              (tab === 'b' ? 'bg-sky-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>
            B端 · 校/机构合作成果
          </button>
        </div>

        {tab === 'c' && <CSection onLead={setLeadModal} />}
        {tab === 'b' && <BSection onLead={setLeadModal} />}

        {/* ══ 学分成果展示（C端保留） ══ */}
        {tab === 'c' && (
          <section className="mt-12 pt-10 border-t">
            <h2 className="text-xl font-bold text-bingo-dark mb-1">🏅 学分成果展示</h2>
            <p className="text-slate-500 text-sm mb-5">学员累计缤果学分、等级与成就，与课程/赛事/研学成果并列展示</p>
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              {[
                { name: '张小明', level: '学分之星 ⭐⭐⭐⭐', total: 3420, badge: '本月学分榜 No.1' },
                { name: '李思涵', level: '学分达人 ⭐⭐⭐', total: 2180, badge: '课程完课率 100%' },
                { name: '王梓轩', level: '进阶学员 ⭐⭐', total: 1560, badge: '赛事获奖荣誉分' },
              ].map((s, i) => (
                <div key={i} className="card p-5 flex items-center gap-4 hover:shadow-md hover:border-primary/30 transition">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-lg shrink-0">{s.name.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-bingo-dark text-sm">{s.name}</p>
                    <p className="text-xs text-slate-500">{s.level}</p>
                    <p className="text-primary font-bold mt-1">{s.total.toLocaleString()} 分</p>
                  </div>
                  <span className="text-[10px] px-2 py-1 rounded bg-amber-100 text-amber-700 shrink-0 text-center leading-tight">{s.badge}</span>
                </div>
              ))}
            </div>
            <div className="card p-5 bg-cyan-50 border-primary/20 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-medium text-bingo-dark">学分等级达「学分之星」可获专属展示位</p>
                <p className="text-sm text-slate-600 mt-0.5">分享学分成果至朋友圈，分享成功额外 +5分</p>
              </div>
              <Link to="/profile#score-bank" className="bg-primary hover:bg-cyan-600 text-white px-4 py-2 rounded-xl text-sm font-bold transition">查看我的学分</Link>
            </div>
          </section>
        )}

        {/* ══ 荣誉与公益（两端共用） ══ */}
        <section id="honor" className="mt-12 pt-10 border-t">
          <h2 className="text-xl font-bold text-bingo-dark mb-1">品牌背书 · 荣誉与公益</h2>
          <p className="text-slate-500 text-sm mb-6">缤果AI学院荣誉展示、行业动态与公益项目，强化品牌公信力</p>
          <div className="card overflow-hidden mb-6">
            <ul className="divide-y divide-slate-100">
              {[
                { type: '荣誉', text: '缤果AI学院获「年度AI教育创新机构」称号', date: '2025-01' },
                { type: '热点', text: '教育部发文推进中小学AI教育，素养与伦理并重', date: '2025-02' },
                { type: '荣誉', text: '缤果学员在全国青少年AI挑战赛中获一等奖', date: '2025-01' },
                { type: '行业', text: '青少年AI赛事白名单扩容，科创素养成升学加分项', date: '2025-02' },
                { type: '热点', text: '多省市将AI素养纳入综合素质评价', date: '2025-01' },
                { type: '行业', text: '产教融合政策加码，企业与院校合作AI实训', date: '2024-12' },
              ].map((r, i) => (
                <li key={i} className="px-4 py-3 flex flex-wrap items-center gap-2 hover:bg-slate-50 transition">
                  <span className={'text-xs px-2 py-0.5 rounded ' +
                    (r.type === '荣誉' ? 'bg-amber-100 text-amber-800' : r.type === '热点' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-600')}>
                    {r.type}
                  </span>
                  <span className="text-slate-700 text-sm flex-1">{r.text}</span>
                  <span className="text-slate-400 text-xs">{r.date}</span>
                </li>
              ))}
            </ul>
          </div>
          <h3 className="text-base font-semibold text-bingo-dark mb-3">公益项目</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: '公益助学活动', desc: '捐赠教材/教具、免费公益课，面向青少年/弱势群体' },
              { title: '公益赛事', desc: '公益主题AI赛事，提升品牌影响力' },
              { title: '公益打卡', desc: '用户参与打卡，平台捐赠公益基金' },
              { title: '公益成果展示', desc: '强化品牌公信力，带动潜在C端消费' },
            ].map((item, i) => (
              <div key={i} className="card p-6 hover:shadow-md hover:border-primary/30 transition">
                <h3 className="font-semibold text-primary">{item.title}</h3>
                <p className="text-sm text-slate-600 mt-1">{item.desc}</p>
                <button type="button" className="text-sm text-primary mt-3 hover:underline">参与报名 →</button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
