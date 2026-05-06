/** 总部「加盟商管理」演示数据（正式环境对接 API） */

export type AccountStatus = 'normal' | 'pending_qualification' | 'frozen'
export type QualificationReviewStatus = 'approved' | 'pending' | 'rejected' | 'pending_update' | 'incomplete'

export interface ReviewAttachment {
  fileName: string
  dataUrl: string
}

export interface QualificationSnapshot {
  orgName?: string
  legalRepresentative?: string
  address?: string
  contactPhone?: string
  businessLicenseNumber?: string
  businessLicenseCopy?: string
  businessScope?: string
  businessLicenseAttachment?: ReviewAttachment | null
  principalName?: string
  principalPhone?: string
  principalIdNumber?: string
  venueFrontPhotoAttachment?: ReviewAttachment | null
  venueClassroomPhotoAttachment?: ReviewAttachment | null
  isAiTechTrack?: 'yes' | 'no' | ''
  existingProjects?: string
  studentCount?: string
  studentAgeRange?: string
  hasDedicatedClassroom?: 'yes' | 'no' | ''
  schoolPermitAttachment?: ReviewAttachment | null
}

export interface QualificationBlock {
  reviewStatus: QualificationReviewStatus
  lastApprovedAt?: string
  rejectReason?: string | null
  approvedSnapshot: QualificationSnapshot
  pendingReview?: {
    submittedAt: string
    snapshot: QualificationSnapshot
  } | null
}

export const QUALIFICATION_FIELD_LABELS: Array<{ key: keyof QualificationSnapshot; label: string; type?: 'yesno' | 'attachment' }> = [
  { key: 'orgName', label: '机构名称' },
  { key: 'legalRepresentative', label: '法定代表人' },
  { key: 'address', label: '机构地址' },
  { key: 'contactPhone', label: '联系人电话' },
  { key: 'businessLicenseNumber', label: '营业执照注册号/统一社会信用代码' },
  { key: 'businessLicenseAttachment', label: '营业执照电子版', type: 'attachment' },
  { key: 'businessLicenseCopy', label: '营业执照复印件说明' },
  { key: 'businessScope', label: '经营范围' },
  { key: 'principalName', label: '负责人姓名' },
  { key: 'principalPhone', label: '负责人电话' },
  { key: 'principalIdNumber', label: '负责人身份证号' },
  { key: 'venueFrontPhotoAttachment', label: '场地门头照片', type: 'attachment' },
  { key: 'venueClassroomPhotoAttachment', label: '教室照片', type: 'attachment' },
  { key: 'isAiTechTrack', label: '是否属于 AI / 科技赛道', type: 'yesno' },
  { key: 'existingProjects', label: '已开办项目' },
  { key: 'studentCount', label: '现有生源数量' },
  { key: 'studentAgeRange', label: '现有生源年龄段' },
  { key: 'hasDedicatedClassroom', label: '是否设立加盟专用教室', type: 'yesno' },
  { key: 'schoolPermitAttachment', label: '办学许可证（非必录）', type: 'attachment' },
]

export interface LedgerRow {
  id: string
  type: string
  title: string
  amount: number
  balanceAfter: number
  createdAt: string
}

export interface ClassBrief {
  id: string
  name: string
  studentCount: number
  offlineDone: number
  offlineTotal: number
}

export interface FranchisePartnerDetail {
  partnerId: string
  refCode: string
  orgName: string
  contactPhone: string
  region: string
  accountStatus: AccountStatus
  balance: number
  frozen: number
  qualificationStatus: QualificationReviewStatus
  /** 总部对该加盟商的经营结论 / 风控备注（演示） */
  conclusion: string
  qualification: QualificationBlock
  ledger: LedgerRow[]
  classes: ClassBrief[]
  ordersMonthCount: number
  totalSales: number
  materialOrderCount: number
}

