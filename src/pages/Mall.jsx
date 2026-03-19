import { useState } from 'react'
import { Link } from 'react-router-dom'

// ─── 数据 ─────────────────────────────────────────────────
const CATEGORIES = [
  { id: 'courses', icon: '📚', label: 'AI精品课程', tag: '爆款', tagColor: 'bg-amber-100 text-amber-700',
    desc: '素养课·竞赛培优·升学赋能·AI实验室配套', hot: true },
  { id: 'events', icon: '🏆', label: '赛事服务', tag: '早鸟优惠', tagColor: 'bg-rose-100 text-rose-600',
    desc: '白名单赛事·报名·集训营·全程辅导', hot: false },
  { id: 'cert', icon: '📜', label: '认证中心', tag: '升学加分', tagColor: 'bg-violet-100 text-violet-700',
    desc: 'AI素养·科创能力·赛事获奖·特长生认证', hot: false },
  { id: 'materials', icon: '🔧', label: '数字教材&教具', tag: '套装折扣', tagColor: 'bg-sky-100 text-sky-700',
    desc: '数字教材·实体教具·配套课程组合', hot: false },
  { id: 'lab', icon: '🧪', label: 'AI数字实验室', tag: '实验室专属价', tagColor: 'bg-emerald-100 text-emerald-700',
    desc: '虚拟仿真·个人/家庭/机构版·一站式落地', hot: true },
  { id: 'training-room', icon: '🏗️', label: 'AI实训室', tag: '机构爆款', tagColor: 'bg-orange-100 text-orange-700',
    desc: '标准版·定制化建设·软硬件一体化·师训配套', hot: true },
]

const PRODUCTS = {
  courses: [
    { id: 'c1', name: 'AI通识素养启蒙课', age: '6-10岁', type: '素养课', price: 299, origPrice: 399, sales: 2341, rating: 4.9, tag: '限时9.9体验', cLabel: '立即购买', bLabel: '机构批量采购' },
    { id: 'c2', name: '青少年AI竞赛培优课', age: '12-16岁', type: '竞赛培优课', price: 1280, origPrice: 1680, sales: 876, rating: 4.8, tag: '赛事直通', cLabel: '立即购买', bLabel: '机构批量采购' },
    { id: 'c3', name: '升学赋能AI实践课', age: '14-18岁', type: '升学赋能课', price: 2980, origPrice: 3580, sales: 432, rating: 4.9, tag: '综评背书', cLabel: '立即购买', bLabel: '机构批量采购' },
    { id: 'c4', name: 'AI数字实验室配套入门课', age: '8-14岁', type: '实验室配套', price: 498, origPrice: 680, sales: 654, rating: 4.7, tag: '实验室专属', cLabel: '立即购买', bLabel: '机构批量采购' },
  ],
  events: [
    { id: 'e1', name: '全国青少年AI创新大赛 · 报名服务', age: '10-18岁', type: '白名单赛事', price: 580, origPrice: 680, sales: 1203, rating: 4.8, tag: '白名单赛事', cLabel: '个人报名', bLabel: '机构组团参赛' },
    { id: 'e2', name: '赛事冲刺集训营（30天）', age: '12-18岁', type: '集训营', price: 2980, origPrice: 3680, sales: 345, rating: 4.9, tag: '全程辅导', cLabel: '立即报名', bLabel: '机构合作版' },
  ],
  cert: [
    { id: 'cert1', name: 'AI素养能力认证（L1基础级）', age: '8-12岁', type: 'AI素养认证', price: 198, origPrice: 298, sales: 1876, rating: 4.8, tag: '升学佐证', cLabel: '个人报名', bLabel: '机构统一报名' },
    { id: 'cert2', name: 'AI科创研究认证（L3高级）', age: '14-18岁', type: '科创能力认证', price: 498, origPrice: 680, sales: 432, rating: 4.9, tag: '高校背书', cLabel: '个人报名', bLabel: '机构统一报名' },
  ],
  materials: [
    { id: 'm1', name: 'AI编程入门教具套装', age: '8-14岁', type: '实体教具', price: 368, origPrice: 468, sales: 2109, rating: 4.7, tag: '配套课程', cLabel: '立即购买', bLabel: '批量采购报价' },
    { id: 'm2', name: 'AI素养系列数字教材（全套）', age: '6-18岁', type: '数字教材', price: 128, origPrice: 198, sales: 3201, rating: 4.8, tag: '在线阅读', cLabel: '立即购买', bLabel: '机构授权采购' },
    { id: 'm3', name: '机器人竞赛教具套装（高级）', age: '12-18岁', type: '实验室配套教具', price: 1280, origPrice: 1680, sales: 567, rating: 4.8, tag: '实验室适配', cLabel: '立即购买', bLabel: '批量采购报价' },
  ],
  lab: [
    { id: 'lab1', name: 'AI数字实验室 · 个人体验版', age: '8-16岁', type: '软件版·个人', price: 299, origPrice: 398, sales: 1234, rating: 4.7, tag: '免费体验', cLabel: '立即购买', bLabel: null },
    { id: 'lab2', name: 'AI数字实验室 · 家庭启蒙版', age: '6-12岁', type: '软件版·家庭', price: 598, origPrice: 798, sales: 876, rating: 4.8, tag: '家庭专享', cLabel: '立即购买', bLabel: null },
    { id: 'lab3', name: 'AI数字实验室 · 机构标准版', age: '全学段', type: '软硬件结合·机构', price: null, origPrice: null, sales: 98, rating: 4.9, tag: '机构爆款', cLabel: null, bLabel: '咨询采购顾问' },
    { id: 'lab4', name: 'AI数字实验室 · 定制版', age: '全学段', type: '定制版·机构/学校', price: null, origPrice: null, sales: 34, rating: 5.0, tag: '定制建设', cLabel: null, bLabel: '提交定制需求' },
  ],
  'training-room': [
    { id: 'tr1', name: 'AI实训室 · 小型套装（个人/家庭）', age: '14-18岁', type: '小型套装·C端', price: 4980, origPrice: 6480, sales: 123, rating: 4.8, tag: '科创进阶', cLabel: '立即购买', bLabel: null },
    { id: 'tr2', name: 'AI实训室 · 机构标准版套装', age: '初中/高中', type: '标准版·机构', price: null, origPrice: null, sales: 45, rating: 4.9, tag: '机构爆款', cLabel: null, bLabel: '咨询商务顾问' },
    { id: 'tr3', name: 'AI实训室 · 校园定制化建设方案', age: '全学段', type: '定制版·校园', price: null, origPrice: null, sales: 18, rating: 5.0, tag: '一站式落地', cLabel: null, bLabel: '免费获取方案' },
  ],
}

