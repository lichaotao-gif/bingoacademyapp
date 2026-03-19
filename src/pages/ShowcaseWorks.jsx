import { Link } from 'react-router-dom'

// 学员作品 - 缤纷成果分类独立页
export default function ShowcaseWorks() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/showcase" className="text-primary text-sm hover:underline">← 返回缤纷成果</Link>
      </div>
      <h1 className="text-2xl font-bold text-bingo-dark mb-2">学员作品</h1>
      <p className="text-slate-600 mb-8">学员AI作品与学习成果，图文/短视频展示，点赞/评论/分享，作品关联课程/工具购买</p>
      <div className="card p-6">
        <p className="text-slate-600">作品列表（示例），支持筛选、搜索，点击进入作品详情</p>
      </div>
    </div>
  )
}
