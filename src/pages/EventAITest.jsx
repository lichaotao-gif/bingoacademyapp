import { useState, useRef, useMemo, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import ReactECharts from 'echarts-for-react'
import {
  buildL3TestSession,
  buildGeneralTestSession,
  L3_EVALUATION_DIMENSIONS,
  dimensionMeta,
  formatMultiChoiceAnswerLine,
  isL3AnswerCorrect,
  shortAnswerRefLine,
} from '../data/l3QuestionBank'
import { appendAiTestRecord, getAiTestRecords, getAiTestRecordById, removeAiTestRecord } from '../utils/aiTestRecordsStorage'
import ReportShareModal from '../components/ReportShareModal'
import ReportSummaryUserHeader from '../components/ReportSummaryUserHeader'
import { saveReportAsPdf } from '../utils/saveReportAsPdf'

const CN_STAR = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九']

/** 与认证中心九星·四阶体系一致，阶名已写入评测标题，不再单独展示「阶段」 */
function stageInTitleForStar(star) {
  if (star <= 3) return '启智阶'
  if (star <= 6) return '基础阶'
  if (star <= 8) return '精研阶'
  return '智创阶'
}

const STAR_EVALUATION_TYPES = Array.from({ length: 9 }, (_, i) => {
  const star = i + 1
  const stage = stageInTitleForStar(star)
  const cn = CN_STAR[star]
  return {
    id: `star_${star}`,
    name: `${cn}星AI评测 · ${stage}`,
    event: '建模素养/L3',
    duration: 12 + star * 2,
    originalPrice: star <= 3 ? '¥99' : star <= 6 ? '¥169' : star <= 8 ? '¥229' : '¥299',
    currentPrice: star <= 3 ? '免费' : `¥${29 + star * 8}/次`,
    desc: `对标${stage}${cn}星能力标准：单选、多选、填空、简答与判断综合测评，覆盖 L3 建模素养要点；完成后可查看维度分析与课程推荐。`,
  }
})

const TEST_TYPES = [
  {
    id: 'general',
    name: '普通测评',
    event: '综合摸底',
    duration: 12,
    originalPrice: '',
    currentPrice: '免费',
    desc: '适合还不确定具体学习方向的同学：综合摸底，含单选、多选、判断与简答样题。完成后结合薄弱维度为你推荐适合入门或强化的课程。',
  },
  ...STAR_EVALUATION_TYPES,
]

function isFreeTest(t) {
  if (!t?.currentPrice) return false
  return t.currentPrice === '免费' || t.currentPrice.includes('免费')
}

const PASS_PCT = 60

const REPORT_COURSES = [
  { name: 'AI启蒙通识课', to: '/courses/detail/ai-enlighten', price: 299, priceStr: '¥299起', tag: '推荐', courseId: 'ai-enlighten' },
  { name: 'AI精英进阶课', to: '/courses/detail/ai-advance-basic', price: 698, priceStr: '¥698起', tag: '补强', courseId: 'ai-advance-basic' },
  { name: '机器学习入门与实战', to: '/courses/detail/ai-advance-ml', price: 698, priceStr: '¥698起', tag: '进阶', courseId: 'ai-advance-ml' },
  { name: '白名单赛事通关营', to: '/events', price: 998, priceStr: '¥998', tag: '竞赛', courseId: null },
  { name: '科技特长生路径课', to: '/courses?type=exam', price: 1680, priceStr: '¥1680起', tag: '升学', courseId: null },
]

function fmtMmSs(sec) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function fmtRecordTime(iso) {
  try {
    const d = new Date(iso)
    return d.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso || '—'
  }
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

function buildAiSummary(dimStats, isGeneral) {
  const mastered = dimStats.filter((x) => x.pct >= 80)
  const weak = dimStats.filter((x) => x.pct < 60)
  const mid = dimStats.filter((x) => x.pct >= 60 && x.pct < 80)
  let text = isGeneral ? '根据本次普通综合测评，' : '根据本次测评，'
  if (mastered.length) text += `你在「${mastered.map((m) => m.name).join('、')}」等维度表现较好`
  else text += '各维度仍有较大提升空间'
  text += '。'
  if (weak.length) {
    text += isGeneral
      ? `其中「${weak.map((w) => w.name).join('、')}」相对薄弱，报告下方的课程推荐可结合这些方向优先试学。`
      : `建议优先补齐「${weak.map((w) => w.name).join('、')}」相关练习与单元复习，对照 L3_单元表逐项落实评价要点。`
  } else if (mid.length) {
    text += `可适当巩固「${mid.map((m) => m.name).join('、')}」，向满分能力进阶。`
  } else {
    text += isGeneral ? '整体均衡，可按兴趣在推荐课程中拓展学习。' : '整体均衡，可挑战更高阶建模任务与项目实战。'
  }
  return text
}

/** 单题作答状态：用于进度节点展示 */
function getQuizItemStatus(q, a) {
  if (a === 'skip') return 'skip'
  if (a == null) return 'empty'
  if (q.type === 'fill_blank' && String(a).trim() === '') return 'empty'
  if (q.type === 'short_answer' && String(a).trim() === '') return 'empty'
  if (q.type === 'multi_choice' && (!Array.isArray(a) || a.length === 0)) return 'empty'
  if (q.type === 'judge' && a !== true && a !== false) return 'empty'
  return 'done'
}

export default function EventAITest() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [phase, setPhase] = useState('entry')
  const [selectedTest, setSelectedTest] = useState(null)
  const [quizQuestions, setQuizQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [currentQ, setCurrentQ] = useState(0)
  const [reportSnapshot, setReportSnapshot] = useState(null)
  const [testRecords, setTestRecords] = useState(() => getAiTestRecords())
  const [recordsModalOpen, setRecordsModalOpen] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const testStartRef = useRef(null)
  const reportPdfRef = useRef(null)

  useEffect(() => {
    if (phase === 'entry') setTestRecords(getAiTestRecords())
  }, [phase])

  useEffect(() => {
    if (phase !== 'entry') setRecordsModalOpen(false)
  }, [phase])

  useEffect(() => {
    if (!recordsModalOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') setRecordsModalOpen(false)
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [recordsModalOpen])

  useEffect(() => {
    const rid = searchParams.get('record')
    if (!rid) return
    const r = getAiTestRecordById(rid)
    if (r?.snapshot?.questions) {
      setReportSnapshot(r.snapshot)
      const t = r.testId ? TEST_TYPES.find((x) => x.id === r.testId) : null
      if (t) setSelectedTest(t)
      setPhase('report')
    }
    setSearchParams({}, { replace: true })
  }, [searchParams, setSearchParams])

  function startAssessment(t) {
    setSelectedTest(t)
    setQuizQuestions(t.id === 'general' ? buildGeneralTestSession() : buildL3TestSession())
    setPhase('testing')
    setCurrentQ(0)
    setAnswers({})
    testStartRef.current = Date.now()
  }

  function submitTest() {
    const elapsed = testStartRef.current ? Math.max(1, Math.round((Date.now() - testStartRef.current) / 1000)) : 0
    const qs = [...quizQuestions]
    const ans = { ...answers }
    qs.forEach((q, i) => {
      if (ans[i] == null) ans[i] = 'skip'
      if (q.type === 'multi_choice' && Array.isArray(ans[i]) && ans[i].length === 0) ans[i] = 'skip'
    })
    const payload = { questions: qs, answers: ans, elapsedSec: elapsed }
    const n = qs.length
    let correct = 0
    let skip = 0
    qs.forEach((q, i) => {
      const a = ans[i]
      if (a === 'skip') skip += 1
      else if (isL3AnswerCorrect(q, a)) correct += 1
    })
    const accPct = n ? Math.round((correct / n) * 100) : 0
    appendAiTestRecord({
      testName: selectedTest?.name || '测评',
      testStage: '',
      testId: selectedTest?.id || null,
      n,
      correct,
      skip,
      accPct,
      elapsedSec: elapsed,
      snapshot: payload,
    })
    setReportSnapshot(payload)
    setPhase('report')
  }

  function openSavedRecord(row) {
    if (!row?.snapshot?.questions) return
    setRecordsModalOpen(false)
    const t = row.testId ? TEST_TYPES.find((x) => x.id === row.testId) : null
    setSelectedTest(t || null)
    setReportSnapshot(row.snapshot)
    setPhase('report')
  }

  function deleteSavedRecord(e, id) {
    e.stopPropagation()
    removeAiTestRecord(id)
    setTestRecords(getAiTestRecords())
  }

  function nextOrSubmit() {
    const len = quizQuestions.length
    if (len === 0) return
    if (currentQ < len - 1) setCurrentQ((q) => q + 1)
    else submitTest()
  }

  const qNow = quizQuestions[currentQ]
  const aNow = answers[currentQ]
  const canNext =
    aNow === 'skip' ||
    (aNow != null &&
      (qNow?.type === 'fill_blank'
        ? String(aNow).trim().length > 0
        : qNow?.type === 'short_answer'
          ? String(aNow).trim().length > 0
          : qNow?.type === 'multi_choice'
            ? Array.isArray(aNow) && aNow.length > 0
            : qNow?.type === 'judge'
              ? aNow === true || aNow === false
              : true))

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
          data: [{ value: values, name: '得分', areaStyle: { opacity: 0.22 }, lineStyle: { width: 2 } }],
        },
      ],
    }
  }, [dimStats])

  const reportStats = useMemo(() => {
    if (!reportSnapshot || !dimStats) return null
    const { questions, answers, elapsedSec } = reportSnapshot
    const n = questions.length
    let correct = 0
    let skip = 0
    questions.forEach((q, i) => {
      const a = answers[i]
      if (a === 'skip') skip += 1
      else if (isL3AnswerCorrect(q, a)) correct += 1
    })
    const accPct = n ? Math.round((correct / n) * 100) : 0
    const masteredTags = dimStats.filter((d) => d.pct >= 80)
    const weakTags = dimStats.filter((d) => d.pct < 80)
    const aiText = buildAiSummary(dimStats, selectedTest?.id === 'general')
    return { correct, skip, n, accPct, elapsedSec, masteredTags, weakTags, aiText }
  }, [reportSnapshot, dimStats, selectedTest])

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-2">
        <Link to="/events" className="text-sm text-slate-500 hover:text-primary">
          赛事中心
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-sm text-slate-700">测评中心</span>
      </div>

      {phase === 'entry' && (
        <>
          <div className="card p-8 bg-gradient-to-br from-bingo-dark to-cyan-900 text-white mb-8 rounded-2xl">
            <h1 className="text-2xl font-bold mb-2">测评中心</h1>
            <p className="text-slate-300 text-sm">选择下方测评类型，完成后可查看能力分析与课程推荐。</p>
          </div>

          <div className="mb-10">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <h2 className="section-title mb-0">选择测评类型</h2>
              <button
                type="button"
                onClick={() => setRecordsModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-cyan-700 hover:underline shrink-0"
              >
                <svg className="h-4 w-4 shrink-0 opacity-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                评测记录
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              {TEST_TYPES.map((t) => (
                <div key={t.id} className="card p-6 hover:shadow-md hover:border-primary/30 transition">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-bingo-dark leading-snug">{t.name}</h3>
                    </div>
                    <div className="flex flex-col items-end gap-0.5 shrink-0">
                      {t.originalPrice ? (
                        <span className="text-xs text-slate-400 line-through tabular-nums">{t.originalPrice}</span>
                      ) : null}
                      <span className={`font-bold text-sm tabular-nums ${isFreeTest(t) ? 'text-emerald-600' : 'text-primary'}`}>{t.currentPrice}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mb-4">{t.desc}</p>
                  <div className="flex gap-3 flex-wrap">
                    <button type="button" onClick={() => startAssessment(t)} className="btn-primary text-xs px-4 py-2">
                      开始测评
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6 bg-cyan-50 border-primary/20">
            <h3 className="font-semibold text-bingo-dark mb-3">测评报告可用于</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { icon: '🏆', title: '赛事初赛参考', desc: '测评成绩可按主办方设定权重纳入评审' },
                { icon: '📊', title: '个人成长档案', desc: '同步至个人中心，展示AI能力成长轨迹' },
                { icon: '🎓', title: '课程学习推荐', desc: '基于测评结果推荐3-5门匹配课程' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="font-medium text-sm text-bingo-dark">{item.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {phase === 'testing' && (
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-bingo-dark leading-snug">{selectedTest?.name || 'AI 测评'}</h1>
            <span className="text-sm text-slate-500 tabular-nums shrink-0">{quizQuestions.length ? `${currentQ + 1} / ${quizQuestions.length}` : '—'}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mb-6">
            <div className="bg-primary h-2 rounded-full transition-all" style={{ width: (quizQuestions.length ? ((currentQ + 1) / quizQuestions.length) * 100 : 0) + '%' }} />
          </div>

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
            <div className="flex-1 min-w-0 w-full">
              {quizQuestions[currentQ] && (
                <div className="card p-8">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h2 className="font-semibold text-bingo-dark text-base">{currentQ + 1}. {quizQuestions[currentQ].q}</h2>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  {quizQuestions[currentQ].type === 'fill_blank'
                    ? '填空题'
                    : quizQuestions[currentQ].type === 'short_answer'
                      ? '简答题'
                      : quizQuestions[currentQ].type === 'multi_choice'
                        ? '多选题'
                        : quizQuestions[currentQ].type === 'judge'
                          ? '判断题'
                          : '单选题'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mb-4">
                所属评价要点：{dimensionMeta(quizQuestions[currentQ].dim)?.name || '—'}
              </p>
              {quizQuestions[currentQ].type === 'fill_blank' ? (
                <input
                  type="text"
                  value={String(answers[currentQ] ?? '').replace(/^skip$/, '')}
                  onChange={(e) => setAnswers({ ...answers, [currentQ]: e.target.value })}
                  disabled={answers[currentQ] === 'skip'}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 disabled:bg-slate-50 disabled:text-slate-400"
                  placeholder="请输入答案"
                  autoComplete="off"
                />
              ) : quizQuestions[currentQ].type === 'short_answer' ? (
                <textarea
                  value={String(answers[currentQ] ?? '').replace(/^skip$/, '')}
                  onChange={(e) => setAnswers({ ...answers, [currentQ]: e.target.value })}
                  disabled={answers[currentQ] === 'skip'}
                  rows={5}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 disabled:bg-slate-50 disabled:text-slate-400 resize-y min-h-[120px]"
                  placeholder="请简要作答（系统将按要点关键词自动判分，演示用）"
                  autoComplete="off"
                />
              ) : quizQuestions[currentQ].type === 'multi_choice' ? (
                <div className="space-y-3">
                  <p className="text-[11px] text-slate-500 m-0">可选多项，须全部选对得分</p>
                  {(quizQuestions[currentQ].opts || []).map((opt, i) => {
                    const letter = String(opt).trim().charAt(0)
                    const sel = Array.isArray(answers[currentQ]) ? answers[currentQ] : []
                    const on = sel.includes(letter)
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          const cur = Array.isArray(answers[currentQ]) ? [...answers[currentQ]] : []
                          const idx = cur.indexOf(letter)
                          if (idx >= 0) cur.splice(idx, 1)
                          else cur.push(letter)
                          cur.sort()
                          setAnswers({ ...answers, [currentQ]: cur })
                        }}
                        disabled={answers[currentQ] === 'skip'}
                        className={
                          'w-full text-left px-5 py-3 rounded-xl border text-sm transition flex items-start gap-3 ' +
                          (on
                            ? 'border-primary bg-primary/5 text-primary font-medium'
                            : 'border-slate-200 hover:border-primary/30 hover:bg-slate-50') +
                          (answers[currentQ] === 'skip' ? ' opacity-50 pointer-events-none' : '')
                        }
                      >
                        <span
                          className={
                            'mt-0.5 shrink-0 w-5 h-5 rounded border flex items-center justify-center text-[10px] ' +
                            (on ? 'border-primary bg-primary text-white' : 'border-slate-300 bg-white')
                          }
                          aria-hidden
                        >
                          {on ? '✓' : ''}
                        </span>
                        <span>{opt}</span>
                      </button>
                    )
                  })}
                </div>
              ) : quizQuestions[currentQ].type === 'judge' ? (
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
                  {(quizQuestions[currentQ].opts || []).map((opt, i) => (
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
                不会
              </button>
              <div className="flex gap-3 mt-6">
                {currentQ > 0 && (
                  <button type="button" onClick={() => setCurrentQ((q) => q - 1)} className="rounded-lg border border-slate-200 text-slate-600 px-5 py-2.5 text-sm hover:bg-slate-50">
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
              )}
            </div>

            {quizQuestions.length > 0 && (
              <aside
                className="w-full lg:w-52 xl:w-56 shrink-0 rounded-xl border border-slate-200 bg-slate-50/90 px-3 py-3 shadow-sm lg:sticky lg:top-24 self-start"
                aria-label="题目进度"
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <p className="text-xs font-semibold text-bingo-dark">题目进度</p>
                  <p className="text-[11px] text-slate-500 tabular-nums">
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
                    <span className="w-2 h-2 rounded-sm bg-primary shrink-0 ring-2 ring-primary/30" />
                    当前
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-sm bg-emerald-500 shrink-0" />
                    已答
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-sm bg-amber-100 border border-amber-300 shrink-0" />
                    不会
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-sm border border-dashed border-slate-300 bg-white shrink-0" />
                    未答
                  </li>
                </ul>
              </aside>
            )}
          </div>
        </div>
      )}

      {phase === 'report' && reportSnapshot && reportStats && dimStats && radarOption && (
        <div className="max-w-lg mx-auto sm:max-w-xl md:max-w-2xl pb-12">
          <div ref={reportPdfRef}>
            {/* 顶栏：与站点主题一致（bingo-dark + cyan / primary） */}
            <div className="rounded-b-3xl bg-gradient-to-b from-bingo-dark via-cyan-900 to-primary text-white px-5 pt-8 pb-20 text-center shadow-lg">
            <ReportSummaryUserHeader />
            <p className="mt-3 text-2xl font-bold leading-snug text-white sm:text-3xl md:text-4xl">
              {selectedTest?.id === 'general' ? '普通综合测评' : selectedTest?.name || 'L3快速测评'}
            </p>
            <div className="mt-8 flex items-stretch justify-center gap-0 text-sm">
              {[
                { v: `${reportStats.accPct}分`, label: '得分（满分100）' },
                { v: `${reportStats.correct}/${reportStats.n}`, label: '正确题数' },
                { v: fmtMmSs(reportStats.elapsedSec), label: '用时' },
                { v: String(reportStats.skip), label: '不会' },
              ].map((cell, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-center px-1 border-l border-white/30 first:border-l-0 min-w-0">
                  <span className="text-xl sm:text-2xl font-bold tabular-nums leading-tight">{cell.v}</span>
                  <span className="text-[11px] text-white/85 mt-1">{cell.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="-mt-14 relative z-10 bg-white rounded-t-3xl shadow-xl border border-slate-100 px-4 sm:px-6 pt-6 pb-8">
            <h2 className="text-base font-bold text-bingo-dark mb-3">综合评价</h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-6">{reportStats.aiText}</p>

            <div className="mb-6">
              <p className="text-xs font-medium text-slate-700 flex items-center gap-1.5 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                已掌握
              </p>
              <div className="flex flex-wrap gap-2">
                {reportStats.masteredTags.length ? (
                  reportStats.masteredTags.map((d) => (
                    <span key={d.key} className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100">
                      {d.name} {d.pct}分
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
                      {d.name} {d.pct}分
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">当前无低于 80 分的薄弱维度</span>
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
                            {d.skip > 0 ? <span className="text-[11px] font-normal text-slate-400 ml-1">不会{d.skip}题</span> : null}
                          </p>
                          <span
                            className={
                              'inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full ' +
                              (d.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-50 text-red-600')
                            }
                          >
                            {d.passed ? '达标' : '未达标'}
                          </span>
                          <p className="text-[11px] text-slate-400 mt-0.5">得分 {d.pct}分（满分100）</p>
                        </div>
                      </div>
                      <div className="relative h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={'h-full rounded-full transition-all ' + barColor}
                          style={{ width: `${Math.min(100, barPct)}%` }}
                        />
                        <div
                          className="absolute top-0 bottom-0 w-px bg-slate-500/70 z-10"
                          style={{ left: `${PASS_PCT}%` }}
                          title={`${PASS_PCT}分 达标线`}
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
                        : q.type === 'short_answer'
                          ? String(a).trim() || '—'
                          : q.type === 'multi_choice'
                            ? formatMultiChoiceAnswerLine(q, a)
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
                      : q.type === 'short_answer'
                        ? shortAnswerRefLine(q)
                        : q.type === 'multi_choice'
                          ? formatMultiChoiceAnswerLine(q, q.ans)
                          : q.type === 'judge'
                            ? q.ans === true
                              ? '正确'
                              : '错误'
                            : q.opts?.find((o) => o[0] === q.ans)?.slice(2)?.trim() || q.ans
                  return (
                    <li key={q.id} className="py-3 text-sm">
                      <p className="font-medium text-bingo-dark">
                        {i + 1}. {q.q}
                        <span className="ml-2 text-[10px] font-normal text-slate-400">
                          {q.type === 'fill_blank'
                            ? '填空'
                            : q.type === 'short_answer'
                              ? '简答'
                              : q.type === 'multi_choice'
                                ? '多选'
                                : q.type === 'judge'
                                  ? '判断'
                                  : '单选'}
                        </span>
                      </p>
                      <p className="text-xs text-slate-500 mt-1">维度：{meta?.name || '—'}</p>
                      <p className="mt-1 text-slate-600">
                        你的作答：
                        <span className={ok ? 'text-emerald-600 font-medium' : a === 'skip' ? 'text-amber-600' : 'text-red-600'}>
                          {a === 'skip' ? '不会' : yourText}
                        </span>
                        {ok ? ' ✓' : a === 'skip' ? '' : ' ✗'}
                      </p>
                      {!ok && (
                        <p className="text-xs text-slate-500 mt-0.5">参考答案：{refText}</p>
                      )}
                    </li>
                  )
                })}
              </ul>
            </details>

            <div className="card p-6 mb-6 border border-slate-100 shadow-none">
              <h2 className="font-semibold text-bingo-dark mb-4">课程推荐</h2>
              {selectedTest?.id === 'general' ? (
                <p className="text-sm text-slate-600 mb-4 rounded-xl bg-primary/5 border border-primary/15 px-4 py-3 leading-relaxed">
                  根据你的作答情况，我们结合薄弱维度列出下列课程，帮助你从零散了解到系统学习；可优先从列表中的入门课开始，再按兴趣选择进阶方向。
                </p>
              ) : null}
              <div className="space-y-3">
                {REPORT_COURSES.map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 gap-2 flex-wrap">
                    <div className="min-w-0">
                      <span className="font-medium text-bingo-dark">{c.name}</span>
                      <span className="text-primary text-sm ml-2">{c.priceStr}</span>
                    </div>
                    <div className="shrink-0">
                      <Link to={c.to} state={{ fromTest: true }} className="btn-primary text-xs px-3 py-1.5 inline-flex">
                        查看详情
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3 px-4 sm:px-6">
            <button
              type="button"
              className="btn-primary text-sm px-5 py-2.5"
              onClick={async () => {
                try {
                  const stamp = new Date().toISOString().slice(0, 19).replace(/T/, '_').replace(/:/g, '-')
                  await saveReportAsPdf(reportPdfRef.current, `AI测评报告-${stamp}.pdf`)
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
            <Link to="/profile/test" className="rounded-lg border border-slate-200 text-slate-600 text-sm px-5 py-2.5 hover:bg-slate-50">
              查看历史报告
            </Link>
            <button
              type="button"
              onClick={() => {
                setPhase('entry')
                setReportSnapshot(null)
              }}
              className="rounded-lg border border-slate-200 text-slate-600 text-sm px-5 py-2.5 hover:bg-slate-50"
            >
              重新测评
            </button>
          </div>
          <ReportShareModal
            open={shareModalOpen}
            onClose={() => setShareModalOpen(false)}
            shareUrl={typeof window !== 'undefined' ? window.location.href : ''}
            title="分享测评报告"
          />
        </div>
      )}

      {recordsModalOpen ? (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="records-modal-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/45 backdrop-blur-[1px]"
            aria-label="关闭弹层"
            onClick={() => setRecordsModalOpen(false)}
          />
          <div className="relative z-10 flex max-h-[min(92vh,42rem)] w-full max-w-lg flex-col rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:max-h-[85vh] sm:rounded-2xl">
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
              <h3 id="records-modal-title" className="text-base font-semibold text-bingo-dark">
                评测记录
              </h3>
              <button
                type="button"
                onClick={() => setRecordsModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="关闭"
              >
                <span className="block text-xl leading-none">×</span>
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
              <p className="text-[11px] text-slate-500 mb-3">提交后自动保存在本机浏览器。</p>
              {testRecords.length === 0 ? (
                <p className="text-sm text-slate-500 py-10 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/80">
                  暂无记录，完成一次测评后将显示在这里。
                </p>
              ) : (
                <ul className="space-y-3 pb-2">
                  {testRecords.map((row) => (
                    <li key={row.id} className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-xs">
                      <p className="text-[10px] text-slate-500 tabular-nums">{fmtRecordTime(row.createdAt)}</p>
                      <p className="font-medium text-bingo-dark mt-1 leading-snug">{row.testName}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="text-base font-bold text-primary tabular-nums">{row.accPct}分</span>
                        <span className="text-[10px] text-slate-400 tabular-nums">
                          {row.correct}/{row.n}
                          {row.skip ? ` · 不会${row.skip}` : ''} · {fmtMmSs(row.elapsedSec || 0)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 mt-2 pt-2 border-t border-slate-200/80">
                        <button type="button" onClick={() => openSavedRecord(row)} className="text-[11px] text-primary font-medium hover:underline">
                          查看报告
                        </button>
                        <button type="button" onClick={(e) => deleteSavedRecord(e, row.id)} className="text-[11px] text-slate-400 hover:text-red-600">
                          删除
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
