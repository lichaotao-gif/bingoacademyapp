import { http } from '@/utils/request'

/** 报表维度：学员/课程/赛事/合作/运营/综合 */
export type ReportCategory = 'student' | 'course' | 'match' | 'cooperation' | 'operation' | 'combined'

/** 导出格式 */
export type ExportFormat = 'xlsx' | 'csv' | 'pdf'

export interface ExportParams {
  timeRange: [string, string]
  categories: ReportCategory[]
  format: ExportFormat
}

export interface ExportResult {
  fileId: string
  fileName: string
  downloadUrl: string
}

export interface ExportRecord {
  fileId: string
  fileName: string
  format: string
  categories: string[]
  exportTime: string
  exportUser: string
  fileSize?: string
}

export function exportReport(data: ExportParams) {
  return http.post<ExportResult>('/statistics/export', {
    timeRange: data.timeRange,
    categories: data.categories,
    format: data.format,
  })
}

export function getExportRecordList(params?: { page?: number; size?: number }) {
  return http.get<{ list: ExportRecord[]; total: number }>('/statistics/export/record', params as Record<string, number>)
}
