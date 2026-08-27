import {
  ApartmentOutlined, ArrowRightOutlined, BankOutlined, BookOutlined,
  BuildOutlined, CheckCircleFilled, CloudServerOutlined, CrownOutlined,
  DashboardOutlined, FileImageOutlined, FileTextOutlined, GlobalOutlined,
  GoldOutlined, LineChartOutlined, LockOutlined, MailOutlined, MobileOutlined,
  PhoneOutlined, PlayCircleOutlined, RocketOutlined, SafetyCertificateOutlined,
  ShareAltOutlined, ShopOutlined, SolutionOutlined, StarOutlined, TeamOutlined,
  TrophyOutlined, UserOutlined, VideoCameraOutlined, WifiOutlined,
} from '@ant-design/icons'
import { createElement, useState } from 'react'
import { Link } from 'react-router-dom'
import FranchiseLegacyLeadModal from '../components/FranchiseLegacyLeadModal'

const STATS = [['500+', '全国合作机构'], ['60%', '营收平均提升'], ['100+', '品牌加盟商'], ['92%', '家长满意度']]

const TRACK_REASONS = [
  { title: '确定性成长刚需', desc: 'AI素养是数字时代青少年核心能力，家长认知度与学习需求持续增长。', icon: LineChartOutlined },
  { title: '纯素养合规经营', desc: '聚焦素养教育，适配各类线下教育主体与线上流量渠道。', icon: SafetyCertificateOutlined },
  { title: '低门槛快速落地', desc: '标准化内容交付，降低师资依赖和启动成本，轻资产开启新品类。', icon: RocketOutlined },
]

const OFFLINE_TYPES = [
  { title: '种子合作机构', badge: '全国限量50家', icon: CrownOutlined, threshold: '零加盟费，低额课时预充，通过总部标准化师训考核', rights: ['终身享有专项课程分润', '优先锁定所在区域代理权', '总部一对一运营陪跑', '深圳试点享驻场帮扶'], fit: '有存量学员基础、希望快速打造本地标杆的优质机构', featured: true },
  { title: '普通合作机构', icon: BankOutlined, threshold: '可退履约保证金，低额课时预充，通过标准化师训考核', rights: ['享受标准课程分润比例', '全品类素养产品授权', '总部标准化全链路扶持', '规范区域保护政策'], fit: '希望新增素养品类、盘活存量学员的线下教育机构' },
  { title: '城市区域代理', icon: GlobalOutlined, threshold: '合规押金制，具备属地运营服务能力与本地教育资源', rights: ['独家管辖属地线下合作机构', '辖区线下业务固定分润', '招商与运营双重收益', '总部招商流量倾斜支持'], fit: '具备本地教育资源、希望深耕区域市场的合作方' },
]

const OFFLINE_SCENES = [
  {
    title: '校区场景升级',
    image: '/franchise/campus-upgrade.png',
    alt: '配备AI学习设备与机器人教具的现代化校区卡通场景',
  },
  {
    title: '标准化师训支持',
    image: '/franchise/teacher-training.png',
    alt: '讲师带领教师开展机器人课程实训的卡通场景',
  },
  {
    title: '存量学员增收',
    image: '/franchise/student-growth.png',
    alt: '学员携带AI实践作品沿成长阶梯前进的卡通场景',
  },
]

const CHANNELS = [
  { title: '渠道公司', desc: '教育类流量公司、企业服务团队，批量搭建分销矩阵', icon: ApartmentOutlined },
  { title: '自媒体达人', desc: '教育博主、母婴达人，通过内容种草实现粉丝转化', icon: VideoCameraOutlined },
  { title: '机构任课老师', desc: '依托专业信任背书，服务学员家长稳定增收', icon: SolutionOutlined },
  { title: '宝妈私域团队', desc: '宝妈群主、社群团长，通过私域分享开启副业', icon: TeamOutlined },
]

