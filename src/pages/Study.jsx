import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'

// ─── 课时环节类型（与后台一致：视频+互动+游戏+AI实验 任意组合） ─────────────────
const SEGMENT_LABELS = {
  video: '视频片段',
  choice: '单选题',
  multi_choice: '多选题',
  image_choice: '图片选择题',
  fill_blank: '填空题',
  match: '连线题',
  drag_drop: '拖拽题',
  game: '游戏环节',
  audio_choice: '语音题',
  ai_experiment: 'AI实验',
}

/** 视频环节未配置 posterUrl 时的默认封面（学习场景插图，Unsplash） */
const DEFAULT_VIDEO_POSTER =
  'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1280&q=80&auto=format&fit=crop'

// ─── Mock 已购课程数据 ─────────────────────────────────────
const MY_COURSES = [
  {
    id: 'ai-enlighten',
    title: '《AI启蒙：走进智能世界》',
    sub: '6-8岁 · Level 1 · 小班直播',
    cover: '🌱',
    color: 'from-cyan-500 to-sky-500',
    totalLessons: 12,
    progress: 75,
    lastLesson: '第9课 AI伦理小讲堂',
    cert: false,
    lessons: [
      {
        id: 'l1',
        title: '第1课 什么是AI？',
        duration: '45分钟',
        watched: true,
        videoUrl: '#',
        segments: [
          { id: 's1-v1', type: 'video', sort: 0, payload: { url: 'https://example.com/v1.mp4', title: '什么是AI', duration: 300 } },
          { id: 's1-c1', type: 'choice', sort: 1, payload: { question: 'AI的全称是？', options: ['人工智慧', '人工智能', '自动推理'], correctIndex: 1, explanation: 'Artificial Intelligence（人工智能）' } },
          { id: 's1-mc', type: 'multi_choice', sort: 2, payload: { question: '下列哪些属于人工智能相关方向？（多选）', options: ['机器学习', '深度学习', '普通计算器', '自然语言处理'], correctIndices: [0, 1, 3], explanation: '机器学习、深度学习与自然语言处理均为 AI 领域；普通计算器是固定程序，一般不视为 AI。' } },
          { id: 's1-v2', type: 'video', sort: 3, payload: { url: '', title: '认识AI应用', duration: 120 } },
          { id: 's1-m', type: 'match', sort: 4, payload: { leftItems: ['AI', '机器学习', '深度学习'], rightItems: ['人工智能', '让电脑从数据中学习', '多层神经网络'], correctPairs: [[0, 0], [1, 1], [2, 2]], explanation: '正确连线帮助理解概念关系。' } },
          { id: 's1-v3', type: 'video', sort: 5, payload: { url: '', title: '智能小故事', duration: 90 } },
          { id: 's1-ic', type: 'image_choice', sort: 6, payload: { question: '下面哪一个是AI在生活中的应用？', options: ['智能音箱', '普通计算器', '手电筒', '机械闹钟'], optionImages: ['https://picsum.photos/seed/ai1/200/150', 'https://picsum.photos/seed/calc/200/150', 'https://picsum.photos/seed/light/200/150', 'https://picsum.photos/seed/clock/200/150'], correctIndex: 0, explanation: '智能音箱能对话、放音乐，背后有AI语音识别与理解。' } },
          { id: 's1-v4', type: 'video', sort: 7, payload: { url: '', title: '本课小结', duration: 60 } },
          { id: 's1-fb', type: 'fill_blank', sort: 8, payload: { question: '请填空：AI 是 ____ 的缩写。', blanks: ['人工智能'], explanation: 'Artificial Intelligence = 人工智能。' } },
          { id: 's1-v5', type: 'video', sort: 9, payload: { url: '', title: '拓展：AI 能做什么', duration: 100 } },
          { id: 's1-dd', type: 'drag_drop', sort: 10, payload: { prompt: '请按“从简单到复杂”排列：', items: ['识别图片', '下棋', '开车', '聊天'], correctOrder: [0, 1, 2, 3], explanation: 'AI 先学会看图、下棋，再发展到自动驾驶和自然对话。' } },
          { id: 's1-audio', type: 'audio_choice', sort: 11, payload: { audioUrl: '/AI知识题.mp3', options: ['监督学习', '强化学习', '无监督学习', '自监督学习'], correctIndex: 3, explanation: '答案：自监督学习。' } },
          { id: 's1-ai', type: 'ai_experiment', sort: 12, payload: { title: '人脸识别小实验', description: '体验图像识别，上传一张照片试试看', experimentId: 'face-demo' } },
        ],
      },
      {
        id: 'l2',
        title: '第2课 AI在生活中的应用',
        duration: '42分钟',
        watched: true,
        videoUrl: '#',
        segments: [
          { id: 's2-v', type: 'video', sort: 0, payload: { url: '', title: '生活中的AI', duration: 180 } },
        ],
      },
      { id: 'l3', title: '第3课 智能音箱是怎么工作的', duration: '40分钟', watched: true, videoUrl: '#' },
      { id: 'l4', title: '第4课 AI绘画体验课', duration: '50分钟', watched: true, videoUrl: '#' },
      { id: 'l5', title: '第5课 图像识别小实验', duration: '45分钟', watched: true, videoUrl: '#' },
      { id: 'l6', title: '第6课 语音识别实操', duration: '42分钟', watched: true, videoUrl: '#' },
      { id: 'l7', title: '第7课 AI推荐算法揭秘', duration: '40分钟', watched: true, videoUrl: '#' },
      { id: 'l8', title: '第8课 虚拟AI宠物喂养', duration: '48分钟', watched: true, videoUrl: '#' },
      { id: 'l9', title: '第9课 AI伦理小讲堂', duration: '45分钟', watched: false, videoUrl: '#', isCurrent: true },
      { id: 'l10', title: '第10课 AI与学习的关系', duration: '40分钟', watched: false, videoUrl: '#' },
      { id: 'l11', title: '第11课 创意AI项目实践', duration: '55分钟', watched: false, videoUrl: '#' },
      { id: 'l12', title: '第12课 结业综合考核', duration: '30分钟', watched: false, videoUrl: '#' },
    ],
  },
  {
    id: 'ai-advance-basic',
    title: '《AI基础原理与应用》',
    sub: '13-15岁 · Level 2 · 小班直播',
    cover: '🚀',
    color: 'from-primary to-cyan-600',
    totalLessons: 16,
    progress: 25,
    lastLesson: '第4课 神经网络原理',
    cert: false,
    lessons: [
      { id: 'l1', title: '第1课 机器学习核心概念', duration: '50分钟', watched: true, videoUrl: '#' },
      { id: 'l2', title: '第2课 深度学习入门', duration: '52分钟', watched: true, videoUrl: '#' },
      { id: 'l3', title: '第3课 AI工具进阶实操', duration: '48分钟', watched: true, videoUrl: '#' },
      { id: 'l4', title: '第4课 神经网络原理', duration: '55分钟', watched: false, videoUrl: '#', isCurrent: true },
      { id: 'l5', title: '第5课 AI与数理化融合', duration: '50分钟', watched: false, videoUrl: '#' },
      { id: 'l6', title: '第6课 AI视频剪辑实战', duration: '45分钟', watched: false, videoUrl: '#' },
      { id: 'l7', title: '第7课 AI文案创作训练', duration: '48分钟', watched: false, videoUrl: '#' },
      { id: 'l8', title: '第8课 AI数据可视化', duration: '50分钟', watched: false, videoUrl: '#' },
      { id: 'l9', title: '第9课 赛事考点解析', duration: '55分钟', watched: false, videoUrl: '#' },
      { id: 'l10', title: '第10课 模型训练实践', duration: '60分钟', watched: false, videoUrl: '#' },
      { id: 'l11', title: '第11课 项目选题指导', duration: '45分钟', watched: false, videoUrl: '#' },
      { id: 'l12', title: '第12课 综合案例分析', duration: '50分钟', watched: false, videoUrl: '#' },
      { id: 'l13', title: '第13课 AI伦理与责任', duration: '40分钟', watched: false, videoUrl: '#' },
      { id: 'l14', title: '第14课 项目汇报技巧', duration: '45分钟', watched: false, videoUrl: '#' },
      { id: 'l15', title: '第15课 模拟答辩演练', duration: '60分钟', watched: false, videoUrl: '#' },
      { id: 'l16', title: '第16课 结业综合考核', duration: '30分钟', watched: false, videoUrl: '#' },
    ],
  },
  {
    id: 'parent-guide',
    title: '《成为孩子驾驭AI路上的引路人》',
    sub: '家长必读课 · 录播',
    cover: '👨‍👩‍👧',
    color: 'from-orange-500 to-amber-500',
    totalLessons: 8,
    progress: 100,
    lastLesson: '第8课 家庭AI学习计划制定',
    cert: true,
    lessons: [
      { id: 'l1', title: '第1课 AI时代家长需要知道什么', duration: '30分钟', watched: true, videoUrl: '#' },
      { id: 'l2', title: '第2课 不同年龄段孩子AI学习方法', duration: '35分钟', watched: true, videoUrl: '#' },
      { id: 'l3', title: '第3课 AI工具家长快速上手', duration: '28分钟', watched: true, videoUrl: '#' },
      { id: 'l4', title: '第4课 如何引导孩子正确使用AI', duration: '32分钟', watched: true, videoUrl: '#' },
      { id: 'l5', title: '第5课 AI使用风险防控', duration: '25分钟', watched: true, videoUrl: '#' },
      { id: 'l6', title: '第6课 家庭AI探究任务实操', duration: '38分钟', watched: true, videoUrl: '#' },
      { id: 'l7', title: '第7课 孩子AI作品如何展示', duration: '30分钟', watched: true, videoUrl: '#' },
      { id: 'l8', title: '第8课 家庭AI学习计划制定', duration: '35分钟', watched: true, videoUrl: '#' },
    ],
  },
]

