import { EyeOutlined, HeartOutlined, RightOutlined, ShareAltOutlined, StarFilled } from '@ant-design/icons'
import { useMemo, useState } from 'react'

const levels = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9']

const levelColors = {
  L1: 'text-amber-400',
  L2: 'text-orange-400',
  L3: 'text-orange-500',
  L4: 'text-pink-500',
  L5: 'text-fuchsia-500',
  L6: 'text-violet-500',
  L7: 'text-blue-500',
  L8: 'text-teal-500',
  L9: 'text-sky-500',
}

const tags = [
  { label: 'AI感知', color: 'bg-orange-50 text-orange-500' },
  { label: 'AI处理', color: 'bg-fuchsia-50 text-fuchsia-500' },
  { label: 'AI执行', color: 'bg-violet-50 text-violet-500' },
  { label: '指令', color: 'bg-blue-50 text-blue-500' },
  { label: '光敏传感器', color: 'bg-cyan-50 text-cyan-600' },
  { label: '微波雷达传感器', color: 'bg-amber-50 text-amber-600' },
  { label: '美术', color: 'bg-teal-50 text-teal-500' },
  { label: 'AIGC', color: 'bg-rose-50 text-rose-500' },
]

const explorations = [
  {
    id: 'spa-adventure',
    type: 'AI知识漫游',
    title: '机器小英雄大冒险',
    subtitle: 'SPA魔法闯关',
    desc: '跟随机器小英雄理解“感知 - 处理 - 执行”的基础模型。',
    href: '/explorations/sense-lab.html',
    level: 'L1',
    image: '/hero-1.png',
    views: 415,
    tags: ['AI感知', 'AI处理', 'AI执行'],
  },
  {
    id: 'clean-robot',
    type: 'AI知识漫游',
    title: '扫地机器人大作战',
    subtitle: '用SPA三步魔法遥控扫地机器人打扫卫生',
    desc: '观察环境、判断任务、执行路线，认识家用智能设备的工作流程。',
    href: '/explorations/robot-route.html',
    level: 'L1',
    image: '/mall/ai-coding-robot.png',
    views: 373,
    tags: ['指令'],
  },
  {
    id: 'street-light',
    type: 'AI知识漫游',
    title: '路灯的“超级小大脑”',
    subtitle: '请玩家扮演路灯的“小小大脑”',
    desc: '根据“探头”和“闹钟”传来的信息，快速按下正确的按钮。',
    href: '/explorations/sort-trainer.html',
    level: 'L1',
    image: '/hero-3.png',
    views: 387,
    tags: ['光敏传感器', '微波雷达传感器'],
  },
  {
    id: 'ai-art',
    type: 'AI知识漫游',
    title: 'AI绘画工坊',
    subtitle: '用画笔创造属于你的艺术',
    desc: '用提示词描述主题、风格与画面元素，完成第一张 AI 创作。',
    href: '/explorations/prompt-workshop.html',
    level: 'L1',
    image: '/hero-2.png',
    views: 321,
    tags: ['美术', 'AIGC'],
  },
  {
    id: 'prompt-game',
    type: 'AI兴趣游戏',
    title: '提示词魔法对战',
    subtitle: '边玩边学提示词表达',
    desc: '选择更清晰的指令，让 AI 给出更准确、更有创意的结果。',
    href: '/explorations/prompt-workshop.html',
    level: 'L2',
    image: '/home-ai-children-hero.png',
    views: 268,
    tags: ['AI处理', 'AIGC'],
  },
  {
    id: 'route-game',
    type: 'AI兴趣游戏',
    title: '机器人路线冲刺',
    subtitle: '规划路径，避开障碍',
    desc: '用方向指令组合出通关路线，在试错中训练逻辑顺序。',
    href: '/explorations/robot-route.html',
    level: 'L3',
    image: '/mall/ai-drone-kit.png',
    views: 244,
    tags: ['AI执行', '指令'],
  },
]

