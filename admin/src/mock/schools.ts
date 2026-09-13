/**
 * 学校管理数据桥接层。
 * 数据源与学校端后台同源（src/utils/schoolAdminStorage.js + localStorage），
 * 后端就绪后由 @/api/school.ts 替换本模块。
 */
// @ts-expect-error 主站 JS：学校端后台与官网后台同源
import * as store from '../../../src/utils/schoolAdminStorage.js'

export const SCHOOL_STATUS: { ACTIVE: string; DISABLED: string } = store.SCHOOL_STATUS
export const SCHOOL_ROLE: { OWNER: string; TEACHER: string } = store.SCHOOL_ROLE
export const ACCOUNT_STATUS: { ACTIVE: string; DISABLED: string } = store.ACCOUNT_STATUS
export const CERT_REQUEST_STATUS: { PENDING: string; APPROVED: string; REJECTED: string } =
  store.CERT_REQUEST_STATUS
export const CERT_SOURCE: { AUTO: string; MANUAL: string } = store.CERT_SOURCE
export const SCHOOL_LOGIN_PATH: string = store.SCHOOL_LOGIN_PATH

export interface CourseCatalogItem {
  id: string
  name: string
  totalLessons: number
}

export const SCHOOL_COURSE_CATALOG: CourseCatalogItem[] = store.SCHOOL_COURSE_CATALOG

export interface Result {
  ok: boolean
  msg?: string
}

export interface SchoolRow {
  id: string
  name: string
  province: string
  city: string
  district: string
  address: string
  contactName: string
  contactPhone: string
  remark: string
  status: string
  ownerAccountId: string
  createdAt: string
  region: string
  ownerName: string
  ownerPhone: string
  classCount: number
  studentCount: number
  teacherCount: number
  grantedCourseCount: number
}

export interface SchoolAccountRow {
  id: string
  schoolId: string
  name: string
  phone: string
  role: string
  status: string
  createdAt: string
  classCount: number
}

export interface SchoolClassRow {
  id: string
  name: string
  code: string
  courseId: string
  courseName: string
  teacherAccountId: string
  teacherName: string
  status: string
  studentCount: number
  startDate: string
  endDate: string
  disabled?: boolean
}

export interface SchoolStudentRow {
  id: string
  name: string
  phone: string
  enrollStatus: string
  enrollSource: string
  classNames: string[]
  certificateCount: number
  avgProgress: number
  avgRealProgress: number
  lastStudyAt: string
}

export interface CertRequestStudent {
  studentId: string
  studentName: string
  studentPhone: string
  realProgress: number
  lastStudyAt: string
}

export interface CertRequestRow {
  id: string
  schoolId: string
  schoolName: string
  classId: string
  className: string
  courseId: string
  courseName: string
  status: string
  applicantName: string
  applicantRole: string
  studentCount: number
  students: CertRequestStudent[]
  submittedAt: string
  reviewedAt: string | null
  reviewer: string
  rejectReason: string
}

export interface SchoolLogRow {
  id: string
  schoolId: string
  action: string
  operator: string
  detail: string
  at: string
}

export interface CreateSchoolInput {
  name: string
  province: string
  city: string
  district: string
  address: string
  contactName: string
  contactPhone: string
  remark?: string
  ownerName?: string
  ownerPhone: string
  ownerPassword: string
}

export type UpdateSchoolInput = Omit<CreateSchoolInput, 'ownerPhone' | 'ownerPassword' | 'ownerName'>

/** 官网后台以「学校总管理员」视角读取该校班级/学生（只读） */
function ownerSession(school: SchoolRow) {
  return { schoolId: school.id, accountId: school.ownerAccountId, role: SCHOOL_ROLE.OWNER, name: '官网管理员' }
}

export function listSchools(filter: { keyword?: string; region?: string; status?: string } = {}): SchoolRow[] {
  return store.listSchools(filter)
}

export function getSchoolDetail(schoolId: string): SchoolRow | null {
  return store.getSchoolDetail(schoolId)
}

export function createSchool(input: CreateSchoolInput): Result & { schoolId?: string; loginPath?: string } {
  return store.createSchool(input)
}

export function updateSchool(schoolId: string, input: UpdateSchoolInput): Result {
  return store.updateSchool(schoolId, input)
}

export function setSchoolStatus(schoolId: string, status: string): Result {
  return store.setSchoolStatus(schoolId, status)
}

export function resetOwnerPassword(schoolId: string, newPassword: string): Result {
  return store.resetOwnerPassword(schoolId, newPassword)
}

export function listGrantedCourseIds(schoolId: string): string[] {
  return store.listGrantedCourseIds(schoolId)
}

export function checkCourseRevokable(schoolId: string, courseId: string): Result {
  return store.checkCourseRevokable(schoolId, courseId)
}

export function setCourseGrants(schoolId: string, courseIds: string[]): Result {
  return store.setCourseGrants(schoolId, courseIds)
}

export function listSchoolAccounts(schoolId: string): SchoolAccountRow[] {
  return store.listSchoolAccounts(schoolId)
}

export function listSchoolClasses(school: SchoolRow): SchoolClassRow[] {
  return store.listClasses(ownerSession(school))
}

export function listSchoolStudents(school: SchoolRow): SchoolStudentRow[] {
  return store.listStudents(ownerSession(school))
}

export function listSchoolLogs(schoolId: string): SchoolLogRow[] {
  return store.listLogs({ schoolId })
}

export function listCertRequests(filter: { status?: string; schoolId?: string } = {}): CertRequestRow[] {
  return store.listCertRequests(filter)
}

export function approveCertRequest(requestId: string, reviewer = '官网管理员'): Result & { issued?: number } {
  return store.approveCertRequest(requestId, reviewer)
}

export function rejectCertRequest(requestId: string, reason: string, reviewer = '官网管理员'): Result {
  return store.rejectCertRequest(requestId, reason, reviewer)
}

export interface SiteStudentWithSchoolRow {
  id: string
  name: string
  phone: string
  status: string
  createdAt: string
  schoolId: string | null
  schoolName: string
  enrollStatus: string | null
  source: string
  certificateCount: number
}

export function listSiteStudentsWithSchool(filter: { schoolId?: string; source?: string; enrollStatus?: string; keyword?: string } = {}): SiteStudentWithSchoolRow[] {
  return store.listSiteStudentsWithSchool(filter)
}

export interface StudentEnrollmentHistoryRow {
  id: string
  schoolId: string
  schoolName: string
  status: string
  source: string
  joinedAt: string
  removedAt: string | null
  transferredFrom: string | null
  classes: { id: string; name: string; courseId: string; courseName: string }[]
}

export function transferStudentSchool(studentId: string, targetSchoolId: string): Result {
  return store.transferStudentSchool(studentId, targetSchoolId)
}

export function getStudentSchoolHistory(studentId: string): StudentEnrollmentHistoryRow[] {
  return store.getStudentSchoolHistory(studentId)
}

export function fmtSchoolTime(iso: string | null | undefined): string {
  return store.fmtDateTime(iso)
}
