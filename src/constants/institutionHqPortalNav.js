/**
 * 机构总管理侧栏菜单（与 InstitutionHqLayout 路径一致）。
 * key 用于子账号角色勾选权限；hq-staff-accounts 仅主账号可见，不可分配给角色。
 */
export const INSTITUTION_HQ_PORTAL_NAV = [
  { key: 'dashboard', path: '/institution-hq/dashboard', label: '首页概览' },
  { key: 'finance', path: '/institution-hq/finance', label: '财务统计' },
  { key: 'campus-accounts', path: '/institution-hq/campus-accounts', label: '校区账号' },
  { key: 'hq-staff-accounts', path: '/institution-hq/hq-staff-accounts', label: '机构账号' },
  { key: 'settings', path: '/institution-hq/settings', label: '机构信息' },
]

/** 主账号给子账号角色分配时可勾选的菜单（不含「机构账号」权限页本身） */
export const INSTITUTION_HQ_MENUS_FOR_ROLE = INSTITUTION_HQ_PORTAL_NAV.filter((x) => x.key !== 'hq-staff-accounts')

function stripViteRouterBasename(pathname) {
  const raw = String(pathname || '').split('?')[0]
  let base = ''
  try {
    base =
      typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL != null
        ? String(import.meta.env.BASE_URL).replace(/\/$/, '')
        : ''
  } catch {
    /* 非 Vite 或 SSR */
  }
  if (!base) return raw
  if (raw.startsWith(`${base}/`)) return raw.slice(base.length) || '/'
  if (raw === base) return '/'
  return raw
}

export function resolveInstitutionHqMenuKey(pathname) {
  const p = stripViteRouterBasename(pathname)
  const item = INSTITUTION_HQ_PORTAL_NAV.find((x) => p === x.path || p.startsWith(`${x.path}/`))
  return item?.key || null
}

/** 登录成功后跳转：子账号进入其有权访问的第一个菜单 */
export function getInstitutionHqDefaultPathAfterLogin(session) {
  if (!session?.staffSubUser || !Array.isArray(session.staffMenuKeys)) {
    return '/institution-hq/dashboard'
  }
  const keys = new Set(session.staffMenuKeys)
  for (const item of INSTITUTION_HQ_PORTAL_NAV) {
    if (item.key === 'hq-staff-accounts') continue
    if (keys.has(item.key)) return item.path
  }
  return '/institution-hq/dashboard'
}
