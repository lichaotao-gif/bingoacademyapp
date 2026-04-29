import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  FRANCHISE_PROMOTABLE_COURSES,
  getDiscountLabel,
  getDiscountRate,
  rechargeCourse,
} from '../../utils/franchisePartnerStorage'
import { FranchisePartnerStepper } from './FranchisePartnerStepper'
import { useFranchiseWorkspace } from './useFranchiseWorkspace'

const STEPS = ['选择学员', '选择课程', '确认扣费', '完成']

export default function FranchisePartnerRecharge() {
  const { session, ws, refresh } = useFranchiseWorkspace()
  const [searchParams] = useSearchParams()
  const studentParam = searchParams.get('studentId')
  const [step, setStep] = useState(1)
  const [studentId, setStudentId] = useState('')
  const [courseId, setCourseId] = useState(FRANCHISE_PROMOTABLE_COURSES[0]?.id || '')
  const [err, setErr] = useState('')
  const [lastOrderId, setLastOrderId] = useState('')

  useEffect(() => {
    if (!ws?.students?.length) return
    if (studentParam && ws.students.some((s) => s.id === studentParam)) {
      setStudentId(studentParam)
      setStep(1)
      setErr('')
      setLastOrderId('')
    }
  }, [studentParam, ws])

  const preview = useMemo(() => {
    if (!ws || !courseId) return null
    const c = FRANCHISE_PROMOTABLE_COURSES.find((x) => x.id === courseId)
    if (!c) return null
    const rate = getDiscountRate(ws, courseId)
    const pay = Math.round(c.price * rate * 100) / 100
    return {
      original: c.price,
      label: getDiscountLabel(ws, courseId),
      pay,
      name: c.name,
    }
  }, [ws, courseId])

  const selectedStudent = useMemo(() => {
    if (!ws || !studentId) return null
    return ws.students.find((s) => s.id === studentId) || null
  }, [ws, studentId])

  const resetFlow = () => {
    setStep(1)
    setStudentId('')
    setCourseId(FRANCHISE_PROMOTABLE_COURSES[0]?.id || '')
    setErr('')
    setLastOrderId('')
  }

  if (!ws || !session) return <p className="text-slate-500 text-sm">加载中…</p>

  const goNextFrom1 = () => {
    setErr('')
    if (!studentId) {
      setErr('请先选择学员')
      return
    }
    setStep(2)
  }

  const goNextFrom2 = () => {
    setErr('')
    if (!courseId) {
      setErr('请选择课程包')
      return
    }
    setStep(3)
  }

  const confirmDeduct = () => {
    setErr('')
    const r = rechargeCourse(session.partnerId, session.refCode, { studentId, courseId })
    if (!r.ok) {
      setErr(r.msg)
      return
    }
    setLastOrderId(r.orderId || '')
    refresh()
    setStep(4)
  }

  return (
    <div className="space-y-6 max-w-[600px]">
      <p className="text-sm text-slate-500">
        按步骤完成充课：系统将按
        <Link to="/franchise-partner/discounts" className="text-[#3B66FF] hover:underline mx-0.5">
          专属折扣
        </Link>
        从
        <Link to="/franchise-partner/balance" className="text-[#3B66FF] hover:underline mx-0.5">
          账户余额
        </Link>
        扣款并生成订单。
      </p>

      <FranchisePartnerStepper steps={STEPS} current={step} />

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">选择学员</label>
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-[#3B66FF] focus:ring-2 focus:ring-[#3B66FF]/15"
              >
                <option value="">请选择学员…</option>
                {ws.students.map((s) => {
                  const cls = ws.classes.find((c) => c.id === s.classId)
                  return (
                    <option key={s.id} value={s.id}>
                      {s.name}
                      {cls ? ` — ${cls.name}` : ''}
                    </option>
                  )
                })}
              </select>
              <p className="text-xs text-slate-400 mt-2">
                没有学员？先到
                <Link to="/franchise-partner/students" className="text-[#3B66FF] hover:underline">
                  学员管理
                </Link>
                添加。
              </p>
            </div>
            {err ? <p className="text-sm text-red-600">{err}</p> : null}
            <button
              type="button"
              onClick={goNextFrom1}
              className="px-4 py-2.5 rounded-lg bg-[#3B66FF] hover:bg-[#2f56e6] text-white text-sm font-semibold"
            >
              下一步
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1.5">选择课程包</label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-[#3B66FF] focus:ring-2 focus:ring-[#3B66FF]/15"
              >
                {FRANCHISE_PROMOTABLE_COURSES.map((c) => {
                  const rate = getDiscountRate(ws, c.id)
                  const pay = Math.round(c.price * rate * 100) / 100
                  const lab = getDiscountLabel(ws, c.id)
                  return (
                    <option key={c.id} value={c.id}>
                      {c.name} — ¥{pay.toFixed(2)}（{lab}）
                    </option>
                  )
                })}
              </select>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setErr('')
                  setStep(1)
                }}
                className="px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50"
              >
                上一步
              </button>
              <button
                type="button"
                onClick={goNextFrom2}
                className="px-4 py-2.5 rounded-lg bg-[#3B66FF] hover:bg-[#2f56e6] text-white text-sm font-semibold"
              >
                下一步
              </button>
            </div>
          </div>
        )}

        {step === 3 && preview && selectedStudent && (
          <div className="space-y-5">
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-5 py-4 space-y-2 text-sm">
              <div className="flex justify-between gap-4 py-2 border-b border-slate-200/80">
                <span className="text-slate-500">学员</span>
                <strong className="text-slate-900 text-right">{selectedStudent.name}</strong>
              </div>
              <div className="flex justify-between gap-4 py-2 border-b border-slate-200/80">
                <span className="text-slate-500">课程包</span>
                <strong className="text-slate-900 text-right max-w-[60%]">{preview.name}</strong>
              </div>
              <div className="flex justify-between gap-4 py-2 border-b border-slate-200/80">
                <span className="text-slate-500">折扣</span>
                <strong className="text-slate-900">{preview.label}</strong>
              </div>
              <div className="flex justify-between gap-4 py-2 border-b border-slate-200/80">
                <span className="text-slate-500">扣费金额</span>
                <strong className="text-[#3B66FF] tabular-nums">¥{preview.pay.toFixed(2)}</strong>
              </div>
              <div className="flex justify-between gap-4 py-2">
                <span className="text-slate-500">扣费来源</span>
                <strong className="text-slate-900">账户余额（当前 ¥{ws.balance.toFixed(2)}）</strong>
              </div>
            </div>
            {err ? <p className="text-sm text-red-600">{err}</p> : null}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setErr('')
                  setStep(2)
                }}
                className="px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50"
              >
                上一步
              </button>
              <button
                type="button"
                onClick={confirmDeduct}
                className="px-4 py-2.5 rounded-lg bg-[#3B66FF] hover:bg-[#2f56e6] text-white text-sm font-semibold"
              >
                确认扣费
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="text-center py-8 px-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-emerald-600">充课成功</h3>
            <p className="text-sm text-slate-500 mt-2 mb-1">课程已充入学员账户，费用已从余额扣除。</p>
            {lastOrderId ? <p className="text-xs text-slate-400 font-mono mb-6">订单号 {lastOrderId}</p> : <div className="mb-6" />}
            <button
              type="button"
              onClick={resetFlow}
              className="px-5 py-2.5 rounded-lg bg-[#3B66FF] hover:bg-[#2f56e6] text-white text-sm font-semibold"
            >
              继续充课
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
