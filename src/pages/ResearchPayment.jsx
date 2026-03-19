import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

export default function ResearchPayment() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const project = state?.project || { name: '研学项目' }
  const period = state?.period || { name: '暑期营', price: 3980 }

  const [payMethod, setPayMethod] = useState('wechat')

  const handlePay = () => {
    navigate('/research/success', { state: { project, period, orderNo: 'RX' + Date.now().toString().slice(-10) } })
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link to="/research/checkout" className="text-primary text-sm hover:underline mb-6 inline-block">← 返回修改</Link>

      <h1 className="text-xl font-bold text-bingo-dark mb-6">支付订单</h1>

      <div className="card p-6 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-slate-600">{project.name} · {period.name}</span>
          <span className="font-bold text-primary text-xl">¥{period.price}</span>
        </div>
        <p className="text-xs text-slate-500 mt-2">1 人 · 待支付</p>
      </div>

      <div className="card p-6 mb-6">
        <h3 className="font-semibold text-bingo-dark mb-4">选择支付方式</h3>
        <div className="space-y-3">
          {[
            { id: 'wechat', name: '微信支付', icon: '💬' },
            { id: 'alipay', name: '支付宝', icon: '💳' },
          ].map((m) => (
            <label key={m.id} className={'flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition ' + (payMethod === m.id ? 'border-primary bg-primary/5' : 'border-slate-100')}>
              <input type="radio" name="pay" checked={payMethod === m.id} onChange={() => setPayMethod(m.id)} className="text-primary" />
              <span className="text-xl">{m.icon}</span>
              <span className="font-medium">{m.name}</span>
            </label>
          ))}
        </div>
      </div>

      <button onClick={handlePay} className="w-full btn-primary py-3 font-bold text-base">确认支付 ¥{period.price}</button>

      <p className="text-xs text-slate-500 text-center mt-4">30 分钟未支付自动取消 · 名额将释放</p>
    </div>
  )
}
