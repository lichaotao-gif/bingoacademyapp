import { useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import { NEW_ORG_DEMO_BASE } from '../../utils/franchiseNewOrgOnboarding'

export const FRANCHISE_PORTAL_BASE_DEFAULT = '/franchise-partner'

export function resolveFranchisePortalBase(ctx) {
  if (ctx?.portalBase) return String(ctx.portalBase).replace(/\/$/, '')
  if (ctx?.session?.isolatedNewOrgDemo) return NEW_ORG_DEMO_BASE
  return FRANCHISE_PORTAL_BASE_DEFAULT
}

/** 在演示 / 正式工作台之间生成正确前缀的路径 */
export function buildFranchisePortalPath(base, path) {
  const b = String(base || FRANCHISE_PORTAL_BASE_DEFAULT).replace(/\/$/, '')
  const raw = String(path || '').trim()
  if (!raw) return b
  if (raw.startsWith(b + '/')) return raw
  if (raw.startsWith('/institution-hq/demo-new-org')) return raw
  if (raw.startsWith('/franchise-partner/demo-new-org')) {
    return raw.replace('/franchise-partner/demo-new-org', '/institution-hq/demo-new-org')
  }
  if (raw.startsWith('/franchise-partner/')) {
    return `${b}${raw.slice('/franchise-partner'.length)}`
  }
  return `${b}${raw.startsWith('/') ? raw : `/${raw}`}`
}

export function useFranchisePortalPaths() {
  const ctx = useOutletContext()
  const portalBase = useMemo(() => resolveFranchisePortalBase(ctx), [ctx?.portalBase, ctx?.session?.isolatedNewOrgDemo])
  const p = useMemo(() => (sub) => buildFranchisePortalPath(portalBase, sub), [portalBase])
  return { portalBase, p }
}
