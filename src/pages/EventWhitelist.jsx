import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

const EVENTS = [
  { id: 'ai-competition', name: '全国青少年人工智能大赛', subtitle: '自然科学素养类 · 第18项', status: 'open', cover: '/events/ai-creative-competition.jpg', deadline: '距离报名截止 46 天', period: '2026.07.20 – 2026.09.10', audience: '适配 L1-L9', organizer: '中国福利会、中国妇女发展基金会', count: '2025-2028', description: '上海地区唯一国家级 AI 白名单赛事，区分低龄启蒙、初高中科创两大赛道，支持 AIGC 人机协同创作。' },
  { id: 'safe', name: '第一届全国青少年安全与应急科普创新大赛', subtitle: '自然科学素养类 · 第22项', status: 'open', cover: '/events/sci-fi-competition.png', deadline: '距离报名截止 15 天', period: '2026.07.15 – 2026.08.12', audience: '适配 L1-L6', organizer: '中国灾害防御协会', count: '报名中', description: '国家安全教育专项白名单赛事，开设征文、绘画、AI 应急装备三大创作赛道，配套报名、成绩、证书查询系统。' },
  { id: 'story', name: '「讲好中国故事」全国中小学语言素养大赛', subtitle: '人文综合素养类 · 第33项', status: 'soon', cover: '/events/art-competition.png', deadline: '报名将于 8 月 20 日开启', period: '2026.08.20 – 2026.10.08', audience: '适配 L1-L6', organizer: '中国教育电视协会', count: '即将开启', description: '覆盖演讲、短视频、AI 文案创作等方向，鼓励学生以清晰表达与数字创作呈现中国故事。' },
  { id: 'art', name: '全国中小学生绘画书法作品比赛', subtitle: '艺术体育类 · 第35项', status: 'open', cover: '/events/ai-creative-competition.jpg', deadline: '距离报名截止 30 天', period: '2026.07.18 – 2026.08.28', audience: '适配 L1-L6', organizer: '中国儿童中心', count: '报名中', description: '面向中小学生的美育赛事，支持绘画、书法及 AIGC 数字美术等创作方向。' },
  { id: 'ocean', name: '全国中小学生海洋文化创意设计大赛', subtitle: '艺术体育类 · 第42项', status: 'ended', cover: '/events/sci-fi-competition.png', deadline: '本期报名已结束', period: '2026.04.01 – 2026.06.30', audience: '适配 L1-L6', organizer: '中国海洋大学、海洋发展基金会', count: '本期结束', description: '聚焦海洋文化创意，设置 AI 插画、手工模型等创作方向，鼓励学生以作品关注海洋。' },
  { id: 'psych', name: '全国青少年心理成长知识与应用创新大赛', subtitle: '自然科学素养类 · 第21项', status: 'open', cover: '/events/art-competition.png', deadline: '距离报名截止 40 天', period: '2026.07.22 – 2026.09.04', audience: '适配 L1-L6', organizer: '中国心理卫生协会', count: '报名中', description: '围绕心理成长知识与应用创新展开，支持学生尝试 AI 心理干预方案等创意表达。' },
  { id: 'defense', name: '全国青少年国防素养大赛', subtitle: '艺术体育类 · 第43项', status: 'soon', cover: '/events/ai-creative-competition.jpg', deadline: '报名将于 9 月 1 日开启', period: '2026.09.01 – 2026.10.25', audience: '适配 L1-L6', organizer: '南京理工大学', count: '即将开启', description: '聚焦国防素养与科技创意，设置无人机创意设计等实践方向。' },
  { id: 'rope', name: '全国青少年传统体育项目比赛', subtitle: '艺术体育类 · 第40项', status: 'open', cover: '/events/sci-fi-competition.png', deadline: '距离报名截止 85 天', period: '2026.07.10 – 2026.10.20', audience: '适配 L1-L9', organizer: '中国青少年宫协会', count: '报名中', description: '覆盖线上跳绳竞速等传统体育项目，用数字化方式记录青少年运动实践与成长成果。' },
  { id: 'luxun', name: '鲁迅青少年文学大赛', subtitle: '人文综合素养类 · 第31项', status: 'ended', cover: '/events/art-competition.png', deadline: '本期报名已结束', period: '2026.03.01 – 2026.06.15', audience: '适配 L7-L9 高中专属', organizer: '鲁迅文化基金会', count: '本期结束', description: '面向青少年的人文写作赛事，适合高中阶段学生沉淀文学表达与创作成果。' },
  { id: 'digital-art', name: '全国青少年数字艺术创意大赛', subtitle: '艺术体育类 · 第38项', status: 'open', cover: '/events/art-competition.png', deadline: '距离报名截止 52 天', period: '2026.08.01 – 2026.09.28', audience: '适配 L3-L9', organizer: '中国教育发展战略学会', count: '报名中', description: '聚焦数字绘画、动画设计与 AI 创意表达，为学生提供展示数字艺术成果的实践舞台。' },
  { id: 'science-popularization', name: '全国青少年科技科普创新大赛', subtitle: '自然科学素养类 · 第25项', status: 'soon', cover: '/events/sci-fi-competition.png', deadline: '报名将于 8 月 28 日开启', period: '2026.08.28 – 2026.10.30', audience: '适配 L1-L9', organizer: '中国科普作家协会', count: '即将开启', description: '鼓励学生围绕科学知识展开内容创作与创新表达，探索科技与生活的连接。' },
  { id: 'robotics', name: '全国青少年机器人创新挑战赛', subtitle: '自然科学素养类 · 第19项', status: 'open', cover: '/events/ai-creative-competition.jpg', deadline: '距离报名截止 63 天', period: '2026.08.05 – 2026.10.15', audience: '适配 L4-L9', organizer: '中国自动化学会', count: '报名中', description: '围绕机器人设计、智能控制与工程挑战开展，适合积累项目实践与科创成果。' },
]

