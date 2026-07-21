import {
  ArrowRightOutlined,
  BookOutlined,
  BulbOutlined,
  CompassOutlined,
  CodeOutlined,
  ExperimentOutlined,
  FlagOutlined,
  GiftOutlined,
  GlobalOutlined,
  RocketOutlined,
  SafetyCertificateOutlined,
  ShopOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { createElement } from 'react'
import { Link } from 'react-router-dom'

const MODULES = [
  {
    number: '01',
    title: 'AI成长规划',
    eyebrow: '每一步，都朝向未来',
    desc: '从兴趣发现到能力进阶，为 6–18 岁孩子建立清晰、可持续的成长路径。',
    to: '/growth',
    icon: CompassOutlined,
    tone: 'from-[#056b78] via-[#0da3a1] to-[#4bd3b8]',
    points: ['AI素养测评', '分龄学习路径', '成长轨迹管理'],
  },
  {
    number: '02',
    title: 'AI能力课',
    eyebrow: '学会使用，更学会创造',
    desc: '以项目式学习培养理解、表达、创造与解决问题的 AI 核心能力。',
    to: '/courses',
    icon: BookOutlined,
    tone: 'from-[#2158c7] via-[#377dea] to-[#79c8ff]',
    points: ['AI素养启蒙', '创意实践课程', '竞赛进阶训练'],
  },
  {
    number: '03',
    title: 'AI赛事活动',
    eyebrow: '把热爱变成高光时刻',
    desc: '赛事、营地与主题活动，让孩子在真实挑战中看见自己的成长。',
    to: '/events',
    icon: FlagOutlined,
    tone: 'from-[#b34b12] via-[#eb7b1b] to-[#ffc15b]',
    points: ['白名单赛事', '创意挑战活动', '优秀作品展映'],
  },
]

const EXPLORATIONS = [
  {
    title: 'AI知识漫游',
    desc: '探索 AI 奥秘，动手完成有趣实验，覆盖 SPA 模型、传感器、AIGC 创作等主题。',
    to: '/tools#knowledge',
    icon: GlobalOutlined,
    tone: 'from-[#0649ba] via-[#146bdb] to-[#58bee7]',
    image: '/home-explore-knowledge.png',
    overlay: 'bg-[linear-gradient(90deg,rgba(4,46,132,.96)_0%,rgba(7,80,175,.87)_38%,rgba(13,104,202,.30)_63%,rgba(37,152,222,.05)_100%)]',
    ctaTone: 'bg-[#09a9d2] shadow-[0_10px_24px_rgba(3,119,181,.32)]',
    cta: '探索实验',
  },
  {
    title: 'AI兴趣游戏',
    desc: '把 AI 知识变成游戏闯关，边玩边学，适合孩子轻量体验和反复练习。',
    to: '/tools#games',
    icon: GiftOutlined,
    tone: 'from-[#4d2aad] via-[#7045d3] to-[#a579ed]',
    image: '/home-explore-games.png',
    overlay: 'bg-[linear-gradient(90deg,rgba(65,31,150,.97)_0%,rgba(86,44,179,.88)_38%,rgba(105,66,201,.32)_63%,rgba(134,94,224,.04)_100%)]',
    ctaTone: 'bg-[#ef6caa] shadow-[0_10px_24px_rgba(174,55,143,.32)]',
    cta: '开始游戏',
  },
]

const CAPABILITY_COURSES = [
  {
    label: '热门推荐',
    age: '6–10 岁',
    title: 'AI素养启蒙·面向未来的第一课',
    desc: '趣味认识人工智能，在动手体验中建立 AI 素养。',
    meta: '12 课时 · AI 素养',
    price: '¥299',
    cover: '/hero-1.png',
    to: '/courses?type=literacy',
    icon: BulbOutlined,
    tone: 'bg-amber-50 text-amber-700',
  },
  {
    label: '赛事进阶',
    age: '10–14 岁',
    title: '白名单赛事通关营',
    desc: '围绕赛事规则、项目设计与展示表达进行专项训练。',
    meta: '16 课时 · 赛事入门',
    price: '¥998',
    cover: '/hero-3.png',
    to: '/courses?type=contest',
    icon: CodeOutlined,
    tone: 'bg-blue-50 text-blue-700',
  },
  {
    label: '成长规划',
    age: '15–18 岁',
    title: '科技特长生路径课',
    desc: '将 AI 能力、项目实践与升学目标连接成清晰路径。',
    meta: '16 课时 · 升学衔接',
    price: '¥698',
    cover: '/home-ai-children-hero.png',
    to: '/courses?type=exam',
    icon: ExperimentOutlined,
    tone: 'bg-violet-50 text-violet-700',
  },
]

const FEATURED_EVENTS = [
  {
    title: '全国青少年人工智能大赛',
    meta: '自然科学素养类 · 适配 L1–L9',
    deadline: '距离报名截止 46 天',
    to: '/events/ai-competition',
    image: '/events/ai-creative-competition.jpg',
  },
  {
    title: '全国青少年机器人创新挑战赛',
    meta: '机器人设计 · 智能控制 · 工程挑战',
    deadline: '报名中',
    to: '/events/robotics',
    image: '/events/sci-fi-competition.png',
  },
  {
    title: '全国青少年数字艺术创意大赛',
    meta: '数字绘画 · 动画设计 · AI 创意表达',
    deadline: '距离报名截止 52 天',
    to: '/events/digital-art',
    image: '/events/art-competition.png',
  },
]

const CERTIFICATE_ITEMS = [
  { code: 'L1', title: 'AI 素养启蒙证书', detail: '完成 AI 基础认知、智能工具体验与安全使用学习', tone: 'from-sky-500 to-cyan-500', tag: '能力启蒙' },
  { code: 'L3', title: 'AI 创意实践证书', detail: '完成主题项目创作，掌握 AI 辅助表达与问题解决', tone: 'from-teal-500 to-emerald-500', tag: '项目实践' },
  { code: 'L5', title: 'AI 赛事能力证书', detail: '完成赛事训练与综合挑战，形成阶段性能力证明', tone: 'from-indigo-500 to-blue-600', tag: '赛事进阶' },
]

const SHOP_ITEMS = [
  { title: 'AI启蒙传感学具套装', image: '/mall/ai-sensor-kit.png', price: '¥680', age: '7–10 岁', to: '/mall/kit-ai-starter' },
  { title: '人工智能 Micro:bit 编程学具', image: '/mall/ai-coding-robot.png', price: '¥298', age: '8–14 岁', to: '/mall/robot-microbit' },
  { title: 'AI视觉与多模态传感器套装', image: '/mall/ai-vision-kit.png', price: '¥1,280', age: '10–16 岁', to: '/mall/sensor-ai-kit' },
]

function SectionHeading({ index, title, subtitle }) {
  return (
    <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-bold tracking-[0.18em] text-teal-700">{index}</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h2>
      </div>
      {subtitle ? <p className="max-w-xl text-sm leading-6 text-slate-600 sm:text-right">{subtitle}</p> : null}
    </div>
  )
}

function LinkArrow() {
  return <ArrowRightOutlined aria-hidden className="text-sm transition-transform duration-200 group-hover:translate-x-1" />
}

export default function Home() {
  return (
    <div className="overflow-hidden bg-[#f5fbfb]">
      <a href="#home-content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:text-teal-800 focus:shadow-lg">
        跳至主要内容
      </a>

      <section className="relative isolate min-h-[330px] overflow-hidden bg-[#11206b] sm:min-h-[430px] lg:min-h-[510px]">
        <img
          src="/home-hero-future-lab.png"
          alt="两位孩子与机器人一起探索人工智能"
          width="1817"
          height="866"
          fetchPriority="high"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-[66%_center] sm:object-center"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(19,21,67,.96)_0%,rgba(29,24,72,.88)_34%,rgba(39,30,67,.38)_55%,rgba(29,20,45,.05)_78%)] sm:bg-[linear-gradient(90deg,rgba(19,21,67,.82)_0%,rgba(29,24,72,.62)_38%,rgba(39,30,67,.14)_58%,transparent_76%)]" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#100f36]/40 via-transparent to-white/5" />
        <div className="mx-auto flex min-h-[330px] max-w-7xl items-center px-5 py-12 sm:min-h-[430px] sm:px-8 lg:min-h-[510px] lg:px-10">
          <div>
            <h1 className="max-w-[8.5em] text-4xl font-black leading-[1.15] tracking-[-0.06em] text-white drop-shadow-[0_5px_22px_rgba(3,21,72,.48)] sm:text-6xl lg:text-7xl">
              让每个孩子
              <br />
              与 AI 一起成长
            </h1>
            <div className="mt-7 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:items-stretch">
              <Link
                to="/events/ai-test?category=comprehensive"
                className="group inline-flex min-h-14 items-center gap-3 rounded-2xl border border-white/20 bg-gradient-to-br from-[#4e8df2]/95 via-[#2667dc]/95 to-[#3845ae]/95 px-4 py-3 text-left text-white shadow-[0_12px_30px_rgba(6,8,42,.28)] transition duration-200 hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/20 bg-white/14 text-lg text-white"><CompassOutlined /></span>
                <span className="min-w-0">
                  <span className="block text-sm font-black">综合测评 <ArrowRightOutlined className="ml-1 text-xs" /></span>
                  <span className="mt-0.5 block text-xs font-medium text-white/78">15 分钟定位 AI 能力</span>
                </span>
              </Link>
              <Link
                to="/courses?deal=9.9"
                className="group relative inline-flex min-h-14 items-center gap-3 overflow-hidden rounded-2xl border border-[#ffd89c]/35 bg-gradient-to-br from-[#d8795c]/95 via-[#bd4c78]/95 to-[#783c9b]/95 px-4 py-3 text-left text-white shadow-[0_12px_30px_rgba(6,8,42,.22)] transition duration-200 hover:-translate-y-0.5 hover:brightness-110 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-white"
              >
                <span className="absolute right-0 top-0 rounded-bl-xl bg-[#ffcc64] px-2 py-1 text-[10px] font-black leading-none tracking-wide text-[#744000]">限时特价</span>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/20 bg-[#ffbd5c]/92 text-lg text-[#633612]"><BookOutlined /></span>
                <span className="min-w-0 pr-8">
                  <span className="block text-sm font-black">推荐 AI 能力课程 <ArrowRightOutlined className="ml-1 text-xs" /></span>
                  <span className="mt-0.5 block text-xs font-medium text-white/75">精选课程 ¥299 起</span>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <main id="home-content" className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20 lg:px-10">
        <section>
          <SectionHeading index="LEARNING JOURNEY" title="一条完整的 AI 成长之路" subtitle="从规划到学习、从探索到展示，让每一份好奇心都有方向。" />
          <div className="grid gap-5 lg:grid-cols-3">
            {MODULES.map(({ number, title, eyebrow, desc, to, icon, tone, points }) => (
              <Link key={title} to={to} className={`group relative min-h-[332px] overflow-hidden rounded-[28px] bg-gradient-to-br ${tone} p-7 text-white shadow-[0_18px_45px_rgba(11,83,97,.16)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(11,83,97,.24)] focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-teal-600`}>
                <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full border border-white/20 bg-white/10" />
                <div className="absolute -bottom-20 -left-12 h-40 w-40 rounded-full bg-white/10" />
                <div className="relative flex h-full flex-col">
                  <div className="flex items-start justify-between">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl border border-white/30 bg-white/15 shadow-inner">{createElement(icon, { className: 'text-xl' })}</span>
                    <span className="text-xs font-bold tracking-[0.18em] text-white/70">{number}</span>
                  </div>
                  <p className="mt-9 text-xs font-bold tracking-[0.14em] text-white/75">{eyebrow}</p>
                  <h3 className="mt-2 text-2xl font-bold tracking-tight">{title}</h3>
                  <p className="mt-3 max-w-[18rem] text-sm leading-6 text-white/85">{desc}</p>
                  <div className="mt-auto border-t border-white/25 pt-4">
                    <div className="flex flex-wrap gap-2">
                      {points.map(point => <span key={point} className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium text-white/90">{point}</span>)}
                    </div>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold">了解更多 <LinkArrow /></span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

        </section>

        <section className="pt-20 sm:pt-28">
          <SectionHeading index="AI CAPABILITY COURSES" title="为每一个成长阶段，准备一门好课" subtitle="精选 AI 素养、赛事能力与升学规划课程，点击即可查看完整商品详情。" />
          <div className="grid gap-5 lg:grid-cols-3">
            {CAPABILITY_COURSES.map(({ label, age, title, desc, meta, price, to, icon, cover }) => (
              <Link key={title} to={to} className="group overflow-hidden rounded-[26px] border border-slate-100 bg-white shadow-[0_12px_30px_rgba(10,89,100,.08)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(10,89,100,.15)] focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-teal-600">
                <div className="relative aspect-[16/9] overflow-hidden bg-teal-100">
                  <img src={cover} alt={`${title}课程封面`} loading="lazy" width="1024" height="576" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />
                  <span className="absolute left-4 top-4 grid h-10 w-10 place-items-center rounded-xl border border-white/35 bg-white/20 text-white backdrop-blur-sm">{createElement(icon)}</span>
                  <span className="absolute bottom-4 left-4 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-slate-700">{label}</span>
                  <span className="absolute bottom-4 right-4 rounded-full bg-teal-500 px-3 py-1 text-xs font-bold text-white">{age}</span>
                </div>
                <div className="p-5 sm:p-6">
                  <h3 className="text-xl font-bold leading-7 text-slate-900">{title}</h3>
                  <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">{desc}</p>
                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <span className="text-xs font-medium text-slate-500">{meta}</span>
                    <span className="text-xl font-bold text-rose-500">{price}</span>
                  </div>
                  <span className="mt-4 inline-flex min-h-10 items-center gap-2 text-sm font-bold text-teal-700">查看课程商品 <LinkArrow /></span>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-7 text-center">
            <Link to="/courses" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-teal-700 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-teal-700">查看全部 AI 能力课程 <LinkArrow /></Link>
          </div>
        </section>

        <section className="pt-20 sm:pt-28">
          <div className="rounded-[28px] border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-teal-50 p-6 shadow-[0_16px_36px_rgba(14,116,144,.08)] sm:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold tracking-[0.15em] text-sky-700">AI COMPETITION EVENTS</p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">正在进行的赛事活动</h2>
              </div>
              <Link to="/events" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-sky-700 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-600">查看全部赛事 <LinkArrow /></Link>
            </div>
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {FEATURED_EVENTS.map(({ title, meta, deadline, to, image }) => (
                <Link key={title} to={to} className="group overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-sky-600">
                  <div className="relative aspect-[16/8] overflow-hidden bg-sky-100">
                    <img src={image} alt={`${title}赛事封面`} loading="lazy" width="800" height="400" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                    <span className="absolute left-3 top-3 rounded-full bg-teal-600 px-2.5 py-1 text-xs font-bold text-white">报名中</span>
                  </div>
                  <div className="p-4">
                    <h3 className="text-base font-bold leading-6 text-slate-900">{title}</h3>
                    <p className="mt-2 text-xs leading-5 text-slate-500">{meta}</p>
                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                      <span className="text-xs font-semibold text-teal-700">{deadline}</span>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-sky-700">赛事详情 <LinkArrow /></span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="pt-20 sm:pt-28">
          <SectionHeading index="AI EXPLORATION" title="边探索，边把 AI 玩明白" subtitle="从知识漫游到兴趣游戏，把抽象概念拆成孩子愿意点开、愿意反复尝试的探索内容。" />
          <div className="grid gap-5 lg:grid-cols-2">
            {EXPLORATIONS.map(({ title, desc, to, icon, tone, image, overlay, ctaTone, cta }) => (
              <Link key={title} to={to} className={`group relative min-h-[250px] overflow-hidden rounded-[30px] bg-gradient-to-br ${tone} p-8 text-white shadow-[0_18px_42px_rgba(75,81,174,.16)] transition duration-200 hover:-translate-y-1 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-indigo-600`}>
                <img src={image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                <div className={`absolute inset-0 ${overlay}`} />
                <div className="relative max-w-md">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/18 text-2xl shadow-inner">{createElement(icon)}</span>
                  <h3 className="mt-8 text-3xl font-black tracking-tight sm:text-4xl">{title}</h3>
                  <p className="mt-4 max-w-sm text-sm font-semibold leading-7 text-white/82">{desc}</p>
                  <span className={`mt-8 inline-flex min-h-12 items-center gap-2 rounded-2xl px-6 text-sm font-bold ${ctaTone}`}>{cta} <LinkArrow /></span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="pt-20 sm:pt-28">
          <SectionHeading index="ACHIEVEMENT CERTIFICATES" title="让努力被看见，也被认可" subtitle="每一段学习与实践，都能沉淀为清晰、可查验的阶段性能力证明。" />
          <div className="overflow-hidden rounded-[28px] border border-sky-100 bg-gradient-to-br from-[#edf9ff] via-white to-[#eefcf7] shadow-[0_18px_40px_rgba(14,116,144,.10)]">
            <div className="grid gap-7 p-7 sm:p-9 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
              <div>
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-sky-600 text-white shadow-[0_10px_24px_rgba(2,132,199,.24)]"><SafetyCertificateOutlined className="text-2xl" /></span>
                <p className="mt-6 text-xs font-bold tracking-[0.16em] text-sky-700">MY ACHIEVEMENT CERTIFICATES</p>
                <h3 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">成长有记录，能力有证书</h3>
                <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">从 AI 素养启蒙到赛事挑战，完成对应学习路径或实践任务后，即可获得相应阶段证书。</p>
                <Link to="/cert" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-sky-700 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-sky-800 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-sky-700">查看我的证书 <LinkArrow /></Link>
              </div>
              <div className="grid gap-3">
                {CERTIFICATE_ITEMS.map(({ code, title, detail, tone, tag }) => (
                  <Link key={code} to="/cert" className="group flex items-center gap-4 rounded-2xl border border-sky-100 bg-white/90 p-4 transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md">
                    <span className={`grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${tone} text-base font-black text-white shadow-sm`}>{code}</span>
                    <span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-2"><strong className="text-sm text-slate-900">{title}</strong><em className="rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-bold not-italic text-sky-700">{tag}</em></span><span className="mt-1 block text-xs leading-5 text-slate-500">{detail}</span></span>
                    <LinkArrow />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="pt-20 sm:pt-28">
          <SectionHeading index="RESOURCE MALL" title="把灵感带回家" subtitle="精选课程配套、创作工具与探索资源，陪伴孩子将知识变成动手的乐趣。" />
          <div className="grid gap-4 sm:grid-cols-3">
            {SHOP_ITEMS.map(({ title, image, price, age, to }) => (
              <Link key={title} to={to} className="group overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-teal-600">
                <div className="aspect-[1.16] overflow-hidden bg-[#edf9f8] p-5">
                  <img src={image} alt={title} loading="lazy" width="500" height="500" className="h-full w-full object-contain transition duration-300 group-hover:scale-105" />
                </div>
                <div className="px-5 py-4">
                  <p className="text-xs text-slate-500">适用年龄：{age}</p>
                  <div className="mt-1 flex items-center justify-between gap-3">
                  <h3 className="font-bold text-slate-800">{title}</h3>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-teal-50 text-teal-700"><ShopOutlined /></span>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-lg font-bold text-rose-500">{price}</span>
                    <span className="text-xs font-bold text-teal-700">查看商品 <LinkArrow /></span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="pt-20 sm:pt-28">
          <Link to="/franchise" className="group grid overflow-hidden rounded-[32px] bg-gradient-to-r from-[#07505a] via-[#087a7d] to-[#19a68f] text-white shadow-[0_20px_48px_rgba(8,103,105,.2)] transition duration-200 hover:-translate-y-1 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-teal-600 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="p-8 sm:p-11">
              <span className="grid h-12 w-12 place-items-center rounded-2xl border border-white/25 bg-white/15"><TeamOutlined className="text-xl" /></span>
              <p className="mt-7 text-xs font-bold tracking-[0.16em] text-teal-100">PARTNER WITH US</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">把 AI 教育带到更多孩子身边</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/85">面向学校、教育机构与合作伙伴，提供课程、师训、运营与品牌支持，共建面向未来的 AI 教育生态。</p>
            </div>
            <span className="m-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-teal-800 shadow-lg transition duration-200 group-hover:bg-teal-50 sm:mx-11 sm:mb-11 lg:my-0 lg:mr-11">了解加盟合作 <LinkArrow /></span>
          </Link>
        </section>
      </main>
    </div>
  )
}
