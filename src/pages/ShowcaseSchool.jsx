import { Link } from 'react-router-dom'

// 校企合作 - 缤纷成果分类独立页
export default function ShowcaseSchool() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/showcase" className="text-primary text-sm hover:underline">← 返回缤纷成果</Link>
      </div>
      <h1 className="text-2xl font-bold text-bingo-dark mb-2">校企合作</h1>
      <p className="text-slate-600 mb-8">学校与企业的合作成果展示，产教融合案例、合作项目成果</p>
      <div className="card p-6">
        <p className="text-slate-600">校企合作成果列表（示例），点击进入详情</p>
      </div>
    </div>
  )
}
