/** 课程详情页用户提交的评价（本地持久化） value: { [courseId]: Review[] } */
export const DETAIL_USER_REVIEWS_KEY = 'bingo_course_detail_user_reviews'

export function getUserReviewsForCourse(courseId) {
  if (!courseId) return []
  try {
    const raw = localStorage.getItem(DETAIL_USER_REVIEWS_KEY)
    const all = raw ? JSON.parse(raw) : {}
    const list = all[courseId]
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

export function prependUserReviewForCourse(courseId, review) {
  if (!courseId || !review) return
  try {
    const raw = localStorage.getItem(DETAIL_USER_REVIEWS_KEY)
    const all = raw && typeof raw === 'string' ? JSON.parse(raw) : {}
    const prev = Array.isArray(all[courseId]) ? all[courseId] : []
    all[courseId] = [review, ...prev]
    localStorage.setItem(DETAIL_USER_REVIEWS_KEY, JSON.stringify(all))
  } catch {
    /* ignore */
  }
}
