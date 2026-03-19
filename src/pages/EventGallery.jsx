import { useState } from 'react'
import { Link } from 'react-router-dom'

const WORKS = [
  { id: 1, title: 'AI校园智能管理系统', author: '张小明', event: '全国青少年AI创新大赛', award: '一等奖', year: 2025, type: 'software', score: 94, ai: true },
  { id: 2, title: '基于机器学习的情绪识别画作', author: '李思涵', event: '缤果杯AI创意编程大赛', award: '金奖', year: 2025, type: 'art', score: 91, ai: true },
  { id: 3, title: 'AI辅助盲人导航机器人', author: '王梓轩', event: 'AI机器人国际挑战赛', award: '特等奖', year: 2024, type: 'robot', score: 97, ai: false },
  { id: 4, title: '智能农业灌溉数据预测模型', author: '陈雨桐', event: '粤港澳大湾区AI科创联赛', award: '二等奖', year: 2025, type: 'data', score: 88, ai: false },
  { id: 5, title: '缤果AI学习助手APP', author: '刘子墨', event: '全国青少年AI创新大赛', award: '二等奖', year: 2024, type: 'software', score: 86, ai: true },
  { id: 6, title: '传统非遗数字化保护方案', author: '赵一凡', event: '缤果杯AI创意编程大赛', award: '银奖', year: 2024, type: 'art', score: 85, ai: true },
]

const TYPE_LABELS = { software: '软件应用', art: 'AI艺术', robot: '机器人', data: '数据科学' }
const AWARD_COLORS = {
  '特等奖': 'bg-red-100 text-red-700',
  '一等奖': 'bg-amber-100 text-amber-700',
  '金奖': 'bg-amber-100 text-amber-700',
  '二等奖': 'bg-slate-100 text-slate-600',
  '银奖': 'bg-slate-100 text-slate-600',
}

export default function EventGallery() {
  const [filterType, setFilterType] = useState('all')
  const [filterYear, setFilterYear] = useState('all')
  const [selected, setSelected] = useState(null)

  const filtered = WORKS.filter(w =>
    (filterType === 'all' || w.type === filterType) &&
    (filterYear === 'all' || w.year === Number(filterYear))
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-2">
        <Link to="/events" className="text-sm text-slate-500 hover:text-primary">赛事中心</Link>
        <span className="text-slate-300">/</span>
        <span className="text-sm text-slate-700">赛事成果展厅</span>
      </div>
      <h1 className="text-2xl font-bold text-bingo-dark mb-2">赛事成果展厅</h1>
      <p className="text-slate-600 mb-8">历届获奖作品展示 · 人才库对接 · 成果分享传播</p>

      {/* 筛选栏 */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex gap-2 flex-wrap">
          <span className="text-xs text-slate-500 self-center">作品类型：</span>
          {[['all', '全部'], ['software', '软件应用'], ['art', 'AI艺术'], ['robot', '机器人'], ['data', '数据科学']].map(([k, l]) => (
            <button key={k} onClick={() => setFilterType(k)}
              className={'px-3 py-1 rounded-full text-xs transition ' + (filterType === k ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>
              {l}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          <span className="text-xs text-slate-500 self-center">年份：</span>
          {[['all', '全部'], ['2025', '2025'], ['2024', '2024']].map(([k, l]) => (
            <button key={k} onClick={() => setFilterYear(k)}
              className={'px-3 py-1 rounded-full text-xs transition ' + (filterYear === k ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* 作品网格 */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
        {filtered.map(w => (
          <div key={w.id} onClick={() => setSelected(w)}
            className="card p-6 cursor-pointer hover:shadow-md hover:border-primary/30 transition group">
            <div className="flex items-start justify-between gap-2 mb-3">
              <h3 className="font-semibold text-bingo-dark text-sm group-hover:text-primary transition line-clamp-2">{w.title}</h3>
              <span className={'shrink-0 text-xs px-2 py-0.5 rounded-full ' + (AWARD_COLORS[w.award] || 'bg-slate-100 text-slate-600')}>{w.award}</span>
            </div>
            <p className="text-xs text-slate-500 mb-1">作者：{w.author}</p>
            <p className="text-xs text-slate-500 mb-3">{w.event} · {w.year}</p>
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600">{TYPE_LABELS[w.type]}</span>
                {w.ai && <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">AI配套课</span>}
              </div>
              <span className="text-xs text-slate-400">综合评分 {w.score}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 人才库入口 */}
      <section className="mb-10 card p-8 bg-gradient-to-r from-cyan-50 to-sky-50 border-primary/20">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <h2 className="font-bold text-bingo-dark text-lg mb-2">AI人才库 · 对接优质学员</h2>
            <p className="text-slate-600 text-sm">汇聚历届获奖选手，企业/院校可通过人才库直接对接，学员可申请入驻展示个人AI能力档案</p>
          </div>
          <div className="flex gap-3">
            <button type="button" className="btn-primary text-sm px-5 py-2.5">申请入驻人才库</button>
            <button type="button" className="rounded-lg border border-primary text-primary text-sm px-5 py-2.5 hover:bg-primary/10 transition">企业/院校对接人才</button>
          </div>
        </div>
      </section>

      {/* 作品详情弹窗 */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) setSelected(null) }}>
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl">
            <div className="flex items-start justify-between gap-3 mb-4">
              <h2 className="font-bold text-bingo-dark text-lg">{selected.title}</h2>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600 text-xl shrink-0">×</button>
            </div>
            <div className="space-y-2 text-sm text-slate-600 mb-5">
              <p>作者：<span className="text-bingo-dark font-medium">{selected.author}</span></p>
              <p>赛事：{selected.event} · {selected.year}</p>
              <p>奖项：<span className={'px-2 py-0.5 rounded text-xs ' + (AWARD_COLORS[selected.award] || '')}>{selected.award}</span></p>
              <p>类型：{TYPE_LABELS[selected.type]}</p>
              <p>综合评分：<span className="text-primary font-semibold">{selected.score} 分</span></p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button type="button" className="btn-primary text-sm px-4 py-2">点赞</button>
              <button type="button" className="rounded-lg border border-primary text-primary text-sm px-4 py-2 hover:bg-primary/10 transition">分享作品</button>
              {selected.ai && (
                <Link to="/events/bingguo-ai" onClick={() => setSelected(null)}
                  className="rounded-lg border border-slate-200 text-slate-600 text-sm px-4 py-2 hover:bg-slate-50 transition">查看配套课程</Link>
              )}
              <button type="button" onClick={() => setSelected(null)} className="rounded-lg border border-slate-200 text-slate-500 text-sm px-4 py-2 hover:bg-slate-50 transition">查看AI测评报告</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
