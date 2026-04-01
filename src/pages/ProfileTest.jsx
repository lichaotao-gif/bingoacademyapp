import { Link } from 'react-router-dom'
import { getAiTestRecords } from '../utils/aiTestRecordsStorage'

function fmtRecordTime(iso) {
  try {
    return new Date(iso).toLocaleString('zh-CN', {
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

export default function ProfileTest() {
  const reports = getAiTestRecords()

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/profile" className="text-slate-500 hover:text-primary text-sm">← 个人中心</Link>
        <span className="text-slate-300">/</span>
        <span className="text-bingo-dark font-medium">测评中心</span>
      </div>

      <div className="card p-6 bg-cyan-50 border-primary/20 mb-6">
        <h3 className="font-semibold text-bingo-dark mb-2">测评中心</h3>
        <p className="text-sm text-slate-600 mb-4">
          历史报告与「赛事测评中心」评测记录互通（保存在本机浏览器）。完整报告请在测评页查看。
        </p>
        <Link to="/events/ai-test" className="btn-primary text-sm px-5 py-2">前往测评中心</Link>
      </div>

      <h3 className="font-semibold text-bingo-dark mb-4">历史测评报告</h3>
      <div className="space-y-4">
        {reports.map((r) => (
          <div key={r.id} className="card p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
              <p className="font-medium text-bingo-dark">{r.testName}</p>
              <p className="text-sm text-slate-500 mt-1">{fmtRecordTime(r.createdAt)}</p>
              <p className="text-xs text-slate-400 mt-1 tabular-nums">
                得分 {r.accPct} 分 / 满分100（{r.correct}/{r.n}
                {r.skip ? `，跳过 ${r.skip} 题` : ''}）
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-2xl font-bold text-primary tabular-nums">{r.accPct}分</span>
              <Link to={`/events/ai-test?record=${encodeURIComponent(r.id)}`} className="text-sm text-primary hover:underline whitespace-nowrap">
                查看详情
              </Link>
            </div>
          </div>
        ))}
        {reports.length === 0 && (
          <div className="card p-12 text-center text-slate-500">
            <p className="mb-4">暂无测评报告</p>
            <Link to="/events/ai-test" className="text-primary hover:underline">去测评</Link>
          </div>
        )}
      </div>
    </div>
  )
}
