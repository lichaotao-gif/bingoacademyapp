/**
 * 加盟商工作台演示数据（localStorage，单机模拟）
 * v1.1.0：独立账号、班级/学员、专属折扣、充课扣余额、订单与财务统计。
 * 生产环境应替换为总部后台 API。
 */
const SESSION_KEY = 'bingo_franchise_partner_session_v1'

const workspaceKey = (partnerId) => `bingo_franchise_workspace_v2_${partnerId}`

function safeParse(json, fallback) {
  try {
    return JSON.parse(json)
  } catch {
    return fallback
  }
}

/** 课程包（与站点课程 id 对齐） */
export const FRANCHISE_PROMOTABLE_COURSES = [
  { id: 'ai-enlighten', name: '《AI启蒙：走进智能世界》', price: 299 },
  { id: 'ai-advance-basic', name: '《AI基础原理与应用》', price: 698 },
  { id: 'ai-advance-ml', name: '《机器学习入门与实战》', price: 698 },
  { id: 'ai-programming', name: 'AI编程入门课', price: 399 },
]

/** 教具商城：人工智能相关教具（演示价格，正式环境由总部商品中心维护） */
export const FRANCHISE_TEACHING_PRODUCTS = [
  {
    id: 'kit-ai-starter',
    name: 'AI启蒙教具套装（主控+传感）',
    price: 680,
    tag: '热销',
    desc: '适合低龄段课堂演示：灯光、声音等传感器与简易逻辑编程。',
    emoji: '🧩',
  },
  {
    id: 'robot-microbit',
    name: 'Micro:bit AI 编程扩展套件',
    price: 298,
    tag: '',
    desc: '图形化编程对接实物硬件，含教案导读与班级管理建议。',
    emoji: '🤖',
  },
  {
    id: 'sensor-ai-kit',
    name: '人工智能感知传感器套装',
    price: 1280,
    tag: '新课标',
    desc: '视觉 / 距离 / 声音多模态实验，配套实验报告模板。',
    emoji: '📡',
  },
  {
    id: 'jetson-nano-edu',
    name: '边缘 AI 实验主机（教育版）',
    price: 3299,
    tag: '校区必备',
    desc: '轻量深度学习推理演示，含散热与电源适配器。',
    emoji: '🖥️',
  },
  {
    id: 'ai-xlab-pack',
    name: '机器学习实验耗材包（班课装）',
    price: 458,
    tag: '',
    desc: '卡片、标签与数据集样板，约 30 人班课用量。',
    emoji: '📦',
  },
  {
    id: 'drone-ai-lite',
    name: '可编程无人机（Lite 教育版）',
    price: 1899,
    tag: '',
    desc: '定点巡航与视觉循迹入门，含安全护桨与保险说明。',
    emoji: '🚁',
  },
]

function seedMaterialOrders(t0) {
  return [
    {
      id: 'MJ20240620001',
      items: [
        {
          productId: 'robot-microbit',
          name: 'Micro:bit AI 编程扩展套件',
          qty: 5,
          unitPrice: 298,
          lineTotal: 1490,
        },
      ],
      payAmount: 1490,
      payMethod: 'balance',
      status: '已完成',
      createdAt: new Date(t0 - 86400000 * 8).toISOString(),
      receiverSnapshot: '机构收货 · 默认登记地址（演示）',
      shipments: [
        {
          at: new Date(t0 - 86400000 * 6).toISOString(),
          carrier: '顺丰速运',
          trackingNo: 'SF1666688888812',
          status: '已签收',
          remark: '已由前台代收',
        },
        {
          at: new Date(t0 - 86400000 * 7).toISOString(),
          carrier: '顺丰速运',
          trackingNo: 'SF1666688888812',
          status: '运输中',
          remark: '快件途中',
        },
        {
          at: new Date(t0 - 86400000 * 8).toISOString(),
          carrier: '',
          trackingNo: '',
          status: '待发货',
          remark: '仓库备货完成，等待揽收',
        },
      ],
    },
    {
      id: 'MJ20240626002',
      items: [
        {
          productId: 'sensor-ai-kit',
          name: '人工智能感知传感器套装',
          qty: 1,
          unitPrice: 1280,
          lineTotal: 1280,
        },
      ],
      payAmount: 1280,
      payMethod: 'wechat',
      status: '配送中',
      createdAt: new Date(t0 - 86400000 * 2).toISOString(),
      receiverSnapshot: '机构收货 · 默认登记地址（演示）',
      shipments: [
        {
          at: new Date(t0 - 86400000 * 1).toISOString(),
          carrier: '京东物流',
          trackingNo: 'JDVV8888888888',
          status: '运输中',
          remark: '到达区域分拨中心',
        },
        {
          at: new Date(t0 - 86400000 * 2).toISOString(),
          carrier: '',
          trackingNo: '',
          status: '待发货',
          remark: '已下单（微信支付演示成功）',
        },
      ],
    },
  ]
}

