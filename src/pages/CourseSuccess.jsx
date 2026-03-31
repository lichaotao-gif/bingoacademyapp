import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { addPurchasedCourseId } from '../utils/purchasedCoursesStorage'

export default function CourseSuccess() {
  const { state } = useLocation()
  const course = state?.courseName || 'AI启蒙通识课'
  const isGroup = Boolean(state?.groupBuy)
  const groupInviteLink = state?.groupInviteLink || ''
  const groupTarget = state?.groupTargetSize ?? 3

  useEffect(() => {
    const courseId = state?.courseId
    if (courseId) addPurchasedCourseId(courseId)
  }, [state?.courseId])

  const copyGroupLink = async () => {
    if (!groupInviteLink) return
    try {
      await navigator.clipboard.writeText(groupInviteLink)
      window.alert('邀请链接已复制')
    } catch {
      window.prompt('请复制以下链接邀请好友参团：', groupInviteLink)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center">
      <div className="text-6xl mb-4">✅</div>
      <h1 className="text-2xl font-bold text-bingo-dark mb-2">支付成功</h1>
      <p className="text-slate-600 mb-2">课程已解锁 · {course}</p>
      <p className="text-sm text-slate-500 mb-8">课程链接、学习资料已发送至您的手机 · 开课前将推送提醒</p>

      {isGroup && (
        <div className="card p-5 text-left mb-8 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50/80">
          <p className="font-semibold text-orange-900 flex items-center gap-2">
            <span>👥</span> 拼团进行中 · 邀请好友一起付
          </p>
          <p className="text-sm text-orange-800/95 mt-2 leading-relaxed">
            请在活动时间内邀请好友通过下方链接参团，满 <strong>{groupTarget}</strong> 人付清后即享受拼团价（演示环境无真实成团回调）。
          </p>
          {groupInviteLink && (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-medium text-slate-600">拼团邀请链接</p>
              <p className="text-xs font-mono text-slate-700 break-all bg-white/80 border border-orange-100 rounded-xl p-3">{groupInviteLink}</p>
              <button
                type="button"
                onClick={copyGroupLink}
                className="w-full sm:w-auto rounded-xl bg-orange-500 text-white text-sm font-semibold px-4 py-2.5 hover:bg-orange-600"
              >
                复制链接发给好友
              </button>
            </div>
          )}
        </div>
      )}

      <div className="space-y-3 mb-8">
        <Link to="/profile/study" className="block w-full btn-primary py-3 font-bold">立即进入课堂</Link>
        {!isGroup && (
          <>
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
          </>
        )}
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
