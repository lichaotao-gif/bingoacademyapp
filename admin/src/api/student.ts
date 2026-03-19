import { http } from '@/utils/request'

/** 学员状态：1=正常 2=冻结 3=待审核 4=注销 */
export type StudentStatus = 1 | 2 | 3 | 4

export interface Student {
  student_id: number
  real_name: string
  phone: string
  grade?: string
  class_name?: string
  status: StudentStatus
  ai_test_level?: string
  total_points?: number
  commission_balance?: number
  create_time: string
  source?: string
}

export function getStudentList(params: {
  page?: number
  size?: number
  keyword?: string
  status?: number
  grade?: string
  class_name?: string
  startTime?: string
  endTime?: string
}) {
  return http.get<Student[]>('/student/list', params as Record<string, string | number>)
}

export function updateStudentStatus(id: number, status: number, reason?: string) {
  return http.put(`/student/status/${id}`, { status, reason })
}

export function batchOperateStudent(data: { ids: number[]; status: number; reason?: string }) {
  return http.put('/student/batch', data)
}

export function exportStudent(params: { ids?: number[] }) {
  return http.get('/student/export', params as Record<string, string | number>)
}
