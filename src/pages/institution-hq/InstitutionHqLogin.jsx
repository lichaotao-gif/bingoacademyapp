import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getInstitutionHqDefaultPathAfterLogin } from '../../constants/institutionHqPortalNav'
import {
  INSTITUTION_HQ_DEMO_PASSWORD,
  INSTITUTION_HQ_DEMO_PHONE,
  getInstitutionHqSession,
  setInstitutionHqSession,
  verifyInstitutionHqLogin,
} from '../../utils/institutionHqStorage'

const SMS_COOLDOWN_SEC = 60

/** public/logo.svg，兼容 Vite base 子路径部署 */
const LOGO_SRC = `${import.meta.env.BASE_URL}logo.svg`

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

export default function InstitutionHqLogin() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('password')
  const [phone, setPhone] = useState(INSTITUTION_HQ_DEMO_PHONE)
  const [password, setPassword] = useState(INSTITUTION_HQ_DEMO_PASSWORD)
  const [smsCode, setSmsCode] = useState('')
  const [err, setErr] = useState('')
  const [smsHint, setSmsHint] = useState('')
  const [smsCooldown, setSmsCooldown] = useState(0)
  const feedbackRef = useRef(null)

  useEffect(() => {
    const s = getInstitutionHqSession()
    if (s?.orgId) {
      navigate(getInstitutionHqDefaultPathAfterLogin(s), { replace: true })
    }
  }, [navigate])

  useEffect(() => {
    setPhone(INSTITUTION_HQ_DEMO_PHONE)
    setPassword(INSTITUTION_HQ_DEMO_PASSWORD)
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

  const submitPassword = useCallback(
    (e) => {
      e.preventDefault()
      setErr('')
      setSmsHint('')
      const p = String(phone || '').replace(/\D/g, '')
      if (p.length !== 11) {
        setErr('请输入11位手机号')
        return
      }
      if (!password.trim()) {
        setErr('请输入密码')
        return
      }
      const r = verifyInstitutionHqLogin(phone, password)
      if (!r.ok) {
        setErr(r.msg || '登录失败')
        return
      }
      try {
        setInstitutionHqSession(r.session)
        navigate(getInstitutionHqDefaultPathAfterLogin(r.session), { replace: true })
      } catch (ex) {
        setErr(ex?.message || '无法保存登录状态')
      }
    },
    [navigate, phone, password],
  )

  const handleSendSms = () => {
    setErr('')
    setSmsHint('')
    const p = String(phone || '').replace(/\D/g, '')
    if (p.length !== 11) {
      setErr('请输入11位手机号')
      return
    }
    if (smsCooldown > 0) return
    setSmsCooldown(SMS_COOLDOWN_SEC)
    setSmsHint('演示环境请使用「密码登录」；短信登录与账号路由打通后可用。')
  }

  const handleSubmitSms = (e) => {
    e.preventDefault()
    setErr('')
    setSmsHint('')
    setErr('请使用「密码登录」。')
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
          <h1 className="text-3xl sm:text-4xl font-bold text-bingo-dark tracking-tight leading-tight">缤果AI学院·加盟商</h1>
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
              id="institution-hq-login-password"
              onSubmit={submitPassword}
              className="space-y-4"
              autoComplete="off"
            >
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">账号</label>
                <input
                  type="tel"
                  name="institution-hq-login-phone"
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
                <input
                  type="text"
                  name="institution-hq-login-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                  placeholder="请输入密码"
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                />
                <p className="text-xs text-slate-500 mt-1.5">密码区分大小写。若无法登录，请联系机构管理员核实账号与权限。</p>
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
                  name="institution-hq-login-phone-sms"
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
              <button type="submit" className="w-full btn-primary py-3 rounded-xl font-semibold text-sm cursor-pointer">
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
