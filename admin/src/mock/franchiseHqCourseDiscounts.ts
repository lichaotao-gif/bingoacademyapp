/**
 * 总部对加盟商「充课课程包」的折扣配置（演示）。
 * 须与 src/utils/franchisePartnerStorage.js 中 FRANCHISE_HQ_COURSE_DISCOUNTS_LS_KEY 一致。
 */
export const FRANCHISE_HQ_COURSE_DISCOUNTS_LS_KEY = 'bingo_franchise_hq_course_discounts_v1'

/** 与主站 FRANCHISE_PROMOTABLE_COURSES id / 标价对齐 */
export const HQ_FRANCHISE_COURSE_CATALOG = [
  { id: 'ai-enlighten', name: '《AI启蒙：走进智能世界》', listPrice: 299 },
  { id: 'ai-advance-basic', name: '《AI基础原理与应用》', listPrice: 698 },
  { id: 'ai-advance-ml', name: '《机器学习入门与实战》', listPrice: 698 },
  { id: 'ai-programming', name: 'AI编程入门课', listPrice: 399 },
] as const

/** 与 defaultWorkspace 初始折扣一致（总部未配置时使用工作台默认值展示） */
export const DEFAULT_WORKSPACE_DISCOUNT_RATES: Record<string, number> = {
  'ai-enlighten': 0.8,
  'ai-advance-basic': 0.75,
  'ai-advance-ml': 0.75,
  'ai-programming': 0.85,
}

function loadRaw(): Record<string, Record<string, number>> {
  try {
    const raw = localStorage.getItem(FRANCHISE_HQ_COURSE_DISCOUNTS_LS_KEY)
    if (!raw) return {}
    const o = JSON.parse(raw) as unknown
    if (!o || typeof o !== 'object' || Array.isArray(o)) return {}
    return o as Record<string, Record<string, number>>
  } catch {
    return {}
  }
}

function saveRaw(map: Record<string, Record<string, number>>) {
  localStorage.setItem(FRANCHISE_HQ_COURSE_DISCOUNTS_LS_KEY, JSON.stringify(map))
}

export function getPartnerHqCourseDiscounts(partnerId: string): Record<string, number> {
  const pid = String(partnerId || '').trim()
  if (!pid) return {}
  const row = loadRaw()[pid]
  if (!row || typeof row !== 'object') return {}
  const out: Record<string, number> = {}
  for (const [k, v] of Object.entries(row)) {
    const r = Number(v)
    if (Number.isFinite(r) && r > 0 && r <= 1) out[k] = Math.round(r * 1000) / 1000
  }
  return out
}

/** 保存该加盟商全部课程折扣系数（覆盖总部此前对该加盟商的配置） */
export function savePartnerHqCourseDiscounts(partnerId: string, rates: Record<string, number>): void {
  const pid = String(partnerId || '').trim()
  if (!pid) return
  const all = loadRaw()
  const cleaned: Record<string, number> = {}
  for (const c of HQ_FRANCHISE_COURSE_CATALOG) {
    if (!Object.prototype.hasOwnProperty.call(rates, c.id)) continue
    const r = Number(rates[c.id])
    if (!Number.isFinite(r) || r <= 0 || r > 1) continue
    cleaned[c.id] = Math.round(r * 1000) / 1000
  }
  all[pid] = cleaned
  saveRaw(all)
}

/** 清除总部折扣覆盖，加盟商端恢复为工作台本地默认 */
export function clearPartnerHqCourseDiscounts(partnerId: string): void {
  const pid = String(partnerId || '').trim()
  if (!pid) return
  const all = loadRaw()
  delete all[pid]
  saveRaw(all)
}

export function rateToZhLabel(rate: number): string {
  if (!Number.isFinite(rate) || rate >= 0.9995) return '原价'
  if (rate <= 0) return '原价'
  const zhe = Math.round(rate * 100) / 10
  if (Math.abs(zhe - Math.round(zhe)) < 1e-6) return `${Math.round(zhe)}折`
  return `${zhe}折`
}