export function getPartnerSession() {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) return null
  const s = safeParse(raw, null)
  if (!s?.partnerId) return null
  return s
}

export function setPartnerSession(payload) {
  if (typeof window === 'undefined') return
  const raw = JSON.stringify(payload)
  try {
    localStorage.setItem(SESSION_KEY, raw)
  } catch (e) {
    console.error(e)
    throw new Error('无法保存登录状态：浏览器可能禁止本地存储或空间已满')
  }
  window.dispatchEvent(new Event('franchise-partner-session-changed'))
}

export function clearPartnerSession() {
  localStorage.removeItem(SESSION_KEY)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('franchise-partner-session-changed'))
  }
}

const DEMO_STORAGE_PREFIX = 'bingo_franchise'

/**
 * 清除当前域名下所有加盟商演示相关 localStorage / sessionStorage（键名以 bingo_franchise 开头）。
 * 无法替你操作浏览器远程删除，请在登录页点此功能或本地调用。
 * @returns {{ ok: boolean, cleared: number }}
 */
export function clearFranchisePartnerDemoStorage() {
  if (typeof window === 'undefined') return { ok: false, cleared: 0 }
  let cleared = 0
  const wipe = (storage) => {
    const keys = []
    try {
      for (let i = 0; i < storage.length; i++) {
        const k = storage.key(i)
        if (k && k.startsWith(DEMO_STORAGE_PREFIX)) keys.push(k)
      }
    } catch {
      return
    }
    for (const k of keys) {
      try {
        storage.removeItem(k)
        cleared++
      } catch {
        /* ignore */
      }
    }
  }
  try {
    wipe(localStorage)
    wipe(sessionStorage)
  } catch {
    return { ok: false, cleared }
  }
  try {
    window.dispatchEvent(new Event('franchise-partner-session-changed'))
  } catch {
    /* ignore */
  }
  return { ok: true, cleared }
}

/** 演示：本地保存登录密码（正式环境由服务端鉴权） */
const PARTNER_CREDS_KEY = 'bingo_franchise_partner_creds_v1'

/** 防止 localStorage 里曾是 `null`、数组等非法形状导致 creds[p] 抛错 */
function normalizePartnerCreds(parsed) {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
  return parsed
}

function loadPartnerCreds() {
  if (typeof window === 'undefined') return {}
  try {
    return normalizePartnerCreds(safeParse(localStorage.getItem(PARTNER_CREDS_KEY), {}))
  } catch {
    /* Safari 无痕 / 禁用存储时 getItem 可能抛错 */
    return {}
  }
}

/** @returns {boolean} 是否写入成功 */
function savePartnerCreds(creds) {
  if (typeof window === 'undefined') return false
  try {
    localStorage.setItem(PARTNER_CREDS_KEY, JSON.stringify(creds))
    return true
  } catch {
    return false
  }
}

/** 登录页短信演示：验证码存 sessionStorage，5 分钟内有效（正式环境对接短信网关） */
const SMS_LOGIN_KEY = (p) => `bingo_franchise_partner_sms_login_${p}`

/**
 * 发送登录短信验证码（本地演示）
 * @returns {{ ok: true, demoCode: string } | { ok: false, msg: string }}
 */
export function sendPartnerLoginSmsCode(phoneDigits) {
  const p = String(phoneDigits || '').replace(/\D/g, '')
  if (p.length !== 11) return { ok: false, msg: '请输入11位手机号' }
  const code = String(Math.floor(100000 + Math.random() * 900000))
  const exp = Date.now() + 5 * 60 * 1000
  try {
    sessionStorage.setItem(SMS_LOGIN_KEY(p), JSON.stringify({ code, exp }))
  } catch {
    return { ok: false, msg: '无法写入验证码状态，请检查浏览器是否禁用存储' }
  }
  return { ok: true, demoCode: code }
}

/**
 * 校验短信验证码并完成「可登录」判定（不写入密码表）
 * @returns {{ ok: true } | { ok: false, msg: string }}
 */
export function verifyPartnerLoginSmsCode(phoneDigits, codeInput) {
  const p = String(phoneDigits || '').replace(/\D/g, '')
  if (p.length !== 11) return { ok: false, msg: '手机号格式异常' }
  const input = String(codeInput || '').replace(/\s/g, '')
  if (input.length < 4) return { ok: false, msg: '请输入验证码' }
  let raw
  try {
    raw = sessionStorage.getItem(SMS_LOGIN_KEY(p))
  } catch {
    return { ok: false, msg: '无法读取验证码状态' }
  }
  if (!raw) return { ok: false, msg: '请先获取验证码' }
  const row = safeParse(raw, null)
  if (!row?.code) return { ok: false, msg: '请先获取验证码' }
  if (Date.now() > (row.exp || 0)) {
    try {
      sessionStorage.removeItem(SMS_LOGIN_KEY(p))
    } catch {
      /* ignore */
    }
    return { ok: false, msg: '验证码已过期，请重新获取' }
  }
  if (input !== String(row.code)) return { ok: false, msg: '验证码错误' }
  try {
    sessionStorage.removeItem(SMS_LOGIN_KEY(p))
  } catch {
    /* ignore */
  }
  return { ok: true }
}

