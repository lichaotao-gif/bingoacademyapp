import { useCallback, useEffect, useMemo, useState } from 'react'
import { computeTotalSales, getWorkspace } from '../../utils/franchisePartnerStorage'
import {
  FlatIconChartBar,
  FlatIconCoins,
  FlatIconTrendingUp,
  FlatIconUsers,
  FlatIconWallet,
} from '../franchise-portal/FranchiseFlatIcons'
import {
  getInstitutionHqTreasury,
  institutionHqDemoRechargeTopUp,
  listInstitutionCampuses,
  openCampusFranchisePartnerInNewTab,
} from '../../utils/institutionHqStorage'

function fmtMoney(n) {
  return typeof n === 'number' && Number.isFinite(n)
    ? n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '—'
}

function fmtDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function hqLedgerRowMeta(type) {
  if (type === 'hq_topup') return { tag: '总账充值', tagClass: 'bg-emerald-100 text-emerald-800' }
  if (type === 'hq_allocate_campus') return { tag: '开业划拨', tagClass: 'bg-cyan-100 text-cyan-900' }
  if (type === 'hq_refund_campus') return { tag: '划拨退回', tagClass: 'bg-sky-100 text-sky-800' }
  return { tag: '其他', tagClass: 'bg-slate-100 text-slate-700' }
}

/** 近 6 个月：按月收入柱状图（全机构已完成充课实付） */
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
            className="w-full max-w-[40px] sm:max-w-[48px] mx-auto rounded-t-md bg-primary/80 hover:bg-primary transition-opacity relative group"
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

/** 近 30 日收入：SVG 平滑曲线（全机构已完成充课实付） */
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
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full min-w-[640px] h-[220px] sm:h-[240px]" role="img" aria-label="近30日全机构收入曲线">
        <defs>
          <linearGradient id="hqFinanceLineFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(8 145 178)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="rgb(8 145 178)" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = padT + innerH * (1 - t)
          return (
            <line key={`grid-${t}`} x1={padL} y1={y} x2={W - padR} y2={y} stroke="rgb(226 232 240)" strokeWidth="1" />
          )
        })}
        {areaD ? <path d={areaD} fill="url(#hqFinanceLineFill)" /> : null}
        {lineD ? (
          <path
            d={lineD}
            fill="none"
            stroke="rgb(8 145 178)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}
        {points.map((p, i) => (
          <g key={p.label + i}>
            <circle cx={p.x} cy={p.y} r="4" fill="white" stroke="rgb(8 145 178)" strokeWidth="2" />
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
          ) : null,
        )}
      </svg>
    </div>
  )
}

function IconKpiTile({ icon: Icon, label, value, sub, tone }) {
  const toneRing = {
    cyan: 'ring-cyan-200/80 bg-gradient-to-br from-cyan-50/90 to-white',
    emerald: 'ring-emerald-200/80 bg-gradient-to-br from-emerald-50/80 to-white',
    sky: 'ring-sky-200/70 bg-gradient-to-br from-sky-50/70 to-white',
    amber: 'ring-amber-200/70 bg-gradient-to-br from-amber-50/60 to-white',
  }[tone] || 'ring-slate-200/80 bg-white'

  return (
    <div className={`rounded-xl border border-slate-200/90 p-4 shadow-sm ring-1 ${toneRing} flex gap-3 min-h-[5.5rem]`}>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/90 text-primary shadow-sm ring-1 ring-slate-200/60">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-medium text-slate-500">{label}</p>
        <p className="mt-0.5 text-lg font-bold tabular-nums text-slate-900 tracking-tight">{value}</p>
        {sub ? <p className="mt-0.5 text-[11px] text-slate-400 leading-snug">{sub}</p> : null}
      </div>
    </div>
  )
}

