import { useCallback, useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { getWorkspace } from '../../utils/franchisePartnerStorage'

export function useFranchiseWorkspace() {
  const { session } = useOutletContext()
  const [ws, setWs] = useState(null)

  const refresh = useCallback(() => {
    if (!session?.partnerId) return
    setWs(getWorkspace(session.partnerId, session.refCode))
  }, [session?.partnerId, session?.refCode])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { session, ws, refresh }
}
