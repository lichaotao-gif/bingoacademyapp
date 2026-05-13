/**
 * 机构总管理员（集团层）演示：管理多「校区」加盟商工作台账号。
 * 数据存 localStorage，与加盟商 getWorkspace(partnerId) 桶对齐。
 */
import {
  INSTITUTION_HQ_DEMO_ORG_ID,
  INSTITUTION_HQ_DEMO_PASSWORD,
  INSTITUTION_HQ_DEMO_PHONE,
} from '../constants/institutionHqIdentity.js'
import { INSTITUTION_HQ_PENDING_WS_KEY } from '../constants/institutionHqPendingWorkspace.js'
import { tryInstitutionHqStaffLogin } from './institutionHqAccess.js'
import { normalizePartnerPhoneDigits, queuePartnerSessionForNewTab } from './franchisePartnerStorage.js'

const SESSION_KEY = 'bingo_institution_hq_session_v1'
const CAMPUSES_KEY = 'bingo_institution_hq_campuses_v1'
const TREASURY_KEY = 'bingo_institution_hq_treasury_v1'

const DEFAULT_TREASURY_BALANCE = 500_000

function dispatchTreasuryChanged() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event('institution-hq-treasury-changed'))
}

function roundMoney2(n) {
  const x = Number(n)
  if (!Number.isFinite(x)) return 0
  return Math.round(x * 100) / 100
}

function loadTreasury() {
  if (typeof window === 'undefined') {
    return { balance: DEFAULT_TREASURY_BALANCE, ledger: [] }
  }
  try {
    const raw = localStorage.getItem(TREASURY_KEY)
    if (!raw) {
      const seed = { balance: DEFAULT_TREASURY_BALANCE, ledger: [] }
      localStorage.setItem(TREASURY_KEY, JSON.stringify({ version: 1, ...seed }))
      return seed
    }
    const o = JSON.parse(raw)
    const balance = roundMoney2(o?.balance ?? DEFAULT_TREASURY_BALANCE)
    const ledger = Array.isArray(o?.ledger) ? o.ledger : []
    return { balance, ledger }
  } catch {
    return { balance: DEFAULT_TREASURY_BALANCE, ledger: [] }
  }
}

function saveTreasury(data) {
  if (typeof window === 'undefined') return
  localStorage.setItem(
    TREASURY_KEY,
    JSON.stringify({
      version: 1,
      balance: roundMoney2(data.balance),
      ledger: Array.isArray(data.ledger) ? data.ledger : [],
      updatedAt: new Date().toISOString(),
    }),
  )
  dispatchTreasuryChanged()
}

/** 机构总账户余额与流水（演示；正式环境对接支付/财务中台） */
export function getInstitutionHqTreasury() {
  return loadTreasury()
}

/** 演示：向机构总账户充值 */
export function institutionHqDemoRechargeTopUp(amount, remark) {
  const amt = roundMoney2(amount)
  if (!(amt > 0)) return { ok: false, msg: '请输入大于 0 的金额' }
  const tr = loadTreasury()
  tr.balance = roundMoney2(tr.balance + amt)
  const note = remark && String(remark).trim() ? ` · ${String(remark).trim()}` : ''
  tr.ledger.unshift({
    id: `hq-top-${Date.now()}`,
    type: 'hq_topup',
    title: `机构总账户充值（演示）${note}`,
    amount: amt,
    balanceAfter: tr.balance,
    createdAt: new Date().toISOString(),
  })
  saveTreasury(tr)
  return { ok: true, treasury: tr }
}

