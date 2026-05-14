import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  INSTITUTION_HQ_PORTAL_NAV,
  resolveInstitutionHqMenuKey,
} from '../../constants/institutionHqPortalNav'
import {
  FlatIconChartBar,
  FlatIconCog,
  FlatIconHome,
  FlatIconSwitchAccount,
  FlatIconUserPlus,
  FlatIconUsers,
} from '../franchise-portal/FranchiseFlatIcons'
import { clearInstitutionHqSession, getInstitutionHqSession } from '../../utils/institutionHqStorage'
import DualPortalSwitchModal from '../../components/DualPortalSwitchModal'
import {
  applyFranchisePartnerSessionForCampus,
  dualSwitchToFranchisePartnerWorkspace,
  listCampusesForAdminPhone,
  phoneDigitsHasDualPortalAccess,
} from '../../utils/workspaceDualPortal'

const MASTER_ONLY_KEYS = new Set(['hq-staff-accounts'])

const TITLE_MAP = Object.fromEntries(INSTITUTION_HQ_PORTAL_NAV.map((x) => [x.key, x.label]))

/** 与加盟商侧栏一致的扁平描线图标（按菜单 key） */
const INSTITUTION_HQ_NAV_ICON_BY_KEY = {
  dashboard: FlatIconHome,
  finance: FlatIconChartBar,
  'campus-accounts': FlatIconUsers,
  'hq-staff-accounts': FlatIconUserPlus,
  settings: FlatIconCog,
}

