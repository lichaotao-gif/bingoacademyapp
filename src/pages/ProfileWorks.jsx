import { Link } from 'react-router-dom'

// 个人作品 - 个人中心子页
export default function ProfileWorks() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/profile" className="text-primary text-sm hover:underline">← 个人中心</Link>
      </div>
      <h1 className="text-2xl font-bold text-bingo-dark mb-2">个人作品</h1>
      <p className="text-slate-600 mb-8">我的创作作品、学习成果与项目展示，可分享至缤纷成果</p>
      <div className="card p-6">
        <p className="text-slate-600">暂无作品，去 <Link to="/courses" className="text-primary hover:underline">AI精品课</Link> 学习并提交作品</p>
      </div>
    </div>
  )
}
