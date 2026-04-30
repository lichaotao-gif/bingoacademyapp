import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  addStudentToClass,
  deleteStudent,
  FRANCHISE_PROMOTABLE_COURSES,
  updateStudentRemark,
} from '../../utils/franchisePartnerStorage'
import { useFranchiseWorkspace } from './useFranchiseWorkspace'

const REMARK_PANEL_W = 352

/** 姓名旁「备注」：悬停显示完整备注并可就地修改保存（fixed + portal，避免表格裁剪）。 */
export function StudentNameWithRemark({ studentId, name, remark, session, refresh }) {
  const wrapRef = useRef(null)
  const textareaRef = useRef(null)
  const closeTimerRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(remark || '')
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0 })

  useEffect(() => {
    setDraft(remark || '')
  }, [remark])

  const cancelCloseTimer = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }

  const measure = useCallback(() => {
    const el = wrapRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const w = Math.min(REMARK_PANEL_W, window.innerWidth - 24)
    let left = r.left
    if (left + w > window.innerWidth - 12) left = window.innerWidth - w - 12
    if (left < 12) left = 12
    /** 与锚点轻微重叠，减少鼠标从姓名移到浮层时的「空隙」导致误关 */
    const top = r.bottom - 4
    setPanelPos({ top, left, width: w })
  }, [])

  useLayoutEffect(() => {
    if (!open) return
    measure()
    const onScrollResize = () => measure()
    window.addEventListener('scroll', onScrollResize, true)
    window.addEventListener('resize', onScrollResize)
    return () => {
      window.removeEventListener('scroll', onScrollResize, true)
      window.removeEventListener('resize', onScrollResize)
    }
  }, [open, measure])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  useEffect(() => {
    if (!open) return
    const t = window.setTimeout(() => textareaRef.current?.focus(), 0)
    return () => window.clearTimeout(t)
  }, [open])

  const handleEnter = () => {
    cancelCloseTimer()
    setDraft(remark || '')
    measure()
    setOpen(true)
  }

  const handleLeave = () => {
    cancelCloseTimer()
    closeTimerRef.current = window.setTimeout(() => setOpen(false), 400)
  }

  const handleSave = () => {
    if (!session) return
    const r = updateStudentRemark(session.partnerId, session.refCode, studentId, draft)
    if (!r.ok) window.alert(r.msg || '保存失败')
    else {
      refresh()
      setOpen(false)
    }
  }

  const preview = (remark || '').trim()
  const panel = open ? (
    <div
      role="dialog"
      aria-label="学员备注"
      className="fixed z-[200] rounded-xl border border-slate-200 bg-white p-3 shadow-xl text-left max-h-[min(70vh,28rem)] flex flex-col"
      style={{
        top: panelPos.top,
        left: panelPos.left,
        width: panelPos.width || REMARK_PANEL_W,
      }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <p className="text-xs font-medium text-slate-500 mb-2 shrink-0">备注（以下为全文，可直接修改并保存）</p>
      <textarea
        ref={textareaRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={8}
        maxLength={500}
        placeholder="暂无备注，可在此填写…"
        className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 resize-y min-h-[11rem] max-h-[min(45vh,18rem)]"
      />
      <p className="text-[11px] text-slate-400 text-right tabular-nums mt-1 shrink-0">{draft.length}/500</p>
      <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-slate-100 shrink-0">
        <button
          type="button"
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 border border-slate-200 hover:bg-slate-50"
          onClick={() => setOpen(false)}
        >
          关闭
        </button>
        <button type="button" className="btn-primary px-3 py-1.5 rounded-lg text-xs font-semibold" onClick={handleSave}>
          保存备注
        </button>
      </div>
    </div>
  ) : null

  return (
    <>
      <span
        ref={wrapRef}
        className="inline-flex items-center gap-1.5 max-w-[min(100%,14rem)] align-middle"
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        <span className="truncate font-semibold text-slate-900" title={name}>
          {name}
        </span>
        <span
          className={
            'shrink-0 inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium border ' +
            (preview ? 'border-sky-200 bg-sky-50 text-sky-800' : 'border-slate-200 bg-slate-50 text-slate-500')
          }
        >
          备注
        </span>
      </span>
      {panel ? createPortal(panel, document.body) : null}
    </>
  )
}

function courseLabel(courseId) {
  if (!courseId) return '—'
  return FRANCHISE_PROMOTABLE_COURSES.find((c) => c.id === courseId)?.name || courseId
}

function enrollmentStatusTone(status) {
  if (status === '已完成') return 'bg-emerald-100 text-emerald-800'
  if (status === '未开始') return 'bg-slate-100 text-slate-600'
  return 'bg-sky-100 text-sky-800'
}

/** 班级名册 / 本班学员：每门线上课一行，各自进度与完成状态（与线下课无关） */
export function OnlineCoursesPerLessonCell({ enrollments }) {
  const list = Array.isArray(enrollments) ? enrollments.filter((e) => e && e.courseId) : []
  if (!list.length) return <span className="text-slate-400">—</span>
  return (
    <ul className="space-y-1.5 text-xs leading-snug max-w-md">
      {list.map((e) => {
        const name = courseLabel(e.courseId)
        const pctRaw = e.progressPct
        const pct = pctRaw == null ? '—' : `${Math.min(100, Number(pctRaw))}%`
        const st = e.status || '—'
        return (
          <li key={e.courseId} className="flex flex-wrap items-center gap-x-2 gap-y-1 text-slate-800">
            <span className="font-medium text-slate-900 min-w-0">{name}</span>
            <span className="tabular-nums text-slate-600 shrink-0">进度 {pct}</span>
            {st !== '—' ? (
              <span
                className={
                  'inline-flex items-center shrink-0 text-[11px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap ' +
                  enrollmentStatusTone(st)
                }
              >
                {st}
              </span>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}

function fmtDateTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function FranchisePartnerStudents() {
  const { session, ws, refresh } = useFranchiseWorkspace()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const classIdFromQuery = searchParams.get('classId')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalClassId, setModalClassId] = useState('')
  const [tableClassFilter, setTableClassFilter] = useState('all')
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [msg, setMsg] = useState('')

  const pinClassId = useMemo(() => {
    if (!classIdFromQuery || !ws?.classes?.length) return null
    return ws.classes.some((c) => c.id === classIdFromQuery) ? classIdFromQuery : null
  }, [classIdFromQuery, ws?.classes])

  /** URL 带有效 classId 时锁定为该班，避免首帧 tableClassFilter 仍为「全部」而误渲染全表 */
  const effectiveTableClassFilter = pinClassId || tableClassFilter

  useLayoutEffect(() => {
    if (pinClassId) setTableClassFilter(pinClassId)
    else if (!searchParams.get('classId')) setTableClassFilter('all')
  }, [pinClassId, searchParams])

  useEffect(() => {
    if (!modalOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setModalOpen(false)
        setMsg('')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [modalOpen])

  const allRows = useMemo(() => {
    if (!ws) return []
    const list = []
    for (const s of ws.students || []) {
      if (effectiveTableClassFilter !== 'all' && s.classId !== effectiveTableClassFilter) continue
      const cls = ws.classes.find((c) => c.id === s.classId)
      const className = cls?.name || '未分班'
      const enrollments = s.enrollments?.length ? s.enrollments : []
      if (enrollments.length === 0) {
        list.push({
          key: `${s.id}-empty`,
          studentId: s.id,
          name: s.name,
          phone: s.phone,
          remark: s.remark || '',
          className,
          courseName: '—',
          purchasedAt: null,
          progressPct: null,
          status: '—',
          lastStudyAt: null,
        })
        continue
      }
      for (const e of enrollments) {
        list.push({
          key: `${s.id}-${e.courseId}`,
          studentId: s.id,
          name: s.name,
          phone: s.phone,
          remark: s.remark || '',
          className,
          courseName: courseLabel(e.courseId),
          purchasedAt: e.purchasedAt || null,
          progressPct: e.progressPct ?? 0,
          status: e.status || '—',
          lastStudyAt: e.lastStudyAt || null,
        })
      }
    }
    list.sort((a, b) => {
      const ta = a.purchasedAt ? new Date(a.purchasedAt).getTime() : 0
      const tb = b.purchasedAt ? new Date(b.purchasedAt).getTime() : 0
      return tb - ta
    })
    const seenStudent = new Set()
    for (const row of list) {
      if (seenStudent.has(row.studentId)) row.showActions = false
      else {
        row.showActions = true
        seenStudent.add(row.studentId)
      }
    }
    return list
  }, [ws, effectiveTableClassFilter])

  const classRosterRows = useMemo(() => {
    if (!ws || !pinClassId) return []
    const list = []
    for (const s of ws.students || []) {
      if (s.classId !== pinClassId) continue
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
  }, [ws, pinClassId])

  const showPinnedClassRoster = Boolean(pinClassId)

  const studentCount = useMemo(() => {
    if (!ws) return 0
    const ids = new Set()
    for (const s of ws.students || []) {
      if (effectiveTableClassFilter !== 'all' && s.classId !== effectiveTableClassFilter) continue
      ids.add(s.id)
    }
    return ids.size
  }, [ws, effectiveTableClassFilter])

  /** 从班级管理带 classId 进入时，用于说明当前正在查看哪一班 */
  const viewedClassLabel = useMemo(() => {
    if (!classIdFromQuery || !ws?.classes?.length) return ''
    const c = ws.classes.find((x) => x.id === classIdFromQuery)
    return c?.name || ''
  }, [classIdFromQuery, ws?.classes])

  const openAddModal = () => {
    if (!ws?.classes?.length) {
      window.alert('请先在「班级管理」中创建班级，再添加学生。')
      return
    }
    const preset =
      effectiveTableClassFilter !== 'all' && ws.classes.some((c) => c.id === effectiveTableClassFilter)
        ? effectiveTableClassFilter
        : ws.classes[0]?.id || ''
    setModalClassId(preset)
    setPhone('')
    setName('')
    setMsg('')
    setModalOpen(true)
  }

  const targetClassName =
    modalClassId && ws.classes ? ws.classes.find((c) => c.id === modalClassId)?.name || '' : ''

  const closeModal = () => {
    setModalOpen(false)
    setMsg('')
    setPhone('')
    setName('')
  }

  const handleDeleteStudent = (studentId, displayName) => {
    if (!session) return
    const tip =
      `确定删除学员「${displayName}」？\n` +
      '删除后将移除分班与全部选课记录，且不可恢复。'
    if (!window.confirm(tip)) return
    const r = deleteStudent(session.partnerId, session.refCode, studentId)
    if (!r.ok) window.alert(r.msg || '删除失败')
    else refresh()
  }

  const handleAdd = (e) => {
    e.preventDefault()
    setMsg('')
    if (!session) return
    const classIdToUse =
      effectiveTableClassFilter !== 'all' && ws.classes.some((c) => c.id === effectiveTableClassFilter)
        ? effectiveTableClassFilter
        : modalClassId
    if (!classIdToUse) {
      setMsg('请选择加入的班级')
      return
    }
    const r = addStudentToClass(session.partnerId, session.refCode, classIdToUse, phone, name)
    if (!r.ok) setMsg(r.msg)
    else {
      refresh()
      closeModal()
    }
  }

  if (!ws || !session) return <p className="text-slate-500 text-sm">加载中…</p>

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 min-w-0">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {classIdFromQuery ? (
            <button
              type="button"
              onClick={() => navigate('/franchise-partner/classes')}
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-medium shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-colors"
              aria-label="返回班级管理"
            >
              <span className="text-base leading-none" aria-hidden>
                ←
              </span>
              返回
            </button>
          ) : null}
          <h1 className="text-xl font-bold text-slate-900 truncate min-w-0">学生管理</h1>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="shrink-0 btn-primary px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap"
        >
          + 添加学生
        </button>
      </div>

      {showPinnedClassRoster && viewedClassLabel ? (
        <p className="text-sm text-slate-600 -mt-2 leading-relaxed">
          「{viewedClassLabel}」本班名册：共 <span className="font-medium text-slate-800">{studentCount}</span>{' '}
          人（每人一行；每门线上课单独显示进度与状态。开通时间、最近学习等完整学情表请点「学情」或前往「学习进度」。）
        </p>
      ) : null}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-1">
        <h2 className="font-semibold text-bingo-dark">
          {showPinnedClassRoster && viewedClassLabel ? '本班学员列表' : '学员明细'}
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          {showPinnedClassRoster ? (
            <>
              <span className="text-sm text-slate-600">当前查看本班成员</span>
              <Link
                to="/franchise-partner/students"
                className="text-xs font-medium text-[#3B66FF] hover:text-[#2f56e6] hover:underline"
              >
                全部学员（全表）
              </Link>
            </>
          ) : (
            <>
              <label className="text-sm text-slate-600">班级筛选</label>
              <select
                value={tableClassFilter}
                onChange={(e) => setTableClassFilter(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm min-w-[10rem]"
              >
                <option value="all">全部班级</option>
                {ws.classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </>
          )}
          <span className="text-xs text-slate-400">
            {showPinnedClassRoster ? `共 ${studentCount} 人` : `共 ${studentCount} 名学员 · ${allRows.length} 条学习记录`}
          </span>
        </div>
      </div>

      {(showPinnedClassRoster ? classRosterRows.length === 0 : allRows.length === 0) ? (
        <p className="text-sm text-slate-500">
          当前筛选下暂无学员。点击右上角「添加学生」
          {showPinnedClassRoster ? '。' : '，或调整班级筛选。'}
        </p>
      ) : showPinnedClassRoster ? (
        <div className="overflow-x-auto card rounded-2xl border border-slate-200">
          <table className="w-full border-collapse text-sm text-left min-w-[640px]">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium whitespace-nowrap align-middle text-left">姓名</th>
                <th className="px-5 py-3 font-medium whitespace-nowrap align-middle text-left">手机</th>
                <th
                  className="px-5 py-3 font-medium min-w-[14rem] align-middle text-left"
                  title="每名学员可有多门线上课；每门课有独立的进度百分比与完成状态。时间维度与全机构筛选见「学习进度」。"
                >
                  已选线上课程
                </th>
                <th className="px-5 py-3 font-medium whitespace-nowrap min-w-[14rem] align-middle text-left">操作</th>
              </tr>
            </thead>
            <tbody>
              {classRosterRows.map((row) => (
                <tr key={row.key} className="border-t border-slate-100 hover:bg-slate-50/80">
                  <td className="px-5 py-3 align-middle text-left text-slate-900 whitespace-nowrap">
                    <StudentNameWithRemark
                      studentId={row.studentId}
                      name={row.name}
                      remark={row.remark}
                      session={session}
                      refresh={refresh}
                    />
                  </td>
                  <td className="px-5 py-3 align-middle text-left text-slate-600 font-mono whitespace-nowrap">{row.phone}</td>
                  <td className="px-5 py-3 align-middle text-left text-slate-700">
                    <OnlineCoursesPerLessonCell enrollments={row.enrollments} />
                  </td>
                  <td className="px-5 py-3 align-middle text-left">
                    <div className="flex flex-row flex-nowrap items-center gap-2">
                      <Link
                        to={`/franchise-partner/recharge?studentId=${encodeURIComponent(row.studentId)}`}
                        className="inline-flex shrink-0 items-center justify-center px-3 py-2 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-300 hover:bg-slate-200 hover:border-slate-400 transition-colors"
                      >
                        充课
                      </Link>
                      <Link
                        to={`/franchise-partner/progress?studentId=${encodeURIComponent(row.studentId)}`}
                        className="inline-flex shrink-0 items-center justify-center px-3 py-2 rounded-lg bg-white text-slate-700 text-xs font-semibold border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                      >
                        学情
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDeleteStudent(row.studentId, row.name)}
                        className="inline-flex shrink-0 items-center justify-center px-3 py-2 rounded-lg bg-rose-50 text-rose-800 text-xs font-semibold border border-rose-200 hover:bg-rose-100 hover:border-rose-300 transition-colors"
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto card rounded-2xl border border-slate-200">
          <table className="w-full border-collapse text-sm text-left min-w-[1000px]">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium whitespace-nowrap align-middle text-left">姓名</th>
                <th className="px-5 py-3 font-medium whitespace-nowrap align-middle text-left">手机</th>
                <th className="px-5 py-3 font-medium whitespace-nowrap align-middle text-left">所在班级</th>
                <th className="px-5 py-3 font-medium min-w-[10rem] align-middle text-left">课程</th>
                <th className="px-5 py-3 font-medium whitespace-nowrap align-middle text-left">购买/开通时间</th>
                <th className="px-5 py-3 font-medium whitespace-nowrap align-middle text-right tabular-nums">学习进度</th>
                <th className="px-5 py-3 font-medium whitespace-nowrap align-middle text-center">完成状态</th>
                <th className="px-5 py-3 font-medium whitespace-nowrap min-w-[17rem] align-middle text-left">操作</th>
              </tr>
            </thead>
            <tbody>
              {allRows.map((row) => (
                <tr key={row.key} className="border-t border-slate-100 hover:bg-slate-50/80">
                  <td className="px-5 py-3 align-middle text-left text-slate-900 whitespace-nowrap">
                    <StudentNameWithRemark
                      studentId={row.studentId}
                      name={row.name}
                      remark={row.remark}
                      session={session}
                      refresh={refresh}
                    />
                  </td>
                  <td className="px-5 py-3 align-middle text-left text-slate-600 font-mono whitespace-nowrap">{row.phone}</td>
                  <td className="px-5 py-3 align-middle text-left text-slate-700 whitespace-nowrap">{row.className}</td>
                  <td className="px-5 py-3 align-middle text-left text-slate-700 leading-snug">{row.courseName}</td>
                  <td className="px-5 py-3 align-middle text-left text-slate-600 whitespace-nowrap tabular-nums">{fmtDateTime(row.purchasedAt)}</td>
                  <td className="px-5 py-3 align-middle text-right text-slate-700 tabular-nums whitespace-nowrap">
                    {row.progressPct == null ? '—' : `${Math.min(100, row.progressPct)}%`}
                  </td>
                  <td className="px-5 py-3 align-middle text-center">
                    {row.status === '—' ? (
                      <span className="text-slate-400">—</span>
                    ) : (
                      <span
                        className={
                          'inline-flex items-center justify-center text-xs px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap ' +
                          (row.status === '已完成'
                            ? 'bg-emerald-100 text-emerald-800'
                            : row.status === '未开始'
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-sky-100 text-sky-800')
                        }
                      >
                        {row.status}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 align-middle text-left">
                    {row.showActions ? (
                      <div className="flex flex-row flex-nowrap items-center gap-2">
                        <Link
                          to={`/franchise-partner/recharge?studentId=${encodeURIComponent(row.studentId)}`}
                          className="inline-flex shrink-0 items-center justify-center px-3 py-2 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-300 hover:bg-slate-200 hover:border-slate-400 transition-colors"
                        >
                          充课
                        </Link>
                        <Link
                          to={`/franchise-partner/progress?studentId=${encodeURIComponent(row.studentId)}`}
                          className="inline-flex shrink-0 items-center justify-center px-3 py-2 rounded-lg bg-white text-slate-700 text-xs font-semibold border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                        >
                          查看学情
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDeleteStudent(row.studentId, row.name)}
                          className="inline-flex shrink-0 items-center justify-center px-3 py-2 rounded-lg bg-rose-50 text-rose-800 text-xs font-semibold border border-rose-200 hover:bg-rose-100 hover:border-rose-300 transition-colors"
                        >
                          删除
                        </button>
                      </div>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="modal-add-student-title">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-[1px]"
            role="presentation"
            onClick={closeModal}
          />
          <div
            className="relative w-full max-w-md rounded-2xl bg-white shadow-xl border border-slate-200 p-6 sm:p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 mb-5">
              <h2 id="modal-add-student-title" className="text-base font-semibold text-bingo-dark">
                添加学生
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="shrink-0 -mr-1 -mt-1 w-9 h-9 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center text-lg leading-none"
                aria-label="关闭"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              {effectiveTableClassFilter !== 'all' && ws.classes.some((c) => c.id === effectiveTableClassFilter) ? (
                <p className="text-sm text-slate-600 rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
                  将加入班级：<span className="font-semibold text-bingo-dark">{targetClassName}</span>
                </p>
              ) : (
                <div>
                  <label htmlFor="modal-student-class" className="block text-sm font-medium text-slate-700 mb-1">
                    加入班级 <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="modal-student-class"
                    value={modalClassId}
                    onChange={(e) => setModalClassId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/25"
                  >
                    {ws.classes.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-400 mt-1.5">在列表中选择「全部班级」时，请在此指定要加入的班级。</p>
                </div>
              )}
              <div>
                <label htmlFor="modal-student-phone" className="block text-sm font-medium text-slate-700 mb-1">
                  学员手机号 <span className="text-red-500">*</span>
                </label>
                <input
                  id="modal-student-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/25"
                  placeholder="11位手机号"
                  autoComplete="tel"
                  autoFocus
                />
              </div>
              <div>
                <label htmlFor="modal-student-name" className="block text-sm font-medium text-slate-700 mb-1">
                  学员姓名
                </label>
                <input
                  id="modal-student-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/25"
                  placeholder="选填，默认「学员」"
                  autoComplete="name"
                />
              </div>
              {msg ? <p className="text-sm text-red-600">{msg}</p> : null}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50"
                >
                  取消
                </button>
                <button type="submit" className="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold">
                  确定添加
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
