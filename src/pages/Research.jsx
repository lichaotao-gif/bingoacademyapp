import { useState } from 'react'
import { Link } from 'react-router-dom'

// ─── 数据 ─────────────────────────────────────────────────
const PROJECTS = [
  { id: 'ai-general', name: 'AI通识科学营', age: '8-12岁', dir: '兴趣启蒙', ageKey: '6-12',
    outline: 'AI通识、不插电实验、机器人实操', goal: '零基础入门AI，趣味实验+硬件实操',
    output: '简易机器人作品 + AI通识知识手册', ratio: '1:10 小班，科创导师+助教双指导',
    match: '青少年人工智能创新挑战赛（基础入门）' },
  { id: 'data-science', name: '数据科学研学营', age: '12-16岁', dir: '升学赋能', ageKey: '10-18',
    outline: '数据采集、可视化分析、报告撰写', goal: '掌握数据科学基础工具，培养数据思维',
    output: '数据分析报告 + 可视化作品集', ratio: '1:10 小班',
    match: '综评申报素材、信息学联赛' },
  { id: 'ml-intro', name: '机器学习启蒙营', age: '14-18岁', dir: '竞赛冲刺', ageKey: '14-18',
    outline: '模型初探、动手训练、成果展示', goal: '初步掌握机器学习原理，完成真实模型训练',
    output: '小型ML项目 + 实训报告', ratio: '1:8 精英班',
    match: '全国青少年AI创新大赛、综评课题' },
  { id: 'aigc-design', name: 'AIGC创意设计营', age: '10-15岁', dir: '兴趣启蒙', ageKey: '6-18',
    outline: 'AIGC工具使用、提示词工程、创意产出', goal: '掌握生成式AI工具，培养审美与创意表达',
    output: '数字画展/绘本/创意作品集', ratio: '1:10',
    match: 'AI艺术创意赛事' },
  { id: 'aerospace', name: '航空航天科创营', age: '10-16岁', dir: '兴趣启蒙', ageKey: '10-18',
    outline: '航天原理、模型制作、飞行实验', goal: '理解航空航天基础原理，动手完成飞行器模型',
    output: '飞行器模型作品 + 实验报告', ratio: '1:10',
    match: '航天科创类赛事' },
  { id: 'robot-contest', name: '机器人竞赛实训营', age: '12-18岁', dir: '竞赛冲刺', ageKey: '10-18',
    outline: '机器人搭建、编程控制、赛前模拟', goal: '系统训练竞赛技能，提升赛场应变能力',
    output: '竞赛机器人作品 + 技术文档', ratio: '1:8 精英班',
    match: '世界机器人大赛、全国青少年机器人大赛' },
  { id: 'unplugged', name: '不插电科学体验营', age: '6-10岁', dir: '兴趣启蒙', ageKey: '6-12',
    outline: '不插电实验、趣味科学小发明、观察记录', goal: '激发科学好奇心，建立基础科学思维',
    output: '科学小发明作品 + 观察日记', ratio: '1:8 启蒙班',
    match: '青少年科创启蒙类展示' },
]

const TRAINING = [
  { id: 'ml-topic', name: '机器学习课题实训', age: '14-18岁',
    flow: ['选题指导', '理论教学', '项目实操', '报告撰写', '成果答辩'],
    tools: 'Python · TensorFlow',
    output: '高校导师推荐信 · 小型ML项目报告 · 综评课题素材 · 科研实训合格证书',
    match: '综评申报 · 强基计划入门 · 科创竞赛课题支撑' },
  { id: 'data-viz', name: '数据可视化分析实训', age: '13-18岁',
    flow: ['需求分析', '数据清洗', '可视化建模', '报告撰写', '成果展示'],
    tools: 'Python · Excel · Tableau',
    output: '数据分析报告 · 可视化图表集 · 实训证书',
    match: '综评申报 · 信息学联赛辅助材料' },
  { id: 'ai-agent', name: 'AI智能体设计课题', age: '14-18岁',
    flow: ['课题确定', '需求分析', 'AI工具开发', '迭代优化', '演示答辩'],
    tools: 'Python · 大模型API · Prompt工程',
    output: 'AI智能体成品 · 设计报告 · 实训合格证书',
    match: '全国青少年AI创新大赛 · 综评材料' },
  { id: 'contest-custom', name: '科创竞赛课题定制', age: '14-18岁',
    flow: ['竞赛分析', '课题定制', '实操训练', '冲刺辅导', '模拟答辩'],
    tools: '按竞赛需求配置',
    output: '竞赛作品 · 课题报告 · 答辩素材',
    match: '全国各类AI/科创类白名单赛事' },
]

const CASES = [
  { id: 'c1', type: '竞赛获奖', name: '李同学', age: 16, project: '机器学习启蒙营+科创竞赛课题定制', result: 'XX青少年AI创新大赛省一等奖，入选国赛集训队' },
  { id: 'c2', type: '综评录取', name: '王同学', age: 17, project: '数据科学研学营+数据可视化实训', result: '综评素材完整，成功录取某985高校' },
  { id: 'c3', type: '科技特长生', name: '张同学', age: 16, project: 'AI通识科学营+机器学习启蒙营', result: '以科技特长生身份被XX大学提前录取' },
  { id: 'c4', type: '竞赛获奖', name: '陈同学', age: 15, project: '机器人竞赛实训营', result: '世界机器人大赛全国三等奖' },
  { id: 'c5', type: '海外升学', name: '刘同学', age: 18, project: 'AI智能体设计课题+AIGC创意营', result: 'AI项目作品集助力申请到美国某TOP30大学' },
  { id: 'c6', type: '综评录取', name: '赵同学', age: 17, project: '航空航天科创营+科创竞赛课题', result: '航天主题科创项目入围省级科创展' },
]

