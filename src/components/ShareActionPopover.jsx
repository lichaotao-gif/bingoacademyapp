import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

const POPOVER_W = 232
const EST_HEIGHT = 128

function WeChatMenuIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 40 40" width="40" height="40" aria-hidden>
      <rect width="40" height="40" rx="8" fill="#07C160" />
      <path
        fill="#fff"
        fillRule="evenodd"
        d="M15.5 11c-3.6 0-6.5 2.3-6.5 5.2 0 1.6.9 3 2.3 3.9l-.5 2.4 2.6-1.3c.7.2 1.4.3 2.1.3.3 0 .6 0 .9-.1-.1-.4-.2-.8-.2-1.2 0-3.4 3.4-6.2 7.5-6.2.2 0 .4 0 .6.1C22.8 12.5 19.5 11 15.5 11zm-2 4.2a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4zm5.5 0a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4zM25.3 18c-3.4 0-6.2 2.2-6.2 4.9 0 2.7 2.8 4.9 6.2 4.9.6 0 1.2-.1 1.8-.2l2.1 1 .4-1.9c1.1-.8 1.8-2 1.8-3.2 0-2.7-2.8-4.9-6.2-4.9zm-2.3 3.3a1 1 0 110 2 1 1 0 010-2zm4.5 0a1 1 0 110 2 1 1 0 010-2z"
      />
    </svg>
  )
}

function CopyMenuIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="8" y="8" width="13" height="13" rx="2" />
      <path d="M5 16V5a2 2 0 012-2h9" />
    </svg>
  )
}

function ChevronRight({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function computePosition(rect) {
  if (typeof window === 'undefined' || !rect) return { left: 12, top: 80, transform: 'none' }
  const vw = window.innerWidth
  const vh = window.innerHeight
  const gap = 8
  const left = Math.min(Math.max(12, rect.right - POPOVER_W), vw - POPOVER_W - 12)
  const spaceAbove = rect.top
  const spaceBelow = vh - rect.bottom
  const preferAbove = spaceAbove >= EST_HEIGHT + gap || spaceAbove >= spaceBelow
  if (preferAbove) {
    return { left, top: rect.top - gap, transform: 'translateY(-100%)' }
  }
  return { left, top: rect.bottom + gap, transform: 'none' }
}

function wechatQrImageSrc(url) {
  const data = encodeURIComponent(url)
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=1&data=${data}`
}

/**
 * 分享微信 / 复制链接 浮层（锚定在触发按钮附近）；分享微信展开二维码扫码
 */
export default function ShareActionPopover({ open, onClose, anchorRect, shareUrl, shareTitle, shareText }) {
  const panelRef = useRef(null)
  const [pos, setPos] = useState({ left: 0, top: 0, transform: 'none' })
  /** menu | qr — 二维码层与菜单同生命周期，避免父级 onClose 卸载导致弹层消失 */
  const [view, setView] = useState('menu')

  useEffect(() => {
    if (!open) setView('menu')
  }, [open])

  useEffect(() => {
    if (!open || !anchorRect || view !== 'menu') return
    setPos(computePosition(anchorRect))
  }, [open, anchorRect, view])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      if (view === 'qr') setView('menu')
      else onClose()
    }
    window.addEventListener('keydown', onKey)
    const onScrollResize = () => {
      if (view === 'qr') return
      onClose()
    }
    window.addEventListener('scroll', onScrollResize, true)
    window.addEventListener('resize', onScrollResize)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', onScrollResize, true)
      window.removeEventListener('resize', onScrollResize)
    }
  }, [open, onClose, view])

  useEffect(() => {
    if (!open || view !== 'menu') return
    const onDown = (e) => {
      if (panelRef.current?.contains(e.target)) return
      if (e.target.closest?.('[data-share-popover-anchor]')) return
      onClose()
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open, onClose, view])

  const handleCopy = async () => {
    const url = shareUrl || ''
    if (!url) {
      window.alert('暂无可复制的链接')
      onClose()
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      window.alert('链接已复制到剪贴板')
    } catch {
      window.prompt('请手动复制以下链接：', url)
    }
    onClose()
  }

  const handleWeChat = () => {
    const url = (shareUrl || '').trim()
    if (!url) {
      window.alert('暂无可生成二维码的链接')
      return
    }
    setView('qr')
  }

  if (!open || !anchorRect || typeof document === 'undefined') return null

  const urlForQr = (shareUrl || '').trim()
  const qrSrc = urlForQr ? wechatQrImageSrc(urlForQr) : ''

  return createPortal(
    <>
      {view === 'menu' && (
        <>
          <div className="fixed inset-0 z-[140]" aria-hidden onClick={onClose} />
          <div
            ref={panelRef}
            role="menu"
            className="fixed z-[150] w-[min(92vw,232px)] rounded-2xl bg-white shadow-[0_8px_32px_rgba(0,0,0,0.14)] border border-slate-100 overflow-hidden"
            style={{ left: pos.left, top: pos.top, transform: pos.transform }}
          >
            <button
              type="button"
              role="menuitem"
              onClick={handleWeChat}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left bg-slate-50/90 hover:bg-slate-100/90 transition"
            >
              <WeChatMenuIcon className="shrink-0 w-10 h-10 rounded-lg" />
              <span className="flex-1 text-sm font-medium text-[#333]">分享微信</span>
              <ChevronRight className="shrink-0 text-slate-300" />
            </button>
            <div className="h-px bg-slate-100 mx-3" />
            <button
              type="button"
              role="menuitem"
              onClick={handleCopy}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50 transition"
            >
              <span className="shrink-0 w-10 h-10 flex items-center justify-center text-[#4a4a4a]">
                <CopyMenuIcon />
              </span>
              <span className="flex-1 text-sm font-medium text-[#333]">复制链接</span>
            </button>
          </div>
        </>
      )}

      {view === 'qr' && urlForQr && (
        <div
          className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-black/55"
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-wechat-qr-title"
          onClick={onClose}
        >
          <div
            className="w-full max-w-[320px] rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-2 px-4 py-3 bg-[#07C160] text-white">
              <div className="flex items-center gap-2 min-w-0">
                <span className="shrink-0 rounded-lg ring-2 ring-white/50 overflow-hidden">
                  <WeChatMenuIcon className="w-8 h-8 rounded-lg" />
                </span>
                <h3 id="share-wechat-qr-title" className="text-sm font-semibold truncate m-0">
                  微信扫码分享
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setView('menu')}
                className="shrink-0 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white text-lg leading-none flex items-center justify-center"
                aria-label="返回"
              >
                ✕
              </button>
            </div>
            <div className="px-5 pt-5 pb-4 text-center">
              <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                使用微信扫一扫识别二维码，打开页面后即可转发给好友或分享到朋友圈
              </p>
              <div className="inline-block rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <img
                  src={qrSrc}
                  width={220}
                  height={220}
                  className="w-[220px] h-[220px] object-contain mx-auto block"
                  alt="分享链接二维码"
                />
              </div>
              {shareTitle && <p className="text-sm font-medium text-[#333] mt-3 line-clamp-2">{shareTitle}</p>}
              {shareText && <p className="text-xs text-slate-500 mt-2 line-clamp-3 text-left">{shareText}</p>}
              <p className="text-[11px] text-slate-400 mt-2 break-all text-left max-h-14 overflow-y-auto">{urlForQr}</p>
            </div>
            <div className="flex gap-2 px-4 pb-4">
              <button
                type="button"
                onClick={() => setView('menu')}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                返回
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-[#07C160] text-white hover:bg-[#06ad56]"
              >
                完成
              </button>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  )
}