// ─── 进度条组件 ─────────────────────────────────────────────
function ProgressBar({ value, color = 'bg-primary' }) {
  return (
    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${value}%` }} />
    </div>
  )
}

// ─── 环节块组件（视频/选择题/填空/连线/拖拽/游戏/AI实验），支持 dark 沉浸主题 ─────────────────
function SegmentVideo({ segment, index, controlledPlaying, onPlay, dark }) {
  const p = segment.payload
  const [internalPlaying, setInternalPlaying] = useState(false)
  const playing = onPlay != null ? controlledPlaying : internalPlaying
  const setPlaying = onPlay != null ? () => onPlay() : setInternalPlaying
  const posterUrl = p.posterUrl || p.poster
  const effectivePoster = (typeof posterUrl === 'string' && posterUrl.trim()) || DEFAULT_VIDEO_POSTER
  const wrapRef = useRef(null)
  const videoRef = useRef(null)
  const src = typeof p.url === 'string' ? p.url.trim() : ''
  const hasStreamableUrl = /^https?:\/\//i.test(src)

  const enterVideoFullscreen = () => {
    const v = videoRef.current
    if (v) {
      if (v.requestFullscreen) {
        v.requestFullscreen().catch(() => {})
        return
      }
      if (v.webkitEnterFullscreen) {
        v.webkitEnterFullscreen()
        return
      }
    }
    const w = wrapRef.current
    if (!w) return
    if (w.requestFullscreen) w.requestFullscreen().catch(() => {})
    else if (w.webkitRequestFullscreen) w.webkitRequestFullscreen()
  }

  return (
    <div className={`rounded-xl overflow-hidden border ${dark ? 'border-slate-600 bg-slate-800' : 'border-slate-200 bg-slate-900'}`}>
      <div className={`flex items-center gap-2 px-3 py-2 text-xs flex-wrap ${dark ? 'bg-slate-700/80 text-slate-200' : 'bg-slate-800/80 text-white'}`}>
        <span className={dark ? 'bg-cyan-500/80 px-2 py-0.5 rounded text-white' : 'bg-primary/80 px-2 py-0.5 rounded text-white'}>环节 {index + 1}</span>
        <span>{SEGMENT_LABELS.video}</span>
        {p.title && <span className="text-slate-300 flex-1 min-w-[6rem] truncate">· {p.title}</span>}
        <button
          type="button"
          onClick={enterVideoFullscreen}
          className={`ml-auto shrink-0 px-2 py-1 rounded-md text-[11px] font-medium ${dark ? 'bg-slate-600 hover:bg-slate-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}
        >
          全屏
        </button>
      </div>
      <div ref={wrapRef} className="aspect-video relative flex flex-col items-center justify-center text-white bg-slate-900">
        {!playing ? (
          <>
            <div className="absolute inset-0">
              <img src={effectivePoster} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center" />
            </div>
            <div className="relative z-10 text-5xl mb-2">▶️</div>
            <button onClick={() => setPlaying(true)} className={`relative z-10 px-6 py-2 rounded-lg text-sm font-medium ${dark ? 'bg-cyan-500 hover:bg-cyan-400 text-white' : 'bg-primary hover:bg-primary/90 text-white'}`}>
              播放
            </button>
          </>
        ) : hasStreamableUrl ? (
          <video
            ref={videoRef}
            src={src}
            className="absolute inset-0 w-full h-full object-contain bg-black"
            controls
            playsInline
            controlsList="nodownload"
            poster={effectivePoster}
          >
            您的浏览器不支持视频播放
          </video>
        ) : (
          <div className="text-center px-4">
            <div className="text-4xl animate-pulse">🎬</div>
            <p className="text-sm mt-2">正在播放{p.duration ? ` · ${Math.floor(p.duration / 60)}:${String(p.duration % 60).padStart(2, '0')}` : ''}</p>
            {!hasStreamableUrl && src && (
              <p className="text-xs text-slate-400 mt-2">当前为演示地址，配置有效 http(s) 视频地址后可全屏观看</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/** 多选题判分：选中集合与正确答案集合一致（序号去重后排序比较） */
function sameMultiChoiceAnswer(selected, correct) {
  const a = [...new Set((selected || []).filter((n) => Number.isInteger(n) && n >= 0))].sort((x, y) => x - y)
  const b = [...new Set((correct || []).filter((n) => Number.isInteger(n) && n >= 0))].sort((x, y) => x - y)
  if (a.length !== b.length) return false
  return a.every((v, i) => v === b[i])
}

function SegmentChoice({ segment, index, dark, onSegmentResult }) {
  const p = segment.payload
  const [selected, setSelected] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const isCorrect = submitted && selected === p.correctIndex
  const handleSubmit = () => {
    setSubmitted(true)
    if (typeof onSegmentResult === 'function') onSegmentResult(segment.id, selected === p.correctIndex)
  }
  const card = dark ? 'rounded-xl border border-slate-600 bg-slate-800 p-4' : 'rounded-xl border border-slate-200 bg-white p-4'
  const meta = dark ? 'flex items-center gap-2 mb-3 text-xs text-slate-400' : 'flex items-center gap-2 mb-3 text-xs text-slate-500'
  const tag = dark ? 'bg-cyan-500/80 text-white px-2 py-0.5 rounded' : 'bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded'
  const q = dark ? 'font-medium text-white mb-3' : 'font-medium text-bingo-dark mb-3'
  const optBase = dark ? 'flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition text-slate-200 ' : 'flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition '
  return (
    <div className={card}>
      <div className={meta}>
        <span className={tag}>环节 {index + 1}</span>
        <span>{SEGMENT_LABELS.choice}</span>
      </div>
      <p className={q}>{p.question}</p>
      <div className="space-y-2">
        {p.options.map((opt, i) => (
          <label
            key={i}
            className={`${optBase} ${selected === i ? (dark ? 'border-cyan-500 bg-cyan-500/20' : 'border-primary bg-primary/5') : dark ? 'border-slate-600 hover:border-slate-500' : 'border-slate-200 hover:border-slate-300'} ${submitted && i === p.correctIndex ? (dark ? 'border-emerald-500 bg-emerald-500/20' : 'border-emerald-500 bg-emerald-50') : ''} ${submitted && selected === i && selected !== p.correctIndex ? (dark ? 'border-red-400 bg-red-500/20' : 'border-red-300 bg-red-50') : ''}`}
          >
            <input type="radio" name={`choice-${segment.id}`} checked={selected === i} onChange={() => setSelected(i)} disabled={submitted} className="text-primary" />
            <span className={dark ? 'text-slate-100' : ''}>{String.fromCharCode(65 + i)}. {opt}</span>
          </label>
        ))}
      </div>
      {!submitted ? (
        <button onClick={handleSubmit} disabled={selected === null} className={`mt-3 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 ${dark ? 'bg-cyan-500 text-white' : 'bg-primary text-white'}`}>
          提交
        </button>
      ) : (
        <div className={`mt-3 p-3 rounded-lg text-sm ${isCorrect ? (dark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-50 text-emerald-800') : dark ? 'bg-amber-500/20 text-amber-200' : 'bg-amber-50 text-amber-800'}`}>
          {isCorrect ? '✓ 回答正确！' : '正确答案：' + (p.options[p.correctIndex] || '')}
          {p.explanation && <p className={dark ? 'mt-1 text-slate-400' : 'mt-1 text-slate-600'}>{p.explanation}</p>}
        </div>
      )}
    </div>
  )
}

function SegmentMultiChoice({ segment, index, dark, onSegmentResult }) {
  const p = segment.payload
  const options = p.options || []
  const correctIndices = Array.isArray(p.correctIndices) ? p.correctIndices : []
  const [selected, setSelected] = useState(() => [])
  const [submitted, setSubmitted] = useState(false)
  const isCorrect = submitted && sameMultiChoiceAnswer(selected, correctIndices)
  const toggle = (i) => {
    if (submitted) return
    setSelected((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]))
  }
  const handleSubmit = () => {
    setSubmitted(true)
    if (typeof onSegmentResult === 'function') onSegmentResult(segment.id, sameMultiChoiceAnswer(selected, correctIndices))
  }
  const card = dark ? 'rounded-xl border border-slate-600 bg-slate-800 p-4' : 'rounded-xl border border-slate-200 bg-white p-4'
  const meta = dark ? 'flex items-center gap-2 mb-3 text-xs text-slate-400' : 'flex items-center gap-2 mb-3 text-xs text-slate-500'
  const tag = dark ? 'bg-cyan-500/80 text-white px-2 py-0.5 rounded' : 'bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded'
  const q = dark ? 'font-medium text-white mb-1' : 'font-medium text-bingo-dark mb-1'
  const optBase = dark ? 'flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition text-slate-200 ' : 'flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition '
  const correctLetters = [...new Set(correctIndices)]
    .filter((i) => i >= 0 && i < options.length)
    .sort((a, b) => a - b)
    .map((i) => String.fromCharCode(65 + i))
    .join('、')
  return (
    <div className={card}>
      <div className={meta}>
        <span className={tag}>环节 {index + 1}</span>
        <span>{SEGMENT_LABELS.multi_choice}</span>
      </div>
      <p className={q}>{p.question}</p>
      <p className={`text-xs mb-3 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>可多选，请勾选所有你认为正确的选项</p>
      <div className="space-y-2">
        {options.map((opt, i) => (
          <label
            key={i}
            className={`${optBase} ${selected.includes(i) ? (dark ? 'border-cyan-500 bg-cyan-500/20' : 'border-primary bg-primary/5') : dark ? 'border-slate-600 hover:border-slate-500' : 'border-slate-200 hover:border-slate-300'} ${submitted && correctIndices.includes(i) ? (dark ? 'border-emerald-500 bg-emerald-500/20' : 'border-emerald-500 bg-emerald-50') : ''} ${submitted && selected.includes(i) && !correctIndices.includes(i) ? (dark ? 'border-red-400 bg-red-500/20' : 'border-red-300 bg-red-50') : ''}`}
          >
            <input type="checkbox" checked={selected.includes(i)} onChange={() => toggle(i)} disabled={submitted} className="text-primary rounded border-slate-300" />
            <span className={dark ? 'text-slate-100' : ''}>{String.fromCharCode(65 + i)}. {opt}</span>
          </label>
        ))}
      </div>
      {!submitted ? (
        <button onClick={handleSubmit} disabled={selected.length === 0} className={`mt-3 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 ${dark ? 'bg-cyan-500 text-white' : 'bg-primary text-white'}`}>
          提交
        </button>
      ) : (
        <div className={`mt-3 p-3 rounded-lg text-sm ${isCorrect ? (dark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-50 text-emerald-800') : dark ? 'bg-amber-500/20 text-amber-200' : 'bg-amber-50 text-amber-800'}`}>
          {isCorrect ? '✓ 回答正确！' : `正确答案：${correctLetters || '（见解析）'}`}
          {p.explanation && <p className={dark ? 'mt-1 text-slate-400' : 'mt-1 text-slate-600'}>{p.explanation}</p>}
        </div>
      )}
    </div>
  )
}

// 图片选择题：选项可带图片（optionImages 与 options 一一对应）
function SegmentImageChoice({ segment, index, dark, onSegmentResult }) {
  const p = segment.payload
  const options = p.options || []
  const optionImages = p.optionImages || []
  const [selected, setSelected] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const isCorrect = submitted && selected === p.correctIndex
  const handleSubmit = () => {
    setSubmitted(true)
    if (typeof onSegmentResult === 'function') onSegmentResult(segment.id, selected === p.correctIndex)
  }
  const card = dark ? 'rounded-xl border border-slate-600 bg-slate-800 p-4' : 'rounded-xl border border-slate-200 bg-white p-4'
  const meta = dark ? 'flex items-center gap-2 mb-3 text-xs text-slate-400' : 'flex items-center gap-2 mb-3 text-xs text-slate-500'
  const tag = dark ? 'bg-cyan-500/80 text-white px-2 py-0.5 rounded' : 'bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded'
  const q = dark ? 'font-medium text-white mb-3' : 'font-medium text-bingo-dark mb-3'
  const optBase = dark ? 'flex flex-col gap-1 p-3 rounded-lg border cursor-pointer transition text-slate-200 ' : 'flex flex-col gap-1 p-3 rounded-lg border cursor-pointer transition '
  return (
    <div className={card}>
      <div className={meta}>
        <span className={tag}>环节 {index + 1}</span>
        <span>{SEGMENT_LABELS.image_choice}</span>
      </div>
      <p className={q}>{p.question}</p>
      <div className="grid grid-cols-2 gap-3">
        {options.map((opt, i) => (
          <label
            key={i}
            className={`${optBase} ${selected === i ? (dark ? 'border-cyan-500 bg-cyan-500/20' : 'border-primary bg-primary/5') : dark ? 'border-slate-600 hover:border-slate-500' : 'border-slate-200 hover:border-slate-300'} ${submitted && i === p.correctIndex ? (dark ? 'border-emerald-500 bg-emerald-500/20' : 'border-emerald-500 bg-emerald-50') : ''} ${submitted && selected === i && selected !== p.correctIndex ? (dark ? 'border-red-400 bg-red-500/20' : 'border-red-300 bg-red-50') : ''}`}
          >
            {optionImages[i] ? (
              <img src={optionImages[i]} alt="" className="w-full aspect-video object-cover rounded-lg" />
            ) : (
              <span className="w-full aspect-video rounded-lg bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-2xl">🖼</span>
            )}
            <span className={dark ? 'text-slate-100 text-sm' : 'text-sm'}>{String.fromCharCode(65 + i)}. {opt}</span>
            <input type="radio" name={`img-choice-${segment.id}`} checked={selected === i} onChange={() => setSelected(i)} disabled={submitted} className="sr-only" />
          </label>
        ))}
      </div>
      {!submitted ? (
        <button onClick={handleSubmit} disabled={selected === null} className={`mt-3 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 ${dark ? 'bg-cyan-500 text-white' : 'bg-primary text-white'}`}>提交</button>
      ) : (
        <div className={`mt-3 p-3 rounded-lg text-sm ${isCorrect ? (dark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-50 text-emerald-800') : dark ? 'bg-amber-500/20 text-amber-200' : 'bg-amber-50 text-amber-800'}`}>
          {isCorrect ? '✓ 回答正确！' : '正确答案：' + (options[p.correctIndex] || '')}
          {p.explanation && <p className={dark ? 'mt-1 text-slate-400' : 'mt-1 text-slate-600'}>{p.explanation}</p>}
        </div>
      )}
    </div>
  )
}

function SegmentFillBlank({ segment, index, dark, onSegmentResult }) {
  const p = segment.payload
  const [values, setValues] = useState(p.blanks.map(() => ''))
  const [submitted, setSubmitted] = useState(false)
  const correct = p.blanks.every((b, i) => (values[i] || '').trim() === (b || '').trim())
  const handleSubmit = () => {
    setSubmitted(true)
    if (typeof onSegmentResult === 'function') onSegmentResult(segment.id, correct)
  }
  const card = dark ? 'rounded-xl border border-slate-600 bg-slate-800 p-4' : 'rounded-xl border border-slate-200 bg-white p-4'
  const meta = dark ? 'flex items-center gap-2 mb-3 text-xs text-slate-400' : 'flex items-center gap-2 mb-3 text-xs text-slate-500'
  const tag = dark ? 'bg-amber-500/80 text-white px-2 py-0.5 rounded' : 'bg-amber-100 text-amber-700 px-2 py-0.5 rounded'
  const q = dark ? 'font-medium text-white mb-3' : 'font-medium text-bingo-dark mb-3'
  const inputCls = dark ? 'border-b-2 border-cyan-500/60 bg-slate-700/50 text-white px-2 py-1 w-24 text-center focus:outline-none focus:border-cyan-400 rounded' : 'border-b-2 border-primary/50 px-2 py-1 w-24 text-center focus:outline-none focus:border-primary'
  return (
    <div className={card}>
      <div className={meta}>
        <span className={tag}>环节 {index + 1}</span>
        <span>{SEGMENT_LABELS.fill_blank}</span>
      </div>
      <p className={q}>{p.question}</p>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {p.blanks.map((_, i) => (
          <input key={i} type="text" value={values[i]} onChange={(e) => setValues((v) => [...v.slice(0, i), e.target.value, ...v.slice(i + 1)])} disabled={submitted} placeholder={`第${i + 1}空`} className={inputCls} />
        ))}
      </div>
      {!submitted ? (
        <button onClick={handleSubmit} className={`mt-2 px-4 py-2 rounded-lg text-sm font-medium ${dark ? 'bg-cyan-500 text-white' : 'bg-primary text-white'}`}>提交</button>
      ) : (
        <div className={`mt-2 p-3 rounded-lg text-sm ${correct ? (dark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-50 text-emerald-800') : dark ? 'bg-amber-500/20 text-amber-200' : 'bg-amber-50 text-amber-800'}`}>
          {correct ? '✓ 正确！' : '参考答案：' + p.blanks.join('、')}
          {p.explanation && <p className={dark ? 'mt-1 text-slate-400' : 'mt-1 text-slate-600'}>{p.explanation}</p>}
        </div>
      )}
    </div>
  )
}

function SegmentMatch({ segment, index, dark, onSegmentResult }) {
  const p = segment.payload
  const left = p.leftItems || []
  const right = p.rightItems || []
  const correctPairs = p.correctPairs || left.map((_, i) => [i, i])
  const [state, setState] = useState({
    selectedLeftIndex: null,
    selectedRightByLeft: left.map(() => null),
    submitted: false,
  })
  const [linePositions, setLinePositions] = useState([])
  const containerRef = useRef(null)
  const leftRefs = useRef([])
  const rightRefs = useRef([])
  const { selectedLeftIndex, selectedRightByLeft, submitted } = state
  const isCorrect =
    correctPairs.length > 0 &&
    correctPairs.every(([li, ri]) => selectedRightByLeft[li] === ri) &&
    selectedRightByLeft.every((r) => r !== null)

  useEffect(() => {
    if (!containerRef.current || submitted) {
      setLinePositions([])
      return
    }
    const pairs = left.map((_, i) => selectedRightByLeft[i] !== null && [i, selectedRightByLeft[i]]).filter(Boolean)
    if (pairs.length === 0) {
      setLinePositions([])
      return
    }
    const measure = () => {
      const container = containerRef.current
      if (!container) return
      const cr = container.getBoundingClientRect()
      const positions = pairs.map(([li, rj]) => {
        const leftEl = leftRefs.current[li]
        const rightEl = rightRefs.current[rj]
        if (!leftEl || !rightEl) return null
        const lr = leftEl.getBoundingClientRect()
        const rr = rightEl.getBoundingClientRect()
        return {
          start: { x: lr.left - cr.left + lr.width, y: lr.top - cr.top + lr.height / 2 },
          end: { x: rr.left - cr.left, y: rr.top - cr.top + rr.height / 2 },
        }
      }).filter(Boolean)
      setLinePositions(positions)
    }
    const raf1 = requestAnimationFrame(() => {
      requestAnimationFrame(measure)
    })
    return () => cancelAnimationFrame(raf1)
  }, [selectedRightByLeft, submitted, left.length])

  const handleClickLeft = (i) => {
    if (state.submitted) return
    setState((prev) => ({
      ...prev,
      selectedLeftIndex: prev.selectedLeftIndex === i ? null : i,
    }))
  }
  const handleClickRight = (j) => {
    if (state.submitted) return
    setState((prev) => {
      if (prev.selectedLeftIndex === null) return prev
      const next = [...prev.selectedRightByLeft]
      const leftIdx = prev.selectedLeftIndex
      if (next[leftIdx] === j) {
        next[leftIdx] = null
      } else {
        next[leftIdx] = j
      }
      return { ...prev, selectedRightByLeft: next, selectedLeftIndex: null }
    })
  }

  const handleSubmit = () => {
    setState((prev) => ({ ...prev, submitted: true }))
    if (typeof onSegmentResult === 'function') onSegmentResult(segment.id, isCorrect)
  }
  const card = dark ? 'rounded-xl border border-slate-600 bg-slate-800 p-4' : 'rounded-xl border border-slate-200 bg-white p-4'
  const meta = dark ? 'flex items-center gap-2 mb-3 text-xs text-slate-400' : 'flex items-center gap-2 mb-3 text-xs text-slate-500'
  const tag = dark ? 'bg-violet-500/80 text-white px-2 py-0.5 rounded' : 'bg-violet-100 text-violet-700 px-2 py-0.5 rounded'
  const instructionCls = dark ? 'text-sm text-violet-200/90 bg-violet-500/20 rounded-lg px-3 py-2 mb-3 border border-violet-400/30' : 'text-sm text-violet-800 bg-violet-50 rounded-lg px-3 py-2 mb-3 border border-violet-200'
  const itemBase = 'px-3 py-2 rounded-lg text-sm transition select-none '
  const leftBox = (i) => itemBase + (dark ? 'bg-slate-700 text-slate-200 ' : 'bg-slate-100 ') + (!submitted ? 'cursor-pointer ' : '') + (selectedLeftIndex === i ? (dark ? 'ring-2 ring-violet-400 ring-offset-2 ring-offset-slate-800' : 'ring-2 ring-violet-500 ring-offset-2 ring-offset-white') : dark ? 'hover:bg-slate-600' : 'hover:bg-slate-200')
  const rightBox = (j) => {
    const usedBy = selectedRightByLeft.findIndex((r) => r === j)
    const isConnected = usedBy >= 0
    return itemBase + (dark ? 'bg-slate-700 text-slate-200 ' : 'bg-slate-100 ') + (!submitted ? 'cursor-pointer ' : '') + (isConnected ? (dark ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-800 bg-emerald-500/20' : 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-white bg-emerald-50') : dark ? 'hover:bg-slate-600' : 'hover:bg-slate-200')
  }
  return (
    <div className={card}>
      <div className={meta}>
        <span className={tag}>环节 {index + 1}</span>
        <span>{SEGMENT_LABELS.match}</span>
      </div>
      <div className={instructionCls}>
        <strong>操作说明：</strong>请先<strong>点击左侧一项</strong>（会高亮），再<strong>点击右侧一项</strong>，两条之间会画出连线；可再次点击已连线的项取消或修改。
      </div>
      <div ref={containerRef} className="relative flex gap-4 flex-wrap items-start min-h-[120px]">
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
          {linePositions.map((pos, idx) => (
            <line
              key={idx}
              x1={pos.start.x}
              y1={pos.start.y}
              x2={pos.end.x}
              y2={pos.end.y}
              stroke={dark ? 'rgb(52 211 153)' : 'rgb(16 185 129)'}
              strokeWidth="2"
              strokeLinecap="butt"
            />
          ))}
        </svg>
        <div className="space-y-2 flex-1 min-w-[120px] relative z-10">
          <p className={dark ? 'text-xs text-slate-500 mb-1' : 'text-xs text-slate-500 mb-1'}>左侧</p>
          {left.map((item, i) => (
            <div key={i} ref={(el) => { leftRefs.current[i] = el }} role="button" tabIndex={0} onClick={(e) => { e.stopPropagation(); handleClickLeft(i); }} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleClickLeft(i); } }} className={leftBox(i)}>
              {item}
            </div>
          ))}
        </div>
        <div className={dark ? 'text-slate-500 self-center relative z-10' : 'text-slate-400 self-center relative z-10'} aria-hidden>→</div>
        <div className="space-y-2 flex-1 min-w-[120px] relative z-10">
          <p className={dark ? 'text-xs text-slate-500 mb-1' : 'text-xs text-slate-500 mb-1'}>右侧</p>
          {right.map((item, j) => (
            <div key={j} ref={(el) => { rightRefs.current[j] = el }} role="button" tabIndex={0} onClick={(e) => { e.stopPropagation(); handleClickRight(j); }} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleClickRight(j); } }} className={rightBox(j)}>
              {item}
            </div>
          ))}
        </div>
      </div>
      {!submitted ? (
        <button onClick={handleSubmit} disabled={selectedRightByLeft.some((r) => r === null)} className={`mt-3 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 ${dark ? 'bg-cyan-500 text-white' : 'bg-primary text-white'}`}>完成连线</button>
      ) : (
        <div className={`mt-3 p-3 rounded-lg text-sm ${isCorrect ? (dark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-50 text-emerald-800') : dark ? 'bg-slate-700/50 text-slate-300' : 'bg-slate-50 text-slate-700'}`}>
          {isCorrect ? '✓ 连线正确！' : '已提交'}
          {p.explanation && <p className="mt-1">{p.explanation}</p>}
        </div>
      )}
    </div>
  )
}

function SegmentDragDrop({ segment, index, dark, onSegmentResult }) {
  const p = segment.payload
  const items = p.items || []
  const [order, setOrder] = useState(() => items.map((_, i) => i))
  const [submitted, setSubmitted] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState(null)
  const correctOrder = p.correctOrder || items.map((_, i) => i)
  const isCorrect = correctOrder.length === order.length && correctOrder.every((c, i) => c === order[i])

  const handleDragStart = (e, fromPos) => {
    if (submitted) return
    setDraggedIndex(fromPos)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(fromPos))
    e.target.classList.add('opacity-50')
  }
  const handleDragEnd = (e) => {
    e.target.classList.remove('opacity-50')
    setDraggedIndex(null)
  }
  const handleDragOver = (e, toPos) => {
    e.preventDefault()
    if (submitted || draggedIndex === null || draggedIndex === toPos) return
    e.dataTransfer.dropEffect = 'move'
  }
  const handleDrop = (e, toPos) => {
    e.preventDefault()
    if (submitted || draggedIndex === null) return
    const fromPos = draggedIndex
    if (fromPos === toPos) return
    setOrder((prev) => {
      const next = [...prev]
      const [removed] = next.splice(fromPos, 1)
      next.splice(toPos, 0, removed)
      return next
    })
    setDraggedIndex(null)
  }

  const handleSubmit = () => {
    setSubmitted(true)
    if (typeof onSegmentResult === 'function') onSegmentResult(segment.id, isCorrect)
  }
  const card = dark ? 'rounded-xl border border-slate-600 bg-slate-800 p-4' : 'rounded-xl border border-slate-200 bg-white p-4'
  const meta = dark ? 'flex items-center gap-2 mb-3 text-xs text-slate-400' : 'flex items-center gap-2 mb-3 text-xs text-slate-500'
  const tag = dark ? 'bg-rose-500/80 text-white px-2 py-0.5 rounded' : 'bg-rose-100 text-rose-700 px-2 py-0.5 rounded'
  const promptCls = dark ? 'font-medium text-white mb-3' : 'font-medium text-bingo-dark mb-3'
  const itemBase = dark ? 'px-3 py-2 bg-slate-700 rounded-lg text-sm text-slate-200 cursor-grab active:cursor-grabbing border border-slate-600' : 'px-3 py-2 bg-slate-100 rounded-lg text-sm cursor-grab active:cursor-grabbing border border-slate-200'
  return (
    <div className={card}>
      <div className={meta}>
        <span className={tag}>环节 {index + 1}</span>
        <span>{SEGMENT_LABELS.drag_drop}</span>
      </div>
      <p className={promptCls}>{p.prompt || '请将下列选项拖拽到正确顺序'}</p>
      <div className={dark ? 'text-sm text-rose-200/90 bg-rose-500/20 rounded-lg px-3 py-2 mb-3 border border-rose-400/30' : 'text-sm text-rose-800 bg-rose-50 rounded-lg px-3 py-2 mb-3 border border-rose-200'}>
        <strong>操作说明：</strong>用鼠标<strong>按住方块并拖动</strong>到目标位置后松开，可多次拖动调整顺序；排好后点击下方「提交顺序」。
      </div>
      <div className="flex flex-wrap gap-2">
        {order.map((itemIndex, pos) => (
          <span
            key={`${itemIndex}-${pos}`}
            draggable={!submitted}
            onDragStart={(e) => handleDragStart(e, pos)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, pos)}
            onDrop={(e) => handleDrop(e, pos)}
            className={`${itemBase} ${!submitted ? 'hover:border-rose-400 dark:hover:border-rose-400' : ''}`}
          >
            {items[itemIndex]}
          </span>
        ))}
      </div>
      {!submitted ? (
        <button onClick={handleSubmit} className={`mt-3 px-4 py-2 rounded-lg text-sm font-medium ${dark ? 'bg-cyan-500 text-white' : 'bg-primary text-white'}`}>提交顺序</button>
      ) : (
        <div className={`mt-3 p-3 rounded-lg text-sm ${isCorrect ? (dark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-50 text-emerald-800') : dark ? 'bg-slate-700/50 text-slate-300' : 'bg-slate-50'}`}>
          {isCorrect ? '✓ 顺序正确！' : '已提交'}
          {p.explanation && <p className={dark ? 'mt-1 text-slate-400' : 'mt-1 text-slate-600'}>{p.explanation}</p>}
        </div>
      )}
    </div>
  )
}

