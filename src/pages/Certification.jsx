import { ArrowRightOutlined, BookOutlined, CheckCircleOutlined, CloseOutlined, DownOutlined, ExperimentOutlined, FileTextOutlined, InfoCircleOutlined, ReadOutlined, UpOutlined, UploadOutlined } from '@ant-design/icons'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { dicebearAvatarUrl, getSessionUser, sessionUserDisplayAvatarUrl } from '../utils/sessionUser'

const CERTIFICATE_TYPES = [
  {
    id: 'literacy',
    short: 'AI',
    name: '自主学认证系统课证书',
    subtitle: '持证人完成星级进阶学习，达到对应 AI 能力等级标准',
    gradient: 'from-cyan-500 to-blue-700',
    accent: 'text-cyan-700',
    soft: 'bg-cyan-50 border-cyan-100',
    description: '持证人完成星级进阶学习，达到对应 AI 能力等级标准。',
    introductionSections: [
      {
        title: '课程完成情况',
        text: '完成一星《AI 萌芽》全套 8 课时课程，系统学习 AI 五感传感器认知、SPA「感知 - 处理 - 执行」底层思维模型、标准化人机指令、循环与条件基础逻辑、AI 绘画创作、语音唤醒交互等启蒙内容，通过游戏、手工、AIGC 创意实操完成全阶段学习。',
      },
      {
        title: '熟练掌握能力',
        text: '能够区分摄像头、麦克风、触摸屏三类 AI 传感器；理解智能设备通用工作流程；可撰写清晰完整的 AI 绘画指令；熟练运用循环、条件两种基础编程思维独立完成任务；能规范使用语音唤醒词与人机对话。',
      },
      {
        title: '达成综合 AI 素养',
        text: '建立完整 AI 基础认知，具备基础计算思维、清晰逻辑表达能力，形成人机协作创作意识，养成规范、安全使用 AI 工具的数字媒介素养，达到 AI 精英启蒙（青铜）基础入门标准。',
      },
    ],
    abilities: ['AI 基础认知', '数字伦理意识', '工具体验与表达'],
  },
  {
    id: 'application',
    short: 'APP',
    name: 'AI 应用创造课',
    subtitle: '持证人完成项目实战学习，具备 AI 场景应用创造能力',
    gradient: 'from-violet-500 to-fuchsia-700',
    accent: 'text-violet-700',
    soft: 'bg-violet-50 border-violet-100',
    description: '持证人完成项目实战学习，具备 AI 场景应用创造能力。',
    abilities: ['项目实战学习', 'AI 场景应用', '应用创造能力'],
  },
  {
    id: 'aigc',
    short: 'GC',
    name: 'AIGC 创意应用课',
    subtitle: '持证人掌握 AIGC 创作技能，具备人机协同创意能力',
    gradient: 'from-fuchsia-500 to-pink-700',
    accent: 'text-fuchsia-700',
    soft: 'bg-fuchsia-50 border-fuchsia-100',
    description: '持证人掌握 AIGC 创作技能，具备人机协同创意能力。',
    abilities: ['AIGC 创作技能', '人机协同', '创意表达能力'],
  },
  {
    id: 'subject',
    short: 'X',
    name: 'AI 学科协同课',
    subtitle: '持证人完成跨学科融合学习，具备 AI 赋能学科能力',
    gradient: 'from-emerald-500 to-teal-700',
    accent: 'text-emerald-700',
    soft: 'bg-emerald-50 border-emerald-100',
    description: '持证人完成跨学科融合学习，具备 AI 赋能学科能力。',
    abilities: ['跨学科融合', 'AI 学科应用', '协同学习能力'],
  },
  {
    id: 'competition',
    short: 'CUP',
    name: 'AI 赛事课程',
    subtitle: '持证人完成赛事专项训练，具备科创赛事竞技能力',
    gradient: 'from-amber-400 to-orange-600',
    accent: 'text-amber-700',
    soft: 'bg-amber-50 border-amber-100',
    description: '持证人完成赛事专项训练，具备科创赛事竞技能力。',
    abilities: ['赛事专项训练', '科创实践', '赛事竞技能力'],
  },
  {
    id: 'maker',
    short: 'DEV',
    name: 'AI 编程创客课程',
    subtitle: '持证人掌握编程创客技能，具备智能项目开发能力',
    gradient: 'from-blue-500 to-indigo-700',
    accent: 'text-blue-700',
    soft: 'bg-blue-50 border-blue-100',
    description: '持证人掌握编程创客技能，具备智能项目开发能力。',
    abilities: ['编程创客技能', '智能项目开发', '工程实践能力'],
  },
  {
    id: 'special',
    short: 'TOP',
    name: '专题特色拓展课',
    subtitle: '持证人完成专题拓展学习，提升 AI 科技综合素养',
    gradient: 'from-rose-500 to-red-700',
    accent: 'text-rose-700',
    soft: 'bg-rose-50 border-rose-100',
    description: '持证人完成专题拓展学习，提升 AI 科技综合素养。',
    abilities: ['专题拓展学习', 'AI 科技认知', '综合素养提升'],
  },
  {
    id: 'parent',
    short: 'P',
    name: '家长课堂',
    subtitle: '持证人完成 AI 教育课程学习，建立智慧家庭教育理念',
    gradient: 'from-teal-500 to-cyan-700',
    accent: 'text-teal-700',
    soft: 'bg-teal-50 border-teal-100',
    description: '持证人完成 AI 教育课程学习，建立智慧家庭教育理念。',
    abilities: ['AI 教育认知', '家庭教育实践', '智慧教育理念'],
  },
  {
    id: 'experience',
    short: 'GO',
    name: '引流体验课',
    subtitle: '持证人完成 AI 启蒙体验，开启人工智能探索之旅',
    gradient: 'from-slate-500 to-slate-700',
    accent: 'text-slate-700',
    soft: 'bg-slate-50 border-slate-200',
    description: '持证人完成 AI 启蒙体验，开启人工智能探索之旅。',
    abilities: ['AI 启蒙体验', '人工智能认知', '探索兴趣培养'],
  },
]

