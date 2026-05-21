/**
 * 加盟商工作台演示数据（localStorage，单机模拟）
 * v1.1.0：独立账号、班级/学员、专属折扣、充课扣余额、订单与财务统计。
 * 生产环境应替换为总部后台 API。
 */
import { getTeachingProductDemoDetailHtml } from '../constants/teachingProductDetailPresets.js'
import { INSTITUTION_HQ_PENDING_WS_KEY } from '../constants/institutionHqPendingWorkspace.js'

const SESSION_KEY = 'bingo_franchise_partner_session_v1'

const workspaceKey = (partnerId) => `bingo_franchise_workspace_v2_${partnerId}`

function safeParse(json, fallback) {
  try {
    return JSON.parse(json)
  } catch {
    return fallback
  }
}

/** 登录页预填演示主账号（无总部开户档案时机构名与 refCode 与此对齐） */
export const FRANCHISE_PREVIEW_DEMO_MAIN_PHONE = '13800138000'

/**
 * 统一为 11 位国内手机，避免会话里存成 8613800138000 导致演示主号判断失败、侧栏逻辑异常。
 */
export function normalizePartnerPhoneDigits(raw) {
  const d = String(raw || '').replace(/\D/g, '')
  if (d.length === 11 && /^1\d{10}$/.test(d)) return d
  if (d.startsWith('86') && d.length === 13 && /^1\d{10}$/.test(d.slice(2))) return d.slice(2)
  return d
}

/**
 * 与 `main.jsx` 中 BrowserRouter 的 basename（`import.meta.env.BASE_URL`）对齐，
 * 生成可在 `window.open` 中使用的绝对 URL。避免 `new URL(relative, origin+base)` 在 base 无尾斜杠时解析到错误路径。
 */