const STATUS = { all: '全部赛事', open: '报名中', soon: '未开始报名', ended: '报名已结束' }
const STATUS_ACTION = {
  open: '查看详情',
  soon: '关注报名通知',
  ended: '查看赛事说明',
}

const COMPANION_COURSES = [
  { name: '《赛事入门基础班》', meta: '10-14岁 · 16课时 · 白名单赛事入门', price: '¥698', detailId: 'contest-basic', cover: '/events/ai-creative-competition.jpg' },
  { name: '《赛事进阶集训营》', meta: '12-18岁 · 24课时 · 冲刺获奖', price: '¥1298', detailId: 'contest-advanced', cover: '/events/sci-fi-competition.png' },
  { name: '《竞赛答辩突击课》', meta: '12-18岁 · 8课时 · 赛前冲刺', price: '¥498', detailId: 'contest-sprint', cover: '/events/art-competition.png' },
]

const REGION_OPTIONS = {
  上海市: ['上海市'],
  北京市: ['北京市'],
  广东省: ['广州市', '深圳市', '佛山市', '东莞市'],
  浙江省: ['杭州市', '宁波市', '温州市'],
  江苏省: ['南京市', '苏州市', '无锡市'],
  四川省: ['成都市', '绵阳市'],
  湖北省: ['武汉市', '宜昌市'],
  湖南省: ['长沙市', '株洲市'],
}

function StatusBadge({ status }) {
  const labels = { open: '报名中', soon: '未开始报名', ended: '报名已结束' }
  const styles = { open: 'bg-emerald-500 text-white', soon: 'bg-amber-400 text-slate-900', ended: 'bg-slate-600 text-white' }
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}>{labels[status]}</span>
}

