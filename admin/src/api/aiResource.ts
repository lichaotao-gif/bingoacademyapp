import { http } from '@/utils/request'

/** AI工具分类（匹配前端展示） */
export const AI_RESOURCE_CATEGORIES = [
  { id: '1', name: 'AI写作' },
  { id: '2', name: 'AI绘画' },
  { id: '3', name: 'AI语音' },
  { id: '4', name: 'AI编程' },
  { id: '5', name: 'AI数据分析' },
  { id: '6', name: 'AI设计' },
] as const

export interface AIResource {
  id: string
  name: string
  categoryId: string
  coverUrl?: string
  description?: string
  detail?: string
  price: number
  useCount: number
  status: string
  sort: number
  createTime?: string
}

export function getAIResourceList(params?: { keyword?: string; categoryId?: string; status?: string }) {
  return http.get<AIResource[]>('/ai-resource/list', params as Record<string, string>)
}

export function addAIResource(data: Partial<AIResource>) {
  return http.post<AIResource>('/ai-resource/add', data)
}

export function updateAIResource(data: Partial<AIResource>) {
  return http.post<AIResource>('/ai-resource/update', data)
}

export function deleteAIResource(id: string) {
  return http.post(`/ai-resource/delete/${id}`)
}

export function changeResourceStatus(id: string, status: string) {
  return http.post(`/ai-resource/change-status/${id}`, { status })
}