export function resolvePublicSitePath(path) {
  if (typeof window === 'undefined') return String(path || '')
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  const raw = String(import.meta.env.BASE_URL || '/')
  const trimmed = raw.replace(/\/$/, '').replace(/^\//, '')
  if (!trimmed) return `${window.location.origin}${cleanPath}`
  return `${window.location.origin}/${trimmed}${cleanPath}`
}

/** 课程包（与站点课程 id 对齐） */
export const FRANCHISE_PROMOTABLE_COURSES = [
  { id: 'ai-enlighten', name: '《AI启蒙：走进智能世界》', price: 299 },
  { id: 'ai-advance-basic', name: '《AI基础原理与应用》', price: 698 },
  { id: 'ai-advance-ml', name: '《机器学习入门与实战》', price: 698 },
  { id: 'ai-programming', name: 'AI编程入门课', price: 399 },
]

/**
 * 线下授课课时目录（按课程包 id）。
 * 创建班级时选择课程包后复制到班级；管理员线下上完一节则勾选对应课时。
 */
const FRANCHISE_OFFLINE_LESSON_CATALOG_BASE = {
  'ai-enlighten': [
    { id: 'ai-enlighten-L1', title: '第1课时 · 认识身边的智能' },
    { id: 'ai-enlighten-L2', title: '第2课时 · 会思考的机器' },
    { id: 'ai-enlighten-L3', title: '第3课时 · 数据与决策' },
    { id: 'ai-enlighten-L4', title: '第4课时 · 安全与规则' },
    { id: 'ai-enlighten-L5', title: '第5课时 · 创意小项目' },
    { id: 'ai-enlighten-L6', title: '第6课时 · 阶段回顾与展示' },
  ],
  'ai-advance-basic': [
    { id: 'ai-advance-basic-L1', title: '第1课时 · 算法与流程' },
    { id: 'ai-advance-basic-L2', title: '第2课时 · 特征与表示' },
    { id: 'ai-advance-basic-L3', title: '第3课时 · 简单分类实验' },
    { id: 'ai-advance-basic-L4', title: '第4课时 · 模型评估入门' },
    { id: 'ai-advance-basic-L5', title: '第5课时 · 综合练习' },
    { id: 'ai-advance-basic-L6', title: '第6课时 · 阶段测评' },
    { id: 'ai-advance-basic-L7', title: '第7课时 · 拓展与答疑' },
  ],
  'ai-advance-ml': [
    { id: 'ai-advance-ml-L1', title: '第1课时 · 机器学习概览' },
    { id: 'ai-advance-ml-L2', title: '第2课时 · 数据准备与清洗' },
    { id: 'ai-advance-ml-L3', title: '第3课时 · 监督学习入门' },
    { id: 'ai-advance-ml-L4', title: '第4课时 · 训练与验证' },
    { id: 'ai-advance-ml-L5', title: '第5课时 · 小项目实战' },
    { id: 'ai-advance-ml-L6', title: '第6课时 · 模型调优讨论' },
    { id: 'ai-advance-ml-L7', title: '第7课时 · 成果汇报' },
    { id: 'ai-advance-ml-L8', title: '第8课时 · 总结与进阶指引' },
  ],
  'ai-programming': [
    { id: 'ai-programming-L1', title: '第1课时 · 编程环境与变量' },
    { id: 'ai-programming-L2', title: '第2课时 · 条件与循环' },
    { id: 'ai-programming-L3', title: '第3课时 · 函数与模块' },
    { id: 'ai-programming-L4', title: '第4课时 · 与 AI 接口互动' },
    { id: 'ai-programming-L5', title: '第5课时 · 综合小作品' },
  ],
}

/** 创建班级弹窗演示：人工智能课 1～9 星（不参与充课/折扣主列表） */
export const FRANCHISE_CLASS_CREATE_OFFLINE_DEMO_PACKS = Array.from({ length: 9 }, (_, i) => {
  const star = i + 1
  const id = `fr-ai-star-${star}`
  return { id, name: `人工智能课 · ${star}星`, price: 199 + star * 30 }
})

function buildFrAiStarOfflineLessonCatalog() {
  const out = {}
  for (const { id } of FRANCHISE_CLASS_CREATE_OFFLINE_DEMO_PACKS) {
    const star = Number(String(id).replace(/^fr-ai-star-/, '')) || 1
    out[id] = [
      { id: `${id}-L1`, title: `第1课时 · ${star}星 · 核心能力` },
      { id: `${id}-L2`, title: `第2课时 · ${star}星 · 综合实训` },
    ]
  }
  return out
}

/** 线下课包展示名：正式推广课 + 创建班级演示星标课包 */
export function getFranchiseOfflinePackMeta(courseId) {
  if (!courseId) return undefined
  return (
    FRANCHISE_PROMOTABLE_COURSES.find((c) => c.id === courseId) ||
    FRANCHISE_CLASS_CREATE_OFFLINE_DEMO_PACKS.find((c) => c.id === courseId)
  )
}

function offlinePackIdOrderForNormalization() {
  return [
    ...FRANCHISE_PROMOTABLE_COURSES.map((c) => c.id),
    ...FRANCHISE_CLASS_CREATE_OFFLINE_DEMO_PACKS.map((c) => c.id),
  ]
}

export const FRANCHISE_OFFLINE_LESSON_CATALOG = {
  ...FRANCHISE_OFFLINE_LESSON_CATALOG_BASE,
  ...buildFrAiStarOfflineLessonCatalog(),
}

export function getOfflineLessonTemplate(courseId) {
  const rows = FRANCHISE_OFFLINE_LESSON_CATALOG[courseId]
  if (!rows?.length) return []
  return rows.map((r) => ({ id: r.id, title: r.title, done: false }))
}

/** 按顺序合并多个课程包的线下课时（课时 id 在目录内已唯一）；含 packLabel 便于界面分组展示。 */
export function getMergedOfflineLessonTemplates(courseIds) {
  const seenPack = new Set()
  const out = []
  for (const courseId of courseIds) {
    if (!courseId || seenPack.has(courseId)) continue
    if (!FRANCHISE_OFFLINE_LESSON_CATALOG[courseId]?.length) continue
    seenPack.add(courseId)
    const pack = getFranchiseOfflinePackMeta(courseId)
    const packLabel = pack?.name || courseId
    for (const r of FRANCHISE_OFFLINE_LESSON_CATALOG[courseId]) {
      out.push({ id: r.id, title: r.title, done: false, packCourseId: courseId, packLabel })
    }
  }
  return out
}

function inferOfflineCourseIdsFromLessons(lessons) {
  if (!Array.isArray(lessons) || !lessons.length) return []
  const hits = []
  for (const courseId of Object.keys(FRANCHISE_OFFLINE_LESSON_CATALOG)) {
    const p = `${courseId}-L`
    if (lessons.some((l) => l.id && l.id.startsWith(p))) hits.push(courseId)
  }
  const firstIndex = (courseId) => {
    const p = `${courseId}-L`
    const i = lessons.findIndex((l) => l.id && l.id.startsWith(p))
    return i === -1 ? 9999 : i
  }
  hits.sort((a, b) => firstIndex(a) - firstIndex(b))
  return hits
}

function normalizeOfflineCourseIdsFromMeta(meta) {
  if (Array.isArray(meta?.offlineCourseIds)) {
    const picked = new Set()
    for (const x of meta.offlineCourseIds) {
      const id = String(x || '').trim()
      if (!id || !FRANCHISE_OFFLINE_LESSON_CATALOG[id]?.length) continue
      picked.add(id)
    }
    return offlinePackIdOrderForNormalization().filter((id) => picked.has(id))
  }
  const single = typeof meta?.offlineCourseId === 'string' ? meta.offlineCourseId.trim() : ''
  if (single && FRANCHISE_OFFLINE_LESSON_CATALOG[single]?.length) return [single]
  return []
}

/**
 * 总部配置的学具目录落盘 Key（与 admin/src/mock/franchiseTeachingCatalog.ts 保持一致）。
 * 未配置或解析失败时，使用下方 FRANCHISE_TEACHING_PRODUCTS 默认列表。
 */
export const FRANCHISE_TEACHING_CATALOG_LS_KEY = 'bingo_franchise_teaching_products_catalog_v1'

const TEACHING_DETAIL_HTML_MAX = 400_000

function escapeHtmlForTeachingFallback(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** 无总部配置的 detailHtml 时，用封面 + 简介生成占位详情（加盟商端展示） */
export function buildFallbackTeachingDetailHtml(name, desc, coverImageUrl) {
  const cover = coverImageUrl != null ? String(coverImageUrl).trim() : ''
  const img = cover
    ? `<p><img src='${cover.replace(/'/g, '%27')}' alt="" style="width:100%;max-width:560px;aspect-ratio:4/3;object-fit:cover;border-radius:12px;border:1px solid #e2e8f0" /></p>`
    : ''
  return `<div class="teaching-product-detail">${img}<h2 style="font-size:1.125rem;margin:0 0 0.5rem">${escapeHtmlForTeachingFallback(name)}</h2><p style="line-height:1.65;color:#334155">${escapeHtmlForTeachingFallback(desc)}</p><p style="color:#64748b;font-size:13px;margin-top:1rem">更多介绍可由总部在「学具商品配置」中编辑详情 HTML。</p></div>`
}

function clampTeachingDetailHtml(raw) {
  const s = raw != null ? String(raw) : ''
  if (s.length <= TEACHING_DETAIL_HTML_MAX) return s
  return s.slice(0, TEACHING_DETAIL_HTML_MAX)
}

function withTeachingDetailFallback(p) {
  const html = p.detailHtml != null ? String(p.detailHtml).trim() : ''
  if (html) return { ...p, detailHtml: html }
  /** 详情页用 getTeachingMaterialDetailBodyHtml 再拼演示长图文，避免列表里塞大段 HTML */
  return { ...p, detailHtml: '' }
}

/** 详情页正文：优先总部 detailHtml，其次内置演示，最后封面+简介 */
export function getTeachingMaterialDetailBodyHtml(product) {
  if (!product || !product.id) return ''
  const d = String(product.detailHtml || '').trim()
  if (d) return d
  const demo = getTeachingProductDemoDetailHtml(product)
  if (demo) return demo
  return buildFallbackTeachingDetailHtml(product.name, product.desc, product.coverImageUrl || '')
}

function normalizeTeachingProductFromLs(raw) {
  if (!raw || typeof raw !== 'object') return null
  const id = String(raw.id || '').trim()
  if (!id) return null
  const price = Number(raw.price)
  return {
    id,
    name: String(raw.name || '未命名').trim() || '未命名',
    price: Number.isFinite(price) && price >= 0 ? Math.round(price * 100) / 100 : 0,
    tag: raw.tag != null ? String(raw.tag) : '',
    desc: raw.desc != null ? String(raw.desc) : '',
    detailHtml: clampTeachingDetailHtml(raw.detailHtml),
    emoji: raw.emoji != null ? String(raw.emoji).trim() : '',
    coverImageUrl: raw.coverImageUrl ? String(raw.coverImageUrl).trim() : '',
    coverGradientFrom: raw.coverGradientFrom ? String(raw.coverGradientFrom).trim() : '',
    coverGradientTo: raw.coverGradientTo ? String(raw.coverGradientTo).trim() : '',
    coverDot: raw.coverDot ? String(raw.coverDot).trim() : '',
    enabled: raw.enabled !== false,
  }
}

/**
 * 加盟商学具商城可见商品列表（含总部 localStorage 覆盖；仅返回上架项）。
 */
export function getFranchiseTeachingProductsCatalog() {
  try {
    const ls = localStorage.getItem(FRANCHISE_TEACHING_CATALOG_LS_KEY)
    if (!ls) return FRANCHISE_TEACHING_PRODUCTS.map((p) => withTeachingDetailFallback({ ...p }))
    const data = JSON.parse(ls)
    const arr = data?.products
    if (!Array.isArray(arr) || arr.length === 0)
      return FRANCHISE_TEACHING_PRODUCTS.map((p) => withTeachingDetailFallback({ ...p }))
    const mapped = arr.map(normalizeTeachingProductFromLs).filter(Boolean)
    const active = mapped.filter((p) => p.enabled)
    if (!active.length) return FRANCHISE_TEACHING_PRODUCTS.map((p) => withTeachingDetailFallback({ ...p }))
    /** 保持总部配置的数组顺序（不再使用 sortOrder） */
    return active.map((p) => withTeachingDetailFallback(p))
  } catch {
    return FRANCHISE_TEACHING_PRODUCTS.map((p) => withTeachingDetailFallback({ ...p }))
  }
}

/** 教具商城：人工智能相关教具（演示价格；可被总部「学具商品配置」覆盖） */
export const FRANCHISE_TEACHING_PRODUCTS = [
  {
    id: 'kit-ai-starter',
    name: 'AI启蒙传感学具套装',
    price: 680,
    tag: '',
    desc: '适合人工智能启蒙课堂：主控板、灯光、声音传感器与简易 AI 逻辑编程。',
    emoji: '🧩',
  },
  {
    id: 'robot-microbit',
    name: '人工智能 Micro:bit 编程学具',
    price: 298,
    tag: '',
    desc: '面向 AI 编程入门课堂，支持图形化编程、传感器交互与智能作品搭建。',
    emoji: '🤖',
  },
  {
    id: 'sensor-ai-kit',
    name: 'AI视觉与多模态传感器套装',
    price: 1280,
    tag: '',
    desc: '支持视觉、距离、声音等多模态 AI 感知实验，配套课堂实验报告模板。',
    emoji: '📡',
  },
  {
    id: 'jetson-nano-edu',
    name: '边缘人工智能实验主机',
    price: 3299,
    tag: '',
    desc: '用于边缘 AI 与轻量深度学习推理演示，含散热、电源与教育实验指引。',
    emoji: '🖥️',
  },
  {
    id: 'ai-xlab-pack',
    name: 'AI机器学习实验耗材包（班课装）',
    price: 458,
    tag: '',
    desc: '围绕机器学习数据采集、标注与分类实验设计，适配约 30 人 AI 班课。',
    emoji: '📦',
  },
  {
    id: 'drone-ai-lite',
    name: 'AI视觉循迹无人机（教育版）',
    price: 1899,
    tag: '',
    desc: '用于 AI 视觉循迹、定点巡航与智能控制入门，含安全护桨与课堂安全说明。',
    emoji: '🚁',
  },
]

const DEFAULT_TEACHING_ORDER_QTY_TIERS = [
  { minQty: 30, discountRate: 0.5, reduceYuan: 0 },
  { minQty: 20, discountRate: 0.8, reduceYuan: 0 },
  { minQty: 10, discountRate: 0.9, reduceYuan: 0 },
]

function normalizeTeachingQtyTierJs(t) {
  if (!t || typeof t !== 'object') return null
  const minQty = Math.max(0, Math.floor(Number(t.minQty) || 0))
  if (minQty <= 0) return null
  let discountRate = Number(t.discountRate)
  if (!Number.isFinite(discountRate) || discountRate > 1) discountRate = 1
  if (discountRate < 0.05) discountRate = 0.05
  const reduceYuan = Math.max(0, Math.round((Number(t.reduceYuan) || 0) * 100) / 100)
  if (reduceYuan > 0 && (t.discountRate == null || t.discountRate === '')) discountRate = 1
  return { minQty, discountRate, reduceYuan }
}

/**
 * 总部「学具商品配置」中的采购优惠（与 admin franchiseTeachingCatalog 同 Key）
 */
export function getTeachingMaterialDiscountPolicy() {
  try {
    const ls = localStorage.getItem(FRANCHISE_TEACHING_CATALOG_LS_KEY)
    if (!ls) {
      return {
        lineQuantityTiers: [],
        orderTotalQuantityTiers: DEFAULT_TEACHING_ORDER_QTY_TIERS.map((x) => ({ ...x })),
      }
    }
    const data = JSON.parse(ls)
    const raw = data?.discountPolicy
    const lineArr = Array.isArray(raw?.lineQuantityTiers) ? raw.lineQuantityTiers : []
    const lineQuantityTiers = lineArr.map(normalizeTeachingQtyTierJs).filter(Boolean)
    let orderTotalQuantityTiers
    if (!Array.isArray(raw?.orderTotalQuantityTiers)) {
      orderTotalQuantityTiers = DEFAULT_TEACHING_ORDER_QTY_TIERS.map((x) => ({ ...x }))
    } else {
      orderTotalQuantityTiers = raw.orderTotalQuantityTiers.map(normalizeTeachingQtyTierJs).filter(Boolean)
    }
    return { lineQuantityTiers, orderTotalQuantityTiers }
  } catch {
    return {
      lineQuantityTiers: [],
      orderTotalQuantityTiers: DEFAULT_TEACHING_ORDER_QTY_TIERS.map((x) => ({ ...x })),
    }
  }
}

function pickTeachingQtyTier(qty, tiers) {
  const q = Math.max(0, parseInt(String(qty), 10) || 0)
  const list = (tiers || []).filter((t) => t && t.minQty > 0)
  const sorted = [...list].sort((a, b) => b.minQty - a.minQty)
  for (const t of sorted) {
    if (q >= t.minQty) return { minQty: t.minQty, discountRate: t.discountRate, reduceYuan: t.reduceYuan || 0 }
  }
  return { minQty: 0, discountRate: 1, reduceYuan: 0 }
}

function teachingTierSummary(t) {
  if (!t || t.minQty <= 0) return ''
  const parts = []
  if (t.discountRate < 0.999) parts.push(`${Math.round(t.discountRate * 1000) / 10}折`)
  if (t.reduceYuan > 0) parts.push(`减¥${Number(t.reduceYuan).toFixed(2)}`)
  if (!parts.length) return ''
  return `满${t.minQty}件${parts.join('、')}`
}

/** 供前台展示阶梯文案 */
export function formatTeachingDiscountTier(t) {
  return teachingTierSummary(t)
}

/**
 * 学具购物车计价：先按「单行件数」阶梯处理每行，再按「整单总件数」阶梯处理合计。
 * @param {Array<{ productId: string, qty: number }>} cartLines
 * @param {Array<{ id: string, name?: string, price: number }>} catalog getFranchiseTeachingProductsCatalog()
 */
export function calculateTeachingMaterialOrderPricing(cartLines, catalog) {
  const policy = getTeachingMaterialDiscountPolicy()
  const lines = []
  let originalAmount = 0
  let totalQty = 0
  for (const row of cartLines || []) {
    const qty = Math.max(0, parseInt(String(row.qty), 10) || 0)
    if (!qty) continue
    const p = catalog.find((x) => x.id === row.productId)
    if (!p) continue
    const unitPrice = Number(p.price)
    const lineOriginal = Math.round(unitPrice * qty * 100) / 100
    originalAmount += lineOriginal
    totalQty += qty
    const ltier = pickTeachingQtyTier(qty, policy.lineQuantityTiers)
    const linePay = Math.max(
      0,
      Math.round((lineOriginal * ltier.discountRate - (ltier.reduceYuan || 0)) * 100) / 100,
    )
    lines.push({
      productId: p.id,
      name: p.name,
      qty,
      unitPrice,
      lineOriginal,
      linePay,
      lineDiscountLabel: teachingTierSummary(ltier),
    })
  }
  originalAmount = Math.round(originalAmount * 100) / 100
  const afterLineSubtotal = Math.round(lines.reduce((s, x) => s + x.linePay, 0) * 100) / 100
  const otier = pickTeachingQtyTier(totalQty, policy.orderTotalQuantityTiers)
  const payAmount = Math.max(
    0,
    Math.round((afterLineSubtotal * otier.discountRate - (otier.reduceYuan || 0)) * 100) / 100,
  )
  const orderDiscountLabel = teachingTierSummary(otier)
  const lineLabels = lines.filter((l) => l.lineDiscountLabel).map((l) => `${l.name}：${l.lineDiscountLabel}`)
  const orderPart = orderDiscountLabel ? `整单${orderDiscountLabel}` : ''
  const discountParts = [
    ...(lineLabels.length ? [`单行：${lineLabels.join('；')}`] : []),
    ...(orderPart ? [orderPart] : []),
  ]
  const discountLabel = discountParts.length ? discountParts.join('；') : '未达优惠门槛'
  const discountAmount = Math.round((originalAmount - payAmount) * 100) / 100
  const discountRate = originalAmount > 0 ? payAmount / originalAmount : 1
  return {
    originalAmount,
    payAmount,
    discountAmount,
    discountRate,
    discountLabel,
    totalQty,
    afterLineSubtotal,
    lines,
    orderDiscountLabel,
  }
}

/** @deprecated 仅整单件数阶梯（不含单行配置）；请优先使用 calculateTeachingMaterialOrderPricing */
export function getTeachingMaterialBulkDiscount(totalQty) {
  const policy = getTeachingMaterialDiscountPolicy()
  const t = pickTeachingQtyTier(totalQty, policy.orderTotalQuantityTiers)
  const label = teachingTierSummary(t)
  return {
    rate: t.discountRate,
    label: label || '未达整单件数门槛',
    threshold: t.minQty,
    reduceYuan: t.reduceYuan || 0,
  }
}

/** 整单件数阶梯：下一档还差几件（供学具商城横幅提示） */
export function getTeachingMaterialOrderTierHint(totalQty) {
  const policy = getTeachingMaterialDiscountPolicy()
  const tiers = [...policy.orderTotalQuantityTiers].filter((t) => t.minQty > 0).sort((a, b) => a.minQty - b.minQty)
  const q = Math.max(0, parseInt(String(totalQty), 10) || 0)
  if (!tiers.length) return '总部未配置整单件数优惠'
  const best = pickTeachingQtyTier(q, policy.orderTotalQuantityTiers)
  const highest = tiers[tiers.length - 1]
  if (best.minQty > 0 && best.minQty >= highest.minQty) return '已享整单最高阶梯'
  for (const t of tiers) {
    if (q < t.minQty) {
      const s = teachingTierSummary(t)
      return `再加 ${t.minQty - q} 件${s ? `：整单${s}` : ''}`
    }
  }
  return '已享整单优惠'
}

/** @deprecated 请使用 calculateTeachingMaterialOrderPricing，否则单行阶梯不会生效 */
export function calculateTeachingMaterialBulkPricing(originalAmount, totalQty) {
  const original = Math.round((Number(originalAmount) || 0) * 100) / 100
  const policy = getTeachingMaterialDiscountPolicy()
  const t = pickTeachingQtyTier(totalQty, policy.orderTotalQuantityTiers)
  const payable = Math.max(0, Math.round((original * t.discountRate - (t.reduceYuan || 0)) * 100) / 100)
  return {
    originalAmount: original,
    payAmount: payable,
    discountRate: t.discountRate,
    discountLabel: teachingTierSummary(t) || '未达整单件数门槛',
    discountAmount: Math.round((original - payable) * 100) / 100,
  }
}

function seedMaterialOrders(t0) {
  return [
    {
      id: 'MJ20240620001',
      items: [
        {
          productId: 'robot-microbit',
          name: '人工智能 Micro:bit 编程学具',
          qty: 5,
          unitPrice: 298,
          lineTotal: 1490,
        },
      ],
      payAmount: 1490,
      payMethod: 'balance',
      status: '已完成',
      createdAt: new Date(t0 - 86400000 * 8).toISOString(),
      receiverSnapshot: '机构收货 · 默认登记地址（演示）',
      shipments: [
        {
          at: new Date(t0 - 86400000 * 6).toISOString(),
          carrier: '顺丰速运',
          trackingNo: 'SF1666688888812',
          status: '已签收',
          remark: '已由前台代收',
        },
        {
          at: new Date(t0 - 86400000 * 7).toISOString(),
          carrier: '顺丰速运',
          trackingNo: 'SF1666688888812',
          status: '运输中',
          remark: '快件途中',
        },
        {
          at: new Date(t0 - 86400000 * 8).toISOString(),
          carrier: '',
          trackingNo: '',
          status: '待发货',
          remark: '仓库备货完成，等待揽收',
        },
      ],
    },
    {
      id: 'MJ20240626002',
      items: [
        {
          productId: 'sensor-ai-kit',
          name: 'AI视觉与多模态传感器套装',
          qty: 1,
          unitPrice: 1280,
          lineTotal: 1280,
        },
      ],
      payAmount: 1280,
      payMethod: 'wechat',
      status: '配送中',
      createdAt: new Date(t0 - 86400000 * 2).toISOString(),
      receiverSnapshot: '机构收货 · 默认登记地址（演示）',
      shipments: [
        {
          at: new Date(t0 - 86400000 * 1).toISOString(),
          carrier: '京东物流',
          trackingNo: 'JDVV8888888888',
          status: '运输中',
          remark: '到达区域分拨中心',
        },
        {
          at: new Date(t0 - 86400000 * 2).toISOString(),
          carrier: '',
          trackingNo: '',
          status: '待发货',
          remark: '已下单（微信支付演示成功）',
        },
      ],
    },
  ]
}

export function getPartnerSession() {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) return null
  const s = safeParse(raw, null)
  if (!s?.partnerId) return null
  /**
   * 演示主号 13800138000：自愈子账号标记、861… 前缀等，避免侧栏「机构账号」被误判隐藏。
   */
  const rawDigits = String(s.phone || '').replace(/\D/g, '')
  const digits = normalizePartnerPhoneDigits(s.phone)
  const staffSub = s.staffSubUser === true
  const isPreviewMain = digits === FRANCHISE_PREVIEW_DEMO_MAIN_PHONE
  if (isPreviewMain && (staffSub || rawDigits !== FRANCHISE_PREVIEW_DEMO_MAIN_PHONE)) {
    const cleaned = { ...s, phone: FRANCHISE_PREVIEW_DEMO_MAIN_PHONE }
    delete cleaned.staffSubUser
    delete cleaned.staffName
    delete cleaned.staffRoleId
    delete cleaned.staffRoleName
    delete cleaned.staffMenuKeys
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(cleaned))
      window.dispatchEvent(new Event('franchise-partner-session-changed'))
    } catch {
      return s
    }
    return cleaned
  }
  return s
}

