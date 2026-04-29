import { Link } from 'react-router-dom'
import { FRANCHISE_PROMOTABLE_COURSES, getDiscountLabel, getDiscountRate } from '../../utils/franchisePartnerStorage'
import { useFranchiseWorkspace } from './useFranchiseWorkspace'

export default function FranchisePartnerDiscounts() {
  const { ws } = useFranchiseWorkspace()
  if (!ws) return <p className="text-slate-500 text-sm">加载中…</p>

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">
        各课程包的折扣由<strong className="font-medium text-slate-700">总部管理平台</strong>
        统一配置；加盟商端仅供查阅当前生效折扣，无法在后台修改。如需调整请联系专属客服。
      </p>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm text-left min-w-[520px]">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">课程包</th>
              <th className="px-5 py-3 font-medium">标价（元）</th>
              <th className="px-5 py-3 font-medium">专属折扣</th>
              <th className="px-5 py-3 font-medium">折后价（元）</th>
            </tr>
          </thead>
          <tbody>
            {FRANCHISE_PROMOTABLE_COURSES.map((c) => {
              const rate = getDiscountRate(ws, c.id)
              const label = getDiscountLabel(ws, c.id)
              const sale = Math.round(c.price * rate * 100) / 100
              return (
                <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                  <td className="px-5 py-3 font-semibold text-slate-900">{c.name}</td>
                  <td className="px-5 py-3 text-slate-600 tabular-nums">¥{c.price}</td>
                  <td className="px-5 py-3">
                    <span className="text-red-600 font-semibold">{label}</span>
                    <span className="text-slate-400 text-sm ml-2">（{Math.round(rate * 1000) / 10}% 价）</span>
                  </td>
                  <td className="px-5 py-3 font-semibold text-[#3B66FF] tabular-nums">¥{sale.toFixed(2)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-400">
        充课扣款时系统按上表自动匹配折扣，详见
        <Link to="/franchise-partner/recharge" className="text-[#3B66FF] hover:underline">
          充课中心
        </Link>
        。
      </p>
    </div>
  )
}
