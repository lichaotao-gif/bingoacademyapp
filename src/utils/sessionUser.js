/** 演示用：与个人中心展示一致的默认学员信息；后续可接登录态 or localStorage */
const DEFAULT_USER = { nickname: '缤果学员', avatarSeed: 'bingo-academy' }

/** 用户未上传头像时使用的站内默认图（相对站点根路径） */
export const DEFAULT_AVATAR_PATH = '/default-avatar.svg'

const STORAGE_KEY = 'bingo_session_user'

function isNonEmptyHttpOrPath(s) {
  if (typeof s !== 'string') return false
  const t = s.trim()
  if (!t) return false
  return t.startsWith('http://') || t.startsWith('https://') || t.startsWith('/')
}

export function getSessionUser() {
  if (typeof window === 'undefined') return { ...DEFAULT_USER, avatarUrl: '' }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const p = JSON.parse(raw)
      const nickname = typeof p?.nickname === 'string' && p.nickname.trim() ? p.nickname.trim() : DEFAULT_USER.nickname
      const seed = typeof p?.avatarSeed === 'string' && p.avatarSeed.trim() ? p.avatarSeed.trim() : nickname
      const avatarUrl = typeof p?.avatarUrl === 'string' ? p.avatarUrl.trim() : ''
      return { nickname, avatarSeed: seed, avatarUrl }
    }
  } catch {
    /* ignore */
  }
  return { ...DEFAULT_USER, avatarUrl: '' }
}

/** 报告页头像：有上传地址用上传，否则用默认 SVG */
export function sessionUserDisplayAvatarUrl(user) {
  if (user?.avatarUrl && isNonEmptyHttpOrPath(user.avatarUrl)) return user.avatarUrl
  return DEFAULT_AVATAR_PATH
}

/** @deprecated 保留兼容；新代码请用 sessionUserDisplayAvatarUrl */
export function sessionUserAvatarUrl(user) {
  const seed = encodeURIComponent((user?.avatarSeed || user?.nickname || 'user').toString())
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&size=128`
}