const heroCards = [
  {
    title: 'AI知识漫游',
    desc: '探索AI奥秘，动手完成有趣实验',
    button: '探索实验',
    to: '#knowledge',
    image: '/hero-1.png',
    tone: 'from-[#1736d7] via-[#1470ff] to-[#28cbff]',
  },
  {
    title: 'AI兴趣游戏',
    desc: '趣味AI游戏，边玩边学更有趣',
    button: '开始游戏',
    to: '#games',
    image: '/home-ai-children-hero.png',
    tone: 'from-[#6325dc] via-[#8d45f5] to-[#b56cff]',
  },
]

function tagStyle(label) {
  return tags.find((tag) => tag.label === label)?.color || 'bg-slate-100 text-slate-500'
}

function ExplorationCard({ item }) {
  return (
    <a href={item.href} className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_12px_28px_rgba(74,86,131,.10)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(74,86,131,.16)]">
      <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
        <img src={item.image} alt={`${item.title}封面`} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/18 via-transparent to-transparent" />
        <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-lg bg-amber-300 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
          <StarFilled />
          {item.level.replace('L', '')} 星
        </span>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold leading-6 text-slate-950">{item.title}</h3>
        <p className="mt-2 text-sm font-medium leading-6 text-slate-500">{item.subtitle}</p>
        <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">{item.desc}</p>
        <div className="mt-5 flex min-h-8 flex-wrap gap-2">
          {item.tags.map((tag) => <span key={tag} className={`rounded-full px-3 py-1 text-xs font-bold ${tagStyle(tag)}`}>{tag}</span>)}
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-slate-400">
          <HeartOutlined className="text-lg" />
          <span className="inline-flex items-center gap-1 text-sm font-semibold"><ShareAltOutlined /> 分享</span>
          <span className="inline-flex items-center gap-1 text-sm font-semibold"><EyeOutlined /> {item.views}</span>
        </div>
      </div>
    </a>
  )
}

