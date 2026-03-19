import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Login() {
  const navigate = useNavigate()
  const [role] = useState('student') // 默认身份，提交时传给后端
  const [loginType, setLoginType] = useState('code') // 'code' | 'password'
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')

  const handleWechatLogin = () => {
    // TODO: 微信开放平台 / 公众号内 H5 授权或扫码，获取 code 换 token
    navigate('/')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: 调用登录接口，验证码或密码登录，带上 role
    if (loginType === 'code') {
      if (phone && code) navigate('/')
    } else {
      if (phone && password) navigate('/')
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-bingo-dark mb-2">登录</h1>
      <p className="text-slate-600 mb-6">登录后即可使用学习、赛事、购买、分享推广等核心功能；未登录可浏览首页</p>

      <button
        type="button"
        onClick={handleWechatLogin}
        className="w-full py-3 rounded-xl bg-[#07c160] text-white font-medium mb-6 hover:opacity-90 transition"
      >
        微信一键登录
      </button>

      <div className="flex items-center gap-3 mb-6">
        <span className="flex-1 h-px bg-slate-200" />
        <span className="text-slate-500 text-sm">或</span>
        <span className="flex-1 h-px bg-slate-200" />
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

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">手机号</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="请输入手机号"
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
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">忘记密码？</Link>
            </div>
          </div>
        )}
        <button type="submit" className="btn-primary w-full py-3">
          {loginType === 'code' ? '验证码登录' : '密码登录'}
        </button>
      </form>

      <p className="mt-6 text-center text-slate-600 text-sm">
        还没有账号？ <Link to="/register" className="text-primary font-medium hover:underline">立即注册</Link>
      </p>
    </div>
  )
}
