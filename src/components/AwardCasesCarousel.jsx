// Demo 数据结构与未来后台配置字段保持一致。
const AWARD_CASES = [
  { id: 'award-01', student: '马同学', competition: '2025世界机器人大赛', award: '一等奖', project: '创意开源人形机器人项目', image: '/events/award-cases/award-01.png', width: 278, height: 375, review: '机械结构与程序控制结合完整，作品目标清晰。' },
  { id: 'award-02', student: '旺同学', competition: '2025世界机器人大赛', award: '一等奖', project: '创意开源人形机器人项目', image: '/events/award-cases/award-02.png', width: 277, height: 378, review: '任务拆解能力突出，面对调试问题能持续改进。' },
  { id: 'award-04', student: '杨同学', competition: '成都市第38届青少年科技创新大赛', award: '一等奖', project: '基于 Java 的智能识别应用', image: '/events/award-cases/award-04.png', width: 293, height: 400, review: '选题贴近真实生活，从问题观察、资料查找，到方案设计、程序实现和现场答辩，都能主动推进并持续复盘，工程逻辑清晰。' },
  { id: 'award-05', student: '代同学', competition: '成都市第39届青少年科技创新大赛', award: '一等奖', project: '智能交互创意项目', image: '/events/award-cases/award-05.png', width: 228, height: 315, review: '善于观察问题并转化为创意方案，实践记录细致。' },
  { id: 'award-06', student: '熊同学', competition: '全国无线电运动竞赛', award: '获奖证书', project: '电路与创意设计项目', image: '/events/award-cases/award-06.png', width: 229, height: 304, review: '动手实践能力扎实，能够规范完成设计与测试。' },
  { id: 'award-07', student: '胡同学', competition: '第三十七届四川省青少年科技创新大赛', award: '二等奖', project: 'HTML 编程与智能交互项目', image: '/events/award-cases/award-07.png', width: 226, height: 324, review: '从需求分析到页面实现形成完整闭环，结构清晰。' },
  { id: 'award-08', student: '文同学', competition: '成都市第38届青少年科技创新大赛', award: '一等奖', project: '智能交互创新作品', image: '/events/award-cases/award-08.png', width: 235, height: 324, review: '主动查找资料并反复优化方案，能够把用户反馈转化为具体改进，作品兼顾创意、可用性与表达完整度，学习迁移能力突出。' },
  { id: 'award-09', student: '潘同学', competition: '成都市第38届青少年科技创新大赛', award: '一等奖', project: '智慧生活创新项目', image: '/events/award-cases/award-09.png', width: 235, height: 324, review: '项目思路新颖，能够用技术回应真实场景需求。' },
  { id: 'award-10', student: '张同学', competition: '成都市第38届青少年科技创新大赛', award: '一等奖', project: '资源智能识别系统', image: '/events/award-cases/award-10.png', width: 228, height: 315, review: '方案设计、程序实现和成果汇报表现均衡。' },
]

function AwardCard({ item }) {
  return (
    <article className="award-marquee-card" aria-label={`${item.student}${item.award}获奖案例`}>
      <div className="award-marquee-certificate">
        <img src={item.image} alt={`${item.student}${item.competition}${item.award}证书`} width={item.width} height={item.height} loading="lazy" />
      </div>
      <div className="award-marquee-copy">
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-black text-slate-900">{item.student}</h3>
        </div>
        <p className="mt-2 line-clamp-2 text-xs font-bold leading-5 text-[#087e72]">{item.competition}</p>
        <p className="award-marquee-review line-clamp-3 mt-2 text-xs leading-5 text-slate-600">{item.review}</p>
      </div>
    </article>
  )
}

export default function AwardCasesCarousel() {
  return (
    <section className="overflow-hidden rounded-[28px] border border-emerald-100 bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/80 shadow-[0_18px_48px_rgba(8,126,114,.10)]" aria-labelledby="award-cases-title">
      <div className="flex flex-col gap-3 border-b border-emerald-100/80 px-6 py-6 sm:flex-row sm:items-end sm:justify-between sm:px-9">
        <div>
          <p className="text-xs font-black tracking-[.16em] text-[#087e72]">AWARD STORIES</p>
          <h2 id="award-cases-title" className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">赛事荣誉，见证每一次成长</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">真实证书与学生成长评语，持续记录每一次实践成果。</p>
        </div>
      </div>

      <div className="award-marquee" role="region" aria-label="赛事获奖证书滚动展示" tabIndex="0">
        <div className="award-marquee-track">
          <div className="award-marquee-group">
            {AWARD_CASES.map(item => <AwardCard key={item.id} item={item} />)}
          </div>
          <div className="award-marquee-group" aria-hidden="true">
            {AWARD_CASES.map(item => <AwardCard key={`${item.id}-duplicate`} item={item} />)}
          </div>
        </div>
      </div>
    </section>
  )
}
