import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { setPartnerSession } from '../../utils/franchisePartnerStorage'

/**
 * 演示登录：任意 11 位手机号 + 非空密码即可进入工作台。
 * 机构名称由手机号自动生成，写入 session，在工作台侧栏与数据看板展示。
 */
export default function FranchisePartnerLogin() {
  const navigate = useNavigate()
  const [phone, setPhone] = useState('13800138000')
  const [password, setPassword] = useState('demo')
  const [err, setErr] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setErr('')
    const p = phone.replace(/\D/g, '')
    if (p.length !== 11) {
      setErr('请输入11位手机号')
      return
    }
    if (!password.trim()) {
      setErr('请输入密码')
      return
    }
    const refCode = `FJ-${p.slice(-4)}-${Date.now().toString(36).slice(-4).toUpperCase()}`
    const partnerId = `p_${p}`
    const masked = `${p.slice(0, 3)}****${p.slice(-4)}`
    const orgName = `缤果AI学院·加盟商（${masked}）`
    setPartnerSession({
      partnerId,
      refCode,
      phone: p,
      orgName,
      contactName: '管理员',
      loginAt: new Date().toISOString(),
    })
    navigate('/franchise-partner/dashboard', { replace: true })
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-bingo-dark tracking-tight leading-tight">
            缤果AI学院·加盟商
          </h1>
          <p className="text-sm text-slate-500 mt-3">工作台登录 · 管理课程推广、分佣、财务与班级学员</p>
        </div>
        <form onSubmit={handleSubmit} className="card p-6 sm:p-8 space-y-4 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">登录手机</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
              placeholder="11位手机号"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
              placeholder="演示任意非空密码"
              autoComplete="current-password"
            />
          </div>
          {err ? <p className="text-sm text-red-600">{err}</p> : null}
          <button type="submit" className="w-full btn-primary py-3 rounded-xl font-semibold text-sm">
            进入工作台
          </button>
          <p className="text-[11px] text-slate-400 text-center leading-relaxed">
            演示环境：登录后将按手机号生成机构展示名，数据保存在本机浏览器。正式环境需对接总部后台与支付归因。
          </p>
        </form>
        <p className="text-center mt-6 text-sm text-slate-500">
          <Link to="/" className="text-primary hover:underline">← 返回官网首页</Link>
          <span className="mx-2 text-slate-300">|</span>
          <Link to="/franchise" className="text-sky-600 hover:underline">了解加盟政策</Link>
        </p>
      </div>
    </div>
  )
}
