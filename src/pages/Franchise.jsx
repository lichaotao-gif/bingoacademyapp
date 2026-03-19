import { useState } from 'react'
import { Link } from 'react-router-dom'

const B_SOLUTIONS = [
  { icon: '🏫', title: '线下机构课程合作', desc: '授牌+课程+师训+运营，一站式赋能', tag: '机构合作' },
  { icon: '🤝', title: '线下加盟商', desc: '品牌授权+全体系支持，共创AI教育', tag: '品牌加盟' },
  { icon: '⚙️', title: 'OEM定制合作', desc: '课程/教具/工具定制+品牌联名+技术输出', tag: '定制服务' },
]

const FREE_RESOURCES_B = [
  { title: '《教培机构AI教育转型全攻略》', tag: '资料包', icon: '📙' },
  { title: '《AI课程机构运营实操手册》', tag: '资料包', icon: '📒' },
  { title: '免费公开课·合作政策+盈利模式解析', tag: '直播预约', icon: '🎥' },
]

const MARKETING_ACTIVITIES = [
  { title: '新合作机构免加盟费', desc: '送师训名额+课程体系，限时政策', icon: '🎁', color: 'border-sky-200/60 bg-sky-50/50' },
  { title: 'OEM定制专属优惠', desc: '满5万送技术输出免费维护1年', icon: '⚙️', color: 'border-violet-200/60 bg-violet-50/50' },
  { title: 'AI教育转型峰会', desc: '免费报名，限500人，点击预约', icon: '🎤', color: 'border-emerald-200/60 bg-emerald-50/50' },
]

const B_SERVICES = [
  { icon: '🎯', title: '产教融合服务', sub: '岗位实训+就业对接+校企合作', color: 'bg-sky-50 border-sky-200/60' },
  { icon: '🏫', title: '机构赋能服务', sub: '师训体系+运营支持+品牌授牌', color: 'bg-emerald-50 border-emerald-200/60' },
  { icon: '⚙️', title: '定制化服务', sub: '课程/教具/工具定制+品牌联名', color: 'bg-violet-50 border-violet-200/60' },
]

const HONOR_ITEMS = [
  { icon: '🥇', title: '品牌荣誉', desc: 'AI教育行业奖项+专利+资质认证，多项国家级资质', color: 'bg-amber-50 border-amber-200/40' },
  { icon: '📈', title: '合作机构成果', desc: '合作机构营收平均提升60%，加盟商100+，机构授牌500+', color: 'bg-sky-50 border-sky-200/40' },
  { icon: '📣', title: '行业影响力', desc: '公益报道+媒体采访+行业峰会，传递品牌公信力', color: 'bg-emerald-50 border-emerald-200/40' },
]

