import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { clearPartnerSession, getPartnerSession } from '../../utils/franchisePartnerStorage'
import { FRANCHISE_NAV_ICONS, FlatIconHeadset, FlatIconMenu } from './FranchiseFlatIcons'

const NAV = [
  { to: '/franchise-partner/dashboard', label: '首页概览', end: false },
  { to: '/franchise-partner/classes', label: '班级管理' },
  { to: '/franchise-partner/students', label: '学生管理' },
  { to: '/franchise-partner/recharge', label: '充课中心' },
  { to: '/franchise-partner/teaching-materials', label: '学具商城' },
  { to: '/franchise-partner/orders', label: '订单管理' },
  { to: '/franchise-partner/finance', label: '财务统计' },
  { to: '/franchise-partner/discounts', label: '折扣查看' },
  { to: '/franchise-partner/balance', label: '余额中心' },
  { to: '/franchise-partner/settings', label: '账号设置' },
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
  promote: '课程推广',
  progress: '学习进度',
}

export default function FranchisePartnerLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [session, setSession] = useState(() => getPartnerSession())
  const [openNav, setOpenNav] = useState(false)

  /** useLayoutEffect：尽快在读不到会话时退回登录，避免白屏一闪 */
  useLayoutEffect(() => {
    const s = getPartnerSession()
    if (!s) {
      navigate('/franchise-partner/login', { replace: true })
      return
    }
    setSession(s)
  }, [navigate, location.pathname])

  useEffect(() => {
    const sync = () => {
      const s = getPartnerSession()
      if (!s) {
        navigate('/franchise-partner/login', { replace: true })
        return
      }
      setSession(s)
    }
    window.addEventListener('franchise-partner-session-changed', sync)
    return () => window.removeEventListener('franchise-partner-session-changed', sync)
  }, [navigate])

  const pageTitle = useMemo(() => {
    const seg = (location.pathname.split('/').pop() || 'dashboard').split('?')[0]
    return TITLE_MAP[seg] || '加盟商后台'
  }, [location.pathname])

  /** 仅三级及更深（从其它页带参跳入）显示返回；侧栏直达的二级页不显示 */
  const showContentBack = useMemo(() => {
    const path = location.pathname
    const q = new URLSearchParams(location.search)
    if (q.get('studentId') && (path.includes('/recharge') || path.includes('/progress'))) return true
    return false
  }, [location.pathname, location.search])

  /** 班级/学生页在子路由内自行渲染「标题 + 主操作」同一行，避免与 Layout 拆成两行 */
  const hideLayoutTitle = useMemo(() => {
    const p = location.pathname
    return p.includes('/franchise-partner/classes') || p.includes('/franchise-partner/students')
  }, [location.pathname])

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f6fb] text-slate-500 text-sm">
        正在进入工作台…
      </div>
    )
  }

  const sidebarInstitution = sidebarPartnerInstitutionName(session)
  const headerDisplayName = VIRTUAL_PARTNER_ADMIN_NAME
  const phoneDisplay = maskPhoneForDisplay(session.phone)

  const logout = () => {
    clearPartnerSession()
    navigate('/franchise-partner/login', { replace: true })
  }

  /** 内容区返回（仅在三页展示）：回到对应二级列表 */
  const handleContentBack = useCallback(() => {
    const { pathname, search } = location
    const q = new URLSearchParams(search)

    if (q.get('studentId') && (pathname.includes('/recharge') || pathname.includes('/progress'))) {
      navigate('/franchise-partner/students')
      return
    }

    navigate(-1)
  }, [location, navigate])

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#f4f6fb]">
      {/* 深色侧栏 */}
      <aside
        className={
          'lg:w-[240px] shrink-0 flex flex-col bg-[#0b1220] text-slate-300 border-r border-slate-800/80 ' +
          (openNav ? 'fixed inset-0 z-50 lg:static lg:inset-auto' : 'hidden lg:flex')
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
          </Link>
        </div>
        <nav className="p-3 space-y-0.5 flex-1 overflow-y-auto">
          {NAV.map((item, i) => {
            const Icon = FRANCHISE_NAV_ICONS[i] || FRANCHISE_NAV_ICONS[0]
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ' +
                  (isActive
                    ? 'text-white shadow-sm bg-[#3B66FF] ring-1 ring-[#3B66FF]'
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
              href="tel:400-xxx-xxxx"
              className="mt-2 block text-center text-xs py-2 rounded-lg bg-white/10 text-white hover:bg-white/15 transition"
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
          <Link to="/" className="block text-center text-[11px] text-slate-500 hover:text-white mt-2 py-1">
            返回官网
          </Link>
        </div>
      </aside>

      {openNav ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-label="关闭菜单"
          onClick={() => setOpenNav(false)}
        />
      ) : null}

      <div className="flex-1 min-w-0 flex flex-col min-h-0">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 px-4 sm:px-6 py-3.5 bg-white border-b border-slate-200/90 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link to="/" className="lg:hidden shrink-0 py-0.5" aria-label="缤果AI学院首页">
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
              className="lg:hidden p-2 rounded-lg border border-slate-200 text-slate-600 shrink-0 flex items-center justify-center"
              onClick={() => setOpenNav(true)}
              aria-label="打开菜单"
            >
              <FlatIconMenu className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                {headerDisplayName.slice(0, 1)}
              </div>
              <div className="min-w-0 max-w-[10.5rem] sm:max-w-[14rem]">
                <p className="text-sm font-medium text-slate-900 truncate" title={headerDisplayName}>
                  {headerDisplayName}
                </p>
                <p className="text-[11px] sm:text-xs text-slate-600 tabular-nums mt-0.5 truncate" title={phoneDisplay}>
                  {phoneDisplay}
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-[1600px] mx-auto overflow-y-auto">
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
    </div>
  )
}
