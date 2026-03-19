import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'

// ─── 课时环节类型（与后台一致：视频+互动+游戏+AI实验 任意组合） ─────────────────
const SEGMENT_LABELS = {
  video: '视频片段',
  choice: '选择题',
  fill_blank: '填空题',
  match: '连线题',
  drag_drop: '拖拽题',
  game: '游戏环节',
  ai_experiment: 'AI实验',
}

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
          { id: 's1-v', type: 'video', sort: 0, payload: { url: 'https://example.com/v1.mp4', title: '什么是AI', duration: 300 } },
          { id: 's1-c', type: 'choice', sort: 1, payload: { question: 'AI的全称是？', options: ['人工智慧', '人工智能', '自动推理'], correctIndex: 1, explanation: 'Artificial Intelligence（人工智能）' } },
          { id: 's1-ai', type: 'ai_experiment', sort: 2, payload: { title: '人脸识别小实验', description: '体验图像识别，上传一张照片试试看', experimentId: 'face-demo' } },
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
          {
            id: 's2-flip',
            type: 'game',
            sort: 1,
            payload: {
              gameType: 'flip_card',
              title: '翻翻卡游戏',
              config: {
                cards: [
                  { frontLabel: '?', backText: '人工智能' },
                  { frontLabel: '?', backText: '机器学习' },
                  { frontLabel: '?', backText: '深度学习' },
                ],
                question: '根据上面三张卡的内容，以下哪一个是 AI 的核心技术？',
                options: ['人工智能', '机器学习', '深度学习', '以上都是'],
                correctIndex: 3,
                explanation: '人工智能是总称，机器学习与深度学习都是其核心技术，所以以上都是。',
              },
            },
          },
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
  return (
    <div className={`rounded-xl overflow-hidden border ${dark ? 'border-slate-600 bg-slate-800' : 'border-slate-200 bg-slate-900'}`}>
      <div className={`flex items-center gap-2 px-3 py-2 text-xs ${dark ? 'bg-slate-700/80 text-slate-200' : 'bg-slate-800/80 text-white'}`}>
        <span className={dark ? 'bg-cyan-500/80 px-2 py-0.5 rounded text-white' : 'bg-primary/80 px-2 py-0.5 rounded text-white'}>环节 {index + 1}</span>
        <span>{SEGMENT_LABELS.video}</span>
        {p.title && <span className="text-slate-300">· {p.title}</span>}
      </div>
      <div className="aspect-video relative flex flex-col items-center justify-center text-white bg-slate-800/50">
        {!playing ? (
          <>
            {posterUrl ? (
              <div className="absolute inset-0">
                <img src={posterUrl} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center" />
              </div>
            ) : null}
            <div className="relative z-10 text-5xl mb-2">▶️</div>
            <button onClick={() => setPlaying(true)} className={`relative z-10 px-6 py-2 rounded-lg text-sm font-medium ${dark ? 'bg-cyan-500 hover:bg-cyan-400 text-white' : 'bg-primary hover:bg-primary/90 text-white'}`}>
              播放
            </button>
          </>
        ) : (
          <div className="text-center">
            <div className="text-4xl animate-pulse">🎬</div>
            <p className="text-sm mt-2">正在播放{p.duration ? ` · ${Math.floor(p.duration / 60)}:${String(p.duration % 60).padStart(2, '0')}` : ''}</p>
          </div>
        )}
      </div>
    </div>
  )
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
  const [pairs, setPairs] = useState([])
  const [submitted, setSubmitted] = useState(false)
  const handleSubmit = () => {
    setSubmitted(true)
    if (typeof onSegmentResult === 'function') onSegmentResult(segment.id, true)
  }
  const card = dark ? 'rounded-xl border border-slate-600 bg-slate-800 p-4' : 'rounded-xl border border-slate-200 bg-white p-4'
  const meta = dark ? 'flex items-center gap-2 mb-3 text-xs text-slate-400' : 'flex items-center gap-2 mb-3 text-xs text-slate-500'
  const tag = dark ? 'bg-violet-500/80 text-white px-2 py-0.5 rounded' : 'bg-violet-100 text-violet-700 px-2 py-0.5 rounded'
  const hint = dark ? 'text-sm text-slate-400 mb-3' : 'text-sm text-slate-600 mb-3'
  const itemBox = dark ? 'px-3 py-2 bg-slate-700 rounded-lg text-sm text-slate-200' : 'px-3 py-2 bg-slate-100 rounded-lg text-sm'
  return (
    <div className={card}>
      <div className={meta}>
        <span className={tag}>环节 {index + 1}</span>
        <span>{SEGMENT_LABELS.match}</span>
      </div>
      <p className={hint}>将左侧与右侧正确连线</p>
      <div className="flex gap-4 flex-wrap">
        <div className="space-y-2">
          {left.map((item, i) => (
            <div key={i} className={itemBox}>{item}</div>
          ))}
        </div>
        <div className={dark ? 'text-slate-500 self-center' : 'text-slate-400 self-center'}>→</div>
        <div className="space-y-2">
          {right.map((item, i) => (
            <div key={i} className={itemBox}>{item}</div>
          ))}
        </div>
      </div>
      {!submitted ? (
        <button onClick={handleSubmit} className={`mt-3 px-4 py-2 rounded-lg text-sm font-medium ${dark ? 'bg-cyan-500 text-white' : 'bg-primary text-white'}`}>完成连线</button>
      ) : (
        <div className={dark ? 'mt-3 p-3 rounded-lg text-sm bg-slate-700/50 text-slate-300' : 'mt-3 p-3 rounded-lg text-sm bg-slate-50 text-slate-700'}>已提交{p.explanation && <p className="mt-1">{p.explanation}</p>}</div>
      )}
    </div>
  )
}