export default function Tools() {
  const [activeLevel, setActiveLevel] = useState('all')
  const [activeType, setActiveType] = useState('全部')
  const [activeTag, setActiveTag] = useState('全部')

  const filtered = useMemo(() => explorations.filter((item) => {
    const levelMatched = activeLevel === 'all' || item.level === activeLevel
    const typeMatched = activeType === '全部' || item.type === activeType
    const tagMatched = activeTag === '全部' || item.tags.includes(activeTag)
    return levelMatched && typeMatched && tagMatched
  }), [activeLevel, activeType, activeTag])

  const knowledge = filtered.filter((item) => item.type === 'AI知识漫游')
  const games = filtered.filter((item) => item.type === 'AI兴趣游戏')
  const typeCounts = {
    全部: explorations.length,
    AI知识漫游: explorations.filter((item) => item.type === 'AI知识漫游').length,
    AI兴趣游戏: explorations.filter((item) => item.type === 'AI兴趣游戏').length,
  }

  return (
    <main className="min-h-screen bg-[#f6f4ff] pb-16">
      <section className="mx-auto max-w-[1420px] px-4 pt-8 sm:px-6">
        <div className="grid gap-5 lg:grid-cols-2">
          {heroCards.map((card) => (
            <a key={card.title} href={card.to} className={`group relative min-h-[230px] overflow-hidden rounded-[30px] bg-gradient-to-br ${card.tone} p-8 text-white shadow-[0_18px_38px_rgba(72,79,163,.18)]`}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_25%,rgba(255,255,255,.22),transparent_28%),linear-gradient(115deg,rgba(255,255,255,.10)_0_1px,transparent_1px_38px)]" />
              <img src={card.image} alt="" className="absolute bottom-0 right-0 h-[92%] w-[58%] object-cover object-center opacity-70 mix-blend-screen transition duration-300 group-hover:scale-105" />
              <div className="relative max-w-md">
                <h1 className="text-4xl font-black tracking-tight sm:text-5xl">{card.title}</h1>
                <p className="mt-6 text-xl font-semibold text-white/82">{card.desc}</p>
                <span className="mt-10 inline-flex min-h-14 items-center rounded-2xl bg-fuchsia-400 px-8 text-base font-bold shadow-[0_10px_24px_rgba(157,78,221,.28)] transition group-hover:bg-fuchsia-300">{card.button}</span>
              </div>
            </a>
          ))}
        </div>

        <section className="mt-6 flex flex-wrap items-center gap-5 rounded-[28px] bg-white px-6 py-6 shadow-[0_16px_38px_rgba(87,79,147,.08)]">
          <h2 className="text-2xl font-black text-slate-950">全部实验</h2>
          <div className="flex items-center gap-3">
            <span className="text-xs font-black tracking-[0.22em] text-indigo-300">STAR FILTER</span>
            <span className="h-px w-8 bg-indigo-100" />
          </div>
          <button type="button" onClick={() => setActiveLevel('all')} className={`rounded-full px-4 py-2 text-sm font-bold transition ${activeLevel === 'all' ? 'bg-indigo-500 text-white' : 'bg-white text-slate-500 ring-1 ring-slate-200'}`}>全部</button>
          {levels.map((level) => (
            <button key={level} type="button" onClick={() => setActiveLevel(level)} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${activeLevel === level ? 'bg-indigo-500 text-white' : 'bg-white text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50'}`}>
              <StarFilled className={activeLevel === level ? 'text-white' : levelColors[level]} />
              {level}
              <span className="h-5 w-5 rounded-full border border-slate-200 bg-white/70" />
            </button>
          ))}
        </section>
      </section>

      <section className="mx-auto grid max-w-[1420px] gap-7 px-4 py-7 sm:px-6 lg:grid-cols-[270px_minmax(0,1fr)]">
        <aside className="space-y-6">
          <div className="rounded-[28px] bg-white p-6 shadow-[0_16px_38px_rgba(87,79,147,.08)]">
            <h2 className="text-xl font-black text-slate-950">实验类型</h2>
            <div className="mt-6 space-y-3">
              {['全部', 'AI知识漫游', 'AI兴趣游戏'].map((type) => (
                <button key={type} type="button" onClick={() => setActiveType(type)} className={`flex w-full items-center justify-between rounded-2xl px-5 py-4 text-left text-sm font-bold transition ${activeType === type ? 'bg-violet-100 text-violet-600' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                  <span>{type}</span>
                  <span>{typeCounts[type]}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] bg-white p-6 shadow-[0_16px_38px_rgba(87,79,147,.08)]">
            <h2 className="text-xl font-black text-slate-950">标签筛选</h2>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={() => setActiveTag('全部')} className={`rounded-full px-4 py-2 text-sm font-bold ${activeTag === '全部' ? 'bg-violet-500 text-white' : 'bg-slate-50 text-slate-500'}`}>全部</button>
              {tags.map((tag) => (
                <button key={tag.label} type="button" onClick={() => setActiveTag(tag.label)} className={`rounded-full px-4 py-2 text-sm font-bold transition ${activeTag === tag.label ? 'bg-violet-500 text-white' : tag.color}`}>{tag.label}</button>
              ))}
            </div>
          </div>
        </aside>

        <div className="space-y-10">
          <section id="knowledge">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-3xl font-black text-slate-950">🤖 AI知识漫游</h2>
              <a href="#knowledge" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-bold text-indigo-500 shadow-sm">查看更多 <RightOutlined /></a>
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {knowledge.map((item) => <ExplorationCard key={item.id} item={item} />)}
              {knowledge.length === 0 ? <p className="rounded-2xl bg-white p-6 text-sm text-slate-500">当前筛选条件下暂无 AI知识漫游内容。</p> : null}
            </div>
          </section>

          <section id="games">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-3xl font-black text-slate-950">🎮 AI兴趣游戏</h2>
              <a href="#games" className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-bold text-indigo-500 shadow-sm">查看更多 <RightOutlined /></a>
            </div>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {games.map((item) => <ExplorationCard key={item.id} item={item} />)}
              {games.length === 0 ? <p className="rounded-2xl bg-white p-6 text-sm text-slate-500">当前筛选条件下暂无 AI兴趣游戏内容。</p> : null}
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}
