import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { computeTotalSales } from '../../utils/franchisePartnerStorage'
import { useFranchiseWorkspace } from './useFranchiseWorkspace'

function fmtDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function ledgerRowMeta(type) {
  if (type === 'topup') return { tag: '充值', tagClass: 'bg-emerald-100 text-emerald-800' }
  if (type === 'recharge_course') return { tag: '充课', tagClass: 'bg-sky-100 text-sky-800' }
  if (type === 'material_purchase') return { tag: '教具', tagClass: 'bg-amber-100 text-amber-900' }
  return { tag: '其他', tagClass: 'bg-slate-100 text-slate-700' }
}

/** 近 6 个月：按月收入柱状图（已完成充课实付） */
function BarChartMini({ data }) {
  if (!data.length) {
    return <p className="text-sm text-slate-400 py-8 text-center">暂无数据</p>
  }
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <div className="flex items-end gap-1.5 sm:gap-2 h-44 px-1 pt-4 min-h-[11rem]">
      {data.map((d) => (
        <div key={d.key} className="flex-1 flex flex-col items-center justify-end h-full min-w-0">
          <div
            className="w-full max-w-[40px] sm:max-w-[48px] mx-auto rounded-t-md bg-[#3B66FF]/80 hover:bg-[#3B66FF] transition-opacity relative group"
            style={{ height: `${Math.max(6, (d.value / max) * 100)}%`, minHeight: d.value > 0 ? 6 : 3 }}
          >
            <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-slate-500 opacity-0 group-hover:opacity-100 whitespace-nowrap tabular-nums z-10">
              ¥{d.value.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] text-slate-400 mt-2 text-center truncate w-full">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

/** 近 30 日收入：SVG 平滑曲线（已完成充课实付） */
function LineChartMini({ data }) {
  const W = 800
  const H = 240
  const padL = 44
  const padR = 16
  const padT = 28
  const padB = 40
  const innerW = W - padL - padR
  const innerH = H - padT - padB
  const max = data.length ? Math.max(...data.map((d) => d.value), 1) : 1
  const n = data.length
  if (!data.length) {
    return <p className="text-sm text-slate-400 py-8 text-center">暂无近30日订单数据</p>
  }
  const points = data.map((d, i) => ({
    x: padL + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW),
    y: padT + innerH - (d.value / max) * innerH,
    label: d.label,
    value: d.value,
  }))

  let lineD = ''
  if (points.length >= 2) {
    lineD = `M ${points[0].x} ${points[0].y}`
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i]
      const p1 = points[i + 1]
      const dx = (p1.x - p0.x) / 3
      lineD += ` C ${p0.x + dx} ${p0.y}, ${p1.x - dx} ${p1.y}, ${p1.x} ${p1.y}`
    }
  } else if (points.length === 1) {
    lineD = `M ${points[0].x} ${points[0].y}`
  }

  const baseline = padT + innerH
  let areaD = ''
  if (points.length >= 2) {
    areaD = `M ${points[0].x} ${baseline} L ${points[0].x} ${points[0].y}`
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i]
      const p1 = points[i + 1]
      const dx = (p1.x - p0.x) / 3
      areaD += ` C ${p0.x + dx} ${p0.y}, ${p1.x - dx} ${p1.y}, ${p1.x} ${p1.y}`
    }
    areaD += ` L ${points[points.length - 1].x} ${baseline} Z`
  }

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[640px] h-[220px] sm:h-[240px]" role="img" aria-label="近30日收入曲线">
        <defs>
          <linearGradient id="financeLineFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(5 150 105)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="rgb(5 150 105)" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = padT + innerH * (1 - t)
          return (
            <line key={`grid-${t}`} x1={padL} y1={y} x2={W - padR} y2={y} stroke="rgb(226 232 240)" strokeWidth="1" />
          )
        })}
        {areaD ? <path d={areaD} fill="url(#financeLineFill)" /> : null}
        {lineD ? (
          <path
            d={lineD}
            fill="none"
            stroke="rgb(5 150 105)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}
        {points.map((p, i) => (
          <g key={p.label + i}>
            <circle cx={p.x} cy={p.y} r="4" fill="white" stroke="rgb(5 150 105)" strokeWidth="2" />
            <title>{`${p.label}  ¥${p.value.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}`}</title>
          </g>
        ))}
        {points.map((p, i) =>
          i % 5 === 0 || i === n - 1 ? (
            <text
              key={`t-${p.label}-${i}`}
              x={p.x}
              y={H - 10}
              textAnchor="middle"
              fill="#94a3b8"
              style={{ fontSize: '11px' }}
            >
              {p.label}
            </text>
          ) : null
        )}
      </svg>
    </div>
  )
}