export default function Franchise() {
  const [leadModal, setLeadModal] = useState(null)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/" className="text-primary text-sm hover:underline">← 返回首页</Link>
      </div>

      {/* Hero */}
      <div className="card p-8 bg-gradient-to-r from-slate-800 to-sky-900 text-white border-sky-700/30 mb-10 rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div>
            <span className="text-[11px] bg-sky-400/20 text-sky-300 px-2 py-0.5 rounded-full font-medium">B端 · 机构 / 加盟商</span>
            <h1 className="text-2xl sm:text-3xl font-bold mt-3 mb-2">加盟合作</h1>
            <p className="text-slate-300 text-sm leading-relaxed mb-3">教培机构缺AI课程、师资、赛事资源？<br />缤果AI学院全链条产教融合合作体系，品牌+课程+师资+赛事<strong className="text-white">一站式赋能</strong></p>
            <p className="text-xs text-sky-300 font-medium">全国合作机构500+ · 加盟商100+ · 合作机构营收平均提升60%</p>
          </div>
          <div className="flex flex-col gap-3 shrink-0">
            <button
              onClick={() => setLeadModal('免费获取机构合作方案')}
              className="bg-sky-500 hover:bg-sky-400 text-white px-8 py-3 rounded-xl text-sm font-bold transition"
            >
              免费获取合作方案
            </button>
            <a href="tel:400-xxx-xxxx" className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl text-sm font-medium transition text-center">
              📞 400-xxx-xxxx
            </a>
          </div>
        </div>
      </div>

      {/* 合作模式 */}
      <section className="mb-10">
        <h2 className="section-title mb-4">合作模式</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {B_SOLUTIONS.map((b, i) => (
            <div key={i} className="card p-6 hover:shadow-md hover:border-primary/30 transition">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{b.icon}</span>
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{b.tag}</span>
              </div>
              <h3 className="font-bold text-bingo-dark mb-1">{b.title}</h3>
              <p className="text-sm text-slate-600">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 机构/加盟商服务中心 */}
      <section className="mb-10">
        <h2 className="section-title mb-4">机构 / 加盟商服务中心</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {B_SERVICES.map((s, i) => (
            <div key={i} className={`card p-5 border flex items-center gap-4 ${s.color}`}>
              <span className="text-3xl shrink-0">{s.icon}</span>
              <div>
                <p className="font-semibold text-bingo-dark">{s.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 加盟优势 */}
      <section className="mb-10">
        <h2 className="section-title mb-4">加盟优势</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: '🏷️', title: '品牌背书', desc: '依托缤果AI学院成熟品牌与AI+竞赛+全链条教育生态，快速建立本地影响力' },
            { icon: '📚', title: '课程体系', desc: '标准化课程产品，从素养启蒙到竞赛培优、升学赋能，分层覆盖全学段需求' },
            { icon: '🏆', title: '赛事资源', desc: '白名单赛事授权、集训营支持，为学员提供权威实战舞台与成果展示机会' },
            { icon: '👩‍🏫', title: '师训支持', desc: '总部师资培训、教学督导、教研支持，保障教学质量与落地效果' },
            { icon: '📣', title: '运营赋能', desc: '招生方案、活动策划、物料支持，助力校区快速启动与持续增长' },
            { icon: '📦', title: '供应链支持', desc: '教材教具、AI工具产品直供，品质保障、利润空间清晰' },
          ].map((item, i) => (
            <div key={i} className="card p-6">
              <div className="text-2xl mb-2">{item.icon}</div>
              <h3 className="font-semibold text-primary mb-2">{item.title}</h3>
              <p className="text-sm text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 品牌荣誉与合作机构成果 */}
      <section className="mb-10">
        <h2 className="section-title mb-4">品牌荣誉 · 合作机构成果</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {HONOR_ITEMS.map((item, i) => (
            <div key={i} className={`card p-6 border ${item.color}`}>
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="font-semibold text-bingo-dark mb-1">{item.title}</h3>
              <p className="text-sm text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 限时营销活动 */}
      <section className="mb-10">
        <h2 className="section-title mb-4">🔥 限时营销活动</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {MARKETING_ACTIVITIES.map((item, i) => (
            <div key={i} className={`card p-5 border ${item.color}`}>
              <div className="text-2xl mb-2">{item.icon}</div>
              <p className="font-semibold text-sm text-bingo-dark">{item.title}</p>
              <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
              <button
                onClick={() => setLeadModal(item.title + ' - 咨询')}
                className="mt-3 text-xs text-sky-600 hover:underline font-medium"
              >
                了解详情 →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 加盟条件 */}
      <section className="mb-10">
        <h2 className="section-title mb-4">加盟条件</h2>
        <ul className="card p-6 space-y-3 text-slate-600">
          <li className="flex items-start gap-2"><span className="text-primary mt-0.5">✓</span>认同缤果AI学院品牌理念与教育价值观</li>
          <li className="flex items-start gap-2"><span className="text-primary mt-0.5">✓</span>具备合法办学资质或教育相关经营主体</li>
          <li className="flex items-start gap-2"><span className="text-primary mt-0.5">✓</span>拥有适宜的教学场地与基础运营条件</li>
          <li className="flex items-start gap-2"><span className="text-primary mt-0.5">✓</span>具备一定的教育行业经验与本地资源优势</li>
          <li className="flex items-start gap-2"><span className="text-primary mt-0.5">✓</span>愿意投入师资培训与课程落地</li>
        </ul>
      </section>

      {/* 加盟流程 */}
      <section className="mb-10">
        <h2 className="section-title mb-4">加盟流程</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { step: '1', title: '咨询洽谈', desc: '提交意向，总部专人对接' },
            { step: '2', title: '实地考察', desc: '总部考察或线上评估' },
            { step: '3', title: '签约授牌', desc: '签订合作协议，授予品牌授权' },
            { step: '4', title: '启动运营', desc: '师训、开业支持、持续督导' },
          ].map((s, i) => (
            <div key={i} className="card p-5 text-center border-primary/20">
              <span className="inline-flex w-10 h-10 rounded-full bg-primary/20 text-primary font-bold items-center justify-center mb-3">{s.step}</span>
              <h3 className="font-semibold text-bingo-dark">{s.title}</h3>
              <p className="text-sm text-slate-600 mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 机构/加盟商专属资源 + 咨询 */}
      <section className="mb-10">
        <div className="grid md:grid-cols-2 gap-6">
          {/* 专属资源 */}
          <div className="card p-6 bg-gradient-to-br from-sky-50 to-indigo-50 border-sky-200/60">
            <p className="text-xs font-bold text-sky-600 mb-4 tracking-wider">机构/加盟商专属资源</p>
            <ul className="space-y-3 mb-5">
              {FREE_RESOURCES_B.map((r, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 p-3 bg-white rounded-xl border border-sky-100 hover:border-sky-300 transition cursor-pointer"
                  onClick={() => setLeadModal('免费领取：' + r.title)}
                >
                  <span className="text-xl shrink-0">{r.icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-bingo-dark">{r.title}</p>
                    <span className="text-[10px] bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded">{r.tag}</span>
                  </div>
                  <span className="text-sky-600 text-xs shrink-0">领取 →</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setLeadModal('免费获取机构AI教育转型资料包')}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white py-3 rounded-xl font-bold text-sm transition"
            >
              免费获取机构转型资料包
            </button>
          </div>

          {/* B端咨询 */}
          <div className="card p-6 bg-gradient-to-r from-sky-50 to-indigo-50 border-sky-200/60">
            <p className="text-xs font-bold text-sky-600 mb-3 tracking-wider">机构/加盟商咨询</p>
            <h3 className="font-bold text-bingo-dark mb-4">联系商务团队，获取专属合作方案</h3>
            <div className="space-y-3 mb-4">
              {[
                { icon: '📞', label: '机构合作热线', value: '400-xxx-xxxx', href: 'tel:400-xxx-xxxx' },
                { icon: '💬', label: 'B端商务微信', value: 'bingoacademy-b', href: 'javascript:void(0)' },
                { icon: '✉️', label: '机构合作邮箱', value: 'contact@bingoacademy.cn', href: 'mailto:contact@bingoacademy.cn' },
              ].map((c, i) => (
                <a
                  key={i}
                  href={c.href}
                  className="flex items-center gap-3 hover:bg-sky-100/60 rounded-xl p-2 transition group"
                >
                  <span className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center text-lg shrink-0">{c.icon}</span>
                  <div>
                    <p className="text-xs text-slate-500">{c.label}</p>
                    <p className="font-semibold text-sm text-sky-600">{c.value}</p>
                  </div>
                </a>
              ))}
            </div>
            <button
              onClick={() => setLeadModal('免费获取机构合作方案')}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white py-2.5 rounded-xl text-sm font-bold transition"
            >
              免费获取合作方案
            </button>
          </div>
        </div>
      </section>

      {/* 留资弹窗 */}
      {leadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setLeadModal(null)}>
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-bingo-dark text-lg mb-1">{leadModal}</h3>
            <p className="text-slate-500 text-sm mb-5">请留下您的联系方式，商务顾问将在24小时内与您联系</p>
            <input type="text" placeholder="您的姓名" className="w-full border rounded-xl px-4 py-2.5 text-sm mb-3 outline-none focus:border-sky-400" />
            <input type="tel" placeholder="手机号码" className="w-full border rounded-xl px-4 py-2.5 text-sm mb-3 outline-none focus:border-sky-400" />
            <input type="text" placeholder="机构名称（选填）" className="w-full border rounded-xl px-4 py-2.5 text-sm mb-4 outline-none focus:border-sky-400" />
            <button
              onClick={() => setLeadModal(null)}
              className="w-full bg-sky-600 hover:bg-sky-700 text-white py-3 rounded-xl font-bold text-sm transition"
            >
              立即提交
            </button>
            <button onClick={() => setLeadModal(null)} className="mt-3 w-full text-slate-400 text-sm hover:text-slate-600">取消</button>
          </div>
        </div>
      )}
    </div>
  )
}
