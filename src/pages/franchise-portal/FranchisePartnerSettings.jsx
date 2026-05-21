import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getWorkspace, hasPartnerPasswordStored, updatePartnerAccountPassword } from '../../utils/franchisePartnerStorage'
import {
  getInstitutionOrgQualificationWorkspaceKeys,
  partnerIdBelongsToInstitutionHqList,
} from '../../utils/institutionHqStorage'
import InstitutionQualificationPanel from './InstitutionQualificationPanel'
import { useFranchiseWorkspace } from './useFranchiseWorkspace'

export default function FranchisePartnerSettings() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { session, ws, refresh } = useFranchiseWorkspace()
  const [pwdModalOpen, setPwdModalOpen] = useState(false)
  const [pwdOld, setPwdOld] = useState('')
  const [pwdNew, setPwdNew] = useState('')
  const [pwdConfirm, setPwdConfirm] = useState('')
  const [pwdErr, setPwdErr] = useState('')

  const hqKeys = getInstitutionOrgQualificationWorkspaceKeys()
  const hqManaged = Boolean(session && partnerIdBelongsToInstitutionHqList(session.partnerId))

  const iqSourceWs = useMemo(() => {
    if (!session) return null
    if (hqManaged && hqKeys) {
      try {
        return getWorkspace(hqKeys.partnerId, hqKeys.refCode)
      } catch {
        return null
      }
    }
    return ws
  }, [session, hqManaged, hqKeys, ws])

  const iq = iqSourceWs?.institutionQualification
  const panelPartnerId = hqManaged && hqKeys ? hqKeys.partnerId : session?.partnerId
  const panelRefCode = hqManaged && hqKeys ? hqKeys.refCode : session?.refCode
  const readOnlyOrg = hqManaged

  const panelReady = Boolean(session && (readOnlyOrg ? iqSourceWs : ws))

  useEffect(() => {
    if (searchParams.get('pwd') !== '1') return
    setPwdErr('')
    setPwdModalOpen(true)
    setSearchParams(
      (prev) => {
        const n = new URLSearchParams(prev)
        n.delete('pwd')
        return n
      },
      { replace: true },
    )
  }, [searchParams, setSearchParams])

  useEffect(() => {
    if (!pwdModalOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') setPwdModalOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pwdModalOpen])

  if (!session) return <p className="text-slate-500 text-sm">加载中…</p>

  const phone = session.phone || ''
  const phoneDigits = String(phone).replace(/\D/g, '')
  const hasStoredPassword = hasPartnerPasswordStored(phoneDigits)

  const handleChangePassword = (e) => {
    e.preventDefault()
    setPwdErr('')
    const r = updatePartnerAccountPassword(phoneDigits, pwdOld, pwdNew, pwdConfirm)
    if (!r.ok) {
      setPwdErr(r.msg || '修改失败')
      return
    }
    setPwdOld('')
    setPwdNew('')
    setPwdConfirm('')
    setPwdModalOpen(false)
    window.alert('登录密码已更新。下次请使用新密码登录。')
  }

  const introFranchise = readOnlyOrg ? (
    <div className="rounded-xl border border-cyan-200 bg-cyan-50/80 px-4 py-3 text-sm text-cyan-950">
      <p className="font-semibold">校区 · 机构资料只读</p>
      <p className="mt-1 text-cyan-900/90 leading-relaxed">
        机构证照与资质由集团<strong>机构总管理</strong>账号统一维护、编辑并提交总部审核；本校加盟商工作台此处<strong>仅可查看</strong>与集团主数据一致的内容。后续版本可能支持各校单独补充场地类资料。
      </p>
    </div>
  ) : (
    <p className="text-sm text-slate-600 leading-relaxed">
      加盟缤果 AI 学院须提交真实机构与证照信息供总部审核；<strong>审核通过</strong>后方可合规开展课程销售与开班教学。若需更新营业执照等资料，请编辑后重新提交；<strong>二次审核期间不影响</strong>您继续使用现有已通过资质开展业务。
    </p>
  )

  return (
    <div className="w-full space-y-6">
      {!ws ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 flex flex-wrap items-center justify-between gap-3">
          <span>工作台数据加载较慢或未就绪，机构信息可能暂不可用。</span>
          <button
            type="button"
            onClick={() => refresh()}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-900 text-xs font-semibold hover:bg-amber-100"
          >
            重新加载
          </button>
        </div>
      ) : null}

      <div className="min-w-0 max-w-4xl" data-onboarding-allow>
        <InstitutionQualificationPanel
          partnerId={panelPartnerId}
          refCode={panelRefCode}
          iq={iq}
          ready={panelReady}
          readOnly={readOnlyOrg}
          showDemoAudit={!readOnlyOrg && Boolean(ws)}
          onAfterMutation={() => {
            refresh()
            window.dispatchEvent(new Event('franchise-new-org-onboarding-changed'))
          }}
          onRetryLoad={refresh}
          intro={introFranchise}
          sectionTitle={readOnlyOrg ? '机构资料（集团）' : '我的机构'}
          sectionSubtitle={
            readOnlyOrg ? '与机构总管理维护的资质保持一致，仅供本校查阅' : '当前对外与合规依据以「生效资质」为准'
          }
          modalTitle="编辑机构资质"
        />
      </div>

      {pwdModalOpen ? (
        <div className="fixed inset-0 z-[101] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="pwd-modal-title">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={() => setPwdModalOpen(false)} role="presentation" />
          <div
            className="relative w-full max-w-md rounded-2xl bg-white shadow-xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 id="pwd-modal-title" className="text-base font-semibold text-slate-900">
                修改登录密码
              </h3>
              <button
                type="button"
                onClick={() => setPwdModalOpen(false)}
                className="w-9 h-9 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 text-xl leading-none"
                aria-label="关闭"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleChangePassword} className="p-5 space-y-3">
              {pwdErr ? <p className="text-sm text-rose-600">{pwdErr}</p> : null}
              {hasStoredPassword ? (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">当前密码</label>
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={pwdOld}
                    onChange={(e) => setPwdOld(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                    placeholder="请输入当前登录密码"
                  />
                </div>
              ) : null}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">新密码</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={pwdNew}
                  onChange={(e) => setPwdNew(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                  placeholder="至少 6 位"
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">确认新密码</label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={pwdConfirm}
                  onChange={(e) => setPwdConfirm(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                  placeholder="再次输入新密码"
                  minLength={6}
                />
              </div>
              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPwdModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold"
                >
                  保存新密码
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