/** 登录时校验；无记录则写入当前密码（首次登录即注册） */
export function verifyOrRegisterPartnerLogin(phoneDigits, password) {
  try {
    const p = String(phoneDigits || '').replace(/\D/g, '')
    if (p.length !== 11) return { ok: false, msg: '请输入正确的11位手机号' }
    if (String(password).length < 6) return { ok: false, msg: '密码至少 6 位' }
    const creds = loadPartnerCreds()
    if (creds[p]) {
      if (creds[p] !== password) return { ok: false, msg: '密码错误，请重新输入' }
      return { ok: true }
    }
    creds[p] = password
    if (!savePartnerCreds(creds)) {
      return {
        ok: false,
        msg: '无法保存账号信息：存储已满或被禁用。请在浏览器设置中允许本站使用本地存储，或清理本站数据后重试。',
      }
    }
    return { ok: true }
  } catch {
    return {
      ok: false,
      msg: '登录校验失败：浏览器可能禁止了本地存储，请关闭无痕窗口或允许本站存储。',
    }
  }
}

export function hasPartnerPasswordStored(phoneDigits) {
  const p = String(phoneDigits || '').replace(/\D/g, '')
  if (p.length !== 11) return false
  return Boolean(loadPartnerCreds()[p])
}

/** 修改登录密码；本地尚无记录时仅需新密码与确认一致即可写入 */
export function updatePartnerAccountPassword(phoneDigits, oldPassword, newPassword, confirmPassword) {
  const p = String(phoneDigits || '').replace(/\D/g, '')
  if (p.length !== 11) return { ok: false, msg: '账号数据异常' }
  if (String(newPassword).length < 6) return { ok: false, msg: '新密码至少 6 位' }
  if (newPassword !== confirmPassword) return { ok: false, msg: '两次输入的新密码不一致' }
  const creds = loadPartnerCreds()
  if (creds[p]) {
    if (creds[p] !== oldPassword) return { ok: false, msg: '原密码不正确' }
  }
  creds[p] = newPassword
  if (!savePartnerCreds(creds)) {
    return { ok: false, msg: '无法保存新密码，请清理浏览器存储空间或允许本站使用本地存储' }
  }
  return { ok: true }
}

export function displayPartnerOrgName(session) {
  if (!session) return 'BingoAI学院·加盟商'
  if (session.orgName) return session.orgName
  const p = String(session.phone || '').replace(/\D/g, '')
  if (p.length >= 11) return `加盟商（${p.slice(0, 3)}****${p.slice(-4)}）`
  return 'BingoAI学院·加盟商'
}

/** 加盟资质：已通过快照 + 可选待审变更（二次审核期间仍按已通过快照履约，见业务说明） */
export function buildDefaultInstitutionQualification(partnerId, refCode) {
  const session = typeof window !== 'undefined' ? getPartnerSession() : null
  const same = session?.partnerId === partnerId
  const orgName =
    same && session?.orgName?.trim()
      ? session.orgName.trim()
      : `缤果AI学院·合作机构（${refCode || partnerId}）`
  const contactPhone = same && session?.phone ? String(session.phone) : '13800138000'
  return {
    reviewStatus: 'approved',
    lastApprovedAt: new Date().toISOString(),
    rejectReason: null,
    approvedSnapshot: {
      orgName,
      legalRepresentative: '王小明',
      address: '上海市浦东新区张江高科技园区科苑路 88 号 2 号楼',
      contactPhone,
      businessLicenseNumber: '91310000MA1FLXXXXX',
      businessLicenseCopy: '（示例）扫描件已存档：营业执照_正副本合订.pdf',
      businessScope: '科技类培训、教育信息咨询、非学历文化知识辅导、教育软件开发。',
      businessLicenseAttachment: null,
    },
    pendingReview: null,
  }
}

function ensureInstitutionQualification(ws, partnerId, refCode) {
  const snap = ws.institutionQualification?.approvedSnapshot
  if (snap && typeof snap.orgName === 'string' && snap.orgName.length > 0) return false
  ws.institutionQualification = buildDefaultInstitutionQualification(partnerId, refCode)
  return true
}

