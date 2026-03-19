import { Link } from 'react-router-dom'

// AI工具库 - 每个工具都有独立详情/购买页
const tools = [
  { id: 'tool-1', title: '错题帮AI', desc: '智能错题本与个性化巩固', price: '¥9.9/月' },
  { id: 'tool-2', title: '作业批改助手', desc: '自动批改与点评建议', price: '¥19.9/月' },
  { id: 'tool-3', title: '梅林口语', desc: 'AI口语练习与测评', price: '¥29.9/月' },
  { id: 'tool-4', title: '学习报告生成器', desc: '学习数据可视化与报告', price: '¥0' },
]

export default function Tools() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-bingo-dark mb-2">AI工具库</h1>
      <p className="text-slate-600 mb-8">每个工具均支持独立介绍与购买，购买后会进入个人中心「我的订单」（后续接入订单系统）</p>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tools.map((item) => (
          <Link key={item.id} to={`/tools/detail/${item.id}`} className="card p-6 hover:shadow-md hover:border-primary/30 transition">
            <h3 className="font-semibold text-primary">{item.title}</h3>
            <p className="text-sm text-slate-600 mt-1">{item.desc}</p>
            <p className="text-xs text-slate-500 mt-2">价格：{item.price}</p>
            <span className="text-sm text-primary mt-3 inline-block">查看详情 →</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
