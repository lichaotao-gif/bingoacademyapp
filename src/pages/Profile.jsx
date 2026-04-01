import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getSessionUser, sessionUserDisplayAvatarUrl } from '../utils/sessionUser'

// ─── 会员体系数据 ─────────────────────────────────────────
const MEMBER_LEVELS = [
  { key: 'free', name: '普通会员', color: 'text-slate-600', bg: 'bg-slate-100', badge: '免费', price: null },
  { key: 'month', name: '月度会员', color: 'text-sky-600', bg: 'bg-sky-100', badge: '月费', price: 39, origPrice: 49, autoPrice: 35 },
  { key: 'quarter', name: '季度会员', color: 'text-violet-600', bg: 'bg-violet-100', badge: '季费', price: 99, origPrice: 129, autoPrice: 84 },
  { key: 'year', name: '年度会员', color: 'text-amber-600', bg: 'bg-amber-100', badge: '年费', price: 299, origPrice: 399, autoPrice: 239, recommended: true },
]

const MEMBER_PERKS = [
  { label: 'AI素养课折扣', values: ['无', '9折', '85折', '7折'] },
  { label: '竞赛培优课权限', values: ['免费课', '部分解锁', '大部分解锁', '全部解锁✓'] },
  { label: '白名单赛事服务', values: ['仅报名', '报名+基础指导', '报名+集训资料', '报名+集训+导师1v1'] },
  { label: '科技特长生规划', values: ['无', '基础资料', '专属规划表', '1v1规划指导'] },
  { label: '教具商城折扣', values: ['无', '95折', '9折', '8折+包邮'] },
  { label: '推广赚钱激励', values: ['基础佣金', '佣金+5%', '佣金+10%', '佣金+20%'] },
  { label: '公益积分加速', values: ['1倍', '1.2倍', '1.5倍', '2倍'] },
  { label: '会员专属测评', values: ['无', '1次/月', '1次/季', '不限次'] },
  { label: '专属客服', values: ['无', '在线客服', '在线客服', '专属1v1客服'] },
]

