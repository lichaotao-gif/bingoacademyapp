/**
 * 新机构入驻：未完成资质审核时的操作拦截弹窗
 */
export default function NewOrgQualificationGuardModal({
  open,
  onClose,
  onPrimary,
  title = '功能暂不可用',
  message,
  primaryLabel = '立即完善信息',
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="new-org-guard-title">
      <div className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl border border-slate-200 p-6">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-600">温馨提示</p>
        <h3 id="new-org-guard-title" className="mt-1 text-lg font-bold text-slate-900">
          {title}
        </h3>
        <p className="mt-3 text-sm text-slate-600 leading-relaxed">{message}</p>
        <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            稍后再说
          </button>
          <button
            type="button"
            onClick={() => {
              onPrimary?.()
              onClose()
            }}
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:brightness-105 transition"
          >
            {primaryLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
