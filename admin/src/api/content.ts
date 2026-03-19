import { http } from '@/utils/request'

/** 页面状态 */
export type PageStatus = 'draft' | 'published' | 'offline'

export interface ContentPage {
  id: number
  name: string
  path: string
  status: PageStatus
  viewCount?: number
  updateTime: string
}

export function getPageList(params?: { keyword?: string; status?: string; page?: number; size?: number }) {
  return http.get<{ list: ContentPage[]; total: number }>('/content/page/list', params as Record<string, string | number>)
}

export function getPageDetail(id: number) {
  return http.get<ContentPage>(`/content/page/${id}`)
}

export function savePage(data: Partial<ContentPage>) {
  return data.id ? http.put(`/content/page/${data.id}`, data) : http.post('/content/page/add', data)
}

export function batchPageAction(data: { ids: number[]; action: string; status?: string }) {
  return http.post('/content/page/batch', data)
}

/** Banner 位置 */
export type BannerPosition = 'home_top' | 'home_mid' | 'course_top'

export interface ContentBanner {
  id: number
  title: string
  imageUrl: string
  linkUrl?: string
  position: BannerPosition
  sort: number
  status: 0 | 1
  startTime?: string
  endTime?: string
  updateTime: string
}

export const BANNER_POSITION_MAP: Record<BannerPosition, string> = {
  home_top: '首页顶部',
  home_mid: '首页中部',
  course_top: '课程页顶部',
}

export function getBannerList(params?: { position?: string; status?: number; page?: number; size?: number }) {
  return http.get<{ list: ContentBanner[]; total: number }>('/content/banner/list', params as Record<string, string | number>)
}

export function saveBanner(data: Partial<ContentBanner>) {
  return data.id ? http.put(`/content/banner/${data.id}`, data) : http.post('/content/banner/add', data)
}

export function deleteBanner(id: number) {
  return http.post(`/content/banner/delete/${id}`)
}
