/** 已购课程 id 列表（演示：支付成功页写入，详情页/评价等读取） */
export const PURCHASED_COURSE_IDS_KEY = 'bingo_purchased_course_ids'

export function getPurchasedCourseIds() {
  try {
    const raw = localStorage.getItem(PURCHASED_COURSE_IDS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : []
  } catch {
    return []
  }
}

export function addPurchasedCourseId(courseId) {
  if (!courseId || typeof courseId !== 'string') return
  const ids = getPurchasedCourseIds()
  if (ids.includes(courseId)) return
  ids.push(courseId)
  try {
    localStorage.setItem(PURCHASED_COURSE_IDS_KEY, JSON.stringify(ids))
  } catch {
    /* ignore quota */
  }
}