export default function InstitutionHqLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [session, setSession] = useState(() => getInstitutionHqSession())
  const [portalSwitchOpen, setPortalSwitchOpen] = useState(false)
  const [accountPopoverOpen, setAccountPopoverOpen] = useState(false)
  const dualSwitchBtnRef = useRef(null)
  const accountPopoverRef = useRef(null)
  const accountAvatarBtnRef = useRef(null)

  const visibleNav = useMemo(() => {
    if (!session) return []
    const isStaff = session.staffSubUser === true
    const allowed = isStaff ? new Set(session.staffMenuKeys || []) : null
    return INSTITUTION_HQ_PORTAL_NAV.filter((item) => {
      if (MASTER_ONLY_KEYS.has(item.key)) return !isStaff
      if (isStaff && allowed && !allowed.has(item.key)) return false
      return true
    }).map((item) => ({ key: item.key, to: item.path, label: item.label }))
  }, [session])

  useLayoutEffect(() => {
    const s = getInstitutionHqSession()
    if (!s) {
      navigate('/institution-hq/login', { replace: true })
      return
    }
    setSession(s)
  }, [navigate, location.pathname])

  useEffect(() => {
    const sync = () => {
      const s = getInstitutionHqSession()
      if (!s) {
        navigate('/institution-hq/login', { replace: true })
        return
      }
      setSession(s)
    }
    window.addEventListener('institution-hq-session-changed', sync)
    return () => window.removeEventListener('institution-hq-session-changed', sync)
  }, [navigate])

  useEffect(() => {
    if (!accountPopoverOpen) return
    const onDocDown = (e) => {
      const el = accountPopoverRef.current
      const btn = accountAvatarBtnRef.current
      const t = e.target
      if (el && el.contains(t)) return
      if (btn && btn.contains(t)) return
      setAccountPopoverOpen(false)
    }
    document.addEventListener('mousedown', onDocDown)
    const onKey = (e) => {
      if (e.key === 'Escape') setAccountPopoverOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [accountPopoverOpen])

  useEffect(() => {
    setAccountPopoverOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!session) return
    const key = resolveInstitutionHqMenuKey(location.pathname)
    if (!key) return
    if (key === 'hq-staff-accounts' && session.staffSubUser) {
      const first = INSTITUTION_HQ_PORTAL_NAV.find(
        (i) => i.key !== 'hq-staff-accounts' && (session.staffMenuKeys || []).includes(i.key),
      )
      navigate(first?.path || '/institution-hq/dashboard', { replace: true })
      return
    }
    if (session.staffSubUser) {
      const allowed = new Set(session.staffMenuKeys || [])
      if (!allowed.has(key)) {
        const first = INSTITUTION_HQ_PORTAL_NAV.find((i) => i.key !== 'hq-staff-accounts' && allowed.has(i.key))
        navigate(first?.path || '/institution-hq/login', { replace: true })
      }
    }
  }, [location.pathname, session, navigate])

  const logout = useCallback(() => {
    clearInstitutionHqSession()
    navigate('/institution-hq/login', { replace: true })
  }, [navigate])

  const pageTitle = useMemo(() => {
    const key = resolveInstitutionHqMenuKey(location.pathname)
    if (key && TITLE_MAP[key]) return TITLE_MAP[key]
    return '机构总管理'
  }, [location.pathname])

  const showDualPortalSwitch = useMemo(
    () => Boolean(session?.loginPhone && phoneDigitsHasDualPortalAccess(session.loginPhone)),
    [session],
  )

  const campusOptionsForSwitch = useMemo(
    () => (session?.loginPhone ? listCampusesForAdminPhone(session.loginPhone) : []),
    [session?.loginPhone],
  )

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-slate-400 text-sm">正在进入…</div>
    )
  }

  const roleLine = session.staffSubUser
    ? `权限子账号 · ${session.staffRoleName || '已登录'}`
    : '机构总管理主账号'

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-[#f1f5f9] md:flex-row">
      <aside className="flex max-h-[60dvh] min-h-0 w-full shrink-0 flex-col overflow-hidden border-r border-slate-800/80 bg-[#0f172a] text-slate-300 md:max-h-none md:h-full md:w-[240px]">
        <div className="shrink-0 border-b border-white/10 p-5">
          <Link to="/" className="block rounded-lg -m-1 p-1 transition hover:bg-white/5">
            <img
              src={`${import.meta.env.BASE_URL}logo.svg`}
              alt="缤果AI学院"
              className="h-9 max-h-9 w-auto object-contain object-left"
              width={307}
              height={85}
            />
            <p className="mt-2 truncate text-lg font-semibold leading-snug text-white" title={session.orgName}>
              {session.orgName}
            </p>
            <p className="mt-1 text-[11px] tracking-wide text-cyan-200/90">{roleLine}</p>
            <p className="mt-2 rounded-md border border-white/10 bg-white/5 px-2 py-1.5 text-[10px] leading-relaxed text-slate-500">
              下辖多校区；「进入校区」在新标签页打开加盟商工作台。
            </p>
          </Link>
        </div>
        <nav className="min-h-0 flex-1 space-y-0.5 overflow-y-auto overscroll-contain p-3">
          {visibleNav.map((item) => {
            const Icon = INSTITUTION_HQ_NAV_ICON_BY_KEY[item.key] || FlatIconHome
            return (
            <NavLink
              key={item.key}
              to={item.to}
              className={({ isActive }) =>
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ' +
                (isActive
                  ? 'bg-primary text-white ring-1 ring-primary-600'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white')
              }
            >
              <Icon className="h-5 w-5 shrink-0 opacity-90" />
              <span className="min-w-0 flex-1">{item.label}</span>
            </NavLink>
            )
          })}
        </nav>
        {showDualPortalSwitch ? (
          <div className="shrink-0 border-t border-white/10 p-3">
            <button
              type="button"
              ref={dualSwitchBtnRef}
              onClick={() => {
                if (campusOptionsForSwitch.length > 1) {
                  setPortalSwitchOpen(true)
                  return
                }
                const r = dualSwitchToFranchisePartnerWorkspace(session.loginPhone)
                if (!r.ok) {
                  window.alert(r.msg || '切换失败')
                  return
                }
                navigate('/franchise-partner/dashboard')
              }}
              className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-cyan-200/95 hover:bg-white/5 hover:text-white transition"
            >
              <FlatIconSwitchAccount className="h-4 w-4 shrink-0 opacity-90" />
              <span>{campusOptionsForSwitch.length > 1 ? '切换账号' : '切换至校区工作台'}</span>
            </button>
          </div>
        ) : null}
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="z-20 flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3.5 shadow-sm md:px-8">
          <h1 className="truncate text-lg font-bold text-slate-900 min-w-0 flex-1 md:flex-none">{pageTitle}</h1>
          <div className="relative ml-auto shrink-0">
            <button
              type="button"
              ref={accountAvatarBtnRef}
              onClick={() => setAccountPopoverOpen((o) => !o)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 shadow ring-2 ring-white transition hover:from-slate-200 hover:to-slate-300"
              title="账号与个人信息"
              aria-expanded={accountPopoverOpen}
              aria-haspopup="dialog"
            >
              <svg className="h-[22px] w-[22px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              <span className="sr-only">打开账号与个人信息</span>
            </button>
            {accountPopoverOpen ? (
              <div
                ref={accountPopoverRef}
                role="dialog"
                aria-label="账号与个人信息"
                className="absolute right-0 top-full z-[100] mt-2 w-[min(calc(100vw-2rem),20rem)] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
              >
                <p className="text-xs font-semibold text-slate-700">登录信息</p>
                <dl className="mt-2 space-y-2.5 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="shrink-0 text-slate-500">机构名称</dt>
                    <dd className="min-w-0 text-right font-medium text-slate-900">{session.orgName}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="shrink-0 text-slate-500">登录身份</dt>
                    <dd className="min-w-0 text-right text-slate-900">
                      {session.staffSubUser
                        ? `${session.displayName}（${session.staffRoleName || '子账号'}）`
                        : session.displayName}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="shrink-0 text-slate-500">登录手机</dt>
                    <dd className="tabular-nums text-right text-slate-900">{session.loginPhone}</dd>
                  </div>
                </dl>
                <p className="mt-4 text-xs font-semibold text-slate-700">个人信息</p>
                <dl className="mt-2 space-y-2.5 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="shrink-0 text-slate-500">显示名称</dt>
                    <dd className="min-w-0 text-right font-medium text-slate-900">{session.displayName}</dd>
                  </div>
                  {session.staffSubUser ? (
                    <div className="flex justify-between gap-3">
                      <dt className="shrink-0 text-slate-500">所属角色</dt>
                      <dd className="min-w-0 text-right text-slate-900">{session.staffRoleName || '—'}</dd>
                    </div>
                  ) : (
                    <div className="flex justify-between gap-3">
                      <dt className="shrink-0 text-slate-500">账号类型</dt>
                      <dd className="text-right text-slate-900">机构总管理主账号</dd>
                    </div>
                  )}
                </dl>
                <div className="mt-4 border-t border-slate-100 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setAccountPopoverOpen(false)
                      logout()
                    }}
                    className="w-full rounded-lg border border-rose-200 bg-rose-50 py-2.5 text-sm font-semibold text-rose-800 hover:bg-rose-100 transition"
                  >
                    退出登录
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </header>
        <main className="mx-auto min-h-0 w-full max-w-[1600px] flex-1 overflow-y-auto overscroll-contain px-4 py-6 md:px-8">
          <Outlet context={{ session }} />
        </main>
      </div>

      <DualPortalSwitchModal
        open={portalSwitchOpen}
        onClose={() => setPortalSwitchOpen(false)}
        anchorRef={dualSwitchBtnRef}
        variant="from-hq"
        campuses={campusOptionsForSwitch}
        showInstitutionHq={false}
        onSelectCampus={(c) => {
          const r = applyFranchisePartnerSessionForCampus(c, session.loginPhone)
          setPortalSwitchOpen(false)
          if (!r.ok) {
            window.alert(r.msg || '切换失败')
            return
          }
          navigate('/franchise-partner/dashboard')
        }}
      />
    </div>
  )
}
