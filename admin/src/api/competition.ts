import { http } from '@/utils/request'

/** 赛事状态：pending=未开始 ongoing=进行中 ended=已结束 offline=已下架 */
export type CompetitionStatus = 'pending' | 'ongoing' | 'ended' | 'offline'

/** 赛事分类 */
export type CompetitionCategory = 'ai_code' | 'algorithm' | 'design'

export interface Competition {
  competition_id: number
  competition_name: string
  category: CompetitionCategory
  start_time: string
  end_time: string
  cover_url?: string
  desc?: string
  status: CompetitionStatus
  enroll_count: number
  enroll_start_time?: string
  enroll_end_time?: string
  max_enroll_count?: number
  need_audit?: boolean
}

export function getCompetitionList(params: {
  page?: number
  size?: number
  keyword?: string
  status?: string
  category?: string
}) {
  return http.get<Competition[]>('/competition/list', params as Record<string, string | number>)
}

export function getCompetitionDetail(id: number) {
  return http.get<Competition & { award_list?: { rank: string; count: number; prize: string }[]; enroll_list?: unknown[] }>(`/competition/${id}`)
}

export interface CompetitionApply {
  apply_id: number
  competition_id: number
  competition_name?: string
  student_id: number
  real_name: string
  phone: string
  grade?: string
  audit_status: number
  pay_status?: number
  apply_time: string
}

export function getApplyList(params: {
  page?: number
  size?: number
  competition_id?: number
  audit_status?: number
}) {
  return http.get<CompetitionApply[]>('/competition/apply', params as Record<string, string | number>)
}

export function batchAuditApply(data: {
  applyIds: number[]
  auditStatus: number
  rejectReason?: string
}) {
  return http.post('/competition/apply/batch-audit', data)
}