export function setPartnerSession(payload) {
  if (typeof window === 'undefined') return
  const raw = JSON.stringify(payload)
  try {
    localStorage.setItem(SESSION_KEY, raw)
  } catch (e) {
    console.error(e)
    throw new Error('无法保存登录状态：浏览器可能禁止本地存储或空间已满')
  }
  window.dispatchEvent(new Event('franchise-partner-session-changed'))
}

export function clearPartnerSession() {
  localStorage.removeItem(SESSION_KEY)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('franchise-partner-session-changed'))
  }
}

/** 机构总管理从「新标签页」打开校区工作台时，先写入此键，加盟商 Layout 首帧消费并转为正式会话 */
const PENDING_FRANCHISE_PARTNER_SESSION_KEY = 'bingo_franchise_partner_pending_session_v1'

export function queuePartnerSessionForNewTab(sessionPayload) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(PENDING_FRANCHISE_PARTNER_SESSION_KEY, JSON.stringify(sessionPayload))
  } catch (e) {
    console.error(e)
  }
}

/** 消费待注入的加盟商会话（幂等：无键则 false） */
export function consumeQueuedPartnerSessionIfPresent() {
  if (typeof window === 'undefined') return false
  let raw = null
  try {
    raw = localStorage.getItem(PENDING_FRANCHISE_PARTNER_SESSION_KEY)
  } catch {
    return false
  }
  if (!raw) return false
  try {
    localStorage.removeItem(PENDING_FRANCHISE_PARTNER_SESSION_KEY)
  } catch {
    /* 仍尝试应用 */
  }
  try {
    const p = JSON.parse(raw)
    if (p && typeof p === 'object' && p.partnerId) {
      setPartnerSession(p)
      return true
    }
  } catch {
    /* ignore */
  }
  return false
}

const DEMO_STORAGE_PREFIX = 'bingo_franchise'

/**
 * 清除当前域名下所有加盟商演示相关 localStorage / sessionStorage（键名以 bingo_franchise 开头）。
 * 无法替你操作浏览器远程删除，请在登录页点此功能或本地调用。
 * @returns {{ ok: boolean, cleared: number }}
 */
export function clearFranchisePartnerDemoStorage() {
  if (typeof window === 'undefined') return { ok: false, cleared: 0 }
  let cleared = 0
  const wipe = (storage) => {
    const keys = []
    try {
      for (let i = 0; i < storage.length; i++) {
        const k = storage.key(i)
        if (k && k.startsWith(DEMO_STORAGE_PREFIX)) keys.push(k)
      }
    } catch {
      return
    }
    for (const k of keys) {
      try {
        storage.removeItem(k)
        cleared++
      } catch {
        /* ignore */
      }
    }
  }
  try {
    wipe(localStorage)
    wipe(sessionStorage)
  } catch {
    return { ok: false, cleared }
  }
  try {
    window.dispatchEvent(new Event('franchise-partner-session-changed'))
  } catch {
    /* ignore */
  }
  return { ok: true, cleared }
}

/** 演示：本地保存登录密码（正式环境由服务端鉴权） */
const PARTNER_CREDS_KEY = 'bingo_franchise_partner_creds_v1'

/**
 * 总部手动开户档案（演示）：手机号 → { partnerId, refCode, orgName, contactName }
 * 与后台写入的 Key 一致；须同源 localStorage 加盟商前台才可读取。
 */
const PARTNER_PROVISION_KEY = 'bingo_franchise_partner_provision_v1'

function loadPartnerProvisionMap() {
  if (typeof window === 'undefined') return {}
  try {
    const o = safeParse(localStorage.getItem(PARTNER_PROVISION_KEY), {})
    return o && typeof o === 'object' && !Array.isArray(o) ? o : {}
  } catch {
    return {}
  }
}

/** 构建登录后写入 SESSION 的档案（优先用手动开户信息） */
export function buildPartnerSessionPayloadForLogin(phoneDigits) {
  const p = normalizePartnerPhoneDigits(phoneDigits)
  const row = loadPartnerProvisionMap()[p]
  if (row?.partnerId && row?.refCode) {
    const masked = `${p.slice(0, 3)}****${p.slice(-4)}`
    return {
      partnerId: String(row.partnerId),
      refCode: String(row.refCode),
      phone: p,
      orgName:
        row.orgName?.trim() ||
        `缤果AI学院·加盟商（${masked}）`,
      contactName: row.contactName?.trim() || '管理员',
      qualificationSnapshot:
        row.qualificationSnapshot && typeof row.qualificationSnapshot === 'object' && !Array.isArray(row.qualificationSnapshot)
          ? row.qualificationSnapshot
          : null,
      qualificationStatus: row.qualificationStatus ? String(row.qualificationStatus) : '',
      loginAt: new Date().toISOString(),
    }
  }
  /** 预览默认号：固定机构名与 refCode，便于学具/机构账号等数据与 localStorage 桶一致 */
  if (p === FRANCHISE_PREVIEW_DEMO_MAIN_PHONE) {
    return {
      partnerId: 'p_13800138000',
      refCode: 'FJ-QISI-DEMO',
      phone: p,
      orgName: '启思博雅教育中心',
      contactName: '管理员',
      loginAt: new Date().toISOString(),
    }
  }
  const refCode = `FJ-${p.slice(-4)}-${Date.now().toString(36).slice(-4).toUpperCase()}`
  const partnerId = `p_${p}`
  const masked = `${p.slice(0, 3)}****${p.slice(-4)}`
  return {
    partnerId,
    refCode,
    phone: p,
    orgName: `缤果AI学院·加盟商（${masked}）`,
    contactName: '管理员',
    loginAt: new Date().toISOString(),
  }
}

/** 与即将写入会话的 partnerId 一致，用于登录前冻结校验 */
export function getResolvedPartnerIdForPhoneLogin(phoneDigits) {
  const p = normalizePartnerPhoneDigits(phoneDigits)
  const row = loadPartnerProvisionMap()[p]
  if (row?.partnerId && row?.refCode) return String(row.partnerId)
  return `p_${p}`
}

/**
 * 总部对加盟商账户状态（演示 localStorage，须与 admin 同步 Key）
 * { [partnerId]: { accountStatus: 'normal' | 'pending_qualification' | 'frozen' } }
 */
const FRANCHISE_HQ_PARTNER_ACCOUNT_LS_KEY = 'bingo_franchise_hq_partner_account_v1'

function loadHqPartnerAccountMap() {
  if (typeof window === 'undefined') return {}
  try {
    const o = safeParse(localStorage.getItem(FRANCHISE_HQ_PARTNER_ACCOUNT_LS_KEY), {})
    return o && typeof o === 'object' && !Array.isArray(o) ? o : {}
  } catch {
    return {}
  }
}

let demoHqPartnerAccountSeedApplied = false

/** 与 admin INITIAL 保持一致：仅当 LS 尚无该 partnerId 时补种，便于未打开后台也能演示冻结 */
function ensureDemoHqPartnerAccountSeed() {
  if (demoHqPartnerAccountSeedApplied || typeof window === 'undefined') return
  demoHqPartnerAccountSeedApplied = true
  try {
    const all = loadHqPartnerAccountMap()
    /** 后台建档为 fp-bj-003；无开户档案时登录 partnerId 为 p_13700137003，两处均种子冻结以便演示 */
    const ids = ['fp-bj-003', 'p_13700137003']
    let changed = false
    for (const id of ids) {
      if (!all[id]) {
        all[id] = { accountStatus: 'frozen' }
        changed = true
      }
    }
    if (changed) localStorage.setItem(FRANCHISE_HQ_PARTNER_ACCOUNT_LS_KEY, JSON.stringify(all))
  } catch {
    /* ignore */
  }
}

export function isPartnerAccountFrozen(partnerId) {
  ensureDemoHqPartnerAccountSeed()
  const pid = String(partnerId || '').trim()
  if (!pid) return false
  const row = loadHqPartnerAccountMap()[pid]
  return row?.accountStatus === 'frozen'
}

/** 总部演示：写入账户状态；冻结后加盟前台禁止登录与业务写操作 */
export function setHqPartnerAccountStatus(partnerId, accountStatus) {
  const pid = String(partnerId || '').trim()
  if (!pid) return { ok: false, msg: '无效加盟商' }
  const allowed = ['normal', 'pending_qualification', 'frozen']
  if (!allowed.includes(accountStatus)) return { ok: false, msg: '无效状态' }
  try {
    const all = loadHqPartnerAccountMap()
    all[pid] = { accountStatus }
    localStorage.setItem(FRANCHISE_HQ_PARTNER_ACCOUNT_LS_KEY, JSON.stringify(all))
    window.dispatchEvent(new Event('franchise-partner-session-changed'))
    return { ok: true }
  } catch {
    return { ok: false, msg: '写入失败' }
  }
}

function assertPartnerNotFrozen(partnerId) {
  if (isPartnerAccountFrozen(partnerId)) {
    return { ok: false, msg: '账号已被总部冻结，暂时无法使用该功能。请联系总部。' }
  }
  return null
}

