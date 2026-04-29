import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  clearPartnerSession,
  getPartnerSession,
  hasPartnerPasswordStored,
  simulateInstitutionQualificationApprove,
  simulateInstitutionQualificationReject,
  submitInstitutionQualificationUpdate,
  updatePartnerAccountPassword,
} from '../../utils/franchisePartnerStorage'
import { useFranchiseWorkspace } from './useFranchiseWorkspace'

function fmtTime(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('zh-CN')
  } catch {
    return '—'
  }
}

function maskPhone(phone) {
  const p = String(phone || '').replace(/\D/g, '')
  if (p.length >= 11) return `${p.slice(0, 3)}****${p.slice(-4)}`
  return phone || '—'
}

/** 本地演示单文件上限（base64 后约膨胀 33%） */
const MAX_LICENSE_FILE_BYTES = 4 * 1024 * 1024
const LICENSE_INPUT_ACCEPT = 'application/pdf,image/jpeg,image/jpg,image/png,image/webp,image/gif,.pdf,.png,.jpg,.jpeg,.webp,.gif'

function guessDownloadName(dataUrl) {
  const m = /^data:([^;]+);/i.exec(dataUrl || '')
  const t = (m?.[1] || '').toLowerCase()
  if (t.includes('pdf')) return '营业执照.pdf'
  if (t.includes('png')) return '营业执照.png'
  if (t.includes('webp')) return '营业执照.webp'
  if (t.includes('gif')) return '营业执照.gif'
  return '营业执照.jpg'
}

