import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  FRANCHISE_TEACHING_CATALOG_LS_KEY,
  calculateTeachingMaterialOrderPricing,
  formatTeachingDiscountTier,
  getFranchiseTeachingProductsCatalog,
  getTeachingMaterialCartDraft,
  getTeachingMaterialDiscountPolicy,
  purchaseTeachingMaterials,
  saveTeachingMaterialCartDraft,
} from '../../utils/franchisePartnerStorage'
import { useFranchiseWorkspace } from './useFranchiseWorkspace'

function fmtDateTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const PAY_LABEL = { balance: '账户余额', wechat: '微信支付' }

const COVER_THEME = {
  'kit-ai-starter': { from: '#6366f1', to: '#22d3ee', dot: '#ffffff' },
  'robot-microbit': { from: '#0ea5e9', to: '#14b8a6', dot: '#dcfce7' },
  'sensor-ai-kit': { from: '#f97316', to: '#facc15', dot: '#fff7ed' },
  'jetson-nano-edu': { from: '#7c3aed', to: '#f43f5e', dot: '#f5d0fe' },
  'ai-xlab-pack': { from: '#16a34a', to: '#06b6d4', dot: '#dcfce7' },
  'drone-ai-lite': { from: '#2563eb', to: '#4338ca', dot: '#dbeafe' },
}

function themeForProduct(product) {
  if (product.coverGradientFrom && product.coverGradientTo) {
    return {
      from: product.coverGradientFrom,
      to: product.coverGradientTo,
      dot: product.coverDot || '#ffffff',
    }
  }
  return COVER_THEME[product.id] || { from: '#334155', to: '#64748b', dot: '#e2e8f0' }
}

