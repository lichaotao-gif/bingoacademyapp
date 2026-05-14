import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  addInstitutionCampus,
  changeInstitutionCampusAdminPhone,
  getInstitutionHqTreasury,
  listInstitutionCampuses,
  openCampusFranchisePartnerInNewTab,
  removeInstitutionCampus,
  setInstitutionCampusDisabled,
  updateInstitutionCampus,
} from '../../utils/institutionHqStorage'
import { adminSetPartnerMainLoginPassword, getWorkspace, normalizePartnerPhoneDigits } from '../../utils/franchisePartnerStorage'
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
  adminPhone: '',
  plannedOpenDate: '',
  studentCapacity: '',
  remark: '',
  passwordHint: '',
  openingBalanceAllocated: '',
})

const emptyEditForm = () => ({
  campusName: '',
  campusShortCode: '',
  region: '',
  address: '',
  contactName: '',
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
    adminPhone: c.adminPhone || '',
    plannedOpenDate: c.plannedOpenDate || '',
    studentCapacity: c.studentCapacity != null && c.studentCapacity !== '' ? String(c.studentCapacity) : '',
    remark: c.remark || '',
    passwordHint: c.passwordHint || '',
  }
}

export default function InstitutionHqCampusAccounts() {
  const [tick, setTick] = useState(0)
  const refresh = useCallback(() => setTick((t) => t + 1), [])
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

  useEffect(() => {
    const onTreasury = () => refresh()
    window.addEventListener('institution-hq-treasury-changed', onTreasury)
    return () => window.removeEventListener('institution-hq-treasury-changed', onTreasury)
  }, [refresh])

  const [modalOpen, setModalOpen] = useState(false)
  const [allocateCampus, setAllocateCampus] = useState(null)
  const [editCampus, setEditCampus] = useState(null)
  const [editForm, setEditForm] = useState(() => emptyEditForm())
  const [editErr, setEditErr] = useState('')
  const [replaceCampus, setReplaceCampus] = useState(null)
  const [replaceNewPhone, setReplaceNewPhone] = useState('')
  const [replaceErr, setReplaceErr] = useState('')

  /** 预置校区：仅允许重置加盟商主号登录密码（不改存档资料） */
  const [seedEditCampus, setSeedEditCampus] = useState(null)
  const [seedPwd, setSeedPwd] = useState('')
  const [seedPwd2, setSeedPwd2] = useState('')
  const [seedPwdErr, setSeedPwdErr] = useState('')
  const [form, setForm] = useState(emptyForm)
  const [err, setErr] = useState('')
  const [busyId, setBusyId] = useState(null)

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
      adminPhone: form.adminPhone,
      contactName: form.contactName,
      region: form.region,
      address: form.address,
      campusShortCode: form.campusShortCode,
      plannedOpenDate: form.plannedOpenDate,
      studentCapacity: form.studentCapacity,
      remark: form.remark,
      passwordHint: form.passwordHint,
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

  const closeSeedEditCampus = () => {
    setSeedEditCampus(null)
    setSeedPwd('')
    setSeedPwd2('')
    setSeedPwdErr('')
  }

  const submitSeedEditPwd = (e) => {
    e.preventDefault()
    setSeedPwdErr('')
    if (!seedEditCampus) return
    if (seedPwd.length < 6) {
      setSeedPwdErr('新密码至少 6 位')
      return
    }
    if (seedPwd !== seedPwd2) {
      setSeedPwdErr('两次输入的密码不一致')
      return
    }
    const phone = normalizePartnerPhoneDigits(seedEditCampus.adminPhone)
    const r = adminSetPartnerMainLoginPassword(phone, seedPwd)
    if (!r.ok) {
      setSeedPwdErr(r.msg || '保存失败')
      return
    }
    closeSeedEditCampus()
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
    <div className="w-full space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 lg:p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch lg:justify-between lg:gap-8">
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">开设校区</h2>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed max-w-3xl">
              为集团新增校区并生成加盟商工作台账号。可为新校区划拨开业余额，金额从机构总账户扣除。
            </p>
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch gap-3 sm:gap-4 shrink-0 lg:max-w-md w-full lg:w-auto">
            <div className="rounded-xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50 to-white px-4 py-3 sm:px-5 sm:py-4 flex-1 min-w-[11rem]">
              <p className="text-[11px] font-medium text-emerald-800/90">机构总账户 · 当前剩余可划拨</p>
              <p className="text-xl sm:text-2xl font-bold text-emerald-950 tabular-nums mt-1">¥{fmtMoney(treasuryBalance)}</p>
              <p className="text-[10px] text-emerald-800/70 mt-1.5 leading-snug">新开校区填写的开业划拨将从此余额扣减</p>
            </div>
            <button
              type="button"
              onClick={openModal}
              className="rounded-xl bg-primary hover:bg-primary-600 text-white text-sm font-semibold px-6 py-3 shadow-sm self-stretch sm:self-auto sm:min-w-[8.5rem]"
            >
              开设校区
            </button>
          </div>
        </div>
      </section>

      <section className="w-full">
        <div className="flex flex-wrap items-end justify-between gap-2 mb-4">
          <h2 className="text-base font-bold text-slate-900">校区列表</h2>
          <p className="text-xs text-slate-500">共 {campuses.length} 个校区</p>
        </div>
        <ul className="grid gap-4 sm:grid-cols-1 xl:grid-cols-2">
          {campuses.map((c) => (
            <li
              key={c.id}
              className={`rounded-2xl border bg-white p-4 sm:p-5 shadow-sm min-w-0 ${
                c.disabled ? 'border-amber-200/90 bg-amber-50/25' : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-900 text-[15px] leading-snug">{c.campusName}</p>
                    {c.disabled ? (
                      <span className="text-[10px] font-semibold uppercase tracking-wide rounded-md bg-amber-100 px-2 py-0.5 text-amber-900">
                        已禁用
                      </span>
                    ) : null}
                  </div>
                  {(c.campusShortCode || c.region || c.address) ? (
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {[c.campusShortCode, c.region, c.address].filter(Boolean).join(' · ')}
                    </p>
                  ) : null}
                  <p className="text-[11px] text-slate-500 tabular-nums flex flex-wrap items-center gap-x-1 gap-y-0.5">
                    <span className="text-slate-500 shrink-0">管理员：</span>
                    <span className="font-medium text-slate-800">{normalizePartnerPhoneDigits(c.adminPhone) || '—'}</span>
                    {!c.disabled ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (c.isSeed) {
                            setSeedEditCampus(c)
                            setSeedPwd('')
                            setSeedPwd2('')
                            setSeedPwdErr('')
                          } else {
                            openEditCampus(c)
                          }
                        }}
                        className="text-[11px] font-semibold text-primary hover:underline bg-transparent border-0 p-0 cursor-pointer shadow-none shrink-0"
                      >
                        编辑
                      </button>
                    ) : null}
                    {c.contactName ? <span className="text-slate-500">· {c.contactName}</span> : null}
                  </p>
                  {(c.plannedOpenDate || c.studentCapacity || c.remark) ? (
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {[
                        c.plannedOpenDate ? `计划开业：${c.plannedOpenDate}` : '',
                        c.studentCapacity ? `规划容量：${c.studentCapacity} 人` : '',
                        c.remark ? `备注：${c.remark}` : '',
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  ) : null}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-[11px] text-slate-600 tabular-nums">
                    <span>
                      开业划拨：
                      <span className="font-semibold text-slate-800">
                        {!c.isSeed ? `¥${fmtMoney(Number(c.openingBalanceAllocated) || 0)}` : '—'}
                      </span>
                    </span>
                    <span className="inline-flex flex-wrap items-baseline gap-x-1">
                      校区账户余额：
                      <span className="font-semibold text-slate-800">
                        {campusWalletPreview[c.id] != null ? `¥${fmtMoney(campusWalletPreview[c.id])}` : '—'}
                      </span>
                      <button
                        type="button"
                        disabled={Boolean(c.disabled)}
                        onClick={() => !c.disabled && setAllocateCampus(c)}
                        className="text-[11px] font-semibold text-primary hover:underline disabled:opacity-35 disabled:no-underline bg-transparent border-0 p-0 m-0 cursor-pointer shadow-none shrink-0"
                      >
                        拨款
                      </button>
                    </span>
                  </div>
                </div>
                <div className="flex flex-row flex-wrap sm:flex-col items-center sm:items-end justify-end sm:justify-start gap-x-3 gap-y-2 shrink-0 border-t border-slate-100 sm:border-0 pt-3 sm:pt-0">
                  {!c.isSeed ? (
                    <>
                      {!c.disabled ? (
                        <button
                          type="button"
                          onClick={() => openReplaceAdmin(c)}
                          className="text-sm font-semibold text-slate-700 hover:text-slate-900 hover:underline whitespace-nowrap bg-transparent border-0 p-0 cursor-pointer shadow-none"
                        >
                          管理员更换
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => toggleCampusDisable(c)}
                        className="text-sm font-semibold text-slate-700 hover:text-slate-900 hover:underline whitespace-nowrap bg-transparent border-0 p-0 cursor-pointer shadow-none"
                      >
                        {c.disabled ? '启用' : '禁用'}
                      </button>
                    </>
                  ) : null}
                  <button
                    type="button"
                    disabled={busyId === c.id || Boolean(c.disabled)}
                    onClick={() => openCampus(c)}
                    className="text-sm font-semibold text-primary hover:underline disabled:opacity-35 disabled:no-underline whitespace-nowrap bg-transparent border-0 p-0 cursor-pointer shadow-none"
                  >
                    {busyId === c.id ? '打开中…' : '进入校区'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (c.isSeed) {
                        window.alert(
                          '预置演示校区不可解散，仅供体验。若需练习解散流程，请先用「开设校区」新增正式校区后再操作。',
                        )
                        return
                      }
                      dissolveCampus(c)
                    }}
                    title={c.isSeed ? '预置演示校区不可解散' : undefined}
                    className={
                      c.isSeed
                        ? 'rounded-lg border border-slate-200 bg-slate-50 text-slate-500 text-sm font-semibold px-3 py-2 whitespace-nowrap transition shadow-none hover:bg-slate-100'
                        : 'rounded-lg border border-rose-200 bg-rose-50/80 hover:bg-rose-100 text-rose-700 text-sm font-semibold px-3 py-2 whitespace-nowrap transition shadow-none'
                    }
                  >
                    解散校区
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
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
              <button type="button" onClick={closeReplaceAdmin} className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                取消
              </button>
              <button type="submit" className="rounded-lg bg-primary hover:bg-primary-600 text-white text-sm font-semibold px-5 py-2.5">
                确认更换
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {seedEditCampus ? (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="hq-campus-seed-edit-title">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-[1px]"
            aria-label="关闭"
            onClick={closeSeedEditCampus}
          />
          <form
            className="relative w-full max-w-md rounded-2xl bg-white shadow-xl border border-slate-200 flex flex-col"
            onSubmit={submitSeedEditPwd}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 sm:p-6 border-b border-slate-100 shrink-0">
              <h2 id="hq-campus-seed-edit-title" className="text-base font-bold text-slate-900">
                编辑校区主号 · {seedEditCampus.campusName}
              </h2>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                本条为演示固定校区：不能修改存档资料、不能更换登录手机或删除。若需改资料或换绑，请使用「开设校区」新增正式校区。此处仅可重置当前管理员手机对应的加盟商主号登录密码（本地演示存储）。
              </p>
              <p className="text-xs text-slate-600 mt-2 tabular-nums">
                登录手机：<span className="font-medium text-slate-800">{normalizePartnerPhoneDigits(seedEditCampus.adminPhone) || '—'}</span>
              </p>
            </div>
            <div className="p-5 sm:p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">新密码（至少 6 位）</label>
                <input
                  type="text"
                  autoComplete="off"
                  value={seedPwd}
                  onChange={(e) => setSeedPwd(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">确认新密码</label>
                <input
                  type="text"
                  autoComplete="off"
                  value={seedPwd2}
                  onChange={(e) => setSeedPwd2(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                />
              </div>
              {seedPwdErr ? <p className="text-sm text-rose-600">{seedPwdErr}</p> : null}
            </div>
            <div className="p-4 sm:px-6 border-t border-slate-100 flex justify-end gap-2 shrink-0 bg-slate-50/80 rounded-b-2xl">
              <button type="button" onClick={closeSeedEditCampus} className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                取消
              </button>
              <button type="submit" className="rounded-lg bg-primary hover:bg-primary-600 text-white text-sm font-semibold px-5 py-2.5">
                保存密码
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
                管理员修改 · {editCampus.campusName}
              </h2>
              <p className="text-xs text-slate-500 mt-1">可修改校区资料与管理员展示信息。登录手机与渠道编码不可在此变更。</p>
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
                  <label className="block text-xs font-medium text-slate-600 mb-1">校区管理员姓名</label>
                  <input
                    value={editForm.contactName}
                    onChange={(e) => setEditField('contactName', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    maxLength={32}
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
              <button type="button" onClick={closeEditCampus} className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
                取消
              </button>
              <button type="submit" className="rounded-lg bg-primary hover:bg-primary-600 text-white text-sm font-semibold px-5 py-2.5">
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
                开设校区 · 配置信息
              </h2>
              <p className="text-xs text-slate-500 mt-1">带 * 为必填；保存后将出现在校区列表（渠道编码由系统自动生成，无需填写）。</p>
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
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">校区管理员姓名</label>
                  <input
                    value={form.contactName}
                    onChange={(e) => setField('contactName', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    placeholder="用于工作台展示名"
                    maxLength={32}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">管理员手机（登录账号）*</label>
                  <input
                    required
                    inputMode="numeric"
                    value={form.adminPhone}
                    onChange={(e) => setField('adminPhone', e.target.value.replace(/\D/g, '').slice(0, 11))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm tabular-nums"
                    placeholder="11 位手机号"
                    maxLength={11}
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
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">登录提示（选填）</label>
                  <textarea
                    value={form.passwordHint}
                    onChange={(e) => setField('passwordHint', e.target.value)}
                    rows={2}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm resize-y"
                    placeholder="留空则使用默认提示；可填写初始密码领取方式等"
                    maxLength={200}
                  />
                </div>
              </div>
              {err ? <p className="text-sm text-rose-600">{err}</p> : null}
            </div>
            <div className="p-4 sm:px-6 border-t border-slate-100 flex justify-end gap-2 shrink-0 bg-slate-50/80 rounded-b-2xl">
              <button type="button" onClick={closeModal} className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
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
                className="rounded-lg bg-primary hover:bg-primary-600 disabled:opacity-45 disabled:pointer-events-none text-white text-sm font-semibold px-5 py-2.5"
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
