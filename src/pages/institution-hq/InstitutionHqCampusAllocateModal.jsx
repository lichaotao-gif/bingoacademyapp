import { useEffect, useMemo, useState } from 'react'
import { institutionHqAllocateFundsToCampus } from '../../utils/institutionHqStorage'

function fmtMoney(n) {
  return typeof n === 'number' && Number.isFinite(n)
    ? n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '—'
}

function parseAmountInput(raw) {
  const s = String(raw ?? '')
    .trim()
    .replace(/,/g, '')
  if (!s) return 0
  const n = Number.parseFloat(s)
  if (!Number.isFinite(n) || n < 0) return NaN
  return Math.round(n * 100) / 100
}

export default function InstitutionHqCampusAllocateModal({ open, campus, treasuryBalance, onClose, onSuccess }) {
  const [amount, setAmount] = useState('')
  const [remark, setRemark] = useState('')
  const [err, setErr] = useState('')

  useEffect(() => {
    if (open) {
      setAmount('')
      setRemark('')
      setErr('')
    }
  }, [open, campus?.id])

  const parsed = useMemo(() => parseAmountInput(amount), [amount])
  const tb = typeof treasuryBalance === 'number' && Number.isFinite(treasuryBalance) ? treasuryBalance : 0
  const afterOk =
    Number.isFinite(parsed) && !Number.isNaN(parsed) && parsed > 0 && parsed <= tb
  const afterBal = Number.isFinite(parsed) && !Number.isNaN(parsed) && parsed >= 0 ? Math.round((tb - parsed) * 100) / 100 : null

  const submit = (e) => {
    e.preventDefault()
    setErr('')
    if (!campus) return
    if (!Number.isFinite(parsed) || Number.isNaN(parsed) || parsed <= 0) {
      setErr('请输入大于 0 的拨款金额')
      return
    }
    if (parsed > tb) {
      setErr(`拨款金额超过机构总账户当前余额（¥${fmtMoney(tb)}）`)
      return
    }
    const r = institutionHqAllocateFundsToCampus(campus, parsed, remark)
    if (!r.ok) {
      setErr(r.msg || '拨款失败')
      return
    }
    onSuccess?.()
    onClose()
  }

  if (!open || !campus) return null

  const titleName = String(campus.campusName || '校区').trim()

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="hq-allocate-modal-title">
      <button type="button" className="absolute inset-0 bg-slate-900/50 backdrop-blur-[1px]" aria-label="关闭" onClick={onClose} />
      <form
        className="relative w-full max-w-md rounded-2xl bg-white shadow-xl border border-slate-200 flex flex-col max-h-[min(90vh,520px)]"
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 sm:p-6 border-b border-slate-100 shrink-0">
          <h2 id="hq-allocate-modal-title" className="text-base font-bold text-slate-900">
            向校区拨款
          </h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            从机构总账户扣款，并计入「{titleName}」加盟商工作台账户余额。
          </p>
        </div>
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 min-h-0">
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 px-3 py-2.5 text-[11px] text-emerald-900 tabular-nums">
            机构总账户当前余额：<strong>¥{fmtMoney(tb)}</strong>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">拨款金额（元）*</label>
            <input
              inputMode="decimal"
              autoFocus
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm tabular-nums"
              placeholder="例如 5000"
            />
            {Number.isFinite(parsed) && !Number.isNaN(parsed) && parsed > 0 ? (
              <p className="text-[11px] mt-1.5 tabular-nums leading-relaxed">
                {afterOk ? (
                  <>
                    扣款后机构总账户余额约 <strong className="text-slate-800">¥{fmtMoney(afterBal)}</strong>
                  </>
                ) : (
                  <span className="text-rose-600 font-medium">金额超过当前机构总账户余额</span>
                )}
              </p>
            ) : null}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">备注（选填）</label>
            <textarea
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              rows={2}
              maxLength={120}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm resize-y"
              placeholder="如：教具采购备用金、活动补贴等"
            />
          </div>
          {err ? <p className="text-sm text-rose-600">{err}</p> : null}
        </div>
        <div className="p-4 sm:px-6 border-t border-slate-100 flex justify-end gap-2 shrink-0 bg-slate-50/80 rounded-b-2xl">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
            取消
          </button>
          <button
            type="submit"
            disabled={!afterOk}
            className="rounded-lg bg-primary hover:bg-primary-600 disabled:opacity-45 disabled:pointer-events-none text-white text-sm font-semibold px-5 py-2.5"
          >
            确认拨款
          </button>
        </div>
      </form>
    </div>
  )
}
