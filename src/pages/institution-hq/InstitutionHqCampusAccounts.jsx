import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  addInstitutionCampus,
  assignInstitutionCampusAdmin,
  changeInstitutionCampusAdminPhone,
  getInstitutionHqTreasury,
  listInstitutionCampuses,
  openCampusFranchisePartnerInNewTab,
  removeInstitutionCampus,
  setInstitutionCampusDisabled,
  updateInstitutionCampus,
} from '../../utils/institutionHqStorage'
import { getWorkspace, normalizePartnerPhoneDigits } from '../../utils/franchisePartnerStorage'
import {
  FRANCHISE_INSTITUTION_ACCOUNTS_LS_KEY,
  addInstitutionAccount,
  deleteInstitutionAccount,
  ensureDefaultInstitutionRoleIfEmpty,
  listInstitutionAccounts,
  listInstitutionRoles,
  resetInstitutionAccountPassword,
  setInstitutionAccountDisabled,
} from '../../utils/franchiseInstitutionAccounts'
import InstitutionHqCampusAllocateModal from './InstitutionHqCampusAllocateModal'

function fmtMoney(n) {
  return typeof n === 'number' && Number.isFinite(n)
    ? n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '—'
}

function parseOpeningBalanceInput(raw) {
  const s = String(raw ?? '')
    .trim()
    .replace(/,/g, '')
  if (!s) return 0
  const n = Number.parseFloat(s)
  if (!Number.isFinite(n) || n < 0) return NaN
  return Math.round(n * 100) / 100
}

const emptyForm = () => ({
  campusName: '',
  campusShortCode: '',
  region: '',
  address: '',
  contactName: '',
  contactPhone: '',
  plannedOpenDate: '',
  studentCapacity: '',
  remark: '',
  openingBalanceAllocated: '',
})

const emptyEditForm = () => ({
  campusName: '',
  campusShortCode: '',
  region: '',
  address: '',
  contactName: '',
  contactPhone: '',
  adminPhone: '',
  plannedOpenDate: '',
  studentCapacity: '',
  remark: '',
  passwordHint: '',
})

function editFormFromCampus(c) {
  if (!c || typeof c !== 'object') return emptyEditForm()
  return {
    campusName: c.campusName || '',
    campusShortCode: c.campusShortCode || '',
    region: c.region || '',
    address: c.address || '',
    contactName: c.contactName || '',
    contactPhone: c.contactPhone || '',
    adminPhone: c.adminPhone || '',
    plannedOpenDate: c.plannedOpenDate || '',
    studentCapacity: c.studentCapacity != null && c.studentCapacity !== '' ? String(c.studentCapacity) : '',
    remark: c.remark || '',
    passwordHint: c.passwordHint || '',
  }
}

/** 校区账号页：统一按钮基底与变体 */
const BTN = {
  base: 'inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-45',
  primary: 'bg-primary text-white shadow-sm hover:bg-primary-600 px-4 py-2.5',
  secondary: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 px-4 py-2.5',
  outline: 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50 px-4 py-2.5',
  accent: 'border border-primary/35 bg-primary/[0.07] text-primary hover:bg-primary/12 px-4 py-2.5',
  danger: 'border border-rose-200 bg-white text-rose-700 hover:bg-rose-50 px-4 py-2.5',
  dangerMuted: 'border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 px-4 py-2.5',
}

function btn(...parts) {
  return [BTN.base, ...parts].filter(Boolean).join(' ')
}

/** 表格行内操作：独立描边小按钮 */
const ROW_BTN = {
  base: 'inline-flex min-h-7 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-45 px-2',
  ghost: 'border border-slate-200/90 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300/90',
  primary: 'border border-primary bg-primary text-white shadow-sm hover:bg-primary-600',
  danger:
    'border border-rose-300 bg-white text-rose-800 shadow-sm hover:bg-rose-50 hover:border-rose-400 hover:text-rose-900',
  /** 预置校区：略淡的玫瑰红提示，避免与可解散行同样抢眼 */
  dangerMuted:
    'border border-rose-200/90 bg-rose-50/60 text-rose-600 shadow-sm hover:bg-rose-50 hover:border-rose-300 hover:text-rose-700',
}

function rowBtn(variant) {
  const v = ROW_BTN[variant] || ROW_BTN.ghost
  return [ROW_BTN.base, v].join(' ')
}

function campusHasAssignedAdmin(c) {
  return /^1\d{10}$/.test(normalizePartnerPhoneDigits(c?.adminPhone))
}

/** 校区列表：联系人「姓名/电话」整行完整展示 */
function CampusListContactCell({ campus: c }) {
  const name = String(c.contactName || '').trim()
  const phone = String(c.contactPhone || '').trim()

  let contactLine = '—'
  if (name && phone) contactLine = `${name}/${phone}`
  else if (name) contactLine = name
  else if (phone) contactLine = phone

  return (
    <span className={`inline-block whitespace-nowrap ${contactLine === '—' ? 'text-slate-400' : 'text-slate-800'}`} title={contactLine}>
      {name && phone ? (
        <>
          <span className="font-semibold">{name}</span>
          <span className="text-slate-500 tabular-nums">/{phone}</span>
        </>
      ) : phone ? (
        <span className="tabular-nums">{phone}</span>
      ) : (
        contactLine
      )}
    </span>
  )
}