const ONLINE_COLUMNS = [
  { title: '合作核心优势', icon: StarOutlined, items: [
    ['零门槛轻资产', '无场地、无师资、无需垫资囤货，有流量即可启动', RocketOutlined],
    ['全品类分销权', '一次入驻，解锁成长包、体验平台与素养增值产品', ShopOutlined],
    ['透明高额分润', '系统自动跟单结算，订单和收益实时可查', LineChartOutlined],
    ['总部全链兜底', '内容研发、技术运维、客服售后与品牌合规由总部负责', SafetyCertificateOutlined],
  ]},
  { title: '渠道专属扶持', icon: CloudServerOutlined, items: [
    ['全套素材支持', '定期更新海报、文案、短视频及直播脚本', FileImageOutlined],
    ['运营玩法指导', '社群转化、达人带货和私域裂变系统培训', PlayCircleOutlined],
    ['专属数据后台', '实时查看订单、收益与分销团队数据', DashboardOutlined],
    ['官方品牌授权', '正规品牌授权与完整资质支持', GoldOutlined],
  ]},
]

const SUPPORT_COLUMNS = [
  { title: '线下机构专属扶持', icon: BankOutlined, items: [
    ['内容体系赋能', '九级课程、教案课件与教学SOP完整交付', BookOutlined],
    ['教学能力赋能', '全流程师训、教学督导与教研同步更新', UserOutlined],
    ['运营招生赋能', '全年活动方案、招生物料与转化话术', ShareAltOutlined],
    ['成长成果赋能', '官方星级认证与实践活动授权', TrophyOutlined],
    ['硬件方案赋能', '多套灵活硬件方案降低落地试错成本', MobileOutlined],
    ['区域权益保障', '规范区域保护，保障合作伙伴经营权益', GlobalOutlined],
  ]},
  { title: '线上渠道专属扶持', icon: WifiOutlined, items: [
    ['分销素材支持', '图文、短视频与直播全场景素材更新', FileImageOutlined],
    ['运营玩法培训', '私域、社群与内容带货系统化培训', PlayCircleOutlined],
    ['技术系统支持', '独立分销后台与自动化订单结算', CloudServerOutlined],
    ['合规风控支持', '统一宣传规范，品牌与法务协同支持', LockOutlined],
  ]},
]

const PARTNERSHIP_FLOW = [['提交申请', '填写基本信息并选择线下机构或线上渠道合作类型'], ['资质审核', '总部评估合作基础、资源条件与合规资质'], ['方案匹配', '按合作类型确认课程、渠道与对应支持方案'], ['签约开通', '签订合作协议并开通专属管理后台'], ['培训部署', '完成师训或运营培训，交付课程与推广资源'], ['启动运营', '正式开展业务，总部持续督导并支持结算']]

const POLICIES = [
  { title: '线下机构专属福利', icon: BankOutlined, items: ['新签约种子机构免加盟费，赠送首期师资培训名额', '深圳试点机构享总部驻场帮扶，落地首期标杆班', '前20家签约机构赠送招生运营物料包与运营诊断'] },
  { title: '线上渠道专属福利', icon: ShareAltOutlined, items: ['前50名入驻渠道免首年渠道服务费，保证金减半', '新入驻渠道首月达标，获得流量扶持与素材定制', '优质渠道可升级战略伙伴，享受更高分润与专属陪跑'] },
]

function SectionHeading({ eyebrow, title, subtitle }) {
  return <div className="mx-auto mb-12 max-w-3xl text-center"><span className="inline-flex rounded-full bg-blue-50 px-4 py-1.5 text-xs font-black tracking-[.12em] text-blue-700">{eyebrow}</span><h2 className="mt-5 text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl">{title}</h2><p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">{subtitle}</p></div>
}

function IconBox({ icon, tone = 'from-blue-600 to-violet-600', size = 'h-12 w-12' }) {
  return <span className={`grid ${size} shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${tone} text-xl text-white shadow-sm`}>{createElement(icon, { 'aria-hidden': true })}</span>
}

function CheckList({ items, accent = 'text-blue-600', textTone = 'text-slate-700' }) {
  return <ul className="space-y-2.5">{items.map(item => <li key={item} className={`flex gap-2.5 text-sm leading-6 ${textTone}`}><CheckCircleFilled aria-hidden="true" className={`mt-1 ${accent}`}/><span>{item}</span></li>)}</ul>
}