function deductTreasuryForCampusAllocation(amount, campusName, campusId) {
  const amt = roundMoney2(amount)
  if (!(amt > 0)) return { ok: true }
  const tr = loadTreasury()
  if (tr.balance < amt) {
    return {
      ok: false,
      msg: `机构总账户余额不足（当前 ¥${tr.balance.toFixed(2)}，需划拨 ¥${amt.toFixed(2)}）`,
    }
  }
  tr.balance = roundMoney2(tr.balance - amt)
  tr.ledger.unshift({
    id: `hq-alloc-${Date.now()}`,
    type: 'hq_allocate_campus',
    title: `划拨开业额度至「${String(campusName || '校区').trim()}」`,
    amount: -amt,
    balanceAfter: tr.balance,
    campusId: String(campusId || ''),
    createdAt: new Date().toISOString(),
  })
  saveTreasury(tr)
  return { ok: true }
}

function refundTreasuryForCampusRemoved(amount, campusName) {
  const amt = roundMoney2(amount)
  if (!(amt > 0)) return
  const tr = loadTreasury()
  tr.balance = roundMoney2(tr.balance + amt)
  tr.ledger.unshift({
    id: `hq-refund-${Date.now()}`,
    type: 'hq_refund_campus',
    title: `删除校区记录，退回划拨额度「${String(campusName || '校区').trim()}」`,
    amount: amt,
    balanceAfter: tr.balance,
    createdAt: new Date().toISOString(),
  })
  saveTreasury(tr)
}

function loadPendingWsRoot() {
  if (typeof window === 'undefined') return { byPartnerId: {} }
  try {
    const o = JSON.parse(localStorage.getItem(INSTITUTION_HQ_PENDING_WS_KEY) || '{}')
    const by = o?.byPartnerId
    return by && typeof by === 'object' && !Array.isArray(by) ? { byPartnerId: { ...by } } : { byPartnerId: {} }
  } catch {
    return { byPartnerId: {} }
  }
}

function savePendingWsRoot(root) {
  if (typeof window === 'undefined') return
  localStorage.setItem(
    INSTITUTION_HQ_PENDING_WS_KEY,
    JSON.stringify({ version: 1, byPartnerId: root.byPartnerId || {} }),
  )
}

/** 新校区保存后写入：首次 getWorkspace 时按此余额生成工作台（非预置演示桶） */
export function setPendingCampusWorkspaceOpening(partnerId, refCode, openingBalance) {
  const pid = String(partnerId || '').trim()
  if (!pid) return
  const root = loadPendingWsRoot()
  root.byPartnerId[pid] = {
    refCode: String(refCode || '').trim(),
    openingBalance: roundMoney2(openingBalance),
    at: new Date().toISOString(),
  }
  savePendingWsRoot(root)
}

export function deletePendingCampusWorkspaceOpening(partnerId) {
  const pid = String(partnerId || '').trim()
  if (!pid) return
  const root = loadPendingWsRoot()
  if (!root.byPartnerId[pid]) return
  delete root.byPartnerId[pid]
  savePendingWsRoot(root)
}

export { INSTITUTION_HQ_DEMO_ORG_ID, INSTITUTION_HQ_DEMO_PASSWORD, INSTITUTION_HQ_DEMO_PHONE }

function safeParse(json, fallback) {
  try {
    return JSON.parse(json)
  } catch {
    return fallback
  }
}

const SEED_CAMPUS = [
  {
    id: 'campus-seed-qisi',
    partnerId: 'p_13800138000',
    refCode: 'FJ-QISI-DEMO',
    campusName: '启思博雅 · 旗舰校区（演示）',
    adminPhone: '13800138000',
    passwordHint: '与「加盟商工作台」演示主号一致：demo123',
    isSeed: true,
  },
  {
    id: 'campus-seed-east',
    partnerId: 'p_13900007777',
    refCode: 'FJ-EAST-DEMO',
    campusName: '缤果 · 城东学习中心（演示）',
    adminPhone: '13900007777',
    passwordHint: '演示密码：demo123',
    isSeed: true,
  },
]

export function getInstitutionHqSession() {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) return null
  const s = safeParse(raw, null)
  if (!s?.orgId) return null
  return s
}

export function setInstitutionHqSession(payload) {
  if (typeof window === 'undefined') return
  localStorage.setItem(SESSION_KEY, JSON.stringify(payload))
  window.dispatchEvent(new Event('institution-hq-session-changed'))
}