const INITIAL: FranchisePartnerDetail[] = [
  {
    partnerId: 'fp-sh-001',
    refCode: 'SH2024',
    orgName: '上海启智STEM培训中心',
    contactPhone: '13800138001',
    region: '华东 · 上海',
    accountStatus: 'normal',
    balance: 32560.0,
    frozen: 0,
    qualificationStatus: 'approved',
    conclusion: '履约正常：充课活跃，教具采购按期；建议维持现行折扣。',
    qualification: {
      reviewStatus: 'approved',
      lastApprovedAt: '2024-06-01T10:00:00.000Z',
      rejectReason: null,
      approvedSnapshot: {
        orgName: '上海启智STEM培训中心',
        legalRepresentative: '王小明',
        address: '上海市浦东新区张江高科技园区科苑路 88 号',
        contactPhone: '13800138001',
        businessLicenseNumber: '91310000MA1FL0XXXX',
        businessLicenseCopy: '后台存档：营业执照_上海启智STEM.pdf',
        businessScope: '科技类培训、教育信息咨询。',
        businessLicenseAttachment: null,
        principalName: '王小明',
        principalPhone: '13800138001',
        principalIdNumber: '310101********1234',
        venueFrontPhotoAttachment: null,
        venueClassroomPhotoAttachment: null,
        isAiTechTrack: 'yes',
        existingProjects: '少儿编程、机器人搭建、AI 通识体验课',
        studentCount: '120',
        studentAgeRange: '6-14 岁',
        hasDedicatedClassroom: 'yes',
        schoolPermitAttachment: null,
      },
      pendingReview: null,
    },
    ledger: [
      {
        id: 'l1',
        type: 'topup',
        title: '总部账户充值（演示）',
        amount: 50000,
        balanceAfter: 50000,
        createdAt: '2024-05-01T09:00:00.000Z',
      },
      {
        id: 'l2',
        type: 'recharge_course',
        title: '充课 · 张同学 · 《AI启蒙：走进智能世界》',
        amount: -239.2,
        balanceAfter: 49760.8,
        createdAt: '2024-06-28T14:20:00.000Z',
      },
      {
        id: 'l3',
        type: 'material_purchase',
        title: '教具采购 · Micro:bit AI 编程扩展套件',
        amount: -1490,
        balanceAfter: 48270.8,
        createdAt: '2024-06-20T11:00:00.000Z',
      },
    ],
    classes: [
      { id: 'cls-1', name: '周六上午 · 幼儿英语启蒙班', studentCount: 12, offlineDone: 2, offlineTotal: 6 },
      { id: 'cls-2', name: '暑期 · AI 竞赛冲刺班', studentCount: 8, offlineDone: 3, offlineTotal: 8 },
    ],
    ordersMonthCount: 24,
    totalSales: 186420.5,
    materialOrderCount: 3,
  },
  {
    partnerId: 'fp-gz-002',
    refCode: 'GZ2024',
    orgName: '广州湾岸创客学院',
    contactPhone: '13900139002',
    region: '华南 · 广州',
    accountStatus: 'pending_qualification',
    balance: 8000,
    frozen: 0,
    qualificationStatus: 'pending',
    conclusion: '待资质终审：首次入网，待核验营业执照与法人信息。',
    qualification: {
      reviewStatus: 'pending',
      approvedSnapshot: {},
      pendingReview: {
        submittedAt: '2026-04-28T08:30:00.000Z',
        snapshot: {
          orgName: '广州湾岸创客学院',
          legalRepresentative: '陈颖',
          address: '广州市天河区天河路 385 号太古汇写字楼',
          contactPhone: '13900139002',
          businessLicenseNumber: '91440101MA5CYXXXX',
          businessLicenseCopy: '待提交清晰扫描件',
          businessScope: '软件与信息技术培训、创客教育服务。',
          businessLicenseAttachment: null,
          principalName: '陈颖',
          principalPhone: '13900139002',
          principalIdNumber: '440106********2233',
          venueFrontPhotoAttachment: null,
          venueClassroomPhotoAttachment: null,
          isAiTechTrack: 'yes',
          existingProjects: '创客课程、机器人竞赛集训',
          studentCount: '68',
          studentAgeRange: '7-15 岁',
          hasDedicatedClassroom: 'no',
          schoolPermitAttachment: null,
        },
      },
    },
    ledger: [
      {
        id: 'lg1',
        type: 'topup',
        title: '入网保证金入账（演示）',
        amount: 8000,
        balanceAfter: 8000,
        createdAt: '2026-04-27T16:00:00.000Z',
      },
    ],
    classes: [],
    ordersMonthCount: 0,
    totalSales: 0,
    materialOrderCount: 0,
  },
  {
    partnerId: 'fp-bj-003',
    refCode: 'BJ2023',
    orgName: '北京海淀缤果合作校区',
    contactPhone: '13700137003',
    region: '华北 · 北京',
    accountStatus: 'frozen',
    balance: 1200.5,
    frozen: 500,
    qualificationStatus: 'pending_update',
    conclusion: '资质变更复审中：已临时限制大额充课；流水正常可追溯。',
    qualification: {
      reviewStatus: 'approved',
      lastApprovedAt: '2023-11-15T09:00:00.000Z',
      rejectReason: null,
      approvedSnapshot: {
        orgName: '北京海淀缤果合作校区',
        legalRepresentative: '刘洋',
        address: '北京市海淀区中关村大街 1 号',
        contactPhone: '13700137003',
        businessLicenseNumber: '91110108MA01XXXXXX',
        businessLicenseCopy: '后台存档：原营业执照扫描件',
        businessScope: '中小学生校外托管服务、教育咨询。',
        businessLicenseAttachment: null,
        principalName: '刘洋',
        principalPhone: '13700137003',
        principalIdNumber: '110108********7788',
        venueFrontPhotoAttachment: null,
        venueClassroomPhotoAttachment: null,
        isAiTechTrack: 'no',
        existingProjects: '课后托管、少儿编程体验课',
        studentCount: '95',
        studentAgeRange: '6-12 岁',
        hasDedicatedClassroom: 'yes',
        schoolPermitAttachment: null,
      },
      pendingReview: {
        submittedAt: '2026-04-25T11:20:00.000Z',
        snapshot: {
          orgName: '北京海淀缤果合作校区（增资变更）',
          legalRepresentative: '刘洋',
          address: '北京市海淀区中关村大街 10 号海龙大厦',
          contactPhone: '13700137003',
          businessLicenseNumber: '91110108MA01XXXXXX',
          businessLicenseCopy: '变更后营业执照待复核',
          businessScope: '科技培训、教育软件销售。',
          businessLicenseAttachment: null,
          principalName: '刘洋',
          principalPhone: '13700137003',
          principalIdNumber: '110108********7788',
          venueFrontPhotoAttachment: null,
          venueClassroomPhotoAttachment: null,
          isAiTechTrack: 'yes',
          existingProjects: '少儿编程、AI 通识、机器人搭建',
          studentCount: '118',
          studentAgeRange: '6-14 岁',
          hasDedicatedClassroom: 'yes',
          schoolPermitAttachment: null,
        },
      },
    },
    ledger: [
      {
        id: 'lb1',
        type: 'recharge_course',
        title: '充课 · 赵同学 · 《机器学习入门与实战》',
        amount: -558.4,
        balanceAfter: 1200.5,
        createdAt: '2026-04-10T10:00:00.000Z',
      },
    ],
    classes: [{ id: 'cls-bj1', name: '周三晚 · 少儿编程基础班', studentCount: 15, offlineDone: 1, offlineTotal: 5 }],
    ordersMonthCount: 6,
    totalSales: 45200,
    materialOrderCount: 1,
  },
]

