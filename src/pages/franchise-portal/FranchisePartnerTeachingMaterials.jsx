import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FRANCHISE_TEACHING_PRODUCTS,
  purchaseTeachingMaterials,
} from '../../utils/franchisePartnerStorage'
import { useFranchiseWorkspace } from './useFranchiseWorkspace'

function fmtDateTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const PAY_LABEL = { balance: '账户余额', wechat: '微信支付' }

const COVER_THEME = {
  'kit-ai-starter': { from: '#6366f1', to: '#22d3ee', dot: '#ffffff', code: 'K01' },
  'robot-microbit': { from: '#0ea5e9', to: '#14b8a6', dot: '#dcfce7', code: 'K02' },
  'sensor-ai-kit': { from: '#f97316', to: '#facc15', dot: '#fff7ed', code: 'K03' },
  'jetson-nano-edu': { from: '#7c3aed', to: '#f43f5e', dot: '#f5d0fe', code: 'K04' },
  'ai-xlab-pack': { from: '#16a34a', to: '#06b6d4', dot: '#dcfce7', code: 'K05' },
  'drone-ai-lite': { from: '#2563eb', to: '#4338ca', dot: '#dbeafe', code: 'K06' },
}

function makeCoverDataUrl(product) {
  const theme = COVER_THEME[product.id] || { from: '#334155', to: '#64748b', dot: '#e2e8f0', code: 'K00' }
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="720" height="404" viewBox="0 0 720 404">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${theme.from}" />
        <stop offset="100%" stop-color="${theme.to}" />
      </linearGradient>
    </defs>
    <rect width="720" height="404" fill="url(#g)" rx="20" />
    <g opacity="0.25" fill="${theme.dot}">
      <circle cx="70" cy="56" r="4"/><circle cx="105" cy="56" r="4"/><circle cx="140" cy="56" r="4"/><circle cx="175" cy="56" r="4"/>
      <circle cx="70" cy="92" r="4"/><circle cx="105" cy="92" r="4"/><circle cx="140" cy="92" r="4"/><circle cx="175" cy="92" r="4"/>
      <circle cx="560" cy="290" r="4"/><circle cx="595" cy="290" r="4"/><circle cx="630" cy="290" r="4"/><circle cx="665" cy="290" r="4"/>
      <circle cx="560" cy="326" r="4"/><circle cx="595" cy="326" r="4"/><circle cx="630" cy="326" r="4"/><circle cx="665" cy="326" r="4"/>
    </g>
    <rect x="40" y="282" width="640" height="86" rx="16" fill="rgba(15,23,42,0.28)" />
    <text x="64" y="332" fill="white" font-size="28" font-family="Arial, PingFang SC, Microsoft YaHei" font-weight="700">${product.name}</text>
    <text x="64" y="80" fill="rgba(255,255,255,0.92)" font-size="24" font-family="Arial, PingFang SC, Microsoft YaHei" font-weight="700">缤果AI学具商城 · ${theme.code}</text>
  </svg>`
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

function orderStatusStyle(status) {
  if (status === '已完成' || status === '已签收') return 'bg-emerald-100 text-emerald-800'
  if (status === '配送中' || status === '运输中') return 'bg-sky-100 text-sky-800'
  if (status === '待发货') return 'bg-amber-100 text-amber-900'
  return 'bg-slate-100 text-slate-700'
}

export default function FranchisePartnerTeachingMaterials() {
  const { session, ws, refresh } = useFranchiseWorkspace()
  const [tab, setTab] = useState('shop')
  const [cart, setCart] = useState({})
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [payMethod, setPayMethod] = useState('balance')
  const [submitErr, setSubmitErr] = useState('')

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
      const p = FRANCHISE_TEACHING_PRODUCTS.find((x) => x.id === line.productId)
      if (p) t += p.price * line.qty
    }
    return Math.round(t * 100) / 100
  }, [cartLines])

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
    setCart((prev) => ({ ...prev, [productId]: Math.max(1, parseInt(String(prev[productId]), 10) || 1) }))
    const p = FRANCHISE_TEACHING_PRODUCTS.find((x) => x.id === productId)
    const projected = (p?.price || 0) * (Math.max(1, parseInt(String(cart[productId]), 10) || 1))
    setPayMethod(ws.balance >= projected ? 'balance' : 'wechat')
    setCheckoutOpen(true)
  }

  const openCheckout = () => {
    if (!cartLines.length) return
    setSubmitErr('')
    setPayMethod(ws.balance >= cartTotal ? 'balance' : 'wechat')
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
    setCheckoutOpen(false)
    setPayMethod('balance')
    refresh()
    setTab('orders')
    window.alert(`订单已提交：${r.orderId}\n${payMethod === 'wechat' ? '微信支付（演示环境已模拟支付成功）' : '已从账户余额扣款'}`)
  }

  if (!ws || !session) return <p className="text-slate-500 text-sm">加载中…</p>

  const tabCls = (active) =>
    `px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors border ${
      active
        ? 'bg-[#3B66FF] text-white border-[#3B66FF] shadow-sm'
        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
    }`

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600 leading-relaxed">
        学具商城面向加盟校区提供人工智能相关教具采购服务；每款商品可先
        <strong className="font-medium text-slate-800 mx-0.5">加入购物车</strong>
        后统一结算。支付支持
        <Link to="/franchise-partner/balance" className="text-[#3B66FF] font-medium hover:underline mx-0.5">
          账户余额
        </Link>
        或
        <strong className="font-medium text-slate-800 mx-0.5">微信支付</strong>
        （演示环境即时模拟成功）。
      </p>

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
        <>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {FRANCHISE_TEACHING_PRODUCTS.map((p) => {
              const q = cart[p.id] || 0
              const coverSrc = makeCoverDataUrl(p)
              return (
                <div
                  key={p.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col hover:border-[#3B66FF]/35 transition-colors"
                >
                  <img src={coverSrc} alt={`${p.name} 封面`} className="w-full h-40 rounded-xl border border-slate-100 object-cover" />
                  <div className="mt-3 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-slate-900 text-[15px] leading-snug">{p.name}</h3>
                      {p.tag ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 font-medium shrink-0">
                          {p.tag}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">{p.category}</p>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">{p.desc}</p>
                    <p className="text-lg font-bold text-[#3B66FF] mt-3 tabular-nums">¥{p.price.toLocaleString('zh-CN')}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
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
                      className="flex-1 px-3 py-2.5 rounded-lg bg-[#3B66FF] hover:bg-[#2f56e6] text-white text-sm font-semibold"
                    >
                      立即购买
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="sticky bottom-0 z-10 rounded-2xl border border-slate-200 bg-white/95 backdrop-blur shadow-lg p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm text-slate-600">
              当前余额 <span className="font-bold text-[#3B66FF] tabular-nums">¥{ws.balance.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}</span>
              {cartLines.length ? (
                <>
                  <span className="mx-2 text-slate-300">|</span>
                  购物车 <span className="font-semibold text-slate-800">{cartLines.length}</span> 种商品 · 合计
                  <span className="font-bold text-slate-900 tabular-nums ml-1">¥{cartTotal.toFixed(2)}</span>
                </>
              ) : (
                <span className="text-slate-400 ml-2">暂无商品，点击卡片按钮加入购物车</span>
              )}
            </div>
            <button
              type="button"
              disabled={!cartLines.length}
              onClick={openCheckout}
              className="btn-primary px-6 py-3 rounded-xl text-sm font-semibold disabled:opacity-45 disabled:cursor-not-allowed"
            >
              购物车结算
            </button>
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
                const p = FRANCHISE_TEACHING_PRODUCTS.find((x) => x.id === line.productId)
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
              <span className="text-slate-600">应付合计</span>
              <span className="text-xl font-bold text-[#3B66FF] tabular-nums">¥{cartTotal.toFixed(2)}</span>
            </p>
            <form onSubmit={handleCheckout} className="space-y-4">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-2">支付方式</p>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 cursor-pointer hover:bg-slate-50 has-[:checked]:border-[#3B66FF] has-[:checked]:bg-sky-50/50">
                    <input type="radio" name="pay" value="balance" checked={payMethod === 'balance'} onChange={() => setPayMethod('balance')} className="text-[#3B66FF]" />
                    <span className="text-sm">
                      账户余额（当前 ¥{ws.balance.toFixed(2)}）
                      {cartTotal > ws.balance ? <span className="text-amber-700 text-xs ml-1">（不足，请充值或选微信）</span> : null}
                    </span>
                  </label>
                  <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 cursor-pointer hover:bg-slate-50 has-[:checked]:border-[#3B66FF] has-[:checked]:bg-sky-50/50">
                    <input type="radio" name="pay" value="wechat" checked={payMethod === 'wechat'} onChange={() => setPayMethod('wechat')} className="text-[#3B66FF]" />
                    <span className="text-sm">微信支付（演示环境模拟拉起并立即支付成功）</span>
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
    </div>
  )
}
