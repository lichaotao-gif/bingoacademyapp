import {
  AttachmentPreview,
  FieldRow,
  downloadLicenseAttachment,
  guessDownloadName,
  maskPhone,
  qualificationFieldsUnderReview,
  yesNoLabel,
} from './institutionQualificationShared'

function shouldShowField(filterToChangedKeys, keys) {
  if (!filterToChangedKeys?.size) return true
  return qualificationFieldsUnderReview(filterToChangedKeys, keys)
}

/**
 * @param filterToChangedKeys 仅展示这些变更字段（审核中资料区）
 * @param highlightChangedKeys 在生效资质区为变更字段打「审核中」角标
 * @param markAllUnderReview 审核中资料区：每条均标「审核中」
 */
export function QualificationSnapshotFields({
  snap,
  filterToChangedKeys = null,
  highlightChangedKeys = null,
  markAllUnderReview = false,
}) {
  if (!snap) return null

  const tag = (keys) =>
    markAllUnderReview || qualificationFieldsUnderReview(highlightChangedKeys, keys)

  return (
    <dl className="w-full">
      {shouldShowField(filterToChangedKeys, ['orgName']) ? (
        <FieldRow label="机构名称" underReview={tag(['orgName'])}>
          {snap.orgName || '—'}
        </FieldRow>
      ) : null}
      {shouldShowField(filterToChangedKeys, ['legalRepresentative']) ? (
        <FieldRow label="法定代表人" underReview={tag(['legalRepresentative'])}>
          {snap.legalRepresentative || '—'}
        </FieldRow>
      ) : null}
      {shouldShowField(filterToChangedKeys, ['address']) ? (
        <FieldRow label="机构地址" underReview={tag(['address'])}>
          {snap.address || '—'}
        </FieldRow>
      ) : null}
      {shouldShowField(filterToChangedKeys, ['contactPhone']) ? (
        <FieldRow label="联系人电话" underReview={tag(['contactPhone'])}>
          {snap.contactPhone ? maskPhone(snap.contactPhone) : '—'}
        </FieldRow>
      ) : null}
      {shouldShowField(filterToChangedKeys, ['businessLicenseNumber']) ? (
        <FieldRow label="营业执照号/统一社会信用代码" underReview={tag(['businessLicenseNumber'])}>
          {snap.businessLicenseNumber || '—'}
        </FieldRow>
      ) : null}
      {shouldShowField(filterToChangedKeys, ['businessLicenseAttachment', 'businessLicenseCopy']) ? (
        <FieldRow
          label="营业执照"
          underReview={tag(['businessLicenseAttachment', 'businessLicenseCopy'])}
        >
          <div className="space-y-2 font-normal">
            {snap.businessLicenseAttachment?.dataUrl ? (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadLicenseAttachment(snap.businessLicenseAttachment)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-sky-300 bg-white text-sky-800 text-xs font-semibold hover:bg-sky-50"
                >
                  下载电子版
                </button>
                <span className="text-xs text-slate-500 break-all">
                  {snap.businessLicenseAttachment.fileName ||
                    guessDownloadName(snap.businessLicenseAttachment.dataUrl)}
                </span>
              </div>
            ) : (
              <p className="text-xs text-slate-500">—</p>
            )}
            {snap.businessLicenseCopy ? (
              <p className="text-slate-700 text-sm leading-relaxed">{snap.businessLicenseCopy}</p>
            ) : null}
          </div>
        </FieldRow>
      ) : null}
      {shouldShowField(filterToChangedKeys, ['businessScope']) ? (
        <FieldRow label="经营范围" underReview={tag(['businessScope'])}>
          {snap.businessScope || '—'}
        </FieldRow>
      ) : null}
      {shouldShowField(filterToChangedKeys, ['principalName']) ? (
        <FieldRow label="负责人姓名" underReview={tag(['principalName'])}>
          {snap.principalName || '—'}
        </FieldRow>
      ) : null}
      {shouldShowField(filterToChangedKeys, ['principalPhone']) ? (
        <FieldRow label="负责人电话" underReview={tag(['principalPhone'])}>
          {snap.principalPhone ? maskPhone(snap.principalPhone) : '—'}
        </FieldRow>
      ) : null}
      {shouldShowField(filterToChangedKeys, ['principalIdNumber']) ? (
        <FieldRow label="负责人身份证" underReview={tag(['principalIdNumber'])}>
          {snap.principalIdNumber || '—'}
        </FieldRow>
      ) : null}
      {shouldShowField(filterToChangedKeys, ['venueFrontPhotoAttachment']) ? (
        <FieldRow label="场地门头照片" underReview={tag(['venueFrontPhotoAttachment'])}>
          <AttachmentPreview attachment={snap.venueFrontPhotoAttachment} label="门头照片" imageOnly />
        </FieldRow>
      ) : null}
      {shouldShowField(filterToChangedKeys, ['venueClassroomPhotoAttachment']) ? (
        <FieldRow label="教室照片" underReview={tag(['venueClassroomPhotoAttachment'])}>
          <AttachmentPreview attachment={snap.venueClassroomPhotoAttachment} label="教室照片" imageOnly />
        </FieldRow>
      ) : null}
      {shouldShowField(filterToChangedKeys, ['isAiTechTrack']) ? (
        <FieldRow label="AI / 科技赛道" underReview={tag(['isAiTechTrack'])}>
          {yesNoLabel(snap.isAiTechTrack)}
        </FieldRow>
      ) : null}
      {shouldShowField(filterToChangedKeys, ['existingProjects']) ? (
        <FieldRow label="已开办项目" underReview={tag(['existingProjects'])}>
          {snap.existingProjects || '—'}
        </FieldRow>
      ) : null}
      {shouldShowField(filterToChangedKeys, ['studentCount', 'studentAgeRange']) ? (
        <FieldRow label="现有生源" underReview={tag(['studentCount', 'studentAgeRange'])}>
          {snap.studentCount || '—'}
          {snap.studentAgeRange ? ` · ${snap.studentAgeRange}` : ''}
        </FieldRow>
      ) : null}
      {shouldShowField(filterToChangedKeys, ['hasDedicatedClassroom']) ? (
        <FieldRow label="加盟专用教室" underReview={tag(['hasDedicatedClassroom'])}>
          {yesNoLabel(snap.hasDedicatedClassroom)}
        </FieldRow>
      ) : null}
      {shouldShowField(filterToChangedKeys, ['schoolPermitAttachment']) ? (
        <FieldRow label="办学许可证" underReview={tag(['schoolPermitAttachment'])}>
          <AttachmentPreview attachment={snap.schoolPermitAttachment} label="办学许可证" />
          <p className="mt-1 text-xs text-slate-500 font-normal">非必录项，仅作资料留存，不作为强制审核项。</p>
        </FieldRow>
      ) : null}
    </dl>
  )
}
