import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  SCHOOL_DEMO_OWNER_PASSWORD,
  SCHOOL_DEMO_OWNER_PHONE,
  getSchoolSession,
  setSchoolSession,
  validateSession,
  verifySchoolLogin,
} from '../../utils/schoolAdminStorage'

const LOGO_SRC = `${import.meta.env.BASE_URL}logo.svg`

function LoginFeedback({ message }) {
  if (!message) return null
  return (
    <div
      role="alert"
      aria-live="polite"
      className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm leading-relaxed text-rose-800 shadow-sm"
    >
      {message}
    </div>
  )
}

export default function SchoolAdminLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const [phone, setPhone] = useState(SCHOOL_DEMO_OWNER_PHONE)
  const [password, setPassword] = useState(SCHOOL_DEMO_OWNER_PASSWORD)
  const [err, setErr] = useState('')

  useEffect(() => {
    const s = getSchoolSession()
    if (s && validateSession(s).ok) navigate('/school', { replace: true })
  }, [navigate])

  const kickedMsg = typeof location.state?.loginMsg === 'string' ? location.state.loginMsg.trim() : ''

  const submit = useCallback(
    (e) => {
      e.preventDefault()
      setErr('')
      if (kickedMsg) navigate(location.pathname, { replace: true, state: {} })
      const r = verifySchoolLogin(phone, password)
      if (!r.ok) {
        setErr(r.msg || '登录失败')
        return
      }
      try {
        setSchoolSession(r.session)
        navigate('/school', { replace: true })
      } catch (e2) {
        console.error(e2)
        setErr(e2?.message || '登录失败：浏览器存储不可用')
      }
    },
    [kickedMsg, location.pathname, navigate, password, phone],
  )

  return (
    <div className="relative z-20 flex min-h-screen items-center justify-center px-4 py-12 touch-manipulation">
      <Link
        to="/"
        className="absolute left-4 top-4 z-30 -m-1 inline-flex shrink-0 items-center rounded-lg p-1 transition-colors hover:bg-slate-900/5 sm:left-6 sm:top-6"
        aria-label="缤果AI学院首页"
      >
        <img
          src={LOGO_SRC}
          alt="缤果AI学院"
          className="h-8 w-auto max-h-9 max-w-[min(100%,220px)] object-contain object-left drop-shadow-sm sm:h-9"
          width={307}
          height={85}
        />
      </Link>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-bingo-dark sm:text-4xl">
            缤果AI学院·学校端
          </h1>
          <p className="mt-3 text-sm text-slate-500">学校管理后台登录</p>
        </div>

        <div className="card relative isolate space-y-5 rounded-2xl border border-slate-200 p-6 shadow-sm sm:p-8">
          <form onSubmit={submit} className="space-y-4" autoComplete="off">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="school-login-phone">
                账号
              </label>
              <input
                id="school-login-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                placeholder="请输入手机号"
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="school-login-password">
                密码
              </label>
              <input
                id="school-login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
                placeholder="请输入密码"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
              />
              <p className="mt-1.5 text-xs text-slate-500">
                账号由平台开通后下发；老师账号由学校总管理员创建。密码区分大小写。
              </p>
            </div>
            <LoginFeedback message={err || kickedMsg} />
            <button
              type="submit"
              className="w-full cursor-pointer select-none rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:from-blue-700 hover:to-violet-700"
            >
              登录
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-slate-500">
          <Link to="/" className="text-primary hover:underline">
            ← 返回官网首页
          </Link>
          <span className="mx-2 text-slate-300">|</span>
          <Link to="/franchise" className="text-sky-600 hover:underline">
            了解合作方案
          </Link>
        </p>
      </div>
    </div>
  )
}
