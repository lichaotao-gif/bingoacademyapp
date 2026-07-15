import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

const EVENTS = [
  { id: 'ai-innovation', name: '全国青少年人工智能创新大赛', subtitle: '人工智能创新 · 科技实践', status: 'open', cover: '/events/ai-creative-competition.jpg', deadline: '2026 年 8 月 15 日', audience: '全国中小学生', organizer: '中国人工智能学会', count: '8,924', description: '面向青少年开展人工智能创新实践，设置智能应用、创意编程、数据分析等方向，鼓励参赛者以真实项目呈现 AI 学习成果。' },
  { id: 'noc', name: '全国中小学信息技术创新与实践大赛', subtitle: '信息技术 · 创新实践', status: 'open', cover: '/events/sci-fi-competition.png', deadline: '2026 年 9 月 30 日', audience: '小学至高中', organizer: 'NOC 组委会', count: '6,312', description: '围绕信息技术创新与实践能力展开，提供多元任务赛道，支持学生在编程、数字创作与智能应用中完成作品挑战。' },
  { id: 'robot', name: '世界机器人大赛', subtitle: '智能工程 · 机器人挑战', status: 'soon', cover: '/events/art-competition.png', deadline: '2026 年 8 月 1 日开启', audience: '小学至大学', organizer: '中国电子学会', count: '即将开启', description: '以机器人设计、搭建、编程与现场任务为核心，考察工程思维、协作能力和在限定场景中的解决问题能力。' },
  { id: 'creative', name: '全国青少年 AI 创意设计大赛', subtitle: 'AIGC 创作 · 数字表达', status: 'soon', cover: '/events/ai-creative-competition.jpg', deadline: '2026 年 8 月 20 日开启', audience: '全国中小学生', organizer: '赛事组委会', count: '即将开启', description: '结合人工智能工具与创意思维，引导学生完成图文、短片、交互作品等数字表达项目，探索 AI 辅助创作的新方式。' },
  { id: 'coding', name: '全国中小学信息技术创作大赛', subtitle: '编程创作 · 数字创新', status: 'ended', cover: '/events/sci-fi-competition.png', deadline: '本届已结束', audience: '小学至高中', organizer: '赛事组委会', count: '12,486', description: '以程序设计、创意编程和数字化表达为基础，记录青少年用技术回应生活问题的创新过程与实践成果。' },
  { id: 'science', name: '青少年科创与智能应用挑战赛', subtitle: '科学探究 · 智能应用', status: 'ended', cover: '/events/art-competition.png', deadline: '本届已结束', audience: '初中至高中', organizer: '赛事组委会', count: '5,680', description: '以项目研究与科学探究为主线，鼓励参赛者结合传感、数据和人工智能，开展跨学科创意实践。' },
]

const STATUS = { all: '全部赛事', open: '报名中', soon: '未开始报名', ended: '报名已结束' }
const STATUS_ACTION = {
  open: '立即报名',
  soon: '关注报名通知',
  ended: '查看赛事说明',
}

function StatusBadge({ status }) {
  const labels = { open: '报名中', soon: '未开始报名', ended: '报名已结束' }
  const styles = { open: 'bg-emerald-500 text-white', soon: 'bg-amber-400 text-slate-900', ended: 'bg-slate-600 text-white' }
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}>{labels[status]}</span>
}

