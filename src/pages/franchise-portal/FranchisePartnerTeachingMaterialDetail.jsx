import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  FRANCHISE_TEACHING_CATALOG_LS_KEY,
  getFranchiseTeachingProductsCatalog,
  getTeachingMaterialDetailBodyHtml,
} from '../../utils/franchisePartnerStorage'
import { sanitizeTeachingDetailHtml } from '../../utils/sanitizeTeachingDetailHtml'
import { getTeachingProductCoverSrc } from './FranchisePartnerTeachingMaterials'
import { useFranchiseWorkspace } from './useFranchiseWorkspace'

export default function FranchisePartnerTeachingMaterialDetail() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { session } = useFranchiseWorkspace()
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === FRANCHISE_TEACHING_CATALOG_LS_KEY) setTick((t) => t + 1)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const product = useMemo(() => {
    void tick
    const id = decodeURIComponent(String(productId || '').trim())
    if (!id) return null
    return getFranchiseTeachingProductsCatalog().find((p) => p.id === id) || null
  }, [productId, tick])

  const bodyHtml = useMemo(() => getTeachingMaterialDetailBodyHtml(product), [product])
  const safeHtml = useMemo(() => sanitizeTeachingDetailHtml(bodyHtml), [bodyHtml])
  const coverSrc = useMemo(() => (product ? getTeachingProductCoverSrc(product) : ''), [product])

  const goShopWithQuery = (search) => {
    if (!session?.partnerId) {
      window.alert('请先登录加盟商工作台后再采购学具。')
      return
    }
    navigate({ pathname: '..', search })
  }

  if (!product) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600 text-sm">
        <p>未找到该学具商品，可能已下架或链接有误。</p>
        <Link to=".." className="inline-block mt-4 text-primary font-semibold hover:underline">
          返回学具商城
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-28 sm:pb-24">
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] gap-0">
          <div className="relative bg-gradient-to-b from-slate-100 to-slate-50 flex items-center justify-center p-6 sm:p-10 min-h-[240px] lg:min-h-[360px]">
            <div className="relative w-full max-w-lg aspect-[16/10] rounded-2xl overflow-hidden border border-slate-200/80 shadow-lg bg-slate-200/50">
              <img src={coverSrc} alt={`${product.name} 主图`} className="absolute inset-0 w-full h-full object-cover" />
              {product.emoji ? (
                <span className="absolute top-3 left-3 text-3xl drop-shadow-md bg-white/90 rounded-xl px-2 py-1" aria-hidden>
                  {product.emoji}
                </span>
              ) : null}
              {product.tag ? (
                <span className="absolute top-3 right-3 text-xs font-semibold text-white bg-primary rounded-full px-2.5 py-1 shadow-md">
                  {product.tag}
                </span>
              ) : null}
            </div>
          </div>

          <div className="p-5 sm:p-7 lg:p-8 flex flex-col border-t lg:border-t-0 lg:border-l border-slate-100">
            <Link to=".." className="text-sm font-medium text-primary hover:underline w-fit mb-3">
              ← 返回学具商城
            </Link>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">{product.name}</h1>
            <div className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="text-3xl font-bold text-primary tabular-nums">¥{Number(product.price).toLocaleString('zh-CN')}</span>
            </div>

            <p className="mt-5 text-sm text-slate-600 leading-relaxed">{product.desc}</p>

            <div className="hidden lg:flex mt-auto pt-8 gap-3">
              <button
                type="button"
                onClick={() => goShopWithQuery(`?cartAdd=${encodeURIComponent(product.id)}`)}
                className="flex-1 rounded-xl border-2 border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                加入购物车
              </button>
              <button
                type="button"
                onClick={() => goShopWithQuery(`?buyNow=${encodeURIComponent(product.id)}`)}
                className="flex-1 rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-white shadow-md shadow-primary/25 hover:bg-primary-600"
              >
                立即购买
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">商品详情</h2>
        <div
          className="teaching-material-detail-body prose prose-slate max-w-none text-slate-800
            [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-xl
            [&_h1]:text-xl [&_h2]:text-lg [&_h3]:text-base [&_p]:leading-relaxed [&_a]:text-primary"
          dangerouslySetInnerHTML={{ __html: safeHtml }}
        />
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 z-[100] border-t border-slate-200 bg-white/95 backdrop-blur-md lg:hidden"
        style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
      >
        <div className="mx-auto max-w-3xl flex gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => goShopWithQuery(`?cartAdd=${encodeURIComponent(product.id)}`)}
            className="flex-1 rounded-xl border-2 border-slate-200 bg-white py-3.5 text-sm font-semibold text-slate-800 active:bg-slate-50"
          >
            加入购物车
          </button>
          <button
            type="button"
            onClick={() => goShopWithQuery(`?buyNow=${encodeURIComponent(product.id)}`)}
            className="flex-1 rounded-xl bg-primary py-3.5 text-sm font-semibold text-white shadow-md active:bg-primary-600"
          >
            立即购买
          </button>
        </div>
      </div>
    </div>
  )
}
