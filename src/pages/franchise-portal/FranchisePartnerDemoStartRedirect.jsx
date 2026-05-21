import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { startSimulatedNewOrgRegistration } from '../../utils/franchiseNewOrgOnboarding'

/** 首页等入口一键进入新机构入驻流程（自动创建会话） */
export default function FranchisePartnerDemoStartRedirect() {
  const navigate = useNavigate()

  useEffect(() => {
    const r = startSimulatedNewOrgRegistration()
    if (r.ok) {
      navigate(r.path, { replace: true })
      return
    }
    navigate('/franchise-partner/login', { replace: true })
  }, [navigate])

  return (
    <div className="min-h-[40vh] flex items-center justify-center text-slate-500 text-sm">
      正在进入…
    </div>
  )
}