const INSTITUTION_FIELD_LABELS = {
  orgName: '机构名称',
  legalRepresentative: '法定代表人',
  address: '机构地址',
  contactPhone: '联系人电话',
  businessLicenseNumber: '营业执照注册号/统一社会信用代码',
  businessScope: '经营范围',
}

/** 营业执照附件（演示存 localStorage；正式环境应为 OSS URL） */
const MAX_LICENSE_DATA_URL_CHARS = 5 * 1024 * 1024

/** 防止超大营业执照 base64 拖垮页面：超限则移除附件仅保留文字字段 */
function stripOversizedLicenseAttachments(ws) {
  let changed = false
  const iq = ws.institutionQualification
  if (!iq) return false
  const stripSnap = (snap) => {
    if (!snap || typeof snap !== 'object') return
    const att = snap.businessLicenseAttachment
    const du = att?.dataUrl
    if (typeof du === 'string' && du.length > MAX_LICENSE_DATA_URL_CHARS) {
      snap.businessLicenseAttachment = null
      changed = true
    }
  }
  stripSnap(iq.approvedSnapshot)
  if (iq.pendingReview?.snapshot) stripSnap(iq.pendingReview.snapshot)
  return changed
}

function sanitizeLicenseFileName(name) {
  const s = String(name || '营业执照').replace(/[/\\?%*:|"<>]/g, '_').trim()
  return (s || '营业执照').slice(0, 180)
}

function normalizeLicenseAttachment(raw) {
  if (!raw || typeof raw !== 'object') return null
  const dataUrl = raw.dataUrl
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) return null
  if (dataUrl.length > MAX_LICENSE_DATA_URL_CHARS) return { error: '营业执照文件过大，请使用 4MB 以内的 PDF 或图片' }
  return {
    fileName: sanitizeLicenseFileName(raw.fileName),
    dataUrl,
  }
}

/**
 * 提交机构资质（首次或变更）。已通过加盟审核后再次提交进入 pending_update，总部复审期间不影响售课与开班。
 */
export function submitInstitutionQualificationUpdate(partnerId, refCode, snapshot) {
  const ws = getWorkspace(partnerId, refCode)
  const iq = ws.institutionQualification
  if (!iq) return { ok: false, msg: '机构数据未就绪，请刷新页面重试' }

  const required = ['orgName', 'legalRepresentative', 'address', 'contactPhone', 'businessLicenseNumber', 'businessScope']
  for (const key of required) {
    if (!String(snapshot[key] ?? '').trim()) {
      return { ok: false, msg: `请填写「${INSTITUTION_FIELD_LABELS[key] || key}」` }
    }
  }

  const attachment = normalizeLicenseAttachment(snapshot.businessLicenseAttachment)
  if (attachment?.error) return { ok: false, msg: attachment.error }

  const copyTrim = String(snapshot.businessLicenseCopy ?? '').trim()
  const hasLegacyCopy = copyTrim.length >= 4
  if (!attachment && !hasLegacyCopy) {
    return {
      ok: false,
      msg: '请上传营业执照电子版（PDF 或图片），或填写复印件/扫描件说明（至少 4 个字）',
    }
  }

  const clean = {
    orgName: String(snapshot.orgName).trim(),
    legalRepresentative: String(snapshot.legalRepresentative).trim(),
    address: String(snapshot.address).trim(),
    contactPhone: String(snapshot.contactPhone).replace(/\s/g, '').trim(),
    businessLicenseNumber: String(snapshot.businessLicenseNumber).trim(),
    businessLicenseCopy: copyTrim,
    businessScope: String(snapshot.businessScope).trim(),
    businessLicenseAttachment: attachment || null,
  }

  iq.pendingReview = {
    submittedAt: new Date().toISOString(),
    snapshot: clean,
  }

  /** 曾存在总部认可的生效资质（含「被驳回但旧证仍有效」）→ 走资质变更复审，复审期间不影响售课与开班 */
  const hasEstablishedLine =
    iq.lastApprovedAt &&
    iq.approvedSnapshot &&
    (iq.reviewStatus === 'approved' ||
      iq.reviewStatus === 'pending_update' ||
      iq.reviewStatus === 'rejected')
  iq.reviewStatus = hasEstablishedLine ? 'pending_update' : 'pending_initial'
  iq.rejectReason = null

  saveWorkspace(partnerId, ws)
  return { ok: true, ws }
}

/** 演示：总部审核通过，将待审内容合并为生效资质 */
export function simulateInstitutionQualificationApprove(partnerId, refCode) {
  const ws = getWorkspace(partnerId, refCode)
  const iq = ws.institutionQualification
  if (!iq?.pendingReview?.snapshot) return { ok: false, msg: '当前没有待审核的资质提交' }

  iq.approvedSnapshot = { ...iq.pendingReview.snapshot }
  iq.lastApprovedAt = new Date().toISOString()
  iq.pendingReview = null
  iq.reviewStatus = 'approved'
  iq.rejectReason = null
  saveWorkspace(partnerId, ws)

  const s = getPartnerSession()
  if (s?.partnerId === partnerId) {
    setPartnerSession({ ...s, orgName: iq.approvedSnapshot.orgName })
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('franchise-partner-session-changed'))
    }
  }
  return { ok: true, ws }
}

