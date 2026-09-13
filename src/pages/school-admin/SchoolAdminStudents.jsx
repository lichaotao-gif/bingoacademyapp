import { useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import {
  CLASS_STATUS,
  ENROLL_STATUS,
  STUDENT_SOURCE,
  addStudentsToClass,
  createStudent,
  findStudentSchoolByPhone,
  fmtDateTime,
  importStudents,
  listClasses,
  listStudents,
  removeStudentFromSchool,
  setStudentEnrollStatus,
  updateStudent,
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

const DEFAULT_STUDENT_PASSWORD = 'student123'

const ENROLL_LABELS = {
  [ENROLL_STATUS.ACTIVE]: '在读',
  [ENROLL_STATUS.SUSPENDED]: '已停用',
  [ENROLL_STATUS.REMOVED]: '已移出',
}

const SOURCE_LABELS = {
  [STUDENT_SOURCE.MANUAL]: '手动新增',
  [STUDENT_SOURCE.IMPORT]: '批量导入',
  [STUDENT_SOURCE.SITE]: '官网注册',
}

function StudentFormModal({ student, classes, requireClass, onClose, onSubmit }) {
  const editing = Boolean(student)
  const [name, setName] = useState(student?.name || '')
  const [phone, setPhone] = useState(student?.phone || '')
  const [gender, setGender] = useState(student?.gender || '')
  const [birthday, setBirthday] = useState(student?.birthday || '')
  const [password, setPassword] = useState(editing ? '' : DEFAULT_STUDENT_PASSWORD)
  const [joinClassId, setJoinClassId] = useState(requireClass ? classes[0]?.id || '' : '')
  const [err, setErr] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (!editing && requireClass && !joinClassId) {
      setErr('请选择加入的班级，否则新学生不会出现在您的学生列表中')
      return
    }
    const r = onSubmit({ name, phone, gender, birthday, password, joinClassId })
    if (!r.ok) {
      setErr(r.msg || '保存失败')
      return
    }
    onClose()
  }

  return (
    <Modal
      title={editing ? `编辑学生：${student.name}` : '新增学生'}
      desc={editing ? '手机号为登录账号，如需变更请联系平台运营。' : '手机号即学生在 C 端的登录账号。'}
      onClose={onClose}
    >
      <form onSubmit={submit} className="space-y-3">
        <Field label="学生姓名">
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="手机号（登录账号）">
          <input
            className={`${inputCls} ${editing ? 'bg-slate-50' : ''}`}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={11}
            disabled={editing}
          />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="性别（可选）">
            <select className={inputCls} value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="">未填写</option>
              <option value="男">男</option>
              <option value="女">女</option>
            </select>
          </Field>
          <Field label="出生日期（可选）">
            <input type="date" className={inputCls} value={birthday} onChange={(e) => setBirthday(e.target.value)} />
          </Field>
        </div>
        <Field
          label={editing ? '重置登录密码（可选）' : '初始登录密码'}
          hint={editing ? '留空表示不修改密码；填写则至少 6 位。' : '至少 6 位，建议提醒学生首次登录后修改。'}
        >
          <input className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        {!editing ? (
          <Field
            label={requireClass ? '加入班级' : '加入班级（可选）'}
            hint={
              requireClass
                ? '老师仅能查看自己班级的学生，创建后需直接加入您主讲的班级。'
                : '不选择则仅建立学籍，之后可在班级详情中加入班级。'
            }
          >
            <select className={inputCls} value={joinClassId} onChange={(e) => setJoinClassId(e.target.value)}>
              <option value="">暂不加入班级</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}（{c.courseName}）
                </option>
              ))}
            </select>
          </Field>
        ) : null}
        <FormError message={err} />
        <div className="flex justify-end gap-2 pt-1">
          <GhostButton type="button" onClick={onClose}>
            取消
          </GhostButton>
          <PrimaryButton type="submit">{editing ? '保存' : '创建学生'}</PrimaryButton>
        </div>
      </form>
    </Modal>
  )
}