/** 防止 localStorage 里曾是 `null`、数组等非法形状导致 creds[p] 抛错 */
function normalizePartnerCreds(parsed) {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
  return parsed
}

function loadPartnerCreds() {
  if (typeof window === 'undefined') return {}
  try {
    return normalizePartnerCreds(safeParse(localStorage.getItem(PARTNER_CREDS_KEY), {}))
  } catch {
    /* Safari 无痕 / 禁用存储时 getItem 可能抛错 */
    return {}
  }
}

/** @returns {boolean} 是否写入成功 */
function savePartnerCreds(creds) {
  if (typeof window === 'undefined') return false
  try {
    localStorage.setItem(PARTNER_CREDS_KEY, JSON.stringify(creds))
    return true
  } catch {
    return false
  }
}

/** 登录页短信演示：验证码存 sessionStorage，5 分钟内有效（正式环境对接短信网关） */
const SMS_LOGIN_KEY = (p) => `bingo_franchise_partner_sms_login_${p}`

/**
 * 发送登录短信验证码（本地演示）
 * @returns {{ ok: true, demoCode: string } | { ok: false, msg: string }}
 */
export function sendPartnerLoginSmsCode(phoneDigits) {
  const p = String(phoneDigits || '').replace(/\D/g, '')
  if (p.length !== 11) return { ok: false, msg: '请输入11位手机号' }
  const code = String(Math.floor(100000 + Math.random() * 900000))
  const exp = Date.now() + 5 * 60 * 1000
  try {
    sessionStorage.setItem(SMS_LOGIN_KEY(p), JSON.stringify({ code, exp }))
  } catch {
    return { ok: false, msg: '无法写入验证码状态，请检查浏览器是否禁用存储' }
  }
  return { ok: true, demoCode: code }
}

/**
 * 校验短信验证码并完成「可登录」判定（不写入密码表）
 * @returns {{ ok: true } | { ok: false, msg: string }}
 */
export function verifyPartnerLoginSmsCode(phoneDigits, codeInput) {
  const p = String(phoneDigits || '').replace(/\D/g, '')
  if (p.length !== 11) return { ok: false, msg: '手机号格式异常' }
  const input = String(codeInput || '').replace(/\s/g, '')
  if (input.length < 4) return { ok: false, msg: '请输入验证码' }
  let raw
  try {
    raw = sessionStorage.getItem(SMS_LOGIN_KEY(p))
  } catch {
    return { ok: false, msg: '无法读取验证码状态' }
  }
  if (!raw) return { ok: false, msg: '请先获取验证码' }
  const row = safeParse(raw, null)
  if (!row?.code) return { ok: false, msg: '请先获取验证码' }
  if (Date.now() > (row.exp || 0)) {
    try {
      sessionStorage.removeItem(SMS_LOGIN_KEY(p))
    } catch {
      /* ignore */
    }
    return { ok: false, msg: '验证码已过期，请重新获取' }
  }
  if (input !== String(row.code)) return { ok: false, msg: '验证码错误' }
  try {
    sessionStorage.removeItem(SMS_LOGIN_KEY(p))
  } catch {
    /* ignore */
  }
  return { ok: true }
}

/** 登录时校验；无记录则写入当前密码（首次登录即注册） */
export function verifyOrRegisterPartnerLogin(phoneDigits, password) {
  try {
    const p = String(phoneDigits || '').replace(/\D/g, '')
    if (p.length !== 11) return { ok: false, msg: '请输入正确的11位手机号' }
    if (String(password).length < 6) return { ok: false, msg: '密码至少 6 位' }
    const creds = loadPartnerCreds()
    if (creds[p]) {
      if (creds[p] !== password) return { ok: false, msg: '密码错误，请重新输入' }
      return { ok: true }
    }
    creds[p] = password
    if (!savePartnerCreds(creds)) {
      return {
        ok: false,
        msg: '无法保存账号信息：存储已满或被禁用。请在浏览器设置中允许本站使用本地存储，或清理本站数据后重试。',
      }
    }
    return { ok: true }
  } catch {
    return {
      ok: false,
      msg: '登录校验失败：浏览器可能禁止了本地存储，请关闭无痕窗口或允许本站存储。',
    }
  }
}

export function hasPartnerPasswordStored(phoneDigits) {
  const p = String(phoneDigits || '').replace(/\D/g, '')
  if (p.length !== 11) return false
  return Boolean(loadPartnerCreds()[p])
}

/** 修改登录密码；本地尚无记录时仅需新密码与确认一致即可写入 */
export function updatePartnerAccountPassword(phoneDigits, oldPassword, newPassword, confirmPassword) {
  const p = String(phoneDigits || '').replace(/\D/g, '')
  if (p.length !== 11) return { ok: false, msg: '账号数据异常' }
  if (String(newPassword).length < 6) return { ok: false, msg: '新密码至少 6 位' }
  if (newPassword !== confirmPassword) return { ok: false, msg: '两次输入的新密码不一致' }
  const creds = loadPartnerCreds()
  if (creds[p]) {
    if (creds[p] !== oldPassword) return { ok: false, msg: '原密码不正确' }
  }
  creds[p] = newPassword
  if (!savePartnerCreds(creds)) {
    return { ok: false, msg: '无法保存新密码，请清理浏览器存储空间或允许本站使用本地存储' }
  }
  return { ok: true }
}

/**
 * 总部/演示后台：直接覆盖某手机号的加盟商主号登录密码（不校验原密码）。
 * 仅用于管理端运维；正式环境应对接鉴权与审计接口。
 */
export function adminSetPartnerMainLoginPassword(phoneDigits, newPassword) {
  const p = normalizePartnerPhoneDigits(phoneDigits)
  if (p.length !== 11) return { ok: false, msg: '请输入11位手机号' }
  const pw = String(newPassword || '')
  if (pw.length < 6) return { ok: false, msg: '新密码至少 6 位' }
  const creds = loadPartnerCreds()
  creds[p] = pw
  if (!savePartnerCreds(creds)) {
    return { ok: false, msg: '无法保存新密码，请检查浏览器本地存储' }
  }
  return { ok: true }
}

export function displayPartnerOrgName(session) {
  if (!session) return 'BingoAI学院·加盟商'
  if (session.orgName) return session.orgName
  const p = String(session.phone || '').replace(/\D/g, '')
  if (p.length >= 11) return `加盟商（${p.slice(0, 3)}****${p.slice(-4)}）`
  return 'BingoAI学院·加盟商'
}

/** 加盟资质：已通过快照 + 可选待审变更（二次审核期间仍按已通过快照履约，见业务说明） */
export function buildDefaultInstitutionQualification(partnerId, refCode) {
  const session = typeof window !== 'undefined' ? getPartnerSession() : null
  const same = session?.partnerId === partnerId
  const orgName =
    same && session?.orgName?.trim()
      ? session.orgName.trim()
      : `缤果AI学院·合作机构（${refCode || partnerId}）`
  const contactPhone = same && session?.phone ? String(session.phone) : '13800138000'
  const provisionSnapshot =
    same &&
    session?.qualificationSnapshot &&
    typeof session.qualificationSnapshot === 'object' &&
    !Array.isArray(session.qualificationSnapshot)
      ? session.qualificationSnapshot
      : null
  if (provisionSnapshot) {
    const complete = session?.qualificationStatus === 'approved'
    return {
      reviewStatus: complete ? 'approved' : 'pending_initial',
      lastApprovedAt: complete ? new Date().toISOString() : undefined,
      rejectReason: null,
      approvedSnapshot: {
        businessLicenseAttachment: null,
        venueFrontPhotoAttachment: null,
        venueClassroomPhotoAttachment: null,
        schoolPermitAttachment: null,
        ...provisionSnapshot,
        orgName: provisionSnapshot.orgName || orgName,
        contactPhone: provisionSnapshot.contactPhone || contactPhone,
      },
      pendingReview: null,
    }
  }
  return {
    reviewStatus: 'approved',
    lastApprovedAt: new Date().toISOString(),
    rejectReason: null,
    approvedSnapshot: {
      orgName,
      legalRepresentative: '王小明',
      address: '上海市浦东新区张江高科技园区科苑路 88 号 2 号楼',
      contactPhone,
      businessLicenseNumber: '91310000MA1FLXXXXX',
      businessLicenseCopy: '（示例）扫描件已存档：营业执照_正副本合订.pdf',
      businessScope: '科技类培训、教育信息咨询、非学历文化知识辅导、教育软件开发。',
      businessLicenseAttachment: null,
      principalName: '王小明',
      principalPhone: contactPhone,
      principalIdNumber: '310101********1234',
      venueFrontPhotoAttachment: null,
      venueClassroomPhotoAttachment: null,
      isAiTechTrack: 'yes',
      existingProjects: '少儿编程、机器人搭建、AI 通识体验课。',
      studentCount: '120',
      studentAgeRange: '6-14 岁',
      hasDedicatedClassroom: 'yes',
      schoolPermitAttachment: null,
    },
    pendingReview: null,
  }
}

function ensureInstitutionQualification(ws, partnerId, refCode) {
  const snap = ws.institutionQualification?.approvedSnapshot
  if (snap && typeof snap.orgName === 'string' && snap.orgName.length > 0) return false
  ws.institutionQualification = buildDefaultInstitutionQualification(partnerId, refCode)
  return true
}

const INSTITUTION_FIELD_LABELS = {
  orgName: '机构名称',
  legalRepresentative: '法定代表人',
  address: '机构地址',
  contactPhone: '联系人电话',
  businessLicenseNumber: '营业执照注册号/统一社会信用代码',
  businessScope: '经营范围',
  principalName: '负责人姓名',
  principalPhone: '负责人电话',
  principalIdNumber: '负责人身份证号',
  isAiTechTrack: '是否属于 AI / 科技赛道',
  existingProjects: '已开办项目',
  studentCount: '现有生源数量',
  studentAgeRange: '现有生源年龄段',
  hasDedicatedClassroom: '是否设立加盟专用教室',
}

/** 营业执照附件（演示存 localStorage；正式环境应为 OSS URL） */
const MAX_LICENSE_DATA_URL_CHARS = 5 * 1024 * 1024

const ATTACHMENT_KEYS = [
  'businessLicenseAttachment',
  'venueFrontPhotoAttachment',
  'venueClassroomPhotoAttachment',
  'schoolPermitAttachment',
]

/** 防止超大 base64 拖垮页面：超限则移除附件仅保留文字字段 */
function stripOversizedLicenseAttachments(ws) {
  let changed = false
  const iq = ws.institutionQualification
  if (!iq) return false
  const stripSnap = (snap) => {
    if (!snap || typeof snap !== 'object') return
    for (const key of ATTACHMENT_KEYS) {
      const du = snap[key]?.dataUrl
      if (typeof du === 'string' && du.length > MAX_LICENSE_DATA_URL_CHARS) {
        snap[key] = null
        changed = true
      }
    }
  }
  stripSnap(iq.approvedSnapshot)
  if (iq.pendingReview?.snapshot) stripSnap(iq.pendingReview.snapshot)
  return changed
}