const LEVELS = [
  { star: 1, title: '启蒙', stage: '启智阶段', note: '能够在指导下认识基础概念，完成入门任务。' },
  { star: 2, title: '初识', stage: '启智阶段', note: '能够理解常见应用，并表达自己的观察。' },
  { star: 3, title: '体验', stage: '启智阶段', note: '能够完成一项基础体验作品或学习记录。' },
  { star: 4, title: '进阶', stage: '成长阶段', note: '能够独立完成分步骤任务，并进行简单调整。' },
  { star: 5, title: '应用', stage: '成长阶段', note: '能够将所学能力用于真实主题或问题。' },
  { star: 6, title: '创作', stage: '成长阶段', note: '能够完成结构完整、可展示的个人作品。' },
  { star: 7, title: '精研', stage: '精研阶段', note: '能够针对目标进行自主研究和持续迭代。' },
  { star: 8, title: '突破', stage: '精研阶段', note: '能够整合多项能力，形成较完整的项目成果。' },
  { star: 9, title: '智创', stage: '成果阶段', note: '能够以高质量作品、研究或答辩呈现综合能力。' },
]

// 当前仅「自主学认证系统课证书」采用 1–9 星体系；其余方向的等级设置待最终标准发布后补充。
const LEVELS_BY_CERTIFICATE = {
  literacy: LEVELS,
}

const POLICY_GUIDES = [
  {
    stage: '小学阶段',
    title: '小学生综合素养',
    eyebrow: '成长记录 · 五育发展',
    description: 'AI 素养重在体验、作品与项目实践，可作为学生成长过程的写实记录，服务校内评价与家校沟通。',
    note: '坚持发展性评价，不作为小升初筛选依据。',
    path: '/cert/policy/primary-school',
    icon: BookOutlined,
    tone: 'border-sky-200 bg-sky-50/70 text-sky-700',
    iconTone: 'bg-sky-600 text-white',
  },
  {
    stage: '初中阶段',
    title: '中考升学',
    eyebrow: '创新实践 · 综评档案',
    description: 'AI 课程、科创项目与社会实践成果，可按属地规则写入综合素质评价档案，呈现持续成长过程。',
    note: '各地使用方式存在差异，以当地招生政策为准。',
    path: '/cert/policy/middle-school',
    icon: ExperimentOutlined,
    tone: 'border-indigo-200 bg-indigo-50/70 text-indigo-700',
    iconTone: 'bg-indigo-600 text-white',
  },
  {
    stage: '高中阶段',
    title: '高考录取',
    eyebrow: '创新素养 · 多元评价',
    description: 'AI 研究、项目成果与科创经历，可作为高中综评创新实践材料，为高校多元人才选拔提供参考。',
    note: '作为写实材料使用，不等同于高考加分或录取承诺。',
    path: '/cert/policy/college-admission',
    icon: ReadOutlined,
    tone: 'border-amber-200 bg-amber-50/70 text-amber-800',
    iconTone: 'bg-amber-500 text-white',
  },
]

