import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

// 微信支付 logo（绿色气泡）
const WeChatPayLogo = ({ className = 'w-10 h-10' }) => (
  <span className={className} aria-hidden>
    <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
      <path d="M20 8c-6.6 0-12 4.7-12 10.5 0 3.5 2.2 6.6 5.5 8.5l-1.5 4.4 5-2.5c1.4.2 2.8.3 4.3.3 6.6 0 12-4.7 12-10.5S26.6 8 20 8z" fill="#09BB07"/>
      <path d="M28 14.5c0 3.2-2.5 5.8-5.5 5.8-1.2 0-2.3-.4-3.2-1l-2.6 1.3.9-2.6c-1.8-1.2-3-3.2-3-5.5 0-3.2 2.5-5.8 5.5-5.8s5.5 2.6 5.5 5.8z" fill="#09BB07"/>
    </svg>
  </span>
)

// 支付宝 logo（蓝色）
const AlipayLogo = ({ className = 'w-10 h-10' }) => (
  <span className={`${className} flex items-center justify-center bg-[#1677FF] rounded text-white font-bold text-lg`} aria-hidden>支</span>
)

export default function CoursePayment() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const course = state?.courseName || 'AI启蒙通识课'
  const classType = state?.classType || { name: '标准班', price: 299 }

  const [payMethod, setPayMethod] = useState('wechat')
  const [couponCode, setCouponCode] = useState('')

  const handlePay = () => {
    navigate('/courses/success', { state: { courseName: course, classType } })
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link to="/courses/checkout" className="text-primary text-sm hover:underline mb-6 inline-block">← 返回修改</Link>

      <h1 className="text-xl font-bold text-bingo-dark mb-6">支付订单</h1>

      <div className="card p-6 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-slate-600">{course}</span>
          <span className="font-bold text-primary text-xl">¥{classType.price}</span>
        </div>
      </div>

      <div className="card p-6 mb-6">
        <h3 className="font-semibold text-bingo-dark mb-2">优惠券</h3>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={couponCode}
            onChange={e => setCouponCode(e.target.value)}
            placeholder="请输入优惠券码"
            className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary"
          />
          <button type="button" className="shrink-0 px-5 py-3 rounded-xl border border-primary text-primary text-sm font-medium hover:bg-primary/5">
            使用
          </button>
        </div>

        <h3 className="font-semibold text-bingo-dark mb-4">选择支付方式</h3>
        <div className="space-y-3">
          <label className={'flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition ' + (payMethod === 'wechat' ? 'border-primary bg-primary/5' : 'border-slate-100')}>
            <input type="radio" name="pay" checked={payMethod === 'wechat'} onChange={() => setPayMethod('wechat')} className="text-primary" />
            <WeChatPayLogo className="w-10 h-10 shrink-0" />
            <span className="font-medium">微信支付</span>
          </label>
          <label className={'flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition ' + (payMethod === 'alipay' ? 'border-primary bg-primary/5' : 'border-slate-100')}>
            <input type="radio" name="pay" checked={payMethod === 'alipay'} onChange={() => setPayMethod('alipay')} className="text-primary" />
            <AlipayLogo className="w-10 h-10 shrink-0" />
            <span className="font-medium">支付宝</span>
          </label>
        </div>
      </div>

      <button onClick={handlePay} className="w-full btn-primary py-3 font-bold text-base">确认支付 ¥{classType.price}</button>

      <p className="text-xs text-slate-500 text-center mt-4">支付超时订单保留30分钟，可返回继续支付</p>
    </div>
  )
}
