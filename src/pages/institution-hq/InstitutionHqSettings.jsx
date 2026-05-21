import { useCallback, useEffect, useMemo, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { getWorkspace } from '../../utils/franchisePartnerStorage'
import { getInstitutionOrgQualificationWorkspaceKeys } from '../../utils/institutionHqStorage'
import InstitutionQualificationPanel from '../franchise-portal/InstitutionQualificationPanel'

export default function InstitutionHqSettings() {
  const ctx = useOutletContext()
  const session = ctx?.session
  const [tick, setTick] = useState(0)

  const refresh = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    const onFs = () => refresh()
    window.addEventListener('franchise-partner-session-changed', onFs)
    return () => window.removeEventListener('franchise-partner-session-changed', onFs)
  }, [refresh])

  const keys = useMemo(() => {
    void tick
    return getInstitutionOrgQualificationWorkspaceKeys()
  }, [tick])

  const iqSourceWs = useMemo(() => {
    void tick
    if (!keys) return null
    try {
      return getWorkspace(keys.partnerId, keys.refCode)
    } catch {
      return null
    }
  }, [keys, tick])

  const iq = iqSourceWs?.institutionQualification

  if (!session) {
    return <p className="text-slate-500 text-sm">加载中…</p>
  }

  const isStaff = session.staffSubUser === true
  const readOnlyQual = isStaff

  const introHq = (
    <div className="space-y-3">
      <p className="text-sm text-slate-600 leading-relaxed">
        平台总管理后台对合作机构的<strong>审核主要针对机构资料</strong>。请由机构总管理主账号在此以机构名义填写、上传证照并提交审核；各校加盟商工作台侧为<strong>只读同步</strong>展示同一套资料。
      </p>
      {isStaff ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-950">
          当前为权限子账号，仅可查看机构资料，不可编辑或提交审核。
        </div>
      ) : null}
    </div>
  )

  const allowQualEdit = session.isolatedNewOrgDemo === true

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-2" data-onboarding-allow={allowQualEdit ? true : undefined}>
      {!keys ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-950">
          尚未配置校区账号，无法关联机构资质存储。请先在「校区账号」中添加至少一个校区后再维护机构资料。
        </div>
      ) : (
        <InstitutionQualificationPanel
          partnerId={keys.partnerId}
          refCode={keys.refCode}
          iq={iq}
          ready={Boolean(iqSourceWs)}
          readOnly={readOnlyQual}
          showDemoAudit={!isStaff && !allowQualEdit}
          productionPresentation={allowQualEdit}
          onAfterMutation={refresh}
          intro={introHq}
          sectionTitle="机构资料"
          sectionSubtitle="提交总部审核的集团主体资质；各校工作台同步展示"
          modalTitle="编辑机构资质（集团）"
        />
      )}
    </div>
  )
}
