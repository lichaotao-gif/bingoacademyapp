import { useParams, useLocation, Link } from 'react-router-dom'

export default function OrderVoucher() {
  const { id } = useParams()
  const { state } = useLocation()
  const project = state?.project || { name: '研学项目' }
  const period = state?.period || { name: '暑期营', date: '2025-07-15', place: '北京' }
  const orderNo = state?.orderNo || id

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <Link to="/profile/orders" className="text-primary text-sm hover:underline mb-6 inline-block">← 我的订单</Link>

      <div className="card p-6 border-2 border-primary/30 text-center">
        <h1 className="text-lg font-bold text-bingo-dark mb-4">电子参营凭证</h1>
        <p className="text-xs text-slate-500 mb-2">订单号：{orderNo}</p>
        <div className="w-32 h-32 mx-auto mb-4 bg-slate-100 rounded flex items-center justify-center text-slate-400 text-sm">二维码</div>
        <p className="text-xs text-slate-500 mb-4">现场扫码签到 · 核销 · 保险凭证</p>

        <div className="text-left border-t border-slate-100 pt-4 space-y-2">
          <p><span className="text-slate-500 text-sm">项目：</span>{project.name}</p>
          <p><span className="text-slate-500 text-sm">营期：</span>{period.name}</p>
          <p><span className="text-slate-500 text-sm">时间：</span>{period.date || period.name}</p>
          <p><span className="text-slate-500 text-sm">地点：</span>{period.place || '详见开营通知'}</p>
        </div>

        <p className="text-xs text-slate-400 mt-4">请妥善保存此凭证，入营当日出示</p>
      </div>

      <div className="mt-6 flex gap-3">
        <button type="button" className="flex-1 border border-slate-200 rounded-xl py-2.5 text-slate-600 text-sm hover:bg-slate-50">保存至相册</button>
        <button type="button" className="flex-1 border border-primary text-primary rounded-xl py-2.5 text-sm hover:bg-primary/5">分享给家长</button>
      </div>
    </div>
  )
}
