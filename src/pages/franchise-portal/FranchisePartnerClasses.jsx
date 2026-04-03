import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { createClass, deleteClass } from '../../utils/franchisePartnerStorage'
import { useFranchiseWorkspace } from './useFranchiseWorkspace'

function fmtDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function FranchisePartnerClasses() {
  const { session, ws, refresh } = useFranchiseWorkspace()
  const [modalOpen, setModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [err, setErr] = useState('')

  useEffect(() => {
    if (!modalOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setModalOpen(false)
        setErr('')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [modalOpen])

  if (!ws || !session) return <p className="text-slate-500 text-sm">加载中…</p>

  const closeModal = () => {
    setModalOpen(false)
    setErr('')
    setName('')
  }

  const handleCreate = (e) => {
    e.preventDefault()
    setErr('')
    const n = name.trim()
    if (!n) {
      setErr('请输入班级名称')
      return
    }
    createClass(session.partnerId, session.refCode, n)
    setName('')
    setErr('')
    setModalOpen(false)
    refresh()
  }

  const handleDelete = (cls) => {
    const tip =
      `确定删除班级「${cls.name}」？\n` +
      (cls.studentIds?.length
        ? `班内 ${cls.studentIds.length} 名学员将变为「未分班」，学员与学习记录仍会保留。`
        : '删除后可在学生管理中为学员重新指定班级。')
    if (!window.confirm(tip)) return
    const r = deleteClass(session.partnerId, session.refCode, cls.id)
    if (!r.ok) {
      window.alert(r.msg || '删除失败')
      return
    }
    refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold text-bingo-dark">班级管理</h1>
          <p className="text-sm text-slate-500 mt-1">
            删除班级后，原学员变为未分班，可在「学生管理」重新分班。
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setErr('')
            setModalOpen(true)
          }}
          className="shrink-0 btn-primary px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap"
        >
          + 创建班级
        </button>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-bingo-dark mb-3">已有班级</h2>
        {ws.classes.length === 0 ? (
          <p className="text-sm text-slate-500">
            暂无班级，点击右上角「创建班级」添加。
          </p>
        ) : (
          <div className="grid gap-4">
            {ws.classes.map((cls) => {
              const members = cls.studentIds?.length || 0
              return (
                <div
                  key={cls.id}
                  className="card p-5 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <h3 className="font-semibold text-bingo-dark text-base truncate">{cls.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">创建于 {fmtDate(cls.createdAt)} · 成员 {members} 人</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`/franchise-partner/students?classId=${encodeURIComponent(cls.id)}`}
                      className="text-sm px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 font-medium text-slate-700"
                    >
                      管理学员
                    </Link>
                    <Link
                      to="/franchise-partner/progress"
                      className="text-sm px-4 py-2 rounded-xl bg-primary text-white font-medium"
                    >
                      学习进度
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(cls)}
                      className="text-sm px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-medium"
                    >
                      删除班级
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="modal-create-class-title">
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
              <h2 id="modal-create-class-title" className="text-base font-semibold text-bingo-dark">
                创建新班级
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
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label htmlFor="class-name-modal" className="block text-sm font-medium text-slate-700 mb-1">
                  班级名称 <span className="text-red-500">*</span>
                </label>
                <input
                  id="class-name-modal"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/25"
                  placeholder="例如：周六上午 AI 启蒙班"
                  maxLength={60}
                  autoComplete="off"
                  autoFocus
                />
                <p className="text-xs text-slate-400 mt-1.5">建议用上课时段或班型命名，便于区分。</p>
              </div>
              {err ? <p className="text-sm text-red-600">{err}</p> : null}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50"
                >
                  取消
                </button>
                <button type="submit" className="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold">
                  创建
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
