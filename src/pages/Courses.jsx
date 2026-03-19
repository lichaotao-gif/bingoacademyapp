import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import PaymentModal from '../components/PaymentModal'

// ─── 证书与课程关系数据 ───────────────────────────────────────
const CERT_PLANS = [
  {
    id: 'cert-l1',
    cert: 'AI精英启蒙认证',
    badge: '🌱',
    level: 'Level 1',
    color: 'from-cyan-500 to-sky-500',
    borderColor: 'border-cyan-300',
    bgColor: 'bg-cyan-50',
    activeColor: 'bg-cyan-500',
    desc: '适合 6–12岁，小学阶段 · AI素养基础认证',
    courses: [
      { name: '《AI启蒙：走进智能世界》', sub: '12课时 · 6-8岁', price: '¥299' },
      { name: '《AI工具小达人》', sub: '12课时 · 8-10岁', price: '¥299' },
      { name: '《AI创新小实验》', sub: '12课时 · 10-12岁', price: '¥399' },
    ],
    packageNote: '完成全部课程并通过考核，即可获得「AI精英启蒙认证」',
  },
  {
    id: 'cert-l2',
    cert: 'AI精英进阶认证',
    badge: '🚀',
    level: 'Level 2',
    color: 'from-primary to-cyan-600',
    borderColor: 'border-sky-300',
    bgColor: 'bg-sky-50',
    activeColor: 'bg-primary',
    desc: '适合 13–18岁，初高中阶段 · AI能力进阶认证',
    courses: [
      { name: '《AI基础原理与应用》', sub: '16课时 · 13-15岁', price: '¥698' },
      { name: '《机器学习入门与实战》', sub: '16课时 · 15-18岁', price: '¥698' },
      { name: '《AI竞赛培优课》', sub: '16课时 · 白名单赛事', price: '¥998' },
      { name: '《AI伦理与精英思维》', sub: '16课时 · 初高中通用', price: '¥698' },
    ],
    packageNote: '完成全部课程并通过考核，即可获得「AI精英进阶认证」，助力科技特长生升学',
  },
  {
    id: 'cert-l3',
    cert: 'AI精英实战认证',
    badge: '⚡',
    level: 'Level 3',
    color: 'from-indigo-500 to-blue-600',
    borderColor: 'border-indigo-300',
    bgColor: 'bg-indigo-50',
    activeColor: 'bg-indigo-500',
    desc: '适合 16–22岁，高中+大学阶段 · AI创新实战认证',
    courses: [
      { name: '《AI创新项目实战（通用方向）》', sub: '20课时 · 跨学科', price: '¥1280' },
      { name: '《AI视觉与机器人编程实战》', sub: '20课时 · 硬件+视觉', price: '¥1280' },
      { name: '《教育AI实战与开发》', sub: '20课时 · 教育科技', price: '¥1280' },
      { name: '《AI数据科学与可视化实战》', sub: '20课时 · 数据科学', price: '¥1280' },
    ],
    packageNote: '完成全部课程并通过考核，即可获得「AI精英实战认证」及科创论文/专利支持',
  },
  {
    id: 'cert-l4',
    cert: 'AI精英赋能认证',
    badge: '👑',
    level: 'Level 4',
    color: 'from-violet-500 to-purple-600',
    borderColor: 'border-violet-300',
    bgColor: 'bg-violet-50',
    activeColor: 'bg-violet-500',
    desc: '适合 20–28岁，大学+职场 · AI专项领域精英认证',
    courses: [
      { name: '《AI专项领域精通课》', sub: '24课时 · 3个细分赛道', price: '¥1680' },
      { name: '《AI创业实战工坊》', sub: '24课时 · 创业方向', price: '¥1680' },
      { name: '《AI内容创作与品牌变现》', sub: '24课时 · 内容创作', price: '¥1680' },
    ],
    packageNote: '完成全部课程并通过考核，即可获得「AI精英赋能认证」，衔接职场与创业赋能',
  },
]

function parsePrice(priceStr) {
  if (!priceStr || typeof priceStr !== 'string') return 0
  const num = parseInt(priceStr.replace(/[^\d]/g, ''), 10)
  return isNaN(num) ? 0 : num
}

