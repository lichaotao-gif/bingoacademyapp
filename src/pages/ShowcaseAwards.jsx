import { Link } from 'react-router-dom'

// 赛事获奖 - 缤纷成果分类独立页
export default function ShowcaseAwards() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/showcase" className="text-primary text-sm hover:underline">← 返回缤纷成果</Link>
      </div>
      <h1 className="text-2xl font-bold text-bingo-dark mb-2">赛事获奖</h1>
      <p className="text-slate-600 mb-8">赛事获奖案例、职业教育就业案例，图文/短视频展示，点赞/评论/分享</p>
      <div className="card p-6">
        <p className="text-slate-600">获奖作品列表（示例），支持按赛事/年份筛选，点击进入案例详情</p>
      </div>
    </div>
  )
}
