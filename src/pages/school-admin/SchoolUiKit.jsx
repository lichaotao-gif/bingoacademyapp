import { useEffect } from 'react'

export function Modal({ title, desc, onClose, children, width = 'max-w-lg' }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto bg-black/40 px-4 py-8">
      <div className={`w-full ${width} rounded-2xl border border-slate-200 bg-white p-5 shadow-xl`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            {desc ? <p className="mt-1 text-xs leading-5 text-slate-500">{desc}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="shrink-0 rounded-lg px-2 py-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            ✕
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  )
}

export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-600">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-[11px] leading-4 text-slate-400">{hint}</span> : null}
    </label>
  )
}

export const inputCls =
  'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30'

export function FormError({ message }) {
  if (!message) return null
  return (
    <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs leading-5 text-rose-700">
      {message}
    </p>
  )
}

export function PrimaryButton({ children, className = '', ...rest }) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  )
}

export function GhostButton({ children, className = '', ...rest }) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  )
}

const PILL_TONES = {
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  gray: 'bg-slate-100 text-slate-600 border-slate-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  rose: 'bg-rose-50 text-rose-700 border-rose-200',
  violet: 'bg-violet-50 text-violet-700 border-violet-200',
}

export function Pill({ tone = 'gray', children }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${PILL_TONES[tone] || PILL_TONES.gray}`}>
      {children}
    </span>
  )
}

export function EmptyState({ children }) {
  return <p className="px-3 py-10 text-center text-sm text-slate-500">{children}</p>
}

export function SectionCard({ title, extra, desc, children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 ${className}`}>
      {title || extra ? (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
            {desc ? <p className="mt-1 text-xs text-slate-500">{desc}</p> : null}
          </div>
          {extra}
        </div>
      ) : null}
      {children}
    </section>
  )
}

/**
 * 轻量表格：窄屏横向滚动，避免在移动端压缩成不可读的列宽。
 * columns: [{ key, title, render?, className? }]
 */
export function DataTable({ columns, rows, rowKey = (r) => r.id, empty = '暂无数据', minWidth = 720 }) {
  if (!rows.length) return <EmptyState>{empty}</EmptyState>
  return (
    <div className="-mx-4 overflow-x-auto sm:mx-0">
      <table className="w-full border-collapse text-sm" style={{ minWidth }}>
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
            {columns.map((c) => (
              <th key={c.key} className={`whitespace-nowrap px-3 py-2 font-medium ${c.className || ''}`}>
                {c.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={rowKey(r)} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50/70">
              {columns.map((c) => (
                <td key={c.key} className={`px-3 py-2.5 align-middle text-slate-700 ${c.className || ''}`}>
                  {c.render ? c.render(r) : r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
