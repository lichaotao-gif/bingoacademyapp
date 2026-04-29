import { useCallback, useMemo, useState } from 'react'
import { FRANCHISE_PROMOTABLE_COURSES, buildPromoteLink, getDiscountLabel, getDiscountRate } from '../../utils/franchisePartnerStorage'
import { useFranchiseWorkspace } from './useFranchiseWorkspace'

export default function FranchisePartnerPromote() {
  const { session, ws } = useFranchiseWorkspace()
  const origin = typeof window !== 'undefined' ? window.location.origin : ''

  const [copied, setCopied] = useState(null)

  const links = useMemo(() => {
    if (!session?.refCode || !ws) return []
    return FRANCHISE_PROMOTABLE_COURSES.map((c) => ({
      ...c,
      url: buildPromoteLink(origin, c.id, session.refCode),
      qrSrc: `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(buildPromoteLink(origin, c.id, session.refCode))}`,
      discountLabel: getDiscountLabel(ws, c.id),
      rate: getDiscountRate(ws, c.id),
      salePrice: Math.round(c.price * getDiscountRate(ws, c.id) * 100) / 100,
    }))
  }, [session?.refCode, origin, ws])

  const copy = useCallback((id, text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id)
      setTimeout(() => setCopied(null), 2000)
    })
  }, [])

  if (!session || !ws) return null

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-slate-500">
          课程链接已自动附带您的渠道标识 <span className="font-mono text-[#3B66FF]">{session.refCode}</span>
          。用户通过链接访问课程页时携带该参数；加盟商侧购课/充课以总部配置的
          <span className="text-red-600 font-medium mx-0.5">专属折扣</span>
          结算（见折扣查看）。
        </p>
      </div>

      <div className="grid gap-5">
        {links.map((c) => (
          <div key={c.id} className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col lg:flex-row gap-5 shadow-sm">
            <div className="flex-1 min-w-0 space-y-3">
              <div>
                <h2 className="font-semibold text-slate-900">{c.name}</h2>
                <p className="text-sm text-slate-500 mt-1">
                  标价 ¥{c.price} · 您的折扣 <span className="text-red-600 font-semibold">{c.discountLabel}</span> · 折后参考 ¥
                  {c.salePrice.toFixed(2)}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-xs text-slate-600 break-all font-mono">
                {c.url}
              </div>
              <div className="flex flex-wrap gap-2">
                <a
                  href={c.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs px-4 py-2 rounded-lg bg-[#3B66FF] text-white font-medium hover:bg-[#2f56e6] inline-block text-center"
                >
                  预览落地页
                </a>
                <button
                  type="button"
                  onClick={() => copy(c.id, c.url)}
                  className="text-xs px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 font-medium"
                >
                  {copied === c.id ? '已复制' : '复制链接'}
                </button>
              </div>
            </div>
            <div className="shrink-0 flex flex-col items-center gap-2 p-4 bg-slate-50/80 rounded-xl border border-slate-100">
              <img src={c.qrSrc} alt="" width={160} height={160} className="rounded-lg border border-slate-100" />
              <p className="text-[11px] text-slate-400 text-center">扫码打开课程页（含推广参数）</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
