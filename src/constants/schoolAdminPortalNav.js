/**
 * 学校端后台菜单配置。
 * ownerOnly 的菜单仅总管理员可见；老师（子管理员）看到的数据由数据层按主讲班级二次收窄。
 */
export const SCHOOL_PORTAL_BASE = '/school'

export const SCHOOL_PORTAL_NAV = [
  { key: 'dashboard', path: '/school/dashboard', label: '数据看板' },
  { key: 'classes', path: '/school/classes', label: '班级管理' },
  { key: 'students', path: '/school/students', label: '学生管理' },
  { key: 'certificates', path: '/school/certificates', label: '结课发证' },
  { key: 'accounts', path: '/school/accounts', label: '账号管理', ownerOnly: true },
  { key: 'settings', path: '/school/settings', label: '学校信息' },
]

export const SCHOOL_PORTAL_TITLES = {
  dashboard: '数据看板',
  classes: '班级管理',
  students: '学生管理',
  certificates: '结课发证',
  accounts: '账号管理',
  settings: '学校信息',
}

export function visibleSchoolNav(session) {
  const owner = session?.role === 'owner'
  return SCHOOL_PORTAL_NAV.filter((item) => (item.ownerOnly ? owner : true))
}

export function resolveSchoolPortalMenuKey(pathname) {
  const p = String(pathname || '')
  if (p.startsWith('/school/classes')) return 'classes'
  if (p.startsWith('/school/students')) return 'students'
  if (p.startsWith('/school/certificates')) return 'certificates'
  if (p.startsWith('/school/accounts')) return 'accounts'
  if (p.startsWith('/school/settings')) return 'settings'
  if (p.startsWith('/school/dashboard')) return 'dashboard'
  return ''
}

export function resolveSchoolPageTitle(pathname) {
  const p = String(pathname || '')
  if (/^\/school\/classes\/.+/.test(p)) return '班级详情'
  if (/^\/school\/students\/.+/.test(p)) return '学生学习档案'
  return SCHOOL_PORTAL_TITLES[resolveSchoolPortalMenuKey(p)] || '学校管理后台'
}
