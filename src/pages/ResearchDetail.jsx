import { Link, useParams } from 'react-router-dom'

// 营期与价格配置（可后台扩展）
const CAMP_PERIODS = {
  'ai-general': [
    { id: 'p1', name: '2025暑期营', date: '2025-07-15', days: 7, place: '北京', limit: 30, left: 12, price: 3980, origPrice: 4580, earlyBird: 3580, groupPrice: 3380 },
    { id: 'p2', name: '2025国庆营', date: '2025-10-01', days: 5, place: '上海', limit: 25, left: 18, price: 2980, origPrice: 3580, earlyBird: 2680 },
  ],
  'data-science': [
    { id: 'p1', name: '暑期数据科学营', date: '2025-07-20', days: 10, place: '杭州', limit: 20, left: 8, price: 5980, origPrice: 6980, earlyBird: 5480 },
  ],
  default: [
    { id: 'p1', name: '2025暑期营', date: '2025-07-15', days: 7, place: '北京', limit: 30, left: 12, price: 3980, origPrice: 4580, earlyBird: 3580 },
  ],
}

const PROJECTS = {
  'ai-general': { name: 'AI通识科学营', age: '8-12岁', dir: '兴趣启蒙', outline: 'AI通识、不插电实验、机器人实操', goal: '零基础入门AI，趣味实验+硬件实操', output: '简易机器人作品 + AI通识知识手册', ratio: '1:10 小班', match: '青少年人工智能创新挑战赛（基础入门）' },
  'data-science': { name: '数据科学研学营', age: '12-16岁', dir: '升学赋能', outline: '数据采集、可视化分析、报告撰写', goal: '掌握数据科学基础工具，培养数据思维', output: '数据分析报告 + 可视化作品集', ratio: '1:10 小班', match: '综评申报素材、信息学联赛' },
  'ml-intro': { name: '机器学习启蒙营', age: '14-18岁', dir: '竞赛冲刺', outline: '模型初探、动手训练、成果展示', goal: '初步掌握机器学习原理', output: '小型ML项目 + 实训报告', ratio: '1:8 精英班', match: '全国青少年AI创新大赛' },
  'aigc-design': { name: 'AIGC创意设计营', age: '10-15岁', dir: '兴趣启蒙', outline: 'AIGC工具使用、提示词工程', goal: '掌握生成式AI工具，培养审美与创意表达', output: '数字画展/绘本/创意作品集', ratio: '1:10', match: 'AI艺术创意赛事' },
  'robot-contest': { name: '机器人竞赛实训营', age: '12-18岁', dir: '竞赛冲刺', outline: '机器人搭建、编程控制、赛前模拟', goal: '系统训练竞赛技能', output: '竞赛机器人作品 + 技术文档', ratio: '1:8', match: '世界机器人大赛' },
  'unplugged': { name: '不插电科学体验营', age: '6-10岁', dir: '兴趣启蒙', outline: '不插电实验、趣味科学小发明', goal: '激发科学好奇心', output: '科学小发明作品 + 观察日记', ratio: '1:8', match: '青少年科创启蒙类展示' },
  'aerospace': { name: '航空航天科创营', age: '10-16岁', dir: '兴趣启蒙', outline: '航天原理、模型制作、飞行实验', goal: '理解航空航天基础原理', output: '飞行器模型作品 + 实验报告', ratio: '1:10', match: '航天科创类赛事' },
}

export default function ResearchDetail() {
  const { id } = useParams()
  const p = PROJECTS[id] || PROJECTS['ai-general']
  const periods = CAMP_PERIODS[id] || CAMP_PERIODS.default

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/research" className="text-sm text-slate-500 hover:text-primary">← AI科创实践</Link>
        <span className="text-slate-300">/</span>
        <Link to="/research" className="text-sm text-slate-500 hover:text-primary">研学项目</Link>
        <span className="text-slate-300">/</span>
        <span className="text-sm text-bingo-dark font-medium">{p.name}</span>
      </div>

      <div className="card p-6 mb-6">
        <h1 className="text-2xl font-bold text-bingo-dark mb-1">{p.name}</h1>
        <p className="text-slate-500 text-sm mb-4">适配年龄：{p.age} · {p.dir}</p>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          {[
            { label: '核心内容', value: p.outline },
            { label: '课程亮点', value: p.goal },
            { label: '成果产出', value: p.output },
            { label: '师资配比', value: p.ratio },
            { label: '适配赛事/升学', value: p.match },
          ].map((item, i) => (
            <div key={i}>
              <p className="text-xs font-semibold text-slate-400 mb-0.5">{item.label}</p>
              <p className="text-slate-700">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 营期信息 */}
      <section className="mb-6">
        <h2 className="section-title mb-4">营期信息</h2>
        <div className="space-y-4">
          {periods.map((per) => (
            <div key={per.id} className="card p-5 border-primary/20">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-bingo-dark">{per.name}</h3>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-600">
                    <span>📅 {per.date} · {per.days}天</span>
                    <span>📍 {per.place}</span>
                    <span>适合{p.age}</span>
                    <span className="text-rose-600">剩余 {per.left} 名额</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">人数上限 {per.limit} 人</p>
                  <p className="text-2xl font-bold text-primary">¥{per.price}</p>
                  {per.origPrice && <p className="text-sm text-slate-400 line-through">¥{per.origPrice}</p>}
                  {per.earlyBird && <p className="text-xs text-amber-600 mt-1">早鸟价 ¥{per.earlyBird}</p>}
                  {per.groupPrice && <p className="text-xs text-emerald-600">3人团 ¥{per.groupPrice}/人</p>}
                  <Link to={`/research/register/${id}?period=${per.id}`} state={{ project: p, period: per }}
                    className="mt-3 inline-block btn-primary text-sm px-5 py-2">立即报名</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 价格说明 */}
      <section className="mb-6">
        <h2 className="section-title mb-3">价格说明</h2>
        <div className="card p-4 bg-slate-50 text-sm text-slate-600">
          <p>· 早鸟价：开营前30天报名享优惠</p>
          <p>· 团报价：3人及以上同时报名享团报优惠</p>
          <p>· 含：课程费、材料费、午餐、保险；不含往返交通</p>
        </div>
      </section>

      {/* 底部固定栏 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg py-3 px-4 z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">选择营期后点击「立即报名」</p>
            <p className="text-xs text-slate-400">名额锁定30分钟，超时自动释放</p>
          </div>
          <Link to={`/research/register/${id}`} state={{ project: p, period: periods[0] }}
            className="btn-primary px-8 py-2.5 font-bold">立即报名</Link>
        </div>
      </div>
    </div>
  )
}
