import { useState } from 'react'
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom'

export default function ResearchRegister() {
  const { id } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const project = state?.project || { name: '研学项目' }
  const period = state?.period || { name: '暑期营', price: 3980, date: '2025-07-15', days: 7, place: '北京' }

  const [form, setForm] = useState({
    name: '', age: '', school: '', grade: '', idCard: '',
    guardian: '', phone: '', emergency: '',
    agreeSafety: false, agreeRefund: false, agreePrivacy: false,
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    navigate('/research/checkout', { state: { projectId: id, project: project, period: period, form } })
  }

  const allAgreed = form.agreeSafety && form.agreeRefund && form.agreePrivacy

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link to={`/research/detail/${id}`} className="text-primary text-sm hover:underline mb-6 inline-block">← 返回项目详情</Link>

      <div className="card p-4 mb-6 bg-slate-50">
        <p className="font-semibold text-bingo-dark">{project.name}</p>
        <p className="text-sm text-slate-500 mt-1">{period.name} · {period.date} · {period.days}天 · {period.place}</p>
        <p className="text-lg font-bold text-primary mt-2">¥{period.price}</p>
      </div>

      <h1 className="text-xl font-bold text-bingo-dark mb-6">填写报名信息</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6">
          <h3 className="font-semibold text-bingo-dark mb-4">报名人信息</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">学员姓名 *</label>
              <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary" placeholder="请输入" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">年龄 *</label>
              <input required type="number" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary" placeholder="岁" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">学校</label>
              <input value={form.school} onChange={e => setForm({ ...form, school: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary" placeholder="选填" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">年级</label>
              <input value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary" placeholder="如：初一" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">身份证号 *（用于保险）</label>
              <input required value={form.idCard} onChange={e => setForm({ ...form, idCard: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary" placeholder="18位身份证" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-bingo-dark mb-4">监护人信息</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">监护人姓名 *</label>
              <input required value={form.guardian} onChange={e => setForm({ ...form, guardian: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary" placeholder="请输入" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">联系电话 *</label>
              <input required type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary" placeholder="接收订单及营期通知" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">紧急联系人</label>
              <input value={form.emergency} onChange={e => setForm({ ...form, emergency: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary" placeholder="姓名+电话" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-bingo-dark mb-4">知情同意（必勾选）</h3>
          <div className="space-y-3">
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" required checked={form.agreeSafety} onChange={e => setForm({ ...form, agreeSafety: e.target.checked })} />
              <span>已阅读并同意<button type="button" className="text-primary hover:underline">《安全须知》</button></span>
            </label>
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" required checked={form.agreeRefund} onChange={e => setForm({ ...form, agreeRefund: e.target.checked })} />
              <span>已阅读并同意<button type="button" className="text-primary hover:underline">《退费规则》</button></span>
            </label>
            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" required checked={form.agreePrivacy} onChange={e => setForm({ ...form, agreePrivacy: e.target.checked })} />
              <span>已阅读并同意<button type="button" className="text-primary hover:underline">《隐私协议》</button></span>
            </label>
          </div>
        </div>

        <button type="submit" disabled={!allAgreed} className="w-full btn-primary py-3 font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed">
          提交报名 · 生成订单
        </button>
      </form>
    </div>
  )
}