let cache: FranchisePartnerDetail[] = INITIAL.map((p) => ({
  ...p,
  qualification: { ...p.qualification, approvedSnapshot: { ...p.qualification.approvedSnapshot } },
  ledger: [...p.ledger],
  classes: [...p.classes],
}))

export function listPartners(): FranchisePartnerDetail[] {
  return cache.map((p) => ({
    ...p,
    qualification: {
      ...p.qualification,
      approvedSnapshot: { ...p.qualification.approvedSnapshot },
      pendingReview: p.qualification.pendingReview
        ? {
            ...p.qualification.pendingReview,
            snapshot: { ...p.qualification.pendingReview.snapshot },
          }
        : null,
    },
    ledger: [...p.ledger],
    classes: [...p.classes],
  }))
}

export function getPartner(partnerId: string): FranchisePartnerDetail | undefined {
  return listPartners().find((p) => p.partnerId === partnerId)
}

export function approveQualification(partnerId: string): boolean {
  const idx = cache.findIndex((p) => p.partnerId === partnerId)
  if (idx === -1) return false
  const p = cache[idx]
  const pending = p.qualification.pendingReview
  if (!pending) return false
  const nextSnap = { ...pending.snapshot }
  cache[idx] = {
    ...p,
    accountStatus: p.accountStatus === 'pending_qualification' ? 'normal' : p.accountStatus,
    qualificationStatus: 'approved',
    qualification: {
      ...p.qualification,
      reviewStatus: 'approved',
      lastApprovedAt: new Date().toISOString(),
      rejectReason: null,
      approvedSnapshot: Object.keys(nextSnap).length ? nextSnap : p.qualification.approvedSnapshot,
      pendingReview: null,
    },
  }
  mergeWriteHqPartnerAccount(partnerId, cache[idx].accountStatus)
  return true
}

