import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { INSTITUTION_HQ_MENUS_FOR_ROLE } from '../../constants/institutionHqPortalNav'
import { INSTITUTION_HQ_DEMO_ORG_ID, INSTITUTION_HQ_DEMO_PHONE } from '../../constants/institutionHqIdentity'
import {
  INSTITUTION_HQ_ACCESS_LS_KEY,
  addHqAccount,
  deleteHqAccount,
  deleteHqRole,
  listHqAccounts,
  listHqRoles,
  updateHqAccount,
  upsertHqRole,
} from '../../utils/institutionHqAccess'
import { normalizePartnerPhoneDigits } from '../../utils/franchisePartnerStorage'

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

export default function InstitutionHqStaffAccounts() {
  const ctx = useOutletContext()
  const session = ctx?.session
  const [tick, setTick] = useState(0)
  const orgId = session?.orgId || INSTITUTION_HQ_DEMO_ORG_ID

  const refresh = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === INSTITUTION_HQ_ACCESS_LS_KEY) refresh()
    }
    const onCustom = () => refresh()
    window.addEventListener('storage', onStorage)
    window.addEventListener('institution-hq-access-changed', onCustom)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('institution-hq-access-changed', onCustom)
    }
  }, [refresh])

  const roles = useMemo(() => {
    void tick
    return listHqRoles(orgId)
  }, [tick, orgId])

  const accounts = useMemo(() => {
    void tick
    return listHqAccounts(orgId)
  }, [tick, orgId])

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
    const r = upsertHqRole(orgId, { id: editingRoleId || undefined, name, menuKeys })
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
    const r = addHqAccount(orgId, {
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
    const r = updateHqAccount(orgId, editAccId, {
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

  const phoneDigits = normalizePartnerPhoneDigits(session.loginPhone)
  const isMainHqPhone = phoneDigits === INSTITUTION_HQ_DEMO_PHONE
  if (session.staffSubUser === true && !isMainHqPhone) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-amber-200/90 bg-gradient-to-br from-amber-50 to-orange-50/40 px-6 py-8 text-sm text-amber-950 shadow-sm">
        <p className="text-base font-semibold text-amber-950">仅主账号可管理机构账号</p>
        <p className="mt-2 leading-relaxed text-amber-900/90">
          当前为权限子账号。请使用机构总管理主账号登录后，再配置角色与可登录总后台的子账号。
        </p>
        <Link
          to="/institution-hq/dashboard"
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
      <header className="overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white via-slate-50/50 to-cyan-50/40 shadow-sm">
        <div className="px-5 py-5 sm:px-8 sm:py-6">
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            机构账号<span className="text-slate-300 font-semibold mx-0.5 select-none">-</span>
            <span className="text-[15px] sm:text-lg font-semibold text-primary-700/90">机构总管理</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
            先配置<strong className="text-slate-800">角色与可访问菜单</strong>，再添加<strong className="text-slate-800">权限子账号</strong>。子账号登录后仅见已授权菜单（不含本页）。
          </p>
        </div>
      </header>

      <div className="inline-flex w-full rounded-xl bg-slate-100/90 p-1 ring-1 ring-slate-200/60 sm:w-auto">
        <button type="button" className={segBtn(tab === 'roles')} onClick={() => setTab('roles')}>
          角色与权限
        </button>
        <button type="button" className={segBtn(tab === 'accounts')} onClick={() => setTab('accounts')}>
          权限子账号
        </button>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/50 px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-slate-900">{tab === 'roles' ? '角色列表' : '子账号列表'}</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {tab === 'roles' ? '每个角色对应一组工作台菜单权限。' : '每个子账号绑定一个角色，用手机号登录机构总管理。'}
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
              添加子账号
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
                      <p className="mt-1 text-xs text-slate-400">点击右上角「新建角色」添加，例如：财务、校区运营。</p>
                    </td>
                  </tr>
                ) : (
                  roles.map((row) => (
                    <tr key={row.id} className="align-top hover:bg-slate-50/60">
                      <td className="px-4 py-4 font-medium text-slate-900 sm:px-6">{row.name}</td>
                      <td className="px-4 py-4 sm:px-6">
                        <MenuChips keys={row.menuKeys} catalog={INSTITUTION_HQ_MENUS_FOR_ROLE} />
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
                              if (!window.confirm('确定删除该角色？若仍有子账号绑定则无法删除。')) return
                              const r = deleteHqRole(orgId, row.id)
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
                      <p className="text-slate-500">暂无权限子账号</p>
                      <p className="mt-1 text-xs text-slate-400">请先配置至少一个角色，再添加子账号。</p>
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
                              if (!window.confirm('确定删除该权限子账号？')) return
                              deleteHqAccount(orgId, row.id)
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
              <p className="mt-1 text-xs text-slate-500">勾选菜单即该角色下子账号在侧栏可见范围。</p>
            </div>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4 sm:px-6">
              <div>
                <label className="text-xs font-medium text-slate-600">角色名称</label>
                <input
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none ring-primary/0 transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                  placeholder="如：财务、校区运营"
                  maxLength={32}
                />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-600">可访问菜单</p>
                <div className="mt-2 grid max-h-52 grid-cols-1 gap-2 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/80 p-3 sm:grid-cols-2">
                  {INSTITUTION_HQ_MENUS_FOR_ROLE.map((m) => (
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
              <h2 className="text-base font-semibold text-slate-900">添加权限子账号</h2>
              <p className="mt-1 text-xs text-slate-500">手机号用于登录机构总管理，请与主账号区分。</p>
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
              <h2 className="text-base font-semibold text-slate-900">编辑权限子账号</h2>
              <p className="mt-1 text-xs text-slate-500">可修改姓名、角色；新密码留空表示不修改登录密码。</p>
            </div>
            <div className="space-y-3.5 px-5 py-4 sm:px-6 overflow-y-auto flex-1 min-h-0">
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
            <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/80 px-5 py-4 sm:px-6 shrink-0">
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
