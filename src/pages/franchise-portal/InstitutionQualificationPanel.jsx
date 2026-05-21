import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  simulateInstitutionQualificationApprove,
  simulateInstitutionQualificationReject,
  submitInstitutionQualificationUpdate,
} from '../../utils/franchisePartnerStorage'
import {
  AttachmentPreview,
  FieldRow,
  ReviewBadge,
  resolveQualificationDisplayStatus,
  ReviewFileInput,
  buildQualificationFormFromSnapshots,
  downloadLicenseAttachment,
  fmtTime,
  getChangedQualificationFieldKeys,
  qualificationSnapshotHasContent,
  guessDownloadName,
  isImageDataUrl,
  LICENSE_INPUT_ACCEPT,
  maskPhone,
  MAX_LICENSE_FILE_BYTES,
  validateQualificationFormForSubmit,
} from './institutionQualificationShared'
import { QualificationSnapshotFields } from './InstitutionQualificationSnapshot'

/**
 * 机构资质：编辑 / 提交审核 / 演示通过驳回。
 * 机构总与加盟商「机构信息 / 账号设置」资质区共用；集团托管校区侧 readOnly 仅展示。
 */
export default function InstitutionQualificationPanel({
  partnerId,
  refCode,
  iq,
  ready = true,
  readOnly = false,
  showDemoAudit = true,
  productionPresentation = false,
  onAfterMutation,
  intro = null,
  onRetryLoad,
  sectionTitle = '我的机构',
  sectionSubtitle = '当前对外与合规依据以「生效资质」为准',
  modalTitle = '编辑机构资质',
}) {
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(() => buildQualificationFormFromSnapshots(null, null))
  const [submitErr, setSubmitErr] = useState('')
  const submitErrRef = useRef(null)
  const [demoRejectReason, setDemoRejectReason] = useState('请上传更清晰的营业执照扫描件，四角完整可见。')

  const snap = iq?.approvedSnapshot

  const fieldsUnderReview = useMemo(() => {
    if (!iq?.pendingReview?.snapshot) return new Set()
    return getChangedQualificationFieldKeys(snap, iq.pendingReview.snapshot)
  }, [snap, iq?.pendingReview?.snapshot])

  const openModal = useCallback(() => {
    if (!iq) return
    setForm(buildQualificationFormFromSnapshots(iq.pendingReview?.snapshot, snap))
    setSubmitErr('')
    setModalOpen(true)
  }, [iq, snap])

  useEffect(() => {
    if (!modalOpen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => {
      if (e.key === 'Escape') setModalOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [modalOpen])

  useEffect(() => {
    if (!submitErr) return
    submitErrRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [submitErr])

  const handleSubmitForm = (e) => {
    e.preventDefault()
    setSubmitErr('')
    const validationMsg = validateQualificationFormForSubmit(form)
    if (validationMsg) {
      setSubmitErr(validationMsg)
      return
    }
    const pid = String(partnerId || '').trim()
    const rc = String(refCode || '').trim()
    if (!pid || !rc) {
      setSubmitErr('缺少机构资质存储关联，请刷新页面或联系管理员。')
      return
    }
    const r = submitInstitutionQualificationUpdate(pid, rc, form)
    if (!r.ok) {
      setSubmitErr(r.msg || '提交失败')
      return
    }
    onAfterMutation?.()
    setModalOpen(false)
    window.alert('已提交总部审核。资质变更复审期间，您仍可正常售课与开班，以当前已通过资质为准。')
  }

  const runDemoApprove = () => {
    const pid = String(partnerId || '').trim()
    const rc = String(refCode || '').trim()
    if (!pid || !rc) return
    const r = simulateInstitutionQualificationApprove(pid, rc)
    if (!r.ok) window.alert(r.msg)
    else {
      onAfterMutation?.()
      window.alert(
        productionPresentation
          ? '总部已通过审核，机构信息已更新。'
          : '（演示）总部已通过审核，下方「当前生效资质」已更新。',
      )
    }
  }

  const runDemoReject = () => {
    const pid = String(partnerId || '').trim()
    const rc = String(refCode || '').trim()
    if (!pid || !rc) return
    const r = simulateInstitutionQualificationReject(pid, rc, demoRejectReason)
    if (!r.ok) window.alert(r.msg)
    else {
      onAfterMutation?.()
      window.alert(
        productionPresentation
          ? '总部已驳回，请根据反馈修改机构信息后重新提交。'
          : '（演示）总部已驳回，生效资质未变，请修改后重新提交。',
      )
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
          加盟 <strong>缤果 AI 学院</strong> 需经总部资质审核；审核通过后方可被系统标记为「正式合作机构」并完整开通相关能力。请留意审核结果通知。
        </p>
      </div>
    )
  }, [iq])

  return (
    <div className="w-full space-y-6">
      {!ready && onRetryLoad ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-950 flex flex-wrap items-center justify-between gap-3">
          <span>工作台数据加载较慢或未就绪，机构信息可能暂不可用。</span>
          <button
            type="button"
            onClick={() => onRetryLoad()}
            className="shrink-0 px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-900 text-xs font-semibold hover:bg-amber-100"
          >
            重新加载
          </button>
        </div>
      ) : null}

      {intro}

      {ready ? pendingHint : null}

      {ready && iq?.reviewStatus === 'rejected' && iq.rejectReason ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50/90 px-4 py-3 text-sm text-rose-900">
          <p className="font-semibold">上次审核反馈</p>
          <p className="mt-1">{iq.rejectReason}</p>
        </div>
      ) : null}

      <section className="w-full rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex w-full flex-wrap items-start justify-between gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-base font-semibold text-slate-900">{sectionTitle}</h2>
            <p className="text-xs text-slate-500 mt-1">{sectionSubtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {ready && iq ? <ReviewBadge status={resolveQualificationDisplayStatus(iq)} /> : null}
            {!readOnly ? (
              <button
                type="button"
                onClick={openModal}
                disabled={!ready || !iq}
                className="shrink-0 px-4 py-2 rounded-xl bg-primary hover:bg-primary-600 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
              >
                {iq?.pendingReview ? '修改并重新提交' : '编辑机构资料'}
              </button>
            ) : null}
          </div>
        </div>

        <div className="w-full px-5 py-2">
          {!ready ? (
            <p className="text-sm text-slate-500 py-8 text-center">正在加载机构档案…</p>
          ) : qualificationSnapshotHasContent(snap) ? (
            <>
              <QualificationSnapshotFields snap={snap} highlightChangedKeys={fieldsUnderReview} />
              <dl className="w-full">
                <FieldRow label="最近通过审核时间">{fmtTime(iq.lastApprovedAt)}</FieldRow>
              </dl>
            </>
          ) : (
            <p className="text-sm text-slate-500 py-6">
              {readOnly
                ? '暂无机构档案。请联系机构总管理员在「机构总管理 → 机构信息」中维护并提交审核。'
                : '暂无机构档案，请点击「编辑机构资料」填写。'}
            </p>
          )}
        </div>

        {ready && iq?.pendingReview?.snapshot ? (
          <div className="px-5 py-4 border-t border-sky-200 bg-sky-50/50">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <p className="text-sm font-semibold text-sky-900">审核中资料</p>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full border border-sky-300 bg-white text-sky-800">
                待总部审核
              </span>
            </div>
            <p className="text-xs text-sky-800/90 mt-1">提交时间：{fmtTime(iq.pendingReview.submittedAt)}</p>
            <p className="text-xs text-sky-900/80 mt-2 leading-relaxed">
              以下为本次变更内容，审核通过前对外仍以「当前生效资质」为准；总部通过后生效资质将自动更新，本区资料随即消失。
            </p>
            {fieldsUnderReview.size > 0 ? (
              <div className="mt-3 rounded-xl border border-sky-200/80 bg-white/90 px-1">
                <QualificationSnapshotFields
                  snap={iq.pendingReview.snapshot}
                  filterToChangedKeys={fieldsUnderReview}
                  markAllUnderReview
                />
              </div>
            ) : (
              <p className="mt-3 text-xs text-slate-600 rounded-lg border border-slate-200 bg-white px-3 py-2.5">
                本次提交与当前生效资质字段一致，暂无单独变更项展示；请等待总部审核结论。
              </p>
            )}
          </div>
        ) : null}
      </section>

      {showDemoAudit && !productionPresentation ? (
        <details className="w-full rounded-xl border border-dashed border-slate-300 bg-slate-50/60 px-4 py-3 text-sm text-slate-600">
          <summary className="cursor-pointer font-medium text-slate-700 select-none">演示 · 模拟总部审核</summary>
          {!ready ? <p className="mt-2 text-xs text-slate-500">请先完成工作台数据加载后再试。</p> : null}
          <p className="mt-2 text-xs leading-relaxed">
            本地演示无真实总部接口。提交资质后，可用下方按钮模拟「通过 / 驳回」以查看状态与文案变化。
          </p>
          <div className="mt-3 flex w-full flex-wrap gap-2">
            <button
              type="button"
              onClick={runDemoApprove}
              disabled={!ready}
              className="min-w-0 flex-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold sm:flex-none"
            >
              模拟审核通过
            </button>
          </div>
          <div className="mt-3 flex w-full flex-col gap-2 sm:flex-row sm:items-end">
            <label className="flex-1 text-xs block">
              <span className="text-slate-500">驳回原因</span>
              <input
                value={demoRejectReason}
                onChange={(e) => setDemoRejectReason(e.target.value)}
                disabled={!ready}
                className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs disabled:opacity-50"
              />
            </label>
            <button
              type="button"
              onClick={runDemoReject}
              disabled={!ready}
              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-semibold shrink-0"
            >
              模拟驳回
            </button>
          </div>
        </details>
      ) : null}

      {modalOpen && iq ? (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={() => setModalOpen(false)} role="presentation" />
          <div
            className="relative flex w-full max-w-lg max-h-[min(90vh,100dvh-2rem)] flex-col rounded-2xl bg-white shadow-xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-base font-semibold text-slate-900">{modalTitle}</h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-9 h-9 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 text-xl leading-none"
                aria-label="关闭"
              >
                ×
              </button>
            </div>
            <form noValidate onSubmit={handleSubmitForm} className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 overflow-y-auto p-5 space-y-4">
              {submitErr ? (
                <p ref={submitErrRef} className="text-sm text-rose-600 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2">
                  {submitErr}
                </p>
              ) : null}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">机构名称</label>
                <input
                  required
                  value={form.orgName}
                  onChange={(e) => setForm((f) => ({ ...f, orgName: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">法定代表人</label>
                <input
                  required
                  value={form.legalRepresentative}
                  onChange={(e) => setForm((f) => ({ ...f, legalRepresentative: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">机构地址</label>
                <textarea
                  required
                  rows={2}
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 resize-y min-h-[4rem]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">联系人电话</label>
                <input
                  required
                  type="tel"
                  value={form.contactPhone}
                  onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">负责人信息</h4>
                  <p className="text-xs text-slate-500 mt-1">以下为总部审核必录项。</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">负责人姓名 <span className="text-rose-500">*</span></label>
                    <input
                      required
                      value={form.principalName}
                      onChange={(e) => setForm((f) => ({ ...f, principalName: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">负责人电话 <span className="text-rose-500">*</span></label>
                    <input
                      required
                      type="tel"
                      value={form.principalPhone}
                      onChange={(e) => setForm((f) => ({ ...f, principalPhone: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">负责人身份证号 <span className="text-rose-500">*</span></label>
                  <input
                    required
                    value={form.principalIdNumber}
                    onChange={(e) => setForm((f) => ({ ...f, principalIdNumber: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">营业执照注册号 / 统一社会信用代码</label>
                <input
                  required
                  value={form.businessLicenseNumber}
                  onChange={(e) => setForm((f) => ({ ...f, businessLicenseNumber: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">营业执照电子版 <span className="text-rose-500">*</span></label>
                <p className="text-xs text-slate-500 mb-2">
                  {productionPresentation
                    ? '支持 PDF 或 JPG / PNG / WebP / GIF，单文件不超过 4MB。'
                    : '支持 PDF 或 JPG / PNG / WebP / GIF，单文件不超过 4MB（本地演示存入浏览器，正式环境将上传至总部服务器）。'}
                </p>
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
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">场地照片</h4>
                  <p className="text-xs text-slate-500 mt-1">门头照片和教室照片均为必录项。</p>
                </div>
                <ReviewFileInput field="venueFrontPhotoAttachment" form={form} setForm={setForm} required />
                <ReviewFileInput field="venueClassroomPhotoAttachment" form={form} setForm={setForm} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">营业执照复印件说明（选填）</label>
                <textarea
                  rows={2}
                  value={form.businessLicenseCopy}
                  onChange={(e) => setForm((f) => ({ ...f, businessLicenseCopy: e.target.value }))}
                  placeholder="可补充纸质件存档编号等；若已上传电子版，可不填。"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 resize-y min-h-[4rem]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">经营范围</label>
                <textarea
                  required
                  rows={3}
                  value={form.businessScope}
                  onChange={(e) => setForm((f) => ({ ...f, businessScope: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 resize-y min-h-[5rem]"
                />
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">经营与生源情况</h4>
                  <p className="text-xs text-slate-500 mt-1">用于判断加盟适配度，均为必录项。</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">是否属于 AI / 科技赛道 <span className="text-rose-500">*</span></label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      ['yes', '是'],
                      ['no', '否'],
                    ].map(([value, label]) => (
                      <label
                        key={value}
                        className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm cursor-pointer ${
                          form.isAiTechTrack === value
                            ? 'border-primary bg-primary/5 text-primary-700'
                            : 'border-slate-200 bg-white text-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="isAiTechTrack"
                          value={value}
                          checked={form.isAiTechTrack === value}
                          onChange={(e) => setForm((f) => ({ ...f, isAiTechTrack: e.target.value }))}
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">已开办项目 <span className="text-rose-500">*</span></label>
                  <textarea
                    required
                    rows={2}
                    value={form.existingProjects}
                    onChange={(e) => setForm((f) => ({ ...f, existingProjects: e.target.value }))}
                    placeholder="例如：少儿编程、机器人、科学实验、AI体验营"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 resize-y min-h-[4rem]"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">现有生源数量 <span className="text-rose-500">*</span></label>
                    <input
                      required
                      value={form.studentCount}
                      onChange={(e) => setForm((f) => ({ ...f, studentCount: e.target.value }))}
                      placeholder="例如：80 人"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">现有生源年龄段 <span className="text-rose-500">*</span></label>
                    <input
                      required
                      value={form.studentAgeRange}
                      onChange={(e) => setForm((f) => ({ ...f, studentAgeRange: e.target.value }))}
                      placeholder="例如：6-14 岁"
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">是否设立加盟专用教室 <span className="text-rose-500">*</span></label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      ['yes', '是'],
                      ['no', '否'],
                    ].map(([value, label]) => (
                      <label
                        key={value}
                        className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm cursor-pointer ${
                          form.hasDedicatedClassroom === value
                            ? 'border-primary bg-primary/5 text-primary-700'
                            : 'border-slate-200 bg-white text-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="hasDedicatedClassroom"
                          value={value}
                          checked={form.hasDedicatedClassroom === value}
                          onChange={(e) => setForm((f) => ({ ...f, hasDedicatedClassroom: e.target.value }))}
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 space-y-3">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">办学许可证（非必录）</h4>
                  <p className="text-xs text-slate-500 mt-1">可上传留存，不作为强制审核项。</p>
                </div>
                <ReviewFileInput field="schoolPermitAttachment" form={form} setForm={setForm} />
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                提交后总部将尽快审核。若您此前已通过加盟审核，本次为资质变更复审，复审期间不影响售课与开班。
              </p>
              </div>
              <div className="shrink-0 flex flex-wrap justify-end gap-2 border-t border-slate-100 bg-white px-5 py-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-600 text-white text-sm font-semibold"
                >
                  确定提交
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