function sanitizeAttachmentFileName(name, fallback = '审核附件') {
  const s = String(name || fallback).replace(/[/\\?%*:|"<>]/g, '_').trim()
  return (s || fallback).slice(0, 180)
}

function normalizeReviewAttachment(raw, label = '审核附件') {
  if (!raw || typeof raw !== 'object') return null
  const dataUrl = raw.dataUrl
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) return null
  if (dataUrl.length > MAX_LICENSE_DATA_URL_CHARS) return { error: `${label}文件过大，请使用 4MB 以内的 PDF 或图片` }
  return {
    fileName: sanitizeAttachmentFileName(raw.fileName, label),
    dataUrl,
  }
}

/**
 * 提交机构资质（首次或变更）。已通过加盟审核后再次提交进入 pending_update，总部复审期间不影响售课与开班。
 */
export function submitInstitutionQualificationUpdate(partnerId, refCode, snapshot) {
  const fr = assertPartnerNotFrozen(partnerId)
  if (fr) return fr
  const ws = getWorkspace(partnerId, refCode)
  const iq = ws.institutionQualification
  if (!iq) return { ok: false, msg: '机构数据未就绪，请刷新页面重试' }

  const required = [
    'orgName',
    'legalRepresentative',
    'address',
    'contactPhone',
    'businessLicenseNumber',
    'businessScope',
    'principalName',
    'principalPhone',
    'principalIdNumber',
    'isAiTechTrack',
    'existingProjects',
    'studentCount',
    'studentAgeRange',
    'hasDedicatedClassroom',
  ]
  for (const key of required) {
    if (!String(snapshot[key] ?? '').trim()) {
      return { ok: false, msg: `请填写「${INSTITUTION_FIELD_LABELS[key] || key}」` }
    }
  }

  const attachment = normalizeReviewAttachment(snapshot.businessLicenseAttachment, '营业执照')
  if (attachment?.error) return { ok: false, msg: attachment.error }
  const venueFrontPhotoAttachment = normalizeReviewAttachment(snapshot.venueFrontPhotoAttachment, '门头照片')
  if (venueFrontPhotoAttachment?.error) return { ok: false, msg: venueFrontPhotoAttachment.error }
  const venueClassroomPhotoAttachment = normalizeReviewAttachment(snapshot.venueClassroomPhotoAttachment, '教室照片')
  if (venueClassroomPhotoAttachment?.error) return { ok: false, msg: venueClassroomPhotoAttachment.error }
  const schoolPermitAttachment = normalizeReviewAttachment(snapshot.schoolPermitAttachment, '办学许可证')
  if (schoolPermitAttachment?.error) return { ok: false, msg: schoolPermitAttachment.error }

  const copyTrim = String(snapshot.businessLicenseCopy ?? '').trim()
  if (!attachment) {
    return {
      ok: false,
      msg: '请上传营业执照电子版（PDF 或图片）',
    }
  }
  if (!venueFrontPhotoAttachment) return { ok: false, msg: '请上传场地门头照片' }
  if (!venueClassroomPhotoAttachment) return { ok: false, msg: '请上传教室照片' }

  const clean = {
    orgName: String(snapshot.orgName).trim(),
    legalRepresentative: String(snapshot.legalRepresentative).trim(),
    address: String(snapshot.address).trim(),
    contactPhone: String(snapshot.contactPhone).replace(/\s/g, '').trim(),
    businessLicenseNumber: String(snapshot.businessLicenseNumber).trim(),
    businessLicenseCopy: copyTrim,
    businessScope: String(snapshot.businessScope).trim(),
    businessLicenseAttachment: attachment || null,
    principalName: String(snapshot.principalName).trim(),
    principalPhone: String(snapshot.principalPhone).replace(/\s/g, '').trim(),
    principalIdNumber: String(snapshot.principalIdNumber).trim(),
    venueFrontPhotoAttachment,
    venueClassroomPhotoAttachment,
    isAiTechTrack: snapshot.isAiTechTrack === 'yes' ? 'yes' : 'no',
    existingProjects: String(snapshot.existingProjects).trim(),
    studentCount: String(snapshot.studentCount).trim(),
    studentAgeRange: String(snapshot.studentAgeRange).trim(),
    hasDedicatedClassroom: snapshot.hasDedicatedClassroom === 'yes' ? 'yes' : 'no',
    schoolPermitAttachment: schoolPermitAttachment || null,
  }

  iq.pendingReview = {
    submittedAt: new Date().toISOString(),
    snapshot: clean,
  }

  /** 曾存在总部认可的生效资质（含「被驳回但旧证仍有效」）→ 走资质变更复审，复审期间不影响售课与开班 */
  const hasEstablishedLine =
    iq.lastApprovedAt &&
    iq.approvedSnapshot &&
    (iq.reviewStatus === 'approved' ||
      iq.reviewStatus === 'pending_update' ||
      iq.reviewStatus === 'rejected')
  iq.reviewStatus = hasEstablishedLine ? 'pending_update' : 'pending_initial'
  iq.rejectReason = null

  saveWorkspace(partnerId, ws)
  return { ok: true, ws }
}

/** 演示：总部审核通过，将待审内容合并为生效资质 */
export function simulateInstitutionQualificationApprove(partnerId, refCode) {
  const ws = getWorkspace(partnerId, refCode)
  const iq = ws.institutionQualification
  if (!iq?.pendingReview?.snapshot) return { ok: false, msg: '当前没有待审核的资质提交' }

  iq.approvedSnapshot = { ...iq.pendingReview.snapshot }
  iq.lastApprovedAt = new Date().toISOString()
  iq.pendingReview = null
  iq.reviewStatus = 'approved'
  iq.rejectReason = null
  saveWorkspace(partnerId, ws)

  const s = getPartnerSession()
  if (s?.partnerId === partnerId) {
    setPartnerSession({ ...s, orgName: iq.approvedSnapshot.orgName })
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('franchise-partner-session-changed'))
    }
  }
  return { ok: true, ws }
}

/** 演示：总部驳回（生效资质不变，可修改后再次提交） */
export function simulateInstitutionQualificationReject(partnerId, refCode, reason) {
  const ws = getWorkspace(partnerId, refCode)
  const iq = ws.institutionQualification
  if (!iq?.pendingReview) return { ok: false, msg: '当前没有待审核的资质提交' }

  iq.pendingReview = null
  iq.reviewStatus = 'rejected'
  iq.rejectReason = String(reason || '请根据总部反馈意见修改后重新提交。').trim()
  saveWorkspace(partnerId, ws)
  return { ok: true, ws }
}

/**
 * 总部按加盟商配置的充课折扣（演示 localStorage；须与 admin/src/mock/franchiseHqCourseDiscounts.ts Key 一致）
 * 形状：{ [partnerId]: { [courseId]: rate } }，rate 为 0～1 的系数（如 0.85 即 8.5 折）
 */
const FRANCHISE_HQ_COURSE_DISCOUNTS_LS_KEY = 'bingo_franchise_hq_course_discounts_v1'

function loadHqCourseDiscountMap() {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(FRANCHISE_HQ_COURSE_DISCOUNTS_LS_KEY)
    if (!raw) return {}
    const o = JSON.parse(raw)
    return o && typeof o === 'object' && !Array.isArray(o) ? o : {}
  } catch {
    return {}
  }
}

/** 将折扣系数转为展示文案（如 0.8 → 8折，0.75 → 7.5折） */
function rateToDiscountLabel(rate) {
  if (!Number.isFinite(rate) || rate >= 0.9995) return '原价'
  if (rate <= 0) return '原价'
  const zhe = Math.round(rate * 100) / 10
  if (Math.abs(zhe - Math.round(zhe)) < 1e-6) return `${Math.round(zhe)}折`
  return `${zhe}折`
}

/** 工作台默认 + 总部覆盖后的生效折扣行（用于充课、推广页、折扣查看） */
function getEffectiveDiscountRows(ws) {
  const partnerId = ws?.partnerId
  const base = ws?.courseDiscounts || []
  const baseMap = new Map(base.map((d) => [d.courseId, d]))
  const hqAll = loadHqCourseDiscountMap()
  const hq = partnerId && hqAll[partnerId] && typeof hqAll[partnerId] === 'object' ? hqAll[partnerId] : null

  return FRANCHISE_PROMOTABLE_COURSES.map((c) => {
    const baseRow = baseMap.get(c.id)
    let rate = baseRow?.rate ?? 1
    let label = baseRow?.label
    if (hq && Object.prototype.hasOwnProperty.call(hq, c.id)) {
      const r = Number(hq[c.id])
      if (Number.isFinite(r) && r > 0 && r <= 1) {
        rate = Math.round(r * 1000) / 1000
        label = rateToDiscountLabel(rate)
      }
    }
    if (!label) label = rateToDiscountLabel(rate)
    return { courseId: c.id, rate, label }
  })
}

export function getDiscountRate(ws, courseId) {
  const row = getEffectiveDiscountRows(ws).find((d) => d.courseId === courseId)
  return row?.rate ?? 1
}

export function getDiscountLabel(ws, courseId) {
  const row = getEffectiveDiscountRows(ws).find((d) => d.courseId === courseId)
  return row?.label || '原价'
}

/** 本月订单数 */
export function computeMonthOrderCount(ws) {
  if (!ws?.orders?.length) return 0
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()
  return ws.orders.filter((o) => {
    const d = new Date(o.createdAt)
    return d.getFullYear() === y && d.getMonth() === m
  }).length
}

function defaultWorkspace(partnerId, refCode) {
  const t0 = Date.now()
  const courseDiscounts = [
    { courseId: 'ai-enlighten', rate: 0.8, label: '8折' },
    { courseId: 'ai-advance-basic', rate: 0.75, label: '75折' },
    { courseId: 'ai-advance-ml', rate: 0.75, label: '75折' },
    { courseId: 'ai-programming', rate: 0.85, label: '85折' },
  ]

  const mkOrder = (id, studentName, courseId, status, daysAgo) => {
    const c = FRANCHISE_PROMOTABLE_COURSES.find((x) => x.id === courseId)
    const rate = getDiscountRate({ courseDiscounts }, courseId)
    const originalPrice = c.price
    const payAmount = Math.round(originalPrice * rate * 100) / 100
    const discountLabel = getDiscountLabel({ courseDiscounts }, courseId)
    return {
      id,
      studentName,
      courseId,
      courseName: c.name,
      originalPrice,
      discountLabel,
      payAmount,
      status,
      createdAt: new Date(t0 - 86400000 * daysAgo).toISOString(),
    }
  }

  const orders = [
    mkOrder('DD20240628001', '张同学', 'ai-enlighten', '已完成', 2),
    mkOrder('DD20240627088', '李同学', 'ai-advance-basic', '已完成', 5),
    mkOrder('DD20240626052', '王同学', 'ai-programming', '处理中', 1),
    mkOrder('DD20240625033', '赵同学', 'ai-advance-ml', '已完成', 12),
    mkOrder('DD20240620019', '张同学', 'ai-programming', '已完成', 18),
  ]

  const totalOut = orders.filter((o) => o.status === '已完成').reduce((s, o) => s + o.payAmount, 0)
  const balance = 32560.0
  const openingTopUp = Math.round((balance + totalOut) * 100) / 100

  return {
    schemaVersion: 2,
    partnerId,
    refCode,
    balance,
    frozen: 0,
    courseDiscounts,
    announcements: [
      { id: 'a1', title: '关于开展暑期 AI 特色课的通知', date: '2024-06-01', isNew: false },
      { id: 'a2', title: '新课程包上线 · 折扣已同步', date: '2024-06-28', isNew: true },
      { id: 'a3', title: '充课流程说明：线下收款后请在 48 小时内完成后台充课', date: '2024-06-20', isNew: false },
    ],
    orders,
    ledger: (() => {
      const completedSorted = orders
        .filter((o) => o.status === '已完成')
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      let running = openingTopUp
      const chargeRows = []
      for (const o of completedSorted) {
        running = Math.round((running - o.payAmount) * 100) / 100
        chargeRows.push({
          id: `l-${o.id}`,
          type: 'recharge_course',
          title: `充课 · ${o.studentName} · ${o.courseName}`,
          amount: -o.payAmount,
          balanceAfter: running,
          createdAt: o.createdAt,
        })
      }
      return [
        {
          id: 'l-open',
          type: 'topup',
          title: '总部账户充值（演示）',
          amount: openingTopUp,
          balanceAfter: openingTopUp,
          createdAt: new Date(t0 - 86400000 * 60).toISOString(),
        },
        ...chargeRows.reverse(),
      ]
    })(),
    withdrawals: [],
    classes: [
      {
        id: 'cls-1',
        name: '周六上午 · AI启蒙体验班',
        studentIds: ['stu-1', 'stu-2'],
        createdAt: new Date(t0 - 86400000 * 30).toISOString(),
        courseType: '素养启蒙',
        startDate: '',
        offlineCourseId: 'ai-enlighten',
        offlineCourseIds: ['ai-enlighten'],
        offlineCourseName: '《AI启蒙：走进智能世界》',
        offlineLessons: getOfflineLessonTemplate('ai-enlighten').map((l, i) =>
          i < 2 ? { ...l, done: true } : l,
        ),
      },
      {
        id: 'cls-2',
        name: '暑期 · AI竞赛冲刺班',
        studentIds: ['stu-3'],
        createdAt: new Date(t0 - 86400000 * 7).toISOString(),
        courseType: '竞赛培优',
        startDate: '',
        offlineCourseId: 'ai-advance-basic',
        offlineCourseIds: ['ai-advance-basic', 'ai-advance-ml'],
        offlineCourseName: '《AI基础原理与应用》、《机器学习入门与实战》',
        offlineLessons: getMergedOfflineLessonTemplates(['ai-advance-basic', 'ai-advance-ml']).map((l, i) =>
          i < 4 ? { ...l, done: true } : l,
        ),
      },
      {
        id: 'cls-3',
        name: '周三晚 · AI编程基础班',
        studentIds: [],
        createdAt: new Date(t0 - 86400000 * 3).toISOString(),
        courseType: '编程入门',
        startDate: '',
        offlineCourseId: 'ai-programming',
        offlineCourseIds: ['ai-programming'],
        offlineCourseName: 'AI编程入门课',
        offlineLessons: getOfflineLessonTemplate('ai-programming'),
      },
    ],
    students: [
      {
        id: 'stu-1',
        phone: '13800138001',
        name: '张同学',
        classId: 'cls-1',
        enrollments: [
          {
            courseId: 'ai-enlighten',
            progressPct: 75,
            status: '学习中',
            purchasedAt: new Date(t0 - 86400000 * 21).toISOString(),
            lastStudyAt: new Date(t0 - 3600000).toISOString(),
          },
        ],
      },
      {
        id: 'stu-2',
        phone: '13800138002',
        name: '李同学',
        classId: 'cls-1',
        enrollments: [
          {
            courseId: 'ai-enlighten',
            progressPct: 100,
            status: '已完成',
            purchasedAt: new Date(t0 - 86400000 * 45).toISOString(),
            lastStudyAt: new Date(t0 - 86400000).toISOString(),
          },
        ],
      },
      {
        id: 'stu-3',
        phone: '13912345678',
        name: '王同学',
        classId: 'cls-2',
        classIds: ['cls-2', 'cls-3'],
        enrollments: [
          {
            courseId: 'ai-advance-basic',
            progressPct: 32,
            status: '学习中',
            purchasedAt: new Date(t0 - 86400000 * 10).toISOString(),
            lastStudyAt: new Date(t0 - 7200000).toISOString(),
          },
        ],
      },
    ],
    /** 教具采购订单（本地演示；正式环境对接总部供应链） */
    materialOrders: seedMaterialOrders(t0),
    institutionQualification: buildDefaultInstitutionQualification(partnerId, refCode),
  }
}

