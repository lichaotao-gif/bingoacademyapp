import { Link, useLocation } from 'react-router-dom'

export default function ResearchSuccess() {
  const { state } = useLocation()
  const project = state?.project || { name: '研学项目' }
  const period = state?.period || { name: '暑期营' }
  const orderNo = state?.orderNo || 'RX0000000000'

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center">
      <div className="text-6xl mb-4">✅</div>
      <h1 className="text-2xl font-bold text-bingo-dark mb-2">支付成功</h1>
      <p className="text-slate-600 mb-2">{project.name} · {period.name}</p>
      <p className="text-sm text-slate-500 mb-8">订单号：{orderNo} · 电子凭证已生成，可在「我的订单」查看</p>

      <div className="space-y-3 mb-8">
        <Link to="/profile/orders" className="block w-full btn-primary py-3 font-bold">查看我的订单</Link>
        <Link to={`/profile/orders/${orderNo}/voucher`} state={{ project, period, orderNo }}
          className="block w-full border border-primary text-primary rounded-xl py-3 font-medium hover:bg-primary/5">
          查看电子凭证
        </Link>
        <Link to="/research" className="block w-full border border-slate-200 rounded-xl py-3 text-slate-600 hover:bg-slate-50">
          继续浏览研学项目
        </Link>
        <div className="card p-4 bg-slate-50 text-left mt-4">
          <p className="text-sm font-medium text-bingo-dark mb-2">营期服务群</p>
          <div className="w-24 h-24 bg-slate-200 rounded flex items-center justify-center text-slate-400 text-xs">二维码</div>
          <p className="text-xs text-slate-500 mt-2">扫码添加企业微信，备注订单号入群</p>
        </div>
      </div>

      <div className="card p-6 text-left">
        <h3 className="font-semibold text-bingo-dark mb-3">推荐研学</h3>
        <div className="space-y-3">
          {[
            { name: '数据科学研学营', to: '/research/detail/data-science' },
            { name: '机器学习启蒙营', to: '/research/detail/ml-intro' },
          ].map((c) => (
            <Link key={c.name} to={c.to} className="flex justify-between items-center p-3 rounded-lg hover:bg-slate-50 transition">
              <span className="text-sm font-medium">{c.name}</span>
              <span className="text-primary text-sm">立即报名 →</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
