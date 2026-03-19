import { http } from '@/utils/request'

/** 活动类型：优惠券/拼团/限时折扣/课程礼包 */
export type ActivityType = 'coupon' | 'group' | 'discount' | 'gift'

/** 活动状态 */
export type ActivityStatus = 'draft' | 'published' | 'paused' | 'ended'

export interface MarketingActivity {
  id: string
  name: string
  type: ActivityType
  startTime: string
  endTime: string
  status: ActivityStatus
  participantNum?: number
  convertNum?: number
  convertRate?: number
  createTime?: string
}

export const ACTIVITY_TYPE_MAP: Record<ActivityType, string> = {
  coupon: '优惠券',
  group: '拼团',
  discount: '限时折扣',
  gift: '课程礼包',
}

export const ACTIVITY_STATUS_MAP: Record<ActivityStatus, { text: string; color: string }> = {
  draft: { text: '草稿', color: 'default' },
  published: { text: '已发布', color: 'green' },
  paused: { text: '已暂停', color: 'orange' },
  ended: { text: '已结束', color: 'red' },
}

export function getActivityList(params?: {
  keyword?: string
  status?: string
  pageNum?: number
  pageSize?: number
}) {
  return http.get<{ list: MarketingActivity[]; total: number }>('/marketing/activity/list', params as Record<string, string | number>)
}

export function getActivityDetail(id: string) {
  return http.get<MarketingActivity>(`/marketing/activity/detail/${id}`)
}

export function getActivityStats(id: string) {
  return http.get<{ participantNum: number; convertNum: number; convertRate: number; [k: string]: unknown }>(`/marketing/activity/stats/${id}`)
}

export function saveActivity(data: Partial<MarketingActivity>) {
  return data.id
    ? http.put<MarketingActivity>('/marketing/activity/update', data)
    : http.post<MarketingActivity>('/marketing/activity/create', data)
}

export function changeActivityStatus(data: { id: string; status: ActivityStatus }) {
  return http.post('/marketing/activity/changeStatus', data)
}