/** 旧数据班级补全线下课时结构；已有课时的班级补全 offlineCourseIds / 展示名。 */
function ensureClassOfflineFields(ws) {
  let changed = false
  const legacyClassNameMap = {
    '周六上午 · 幼儿英语启蒙班': '周六上午 · AI启蒙体验班',
    '暑期 · AI 竞赛冲刺班': '暑期 · AI竞赛冲刺班',
    '周三晚 · 少儿编程基础班': '周三晚 · AI编程基础班',
  }
  for (const c of ws.classes || []) {
    if (legacyClassNameMap[c.name]) {
      c.name = legacyClassNameMap[c.name]
      changed = true
    }
    const hasLessons = Array.isArray(c.offlineLessons) && c.offlineLessons.length > 0

    if (hasLessons) {
      if (!Array.isArray(c.offlineCourseIds) || c.offlineCourseIds.length === 0) {
        const inferred = inferOfflineCourseIdsFromLessons(c.offlineLessons)
        if (inferred.length) {
          c.offlineCourseIds = inferred
          c.offlineCourseId = inferred[0]
          changed = true
        } else if (c.offlineCourseId) {
          c.offlineCourseIds = [c.offlineCourseId]
          changed = true
        }
      }
      if (c.offlineCourseIds?.length) {
        const names = c.offlineCourseIds.map((id) => getFranchiseOfflinePackMeta(id)?.name || id)
        const joined = names.join('、')
        if (joined && c.offlineCourseName !== joined) {
          c.offlineCourseName = joined
          changed = true
        }
        if (c.offlineCourseId !== c.offlineCourseIds[0]) {
          c.offlineCourseId = c.offlineCourseIds[0]
          changed = true
        }
      } else if (!c.offlineCourseName && c.offlineCourseId) {
        const pack = getFranchiseOfflinePackMeta(c.offlineCourseId)
        c.offlineCourseName = pack?.name || c.offlineCourseId
        changed = true
      }
      continue
    }

    const idsFromMeta = Array.isArray(c.offlineCourseIds) ? c.offlineCourseIds : []
    const hasCourseMeta = idsFromMeta.length || c.offlineCourseId || c.offlineCourseName
    if (!hasCourseMeta) continue
    const cid =
      c.offlineCourseId && FRANCHISE_OFFLINE_LESSON_CATALOG[c.offlineCourseId]
        ? c.offlineCourseId
        : 'ai-enlighten'
    const effectiveIds = idsFromMeta.filter((id) => FRANCHISE_OFFLINE_LESSON_CATALOG[id]?.length)
    const toBuild = effectiveIds.length ? effectiveIds : [cid]
    const merged = getMergedOfflineLessonTemplates(toBuild)
    if (!merged.length) continue
    const names = toBuild.map((id) => getFranchiseOfflinePackMeta(id)?.name || id)
    c.offlineCourseIds = toBuild
    c.offlineCourseId = toBuild[0]
    c.offlineCourseName = names.join('、')
    c.offlineLessons = merged
    changed = true
  }
  return changed
}

function ensureMaterialOrderProductNames(ws) {
  let changed = false
  const productNameMap = new Map(FRANCHISE_TEACHING_PRODUCTS.map((p) => [p.id, p.name]))
  for (const order of ws.materialOrders || []) {
    for (const item of order.items || []) {
      const name = productNameMap.get(item.productId)
      if (name && item.name !== name) {
        item.name = name
        changed = true
      }
    }
  }
  return changed
}

function ensureDemoMultiOfflineCourseSample(ws) {
  let changed = false
  const sampleClass = (ws.classes || []).find((c) => c.id === 'cls-2')
  if (!sampleClass) return changed
  const expectedIds = ['ai-advance-basic', 'ai-advance-ml']
  const currentIds = Array.isArray(sampleClass.offlineCourseIds) ? sampleClass.offlineCourseIds.filter(Boolean) : []
  const missingIds = expectedIds.filter((id) => !currentIds.includes(id))
  if (!missingIds.length) return changed

  const currentLessons = Array.isArray(sampleClass.offlineLessons) ? sampleClass.offlineLessons : []
  const currentLessonIds = new Set(currentLessons.map((l) => l.id))
  const addLessons = getMergedOfflineLessonTemplates(missingIds).filter((l) => !currentLessonIds.has(l.id))
  sampleClass.offlineCourseIds = [...currentIds, ...missingIds]
  sampleClass.offlineCourseId = sampleClass.offlineCourseIds[0]
  sampleClass.offlineCourseName = sampleClass.offlineCourseIds
    .map((id) => getFranchiseOfflinePackMeta(id)?.name || id)
    .join('、')
  if (addLessons.length) {
    sampleClass.offlineLessons = [...currentLessons, ...addLessons]
  }
  changed = true
  return changed
}

function ensureDemoMultiClassStudentSample(ws) {
  let changed = false
  const sampleStudent = (ws.students || []).find((s) => s.id === 'stu-3' || s.name === '王同学')
  if (!sampleStudent) return changed
  const expectedClassIds = ['cls-2', 'cls-3']
  const currentIds = Array.isArray(sampleStudent.classIds) ? sampleStudent.classIds.filter(Boolean) : []
  const merged = Array.from(new Set([sampleStudent.classId, ...currentIds, ...expectedClassIds].filter(Boolean)))
  if (merged.length !== currentIds.length || merged.some((id, i) => currentIds[i] !== id)) {
    sampleStudent.classIds = merged
    changed = true
  }
  return changed
}

function normalizeEnrollments(ws) {
  let changed = false
  const fallbackPurchase = () => new Date(Date.now() - 86400000 * 7).toISOString()
  for (const s of ws.students || []) {
    for (const e of s.enrollments || []) {
      if (e.purchasedAt == null || e.purchasedAt === '') {
        e.purchasedAt = e.lastStudyAt || fallbackPurchase()
        changed = true
      }
    }
  }
  return changed
}

function consumeInstitutionPendingWorkspaceOpening(partnerId) {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(INSTITUTION_HQ_PENDING_WS_KEY)
    if (!raw) return null
    const o = safeParse(raw, {})
    const pid = String(partnerId || '')
    const by = o?.byPartnerId
    if (!by || typeof by !== 'object' || !by[pid]) return null
    const row = { ...by[pid] }
    const nextBy = { ...by }
    delete nextBy[pid]
    localStorage.setItem(INSTITUTION_HQ_PENDING_WS_KEY, JSON.stringify({ version: 1, byPartnerId: nextBy }))
    return row
  } catch {
    return null
  }
}

/** 机构总后台新开设校区：空班表、空订单；加盟商余额 = 划拨的开业额度（演示） */
function workspaceShellForInstitutionNewCampus(partnerId, refCode, openingBalance) {
  const t0 = Date.now()
  const bal = Math.max(0, Math.round(Number(openingBalance || 0) * 100) / 100)
  const courseDiscounts = [
    { courseId: 'ai-enlighten', rate: 0.8, label: '8折' },
    { courseId: 'ai-advance-basic', rate: 0.75, label: '75折' },
    { courseId: 'ai-advance-ml', rate: 0.75, label: '75折' },
    { courseId: 'ai-programming', rate: 0.85, label: '85折' },
  ]
  const ledger =
    bal > 0
      ? [
          {
            id: `l-hq-alloc-${t0}`,
            type: 'topup',
            title: '机构总管理划拨开业额度',
            amount: bal,
            balanceAfter: bal,
            createdAt: new Date().toISOString(),
          },
        ]
      : []
  return {
    schemaVersion: 2,
    partnerId,
    refCode,
    balance: bal,
    frozen: 0,
    courseDiscounts,
    announcements: [
      {
        id: 'a-welcome',
        title: '欢迎：本校区初始余额由机构总后台划拨，可在「余额中心」查看。',
        date: new Date().toISOString().slice(0, 10),
        isNew: true,
      },
    ],
    orders: [],
    ledger,
    withdrawals: [],
    classes: [],
    students: [],
    materialOrders: seedMaterialOrders(t0),
    institutionQualification: buildDefaultInstitutionQualification(partnerId, refCode),
  }
}

/** 新机构入驻独立演示：空工作台（无班级/学员/订单等种子数据） */
export function createIsolatedNewOrgEmptyWorkspace(partnerId, refCode) {
  const courseDiscounts = [
    { courseId: 'ai-enlighten', rate: 0.8, label: '8折' },
    { courseId: 'ai-advance-basic', rate: 0.75, label: '75折' },
    { courseId: 'ai-advance-ml', rate: 0.75, label: '75折' },
    { courseId: 'ai-programming', rate: 0.85, label: '85折' },
  ]
  const ws = {
    schemaVersion: 2,
    partnerId,
    refCode,
    isolatedNewOrgDemo: true,
    balance: 0,
    frozen: 0,
    courseDiscounts,
    announcements: [
      {
        id: 'a-demo-qual-hint',
        title: '请先完善机构信息并提交总部审核，审核通过后可使用全部功能。',
        date: new Date().toISOString().slice(0, 10),
        isNew: true,
      },
    ],
    orders: [],
    ledger: [],
    withdrawals: [],
    classes: [],
    students: [],
    materialOrders: [],
    institutionQualification: {
      reviewStatus: 'incomplete',
      rejectReason: null,
      approvedSnapshot: null,
      pendingReview: null,
    },
  }
  saveWorkspace(partnerId, ws)
  return ws
}

/** 演示工作台是否被写入了默认机构种子资质（勿影响正式机构） */
function isolatedDemoQualificationLooksSeeded(iq) {
  const snap = iq?.approvedSnapshot
  if (!snap || typeof snap !== 'object') return false
  if (iq.reviewStatus === 'approved' && snap.legalRepresentative === '王小明') return true
  if (snap.legalRepresentative === '王小明' && snap.businessLicenseNumber === '91310000MA1FLXXXXX') return true
  return false
}

