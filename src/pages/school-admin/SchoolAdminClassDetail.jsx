import { useState } from 'react'
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import {
  ACCOUNT_STATUS,
  CERT_SOURCE,
  CLASS_STATUS,
  addStudentsToClass,
  createStudent,
  fmtDateTime,
  getClassDetail,
  getCourseTotalLessons,
  listClassStudents,
  listStudents,
  listTeacherAccounts,
  removeStudentFromClass,
  updateClass,
} from '../../utils/schoolAdminStorage'
import useSchoolDbRefresh from './useSchoolDbRefresh'
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

function TransferTeacherModal({ cls, teachers, onClose, onSubmit }) {
  const [teacherAccountId, setTeacherAccountId] = useState('')
  const [err, setErr] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (!teacherAccountId) {
      setErr('请选择接手的老师')
      return
    }
    const r = onSubmit(teacherAccountId)
    if (!r.ok) {
      setErr(r.msg || '转移失败')
      return
    }
    onClose()
  }

  return (
    <Modal title="转移班级主讲" desc="转移后原老师将不再看到该班级，学生历史学习记录与证书不受影响。" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="当前主讲">
          <input className={`${inputCls} bg-slate-50`} value={cls.teacherName} disabled />
        </Field>
        <Field label="转移给">
          <select className={inputCls} value={teacherAccountId} onChange={(e) => setTeacherAccountId(e.target.value)}>
            <option value="">请选择老师</option>
            {teachers
              .filter((t) => t.id !== cls.teacherAccountId)
              .map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}（{t.phone}）
                </option>
              ))}
          </select>
        </Field>
        <FormError message={err} />
        <div className="flex justify-end gap-2 pt-1">
          <GhostButton type="button" onClick={onClose}>
            取消
          </GhostButton>
          <PrimaryButton type="submit">确认转移</PrimaryButton>
        </div>
      </form>
    </Modal>
  )
}

