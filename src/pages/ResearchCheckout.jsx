import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

export default function ResearchCheckout() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const projectId = state?.projectId || 'ai-general'
  const project = state?.project || { name: '研学项目' }
  const period = state?.period || { name: '暑期营', price: 3980, date: '2025-07-15', days: 7, place: '北京' }
  const form = state?.form || {}

  const [invoice, setInvoice] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    navigate('/research/payment', { state: { ...state, invoice } })
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link to={`/research/register/${projectId}`} state={state} className="text-primary text-sm hover:underline mb-6 inline-block">← 返回修改</Link>

      <h1 className="text-xl font-bold text-bingo-dark mb-6">确认订单</h1>

      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-bingo-dark mb-2">{project.name}</h2>
        <p className="text-sm text-slate-500">{period.name} · {period.date} · {period.days}天 · {period.place}</p>
        <p className="text-sm text-slate-600 mt-2">学员：{form.name || '-'} · 监护人：{form.guardian} {form.phone}</p>
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100">
          <span className="text-slate-600">1 人</span>
          <span className="font-bold text-primary text-xl">¥{period.price}</span>
        </div>
        <div className="flex gap-2 text-xs text-emerald-600 mt-2">
          <span>✓ 含课程费、材料费、午餐、保险</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={invoice} onChange={e => setInvoice(e.target.checked)} />
          需要开具发票（个人/单位，支付后填写）
        </label>
        <button type="submit" className="w-full btn-primary py-3 font-bold text-base">提交订单 · 去支付</button>
      </form>

      <p className="text-xs text-slate-500 text-center mt-4">支付时限 30 分钟，超时未付订单自动取消并释放名额</p>
    </div>
  )
}
