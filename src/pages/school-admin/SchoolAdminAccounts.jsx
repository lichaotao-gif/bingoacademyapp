import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import {
  ACCOUNT_STATUS,
  createTeacherAccount,
  deleteTeacherAccount,
  fmtDateTime,
  importTeacherAccounts,
  listSchoolAccounts,
  SCHOOL_ROLE,
  setTeacherAccountStatus,
  updateTeacherAccount,
} from '../../utils/schoolAdminStorage'
import useSchoolDbRefresh from './useSchoolDbRefresh'
import parsePastedRows from './parsePastedRows'
import {
  DataTable,
  Field,
  FormError,
  GhostButton,
  Modal,
  Pill,
  PrimaryButton,
  SectionCard,
  inputCls,
} from './SchoolUiKit'

const DEFAULT_TEACHER_PASSWORD = 'teacher123'

function TeacherFormModal({ account, onClose, onSubmit }) {
  const editing = Boolean(account)
  const [name, setName] = useState(account?.name || '')
  const [phone, setPhone] = useState(account?.phone || '')
  const [password, setPassword] = useState(editing ? '' : DEFAULT_TEACHER_PASSWORD)
  const [err, setErr] = useState('')

  const submit = (e) => {
    e.preventDefault()
    const r = onSubmit({ name, phone, password })
    if (!r.ok) {
      setErr(r.msg || '操作失败')
      return
    }
    onClose()
  }

  return (
    <Modal
      title={editing ? '编辑老师账号' : '新增老师账号'}
      desc={editing ? '手机号为登录账号，不可修改；留空密码表示不修改密码。' : '老师账号即子管理员，仅能管理本人主讲的班级与学生。'}
      onClose={onClose}
    >
      <form onSubmit={submit} className="space-y-3">
        <Field label="姓名">
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="手机号（登录账号）">
          <input
            className={inputCls}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={editing}
            inputMode="numeric"
          />
        </Field>
        <Field label={editing ? '重置密码（留空不修改）' : '初始密码'} hint="至少 6 位，建议提醒老师首次登录后自行修改">
          <input className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <FormError message={err} />
        <div className="flex justify-end gap-2 pt-1">
          <GhostButton type="button" onClick={onClose}>
            取消
          </GhostButton>
          <PrimaryButton type="submit">保存</PrimaryButton>
        </div>
      </form>
    </Modal>
  )
}

