import { Link, useParams } from 'react-router-dom'

// 创业成果案例 / 获奖案例 详情页（同一设计）
// 路由：/showcase/venture/:id   /showcase/award/:id
const VENTURE_CASES = {
  1: { name: '张小明', title: 'AI智能学习助手创业项目', content: '本项目基于大模型与知识图谱，为中小学生提供个性化错题巩固与学习路径推荐。学员团队完成需求分析、数据标注、模型微调与简单前端搭建，在导师指导下完成从0到1的MVP落地。\n\n核心成果：完成本地化数据集构建、与校内知识点对齐的问答模块、简易学习报告看板。项目在校园科技节展示并获最佳创意奖。', images: ['https://placehold.co/800x450/0891b2/fff?text=项目展示图'], video: null, links: [{ label: '项目演示站', url: 'https://example.com/demo' }] },
  2: { name: '李思涵', title: '智能绘本生成小助手', content: '结合大模型与绘画工具，为低龄儿童生成个性化绘本内容与配图，支持家长与孩子共创故事。\n\n成果：完成故事生成与配图流程、在机构内试用于阅读课。', images: ['https://placehold.co/800x450/0891b2/fff?text=绘本项目'], video: null, links: [] },
  3: { name: '王梓轩', title: '校园AI问答机器人', content: '针对学校常见问题（作息、课程、活动）搭建问答机器人，接入校园公众号与班级群。\n\n成果：覆盖多所合作校，日均问答量约200次。', images: [], video: null, links: [] },
  4: { name: '陈雨桐', title: 'AI+环保数据小应用', content: '利用图像识别与数据分析完成校园垃圾分类与统计，支持班级评比与环保主题实践。', images: ['https://placehold.co/800x450/0891b2/fff?text=环保项目'], video: null, links: [] },
  5: { name: '刘子墨', title: '个性化学习报告生成器', content: '根据学习数据自动生成周报、月报与建议，供家长与教师参考。', images: [], video: null, links: [] },
}

const AWARD_CASES = {
  1: { name: '赵一凡', title: '全国青少年AI挑战赛 一等奖作品', content: '参赛作品围绕「AI+环保」主题，利用图像识别与数据分析完成校园垃圾分类与统计小应用。从选题、数据采集、模型训练到应用部署，完整走通AI项目流程。\n\n评委点评：问题定义清晰、方案可落地、展示完整。该作品同时用于综评材料与科技特长生申报。', images: ['https://placehold.co/800x450/0f172a/fff?text=一等奖作品'], video: null, links: [{ label: '赛事官网公示', url: 'https://example.com/award' }] },
  2: { name: '孙悦琪', title: '白名单赛事 二等奖案例', content: '基于自然语言处理的学科辅助答题与解析生成，有效支撑课后练习与复习。', images: [], video: null, links: [] },
  3: { name: '周俊熙', title: '省赛 一等奖案例', content: '多模态作品：结合语音、图像与文本的智能学习助手。', images: ['https://placehold.co/800x450/0f172a/fff?text=省赛作品'], video: null, links: [] },
  4: { name: '吴若溪', title: '缤果杯 特等奖案例', content: '创意与技术并重，完成从想法到可演示产品的全流程。', images: [], video: null, links: [] },
  5: { name: '郑浩然', title: '国际赛 获奖案例', content: '代表学校参与国际青少年AI项目展示，获得国际评委认可。', images: [], video: null, links: [] },
}

function CaseDetail({ type, id }) {
  const isVenture = type === 'venture'
  const casesMap = isVenture ? VENTURE_CASES : AWARD_CASES
  const caseData = casesMap[id] || (isVenture ? VENTURE_CASES[1] : AWARD_CASES[1])
  const caseTitle = caseData.title
  const caseSubtitle = isVenture ? `${caseData.name || ''} · 创业成果` : `获奖案例${caseData.name ? ` · ${caseData.name}` : ''}`
  const caseContent = caseData.content || ''
  const images = caseData.images || []
  const video = caseData.video
  const links = caseData.links || []

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/showcase" className="text-primary text-sm hover:underline">← 返回缤纷成果</Link>
      </div>

      <header className="mb-8">
        <p className="text-sm text-slate-500 mb-1">{caseSubtitle}</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-bingo-dark">{caseTitle}</h1>
      </header>

      {/* 案例具体内容 */}
      <section className="mb-8">
        <h2 className="section-title mb-3">案例介绍</h2>
        <div className="card p-6 prose prose-slate max-w-none">
          <div className="whitespace-pre-line text-slate-700 leading-relaxed">{caseContent}</div>
        </div>
      </section>

      {/* 图片 */}
      {images.length > 0 && (
        <section className="mb-8">
          <h2 className="section-title mb-3">图片展示</h2>
          <div className="space-y-4">
            {images.map((src, i) => (
              <div key={i} className="card overflow-hidden p-0">
                <img src={src} alt="" className="w-full h-auto object-contain bg-slate-100" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 视频 */}
      {video && (
        <section className="mb-8">
          <h2 className="section-title mb-3">视频</h2>
          <div className="card overflow-hidden p-0 aspect-video bg-slate-900">
            <video src={video} controls className="w-full h-full object-contain" />
          </div>
        </section>
      )}

      {/* 网站等链接 */}
      {links.length > 0 && (
        <section className="mb-8">
          <h2 className="section-title mb-3">相关链接</h2>
          <ul className="space-y-2">
            {links.map((item, i) => (
              <li key={i}>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {item.label} →
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="pt-6 border-t">
        <Link to="/showcase" className="btn-primary">返回缤纷成果</Link>
      </div>
    </div>
  )
}

export default function ShowcaseCasePage() {
  const { type, id } = useParams()
  return <CaseDetail type={type} id={id} />
}
