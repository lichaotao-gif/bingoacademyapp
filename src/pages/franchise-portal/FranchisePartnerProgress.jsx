import { useMemo, useState } from 'react'
import { FRANCHISE_PROMOTABLE_COURSES } from '../../utils/franchisePartnerStorage'
import { useFranchiseWorkspace } from './useFranchiseWorkspace'

function courseLabel(id) {
  return FRANCHISE_PROMOTABLE_COURSES.find((c) => c.id === id)?.name || id
}

function fmtLast(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export default function FranchisePartnerProgress() {
  const { ws } = useFranchiseWorkspace()
  const [classFilter, setClassFilter] = useState('all')

  const rows = useMemo(() => {
    if (!ws) return []
    const list = []
    for (const s of ws.students) {
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
  }, [ws, classFilter])

  if (!ws) return <p className="text-slate-500 text-sm">加载中…</p>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-bingo-dark">学习进度</h1>
        <p className="text-sm text-slate-500 mt-1">查看学员线上课程学习进度与完成状态（演示数据，正式环境对接学习引擎）。</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
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

      <div className="overflow-x-auto card rounded-2xl border border-slate-200">
        <table className="w-full text-sm text-left min-w-[800px]">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">学员</th>
              <th className="px-4 py-3 font-medium">手机</th>
              <th className="px-4 py-3 font-medium">班级</th>
              <th className="px-4 py-3 font-medium">课程</th>
              <th className="px-4 py-3 font-medium">进度</th>
              <th className="px-4 py-3 font-medium">状态</th>
              <th className="px-4 py-3 font-medium">最近学习</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">暂无学习记录</td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.key} className="border-t border-slate-100 hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-medium text-slate-800">{r.studentName}</td>
                  <td className="px-4 py-3 text-slate-600 font-mono text-xs">{r.phone}</td>
                  <td className="px-4 py-3 text-slate-600">{r.className}</td>
                  <td className="px-4 py-3 text-slate-700 max-w-[14rem] truncate">{r.courseName}</td>
                  <td className="px-4 py-3 w-40">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, r.progressPct)}%` }} />
                      </div>
                      <span className="text-xs text-slate-600 w-8">{r.progressPct}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={'text-xs px-2 py-0.5 rounded-full ' + (r.status === '已完成' ? 'bg-emerald-100 text-emerald-800' : r.status === '未开始' ? 'bg-slate-100 text-slate-600' : 'bg-sky-100 text-sky-800')}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{fmtLast(r.lastStudyAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
