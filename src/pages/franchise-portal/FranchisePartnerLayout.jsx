import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  clearPartnerSession,
  consumeQueuedPartnerSessionIfPresent,
  getPartnerSession,
  isPartnerAccountFrozen,
  FRANCHISE_PREVIEW_DEMO_MAIN_PHONE,
  normalizePartnerPhoneDigits,
} from '../../utils/franchisePartnerStorage'
import DualPortalSwitchModal from '../../components/DualPortalSwitchModal'
import {
  applyFranchisePartnerSessionForCampus,
  dualSwitchToInstitutionHqWorkspace,
  listCampusesForAdminPhone,
  phoneDigitsHasDualPortalAccess,
  phoneDigitsHasInstitutionHqMasterAccess,
} from '../../utils/workspaceDualPortal'
import { FRANCHISE_PARTNER_PORTAL_NAV, resolvePartnerPortalMenuKey } from '../../constants/franchisePartnerPortalNav'
import { getInstitutionHqDefaultPathAfterLogin } from '../../constants/institutionHqPortalNav'
import { FRANCHISE_NAV_ICONS, FlatIconHeadset, FlatIconMenu, FlatIconSwitchAccount } from './FranchiseFlatIcons'

const NAV = [
  { key: 'dashboard', to: '/franchise-partner/dashboard', label: '首页概览', end: false },
  { key: 'classes', to: '/franchise-partner/classes', label: '班级管理' },
  { key: 'students', to: '/franchise-partner/students', label: '学生管理' },
  { key: 'recharge', to: '/franchise-partner/recharge', label: '充课中心', badge: '后续版本', visibleInMenu: true },
  { key: 'teaching-materials', to: '/franchise-partner/teaching-materials', label: '学具商城' },
  { key: 'orders', to: '/franchise-partner/orders', label: '订单管理', badge: '后续版本' },
  { key: 'finance', to: '/franchise-partner/finance', label: '财务统计' },
  { key: 'discounts', to: '/franchise-partner/discounts', label: '折扣查看', badge: '后续版本', visibleInMenu: false },
  { key: 'balance', to: '/franchise-partner/balance', label: '余额中心', visibleInMenu: false },
  { key: 'staff-accounts', to: '/franchise-partner/staff-accounts', label: '机构账号', ownerOnly: true },
  { key: 'settings', to: '/franchise-partner/settings', label: '账号设置' },
]

/** 侧栏无有效机构名时的默认展示名 */
const DEFAULT_SIDEBAR_INSTITUTION = '启思博雅教育中心'

function sidebarPartnerInstitutionName(session) {
  const raw = (session?.orgName || '').trim()
  if (!raw) return DEFAULT_SIDEBAR_INSTITUTION
  if (raw.includes('****') || /^缤果AI学院·加盟商/.test(raw)) return DEFAULT_SIDEBAR_INSTITUTION
  return raw
}

/** 顶栏展示用管理员姓名（占位） */
const VIRTUAL_PARTNER_ADMIN_NAME = '林若溪'
const FRANCHISE_SUPPORT_WECHAT_URL = 'https://work.weixin.qq.com/kfid/kfc65e712f1de26573a'

/** 顶栏展示：手机号脱敏 */
function maskPhoneForDisplay(phone) {
  const p = String(phone || '').replace(/\D/g, '')
  if (p.length === 11) return `${p.slice(0, 3)}****${p.slice(-4)}`
  if (p.length >= 7) return `${p.slice(0, 3)}****${p.slice(-4)}`
  if (p.length >= 4) return `${p.slice(0, 2)}****`
  return p ? '****' : '—'
}

const TITLE_MAP = {
  dashboard: '首页概览',
  classes: '班级管理',
  students: '学生管理',
  recharge: '充课中心',
  'teaching-materials': '学具商城',
  orders: '订单管理',
  finance: '财务统计',
  discounts: '折扣查看',
  balance: '余额中心',
  settings: '账号设置',
  'staff-accounts': '机构账号',
  promote: '课程推广',
  progress: '学习进度',
}