export function ensureIsolatedDemoEmptyQualification(partnerId, refCode) {
  if (typeof window === 'undefined') return false
  const raw = localStorage.getItem(workspaceKey(partnerId))
  if (!raw) return false
  const ws = safeParse(raw, null)
  if (!ws?.isolatedNewOrgDemo || !isolatedDemoQualificationLooksSeeded(ws.institutionQualification)) return false
  ws.institutionQualification = {
    reviewStatus: 'incomplete',
    rejectReason: null,
    approvedSnapshot: null,
    pendingReview: null,
  }
  saveWorkspace(partnerId, ws)
  return true
}

/** 将旧演示种子数据迁移为独立空工作台（保留已填资质进度） */
export function migrateIsolatedNewOrgWorkspaceIfNeeded(partnerId, refCode) {
  if (typeof window === 'undefined') return false
  const raw = localStorage.getItem(workspaceKey(partnerId))
  if (!raw) {
    createIsolatedNewOrgEmptyWorkspace(partnerId, refCode)
    return true
  }
  const ws = safeParse(raw, null)
  if (!ws || typeof ws !== 'object') {
    createIsolatedNewOrgEmptyWorkspace(partnerId, refCode)
    return true
  }
  const needsReset =
    ws.isolatedNewOrgDemo !== true ||
    (Array.isArray(ws.classes) && ws.classes.length > 0) ||
    (Array.isArray(ws.students) && ws.students.length > 0) ||
    (Array.isArray(ws.orders) && ws.orders.length > 0) ||
    (Array.isArray(ws.materialOrders) && ws.materialOrders.length > 0) ||
    (Array.isArray(ws.ledger) && ws.ledger.length > 0) ||
    isolatedDemoQualificationLooksSeeded(ws.institutionQualification)
  if (!needsReset) {
    return ensureIsolatedDemoEmptyQualification(partnerId, refCode)
  }
  createIsolatedNewOrgEmptyWorkspace(partnerId, refCode)
  return true
}

export function getWorkspace(partnerId, refCode) {
  if (typeof window === 'undefined') return defaultWorkspace(partnerId, refCode)
  const raw = localStorage.getItem(workspaceKey(partnerId))
  if (!raw) {
    const pending = consumeInstitutionPendingWorkspaceOpening(partnerId)
    const init = pending
      ? workspaceShellForInstitutionNewCampus(partnerId, refCode, pending.openingBalance)
      : defaultWorkspace(partnerId, refCode)
    localStorage.setItem(workspaceKey(partnerId), JSON.stringify(init))
    return init
  }
  const ws = safeParse(raw, defaultWorkspace(partnerId, refCode))
  if (!ws.partnerId) ws.partnerId = partnerId
  if (ws.refCode == null) ws.refCode = refCode

  if (ws.isolatedNewOrgDemo === true) {
    ws.classes = Array.isArray(ws.classes) ? ws.classes : []
    ws.students = Array.isArray(ws.students) ? ws.students : []
    ws.orders = Array.isArray(ws.orders) ? ws.orders : []
    ws.materialOrders = Array.isArray(ws.materialOrders) ? ws.materialOrders : []
    ws.ledger = Array.isArray(ws.ledger) ? ws.ledger : []
    ws.withdrawals = Array.isArray(ws.withdrawals) ? ws.withdrawals : []
    if (!ws.institutionQualification || typeof ws.institutionQualification !== 'object') {
      ws.institutionQualification = {
        reviewStatus: 'incomplete',
        rejectReason: null,
        approvedSnapshot: null,
        pendingReview: null,
      }
    }
    let qualDirty = false
    if (isolatedDemoQualificationLooksSeeded(ws.institutionQualification)) {
      ws.institutionQualification = {
        reviewStatus: 'incomplete',
        rejectReason: null,
        approvedSnapshot: null,
        pendingReview: null,
      }
      qualDirty = true
    }
    if (stripOversizedLicenseAttachments(ws)) qualDirty = true
    if (qualDirty) saveWorkspace(partnerId, ws)
    return ws
  }

  const firstOrder = ws.orders?.[0]
  const isLegacyOrders = firstOrder && ('commission' in firstOrder || !('discountLabel' in firstOrder))
  if (!ws.schemaVersion || isLegacyOrders) {
    const fresh = defaultWorkspace(partnerId, refCode)
    Object.keys(fresh).forEach((k) => {
      ws[k] = fresh[k]
    })
    ws.partnerId = partnerId
    ws.refCode = refCode
    saveWorkspace(partnerId, ws)
  }
  if (!ws.courseDiscounts?.length) {
    ws.courseDiscounts = defaultWorkspace(partnerId, refCode).courseDiscounts
    saveWorkspace(partnerId, ws)
  }
  if (!ws.announcements?.length) {
    ws.announcements = defaultWorkspace(partnerId, refCode).announcements
    saveWorkspace(partnerId, ws)
  }
  if (normalizeEnrollments(ws)) saveWorkspace(partnerId, ws)
  if (ensureClassOfflineFields(ws)) saveWorkspace(partnerId, ws)
  if (ensureDemoMultiOfflineCourseSample(ws)) saveWorkspace(partnerId, ws)
  if (ensureDemoMultiClassStudentSample(ws)) saveWorkspace(partnerId, ws)
  if (ensureInstitutionQualification(ws, partnerId, refCode)) saveWorkspace(partnerId, ws)
  if (stripOversizedLicenseAttachments(ws)) saveWorkspace(partnerId, ws)
  if (!Array.isArray(ws.materialOrders)) {
    ws.materialOrders = seedMaterialOrders(Date.now())
    saveWorkspace(partnerId, ws)
  }
  if (ensureMaterialOrderProductNames(ws)) saveWorkspace(partnerId, ws)
  return ws
}

export function saveWorkspace(partnerId, data) {
  localStorage.setItem(workspaceKey(partnerId), JSON.stringify(data))
}

/**
 * 将工作台数据从旧 partnerId 迁到新 partnerId（机构总更换校区管理员登录手机等）
 * @returns {{ ok: true, migrated: boolean } | { ok: false, msg: string }}
 */
export function migrateFranchiseWorkspacePartnerId(oldPartnerId, newPartnerId, newRefCode) {
  const oldPid = String(oldPartnerId || '').trim()
  const newPid = String(newPartnerId || '').trim()
  if (!oldPid || !newPid || oldPid === newPid) return { ok: false, msg: '无效的迁移参数' }
  if (typeof window === 'undefined') return { ok: false, msg: '仅浏览器环境可用' }
  const oldKey = workspaceKey(oldPid)
  const newKey = workspaceKey(newPid)
  if (localStorage.getItem(newKey)) return { ok: false, msg: '新手机号已存在工作台数据，无法更换' }
  const raw = localStorage.getItem(oldKey)
  if (!raw) return { ok: true, migrated: false }
  try {
    const ws = safeParse(raw, null)
    if (!ws || typeof ws !== 'object') return { ok: false, msg: '工作台数据格式异常' }
    ws.partnerId = newPid
    const ref = String(newRefCode || '').trim()
    if (ref) ws.refCode = ref
    localStorage.setItem(newKey, JSON.stringify(ws))
    localStorage.removeItem(oldKey)
    return { ok: true, migrated: true }
  } catch {
    return { ok: false, msg: '工作台数据迁移失败' }
  }
}

/**
 * 将已保存的登录密码从旧手机号挪到新手机号（新号尚无密码记录时复制）
 */
export function migratePartnerLoginCredentialsToNewPhone(oldPhoneDigits, newPhoneDigits) {
  const o = normalizePartnerPhoneDigits(oldPhoneDigits)
  const n = normalizePartnerPhoneDigits(newPhoneDigits)
  if (o.length !== 11 || n.length !== 11 || o === n) return { ok: false, msg: '手机号无效' }
  const creds = loadPartnerCreds()
  const pw = creds[o]
  if (!pw) return { ok: true, copied: false }
  if (creds[n]) return { ok: true, copied: false }
  creds[n] = pw
  delete creds[o]
  if (!savePartnerCreds(creds)) return { ok: false, msg: '无法保存登录信息' }
  return { ok: true, copied: true }
}

export function buildPromoteLink(origin, courseId, refCode) {
  const base = (origin || '').replace(/\/$/, '') || ''
  return `${base}/courses/detail/${courseId}?ref=${encodeURIComponent(refCode)}`
}

/**
 * 充课：按总部配置的专属折扣从加盟商余额扣款，并记录订单、开通/更新学员选课。
 */
export function rechargeCourse(partnerId, refCode, { studentId, courseId }) {
  const fr = assertPartnerNotFrozen(partnerId)
  if (fr) return fr
  const ws = getWorkspace(partnerId, refCode)
  const course = FRANCHISE_PROMOTABLE_COURSES.find((c) => c.id === courseId)
  if (!course) return { ok: false, msg: '课程不存在' }
  const stu = ws.students.find((s) => s.id === studentId)
  if (!stu) return { ok: false, msg: '学员不存在' }
  const rate = getDiscountRate(ws, courseId)
  const originalPrice = course.price
  const payAmount = Math.round(originalPrice * rate * 100) / 100
  if (ws.balance < payAmount) return { ok: false, msg: `账户余额不足（需 ¥${payAmount.toFixed(2)}），请联系总部充值` }
  const exists = (stu.enrollments || []).some((e) => e.courseId === courseId && e.status !== '已退款')
  if (exists) return { ok: false, msg: '该学员已开通此课程包，无需重复充课' }

  ws.balance = Math.round((ws.balance - payAmount) * 100) / 100
  const discountLabel = getDiscountLabel(ws, courseId)
  const n = ws.orders.filter((o) => /^DD/.test(o.id)).length + 1
  const id = `DD${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(n).padStart(3, '0')}`
  ws.orders.unshift({
    id,
    studentName: stu.name,
    courseId,
    courseName: course.name,
    originalPrice,
    discountLabel,
    payAmount,
    status: '已完成',
    createdAt: new Date().toISOString(),
  })
  if (!stu.enrollments) stu.enrollments = []
  stu.enrollments.push({
    courseId,
    progressPct: 0,
    status: '学习中',
    purchasedAt: new Date().toISOString(),
    lastStudyAt: null,
  })
  ws.ledger.unshift({
    id: `l-${Date.now()}`,
    type: 'recharge_course',
    title: `充课 · ${stu.name} · ${course.name}`,
    amount: -payAmount,
    balanceAfter: ws.balance,
    createdAt: new Date().toISOString(),
  })
  saveWorkspace(partnerId, ws)
  return { ok: true, ws, payAmount, orderId: id }
}

export function createClass(partnerId, refCode, name, meta = {}) {
  const fr = assertPartnerNotFrozen(partnerId)
  if (fr) return fr
  const ws = getWorkspace(partnerId, refCode)
  const n = name.trim()
  if (!n) return { ok: false, msg: '请输入班级名称' }
  const offlineCourseIds = normalizeOfflineCourseIdsFromMeta(meta)
  const offlineLessons = getMergedOfflineLessonTemplates(offlineCourseIds)
  if (offlineCourseIds.length && !offlineLessons.length) {
    return { ok: false, msg: '所选课程包暂无线下课时目录，请重新选择' }
  }
  const id = `cls-${Date.now()}`
  const names = offlineCourseIds.map((cid) => getFranchiseOfflinePackMeta(cid)?.name || cid)
  ws.classes.push({
    id,
    name: n,
    studentIds: [],
    createdAt: new Date().toISOString(),
    courseType: typeof meta.courseType === 'string' ? meta.courseType.trim() : '',
    startDate: typeof meta.startDate === 'string' ? meta.startDate.trim() : '',
    offlineCourseIds,
    offlineCourseId: offlineCourseIds[0],
    offlineCourseName: names.join('、'),
    offlineLessons,
  })
  saveWorkspace(partnerId, ws)
  return { ok: true, ws, newClassId: id }
}

