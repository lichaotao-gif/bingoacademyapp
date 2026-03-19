import { http } from '@/utils/request'

export type SettlementStatus = 'pending' | 'processing' | 'completed' | 'exception'
export type SettlementTargetType = 'teacher' | 'merchant' | 'course'

export interface SettlementOrderItem {
  orderNo: string
  courseName: string
  orderAmount: number
  settlementRatio: number
  orderSettlementAmount: number
  orderCreateTime?: string
}

export interface Settlement {
  settlementNo: string
  targetName: string
  targetType: SettlementTargetType
  settlementAmount: number
  feeAmount: number
  actualAmount: number
  settlementCycle: string
  status: SettlementStatus
  createTime: string
  orderList: SettlementOrderItem[]
  auditor?: string
  auditTime?: string
  payTime?: string
  payAccount?: string
  taxRate?: number
}

export function getSettlementStats(params?: { startDate?: string; endDate?: string }) {
  return http.get<{
    totalSettlementAmount: number
    settledAmount: number
    pendingAmount: number
    exceptionOrderCount: number
    trendRate: { income: number; settled: number; pending: number; exception: number }
  }>('/finance/settlement/stats', params as Record<string, string>)
}

export function getSettlementList(params?: { page?: number; size?: number; status?: string; targetType?: string; keyword?: string; startDate?: string; endDate?: string }) {
  return http.get<{ list: Settlement[]; total: number }>('/finance/settlement/list', params as Record<string, string | number>)
}