export default function InstitutionHqCampusAccounts() {
  const [tick, setTick] = useState(0)
  const refresh = useCallback(() => setTick((t) => t + 1), [])

  const [modalOpen, setModalOpen] = useState(false)
  const [allocateCampus, setAllocateCampus] = useState(null)
  const [editCampus, setEditCampus] = useState(null)
  const [editForm, setEditForm] = useState(() => emptyEditForm())
  const [editErr, setEditErr] = useState('')
  const [replaceCampus, setReplaceCampus] = useState(null)
  const [replaceNewPhone, setReplaceNewPhone] = useState('')
  const [replaceErr, setReplaceErr] = useState('')

  const [adminConfigCampus, setAdminConfigCampus] = useState(null)
  const [adminCfgPhone, setAdminCfgPhone] = useState('')
  const [adminCfgContact, setAdminCfgContact] = useState('')
  const [adminCfgHint, setAdminCfgHint] = useState('')
  const [adminCfgErr, setAdminCfgErr] = useState('')

  const [staffModalCampus, setStaffModalCampus] = useState(null)
  const [staffTick, setStaffTick] = useState(0)
  const staffRefresh = useCallback(() => setStaffTick((t) => t + 1), [])
  const [staffAddOpen, setStaffAddOpen] = useState(false)
  const [staffAddName, setStaffAddName] = useState('')
  const [staffAddPhone, setStaffAddPhone] = useState('')
  const [staffAddPassword, setStaffAddPassword] = useState('')
  const [staffAddErr, setStaffAddErr] = useState('')

  const [form, setForm] = useState(emptyForm)
  const [err, setErr] = useState('')
  const [busyId, setBusyId] = useState(null)

  const campuses = useMemo(() => {
    void tick
    return listInstitutionCampuses()
  }, [tick])

  const campusWalletPreview = useMemo(() => {
    void tick
    const list = listInstitutionCampuses()
    const m = {}
    for (const c of list) {
      try {
        const ws = getWorkspace(c.partnerId, c.refCode)
        m[c.id] = typeof ws.balance === 'number' && Number.isFinite(ws.balance) ? ws.balance : null
      } catch {
        m[c.id] = null
      }
    }
    return m
  }, [tick])

  const hqTreasury = useMemo(() => {
    void tick
    return getInstitutionHqTreasury()
  }, [tick])

  const staffAccounts = useMemo(() => {
    void staffTick
    const pid = staffModalCampus?.partnerId
    if (!pid) return []
    return listInstitutionAccounts(pid)
  }, [staffTick, staffModalCampus?.partnerId])

  const staffRoles = useMemo(() => {
    void staffTick
    const pid = staffModalCampus?.partnerId
    if (!pid) return []
    return listInstitutionRoles(pid)
  }, [staffTick, staffModalCampus?.partnerId])

  useEffect(() => {
    const onTreasury = () => refresh()
    window.addEventListener('institution-hq-treasury-changed', onTreasury)
    return () => window.removeEventListener('institution-hq-treasury-changed', onTreasury)
  }, [refresh])

  useEffect(() => {
    if (!staffModalCampus) return
    const onStorage = (e) => {
      if (e.key === FRANCHISE_INSTITUTION_ACCOUNTS_LS_KEY) staffRefresh()
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [staffModalCampus, staffRefresh])

  const openModal = () => {
    setForm(emptyForm())
    setErr('')
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setErr('')
  }

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const submitModal = (e) => {
    e.preventDefault()
    setErr('')
    const alloc = parseOpeningBalanceInput(form.openingBalanceAllocated)
    if (Number.isNaN(alloc)) {
      setErr('开业划拨额度格式不正确')
      return
    }
    const r = addInstitutionCampus({
      campusName: form.campusName,
      region: form.region,
      address: form.address,
      campusShortCode: form.campusShortCode,
      contactName: form.contactName,
      contactPhone: form.contactPhone,
      plannedOpenDate: form.plannedOpenDate,
      studentCapacity: form.studentCapacity,
      remark: form.remark,
      openingBalanceAllocated: alloc,
    })
    if (!r.ok) {
      setErr(r.msg || '添加失败')
      return
    }
    closeModal()
    refresh()
  }

  const dissolveCampus = (c) => {
    if (!c || c.isSeed) return
    const name = String(c.campusName || '').trim() || '该校区'
    const msg = `确定解散校区「${name}」吗？\n\n解散后将从机构校区列表中移除；若尚未首次打开该校区的加盟商工作台，开业划拨额度将退回机构总账户；已打开过工作台的校区仅移除列表关联，不退回机构总余额。`
    if (!window.confirm(msg)) return
    const r = removeInstitutionCampus(c.id)
    if (!r.ok) {
      window.alert(r.msg || '解散失败')
      return
    }
    refresh()
  }

  const openCampus = (c) => {
    if (c.disabled) return
    setBusyId(c.id)
    try {
      openCampusFranchisePartnerInNewTab(c)
    } finally {
      window.setTimeout(() => setBusyId(null), 400)
    }
  }

  const openEditCampus = (c) => {
    setEditCampus(c)
    setEditForm(editFormFromCampus(c))
    setEditErr('')
  }

  const closeEditCampus = () => {
    setEditCampus(null)
    setEditForm(emptyEditForm())
    setEditErr('')
  }

  const setEditField = (key, value) => {
    setEditForm((prev) => ({ ...prev, [key]: value }))
  }

  const submitEditCampus = (e) => {
    e.preventDefault()
    setEditErr('')
    if (!editCampus) return
    const r = updateInstitutionCampus(editCampus.id, {
      campusName: editForm.campusName,
      contactName: editForm.contactName,
      contactPhone: editForm.contactPhone,
      region: editForm.region,
      address: editForm.address,
      campusShortCode: editForm.campusShortCode,
      plannedOpenDate: editForm.plannedOpenDate,
      studentCapacity: editForm.studentCapacity,
      remark: editForm.remark,
      passwordHint: editForm.passwordHint,
    })
    if (!r.ok) {
      setEditErr(r.msg || '保存失败')
      return
    }
    closeEditCampus()
    refresh()
  }

  const openReplaceAdmin = (c) => {
    setReplaceCampus(c)
    setReplaceNewPhone('')
    setReplaceErr('')
  }

  const closeReplaceAdmin = () => {
    setReplaceCampus(null)
    setReplaceNewPhone('')
    setReplaceErr('')
  }

  const openAdminConfig = (c) => {
    setAdminConfigCampus(c)
    setAdminCfgPhone('')
    setAdminCfgContact(String(c?.contactName || '').trim())
    setAdminCfgHint('')
    setAdminCfgErr('')
  }

  const closeAdminConfig = () => {
    setAdminConfigCampus(null)
    setAdminCfgPhone('')
    setAdminCfgContact('')
    setAdminCfgHint('')
    setAdminCfgErr('')
  }

  const submitAdminConfig = (e) => {
    e.preventDefault()
    setAdminCfgErr('')
    if (!adminConfigCampus) return
    const r = assignInstitutionCampusAdmin(adminConfigCampus.id, {
      adminPhone: adminCfgPhone,
      contactName: adminCfgContact,
      passwordHint: adminCfgHint,
    })
    if (!r.ok) {
      setAdminCfgErr(r.msg || '保存失败')
      return
    }
    closeAdminConfig()
    refresh()
  }

  const closeStaffManageModal = () => {
    setStaffModalCampus(null)
    setStaffAddOpen(false)
    setStaffAddName('')
    setStaffAddPhone('')
    setStaffAddPassword('')
    setStaffAddErr('')
  }

  const openStaffManageModal = (c) => {
    ensureDefaultInstitutionRoleIfEmpty(c.partnerId)
    setStaffModalCampus(c)
    setStaffAddOpen(false)
    setStaffAddErr('')
    staffRefresh()
  }

  const closeStaffAddModal = () => {
    setStaffAddOpen(false)
    setStaffAddErr('')
  }

  const openStaffAddModal = () => {
    if (!staffModalCampus) return
    ensureDefaultInstitutionRoleIfEmpty(staffModalCampus.partnerId)
    const roles = listInstitutionRoles(staffModalCampus.partnerId)
    staffRefresh()
    if (!roles.length) {
      window.alert('暂无可用的机构角色，请先在加盟工作台「机构账号」中创建角色后再试')
      return
    }
    setStaffAddName('')
    setStaffAddPhone('')
    setStaffAddPassword('')
    setStaffAddErr('')
    setStaffAddOpen(true)
  }

  const submitStaffAdd = (e) => {
    e.preventDefault()
    setStaffAddErr('')
    if (!staffModalCampus) return
    ensureDefaultInstitutionRoleIfEmpty(staffModalCampus.partnerId)
    const roles = listInstitutionRoles(staffModalCampus.partnerId)
    const roleId = roles[0]?.id || ''
    if (!roleId) {
      setStaffAddErr('暂无可分配角色，请先在加盟工作台「机构账号」中创建角色后再试')
      return
    }
    const r = addInstitutionAccount(
      staffModalCampus.partnerId,
      staffModalCampus.refCode,
      staffModalCampus.campusName,
      {
        name: staffAddName,
        phone: staffAddPhone,
        password: staffAddPassword,
        roleId,
      },
    )
    if (!r.ok) {
      setStaffAddErr(r.msg || '添加失败')
      return
    }
    closeStaffAddModal()
    setStaffAddName('')
    setStaffAddPhone('')
    setStaffAddPassword('')
    staffRefresh()
  }

  const toggleStaffDisabled = (acc) => {
    if (!staffModalCampus) return
    const next = !acc.disabled
    const ok = next
      ? window.confirm(`确定禁用子账号「${acc.name}」？禁用后该手机号将无法登录工作台。`)
      : window.confirm(`确定启用子账号「${acc.name}」？`)
    if (!ok) return
    const r = setInstitutionAccountDisabled(staffModalCampus.partnerId, acc.id, next)
    if (!r.ok) {
      window.alert(r.msg || '操作失败')
      return
    }
    staffRefresh()
  }

  const removeStaffAccount = (acc) => {
    if (!staffModalCampus) return
    if (!window.confirm(`确定删除子账号「${acc.name}」（${acc.phone}）？此操作不可恢复。`)) return
    const r = deleteInstitutionAccount(staffModalCampus.partnerId, acc.id)
    if (!r.ok) {
      window.alert(r.msg || '删除失败')
      return
    }
    staffRefresh()
  }

  const resetStaffPassword = (acc) => {
    if (!staffModalCampus) return
    const pw = window.prompt(`请为「${acc.name}」输入新登录密码（至少 6 位）`)
    if (pw == null) return
    const s = String(pw).trim()
    if (s.length < 6) {
      window.alert('密码至少 6 位')
      return
    }
    const r = resetInstitutionAccountPassword(staffModalCampus.partnerId, acc.id, s)
    if (!r.ok) {
      window.alert(r.msg || '重置失败')
      return
    }
    window.alert('密码已更新')
    staffRefresh()
  }

  const submitReplaceAdmin = (e) => {
    e.preventDefault()
    setReplaceErr('')
    if (!replaceCampus) return
    const r = changeInstitutionCampusAdminPhone(replaceCampus.id, replaceNewPhone)
    if (!r.ok) {
      setReplaceErr(r.msg || '更换失败')
      return
    }
    closeReplaceAdmin()
    refresh()
  }

  const toggleCampusDisable = (c) => {
    const next = !c.disabled
    const msg = next
      ? '确定禁用该校区？禁用后该校管理员将无法从登录页进入工作台，且无法打开校区或使用拨款。'
      : '确定重新启用该校区？'
    if (!window.confirm(msg)) return
    const r = setInstitutionCampusDisabled(c.id, next)
    if (!r.ok) {
      window.alert(r.msg || '操作失败')
      return
    }
    refresh()
  }

  const allocInputParsed = useMemo(
    () => parseOpeningBalanceInput(form.openingBalanceAllocated),
    [form.openingBalanceAllocated],
  )
  const treasuryBalance = hqTreasury.balance
  const afterDeductOk =
    Number.isFinite(allocInputParsed) &&
    !Number.isNaN(allocInputParsed) &&
    allocInputParsed >= 0 &&
    allocInputParsed <= treasuryBalance
  const balanceAfterAllocate =
    Number.isFinite(allocInputParsed) && !Number.isNaN(allocInputParsed) && allocInputParsed >= 0
      ? Math.round((treasuryBalance - allocInputParsed) * 100) / 100
      : null

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* 开设校区 */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between gap-y-4">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-slate-900">开设校区</h2>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed max-w-2xl">
                先填写校区档案；可选填对接联系人及联系电话。开业划拨可选。加盟商工作台登录手机号请在保存后的列表中通过「校区管理员配置」绑定，绑定后方可进入工作台。
              </p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-stretch gap-3 shrink-0 w-full lg:w-auto lg:items-center">
              <div className="rounded-lg border border-emerald-200/90 bg-white px-4 py-3 shadow-sm min-w-[11.5rem] flex flex-col justify-center">
                <p className="text-xs font-medium text-emerald-800/90">机构总账户 · 可划拨余额</p>
                <p className="text-lg font-bold text-emerald-950 tabular-nums mt-0.5 leading-none">¥{fmtMoney(treasuryBalance)}</p>
              </div>
              <button type="button" onClick={openModal} className={btn(BTN.primary, 'w-full sm:w-auto sm:self-center shrink-0')}>
                开设校区
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 校区列表 */}
      <section className="w-full rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/80 px-5 py-3.5 sm:px-6">
          <h2 className="text-base font-semibold text-slate-900">校区列表</h2>
          <p className="text-sm text-slate-500 tabular-nums">共 {campuses.length} 个校区</p>
        </div>
        <div className="overflow-x-auto min-w-0">
          <table className="border-collapse w-max min-w-full text-sm text-left text-slate-800 whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600">
                <th className="pl-4 pr-5 py-2.5 text-left align-middle">校区</th>
                <th className="px-3 py-2.5 text-left align-middle">状态</th>
                <th className="px-5 py-2.5 text-left align-middle">联系人 / 电话</th>
                <th className="px-4 py-2.5 text-right align-middle">开业划拨</th>
                <th className="px-4 py-2.5 text-right align-middle">账户余额</th>
                <th className="pl-3 pr-4 py-2.5 text-left align-middle border-l border-slate-200/90 bg-slate-50/50">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {campuses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-500">
                    暂无校区。机构资质审核通过后可点击上方「开设校区」添加。
                  </td>
                </tr>
              ) : null}
              {campuses.map((c) => {
                const planBits = [
                  c.plannedOpenDate ? `计划开业 ${c.plannedOpenDate}` : '',
                  c.studentCapacity ? `容量 ${c.studentCapacity} 人` : '',
                  c.remark ? c.remark : '',
                ].filter(Boolean)
                const campusMeta = [c.campusShortCode, c.region, c.address].filter(Boolean).join(' · ')
                const planLine = planBits.join(' · ')
                const subLine = [campusMeta, planLine].filter(Boolean).join(' · ')
                const campusTitle = [c.campusName, subLine].filter(Boolean).join('\n')
                return (
                  <tr key={c.id} className={`align-middle ${c.disabled ? 'bg-amber-50/35' : 'hover:bg-slate-50/50'}`}>
                    <td className="pl-4 pr-5 py-2.5 align-middle" title={campusTitle}>
                      <span className="text-sm font-semibold text-slate-900">{c.campusName}</span>
                      {subLine ? (
                        <span className="ml-2 text-[11px] text-slate-500">{subLine}</span>
                      ) : null}
                    </td>
                    <td className="px-3 py-2.5 align-middle">
                      <div className="inline-flex flex-nowrap items-center gap-1">
                        {c.isSeed ? (
                          <span className="inline-flex text-[10px] font-semibold rounded-md px-2 py-0.5 bg-sky-100 text-sky-900">预置</span>
                        ) : (
                          <span className="inline-flex text-[10px] font-semibold rounded-md px-2 py-0.5 bg-slate-100 text-slate-700">已开设</span>
                        )}
                        {c.disabled ? (
                          <span className="inline-flex text-[10px] font-semibold rounded-md px-2 py-0.5 bg-amber-100 text-amber-900">已禁用</span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-5 py-2.5 align-middle">
                      <CampusListContactCell campus={c} />
                    </td>
                    <td className="px-4 py-2.5 align-middle text-right tabular-nums text-sm text-slate-800">
                      {!c.isSeed ? `¥${fmtMoney(Number(c.openingBalanceAllocated) || 0)}` : '—'}
                    </td>
                    <td className="px-4 py-2.5 align-middle text-right tabular-nums text-sm text-slate-800">
                      {campusWalletPreview[c.id] != null ? `¥${fmtMoney(campusWalletPreview[c.id])}` : '—'}
                    </td>
                    <td className="pl-3 pr-4 py-2.5 align-middle border-l border-slate-100 bg-slate-50/20">
                      <div className="inline-flex flex-nowrap items-center justify-start gap-1.5">
                        <button
                          type="button"
                          disabled={Boolean(c.isSeed)}
                          onClick={() => openEditCampus(c)}
                          className={rowBtn('ghost')}
                          title={
                            c.isSeed
                              ? '预置演示校区不可修改档案，请通过「开设校区」新增自建校区'
                              : '修改校区名称、地址、联系人、计划开业等信息'
                          }
                        >
                          编辑校区
                        </button>
                        {!c.isSeed && !c.disabled && !campusHasAssignedAdmin(c) ? (
                          <button type="button" onClick={() => openAdminConfig(c)} className={rowBtn('ghost')}>
                            校区管理员配置
                          </button>
                        ) : null}
                        {!c.isSeed && !c.disabled && campusHasAssignedAdmin(c) ? (
                          <button type="button" onClick={() => openReplaceAdmin(c)} className={rowBtn('ghost')}>
                            换绑手机
                          </button>
                        ) : null}
                        {!c.isSeed ? (
                          <button type="button" onClick={() => toggleCampusDisable(c)} className={rowBtn('ghost')}>
                            {c.disabled ? '启用' : '禁用'}
                          </button>
                        ) : null}
                        <button
                          type="button"
                          disabled={Boolean(c.disabled)}
                          onClick={() => !c.disabled && setAllocateCampus(c)}
                          className={rowBtn('ghost')}
                        >
                          拨款
                        </button>
                        {!c.disabled ? (
                          <button type="button" onClick={() => openStaffManageModal(c)} className={rowBtn('ghost')}>
                            配置管理员
                          </button>
                        ) : null}
                        <button
                          type="button"
                          disabled={
                            busyId === c.id ||
                            Boolean(c.disabled) ||
                            (!c.isSeed && !campusHasAssignedAdmin(c))
                          }
                          onClick={() => openCampus(c)}
                          className={rowBtn('primary')}
                          title={!c.isSeed && !campusHasAssignedAdmin(c) ? '请先完成校区管理员配置' : undefined}
                        >
                          {busyId === c.id ? '打开…' : '进入'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (c.isSeed) {
                              window.alert(
                                '该预置校区不可解散。请通过「开设校区」新增校区后再进行相关操作。',
                              )
                              return
                            }
                            dissolveCampus(c)
                          }}
                          title={c.isSeed ? '预置校区不可解散' : undefined}
                          className={rowBtn(c.isSeed ? 'dangerMuted' : 'danger')}
                        >
                          解散
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {replaceCampus ? (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="hq-campus-replace-title">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-[1px]"
            aria-label="关闭"
            onClick={closeReplaceAdmin}
          />
          <form
            className="relative w-full max-w-md rounded-2xl bg-white shadow-xl border border-slate-200 flex flex-col"
            onSubmit={submitReplaceAdmin}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 sm:p-6 border-b border-slate-100 shrink-0">
              <h2 id="hq-campus-replace-title" className="text-base font-bold text-slate-900">
                管理员更换 · {replaceCampus.campusName}
              </h2>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                将该校区加盟商主账号登录手机更换为新号码。工作台余额、子账号与渠道编码会随新账号迁移；旧号将无法再登录该校区工作台（若新号尚未设置密码，将沿用旧号密码）。
              </p>
              <p className="text-xs text-slate-600 mt-2 tabular-nums">
                当前登录手机：<span className="font-medium text-slate-800 tabular-nums">{normalizePartnerPhoneDigits(replaceCampus.adminPhone) || '—'}</span>
              </p>
            </div>
            <div className="p-5 sm:p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">新管理员手机（11 位）*</label>
                <input
                  required
                  inputMode="numeric"
                  autoComplete="tel"
                  value={replaceNewPhone}
                  onChange={(e) => setReplaceNewPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm tabular-nums"
                  placeholder="输入新手机号"
                  maxLength={11}
                />
              </div>
              {replaceErr ? <p className="text-sm text-rose-600">{replaceErr}</p> : null}
            </div>
            <div className="p-4 sm:px-6 border-t border-slate-100 flex justify-end gap-2 shrink-0 bg-slate-50/80 rounded-b-2xl">
              <button type="button" onClick={closeReplaceAdmin} className={btn(BTN.secondary)}>
                取消
              </button>
              <button type="submit" className={btn(BTN.primary)}>
                确认更换
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {adminConfigCampus ? (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="hq-campus-admin-cfg-title">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-[1px]"
            aria-label="关闭"
            onClick={closeAdminConfig}
          />
          <form
            className="relative w-full max-w-md rounded-2xl bg-white shadow-xl border border-slate-200 flex flex-col"
            onSubmit={submitAdminConfig}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 sm:p-6 border-b border-slate-100 shrink-0">
              <h2 id="hq-campus-admin-cfg-title" className="text-base font-bold text-slate-900">
                校区管理员配置 · {adminConfigCampus.campusName}
              </h2>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                绑定该校区的加盟商主账号登录手机号。保存后将生成工作台入口并与开业划拨数据对齐；更换手机号请使用列表中的「换绑手机」。
              </p>
            </div>
            <div className="p-5 sm:p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">管理员手机（11 位，登录账号）*</label>
                <input
                  required
                  inputMode="numeric"
                  autoComplete="tel"
                  value={adminCfgPhone}
                  onChange={(e) => setAdminCfgPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm tabular-nums"
                  placeholder="11 位手机号"
                  maxLength={11}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">联系人 / 展示姓名（选填）</label>
                <input
                  value={adminCfgContact}
                  onChange={(e) => setAdminCfgContact(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="工作台展示用"
                  maxLength={32}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">登录提示（选填）</label>
                <textarea
                  value={adminCfgHint}
                  onChange={(e) => setAdminCfgHint(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm resize-y"
                  placeholder="留空则使用默认提示"
                  maxLength={200}
                />
              </div>
              {adminCfgErr ? <p className="text-sm text-rose-600">{adminCfgErr}</p> : null}
            </div>
            <div className="p-4 sm:px-6 border-t border-slate-100 flex justify-end gap-2 shrink-0 bg-slate-50/80 rounded-b-2xl">
              <button type="button" onClick={closeAdminConfig} className={btn(BTN.secondary)}>
                取消
              </button>
              <button type="submit" className={btn(BTN.primary)}>
                保存
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {staffModalCampus ? (
        <div className="fixed inset-0 z-[145] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="hq-staff-modal-title">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-[1px]"
            aria-label="关闭"
            onClick={closeStaffManageModal}
          />
          <div
            className="relative w-full max-w-3xl max-h-[min(90vh,720px)] rounded-2xl border border-slate-200 bg-white shadow-xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 sm:p-6 border-b border-slate-100 shrink-0 flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 id="hq-staff-modal-title" className="text-base font-bold text-slate-900">
                  配置管理员 · {staffModalCampus.campusName}
                </h2>
              </div>
              <button type="button" onClick={openStaffAddModal} className={btn(BTN.primary, 'shrink-0')}>
                添加主要管理员
              </button>
            </div>

            <div className="overflow-y-auto flex-1 min-h-0 p-4 sm:p-6">
              {staffAccounts.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-10">
                  暂无子账号，请点击右上角「添加主要管理员」，在弹出窗口中填写并保存。
                </p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-sm text-left min-w-[640px]">
                    <thead className="bg-slate-50 text-xs font-medium text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-2.5">名称</th>
                        <th className="px-4 py-2.5">角色</th>
                        <th className="px-4 py-2.5 whitespace-nowrap">手机号</th>
                        <th className="px-4 py-2.5 text-right whitespace-nowrap">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {staffAccounts.map((acc) => (
                        <tr key={acc.id} className={acc.disabled ? 'bg-slate-50/80' : ''}>
                          <td className="px-4 py-2.5 font-medium text-slate-900">
                            {acc.name}
                            {acc.disabled ? (
                              <span className="ml-2 text-[10px] font-medium text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                                已禁用
                              </span>
                            ) : null}
                          </td>
                          <td className="px-4 py-2.5 text-slate-700">{acc.roleName || '—'}</td>
                          <td className="px-4 py-2.5 tabular-nums text-slate-800">{acc.phone || '—'}</td>
                          <td className="px-4 py-2.5 text-right whitespace-nowrap">
                            <div className="inline-flex flex-nowrap items-center justify-end gap-1">
                              <button type="button" onClick={() => toggleStaffDisabled(acc)} className={rowBtn('ghost')}>
                                {acc.disabled ? '启用' : '禁用'}
                              </button>
                              <button type="button" onClick={() => resetStaffPassword(acc)} className={rowBtn('ghost')}>
                                重置密码
                              </button>
                              <button type="button" onClick={() => removeStaffAccount(acc)} className={rowBtn('danger')}>
                                删除
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="p-4 sm:px-6 border-t border-slate-100 flex justify-end shrink-0 bg-slate-50/80">
              <button type="button" onClick={closeStaffManageModal} className={btn(BTN.secondary)}>
                关闭
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {staffModalCampus && staffAddOpen ? (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="hq-staff-add-modal-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/55 backdrop-blur-[1px]"
            aria-label="关闭"
            onClick={closeStaffAddModal}
          />
          <form
            className="relative w-full max-w-lg max-h-[min(90vh,640px)] rounded-2xl border border-slate-200 bg-white shadow-xl flex flex-col overflow-hidden"
            onSubmit={submitStaffAdd}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 sm:p-6 border-b border-slate-100 shrink-0">
              <h2 id="hq-staff-add-modal-title" className="text-base font-bold text-slate-900">
                添加主要管理员
              </h2>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                校区：{staffModalCampus.campusName}。填写登录姓名、手机号与初始密码即可；角色与权限请在加盟工作台「机构账号」中配置。
              </p>
            </div>
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 min-h-0">
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">姓名 *</label>
                  <input
                    required
                    value={staffAddName}
                    onChange={(e) => setStaffAddName(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                    maxLength={32}
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">手机号（登录）*</label>
                    <input
                      required
                      inputMode="numeric"
                      value={staffAddPhone}
                      onChange={(e) => setStaffAddPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm tabular-nums"
                      maxLength={11}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 mb-1">初始密码 *</label>
                    <input
                      required
                      type="text"
                      autoComplete="new-password"
                      value={staffAddPassword}
                      onChange={(e) => setStaffAddPassword(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                      placeholder="至少 6 位"
                    />
                  </div>
                </div>
              </div>
              {staffAddErr ? <p className="mt-3 text-sm text-rose-600">{staffAddErr}</p> : null}
            </div>
            <div className="p-4 sm:px-6 border-t border-slate-100 flex justify-end gap-2 shrink-0 bg-slate-50/80">
              <button type="button" onClick={closeStaffAddModal} className={btn(BTN.secondary)}>
                取消
              </button>
              <button type="submit" className={btn(BTN.primary)}>
                保存
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {editCampus ? (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="hq-campus-edit-title">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-[1px]"
            aria-label="关闭"
            onClick={closeEditCampus}
          />
          <form
            className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl border border-slate-200 max-h-[min(90vh,640px)] flex flex-col"
            onSubmit={submitEditCampus}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 sm:p-6 border-b border-slate-100 shrink-0">
              <h2 id="hq-campus-edit-title" className="text-base font-bold text-slate-900">
                编辑校区 · {editCampus.campusName}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                可修改校区名称、简称、地区与地址、联系人及电话、计划开业、容量、备注与登录提示。管理员登录手机号与渠道编码不可在此变更，请使用「换绑手机」或「校区管理员配置」。
              </p>
            </div>
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">校区名称 *</label>
                  <input
                    required
                    value={editForm.campusName}
                    onChange={(e) => setEditField('campusName', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    maxLength={80}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">校区简称 / 编码</label>
                  <input
                    value={editForm.campusShortCode}
                    onChange={(e) => setEditField('campusShortCode', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    maxLength={32}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">所在地区</label>
                  <input
                    value={editForm.region}
                    onChange={(e) => setEditField('region', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    maxLength={64}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">详细地址</label>
                  <textarea
                    value={editForm.address}
                    onChange={(e) => setEditField('address', e.target.value)}
                    rows={2}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm resize-y min-h-[2.5rem]"
                    maxLength={200}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">联系人姓名（选填）</label>
                  <input
                    value={editForm.contactName}
                    onChange={(e) => setEditField('contactName', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    maxLength={32}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">联系电话（选填）</label>
                  <input
                    value={editForm.contactPhone}
                    onChange={(e) => setEditField('contactPhone', e.target.value.replace(/\s+/g, ' ').slice(0, 32))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm tabular-nums"
                    placeholder="手机或座机"
                    maxLength={32}
                    inputMode="tel"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">管理员手机（登录账号）</label>
                  <input
                    readOnly
                    disabled
                    value={editForm.adminPhone}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm tabular-nums text-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">计划开业日期</label>
                  <input
                    type="date"
                    value={editForm.plannedOpenDate}
                    onChange={(e) => setEditField('plannedOpenDate', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">规划学员容量（人）</label>
                  <input
                    inputMode="numeric"
                    value={editForm.studentCapacity}
                    onChange={(e) => setEditField('studentCapacity', e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm tabular-nums"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">内部备注</label>
                  <textarea
                    value={editForm.remark}
                    onChange={(e) => setEditField('remark', e.target.value)}
                    rows={2}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm resize-y"
                    maxLength={300}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">登录提示（选填）</label>
                  <textarea
                    value={editForm.passwordHint}
                    onChange={(e) => setEditField('passwordHint', e.target.value)}
                    rows={2}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm resize-y"
                    maxLength={200}
                  />
                </div>
              </div>
              {editErr ? <p className="text-sm text-rose-600">{editErr}</p> : null}
            </div>
            <div className="p-4 sm:px-6 border-t border-slate-100 flex justify-end gap-2 shrink-0 bg-slate-50/80 rounded-b-2xl">
              <button type="button" onClick={closeEditCampus} className={btn(BTN.secondary)}>
                取消
              </button>
              <button type="submit" className={btn(BTN.primary)}>
                保存
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {modalOpen ? (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="hq-campus-modal-title">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-[1px]"
            aria-label="关闭"
            onClick={closeModal}
          />
          <form
            className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl border border-slate-200 max-h-[min(90vh,640px)] flex flex-col"
            onSubmit={submitModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 sm:p-6 border-b border-slate-100 shrink-0">
              <h2 id="hq-campus-modal-title" className="text-base font-bold text-slate-900">
                开设校区 · 校区信息
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                带 * 为必填。可选填对接联系人及联系电话；加盟商工作台登录手机号请在保存后于列表中使用「校区管理员配置」绑定。
              </p>
            </div>
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">校区名称 *</label>
                  <input
                    required
                    value={form.campusName}
                    onChange={(e) => setField('campusName', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    placeholder="例如：滨江旗舰教学中心"
                    maxLength={80}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">联系人（选填）</label>
                  <input
                    value={form.contactName}
                    onChange={(e) => setField('contactName', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    placeholder="对接人、店长等"
                    maxLength={32}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">联系电话（选填）</label>
                  <input
                    value={form.contactPhone}
                    onChange={(e) => setField('contactPhone', e.target.value.replace(/\s+/g, ' ').slice(0, 32))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm tabular-nums"
                    placeholder="手机或座机，可与登录管理员手机不同"
                    maxLength={32}
                    inputMode="tel"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">校区简称 / 编码</label>
                  <input
                    value={form.campusShortCode}
                    onChange={(e) => setField('campusShortCode', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    placeholder="如：滨江店、HZ-BJ"
                    maxLength={32}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">所在地区</label>
                  <input
                    value={form.region}
                    onChange={(e) => setField('region', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    placeholder="省 / 市 / 区"
                    maxLength={64}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">详细地址</label>
                  <textarea
                    value={form.address}
                    onChange={(e) => setField('address', e.target.value)}
                    rows={2}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm resize-y min-h-[2.5rem]"
                    placeholder="门牌、楼层、交通说明等"
                    maxLength={200}
                  />
                </div>
                <div className="sm:col-span-2 rounded-xl border border-slate-100 bg-slate-50/60 p-3 space-y-2">
                  <div className="flex flex-wrap items-baseline justify-between gap-2 gap-y-1">
                    <label className="block text-xs font-medium text-slate-700">开业划拨额度（元）</label>
                    <span className="text-[11px] text-slate-600 tabular-nums">
                      当前剩余可划拨：
                      <strong className="text-emerald-700">¥{fmtMoney(treasuryBalance)}</strong>
                    </span>
                  </div>
                  <input
                    inputMode="decimal"
                    value={form.openingBalanceAllocated}
                    onChange={(e) => setField('openingBalanceAllocated', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm tabular-nums"
                    placeholder="0 表示不划拨；大于 0 时从上方剩余额度中扣除"
                  />
                  {Number.isFinite(allocInputParsed) && !Number.isNaN(allocInputParsed) && allocInputParsed > 0 ? (
                    <p className="text-[11px] leading-relaxed tabular-nums">
                      {afterDeductOk ? (
                        <>
                          本次划扣后，机构总账户余额约{' '}
                          <strong className="text-slate-800">¥{fmtMoney(balanceAfterAllocate)}</strong>
                        </>
                      ) : (
                        <span className="text-rose-600 font-medium">
                          划拨金额超过当前剩余可划拨额度（¥{fmtMoney(treasuryBalance)}），请调整或先到「财务统计」充值。
                        </span>
                      )}
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      填写金额将从机构总当前剩余额度中扣除并写入新校区工作台。额度不足时请先到「财务统计」充值。
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">计划开业日期</label>
                  <input
                    type="date"
                    value={form.plannedOpenDate}
                    onChange={(e) => setField('plannedOpenDate', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">规划学员容量（人）</label>
                  <input
                    inputMode="numeric"
                    value={form.studentCapacity}
                    onChange={(e) => setField('studentCapacity', e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm tabular-nums"
                    placeholder="可选"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">内部备注</label>
                  <textarea
                    value={form.remark}
                    onChange={(e) => setField('remark', e.target.value)}
                    rows={2}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm resize-y"
                    placeholder="仅机构总后台可见，如对接人、装修进度等"
                    maxLength={300}
                  />
                </div>
              </div>
              {err ? <p className="text-sm text-rose-600">{err}</p> : null}
            </div>
            <div className="p-4 sm:px-6 border-t border-slate-100 flex justify-end gap-2 shrink-0 bg-slate-50/80 rounded-b-2xl">
              <button type="button" onClick={closeModal} className={btn(BTN.secondary)}>
                取消
              </button>
              <button
                type="submit"
                disabled={
                  Number.isFinite(allocInputParsed) &&
                  !Number.isNaN(allocInputParsed) &&
                  allocInputParsed > 0 &&
                  allocInputParsed > treasuryBalance
                }
                className={btn(BTN.primary)}
              >
                确认开设
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <InstitutionHqCampusAllocateModal
        open={Boolean(allocateCampus)}
        campus={allocateCampus}
        treasuryBalance={hqTreasury.balance}
        onClose={() => setAllocateCampus(null)}
        onSuccess={refresh}
      />
    </div>
  )
}
