/**
 * 学校端管理后台演示数据（localStorage，单机模拟）
 * 所有数据访问集中在本模块，便于后端就绪后整体替换为接口调用。
 *
 * 数据隔离说明：真实的 school_id 强制过滤必须由服务端实现；
 * 此处按当前会话在前端模拟，仅用于跑通业务闭环与交互验证。
 */

const DB_KEY = 'bingo_school_admin_db_v1'
const SESSION_KEY = 'bingo_school_admin_session_v1'
export const SCHOOL_SESSION_EVENT = 'bingo-school-admin-session-changed'
export const SCHOOL_DB_EVENT = 'bingo-school-admin-db-changed'

/** 学校登录入口（通用链接，不携带学校标识，避免对外暴露可枚举 ID） */
export const SCHOOL_LOGIN_PATH = '/school/login'

export const SCHOOL_ROLE = { OWNER: 'owner', TEACHER: 'teacher' }
export const SCHOOL_STATUS = { ACTIVE: 'active', DISABLED: 'disabled' }
export const ACCOUNT_STATUS = { ACTIVE: 'active', DISABLED: 'disabled' }
/** 学生在校归属状态 */
export const ENROLL_STATUS = { ACTIVE: 'active', SUSPENDED: 'suspended', REMOVED: 'removed' }
export const CLASS_STATUS = {
  PENDING: '未开课',
  ONGOING: '进行中',
  ENDED: '已结课',
  DISABLED: '已停用',
}
export const CERT_SOURCE = { AUTO: 'auto', MANUAL: 'manual' }
export const CERT_REQUEST_STATUS = { PENDING: 'pending', APPROVED: 'approved', REJECTED: 'rejected' }
export const STUDENT_SOURCE = { MANUAL: 'manual', IMPORT: 'import', SITE: 'site' }

/** 平台已上架课程库（与站点课程 id 对齐；后端就绪后由课程接口提供） */
export const SCHOOL_COURSE_CATALOG = [
  { id: 'ai-enlighten', name: '《AI启蒙：走进智能世界》', totalLessons: 12 },
  { id: 'ai-advance-basic', name: '《AI基础原理与应用》', totalLessons: 16 },
  { id: 'ai-advance-ml', name: '《机器学习入门与实战》', totalLessons: 16 },
  { id: 'ai-programming', name: 'AI编程入门课', totalLessons: 10 },
]

export function getCourseName(courseId) {
  return SCHOOL_COURSE_CATALOG.find((c) => c.id === courseId)?.name || courseId || '—'
}

export function getCourseTotalLessons(courseId) {
  return SCHOOL_COURSE_CATALOG.find((c) => c.id === courseId)?.totalLessons || 0
}

function safeParse(json, fallback) {
  try {
    return JSON.parse(json)
  } catch {
    return fallback
  }
}

