import { Link, useLocation } from 'react-router-dom'

// 学材物资中心（归属 AI智能商城）
const subNav = [
  { path: '/mall', label: '智能商城' },
  { path: '/mall/materials', label: '学材物资中心' },
]
const tabs = [
  { key: 'book', name: '图书类', desc: '课程配套教材、竞赛备赛图书、AI通识、升学指导' },
  { key: 'tool', name: '教具类', desc: 'AI实验教具、编程教具、实验器材、学习文具' },
  { key: 'kit', name: '工具包类', desc: '编程工具包、赛事备赛工具包、课程配套工具包' },
]
export default function Materials() {
  const loc = useLocation()
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-bingo-dark">AI智能商城</h1>
        {subNav.map(({ path, label }) => (
          <Link
            key={path}
            to={path}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              loc.pathname === path ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>
      <h2 className="text-xl font-semibold text-bingo-dark mb-2">学材物资中心</h2>
      <p className="text-gray-600 mb-8">教材·教具·工具包一站式采购，分享可得 8%-12% 分佣</p>

      <section className="mb-8">
        <h2 className="section-title">物资分类</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {tabs.map((t) => (
            <div key={t.key} className="card p-6">
              <h3 className="font-semibold text-primary">{t.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{t.desc}</p>
              <p className="text-xs text-primary mt-3">加入购物车 · 立即购买 · 批量采购 · 部分教具可租赁</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-6 bg-indigo-50/50 border-primary/20">
        <h3 className="font-semibold text-primary">物资活动</h3>
        <p className="text-sm text-gray-600 mt-1">限时折扣、满减、组合优惠、积分兑换、教具以旧换新；分享专属活动（分享给好友查看可领优惠券，好友购买您得分佣）</p>
      </section>
    </div>
  )
}