// ─── 分享弹窗组件 ────────────────────────────────────────
function ShareModal({ title, subtitle, onClose }) {
  const [step, setStep] = useState('options')
  const CHANNELS = [
    { key: 'showcase', icon: '🏆', label: '缤纷成果', desc: '发布到官方成果板块' },
    { key: 'wechat', icon: '💬', label: '微信好友', desc: '生成图片/链接分享' },
    { key: 'moments', icon: '🌐', label: '朋友圈', desc: '生成朋友圈专属图片' },
    { key: 'image', icon: '🖼️', label: '生成图片', desc: '保存高清无水印图' },
    { key: 'link', icon: '🔗', label: '生成链接', desc: '复制专属短链接' },
  ]
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
        {step === 'options' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-bingo-dark">{title}</h3>
                {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
              </div>
              <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl ml-3">✕</button>
            </div>
            <div className="grid grid-cols-5 gap-3 mb-4">
              {CHANNELS.map(c => (
                <button key={c.key} onClick={() => setStep(c.key)}
                  className="flex flex-col items-center gap-1 group">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-xl group-hover:bg-primary/10 group-hover:scale-105 transition">{c.icon}</div>
                  <span className="text-[10px] text-slate-600 text-center leading-tight">{c.label}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 text-center">月度及以上会员分享可获额外佣金加成</p>
          </>
        )}
        {(step === 'image' || step === 'wechat' || step === 'moments') && (
          <div className="text-center py-4">
            <div className="w-40 h-40 mx-auto rounded-2xl bg-gradient-to-br from-primary/10 to-cyan-100 flex flex-col items-center justify-center mb-4 border-2 border-dashed border-primary/30">
              <span className="text-3xl mb-2">🖼️</span>
              <p className="text-xs text-slate-500">分享图片预览</p>
              <p className="text-[10px] text-primary mt-1">缤果AI学院品牌标识已添加</p>
            </div>
            <div className="flex gap-2 justify-center flex-wrap">
              <button className="btn-primary text-xs px-4 py-2">保存图片</button>
              <button className="border border-slate-200 rounded-lg text-xs px-4 py-2 text-slate-600" onClick={() => setStep('options')}>返回</button>
            </div>
          </div>
        )}
        {step === 'link' && (
          <div className="py-2">
            <h3 className="font-bold text-bingo-dark mb-3">生成专属链接</h3>
            <div className="bg-slate-50 rounded-xl p-3 mb-3">
              <p className="font-mono text-xs text-slate-700 break-all">https://bingoacademy.cn/s/XXXXX</p>
            </div>
            <div className="flex gap-2 mb-3 flex-wrap">
              {['7天有效', '30天有效', '永久有效'].map(t => (
                <button key={t} className="text-xs px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-primary hover:text-white transition">{t}</button>
              ))}
            </div>
            <div className="flex gap-2">
              <button className="btn-primary text-xs px-4 py-2 flex-1">一键复制</button>
              <button className="border border-slate-200 rounded-lg text-xs px-3 py-2 text-slate-600" onClick={() => setStep('options')}>返回</button>
            </div>
          </div>
        )}
        {step === 'showcase' && (
          <div className="text-center py-4">
            <div className="text-4xl mb-3">🏆</div>
            <h3 className="font-bold text-bingo-dark mb-1">发布到缤纷成果</h3>
            <p className="text-xs text-slate-500 mb-4">内容将在缤纷成果板块展示，年度会员可优先展示</p>
            <div className="flex gap-2 justify-center">
              <button className="btn-primary text-xs px-5 py-2">确认发布</button>
              <button className="border border-slate-200 rounded-lg text-xs px-4 py-2 text-slate-600" onClick={() => setStep('options')}>返回</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── 缤果学分银行 ─────────────────────────────────────────
function ScoreBank() {
  const [checkedIn, setCheckedIn] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <section id="score-bank" className="mb-10">
      <h2 className="section-title mb-1">缤果学分银行</h2>
      <p className="text-slate-600 text-sm mb-4">打卡签到 · 学习任务 · 积分兑换 · 成长资产</p>

      <div className="card p-6 bg-gradient-to-r from-primary/90 to-cyan-600 text-white mb-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-white/80 text-sm">我的缤果学分</p>
            <p className="text-4xl font-bold mt-1">1,280</p>
            <p className="text-white/70 text-xs mt-1">学分等级：学分达人 ⭐⭐⭐</p>
          </div>
          <div className="text-right">
            <p className="text-white/80 text-sm">连续打卡</p>
            <p className="text-2xl font-bold">7 天</p>
            <p className="text-white/70 text-xs mt-1">明日继续可得翻倍学分</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-5">
          <button onClick={() => setCheckedIn(true)} disabled={checkedIn}
            className={'px-5 py-2 rounded-lg text-sm font-medium transition ' + (checkedIn ? 'bg-white/20 text-white/60 cursor-default' : 'bg-white text-primary hover:bg-white/90')}>
            {checkedIn ? '今日已打卡 ✓' : '立即打卡 +10分'}
          </button>
          <button onClick={() => setActiveTab('exchange')} className="px-5 py-2 rounded-lg text-sm font-medium bg-white/20 text-white hover:bg-white/30 transition">学分兑换</button>
          <button onClick={() => setActiveTab('detail')} className="px-5 py-2 rounded-lg text-sm font-medium bg-white/20 text-white hover:bg-white/30 transition">学分明细</button>
        </div>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {[['overview', '积分中心'], ['checkin', '打卡中心'], ['detail', '学分明细'], ['exchange', '积分兑换'], ['rank', '排行榜']].map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={'px-4 py-1.5 rounded-full text-xs font-medium transition ' + (activeTab === key ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { label: '今日可获学分', value: '+30', note: '课程学习·打卡' },
            { label: '本月累计', value: '420', note: '连续打卡翻倍中' },
            { label: '累计兑换', value: '500', note: '已兑换课程券2张' },
          ].map((s, i) => (
            <div key={i} className="card p-5">
              <p className="text-xs text-slate-500">{s.label}</p>
              <p className="text-2xl font-bold text-primary mt-1">{s.value}</p>
              <p className="text-xs text-slate-400 mt-1">{s.note}</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'checkin' && (
        <div className="space-y-4">
          <div className="card p-6">
            <h3 className="font-semibold text-bingo-dark mb-3">每日签到打卡</h3>
            <div className="flex gap-2 flex-wrap mb-4">
              {['一', '二', '三', '四', '五', '六', '七'].map((d, i) => (
                <div key={i} className={'w-10 h-10 rounded-full flex items-center justify-center text-xs font-medium ' + (i < 7 ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400')}>{d}</div>
              ))}
            </div>
            <p className="text-sm text-slate-600">连续签到7天：基础 +10分/天，连续7天额外 +30分</p>
          </div>
          <div className="card p-6">
            <h3 className="font-semibold text-bingo-dark mb-3">学习任务打卡</h3>
            <ul className="space-y-3">
              {[
                { task: '完成课程章节学习', score: '+15分', done: true },
                { task: '提交社群作业', score: '+10分', done: false },
                { task: '完成赛事备赛练习', score: '+20分', done: false },
              ].map((t, i) => (
                <li key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                  <span className={'text-sm ' + (t.done ? 'line-through text-slate-400' : 'text-slate-700')}>{t.task}</span>
                  <span className={'text-xs font-medium px-2 py-1 rounded-full ' + (t.done ? 'bg-slate-200 text-slate-400' : 'bg-primary/10 text-primary')}>{t.done ? '已完成' : t.score}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'detail' && (
        <div className="card overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex gap-2 text-xs text-slate-500">
            <span>全部</span><span>·</span><span>打卡获取</span><span>·</span><span>学习获取</span><span>·</span><span>兑换消耗</span>
          </div>
          <ul className="divide-y divide-slate-100">
            {[
              { type: '打卡', desc: '每日签到打卡 第7天翻倍', score: '+20', date: '今日' },
              { type: '学习', desc: 'AI启蒙通识课 第3章 完课', score: '+15', date: '今日' },
              { type: '兑换', desc: '兑换课程优惠券×1（-100元）', score: '-100', date: '3天前' },
              { type: '学习', desc: '完成免费测评', score: '+30', date: '5天前' },
            ].map((r, i) => (
              <li key={i} className="px-4 py-3 flex items-center justify-between">
                <div>
                  <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary mr-2">{r.type}</span>
                  <span className="text-sm text-slate-700">{r.desc}</span>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <span className={'font-semibold text-sm ' + (r.score.startsWith('-') ? 'text-rose-500' : 'text-emerald-600')}>{r.score}</span>
                  <p className="text-xs text-slate-400">{r.date}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === 'exchange' && (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">当前学分：<span className="text-primary font-bold">1,280分</span> · 100分 = 10元抵扣</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: '课程优惠券 ¥50', cost: '500学分', type: '纯学分兑换', tag: '热门' },
              { name: '赛事报名折扣 9折', cost: '300学分', type: '纯学分兑换', tag: '' },
              { name: 'AI启蒙课免费试听', cost: '200学分', type: '纯学分兑换', tag: '新品' },
              { name: '研学体验优惠券', cost: '800学分', type: '纯学分兑换', tag: '' },
              { name: 'AI教具体验装', cost: '1000学分+¥99', type: '学分+现金', tag: '' },
              { name: '认证服务费5折', cost: '1000学分', type: '纯学分兑换', tag: '限量' },
            ].map((item, i) => (
              <div key={i} className="card p-5 hover:shadow-md hover:border-primary/30 transition">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-bingo-dark text-sm">{item.name}</h3>
                  {item.tag && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 shrink-0">{item.tag}</span>}
                </div>
                <p className="text-xs text-slate-500 mt-1">{item.type}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-primary font-bold text-sm">{item.cost}</span>
                  <button type="button" className="text-xs px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-cyan-600">立即兑换</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'rank' && (
        <div className="card overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
            <p className="font-semibold text-bingo-dark">本月学分排行榜</p>
            <p className="text-xs text-slate-500 mt-1">月度「学分之星」可获免费赛事报名资格或研学优惠券</p>
          </div>
          <ul className="divide-y divide-slate-100">
            {[
              { rank: 1, name: '李同学', score: 2860, badge: '🥇' },
              { rank: 2, name: '王同学', score: 2410, badge: '🥈' },
              { rank: 3, name: '张同学', score: 2050, badge: '🥉' },
              { rank: 4, name: '陈同学', score: 1740, badge: '' },
              { rank: 5, name: '赵同学', score: 1520, badge: '' },
            ].map((r, i) => (
              <li key={i} className="px-4 py-3 flex items-center gap-3">
                <span className="w-6 text-center text-sm font-bold text-slate-500">{r.badge || r.rank}</span>
                <span className="flex-1 text-sm text-slate-700">{r.name}</span>
                <span className="font-bold text-primary text-sm">{r.score.toLocaleString()} 分</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 card p-5 border-primary/20 bg-slate-50">
        <h3 className="font-semibold text-bingo-dark mb-2">B端 · 机构学分管理</h3>
        <p className="text-sm text-slate-600 mb-3">加盟/合作机构可自定义旗下学员学分任务与兑换权益，赋能机构学员激励与留存</p>
        <div className="flex gap-3">
          <Link to="/franchise" className="btn-primary text-sm px-4 py-2">机构学分后台</Link>
          <button type="button" className="rounded-lg border border-primary text-primary px-4 py-2 text-sm">学分规则说明</button>
        </div>
      </div>
    </section>
  )
}

// ─── 会员中心（二级页） ───────────────────────────────────
function MemberCenter({ onBack }) {
  const [tab, setTab] = useState('overview')
  const [selectedLevel, setSelectedLevel] = useState('year')
  const [autoRenew, setAutoRenew] = useState(true)
  const [orderSubmitted, setOrderSubmitted] = useState(false)
  const [autoConfirm, setAutoConfirm] = useState(null)

  const currentLevel = MEMBER_LEVELS.find(l => l.key === selectedLevel)

  return (
    <div>
      <div className="flex items-center gap-2 mb-6 text-sm flex-wrap">
        <button onClick={onBack} className="text-slate-500 hover:text-primary transition">← 个人中心</button>
        <span className="text-slate-300">/</span>
        <span className="text-bingo-dark font-semibold">会员中心</span>
      </div>

      {/* 会员状态区 */}
      <div className="card p-6 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 text-white mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-medium">年度会员</span>
              <span className="text-xs text-white/80">剩余 320 天</span>
            </div>
            <p className="text-white/80 text-sm mt-1">自动续费已开启 · 下次扣款 2026-01-20 · ¥239</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-bold">¥239/年</p>
            <p className="text-white/70 text-xs">自动续费专属价</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-4">
          <button onClick={() => setTab('renew')} className="bg-white text-amber-600 px-5 py-2 rounded-xl text-sm font-bold hover:bg-white/90 transition">立即续费</button>
          <button onClick={() => setTab('perks')} className="bg-white/20 text-white px-5 py-2 rounded-xl text-sm hover:bg-white/30 transition">查看我的权益</button>
          <button onClick={() => setTab('auto')} className="bg-white/20 text-white px-5 py-2 rounded-xl text-sm hover:bg-white/30 transition">管理自动续费</button>
        </div>
      </div>

      {/* Tab 导航 */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[['overview', '等级权益对比'], ['open', '开通会员'], ['renew', '续费升级'], ['auto', '自动续费管理'], ['perks', '权益领取'], ['records', '会员记录']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={'px-4 py-1.5 rounded-full text-xs font-medium transition ' + (tab === k ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>{l}</button>
        ))}
      </div>

      {/* 等级权益对比 */}
      {tab === 'overview' && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[640px]">
            <thead>
              <tr>
                <th className="text-left py-3 px-4 text-slate-600 font-medium bg-slate-50 w-36">权益项目</th>
                {MEMBER_LEVELS.map(l => (
                  <th key={l.key} className={'py-3 px-4 text-center ' + (l.recommended ? 'bg-amber-50' : 'bg-slate-50')}>
                    <span className={'inline-block text-xs font-bold px-2 py-0.5 rounded-full mb-1 ' + l.bg + ' ' + l.color}>{l.name}</span>
                    {l.price ? (
                      <p className="text-xs text-slate-500">¥{l.price}/期</p>
                    ) : (
                      <p className="text-xs text-slate-400">免费</p>
                    )}
                    {l.recommended && <p className="text-[10px] text-amber-600 font-bold">🔥 推荐</p>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MEMBER_PERKS.map((perk, pi) => (
                <tr key={pi} className="border-t border-slate-100 hover:bg-slate-50/50">
                  <td className="py-3 px-4 text-slate-600 text-xs">{perk.label}</td>
                  {perk.values.map((v, vi) => (
                    <td key={vi} className={'py-3 px-4 text-center text-xs ' + (vi === 3 ? 'font-semibold text-amber-600' : 'text-slate-600') + (vi === 3 ? ' bg-amber-50/50' : '')}>
                      {v === '无' ? <span className="text-slate-300">—</span> : v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex justify-center">
            <button onClick={() => setTab('open')} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition">立即开通年度会员 · 最划算 →</button>
          </div>
        </div>
      )}

      {/* 开通会员 */}
      {tab === 'open' && (
        <div>
          {orderSubmitted ? (
            <div className="card p-10 text-center">
              <div className="text-5xl mb-3">🎉</div>
              <h3 className="font-bold text-bingo-dark text-xl mb-2">会员开通成功！</h3>
              <p className="text-slate-500 text-sm mb-5">年度会员权益已激活，有效期至 2026-01-20</p>
              <button onClick={() => { setOrderSubmitted(false); setTab('perks') }} className="btn-primary px-8 py-2.5">领取专属权益 →</button>
            </div>
          ) : (
            <div className="space-y-5">
              <h3 className="font-semibold text-bingo-dark">选择会员等级</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                {MEMBER_LEVELS.filter(l => l.key !== 'free').map(l => (
                  <div key={l.key} onClick={() => setSelectedLevel(l.key)}
                    className={'card p-5 cursor-pointer transition ' + (selectedLevel === l.key ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/30') + (l.recommended ? ' bg-amber-50/50' : '')}>
                    {l.recommended && <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-bold mb-2 inline-block">推荐</span>}
                    <p className={'font-bold text-sm mb-1 ' + l.color}>{l.name}</p>
                    <p className="text-2xl font-bold text-bingo-dark">¥{l.price}<span className="text-sm font-normal text-slate-400">/期</span></p>
                    <p className="text-xs text-slate-400 line-through">原价 ¥{l.origPrice}</p>
                    <p className="text-xs text-emerald-600 mt-1 font-medium">自动续费 ¥{l.autoPrice}（更优惠）</p>
                  </div>
                ))}
              </div>

              <div className="card p-5">
                <h3 className="font-semibold text-bingo-dark mb-3">购买方式</h3>
                <div className="flex gap-3 flex-wrap mb-4">
                  <button onClick={() => setAutoRenew(false)}
                    className={'px-4 py-2 rounded-xl text-sm border transition ' + (!autoRenew ? 'border-primary bg-primary/5 text-primary font-medium' : 'border-slate-200 text-slate-600 hover:border-primary/50')}>
                    普通购买 ¥{currentLevel?.price}
                  </button>
                  <button onClick={() => setAutoRenew(true)}
                    className={'px-4 py-2 rounded-xl text-sm border transition ' + (autoRenew ? 'border-primary bg-primary/5 text-primary font-medium' : 'border-slate-200 text-slate-600 hover:border-primary/50')}>
                    🔄 自动续费 ¥{currentLevel?.autoPrice} <span className="text-xs text-emerald-600 ml-1">更优惠</span>
                  </button>
                </div>
                {autoRenew && <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2 mb-4">开通自动续费后，到期前3天将短信提醒，自动扣款续费，可随时取消</p>}
                <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-200/60 mb-4">
                  <div>
                    <p className="font-semibold text-bingo-dark">{currentLevel?.name} · {autoRenew ? '自动续费' : '普通购买'}</p>
                    <p className="text-xs text-slate-500 mt-0.5">有效期 {selectedLevel === 'year' ? '365天' : selectedLevel === 'quarter' ? '90天' : '30天'}</p>
                  </div>
                  <p className="text-2xl font-bold text-amber-600">¥{autoRenew ? currentLevel?.autoPrice : currentLevel?.price}</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setOrderSubmitted(true)} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition flex-1">确认开通 · 立即支付</button>
                  <button type="button" className="border border-slate-200 rounded-xl text-sm px-5 py-3 text-slate-600 hover:bg-slate-50">3人拼团更优惠</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 续费升级 */}
      {tab === 'renew' && (
        <div className="space-y-4">
          <div className="card p-6 bg-amber-50 border-amber-200/60">
            <h3 className="font-semibold text-bingo-dark mb-1">当前：年度会员 · 剩余 320 天</h3>
            <p className="text-sm text-slate-600 mb-4">选择续费方式，自动续费用户享专属优惠</p>
            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              <div className="bg-white rounded-xl p-4 border border-amber-200 cursor-pointer hover:border-amber-400 transition">
                <p className="font-semibold text-sm text-bingo-dark">同等级续费（年度）</p>
                <p className="text-xl font-bold text-amber-600 mt-1">¥239 <span className="text-xs font-normal text-slate-400 line-through">¥299</span></p>
                <p className="text-xs text-emerald-600 mt-1">自动续费优惠 · 另享7天顺延</p>
              </div>
            </div>
            <button type="button" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition">立即续费</button>
          </div>
        </div>
      )}

      {/* 自动续费管理 */}
      {tab === 'auto' && (
        <div className="space-y-5">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-bingo-dark">自动续费状态</h3>
                <p className="text-sm text-slate-500 mt-0.5">当前：年度会员自动续费 · 每年 ¥239</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={'text-xs font-medium ' + (autoRenew ? 'text-emerald-600' : 'text-slate-400')}>{autoRenew ? '已开启' : '已关闭'}</span>
                <button onClick={() => setAutoConfirm(autoRenew ? 'close' : 'open')}
                  className={'w-12 h-6 rounded-full transition relative ' + (autoRenew ? 'bg-primary' : 'bg-slate-300')}>
                  <span className={'absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ' + (autoRenew ? 'left-6' : 'left-0.5')} />
                </button>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              {[
                ['下次扣款时间', '2026-01-20'],
                ['扣款金额', '¥239（自动续费专属价）'],
                ['扣款方式', '微信支付 · 尾号 8888'],
                ['提醒方式', '扣款前3天短信+消息通知'],
              ].map(([l, v]) => (
                <div key={l} className="flex items-center justify-between py-2 border-b border-slate-50">
                  <span className="text-slate-500">{l}</span>
                  <span className="text-bingo-dark font-medium">{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-6">
            <h3 className="font-semibold text-bingo-dark mb-3">自动续费记录</h3>
            <ul className="divide-y divide-slate-100">
              {[
                { date: '2025-01-20', level: '年度会员', amount: '¥239', status: '扣款成功' },
                { date: '2024-01-20', level: '年度会员', amount: '¥239', status: '扣款成功' },
              ].map((r, i) => (
                <li key={i} className="py-3 flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-bingo-dark">{r.level}</p>
                    <p className="text-xs text-slate-400">{r.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-amber-600">{r.amount}</p>
                    <span className="text-xs text-emerald-600">{r.status}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {autoConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                <h3 className="font-bold text-bingo-dark text-lg mb-2">{autoConfirm === 'close' ? '关闭自动续费' : '开启自动续费'}</h3>
                <p className="text-slate-500 text-sm mb-5">
                  {autoConfirm === 'close'
                    ? '关闭后，到期后将不再自动扣款续费，当前会员有效期不受影响。关闭后将失去自动续费专属价。'
                    : '开启后，到期前3天将自动扣款续费，享受专属优惠价，可随时关闭。'}
                </p>
                <div className="flex gap-3">
                  <button onClick={() => { setAutoRenew(autoConfirm !== 'close'); setAutoConfirm(null) }}
                    className={'flex-1 py-2.5 rounded-xl text-sm font-medium ' + (autoConfirm === 'close' ? 'bg-rose-500 text-white' : 'bg-primary text-white')}>
                    确认{autoConfirm === 'close' ? '关闭' : '开启'}
                  </button>
                  <button onClick={() => setAutoConfirm(null)} className="flex-1 border border-slate-200 rounded-xl py-2.5 text-sm text-slate-600">取消</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 权益领取 */}
      {tab === 'perks' && (
        <div className="space-y-4">
          <h3 className="font-semibold text-bingo-dark">年度会员专属福利</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: '🎓', title: 'AI精品课 7折优惠券', desc: '可叠加使用，每月1张', status: '可领取', color: 'bg-violet-100 text-violet-700' },
              { icon: '🏆', title: '赛事集训免费资料包', desc: '白名单赛事专项备考资料', status: '已领取', color: 'bg-slate-100 text-slate-500' },
              { icon: '📋', title: '科技特长生1v1规划', desc: '专属升学顾问一对一指导', status: '可领取', color: 'bg-sky-100 text-sky-700' },
              { icon: '🛍️', title: '教具商城8折券+包邮', desc: '教具购买优惠，本月有效', status: '可领取', color: 'bg-amber-100 text-amber-700' },
              { icon: '📊', title: 'AI能力不限次测评', desc: '专属测评入口，随时测评', status: '使用中', color: 'bg-emerald-100 text-emerald-700' },
              { icon: '👑', title: '专属1v1客服', desc: '工作日9-21点在线响应', status: '使用中', color: 'bg-rose-100 text-rose-700' },
            ].map((p, i) => (
              <div key={i} className="card p-5 flex gap-4 items-start">
                <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-xl shrink-0">{p.icon}</div>
                <div className="flex-1">
                  <p className="font-semibold text-bingo-dark text-sm">{p.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{p.desc}</p>
                </div>
                <button type="button"
                  className={'text-xs px-3 py-1.5 rounded-lg font-medium shrink-0 ' + (p.status === '可领取' ? 'bg-primary text-white' : p.color)}>
                  {p.status}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 会员记录 */}
      {tab === 'records' && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {['全部记录', '开通记录', '续费记录', '权益领取', '自动续费'].map(t => (
              <button key={t} className="px-3 py-1.5 text-xs rounded-full bg-slate-100 text-slate-600 hover:bg-primary hover:text-white transition">{t}</button>
            ))}
          </div>
          <div className="card overflow-hidden">
            <ul className="divide-y divide-slate-100">
              {[
                { type: '自动续费', content: '年度会员自动续费成功', amount: '-¥239', date: '2025-01-20 08:00', color: 'text-amber-600' },
                { type: '权益领取', content: '领取：AI精品课7折券 ×1', amount: '', date: '2025-01-20 08:05', color: 'text-violet-600' },
                { type: '开通', content: '首次开通年度会员', amount: '-¥299', date: '2024-01-20 14:30', color: 'text-sky-600' },
              ].map((r, i) => (
                <li key={i} className="px-4 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={'text-[10px] px-2 py-0.5 rounded-full font-medium ' + r.color + ' bg-slate-100'}>{r.type}</span>
                    <div>
                      <p className="text-sm text-slate-700">{r.content}</p>
                      <p className="text-xs text-slate-400">{r.date}</p>
                    </div>
                  </div>
                  <span className="font-bold text-sm text-amber-600 shrink-0 ml-3">{r.amount}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex gap-3">
            <button type="button" className="text-sm border border-slate-200 rounded-lg px-5 py-2 text-slate-600 hover:bg-slate-50">导出Excel</button>
            <button type="button" className="text-sm border border-slate-200 rounded-lg px-5 py-2 text-slate-600 hover:bg-slate-50">导出PDF</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── 推广赚钱（原推广中心，更名保留全部内容） ──────────────
function PromoCenter({ onBack }) {
  const [activeTab, setActiveTab] = useState('home')
  const [withdrawing, setWithdrawing] = useState(false)

  const TABS = [
    ['home', '推广首页'],
    ['orders', '推广明细'],
    ['wallet', '佣金结算'],
    ['team', '团队推广'],
    ['rules', '规则说明'],
  ]

  return (
    <div>
      <div className="flex items-center gap-2 mb-6 text-sm flex-wrap">
        <button onClick={onBack} className="text-slate-500 hover:text-primary transition">← 个人中心</button>
        <span className="text-slate-300">/</span>
        <span className="text-bingo-dark font-semibold">推广赚钱</span>
      </div>

      <div className="card p-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white mb-5">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-white/80 text-sm">可提现佣金</p>
            <p className="text-4xl font-bold mt-1">¥86.50</p>
            <p className="text-white/70 text-xs mt-1">待结算 ¥23.00 · 已累计 ¥1,240.00</p>
          </div>
          <div className="text-right">
            <p className="text-white/80 text-sm">本月推广订单</p>
            <p className="text-2xl font-bold">12 单</p>
            <p className="text-white/70 text-xs mt-1">转化率 8.3%</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => setActiveTab('wallet')} className="px-5 py-2 rounded-lg text-sm font-medium bg-white text-amber-600 hover:bg-white/90 transition">立即提现</button>
          <button onClick={() => setActiveTab('orders')} className="px-5 py-2 rounded-lg text-sm font-medium bg-white/20 text-white hover:bg-white/30 transition">推广明细</button>
          <button type="button" className="px-5 py-2 rounded-lg text-sm font-medium bg-white/20 text-white hover:bg-white/30 transition">生成海报/链接</button>
        </div>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={'px-4 py-1.5 rounded-full text-xs font-medium transition ' + (activeTab === key ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'home' && (
        <div className="space-y-5">
          <div className="card p-6 border-primary/20 bg-gradient-to-br from-cyan-50 to-sky-50">
            <h3 className="font-semibold text-bingo-dark mb-4">我的专属推广码</h3>
            <div className="flex flex-wrap gap-6 items-center">
              <div className="w-28 h-28 rounded-2xl bg-white border-2 border-primary/20 flex items-center justify-center text-slate-300 text-xs">推广二维码</div>
              <div className="flex-1 space-y-2">
                <p className="text-sm text-slate-600">专属推广链接：<span className="font-mono text-xs bg-white px-2 py-1 rounded border border-slate-200">https://bingoacademy.cn/i/USERID</span></p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <button type="button" className="btn-primary text-xs px-4 py-2">保存推广海报</button>
                  <button type="button" className="rounded-lg border border-primary text-primary text-xs px-4 py-2 hover:bg-primary/10">复制推广链接</button>
                  <button type="button" className="rounded-lg border border-slate-200 text-slate-600 text-xs px-4 py-2 hover:bg-slate-50">分享给微信好友</button>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-semibold text-bingo-dark mb-4">🔥 高佣金推荐榜</h3>
            <div className="space-y-3">
              {[
                { name: 'AI通识科学营（暑期班）', type: '精品研学', rate: '12%', tag: '热销' },
                { name: '缤果AI赋能课（企业版）', type: '机构课程', rate: '15%', tag: '高佣' },
                { name: '青少年AI创新挑战赛 · 报名套餐', type: '赛事', rate: '8%', tag: '' },
                { name: '学习工具月卡 · 商城', type: '商城商品', rate: '10%', tag: '新品' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-primary/5 transition">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">{i + 1}</span>
                    <div>
                      <p className="text-sm font-medium text-bingo-dark">{item.name}</p>
                      <p className="text-xs text-slate-400">{item.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {item.tag && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">{item.tag}</span>}
                    <span className="text-sm font-bold text-amber-600">佣金 {item.rate}</span>
                    <button type="button" className="text-xs px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-cyan-600">一键分享</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-r from-rose-50 to-pink-50 border-rose-200/60">
            <h3 className="font-semibold text-bingo-dark mb-3">🎁 推广活动专场</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { title: '暑期佣金翻倍', desc: '7月1日-8月31日，精品营课佣金 ×2', badge: '进行中' },
                { title: '邀新有礼', desc: '每邀请1位新用户注册，额外奖励 +¥5', badge: '长期' },
                { title: '团购裂变奖励', desc: '3人成团推广，额外奖励 +¥20', badge: '进行中' },
                { title: '老带新双向奖励', desc: '被推广人首单完成，双方各得 +100学分', badge: '长期' },
              ].map((act, i) => (
                <div key={i} className="bg-white rounded-xl p-4 border border-rose-100">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-sm text-bingo-dark">{act.title}</p>
                    <span className={'text-[10px] px-2 py-0.5 rounded-full ' + (act.badge === '进行中' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500')}>{act.badge}</span>
                  </div>
                  <p className="text-xs text-slate-500">{act.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200/50">
            <h3 className="font-semibold text-bingo-dark mb-2">老带新 · 邀请有礼</h3>
            <p className="text-sm text-slate-600 mb-4">邀请新用户注册，双方均可获得专属福利；推荐好友报名课程/赛事，可额外获得佣金奖励；机构推荐新机构合作享返佣</p>
            <div className="flex gap-3 flex-wrap">
              <button type="button" className="btn-primary text-sm px-4 py-2">生成邀请海报</button>
              <button type="button" className="rounded-lg border border-amber-400 text-amber-700 px-4 py-2 text-sm hover:bg-amber-50">复制邀请链接</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {['全部', '待结算', '已结算', '失效'].map(s => (
              <button key={s} className="px-3 py-1.5 rounded-full text-xs bg-slate-100 text-slate-600 hover:bg-primary hover:text-white transition">{s}</button>
            ))}
          </div>
          <div className="card overflow-hidden">
            <div className="grid grid-cols-6 px-4 py-3 bg-slate-50 border-b border-slate-100 text-xs text-slate-500 font-medium">
              <span className="col-span-2">推广商品</span><span>推广时间</span><span>订单金额</span><span>佣金</span><span>状态</span>
            </div>
            <ul className="divide-y divide-slate-100">
              {[
                { name: 'AI通识科学营·暑期班', date: '今日 14:23', amount: '¥1,280', commission: '¥153.60', status: '待结算', statusColor: 'text-amber-600' },
                { name: '学习工具月卡', date: '昨日 09:11', amount: '¥198', commission: '¥19.80', status: '已结算', statusColor: 'text-emerald-600' },
                { name: '赛事报名套餐', date: '3天前', amount: '¥380', commission: '¥30.40', status: '已结算', statusColor: 'text-emerald-600' },
                { name: '机器人实训营', date: '7天前', amount: '¥2,580', commission: '¥0.00', status: '失效(退款)', statusColor: 'text-slate-400 line-through' },
              ].map((r, i) => (
                <li key={i} className="grid grid-cols-6 px-4 py-3 text-sm items-center">
                  <span className="col-span-2 text-slate-700 font-medium truncate pr-2">{r.name}</span>
                  <span className="text-slate-500 text-xs">{r.date}</span>
                  <span className="text-slate-700">{r.amount}</span>
                  <span className="font-bold text-primary">{r.commission}</span>
                  <span className={'text-xs font-medium ' + r.statusColor}>{r.status}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'wallet' && (
        <div className="space-y-5">
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: '可提现余额', value: '¥86.50', color: 'text-amber-600' },
              { label: '待结算佣金', value: '¥23.00', color: 'text-slate-500' },
              { label: '已累计结算', value: '¥1,240.00', color: 'text-emerald-600' },
            ].map((s, i) => (
              <div key={i} className="card p-5 text-center">
                <p className="text-xs text-slate-500">{s.label}</p>
                <p className={'text-2xl font-bold mt-1 ' + s.color}>{s.value}</p>
              </div>
            ))}
          </div>
          <div className="card p-6">
            <h3 className="font-semibold text-bingo-dark mb-4">申请提现</h3>
            {withdrawing ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-2">✅</div>
                <p className="font-semibold text-bingo-dark mb-1">提现申请已提交</p>
                <p className="text-sm text-slate-500">预计 T+1 个工作日到账微信零钱</p>
                <button onClick={() => setWithdrawing(false)} className="btn-primary text-sm px-6 py-2 mt-4">完成</button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-200/60">
                  <div>
                    <p className="text-sm font-medium text-bingo-dark">可提现余额</p>
                    <p className="text-2xl font-bold text-amber-600 mt-0.5">¥86.50</p>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <p>到账方式：微信零钱</p><p>最低提现：¥10</p><p>T+1 到账，无手续费</p>
                  </div>
                </div>
                <button onClick={() => setWithdrawing(true)} className="btn-primary w-full py-3 text-sm">申请提现 ¥86.50</button>
              </div>
            )}
          </div>
          <div className="card p-6">
            <h3 className="font-semibold text-bingo-dark mb-3">提现记录</h3>
            <ul className="divide-y divide-slate-100">
              {[
                { amount: '¥120.00', time: '2025-06-20 10:30', arrive: '2025-06-21', status: '已到账' },
                { amount: '¥56.80', time: '2025-05-15 14:20', arrive: '2025-05-16', status: '已到账' },
              ].map((r, i) => (
                <li key={i} className="py-3 flex items-center justify-between text-sm">
                  <div>
                    <p className="font-semibold text-bingo-dark">{r.amount}</p>
                    <p className="text-xs text-slate-400">{r.time} · 到账 {r.arrive}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">{r.status}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'team' && (
        <div className="space-y-5">
          <div className="card p-6 bg-amber-50 border-amber-200/60">
            <h3 className="font-semibold text-bingo-dark mb-1">团队推广</h3>
            <p className="text-sm text-slate-600 mb-4">仅教师/机构角色可使用。邀请团队成员加入，团队成员每产生一笔佣金，团队长可额外分成</p>
            <div className="flex flex-wrap gap-3">
              <button type="button" className="btn-primary text-sm px-4 py-2">邀请团队成员</button>
              <button type="button" className="rounded-lg border border-primary text-primary text-sm px-4 py-2 hover:bg-primary/10">团队专属推广素材</button>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[{ label: '团队成员数', value: '8 人' }, { label: '团队总收益', value: '¥3,280' }, { label: '本月新增成员', value: '2 人' }].map((s, i) => (
              <div key={i} className="card p-5 text-center">
                <p className="text-xs text-slate-500">{s.label}</p>
                <p className="text-2xl font-bold text-primary mt-1">{s.value}</p>
              </div>
            ))}
          </div>
          <div className="card overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 font-semibold text-sm text-bingo-dark">团队成员列表</div>
            <ul className="divide-y divide-slate-100">
              {[
                { name: '王老师', joined: '2025-03-10', orders: 12, commission: '¥860' },
                { name: '李老师', joined: '2025-04-02', orders: 8, commission: '¥520' },
                { name: '张老师', joined: '2025-05-15', orders: 3, commission: '¥180' },
              ].map((m, i) => (
                <li key={i} className="px-4 py-3 flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium text-bingo-dark">{m.name}</p>
                    <p className="text-xs text-slate-400">加入 {m.joined}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{m.commission}</p>
                    <p className="text-xs text-slate-400">{m.orders} 单</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {activeTab === 'rules' && (
        <div className="space-y-4">
          <div className="card p-6 bg-slate-50">
            <h3 className="font-semibold text-bingo-dark mb-4">核心推广规则</h3>
            <dl className="grid gap-3 text-sm">
              {[
                { t: '推广关系有效期', d: '被推广人点击/扫码后 30 天内完成的订单均计入该推广人；30 天内不被其他推广人覆盖（首次绑定优先）' },
                { t: '佣金计算', d: '订单实付金额 × 对应佣金比例（不含运费/优惠券抵扣），保留 2 位小数' },
                { t: '结算周期', d: '订单确认完成后 7 天（虚拟商品为购买完成，实物为确认收货）自动转为可提现' },
                { t: '退款处理', d: '订单退款/取消后，对应佣金从待结算中扣除；已结算的从后续可提现余额抵扣' },
                { t: '提现规则', d: '最低 ¥10，仅支持微信零钱，T+1 到账，无手续费' },
                { t: '佣金比例', d: '学生/家长：平台基础比例；教师/机构：基础比例 +5%～10% 加成；企业角色无推广权限' },
                { t: '会员专属加成', d: '月度+5% / 季度+10% / 年度+20%，叠加角色加成，最高可达30%+' },
              ].map((item, i) => (
                <div key={i} className="border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                  <dt className="font-medium text-slate-800 mb-0.5">{item.t}</dt>
                  <dd className="text-slate-600">{item.d}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="card p-6 overflow-x-auto">
            <h3 className="font-semibold text-bingo-dark mb-4">角色与推广权益对照</h3>
            <table className="w-full text-sm border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-3 font-semibold text-slate-800">角色</th>
                  <th className="text-left py-2 px-3 font-semibold text-slate-800">专属权益</th>
                  <th className="text-left py-2 px-3 font-semibold text-slate-800">佣金加成</th>
                  <th className="text-left py-2 px-3 font-semibold text-slate-800">团队推广</th>
                </tr>
              </thead>
              <tbody className="text-slate-600">
                {[
                  ['学生/家长', '个人专属推广码/海报/链接', '基础比例', '无'],
                  ['教师/机构', '定制推广素材 + 额外加成', '基础 +5%～10%', '有（可分成）'],
                  ['企业', '无推广权限', '无', '无'],
                ].map((row, i) => (
                  <tr key={i} className="border-b border-slate-100 last:border-0">
                    {row.map((cell, j) => <td key={j} className={'py-3 px-3 ' + (j === 0 ? 'font-medium text-slate-800' : '')}>{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card p-6">
            <h3 className="font-semibold text-bingo-dark mb-4">核心流程说明</h3>
            <div className="space-y-2">
              {[
                ['推广权限开通', '登录后进入推广赚钱，系统自动开通（非企业角色），首次进入弹出规则说明，确认后生成专属推广码（永久有效）'],
                ['推广素材分享', '课程/商品/赛事详情页均有"分享"按钮，支持生成含推广码的海报保存至相册、复制带ID链接、直接分享微信好友'],
                ['推广关系绑定', '被推广人通过链接/扫码进入后，页面顶部提示"由XXX推荐"，自动建立绑定，30天内消费均计入'],
                ['佣金计算与结算', '支付完成→待结算；7天后自动转为可提现；退款/取消→对应佣金扣除，状态实时推送通知'],
                ['提现流程', '进入佣金结算→余额≥¥10→申请提现→系统验证微信实名→审核中（≤10分钟）→到账微信零钱'],
              ].map(([title, desc], i) => (
                <details key={i} className="border border-slate-200 rounded-xl overflow-hidden group">
                  <summary className="px-4 py-3 bg-slate-50 font-medium text-sm text-bingo-dark cursor-pointer list-none flex items-center justify-between">
                    <span>{i + 1}. {title}</span>
                    <span className="text-slate-400 group-open:rotate-180 transition">▼</span>
                  </summary>
                  <div className="px-4 py-3 text-sm text-slate-600 border-t border-slate-100">{desc}</div>
                </details>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── 可分享模块通用二级页 ────────────────────────────────
function ShareableModule({ title, icon, onBack, children }) {
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareRecords] = useState([
    { type: '微信好友', content: title + ' · 个人成果', date: '2025-06-18', result: '已查看 3 次' },
    { type: '缤纷成果', content: title + ' · 专属分享', date: '2025-06-15', result: '获赞 12 次' },
  ])

  return (
    <div>
      <div className="flex items-center gap-2 mb-4 text-sm flex-wrap">
        <button onClick={onBack} className="text-slate-500 hover:text-primary transition">← 个人中心</button>
        <span className="text-slate-300">/</span>
        <span className="text-bingo-dark font-semibold">{title}</span>
      </div>

      {/* 顶部分享工具栏 */}
      <div className="card p-4 bg-slate-50 border-slate-200/60 mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <span className="font-semibold text-bingo-dark text-sm">{title}</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button type="button" className="text-xs text-slate-500 hover:text-primary transition px-3 py-1.5 rounded-lg border border-slate-200 hover:border-primary/50 bg-white">
            批量选择
          </button>
          <button onClick={() => setShowShareModal(true)}
            className="text-xs bg-primary text-white px-4 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-cyan-600 transition font-medium">
            <span>📤</span> 一键分享
          </button>
          <button type="button" className="text-xs text-slate-500 hover:text-primary transition px-3 py-1.5 rounded-lg border border-slate-200 hover:border-primary/50 bg-white">
            我的分享记录
          </button>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="mb-6">{children}</div>

      {/* 分享记录预览 */}
      <div className="card p-5 bg-slate-50">
        <h3 className="font-semibold text-bingo-dark text-sm mb-3">最近分享记录</h3>
        <ul className="space-y-2">
          {shareRecords.map((r, i) => (
            <li key={i} className="flex items-center justify-between text-xs py-2 border-b border-slate-100 last:border-0">
              <div className="flex items-center gap-2">
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full">{r.type}</span>
                <span className="text-slate-600">{r.content}</span>
              </div>
              <div className="text-right shrink-0 ml-3">
                <p className="text-slate-400">{r.date}</p>
                <p className="text-emerald-600">{r.result}</p>
              </div>
            </li>
          ))}
        </ul>
        <button type="button" className="mt-3 text-xs text-primary hover:underline">查看全部分享记录 →</button>
      </div>

      {showShareModal && <ShareModal title={'分享 · ' + title} subtitle="选择分享渠道，支持生成图片/链接" onClose={() => setShowShareModal(false)} />}
    </div>
  )
}

// ─── 我的个人作品 ─────────────────────────────────────────
function MyWorks({ onBack }) {
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareTarget, setShareTarget] = useState('')

  const works = [
    { id: 1, title: 'AI识别系统设计方案', type: 'AI项目', date: '2025-06-01', award: '市级一等奖', status: '已获奖' },
    { id: 2, title: '机器人自动驾驶算法', type: '竞赛作品', date: '2025-04-10', award: '', status: '参赛中' },
    { id: 3, title: 'Python图像识别实验报告', type: '学习成果', date: '2025-03-20', award: '', status: '已完成' },
  ]

  return (
    <ShareableModule title="我的个人作品" icon="🎨" onBack={onBack}>
      <div className="space-y-3">
        {works.map(w => (
          <div key={w.id} className="card p-5 hover:shadow-md hover:border-primary/30 transition">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-semibold text-bingo-dark text-sm">{w.title}</h3>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{w.type}</span>
                  {w.award && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">🏆 {w.award}</span>}
                </div>
                <p className="text-xs text-slate-400">{w.date}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={'text-[10px] px-2 py-0.5 rounded-full ' + (w.status === '已获奖' ? 'bg-amber-100 text-amber-700' : w.status === '参赛中' ? 'bg-sky-100 text-sky-700' : 'bg-emerald-100 text-emerald-700')}>{w.status}</span>
                <button onClick={() => { setShareTarget(w.title); setShowShareModal(true) }}
                  className="text-[10px] bg-orange-100 text-orange-600 px-2 py-1 rounded-lg hover:bg-orange-200 transition flex items-center gap-0.5">
                  <span>📤</span> 分享
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Link to="/profile/works" className="block mt-4 text-center text-sm text-primary hover:underline">管理全部作品 →</Link>
      {showShareModal && <ShareModal title={'分享作品：' + shareTarget} subtitle="生成图片包含作品详情+缤果AI学院品牌标识" onClose={() => setShowShareModal(false)} />}
    </ShareableModule>
  )
}

// ─── 我的赛事 ────────────────────────────────────────────
function MyEvents({ onBack }) {
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareTarget, setShareTarget] = useState('')

  const events = [
    { id: 1, name: '第五届全国青少年AI挑战赛', status: '已获奖', award: '全国一等奖', date: '2025-05-20', official: '官方认证' },
    { id: 2, name: '省级创客马拉松竞赛2025', status: '已参与', award: '优秀奖', date: '2025-04-15', official: '' },
    { id: 3, name: '缤果AI学院内部竞赛·春季', status: '报名中', award: '', date: '2025-07-01', official: '' },
  ]

  return (
    <ShareableModule title="我的赛事" icon="🏆" onBack={onBack}>
      <div className="space-y-3">
        {events.map(e => (
          <div key={e.id} className="card p-5 hover:shadow-md hover:border-primary/30 transition">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-semibold text-bingo-dark text-sm">{e.name}</h3>
                  {e.official && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">{e.official}</span>}
                </div>
                {e.award && <p className="text-xs text-amber-600 font-medium mb-1">🏆 {e.award}</p>}
                <p className="text-xs text-slate-400">{e.date}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={'text-[10px] px-2 py-0.5 rounded-full ' + (e.status === '已获奖' ? 'bg-amber-100 text-amber-700' : e.status === '已参与' ? 'bg-slate-100 text-slate-600' : 'bg-sky-100 text-sky-700')}>{e.status}</span>
                {(e.status === '已获奖' || e.status === '已参与') && (
                  <button onClick={() => { setShareTarget(e.name); setShowShareModal(true) }}
                    className="text-[10px] bg-orange-100 text-orange-600 px-2 py-1 rounded-lg hover:bg-orange-200 transition flex items-center gap-0.5">
                    <span>📤</span>{e.status === '已获奖' ? '晒奖' : '分享'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {showShareModal && <ShareModal title={'分享赛事：' + shareTarget} subtitle="获奖赛事分享时自动携带奖项标识和赛事官方logo" onClose={() => setShowShareModal(false)} />}
    </ShareableModule>
  )
}

// ─── 我的认证 ────────────────────────────────────────────
function MyCerts({ onBack }) {
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareTarget, setShareTarget] = useState('')

  const certs = [
    { id: 1, name: 'AI素养初级认证', level: 'L1', issuer: '缤果AI学院', date: '2025-03-15', valid: '永久有效' },
    { id: 2, name: 'Python编程进阶认证', level: 'L2', issuer: '缤果AI学院', date: '2025-05-08', valid: '永久有效' },
  ]

  return (
    <ShareableModule title="我的认证" icon="📜" onBack={onBack}>
      <div className="grid md:grid-cols-2 gap-4">
        {certs.map(c => (
          <div key={c.id} className="card p-5 bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-200/60 hover:shadow-md transition">
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">{c.level}</span>
                <h3 className="font-bold text-bingo-dark mt-1">{c.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{c.issuer} · {c.date}</p>
                <p className="text-xs text-emerald-600 mt-0.5">{c.valid}</p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-indigo-100 flex items-center justify-center text-2xl shrink-0">📜</div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button type="button" className="text-xs border border-indigo-200 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-50">下载证书</button>
              <button type="button" className="text-xs border border-indigo-200 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-50">扫码验真</button>
              <button onClick={() => { setShareTarget(c.name); setShowShareModal(true) }}
                className="text-xs bg-orange-100 text-orange-600 px-3 py-1.5 rounded-lg hover:bg-orange-200 transition flex items-center gap-1">
                <span>📤</span> 分享证书
              </button>
            </div>
          </div>
        ))}
      </div>
      <Link to="/cert" className="block mt-4 text-center text-sm text-primary hover:underline">前往认证中心查看更多 →</Link>
      {showShareModal && <ShareModal title={'分享认证：' + shareTarget} subtitle="生成高清证书图，含验真二维码，链接支持他人扫码查看" onClose={() => setShowShareModal(false)} />}
    </ShareableModule>
  )
}

// ─── 我的能力档案 ─────────────────────────────────────────
function MyAbility({ onBack }) {
  const [showShareModal, setShowShareModal] = useState(false)

  return (
    <ShareableModule title="我的能力档案" icon="📊" onBack={onBack}>
      <div className="space-y-4">
        <div className="card p-6 bg-gradient-to-br from-sky-50 to-indigo-50 border-sky-200/60">
          <h3 className="font-semibold text-bingo-dark mb-4">AI综合能力评估</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            {[
              { label: '三星AI建模师', score: 88, color: 'text-sky-600' },
              { label: '编程实践', score: 75, color: 'text-violet-600' },
              { label: '创新思维', score: 92, color: 'text-amber-600' },
              { label: '问题解决', score: 80, color: 'text-emerald-600' },
            ].map((d, i) => (
              <div key={i} className="text-center">
                <p className={'text-3xl font-bold ' + d.color}>{d.score}</p>
                <p className="text-xs text-slate-500 mt-1">{d.label}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">综合能力等级：<span className="font-bold text-sky-600">进阶学员 ⭐⭐⭐</span></p>
            <button onClick={() => setShowShareModal(true)}
              className="text-xs bg-orange-100 text-orange-600 px-3 py-1.5 rounded-lg hover:bg-orange-200 transition flex items-center gap-1">
              <span>📤</span> 分享档案
            </button>
          </div>
        </div>
        <div className="card p-5">
          <h3 className="font-semibold text-bingo-dark mb-3">技能成长轨迹</h3>
          <div className="space-y-2">
            {[
              { skill: 'Python基础', progress: 90, color: 'bg-sky-500' },
              { skill: '机器学习入门', progress: 65, color: 'bg-violet-500' },
              { skill: '图像识别', progress: 72, color: 'bg-amber-500' },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-slate-600 w-24 shrink-0">{s.skill}</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={'h-full rounded-full ' + s.color} style={{ width: s.progress + '%' }} />
                </div>
                <span className="text-xs text-slate-500 w-8 text-right">{s.progress}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {showShareModal && <ShareModal title="分享能力档案" subtitle="可生成完整长图或精简版链接，适配朋友圈排版" onClose={() => setShowShareModal(false)} />}
    </ShareableModule>
  )
}

// ─── 我的订单 ────────────────────────────────────────────
function MyOrders({ onBack }) {
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareTarget, setShareTarget] = useState('')

  const orders = [
    { id: 'ORD2025001', name: 'AI通识科学营·暑期班', type: '课程', amount: '¥1,280', date: '2025-06-15', status: '已完成' },
    { id: 'ORD2025002', name: '全国青少年AI挑战赛·报名套餐', type: '赛事', amount: '¥380', date: '2025-05-10', status: '使用中' },
    { id: 'ORD2025003', name: 'AI学习工具箱·月卡', type: '教具', amount: '¥198', date: '2025-04-01', status: '已完成' },
  ]

  return (
    <ShareableModule title="我的订单" icon="📦" onBack={onBack}>
      <div className="space-y-3">
        {orders.map(o => (
          <div key={o.id} className="card p-5 hover:shadow-md hover:border-primary/30 transition">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{o.type}</span>
                  <h3 className="font-semibold text-bingo-dark text-sm">{o.name}</h3>
                </div>
                <p className="text-xs text-slate-400">订单号：{o.id} · {o.date}</p>
              </div>
              <div className="text-right flex flex-col items-end gap-1 shrink-0">
                <p className="font-bold text-bingo-dark">{o.amount}</p>
                <span className={'text-[10px] px-2 py-0.5 rounded-full ' + (o.status === '已完成' ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700')}>{o.status}</span>
                <button onClick={() => { setShareTarget(o.name); setShowShareModal(true) }}
                  className="text-[10px] bg-orange-100 text-orange-600 px-2 py-1 rounded-lg hover:bg-orange-200 transition flex items-center gap-0.5">
                  <span>📤</span> 推广赚钱
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-500 mt-3 text-center">分享订单生成推广链接，他人购买同款后您可获得佣金奖励</p>
      {showShareModal && <ShareModal title={'推广订单：' + shareTarget} subtitle="生成推广链接，他人通过链接下单您可获双重奖励" onClose={() => setShowShareModal(false)} />}
    </ShareableModule>
  )
}

// ─── 个人中心主组件 ────────────────────────────────────────
export default function Profile() {
  const [page, setPage] = useState('main')
  const [shareModal, setShareModal] = useState(null)

  if (page === 'member') return <div className="max-w-7xl mx-auto px-4 py-8"><MemberCenter onBack={() => setPage('main')} /></div>
  if (page === 'promo') return <div className="max-w-7xl mx-auto px-4 py-8"><PromoCenter onBack={() => setPage('main')} /></div>
  if (page === 'works') return <div className="max-w-7xl mx-auto px-4 py-8"><MyWorks onBack={() => setPage('main')} /></div>
  if (page === 'events') return <div className="max-w-7xl mx-auto px-4 py-8"><MyEvents onBack={() => setPage('main')} /></div>
  if (page === 'certs') return <div className="max-w-7xl mx-auto px-4 py-8"><MyCerts onBack={() => setPage('main')} /></div>
  if (page === 'ability') return <div className="max-w-7xl mx-auto px-4 py-8"><MyAbility onBack={() => setPage('main')} /></div>
  if (page === 'orders') return <div className="max-w-7xl mx-auto px-4 py-8"><MyOrders onBack={() => setPage('main')} /></div>

  // ── 一级首页 ──────────────────────────────────────────
  const SHAREABLE_MODULES = [
    { key: 'works', label: '个人作品', icon: '🎨' },
    { key: 'events', label: '我的赛事', icon: '🏆' },
    { key: 'certs', label: '我的认证', icon: '📜' },
    { key: 'ability', label: '能力档案', icon: '📊' },
    { key: 'orders', label: '我的订单', icon: '📦' },
  ]

  const sessionUser = getSessionUser()

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* ── 顶部通栏：用户信息 + 会员状态 ── */}
      <section className="mb-8">
        <div className="card p-6 bg-gradient-to-r from-bingo-dark to-slate-800 text-white">
          <div className="flex flex-wrap items-start gap-5">
            {/* 头像+基本信息 */}
            <div className="flex items-center gap-4">
              <img
                src={sessionUserDisplayAvatarUrl(sessionUser)}
                alt=""
                className="w-16 h-16 rounded-full object-cover shrink-0 border-2 border-cyan-400/30 bg-white/10"
                width={64}
                height={64}
                decoding="async"
              />
              <div>
                <p className="font-bold text-lg">昵称 · {sessionUser.nickname}</p>
                <p className="text-white/70 text-xs mt-0.5">学员ID: BG20250001 · 绑定手机：138****8888</p>
                <button type="button" className="text-xs text-cyan-400 hover:text-white mt-1 transition">安全设置 →</button>
              </div>
            </div>

            {/* 会员状态 */}
            <div className="flex-1 min-w-[220px]">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-xs font-bold bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1 rounded-full">👑 年度会员</span>
                <span className="text-white/70 text-xs">剩余 320 天</span>
                <span className="text-emerald-400 text-xs">● 自动续费已开启</span>
              </div>
              <p className="text-white/60 text-xs mb-3">下次续费 2026-01-20 · ¥239（自动续费优惠价）</p>
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => setPage('member')}
                  className="text-xs bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-2 rounded-xl font-medium hover:opacity-90 transition">
                  会员中心 · 查看权益
                </button>
                <button onClick={() => setPage('member')}
                  className="text-xs bg-white/15 text-white px-4 py-2 rounded-xl hover:bg-white/25 transition">
                  管理自动续费
                </button>
              </div>
            </div>

            <Link to="/profile/edit" className="text-xs text-white/70 hover:text-white border border-white/20 rounded-xl px-4 py-2 transition self-start shrink-0">编辑资料</Link>
          </div>
        </div>
      </section>

      {/* ── 核心功能区 ── */}
      <section className="mb-8">
        <h2 className="section-title mb-3">核心功能</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">

          {/* 会员中心 - 重点高亮 */}
          <button onClick={() => setPage('member')}
            className="card p-4 text-center hover:shadow-md hover:border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/60 transition group col-span-1">
            <div className="text-2xl mb-1">👑</div>
            <p className="font-semibold text-amber-700 text-sm group-hover:text-amber-800">会员中心</p>
            <p className="text-[10px] text-amber-600/70 mt-0.5">年度会员</p>
          </button>

          {/* 推广赚钱 - 重点高亮 */}
          <button onClick={() => setPage('promo')}
            className="card p-4 text-center hover:shadow-md hover:border-orange-300 bg-gradient-to-br from-orange-50 to-rose-50 border-orange-200/60 transition group">
            <div className="text-2xl mb-1">💰</div>
            <p className="font-semibold text-orange-700 text-sm group-hover:text-orange-800">推广赚钱</p>
            <p className="text-[10px] text-orange-600/70 mt-0.5">佣金翻倍中</p>
          </button>

          {/* 五大可分享模块 - 带分享图标 */}
          {SHAREABLE_MODULES.map(m => (
            m.key === 'orders' ? (
              <Link key={m.key} to="/profile/orders"
                className="card p-4 text-center hover:shadow-md hover:border-primary/30 transition group relative block">
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-white text-[9px]">📤</div>
                <div className="text-2xl mb-1">{m.icon}</div>
                <p className="font-medium text-bingo-dark text-sm group-hover:text-primary">{m.label}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">研学订单·凭证·退款</p>
              </Link>
            ) : (
            <button key={m.key} onClick={() => setPage(m.key)}
              className="card p-4 text-center hover:shadow-md hover:border-primary/30 transition group relative">
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-white text-[9px]">📤</div>
              <div className="text-2xl mb-1">{m.icon}</div>
              <p className="font-medium text-bingo-dark text-sm group-hover:text-primary">{m.label}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">支持多渠道分享</p>
            </button>
            )
          ))}

          {/* 其他功能 */}
          {[
            { to: '/profile/study', icon: '📚', label: '学习中心', note: '我的课程' },
            { to: '/profile/test', icon: '📊', label: '测评中心', note: '历史报告' },
            { to: '/profile/points', icon: '⭐', label: '积分商城', note: '积分兑换' },
            { to: '/events/ai-test', icon: '🧪', label: 'AI测评', note: '能力测评' },
            { to: '/profile#tools', icon: '🛠️', label: '我的教具', note: '' },
            { to: '/community', icon: '💬', label: '消息通知', note: '' },
            { to: '/profile#settings', icon: '⚙️', label: '设置中心', note: '' },
            { to: '/cert', icon: '🏅', label: '公益积分', note: '' },
          ].map((item, i) => (
            <Link key={i} to={item.to}
              className="card p-4 text-center hover:shadow-md hover:border-primary/30 transition group">
              <div className="text-2xl mb-1">{item.icon}</div>
              <p className="font-medium text-bingo-dark text-sm group-hover:text-primary">{item.label}</p>
              {item.note && <p className="text-[10px] text-slate-400 mt-0.5">{item.note}</p>}
            </Link>
          ))}
        </div>
      </section>

      {/* ── 数据概览区 ── */}
      <section className="mb-8">
        <h2 className="section-title mb-3">数据概览</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: '已学课程时长', value: '128h', icon: '📚', note: '本月 +12h', page: null },
            { label: '参与赛事', value: '6 场', icon: '🏆', note: '获奖 3 次', page: 'events' },
            { label: '获得认证', value: '2 项', icon: '📜', note: '全部永久有效', page: 'certs' },
            { label: '推广佣金余额', value: '¥86.50', icon: '💰', note: '待结算 ¥23', page: 'promo' },
            { label: '已邀请好友', value: '18 人', icon: '👥', note: '本月 +3人', page: 'promo' },
            { label: '公益积分', value: '1,280', icon: '⭐', note: '等级：学分达人', page: null },
            { label: '能力综合评分', value: '83/100', icon: '📊', note: '进阶学员等级', page: 'ability' },
            { label: '会员福利待领', value: '3 项', icon: '🎁', note: '立即领取', page: 'member' },
          ].map((d, i) => (
            <div key={i}
              className={'card p-5 hover:shadow-md transition ' + (d.page ? 'cursor-pointer hover:border-primary/30' : '')}
              onClick={() => d.page && setPage(d.page)}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-slate-500">{d.label}</p>
                <span className="text-lg">{d.icon}</span>
              </div>
              <p className="text-2xl font-bold text-bingo-dark mt-1">{d.value}</p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-slate-400">{d.note}</p>
                {d.page && (
                  <button onClick={e => { e.stopPropagation(); setShareModal(d.label) }}
                    className="text-[10px] text-orange-500 hover:text-orange-600 transition">📤</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 缤果学分银行 ── */}
      <ScoreBank />

      {/* ── B端合作入口 ── */}
      <section className="mb-8">
        <h2 className="section-title">B端 · 合作/加盟管理</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link to="/franchise" className="card p-4 text-center hover:shadow-md hover:border-primary/30 transition bg-gradient-to-br from-cyan-50 to-sky-50">
            <div className="font-semibold text-primary">加盟申请</div>
            <div className="text-xs text-slate-500 mt-1">加盟进度查询</div>
          </Link>
          <Link to="/events?tab=b" className="card p-4 text-center hover:shadow-md hover:border-primary/30 transition bg-gradient-to-br from-cyan-50 to-sky-50">
            <div className="font-semibold text-primary">赛事DIY定制</div>
            <div className="text-xs text-slate-500 mt-1">定制进度查询</div>
          </Link>
          <a href="/#/b" className="card p-4 text-center hover:shadow-md hover:border-primary/30 transition bg-gradient-to-br from-cyan-50 to-sky-50">
            <div className="font-semibold text-primary">合作管理</div>
            <div className="text-xs text-slate-500 mt-1">机构合作进度</div>
          </a>
          <Link to="/mall?b=1" className="card p-4 text-center hover:shadow-md hover:border-primary/30 transition bg-gradient-to-br from-cyan-50 to-sky-50">
            <div className="font-semibold text-primary">采购订单</div>
            <div className="text-xs text-slate-500 mt-1">加盟方专属采购</div>
          </Link>
        </div>
      </section>

      {/* ── 营销推荐区 ── */}
      <section className="mb-8">
        <h2 className="section-title mb-3">为你推荐</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { type: '会员专享', title: '年度会员专享 · AI精品课7折', desc: '限时课程专项折扣，点击直接使用', icon: '👑', color: 'border-amber-200/60 bg-amber-50/50', btn: '立即使用', btnStyle: 'bg-amber-500 text-white' },
            { type: '赛事活动', title: '白名单赛事报名截止提醒', desc: '第五届青少年AI挑战赛 · 距截止 3 天', icon: '⚡', color: 'border-sky-200/60 bg-sky-50/50', btn: '立即报名', btnStyle: 'bg-sky-500 text-white' },
            { type: '推广激励', title: '佣金翻倍进行中 · 暑期专场', desc: '精品营课佣金 ×2，已获 ¥86.50', icon: '💰', color: 'border-orange-200/60 bg-orange-50/50', btn: '立即推广', btnStyle: 'bg-orange-500 text-white' },
            { type: '课程限时', title: 'AI通识科学营 · 限时8折', desc: '今日仅剩 12 个名额，拼团更优惠', icon: '🔥', color: 'border-rose-200/60 bg-rose-50/50', btn: '查看详情', btnStyle: 'bg-rose-500 text-white' },
            { type: '会员专享', title: '开通年度会员 · 赛事集训免费学', desc: '年度会员专属集训资料包，价值¥299', icon: '🏆', color: 'border-violet-200/60 bg-violet-50/50', btn: '开通会员', btnStyle: 'bg-violet-500 text-white' },
            { type: '推广激励', title: '邀请好友开通会员赚额外奖励', desc: '每成功邀请1人开通年度会员额外得¥30', icon: '👥', color: 'border-emerald-200/60 bg-emerald-50/50', btn: '生成海报', btnStyle: 'bg-emerald-500 text-white' },
          ].map((rec, i) => (
            <div key={i} className={'card p-5 border hover:shadow-md transition ' + rec.color}>
              <div className="flex items-start gap-3 mb-3">
                <span className="text-xl">{rec.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] bg-white rounded-full px-2 py-0.5 text-slate-500">{rec.type}</span>
                  </div>
                  <p className="font-semibold text-bingo-dark text-sm">{rec.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{rec.desc}</p>
                </div>
              </div>
              <button type="button" className={'text-xs px-4 py-2 rounded-lg font-medium ' + rec.btnStyle}>{rec.btn}</button>
            </div>
          ))}
        </div>
      </section>

      {/* ── 推广赚钱入口（高亮展示） ── */}
      <section id="promo" className="mb-8">
        <div className="card p-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-300/40 hover:border-amber-400/60 hover:shadow-md transition cursor-pointer"
          onClick={() => setPage('promo')}>
          <div className="flex flex-wrap items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-2xl shrink-0">💰</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className="font-bold text-bingo-dark text-lg">推广赚钱</h3>
                <span className="text-[10px] bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full font-bold">佣金翻倍中</span>
              </div>
              <p className="text-sm text-slate-600">专属推广码 · 海报链接生成 · 推广订单明细 · 佣金结算提现 · 活动专场 · 邀请有礼 · 团队推广</p>
              <div className="flex gap-4 mt-2 text-xs text-slate-500">
                <span>可提现 <strong className="text-amber-600">¥86.50</strong></span>
                <span>待结算 <strong className="text-slate-700">¥23.00</strong></span>
                <span>本月 <strong className="text-slate-700">12 单</strong></span>
                <span>年度会员佣金加成 <strong className="text-emerald-600">+20%</strong></span>
              </div>
            </div>
            <button type="button" className="shrink-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition">
              进入推广赚钱 →
            </button>
          </div>
        </div>
      </section>

      {/* ── 底部快捷区 ── */}
      <section className="card p-5 bg-slate-50">
        <div className="flex flex-wrap gap-3 justify-center text-sm">
          <Link to="/" className="text-slate-600 hover:text-primary transition">🏠 返回首页</Link>
          <span className="text-slate-300">|</span>
          <button type="button" className="text-slate-600 hover:text-primary transition">📖 帮助中心</button>
          <span className="text-slate-300">|</span>
          <button type="button" className="text-slate-600 hover:text-primary transition">📞 联系我们</button>
          <span className="text-slate-300">|</span>
          <button onClick={() => setPage('member')} className="text-amber-600 hover:text-amber-700 transition font-medium">👑 会员专属客服</button>
          <span className="text-slate-300">|</span>
          <button onClick={() => setPage('member')} className="text-slate-600 hover:text-primary transition">🔄 自动续费管理</button>
        </div>
      </section>

      {/* 分享弹窗 */}
      {shareModal && <ShareModal title={'分享 · ' + shareModal} onClose={() => setShareModal(null)} />}
    </div>
  )
}
