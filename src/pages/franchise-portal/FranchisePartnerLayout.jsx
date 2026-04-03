import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { clearPartnerSession, displayPartnerOrgName, getPartnerSession } from '../../utils/franchisePartnerStorage'

const NAV = [
  { to: '/franchise-partner/dashboard', label: '数据看板', icon: '📊' },
  { to: '/franchise-partner/promote', label: '课程推广', icon: '🔗' },
  { to: '/franchise-partner/orders', label: '订单收益', icon: '💰' },
  { to: '/franchise-partner/finance', label: '财务提现', icon: '🏦' },
  { to: '/franchise-partner/classes', label: '班级管理', icon: '👥' },
  { to: '/franchise-partner/students', label: '学生管理', icon: '🎓' },
  { to: '/franchise-partner/progress', label: '学习进度', icon: '📈' },
]

export default function FranchisePartnerLayout() {
  const navigate = useNavigate()
  const [session, setSession] = useState(() => getPartnerSession())
  const [openNav, setOpenNav] = useState(false)

  useEffect(() => {
    const s = getPartnerSession()
    if (!s) {
      navigate('/franchise-partner/login', { replace: true })
      return
    }
    setSession(s)
  }, [navigate])

  if (!session) return null

  const orgDisplay = displayPartnerOrgName(session)

  const logout = () => {
    clearPartnerSession()
    navigate('/franchise-partner/login', { replace: true })
  }

  const linkCls = ({ isActive }) =>
    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ' +
    (isActive ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100')

  return (
    <div className="min-h-[calc(100vh-6rem)] bg-slate-50 flex flex-col lg:flex-row">
      <aside
        className={
          'lg:w-60 shrink-0 border-b lg:border-b-0 lg:border-r border-slate-200 bg-white flex flex-col lg:min-h-[calc(100vh-6rem)] ' +
          (openNav ? 'block' : 'hidden lg:block')
        }
      >
        <div className="p-4 border-b border-slate-100">
          <p className="text-xs text-slate-500">当前机构</p>
          <p className="font-semibold text-bingo-dark truncate mt-0.5">{session.orgName}</p>
          <p className="text-[10px] text-slate-400 mt-1 font-mono truncate">推广码 {session.refCode}</p>
        </div>
        <nav className="p-3 space-y-1 flex-1">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkCls} onClick={() => setOpenNav(false)}>
              <span className="text-lg leading-none">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-100 mt-auto">
          <button
            type="button"
            onClick={logout}
            className="w-full text-left text-sm text-slate-500 hover:text-red-600 px-4 py-2 rounded-xl hover:bg-red-50"
          >
            退出登录
          </button>
          <Link to="/" className="block text-center text-xs text-primary hover:underline mt-3 px-2">
            返回官网
          </Link>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 px-4 py-3 bg-white/95 backdrop-blur border-b border-slate-200 lg:hidden">
          <button
            type="button"
            className="text-sm font-medium text-bingo-dark"
            onClick={() => setOpenNav((v) => !v)}
            aria-expanded={openNav}
          >
            ☰ 菜单
          </button>
          <span className="text-xs text-slate-500 truncate">{orgDisplay}</span>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          <Outlet context={{ session }} />
        </main>
      </div>
    </div>
  )
}
