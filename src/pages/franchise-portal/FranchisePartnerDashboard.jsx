import { Link } from 'react-router-dom'
import {
  computeMonthOrderCount,
  computeTotalSales,
  FRANCHISE_PROMOTABLE_COURSES,
  getDiscountLabel,
} from '../../utils/franchisePartnerStorage'
import {
  FlatIconBolt,
  FlatIconBookClass,
  FlatIconChartBar,
  FlatIconClipboard,
  FlatIconCoins,
  FlatIconCreditCard,
  FlatIconTrendingUp,
  FlatIconUserPlus,
  FlatIconUsers,
} from './FranchiseFlatIcons'
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

  const totalSales = computeTotalSales(ws)
  const monthOrders = computeMonthOrderCount(ws)
  const studentCount = ws.students.length
  const classesPreview = [...ws.classes].slice(0, 4)

  return (
    <div className="space-y-6">
      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            label: '总销售额（元）',
            value: fmtMoney(totalSales),
            sub: '+18.6% 较上月',
            subClass: 'text-emerald-600',
            Icon: FlatIconCreditCard,
            iconBox: 'bg-sky-500/12 text-sky-600',
            bg: 'bg-gradient-to-br from-sky-50 to-white border-sky-100',
          },
          {
            label: '当前账户余额（元）',
            value: fmtMoney(ws.balance),
            sub: '+12.3% 较上月',
            subClass: 'text-emerald-600',
            Icon: FlatIconCoins,
            iconBox: 'bg-amber-500/12 text-amber-600',
            bg: 'bg-gradient-to-br from-amber-50 to-white border-amber-100',
          },
          {
            label: '本月订单数',
            value: String(monthOrders),
            sub: `累计 ${ws.orders.length} 笔`,
            subClass: 'text-slate-500',
            Icon: FlatIconChartBar,
            iconBox: 'bg-emerald-500/12 text-emerald-600',
            bg: 'bg-gradient-to-br from-emerald-50 to-white border-emerald-100',
          },
          {
            label: '在读学员数',
            value: String(studentCount),
            sub: `${ws.classes.length} 个班级`,
            subClass: 'text-slate-500',
            Icon: FlatIconUsers,
            iconBox: 'bg-violet-500/12 text-violet-600',
            bg: 'bg-gradient-to-br from-violet-50 to-white border-violet-100',
          },
        ].map((k) => {
          const KpiIcon = k.Icon
          return (
            <div key={k.label} className={`rounded-2xl border p-5 shadow-sm ${k.bg}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-slate-500 font-medium">{k.label}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">{k.value}</p>
                  <p className={`text-xs mt-2 font-medium ${k.subClass}`}>{k.sub}</p>
                </div>
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${k.iconBox}`}
                  aria-hidden
                >
                  <KpiIcon className="w-5 h-5" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 班级管理 */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">班级管理</h2>
            <Link to="/franchise-partner/classes" className="text-xs text-[#3B66FF] font-medium hover:underline">
              全部
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
                  <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
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
          <Link
            to="/franchise-partner/classes"
            className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#3B66FF] hover:bg-[#2f56e6] text-white text-sm font-semibold transition"
          >
            + 创建班级
          </Link>
        </div>

        {/* 快速操作 */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-4">快速操作</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                to: '/franchise-partner/recharge',
                label: '充课操作',
                sub: '扣减余额 · 开通课程',
                wrap: 'from-sky-50 to-sky-100/80 border-sky-100',
                Icon: FlatIconBolt,
                iconBox: 'bg-sky-500/15 text-sky-600',
              },
              {
                to: '/franchise-partner/students',
                label: '添加学员',
                sub: '分班与手机号',
                wrap: 'from-orange-50 to-amber-50 border-orange-100',
                Icon: FlatIconUserPlus,
                iconBox: 'bg-orange-500/15 text-orange-600',
              },
              {
                to: '/franchise-partner/orders',
                label: '查看订单',
                sub: '明细与折扣',
                wrap: 'from-emerald-50 to-teal-50 border-emerald-100',
                Icon: FlatIconClipboard,
                iconBox: 'bg-emerald-500/15 text-emerald-600',
              },
              {
                to: '/franchise-partner/finance',
                label: '财务统计',
                sub: '销售与流水',
                wrap: 'from-violet-50 to-purple-50 border-violet-100',
                Icon: FlatIconTrendingUp,
                iconBox: 'bg-violet-500/15 text-violet-600',
              },
            ].map((a) => {
              const ActIcon = a.Icon
              return (
                <Link
                  key={a.to}
                  to={a.to}
                  className={`rounded-xl border p-4 bg-gradient-to-br ${a.wrap} hover:shadow-md transition block`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${a.iconBox}`} aria-hidden>
                    <ActIcon className="w-5 h-5" />
                  </div>
                  <p className="text-sm font-semibold text-slate-900 mt-2">{a.label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{a.sub}</p>
                </Link>
              )
            })}
          </div>
        </div>

        {/* 右侧栏 */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900 mb-1">账户余额</h2>
            <p className="text-2xl font-bold text-[#3B66FF] tabular-nums">¥{fmtMoney(ws.balance)}</p>
            <Link
              to="/franchise-partner/balance"
              className="mt-3 block w-full text-center py-3 rounded-xl bg-[#3B66FF] hover:bg-[#2f56e6] text-white text-sm font-semibold transition"
            >
              余额充值
            </Link>
            <Link to="/franchise-partner/finance" className="block text-center text-xs text-slate-500 hover:text-[#3B66FF] mt-2">
              余额变动记录 →
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-slate-900">专属折扣</h2>
              <Link to="/franchise-partner/discounts" className="text-[11px] text-[#3B66FF] hover:underline">
                折扣查看
              </Link>
            </div>
            <ul className="space-y-2.5">
              {FRANCHISE_PROMOTABLE_COURSES.slice(0, 4).map((c) => {
                const label = getDiscountLabel(ws, c.id)
                const rate = ws.courseDiscounts?.find((d) => d.courseId === c.id)?.rate ?? 1
                const sale = Math.round(c.price * rate * 100) / 100
                return (
                  <li key={c.id} className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-slate-600 truncate">{c.name}</span>
                    <span className="shrink-0 text-right">
                      <span className="text-slate-400 line-through mr-1">¥{c.price}</span>
                      <span className="text-red-500 font-semibold">{label}</span>
                      <span className="text-slate-800 font-medium ml-1">¥{sale}</span>
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* 最新订单 */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">最新订单</h2>
          <Link to="/franchise-partner/orders" className="text-xs text-[#3B66FF] font-medium hover:underline">
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
                  <td className="px-5 py-3 font-semibold text-[#3B66FF] tabular-nums">¥{Number(o.payAmount).toFixed(2)}</td>
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