function PartnershipFlow() {
  return <div className="relative overflow-hidden rounded-[32px] border border-blue-100 bg-gradient-to-br from-blue-50/80 via-white to-emerald-50/80 p-6 shadow-[0_18px_48px_rgba(30,64,175,.09)] sm:p-9">
    <div className="absolute left-[9%] right-[9%] top-[61px] hidden h-1 rounded-full bg-gradient-to-r from-blue-500 via-violet-500 to-emerald-500 lg:block" aria-hidden="true"/>
    <ol className="relative grid gap-5 lg:grid-cols-6 lg:gap-4">{PARTNERSHIP_FLOW.map(([name, desc], index) => <li key={name} className="relative flex gap-4 rounded-2xl border border-white bg-white/90 p-4 shadow-sm lg:flex-col lg:items-center lg:border-0 lg:bg-transparent lg:p-0 lg:text-center lg:shadow-none">
      {index < PARTNERSHIP_FLOW.length - 1 ? <span className="absolute bottom-[-21px] left-[35px] h-5 w-0.5 bg-gradient-to-b from-blue-300 to-violet-300 lg:hidden" aria-hidden="true"/> : null}
      <span className="relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-blue-600 via-violet-600 to-emerald-500 text-sm font-black text-white shadow-md ring-4 ring-white lg:h-14 lg:w-14">{String(index + 1).padStart(2, '0')}</span>
      <div className="pt-0.5 lg:pt-3"><h3 className="font-black text-slate-950">{name}</h3><p className="mt-1.5 text-xs leading-5 text-slate-600">{desc}</p></div>
    </li>)}</ol>
  </div>
}

