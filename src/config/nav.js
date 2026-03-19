// 一级栏目分组：组与组之间用分栏区分
export const mainNavGroups = [
  [{ path: '/', label: 'AI时代导航' }],
  [{ path: '/showcase', label: 'AI实战成果' }],
  [
    { path: '/courses', label: 'AI能力课程' },
    { path: '/research', label: 'AI科创实践' },
    { path: '/events', label: 'AI竞赛挑战' },
    { path: '/community', label: 'AI学习社群' },
  ],
  [{ path: '/career', label: 'AI职业发展' }],
  [{ path: '/cert', label: '权威认证体系' }],
  [{ path: '/mall', label: 'AI工具资源库' }],
  [{ path: '/franchise', label: '加盟合作' }],
  [{ path: '/profile', label: '我的AI工作台' }],
]

// 第 8 组：登录、注册
export const authNav = [
  { path: '/login', label: '登录' },
  { path: '/register', label: '注册' },
]

// 全部 8 组（含登录注册，用于顶栏分栏展示）
export const allNavGroups = [...mainNavGroups, authNav]

// 扁平列表（用于移动端等，不含登录注册）
export const mainNav = mainNavGroups.flat()
