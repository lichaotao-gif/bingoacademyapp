/**
 * 加盟商「学具商城」商品目录 — 与主站 `FRANCHISE_TEACHING_PRODUCTS` 字段对齐。
 * 演示：写入 localStorage，加盟商门户 `getFranchiseTeachingProductsCatalog()` 读取同名 Key。
 * 列表顺序以数组下标为准（后台拖拽排序）；生产环境应改为总部 API。
 */
export const FRANCHISE_TEACHING_CATALOG_LS_KEY = 'bingo_franchise_teaching_products_catalog_v1'

/** 按「件数门槛」匹配一条优惠（取最高满足门槛的阶梯） */
export interface TeachingQtyTier {
  /** 满多少件起 */
  minQty: number
  /**
   * 折扣系数：0.9 表示 9 折；为 1 或不填表示本阶梯不打折（可仅用满减）
   */
  discountRate?: number
  /**
   * 满减金额（元）：在满足件数时，从该行小计或整单小计中扣减（与 discountRate 可叠加：先折后减）
   */
  reduceYuan?: number
}

/** 总部配置的学具采购优惠（加盟商端与下单计价共用 localStorage） */
export interface TeachingDiscountPolicy {
  /** 单行：某一 SKU 购买数量达到门槛时，仅对该行小计生效 */
  lineQuantityTiers: TeachingQtyTier[]
  /** 整单：购物车总件数达到门槛时，对「已应用单行优惠后的合计」再打折 / 满减 */
  orderTotalQuantityTiers: TeachingQtyTier[]
}

export interface TeachingProduct {
  id: string
  name: string
  price: number
  desc: string
  coverImageUrl?: string
  enabled?: boolean
}

export const DEFAULT_TEACHING_DISCOUNT_POLICY: TeachingDiscountPolicy = {
  lineQuantityTiers: [],
  orderTotalQuantityTiers: [
    { minQty: 30, discountRate: 0.5 },
    { minQty: 20, discountRate: 0.8 },
    { minQty: 10, discountRate: 0.9 },
  ],
}

