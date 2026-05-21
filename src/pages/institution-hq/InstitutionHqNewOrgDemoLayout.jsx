import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import NewOrgQualificationGuardModal from '../../components/NewOrgQualificationGuardModal'
import { INSTITUTION_HQ_PORTAL_NAV } from '../../constants/institutionHqPortalNav'
import {
  demoInstitutionPath,
  exitIsolatedNewOrgDemo,
  getNewOrgQualGuardCopy,
  isIsolatedNewOrgDemoSession,
  isNewRegistrantNeedsBasicApply,
  isNewRegistrantQualificationRestricted,
  NEW_ORG_DEMO_BASE,
  shouldBlockDemoFunctionalAction,
} from '../../utils/franchiseNewOrgOnboarding'
import { clearInstitutionHqSession, getInstitutionHqSession } from '../../utils/institutionHqStorage'
import {
  ensureIsolatedDemoEmptyQualification,
  migrateIsolatedNewOrgWorkspaceIfNeeded,
} from '../../utils/franchisePartnerStorage'
import {
  FlatIconChartBar,
  FlatIconCog,
  FlatIconHome,
  FlatIconMenu,
  FlatIconUserPlus,
  FlatIconUsers,
} from '../franchise-portal/FranchiseFlatIcons'

const INSTITUTION_HQ_NAV_ICON_BY_KEY = {
  dashboard: FlatIconHome,
  finance: FlatIconChartBar,
  'campus-accounts': FlatIconUsers,
  'hq-staff-accounts': FlatIconUserPlus,
  settings: FlatIconCog,
}

