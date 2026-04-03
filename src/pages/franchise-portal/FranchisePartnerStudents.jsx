import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { addStudentToClass, FRANCHISE_PROMOTABLE_COURSES } from '../../utils/franchisePartnerStorage'
import { useFranchiseWorkspace } from './useFranchiseWorkspace'

function courseLabel(courseId) {
  if (!courseId) return '—'
  return FRANCHISE_PROMOTABLE_COURSES.find((c) => c.id === courseId)?.name || courseId
}

function fmtDateTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function FranchisePartnerStudents() {
  const { session, ws, refresh } = useFranchiseWorkspace()
  const [searchParams] = useSearchParams()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalClassId, setModalClassId] = useState('')
  const [tableClassFilter, setTableClassFilter] = useState('all')
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    const q = searchParams.get('classId')
    if (q && ws?.classes?.some((c) => c.id === q)) {
      setTableClassFilter(q)
    }
  }, [searchParams, ws?.classes])

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
      if (tableClassFilter !== 'all' && s.classId !== tableClassFilter) continue
      const cls = ws.classes.find((c) => c.id === s.classId)
      const className = cls?.name || '未分班'
      const enrollments = s.enrollments?.length ? s.enrollments : []
      if (enrollments.length === 0) {
        list.push({
          key: `${s.id}-empty`,
          studentId: s.id,
          name: s.name,
          phone: s.phone,
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
    return list
  }, [ws, tableClassFilter])

  const studentCount = useMemo(() => {
    if (!ws) return 0
    const ids = new Set()
    for (const s of ws.students || []) {
      if (tableClassFilter !== 'all' && s.classId !== tableClassFilter) continue
      ids.add(s.id)
    }
    return ids.size
  }, [ws, tableClassFilter])

  const openAddModal = () => {
    if (!ws?.classes?.length) {
      window.alert('请先在「班级管理」中创建班级，再添加学生。')
      return
    }
    const preset =
      tableClassFilter !== 'all' && ws.classes.some((c) => c.id === tableClassFilter)
        ? tableClassFilter
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

  const handleAdd = (e) => {
    e.preventDefault()
    setMsg('')
    if (!session) return
    const classIdToUse =
      tableClassFilter !== 'all' && ws.classes.some((c) => c.id === tableClassFilter)
        ? tableClassFilter
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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold text-bingo-dark">学生管理</h1>
          <p className="text-sm text-slate-500 mt-1">
            查看学员班级、购课时间与学习进度；支持按班级筛选。演示数据存于本机。
          </p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="shrink-0 btn-primary px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap"
        >
          + 添加学生
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="font-semibold text-bingo-dark">学员明细</h2>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm text-slate-600">班级筛选</label>
          <select
            value={tableClassFilter}
            onChange={(e) => setTableClassFilter(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm min-w-[10rem]"
          >
            <option value="all">全部班级</option>
            {ws.classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <span className="text-xs text-slate-400">
            共 {studentCount} 名学员 · {allRows.length} 条学习记录
          </span>
        </div>
      </div>

      {allRows.length === 0 ? (
        <p className="text-sm text-slate-500">
          当前筛选下暂无学员。点击右上角「添加学生」，或调整班级筛选。
        </p>
      ) : (
        <div className="overflow-x-auto card rounded-2xl border border-slate-200">
          <table className="w-full text-sm text-left min-w-[900px]">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium whitespace-nowrap">姓名</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">手机</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">所在班级</th>
                <th className="px-4 py-3 font-medium min-w-[10rem]">课程</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">购买/开通时间</th>
                <th className="px-4 py-3 font-medium w-44">学习进度</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">完成状态</th>
                <th className="px-4 py-3 font-medium whitespace-nowrap">最近学习</th>
              </tr>
            </thead>
            <tbody>
              {allRows.map((row) => (
                <tr key={row.key} className="border-t border-slate-100 hover:bg-slate-50/80 align-top">
                  <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">{row.name}</td>
                  <td className="px-4 py-3 text-slate-600 font-mono text-xs whitespace-nowrap">{row.phone}</td>
                  <td className="px-4 py-3 text-slate-700 whitespace-nowrap">{row.className}</td>
                  <td className="px-4 py-3 text-slate-700">{row.courseName}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs whitespace-nowrap">{fmtDateTime(row.purchasedAt)}</td>
                  <td className="px-4 py-3">
                    {row.progressPct == null ? (
                      '—'
                    ) : (
                      <div className="flex items-center gap-2 min-w-[7rem]">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, row.progressPct)}%` }} />
                        </div>
                        <span className="text-xs text-slate-600 w-9">{row.progressPct}%</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {row.status === '—' ? (
                      '—'
                    ) : (
                      <span
                        className={
                          'text-xs px-2 py-0.5 rounded-full whitespace-nowrap ' +
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
                  <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{fmtDateTime(row.lastStudyAt)}</td>
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
              {tableClassFilter !== 'all' && ws.classes.some((c) => c.id === tableClassFilter) ? (
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
