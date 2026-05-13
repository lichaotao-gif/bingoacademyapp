/**
 * 同一手机号同时具备「机构总主账号」与「校区加盟商工作台」时的双端切换（演示逻辑）。
 */
import {
  INSTITUTION_HQ_DEMO_ORG_ID,
  INSTITUTION_HQ_DEMO_PHONE,
} from '../constants/institutionHqIdentity.js'
import { listInstitutionCampuses, setInstitutionHqSession } from './institutionHqStorage.js'
import {
  FRANCHISE_PREVIEW_DEMO_MAIN_PHONE,
  buildPartnerSessionPayloadForLogin,
  normalizePartnerPhoneDigits,
  setPartnerSession,
} from './franchisePartnerStorage.js'

function norm(digits) {
  return normalizePartnerPhoneDigits(digits)
}

/** 是否为机构总演示主账号手机（与 institutionHqStorage.verify 一致） */
export function phoneDigitsHasInstitutionHqMasterAccess(digits) {
  const d = norm(digits)
  return Boolean(d && d === norm(INSTITUTION_HQ_DEMO_PHONE))
}

/** 是否可进入至少一个校区加盟商工作台（演示种子 / 主号 / 机构下校区管理员手机） */
export function phoneDigitsHasCampusFranchiseAccess(digits) {
  const d = norm(digits)
  if (!d) return false
  if (d === FRANCHISE_PREVIEW_DEMO_MAIN_PHONE) return true
  try {
    const campuses = listInstitutionCampuses()
    return campuses.some((c) => norm(c?.adminPhone) === d)
  } catch {
    return false
  }
}

/** 侧栏是否展示「切换账号」并允许切换 */
export function phoneDigitsHasDualPortalAccess(digits) {
  return phoneDigitsHasInstitutionHqMasterAccess(digits) && phoneDigitsHasCampusFranchiseAccess(digits)
}

/** 当前手机号在机构「校区账号」中担任管理员的校区列表（按 partnerId+refCode 去重） */
export function listCampusesForAdminPhone(phoneDigits) {
  const d = norm(phoneDigits)
  if (!d) return []
  let list = []
  try {
    list = listInstitutionCampuses().filter((c) => norm(c?.adminPhone) === d)
  } catch {
    list = []
  }
  const seen = new Set()
  const out = []
  for (const c of list) {
    if (!c?.partnerId || !c?.refCode) continue
    const k = `${String(c.partnerId)}\t${String(c.refCode)}`
    if (seen.has(k)) continue
    seen.add(k)
    out.push(c)
  }
  return out
}

/** 写入指定校区的加盟商会话（演示：须为该校区登记的管理员手机） */
export function buildPartnerSessionPayloadForCampus(campus, phoneDigits) {
  const d = norm(phoneDigits)
  const name = String(campus?.campusName || '').trim()
  return {
    partnerId: String(campus.partnerId),
    refCode: String(campus.refCode),
    phone: d,
    orgName: name || '校区',
    contactName: String(campus?.contactName || '管理员').trim() || '管理员',
    loginAt: new Date().toISOString(),
  }
}

export function applyFranchisePartnerSessionForCampus(campus, phoneDigits) {
  const d = norm(phoneDigits)
  if (!campus?.partnerId || !campus?.refCode) return { ok: false, msg: '无效的校区信息' }
  const allowed = listCampusesForAdminPhone(d).some(
    (x) => String(x.partnerId) === String(campus.partnerId) && String(x.refCode) === String(campus.refCode),
  )
  if (!allowed) return { ok: false, msg: '无权进入该校区的工作台' }
  try {
    setPartnerSession(buildPartnerSessionPayloadForCampus(campus, d))
    return { ok: true }
  } catch (e) {
    return { ok: false, msg: e?.message || '切换失败' }
  }
}

/** 从机构总侧切入加盟商工作台：写入校区会话（保留机构总会话） */
export function dualSwitchToFranchisePartnerWorkspace(phoneDigits, campus = null) {
  const d = norm(phoneDigits)
  if (!phoneDigitsHasDualPortalAccess(d)) {
    return { ok: false, msg: '当前手机号未同时绑定机构总与校区管理，无法切换。' }
  }
  if (campus) {
    return applyFranchisePartnerSessionForCampus(campus, d)
  }
  const campuses = listCampusesForAdminPhone(d)
  if (campuses.length === 1) {
    return applyFranchisePartnerSessionForCampus(campuses[0], d)
  }
  if (campuses.length > 1) {
    return { ok: false, msg: '请选择要进入的校区' }
  }
  try {
    const payload = buildPartnerSessionPayloadForLogin(d)
    if (!payload?.partnerId) return { ok: false, msg: '无法生成校区工作台会话，请稍后重试。' }
    setPartnerSession(payload)
    return { ok: true }
  } catch (e) {
    return { ok: false, msg: e?.message || '切换失败' }
  }
}

/** 从校区侧切入机构总：写入主账号会话（保留加盟商会话） */
export function dualSwitchToInstitutionHqWorkspace(phoneDigits) {
  const d = norm(phoneDigits)
  if (!phoneDigitsHasDualPortalAccess(d)) {
    return { ok: false, msg: '当前手机号未同时绑定机构总与校区管理，无法切换。' }
  }
  const session = {
    orgId: INSTITUTION_HQ_DEMO_ORG_ID,
    orgName: '启思博雅教育集团（演示）',
    displayName: '机构总管理员',
    loginPhone: d,
    loginAt: new Date().toISOString(),
  }
  setInstitutionHqSession(session)
  return { ok: true, session }
}
