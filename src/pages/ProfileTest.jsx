import { Link } from 'react-router-dom'

const MOCK_REPORTS = [
  { id: 1, date: '2025-02-15', score: 82, level: 'AI进阶学员', type: 'AI基础认知测评' },
  { id: 2, date: '2025-02-01', score: 75, level: 'AI入门学员', type: 'AI基础认知测评' },
]

export default function ProfileTest() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/profile" className="text-slate-500 hover:text-primary text-sm">← 个人中心</Link>
        <span className="text-slate-300">/</span>
        <span className="text-bingo-dark font-medium">测评中心</span>
      </div>

      <div className="card p-6 bg-cyan-50 border-primary/20 mb-6">
        <h3 className="font-semibold text-bingo-dark mb-2">测评中心</h3>
        <p className="text-sm text-slate-600 mb-4">查看历史测评报告，系统会根据测评结果动态更新课程推荐</p>
        <Link to="/events/ai-test" className="btn-primary text-sm px-5 py-2">立即测评</Link>
      </div>

      <h3 className="font-semibold text-bingo-dark mb-4">历史测评报告</h3>
      <div className="space-y-4">
        {MOCK_REPORTS.map(r => (
          <div key={r.id} className="card p-5 flex items-center justify-between">
            <div>
              <p className="font-medium text-bingo-dark">{r.type}</p>
              <p className="text-sm text-slate-500 mt-1">{r.date} · {r.level}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-primary">{r.score}分</span>
              <Link to="/events/ai-test" state={{ viewReport: r.id }} className="text-sm text-primary hover:underline">查看详情</Link>
            </div>
          </div>
        ))}
        {MOCK_REPORTS.length === 0 && (
          <div className="card p-12 text-center text-slate-500">
            <p className="mb-4">暂无测评报告</p>
            <Link to="/events/ai-test" className="text-primary hover:underline">去测评</Link>
          </div>
        )}
      </div>
    </div>
  )
}
