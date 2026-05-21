import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import NewOrgQualificationGuardModal from '../../components/NewOrgQualificationGuardModal'
import {
  demoPartnerPath,
  exitIsolatedNewOrgDemo,
  getNewOrgQualGuardCopy,
  isIsolatedNewOrgDemoSession,
  isNewRegistrantNeedsBasicApply,
  isNewRegistrantQualificationRestricted,
  NEW_ORG_DEMO_BASE,
  shouldBlockDemoFunctionalAction,
} from '../../utils/franchiseNewOrgOnboarding'
import {
  clearPartnerSession,
  consumeQueuedPartnerSessionIfPresent,
  getPartnerSession,
  isPartnerAccountFrozen,
  migrateIsolatedNewOrgWorkspaceIfNeeded,
} from '../../utils/franchisePartnerStorage'
import { FRANCHISE_NAV_ICONS, FlatIconMenu } from './FranchiseFlatIcons'

const DEMO_NAV = [
  { key: 'dashboard', to: demoPartnerPath('dashboard'), label: '首页概览' },
  { key: 'classes', to: demoPartnerPath('classes'), label: '班级管理' },
  { key: 'students', to: demoPartnerPath('students'), label: '学生管理' },
  { key: 'recharge', to: demoPartnerPath('recharge'), label: '充课中心', badge: '后续版本' },
  { key: 'teaching-materials', to: demoPartnerPath('teaching-materials'), label: '学具商城' },
  { key: 'orders', to: demoPartnerPath('orders'), label: '订单管理', badge: '后续版本' },
  { key: 'finance', to: demoPartnerPath('finance'), label: '财务统计' },
  { key: 'staff-accounts', to: demoPartnerPath('staff-accounts'), label: '机构账号' },
  { key: 'settings', to: demoPartnerPath('settings'), label: '校区信息' },
]

const TITLE_MAP = Object.fromEntries(DEMO_NAV.map((x) => [x.key, x.label]))

function isAllowedDemoInteraction(target) {
  if (!(target instanceof Element)) return true
  if (target.closest('[data-onboarding-allow]')) return true
  if (target.closest('aside')) return true
  if (target.closest('header')) return true
  return false
}

function findBlockedDemoTarget(target) {
  if (!(target instanceof Element)) return null
  if (isAllowedDemoInteraction(target)) return null

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

export default function FranchisePartnerNewOrgDemoLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [session, setSession] = useState(() => {
    if (typeof window !== 'undefined') consumeQueuedPartnerSessionIfPresent()
    return getPartnerSession()
  })
  const [openNav, setOpenNav] = useState(false)
  const [qualGuardOpen, setQualGuardOpen] = useState(false)
  const [guardCopy, setGuardCopy] = useState(() => getNewOrgQualGuardCopy(null))
  const [onboardingTick, setOnboardingTick] = useState(0)

  useLayoutEffect(() => {
    consumeQueuedPartnerSessionIfPresent()
    const s = getPartnerSession()
    if (!s || !isIsolatedNewOrgDemoSession(s)) {
      clearPartnerSession()
      navigate('/franchise-partner/login', { replace: true })
      return
    }
    if (isPartnerAccountFrozen(s.partnerId)) {
      clearPartnerSession()
      navigate('/franchise-partner/login', {
        replace: true,
        state: { frozenMsg: '演示账号不可用' },
      })
      return
    }
    setSession(s)
  }, [navigate, location.pathname])

  useEffect(() => {
    const sync = () => {
      const s = getPartnerSession()
      if (!s || !isIsolatedNewOrgDemoSession(s)) {
        navigate('/franchise-partner/login', { replace: true })
        return
      }
      setSession(s)
      setOnboardingTick((n) => n + 1)
    }
    window.addEventListener('franchise-partner-session-changed', sync)
    window.addEventListener('franchise-new-org-onboarding-changed', sync)
    return () => {
      window.removeEventListener('franchise-partner-session-changed', sync)
      window.removeEventListener('franchise-new-org-onboarding-changed', sync)
    }
  }, [navigate])

  const needsBasicApply = useMemo(() => isNewRegistrantNeedsBasicApply(session), [session, onboardingTick])
  const qualRestricted = useMemo(
    () => isNewRegistrantQualificationRestricted(session),
    [session, onboardingTick],
  )
  const actionBlocked = needsBasicApply || qualRestricted

  useEffect(() => {
    if (!session?.partnerId) return
    if (migrateIsolatedNewOrgWorkspaceIfNeeded(session.partnerId, session.refCode)) {
      window.dispatchEvent(new Event('franchise-partner-workspace-changed'))
    }
  }, [session?.partnerId, session?.refCode])

  useEffect(() => {
    if (!session) return
    if (needsBasicApply && !location.pathname.includes('/onboarding/apply')) {
      navigate(demoPartnerPath('onboarding/apply'), { replace: true })
    }
  }, [session, needsBasicApply, location.pathname, navigate])

  const openQualGuardModal = useCallback(() => {
    setGuardCopy(getNewOrgQualGuardCopy(getPartnerSession()))
    setQualGuardOpen(true)
  }, [])

  const interceptDemoAction = useCallback(
    (e) => {
      if (!shouldBlockDemoFunctionalAction(session)) return
      const blocked = findBlockedDemoTarget(e.target)
      if (!blocked) return
      e.preventDefault()
      e.stopPropagation()
      openQualGuardModal()
    },
    [session, openQualGuardModal],
  )

  const exitDemo = useCallback(() => {
    exitIsolatedNewOrgDemo()
    navigate('/franchise-partner/login', { replace: true })
  }, [navigate])

  const pageTitle = useMemo(() => {
    const seg = location.pathname.replace(NEW_ORG_DEMO_BASE, '').split('/').filter(Boolean)[0] || 'dashboard'
    return TITLE_MAP[seg] || '新机构入驻演示'
  }, [location.pathname])

  const bannerCopy = useMemo(() => (session ? getNewOrgQualGuardCopy(session) : null), [session, onboardingTick])

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f6fb] text-slate-500 text-sm">
        正在进入演示…
      </div>
    )
  }

  const orgTitle = (session.orgName || '新机构入驻演示').trim()

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-[#f4f6fb] md:flex-row">
      <aside
        className={
          'flex flex-col shrink-0 bg-bingo-dark text-slate-300 border-r border-slate-800/80 ' +
          'fixed inset-y-0 left-0 z-50 w-[min(100vw,280px)] transition-transform duration-200 ' +
          (openNav ? 'translate-x-0' : '-translate-x-full') +
          ' md:static md:translate-x-0 md:w-[240px] md:min-h-0 md:overflow-hidden'
        }
      >
        <div className="p-5 border-b border-white/10">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-violet-300">独立演示</p>
          <p className="text-lg font-semibold text-white mt-1 truncate" title={orgTitle}>
            {orgTitle}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">新机构入驻 · 与正式账号无关</p>
        </div>
        <nav className="p-3 space-y-0.5 flex-1 min-h-0 overflow-y-auto">
          {DEMO_NAV.map((item, i) => {
            const Icon = FRANCHISE_NAV_ICONS[i] || FRANCHISE_NAV_ICONS[0]
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
                {item.badge ? (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/25 text-violet-200">{item.badge}</span>
                ) : null}
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
            退出演示
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
          <span className="text-[11px] text-violet-600 font-medium shrink-0 hidden sm:inline">演示模式</span>
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
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl font-bold text-slate-900">{pageTitle}</h2>
          </div>
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
