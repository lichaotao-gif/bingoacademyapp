/**
 * 新机构入驻「独立演示」：与正式加盟商/机构总身份切换、开户档案无关。
 * 仅当会话带 isolatedNewOrgDemo 或从登录页主动进入演示路由时生效。
 */
import {
  buildPartnerSessionPayloadForLogin,
  clearPartnerSession,
  createIsolatedNewOrgEmptyWorkspace,
  ensureIsolatedDemoEmptyQualification,
  getWorkspace,
  normalizePartnerPhoneDigits,
} from './franchisePartnerStorage.js'
import {
  clearInstitutionHqSession,
  getInstitutionHqSession,
  setInstitutionHqSession,
} from './institutionHqStorage.js'

export const NEW_ORG_ONBOARDING_LS_KEY = 'bingo_franchise_new_org_onboarding_v1'
/** 新机构入驻演示：机构总管理后台（非校区加盟商工作台） */
export const NEW_ORG_DEMO_BASE = '/institution-hq/demo-new-org'
/** 首页 / Banner 一键进入演示（自动创建演示会话） */
export const NEW_ORG_DEMO_START_PATH = '/institution-hq/demo-new-org/start'

export function demoInstitutionPath(subpath = '') {
  const s = String(subpath || '').replace(/^\//, '')
  return s ? `${NEW_ORG_DEMO_BASE}/${s}` : NEW_ORG_DEMO_BASE
}

/** @deprecated 使用 demoInstitutionPath */
export function demoPartnerPath(subpath = '') {
  return demoInstitutionPath(subpath)
}

/** 资质录入页（演示独立路由） */
/** 演示账号完善机构信息入口（机构信息页） */
export const NEW_ORG_QUALIFICATION_FILL_PATH = demoInstitutionPath('settings')
export const NEW_ORG_QUALIFICATION_SETTINGS_PATH = demoInstitutionPath('settings')

/** @deprecated 使用 getNewOrgQualGuardCopy */
export const NEW_ORG_BASIC_APPLY_MSG = '请先提交机构基本资料，再完善并提交机构资质。'
/** @deprecated 使用 getNewOrgQualGuardCopy */
export const NEW_ORG_QUAL_GUARD_MSG =
  '机构资质尚未提交或未通过总部审核，审核通过后方可使用本功能。'

/**
 * 演示账号操作拦截弹窗文案
 * @returns {{ title: string, message: string, primaryLabel: string, primaryPath: string }}
 */
export function getNewOrgQualGuardCopy(session) {
  if (!session || !isIsolatedNewOrgDemoSession(session) || isNewRegistrantNeedsBasicApply(session)) {
    return {
      title: '请先提交机构基本资料',
      message:
        '您尚未完成机构入驻的第一步。请先填写并提交机构基本资料，再前往「资质录入」完善证照与经营信息，待总部审核通过后即可使用平台全部功能。',
      primaryLabel: '去填写基本资料',
      primaryPath: demoInstitutionPath('onboarding/apply'),
    }
  }

  let message =
    '请先完善并提交机构信息，待总部审核通过后方可开设校区、配置角色、划拨资金等。您可先浏览各功能页面了解流程，具体操作需审核通过后再开放。'

  try {
    const partnerId = session.qualPartnerId || session.partnerId
    const refCode = session.qualRefCode ?? session.refCode
    if (partnerId) {
      const ws = getWorkspace(partnerId, refCode)
      const iq = ws?.institutionQualification
      if (iq?.pendingReview) {
        message =
          '您的机构资质已提交，正在总部审核中。审核结果出具前，开设校区、资金划拨等功能暂不可用。您可前往资质页查看进度；若需补充材料，请按驳回说明修改后重新提交。'
      } else if (iq?.reviewStatus === 'rejected') {
        message =
          '您的机构资质审核未通过。请根据驳回说明修改资料并重新提交，待总部审核通过后方可使用本功能。'
      }
    }
  } catch {
    /* ignore */
  }

  return {
    title: '请先提交机构信息',
    message,
    primaryLabel: '去提交机构信息',
    primaryPath: NEW_ORG_QUALIFICATION_FILL_PATH,
  }
}

export function shouldBlockDemoFunctionalAction(session) {
  if (!isIsolatedNewOrgDemoSession(session)) return false
  if (isNewRegistrantNeedsBasicApply(session)) return true
  return isNewRegistrantQualificationRestricted(session)
}

function safeParse(raw, fallback) {
  try {
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function loadOnboardingMap() {
  if (typeof window === 'undefined') return {}
  try {
    const o = safeParse(localStorage.getItem(NEW_ORG_ONBOARDING_LS_KEY), {})
    return o && typeof o === 'object' && !Array.isArray(o) ? o : {}
  } catch {
    return {}
  }
}

function saveOnboardingMap(map) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(NEW_ORG_ONBOARDING_LS_KEY, JSON.stringify(map))
    window.dispatchEvent(new Event('franchise-new-org-onboarding-changed'))
  } catch {
    /* ignore */
  }
}

function demoPhoneFromSession(session) {
  return normalizePartnerPhoneDigits(session?.loginPhone || session?.phone || '')
}

function getDemoRow(phoneDigits) {
  const p = normalizePartnerPhoneDigits(phoneDigits)
  const row = loadOnboardingMap()[p]
  if (!row?.isolatedDemo) return null
  return row
}

/** 是否为独立演示会话（不依赖开户档案、不影响其他账号） */
export function isIsolatedNewOrgDemoSession(session) {
  return Boolean(session?.isolatedNewOrgDemo === true)
}

export function getOnboardingState(phoneDigits) {
  const row = getDemoRow(phoneDigits)
  if (!row) return { stage: 'apply', orgApplication: null, skippedQualification: false }
  return {
    stage: row.orgApplication?.submittedAt ? 'pending_qual' : 'apply',
    orgApplication: row.orgApplication || null,
    skippedQualification: Boolean(row.skippedQualification),
  }
}

export function setOnboardingState(phoneDigits, patch) {
  const p = normalizePartnerPhoneDigits(phoneDigits)
  if (p.length !== 11) return
  const map = loadOnboardingMap()
  const prev = map[p] || { isolatedDemo: true }
  map[p] = {
    ...prev,
    isolatedDemo: true,
    ...patch,
    updatedAt: new Date().toISOString(),
  }
  saveOnboardingMap(map)
}

export function isNewRegistrantNeedsBasicApply(session) {
  if (!isIsolatedNewOrgDemoSession(session)) return false
  return !getOnboardingState(demoPhoneFromSession(session)).orgApplication?.submittedAt
}

export function isQualificationApprovedForSession(session) {
  const partnerId = session?.qualPartnerId || session?.partnerId
  if (!partnerId) return false
  try {
    const ws = getWorkspace(partnerId, session?.qualRefCode ?? session?.refCode)
    const iq = ws?.institutionQualification
    return iq?.reviewStatus === 'approved' && Object.keys(iq?.approvedSnapshot || {}).length > 0
  } catch {
    return false
  }
}

export function isNewRegistrantQualificationRestricted(session) {
  if (!isIsolatedNewOrgDemoSession(session)) return false
  if (isNewRegistrantNeedsBasicApply(session)) return false
  return !isQualificationApprovedForSession(session)
}

export function resolveDemoPostLoginPath(phoneDigits) {
  const { orgApplication } = getOnboardingState(phoneDigits)
  if (!orgApplication?.submittedAt) return demoInstitutionPath('onboarding/apply')
  return demoInstitutionPath('dashboard')
}

export function submitOrgApplication(phoneDigits, form) {
  const p = normalizePartnerPhoneDigits(phoneDigits)
  const orgName = String(form?.orgName || '').trim()
  const contactName = String(form?.contactName || '').trim()
  const region = String(form?.region || '').trim()
  const intro = String(form?.intro || '').trim()
  if (!orgName) return { ok: false, msg: '请填写拟申请机构名称' }
  if (!contactName) return { ok: false, msg: '请填写联系人姓名' }
  if (!region) return { ok: false, msg: '请填写所在区域' }

  setOnboardingState(p, {
    stage: 'pending_qual',
    orgApplication: {
      orgName,
      contactName,
      region,
      intro,
      submittedAt: new Date().toISOString(),
    },
  })

  const session = getInstitutionHqSession()
  if (session && demoPhoneFromSession(session) === p) {
    setInstitutionHqSession({
      ...session,
      orgName,
      contactName,
      displayName: contactName,
      isolatedNewOrgDemo: true,
    })
    if (session.qualPartnerId) {
      createIsolatedNewOrgEmptyWorkspace(session.qualPartnerId, session.qualRefCode)
      ensureIsolatedDemoEmptyQualification(session.qualPartnerId, session.qualRefCode)
    }
  }

  return { ok: true, path: demoInstitutionPath('dashboard') }
}

export function skipQualificationAndEnterHome(phoneDigits) {
  const p = normalizePartnerPhoneDigits(phoneDigits)
  setOnboardingState(p, { stage: 'pending_qual', skippedQualification: true })
  return { ok: true, path: demoInstitutionPath('dashboard') }
}

/** 登录页入口：独立演示，不写入正式开户/身份联动数据 */
export function startSimulatedNewOrgRegistration() {
  if (typeof window === 'undefined') return { ok: false, msg: '仅浏览器环境可用' }
  const suffix = String(Date.now()).slice(-8)
  const phone = `139${suffix}`
  setOnboardingState(phone, { stage: 'apply', orgApplication: null, skippedQualification: false, isolatedDemo: true })

  clearPartnerSession()
  clearInstitutionHqSession()

  const qualKeys = buildPartnerSessionPayloadForLogin(phone)
  createIsolatedNewOrgEmptyWorkspace(qualKeys.partnerId, qualKeys.refCode)
  ensureIsolatedDemoEmptyQualification(qualKeys.partnerId, qualKeys.refCode)

  setInstitutionHqSession({
    orgId: `iso-demo-org-${suffix}`,
    orgName: '待提交机构申请',
    displayName: '新注册用户',
    loginPhone: phone,
    loginAt: new Date().toISOString(),
    isolatedNewOrgDemo: true,
    qualPartnerId: qualKeys.partnerId,
    qualRefCode: qualKeys.refCode,
  })

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('institution-hq-session-changed'))
  }

  return { ok: true, phone, path: demoInstitutionPath('onboarding/apply') }
}

export function exitIsolatedNewOrgDemo() {
  clearPartnerSession()
  clearInstitutionHqSession()
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('franchise-partner-session-changed'))
    window.dispatchEvent(new Event('institution-hq-session-changed'))
  }
}
