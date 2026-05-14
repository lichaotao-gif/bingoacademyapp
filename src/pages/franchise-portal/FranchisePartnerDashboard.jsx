import { Link } from 'react-router-dom'
import { FlatIconBookClass, FlatIconCoins, FlatIconUsers } from './FranchiseFlatIcons'
import { useFranchiseWorkspace } from './useFranchiseWorkspace'

function fmtMoney(n) {
  return typeof n === 'number' ? n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—'
}

function fmtDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function FranchisePartnerDashboard() {
  const { session, ws } = useFranchiseWorkspace()

  if (!ws || !session) return <p className="text-slate-500 text-sm">加载中…</p>

  const studentCount = ws.students.length
  const classCount = ws.classes.length
  const classesPreview = [...ws.classes].slice(0, 4)

  return (
    <div className="space-y-6">
      {/* 顶部：当前余额、班级数、学员数 */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {[
          {
            label: '当前账户余额（元）',
            value: fmtMoney(ws.balance),
            sub: '+12.3% 较上月',
            subClass: 'text-emerald-600',
            Icon: FlatIconCoins,
            iconBox: 'bg-amber-500/12 text-amber-600',
            bg: 'bg-gradient-to-br from-amber-50 to-white border-amber-100',
            balanceActions: true,
          },
          {
            label: '班级数',
            value: String(classCount),
            sub: '在读班级',
            subClass: 'text-slate-500',
            Icon: FlatIconBookClass,
            iconBox: 'bg-sky-500/12 text-sky-600',
            bg: 'bg-gradient-to-br from-sky-50 to-white border-sky-100',
          },
          {
            label: '学员数',
            value: String(studentCount),
            sub: '在读学员',
            subClass: 'text-slate-500',
            Icon: FlatIconUsers,
            iconBox: 'bg-violet-500/12 text-violet-600',
            bg: 'bg-gradient-to-br from-violet-50 to-white border-violet-100',
          },
        ].map((k) => {
          const KpiIcon = k.Icon
          return (
            <div key={k.label} className={`rounded-2xl border p-3 sm:p-5 shadow-sm min-w-0 ${k.bg}`}>
              <div className="flex items-start justify-between gap-1 sm:gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] sm:text-xs text-slate-500 font-medium leading-tight line-clamp-2">{k.label}</p>
                  <p className="text-base sm:text-2xl font-bold text-slate-900 mt-1 sm:mt-2 tabular-nums break-all">{k.value}</p>
                  <p className={`text-[10px] sm:text-xs mt-1 sm:mt-2 font-medium leading-tight ${k.subClass}`}>{k.sub}</p>
                  {k.balanceActions ? (
                    <div className="mt-2 sm:mt-3 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-1.5 sm:gap-2">
                      <Link
                        to="/franchise-partner/balance"
                        className="inline-flex items-center justify-center px-2 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-semibold bg-primary hover:bg-primary-600 text-white shadow-sm transition text-center"
                      >
                        余额充值
                      </Link>
                      <Link
                        to="/franchise-partner/finance"
                        className="text-[10px] sm:text-xs text-slate-500 hover:text-primary font-medium truncate"
                      >
                        余额变动记录 →
                      </Link>
                    </div>
                  ) : null}
                </div>
                <div
                  className={`w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 ${k.iconBox}`}
                  aria-hidden
                >
                  <KpiIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 班级列表 */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-2 flex-wrap mb-4">
          <h2 className="font-semibold text-slate-900">班级列表</h2>
          <Link to="/franchise-partner/classes" className="text-xs text-primary font-medium hover:underline shrink-0">
            全部班级 →
          </Link>
        </div>
        <ul className="space-y-3">
          {classesPreview.map((cls) => {
            const n = cls.studentIds?.length || 0
            return (
              <li
                key={cls.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition"
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-100 text-primary flex items-center justify-center shrink-0">
                  <FlatIconBookClass className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 truncate">{cls.name}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{n} 名学员</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 shrink-0">在读</span>
              </li>
            )
          })}
        </ul>
      </div>

      {/* 最新订单 */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 gap-2 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="font-semibold text-slate-900">最新订单</h2>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 border border-violet-200/90 shrink-0">
              后续版本
            </span>
          </div>
          <Link to="/franchise-partner/orders" className="text-xs text-primary font-medium hover:underline shrink-0">
            全部订单 →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[720px]">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">订单号</th>
                <th className="px-5 py-3 font-medium">学员</th>
                <th className="px-5 py-3 font-medium">课程</th>
                <th className="px-5 py-3 font-medium">原价</th>
                <th className="px-5 py-3 font-medium">折扣</th>
                <th className="px-5 py-3 font-medium">实付扣款</th>
                <th className="px-5 py-3 font-medium">下单时间</th>
                <th className="px-5 py-3 font-medium">状态</th>
              </tr>
            </thead>
            <tbody>
              {ws.orders.slice(0, 8).map((o) => (
                <tr key={o.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                  <td className="px-5 py-3 font-mono text-slate-600">{o.id}</td>
                  <td className="px-5 py-3 font-semibold text-slate-900">{o.studentName}</td>
                  <td className="px-5 py-3 text-slate-700 max-w-[12rem] truncate">{o.courseName}</td>
                  <td className="px-5 py-3 text-slate-600 tabular-nums">¥{Number(o.originalPrice).toFixed(2)}</td>
                  <td className="px-5 py-3">
                    <span className="inline-flex text-xs font-medium px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      {o.discountLabel}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-semibold text-primary tabular-nums">¥{Number(o.payAmount).toFixed(2)}</td>
                  <td className="px-5 py-3 text-slate-600 whitespace-nowrap">{fmtDate(o.createdAt)}</td>
                  <td className="px-5 py-3">
                    <span
                      className={
                        'text-xs px-2.5 py-0.5 rounded-full font-medium ' +
                        (o.status === '已完成' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800')
                      }
                    >
                      {o.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[11px] text-slate-400 text-center">BingoAI学院 · 加盟商后台 v1.1.0</p>
    </div>
  )
}