const FEATURED_ACHIEVEMENTS = [
  {
    id: 'featured-1',
    nickname: '星野同学',
    avatarSeed: 'stellar-student',
    certificate: '/certificates/l1-ai-explorer-bronze.png',
    certificateName: 'AI Explorer Bronze 能力认证',
    comment: '完成这一阶段后，我已经能自己讲清楚 AI 怎样感知信息，也完成了第一份 AI 创意作品。',
  },
  {
    id: 'featured-2',
    nickname: '小宇航员',
    avatarSeed: 'young-astronaut',
    certificate: '/certificates/l1-ai-explorer-bronze.png',
    certificateName: '人工智能素养一星认证',
    comment: '证书记录了我的第一次系统学习，也让我更有信心继续挑战编程和机器人项目。',
  },
  {
    id: 'featured-3',
    nickname: '代码小鹿',
    avatarSeed: 'coding-deer',
    certificate: '/certificates/l1-ai-explorer-bronze.png',
    certificateName: 'AI 基础能力认证',
    comment: '最开心的是把课程里学到的知识做成了可以展示的作品，老师的评语也让我知道下一步怎么提升。',
  },
  {
    id: 'featured-4',
    nickname: '小小创造家',
    avatarSeed: 'young-creator',
    certificate: '/certificates/l1-ai-explorer-bronze.png',
    certificateName: 'AI 创意实践能力认证',
    comment: '从认识 AI 到完成自己的创意项目，我学会了把想法一步步变成作品，也更愿意主动分享学习过程。',
  },
  {
    id: 'featured-5',
    nickname: '星辰创客',
    avatarSeed: 'stellar-maker',
    certificate: '/certificates/l1-ai-explorer-bronze.png',
    certificateName: 'AI 项目实践能力认证',
    comment: '我把课堂里的想法做成了一个完整的小项目，也学会了记录每次测试和改进的过程。',
  },
  {
    id: 'featured-6',
    nickname: '思维小航',
    avatarSeed: 'thinking-voyager',
    certificate: '/certificates/l1-ai-explorer-bronze.png',
    certificateName: 'AI 逻辑思维能力认证',
    comment: '通过这一阶段的练习，我能更有条理地拆解问题，并用清晰的步骤告诉 AI 我想完成什么。',
  },
  {
    id: 'featured-7',
    nickname: 'AI 绘梦家',
    avatarSeed: 'ai-dream-artist',
    certificate: '/certificates/l1-ai-explorer-bronze.png',
    certificateName: 'AIGC 创意表达认证',
    comment: '我完成了自己的主题绘本，从故事构思到画面调整，每一步都有记录，也更懂得尊重原创。',
  },
  {
    id: 'featured-8',
    nickname: '未来工程师',
    avatarSeed: 'future-engineer',
    certificate: '/certificates/l1-ai-explorer-bronze.png',
    certificateName: '智能工程实践认证',
    comment: '完成搭建和调试后，我第一次看到自己的程序真正运行起来，也知道了遇到问题要耐心排查。',
  },
]

const INITIAL_FEATURED_ACHIEVEMENT_COUNT = 6

const MAX_CERTIFICATE_BYTES = 5 * 1024 * 1024

const EARNED_CERTIFICATES = [
  { id: 'ai-bronze', name: 'AI 精英启蒙（青铜）认证', meta: 'L1 · 2026-06-18', image: '/certificates/l1-ai-explorer-bronze.png' },
  { id: 'creative-course', name: 'AI 创意表达课程结业证书', meta: '课程证书 · 2026-05-23', image: '/certificates/l1-ai-explorer-bronze.png' },
]

function readImagePreview(file, maxBytes) {
  return new Promise((resolve, reject) => {
    if (!file?.type?.startsWith('image/')) {
      reject(new Error('请选择图片文件'))
      return
    }
    if (file.size > maxBytes) {
      reject(new Error(`图片请小于 ${Math.round(maxBytes / 1024 / 1024)}MB`))
      return
    }
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('图片读取失败，请重新选择'))
    reader.readAsDataURL(file)
  })
}

