import { useCallback, useEffect, useMemo, useState } from 'react'
import { getWorkspace } from '../../utils/franchisePartnerStorage'
import { FlatIconBookClass, FlatIconCoins, FlatIconUsers } from '../franchise-portal/FranchiseFlatIcons'
import {
  getInstitutionHqTreasury,
  listInstitutionCampuses,
  openCampusFranchisePartnerInNewTab,
} from '../../utils/institutionHqStorage'
import InstitutionHqCampusAllocateModal from './InstitutionHqCampusAllocateModal'

function fmtMoney(n) {
  return typeof n === 'number' ? n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'
}

export default function InstitutionHqDashboard() {
  const [busyId, setBusyId] = useState(null)
  const [allocateCampus, setAllocateCampus] = useState(null)
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
    void tick
    return campuses.map((c) => {
      let ws = null
      try {
        ws = getWorkspace(c.partnerId, c.refCode)
      } catch {
        ws = null
      }
      const students = ws?.students?.length ?? 0
      const classes = ws?.classes?.length ?? 0
      const campusBalance = typeof ws?.balance === 'number' && Number.isFinite(ws.balance) ? ws.balance : null
      return { campus: c, students, classes, campusBalance }
    })
  }, [campuses, tick])

  const totalStudents = useMemo(() => rows.reduce((s, r) => s + r.students, 0), [rows])
  const totalClasses = useMemo(() => rows.reduce((s, r) => s + r.classes, 0), [rows])

  const kpiCards = useMemo(
    () => [
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
        label: '班级数（全机构）',
        value: String(totalClasses),
        sub: `${campuses.length} 个校区`,
        subClass: 'text-slate-500',
        Icon: FlatIconBookClass,
        iconBox: 'bg-emerald-500/12 text-emerald-600',
        bg: 'bg-gradient-to-br from-emerald-50 to-white border-emerald-100',
      },
      {
        label: '在读学员数（全机构）',
        value: String(totalStudents),
        sub: '各校区学员合计',
        subClass: 'text-slate-500',
        Icon: FlatIconUsers,
        iconBox: 'bg-violet-500/12 text-violet-600',
        bg: 'bg-gradient-to-br from-violet-50 to-white border-violet-100',
      },
    ],
    [hqTreasury.balance, totalStudents, totalClasses, campuses.length],
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
        <h2 className="text-base font-bold text-slate-900 mb-4">机构概览</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
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
          {rows.map(({ campus, students, classes, campusBalance }) => (
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
                <div className="flex flex-wrap items-center justify-end shrink-0">
                  <button
                    type="button"
                    disabled={busyId === campus.id}
                    onClick={() => openCampus(campus)}
                    className="shrink-0 rounded-xl bg-primary hover:bg-primary-600 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2.5 shadow-sm transition"
                  >
                    {busyId === campus.id ? '打开中…' : '进入校区管理'}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="rounded-xl bg-slate-50 border border-slate-100 py-3">
                  <p className="text-[10px] text-slate-500">学员</p>
                  <p className="text-sm font-bold text-slate-900 mt-1 tabular-nums">{students}</p>
                </div>
                <div className="rounded-xl bg-slate-50 border border-slate-100 py-3">
                  <p className="text-[10px] text-slate-500">班级</p>
                  <p className="text-sm font-bold text-slate-900 mt-1 tabular-nums">{classes}</p>
                </div>
              </div>
              <div className="rounded-xl bg-slate-50/80 border border-slate-100 px-3 py-2.5 flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-[11px] text-slate-600">
                <span>校区账户余额</span>
                <span className="inline-flex flex-wrap items-baseline justify-end gap-x-1.5 gap-y-0.5 tabular-nums">
                  <span className="font-semibold text-slate-900">
                    {campusBalance != null ? `¥${fmtMoney(campusBalance)}` : '—'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAllocateCampus(campus)}
                    className="text-[11px] font-semibold text-primary hover:underline bg-transparent border-0 p-0 m-0 cursor-pointer shadow-none shrink-0"
                  >
                    拨款
                  </button>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <InstitutionHqCampusAllocateModal
        open={Boolean(allocateCampus)}
        campus={allocateCampus}
        treasuryBalance={hqTreasury.balance}
        onClose={() => setAllocateCampus(null)}
        onSuccess={() => refreshTreasury()}
      />
    </div>
  )
}
