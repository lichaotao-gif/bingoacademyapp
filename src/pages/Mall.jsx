import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

const CATEGORIES = [
  { id: 'all', label: '全部' },
  { id: 'enlighten', label: 'AI启蒙' },
  { id: 'programming', label: '智能编程' },
  { id: 'sensing', label: '感知实验' },
  { id: 'robotics', label: '机器人教具' },
  { id: 'advanced', label: '科创进阶' },
  { id: 'consumables', label: '实验耗材' },
]

const PRODUCTS = [
  {
    id: 'kit-ai-starter', category: 'enlighten', emoji: '🧩', tag: '启蒙推荐',
    image: '/mall/ai-sensor-kit.png',
    name: 'AI启蒙传感学具套装', price: 680, originalPrice: 780, sales: '1,286',
    age: '7-10岁', desc: '主控板、灯光、声音传感器一套配齐，陪孩子完成第一个智能互动作品。',
    includes: ['智能主控板', '声音 / 光线传感器', '实验任务卡'],
    details: ['认识光线与声音如何被机器感知', '完成“智能夜灯”和“声音提示器”两个作品', '配套课程任务卡，从搭建到展示循序完成'],
  },
  {
    id: 'robot-microbit', category: 'programming', emoji: '🤖', tag: '热销单品',
    image: '/mall/ai-coding-robot.png',
    name: '人工智能 Micro:bit 编程学具', price: 298, originalPrice: 358, sales: '2,043',
    age: '8-14岁', desc: '图形化编程与传感器互动相结合，适合在家完成编程创作。',
    includes: ['Micro:bit 主板', '扩展板与连接线', '项目指导手册'],
    details: ['图形化编程，孩子可独立上手', '通过传感器控制灯光、声音和动作', '完成互动小游戏与智能装置创作'],
  },
  {
    id: 'sensor-ai-kit', category: 'sensing', emoji: '📡', tag: '实验室同款',
    image: '/mall/ai-vision-kit.png',
    name: 'AI视觉与多模态传感器套装', price: 1280, originalPrice: 1480, sales: '586',
    age: '10-16岁', desc: '视觉、距离、声音等多种感知实验，配套数据采集与实验报告模板。',
    includes: ['视觉识别模块', '距离 / 声音传感器', '实验报告模板'],
    details: ['体验图像、距离和声音的多模态感知', '采集真实数据，理解 AI 的输入与判断', '附实验报告模板，适合课程成果展示'],
  },
  {
    id: 'robot-car', category: 'robotics', emoji: '🚗', tag: '创作必备',
    image: '/mall/ai-coding-robot.png',
    name: '智能循迹小车创作套装', price: 498, originalPrice: 598, sales: '932',
    age: '9-14岁', desc: '从组装到编程，完成循迹、避障与智能控制等趣味挑战。',
    includes: ['循迹小车底盘', '电机与传感器', '闯关任务地图'],
    details: ['完成小车组装与基础线路连接', '编程实现循迹、避障和智能控制', '按闯关地图完成创作挑战'],
  },
  {
    id: 'jetson-nano-edu', category: 'advanced', emoji: '🖥️', tag: '科创进阶',
    image: '/mall/ai-vision-kit.png',
    name: '边缘人工智能实验主机', price: 3299, originalPrice: 3699, sales: '168',
    age: '12岁以上', desc: '用于边缘 AI 与轻量深度学习推理演示，支持视觉识别项目实践。',
    includes: ['AI 实验主机', '散热与电源组件', '教育实验指引'],
    details: ['运行轻量 AI 视觉识别模型', '理解边缘计算如何实时处理数据', '配套进阶实验指引，适合科创项目'],
  },
  {
    id: 'drone-ai-lite', category: 'advanced', emoji: '🚁', tag: '新品上线',
    image: '/mall/ai-drone-kit.png',
    name: 'AI视觉循迹无人机（教育版）', price: 1899, originalPrice: 2199, sales: '216',
    age: '12岁以上', desc: '体验 AI 视觉循迹、定点巡航与智能控制，附课堂安全说明。',
    includes: ['教育版无人机', '安全护桨套件', '视觉循迹任务卡'],
    details: ['在安全护桨保护下完成基础操控', '体验 AI 视觉循迹与定点巡航', '通过任务卡完成航线挑战'],
  },
  {
    id: 'ai-xlab-pack', category: 'consumables', emoji: '📦', tag: '班课装',
    image: '/mall/ai-sensor-kit.png',
    name: 'AI机器学习实验耗材包', price: 458, originalPrice: 528, sales: '743',
    age: '10岁以上', desc: '围绕数据采集、标注与分类实验设计，适配约 30 人 AI 班课。',
    includes: ['数据采集材料', '分类实验卡', '30人份任务耗材'],
    details: ['覆盖数据采集、标注和分类练习', '适配 30 人班课的分组实验', '可与 AI 机器学习课程同步使用'],
  },
  {
    id: 'creative-board', category: 'programming', emoji: '🎛️', tag: '家庭实践',
    image: '/mall/ai-coding-robot.png',
    name: 'AI创意交互开发板套装', price: 398, originalPrice: 468, sales: '689',
    age: '8-14岁', desc: '通过按键、灯光、声音完成互动作品，低门槛体验智能硬件创作。',
    includes: ['创意开发板', '互动元件包', '6个家庭项目'],
    details: ['按键、灯光和声音组件自由组合', '完成 6 个家庭互动小作品', '在低门槛创作中建立编程逻辑'],
  },
]