function SegmentGame({ segment, index, dark }) {
  const p = segment.payload
  const card = dark ? 'rounded-xl border border-slate-600 bg-slate-800 p-6 text-center' : 'rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-6 text-center'
  const meta = dark ? 'flex items-center gap-2 justify-center mb-2 text-xs text-slate-400' : 'flex items-center gap-2 justify-center mb-2 text-xs text-slate-500'
  const tag = dark ? 'bg-lime-500/80 text-white px-2 py-0.5 rounded' : 'bg-lime-100 text-lime-700 px-2 py-0.5 rounded'
  const titleCls = dark ? 'font-medium text-white' : 'font-medium text-bingo-dark'
  return (
    <div className={card}>
      <div className={meta}>
        <span className={tag}>环节 {index + 1}</span>
        <span>{SEGMENT_LABELS.game}</span>
      </div>
      <p className="text-2xl mb-2">🎮</p>
      <p className={titleCls}>{p.title || p.gameType || '游戏环节'}</p>
      <button className={`mt-3 px-4 py-2 rounded-lg text-sm font-medium ${dark ? 'bg-cyan-500 text-white' : 'bg-primary text-white'}`}>开始游戏</button>
    </div>
  )
}

function SegmentAIExperiment({ segment, index, dark }) {
  const p = segment.payload
  const card = dark ? 'rounded-xl border border-cyan-500/50 bg-slate-800 p-5' : 'rounded-xl border border-primary/30 bg-cyan-50/50 p-5'
  const meta = dark ? 'flex items-center gap-2 mb-2 text-xs text-slate-400' : 'flex items-center gap-2 mb-2 text-xs text-slate-500'
  const tag = dark ? 'bg-cyan-500/80 text-white px-2 py-0.5 rounded' : 'bg-primary/20 text-primary px-2 py-0.5 rounded'
  const titleCls = dark ? 'font-semibold text-white text-lg' : 'font-semibold text-bingo-dark text-lg'
  const descCls = dark ? 'text-sm text-slate-300 mt-1' : 'text-sm text-slate-600 mt-1'
  return (
    <div className={card}>
      <div className={meta}>
        <span className={tag}>环节 {index + 1}</span>
        <span>{SEGMENT_LABELS.ai_experiment}</span>
      </div>
      <p className={titleCls}>{p.title}</p>
      {p.description && <p className={descCls}>{p.description}</p>}
      <button className={`mt-4 px-5 py-2.5 rounded-xl text-sm font-medium transition ${dark ? 'bg-cyan-500 hover:bg-cyan-400 text-white' : 'bg-primary hover:bg-primary/90 text-white'}`}>
        进入 AI 实验
      </button>
    </div>
  )
}