function SegmentDragDrop({ segment, index, dark, onSegmentResult }) {
  const p = segment.payload
  const [order, setOrder] = useState((p.items || []).map((_, i) => i))
  const [submitted, setSubmitted] = useState(false)
  const correctOrder = p.correctOrder || []
  const isCorrect = correctOrder.length === order.length && correctOrder.every((c, i) => c === order[i])
  const handleSubmit = () => {
    setSubmitted(true)
    if (typeof onSegmentResult === 'function') onSegmentResult(segment.id, isCorrect)
  }
  const card = dark ? 'rounded-xl border border-slate-600 bg-slate-800 p-4' : 'rounded-xl border border-slate-200 bg-white p-4'
  const meta = dark ? 'flex items-center gap-2 mb-3 text-xs text-slate-400' : 'flex items-center gap-2 mb-3 text-xs text-slate-500'
  const tag = dark ? 'bg-rose-500/80 text-white px-2 py-0.5 rounded' : 'bg-rose-100 text-rose-700 px-2 py-0.5 rounded'
  const promptCls = dark ? 'font-medium text-white mb-3' : 'font-medium text-bingo-dark mb-3'
  const itemCls = dark ? 'px-3 py-2 bg-slate-700 rounded-lg text-sm text-slate-200' : 'px-3 py-2 bg-slate-100 rounded-lg text-sm'
  return (
    <div className={card}>
      <div className={meta}>
        <span className={tag}>环节 {index + 1}</span>
        <span>{SEGMENT_LABELS.drag_drop}</span>
      </div>
      <p className={promptCls}>{p.prompt || '请将下列选项拖拽到正确顺序'}</p>
      <div className="flex flex-wrap gap-2">
        {(p.items || []).map((item, i) => (
          <span key={i} className={itemCls}>{item}</span>
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

// ─── 翻翻卡游戏：三张卡翻转显示文字/图片，然后问答 ─────────────────
function FlipCardGame({ config, dark, onComplete }) {
  const cards = config?.cards || [
    { frontLabel: '?', backText: '人工智能' },
    { frontLabel: '?', backText: '机器学习' },
    { frontLabel: '?', backText: '深度学习' },
  ]
  const question = config?.question || '根据上面三张卡的内容，以下哪一个是 AI 的核心技术？'
  const options = config?.options || ['人工智能', '机器学习', '深度学习', '以上都是']
  const correctIndex = config?.correctIndex ?? 3
  const explanation = config?.explanation

  const [flipped, setFlipped] = useState(() => cards.map(() => false))
  const [showQuestion, setShowQuestion] = useState(false)
  const [selected, setSelected] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  const allFlipped = flipped.every(Boolean)
  const isCorrect = submitted && selected === correctIndex

  const toggleCard = (i) => {
    setFlipped((prev) => prev.map((v, j) => (j === i ? !v : v)))
  }

  const cardBg = dark ? 'bg-slate-700 border-slate-500' : 'bg-slate-100 border-slate-300'
  const cardFrontBg = dark ? 'bg-slate-600' : 'bg-slate-200'
  const cardBackBg = dark ? 'bg-slate-600' : 'bg-white'
  const textCls = dark ? 'text-white' : 'text-bingo-dark'
  const hintCls = dark ? 'text-slate-400' : 'text-slate-500'

  return (
    <div className="space-y-6">
      <p className={`text-sm ${hintCls} text-center`}>点击卡片翻开，查看内容后作答</p>
      {/* 每张卡 9:16 竖屏 */}
      <div className="flex justify-center gap-3 sm:gap-4">
        {cards.slice(0, 3).map((c, i) => (
          <button
            key={i}
            type="button"
            onClick={() => !submitted && toggleCard(i)}
            className="relative w-[28%] max-w-[120px] rounded-xl border-2 overflow-hidden cursor-pointer touch-manipulation flex-shrink-0"
            style={{ perspective: '600px', aspectRatio: '9/16' }}
          >
            <div
              className="absolute inset-0 transition-transform duration-300"
              style={{ transformStyle: 'preserve-3d', transform: flipped[i] ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
            >
              <div
                className={`absolute inset-0 flex items-center justify-center rounded-xl border-2 ${cardFrontBg} ${cardBg}`}
                style={{ backfaceVisibility: 'hidden' }}
              >
                <span className={`text-xl sm:text-2xl font-bold ${dark ? 'text-slate-300' : 'text-slate-500'}`}>
                  {c.frontLabel || '?'}
                </span>
              </div>
              <div
                className={`absolute inset-0 flex items-center justify-center rounded-xl border-2 ${cardBackBg} ${cardBg} p-2`}
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                {c.backImage ? (
                  <img src={c.backImage} alt="" className="w-full h-full object-cover rounded" />
                ) : (
                  <span className={`text-xs sm:text-sm font-medium ${textCls} text-center break-all line-clamp-4`}>{c.backText || ''}</span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {allFlipped && !submitted && (
        <button
          type="button"
          onClick={() => setShowQuestion(true)}
          className={`w-full py-2.5 rounded-xl text-sm font-medium ${dark ? 'bg-cyan-500 text-white' : 'bg-primary text-white'}`}
        >
          查看题目
        </button>
      )}

      {(showQuestion || submitted) && (
        <div className={`rounded-xl border p-4 ${dark ? 'border-slate-600 bg-slate-800' : 'border-slate-200 bg-slate-50'}`}>
          <p className={`font-medium mb-3 ${textCls}`}>{question}</p>
          <div className="space-y-2">
            {options.map((opt, i) => (
              <label
                key={i}
                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition ${dark ? 'border-slate-600 text-slate-200' : 'border-slate-200'} ${selected === i ? (dark ? 'border-cyan-500 bg-cyan-500/20' : 'border-primary bg-primary/5') : ''} ${submitted && i === correctIndex ? (dark ? 'border-emerald-500 bg-emerald-500/20' : 'border-emerald-500 bg-emerald-50') : ''}`}
              >
                <input type="radio" name="flip-answer" checked={selected === i} onChange={() => setSelected(i)} disabled={submitted} className="sr-only" />
                <span>{String.fromCharCode(65 + i)}. {opt}</span>
              </label>
            ))}
          </div>
          {!submitted ? (
            <button
              type="button"
              onClick={() => {
                setSubmitted(true)
                if (typeof onComplete === 'function') onComplete(selected === correctIndex)
              }}
              disabled={selected === null}
              className={`mt-3 w-full py-2.5 rounded-xl text-sm font-medium ${dark ? 'bg-cyan-500 text-white' : 'bg-primary text-white'} disabled:opacity-50`}
            >
              提交答案
            </button>
          ) : (
            <div className={`mt-3 p-3 rounded-lg text-sm ${isCorrect ? (dark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-50 text-emerald-800') : dark ? 'bg-amber-500/20 text-amber-200' : 'bg-amber-50 text-amber-800'}`}>
              {isCorrect ? '✓ 回答正确！' : `正确答案：${options[correctIndex]}`}
              {explanation && <p className={dark ? 'mt-1 text-slate-400' : 'mt-1 text-slate-600'}>{explanation}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SegmentGame({ segment, index, dark, onSegmentResult }) {
  const p = segment.payload
  const isFlipCard = p.gameType === 'flip_card'
  const config = p.config || {}

  if (isFlipCard) {
    const card = dark ? 'rounded-xl border border-slate-600 bg-slate-800 p-6' : 'rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-6'
    const meta = dark ? 'flex items-center gap-2 justify-center mb-4 text-xs text-slate-400' : 'flex items-center gap-2 justify-center mb-4 text-xs text-slate-500'
    const tag = dark ? 'bg-lime-500/80 text-white px-2 py-0.5 rounded' : 'bg-lime-100 text-lime-700 px-2 py-0.5 rounded'
    const titleCls = dark ? 'font-medium text-white mb-4' : 'font-medium text-bingo-dark mb-4'
    return (
      <div className={card}>
        <div className={meta}>
          <span className={tag}>环节 {index + 1}</span>
          <span>{SEGMENT_LABELS.game}</span>
          <span>· 翻翻卡</span>
        </div>
        <p className={`text-center ${titleCls}`}>{p.title || '翻翻卡游戏'}</p>
        <FlipCardGame config={config} dark={dark} onComplete={(correct) => typeof onSegmentResult === 'function' && onSegmentResult(segment.id, correct)} />
      </div>
    )
  }

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
    case 'fill_blank':
      return <SegmentFillBlank {...common} />
    case 'match':
      return <SegmentMatch {...common} />
    case 'drag_drop':
      return <SegmentDragDrop {...common} />
    case 'game':
      return <SegmentGame {...common} />
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
        <div className="relative bg-slate-900 aspect-video flex flex-col items-center justify-center shrink-0">
          {!playing ? (
            <>
              <div className="text-6xl mb-4">▶️</div>
              <p className="text-white/70 text-sm">{lesson.title}</p>
              <button onClick={() => setPlaying(true)} className="mt-4 bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl font-medium transition">开始播放</button>
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
    case 'fill_blank':
      return { label: '作答', key: 'fill_blank' }
    case 'match':
      return { label: '连线', key: 'match' }
    case 'drag_drop':
      return { label: '拖拽作答', key: 'drag_drop' }
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
    choice: '选择题知识点巩固',
    fill_blank: '填空题知识点应用',
    match: '连线题逻辑关联',
    drag_drop: '拖拽题顺序与逻辑',
    game: '翻翻卡记忆与作答',
    ai_experiment: 'AI实验体验与认知',
  }
  const knowledgePoints = [...new Set((segments || []).map((s) => knowledgeLabels[s.type] || SEGMENT_LABELS[s.type]).filter(Boolean))]

  // 学情：答题统计
  const resultEntries = Object.entries(segmentResults)
  const totalAnswers = resultEntries.length
  const correctCount = resultEntries.filter(([, correct]) => correct).length
  const learningStatus = totalAnswers > 0
    ? `互动答题共 ${totalAnswers} 题，答对 ${correctCount} 题${totalAnswers === correctCount ? '，全部正确。' : `，正确率 ${Math.round((correctCount / totalAnswers) * 100)}%。`}`
    : '本课已完成所有环节学习。'

  return { line1, line2, line3, partList, knowledgePoints, learningStatus, totalAnswers, correctCount }
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

  const handleShortcutClick = () => {
    if (currentSegment?.type === 'video') setVideoPlaying(true)
  }

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
              </div>
              <p className="text-sm text-slate-500 mt-4">继续加油，完成全部课时可获得学习证书</p>
              <button
                type="button"
                onClick={onClose}
                className="mt-6 w-full max-w-xs mx-auto py-3 rounded-xl text-base font-medium bg-primary text-white hover:bg-primary/90"
              >
                返回学习中心
              </button>
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
        className="w-full max-w-2xl mx-auto lg:max-w-none lg:mx-0 flex flex-col flex-1 min-h-0 bg-[#0f172a] lg:shadow-none shadow-2xl border border-slate-700/50 lg:border-0"
        style={{ height: '100%' }}
      >
        {/* 顶部栏 - 深色 */}
        <header className="shrink-0 h-14 px-4 border-b border-slate-600/80 flex items-center justify-between gap-2 bg-slate-800/90">
          <h3 className="font-bold text-white text-sm m-0 overflow-hidden text-ellipsis whitespace-nowrap flex-1 min-w-0">
            {lesson.title}
          </h3>
          <span className="text-xs text-slate-400 shrink-0">环节 {currentStep + 1}/{total}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="w-9 h-9 rounded-full bg-slate-600/80 hover:bg-slate-500 text-slate-200 shrink-0 flex items-center justify-center text-base"
          >
            ✕
          </button>
        </header>

        {/* 中间：深色背景，当前环节一屏 */}
        <main className="flex-1 min-h-0 overflow-auto flex items-center justify-center p-4 lg:p-8 bg-[#0f172a]">
          <div className="w-full max-w-lg lg:max-w-4xl">
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
      </div>
    </div>
  )
}

// ─── 单门课程卡片（可展开） ─────────────────────────────────
function CourseCard({ course, onPlayLesson }) {
  const [expanded, setExpanded] = useState(false)
  const [watched, setWatched] = useState(() =>
    Object.fromEntries(course.lessons.map(l => [l.id, l.watched]))
  )

  const watchedCount = Object.values(watched).filter(Boolean).length
  const totalCount = course.lessons.length
  const progressPct = Math.round((watchedCount / totalCount) * 100)

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
            <CourseCard key={course.id} course={course} onPlayLesson={setPlayingLesson} />
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
    </div>
  )
}