export default function InstitutionHqFinance() {
  const [tick, setTick] = useState(0)
  const [busyId, setBusyId] = useState(null)
  const [topUpOpen, setTopUpOpen] = useState(false)
  const [topUpAmount, setTopUpAmount] = useState('')
  const [topUpRemark, setTopUpRemark] = useState('')
  const [topUpErr, setTopUpErr] = useState('')
  const [ledgerType, setLedgerType] = useState('')

  const refresh = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    const onTreasury = () => refresh()
    window.addEventListener('institution-hq-treasury-changed', onTreasury)
    return () => window.removeEventListener('institution-hq-treasury-changed', onTreasury)
  }, [refresh])

  const campuses = useMemo(() => {
    void tick
    return listInstitutionCampuses()
  }, [tick])

  const treasury = useMemo(() => {
    void tick
    return getInstitutionHqTreasury()
  }, [tick])

  const rows = useMemo(() => {
    return campuses.map((c) => {
      let ws = null
      try {
        ws = getWorkspace(c.partnerId, c.refCode)
      } catch {
        ws = null
      }
      const sales = ws ? computeTotalSales(ws) : 0
      const orders = ws?.orders?.length ?? 0
      const completed = ws?.orders?.filter((o) => o.status === '已完成').length ?? 0
      const campusBalance = typeof ws?.balance === 'number' ? ws.balance : null
      const allocated = !c.isSeed ? Number(c.openingBalanceAllocated) || 0 : null
      return { campus: c, sales, orders, completed, campusBalance, allocated }
    })
  }, [campuses, tick])

  const total = useMemo(() => rows.reduce((s, r) => s + r.sales, 0), [rows])

  const hqOrders = useMemo(() => {
    const list = []
    for (const c of campuses) {
      try {
        const ws = getWorkspace(c.partnerId, c.refCode)
        if (ws?.orders?.length) list.push(...ws.orders)
      } catch {
        /* ignore */
      }
    }
    return list
  }, [campuses, tick])

  const last30DaysSeries = useMemo(() => {
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
    for (const o of hqOrders) {
      if (o.status !== '已完成') continue
      const k = (o.createdAt || '').slice(0, 10)
      const row = days.find((x) => x.key === k)
      if (row) row.value += Number(o.payAmount) || 0
    }
    return days
  }, [hqOrders])

  const last6MonthsSeries = useMemo(() => {
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
    for (const o of hqOrders) {
      if (o.status !== '已完成') continue
      const dt = new Date(o.createdAt)
      const k = `${dt.getFullYear()}-${dt.getMonth()}`
      const row = months.find((m) => m.key === k)
      if (row) row.value += Number(o.payAmount) || 0
    }
    return months
  }, [hqOrders])

  const totalAllocated = useMemo(
    () => rows.reduce((s, r) => s + (r.allocated != null ? r.allocated : 0), 0),
    [rows],
  )
  const totalCampusWallets = useMemo(
    () => rows.reduce((s, r) => s + (r.campusBalance != null ? r.campusBalance : 0), 0),
    [rows],
  )
  const ledgerCount = (treasury.ledger || []).length

  const filteredLedger = useMemo(() => {
    const base = treasury.ledger || []
    if (!ledgerType) return base
    return base.filter((l) => l.type === ledgerType)
  }, [treasury.ledger, ledgerType])

  const openTopUpModal = () => {
    setTopUpErr('')
    setTopUpAmount('')
    setTopUpRemark('')
    setTopUpOpen(true)
  }

  const closeTopUpModal = () => {
    setTopUpOpen(false)
    setTopUpErr('')
  }

  const submitTopUp = (e) => {
    e.preventDefault()
    setTopUpErr('')
    const n = Number.parseFloat(String(topUpAmount).replace(/,/g, ''))
    const r = institutionHqDemoRechargeTopUp(n, topUpRemark)
    if (!r.ok) {
      setTopUpErr(r.msg || '充值失败')
      return
    }
    setTopUpAmount('')
    setTopUpRemark('')
    refresh()
    closeTopUpModal()
  }

  const openCampus = (c) => {
    setBusyId(c.id)
    try {
      openCampusFranchisePartnerInNewTab(c)
    } finally {
      window.setTimeout(() => setBusyId(null), 400)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="relative overflow-hidden rounded-[10px] border border-slate-200 bg-white p-7 shadow-sm border-l-4 border-l-primary">
          <div className="pointer-events-none absolute -right-2 -top-2 opacity-[0.12] text-primary">
            <FlatIconTrendingUp className="h-24 w-24" />
          </div>
          <span className="text-[13px] text-slate-500 block mb-2">全机构累计营收</span>
          <p className="text-3xl font-bold text-slate-900 tabular-nums tracking-tight relative z-[1]">
            ¥{fmtMoney(total)}
          </p>
          <p className="mt-3 text-xs text-slate-400 leading-relaxed max-w-md relative z-[1]">
            各校区加盟商工作台内「已完成充课」订单实付累计（演示）。
          </p>
        </div>
        <div className="relative overflow-hidden rounded-[10px] border border-slate-200 bg-white p-7 shadow-sm border-l-4 border-l-emerald-500">
          <div className="pointer-events-none absolute -right-1 -top-1 opacity-[0.11] text-emerald-600">
            <FlatIconWallet className="h-24 w-24" />
          </div>
          <span className="text-[13px] text-slate-500 block mb-2">机构总账户余额</span>
          <p className="text-3xl font-bold text-emerald-600 tabular-nums tracking-tight relative z-[1]">
            ¥{fmtMoney(treasury.balance)}
          </p>
          <p className="mt-2 text-xs text-slate-500 leading-relaxed max-w-md relative z-[1]">
            向总账户充值后，可在「校区账号」开设新校区时从本余额划拨开业额度至各校区工作台。
          </p>
          <button
            type="button"
            onClick={openTopUpModal}
            className="relative z-[1] inline-flex items-center justify-center mt-4 px-4 py-2.5 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 border border-emerald-700/40 shadow-sm shadow-emerald-900/10 transition-colors"
          >
            充值
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <IconKpiTile
          icon={FlatIconUsers}
          label="管理校区"
          value={`${rows.length} 个`}
          sub="已接入财务汇总的校区数"
          tone="cyan"
        />
        <IconKpiTile
          icon={FlatIconCoins}
          label="累计开业划拨"
          value={`¥${fmtMoney(totalAllocated)}`}
          sub="从机构总账扣至各校区的开业额度"
          tone="amber"
        />
        <IconKpiTile
          icon={FlatIconWallet}
          label="校区账户余额合计"
          value={`¥${fmtMoney(totalCampusWallets)}`}
          sub="各校加盟商工作台当前余额之和"
          tone="emerald"
        />
        <IconKpiTile
          icon={FlatIconChartBar}
          label="总账流水"
          value={`${ledgerCount} 笔`}
          sub="机构总账户资金变动记录条数"
          tone="sky"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col min-h-0">
          <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 border-b border-slate-100 shrink-0">
            <h2 className="text-[15px] font-semibold text-slate-900">近30日收入趋势</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-800 font-medium whitespace-nowrap">
              全机构 · 近30天 · 已完成充课
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
              全机构 · 按月 · 已完成充课
            </span>
          </div>
          <div className="px-5 py-4 flex-1 min-h-0">
            <BarChartMini data={last6MonthsSeries} />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-[15px] font-semibold text-slate-900">各校区财务一览</h2>
          <p className="text-xs text-slate-400 mt-1">开业划拨、校区余额与累计营收（演示数据）</p>
        </div>
        <table className="w-full text-sm text-left min-w-[780px]">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">校区</th>
              <th className="px-5 py-3 font-medium text-right">开业划拨</th>
              <th className="px-5 py-3 font-medium text-right">校区账户余额</th>
              <th className="px-5 py-3 font-medium text-right">累计营收</th>
              <th className="px-5 py-3 font-medium text-right">订单数</th>
              <th className="px-5 py-3 font-medium text-right">已完成</th>
              <th className="px-5 py-3 font-medium w-40">操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ campus, sales, orders, completed, campusBalance, allocated }) => (
              <tr key={campus.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                <td className="px-5 py-3 font-medium text-slate-900">{campus.campusName}</td>
                <td className="px-5 py-3 text-right tabular-nums text-slate-700">
                  {allocated != null ? `¥${fmtMoney(allocated)}` : '—'}
                </td>
                <td className="px-5 py-3 text-right tabular-nums font-medium text-slate-900">
                  {campusBalance != null ? `¥${fmtMoney(campusBalance)}` : '—'}
                </td>
                <td className="px-5 py-3 text-right tabular-nums font-semibold text-slate-900">¥{fmtMoney(sales)}</td>
                <td className="px-5 py-3 text-right tabular-nums text-slate-700">{orders}</td>
                <td className="px-5 py-3 text-right tabular-nums text-slate-700">{completed}</td>
                <td className="px-5 py-3">
                  <button
                    type="button"
                    disabled={busyId === campus.id}
                    onClick={() => openCampus(campus)}
                    className="text-primary font-semibold text-xs hover:underline disabled:opacity-50"
                  >
                    {busyId === campus.id ? '打开中…' : '进入校区'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-[15px] font-semibold text-slate-900">机构总账户流水</h2>
            <p className="text-xs text-slate-400 mt-1">总账充值、开业划拨至校区、删除校区退回等（演示）</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <label className="sr-only" htmlFor="hq-finance-ledger-type">
              流水类型
            </label>
            <select
              id="hq-finance-ledger-type"
              value={ledgerType}
              onChange={(e) => setLedgerType(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 min-w-[8.5rem] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            >
              <option value="">全部类型</option>
              <option value="hq_topup">总账充值</option>
              <option value="hq_allocate_campus">开业划拨</option>
              <option value="hq_refund_campus">划拨退回</option>
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
              {filteredLedger.slice(0, 80).map((l) => {
                const meta = hqLedgerRowMeta(l.type)
                const pos = l.amount >= 0
                return (
                  <tr key={l.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                    <td className="px-5 py-3 text-slate-600 whitespace-nowrap">{fmtDate(l.createdAt)}</td>
                    <td className="px-5 py-3 text-slate-800">{l.title}</td>
                    <td className={'px-5 py-3 font-semibold tabular-nums ' + (pos ? 'text-emerald-600' : 'text-red-600')}>
                      {pos ? '+' : ''}
                      {typeof l.amount === 'number' ? l.amount.toFixed(2) : l.amount}
                    </td>
                    <td className="px-5 py-3">
                      <span className={'text-xs px-2.5 py-0.5 rounded-full font-medium ' + meta.tagClass}>{meta.tag}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {!filteredLedger.length ? (
            <p className="py-10 text-center text-sm text-slate-400">暂无流水</p>
          ) : null}
        </div>
      </div>

      {topUpOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-[2px]"
          role="presentation"
          onClick={closeTopUpModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="hq-topup-title"
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3 min-w-0">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80">
                  <FlatIconWallet className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h2 id="hq-topup-title" className="text-lg font-bold text-slate-900">
                    机构总账户充值
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                    演示环境入账至机构总余额，正式环境可对接支付/财务中台。
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeTopUpModal}
                className="shrink-0 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="关闭"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="mt-4 text-sm tabular-nums text-slate-600">
              当前余额 <span className="font-semibold text-emerald-700">¥{fmtMoney(treasury.balance)}</span>
            </p>
            <form onSubmit={submitTopUp} className="mt-5 space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-slate-600 mb-1.5">充值金额（元）</label>
                <input
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  inputMode="decimal"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm tabular-nums focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                  placeholder="例如 10000"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-slate-600 mb-1.5">备注（选填）</label>
                <input
                  value={topUpRemark}
                  onChange={(e) => setTopUpRemark(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
                  placeholder="如：对公到账、活动补贴"
                  maxLength={80}
                />
              </div>
              {topUpErr ? <p className="text-sm text-rose-600">{topUpErr}</p> : null}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 min-w-[8rem] rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
                >
                  确认充值
                </button>
                <button
                  type="button"
                  onClick={closeTopUpModal}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
