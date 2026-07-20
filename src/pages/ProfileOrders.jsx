import { useState } from 'react'
import { Link } from 'react-router-dom'

const TABS = [
  { key: 'all', label: '全部' },
  { key: 'course', label: '课程订单' },
  { key: 'mall', label: '资源商城' },
  { key: 'pending', label: '待支付' },
  { key: 'paid', label: '已支付' },
  { key: 'completed', label: '已完成' },
  { key: 'cancelled', label: '已取消' },
]

// 模拟订单数据
const MOCK_ORDERS = [
  { id: 'CO20250715001', source: 'course', project: 'AI 萌芽 · 一星能力课程', period: '课程学习包', count: 1, amount: 399, time: '2025-07-10 14:32', status: 'paid' },
  { id: 'CO20250712002', source: 'course', project: 'AI 创意表达 · 进阶课程', period: '课程学习包', count: 1, amount: 599, time: '2025-07-08 09:15', status: 'completed' },
  { id: 'MO20250718003', source: 'mall', project: 'AI 创作启蒙工具套装', period: '资源商城', count: 1, amount: 168, time: '2025-07-12 16:20', status: 'pending' },
]

const STATUS_MAP = {
  pending: { label: '待支付', color: 'text-amber-600' },
  paid: { label: '已支付', color: 'text-emerald-600' },
  completed: { label: '已完成', color: 'text-slate-600' },
  cancelled: { label: '已取消', color: 'text-slate-400' },
}

export default function ProfileOrders() {
  const [tab, setTab] = useState('all')
  const orders = MOCK_ORDERS.filter(o => tab === 'all' || (tab === 'course' || tab === 'mall' ? o.source === tab : o.status === tab))

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/profile" className="text-slate-500 hover:text-primary text-sm">← 个人中心</Link>
        <span className="text-slate-300">/</span>
        <span className="text-bingo-dark font-medium">我的订单</span>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={'shrink-0 px-4 py-2 rounded-full text-sm transition ' + (tab === t.key ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>{t.label}</button>
        ))}
      </div>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="card p-12 text-center text-slate-500">
            <p className="mb-4">暂无{tab === 'all' ? '' : STATUS_MAP[tab]?.label || ''}订单</p>
            <Link to="/research" className="text-primary hover:underline">去报名研学项目</Link>
          </div>
        ) : (
          orders.map((o) => (
            <div key={o.id} className="card p-5">
              <div className="flex justify-between items-start mb-3 gap-3">
                <div>
                  <div className="mb-1.5 flex items-center gap-2"><span className={'rounded-full px-2 py-0.5 text-[10px] font-bold ' + (o.source === 'course' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600')}>{o.source === 'course' ? '课程订单' : '资源商城'}</span><p className="font-semibold text-bingo-dark">{o.project}</p></div>
                  <p className="text-sm text-slate-500">{o.period} · {o.count} 人</p>
                  <p className="text-xs text-slate-400 mt-1">订单号 {o.id} · {o.time}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">¥{o.amount}</p>
                  <span className={'text-xs ' + (STATUS_MAP[o.status]?.color || 'text-slate-500')}>{STATUS_MAP[o.status]?.label}</span>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap pt-3 border-t border-slate-100">
                {o.status === 'pending' && (
                  <>
                    <Link to="/research/payment" state={{ project: { name: o.project }, period: { name: o.period, price: o.amount } }}
                      className="btn-primary text-sm px-4 py-2">去支付</Link>
                    <button type="button" className="border border-slate-200 rounded-lg text-slate-600 text-sm px-4 py-2 hover:bg-slate-50">取消订单</button>
                  </>
                )}
                {o.status === 'paid' && (
                  <>
                    <Link to={`/profile/orders/${o.id}/voucher`} state={{ project: { name: o.project }, period: { name: o.period, date: '2025-07-15', place: '北京' }, orderNo: o.id }}
                      className="border border-primary text-primary rounded-lg text-sm px-4 py-2 hover:bg-primary/5">查看凭证</Link>
                    <button type="button" className="border border-slate-200 rounded-lg text-slate-600 text-sm px-4 py-2 hover:bg-slate-50">申请退款</button>
                  </>
                )}
                {o.status === 'completed' && (
                  <Link to={`/profile/orders/${o.id}/voucher`} state={{ project: { name: o.project }, period: { name: o.period, date: '2025-07-15', place: '北京' }, orderNo: o.id }}
                    className="border border-slate-200 rounded-lg text-slate-600 text-sm px-4 py-2 hover:bg-slate-50">查看凭证</Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
