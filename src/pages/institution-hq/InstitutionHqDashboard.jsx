import { useCallback, useEffect, useMemo, useState } from 'react'
import { computeMonthOrderCount, computeTotalSales, getWorkspace } from '../../utils/franchisePartnerStorage'
import {
  FlatIconChartBar,
  FlatIconCoins,
  FlatIconCreditCard,
  FlatIconUsers,
} from '../franchise-portal/FranchiseFlatIcons'
import {
  getInstitutionHqTreasury,
  listInstitutionCampuses,
  openCampusFranchisePartnerInNewTab,
} from '../../utils/institutionHqStorage'

function fmtMoney(n) {
  return typeof n === 'number' ? n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'
}

export default function InstitutionHqDashboard() {
  const [busyId, setBusyId] = useState(null)
  const [tick, setTick] = useState(0)
  const refreshTreasury = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    const onTreasury = () => refreshTreasury()
    window.addEventListener('institution-hq-treasury-changed', onTreasury)
    return () => window.removeEventListener('institution-hq-treasury-changed', onTreasury)
  }, [refreshTreasury])

  const campuses = useMemo(() => listInstitutionCampuses(), [])

  const hqTreasury = useMemo(() => {
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
      const monthOrders = ws ? computeMonthOrderCount(ws) : 0
      const students = ws?.students?.length ?? 0
      const classes = ws?.classes?.length ?? 0
      const campusBalance = typeof ws?.balance === 'number' && Number.isFinite(ws.balance) ? ws.balance : null
      const orderCount = ws?.orders?.length ?? 0
      return { campus: c, sales, monthOrders, students, classes, campusBalance, orderCount }
    })
  }, [campuses])

  const totalSales = useMemo(() => rows.reduce((s, r) => s + r.sales, 0), [rows])
  const totalStudents = useMemo(() => rows.reduce((s, r) => s + r.students, 0), [rows])
  const totalMonthOrders = useMemo(() => rows.reduce((s, r) => s + r.monthOrders, 0), [rows])
  const totalClasses = useMemo(() => rows.reduce((s, r) => s + r.classes, 0), [rows])
  const totalOrderRecords = useMemo(() => rows.reduce((s, r) => s + r.orderCount, 0), [rows])

  const kpiCards = useMemo(
    () => [
      {
        label: '全机构累计营收（元）',
        value: fmtMoney(totalSales),
        sub: '+18.6% 较上月',
        subClass: 'text-emerald-600',
        Icon: FlatIconCreditCard,
        iconBox: 'bg-sky-500/12 text-sky-600',
        bg: 'bg-gradient-to-br from-sky-50 to-white border-sky-100',
      },
      {
        label: '机构总账户余额（元）',
        value: fmtMoney(hqTreasury.balance),
        sub: '+12.3% 较上月',
        subClass: 'text-emerald-600',
        Icon: FlatIconCoins,
        iconBox: 'bg-amber-500/12 text-amber-600',
        bg: 'bg-gradient-to-br from-amber-50 to-white border-amber-100',
      },
      {
        label: '本月订单数（全机构）',
        value: String(totalMonthOrders),
        sub: `累计 ${totalOrderRecords} 笔`,
        subClass: 'text-slate-500',
        Icon: FlatIconChartBar,
        iconBox: 'bg-emerald-500/12 text-emerald-600',
        bg: 'bg-gradient-to-br from-emerald-50 to-white border-emerald-100',
      },
      {
        label: '在读学员数（全机构）',
        value: String(totalStudents),
        sub: `${totalClasses} 个班级`,
        subClass: 'text-slate-500',
        Icon: FlatIconUsers,
        iconBox: 'bg-violet-500/12 text-violet-600',
        bg: 'bg-gradient-to-br from-violet-50 to-white border-violet-100',
      },
    ],
    [totalSales, hqTreasury.balance, totalMonthOrders, totalOrderRecords, totalStudents, totalClasses],
  )

  const openCampus = (c) => {
    setBusyId(c.id)
    try {
      openCampusFranchisePartnerInNewTab(c)
    } finally {
      window.setTimeout(() => setBusyId(null), 400)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-base font-bold text-slate-900">机构概览</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed max-w-2xl">
          配色与布局与「加盟商工作台 · 首页概览」四宫格 KPI 一致（扁平浅色底 + 角标色块图标）；下方为各校明细。
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpiCards.map((k) => {
            const KpiIcon = k.Icon
            return (
              <div key={k.label} className={`rounded-2xl border p-5 shadow-sm ${k.bg}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-slate-500 font-medium">{k.label}</p>
                    <p className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">{k.value}</p>
                    <p className={`text-xs mt-2 font-medium ${k.subClass}`}>{k.sub}</p>
                  </div>
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${k.iconBox}`}
                    aria-hidden
                  >
                    <KpiIcon className="w-5 h-5" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div>
        <h2 className="text-base font-bold text-slate-900 mb-3">校区列表</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {rows.map(({ campus, sales, monthOrders, students, classes, campusBalance }) => (
            <div
              key={campus.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col gap-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 truncate" title={campus.campusName}>
                    {campus.campusName}
                  </p>
                  {campus.region ? (
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate" title={campus.region}>
                      {campus.region}
                    </p>
                  ) : null}
                  <p className="text-[11px] text-slate-500 mt-1 tabular-nums">
                    管理员手机 {String(campus.adminPhone || '').replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2')}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={busyId === campus.id}
                  onClick={() => openCampus(campus)}
                  className="shrink-0 rounded-xl bg-primary hover:bg-primary-600 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2.5 shadow-sm transition"
                >
                  {busyId === campus.id ? '打开中…' : '进入校区管理'}
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="rounded-xl bg-slate-50 border border-slate-100 py-3">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">累计营收</p>
                  <p className="text-sm font-bold text-slate-900 mt-1 tabular-nums">¥{fmtMoney(sales)}</p>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-100 py-3">
                  <p className="text-[10px] text-slate-500">本月订单</p>
                  <p className="text-sm font-bold text-slate-900 mt-1 tabular-nums">{monthOrders}</p>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-100 py-3">
                  <p className="text-[10px] text-slate-500">学员</p>
                  <p className="text-sm font-bold text-slate-900 mt-1 tabular-nums">{students}</p>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-100 py-3">
                  <p className="text-[10px] text-slate-500">班级</p>
                  <p className="text-sm font-bold text-slate-900 mt-1 tabular-nums">{classes}</p>
                </div>
              </div>
              <div className="rounded-xl bg-slate-50/80 border border-slate-100 px-3 py-2.5 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600">
                <span>校区账户余额（演示）</span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {campusBalance != null ? `¥${fmtMoney(campusBalance)}` : '—'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
