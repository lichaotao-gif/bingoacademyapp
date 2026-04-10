import { useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'

function buildQrImageUrl(text) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=12&data=${encodeURIComponent(text)}`
}

/**
 * 分享：复制当前页链接 + 微信扫码二维码（外链生成图）
 */
export default function ReportShareModal({ open, onClose, shareUrl, title = '分享', subtitle }) {
  const titleId = useId()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open) setCopied(false)
  }, [open])

  if (!open) return null

  const safeUrl = shareUrl || (typeof window !== 'undefined' ? window.location.href : '')

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(safeUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('请手动复制链接：', safeUrl)
    }
  }

  const hint =
    subtitle ||
    '支持链接复制分享；微信内可转发链接，其他环境可用下方二维码在微信中扫码打开。'

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <button type="button" className="absolute inset-0 bg-slate-900/50 backdrop-blur-[1px]" aria-label="关闭" onClick={onClose} />
      <div
        className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id={titleId} className="text-lg font-bold text-bingo-dark mb-1">
          {title}
        </h3>
        <p className="text-xs text-slate-500 mb-4">{hint}</p>

        <p className="text-xs font-medium text-slate-700 mb-1.5">复制链接</p>
        <div className="flex gap-2 mb-6">
          <input
            readOnly
            value={safeUrl}
            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800"
          />
          <button type="button" onClick={handleCopy} className="shrink-0 rounded-xl btn-primary px-4 py-2 text-sm font-semibold">
            {copied ? '已复制' : '复制'}
          </button>
        </div>

        <p className="text-xs font-medium text-slate-700 mb-2">微信扫码</p>
        <div className="mb-5 flex justify-center rounded-xl border border-slate-100 bg-slate-50 py-4">
          <img src={buildQrImageUrl(safeUrl)} alt="" width={200} height={200} className="h-[200px] w-[200px]" decoding="async" />
        </div>
        <p className="text-[11px] text-slate-400 mb-4 text-center">若二维码无法加载，请使用「复制链接」</p>

        <button type="button" onClick={onClose} className="w-full rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
          关闭
        </button>
      </div>
    </div>,
    document.body
  )
}
