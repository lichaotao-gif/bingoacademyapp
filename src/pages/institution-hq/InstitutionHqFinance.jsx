import { useCallback, useEffect, useMemo, useState } from 'react'
import { getWorkspace } from '../../utils/franchisePartnerStorage'
import {
  FlatIconChartBar,
  FlatIconCoins,
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

/** 与机构概览「首页四宫格」一致的扁平色块图标 + 浅色卡片底 */
function IconKpiTile({ icon: Icon, label, value, sub, tone }) {
  const toneCard = {
    cyan: 'border-cyan-100 bg-gradient-to-br from-cyan-50/90 to-white',
    emerald: 'border-emerald-100 bg-gradient-to-br from-emerald-50/90 to-white',
    sky: 'border-sky-100 bg-gradient-to-br from-sky-50/90 to-white',
    amber: 'border-amber-100 bg-gradient-to-br from-amber-50/90 to-white',
  }[tone] || 'border-slate-200 bg-white'

  const toneIconBox = {
    cyan: 'bg-cyan-500/12 text-cyan-600',
    emerald: 'bg-emerald-500/12 text-emerald-600',
    sky: 'bg-sky-500/12 text-sky-600',
    amber: 'bg-amber-500/12 text-amber-600',
  }[tone] || 'bg-slate-500/10 text-slate-600'

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${toneCard} flex items-start justify-between gap-3 min-h-[5.5rem]`}>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="mt-2 text-lg font-bold tabular-nums text-slate-900 tracking-tight">{value}</p>
        {sub ? <p className="mt-2 text-[11px] text-slate-500 leading-snug">{sub}</p> : null}
      </div>
      <div className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center ${toneIconBox}`} aria-hidden>
        <Icon className="h-5 w-5" />
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
      const students = ws?.students?.length ?? 0
      const classes = ws?.classes?.length ?? 0
      const campusBalance = typeof ws?.balance === 'number' ? ws.balance : null
      const allocated = !c.isSeed ? Number(c.openingBalanceAllocated) || 0 : null
      return { campus: c, students, classes, campusBalance, allocated }
    })
  }, [campuses, tick])

  const totalAllocated = useMemo(
    () => rows.reduce((s, r) => s + (r.allocated != null ? r.allocated : 0), 0),
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/90 to-white p-5 shadow-sm flex items-start justify-between gap-3 min-h-[5.5rem]">
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-xs font-medium text-slate-500">机构总账户余额</p>
            <p className="mt-2 text-lg font-bold tabular-nums text-emerald-700 tracking-tight">¥{fmtMoney(treasury.balance)}</p>
            <p className="mt-2 text-[11px] text-slate-500 leading-snug">充值入账后可划拨至新开校区</p>
            <button
              type="button"
              onClick={openTopUpModal}
              className="mt-2 text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              充值
            </button>
          </div>
          <div className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center bg-emerald-500/12 text-emerald-600" aria-hidden>
            <FlatIconWallet className="w-5 h-5" />
          </div>
        </div>
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
          icon={FlatIconChartBar}
          label="总账流水"
          value={`${ledgerCount} 笔`}
          sub="机构总账户资金变动记录条数"
          tone="sky"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-[15px] font-semibold text-slate-900">各校区财务一览</h2>
          <p className="text-xs text-slate-400 mt-1">开业划拨、校区账户余额与在读规模</p>
        </div>
        <table className="w-full text-sm text-left min-w-[640px]">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">校区</th>
              <th className="px-5 py-3 font-medium text-right">开业划拨</th>
              <th className="px-5 py-3 font-medium text-right">校区账户余额</th>
              <th className="px-5 py-3 font-medium text-right">学生数</th>
              <th className="px-5 py-3 font-medium text-right">班级数</th>
              <th className="px-5 py-3 font-medium w-40">操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ campus, students, classes, campusBalance, allocated }) => (
              <tr key={campus.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                <td className="px-5 py-3 font-medium text-slate-900">{campus.campusName}</td>
                <td className="px-5 py-3 text-right tabular-nums text-slate-700">
                  {allocated != null ? `¥${fmtMoney(allocated)}` : '—'}
                </td>
                <td className="px-5 py-3 text-right tabular-nums font-medium text-slate-900">
                  {campusBalance != null ? `¥${fmtMoney(campusBalance)}` : '—'}
                </td>
                <td className="px-5 py-3 text-right tabular-nums text-slate-700">{students}</td>
                <td className="px-5 py-3 text-right tabular-nums text-slate-700">{classes}</td>
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
            <p className="text-xs text-slate-400 mt-1">总账充值、开业划拨至校区、删除校区退回等</p>
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
                <div className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center bg-emerald-500/12 text-emerald-600" aria-hidden>
                  <FlatIconWallet className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h2 id="hq-topup-title" className="text-lg font-bold text-slate-900">
                    机构总账户充值
                  </h2>
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                    入账后计入机构总余额。后续可对接支付或财务中台。
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
