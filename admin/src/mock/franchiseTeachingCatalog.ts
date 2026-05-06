/**
 * 加盟商「学具商城」商品目录 — 与主站 `FRANCHISE_TEACHING_PRODUCTS` 字段对齐。
 * 演示：写入 localStorage，加盟商门户 `getFranchiseTeachingProductsCatalog()` 读取同名 Key。
 * 列表顺序以数组下标为准（后台拖拽排序）；生产环境应改为总部 API。
 */
export const FRANCHISE_TEACHING_CATALOG_LS_KEY = 'bingo_franchise_teaching_products_catalog_v1'

export interface TeachingProduct {
  id: string
  name: string
  price: number
  desc: string
  coverImageUrl?: string
  enabled?: boolean
}

export const DEFAULT_TEACHING_PRODUCT_COVER_DATA_URL = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="404" viewBox="0 0 720 404"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#dc2626"/><stop offset="52%" stop-color="#f97316"/><stop offset="100%" stop-color="#2563eb"/></linearGradient><pattern id="p" width="36" height="36" patternUnits="userSpaceOnUse"><circle cx="8" cy="8" r="3" fill="#fff" opacity=".2"/><path d="M28 6h4v4h-4zM8 26h4v4H8z" fill="#fff" opacity=".18"/></pattern></defs><rect width="720" height="404" rx="24" fill="url(#g)"/><rect width="720" height="404" fill="url(#p)"/><g fill="#fff"><text x="48" y="92" font-family="Arial, sans-serif" font-size="28" font-weight="700" opacity=".92">BINGO AI ACADEMY</text><text x="48" y="224" font-family="Arial, sans-serif" font-size="58" font-weight="800">AI EDU KIT</text><text x="52" y="278" font-family="Arial, sans-serif" font-size="24" font-weight="600" opacity=".84">Teaching Materials</text></g><g opacity=".78" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"><path d="M522 122h74l42 72-42 72h-74l-42-72z"/><path d="M522 122l37 72-37 72M596 122l-37 72 37 72"/></g></svg>`,
)}`

export const DEFAULT_TEACHING_PRODUCTS_SEED: TeachingProduct[] = [
  {
    id: 'kit-ai-starter',
    name: 'AI启蒙教具套装（主控+传感）',
    price: 680,
    desc: '适合低龄段课堂演示：灯光、声音等传感器与简易逻辑编程。',
    enabled: true,
    coverImageUrl: DEFAULT_TEACHING_PRODUCT_COVER_DATA_URL,
  },
  {
    id: 'robot-microbit',
    name: 'Micro:bit AI 编程扩展套件',
    price: 298,
    desc: '图形化编程对接实物硬件，含教案导读与班级管理建议。',
    enabled: true,
    coverImageUrl: DEFAULT_TEACHING_PRODUCT_COVER_DATA_URL,
  },
  {
    id: 'sensor-ai-kit',
    name: '人工智能感知传感器套装',
    price: 1280,
    desc: '视觉 / 距离 / 声音多模态实验，配套实验报告模板。',
    enabled: true,
    coverImageUrl: DEFAULT_TEACHING_PRODUCT_COVER_DATA_URL,
  },
  {
    id: 'jetson-nano-edu',
    name: '边缘 AI 实验主机（教育版）',
    price: 3299,
    desc: '轻量深度学习推理演示，含散热与电源适配器。',
    enabled: true,
    coverImageUrl: DEFAULT_TEACHING_PRODUCT_COVER_DATA_URL,
  },
  {
    id: 'ai-xlab-pack',
    name: '机器学习实验耗材包（班课装）',
    price: 458,
    desc: '卡片、标签与数据集样板，约 30 人班课用量。',
    enabled: true,
    coverImageUrl: DEFAULT_TEACHING_PRODUCT_COVER_DATA_URL,
  },
  {
    id: 'drone-ai-lite',
    name: '可编程无人机（Lite 教育版）',
    price: 1899,
    desc: '定点巡航与视觉循迹入门，含安全护桨与保险说明。',
    enabled: true,
    coverImageUrl: DEFAULT_TEACHING_PRODUCT_COVER_DATA_URL,
  },
]

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

function readRaw(): TeachingProduct[] {
  try {
    const raw = localStorage.getItem(FRANCHISE_TEACHING_CATALOG_LS_KEY)
    if (!raw) return DEFAULT_TEACHING_PRODUCTS_SEED.map((x) => ({ ...x }))
    const data = JSON.parse(raw) as { products?: unknown }
    const arr = data?.products
    if (!Array.isArray(arr)) return DEFAULT_TEACHING_PRODUCTS_SEED.map((x) => ({ ...x }))
    const list = arr.map((x) => normalize(x as TeachingProduct)).filter(Boolean) as TeachingProduct[]
    return list.length ? list : DEFAULT_TEACHING_PRODUCTS_SEED.map((x) => ({ ...x }))
  } catch {
    return DEFAULT_TEACHING_PRODUCTS_SEED.map((x) => ({ ...x }))
  }
}

function writeRaw(products: TeachingProduct[]) {
  localStorage.setItem(
    FRANCHISE_TEACHING_CATALOG_LS_KEY,
    JSON.stringify({ products, updatedAt: new Date().toISOString() }),
  )
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
  const all = readRaw()
  const map = new Map(all.map((x) => [x.id, x]))
  const next: TeachingProduct[] = []
  for (const id of orderedIds) {
    const p = map.get(id)
    if (p) next.push(p)
  }
  for (const p of all) {
    if (!orderedIds.includes(p.id)) next.push(p)
  }
  writeRaw(next)
}

export function resetTeachingProductsToSeed(): void {
  writeRaw(DEFAULT_TEACHING_PRODUCTS_SEED.map((x) => ({ ...x })))
}
