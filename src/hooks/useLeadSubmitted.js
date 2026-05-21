import { useEffect, useState } from 'react'
import { LEAD_CAPTURE_CHANGED_EVENT } from '../utils/leadCaptureAssets'
import { isLeadSubmitted } from '../utils/leadCaptureStorage'

export function useLeadSubmitted(leadKey) {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const sync = () => setTick((t) => t + 1)
    window.addEventListener(LEAD_CAPTURE_CHANGED_EVENT, sync)
    return () => window.removeEventListener(LEAD_CAPTURE_CHANGED_EVENT, sync)
  }, [])

  void tick
  return isLeadSubmitted(leadKey)
}