function downloadLicenseAttachment(att) {
  if (!att?.dataUrl) return
  const name = String(att.fileName || '').replace(/[/\\?%*:|"<>]/g, '_').slice(0, 180) || guessDownloadName(att.dataUrl)
  const a = document.createElement('a')
  a.href = att.dataUrl
  a.download = name
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
}

function isImageDataUrl(dataUrl) {
  return /^data:image\//i.test(dataUrl || '')
}

function ReviewBadge({ status }) {
  const map = {
    approved: { cls: 'bg-emerald-100 text-emerald-800 border-emerald-200', text: '审核已通过' },
    pending_initial: { cls: 'bg-amber-100 text-amber-900 border-amber-200', text: '资质待初审' },
    pending_update: { cls: 'bg-sky-100 text-sky-900 border-sky-200', text: '资质变更审核中' },
    rejected: { cls: 'bg-rose-100 text-rose-800 border-rose-200', text: '上次提交未通过' },
  }
  const m = map[status] || map.approved
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${m.cls}`}>{m.text}</span>
  )
}

function FieldRow({ label, children, className = '' }) {
  return (
    <div className={`grid gap-1 sm:grid-cols-[10rem_1fr] sm:gap-4 py-3 border-b border-slate-100 last:border-0 ${className}`}>
      <dt className="text-slate-500 text-sm shrink-0">{label}</dt>
      <dd className="text-slate-900 text-sm font-medium break-words min-w-0">{children}</dd>
    </div>
  )
}

const emptyForm = {
  orgName: '',
  legalRepresentative: '',
  address: '',
  contactPhone: '',
  businessLicenseNumber: '',
  businessLicenseCopy: '',
  businessScope: '',
  businessLicenseAttachment: null,
}

export default function FranchisePartnerSettings() {
  const navigate = useNavigate()
  const { session, ws, refresh } = useFranchiseWorkspace()
  const raw = typeof window !== 'undefined' ? getPartnerSession() : null
  const [modalOpen, setModalOpen] = useState(false)
  const [pwdModalOpen, setPwdModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [submitErr, setSubmitErr] = useState('')
  const [demoRejectReason, setDemoRejectReason] = useState('请上传更清晰的营业执照扫描件，四角完整可见。')
  const [pwdOld, setPwdOld] = useState('')
  const [pwdNew, setPwdNew] = useState('')
  const [pwdConfirm, setPwdConfirm] = useState('')
  const [pwdErr, setPwdErr] = useState('')

  const iq = ws?.institutionQualification
  const snap = iq?.approvedSnapshot

  const openModal = useCallback(() => {
    if (!iq) return
    const base = iq.pendingReview?.snapshot || snap || emptyForm
    setForm({
      orgName: base.orgName ?? '',
      legalRepresentative: base.legalRepresentative ?? '',
      address: base.address ?? '',
      contactPhone: base.contactPhone ?? '',
      businessLicenseNumber: base.businessLicenseNumber ?? '',
      businessLicenseCopy: base.businessLicenseCopy ?? '',
      businessScope: base.businessScope ?? '',
      businessLicenseAttachment: base.businessLicenseAttachment?.dataUrl
        ? {
            fileName: base.businessLicenseAttachment.fileName,
            dataUrl: base.businessLicenseAttachment.dataUrl,
          }
        : null,
    })
    setSubmitErr('')
    setModalOpen(true)
  }, [iq, snap])

  useEffect(() => {
    if (!modalOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') setModalOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [modalOpen])

  useEffect(() => {
    if (!pwdModalOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') setPwdModalOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pwdModalOpen])

  const handleSubmitForm = (e) => {
    e.preventDefault()
    setSubmitErr('')
    if (!session) return
    const r = submitInstitutionQualificationUpdate(session.partnerId, session.refCode, form)
    if (!r.ok) {
      setSubmitErr(r.msg || '提交失败')
      return
    }
    refresh()
    setModalOpen(false)
    window.alert('已提交总部审核。资质变更复审期间，您仍可正常售课与开班，以当前已通过资质为准。')
  }

  const runDemoApprove = () => {
    if (!session) return
    const r = simulateInstitutionQualificationApprove(session.partnerId, session.refCode)
    if (!r.ok) window.alert(r.msg)
    else {
      refresh()
      window.alert('（演示）总部已通过审核，下方「当前生效资质」已更新。')
    }
  }

  const runDemoReject = () => {
    if (!session) return
    const r = simulateInstitutionQualificationReject(session.partnerId, session.refCode, demoRejectReason)
    if (!r.ok) window.alert(r.msg)
    else {
      refresh()
      window.alert('（演示）总部已驳回，生效资质未变，请修改后重新提交。')
    }
  }

  const pendingHint = useMemo(() => {
    if (!iq?.pendingReview) return null
    const t = fmtTime(iq.pendingReview.submittedAt)
    if (iq.reviewStatus === 'pending_update') {
      return (
        <div className="rounded-xl border border-sky-200 bg-sky-50/90 px-4 py-3 text-sm text-sky-950">
          <p className="font-semibold">资质变更已提交（{t}）</p>
          <p className="mt-1.5 text-sky-900/90 leading-relaxed">
            总部正在复核您更新的证照与机构信息。根据加盟政策，<strong>复审期间不影响</strong>您使用工作台售课、开班及日常运营，仍以下方「当前生效资质」为准；审核通过后，对外展示与合规记录将自动切换为新版本。
          </p>
        </div>
      )
    }
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-950">
        <p className="font-semibold">首次资质已提交（{t}）</p>
        <p className="mt-1.5 text-amber-900/90 leading-relaxed">
          加盟 <strong>缤果 AI 学院</strong> 需经总部资质审核；审核通过后方可被系统标记为「正式合作机构」并完整开通相关能力（演示环境仍可使用工作台主要功能）。请留意审核结果通知。
        </p>
      </div>
    )
  }, [iq])

  /** 仅依赖 session；ws 未就绪时仍展示账号/密码/退出，避免整页卡在「加载中」 */
  if (!session) return <p className="text-slate-500 text-sm">加载中…</p>

  const phone = session.phone || ''
  const phoneDigits = String(phone).replace(/\D/g, '')
  const contactName = session.contactName || '—'
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

  const handleLogout = () => {
    if (!window.confirm('确定退出当前账号？未保存的表单将丢失。')) return
    clearPartnerSession()
    navigate('/franchise-partner/login', { replace: true })
  }

  return (
    <div className="space-y-6 max-w-3xl">
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

      <p className="text-sm text-slate-600 leading-relaxed">
        加盟缤果 AI 学院须提交真实机构与证照信息供总部审核；<strong>审核通过</strong>后方可合规开展课程销售与开班教学。若需更新营业执照等资料，请编辑后重新提交；<strong>二次审核期间不影响</strong>您继续使用现有已通过资质开展业务。
      </p>

      {ws ? pendingHint : null}

      {ws && iq?.reviewStatus === 'rejected' && iq.rejectReason ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50/90 px-4 py-3 text-sm text-rose-900">
          <p className="font-semibold">上次审核反馈</p>
          <p className="mt-1">{iq.rejectReason}</p>
        </div>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-base font-semibold text-slate-900">我的机构</h2>
            <p className="text-xs text-slate-500 mt-1">当前对外与合规依据以「生效资质」为准</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {ws && iq ? <ReviewBadge status={iq.reviewStatus} /> : null}
            <button
              type="button"
              onClick={openModal}
              disabled={!ws || !iq}
              className="shrink-0 px-4 py-2 rounded-xl bg-[#3B66FF] hover:bg-[#2f56e6] disabled:opacity-50 text-white text-sm font-semibold transition-colors"
            >
              {iq?.pendingReview ? '修改并重新提交' : '编辑机构资料'}
            </button>
          </div>
        </div>

        <div className="px-5 py-2">
          {!ws ? (
            <p className="text-sm text-slate-500 py-8 text-center">正在加载机构档案…</p>
          ) : snap ? (
            <dl>
              <FieldRow label="机构名称">{snap.orgName || '—'}</FieldRow>
              <FieldRow label="法定代表人">{snap.legalRepresentative || '—'}</FieldRow>
              <FieldRow label="机构地址">{snap.address || '—'}</FieldRow>
              <FieldRow label="联系人电话">{snap.contactPhone ? maskPhone(snap.contactPhone) : '—'}</FieldRow>
              <FieldRow label="营业执照号/统一社会信用代码">{snap.businessLicenseNumber || '—'}</FieldRow>
              <FieldRow label="营业执照">
                <div className="space-y-2 font-normal">
                  {snap.businessLicenseAttachment?.dataUrl ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => downloadLicenseAttachment(snap.businessLicenseAttachment)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#3B66FF]/40 bg-[#3B66FF]/5 text-[#3B66FF] text-xs font-semibold hover:bg-[#3B66FF]/10"
                      >
                        下载电子版
                      </button>
                      <span className="text-xs text-slate-500 break-all">
                        {snap.businessLicenseAttachment.fileName || guessDownloadName(snap.businessLicenseAttachment.dataUrl)}
                      </span>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">尚未上传电子版，可填写下方说明或进入编辑上传。</p>
                  )}
                  {snap.businessLicenseCopy ? (
                    <p className="text-slate-700 text-sm leading-relaxed">{snap.businessLicenseCopy}</p>
                  ) : null}
                </div>
              </FieldRow>
              <FieldRow label="经营范围">{snap.businessScope || '—'}</FieldRow>
              <FieldRow label="最近通过审核时间">{fmtTime(iq.lastApprovedAt)}</FieldRow>
            </dl>
          ) : (
            <p className="text-sm text-slate-500 py-6">暂无机构档案，请点击「编辑机构资料」填写。</p>
          )}
        </div>

        {ws && iq?.pendingReview?.snapshot ? (
          <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/40">
            <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">待审核提交预览（未生效）</p>
            <p className="text-xs text-slate-500 mt-1">提交时间：{fmtTime(iq.pendingReview.submittedAt)}</p>
            <dl className="mt-3 space-y-0">
              <FieldRow label="机构名称">{iq.pendingReview.snapshot.orgName}</FieldRow>
              <FieldRow label="法定代表人">{iq.pendingReview.snapshot.legalRepresentative}</FieldRow>
              <FieldRow label="营业执照号">{iq.pendingReview.snapshot.businessLicenseNumber}</FieldRow>
              {iq.pendingReview.snapshot.businessLicenseAttachment?.dataUrl ? (
                <FieldRow label="营业执照电子版（待审）">
                  <button
                    type="button"
                    onClick={() => downloadLicenseAttachment(iq.pendingReview.snapshot.businessLicenseAttachment)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-sky-300 bg-white text-sky-800 text-xs font-semibold hover:bg-sky-50"
                  >
                    下载待审附件
                  </button>
                </FieldRow>
              ) : null}
            </dl>
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-base font-semibold text-slate-900 mb-4">登录账号</h2>
          <dl className="space-y-0">
            <FieldRow label="联系人">{contactName}</FieldRow>
            <FieldRow label="登录手机">{maskPhone(phone)}</FieldRow>
            <FieldRow label="最近登录">{raw?.loginAt ? fmtTime(raw.loginAt) : '—'}</FieldRow>
          </dl>
        </div>

        <div className="pt-6 border-t border-slate-100">
          <h2 className="text-base font-semibold text-slate-900 mb-1">登录密码</h2>
          <p className="text-xs text-slate-500 mb-4">
            {hasStoredPassword
              ? '修改后请使用新密码登录。演示环境密码保存在本机浏览器。'
              : '尚未在本地记录密码：提交后写入本机；若曾用其他浏览器登录，请先在本机重新登录一次。'}
          </p>
          <button
            type="button"
            onClick={() => {
              setPwdErr('')
              setPwdModalOpen(true)
            }}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 text-sm font-semibold hover:bg-slate-50 shadow-sm"
          >
            修改密码
          </button>
        </div>

        <div className="pt-6 border-t border-slate-100">
          <h2 className="text-base font-semibold text-slate-900 mb-1">退出账号</h2>
          <p className="text-xs text-slate-500 mb-4">退出后将清除当前登录状态，需重新登录才能使用工作台。</p>
          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-sm font-semibold hover:bg-rose-100"
          >
            退出当前账号
          </button>
        </div>
      </section>

      <details className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-4 py-3 text-sm text-slate-600">
        <summary className="cursor-pointer font-medium text-slate-700 select-none">演示 · 模拟总部审核</summary>
        {!ws ? <p className="mt-2 text-xs text-slate-500">请先点击上方「重新加载」拉取工作台数据后再试。</p> : null}
        <p className="mt-2 text-xs leading-relaxed">
          本地演示无真实总部接口。提交资质后，可用下方按钮模拟「通过 / 驳回」以查看状态与文案变化。
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={runDemoApprove}
            disabled={!ws}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold"
          >
            模拟审核通过
          </button>
        </div>
        <div className="mt-3 flex flex-col sm:flex-row sm:items-end gap-2">
          <label className="flex-1 text-xs block">
            <span className="text-slate-500">驳回原因</span>
            <input
              value={demoRejectReason}
              onChange={(e) => setDemoRejectReason(e.target.value)}
              disabled={!ws}
              className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs disabled:opacity-50"
            />
          </label>
          <button
            type="button"
            onClick={runDemoReject}
            disabled={!ws}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-semibold shrink-0"
          >
            模拟驳回
          </button>
        </div>
      </details>

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
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-[#3B66FF] focus:ring-2 focus:ring-[#3B66FF]/15"
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
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-[#3B66FF] focus:ring-2 focus:ring-[#3B66FF]/15"
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
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-[#3B66FF] focus:ring-2 focus:ring-[#3B66FF]/15"
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

      {modalOpen && iq ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={() => setModalOpen(false)} role="presentation" />
          <div
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white z-10">
              <h3 className="text-base font-semibold text-slate-900">编辑机构资质</h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-9 h-9 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 text-xl leading-none"
                aria-label="关闭"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmitForm} className="p-5 space-y-4">
              {submitErr ? <p className="text-sm text-rose-600">{submitErr}</p> : null}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">机构名称</label>
                <input
                  required
                  value={form.orgName}
                  onChange={(e) => setForm((f) => ({ ...f, orgName: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-[#3B66FF] focus:ring-2 focus:ring-[#3B66FF]/15"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">法定代表人</label>
                <input
                  required
                  value={form.legalRepresentative}
                  onChange={(e) => setForm((f) => ({ ...f, legalRepresentative: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-[#3B66FF] focus:ring-2 focus:ring-[#3B66FF]/15"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">机构地址</label>
                <textarea
                  required
                  rows={2}
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-[#3B66FF] focus:ring-2 focus:ring-[#3B66FF]/15 resize-y min-h-[4rem]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">联系人电话</label>
                <input
                  required
                  type="tel"
                  value={form.contactPhone}
                  onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-[#3B66FF] focus:ring-2 focus:ring-[#3B66FF]/15"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">营业执照注册号 / 统一社会信用代码</label>
                <input
                  required
                  value={form.businessLicenseNumber}
                  onChange={(e) => setForm((f) => ({ ...f, businessLicenseNumber: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-[#3B66FF] focus:ring-2 focus:ring-[#3B66FF]/15"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">营业执照电子版</label>
                <p className="text-xs text-slate-500 mb-2">支持 PDF 或 JPG / PNG / WebP / GIF，单文件不超过 4MB（本地演示存入浏览器，正式环境将上传至总部服务器）。</p>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="inline-flex items-center justify-center px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-800 hover:bg-slate-50 cursor-pointer shrink-0">
                    选择文件
                    <input
                      type="file"
                      accept={LICENSE_INPUT_ACCEPT}
                      className="sr-only"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        e.target.value = ''
                        if (!file) return
                        if (file.size > MAX_LICENSE_FILE_BYTES) {
                          window.alert('文件过大，请上传不超过 4MB 的文件。')
                          return
                        }
                        const okMime = /^(application\/pdf|image\/(jpeg|jpg|png|gif|webp))$/i.test(file.type)
                        const okExt = /\.(pdf|jpe?g|png|gif|webp)$/i.test(file.name)
                        if (!okMime && !okExt) {
                          window.alert('仅支持 PDF 或图片格式。')
                          return
                        }
                        try {
                          const dataUrl = await new Promise((resolve, reject) => {
                            const r = new FileReader()
                            r.onload = () => resolve(String(r.result || ''))
                            r.onerror = () => reject(new Error('read'))
                            r.readAsDataURL(file)
                          })
                          if (!dataUrl.startsWith('data:')) throw new Error('invalid')
                          setForm((f) => ({
                            ...f,
                            businessLicenseAttachment: { fileName: file.name, dataUrl },
                          }))
                        } catch {
                          window.alert('读取文件失败，请重试。')
                        }
                      }}
                    />
                  </label>
                  {form.businessLicenseAttachment?.dataUrl ? (
                    <>
                      <button
                        type="button"
                        onClick={() => downloadLicenseAttachment(form.businessLicenseAttachment)}
                        className="inline-flex items-center px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        下载当前文件
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, businessLicenseAttachment: null }))}
                        className="inline-flex items-center px-3 py-2 rounded-xl text-sm font-medium text-rose-700 hover:bg-rose-50"
                      >
                        移除文件
                      </button>
                    </>
                  ) : null}
                </div>
                {form.businessLicenseAttachment?.dataUrl ? (
                  <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3 space-y-2">
                    <p className="text-xs text-slate-600 break-all font-medium">
                      {form.businessLicenseAttachment.fileName || '已选文件'}
                    </p>
                    {isImageDataUrl(form.businessLicenseAttachment.dataUrl) ? (
                      <img
                        src={form.businessLicenseAttachment.dataUrl}
                        alt="营业执照预览"
                        className="max-h-40 rounded-lg border border-slate-200 object-contain bg-white"
                      />
                    ) : (
                      <p className="text-xs text-slate-500">已选择 PDF，保存后可在详情中下载查看。</p>
                    )}
                  </div>
                ) : null}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">营业执照复印件说明（选填）</label>
                <textarea
                  rows={2}
                  value={form.businessLicenseCopy}
                  onChange={(e) => setForm((f) => ({ ...f, businessLicenseCopy: e.target.value }))}
                  placeholder="可补充纸质件存档编号等；若已上传电子版，可不填。"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-[#3B66FF] focus:ring-2 focus:ring-[#3B66FF]/15 resize-y min-h-[4rem]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">经营范围</label>
                <textarea
                  required
                  rows={3}
                  value={form.businessScope}
                  onChange={(e) => setForm((f) => ({ ...f, businessScope: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-[#3B66FF] focus:ring-2 focus:ring-[#3B66FF]/15 resize-y min-h-[5rem]"
                />
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                提交后总部将尽快审核。若您此前已通过加盟审核，本次为资质变更复审，复审期间不影响售课与开班。
              </p>
              <div className="flex flex-wrap justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-[#3B66FF] hover:bg-[#2f56e6] text-white text-sm font-semibold"
                >
                  提交审核
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
