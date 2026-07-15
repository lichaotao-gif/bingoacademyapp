import { useMemo, useState } from 'react'

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
    description: '面向 AI 学习起步阶段，关注人工智能的基础知识、信息伦理、工具体验与表达能力。通过课程任务和实践作品，记录学习者从“认识 AI”到“理解 AI”的成长过程。学习者会从生活中的智能现象出发，了解人类五感与机器感知的关系，建立对数据、算法与智能工具的基本认识，并学会以安全、负责任的方式使用人工智能。',
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
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">{certificate.description}</p>
            <div className="mt-6 flex flex-wrap gap-2">{certificate.abilities.map((ability) => <span key={ability} className={`rounded-full border px-3 py-1.5 text-xs ${certificate.soft} ${certificate.accent}`}>{ability}</span>)}</div>
            <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="font-bold text-bingo-dark">获得这张证书，需要完成什么？</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div><p className="text-xs font-semibold text-slate-400">01 · 对应课程</p><p className="mt-2 text-sm leading-6 text-slate-700">{certificate.coursePath}</p></div>
                <div><p className="text-xs font-semibold text-slate-400">02 · 考核与成果</p><p className="mt-2 text-sm leading-6 text-slate-700">{certificate.assessment}</p></div>
                <div><p className="text-xs font-semibold text-slate-400">03 · 证书作用</p><p className="mt-2 text-sm leading-6 text-slate-700">{certificate.value}</p></div>
              </div>
              <p className="mt-4 border-t border-slate-200 pt-3 text-xs leading-5 text-slate-400">说明：具体课程名称、课时与考核规则将以该等级最终发布的认证标准为准。</p>
            </div>
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

      </div>
    </main>
  )
}