// 产品详情页
function ProductDetail({ product, catId, onBack }) {
  const [qty, setQty] = useState(1)
  const [tab, setTab] = useState('intro')
  const [applyType, setApplyType] = useState(null)
  const [formSubmitted, setFormSubmitted] = useState(false)

  const isLab = catId === 'lab' || catId === 'training-room'
  const isPriceOnRequest = !product.price

  const REVIEWS = [
    { user: '李同学家长', rating: 5, text: '孩子非常喜欢，课程内容生动有趣，老师讲解清晰！', date: '2025-06-10' },
    { user: '王老师（机构）', rating: 5, text: '机构引入后学员积极性明显提升，家长反馈很好。', date: '2025-05-28' },
    { user: '张同学', rating: 4, text: '内容很实用，有些地方希望再详细一点，整体很值！', date: '2025-05-15' },
  ]

  return (
    <div>
      <div className="flex items-center gap-2 mb-6 text-sm flex-wrap">
        <button onClick={onBack} className="text-slate-500 hover:text-primary transition">AI智能商城</button>
        <span className="text-slate-300">/</span>
        <button onClick={onBack} className="text-slate-500 hover:text-primary transition">{CATEGORIES.find(c => c.id === catId)?.label}</button>
        <span className="text-slate-300">/</span>
        <span className="text-bingo-dark font-medium">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* 左：产品信息 */}
        <div>
          <div className="aspect-video rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-6xl mb-4">
            {CATEGORIES.find(c => c.id === catId)?.icon}
          </div>
        </div>

        {/* 右：购买区 */}
        <div>
          <div className="flex flex-wrap gap-2 mb-3">
            <span className={'text-xs px-2.5 py-1 rounded-full font-medium ' + (CATEGORIES.find(c => c.id === catId)?.tagColor || 'bg-slate-100 text-slate-600')}>{product.tag}</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">{product.type}</span>
          </div>
          <h1 className="text-2xl font-bold text-bingo-dark mb-2">{product.name}</h1>
          <p className="text-sm text-slate-500 mb-4">适用年龄：{product.age} · 销量：{product.sales} · 评分：{'⭐'.repeat(Math.floor(product.rating))} {product.rating}</p>

          {!isPriceOnRequest ? (
            <div className="mb-4">
              <span className="text-3xl font-bold text-rose-500">¥{product.price}</span>
              {product.origPrice && <span className="text-slate-400 line-through text-sm ml-2">¥{product.origPrice}</span>}
              <span className="ml-3 text-xs text-amber-600 font-medium">消费1元=1积分</span>
            </div>
          ) : (
            <div className="mb-4 text-lg font-bold text-primary">价格面议 · 联系顾问获取报价</div>
          )}

          <div className="grid grid-cols-3 gap-2 mb-5">
            {['正品保障', '课程体系化', product.cLabel ? '立即开通权限' : '一站式落地'].map((v, i) => (
              <div key={i} className="text-center p-2 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600 font-medium">{v}</p>
              </div>
            ))}
          </div>

          {formSubmitted ? (
            <div className="card p-6 text-center">
              <div className="text-4xl mb-2">✅</div>
              <p className="font-bold text-bingo-dark mb-1">{applyType === 'c' ? '订单提交成功！' : '需求提交成功！'}</p>
              <p className="text-sm text-slate-500 mb-3">{applyType === 'c' ? '虚拟产品将立即开通权限，请查收确认短信' : '专属顾问将在2小时内联系您'}</p>
              <button onClick={() => { setFormSubmitted(false); setApplyType(null) }} className="btn-primary text-sm px-5 py-2">继续浏览</button>
            </div>
          ) : applyType ? (
            <form onSubmit={e => { e.preventDefault(); setFormSubmitted(true) }} className="card p-5 space-y-3 mb-4">
              <h3 className="font-semibold text-bingo-dark">{applyType === 'c' ? 'C端购买' : 'B端采购咨询'}</h3>
              {[
                { label: applyType === 'b' ? '机构名称 *' : '学员姓名 *', type: 'text', ph: applyType === 'b' ? '请输入机构/学校名称' : '请输入姓名' },
                { label: '联系电话 *', type: 'tel', ph: '请输入手机号' },
                applyType === 'b' ? { label: '采购数量/需求说明', type: 'text', ph: '如采购数量、定制需求、场地情况等' } : null,
              ].filter(Boolean).map((f, i) => (
                <div key={i}>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">{f.label}</label>
                  <input required={f.label.includes('*')} type={f.type} placeholder={f.ph}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
                </div>
              ))}
              {!isPriceOnRequest && applyType === 'c' && (
                <div className="flex items-center gap-3">
                  <label className="text-xs text-slate-600">数量</label>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setQty(q => Math.max(1, q - 1))} className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-50">-</button>
                    <span className="text-sm font-medium w-6 text-center">{qty}</span>
                    <button type="button" onClick={() => setQty(q => q + 1)} className="w-7 h-7 rounded-lg border border-slate-200 hover:bg-slate-50">+</button>
                  </div>
                  <span className="text-sm font-bold text-rose-500 ml-2">合计：¥{product.price ? (product.price * qty).toLocaleString() : '面议'}</span>
                </div>
              )}
              <div className="flex gap-2 pt-1">
                <button type="submit" className="btn-primary flex-1 py-2.5 text-sm">{applyType === 'c' ? '确认下单' : '提交咨询需求'}</button>
                <button type="button" onClick={() => setApplyType(null)} className="border border-slate-200 rounded-lg px-4 text-sm text-slate-600 hover:bg-slate-50">返回</button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col gap-3">
              {product.cLabel && (
                <button onClick={() => setApplyType('c')} className="btn-primary py-3 text-sm font-medium">{product.cLabel}</button>
              )}
              {product.bLabel && (
                <button onClick={() => setApplyType('b')}
                  className="border-2 border-primary text-primary py-3 rounded-xl text-sm font-medium hover:bg-primary/5 transition">{product.bLabel}</button>
              )}
              {isLab && <button type="button" className="border border-slate-200 text-slate-600 py-3 rounded-xl text-sm hover:bg-slate-50 transition">免费获取建设方案</button>}
            </div>
          )}
        </div>
      </div>

      {/* 详情 tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {[['intro', '产品介绍'], ['service', '配套服务'], ['reviews', '用户评价'], ['recommend', '相关推荐']].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)}
            className={'px-4 py-1.5 rounded-full text-sm transition ' + (tab === k ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>{l}</button>
        ))}
      </div>

      {tab === 'intro' && (
        <div className="card p-6 space-y-4">
          <h3 className="font-semibold text-bingo-dark">产品核心卖点</h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {(['白名单赛事直通', '升学赋能认证', '配套课程讲解', isLab ? 'AI实验室虚拟仿真+实景操作' : '体系化课程体系', isLab ? '一站式落地无门槛' : '专业导师指导'].slice(0, 5)).map((v, i) => (
              <div key={i} className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl">
                <span className="text-primary text-lg">✦</span>
                <span className="text-sm text-slate-700">{v}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-100 pt-4">
            <h3 className="font-semibold text-bingo-dark mb-3">品牌背书</h3>
            <div className="flex flex-wrap gap-3">
              {['白名单赛事合作方', '教育资质齐全', '高校联合认证', isLab ? 'AI实验室研发资质' : '专业教研团队'].map((v, i) => (
                <span key={i} className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20">{v}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'service' && (
        <div className="card p-6">
          <h3 className="font-semibold text-bingo-dark mb-4">配套服务</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: '💬', title: '课后答疑', desc: '专属学习群，导师定期答疑，学习全程有保障' },
              { icon: '📋', title: '使用指导', desc: '配套操作视频+图文教程，快速上手' },
              { icon: isLab ? '🔧' : '🎯', title: isLab ? '技术支持' : '一对一指导', desc: isLab ? '安装调试+技术维护+定期升级' : '专属导师一对一，定制学习方案' },
              { icon: '🔄', title: '售后保障', desc: isLab ? '质保1年，上门安装，问题7×24小时响应' : '7天退款保障，课程可回放复习' },
            ].map((s, i) => (
              <div key={i} className="flex gap-3 p-4 bg-slate-50 rounded-xl">
                <span className="text-2xl shrink-0">{s.icon}</span>
                <div>
                  <p className="font-medium text-sm text-bingo-dark">{s.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'reviews' && (
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-4xl font-bold text-primary">{product.rating}</span>
            <div>
              <div className="text-amber-400 text-lg">{'⭐'.repeat(Math.floor(product.rating))}</div>
              <p className="text-xs text-slate-500">{product.sales} 人购买 · 好评率 98%</p>
            </div>
          </div>
          <div className="space-y-4">
            {REVIEWS.map((r, i) => (
              <div key={i} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">{r.user.charAt(0)}</div>
                    <span className="text-sm font-medium text-bingo-dark">{r.user}</span>
                  </div>
                  <span className="text-xs text-slate-400">{r.date}</span>
                </div>
                <div className="text-amber-400 text-xs mb-1">{'★'.repeat(r.rating)}</div>
                <p className="text-sm text-slate-600">{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'recommend' && (
        <div className="card p-6">
          <h3 className="font-semibold text-bingo-dark mb-4">相关推荐</h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {PRODUCTS[catId]?.filter(p => p.id !== product.id).slice(0, 3).map((p, i) => (
              <div key={i} className="p-4 bg-slate-50 rounded-xl hover:bg-primary/5 transition cursor-pointer">
                <p className="font-medium text-sm text-bingo-dark mb-1 line-clamp-2">{p.name}</p>
                <p className="text-xs text-slate-400">{p.type}</p>
                <p className="text-primary font-bold text-sm mt-2">{p.price ? `¥${p.price}` : '面议'}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// 结算/预约页
function CheckoutPage({ onBack }) {
  const [mode, setMode] = useState('c')
  const [submitted, setSubmitted] = useState(false)

  return (
    <div>
      <div className="flex items-center gap-2 mb-6 text-sm">
        <button onClick={onBack} className="text-slate-500 hover:text-primary">AI智能商城</button>
        <span className="text-slate-300">/</span>
        <span className="text-bingo-dark font-medium">结算中心</span>
      </div>
      <h2 className="text-2xl font-bold text-bingo-dark mb-5">结算中心</h2>
      <div className="flex gap-2 mb-6">
        {[['c', 'C端 · 个人结算'], ['b', 'B端 · 机构结算'], ['booking', '服务预约']].map(([k, l]) => (
          <button key={k} onClick={() => setMode(k)}
            className={'px-5 py-2 rounded-full text-sm font-medium transition ' + (mode === k ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>{l}</button>
        ))}
      </div>

      {submitted ? (
        <div className="card p-10 text-center max-w-md mx-auto">
          <div className="text-5xl mb-3">✅</div>
          <h3 className="font-bold text-bingo-dark text-xl mb-2">{mode === 'c' ? '订单提交成功！' : mode === 'b' ? '采购需求已提交！' : '预约成功！'}</h3>
          <p className="text-slate-600 text-sm mb-5">{mode === 'c' ? '虚拟产品立即开通，实体产品请等待物流短信' : mode === 'b' ? '专属顾问将在2小时内联系您' : '工作人员将在24小时内联系确认'}</p>
          <button onClick={() => { setSubmitted(false); onBack() }} className="btn-primary px-8 py-2.5 text-sm">返回商城</button>
        </div>
      ) : (
        <div className="max-w-xl">
          <form onSubmit={e => { e.preventDefault(); setSubmitted(true) }} className="card p-7 space-y-4">
            {mode === 'c' && <>
              <h3 className="font-semibold text-bingo-dark">确认订单信息</h3>
              {[
                { label: '收货人 / 学员姓名 *', type: 'text', ph: '请输入姓名' },
                { label: '手机号 *', type: 'tel', ph: '用于接收订单确认及物流信息' },
                { label: '收货地址（实体商品必填）', type: 'text', ph: '请输入完整地址' },
              ].map((f, i) => (
                <div key={i}>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">{f.label}</label>
                  <input type={f.type} placeholder={f.ph} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary" />
                </div>
              ))}
              <div className="bg-slate-50 rounded-xl p-4 text-sm">
                <div className="flex justify-between text-slate-600 mb-1"><span>商品小计</span><span>¥299.00</span></div>
                <div className="flex justify-between text-slate-600 mb-1"><span>积分抵扣</span><span className="text-emerald-600">-¥0.00</span></div>
                <div className="flex justify-between font-bold text-bingo-dark border-t border-slate-200 pt-2 mt-1"><span>实付</span><span className="text-rose-500">¥299.00</span></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {['微信支付', '支付宝'].map(p => (
                  <label key={p} className="flex items-center gap-2 p-3 border border-slate-200 rounded-xl cursor-pointer hover:border-primary/40">
                    <input type="radio" name="pay" className="accent-primary" />
                    <span className="text-sm">{p}</span>
                  </label>
                ))}
              </div>
            </>}

            {mode === 'b' && <>
              <h3 className="font-semibold text-bingo-dark">机构采购信息</h3>
              {[
                { label: '机构/学校名称 *', type: 'text', ph: '请输入完整机构名称' },
                { label: '联系人 *', type: 'text', ph: '采购负责人姓名' },
                { label: '联系电话 *', type: 'tel', ph: '请输入手机号' },
                { label: '机构地址 *', type: 'text', ph: '用于实验室/实训室落地安装' },
                { label: '采购需求说明', type: 'text', ph: '采购品类、数量、定制需求、AI实验室/实训室场地情况等' },
              ].map((f, i) => (
                <div key={i}>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">{f.label}</label>
                  <input type={f.type} placeholder={f.ph} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary" />
                </div>
              ))}
              <div className="flex items-start gap-2">
                <input type="checkbox" id="invoice" className="mt-1" />
                <label htmlFor="invoice" className="text-sm text-slate-600">需要开具发票（机构名称/增值税）</label>
              </div>
              <div className="flex items-start gap-2">
                <input type="checkbox" id="install" className="mt-1" />
                <label htmlFor="install" className="text-sm text-slate-600">需要上门安装调试服务（AI实验室/实训室）</label>
              </div>
              <p className="text-xs text-slate-400">提交后顾问将在2小时内联系您，确认采购清单、签订合同，支持公对公转账/月结</p>
            </>}

            {mode === 'booking' && <>
              <h3 className="font-semibold text-bingo-dark">服务预约</h3>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">预约服务类型 *</label>
                <select required className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary bg-white">
                  <option value="">请选择</option>
                  <option>课程试听预约（C端）</option>
                  <option>免费测评预约（C端）</option>
                  <option>AI数字实验室体验预约（C端）</option>
                  <option>师训服务预约（B端）</option>
                  <option>定制化方案沟通预约（B端）</option>
                  <option>AI实训室落地勘测预约（B端）</option>
                </select>
              </div>
              {[
                { label: '预约人姓名 *', type: 'text', ph: '请输入姓名' },
                { label: '手机号 *', type: 'tel', ph: '用于预约确认' },
                { label: '所属机构（B端必填）', type: 'text', ph: '机构/学校名称' },
              ].map((f, i) => (
                <div key={i}>
                  <label className="text-xs font-medium text-slate-600 mb-1 block">{f.label}</label>
                  <input type={f.type} placeholder={f.ph} className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary" />
                </div>
              ))}
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">期望预约时间</label>
                <select className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary bg-white">
                  <option>尽快安排（工作人员联系确认）</option>
                  <option>近一周内</option>
                  <option>两周内</option>
                  <option>一个月内</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">需求说明</label>
                <textarea rows={3} placeholder="如试听课程名称、师训需求、AI实训室场地尺寸、AI实验室体验时长等"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary resize-none" />
              </div>
            </>}

            <button type="submit" className="btn-primary w-full py-3 text-sm">
              {mode === 'c' ? '确认支付' : mode === 'b' ? '提交采购需求' : '提交预约'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

// 主组件
export default function Mall() {
  const [page, setPage] = useState('home')
  const [activeTab, setActiveTab] = useState('c')
  const [activeCat, setActiveCat] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [searchQ, setSearchQ] = useState('')

  function handleProductClick(cat, product) {
    setActiveCat(cat)
    setSelectedProduct(product)
    setPage('product')
  }

  function handleBack() {
    if (page === 'product') { setPage(activeCat ? 'category' : 'home') }
    else if (page === 'category') { setPage('home') }
    else if (page === 'checkout') { setPage('home') }
    else { setPage('home') }
  }

  // ── 产品详情页 ──
  if (page === 'product' && selectedProduct) return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <ProductDetail product={selectedProduct} catId={activeCat} onBack={handleBack} />
    </div>
  )

  // ── 结算页 ──
  if (page === 'checkout') return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <CheckoutPage onBack={handleBack} />
    </div>
  )

  // ── 品类页 ──
  if (page === 'category' && activeCat) {
    const cat = CATEGORIES.find(c => c.id === activeCat)
    const products = PRODUCTS[activeCat] || []
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-6 text-sm">
          <button onClick={() => setPage('home')} className="text-slate-500 hover:text-primary">AI智能商城</button>
          <span className="text-slate-300">/</span>
          <span className="text-bingo-dark font-medium">{cat?.label}</span>
        </div>
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">{cat?.icon}</span>
          <div>
            <h2 className="text-2xl font-bold text-bingo-dark">{cat?.label}</h2>
            <p className="text-slate-500 text-sm">{cat?.desc}</p>
          </div>
        </div>

        {/* 筛选 */}
        <div className="card p-4 mb-6 flex flex-wrap gap-3 items-center">
          <span className="text-xs text-slate-500 font-medium">筛选：</span>
          {['全部', 'C端个人', 'B端机构'].map(f => (
            <button key={f} className="px-3 py-1.5 rounded-full text-xs bg-slate-100 text-slate-600 hover:bg-primary hover:text-white transition">{f}</button>
          ))}
          <span className="text-slate-200 mx-1">|</span>
          <span className="text-xs text-slate-500 font-medium">排序：</span>
          {['销量', '价格↑', '价格↓', '好评率'].map(s => (
            <button key={s} className="px-3 py-1.5 rounded-full text-xs bg-slate-100 text-slate-600 hover:bg-primary hover:text-white transition">{s}</button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map(p => (
            <div key={p.id} className="card p-6 hover:shadow-md hover:border-primary/30 transition cursor-pointer group"
              onClick={() => handleProductClick(activeCat, p)}>
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className={'text-[10px] px-2.5 py-1 rounded-full font-medium ' + (cat?.tagColor || 'bg-slate-100 text-slate-600')}>{p.tag}</span>
                <span className="text-xs text-slate-400">{p.type}</span>
              </div>
              <h3 className="font-bold text-bingo-dark group-hover:text-primary transition mb-1 line-clamp-2">{p.name}</h3>
              <p className="text-xs text-slate-500 mb-3">适用：{p.age} · 销量 {p.sales} · {p.rating}★</p>
              <div className="flex items-center justify-between mt-auto">
                <div>
                  {p.price ? <>
                    <span className="font-bold text-rose-500 text-lg">¥{p.price}</span>
                    {p.origPrice && <span className="text-xs text-slate-400 line-through ml-1">¥{p.origPrice}</span>}
                  </> : <span className="font-bold text-primary">价格面议</span>}
                </div>
                <span className="text-xs text-primary group-hover:underline">查看详情 →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── B端专区 ──
  if (page === 'b-zone') return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6 text-sm">
        <button onClick={() => setPage('home')} className="text-slate-500 hover:text-primary">AI智能商城</button>
        <span className="text-slate-300">/</span>
        <span className="text-bingo-dark font-medium">教培机构赋能专区</span>
      </div>
      <div className="card p-8 bg-gradient-to-r from-bingo-dark to-slate-800 text-white mb-8 rounded-2xl">
        <h2 className="text-2xl font-bold mb-2">B端 · 教培机构赋能专区</h2>
        <p className="text-slate-300 text-sm mb-4">课程+教具+赛事+认证+AI数字实验室+AI实训室，一站式对接 · 助力机构升级教学场景</p>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => setPage('checkout')} className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-cyan-600 transition">批量采购报价</button>
          <button onClick={() => setPage('checkout')} className="bg-white/15 text-white px-5 py-2.5 rounded-xl text-sm hover:bg-white/25 transition">联系采购顾问</button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5 mb-8">
        {[
          { icon: '💰', title: '机构专属权益', items: ['批量采购阶梯折扣', '课程体系定制（OEM合作）', '师训支持（线上/线下）', 'AI实验室/实训室专属折扣', '品牌授权背书'] },
          { icon: '🤝', title: '定制化服务', items: ['课程/教具定制开发', '品牌联名合作', 'AI实验室定制化建设', 'AI实训室一站式落地', '赛事资源独家对接'] },
          { icon: '📊', title: '数据化运营支持', items: ['机构采购订单实时查看', '产品使用数据分析', 'AI实验室/实训室落地进度追踪', '定制化数据报表下载', '学员学习率/使用频次分析'] },
          { icon: '📞', title: '专属服务体系', items: ['一对一专属采购顾问', '7×24小时机构服务热线', 'AI实验室/实训室专属商务顾问', '线下商务对接（大型采购）', '采购合同模板免费下载'] },
        ].map((s, i) => (
          <div key={i} className="card p-6 hover:shadow-md hover:border-primary/30 transition">
            <div className="text-2xl mb-3">{s.icon}</div>
            <h3 className="font-semibold text-bingo-dark mb-3">{s.title}</h3>
            <ul className="space-y-1.5">
              {s.items.map((item, j) => (
                <li key={j} className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="text-primary shrink-0">✓</span>{item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mb-8">
        <h3 className="font-bold text-bingo-dark mb-4">机构爆款产品</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { name: 'AI课程体系打包（机构版）', cat: 'courses', tag: '机构爆款' },
            { name: 'AI数字实验室 · 机构标准版', cat: 'lab', tag: '实验室专属价' },
            { name: 'AI实训室 · 机构标准版套装', cat: 'training-room', tag: '一站式落地' },
          ].map((p, i) => (
            <div key={i} className="card p-5 hover:shadow-md hover:border-primary/30 transition cursor-pointer group"
              onClick={() => { setActiveCat(p.cat); setPage('category') }}>
              <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">{p.tag}</span>
              <p className="font-semibold text-bingo-dark group-hover:text-primary transition mt-2 text-sm">{p.name}</p>
              <p className="text-xs text-primary mt-2 group-hover:underline">查看详情 →</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6 bg-slate-50">
        <h3 className="font-semibold text-bingo-dark mb-4">AI实验室/实训室落地案例</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { name: 'XX教育集团', type: 'AI数字实验室·机构标准版', result: '引入后3个月，学员AI素养测评合格率提升60%' },
            { name: 'XX外国语学校', type: 'AI实训室·校园定制版', result: '配套竞赛培训，当年获白名单赛事省级奖项12人次' },
            { name: 'XX培训学校', type: 'AI实训室·机构标准版套装', result: '机构升级后，续报率提升35%，新招生增长40%' },
          ].map((c, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-slate-100">
              <p className="font-semibold text-sm text-bingo-dark mb-1">{c.name}</p>
              <p className="text-xs text-primary mb-2">{c.type}</p>
              <p className="text-xs text-slate-600">{c.result}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // ── C端专区 ──
  if (page === 'c-zone') return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-6 text-sm">
        <button onClick={() => setPage('home')} className="text-slate-500 hover:text-primary">AI智能商城</button>
        <span className="text-slate-300">/</span>
        <span className="text-bingo-dark font-medium">家长采购专区</span>
      </div>
      <div className="card p-8 bg-gradient-to-r from-cyan-500 to-primary text-white mb-8 rounded-2xl">
        <h2 className="text-2xl font-bold mb-2">C端 · 家长/个人采购专区</h2>
        <p className="text-white/80 text-sm mb-4">为孩子AI学习全周期提供个性化、轻量化采购服务，涵盖课程·教具·AI实验室个人版</p>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => setPage('checkout')} className="bg-white text-primary font-medium px-6 py-2.5 rounded-xl text-sm hover:bg-white/90 transition">领取专属优惠券</button>
        </div>
      </div>

      {/* 分龄推荐 */}
      <div className="mb-8">
        <h3 className="font-bold text-bingo-dark mb-4">分龄精准推荐</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[['3-6岁启蒙', '🌱'], ['小学阶段', '📖'], ['初中阶段', '🔬'], ['高中阶段', '🏆'], ['科创进阶', '🚀']].map(([label, icon], i) => (
            <button key={i} className="card p-4 text-center hover:shadow-md hover:border-primary/30 hover:bg-primary/5 transition group">
              <div className="text-2xl mb-1">{icon}</div>
              <p className="text-xs font-medium text-slate-700 group-hover:text-primary">{label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 家长福利 */}
      <div className="mb-8">
        <h3 className="font-bold text-bingo-dark mb-4">家长专属福利</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: '🎫', title: '专属优惠券', desc: '新人满减券·AI实验室专属券，首次购买立享优惠' },
            { icon: '🏅', title: '积分体系', desc: '消费1元=1积分，积分可抵现、兑换课程/AI实验室体验时长' },
            { icon: '📢', title: '推广赚佣金', desc: '分享产品给好友，成功购买后赚取佣金，含AI实验室实训室产品' },
          ].map((s, i) => (
            <div key={i} className="card p-5 hover:shadow-md hover:border-primary/30 transition">
              <span className="text-2xl mb-2 block">{s.icon}</span>
              <h4 className="font-semibold text-bingo-dark text-sm mb-1">{s.title}</h4>
              <p className="text-xs text-slate-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 热门单品 */}
      <div className="mb-8">
        <h3 className="font-bold text-bingo-dark mb-4">家长采购 TOP 热门</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: 'AI素养启蒙课', price: '9.9元体验', tag: '爆款入门' },
            { name: '少儿AI编程教具套装', price: '¥368', tag: '配套课程' },
            { name: 'AI数字实验室·个人版', price: '¥299', tag: '免费体验' },
            { name: '小型AI实训套装', price: '¥4,980', tag: '科创进阶' },
          ].map((p, i) => (
            <div key={i} className="card p-5 hover:shadow-md hover:border-primary/30 transition cursor-pointer group">
              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">{p.tag}</span>
              <p className="font-semibold text-sm text-bingo-dark group-hover:text-primary transition mt-2 mb-1 line-clamp-2">{p.name}</p>
              <p className="text-primary font-bold">{p.price}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 学分兑换 */}
      <section>
        <h3 className="font-bold text-bingo-dark mb-4">🏅 学分兑换专区</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {[
            { name: '学习工具月卡', cost: '300学分', tag: '纯学分', popular: true },
            { name: '课程优惠券 ¥50', cost: '500学分', tag: '纯学分', popular: false },
            { name: 'AI实验室体验时长 30天', cost: '800学分', tag: '实验室专属', popular: true },
            { name: 'AI教具体验装', cost: '1000学分+¥99', tag: '学分+现金', popular: false },
            { name: '赛事报名9折券', cost: '300学分', tag: '纯学分', popular: false },
            { name: '认证服务5折', cost: '1000学分', tag: '限量', popular: false },
          ].map((item, i) => (
            <div key={i} className={'card p-5 hover:shadow-md hover:border-primary/30 transition ' + (item.popular ? 'border-primary/30' : '')}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-sm text-bingo-dark">{item.name}</h4>
                <span className={'text-[10px] px-2 py-0.5 rounded-full shrink-0 ml-1 ' + (item.tag === '纯学分' ? 'bg-primary/10 text-primary' : item.tag === '限量' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700')}>{item.tag}</span>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-primary font-bold text-sm">{item.cost}</span>
                <button type="button" className="text-xs px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-cyan-600">兑换</button>
              </div>
            </div>
          ))}
        </div>
        <div className="card p-4 bg-amber-50 border-amber-200/50 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-700">购买任意商品可获赠对应学分（消费1元=1积分），好评后额外 +10分</p>
          <Link to="/profile#score-bank" className="text-sm text-primary font-medium hover:underline">查看我的学分 →</Link>
        </div>
      </section>
    </div>
  )

  // ── 一级首页 ──
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 头部 */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-bingo-dark">AI工具资源库</h1>
          <p className="text-xs text-slate-500 mt-0.5">青少年专属AI工具合集｜AI学习资料/教材/教具精选｜竞赛备赛题库与工具包，一站式获取AI学习必备资源</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="搜索课程/教具/赛事/AI实验室..."
              className="border border-slate-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-primary w-56 sm:w-72" />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</button>
          </div>
          <button onClick={() => setPage('checkout')} className="hidden sm:block text-xs border border-slate-200 rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-50">🛒 购物车</button>
        </div>
      </div>

      {/* Banner */}
      <section className="mb-8">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-bingo-dark via-slate-800 to-cyan-900 text-white p-8 sm:p-10">
          <div className="relative z-10">
            <p className="text-xs text-cyan-300 mb-2">AI工具资源库</p>
            <h2 className="text-3xl font-bold mb-2">青少年专属AI工具合集 · 一站式获取AI学习必备资源</h2>
            <p className="text-slate-300 text-sm mb-4">AI学习资料/教材/教具精选 · 竞赛备赛题库与工具包 · AI数字实验室 · 赛事服务</p>
            <div className="flex flex-wrap gap-3">
              <Link to="/courses?deal=9.9" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition">免费领取</Link>
              <button onClick={() => { setActiveCat('courses'); setPage('category') }} className="bg-primary hover:bg-cyan-500 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition">进入商城选购</button>
            </div>
          </div>
          <div className="absolute right-6 bottom-4 text-9xl opacity-10 select-none">🎓</div>
        </div>
      </section>

      {/* 核心价值 */}
      <section className="mb-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[['✅', '正品保障', '官方直营'], ['📚', '体系化课程', '全龄段覆盖'], ['🏆', '赛事直通', '白名单认证'], ['🧪', '实验室落地', '一站式服务'], ['🤝', '机构赋能', '专属采购顾问']].map(([icon, title, desc], i) => (
            <div key={i} className="card p-4 text-center hover:shadow-md hover:border-primary/30 transition">
              <div className="text-xl mb-1">{icon}</div>
              <p className="font-semibold text-xs text-bingo-dark">{title}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* B/C端分流 */}
      <section className="mb-8">
        <div className="grid md:grid-cols-2 gap-5">
          <div className="card p-6 bg-gradient-to-br from-cyan-50 to-sky-50 border-primary/20 hover:shadow-md transition cursor-pointer" onClick={() => setPage('c-zone')}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-bingo-dark text-lg">C端 · 家长/个人采购</h3>
                <p className="text-sm text-slate-600 mt-1">个性化推荐 · 积分抵现 · 分享赚佣金 · AI实验室个人版</p>
              </div>
              <span className="text-3xl">👨‍👩‍👧</span>
            </div>
            <div className="text-xs text-slate-500 space-y-1 mb-4">
              <p>✓ 个性化AI课程推荐</p>
              <p>✓ 积分抵现+优惠券叠加</p>
              <p>✓ AI数字实验室个人体验版入口</p>
            </div>
            <button className="btn-primary text-sm px-5 py-2">进入家长采购专区 →</button>
          </div>
          <div className="card p-6 bg-gradient-to-br from-slate-800 to-bingo-dark text-white hover:shadow-md transition cursor-pointer" onClick={() => setPage('b-zone')}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-white text-lg">B端 · 教培机构赋能</h3>
                <p className="text-sm text-white/70 mt-1">定制化采购 · 师训支持 · 赛事资源 · AI实训室落地</p>
              </div>
              <span className="text-3xl">🏫</span>
            </div>
            <div className="text-xs text-white/60 space-y-1 mb-4">
              <p>✓ 批量采购阶梯折扣</p>
              <p>✓ AI实验室/实训室专属折扣与落地指导</p>
              <p>✓ 一对一专属采购顾问</p>
            </div>
            <button className="bg-primary text-white text-sm px-5 py-2 rounded-xl hover:bg-cyan-600 transition">进入机构赋能专区 →</button>
          </div>
        </div>
      </section>

      {/* 六大品类 */}
      <section className="mb-8">
        <h2 className="section-title mb-4">六大核心品类</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => { setActiveCat(cat.id); setPage('category') }}
              className={'card p-4 flex flex-col items-center text-center hover:shadow-md transition group relative ' + (cat.hot ? 'border-amber-300/50 bg-amber-50/30 hover:border-amber-400' : 'hover:border-primary/30 hover:bg-primary/5')}>
              {cat.hot && <span className="absolute -top-1.5 -right-1.5 text-[8px] bg-amber-500 text-white px-1.5 py-0.5 rounded-full font-bold">HOT</span>}
              <span className="text-3xl mb-2">{cat.icon}</span>
              <p className="text-xs font-semibold text-bingo-dark group-hover:text-primary leading-tight mb-1">{cat.label}</p>
              <span className={'text-[9px] px-1.5 py-0.5 rounded-full ' + cat.tagColor}>{cat.tag}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 营销活动 */}
      <section className="mb-8">
        <h2 className="section-title mb-4">营销活动专区</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: '限时秒杀', desc: '9.9元家长必读课', color: 'bg-rose-50 border-rose-200/60', text: 'text-rose-600' },
            { label: '拼团优惠', desc: '3人成团教具套装享7折', color: 'bg-amber-50 border-amber-200/60', text: 'text-amber-600' },
            { label: '机构团购', desc: 'AI实验室实训室团购专项折扣', color: 'bg-violet-50 border-violet-200/60', text: 'text-violet-600' },
            { label: '推广赚佣金', desc: '分享商品赚8-15%佣金', color: 'bg-emerald-50 border-emerald-200/60', text: 'text-emerald-600' },
          ].map((act, i) => (
            <div key={i} className={'card p-5 hover:shadow-md transition cursor-pointer border ' + act.color}>
              <p className={'font-bold text-sm mb-1 ' + act.text}>{act.label}</p>
              <p className="text-xs text-slate-600">{act.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 品牌背书 */}
      <section className="mb-8">
        <h2 className="section-title mb-4">品牌背书</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: '🏆', title: '赛事合作方', desc: '白名单赛事·国际赛合作官方背书' },
            { icon: '🎓', title: '教育资质', desc: '教育部资质认证·品牌授权证书' },
            { icon: '🧪', title: '实验室资质', desc: 'AI实验室/实训室研发资质·落地案例' },
            { icon: '📈', title: '学员成果', desc: '120+竞赛获奖·35+名校升学案例' },
          ].map((b, i) => (
            <div key={i} className="card p-5 hover:shadow-md hover:border-primary/30 transition">
              <span className="text-2xl mb-2 block">{b.icon}</span>
              <p className="font-semibold text-sm text-bingo-dark mb-1">{b.title}</p>
              <p className="text-xs text-slate-500">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 底部 */}
      <section className="card p-6 bg-slate-50 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-bingo-dark">缤果AI智能商城</p>
          <p className="text-xs text-slate-500 mt-1">客服热线：400-XXX-XXXX · 微信：bingoacademy · 邮箱：mall@bingoacademy.cn</p>
          <p className="text-xs text-slate-400 mt-1">退款规则 · 售后保障 · 隐私政策 · AI实验室/实训室安装调试售后</p>
        </div>
        <button onClick={() => setPage('checkout')} className="btn-primary text-sm px-6 py-2.5">预约服务 →</button>
      </section>
    </div>
  )
}
