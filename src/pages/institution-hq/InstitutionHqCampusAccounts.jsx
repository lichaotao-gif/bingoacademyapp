import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  addInstitutionCampus,
  getInstitutionHqTreasury,
  listInstitutionCampuses,
  openCampusFranchisePartnerInNewTab,
  removeInstitutionCampus,
} from '../../utils/institutionHqStorage'
import { getWorkspace } from '../../utils/franchisePartnerStorage'

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

function maskPhone11(p) {
  const s = String(p || '').replace(/\D/g, '')
  if (s.length !== 11) return s
  return `${s.slice(0, 3)}****${s.slice(-4)}`
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

  const remove = (id) => {
    if (!window.confirm('确定删除该校区记录？若尚未首次打开该校区的加盟商工作台，开业划拨额度将退回机构总账户；已打开过工作台的校区仅移除列表关联，不退回机构总余额（演示）。')) return
    const r = removeInstitutionCampus(id)
    if (!r.ok) {
      window.alert(r.msg || '删除失败')
      return
    }
    refresh()
  }

  const openCampus = (c) => {
    setBusyId(c.id)
    try {
      openCampusFranchisePartnerInNewTab(c)
    } finally {
      window.setTimeout(() => setBusyId(null), 400)
    }
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">开设校区</h2>
          <p className="text-xs text-slate-500 mt-1">
            为集团新增校区并生成加盟商工作台账号。可为新校区划拨开业余额，金额从机构总账户扣除（演示数据存于本机）。
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="rounded-lg border border-emerald-100 bg-emerald-50/80 px-4 py-2 text-right">
            <p className="text-[10px] font-medium text-emerald-800/90 uppercase tracking-wide">机构总账户余额</p>
            <p className="text-lg font-bold text-emerald-950 tabular-nums">¥{fmtMoney(hqTreasury.balance)}</p>
          </div>
          <button
            type="button"
            onClick={openModal}
            className="rounded-lg bg-primary hover:bg-primary-600 text-white text-sm font-semibold px-5 py-2.5 shadow-sm"
          >
            开设校区
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-bold text-slate-900 mb-3">校区列表</h2>
        <ul className="space-y-3">
          {campuses.map((c) => (
            <li
              key={c.id}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900">{c.campusName}</p>
                  {(c.campusShortCode || c.region || c.address) ? (
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {[c.campusShortCode, c.region, c.address].filter(Boolean).join(' · ')}
                    </p>
                  ) : null}
                  <p className="text-[11px] text-slate-500 tabular-nums mt-1">
                    {maskPhone11(c.adminPhone)}
                    {c.contactName ? ` · ${c.contactName}` : ''}
                    {c.isSeed ? (
                      <span className="ml-2 text-emerald-600">预置</span>
                    ) : (
                      <span className="ml-2 text-sky-600">已开设</span>
                    )}
                  </p>
                  {(c.plannedOpenDate || c.studentCapacity || c.remark) ? (
                    <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                      {[
                        c.plannedOpenDate ? `计划开业：${c.plannedOpenDate}` : '',
                        c.studentCapacity ? `规划容量：${c.studentCapacity} 人` : '',
                        c.remark ? `备注：${c.remark}` : '',
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  ) : null}
                  <p className="text-[11px] text-slate-600 mt-1.5 tabular-nums">
                    开业划拨额度：
                    {!c.isSeed ? `¥${fmtMoney(Number(c.openingBalanceAllocated) || 0)}` : '—（预置）'}
                    <span className="mx-1.5 text-slate-300">|</span>
                    校区账户余额：
                    {campusWalletPreview[c.id] != null ? `¥${fmtMoney(campusWalletPreview[c.id])}` : '—'}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={busyId === c.id}
                    onClick={() => openCampus(c)}
                    className="text-sm font-semibold text-primary hover:underline disabled:opacity-50"
                  >
                    {busyId === c.id ? '打开中…' : '进入校区'}
                  </button>
                  {!c.isSeed ? (
                    <button type="button" onClick={() => remove(c.id)} className="text-xs text-rose-600 hover:underline">
                      删除
                    </button>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

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
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">开业划拨额度（元）</label>
                  <input
                    inputMode="decimal"
                    value={form.openingBalanceAllocated}
                    onChange={(e) => setField('openingBalanceAllocated', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm tabular-nums"
                    placeholder="0 表示不从机构总账户划拨；大于 0 时从机构总余额扣除并写入新校区工作台"
                  />
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                    当前机构总余额 ¥{fmtMoney(hqTreasury.balance)}。额度不足时请先到「财务统计」页演示充值。
                  </p>
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
              <button type="submit" className="rounded-lg bg-primary hover:bg-primary-600 text-white text-sm font-semibold px-5 py-2.5">
                确认开设
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  )
}