export function rejectQualification(partnerId: string, reason: string): boolean {
  const idx = cache.findIndex((p) => p.partnerId === partnerId)
  if (idx === -1) return false
  const p = cache[idx]
  if (!p.qualification.pendingReview) return false
  const hadApproved = Object.keys(p.qualification.approvedSnapshot).length > 0
  /** 变更复审驳回：保留原已通过资质，仅撤销待审变更 */
  if (p.qualificationStatus === 'pending_update' && hadApproved) {
    cache[idx] = {
      ...p,
      qualificationStatus: 'approved',
      qualification: {
        ...p.qualification,
        reviewStatus: 'approved',
        rejectReason: reason,
        pendingReview: null,
      },
    }
    return true
  }
  cache[idx] = {
    ...p,
    qualificationStatus: 'rejected',
    qualification: {
      ...p.qualification,
      reviewStatus: 'rejected',
      rejectReason: reason,
      pendingReview: null,
    },
  }
  return true
}

export function updatePartnerConclusion(partnerId: string, conclusion: string): boolean {
  const idx = cache.findIndex((p) => p.partnerId === partnerId)
  if (idx === -1) return false
  cache[idx] = { ...cache[idx], conclusion }
  return true
}

/** 总部手动充值：更新后台演示列表，并尽力同步主站工作台（同源 + 动态加载 demoTopUpBalance） */
export function manualTopUpPartner(partnerId: string, amount: number, remark?: string): { ok: boolean; msg?: string; balanceAfter?: number } {
  const idx = cache.findIndex((p) => p.partnerId === partnerId)
  if (idx === -1) return { ok: false, msg: '未找到该加盟商' }
  const p = cache[idx]
  const amt = Math.round(Number(amount) * 100) / 100
  if (!Number.isFinite(amt) || amt <= 0) return { ok: false, msg: '请输入大于 0 的金额' }

  const nextBalance = Math.round((p.balance + amt) * 100) / 100
  const now = new Date().toISOString()
  const note = remark?.trim() ? ` · ${remark.trim()}` : ''
  const ledgerRow: LedgerRow = {
    id: `l-admin-top-${Date.now()}`,
    type: 'topup',
    title: `总部手动充值（后台）${note}`,
    amount: amt,
    balanceAfter: nextBalance,
    createdAt: now,
  }

  cache[idx] = {
    ...p,
    balance: nextBalance,
    ledger: [ledgerRow, ...p.ledger],
  }

  // @ts-expect-error 主站演示模块是 JS 文件，后台这里只做同源 localStorage 同步。
  void import('../../../src/utils/franchisePartnerStorage.js')
    .then((m: {
      demoTopUpBalance?: (
        a: string,
        b: string,
        c: number,
        d?: string,
        opts?: { skipFrozenGuard?: boolean },
      ) => { ok?: boolean; msg?: string }
    }) => {
      const r = m.demoTopUpBalance?.(partnerId, p.refCode, amt, remark?.trim() || undefined, { skipFrozenGuard: true })
      if (r && !r.ok) console.warn('[manualTopUpPartner] 工作台同步:', r.msg)
    })
    .catch(() => {
      /* 独立打包或未解析主站模块时仅更新后台列表 */
    })

  return { ok: true, balanceAfter: nextBalance }
}

/** 须与 src/utils/franchisePartnerStorage.js 中键名一致（手动开户 → 加盟商用手机号+密码登录） */
const PARTNER_CREDS_KEY = 'bingo_franchise_partner_creds_v1'
const PARTNER_PROVISION_KEY = 'bingo_franchise_partner_provision_v1'

/** 须与 src/utils/franchisePartnerStorage.js 中 FRANCHISE_HQ_PARTNER_ACCOUNT_LS_KEY 一致 */
const FRANCHISE_HQ_PARTNER_ACCOUNT_LS_KEY = 'bingo_franchise_hq_partner_account_v1'

