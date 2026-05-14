import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
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

export default function FranchisePartnerFinance() {
  const { session, ws } = useFranchiseWorkspace()
  const [ledgerType, setLedgerType] = useState('')

  const filteredLedger = useMemo(() => {
    if (!ws?.ledger) return []
    const base = ws.ledger.filter((l) => l.type !== 'withdraw_apply')
    if (!ledgerType) return base
    return base.filter((l) => l.type === ledgerType)
  }, [ws, ledgerType])

  if (!ws || !session) return <p className="text-slate-500 text-sm">加载中…</p>

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm border-l-4 border-l-emerald-500 px-5 py-5 sm:py-6">
        <span className="text-[13px] text-slate-500 block mb-2">当前账户余额</span>
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <p className="text-3xl font-bold text-emerald-600 tabular-nums tracking-tight min-w-0">¥{ws.balance.toFixed(2)}</p>
          <Link
            to="/franchise-partner/balance"
            className="inline-flex items-center justify-center shrink-0 px-4 py-2.5 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 border border-emerald-700/40 shadow-sm shadow-emerald-900/10 transition-colors"
          >
            去充值
          </Link>
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
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 min-w-[8.5rem] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
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