/** 演示：总部驳回（生效资质不变，可修改后再次提交） */
export function simulateInstitutionQualificationReject(partnerId, refCode, reason) {
  const ws = getWorkspace(partnerId, refCode)
  const iq = ws.institutionQualification
  if (!iq?.pendingReview) return { ok: false, msg: '当前没有待审核的资质提交' }

  iq.pendingReview = null
  iq.reviewStatus = 'rejected'
  iq.rejectReason = String(reason || '请根据总部反馈意见修改后重新提交。').trim()
  saveWorkspace(partnerId, ws)
  return { ok: true, ws }
}

export function getDiscountRate(ws, courseId) {
  const row = ws?.courseDiscounts?.find((d) => d.courseId === courseId)
  return row?.rate ?? 1
}

export function getDiscountLabel(ws, courseId) {
  const row = ws?.courseDiscounts?.find((d) => d.courseId === courseId)
  return row?.label || '原价'
}

/** 总销售额：已完成充课订单实付累计（演示口径） */
export function computeTotalSales(ws) {
  if (!ws?.orders?.length) return 0
  return ws.orders
    .filter((o) => o.status === '已完成')
    .reduce((s, o) => s + (Number(o.payAmount) || 0), 0)
}

/** 本月订单数 */
export function computeMonthOrderCount(ws) {
  if (!ws?.orders?.length) return 0
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()
  return ws.orders.filter((o) => {
    const d = new Date(o.createdAt)
    return d.getFullYear() === y && d.getMonth() === m
  }).length
}

function defaultWorkspace(partnerId, refCode) {
  const t0 = Date.now()
  const courseDiscounts = [
    { courseId: 'ai-enlighten', rate: 0.8, label: '8折' },
    { courseId: 'ai-advance-basic', rate: 0.75, label: '75折' },
    { courseId: 'ai-advance-ml', rate: 0.75, label: '75折' },
    { courseId: 'ai-programming', rate: 0.85, label: '85折' },
  ]

  const mkOrder = (id, studentName, courseId, status, daysAgo) => {
    const c = FRANCHISE_PROMOTABLE_COURSES.find((x) => x.id === courseId)
    const rate = getDiscountRate({ courseDiscounts }, courseId)
    const originalPrice = c.price
    const payAmount = Math.round(originalPrice * rate * 100) / 100
    const discountLabel = getDiscountLabel({ courseDiscounts }, courseId)
    return {
      id,
      studentName,
      courseId,
      courseName: c.name,
      originalPrice,
      discountLabel,
      payAmount,
      status,
      createdAt: new Date(t0 - 86400000 * daysAgo).toISOString(),
    }
  }

  const orders = [
    mkOrder('DD20240628001', '张同学', 'ai-enlighten', '已完成', 2),
    mkOrder('DD20240627088', '李同学', 'ai-advance-basic', '已完成', 5),
    mkOrder('DD20240626052', '王同学', 'ai-programming', '处理中', 1),
    mkOrder('DD20240625033', '赵同学', 'ai-advance-ml', '已完成', 12),
    mkOrder('DD20240620019', '张同学', 'ai-programming', '已完成', 18),
  ]

  const totalOut = orders.filter((o) => o.status === '已完成').reduce((s, o) => s + o.payAmount, 0)
  const balance = 32560.0
  const openingTopUp = Math.round((balance + totalOut) * 100) / 100

  return {
    schemaVersion: 2,
    partnerId,
    refCode,
    balance,
    frozen: 0,
    courseDiscounts,
    announcements: [
      { id: 'a1', title: '关于开展暑期 AI 特色课的通知', date: '2024-06-01', isNew: false },
      { id: 'a2', title: '新课程包上线 · 折扣已同步', date: '2024-06-28', isNew: true },
      { id: 'a3', title: '充课流程说明：线下收款后请在 48 小时内完成后台充课', date: '2024-06-20', isNew: false },
    ],
    orders,
    ledger: (() => {
      const completedSorted = orders
        .filter((o) => o.status === '已完成')
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      let running = openingTopUp
      const chargeRows = []
      for (const o of completedSorted) {
        running = Math.round((running - o.payAmount) * 100) / 100
        chargeRows.push({
          id: `l-${o.id}`,
          type: 'recharge_course',
          title: `充课 · ${o.studentName} · ${o.courseName}`,
          amount: -o.payAmount,
          balanceAfter: running,
          createdAt: o.createdAt,
        })
      }
      return [
        {
          id: 'l-open',
          type: 'topup',
          title: '总部账户充值（演示）',
          amount: openingTopUp,
          balanceAfter: openingTopUp,
          createdAt: new Date(t0 - 86400000 * 60).toISOString(),
        },
        ...chargeRows.reverse(),
      ]
    })(),
    withdrawals: [],
    classes: [
      {
        id: 'cls-1',
        name: '周六上午 · 幼儿英语启蒙班',
        studentIds: ['stu-1', 'stu-2'],
        createdAt: new Date(t0 - 86400000 * 30).toISOString(),
      },
      {
        id: 'cls-2',
        name: '暑期 · AI 竞赛冲刺班',
        studentIds: ['stu-3'],
        createdAt: new Date(t0 - 86400000 * 7).toISOString(),
      },
      {
        id: 'cls-3',
        name: '周三晚 · 少儿编程基础班',
        studentIds: [],
        createdAt: new Date(t0 - 86400000 * 3).toISOString(),
      },
    ],
    students: [
      {
        id: 'stu-1',
        phone: '13800138001',
        name: '张同学',
        classId: 'cls-1',
        enrollments: [
          {
            courseId: 'ai-enlighten',
            progressPct: 75,
            status: '学习中',
            purchasedAt: new Date(t0 - 86400000 * 21).toISOString(),
            lastStudyAt: new Date(t0 - 3600000).toISOString(),
          },
        ],
      },
      {
        id: 'stu-2',
        phone: '13800138002',
        name: '李同学',
        classId: 'cls-1',
        enrollments: [
          {
            courseId: 'ai-enlighten',
            progressPct: 100,
            status: '已完成',
            purchasedAt: new Date(t0 - 86400000 * 45).toISOString(),
            lastStudyAt: new Date(t0 - 86400000).toISOString(),
          },
        ],
      },
      {
        id: 'stu-3',
        phone: '13912345678',
        name: '王同学',
        classId: 'cls-2',
        enrollments: [
          {
            courseId: 'ai-advance-basic',
            progressPct: 32,
            status: '学习中',
            purchasedAt: new Date(t0 - 86400000 * 10).toISOString(),
            lastStudyAt: new Date(t0 - 7200000).toISOString(),
          },
        ],
      },
    ],
    /** 教具采购订单（本地演示；正式环境对接总部供应链） */
    materialOrders: seedMaterialOrders(t0),
    institutionQualification: buildDefaultInstitutionQualification(partnerId, refCode),
  }
}

