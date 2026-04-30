import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  createClass,
  FRANCHISE_OFFLINE_LESSON_CATALOG,
  FRANCHISE_PROMOTABLE_COURSES,
} from '../../utils/franchisePartnerStorage'
import { useFranchiseWorkspace } from './useFranchiseWorkspace'

function fmtDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function defaultOfflineCourseIds() {
  const id = FRANCHISE_PROMOTABLE_COURSES[0]?.id
  return id ? [id] : []
}

export default function FranchisePartnerClasses() {
  const navigate = useNavigate()
  const { session, ws, refresh } = useFranchiseWorkspace()
  const [classModalOpen, setClassModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [courseType, setCourseType] = useState('')
  const [startDate, setStartDate] = useState('')
  const [offlineCourseIds, setOfflineCourseIds] = useState(defaultOfflineCourseIds)
  const [classErr, setClassErr] = useState('')

  const closeClassModal = useCallback(() => {
    setClassModalOpen(false)
    setClassErr('')
    setName('')
    setCourseType('')
    setStartDate('')
    setOfflineCourseIds(defaultOfflineCourseIds())
  }, [])

  useEffect(() => {
    if (!classModalOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') closeClassModal()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [classModalOpen, closeClassModal])

  if (!ws || !session) return <p className="text-slate-500 text-sm">加载中…</p>

  const classes = Array.isArray(ws.classes) ? ws.classes : []

  const handleCreateClass = (e) => {
    e.preventDefault()
    setClassErr('')
    const n = name.trim()
    if (!n) {
      setClassErr('请输入班级名称')
      return
    }
    const r = createClass(session.partnerId, session.refCode, n, {
      courseType,
      startDate,
      offlineCourseIds,
    })
    if (!r.ok) {
      setClassErr(r.msg || '创建失败')
      return
    }
    closeClassModal()
    refresh()
    const newId = r.newClassId
    if (newId) queueMicrotask(() => navigate(`/franchise-partner/classes/${encodeURIComponent(newId)}`, { replace: true }))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 min-w-0">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-slate-900 truncate">班级管理</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
            每个班级为一块卡片；点名称或「班级详情」进入详情，维护线下课并管理本班学员。
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setClassErr('')
            setOfflineCourseIds(defaultOfflineCourseIds())
            setClassModalOpen(true)
          }}
          className="shrink-0 px-4 py-2.5 rounded-lg bg-[#3B66FF] hover:bg-[#2f56e6] text-white text-sm font-semibold whitespace-nowrap"
        >
          + 创建班级
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[15px] font-semibold text-slate-900">班级列表</h2>
        <span className="text-xs text-slate-400">共 {classes.length} 个班</span>
      </div>

      {classes.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center text-sm text-slate-500 shadow-sm">
          暂无班级，点击右上角「创建班级」添加。
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {classes.map((cls) => {
            const n = cls.studentIds?.length || 0
            const active = n > 0
            const detailTo = `/franchise-partner/classes/${encodeURIComponent(cls.id)}`
            return (
              <article
                key={cls.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col gap-4 min-h-[12rem] hover:border-[#3B66FF]/35 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-3 min-w-0">
                  <Link
                    to={detailTo}
                    className="text-base font-semibold text-slate-900 leading-snug hover:text-[#3B66FF] line-clamp-2"
                    title="进入班级详情"
                  >
                    {cls.name}
                  </Link>
                  <span
                    className={
                      'shrink-0 text-xs px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap ' +
                      (active ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800')
                    }
                  >
                    {active ? '进行中' : '招生中'}
                  </span>
                </div>
                <dl className="grid grid-cols-2 gap-x-3 gap-y-2.5 text-sm flex-1">
                  <div className="min-w-0">
                    <dt className="text-xs text-slate-500">学员</dt>
                    <dd className="mt-0.5 font-medium text-slate-800 tabular-nums">{n} 人</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-xs text-slate-500">创建时间</dt>
                    <dd className="mt-0.5 text-slate-700 tabular-nums">{fmtDate(cls.createdAt)}</dd>
                  </div>
                  <div className="min-w-0 col-span-2">
                    <dt className="text-xs text-slate-500">课程类型</dt>
                    <dd className="mt-0.5 text-slate-700 truncate" title={cls.courseType || ''}>
                      {cls.courseType || '—'}
                    </dd>
                  </div>
                  <div className="min-w-0 col-span-2">
                    <dt className="text-xs text-slate-500">开课日期</dt>
                    <dd className="mt-0.5 text-slate-700 tabular-nums">{cls.startDate || '—'}</dd>
                  </div>
                </dl>
                <div className="pt-3 border-t border-slate-100 mt-auto">
                  <Link
                    to={detailTo}
                    className="inline-flex w-full justify-center items-center px-3 py-2.5 rounded-xl bg-[#3B66FF] text-white text-xs font-semibold hover:bg-[#2f56e6] transition-colors"
                  >
                    班级详情
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {classModalOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={closeClassModal} role="presentation" />
          <div
            className="relative w-full max-w-[520px] rounded-xl bg-white shadow-xl border border-slate-200 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-900">创建新班级</h2>
              <button
                type="button"
                onClick={closeClassModal}
                className="w-8 h-8 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 text-xl leading-none"
                aria-label="关闭"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCreateClass} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">班级名称</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-[#3B66FF] focus:ring-2 focus:ring-[#3B66FF]/15"
                  placeholder="输入班级名称"
                  maxLength={60}
                  autoFocus
                />
              </div>
              <div>
                <span className="block text-sm font-medium text-slate-600 mb-2">
                  线下课程包 <span className="text-rose-600">*</span>
                  <span className="font-normal text-slate-400">（可多选）</span>
                </span>
                <div className="rounded-lg border border-slate-200 divide-y divide-slate-100 bg-white overflow-hidden">
                  {FRANCHISE_PROMOTABLE_COURSES.map((c) => {
                    const nLess = (FRANCHISE_OFFLINE_LESSON_CATALOG[c.id] || []).length
                    const checked = offlineCourseIds.includes(c.id)
                    return (
                      <label
                        key={c.id}
                        className="flex items-start gap-3 px-3 py-2.5 cursor-pointer hover:bg-slate-50/80"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            const on = e.target.checked
                            setOfflineCourseIds((prev) => {
                              if (on) return prev.includes(c.id) ? prev : [...prev, c.id]
                              return prev.filter((x) => x !== c.id)
                            })
                            if (on) {
                              const p = FRANCHISE_PROMOTABLE_COURSES.find((x) => x.id === c.id)
                              if (p && !courseType.trim()) {
                                setCourseType(p.name.replace(/^《|》$/g, '').slice(0, 40))
                              }
                            }
                          }}
                          className="mt-1 h-4 w-4 rounded border-slate-300 text-[#3B66FF] focus:ring-[#3B66FF]/30"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="text-sm font-medium text-slate-800">{c.name}</span>
                          <span className="block text-xs text-slate-500 mt-0.5">线下共 {nLess} 课时</span>
                        </span>
                      </label>
                    )
                  })}
                </div>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  可多选多个课程包，课时按列表顺序合并；创建后由管理员逐节勾选，与线上学习进度独立。
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">课程类型（备注）</label>
                <input
                  value={courseType}
                  onChange={(e) => setCourseType(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-[#3B66FF] focus:ring-2 focus:ring-[#3B66FF]/15"
                  placeholder="如：周末班、暑期集训（可选）"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">开课日期</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-[#3B66FF] focus:ring-2 focus:ring-[#3B66FF]/15"
                />
              </div>
              {classErr ? <p className="text-sm text-red-600">{classErr}</p> : null}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeClassModal}
                  className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-slate-100 text-slate-800 text-sm font-semibold border border-slate-200 hover:bg-slate-200"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-[#3B66FF] text-white text-sm font-semibold hover:bg-[#2f56e6]"
                >
                  确认创建
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
