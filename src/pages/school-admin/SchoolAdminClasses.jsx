import { useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import {
  ACCOUNT_STATUS,
  CLASS_STATUS,
  createClass,
  deleteClass,
  endClassManually,
  listClasses,
  listGrantedCourses,
  listTeacherAccounts,
  setClassDisabled,
  todayStr,
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

const STATUS_TONES = {
  [CLASS_STATUS.PENDING]: 'blue',
  [CLASS_STATUS.ONGOING]: 'green',
  [CLASS_STATUS.ENDED]: 'gray',
  [CLASS_STATUS.DISABLED]: 'rose',
}

function ClassFormModal({ cls, courses, teachers, owner, session, onClose, onSubmit }) {
  const editing = Boolean(cls?.id)
  const [name, setName] = useState(cls?.name || '')
  const [courseId, setCourseId] = useState(cls?.courseId || courses[0]?.id || '')
  const [teacherAccountId, setTeacherAccountId] = useState(
    cls?.teacherAccountId || (owner ? teachers[0]?.id || '' : session.accountId)
  )
  const [startDate, setStartDate] = useState(cls?.startDate || todayStr())
  const [endDate, setEndDate] = useState(cls?.endDate || '')
  const [remark, setRemark] = useState(cls?.remark || '')
  const [err, setErr] = useState('')

  const submit = (e) => {
    e.preventDefault()
    const r = onSubmit({ name, courseId, teacherAccountId, startDate, endDate, remark })
    if (!r.ok) {
      setErr(r.msg || '保存失败')
      return
    }
    onClose()
  }

  return (
    <Modal
      title={editing ? '编辑班级' : '新建班级'}
      desc={
        owner
          ? '总管理员可指定任意在职老师为主讲；已结课班级不可变更课程。'
          : '老师创建的班级主讲固定为本人，如需转移请联系总管理员。'
      }
      onClose={onClose}
    >
      <form onSubmit={submit} className="space-y-3">
        <Field label="班级名称">
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="如：AI启智 3 班" />
        </Field>
        <Field label="课程" hint="仅显示平台已授权给本校的课程">
          <select className={inputCls} value={courseId} onChange={(e) => setCourseId(e.target.value)}>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="主讲老师">
          {owner ? (
            <select
              className={inputCls}
              value={teacherAccountId}
              onChange={(e) => setTeacherAccountId(e.target.value)}
            >
              <option value="">请选择</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}（{t.phone}）
                </option>
              ))}
            </select>
          ) : (
            <input className={`${inputCls} bg-slate-50`} value={session.name} disabled />
          )}
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="开课日期">
            <input type="date" className={inputCls} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </Field>
          <Field label="结课日期" hint="留空表示长期班，可后续手动结课">
            <input type="date" className={inputCls} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </Field>
        </div>
        <Field label="备注">
          <input className={inputCls} value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="选填" />
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

