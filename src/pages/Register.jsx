import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const ROLES = [
  { value: 'student', label: '学生/家长' },
  { value: 'teacher', label: '教师/机构' },
  { value: 'enterprise', label: '企业' },
]

export default function Register() {
  const navigate = useNavigate()
  const [role, setRole] = useState('student')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [agree, setAgree] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: 调用注册接口、发送验证码，带上 role
    if (phone && password && agree) {
      navigate('/login')
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-bingo-dark mb-2">注册</h1>
      <p className="text-slate-600 mb-8">注册即享新人福利，学习课程、报名赛事、分享推广赚佣金</p>

      <div className="mb-4">
        <span className="block text-sm font-medium text-slate-700 mb-2">注册身份</span>
        <div className="flex flex-wrap gap-2">
          {ROLES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setRole(r.value)}
              className={`px-4 py-2 rounded-lg text-sm border transition ${
                role === r.value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-slate-300 text-slate-600 hover:border-primary/50'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
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
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">验证码</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="请输入验证码"
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <button type="button" className="shrink-0 px-4 py-2 rounded-lg border border-primary text-primary text-sm whitespace-nowrap">
              获取验证码
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">设置密码</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="6位以上字母或数字"
            className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary"
            required
            minLength={6}
          />
        </div>
        <label className="flex items-start gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="mt-1 rounded border-slate-300 text-primary focus:ring-primary"
          />
          <span>我已阅读并同意 <a href="/#/agreement" className="text-primary hover:underline">《用户协议》</a> 和 <a href="/#/privacy" className="text-primary hover:underline">《隐私政策》</a></span>
        </label>
        <button type="submit" className="btn-primary w-full py-3" disabled={!agree}>
          注册
        </button>
      </form>

      <p className="mt-6 text-center text-slate-600 text-sm">
        已有账号？ <Link to="/login" className="text-primary font-medium hover:underline">去登录</Link>
      </p>
    </div>
  )
}