function normalizeEnrollments(ws) {
  let changed = false
  const fallbackPurchase = () => new Date(Date.now() - 86400000 * 7).toISOString()
  for (const s of ws.students || []) {
    for (const e of s.enrollments || []) {
      if (e.purchasedAt == null || e.purchasedAt === '') {
        e.purchasedAt = e.lastStudyAt || fallbackPurchase()
        changed = true
      }
    }
  }
  return changed
}

export function getWorkspace(partnerId, refCode) {
  if (typeof window === 'undefined') return defaultWorkspace(partnerId, refCode)
  const raw = localStorage.getItem(workspaceKey(partnerId))
  if (!raw) {
    const init = defaultWorkspace(partnerId, refCode)
    localStorage.setItem(workspaceKey(partnerId), JSON.stringify(init))
    return init
  }
  const ws = safeParse(raw, defaultWorkspace(partnerId, refCode))
  if (!ws.partnerId) ws.partnerId = partnerId
  if (ws.refCode == null) ws.refCode = refCode
  const firstOrder = ws.orders?.[0]
  const isLegacyOrders = firstOrder && ('commission' in firstOrder || !('discountLabel' in firstOrder))
  if (!ws.schemaVersion || isLegacyOrders) {
    const fresh = defaultWorkspace(partnerId, refCode)
    Object.keys(fresh).forEach((k) => {
      ws[k] = fresh[k]
    })
    ws.partnerId = partnerId
    ws.refCode = refCode
    saveWorkspace(partnerId, ws)
  }
  if (!ws.courseDiscounts?.length) {
    ws.courseDiscounts = defaultWorkspace(partnerId, refCode).courseDiscounts
    saveWorkspace(partnerId, ws)
  }
  if (!ws.announcements?.length) {
    ws.announcements = defaultWorkspace(partnerId, refCode).announcements
    saveWorkspace(partnerId, ws)
  }
  if (normalizeEnrollments(ws)) saveWorkspace(partnerId, ws)
  if (ensureInstitutionQualification(ws, partnerId, refCode)) saveWorkspace(partnerId, ws)
  if (stripOversizedLicenseAttachments(ws)) saveWorkspace(partnerId, ws)
  if (!Array.isArray(ws.materialOrders)) {
    ws.materialOrders = seedMaterialOrders(Date.now())
    saveWorkspace(partnerId, ws)
  }
  return ws
}

