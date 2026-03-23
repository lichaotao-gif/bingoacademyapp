import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { addPurchasedCourseId } from '../utils/purchasedCoursesStorage'

export default function CourseSuccess() {
  const { state } = useLocation()
  const course = state?.courseName || 'AI启蒙通识课'

  useEffect(() => {
    const courseId = state?.courseId
    if (courseId) addPurchasedCourseId(courseId)
  }, [state?.courseId])

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center">
      <div className="text-6xl mb-4">✅</div>
      <h1 className="text-2xl font-bold text-bingo-dark mb-2">支付成功</h1>
      <p className="text-slate-600 mb-2">课程已解锁 · {course}</p>
      <p className="text-sm text-slate-500 mb-8">课程链接、学习资料已发送至您的手机 · 开课前将推送提醒</p>

      <div className="space-y-3 mb-8">
        <Link to="/profile/study" className="block w-full btn-primary py-3 font-bold">立即进入课堂</Link>
        <button type="button" className="block w-full border border-slate-200 rounded-xl py-3 text-slate-600 hover:bg-slate-50">
          下载学习资料包
        </button>
        <div className="card p-4 bg-slate-50 text-left flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-bingo-dark mb-2">班主任 / 助教</p>
            <div className="w-24 h-24 bg-slate-200 rounded flex items-center justify-center text-slate-400 text-xs">二维码</div>
            <p className="text-xs text-slate-500 mt-2">扫码添加企业微信，备注订单号</p>
          </div>
          <button type="button" className="text-sm border border-orange-500 text-orange-600 px-4 py-2 rounded-lg hover:bg-orange-50">分享赚佣金</button>
        </div>
      </div>

      <div className="card p-6 text-left">
        <h3 className="font-semibold text-bingo-dark mb-3">推荐课程</h3>
        <div className="space-y-3">
          {[
            { name: 'AI编程入门课', to: '/courses/detail/ai-programming' },
            { name: 'AI艺术创意工坊', to: '/courses/detail/ai-art' },
          ].map((c) => (
            <Link key={c.name} to={c.to} className="flex justify-between items-center p-3 rounded-lg hover:bg-slate-50 transition">
              <span className="text-sm font-medium">{c.name}</span>
              <span className="text-primary text-sm">立即加购 →</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
