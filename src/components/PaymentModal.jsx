import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

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

/**
 * 付款弹窗：课程列表/课程详情点击「立即购买」时弹出
 */
export default function PaymentModal({ open, onClose, courseName, price, paymentState = {} }) {
  const navigate = useNavigate()
  const [payMethod, setPayMethod] = useState('wechat')
  const [couponCode, setCouponCode] = useState('')

  if (!open) return null

  const isGroup = Boolean(paymentState?.groupBuy)
  const isFree = price === '0元' || price === '免费' || price === '赠送'

  const handleConfirmPay = () => {
    onClose()
    if (isFree) {
      navigate('/courses/success', { state: { courseName, classType: { name: '-', price: 0 }, ...paymentState } })
    } else {
      const classType = paymentState?.classType || { name: '标准班', price: parseInt(String(price).replace(/[^\d]/g, ''), 10) || 0 }
      navigate('/courses/success', { state: { courseName, classType, ...paymentState } })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white">
          <h3 className="font-bold text-bingo-dark text-lg">{isGroup ? '拼团支付' : '付款'}</h3>
          <button type="button" onClick={onClose} className="p-2 -m-2 text-slate-400 hover:text-slate-600 rounded-lg" aria-label="关闭">✕</button>
        </div>
        <div className="p-5 space-y-5">
          {isGroup && (
            <div className="rounded-xl border border-orange-200 bg-orange-50 px-3 py-2.5 text-sm text-orange-900">
              <p className="font-semibold">邀请好友一起拼团</p>
              <p className="text-xs mt-1 leading-relaxed opacity-95">
                支付成功后请把邀请链接发给好友；满 {paymentState.groupTargetSize ?? 3} 人即成团。未满成团规则以活动页为准（演示）。
              </p>
            </div>
          )}
          <div className="rounded-xl border border-slate-100 p-4">
            <p className="text-slate-600 text-sm truncate">{courseName}</p>
            <p className="font-bold text-primary text-xl mt-1">{price}</p>
            {isGroup && paymentState?.groupId && (
              <p className="text-[11px] text-slate-400 mt-2 font-mono truncate" title={paymentState.groupId}>
                拼团单号 · {paymentState.groupId}
              </p>
            )}
          </div>

          {!isFree && (
            <>
              <div>
                <p className="font-semibold text-bingo-dark mb-2">优惠券</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value)}
                    placeholder="请输入优惠券码"
                    className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                  />
                  <button type="button" className="shrink-0 px-4 py-2.5 rounded-xl border border-primary text-primary text-sm font-medium hover:bg-primary/5">
                    使用
                  </button>
                </div>
              </div>
              <div>
                <p className="font-semibold text-bingo-dark mb-3">选择支付方式</p>
                <div className="space-y-2">
                  <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${payMethod === 'wechat' ? 'border-primary bg-primary/5' : 'border-slate-100'}`}>
                    <input type="radio" name="pay" checked={payMethod === 'wechat'} onChange={() => setPayMethod('wechat')} className="text-primary" />
                    <WeChatPayLogo className="w-9 h-9 shrink-0" />
                    <span className="font-medium text-sm">微信支付</span>
                  </label>
                  <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${payMethod === 'alipay' ? 'border-primary bg-primary/5' : 'border-slate-100'}`}>
                    <input type="radio" name="pay" checked={payMethod === 'alipay'} onChange={() => setPayMethod('alipay')} className="text-primary" />
                    <AlipayLogo className="w-9 h-9 shrink-0" />
                    <span className="font-medium text-sm">支付宝</span>
                  </label>
                </div>
              </div>
            </>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm">取消</button>
            <button type="button" onClick={handleConfirmPay} className="flex-1 btn-primary py-3 font-bold text-sm rounded-xl">
              {isFree ? '确认领取' : isGroup ? `支付开团价 ${price}` : `确认支付 ${price}`}
            </button>
          </div>
          {!isFree && <p className="text-xs text-slate-500 text-center">支付超时订单保留30分钟</p>}
        </div>
      </div>
    </div>
  )
}