function mergeWriteHqPartnerAccount(partnerId: string, accountStatus: AccountStatus): void {
  if (typeof localStorage === 'undefined') return
  try {
    const raw = localStorage.getItem(FRANCHISE_HQ_PARTNER_ACCOUNT_LS_KEY)
    let map = raw ? (JSON.parse(raw) as Record<string, { accountStatus: AccountStatus }>) : {}
    if (typeof map !== 'object' || map === null || Array.isArray(map)) map = {}
    map[partnerId] = { accountStatus }
    const row = cache.find((x) => x.partnerId === partnerId)
    const phone = row ? String(row.contactPhone || '').replace(/\D/g, '') : ''
    if (phone.length === 11) {
      const alias = `p_${phone}`
      if (accountStatus === 'frozen') map[alias] = { accountStatus: 'frozen' }
      else delete map[alias]
    }
    localStorage.setItem(FRANCHISE_HQ_PARTNER_ACCOUNT_LS_KEY, JSON.stringify(map))
    window.dispatchEvent(new Event('franchise-partner-session-changed'))
  } catch {
    /* ignore */
  }
}

/** 总部变更加盟商账户状态（演示）：写入缓存并与加盟前台共享 localStorage */
export function setPartnerAccountStatus(partnerId: string, accountStatus: AccountStatus): boolean {
  const allowed: AccountStatus[] = ['normal', 'pending_qualification', 'frozen']
  if (!allowed.includes(accountStatus)) return false
  const idx = cache.findIndex((p) => p.partnerId === partnerId)
  if (idx === -1) return false
  cache[idx] = { ...cache[idx], accountStatus }
  mergeWriteHqPartnerAccount(partnerId, accountStatus)
  return true
}

/** 批量同步演示缓存中的账户状态到 localStorage，首次打开后台列表即可与前台对齐（如 fp-bj-003 已冻结） */
export function syncAllPartnerAccountStatusToLocalStorage(): void {
  if (typeof localStorage === 'undefined') return
  try {
    const map: Record<string, { accountStatus: AccountStatus }> = {}
    for (const p of cache) {
      map[p.partnerId] = { accountStatus: p.accountStatus }
      /** 无开户档案时前台登录 partnerId 为 p_${手机}，冻结须同步别名以便拦截登录 */
      if (p.accountStatus === 'frozen') {
        const phone = String(p.contactPhone || '').replace(/\D/g, '')
        if (phone.length === 11) map[`p_${phone}`] = { accountStatus: 'frozen' }
      }
    }
    localStorage.setItem(FRANCHISE_HQ_PARTNER_ACCOUNT_LS_KEY, JSON.stringify(map))
    window.dispatchEvent(new Event('franchise-partner-session-changed'))
  } catch {
    /* ignore */
  }
}

export interface CreatePartnerManualInput {
  orgName: string
  contactPhone: string
  region: string
  initialPassword: string
  refCode?: string
  partnerId?: string
  contactName?: string
  legalRepresentative?: string
  address?: string
  businessLicenseNumber?: string
  businessLicenseCopy?: string
  businessScope?: string
  businessLicenseAttachment?: ReviewAttachment | null
  principalName?: string
  principalPhone?: string
  principalIdNumber?: string
  venueFrontPhotoAttachment?: ReviewAttachment | null
  venueClassroomPhotoAttachment?: ReviewAttachment | null
  isAiTechTrack?: 'yes' | 'no' | ''
  existingProjects?: string
  studentCount?: string
  studentAgeRange?: string
  hasDedicatedClassroom?: 'yes' | 'no' | ''
  schoolPermitAttachment?: ReviewAttachment | null
  openingBalance?: number
}

function syncProvisionLocalStorage(
  phoneDigits: string,
  password: string,
  partnerId: string,
  refCode: string,
  orgName: string,
  contactName: string,
  qualificationSnapshot: QualificationSnapshot,
  qualificationStatus: QualificationReviewStatus,
): { ok: boolean; msg?: string } {
  if (typeof localStorage === 'undefined') return { ok: false, msg: '当前环境无 localStorage' }
  try {
    const rawCreds = localStorage.getItem(PARTNER_CREDS_KEY)
    const creds = rawCreds ? (JSON.parse(rawCreds) as Record<string, string>) : {}
    if (typeof creds !== 'object' || creds === null || Array.isArray(creds)) throw new Error('creds')
    creds[phoneDigits] = password
    localStorage.setItem(PARTNER_CREDS_KEY, JSON.stringify(creds))

    const rawProv = localStorage.getItem(PARTNER_PROVISION_KEY)
    const map = rawProv ? (JSON.parse(rawProv) as Record<string, unknown>) : {}
    if (typeof map !== 'object' || map === null || Array.isArray(map)) throw new Error('prov')
    map[phoneDigits] = { partnerId, refCode, orgName, contactName, qualificationSnapshot, qualificationStatus }
    localStorage.setItem(PARTNER_PROVISION_KEY, JSON.stringify(map))
    return { ok: true }
  } catch {
    return {
      ok: false,
      msg: '写入开户信息失败：后台与加盟商前台须为同源（同一域名）方可共享登录数据；或为浏览器存储受限',
    }
  }
}

