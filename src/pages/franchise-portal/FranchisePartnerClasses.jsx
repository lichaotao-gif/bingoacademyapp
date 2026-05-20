import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FranchiseCreateClassModal from './FranchiseCreateClassModal'
import { useFranchiseWorkspace } from './useFranchiseWorkspace'

function fmtDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function FranchisePartnerClasses() {
  const navigate = useNavigate()
  const { session, ws, refresh } = useFranchiseWorkspace()
  const [classModalOpen, setClassModalOpen] = useState(false)

  if (!ws || !session) return <p className="text-slate-500 text-sm">加载中…</p>

  const classes = Array.isArray(ws.classes) ? ws.classes : []

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
          onClick={() => setClassModalOpen(true)}
          className="shrink-0 px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-600 text-white text-sm font-semibold whitespace-nowrap"
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
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col gap-4 min-h-[12rem] hover:border-primary/35 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-3 min-w-0">
                  <Link
                    to={detailTo}
                    className="text-base font-semibold text-slate-900 leading-snug hover:text-primary line-clamp-2"
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
                    <dt className="text-xs text-slate-500">开课日期</dt>
                    <dd className="mt-0.5 text-slate-700 tabular-nums">{cls.startDate || '—'}</dd>
                  </div>
                </dl>
                <div className="pt-3 border-t border-slate-100 mt-auto">
                  <Link
                    to={detailTo}
                    className="inline-flex w-full justify-center items-center px-3 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-600 transition-colors"
                  >
                    班级详情
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      )}

      <FranchiseCreateClassModal
        open={classModalOpen}
        onClose={() => setClassModalOpen(false)}
        session={session}
        refresh={refresh}
        afterCreate={(newId) => {
          if (newId) queueMicrotask(() => navigate(`/franchise-partner/classes/${encodeURIComponent(newId)}`, { replace: true }))
        }}
      />
    </div>
  )
}