function AchievementUploadModal({ open, onClose, onSubmitted }) {
  const currentUser = useMemo(() => getSessionUser(), [])
  const firstControlRef = useRef(null)
  const [comment, setComment] = useState('')
  const [certificateSource, setCertificateSource] = useState('earned')
  const [selectedCertificateId, setSelectedCertificateId] = useState(EARNED_CERTIFICATES[0].id)
  const [certificatePreview, setCertificatePreview] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.setTimeout(() => firstControlRef.current?.focus(), 0)
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  const handleImage = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setError('')
    try {
      const preview = await readImagePreview(file, MAX_CERTIFICATE_BYTES)
      setCertificatePreview(preview)
    } catch (uploadError) {
      setError(uploadError.message)
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (certificateSource === 'upload' && !certificatePreview) {
      setError('请上传证书图片')
      return
    }
    if (!comment.trim()) {
      setError('请填写成果评语')
      return
    }
    const selectedCertificate = EARNED_CERTIFICATES.find((item) => item.id === selectedCertificateId)
    onSubmitted({
      id: `submission-${Date.now()}`,
      certificateName: certificateSource === 'earned' ? selectedCertificate?.name : '用户上传证书',
      certificateImage: certificateSource === 'earned' ? selectedCertificate?.image : certificatePreview,
      comment: comment.trim(),
      submittedAt: new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(new Date()),
    })
    setComment('')
    setCertificateSource('earned')
    setSelectedCertificateId(EARNED_CERTIFICATES[0].id)
    setCertificatePreview('')
    setError('')
  }

  return <div className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section role="dialog" aria-modal="true" aria-labelledby="achievement-upload-title" className="my-6 w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-7"><div><p className="text-xs font-bold tracking-[.14em] text-blue-600">ACHIEVEMENT SUBMISSION</p><h2 id="achievement-upload-title" className="mt-1 text-xl font-bold text-slate-950">上传我的认证成果</h2><p className="mt-2 text-sm leading-6 text-slate-500">任何用户都可以提交，公开展示前需经后台审核并推荐。</p></div><button type="button" onClick={onClose} aria-label="关闭上传窗口" className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-600"><CloseOutlined/></button></div>
      <form onSubmit={handleSubmit} className="space-y-5 px-5 py-6 sm:px-7">
        <div><span className="mb-2 block text-sm font-semibold text-slate-700">投稿学生</span><div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4"><img src={sessionUserDisplayAvatarUrl(currentUser)} alt={`${currentUser.nickname}的头像`} width="52" height="52" className="h-[52px] w-[52px] rounded-2xl bg-blue-50 object-cover"/><div><strong className="block text-sm text-slate-950">{currentUser.nickname}</strong><span className="mt-1 block text-xs text-slate-500">头像和昵称自动获取当前用户资料</span></div></div></div>
        <fieldset><legend className="text-sm font-semibold text-slate-700">选择证书来源 <span className="text-rose-500">*</span></legend><div className="mt-2 grid grid-cols-2 gap-2" role="radiogroup" aria-label="选择证书来源"><button ref={firstControlRef} type="button" role="radio" aria-checked={certificateSource === 'earned'} onClick={() => { setCertificateSource('earned'); setError('') }} className={`min-h-12 cursor-pointer rounded-xl border px-3 text-sm font-bold transition ${certificateSource === 'earned' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200'}`}>从已获证书选择</button><button type="button" role="radio" aria-checked={certificateSource === 'upload'} onClick={() => { setCertificateSource('upload'); setError('') }} className={`min-h-12 cursor-pointer rounded-xl border px-3 text-sm font-bold transition ${certificateSource === 'upload' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200'}`}>上传证书图片</button></div></fieldset>
        {certificateSource === 'earned' ? <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="选择已获得的证书">{EARNED_CERTIFICATES.map((item) => { const active = selectedCertificateId === item.id; return <button key={item.id} type="button" role="radio" aria-checked={active} onClick={() => { setSelectedCertificateId(item.id); setError('') }} className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3 text-left transition ${active ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100' : 'border-slate-200 bg-white hover:border-blue-200'}`}><img src={item.image} alt="" width="88" height="56" className="h-14 w-[88px] shrink-0 rounded-lg bg-slate-100 object-cover"/><span className="min-w-0"><strong className="block text-sm leading-5 text-slate-900">{item.name}</strong><small className="mt-1 block text-xs text-slate-500">{item.meta}</small></span></button> })}</div> : <div><span className="mb-2 block text-sm font-semibold text-slate-700">上传证书图片</span><label className="flex min-h-44 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/50 p-4 text-center transition hover:border-blue-400 hover:bg-blue-50 focus-within:outline-3 focus-within:outline-offset-3 focus-within:outline-blue-600">{certificatePreview ? <img src={certificatePreview} alt="待提交证书预览" className="max-h-60 max-w-full rounded-lg object-contain"/> : <><span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-xl text-blue-700 shadow-sm"><UploadOutlined/></span><strong className="mt-3 text-sm text-slate-800">点击上传证书图片</strong><span className="mt-1 text-xs text-slate-500">支持 JPG、PNG 等图片，最大 5MB</span></>}<input type="file" accept="image/*" className="sr-only" onChange={handleImage}/></label></div>}
        <label className="block text-sm font-semibold text-slate-700">成果评语 <span className="text-rose-500">*</span><textarea value={comment} onChange={(event) => { setComment(event.target.value); setError('') }} maxLength={160} rows={4} className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm font-normal leading-6 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-3 focus:ring-blue-100" placeholder="分享获得证书后的收获、成长或老师评语"/><span className="mt-1 block text-right text-xs font-normal text-slate-400">{comment.length}/160</span></label>
        {error ? <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p> : null}
        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className="min-h-12 cursor-pointer rounded-xl border border-slate-200 px-6 text-sm font-bold text-slate-600 transition hover:bg-slate-50">取消</button><button type="submit" className="min-h-12 cursor-pointer rounded-xl bg-blue-600 px-6 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-blue-600">提交审核</button></div>
      </form>
    </section>
  </div>
}

function SubmissionRecordsModal({ open, onClose, records }) {
  const closeButtonRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.setTimeout(() => closeButtonRef.current?.focus(), 0)
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  return <div className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section role="dialog" aria-modal="true" aria-labelledby="submission-records-title" className="my-6 w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-7"><div><p className="text-xs font-bold tracking-[.14em] text-blue-600">MY SUBMISSIONS</p><h2 id="submission-records-title" className="mt-1 text-xl font-bold text-slate-950">我的提交记录</h2><p className="mt-2 text-sm leading-6 text-slate-500">这里显示本次页面访问中提交的认证成果及审核状态。</p></div><button ref={closeButtonRef} type="button" onClick={onClose} aria-label="关闭提交记录" className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-600"><CloseOutlined/></button></div>
      <div className="max-h-[68vh] overflow-y-auto px-5 py-6 sm:px-7">
        {records.length ? <div className="space-y-4">{records.map((record) => <article key={record.id} className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 sm:grid-cols-[104px_minmax(0,1fr)_auto] sm:items-center">
          <div className="flex h-32 items-center justify-center overflow-hidden rounded-xl bg-white p-2 ring-1 ring-slate-200"><img src={record.certificateImage} alt={record.certificateName} className="max-h-full max-w-full object-contain"/></div>
          <div className="min-w-0"><h3 className="font-bold text-slate-950">{record.certificateName}</h3><p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{record.comment}</p><time className="mt-2 block text-xs text-slate-400">提交时间：{record.submittedAt}</time></div>
          <span className="inline-flex min-h-8 items-center justify-center self-start rounded-full border border-amber-200 bg-amber-50 px-3 text-xs font-bold text-amber-700 sm:self-center">待审核</span>
        </article>)}</div> : <div className="flex min-h-64 flex-col items-center justify-center text-center"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-2xl text-blue-600"><FileTextOutlined aria-hidden="true"/></span><h3 className="mt-4 font-bold text-slate-950">暂无提交记录</h3><p className="mt-2 text-sm leading-6 text-slate-500">上传认证成果后，可在这里查看提交时间和审核状态。</p></div>}
      </div>
    </section>
  </div>
}

function AchievementShowcase() {
  const [uploadOpen, setUploadOpen] = useState(false)
  const [recordsOpen, setRecordsOpen] = useState(false)
  const [submissionRecords, setSubmissionRecords] = useState([])
  const [submitted, setSubmitted] = useState(false)
  const [showAllAchievements, setShowAllAchievements] = useState(false)
  const hasMoreAchievements = FEATURED_ACHIEVEMENTS.length > INITIAL_FEATURED_ACHIEVEMENT_COUNT
  const visibleAchievements = showAllAchievements ? FEATURED_ACHIEVEMENTS : FEATURED_ACHIEVEMENTS.slice(0, INITIAL_FEATURED_ACHIEVEMENT_COUNT)

  return <section className="mt-16 border-t border-slate-200 pt-14" aria-labelledby="achievement-showcase-heading">
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold tracking-[.12em] text-blue-600">STUDENT ACHIEVEMENTS</p><h2 id="achievement-showcase-heading" className="mt-2 text-3xl font-bold text-slate-950">学员认证成果展示</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">展示学员主动提交并经后台推荐的认证成果，记录每一次真实成长。</p></div><div className="flex flex-wrap gap-3 self-start sm:self-auto"><button type="button" onClick={() => setRecordsOpen(true)} className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-5 text-sm font-bold text-blue-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-blue-600"><FileTextOutlined aria-hidden="true"/>我的提交记录{submissionRecords.length ? <span className="grid h-5 min-w-5 place-items-center rounded-full bg-blue-100 px-1 text-[11px] text-blue-700" aria-label={`${submissionRecords.length}条记录`}>{submissionRecords.length}</span> : null}</button><button type="button" onClick={() => { setSubmitted(false); setUploadOpen(true) }} className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-blue-600"><UploadOutlined aria-hidden="true"/>上传我的成果</button></div></div>

    {submitted ? <div role="status" className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-800"><CheckCircleOutlined className="shrink-0 text-lg" aria-hidden="true"/><p className="min-w-0 flex-1"><strong className="block">成果已提交审核</strong>审核通过并由后台设为推荐后，才会显示在前端成果展示中。</p><button type="button" onClick={() => setRecordsOpen(true)} className="min-h-10 cursor-pointer rounded-lg px-3 font-bold text-emerald-800 underline decoration-emerald-300 underline-offset-4 hover:bg-emerald-100">查看提交记录</button></div> : null}

    <div id="featured-achievement-grid" className="mt-8 grid gap-6 lg:grid-cols-2">{visibleAchievements.map((item) => <article key={item.id} className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_10px_28px_rgba(15,23,42,.07)] sm:grid-cols-[42%_58%]"><div className="flex min-h-[330px] items-center justify-center overflow-hidden bg-slate-100 p-4"><img src={item.certificate} alt={`${item.nickname}上传的${item.certificateName}`} width="600" height="840" loading="lazy" className="max-h-[340px] max-w-full object-contain"/></div><div className="flex flex-col justify-center p-5 sm:p-6"><div className="flex items-center gap-3"><img src={dicebearAvatarUrl(item.avatarSeed, 96)} alt={`${item.nickname}的头像`} width="48" height="48" loading="lazy" className="h-12 w-12 rounded-2xl bg-blue-50 object-cover"/><div><h3 className="font-bold text-slate-950">{item.nickname}</h3><p className="mt-0.5 text-xs leading-5 text-slate-500">{item.certificateName}</p></div></div><blockquote className="mt-5 text-sm leading-7 text-slate-600">“{item.comment}”</blockquote></div></article>)}</div>

    {hasMoreAchievements ? <div className="mt-8 flex justify-center"><button type="button" aria-expanded={showAllAchievements} aria-controls="featured-achievement-grid" onClick={() => setShowAllAchievements((current) => !current)} className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-6 text-sm font-bold text-blue-700 shadow-sm transition duration-200 hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-blue-600 motion-reduce:transition-none">{showAllAchievements ? <><UpOutlined aria-hidden="true"/>收起成果</> : <><DownOutlined aria-hidden="true"/>展开更多成果</>}</button></div> : null}

    <p className="mt-6 text-center text-xs leading-6 text-slate-500">公开展示内容均需经过平台审核与推荐；未推荐的投稿仅保留在个人提交记录中。</p>
    <AchievementUploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} onSubmitted={(record) => { setUploadOpen(false); setSubmissionRecords((current) => [record, ...current]); setSubmitted(true) }}/>
    <SubmissionRecordsModal open={recordsOpen} onClose={() => setRecordsOpen(false)} records={submissionRecords}/>
  </section>
}

function CertificateSample({ certificateName }) {
  return (
    <figure className="rounded-2xl bg-[#10213d] p-3 shadow-[0_18px_48px_rgba(17,24,39,.2)] sm:p-4">
      <img src="/certificates/l1-ai-explorer-bronze.png" alt={`${certificateName}样例`} className="w-full rounded-lg" />
      <figcaption className="px-2 pt-3 text-center text-xs text-slate-300">{certificateName}样例</figcaption>
    </figure>
  )
}

function CertificateDetailModal({ certificate, selectedStar, onSelectStar, onClose, returnFocusRef }) {
  const closeButtonRef = useRef(null)
  const dialogRef = useRef(null)
  const levels = certificate ? LEVELS_BY_CERTIFICATE[certificate.id] ?? [] : []
  const level = levels.find((item) => item.star === selectedStar)

  useEffect(() => {
    if (!certificate) return undefined

    const previousOverflow = document.body.style.overflow
    const returnFocusTarget = returnFocusRef.current
    document.body.style.overflow = 'hidden'
    window.setTimeout(() => closeButtonRef.current?.focus(), 0)

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }

      if (event.key !== 'Tab') return
      const focusableElements = dialogRef.current?.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])')
      if (!focusableElements?.length) return
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
      window.setTimeout(() => returnFocusTarget?.focus(), 0)
    }
  }, [certificate, onClose, returnFocusRef])

  if (!certificate) return null

  return <div className="fixed inset-0 z-[90] flex items-end justify-center overflow-y-auto bg-slate-950/65 p-0 backdrop-blur-sm sm:items-center sm:p-5" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
    <section ref={dialogRef} id="certificate-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="certificate-detail-heading" className="relative max-h-[92dvh] w-full max-w-6xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:my-6 sm:rounded-3xl">
      <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur sm:px-7 sm:py-5">
        <div className="min-w-0">
          <p className={`text-xs font-bold tracking-[.14em] ${certificate.accent}`}>CERTIFICATE DETAILS</p>
          <h2 id="certificate-detail-heading" className="mt-1 text-xl font-bold leading-7 text-bingo-dark sm:text-2xl">{certificate.name}{level && <span className="ml-2 text-primary">{level.star} 星</span>}</h2>
        </div>
        <button ref={closeButtonRef} type="button" onClick={onClose} aria-label="关闭证书详情" className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-600"><CloseOutlined /></button>
      </div>

      <div className="grid gap-7 p-5 sm:p-7 lg:grid-cols-[minmax(300px,5fr)_minmax(0,6fr)] lg:items-start lg:gap-9">
        <CertificateSample certificateName={certificate.name} />
        <div className="min-w-0">
          {certificate.introductionSections ? (
            <section className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 sm:p-6" aria-label="证书内容">
              <p className={`text-xs font-bold ${certificate.accent}`}>证书介绍</p>
              <p className="mt-3 text-sm leading-8 text-slate-600">{certificate.introductionSections.map((section) => section.text).join(' ')}</p>
            </section>
          ) : (
            <p className="text-sm leading-7 text-slate-600">{certificate.description}</p>
          )}
          <div className="mt-6 flex flex-wrap gap-2">{certificate.abilities.map((ability) => <span key={ability} className={`rounded-full border px-3 py-1.5 text-xs ${certificate.soft} ${certificate.accent}`}>{ability}</span>)}</div>
          <div className="mt-7 border-y border-slate-200 py-5">
            {level ? <>
              <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-bold text-bingo-dark">选择认证等级</h3><span className="text-sm text-slate-500">{level.stage} · {level.title}</span></div>
              <div className="mt-4 grid grid-cols-9 gap-2" role="radiogroup" aria-label="选择证书星级">
                {levels.map((item) => <button key={item.star} type="button" role="radio" aria-checked={selectedStar === item.star} onClick={() => onSelectStar(item.star)} className={`flex aspect-square min-h-10 cursor-pointer items-center justify-center rounded-lg text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-primary ${selectedStar === item.star ? `bg-gradient-to-br ${certificate.gradient} text-white shadow-md` : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>{item.star}</button>)}
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600"><span className="font-semibold text-bingo-dark">{level.star} 星 · {level.title}：</span>{level.note}</p>
            </> : <>
              <h3 className="font-bold text-bingo-dark">认证等级</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">该认证方向的等级设置正在确认中，将以最终发布的认证标准为准。</p>
            </>}
          </div>
        </div>
      </div>
    </section>
  </div>
}

export default function Certification() {
  const [selectedType, setSelectedType] = useState(null)
  const [selectedStar, setSelectedStar] = useState(1)
  const certificateTriggerRef = useRef(null)
  const certificate = CERTIFICATE_TYPES.find((item) => item.id === selectedType) ?? null

  const openCertificate = (type, trigger) => {
    certificateTriggerRef.current = trigger
    setSelectedType(type)
    setSelectedStar((LEVELS_BY_CERTIFICATE[type] ?? [])[0]?.star ?? null)
  }

  const closeCertificate = useCallback(() => setSelectedType(null), [])

  return (
    <main className="bg-[#f8fafc] pb-16">
      <section className="relative overflow-hidden bg-[#0b1730] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_22%,rgba(45,212,191,.26),transparent_24%),radial-gradient(circle_at_70%_90%,rgba(99,102,241,.25),transparent_30%)]" />
        <div className="absolute -left-16 top-12 h-52 w-52 rounded-full border border-white/10" aria-hidden="true" />
        <div className="absolute -left-4 top-28 h-24 w-24 rounded-full border border-cyan-300/15" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 sm:pb-24 sm:pt-20">
          <p className="text-sm font-semibold tracking-[0.18em] text-cyan-200">综合素质评价 · AI 成长档案</p>
          <div className="mt-5 grid items-end gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(280px,3fr)]">
            <div>
              <h1 className="max-w-4xl text-4xl font-bold leading-tight sm:text-5xl">让 AI 学训成果，<br className="hidden sm:block" />成为综评档案的写实支撑</h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300">顺应素质教育改革，系统记录课程学习、项目实践与原创作品，沉淀真实、完整、可追溯的 AI 成长材料。</p>
            </div>
            <div className="grid grid-cols-3 gap-3 border-t border-white/15 pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              {[['3', '学段政策'], ['9', '认证方向'], ['9', 'AI 能力等级']].map(([number, label]) => <div key={label}><p className="text-3xl font-bold text-white">{number}</p><p className="mt-1 text-xs leading-5 text-slate-400">{label}</p></div>)}
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-8 max-w-7xl px-4 sm:px-6" aria-labelledby="policy-guidance-heading">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,.10)] sm:p-8 lg:p-10">
          <div>
            <div className="inline-flex min-h-8 items-center gap-2 rounded-full bg-blue-50 px-3 text-xs font-bold tracking-[.12em] text-blue-700"><FileTextOutlined aria-hidden="true" />政策导向</div>
            <h2 id="policy-guidance-heading" className="mt-4 max-w-5xl text-2xl font-bold leading-tight text-slate-950 sm:text-3xl">政策导向：综合素质评价逐步成为育人与升学重要参考</h2>
            <div className="mt-5 max-w-5xl space-y-3 text-base leading-8 text-slate-600">
              <p>国家持续推进素质教育转型，以高考、中考改革为抓手，落实“两依据一参考”“基于学考成绩、结合综合素质评价”招生制度，综合素质评价在人才选拔中的作用持续提升。</p>
              <p>依据《深化新时代教育评价改革总体方案》《中小学人工智能通识教育指南（2025年版）》，鼓励探索将AI素养纳入综合素质评价创新实践、社会实践观测维度，AI素养将在学生综合素养体系中发挥越来越重要的参考价值。</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {POLICY_GUIDES.map((item, index) => {
              const Icon = item.icon
              return <Link key={item.stage} to={item.path} aria-label={`查看${item.title}政策详情`} className={`group flex min-h-full cursor-pointer flex-col rounded-2xl border p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-blue-600 motion-reduce:transform-none motion-reduce:transition-none sm:p-6 ${item.tone}`}>
                <div className="flex items-start justify-between gap-4">
                  <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl text-xl ${item.iconTone}`} aria-hidden="true"><Icon /></span>
                  <span className="text-3xl font-bold tabular-nums opacity-20">0{index + 1}</span>
                </div>
                <p className="mt-5 text-xs font-bold tracking-[.12em] opacity-80">{item.stage} · {item.eyebrow}</p>
                <h3 className="mt-2 text-xl font-bold text-slate-950">{item.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-7 text-slate-700">{item.description}</p>
                <p className="mt-5 border-t border-current/15 pt-4 text-xs font-semibold leading-6">{item.note}</p>
                <span className="mt-4 inline-flex min-h-11 items-center gap-2 self-start text-sm font-bold">查看政策详情<ArrowRightOutlined className="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden="true" /></span>
              </Link>
            })}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14">
        <section aria-labelledby="type-heading">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div><p className="text-sm font-medium text-primary">CERTIFICATION CATALOGUE</p><h2 id="type-heading" className="mt-1 text-2xl font-bold text-bingo-dark">选择你的认证方向</h2></div>
            <p className="text-sm text-slate-500">自主学认证系统课证书设 1–9 星；其他方向等级以最终标准为准</p>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {CERTIFICATE_TYPES.map((item) => {
              return <button key={item.id} type="button" aria-haspopup="dialog" aria-controls="certificate-detail-dialog" onClick={(event) => openCertificate(item.id, event.currentTarget)} className="min-h-44 cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 text-left transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-blue-600 motion-reduce:transform-none motion-reduce:transition-none">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} text-xs font-bold text-white shadow-sm`}>{item.short}</div>
                <h3 className="mt-5 font-bold text-bingo-dark">{item.name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{item.subtitle}</p>
                <p className={`mt-4 text-xs font-semibold ${item.accent}`}>查看证书详情 →</p>
              </button>
            })}
          </div>
        </section>

        <CertificateDetailModal certificate={certificate} selectedStar={selectedStar} onSelectStar={setSelectedStar} onClose={closeCertificate} returnFocusRef={certificateTriggerRef} />

        <AchievementShowcase />

        <section className="mt-16 rounded-3xl border border-amber-200 bg-amber-50/80 p-5 sm:p-7 lg:p-8" aria-labelledby="important-notice-heading">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-amber-500 text-lg text-white" aria-hidden="true"><InfoCircleOutlined /></span>
            <div><p className="text-xs font-bold tracking-[.14em] text-amber-700">IMPORTANT NOTICE</p><h2 id="important-notice-heading" className="mt-1 text-xl font-bold text-slate-950">重要提示</h2></div>
          </div>
          <ol className="mt-6 grid gap-4 lg:grid-cols-2">
            <li className="flex gap-4 rounded-2xl border border-amber-200/80 bg-white/80 p-4 text-sm leading-7 text-slate-700 sm:p-5"><span className="font-bold tabular-nums text-amber-700">01</span><p>根据国家政策，综合素质评价档案由属地学校、教育主管部门审核生成；学生可将本平台实践成果作为写实材料，按当地规则填报至官方综评系统，最终以学校及教育部门审核结果为准。</p></li>
            <li className="flex gap-4 rounded-2xl border border-amber-200/80 bg-white/80 p-4 text-sm leading-7 text-slate-700 sm:p-5"><span className="font-bold tabular-nums text-amber-700">02</span><p>AI素养属于政策鼓励探索纳入综合素质评价的观测方向，各地实施细则存在差异，具体以本省、本市教育部门发布文件为准。</p></li>
          </ol>
        </section>

      </div>
    </main>
  )
}
