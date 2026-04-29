import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { addStudentToClass, createClass, deleteClass } from '../../utils/franchisePartnerStorage'
import { useFranchiseWorkspace } from './useFranchiseWorkspace'

function fmtDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function FranchisePartnerClasses() {
  const { session, ws, refresh } = useFranchiseWorkspace()
  const [classModalOpen, setClassModalOpen] = useState(false)
  const [name, setName] = useState('')
  const [courseType, setCourseType] = useState('')
  const [startDate, setStartDate] = useState('')
  const [classErr, setClassErr] = useState('')

  const [studentModalClassId, setStudentModalClassId] = useState(null)
  const [stuName, setStuName] = useState('')
  const [stuPhone, setStuPhone] = useState('')
  const [stuRemark, setStuRemark] = useState('')
  const [stuErr, setStuErr] = useState('')

  useEffect(() => {
    if (!classModalOpen && !studentModalClassId) return
    const onKey = (e) => {
      if (e.key === 'Escape') {
        closeClassModal()
        closeStudentModal()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [classModalOpen, studentModalClassId])

  if (!ws || !session) return <p className="text-slate-500 text-sm">加载中…</p>

  const closeClassModal = () => {
    setClassModalOpen(false)
    setClassErr('')
    setName('')
    setCourseType('')
    setStartDate('')
  }

  const closeStudentModal = () => {
    setStudentModalClassId(null)
    setStuName('')
    setStuPhone('')
    setStuRemark('')
    setStuErr('')
  }

  const handleCreateClass = (e) => {
    e.preventDefault()
    setClassErr('')
    const n = name.trim()
    if (!n) {
      setClassErr('请输入班级名称')
      return
    }
    createClass(session.partnerId, session.refCode, n, { courseType, startDate })
    closeClassModal()
    refresh()
  }

  const handleDelete = (cls) => {
    const tip =
      `确定删除班级「${cls.name}」？\n` +
      (cls.studentIds?.length
        ? `班内 ${cls.studentIds.length} 名学员将变为「未分班」，学员与学习记录仍会保留。`
        : '删除后可在学员管理中为学员重新指定班级。')
    if (!window.confirm(tip)) return
    const r = deleteClass(session.partnerId, session.refCode, cls.id)
    if (!r.ok) {
      window.alert(r.msg || '删除失败')
      return
    }
    refresh()
  }

  const openAddStudent = (classId) => {
    setStuErr('')
    setStuName('')
    setStuPhone('')
    setStuRemark('')
    setStudentModalClassId(classId)
  }

  const handleAddStudent = (e) => {
    e.preventDefault()
    setStuErr('')
    if (!studentModalClassId) return
    const r = addStudentToClass(session.partnerId, session.refCode, studentModalClassId, stuPhone, stuName, stuRemark)
    if (!r.ok) {
      setStuErr(r.msg)
      return
    }
    closeStudentModal()
    refresh()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 min-w-0">
        <h1 className="text-xl font-bold text-slate-900 truncate min-w-0">班级管理</h1>
        <button
          type="button"
          onClick={() => {
            setClassErr('')
            setClassModalOpen(true)
          }}
          className="shrink-0 px-4 py-2.5 rounded-lg bg-[#3B66FF] hover:bg-[#2f56e6] text-white text-sm font-semibold whitespace-nowrap"
        >
          + 创建班级
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-[15px] font-semibold text-slate-900">班级列表</h2>
          <span className="text-xs text-slate-400">共 {ws.classes.length} 个班</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[720px]">
            <thead className="bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-5 py-3 font-medium">班级名称</th>
                <th className="px-5 py-3 font-medium">学员数量</th>
                <th className="px-5 py-3 font-medium">课程类型</th>
                <th className="px-5 py-3 font-medium">开课日期</th>
                <th className="px-5 py-3 font-medium">创建时间</th>
                <th className="px-5 py-3 font-medium">状态</th>
                <th className="px-5 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {ws.classes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-500">
                    暂无班级，点击「创建班级」添加。
                  </td>
                </tr>
              ) : (
                ws.classes.map((cls) => {
                  const n = cls.studentIds?.length || 0
                  const active = n > 0
                  return (
                    <tr key={cls.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                      <td className="px-5 py-3 font-semibold text-slate-900">{cls.name}</td>
                      <td className="px-5 py-3 text-slate-700">
                        {n > 0 ? (
                          <Link
                            to={`/franchise-partner/students?classId=${encodeURIComponent(cls.id)}`}
                            className="font-medium text-[#3B66FF] hover:text-[#2f56e6] hover:underline tabular-nums"
                            title="查看该班成员列表"
                          >
                            {n}
                          </Link>
                        ) : (
                          <span className="tabular-nums text-slate-500">0</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-slate-600">{cls.courseType || '—'}</td>
                      <td className="px-5 py-3 text-slate-600">{cls.startDate || '—'}</td>
                      <td className="px-5 py-3 text-slate-500">{fmtDate(cls.createdAt)}</td>
                      <td className="px-5 py-3">
                        <span
                          className={
                            'text-xs px-2.5 py-0.5 rounded-full font-medium ' +
                            (active ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800')
                          }
                        >
                          {active ? '进行中' : '招生中'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => openAddStudent(cls.id)}
                            className="inline-flex shrink-0 items-center justify-center px-3 py-2 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-300 hover:bg-slate-200 hover:border-slate-400 transition-colors"
                          >
                            添加学员
                          </button>
                          <Link
                            to={`/franchise-partner/students?classId=${encodeURIComponent(cls.id)}`}
                            className="inline-flex shrink-0 items-center justify-center px-3 py-2 rounded-lg bg-white text-slate-700 text-xs font-semibold border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                            aria-label={`查看「${cls.name}」班级成员`}
                            title="查看该班全部学员及学习记录"
                          >
                            查看成员
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(cls)}
                            className="inline-flex shrink-0 items-center justify-center px-3 py-2 rounded-lg bg-rose-50 text-rose-800 text-xs font-semibold border border-rose-200 hover:bg-rose-100 hover:border-rose-300 transition-colors"
                          >
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {classModalOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={closeClassModal} role="presentation" />
          <div
            className="relative w-full max-w-[460px] rounded-xl bg-white shadow-xl border border-slate-200"
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
                <label className="block text-sm font-medium text-slate-600 mb-1">课程类型</label>
                <input
                  value={courseType}
                  onChange={(e) => setCourseType(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-[#3B66FF] focus:ring-2 focus:ring-[#3B66FF]/15"
                  placeholder="如：AI启蒙、Python入门"
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

      {studentModalClassId ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" onClick={closeStudentModal} role="presentation" />
          <div
            className="relative w-full max-w-[460px] rounded-xl bg-white shadow-xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-900">添加学员</h2>
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