const EXPERIENCE = [
  { id: 'ex1', type: '1日营', name: '趣味不插电科学体验营', age: '6-9岁', time: '周六/日 9:00-16:00', price: '咨询报价', content: '水火箭制作、彩虹实验、简易科学小发明，全程无电子设备', ratio: '1:8' },
  { id: 'ex2', type: '1日营', name: 'AI+机器人趣味体验营', age: '8-12岁', time: '周六/日 9:00-16:00', price: '咨询报价', content: 'AI工具初体验+小型机器人搭建+趣味竞赛', ratio: '1:10' },
  { id: 'ex3', type: '周末课', name: '科学实验体验课', age: '6-10岁', time: '每周六 9:00-11:30', price: '咨询报价', content: '趣味科学实验系列，每次一个主题，可单次参与', ratio: '1:8' },
  { id: 'ex4', type: '周末课', name: 'AIGC创意体验课', age: '10-15岁', time: '每周日 14:00-17:00', price: '咨询报价', content: '生成式AI工具创意体验，完成一件数字艺术作品', ratio: '1:10' },
  { id: 'ex5', type: '周末课', name: '竞赛入门体验课', age: '12-16岁', time: '每周六 14:00-17:00', price: '咨询报价', content: '竞赛题型解析+实操体验，了解科创竞赛全流程', ratio: '1:8' },
]

const SAFETY = [
  { id: 's1', icon: '👨‍🏫', title: '师资配比保障', points: ['小班教学，配比不低于1:10（启蒙班1:8）', '每班配备科创导师+班主任+安全员', '所有导师经严格资质审核，持证上岗'] },
  { id: 's2', icon: '🏗️', title: '场地安全保障', points: ['合作基地均通过安全验收，定期检查', '实操区域配备安全防护设施与监控', '户外活动全程安全员陪同，规范操作'] },
  { id: 's3', icon: '🍱', title: '后勤保障', points: ['提供营养午餐，照顾饮食禁忌与特殊需求', '备有常用药品与急救物资，驻场医疗人员', '配备遮阳、防雨等应急物资'] },
  { id: 's4', icon: '🛡️', title: '保险保障', points: ['所有学员统一投保活动意外险', '保险覆盖研学全周期（含往返途中）', '理赔流程清晰，家长可随时查询保单'] },
]

const DOWNLOADS = [
  { name: 'AI通识科学营课程大纲', type: 'PDF', cat: '课程大纲' },
  { name: '数据科学研学营课程大纲', type: 'PDF', cat: '课程大纲' },
  { name: '机器学习启蒙营课程大纲', type: 'PDF', cat: '课程大纲' },
  { name: 'AIGC创意设计营课程大纲', type: 'PDF', cat: '课程大纲' },
  { name: '航空航天科创营课程大纲', type: 'PDF', cat: '课程大纲' },
  { name: '机器人竞赛实训营课程大纲', type: 'PDF', cat: '课程大纲' },
  { name: '不插电科学体验营课程大纲', type: 'PDF', cat: '课程大纲' },
  { name: '机器学习课题实训大纲', type: 'PDF', cat: '课程大纲' },
  { name: '研学营报名须知（通用版）', type: 'PDF', cat: '须知类' },
  { name: '家长须知（研学营专用）', type: 'PDF', cat: '须知类' },
  { name: '科研实训申请须知', type: 'PDF', cat: '须知类' },
  { name: '研学安全责任书', type: 'PDF', cat: '须知类' },
  { name: '退费政策说明', type: 'PDF', cat: '须知类' },
  { name: '研学成果报告模板', type: 'Word', cat: '模板类' },
  { name: '研学成果展示PPT模板', type: 'PPT', cat: '模板类' },
  { name: '科研实训项目报告模板', type: 'Word', cat: '模板类' },
  { name: '竞赛课题报告模板', type: 'Word', cat: '模板类' },
  { name: '综评申报素材模板', type: 'Word', cat: '模板类' },
]

const GALLERY_PHOTOS = [
  '🤖 AI通识营实操瞬间', '🔬 不插电实验精彩时刻', '🏆 竞赛颁奖现场',
  '👩‍🔬 数据科学营成果展示', '🚀 航天科创营模型发射', '🎨 AIGC创意营作品展',
  '🤝 师生互动答疑', '📊 机器学习实训答辩', '🎉 结营典礼合影',
]

const FAQ_DATA = [
  { cat: '报名类', items: [
    { q: '如何修改已提交的报名信息？', a: '请联系咨询热线或在线客服，提供报名姓名和联系电话，工作人员将协助修改。' },
    { q: '报名后是否可以更换营队/周期？', a: '报名确认前可免费更换；确认后更换需提前7天申请，视名额情况处理。' },
    { q: '多人报名是否有团购优惠？', a: '3人及以上同时报名可享团购优惠，具体金额请咨询客服。' },
  ]},
  { cat: '营队类', items: [
    { q: '研学营是否包含食宿、交通？', a: '短期1日营含午餐；长期营队含食宿，不含往返交通，具体以报名须知为准。' },
    { q: '营队师资配比是多少？', a: '通常为1:10小班，启蒙班和体验营为1:8，每班配科创导师+班主任+安全员。' },
    { q: '学员需要自带哪些物品？', a: '长期营队提供实验材料，学员携带个人日用品即可。详见《家长须知》。' },
  ]},
  { cat: '实训类', items: [
    { q: '科研实训项目需要具备基础吗？', a: '机器学习和AI智能体实训建议有初步编程基础；数据可视化和竞赛课题定制零基础可入门。' },
    { q: '高校导师是否全程指导？', a: '高校合作导师参与核心阶段（选题、中期评审、成果答辩），日常由专职助教全程陪跑。' },
    { q: '实训成果有哪些用途？', a: '可用于综评申报、强基计划材料、竞赛课题支撑、大学申请作品集等。' },
  ]},
  { cat: '升学类', items: [
    { q: '研学成果能否用于综评申报？', a: '科研实训成果（报告、证书）可直接作为综评佐证材料，高校导师推荐信具有较强说服力。' },
    { q: '竞赛获奖对升学有什么帮助？', a: '白名单赛事获奖可用于综评加分，科技特长生申报；国赛级奖项在强基计划中有较强优势。' },
    { q: '能否提供升学规划指导？', a: '可以，在线咨询界面提供专属升学规划顾问服务，结合学员情况一对一规划。' },
  ]},
]

const TYPE_FILE_COLORS = { 'PDF': 'bg-red-50 text-red-600', 'Word': 'bg-blue-50 text-blue-600', 'PPT': 'bg-orange-50 text-orange-600' }

