import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { saveSessionUser } from '../utils/sessionUser'

const LOGO_SRC = `${import.meta.env.BASE_URL}logo.svg`
const DEFAULT_LOGIN_ACCOUNT = '13910001001'
const DEFAULT_LOGIN_PASSWORD = 'student123'

export default function LoginModal({ open, onClose }) {
  const navigate = useNavigate()
  const [loginType, setLoginType] = useState('password')
  const [account, setAccount] = useState(DEFAULT_LOGIN_ACCOUNT)
  const [password, setPassword] = useState(DEFAULT_LOGIN_PASSWORD)
  const [code, setCode] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const filled = loginType === 'code' ? Boolean(account && code) : Boolean(account && password)
    if (!filled) return
    const isPhone = /^1\d{10}$/.test(account.trim())
    saveSessionUser(isPhone ? { phone: account } : { uid: account, phone: '' })
    onClose?.()
    navigate('/')
  }

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="fixed left-1/2 top-1/2 z-[101] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <img
                src={LOGO_SRC}
                alt="缤果AI学院"
                className="h-10 w-auto max-w-[220px] object-contain object-left"
                width={307}
                height={85}
              />
              <h2 className="mt-3 text-xl font-bold text-bingo-dark">缤果AI学院</h2>
              <p className="mt-1 text-sm text-slate-500">登录学习账户</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              aria-label="关闭"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-3 flex gap-2">
            <button
              type="button"
              onClick={() => setLoginType('code')}
              className={`flex-1 py-2 rounded-lg text-sm border transition ${loginType === 'code' ? 'border-primary bg-primary/10 text-primary' : 'border-slate-200 text-slate-600'}`}
            >
              验证码登录
            </button>
            <button
              type="button"
              onClick={() => setLoginType('password')}
              className={`flex-1 py-2 rounded-lg text-sm border transition ${loginType === 'password' ? 'border-primary bg-primary/10 text-primary' : 'border-slate-200 text-slate-600'}`}
            >
              密码登录
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{loginType === 'code' ? '手机号' : '登录账户'}</label>
              <input
                type={loginType === 'code' ? 'tel' : 'text'}
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                placeholder={loginType === 'code' ? '请输入手机号' : '请输入手机号/UID 登录账户'}
                className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
                required
              />
            </div>
            {loginType === 'code' ? (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">验证码</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="请输入验证码"
                    className="flex-1 rounded-lg border border-slate-300 px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
                    required
                  />
                  <button type="button" className="shrink-0 px-4 py-2 rounded-lg border border-primary text-primary text-sm">
                    获取验证码
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">密码</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
                  required
                />
                <div className="flex justify-end mt-1">
                  <Link to="/forgot-password" onClick={onClose} className="text-sm text-primary hover:underline">忘记密码？</Link>
                </div>
              </div>
            )}
            <button type="submit" className="btn-primary w-full py-3">
              {loginType === 'code' ? '验证码登录' : '密码登录'}
            </button>
          </form>

          <p className="mt-4 text-center text-slate-600 text-sm">
            还没有账号？ <Link to="/register" onClick={onClose} className="text-primary font-medium hover:underline">立即注册</Link>
          </p>
        </div>
      </div>
    </>
  )
}