/** 班级创建后追加线下课程包；保留已勾选课时，仅追加新包课时。 */
export function addOfflineCoursePacksToClass(partnerId, refCode, classId, courseIds) {
  const fr = assertPartnerNotFrozen(partnerId)
  if (fr) return fr
  const ws = getWorkspace(partnerId, refCode)
  const cls = ws.classes.find((c) => c.id === classId)
  if (!cls) return { ok: false, msg: '班级不存在' }
  const normalized = normalizeOfflineCourseIdsFromMeta({ offlineCourseIds: courseIds })
  if (!normalized.length) return { ok: false, msg: '请选择要添加的线下课程包' }

  const existingIds = Array.isArray(cls.offlineCourseIds) && cls.offlineCourseIds.length
    ? cls.offlineCourseIds.filter((id) => FRANCHISE_OFFLINE_LESSON_CATALOG[id]?.length)
    : normalizeOfflineCourseIdsFromMeta(cls)
  const existingSet = new Set(existingIds)
  const addIds = normalized.filter((id) => !existingSet.has(id))
  if (!addIds.length) return { ok: false, msg: '所选课程包已在当前班级中' }

  const currentLessons = Array.isArray(cls.offlineLessons) ? cls.offlineLessons : []
  const currentLessonIds = new Set(currentLessons.map((l) => l.id))
  const addLessons = getMergedOfflineLessonTemplates(addIds).filter((l) => !currentLessonIds.has(l.id))
  if (!addLessons.length) return { ok: false, msg: '所选课程包暂无线下课时目录，请重新选择' }

  const nextIds = [...existingIds, ...addIds]
  const names = nextIds.map((cid) => getFranchiseOfflinePackMeta(cid)?.name || cid)
  cls.offlineCourseIds = nextIds
  cls.offlineCourseId = nextIds[0]
  cls.offlineCourseName = names.join('、')
  cls.offlineLessons = [...currentLessons, ...addLessons]
  saveWorkspace(partnerId, ws)
  return { ok: true, ws, addedCourseIds: addIds }
}

/** 管理员勾选/取消某节线下课是否已上完 */
export function setClassOfflineLessonDone(partnerId, refCode, classId, lessonId, done) {
  const fr = assertPartnerNotFrozen(partnerId)
  if (fr) return fr
  const ws = getWorkspace(partnerId, refCode)
  const cls = ws.classes.find((c) => c.id === classId)
  if (!cls) return { ok: false, msg: '班级不存在' }
  if (!Array.isArray(cls.offlineLessons)) return { ok: false, msg: '该班级未绑定线下课时' }
  const le = cls.offlineLessons.find((l) => l.id === lessonId)
  if (!le) return { ok: false, msg: '课时不存在' }
  le.done = Boolean(done)
  saveWorkspace(partnerId, ws)
  return { ok: true, ws }
}

export function deleteClass(partnerId, refCode, classId) {
  const fr = assertPartnerNotFrozen(partnerId)
  if (fr) return fr
  const ws = getWorkspace(partnerId, refCode)
  const idx = ws.classes.findIndex((c) => c.id === classId)
  if (idx === -1) return { ok: false, msg: '班级不存在' }
  for (const s of ws.students || []) {
    if (s.classId === classId) s.classId = null
  }
  ws.classes.splice(idx, 1)
  saveWorkspace(partnerId, ws)
  return { ok: true, ws }
}

export function addStudentToClass(partnerId, refCode, classId, phone, name, remark) {
  const fr = assertPartnerNotFrozen(partnerId)
  if (fr) return fr
  const ws = getWorkspace(partnerId, refCode)
  const cls = ws.classes.find((c) => c.id === classId)
  if (!cls) return { ok: false, msg: '班级不存在' }
  const phoneNorm = String(phone).replace(/\D/g, '').slice(-11)
  if (phoneNorm.length < 11) return { ok: false, msg: '请输入11位手机号' }
  let stu = ws.students.find((s) => s.phone === phoneNorm)
  if (!stu) {
    stu = {
      id: `stu-${Date.now()}`,
      phone: phoneNorm,
      name: (name || '学员').trim() || '学员',
      classId,
      enrollments: [],
    }
    if (remark != null && String(remark).trim()) stu.remark = String(remark).trim()
    ws.students.push(stu)
  } else {
    stu.classId = classId
    if (name?.trim()) stu.name = name.trim()
    if (remark != null && String(remark).trim()) stu.remark = String(remark).trim()
    else if (remark === '') delete stu.remark
  }
  for (const c of ws.classes || []) {
    if (c.id !== classId) c.studentIds = (c.studentIds || []).filter((id) => id !== stu.id)
  }
  if (cls && !cls.studentIds.includes(stu.id)) cls.studentIds.push(stu.id)
  saveWorkspace(partnerId, ws)
  return { ok: true, ws }
}

/** 调配学员到其他班级：保留线上课、备注与学习记录，仅变更班级归属。 */
export function moveStudentToClass(partnerId, refCode, studentId, targetClassId) {
  const fr = assertPartnerNotFrozen(partnerId)
  if (fr) return fr
  const ws = getWorkspace(partnerId, refCode)
  const stu = ws.students.find((s) => s.id === studentId)
  if (!stu) return { ok: false, msg: '学员不存在' }
  const target = ws.classes.find((c) => c.id === targetClassId)
  if (!target) return { ok: false, msg: '目标班级不存在' }
  if (stu.classId === targetClassId) return { ok: false, msg: '该学员已在目标班级中' }
  for (const c of ws.classes || []) {
    c.studentIds = (c.studentIds || []).filter((id) => id !== studentId)
  }
  stu.classId = targetClassId
  if (!Array.isArray(target.studentIds)) target.studentIds = []
  if (!target.studentIds.includes(studentId)) target.studentIds.push(studentId)
  saveWorkspace(partnerId, ws)
  return { ok: true, ws }
}

/** 更新学员备注（本地工作台）。空字符串则清除备注字段。 */
export function updateStudentRemark(partnerId, refCode, studentId, remark) {
  const fr = assertPartnerNotFrozen(partnerId)
  if (fr) return fr
  const ws = getWorkspace(partnerId, refCode)
  const stu = ws.students.find((s) => s.id === studentId)
  if (!stu) return { ok: false, msg: '学员不存在' }
  const t = remark != null ? String(remark).trim() : ''
  if (t) stu.remark = t
  else delete stu.remark
  saveWorkspace(partnerId, ws)
  return { ok: true, ws }
}

/** 删除学员：从班级名单中移除，并删除学员及其选课记录（订单流水保留）。 */
export function deleteStudent(partnerId, refCode, studentId) {
  const fr = assertPartnerNotFrozen(partnerId)
  if (fr) return fr
  const ws = getWorkspace(partnerId, refCode)
  const idx = ws.students.findIndex((s) => s.id === studentId)
  if (idx === -1) return { ok: false, msg: '学员不存在' }
  for (const c of ws.classes || []) {
    c.studentIds = (c.studentIds || []).filter((id) => id !== studentId)
  }
  ws.students.splice(idx, 1)
  saveWorkspace(partnerId, ws)
  return { ok: true, ws }
}

/**
 * 演示：总部向加盟商账户充值（正式环境由总部后台完成）
 * @param {string} [remark] 可选备注，写入流水标题后缀，便于区分后台手动入账
 */
/**
 * @param {{ skipFrozenGuard?: boolean }} [opts] 总部后台手动充值同步工作台时传 skipFrozenGuard: true
 */
export function demoTopUpBalance(partnerId, refCode, amount, remark, opts = {}) {
  if (!opts.skipFrozenGuard) {
    const fr = assertPartnerNotFrozen(partnerId)
    if (fr) return fr
  }
  const ws = getWorkspace(partnerId, refCode)
  const amt = Number(amount)
  if (!(amt > 0)) return { ok: false, msg: '请输入大于 0 的金额' }
  ws.balance = Math.round((ws.balance + amt) * 100) / 100
  const note = remark && String(remark).trim() ? ` · ${String(remark).trim()}` : ''
  ws.ledger.unshift({
    id: `l-top-${Date.now()}`,
    type: 'topup',
    title: `总部账户充值（演示）${note}`,
    amount: amt,
    balanceAfter: ws.balance,
    createdAt: new Date().toISOString(),
  })
  saveWorkspace(partnerId, ws)
  return { ok: true, ws }
}

/** 学具商城购物车草稿（列表与详情共用，按 partnerId 隔离） */
const TEACHING_MATERIAL_CART_DRAFT_PREFIX = 'bingo_franchise_teaching_cart_draft_v1_'

export function getTeachingMaterialCartDraft(partnerId) {
  if (typeof window === 'undefined' || !partnerId) return {}
  try {
    const raw = localStorage.getItem(TEACHING_MATERIAL_CART_DRAFT_PREFIX + String(partnerId))
    const o = raw ? JSON.parse(raw) : {}
    if (!o || typeof o !== 'object' || Array.isArray(o)) return {}
    const out = {}
    for (const [k, v] of Object.entries(o)) {
      const q = Math.max(0, parseInt(String(v), 10) || 0)
      if (q > 0) out[String(k)] = q
    }
    return out
  } catch {
    return {}
  }
}

export function saveTeachingMaterialCartDraft(partnerId, cart) {
  if (typeof window === 'undefined' || !partnerId) return
  try {
    localStorage.setItem(TEACHING_MATERIAL_CART_DRAFT_PREFIX + String(partnerId), JSON.stringify(cart && typeof cart === 'object' ? cart : {}))
  } catch (e) {
    console.error(e)
  }
}

/**
 * 教具采购下单（演示）：购物车行 [{ productId, qty }]；支付方式 balance | wechat。
 * 余额支付扣减余额并记流水；微信支付仅模拟成功，不扣余额。
 */
export function purchaseTeachingMaterials(partnerId, refCode, cartLines, payMethod) {
  const fr = assertPartnerNotFrozen(partnerId)
  if (fr) return fr
  const ws = getWorkspace(partnerId, refCode)
  if (!['balance', 'wechat'].includes(payMethod)) return { ok: false, msg: '请选择支付方式' }
  if (!Array.isArray(cartLines) || cartLines.length === 0) return { ok: false, msg: '请先选择商品数量' }

  const catalog = getFranchiseTeachingProductsCatalog()
  const validatedLines = []
  for (const row of cartLines) {
    const qty = Math.max(1, parseInt(String(row.qty), 10) || 1)
    const p = catalog.find((x) => x.id === row.productId)
    if (!p) return { ok: false, msg: '商品不存在或已下架' }
    validatedLines.push({ productId: row.productId, qty })
  }
  const pricing = calculateTeachingMaterialOrderPricing(validatedLines, catalog)
  if (!pricing.lines.length) return { ok: false, msg: '请先选择商品数量' }
  const lines = pricing.lines.map((l) => ({
    productId: l.productId,
    name: l.name,
    qty: l.qty,
    unitPrice: l.unitPrice,
    lineTotal: l.lineOriginal,
  }))
  const totalQty = pricing.totalQty
  const total = pricing.payAmount
  if (!(total > 0)) return { ok: false, msg: '订单金额无效' }

  if (payMethod === 'balance') {
    if (ws.balance < total) return { ok: false, msg: `账户余额不足（需 ¥${total.toFixed(2)}），可先前往余额中心充值或使用微信支付（演示）` }
    ws.balance = Math.round((ws.balance - total) * 100) / 100
    const titleHint = lines.length === 1 ? lines[0].name : `${lines[0].name} 等 ${lines.length} 项`
    ws.ledger.unshift({
      id: `l-mat-${Date.now()}`,
      type: 'material_purchase',
      title: `教具采购 · ${titleHint}`,
      amount: -total,
      balanceAfter: ws.balance,
      createdAt: new Date().toISOString(),
    })
  }

  const seq = (ws.materialOrders || []).filter((o) => /^MJ\d+$/.test(o.id)).length + 1
  const id = `MJ${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(seq).padStart(3, '0')}`
  const now = new Date().toISOString()
  const payLabel = payMethod === 'wechat' ? '微信支付（演示已到账）' : '已从账户余额扣款'
  const order = {
    id,
    items: lines,
    payAmount: total,
    originalAmount: pricing.originalAmount,
    discountAmount: pricing.discountAmount,
    discountRate: pricing.discountRate,
    discountLabel: pricing.discountLabel,
    totalQty,
    payMethod,
    status: '待发货',
    createdAt: now,
    receiverSnapshot: '机构默认收货地址（演示未采集门牌；正式环境同步资质登记地址）',
    shipments: [
      {
        at: now,
        carrier: '',
        trackingNo: '',
        status: '待发货',
        remark: `${payLabel}，仓库处理中`,
      },
    ],
  }
  if (!ws.materialOrders) ws.materialOrders = []
  ws.materialOrders.unshift(order)
  saveWorkspace(partnerId, ws)
  return { ok: true, ws, orderId: id }
}
