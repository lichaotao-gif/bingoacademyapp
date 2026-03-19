import { Link } from 'react-router-dom'

const POINTS_BALANCE = 1280
const EXCHANGE_ITEMS = [
  { id: 1, name: '满199减50优惠券', cost: 200, icon: '🎫' },
  { id: 2, name: 'AI教具兑换券', cost: 500, icon: '🛠️' },
  { id: 3, name: '赛事报名绿色通道', cost: 300, icon: '🏆' },
  { id: 4, name: '线下实训体验名额', cost: 800, icon: '🎓' },
]

export default function ProfilePoints() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/profile" className="text-slate-500 hover:text-primary text-sm">← 个人中心</Link>
        <span className="text-slate-300">/</span>
        <span className="text-bingo-dark font-medium">积分商城</span>
      </div>

      <div className="card p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200/60 mb-6">
        <p className="text-sm text-slate-600">我的缤果积分</p>
        <p className="text-3xl font-bold text-primary mt-1">{POINTS_BALANCE}</p>
        <p className="text-xs text-slate-500 mt-1">100积分=10元，可抵扣学费/兑换教具</p>
      </div>

      <h3 className="font-semibold text-bingo-dark mb-4">积分兑换</h3>
      <div className="grid sm:grid-cols-2 gap-4">
        {EXCHANGE_ITEMS.map(item => (
          <div key={item.id} className="card p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="font-medium text-bingo-dark">{item.name}</p>
                <p className="text-sm text-primary">{item.cost} 积分</p>
              </div>
            </div>
            <button type="button" className="btn-primary text-xs px-4 py-2">兑换</button>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-500 mt-6">积分通过课程购买、学习打卡、作业优秀、分享课程获得</p>
    </div>
  )
}
