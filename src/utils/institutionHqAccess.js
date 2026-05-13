/**
 * 机构总管理后台：管理员角色（总后台菜单权限）与子账号登录。
 * 与加盟商「机构账号」形态类似，作用域为集团总后台。
 */
import {
  INSTITUTION_HQ_DEMO_ORG_ID,
  INSTITUTION_HQ_DEMO_PASSWORD,
  INSTITUTION_HQ_DEMO_PHONE,
} from '../constants/institutionHqIdentity.js'
import { INSTITUTION_HQ_MENUS_FOR_ROLE } from '../constants/institutionHqPortalNav.js'
import { normalizePartnerPhoneDigits } from './franchisePartnerStorage.js'

export const INSTITUTION_HQ_ACCESS_LS_KEY = 'bingo_institution_hq_access_v1'

const DEMO_HQ_ROLE_ID = 'role-demo-hq-finance'
const DEMO_HQ_ACCOUNT_ID = 'acc-demo-hq-staff'
const DEMO_HQ_STAFF_PHONE = '13900009999'

function safeParse(raw, fallback) {
  try {
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function loadRoot() {
  if (typeof window === 'undefined') return { byOrgId: {} }
  const o = safeParse(localStorage.getItem(INSTITUTION_HQ_ACCESS_LS_KEY), {})
  if (!o || typeof o !== 'object' || Array.isArray(o)) return { byOrgId: {} }
  const by = o.byOrgId
  if (!by || typeof by !== 'object') return { byOrgId: {} }
  return { byOrgId: by }
}

function saveRoot(root) {
  if (typeof window === 'undefined') return
  localStorage.setItem(
    INSTITUTION_HQ_ACCESS_LS_KEY,
    JSON.stringify({ version: 1, updatedAt: new Date().toISOString(), byOrgId: root.byOrgId || {} }),
  )
  window.dispatchEvent(new Event('institution-hq-access-changed'))
}

function normalizeMenuKeys(keys) {
  const allowed = new Set(INSTITUTION_HQ_MENUS_FOR_ROLE.map((x) => x.key))
  if (!Array.isArray(keys)) return []
  const out = []
  for (const k of keys) {
    const s = String(k || '').trim()
    if (allowed.has(s) && !out.includes(s)) out.push(s)
  }
  return out
}

/** 演示集团：首次无配置时预置「仅财务」子账号，便于体验权限登录 */
function maybeApplyDemoHqSeed(orgId, bucket) {
  if (typeof window === 'undefined') return false
  if (String(orgId || '').trim() !== INSTITUTION_HQ_DEMO_ORG_ID) return false
  const roles = bucket.roles || []
  const accounts = bucket.accounts || []
  if (roles.length > 0 || accounts.length > 0) return false
  bucket.roles = [
    {
      id: DEMO_HQ_ROLE_ID,
      name: '财务专员（演示）',
      menuKeys: normalizeMenuKeys(['dashboard', 'finance']),
      updatedAt: new Date().toISOString(),
    },
  ]
  bucket.accounts = [
    {
      id: DEMO_HQ_ACCOUNT_ID,
      orgId: INSTITUTION_HQ_DEMO_ORG_ID,
      name: '演示子账号',
      phone: DEMO_HQ_STAFF_PHONE,
      password: INSTITUTION_HQ_DEMO_PASSWORD,
      roleId: DEMO_HQ_ROLE_ID,
      roleName: '财务专员（演示）',
      menuKeys: normalizeMenuKeys(['dashboard', 'finance']),
      createdAt: new Date().toISOString(),
    },
  ]
  return true
}

function getBucket(orgId) {
  const oid = String(orgId || '').trim()
  if (!oid) return null
  const root = loadRoot()
  if (!root.byOrgId[oid]) {
    root.byOrgId[oid] = { roles: [], accounts: [] }
    saveRoot(root)
  }
  const bucket = root.byOrgId[oid]
  if (maybeApplyDemoHqSeed(oid, bucket)) {
    saveRoot(root)
  }
  return { root, orgId: oid, bucket: root.byOrgId[oid] }
}

export function listHqRoles(orgId) {
  const g = getBucket(orgId)
  if (!g) return []
  return (g.bucket.roles || []).map((r) => ({ ...r, menuKeys: normalizeMenuKeys(r.menuKeys) }))
}

export function upsertHqRole(orgId, input) {
  const g = getBucket(orgId)
  if (!g) return { ok: false, msg: '无效集团' }
  const name = String(input.name || '').trim()
  if (!name) return { ok: false, msg: '请填写角色名称' }
  const menuKeys = normalizeMenuKeys(input.menuKeys)
  if (!menuKeys.length) return { ok: false, msg: '请至少勾选一个总后台菜单权限' }
  const id = String(input.id || '').trim() || `hq-role-${Date.now().toString(36)}`
  const roles = [...(g.bucket.roles || [])]
  const idx = roles.findIndex((x) => x.id === id)
  const row = { id, name, menuKeys, updatedAt: new Date().toISOString() }
  if (idx === -1) roles.push(row)
  else roles[idx] = { ...roles[idx], ...row }
  g.bucket.roles = roles
  saveRoot(g.root)
  return { ok: true, role: row }
}

export function deleteHqRole(orgId, roleId) {
  const g = getBucket(orgId)
  if (!g) return { ok: false, msg: '无效集团' }
  const rid = String(roleId || '').trim()
  const used = (g.bucket.accounts || []).some((a) => a.roleId === rid)
  if (used) return { ok: false, msg: '该角色下仍有账号，请先调整或删除账号' }
  g.bucket.roles = (g.bucket.roles || []).filter((r) => r.id !== rid)
  saveRoot(g.root)
  return { ok: true }
}

export function listHqAccounts(orgId) {
  const g = getBucket(orgId)
  if (!g) return []
  return (g.bucket.accounts || []).map((a) => ({ ...a }))
}

export function addHqAccount(orgId, input) {
  const g = getBucket(orgId)
  if (!g) return { ok: false, msg: '无效集团' }
  const name = String(input.name || '').trim()
  const phone = String(input.phone || '').replace(/\D/g, '')
  const password = String(input.password || '')
  const roleId = String(input.roleId || '').trim()
  if (!name) return { ok: false, msg: '请填写姓名' }
  if (phone.length !== 11) return { ok: false, msg: '请输入11位手机号' }
  if (password.length < 6) return { ok: false, msg: '密码至少 6 位' }
  if (phone === INSTITUTION_HQ_DEMO_PHONE) {
    return { ok: false, msg: '该手机号为机构总管理主账号，不能与权限子账号重复' }
  }
  const role = (g.bucket.roles || []).find((r) => r.id === roleId)
  if (!role) return { ok: false, msg: '请选择角色' }
  const root = loadRoot()
  for (const oid of Object.keys(root.byOrgId)) {
    for (const acc of root.byOrgId[oid].accounts || []) {
      if (String(acc.phone) === phone) return { ok: false, msg: '该手机号已被其他权限子账号占用' }
    }
  }
  const id = `hq-staff-${Date.now().toString(36)}`
  const row = {
    id,
    orgId: g.orgId,
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

export function deleteHqAccount(orgId, accountId) {
  const g = getBucket(orgId)
  if (!g) return { ok: false, msg: '无效集团' }
  const id = String(accountId || '').trim()
  g.bucket.accounts = (g.bucket.accounts || []).filter((a) => a.id !== id)
  saveRoot(g.root)
  return { ok: true }
}

export function resetHqAccountPassword(orgId, accountId, newPassword) {
  const g = getBucket(orgId)
  if (!g) return { ok: false, msg: '无效集团' }
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

/**
 * 机构总后台子账号登录：手机+密码，返回写入总后台会话的 payload（含 staffSubUser、staffMenuKeys）。
 */
export function tryInstitutionHqStaffLogin(phoneDigits, password) {
  const p = normalizePartnerPhoneDigits(phoneDigits)
  const pw = String(password || '')
  if (p.length !== 11 || !pw) return { ok: false }
  if (p === INSTITUTION_HQ_DEMO_PHONE) return { ok: false }
  const g = getBucket(INSTITUTION_HQ_DEMO_ORG_ID)
  if (!g) return { ok: false }
  for (const acc of g.bucket.accounts || []) {
    if (String(acc.phone) !== p) continue
    if (acc.password !== pw) return { ok: false, msg: '密码错误' }
    const role = (g.bucket.roles || []).find((r) => r.id === acc.roleId)
    const menuKeys = normalizeMenuKeys(role?.menuKeys?.length ? role.menuKeys : acc.menuKeys)
    if (!menuKeys.length) return { ok: false, msg: '该账号未分配菜单权限，请联系机构总管理主账号' }
    return {
      ok: true,
      session: {
        orgId: INSTITUTION_HQ_DEMO_ORG_ID,
        orgName: '启思博雅教育集团（演示）',
        displayName: acc.name,
        loginPhone: p,
        loginAt: new Date().toISOString(),
        staffSubUser: true,
        staffName: acc.name,
        staffRoleId: acc.roleId,
        staffRoleName: role?.name || acc.roleName || '子账号',
        staffMenuKeys: menuKeys,
      },
    }
  }
  return { ok: false }
}
