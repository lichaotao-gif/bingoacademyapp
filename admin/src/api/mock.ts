/** 通用分页 Mock 响应 */
export function mockPage<T>(list: T[], page = 1, size = 10) {
  const start = (page - 1) * size
  const data = list.slice(start, start + size)
  return { code: 200, msg: '成功', data, total: list.length }
}
