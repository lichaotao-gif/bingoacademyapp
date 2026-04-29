import { Fragment } from 'react'

/**
 * 充课等流程步骤条
 */
export function FranchisePartnerStepper({ steps, current }) {
  return (
    <div className="flex flex-wrap items-center w-full gap-y-3 mb-6 px-1">
      {steps.map((label, i) => {
        const n = i + 1
        const isActive = current === n
        const isDone = current > n
        return (
          <Fragment key={label}>
            <div className="flex items-center gap-2 py-1 shrink-0">
              <span
                className={
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 shrink-0 transition ' +
                  (isActive
                    ? 'bg-[#3B66FF] border-[#3B66FF] text-white'
                    : isDone
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'bg-slate-100 border-slate-200 text-slate-500')
                }
              >
                {isDone ? '✓' : n}
              </span>
              <span
                className={
                  'text-[13px] whitespace-nowrap ' +
                  (isActive ? 'text-[#3B66FF] font-semibold' : isDone ? 'text-emerald-600 font-medium' : 'text-slate-500')
                }
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 ? (
              <div
                className={
                  'h-0.5 flex-1 min-w-[1.25rem] mx-2 rounded self-center ' + (current > n ? 'bg-emerald-200' : 'bg-slate-200')
                }
                aria-hidden
              />
            ) : null}
          </Fragment>
        )
      })}
    </div>
  )
}
