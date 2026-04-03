import { useCallback, useMemo, useState } from 'react'
import { FRANCHISE_PROMOTABLE_COURSES, buildPromoteLink } from '../../utils/franchisePartnerStorage'
import { useFranchiseWorkspace } from './useFranchiseWorkspace'

export default function FranchisePartnerPromote() {
  const { session } = useFranchiseWorkspace()
  const origin = typeof window !== 'undefined' ? window.location.origin : ''

  const [copied, setCopied] = useState(null)

  const links = useMemo(() => {
    if (!session?.refCode) return []
    return FRANCHISE_PROMOTABLE_COURSES.map((c) => ({
      ...c,
      url: buildPromoteLink(origin, c.id, session.refCode),
      qrSrc: `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(buildPromoteLink(origin, c.id, session.refCode))}`,
    }))
  }, [session?.refCode, origin])

  const copy = useCallback((id, text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id)
      setTimeout(() => setCopied(null), 2000)
    })
  }, [])

  if (!session) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-bingo-dark">课程推广</h1>
        <p className="text-sm text-slate-500 mt-1">
          您的专属推广码 <span className="font-mono text-primary">{session.refCode}</span> — 用户通过链接购课后，订单佣金计入本账户（正式环境需支付归因对接）。
        </p>
      </div>

      <div className="grid gap-5">
        {links.map((c) => (
          <div key={c.id} className="card p-5 rounded-2xl border border-slate-200 flex flex-col lg:flex-row gap-5">
            <div className="flex-1 min-w-0 space-y-3">
              <div>
                <h2 className="font-semibold text-bingo-dark">{c.name}</h2>
                <p className="text-sm text-slate-500 mt-1">
                  售价 ¥{c.price} · 佣金比例 {(c.commissionRate * 100).toFixed(0)}% · 预估单笔 ¥{(c.price * c.commissionRate).toFixed(2)}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2 text-xs text-slate-600 break-all font-mono">
                {c.url}
              </div>
              <div className="flex flex-wrap gap-2">
                <a href={c.url} target="_blank" rel="noreferrer" className="btn-primary text-xs px-4 py-2 rounded-lg inline-block text-center">
                  预览落地页
                </a>
                <button type="button" onClick={() => copy(c.id, c.url)} className="text-xs px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 font-medium">
                  {copied === c.id ? '已复制' : '复制链接'}
                </button>
              </div>
            </div>
            <div className="shrink-0 flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-slate-100">
              <img src={c.qrSrc} alt="" width={160} height={160} className="rounded-lg border border-slate-100" />
              <p className="text-[11px] text-slate-400 text-center">扫码打开课程页（含推广参数）</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
