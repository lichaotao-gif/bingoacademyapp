/** 状态码分段（与方案一致） */
export const ERROR_CODE = {
  SUCCESS: 200,
  SYSTEM: 1000,
  STUDENT: 2000,
  COURSE: 3000,
  COMPETITION: 4000,
  MALL: 5000,
  MARKETING: 6000,
  COOPERATION: 7000,
  FINANCE: 8000,
} as const

/** 订单状态 */
export const ORDER_STATUS = {
  0: '待支付',
  1: '已支付',
  2: '已完成',
  3: '已取消',
  4: '已退款',
} as const

/** 审核状态 */
export const AUDIT_STATUS = {
  0: '待审核',
  1: '通过',
  2: '驳回',
} as const
