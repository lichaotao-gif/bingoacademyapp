import { useState } from 'react'
import { downloadLeadAsset, getLeadAsset } from '../utils/leadCaptureAssets'
import { saveLeadSubmission } from '../utils/leadCaptureStorage'

/**
 * 留资弹窗：提交后展示「下载资料」；关闭后触发器可切换为下载按钮（需配合 useLeadSubmitted）。
 */
export default function LeadCaptureModal({ leadKey, title, onClose, orgField = false }) {
  const asset = getLeadAsset(leadKey)
  const storageKey = asset?.key || String(leadKey || '').trim()
  const isContactOnly = asset?.delivery === 'contact'
  const canDownload = !isContactOnly && Boolean(asset?.getContent)
  const displayTitle = title || asset?.title || '领取资料'
  const isGrowthPlan = storageKey === 'growth-plan'
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [phone, setPhone] = useState('')
  const [org, setOrg] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [err, setErr] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setErr('')
    const n = name.trim()
    const ageNumber = Number.parseInt(age, 10)
    const p = phone.replace(/\D/g, '')
    if (isGrowthPlan && (!Number.isInteger(ageNumber) || ageNumber < 6 || ageNumber > 18)) {
      setErr('请输入孩子的实际年龄（6–18岁）')
      return
    }
    if (!isGrowthPlan && !n) {
      setErr('请填写姓名或机构名称')
      return
    }
    if (p.length < 11) {
      setErr('请填写正确的 11 位手机号')
      return
    }
    if (!storageKey) {
      setErr('提交失败，请稍后重试')
      return
    }
    saveLeadSubmission(storageKey, {
      name: n,
      age: isGrowthPlan ? String(ageNumber) : '',
      phone: p,
      org: org.trim(),
    })
    setSubmitted(true)
  }

  const handleDownload = () => {
    if (!downloadLeadAsset(storageKey)) {
      window.alert('暂无法下载该资料，请联系商务顾问获取。')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {submitted ? (
          <div className="text-center py-2">
            <div className="text-4xl mb-3" aria-hidden>
              ✅
            </div>
            <h3 className="font-bold text-bingo-dark text-xl mb-2">提交成功</h3>
            {canDownload ? (
              <>
                <p className="text-slate-500 text-sm mb-5 leading-relaxed">
                  资料已为您解锁，可立即下载；商务顾问亦可能在 24 小时内与您联系确认需求。
                </p>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-sm transition"
                >
                  下载资料
                </button>
              </>
            ) : (
              <p className="text-slate-500 text-sm mb-5 leading-relaxed">
                {isContactOnly ? '信息已提交，客服会尽快联系您，为孩子提供专属分龄学习建议。' : '我们已收到您的信息，商务顾问将在 24 小时内与您联系。'}
              </p>
            )}
            <button type="button" onClick={onClose} className="mt-3 w-full text-slate-500 text-sm hover:text-slate-700">
              关闭
            </button>
          </div>
        ) : (
          <>
            <h3 className="font-bold text-bingo-dark text-xl mb-1">{displayTitle}</h3>
            <p className="text-slate-500 text-sm mb-5">{isContactOnly ? '请填写孩子年龄和家长手机号，提交后客服会尽快联系您' : '请留下联系方式，提交后即可下载对应资料'}</p>
            {err ? <p className="text-sm text-rose-600 mb-3">{err}</p> : null}
            <form onSubmit={handleSubmit} className="space-y-3">
              {isGrowthPlan ? (
                <input
                  required
                  type="number"
                  min="6"
                  max="18"
                  inputMode="numeric"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="请输入孩子年龄（6–18岁）"
                  aria-label="孩子年龄"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
                />
              ) : (
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={orgField ? '您的姓名' : '孩子姓名（或机构名称）'}
                  aria-label={orgField ? '姓名' : '孩子姓名或机构名称'}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
                />
              )}
              <input
                required
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={isGrowthPlan ? '请输入家长手机号（11位）' : orgField ? '负责人手机号' : '家长 / 负责人手机号'}
                aria-label={isGrowthPlan ? '家长手机号' : orgField ? '负责人手机号' : '家长或负责人手机号'}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
              />
              {orgField ? (
                <input
                  type="text"
                  value={org}
                  onChange={(e) => setOrg(e.target.value)}
                  placeholder="机构名称（选填）"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
                />
              ) : null}
              <button
                type="submit"
                className="w-full bg-sky-600 hover:bg-sky-700 text-white py-3 rounded-xl font-bold text-sm transition"
              >
                立即提交
              </button>
            </form>
            <button type="button" onClick={onClose} className="mt-3 w-full text-slate-400 text-sm hover:text-slate-600">
              取消
            </button>
          </>
        )}
      </div>
    </div>
  )
}
