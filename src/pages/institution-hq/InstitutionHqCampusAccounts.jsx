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

/** 表格行内操作：统一小号高度，避免与表体字号脱节 */
const ROW_BTN = {
  base: 'inline-flex min-h-8 shrink-0 items-center justify-center rounded-md text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-45 px-2.5',
  ghost: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
  primary: 'border border-primary bg-primary text-white shadow-sm hover:bg-primary-600',
  accent: 'border border-primary/35 bg-primary/[0.08] text-primary hover:bg-primary/12',
  danger: 'border border-rose-200 bg-white text-rose-700 hover:bg-rose-50',
  dangerMuted: 'border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100',
}

function rowBtn(variant) {
  const v = ROW_BTN[variant] || ROW_BTN.ghost
  return [ROW_BTN.base, v].join(' ')
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
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* 开设校区 */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between gap-y-4">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-slate-900">开设校区</h2>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed max-w-2xl">
                新增校区并生成加盟商工作台；可选从机构总账户划拨开业余额（从右侧剩余额度扣减）。
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
        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-sm text-left min-w-[960px]">
            <colgroup>
              <col className="w-[24%]" />
              <col className="w-[8%]" />
              <col className="w-[14%]" />
              <col className="w-[12%]" />
              <col className="w-[11%]" />
              <col className="w-[11%]" />
              <col className="w-[20%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/90 text-xs font-medium text-slate-600">
                <th className="px-4 py-2.5 text-left align-middle">校区</th>
                <th className="px-3 py-2.5 text-left align-middle">状态</th>
                <th className="px-3 py-2.5 text-left align-middle">管理员手机</th>
                <th className="px-3 py-2.5 text-left align-middle">联系人</th>
                <th className="px-3 py-2.5 text-right align-middle">开业划拨</th>
                <th className="px-3 py-2.5 text-right align-middle">账户余额</th>
                <th className="px-4 py-2.5 text-right align-middle">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {campuses.map((c) => {
                const planBits = [
                  c.plannedOpenDate ? `计划开业 ${c.plannedOpenDate}` : '',
                  c.studentCapacity ? `容量 ${c.studentCapacity} 人` : '',
                  c.remark ? c.remark : '',
                ].filter(Boolean)
                return (
                  <tr key={c.id} className={`align-middle ${c.disabled ? 'bg-amber-50/40' : 'hover:bg-slate-50/60'}`}>
                    <td className="px-4 py-3 align-top min-w-0">
                      <div className="text-sm font-semibold text-slate-900 leading-snug">{c.campusName}</div>
                      {(c.campusShortCode || c.region || c.address) ? (
                        <div className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                          {[c.campusShortCode, c.region, c.address].filter(Boolean).join(' · ')}
                        </div>
                      ) : null}
                      {planBits.length ? (
                        <div className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2" title={planBits.join(' · ')}>
                          {planBits.join(' · ')}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-3 py-3 align-middle">
                      <div className="flex flex-col gap-1">
                        {c.isSeed ? (
                          <span className="inline-flex w-fit text-xs font-medium rounded-md bg-sky-100 px-2 py-0.5 text-sky-900">预置</span>
                        ) : (
                          <span className="inline-flex w-fit text-xs font-medium rounded-md bg-slate-100 px-2 py-0.5 text-slate-700">已开设</span>
                        )}
                        {c.disabled ? (
                          <span className="inline-flex w-fit text-xs font-medium rounded-md bg-amber-100 px-2 py-0.5 text-amber-900">已禁用</span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-3 py-3 align-middle tabular-nums text-sm text-slate-800 font-medium whitespace-nowrap">
                      {normalizePartnerPhoneDigits(c.adminPhone) || '—'}
                    </td>
                    <td className="px-3 py-3 align-middle text-sm text-slate-700 min-w-0">
                      <span className="block truncate" title={c.contactName || ''}>
                        {c.contactName || '—'}
                      </span>
                    </td>
                    <td className="px-3 py-3 align-middle text-right tabular-nums text-sm text-slate-800 whitespace-nowrap">
                      {!c.isSeed ? `¥${fmtMoney(Number(c.openingBalanceAllocated) || 0)}` : '—'}
                    </td>
                    <td className="px-3 py-3 align-middle text-right tabular-nums text-sm text-slate-800 whitespace-nowrap">
                      {campusWalletPreview[c.id] != null ? `¥${fmtMoney(campusWalletPreview[c.id])}` : '—'}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex flex-wrap items-center justify-end gap-1.5">
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
                            className={rowBtn('ghost')}
                          >
                            {c.isSeed ? '重置密码' : '编辑'}
                          </button>
                        ) : null}
                        {!c.isSeed && !c.disabled ? (
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
                          className={rowBtn('accent')}
                        >
                          拨款
                        </button>
                        <button
                          type="button"
                          disabled={busyId === c.id || Boolean(c.disabled)}
                          onClick={() => openCampus(c)}
                          className={rowBtn('primary')}
                        >
                          {busyId === c.id ? '打开…' : '进入'}
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
              <button type="button" onClick={closeSeedEditCampus} className={btn(BTN.secondary)}>
                取消
              </button>
              <button type="submit" className={btn(BTN.primary)}>
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
