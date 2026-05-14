import { useCallback, useEffect, useState } from 'react'
import {
  createClass,
  FRANCHISE_CLASS_CREATE_OFFLINE_DEMO_PACKS,
  FRANCHISE_OFFLINE_LESSON_CATALOG,
  getFranchiseOfflinePackMeta,
} from '../../utils/franchisePartnerStorage'

function defaultOfflineCourseIds() {
  return []
}

export default function FranchiseCreateClassModal({ open, onClose, session, refresh, afterCreate }) {
  const [name, setName] = useState('')
  const [courseType, setCourseType] = useState('')
  const [startDate, setStartDate] = useState('')
  const [offlineCourseIds, setOfflineCourseIds] = useState(defaultOfflineCourseIds)
  const [classErr, setClassErr] = useState('')

  const reset = useCallback(() => {
    setClassErr('')
    setName('')
    setCourseType('')
    setStartDate('')
    setOfflineCourseIds(defaultOfflineCourseIds())
  }, [])

  const closeClassModal = useCallback(() => {
    reset()
    onClose()
  }, [onClose, reset])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') closeClassModal()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, closeClassModal])

  const handleCreateClass = (e) => {
    e.preventDefault()
    if (!session?.partnerId) return
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
    if (typeof afterCreate === 'function') {
      queueMicrotask(() => afterCreate(r.newClassId))
    }
  }

  if (!open || !session?.partnerId) return null

  return (
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
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              placeholder="输入班级名称"
              maxLength={60}
              autoFocus
            />
          </div>
          <div>
            <span className="block text-sm font-medium text-slate-600 mb-2">
              线下课程包
              <span className="font-normal text-slate-400">（演示：人工智能课 1～9 星，可选；亦可创建后在班级详情添加）</span>
            </span>
            <p className="text-xs text-slate-500 mb-2 leading-relaxed">
              共 {FRANCHISE_CLASS_CREATE_OFFLINE_DEMO_PACKS.length} 个课程包，列表区域约显示 5 条，其余请向下滚动查看。
            </p>
            <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
              <div className="max-h-[17rem] overflow-y-auto overscroll-y-contain divide-y divide-slate-100">
                {FRANCHISE_CLASS_CREATE_OFFLINE_DEMO_PACKS.map((c) => {
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
                            const p = getFranchiseOfflinePackMeta(c.id)
                            if (p && !courseType.trim()) {
                              setCourseType(String(p.name).replace(/^《|》$/g, '').slice(0, 40))
                            }
                          }
                        }}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/30"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="text-sm font-medium text-slate-800">{c.name}</span>
                        <span className="block text-xs text-slate-500 mt-0.5">线下共 {nLess} 课时</span>
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              可先不选，后续进入班级详情添加；多课程包课时按列表顺序合并，与线上学习进度独立。
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">备注</label>
            <input
              value={courseType}
              onChange={(e) => setCourseType(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              placeholder="如：周末班、暑期集训（可选）"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">开课日期</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
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
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-600"
            >
              确认创建
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
