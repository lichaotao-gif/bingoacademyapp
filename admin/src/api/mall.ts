import { http } from '@/utils/request'

/** 商品类型（匹配前端商城分类） */
export const PRODUCT_TYPES = [
  { id: '1', name: '单次使用卡' },
  { id: '2', name: '月卡' },
  { id: '3', name: '季卡' },
  { id: '4', name: '年卡' },
  { id: '5', name: '套餐包' },
] as const

/** 订单状态 */
export const ORDER_STATUS_MAP: Record<string, { text: string; color: string }> = {
  '0': { text: '待支付', color: 'orange' },
  '1': { text: '已支付', color: 'green' },
  '2': { text: '已取消', color: 'red' },
  '3': { text: '已完成', color: 'blue' },
  '4': { text: '已退款', color: 'default' },
}

export interface MallProduct {
  id: string
  name: string
  productType: string
  coverUrl?: string
  price: number
  originalPrice: number
  salesCount: number
  status: string
  description?: string
  createTime?: string
}

export interface MallOrder {
  id: string
  orderNo: string
  userId: string
  userName?: string
  productName?: string
  amount: number
  payType?: string
  status: string
  createTime: string
}

export interface MallPackage {
  id: string
  name: string
  price: number
  validDays: number
  toolCount: number
  toolIds?: string
  salesCount: number
  description?: string
  createTime?: string
}

export function getMallProductList(params?: { keyword?: string; productType?: string; status?: string }) {
  return http.get<MallProduct[]>('/mall/product/list', params as Record<string, string>)
}

export function addMallProduct(data: Partial<MallProduct>) {
  return http.post<MallProduct>('/mall/product/add', data)
}

export function updateMallProduct(data: Partial<MallProduct>) {
  return http.post<MallProduct>('/mall/product/update', data)
}

export function deleteMallProduct(id: string) {
  return http.post(`/mall/product/delete/${id}`)
}

export function getOrderList(params?: Record<string, string>) {
  return http.get<MallOrder[]>('/mall/order/list', params as Record<string, string>)
}

export function updateOrderStatus(id: string, status: string) {
  return http.post(`/mall/order/update-status/${id}`, { status })
}

export function getPackageList() {
  return http.get<MallPackage[]>('/mall/package/list')
}

export function addPackage(data: Partial<MallPackage>) {
  return http.post<MallPackage>('/mall/package/add', data)
}

export function updatePackage(data: Partial<MallPackage>) {
  return http.post<MallPackage>('/mall/package/update', data)
}

export function deletePackage(id: string) {
  return http.post(`/mall/package/delete/${id}`)
}