function ImportModal({ onClose, onImport }) {
  const [text, setText] = useState('')
  const [mode, setMode] = useState('skip')
  const [result, setResult] = useState(null)
  const [err, setErr] = useState('')

  const submit = (e) => {
    e.preventDefault()
    setErr('')
    const rows = parsePastedRows(text, ['name', 'phone'])
    if (!rows.length) {
      setErr('请粘贴至少一行数据')
      return
    }
    const r = onImport(rows, mode)
    if (!r.ok) {
      setErr(r.msg || '导入失败')
      return
    }
    setResult(r)
  }

  return (
    <Modal
      title="批量导入老师账号"
      desc="每行一位老师，格式「姓名,手机号」，支持逗号或制表符分隔（可直接从表格复制粘贴）。"
      onClose={onClose}
      width="max-w-xl"
    >
      {result ? (
        <div className="space-y-3">
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            导入完成：新增 {result.created} 条，更新 {result.updated} 条，失败 {result.failed.length} 条。
            初始密码为 {DEFAULT_TEACHER_PASSWORD}。
          </p>
          {result.failed.length ? (
            <div className="max-h-60 overflow-y-auto rounded-lg border border-slate-200">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-2 py-1.5 text-left font-medium">行号</th>
                    <th className="px-2 py-1.5 text-left font-medium">姓名</th>
                    <th className="px-2 py-1.5 text-left font-medium">手机号</th>
                    <th className="px-2 py-1.5 text-left font-medium">失败原因</th>
                  </tr>
                </thead>
                <tbody>
                  {result.failed.map((f) => (
                    <tr key={`${f.line}-${f.phone}`} className="border-t border-slate-100">
                      <td className="px-2 py-1.5">{f.line}</td>
                      <td className="px-2 py-1.5">{f.name || '—'}</td>
                      <td className="px-2 py-1.5">{f.phone || '—'}</td>
                      <td className="px-2 py-1.5 text-rose-600">{f.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
          <div className="flex justify-end">
            <PrimaryButton type="button" onClick={onClose}>
              完成
            </PrimaryButton>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <Field label="导入内容">
            <textarea
              className={`${inputCls} h-40 resize-y font-mono text-xs`}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={'张老师,13900002222\n李老师,13900003333'}
            />
          </Field>
          <Field label="重复手机号处理">
            <select className={inputCls} value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="skip">跳过重复（推荐）</option>
              <option value="update">更新已有账号姓名</option>
            </select>
          </Field>
          <FormError message={err} />
          <div className="flex justify-end gap-2 pt-1">
            <GhostButton type="button" onClick={onClose}>
              取消
            </GhostButton>
            <PrimaryButton type="submit">开始导入</PrimaryButton>
          </div>
        </form>
      )}
    </Modal>
  )
}

export default function SchoolAdminAccounts() {
  const { session, owner } = useOutletContext()
  useSchoolDbRefresh()
  const [formFor, setFormFor] = useState(null)
  const [importOpen, setImportOpen] = useState(false)

  if (!owner) {
    return (
      <SectionCard title="账号管理">
        <p className="text-sm text-slate-600">
          仅学校总管理员可管理老师账号。如需新增或调整老师账号，请联系本校总管理员。
        </p>
      </SectionCard>
    )
  }

  const accounts = listSchoolAccounts(session.schoolId)
  const teachers = accounts.filter((a) => a.role === SCHOOL_ROLE.TEACHER)

  const toggleStatus = (acc) => {
    const next = acc.status === ACCOUNT_STATUS.ACTIVE ? ACCOUNT_STATUS.DISABLED : ACCOUNT_STATUS.ACTIVE
    if (next === ACCOUNT_STATUS.DISABLED && !window.confirm(`停用后「${acc.name}」将无法登录，确定停用？`)) return
    const r = setTeacherAccountStatus(session, acc.id, next)
    if (!r.ok) window.alert(r.msg)
  }

  const remove = (acc) => {
    if (!window.confirm(`确定删除老师账号「${acc.name}」？删除后不可恢复。`)) return
    const r = deleteTeacherAccount(session, acc.id)
    if (!r.ok) window.alert(r.msg)
  }

  const columns = [
    { key: 'name', title: '姓名', render: (r) => <span className="font-medium text-slate-900">{r.name}</span> },
    { key: 'phone', title: '登录手机号' },
    {
      key: 'role',
      title: '角色',
      render: (r) =>
        r.role === SCHOOL_ROLE.OWNER ? <Pill tone="violet">总管理员</Pill> : <Pill tone="blue">老师（子管理员）</Pill>,
    },
    { key: 'classCount', title: '主讲班级', render: (r) => `${r.classCount} 个` },
    {
      key: 'status',
      title: '状态',
      render: (r) =>
        r.status === ACCOUNT_STATUS.ACTIVE ? <Pill tone="green">启用</Pill> : <Pill tone="gray">已停用</Pill>,
    },
    { key: 'createdAt', title: '创建时间', render: (r) => fmtDateTime(r.createdAt) },
    {
      key: 'ops',
      title: '操作',
      render: (r) =>
        r.role === SCHOOL_ROLE.OWNER ? (
          <span className="text-xs text-slate-400">当前登录账号</span>
        ) : (
          <div className="flex flex-wrap gap-2 text-xs">
            <button type="button" onClick={() => setFormFor(r)} className="text-primary hover:underline">
              编辑
            </button>
            <button type="button" onClick={() => toggleStatus(r)} className="text-amber-600 hover:underline">
              {r.status === ACCOUNT_STATUS.ACTIVE ? '停用' : '启用'}
            </button>
            <button type="button" onClick={() => remove(r)} className="text-rose-600 hover:underline">
              删除
            </button>
          </div>
        ),
    },
  ]

  return (
    <div className="space-y-4">
      <SectionCard
        title={`本校账号（总管理员 1 位 · 老师 ${teachers.length} 位）`}
        desc="老师账号即子管理员：仅能查看与管理本人主讲的班级及其学生。"
        extra={
          <div className="flex flex-wrap gap-2">
            <GhostButton type="button" onClick={() => setImportOpen(true)}>
              批量导入
            </GhostButton>
            <PrimaryButton type="button" onClick={() => setFormFor({})}>
              新增老师账号
            </PrimaryButton>
          </div>
        }
      >
        <DataTable columns={columns} rows={accounts} empty="暂无账号" />
      </SectionCard>

      <p className="text-xs leading-5 text-slate-500">
        提示：老师仍关联班级时不可删除，请先在班级管理中转移主讲；停用账号会立即中断其登录会话。
      </p>

      {formFor ? (
        <TeacherFormModal
          account={formFor.id ? formFor : null}
          onClose={() => setFormFor(null)}
          onSubmit={(input) =>
            formFor.id ? updateTeacherAccount(session, formFor.id, input) : createTeacherAccount(session, input)
          }
        />
      ) : null}

      {importOpen ? (
        <ImportModal
          onClose={() => setImportOpen(false)}
          onImport={(rows, mode) => importTeacherAccounts(session, rows, mode, DEFAULT_TEACHER_PASSWORD)}
        />
      ) : null}
    </div>
  )
}
