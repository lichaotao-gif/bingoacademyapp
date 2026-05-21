import { LEAD_CAPTURE_CHANGED_EVENT } from './leadCaptureAssets'

const LS_KEY = 'bingo_lead_capture_submitted_v1'

function readMap() {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(LS_KEY)
    const o = raw ? JSON.parse(raw) : {}
    return o && typeof o === 'object' && !Array.isArray(o) ? o : {}
  } catch {
    return {}
  }
}

function writeMap(map) {
  if (typeof window === 'undefined') return
  localStorage.setItem(LS_KEY, JSON.stringify(map))
  window.dispatchEvent(new Event(LEAD_CAPTURE_CHANGED_EVENT))
}

export function isLeadSubmitted(leadKey) {
  const key = String(leadKey || '').trim()
  if (!key) return false
  return Boolean(readMap()[key]?.submittedAt)
}

export function saveLeadSubmission(leadKey, payload = {}) {
  const key = String(leadKey || '').trim()
  if (!key) return
  const map = readMap()
  map[key] = {
    submittedAt: new Date().toISOString(),
    name: String(payload.name || '').trim(),
    phone: String(payload.phone || '').trim(),
    org: String(payload.org || '').trim(),
  }
  writeMap(map)
}
