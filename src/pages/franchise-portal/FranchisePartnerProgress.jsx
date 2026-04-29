import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FRANCHISE_PROMOTABLE_COURSES } from '../../utils/franchisePartnerStorage'
import { useFranchiseWorkspace } from './useFranchiseWorkspace'

function courseLabel(id) {
  return FRANCHISE_PROMOTABLE_COURSES.find((c) => c.id === id)?.name || id
}

export default function FranchisePartnerProgress() {
  const { ws } = useFranchiseWorkspace()
  const [searchParams] = useSearchParams()
  const studentParam = searchParams.get('studentId')
  const [classFilter, setClassFilter] = useState('all')
  const [studentFilter, setStudentFilter] = useState('all')

  useEffect(() => {
    if (!ws?.students) return
    if (studentParam && ws.students.some((s) => s.id === studentParam)) {
      setStudentFilter(studentParam)
    } else if (!studentParam) {
      setStudentFilter('all')
    }
  }, [studentParam, ws])

  const rows = useMemo(() => {
    if (!ws) return []
    const list = []
    for (const s of ws.students) {
      if (studentFilter !== 'all' && s.id !== studentFilter) continue
      const cls = ws.classes.find((c) => c.id === s.classId)
      if (classFilter !== 'all' && s.classId !== classFilter) continue
      for (const e of s.enrollments || []) {
        list.push({
          key: `${s.id}-${e.courseId}`,
          studentName: s.name,
          phone: s.phone,
          className: cls?.name || '—',
          courseName: courseLabel(e.courseId),
          progressPct: e.progressPct,
          status: e.status,
          lastStudyAt: e.lastStudyAt,
        })
      }
    }
    return list
  }, [ws, classFilter, studentFilter])

  if (!ws) return <p className="text-slate-500 text-sm">加载中…</p>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm text-slate-600">按班级筛选</label>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="all">全部班级</option>
            {ws.classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-sm text-slate-600">学员</label>
          <select
            value={studentFilter}
            onChange={(e) => setStudentFilter(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm min-w-[10rem]"
          >
            <option value="all">全部学员</option>
            {ws.students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          {studentFilter !== 'all' ? (
            <Link
              to="/franchise-partner/progress"
              className="text-xs font-medium text-sky-700 hover:underline"
            >
              查看全部
            </Link>
          ) : null}
        </div>
      </div>

      <div className="overflow-x-auto card rounded-2xl border border-slate-200">
        <table className="w-full text-sm text-left min-w-[800px]">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">学员</th>
              <th className="px-5 py-3 font-medium">手机</th>
              <th className="px-5 py-3 font-medium">班级</th>
              <th className="px-5 py-3 font-medium">课程</th>
              <th className="px-5 py-3 font-medium whitespace-nowrap">学习进度</th>
              <th className="px-5 py-3 font-medium">状态</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-slate-500">暂无学习记录</td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.key} className="border-t border-slate-100 hover:bg-slate-50/80">
                  <td className="px-5 py-3 font-semibold text-slate-900">{r.studentName}</td>
                  <td className="px-5 py-3 text-slate-600 font-mono whitespace-nowrap">{r.phone}</td>
                  <td className="px-5 py-3 text-slate-700">{r.className}</td>
                  <td className="px-5 py-3 text-slate-700 max-w-[14rem] truncate">{r.courseName}</td>
                  <td className="px-5 py-3 text-slate-700 tabular-nums whitespace-nowrap">
                    {r.progressPct == null ? '—' : `${Math.min(100, Number(r.progressPct))}%`}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={
                        'text-xs px-2.5 py-0.5 rounded-full font-medium ' +
                        (r.status === '已完成'
                          ? 'bg-emerald-100 text-emerald-800'
                          : r.status === '未开始'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-sky-100 text-sky-800')
                      }
                    >
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
