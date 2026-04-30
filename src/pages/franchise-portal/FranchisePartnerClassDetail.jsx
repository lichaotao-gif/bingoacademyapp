import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  addStudentToClass,
  deleteClass,
  deleteStudent,
  FRANCHISE_OFFLINE_LESSON_CATALOG,
  FRANCHISE_PROMOTABLE_COURSES,
  setClassOfflineLessonDone,
} from '../../utils/franchisePartnerStorage'
import { OnlineCoursesPerLessonCell, StudentNameWithRemark } from './FranchisePartnerStudents'
import { useFranchiseWorkspace } from './useFranchiseWorkspace'

function fmtDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function courseLabel(courseId) {
  if (!courseId) return '—'
  return FRANCHISE_PROMOTABLE_COURSES.find((c) => c.id === courseId)?.name || courseId
}

function inferPackCourseIdFromLessonId(lessonId) {
  if (!lessonId || typeof lessonId !== 'string') return null
  for (const courseId of Object.keys(FRANCHISE_OFFLINE_LESSON_CATALOG)) {
    if (lessonId.startsWith(`${courseId}-L`)) return courseId
  }
  return null
}

function lessonPackCourseId(lesson) {
  if (lesson?.packCourseId) return lesson.packCourseId
  return inferPackCourseIdFromLessonId(lesson?.id)
}