export const DEFAULT_TEACHING_PRODUCT_COVER_DATA_URL = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="404" viewBox="0 0 720 404"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#dc2626"/><stop offset="52%" stop-color="#f97316"/><stop offset="100%" stop-color="#2563eb"/></linearGradient><pattern id="p" width="36" height="36" patternUnits="userSpaceOnUse"><circle cx="8" cy="8" r="3" fill="#fff" opacity=".2"/><path d="M28 6h4v4h-4zM8 26h4v4H8z" fill="#fff" opacity=".18"/></pattern></defs><rect width="720" height="404" rx="24" fill="url(#g)"/><rect width="720" height="404" fill="url(#p)"/><g fill="#fff"><text x="48" y="92" font-family="Arial, sans-serif" font-size="28" font-weight="700" opacity=".92">BINGO AI ACADEMY</text><text x="48" y="224" font-family="Arial, sans-serif" font-size="58" font-weight="800">AI EDU KIT</text><text x="52" y="278" font-family="Arial, sans-serif" font-size="24" font-weight="600" opacity=".84">Teaching Materials</text></g><g opacity=".78" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"><path d="M522 122h74l42 72-42 72h-74l-42-72z"/><path d="M522 122l37 72-37 72M596 122l-37 72 37 72"/></g></svg>`,
)}`

export const DEFAULT_TEACHING_PRODUCTS_SEED: TeachingProduct[] = [
  {
    id: 'kit-ai-starter',
    name: 'AI启蒙传感学具套装',
    price: 680,
    desc: '适合人工智能启蒙课堂：主控板、灯光、声音传感器与简易 AI 逻辑编程。',
    enabled: true,
    coverImageUrl: DEFAULT_TEACHING_PRODUCT_COVER_DATA_URL,
  },
  {
    id: 'robot-microbit',
    name: '人工智能 Micro:bit 编程学具',
    price: 298,
    desc: '面向 AI 编程入门课堂，支持图形化编程、传感器交互与智能作品搭建。',
    enabled: true,
    coverImageUrl: DEFAULT_TEACHING_PRODUCT_COVER_DATA_URL,
  },
  {
    id: 'sensor-ai-kit',
    name: 'AI视觉与多模态传感器套装',
    price: 1280,
    desc: '支持视觉、距离、声音等多模态 AI 感知实验，配套课堂实验报告模板。',
    enabled: true,
    coverImageUrl: DEFAULT_TEACHING_PRODUCT_COVER_DATA_URL,
  },
  {
    id: 'jetson-nano-edu',
    name: '边缘人工智能实验主机',
    price: 3299,
    desc: '用于边缘 AI 与轻量深度学习推理演示，含散热、电源与教育实验指引。',
    enabled: true,
    coverImageUrl: DEFAULT_TEACHING_PRODUCT_COVER_DATA_URL,
  },
  {
    id: 'ai-xlab-pack',
    name: 'AI机器学习实验耗材包（班课装）',
    price: 458,
    desc: '围绕机器学习数据采集、标注与分类实验设计，适配约 30 人 AI 班课。',
    enabled: true,
    coverImageUrl: DEFAULT_TEACHING_PRODUCT_COVER_DATA_URL,
  },
  {
    id: 'drone-ai-lite',
    name: 'AI视觉循迹无人机（教育版）',
    price: 1899,
    desc: '用于 AI 视觉循迹、定点巡航与智能控制入门，含安全护桨与课堂安全说明。',
    enabled: true,
    coverImageUrl: DEFAULT_TEACHING_PRODUCT_COVER_DATA_URL,
  },
]

function clampRate(r: unknown): number {
  const x = Number(r)
  if (!Number.isFinite(x)) return 1
  if (x < 0.05) return 0.05
  if (x > 1) return 1
  return Math.round(x * 1000) / 1000
}

function normalizeTier(t: Partial<TeachingQtyTier> & Record<string, unknown>): TeachingQtyTier | null {
  const minQty = Math.max(0, Math.floor(Number(t.minQty) || 0))
  if (minQty <= 0) return null
  const reduceYuan = Math.max(0, Math.round((Number(t.reduceYuan) || 0) * 100) / 100)
  const rawRate = t.discountRate
  const hasExplicitRate =
    rawRate != null && String(rawRate).trim() !== '' && Number.isFinite(Number(rawRate))
  let discountRate = hasExplicitRate ? clampRate(rawRate) : 1
  if (reduceYuan > 0 && !hasExplicitRate) discountRate = 1
  return { minQty, discountRate, reduceYuan }
}

export function normalizeTeachingDiscountPolicy(raw: unknown): TeachingDiscountPolicy {
  const fallbackOrder = () => DEFAULT_TEACHING_DISCOUNT_POLICY.orderTotalQuantityTiers.map((x) => ({ ...x }))
  const def = (): TeachingDiscountPolicy => ({
    lineQuantityTiers: DEFAULT_TEACHING_DISCOUNT_POLICY.lineQuantityTiers.map((x) => ({ ...x })),
    orderTotalQuantityTiers: fallbackOrder(),
  })
  if (!raw || typeof raw !== 'object') return def()
  const o = raw as { lineQuantityTiers?: unknown; orderTotalQuantityTiers?: unknown }
  const lineArr = Array.isArray(o.lineQuantityTiers) ? o.lineQuantityTiers : []
  const lineQuantityTiers = lineArr.map((x) => normalizeTier(x as TeachingQtyTier)).filter(Boolean) as TeachingQtyTier[]
  let orderTotalQuantityTiers: TeachingQtyTier[]
  if (!Array.isArray(o.orderTotalQuantityTiers)) {
    orderTotalQuantityTiers = fallbackOrder()
  } else {
    orderTotalQuantityTiers = o.orderTotalQuantityTiers
      .map((x) => normalizeTier(x as TeachingQtyTier))
      .filter(Boolean) as TeachingQtyTier[]
  }
  return { lineQuantityTiers, orderTotalQuantityTiers }
}

function normalize(p: Partial<TeachingProduct> & { id?: string }): TeachingProduct | null {
  const id = String(p.id ?? `kit-${Date.now().toString(36)}`).trim()
  if (!id || !/^[a-z0-9][a-z0-9-]{0,63}$/.test(id)) return null
  const price = Number(p.price)
  return {
    id,
    name: String(p.name ?? '').trim() || '未命名商品',
    price: Number.isFinite(price) && price >= 0 ? Math.round(price * 100) / 100 : 0,
    desc: p.desc != null ? String(p.desc) : '',
    coverImageUrl: p.coverImageUrl?.trim() || DEFAULT_TEACHING_PRODUCT_COVER_DATA_URL,
    enabled: p.enabled !== false,
  }
}

export interface TeachingCatalogBlob {
  products: TeachingProduct[]
  discountPolicy: TeachingDiscountPolicy
  updatedAt: string
}

function readBlob(): TeachingCatalogBlob {
  try {
    const raw = localStorage.getItem(FRANCHISE_TEACHING_CATALOG_LS_KEY)
    if (!raw) {
      return {
        products: DEFAULT_TEACHING_PRODUCTS_SEED.map((x) => ({ ...x })),
        discountPolicy: normalizeTeachingDiscountPolicy(DEFAULT_TEACHING_DISCOUNT_POLICY),
        updatedAt: new Date().toISOString(),
      }
    }
    const data = JSON.parse(raw) as { products?: unknown; discountPolicy?: unknown; updatedAt?: string }
    const arr = data?.products
    if (!Array.isArray(arr)) {
      return {
        products: DEFAULT_TEACHING_PRODUCTS_SEED.map((x) => ({ ...x })),
        discountPolicy: normalizeTeachingDiscountPolicy(data?.discountPolicy ?? DEFAULT_TEACHING_DISCOUNT_POLICY),
        updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : new Date().toISOString(),
      }
    }
    const list = arr.map((x) => normalize(x as TeachingProduct)).filter(Boolean) as TeachingProduct[]
    return {
      products: list.length ? list : DEFAULT_TEACHING_PRODUCTS_SEED.map((x) => ({ ...x })),
      discountPolicy: normalizeTeachingDiscountPolicy(data?.discountPolicy ?? DEFAULT_TEACHING_DISCOUNT_POLICY),
      updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : new Date().toISOString(),
    }
  } catch {
    return {
      products: DEFAULT_TEACHING_PRODUCTS_SEED.map((x) => ({ ...x })),
      discountPolicy: normalizeTeachingDiscountPolicy(DEFAULT_TEACHING_DISCOUNT_POLICY),
      updatedAt: new Date().toISOString(),
    }
  }
}

function writeBlob(products: TeachingProduct[], discountPolicy: TeachingDiscountPolicy) {
  localStorage.setItem(
    FRANCHISE_TEACHING_CATALOG_LS_KEY,
    JSON.stringify({
      products,
      discountPolicy: normalizeTeachingDiscountPolicy(discountPolicy),
      updatedAt: new Date().toISOString(),
    }),
  )
}

function readRaw(): TeachingProduct[] {
  return readBlob().products
}

function writeRaw(products: TeachingProduct[], discountPolicy?: TeachingDiscountPolicy) {
  const blob = readBlob()
  writeBlob(products, discountPolicy ?? blob.discountPolicy)
}

/** 按本地存储中的数组顺序返回（拖拽排序即修改该顺序） */
export function listTeachingProductsAdmin(): TeachingProduct[] {
  return readRaw().map((p) => ({ ...p }))
}

export function upsertTeachingProduct(input: TeachingProduct): { ok: boolean; msg?: string } {
  const n = normalize({ ...input, id: input.id || `kit-${Date.now().toString(36)}` })
  if (!n) return { ok: false, msg: '商品 ID 须为小写字母、数字与连字符，且不以连字符开头' }
  const all = readRaw()
  const idx = all.findIndex((x) => x.id === n.id)
  if (idx === -1) {
    all.push(n)
  } else {
    all[idx] = { ...all[idx], ...n }
  }
  writeRaw(all)
  return { ok: true }
}

export function deleteTeachingProduct(id: string): boolean {
  const all = readRaw().filter((x) => x.id !== id)
  writeRaw(all)
  return true
}

/** 按给定 id 顺序重写列表（用于拖拽排序） */
export function reorderTeachingProducts(orderedIds: string[]): void {
  const blob = readBlob()
  const all = blob.products
  const map = new Map(all.map((x) => [x.id, x]))
  const next: TeachingProduct[] = []
  for (const id of orderedIds) {
    const p = map.get(id)
    if (p) next.push(p)
  }
  for (const p of all) {
    if (!orderedIds.includes(p.id)) next.push(p)
  }
  writeBlob(next, blob.discountPolicy)
}

export function resetTeachingProductsToSeed(): void {
  const blob = readBlob()
  writeBlob(
    DEFAULT_TEACHING_PRODUCTS_SEED.map((x) => ({ ...x })),
    blob.discountPolicy,
  )
}

/** 后台读取当前优惠配置（与商品共用同一 Key） */
export function getTeachingDiscountPolicyAdmin(): TeachingDiscountPolicy {
  return normalizeTeachingDiscountPolicy(readBlob().discountPolicy)
}

/** 保存优惠配置（保留商品列表不变） */
export function saveTeachingDiscountPolicyAdmin(policy: TeachingDiscountPolicy): void {
  const blob = readBlob()
  writeBlob(blob.products, policy)
}