function ImportModal({ classes, requireClass, onClose, onImport }) {
  const [text, setText] = useState('')
  const [mode, setMode] = useState('skip')
  const [joinClassId, setJoinClassId] = useState(requireClass ? classes[0]?.id || '' : '')
  const [err, setErr] = useState('')
  const [result, setResult] = useState(null)

  const submit = (e) => {
    e.preventDefault()
    const rows = parsePastedRows(text, ['name', 'phone'])
    if (!rows.length) {
      setErr('请粘贴至少一行数据')
      return
    }
    if (requireClass && !joinClassId) {
      setErr('请选择导入后加入的班级，否则新学生不会出现在您的学生列表中')
      return
    }
    const r = onImport(rows, mode, joinClassId)
    if (!r.ok) {
      setErr(r.msg || '导入失败')
      return
    }
    setResult(r)
  }

  return (
    <Modal
      title="批量导入学生"
      desc="每行一名学生，格式：姓名,手机号。已归属其他学校的手机号需由平台执行转校。"
      onClose={onClose}
      width="max-w-xl"
    >
      {result ? (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            导入完成：新增 <b>{result.created}</b> 名、关联已有账号 <b>{result.linked}</b> 名、更新{' '}
            <b>{result.updated}</b> 名、失败 <b>{result.failed.length}</b> 名。
          </p>
          {result.created ? (
            <p className="text-xs text-slate-500">新增学生初始密码为 {DEFAULT_STUDENT_PASSWORD}。</p>
          ) : null}
          {result.joined ? <p className="text-xs text-slate-500">已加入所选班级 {result.joined} 名。</p> : null}
          {result.joinError ? <p className="text-xs text-rose-600">加入班级失败：{result.joinError}</p> : null}
          {result.failed.length ? (
            <div className="max-h-56 overflow-y-auto rounded-lg border border-slate-200">
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
              placeholder={'王小明,13911110001\n李小红,13911110002'}
            />
          </Field>
          <Field label="重复手机号处理">
            <select className={inputCls} value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="skip">跳过重复（推荐）</option>
              <option value="update">更新已有学生姓名</option>
            </select>
          </Field>
          <Field
            label={requireClass ? '导入后加入班级' : '导入后加入班级（可选）'}
            hint={
              requireClass
                ? '老师仅能查看自己班级的学生，导入后需直接加入您主讲的班级。'
                : '不选择则仅建立学籍，之后可在班级详情中批量加入班级。'
            }
          >
            <select className={inputCls} value={joinClassId} onChange={(e) => setJoinClassId(e.target.value)}>
              <option value="">暂不加入班级</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}（{c.courseName}）
                </option>
              ))}
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

export default function SchoolAdminStudents() {
  const { session, owner } = useOutletContext()
  useSchoolDbRefresh()
  const [keyword, setKeyword] = useState('')
  const [enrollStatus, setEnrollStatus] = useState('')
  const [classId, setClassId] = useState('')
  const [formFor, setFormFor] = useState(null)
  const [importOpen, setImportOpen] = useState(false)

  const classes = listClasses(session)
  const joinableClasses = classes.filter((c) => c.status !== CLASS_STATUS.ENDED && !c.disabled)
  const students = listStudents(session, { keyword, enrollStatus, classId })

  const createAndJoin = ({ joinClassId, ...input }) => {
    const created = createStudent(session, input)
    if (!created.ok || !joinClassId) return created
    const added = addStudentsToClass(session, joinClassId, [created.studentId])
    if (!added.ok) return { ok: false, msg: `学生已创建，但加入班级失败：${added.msg}` }
    return created
  }

  const importAndJoin = (rows, mode, joinClassId) => {
    const r = importStudents(session, rows, mode, DEFAULT_STUDENT_PASSWORD)
    if (!r.ok || !joinClassId) return r
    const ids = rows
      .map((row) => findStudentSchoolByPhone(row.phone))
      .filter((f) => f.exists && f.schoolId === session.schoolId)
      .map((f) => f.studentId)
    if (!ids.length) return r
    const added = addStudentsToClass(session, joinClassId, ids)
    return added.ok ? { ...r, joined: added.added } : { ...r, joinError: added.msg }
  }

  const toggleStatus = (stu) => {
    const next = stu.enrollStatus === ENROLL_STATUS.ACTIVE ? ENROLL_STATUS.SUSPENDED : ENROLL_STATUS.ACTIVE
    if (next === ENROLL_STATUS.SUSPENDED && !window.confirm(`停用后「${stu.name}」将无法继续学习本校课程，确定停用？`))
      return
    const r = setStudentEnrollStatus(session, stu.id, next)
    if (!r.ok) window.alert(r.msg)
  }

  const removeFromSchool = (stu) => {
    if (!window.confirm(`确定将「${stu.name}」移出本校？将同时退出本校所有班级，历史学习记录与证书保留。`)) return
    const r = removeStudentFromSchool(session, stu.id)
    if (!r.ok) window.alert(r.msg)
  }

  const columns = [
    {
      key: 'name',
      title: '学生',
      render: (r) => (
        <div>
          <Link to={`/school/students/${r.id}`} className="font-medium text-primary hover:underline">
            {r.name}
          </Link>
          <p className="mt-0.5 text-xs text-slate-400">{r.phone}</p>
        </div>
      ),
    },
    {
      key: 'classNames',
      title: '所在班级',
      render: (r) =>
        r.classNames.length ? (
          <span className="text-xs leading-5">{r.classNames.join('、')}</span>
        ) : (
          <span className="text-xs text-slate-400">未分班</span>
        ),
    },
    {
      key: 'avgProgress',
      title: '平均进度',
      render: (r) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
              <i className="block h-full rounded-full bg-primary" style={{ width: `${r.avgProgress}%` }} />
            </span>
            <span className="text-xs font-medium text-slate-700">{r.avgProgress}%</span>
          </div>
          {r.avgProgress !== r.avgRealProgress ? (
            <p className="mt-0.5 text-[11px] text-slate-400">实际学习 {r.avgRealProgress}%</p>
          ) : null}
        </div>
      ),
    },
    {
      key: 'certificateCount',
      title: '证书',
      render: (r) =>
        r.certificateCount ? <Pill tone="green">{r.certificateCount} 张</Pill> : <span className="text-xs text-slate-400">无</span>,
    },
    {
      key: 'lastStudyAt',
      title: '最近学习',
      render: (r) => (r.lastStudyAt ? fmtDateTime(r.lastStudyAt) : <span className="text-slate-400">无学习记录</span>),
    },
    {
      key: 'enrollStatus',
      title: '在读状态',
      render: (r) => (
        <Pill tone={r.enrollStatus === ENROLL_STATUS.ACTIVE ? 'green' : 'amber'}>
          {ENROLL_LABELS[r.enrollStatus] || r.enrollStatus}
        </Pill>
      ),
    },
    {
      key: 'enrollSource',
      title: '来源',
      render: (r) => <span className="text-xs text-slate-500">{SOURCE_LABELS[r.enrollSource] || '—'}</span>,
    },
    {
      key: 'ops',
      title: '操作',
      render: (r) => (
        <div className="flex flex-wrap gap-2 text-xs">
          <Link to={`/school/students/${r.id}`} className="text-primary hover:underline">
            学习档案
          </Link>
          <button type="button" onClick={() => setFormFor(r)} className="text-primary hover:underline">
            编辑
          </button>
          <button type="button" onClick={() => toggleStatus(r)} className="text-amber-600 hover:underline">
            {r.enrollStatus === ENROLL_STATUS.ACTIVE ? '停用' : '恢复'}
          </button>
          <button type="button" onClick={() => removeFromSchool(r)} className="text-rose-600 hover:underline">
            移出本校
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <SectionCard
        title={`学生管理（${students.length}）`}
        desc={owner ? '可查看本校全部学生。' : '仅显示您主讲班级中的学生。'}
        extra={
          <div className="flex flex-wrap gap-2">
            <GhostButton type="button" onClick={() => setImportOpen(true)}>
              批量导入
            </GhostButton>
            <PrimaryButton type="button" onClick={() => setFormFor({})}>
              新增学生
            </PrimaryButton>
          </div>
        }
      >
        <div className="mb-3 grid gap-2 sm:grid-cols-3">
          <input
            className={inputCls}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索姓名或手机号"
          />
          <select className={inputCls} value={classId} onChange={(e) => setClassId(e.target.value)}>
            <option value="">全部班级</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select className={inputCls} value={enrollStatus} onChange={(e) => setEnrollStatus(e.target.value)}>
            <option value="">全部在读状态</option>
            <option value={ENROLL_STATUS.ACTIVE}>在读</option>
            <option value={ENROLL_STATUS.SUSPENDED}>已停用</option>
          </select>
        </div>
        <DataTable columns={columns} rows={students} empty="暂无学生，可新增或批量导入" />
      </SectionCard>

      <p className="text-xs leading-5 text-slate-500">
        提示：新增学生仅建立本校学籍与登录账号，需再加入班级才能获得课程学习权限；移出本校会保留历史学习记录与已发放证书。
      </p>

      {formFor ? (
        <StudentFormModal
          student={formFor.id ? formFor : null}
          classes={joinableClasses}
          requireClass={!owner}
          onClose={() => setFormFor(null)}
          onSubmit={(input) => (formFor.id ? updateStudent(session, formFor.id, input) : createAndJoin(input))}
        />
      ) : null}

      {importOpen ? (
        <ImportModal
          classes={joinableClasses}
          requireClass={!owner}
          onClose={() => setImportOpen(false)}
          onImport={importAndJoin}
        />
      ) : null}
    </div>
  )
}
