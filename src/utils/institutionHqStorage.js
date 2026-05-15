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
import {
  demoTopUpBalance,
  migrateFranchiseWorkspacePartnerId,
  migratePartnerLoginCredentialsToNewPhone,
  normalizePartnerPhoneDigits,
  queuePartnerSessionForNewTab,
} from './franchisePartnerStorage.js'
import { migrateInstitutionAccountsPartnerId } from './franchiseInstitutionAccounts.js'

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

function deductTreasuryForCampusAllocation(amount, campusName, campusId, options) {
  const amt = roundMoney2(amount)
  if (!(amt > 0)) return { ok: true }
  const tr = loadTreasury()
  if (tr.balance < amt) {
    return {
      ok: false,
      msg: `机构总账户余额不足（当前 ¥${tr.balance.toFixed(2)}，需划拨 ¥${amt.toFixed(2)}）`,
    }
  }
  const name = String(campusName || '校区').trim()
  const ledgerTitle =
    options && typeof options === 'object' && typeof options.ledgerTitle === 'string' && options.ledgerTitle.trim()
      ? options.ledgerTitle.trim()
      : `划拨开业额度至「${name}」`
  tr.balance = roundMoney2(tr.balance - amt)
  tr.ledger.unshift({
    id: `hq-alloc-${Date.now()}`,
    type: 'hq_allocate_campus',
    title: ledgerTitle,
    amount: -amt,
    balanceAfter: tr.balance,
    campusId: String(campusId || ''),
    createdAt: new Date().toISOString(),
  })
  saveTreasury(tr)
  return { ok: true }
}

/** 校区入账失败时退回机构总账（演示） */
function creditTreasuryGrantRollback(amount, campusName) {
  const amt = roundMoney2(amount)
  if (!(amt > 0)) return
  const tr = loadTreasury()
  tr.balance = roundMoney2(tr.balance + amt)
  tr.ledger.unshift({
    id: `hq-grant-rb-${Date.now()}`,
    type: 'hq_refund_campus',
    title: `拨款入账失败，退回机构总账「${String(campusName || '校区').trim()}」`,
    amount: amt,
    balanceAfter: tr.balance,
    createdAt: new Date().toISOString(),
  })
  saveTreasury(tr)
}

/**
 * 从机构总账户扣款并拨入指定校区加盟商工作台余额（演示）。
 * @param {{ partnerId: string, refCode: string, id?: string, campusName?: string }} campus
 * @param {number|string} amount
 * @param {string} [remark]
 */