export function clearInstitutionHqSession() {
  localStorage.removeItem(SESSION_KEY)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('institution-hq-session-changed'))
  }
}

export function verifyInstitutionHqLogin(phoneDigits, password) {
  const p = normalizePartnerPhoneDigits(phoneDigits)
  const pw = String(password || '')

  const staff = tryInstitutionHqStaffLogin(p, pw)
  if (staff.ok) return { ok: true, session: staff.session }
  if (staff.msg) return { ok: false, msg: staff.msg }

  if (p !== INSTITUTION_HQ_DEMO_PHONE) return { ok: false, msg: '账号或密码错误' }
  if (pw !== INSTITUTION_HQ_DEMO_PASSWORD) return { ok: false, msg: '密码错误' }
  return {
    ok: true,
    session: {
      orgId: INSTITUTION_HQ_DEMO_ORG_ID,
      orgName: '启思博雅教育集团（演示）',
      displayName: '机构总管理员',
      loginPhone: p,
      loginAt: new Date().toISOString(),
    },
  }
}

function loadCustomCampuses() {
  if (typeof window === 'undefined') return []
  try {
    const arr = safeParse(localStorage.getItem(CAMPUSES_KEY), [])
    return Array.isArray(arr) ? arr.filter((x) => x && x.partnerId && x.adminPhone) : []
  } catch {
    return []
  }
}

function saveCustomCampuses(list) {
  if (typeof window === 'undefined') return
  localStorage.setItem(CAMPUSES_KEY, JSON.stringify(list))
}

/** 合并内置演示校区与用户开设校区 */
export function listInstitutionCampuses() {
  const custom = loadCustomCampuses()
  const byId = new Map()
  for (const c of SEED_CAMPUS) byId.set(c.id, c)
  for (const c of custom) {
    if (c?.id) byId.set(c.id, { ...c, isSeed: false })
  }
  return [...byId.values()]
}

/**
 * @param {{
 *   campusName: string
 *   adminPhone: string
 *   contactName?: string
 *   region?: string
 *   address?: string
 *   campusShortCode?: string
 *   plannedOpenDate?: string
 *   studentCapacity?: string | number
 *   remark?: string
 *   passwordHint?: string
 *   openingBalanceAllocated?: string | number
 * }} input
 */
export function addInstitutionCampus(input) {
  const name = String(input?.campusName || '').trim()
  const phone = normalizePartnerPhoneDigits(input?.adminPhone)
  const contactName = String(input?.contactName || '').trim()
  const region = String(input?.region || '').trim()
  const address = String(input?.address || '').trim()
  const campusShortCode = String(input?.campusShortCode || '').trim()
  const plannedOpenDate = String(input?.plannedOpenDate || '').trim()
  const remark = String(input?.remark || '').trim()
  const capRaw = input?.studentCapacity
  const studentCapacity =
    capRaw === '' || capRaw === undefined || capRaw === null
      ? ''
      : String(capRaw).replace(/\D/g, '').slice(0, 6)
  const passwordHintCustom = String(input?.passwordHint || '').trim()
  const openingBalanceAllocated = roundMoney2(input?.openingBalanceAllocated ?? input?.openingBalance ?? 0)
  if (openingBalanceAllocated < 0) return { ok: false, msg: '划拨额度不能为负数' }

  if (!name) return { ok: false, msg: '请填写校区名称' }
  if (!/^1\d{10}$/.test(phone)) return { ok: false, msg: '请输入11位校区管理员手机号' }

  const partnerId = `p_${phone}`
  const refCode = `FJ-${phone.slice(-4)}-${Date.now().toString(36).slice(-4).toUpperCase()}`
  const row = {
    id: `campus-${Date.now().toString(36)}`,
    partnerId,
    refCode,
    campusName: name,
    adminPhone: phone,
    passwordHint:
      passwordHintCustom ||
      '首次登录请使用「忘记密码」流程，或联系机构总管理员获取初始密码。',
    isSeed: false,
    openingBalanceAllocated,
  }
  if (contactName) row.contactName = contactName
  if (region) row.region = region
  if (address) row.address = address
  if (campusShortCode) row.campusShortCode = campusShortCode
  if (plannedOpenDate) row.plannedOpenDate = plannedOpenDate
  if (studentCapacity) row.studentCapacity = studentCapacity
  if (remark) row.remark = remark
  const existing = listInstitutionCampuses()
  if (existing.some((x) => x.partnerId === partnerId || normalizePartnerPhoneDigits(x.adminPhone) === phone)) {
    return { ok: false, msg: '该手机号已对应一个校区' }
  }

  if (openingBalanceAllocated > 0) {
    const dr = deductTreasuryForCampusAllocation(openingBalanceAllocated, name, row.id)
    if (!dr.ok) return dr
  }

  const list = loadCustomCampuses()
  list.push(row)
  saveCustomCampuses(list)
  setPendingCampusWorkspaceOpening(partnerId, refCode, openingBalanceAllocated)
  return { ok: true, campus: row }
}