function CertCoursePlan({ onSelectPackage }) {
  const [selectedCert, setSelectedCert] = useState('cert-l1')
  const plan = CERT_PLANS.find((c) => c.id === selectedCert)
  const packageTotal = plan ? plan.courses.reduce((sum, c) => sum + parsePrice(c.price), 0) : 0

  const handleSelectPackage = () => {
    if (plan && onSelectPackage) onSelectPackage({ plan, packageTotal })
  }

  return (
    <div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {CERT_PLANS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setSelectedCert(c.id)}
            className={[
              'rounded-xl border-2 p-4 text-left transition',
              selectedCert === c.id
                ? `${c.borderColor} ${c.bgColor} shadow-md`
                : 'border-slate-200 bg-white hover:border-slate-300',
            ].join(' ')}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{c.badge}</span>
              <span className={['text-xs font-bold px-2 py-0.5 rounded-full text-white bg-gradient-to-r', c.color].join(' ')}>{c.level}</span>
            </div>
            <p className="font-semibold text-bingo-dark text-sm leading-snug">{c.cert}</p>
            <p className="text-xs text-slate-500 mt-0.5">{c.desc}</p>
          </button>
        ))}
      </div>

      {plan && (
        <div className={['rounded-xl border-2 p-6', plan.borderColor, plan.bgColor].join(' ')}>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <span className={['text-xs font-bold px-2 py-0.5 rounded-full text-white bg-gradient-to-r mr-2', plan.color].join(' ')}>{plan.level}</span>
              <span className="font-bold text-bingo-dark">{plan.cert} · 系列课程包</span>
              {packageTotal > 0 && (
                <span className="ml-2 text-primary font-bold">套餐总价 ¥{packageTotal.toLocaleString()}</span>
              )}
            </div>
            <Link to="/cert" className="text-sm text-primary hover:underline">查看认证详情 →</Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            {plan.courses.map((course, i) => (
              <div key={i} className="bg-white rounded-lg border border-slate-100 p-4 flex items-start justify-between gap-3 hover:shadow-sm transition">
                <div>
                  <p className="font-medium text-bingo-dark text-sm">{course.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{course.sub}</p>
                </div>
                <span className="text-primary font-bold text-sm whitespace-nowrap">{course.price}</span>
              </div>
            ))}
          </div>
          <div className="bg-white/70 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-600">{plan.packageNote}</p>
            <div className="flex items-center gap-4 shrink-0">
              {packageTotal > 0 && (
                <span className="text-primary font-bold text-lg">¥{packageTotal.toLocaleString()}</span>
              )}
              <button type="button" onClick={handleSelectPackage} className="btn-primary text-sm px-5 py-2">一键选择此课程包</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// 课程类型标签样式
const COURSE_TYPE_STYLE = {
  体验: 'bg-emerald-100 text-emerald-700',
  实战: 'bg-orange-100 text-orange-700',
  创造: 'bg-indigo-100 text-indigo-700',
  学业: 'bg-sky-100 text-sky-700',
  认证: 'bg-violet-100 text-violet-700',
}

// ─── 课程卡片（统一样式）────────────────────────────────────
function CourseCard({ course, idx, accentColor, courseType, ageLabel, cover, isParentCourse, onBuyClick }) {
  const [coverError, setCoverError] = useState(false)
  const isFree = course.price === '免费' || course.price === '赠送'
  const isGift = course.price === '赠送'
  const showCover = cover && !coverError

  // 封面装饰图形（根据索引轮换，避免全部相同）
  const decorShapes = [
    // 右上散点
    <svg key="a" className="absolute right-0 top-0 opacity-20" width="120" height="120" viewBox="0 0 120 120" fill="none">
      <circle cx="100" cy="20" r="40" fill="white"/>
      <circle cx="30" cy="100" r="25" fill="white"/>
    </svg>,
    // 右下大圆
    <svg key="b" className="absolute -right-6 -bottom-6 opacity-15" width="140" height="140" viewBox="0 0 140 140" fill="none">
      <circle cx="100" cy="100" r="70" fill="white"/>
    </svg>,
    // 斜线纹理
    <svg key="c" className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice" fill="none">
      {[0,1,2,3,4,5,6,7].map(i => (
        <line key={i} x1={i*30-60} y1="0" x2={i*30+60} y2="120" stroke="white" strokeWidth="1.5"/>
      ))}
    </svg>,
    // 网格点
    <svg key="d" className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice">
      {[0,1,2,3,4].map(r => [0,1,2,3,4,5,6].map(c => (
        <circle key={`${r}-${c}`} cx={c*35} cy={r*30} r="2" fill="white"/>
      )))}
    </svg>,
  ]
  const decor = decorShapes[idx % decorShapes.length]

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col border border-slate-100 hover:-translate-y-0.5">
      {/* ── 封面图区域 ── */}
      <div className={`relative overflow-hidden ${showCover ? 'bg-slate-200' : `bg-gradient-to-br ${accentColor}`}`} style={{ aspectRatio: '16/9' }}>
        {showCover ? (
          <img src={cover} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" onError={() => setCoverError(true)} />
        ) : (
          decor
        )}

        {/* 免费/赠送标记 */}
        {isFree && (
          <span className="absolute top-3 right-3 z-10 text-[11px] bg-emerald-500 text-white px-2.5 py-1 rounded-full font-bold shadow-sm">
            {isGift ? '赠课' : 'FREE'}
          </span>
        )}

        {/* hover 时显示的查看提示 */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-xs font-semibold bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm">
            点击查看详情
          </span>
        </div>
      </div>

      {/* ── 卡片信息区 ── */}
      <div className="flex flex-col flex-1 px-4 pt-4 pb-4 gap-3">
        {/* 课程全名 + 适合人群 + 课程类型 + 副标题 */}
        <div>
          <h5 className="font-semibold text-bingo-dark text-sm leading-snug line-clamp-2">
            {course.name}
          </h5>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {isParentCourse && <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700">家长课</span>}
            {ageLabel && <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{ageLabel}</span>}
            {courseType && <span className={['text-[10px] px-2 py-0.5 rounded-full font-medium', COURSE_TYPE_STYLE[courseType] || 'bg-slate-100 text-slate-600'].join(' ')}>{courseType}</span>}
          </div>
          <p className="text-xs text-slate-400 mt-1">{course.sub}</p>
        </div>

        {/* 价格：具体金额，免费/赠送显示 0元 */}
        <div className="flex items-baseline gap-2">
          {isFree ? (
            <span className="text-lg font-bold text-emerald-600">0元</span>
          ) : (
            <>
              <span className="text-xl font-bold text-primary">{course.price}</span>
              {course.origPrice && (
                <span className="text-xs text-slate-400 line-through">{course.origPrice}</span>
              )}
            </>
          )}
        </div>

        {/* 按钮组 */}
        <div className="flex gap-2 mt-auto">
          <Link
            to={course.detailId ? `/courses/detail/${course.detailId}` : '/courses'}
            className="flex-1 text-center text-xs font-medium py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:border-primary hover:text-primary transition"
          >
            查看详情
          </Link>
          <button
            type="button"
            onClick={() => onBuyClick?.(course)}
            className={`flex-1 text-center text-xs font-bold py-2.5 rounded-xl transition ${
              isFree
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                : 'bg-primary hover:bg-primary/90 text-white'
            }`}
          >
            {isGift ? '领取赠课' : isFree ? '免费学习' : '立即购买'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── 课程分类 Tab ───────────────────────────────────────────
const COURSE_TABS = [
  { key: 'drain', label: '引流课', levelIds: ['free-trial'], parentIds: ['parent-99'] },
  { key: 'hot', label: 'AI爆品课', levelIds: ['hot'], parentIds: [] },
  { key: 'create', label: 'AI创造课', levelIds: ['level3', 'level4'], parentIds: [] },
  { key: 'academic', label: 'AI学业课', levelIds: ['literacy', 'contest', 'exam'], parentIds: [] },
  { key: 'ace', label: '缤果王牌课', levelIds: ['level1', 'level2'], parentIds: [] },
]

// ─── 学员四级课程体系 ───────────────────────────────────────
const STUDENT_LEVELS = [
  {
    id: 'free-trial',
    level: '免费',
    title: '免费试听课',
    tag: '免费体验',
    courseType: '体验',
    age: '全年龄段',
    color: 'from-emerald-400 to-teal-500',
    bg: 'bg-emerald-50 border-emerald-200/60',
    cover: 'https://picsum.photos/seed/freetrial/400/225',
    goal: '0元体验各等级精品课，感受缤果AI教学质量',
    desc: '每个学习层级均提供免费试听课程，让孩子和家长亲身体验课程质量。完成试听后可直接升级购买正式课程。',
    courses: [
      {
        name: '《AI是什么？——启蒙等级免费试听》',
        sub: '6-12岁 · Level 1 体验课 · 45分钟',
        price: '免费',
        classType: '小班直播',
        detailId: 'trial-l1',
      },
      {
        name: '《机器学习初体验——进阶等级免费试听》',
        sub: '13-18岁 · Level 2 体验课 · 45分钟',
        price: '免费',
        classType: '小班直播',
        detailId: 'trial-l2',
      },
      {
        name: '《AI项目实战——实战等级免费试听》',
        sub: '16-22岁 · Level 3 体验课 · 45分钟',
        price: '免费',
        classType: '小班直播',
        detailId: 'trial-l3',
      },
      {
        name: '《AI变现实战——精英等级免费试听》',
        sub: '20-28岁 · Level 4 体验课 · 45分钟',
        price: '免费',
        classType: '小班直播',
        detailId: 'trial-l4',
      },
    ],
  },
  {
    id: 'literacy',
    level: '素养',
    title: 'AI素养课',
    tag: 'AI素养',
    courseType: '学业',
    age: '6-15岁',
    color: 'from-sky-400 to-blue-500',
    bg: 'bg-sky-50 border-sky-200/60',
    cover: 'https://picsum.photos/seed/literacy/400/225',
    goal: '建立AI认知体系，培养AI思维与工具应用能力',
    desc: '聚焦AI素养培育，涵盖AI认知、工具应用、伦理思辨三大维度，对接2026年国家AI素养教育标准，适合6-15岁全阶段学习。',
    courses: [
      {
        name: '《AI认知启蒙课》',
        sub: '6-10岁 · 12课时 · 小学低中段',
        price: '¥299',
        origPrice: '¥399',
        classType: '小班直播',
        detailId: 'literacy-enlighten',
      },
      {
        name: '《AI工具应用课》',
        sub: '10-13岁 · 12课时 · 小学高段-初中',
        price: '¥399',
        origPrice: '¥499',
        classType: '小班直播',
        detailId: 'literacy-tools',
      },
      {
        name: '《AI伦理与素养思辨课》',
        sub: '12-15岁 · 12课时 · 初中段',
        price: '¥499',
        origPrice: '¥699',
        classType: '小班直播',
        detailId: 'literacy-ethics',
      },
    ],
  },
  {
    id: 'contest',
    level: '竞赛',
    title: '竞赛培优课',
    tag: '竞赛培优',
    courseType: '学业',
    age: '10-18岁',
    color: 'from-blue-500 to-indigo-600',
    bg: 'bg-blue-50 border-blue-200/60',
    cover: 'https://picsum.photos/seed/contest/400/225',
    goal: '精准对接AI类白名单赛事，全程辅导冲刺获奖',
    desc: '专注AI类权威赛事（蓝桥杯AI赛、全国青少年AI创新大赛等），获奖率92%，从赛事选择→项目培育→答辩演练一条龙服务。',
    courses: [
      {
        name: '《赛事入门基础班》',
        sub: '10-14岁 · 16课时 · 白名单赛事入门',
        price: '¥698',
        origPrice: '¥898',
        classType: '小班直播',
        detailId: 'contest-basic',
      },
      {
        name: '《赛事进阶集训营》',
        sub: '12-18岁 · 24课时 · 冲刺获奖',
        price: '¥1298',
        origPrice: '¥1598',
        classType: '小班直播',
        detailId: 'contest-advanced',
      },
      {
        name: '《竞赛答辩突击课》',
        sub: '12-18岁 · 8课时 · 赛前冲刺',
        price: '¥498',
        origPrice: '¥698',
        classType: '1v1',
        detailId: 'contest-sprint',
      },
    ],
  },
  {
    id: 'exam',
    level: '升学',
    title: '升学赋能课',
    tag: '升学赋能',
    courseType: '学业',
    age: '14-18岁',
    color: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50 border-violet-200/60',
    cover: 'https://picsum.photos/seed/exam/400/225',
    goal: '深度对接科技特长生升学政策，助力理想升学目标',
    desc: '聚焦2026年科技特长生（AI方向）升学路径，结合AI白名单赛事、自主招生、综合素质评价，提供完整解决方案。',
    courses: [
      {
        name: '《科技特长生升学规划课》',
        sub: '14-16岁 · 8课时 · 升学方向规划',
        price: '¥398',
        origPrice: '¥598',
        classType: '小班直播',
        detailId: 'exam-plan',
      },
      {
        name: '《AI特长生核心能力培养课》',
        sub: '15-18岁 · 20课时 · 系统能力提升',
        price: '¥1280',
        origPrice: '¥1580',
        classType: '小班直播',
        detailId: 'exam-ability',
      },
      {
        name: '《升学材料打包冲刺课》',
        sub: '16-18岁 · 12课时 · 升学材料准备',
        price: '¥998',
        origPrice: '¥1298',
        classType: '1v1',
        detailId: 'exam-material',
      },
    ],
  },
  {
    id: 'hot',
    level: '爆款',
    title: '爆款课程限时抢',
    tag: '限时特惠',
    courseType: '实战',
    age: '全年龄段',
    color: 'from-red-500 to-orange-500',
    bg: 'bg-orange-50 border-orange-200/60',
    cover: 'https://picsum.photos/seed/hot/400/225',
    goal: '精选三大独门爆款，从素养到竞赛到升学一站式覆盖',
    desc: '缤果AI学院核心打造的独家爆款课程，获奖率、升学率业内领先。限时促销，抢完为止。',
    courses: [
      {
        name: '《AI素养启蒙·面向未来的第一课》',
        sub: '6-10岁 · 8大AI认知模块',
        price: '¥299',
        origPrice: '¥399',
        classType: '小班直播',
        detailId: 'ai-enlighten',
      },
      {
        name: '《白名单赛事通关营》',
        sub: '13-18岁 · 专业集训',
        price: '¥998',
        origPrice: '¥1298',
        classType: '小班直播',
        detailId: 'ai-advance-contest',
      },
      {
        name: '《科技特长生路径课》',
        sub: '15-18岁 · 对接升学政策',
        price: '¥698',
        origPrice: '¥898',
        classType: '小班直播',
        detailId: 'ai-advance-ml',
      },
    ],
  },
  {
    id: 'level1',
    level: 'Level 1',
    title: 'AI精英启蒙课',
    tag: '基础层',
    courseType: '认证',
    age: '6–12岁 · 小学阶段',
    color: 'from-cyan-500 to-sky-500',
    bg: 'bg-cyan-50 border-cyan-200/60',
    cover: 'https://picsum.photos/seed/level1/400/225',
    goal: '趣味体验式教学，建立AI认知，培育精英潜质',
    desc: '以趣味化、体验式教学为主，拒绝枯燥理论，让孩子在玩中学，对接2026年小学AI素养教育标准。',
    courses: [
      {
        name: '《AI启蒙：走进智能世界》',
        sub: '适配6-8岁 · 小学低段 · 12课时',
        price: '¥299',
        origPrice: '¥399',
        classType: '小班直播',
        detailId: 'ai-enlighten',
      },
      {
        name: '《AI工具小达人》',
        sub: '适配8-10岁 · 小学中段 · 12课时',
        price: '¥299',
        origPrice: '¥399',
        classType: '小班直播',
        detailId: 'ai-programming',
      },
      {
        name: '《AI创新小实验》',
        sub: '适配10-12岁 · 小学高段 · 12课时',
        price: '¥399',
        origPrice: '¥499',
        classType: '小班直播',
        detailId: 'ai-art',
      },
    ],
  },
  {
    id: 'level2',
    level: 'Level 2',
    title: 'AI精英进阶课',
    tag: '提升层',
    courseType: '认证',
    age: '13–18岁 · 初高中阶段',
    color: 'from-primary to-cyan-600',
    bg: 'bg-sky-50 border-sky-200/60',
    cover: 'https://picsum.photos/seed/level2/400/225',
    goal: '衔接初中AI素养要求与高中科技特长生培养标准',
    desc: '兼顾"升学赋能"与"精英能力塑造"，适配2026年科技特长生升学趋势。',
    courses: [
      {
        name: '《AI基础原理与应用》',
        sub: '适配13-15岁 · 初中方向 · 16课时',
        price: '¥698',
        origPrice: '¥898',
        classType: '小班直播',
        detailId: 'ai-advance-basic',
      },
      {
        name: '《机器学习入门与实战》',
        sub: '适配15-18岁 · 高中方向 · 16课时',
        price: '¥698',
        origPrice: '¥898',
        classType: '小班直播',
        detailId: 'ai-advance-ml',
      },
      {
        name: '《AI竞赛培优课》',
        sub: '适配14-18岁 · 初高中通用 · 16课时',
        price: '¥998',
        origPrice: '¥1298',
        classType: '小班直播',
        detailId: 'ai-advance-contest',
      },
      {
        name: '《AI伦理与精英思维》',
        sub: '适配13-18岁 · 初高中通用 · 16课时',
        price: '¥698',
        origPrice: '¥898',
        classType: '小班直播',
        detailId: 'ai-advance-ethics',
      },
    ],
  },
  {
    id: 'level3',
    level: 'Level 3',
    title: 'AI精英实战课',
    tag: '落地层',
    courseType: '创造',
    age: '16–22岁 · 高中+大学阶段',
    color: 'from-indigo-500 to-blue-600',
    bg: 'bg-indigo-50 border-indigo-200/60',
    cover: 'https://picsum.photos/seed/level3/400/225',
    goal: '从"懂AI、用AI"向"创AI、落地AI"过渡',
    desc: '聚焦AI创新项目实战与成果转化，对接高校AI专业学习与青少年科创人才标准。',
    courses: [
      {
        name: '《AI创新项目实战（通用方向）》',
        sub: '20课时 · 跨学科综合项目',
        price: '¥1280',
        origPrice: '¥1580',
        classType: '小班直播',
        detailId: 'ai-practice-general',
      },
      {
        name: '《AI视觉与机器人编程实战》',
        sub: '20课时 · 硬件+视觉专项',
        price: '¥1280',
        origPrice: '¥1580',
        classType: '小班直播',
        detailId: 'ai-practice-robot',
      },
      {
        name: '《教育AI实战与开发》',
        sub: '20课时 · 教育科技专项',
        price: '¥1280',
        origPrice: '¥1580',
        classType: '小班直播',
        detailId: 'ai-practice-edu',
      },
      {
        name: '《AI数据科学与可视化实战》',
        sub: '20课时 · 数据科学专项',
        price: '¥1280',
        origPrice: '¥1580',
        classType: '小班直播',
        detailId: 'ai-practice-data',
      },
    ],
  },
  {
    id: 'level4',
    level: 'Level 4',
    title: 'AI精英赋能课',
    tag: '精英层',
    courseType: '创造',
    age: '20–28岁 · 大学+职场初期',
    color: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50 border-violet-200/60',
    cover: 'https://picsum.photos/seed/level4/400/225',
    goal: '成为AI专项精英，实现能力变现与职业升级',
    desc: '聚焦AI专项领域深度深耕与价值变现，对接职场AI岗位需求与创业趋势。',
    courses: [
      {
        name: '《AI专项领域精通课》',
        sub: '24课时 · 职场方向 · 3个细分赛道',
        price: '¥1680',
        origPrice: '¥2180',
        classType: '小班直播',
        detailId: 'ai-empower-specialty',
      },
      {
        name: '《AI创业赋能课》',
        sub: '24课时 · 创业方向',
        price: '¥1680',
        origPrice: '¥2180',
        classType: '小班直播',
        detailId: 'ai-empower-startup',
      },
      {
        name: '《AI成果变现实战课》',
        sub: '24课时 · 通用方向',
        price: '¥1680',
        origPrice: '¥2180',
        classType: '小班直播',
        detailId: 'ai-empower-value',
      },
      {
        name: '《AI精英领导力课》',
        sub: '24课时 · 通用方向',
        price: '¥1680',
        origPrice: '¥2180',
        classType: '小班直播',
        detailId: 'ai-empower-leadership',
      },
    ],
  },
]

// ─── 家长课程体系 ───────────────────────────────────────────
const PARENT_LEVELS = [
  {
    id: 'parent-99',
    level: '9.9',
    title: '9.9元家长课',
    tag: '家长特惠',
    courseType: '体验',
    age: '全阶段家长',
    color: 'from-orange-500 to-amber-500',
    bg: 'bg-amber-50 border-amber-200/60',
    cover: 'https://picsum.photos/seed/parent99/400/225',
    goal: '原价99元，限时9.9元，快速掌握AI教育认知',
    desc: '专为家长设计，零基础快速掌握AI教育认知与引导方法，配套AI教育社群与专家答疑，限量1000份。',
    courses: [
      {
        name: '《成为孩子驾驭AI路上的引路人》',
        sub: '家长必读课 · 限时9.9元',
        price: '¥9.9',
        origPrice: '¥99',
        classType: '录播课',
        detailId: 'parent-guide',
      },
      {
        name: '《AI工具家长快速上手课》',
        sub: '适配孩子8-12岁家长 · 赠课',
        price: '赠送',
        classType: '录播课',
        detailId: 'parent-tools',
      },
    ],
  },
  {
    id: 'parent1',
    level: 'Parent 1',
    title: 'AI启蒙家长课',
    tag: '基础层',
    courseType: '认证',
    age: '孩子6–12岁家长',
    color: 'from-emerald-400 to-teal-500',
    bg: 'bg-emerald-50 border-emerald-200/60',
    cover: 'https://picsum.photos/seed/parent1/400/225',
    goal: '建立正确AI认知，掌握低龄孩子AI启蒙引导方法',
    desc: '守护孩子创新兴趣，掌握科学引导方法，联动学员课程精准辅导。',
    courses: [
      {
        name: '《AI启蒙家长必修课》',
        sub: '适配孩子6-8岁家长 · 8课时',
        price: '¥199',
        origPrice: '¥299',
        classType: '录播课',
        detailId: 'parent1-required',
      },
      {
        name: '《AI工具家长课》',
        sub: '适配孩子8-12岁家长 · 8课时',
        price: '¥199',
        origPrice: '¥299',
        classType: '录播课',
        detailId: 'parent1-tools',
      },
    ],
  },
  {
    id: 'parent2',
    level: 'Parent 2',
    title: 'AI进阶家长课',
    tag: '提升层',
    courseType: '认证',
    age: '孩子13–18岁家长',
    color: 'from-teal-500 to-cyan-600',
    bg: 'bg-teal-50 border-teal-200/60',
    cover: 'https://picsum.photos/seed/parent2/400/225',
    goal: '了解AI升学政策与赛事价值，助力升学赋能',
    desc: '掌握孩子AI学习引导与思维培养方法，助力科技特长生升学。',
    courses: [
      {
        name: '《初中AI家长赋能课》',
        sub: '适配孩子13-15岁家长 · 10课时',
        price: '¥299',
        origPrice: '¥399',
        classType: '录播课',
        detailId: 'parent2-junior',
      },
      {
        name: '《高中AI家长升学课》',
        sub: '适配孩子15-18岁家长 · 10课时',
        price: '¥399',
        origPrice: '¥499',
        classType: '录播课',
        detailId: 'parent2-senior',
      },
    ],
  },
  {
    id: 'parent3',
    level: 'Parent 3',
    title: 'AI实战家长课',
    tag: '落地层',
    courseType: '创造',
    age: '孩子16–22岁家长',
    color: 'from-blue-500 to-indigo-500',
    bg: 'bg-blue-50 border-blue-200/60',
    cover: 'https://picsum.photos/seed/parent3/400/225',
    goal: '理解AI创新项目价值，助力实战能力落地',
    desc: '掌握孩子职业/升学方向指引方法，协助科创成果转化。',
    courses: [
      {
        name: '《AI科创家长支撑课》',
        sub: '10课时 · 适配所有该阶段家长',
        price: '¥399',
        origPrice: '¥499',
        classType: '录播课',
        detailId: 'parent3-support',
      },
      {
        name: '《AI方向升学/职业规划家长课》',
        sub: '10课时 · 分目标方向',
        price: '¥499',
        origPrice: '¥599',
        classType: '录播课',
        detailId: 'parent3-career',
      },
    ],
  },
  {
    id: 'parent4',
    level: 'Parent 4',
    title: 'AI精英家长课',
    tag: '精英层',
    courseType: '创造',
    age: '孩子20–28岁家长',
    color: 'from-purple-500 to-violet-600',
    bg: 'bg-purple-50 border-purple-200/60',
    cover: 'https://picsum.photos/seed/parent4/400/225',
    goal: '协同助力孩子职业发展与创业升级',
    desc: '认可AI时代价值变现逻辑，掌握支持方法，协同孩子精英升级。',
    courses: [
      {
        name: '《AI职场家长赋能课》',
        sub: '10课时 · 适配孩子职场方向家长',
        price: '¥399',
        origPrice: '¥499',
        classType: '录播课',
        detailId: 'parent4-career',
      },
      {
        name: '《AI创业家长支撑课》',
        sub: '10课时 · 适配孩子创业方向家长',
        price: '¥399',
        origPrice: '¥499',
        classType: '录播课',
        detailId: 'parent4-startup',
      },
    ],
  },
]

const TAG_COLORS = {
  '基础层': 'bg-emerald-100 text-emerald-700',
  '提升层': 'bg-sky-100 text-sky-700',
  '落地层': 'bg-indigo-100 text-indigo-700',
  '精英层': 'bg-violet-100 text-violet-700',
  '限时特惠': 'bg-red-100 text-red-600',
  '家长特惠': 'bg-orange-100 text-orange-600',
  '免费体验': 'bg-emerald-100 text-emerald-700',
  'AI素养': 'bg-sky-100 text-sky-700',
  '竞赛培优': 'bg-blue-100 text-blue-700',
  '升学赋能': 'bg-violet-100 text-violet-700',
}

function getCoursesByTab(tabKey) {
  const tab = COURSE_TABS.find((t) => t.key === tabKey)
  if (!tab) return []
  const out = []
  tab.levelIds.forEach((lid) => {
    const lv = STUDENT_LEVELS.find((l) => l.id === lid)
    if (lv) lv.courses.forEach((c) => out.push({ course: c, color: lv.color, courseType: lv.courseType, ageLabel: lv.age, cover: lv.cover, isParentCourse: false }))
  })
  ;(tab.parentIds || []).forEach((pid) => {
    const lv = PARENT_LEVELS.find((l) => l.id === pid)
    if (lv) lv.courses.forEach((c) => out.push({ course: c, color: lv.color, courseType: lv.courseType, ageLabel: lv.age, cover: lv.cover, isParentCourse: true }))
  })
  return out
}

const HERO_BANNERS = [
  {
    id: 'main',
    badge: 'AI能力课程',
    badgeColor: 'text-cyan-300',
    title: '分层进阶AI课程体系，覆盖素养启蒙 / 竞赛培优 / 升学赋能',
    desc: '白名单赛事通关营 · 科技特长生路径课 · AI素养启蒙课，按需选择适配课程。',
    desc2: '打破传统AI课程局限，构建',
    descHighlight: '素养奠基→能力进阶→实战赋能→价值变现',
    descEnd: '四级精英课程体系。',
    bg: 'from-bingo-dark to-slate-700',
    actions: [
      { label: '查看课程详情', to: '/courses?type=literacy', style: 'bg-orange-500 hover:bg-orange-600 text-white' },
      { label: '领取课程优惠', to: '/courses?deal=9.9', style: 'bg-white/15 hover:bg-white/25 text-white' },
    ],
    tags: [
      { icon: '🎯', text: 'Level 1–4 分级体系' },
      { icon: '🏆', text: '白名单赛事通关营' },
      { icon: '🎓', text: '科技特长生升学路径' },
    ],
  },
  {
    id: 'hot',
    badge: '🔥 爆款限时抢',
    badgeColor: 'text-orange-300',
    title: '独门爆款课程，获奖率92%，限时优惠价报名',
    desc: '精选三大独家爆款：AI素养启蒙、白名单赛事通关营、科技特长生路径课。',
    desc2: '从素养到竞赛到升学一站式覆盖，',
    descHighlight: '限时特惠，抢完即止',
    descEnd: '。',
    bg: 'from-red-600 to-orange-500',
    actions: [
      { label: '立即抢购', to: '/courses?type=literacy', style: 'bg-white text-red-600 hover:bg-orange-50 font-bold' },
      { label: '查看全部爆款', to: '/courses', style: 'bg-white/15 hover:bg-white/25 text-white', scrollTo: 'hot' },
    ],
    tags: [
      { icon: '🥇', text: 'AI素养启蒙 ¥299起' },
      { icon: '🏆', text: '赛事通关营 获奖率92%' },
      { icon: '📈', text: '科技特长生路径课' },
    ],
  },
  {
    id: '9.9',
    badge: '👨‍👩‍👧 家长专属',
    badgeColor: 'text-amber-200',
    title: '《成为孩子驾驭AI路上的引路人》限时9.9元',
    desc: '原价99元，限时秒杀，限量1000份。专为家长设计，零基础30分钟掌握AI教育认知与引导方法。',
    desc2: '',
    descHighlight: '累计服务5万+家长，98%有效',
    descEnd: '。购买即赠AI工具家长课+社群答疑。',
    bg: 'from-amber-600 to-orange-500',
    actions: [
      { label: '9.9元立即秒杀', to: '/courses?deal=9.9', style: 'bg-white text-orange-600 hover:bg-orange-50 font-bold' },
      { label: '免费加入家长社群', to: '/community', style: 'bg-white/15 hover:bg-white/25 text-white' },
    ],
    tags: [
      { icon: '💰', text: '原价99元 → 9.9元' },
      { icon: '👨‍👩‍👧', text: '5万+家长已学习' },
      { icon: '🎁', text: '赠AI工具课+社群' },
    ],
  },
]

// ─── 主页面 ─────────────────────────────────────────────────
export default function Courses() {
  const [activeTab, setActiveTab] = useState('drain')
  const [bannerIdx, setBannerIdx] = useState(0)
  const bannerTimer = useRef(null)
  const [paymentCourse, setPaymentCourse] = useState(null)
  const [packagePayment, setPackagePayment] = useState(null)
  const tabCourses = getCoursesByTab(activeTab)

  const paymentOpen = !!(paymentCourse || packagePayment)
  const paymentCourseName = paymentCourse?.name ?? (packagePayment ? `${packagePayment.plan.cert} · 系列课程包` : '')
  const paymentPrice = paymentCourse
    ? (paymentCourse.price === '免费' || paymentCourse.price === '赠送' ? '0元' : paymentCourse.price)
    : (packagePayment ? `¥${packagePayment.packageTotal.toLocaleString()}` : '')

  const closePaymentModal = () => {
    setPaymentCourse(null)
    setPackagePayment(null)
  }

  useEffect(() => {
    bannerTimer.current = setInterval(() => {
      setBannerIdx((i) => (i + 1) % HERO_BANNERS.length)
    }, 3000)
    return () => clearInterval(bannerTimer.current)
  }, [])

  const goToBanner = (idx) => {
    setBannerIdx(idx)
    clearInterval(bannerTimer.current)
    bannerTimer.current = setInterval(() => {
      setBannerIdx((i) => (i + 1) % HERO_BANNERS.length)
    }, 3000)
  }

  const banner = HERO_BANNERS[bannerIdx]

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">

        {/* ── Hero Banner 轮播 ── */}
        <section className="mb-14">
          <div className="relative overflow-hidden rounded-3xl">
            <div
              className={'p-10 bg-gradient-to-br text-white transition-all duration-500 ' + banner.bg}
              style={{ minHeight: 280 }}
            >
              <div className="max-w-4xl">
                <div className={'text-xs font-semibold mb-3 tracking-widest uppercase opacity-80 ' + banner.badgeColor}>{banner.badge}</div>
                <h1 className="text-lg sm:text-2xl lg:text-[1.75rem] font-bold leading-tight mb-3">
                  {banner.title}
                </h1>
                <div className="text-white/70 text-sm leading-relaxed mb-5 space-y-1">
                  <p>{banner.desc}</p>
                  {banner.desc2 !== undefined ? (
                    <p>{banner.desc2}<span className="text-white font-semibold">{banner.descHighlight}</span>{banner.descEnd}</p>
                  ) : (
                    <p><span className="text-white font-semibold">{banner.descHighlight}</span>{banner.descEnd}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mb-6">
                  {banner.tags.map((t, i) => (
                    <span key={i} className="flex items-center gap-1.5 text-xs bg-white/15 px-3 py-1.5 rounded-full">
                      <span>{t.icon}</span>{t.text}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3">
                  {banner.actions.map((a, i) => (
                    <Link
                      key={i}
                      to={a.to}
                      onClick={a.scrollTo ? () => { setTimeout(() => { document.getElementById(a.scrollTo)?.scrollIntoView({ behavior: 'smooth' }) }, 100) } : undefined}
                      className={'px-6 py-2.5 rounded-full text-sm font-medium transition ' + a.style}
                    >
                      {a.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            {/* 轮播控件 */}
            <div className="absolute bottom-4 right-5 flex gap-2 items-center">
              {HERO_BANNERS.map((_, i) => (
                <button key={i} type="button" onClick={() => goToBanner(i)}
                  className={'transition-all rounded-full ' + (i === bannerIdx ? 'w-5 h-2 bg-white' : 'w-2 h-2 bg-white/40 hover:bg-white/70')} />
              ))}
            </div>
            <button type="button" onClick={() => goToBanner((bannerIdx - 1 + HERO_BANNERS.length) % HERO_BANNERS.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition">‹</button>
            <button type="button" onClick={() => goToBanner((bannerIdx + 1) % HERO_BANNERS.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition">›</button>
          </div>
        </section>

        {/* ── 课程分类 Tab + 课程列表 ── */}
        <section className="mb-14">
          <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-200 pb-2">
            {COURSE_TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition ${activeTab === t.key ? 'bg-primary text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <PaymentModal
            open={paymentOpen}
            onClose={closePaymentModal}
            courseName={paymentCourseName}
            price={paymentPrice}
            paymentState={paymentCourse?.detailId ? { courseId: paymentCourse.detailId } : (packagePayment ? { packagePlanId: packagePayment.plan.id } : {})}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tabCourses.map(({ course, color, courseType, ageLabel, cover, isParentCourse }, idx) => (
              <CourseCard
                key={`${course.detailId || course.name}-${idx}`}
                course={course}
                idx={idx}
                accentColor={color}
                courseType={courseType}
                ageLabel={ageLabel}
                cover={cover}
                isParentCourse={isParentCourse}
                onBuyClick={setPaymentCourse}
              />
            ))}
          </div>
          {tabCourses.length === 0 && <p className="text-center text-slate-500 py-12">暂无该分类课程</p>}
        </section>

        {/* ── AI测评入口 ── */}
        <section className="mb-14">
          <Link to="/events/ai-test" className="block">
            <div className="rounded-2xl bg-gradient-to-r from-slate-50 to-cyan-50 border border-slate-100 p-6 flex items-center justify-between hover:border-primary/30 hover:shadow-sm transition">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center text-white text-xl">🧠</div>
                <div>
                  <p className="font-semibold text-bingo-dark">免费测评 · 找到最适合的课程</p>
                  <p className="text-xs text-slate-500 mt-0.5">按年龄段与学习目标测评，获得专属课程推荐报告</p>
                </div>
              </div>
              <span className="text-primary text-sm font-semibold shrink-0">免费测评 →</span>
            </div>
          </Link>
        </section>

        {/* ── AI认证成长路径 ── */}
        <section id="growth-plan" className="mb-14">
          <div className="mb-7">
            <h2 className="text-xl font-bold text-bingo-dark mb-1">AI认证成长路径</h2>
            <p className="text-sm text-slate-500">选择认证目标 → 匹配推荐课程包 → 一键购买，阶段学习认证通关</p>
          </div>
          <CertCoursePlan onSelectPackage={setPackagePayment} />
          <div className="mt-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 p-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs text-slate-500">成长计划专属优惠</p>
              <p className="font-medium text-bingo-dark mt-0.5">按成长计划报名，享额外专属折扣</p>
            </div>
            <Link to="/cert" className="text-sm border border-primary text-primary px-4 py-2 rounded-xl hover:bg-primary/10 transition">关联认证中心 →</Link>
          </div>
        </section>

        {/* ── AI学习成长路径 ── */}
        <section className="mb-10">
          <h2 className="text-xl font-bold text-bingo-dark mb-6">AI学习成长路径</h2>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 overflow-x-auto">
            <div className="flex flex-wrap items-center justify-center gap-2 min-w-max">
              {COURSE_TABS.map((t, i) => (
                <div key={t.key} className="flex items-center gap-2">
                  <div className="px-4 py-2.5 rounded-xl bg-white border-2 border-slate-200 shadow-sm font-medium text-bingo-dark text-sm whitespace-nowrap">{t.label}</div>
                  {i < COURSE_TABS.length - 1 && <span className="text-slate-400 hidden sm:inline" aria-hidden>→</span>}
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-slate-500 mt-4">从引流体验 → 爆品实战 → 创造进阶 → 学业赋能 → 缤果王牌，完整AI学习路径</p>
          </div>
        </section>

      </div>
    </div>
  )
}