export function institutionHqAllocateFundsToCampus(campus, amount, remark) {
  const pid = String(campus?.partnerId || '').trim()
  const ref = String(campus?.refCode || '').trim()
  if (!pid || !ref) return { ok: false, msg: '校区信息不完整' }
  if (Boolean(campus?.disabled)) return { ok: false, msg: '该校区已禁用，无法拨款' }
  if (!partnerIdBelongsToInstitutionHqList(pid)) return { ok: false, msg: '非本机构下属校区' }
  const amt = roundMoney2(amount)
  if (!(amt > 0)) return { ok: false, msg: '请输入大于 0 的金额' }
  const name = String(campus.campusName || '校区').trim()
  const remarkTrim = remark != null ? String(remark).trim() : ''
  const note = remarkTrim ? ` · ${remarkTrim}` : ''
  const ledgerTitle = `拨款至「${name}」${note}`
  const dr = deductTreasuryForCampusAllocation(amt, name, campus.id, { ledgerTitle })
  if (!dr.ok) return dr
  const top = demoTopUpBalance(pid, ref, amt, `机构总拨款${note}`, { skipFrozenGuard: true })
  if (!top.ok) {
    creditTreasuryGrantRollback(amt, name)
    return top
  }
  return { ok: true, campusBalance: top.ws.balance }
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

function migratePendingWorkspacePartnerKey(oldPid, newPid, refCode) {
  const old = String(oldPid || '').trim()
  const neu = String(newPid || '').trim()
  if (!old || !neu || old === neu) return
  const root = loadPendingWsRoot()
  const row = root.byPartnerId[old]
  if (!row) return
  delete root.byPartnerId[old]
  root.byPartnerId[neu] = {
    ...row,
    refCode: String(refCode || row.refCode || '').trim(),
    at: new Date().toISOString(),
  }
  savePendingWsRoot(root)
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
    id: 'campus-seed-west',
    partnerId: 'p_13800138001',
    refCode: 'FJ-WEST-DEMO',
    campusName: '启思博雅 · 西岸学习中心（演示）',
    adminPhone: '13800138000',
    passwordHint: '与旗舰校区同一管理员手机，用于演示多校区切换',
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
    return Array.isArray(arr) ? arr.filter((x) => x && x.partnerId) : []
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
 *   adminPhone?: string
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

  const id = `campus-${Date.now().toString(36)}`
  const hasAdminPhone = /^1\d{10}$/.test(phone)
  const partnerId = hasAdminPhone ? `p_${phone}` : `p_pending_${id}`
  const refCode = hasAdminPhone
    ? `FJ-${phone.slice(-4)}-${Date.now().toString(36).slice(-4).toUpperCase()}`
    : `FJ-PEND-${Date.now().toString(36).slice(-4).toUpperCase()}`
  const row = {
    id,
    partnerId,
    refCode,
    campusName: name,
    adminPhone: hasAdminPhone ? phone : '',
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
  if (hasAdminPhone && existing.some((x) => x.partnerId === partnerId || normalizePartnerPhoneDigits(x.adminPhone) === phone)) {
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

/**
 * 更新已开设校区（不含管理员手机号、不含开业划拨；预置校区不可改）
 * @param {string} campusId
 * @param {Partial<{ campusName: string, contactName: string, region: string, address: string, campusShortCode: string, plannedOpenDate: string, studentCapacity: string|number, remark: string, passwordHint: string }>} input
 */
export function updateInstitutionCampus(campusId, input) {
  const id = String(campusId || '').trim()
  if (!id) return { ok: false, msg: '无效校区' }
  if (SEED_CAMPUS.some((s) => s.id === id)) return { ok: false, msg: '预置校区不可修改' }
  const list = loadCustomCampuses()
  const idx = list.findIndex((x) => x.id === id)
  if (idx === -1) return { ok: false, msg: '未找到该校区记录' }
  const cur = { ...list[idx] }

  const name = String(input?.campusName ?? cur.campusName ?? '').trim()
  if (!name) return { ok: false, msg: '请填写校区名称' }
  cur.campusName = name

  const contactName = String(input?.contactName ?? '').trim()
  if (contactName) cur.contactName = contactName
  else delete cur.contactName

  const region = String(input?.region ?? '').trim()
  if (region) cur.region = region
  else delete cur.region

  const address = String(input?.address ?? '').trim()
  if (address) cur.address = address
  else delete cur.address

  const campusShortCode = String(input?.campusShortCode ?? '').trim()
  if (campusShortCode) cur.campusShortCode = campusShortCode
  else delete cur.campusShortCode

  const plannedOpenDate = String(input?.plannedOpenDate ?? '').trim()
  if (plannedOpenDate) cur.plannedOpenDate = plannedOpenDate
  else delete cur.plannedOpenDate

  const capRaw = input?.studentCapacity
  const studentCapacity =
    capRaw === '' || capRaw === undefined || capRaw === null
      ? ''
      : String(capRaw).replace(/\D/g, '').slice(0, 6)
  if (studentCapacity) cur.studentCapacity = studentCapacity
  else delete cur.studentCapacity

  const remark = String(input?.remark ?? '').trim()
  if (remark) cur.remark = remark
  else delete cur.remark

  const passwordHintCustom = String(input?.passwordHint ?? '').trim()
  if (passwordHintCustom) cur.passwordHint = passwordHintCustom
  else
    cur.passwordHint =
      '首次登录请使用「忘记密码」流程，或联系机构总管理员获取初始密码。'

  list[idx] = cur
  saveCustomCampuses(list)
  return { ok: true, campus: cur }
}

/** 禁用 / 启用校区（仅用户开设的校区；预置不可改） */
export function setInstitutionCampusDisabled(campusId, disabled) {
  const id = String(campusId || '').trim()
  if (!id) return { ok: false, msg: '无效校区' }
  if (SEED_CAMPUS.some((s) => s.id === id)) return { ok: false, msg: '预置校区不可禁用' }
  const list = loadCustomCampuses()
  const idx = list.findIndex((x) => x.id === id)
  if (idx === -1) return { ok: false, msg: '未找到该校区记录' }
  list[idx] = { ...list[idx], disabled: Boolean(disabled) }
  saveCustomCampuses(list)
  return { ok: true }
}

/**
 * 更换校区管理员登录手机（仅自建校区）。会迁移工作台、开业待写入、机构子账号桶及登录密码（新号尚无密码时复制旧号密码）。
 */
export function changeInstitutionCampusAdminPhone(campusId, newAdminPhoneInput) {
  const id = String(campusId || '').trim()
  const newPhone = normalizePartnerPhoneDigits(newAdminPhoneInput)
  if (!id) return { ok: false, msg: '无效校区' }
  if (SEED_CAMPUS.some((s) => s.id === id)) return { ok: false, msg: '预置校区不支持更换管理员手机' }
  if (!/^1\d{10}$/.test(newPhone)) return { ok: false, msg: '请输入11位新手机号' }
  const list = loadCustomCampuses()
  const idx = list.findIndex((x) => x.id === id)
  if (idx === -1) return { ok: false, msg: '未找到该校区记录' }
  const row = { ...list[idx] }
  const oldPhone = normalizePartnerPhoneDigits(row.adminPhone)
  const oldPid = String(row.partnerId || '').trim()
  const oldRef = String(row.refCode || '').trim()
  if (oldPhone === newPhone) return { ok: false, msg: '新手机号与当前一致' }
  const newPid = `p_${newPhone}`
  const dup = listInstitutionCampuses().some((x) => normalizePartnerPhoneDigits(x.adminPhone) === newPhone && x.id !== id)
  if (dup) return { ok: false, msg: '该手机号已被其他校区使用' }
  const newRef = `FJ-${newPhone.slice(-4)}-${Date.now().toString(36).slice(-4).toUpperCase()}`

  const wsM = migrateFranchiseWorkspacePartnerId(oldPid, newPid, newRef)
  if (!wsM.ok) return wsM

  const iaM = migrateInstitutionAccountsPartnerId(oldPid, newPid, newRef)
  if (!iaM.ok) {
    migrateFranchiseWorkspacePartnerId(newPid, oldPid, oldRef)
    return iaM
  }

  migratePendingWorkspacePartnerKey(oldPid, newPid, newRef)

  const cr = migratePartnerLoginCredentialsToNewPhone(oldPhone, newPhone)
  if (!cr.ok) {
    migratePendingWorkspacePartnerKey(newPid, oldPid, oldRef)
    migrateInstitutionAccountsPartnerId(newPid, oldPid, oldRef)
    migrateFranchiseWorkspacePartnerId(newPid, oldPid, oldRef)
    return cr
  }

  row.adminPhone = newPhone
  row.partnerId = newPid
  row.refCode = newRef
  list[idx] = row
  saveCustomCampuses(list)
  return { ok: true, campus: row }
}

/**
 * 首次绑定校区管理员手机（仅自建且尚未绑定 11 位主号时）。迁移工作台、pending 开业额度、机构子账号桶；不迁移登录密码（新号无旧密码）。
 */
export function assignInstitutionCampusAdmin(campusId, input) {
  const id = String(campusId || '').trim()
  const newPhone = normalizePartnerPhoneDigits(input?.adminPhone)
  if (!id) return { ok: false, msg: '无效校区' }
  if (SEED_CAMPUS.some((s) => s.id === id)) return { ok: false, msg: '预置校区不可绑定管理员' }
  if (!/^1\d{10}$/.test(newPhone)) return { ok: false, msg: '请输入11位管理员手机号' }

  const list = loadCustomCampuses()
  const idx = list.findIndex((x) => x.id === id)
  if (idx === -1) return { ok: false, msg: '未找到该校区记录' }
  const row = { ...list[idx] }
  const oldPhone = normalizePartnerPhoneDigits(row.adminPhone)
  if (/^1\d{10}$/.test(oldPhone)) {
    return { ok: false, msg: '该校区已绑定管理员，更换请使用「换绑手机」' }
  }

  const oldPid = String(row.partnerId || '').trim()
  const oldRef = String(row.refCode || '').trim()
  const newPid = `p_${newPhone}`
  const dup = listInstitutionCampuses().some((x) => normalizePartnerPhoneDigits(x.adminPhone) === newPhone && x.id !== id)
  if (dup) return { ok: false, msg: '该手机号已被其他校区使用' }
  const newRef = `FJ-${newPhone.slice(-4)}-${Date.now().toString(36).slice(-4).toUpperCase()}`

  const wsM = migrateFranchiseWorkspacePartnerId(oldPid, newPid, newRef)
  if (!wsM.ok) return wsM

  const iaM = migrateInstitutionAccountsPartnerId(oldPid, newPid, newRef)
  if (!iaM.ok) {
    migrateFranchiseWorkspacePartnerId(newPid, oldPid, oldRef)
    return iaM
  }

  migratePendingWorkspacePartnerKey(oldPid, newPid, newRef)

  if (/^1\d{10}$/.test(oldPhone)) {
    const cr = migratePartnerLoginCredentialsToNewPhone(oldPhone, newPhone)
    if (!cr.ok) {
      migratePendingWorkspacePartnerKey(newPid, oldPid, oldRef)
      migrateInstitutionAccountsPartnerId(newPid, oldPid, oldRef)
      migrateFranchiseWorkspacePartnerId(newPid, oldPid, oldRef)
      return cr
    }
  }

  row.adminPhone = newPhone
  row.partnerId = newPid
  row.refCode = newRef
  const cn = String(input?.contactName ?? '').trim()
  if (cn) row.contactName = cn
  else delete row.contactName
  const ph = String(input?.passwordHint ?? '').trim()
  row.passwordHint = ph || '首次登录请使用「忘记密码」流程，或联系机构总管理员获取初始密码。'

  list[idx] = row
  saveCustomCampuses(list)
  return { ok: true, campus: row }
}

/** 加盟商主号登录：若该手机号在机构校区列表中且对应校区均为「禁用」，则不可登录 */
export function isFranchiseCampusLoginDisabled(phoneDigits) {
  const p = normalizePartnerPhoneDigits(phoneDigits)
  if (p.length !== 11) return false
  const matches = listInstitutionCampuses().filter((c) => normalizePartnerPhoneDigits(c.adminPhone) === p)
  if (!matches.length) return false
  return matches.every((c) => Boolean(c.disabled))
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
  if (Boolean(campus?.disabled)) {
    window.alert('该校区已禁用，无法打开工作台')
    return
  }
  const phone = normalizePartnerPhoneDigits(campus?.adminPhone)
  if (!/^1\d{10}$/.test(phone)) {
    window.alert('请先在列表中使用「校区管理员配置」绑定管理员手机号，再进入工作台。')
    return
  }
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
