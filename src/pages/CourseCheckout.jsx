import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

export default function CourseCheckout() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const course = state?.courseName || 'AI启蒙通识课'
  const classType = state?.classType || { name: '标准班', price: 299 }
  const fromTest = state?.fromTest

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    invoice: false,
    useCoupon: false,
    usePoints: false,
    points: 0,
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const paymentState = { ...state, ...form }
    if (fromTest && discount > 0) {
      paymentState.classType = { ...classType, price: finalPrice }
    }
    navigate('/courses/payment', { state: paymentState })
  }

  const discount = fromTest ? 50 : 0
  const finalPrice = Math.max(0, classType.price - discount)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link to="/courses" className="text-primary text-sm hover:underline mb-6 inline-block">← 返回选课</Link>

      <h1 className="text-xl font-bold text-bingo-dark mb-6">确认订单</h1>

      <div className="card p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="font-semibold text-bingo-dark">{course}</h2>
            <p className="text-sm text-slate-500">{classType.name} · {classType.lessons || 12}课时</p>
          </div>
          <span className="font-bold text-primary text-lg">¥{classType.price}</span>
        </div>
        {fromTest && <p className="text-sm text-emerald-600 mb-2">✓ 测评专属优惠 -¥{discount}</p>}
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-500">优惠抵扣</span>
          <span className="text-emerald-600">{discount > 0 ? `-¥${discount}` : '无'}</span>
        </div>
        <div className="flex justify-between font-bold pt-2 border-t border-slate-100">
          <span>实付金额</span>
          <span className="text-primary">¥{finalPrice}</span>
        </div>
        <div className="flex gap-2 text-xs text-emerald-600 mt-3">
          <span>✓ 7天无理由退款</span>
          <span>✓ 发票保障</span>
          <span>✓ 课后答疑</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">姓名 *</label>
          <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary" placeholder="请输入姓名" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">手机号 *</label>
          <input required type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary" placeholder="接收课程开通及学习提醒" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">邮箱（选填）</label>
          <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary" placeholder="接收课程资料" />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={form.useCoupon} onChange={e => setForm({ ...form, useCoupon: e.target.checked })} />
          使用优惠券
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={form.usePoints} onChange={e => setForm({ ...form, usePoints: e.target.checked })} />
          积分抵扣（100积分=10元）
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={form.invoice} onChange={e => setForm({ ...form, invoice: e.target.checked })} />
          需要开具发票
        </label>
        <button type="submit" className="w-full btn-primary py-3 font-bold text-base">提交订单 · 去支付</button>
      </form>
    </div>
  )
}