export default function SchoolAdminClasses() {
  const { session, owner } = useOutletContext()
  useSchoolDbRefresh()
  const [formFor, setFormFor] = useState(null)
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState('')
  const [teacherFilter, setTeacherFilter] = useState('')

  const courses = listGrantedCourses(session.schoolId)
  const teachers = listTeacherAccounts(session.schoolId, { activeOnly: true })
  const classes = listClasses(session, {
    keyword,
    status,
    teacherAccountId: owner ? teacherFilter : '',
  })

  const canCreate = courses.length > 0 && (owner ? teachers.length > 0 : true)

  const toggleDisabled = (cls) => {
    const next = !cls.disabled
    if (next && !window.confirm(`停用后「${cls.name}」的学生将无法继续学习该班课程，确定停用？`)) return
    const r = setClassDisabled(session, cls.id, next)
    if (!r.ok) window.alert(r.msg)
  }

  const endClass = (cls) => {
    if (!window.confirm(`确定将「${cls.name}」标记为已结课？结课后不可新增学生，发证仍需提交平台审核。`)) return
    const r = endClassManually(session, cls.id)
    if (!r.ok) window.alert(r.msg)
  }

  const remove = (cls) => {
    if (!window.confirm(`确定删除班级「${cls.name}」？删除后不可恢复。`)) return
    const r = deleteClass(session, cls.id)
    if (!r.ok) window.alert(r.msg)
  }

  const columns = [
    {
      key: 'name',
      title: '班级',
      render: (r) => (
        <div>
          <Link to={`/school/classes/${r.id}`} className="font-medium text-primary hover:underline">
            {r.name}
          </Link>
          <p className="mt-0.5 text-xs text-slate-400">{r.code}</p>
        </div>
      ),
    },
    { key: 'courseName', title: '课程' },
    {
      key: 'teacherName',
      title: '主讲老师',
      render: (r) => (
        <div>
          <span>{r.teacherName}</span>
          {r.teacherStatus !== ACCOUNT_STATUS.ACTIVE ? (
            <p className="mt-0.5 text-xs text-rose-500">该老师已停用</p>
          ) : null}
        </div>
      ),
    },
    { key: 'studentCount', title: '学生', render: (r) => `${r.studentCount} 人` },
    {
      key: 'status',
      title: '状态',
      render: (r) => (
        <div className="space-y-1">
          <Pill tone={STATUS_TONES[r.status] || 'gray'}>{r.status}</Pill>
          {r.hasPendingCertRequest ? <Pill tone="amber">发证审核中</Pill> : null}
        </div>
      ),
    },
    {
      key: 'period',
      title: '开课周期',
      render: (r) => (
        <span className="text-xs text-slate-500">
          {r.startDate || '—'} ~ {r.endDate || '长期'}
        </span>
      ),
    },
    {
      key: 'ops',
      title: '操作',
      render: (r) => (
        <div className="flex flex-wrap gap-2 text-xs">
          <Link to={`/school/classes/${r.id}`} className="text-primary hover:underline">
            学生名单
          </Link>
          <button type="button" onClick={() => setFormFor(r)} className="text-primary hover:underline">
            编辑
          </button>
          {r.status !== CLASS_STATUS.ENDED ? (
            <button type="button" onClick={() => endClass(r)} className="text-amber-600 hover:underline">
              结课
            </button>
          ) : null}
          <button type="button" onClick={() => toggleDisabled(r)} className="text-amber-600 hover:underline">
            {r.disabled ? '恢复' : '停用'}
          </button>
          {r.status === CLASS_STATUS.PENDING && r.studentCount === 0 ? (
            <button type="button" onClick={() => remove(r)} className="text-rose-600 hover:underline">
              删除
            </button>
          ) : null}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <SectionCard
        title={`班级列表（${classes.length}）`}
        desc={
          owner
            ? '总管理员可查看本校全部班级，并可在编辑中转移班级主讲。'
            : '仅显示本人主讲的班级；可自建班级，主讲固定为本人。'
        }
        extra={
          <PrimaryButton type="button" disabled={!canCreate} onClick={() => setFormFor({})}>
            新建班级
          </PrimaryButton>
        }
      >
        {!courses.length ? (
          <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">
            本校暂无已授权课程，无法创建班级。请联系平台运营开通课程授权。
          </p>
        ) : null}
        {owner && !teachers.length ? (
          <p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">
            暂无在职老师账号，请先在「账号管理」创建老师账号后再建班。
          </p>
        ) : null}

        <div className="mb-3 flex flex-wrap gap-2">
          <input
            className={`${inputCls} sm:max-w-56`}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索班级名称或编号"
          />
          <select className={`${inputCls} sm:max-w-40`} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">全部状态</option>
            {Object.values(CLASS_STATUS).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {owner ? (
            <select
              className={`${inputCls} sm:max-w-48`}
              value={teacherFilter}
              onChange={(e) => setTeacherFilter(e.target.value)}
            >
              <option value="">全部主讲老师</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          ) : null}
        </div>

        <DataTable columns={columns} rows={classes} empty="暂无班级" />
      </SectionCard>

      <p className="text-xs leading-5 text-slate-500">
        提示：仅「未开课且无学生」的班级可删除；已开课班级请使用停用或结课。结课不会自动发证，发证需在「结课发证」提交平台审核。
      </p>

      {formFor ? (
        <ClassFormModal
          cls={formFor.id ? formFor : null}
          courses={courses}
          teachers={teachers}
          owner={owner}
          session={session}
          onClose={() => setFormFor(null)}
          onSubmit={(input) =>
            formFor.id ? updateClass(session, formFor.id, input) : createClass(session, input)
          }
        />
      ) : null}
    </div>
  )
}