export default function FranchisePartnerFinance() {
  const { session, ws } = useFranchiseWorkspace()
  const [ledgerType, setLedgerType] = useState('')

  const totalSales = computeTotalSales(ws)

  const filteredLedger = useMemo(() => {
    if (!ws?.ledger) return []
    const base = ws.ledger.filter((l) => l.type !== 'withdraw_apply')
    if (!ledgerType) return base
    return base.filter((l) => l.type === ledgerType)
  }, [ws, ledgerType])

  const last30DaysSeries = useMemo(() => {
    if (!ws?.orders) return []
    const days = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date()
      d.setHours(0, 0, 0, 0)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      days.push({
        key,
        label: `${d.getMonth() + 1}/${d.getDate()}`,
        value: 0,
      })
    }
    for (const o of ws.orders) {
      if (o.status !== '已完成') continue
      const k = (o.createdAt || '').slice(0, 10)
      const row = days.find((x) => x.key === k)
      if (row) row.value += Number(o.payAmount) || 0
    }
    return days
  }, [ws])

  const last6MonthsSeries = useMemo(() => {
    if (!ws?.orders) return []
    const now = new Date()
    const months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: `${d.getMonth() + 1}月`,
        value: 0,
      })
    }
    for (const o of ws.orders) {
      if (o.status !== '已完成') continue
      const dt = new Date(o.createdAt)
      const k = `${dt.getFullYear()}-${dt.getMonth()}`
      const row = months.find((m) => m.key === k)
      if (row) row.value += Number(o.payAmount) || 0
    }
    return months
  }, [ws])

  if (!ws || !session) return <p className="text-slate-500 text-sm">加载中…</p>

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-[10px] border border-slate-200 bg-white p-7 shadow-sm border-l-4 border-l-[#3B66FF]">
          <span className="text-[13px] text-slate-500 block mb-2">总销售额</span>
          <p className="text-3xl font-bold text-slate-900 tabular-nums tracking-tight">
            ¥{totalSales.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="rounded-[10px] border border-slate-200 bg-white p-7 shadow-sm border-l-4 border-l-emerald-500">
          <span className="text-[13px] text-slate-500 block mb-2">当前账户余额</span>
          <p className="text-3xl font-bold text-emerald-600 tabular-nums tracking-tight">¥{ws.balance.toFixed(2)}</p>
          <Link
            to="/franchise-partner/balance"
            className="inline-flex items-center justify-center mt-4 px-4 py-2.5 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 border border-emerald-700/40 shadow-sm shadow-emerald-900/10 transition-colors"
          >
            去充值
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col min-h-0">
          <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 border-b border-slate-100 shrink-0">
            <h2 className="text-[15px] font-semibold text-slate-900">近30日收入趋势</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-medium whitespace-nowrap">
              近30天 · 已完成充课
            </span>
          </div>
          <div className="px-5 py-4 flex-1 min-h-0 overflow-x-auto">
            <LineChartMini data={last30DaysSeries} />
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col min-h-0">
          <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 border-b border-slate-100 shrink-0">
            <h2 className="text-[15px] font-semibold text-slate-900">近6个月收入</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 font-medium whitespace-nowrap">
              按月 · 已完成充课
            </span>
          </div>
          <div className="px-5 py-4 flex-1 min-h-0">
            <BarChartMini data={last6MonthsSeries} />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-[15px] font-semibold text-slate-900">资金明细</h2>
            <p className="text-xs text-slate-400 mt-1">含总部账户充值、学员充课扣款、教具采购等流水</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <label className="sr-only" htmlFor="finance-ledger-type">
              流水类型
            </label>
            <select
              id="finance-ledger-type"
              value={ledgerType}
              onChange={(e) => setLedgerType(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 min-w-[8.5rem] focus:outline-none focus:border-[#3B66FF] focus:ring-2 focus:ring-[#3B66FF]/15"
            >
              <option value="">全部类型</option>
              <option value="topup">充值</option>
              <option value="recharge_course">充课</option>
              <option value="material_purchase">教具采购</option>
            </select>
            {ledgerType ? (
              <button
                type="button"
                onClick={() => setLedgerType('')}
                className="px-6 py-2.5 rounded-lg text-sm font-semibold min-h-[42px] min-w-[5.5rem] border-2 border-emerald-600 text-emerald-600 bg-white hover:bg-emerald-50 active:bg-emerald-100 shadow-sm transition-colors"
              >
                重置
              </button>
            ) : null}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[560px]">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">日期</th>
                <th className="px-5 py-3 font-medium">描述</th>
                <th className="px-5 py-3 font-medium">金额</th>
                <th className="px-5 py-3 font-medium">类型</th>
              </tr>
            </thead>
            <tbody>
              {filteredLedger.map((l) => {
                const meta = ledgerRowMeta(l.type)
                const pos = l.amount >= 0
                return (
                  <tr key={l.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                    <td className="px-5 py-3 text-slate-600 whitespace-nowrap">{fmtDate(l.createdAt)}</td>
                    <td className="px-5 py-3 text-slate-800">{l.title}</td>
                    <td className={'px-5 py-3 font-semibold tabular-nums ' + (pos ? 'text-emerald-600' : 'text-red-600')}>
                      {pos ? '+' : ''}
                      {l.amount.toFixed(2)}
                    </td>
                    <td className="px-5 py-3">
                      <span className={'text-xs px-2.5 py-0.5 rounded-full font-medium ' + meta.tagClass}>{meta.tag}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