const DEMO_NAV = INSTITUTION_HQ_PORTAL_NAV.map((item) => ({
  key: item.key,
  label: item.label,
  to: demoInstitutionPath(item.path.replace(/^\/institution-hq\//, '')),
}))

const TITLE_MAP = Object.fromEntries(DEMO_NAV.map((x) => [x.key, x.label]))

function isAllowedDemoInteraction(target) {
  if (!(target instanceof Element)) return true
  if (target.closest('[data-onboarding-allow]')) return true
  if (target.closest('aside')) return true
  if (target.closest('header')) return true
  return false
}

function isDemoQualificationEditAllowed(target, pathname) {
  if (!(target instanceof Element)) return false
  if (!pathname.includes('/settings') && !pathname.includes('/onboarding/qualification')) return false
  return Boolean(target.closest('[data-onboarding-allow]'))
}

function findBlockedDemoTarget(target, pathname) {
  if (!(target instanceof Element)) return null
  if (isAllowedDemoInteraction(target)) return null
  if (isDemoQualificationEditAllowed(target, pathname)) return null

  const interactive = target.closest(
    [
      'button',
      '[role="button"]',
      'input:not([type="hidden"])',
      'select',
      'textarea',
      'label[for]',
      'a[href]',
      'summary',
    ].join(','),
  )
  if (!interactive) return null
  if (interactive.closest('nav')) return null
  if (interactive.closest('[data-onboarding-allow]')) return null

  const tag = interactive.tagName
  if (tag === 'A') {
    const href = interactive.getAttribute('href') || ''
    if (!href || href.startsWith('#')) return null
  }

  return interactive
}

export default function InstitutionHqNewOrgDemoLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [session, setSession] = useState(() => getInstitutionHqSession())
  const [openNav, setOpenNav] = useState(false)
  const [qualGuardOpen, setQualGuardOpen] = useState(false)
  const [guardCopy, setGuardCopy] = useState(() => getNewOrgQualGuardCopy(null))
  const [onboardingTick, setOnboardingTick] = useState(0)

  useLayoutEffect(() => {
    const s = getInstitutionHqSession()
    if (!s || !isIsolatedNewOrgDemoSession(s)) {
      clearInstitutionHqSession()
      navigate('/', { replace: true })
      return
    }
    setSession(s)
  }, [navigate, location.pathname])

  useEffect(() => {
    const sync = () => {
      const s = getInstitutionHqSession()
      if (!s || !isIsolatedNewOrgDemoSession(s)) {
        navigate('/', { replace: true })
        return
      }
      setSession(s)
      setOnboardingTick((n) => n + 1)
    }
    window.addEventListener('institution-hq-session-changed', sync)
    window.addEventListener('franchise-new-org-onboarding-changed', sync)
    return () => {
      window.removeEventListener('institution-hq-session-changed', sync)
      window.removeEventListener('franchise-new-org-onboarding-changed', sync)
    }
  }, [navigate])

  useEffect(() => {
    if (!session?.qualPartnerId) return
    let changed = false
    if (migrateIsolatedNewOrgWorkspaceIfNeeded(session.qualPartnerId, session.qualRefCode)) changed = true
    if (ensureIsolatedDemoEmptyQualification(session.qualPartnerId, session.qualRefCode)) changed = true
    if (changed) window.dispatchEvent(new Event('franchise-partner-workspace-changed'))
  }, [session?.qualPartnerId, session?.qualRefCode])

  const needsBasicApply = useMemo(() => isNewRegistrantNeedsBasicApply(session), [session, onboardingTick])
  const qualRestricted = useMemo(
    () => isNewRegistrantQualificationRestricted(session),
    [session, onboardingTick],
  )
  const actionBlocked = needsBasicApply || qualRestricted

  useEffect(() => {
    if (!session) return
    if (needsBasicApply && !location.pathname.includes('/onboarding/apply')) {
      navigate(demoInstitutionPath('onboarding/apply'), { replace: true })
    }
  }, [session, needsBasicApply, location.pathname, navigate])

  const openQualGuardModal = useCallback(() => {
    setGuardCopy(getNewOrgQualGuardCopy(getInstitutionHqSession()))
    setQualGuardOpen(true)
  }, [])

  const interceptDemoAction = useCallback(
    (e) => {
      if (!shouldBlockDemoFunctionalAction(session)) return
      const blocked = findBlockedDemoTarget(e.target, location.pathname)
      if (!blocked) return
      e.preventDefault()
      e.stopPropagation()
      openQualGuardModal()
    },
    [session, openQualGuardModal, location.pathname],
  )

  const exitDemo = useCallback(() => {
    exitIsolatedNewOrgDemo()
    navigate('/', { replace: true })
  }, [navigate])

  const pageTitle = useMemo(() => {
    const seg = location.pathname.replace(NEW_ORG_DEMO_BASE, '').split('/').filter(Boolean)[0] || 'dashboard'
    if (seg === 'onboarding') {
      const sub = location.pathname.split('/').filter(Boolean).pop()
      if (sub === 'apply') return '机构基本资料'
      if (sub === 'qualification') return '机构资质'
    }
    return TITLE_MAP[seg] || '机构总管理'
  }, [location.pathname])

  const bannerCopy = useMemo(() => (session ? getNewOrgQualGuardCopy(session) : null), [session, onboardingTick])

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f6fb] text-slate-500 text-sm">
        正在进入…
      </div>
    )
  }

  const orgTitle = (session.orgName || '机构总管理').trim()
  const roleLine = '机构总管理主账号'

  return (
    <div className="flex min-h-screen w-full flex-col overflow-hidden bg-[#f4f6fb] md:flex-row">
      <aside
        className={
          'flex flex-col shrink-0 bg-bingo-dark text-slate-300 border-r border-slate-800/80 ' +
          'fixed inset-y-0 left-0 z-50 w-[min(100vw,280px)] transition-transform duration-200 ' +
          (openNav ? 'translate-x-0' : '-translate-x-full') +
          ' md:static md:translate-x-0 md:w-[240px] md:min-h-screen md:overflow-hidden'
        }
      >
        <div className="p-5 border-b border-white/10">
          <p className="text-lg font-semibold text-white truncate" title={orgTitle}>
            {orgTitle}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">{roleLine}</p>
        </div>
        <nav className="p-3 space-y-0.5 flex-1 min-h-0 overflow-y-auto">
          {DEMO_NAV.map((item) => {
            const Icon = INSTITUTION_HQ_NAV_ICON_BY_KEY[item.key] || INSTITUTION_HQ_NAV_ICON_BY_KEY.dashboard
            return (
              <NavLink
                key={item.key}
                to={item.to}
                onClick={() => setOpenNav(false)}
                className={({ isActive }) =>
                  'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ' +
                  (isActive ? 'text-white bg-primary ring-1 ring-primary' : 'text-slate-400 hover:text-white hover:bg-white/5')
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="flex-1">{item.label}</span>
              </NavLink>
            )
          })}
        </nav>
        <div className="p-3 border-t border-white/10">
          <button
            type="button"
            onClick={exitDemo}
            className="w-full rounded-lg border border-white/15 bg-white/5 py-2 text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white transition"
          >
            退出登录
          </button>
        </div>
      </aside>

      {openNav ? (
        <button type="button" className="fixed inset-0 z-40 bg-black/50 md:hidden" aria-label="关闭" onClick={() => setOpenNav(false)} />
      ) : null}

      <div className="flex-1 min-w-0 flex flex-col min-h-0">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 px-4 py-3 bg-white border-b border-slate-200 shadow-sm">
          <button type="button" className="md:hidden p-2 rounded-lg border border-slate-200" onClick={() => setOpenNav(true)} aria-label="菜单">
            <FlatIconMenu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-slate-900 truncate flex-1">{pageTitle}</h1>
        </header>

        <main
          className="flex-1 overflow-y-auto px-4 py-6 md:px-8"
          onClickCapture={interceptDemoAction}
          onSubmitCapture={interceptDemoAction}
        >
          {actionBlocked && bannerCopy ? (
            <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              <p className="font-semibold">{bannerCopy.title}</p>
              <p className="mt-1 leading-relaxed text-amber-900/90">{bannerCopy.message}</p>
              <button
                type="button"
                data-onboarding-allow
                onClick={() => navigate(bannerCopy.primaryPath)}
                className="mt-2 inline-flex text-sm font-semibold text-primary hover:underline"
              >
                {bannerCopy.primaryLabel} →
              </button>
            </div>
          ) : null}
          <Outlet context={{ session, portalBase: NEW_ORG_DEMO_BASE }} />
        </main>
      </div>

      <NewOrgQualificationGuardModal
        open={qualGuardOpen}
        onClose={() => setQualGuardOpen(false)}
        title={guardCopy.title}
        message={guardCopy.message}
        primaryLabel={guardCopy.primaryLabel}
        onPrimary={() => navigate(guardCopy.primaryPath)}
      />
    </div>
  )
}
