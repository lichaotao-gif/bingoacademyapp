import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { allNavGroups, mainNav } from '../config/nav'
import ChatPopup from './ChatPopup'
import LoginModal from './LoginModal'

export default function Layout({ children }) {
  const loc = useLocation()
  const navigate = useNavigate()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const franchisePartnerPortal = loc.pathname.startsWith('/franchise-partner')
  /** 已登录加盟商工作台：隐藏官网顶栏/底栏与悬浮营销，沉浸后台 */
  const franchiseWorkspace =
    loc.pathname.startsWith('/franchise-partner') && !loc.pathname.startsWith('/franchise-partner/login')
  /** 加盟商登录页：与后台一致不叠悬浮按钮/底栏/客服，避免挡住「登录」 */
  const franchisePartnerLoginPage = loc.pathname.includes('/franchise-partner/login')
  const showPublicMarketingLayers = !franchiseWorkspace && !franchisePartnerLoginPage

  useEffect(() => {
    if (loc.state?.openLogin) {
      setShowLoginModal(true)
      navigate(loc.pathname || '/', { replace: true, state: {} })
    }
  }, [loc.state, loc.pathname, navigate])

  /** 加盟商登录页也不展示官网顶栏，避免 sticky/z-50 遮挡主区域点击 */
  const showSiteHeader = !franchiseWorkspace && !franchisePartnerLoginPage

  return (
    <div className="min-h-screen flex flex-col">
      {showSiteHeader ? (
      <header className="sticky top-0 z-50 bg-bingo-dark text-white shadow-lg border-b border-cyan-500/20 bg-gradient-to-r from-[#0f172a] to-[#1e293b]">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-4 lg:gap-6 min-h-14 flex-nowrap">
            <Link to="/" className="shrink-0 flex items-center gap-2" aria-label="缤果AI学院首页">
              <img
                src="/logo.svg"
                alt="缤果AI学院"
                className="h-9 sm:h-10 w-auto max-h-10 max-w-[min(100%,220px)] object-contain object-left"
                width={307}
                height={85}
              />
            </Link>
            {!franchisePartnerPortal && (
              <nav className="hidden lg:flex flex-1 items-center justify-evenly gap-2 min-w-0 flex-nowrap">
                {allNavGroups.map((group, gi) => (
                  <React.Fragment key={gi}>
                    {gi > 0 && (
                      <span className="w-0.5 h-5 bg-cyan-400/80 shrink-0 rounded-full" aria-hidden />
                    )}
                    <div className="flex items-center justify-center gap-1 shrink-0 py-1">
                      {group.map(({ path, label }) =>
                        path === '/login' ? (
                          <button
                            key={path}
                            type="button"
                            onClick={() => setShowLoginModal(true)}
                            className="px-2 py-2 rounded-lg text-sm whitespace-nowrap shrink-0 transition-colors text-slate-300 hover:text-white hover:bg-white/10"
                          >
                            {label}
                          </button>
                        ) : (
                          <Link
                            key={path}
                            to={path}
                            className={`px-2 py-2 rounded-lg text-sm whitespace-nowrap shrink-0 transition-colors ${
                              loc.pathname === path ? 'bg-cyan-500 text-white' : 'text-slate-300 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            {label}
                          </Link>
                        )
                      )}
                    </div>
                  </React.Fragment>
                ))}
              </nav>
            )}
          </div>
          {/* 移动端折叠导航（加盟商工作台不展示） */}
          {!franchisePartnerPortal && (
            <div className="lg:hidden pb-3 flex flex-wrap gap-1">
              {mainNav.slice(0, 6).map(({ path, label }) => (
                <Link key={path} to={path} className="px-2 py-1 text-xs rounded bg-white/10">{label}</Link>
              ))}
              <Link to="/career" className="px-2 py-1 text-xs rounded bg-white/10">AI职业发展</Link>
              <Link to="/mall" className="px-2 py-1 text-xs rounded bg-white/10">AI工具资源库</Link>
              <Link to="/franchise" className="px-2 py-1 text-xs rounded bg-sky-500">加盟合作</Link>
              <Link to="/profile" className="px-2 py-1 text-xs rounded bg-primary">我的AI工作台</Link>
              <button type="button" onClick={() => setShowLoginModal(true)} className="px-2 py-1 text-xs rounded bg-white/10">登录</button>
            </div>
          )}
        </div>
      </header>
      ) : null}

      <LoginModal open={showLoginModal} onClose={() => setShowLoginModal(false)} />
      <main
        className={
          franchiseWorkspace
            ? 'flex-1 min-h-0'
            : franchisePartnerLoginPage
              ? 'flex-1'
              : 'flex-1 pb-20 lg:pb-0'
        }
      >
        {children}
      </main>

      {/* 右侧悬浮栏：微信咨询、电话咨询、紧急报名 */}
      {showPublicMarketingLayers ? (
      <div className="fixed right-4 bottom-20 z-40 flex flex-col items-end gap-2">
        <Link to="/events/ai-test"
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-primary text-sm font-medium shadow-lg hover:bg-slate-50 transition border border-primary/20">
          🧠 AI测评
        </Link>
        <button type="button" className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/95 text-slate-700 text-xs font-medium shadow-lg hover:bg-slate-50 transition border border-slate-200" title="微信咨询">
          💬 微信咨询
        </button>
        <a href="tel:400-xxx-xxxx" className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/95 text-slate-700 text-xs font-medium shadow-lg hover:bg-slate-50 transition border border-slate-200" title="电话咨询">
          📞 电话咨询
        </a>
        <Link to="/courses"
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold shadow-lg transition">
          🔥 紧急报名
        </Link>
      </div>
      ) : null}

      {/* 移动端底部悬浮条 */}
      {showPublicMarketingLayers ? (
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden flex items-center justify-center gap-3 px-4 py-3 bg-white/95 backdrop-blur border-t border-slate-200 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
        <Link to="/courses" className="flex-1 max-w-[140px] py-2.5 rounded-xl bg-primary text-white text-sm font-bold text-center">课程报名</Link>
        <a href="tel:400-xxx-xxxx" className="flex-1 max-w-[140px] py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-medium text-center">一键拨号</a>
      </div>
      ) : null}

      {showPublicMarketingLayers ? <ChatPopup /> : null}
      {showPublicMarketingLayers ? (
      <footer className="bg-bingo-dark text-slate-400 text-sm py-8 border-t border-cyan-500/20 bg-gradient-to-r from-[#0f172a] to-[#1e293b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap justify-between gap-6">
          <div>
            <Link to="/" className="inline-flex" aria-label="缤果AI学院首页">
              <img
                src="/logo.svg"
                alt="缤果AI学院"
                className="h-8 w-auto max-h-9 max-w-[min(100%,220px)] object-contain object-left sm:h-9 opacity-95 hover:opacity-100 transition-opacity"
                width={307}
                height={85}
              />
            </Link>
            <p className="mt-2">AI课程 + 权威赛事 · 启蒙-进阶-竞赛-升学-就业</p>
          </div>
          <div className="flex gap-6">
            <div>
              <div className="text-white font-medium mb-2">C端</div>
              <Link to="/courses" className="block hover:text-white">AI能力课程</Link>
              <Link to="/courses#growth-plan" className="block hover:text-white">成长计划</Link>
              <Link to="/events" className="block hover:text-white">AI竞赛挑战</Link>
              <Link to="/research" className="block hover:text-white">AI科创实践</Link>
              <Link to="/community" className="block hover:text-white">AI学习社群</Link>
              <Link to="/showcase#honor" className="block hover:text-white">荣誉与公益</Link>
              <Link to="/career" className="block hover:text-white">AI职业发展</Link>
              <Link to="/mall" className="block hover:text-white">AI工具资源库</Link>
              <Link to="/profile" className="block hover:text-white">我的AI工作台</Link>
            </div>
            <div>
              <div className="text-white font-medium mb-2">B端合作</div>
              <Link to="/franchise" className="block hover:text-white">加盟合作</Link>
              <a href="/#/b" className="block hover:text-white">学校/机构</a>
              <a href="/#/b" className="block hover:text-white">赛事合作方</a>
              <Link to="/franchise" className="inline-block mt-2 bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition">商务洽谈</Link>
              <Link to="/franchise" className="inline-block mt-2 ml-2 bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition">索取合作方案</Link>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-6 pt-6 border-t border-gray-700 text-center">
          专家团队 · 合作赛事授权 · 正品保障
        </div>
      </footer>
      ) : null}
    </div>
  )
}