function AddStudentModal({ candidates, onClose, onAddExisting, onCreate }) {
  const [tab, setTab] = useState('existing')
  const [checked, setChecked] = useState([])
  const [keyword, setKeyword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [err, setErr] = useState('')

  const filtered = candidates.filter(
    (s) => !keyword.trim() || s.name.includes(keyword.trim()) || s.phone.includes(keyword.trim())
  )

  const toggle = (id) => setChecked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

  const submitExisting = (e) => {
    e.preventDefault()
    if (!checked.length) {
      setErr('请至少勾选一名学生')
      return
    }
    const r = onAddExisting(checked)
    if (!r.ok) {
      setErr(r.msg || '添加失败')
      return
    }
    onClose()
  }

  const submitNew = (e) => {
    e.preventDefault()
    const r = onCreate({ name, phone, password: DEFAULT_STUDENT_PASSWORD })
    if (!r.ok) {
      setErr(r.msg || '创建失败')
      return
    }
    onClose()
  }

  return (
    <Modal title="添加学生" desc="加入班级即获得该班课程的学习权限。" onClose={onClose} width="max-w-xl">
      <div className="mb-3 flex gap-2 text-xs">
        {[
          ['existing', '从本校学生中选择'],
          ['new', '新建学生并加入'],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setTab(key)
              setErr('')
            }}
            className={`rounded-lg px-3 py-1.5 font-medium transition ${
              tab === key ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'existing' ? (
        <form onSubmit={submitExisting} className="space-y-3">
          <input
            className={inputCls}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索姓名或手机号"
          />
          <div className="max-h-64 overflow-y-auto rounded-lg border border-slate-200">
            {filtered.length ? (
              filtered.map((s) => (
                <label
                  key={s.id}
                  className="flex cursor-pointer items-center gap-3 border-b border-slate-100 px-3 py-2 text-sm last:border-b-0 hover:bg-slate-50"
                >
                  <input type="checkbox" checked={checked.includes(s.id)} onChange={() => toggle(s.id)} />
                  <span className="font-medium text-slate-900">{s.name}</span>
                  <span className="text-xs text-slate-500">{s.phone}</span>
                  {s.classNames.length ? (
                    <span className="ml-auto text-xs text-slate-400">已在：{s.classNames.join('、')}</span>
                  ) : null}
                </label>
              ))
            ) : (
              <p className="px-3 py-8 text-center text-sm text-slate-500">
                没有可添加的学生，可切换到「新建学生并加入」。
              </p>
            )}
          </div>
          <FormError message={err} />
          <div className="flex justify-end gap-2 pt-1">
            <GhostButton type="button" onClick={onClose}>
              取消
            </GhostButton>
            <PrimaryButton type="submit">加入本班（{checked.length}）</PrimaryButton>
          </div>
        </form>
      ) : (
        <form onSubmit={submitNew} className="space-y-3">
          <Field label="学生姓名">
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="手机号（登录账号）" hint={`初始密码为 ${DEFAULT_STUDENT_PASSWORD}`}>
            <input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={11} />
          </Field>
          <FormError message={err} />
          <div className="flex justify-end gap-2 pt-1">
            <GhostButton type="button" onClick={onClose}>
              取消
            </GhostButton>
            <PrimaryButton type="submit">创建并加入</PrimaryButton>
          </div>
        </form>
      )}
    </Modal>
  )
}

export default function SchoolAdminClassDetail() {
  const { session, owner } = useOutletContext()
  const { classId } = useParams()
  const navigate = useNavigate()
  useSchoolDbRefresh()
  const [transferOpen, setTransferOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)

  const cls = getClassDetail(session, classId)

  if (!cls) {
    return (
      <SectionCard title="班级详情">
        <p className="text-sm text-slate-600">班级不存在，或不在您的管理范围内。</p>
        <div className="mt-3">
          <GhostButton type="button" onClick={() => navigate('/school/classes')}>
            返回班级列表
          </GhostButton>
        </div>
      </SectionCard>
    )
  }

  const students = listClassStudents(session, classId)
  const teachers = listTeacherAccounts(session.schoolId, { activeOnly: true })
  const candidates = listStudents(session).filter((s) => !s.classIds.includes(classId))
  const totalLessons = getCourseTotalLessons(cls.courseId)
  const ended = cls.status === CLASS_STATUS.ENDED

  const removeStudent = (stu) => {
    if (!window.confirm(`确定将「${stu.name}」移出本班？历史学习记录会保留。`)) return
    const r = removeStudentFromClass(session, classId, stu.id)
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
      key: 'progressPct',
      title: '学习进度',
      render: (r) => (
        <div>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
              <i className="block h-full rounded-full bg-primary" style={{ width: `${r.progressPct}%` }} />
            </span>
            <span className="text-xs font-medium text-slate-700">{r.progressPct}%</span>
          </div>
          {r.progressPct !== r.realProgress ? (
            <p className="mt-0.5 text-[11px] text-slate-400">实际学习 {r.realProgress}%（手动结课置顶）</p>
          ) : null}
        </div>
      ),
    },
    {
      key: 'lessonsDone',
      title: '完成课时',
      render: (r) => `${r.lessonsDone}/${totalLessons}`,
    },
    { key: 'studyMinutes', title: '学习时长', render: (r) => `${r.studyMinutes} 分钟` },
    {
      key: 'lastStudyAt',
      title: '最近学习',
      render: (r) => (r.lastStudyAt ? fmtDateTime(r.lastStudyAt) : <span className="text-slate-400">无学习记录</span>),
    },
    {
      key: 'certificate',
      title: '证书',
      render: (r) =>
        r.certificate ? (
          <Pill tone={r.certificate.source === CERT_SOURCE.MANUAL ? 'violet' : 'green'}>
            {r.certificate.source === CERT_SOURCE.MANUAL ? '手动发证' : '自动发证'}
          </Pill>
        ) : (
          <span className="text-xs text-slate-400">未发证</span>
        ),
    },
    {
      key: 'ops',
      title: '操作',
      render: (r) => (
        <div className="flex flex-wrap gap-2 text-xs">
          <Link to={`/school/students/${r.id}`} className="text-primary hover:underline">
            学习档案
          </Link>
          <button type="button" onClick={() => removeStudent(r)} className="text-rose-600 hover:underline">
            移出本班
          </button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <SectionCard
        title={cls.name}
        desc={`班级编号 ${cls.code} · 课程 ${cls.courseName}`}
        extra={
          <div className="flex flex-wrap gap-2">
            <GhostButton type="button" onClick={() => navigate('/school/classes')}>
              返回列表
            </GhostButton>
            {owner ? (
              <GhostButton type="button" onClick={() => setTransferOpen(true)} disabled={teachers.length < 2}>
                转移主讲
              </GhostButton>
            ) : null}
            <PrimaryButton type="button" onClick={() => setAddOpen(true)} disabled={ended}>
              添加学生
            </PrimaryButton>
          </div>
        }
      >
        <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['班级状态', <Pill key="s" tone={ended ? 'gray' : cls.disabled ? 'rose' : 'green'}>{cls.status}</Pill>],
            [
              '主讲老师',
              <span key="t">
                {cls.teacherName}
                {cls.teacherStatus !== ACCOUNT_STATUS.ACTIVE ? (
                  <span className="ml-1 text-xs text-rose-500">（已停用）</span>
                ) : null}
              </span>,
            ],
            ['开课周期', `${cls.startDate || '—'} ~ ${cls.endDate || '长期'}`],
            ['学生人数', `${students.length} 人`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2">
              <dt className="text-xs text-slate-500">{label}</dt>
              <dd className="mt-1 font-medium text-slate-900">{value}</dd>
            </div>
          ))}
        </dl>
        {cls.remark ? <p className="mt-3 text-xs leading-5 text-slate-500">备注：{cls.remark}</p> : null}
        {ended ? (
          <p className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">
            该班级已结课，不可新增学生。如需发放证书，请到「结课发证」提交平台审核。
          </p>
        ) : null}
      </SectionCard>

      <SectionCard title={`学生名单（${students.length}）`} desc="移出班级会保留历史学习记录，学生仍属于本校。">
        <DataTable columns={columns} rows={students} empty="本班暂无学生" />
      </SectionCard>

      {transferOpen ? (
        <TransferTeacherModal
          cls={cls}
          teachers={teachers}
          onClose={() => setTransferOpen(false)}
          onSubmit={(teacherAccountId) =>
            updateClass(session, classId, {
              name: cls.name,
              code: cls.code,
              startDate: cls.startDate,
              endDate: cls.endDate,
              remark: cls.remark,
              teacherAccountId,
            })
          }
        />
      ) : null}

      {addOpen ? (
        <AddStudentModal
          candidates={candidates}
          onClose={() => setAddOpen(false)}
          onAddExisting={(ids) => addStudentsToClass(session, classId, ids)}
          onCreate={(input) => {
            const created = createStudent(session, input)
            if (!created.ok) return created
            return addStudentsToClass(session, classId, [created.studentId])
          }}
        />
      ) : null}
    </div>
  )
}
