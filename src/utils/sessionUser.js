/** 演示用：与个人中心展示一致的默认学员信息；后续可接登录态 or localStorage */
const DEFAULT_USER = { nickname: '缤果学员', avatarSeed: 'bingo-academy' }

/** 用户未上传头像时使用的站内默认图（相对站点根路径） */
export const DEFAULT_AVATAR_PATH = '/default-avatar.svg'

const STORAGE_KEY = 'bingo_session_user'

function isNonEmptyHttpOrPath(s) {
  if (typeof s !== 'string') return false
  const t = s.trim()
  if (!t) return false
  return (
    t.startsWith('http://') ||
    t.startsWith('https://') ||
    t.startsWith('/') ||
    t.startsWith('data:image/')
  )
}

/** 预设卡通头像（DiceBear avataaars），与 avatarSeed 对应 */
export function dicebearAvatarUrl(seed, size = 128) {
  const s = encodeURIComponent(String(seed || 'user').slice(0, 80))
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${s}&size=${size}`
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

/**
 * 合并写入本机学员信息（演示用 localStorage）
 * @param {Partial<{ nickname: string, avatarSeed: string, avatarUrl: string }>} partial
 */
export function saveSessionUser(partial) {
  if (typeof window === 'undefined') return
  const cur = getSessionUser()
  const next = {
    nickname:
      partial.nickname !== undefined
        ? String(partial.nickname).trim() || DEFAULT_USER.nickname
        : cur.nickname,
    avatarSeed:
      partial.avatarSeed !== undefined
        ? String(partial.avatarSeed).trim() || cur.avatarSeed
        : cur.avatarSeed,
    avatarUrl: partial.avatarUrl !== undefined ? String(partial.avatarUrl).trim() : cur.avatarUrl,
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    /* quota 等 */
  }
}

/** 展示用头像：本地上传 / 外链 / data URL 优先，否则按 seed 生成卡通头像 */
export function sessionUserDisplayAvatarUrl(user) {
  if (user?.avatarUrl && isNonEmptyHttpOrPath(user.avatarUrl)) return user.avatarUrl.trim()
  return dicebearAvatarUrl(user?.avatarSeed || user?.nickname || 'user')
}

/** @deprecated 保留兼容；新代码请用 sessionUserDisplayAvatarUrl */
export function sessionUserAvatarUrl(user) {
  const seed = encodeURIComponent((user?.avatarSeed || user?.nickname || 'user').toString())
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&size=128`
}
