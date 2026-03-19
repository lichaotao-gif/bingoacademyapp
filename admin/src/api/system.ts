import { http } from '@/utils/request'

export interface Admin {
  admin_id: number
  username: string
  real_name: string
  phone?: string
  role_id: number
  role_name?: string
  status: number
  create_time: string
}

export function getAdminList(params: {
  page?: number
  size?: number
  username?: string
  status?: number
}) {
  return http.get<Admin[]>('/system/admin', params as Record<string, string | number>)
}

export function createAdmin(data: { username: string; password: string; real_name: string; role_id: number }) {
  return http.post<Admin>('/system/admin', data)
}

export function updateAdmin(id: number, data: Partial<Admin>) {
  return http.put<Admin>(`/system/admin/${id}`, data)
}
