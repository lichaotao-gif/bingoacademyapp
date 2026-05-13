import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getInstitutionHqDefaultPathAfterLogin } from '../../constants/institutionHqPortalNav'
import {
  INSTITUTION_HQ_DEMO_PASSWORD,
  INSTITUTION_HQ_DEMO_PHONE,
  setInstitutionHqSession,
  verifyInstitutionHqLogin,
} from '../../utils/institutionHqStorage'

const LOGO_SRC = `${import.meta.env.BASE_URL}logo.svg`

export default function InstitutionHqLogin() {
  const navigate = useNavigate()
  const [phone, setPhone] = useState(INSTITUTION_HQ_DEMO_PHONE)
  const [password, setPassword] = useState(INSTITUTION_HQ_DEMO_PASSWORD)
  const [err, setErr] = useState('')
  const feedbackRef = useRef(null)

  useEffect(() => {
    if (!err) return
    feedbackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [err])

  const submit = useCallback(
    (e) => {
      e.preventDefault()
      setErr('')
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-900 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-md shadow-2xl p-8 text-white">
        <div className="flex flex-col items-center mb-6">
          <img src={LOGO_SRC} alt="缤果AI学院" className="h-10 w-auto object-contain" width={307} height={85} />
          <h1 className="text-lg font-bold mt-3 text-center">多校区集团工作台</h1>
        </div>

        {err ? (
          <div
            ref={feedbackRef}
            role="alert"
            className="mb-4 rounded-xl border border-rose-400/40 bg-rose-500/15 px-3 py-2 text-sm text-rose-100"
          >
            {err}
          </div>
        ) : null}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">手机号</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-cyan-400/50 tabular-nums"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-cyan-400/50"
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-primary hover:bg-primary-600 text-white font-semibold py-3 text-sm transition shadow-lg shadow-cyan-950/40"
          >
            登录
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-white/10 flex flex-col gap-2 text-center text-sm">
          <Link to="/franchise-partner/login" className="text-sky-300 hover:text-sky-200 hover:underline">
            进入单个校区 · 加盟商工作台登录
          </Link>
          <Link to="/" className="text-slate-500 hover:text-slate-300">
            返回官网首页
          </Link>
        </div>
      </div>
    </div>
  )
}
