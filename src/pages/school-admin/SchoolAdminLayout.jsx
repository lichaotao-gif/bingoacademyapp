import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  changeOwnPassword,
  clearSchoolSession,
  fmtDateTime,
  getSchoolSession,
  isOwner,
  maskPhone,
  SCHOOL_SESSION_EVENT,
  SCHOOL_DB_EVENT,
  validateSession,
} from '../../utils/schoolAdminStorage'
import { resolveSchoolPageTitle, visibleSchoolNav } from '../../constants/schoolAdminPortalNav'
import {
  FlatIconBookClass,
  FlatIconChartBar,
  FlatIconClipboard,
  FlatIconCog,
  FlatIconHeadset,
  FlatIconMenu,
  FlatIconUserPlus,
  FlatIconUsers,
} from '../franchise-portal/FranchiseFlatIcons'

const NAV_ICONS = {
  dashboard: FlatIconChartBar,
  classes: FlatIconBookClass,
  students: FlatIconUsers,
  certificates: FlatIconClipboard,
  accounts: FlatIconUserPlus,
  settings: FlatIconCog,
}

const SUPPORT_WECHAT_URL = 'https://work.weixin.qq.com/kfid/kfc65e712f1de26573a'

/** 三级页才显示返回，侧栏直达的二级页不显示 */
function showBackFor(pathname) {
  return /^\/school\/(classes|students)\/.+/.test(pathname)
}