export function removeInstitutionCampus(campusId) {
  const id = String(campusId || '').trim()
  if (!id) return { ok: false, msg: '无效校区' }
  if (SEED_CAMPUS.some((s) => s.id === id)) return { ok: false, msg: '预置校区不可删除' }
  const list = loadCustomCampuses()
  const row = list.find((x) => x.id === id)
  if (!row) return { ok: false, msg: '未找到该校区记录' }
  const alloc = roundMoney2(row.openingBalanceAllocated ?? 0)
  const pendingStill = Boolean(loadPendingWsRoot().byPartnerId[row.partnerId])
  if (alloc > 0 && pendingStill) {
    refundTreasuryForCampusRemoved(alloc, row.campusName)
  }
  deletePendingCampusWorkspaceOpening(row.partnerId)
  const next = list.filter((x) => x.id !== id)
  saveCustomCampuses(next)
  return { ok: true }
}

/** 构造写入加盟商工作台的会话（与 buildPartnerSessionPayloadForLogin 字段对齐） */
export function buildPartnerSessionFromCampus(campus) {
  const phone = normalizePartnerPhoneDigits(campus.adminPhone)
  const cn = String(campus.contactName || '').trim()
  return {
    partnerId: String(campus.partnerId),
    refCode: String(campus.refCode),
    phone,
    orgName: String(campus.campusName || '校区').trim(),
    contactName: cn || '校区管理员',
    loginAt: new Date().toISOString(),
  }
}

export function openCampusFranchisePartnerInNewTab(campus) {
  if (typeof window === 'undefined') return
  const payload = buildPartnerSessionFromCampus(campus)
  queuePartnerSessionForNewTab(payload)
  const u = new URL('franchise-partner/dashboard', window.location.origin + import.meta.env.BASE_URL)
  window.open(u.href, '_blank', 'noopener,noreferrer')
}

/**
 * 集团机构资质统一存于「主校区」加盟商工作台的 institutionQualification（演示）。
 * 机构总在设置中编辑并提交审核；各校加盟商端仅展示只读，与主校区数据一致。
 */
export function getInstitutionOrgQualificationWorkspaceKeys() {
  const camps = listInstitutionCampuses()
  if (!camps.length) return null
  const primary =
    camps.find((c) => String(c.partnerId) === 'p_13800138000') ||
    camps.find((c) => c.isSeed) ||
    camps[0]
  if (!primary?.partnerId || !primary?.refCode) return null
  return { partnerId: String(primary.partnerId), refCode: String(primary.refCode) }
}

export function partnerIdBelongsToInstitutionHqList(partnerId) {
  const pid = String(partnerId || '').trim()
  if (!pid) return false
  return listInstitutionCampuses().some((c) => String(c.partnerId) === pid)
}
