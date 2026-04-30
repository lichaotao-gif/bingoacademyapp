/** 总部「加盟商管理」演示数据（正式环境对接 API） */

export type AccountStatus = 'normal' | 'pending_qualification' | 'frozen'
export type QualificationReviewStatus = 'approved' | 'pending' | 'rejected' | 'pending_update'

export interface QualificationBlock {
  reviewStatus: QualificationReviewStatus
  lastApprovedAt?: string
  rejectReason?: string | null
  approvedSnapshot: Record<string, string>
  pendingReview?: {
    submittedAt: string
    snapshot: Record<string, string>
  } | null
}

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
        businessScope: '科技类培训、教育信息咨询。',
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
          businessScope: '软件与信息技术培训、创客教育服务。',
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
        businessScope: '中小学生校外托管服务、教育咨询。',
      },
      pendingReview: {
        submittedAt: '2026-04-25T11:20:00.000Z',
        snapshot: {
          orgName: '北京海淀缤果合作校区（增资变更）',
          legalRepresentative: '刘洋',
          address: '北京市海淀区中关村大街 10 号海龙大厦',
          contactPhone: '13700137003',
          businessLicenseNumber: '91110108MA01XXXXXX',
          businessScope: '科技培训、教育软件销售。',
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
  businessScope?: string
  openingBalance?: number
}

function syncProvisionLocalStorage(
  phoneDigits: string,
  password: string,
  partnerId: string,
  refCode: string,
  orgName: string,
  contactName: string,
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
    map[phoneDigits] = { partnerId, refCode, orgName, contactName }
    localStorage.setItem(PARTNER_PROVISION_KEY, JSON.stringify(map))
    return { ok: true }
  } catch {
    return {
      ok: false,
      msg: '写入开户信息失败：后台与加盟商前台须为同源（同一域名）方可共享登录数据；或为浏览器存储受限',
    }
  }
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
  const sync = syncProvisionLocalStorage(phone, pwd, partnerId, refCode, orgName, contactName)
  if (!sync.ok) return sync

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

  const snap = {
    orgName,
    legalRepresentative: input.legalRepresentative?.trim() || '待补充',
    address: input.address?.trim() || '待补充',
    contactPhone: phone,
    businessLicenseNumber: input.businessLicenseNumber?.trim() || '待补充',
    businessScope: input.businessScope?.trim() || '教育培训',
  }

  const partner: FranchisePartnerDetail = {
    partnerId,
    refCode,
    orgName,
    contactPhone: phone,
    region: input.region.trim(),
    accountStatus: 'normal',
    balance: Math.round(openingBalance * 100) / 100,
    frozen: 0,
    qualificationStatus: 'approved',
    conclusion: '总部手动开户：快速开通，请关注资质材料后续补齐。',
    qualification: {
      reviewStatus: 'approved',
      lastApprovedAt: now,
      rejectReason: null,
      approvedSnapshot: { ...snap },
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
  return { ok: true, partner }
}
