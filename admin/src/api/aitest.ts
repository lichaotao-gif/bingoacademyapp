import { http } from '@/utils/request'

export interface AITestDimension {
  id: number
  name: string
  desc: string
  scoreWeight: number
  createTime: string
}

export interface AITestQuestion {
  id: number
  title: string
  dimensionName: string
  type: 'single' | 'multiple' | 'essay'
  score: number
}

export interface AITestUserRecord {
  id: number
  username: string
  phone: string
  totalScore: number
  testTime: string
  status: 'finished' | 'unfinished'
}

export interface AITestReportAudit {
  reportId: number
  username: string
  totalScore: number
  submitTime: string
  auditStatus: 'pending' | 'passed' | 'rejected'
}

export function getAITestStats() {
  return http.get<{
    totalUsers: number
    userTrend: number
    todayNew: number
    todayTrend: number
    averageScore: number
    scoreTrend: number
    reportCount: number
    reportTrend: number
  }>('/aitest/stats')
}

export function getDimensionList() {
  return http.get<AITestDimension[]>('/aitest/dimension/list')
}

export function saveDimension(data: Partial<AITestDimension>) {
  return data.id ? http.put(`/aitest/dimension/${data.id}`, data) : http.post('/aitest/dimension/add', data)
}

export function deleteDimension(id: number) {
  return http.post(`/aitest/dimension/delete/${id}`)
}

export function getQuestionList() {
  return http.get<AITestQuestion[]>('/aitest/question/list')
}

export function getUserTestList(params?: { keyword?: string; status?: string; page?: number; size?: number }) {
  return http.get<{ list: AITestUserRecord[]; total: number }>('/aitest/user/list', params as Record<string, string | number>)
}

export function getReportAuditList(params?: { status?: string; page?: number; size?: number }) {
  return http.get<{ list: AITestReportAudit[]; total: number }>('/aitest/report/audit/list', params as Record<string, string | number>)
}

export function passReportAudit(reportId: number) {
  return http.post(`/aitest/report/audit/pass/${reportId}`)
}

export function rejectReportAudit(reportId: number) {
  return http.post(`/aitest/report/audit/reject/${reportId}`)
}