let seq = 0
function uid(prefix) {
  seq += 1
  return `${prefix}_${Date.now().toString(36)}${seq.toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

export function normalizePhone(raw) {
  const d = String(raw || '').replace(/\D/g, '')
  if (d.startsWith('86') && d.length === 13 && /^1\d{10}$/.test(d.slice(2))) return d.slice(2)
  return d
}

export function isValidPhone(raw) {
  return /^1\d{10}$/.test(normalizePhone(raw))
}

export function maskPhone(phone) {
  const p = normalizePhone(phone)
  if (p.length >= 7) return `${p.slice(0, 3)}****${p.slice(-4)}`
  return p ? '****' : '—'
}

export function todayStr(d) {
  const x = d ? new Date(d) : new Date()
  const m = String(x.getMonth() + 1).padStart(2, '0')
  const day = String(x.getDate()).padStart(2, '0')
  return `${x.getFullYear()}-${m}-${day}`
}

export function fmtDateTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

function emptyDb() {
  return {
    schools: [],
    accounts: [],
    courseGrants: [],
    classes: [],
    students: [],
    enrollments: [],
    classStudents: [],
    progress: [],
    certificates: [],
    certRequests: [],
    logs: [],
  }
}

function notify(eventName) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(eventName))
}

export function readDb() {
  if (typeof window === 'undefined') return emptyDb()
  const raw = localStorage.getItem(DB_KEY)
  if (!raw) {
    const seeded = buildSeedDb()
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(seeded))
    } catch {
      /* 存储不可用时退化为内存数据 */
    }
    return seeded
  }
  const parsed = safeParse(raw, null)
  if (!parsed || typeof parsed !== 'object') return emptyDb()
  return { ...emptyDb(), ...parsed }
}

function writeDb(db) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db))
  } catch (e) {
    console.error(e)
    throw new Error('无法保存数据：浏览器可能禁止本地存储或空间已满')
  }
  notify(SCHOOL_DB_EVENT)
}

function mutate(fn) {
  const db = readDb()
  const result = fn(db)
  writeDb(db)
  return result
}

/** 重置演示数据（便于回归验证） */
export function resetSchoolAdminDemoData() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(SESSION_KEY)
  writeDb(buildSeedDb())
  notify(SCHOOL_SESSION_EVENT)
}

/* ============================== 操作日志 ============================== */

export function appendLog(db, entry) {
  db.logs.unshift({
    id: uid('log'),
    at: new Date().toISOString(),
    ...entry,
  })
  if (db.logs.length > 500) db.logs.length = 500
}

export function listLogs(filter = {}) {
  const db = readDb()
  return db.logs.filter((l) => {
    if (filter.schoolId && l.schoolId !== filter.schoolId) return false
    if (filter.action && l.action !== filter.action) return false
    return true
  })
}

/* ============================== 会话 ============================== */

export function getSchoolSession() {
  if (typeof window === 'undefined') return null
  const s = safeParse(localStorage.getItem(SESSION_KEY), null)
  if (!s?.accountId || !s?.schoolId) return null
  return s
}

export function setSchoolSession(payload) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(payload))
  } catch (e) {
    console.error(e)
    throw new Error('无法保存登录状态：浏览器可能禁止本地存储或空间已满')
  }
  notify(SCHOOL_SESSION_EVENT)
}

export function clearSchoolSession() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(SESSION_KEY)
  notify(SCHOOL_SESSION_EVENT)
}

/**
 * 登录校验：按手机号定位账号所属学校，不接受前端传入的学校 ID。
 */
export function verifySchoolLogin(phoneRaw, password) {
  const phone = normalizePhone(phoneRaw)
  if (!isValidPhone(phone)) return { ok: false, msg: '请输入 11 位手机号' }
  if (!String(password || '').trim()) return { ok: false, msg: '请输入密码' }

  const db = readDb()
  const account = db.accounts.find((a) => a.phone === phone)
  if (!account) return { ok: false, msg: '账号不存在，请联系学校管理员或平台运营核实' }
  if (account.password !== password) return { ok: false, msg: '密码错误，请重新输入' }
  if (account.status !== ACCOUNT_STATUS.ACTIVE) return { ok: false, msg: '该账号已被停用，无法登录' }

  const school = db.schools.find((s) => s.id === account.schoolId)
  if (!school) return { ok: false, msg: '账号所属学校不存在，请联系平台运营' }
  if (school.status !== SCHOOL_STATUS.ACTIVE) return { ok: false, msg: '该学校已被平台停用，暂无法登录' }

  return {
    ok: true,
    session: {
      accountId: account.id,
      schoolId: school.id,
      schoolName: school.name,
      role: account.role,
      name: account.name,
      phone: account.phone,
      loginAt: new Date().toISOString(),
    },
  }
}

/** 会话自检：账号/学校被停用后立即失效 */
export function validateSession(session) {
  if (!session) return { ok: false, msg: '' }
  const db = readDb()
  const account = db.accounts.find((a) => a.id === session.accountId)
  if (!account) return { ok: false, msg: '账号不存在或已被删除，请重新登录' }
  if (account.status !== ACCOUNT_STATUS.ACTIVE) return { ok: false, msg: '该账号已被停用，无法继续使用' }
  const school = db.schools.find((s) => s.id === account.schoolId)
  if (!school) return { ok: false, msg: '所属学校不存在，请联系平台运营' }
  if (school.status !== SCHOOL_STATUS.ACTIVE) return { ok: false, msg: '该学校已被平台停用，无法继续使用' }
  return { ok: true, account, school }
}

export function isOwner(session) {
  return session?.role === SCHOOL_ROLE.OWNER
}

export function changeOwnPassword(session, oldPwd, newPwd, confirmPwd) {
  if (!session) return { ok: false, msg: '登录状态已失效' }
  if (String(newPwd || '').length < 6) return { ok: false, msg: '新密码至少 6 位' }
  if (newPwd !== confirmPwd) return { ok: false, msg: '两次输入的新密码不一致' }
  return mutate((db) => {
    const acc = db.accounts.find((a) => a.id === session.accountId)
    if (!acc) return { ok: false, msg: '账号不存在' }
    if (acc.password !== oldPwd) return { ok: false, msg: '原密码错误' }
    acc.password = newPwd
    return { ok: true }
  })
}

/* ============================== 学校（官网后台） ============================== */

export function listSchools(filter = {}) {
  const db = readDb()
  const kw = String(filter.keyword || '').trim()
  const region = String(filter.region || '').trim()
  return db.schools
    .filter((s) => {
      if (filter.status && s.status !== filter.status) return false
      if (region && !`${s.province}${s.city}${s.district}`.includes(region)) return false
      if (kw) {
        const owner = db.accounts.find((a) => a.id === s.ownerAccountId)
        const hit = s.name.includes(kw) || (owner ? owner.phone.includes(normalizePhone(kw) || kw) : false)
        if (!hit) return false
      }
      return true
    })
    .map((s) => decorateSchool(db, s))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

function decorateSchool(db, school) {
  const owner = db.accounts.find((a) => a.id === school.ownerAccountId) || null
  const classCount = db.classes.filter((c) => c.schoolId === school.id).length
  const studentCount = db.enrollments.filter(
    (e) => e.schoolId === school.id && e.status !== ENROLL_STATUS.REMOVED
  ).length
  const teacherCount = db.accounts.filter(
    (a) => a.schoolId === school.id && a.role === SCHOOL_ROLE.TEACHER
  ).length
  const grantedCourseCount = db.courseGrants.filter((g) => g.schoolId === school.id).length
  return {
    ...school,
    region: [school.province, school.city, school.district].filter(Boolean).join(' / '),
    ownerName: owner?.name || '—',
    ownerPhone: owner?.phone || '—',
    classCount,
    studentCount,
    teacherCount,
    grantedCourseCount,
  }
}

export function getSchoolDetail(schoolId) {
  const db = readDb()
  const school = db.schools.find((s) => s.id === schoolId)
  if (!school) return null
  return decorateSchool(db, school)
}

export function createSchool(input, operator = '官网管理员') {
  const name = String(input?.name || '').trim()
  const phone = normalizePhone(input?.ownerPhone)
  const contactPhone = normalizePhone(input?.contactPhone)
  if (!name) return { ok: false, msg: '请填写学校名称' }
  if (!String(input?.province || '').trim() || !String(input?.city || '').trim() || !String(input?.district || '').trim()) {
    return { ok: false, msg: '请填写完整的省 / 市 / 区' }
  }
  if (!String(input?.address || '').trim()) return { ok: false, msg: '请填写详细地址' }
  if (!String(input?.contactName || '').trim()) return { ok: false, msg: '请填写联系人' }
  if (!isValidPhone(contactPhone)) return { ok: false, msg: '请填写正确的联系电话' }
  if (!isValidPhone(phone)) return { ok: false, msg: '请填写正确的管理员手机号' }
  if (String(input?.ownerPassword || '').length < 6) return { ok: false, msg: '初始密码至少 6 位' }

  return mutate((db) => {
    if (db.accounts.some((a) => a.phone === phone)) {
      return { ok: false, msg: '该手机号已被其他后台账号占用，请更换' }
    }
    const schoolId = uid('sch')
    const accountId = uid('acc')
    const now = new Date().toISOString()
    db.schools.push({
      id: schoolId,
      name,
      province: String(input.province).trim(),
      city: String(input.city).trim(),
      district: String(input.district).trim(),
      address: String(input.address).trim(),
      contactName: String(input.contactName).trim(),
      contactPhone,
      remark: String(input?.remark || '').trim(),
      status: SCHOOL_STATUS.ACTIVE,
      ownerAccountId: accountId,
      createdAt: now,
    })
    db.accounts.push({
      id: accountId,
      schoolId,
      name: String(input?.ownerName || '').trim() || '学校总管理员',
      phone,
      password: String(input.ownerPassword),
      role: SCHOOL_ROLE.OWNER,
      status: ACCOUNT_STATUS.ACTIVE,
      createdAt: now,
    })
    appendLog(db, {
      schoolId,
      action: 'school:create',
      operator,
      detail: `创建学校「${name}」并开通总管理员 ${maskPhone(phone)}`,
    })
    return { ok: true, schoolId, loginPath: SCHOOL_LOGIN_PATH }
  })
}

export function updateSchool(schoolId, input, operator = '官网管理员') {
  return mutate((db) => {
    const school = db.schools.find((s) => s.id === schoolId)
    if (!school) return { ok: false, msg: '学校不存在' }
    const name = String(input?.name || '').trim()
    if (!name) return { ok: false, msg: '请填写学校名称' }
    const contactPhone = normalizePhone(input?.contactPhone)
    if (!isValidPhone(contactPhone)) return { ok: false, msg: '请填写正确的联系电话' }
    Object.assign(school, {
      name,
      province: String(input?.province || '').trim(),
      city: String(input?.city || '').trim(),
      district: String(input?.district || '').trim(),
      address: String(input?.address || '').trim(),
      contactName: String(input?.contactName || '').trim(),
      contactPhone,
      remark: String(input?.remark || '').trim(),
    })
    appendLog(db, { schoolId, action: 'school:update', operator, detail: `编辑学校「${name}」资料` })
    return { ok: true }
  })
}

export function setSchoolStatus(schoolId, status, operator = '官网管理员') {
  return mutate((db) => {
    const school = db.schools.find((s) => s.id === schoolId)
    if (!school) return { ok: false, msg: '学校不存在' }
    school.status = status === SCHOOL_STATUS.DISABLED ? SCHOOL_STATUS.DISABLED : SCHOOL_STATUS.ACTIVE
    appendLog(db, {
      schoolId,
      action: 'school:status',
      operator,
      detail: `${school.status === SCHOOL_STATUS.ACTIVE ? '启用' : '停用'}学校「${school.name}」`,
    })
    return { ok: true }
  })
}

export function resetOwnerPassword(schoolId, newPassword, operator = '官网管理员') {
  if (String(newPassword || '').length < 6) return { ok: false, msg: '新密码至少 6 位' }
  return mutate((db) => {
    const school = db.schools.find((s) => s.id === schoolId)
    if (!school) return { ok: false, msg: '学校不存在' }
    const owner = db.accounts.find((a) => a.id === school.ownerAccountId)
    if (!owner) return { ok: false, msg: '总管理员账号不存在' }
    owner.password = String(newPassword)
    appendLog(db, {
      schoolId,
      action: 'school:reset-password',
      operator,
      detail: `重置学校「${school.name}」总管理员密码`,
    })
    return { ok: true }
  })
}

/* ============================== 课程授权 ============================== */

export function listGrantedCourseIds(schoolId) {
  return readDb()
    .courseGrants.filter((g) => g.schoolId === schoolId)
    .map((g) => g.courseId)
}

export function listGrantedCourses(schoolId) {
  const ids = new Set(listGrantedCourseIds(schoolId))
  return SCHOOL_COURSE_CATALOG.filter((c) => ids.has(c.id))
}

/**
 * 解除授权前置校验：课程若关联「进行中」或「未开课」班级则禁止解除。
 */
export function checkCourseRevokable(schoolId, courseId) {
  const db = readDb()
  const blocking = db.classes.filter((c) => {
    if (c.schoolId !== schoolId || c.courseId !== courseId) return false
    const st = deriveClassStatus(c)
    return st === CLASS_STATUS.ONGOING || st === CLASS_STATUS.PENDING
  })
  if (!blocking.length) return { ok: true }
  return {
    ok: false,
    msg: `该课程仍关联 ${blocking.length} 个进行中/未开课班级（${blocking
      .map((c) => c.name)
      .join('、')}），请先处理关联班级后再解除授权`,
  }
}

export function setCourseGrants(schoolId, courseIds, operator = '官网管理员') {
  const next = new Set((courseIds || []).filter((id) => SCHOOL_COURSE_CATALOG.some((c) => c.id === id)))
  const current = new Set(listGrantedCourseIds(schoolId))
  const removed = [...current].filter((id) => !next.has(id))
  for (const courseId of removed) {
    const check = checkCourseRevokable(schoolId, courseId)
    if (!check.ok) return check
  }
  return mutate((db) => {
    db.courseGrants = db.courseGrants.filter((g) => g.schoolId !== schoolId)
    const now = new Date().toISOString()
    for (const courseId of next) {
      db.courseGrants.push({ schoolId, courseId, grantedAt: now })
    }
    const school = db.schools.find((s) => s.id === schoolId)
    appendLog(db, {
      schoolId,
      action: 'school:course-grant',
      operator,
      detail: `更新学校「${school?.name || schoolId}」课程授权，共 ${next.size} 门`,
    })
    return { ok: true }
  })
}

/* ============================== 账号（总管理员 / 老师） ============================== */

export function listSchoolAccounts(schoolId) {
  const db = readDb()
  return db.accounts
    .filter((a) => a.schoolId === schoolId)
    .map((a) => ({
      ...a,
      classCount: db.classes.filter((c) => c.teacherAccountId === a.id).length,
    }))
    .sort((a, b) => {
      if (a.role !== b.role) return a.role === SCHOOL_ROLE.OWNER ? -1 : 1
      return a.createdAt < b.createdAt ? -1 : 1
    })
}

export function listTeacherAccounts(schoolId, opts = {}) {
  return listSchoolAccounts(schoolId).filter((a) => {
    if (a.role !== SCHOOL_ROLE.TEACHER) return false
    if (opts.activeOnly && a.status !== ACCOUNT_STATUS.ACTIVE) return false
    return true
  })
}

export function createTeacherAccount(session, input) {
  if (!isOwner(session)) return { ok: false, msg: '仅学校总管理员可创建老师账号' }
  const name = String(input?.name || '').trim()
  const phone = normalizePhone(input?.phone)
  if (!name) return { ok: false, msg: '请填写姓名' }
  if (!isValidPhone(phone)) return { ok: false, msg: '请填写正确的手机号' }
  if (String(input?.password || '').length < 6) return { ok: false, msg: '初始密码至少 6 位' }
  return mutate((db) => {
    if (db.accounts.some((a) => a.phone === phone)) {
      return { ok: false, msg: '该手机号已被其他账号占用' }
    }
    db.accounts.push({
      id: uid('acc'),
      schoolId: session.schoolId,
      name,
      phone,
      password: String(input.password),
      role: SCHOOL_ROLE.TEACHER,
      status: ACCOUNT_STATUS.ACTIVE,
      createdAt: new Date().toISOString(),
    })
    appendLog(db, {
      schoolId: session.schoolId,
      action: 'account:create',
      operator: session.name,
      detail: `新增老师账号 ${name}（${maskPhone(phone)}）`,
    })
    return { ok: true }
  })
}

export function updateTeacherAccount(session, accountId, input) {
  if (!isOwner(session)) return { ok: false, msg: '仅学校总管理员可编辑老师账号' }
  return mutate((db) => {
    const acc = db.accounts.find((a) => a.id === accountId && a.schoolId === session.schoolId)
    if (!acc) return { ok: false, msg: '账号不存在' }
    if (acc.role === SCHOOL_ROLE.OWNER) return { ok: false, msg: '总管理员账号不可在此编辑' }
    const name = String(input?.name || '').trim()
    if (!name) return { ok: false, msg: '请填写姓名' }
    acc.name = name
    if (String(input?.password || '').trim()) {
      if (String(input.password).length < 6) return { ok: false, msg: '新密码至少 6 位' }
      acc.password = String(input.password)
    }
    appendLog(db, {
      schoolId: session.schoolId,
      action: 'account:update',
      operator: session.name,
      detail: `编辑老师账号 ${name}`,
    })
    return { ok: true }
  })
}

export function setTeacherAccountStatus(session, accountId, status) {
  if (!isOwner(session)) return { ok: false, msg: '仅学校总管理员可停用/启用老师账号' }
  return mutate((db) => {
    const acc = db.accounts.find((a) => a.id === accountId && a.schoolId === session.schoolId)
    if (!acc) return { ok: false, msg: '账号不存在' }
    if (acc.role === SCHOOL_ROLE.OWNER) return { ok: false, msg: '总管理员账号不可停用' }
    acc.status = status === ACCOUNT_STATUS.DISABLED ? ACCOUNT_STATUS.DISABLED : ACCOUNT_STATUS.ACTIVE
    appendLog(db, {
      schoolId: session.schoolId,
      action: 'account:status',
      operator: session.name,
      detail: `${acc.status === ACCOUNT_STATUS.ACTIVE ? '启用' : '停用'}老师账号 ${acc.name}`,
    })
    return { ok: true }
  })
}

/** 删除老师账号：仅未关联任何班级时允许 */
export function deleteTeacherAccount(session, accountId) {
  if (!isOwner(session)) return { ok: false, msg: '仅学校总管理员可删除老师账号' }
  return mutate((db) => {
    const acc = db.accounts.find((a) => a.id === accountId && a.schoolId === session.schoolId)
    if (!acc) return { ok: false, msg: '账号不存在' }
    if (acc.role === SCHOOL_ROLE.OWNER) return { ok: false, msg: '总管理员账号不可删除' }
    const related = db.classes.filter((c) => c.teacherAccountId === accountId)
    if (related.length) {
      return { ok: false, msg: `该老师仍关联 ${related.length} 个班级，请先转移班级主讲后再删除` }
    }
    db.accounts = db.accounts.filter((a) => a.id !== accountId)
    appendLog(db, {
      schoolId: session.schoolId,
      action: 'account:delete',
      operator: session.name,
      detail: `删除老师账号 ${acc.name}`,
    })
    return { ok: true }
  })
}

/**
 * 批量导入老师账号。
 * @param rows 形如 [{ name, phone }]
 * @param mode skip=跳过重复 / update=更新已有档案
 */
export function importTeacherAccounts(session, rows, mode = 'skip', defaultPassword = 'school123') {
  if (!isOwner(session)) return { ok: false, msg: '仅学校总管理员可导入老师账号' }
  return mutate((db) => {
    let created = 0
    let updated = 0
    const failed = []
    rows.forEach((row, idx) => {
      const line = idx + 1
      const name = String(row?.name || '').trim()
      const phone = normalizePhone(row?.phone)
      if (!name) {
        failed.push({ line, name: row?.name || '', phone: row?.phone || '', reason: '姓名为空' })
        return
      }
      if (!isValidPhone(phone)) {
        failed.push({ line, name, phone: row?.phone || '', reason: '手机号格式不正确' })
        return
      }
      const exist = db.accounts.find((a) => a.phone === phone)
      if (exist) {
        if (exist.schoolId !== session.schoolId) {
          failed.push({ line, name, phone, reason: '手机号已被其他学校或平台账号占用' })
          return
        }
        if (mode === 'update') {
          exist.name = name
          updated += 1
        } else {
          failed.push({ line, name, phone, reason: '本校已存在该手机号（已跳过）' })
        }
        return
      }
      db.accounts.push({
        id: uid('acc'),
        schoolId: session.schoolId,
        name,
        phone,
        password: defaultPassword,
        role: SCHOOL_ROLE.TEACHER,
        status: ACCOUNT_STATUS.ACTIVE,
        createdAt: new Date().toISOString(),
      })
      created += 1
    })
    appendLog(db, {
      schoolId: session.schoolId,
      action: 'account:import',
      operator: session.name,
      detail: `导入老师账号：新增 ${created}、更新 ${updated}、失败 ${failed.length}`,
    })
    return { ok: true, created, updated, failed }
  })
}

/* ============================== 班级 ============================== */

export function deriveClassStatus(cls, now) {
  if (!cls) return CLASS_STATUS.PENDING
  if (cls.disabled) return CLASS_STATUS.DISABLED
  if (cls.endedManually) return CLASS_STATUS.ENDED
  const today = todayStr(now)
  if (cls.startDate && today < cls.startDate) return CLASS_STATUS.PENDING
  if (cls.endDate && today > cls.endDate) return CLASS_STATUS.ENDED
  return CLASS_STATUS.ONGOING
}

function classStudentIds(db, classId) {
  return db.classStudents.filter((cs) => cs.classId === classId && !cs.removedAt).map((cs) => cs.studentId)
}

function decorateClass(db, cls) {
  const teacher = db.accounts.find((a) => a.id === cls.teacherAccountId)
  const studentIds = classStudentIds(db, cls.id)
  const pendingRequest = db.certRequests.find(
    (r) => r.classId === cls.id && r.status === CERT_REQUEST_STATUS.PENDING
  )
  const lastRequest = db.certRequests
    .filter((r) => r.classId === cls.id)
    .sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1))[0]
  return {
    ...cls,
    status: deriveClassStatus(cls),
    courseName: getCourseName(cls.courseId),
    teacherName: teacher?.name || '—',
    teacherPhone: teacher?.phone || '',
    teacherStatus: teacher?.status || ACCOUNT_STATUS.DISABLED,
    studentCount: studentIds.length,
    certRequestStatus: lastRequest?.status || null,
    certRequestRejectReason: lastRequest?.status === CERT_REQUEST_STATUS.REJECTED ? lastRequest.rejectReason : '',
    hasPendingCertRequest: Boolean(pendingRequest),
  }
}

/**
 * 班级列表：按会话学校过滤；老师角色再按本人主讲班级二次收窄。
 */
export function listClasses(session, filter = {}) {
  if (!session) return []
  const db = readDb()
  return db.classes
    .filter((c) => c.schoolId === session.schoolId)
    .filter((c) => (isOwner(session) ? true : c.teacherAccountId === session.accountId))
    .filter((c) => {
      if (filter.courseId && c.courseId !== filter.courseId) return false
      if (filter.teacherAccountId && c.teacherAccountId !== filter.teacherAccountId) return false
      if (filter.classId && c.id !== filter.classId) return false
      const kw = String(filter.keyword || '').trim()
      if (kw && !c.name.includes(kw) && !String(c.code || '').includes(kw)) return false
      const decorated = deriveClassStatus(c)
      if (filter.status && decorated !== filter.status) return false
      return true
    })
    .map((c) => decorateClass(db, c))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

export function getClassDetail(session, classId) {
  if (!session) return null
  const db = readDb()
  const cls = db.classes.find((c) => c.id === classId && c.schoolId === session.schoolId)
  if (!cls) return null
  if (!isOwner(session) && cls.teacherAccountId !== session.accountId) return null
  return decorateClass(db, cls)
}

export function createClass(session, input) {
  if (!session) return { ok: false, msg: '登录状态已失效' }
  const name = String(input?.name || '').trim()
  if (!name) return { ok: false, msg: '请填写班级名称' }
  const courseId = String(input?.courseId || '')
  if (!courseId) return { ok: false, msg: '请选择课程' }
  if (!listGrantedCourseIds(session.schoolId).includes(courseId)) {
    return { ok: false, msg: '该课程未授权给本校，无法创建班级' }
  }
  const startDate = String(input?.startDate || '').trim()
  const endDate = String(input?.endDate || '').trim()
  if (!startDate) return { ok: false, msg: '请选择开课日期' }
  if (endDate && endDate < startDate) return { ok: false, msg: '结课日期不能早于开课日期' }

  // 老师只能把自己设为主讲；总管理员可指定任意启用状态的老师
  const teacherAccountId = isOwner(session)
    ? String(input?.teacherAccountId || '')
    : session.accountId
  if (!teacherAccountId) return { ok: false, msg: '请选择主讲老师' }

  return mutate((db) => {
    const teacher = db.accounts.find((a) => a.id === teacherAccountId && a.schoolId === session.schoolId)
    if (!teacher) return { ok: false, msg: '主讲老师不存在' }
    if (teacher.status !== ACCOUNT_STATUS.ACTIVE) return { ok: false, msg: '该老师已停用，不可被分配为主讲' }
    const id = uid('cls')
    db.classes.push({
      id,
      schoolId: session.schoolId,
      name,
      code: String(input?.code || '').trim() || `C${Date.now().toString(36).toUpperCase().slice(-6)}`,
      courseId,
      teacherAccountId,
      startDate,
      endDate,
      remark: String(input?.remark || '').trim(),
      disabled: false,
      endedManually: false,
      createdAt: new Date().toISOString(),
    })
    appendLog(db, {
      schoolId: session.schoolId,
      action: 'class:create',
      operator: session.name,
      detail: `创建班级「${name}」（课程：${getCourseName(courseId)}，主讲：${teacher.name}）`,
    })
    return { ok: true, classId: id }
  })
}

export function updateClass(session, classId, input) {
  if (!session) return { ok: false, msg: '登录状态已失效' }
  return mutate((db) => {
    const cls = db.classes.find((c) => c.id === classId && c.schoolId === session.schoolId)
    if (!cls) return { ok: false, msg: '班级不存在' }
    if (!isOwner(session) && cls.teacherAccountId !== session.accountId) {
      return { ok: false, msg: '仅可编辑本人主讲的班级' }
    }
    const status = deriveClassStatus(cls)
    const name = String(input?.name || '').trim()
    if (!name) return { ok: false, msg: '请填写班级名称' }

    if (input?.courseId && input.courseId !== cls.courseId) {
      if (status === CLASS_STATUS.ENDED) return { ok: false, msg: '已结课班级不可变更课程' }
      if (!listGrantedCourseIds(session.schoolId).includes(input.courseId)) {
        return { ok: false, msg: '该课程未授权给本校' }
      }
      cls.courseId = input.courseId
    }

    // 转移主讲老师：仅总管理员可改，历史学习记录不变
    if (isOwner(session) && input?.teacherAccountId && input.teacherAccountId !== cls.teacherAccountId) {
      const next = db.accounts.find((a) => a.id === input.teacherAccountId && a.schoolId === session.schoolId)
      if (!next) return { ok: false, msg: '目标老师不存在' }
      if (next.status !== ACCOUNT_STATUS.ACTIVE) return { ok: false, msg: '该老师已停用，不可被分配为主讲' }
      const prev = db.accounts.find((a) => a.id === cls.teacherAccountId)
      cls.teacherAccountId = next.id
      appendLog(db, {
        schoolId: session.schoolId,
        action: 'class:transfer-teacher',
        operator: session.name,
        detail: `班级「${cls.name}」主讲由 ${prev?.name || '—'} 转移至 ${next.name}`,
      })
    }

    const startDate = String(input?.startDate || cls.startDate || '').trim()
    const endDate = String(input?.endDate ?? cls.endDate ?? '').trim()
    if (endDate && startDate && endDate < startDate) return { ok: false, msg: '结课日期不能早于开课日期' }
    Object.assign(cls, {
      name,
      code: String(input?.code || cls.code || '').trim(),
      startDate,
      endDate,
      remark: String(input?.remark ?? cls.remark ?? '').trim(),
    })
    appendLog(db, {
      schoolId: session.schoolId,
      action: 'class:update',
      operator: session.name,
      detail: `编辑班级「${name}」`,
    })
    return { ok: true }
  })
}

/** 删除班级：仅「未录入学生且未开课」时允许 */
export function deleteClass(session, classId) {
  if (!session) return { ok: false, msg: '登录状态已失效' }
  return mutate((db) => {
    const cls = db.classes.find((c) => c.id === classId && c.schoolId === session.schoolId)
    if (!cls) return { ok: false, msg: '班级不存在' }
    if (!isOwner(session) && cls.teacherAccountId !== session.accountId) {
      return { ok: false, msg: '仅可删除本人主讲的班级' }
    }
    if (deriveClassStatus(cls) !== CLASS_STATUS.PENDING) {
      return { ok: false, msg: '仅未开课班级可删除，其他班级请使用停用或结课' }
    }
    if (classStudentIds(db, classId).length) {
      return { ok: false, msg: '该班级已录入学生，不可删除，请改用停用' }
    }
    db.classes = db.classes.filter((c) => c.id !== classId)
    db.classStudents = db.classStudents.filter((cs) => cs.classId !== classId)
    appendLog(db, {
      schoolId: session.schoolId,
      action: 'class:delete',
      operator: session.name,
      detail: `删除班级「${cls.name}」`,
    })
    return { ok: true }
  })
}

export function setClassDisabled(session, classId, disabled) {
  if (!session) return { ok: false, msg: '登录状态已失效' }
  return mutate((db) => {
    const cls = db.classes.find((c) => c.id === classId && c.schoolId === session.schoolId)
    if (!cls) return { ok: false, msg: '班级不存在' }
    if (!isOwner(session) && cls.teacherAccountId !== session.accountId) {
      return { ok: false, msg: '仅可操作本人主讲的班级' }
    }
    cls.disabled = Boolean(disabled)
    appendLog(db, {
      schoolId: session.schoolId,
      action: 'class:status',
      operator: session.name,
      detail: `${cls.disabled ? '停用' : '恢复'}班级「${cls.name}」`,
    })
    return { ok: true }
  })
}

/** 手动结课（不发证；发证须走平台审核） */
export function endClassManually(session, classId) {
  if (!session) return { ok: false, msg: '登录状态已失效' }
  return mutate((db) => {
    const cls = db.classes.find((c) => c.id === classId && c.schoolId === session.schoolId)
    if (!cls) return { ok: false, msg: '班级不存在' }
    if (!isOwner(session) && cls.teacherAccountId !== session.accountId) {
      return { ok: false, msg: '仅可操作本人主讲的班级' }
    }
    cls.endedManually = true
    if (!cls.endDate) cls.endDate = todayStr()
    appendLog(db, {
      schoolId: session.schoolId,
      action: 'class:end',
      operator: session.name,
      detail: `班级「${cls.name}」标记为已结课`,
    })
    return { ok: true }
  })
}

/* ============================== 班级学生关系 ============================== */

export function listClassStudents(session, classId) {
  if (!session) return []
  const db = readDb()
  const cls = db.classes.find((c) => c.id === classId && c.schoolId === session.schoolId)
  if (!cls) return []
  if (!isOwner(session) && cls.teacherAccountId !== session.accountId) return []
  return classStudentIds(db, classId)
    .map((sid) => {
      const stu = db.students.find((s) => s.id === sid)
      if (!stu) return null
      const pr = db.progress.find((p) => p.studentId === sid && p.classId === classId)
      const cert = db.certificates.find((c) => c.studentId === sid && c.classId === classId)
      return {
        ...stu,
        progressPct: pr?.progressPct ?? 0,
        realProgress: pr?.realProgress ?? 0,
        lessonsDone: pr?.lessonsDone ?? 0,
        studyMinutes: pr?.studyMinutes ?? 0,
        lastStudyAt: pr?.lastStudyAt || '',
        certificate: cert || null,
      }
    })
    .filter(Boolean)
}

export function addStudentsToClass(session, classId, studentIds) {
  if (!session) return { ok: false, msg: '登录状态已失效' }
  return mutate((db) => {
    const cls = db.classes.find((c) => c.id === classId && c.schoolId === session.schoolId)
    if (!cls) return { ok: false, msg: '班级不存在' }
    if (!isOwner(session) && cls.teacherAccountId !== session.accountId) {
      return { ok: false, msg: '仅可操作本人主讲的班级' }
    }
    if (deriveClassStatus(cls) === CLASS_STATUS.ENDED) {
      return { ok: false, msg: '已结课班级不可新增学生' }
    }
    let added = 0
    for (const sid of studentIds || []) {
      const enrolled = db.enrollments.find(
        (e) => e.studentId === sid && e.schoolId === session.schoolId && e.status !== ENROLL_STATUS.REMOVED
      )
      if (!enrolled) continue
      const exist = db.classStudents.find((cs) => cs.classId === classId && cs.studentId === sid && !cs.removedAt)
      if (exist) continue
      db.classStudents.push({
        id: uid('cs'),
        classId,
        studentId: sid,
        joinedAt: new Date().toISOString(),
        removedAt: null,
      })
      // 加入班级即授予该班课程学习权限，同时建立进度记录
      const hasProgress = db.progress.some((p) => p.studentId === sid && p.classId === classId)
      if (!hasProgress) {
        db.progress.push({
          id: uid('pg'),
          studentId: sid,
          schoolId: session.schoolId,
          classId,
          courseId: cls.courseId,
          progressPct: 0,
          realProgress: 0,
          lessonsDone: 0,
          studyMinutes: 0,
          lastStudyAt: '',
        })
      }
      added += 1
    }
    appendLog(db, {
      schoolId: session.schoolId,
      action: 'class:add-students',
      operator: session.name,
      detail: `班级「${cls.name}」新增 ${added} 名学生`,
    })
    return { ok: true, added }
  })
}

/**
 * 移出班级：保留历史学习记录，停止该班带来的学习入口。
 * 若学生仍在其他同课程班级，课程权限不受影响。
 */
export function removeStudentFromClass(session, classId, studentId) {
  if (!session) return { ok: false, msg: '登录状态已失效' }
  return mutate((db) => {
    const cls = db.classes.find((c) => c.id === classId && c.schoolId === session.schoolId)
    if (!cls) return { ok: false, msg: '班级不存在' }
    if (!isOwner(session) && cls.teacherAccountId !== session.accountId) {
      return { ok: false, msg: '仅可操作本人主讲的班级' }
    }
    const rel = db.classStudents.find((cs) => cs.classId === classId && cs.studentId === studentId && !cs.removedAt)
    if (!rel) return { ok: false, msg: '该学生不在此班级' }
    rel.removedAt = new Date().toISOString()
    const stu = db.students.find((s) => s.id === studentId)
    appendLog(db, {
      schoolId: session.schoolId,
      action: 'class:remove-student',
      operator: session.name,
      detail: `班级「${cls.name}」移出学生 ${stu?.name || studentId}（保留历史学习记录）`,
    })
    return { ok: true }
  })
}

/* ============================== 学生 ============================== */

function studentClassesOf(db, studentId, schoolId) {
  const rels = db.classStudents.filter((cs) => cs.studentId === studentId && !cs.removedAt)
  return rels
    .map((r) => db.classes.find((c) => c.id === r.classId))
    .filter((c) => c && (!schoolId || c.schoolId === schoolId))
}

function decorateStudent(db, stu, session) {
  const enrollment = db.enrollments.find(
    (e) => e.studentId === stu.id && e.schoolId === session.schoolId && e.status !== ENROLL_STATUS.REMOVED
  )
  const classes = studentClassesOf(db, stu.id, session.schoolId)
  const certs = db.certificates.filter((c) => c.studentId === stu.id && c.schoolId === session.schoolId)
  const progressList = db.progress.filter((p) => p.studentId === stu.id && p.schoolId === session.schoolId)
  const avgReal = progressList.length
    ? Math.round(progressList.reduce((s, p) => s + (p.realProgress || 0), 0) / progressList.length)
    : 0
  const avgShown = progressList.length
    ? Math.round(progressList.reduce((s, p) => s + (p.progressPct || 0), 0) / progressList.length)
    : 0
  const lastStudyAt = progressList
    .map((p) => p.lastStudyAt)
    .filter(Boolean)
    .sort()
    .pop() || ''
  return {
    ...stu,
    enrollStatus: enrollment?.status || ENROLL_STATUS.REMOVED,
    enrollSource: enrollment?.source || STUDENT_SOURCE.MANUAL,
    classNames: classes.map((c) => c.name),
    classIds: classes.map((c) => c.id),
    certificateCount: certs.length,
    avgProgress: avgShown,
    avgRealProgress: avgReal,
    lastStudyAt,
  }
}

/**
 * 学生列表：按会话学校过滤；老师角色仅可见自己班级的学生。
 */
export function listStudents(session, filter = {}) {
  if (!session) return []
  const db = readDb()
  const schoolEnrollIds = new Set(
    db.enrollments
      .filter((e) => e.schoolId === session.schoolId && e.status !== ENROLL_STATUS.REMOVED)
      .map((e) => e.studentId)
  )
  let visibleIds = schoolEnrollIds
  if (!isOwner(session)) {
    const myClassIds = new Set(
      db.classes.filter((c) => c.schoolId === session.schoolId && c.teacherAccountId === session.accountId).map((c) => c.id)
    )
    const ids = new Set(
      db.classStudents.filter((cs) => myClassIds.has(cs.classId) && !cs.removedAt).map((cs) => cs.studentId)
    )
    visibleIds = new Set([...ids].filter((id) => schoolEnrollIds.has(id)))
  }
  const kw = String(filter.keyword || '').trim()
  return db.students
    .filter((s) => visibleIds.has(s.id))
    .filter((s) => {
      if (kw && !s.name.includes(kw) && !s.phone.includes(normalizePhone(kw) || kw)) return false
      if (filter.classId) {
        const inClass = db.classStudents.some(
          (cs) => cs.classId === filter.classId && cs.studentId === s.id && !cs.removedAt
        )
        if (!inClass) return false
      }
      return true
    })
    .map((s) => decorateStudent(db, s, session))
    .filter((s) => {
      if (filter.enrollStatus && s.enrollStatus !== filter.enrollStatus) return false
      return true
    })
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

/** 跨校查重：手机号是否已归属其他学校 */
export function findStudentSchoolByPhone(phoneRaw) {
  const phone = normalizePhone(phoneRaw)
  const db = readDb()
  const stu = db.students.find((s) => s.phone === phone)
  if (!stu) return { exists: false }
  const enrollment = db.enrollments.find((e) => e.studentId === stu.id && e.status !== ENROLL_STATUS.REMOVED)
  if (!enrollment) return { exists: true, studentId: stu.id, schoolId: null, schoolName: '' }
  const school = db.schools.find((s) => s.id === enrollment.schoolId)
  return {
    exists: true,
    studentId: stu.id,
    schoolId: enrollment.schoolId,
    schoolName: school?.name || '',
  }
}

export function createStudent(session, input) {
  if (!session) return { ok: false, msg: '登录状态已失效' }
  const name = String(input?.name || '').trim()
  const phone = normalizePhone(input?.phone)
  if (!name) return { ok: false, msg: '请填写学生姓名' }
  if (!isValidPhone(phone)) return { ok: false, msg: '请填写正确的手机号' }
  if (String(input?.password || '').length < 6) return { ok: false, msg: '初始密码至少 6 位' }

  return mutate((db) => {
    const existing = db.students.find((s) => s.phone === phone)
    if (existing) {
      const enrollment = db.enrollments.find(
        (e) => e.studentId === existing.id && e.status !== ENROLL_STATUS.REMOVED
      )
      if (enrollment && enrollment.schoolId !== session.schoolId) {
        const other = db.schools.find((s) => s.id === enrollment.schoolId)
        return {
          ok: false,
          msg: `该手机号已归属学校「${other?.name || '其他学校'}」，学校端不可自行转入，请联系平台运营执行转校`,
        }
      }
      if (enrollment && enrollment.schoolId === session.schoolId) {
        return { ok: false, msg: '本校已存在该学生，可直接在列表中管理或加入班级' }
      }
      db.enrollments.push({
        id: uid('enr'),
        schoolId: session.schoolId,
        studentId: existing.id,
        status: ENROLL_STATUS.ACTIVE,
        source: STUDENT_SOURCE.MANUAL,
        joinedAt: new Date().toISOString(),
        removedAt: null,
      })
      appendLog(db, {
        schoolId: session.schoolId,
        action: 'student:link',
        operator: session.name,
        detail: `关联已有学生账号 ${name}（${maskPhone(phone)}）`,
      })
      return { ok: true, studentId: existing.id, linked: true }
    }

    const id = uid('stu')
    const now = new Date().toISOString()
    db.students.push({
      id,
      name,
      phone,
      // 演示环境明文存储；生产必须由服务端加盐哈希
      password: String(input.password),
      gender: String(input?.gender || '').trim(),
      birthday: String(input?.birthday || '').trim(),
      status: ACCOUNT_STATUS.ACTIVE,
      siteUserSource: STUDENT_SOURCE.MANUAL,
      createdAt: now,
    })
    db.enrollments.push({
      id: uid('enr'),
      schoolId: session.schoolId,
      studentId: id,
      status: ENROLL_STATUS.ACTIVE,
      source: STUDENT_SOURCE.MANUAL,
      joinedAt: now,
      removedAt: null,
    })
    appendLog(db, {
      schoolId: session.schoolId,
      action: 'student:create',
      operator: session.name,
      detail: `新增学生 ${name}（${maskPhone(phone)}）并创建登录账号`,
    })
    return { ok: true, studentId: id }
  })
}

export function updateStudent(session, studentId, input) {
  if (!session) return { ok: false, msg: '登录状态已失效' }
  return mutate((db) => {
    const stu = db.students.find((s) => s.id === studentId)
    if (!stu) return { ok: false, msg: '学生不存在' }
    const enrolled = db.enrollments.some(
      (e) => e.studentId === studentId && e.schoolId === session.schoolId && e.status !== ENROLL_STATUS.REMOVED
    )
    if (!enrolled) return { ok: false, msg: '该学生不属于本校' }
    const name = String(input?.name || '').trim()
    if (!name) return { ok: false, msg: '请填写学生姓名' }
    Object.assign(stu, {
      name,
      gender: String(input?.gender ?? stu.gender ?? '').trim(),
      birthday: String(input?.birthday ?? stu.birthday ?? '').trim(),
    })
    if (String(input?.password || '').trim()) {
      if (String(input.password).length < 6) return { ok: false, msg: '新密码至少 6 位' }
      stu.password = String(input.password)
    }
    appendLog(db, {
      schoolId: session.schoolId,
      action: 'student:update',
      operator: session.name,
      detail: `编辑学生 ${name} 档案`,
    })
    return { ok: true }
  })
}

export function setStudentEnrollStatus(session, studentId, status) {
  if (!session) return { ok: false, msg: '登录状态已失效' }
  return mutate((db) => {
    const enrollment = db.enrollments.find(
      (e) => e.studentId === studentId && e.schoolId === session.schoolId && e.status !== ENROLL_STATUS.REMOVED
    )
    if (!enrollment) return { ok: false, msg: '该学生不属于本校' }
    enrollment.status = status === ENROLL_STATUS.SUSPENDED ? ENROLL_STATUS.SUSPENDED : ENROLL_STATUS.ACTIVE
    const stu = db.students.find((s) => s.id === studentId)
    appendLog(db, {
      schoolId: session.schoolId,
      action: 'student:status',
      operator: session.name,
      detail: `${enrollment.status === ENROLL_STATUS.ACTIVE ? '恢复' : '停用'}学生 ${stu?.name || studentId}`,
    })
    return { ok: true }
  })
}

/** 移出本校：保留历史数据，不删除账号 */
export function removeStudentFromSchool(session, studentId) {
  if (!session) return { ok: false, msg: '登录状态已失效' }
  return mutate((db) => {
    const enrollment = db.enrollments.find(
      (e) => e.studentId === studentId && e.schoolId === session.schoolId && e.status !== ENROLL_STATUS.REMOVED
    )
    if (!enrollment) return { ok: false, msg: '该学生不属于本校' }
    enrollment.status = ENROLL_STATUS.REMOVED
    enrollment.removedAt = new Date().toISOString()
    // 同步停止本校班级带来的学习入口
    const schoolClassIds = new Set(db.classes.filter((c) => c.schoolId === session.schoolId).map((c) => c.id))
    db.classStudents.forEach((cs) => {
      if (cs.studentId === studentId && schoolClassIds.has(cs.classId) && !cs.removedAt) {
        cs.removedAt = enrollment.removedAt
      }
    })
    const stu = db.students.find((s) => s.id === studentId)
    appendLog(db, {
      schoolId: session.schoolId,
      action: 'student:remove-school',
      operator: session.name,
      detail: `将学生 ${stu?.name || studentId} 移出本校（历史数据保留）`,
    })
    return { ok: true }
  })
}

/**
 * 批量导入学生。
 * @param rows [{ name, phone }]
 * @param mode skip=跳过重复 / update=更新已有档案
 */
export function importStudents(session, rows, mode = 'skip', defaultPassword = 'student123') {
  if (!session) return { ok: false, msg: '登录状态已失效' }
  return mutate((db) => {
    let created = 0
    let linked = 0
    let updated = 0
    const failed = []
    const now = new Date().toISOString()
    rows.forEach((row, idx) => {
      const line = idx + 1
      const name = String(row?.name || '').trim()
      const phone = normalizePhone(row?.phone)
      if (!name) {
        failed.push({ line, name: row?.name || '', phone: row?.phone || '', reason: '姓名为空' })
        return
      }
      if (!isValidPhone(phone)) {
        failed.push({ line, name, phone: row?.phone || '', reason: '手机号格式不正确' })
        return
      }
      const exist = db.students.find((s) => s.phone === phone)
      if (exist) {
        const enrollment = db.enrollments.find(
          (e) => e.studentId === exist.id && e.status !== ENROLL_STATUS.REMOVED
        )
        if (enrollment && enrollment.schoolId !== session.schoolId) {
          const other = db.schools.find((s) => s.id === enrollment.schoolId)
          failed.push({
            line,
            name,
            phone,
            reason: `已归属学校「${other?.name || '其他学校'}」，需由平台执行转校`,
          })
          return
        }
        if (enrollment && enrollment.schoolId === session.schoolId) {
          if (mode === 'update') {
            exist.name = name
            updated += 1
          } else {
            failed.push({ line, name, phone, reason: '本校已存在该学生（已跳过）' })
          }
          return
        }
        db.enrollments.push({
          id: uid('enr'),
          schoolId: session.schoolId,
          studentId: exist.id,
          status: ENROLL_STATUS.ACTIVE,
          source: STUDENT_SOURCE.IMPORT,
          joinedAt: now,
          removedAt: null,
        })
        linked += 1
        return
      }
      const id = uid('stu')
      db.students.push({
        id,
        name,
        phone,
        password: defaultPassword,
        gender: '',
        birthday: '',
        status: ACCOUNT_STATUS.ACTIVE,
        siteUserSource: STUDENT_SOURCE.IMPORT,
        createdAt: now,
      })
      db.enrollments.push({
        id: uid('enr'),
        schoolId: session.schoolId,
        studentId: id,
        status: ENROLL_STATUS.ACTIVE,
        source: STUDENT_SOURCE.IMPORT,
        joinedAt: now,
        removedAt: null,
      })
      created += 1
    })
    appendLog(db, {
      schoolId: session.schoolId,
      action: 'student:import',
      operator: session.name,
      detail: `导入学生：新增 ${created}、关联 ${linked}、更新 ${updated}、失败 ${failed.length}`,
    })
    return { ok: true, created, linked, updated, failed }
  })
}

/* ============================== 学习进度与档案 ============================== */

export function listStudentProgress(session, studentId, filter = {}) {
  if (!session) return []
  const db = readDb()
  const visibleClassIds = new Set(
    db.classes
      .filter((c) => c.schoolId === session.schoolId)
      .filter((c) => (isOwner(session) ? true : c.teacherAccountId === session.accountId))
      .map((c) => c.id)
  )
  return db.progress
    .filter((p) => p.studentId === studentId && visibleClassIds.has(p.classId))
    .filter((p) => (filter.courseId ? p.courseId === filter.courseId : true))
    .map((p) => {
      const cls = db.classes.find((c) => c.id === p.classId)
      const cert = db.certificates.find((c) => c.studentId === studentId && c.classId === p.classId)
      return {
        ...p,
        className: cls?.name || '—',
        classStatus: deriveClassStatus(cls),
        courseName: getCourseName(p.courseId),
        totalLessons: getCourseTotalLessons(p.courseId),
        certificate: cert || null,
      }
    })
}

export function getStudentProfile(session, studentId) {
  if (!session) return null
  const db = readDb()
  const stu = db.students.find((s) => s.id === studentId)
  if (!stu) return null
  const enrolled = db.enrollments.some(
    (e) => e.studentId === studentId && e.schoolId === session.schoolId && e.status !== ENROLL_STATUS.REMOVED
  )
  if (!enrolled) return null
  if (!isOwner(session)) {
    const myClassIds = new Set(
      db.classes
        .filter((c) => c.schoolId === session.schoolId && c.teacherAccountId === session.accountId)
        .map((c) => c.id)
    )
    const inMyClass = db.classStudents.some(
      (cs) => cs.studentId === studentId && myClassIds.has(cs.classId) && !cs.removedAt
    )
    if (!inMyClass) return null
  }
  return {
    ...decorateStudent(db, stu, session),
    progressList: listStudentProgress(session, studentId),
    certificates: db.certificates.filter((c) => c.studentId === studentId && c.schoolId === session.schoolId),
  }
}

/** 记录一次学习行为（供 C 端调用；自动达成条件时签发证书） */
export function recordStudyProgress(studentId, classId, patch = {}) {
  return mutate((db) => {
    const pr = db.progress.find((p) => p.studentId === studentId && p.classId === classId)
    if (!pr) return { ok: false, msg: '无该班级的学习记录' }
    const real = Math.max(0, Math.min(100, Number(patch.realProgress ?? pr.realProgress)))
    pr.realProgress = real
    // 手动结课已置 100% 的展示进度不因后续真实进度回落而降级
    pr.progressPct = Math.max(pr.progressPct || 0, real)
    if (patch.lessonsDone != null) pr.lessonsDone = Number(patch.lessonsDone)
    if (patch.studyMinutes != null) pr.studyMinutes = Number(patch.studyMinutes)
    pr.lastStudyAt = patch.lastStudyAt || new Date().toISOString()
    if (real >= 100 && patch.examPassed) {
      issueCertificateInternal(db, {
        studentId,
        classId,
        source: CERT_SOURCE.AUTO,
        operator: '系统自动',
      })
    }
    return { ok: true }
  })
}

/* ============================== 证书 ============================== */

function issueCertificateInternal(db, { studentId, classId, source, operator, approvedAt }) {
  const exist = db.certificates.find((c) => c.studentId === studentId && c.classId === classId)
  if (exist) return exist
  const cls = db.classes.find((c) => c.id === classId)
  if (!cls) return null
  const pr = db.progress.find((p) => p.studentId === studentId && p.classId === classId)
  const realProgress = pr?.realProgress ?? 0
  const issuedAt = approvedAt || new Date().toISOString()
  // 完成时间：有学习记录取最后实际学习时间；无记录（0%）取审核通过时间
  const completedAt = pr?.lastStudyAt || issuedAt
  const cert = {
    id: uid('cert'),
    studentId,
    schoolId: cls.schoolId,
    classId,
    courseId: cls.courseId,
    source,
    issuedAt,
    completedAt,
    progressSnapshot: realProgress,
    examPassed: true,
    operator,
  }
  db.certificates.push(cert)
  return cert
}

export function listCertificates(filter = {}) {
  const db = readDb()
  return db.certificates
    .filter((c) => {
      if (filter.schoolId && c.schoolId !== filter.schoolId) return false
      if (filter.studentId && c.studentId !== filter.studentId) return false
      if (filter.classId && c.classId !== filter.classId) return false
      return true
    })
    .map((c) => ({
      ...c,
      schoolName: db.schools.find((s) => s.id === c.schoolId)?.name || '—',
      courseName: getCourseName(c.courseId),
      studentName: db.students.find((s) => s.id === c.studentId)?.name || '—',
      className: db.classes.find((x) => x.id === c.classId)?.name || '—',
    }))
}

/* ============================== 结课发证申请与审核 ============================== */

export function submitCertRequest(session, classId, confirmText) {
  if (!session) return { ok: false, msg: '登录状态已失效' }
  const db0 = readDb()
  const cls0 = db0.classes.find((c) => c.id === classId && c.schoolId === session.schoolId)
  if (!cls0) return { ok: false, msg: '班级不存在' }
  if (!isOwner(session) && cls0.teacherAccountId !== session.accountId) {
    return { ok: false, msg: '仅可对本人主讲的班级提交申请' }
  }
  if (String(confirmText || '').trim() !== cls0.name) {
    return { ok: false, msg: '请准确输入班级名称以确认此操作' }
  }
  return mutate((db) => {
    const cls = db.classes.find((c) => c.id === classId)
    const pending = db.certRequests.find(
      (r) => r.classId === classId && r.status === CERT_REQUEST_STATUS.PENDING
    )
    if (pending) return { ok: false, msg: '该班级已有待审核的发证申请，请等待平台处理' }
    const studentIds = classStudentIds(db, classId)
    if (!studentIds.length) return { ok: false, msg: '该班级暂无学生，无法提交发证申请' }
    // 提交阶段不改动任何学生数据，仅记录申请快照
    const snapshot = studentIds.map((sid) => {
      const stu = db.students.find((s) => s.id === sid)
      const pr = db.progress.find((p) => p.studentId === sid && p.classId === classId)
      return {
        studentId: sid,
        studentName: stu?.name || '—',
        studentPhone: stu?.phone || '',
        realProgress: pr?.realProgress ?? 0,
        lastStudyAt: pr?.lastStudyAt || '',
      }
    })
    const school = db.schools.find((s) => s.id === session.schoolId)
    db.certRequests.push({
      id: uid('req'),
      schoolId: session.schoolId,
      schoolName: school?.name || '',
      classId,
      className: cls.name,
      courseId: cls.courseId,
      status: CERT_REQUEST_STATUS.PENDING,
      applicantAccountId: session.accountId,
      applicantName: session.name,
      applicantRole: session.role,
      studentCount: snapshot.length,
      students: snapshot,
      submittedAt: new Date().toISOString(),
      reviewedAt: null,
      reviewer: '',
      rejectReason: '',
    })
    appendLog(db, {
      schoolId: session.schoolId,
      action: 'cert-request:submit',
      operator: session.name,
      detail: `提交班级「${cls.name}」结课发证申请，涉及 ${snapshot.length} 名学生`,
    })
    return { ok: true }
  })
}

export function listCertRequests(filter = {}) {
  const db = readDb()
  return db.certRequests
    .filter((r) => {
      if (filter.status && r.status !== filter.status) return false
      if (filter.schoolId && r.schoolId !== filter.schoolId) return false
      if (filter.classId && r.classId !== filter.classId) return false
      return true
    })
    .map((r) => ({ ...r, courseName: getCourseName(r.courseId) }))
    .sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1))
}

/** 学校端查看本校申请（老师仅见自己班级） */
export function listCertRequestsForSession(session) {
  if (!session) return []
  const all = listCertRequests({ schoolId: session.schoolId })
  if (isOwner(session)) return all
  const db = readDb()
  const myClassIds = new Set(
    db.classes
      .filter((c) => c.schoolId === session.schoolId && c.teacherAccountId === session.accountId)
      .map((c) => c.id)
  )
  return all.filter((r) => myClassIds.has(r.classId))
}

/**
 * 审核通过：签发证书 + 展示进度置 100% + 视为考核通过。
 * realProgress 保留结课前真实进度，供看板统计与审计追溯。
 * 通过后不可撤销。
 */
export function approveCertRequest(requestId, reviewer = '平台运营') {
  return mutate((db) => {
    const req = db.certRequests.find((r) => r.id === requestId)
    if (!req) return { ok: false, msg: '申请单不存在' }
    if (req.status !== CERT_REQUEST_STATUS.PENDING) return { ok: false, msg: '该申请已处理，不可重复操作' }
    const approvedAt = new Date().toISOString()
    let issued = 0
    for (const item of req.students) {
      const pr = db.progress.find((p) => p.studentId === item.studentId && p.classId === req.classId)
      if (pr) {
        pr.progressPct = 100
        pr.examPassed = true
        pr.completedBy = CERT_SOURCE.MANUAL
      }
      const before = db.certificates.length
      issueCertificateInternal(db, {
        studentId: item.studentId,
        classId: req.classId,
        source: CERT_SOURCE.MANUAL,
        operator: reviewer,
        approvedAt,
      })
      if (db.certificates.length > before) issued += 1
    }
    const cls = db.classes.find((c) => c.id === req.classId)
    if (cls) {
      cls.endedManually = true
      if (!cls.endDate) cls.endDate = todayStr()
    }
    req.status = CERT_REQUEST_STATUS.APPROVED
    req.reviewedAt = approvedAt
    req.reviewer = reviewer
    appendLog(db, {
      schoolId: req.schoolId,
      action: 'cert-request:approve',
      operator: reviewer,
      detail: `通过班级「${req.className}」结课发证，签发 ${issued} 张证书；结课前真实进度：${req.students
        .map((s) => `${s.studentName} ${s.realProgress}%`)
        .join('，')}`,
    })
    return { ok: true, issued }
  })
}

export function rejectCertRequest(requestId, reason, reviewer = '平台运营') {
  if (!String(reason || '').trim()) return { ok: false, msg: '请填写驳回原因' }
  return mutate((db) => {
    const req = db.certRequests.find((r) => r.id === requestId)
    if (!req) return { ok: false, msg: '申请单不存在' }
    if (req.status !== CERT_REQUEST_STATUS.PENDING) return { ok: false, msg: '该申请已处理，不可重复操作' }
    req.status = CERT_REQUEST_STATUS.REJECTED
    req.reviewedAt = new Date().toISOString()
    req.reviewer = reviewer
    req.rejectReason = String(reason).trim()
    appendLog(db, {
      schoolId: req.schoolId,
      action: 'cert-request:reject',
      operator: reviewer,
      detail: `驳回班级「${req.className}」结课发证申请：${req.rejectReason}`,
    })
    return { ok: true }
  })
}

/* ============================== 转校（仅平台） ============================== */

export function transferStudentSchool(studentId, targetSchoolId, operator = '官网管理员') {
  return mutate((db) => {
    const stu = db.students.find((s) => s.id === studentId)
    if (!stu) return { ok: false, msg: '学生不存在' }
    const target = db.schools.find((s) => s.id === targetSchoolId)
    if (!target) return { ok: false, msg: '目标学校不存在' }
    const current = db.enrollments.find((e) => e.studentId === studentId && e.status !== ENROLL_STATUS.REMOVED)
    if (current?.schoolId === targetSchoolId) return { ok: false, msg: '该学生已归属目标学校' }
    const now = new Date().toISOString()
    const fromName = current ? db.schools.find((s) => s.id === current.schoolId)?.name || '—' : '无归属'
    if (current) {
      current.status = ENROLL_STATUS.REMOVED
      current.removedAt = now
      // 停止原学校班级带来的学习入口，学习历史保留
      const oldClassIds = new Set(db.classes.filter((c) => c.schoolId === current.schoolId).map((c) => c.id))
      db.classStudents.forEach((cs) => {
        if (cs.studentId === studentId && oldClassIds.has(cs.classId) && !cs.removedAt) cs.removedAt = now
      })
    }
    db.enrollments.push({
      id: uid('enr'),
      schoolId: targetSchoolId,
      studentId,
      status: ENROLL_STATUS.ACTIVE,
      source: STUDENT_SOURCE.MANUAL,
      joinedAt: now,
      removedAt: null,
      transferredFrom: current?.schoolId || null,
    })
    appendLog(db, {
      schoolId: targetSchoolId,
      action: 'student:transfer',
      operator,
      detail: `学生 ${stu.name} 由「${fromName}」转入「${target.name}」，全平台学习历史保留`,
    })
    return { ok: true }
  })
}

/** 学生的学校归属历史（官网后台用户详情用） */
export function getStudentSchoolHistory(studentId) {
  const db = readDb()
  return db.enrollments
    .filter((e) => e.studentId === studentId)
    .map((e) => ({
      ...e,
      schoolName: db.schools.find((s) => s.id === e.schoolId)?.name || '—',
      classes: db.classStudents
        .filter((cs) => cs.studentId === studentId)
        .map((cs) => db.classes.find((c) => c.id === cs.classId))
        .filter((c) => c && c.schoolId === e.schoolId)
        .map((c) => ({ id: c.id, name: c.name, courseId: c.courseId, courseName: getCourseName(c.courseId) })),
    }))
    .sort((a, b) => (a.joinedAt < b.joinedAt ? 1 : -1))
}

/** 官网后台用户列表：学校关联信息 */
export function listSiteStudentsWithSchool(filter = {}) {
  const db = readDb()
  return db.students
    .map((stu) => {
      const active = db.enrollments.find((e) => e.studentId === stu.id && e.status !== ENROLL_STATUS.REMOVED)
      const history = db.enrollments.filter((e) => e.studentId === stu.id)
      const latest = active || history.sort((a, b) => (a.joinedAt < b.joinedAt ? 1 : -1))[0]
      const school = latest ? db.schools.find((s) => s.id === latest.schoolId) : null
      return {
        ...stu,
        schoolId: latest?.schoolId || null,
        schoolName: school?.name || '',
        enrollStatus: latest?.status || null,
        source: stu.siteUserSource || STUDENT_SOURCE.SITE,
        certificateCount: db.certificates.filter((c) => c.studentId === stu.id).length,
      }
    })
    .filter((row) => {
      if (filter.schoolId && row.schoolId !== filter.schoolId) return false
      if (filter.source && row.source !== filter.source) return false
      if (filter.enrollStatus && row.enrollStatus !== filter.enrollStatus) return false
      const kw = String(filter.keyword || '').trim()
      if (kw && !row.name.includes(kw) && !row.phone.includes(normalizePhone(kw) || kw)) return false
      return true
    })
}

/* ============================== C 端：学生有效课程权限 ============================== */

/**
 * 计算学生通过学校班级获得的有效课程权限（实时重算）。
 * 规则：学校启用 + 归属有效 + 班级未停用 + 已到开课日期；已结课课程保留并标识。
 */
export function getStudentSchoolCourseAccess(studentId) {
  const db = readDb()
  const enrollment = db.enrollments.find((e) => e.studentId === studentId && e.status === ENROLL_STATUS.ACTIVE)
  if (!enrollment) return []
  const school = db.schools.find((s) => s.id === enrollment.schoolId)
  if (!school || school.status !== SCHOOL_STATUS.ACTIVE) return []

  const rels = db.classStudents.filter((cs) => cs.studentId === studentId && !cs.removedAt)
  const out = []
  for (const rel of rels) {
    const cls = db.classes.find((c) => c.id === rel.classId && c.schoolId === enrollment.schoolId)
    if (!cls) continue
    const status = deriveClassStatus(cls)
    if (status === CLASS_STATUS.DISABLED) continue
    // 未开课班级的课程不在学习中心显示，到开课日期自动显示
    if (status === CLASS_STATUS.PENDING) continue
    const pr = db.progress.find((p) => p.studentId === studentId && p.classId === cls.id)
    const cert = db.certificates.find((c) => c.studentId === studentId && c.classId === cls.id)
    out.push({
      courseId: cls.courseId,
      courseName: getCourseName(cls.courseId),
      classId: cls.id,
      className: cls.name,
      classStatus: status,
      schoolId: school.id,
      schoolName: school.name,
      progressPct: pr?.progressPct ?? 0,
      realProgress: pr?.realProgress ?? 0,
      lessonsDone: pr?.lessonsDone ?? 0,
      totalLessons: getCourseTotalLessons(cls.courseId),
      lastStudyAt: pr?.lastStudyAt || '',
      certificate: cert ? { source: cert.source, issuedAt: cert.issuedAt, completedAt: cert.completedAt } : null,
    })
  }
  return out
}

export function findStudentByPhoneForSite(phoneRaw) {
  const phone = normalizePhone(phoneRaw)
  return readDb().students.find((s) => s.phone === phone) || null
}

/* ============================== 看板统计 ============================== */

function daysAgoIso(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

/**
 * 看板指标。统计一律使用 realProgress，避免被手动结课污染。
 */
export function getDashboardStats(session, filter = {}) {
  if (!session) return null
  const db = readDb()
  const scopedClasses = db.classes
    .filter((c) => c.schoolId === session.schoolId)
    .filter((c) => (isOwner(session) ? true : c.teacherAccountId === session.accountId))
    .filter((c) => (filter.classId ? c.id === filter.classId : true))
    .filter((c) => (filter.courseId ? c.courseId === filter.courseId : true))
  const classIds = new Set(scopedClasses.map((c) => c.id))

  const studentIds = new Set(
    db.classStudents.filter((cs) => classIds.has(cs.classId) && !cs.removedAt).map((cs) => cs.studentId)
  )
  const progressRows = db.progress.filter((p) => classIds.has(p.classId))
  const since = filter.since || daysAgoIso(Number(filter.days ?? 7))
  const until = filter.until || new Date().toISOString()

  const activeStudentIds = new Set(
    progressRows
      .filter((p) => p.lastStudyAt && p.lastStudyAt >= since && p.lastStudyAt <= until)
      .map((p) => p.studentId)
  )

  const avgReal = progressRows.length
    ? Math.round(progressRows.reduce((s, p) => s + (p.realProgress || 0), 0) / progressRows.length)
    : 0
  const completedCount = progressRows.filter((p) => (p.realProgress || 0) >= 100).length
  const totalMinutes = progressRows.reduce((s, p) => s + (p.studyMinutes || 0), 0)

  const statusOf = (c) => deriveClassStatus(c)
  const certs = db.certificates.filter((c) => classIds.has(c.classId))

  // 学习预警
  const sevenDaysAgo = daysAgoIso(7)
  const classAvg = new Map()
  for (const c of scopedClasses) {
    const rows = progressRows.filter((p) => p.classId === c.id)
    classAvg.set(
      c.id,
      rows.length ? rows.reduce((s, p) => s + (p.realProgress || 0), 0) / rows.length : 0
    )
  }
  const warnings = { noStudy7d: [], belowClassAvg: [], endedNotCompleted: [] }
  for (const p of progressRows) {
    const stu = db.students.find((s) => s.id === p.studentId)
    if (!stu) continue
    const cls = db.classes.find((c) => c.id === p.classId)
    const row = {
      studentId: stu.id,
      name: stu.name,
      phone: stu.phone,
      className: cls?.name || '—',
      realProgress: p.realProgress || 0,
      lastStudyAt: p.lastStudyAt || '',
    }
    if (!p.lastStudyAt || p.lastStudyAt < sevenDaysAgo) warnings.noStudy7d.push(row)
    const avg = classAvg.get(p.classId) || 0
    if (avg - (p.realProgress || 0) >= 20) warnings.belowClassAvg.push(row)
    if (cls && statusOf(cls) === CLASS_STATUS.ENDED && (p.realProgress || 0) < 100) {
      warnings.endedNotCompleted.push(row)
    }
  }

  // 趋势：近 N 天每日活跃学生数（以最后学习时间落点近似）
  const days = Number(filter.days ?? 7)
  const trend = []
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = todayStr(d)
    const count = progressRows.filter((p) => p.lastStudyAt && todayStr(p.lastStudyAt) === key).length
    trend.push({ date: key.slice(5), count })
  }

  return {
    overview: {
      studentCount: studentIds.size,
      teacherCount: isOwner(session)
        ? db.accounts.filter((a) => a.schoolId === session.schoolId && a.role === SCHOOL_ROLE.TEACHER).length
        : 1,
      classCount: scopedClasses.length,
      grantedCourseCount: listGrantedCourseIds(session.schoolId).length,
      activeStudentCount: activeStudentIds.size,
      activeRate: studentIds.size ? Math.round((activeStudentIds.size / studentIds.size) * 100) : 0,
    },
    study: {
      studySessions: progressRows.filter((p) => p.lastStudyAt).length,
      studyMinutes: totalMinutes,
      completionRate: progressRows.length ? Math.round((completedCount / progressRows.length) * 100) : 0,
      avgProgress: avgReal,
      trend,
    },
    teaching: {
      pending: scopedClasses.filter((c) => statusOf(c) === CLASS_STATUS.PENDING).length,
      ongoing: scopedClasses.filter((c) => statusOf(c) === CLASS_STATUS.ONGOING).length,
      ended: scopedClasses.filter((c) => statusOf(c) === CLASS_STATUS.ENDED).length,
      disabled: scopedClasses.filter((c) => statusOf(c) === CLASS_STATUS.DISABLED).length,
      ranking: scopedClasses
        .map((c) => {
          const rows = progressRows.filter((p) => p.classId === c.id)
          return {
            classId: c.id,
            name: c.name,
            studentCount: classStudentIds(db, c.id).length,
            completionRate: rows.length
              ? Math.round((rows.filter((p) => (p.realProgress || 0) >= 100).length / rows.length) * 100)
              : 0,
          }
        })
        .sort((a, b) => b.completionRate - a.completionRate),
    },
    outcome: {
      certificateCount: certs.length,
      autoCertCount: certs.filter((c) => c.source === CERT_SOURCE.AUTO).length,
      manualCertCount: certs.filter((c) => c.source === CERT_SOURCE.MANUAL).length,
      byCourse: [...new Set(scopedClasses.map((c) => c.courseId))].map((courseId) => ({
        courseId,
        courseName: getCourseName(courseId),
        count: certs.filter((c) => c.courseId === courseId).length,
      })),
    },
    warnings,
  }
}

/* ============================== 演示种子数据 ============================== */

function buildSeedDb() {
  const db = emptyDb()
  const now = new Date()
  const iso = (dayOffset, hour = 10) => {
    const d = new Date(now)
    d.setDate(d.getDate() + dayOffset)
    d.setHours(hour, 0, 0, 0)
    return d.toISOString()
  }
  const date = (dayOffset) => todayStr(new Date(now.getTime() + dayOffset * 86400000))

  // 学校 A（演示主场景）
  const schoolA = 'sch_demo_a'
  const ownerA = 'acc_owner_a'
  const teacherA1 = 'acc_teacher_a1'
  const teacherA2 = 'acc_teacher_a2'
  // 学校 B（用于验证跨校隔离与转校）
  const schoolB = 'sch_demo_b'
  const ownerB = 'acc_owner_b'

  db.schools.push(
    {
      id: schoolA,
      name: '缤果AI实验学校',
      province: '广东省',
      city: '深圳市',
      district: '南山区',
      address: '科技园南路 99 号',
      contactName: '陈校长',
      contactPhone: '13900001111',
      remark: '已开通学校，覆盖完整班级与学习记录',
      status: SCHOOL_STATUS.ACTIVE,
      ownerAccountId: ownerA,
      createdAt: iso(-60),
    },
    {
      id: schoolB,
      name: '未来科技中学',
      province: '浙江省',
      city: '杭州市',
      district: '西湖区',
      address: '文一西路 168 号',
      contactName: '周主任',
      contactPhone: '13900004444',
      remark: '开展 AI 素养课程教学服务',
      status: SCHOOL_STATUS.ACTIVE,
      ownerAccountId: ownerB,
      createdAt: iso(-30),
    }
  )

  db.accounts.push(
    {
      id: ownerA,
      schoolId: schoolA,
      name: '陈校长',
      phone: '13900001111',
      password: 'school123',
      role: SCHOOL_ROLE.OWNER,
      status: ACCOUNT_STATUS.ACTIVE,
      createdAt: iso(-60),
    },
    {
      id: teacherA1,
      schoolId: schoolA,
      name: '张老师',
      phone: '13900002222',
      password: 'teacher123',
      role: SCHOOL_ROLE.TEACHER,
      status: ACCOUNT_STATUS.ACTIVE,
      createdAt: iso(-50),
    },
    {
      id: teacherA2,
      schoolId: schoolA,
      name: '李老师',
      phone: '13900003333',
      password: 'teacher123',
      role: SCHOOL_ROLE.TEACHER,
      status: ACCOUNT_STATUS.ACTIVE,
      createdAt: iso(-45),
    },
    {
      id: ownerB,
      schoolId: schoolB,
      name: '周主任',
      phone: '13900004444',
      password: 'school123',
      role: SCHOOL_ROLE.OWNER,
      status: ACCOUNT_STATUS.ACTIVE,
      createdAt: iso(-30),
    }
  )

  const grantedAt = iso(-59)
  for (const courseId of ['ai-enlighten', 'ai-advance-basic', 'ai-programming']) {
    db.courseGrants.push({ schoolId: schoolA, courseId, grantedAt })
  }
  db.courseGrants.push({ schoolId: schoolB, courseId: 'ai-enlighten', grantedAt: iso(-29) })

  // 班级：覆盖 进行中 / 未开课 / 已结课 三种状态
  const clsOngoing = 'cls_demo_ongoing'
  const clsPending = 'cls_demo_pending'
  const clsEnded = 'cls_demo_ended'
  const clsB = 'cls_demo_b'

  db.classes.push(
    {
      id: clsOngoing,
      schoolId: schoolA,
      name: '2026 春季 AI 启蒙 1 班',
      code: 'CA0001',
      courseId: 'ai-enlighten',
      teacherAccountId: teacherA1,
      startDate: date(-20),
      endDate: date(25),
      remark: '春季常规授课班，已建立学习与结课记录',
      disabled: false,
      endedManually: false,
      createdAt: iso(-25),
    },
    {
      id: clsPending,
      schoolId: schoolA,
      name: '2026 秋季 AI 编程预备班',
      code: 'CA0002',
      courseId: 'ai-programming',
      teacherAccountId: teacherA2,
      startDate: date(15),
      endDate: date(60),
      remark: '未开课班级',
      disabled: false,
      endedManually: false,
      createdAt: iso(-6),
    },
    {
      id: clsEnded,
      schoolId: schoolA,
      name: '2025 冬季 AI 基础原理班',
      code: 'CA0003',
      courseId: 'ai-advance-basic',
      teacherAccountId: teacherA2,
      startDate: date(-70),
      endDate: date(-10),
      remark: '已结课班级，含已发证学生',
      disabled: false,
      endedManually: false,
      createdAt: iso(-72),
    },
    {
      id: clsB,
      schoolId: schoolB,
      name: '未来科技 AI 启蒙 A 班',
      code: 'CB0001',
      courseId: 'ai-enlighten',
      teacherAccountId: ownerB,
      startDate: date(-12),
      endDate: date(30),
      remark: 'AI 启蒙常规授课班',
      disabled: false,
      endedManually: false,
      createdAt: iso(-14),
    }
  )

  /** [id, 姓名, 手机号, 性别, 生日] */
  const seedStudents = [
    ['stu_a1', '王小雨', '13910001001', '女', '2015-03-12'],
    ['stu_a2', '李泽宇', '13910001002', '男', '2014-08-05'],
    ['stu_a3', '赵思彤', '13910001003', '女', '2015-11-23'],
    ['stu_a4', '孙浩然', '13910001004', '男', '2014-01-30'],
    ['stu_a5', '周语桐', '13910001005', '女', '2016-06-18'],
    ['stu_a6', '吴俊熙', '13910001006', '男', '2013-09-02'],
    ['stu_b1', '郑一诺', '13920002001', '男', '2014-04-21'],
  ]
  for (const [id, name, phone, gender, birthday] of seedStudents) {
    db.students.push({
      id,
      name,
      phone,
      password: 'student123',
      gender,
      birthday,
      status: ACCOUNT_STATUS.ACTIVE,
      siteUserSource: STUDENT_SOURCE.IMPORT,
      createdAt: iso(-40),
    })
  }

  const enroll = (studentId, schoolId, dayOffset) => {
    db.enrollments.push({
      id: uid('enr'),
      schoolId,
      studentId,
      status: ENROLL_STATUS.ACTIVE,
      source: STUDENT_SOURCE.IMPORT,
      joinedAt: iso(dayOffset),
      removedAt: null,
    })
  }
  for (const [i, s] of seedStudents.entries()) {
    enroll(s[0], s[0].startsWith('stu_b') ? schoolB : schoolA, -38 + i)
  }

  /** [班级, 学生, 显示进度, 真实进度, 已完成课时, 学习分钟, 最后学习(天前，null=无记录)] */
  const seedProgress = [
    [clsOngoing, 'stu_a1', 75, 75, 9, 320, -1],
    [clsOngoing, 'stu_a2', 45, 45, 5, 180, -3],
    [clsOngoing, 'stu_a3', 100, 100, 12, 460, -2],
    [clsOngoing, 'stu_a4', 10, 10, 1, 25, -12],
    // 0% 且无任何学习记录：验证「0 进度也可发证」与学习预警
    [clsOngoing, 'stu_a5', 0, 0, 0, 0, null],
    // 跨班学员：同一学生可同时在多个班级
    [clsPending, 'stu_a1', 0, 0, 0, 0, null],
    [clsEnded, 'stu_a6', 100, 100, 16, 640, -12],
    [clsEnded, 'stu_a2', 60, 60, 10, 300, -15],
    [clsB, 'stu_b1', 30, 30, 4, 120, -2],
  ]
  for (const [classId, studentId, progressPct, realProgress, lessonsDone, studyMinutes, lastDay] of seedProgress) {
    const cls = db.classes.find((c) => c.id === classId)
    db.classStudents.push({
      id: uid('cs'),
      classId,
      studentId,
      joinedAt: cls.createdAt,
      removedAt: null,
    })
    db.progress.push({
      id: uid('pg'),
      studentId,
      schoolId: cls.schoolId,
      classId,
      courseId: cls.courseId,
      progressPct,
      realProgress,
      lessonsDone,
      studyMinutes,
      lastStudyAt: lastDay === null ? '' : iso(lastDay, 19),
    })
  }

  // 自动发证：学生自行学完并通过考核
  issueCertificateInternal(db, {
    studentId: 'stu_a6',
    classId: clsEnded,
    source: CERT_SOURCE.AUTO,
    operator: '系统自动',
    approvedAt: iso(-11, 20),
  })

  // 待平台审核的整班发证申请
  const pendingClass = db.classes.find((c) => c.id === clsOngoing)
  db.certRequests.push({
    id: 'req_demo_pending',
    schoolId: schoolA,
    schoolName: '缤果AI实验学校',
    classId: clsOngoing,
    className: pendingClass.name,
    courseId: pendingClass.courseId,
    status: CERT_REQUEST_STATUS.PENDING,
    applicantAccountId: teacherA1,
    applicantName: '张老师',
    applicantRole: SCHOOL_ROLE.TEACHER,
    studentCount: 5,
    students: classStudentIds(db, clsOngoing).map((sid) => {
      const stu = db.students.find((s) => s.id === sid)
      const pr = db.progress.find((p) => p.studentId === sid && p.classId === clsOngoing)
      return {
        studentId: sid,
        studentName: stu?.name || '—',
        studentPhone: stu?.phone || '',
        realProgress: pr?.realProgress ?? 0,
        lastStudyAt: pr?.lastStudyAt || '',
      }
    }),
    submittedAt: iso(-1, 15),
    reviewedAt: null,
    reviewer: '',
    rejectReason: '',
  })

  db.logs.push({
    id: uid('log'),
    at: iso(-60),
    schoolId: schoolA,
    action: 'school:create',
    operator: '官网管理员',
    detail: '创建学校「缤果AI实验学校」并开通总管理员账号',
  })

  return db
}