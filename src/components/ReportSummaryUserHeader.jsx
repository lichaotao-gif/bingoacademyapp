import { getSessionUser, sessionUserDisplayAvatarUrl } from '../utils/sessionUser'

/**
 * AI 测评 / 结业考评报告页顶部：头像在上、昵称在下（深色渐变顶栏内）
 */
export default function ReportSummaryUserHeader() {
  const user = getSessionUser()
  return (
    <div className="mb-5 flex flex-col items-center gap-2">
      <img
        src={sessionUserDisplayAvatarUrl(user)}
        alt=""
        className="h-14 w-14 shrink-0 rounded-full border-2 border-white/35 bg-white/10 object-cover shadow-md"
        width={56}
        height={56}
        decoding="async"
      />
      <p className="max-w-[280px] truncate text-center text-base font-bold leading-tight text-white">{user.nickname}</p>
    </div>
  )
}
