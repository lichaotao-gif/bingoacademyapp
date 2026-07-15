// 一级栏目分组：组与组之间用分栏区分
export const mainNavGroups = [
  [{ path: '/', label: 'AI时代导航' }],
  [{ path: '/growth', label: 'AI成长规划' }],
  [{ path: '/courses', label: 'AI能力课程' }],
  [{ path: '/events', label: 'AI赛事活动' }],
  [{ path: '/tools', label: 'AI探索平台' }],
  [{ path: '/cert', label: '成果认证' }],
  [{ path: '/mall', label: '资源商城' }],
  [{ path: '/franchise', label: '加盟合作' }],
  [{ path: '/profile', label: '我的工作台' }],
]

// 第 8 组：登录、注册
export const authNav = [
  { path: '/login', label: '登录' },
  { path: '/register', label: '注册' },
]

// 全部栏目组（含登录注册，用于顶栏分栏展示）
export const allNavGroups = [...mainNavGroups, authNav]

// 扁平列表（用于移动端等，不含登录注册）
export const mainNav = mainNavGroups.flat()
