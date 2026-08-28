import {
  ArrowRightOutlined, BookOutlined, BulbOutlined, CompassOutlined,
  FileTextOutlined, FlagOutlined, GlobalOutlined, ProjectOutlined,
  PlayCircleOutlined, ReadOutlined, RobotOutlined, RocketOutlined, SafetyCertificateOutlined,
  TeamOutlined, TrophyOutlined,
} from '@ant-design/icons'
import { createElement, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import aiFutureCtaBackground from '../assets/home-ai-future-cta.jpg'
import LeadCaptureTrigger from '../components/LeadCaptureTrigger'
import { HOME_GUIDES as GUIDES } from '../data/homeGuides'

const JOURNEY_STEPS = [
  { number: '01', label: 'AI成长规划', title: '科学测评 · 定制路径', desc: '15分钟能力测评，形成孩子的专属分龄学习规划。', output: '专属测评报告 · 分龄学习方案', to: '/growth', icon: CompassOutlined, tone: 'from-blue-600 to-cyan-500' },
  { number: '02', label: 'AI能力课程', title: '分级学习 · 项目实践', desc: '四阶九星课程体系，让知识在创意项目中真正落地。', output: '阶段能力证书 · 原创项目作品', to: '/courses', icon: BookOutlined, tone: 'from-violet-600 to-blue-500' },
  { number: '03', label: 'AI赛事实践', title: '备赛训练 · 实战获奖', desc: '白名单赛事专项训练，连接真实挑战和官方参赛通道。', output: '赛事奖项 · 综合素养背景', to: '/events', icon: TrophyOutlined, tone: 'from-orange-500 to-rose-500' },
]

const COURSE_LEVELS = [
  {
    id: 'starter', label: '启智阶', range: 'L1–L3', descriptor: 'AI认知与基础交互',
    courses: [
      { level: 'L1', levelName: 'AI萌芽', english: 'AI Sprout', grade: '1–2年级', age: '6–8岁', title: '机器如何感知世界？', subtitle: '从生活体验出发，认识机器感知世界的基本方式', price: '¥299', certificate: 'AI Explorer Bronze', cover: '/hero-1.png' },
      { level: 'L2', levelName: 'AI感知', english: 'AI Perception', grade: '2–3年级', age: '7–9岁', title: 'AI视觉特征与语音交互认知', subtitle: '理解图像特征与语音交互的基础原理', price: '¥399', certificate: 'AI Explorer Silver', cover: '/home-explore-knowledge.png' },
      { level: 'L3', levelName: 'AI分类', english: 'AI Classification', grade: '3–4年级', age: '8–10岁', title: 'AI标签、模型与算法认知', subtitle: '通过动手实践认识标签、模型与分类算法', price: '¥499', certificate: 'AI Explorer Gold', cover: '/home-ai-children-hero.png' },
    ],
  },
  {
    id: 'foundation', label: '基础阶', range: 'L4–L6', descriptor: '工具应用与技能入门',
    courses: [
      { level: 'L4', levelName: 'AI特征', english: 'AI Features', grade: '4–5年级', age: '9–11岁', title: '图像与语音识别的AI创作', subtitle: '运用识别工具完成图像与声音创意作品', price: '¥698', certificate: 'AI Creator Bronze', cover: '/home-explore-games.png' },
      { level: 'L5', levelName: 'AI推理', english: 'AI Reasoning', grade: '5–6年级', age: '10–12岁', title: 'AI指令认知与编程实现', subtitle: '学习指令逻辑，并用编程实现智能交互', price: '¥698', certificate: 'AI Creator Silver', cover: '/mall/ai-coding-robot.png' },
      { level: 'L6', levelName: 'AI数据', english: 'AI Data', grade: '6–7年级', age: '11–13岁', title: 'AI逻辑推理与情绪识别', subtitle: '理解数据关系，探索逻辑推理与情绪识别', price: '¥698', certificate: 'AI Creator Gold', cover: '/mall/ai-sensor-kit.png' },
    ],
  },
  {
    id: 'advanced', label: '精研阶', range: 'L7–L8', descriptor: '技术实践与思维构建',
    courses: [
      { level: 'L7', levelName: 'AI建模', english: 'AI Modeling', grade: '7–8年级', age: '12–14岁', title: 'AI语言解码与智能应用', subtitle: '掌握语言处理方法，设计可用的智能应用', price: '¥1280', certificate: 'AI Engineer Bronze', cover: '/events/ai-creative-competition.jpg' },
      { level: 'L8', levelName: 'AI神经网络', english: 'AI Neural Networks', grade: '8–9年级', age: '13–15岁', title: 'AI神经网络与数据可视化', subtitle: '理解神经网络结构，用可视化呈现数据规律', price: '¥1280', certificate: 'AI Engineer Silver', cover: '/events/sci-fi-competition.png' },
      { level: 'L8', grade: '8–9年级', age: '13–15岁', title: 'AI数据科学与可视化实战', subtitle: '从数据分析到图表表达，完成综合实践项目', price: '¥1280', cover: '/mall/ai-vision-kit.png' },
    ],
  },
  {
    id: 'innovation', label: '智创阶', range: 'L9', descriptor: '创新应用与项目链接',
    courses: [
      { level: 'L9', levelName: 'AI视觉', english: 'AI Computer Vision', grade: '9–10年级', age: '14–16岁', title: 'AI视觉应用的创造与展望', subtitle: '完成高阶视觉项目，探索人工智能创新方向', price: '¥1680', certificate: 'AI Engineer Gold', cover: '/events/art-competition.png' },
      { level: 'L9', grade: '9–10年级', age: '14–16岁', title: 'AI创新项目实战', subtitle: '围绕真实问题完成跨学科AI创新项目', price: '¥1680', cover: '/home-ai-children-hero.png' },
      { level: 'L9', grade: '9–10年级', age: '14–16岁', title: 'AI视觉与机器人编程实战', subtitle: '融合视觉识别与智能控制，打造完整作品', price: '¥1680', cover: '/mall/ai-coding-robot.png' },
    ],
  },
]

const ADVANTAGES = [
  { title: '项目式学习 PBL', desc: '以真实问题为导向，每阶段完成一个创意项目，在实践中理解知识并解决问题。', icon: ProjectOutlined },
  { title: '分龄分层教学', desc: '匹配 6–18 岁认知特点，四阶九星循序渐进，让学习难度与成长节奏相适应。', icon: TeamOutlined },
  { title: '双标准对标体系', desc: '衔接国内人工智能教育要求，并参考 UNESCO、OECD、IOAI 国际素养框架。', icon: GlobalOutlined },
  { title: '原创导师伴学', desc: '用孩子易理解的方式拆解抽象概念，通过任务引导和阶段反馈保持学习动力。', icon: RobotOutlined },
  { title: '学习成果可量化', desc: '测评、作品和能力证书共同记录成长，学习结果可追溯、可展示、可验证。', icon: SafetyCertificateOutlined },
  { title: '白名单赛事衔接', desc: '提供备赛课程、项目指导与赛事信息，让学习成果进入更真实的挑战场景。', icon: FlagOutlined },
]

const PARTNERS = [
  { title: '公立校进校合作', desc: '标准化课程体系输出、师资培训与赛事活动共建', icon: ReadOutlined },
  { title: '教培机构加盟', desc: '课程授权、师训运营、品牌支持与赛事资源对接', icon: TeamOutlined },
  { title: '活动定制合作', desc: 'AI营地、科普讲座、校园科技节与赛事承办', icon: RocketOutlined },
]

const TEXTBOOK_SAMPLES = [
  { province: '广东', title: '人工智能启蒙与实践', tone: ['#2563eb', '#06b6d4'] },
  { province: '浙江', title: '智能创想与项目学习', tone: ['#7c3aed', '#ec4899'] },
  { province: '江苏', title: 'AI基础与编程思维', tone: ['#0f766e', '#22c55e'] },
  { province: '北京', title: '人工智能素养读本', tone: ['#dc2626', '#f97316'] },
  { province: '上海', title: 'AI创新实践手册', tone: ['#4f46e5', '#8b5cf6'] },
  { province: '四川', title: '智能科技探索', tone: ['#ea580c', '#facc15'] },
  { province: '湖北', title: '人工智能基础课程', tone: ['#0284c7', '#2dd4bf'] },
  { province: '山东', title: 'AI与科学实践', tone: ['#0369a1', '#6366f1'] },
  { province: '湖南', title: '智能创造入门', tone: ['#9333ea', '#f43f5e'] },
  { province: '福建', title: '人工智能应用启蒙', tone: ['#059669', '#14b8a6'] },
  { province: '河南', title: 'AI思维训练', tone: ['#c2410c', '#fb7185'] },
  { province: '陕西', title: '智能技术与未来', tone: ['#4338ca', '#0ea5e9'] },
]

function SectionHeading({ eyebrow, title, subtitle, dark = false }) {
  return <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-12"><p className={`text-xs font-black tracking-[0.18em] ${dark ? 'text-cyan-300' : 'text-blue-600'}`}>{eyebrow}</p><h2 className={`mt-3 text-2xl font-black tracking-tight sm:text-4xl ${dark ? 'text-white' : 'text-slate-950'}`}>{title}</h2>{subtitle ? <p className={`mt-3 text-sm leading-7 sm:text-base ${dark ? 'text-slate-300' : 'text-slate-600'}`}>{subtitle}</p> : null}</div>
}

function LinkArrow() {
  return <ArrowRightOutlined aria-hidden="true" className="text-xs transition-transform duration-200 group-hover:translate-x-1" />
}

const PROVINCE_CELLS = [
  ['黑龙江', 464, 38], ['内蒙古', 334, 76], ['吉林', 476, 76], ['新疆', 62, 114], ['甘肃', 250, 114], ['宁夏', 306, 114], ['辽宁', 464, 114],
  ['北京', 406, 130], ['天津', 464, 152], ['青海', 194, 152], ['山西', 348, 152], ['河北', 406, 168], ['西藏', 92, 190], ['陕西', 306, 190],
  ['山东', 464, 190], ['四川', 250, 228], ['重庆', 306, 228], ['河南', 364, 206], ['江苏', 480, 228], ['安徽', 422, 228], ['湖北', 364, 244],
  ['云南', 224, 266], ['贵州', 306, 266], ['湖南', 364, 282], ['江西', 422, 266], ['浙江', 480, 266], ['广西', 328, 304], ['广东', 404, 304],
  ['福建', 468, 304], ['上海', 530, 244], ['香港', 404, 340], ['澳门', 358, 340], ['海南', 414, 376], ['台湾', 524, 328],
]

const COVERED_PROVINCES = new Set(TEXTBOOK_SAMPLES.map(({ province }) => province))

function CoverageMap() {
  return <svg viewBox="0 0 600 420" className="h-full w-full" role="img" aria-labelledby="coverage-map-title coverage-map-desc"><title id="coverage-map-title">全国教材省份覆盖地图</title><desc id="coverage-map-desc">省级板块地图重点标注广东、浙江、江苏、北京、上海、四川、湖北和山东等教材覆盖省份</desc><defs><linearGradient id="coverage-bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#eff6ff"/><stop offset=".55" stopColor="#f5f3ff"/><stop offset="1" stopColor="#ecfeff"/></linearGradient><linearGradient id="coverage-active" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2563eb"/><stop offset="1" stopColor="#7c3aed"/></linearGradient><filter id="coverage-shadow" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#2563eb" floodOpacity=".25"/></filter></defs><rect width="600" height="420" rx="30" fill="url(#coverage-bg)"/><circle cx="515" cy="64" r="92" fill="#fff" opacity=".35"/><circle cx="88" cy="350" r="116" fill="#bfdbfe" opacity=".18"/><path d="M56 326C158 255 212 116 356 80c79-20 142 13 180 78" fill="none" stroke="#93c5fd" strokeWidth="1.5" strokeDasharray="5 8" opacity=".55"/><g transform="translate(24 24)"><rect width="144" height="48" rx="15" fill="#fff" stroke="#dbeafe"/><text x="18" y="20" fill="#64748b" fontSize="10" fontWeight="700" letterSpacing="1.2">TEXTBOOK REACH</text><text x="18" y="38" fill="#1e3a8a" fontSize="16" fontWeight="800">全国 12 省覆盖</text></g><g aria-hidden="true">{PROVINCE_CELLS.map(([name,x,y]) => { const covered = COVERED_PROVINCES.has(name); const compact = name.length > 2; return <g key={name} transform={`translate(${x} ${y})`} filter={covered ? 'url(#coverage-shadow)' : undefined}><rect x="-24" y="-16" width="48" height="32" rx="9" fill={covered ? 'url(#coverage-active)' : '#fff'} stroke={covered ? '#fff' : '#cbd5e1'} strokeWidth={covered ? '2' : '1'}/><text x="0" y={covered ? '6' : '4'} textAnchor="middle" fill={covered ? '#fff' : '#64748b'} fontSize={covered ? '18' : compact ? '9' : '10.5'} fontWeight={covered ? '800' : '600'}>{name}</text>{covered ? <circle cx="18" cy="-11" r="4" fill="#fbbf24" stroke="#fff" strokeWidth="1.5"/> : null}</g>})}</g><g transform="translate(28 388)"><circle cx="6" cy="0" r="6" fill="#4f46e5"/><text x="18" y="4" fill="#475569" fontSize="11" fontWeight="700">重点覆盖省份</text><rect x="116" y="-6" width="12" height="12" rx="4" fill="#fff" stroke="#cbd5e1"/><text x="138" y="4" fill="#64748b" fontSize="11">全国省级版图</text></g></svg>
}

function TextbookCover({ sample, index }) {
  const [from, to] = sample.tone
  const patternId = `textbook-pattern-${index}`
  return <figure className="group min-w-0">
    <div className="relative aspect-[3/4] overflow-hidden rounded-[18px] border border-white/80 bg-white shadow-[0_10px_26px_rgba(15,23,42,.12)] transition duration-200 group-hover:-translate-y-1 group-hover:shadow-[0_16px_32px_rgba(37,99,235,.17)]">
      <svg viewBox="0 0 180 240" className="absolute inset-0 h-full w-full" role="img" aria-label={`${sample.province}${sample.title}教材封面`}>
        <defs><linearGradient id={patternId} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={from}/><stop offset="1" stopColor={to}/></linearGradient></defs>
        <rect width="180" height="240" fill="#fff"/>
        <rect width="180" height="64" fill={`url(#${patternId})`}/>
        <path d="M0 64 180 78v12L0 76Z" fill={`url(#${patternId})`} opacity=".14"/>
        <rect x="18" y="96" width="4" height="84" rx="2" fill={`url(#${patternId})`}/>
        <rect x="30" y="198" width="76" height="3" rx="1.5" fill={`url(#${patternId})`} opacity=".18"/>
      </svg>
      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-3 py-3 text-white"><span className="text-[9px] font-black tracking-[.12em]">BINGO AI</span><span className="rounded-full bg-white/20 px-2 py-1 text-[9px] font-black backdrop-blur-sm">{sample.province}</span></div>
      <div className="absolute inset-x-6 top-[42%] text-left"><p className="text-[9px] font-bold leading-4 tracking-[.08em] text-slate-500">青少年人工智能素养系列教材</p></div>
      <div className="absolute inset-x-3 bottom-3 flex items-center justify-between border-t border-slate-200 pt-2 text-[9px] font-bold text-slate-500"><span>地方教材</span><span>{String(index + 1).padStart(2, '0')}</span></div>
    </div>
    <figcaption className="mt-2 text-center text-xs font-black text-slate-700">{sample.province}教材</figcaption>
  </figure>
}

function TextbookMarquee() {
  return <div className="textbook-marquee" role="region" aria-label="地方教材自动轮播" tabIndex="0">
    <div className="textbook-marquee-track">
      <div className="textbook-marquee-group">{TEXTBOOK_SAMPLES.map((sample, index) => <div key={sample.province} className="w-[112px] shrink-0"><TextbookCover sample={sample} index={index}/></div>)}</div>
      <div className="textbook-marquee-group" aria-hidden="true">{TEXTBOOK_SAMPLES.map((sample, index) => <div key={`duplicate-${sample.province}`} className="w-[112px] shrink-0"><TextbookCover sample={sample} index={index + TEXTBOOK_SAMPLES.length}/></div>)}</div>
    </div>
  </div>
}

function GuideCard({ guide, duplicate = false }) {
  return <Link to={guide.to} aria-hidden={duplicate || undefined} tabIndex={duplicate ? -1 : undefined} className="group w-[290px] shrink-0 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-blue-600 sm:w-[330px]">
    <div className="relative aspect-[16/8] overflow-hidden bg-blue-50"><img src={guide.image} alt={duplicate ? '' : `${guide.title}文章封面`} width="800" height="400" loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"/><div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent"/></div>
    <div className="p-5"><h4 className="min-h-12 font-black leading-6 text-slate-950">{guide.title}</h4><span className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-blue-700">查看详情 <LinkArrow/></span></div>
  </Link>
}

function GuideMarquee() {
  return <div className="guide-marquee" role="region" aria-label="政策与学习指南自动轮播">
    <div className="guide-marquee-track">
      <div className="guide-marquee-group">{GUIDES.map(guide => <GuideCard key={guide.title} guide={guide}/>)}</div>
      <div className="guide-marquee-group" aria-hidden="true">{GUIDES.map(guide => <GuideCard key={`duplicate-${guide.title}`} guide={guide} duplicate/>)}</div>
    </div>
  </div>
}

function JourneyMap() {
  return <div className="relative overflow-hidden rounded-[36px] border border-blue-100 bg-gradient-to-br from-white via-blue-50/80 to-violet-50/70 p-5 shadow-[0_18px_48px_rgba(37,99,235,.10)] sm:p-8 lg:px-10 lg:pb-10 lg:pt-8" aria-label="三步AI成长路线图">
    <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full border border-blue-200/60" aria-hidden="true"/><div className="absolute -right-5 -top-9 h-40 w-40 rounded-full border border-violet-200/70" aria-hidden="true"/><div className="relative mb-7 flex flex-wrap items-center justify-between gap-3"><span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-xs font-black tracking-[.12em] text-blue-700 shadow-sm"><FlagOutlined aria-hidden="true"/>成长路线图</span><span className="rounded-full bg-slate-900 px-4 py-2 text-xs font-black tracking-[.16em] text-white">01 → 02 → 03</span></div>
    <svg viewBox="0 0 1200 160" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-8 top-24 z-0 hidden h-44 w-[calc(100%-4rem)] lg:block" aria-hidden="true"><defs><linearGradient id="journey-route-gradient" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#06b6d4"/><stop offset=".5" stopColor="#7c3aed"/><stop offset="1" stopColor="#f97316"/></linearGradient></defs><path d="M150 118C330 118 390 24 600 24" fill="none" stroke="url(#journey-route-gradient)" strokeWidth="6" strokeLinecap="round" strokeDasharray="11 12"/><path d="M600 24C810 24 880 118 1050 118" fill="none" stroke="url(#journey-route-gradient)" strokeWidth="6" strokeLinecap="round" strokeDasharray="11 12"/></svg>
    <svg viewBox="0 0 44 900" preserveAspectRatio="none" className="pointer-events-none absolute bottom-10 left-4 top-28 z-0 w-11 lg:hidden" aria-hidden="true"><defs><linearGradient id="journey-mobile-gradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#06b6d4"/><stop offset=".5" stopColor="#7c3aed"/><stop offset="1" stopColor="#f97316"/></linearGradient></defs><path d="M22 6C2 190 42 260 22 438S4 710 22 888" fill="none" stroke="url(#journey-mobile-gradient)" strokeWidth="4" strokeLinecap="round" strokeDasharray="10 12"/></svg>
    <div className="relative z-10 grid gap-8 lg:grid-cols-3 lg:gap-8">{JOURNEY_STEPS.map(({number,label,title,desc,output,to,icon,tone}, index) => <div key={number} className={`relative ml-10 lg:ml-0 lg:w-[300px] ${index === 0 ? 'lg:mt-16 lg:justify-self-start' : index === 1 ? 'lg:justify-self-center' : 'lg:mt-16 lg:justify-self-end'}`}>
      {index < JOURNEY_STEPS.length - 1 ? <span className="absolute -bottom-7 -left-9 z-20 grid h-7 w-7 rotate-90 place-items-center rounded-full border-2 border-white bg-gradient-to-br from-violet-600 to-orange-500 text-[10px] text-white shadow-md lg:hidden" aria-hidden="true"><ArrowRightOutlined/></span> : null}
      <Link to={to} className="group flex min-h-[270px] flex-col rounded-3xl border border-blue-100 bg-white p-5 text-center shadow-[0_12px_34px_rgba(37,99,235,.10)] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(37,99,235,.16)] focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-blue-600 sm:p-6"><span className={`mx-auto grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br ${tone} text-xl text-white shadow-lg ring-8 ring-white`}>{createElement(icon, {'aria-hidden':true})}</span><p className="mt-4 text-xs font-black tracking-[0.12em] text-blue-600">第 {number} 站 · {label}</p><h3 className="mt-2 text-lg font-black text-slate-950">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{desc}</p><span className="mt-auto flex items-center justify-center gap-2 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-700"><FileTextOutlined aria-hidden="true" className="text-blue-500"/>产出：{output}</span></Link>
      {index < JOURNEY_STEPS.length - 1 ? <span className={`absolute -right-16 z-30 hidden h-11 w-11 place-items-center rounded-full border-4 border-white bg-gradient-to-br ${index === 0 ? 'from-cyan-500 to-violet-600 -rotate-[14deg]' : 'from-violet-600 to-orange-500 rotate-[14deg]'} text-base text-white shadow-[0_8px_22px_rgba(79,70,229,.3)] lg:grid ${index === 0 ? '-top-2' : 'top-11'}`} aria-hidden="true"><ArrowRightOutlined/></span> : null}
    </div>)}</div>
  </div>
}

function CourseCard({ course }) {
  return <Link to={`/courses?level=${course.level}`} className="group overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-[0_10px_30px_rgba(15,23,42,.08)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_38px_rgba(37,99,235,.14)] focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-blue-600"><div className="relative aspect-[16/9] overflow-hidden bg-blue-50"><img src={course.cover} alt={`${course.title}课程封面`} width="900" height="506" loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"/><div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent"/><span className="absolute left-4 top-4 rounded-lg bg-blue-600 px-3 py-1 text-sm font-black text-white">{course.level}</span><span className="absolute bottom-4 left-4 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-slate-700">{course.grade} · {course.age}</span></div><div className="p-5 sm:p-6"><h3 className="text-lg font-black leading-7 text-slate-950">{course.title}</h3><p className="mt-1.5 min-h-12 text-sm leading-6 text-slate-500">{course.subtitle}</p><div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4"><strong className="text-xl text-orange-600">{course.price}</strong><span className="inline-flex min-h-10 items-center gap-2 text-sm font-black text-blue-700">查看详情 <LinkArrow/></span></div></div></Link>
}

function IntroVideoCard() {
  return <div className="relative mx-auto w-full max-w-xl overflow-hidden rounded-[24px] shadow-[0_24px_70px_rgba(2,6,23,.42)] lg:mx-0 lg:max-w-none">
    <div className="group relative aspect-video overflow-hidden bg-slate-900">
      <img src="/home-ai-children-hero.png" alt="缤果AI学院宣传视频预览" width="1200" height="675" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"/>
      <div className="absolute inset-0 bg-slate-950/10"/>
      <div className="absolute inset-0 grid place-items-center">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-white/20 text-3xl text-white shadow-xl backdrop-blur-md" aria-hidden="true"><PlayCircleOutlined/></span>
      </div>
    </div>
  </div>
}

export default function Home() {
  const [activeLevel, setActiveLevel] = useState(COURSE_LEVELS[0].id)
  const [courseRotationStopped, setCourseRotationStopped] = useState(false)
  const currentLevel = COURSE_LEVELS.find(level => level.id === activeLevel) || COURSE_LEVELS[0]

  useEffect(() => {
    if (courseRotationStopped) return undefined
    const timer = window.setInterval(() => {
      setActiveLevel(current => {
        const currentIndex = COURSE_LEVELS.findIndex(level => level.id === current)
        return COURSE_LEVELS[(currentIndex + 1) % COURSE_LEVELS.length].id
      })
    }, 5000)
    return () => window.clearInterval(timer)
  }, [courseRotationStopped])

  return <div className="overflow-hidden bg-white text-slate-800">
    <a href="#home-content" className="sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:text-blue-800 focus:shadow-lg">跳至主要内容</a>

    <section className="relative isolate min-h-[520px] overflow-hidden bg-[#11206b] sm:min-h-[590px] lg:min-h-[650px]">
      <img src="/home-hero-future-lab.png" alt="两位孩子与机器人一起探索人工智能" width="1817" height="866" fetchPriority="high" className="absolute inset-0 -z-20 h-full w-full object-cover object-[68%_center] opacity-90 sm:object-center"/>
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(13,22,70,.97)_0%,rgba(22,29,82,.91)_34%,rgba(38,31,75,.62)_62%,rgba(17,23,69,.44)_100%)] sm:bg-[linear-gradient(90deg,rgba(13,22,70,.94)_0%,rgba(22,29,82,.80)_38%,rgba(34,36,91,.52)_64%,rgba(15,25,75,.48)_100%)]"/>
      <div className="absolute inset-y-0 right-0 -z-10 hidden w-[54%] bg-[linear-gradient(90deg,transparent,rgba(16,28,82,.34)_30%,rgba(10,20,62,.62)_100%)] backdrop-blur-[2px] md:block" aria-hidden="true"/>
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#0b123a]/55 via-transparent to-white/5"/>
      <div className="mx-auto grid min-h-[520px] max-w-7xl items-center gap-8 px-5 py-14 sm:min-h-[590px] sm:px-8 md:grid-cols-[1.08fr_.92fr] lg:min-h-[650px] lg:gap-10 lg:px-10"><div className="max-w-2xl text-white"><p className="text-sm font-bold tracking-[0.18em] text-cyan-200">6–18岁青少年完整AI素养成长体系</p><h1 className="mt-4 max-w-[11em] text-4xl font-black leading-[1.12] tracking-[-0.045em] drop-shadow-[0_5px_22px_rgba(3,21,72,.48)] sm:text-5xl lg:text-6xl">AI时代，给孩子一个确定的未来</h1><div className="mt-6 flex flex-wrap gap-2.5" aria-label="四项AI核心能力">{['理解AI','判断AI','驾驭AI','创造AI'].map((item,index) => <span key={item} className={`rounded-full border px-3 py-1.5 text-xs font-bold backdrop-blur-sm ${['border-cyan-200/40 bg-cyan-300/15 text-cyan-100','border-emerald-200/40 bg-emerald-300/15 text-emerald-100','border-amber-200/40 bg-amber-300/15 text-amber-100','border-violet-200/40 bg-violet-300/15 text-violet-100'][index]}`}>{item}</span>)}</div><p className="mt-5 max-w-xl text-sm leading-6 text-white/75">对标义务教育人工智能教育要求 · 参考 UNESCO / OECD / IOAI 国际AI素养框架</p><div className="mt-8 flex flex-col gap-3 sm:flex-row md:items-stretch"><Link to="/events/ai-test?category=comprehensive" className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 text-sm font-black text-white shadow-[0_10px_24px_rgba(249,115,22,.28)] transition hover:bg-orange-600 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-white">15分钟AI能力测评 <LinkArrow/></Link><LeadCaptureTrigger leadKey="growth-plan" label="领取分龄学习方案" title="领取专属分龄学习方案" className="min-h-12 cursor-pointer rounded-xl border border-white/55 bg-white/10 px-6 text-sm font-black text-white backdrop-blur-sm transition hover:bg-white/20 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-white"/></div><p className="mt-3 text-xs font-medium text-white/65">免费定位孩子AI能力水平 · 获取专属成长规划</p></div><IntroVideoCard/></div>
    </section>

    <main id="home-content">
      <section className="bg-[#f5f9ff] py-16 sm:py-20"><div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10"><SectionHeading eyebrow="LEARNING JOURNEY" title="三步完整成长闭环" subtitle="从规划到学习再到成果，每一步都有清晰路径和明确产出。"/><JourneyMap/></div></section>

      <section className="py-16 sm:py-24"><div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10"><SectionHeading eyebrow="AI CAPABILITY COURSES" title="为每个成长阶段，准备一门好课" subtitle="四阶九星体系化教学，循序渐进提升理解、判断、驾驭与创造AI的能力。"/><div className="mx-auto mb-5 flex max-w-full justify-start overflow-x-auto pb-2 sm:justify-center" role="tablist" aria-label="课程阶段"><div className="inline-flex min-w-max rounded-2xl bg-slate-100 p-1.5">{COURSE_LEVELS.map(level => { const active = level.id === activeLevel; return <button key={level.id} type="button" role="tab" aria-selected={active} aria-controls={`course-panel-${level.id}`} onClick={() => { setActiveLevel(level.id); setCourseRotationStopped(true) }} className={`min-h-11 cursor-pointer rounded-xl px-4 text-sm font-black transition sm:px-6 ${active ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-blue-700'}`}>{level.label}<span className="ml-1 text-xs">({level.range})</span></button> })}</div></div><p className="mb-9 text-center text-sm font-semibold text-slate-500">{currentLevel.label} · {currentLevel.descriptor}</p><div id={`course-panel-${currentLevel.id}`} role="tabpanel" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{currentLevel.courses.map((course, index) => <CourseCard key={`${course.level}-${index}`} course={course}/>)}</div><div className="mt-10 text-center"><Link to="/courses" className="group inline-flex min-h-12 items-center gap-2 rounded-xl bg-orange-500 px-7 text-sm font-black text-white shadow-[0_10px_24px_rgba(249,115,22,.2)] transition hover:-translate-y-0.5 hover:bg-orange-600 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-orange-500">查看完整课程体系 <LinkArrow/></Link></div></div></section>

      <section className="bg-slate-50 py-16 sm:py-20"><div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10"><SectionHeading eyebrow="WHY BINGO ACADEMY" title="为什么选择缤果AI学院" subtitle="专业教研体系与权威标准对标，让孩子的AI学习更系统、更有效。"/><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{ADVANTAGES.map(({title,desc,icon}) => <article key={title} className="rounded-3xl border border-slate-100 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-md"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-xl text-blue-700">{createElement(icon, {'aria-hidden':true})}</span><h3 className="mt-5 text-lg font-black text-slate-950">{title}</h3><p className="mt-2 text-sm leading-7 text-slate-600">{desc}</p></article>)}</div></div></section>

      <section className="py-16 sm:py-24"><div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10"><SectionHeading eyebrow="TRUST & EXPERTISE" title="权威背书，专业可信赖" subtitle="以国内教育要求为基础，吸收国际AI素养框架的先进理念。"/><div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-5">{[['UNESCO','学生人工智能能力框架'],['OECD','AI素养评估研究'],['IOAI','国际人工智能教育实践'],['新课标','国内人工智能教育要求']].map(([name,desc]) => <div key={name} className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5 text-center"><strong className="text-lg text-blue-700 sm:text-xl">{name}</strong><p className="mt-2 text-xs leading-5 text-slate-600">{desc}</p></div>)}</div><h3 className="mb-6 mt-14 text-center text-xl font-black text-slate-950">政策与学习指南</h3><GuideMarquee/>
        <div className="mt-14 overflow-hidden rounded-[32px] border border-blue-100 bg-gradient-to-br from-white via-blue-50/35 to-violet-50/50 shadow-[0_14px_36px_rgba(37,99,235,.08)]">
          <div className="grid items-center gap-8 p-6 sm:p-9 lg:grid-cols-[.9fr_1.1fr]"><div className="aspect-[10/7] overflow-hidden rounded-2xl"><CoverageMap/></div><div className="min-w-0"><p className="text-xs font-black tracking-[0.15em] text-blue-600">TEACHING MATERIALS</p><h3 className="mt-3 text-2xl font-black text-slate-950 sm:text-3xl">配套教材覆盖全国12个省份</h3><p className="mt-4 text-sm leading-7 text-slate-600">联合专业出版与教育合作伙伴推进AI素养配套教材，让体系化课程走进更多学校和课堂。下方按地区展示代表性教材，形成清晰的全国教材成果矩阵。</p><div className="mb-4 mt-6"><h3 className="text-xl font-black text-slate-950">地方教材展示</h3></div><TextbookMarquee/></div></div>
        </div>
      </div></section>

      <section className="relative isolate overflow-hidden py-16 text-white sm:py-20">
        <img src={aiFutureCtaBackground} alt="" width="1716" height="920" loading="lazy" className="absolute inset-0 -z-20 h-full w-full object-cover object-center"/>
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(15,48,120,.94)_0%,rgba(29,78,216,.82)_52%,rgba(8,145,178,.62)_100%)]" aria-hidden="true"/>
        <div className="mx-auto max-w-4xl px-5 text-center sm:px-8"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-white/15 bg-white/15 text-2xl backdrop-blur-sm"><BulbOutlined aria-hidden="true"/></span><h2 className="mt-5 text-2xl font-black drop-shadow-sm sm:text-4xl">给孩子一个拥抱AI未来的机会</h2><p className="mt-3 text-sm text-white/85 sm:text-base">免费领取AI能力测评 + 专属分龄学习方案</p><div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Link to="/events/ai-test?category=comprehensive" className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-orange-500 px-7 text-sm font-black text-white shadow-lg transition hover:bg-orange-600 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-white">立即开始免费测评 <LinkArrow/></Link><LeadCaptureTrigger leadKey="growth-plan" label="领取分龄学习方案" title="领取专属分龄学习方案" className="min-h-12 cursor-pointer rounded-xl border border-white/60 bg-white px-7 text-sm font-black text-blue-700 transition hover:bg-blue-50 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-white"/></div><p className="mt-4 text-xs text-white/75">提交后，专属规划师将在1个工作日内与您联系</p></div>
      </section>

      <section className="bg-slate-950 py-16 text-white sm:py-24"><div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10"><SectionHeading dark eyebrow="PARTNER WITH US" title="把AI教育带到更多孩子身边" subtitle="面向公立校、教培机构与活动主办方，提供全链路合作支持。"/><div className="grid gap-5 md:grid-cols-3">{PARTNERS.map(({title,desc,icon}) => <article key={title} className="rounded-3xl border border-white/10 bg-white/[.06] p-6"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-400/15 text-xl text-cyan-200">{createElement(icon, {'aria-hidden':true})}</span><h3 className="mt-5 text-lg font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{desc}</p></article>)}</div><div className="mt-9 flex flex-col items-center justify-between gap-5 rounded-3xl border border-white/10 bg-white/[.04] p-6 sm:flex-row"><p className="text-sm font-semibold text-slate-300">课程输出 · 师资培训 · 运营物料 · 赛事资源 · 品牌支持</p><Link to="/franchise" className="group inline-flex min-h-12 shrink-0 items-center gap-2 rounded-xl bg-white px-6 text-sm font-black text-slate-900 transition hover:bg-cyan-50 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-white">获取完整合作方案 <LinkArrow/></Link></div></div></section>
    </main>
  </div>
}
