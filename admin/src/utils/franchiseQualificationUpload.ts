import { message, Upload } from 'antd'
import type { UploadFile } from 'antd/es/upload/interface'
import type { QualificationSnapshot, ReviewAttachment } from '@/mock/franchisePartners'

export const MAX_REVIEW_FILE_SIZE = 4 * 1024 * 1024

export function normUpload(e: { fileList?: UploadFile[] } | UploadFile[] | undefined): UploadFile[] {
  if (Array.isArray(e)) return e.slice(-1)
  return (e?.fileList || []).slice(-1)
}

export function beforeReviewUpload(file: File) {
  if (file.size > MAX_REVIEW_FILE_SIZE) {
    message.error('单个文件不能超过 4MB')
    return Upload.LIST_IGNORE
  }
  return false
}

export async function fileListToAttachment(files: UploadFile[] | undefined): Promise<ReviewAttachment | null> {
  const file = files?.[0]
  if (!file) return null
  if (file.url && !file.originFileObj) {
    return {
      fileName: file.name || '审核附件',
      dataUrl: file.url,
    }
  }
  const raw = file.originFileObj
  if (!raw) return null
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('read'))
    reader.readAsDataURL(raw)
  })
  return { fileName: file.name || raw.name || '审核附件', dataUrl }
}

export function attachmentToUploadFile(att: ReviewAttachment | null | undefined, fallbackName: string): UploadFile[] {
  if (!att?.dataUrl) return []
  return [
    {
      uid: `existing-${fallbackName}`,
      name: att.fileName || fallbackName,
      status: 'done',
      url: att.dataUrl,
    },
  ]
}

export type QualificationFormValues = {
  orgName?: string
  legalRepresentative?: string
  address?: string
  contactPhone?: string
  businessLicenseNumber?: string
  businessLicenseCopy?: string
  businessScope?: string
  principalName?: string
  principalPhone?: string
  principalIdNumber?: string
  isAiTechTrack?: 'yes' | 'no' | ''
  existingProjects?: string
  studentCount?: string
  studentAgeRange?: string
  hasDedicatedClassroom?: 'yes' | 'no' | ''
  businessLicenseFiles?: UploadFile[]
  venueFrontPhotoFiles?: UploadFile[]
  venueClassroomPhotoFiles?: UploadFile[]
  schoolPermitFiles?: UploadFile[]
}

export function qualificationSnapshotToFormValues(snap: QualificationSnapshot): QualificationFormValues {
  return {
    orgName: snap.orgName ?? '',
    legalRepresentative: snap.legalRepresentative ?? '',
    address: snap.address ?? '',
    contactPhone: snap.contactPhone ?? '',
    businessLicenseNumber: snap.businessLicenseNumber ?? '',
    businessLicenseCopy: snap.businessLicenseCopy ?? '',
    businessScope: snap.businessScope ?? '',
    principalName: snap.principalName ?? '',
    principalPhone: snap.principalPhone ?? '',
    principalIdNumber: snap.principalIdNumber ?? '',
    isAiTechTrack: snap.isAiTechTrack === 'yes' || snap.isAiTechTrack === 'no' ? snap.isAiTechTrack : 'yes',
    existingProjects: snap.existingProjects ?? '',
    studentCount: snap.studentCount ?? '',
    studentAgeRange: snap.studentAgeRange ?? '',
    hasDedicatedClassroom:
      snap.hasDedicatedClassroom === 'yes' || snap.hasDedicatedClassroom === 'no' ? snap.hasDedicatedClassroom : 'yes',
    businessLicenseFiles: attachmentToUploadFile(snap.businessLicenseAttachment, '营业执照'),
    venueFrontPhotoFiles: attachmentToUploadFile(snap.venueFrontPhotoAttachment, '门头照片'),
    venueClassroomPhotoFiles: attachmentToUploadFile(snap.venueClassroomPhotoAttachment, '教室照片'),
    schoolPermitFiles: attachmentToUploadFile(snap.schoolPermitAttachment, '办学许可证'),
  }
}

export async function formValuesToQualificationSnapshot(v: QualificationFormValues): Promise<QualificationSnapshot> {
  const businessLicenseAttachment = await fileListToAttachment(v.businessLicenseFiles)
  const venueFrontPhotoAttachment = await fileListToAttachment(v.venueFrontPhotoFiles)
  const venueClassroomPhotoAttachment = await fileListToAttachment(v.venueClassroomPhotoFiles)
  const schoolPermitAttachment = await fileListToAttachment(v.schoolPermitFiles)
  return {
    orgName: String(v.orgName ?? '').trim(),
    legalRepresentative: String(v.legalRepresentative ?? '').trim(),
    address: String(v.address ?? '').trim(),
    contactPhone: String(v.contactPhone ?? '').replace(/\s/g, '').trim(),
    businessLicenseNumber: String(v.businessLicenseNumber ?? '').trim(),
    businessLicenseCopy: String(v.businessLicenseCopy ?? '').trim(),
    businessScope: String(v.businessScope ?? '').trim(),
    principalName: String(v.principalName ?? '').trim(),
    principalPhone: String(v.principalPhone ?? '').replace(/\s/g, '').trim(),
    principalIdNumber: String(v.principalIdNumber ?? '').trim(),
    isAiTechTrack: v.isAiTechTrack === 'no' ? 'no' : 'yes',
    existingProjects: String(v.existingProjects ?? '').trim(),
    studentCount: String(v.studentCount ?? '').trim(),
    studentAgeRange: String(v.studentAgeRange ?? '').trim(),
    hasDedicatedClassroom: v.hasDedicatedClassroom === 'no' ? 'no' : 'yes',
    businessLicenseAttachment,
    venueFrontPhotoAttachment,
    venueClassroomPhotoAttachment,
    schoolPermitAttachment,
  }
}
