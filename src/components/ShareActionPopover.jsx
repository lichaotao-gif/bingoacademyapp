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

/**
 * 分享微信 / 复制链接 浮层（锚定在触发按钮附近）
 */
export default function ShareActionPopover({ open, onClose, anchorRect, shareUrl, shareTitle, shareText }) {
  const panelRef = useRef(null)
  const [pos, setPos] = useState({ left: 0, top: 0, transform: 'none' })

  useEffect(() => {
    if (!open || !anchorRect) return
    setPos(computePosition(anchorRect))
  }, [open, anchorRect])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const onScrollResize = () => onClose()
    window.addEventListener('scroll', onScrollResize, true)
    window.addEventListener('resize', onScrollResize)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', onScrollResize, true)
      window.removeEventListener('resize', onScrollResize)
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) return
    const onDown = (e) => {
      if (panelRef.current?.contains(e.target)) return
      if (e.target.closest?.('[data-share-popover-anchor]')) return
      onClose()
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open, onClose])

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

  const handleWeChat = async () => {
    const text = shareText || (shareTitle ? `推荐课程：${shareTitle}` : '推荐给你')
    const url = shareUrl || ''
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: shareTitle || '缤果 AI 学院',
          text: url ? `${text}\n${url}` : text,
          url: url || undefined,
        })
        onClose()
        return
      }
    } catch {
      /* 用户取消 */
    }
    if (url) {
      try {
        await navigator.clipboard.writeText(`${text}\n${url}`)
        window.alert('已复制分享文案与链接，请打开微信粘贴发送给好友或朋友圈。')
      } catch {
        window.alert('请复制链接后打开微信分享：\n' + url)
      }
    } else {
      window.alert('请使用微信扫一扫或复制链接分享给好友。')
    }
    onClose()
  }

  if (!open || !anchorRect || typeof document === 'undefined') return null

  return createPortal(
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
    </>,
    document.body
  )
}
