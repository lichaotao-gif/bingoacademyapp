import { CheckCircleOutlined, CloseOutlined, FileTextOutlined, UploadOutlined } from '@ant-design/icons'
import { useEffect, useMemo, useRef, useState } from 'react'
import { dicebearAvatarUrl, getSessionUser, sessionUserDisplayAvatarUrl } from '../utils/sessionUser'

const CERTIFICATE_TYPES = [
  {
    id: 'literacy',
    short: 'AI',
    name: '人工智能素养认证',
    subtitle: '建立认知，理解人工智能的基本逻辑与社会价值',
    color: 'cyan',
    gradient: 'from-cyan-500 to-blue-700',
    accent: 'text-cyan-700',
    soft: 'bg-cyan-50 border-cyan-100',
    description: '面向 AI 学习起步阶段，关注人工智能的基础知识、工具体验与表达能力。',
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
    samples: ['AI 初识与生活应用', '智能工具体验报告', '负责任使用 AI'],
    coursePath: '完成对应星级的 AI 通识课程，包含 AI 感知世界、智能工具体验与数字伦理等主题。',
    assessment: '完成课程学习任务，并提交学习记录、体验作品或基础测评。',
    value: '作为 AI 学习起点与阶段结业证明，纳入个人成长档案。',
  },
  {
    id: 'creation',
    short: 'GC',
    name: 'AIGC 创意应用认证',
    subtitle: '以创意为核心，完成图文、音视频与交互作品表达',
    color: 'violet',
    gradient: 'from-violet-500 to-fuchsia-700',
    accent: 'text-violet-700',
    soft: 'bg-violet-50 border-violet-100',
    description: '围绕生成式人工智能的创意实践，考察学习者在提示设计、内容策划、作品表达和版权意识方面的能力。每一等级均以可展示的作品为核心成果。学习者将理解“创意想法如何变成 AI 可理解的任务”，并在文字、图像、音频、视频或交互内容中完成从灵感、策划到呈现的完整创作链路。',
    abilities: ['提示设计与迭代', '多媒体创意表达', '作品策划与版权意识'],
    samples: ['AI 绘本与海报设计', '数字角色与短片创作', '主题创意项目作品集'],
    coursePath: '完成对应星级的 AIGC 创作课程，逐步学习提示设计、内容生成、编辑优化与作品发布。',
    assessment: '完成主题创作任务，提交过程记录与最终作品，并通过作品评价。',
    value: '沉淀可展示的创意作品集，证明 AI 工具应用与创作表达能力。',
  },
  {
    id: 'engineering',
    short: 'ENG',
    name: '智能工程实践认证',
    subtitle: '用传感、编程和智能硬件完成真实问题的解决方案',
    color: 'amber',
    gradient: 'from-amber-400 to-orange-600',
    accent: 'text-amber-700',
    soft: 'bg-amber-50 border-amber-100',
    description: '聚焦智能硬件、机器人与编程控制，通过搭建、调试、测试和迭代，认证学习者将 AI 思维落实到工程项目的实践能力。学习者会经历“发现问题—设计方案—搭建调试—测试优化”的工程流程，理解传感器、控制器和程序如何协同工作，并用项目成果回应真实生活中的小问题。',
    abilities: ['智能硬件搭建', '程序控制与调试', '工程问题解决'],
    samples: ['智能循迹小车', '环境感知互动装置', '机器人任务挑战项目'],
    coursePath: '完成对应星级的智能硬件、机器人或编程控制课程，并完成项目挑战。',
    assessment: '完成设备搭建与程序调试，提交可运行项目及测试记录。',
    value: '形成工程实践与问题解决能力的阶段性证明，可用于项目成果展示。',
  },
  {
    id: 'research',
    short: 'R',
    name: 'AI 科创研究认证',
    subtitle: '以研究和成果为证，呈现跨学科探索与项目深度',
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-700',
    accent: 'text-emerald-700',
    soft: 'bg-emerald-50 border-emerald-100',
    description: '面向具备一定 AI 基础的学习者，关注课题选择、数据分析、模型应用、研究报告与成果答辩，形成可持续积累的科创成长档案。学习者将在导师或课程引导下，把兴趣转化为可研究的问题，完成资料查阅、方案设计、数据处理、模型或原型实践，并用规范的报告和答辩讲清自己的研究过程与结论。',
    abilities: ['研究问题设计', '数据与模型应用', '成果报告与答辩'],
    samples: ['AI 课题研究报告', '数据分析与模型实践', '科创成果展示答辩'],
    coursePath: '完成对应星级的 AI 科创、数据研究或项目式学习课程，形成完整研究过程。',
    assessment: '提交研究报告、项目成果或模型演示，并完成成果展示或答辩。',
    value: '形成更完整的科创成果档案，呈现研究思维、项目能力与表达能力。',
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

// 已确认仅「人工智能素养认证」采用 1–9 星体系；其余方向的等级设置待最终标准发布后补充。
const LEVELS_BY_CERTIFICATE = {
  literacy: LEVELS,
}

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
]

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

  return <section className="mt-16 border-t border-slate-200 pt-14" aria-labelledby="achievement-showcase-heading">
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-semibold tracking-[.12em] text-blue-600">STUDENT ACHIEVEMENTS</p><h2 id="achievement-showcase-heading" className="mt-2 text-3xl font-bold text-slate-950">学员认证成果展示</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">展示学员主动提交并经后台推荐的认证成果，记录每一次真实成长。</p></div><div className="flex flex-wrap gap-3 self-start sm:self-auto"><button type="button" onClick={() => setRecordsOpen(true)} className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-5 text-sm font-bold text-blue-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-blue-600"><FileTextOutlined aria-hidden="true"/>我的提交记录{submissionRecords.length ? <span className="grid h-5 min-w-5 place-items-center rounded-full bg-blue-100 px-1 text-[11px] text-blue-700" aria-label={`${submissionRecords.length}条记录`}>{submissionRecords.length}</span> : null}</button><button type="button" onClick={() => { setSubmitted(false); setUploadOpen(true) }} className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-blue-600"><UploadOutlined aria-hidden="true"/>上传我的成果</button></div></div>

    {submitted ? <div role="status" className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm leading-6 text-emerald-800"><CheckCircleOutlined className="shrink-0 text-lg" aria-hidden="true"/><p className="min-w-0 flex-1"><strong className="block">成果已提交审核</strong>审核通过并由后台设为推荐后，才会显示在前端成果展示中。</p><button type="button" onClick={() => setRecordsOpen(true)} className="min-h-10 cursor-pointer rounded-lg px-3 font-bold text-emerald-800 underline decoration-emerald-300 underline-offset-4 hover:bg-emerald-100">查看提交记录</button></div> : null}

    <div className="mt-8 grid gap-6 lg:grid-cols-2">{FEATURED_ACHIEVEMENTS.map((item) => <article key={item.id} className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_10px_28px_rgba(15,23,42,.07)] sm:grid-cols-[42%_58%]"><div className="flex min-h-[330px] items-center justify-center overflow-hidden bg-slate-100 p-4"><img src={item.certificate} alt={`${item.nickname}上传的${item.certificateName}`} width="600" height="840" loading="lazy" className="max-h-[340px] max-w-full object-contain"/></div><div className="flex flex-col justify-center p-5 sm:p-6"><div className="flex items-center gap-3"><img src={dicebearAvatarUrl(item.avatarSeed, 96)} alt={`${item.nickname}的头像`} width="48" height="48" loading="lazy" className="h-12 w-12 rounded-2xl bg-blue-50 object-cover"/><div><h3 className="font-bold text-slate-950">{item.nickname}</h3><p className="mt-0.5 text-xs leading-5 text-slate-500">{item.certificateName}</p></div></div><blockquote className="mt-5 text-sm leading-7 text-slate-600">“{item.comment}”</blockquote></div></article>)}</div>

    <p className="mt-6 text-center text-xs leading-6 text-slate-500">公开展示内容均需经过平台审核与推荐；未推荐的投稿仅保留在个人提交记录中。</p>
    <AchievementUploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} onSubmitted={(record) => { setUploadOpen(false); setSubmissionRecords((current) => [record, ...current]); setSubmitted(true) }}/>
    <SubmissionRecordsModal open={recordsOpen} onClose={() => setRecordsOpen(false)} records={submissionRecords}/>
  </section>
}

function CertificateSample() {
  return (
    <figure className="rounded-2xl bg-[#10213d] p-3 shadow-[0_18px_48px_rgba(17,24,39,.2)] sm:p-4">
      <img src="/certificates/l1-ai-explorer-bronze.png" alt="L1 AI Explorer Bronze 能力认证证书样例" className="w-full rounded-lg" />
      <figcaption className="px-2 pt-3 text-center text-xs text-slate-300">L1 AI Explorer Bronze 能力认证证书样例</figcaption>
    </figure>
  )
}

export default function Certification() {
  const [selectedType, setSelectedType] = useState('literacy')
  const [selectedStar, setSelectedStar] = useState(1)
  const certificate = useMemo(() => CERTIFICATE_TYPES.find((item) => item.id === selectedType), [selectedType])
  const levels = LEVELS_BY_CERTIFICATE[selectedType] ?? []
  const level = levels.find((item) => item.star === selectedStar)

  const selectCertificate = (type) => {
    setSelectedType(type)
    setSelectedStar((LEVELS_BY_CERTIFICATE[type] ?? [])[0]?.star ?? null)
  }

  return (
    <main className="bg-[#f8fafc] pb-16">
      <section className="relative overflow-hidden bg-[#0b1730] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_22%,rgba(45,212,191,.26),transparent_24%),radial-gradient(circle_at_70%_90%,rgba(99,102,241,.25),transparent_30%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="text-sm font-semibold tracking-[0.18em] text-cyan-200">BINGO AI CREDENTIALS</p>
          <div className="mt-5 grid items-end gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(280px,3fr)]">
            <div>
              <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">让每一份 AI 成长，<br />都有可被看见的证明</h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-300">缤果成果认证以“类别 + 分级标准 + 作品成果”构建清晰的能力成长档案。人工智能素养认证已确认采用九星等级；其他方向将按最终发布的认证标准设置等级。</p>
            </div>
            <div className="grid grid-cols-3 gap-3 border-t border-white/15 pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              {[['4', '认证类别'], ['9', '人工智能等级'], ['1', '份成长档案']].map(([number, label]) => <div key={label}><p className="text-3xl font-bold text-white">{number}</p><p className="mt-1 text-xs text-slate-400">{label}</p></div>)}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <section aria-labelledby="type-heading">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div><p className="text-sm font-medium text-primary">CERTIFICATION CATALOGUE</p><h2 id="type-heading" className="mt-1 text-2xl font-bold text-bingo-dark">选择你的认证方向</h2></div>
            <p className="text-sm text-slate-500">人工智能素养认证设 1–9 星；其他方向等级以最终标准为准</p>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {CERTIFICATE_TYPES.map((item) => {
              const active = item.id === selectedType
              return <button key={item.id} type="button" onClick={() => selectCertificate(item.id)} className={`min-h-44 rounded-2xl border p-5 text-left transition duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${active ? `${item.soft} shadow-md` : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm'}`}>
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} text-xs font-bold text-white shadow-sm`}>{item.short}</div>
                <h3 className="mt-5 font-bold text-bingo-dark">{item.name}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">{item.subtitle}</p>
                <p className={`mt-4 text-xs font-semibold ${item.accent}`}>{active ? '正在查看证书样板' : '查看证书样板 →'}</p>
              </button>
            })}
          </div>
        </section>

        <section className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-center" aria-labelledby="sample-heading">
          <CertificateSample />
          <div>
            <p className={`text-sm font-semibold ${certificate.accent}`}>CERTIFICATE PREVIEW</p>
            <h2 id="sample-heading" className="mt-2 text-3xl font-bold text-bingo-dark">{certificate.name}{level && <span className="ml-3 text-primary">{level.star} 星</span>}</h2>
            {certificate.introductionSections ? (
              <section className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 sm:p-6" aria-label="证书内容">
                <p className={`text-xs font-bold ${certificate.accent}`}>证书介绍</p>
                <p className="mt-3 text-sm leading-8 text-slate-600">{certificate.introductionSections.map((section) => section.text).join(' ')}</p>
              </section>
            ) : (
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">{certificate.description}</p>
            )}
            <div className="mt-6 flex flex-wrap gap-2">{certificate.abilities.map((ability) => <span key={ability} className={`rounded-full border px-3 py-1.5 text-xs ${certificate.soft} ${certificate.accent}`}>{ability}</span>)}</div>
            <div className="mt-8 border-y border-slate-200 py-5">
              {level ? <>
                <div className="flex items-center justify-between"><h3 className="font-bold text-bingo-dark">选择认证等级</h3><span className="text-sm text-slate-500">{level.stage} · {level.title}</span></div>
                <div className="mt-4 grid grid-cols-9 gap-2" role="radiogroup" aria-label="选择证书星级">
                  {levels.map((item) => <button key={item.star} type="button" role="radio" aria-checked={selectedStar === item.star} onClick={() => setSelectedStar(item.star)} className={`flex aspect-square min-h-10 items-center justify-center rounded-lg text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-primary ${selectedStar === item.star ? `bg-gradient-to-br ${certificate.gradient} text-white shadow-md` : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>{item.star}</button>)}
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600"><span className="font-semibold text-bingo-dark">{level.star} 星 · {level.title}：</span>{level.note}</p>
              </> : <>
                <h3 className="font-bold text-bingo-dark">认证等级</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">该认证方向的等级设置正在确认中，将以最终发布的认证标准为准。</p>
              </>}
            </div>
          </div>
        </section>

        <AchievementShowcase />

      </div>
    </main>
  )
}
