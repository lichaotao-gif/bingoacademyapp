import { http } from '@/utils/request'

/** 学校状态：active=已启用 disabled=已停用 */
export type SchoolStatus = 'active' | 'disabled'

/** 发证申请状态 */
export type CertRequestStatus = 'pending' | 'approved' | 'rejected'

export interface School {
  school_id: string
  name: string
  province: string
  city: string
  district: string
  address: string
  contact_name: string
  contact_phone: string
  owner_name: string
  owner_phone: string
  status: SchoolStatus
  granted_course_count: number
  teacher_count: number
  class_count: number
  student_count: number
  remark?: string
  create_time: string
}

export interface CertRequest {
  request_id: string
  school_id: string
  school_name: string
  class_id: string
  class_name: string
  course_name: string
  status: CertRequestStatus
  applicant_name: string
  student_count: number
  submit_time: string
  review_time?: string
  reviewer?: string
  reject_reason?: string
}

export function getSchoolList(params: { page?: number; size?: number; keyword?: string; region?: string; status?: SchoolStatus }) {
  return http.get<School[]>('/school/list', params as Record<string, string | number>)
}

export function getSchoolDetail(id: string) {
  return http.get<School>(`/school/detail/${id}`)
}

export function createSchool(data: Record<string, unknown>) {
  return http.post('/school/create', data)
}

export function updateSchool(id: string, data: Record<string, unknown>) {
  return http.put(`/school/update/${id}`, data)
}

export function updateSchoolStatus(id: string, status: SchoolStatus) {
  return http.put(`/school/status/${id}`, { status })
}

export function resetSchoolOwnerPassword(id: string, password: string) {
  return http.put(`/school/owner-password/${id}`, { password })
}

export function updateSchoolCourseGrants(id: string, courseIds: string[]) {
  return http.put(`/school/course-grant/${id}`, { courseIds })
}

export function getCertRequestList(params: { status?: CertRequestStatus; schoolId?: string }) {
  return http.get<CertRequest[]>('/school/cert-request/list', params as Record<string, string>)
}

export function approveCertRequest(id: string) {
  return http.put(`/school/cert-request/approve/${id}`, {})
}

export function rejectCertRequest(id: string, reason: string) {
  return http.put(`/school/cert-request/reject/${id}`, { reason })
}

export function transferStudentSchool(studentId: string, targetSchoolId: string) {
  return http.put('/school/student/transfer', { studentId, targetSchoolId })
}
