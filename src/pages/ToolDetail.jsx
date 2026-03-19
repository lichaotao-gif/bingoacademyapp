import { Link, useParams } from 'react-router-dom'

const TOOLS = {
  'tool-1': {
    title: '错题帮AI',
    desc: '智能错题本与个性化巩固：自动归类错题、生成同类练习与讲解。',
    price: '¥9.9/月',
    poster: 'https://placehold.co/1200x600/0891b2/ffffff?text=%E9%94%99%E9%A2%98%E5%B8%AEAI',
  },
  'tool-2': {
    title: '作业批改助手',
    desc: '支持作业批改、点评建议与薄弱点定位，提升教学效率。',
    price: '¥19.9/月',
    poster: 'https://placehold.co/1200x600/0f172a/ffffff?text=%E4%BD%9C%E4%B8%9A%E6%89%B9%E6%94%B9%E5%8A%A9%E6%89%8B',
  },
  'tool-3': {
    title: '梅林口语',
    desc: 'AI口语练习与测评：跟读评分、对话练习与报告。',
    price: '¥29.9/月',
    poster: 'https://placehold.co/1200x600/155e75/ffffff?text=%E6%A2%85%E6%9E%97%E5%8F%A3%E8%AF%AD',
  },
  'tool-4': {
    title: '学习报告生成器',
    desc: '学习数据可视化与报告生成，支持家长/教师查看学习进度。',
    price: '¥0',
    poster: 'https://placehold.co/1200x600/0e7490/ffffff?text=%E5%AD%A6%E4%B9%A0%E6%8A%A5%E5%91%8A%E7%94%9F%E6%88%90%E5%99%A8',
  },
}

export default function ToolDetail() {
  const { id } = useParams()
  const tool = TOOLS[id] || TOOLS['tool-1']

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/tools" className="text-primary text-sm hover:underline">← 返回 AI工具库</Link>
      </div>

      <div className="card overflow-hidden p-0 mb-6">
        <div className="aspect-[16/9] bg-slate-100">
          <img src={tool.poster} alt={tool.title} className="w-full h-full object-cover" />
        </div>
        <div className="p-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-bingo-dark">{tool.title}</h1>
          <p className="text-slate-600 mt-2">{tool.desc}</p>
          <p className="text-primary font-semibold mt-3">价格：{tool.price}</p>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="section-title mb-4">购买与订单</h2>
        <div className="card p-6">
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-primary text-sm px-4 py-2">立即购买</button>
            <button type="button" className="rounded-lg border border-slate-300 text-slate-700 px-4 py-2 text-sm hover:bg-slate-50">加入我的订单</button>
            <Link to="/profile#orders" className="rounded-lg border border-slate-300 text-slate-700 px-4 py-2 text-sm hover:bg-slate-50">查看我的订单</Link>
          </div>
          <p className="text-xs text-slate-500 mt-3">说明：此处为前端占位，后续接入下单/支付后，会在个人中心「我的订单」展示。</p>
        </div>
      </section>
    </div>
  )
}

