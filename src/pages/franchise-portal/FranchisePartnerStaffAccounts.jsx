import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FRANCHISE_PARTNER_MENUS_FOR_ROLE } from '../../constants/franchisePartnerPortalNav'
import {
  FRANCHISE_INSTITUTION_ACCOUNTS_LS_KEY,
  addInstitutionAccount,
  deleteInstitutionAccount,
  deleteInstitutionRole,
  listInstitutionAccounts,
  listInstitutionRoles,
  updateInstitutionAccount,
  upsertInstitutionRole,
} from '../../utils/franchiseInstitutionAccounts'
import { FRANCHISE_PREVIEW_DEMO_MAIN_PHONE, normalizePartnerPhoneDigits } from '../../utils/franchisePartnerStorage'
import { useFranchiseWorkspace } from './useFranchiseWorkspace'

function fmtTime(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('zh-CN')
  } catch {
    return '—'
  }
}

function MenuChips({ keys, catalog }) {
  const list = Array.isArray(keys) ? keys : []
  if (!list.length) return <span className="text-slate-400 text-xs">未配置</span>
  return (
    <div className="flex flex-wrap gap-1.5">
      {list.map((k) => (
        <span
          key={k}
          className="inline-flex max-w-full truncate rounded-md border border-slate-200/90 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700"
          title={catalog.find((x) => x.key === k)?.label || k}
        >
          {catalog.find((x) => x.key === k)?.label || k}
        </span>
      ))}
    </div>
  )
}

function ModalBackdrop({ onClose, children }) {
  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true">
      <button type="button" className="absolute inset-0 bg-slate-900/45 backdrop-blur-[1px]" aria-label="关闭" onClick={onClose} />
      <div className="relative z-10 w-full max-h-[92vh] overflow-hidden sm:max-w-lg sm:rounded-2xl sm:border sm:border-slate-200/90 sm:shadow-2xl rounded-t-2xl border-t border-slate-200 bg-white shadow-[0_-8px_30px_rgba(15,23,42,0.12)]">
        {children}
      </div>
    </div>
  )
}

