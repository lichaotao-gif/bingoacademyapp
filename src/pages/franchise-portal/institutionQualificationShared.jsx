/** 机构资质表单与展示：加盟商设置页与机构总设置页共用 */

export function fmtTime(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('zh-CN')
  } catch {
    return '—'
  }
}

export function maskPhone(phone) {
  const p = String(phone || '').replace(/\D/g, '')
  if (p.length >= 11) return `${p.slice(0, 3)}****${p.slice(-4)}`
  return phone || '—'
}

export const MAX_LICENSE_FILE_BYTES = 4 * 1024 * 1024
export const LICENSE_INPUT_ACCEPT =
  'application/pdf,image/jpeg,image/jpg,image/png,image/webp,image/gif,.pdf,.png,.jpg,.jpeg,.webp,.gif'

export function guessDownloadName(dataUrl) {
  const m = /^data:([^;]+);/i.exec(dataUrl || '')
  const t = (m?.[1] || '').toLowerCase()
  if (t.includes('pdf')) return '营业执照.pdf'
  if (t.includes('png')) return '营业执照.png'
  if (t.includes('webp')) return '营业执照.webp'
  if (t.includes('gif')) return '营业执照.gif'
  return '营业执照.jpg'
}

export function downloadReviewAttachment(att, fallbackName = '审核附件') {
  if (!att?.dataUrl) return
  const name =
    String(att.fileName || '')
      .replace(/[/\\?%*:|"<>]/g, '_')
      .slice(0, 180) ||
    fallbackName ||
    guessDownloadName(att.dataUrl)
  const a = document.createElement('a')
  a.href = att.dataUrl
  a.download = name
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
}

export const downloadLicenseAttachment = (att) => downloadReviewAttachment(att, guessDownloadName(att?.dataUrl))

export function isImageDataUrl(dataUrl) {
  return /^data:image\//i.test(dataUrl || '')
}

/** 与待审快照对比时参与 diff 的字段（不含 lastApprovedAt 等元数据） */
export const QUALIFICATION_SNAPSHOT_COMPARE_KEYS = [
  'orgName',
  'legalRepresentative',
  'address',
  'contactPhone',
  'businessLicenseNumber',
  'businessLicenseCopy',
  'businessScope',
  'businessLicenseAttachment',
  'principalName',
  'principalPhone',
  'principalIdNumber',
  'venueFrontPhotoAttachment',
  'venueClassroomPhotoAttachment',
  'isAiTechTrack',
  'existingProjects',
  'studentCount',
  'studentAgeRange',
  'hasDedicatedClassroom',
  'schoolPermitAttachment',
]

function normQualificationScalar(value) {
  return String(value ?? '').trim()
}

function qualificationAttachmentsEqual(a, b) {
  const duA = a?.dataUrl ? String(a.dataUrl) : ''
  const duB = b?.dataUrl ? String(b.dataUrl) : ''
  if (!duA && !duB) return true
  return duA === duB
}

/** 返回相对生效快照有变更、且仍在待审中的字段 key 集合 */
export function getChangedQualificationFieldKeys(approved, pending) {
  if (!pending || typeof pending !== 'object') return new Set()
  const base = approved && typeof approved === 'object' ? approved : {}
  const changed = new Set()
  for (const key of QUALIFICATION_SNAPSHOT_COMPARE_KEYS) {
    if (key.endsWith('Attachment')) {
      if (!qualificationAttachmentsEqual(base[key], pending[key])) changed.add(key)
    } else if (normQualificationScalar(base[key]) !== normQualificationScalar(pending[key])) {
      changed.add(key)
    }
  }
  return changed
}

export function qualificationFieldsUnderReview(changedKeys, keys) {
  if (!changedKeys?.size || !keys?.length) return false
  return keys.some((k) => changedKeys.has(k))
}

export function PendingReviewTag() {
  return (
    <span className="shrink-0 inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full border border-sky-200 bg-sky-50 text-sky-800">
      审核中
    </span>
  )
}

export function ReviewBadge({ status }) {
  const map = {
    approved: { cls: 'bg-emerald-100 text-emerald-800 border-emerald-200', text: '审核已通过' },
    pending_initial: { cls: 'bg-amber-100 text-amber-900 border-amber-200', text: '资质待初审' },
    pending_update: { cls: 'bg-sky-100 text-sky-900 border-sky-200', text: '资质变更审核中' },
    rejected: { cls: 'bg-rose-100 text-rose-800 border-rose-200', text: '上次提交未通过' },
  }
  const m = map[status] || map.approved
  return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${m.cls}`}>{m.text}</span>
}

export function FieldRow({ label, children, className = '', underReview = false }) {
  return (
    <div
      className={`grid w-full grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 items-start sm:gap-x-4 lg:gap-x-6 py-3 border-b border-slate-100 last:border-0 ${className}`}
    >
      <dt className="text-slate-500 text-sm shrink-0 max-w-[46%] sm:max-w-[12rem] lg:max-w-[14rem]">{label}</dt>
      <dd className="text-slate-900 text-sm font-medium break-words min-w-0 w-full">
        <div className="flex flex-wrap items-start gap-2 min-w-0">
          <div className="min-w-0 flex-1">{children}</div>
          {underReview ? <PendingReviewTag /> : null}
        </div>
      </dd>
    </div>
  )
}

/** 待审快照缺附件时（如超大 base64 被清理），编辑表单回退到当前生效快照中的附件 */
export function pickQualificationAttachmentForForm(pendingSnap, approvedSnap, key) {
  const p = pendingSnap?.[key]
  const a = approvedSnap?.[key]
  if (p?.dataUrl) {
    return { fileName: p.fileName, dataUrl: p.dataUrl }
  }
  if (a?.dataUrl) {
    return { fileName: a.fileName, dataUrl: a.dataUrl }
  }
  return null
}

export function buildQualificationFormFromSnapshots(pendingSnap, approvedSnap) {
  const base = pendingSnap || approvedSnap || emptyForm
  const pending = pendingSnap && typeof pendingSnap === 'object' ? pendingSnap : {}
  const approved = approvedSnap && typeof approvedSnap === 'object' ? approvedSnap : {}
  const yesNo = (v, fallback) => (v === 'yes' || v === 'no' ? v : fallback === 'yes' || fallback === 'no' ? fallback : '')

  return {
    orgName: base.orgName ?? '',
    legalRepresentative: base.legalRepresentative ?? '',
    address: base.address ?? '',
    contactPhone: base.contactPhone ?? '',
    businessLicenseNumber: base.businessLicenseNumber ?? '',
    businessLicenseCopy: base.businessLicenseCopy ?? '',
    businessScope: base.businessScope ?? '',
    businessLicenseAttachment: pickQualificationAttachmentForForm(pending, approved, 'businessLicenseAttachment'),
    principalName: base.principalName ?? '',
    principalPhone: base.principalPhone ?? '',
    principalIdNumber: base.principalIdNumber ?? '',
    venueFrontPhotoAttachment: pickQualificationAttachmentForForm(pending, approved, 'venueFrontPhotoAttachment'),
    venueClassroomPhotoAttachment: pickQualificationAttachmentForForm(pending, approved, 'venueClassroomPhotoAttachment'),
    isAiTechTrack: yesNo(base.isAiTechTrack, approved.isAiTechTrack),
    existingProjects: base.existingProjects ?? '',
    studentCount: base.studentCount ?? '',
    studentAgeRange: base.studentAgeRange ?? '',
    hasDedicatedClassroom: yesNo(base.hasDedicatedClassroom, approved.hasDedicatedClassroom),
    schoolPermitAttachment: pickQualificationAttachmentForForm(pending, approved, 'schoolPermitAttachment'),
  }
}

const QUALIFICATION_FORM_REQUIRED_LABELS = {
  orgName: '机构名称',
  legalRepresentative: '法定代表人',
  address: '机构地址',
  contactPhone: '联系人电话',
  businessLicenseNumber: '营业执照注册号/统一社会信用代码',
  businessScope: '经营范围',
  principalName: '负责人姓名',
  principalPhone: '负责人电话',
  principalIdNumber: '负责人身份证号',
  existingProjects: '已开办项目',
  studentCount: '现有生源数量',
  studentAgeRange: '现有生源年龄段',
}

/** 提交前校验（替代浏览器默认校验，避免静默拦截） */
export function validateQualificationFormForSubmit(form) {
  for (const [key, label] of Object.entries(QUALIFICATION_FORM_REQUIRED_LABELS)) {
    if (!String(form[key] ?? '').trim()) {
      return `请填写「${label}」`
    }
  }
  if (form.isAiTechTrack !== 'yes' && form.isAiTechTrack !== 'no') {
    return '请选择是否属于 AI / 科技赛道'
  }
  if (form.hasDedicatedClassroom !== 'yes' && form.hasDedicatedClassroom !== 'no') {
    return '请选择是否设立加盟专用教室'
  }
  if (!form.businessLicenseAttachment?.dataUrl) {
    return '请上传营业执照电子版（PDF 或图片）'
  }
  if (!form.venueFrontPhotoAttachment?.dataUrl) {
    return '请上传场地门头照片'
  }
  if (!form.venueClassroomPhotoAttachment?.dataUrl) {
    return '请上传教室照片'
  }
  return null
}

export const emptyForm = {
  orgName: '',
  legalRepresentative: '',
  address: '',
  contactPhone: '',
  businessLicenseNumber: '',
  businessLicenseCopy: '',
  businessScope: '',
  businessLicenseAttachment: null,
  principalName: '',
  principalPhone: '',
  principalIdNumber: '',
  venueFrontPhotoAttachment: null,
  venueClassroomPhotoAttachment: null,
  isAiTechTrack: '',
  existingProjects: '',
  studentCount: '',
  studentAgeRange: '',
  hasDedicatedClassroom: '',
  schoolPermitAttachment: null,
}

export const REVIEW_ATTACHMENT_FIELDS = {
  businessLicenseAttachment: { label: '营业执照', accept: LICENSE_INPUT_ACCEPT, imageOnly: false },
  venueFrontPhotoAttachment: {
    label: '门头照片',
    accept: 'image/jpeg,image/jpg,image/png,image/webp,image/gif,.png,.jpg,.jpeg,.webp,.gif',
    imageOnly: true,
  },
  venueClassroomPhotoAttachment: {
    label: '教室照片',
    accept: 'image/jpeg,image/jpg,image/png,image/webp,image/gif,.png,.jpg,.jpeg,.webp,.gif',
    imageOnly: true,
  },
  schoolPermitAttachment: { label: '办学许可证', accept: LICENSE_INPUT_ACCEPT, imageOnly: false },
}

export function yesNoLabel(value) {
  if (value === 'yes') return '是'
  if (value === 'no') return '否'
  return '—'
}

export function AttachmentPreview({ attachment, label, imageOnly = false }) {
  if (!attachment?.dataUrl) return <p className="text-xs text-slate-500">未上传</p>
  return (
    <div className="space-y-2 font-normal">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => downloadReviewAttachment(attachment, `${label}.pdf`)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/40 bg-primary/5 text-primary text-xs font-semibold hover:bg-primary/10"
        >
          下载附件
        </button>
        <span className="text-xs text-slate-500 break-all">{attachment.fileName || label}</span>
      </div>
      {isImageDataUrl(attachment.dataUrl) ? (
        <img
          src={attachment.dataUrl}
          alt={`${label}预览`}
          className="max-h-28 rounded-lg border border-slate-200 object-contain bg-white"
        />
      ) : imageOnly ? (
        <p className="text-xs text-rose-600">请上传图片格式文件。</p>
      ) : null}
    </div>
  )
}

export function ReviewFileInput({ field, form, setForm, required = false }) {
  const config = REVIEW_ATTACHMENT_FIELDS[field]
  const attachment = form[field]
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {config.label}
        {required ? <span className="text-rose-500"> *</span> : null}
      </label>
      <p className="text-xs text-slate-500 mb-2">
        {config.imageOnly ? '支持 JPG / PNG / WebP / GIF 图片' : '支持 PDF 或 JPG / PNG / WebP / GIF'}，单文件不超过 4MB。
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <label className="inline-flex items-center justify-center px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-800 hover:bg-slate-50 cursor-pointer shrink-0">
          选择文件
          <input
            type="file"
            accept={config.accept}
            className="sr-only"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              e.target.value = ''
              if (!file) return
              if (file.size > MAX_LICENSE_FILE_BYTES) {
                window.alert('文件过大，请上传不超过 4MB 的文件。')
                return
              }
              const okImageMime = /^image\/(jpeg|jpg|png|gif|webp)$/i.test(file.type)
              const okImageExt = /\.(jpe?g|png|gif|webp)$/i.test(file.name)
              const okPdfMime = /^application\/pdf$/i.test(file.type)
              const okPdfExt = /\.pdf$/i.test(file.name)
              const ok = config.imageOnly ? okImageMime || okImageExt : okImageMime || okImageExt || okPdfMime || okPdfExt
              if (!ok) {
                window.alert(config.imageOnly ? '仅支持图片格式。' : '仅支持 PDF 或图片格式。')
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
                setForm((f) => ({ ...f, [field]: { fileName: file.name, dataUrl } }))
              } catch {
                window.alert('读取文件失败，请重试。')
              }
            }}
          />
        </label>
        {attachment?.dataUrl ? (
          <>
            <button
              type="button"
              onClick={() => downloadReviewAttachment(attachment, config.label)}
              className="inline-flex items-center px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              下载当前文件
            </button>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, [field]: null }))}
              className="inline-flex items-center px-3 py-2 rounded-xl text-sm font-medium text-rose-700 hover:bg-rose-50"
            >
              移除文件
            </button>
          </>
        ) : null}
      </div>
      {attachment?.dataUrl ? (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3 space-y-2">
          <p className="text-xs text-slate-600 break-all font-medium">{attachment.fileName || '已选文件'}</p>
          {isImageDataUrl(attachment.dataUrl) ? (
            <img
              src={attachment.dataUrl}
              alt={`${config.label}预览`}
              className="max-h-40 rounded-lg border border-slate-200 object-contain bg-white"
            />
          ) : (
            <p className="text-xs text-slate-500">已选择 PDF，保存后可在详情中下载查看。</p>
          )}
        </div>
      ) : null}
    </div>
  )
}
