import { useCallback, useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { getWorkspace } from '../../utils/franchisePartnerStorage'
import { useFranchisePortalPaths } from './franchisePortalPaths'

export function useFranchiseWorkspace() {
  /** 避免未传 context 时解构报错导致整页白屏 */
  const outletCtx = useOutletContext()
  const session = outletCtx && typeof outletCtx === 'object' ? outletCtx.session : undefined
  const { portalBase, p } = useFranchisePortalPaths()
  const [ws, setWs] = useState(null)

  const refresh = useCallback(() => {
    if (!session?.partnerId) return
    try {
      setWs(getWorkspace(session.partnerId, session.refCode))
    } catch (e) {
      console.error('getWorkspace failed', e)
      setWs(null)
    }
  }, [session?.partnerId, session?.refCode])

  /**
   * 推迟到下一宏任务再读 localStorage：避免 getWorkspace 内 JSON 解析阻塞首帧，
   * 否则账号设置等页会一直像「没出来」（白屏/无内容）直到解析结束。
   */
  useEffect(() => {
    if (!session?.partnerId) {
      setWs(null)
      return
    }
    let cancelled = false
    const tid = window.setTimeout(() => {
      if (cancelled) return
      try {
        setWs(getWorkspace(session.partnerId, session.refCode))
      } catch (e) {
        console.error('getWorkspace failed', e)
        setWs(null)
      }
    }, 0)
    return () => {
      cancelled = true
      window.clearTimeout(tid)
    }
  }, [session?.partnerId, session?.refCode])

  useEffect(() => {
    const onWsChange = () => refresh()
    window.addEventListener('franchise-partner-workspace-changed', onWsChange)
    return () => window.removeEventListener('franchise-partner-workspace-changed', onWsChange)
  }, [refresh])

  return { session, ws, refresh, portalBase, p }
}