export default function EventWhitelist() {
  const { eventId } = useParams()
  const [active, setActive] = useState('all')
  const featuredEvent = EVENTS[0]
  const hotEvents = EVENTS.slice(1, 9)
  const otherEvents = EVENTS.slice(9)
  const visibleOtherEvents = useMemo(() => active === 'all' ? otherEvents : otherEvents.filter((event) => event.status === active), [active])

  if (eventId) {
    const event = EVENTS.find((item) => item.id === eventId)
    return event ? <EventDetail event={event} /> : <EventNotFound />
  }

  return (
    <main className="flex flex-col bg-slate-50 pb-16">
      <section className="order-0 relative overflow-hidden bg-[#075b57] text-white">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.055)_1px,transparent_1px),radial-gradient(circle_at_10%_15%,rgba(52,211,153,.45),transparent_26%),radial-gradient(circle_at_88%_15%,rgba(6,182,212,.4),transparent_25%)] bg-[size:44px_44px,44px_44px,auto,auto]" />
        <div className="pointer-events-none absolute left-[8%] top-12 h-72 w-72 rounded-full border border-emerald-200/25" /><div className="pointer-events-none absolute bottom-[-120px] right-[12%] h-80 w-80 rounded-full border border-cyan-200/20" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20"><p className="text-xs font-bold tracking-[0.18em] text-emerald-100">COMPETITION ACTIVITIES</p><h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">AI 赛事活动</h1><p className="mt-4 max-w-2xl text-base leading-8 text-white/80">按「主推赛事 · 重点推荐 · 其他赛事」分类呈现，帮助学生找到适配当前学习阶段的实践舞台。</p><div className="mt-8 grid max-w-2xl grid-cols-3 gap-5 border-t border-white/20 pt-6">{[['1', '主推赛事'], ['3', '重点推荐'], ['5', '其他赛事']].map(([number, label]) => <div key={label}><p className="text-2xl font-bold text-emerald-200">{number}</p><p className="mt-1 text-xs text-white/65">{label}</p></div>)}</div></div>
      </section>

      <section className="order-20 mx-auto max-w-7xl px-4 pt-10 sm:px-6" aria-labelledby="event-recommend-heading">
        <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-5 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-medium text-[#087e72]">FEATURED EVENTS</p><h2 id="event-recommend-heading" className="mt-1 text-2xl font-bold text-bingo-dark">主推荐赛事</h2></div><p className="text-sm text-slate-500">优先匹配当前学习阶段</p></div>
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">{hotEvents.map((event) => <article key={event.id} className="overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg"><div className="relative aspect-[16/8] overflow-hidden bg-[#075b57]"><img src={event.cover} alt={`${event.name}赛事封面`} className="h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" /><div className="absolute left-3 top-3"><StatusBadge status={event.status} /></div><span className="absolute right-3 top-3 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-[#087e72]">主推荐</span></div><div className="p-5"><h3 className="min-h-14 text-lg font-bold leading-7 text-bingo-dark">{event.name}</h3><p className="mt-2 text-xs font-medium leading-5 text-[#087e72]">{event.subtitle}</p><p className="mt-3 line-clamp-3 min-h-[60px] text-sm leading-5 text-slate-500">{event.description}</p><dl className="mt-5 space-y-2 border-t border-emerald-50 pt-4 text-xs text-slate-500"><div className="flex justify-between gap-3"><dt>报名动态</dt><dd className="text-right font-medium text-slate-700">{event.deadline}</dd></div><div className="flex justify-between gap-3"><dt>参赛时间</dt><dd className="text-right font-medium text-slate-700">{event.period}</dd></div><div className="flex justify-between gap-3"><dt>参赛对象</dt><dd className="text-right font-medium text-slate-700">{event.audience}</dd></div><div className="flex justify-between gap-3"><dt>主办单位</dt><dd className="text-right font-medium text-slate-700">{event.organizer}</dd></div></dl><div className="mt-5 flex items-center justify-between gap-3"><span className="text-xs text-slate-400"><strong className="font-semibold text-slate-600">{event.count}</strong> 已报名 / 关注</span><Link to={`/events/${event.id}`} className="inline-flex min-h-10 items-center rounded-xl bg-[#0b9b8b] px-3 text-sm font-bold text-white transition hover:bg-[#087e72]">查看详情</Link></div></div></article>)}</div>
        </div>
      </section>
      <section className="order-10 mx-auto max-w-7xl px-4 pt-10 sm:px-6" aria-labelledby="featured-event-heading">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-medium text-orange-600">HOT EVENT</p><h2 id="featured-event-heading" className="mt-1 text-2xl font-bold text-bingo-dark">热门推荐赛事</h2></div><p className="text-sm text-slate-500">本期关注度最高的赛事活动</p></div>
        <article className="mt-6 overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm lg:grid lg:grid-cols-[minmax(300px,.9fr)_minmax(0,1.1fr)]"><div className="relative min-h-[260px] overflow-hidden bg-orange-900"><img src={featuredEvent.cover} alt={`${featuredEvent.name}赛事封面`} className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" /><span className="absolute left-5 top-5 rounded-full bg-amber-300 px-3 py-1.5 text-xs font-bold text-amber-950">热门推荐</span><p className="absolute bottom-5 left-5 right-5 text-sm font-medium leading-6 text-white">{featuredEvent.audience} · {featuredEvent.period}</p></div><div className="bg-gradient-to-br from-orange-50 via-white to-amber-50 p-6 sm:p-8"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold tracking-[.14em] text-orange-600">HOT EVENT · 01</p><h3 className="mt-2 text-2xl font-bold leading-8 text-bingo-dark">{featuredEvent.name}</h3></div><StatusBadge status={featuredEvent.status} /></div><p className="mt-4 text-sm font-medium leading-7 text-orange-700">{featuredEvent.subtitle} ｜ 主办单位：{featuredEvent.organizer}</p><p className="mt-4 text-sm leading-7 text-slate-600">{featuredEvent.description}</p><dl className="mt-6 grid gap-4 border-t border-orange-100 pt-5 text-sm sm:grid-cols-2"><div><dt className="text-xs text-slate-400">报名动态</dt><dd className="mt-1 font-semibold text-rose-500">{featuredEvent.deadline}</dd></div><div><dt className="text-xs text-slate-400">参赛时间</dt><dd className="mt-1 font-semibold text-slate-700">{featuredEvent.period}</dd></div></dl><Link to={`/events/${featuredEvent.id}`} className="mt-7 inline-flex min-h-11 items-center rounded-xl bg-orange-500 px-5 text-sm font-bold text-white transition hover:bg-orange-600">查看赛事详情 <span className="ml-2 text-lg">→</span></Link></div></article>
      </section>
      <section className="order-30 mx-auto max-w-7xl px-4 py-10 sm:px-6" aria-labelledby="event-list-heading">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm font-medium text-violet-700">MORE COMPETITIONS</p><h2 id="event-list-heading" className="mt-1 text-2xl font-bold text-bingo-dark">其他赛事列表</h2></div><p className="text-sm text-slate-500">更多方向，按报名状态查看</p></div>
        <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="赛事状态筛选">
          {Object.entries(STATUS).map(([key, label]) => <button key={key} type="button" role="tab" aria-selected={active === key} onClick={() => setActive(key)} className={`min-h-11 rounded-full px-5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${active === key ? 'bg-[#087e72] text-white shadow-sm' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100'}`}>{label}</button>)}
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visibleOtherEvents.map((event) => <article key={event.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
            <div className="relative aspect-[21/8] overflow-hidden bg-[#075b57]"><img src={event.cover} alt={`${event.name}赛事封面`} className="h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/5 to-transparent" /><div className="absolute left-4 top-4"><StatusBadge status={event.status} /></div></div>
            <div className="p-5"><h3 className="min-h-14 text-lg font-bold leading-7 text-bingo-dark">{event.name}</h3><p className="mt-3 line-clamp-3 min-h-[60px] text-sm leading-5 text-slate-500">{event.description}</p><dl className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500"><div className="flex justify-between gap-4"><dt>报名动态</dt><dd className="text-right font-medium text-slate-700">{event.deadline}</dd></div><div className="flex justify-between gap-4"><dt>参赛时间</dt><dd className="text-right font-medium text-slate-700">{event.period}</dd></div><div className="flex justify-between gap-4"><dt>参赛对象</dt><dd className="text-right font-medium text-slate-700">{event.audience}</dd></div><div className="flex justify-between gap-4"><dt>主办单位</dt><dd className="text-right font-medium text-slate-700">{event.organizer}</dd></div></dl><div className="mt-5 flex items-center justify-between"><span className="text-xs text-slate-400"><strong className="font-semibold text-slate-600">{event.count}</strong> 已报名 / 关注</span><Link to={`/events/${event.id}`} className="inline-flex min-h-11 items-center rounded-xl bg-[#087e72] px-4 text-sm font-semibold text-white transition hover:bg-[#06685f] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">{STATUS_ACTION[event.status]}</Link></div></div>
          </article>)}
        </div>
        {visibleOtherEvents.length === 0 && <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-sm text-slate-500">当前分类暂无其他赛事，可切换筛选条件查看。</div>}
      </section>
    </main>
  )
}

function EventDetail({ event }) {
  const isEnded = event.status === 'ended'
  const [actioned, setActioned] = useState(false)
  const [showApplication, setShowApplication] = useState(false)
  const [application, setApplication] = useState({ name: '', phone: '', school: '', province: '', city: '' })
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
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/80"><span>报名动态：{event.deadline}</span><span>参赛时间：{event.period}</span><span>{event.count} {isEnded ? '累计参与' : '人已关注'}</span></div>
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

        </div>

        <aside id="registration" className="h-fit rounded-2xl border border-slate-200 bg-white shadow-lg lg:sticky lg:top-20">
          <div className={`p-6 text-white ${event.status === 'open' ? 'bg-gradient-to-br from-[#075b57] to-[#0b766f]' : event.status === 'soon' ? 'bg-gradient-to-br from-amber-500 to-orange-500' : 'bg-gradient-to-br from-slate-600 to-slate-800'}`}><p className="text-sm text-white/75">报名状态</p><p className="mt-2 text-2xl font-bold">{STATUS[event.status]}</p><p className="mt-2 text-xs text-white/70">报名动态：{event.deadline}</p></div>
          <div className="p-6"><dl className="space-y-4 text-sm"><div className="flex justify-between gap-4"><dt className="text-slate-400">主办单位</dt><dd className="text-right font-medium text-bingo-dark">{event.organizer}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-400">参赛对象</dt><dd className="text-right font-medium text-bingo-dark">{event.audience}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-400">参赛形式</dt><dd className="text-right font-medium text-bingo-dark">个人 / 团队</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-400">报名费用</dt><dd className="text-right font-medium text-emerald-600">以官方通知为准</dd></div></dl>{event.status === 'open' && <button type="button" onClick={() => setShowApplication(true)} className="mt-7 min-h-12 w-full rounded-xl bg-[#087e72] px-5 text-sm font-bold text-white transition hover:bg-[#06685f]">{actioned ? '已提交报名信息' : '提交报名信息'}</button>}{event.status === 'soon' && <button type="button" onClick={() => setActioned(true)} className="mt-7 min-h-12 w-full rounded-xl bg-amber-500 px-5 text-sm font-bold text-white transition hover:bg-amber-600">{actioned ? '已关注报名通知' : '关注报名通知'}</button>}{isEnded && <p className="mt-7 rounded-xl bg-slate-100 px-4 py-3 text-center text-sm font-semibold text-slate-600">本届报名已结束</p>}<p className="mt-4 text-center text-xs leading-5 text-slate-400">提交信息后，运营老师将电话联系；具体报名条件、材料与赛程以赛事主办方最终发布的官方通知为准。</p></div>
          <section className="border-t border-slate-100 bg-slate-50/70 p-6" aria-labelledby="companion-courses-heading"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold tracking-[.12em] text-[#087e72]">AI 能力课程</p><h2 id="companion-courses-heading" className="mt-1 text-lg font-bold text-bingo-dark">配套备赛课程</h2></div><Link to="/courses" className="text-xs font-semibold text-[#087e72] hover:underline">全部课程 →</Link></div><div className="mt-4 space-y-3">{COMPANION_COURSES.map((course) => <article key={course.detailId} className="overflow-hidden rounded-xl border border-emerald-100 bg-white shadow-sm"><div className="flex gap-3 p-3"><img src={course.cover} alt={`${course.name}课程封面`} className="h-16 w-24 shrink-0 rounded-lg object-cover" /><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><h3 className="text-sm font-bold leading-5 text-bingo-dark">{course.name}</h3><span className="shrink-0 text-sm font-bold text-orange-500">{course.price}</span></div><p className="mt-1 text-xs leading-5 text-slate-500">{course.meta}</p></div></div><Link to={`/courses/detail/${course.detailId}`} className="flex min-h-9 items-center justify-center border-t border-emerald-50 bg-emerald-50/60 px-3 text-xs font-bold text-[#087e72] transition hover:bg-emerald-100">查看课程</Link></article>)}</div></section>
        </aside>
      </section>

      {showApplication && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setShowApplication(false) }}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 p-6"><div><p className="text-xs font-bold tracking-[.14em] text-primary">EVENT REGISTRATION</p><h2 className="mt-1 text-xl font-bold text-bingo-dark">提交报名信息</h2><p className="mt-2 text-sm text-slate-500">提交后，运营老师将电话联系你，协助完成后续报名与备赛咨询。</p></div><button type="button" onClick={() => setShowApplication(false)} className="grid h-9 w-9 place-items-center rounded-lg text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label="关闭报名窗口">×</button></div>
            <form className="space-y-5 p-6" onSubmit={(e) => { e.preventDefault(); setActioned(true); setShowApplication(false) }}>
              <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-medium text-slate-700">参赛者姓名 *<input required value={application.name} onChange={(e) => setApplication({ ...application, name: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" placeholder="请输入姓名" /></label><label className="block text-sm font-medium text-slate-700">联系电话 *<input required type="tel" value={application.phone} onChange={(e) => setApplication({ ...application, phone: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" placeholder="请输入手机号" /></label></div>
              <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-medium text-slate-700">所在地区 *<div className="mt-2 grid grid-cols-2 gap-2"><select required value={application.province} onChange={(e) => setApplication({ ...application, province: e.target.value, city: '' })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"><option value="">选择省份</option>{Object.keys(REGION_OPTIONS).map((province) => <option key={province} value={province}>{province}</option>)}</select><select required disabled={!application.province} value={application.city} onChange={(e) => setApplication({ ...application, city: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/15"><option value="">选择城市</option>{(REGION_OPTIONS[application.province] || []).map((city) => <option key={city} value={city}>{city}</option>)}</select></div></label><label className="block text-sm font-medium text-slate-700">所在学校 *<input required value={application.school} onChange={(e) => setApplication({ ...application, school: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15" placeholder="请输入学校名称" /></label></div>
              <label className="block text-sm font-medium text-slate-700">参赛赛项 *<input readOnly value={event.name} className="mt-2 w-full cursor-default rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 outline-none" /></label>
              <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800">仅收集本次咨询所需的基础信息，不需要上传作品或其他材料。</p>
              <div className="flex gap-3 border-t border-slate-100 pt-5"><button type="button" onClick={() => setShowApplication(false)} className="min-h-12 flex-1 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 transition hover:bg-slate-50">取消</button><button type="submit" className="min-h-12 flex-1 rounded-xl bg-[#087e72] text-sm font-bold text-white transition hover:bg-[#06685f]">提交报名信息</button></div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}

function EventNotFound() {
  return <main className="mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center px-4 text-center"><p className="text-sm font-bold tracking-[.14em] text-primary">EVENT NOT FOUND</p><h1 className="mt-3 text-3xl font-bold text-bingo-dark">未找到该赛事</h1><Link to="/events" className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-[#087e72] px-5 text-sm font-semibold text-white">返回赛事活动</Link></main>
}