// 语音题（听音选答）：题干是语音，选项是文字或图片
function SegmentAudioChoice({ segment, index, dark, onSegmentResult }) {
  const p = segment.payload
  const options = p.options || []
  const optionImages = p.optionImages || []
  const audioUrl = p.audioUrl || p.questionAudio || ''
  const [selected, setSelected] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef(null)
  const isCorrect = submitted && selected === p.correctIndex
  const handleSubmit = () => {
    setSubmitted(true)
    if (typeof onSegmentResult === 'function') onSegmentResult(segment.id, selected === p.correctIndex)
  }
  const card = dark ? 'rounded-xl border border-slate-600 bg-slate-800 p-4' : 'rounded-xl border border-slate-200 bg-white p-4'
  const meta = dark ? 'flex items-center gap-2 mb-3 text-xs text-slate-400' : 'flex items-center gap-2 mb-3 text-xs text-slate-500'
  const tag = dark ? 'bg-orange-500/80 text-white px-2 py-0.5 rounded' : 'bg-orange-100 text-orange-700 px-2 py-0.5 rounded'
  const hintCls = dark ? 'text-slate-400 text-sm mb-3' : 'text-slate-600 text-sm mb-3'
  const optBase = 'flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition '
  const hasImages = optionImages.some(Boolean)
  return (
    <div className={card}>
      <div className={meta}>
        <span className={tag}>环节 {index + 1}</span>
        <span>{SEGMENT_LABELS.audio_choice}</span>
      </div>
      <p className={hintCls}>听语音题干，选择正确答案</p>
      <div className={`mb-4 p-4 rounded-xl ${dark ? 'bg-slate-700/80' : 'bg-slate-100'}`}>
        {audioUrl ? (
          <>
            <audio ref={audioRef} src={audioUrl} onPlay={() => setPlaying(true)} onEnded={() => setPlaying(false)} onPause={() => setPlaying(false)} />
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => (playing ? audioRef.current?.pause() : audioRef.current?.play())}
                className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xl ${dark ? 'bg-orange-500 hover:bg-orange-400 text-white' : 'bg-orange-500 hover:bg-orange-400 text-white'}`}
              >
                {playing ? '⏸' : '▶'}
              </button>
              <span className={dark ? 'text-slate-300 text-sm' : 'text-slate-600 text-sm'}>{playing ? '正在播放题干…' : '点击播放语音题干'}</span>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3 text-slate-500">
            <span className="text-2xl">🎤</span>
            <span className="text-sm">（暂无题干音频，请根据选项作答）</span>
          </div>
        )}
      </div>
      <p className={dark ? 'text-slate-300 text-sm mb-2' : 'text-slate-600 text-sm mb-2'}>选项（文字或图片）：</p>
      <div className={hasImages ? 'grid grid-cols-2 gap-3' : 'space-y-2'}>
        {options.map((opt, i) => (
          <label
            key={i}
            className={`${optBase} ${dark ? 'text-slate-200 border-slate-600 hover:border-slate-500' : 'border-slate-200 hover:border-slate-300'} ${selected === i ? (dark ? 'border-orange-500 bg-orange-500/20' : 'border-orange-500 bg-orange-50') : ''} ${submitted && i === p.correctIndex ? (dark ? 'border-emerald-500 bg-emerald-500/20' : 'border-emerald-500 bg-emerald-50') : ''} ${submitted && selected === i && selected !== p.correctIndex ? (dark ? 'border-red-400 bg-red-500/20' : 'border-red-300 bg-red-50') : ''}`}
          >
            <input type="radio" name={`audio-choice-${segment.id}`} checked={selected === i} onChange={() => setSelected(i)} disabled={submitted} className="sr-only" />
            {optionImages[i] ? (
              <>
                <img src={optionImages[i]} alt="" className="w-14 h-14 object-cover rounded shrink-0" />
                <span className="text-sm">{String.fromCharCode(65 + i)}. {opt}</span>
              </>
            ) : (
              <span className="text-sm">{String.fromCharCode(65 + i)}. {opt}</span>
            )}
          </label>
        ))}
      </div>
      {!submitted ? (
        <button onClick={handleSubmit} disabled={selected === null} className={`mt-3 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 ${dark ? 'bg-orange-500 text-white' : 'bg-primary text-white'}`}>提交</button>
      ) : (
        <div className={`mt-3 p-3 rounded-lg text-sm ${isCorrect ? (dark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-50 text-emerald-800') : dark ? 'bg-amber-500/20 text-amber-200' : 'bg-amber-50 text-amber-800'}`}>
          {isCorrect ? '✓ 回答正确！' : '正确答案：' + (options[p.correctIndex] || '')}
          {p.explanation && <p className={dark ? 'mt-1 text-slate-400' : 'mt-1 text-slate-600'}>{p.explanation}</p>}
        </div>
      )}
    </div>
  )
}

function SegmentBlock({ segment, index, dark, videoPlaying, onVideoPlay, onSegmentResult }) {
  const common = { segment, index, dark, onSegmentResult }
  switch (segment.type) {
    case 'video':
      return (
        <SegmentVideo
          {...common}
          controlledPlaying={videoPlaying}
          onPlay={onVideoPlay}
        />
      )
    case 'choice':
      return <SegmentChoice {...common} />
    case 'multi_choice':
      return <SegmentMultiChoice {...common} />
    case 'image_choice':
      return <SegmentImageChoice {...common} />
    case 'fill_blank':
      return <SegmentFillBlank {...common} />
    case 'match':
      return <SegmentMatch {...common} />
    case 'drag_drop':
      return <SegmentDragDrop {...common} />
    case 'game':
      return <SegmentGame {...common} />
    case 'audio_choice':
      return <SegmentAudioChoice {...common} />
    case 'ai_experiment':
      return <SegmentAIExperiment {...common} />
    default:
      return <div className={dark ? 'rounded-xl border border-slate-600 bg-slate-800 p-4 text-slate-400 text-sm' : 'rounded-xl border border-slate-200 p-4 text-slate-500 text-sm'}>未知环节类型</div>
  }
}

// ─── 单视频课时 Mock（无环节时使用） ─────────────────────────────
function LegacyVideoPlayer({ lesson, onClose }) {
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl overflow-hidden w-full max-w-3xl shadow-2xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="relative bg-slate-900 aspect-video flex flex-col items-center justify-center shrink-0 overflow-hidden">
          {!playing ? (
            <>
              <div className="absolute inset-0">
                <img src={DEFAULT_VIDEO_POSTER} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/45" />
              </div>
              <div className="relative z-10 text-6xl mb-4">▶️</div>
              <p className="relative z-10 text-white/90 text-sm text-center px-4">{lesson.title}</p>
              <button onClick={() => setPlaying(true)} className="relative z-10 mt-4 bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl font-medium transition">开始播放</button>
            </>
          ) : (
            <div className="text-center">
              <div className="text-5xl animate-pulse mb-3">🎬</div>
              <p className="text-white text-sm font-medium">{lesson.title}</p>
              <p className="text-white/50 text-xs mt-1">正在播放 · {lesson.duration}</p>
            </div>
          )}
          <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm transition">✕</button>
        </div>
        <div className="p-4 flex items-center justify-between gap-4 border-t border-slate-100">
          <div>
            <p className="font-semibold text-bingo-dark text-sm">{lesson.title}</p>
            <p className="text-xs text-slate-500 mt-0.5">时长：{lesson.duration}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">倍速：</span>
            {[0.75, 1, 1.25, 1.5, 2].map(s => (
              <button key={s} onClick={() => setSpeed(s)} className={`text-xs px-2 py-1 rounded-lg transition ${speed === s ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{s}x</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── 当前环节的快捷按钮配置（用于底部「进入环节」） ─────────────────
function getSegmentShortcut(segment) {
  if (!segment) return null
  switch (segment.type) {
    case 'video':
      return { label: '开始播放', key: 'video' }
    case 'game':
      return { label: '开始游戏', key: 'game' }
    case 'ai_experiment':
      return { label: '进入实验', key: 'ai_experiment' }
    case 'choice':
      return { label: '作答', key: 'choice' }
    case 'multi_choice':
      return { label: '作答', key: 'multi_choice' }
    case 'image_choice':
      return { label: '作答', key: 'image_choice' }
    case 'fill_blank':
      return { label: '作答', key: 'fill_blank' }
    case 'match':
      return { label: '连线', key: 'match' }
    case 'drag_drop':
      return { label: '拖拽作答', key: 'drag_drop' }
    case 'audio_choice':
      return { label: '听音选答', key: 'audio_choice' }
    default:
      return null
  }
}

// ─── 根据课时、环节与答题结果生成学习评价总结（含知识点与学情） ─────────────────
function buildLessonSummary(lesson, segments, segmentResults = {}) {
  const names = (segments || []).map((s) => SEGMENT_LABELS[s.type] || s.type).filter(Boolean)
  const partList = names.length > 0 ? names.join('、') : '视频学习'
  const line1 = `您已完成「${lesson.title}」，共 ${segments?.length || 1} 个环节。`
  const line2 = `本课包含：${partList}。`
  const line3 = '建议回顾重点内容、完成课后练习，巩固学习效果。'

  // 本节课掌握知识点：由环节类型归纳
  const knowledgeLabels = {
    video: '视频学习与理解',
    choice: '单选题知识点巩固',
    multi_choice: '多选题综合判断',
    image_choice: '图片选择题观察与判断',
    fill_blank: '填空题知识点应用',
    match: '连线题逻辑关联',
    drag_drop: '拖拽题顺序与逻辑',
    game: '游戏互动巩固',
    audio_choice: '听音选答与理解',
    ai_experiment: 'AI实验体验与认知',
  }
  const knowledgePoints = [...new Set((segments || []).map((s) => knowledgeLabels[s.type] || SEGMENT_LABELS[s.type]).filter(Boolean))]

  // 学情：答题统计
  const resultEntries = Object.entries(segmentResults)
  const totalAnswers = resultEntries.length
  const correctCount = resultEntries.filter(([, correct]) => correct).length
  const correctRate = totalAnswers > 0 ? Math.round((correctCount / totalAnswers) * 100) : 100
  const learningStatus = totalAnswers > 0
    ? `互动答题共 ${totalAnswers} 题，答对 ${correctCount} 题${totalAnswers === correctCount ? '，全部正确。' : `，正确率 ${correctRate}%。`}`
    : '本课已完成所有环节学习。'

  // 综合评价：结合课程内容与学情生成
  const lessonTitle = lesson.title || '本课'
  const knowledgeSummary = knowledgePoints.length > 0 ? knowledgePoints.slice(0, 4).join('、') : partList
  let comprehensiveEvaluation = ''
  if (totalAnswers === 0) {
    comprehensiveEvaluation = `本课「${lessonTitle}」以视频、互动与实验等环节为主，您已完整参与全部 ${segments?.length || 1} 个环节。建议课后回顾「${knowledgeSummary}」等内容，巩固学习效果。`
  } else if (correctCount === totalAnswers) {
    comprehensiveEvaluation = `结合本课「${lessonTitle}」的内容（含${partList}），您在 ${totalAnswers} 道互动题中全部答对，表现优秀，已较好掌握本课知识点。建议继续保持，完成后续课时。`
  } else if (correctRate >= 80) {
    comprehensiveEvaluation = `本课「${lessonTitle}」涵盖${knowledgeSummary}等，您完成了全部环节，互动答题正确率 ${correctRate}%，对本课重点掌握较好。建议简要回顾错题，巩固后再进入下一课。`
  } else {
    comprehensiveEvaluation = `本课「${lessonTitle}」涉及${knowledgeSummary}等内容，您已完成学习，当前互动正确率 ${correctRate}%。建议重点回顾错题与「${knowledgeSummary}」相关部分，巩固后再继续下一课，效果会更好。`
  }

  return { line1, line2, line3, partList, knowledgePoints, learningStatus, totalAnswers, correctCount, comprehensiveEvaluation }
}

// 环节目录里显示的简短副标题（不抢主操作区）
function getSegmentPickerSubtitle(segment) {
  const p = segment.payload || {}
  const raw = p.title || p.question || p.prompt || ''
  if (!raw) return null
  return raw.length > 24 ? `${raw.slice(0, 24)}…` : raw
}

// ─── 课时播放器：始终一屏一个环节 + 底部固定 上一步 / 快捷 / 下一步 ─────────────────
function LessonPlayer({ lesson, onClose }) {
  // 无环节时也做成「单环节」统一用同一套一屏 UI，保证始终有上一步/下一步
  const rawSegments = lesson.segments && lesson.segments.length > 0
    ? lesson.segments
    : [{ id: 'single', type: 'video', sort: 0, payload: { url: lesson.videoUrl || '', title: lesson.title, duration: typeof lesson.duration === 'string' ? 45 : lesson.duration || 45 } }]
  const segments = [...rawSegments].sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))

  const [currentStep, setCurrentStep] = useState(0)
  const [videoPlaying, setVideoPlaying] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [showSegmentPicker, setShowSegmentPicker] = useState(false)
  const [segmentPickerDrawerIn, setSegmentPickerDrawerIn] = useState(false)
  const [segmentResults, setSegmentResults] = useState({})
  const onSegmentResult = (segmentId, correct) => setSegmentResults((prev) => ({ ...prev, [segmentId]: correct }))
  const total = segments.length
  const isFirst = currentStep <= 0
  const isLast = currentStep >= total - 1
  const currentSegment = segments[currentStep]
  const shortcut = currentSegment ? getSegmentShortcut(currentSegment) : null

  const goStep = (dir) => {
    setVideoPlaying(false)
    setCurrentStep((s) => (dir === 'prev' ? Math.max(0, s - 1) : Math.min(total - 1, s + 1)))
  }

  const handleFinish = () => {
    setShowSummary(true)
  }

  /** 总结页：从头再学一遍（环节归零 + 清空本课答题记录） */
  const handleStudyAgain = () => {
    setSegmentResults({})
    setVideoPlaying(false)
    setShowSegmentPicker(false)
    setCurrentStep(0)
    setShowSummary(false)
  }

  const handleShortcutClick = () => {
    if (currentSegment?.type === 'video') setVideoPlaying(true)
  }

  const jumpToSegment = (idx) => {
    if (idx < 0 || idx >= total || idx === currentStep) {
      setShowSegmentPicker(false)
      return
    }
    setVideoPlaying(false)
    setCurrentStep(idx)
    setShowSegmentPicker(false)
  }

  useEffect(() => {
    if (!showSegmentPicker) {
      setSegmentPickerDrawerIn(false)
      return
    }
    setSegmentPickerDrawerIn(false)
    const t = window.setTimeout(() => setSegmentPickerDrawerIn(true), 20)
    const onKey = (e) => e.key === 'Escape' && setShowSegmentPicker(false)
    window.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('keydown', onKey)
    }
  }, [showSegmentPicker])

  // 学完整节课后显示学习评价总结
  if (showSummary) {
    const summary = buildLessonSummary(lesson, segments, segmentResults)
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label="学习评价总结"
        className="fixed inset-0 w-screen z-[99999] flex flex-col bg-slate-900"
        style={{ height: '100dvh', maxHeight: '100dvh' }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl mx-auto lg:max-w-none lg:mx-0 flex flex-col flex-1 min-h-0 bg-white lg:shadow-none shadow-2xl rounded-t-2xl lg:rounded-none overflow-auto"
          style={{ height: '100%' }}
        >
          <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-10 text-center">
            <div className="w-full max-w-lg mx-auto">
              <div className="text-5xl lg:text-6xl mb-4">🎓</div>
              <h2 className="text-xl lg:text-2xl font-bold text-bingo-dark mb-6">学习评价总结</h2>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 lg:p-6 text-left space-y-3">
                <p className="text-slate-700 leading-relaxed">{summary.line1}</p>
                <p className="text-slate-700 leading-relaxed">{summary.line2}</p>
                <p className="text-slate-600 text-sm leading-relaxed">{summary.line3}</p>
                <div className="pt-3 border-t border-slate-200/80">
                  <p className="font-medium text-slate-800 mb-1.5">本节课掌握知识点</p>
                  <ul className="text-slate-600 text-sm list-disc list-inside space-y-0.5">
                    {(summary.knowledgePoints || []).map((point, i) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </div>
                <div className="pt-3 border-t border-slate-200/80">
                  <p className="font-medium text-slate-800 mb-1.5">答题等学情</p>
                  <p className="text-slate-600 text-sm leading-relaxed">{summary.learningStatus}</p>
                </div>
                {summary.comprehensiveEvaluation && (
                  <div className="pt-3 border-t border-slate-200/80">
                    <p className="font-medium text-slate-800 mb-1.5">综合评价</p>
                    <p className="text-slate-700 text-sm leading-relaxed">{summary.comprehensiveEvaluation}</p>
                  </div>
                )}
              </div>
              <p className="text-sm text-slate-500 mt-4">继续加油，完成全部课时可获得学习证书</p>
              <div className="mt-6 w-full max-w-xs mx-auto flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleStudyAgain}
                  className="w-full py-3 rounded-xl text-base font-medium border-2 border-primary text-primary bg-white hover:bg-primary/5"
                >
                  再学一遍
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 rounded-xl text-base font-medium bg-primary text-white hover:bg-primary/90"
                >
                  返回学习中心
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="课时播放"
      onClick={onClose}
      className="fixed inset-0 w-screen z-[99999] flex flex-col bg-[#0f172a]"
      style={{ height: '100dvh', maxHeight: '100dvh' }}
    >
      {/* 深色沉浸：整页深色，Web 满屏 / 手机端居中 */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-full mx-0 flex flex-col flex-1 min-h-0 bg-[#0f172a] shadow-none border-0"
        style={{ height: '100%' }}
      >
        {/* 顶部栏 - 深色（环节目录在顶栏，与主作答区分离，避免误触） */}
        <header className="shrink-0 h-14 px-3 border-b border-slate-600/80 flex items-center justify-between gap-2 bg-slate-800/90">
          <h3 className="font-bold text-white text-sm m-0 overflow-hidden text-ellipsis whitespace-nowrap flex-1 min-w-0 min-w-[3rem]">
            {lesson.title}
          </h3>
          <div className="flex items-center gap-2 shrink-0">
            {total > 1 && (
              <button
                type="button"
                onClick={() => setShowSegmentPicker(true)}
                aria-haspopup="dialog"
                aria-expanded={showSegmentPicker}
                aria-label="环节目录，选择要去的环节"
                className="text-xs px-2.5 py-1.5 rounded-lg font-medium bg-slate-700/90 hover:bg-slate-600 text-slate-200 border border-slate-500/60"
              >
                目录
              </button>
            )}
            <span className="text-xs text-slate-400 tabular-nums">环节 {currentStep + 1}/{total}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="w-9 h-9 rounded-full bg-slate-600/80 hover:bg-slate-500 text-slate-200 shrink-0 flex items-center justify-center text-base"
          >
            ✕
          </button>
        </header>

        {/* 中间：环节内容水平 + 垂直居中（内容少时居中一屏，内容多时整块可滚动） */}
        <main className="flex-1 min-h-0 overflow-y-auto bg-[#0f172a]">
          <div className="min-h-full flex justify-center items-center p-2 sm:p-3 md:p-4 box-border">
            <div className="w-full max-w-full sm:max-w-[min(100%,48rem)] md:max-w-[min(100%,56rem)] lg:max-w-[min(100%,72rem)] xl:max-w-[min(100%,80rem)] shrink-0">
            <SegmentBlock
              key={currentSegment.id}
              segment={currentSegment}
              index={currentStep}
              dark
              videoPlaying={currentSegment.type === 'video' ? videoPlaying : undefined}
              onVideoPlay={currentSegment.type === 'video' ? () => setVideoPlaying(true) : undefined}
              onSegmentResult={onSegmentResult}
            />
            </div>
          </div>
        </main>

        {/* 底部栏 - 深色 */}
        <footer className="shrink-0 min-h-16 py-3 px-4 border-t border-slate-600/80 bg-slate-800/90 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => goStep('prev')}
            disabled={isFirst}
            className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium ${isFirst ? 'text-slate-500 bg-slate-700/50 cursor-not-allowed' : 'text-slate-200 bg-slate-600/80 hover:bg-slate-500 border border-slate-500'}`}
          >
            上一步
          </button>
          <div className="flex items-center gap-2 shrink-0">
            {shortcut && (
              <button
                type="button"
                onClick={handleShortcutClick}
                className="px-3 py-2 rounded-xl text-sm font-medium bg-cyan-500 hover:bg-cyan-400 text-white border-0 cursor-pointer"
              >
                {shortcut.label}
              </button>
            )}
            <span className="text-sm text-slate-400 w-12 text-center tabular-nums">{currentStep + 1} / {total}</span>
          </div>
          {isLast ? (
            <button type="button" onClick={handleFinish} className="shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium bg-primary text-white cursor-pointer">
              完成
            </button>
          ) : (
            <button type="button" onClick={() => goStep('next')} className="shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium bg-primary text-white cursor-pointer">
              下一步
            </button>
          )}
        </footer>

        {/* 环节目录：右侧抽拉抽屉，左侧遮罩关闭；不打断当前学习 / 作答 */}
        {showSegmentPicker && total > 1 && (
          <div
            className="absolute inset-0 z-[100] flex justify-end overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-label="选择环节"
          >
            <button
              type="button"
              aria-label="关闭目录"
              className="absolute inset-0 bg-black/55 border-0 cursor-default transition-opacity"
              onClick={() => setShowSegmentPicker(false)}
            />
            <div
              className={`relative z-10 h-full w-[min(20rem,88vw)] flex flex-col bg-slate-800 border-l border-slate-600 shadow-[-12px_0_32px_rgba(0,0,0,0.35)] transition-transform duration-300 ease-out will-change-transform ${
                segmentPickerDrawerIn ? 'translate-x-0' : 'translate-x-full'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="shrink-0 px-4 py-3 border-b border-slate-600 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">环节目录</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">点左侧空白或「关闭」仍留在此环节</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSegmentPicker(false)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-slate-700 text-slate-200 hover:bg-slate-600 shrink-0"
                >
                  关闭
                </button>
              </div>
              <ul className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1">
                {segments.map((seg, i) => {
                  const typeLabel = SEGMENT_LABELS[seg.type] || seg.type
                  const sub = getSegmentPickerSubtitle(seg)
                  const isHere = i === currentStep
                  return (
                    <li key={seg.id}>
                      <button
                        type="button"
                        onClick={() => jumpToSegment(i)}
                        className={`w-full text-left rounded-xl px-3 py-2.5 text-sm transition border ${
                          isHere
                            ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-200'
                            : 'bg-slate-700/40 border-slate-600/50 text-slate-200 hover:bg-slate-700/80'
                        }`}
                      >
                        <span className="font-medium tabular-nums">{i + 1}.</span>{' '}
                        <span className="font-medium">{typeLabel}</span>
                        {sub && <span className="block text-xs text-slate-400 mt-0.5 truncate">{sub}</span>}
                        {isHere && <span className="text-[10px] text-cyan-300/90 mt-1 inline-block">当前环节</span>}
                      </button>
                    </li>
                  )
                })}
              </ul>
              <p className="shrink-0 px-4 py-2 text-[11px] text-slate-500 text-center border-t border-slate-600 bg-slate-800/95">
                仅在选择其他序号时才会切换；未提交作答返回后需重新作答
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── 根据课程与课时生成整门课程学习总结（多维度，让学生感觉学有所值） ─────────────────
function buildCourseSummary(course) {
  const lessons = course.lessons || []
  const totalCount = lessons.length
  const lessonTitles = lessons.map((l) => l.title).filter(Boolean)
  const totalMinutes = lessons.reduce((sum, l) => {
    const d = l.duration
    if (typeof d === 'number') return sum + d
    if (typeof d === 'string' && d.includes('分钟')) return sum + parseInt(d, 10) || 0
    return sum + 40
  }, 0)
  const hours = Math.floor(totalMinutes / 60)
  const mins = totalMinutes % 60
  const timeStr = hours > 0 ? `约 ${hours} 小时${mins > 0 ? mins + ' 分钟' : ''}` : `约 ${totalMinutes} 分钟`
  const segmentCount = lessons.reduce((s, l) => s + (l.segments?.length || 1), 0)

  return {
    courseTitle: course.title,
    totalLessons: totalCount,
    totalTime: timeStr,
    totalSegments: segmentCount,
    lessonTitles,
    completionLine: `您已完成「${course.title}」全部 ${totalCount} 课时，共 ${segmentCount} 个学习环节。`,
    scopeIntro: '本课程您已系统学习以下内容：',
    outcomes: [
      '完成从入门到巩固的完整学习路径',
      '通过视频、互动题、练习与实验等多形式掌握核心知识点',
      '具备本课程所对应的能力水平，可应用于后续学习或实践',
    ],
    timeInvested: `累计学习时长 ${timeStr}，您的坚持与投入值得肯定。`,
    encouragement: '恭喜您完成整门课程！建议适时回顾重点课时，巩固记忆；完成考核后可领取学习证书，为学习之旅留下证明。',
    certificateTip: '前往「领取证书」即可获得本课程学习证书。',
  }
}

// ─── 单门课程卡片（可展开） ─────────────────────────────────
function CourseCard({ course, onPlayLesson, onShowCourseSummary }) {
  const [expanded, setExpanded] = useState(false)
  const [watched, setWatched] = useState(() =>
    Object.fromEntries(course.lessons.map(l => [l.id, l.watched]))
  )

  const watchedCount = Object.values(watched).filter(Boolean).length
  const totalCount = course.lessons.length
  const progressPct = Math.round((watchedCount / totalCount) * 100)
  const allCompleted = progressPct === 100

  const progressColor =
    progressPct === 100 ? 'bg-emerald-500' :
    progressPct >= 50 ? 'bg-primary' :
    'bg-amber-400'

  const toggleWatched = (id) => {
    setWatched(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="card overflow-hidden border border-slate-200 hover:border-primary/30 transition">
      {/* 课程头部 */}
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="w-full text-left p-5 flex items-start gap-4 hover:bg-slate-50/60 transition"
      >
        {/* 封面图标 */}
        <div className={`shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br ${course.color} flex items-center justify-center text-2xl`}>
          {course.cover}
        </div>
        {/* 课程信息 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-bingo-dark text-sm leading-snug">{course.title}</h3>
            {course.cert && (
              <span className="shrink-0 text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">已获证书</span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{course.sub}</p>
          {/* 进度 */}
          <div className="mt-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500">学习进度</span>
              <span className={`text-xs font-bold ${progressPct === 100 ? 'text-emerald-600' : 'text-primary'}`}>
                {progressPct === 100 ? '✓ 已完成' : `${progressPct}% · ${watchedCount}/${totalCount}课时`}
              </span>
            </div>
            <ProgressBar value={progressPct} color={progressColor} />
          </div>
          {progressPct < 100 && (
            <p className="text-xs text-slate-400 mt-1.5">
              上次学到：<span className="text-primary">{course.lastLesson}</span>
            </p>
          )}
        </div>
        {/* 展开箭头 */}
        <span className={`shrink-0 text-slate-400 transition-transform mt-1 ${expanded ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {/* 展开的课时列表 */}
      {expanded && (
        <div className="border-t border-slate-100 divide-y divide-slate-50">
          {course.lessons.map((lesson, idx) => {
            const isDone = watched[lesson.id]
            return (
              <div
                key={lesson.id}
                className={`flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition group ${lesson.isCurrent ? 'bg-primary/5' : ''}`}
              >
                {/* 序号/状态 */}
                <div className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition
                  ${isDone ? 'bg-emerald-100 text-emerald-600' : lesson.isCurrent ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}
                >
                  {isDone ? '✓' : idx + 1}
                </div>
                {/* 课时标题 */}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${lesson.isCurrent ? 'text-primary' : isDone ? 'text-slate-500' : 'text-bingo-dark'}`}>
                    {lesson.title}
                    {lesson.isCurrent && <span className="ml-2 text-[10px] bg-primary/15 text-primary px-1.5 py-0.5 rounded-full">继续学习</span>}
                  </p>
                  <p className="text-xs text-slate-400">
                    {lesson.duration}
                    {lesson.segments && lesson.segments.length > 0 && (
                      <span className="ml-1.5 text-primary">· 含{lesson.segments.length}个环节</span>
                    )}
                  </p>
                </div>
                {/* 操作按钮 */}
                <div className="shrink-0 flex items-center gap-2">
                  <button
                    onClick={() => onPlayLesson(lesson)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition
                      ${lesson.isCurrent
                        ? 'bg-primary text-white hover:bg-primary/90'
                        : isDone
                          ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 opacity-0 group-hover:opacity-100'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 opacity-0 group-hover:opacity-100'
                      }`}
                  >
                    {isDone ? '重看' : '播放'}
                  </button>
                  <button
                    onClick={() => toggleWatched(lesson.id)}
                    className={`text-[11px] px-2.5 py-1.5 rounded-lg transition opacity-0 group-hover:opacity-100
                      ${isDone ? 'text-slate-400 hover:text-red-500' : 'text-emerald-600 hover:bg-emerald-50'}`}
                    title={isDone ? '标记未学' : '标记已学'}
                  >
                    {isDone ? '取消' : '✓ 标记已学'}
                  </button>
                </div>
              </div>
            )
          })}

          {/* 课时列表最后：整个课程的学习总结入口（始终显示，全部完成后可点击） */}
          {onShowCourseSummary && (
            <div className="border-t border-slate-100">
              {allCompleted ? (
                <button
                  type="button"
                  onClick={() => onShowCourseSummary(course)}
                  className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-primary/5 transition text-left"
                >
                  <div className="shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm">📋</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-bingo-dark">整个课程的学习总结</p>
                    <p className="text-xs text-slate-500">查看本课程学习总结与综合评价</p>
                  </div>
                  <span className="shrink-0 text-slate-400">→</span>
                </button>
              ) : (
                <div className="w-full flex items-center gap-3 px-5 py-3.5 text-left text-slate-400">
                  <div className="shrink-0 w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-sm">📋</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-500">整个课程的学习总结</p>
                    <p className="text-xs text-slate-400">完成全部 {totalCount} 课时后可查看</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 课程底部：证书/完成提示 */}
          <div className="px-5 py-3 bg-slate-50/70 flex items-center justify-between gap-4">
            {progressPct === 100 ? (
              <>
                <p className="text-sm text-emerald-700 font-medium">🎉 恭喜完成全部课时！</p>
                <Link to="/cert" className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-1.5 rounded-lg font-medium transition">
                  领取证书 →
                </Link>
              </>
            ) : (
              <>
                <p className="text-xs text-slate-500">完成全部课时并通过考核后可领取证书</p>
                <button
                  onClick={() => onPlayLesson(course.lessons.find(l => !watched[l.id]))}
                  className="text-xs bg-primary hover:bg-primary/90 text-white px-4 py-1.5 rounded-lg font-medium transition"
                >
                  继续学习
                </button>
              </>
            )}
          </div>
        </div>
      )}

    </div>
  )
}

// 第一个带「环节」的课时，用于快速体验入口
const FIRST_LESSON_WITH_SEGMENTS = MY_COURSES[0]?.lessons?.find((l) => l.segments?.length > 0) ?? MY_COURSES[0]?.lessons?.[0]

// ─── 主页面 ─────────────────────────────────────────────────
export default function Study() {
  const [playingLesson, setPlayingLesson] = useState(null)
  const [courseSummaryCourse, setCourseSummaryCourse] = useState(null)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/profile" className="text-slate-500 hover:text-primary text-sm">← 个人中心</Link>
      </div>
      <h1 className="text-2xl font-bold text-bingo-dark mb-1">学习中心</h1>
      <p className="text-slate-500 text-sm mb-4">已购课程列表，点击课程可展开课时，随时继续学习</p>

      {/* 快速体验：一屏一环节 + 上一步/下一步/快捷按钮 */}
      {FIRST_LESSON_WITH_SEGMENTS && (
        <button
          type="button"
          onClick={() => setPlayingLesson(FIRST_LESSON_WITH_SEGMENTS)}
          className="w-full mb-6 p-4 rounded-xl border-2 border-primary bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-center transition flex items-center justify-center gap-2"
        >
          <span>👉</span>
          <span>点击这里体验「一屏一环节」上课</span>
          <span className="text-sm font-normal opacity-90">（{FIRST_LESSON_WITH_SEGMENTS.title}）</span>
        </button>
      )}

      {/* 总览统计 */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: '已购课程', value: MY_COURSES.length + ' 门', color: 'text-primary' },
          { label: '已完成', value: MY_COURSES.filter(c => c.progress === 100).length + ' 门', color: 'text-emerald-600' },
          { label: '已获证书', value: MY_COURSES.filter(c => c.cert).length + ' 张', color: 'text-amber-600' },
        ].map((s, i) => (
          <div key={i} className="card p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* 我的课程列表 */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title mb-0">我的课程</h2>
          <Link to="/courses" className="text-xs text-primary hover:underline">+ 继续选课</Link>
        </div>
        <div className="space-y-3">
          {MY_COURSES.map(course => (
            <CourseCard key={course.id} course={course} onPlayLesson={setPlayingLesson} onShowCourseSummary={setCourseSummaryCourse} />
          ))}
        </div>
      </section>

      {/* 学习领学分 */}
      <section className="mb-8">
        <h2 className="section-title mb-1">🏅 学习领学分</h2>
        <p className="text-slate-600 text-sm mb-4">完成课程学习、打卡任务，积累「缤果学分」，可兑换优惠券/课程/赛事报名折扣</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {[
            { action: '完成课程试听', score: '+5分', note: '每门课每天1次' },
            { action: '完成课程章节', score: '+15分', note: '章节完成自动到账' },
            { action: '课程考试满分', score: '+30分', note: '完课率100%学分翻倍' },
            { action: '成长计划阶段达成', score: '+50分', note: '阶段越高奖励越多' },
          ].map((s, i) => (
            <div key={i} className="card p-5 border-primary/20 hover:shadow-md transition">
              <p className="text-sm font-medium text-slate-700">{s.action}</p>
              <p className="text-primary font-bold text-lg mt-1">{s.score}</p>
              <p className="text-xs text-slate-400 mt-1">{s.note}</p>
            </div>
          ))}
        </div>
        <div className="card p-5 bg-cyan-50 border-primary/20 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-medium text-bingo-dark">学分可抵扣课程学费</p>
            <p className="text-sm text-slate-600 mt-0.5">100学分 = 10元课程抵扣，课程分享至朋友圈额外 +5分</p>
          </div>
          <Link to="/profile#score-bank" className="btn-primary text-sm px-4 py-2">查看我的学分</Link>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link to="/courses" className="btn-primary">去选课</Link>
        <Link to="/profile" className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">返回个人中心</Link>
      </div>

      {/* 课时播放器：挂载到 body，一屏一环节 + 上一步/下一步/快捷按钮 */}
      {playingLesson && createPortal(
        <LessonPlayer lesson={playingLesson} onClose={() => setPlayingLesson(null)} />,
        document.body
      )}

      {/* 整个课程的学习总结弹层（多维度总结，让学生感觉学有所值） */}
      {courseSummaryCourse && (() => {
        const s = buildCourseSummary(courseSummaryCourse)
        return createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="课程学习总结"
            className="fixed inset-0 w-screen z-[99999] flex flex-col bg-slate-900"
            style={{ height: '100dvh', maxHeight: '100dvh' }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl mx-auto lg:max-w-none lg:mx-0 flex flex-col flex-1 min-h-0 bg-white lg:shadow-none shadow-2xl rounded-t-2xl lg:rounded-none overflow-auto"
              style={{ height: '100%' }}
            >
              <div className="flex-1 flex flex-col items-center p-6 lg:p-10">
                <div className="w-full max-w-lg mx-auto text-center mb-6">
                  <div className="text-5xl lg:text-6xl mb-3">🎓</div>
                  <h2 className="text-xl lg:text-2xl font-bold text-bingo-dark mb-1">课程学习总结</h2>
                  <p className="text-sm text-slate-500">{s.courseTitle}</p>
                </div>
                <div className="w-full max-w-lg mx-auto rounded-2xl border border-slate-200 bg-slate-50/80 p-5 lg:p-6 text-left space-y-4 overflow-auto max-h-[60vh]">
                  <section>
                    <h3 className="text-sm font-semibold text-slate-800 mb-1.5">📊 完成情况</h3>
                    <p className="text-slate-700 text-sm leading-relaxed">{s.completionLine}</p>
                  </section>
                  <section>
                    <h3 className="text-sm font-semibold text-slate-800 mb-1.5">📚 课程涵盖</h3>
                    <p className="text-slate-600 text-sm mb-2">{s.scopeIntro}</p>
                    <ul className="text-slate-600 text-sm space-y-0.5 list-disc list-inside">
                      {s.lessonTitles.slice(0, 12).map((title, i) => (
                        <li key={i}>{title}</li>
                      ))}
                      {s.lessonTitles.length > 12 && <li className="text-slate-500">…共 {s.lessonTitles.length} 课时</li>}
                    </ul>
                  </section>
                  <section>
                    <h3 className="text-sm font-semibold text-slate-800 mb-1.5">✨ 学习收获</h3>
                    <ul className="text-slate-600 text-sm space-y-0.5 list-disc list-inside">
                      {s.outcomes.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </section>
                  <section>
                    <h3 className="text-sm font-semibold text-slate-800 mb-1.5">⏱ 学习投入</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{s.timeInvested}</p>
                  </section>
                  <section className="pt-2 border-t border-slate-200/80">
                    <p className="text-slate-700 text-sm leading-relaxed">{s.encouragement}</p>
                  </section>
                  <section className="rounded-lg bg-emerald-50 border border-emerald-200/80 p-3">
                    <p className="text-emerald-800 text-sm font-medium">🏅 {s.certificateTip}</p>
                  </section>
                </div>
                <div className="w-full max-w-lg mx-auto mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    to="/cert"
                    onClick={() => setCourseSummaryCourse(null)}
                    className="inline-flex justify-center py-3 px-5 rounded-xl text-base font-medium bg-emerald-500 text-white hover:bg-emerald-600"
                  >
                    领取证书
                  </Link>
                  <button
                    type="button"
                    onClick={() => setCourseSummaryCourse(null)}
                    className="inline-flex justify-center py-3 px-5 rounded-xl text-base font-medium bg-slate-100 text-slate-700 hover:bg-slate-200"
                  >
                    返回学习中心
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )
      })()}
    </div>
  )
}
