import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import InstitutionQualificationPanel from '../franchise-portal/InstitutionQualificationPanel'
import {
  demoInstitutionPath,
  skipQualificationAndEnterHome,
} from '../../utils/franchiseNewOrgOnboarding'
import { getWorkspace, normalizePartnerPhoneDigits } from '../../utils/franchisePartnerStorage'

export default function InstitutionHqOnboardingQualification() {
  const navigate = useNavigate()
  const { session: layoutSession } = useOutletContext() || {}
  const phone = normalizePartnerPhoneDigits(layoutSession?.loginPhone || layoutSession?.phone || '')
  const partnerId = layoutSession?.qualPartnerId
  const refCode = layoutSession?.qualRefCode
  const [ws, setWs] = useState(null)

  const refresh = useCallback(() => {
    if (!partnerId) return
    try {
      setWs(getWorkspace(partnerId, refCode))
    } catch {
      setWs(null)
    }
  }, [partnerId, refCode])

  useEffect(() => {
    const tid = window.setTimeout(refresh, 0)
    return () => window.clearTimeout(tid)
  }, [refresh])

  const handleSkip = () => {
    const r = skipQualificationAndEnterHome(phone)
    if (r.ok) navigate(r.path, { replace: true })
  }

  if (!layoutSession || !partnerId || !ws) {
    return <p className="text-slate-500 text-sm">加载中…</p>
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4" data-onboarding-allow>
      <div className="rounded-2xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-950">
        <p className="font-semibold">机构资质</p>
        <p className="mt-1 text-amber-900/90 leading-relaxed">
          机构基本资料已提交。请完善证照与经营信息并提交总部审核；审核通过前，开设校区、配置角色等功能暂不可用。
        </p>
      </div>
      <InstitutionQualificationPanel
        partnerId={partnerId}
        refCode={refCode}
        iq={ws.institutionQualification}
        ready={Boolean(ws)}
        readOnly={false}
        showDemoAudit={false}
        productionPresentation
        onAfterMutation={() => {
          refresh()
          window.dispatchEvent(new Event('franchise-new-org-onboarding-changed'))
        }}
        onRetryLoad={refresh}
        sectionTitle="机构资质"
        sectionSubtitle="提交后将由缤果AI学院总部进行资质审核"
        modalTitle="填写机构资质"
      />
      <div className="flex flex-wrap gap-3 pt-2" data-onboarding-allow>
        <button
          type="button"
          onClick={handleSkip}
          className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
        >
          稍后填写，先进入机构首页
        </button>
        <button
          type="button"
          onClick={() => navigate(demoInstitutionPath('settings'), { replace: true })}
          className="rounded-xl border border-primary/30 bg-primary/5 px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10 transition"
        >
          前往机构信息页
        </button>
      </div>
    </div>
  )
}
