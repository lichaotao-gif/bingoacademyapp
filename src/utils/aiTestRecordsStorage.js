/** L3 / AI 测评记录（演示：浏览器 localStorage，单机学生维度） */
const KEY = 'bingo_academy_ai_test_records_v1'
const MAX_RECORDS = 50

export function getAiTestRecords() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

export function getAiTestRecordById(id) {
  if (!id) return null
  return getAiTestRecords().find((r) => r.id === id) || null
}

export function appendAiTestRecord(record) {
  const list = getAiTestRecords()
  const item = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: new Date().toISOString(),
    ...record,
  }
  list.unshift(item)
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX_RECORDS)))
  } catch {
    /* quota */
  }
  return item
}

export function removeAiTestRecord(id) {
  const list = getAiTestRecords().filter((r) => r.id !== id)
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    /* ignore */
  }
}
