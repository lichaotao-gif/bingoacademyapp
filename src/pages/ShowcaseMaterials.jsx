import { Link } from 'react-router-dom'

// 教材教具 - 缤纷成果分类独立页
export default function ShowcaseMaterials() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/showcase" className="text-primary text-sm hover:underline">← 返回缤纷成果</Link>
      </div>
      <h1 className="text-2xl font-bold text-bingo-dark mb-2">教材教具</h1>
      <p className="text-slate-600 mb-8">教具实操成果、教材学习落地案例，图文/短视频展示</p>
      <div className="card p-6">
        <p className="text-slate-600">教材教具成果列表（示例），点击进入详情，可关联商城购买</p>
      </div>
    </div>
  )
}
