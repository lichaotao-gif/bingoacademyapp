import { useState } from 'react'
import { appendDemoOrder, FRANCHISE_PROMOTABLE_COURSES } from '../../utils/franchisePartnerStorage'
import { useFranchiseWorkspace } from './useFranchiseWorkspace'

function fmtDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function FranchisePartnerOrders() {
  const { session, ws, refresh } = useFranchiseWorkspace()
  const [demoCourse, setDemoCourse] = useState(FRANCHISE_PROMOTABLE_COURSES[0]?.id || '')

  if (!ws || !session) return <p className="text-slate-500 text-sm">加载中…</p>

  const totalComm = ws.orders.reduce((s, o) => s + (o.commission || 0), 0)
  const settled = ws.orders.filter((o) => o.status === '已结算')

  const simulateOrder = () => {
    appendDemoOrder(session.partnerId, session.refCode, demoCourse)
    refresh()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-bingo-dark">订单收益</h1>
        <p className="text-sm text-slate-500 mt-1">推广带来的订单与分佣明细。下方可演示一笔入账（本地模拟）。</p>
      </div>

      <div className="flex flex-wrap gap-4 items-end card p-4 rounded-2xl border border-slate-200">
        <div>
          <p className="text-xs text-slate-500">模拟入账课程</p>
          <select
            value={demoCourse}
            onChange={(e) => setDemoCourse(e.target.value)}
            className="mt-1 rounded-xl border border-slate-200 px-3 py-2 text-sm min-w-[14rem]"
          >
            {FRANCHISE_PROMOTABLE_COURSES.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <button type="button" onClick={simulateOrder} className="btn-primary text-sm px-4 py-2 rounded-xl">
          演示：新增一笔已结算订单
        </button>
        <p className="text-xs text-slate-400 w-full sm:w-auto">仅用于演示余额与流水变化，非真实支付。</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card p-4 rounded-2xl border border-slate-200">
          <p className="text-xs text-slate-500">订单笔数</p>
          <p className="text-2xl font-bold text-bingo-dark mt-1">{ws.orders.length}</p>
        </div>
        <div className="card p-4 rounded-2xl border border-slate-200">
          <p className="text-xs text-slate-500">累计佣金</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">¥{totalComm.toFixed(2)}</p>
        </div>
        <div className="card p-4 rounded-2xl border border-slate-200">
          <p className="text-xs text-slate-500">已结算笔数</p>
          <p className="text-2xl font-bold text-bingo-dark mt-1">{settled.length}</p>
        </div>
      </div>

      <div className="overflow-x-auto card rounded-2xl border border-slate-200">
        <table className="w-full text-sm text-left min-w-[640px]">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">时间</th>
              <th className="px-4 py-3 font-medium">课程</th>
              <th className="px-4 py-3 font-medium">实付</th>
              <th className="px-4 py-3 font-medium">佣金</th>
              <th className="px-4 py-3 font-medium">买家</th>
              <th className="px-4 py-3 font-medium">状态</th>
            </tr>
          </thead>
          <tbody>
            {ws.orders.map((o) => (
              <tr key={o.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{fmtDate(o.createdAt)}</td>
                <td className="px-4 py-3 text-slate-800">{o.courseName}</td>
                <td className="px-4 py-3">¥{Number(o.payAmount).toFixed(2)}</td>
                <td className="px-4 py-3 text-emerald-600 font-medium">¥{Number(o.commission).toFixed(2)}</td>
                <td className="px-4 py-3 text-slate-500">{o.buyerMask}</td>
                <td className="px-4 py-3">
                  <span className={'text-xs px-2 py-0.5 rounded-full ' + (o.status === '已结算' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800')}>
                    {o.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
