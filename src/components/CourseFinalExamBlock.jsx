import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import ReactECharts from 'echarts-for-react'
import ReportShareModal from './ReportShareModal'
import ReportSummaryUserHeader from './ReportSummaryUserHeader'
import { saveReportAsPdf } from '../utils/saveReportAsPdf'
import {
  buildCourseFinalExamSession,
  COURSE_FINAL_EXAM_TOTAL,
  dimensionMeta,
  isL3AnswerCorrect,
  L3_EVALUATION_DIMENSIONS,
} from '../data/l3QuestionBank'

const PASS_PCT = 60

const CARD_WRAP = 'card border border-slate-200 shadow-sm bg-white rounded-2xl'

function getQuizItemStatus(q, a) {
  if (a === 'skip') return 'skip'
  if (a == null) return 'empty'
  if (q.type === 'fill_blank' && String(a).trim() === '') return 'empty'
  if (q.type === 'judge' && a !== true && a !== false) return 'empty'
  return 'done'
}

function buildDimensionStats(questions, answers) {
  const map = Object.fromEntries(L3_EVALUATION_DIMENSIONS.map((d) => [d.key, { correct: 0, total: 0, skip: 0 }]))
  questions.forEach((q, i) => {
    const k = q.dim && map[q.dim] ? q.dim : 'ml_theory'
    map[k].total += 1
    const a = answers[i]
    if (a === 'skip' || a == null) map[k].skip += 1
    else if (isL3AnswerCorrect(q, a)) map[k].correct += 1
  })
  return L3_EVALUATION_DIMENSIONS.map((d) => {
    const s = map[d.key]
    const pct = s.total ? Math.round((s.correct / s.total) * 100) : 0
    const passed = pct >= PASS_PCT
    return { ...d, ...s, pct, passed }
  })
}

function buildCourseFinalExamSummaryText(dimStats, accPct) {
  const weak = dimStats.filter((x) => x.total > 0 && x.pct < PASS_PCT)
  let text =
    '本次整体考评题目与飞书 L3 建模素养题库同源，随机抽取共 ' +
    String(COURSE_FINAL_EXAM_TOTAL) +
    ' 题，涵盖选择、填空与判断，用于检验整门课学完后对核心概念的把握。'
  if (accPct >= 85) {
    text += ` 你的正确率为 ${accPct}%，整体掌握扎实，可继续通过综合项目巩固迁移能力。`
  } else if (accPct >= 70) {
    text += ` 正确率 ${accPct}%，基础良好，建议针对错题涉及的能力要点回看对应章节与互动练习。`
  } else if (accPct >= 50) {
    text += ` 正确率 ${accPct}%，仍有明显提升空间，可对照 L3 单元评价要点逐项查漏补缺。`
  } else {
    text += ` 正确率 ${accPct}%，建议系统复习课程主线后使用「重做考评」再次检验。`
  }
  if (weak.length) {
    text += ` 相对薄弱的维度包括：${weak.map((w) => w.name).join('、')}。`
  }
  return text
}

function fmtMmSs(sec) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

/**
 * 学习中心课时列表内：与「整个课程的学习总结」同款的行式入口，跳转独立考评页。
 */
export function CourseFinalExamListCard({ courseId, allCompleted = false }) {
  return (
    <div id={`course-final-exam-${courseId}`} className="scroll-mt-24 border-t border-slate-100">
      <Link
        to={`/profile/study/exam/${courseId}`}
        className={
          'w-full flex items-center gap-3 px-5 py-3.5 transition text-left ' +
          (allCompleted ? 'hover:bg-primary/5' : 'hover:bg-amber-50/80 bg-amber-50/30')
        }
      >
        <div
          className={
            'shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm ' +
            (allCompleted ? 'bg-primary/10 text-primary' : 'bg-amber-100 text-amber-800')
          }
          aria-hidden
        >
          📋
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-bingo-dark">结业整体考评</p>
          <p className="text-xs text-slate-500">
            {allCompleted
              ? `共 ${COURSE_FINAL_EXAM_TOTAL} 道随机题（L3 · 选择/填空/判断），独立页作答，流程同 AI 测评`
              : `学完全部课节后结业自检 · 共 ${COURSE_FINAL_EXAM_TOTAL} 题，可先了解入口`}
          </p>
        </div>
        <span className="shrink-0 text-slate-400">→</span>
      </Link>
    </div>
  )
}