export function saveWorkspace(partnerId, data) {
  localStorage.setItem(workspaceKey(partnerId), JSON.stringify(data))
}

export function buildPromoteLink(origin, courseId, refCode) {
  const base = (origin || '').replace(/\/$/, '') || ''
  return `${base}/courses/detail/${courseId}?ref=${encodeURIComponent(refCode)}`
}

/**
 * 充课：按总部配置的专属折扣从加盟商余额扣款，并记录订单、开通/更新学员选课。
 */
export function rechargeCourse(partnerId, refCode, { studentId, courseId }) {
  const ws = getWorkspace(partnerId, refCode)
  const course = FRANCHISE_PROMOTABLE_COURSES.find((c) => c.id === courseId)
  if (!course) return { ok: false, msg: '课程不存在' }
  const stu = ws.students.find((s) => s.id === studentId)
  if (!stu) return { ok: false, msg: '学员不存在' }
  const rate = getDiscountRate(ws, courseId)
  const originalPrice = course.price
  const payAmount = Math.round(originalPrice * rate * 100) / 100
  if (ws.balance < payAmount) return { ok: false, msg: `账户余额不足（需 ¥${payAmount.toFixed(2)}），请联系总部充值` }
  const exists = (stu.enrollments || []).some((e) => e.courseId === courseId && e.status !== '已退款')
  if (exists) return { ok: false, msg: '该学员已开通此课程包，无需重复充课' }

  ws.balance = Math.round((ws.balance - payAmount) * 100) / 100
  const discountLabel = getDiscountLabel(ws, courseId)
  const n = ws.orders.filter((o) => /^DD/.test(o.id)).length + 1
  const id = `DD${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(n).padStart(3, '0')}`
  ws.orders.unshift({
    id,
    studentName: stu.name,
    courseId,
    courseName: course.name,
    originalPrice,
    discountLabel,
    payAmount,
    status: '已完成',
    createdAt: new Date().toISOString(),
  })
  if (!stu.enrollments) stu.enrollments = []
  stu.enrollments.push({
    courseId,
    progressPct: 0,
    status: '学习中',
    purchasedAt: new Date().toISOString(),
    lastStudyAt: null,
  })
  ws.ledger.unshift({
    id: `l-${Date.now()}`,
    type: 'recharge_course',
    title: `充课 · ${stu.name} · ${course.name}`,
    amount: -payAmount,
    balanceAfter: ws.balance,
    createdAt: new Date().toISOString(),
  })
  saveWorkspace(partnerId, ws)
  return { ok: true, ws, payAmount, orderId: id }
}

export function createClass(partnerId, refCode, name, meta = {}) {
  const ws = getWorkspace(partnerId, refCode)
  const id = `cls-${Date.now()}`
  ws.classes.push({
    id,
    name: name.trim(),
    studentIds: [],
    createdAt: new Date().toISOString(),
    courseType: typeof meta.courseType === 'string' ? meta.courseType.trim() : '',
    startDate: typeof meta.startDate === 'string' ? meta.startDate.trim() : '',
  })
  saveWorkspace(partnerId, ws)
  return ws
}

export function deleteClass(partnerId, refCode, classId) {
  const ws = getWorkspace(partnerId, refCode)
  const idx = ws.classes.findIndex((c) => c.id === classId)
  if (idx === -1) return { ok: false, msg: '班级不存在' }
  for (const s of ws.students || []) {
    if (s.classId === classId) s.classId = null
  }
  ws.classes.splice(idx, 1)
  saveWorkspace(partnerId, ws)
  return { ok: true, ws }
}

export function addStudentToClass(partnerId, refCode, classId, phone, name, remark) {
  const ws = getWorkspace(partnerId, refCode)
  const phoneNorm = String(phone).replace(/\D/g, '').slice(-11)
  if (phoneNorm.length < 11) return { ok: false, msg: '请输入11位手机号' }
  let stu = ws.students.find((s) => s.phone === phoneNorm)
  if (!stu) {
    stu = {
      id: `stu-${Date.now()}`,
      phone: phoneNorm,
      name: (name || '学员').trim() || '学员',
      classId,
      enrollments: [],
    }
    if (remark != null && String(remark).trim()) stu.remark = String(remark).trim()
    ws.students.push(stu)
  } else {
    stu.classId = classId
    if (name?.trim()) stu.name = name.trim()
    if (remark != null && String(remark).trim()) stu.remark = String(remark).trim()
    else if (remark === '') delete stu.remark
  }
  const cls = ws.classes.find((c) => c.id === classId)
  if (cls && !cls.studentIds.includes(stu.id)) cls.studentIds.push(stu.id)
  saveWorkspace(partnerId, ws)
  return { ok: true, ws }
}