function syncWorkspaceQualificationSnapshot(
  partnerId: string,
  refCode: string,
  qualificationSnapshot: QualificationSnapshot,
  approvedAt: string,
  qualificationComplete: boolean,
): void {
  // @ts-expect-error 主站演示模块是 JS 文件，后台这里只做同源 localStorage 同步。
  void import('../../../src/utils/franchisePartnerStorage.js')
    .then((m: {
      getWorkspace?: (partnerId: string, refCode: string) => Record<string, unknown>
      saveWorkspace?: (partnerId: string, data: Record<string, unknown>) => void
    }) => {
      const ws = m.getWorkspace?.(partnerId, refCode)
      if (!ws || !m.saveWorkspace) return
      ws.institutionQualification = {
        reviewStatus: qualificationComplete ? 'approved' : 'pending_initial',
        lastApprovedAt: qualificationComplete ? approvedAt : undefined,
        rejectReason: null,
        approvedSnapshot: qualificationSnapshot,
        pendingReview: null,
      }
      m.saveWorkspace(partnerId, ws)
    })
    .catch(() => {
      /* 独立打包或未解析主站模块时，仅写入开户档案；加盟端首次登录仍会读取 provision 中的资质快照 */
    })
}

/** 总部手动添加加盟商：写入后台列表，并（演示）写入本地密码表与开户档案供前台登录 */
export function createPartnerManual(input: CreatePartnerManualInput): { ok: boolean; msg?: string; partner?: FranchisePartnerDetail } {
  const phone = String(input.contactPhone || '').replace(/\D/g, '')
  if (phone.length !== 11) return { ok: false, msg: '请输入 11 位手机号' }
  if (!input.orgName?.trim()) return { ok: false, msg: '请填写机构名称' }
  if (!input.region?.trim()) return { ok: false, msg: '请填写区域' }
  const pwd = String(input.initialPassword || '')
  if (pwd.length < 6) return { ok: false, msg: '初始密码至少 6 位' }

  if (cache.some((p) => p.contactPhone.replace(/\D/g, '') === phone)) {
    return { ok: false, msg: '该手机号已在加盟商列表中' }
  }

  let refCode = input.refCode?.trim()
  if (!refCode) {
    refCode = `MAN${phone.slice(-4)}${Date.now().toString(36).slice(-4).toUpperCase()}`
  }
  if (cache.some((p) => p.refCode === refCode)) return { ok: false, msg: '推广码与现有加盟商重复' }

  let partnerId = input.partnerId?.trim()
  if (!partnerId) {
    partnerId = `fp-m-${Date.now().toString(36)}`
  }
  if (!/^[a-zA-Z0-9._-]{3,48}$/.test(partnerId)) {
    return { ok: false, msg: '加盟商 ID 须为 3～48 位字母、数字、._-' }
  }
  if (cache.some((p) => p.partnerId === partnerId)) return { ok: false, msg: '加盟商 ID 已存在' }

  const orgName = input.orgName.trim()
  const contactName = input.contactName?.trim() || '管理员'
  const openingBalance = Math.max(0, Number(input.openingBalance) || 0)
  const now = new Date().toISOString()
  const ledger: LedgerRow[] = []
  if (openingBalance > 0) {
    ledger.push({
      id: `l-open-${Date.now()}`,
      type: 'topup',
      title: '总部手动开户入账（演示）',
      amount: openingBalance,
      balanceAfter: openingBalance,
      createdAt: now,
    })
  }

  const snap: QualificationSnapshot = {
    orgName,
    legalRepresentative: input.legalRepresentative?.trim() || '待补充',
    address: input.address?.trim() || '待补充',
    contactPhone: phone,
    businessLicenseNumber: input.businessLicenseNumber?.trim() || '待补充',
    businessLicenseCopy: input.businessLicenseCopy?.trim() || '',
    businessScope: input.businessScope?.trim() || '教育培训',
    businessLicenseAttachment: input.businessLicenseAttachment || null,
    principalName: input.principalName?.trim() || contactName,
    principalPhone: String(input.principalPhone || phone).replace(/\D/g, '') || phone,
    principalIdNumber: input.principalIdNumber?.trim() || '待补充',
    venueFrontPhotoAttachment: input.venueFrontPhotoAttachment || null,
    venueClassroomPhotoAttachment: input.venueClassroomPhotoAttachment || null,
    isAiTechTrack: input.isAiTechTrack === 'no' ? 'no' : 'yes',
    existingProjects: input.existingProjects?.trim() || '待补充',
    studentCount: input.studentCount?.trim() || '待补充',
    studentAgeRange: input.studentAgeRange?.trim() || '待补充',
    hasDedicatedClassroom: input.hasDedicatedClassroom === 'no' ? 'no' : 'yes',
    schoolPermitAttachment: input.schoolPermitAttachment || null,
  }
  const hasQualificationDraft = [
    snap.legalRepresentative,
    snap.address,
    snap.businessLicenseNumber,
    snap.businessLicenseCopy,
    snap.businessScope,
    snap.principalName,
    snap.principalPhone,
    snap.principalIdNumber,
    snap.existingProjects,
    snap.studentCount,
    snap.studentAgeRange,
  ].some((v) => String(v || '').trim() && String(v || '').trim() !== '待补充') ||
    Boolean(
      snap.businessLicenseAttachment?.dataUrl ||
        snap.venueFrontPhotoAttachment?.dataUrl ||
        snap.venueClassroomPhotoAttachment?.dataUrl ||
        snap.schoolPermitAttachment?.dataUrl,
    )
  const qualificationComplete = Boolean(
    snap.legalRepresentative &&
      snap.legalRepresentative !== '待补充' &&
      snap.address &&
      snap.address !== '待补充' &&
      snap.businessLicenseNumber &&
      snap.businessLicenseNumber !== '待补充' &&
      snap.businessLicenseAttachment?.dataUrl &&
      snap.businessScope &&
      snap.principalName &&
      snap.principalPhone &&
      String(snap.principalPhone).replace(/\D/g, '').length === 11 &&
      snap.principalIdNumber &&
      snap.principalIdNumber !== '待补充' &&
      snap.venueFrontPhotoAttachment?.dataUrl &&
      snap.venueClassroomPhotoAttachment?.dataUrl &&
      snap.isAiTechTrack &&
      snap.existingProjects &&
      snap.existingProjects !== '待补充' &&
      snap.studentCount &&
      snap.studentCount !== '待补充' &&
      snap.studentAgeRange &&
      snap.studentAgeRange !== '待补充' &&
      snap.hasDedicatedClassroom,
  )

  const sync = syncProvisionLocalStorage(phone, pwd, partnerId, refCode, orgName, contactName, hasQualificationDraft ? snap : {}, qualificationComplete ? 'approved' : 'incomplete')
  if (!sync.ok) return sync

  const partner: FranchisePartnerDetail = {
    partnerId,
    refCode,
    orgName,
    contactPhone: phone,
    region: input.region.trim(),
    accountStatus: qualificationComplete ? 'normal' : 'pending_qualification',
    balance: Math.round(openingBalance * 100) / 100,
    frozen: 0,
    qualificationStatus: qualificationComplete ? 'approved' : 'incomplete',
    conclusion: qualificationComplete
      ? '总部手动开户：账号与资质资料已录入。'
      : '总部手动开户：账号已创建，资质资料待加盟商或管理员后续补齐。',
    qualification: {
      reviewStatus: qualificationComplete ? 'approved' : 'incomplete',
      lastApprovedAt: qualificationComplete ? now : undefined,
      rejectReason: null,
      approvedSnapshot: hasQualificationDraft ? { ...snap } : {},
      pendingReview: null,
    },
    ledger,
    classes: [],
    ordersMonthCount: 0,
    totalSales: 0,
    materialOrderCount: 0,
  }

  cache = [partner, ...cache]
  mergeWriteHqPartnerAccount(partnerId, partner.accountStatus)
  syncWorkspaceQualificationSnapshot(partnerId, refCode, hasQualificationDraft ? snap : {}, now, qualificationComplete)
  return { ok: true, partner }
}
