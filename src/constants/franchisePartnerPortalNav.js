/**
 * 加盟商工作台侧栏菜单（与 FranchisePartnerLayout NAV 顺序、路径一致）。
 * key 用于总部「机构账号」角色勾选权限。
 */
export const FRANCHISE_PARTNER_PORTAL_NAV = [
  { key: 'dashboard', path: '/franchise-partner/dashboard', label: '首页概览' },
  { key: 'classes', path: '/franchise-partner/classes', label: '班级管理' },
  { key: 'students', path: '/franchise-partner/students', label: '学生管理' },
  { key: 'recharge', path: '/franchise-partner/recharge', label: '充课中心' },
  { key: 'teaching-materials', path: '/franchise-partner/teaching-materials', label: '学具商城' },
  { key: 'orders', path: '/franchise-partner/orders', label: '订单管理' },
  { key: 'finance', path: '/franchise-partner/finance', label: '财务统计' },
  { key: 'discounts', path: '/franchise-partner/discounts', label: '折扣查看' },
  { key: 'balance', path: '/franchise-partner/balance', label: '余额中心' },
  /** 仅机构主账号侧栏展示；不可作为子账号角色权限分配（避免循环授权） */
  { key: 'staff-accounts', path: '/franchise-partner/staff-accounts', label: '机构账号' },
  { key: 'settings', path: '/franchise-partner/settings', label: '账号设置' },
  { key: 'promote', path: '/franchise-partner/promote', label: '课程推广' },
  { key: 'progress', path: '/franchise-partner/progress', label: '学习进度' },
]

/** 总部/主账号给员工角色分配时可勾选的菜单（不含「机构账号」页本身） */
export const FRANCHISE_PARTNER_MENUS_FOR_ROLE = FRANCHISE_PARTNER_PORTAL_NAV.filter((x) => x.key !== 'staff-accounts')

/** 子路由归属：学具详情挂在「学具商城」权限下 */
export const FRANCHISE_PARTNER_PATH_PREFIX_RULES = [
  { prefix: '/franchise-partner/teaching-materials/item/', menuKey: 'teaching-materials' },
  { prefix: '/franchise-partner/classes/', menuKey: 'classes' },
  { prefix: '/franchise-partner/students', menuKey: 'students' },
]

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

export function resolvePartnerPortalMenuKey(pathname) {
  const p = stripViteRouterBasename(pathname)
  for (const r of FRANCHISE_PARTNER_PATH_PREFIX_RULES) {
    if (p.startsWith(r.prefix)) return r.menuKey
  }
  const item = FRANCHISE_PARTNER_PORTAL_NAV.find((x) => p === x.path || p.startsWith(`${x.path}/`))
  return item?.key || null
}