function ProductCard({ product }) {
  return (
    <Link
      to={`/mall/${product.id}`}
      className="group card overflow-hidden text-left transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg"
    >
      <div className="relative h-40 overflow-hidden bg-slate-100">
        <img src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-transparent" />
        <span className="absolute right-4 top-3 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">{product.tag}</span>
        <span className="absolute bottom-4 left-4 text-[10px] tracking-[0.18em] text-white/90">BINGO AI EDU</span>
      </div>
      <div className="p-4">
        <p className="mb-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-600">{product.desc}</p>
        <p className="mb-3 text-xs text-slate-400">适用年龄：{product.age} · 已售 {product.sales}</p>
        <div className="flex items-end justify-between gap-3">
          <div>
            <span className="text-xl font-bold text-rose-500">¥{product.price}</span>
            <span className="ml-1 text-xs text-slate-400 line-through">¥{product.originalPrice}</span>
          </div>
          <span className="text-xs font-medium text-primary">商品介绍 →</span>
        </div>
      </div>
    </Link>
  )
}

function ProductDetail({ product, onBack }) {
  return (
    <main className="bg-slate-50 pb-14">
      <div className="mx-auto max-w-7xl px-4 pt-6">
        <button type="button" onClick={onBack} className="mb-5 text-sm text-slate-500 transition hover:text-primary">资源商城 / 教具详情</button>
        <section className="grid gap-8 rounded-2xl bg-white p-5 shadow-sm sm:p-7 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-10">
          <div>
            <div className="overflow-hidden rounded-xl bg-slate-100">
              <img src={product.image} alt={product.name} className="aspect-square h-full w-full object-cover" />
            </div>
            <p className="mt-3 text-center text-xs text-slate-400">商品实物展示图</p>
          </div>
          <div className="py-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded bg-primary/10 px-2 py-1 text-xs font-medium text-primary">{product.tag}</span>
              <span className="text-xs text-slate-400">课程配套实物教具</span>
            </div>
            <h1 className="mt-3 text-2xl font-bold leading-snug text-bingo-dark sm:text-3xl">{product.name}</h1>
            <p className="mt-3 text-sm leading-7 text-slate-600">{product.desc}</p>
            <p className="mt-3 text-xs text-slate-400">适用年龄：{product.age} | 已售 {product.sales} 件</p>
            <div className="mt-5 flex items-end gap-3 rounded-lg bg-rose-50 px-5 py-4">
              <span className="text-sm text-slate-500">商城价</span>
              <span className="text-3xl font-bold text-rose-500">¥{product.price}</span>
              <span className="pb-1 text-sm text-slate-400 line-through">¥{product.originalPrice}</span>
              <span className="mb-1 ml-auto text-xs text-rose-500">实物教具 · 包邮配送</span>
            </div>
            <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3 border-y border-slate-100 py-4 text-sm">
              <p><span className="text-slate-400">配送：</span><span className="text-slate-700">48 小时内发货</span></p>
              <p><span className="text-slate-400">服务：</span><span className="text-slate-700">使用指导 · 7 天售后保障</span></p>
            </div>
            <Link to={`/mall/checkout/${product.id}`} className="btn-primary mt-6 block w-full py-3 text-center text-sm">立即购买</Link>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,8fr)_minmax(220px,3fr)]">
          <article className="overflow-hidden rounded-2xl bg-white shadow-sm">
            <header className="border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-bold text-bingo-dark">商品详情</h2>
            </header>
            <div className="p-6 sm:p-8">
              <div className="overflow-hidden rounded-xl bg-slate-100">
                <img src={product.image} alt={`${product.name}商品介绍`} className="h-auto w-full object-cover" />
              </div>
              <h3 className="mt-8 text-xl font-bold text-bingo-dark">让 AI 学习从动手实践开始</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{product.name}是一套面向 {product.age} 学习者设计的人工智能课程学具。它不是单纯的玩具，也不要求孩子一开始就掌握复杂的编程知识；孩子可以从认识每个部件、完成连接开始，跟着任务卡一步步观察设备如何接收信息、作出反应，并把自己的想法做成真实作品。</p>
              <p className="mt-3 text-sm leading-7 text-slate-600">课程将“感知—判断—反馈”的 AI 基本逻辑，拆解为看得见、摸得着的实践任务。家长可陪伴孩子在家完成项目，教师也可将其用于课堂分组、社团活动或阶段性成果展示，让学习从听懂概念变成真正的动手创作。</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {product.details.map((item, index) => (
                  <div key={item} className="rounded-xl bg-cyan-50/70 p-4">
                    <p className="text-xs font-semibold text-primary">学习步骤 {String(index + 1).padStart(2, '0')}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{item}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 grid gap-6 border-t border-slate-100 pt-7 sm:grid-cols-2">
                <div>
                  <h3 className="text-lg font-bold text-bingo-dark">适合哪些学习场景</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">适合 AI 启蒙课程配套、家庭亲子共学、学校社团实践与机构课堂分组使用。每位学习者都能从基础搭建开始，在完成任务后继续尝试自己的创意改造。</p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-bingo-dark">建议使用方式</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">建议先阅读项目任务卡，按图示完成部件连接，再进行程序或功能调试。完成基础任务后，可根据提示更换参数、调整规则，形成属于自己的 AI 小作品。</p>
                </div>
              </div>
              <div className="mt-8 border-t border-slate-100 pt-7">
                <h3 className="text-lg font-bold text-bingo-dark">套装包含</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {product.includes.map((item) => <div key={item} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-4 text-center text-sm text-slate-600">{item}</div>)}
                </div>
                <p className="mt-4 text-xs leading-6 text-slate-400">温馨提示：建议在成人指导下完成部件连接与初次使用；实际配件外观以收到的实物为准。</p>
              </div>
            </div>
          </article>
          <aside className="h-fit rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="font-bold text-bingo-dark">购买说明</h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div><dt className="text-xs text-slate-400">商品类型</dt><dd className="mt-1 text-slate-700">课程配套实物教具</dd></div>
              <div><dt className="text-xs text-slate-400">学习方式</dt><dd className="mt-1 text-slate-700">动手组装 · 任务实践</dd></div>
              <div><dt className="text-xs text-slate-400">售后保障</dt><dd className="mt-1 text-slate-700">正品教具 · 使用指导</dd></div>
            </dl>
          </aside>
        </section>
      </div>
    </main>
  )
}

export default function Mall() {
  const navigate = useNavigate()
  const { productId } = useParams()
  const [activeCategory, setActiveCategory] = useState('all')
  const [query, setQuery] = useState('')
  const selectedProduct = productId ? PRODUCTS.find((product) => product.id === productId) : null

  const visibleProducts = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    return PRODUCTS.filter((product) => {
      const categoryMatch = activeCategory === 'all' || product.category === activeCategory
      const textMatch = !keyword || `${product.name}${product.desc}${product.tag}`.toLowerCase().includes(keyword)
      return categoryMatch && textMatch
    })
  }, [activeCategory, query])

  if (selectedProduct) return <ProductDetail product={selectedProduct} onBack={() => navigate('/mall')} />

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary">BINGO AI EDU SHOP</p>
          <h1 className="mt-1 text-3xl font-bold text-bingo-dark">资源商城</h1>
          <p className="mt-2 text-sm text-slate-500">精选 AI 教具，让孩子在动手实践中理解人工智能。</p>
        </div>
        <label className="relative block">
          <span className="sr-only">搜索教具</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索教具名称"
            className="w-64 rounded-full border border-slate-200 py-2.5 pl-4 pr-10 text-sm outline-none transition focus:border-primary" />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">⌕</span>
        </label>
      </header>

      <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-[#10213d] via-[#0e5f88] to-[#11a7bd] px-7 py-9 text-white sm:px-10">
        <span className="absolute -right-3 -top-12 text-[13rem] opacity-10">🤖</span>
        <div className="relative max-w-2xl">
          <p className="text-sm font-medium text-cyan-200">教具精选 · 家庭学习 · 课堂实践</p>
          <h2 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">把抽象的 AI，变成孩子手中的创作</h2>
          <p className="mt-3 text-sm leading-6 text-slate-200">从启蒙传感器、智能编程到科创实验，一套套教具配合任务指引，在家也能完成真实的 AI 项目。</p>
          <button type="button" onClick={() => setActiveCategory('enlighten')} className="mt-5 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-primary transition hover:bg-cyan-50">从 AI 启蒙开始</button>
        </div>
      </section>

      <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[['官方教具', '机构端同款课程教具'], ['动手实践', '项目任务卡辅助学习'], ['配送售后', '实物教具包邮配送'], ['使用指导', '附配套操作指引']].map(([title, desc]) => (
          <div key={title} className="card p-4">
            <p className="text-sm font-semibold text-bingo-dark">{title}</p>
            <p className="mt-1 text-xs text-slate-500">{desc}</p>
          </div>
        ))}
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-bingo-dark">教具分类</h2>
            <p className="mt-1 text-sm text-slate-500">按学习阶段和动手方向选择适合的教具</p>
          </div>
          <span className="text-sm text-slate-400">共 {visibleProducts.length} 件商品</span>
        </div>
        <div className="mb-6 flex flex-wrap gap-2">
          {CATEGORIES.map((category) => (
            <button key={category.id} type="button" onClick={() => setActiveCategory(category.id)}
              className={`rounded-full px-4 py-2 text-sm transition ${activeCategory === category.id ? 'bg-primary text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-primary/10 hover:text-primary'}`}>
              {category.label}
            </button>
          ))}
        </div>
        {visibleProducts.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {visibleProducts.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : (
          <div className="card py-16 text-center text-sm text-slate-500">没有找到相关教具，换个关键词试试。</div>
        )}
      </section>
    </main>
  )
}