export default function FranchisePartnerStaffAccounts() {
  const { session } = useFranchiseWorkspace()
  const [tick, setTick] = useState(0)
  const partnerId = session?.partnerId

  const refresh = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === FRANCHISE_INSTITUTION_ACCOUNTS_LS_KEY) refresh()
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [refresh])

  const roles = useMemo(() => {
    void tick
    if (!partnerId) return []
    return listInstitutionRoles(partnerId)
  }, [tick, partnerId])

  const accounts = useMemo(() => {
    void tick
    if (!partnerId) return []
    return listInstitutionAccounts(partnerId)
  }, [tick, partnerId])

  const [tab, setTab] = useState('roles')
  const [roleModal, setRoleModal] = useState(false)
  const [editingRoleId, setEditingRoleId] = useState(null)
  const [roleName, setRoleName] = useState('')
  const [roleMenuKeys, setRoleMenuKeys] = useState(() => new Set(['dashboard']))
  const [roleErr, setRoleErr] = useState('')

  const [accModal, setAccModal] = useState(false)
  const [accName, setAccName] = useState('')
  const [accPhone, setAccPhone] = useState('')
  const [accPassword, setAccPassword] = useState('')
  const [accRoleId, setAccRoleId] = useState('')
  const [accErr, setAccErr] = useState('')

  const [editAccModal, setEditAccModal] = useState(false)
  const [editAccId, setEditAccId] = useState(null)
  const [editAccName, setEditAccName] = useState('')
  const [editAccPhone, setEditAccPhone] = useState('')
  const [editAccRoleId, setEditAccRoleId] = useState('')
  const [editAccPassword, setEditAccPassword] = useState('')
  const [editAccErr, setEditAccErr] = useState('')

  const openRoleCreate = () => {
    setEditingRoleId(null)
    setRoleName('')
    setRoleMenuKeys(new Set(['dashboard']))
    setRoleErr('')
    setRoleModal(true)
  }

  const openRoleEdit = (row) => {
    setEditingRoleId(row.id)
    setRoleName(row.name || '')
    setRoleMenuKeys(new Set(Array.isArray(row.menuKeys) && row.menuKeys.length ? row.menuKeys : ['dashboard']))
    setRoleErr('')
    setRoleModal(true)
  }

  const saveRole = (e) => {
    e.preventDefault()
    setRoleErr('')
    const name = roleName.trim()
    if (!name) {
      setRoleErr('请填写角色名称')
      return
    }
    const menuKeys = [...roleMenuKeys]
    if (!menuKeys.length) {
      setRoleErr('请至少勾选一个菜单权限')
      return
    }
    const r = upsertInstitutionRole(partnerId, { id: editingRoleId || undefined, name, menuKeys })
    if (!r.ok) {
      setRoleErr(r.msg || '保存失败')
      return
    }
    setRoleModal(false)
    refresh()
  }

  const toggleMenuKey = (key, checked) => {
    setRoleMenuKeys((prev) => {
      const next = new Set(prev)
      if (checked) next.add(key)
      else next.delete(key)
      return next
    })
  }

  const openAccModal = () => {
    if (!roles.length) {
      window.alert('请先创建至少一个角色')
      return
    }
    setAccName('')
    setAccPhone('')
    setAccPassword('')
    setAccRoleId(roles[0]?.id || '')
    setAccErr('')
    setAccModal(true)
  }

  const saveAccount = (e) => {
    e.preventDefault()
    setAccErr('')
    const r = addInstitutionAccount(partnerId, session.refCode, session.orgName, {
      name: accName,
      phone: accPhone,
      password: accPassword,
      roleId: accRoleId,
    })
    if (!r.ok) {
      setAccErr(r.msg || '添加失败')
      return
    }
    setAccModal(false)
    refresh()
  }

  const openEditAccount = (row) => {
    setEditAccId(row.id)
    setEditAccName(row.name || '')
    setEditAccPhone(row.phone || '')
    setEditAccRoleId(row.roleId || '')
    setEditAccPassword('')
    setEditAccErr('')
    setEditAccModal(true)
  }

  const saveEditAccount = (e) => {
    e.preventDefault()
    setEditAccErr('')
    const r = updateInstitutionAccount(partnerId, editAccId, {
      name: editAccName,
      roleId: editAccRoleId,
      password: editAccPassword,
    })
    if (!r.ok) {
      setEditAccErr(r.msg || '保存失败')
      return
    }
    setEditAccModal(false)
    setEditAccId(null)
    setEditAccPassword('')
    refresh()
  }

  if (!session) return <p className="text-slate-500 text-sm">加载中…</p>

  const phoneDigits = normalizePartnerPhoneDigits(session.phone)
  const isPreviewDemoMainPhone = phoneDigits === FRANCHISE_PREVIEW_DEMO_MAIN_PHONE
  if (session.staffSubUser === true && !isPreviewDemoMainPhone) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-amber-200/90 bg-gradient-to-br from-amber-50 to-orange-50/40 px-6 py-8 text-sm text-amber-950 shadow-sm">
        <p className="text-base font-semibold text-amber-950">仅机构主账号可管理机构账号</p>
        <p className="mt-2 leading-relaxed text-amber-900/90">
          当前为子账号登录。请使用机构主账号手机号登录工作台后，再配置角色与员工账号。
        </p>
        <Link
          to="/franchise-partner/dashboard"
          className="mt-5 inline-flex items-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-primary shadow-sm ring-1 ring-slate-200/80 hover:bg-slate-50"
        >
          返回首页
        </Link>
      </div>
    )
  }

  const segBtn = (active) =>
    `relative flex-1 rounded-lg px-3 py-2.5 text-sm font-semibold transition-all sm:flex-none sm:min-w-[8.5rem] ${
      active ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80' : 'text-slate-600 hover:text-slate-900'
    }`

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-2">
      <header className="overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white via-[#f4f6fb] to-cyan-50/40 shadow-sm">
        <div className="px-5 py-5 sm:px-8 sm:py-6">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            机构账号<span className="text-slate-300 font-semibold mx-0.5 select-none">-</span>
            <span className="text-[15px] sm:text-lg font-semibold text-primary">校区工作台</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
            为<strong className="text-slate-800">角色</strong>分配可访问的菜单，再添加<strong className="text-slate-800">员工子账号</strong>。员工使用本人手机号登录，侧栏仅显示已授权功能（不含本页）。
          </p>
        </div>
      </header>

      <div className="inline-flex w-full rounded-xl bg-slate-100/90 p-1 ring-1 ring-slate-200/60 sm:w-auto">
        <button type="button" className={segBtn(tab === 'roles')} onClick={() => setTab('roles')}>
          角色与权限
        </button>
        <button type="button" className={segBtn(tab === 'accounts')} onClick={() => setTab('accounts')}>
          员工账号
        </button>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/50 px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-slate-900">{tab === 'roles' ? '角色列表' : '员工列表'}</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {tab === 'roles' ? '角色决定工作台菜单范围。' : '每位员工绑定一个角色，用于登录与权限控制。'}
            </p>
          </div>
          {tab === 'roles' ? (
            <button
              type="button"
              onClick={openRoleCreate}
              className="shrink-0 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-600"
            >
              新建角色
            </button>
          ) : (
            <button
              type="button"
              onClick={openAccModal}
              className="shrink-0 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-600"
            >
              添加员工
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          {tab === 'roles' ? (
            <table className="w-full min-w-[min(100%,560px)] table-fixed text-left text-sm">
              <colgroup>
                <col className="w-[22%]" />
                <col className="w-[58%]" />
                <col className="w-[20%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-slate-100 bg-white text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 sm:px-6">角色名称</th>
                  <th className="px-4 py-3 sm:px-6">可访问菜单</th>
                  <th className="px-4 py-3 text-right sm:px-6">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {roles.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-14 text-center sm:px-6">
                      <p className="text-slate-500">暂无角色</p>
                      <p className="mt-1 text-xs text-slate-400">点击「新建角色」添加，例如：班主任、教学主管。</p>
                    </td>
                  </tr>
                ) : (
                  roles.map((row) => (
                    <tr key={row.id} className="align-top hover:bg-slate-50/60">
                      <td className="px-4 py-4 font-medium text-slate-900 sm:px-6">{row.name}</td>
                      <td className="px-4 py-4 sm:px-6">
                        <MenuChips keys={row.menuKeys} catalog={FRANCHISE_PARTNER_MENUS_FOR_ROLE} />
                      </td>
                      <td className="px-4 py-4 text-right sm:px-6">
                        <div className="inline-flex flex-col items-stretch gap-1.5 sm:inline-flex sm:flex-row sm:items-center sm:justify-end sm:gap-2">
                          <button
                            type="button"
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-primary hover:bg-slate-50"
                            onClick={() => openRoleEdit(row)}
                          >
                            编辑
                          </button>
                          <button
                            type="button"
                            className="rounded-lg border border-rose-200/80 bg-rose-50/50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                            onClick={() => {
                              if (!window.confirm('确定删除该角色？若仍有员工绑定则无法删除。')) return
                              const r = deleteInstitutionRole(partnerId, row.id)
                              if (!r.ok) window.alert(r.msg || '删除失败')
                              else refresh()
                            }}
                          >
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full min-w-[min(100%,640px)] table-fixed text-left text-sm">
              <colgroup>
                <col className="w-[18%]" />
                <col className="w-[22%]" />
                <col className="w-[18%]" />
                <col className="w-[22%]" />
                <col className="w-[20%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-slate-100 bg-white text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 sm:px-6">姓名</th>
                  <th className="px-4 py-3 sm:px-6">手机号</th>
                  <th className="px-4 py-3 sm:px-6">角色</th>
                  <th className="px-4 py-3 sm:px-6">创建时间</th>
                  <th className="px-4 py-3 text-right sm:px-6">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {accounts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-14 text-center sm:px-6">
                      <p className="text-slate-500">暂无员工子账号</p>
                      <p className="mt-1 text-xs text-slate-400">请先配置至少一个角色，再添加员工。</p>
                    </td>
                  </tr>
                ) : (
                  accounts.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3.5 font-medium text-slate-900 sm:px-6">{row.name}</td>
                      <td className="px-4 py-3.5 tabular-nums text-slate-700 sm:px-6">{row.phone}</td>
                      <td className="px-4 py-3.5 text-slate-600 sm:px-6">{row.roleName || row.roleId}</td>
                      <td className="px-4 py-3.5 text-xs tabular-nums text-slate-500 sm:px-6">{fmtTime(row.createdAt)}</td>
                      <td className="px-4 py-3.5 text-right sm:px-6">
                        <div className="inline-flex flex-col items-stretch gap-1.5 sm:inline-flex sm:flex-row sm:justify-end sm:gap-2">
                          <button
                            type="button"
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-primary hover:bg-slate-50"
                            onClick={() => openEditAccount(row)}
                          >
                            编辑
                          </button>
                          <button
                            type="button"
                            className="rounded-lg border border-rose-200/80 bg-rose-50/50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                            onClick={() => {
                              if (!window.confirm('确定删除该员工账号？')) return
                              deleteInstitutionAccount(partnerId, row.id)
                              refresh()
                            }}
                          >
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {roleModal ? (
        <ModalBackdrop onClose={() => setRoleModal(false)}>
          <form onSubmit={saveRole} onClick={(e) => e.stopPropagation()} className="flex max-h-[92vh] flex-col">
            <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
              <h2 className="text-base font-semibold text-slate-900">{editingRoleId ? '编辑角色' : '新建角色'}</h2>
              <p className="mt-1 text-xs text-slate-500">勾选后，绑定该角色的员工登录时仅见对应侧栏菜单。</p>
            </div>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4 sm:px-6">
              <div>
                <label className="text-xs font-medium text-slate-600">角色名称</label>
                <input
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                  placeholder="如：班主任、教学主管"
                  maxLength={32}
                />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-600">可访问菜单</p>
                <div className="mt-2 grid max-h-52 grid-cols-1 gap-2 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/80 p-3 sm:grid-cols-2">
                  {FRANCHISE_PARTNER_MENUS_FOR_ROLE.map((m) => (
                    <label key={m.key} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-800 hover:bg-white/80">
                      <input
                        type="checkbox"
                        checked={roleMenuKeys.has(m.key)}
                        onChange={(e) => toggleMenuKey(m.key, e.target.checked)}
                        className="rounded border-slate-300 text-primary"
                      />
                      {m.label}
                    </label>
                  ))}
                </div>
              </div>
              {roleErr ? <p className="text-sm text-rose-600">{roleErr}</p> : null}
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/80 px-5 py-4 sm:px-6">
              <button type="button" onClick={() => setRoleModal(false)} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                取消
              </button>
              <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600">
                保存
              </button>
            </div>
          </form>
        </ModalBackdrop>
      ) : null}

      {accModal ? (
        <ModalBackdrop onClose={() => setAccModal(false)}>
          <form onSubmit={saveAccount} onClick={(e) => e.stopPropagation()} className="flex max-h-[92vh] flex-col">
            <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
              <h2 className="text-base font-semibold text-slate-900">添加员工账号</h2>
              <p className="mt-1 text-xs text-slate-500">手机号用于登录加盟商工作台，请勿与机构主账号重复。</p>
            </div>
            <div className="space-y-3.5 px-5 py-4 sm:px-6">
              <div>
                <label className="text-xs font-medium text-slate-600">姓名</label>
                <input value={accName} onChange={(e) => setAccName(e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">手机号（登录账号）</label>
                <input
                  value={accPhone}
                  onChange={(e) => setAccPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm tabular-nums"
                  maxLength={11}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">初始密码（至少 6 位）</label>
                <input type="text" value={accPassword} onChange={(e) => setAccPassword(e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" autoComplete="off" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">角色</label>
                <select value={accRoleId} onChange={(e) => setAccRoleId(e.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm">
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              {accErr ? <p className="text-sm text-rose-600">{accErr}</p> : null}
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/80 px-5 py-4 sm:px-6">
              <button type="button" onClick={() => setAccModal(false)} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                取消
              </button>
              <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600">
                添加
              </button>
            </div>
          </form>
        </ModalBackdrop>
      ) : null}

      {editAccModal ? (
        <ModalBackdrop onClose={() => setEditAccModal(false)}>
          <form onSubmit={saveEditAccount} onClick={(e) => e.stopPropagation()} className="flex max-h-[92vh] flex-col">
            <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
              <h2 className="text-base font-semibold text-slate-900">编辑员工账号</h2>
              <p className="mt-1 text-xs text-slate-500">可修改姓名、角色；新密码留空表示不修改登录密码。</p>
            </div>
            <div className="min-h-0 flex-1 space-y-3.5 overflow-y-auto px-5 py-4 sm:px-6">
              <div>
                <label className="text-xs font-medium text-slate-600">姓名</label>
                <input
                  value={editAccName}
                  onChange={(e) => setEditAccName(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                  maxLength={32}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">手机号（登录账号）</label>
                <input
                  value={editAccPhone}
                  readOnly
                  disabled
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm tabular-nums text-slate-600"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">角色</label>
                <select
                  value={editAccRoleId}
                  onChange={(e) => setEditAccRoleId(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">新密码（选填，至少 6 位）</label>
                <input
                  type="text"
                  value={editAccPassword}
                  onChange={(e) => setEditAccPassword(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                  autoComplete="off"
                  placeholder="留空则不修改密码"
                />
              </div>
              {editAccErr ? <p className="text-sm text-rose-600">{editAccErr}</p> : null}
            </div>
            <div className="flex shrink-0 justify-end gap-2 border-t border-slate-100 bg-slate-50/80 px-5 py-4 sm:px-6">
              <button
                type="button"
                onClick={() => setEditAccModal(false)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                取消
              </button>
              <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600">
                保存
              </button>
            </div>
          </form>
        </ModalBackdrop>
      ) : null}
    </div>
  )
}
