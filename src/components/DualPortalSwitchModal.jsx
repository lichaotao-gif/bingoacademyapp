import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

/**
 * 双身份切换：紧贴触发按钮的小型浮层（非全屏居中弹窗）。
 * @param {'from-hq' | 'from-campus'} props.variant
 */
export default function DualPortalSwitchModal({
  open,
  onClose,
  anchorRef,
  variant,
  campuses = [],
  currentPartnerId,
  currentRefCode,
  showInstitutionHq,
  onSelectCampus,
  onSelectInstitutionHq,
}) {
  const panelRef = useRef(null)
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 216, flipDown: false })

  useLayoutEffect(() => {
    if (!open) return
    const anchor = anchorRef?.current
    if (!anchor || typeof anchor.getBoundingClientRect !== 'function') return
    const r = anchor.getBoundingClientRect()
    const width = Math.min(280, Math.max(200, r.width))
    const left = Math.max(8, Math.min(r.left, window.innerWidth - width - 8))
    const flipDown = r.top < 168
    setCoords({
      top: flipDown ? r.bottom : r.top,
      left,
      width,
      flipDown,
    })
  }, [open, anchorRef, campuses.length, showInstitutionHq, variant])

  useEffect(() => {
    if (!open) return
    const onResize = () => {
      const anchor = anchorRef?.current
      if (!anchor?.getBoundingClientRect) return
      const r = anchor.getBoundingClientRect()
      const width = Math.min(280, Math.max(200, r.width))
      const left = Math.max(8, Math.min(r.left, window.innerWidth - width - 8))
      const flipDown = r.top < 168
      setCoords({ top: flipDown ? r.bottom : r.top, left, width, flipDown })
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [open, anchorRef])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      const t = e.target
      if (anchorRef?.current?.contains(t)) return
      if (panelRef.current?.contains(t)) return
      onClose()
    }
    document.addEventListener('mousedown', onDown, true)
    return () => document.removeEventListener('mousedown', onDown, true)
  }, [open, onClose, anchorRef])

  if (!open || typeof document === 'undefined') return null

  const currentKey =
    currentPartnerId && currentRefCode ? `${String(currentPartnerId)}\t${String(currentRefCode)}` : null

  const panel = (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dual-portal-switch-title"
      className="fixed z-[200] rounded-lg border border-slate-200 bg-white shadow-lg ring-1 ring-slate-900/5 overflow-hidden flex flex-col text-xs max-h-[min(42vh,14rem)]"
      style={{
        top: coords.top,
        left: coords.left,
        width: coords.width,
        transform: coords.flipDown ? 'translateY(6px)' : 'translateY(calc(-100% - 6px))',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="px-2.5 py-2 border-b border-slate-100 bg-slate-50/80">
        <h2 id="dual-portal-switch-title" className="text-[11px] font-semibold text-slate-800">
          切换身份
        </h2>
        <p className="text-[10px] text-slate-500 mt-0.5 leading-snug line-clamp-2">
          {variant === 'from-hq' ? '选择要进入的校区工作台' : '选择校区工作台或机构总管理'}
        </p>
      </div>
      <ul className="overflow-y-auto overscroll-contain py-0.5 px-0.5">
        {campuses.map((c) => {
          const k = `${String(c.partnerId)}\t${String(c.refCode)}`
          const isCurrent = currentKey != null && k === currentKey
          return (
            <li key={c.id || k}>
              <button
                type="button"
                onClick={() => onSelectCampus(c)}
                className="w-full text-left rounded-md px-2 py-1.5 hover:bg-slate-50 transition"
              >
                <span className="font-medium text-slate-800 block truncate">
                  {c.campusName || '未命名校区'}
                  {isCurrent ? <span className="text-primary font-medium text-[10px] sm:text-xs"> · 当前</span> : null}
                </span>
              </button>
            </li>
          )
        })}
        {showInstitutionHq && variant === 'from-campus' ? (
          <li className="border-t border-slate-100 mt-0.5 pt-0.5">
            <button
              type="button"
              onClick={() => onSelectInstitutionHq?.()}
              className="w-full text-left rounded-md px-2 py-1.5 hover:bg-cyan-50/90 transition"
            >
              <span className="font-medium text-slate-800 block">机构总管理</span>
              <span className="text-[10px] text-slate-500">集团后台</span>
            </button>
          </li>
        ) : null}
      </ul>
      <div className="border-t border-slate-100 px-2 py-1.5 bg-slate-50/60">
        <button type="button" onClick={onClose} className="text-[10px] font-medium text-slate-500 hover:text-slate-800">
          关闭
        </button>
      </div>
    </div>
  )

  return createPortal(panel, document.body)
}
