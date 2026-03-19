import dayjs from 'dayjs'

/** 时间格式化 */
export function fmtTime(v: string | number | Date | null | undefined, format = 'YYYY-MM-DD HH:mm:ss'): string {
  if (v == null) return '-'
  return dayjs(v).format(format)
}

/** 金额格式化 */
export function fmtMoney(v: number | string | null | undefined): string {
  if (v == null) return '¥0.00'
  return '¥' + Number(v).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/** 手机号脱敏 */
export function maskPhone(v: string | null | undefined): string {
  if (!v) return '-'
  return v.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2')
}