export default function FranchisePartnerLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [session, setSession] = useState(() => {
    if (typeof window !== 'undefined') consumeQueuedPartnerSessionIfPresent()
    return getPartnerSession()
  })
  const [openNav, setOpenNav] = useState(false)
  const [portalSwitchOpen, setPortalSwitchOpen] = useState(false)
  const dualSwitchBtnRef = useRef(null)

  /** useLayoutEffect：尽快在读不到会话时退回登录，避免白屏一闪 */
  useLayoutEffect(() => {
    consumeQueuedPartnerSessionIfPresent()
    const s = getPartnerSession()
    if (!s) {
      navigate('/franchise-partner/login', { replace: true })
      return
    }
    if (isPartnerAccountFrozen(s.partnerId)) {
      clearPartnerSession()
      setSession(null)
      navigate('/franchise-partner/login', {
        replace: true,
        state: { frozenMsg: '账号已被总部冻结，无法继续使用工作台。请联系总部。' },
      })
      return
    }
    setSession(s)
  }, [navigate, location.pathname])

  useEffect(() => {
    const sync = () => {
      consumeQueuedPartnerSessionIfPresent()
      const s = getPartnerSession()
      if (!s) {
        navigate('/franchise-partner/login', { replace: true })
        return
      }
      if (isPartnerAccountFrozen(s.partnerId)) {
        clearPartnerSession()
        setSession(null)
        navigate('/franchise-partner/login', {
          replace: true,
          state: { frozenMsg: '账号已被总部冻结，无法继续使用工作台。请联系总部。' },
        })
        return
      }
      setSession(s)
    }
    window.addEventListener('franchise-partner-session-changed', sync)
    return () => window.removeEventListener('franchise-partner-session-changed', sync)
  }, [navigate])

  const isStaffSession = useMemo(() => session?.staffSubUser === true, [session])
  /** 预览主账号：强制按机构主账号对待侧栏与重定向，避免会话标记异常导致菜单缺失 */
  const phoneDigits = useMemo(() => normalizePartnerPhoneDigits(session?.phone), [session?.phone])
  const isPreviewDemoMainPhone = phoneDigits === FRANCHISE_PREVIEW_DEMO_MAIN_PHONE
  const isStaffNavRestricted = isStaffSession && !isPreviewDemoMainPhone
  const showDualPortalSwitch = useMemo(() => phoneDigitsHasDualPortalAccess(phoneDigits), [phoneDigits])
  const campusOptionsForSwitch = useMemo(() => listCampusesForAdminPhone(phoneDigits), [phoneDigits])
  /** 多校区，或「单校区 + 机构总」二选一以上 */
  const franchisePortalPickerNeeded = useMemo(() => {
    if (!showDualPortalSwitch) return false
    if (campusOptionsForSwitch.length > 1) return true
    if (phoneDigitsHasInstitutionHqMasterAccess(phoneDigits) && campusOptionsForSwitch.length >= 1) return true
    return false
  }, [showDualPortalSwitch, campusOptionsForSwitch.length, phoneDigits])

  /** 机构子账号：无权限的页面重定向到首个可访问菜单（「机构账号」页除外，可进入查看说明） */
  useEffect(() => {
    if (!session) return
    if (!isStaffNavRestricted || !Array.isArray(session.staffMenuKeys) || !session.staffMenuKeys.length) return
    const mk = resolvePartnerPortalMenuKey(location.pathname)
    if (!mk || session.staffMenuKeys.includes(mk) || mk === 'staff-accounts') return
    const firstKey = session.staffMenuKeys[0]
    const target = FRANCHISE_PARTNER_PORTAL_NAV.find((x) => x.key === firstKey)?.path || '/franchise-partner/dashboard'
    navigate(target, { replace: true })
  }, [session, location.pathname, navigate, isStaffNavRestricted])

  const visibleNavItems = useMemo(() => {
    const keys =
      isStaffNavRestricted && session && Array.isArray(session.staffMenuKeys) ? new Set(session.staffMenuKeys) : null
    return NAV.filter((item) => {
      if (item.visibleInMenu === false) return false
      if (item.key === 'staff-accounts') return true
      if (!keys) return true
      return keys.has(item.key)
    })
  }, [session, isStaffNavRestricted])

  const pageTitle = useMemo(() => {
    const path = location.pathname
    if (/^\/franchise-partner\/classes\/.+/.test(path)) return '班级详情'
    if (path.includes('/franchise-partner/teaching-materials/item/')) return '学具介绍详情'
    const seg = (path.split('/').pop() || 'dashboard').split('?')[0]
    return TITLE_MAP[seg] || '加盟商后台'
  }, [location.pathname])

  /** 仅三级及更深（从其它页带参跳入）显示返回；侧栏直达的二级页不显示 */
  const showContentBack = useMemo(() => {
    const path = location.pathname
    const q = new URLSearchParams(location.search)
    if (q.get('studentId') && (path.includes('/recharge') || path.includes('/progress'))) return true
    if (/^\/franchise-partner\/classes\/.+/.test(path)) return true
    if (path.includes('/franchise-partner/teaching-materials/item/')) return true
    return false
  }, [location.pathname, location.search])

  /** 班级/学生页在子路由内自行渲染「标题 + 主操作」同一行，避免与 Layout 拆成两行 */
  const hideLayoutTitle = useMemo(() => {
    const p = location.pathname
    return (
      p.includes('/franchise-partner/classes') ||
      p.includes('/franchise-partner/students') ||
      p.includes('/franchise-partner/staff-accounts')
    )
  }, [location.pathname])

  const logout = useCallback(() => {
    clearPartnerSession()
    navigate('/franchise-partner/login', { replace: true })
  }, [navigate])

  const handleDualSwitchToInstitutionHq = useCallback(() => {
    const r = dualSwitchToInstitutionHqWorkspace(phoneDigits)
    if (!r.ok) {
      window.alert(r.msg || '切换失败')
      return
    }
    navigate(getInstitutionHqDefaultPathAfterLogin(r.session), { replace: true })
  }, [navigate, phoneDigits])

  const openFranchisePortalSwitch = useCallback(() => {
    if (franchisePortalPickerNeeded) {
      setPortalSwitchOpen(true)
      setOpenNav(false)
      return
    }
    if (phoneDigitsHasInstitutionHqMasterAccess(phoneDigits)) {
      handleDualSwitchToInstitutionHq()
    }
  }, [franchisePortalPickerNeeded, phoneDigits, handleDualSwitchToInstitutionHq])

  /** 内容区返回（仅在三页展示）：回到对应二级列表 */
  const handleContentBack = useCallback(() => {
    const { pathname, search } = location
    const q = new URLSearchParams(search)

    if (q.get('studentId') && (pathname.includes('/recharge') || pathname.includes('/progress'))) {
      navigate('/franchise-partner/students')
      return
    }

    if (/^\/franchise-partner\/classes\/.+/.test(pathname)) {
      navigate('/franchise-partner/classes')
      return
    }

    if (pathname.includes('/franchise-partner/teaching-materials/item/')) {
      navigate('/franchise-partner/teaching-materials')
      return
    }

    navigate(-1)
  }, [location, navigate])

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f6fb] text-slate-500 text-sm">
        正在进入工作台…
      </div>
    )
  }

  const sidebarInstitution = sidebarPartnerInstitutionName(session)
  const headerDisplayName = isStaffNavRestricted
    ? String(session.staffName || session.contactName || '子账号').trim()
    : String(session.contactName || VIRTUAL_PARTNER_ADMIN_NAME).trim()
  const phoneDisplay = maskPhoneForDisplay(session.phone)

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-[#f4f6fb] md:flex-row">
      {/* 深色侧栏：小屏为抽屉（点左上角菜单展开），≥md 固定显示 */}
      <aside
        className={
          'flex flex-col shrink-0 bg-bingo-dark text-slate-300 border-r border-slate-800/80 ' +
          'fixed inset-y-0 left-0 z-50 w-[min(100vw,280px)] transition-transform duration-200 ease-out ' +
          (openNav ? 'translate-x-0' : '-translate-x-full') +
          ' md:static md:inset-auto md:z-auto md:h-full md:max-h-full md:min-h-0 md:w-[240px] md:translate-x-0 md:overflow-hidden'
        }
      >
        <div className="p-5 border-b border-white/10">
          <Link
            to="/"
            className="block rounded-lg -m-1 p-1 hover:bg-white/5 transition"
            aria-label={`${sidebarInstitution} · 加盟商管理后台`}
          >
            <img
              src="/logo.svg"
              alt="缤果AI学院"
              className="h-9 w-auto max-h-9 max-w-full object-contain object-left"
              width={307}
              height={85}
            />
            <p className="text-lg font-semibold text-white mt-2 leading-snug truncate" title={sidebarInstitution}>
              {sidebarInstitution}
            </p>
            <p className="text-[11px] text-slate-500 mt-1 tracking-wide">加盟商管理后台</p>
            {isStaffNavRestricted ? (
              <p className="text-[10px] text-amber-200/95 mt-2 leading-snug rounded-md bg-amber-500/15 px-2 py-1 border border-amber-400/25">
                当前为子账号登录；角色与员工账号需由机构主账号登录后进行管理。
              </p>
            ) : null}
          </Link>
        </div>
        <nav className="p-3 space-y-0.5 flex-1 min-h-0 overflow-y-auto overscroll-contain">
          {visibleNavItems.map((item) => {
            const Icon = FRANCHISE_NAV_ICONS[NAV.indexOf(item)] || FRANCHISE_NAV_ICONS[0]
            return (
              <NavLink
                key={item.key}
                to={item.to}
                className={({ isActive }) =>
                  'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ' +
                  (isActive
                    ? 'text-white shadow-sm bg-primary ring-1 ring-primary'
                    : 'text-slate-400 hover:text-white hover:bg-white/5')
                }
                onClick={() => setOpenNav(false)}
              >
                <Icon className="w-5 h-5 shrink-0 opacity-90" />
                <span className="flex-1 min-w-0">{item.label}</span>
                {item.badge ? (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-500/25 text-violet-200 border border-violet-400/30">
                    {item.badge}
                  </span>
                ) : null}
              </NavLink>
            )
          })}
        </nav>
        <div className="p-3 mt-auto border-t border-white/10">
          <div className="rounded-xl bg-white/5 border border-white/10 p-3 mb-3">
            <div className="flex items-center gap-2 text-white text-xs font-medium">
              <FlatIconHeadset className="w-4 h-4 shrink-0 text-sky-300" />
              专属客服
            </div>
            <p className="text-[11px] text-slate-500 mt-1 leading-snug">工作日 9:00–18:00 在线支持</p>
            <a
              href={FRANCHISE_SUPPORT_WECHAT_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/15"
            >
              联系客服
            </a>
          </div>
          <button
            type="button"
            onClick={logout}
            className="w-full text-left text-xs text-slate-500 hover:text-red-400 px-3 py-2 rounded-lg hover:bg-white/5"
          >
            退出登录
          </button>
          {showDualPortalSwitch ? (
            <button
              type="button"
              ref={dualSwitchBtnRef}
              onClick={openFranchisePortalSwitch}
              className="mt-2 w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-cyan-200/95 hover:bg-white/5 hover:text-white transition"
            >
              <FlatIconSwitchAccount className="h-4 w-4 shrink-0 opacity-90" />
              <span>切换账号</span>
            </button>
          ) : null}
        </div>
      </aside>

      {openNav ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          aria-label="关闭菜单"
          onClick={() => setOpenNav(false)}
        />
      ) : null}

      <div className="flex-1 min-w-0 flex flex-col min-h-0">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 px-3 sm:px-4 md:px-6 lg:px-8 py-3.5 bg-white border-b border-slate-200/90 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link to="/" className="md:hidden shrink-0 py-0.5" aria-label="缤果AI学院首页">
              <img
                src="/logo.svg"
                alt=""
                className="h-7 w-auto max-h-7 max-w-[112px] object-contain object-left"
                width={307}
                height={85}
              />
            </Link>
            <button
              type="button"
              className="md:hidden p-2 rounded-lg border border-slate-200 text-slate-600 shrink-0 flex items-center justify-center"
              onClick={() => setOpenNav(true)}
              aria-label="打开侧栏菜单"
            >
              <FlatIconMenu className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-primary text-white text-xs font-bold flex items-center justify-center shrink-0">
                {headerDisplayName.slice(0, 1)}
              </div>
              <div className="min-w-0 max-w-[10.5rem] sm:max-w-[14rem]">
                <p className="text-sm font-medium text-slate-900 truncate" title={headerDisplayName}>
                  {headerDisplayName}
                </p>
                <p className="text-[11px] sm:text-xs text-slate-600 tabular-nums mt-0.5 truncate" title={phoneDisplay}>
                  {isStaffNavRestricted ? (
                    <>
                      <span className="text-violet-700 font-medium">{String(session.staffRoleName || '子账号').trim()}</span>
                      <span className="mx-1 text-slate-300">·</span>
                      {phoneDisplay}
                    </>
                  ) : (
                    phoneDisplay
                  )}
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 w-full min-w-0 max-w-[1800px] mx-auto overflow-y-auto py-4 sm:py-6 lg:py-8 px-3 sm:px-4 md:px-6 lg:px-8">
          {showContentBack ? (
            <div className="flex flex-nowrap items-center gap-3 mb-4 sm:mb-6 min-w-0">
              <button
                type="button"
                onClick={handleContentBack}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-medium shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-colors"
                aria-label="返回"
              >
                <span className="text-base leading-none" aria-hidden>
                  ←
                </span>
                返回
              </button>
              <h1 className="text-xl font-bold text-slate-900 truncate min-w-0">{pageTitle}</h1>
            </div>
          ) : !hideLayoutTitle ? (
            <div className="mb-4 sm:mb-6">
              <h1 className="text-xl font-bold text-slate-900 truncate">{pageTitle}</h1>
            </div>
          ) : null}
          <Outlet context={{ session }} />
        </main>
      </div>

      <DualPortalSwitchModal
        open={portalSwitchOpen}
        onClose={() => setPortalSwitchOpen(false)}
        anchorRef={dualSwitchBtnRef}
        variant="from-campus"
        campuses={campusOptionsForSwitch}
        currentPartnerId={session.partnerId}
        currentRefCode={session.refCode}
        showInstitutionHq={phoneDigitsHasInstitutionHqMasterAccess(phoneDigits)}
        onSelectCampus={(c) => {
          const r = applyFranchisePartnerSessionForCampus(c, phoneDigits)
          setPortalSwitchOpen(false)
          if (!r.ok) {
            window.alert(r.msg || '切换失败')
            return
          }
          navigate('/franchise-partner/dashboard', { replace: true })
        }}
        onSelectInstitutionHq={() => {
          setPortalSwitchOpen(false)
          handleDualSwitchToInstitutionHq()
        }}
      />
    </div>
  )
}
