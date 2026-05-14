/**
 * 总部「加盟商管理 · 机构账号」：角色（工作台菜单权限）与子账号。
 * 与 admin 机构账号页共用 localStorage Key；同源域名下与加盟商工作台互通。
 */
import { FRANCHISE_PARTNER_MENUS_FOR_ROLE, FRANCHISE_PARTNER_PORTAL_NAV } from '../constants/franchisePartnerPortalNav.js'
import { FRANCHISE_PREVIEW_DEMO_MAIN_PHONE, normalizePartnerPhoneDigits } from './franchisePartnerStorage.js'

export const FRANCHISE_INSTITUTION_ACCOUNTS_LS_KEY = 'bingo_franchise_institution_accounts_v1'

function safeParse(raw, fallback) {
  try {
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function loadRoot() {
  if (typeof window === 'undefined') return { byPartnerId: {} }
  const o = safeParse(localStorage.getItem(FRANCHISE_INSTITUTION_ACCOUNTS_LS_KEY), {})
  if (!o || typeof o !== 'object' || Array.isArray(o)) return { byPartnerId: {} }
  const by = o.byPartnerId
  if (!by || typeof by !== 'object') return { byPartnerId: {} }
  return { byPartnerId: by }
}

function saveRoot(root) {
  localStorage.setItem(
    FRANCHISE_INSTITUTION_ACCOUNTS_LS_KEY,
    JSON.stringify({ version: 1, updatedAt: new Date().toISOString(), byPartnerId: root.byPartnerId || {} }),
  )
}

/** 与 franchisePartnerStorage 中预览主账号（无总部开户档案时）的 partnerId 一致 */
function isPreviewDemoInstitutionPartnerId(pid) {
  return String(pid || '').trim() === 'p_13800138000'
}

const DEMO_PREVIEW_ROLE_ID = 'role-demo-qisi-instructor'
const DEMO_PREVIEW_ACCOUNT_ID = 'acc-demo-qisi-staff'
const DEMO_PREVIEW_STAFF_PHONE = '13900000007'
const DEMO_PREVIEW_REF_CODE = 'FJ-QISI-DEMO'

/**
 * 为预览机构主账号在「机构账号」为空时预置一条角色与一个子账号，便于首次开箱体验。
 * 仅在 roles、accounts 均为空时写入，不覆盖已有配置。
 */
function maybeApplyDemoPreviewInstitutionSeed(pid, bucket) {
  if (typeof window === 'undefined') return false
  if (!isPreviewDemoInstitutionPartnerId(pid)) return false
  const roles = bucket.roles || []
  const accounts = bucket.accounts || []
  if (roles.length > 0 || accounts.length > 0) return false
  const refCode = DEMO_PREVIEW_REF_CODE
  bucket.roles = [
    {
      id: DEMO_PREVIEW_ROLE_ID,
      name: '教学主管',
      menuKeys: normalizeMenuKeys([
        'dashboard',
        'classes',
        'students',
        'teaching-materials',
        'finance',
        'recharge',
        'settings',
      ]),
      updatedAt: new Date().toISOString(),
    },
  ]
  bucket.accounts = [
    {
      id: DEMO_PREVIEW_ACCOUNT_ID,
      partnerId: pid,
      refCode,
      orgNameSnapshot: '启思博雅教育中心',
      name: '李老师',
      phone: DEMO_PREVIEW_STAFF_PHONE,
      password: 'demo123',
      roleId: DEMO_PREVIEW_ROLE_ID,
      roleName: '教学主管',
      menuKeys: normalizeMenuKeys([
        'dashboard',
        'classes',
        'students',
        'teaching-materials',
        'finance',
        'recharge',
        'settings',
      ]),
      createdAt: new Date().toISOString(),
    },
  ]
  return true
}

function getBucket(partnerId) {
  const pid = String(partnerId || '').trim()
  if (!pid) return null
  const root = loadRoot()
  if (!root.byPartnerId[pid]) {
    root.byPartnerId[pid] = { roles: [], accounts: [] }
    saveRoot(root)
  }
  const bucket = root.byPartnerId[pid]
  if (maybeApplyDemoPreviewInstitutionSeed(pid, bucket)) {
    saveRoot(root)
  }
  return { root, pid, bucket: root.byPartnerId[pid] }
}

export function exportPartnerPortalNavCatalog() {
  return FRANCHISE_PARTNER_PORTAL_NAV.map((x) => ({ ...x }))
}

/** 机构子账号数据随 partnerId 迁移（更换校区管理员登录手机） */
export function migrateInstitutionAccountsPartnerId(oldPartnerId, newPartnerId, newRefCode) {
  const oldPid = String(oldPartnerId || '').trim()
  const newPid = String(newPartnerId || '').trim()
  if (!oldPid || !newPid || oldPid === newPid) return { ok: false, msg: '无效参数' }
  const root = loadRoot()
  const oldBucket = root.byPartnerId[oldPid]
  if (!oldBucket) return { ok: true }
  const existingNew = root.byPartnerId[newPid]
  if (existingNew) {
    const nonEmpty =
      (existingNew.roles && existingNew.roles.length > 0) || (existingNew.accounts && existingNew.accounts.length > 0)
    if (nonEmpty) return { ok: false, msg: '目标校区已存在机构账号数据，无法更换' }
    delete root.byPartnerId[newPid]
  }
  const ref = String(newRefCode || '').trim()
  const bucket = JSON.parse(JSON.stringify(oldBucket))
  for (const acc of bucket.accounts || []) {
    acc.partnerId = newPid
    if (ref) acc.refCode = ref
  }
  delete root.byPartnerId[oldPid]
  root.byPartnerId[newPid] = bucket
  saveRoot(root)
  return { ok: true }
}

function normalizeMenuKeys(keys) {
  const allowed = new Set(FRANCHISE_PARTNER_MENUS_FOR_ROLE.map((x) => x.key))
  if (!Array.isArray(keys)) return []
  const out = []
  for (const k of keys) {
    const s = String(k || '').trim()
    if (allowed.has(s) && !out.includes(s)) out.push(s)
  }
  return out
}

export function listInstitutionRoles(partnerId) {
  const g = getBucket(partnerId)
  if (!g) return []
  return (g.bucket.roles || []).map((r) => ({ ...r, menuKeys: normalizeMenuKeys(r.menuKeys) }))
}

export function upsertInstitutionRole(partnerId, input) {
  const g = getBucket(partnerId)
  if (!g) return { ok: false, msg: '无效加盟商' }
  const name = String(input.name || '').trim()
  if (!name) return { ok: false, msg: '请填写角色名称' }
  const menuKeys = normalizeMenuKeys(input.menuKeys)
  if (!menuKeys.length) return { ok: false, msg: '请至少勾选一个工作台菜单权限' }
  const id = String(input.id || '').trim() || `role-${Date.now().toString(36)}`
  const roles = [...(g.bucket.roles || [])]
  const idx = roles.findIndex((x) => x.id === id)
  const row = { id, name, menuKeys, updatedAt: new Date().toISOString() }
  if (idx === -1) roles.push(row)
  else roles[idx] = { ...roles[idx], ...row }
  g.bucket.roles = roles
  saveRoot(g.root)
  return { ok: true, role: row }
}

export function deleteInstitutionRole(partnerId, roleId) {
  const g = getBucket(partnerId)
  if (!g) return { ok: false, msg: '无效加盟商' }
  const rid = String(roleId || '').trim()
  const used = (g.bucket.accounts || []).some((a) => a.roleId === rid)
  if (used) return { ok: false, msg: '该角色下仍有账号，请先调整或删除账号' }
  g.bucket.roles = (g.bucket.roles || []).filter((r) => r.id !== rid)
  saveRoot(g.root)
  return { ok: true }
}

export function listInstitutionAccounts(partnerId) {
  const g = getBucket(partnerId)
  if (!g) return []
  return (g.bucket.accounts || []).map((a) => ({ ...a }))
}

function ownerPhonesFromProvision() {
  try {
    const raw = localStorage.getItem('bingo_franchise_partner_provision_v1')
    const o = safeParse(raw, {})
    return Object.keys(o || {}).filter((k) => /^\d{11}$/.test(k))
  } catch {
    return []
  }
}

export function addInstitutionAccount(partnerId, refCode, orgName, input) {
  const g = getBucket(partnerId)
  if (!g) return { ok: false, msg: '无效加盟商' }
  const name = String(input.name || '').trim()
  const phone = String(input.phone || '').replace(/\D/g, '')
  const password = String(input.password || '')
  const roleId = String(input.roleId || '').trim()
  if (!name) return { ok: false, msg: '请填写姓名' }
  if (phone.length !== 11) return { ok: false, msg: '请输入11位手机号' }
  if (password.length < 6) return { ok: false, msg: '密码至少 6 位' }
  const role = (g.bucket.roles || []).find((r) => r.id === roleId)
  if (!role) return { ok: false, msg: '请选择角色' }
  if (ownerPhonesFromProvision().includes(phone)) {
    return { ok: false, msg: '该手机号为机构主账号登录号，不能与机构子账号重复' }
  }
  const root = loadRoot()
  for (const bid of Object.keys(root.byPartnerId)) {
    for (const acc of root.byPartnerId[bid].accounts || []) {
      if (String(acc.phone) === phone) return { ok: false, msg: '该手机号已被其他机构子账号占用' }
    }
  }
  const id = `staff-${Date.now().toString(36)}`
  const row = {
    id,
    partnerId: g.pid,
    refCode: String(refCode || '').trim(),
    orgNameSnapshot: String(orgName || '').trim(),
    name,
    phone,
    password,
    roleId,
    roleName: role.name,
    menuKeys: normalizeMenuKeys(role.menuKeys),
    createdAt: new Date().toISOString(),
  }
  g.bucket.accounts = [...(g.bucket.accounts || []), row]
  saveRoot(g.root)
  return { ok: true, account: row }
}

export function deleteInstitutionAccount(partnerId, accountId) {
  const g = getBucket(partnerId)
  if (!g) return { ok: false, msg: '无效加盟商' }
  const id = String(accountId || '').trim()
  g.bucket.accounts = (g.bucket.accounts || []).filter((a) => a.id !== id)
  saveRoot(g.root)
  return { ok: true }
}

export function resetInstitutionAccountPassword(partnerId, accountId, newPassword) {
  const g = getBucket(partnerId)
  if (!g) return { ok: false, msg: '无效加盟商' }
  const pw = String(newPassword || '')
  if (pw.length < 6) return { ok: false, msg: '新密码至少6位' }
  const id = String(accountId || '').trim()
  const list = g.bucket.accounts || []
  const idx = list.findIndex((a) => a.id === id)
  if (idx === -1) return { ok: false, msg: '账号不存在' }
  list[idx] = { ...list[idx], password: pw, passwordResetAt: new Date().toISOString() }
  g.bucket.accounts = list
  saveRoot(g.root)
  return { ok: true }
}

/** 编辑员工子账号：姓名、角色；密码留空则不变 */
export function updateInstitutionAccount(partnerId, accountId, input) {
  const g = getBucket(partnerId)
  if (!g) return { ok: false, msg: '无效加盟商' }
  const id = String(accountId || '').trim()
  const list = [...(g.bucket.accounts || [])]
  const idx = list.findIndex((a) => a.id === id)
  if (idx === -1) return { ok: false, msg: '账号不存在' }
  const cur = list[idx]
  const name = String((input?.name ?? cur.name) || '').trim()
  if (!name) return { ok: false, msg: '请填写姓名' }
  const roleId = String((input?.roleId ?? cur.roleId) || '').trim()
  const role = (g.bucket.roles || []).find((r) => r.id === roleId)
  if (!role) return { ok: false, msg: '请选择角色' }
  const pwTrim = input?.password != null ? String(input.password).trim() : ''
  let password = cur.password
  let pwdChanged = false
  if (pwTrim) {
    if (pwTrim.length < 6) return { ok: false, msg: '新密码至少 6 位' }
    password = pwTrim
    pwdChanged = true
  }
  list[idx] = {
    ...cur,
    name,
    password,
    roleId,
    roleName: role.name,
    menuKeys: normalizeMenuKeys(role.menuKeys),
    updatedAt: new Date().toISOString(),
    ...(pwdChanged ? { passwordResetAt: new Date().toISOString() } : {}),
  }
  g.bucket.accounts = list
  saveRoot(g.root)
  return { ok: true }
}

/**
 * 子账号登录：校验手机+密码，返回写入加盟商会话的 payload（含 staffSubUser）。
 */
export function tryInstitutionStaffLogin(phoneDigits, password) {
  const p = normalizePartnerPhoneDigits(phoneDigits)
  const pw = String(password || '')
  if (p.length !== 11 || !pw) return { ok: false }
  /** 机构主账号登录手机号不可再作为子账号，避免会话混淆 */
  if (p === FRANCHISE_PREVIEW_DEMO_MAIN_PHONE) return { ok: false }
  const root = loadRoot()
  for (const partnerId of Object.keys(root.byPartnerId)) {
    const bucket = root.byPartnerId[partnerId]
    for (const acc of bucket.accounts || []) {
      if (String(acc.phone) !== p) continue
      if (acc.password !== pw) return { ok: false, msg: '密码错误' }
      const role = (bucket.roles || []).find((r) => r.id === acc.roleId)
      const menuKeys = normalizeMenuKeys(role?.menuKeys?.length ? role.menuKeys : acc.menuKeys)
      if (!menuKeys.length) return { ok: false, msg: '该账号未分配菜单权限，请联系总部' }
      const orgName =
        acc.orgNameSnapshot?.trim() ||
        `缤果AI学院·机构子账号（${p.slice(0, 3)}****${p.slice(-4)}）`
      return {
        ok: true,
        session: {
          partnerId: String(acc.partnerId),
          refCode: String(acc.refCode),
          phone: p,
          orgName,
          contactName: acc.name,
          staffSubUser: true,
          staffName: acc.name,
          staffRoleId: acc.roleId,
          staffRoleName: role?.name || acc.roleName || '子账号',
          staffMenuKeys: menuKeys,
          loginAt: new Date().toISOString(),
        },
      }
    }
  }
  return { ok: false }
}
