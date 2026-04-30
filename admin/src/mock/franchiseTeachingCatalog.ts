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
  coverGradientFrom?: string
  coverGradientTo?: string
  coverDot?: string
  enabled?: boolean
}

export const DEFAULT_TEACHING_PRODUCTS_SEED: TeachingProduct[] = [
  {
    id: 'kit-ai-starter',
    name: 'AI启蒙教具套装（主控+传感）',
    price: 680,
    desc: '适合低龄段课堂演示：灯光、声音等传感器与简易逻辑编程。',
    enabled: true,
    coverGradientFrom: '#6366f1',
    coverGradientTo: '#22d3ee',
    coverDot: '#ffffff',
  },
  {
    id: 'robot-microbit',
    name: 'Micro:bit AI 编程扩展套件',
    price: 298,
    desc: '图形化编程对接实物硬件，含教案导读与班级管理建议。',
    enabled: true,
    coverGradientFrom: '#0ea5e9',
    coverGradientTo: '#14b8a6',
    coverDot: '#dcfce7',
  },
  {
    id: 'sensor-ai-kit',
    name: '人工智能感知传感器套装',
    price: 1280,
    desc: '视觉 / 距离 / 声音多模态实验，配套实验报告模板。',
    enabled: true,
    coverGradientFrom: '#f97316',
    coverGradientTo: '#facc15',
    coverDot: '#fff7ed',
  },
  {
    id: 'jetson-nano-edu',
    name: '边缘 AI 实验主机（教育版）',
    price: 3299,
    desc: '轻量深度学习推理演示，含散热与电源适配器。',
    enabled: true,
    coverGradientFrom: '#7c3aed',
    coverGradientTo: '#f43f5e',
    coverDot: '#f5d0fe',
  },
  {
    id: 'ai-xlab-pack',
    name: '机器学习实验耗材包（班课装）',
    price: 458,
    desc: '卡片、标签与数据集样板，约 30 人班课用量。',
    enabled: true,
    coverGradientFrom: '#16a34a',
    coverGradientTo: '#06b6d4',
    coverDot: '#dcfce7',
  },
  {
    id: 'drone-ai-lite',
    name: '可编程无人机（Lite 教育版）',
    price: 1899,
    desc: '定点巡航与视觉循迹入门，含安全护桨与保险说明。',
    enabled: true,
    coverGradientFrom: '#2563eb',
    coverGradientTo: '#4338ca',
    coverDot: '#dbeafe',
  },
]

function normalize(p: Partial<TeachingProduct> & { id?: string }): TeachingProduct | null {
  const id = String(p.id ?? '').trim()
  if (!id || !/^[a-z0-9][a-z0-9-]{0,63}$/.test(id)) return null
  const price = Number(p.price)
  return {
    id,
    name: String(p.name ?? '').trim() || '未命名商品',
    price: Number.isFinite(price) && price >= 0 ? Math.round(price * 100) / 100 : 0,
    desc: p.desc != null ? String(p.desc) : '',
    coverImageUrl: p.coverImageUrl?.trim() || undefined,
    coverGradientFrom: p.coverGradientFrom?.trim() || undefined,
    coverGradientTo: p.coverGradientTo?.trim() || undefined,
    coverDot: p.coverDot?.trim() || undefined,
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
  const n = normalize(input)
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
