import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  buildPartnerSessionPayloadForLogin,
  getResolvedPartnerIdForPhoneLogin,
  isPartnerAccountFrozen,
  sendPartnerLoginSmsCode,
  setPartnerSession,
  verifyOrRegisterPartnerLogin,
  verifyPartnerLoginSmsCode,
} from '../../utils/franchisePartnerStorage'

const SMS_COOLDOWN_SEC = 60

/** public/logo.svg，兼容 Vite base 子路径部署 */
const LOGO_SRC = `${import.meta.env.BASE_URL}logo.svg`

/** 演示环境默认账号（正式环境勿预填） */
const DEFAULT_LOGIN_PHONE = '13800138000'
const DEFAULT_LOGIN_PASSWORD = 'demo123'

function LoginFeedback({ message }) {
  if (!message) return null
  return (
    <div
      role="alert"
      aria-live="polite"
      className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-800 shadow-sm leading-relaxed"
    >
      {message}
    </div>
  )
}

export default function FranchisePartnerLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const [mode, setMode] = useState('password')
  const [phone, setPhone] = useState(DEFAULT_LOGIN_PHONE)
  const [password, setPassword] = useState(DEFAULT_LOGIN_PASSWORD)
  const [smsCode, setSmsCode] = useState('')
  const [err, setErr] = useState('')
  const [smsHint, setSmsHint] = useState('')
  const [smsCooldown, setSmsCooldown] = useState(0)
  const feedbackRef = useRef(null)

  /** 仅挂载时预填一次；不做延时重复写入，避免与点击登录竞态导致提交异常 */
  useEffect(() => {
    setPhone(DEFAULT_LOGIN_PHONE)
    setPassword(DEFAULT_LOGIN_PASSWORD)
  }, [])

  useEffect(() => {
    if (smsCooldown <= 0) return
    const t = window.setInterval(() => {
      setSmsCooldown((c) => (c <= 1 ? 0 : c - 1))
    }, 1000)
    return () => window.clearInterval(t)
  }, [smsCooldown])

  useEffect(() => {
    if (!err) return
    feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [err])

  useEffect(() => {
    const msg = location.state?.frozenMsg
    if (msg && typeof msg === 'string' && msg.trim()) {
      setErr(msg.trim())
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.pathname, location.state, navigate])

  const normalizePhone = useCallback(() => phone.replace(/\D/g, ''), [phone])

  const finishLogin = useCallback(
    (digits) => {
      const pid = getResolvedPartnerIdForPhoneLogin(digits)
      if (isPartnerAccountFrozen(pid)) {
        setErr('账号已被总部冻结，无法登录。请联系总部处理。')
        return
      }
      try {
        setPartnerSession(buildPartnerSessionPayloadForLogin(digits))
        /** 使用路由跳转，由 BrowserRouter basename 统一处理子路径部署，避免手写 URL 与 BASE_URL 不一致 */
        navigate('/franchise-partner/dashboard', { replace: true })
      } catch (e) {
        console.error(e)
        setErr(e?.message || '登录失败：浏览器存储不可用或已满')
      }
    },
    [navigate],
  )

  const handleSendSms = () => {
    setErr('')
    setSmsHint('')
    const p = normalizePhone()
    if (p.length !== 11) {
      setErr('请输入11位手机号')
      return
    }
    if (smsCooldown > 0) return
    const r = sendPartnerLoginSmsCode(p)
    if (!r.ok) {
      setErr(r.msg || '发送失败')
      return
    }
    setSmsCooldown(SMS_COOLDOWN_SEC)
    setSmsHint(`演示环境：本次验证码为 ${r.demoCode}（正式环境将发送至手机）`)
  }

  const runPasswordLogin = useCallback(() => {
    setErr('')
    setSmsHint('')
    const p = normalizePhone()
    if (p.length !== 11) {
      setErr('请输入11位手机号')
      return
    }
    if (!password.trim()) {
      setErr('请输入密码')
      return
    }
    const safeFinish = () => {
      try {
        finishLogin(p)
      } catch (e2) {
        console.error(e2)
        setErr(e2?.message || '登录失败：无法写入登录状态')
      }
    }

    try {
      const auth = verifyOrRegisterPartnerLogin(p, password)
      if (auth.ok) {
        safeFinish()
        return
      }
      const msg = auth.msg || ''
      /** 密码不符必须拦截 */
      if (msg.includes('密码错误')) {
        setErr(msg)
        return
      }
      /** 格式校验 */
      if (msg.includes('请输入正确的') || msg.includes('密码至少')) {
        setErr(msg)
        return
      }
      /**
       * 账号密码表无法写入（存储禁满、无痕等）时仍允许进入工作台：
       * 仅写入会话；若会话也无法写入，safeFinish 会提示。
       */
      const credsUnavailable =
        msg.includes('无法保存') || msg.includes('登录校验失败') || msg.includes('禁止') || msg.includes('存储')
      if (credsUnavailable) {
        safeFinish()
        return
      }
      setErr(msg || '登录失败')
    } catch (err) {
      console.error(err)
      safeFinish()
    }
  }, [finishLogin, normalizePhone, password])

  const handleSubmitPassword = (e) => {
    e.preventDefault()
    runPasswordLogin()
  }

  const handleSubmitSms = (e) => {
    e.preventDefault()
    setErr('')
    const p = normalizePhone()
    if (p.length !== 11) {
      setErr('请输入11位手机号')
      return
    }
    try {
      const v = verifyPartnerLoginSmsCode(p, smsCode)
      if (!v.ok) {
        setErr(v.msg || '验证失败')
        return
      }
      finishLogin(p)
    } catch (err) {
      console.error(err)
      setErr('登录失败，请重试')
    }
  }

  const tabCls = (active) =>
    `flex-1 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
      active ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
    }`

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative z-20 touch-manipulation">
      <Link
        to="/"
        className="absolute left-4 top-4 sm:left-6 sm:top-6 z-30 inline-flex items-center shrink-0 rounded-lg p-1 -m-1 hover:bg-slate-900/5 transition-colors"
        aria-label="缤果AI学院首页"
      >
        <img
          src={LOGO_SRC}
          alt="缤果AI学院"
          className="h-8 sm:h-9 w-auto max-h-9 max-w-[min(100%,220px)] object-contain object-left drop-shadow-sm"
          width={307}
          height={85}
        />
      </Link>
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-bingo-dark tracking-tight leading-tight">
            缤果AI学院·加盟商
          </h1>
          <p className="text-sm text-slate-500 mt-3">加盟商工作台登录</p>
        </div>

        <div className="card p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-5 relative isolate">
          <div
            className="flex p-1 rounded-xl bg-slate-100/90 border border-slate-200/80"
            role="tablist"
            aria-label="登录方式"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'password'}
              className={tabCls(mode === 'password')}
              onClick={() => {
                setMode('password')
                setErr('')
                setSmsHint('')
              }}
            >
              密码登录
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'sms'}
              className={tabCls(mode === 'sms')}
              onClick={() => {
                setMode('sms')
                setErr('')
              }}
            >
              验证码登录
            </button>
          </div>

          {mode === 'password' ? (
            <form
              id="franchise-partner-login-password"
              onSubmit={handleSubmitPassword}
              className="space-y-4"
              autoComplete="off"
            >
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">账号</label>
                <input
                  type="tel"
                  name="franchise-demo-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                  placeholder="请输入手机号"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">密码</label>
                {/* 演示站用 type="text" 明文，避免被当成「密码框」后浏览器不显示或盖掉预填 */}
                <input
                  type="text"
                  name="franchise-demo-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                  placeholder="请输入密码"
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                />
                <p className="text-xs text-slate-500 mt-1.5">
                  演示预填：账号与密码已写入上方输入框（仅加盟商端本页）。
                </p>
              </div>
              <div ref={feedbackRef}>
                <LoginFeedback message={err} />
              </div>
              <button type="submit" className="w-full btn-primary py-3 rounded-xl font-semibold text-sm cursor-pointer select-none">
                登录
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmitSms} className="space-y-4" autoComplete="off">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">账号</label>
                <input
                  type="tel"
                  name="franchise-demo-phone-sms"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                  placeholder="请输入手机号"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">短信验证码</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={8}
                    value={smsCode}
                    onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, ''))}
                    className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                    placeholder="6 位数字"
                    autoComplete="one-time-code"
                  />
                  <button
                    type="button"
                    onClick={handleSendSms}
                    disabled={smsCooldown > 0}
                    className="shrink-0 px-3.5 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {smsCooldown > 0 ? `${smsCooldown}s` : '获取验证码'}
                  </button>
                </div>
                {smsHint ? <p className="text-xs text-amber-800/90 mt-2 leading-relaxed">{smsHint}</p> : null}
              </div>
              <div ref={feedbackRef}>
                <LoginFeedback message={err} />
              </div>
              <button
                type="submit"
                className="w-full btn-primary py-3 rounded-xl font-semibold text-sm cursor-pointer"
              >
                登录
              </button>
            </form>
          )}
        </div>

        <p className="text-center mt-6 text-sm text-slate-500">
          <Link to="/" className="text-primary hover:underline">
            ← 返回官网首页
          </Link>
          <span className="mx-2 text-slate-300">|</span>
          <Link to="/franchise" className="text-sky-600 hover:underline">
            了解加盟政策
          </Link>
        </p>
      </div>
    </div>
  )
}