/**
 * 独立考评页内：全流程卡片化（说明 → 答题 → 报告）。
 */
export default function CourseFinalExamBlock({ courseTitle }) {
  const [phase, setPhase] = useState('intro')
  const [quizQuestions, setQuizQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [currentQ, setCurrentQ] = useState(0)
  const [reportSnapshot, setReportSnapshot] = useState(null)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const testStartRef = useRef(null)
  const reportPdfRef = useRef(null)

  function startExam() {
    setQuizQuestions(buildCourseFinalExamSession())
    setAnswers({})
    setCurrentQ(0)
    testStartRef.current = Date.now()
    setPhase('quiz')
  }

  function submitTest() {
    const qs = [...quizQuestions]
    const ans = { ...answers }
    qs.forEach((_, i) => {
      if (ans[i] == null) ans[i] = 'skip'
    })
    const elapsed = testStartRef.current ? Math.max(1, Math.round((Date.now() - testStartRef.current) / 1000)) : 0
    setReportSnapshot({ questions: qs, answers: ans, elapsedSec: elapsed })
    setPhase('report')
  }

  function redoExam() {
    setReportSnapshot(null)
    startExam()
  }

  function backToIntro() {
    setReportSnapshot(null)
    setQuizQuestions([])
    setAnswers({})
    setCurrentQ(0)
    setPhase('intro')
  }

  const qNow = quizQuestions[currentQ]
  const aNow = answers[currentQ]
  const canNext =
    aNow === 'skip' ||
    (aNow != null &&
      (qNow?.type === 'fill_blank'
        ? String(aNow).trim().length > 0
        : qNow?.type === 'judge'
          ? aNow === true || aNow === false
          : true))

  function nextOrSubmit() {
    const len = quizQuestions.length
    if (len === 0) return
    if (currentQ < len - 1) setCurrentQ((q) => q + 1)
    else submitTest()
  }

  const dimStats = useMemo(() => {
    if (!reportSnapshot) return null
    return buildDimensionStats(reportSnapshot.questions, reportSnapshot.answers)
  }, [reportSnapshot])

  const radarOption = useMemo(() => {
    if (!dimStats) return null
    const values = L3_EVALUATION_DIMENSIONS.map((d) => {
      const s = dimStats.find((x) => x.key === d.key)
      return s ? s.pct : 0
    })
    return {
      color: ['#0891b2'],
      radar: {
        indicator: L3_EVALUATION_DIMENSIONS.map((d) => ({ name: d.name, max: 100 })),
        splitNumber: 5,
        axisName: { color: '#64748b', fontSize: 11, lineHeight: 14 },
        splitLine: { lineStyle: { color: ['#e2e8f0'] } },
        splitArea: { show: false },
      },
      series: [
        {
          type: 'radar',
          data: [{ value: values, name: '掌握度', areaStyle: { opacity: 0.22 }, lineStyle: { width: 2 } }],
        },
      ],
    }
  }, [dimStats])

  const reportStats = useMemo(() => {
    if (!reportSnapshot || !dimStats) return null
    const { questions, answers: ans, elapsedSec } = reportSnapshot
    const n = questions.length
    let correct = 0
    let skip = 0
    questions.forEach((q, i) => {
      const a = ans[i]
      if (a === 'skip') skip += 1
      else if (isL3AnswerCorrect(q, a)) correct += 1
    })
    const accPct = n ? Math.round((correct / n) * 100) : 0
    const masteredTags = dimStats.filter((d) => d.pct >= 80)
    const weakTags = dimStats.filter((d) => d.pct < 80)
    const summaryText = buildCourseFinalExamSummaryText(dimStats, accPct)
    return { correct, skip, n, accPct, elapsedSec, masteredTags, weakTags, summaryText }
  }, [reportSnapshot, dimStats])

  if (phase === 'intro') {
    return (
      <div className={`${CARD_WRAP} p-6 sm:p-8 ring-1 ring-primary/5`}>
        <p className="text-[11px] font-semibold tracking-wide text-primary uppercase mb-2">结业 · 整体考评</p>
        <h2 className="text-xl sm:text-2xl font-bold text-bingo-dark m-0 mb-3">学完后整体检验</h2>
        <p className="text-sm text-slate-600 leading-relaxed m-0 mb-4">
          下列 {COURSE_FINAL_EXAM_TOTAL}{' '}
          道随机题（飞书 L3：选择、填空、判断），流程与「AI 测评」一致。提交后可查看评价总结与逐题明细，也可重做换一批题目。
        </p>
        {courseTitle ? <p className="text-sm text-slate-500 m-0 mb-6 border-l-2 border-primary/30 pl-3">{courseTitle}</p> : null}
        <button type="button" onClick={startExam} className="btn-primary inline-flex justify-center py-3 px-6 rounded-xl text-sm font-semibold">
          开始考评
        </button>
      </div>
    )
  }

  if (phase === 'quiz' && qNow) {
    return (
      <div className={`${CARD_WRAP} p-5 sm:p-7`}>
        <div className="max-w-5xl mx-auto w-full">
          <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
            <h2 className="text-xl font-bold text-bingo-dark m-0">
              结业整体考评
              <span className="block sm:inline sm:ml-2 text-sm font-semibold text-primary">（L3 · 建模素养）</span>
            </h2>
            <span className="text-sm text-slate-500 tabular-nums shrink-0">
              {quizQuestions.length ? `${currentQ + 1} / ${quizQuestions.length}` : '—'}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mb-6">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${quizQuestions.length ? ((currentQ + 1) / quizQuestions.length) * 100 : 0}%` }}
            />
          </div>

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
            <div className="flex-1 min-w-0 w-full">
              <div className="card p-6 sm:p-8 border border-slate-100 shadow-inner bg-slate-50/40">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h3 className="font-semibold text-bingo-dark text-base m-0">
                    {currentQ + 1}. {qNow.q}
                  </h3>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {qNow.type === 'fill_blank' ? '填空题' : qNow.type === 'judge' ? '判断题' : '选择题'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mb-4 m-0">所属评价要点：{dimensionMeta(qNow.dim)?.name || '—'}</p>

                {qNow.type === 'fill_blank' ? (
                  <input
                    type="text"
                    value={String(answers[currentQ] ?? '').replace(/^skip$/, '')}
                    onChange={(e) => setAnswers({ ...answers, [currentQ]: e.target.value })}
                    disabled={answers[currentQ] === 'skip'}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 disabled:bg-slate-50 disabled:text-slate-400"
                    placeholder="请输入答案"
                    autoComplete="off"
                  />
                ) : qNow.type === 'judge' ? (
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { v: true, label: '正确' },
                      { v: false, label: '错误' },
                    ].map(({ v, label }) => (
                      <button
                        key={String(v)}
                        type="button"
                        onClick={() => setAnswers({ ...answers, [currentQ]: v })}
                        className={
                          'px-5 py-3 rounded-xl border text-sm font-medium transition ' +
                          (answers[currentQ] === v
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-slate-200 text-slate-700 hover:border-primary/30 hover:bg-slate-50')
                        }
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(qNow.opts || []).map((opt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setAnswers({ ...answers, [currentQ]: opt[0] })}
                        className={
                          'w-full text-left px-5 py-3 rounded-xl border text-sm transition ' +
                          (answers[currentQ] === opt[0]
                            ? 'border-primary bg-primary/5 text-primary font-medium'
                            : 'border-slate-200 hover:border-primary/30 hover:bg-slate-50')
                        }
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setAnswers({ ...answers, [currentQ]: 'skip' })}
                  className={
                    'mt-4 w-full py-2.5 rounded-xl text-sm border transition ' +
                    (answers[currentQ] === 'skip'
                      ? 'border-amber-500 bg-amber-50 text-amber-900 font-medium'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50')
                  }
                >
                  不会（本题跳过）
                </button>
                <div className="flex gap-3 mt-6">
                  {currentQ > 0 && (
                    <button
                      type="button"
                      onClick={() => setCurrentQ((q) => q - 1)}
                      className="rounded-lg border border-slate-200 text-slate-600 px-5 py-2.5 text-sm hover:bg-slate-50"
                    >
                      上一题
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={nextOrSubmit}
                    disabled={!canNext}
                    className="btn-primary ml-auto px-5 py-2.5 text-sm disabled:opacity-45 disabled:pointer-events-none"
                  >
                    {currentQ < quizQuestions.length - 1 ? '下一题' : '提交测评'}
                  </button>
                </div>
              </div>
            </div>

            {quizQuestions.length > 0 && (
              <aside
                className="w-full lg:w-52 xl:w-56 shrink-0 rounded-xl border border-slate-200 bg-slate-50/90 px-3 py-3 shadow-sm lg:sticky lg:top-24 self-start"
                aria-label="题目进度"
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <p className="text-xs font-semibold text-bingo-dark m-0">题目进度</p>
                  <p className="text-[11px] text-slate-500 tabular-nums m-0">
                    <span className="text-slate-400">已处理 </span>
                    {
                      quizQuestions.filter((q, i) => {
                        const st = getQuizItemStatus(q, answers[i])
                        return st === 'done' || st === 'skip'
                      }).length
                    }
                    <span className="text-slate-400"> / </span>
                    {quizQuestions.length}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {quizQuestions.map((q, i) => {
                    const st = getQuizItemStatus(q, answers[i])
                    const isCur = i === currentQ
                    const base =
                      'h-9 w-full rounded-lg text-xs font-semibold tabular-nums transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 '
                    let cls = base
                    if (isCur) cls += 'bg-primary text-white shadow-md ring-2 ring-primary/35 ring-offset-1 ring-offset-slate-50'
                    else if (st === 'done') cls += 'bg-emerald-500 text-white hover:bg-emerald-600'
                    else if (st === 'skip') cls += 'bg-amber-100 text-amber-900 border border-amber-200 hover:bg-amber-200/80'
                    else cls += 'bg-white text-slate-400 border border-slate-200 border-dashed hover:border-slate-300 hover:text-slate-600'
                    const title =
                      st === 'done'
                        ? '已作答，点击跳转'
                        : st === 'skip'
                          ? '已标记不会，点击跳转'
                          : isCur
                            ? '当前题目'
                            : '未作答，点击跳转'
                    return (
                      <button key={q.id || i} type="button" title={title} onClick={() => setCurrentQ(i)} className={cls}>
                        {i + 1}
                      </button>
                    )
                  })}
                </div>
                <ul className="mt-3 pt-3 border-t border-slate-200/80 space-y-1.5 text-[10px] text-slate-500">
                  <li className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-sm bg-primary shrink-0 ring-2 ring-primary/30" aria-hidden />
                    当前
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-sm bg-emerald-500 shrink-0" aria-hidden />
                    已答
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-sm bg-amber-100 border border-amber-300 shrink-0" aria-hidden />
                    跳过
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-sm border border-dashed border-slate-300 bg-white shrink-0" aria-hidden />
                    未答
                  </li>
                </ul>
              </aside>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'report' && reportSnapshot && reportStats && dimStats && radarOption) {
    const statCells = [
      { v: `${reportStats.accPct}%`, label: '总正确率' },
      { v: `${reportStats.correct}/${reportStats.n}`, label: '正确题数' },
      { v: fmtMmSs(reportStats.elapsedSec), label: '用时' },
      { v: String(reportStats.skip), label: '不会' },
    ]
    return (
      <div className="max-w-lg mx-auto sm:max-w-xl md:max-w-2xl pb-12">
        <div ref={reportPdfRef}>
          <div className="rounded-b-3xl bg-gradient-to-b from-bingo-dark via-cyan-900 to-primary text-white px-5 pt-8 pb-20 text-center shadow-lg">
          <ReportSummaryUserHeader />
          <p className="mt-3 text-2xl font-bold leading-snug text-white sm:text-3xl md:text-4xl">结业整体考评 · L3</p>
          <div className="mt-8 flex items-stretch justify-center gap-0 text-sm">
            {statCells.map((cell, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-center px-1 border-l border-white/30 first:border-l-0 min-w-0">
                <span className="text-xl sm:text-2xl font-bold tabular-nums leading-tight">{cell.v}</span>
                <span className="text-[11px] text-white/85 mt-1">{cell.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="-mt-14 relative z-10 bg-white rounded-t-3xl shadow-xl border border-slate-100 px-4 sm:px-6 pt-6 pb-8">
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <h2 className="text-base font-bold text-bingo-dark">综合评价</h2>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-primary text-white px-2 py-0.5 rounded-full">
              <span aria-hidden>✦</span> AI
            </span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed mb-6">{reportStats.summaryText}</p>

          <div className="mb-6">
            <p className="text-xs font-medium text-slate-700 flex items-center gap-1.5 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              已掌握
            </p>
            <div className="flex flex-wrap gap-2">
              {reportStats.masteredTags.length ? (
                reportStats.masteredTags.map((d) => (
                  <span key={d.key} className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100">
                    {d.name} {d.pct}%
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">暂无明显满分维度，继续加油</span>
              )}
            </div>
          </div>
          <div className="mb-8">
            <p className="text-xs font-medium text-slate-700 flex items-center gap-1.5 mb-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              待加强
            </p>
            <div className="flex flex-wrap gap-2">
              {reportStats.weakTags.length ? (
                reportStats.weakTags.map((d) => (
                  <span key={d.key} className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-100">
                    {d.name} {d.pct}%
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">当前无低于 80% 的薄弱维度</span>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-4 mb-8">
            <p className="text-xs text-slate-500 mb-2">知识掌握雷达图（轴：L3_单元表评价要点，与飞书表一致后可整体替换数据源）</p>
            <ReactECharts option={radarOption} style={{ height: 300 }} opts={{ renderer: 'svg' }} />
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white px-3 py-4 mb-8">
            <h3 className="text-sm font-bold text-bingo-dark mb-4">分维度成绩</h3>
            <div className="space-y-5">
              {dimStats.map((d) => {
                const barPct = d.pct
                const isZero = barPct === 0
                const isPass = d.passed && !isZero
                const barColor = isZero ? 'bg-slate-200' : isPass ? 'bg-emerald-500' : 'bg-red-400'
                return (
                  <div key={d.key}>
                    <div className="flex justify-between gap-2 items-start mb-1">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-bingo-dark">{d.name}</p>
                        <p className="text-[11px] text-slate-400">{d.unit}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-bingo-dark tabular-nums">
                          {d.correct}/{d.total}
                          {d.skip > 0 ? <span className="text-[11px] font-normal text-slate-400 ml-1">跳过{d.skip}题</span> : null}
                        </p>
                        <span
                          className={
                            'inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full ' +
                            (d.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-50 text-red-600')
                          }
                        >
                          {d.passed ? '达标' : '未达标'}
                        </span>
                        <p className="text-[11px] text-slate-400 mt-0.5">正确率 {d.pct}%</p>
                      </div>
                    </div>
                    <div className="relative h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={'h-full rounded-full transition-all ' + barColor} style={{ width: `${Math.min(100, barPct)}%` }} />
                      <div
                        className="absolute top-0 bottom-0 w-px bg-slate-500/70 z-10"
                        style={{ left: `${PASS_PCT}%` }}
                        title={`${PASS_PCT}% 达标线`}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <details className="rounded-2xl border border-slate-100 bg-white px-3 py-2 mb-8 group">
            <summary className="cursor-pointer list-none py-2 px-1 text-sm font-bold text-bingo-dark flex items-center justify-between gap-2 [&::-webkit-details-marker]:hidden">
              <span>答题详情</span>
              <span className="text-xs font-normal text-primary group-open:hidden">点击展开全部</span>
              <span className="text-xs font-normal text-slate-500 hidden group-open:inline">点击收起</span>
            </summary>
            <ul className="report-detail-list divide-y divide-slate-100 max-h-[28rem] overflow-y-auto border-t border-slate-100 mt-2 pt-1">
              {reportSnapshot.questions.map((q, i) => {
                const a = reportSnapshot.answers[i]
                const ok = isL3AnswerCorrect(q, a)
                const meta = dimensionMeta(q.dim)
                const pickedOpt = q.opts?.find((o) => o[0] === a)
                const yourText =
                  a === 'skip'
                    ? null
                    : q.type === 'fill_blank'
                      ? String(a).trim() || '—'
                      : q.type === 'judge'
                        ? a === true
                          ? '正确'
                          : a === false
                            ? '错误'
                            : '—'
                        : pickedOpt || a || '—'
                const refText =
                  q.type === 'fill_blank'
                    ? (q.blanks || []).join(' / ')
                    : q.type === 'judge'
                      ? q.ans === true
                        ? '正确'
                        : '错误'
                      : q.opts?.find((o) => o[0] === q.ans)?.slice(2)?.trim() || q.ans
                return (
                  <li key={q.id || i} className="py-3 text-sm">
                    <p className="font-medium text-bingo-dark">
                      {i + 1}. {q.q}
                      <span className="ml-2 text-[10px] font-normal text-slate-400">
                        {q.type === 'fill_blank' ? '填空' : q.type === 'judge' ? '判断' : '选择'}
                      </span>
                    </p>
                    <p className="text-xs text-slate-500 mt-1">维度：{meta?.name || '—'}</p>
                    <p className="mt-1 text-slate-600">
                      你的作答：
                      <span className={ok ? 'text-emerald-600 font-medium' : a === 'skip' ? 'text-amber-600' : 'text-red-600'}>
                        {a === 'skip' ? '不会（跳过）' : yourText}
                      </span>
                      {ok ? ' ✓' : a === 'skip' ? '' : ' ✗'}
                    </p>
                    {!ok && <p className="text-xs text-slate-500 mt-0.5">参考答案：{refText}</p>}
                  </li>
                )
              })}
            </ul>
          </details>
        </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-3 px-4 sm:px-6">
          <button
            type="button"
            className="btn-primary text-sm px-5 py-2.5"
            onClick={async () => {
              try {
                const stamp = new Date().toISOString().slice(0, 19).replace(/T/, '_').replace(/:/g, '-')
                await saveReportAsPdf(reportPdfRef.current, `结业考评报告-${stamp}.pdf`)
              } catch {
                window.alert('导出 PDF 失败，请稍后重试或使用浏览器打印。')
              }
            }}
          >
            保存报告
          </button>
          <button
            type="button"
            className="rounded-lg border border-primary text-primary text-sm px-5 py-2.5 hover:bg-primary/10"
            onClick={() => setShareModalOpen(true)}
          >
            分享
          </button>
          <button type="button" onClick={redoExam} className="rounded-lg border border-slate-200 text-slate-600 text-sm px-5 py-2.5 hover:bg-slate-50">
            重做考评
          </button>
        </div>
        <ReportShareModal
          open={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          shareUrl={typeof window !== 'undefined' ? window.location.href : ''}
          title="分享结业考评"
        />
      </div>
    )
  }

  return null
}