export default function Franchise() {
  const [leadModal, setLeadModal] = useState(null)
  return <div className="overflow-hidden bg-white text-slate-800">
    <header className="relative overflow-hidden bg-gradient-to-br from-[#f5f7ff] via-white to-[#edfdf9] py-16 sm:py-24">
      <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-blue-300/20 blur-3xl"/>
      <div className="absolute -right-28 bottom-0 h-80 w-80 rounded-full bg-violet-300/20 blur-3xl"/>
      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 sm:px-8 md:grid-cols-[1.05fr_.95fr] lg:gap-12 lg:px-10">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-4 py-2 text-xs font-bold text-blue-700 shadow-sm"><StarOutlined aria-hidden="true" className="text-amber-500"/>青少年完整AI素养成长体系</span>
          <h1 className="mt-6 text-4xl font-black leading-[1.12] tracking-[-.045em] text-slate-950 sm:text-6xl">AI时代素养教育<br/><span className="bg-gradient-to-r from-blue-600 via-violet-600 to-emerald-500 bg-clip-text text-transparent">机构增长确定未来</span></h1>
          <p className="mt-6 text-base font-medium leading-8 text-slate-600 sm:text-lg">L1–L9 九级星级成长闭环 · 线上线下双轨盈利<br className="hidden sm:block"/>零加盟费轻量入局 · 全链路总部一站式支持</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a href="#offline" className="inline-flex min-h-13 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 font-black text-white shadow-[0_12px_28px_rgba(79,70,229,.24)] transition hover:-translate-y-0.5">线下机构合作方案 <ArrowRightOutlined aria-hidden="true"/></a>
            <a href="#online" className="inline-flex min-h-13 items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-white px-6 font-black text-blue-700 shadow-sm transition hover:bg-blue-50">线上渠道入驻申请 <ArrowRightOutlined aria-hidden="true"/></a>
          </div>
        </div>
        <div className="relative hidden aspect-[4/3] overflow-hidden rounded-[36px] border border-blue-100 bg-gradient-to-br from-blue-100 via-violet-50 to-emerald-100 shadow-[0_24px_60px_rgba(30,64,175,.14)] md:block">
          <img src="/franchise/franchise-partnership-hero.png" alt="校区负责人和总部顾问共同规划AI课程合作方案" width="1200" height="900" fetchPriority="high" className="h-full w-full object-cover"/>
        </div>
      </div>
      <div className="relative mx-auto mt-14 grid max-w-7xl grid-cols-2 gap-3 px-5 sm:grid-cols-4 sm:px-8 lg:px-10">{STATS.map(([value,label]) => <div key={label} className="rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-[0_10px_28px_rgba(15,23,42,.07)]"><strong className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-3xl font-black text-transparent sm:text-4xl">{value}</strong><p className="mt-2 text-xs font-semibold text-slate-500 sm:text-sm">{label}</p></div>)}</div>
      <div className="relative mx-auto mt-8 flex justify-center px-5 sm:px-8"><Link to="/franchise-partner/login" className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 px-7 text-sm font-black text-white shadow-[0_12px_28px_rgba(16,185,129,.28)] transition hover:-translate-y-0.5 hover:from-emerald-600 hover:to-cyan-600 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-emerald-500"><LockOutlined aria-hidden="true"/>加盟商登录 <ArrowRightOutlined aria-hidden="true" className="transition group-hover:translate-x-1"/></Link></div>
    </header>

    <main>
      <section id="product" className="scroll-mt-28 py-20 sm:py-24"><div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10"><SectionHeading eyebrow="把握时代红利" title="一套完整AI素养体系，解锁线下线上双线增长" subtitle="纯素养赛道合规经营，标准化内容低门槛落地；一份合作同时开启线下校区与线上流量双重增收通道。"/><div className="grid items-center gap-10 lg:grid-cols-2"><div className="space-y-4"><h3 className="mb-6 text-2xl font-black text-slate-950">为什么选择AI素养赛道</h3>{TRACK_REASONS.map(({title,desc,icon}, index) => <article key={title} className="flex gap-4 rounded-2xl bg-slate-50 p-5 transition hover:bg-blue-50"><IconBox icon={icon} tone={['from-blue-600 to-violet-600','from-emerald-500 to-cyan-500','from-orange-500 to-amber-400'][index]}/><div><h4 className="font-black text-slate-900">{title}</h4><p className="mt-1 text-sm leading-6 text-slate-600">{desc}</p></div></article>)}</div><div className="rounded-[32px] bg-gradient-to-br from-blue-50 via-violet-50 to-emerald-50 p-7 sm:p-9"><h3 className="text-center text-xl font-black text-slate-950">青少年完整AI素养成长体系</h3><div className="mt-8 space-y-5">{[['L1–L3','启智阶','w-1/3','from-emerald-400 to-cyan-500'],['L4–L6','基础阶','w-2/3','from-blue-500 to-violet-500'],['L7–L9','精研 · 智创','w-full','from-violet-500 to-fuchsia-500']].map(([level,label,width,tone]) => <div key={level} className="grid grid-cols-[64px_1fr_76px] items-center gap-3"><span className={`grid h-12 place-items-center rounded-full bg-gradient-to-br ${tone} text-xs font-black text-white shadow-md`}>{level}</span><span className="h-3 overflow-hidden rounded-full bg-white"><i className={`block h-full ${width} rounded-full bg-gradient-to-r ${tone}`}/></span><strong className="text-sm text-slate-600">{label}</strong></div>)}</div><div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">{[[DashboardOutlined,'能力测评'],[BookOutlined,'学习实训'],[SafetyCertificateOutlined,'星级认证'],[TrophyOutlined,'实践舞台']].map(([icon,label]) => <div key={label} className="rounded-xl bg-white p-4 text-center shadow-sm"><span className="mx-auto grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-blue-700">{createElement(icon, {'aria-hidden':true})}</span><p className="mt-2 text-xs font-black text-slate-700">{label}</p></div>)}</div></div></div></div></section>

      <section id="offline" className="scroll-mt-28 bg-gradient-to-b from-white to-blue-50/60 py-20 sm:py-24"><div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10"><SectionHeading eyebrow="线下机构合作" title="植入完整素养体系，打造校区盈利新增量" subtitle="适配托管、艺培、研学、AI自习室等线下教育主体，盘活存量学员，低成本开启第二增长曲线。"/><div className="mb-12 grid gap-5 md:grid-cols-3">{OFFLINE_SCENES.map(({title,image,alt}) => <figure key={title} className="group overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-[0_14px_34px_rgba(30,64,175,.10)]"><div className="aspect-[16/9] overflow-hidden bg-blue-50"><img src={image} alt={alt} width="1200" height="675" loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035] motion-reduce:transition-none"/></div><figcaption className="flex min-h-20 flex-col items-center justify-center gap-2 border-t border-blue-50 px-5 py-4 text-center"><span aria-hidden="true" className="h-1 w-8 rounded-full bg-gradient-to-r from-blue-600 to-violet-500"/><strong className="text-lg font-black tracking-wide text-slate-900 sm:text-xl">{title}</strong></figcaption></figure>)}</div><div className="grid gap-6 lg:grid-cols-3">{OFFLINE_TYPES.map(({title,badge,icon,threshold,rights,fit,featured}) => <article key={title} className={`relative flex flex-col rounded-3xl bg-white p-7 shadow-[0_12px_34px_rgba(15,23,42,.08)] ${featured ? 'border-2 border-blue-500' : 'border border-slate-100'}`}>{badge ? <span className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-1.5 text-xs font-black text-white shadow-md">{badge}</span> : null}<IconBox icon={icon} size="h-14 w-14"/><h3 className="mt-5 text-xl font-black text-slate-950">{title}</h3><p className="mt-5 text-xs font-bold text-slate-400">准入门槛</p><p className="mt-2 text-sm leading-6 text-slate-700">{threshold}</p><p className="mt-5 text-xs font-bold text-slate-400">核心权益</p><div className="mt-3"><CheckList items={rights}/></div><p className="mt-auto border-t border-slate-100 pt-5 text-xs leading-5 text-slate-500">适配：{fit}</p></article>)}</div><div className="mt-7 rounded-2xl border border-blue-100 bg-white p-5 text-center text-sm leading-6 text-slate-600">所有线下合作机构均可同步申请线上分销渠道资质，一份合作，双线收益。</div></div></section>

      <section id="online" className="scroll-mt-28 py-20 sm:py-24"><div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10"><SectionHeading eyebrow="线上渠道分销" title="轻资产解锁管道收益，有流量就能稳定增收" subtitle="无需场地、无需师资、零囤货；全品类AI素养产品一键分销，多种主体均可入驻。"/><div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{CHANNELS.map(({title,desc,icon}) => <article key={title} className="rounded-3xl bg-gradient-to-br from-blue-50 to-violet-50 p-5 text-center sm:p-7"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-white text-xl text-blue-700 shadow-sm">{createElement(icon, {'aria-hidden':true})}</span><h3 className="mt-4 font-black text-slate-950">{title}</h3><p className="mt-2 text-xs leading-5 text-slate-600 sm:text-sm sm:leading-6">{desc}</p></article>)}</div><div className="mt-14 grid gap-10 lg:grid-cols-2">{ONLINE_COLUMNS.map(({title,icon,items}) => <div key={title}><h3 className="mb-6 flex items-center gap-3 text-xl font-black text-slate-950"><span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600">{createElement(icon, {'aria-hidden':true})}</span>{title}</h3><div className="space-y-4">{items.map(([name,desc,itemIcon]) => <article key={name} className="flex gap-4 rounded-2xl bg-slate-50 p-5"><IconBox icon={itemIcon} tone="from-emerald-500 to-cyan-500"/><div><h4 className="font-black text-slate-900">{name}</h4><p className="mt-1 text-sm leading-6 text-slate-600">{desc}</p></div></article>)}</div></div>)}</div></div></section>

      <section id="support" className="scroll-mt-28 bg-slate-50 py-20 sm:py-24"><div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10"><SectionHeading eyebrow="总部赋能" title="总部全链条赋能，零基础落地无忧" subtitle="从内容到运营，从教学到技术，为线下校区和线上渠道提供对应支持。"/><div className="grid gap-7 lg:grid-cols-2">{SUPPORT_COLUMNS.map(({title,icon,items}, columnIndex) => <article key={title} className="rounded-3xl bg-white p-6 shadow-sm sm:p-8"><h3 className="flex items-center gap-3 text-xl font-black text-slate-950"><IconBox icon={icon} tone={columnIndex ? 'from-emerald-500 to-cyan-500' : 'from-blue-600 to-violet-600'}/>{title}</h3><div className="mt-7 grid gap-4 sm:grid-cols-2">{items.map(([name,desc,itemIcon]) => <div key={name} className="rounded-2xl bg-slate-50 p-4"><span className={`text-xl ${columnIndex ? 'text-emerald-600' : 'text-blue-700'}`}>{createElement(itemIcon, {'aria-hidden':true})}</span><h4 className="mt-3 text-sm font-black text-slate-900">{name}</h4><p className="mt-1 text-xs leading-5 text-slate-600">{desc}</p></div>)}</div></article>)}</div><div className="mt-8 rounded-3xl bg-gradient-to-r from-blue-100 via-violet-100 to-emerald-100 p-7 text-center"><h3 className="text-xl font-black text-slate-950">通用品牌与技术支持</h3><p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-slate-600">品牌全域曝光、行业峰会与公益报道多维赋能；独立后台打通学情、订单与财务结算；7×12小时技术售后支持，全程协同。</p></div></div></section>

      <section id="process" className="scroll-mt-28 py-20 sm:py-24"><div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10"><SectionHeading eyebrow="合作流程" title="标准化合作流程" subtitle="线上线下统一申请入口，六步完成匹配、开通与落地。"/><PartnershipFlow/></div></section>

      <section className="relative overflow-hidden bg-gradient-to-r from-blue-700 via-violet-700 to-emerald-600 py-16 text-white sm:py-20"><div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"/><div className="relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10"><div className="mb-10 text-center"><h2 className="text-3xl font-black sm:text-4xl">限时专属合作政策</h2><p className="mt-3 text-white/75">名额有限，先到先得</p></div><div className="grid gap-6 lg:grid-cols-2">{POLICIES.map(({title,icon,items}) => <article key={title} className="rounded-3xl border border-white/20 bg-white/10 p-7 backdrop-blur-md"><h3 className="flex items-center gap-3 text-xl font-black"><span className="grid h-11 w-11 place-items-center rounded-xl bg-white/15">{createElement(icon, {'aria-hidden':true})}</span>{title}</h3><div className="mt-6"><CheckList items={items} accent="text-amber-300" textTone="text-white/90"/></div></article>)}</div></div></section>

      <section className="bg-slate-50 py-20"><div className="mx-auto grid max-w-7xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:px-10"><div><p className="text-xs font-black tracking-[.14em] text-blue-700">FREE RESOURCE PACK</p><h2 className="mt-3 text-3xl font-black text-slate-950">专属资料包免费领取</h2><p className="mt-4 text-sm leading-7 text-slate-600">深度了解AI素养转型玩法、运营实操与分销落地。</p><ul className="mt-6 space-y-3">{['《教培机构AI教育转型全攻略》','《AI课程机构运营实操手册》','免费公开课·合作政策+盈利模式解析'].map(item => <li key={item} className="flex items-center gap-3 text-sm font-semibold text-slate-700"><span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-blue-700"><FileTextOutlined aria-hidden="true"/></span>{item}</li>)}</ul><button type="button" onClick={() => setLeadModal('免费获取机构AI教育转型资料包')} className="mt-8 min-h-12 cursor-pointer rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-7 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5">立即免费领取</button></div><div className="rounded-3xl bg-white p-7 shadow-[0_14px_38px_rgba(15,23,42,.08)] sm:p-9"><h2 className="text-2xl font-black text-slate-950">商务咨询通道</h2><div className="mt-7 space-y-5"><a href="tel:400-xxx-xxxx" className="flex items-center gap-4 rounded-2xl p-2 transition hover:bg-blue-50"><IconBox icon={PhoneOutlined}/><span><small className="block text-xs text-slate-500">机构合作热线</small><strong className="mt-1 block text-slate-900">400-xxx-xxxx</strong></span></a><a href="https://work.weixin.qq.com/kfid/kfc65e712f1de26573a" target="_blank" rel="noopener noreferrer" aria-label="打开B端商务微信客服" className="flex items-center gap-4 rounded-2xl p-2 transition hover:bg-emerald-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"><IconBox icon={ShareAltOutlined} tone="from-emerald-500 to-cyan-500"/><span><small className="block text-xs text-slate-500">B端商务微信</small><strong className="mt-1 block text-emerald-700">点击打开企业微信客服</strong></span><ArrowRightOutlined aria-hidden="true" className="ml-auto text-emerald-600"/></a><a href="mailto:contact@bingoacademy.cn" className="flex items-center gap-4 rounded-2xl p-2 transition hover:bg-blue-50"><IconBox icon={MailOutlined}/><span><small className="block text-xs text-slate-500">合作邮箱</small><strong className="mt-1 block text-slate-900">contact@bingoacademy.cn</strong></span></a></div><button type="button" onClick={() => setLeadModal('免费获取机构合作方案')} className="mt-7 min-h-12 w-full cursor-pointer rounded-xl bg-blue-600 px-5 text-sm font-black text-white transition hover:bg-blue-700">获取合作方案</button></div></div></section>
    </main>
    {leadModal ? <FranchiseLegacyLeadModal title={leadModal} onClose={() => setLeadModal(null)}/> : null}
  </div>
}
