import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { setPartnerSession } from '../../utils/franchisePartnerStorage'

/**
 * 演示登录：任意 11 位手机号 + 非空密码即可进入工作台。
 */
export default function FranchisePartnerLogin() {
  const navigate = useNavigate()
  const [phone, setPhone] = useState('13800138000')
  const [password, setPassword] = useState('demo')
  const [orgName, setOrgName] = useState('缤果示范加盟校')
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
    setPartnerSession({
      partnerId,
      refCode,
      phone: p,
      orgName: orgName.trim() || '我的机构',
      contactName: '管理员',
      loginAt: new Date().toISOString(),
    })
    navigate('/franchise-partner/dashboard', { replace: true })
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="text-xs font-bold text-sky-600 tracking-wider mb-1">B端 · 加盟商工作台</p>
          <h1 className="text-2xl font-bold text-bingo-dark">登录</h1>
          <p className="text-sm text-slate-500 mt-2">管理课程推广、订单分佣、财务提现与班级学员</p>
        </div>
        <form onSubmit={handleSubmit} className="card p-6 sm:p-8 space-y-4 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">机构名称</label>
            <input
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
              placeholder="如：XX 培训中心"
            />
          </div>
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
            演示环境：数据保存在本机浏览器。正式环境需对接总部后台与支付归因。
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