function escapeXmlText(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function makeCoverDataUrl(product) {
  const theme = themeForProduct(product)
  const rawTitle = String(product?.name || '学具商品').trim() || '学具商品'
  const title = escapeXmlText(rawTitle.length > 22 ? `${rawTitle.slice(0, 22)}…` : rawTitle)
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="720" height="404" viewBox="0 0 720 404">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${theme.from}" />
        <stop offset="100%" stop-color="${theme.to}" />
      </linearGradient>
      <linearGradient id="bar" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="rgba(15,23,42,0)" />
        <stop offset="100%" stop-color="rgba(15,23,42,0.55)" />
      </linearGradient>
    </defs>
    <rect width="720" height="404" fill="url(#g)" rx="20" stroke="rgba(255,255,255,0.22)" stroke-width="2" />
    <g opacity="0.22" fill="${theme.dot}">
      <circle cx="70" cy="56" r="4"/><circle cx="105" cy="56" r="4"/><circle cx="140" cy="56" r="4"/><circle cx="175" cy="56" r="4"/>
      <circle cx="70" cy="92" r="4"/><circle cx="105" cy="92" r="4"/><circle cx="140" cy="92" r="4"/><circle cx="175" cy="92" r="4"/>
      <circle cx="560" cy="290" r="4"/><circle cx="595" cy="290" r="4"/><circle cx="630" cy="290" r="4"/><circle cx="665" cy="290" r="4"/>
      <circle cx="560" cy="326" r="4"/><circle cx="595" cy="326" r="4"/><circle cx="630" cy="326" r="4"/><circle cx="665" cy="326" r="4"/>
    </g>
    <rect x="0" y="260" width="720" height="144" fill="url(#bar)" rx="20" />
    <text x="36" y="368" fill="rgba(255,255,255,0.95)" font-family="system-ui,-apple-system,sans-serif" font-size="26" font-weight="700">${title}</text>
    <text x="36" y="392" fill="rgba(255,255,255,0.75)" font-family="system-ui,-apple-system,sans-serif" font-size="14">Bingo Academy · 学具配图</text>
  </svg>`
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

/** 列表与详情共用封面地址（无外链图时返回渐变 SVG） */
export function getTeachingProductCoverSrc(product) {
  if (!product) return ''
  return product.coverImageUrl ? product.coverImageUrl : makeCoverDataUrl(product)
}

function orderStatusStyle(status) {
  if (status === '已完成' || status === '已签收') return 'bg-emerald-100 text-emerald-800'
  if (status === '配送中' || status === '运输中') return 'bg-sky-100 text-sky-800'
  if (status === '待发货') return 'bg-amber-100 text-amber-900'
  return 'bg-slate-100 text-slate-700'
}

export default function FranchisePartnerTeachingMaterials() {
  const { session, ws, refresh } = useFranchiseWorkspace()
  const [searchParams, setSearchParams] = useSearchParams()
  const [catalogTick, setCatalogTick] = useState(0)
  const teachingProducts = useMemo(() => {
    void catalogTick
    return getFranchiseTeachingProductsCatalog()
  }, [catalogTick])

  const discountPolicy = useMemo(() => {
    void catalogTick
    return getTeachingMaterialDiscountPolicy()
  }, [catalogTick])

  const policySummaryText = useMemo(() => {
    const lineParts = (discountPolicy.lineQuantityTiers || []).map(formatTeachingDiscountTier).filter(Boolean)
    const orderParts = (discountPolicy.orderTotalQuantityTiers || []).map(formatTeachingDiscountTier).filter(Boolean)
    const a = lineParts.length ? `单行：${lineParts.join('；')}` : ''
    const b = orderParts.length ? `整单：${orderParts.join('；')}` : ''
    return [a, b].filter(Boolean).join(' · ') || '暂无总部配置的件数优惠'
  }, [discountPolicy])

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === FRANCHISE_TEACHING_CATALOG_LS_KEY) setCatalogTick((t) => t + 1)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const [tab, setTab] = useState('shop')
  const [cart, setCart] = useState({})
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [payMethod, setPayMethod] = useState('balance')
  const [submitErr, setSubmitErr] = useState('')

  const skipPersistAfterHydrate = useRef(false)

  const cartAddParam = searchParams.get('cartAdd') || ''
  const buyNowParam = searchParams.get('buyNow') || ''

  useEffect(() => {
    if (!session?.partnerId) return
    skipPersistAfterHydrate.current = true
    setCart(getTeachingMaterialCartDraft(session.partnerId))
  }, [session?.partnerId])

  useEffect(() => {
    if (!session?.partnerId) return
    if (skipPersistAfterHydrate.current) {
      skipPersistAfterHydrate.current = false
      return
    }
    saveTeachingMaterialCartDraft(session.partnerId, cart)
  }, [cart, session?.partnerId])

  useEffect(() => {
    if (!session?.partnerId || !ws) return
    if (!cartAddParam && !buyNowParam) return
    const base = { ...getTeachingMaterialCartDraft(session.partnerId) }
    if (cartAddParam && teachingProducts.some((p) => p.id === cartAddParam)) {
      base[cartAddParam] = Math.max(0, parseInt(String(base[cartAddParam]), 10) || 0) + 1
    }
    if (buyNowParam && teachingProducts.some((p) => p.id === buyNowParam)) {
      base[buyNowParam] = Math.max(1, parseInt(String(base[buyNowParam]), 10) || 0)
    }
    saveTeachingMaterialCartDraft(session.partnerId, base)
    skipPersistAfterHydrate.current = true
    setCart(base)
    if (buyNowParam && teachingProducts.some((p) => p.id === buyNowParam)) {
      const lines = []
      for (const [productId, qty] of Object.entries(base)) {
        const q = Math.max(0, parseInt(String(qty), 10) || 0)
        if (q > 0) lines.push({ productId, qty: q })
      }
      const payAmount = calculateTeachingMaterialOrderPricing(lines, teachingProducts).payAmount
      setPayMethod(ws.balance >= payAmount ? 'balance' : 'wechat')
      setCheckoutOpen(true)
    }
    setSearchParams(
      (prev) => {
        const n = new URLSearchParams(prev)
        n.delete('cartAdd')
        n.delete('buyNow')
        return n
      },
      { replace: true },
    )
    setTab('shop')
  }, [cartAddParam, buyNowParam, session?.partnerId, ws, teachingProducts, setSearchParams])

  const cartLines = useMemo(() => {
    const lines = []
    for (const [productId, qty] of Object.entries(cart)) {
      const q = Math.max(0, parseInt(String(qty), 10) || 0)
      if (q > 0) lines.push({ productId, qty: q })
    }
    return lines
  }, [cart])

  const cartTotal = useMemo(() => {
    let t = 0
    for (const line of cartLines) {
      const p = teachingProducts.find((x) => x.id === line.productId)
      if (p) t += p.price * line.qty
    }
    return Math.round(t * 100) / 100
  }, [cartLines, teachingProducts])

  /** 购物车内商品总件数（各 SKU 数量之和） */
  const cartTotalQty = useMemo(() => cartLines.reduce((sum, line) => sum + line.qty, 0), [cartLines])
  const bulkPricing = useMemo(
    () => calculateTeachingMaterialOrderPricing(cartLines, teachingProducts),
    [cartLines, teachingProducts],
  )
  const cartPayAmount = bulkPricing.payAmount

  const shipmentRows = useMemo(() => {
    const rows = []
    for (const o of ws?.materialOrders || []) {
      for (const s of o.shipments || []) {
        rows.push({
          key: `${o.id}-${s.at}-${s.status}`,
          orderId: o.id,
          ...s,
        })
      }
    }
    rows.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
    return rows
  }, [ws?.materialOrders])

  const setQty = (productId, qty) => {
    const q = Math.max(0, parseInt(String(qty), 10) || 0)
    setCart((prev) => {
      const next = { ...prev }
      if (q <= 0) delete next[productId]
      else next[productId] = q
      return next
    })
  }

  const addToCart = (productId) => {
    setCart((prev) => ({ ...prev, [productId]: Math.max(0, parseInt(String(prev[productId]), 10) || 0) + 1 }))
  }

  const buyNow = (productId) => {
    setSubmitErr('')
    const nextCart = { ...cart, [productId]: Math.max(1, parseInt(String(cart[productId]), 10) || 1) }
    setCart(nextCart)
    const projectedLines = []
    for (const [id, qty] of Object.entries(nextCart)) {
      const q = Math.max(0, parseInt(String(qty), 10) || 0)
      if (!q) continue
      projectedLines.push({ productId: id, qty: q })
    }
    const projected = calculateTeachingMaterialOrderPricing(projectedLines, teachingProducts).payAmount
    setPayMethod(ws.balance >= projected ? 'balance' : 'wechat')
    setCheckoutOpen(true)
  }

  const openCheckout = () => {
    if (!cartLines.length) {
      window.alert('请先加入购物车')
      return
    }
    setSubmitErr('')
    setPayMethod(ws.balance >= cartPayAmount ? 'balance' : 'wechat')
    setCheckoutOpen(true)
  }

  const handleCheckout = (e) => {
    e.preventDefault()
    setSubmitErr('')
    if (!session) return
    if (!cartLines.length) {
      setSubmitErr('请先加入购物车')
      return
    }
    const r = purchaseTeachingMaterials(session.partnerId, session.refCode, cartLines, payMethod)
    if (!r.ok) {
      setSubmitErr(r.msg || '下单失败')
      return
    }
    setCart({})
    saveTeachingMaterialCartDraft(session.partnerId, {})
    setCheckoutOpen(false)
    setPayMethod('balance')
    refresh()
    setTab('orders')
    window.alert(`订单已提交：${r.orderId}\n${payMethod === 'wechat' ? '微信支付已完成' : '已从账户余额扣款'}`)
  }

  if (!ws || !session) return <p className="text-slate-500 text-sm">加载中…</p>

  const tabCls = (active) =>
    `px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors border ${
      active
        ? 'bg-primary text-white border-primary shadow-sm'
        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
    }`

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button type="button" className={tabCls(tab === 'shop')} onClick={() => setTab('shop')}>
            学具商城
          </button>
          <button type="button" className={tabCls(tab === 'orders')} onClick={() => setTab('orders')}>
            购买记录
          </button>
          <button type="button" className={tabCls(tab === 'shipments')} onClick={() => setTab('shipments')}>
            发货记录
          </button>
        </div>
        {tab === 'shop' ? (
          <button
            type="button"
            className="shrink-0 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50"
            onClick={() => setCatalogTick((t) => t + 1)}
          >
            刷新目录
          </button>
        ) : null}
      </div>

      {tab === 'shop' ? (
        <>
          <div className="rounded-xl border border-slate-200 bg-slate-50/90 px-3 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
            <span className="min-w-0 leading-snug">{policySummaryText}</span>
            <span className="shrink-0 tabular-nums font-medium text-slate-800">购物车 {cartTotalQty} 件</span>
          </div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            {teachingProducts.map((p) => {
              const q = cart[p.id] || 0
              const coverSrc = getTeachingProductCoverSrc(p)
              const itemPath = `item/${encodeURIComponent(p.id)}`
              return (
                <div
                  key={p.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col hover:border-primary/35 transition-colors overflow-hidden"
                >
                  <Link
                    to={itemPath}
                    className="min-w-0 flex-1 flex flex-col text-left rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 -m-1 p-1 group"
                  >
                    <div className="relative w-full h-40 rounded-xl border border-slate-100 overflow-hidden bg-slate-100 shadow-inner">
                      <img src={coverSrc} alt={`${p.name} 封面`} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
                      {p.emoji ? (
                        <span className="absolute top-2 left-2 text-2xl drop-shadow-sm bg-white/90 rounded-lg px-1.5 py-0.5" aria-hidden>
                          {p.emoji}
                        </span>
                      ) : null}
                      {p.tag ? (
                        <span className="absolute top-2 right-2 text-[11px] font-semibold text-white bg-primary rounded-full px-2 py-0.5 shadow-sm">
                          {p.tag}
                        </span>
                      ) : null}
                    </div>
                    <h3 className="mt-3 font-semibold text-slate-900 text-[15px] leading-snug group-hover:text-primary transition-colors">
                      {p.name}
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-3">{p.desc}</p>
                    <p className="text-lg font-bold text-primary mt-3 tabular-nums">¥{p.price.toLocaleString('zh-CN')}</p>
                  </Link>
                  <div className="relative z-10 flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 bg-white">
                    <button
                      type="button"
                      onClick={() => addToCart(p.id)}
                      className="flex-1 px-3 py-2.5 rounded-lg border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50"
                    >
                      {q > 0 ? `加入购物车（已${q}件）` : '加入购物车'}
                    </button>
                    <button
                      type="button"
                      onClick={() => buyNow(p.id)}
                      className="flex-1 px-3 py-2.5 rounded-lg bg-primary hover:bg-primary-600 text-white text-sm font-semibold"
                    >
                      立即购买
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      ) : null}

      {tab === 'orders' ? (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm text-left min-w-[720px]">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium whitespace-nowrap">采购单号</th>
                <th className="px-5 py-3 font-medium whitespace-nowrap">下单时间</th>
                <th className="px-5 py-3 font-medium text-right tabular-nums">实付（元）</th>
                <th className="px-5 py-3 font-medium whitespace-nowrap">支付方式</th>
                <th className="px-5 py-3 font-medium whitespace-nowrap">状态</th>
                <th className="px-5 py-3 font-medium min-w-[12rem]">明细</th>
              </tr>
            </thead>
            <tbody>
              {(ws.materialOrders || []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                    暂无采购记录
                  </td>
                </tr>
              ) : (
                (ws.materialOrders || []).map((o) => (
                  <tr key={o.id} className="border-t border-slate-100 hover:bg-slate-50/80 align-top">
                    <td className="px-5 py-3 font-mono text-slate-800 whitespace-nowrap">{o.id}</td>
                    <td className="px-5 py-3 text-slate-600 whitespace-nowrap tabular-nums">{fmtDateTime(o.createdAt)}</td>
                    <td className="px-5 py-3 text-right font-semibold text-slate-900 tabular-nums">¥{Number(o.payAmount).toFixed(2)}</td>
                    <td className="px-5 py-3 text-slate-700">{PAY_LABEL[o.payMethod] || o.payMethod}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${orderStatusStyle(o.status)}`}>{o.status}</span>
                    </td>
                    <td className="px-5 py-3 text-slate-700 text-xs leading-relaxed">
                      {(o.items || []).map((it) => (
                        <div key={it.productId + it.qty}>{it.name} × {it.qty}</div>
                      ))}
                      {o.discountRate && o.discountRate < 1 ? (
                        <p className="mt-1 text-amber-700">
                          {o.discountLabel} · 原价 ¥{Number(o.originalAmount || o.payAmount).toFixed(2)}，已优惠 ¥{Number(o.discountAmount || 0).toFixed(2)}
                        </p>
                      ) : null}
                      <p className="text-slate-400 mt-1 text-[11px]">{o.receiverSnapshot}</p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : null}

      {tab === 'shipments' ? (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm text-left min-w-[900px]">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium whitespace-nowrap">时间</th>
                <th className="px-5 py-3 font-medium whitespace-nowrap">采购单号</th>
                <th className="px-5 py-3 font-medium whitespace-nowrap">节点状态</th>
                <th className="px-5 py-3 font-medium whitespace-nowrap">承运商</th>
                <th className="px-5 py-3 font-medium whitespace-nowrap">运单号</th>
                <th className="px-5 py-3 font-medium min-w-[12rem]">备注</th>
              </tr>
            </thead>
            <tbody>
              {shipmentRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-400">暂无发货与物流节点</td>
                </tr>
              ) : (
                shipmentRows.map((row) => (
                  <tr key={row.key} className="border-t border-slate-100 hover:bg-slate-50/80 align-top">
                    <td className="px-5 py-3 text-slate-600 whitespace-nowrap tabular-nums">{fmtDateTime(row.at)}</td>
                    <td className="px-5 py-3 font-mono text-slate-800 whitespace-nowrap">{row.orderId}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${orderStatusStyle(row.status)}`}>{row.status}</span>
                    </td>
                    <td className="px-5 py-3 text-slate-700">{row.carrier || '—'}</td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-600">{row.trackingNo || '—'}</td>
                    <td className="px-5 py-3 text-slate-600 text-xs leading-relaxed">{row.remark || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : null}

      {checkoutOpen ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="tm-checkout-title">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[1px]" role="presentation" onClick={() => setCheckoutOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl border border-slate-200 p-6 sm:p-7" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3 mb-4">
              <h2 id="tm-checkout-title" className="text-base font-semibold text-slate-900">购物车结算</h2>
              <button
                type="button"
                onClick={() => setCheckoutOpen(false)}
                className="shrink-0 w-9 h-9 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 text-xl leading-none"
                aria-label="关闭"
              >
                ×
              </button>
            </div>
            <ul className="space-y-2 max-h-56 overflow-y-auto border border-slate-100 rounded-xl p-3 bg-slate-50/80 mb-4">
              {cartLines.map((line) => {
                const p = teachingProducts.find((x) => x.id === line.productId)
                if (!p) return null
                return (
                  <li key={line.productId} className="rounded-lg bg-white border border-slate-100 px-3 py-2.5">
                    <div className="flex items-start justify-between gap-2 text-sm">
                      <span className="text-slate-700 leading-snug">{p.name}</span>
                      <span className="font-medium tabular-nums shrink-0">¥{(p.price * line.qty).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="w-7 h-7 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50"
                          onClick={() => setQty(line.productId, line.qty - 1)}
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm tabular-nums">{line.qty}</span>
                        <button
                          type="button"
                          className="w-7 h-7 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50"
                          onClick={() => setQty(line.productId, line.qty + 1)}
                        >
                          +
                        </button>
                      </div>
                      <button type="button" className="text-xs text-rose-600 hover:underline" onClick={() => setQty(line.productId, 0)}>
                        移除
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
            <p className="flex justify-between text-sm mb-4">
              <span className="text-slate-600">商品原价</span>
              <span className="font-semibold text-slate-900 tabular-nums">¥{cartTotal.toFixed(2)}</span>
            </p>
            {bulkPricing.discountAmount > 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 mb-4 text-xs text-slate-800">
                <div className="flex justify-between gap-3">
                  <span className="font-medium text-slate-600">优惠</span>
                  <span className="font-medium text-right leading-snug max-w-[14rem]">{bulkPricing.discountLabel}</span>
                </div>
                <div className="flex justify-between gap-3 mt-1.5 pt-1.5 border-t border-slate-200/80">
                  <span className="text-slate-500">减免金额</span>
                  <span className="font-semibold tabular-nums shrink-0 text-rose-700">-¥{bulkPricing.discountAmount.toFixed(2)}</span>
                </div>
              </div>
            ) : null}
            <p className="flex justify-between text-sm mb-4">
              <span className="text-slate-600">应付合计</span>
              <span className="text-xl font-bold text-primary tabular-nums">¥{cartPayAmount.toFixed(2)}</span>
            </p>
            <form onSubmit={handleCheckout} className="space-y-4">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-2">支付方式</p>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 cursor-pointer hover:bg-slate-50 has-[:checked]:border-primary has-[:checked]:bg-sky-50/50">
                    <input type="radio" name="pay" value="balance" checked={payMethod === 'balance'} onChange={() => setPayMethod('balance')} className="text-primary" />
                    <span className="text-sm">
                      账户余额（当前 ¥{ws.balance.toFixed(2)}）
                      {cartPayAmount > ws.balance ? <span className="text-amber-700 text-xs ml-1">（余额不足）</span> : null}
                    </span>
                  </label>
                  <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 cursor-pointer hover:bg-slate-50 has-[:checked]:border-primary has-[:checked]:bg-sky-50/50">
                    <input type="radio" name="pay" value="wechat" checked={payMethod === 'wechat'} onChange={() => setPayMethod('wechat')} className="text-primary" />
                    <span className="text-sm">微信支付</span>
                  </label>
                </div>
              </div>
              {submitErr ? <p className="text-sm text-red-600">{submitErr}</p> : null}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setCheckoutOpen(false)} className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50">
                  取消
                </button>
                <button type="submit" className="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold">
                  确认支付
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={openCheckout}
        className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom,0px))] right-[max(1.25rem,env(safe-area-inset-right,0px))] z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary-600 transition-colors ring-4 ring-white"
        aria-label={cartTotalQty > 0 ? `购物车，共${cartTotalQty}件商品` : '购物车'}
      >
        <span className="relative inline-flex">
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          {cartTotalQty > 0 ? (
            <span className="absolute -right-3 -top-3 flex min-h-[22px] min-w-[22px] items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] font-bold tabular-nums leading-none text-white ring-2 ring-white">
              {cartTotalQty > 99 ? '99+' : cartTotalQty}
            </span>
          ) : null}
        </span>
      </button>
    </div>
  )
}
