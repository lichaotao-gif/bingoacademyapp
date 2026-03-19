/** 权限码（与后端 permCode 对应） */
export const PERM = {
  ADMIN_VIEW: 'system:admin:view',
  ADMIN_EDIT: 'system:admin:edit',
  ROLE_VIEW: 'system:role:view',
  ROLE_EDIT: 'system:role:edit',
  ROLE_ASSIGN: 'system:role:assignPerm',
  LOG_VIEW: 'system:log:view',
  STUDENT_VIEW: 'student:view',
  STUDENT_EDIT: 'student:edit',
  STUDENT_FREEZE: 'student:freeze',
  STUDENT_BATCH: 'student:batch',
  STUDENT_EXPORT: 'student:export',
  COURSE_VIEW: 'course:view',
  COURSE_EDIT: 'course:edit',
  COURSE_DELETE: 'course:delete',
  COURSE_BATCH: 'course:batch',
  COMPETITION_VIEW: 'competition:view',
  COMPETITION_EDIT: 'competition:edit',
  COMPETITION_PUBLISH: 'competition:publish',
  COMPETITION_DELETE: 'competition:delete',
} as const

/** 从 Token 或用户信息中解析权限列表（Mock 时使用全部） */
export function getPerms(): string[] {
  try {
    const u = localStorage.getItem('bingo_admin_user')
    if (!u) return []
    const { perms } = JSON.parse(u)
    return Array.isArray(perms) ? perms : []
  } catch {
    return []
  }
}

/** 是否有某权限 */
export function hasPerm(permCode: string): boolean {
  const perms = getPerms()
  if (perms.includes('*')) return true
  return perms.includes(permCode)
}