/** 更新学员备注（本地工作台）。空字符串则清除备注字段。 */
export function updateStudentRemark(partnerId, refCode, studentId, remark) {
  const ws = getWorkspace(partnerId, refCode)
  const stu = ws.students.find((s) => s.id === studentId)
  if (!stu) return { ok: false, msg: '学员不存在' }
  const t = remark != null ? String(remark).trim() : ''
  if (t) stu.remark = t
  else delete stu.remark
  saveWorkspace(partnerId, ws)
  return { ok: true, ws }
}

/** 删除学员：从班级名单中移除，并删除学员及其选课记录（订单流水保留）。 */
export function deleteStudent(partnerId, refCode, studentId) {
  const ws = getWorkspace(partnerId, refCode)
  const idx = ws.students.findIndex((s) => s.id === studentId)
  if (idx === -1) return { ok: false, msg: '学员不存在' }
  for (const c of ws.classes || []) {
    c.studentIds = (c.studentIds || []).filter((id) => id !== studentId)
  }
  ws.students.splice(idx, 1)
  saveWorkspace(partnerId, ws)
  return { ok: true, ws }
}

/** 演示：总部向加盟商账户充值（正式环境由总部后台完成） */
export function demoTopUpBalance(partnerId, refCode, amount) {
  const ws = getWorkspace(partnerId, refCode)
  const amt = Number(amount)
  if (!(amt > 0)) return { ok: false, msg: '请输入大于 0 的金额' }
  ws.balance = Math.round((ws.balance + amt) * 100) / 100
  ws.ledger.unshift({
    id: `l-top-${Date.now()}`,
    type: 'topup',
    title: '总部账户充值（演示）',
    amount: amt,
    balanceAfter: ws.balance,
    createdAt: new Date().toISOString(),
  })
  saveWorkspace(partnerId, ws)
  return { ok: true, ws }
}

/**
 * 教具采购下单（演示）：购物车行 [{ productId, qty }]；支付方式 balance | wechat。
 * 余额支付扣减余额并记流水；微信支付仅模拟成功，不扣余额。
 */
export function purchaseTeachingMaterials(partnerId, refCode, cartLines, payMethod) {
  const ws = getWorkspace(partnerId, refCode)
  if (!['balance', 'wechat'].includes(payMethod)) return { ok: false, msg: '请选择支付方式' }
  if (!Array.isArray(cartLines) || cartLines.length === 0) return { ok: false, msg: '请先选择商品数量' }

  const lines = []
  let total = 0
  for (const row of cartLines) {
    const qty = Math.max(1, parseInt(String(row.qty), 10) || 1)
    const p = FRANCHISE_TEACHING_PRODUCTS.find((x) => x.id === row.productId)
    if (!p) return { ok: false, msg: '商品不存在或已下架' }
    const lineTotal = Math.round(p.price * qty * 100) / 100
    total += lineTotal
    lines.push({
      productId: p.id,
      name: p.name,
      qty,
      unitPrice: p.price,
      lineTotal,
    })
  }
  total = Math.round(total * 100) / 100
  if (!(total > 0)) return { ok: false, msg: '订单金额无效' }

  if (payMethod === 'balance') {
    if (ws.balance < total) return { ok: false, msg: `账户余额不足（需 ¥${total.toFixed(2)}），可先前往余额中心充值或使用微信支付（演示）` }
    ws.balance = Math.round((ws.balance - total) * 100) / 100
    const titleHint = lines.length === 1 ? lines[0].name : `${lines[0].name} 等 ${lines.length} 项`
    ws.ledger.unshift({
      id: `l-mat-${Date.now()}`,
      type: 'material_purchase',
      title: `教具采购 · ${titleHint}`,
      amount: -total,
      balanceAfter: ws.balance,
      createdAt: new Date().toISOString(),
    })
  }

  const seq = (ws.materialOrders || []).filter((o) => /^MJ\d+$/.test(o.id)).length + 1
  const id = `MJ${new Date().toISOString().slice(0, 10).replace(/-/g, '')}${String(seq).padStart(3, '0')}`
  const now = new Date().toISOString()
  const payLabel = payMethod === 'wechat' ? '微信支付（演示已到账）' : '已从账户余额扣款'
  const order = {
    id,
    items: lines,
    payAmount: total,
    payMethod,
    status: '待发货',
    createdAt: now,
    receiverSnapshot: '机构默认收货地址（演示未采集门牌；正式环境同步资质登记地址）',
    shipments: [
      {
        at: now,
        carrier: '',
        trackingNo: '',
        status: '待发货',
        remark: `${payLabel}，仓库处理中`,
      },
    ],
  }
  if (!ws.materialOrders) ws.materialOrders = []
  ws.materialOrders.unshift(order)
  saveWorkspace(partnerId, ws)
  return { ok: true, ws, orderId: id }
}
