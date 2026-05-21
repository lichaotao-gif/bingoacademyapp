import { useNavigate, useOutletContext } from 'react-router-dom'
import InstitutionQualificationPanel from './InstitutionQualificationPanel'
import { skipQualificationAndEnterHome } from '../../utils/franchiseNewOrgOnboarding'
import { normalizePartnerPhoneDigits } from '../../utils/franchisePartnerStorage'
import { useFranchiseWorkspace } from './useFranchiseWorkspace'

export default function FranchisePartnerOnboardingQualification() {
  const navigate = useNavigate()
  const { session: layoutSession } = useOutletContext() || {}
  const { session, ws, refresh } = useFranchiseWorkspace()
  const phone = normalizePartnerPhoneDigits(session?.phone || layoutSession?.phone || '')

  const handleSkip = () => {
    const r = skipQualificationAndEnterHome(phone)
    if (r.ok) navigate(r.path, { replace: true })
  }

  if (!session || !ws) return <p className="text-slate-500 text-sm">加载中…</p>

  return (
    <div className="max-w-3xl mx-auto space-y-4" data-onboarding-allow>
      <div className="rounded-2xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-950">
        <p className="font-semibold">资质资料（新机构入驻）</p>
        <p className="mt-1 text-amber-900/90 leading-relaxed">
          机构基本资料已提交。请填写并提交资质详细资料；也可先进入首页浏览全部菜单，其他功能需资质审核通过后方可使用。
        </p>
      </div>
      <InstitutionQualificationPanel
        partnerId={session.partnerId}
        refCode={session.refCode}
        iq={ws.institutionQualification}
        ready={Boolean(ws)}
        readOnly={false}
        showDemoAudit
        onAfterMutation={() => {
          refresh()
          window.dispatchEvent(new Event('franchise-new-org-onboarding-changed'))
        }}
        onRetryLoad={refresh}
        sectionTitle="机构资质"
        sectionSubtitle="提交后将进入总部审核（演示环境可模拟通过）"
        modalTitle="填写机构资质"
      />
      <div className="flex flex-wrap gap-3 pt-2" data-onboarding-allow>
        <button
          type="button"
          onClick={handleSkip}
          className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
        >
          稍后填写，先进入首页
        </button>
      </div>
    </div>
  )
}