// ─── 主组件 ────────────────────────────────────────────────
export default function Research() {
  const [section, setSection] = useState('home')
  const [ageFilter, setAgeFilter] = useState('all')
  const [dirFilter, setDirFilter] = useState('all')
  const [caseFilter, setCaseFilter] = useState('all')
  const [safetyDetail, setSafetyDetail] = useState(null)
  const [dlFilter, setDlFilter] = useState('all')
  const [customType, setCustomType] = useState('team')
  const [formState, setFormState] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [faqOpen, setFaqOpen] = useState({})
  const [regType, setRegType] = useState('long')
  const [expandedTraining, setExpandedTraining] = useState(null)
  const [galleryFilter, setGalleryFilter] = useState('all')
  const [selectedProject, setSelectedProject] = useState(null)

  const navItems = [
    { key: 'age', label: '按龄选营', icon: '🎓' },
    { key: 'projects', label: '精品研学项目', icon: '🧪' },
    { key: 'training', label: '科研实训', icon: '🔬' },
    { key: 'results', label: '升学成果', icon: '🏆' },
    { key: 'teachers', label: '师资团队', icon: '👨‍🏫' },
    { key: 'experience', label: '研学体验', icon: '✨' },
    { key: 'partners', label: '合作资源', icon: '🤝' },
    { key: 'safety', label: '安全保障', icon: '🛡️' },
    { key: 'gallery', label: '精彩回顾', icon: '📸' },
    { key: 'service', label: '研学服务中心', icon: '📋' },
  ]

  function NavBreadcrumb({ label }) {
    return (
      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => setSection('home')} className="text-sm text-slate-500 hover:text-primary transition">AI科创实践首页</button>
        <span className="text-slate-300">/</span>
        <span className="text-sm text-bingo-dark">{label}</span>
      </div>
    )
  }

  // ── 一级首页 ──
  if (section === 'home') return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Banner */}
      <section className="mb-10">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-bingo-dark via-slate-800 to-cyan-900 text-white p-8 sm:p-12">
          <div className="relative z-10 max-w-2xl">
            <p className="text-xs text-cyan-300 mb-2 tracking-wider">Bingo Academy · AI科创实践</p>
            <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-3">AI科创实践 · 让知识落地</h1>
            <p className="text-slate-300 text-sm mb-2">AI实战项目体验｜科创课题探究｜校企联合实训，让AI知识落地实践，锤炼科创思维与动手能力</p>
            <p className="text-slate-400 text-xs mb-6">覆盖6-18岁全龄段，分龄适配 · 高校联动 · 竞赛衔接 · 升学赋能</p>
            <div className="flex flex-wrap gap-3">
              <Link to="/research/detail/ai-general" className="bg-cyan-500 hover:bg-cyan-400 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition">研学报名</Link>
              <button onClick={() => setSection('projects')} className="bg-primary hover:bg-cyan-500 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition">了解实践详情</button>
              <button onClick={() => setSection('service')} className="bg-white/10 hover:bg-white/20 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition">立即报名咨询</button>
            </div>
          </div>
          <div className="absolute right-6 bottom-6 text-8xl opacity-10 select-none">🚀</div>
        </div>
      </section>

      {/* 核心入口 */}
      <section className="mb-10">
        <h2 className="section-title mb-4">功能导航</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {navItems.map(n => (
            <button key={n.key} onClick={() => setSection(n.key)}
              className="card p-4 flex flex-col items-center gap-2 hover:shadow-md hover:border-primary/30 hover:bg-primary/5 transition group">
              <span className="text-2xl">{n.icon}</span>
              <span className="text-xs font-medium text-slate-700 group-hover:text-primary text-center leading-tight">{n.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 进阶路径图 */}
      <section className="mb-10">
        <h2 className="section-title mb-4">科创研学成长路径</h2>
        <div className="card p-6 overflow-x-auto">
          <div className="flex items-center gap-0 min-w-max">
            {[
              { age: '6-9岁', label: '兴趣启蒙', tag: '启蒙班', color: 'bg-emerald-100 text-emerald-700', sec: 'experience' },
              { age: '8-12岁', label: 'AI通识入门', tag: '进阶班', color: 'bg-cyan-100 text-cyan-700', sec: 'projects' },
              { age: '10-14岁', label: '工具实操', tag: '进阶班', color: 'bg-sky-100 text-sky-700', sec: 'projects' },
              { age: '12-16岁', label: '数据&机器人', tag: '进阶班', color: 'bg-blue-100 text-blue-700', sec: 'projects' },
              { age: '14-18岁', label: '竞赛&科研', tag: '竞赛班', color: 'bg-indigo-100 text-indigo-700', sec: 'training' },
              { age: '16-18岁', label: '升学赋能', tag: '冲刺班', color: 'bg-violet-100 text-violet-700', sec: 'results' },
            ].map((step, i, arr) => (
              <div key={i} className="flex items-center">
                <button onClick={() => setSection(step.sec)}
                  className="flex flex-col items-center w-28 hover:scale-105 transition-transform">
                  <div className={'w-14 h-14 rounded-xl flex items-center justify-center text-xs font-bold mb-2 ' + step.color}>{step.age}</div>
                  <p className="text-xs font-medium text-bingo-dark text-center">{step.label}</p>
                  <span className="text-[10px] text-slate-400 mt-0.5">{step.tag}</span>
                </button>
                {i < arr.length - 1 && <div className="w-8 h-0.5 bg-slate-200 mx-1 shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 底部联系 */}
      <section className="card p-6 bg-slate-50 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-bingo-dark">立即咨询研学规划</p>
          <p className="text-sm text-slate-500 mt-1">电话：400-XXX-XXXX · 微信：bingoacademy · 邮箱：research@bingoacademy.cn</p>
          <div className="flex gap-3 mt-2">
            <button onClick={() => setSection('service')} className="text-cyan-600 text-sm font-medium hover:underline">团购预约</button>
            <button onClick={() => setSection('service-consult')} className="text-cyan-600 text-sm font-medium hover:underline">定制咨询</button>
          </div>
        </div>
        <button onClick={() => setSection('service')} className="btn-primary text-sm px-6 py-2.5">进入服务中心</button>
      </section>

      {/* 悬浮 */}
      <div className="fixed right-4 bottom-20 z-40 flex flex-col gap-2">
        <button onClick={() => setSection('service')} className="bg-primary text-white text-xs px-3 py-2.5 rounded-2xl shadow-lg hover:bg-cyan-600 transition">📋 报名咨询</button>
      </div>
    </div>
  )

  // ── 按龄选营 ──
  if (section === 'age') return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <NavBreadcrumb label="按龄选营" />
      <h2 className="text-2xl font-bold text-bingo-dark mb-1">按龄选营</h2>
      <p className="text-slate-600 text-sm mb-6">适配6-18岁，精准匹配成长需求 · 从启蒙到竞赛，每一步都有专属研学规划</p>
      <div className="flex gap-2 mb-6 flex-wrap">
        {[['all', '全部'], ['6-12', '6-9岁'], ['10-18', '10-14岁'], ['14-18', '14-18岁']].map(([k, l]) => (
          <button key={k} onClick={() => setAgeFilter(k)}
            className={'px-4 py-1.5 rounded-full text-sm transition ' + (ageFilter === k ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>{l}</button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse min-w-[640px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-4 py-3 text-slate-500 font-medium">班级</th>
              <th className="text-left px-4 py-3 text-slate-500 font-medium">适配年龄</th>
              <th className="text-left px-4 py-3 text-slate-500 font-medium">核心内容</th>
              <th className="text-left px-4 py-3 text-slate-500 font-medium">培养目标</th>
              <th className="text-left px-4 py-3 text-slate-500 font-medium">精品研学营</th>
            </tr>
          </thead>
          <tbody>
            {[
              {班: '启蒙班', 龄: '6-9岁', key: '6-12', 内容: '趣味科学启蒙、不插电实验', 目标: '激发科学探索兴趣，培养动手观察能力，建立基础科学思维', camps: ['不插电科学体验营'] },
              { 班: '进阶班', 龄: '10-14岁', key: '10-18', 内容: 'AI通识、机器人入门', 目标: '掌握基础科创工具，培养逻辑思维与简单项目实操能力', camps: ['AI通识科学营', '机器人竞赛实训营'] },
              { 班: '竞赛班', 龄: '14-18岁', key: '14-18', 内容: '竞赛导向、课题研究', 目标: '培养科创竞赛解题能力，掌握课题研究方法，适配升学综评', camps: ['机器学习启蒙营', '数据科学研学营'] },
            ].filter(row => ageFilter === 'all' || row.key === ageFilter || ageFilter === row.key).map((row, i) => (
              <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition">
                <td className="px-4 py-4 font-semibold text-bingo-dark">{row.班}</td>
                <td className="px-4 py-4 text-slate-600">{row.龄}</td>
                <td className="px-4 py-4 text-slate-600">{row.内容}</td>
                <td className="px-4 py-4 text-slate-600 max-w-xs">{row.目标}</td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap gap-1">
                    {row.camps.map(c => (
                      <button key={c} onClick={() => { setSelectedProject(PROJECTS.find(p => p.name === c)); setSection('project-detail') }}
                        className="text-xs text-primary hover:underline">{c}</button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  // ── 精品研学项目 ──
  if (section === 'projects') return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <NavBreadcrumb label="精品研学项目" />
      <h2 className="text-2xl font-bold text-bingo-dark mb-1">精品研学项目</h2>
      <p className="text-slate-600 text-sm mb-6">覆盖AI、航空航天、数据科学等热门领域，零基础可入门，适配不同年龄段需求</p>
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex gap-2 flex-wrap">
          {[['all', '全部年龄'], ['6-12', '6-9岁'], ['10-18', '10-14岁'], ['14-18', '14-18岁']].map(([k, l]) => (
            <button key={k} onClick={() => setAgeFilter(k)}
              className={'px-3 py-1.5 rounded-full text-xs transition ' + (ageFilter === k ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>{l}</button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {[['all', '全部方向'], ['兴趣启蒙', '兴趣启蒙'], ['竞赛冲刺', '竞赛冲刺'], ['升学赋能', '升学赋能']].map(([k, l]) => (
            <button key={k} onClick={() => setDirFilter(k)}
              className={'px-3 py-1.5 rounded-full text-xs transition ' + (dirFilter === k ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>{l}</button>
          ))}
        </div>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {PROJECTS.filter(p =>
          (ageFilter === 'all' || p.ageKey.includes(ageFilter.split('-')[0])) &&
          (dirFilter === 'all' || p.dir === dirFilter)
        ).map(p => (
          <Link key={p.id} to={`/research/detail/${p.id}`}
            className="card p-6 hover:shadow-md hover:border-primary/30 transition group cursor-pointer block">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-bingo-dark group-hover:text-primary transition">{p.name}</h3>
              <span className={'text-[10px] px-2 py-0.5 rounded-full shrink-0 ' +
                (p.dir === '竞赛冲刺' ? 'bg-amber-100 text-amber-700' : p.dir === '升学赋能' ? 'bg-violet-100 text-violet-700' : 'bg-emerald-100 text-emerald-700')}>{p.dir}</span>
            </div>
            <p className="text-xs text-slate-500 mb-2">适配年龄：{p.age}</p>
            <p className="text-sm text-slate-600 mb-3">{p.outline}</p>
            <p className="text-xs text-slate-500">成果产出：{p.output}</p>
            <div className="mt-3 text-xs text-primary group-hover:underline">查看详情 →</div>
          </Link>
        ))}
      </div>
    </div>
  )

  // ── 项目详情 ──
  if (section === 'project-detail' && selectedProject) {
    const p = selectedProject
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setSection('home')} className="text-sm text-slate-500 hover:text-primary">科学研学首页</button>
          <span className="text-slate-300">/</span>
          <button onClick={() => setSection('projects')} className="text-sm text-slate-500 hover:text-primary">精品研学项目</button>
          <span className="text-slate-300">/</span>
          <span className="text-sm text-bingo-dark">{p.name}</span>
        </div>
        <div className="card p-8">
          <h1 className="text-2xl font-bold text-bingo-dark mb-1">{p.name}</h1>
          <p className="text-slate-500 text-sm mb-6">适配年龄：{p.age}</p>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {[
              { label: '核心内容', value: p.outline },
              { label: '课程亮点', value: p.goal },
              { label: '成果产出', value: p.output },
              { label: '师资配比', value: p.ratio },
              { label: '适配赛事/升学', value: p.match },
            ].map((item, i) => (
              <div key={i}>
                <p className="text-xs font-semibold text-slate-400 mb-1">{item.label}</p>
                <p className="text-sm text-slate-700">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100">
            <button onClick={() => { setRegType('long'); setSection('service-reg') }} className="btn-primary text-sm px-5 py-2.5">立即报名</button>
            <button type="button" className="rounded-lg border border-primary text-primary text-sm px-5 py-2.5 hover:bg-primary/10 transition">下载课程大纲</button>
            <button onClick={() => setSection('service-consult')} className="rounded-lg border border-slate-200 text-slate-600 text-sm px-5 py-2.5 hover:bg-slate-50 transition">在线咨询</button>
          </div>
        </div>
      </div>
    )
  }

  // ── 科研实训 ──
  if (section === 'training') return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <NavBreadcrumb label="科研实训" />
      <h2 className="text-2xl font-bold text-bingo-dark mb-1">科研实训</h2>
      <p className="text-slate-600 text-sm mb-2">高校联动，深度解锁科创研究能力</p>
      <p className="text-slate-500 text-sm mb-6">对接高校实验室资源，专业导师指导，适配14-18岁升学、竞赛需求，打造专属课题研究经历</p>
      <div className="card p-5 bg-cyan-50 border-primary/20 mb-8 flex flex-wrap items-center gap-4">
        <div>
          <p className="font-semibold text-bingo-dark">合作高校资源</p>
          <p className="text-sm text-slate-600 mt-1">XX大学 · XX理工大学 · XX师范大学 — 合作实验室：AI实验室 · 数据科学实验室 · 机器人实验室</p>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-5">
        {TRAINING.map(t => (
          <div key={t.id} className="card p-6 hover:shadow-md hover:border-primary/30 transition">
            <h3 className="font-semibold text-bingo-dark mb-1">{t.name}</h3>
            <p className="text-xs text-slate-500 mb-3">适配年龄：{t.age} · 工具：{t.tools}</p>
            <div className="mb-3">
              <p className="text-xs font-semibold text-slate-400 mb-2">实训流程</p>
              <div className="flex flex-wrap gap-1">
                {t.flow.map((f, i) => (
                  <span key={i} className="flex items-center gap-1 text-xs text-slate-600">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">{i+1}</span>
                    {f}{i < t.flow.length - 1 && <span className="text-slate-300 mx-1">→</span>}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-1">学员收获：{t.output}</p>
            <p className="text-xs text-slate-500 mb-4">适配方向：{t.match}</p>
            <div className="flex gap-2">
              <button onClick={() => { setRegType('training'); setSection('service-reg') }} className="btn-primary text-xs px-4 py-2">申请报名</button>
              <button type="button" className="rounded-lg border border-primary text-primary text-xs px-4 py-2 hover:bg-primary/10 transition">下载实训大纲</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  // ── 升学成果 ──
  if (section === 'results') return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <NavBreadcrumb label="升学成果" />
      <h2 className="text-2xl font-bold text-bingo-dark mb-1">升学成果</h2>
      <p className="text-slate-600 text-sm mb-6">以科创为翼，助力多元升学 · 覆盖竞赛获奖、综评录取、科技特长生、海外升学等方向</p>
      <div className="flex gap-2 flex-wrap mb-6">
        {[['all', '全部'], ['竞赛获奖', '竞赛获奖'], ['综评录取', '综评录取'], ['科技特长生', '科技特长生'], ['海外升学', '海外升学']].map(([k, l]) => (
          <button key={k} onClick={() => setCaseFilter(k)}
            className={'px-4 py-1.5 rounded-full text-sm transition ' + (caseFilter === k ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>{l}</button>
        ))}
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {CASES.filter(c => caseFilter === 'all' || c.type === caseFilter).map(c => (
          <div key={c.id} className="card p-6 hover:shadow-md hover:border-primary/30 transition">
            <div className="flex items-center justify-between mb-3">
              <span className={'text-xs px-2 py-0.5 rounded-full ' +
                (c.type === '竞赛获奖' ? 'bg-amber-100 text-amber-700' : c.type === '综评录取' ? 'bg-violet-100 text-violet-700' : c.type === '科技特长生' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700')}>{c.type}</span>
            </div>
            <p className="text-sm text-slate-500 mb-1">{c.name}（匿名） · {c.age}岁</p>
            <p className="text-xs text-slate-500 mb-3">参与项目：{c.project}</p>
            <p className="text-sm text-slate-700 font-medium">{c.result}</p>
          </div>
        ))}
      </div>
      <div className="card p-6 bg-cyan-50 border-primary/20">
        <h3 className="font-semibold text-bingo-dark mb-3">升学配套服务</h3>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
          {['竞赛报名指导', '综评材料打磨', '科技特长生申报咨询', '升学规划指导'].map((s, i) => (
            <button key={i} onClick={() => setSection('service-consult')}
              className="card p-4 text-center text-sm font-medium text-primary hover:bg-primary/5 hover:shadow-md transition">{s}</button>
          ))}
        </div>
      </div>
    </div>
  )

  // ── 师资团队 ──
  if (section === 'teachers') return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <NavBreadcrumb label="师资团队" />
      <h2 className="text-2xl font-bold text-bingo-dark mb-1">师资团队</h2>
      <p className="text-slate-600 text-sm mb-6">专业赋能，陪伴每一步科创成长 · 汇聚教研、高校、竞赛三大领域优质师资</p>
      {['教研团队', '高校合作导师', '科创竞赛教练'].map((cat, ci) => (
        <section key={cat} className="mb-8">
          <h3 className="font-semibold text-bingo-dark mb-4">{cat}</h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(ci === 0 ? 3 : 2)].map((_, i) => (
              <div key={i} className="card p-6 hover:shadow-md hover:border-primary/30 transition">
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg shrink-0">师</div>
                  <div>
                    <p className="font-semibold text-bingo-dark">{ ['张老师', '李老师', '王老师', '陈博士', '刘教授', '赵教练', '钱教练'][ci * 2 + i] || '待更新'}</p>
                    <p className="text-xs text-slate-500">{cat} · AI科创教育</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500">5年+科创教学经验，主导设计多套研学课程，曾指导数百名学员完成科创实操项目</p>
                <p className="text-xs text-primary mt-2 font-medium">"以兴趣为导向，让每个孩子感受科创的乐趣"</p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )

  // ── 研学体验 ──
  if (section === 'experience') return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <NavBreadcrumb label="研学体验" />
      <h2 className="text-2xl font-bold text-bingo-dark mb-1">研学体验</h2>
      <p className="text-slate-600 text-sm mb-6">低门槛解锁科创乐趣 · 1日营、周末体验课，激发科学兴趣，作为长期营队引流入口</p>
      <div className="flex gap-2 mb-6 flex-wrap">
        {[['all', '全部'], ['1日营', '1日研学体验营'], ['周末课', '周末体验课']].map(([k, l]) => (
          <button key={k} onClick={() => setAgeFilter(k)}
            className={'px-4 py-1.5 rounded-full text-sm transition ' + (ageFilter === k ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>{l}</button>
        ))}
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {EXPERIENCE.filter(e => ageFilter === 'all' || e.type === ageFilter).map(e => (
          <div key={e.id} className="card p-6 hover:shadow-md hover:border-primary/30 transition group">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-bingo-dark group-hover:text-primary transition">{e.name}</h3>
              <span className={'text-[10px] px-2 py-0.5 rounded-full shrink-0 ' + (e.type === '1日营' ? 'bg-amber-100 text-amber-700' : 'bg-primary/10 text-primary')}>{e.type}</span>
            </div>
            <p className="text-xs text-slate-500 mb-1">年龄：{e.age} · 师生比：{e.ratio}</p>
            <p className="text-xs text-slate-500 mb-3">时间：{e.time}</p>
            <p className="text-sm text-slate-600 mb-4">{e.content}</p>
            {e.type === '1日营' && <p className="text-xs text-amber-600 mb-3 font-medium">🎁 3人成团享团购优惠</p>}
            <button onClick={() => { setRegType('short'); setSection('service-reg') }} className="btn-primary text-xs px-4 py-2 w-full">在线预约</button>
          </div>
        ))}
      </div>
    </div>
  )

  // ── 合作资源 ──
  if (section === 'partners') return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <NavBreadcrumb label="合作资源" />
      <h2 className="text-2xl font-bold text-bingo-dark mb-1">合作资源</h2>
      <p className="text-slate-600 text-sm mb-8">强强联合，打造高品质科创研学平台 · 汇聚高校、实验室、科创企业、竞赛组委会优质资源</p>
      {[
        { cat: '合作高校 / 实验室', items: ['XX大学 — 人工智能实验室', 'XX理工大学 — 数据科学实验室', 'XX师范大学 — 科创教育中心'] },
        { cat: '合作科创企业', items: ['XX机器人企业 — 提供设备与工程师指导', 'XX人工智能企业 — 提供大模型课程授权', 'XX航天科技 — 提供航天实训材料'] },
        { cat: '合作竞赛组委会', items: ['全国青少年AI创新大赛组委会', '世界机器人大赛指定培训机构', '蓝桥杯授权培训机构'] },
      ].map(g => (
        <section key={g.cat} className="mb-8">
          <h3 className="font-semibold text-bingo-dark mb-3">{g.cat}</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {g.items.map((item, i) => (
              <div key={i} className="card p-5 hover:shadow-md hover:border-primary/30 transition">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold mb-3">{item.charAt(0)}</div>
                <p className="text-sm text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )

  // ── 安全保障 ──
  if (section === 'safety') return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <NavBreadcrumb label="安全保障" />
      <h2 className="text-2xl font-bold text-bingo-dark mb-1">安全保障</h2>
      <p className="text-slate-600 text-sm mb-8">全程守护，让家长放心，让学员安心 · 构建全方位、多层次安全保障体系</p>
      <div className="grid md:grid-cols-2 gap-5 mb-6">
        {SAFETY.map(s => (
          <div key={s.id} className="card p-6 hover:shadow-md hover:border-primary/30 transition cursor-pointer"
            onClick={() => setSafetyDetail(safetyDetail === s.id ? null : s.id)}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{s.icon}</span>
              <h3 className="font-semibold text-bingo-dark">{s.title}</h3>
              <span className="ml-auto text-slate-400 text-sm">{safetyDetail === s.id ? '▲' : '▼'}</span>
            </div>
            {safetyDetail === s.id && (
              <ul className="space-y-2">
                {s.points.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>{p}
                  </li>
                ))}
              </ul>
            )}
            {safetyDetail !== s.id && <p className="text-xs text-slate-400">{s.points[0]}</p>}
          </div>
        ))}
      </div>
      <div className="card p-5 bg-red-50 border-red-200/60">
        <p className="font-semibold text-red-700 mb-1">📞 应急咨询</p>
        <p className="text-sm text-slate-600">应急热线：400-XXX-XXXX（24小时） · 应急处理流程：就地评估 → 联系家长 → 医疗处置 → 上报机构</p>
      </div>
    </div>
  )

  // ── 精彩回顾 ──
  if (section === 'gallery') return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <NavBreadcrumb label="精彩回顾" />
      <h2 className="text-2xl font-bold text-bingo-dark mb-1">精彩回顾</h2>
      <p className="text-slate-600 text-sm mb-6">记录科创成长的每一个瞬间 · 定期更新，见证学员从兴趣到专业的科创之路</p>
      <div className="flex gap-2 mb-6 flex-wrap">
        {[['all', '全部'], ['实操', '实操瞬间'], ['成果', '成果展示'], ['互动', '师生互动'], ['竞赛', '竞赛实训']].map(([k, l]) => (
          <button key={k} onClick={() => setGalleryFilter(k)}
            className={'px-4 py-1.5 rounded-full text-sm transition ' + (galleryFilter === k ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>{l}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-8">
        {GALLERY_PHOTOS.map((photo, i) => (
          <div key={i} className="aspect-square rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center hover:shadow-md transition cursor-pointer group">
            <div className="text-center px-2">
              <div className="text-3xl mb-1">{['🤖','🔬','🏆','📊','🚀','🎨','🤝','📋','🎉'][i % 9]}</div>
              <p className="text-xs text-slate-500 group-hover:text-primary transition">{photo}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="card p-6 bg-slate-50">
        <h3 className="font-semibold text-bingo-dark mb-3">研学精彩视频</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {['2025年春季研学营精彩回顾', '竞赛冲刺班成果答辩现场'].map((v, i) => (
            <div key={i} className="aspect-video rounded-xl bg-gradient-to-br from-bingo-dark to-slate-700 flex items-center justify-center cursor-pointer hover:opacity-90 transition">
              <div className="text-center text-white">
                <div className="text-4xl mb-2">▶</div>
                <p className="text-sm">{v}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // ── 研学服务中心（主界面） ──
  if (section === 'service') return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <NavBreadcrumb label="研学服务中心" />
      <h2 className="text-2xl font-bold text-bingo-dark mb-1">研学服务中心</h2>
      <p className="text-slate-600 text-sm mb-8">全流程服务，护航科创之旅 · 报名、咨询、资料下载、定制服务一站式解决</p>
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5 mb-8">
        {[
          { key: 'service-reg', icon: '📝', label: '报名通道', desc: '长期营队 · 短期体验 · 科研实训' },
          { key: 'service-consult', icon: '💬', label: '在线咨询', desc: '7×12小时 · FAQ · 电话微信' },
          { key: 'service-dl', icon: '📥', label: '资料下载', desc: '课程大纲 · 须知 · 模板，无需登录' },
          { key: 'service-custom', icon: '🛠️', label: '定制服务', desc: '团体 · 个人 · 竞赛 · 实训定制' },
        ].map(s => (
          <button key={s.key} onClick={() => setSection(s.key)}
            className="card p-6 flex flex-col items-center text-center hover:shadow-md hover:border-primary/30 hover:bg-primary/5 transition group">
            <span className="text-3xl mb-3">{s.icon}</span>
            <h3 className="font-semibold text-bingo-dark group-hover:text-primary mb-1">{s.label}</h3>
            <p className="text-xs text-slate-500">{s.desc}</p>
          </button>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { key: 'faq', icon: '❓', label: '常见疑问' },
          { key: 'refund', icon: '↩️', label: '退费申请' },
          { key: 'query', icon: '🔍', label: '报名查询' },
          { key: 'feedback', icon: '📣', label: '投诉建议' },
        ].map(s => (
          <button key={s.key} onClick={() => setSection('service-consult')}
            className="card p-4 flex items-center gap-3 hover:shadow-md hover:border-primary/30 transition text-sm">
            <span className="text-xl">{s.icon}</span>
            <span className="font-medium text-slate-700">{s.label}</span>
          </button>
        ))}
      </div>
      <div className="card p-5 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-slate-600">服务时间：工作日 9:00-21:00，周末 10:00-18:00</div>
        <div className="text-sm text-slate-600">热线：400-XXX-XXXX · 微信：bingoacademy</div>
        <button onClick={() => setSection('home')} className="text-sm text-primary hover:underline">返回首页</button>
      </div>
    </div>
  )

  // ── 报名通道 ──
  if (section === 'service-reg') return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setSection('service')} className="text-sm text-slate-500 hover:text-primary">服务中心</button>
        <span className="text-slate-300">/</span>
        <span className="text-sm text-bingo-dark">报名通道</span>
      </div>
      <h2 className="text-2xl font-bold text-bingo-dark mb-6">报名通道</h2>
      <div className="flex gap-2 mb-6 flex-wrap">
        {[['long', '长期研学营'], ['short', '短期体验课'], ['training', '科研实训申请']].map(([k, l]) => (
          <button key={k} onClick={() => setRegType(k)}
            className={'px-5 py-2 rounded-full text-sm font-medium transition ' + (regType === k ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>{l}</button>
        ))}
      </div>
      {submitted ? (
        <div className="card p-10 text-center">
          <div className="text-5xl mb-3">✅</div>
          <h3 className="font-bold text-bingo-dark text-xl mb-2">报名提交成功！</h3>
          <p className="text-slate-600 mb-1">1-2个工作日内专人联系，请保持手机畅通</p>
          <p className="text-slate-500 text-sm mb-6">确认短信已发送至您预留的手机号</p>
          <button onClick={() => { setSubmitted(false); setSection('service') }} className="btn-primary text-sm px-6 py-2.5">返回服务中心</button>
        </div>
      ) : (
        <form onSubmit={e => { e.preventDefault(); setSubmitted(true) }} className="card p-8 space-y-5">
          {regType === 'long' && (
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">营队选择 *</label>
              <select required className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary bg-white">
                <option value="">请选择营队</option>
                {PROJECTS.map(p => <option key={p.id}>{p.name}</option>)}
              </select>
            </div>
          )}
          {regType === 'training' && (
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">实训项目 *</label>
              <select required className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary bg-white">
                <option value="">请选择实训项目</option>
                {TRAINING.map(t => <option key={t.id}>{t.name}</option>)}
              </select>
            </div>
          )}
          {regType === 'short' && (
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">体验活动 *</label>
              <select required className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary bg-white">
                <option value="">请选择体验活动</option>
                {EXPERIENCE.map(e => <option key={e.id}>{e.name}</option>)}
              </select>
            </div>
          )}
          {[
            { label: '学员姓名', type: 'text', ph: '请输入学员姓名', req: true },
            { label: '学员年龄', type: 'number', ph: '请输入年龄', req: true },
            { label: '联系电话', type: 'tel', ph: '请输入家长手机号（用于接收确认信息）', req: true },
            { label: '家长姓名', type: 'text', ph: '请输入家长姓名', req: true },
            { label: '备注信息', type: 'text', ph: '饮食禁忌、特殊需求等（选填）', req: false },
          ].map((f, i) => (
            <div key={i}>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">{f.label} {f.req && '*'}</label>
              <input type={f.type} required={f.req} placeholder={f.ph}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary" />
            </div>
          ))}
          <div className="flex items-start gap-2">
            <input required type="checkbox" id="agree" className="mt-1" />
            <label htmlFor="agree" className="text-sm text-slate-600">我已阅读并同意 <button type="button" className="text-primary hover:underline">《报名须知》</button>《退费政策》《安全责任书》</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1 py-3">提交报名</button>
            <button type="reset" className="flex-1 border border-slate-200 rounded-lg py-3 text-sm text-slate-600 hover:bg-slate-50">重置表单</button>
          </div>
        </form>
      )}
    </div>
  )

  // ── 在线咨询 ──
  if (section === 'service-consult') return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setSection('service')} className="text-sm text-slate-500 hover:text-primary">服务中心</button>
        <span className="text-slate-300">/</span>
        <span className="text-sm text-bingo-dark">在线咨询</span>
      </div>
      <h2 className="text-2xl font-bold text-bingo-dark mb-8">在线咨询</h2>
      <div className="grid md:grid-cols-3 gap-5 mb-8">
        {[
          { icon: '💬', title: '即时在线咨询', desc: '工作日 9:00-21:00 / 周末 10:00-18:00', tag: '在线', color: 'border-emerald-200 bg-emerald-50' },
          { icon: '📞', title: '电话咨询', desc: '400-XXX-XXXX（服务时间同上）', tag: '点击拨号', color: 'border-sky-200 bg-sky-50' },
          { icon: '📱', title: '企业微信咨询', desc: '扫码添加客服，获取专属咨询', tag: '扫码添加', color: 'border-primary/20 bg-primary/5' },
        ].map((c, i) => (
          <div key={i} className={'card p-6 border ' + c.color}>
            <span className="text-3xl mb-3 block">{c.icon}</span>
            <h3 className="font-semibold text-bingo-dark mb-1">{c.title}</h3>
            <p className="text-xs text-slate-500 mb-3">{c.desc}</p>
            <span className="text-xs px-3 py-1 rounded-full bg-white border border-slate-200 text-slate-600">{c.tag}</span>
          </div>
        ))}
      </div>
      <h3 className="font-semibold text-bingo-dark mb-4">常见问题 FAQ</h3>
      {FAQ_DATA.map(group => (
        <div key={group.cat} className="mb-5">
          <p className="text-xs font-semibold text-slate-400 mb-2">{group.cat}</p>
          <div className="space-y-2">
            {group.items.map((item, i) => {
              const key = group.cat + i
              return (
                <details key={i} className="card p-4 group" open={faqOpen[key]}>
                  <summary className="font-medium text-sm text-bingo-dark cursor-pointer list-none flex items-center justify-between"
                    onClick={() => setFaqOpen(prev => ({...prev, [key]: !prev[key]}))}>
                    {item.q}
                    <span className="text-slate-400 shrink-0 ml-2">▼</span>
                  </summary>
                  <p className="text-sm text-slate-600 mt-3 pt-3 border-t border-slate-100">{item.a}</p>
                </details>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )

  // ── 资料下载 ──
  if (section === 'service-dl') return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setSection('service')} className="text-sm text-slate-500 hover:text-primary">服务中心</button>
        <span className="text-slate-300">/</span>
        <span className="text-sm text-bingo-dark">资料下载</span>
      </div>
      <h2 className="text-2xl font-bold text-bingo-dark mb-2">资料下载</h2>
      <p className="text-slate-600 text-sm mb-6">便捷获取，助力研学准备 · 无需登录，点击即可下载，资料定期更新</p>
      <div className="flex gap-2 mb-6 flex-wrap">
        {[['all', '全部'], ['课程大纲', '课程大纲'], ['须知类', '须知类'], ['模板类', '模板类']].map(([k, l]) => (
          <button key={k} onClick={() => setDlFilter(k)}
            className={'px-4 py-1.5 rounded-full text-sm transition ' + (dlFilter === k ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>{l}</button>
        ))}
      </div>
      <div className="space-y-2">
        {DOWNLOADS.filter(d => dlFilter === 'all' || d.cat === dlFilter).map((d, i) => (
          <div key={i} className="card p-4 flex items-center justify-between gap-3 hover:border-primary/30 transition">
            <div className="flex items-center gap-3">
              <span className={'text-xs px-2 py-1 rounded font-medium ' + (TYPE_FILE_COLORS[d.type] || 'bg-slate-100 text-slate-600')}>{d.type}</span>
              <span className="text-sm text-slate-700">{d.name}</span>
            </div>
            <button type="button" className="btn-primary text-xs px-4 py-1.5 shrink-0">下载</button>
          </div>
        ))}
      </div>
    </div>
  )

  // ── 定制服务 ──
  if (section === 'service-custom') return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setSection('service')} className="text-sm text-slate-500 hover:text-primary">服务中心</button>
        <span className="text-slate-300">/</span>
        <span className="text-sm text-bingo-dark">定制服务</span>
      </div>
      <h2 className="text-2xl font-bold text-bingo-dark mb-2">定制服务</h2>
      <p className="text-slate-600 text-sm mb-6">按需定制，打造专属科创研学方案 · 适配学校、机构、企业团体及个人个性化需求</p>
      <div className="flex gap-2 mb-6 flex-wrap">
        {[['team', '团体研学定制'], ['personal', '个人个性化定制'], ['contest', '竞赛课题定制'], ['training', '科研实训定制']].map(([k, l]) => (
          <button key={k} onClick={() => setCustomType(k)}
            className={'px-5 py-2 rounded-full text-sm font-medium transition ' + (customType === k ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>{l}</button>
        ))}
      </div>
      {submitted ? (
        <div className="card p-10 text-center">
          <div className="text-5xl mb-3">✅</div>
          <h3 className="font-bold text-bingo-dark text-xl mb-2">定制需求提交成功！</h3>
          <p className="text-slate-600 mb-5">专属顾问将在2个工作日内与您联系</p>
          <button onClick={() => { setSubmitted(false) }} className="btn-primary text-sm px-6 py-2.5">再次提交</button>
        </div>
      ) : (
        <form onSubmit={e => { e.preventDefault(); setSubmitted(true) }} className="card p-8 space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">联系人姓名 *</label>
              <input required className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary" placeholder="请输入姓名" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">联系电话 *</label>
              <input required type="tel" className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary" placeholder="请输入手机号" />
            </div>
            {customType === 'team' && <>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">团体名称 *</label>
                <input required className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary" placeholder="学校/机构/企业名称" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">参与人数 *</label>
                <input required type="number" className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary" placeholder="20人以上" />
              </div>
            </>}
            {customType !== 'team' && <>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">学员年龄 *</label>
                <input required className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary" placeholder="请输入年龄" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                  {customType === 'contest' ? '目标竞赛' : customType === 'training' ? '升学目标' : '核心需求'}
                </label>
                <input className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                  placeholder={customType === 'contest' ? '请输入目标竞赛名称' : customType === 'training' ? '综评/强基/海外升学' : '请描述个性化需求'} />
              </div>
            </>}
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">详细需求说明</label>
            <textarea rows={4} className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary resize-none"
              placeholder="请详细描述您的定制需求，以便我们为您制定专属方案..." />
          </div>
          <button type="submit" className="btn-primary w-full py-3 text-sm">提交定制需求 · 2个工作日内专人联系</button>
        </form>
      )}
    </div>
  )

  return null
}