export default function EventWhitelist() {
  const { eventId } = useParams()
  const [active, setActive] = useState('all')
  const visibleEvents = useMemo(() => active === 'all' ? EVENTS : EVENTS.filter((event) => event.status === active), [active])

  if (eventId) {
    const event = EVENTS.find((item) => item.id === eventId)
    return event ? <EventDetail event={event} /> : <EventNotFound />
  }

  return (
    <main className="bg-slate-50 pb-16">
      <section className="relative overflow-hidden bg-[#075b57] text-white">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.055)_1px,transparent_1px),radial-gradient(circle_at_10%_15%,rgba(52,211,153,.45),transparent_26%),radial-gradient(circle_at_88%_15%,rgba(6,182,212,.4),transparent_25%)] bg-[size:44px_44px,44px_44px,auto,auto]" />
        <div className="pointer-events-none absolute left-[8%] top-12 h-72 w-72 rounded-full border border-emerald-200/25" />
        <div className="pointer-events-none absolute bottom-[-120px] right-[12%] h-80 w-80 rounded-full border border-cyan-200/20" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="text-xs font-bold tracking-[0.18em] text-emerald-100">COMPETITION ACTIVITIES</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">AI 赛事活动</h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-white/80">面向青少年开放的 AI 实践与竞赛活动，覆盖人工智能、信息技术、机器人与创意设计等方向。查看赛事动态，选择适合自己的成长赛道。</p>
          <div className="mt-8 grid max-w-2xl grid-cols-2 gap-5 border-t border-white/20 pt-6 sm:grid-cols-4">
            {[['6', '年度赛事'], ['全国', '覆盖地区'], ['AI', '核心方向'], ['全年', '赛事动态']].map(([number, label]) => <div key={label}><p className="text-2xl font-bold text-emerald-200">{number}</p><p className="mt-1 text-xs text-white/65">{label}</p></div>)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6" aria-labelledby="event-list-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><p className="text-sm font-medium text-primary">COMPETITION LIST</p><h2 id="event-list-heading" className="mt-1 text-2xl font-bold text-bingo-dark">活动列表</h2></div>
          <p className="text-sm text-slate-500">赛事信息与报名状态整理</p>
        </div>
        <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="赛事状态筛选">
          {Object.entries(STATUS).map(([key, label]) => <button key={key} type="button" role="tab" aria-selected={active === key} onClick={() => setActive(key)} className={`min-h-11 rounded-full px-5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${active === key ? 'bg-[#075b57] text-white shadow-sm' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100'}`}>{label}</button>)}
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visibleEvents.map((event) => (
            <article key={event.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
              <div className="relative aspect-[21/8] overflow-hidden bg-[#075b57]"><img src={event.cover} alt={`${event.name}赛事封面`} className="h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/5 to-transparent" /><div className="absolute left-4 top-4"><StatusBadge status={event.status} /></div><p className="absolute bottom-4 left-4 text-xs font-semibold tracking-[0.14em] text-white/90">{event.subtitle}</p></div>
              <div className="p-5"><h3 className="min-h-14 text-lg font-bold leading-7 text-bingo-dark">{event.name}</h3><p className="mt-3 line-clamp-3 min-h-[60px] text-sm leading-5 text-slate-500">{event.description}</p><dl className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500"><div className="flex justify-between gap-4"><dt>报名动态</dt><dd className="text-right font-medium text-slate-700">{event.deadline}</dd></div><div className="flex justify-between gap-4"><dt>参赛对象</dt><dd className="text-right font-medium text-slate-700">{event.audience}</dd></div><div className="flex justify-between gap-4"><dt>主办单位</dt><dd className="text-right font-medium text-slate-700">{event.organizer}</dd></div></dl><div className="mt-5 flex items-center justify-between"><span className="text-xs text-slate-400"><strong className="font-semibold text-slate-600">{event.count}</strong> {event.status === 'ended' ? '累计参与' : '已报名 / 关注'}</span><Link to={`/events/${event.id}`} className={`inline-flex min-h-11 items-center rounded-xl px-4 text-sm font-semibold text-white transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${event.status === 'open' ? 'bg-[#075b57] hover:bg-[#064440]' : event.status === 'soon' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-slate-600 hover:bg-slate-700'}`}>{STATUS_ACTION[event.status]}</Link></div></div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

function EventDetail({ event }) {
  const isEnded = event.status === 'ended'
  const [actioned, setActioned] = useState(false)
  const [showApplication, setShowApplication] = useState(false)
  const [application, setApplication] = useState({ name: '', phone: '', school: '', category: '', workName: '' })
  const [workFiles, setWorkFiles] = useState([])
  const gallery = [event.cover, '/events/sci-fi-competition.png', '/events/art-competition.png']
  const schedule = isEnded
    ? [
        ['赛事发布', '赛事通知与参赛指南已发布'],
        ['线上报名', '完成报名信息提交与资格审核'],
        ['作品提交', '按赛事要求完成作品提交'],
        ['赛事已结束', '本届赛事已结束，敬请关注后续动态'],
      ]
    : [
        ['报名与作品准备', `${event.deadline} 前完成报名，并根据赛项要求准备作品`],
        ['线上初评', '组委会进行资格审核与线上作品评审'],
        ['决赛与答辩', '入围选手按通知参与展示、答辩或现场挑战'],
        ['成果公布', '公布获奖结果，发放赛事证书与成果荣誉'],
      ]
  const attachments = ['赛事通知与参赛指南.pdf', '参赛报名信息表.pdf', '作品提交与评审说明.pdf']

  return (
    <main className="min-h-screen bg-slate-50 pb-16">
      <section className="relative overflow-hidden bg-[#075b57] text-white">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.055)_1px,transparent_1px),radial-gradient(circle_at_10%_15%,rgba(52,211,153,.45),transparent_26%),radial-gradient(circle_at_88%_15%,rgba(6,182,212,.4),transparent_25%)] bg-[size:44px_44px,44px_44px,auto,auto]" />
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
          <nav className="flex flex-wrap items-center gap-2 text-sm text-white/70"><Link to="/events" className="transition hover:text-white">赛事活动</Link><span>/</span><span className="text-white">赛事详情</span></nav>
          <div className="mt-6 flex flex-wrap items-center gap-2"><StatusBadge status={event.status} /><span className="rounded-md bg-white/15 px-2.5 py-1 text-xs font-semibold text-white">{event.subtitle}</span></div>
          <h1 className="mt-4 max-w-4xl text-3xl font-bold leading-tight sm:text-5xl">{event.name}</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-white/80">{event.description}</p>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/80"><span>报名动态：{event.deadline}</span><span>{event.count} {isEnded ? '累计参与' : '人已关注'}</span></div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <div className="space-y-6">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold text-bingo-dark">赛事简介</h2>
            <div className="mt-4 space-y-3 text-[15px] leading-8 text-slate-600"><p>{event.description}</p><p>赛事以真实问题为驱动，鼓励学生在创意设计、项目实践和成果表达中展示学习收获；具体赛项、组别及提交要求以官方通知为准。</p></div>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">{gallery.map((image, index) => <figure key={image} className="overflow-hidden rounded-xl border border-slate-200"><img src={image} alt={`${event.name}活动现场 ${index + 1}`} className="aspect-[4/3] w-full object-cover" /><figcaption className="px-3 py-2 text-xs text-slate-500">{['往届赛事现场', '学生作品展示', '展示与答辩环节'][index]}</figcaption></figure>)}</div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold text-bingo-dark">赛程安排</h2>
            <ol className="mt-6 space-y-6 border-l-2 border-emerald-100 pl-6">{schedule.map(([title, detail]) => <li key={title} className="relative"><span className="absolute -left-[33px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#075b57] ring-4 ring-emerald-50" /><p className="text-sm font-bold text-bingo-dark">{title}</p><p className="mt-1 text-sm leading-6 text-slate-500">{detail}</p></li>)}</ol>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold text-bingo-dark">参赛附件</h2>
            <div className="mt-4 space-y-3">{attachments.map((name) => <button key={name} type="button" className="flex min-h-16 w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-left transition hover:border-emerald-300 hover:bg-emerald-50"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-rose-50 text-sm font-bold text-rose-600">PDF</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-bingo-dark">{name}</span><span className="mt-1 block text-xs text-slate-500">赛事官方文件 · 点击查看</span></span><span className="text-lg text-[#075b57]">↓</span></button>)}</div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold text-bingo-dark">奖项设置</h2>
            <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">{['一等奖：各组别优胜作品', '二等奖：各组别优秀作品', '三等奖：各组别入围作品', '优秀指导教师与组织荣誉'].map((award, index) => <div key={award} className="flex items-center gap-3 rounded-xl bg-slate-50 p-4"><span className="text-lg">{['🥇', '🥈', '🥉', '🏅'][index]}</span>{award}</div>)}</div>
          </article>
        </div>

        <aside id="registration" className="h-fit rounded-2xl border border-slate-200 bg-white shadow-lg lg:sticky lg:top-20">
          <div className={`p-6 text-white ${event.status === 'open' ? 'bg-gradient-to-br from-[#075b57] to-[#0b766f]' : event.status === 'soon' ? 'bg-gradient-to-br from-amber-500 to-orange-500' : 'bg-gradient-to-br from-slate-600 to-slate-800'}`}><p className="text-sm text-white/75">报名状态</p><p className="mt-2 text-2xl font-bold">{STATUS[event.status]}</p><p className="mt-2 text-xs text-white/70">报名动态：{event.deadline}</p></div>
          <div className="p-6"><dl className="space-y-4 text-sm"><div className="flex justify-between gap-4"><dt className="text-slate-400">主办单位</dt><dd className="text-right font-medium text-bingo-dark">{event.organizer}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-400">参赛对象</dt><dd className="text-right font-medium text-bingo-dark">{event.audience}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-400">参赛形式</dt><dd className="text-right font-medium text-bingo-dark">个人 / 团队</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-400">报名费用</dt><dd className="text-right font-medium text-emerald-600">以官方通知为准</dd></div></dl>{event.status === 'open' && <button type="button" onClick={() => setShowApplication(true)} className="mt-7 min-h-12 w-full rounded-xl bg-[#075b57] px-5 text-sm font-bold text-white transition hover:bg-[#064440]">{actioned ? '已提交参赛报名' : '立即报名参赛'}</button>}{event.status === 'soon' && <button type="button" onClick={() => setActioned(true)} className="mt-7 min-h-12 w-full rounded-xl bg-amber-500 px-5 text-sm font-bold text-white transition hover:bg-amber-600">{actioned ? '已关注报名通知' : '关注报名通知'}</button>}{isEnded && <p className="mt-7 rounded-xl bg-slate-100 px-4 py-3 text-center text-sm font-semibold text-slate-600">本届报名已结束</p>}<p className="mt-4 text-center text-xs leading-5 text-slate-400">具体报名条件、材料与赛程，请以赛事主办方最终发布的官方通知为准。</p></div>
        </aside>
      </section>

      {showApplication && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setShowApplication(false) }}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 p-6"><div><p className="text-xs font-bold tracking-[.14em] text-primary">EVENT REGISTRATION</p><h2 className="mt-1 text-xl font-bold text-bingo-dark">报名参赛并提交作品</h2><p className="mt-2 text-sm text-slate-500">{event.name}</p></div><button type="button" onClick={() => setShowApplication(false)} className="grid h-9 w-9 place-items-center rounded-lg text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label="关闭报名窗口">×</button></div>
            <form className="space-y-5 p-6" onSubmit={(e) => { e.preventDefault(); setActioned(true); setShowApplication(false) }}>
              <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-medium text-slate-700">参赛者姓名 *<input required value={application.name} onChange={(e) => setApplication({ ...application, name: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" placeholder="请输入姓名" /></label><label className="block text-sm font-medium text-slate-700">联系电话 *<input required type="tel" value={application.phone} onChange={(e) => setApplication({ ...application, phone: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" placeholder="请输入手机号" /></label></div>
              <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-medium text-slate-700">所在学校 *<input required value={application.school} onChange={(e) => setApplication({ ...application, school: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" placeholder="请输入学校名称" /></label><label className="block text-sm font-medium text-slate-700">参赛赛项 *<select required value={application.category} onChange={(e) => setApplication({ ...application, category: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"><option value="">请选择赛项</option><option>AI 创意应用</option><option>创意编程</option><option>智能作品展示</option><option>机器人与工程挑战</option></select></label></div>
              <label className="block text-sm font-medium text-slate-700">作品名称 *<input required value={application.workName} onChange={(e) => setApplication({ ...application, workName: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" placeholder="请输入参赛作品名称" /></label>
              <label className="block rounded-xl border border-dashed border-primary/40 bg-cyan-50/50 p-5 text-center text-sm text-slate-700 transition hover:bg-cyan-50"><span className="block text-2xl">☁️</span><span className="mt-2 block font-semibold text-bingo-dark">上传参赛作品 *</span><span className="mt-1 block text-xs text-slate-500">支持文档、图片、压缩包、视频链接说明等材料</span><input required type="file" multiple className="mt-3 block w-full text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-[#075b57] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-[#064440]" onChange={(e) => setWorkFiles(Array.from(e.target.files || []))} /></label>
              {workFiles.length > 0 && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">已选择 {workFiles.length} 个作品文件：{workFiles.map((file) => file.name).join('、')}</p>}
              <div className="flex gap-3 border-t border-slate-100 pt-5"><button type="button" onClick={() => setShowApplication(false)} className="min-h-12 flex-1 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">取消</button><button type="submit" className="min-h-12 flex-1 rounded-xl bg-[#075b57] text-sm font-bold text-white transition hover:bg-[#064440]">提交报名与作品</button></div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}

function EventNotFound() {
  return <main className="mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center px-4 text-center"><p className="text-sm font-bold tracking-[.14em] text-primary">EVENT NOT FOUND</p><h1 className="mt-3 text-3xl font-bold text-bingo-dark">未找到该赛事</h1><Link to="/events" className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-[#075b57] px-5 text-sm font-semibold text-white">返回赛事活动</Link></main>
}
