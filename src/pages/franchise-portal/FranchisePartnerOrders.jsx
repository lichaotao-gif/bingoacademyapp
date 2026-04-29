import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { computeTotalSales, FRANCHISE_PROMOTABLE_COURSES } from '../../utils/franchisePartnerStorage'
import { useFranchiseWorkspace } from './useFranchiseWorkspace'

function fmtDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function dayKey(iso) {
  if (!iso) return ''
  return iso.slice(0, 10)
}

export default function FranchisePartnerOrders() {
  const { session, ws } = useFranchiseWorkspace()
  const [filterName, setFilterName] = useState('')
  const [filterCourse, setFilterCourse] = useState('')
  const [filterDate, setFilterDate] = useState('')

  const filteredOrders = useMemo(() => {
    if (!ws?.orders) return []
    const nameQ = filterName.trim().toLowerCase()
    return ws.orders.filter((o) => {
      if (nameQ && !String(o.studentName || '').toLowerCase().includes(nameQ)) return false
      if (filterCourse && o.courseName !== filterCourse) return false
      if (filterDate && dayKey(o.createdAt) !== filterDate) return false
      return true
    })
  }, [ws, filterName, filterCourse, filterDate])

  if (!ws || !session) return <p className="text-slate-500 text-sm">加载中…</p>

  const totalSales = computeTotalSales(ws)
  const completed = ws.orders.filter((o) => o.status === '已完成').length
  const processing = ws.orders.filter((o) => o.status === '处理中').length

  const applyFilter = () => {}

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-500">
        支持按学员、课程、日期筛选。扣款规则见
        <Link to="/franchise-partner/discounts" className="text-[#3B66FF] hover:underline mx-0.5">
          专属折扣
        </Link>
        。
      </p>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">订单笔数</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{ws.orders.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">已完成销售额（元）</p>
          <p className="text-2xl font-bold text-[#3B66FF] mt-1 tabular-nums">{totalSales.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-500">状态分布</p>
          <p className="text-sm font-medium text-slate-800 mt-2">
            已完成 {completed} 笔 · 处理中 {processing} 笔
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2.5 items-center">
        <input
          type="text"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          placeholder="搜索学员姓名…"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm w-44 sm:w-52 focus:outline-none focus:border-[#3B66FF] focus:ring-2 focus:ring-[#3B66FF]/15"
        />
        <select
          value={filterCourse}
          onChange={(e) => setFilterCourse(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm min-w-[10rem] focus:outline-none focus:border-[#3B66FF]"
        >
          <option value="">全部课程</option>
          {FRANCHISE_PROMOTABLE_COURSES.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:border-[#3B66FF]"
        />
        <button
          type="button"
          onClick={applyFilter}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#3B66FF] hover:bg-[#2f56e6] text-white min-h-[42px]"
        >
          筛选
        </button>
        {(filterName || filterCourse || filterDate) && (
          <button
            type="button"
            onClick={() => {
              setFilterName('')
              setFilterCourse('')
              setFilterDate('')
            }}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-semibold bg-slate-700 text-white hover:bg-slate-800 active:bg-slate-900 min-h-[42px]"
          >
            重置
          </button>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-[15px] font-semibold text-slate-900">订单记录</h2>
          <span className="text-xs text-slate-400">共 {filteredOrders.length} 条</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[800px]">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">订单号</th>
                <th className="px-5 py-3 font-medium">学员</th>
                <th className="px-5 py-3 font-medium">课程</th>
                <th className="px-5 py-3 font-medium">原价</th>
                <th className="px-5 py-3 font-medium">折扣</th>
                <th className="px-5 py-3 font-medium">实付扣款</th>
                <th className="px-5 py-3 font-medium">时间</th>
                <th className="px-5 py-3 font-medium">状态</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o) => (
                <tr key={o.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                  <td className="px-5 py-3 font-mono text-slate-600">{o.id}</td>
                  <td className="px-5 py-3 font-semibold text-slate-900">{o.studentName}</td>
                  <td className="px-5 py-3 text-slate-700 max-w-[14rem] truncate">{o.courseName}</td>
                  <td className="px-5 py-3 text-slate-600 tabular-nums">¥{Number(o.originalPrice).toFixed(2)}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex text-xs font-medium px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      {o.discountLabel}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-semibold text-[#3B66FF] tabular-nums">¥{Number(o.payAmount).toFixed(2)}</td>
                  <td className="px-5 py-3 text-slate-600 whitespace-nowrap">{fmtDate(o.createdAt)}</td>
                  <td className="px-5 py-3">
                    <span
                      className={
                        'text-xs px-2.5 py-0.5 rounded-full font-medium ' +
                        (o.status === '已完成' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800')
                      }
                    >
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
