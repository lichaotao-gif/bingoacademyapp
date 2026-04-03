import { Link } from 'react-router-dom'
import { FRANCHISE_PROMOTABLE_COURSES } from '../../utils/franchisePartnerStorage'
import { useFranchiseWorkspace } from './useFranchiseWorkspace'

function fmtMoney(n) {
  return typeof n === 'number' ? `¥${n.toFixed(2)}` : '—'
}

function fmtDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export default function FranchisePartnerDashboard() {
  const { ws } = useFranchiseWorkspace()
  if (!ws) return <p className="text-slate-500 text-sm">加载中…</p>

  const settled = ws.orders.filter((o) => o.status === '已结算')
  const pending = ws.orders.filter((o) => o.status !== '已结算')
  const totalComm = ws.orders.reduce((s, o) => s + (o.commission || 0), 0)
  const classCount = ws.classes.length
  const studentCount = ws.students.length

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-bingo-dark">数据看板</h1>
        <p className="text-sm text-slate-500 mt-1">推广、订单与教学运营概览（演示数据）</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: '可提现余额', value: fmtMoney(ws.balance), sub: `冻结演示 ¥${ws.frozen}`, to: '/franchise-partner/finance', color: 'from-emerald-500/90 to-teal-600' },
          { label: '累计佣金（订单）', value: fmtMoney(totalComm), sub: `${settled.length} 笔已结算 · ${pending.length} 笔待结`, to: '/franchise-partner/orders', color: 'from-sky-500/90 to-blue-600' },
          { label: '班级数', value: String(classCount), sub: '可创建多个班级', to: '/franchise-partner/classes', color: 'from-violet-500/90 to-purple-600' },
          { label: '在册学员', value: String(studentCount), sub: '按手机号管理', to: '/franchise-partner/students', color: 'from-amber-500/90 to-orange-600' },
        ].map((c) => (
          <Link key={c.label} to={c.to} className={`rounded-2xl p-5 text-white bg-gradient-to-br ${c.color} shadow-sm hover:opacity-95 transition`}>
            <p className="text-xs text-white/85 font-medium">{c.label}</p>
            <p className="text-2xl font-bold mt-2">{c.value}</p>
            <p className="text-[11px] text-white/75 mt-1">{c.sub}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-bingo-dark">可推广课程</h2>
            <Link to="/franchise-partner/promote" className="text-xs text-primary font-medium hover:underline">
              去推广 →
            </Link>
          </div>
          <ul className="space-y-2 text-sm">
            {FRANCHISE_PROMOTABLE_COURSES.slice(0, 4).map((c) => (
              <li key={c.id} className="flex justify-between gap-3 py-2 border-b border-slate-100 last:border-0">
                <span className="text-slate-700 truncate">{c.name}</span>
                <span className="text-slate-500 shrink-0">佣金 {(c.commissionRate * 100).toFixed(0)}%</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-5 rounded-2xl border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-bingo-dark">最近订单</h2>
            <Link to="/franchise-partner/orders" className="text-xs text-primary font-medium hover:underline">
              全部 →
            </Link>
          </div>
          <ul className="space-y-2 text-sm">
            {ws.orders.slice(0, 5).map((o) => (
              <li key={o.id} className="flex flex-wrap justify-between gap-2 py-2 border-b border-slate-100 last:border-0">
                <span className="text-slate-700 truncate max-w-[60%]">{o.courseName}</span>
                <span className="text-emerald-600 font-medium">+{fmtMoney(o.commission)}</span>
                <span className="text-xs text-slate-400 w-full">{fmtDate(o.createdAt)} · {o.status}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card p-5 rounded-2xl border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-bingo-dark">学习进度关注</h2>
          <Link to="/franchise-partner/progress" className="text-xs text-primary font-medium hover:underline">
            查看明细 →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-xs text-slate-500 border-b border-slate-100">
                <th className="pb-2 font-medium">学员</th>
                <th className="pb-2 font-medium">课程</th>
                <th className="pb-2 font-medium">进度</th>
                <th className="pb-2 font-medium">状态</th>
              </tr>
            </thead>
            <tbody>
              {ws.students.flatMap((s) =>
                (s.enrollments || []).map((e, i) => ({
                  key: `${s.id}-${e.courseId}-${i}`,
                  name: s.name,
                  courseId: e.courseId,
                  progressPct: e.progressPct,
                  status: e.status,
                }))
              ).slice(0, 6).map((row) => {
                const courseName = FRANCHISE_PROMOTABLE_COURSES.find((c) => c.id === row.courseId)?.name || row.courseId
                return (
                  <tr key={row.key} className="border-b border-slate-50">
                    <td className="py-2.5 text-slate-700">{row.name}</td>
                    <td className="py-2.5 text-slate-600 truncate max-w-[10rem]">{courseName}</td>
                    <td className="py-2.5">{row.progressPct}%</td>
                    <td className="py-2.5">
                      <span className={'text-xs px-2 py-0.5 rounded-full ' + (row.status === '已完成' ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800')}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