export default function FranchisePartnerClassDetail() {
  const { classId } = useParams()
  const navigate = useNavigate()
  const { session, ws, refresh } = useFranchiseWorkspace()

  /** 当前勾选弹窗对应的课程包 key（与 offlineProgressGroups[].packKey 一致），null 为关闭 */
  const [progressModalKey, setProgressModalKey] = useState(null)
  const [studentModalOpen, setStudentModalOpen] = useState(false)
  const [stuName, setStuName] = useState('')
  const [stuPhone, setStuPhone] = useState('')
  const [stuRemark, setStuRemark] = useState('')
  const [stuErr, setStuErr] = useState('')

  const closeStudentModal = useCallback(() => {
    setStudentModalOpen(false)
    setStuName('')
    setStuPhone('')
    setStuRemark('')
    setStuErr('')
  }, [])

  useEffect(() => {
    if (progressModalKey == null && !studentModalOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setProgressModalKey(null)
        closeStudentModal()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [progressModalKey, studentModalOpen, closeStudentModal])

  useEffect(() => {
    if (!ws || !classId) return
    const list = Array.isArray(ws.classes) ? ws.classes : []
    if (!list.some((c) => c.id === classId)) {
      navigate('/franchise-partner/classes', { replace: true })
    }
  }, [ws, classId, navigate])

  /** 本班学员：每人一行；每门线上课单独一行展示各自进度与状态 */
  const studentRows = useMemo(() => {
    if (!ws || !classId) return []
    const list = []
    for (const s of ws.students || []) {
      if (s.classId !== classId) continue
      list.push({
        key: s.id,
        studentId: s.id,
        name: s.name,
        phone: s.phone,
        remark: s.remark || '',
        enrollments: Array.isArray(s.enrollments) ? s.enrollments : [],
      })
    }
    list.sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'zh-CN'))
    return list
  }, [ws, classId])

  const offlineProgressGroups = useMemo(() => {
    if (!ws || !classId) return []
    const cls = (ws.classes || []).find((c) => c.id === classId)
    if (!cls) return []
    const lessons = Array.isArray(cls.offlineLessons) ? cls.offlineLessons : []
    if (!lessons.length) return []
    const byPack = new Map()
    for (const le of lessons) {
      const pid = lessonPackCourseId(le) || '__other__'
      if (!byPack.has(pid)) {
        const courseId = pid === '__other__' ? null : pid
        byPack.set(pid, {
          packKey: pid,
          courseId,
          label: le.packLabel || (courseId ? courseLabel(courseId) : '线下课时'),
          lessons: [],
        })
      }
      byPack.get(pid).lessons.push(le)
    }
    const order = Array.isArray(cls.offlineCourseIds) ? cls.offlineCourseIds : []
    const groups = [...byPack.values()].map((g) => ({
      packKey: g.packKey,
      courseId: g.courseId,
      label: g.label,
      lessons: g.lessons,
      done: g.lessons.filter((l) => l.done).length,
      total: g.lessons.length,
    }))
    groups.sort((a, b) => {
      if (a.packKey === '__other__') return 1
      if (b.packKey === '__other__') return -1
      const ia = order.indexOf(a.packKey)
      const ib = order.indexOf(b.packKey)
      return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib)
    })
    return groups
  }, [ws, classId])

  if (!ws || !session) return <p className="text-slate-500 text-sm">加载中…</p>

  const classes = Array.isArray(ws.classes) ? ws.classes : []
  const fc = classes.find((c) => c.id === classId)
  if (!fc) return <p className="text-slate-500 text-sm">正在跳转…</p>

  const progressModalGroup = offlineProgressGroups.find((x) => x.packKey === progressModalKey)

  const nStu = fc.studentIds?.length || 0
  const active = nStu > 0

  const handleToggleOfflineLesson = (lessonId, checked) => {
    const r = setClassOfflineLessonDone(session.partnerId, session.refCode, classId, lessonId, checked)
    if (!r.ok) window.alert(r.msg || '保存失败')
    else refresh()
  }

  const handleDeleteClass = () => {
    const tip =
      `确定删除班级「${fc.name}」？\n` +
      (nStu
        ? `班内 ${nStu} 名学员将变为「未分班」，学员与学习记录仍会保留。`
        : '删除后可在学员管理中为学员重新指定班级。')
    if (!window.confirm(tip)) return
    const r = deleteClass(session.partnerId, session.refCode, fc.id)
    if (!r.ok) window.alert(r.msg || '删除失败')
    else navigate('/franchise-partner/classes', { replace: true })
  }

  const handleAddStudent = (e) => {
    e.preventDefault()
    setStuErr('')
    const r = addStudentToClass(session.partnerId, session.refCode, classId, stuPhone, stuName, stuRemark)
    if (!r.ok) {
      setStuErr(r.msg)
      return
    }
    closeStudentModal()
    refresh()
  }

  const handleDeleteStudent = (studentId, displayName) => {
    if (!window.confirm(`确定删除学员「${displayName}」？将同时移除其选课记录（订单流水仍保留）。`)) return
    const r = deleteStudent(session.partnerId, session.refCode, studentId)
    if (!r.ok) window.alert(r.msg || '删除失败')
    else refresh()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-900 truncate min-w-0">班级详情 · {fc.name}</h1>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50/40">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 gap-y-1">
              <h2 className="text-[15px] font-semibold text-slate-900">班级信息</h2>
              <span
                className={
                  'text-xs px-2.5 py-0.5 rounded-full font-medium shrink-0 ' +
                  (active ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800')
                }
              >
                {active ? '进行中' : '招生中'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">基础信息；线下授课请在下方「线下课进度」中按课程包维护。</p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                setStuErr('')
                setStuName('')
                setStuPhone('')
                setStuRemark('')
                setStudentModalOpen(true)
              }}
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-slate-100 text-slate-800 text-sm font-semibold border border-slate-300 hover:bg-slate-200"
            >
              添加学员
            </button>
            <button
              type="button"
              onClick={handleDeleteClass}
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-rose-50 text-rose-800 text-sm font-semibold border border-rose-200 hover:bg-rose-100"
            >
              删除班级
            </button>
          </div>
        </div>
        <div className="p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-sm">
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3">
              <p className="text-xs text-slate-500 font-medium">班级名称</p>
              <p className="mt-1 font-semibold text-slate-900 leading-snug">{fc.name}</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3">
              <p className="text-xs text-slate-500 font-medium">创建时间</p>
              <p className="mt-1 text-slate-800 tabular-nums">{fmtDate(fc.createdAt)}</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3">
              <p className="text-xs text-slate-500 font-medium">开课日期</p>
              <p className="mt-1 text-slate-800 tabular-nums">{fc.startDate || '—'}</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 sm:col-span-2 lg:col-span-1">
              <p className="text-xs text-slate-500 font-medium">线下课程包（可多选合并）</p>
              <p className="mt-1 text-slate-800 leading-snug">{fc.offlineCourseName || '—'}</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3">
              <p className="text-xs text-slate-500 font-medium">课程类型（备注）</p>
              <p className="mt-1 text-slate-800">{fc.courseType || '—'}</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3">
              <p className="text-xs text-slate-500 font-medium">学员人数</p>
              <p className="mt-1 text-slate-800 tabular-nums">{nStu} 人</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/40">
          <h2 className="text-[15px] font-semibold text-slate-900">线下课进度</h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            多课程包时按包展示进度；每行「勾选课时」仅维护该包下的线下节次，全班共用同一勾选结果。
          </p>
        </div>
        <div className="p-5 sm:p-6">
          {offlineProgressGroups.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-10">暂无线下课时数据。</p>
          ) : (
            <ul className="space-y-4">
              {offlineProgressGroups.map((g) => {
                const pct = g.total ? Math.round((g.done / g.total) * 100) : 0
                return (
                  <li
                    key={g.packKey}
                    className="rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-4 sm:px-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                  >
                    <div className="min-w-0 flex-1 space-y-2">
                      <p className="text-sm font-semibold text-slate-900 leading-snug">{g.label}</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                        <span className="tabular-nums font-medium text-[#3B66FF]">
                          {g.done}/{g.total} 节已勾选
                        </span>
                        {g.total > 0 && g.done >= g.total ? (
                          <span className="text-emerald-700 font-medium">该包已全部完成</span>
                        ) : null}
                      </div>
                      <div className="h-2 rounded-full bg-slate-200 overflow-hidden max-w-md">
                        <div
                          className="h-full rounded-full bg-[#3B66FF] transition-[width]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setProgressModalKey(g.packKey)}
                      className="shrink-0 inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-[#3B66FF] text-white text-sm font-semibold hover:bg-[#2f56e6] sm:min-w-[7.5rem]"
                    >
                      勾选课时
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 min-w-0">
            <h2 className="text-[15px] font-semibold text-slate-900">本班学员</h2>
            <Link
              to={`/franchise-partner/students?classId=${encodeURIComponent(classId)}`}
              className="text-xs font-medium text-[#3B66FF] hover:text-[#2f56e6] hover:underline shrink-0"
            >
              学生管理（本班）
            </Link>
          </div>
          <span className="text-xs text-slate-400">共 {studentRows.length} 人</span>
        </div>
        <div className="overflow-x-auto">
          {studentRows.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-slate-500">本班暂无学员，请在上方「班级信息」栏使用「添加学员」。</p>
          ) : (
            <table className="w-full border-collapse text-sm text-left min-w-[640px]">
              <thead className="bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium whitespace-nowrap">姓名</th>
                  <th className="px-5 py-3 font-medium whitespace-nowrap">手机</th>
                  <th
                    className="px-5 py-3 font-medium min-w-[14rem]"
                    title="每名学员可有多门线上课；每门课有独立的进度与完成状态。开通时间、最近学习等见「学习进度」或点「学情」。"
                  >
                    已选线上课程
                  </th>
                  <th className="px-5 py-3 font-medium whitespace-nowrap min-w-[14rem]">操作</th>
                </tr>
              </thead>
              <tbody>
                {studentRows.map((row) => (
                  <tr key={row.key} className="border-t border-slate-100 hover:bg-slate-50/80">
                    <td className="px-5 py-3 align-middle text-slate-900 whitespace-nowrap">
                      <StudentNameWithRemark
                        studentId={row.studentId}
                        name={row.name}
                        remark={row.remark}
                        session={session}
                        refresh={refresh}
                      />
                    </td>
                    <td className="px-5 py-3 align-middle text-slate-600 font-mono whitespace-nowrap">{row.phone}</td>
                    <td className="px-5 py-3 align-middle text-slate-700">
                      <OnlineCoursesPerLessonCell enrollments={row.enrollments} />
                    </td>
                    <td className="px-5 py-3 align-middle">
                      <div className="flex flex-row flex-nowrap items-center gap-2">
                        <Link
                          to={`/franchise-partner/recharge?studentId=${encodeURIComponent(row.studentId)}`}
                          className="inline-flex shrink-0 items-center justify-center px-3 py-2 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-300 hover:bg-slate-200"
                        >
                          充课
                        </Link>
                        <Link
                          to={`/franchise-partner/progress?studentId=${encodeURIComponent(row.studentId)}`}
                          className="inline-flex shrink-0 items-center justify-center px-3 py-2 rounded-lg bg-white text-slate-700 text-xs font-semibold border border-slate-200 hover:bg-slate-50"
                        >
                          学情
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteStudent(row.studentId, row.name)}
                          className="inline-flex shrink-0 items-center justify-center px-3 py-2 rounded-lg bg-rose-50 text-rose-800 text-xs font-semibold border border-rose-200 hover:bg-rose-100"
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {progressModalKey != null ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]"
            onClick={() => setProgressModalKey(null)}
            role="presentation"
          />
          <div
            className="relative w-full max-w-lg max-h-[85vh] flex flex-col rounded-xl bg-white shadow-xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
              <div className="min-w-0 pr-4">
                <h2 className="text-base font-semibold text-slate-900 truncate">线下课进度</h2>
                {progressModalGroup?.label ? (
                  <p className="text-sm font-semibold text-slate-800 mt-0.5 truncate">{progressModalGroup.label}</p>
                ) : null}
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">班级：{fc.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setProgressModalKey(null)}
                className="w-8 h-8 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 text-xl leading-none shrink-0"
                aria-label="关闭"
              >
                ×
              </button>
            </div>
            <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/80 shrink-0">
              <p className="text-xs text-slate-600 leading-relaxed">
                线下上完一节课，勾选对应课时即可（全班共用同一进度）。
              </p>
            </div>
            <ul className="overflow-y-auto flex-1 px-6 py-4 space-y-2 max-h-[55vh]">
              {(progressModalGroup?.lessons || []).map((lesson) => (
                <li
                  key={lesson.id}
                  className="flex items-start gap-3 rounded-lg border border-slate-100 bg-white px-3 py-2.5 hover:border-slate-200"
                >
                  <input
                    type="checkbox"
                    id={`off-${fc.id}-${lesson.id}`}
                    checked={Boolean(lesson.done)}
                    onChange={(e) => handleToggleOfflineLesson(lesson.id, e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#3B66FF] focus:ring-[#3B66FF]/30"
                  />
                  <label
                    htmlFor={`off-${fc.id}-${lesson.id}`}
                    className={`text-sm leading-snug cursor-pointer select-none flex-1 min-w-0 ${
                      lesson.done ? 'text-slate-500 line-through' : 'text-slate-800'
                    }`}
                  >
                    {lesson.title}
                  </label>
                </li>
              ))}
            </ul>
            <div className="px-6 py-4 border-t border-slate-100 shrink-0">
              <button
                type="button"
                onClick={() => setProgressModalKey(null)}
                className="w-full py-2.5 rounded-lg bg-slate-100 text-slate-800 text-sm font-semibold border border-slate-200 hover:bg-slate-200"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {studentModalOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={closeStudentModal} role="presentation" />
          <div
            className="relative w-full max-w-[460px] rounded-xl bg-white shadow-xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-900">添加学员到「{fc.name}」</h2>
              <button
                type="button"
                onClick={closeStudentModal}
                className="w-8 h-8 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 text-xl leading-none"
                aria-label="关闭"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddStudent} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">学员姓名</label>
                <input
                  value={stuName}
                  onChange={(e) => setStuName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-[#3B66FF] focus:ring-2 focus:ring-[#3B66FF]/15"
                  placeholder="输入学员姓名"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">手机号</label>
                <input
                  value={stuPhone}
                  onChange={(e) => setStuPhone(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-[#3B66FF] focus:ring-2 focus:ring-[#3B66FF]/15"
                  placeholder="11位家长联系电话"
                  inputMode="numeric"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">备注</label>
                <input
                  value={stuRemark}
                  onChange={(e) => setStuRemark(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-[#3B66FF] focus:ring-2 focus:ring-[#3B66FF]/15"
                  placeholder="可选备注信息"
                />
              </div>
              {stuErr ? <p className="text-sm text-red-600">{stuErr}</p> : null}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeStudentModal}
                  className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-slate-100 text-slate-800 text-sm font-semibold border border-slate-200 hover:bg-slate-200"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-[#3B66FF] text-white text-sm font-semibold hover:bg-[#2f56e6]"
                >
                  确认添加
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
