const REPORT_ITEMS = [
  { type: '热点', text: '教育部发文推进中小学AI教育，素养与伦理并重', date: '2025-02' },
  { type: '行业', text: '青少年AI赛事白名单扩容，科创素养成升学加分项', date: '2025-02' },
  { type: '荣誉', text: '缤果AI学院获「年度AI教育创新机构」称号', date: '2025-01' },
  { type: '热点', text: '多省市将AI素养纳入综合素质评价', date: '2025-01' },
  { type: '荣誉', text: '缤果学员在全国青少年AI挑战赛中获一等奖', date: '2025-01' },
  { type: '行业', text: '产教融合政策加码，企业与院校合作AI实训', date: '2024-12' },
]

const items = [
  { title: '公益助学活动', desc: '捐赠教材/教具、免费公益课，面向青少年/弱势群体' },
  { title: '公益赛事', desc: '公益主题AI赛事，提升品牌影响力' },
  { title: '公益打卡', desc: '用户参与打卡，平台捐赠公益基金' },
  { title: '公益成果展示', desc: '强化品牌公信力，带动潜在C端消费' },
]

export default function Charity() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-bingo-dark mb-2">荣誉与公益</h1>
      <p className="text-slate-600 mb-6">荣誉展示与报道、公益项目列表 → 项目详情 → 参与入口 → 成果展示。公益课、公益赛事、教具捐赠（分享无佣金，仅增加公益积分）；报名/打卡捐赠、受助案例与数据；机构/企业公益合作申请入口</p>

      {/* 滚动报道：近期热点、行业动态、缤果荣誉 */}
      <section className="mb-8">
        <h2 className="section-title mb-4">近期报道</h2>
        <div className="card overflow-hidden">
          <ul className="divide-y divide-slate-100">
            {REPORT_ITEMS.map((r, i) => (
              <li key={i} className="px-4 py-3 flex flex-wrap items-center gap-2 hover:bg-slate-50 transition">
                <span className={`text-xs px-2 py-0.5 rounded ${
                  r.type === '荣誉' ? 'bg-amber-100 text-amber-800' : r.type === '热点' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {r.type}
                </span>
                <span className="text-slate-700 text-sm flex-1">{r.text}</span>
                <span className="text-slate-400 text-xs">{r.date}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <h2 className="section-title">公益项目</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {items.map((item, i) => (
            <div key={i} className="card p-6">
              <h3 className="font-semibold text-primary">{item.title}</h3>
              <p className="text-sm text-slate-600 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
