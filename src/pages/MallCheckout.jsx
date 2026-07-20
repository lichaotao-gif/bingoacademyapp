import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

const PRODUCTS = {
  'kit-ai-starter': { name: 'AI启蒙传感学具套装', price: 680, image: '/mall/ai-sensor-kit.png' },
  'robot-microbit': { name: '人工智能 Micro:bit 编程学具', price: 298, image: '/mall/ai-coding-robot.png' },
  'sensor-ai-kit': { name: 'AI视觉与多模态传感器套装', price: 1280, image: '/mall/ai-vision-kit.png' },
  'robot-car': { name: '智能循迹小车创作套装', price: 498, image: '/mall/ai-coding-robot.png' },
  'jetson-nano-edu': { name: '边缘人工智能实验主机', price: 3299, image: '/mall/ai-vision-kit.png' },
  'drone-ai-lite': { name: 'AI视觉循迹无人机（教育版）', price: 1899, image: '/mall/ai-drone-kit.png' },
  'ai-xlab-pack': { name: 'AI机器学习实验耗材包', price: 458, image: '/mall/ai-sensor-kit.png' },
  'creative-board': { name: 'AI创意交互开发板套装', price: 398, image: '/mall/ai-coding-robot.png' },
}

const REGION_OPTIONS = {
  上海市: ['上海市'],
  北京市: ['北京市'],
  广东省: ['广州市', '深圳市', '佛山市', '东莞市'],
  浙江省: ['杭州市', '宁波市', '温州市'],
  江苏省: ['南京市', '苏州市', '无锡市'],
  四川省: ['成都市', '绵阳市'],
  湖北省: ['武汉市', '宜昌市'],
  湖南省: ['长沙市', '株洲市'],
}

export default function MallCheckout() {
  const { productId } = useParams()
  const navigate = useNavigate()
  const product = PRODUCTS[productId] || PRODUCTS['kit-ai-starter']
  const [form, setForm] = useState({ name: '', phone: '', province: '', city: '', address: '', note: '' })

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const submit = (event) => {
    event.preventDefault()
    navigate('/courses/payment', {
      state: {
        courseName: product.name,
        classType: { name: '实物教具', price: product.price },
        image: product.image,
        delivery: { ...form, region: `${form.province} ${form.city}`.trim() },
        checkoutPath: `/mall/checkout/${productId}`,
        orderKind: 'mall',
      },
    })
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <Link to={`/mall/${productId}`} className="mb-6 inline-block text-sm text-primary hover:underline">← 返回商品详情</Link>
      <h1 className="mb-6 text-xl font-bold text-bingo-dark">确认订单</h1>

      <section className="card mb-6 p-5">
        <div className="flex gap-4">
          <img src={product.image} alt={product.name} className="h-20 w-20 rounded-lg object-cover" />
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-bingo-dark">{product.name}</h2>
            <p className="mt-1 text-sm text-slate-500">实物教具 · 数量 1</p>
            <p className="mt-2 text-lg font-bold text-rose-500">¥{product.price}</p>
          </div>
        </div>
        <div className="mt-4 flex justify-between border-t border-slate-100 pt-4 text-sm"><span className="text-slate-500">配送方式</span><span className="text-slate-700">快递包邮</span></div>
        <div className="mt-2 flex justify-between font-bold"><span>实付金额</span><span className="text-primary">¥{product.price}</span></div>
      </section>

      <form onSubmit={submit} className="card space-y-4 p-6">
        <div className="flex items-center justify-between"><h2 className="font-semibold text-bingo-dark">收货地址</h2><span className="text-xs text-rose-500">请填写完整地址</span></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">收货人姓名 *<input required value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="请输入姓名" className="mt-1.5 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-normal outline-none focus:border-primary" /></label>
          <label className="text-sm font-medium text-slate-700">手机号码 *<input required type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="用于配送联系" className="mt-1.5 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-normal outline-none focus:border-primary" /></label>
        </div>
        <label className="block text-sm font-medium text-slate-700">所在地区 *<div className="mt-1.5 grid grid-cols-2 gap-3"><select required value={form.province} onChange={(e) => setForm((current) => ({ ...current, province: e.target.value, city: '' }))} className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-normal outline-none focus:border-primary"><option value="">选择省份</option>{Object.keys(REGION_OPTIONS).map((province) => <option key={province} value={province}>{province}</option>)}</select><select required disabled={!form.province} value={form.city} onChange={(e) => update('city', e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-normal outline-none disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 focus:border-primary"><option value="">选择城市</option>{(REGION_OPTIONS[form.province] || []).map((city) => <option key={city} value={city}>{city}</option>)}</select></div></label>
        <label className="block text-sm font-medium text-slate-700">详细地址 *<textarea required value={form.address} onChange={(e) => update('address', e.target.value)} placeholder="街道、门牌号、楼栋、单元、房间号等" rows="3" className="mt-1.5 w-full resize-none rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-normal outline-none focus:border-primary" /></label>
        <label className="block text-sm font-medium text-slate-700">订单备注（选填）<input value={form.note} onChange={(e) => update('note', e.target.value)} placeholder="如配送时间、课程班级等" className="mt-1.5 w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-normal outline-none focus:border-primary" /></label>
        <button type="submit" className="btn-primary w-full py-3 text-base font-bold">提交订单 · 去支付</button>
      </form>
    </main>
  )
}
