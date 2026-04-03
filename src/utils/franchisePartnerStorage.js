/**
 * 加盟商工作台演示数据（localStorage，单机模拟）
 * 生产环境应替换为后端 API：推广归因、订单分账、提现审核、班级/学员同步等。
 */
const SESSION_KEY = 'bingo_franchise_partner_session_v1'

const workspaceKey = (partnerId) => `bingo_franchise_workspace_${partnerId}`

function safeParse(json, fallback) {
  try {
    return JSON.parse(json)
  } catch {
    return fallback
  }
}

/** 可推广课程（与站点课程 id 对齐，便于带上 ?ref= 参数） */
export const FRANCHISE_PROMOTABLE_COURSES = [
  { id: 'ai-enlighten', name: '《AI启蒙：走进智能世界》', price: 299, commissionRate: 0.15 },
  { id: 'ai-advance-basic', name: '《AI基础原理与应用》', price: 698, commissionRate: 0.12 },
  { id: 'ai-advance-ml', name: '《机器学习入门与实战》', price: 698, commissionRate: 0.12 },
  { id: 'ai-programming', name: 'AI编程入门课', price: 399, commissionRate: 0.15 },
]

export function getPartnerSession() {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) return null
  const s = safeParse(raw, null)
  if (!s?.partnerId) return null
  return s
}

export function setPartnerSession(payload) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(payload))
}

export function clearPartnerSession() {
  localStorage.removeItem(SESSION_KEY)
}

function defaultWorkspace(partnerId, refCode) {
  return {
    partnerId,
    refCode,
    balance: 1280.5,
    frozen: 200,
    orders: [
      {
        id: 'ord-demo-1',
        courseId: 'ai-enlighten',
        courseName: '《AI启蒙：走进智能世界》',
        buyerMask: '138****8000',
        payAmount: 299,
        commission: 44.85,
        status: '已结算',
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      {
        id: 'ord-demo-2',
        courseId: 'ai-advance-basic',
        courseName: '《AI基础原理与应用》',
        buyerMask: '139****6123',
        payAmount: 698,
        commission: 83.76,
        status: '待结算',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
    ledger: [
      {
        id: 'l1',
        type: 'commission',
        title: '推广订单分佣 · ord-demo-1',
        amount: 44.85,
        balanceAfter: 1280.5,
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
      {
        id: 'l2',
        type: 'withdraw',
        title: '提现出账',
        amount: -500,
        balanceAfter: 1235.65,
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
      },
    ],
    withdrawals: [
      {
        id: 'w1',
        amount: 500,
        status: '已完成',
        bankInfo: '招商银行尾号 6288',
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        reviewedAt: new Date(Date.now() - 86400000 * 9).toISOString(),
      },
      {
        id: 'w2',
        amount: 300,
        status: '审核中',
        bankInfo: '招商银行尾号 6288',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        reviewedAt: null,
      },
    ],
    classes: [
      {
        id: 'cls-1',
        name: '周六上午 AI 启蒙班',
        studentIds: ['stu-1', 'stu-2'],
        createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
      },
      {
        id: 'cls-2',
        name: '暑期竞赛冲刺班',
        studentIds: ['stu-3'],
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
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
            purchasedAt: new Date(Date.now() - 86400000 * 21).toISOString(),
            lastStudyAt: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            courseId: 'ai-programming',
            progressPct: 12,
            status: '学习中',
            purchasedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
            lastStudyAt: new Date(Date.now() - 86400000 * 2).toISOString(),
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
            purchasedAt: new Date(Date.now() - 86400000 * 45).toISOString(),
            lastStudyAt: new Date(Date.now() - 86400000).toISOString(),
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
            purchasedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
            lastStudyAt: new Date(Date.now() - 7200000).toISOString(),
          },
        ],
      },
    ],
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
  if (normalizeEnrollments(ws)) saveWorkspace(partnerId, ws)
  return ws
}

export function saveWorkspace(partnerId, data) {
  localStorage.setItem(workspaceKey(partnerId), JSON.stringify(data))
}

export function buildPromoteLink(origin, courseId, refCode) {
  const base = (origin || '').replace(/\/$/, '') || ''
  return `${base}/courses/detail/${courseId}?ref=${encodeURIComponent(refCode)}`
}

export function appendDemoOrder(partnerId, refCode, courseId) {
  const ws = getWorkspace(partnerId, refCode)
  const course = FRANCHISE_PROMOTABLE_COURSES.find((c) => c.id === courseId)
  if (!course) return ws
  const commission = Math.round(course.price * course.commissionRate * 100) / 100
  const order = {
    id: `ord-${Date.now()}`,
    courseId: course.id,
    courseName: course.name,
    buyerMask: '用户****' + String(Math.floor(Math.random() * 10000)).padStart(4, '0'),
    payAmount: course.price,
    commission,
    status: '已结算',
    createdAt: new Date().toISOString(),
  }
  ws.orders = [order, ...ws.orders]
  ws.balance = Math.round((ws.balance + commission) * 100) / 100
  ws.ledger.unshift({
    id: `l-${Date.now()}`,
    type: 'commission',
    title: `推广订单分佣 · ${order.id}`,
    amount: commission,
    balanceAfter: ws.balance,
    createdAt: new Date().toISOString(),
  })
  saveWorkspace(partnerId, ws)
  return ws
}

export function createClass(partnerId, refCode, name) {
  const ws = getWorkspace(partnerId, refCode)
  const id = `cls-${Date.now()}`
  ws.classes.push({ id, name: name.trim(), studentIds: [], createdAt: new Date().toISOString() })
  saveWorkspace(partnerId, ws)
  return ws
}

/**
 * 删除班级：班级记录移除；原班级学员 classId 置空（未分班），学员与选课数据保留。
 */
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

export function addStudentToClass(partnerId, refCode, classId, phone, name) {
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
      enrollments: [
        {
          courseId: 'ai-enlighten',
          progressPct: 0,
          status: '未开始',
          purchasedAt: new Date().toISOString(),
          lastStudyAt: null,
        },
      ],
    }
    ws.students.push(stu)
  } else {
    stu.classId = classId
    if (name?.trim()) stu.name = name.trim()
  }
  const cls = ws.classes.find((c) => c.id === classId)
  if (cls && !cls.studentIds.includes(stu.id)) cls.studentIds.push(stu.id)
  saveWorkspace(partnerId, ws)
  return { ok: true, ws }
}

export function submitWithdrawal(partnerId, refCode, amount, bankNote) {
  const ws = getWorkspace(partnerId, refCode)
  const amt = Number(amount)
  if (!(amt > 0) || amt > ws.balance) return { ok: false, msg: '提现金额无效或超过可提余额' }
  ws.balance = Math.round((ws.balance - amt) * 100) / 100
  const w = {
    id: `w-${Date.now()}`,
    amount: amt,
    status: '审核中',
    bankInfo: bankNote || '默认收款账户',
    createdAt: new Date().toISOString(),
    reviewedAt: null,
  }
  ws.withdrawals.unshift(w)
  ws.ledger.unshift({
    id: `l-w-${Date.now()}`,
    type: 'withdraw_apply',
    title: '提现申请冻结（演示）',
    amount: -amt,
    balanceAfter: ws.balance,
    createdAt: new Date().toISOString(),
  })
  saveWorkspace(partnerId, ws)
  return { ok: true, ws }
}