function PasswordModal({ session, onClose }) {
  const [oldPwd, setOldPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [err, setErr] = useState('')

  const submit = (e) => {
    e.preventDefault()
    const r = changeOwnPassword(session, oldPwd, newPwd, confirmPwd)
    if (!r.ok) {
      setErr(r.msg || '修改失败')
      return
    }
    window.alert('密码已更新，请使用新密码重新登录')
    onClose(true)
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
        <h2 className="text-base font-semibold text-slate-900">修改密码</h2>
        <form onSubmit={submit} className="mt-4 space-y-3">
          {[
            ['当前密码', oldPwd, setOldPwd],
            ['新密码（至少 6 位）', newPwd, setNewPwd],
            ['确认新密码', confirmPwd, setConfirmPwd],
          ].map(([label, value, setter]) => (
            <div key={label}>
              <label className="mb-1 block text-xs font-medium text-slate-600">{label}</label>
              <input
                type="password"
                value={value}
                onChange={(e) => setter(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                autoComplete="off"
              />
            </div>
          ))}
          {err ? <p className="text-xs text-rose-600">{err}</p> : null}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-50"
            >
              取消
            </button>
            <button
              type="submit"
              className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white transition hover:brightness-110"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function SchoolAdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [rawSession, setRawSession] = useState(() => getSchoolSession())
  const [dbRev, setDbRev] = useState(0)
  const [openNav, setOpenNav] = useState(false)
  const [accountOpenPath, setAccountOpenPath] = useState('')
  const [pwdOpen, setPwdOpen] = useState(false)
  const popoverRef = useRef(null)
  const avatarRef = useRef(null)
  /** 记录打开时的路径：路由一变浮层自然收起 */
  const accountOpen = accountOpenPath === location.pathname
  const setAccountOpen = useCallback(
    (next) => setAccountOpenPath(next ? location.pathname : ''),
    [location.pathname],
  )

  /** 会话有效性在渲染阶段派生，学校停用 / 账号停用等变更通过 dbRev 触发重算 */
  const validation = useMemo(() => {
    void dbRev
    return rawSession ? validateSession(rawSession) : null
  }, [rawSession, dbRev])

  const session = useMemo(
    () =>
      validation?.ok
        ? {
            ...rawSession,
            schoolName: validation.school.name,
            name: validation.account.name,
            role: validation.account.role,
          }
        : null,
    [rawSession, validation],
  )

  /** useLayoutEffect：无有效会话时尽快退回登录，避免白屏一闪 */
  useLayoutEffect(() => {
    if (!rawSession) {
      navigate('/school/login', { replace: true })
      return
    }
    if (validation && !validation.ok) {
      clearSchoolSession()
      navigate('/school/login', { replace: true, state: validation.msg ? { loginMsg: validation.msg } : {} })
    }
  }, [rawSession, validation, navigate])

  useEffect(() => {
    const sync = () => {
      setRawSession(getSchoolSession())
      setDbRev((n) => n + 1)
    }
    window.addEventListener(SCHOOL_SESSION_EVENT, sync)
    window.addEventListener(SCHOOL_DB_EVENT, sync)
    return () => {
      window.removeEventListener(SCHOOL_SESSION_EVENT, sync)
      window.removeEventListener(SCHOOL_DB_EVENT, sync)
    }
  }, [])

  useEffect(() => {
    if (!accountOpen) return
    const onDown = (e) => {
      if (popoverRef.current?.contains(e.target)) return
      if (avatarRef.current?.contains(e.target)) return
      setAccountOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setAccountOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [accountOpen, setAccountOpen])

  /** 老师访问总管理员专属页时重定向到看板 */
  useEffect(() => {
    if (!session) return
    if (!isOwner(session) && location.pathname.startsWith('/school/accounts')) {
      navigate('/school', { replace: true })
    }
  }, [session, location.pathname, navigate])

  const navItems = useMemo(() => visibleSchoolNav(session), [session])
  const pageTitle = useMemo(() => resolveSchoolPageTitle(location.pathname), [location.pathname])
  const showBack = showBackFor(location.pathname)

  const logout = useCallback(() => {
    clearSchoolSession()
    navigate('/school/login', { replace: true })
  }, [navigate])

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f6fb] text-sm text-slate-500">
        正在进入学校管理后台…
      </div>
    )
  }

  const owner = isOwner(session)
  const roleLabel = owner ? '总管理员' : '老师（子管理员）'

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-[#f4f6fb] md:flex-row">
      <aside
        className={
          'flex shrink-0 flex-col border-r border-slate-800/80 bg-bingo-dark text-slate-300 ' +
          'fixed inset-y-0 left-0 z-50 w-[min(100vw,280px)] transition-transform duration-200 ease-out ' +
          (openNav ? 'translate-x-0' : '-translate-x-full') +
          ' md:static md:inset-auto md:z-auto md:h-full md:max-h-full md:min-h-0 md:w-[240px] md:translate-x-0 md:overflow-hidden'
        }
      >
        <div className="border-b border-white/10 p-5">
          <Link to="/" className="-m-1 block rounded-lg p-1 transition hover:bg-white/5" aria-label="缤果AI学院首页">
            <img
              src="/logo.svg"
              alt="缤果AI学院"
              className="h-9 w-auto max-h-9 max-w-full object-contain object-left"
              width={307}
              height={85}
            />
            <p className="mt-2 truncate text-lg font-semibold leading-snug text-white" title={session.schoolName}>
              {session.schoolName}
            </p>
            <p className="mt-1 text-[11px] tracking-wide text-slate-500">学校管理后台</p>
          </Link>
          <p className="mt-2 rounded-md border border-blue-400/25 bg-blue-500/15 px-2 py-1 text-[10px] leading-snug text-blue-100/95">
            当前身份：{roleLabel}
            {owner ? '' : '；仅可查看与管理本人主讲班级'}
          </p>
        </div>

        <nav className="min-h-0 flex-1 space-y-0.5 overflow-y-auto overscroll-contain p-3">
          {navItems.map((item) => {
            const Icon = NAV_ICONS[item.key] || FlatIconChartBar
            return (
              <NavLink
                key={item.key}
                to={item.path}
                className={({ isActive }) =>
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ' +
                  (isActive
                    ? 'bg-primary text-white shadow-sm ring-1 ring-primary'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white')
                }
                onClick={() => setOpenNav(false)}
              >
                <Icon className="h-5 w-5 shrink-0 opacity-90" />
                <span className="min-w-0 flex-1">{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="mt-auto border-t border-white/10 p-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center gap-2 text-xs font-medium text-white">
              <FlatIconHeadset className="h-4 w-4 shrink-0 text-sky-300" />
              平台运营支持
            </div>
            <p className="mt-1 text-[11px] leading-snug text-slate-500">开课授权、发证审核、转校处理</p>
            <a
              href={SUPPORT_WECHAT_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/15"
            >
              联系平台运营
            </a>
          </div>
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

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/90 bg-white px-3 py-3.5 shadow-sm sm:gap-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3 md:flex-none">
            <Link to="/" className="shrink-0 py-0.5 md:hidden" aria-label="缤果AI学院首页">
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
              className="flex shrink-0 items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-600 md:hidden"
              onClick={() => setOpenNav(true)}
              aria-label="打开侧栏菜单"
            >
              <FlatIconMenu className="h-5 w-5" />
            </button>
          </div>

          <div className="relative ml-auto shrink-0">
            <button
              type="button"
              ref={avatarRef}
              onClick={() => setAccountOpen((o) => !o)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-sm font-bold text-white shadow ring-2 ring-white transition hover:brightness-105"
              title="账号与个人信息"
              aria-label="打开账号与个人信息"
              aria-expanded={accountOpen}
              aria-haspopup="dialog"
            >
              {String(session.name || '校').slice(0, 1)}
            </button>
            {accountOpen ? (
              <div
                ref={popoverRef}
                role="dialog"
                aria-label="账号与个人信息"
                className="absolute right-0 top-full z-[100] mt-2 w-[min(calc(100vw-2rem),20rem)] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
              >
                <p className="text-xs font-semibold text-slate-700">登录信息</p>
                <dl className="mt-2 space-y-2.5 text-sm">
                  {[
                    ['学校名称', session.schoolName],
                    ['当前登录', `${session.name}（${roleLabel}）`],
                    ['登录手机号', maskPhone(session.phone)],
                    ['登录时间', fmtDateTime(session.loginAt)],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-3">
                      <dt className="shrink-0 text-slate-500">{label}</dt>
                      <dd className="min-w-0 text-right font-medium text-slate-900">{value}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-4 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAccountOpen(false)
                      setPwdOpen(true)
                    }}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    修改密码
                  </button>
                  <button
                    type="button"
                    onClick={logout}
                    className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    退出登录
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1400px] px-3 py-4 sm:px-4 md:px-6 md:py-6 lg:px-8">
            {showBack ? (
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 transition hover:text-slate-700"
              >
                ← 返回
              </button>
            ) : null}
            <h1 className="mb-4 text-lg font-semibold text-slate-900 md:text-xl">{pageTitle}</h1>
            <Outlet context={{ session, owner }} />
          </div>
        </div>
      </div>

      {pwdOpen ? (
        <PasswordModal
          session={session}
          onClose={(changed) => {
            setPwdOpen(false)
            if (changed) logout()
          }}
        />
      ) : null}
    </div>
  )
}
